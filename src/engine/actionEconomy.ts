import type { CareerProgressionPolicy, GameAction, GameState, TransitionResult, WorkProgress } from '../state/types';
import { getInitializedScribal } from '../state/scribalState';
import type { ConditionId, EventId, InstitutionId, WorkId } from '../state/ids';
import { UR_GIR_PERSON_ID } from '../state/ids';
import { transitionCareerAction } from './careerProgression';
import { transitionWorldAction } from './worldSocial';
import { settleAssignmentOffers, transitionOpportunityAction } from './opportunities';
import { transitionAssignmentActivityAction } from './assignmentActivity';
import { validateWorkDefinition } from '../works/workDefinition';
import { evaluateCharacterPredicate } from '../works/evidenceInterpretation';
import { transitionCharacterContinuity } from './characterContinuity';
import { advanceInstitutionalMatters } from './institutionalMatters';
import { advanceInstitutionalResponses } from './institutionalResponseLifecycle';
import { generateDailyAssignments } from './assignmentGenerator';
import { runChallengeDirector } from './challengeDirector';
import { buildSituatedMorningReport } from './morningReport';
import type { WorkAssessment, WorkDefinition } from '../works/workDefinition';

function feedback(kind: 'success' | 'error' | 'info', code: string, message: string) {
  return { kind, code, message } as const;
}

function withNotice(state: GameState, category: 'settlement', message: string): GameState {
  const notice = {
    id: `notice-${state.calendar.dayNumber - 1}-${state.journal.notices.length + 1}`,
    dayNumber: state.calendar.dayNumber - 1,
    category,
    message,
    read: false,
  };
  return { ...state, journal: { ...state.journal, notices: [...state.journal.notices, notice] } };
}

function isValidWorkDefinition(definition: WorkDefinition<any> | undefined): definition is WorkDefinition<any> {
  return !!definition && (definition.kind === 'work' || definition.kind === 'tutorial')
    && validateWorkDefinition(definition).length === 0;
}

function closeContributionSegments(segments: GameState['works']['contributionSegments'] = [], workId: WorkId, personId: string, dayNumber: number, reason: 'death' | 'handoff' | 'completed' | 'abandoned') {
  return segments.map((segment) => segment.workId === workId && segment.personId === personId && segment.status === 'open'
    ? { ...segment, status: 'closed' as const, endedDay: dayNumber, closureReason: reason } : segment);
}

function progressMatchesDefinition(definition: WorkDefinition<any>, progress: WorkProgress | undefined): boolean {
  return !!progress && progress.status !== 'suspended'
    && progress.definitionCompatibilityKey === definition.progressCompatibilityKey
    && definition.validateScenarioData(progress.scenarioData)
    && progress.acquiredEvidence.every((id) => definition.evidence.some((item) => item.id === id))
    && progress.completedActionIds.every((id) => definition.actions.some((item) => item.id === id));
}

function handoffPreservedWork(state: GameState, workId: WorkId, workCatalog: Readonly<Record<string, WorkDefinition<any>>>, acceptingInvitation = false): TransitionResult {
  const person = state.world.people[state.player.currentCharacterId];
  const preserved = (state.works.preservedUndertakings ?? []).find((item) => item.workId === workId && item.status === 'waiting');
  const definition = workCatalog[workId];
  const progress = state.works.progress[workId];
  const institutionId = preserved?.institutionId;
  const scribal = getInitializedScribal(person);
  if (!person || !scribal || !preserved || preserved.successorCharacterId !== person.id
    || !institutionId || !state.world.institutions[institutionId]
    || !definition || definition.kind !== 'work' || !isValidWorkDefinition(definition)
    || !progress || progress.status !== 'active' || state.works.activeWorkId !== null
    || (preserved.invitation && !acceptingInvitation)
    || (preserved.invitationResponse === 'declined')
    || (acceptingInvitation && (!preserved.invitation || preserved.invitationResponse !== undefined))) {
    return { state, feedback: feedback('error', 'preserved-work-handoff-invalid', 'This preserved undertaking cannot be taken up until its Work, institutional custody, saved progress, and required invitation response are valid.') };
  }
  const eventId = `event-work-handoff-${state.calendar.dayNumber}-${String(workId)}-${String(person.id)}` as EventId;
  if (state.world.events[eventId]) return { state, feedback: feedback('error', 'preserved-work-handoff-recorded', 'This explicit handoff has already been recorded.') };
  const institution = state.world.institutions[institutionId];
  const handoff = { workId, institutionId, formerCharacterId: preserved.deceasedCharacterId,
    successorCharacterId: person.id, dayNumber: state.calendar.dayNumber, eventId };
  const event = { id: eventId, dayNumber: state.calendar.dayNumber,
    summary: `${institution.name} explicitly entrusted ${definition.title} to ${person.name} after the successor chose to take up the preserved undertaking. Earlier contribution remains attributed to ${state.world.people[preserved.deceasedCharacterId]?.name ?? 'the former contributor'}.`,
    personIds: [preserved.deceasedCharacterId, person.id], institutionIds: [institutionId] };
  const preservedUndertakings = (state.works.preservedUndertakings ?? []).map((item) => item.workId === workId
    ? { ...item, status: 'taken_up' as const, takenUpDay: state.calendar.dayNumber,
        ...(item.invitation ? { invitationResponse: 'accepted' as const } : {}) } : item);
  const contributionSegments = closeContributionSegments(state.works.contributionSegments, workId, preserved.deceasedCharacterId, state.calendar.dayNumber, 'handoff');
  contributionSegments.push({ id: `work-contribution-${String(workId)}-${String(person.id)}-${state.calendar.dayNumber}-${contributionSegments.length + 1}`,
    workId, personId: person.id, startedDay: state.calendar.dayNumber, status: 'open' });
  return { state: { ...state, works: { ...state.works, activeWorkId: workId, preservedUndertakings,
      contributionSegments, handoffHistory: [...(state.works.handoffHistory ?? []), handoff] },
      world: { ...state.world, events: { ...state.world.events, [eventId]: event } } },
    feedback: feedback('success', 'preserved-work-taken-up', `${definition.title} is now an explicit undertaking of ${person.name}.`) };
}

function displayDate(dayNumber: number): string {
  return `Day ${dayNumber} · Uruk (c. 3200 BCE)`;
}

