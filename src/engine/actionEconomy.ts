import type { CareerProgressionPolicy, GameAction, GameState, TransitionResult } from '../state/types';
import { transitionCareerAction } from './careerProgression';
import { transitionWorldAction } from './worldSocial';
import { settleAssignmentOffers, transitionOpportunityAction } from './opportunities';
import { transitionAssignmentActivityAction } from './assignmentActivity';
import { validateWorkDefinition } from '../works/workDefinition';
import { transitionCharacterContinuity } from './characterContinuity';
import { advanceInstitutionalMatters } from './institutionalMatters';
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

function displayDate(dayNumber: number): string {
  return `Day ${dayNumber} · Uruk (c. 3200 BCE)`;
}

/** Pure, deterministic state transition. UI feedback is ephemeral; notices are saved in GameState. */
export function transitionGame(state: GameState, action: GameAction, careerPolicy?: CareerProgressionPolicy, workCatalog: Readonly<Record<string, WorkDefinition<any>>> = {}): TransitionResult {
  const economy = state.actionEconomy;
  if (state.pendingSuccession && action.type !== 'SELECT_SUCCESSOR') {
    return { state, feedback: feedback('error', 'succession-pending', 'Ordinary actions are paused until the pending character transition is resolved.') };
  }
  if (action.type === 'BEGIN_CHARACTER_DEPARTURE' || action.type === 'SELECT_SUCCESSOR') {
    return transitionCharacterContinuity(state, action);
  }
  const person = state.world.people[state.player.currentCharacterId];
  const scribal = person?.scribal;
  if (!scribal) return { state, feedback: feedback('error', 'missing-active-character', 'The current character is unavailable.') };

  switch (action.type) {
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
      return transitionWorldAction(state, action);
    case 'START_WORK': {
      const definition = workCatalog[action.workId];
      if (!definition) return { state, feedback: feedback('error', 'unknown-work', 'This Work is not registered in the active content catalog.') };
      if (validateWorkDefinition(definition).length) return { state, feedback: feedback('error', 'invalid-work-definition', 'This Work failed static content validation.') };
      if (state.works.activeWorkId !== null) return { state, feedback: feedback('error', 'work-already-active', 'Another Work is already active.') };
      if (state.historicalProgression.completedWorks.includes(action.workId) || state.works.progress[action.workId]?.status === 'completed') return { state, feedback: feedback('error', 'work-already-completed', 'This activity has already been completed.') };
      const scenarioData = definition.createInitialProgress();
      if (!definition.validateScenarioData(scenarioData)) return { state, feedback: feedback('error', 'invalid-work-initial-state', 'The Work supplied invalid initial progress data.') };
      const progress = {
        status: 'active' as const, acquiredEvidence: [...definition.startingEvidence], examinedEvidence: [],
        workApSpentToday: 0, rewardGranted: false, completedActionIds: [],
        provisionContract: definition.kind === 'tutorial' ? undefined : definition.provisionsContract, scenarioData, submissionCount: 0,
      };
      return { state: { ...state, works: { activeWorkId: action.workId, progress: { ...state.works.progress, [action.workId]: progress } } },
        feedback: feedback('success', 'work-started', definition.title) };
    }
    case 'ACQUIRE_WORK_EVIDENCE':
    case 'COMPLETE_WORK_ACTION': {
      const definition = workCatalog[action.workId];
      const progress = state.works.progress[action.workId];
      const actionDefinition = definition?.actions.find((item) => item.id === action.actionId);
      if (!definition || !progress || state.works.activeWorkId !== action.workId || progress.status !== 'active' || !actionDefinition) {
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
        feedback: feedback('success', 'work-evidence-acquired', actionDefinition.id) };
    }
    case 'EXAMINE_WORK_EVIDENCE': {
      const definition = workCatalog[action.workId];
      const progress = state.works.progress[action.workId];
      if (!definition || !definition.evidence.some((item) => item.id === action.evidenceId) || !progress || state.works.activeWorkId !== action.workId || progress.status !== 'active' || !progress.acquiredEvidence.includes(action.evidenceId)) return { state, feedback: feedback('error', 'evidence-not-acquired', 'Acquire this evidence before examining it.') };
      if (progress.examinedEvidence.includes(action.evidenceId)) return { state, feedback: feedback('info', 'evidence-already-examined', 'Re-examining acquired evidence costs no AP.') };
      return { state: { ...state, works: { ...state.works, progress: { ...state.works.progress,
        [action.workId]: { ...progress, examinedEvidence: [...progress.examinedEvidence, action.evidenceId], lastAssessment: undefined, pendingDisposition: false } } } },
        feedback: feedback('success', 'evidence-examined', 'Evidence examined.') };
    }
    case 'SET_WORK_SCENARIO_DATA': {
      const definition = workCatalog[action.workId];
      const progress = state.works.progress[action.workId];
      if (!definition || !progress || state.works.activeWorkId !== action.workId || progress.status !== 'active'
        || !definition.validateScenarioData(action.scenarioData)) {
        return { state, feedback: feedback('error', 'invalid-work-progress', 'The Work progress data is invalid or the Work is not active.') };
      }
      return { state: { ...state, works: { ...state.works, progress: { ...state.works.progress,
        [action.workId]: { ...progress, scenarioData: action.scenarioData, lastAssessment: undefined, pendingDisposition: false } } } }, feedback: null };
    }
    case 'SUBMIT_WORK': {
      const definition = workCatalog[action.workId];
      const progress = state.works.progress[action.workId];
      if (!definition || !progress || state.works.activeWorkId !== action.workId || progress.status !== 'active'
        || (progress.pendingDisposition && progress.lastAssessment?.outcome === 'accepted'
          && progress.lastAssessment.dimensions.every((item) => item.status === 'meets'))
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
        return { state: { ...state, actionEconomy: { ...economy, apRemaining: apAfterSubmission }, works: { activeWorkId: null, progress: { ...state.works.progress, [action.workId]: nextProgress } },
          historicalProgression: { historicalXp: state.historicalProgression.historicalXp + (grantReward && definition.kind !== 'tutorial' ? definition.historicalXpReward : 0),
            completedWorks: definition.kind === 'tutorial' || state.historicalProgression.completedWorks.includes(action.workId) ? state.historicalProgression.completedWorks
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
      const definition = workCatalog[action.workId];
      const progress = state.works.progress[action.workId];
      if (!definition?.finalizeDisposition || !definition.dispositions?.includes(action.disposition) || !progress
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
        || (finalization.presentAssignments !== undefined && !Array.isArray(finalization.presentAssignments))) {
        return { state, feedback: feedback('error', 'work-finalization-invalid', 'The Work finalizer returned invalid rewards.') };
      }
      let next = state;
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
        works: { activeWorkId: null, progress: { ...rewarded.works.progress, [action.workId]: finalProgress } },
        historicalProgression: { historicalXp: next.historicalProgression.historicalXp + (grantReward && definition.kind !== 'tutorial' ? definition.historicalXpReward : 0),
          completedWorks: definition.kind === 'tutorial' || next.historicalProgression.completedWorks.includes(action.workId) ? next.historicalProgression.completedWorks : [...next.historicalProgression.completedWorks, action.workId] } },
        feedback: feedback('success', 'work-completed', progress.lastAssessment.summary) };
    }
    case 'SPEND_AP': {
      if (!Number.isFinite(action.amount) || action.amount <= 0 || !Number.isInteger(action.amount)) {
        return { state, feedback: feedback('error', 'invalid-ap-cost', 'The AP cost must be a positive whole number.') };
      }
      if (action.workId !== undefined) {
        const progress = state.works.progress[action.workId];
        if (state.works.activeWorkId !== action.workId || !progress || progress.status !== 'active') {
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
    case 'END_DAY': {
      if (action.expectedDayNumber !== state.calendar.dayNumber) {
        return { state, feedback: feedback('error', 'stale-day-settlement', 'This Workday has already been settled or the calendar has changed.') };
      }
      if (economy.overtimeUsedToday && economy.apRemaining > 0) {
        return { state, feedback: feedback('error', 'overtime-ap-unspent', 'Spend the overtime AP before settling the day.') };
      }
      const startingProvisions = scribal.wallet.provisions;
      // Ignore tutorial snapshots as well as current definitions: older v2 saves may
      // still contain the tutorial's former provision contract on WorkProgress.
      const nonTutorialProgress = Object.entries(state.works.progress)
        .filter(([workId]) => workCatalog[workId]?.kind !== 'tutorial')
        .map(([, progress]) => progress);
      const contractProgress = nonTutorialProgress.find((item) =>
        (item.status === 'active' || item.status === 'completed') && !!item.provisionContract
        && item.workApSpentToday >= item.provisionContract.minimumWorkApPerDay);
      const activeContractExists = nonTutorialProgress.some((item) => item.status === 'active' && !!item.provisionContract);
      const contractQualified = !!contractProgress?.provisionContract;
      const contractProvision = contractQualified ? (contractProgress?.provisionContract?.provisionsPerQualifiedWorkday ?? 0) : 0;
      const workContractProvisionReason = contractQualified
        ? 'qualified_workday' as const
        : activeContractExists
          ? 'insufficient_work_ap' as const
          : 'no_active_work_contract' as const;
      const availableProvisions = startingProvisions + contractProvision;
      const hadProvision = availableProvisions > 0;
      const sustenanceDeducted = hadProvision ? 1 : 0;
      const endingProvisions = hadProvision ? availableProvisions - sustenanceDeducted : 0;
      const shortageWorkdays = hadProvision ? 0 : scribal.wallet.shortageWorkdays + 1;
      const updatedScribal = {
        ...scribal,
        wallet: { ...scribal.wallet, provisions: endingProvisions, shortageWorkdays },
      };
      const withExpiredOffers = settleAssignmentOffers(state, workCatalog);
      let next = {
        ...withExpiredOffers,
        calendar: { ...state.calendar, dayNumber: state.calendar.dayNumber + 1, displayDate: displayDate(state.calendar.dayNumber + 1) },
        works: { ...withExpiredOffers.works, progress: Object.fromEntries(Object.entries(withExpiredOffers.works.progress).map(([id, progress]) => [id, { ...progress, workApSpentToday: 0 }])) },
        actionEconomy: {
          dailyApAllocation: economy.nextDayApPenalty ? 5 as const : 6 as const,
          apRemaining: economy.nextDayApPenalty ? 5 : 6,
          overtimeUsedToday: false,
          nextDayApPenalty: false,
        },
        world: {
          ...withExpiredOffers.world,
          people: { ...withExpiredOffers.world.people, [person.id]: { ...person, scribal: updatedScribal } },
        },
      };
      next = advanceInstitutionalMatters(next, state.calendar.dayNumber + 1);
      if (!hadProvision && (shortageWorkdays <= 2 || shortageWorkdays === 3)) {
        next = withNotice(next, 'settlement', shortageWorkdays <= 2
          ? `No provisions were available. Shortage day ${shortageWorkdays} of 2 grace days.`
          : 'No provisions were available for a third consecutive Workday; the shortage state is now active.');
      }
      return {
        state: next,
        feedback: feedback('success', 'day-settled', 'The Workday has been settled.'),
        settlement: {
          startingProvisions,
          workContractProvisionEarned: contractProvision,
          workContractProvisionReason,
          sustenanceDeducted,
          endingProvisions,
          shortageWorkdays,
          overtimeStress: economy.overtimeUsedToday ? 5 : 0,
          tomorrowAp: economy.nextDayApPenalty ? 5 : 6,
        },
      };
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
