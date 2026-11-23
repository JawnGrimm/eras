import type { EventId, KnowledgeEntryId, RecordId } from '../state/ids';
import type { AssignmentActivityDefinition } from '../content/assignments/northBayRoofInspection';
import { NORTH_BAY_POST_EXECUTION_ACTIVITY_ID, NORTH_BAY_PEOPLE } from '../content/assignments/northBayRoofInspection';
import type { AssignmentActivityProgress, AssignmentOffer, GameState, RecordAssertion, RecordEntry, TransitionResult } from '../state/types';
import { addActivity } from './opportunities';
import { MATTER_IDS } from './institutionalMatters';

const STOREHOUSE = 'institution-uruk-temple-storehouse' as import('../state/ids').InstitutionId;
const fail = (state: GameState, code: string, message: string): TransitionResult => ({
  state, feedback: { kind: 'error', code, message },
});

/** Submit independent physical evidence for a separate, appointment-authorized NPC verification. */
export function submitNorthBayPostExecutionInspection(
  state: GameState,
  offer: AssignmentOffer,
  _definition: AssignmentActivityDefinition,
  progress: AssignmentActivityProgress,
): TransitionResult | null {
  if (offer.activityId !== NORTH_BAY_POST_EXECUTION_ACTIVITY_ID) return null;
  if (offer.originMatterId !== MATTER_IDS.roofRepair) {
    return fail(state, 'post-execution-matter-mismatch', 'This inspection Assignment is not linked to the North-Bay maintenance matter.');
  }
  const matter = state.world.matters[MATTER_IDS.roofRepair];
  const assignmentPrefix = 'assignment-auto-post-execution-';
  if (!offer.id.startsWith(assignmentPrefix)) {
    return fail(state, 'post-execution-assignment-id-invalid', 'This inspection Assignment is not linked to a specific execution.');
  }
  const executionEventId = offer.id.slice(assignmentPrefix.length) as EventId;
  const executionEvent = state.world.events[executionEventId];
  const execution = executionEvent?.institutionalResponse;
  if (!matter || matter.kind !== 'roof_repair_verification' || matter.institutionId !== STOREHOUSE
    || matter.status === 'resolved' || !executionEvent || execution?.stage !== 'execution'
    || execution.matterId !== matter.id || executionEvent.dayNumber > state.calendar.dayNumber
    || !execution.assigneePersonId || execution.assigneePersonId === state.player.currentCharacterId) {
    return fail(state, 'post-execution-inspection-unavailable', 'Independent inspection requires an unresolved matter and a recorded execution by another person.');
  }
  const observed = progress.discoveryIds.includes('post-execution-observation')
    && progress.draft.citedDiscoveryIds.includes('post-execution-observation');
  const reviewedExecution = progress.discoveryIds.includes('post-execution-record')
    && progress.draft.citedDiscoveryIds.includes('post-execution-record');
  if (!observed || !reviewedExecution) {
    return fail(state, 'post-execution-evidence-required', 'Inspect the completed work, review the execution record, and cite both sources before submitting.');
  }
  const finding = progress.draft.finding;
  const unsupportedFinding = finding === 'execution_not_confirmed' || finding === 'channel_obstructed';
  const unsupportedResponsibility = progress.draft.responsibilityClaim === 'aru';
  const playerId = state.player.currentCharacterId;
  const recordId = `record-${offer.id}-day-${state.calendar.dayNumber}` as RecordId;
  if (state.records.entries[recordId]) {
    return fail(state, 'post-execution-record-exists', 'An inspection record already exists for this Assignment and Workday.');
  }

  const sources = [
    ...(observed ? [{ id: 'source-independent-observation', kind: 'person' as const, sourceId: playerId,
      description: 'Direct physical inspection by the current scribe after the recorded execution.' }] : []),
    ...(reviewedExecution ? [{ id: 'source-execution-record', kind: 'other' as const, sourceId: executionEvent.id,
      description: 'The Steward’s recorded account of the assigned maintenance execution.' }] : []),
    ...(progress.discoveryIds.includes('post-execution-steward-request') ? [{
      id: 'source-steward-request', kind: 'person' as const, sourceId: NORTH_BAY_PEOPLE.steward,
      description: 'Ur-Nanna’s request and statement of inspection authority.' }] : []),
    { id: 'source-player-report', kind: 'other' as const, description: 'The submitted post-execution inspection report.' },
  ];
  const assertions: RecordAssertion[] = [];
  if (observed) assertions.push({
    id: 'assertion-independent-post-execution-observation',
    text: finding === 'channel_clear_beam_dry'
      ? 'The inspected north-bay runoff channel is clear. The shaded north-east beam socket appears dry at the time of inspection.'
      : finding === 'channel_obstructed'
        ? 'The inspected north-bay runoff channel remains obstructed after the recorded execution.'
        : finding === 'execution_not_confirmed'
          ? 'The inspection does not confirm the recorded execution.'
          : 'The inspected north-bay runoff channel is clear. The shaded north-east beam socket remains damp and requires a separate inspection after drying.',
    classification: 'observed',
    sourceIds: ['source-independent-observation'],
  });
  if (reviewedExecution) assertions.push({
    id: 'assertion-recorded-execution',
    text: execution.execution?.result ?? 'The execution record contains no detailed result.',
    classification: 'reported',
    sourceIds: ['source-execution-record'],
  });
  if (unsupportedFinding || unsupportedResponsibility) assertions.push({
    id: 'assertion-unsupported-post-execution-claim',
    text: unsupportedResponsibility
      ? 'The report assigns responsibility to the maintenance worker without evidence establishing fault.'
      : 'The report makes a claim about the completed execution that is not supported by the inspection actions recorded.',
    classification: 'disputed',
    sourceIds: ['source-player-report'],
  });

  const record: RecordEntry = {
    id: recordId,
    createdDay: state.calendar.dayNumber,
    authorPersonId: playerId,
    institutionId: STOREHOUSE,
    title: 'North-Bay Post-Execution Inspection Record',
    sources,
    assertions,
    uncertaintyLimits: [
      ...progress.draft.limitations,
      ...(!observed ? ['No independent physical inspection of the completed work was recorded.'] : []),
      'The observation is limited to the inspected runoff channel and shaded beam socket.',
      'The inspection does not certify the entire roof or establish that the beam joint has dried.',
      'This record supplies evidence for an appointed official; it does not itself verify, authorize, or resolve institutional action.',
    ],
    amendments: [],
  };

  const holders = [
    { kind: 'person' as const, id: NORTH_BAY_PEOPLE.steward },
    { kind: 'person' as const, id: NORTH_BAY_PEOPLE.seniorScribe },
    { kind: 'institution' as const, id: STOREHOUSE },
  ];
  const knowledge = holders.map((holder) => ({
    id: `knowledge-${offer.id}-day-${state.calendar.dayNumber}-${holder.kind}-${holder.id}` as KnowledgeEntryId,
    holder,
    subject: { kind: 'record' as const, id: recordId },
    basis: 'received-copy' as const,
    learnedDay: state.calendar.dayNumber,
    sourcePersonId: playerId,
  }));
  const institution = state.world.institutions[STOREHOUSE];
  const person = state.world.people[playerId];
  if (!institution || !person?.alive || !person.scribal) {
    return fail(state, 'post-execution-inspection-world-invalid', 'The current scribe or Storehouse recipient is unavailable.');
  }

  const provenanceId = `post-execution-inspection-${offer.id}-day-${state.calendar.dayNumber}`;
  const updatedMatter = {
    ...matter,
    provenance: [...(matter.provenance ?? []), {
      id: provenanceId,
      kind: 'observation' as const,
      sourceId: recordId,
      description: 'Independent post-execution inspection record submitted by the player.',
    }],
  };
  const scribal = person.scribal;
  const updatedPerson = {
    ...person,
    scribal: {
      ...scribal,
      careerXp: scribal.careerXp + offer.careerXpReward,
      wallet: {
        ...scribal.wallet,
        money: scribal.wallet.money + offer.compensation.money,
        provisions: scribal.wallet.provisions + offer.compensation.provisions,
      },
    },
  };
  const cost = _definition.submissionApCost;
  if (state.actionEconomy.apRemaining < cost) {
    return fail(state, 'insufficient-ap', 'The inspection report submission does not have enough AP.');
  }

  let next: GameState = {
    ...state,
    actionEconomy: { ...state.actionEconomy, apRemaining: state.actionEconomy.apRemaining - cost },
    world: {
      ...state.world,
      people: { ...state.world.people, [playerId]: updatedPerson },
      matters: { ...state.world.matters, [matter.id]: updatedMatter },
      knowledge: { ...state.world.knowledge, ...Object.fromEntries(knowledge.map((entry) => [entry.id, entry])) },
    },
    records: { ...state.records, entries: { ...state.records.entries, [recordId]: record } },
    opportunities: {
      ...state.opportunities,
      assignments: { ...state.opportunities.assignments,
        [offer.id]: { ...offer, status: 'completed', activityProgress: progress } },
    },
  };
  next = addActivity(next, offer, 'completed');
  return { state: next, feedback: { kind: 'success', code: 'assignment-activity-submitted',
    message: 'The independent inspection record was filed for institutional review.' } };
}