/** Pure, deterministic state transition. UI feedback is ephemeral; notices are saved in GameState. */
export function transitionGame(state: GameState, action: GameAction, careerPolicy?: CareerProgressionPolicy, workCatalog: Readonly<Record<string, WorkDefinition<any>>> = {}): TransitionResult {
  const economy = state.actionEconomy;
  const pendingAssignmentReceipt = Object.values(state.opportunities.assignments).some((offer) => offer.closingReceipt && !offer.receiptAcknowledged);
  const pendingChallengeReceipt = state.opportunities.challengeOutcomes.some((outcome) => outcome.closingReceipt && !outcome.receiptAcknowledged);
  const receiptAcknowledgement = action.type === 'ACKNOWLEDGE_ASSIGNMENT_RECEIPT' || action.type === 'ACKNOWLEDGE_CHALLENGE_RECEIPT';
  if ((pendingAssignmentReceipt || pendingChallengeReceipt) && !receiptAcknowledgement) {
    return { state, feedback: feedback('error', 'closing-receipt-pending', 'Review and explicitly return from the Closing Receipt before taking another action.') };
  }
  if (state.pendingSuccession && action.type !== 'SELECT_SUCCESSOR' && !receiptAcknowledgement) {
    return { state, feedback: feedback('error', 'succession-pending', 'Ordinary actions are paused until the pending character transition is resolved.') };
  }
  if (action.type === 'BEGIN_CHARACTER_DEPARTURE' || action.type === 'SELECT_SUCCESSOR') {
    return transitionCharacterContinuity(state, action, workCatalog);
  }
  const person = state.world.people[state.player.currentCharacterId];
  const scribal = getInitializedScribal(person);
  if (!person || !scribal) return { state, feedback: feedback('error', 'missing-active-character', 'The current character is unavailable.') };
  const interludeAction = action.type === 'BUY_PROVISIONS' || action.type === 'BEGIN_WORKDAY'
    || action.type === 'ACKNOWLEDGE_ASSIGNMENT_RECEIPT' || action.type === 'ACKNOWLEDGE_CHALLENGE_RECEIPT';
  if (state.dayClose.phase === 'interlude_open' && !interludeAction) {
    return { state, feedback: feedback('error', 'evening-interlude-open', 'The Workday is closed. Only an eligible provisions exchange or Begin Workday is available.') };
  }
  if (state.dayClose.phase === 'workday_open' && action.type === 'BUY_PROVISIONS') {
    return { state, feedback: feedback('error', 'evening-interlude-not-open', 'The Evening Interlude is not open.') };
  }

  switch (action.type) {
    case 'TAKE_UP_PRESERVED_WORK':
      return handoffPreservedWork(state, action.workId, workCatalog);
    case 'RESPOND_PRESERVED_WORK_INVITATION': {
      const preserved = (state.works.preservedUndertakings ?? []).find((item) => item.workId === action.workId && item.status === 'waiting');
      const definition = workCatalog[action.workId];
      const invitation = definition?.successionInvitation;
      const person = state.world.people[state.player.currentCharacterId];
      const scribal = getInitializedScribal(person);
      const institutionId = preserved?.institutionId;
      const institution = institutionId ? state.world.institutions[institutionId] : undefined;
      if (!preserved || !preserved.invitation || !definition || definition.kind !== 'work' || !isValidWorkDefinition(definition)
        || !invitation || !person || !scribal || preserved.successorCharacterId !== person.id
        || preserved.invitationResponse !== undefined || !institution || !institutionId
        || !invitation.connectionTiers.includes(preserved.invitation.connectionTier)) {
        return { state, feedback: feedback('error', 'work-succession-invitation-unavailable', 'There is no valid pending institutional invitation for this character.') };
      }
      if (action.response === 'decline') {
        const preservedUndertakings = (state.works.preservedUndertakings ?? []).map((item) => item.workId === action.workId
          ? { ...item, invitationResponse: 'declined' as const } : item);
        const notice = { id: `notice-work-invitation-declined-${String(action.workId)}-${state.calendar.dayNumber}`,
          dayNumber: state.calendar.dayNumber, category: 'work' as const,
          message: `${person.name} declined ${institution.name}'s invitation to take up ${definition.title}. The undertaking and its progress remain preserved; no handoff occurred.`, read: false };
        return { state: { ...state, works: { ...state.works, preservedUndertakings },
          journal: { ...state.journal, notices: [...state.journal.notices, notice] } },
          feedback: feedback('success', 'work-succession-invitation-declined', 'The invitation was declined. The undertaking and its progress remain preserved.') };
      }
      const appointments = Object.values(state.world.appointments).filter((appointment) =>
        appointment.personId === person.id && appointment.institutionId === institutionId
          && appointment.startDay <= state.calendar.dayNumber
          && (appointment.endDay === undefined || appointment.endDay >= state.calendar.dayNumber));
      const hasAccess = person.affiliations.includes(institutionId) || appointments.length > 0;
      const hasAuthority = institution.authority.includes(invitation.authorityScope)
        || appointments.some((appointment) => appointment.authorityScope.includes(invitation.authorityScope));
      const stillQualified = evaluateCharacterPredicate(invitation.qualification, scribal);
      if (!hasAccess || !hasAuthority || !stillQualified) {
        return { state, feedback: feedback('error', 'work-succession-invitation-requirements-changed', 'The successor no longer meets the documented qualification, access, or authority basis. The invitation remains pending and no handoff occurred.') };
      }
      return handoffPreservedWork(state, action.workId, workCatalog, true);
    }
    case 'AWARD_SKILL_XP':
    case 'AWARD_CAREER_XP':
    case 'PURCHASE_SKILL_LEVEL':
    case 'SET_PRIMARY_SPECIALIZATION':
      return transitionCareerAction(state, action, careerPolicy);
    case 'PRESENT_ASSIGNMENT':
    case 'ACCEPT_ASSIGNMENT':
    case 'DECLINE_ASSIGNMENT':
    case 'CANCEL_ASSIGNMENT':
    case 'COMPLETE_ASSIGNMENT':
    case 'PERFORM_ASSIGNMENT_ACTIVITY_ACTION':
    case 'UPDATE_ASSIGNMENT_ACTIVITY_DRAFT':
    case 'SUBMIT_ASSIGNMENT_ACTIVITY':
    case 'PRESENT_CHALLENGE':
    case 'ACCEPT_CHALLENGE':
    case 'DECLINE_CHALLENGE':
    case 'RESOLVE_CHALLENGE':
    case 'ACKNOWLEDGE_ASSIGNMENT_RECEIPT':
    case 'ACKNOWLEDGE_CHALLENGE_RECEIPT':
      if (action.type === 'PERFORM_ASSIGNMENT_ACTIVITY_ACTION' || action.type === 'UPDATE_ASSIGNMENT_ACTIVITY_DRAFT' || action.type === 'SUBMIT_ASSIGNMENT_ACTIVITY') return transitionAssignmentActivityAction(state, action);
      return transitionOpportunityAction(state, action);
    case 'SET_INSTITUTIONAL_STANDING':
    case 'SET_RELATIONSHIP':
    case 'CREATE_INSTITUTION':
    case 'CREATE_APPOINTMENT':
    case 'END_APPOINTMENT':
    case 'CREATE_EVENT':
    case 'CREATE_RECORD':
    case 'AMEND_RECORD':
    case 'GRANT_KNOWLEDGE':
    case 'ASSESS_KNOWLEDGE':
    case 'RECORD_RELATIONSHIP_FAMILIARITY_EPISODE':
      return transitionWorldAction(state, action);
    case 'START_WORK': {
      const definition = workCatalog[action.workId];
      if (!definition) return { state, feedback: feedback('error', 'unknown-work', 'This Work is not registered in the active content catalog.') };
      if (!isValidWorkDefinition(definition)) return { state, feedback: feedback('error', 'invalid-work-definition', 'This Work is unavailable because its classification or content definition is invalid.') };
      let baseState = state;
      const activeId = state.works.activeWorkId;
      if (activeId !== null) {
        const activeProgress = state.works.progress[activeId];
        const activeDefinition = workCatalog[activeId];
        if (activeProgress && isValidWorkDefinition(activeDefinition) && progressMatchesDefinition(activeDefinition, activeProgress)) {
          return { state, feedback: feedback('error', 'work-already-active', 'Another Work is already active.') };
        }
        const progress = { ...state.works.progress };
        if (activeProgress && activeProgress.status !== 'suspended') {
          progress[activeId] = { ...activeProgress, status: 'suspended', suspendedFromStatus: activeProgress.status };
        }
        baseState = { ...state, works: { ...state.works, activeWorkId: null, progress } };
      }
      const priorProgress = baseState.works.progress[action.workId];
      if (priorProgress?.status === 'suspended') return { state: baseState, feedback: feedback('error', 'work-content-unavailable', 'This saved activity is preserved but unavailable. Its progress cannot be replaced; you may continue with another valid Work.') };
      if (baseState.historicalProgression.completedWorks.includes(action.workId) || priorProgress?.status === 'completed') return { state: baseState, feedback: feedback('error', 'work-already-completed', 'This activity has already been completed.') };
      if (priorProgress && priorProgress.status !== 'abandoned') return { state: baseState, feedback: feedback('error', 'work-progress-exists', 'Existing progress for this activity cannot be overwritten.') };
      const scenarioData = definition.createInitialProgress();
      if (!definition.validateScenarioData(scenarioData)) return { state, feedback: feedback('error', 'invalid-work-initial-state', 'The Work supplied invalid initial progress data.') };
      const progress = {
        status: 'active' as const, definitionCompatibilityKey: definition.progressCompatibilityKey,
        acquiredEvidence: [...definition.startingEvidence], examinedEvidence: [],
        workApSpentToday: 0, rewardGranted: false, completedActionIds: [],
        provisionContract: definition.kind === 'work' ? definition.provisionsContract : undefined, scenarioData, submissionCount: 0,
      };
      let startedState = baseState;
      let initialMatters;
      try { initialMatters = definition.createInitialMatters?.({ personId: person.id, dayNumber: state.calendar.dayNumber }) ?? []; }
      catch { return { state, feedback: feedback('error', 'work-initial-matter-error', 'The Work could not establish its institutional matter; no progress was started.') }; }
      for (const matter of initialMatters) {
        const institution = startedState.world.institutions[matter.institutionId];
        const existing = startedState.world.matters[matter.id];
        if (!institution || (existing && existing.status !== 'active') || !matter.summary.trim()
          || matter.createdDay !== state.calendar.dayNumber
          || (matter.locationId && !startedState.world.locations[matter.locationId])
          || (matter.involvedPersonIds ?? []).some((id) => !startedState.world.people[id])) {
          return { state, feedback: feedback('error', 'work-initial-matter-invalid', 'The Work returned an invalid institutional matter; no progress was started.') };
        }
        if (!existing) {
          startedState = { ...startedState, world: { ...startedState.world,
            matters: { ...startedState.world.matters, [matter.id]: matter } } };
        }
        const currentInstitution = startedState.world.institutions[matter.institutionId];
        if (!currentInstitution.activeMatters.includes(matter.id)) {
          startedState = { ...startedState, world: { ...startedState.world, institutions: {
            ...startedState.world.institutions,
            [matter.institutionId]: { ...currentInstitution, activeMatters: [...currentInstitution.activeMatters, matter.id] },
          } } };
        }
      }
      const contributionSegments = definition.kind === 'work'
        ? [...(startedState.works.contributionSegments ?? []), { id: `work-contribution-${String(action.workId)}-${String(person.id)}-${state.calendar.dayNumber}-${(startedState.works.contributionSegments ?? []).length + 1}`,
            workId: action.workId, personId: person.id, startedDay: state.calendar.dayNumber, status: 'open' as const }]
        : startedState.works.contributionSegments ?? [];
      return { state: { ...startedState, works: { ...startedState.works, activeWorkId: action.workId, contributionSegments, progress: { ...startedState.works.progress, [action.workId]: progress } } },
        feedback: feedback('success', 'work-started', definition.title) };
    }
    case 'ACQUIRE_WORK_EVIDENCE':
    case 'COMPLETE_WORK_ACTION': {
      const definition = isValidWorkDefinition(workCatalog[action.workId]) ? workCatalog[action.workId] : undefined;
      const progress = state.works.progress[action.workId];
      const actionDefinition = definition?.actions.find((item) => item.id === action.actionId);
      if (!definition || !progress || !progressMatchesDefinition(definition, progress) || state.works.activeWorkId !== action.workId || progress.status !== 'active' || !actionDefinition) {
        return { state, feedback: feedback('error', 'invalid-work-evidence-action', 'The evidence action is unavailable for the active Work.') };
      }
      if (progress.completedActionIds.includes(action.actionId)) return { state, feedback: feedback('info', 'work-action-already-completed', 'This evidence action has already been completed.') };
      if ((actionDefinition.prerequisites ?? []).some((id) => !progress.completedActionIds.includes(id))) {
        return { state, feedback: feedback('error', 'work-action-prerequisite', 'A required earlier Work action has not been completed.') };
      }
      if (!Number.isInteger(actionDefinition.apCost) || actionDefinition.apCost < 0 || actionDefinition.apCost > economy.apRemaining) {
        return { state, feedback: feedback('error', 'insufficient-ap', 'There is not enough AP remaining for this evidence action.') };
      }
      const grants = actionDefinition.grantsEvidence ?? [];
      const submittedScenarioData = 'scenarioData' in action ? action.scenarioData : undefined;
      if (submittedScenarioData !== undefined && !definition.validateScenarioData(submittedScenarioData)) {
        return { state, feedback: feedback('error', 'invalid-work-progress', 'The Work action supplied invalid scenario progress.') };
      }
      if (grants.some((id) => !definition.evidence.some((item) => item.id === id))) {
        return { state, feedback: feedback('error', 'invalid-work-evidence-grant', 'The Work action references evidence that is not defined.') };
      }
      const acquired = [...new Set([...progress.acquiredEvidence, ...grants])];
      const examined = actionDefinition.autoExamine ? [...new Set([...progress.examinedEvidence, ...grants])] : progress.examinedEvidence;
      const nextProgress = { ...progress, ...(submittedScenarioData === undefined ? {} : { scenarioData: submittedScenarioData }), lastAssessment: undefined, pendingDisposition: false, acquiredEvidence: acquired, examinedEvidence: examined,
        completedActionIds: [...progress.completedActionIds, action.actionId],
        workApSpentToday: progress.workApSpentToday + actionDefinition.apCost };
      return { state: { ...state, actionEconomy: { ...economy, apRemaining: economy.apRemaining - actionDefinition.apCost },
        works: { ...state.works, progress: { ...state.works.progress, [action.workId]: nextProgress } } },
        feedback: feedback('success', 'work-evidence-acquired', actionDefinition.successMessage ?? (action.type === 'ACQUIRE_WORK_EVIDENCE' ? 'The requested evidence has been added to your packet.' : 'The Work action has been completed.')) };
    }
    case 'EXAMINE_WORK_EVIDENCE': {
      const definition = isValidWorkDefinition(workCatalog[action.workId]) ? workCatalog[action.workId] : undefined;
      const progress = state.works.progress[action.workId];
      if (!definition || !definition.evidence.some((item) => item.id === action.evidenceId) || !progress || !progressMatchesDefinition(definition, progress) || state.works.activeWorkId !== action.workId || progress.status !== 'active' || !progress.acquiredEvidence.includes(action.evidenceId)) return { state, feedback: feedback('error', 'evidence-not-acquired', 'Acquire this evidence before examining it.') };
      if (progress.examinedEvidence.includes(action.evidenceId)) return { state, feedback: feedback('info', 'evidence-already-examined', 'Re-examining acquired evidence costs no AP.') };
      return { state: { ...state, works: { ...state.works, progress: { ...state.works.progress,
        [action.workId]: { ...progress, examinedEvidence: [...progress.examinedEvidence, action.evidenceId], lastAssessment: undefined, pendingDisposition: false } } } },
        feedback: feedback('success', 'evidence-examined', 'Evidence examined.') };
    }
    case 'SET_WORK_SCENARIO_DATA': {
      const definition = isValidWorkDefinition(workCatalog[action.workId]) ? workCatalog[action.workId] : undefined;
      const progress = state.works.progress[action.workId];
      if (!definition || !progress || !progressMatchesDefinition(definition, progress) || state.works.activeWorkId !== action.workId || progress.status !== 'active'
        || !definition.validateScenarioData(action.scenarioData)) {
        return { state, feedback: feedback('error', 'invalid-work-progress', 'The Work progress data is invalid or the Work is not active.') };
      }
      return { state: { ...state, works: { ...state.works, progress: { ...state.works.progress,
        [action.workId]: { ...progress, scenarioData: action.scenarioData, lastAssessment: undefined, pendingDisposition: false } } } }, feedback: null };
    }
    case 'SUBMIT_WORK': {
      const definition = isValidWorkDefinition(workCatalog[action.workId]) ? workCatalog[action.workId] : undefined;
      const progress = state.works.progress[action.workId];
      if (!definition || !progress || !progressMatchesDefinition(definition, progress) || state.works.activeWorkId !== action.workId || progress.status !== 'active'
        || (progress.pendingDisposition && progress.lastAssessment?.outcome === 'accepted')
        || !definition.validateScenarioData(progress.scenarioData)) {
        return { state, feedback: feedback('error', 'work-not-submittable', 'This Work cannot be submitted in its current state.') };
      }
      const submissionCost = progress.submissionCount === 0
        ? (definition.initialSubmissionApCost ?? definition.submissionApCost ?? 0)
        : (definition.revisionSubmissionApCost ?? definition.submissionApCost ?? 0);
      if (!Number.isInteger(submissionCost) || submissionCost < 0 || submissionCost > economy.apRemaining) {
        return { state, feedback: feedback('error', 'insufficient-ap', 'There is not enough AP remaining to submit this Work.') };
      }
      const context = { progress: progress.scenarioData, character: scribal, examinedEvidence: progress.examinedEvidence, personId: person.id, dayNumber: state.calendar.dayNumber };
      let assessment: WorkAssessment;
      try {
        const submission = definition.evaluateSubmission(context);
        assessment = definition.assessSubmission(submission, context);
      } catch {
        return { state, feedback: feedback('error', 'work-assessment-error', 'The Work assessment failed; no progress or AP was changed.') };
      }
      if (!assessment || !['accepted','revise','rejected'].includes(assessment.outcome) || typeof assessment.summary !== 'string' || !assessment.summary
        || !Array.isArray(assessment.dimensions) || assessment.dimensions.length === 0
        || assessment.dimensions.some((item) => !item || !['accuracy','completeness','responsible_interpretation','procedure','traceability','responsibility'].includes(item.dimension)
          || !['meets','partial','fails'].includes(item.status) || typeof item.summary !== 'string' || !item.summary)
        || new Set(assessment.dimensions.map((item) => item.dimension)).size !== assessment.dimensions.length) {
        return { state, feedback: feedback('error', 'invalid-work-assessment', 'The Work assessment returned an invalid result; no progress or AP was changed.') };
      }
      const submissionCount = progress.submissionCount + 1;
      const apAfterSubmission = economy.apRemaining - submissionCost;
      const apSpentAfterSubmission = progress.workApSpentToday + submissionCost;
      if (assessment.outcome === 'accepted' && definition.finalizeDisposition) {
        const nextProgress = { ...progress, pendingDisposition: true, submissionCount, workApSpentToday: apSpentAfterSubmission,
          lastAssessment: { ...assessment, assessedDay: state.calendar.dayNumber } };
        return { state: { ...state, actionEconomy: { ...economy, apRemaining: apAfterSubmission },
          works: { ...state.works, progress: { ...state.works.progress, [action.workId]: nextProgress } } },
          feedback: feedback('success', 'work-assessment-pending-disposition', assessment.summary) };
      }
      if (assessment.outcome === 'accepted') {
        const grantReward = !progress.rewardGranted;
        const nextProgress = { ...progress, status: 'completed' as const, rewardGranted: true, pendingDisposition: false, submissionCount, workApSpentToday: apSpentAfterSubmission,
          lastAssessment: { ...assessment, assessedDay: state.calendar.dayNumber } };
        return { state: { ...state, actionEconomy: { ...economy, apRemaining: apAfterSubmission }, works: { ...state.works, activeWorkId: null,
          contributionSegments: closeContributionSegments(state.works.contributionSegments, action.workId, person.id, state.calendar.dayNumber, 'completed'),
          progress: { ...state.works.progress, [action.workId]: nextProgress } },
          historicalProgression: { historicalXp: state.historicalProgression.historicalXp + (grantReward && definition.kind === 'work' ? definition.historicalXpReward : 0),
            completedWorks: definition.kind !== 'work' || state.historicalProgression.completedWorks.includes(action.workId) ? state.historicalProgression.completedWorks
              : [...state.historicalProgression.completedWorks, action.workId] } },
          feedback: feedback('success', 'work-completed', assessment.summary) };
      }
      let recovered: unknown;
      try { recovered = definition.recover(context, assessment); }
      catch { return { state, feedback: feedback('error', 'work-recovery-error', 'The Work recovery path failed; the prior progress was preserved.') }; }
      if (!definition.validateScenarioData(recovered)) return { state, feedback: feedback('error', 'invalid-work-recovery', 'The Work recovery path returned invalid progress; the prior state was preserved.') };
      return { state: { ...state, actionEconomy: { ...economy, apRemaining: apAfterSubmission }, works: { ...state.works, progress: { ...state.works.progress,
        [action.workId]: { ...progress, scenarioData: recovered, submissionCount, workApSpentToday: apSpentAfterSubmission,
          pendingDisposition: !!definition.finalizeDisposition, lastAssessment: { ...assessment, assessedDay: state.calendar.dayNumber } } } } },
        feedback: feedback('info', 'work-revision-needed', assessment.summary) };
    }
    case 'DISPOSE_WORK': {
      const definition = isValidWorkDefinition(workCatalog[action.workId]) ? workCatalog[action.workId] : undefined;
      const progress = state.works.progress[action.workId];
      if (!definition?.finalizeDisposition || !definition.dispositions?.includes(action.disposition) || !progress || !progressMatchesDefinition(definition, progress)
        || state.works.activeWorkId !== action.workId || progress.status !== 'active' || !progress.pendingDisposition
        || !progress.lastAssessment || !definition.validateScenarioData(progress.scenarioData)) {
        return { state, feedback: feedback('error', 'work-disposition-unavailable', 'A current assessed submission and a valid disposition are required.') };
      }
      const cost = definition.dispositionApCost ?? 0;
      if (!Number.isInteger(cost) || cost < 0 || cost > economy.apRemaining) return { state, feedback: feedback('error', 'insufficient-ap', 'There is not enough AP remaining for the Senior Scribe disposition.') };
      if (action.disposition === 'returned' && progress.lastAssessment.outcome === 'accepted') {
        return { state, feedback: feedback('error', 'invalid-work-disposition', 'An accepted assessment cannot be returned through the correction disposition.') };
      }
      if (action.disposition !== 'returned' && progress.lastAssessment.outcome !== 'accepted') {
        return { state, feedback: feedback('error', 'invalid-work-disposition', 'A submission requiring correction must be revised or returned before final acceptance.') };
      }
      if (action.disposition === 'authorized' && progress.lastAssessment.dimensions.some((item) => item.dimension === 'responsibility' && item.status !== 'meets')) {
        return { state, feedback: feedback('error', 'work-recommendation-not-authorized', 'The recommendation did not meet the assessment standard and cannot be authorized.') };
      }
      if (action.disposition === 'returned') {
        const nextProgress = { ...progress, pendingDisposition: false, workApSpentToday: progress.workApSpentToday + cost };
        return { state: { ...state, actionEconomy: { ...economy, apRemaining: economy.apRemaining - cost },
          works: { ...state.works, progress: { ...state.works.progress, [action.workId]: nextProgress } } },
          feedback: feedback('info', 'work-returned', 'The Senior Scribe returned the document. Correct it and resubmit for 1 AP.') };
      }
      let finalization;
      try {
        finalization = definition.finalizeDisposition({
          progress: progress.scenarioData, character: scribal, examinedEvidence: progress.examinedEvidence,
          personId: person.id, dayNumber: state.calendar.dayNumber,
        }, action.disposition);
      } catch {
        return { state, feedback: feedback('error', 'work-finalization-error', 'The disposition could not be finalized; no AP, rewards, or records were committed.') };
      }
      if (!finalization || (finalization.careerXpReward !== undefined && (!Number.isFinite(finalization.careerXpReward) || finalization.careerXpReward < 0)) || (finalization.knowledge !== undefined && !Array.isArray(finalization.knowledge))
        || (finalization.retireInstitutionMatters !== undefined && (!Array.isArray(finalization.retireInstitutionMatters) || finalization.retireInstitutionMatters.some((item) => !item || typeof item.institutionId !== 'string' || !item.institutionId || typeof item.matterId !== 'string' || !item.matterId)))
        || (finalization.addInstitutionMatters !== undefined && (!Array.isArray(finalization.addInstitutionMatters) || finalization.addInstitutionMatters.some((item) => !item || typeof item.id !== 'string' || !item.id || !state.world.institutions[item.institutionId] || !item.summary || !Number.isInteger(item.createdDay) || item.createdDay < 1 || item.createdDay > state.calendar.dayNumber)))
        || (finalization.events !== undefined && (!Array.isArray(finalization.events) || finalization.events.some((event) => !event || typeof event.id !== 'string' || !event.id || !Number.isInteger(event.dayNumber) || event.dayNumber < 1 || event.dayNumber > state.calendar.dayNumber)))
        || (finalization.presentAssignments !== undefined && !Array.isArray(finalization.presentAssignments))) {
        return { state, feedback: feedback('error', 'work-finalization-invalid', 'The Work finalizer returned invalid rewards or world effects.') };
      }
      let next = state;
      for (const event of finalization.events ?? []) {
        const result = transitionWorldAction(next, { type: 'CREATE_EVENT', event });
        if (result.feedback?.kind === 'error') return { state, feedback: feedback('error', 'work-event-invalid', result.feedback.message) };
        next = result.state;
      }
      if (finalization.record) {
        const result = transitionWorldAction(next, { type: 'CREATE_RECORD', record: finalization.record });
        if (result.feedback?.kind === 'error') return { state, feedback: feedback('error', 'work-record-invalid', result.feedback.message) };
        next = result.state;
      }
      for (const knowledge of finalization.knowledge ?? []) {
        const result = transitionWorldAction(next, { type: 'GRANT_KNOWLEDGE', knowledge });
        if (result.feedback?.kind === 'error') return { state, feedback: feedback('error', 'work-knowledge-invalid', result.feedback.message) };
        next = result.state;
      }
      for (const matter of finalization.addInstitutionMatters ?? []) {
        const institution = next.world.institutions[matter.institutionId];
        if (!institution || next.world.matters[matter.id] || !matter.summary.trim() || (matter.sourceRecordId && !next.records.entries[matter.sourceRecordId]) || (matter.locationId && !next.world.locations[matter.locationId])) return { state, feedback: feedback('error', 'work-institution-matter-invalid', 'A new institutional matter has invalid identity, provenance, institution, or location.') };
        next = { ...next, world: { ...next.world, matters: { ...next.world.matters, [matter.id]: matter }, institutions: { ...next.world.institutions, [matter.institutionId]: { ...institution, activeMatters: [...institution.activeMatters, matter.id] } } } };
      }
      for (const offer of finalization.presentAssignments ?? []) {
        const result = transitionOpportunityAction(next, { type: 'PRESENT_ASSIGNMENT', offer });
        if (result.feedback?.kind === 'error') return { state, feedback: feedback('error', 'work-follow-up-assignment-invalid', result.feedback.message) };
        next = result.state;
      }
      for (const retirement of finalization.retireInstitutionMatters ?? []) {
        const institution = next.world.institutions[retirement.institutionId]; if (!institution) return { state, feedback: feedback('error', 'work-institution-matter-invalid', `Institution ${retirement.institutionId} does not exist.`) };
        const matter = next.world.matters[retirement.matterId];
        next = { ...next, world: { ...next.world, matters: matter ? { ...next.world.matters, [matter.id]: { ...matter, status: 'resolved' } } : next.world.matters,
          institutions: { ...next.world.institutions, [retirement.institutionId]: { ...institution, activeMatters: institution.activeMatters.filter((matterId) => matterId !== retirement.matterId) } } } };
      }
      const grantReward = !progress.rewardGranted;
      const finalProgress = { ...progress, status: 'completed' as const, rewardGranted: true, pendingDisposition: false, finalDisposition: action.disposition,
        workApSpentToday: progress.workApSpentToday + cost };
      const careerXp = finalization.careerXpReward ?? 0;
      let rewarded = next;
      if (careerXp > 0) {
        const careerResult = transitionCareerAction(next, {
          type: 'AWARD_CAREER_XP', amount: careerXp,
          reason: 'The Senior Scribe accepted the Storehouse Reckoning.',
        }, careerPolicy);
        if (careerResult.feedback?.kind === 'error') return { state, feedback: feedback('error', 'work-career-reward-invalid', careerResult.feedback.message) };
        rewarded = careerResult.state;
      }
      return { state: { ...rewarded, actionEconomy: { ...economy, apRemaining: economy.apRemaining - cost },
        works: { ...rewarded.works, activeWorkId: null,
          contributionSegments: closeContributionSegments(rewarded.works.contributionSegments, action.workId, person.id, state.calendar.dayNumber, 'completed'),
          progress: { ...rewarded.works.progress, [action.workId]: finalProgress } },
        historicalProgression: { historicalXp: next.historicalProgression.historicalXp + (grantReward && definition.kind === 'work' ? definition.historicalXpReward : 0),
          completedWorks: definition.kind !== 'work' || next.historicalProgression.completedWorks.includes(action.workId) ? next.historicalProgression.completedWorks : [...next.historicalProgression.completedWorks, action.workId] } },
        feedback: feedback('success', 'work-completed', progress.lastAssessment.summary) };
    }
    case 'SPEND_AP': {
      if (!Number.isFinite(action.amount) || action.amount <= 0 || !Number.isInteger(action.amount)) {
        return { state, feedback: feedback('error', 'invalid-ap-cost', 'The AP cost must be a positive whole number.') };
      }
      if (action.workId !== undefined) {
        const progress = state.works.progress[action.workId];
        const definition = workCatalog[action.workId];
        if (!isValidWorkDefinition(definition) || !progress || !progressMatchesDefinition(definition, progress) || state.works.activeWorkId !== action.workId || progress.status !== 'active') {
          return { state, feedback: feedback('error', 'inactive-work-ap', 'Work AP must be charged to the currently active Work.') };
        }
        if (economy.apRemaining < action.amount) return { state, feedback: feedback('error', 'insufficient-ap', 'There is not enough AP remaining today.') };
        return { state: { ...state, actionEconomy: { ...economy, apRemaining: economy.apRemaining - action.amount },
          works: { ...state.works, progress: { ...state.works.progress,
            [action.workId]: { ...progress, workApSpentToday: progress.workApSpentToday + action.amount } } } },
          feedback: feedback('success', 'ap-spent', action.reason) };
      }
      if (economy.apRemaining < action.amount) {
        return { state, feedback: feedback('error', 'insufficient-ap', 'There is not enough AP remaining today.') };
      }
      return {
        state: { ...state, actionEconomy: { ...economy, apRemaining: economy.apRemaining - action.amount } },
        feedback: feedback('success', 'ap-spent', action.reason),
      };
    }
    case 'ACTIVATE_OVERTIME': {
      if (economy.apRemaining !== 0 || economy.overtimeUsedToday) {
        return { state, feedback: feedback('error', 'overtime-unavailable', 'Overtime is available once, only after all allocated AP have been spent.') };
      }
      return {
        state: {
          ...state,
          actionEconomy: { ...economy, apRemaining: 1, overtimeUsedToday: true, nextDayApPenalty: true },
          world: {
            ...state.world,
            people: {
              ...state.world.people,
              [person.id]: { ...person, scribal: { ...scribal, stress: Math.min(100, scribal.stress + 5) } },
            },
          },
        },
        feedback: feedback('success', 'overtime-activated', 'One overtime AP is available. Stress increased by 5; tomorrow will have five AP.'),
      };
    }
    case 'PERFORM_RECOVERY_LABOR': {
      const storehouse = state.world.institutions['institution-uruk-temple-storehouse' as InstitutionId];
      if (economy.recoveryLaborUsedToday) return { state, feedback: feedback('error', 'recovery-labor-already-used', 'Auxiliary labor has already been performed today.') };
      // This is preventative ordinary-workday labor, not an emergency-only action.
      if (!storehouse || !storehouse.locationId || !state.world.locations[storehouse.locationId]) return { state, feedback: feedback('error', 'recovery-labor-unavailable', 'No suitable storehouse labor is available in the current circumstances.') };
      if (economy.apRemaining < 2) return { state, feedback: feedback('error', 'insufficient-ap', 'Auxiliary storehouse labor requires 2 AP.') };
      return {
        state: {
          ...state,
          actionEconomy: { ...economy, apRemaining: economy.apRemaining - 2, recoveryLaborUsedToday: true },
          world: { ...state.world, people: { ...state.world.people,
            [person.id]: { ...person, scribal: { ...scribal, wallet: { ...scribal.wallet, provisions: scribal.wallet.provisions + 1 } } },
          } },
        },
        feedback: feedback('success', 'recovery-labor-completed', 'You completed auxiliary grain-bagging at the Temple Storehouse and earned one provision.'),
      };
    }
    case 'REQUEST_CONTACT_ADVANCE': {
      const contact = state.world.people[action.contactId];
      const contactScribal = getInitializedScribal(contact);
      const relationship = state.world.relationships[action.contactId]?.[person.id];
      const outstanding = scribal.obligations.some((item) => item.status === 'outstanding' && item.creditorPersonId === action.contactId);
      if (action.contactId === person.id || action.contactId !== UR_GIR_PERSON_ID || !contact?.alive || !contactScribal || !relationship
        || relationship.dimensions.trust < 50 || relationship.dimensions.resentment !== 0
        || contactScribal.wallet.provisions < 1 || outstanding) {
        return { state, feedback: feedback('error', 'contact-advance-unavailable', 'Ur-gir cannot provide an advance under the current relationship or material circumstances.') };
      }
      if (scribal.wallet.provisions > 0) return { state, feedback: feedback('error', 'recovery-not-needed', 'An emergency advance is available when no provisions remain.') };
      if (economy.apRemaining < 1) return { state, feedback: feedback('error', 'insufficient-ap', 'Requesting an advance requires 1 AP.') };
      const obligation = {
        id: `obligation-urgir-advance-${state.calendar.dayNumber}`,
        creditorPersonId: contact.id,
        createdDay: state.calendar.dayNumber,
        kind: 'repayment_or_service' as const,
        description: 'Repay one unit of Currency or provide one day of scribal assistance to Ur-gir, by mutual arrangement.',
        status: 'outstanding' as const,
      };
      return {
        state: {
          ...state,
          actionEconomy: { ...economy, apRemaining: economy.apRemaining - 1 },
          world: { ...state.world, people: {
            ...state.world.people,
            [person.id]: { ...person, scribal: { ...scribal, wallet: { ...scribal.wallet, provisions: scribal.wallet.provisions + 1 }, obligations: [...scribal.obligations, obligation] } },
            [contact.id]: { ...contact, scribal: { ...contactScribal, wallet: { ...contactScribal.wallet, provisions: contactScribal.wallet.provisions - 1 } } },
          } },
        },
        feedback: feedback('success', 'contact-advance-received', 'Ur-gir advanced one provision. You owe him one unit of Currency or a day of scribal assistance, by mutual arrangement.'),
      };
    }
    case 'END_DAY': {
      if (state.dayClose.phase !== 'workday_open' || action.expectedDayNumber !== state.calendar.dayNumber) {
        return { state, feedback: feedback('error', 'stale-day-settlement', 'This Workday has already been closed or the calendar has changed.') };
      }
      if (economy.overtimeUsedToday && economy.apRemaining > 0 && action.confirmUnusedOvertimeApForfeit !== true) {
        return { state, feedback: feedback('error', 'overtime-ap-unspent', 'Confirm that you want to forfeit the unused overtime AP before settling the day.') };
      }
      const startingProvisions = scribal.wallet.provisions;
      const genuineWorkProgress = Object.entries(state.works.progress).flatMap(([workId, progress]) => {
        const definition = workCatalog[workId];
        if (!isValidWorkDefinition(definition) || definition.kind !== 'work'
          || !progressMatchesDefinition(definition, progress)
          || (progress.status === 'active' && state.works.activeWorkId !== workId)
          || !definition.provisionsContract) return [];
        return [{ workId, progress, contract: definition.provisionsContract }];
      });
      const contractProgress = genuineWorkProgress.find(({ progress, contract }) =>
        (progress.status === 'active' || progress.status === 'completed')
        && progress.workApSpentToday >= contract.minimumWorkApPerDay);
      const activeContractExists = genuineWorkProgress.some(({ progress }) => progress.status === 'active');
      const contractProvision = contractProgress ? contractProgress.contract.provisionsPerQualifiedWorkday : 0;
      const workContractProvisionReason = contractProgress
        ? 'qualified_workday' as const
        : activeContractExists
          ? 'insufficient_work_ap' as const
          : 'no_active_work_contract' as const;
      const settlementId = String(state.calendar.eraId) + ':' + state.calendar.dayNumber;
      let credits = [...state.dayClose.pendingCredits];
      if (contractProgress && contractProvision > 0) {
        const id = 'work-provisions:' + state.calendar.eraId + ':' + state.calendar.dayNumber;
        if (!credits.some((credit) => credit.id === id)) {
          credits.push({
            id, source: { kind: 'work', id: contractProgress.workId },
            earnedDay: state.calendar.dayNumber, money: 0, provisions: contractProvision, status: 'pending',
          });
        }
      }
      const dueCredits = credits.filter((credit) => credit.status === 'pending' && credit.earnedDay <= state.calendar.dayNumber);
      const assignmentMoneyEarned = dueCredits.filter((credit) => credit.source.kind === 'assignment').reduce((sum, credit) => sum + credit.money, 0);
      const assignmentProvisionsEarned = dueCredits.filter((credit) => credit.source.kind === 'assignment').reduce((sum, credit) => sum + credit.provisions, 0);
      const creditedMoney = dueCredits.reduce((sum, credit) => sum + credit.money, 0);
      const creditedProvisions = dueCredits.reduce((sum, credit) => sum + credit.provisions, 0);
      credits = credits.map((credit) => credit.status === 'pending' && credit.earnedDay <= state.calendar.dayNumber
        ? { ...credit, status: 'credited' as const, creditedBySettlementId: settlementId }
        : credit);
      const availableProvisions = startingProvisions + creditedProvisions;
      const hadProvision = availableProvisions > 0;
      const sustenanceDeducted = hadProvision ? 1 : 0;
      const endingProvisions = hadProvision ? availableProvisions - 1 : 0;
      const shortageWorkdays = hadProvision ? 0 : scribal.wallet.shortageWorkdays + 1;
      const cumulativeBefore = scribal.cumulativeShortageStress ?? 0;
      const shortageStressDelta = !hadProvision && shortageWorkdays >= 3
        ? Math.min(2, 10 - cumulativeBefore)
        : 0;
      const preview = {
        startingProvisions, assignmentMoneyEarned, assignmentProvisionsEarned,
        workContractProvisionEarned: contractProvision, workContractProvisionReason,
        sustenanceDeducted, endingProvisions, shortageWorkdays, shortageStressDelta,
        cumulativeShortageStress: cumulativeBefore + shortageStressDelta,
        overtimeStress: economy.overtimeUsedToday ? 5 : 0,
        tomorrowAp: economy.nextDayApPenalty ? 5 as const : 6 as const,
      };
      const nextScribal = {
        ...scribal,
        wallet: { ...scribal.wallet, money: scribal.wallet.money + creditedMoney, provisions: availableProvisions },
      };
      return {
        state: {
          ...state,
          dayClose: { ...state.dayClose, phase: 'interlude_open', pendingSettlementId: settlementId, pendingCredits: credits, preview },
          world: { ...state.world, people: { ...state.world.people, [person.id]: { ...person, scribal: nextScribal } } },
        },
        feedback: feedback('success', 'evening-interlude-opened', 'The preliminary settlement is recorded. Sustenance and shortage consequences remain pending until Begin Workday.'),
        settlement: preview,
      };
    }
    case 'BUY_PROVISIONS': {
      const preview = state.dayClose.preview;
      if (state.calendar.eraId !== 'era-1') {
        return { state, feedback: feedback('error', 'provisions-exchange-era-unavailable', 'This provisional Playtest 1 exchange is authored for Era I only.') };
      }
      if (state.dayClose.phase !== 'interlude_open' || !preview) {
        return { state, feedback: feedback('error', 'evening-interlude-not-open', 'A provisions exchange is available only during the Evening Interlude.') };
      }
      if (!Number.isInteger(action.amount) || action.amount < 1) {
        return { state, feedback: feedback('error', 'invalid-provisions-purchase', 'Choose at least one whole Provision.') };
      }
      const cost = action.amount * 2;
      if (scribal.wallet.money < cost) {
        return { state, feedback: feedback('error', 'insufficient-currency', 'This exchange requires ' + cost + ' Currency.') };
      }
      const provisions = scribal.wallet.provisions + action.amount;
      const shortageWorkdays = provisions > 0 ? 0 : scribal.wallet.shortageWorkdays + 1;
      const shortageStressDelta = provisions === 0 && shortageWorkdays >= 3
        ? Math.min(2, 10 - (scribal.cumulativeShortageStress ?? 0))
        : 0;
      const updatedPreview = {
        ...preview,
        sustenanceDeducted: provisions > 0 ? 1 : 0,
        endingProvisions: provisions > 0 ? provisions - 1 : 0,
        shortageWorkdays,
        shortageStressDelta,
        cumulativeShortageStress: (scribal.cumulativeShortageStress ?? 0) + shortageStressDelta,
      };
      return {
        state: {
          ...state,
          dayClose: { ...state.dayClose, preview: updatedPreview },
          world: { ...state.world, people: { ...state.world.people, [person.id]: {
            ...person, scribal: { ...scribal, wallet: { ...scribal.wallet, money: scribal.wallet.money - cost, provisions } },
          } } },
        },
        feedback: feedback('success', 'provisions-purchased', 'Exchanged ' + cost + ' Currency for ' + action.amount + ' Provision(s). The exchange rate is provisional for Playtest 1.'),
        settlement: updatedPreview,
      };
    }
    case 'BEGIN_WORKDAY': {
      const settlementId = state.dayClose.pendingSettlementId;
      if (state.dayClose.phase !== 'interlude_open' || !settlementId
        || action.expectedSettlementId !== settlementId
        || settlementId === state.dayClose.lastFinalizedSettlementId
        || !state.dayClose.preview) {
        return { state, feedback: feedback('error', 'stale-workday-start', 'This Evening Interlude has already been finalized or the settlement identity is stale.') };
      }
      const preview = state.dayClose.preview;
      const hadProvision = scribal.wallet.provisions > 0;
      const sustenanceDeducted = hadProvision ? 1 : 0;
      const endingProvisions = hadProvision ? scribal.wallet.provisions - 1 : 0;
      const shortageWorkdays = hadProvision ? 0 : scribal.wallet.shortageWorkdays + 1;
      const cumulativeBefore = scribal.cumulativeShortageStress ?? 0;
      const shortageStressDelta = !hadProvision && shortageWorkdays >= 3
        ? Math.min(2, 10 - cumulativeBefore)
        : 0;
      const cumulativeShortageStress = cumulativeBefore + shortageStressDelta;
      const underfedId = 'condition-underfed' as ConditionId;
      const conditions = hadProvision
        ? scribal.conditions.filter((condition) => condition.id !== underfedId)
        : shortageWorkdays >= 3
          ? [...scribal.conditions.filter((condition) => condition.id !== underfedId), { id: underfedId, severity: 2 as const, modifiers: [] }]
          : scribal.conditions;
      const updatedScribal = {
        ...scribal,
        stress: Math.min(100, scribal.stress + shortageStressDelta),
        cumulativeShortageStress,
        conditions,
        wallet: { ...scribal.wallet, provisions: endingProvisions, shortageWorkdays },
      };
      const withExpiredOffers = settleAssignmentOffers(state, workCatalog);
      let next: GameState = {
        ...withExpiredOffers,
        calendar: { ...state.calendar, dayNumber: state.calendar.dayNumber + 1, displayDate: displayDate(state.calendar.dayNumber + 1) },
        dayClose: { ...state.dayClose, phase: 'workday_open', pendingSettlementId: null,
          lastFinalizedSettlementId: settlementId, preview: null },
        works: { ...withExpiredOffers.works, progress: Object.fromEntries(Object.entries(withExpiredOffers.works.progress).map(([id, progress]) => [id, { ...progress, workApSpentToday: 0 }])) },
        actionEconomy: {
          dailyApAllocation: economy.nextDayApPenalty ? 5 as const : 6 as const,
          apRemaining: economy.nextDayApPenalty ? 5 : 6,
          overtimeUsedToday: false, nextDayApPenalty: false, recoveryLaborUsedToday: false,
        },
        world: { ...withExpiredOffers.world, people: { ...withExpiredOffers.world.people, [person.id]: { ...person, scribal: updatedScribal } } },
      };
      next = advanceInstitutionalMatters(next, state.calendar.dayNumber + 1);
      next = advanceInstitutionalResponses(next, state.calendar.dayNumber + 1);
      next = generateDailyAssignments(next);
      next = runChallengeDirector(next);
      next = buildSituatedMorningReport(state, next);
      if (!hadProvision && (shortageWorkdays <= 2 || shortageWorkdays === 3)) {
        next = withNotice(next, 'settlement', shortageWorkdays <= 2
          ? 'No provisions were available. Shortage day ' + shortageWorkdays + ' of 2 grace days.'
          : 'No provisions were available (Shortage day ' + shortageWorkdays + '). +' + shortageStressDelta + ' Stress (' + cumulativeShortageStress + '/10 cap); Underfed condition active.');
      }
      const settlement = { ...preview, sustenanceDeducted, endingProvisions, shortageWorkdays,
        shortageStressDelta, cumulativeShortageStress };
      return { state: next, feedback: feedback('success', 'workday-begun', 'Sustenance is finalized and the new Workday has begun.'), settlement };
    }
    case 'MARK_NOTICE_READ': {
      return {
        state: {
          ...state,
          journal: {
            ...state.journal,
            notices: state.journal.notices.map((notice) => notice.id === action.noticeId ? { ...notice, read: true } : notice),
          },
        },
        feedback: null,
      };
    }
    default:
      return { state, feedback: feedback('error', 'unsupported-action', 'This action is not supported by the current engine.') };
  }
  return { state, feedback: feedback('error', 'unsupported-action', 'This action is not supported by the current engine.') };
}
