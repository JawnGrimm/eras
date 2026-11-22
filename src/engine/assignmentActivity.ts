import type { GameAction, GameState, TransitionResult, AssignmentOffer } from '../state/types';
import { addActivity } from './opportunities';
import type { AssignmentId, KnowledgeEntryId, RecordId, InstitutionId } from '../state/ids';
import { NORTH_BAY_ACTIVITY_ID, NORTH_BAY_PEOPLE, ASSIGNMENT_ACTIVITY_CATALOG, validateAssignmentActivityProgress, normalizeActivityDraft } from '../content/assignments/northBayRoofInspection';

type ActivityAction = Extract<GameAction, { type: 'PERFORM_ASSIGNMENT_ACTIVITY_ACTION' | 'UPDATE_ASSIGNMENT_ACTIVITY_DRAFT' | 'SUBMIT_ASSIGNMENT_ACTIVITY' }>;
const fail = (state: GameState, code: string, message: string): TransitionResult => ({ state, feedback: { kind: 'error', code, message } });
const succeed = (state: GameState, code: string, message: string): TransitionResult => ({ state, feedback: { kind: 'success', code, message } });
const STOREHOUSE = 'institution-uruk-temple-storehouse' as InstitutionId;

function ownedOffer(state: GameState, id: AssignmentId): AssignmentOffer | undefined {
  const offer = state.opportunities.assignments[id];
  return offer?.status === 'accepted' && offer.activityId === NORTH_BAY_ACTIVITY_ID
    && offer.assigneePersonId === state.player.currentCharacterId ? offer : undefined;
}
export function transitionAssignmentActivityAction(state: GameState, action: ActivityAction): TransitionResult {
  const offer = ownedOffer(state, action.assignmentId);
  if (!offer?.activityProgress || !validateAssignmentActivityProgress(northBayRoofInspection, offer.activityProgress)) {
    return fail(state, 'assignment-activity-not-active', 'Only the current character’s accepted interactive Assignment can be advanced.');
  }
  const progress = offer.activityProgress;
  if (action.type === 'PERFORM_ASSIGNMENT_ACTIVITY_ACTION') {
    const definition = northBayRoofInspection.actions.find((item) => item.id === action.actionId);
    if (!definition || progress.completedActionIds.includes(action.actionId)) return fail(state, 'assignment-activity-action-invalid', 'This activity action is unavailable or already completed.');
    if ((definition.prerequisites ?? []).some((id) => !progress.completedActionIds.includes(id))) return fail(state, 'assignment-activity-prerequisite', 'A required activity action has not been completed.');
    if (state.actionEconomy.apRemaining < definition.apCost) return fail(state, 'insufficient-ap', `This action costs ${definition.apCost} AP.`);
    const nextProgress = {
      ...progress, completedActionIds: [...progress.completedActionIds, definition.id],
      discoveryIds: [...new Set([...progress.discoveryIds, ...definition.discoveryIds])],
      consultedPersonIds: definition.consultedPersonId
        ? [...new Set([...progress.consultedPersonIds, definition.consultedPersonId])]
        : progress.consultedPersonIds,
    };
    if (!validateAssignmentActivityProgress(northBayRoofInspection, nextProgress)) return fail(state, 'assignment-activity-progress-invalid', 'The action produced invalid activity progress.');
    return succeed({ ...state, actionEconomy: { ...state.actionEconomy, apRemaining: state.actionEconomy.apRemaining - definition.apCost },
      opportunities: { ...state.opportunities, assignments: { ...state.opportunities.assignments,
        [offer.id]: { ...offer, activityProgress: nextProgress } } } }, 'assignment-activity-action-completed', definition.label + ' completed.');
  }
  if (action.type === 'UPDATE_ASSIGNMENT_ACTIVITY_DRAFT') {
    const draft = normalizeActivityDraft(action.draft);
    const nextProgress = { ...progress, draft };
    if (!validateAssignmentActivityProgress(northBayRoofInspection, nextProgress)) return fail(state, 'assignment-activity-draft-invalid', 'The report draft contains an unavailable citation or recommendation.');
    return succeed({ ...state, opportunities: { ...state.opportunities, assignments: { ...state.opportunities.assignments,
      [offer.id]: { ...offer, activityProgress: nextProgress } } } }, 'assignment-activity-draft-updated', 'The inspection report draft was updated.');
  }
  const cost = northBayRoofInspection.submissionApCost;
  if (state.actionEconomy.apRemaining < cost) return fail(state, 'insufficient-ap', `Submission costs ${cost} AP.`);
  const draft = progress.draft;
  const roofObserved = progress.discoveryIds.includes('roof-inspection');
  const roofCited = draft.citedDiscoveryIds.includes('roof-inspection');
  const overclaims = draft.finding === 'repair_appears_sound'
    || (draft.finding === 'repair_incomplete' && (!roofObserved || !roofCited))
    || draft.responsibilityClaim === 'dudu';
  const qualified = draft.finding === 'insufficient_evidence' && draft.limitations.length > 0;
  const discoveries = northBayRoofInspection.discoveries.filter((item) => progress.discoveryIds.includes(item.id));
  const sources = [
    ...(offer.sourceRecordId ? [{ id: 'source-storehouse-reckoning', kind: 'other' as const, sourceId: offer.sourceRecordId, description: 'Storehouse Reckoning record that generated this roof-verification Assignment' }] : []),
    { id: 'source-player-report', kind: 'other' as const, description: 'Submitted inspection report by the current scribe' },
    ...discoveries.map((item) => {
    const personId = item.id === 'steward-briefing' ? NORTH_BAY_PEOPLE.steward
      : item.id === 'repairer-scope' || item.id === 'scope-comparison' ? NORTH_BAY_PEOPLE.repairer
      : item.id === 'intake-boundary' ? NORTH_BAY_PEOPLE.receivingOfficial : undefined;
    return { id: `source-${item.id}`, kind: personId ? 'person' as const : 'other' as const,
      ...(personId ? { sourceId: personId } : {}), description: item.id === 'roof-inspection' ? 'Direct physical inspection by Enlil-barni' : item.title };
  })];
  const cited = new Set(draft.citedDiscoveryIds);
  const assertions = discoveries.filter((item) => cited.has(item.id)).map((item) => ({
    id: `assertion-${item.id}`, text: item.text,
    classification: item.id === 'roof-inspection' ? 'observed' as const : 'reported' as const,
    sourceIds: [`source-${item.id}`],
  }));
  if (draft.finding === 'repair_incomplete' && roofObserved && roofCited) assertions.push({
    id: 'assertion-inspection-conclusion',
    text: 'The inspected repair is incomplete: the parapet runoff channel remains obstructed and the north-east beam socket remains damp.',
    classification: 'inferred' as const, sourceIds: ['source-roof-inspection'],
  });
  if (draft.responsibilityClaim === 'dudu') assertions.push({
    id: 'assertion-responsibility-claim', text: 'The report attributes the unresolved parapet and beam work to Dudu, although the recorded contract scope does not establish that he was responsible for those items.',
    classification: 'disputed' as const, sourceIds: sources.some((source) => source.id === 'source-repairer-scope') ? ['source-repairer-scope'] : ['source-player-report'],
  });
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
    uncertaintyLimits: [...draft.limitations, ...(!roofObserved ? ['The roof and shaded beam socket were not physically inspected.'] : []),
      'The seven held sacks were observed in segregation only; the grain inside was not tested.',
      'This report does not authorize building expenditure, stock release, or assignment of individual responsibility.'],
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
  }));
  const institution = state.world.institutions[STOREHOUSE];
  const person = state.world.people[state.player.currentCharacterId];
  if (!institution || !person?.scribal) return fail(state, 'assignment-activity-world-invalid', 'The report recipient or current character is unavailable.');
  let activeMatters = institution.activeMatters.filter((matter) => matter !== 'Verify north-bay roof repair');
  if (qualified || !roofObserved) activeMatters = [...activeMatters, 'Verify north-bay roof repair (inspection incomplete)'];
  else if (overclaims) activeMatters = [...activeMatters, 'Roof repair certified without sufficient supporting inspection; physical condition remains unverified'];
  else if (draft.finding === 'repair_incomplete') activeMatters = [...activeMatters, 'Clear north-bay parapet runoff channel and assess damp north-east beam socket'];
  else activeMatters = [...activeMatters, 'North-bay roof repair inspected; continue monitoring after heavy rain'];
  if (draft.recommendations.includes('inspect_held_barley') && progress.discoveryIds.includes('roof-inspection')) {
    activeMatters.push('Held-Barley Inspection recommended; seven sacks remain segregated, grain condition not yet assessed');
  }
  const reputationDelta = overclaims ? -6 : qualified ? 1 : 3;
  const relationshipChanges = [
    { target: NORTH_BAY_PEOPLE.steward, trust: overclaims ? -5 : qualified ? 1 : 3,
      summary: overclaims ? 'The Steward received a report that exceeded the available inspection evidence.' : 'The Steward received a qualified, traceable inspection report.' },
    ...(progress.consultedPersonIds.includes(NORTH_BAY_PEOPLE.repairer) ? [{ target: NORTH_BAY_PEOPLE.repairer,
      trust: overclaims ? -4 : 2, summary: 'The repairer was consulted and the limits of the contracted work were recorded.' }] : []),
  ];
  let relationships = { ...state.world.relationships };
  for (const change of relationshipChanges) {
    const current = relationships[state.player.currentCharacterId]?.[change.target];
    const dimensions = { trust: 50, respect: 50, affection: 50, resentment: 0, rivalry: 0, familiarity: 0, ...current?.dimensions };
    dimensions.trust = Math.max(0, Math.min(100, dimensions.trust + change.trust));
    const history = [...(current?.history ?? []), { id: `activity-${offer.id}-day-${state.calendar.dayNumber}-${change.target}`,
      dayNumber: state.calendar.dayNumber, summary: change.summary }];
    relationships = { ...relationships, [state.player.currentCharacterId]: { ...relationships[state.player.currentCharacterId],
      [change.target]: { dimensions, history } } };
  }
  const scribal = person.scribal;
  const updatedScribal = { ...scribal, careerXp: scribal.careerXp + offer.careerXpReward,
    wallet: { ...scribal.wallet, money: scribal.wallet.money + offer.compensation.money, provisions: scribal.wallet.provisions + offer.compensation.provisions },
    professionalReputation: { ...scribal.professionalReputation, judgment: Math.max(0, Math.min(100, scribal.professionalReputation.judgment + reputationDelta)) } };
  let next: GameState = {
    ...state, actionEconomy: { ...state.actionEconomy, apRemaining: state.actionEconomy.apRemaining - cost },
    world: { ...state.world, people: { ...state.world.people, [person.id]: { ...person, scribal: updatedScribal } },
      relationships, institutions: { ...state.world.institutions, [STOREHOUSE]: { ...institution, activeMatters } },
      knowledge: { ...state.world.knowledge, ...Object.fromEntries(knowledge.map((item) => [item.id, item])) } },
    records: { ...state.records, entries: { ...state.records.entries, [recordId]: record } },
    opportunities: { ...state.opportunities, assignments: { ...state.opportunities.assignments,
      [offer.id]: { ...offer, status: 'completed', activityProgress: progress } } },
  };
  next = addActivity(next, offer, 'completed');
  return succeed(next, 'assignment-activity-submitted',
    `The report was filed. ${overclaims ? 'Its unsupported certification may mislead the institution.' : qualified ? 'Its limitations remain explicit.' : 'The findings and follow-up are recorded.'}`);
}
