import type { GameAction, GameState, TransitionResult, AssignmentOffer, RecordAssertion, RecordEntry } from '../state/types';
import { getInitializedScribal } from '../state/scribalState';
import { addActivity } from './opportunities';
import type { AssignmentId, EventId, KnowledgeEntryId, RecordId, InstitutionId } from '../state/ids';
import { addRelationshipFamiliarityEpisode, relationshipFamiliarityEpisodeId } from '../state/relationshipFamiliarity';
import { NORTH_BAY_ACTIVITY_ID, NORTH_BAY_POST_EXECUTION_ACTIVITY_ID, NORTH_BAY_PEOPLE, ASSIGNMENT_ACTIVITY_CATALOG, validateAssignmentActivityProgress, normalizeActivityDraft } from '../content/assignments/northBayRoofInspection';
import { submitNorthBayPostExecutionInspection } from './northBayPostExecutionSubmission';
import { submitUrukAssignmentActivity } from './urukAssignmentSubmission';
import { submitRubricAssignmentActivity, evaluateAssignmentAssessment } from './eraIAnchorSubmission';
import { applyClosingAssessment } from './closingReceipt';
import { queueSettlementCredit } from './dayClose';
import { MATTER_IDS, createRoofRepairMatter } from './institutionalMatters';

type ActivityAction = Extract<GameAction, { type: 'PERFORM_ASSIGNMENT_ACTIVITY_ACTION' | 'UPDATE_ASSIGNMENT_ACTIVITY_DRAFT' | 'SUBMIT_ASSIGNMENT_ACTIVITY' }>;
const fail = (state: GameState, code: string, message: string): TransitionResult => ({ state, feedback: { kind: 'error', code, message } });
const succeed = (state: GameState, code: string, message: string): TransitionResult => ({ state, feedback: { kind: 'success', code, message } });
const STOREHOUSE = 'institution-uruk-temple-storehouse' as InstitutionId;

function ownedOffer(state: GameState, id: AssignmentId): AssignmentOffer | undefined {
  const offer = state.opportunities.assignments[id];
  return offer?.status === 'accepted' && !!offer.activityId && !!ASSIGNMENT_ACTIVITY_CATALOG[offer.activityId as keyof typeof ASSIGNMENT_ACTIVITY_CATALOG]
    && offer.assigneePersonId === state.player.currentCharacterId ? offer : undefined;
}
export function transitionAssignmentActivityAction(state: GameState, action: ActivityAction): TransitionResult {
  const offer = ownedOffer(state, action.assignmentId);
  const definition = offer?.activityId ? ASSIGNMENT_ACTIVITY_CATALOG[offer.activityId as keyof typeof ASSIGNMENT_ACTIVITY_CATALOG] : undefined;
  if (!offer || !definition || !offer.activityProgress || !validateAssignmentActivityProgress(definition, offer.activityProgress)) {
    return fail(state, 'assignment-activity-not-active', 'Only the current character’s accepted interactive Assignment can be advanced.');
  }
  const progress = offer.activityProgress;
  if (action.type === 'PERFORM_ASSIGNMENT_ACTIVITY_ACTION') {
    const activityAction = definition.actions.find((item) => item.id === action.actionId);
    if (!activityAction || progress.completedActionIds.includes(action.actionId)) return fail(state, 'assignment-activity-action-invalid', 'This activity action is unavailable or already completed.');
    if ((activityAction.prerequisites ?? []).some((id) => !progress.completedActionIds.includes(id))) return fail(state, 'assignment-activity-prerequisite', 'A required activity action has not been completed.');
    if (state.actionEconomy.apRemaining < activityAction.apCost) return fail(state, 'insufficient-ap', `This action costs ${activityAction.apCost} AP.`);
    const nextProgress = {
      ...progress, completedActionIds: [...progress.completedActionIds, activityAction.id],
      discoveryIds: [...new Set([...progress.discoveryIds, ...activityAction.discoveryIds])],
      consultedPersonIds: activityAction.consultedPersonId
        ? [...new Set([...progress.consultedPersonIds, activityAction.consultedPersonId])]
        : progress.consultedPersonIds,
    };
    if (!validateAssignmentActivityProgress(definition, nextProgress)) return fail(state, 'assignment-activity-progress-invalid', 'The action produced invalid activity progress.');

    let events = state.world.events;
    let familiarityEpisodes = state.world.relationshipFamiliarityEpisodes;
    if (activityAction.consultedPersonId) {
      const consultedPerson = state.world.people[activityAction.consultedPersonId];
      const currentPerson = state.world.people[state.player.currentCharacterId];
      if (activityAction.family !== 'consult' || !consultedPerson || !currentPerson || consultedPerson.id === currentPerson.id) {
        return fail(state, 'assignment-activity-consultation-invalid', 'The authored consultation does not identify a valid other participant.');
      }
      const eventId = `event-assignment-consultation-${offer.id}-${activityAction.id}` as EventId;
      if (events[eventId]) return fail(state, 'assignment-activity-consultation-duplicate', 'This consultation Event has already been recorded.');
      const event = {
        id: eventId, dayNumber: state.calendar.dayNumber,
        summary: `${currentPerson.name} consulted ${consultedPerson.name} during ${offer.title}.`,
        personIds: [currentPerson.id, consultedPerson.id],
        institutionIds: offer.employer.kind === 'institution' && state.world.institutions[offer.employer.id as InstitutionId]
          ? [offer.employer.id as InstitutionId] : [],
      };
      events = { ...events, [eventId]: event };
      const contextId = offer.activityId ?? offer.category;
      const matterId = offer.originMatterId && state.world.matters[offer.originMatterId] ? offer.originMatterId : undefined;
      const occasionId = matterId ? `${matterId}:${contextId}` : offer.id;
      const episodeId = relationshipFamiliarityEpisodeId(currentPerson.id, consultedPerson.id, occasionId, 'assignment_consultation');
      if (!familiarityEpisodes[episodeId]) {
        const recorded = addRelationshipFamiliarityEpisode(familiarityEpisodes, {
          id: episodeId, observerPersonId: currentPerson.id, subjectPersonId: consultedPerson.id,
          acquisitionMode: 'direct_interaction', interactionKind: 'assignment_consultation',
          occasionId, ...(matterId ? { matterId } : {}), contextId,
          stageContribution: 'acquainted', dayNumber: state.calendar.dayNumber,
          provenance: [{ kind: 'event', id: eventId }],
        }, {
          people: state.world.people, events, records: state.records.entries,
          matters: state.world.matters, currentDay: state.calendar.dayNumber,
        });
        if (!recorded.ok) return fail(state, 'assignment-activity-consultation-provenance-invalid', 'The consultation lacks valid person or Event provenance.');
        familiarityEpisodes = recorded.episodes;
      }
    }

    return succeed({
      ...state,
      actionEconomy: { ...state.actionEconomy, apRemaining: state.actionEconomy.apRemaining - activityAction.apCost },
      world: { ...state.world, events, relationshipFamiliarityEpisodes: familiarityEpisodes },
      opportunities: { ...state.opportunities, assignments: { ...state.opportunities.assignments,
        [offer.id]: { ...offer, activityProgress: nextProgress } } },
    }, 'assignment-activity-action-completed', activityAction.successMessage ?? activityAction.label + ' completed.');
  }
  if (action.type === 'UPDATE_ASSIGNMENT_ACTIVITY_DRAFT') {
    const draft = normalizeActivityDraft(action.draft);
    const nextProgress = { ...progress, draft };
    if (!validateAssignmentActivityProgress(definition, nextProgress)) return fail(state, 'assignment-activity-draft-invalid', 'The report draft contains an unavailable citation or recommendation.');
    return succeed({ ...state, opportunities: { ...state.opportunities, assignments: { ...state.opportunities.assignments,
      [offer.id]: { ...offer, activityProgress: nextProgress } } } }, 'assignment-activity-draft-updated', 'The inspection report draft was updated.');
  }
  const cost = definition.submissionApCost;
  if (state.actionEconomy.apRemaining < cost) return fail(state, 'insufficient-ap', `Submission costs ${cost} AP.`);
  if (offer.activityId === NORTH_BAY_POST_EXECUTION_ACTIVITY_ID) {
    return submitNorthBayPostExecutionInspection(state, offer, definition, progress)
      ?? fail(state, 'assignment-activity-resolver-missing', 'No post-execution inspection resolver is registered.');
  }
  if (definition.evaluation && offer.activityId?.startsWith('activity-era1-')) {
    return submitRubricAssignmentActivity(state, offer, definition, progress)
      ?? fail(state, 'assignment-activity-resolver-missing', 'No rubric-based report resolver is registered.');
  }
  if (offer.activityId !== NORTH_BAY_ACTIVITY_ID) {
    return submitUrukAssignmentActivity(state, offer, definition, progress)
      ?? fail(state, 'assignment-activity-resolver-missing', 'No report resolver is registered for this interactive Assignment.');
  }
  const draft = progress.draft;
  const roofObserved = progress.discoveryIds.includes('roof-inspection');
  const roofCited = draft.citedDiscoveryIds.includes('roof-inspection');
  const assessment = evaluateAssignmentAssessment(definition, progress);
  if (!assessment || !definition.evaluation) return fail(state, 'assignment-activity-rubric-invalid', 'The North-Bay inspection has no valid authored evaluation.');
  const unsupportedCertification = draft.finding === 'repair_appears_sound'
    || (draft.finding === 'repair_incomplete' && (!roofObserved || !roofCited));
  const overclaims = assessment === 'Overreached';
  const incompleteReport = assessment === 'Incomplete';
  const qualified = assessment === 'Thorough' || assessment === 'Defensible';
  const selectedLimitations = (draft.selectedLimitationIds ?? []).flatMap((id) => {
    const option = definition.reportSchema.limitationOptions?.find((item) => item.id === id);
    return option ? [{ id, label: option.label }] : [];
  });
  const discoveries = definition.discoveries.filter((item) => progress.discoveryIds.includes(item.id));
  const sources = [
    ...(offer.sourceRecordId ? [{ id: 'source-storehouse-reckoning', kind: 'other' as const, sourceId: offer.sourceRecordId, description: 'Storehouse Reckoning record that generated this roof-verification Assignment' }] : []),
    { id: 'source-player-report', kind: 'other' as const, description: 'Submitted inspection report by the current scribe' },
    ...discoveries.flatMap((item) => {
      const personId = item.id === 'steward-briefing' ? NORTH_BAY_PEOPLE.steward
        : item.id === 'repairer-scope' || item.id === 'scope-comparison' ? NORTH_BAY_PEOPLE.repairer
        : item.id === 'intake-boundary' ? NORTH_BAY_PEOPLE.receivingOfficial : undefined;
      const primary = { id: `source-${item.id}`, kind: personId ? 'person' as const : 'other' as const,
        ...(personId ? { sourceId: personId } : {}), description: item.id === 'roof-inspection' ? `Direct physical inspection by ${state.world.people[state.player.currentCharacterId]?.name ?? 'the current scribe'}` : item.title };
      return item.id === 'scope-comparison' ? [primary, { id: 'source-steward-maintenance-note', kind: 'person' as const,
        sourceId: NORTH_BAY_PEOPLE.steward, description: 'Ur-Nanna’s storehouse maintenance note describing the bay as repaired' }] : [primary];
    }),
  ];
  const cited = new Set(draft.citedDiscoveryIds);
  const assertions: RecordAssertion[] = discoveries.filter((item) => cited.has(item.id)).map((item) => ({
    id: `assertion-${item.id}`, text: item.text,
    classification: item.id === 'roof-inspection' ? 'observed' as const : 'reported' as const,
    sourceIds: item.id === 'scope-comparison' ? ['source-scope-comparison','source-steward-maintenance-note'] : [`source-${item.id}`],
  }));
  if (draft.finding === 'repair_incomplete' && roofObserved && roofCited) assertions.push({
    id: 'assertion-inspection-conclusion',
    text: 'The inspected repair is incomplete: the parapet runoff channel remains obstructed and the north-east beam socket remains damp.',
    classification: 'inferred' as const, sourceIds: ['source-roof-inspection'],
  });
  if (unsupportedCertification) assertions.push({ id: 'assertion-unsupported-certification',
    text: draft.finding === 'repair_appears_sound' ? 'The report certifies that the roof repair appears sound despite the absence of a physical inspection of the roof and shaded beam socket.' : draft.finding === 'repair_incomplete' ? 'The report concludes that the repair is incomplete without citing the physical inspection needed to support that conclusion.' : 'The report presents the repair as complete without the physical inspection required to support that conclusion.',
    classification: 'disputed' as const, sourceIds: ['source-player-report'],
  });
  if (draft.responsibilityClaim === 'dudu') assertions.push({
    id: 'assertion-responsibility-claim', text: 'The report attributes the unresolved parapet and beam work to Dudu, although the recorded contract scope does not establish that he was responsible for those items.',
    classification: 'disputed' as const, sourceIds: sources.some((source) => source.id === 'source-repairer-scope') ? ['source-repairer-scope'] : ['source-player-report'],
  });
  assertions.push({
    id: 'assertion-report-disposition',
    text: `Finding: ${definition.reportSchema.findings.find((option) => option.id === draft.finding)?.label ?? draft.finding}; responsibility: ${definition.reportSchema.responsibilityClaims.find((option) => option.id === draft.responsibilityClaim)?.label ?? draft.responsibilityClaim}.`,
    classification: overclaims ? 'disputed' as const : 'reported' as const, sourceIds: ['source-player-report'],
  });
  for (const item of selectedLimitations) assertions.push({
    id: `assertion-selected-limitation-${item.id}`, text: `Player-selected limitation: ${item.label}`,
    classification: 'reported' as const, sourceIds: ['source-player-report'],
  });
  if (draft.limitationNotes?.trim()) assertions.push({
    id: 'assertion-limitation-note', text: `Ungraded player note: ${draft.limitationNotes.trim()}`,
    classification: 'reported' as const, sourceIds: ['source-player-report'],
  });
  draft.limitations.filter(Boolean).forEach((note, index) => assertions.push({
    id: `assertion-legacy-limitation-${index}`, text: `Legacy free-text limitation (ungraded): ${note}`,
    classification: 'reported' as const, sourceIds: ['source-player-report'],
  }));
  if (draft.finding === 'insufficient_evidence') assertions.push({
    id: 'assertion-inspection-limits',
    text: 'The available inspection was insufficient to certify the full roof condition.',
    classification: 'observed' as const, sourceIds: ['source-player-report'],
  });
  const recordId = `record-${offer.id}-day-${state.calendar.dayNumber}` as RecordId;
  if (state.records.entries[recordId]) return fail(state, 'assignment-activity-record-exists', 'A record already exists for this deterministic submission ID.');
  const record: RecordEntry = {
    id: recordId, createdDay: state.calendar.dayNumber, authorPersonId: state.player.currentCharacterId,
    institutionId: STOREHOUSE, title: 'North-Bay Roof Inspection Report', sources, assertions,
    uncertaintyLimits: [
      ...(definition.submissionNote ? [`System caveat: ${definition.submissionNote}`] : []),
      ...(!roofObserved ? ['System caveat: The roof and shaded beam socket were not physically inspected.'] : []),
      'System caveat: The seven sealed pottery storage jars were observed in segregation only; the grain inside was not tested.',
      'System caveat: This report does not authorize building expenditure, stock release, or assignment of individual responsibility.',
    ],
    amendments: [],
  };
  const holders = [
    { kind: 'person' as const, id: NORTH_BAY_PEOPLE.steward },
    { kind: 'person' as const, id: NORTH_BAY_PEOPLE.seniorScribe },
    { kind: 'institution' as const, id: STOREHOUSE },
    ...(progress.consultedPersonIds.includes(NORTH_BAY_PEOPLE.repairer) ? [{ kind: 'person' as const, id: NORTH_BAY_PEOPLE.repairer }] : []),
  ];
  const knowledge = holders.map((holder) => ({
    id: `knowledge-${offer.id}-day-${state.calendar.dayNumber}-${holder.kind}-${holder.id}` as KnowledgeEntryId,
    holder, subject: { kind: 'record' as const, id: recordId }, basis: 'received-copy' as const,
    learnedDay: state.calendar.dayNumber, sourcePersonId: state.player.currentCharacterId,
    assertion: { kind: 'fact' as const, text: 'Received a copy of the submitted roof inspection report.' }, assessments: [],
  }));
  const institution = state.world.institutions[STOREHOUSE];
  const person = state.world.people[state.player.currentCharacterId];
  const scribal = getInitializedScribal(person);
  if (!institution || !person || !scribal) return fail(state, 'assignment-activity-world-invalid', 'The report recipient or current character is unavailable.');
  const roofMatter = state.world.matters[MATTER_IDS.roofRepair] ?? createRoofRepairMatter(state.calendar.dayNumber, recordId);
  const roofSummary = incompleteReport || !roofObserved ? 'North-bay roof inspection incomplete; full roof condition remains unverified.' : unsupportedCertification ? 'Roof repair certified without sufficient supporting inspection; physical condition remains unverified.' : draft.finding === 'repair_incomplete' ? 'Clear north-bay parapet runoff channel and assess the damp north-east beam socket.' : 'North-bay roof repair inspected; continue monitoring after heavy rain.';
  const updatedRoofMatter = { ...roofMatter, summary: roofSummary, sourceRecordId: recordId, status: 'active' as const };
  const addHeldBarleyMatter = draft.recommendations.includes('inspect_held_barley') && progress.discoveryIds.includes('roof-inspection');
  const heldBarleyMatter = { id: MATTER_IDS.heldBarley, institutionId: STOREHOUSE, kind: 'held_barley_inspection' as const, summary: 'Seven sealed pottery storage jars containing held barley remain segregated; grain condition has not yet been assessed.', status: 'active' as const, createdDay: state.calendar.dayNumber, sourceRecordId: recordId, locationId: roofMatter.locationId };
  const activeMatters = [...new Set([...institution.activeMatters, MATTER_IDS.roofRepair, ...(addHeldBarleyMatter ? [MATTER_IDS.heldBarley] : [])])];
  const findingLabel = definition.reportSchema.findings.find((option) => option.id === draft.finding)?.label ?? draft.finding;
  const reaction = definition.evaluation.reactions[assessment]
    .replaceAll('{finding}', findingLabel)
    .replaceAll('{responsibility}', definition.reportSchema.responsibilityClaims.find((option) => option.id === draft.responsibilityClaim)?.label ?? draft.responsibilityClaim);
  const evaluated = applyClosingAssessment(state, {
    receiptId: `assignment-receipt-${offer.id}-day-${state.calendar.dayNumber}`,
    title: offer.title, disposition: findingLabel, assessment,
    rationale: definition.evaluation.rationales[assessment], reaction,
    baseCareerXp: offer.careerXpReward, institutionId: STOREHOUSE,
    receiverPersonId: definition.evaluation.receiverPersonId,
    contextId: offer.activityId ?? offer.category, occasionId: state.world.matters[MATTER_IDS.roofRepair] ? `${MATTER_IDS.roofRepair}:${offer.activityId ?? offer.category}` : offer.id,
    ...(state.world.matters[MATTER_IDS.roofRepair] ? { matterId: MATTER_IDS.roofRepair } : {}),
    currencyDelta: offer.compensation.money, provisionsDelta: offer.compensation.provisions,
    ...(offer.compensation.money || offer.compensation.provisions
      ? { compensationTiming: 'Contracted compensation is payable in full at preliminary Day-Close, regardless of assessment.' } : {}),
  });
  if (!evaluated) return fail(state, 'assignment-activity-outcome-invalid', 'The Closing Receipt could not be applied to the current character.');
  const completedOffer = { ...offer, status: 'completed' as const, activityProgress: progress,
    closingReceipt: evaluated.receipt, receiptAcknowledged: false };
  let next: GameState = {
    ...evaluated.state,
    actionEconomy: { ...evaluated.state.actionEconomy, apRemaining: evaluated.state.actionEconomy.apRemaining - cost },
    world: { ...evaluated.state.world,
      institutions: { ...evaluated.state.world.institutions, [STOREHOUSE]: { ...institution, activeMatters } },
      matters: { ...evaluated.state.world.matters, [MATTER_IDS.roofRepair]: updatedRoofMatter, ...(addHeldBarleyMatter ? { [MATTER_IDS.heldBarley]: heldBarleyMatter } : {}) },
      knowledge: { ...evaluated.state.world.knowledge, ...Object.fromEntries(knowledge.map((item) => [item.id, item])) } },
    records: { ...evaluated.state.records, entries: { ...evaluated.state.records.entries, [recordId]: record } },
    opportunities: { ...evaluated.state.opportunities, assignments: { ...evaluated.state.opportunities.assignments, [offer.id]: completedOffer } },
  };
  next = queueSettlementCredit(next, {
    id: 'assignment:' + offer.id + ':' + state.calendar.dayNumber,
    source: { kind: 'assignment', id: offer.id }, earnedDay: state.calendar.dayNumber,
    money: offer.compensation.money, provisions: offer.compensation.provisions,
  });
  next = addActivity(next, completedOffer, 'completed');
  return succeed(next, 'assignment-activity-submitted', `The report was filed and a ${assessment} Closing Receipt is ready for review.`);
}
