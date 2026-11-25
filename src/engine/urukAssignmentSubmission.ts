import type { AssignmentOffer, AssignmentActivityProgress, GameState, TransitionResult, RecordEntry, RecordSource, RecordAssertion, KnowledgeEntry } from '../state/types';
import { getInitializedScribal } from '../state/scribalState';
import type { AssignmentId, InstitutionId, KnowledgeEntryId, MatterId, PersonId, RecordId } from '../state/ids';
import type { AssignmentActivityDefinition } from '../content/assignments/northBayRoofInspection';
import { addActivity } from './opportunities';
import { queueSettlementCredit } from './dayClose';
import { MATTER_IDS } from './institutionalMatters';

const STOREHOUSE = 'institution-uruk-temple-storehouse' as InstitutionId;
const STEWARD = 'person-ur-nanna' as PersonId;
const RECEIVER = 'person-utu-mansum' as PersonId;
const SENIOR = 'person-shuruppak-ilu' as PersonId;
const CARRIER = 'person-enlil-kisu' as PersonId;
const REPAIRER = 'person-dudu' as PersonId;

const fail = (state: GameState, code: string, message: string): TransitionResult => ({ state, feedback: { kind: 'error', code, message } });
const succeed = (state: GameState, message: string): TransitionResult => ({ state, feedback: { kind: 'success', code: 'assignment-activity-submitted', message } });

type ScenarioId = 'activity-held-barley-inspection' | 'activity-south-court-delivery-reconciliation' | 'activity-south-loading-awning-inspection' | 'activity-tierb-recurring-institutional-check';

function sourceFor(activityId: ScenarioId, discoveryId: string): RecordSource {
  const personSources: Record<string, PersonId> = {
    'tierb-authority-boundary': SENIOR,
    'held-steward-briefing': STEWARD, 'held-senior-authority': SENIOR,
    'delivery-dispatch-copy': CARRIER, 'delivery-arrival-tally': RECEIVER,
    'delivery-utu-testimony': RECEIVER, 'delivery-enlil-testimony': CARRIER,
    'awning-steward-request': STEWARD, 'awning-repair-scope': REPAIRER,
  };
  const description: Record<string, string> = {
    'held-container-observation': 'Direct visual observation of seven sealed pottery storage jars segregated on reed matting',
    'held-intake-record': 'Immutable administrative capacity record ev-04 (four measures held at intake)',
    'held-recount-record': 'Immutable administrative capacity record ev-07 (seven measures held at recount)',
    'delivery-route-inspection': 'Direct inspection of available route and handling points',
    'awning-physical-observation': 'Direct physical observation of the south loading awning and its supports',
  };
  const personId = personSources[discoveryId];
  return {
    id: `source-${discoveryId}`,
    kind: personId ? 'person' : discoveryId.includes('observation') || discoveryId.includes('inspection') ? 'material' : 'other',
    ...(personId ? { sourceId: personId } : {}),
    description: description[discoveryId] ?? discoveryId.replaceAll('-', ' '),
  };
}

function relationship(
  state: GameState,
  fromId: PersonId,
  toId: PersonId,
  trust: number,
  respect: number,
  summary: string,
): GameState['world']['relationships'] {
  const current = state.world.relationships[fromId]?.[toId];
  const dimensions = { trust: 50, respect: 50, affection: 50, resentment: 0, rivalry: 0, ...current?.dimensions };
  dimensions.trust = Math.max(0, Math.min(100, dimensions.trust + trust));
  dimensions.respect = Math.max(0, Math.min(100, dimensions.respect + respect));
  return {
    ...state.world.relationships,
    [fromId]: {
      ...state.world.relationships[fromId],
      [toId]: {
        dimensions,
        history: [...(current?.history ?? []), {
          id: `assignment-${state.calendar.dayNumber}-${fromId}-${toId}-${(current?.history.length ?? 0) + 1}`,
          dayNumber: state.calendar.dayNumber,
          summary,
        }],
      },
    },
  };
}

export function submitUrukAssignmentActivity(
  state: GameState,
  offer: AssignmentOffer,
  definition: AssignmentActivityDefinition,
  progress: AssignmentActivityProgress,
): TransitionResult | null {
  const id = offer.activityId as ScenarioId | undefined;
  if (id !== 'activity-held-barley-inspection' && id !== 'activity-south-court-delivery-reconciliation' && id !== 'activity-south-loading-awning-inspection' && id !== 'activity-tierb-recurring-institutional-check') return null;
  const cost = definition.submissionApCost;
  if (state.actionEconomy.apRemaining < cost) return fail(state, 'insufficient-ap', `Submission costs ${cost} AP.`);
  const person = state.world.people[state.player.currentCharacterId];
  const institution = state.world.institutions[STOREHOUSE];
  const scribal = getInitializedScribal(person);
  if (!person || !scribal || !institution) return fail(state, 'assignment-activity-world-invalid', 'The current character or Temple Storehouse is unavailable.');

  const draft = progress.draft;
  const discoveries = definition.discoveries.filter((item) => progress.discoveryIds.includes(item.id));
  const cited = new Set(draft.citedDiscoveryIds);
  const sources: RecordSource[] = [
    { id: 'source-player-report', kind: 'other', description: 'Submitted finding and recommendation by the current scribe' },
    ...discoveries.filter((item) => cited.has(item.id)).map((item) => sourceFor(id, item.id)),
  ];
  if (id === 'activity-tierb-recurring-institutional-check' && offer.originMatterId && cited.has('tierb-counterparty-account')) {
    const counterpartyId = state.world.matters[offer.originMatterId]?.tierBRecurring?.counterpartyPersonId;
    const source = sources.find((item) => item.id === 'source-tierb-counterparty-account');
    if (counterpartyId && source) {
      source.kind = 'person';
      source.sourceId = counterpartyId;
      source.description = 'The actual counterparty named in this dated Tier B occurrence.';
    }
  }
  const assertions: RecordAssertion[] = discoveries.filter((item) => cited.has(item.id)).map((item) => ({
    id: `assertion-${item.id}`,
    text: item.text,
    classification: item.id.includes('observation') || item.id.includes('inspection') ? 'observed'
      : item.id.includes('testimony') || item.id.includes('briefing') || item.id.includes('authority') || item.id.includes('scope') ? 'reported' : 'observed',
    sourceIds: [`source-${item.id}`],
  }));
  const limitations = [...draft.limitations];
  const playerSource = 'source-player-report';
  let title = definition.reportSchema.title;
  let matterId: MatterId | undefined;
  let matterSummary = '';
  let overclaim = false;
  let relationshipChanges: Array<{ from: PersonId; to: PersonId; trust: number; respect: number; summary: string }> = [];
  let judgmentDelta = 2;

  if (id === 'activity-held-barley-inspection') {
    title = 'Held-Barley Finding and Recommendation';
    matterId = MATTER_IDS.heldBarley;
    matterSummary = 'Seven held capacity measures are contained in seven sealed pottery storage jars segregated on reed matting. A finding and recommendation have been filed; internal grain condition and formal release remain unresolved.';
    const visual = progress.discoveryIds.includes('held-container-observation');
    const visualCited = cited.has('held-container-observation');
    const internalCertification = draft.finding === 'grain_certified_sound' || draft.recommendations.includes('release_all');
    overclaim = internalCertification || (draft.finding === 'surface_condition_only' && (!visual || !visualCited));
    if (!visual) limitations.push('The seven sealed pottery storage jars were not visually inspected.');
    limitations.push('The seven held measures in ev-07 are a capacity tally; the seven sealed pottery storage jars are a separate container observation.');
    limitations.push('Exterior surface dryness or staining does not establish internal grain soundness. Sampling, coring, or opening a jar is required.');
    limitations.push('This scribal finding is a recommendation only. It does not authorize release, cleaning, destruction, or issue of stock.');
    if (draft.recommendations.includes('release_five_retain_two')) assertions.push({
      id: 'assertion-recommended-five-sacks', text: 'The scribe recommends that the Steward consider releasing five surface-dry jars while retaining two externally stained jars for authorized sampling or cleaning; this is not a release order.',
      classification: 'inferred', sourceIds: [playerSource],
    });
    if (overclaim) assertions.push({
      id: 'assertion-unsupported-grain-certification', text: 'The report certifies internal grain condition or recommends release without evidence from sampling, coring, or opening the jars.',
      classification: 'disputed', sourceIds: [playerSource],
    });
    if (progress.consultedPersonIds.includes(STEWARD)) relationshipChanges.push({ from: state.player.currentCharacterId, to: STEWARD, trust: overclaim ? -4 : 2, respect: overclaim ? -3 : 1, summary: overclaim ? 'The Steward received a stock recommendation that exceeded the physical examination.' : 'The Steward received a qualified, source-aware finding that preserves release authority.' });
  } else if (id === 'activity-south-court-delivery-reconciliation') {
    title = 'South-Court Delivery Reconciliation';
    matterId = MATTER_IDS.southCourtDelivery;
    matterSummary = 'The dispatch tablet records 24 measures and the receiving tally records 23. The one-measure discrepancy remains unresolved; cause and responsibility are not established.';
    const blamed = draft.responsibilityClaim === 'enlil_kisu' || draft.finding === 'blame_carrier';
    const routeInspected = progress.discoveryIds.includes('delivery-route-inspection') && cited.has('delivery-route-inspection');
    overclaim = blamed;
    limitations.push('The dispatch record and arrival tally establish 24 dispatched and 23 received, a one-measure discrepancy.');
    limitations.push('The records do not establish whether the difference arose at dispatch, in transit, through carrier rations, or at the dock.');
    if (!routeInspected) limitations.push('The route and handling points were not inspected.');
    if (blamed) assertions.push({
      id: 'assertion-carrier-responsibility', text: 'The report attributes the one-measure discrepancy to Carrier Foreman Enlil-kisu without evidence establishing where or how the measure was lost.',
      classification: 'disputed', sourceIds: [playerSource],
    });
    else assertions.push({
      id: 'assertion-unlocated-discrepancy', text: 'The dispatch copy records 24 measures and the receiving tally records 23; the discrepancy is recorded without assigning cause or individual responsibility.',
      classification: 'inferred', sourceIds: [...(cited.has('delivery-dispatch-copy') ? ['source-delivery-dispatch-copy'] : []), ...(cited.has('delivery-arrival-tally') ? ['source-delivery-arrival-tally'] : [])],
    });
    relationshipChanges.push({
      from: state.player.currentCharacterId, to: CARRIER,
      trust: blamed ? (routeInspected ? -3 : -6) : 1,
      respect: blamed ? (routeInspected ? -2 : -5) : 1,
      summary: blamed ? 'The scribe assigned the shortage to Enlil-kisu without evidence locating the loss.' : 'The scribe preserved the dispatch/receipt discrepancy without assigning unsupported blame.',
    });
    if (progress.consultedPersonIds.includes(CARRIER)) relationshipChanges.push({
      from: CARRIER, to: state.player.currentCharacterId,
      trust: blamed ? -4 : 2, respect: blamed ? -3 : 1,
      summary: blamed ? 'Enlil-kisu resented an unsupported attribution in the reconciliation.' : 'Enlil-kisu recognized that his dispatch account was recorded separately from the receiving tally.',
    });
    judgmentDelta = blamed ? -4 : 3;
  } else if (id === 'activity-tierb-recurring-institutional-check') {
    matterId = offer.originMatterId;
    if (!matterId) return fail(state, 'tierb-matter-missing', 'This recurring Assignment has no source matter.');
    const recurringMatter = state.world.matters[matterId];
    const recurring = recurringMatter?.tierBRecurring;
    if (!recurringMatter || !recurring) return fail(state, 'tierb-source-missing', 'The dated Tier B source facts are unavailable.');
    title = `${offer.title} report`;
    matterSummary = recurringMatter.summary;
    const assignsBlame = draft.responsibilityClaim === 'assign_responsibility' || draft.finding === 'assign_responsibility';
    overclaim = assignsBlame;
    limitations.push('The source and receiving/check records establish only their own dated count or observation.');
    limitations.push('The occurrence does not establish individual responsibility; any difference remains bounded to the cited records.');
    if (assignsBlame) assertions.push({
      id: 'assertion-tierb-unsupported-responsibility',
      text: `The report assigns responsibility to ${recurring.counterpartyName}, although the dated source facts do not establish individual responsibility.`,
      classification: 'disputed', sourceIds: [playerSource],
    });
    else assertions.push({
      id: 'assertion-tierb-recorded-outcome',
      text: recurring.outcomeShape === 'reconciled'
        ? `The cited dated records reconcile: ${recurring.quantitySummary} The source categories and units are preserved.`
        : `The cited dated records show a bounded difference or condition: ${recurring.quantitySummary} Its cause and individual responsibility are not established.`,
      classification: 'inferred',
      sourceIds: [...cited].map((discoveryId) => `source-${discoveryId}`),
    });
    if (progress.consultedPersonIds.includes(recurring.counterpartyPersonId)) relationshipChanges.push({
      from: state.player.currentCharacterId, to: recurring.counterpartyPersonId,
      trust: assignsBlame ? -4 : 2, respect: assignsBlame ? -3 : 1,
      summary: assignsBlame ? 'The scribe assigned responsibility beyond the dated source facts.' : 'The scribe preserved the counterparty’s dated account without assigning unsupported blame.',
    });
    judgmentDelta = assignsBlame ? -4 : 3;
  } else {
    title = 'South Loading-Awning Condition Report';
    matterId = MATTER_IDS.southLoadingAwning;
    matterSummary = 'The south loading awning has two visibly frayed reed ties. The two inspected support posts remain upright; cause of threshold pooling and full structural condition remain unresolved.';
    const observed = progress.discoveryIds.includes('awning-physical-observation') && cited.has('awning-physical-observation');
    overclaim = draft.finding === 'structure_certified_sound' || draft.responsibilityClaim === 'dudu' || (draft.finding === 'ties_frayed_posts_upright' && !observed);
    limitations.push('Only two support posts and the visible ties were inspected; the full awning structure was not certified.');
    limitations.push('Water pooling beside the threshold was observed, but its cause was not established.');
    limitations.push('The existing Dudu commission covered the north-bay mid-bay patch, not the south loading awning. This report does not authorize repair.');
    if (overclaim) assertions.push({ id: 'assertion-awning-overclaim', text: 'The report certifies the full structure or attributes its condition to Dudu beyond the scope of the existing commission.', classification: 'disputed', sourceIds: [playerSource] });
    if (progress.consultedPersonIds.includes(REPAIRER)) relationshipChanges.push({
      from: state.player.currentCharacterId, to: REPAIRER, trust: overclaim ? -4 : 1, respect: overclaim ? -3 : 1,
      summary: overclaim ? 'The scribe attributed south-awning condition beyond Dudu’s recorded commission.' : 'The scribe recorded the boundary of Dudu’s north-bay commission accurately.',
    });
  }

  if (!sources.some((source) => source.id === playerSource)) sources.push({ id: playerSource, kind: 'other', description: 'Submitted report by the current scribe' });
  const recordId = `record-${offer.id}-day-${state.calendar.dayNumber}` as RecordId;
  if (state.records.entries[recordId]) return fail(state, 'assignment-activity-record-exists', 'A report record already exists for this deterministic submission ID.');
  const record: RecordEntry = {
    id: recordId, createdDay: state.calendar.dayNumber, authorPersonId: person.id, institutionId: STOREHOUSE,
    title, sources, assertions, uncertaintyLimits: [...new Set(limitations)], amendments: [],
  };
  const holders: KnowledgeEntry[] = [
    STEWARD, SENIOR, STOREHOUSE,
    ...(progress.consultedPersonIds.includes(RECEIVER) ? [RECEIVER] : []),
    ...(progress.consultedPersonIds.includes(CARRIER) ? [CARRIER] : []),
    ...(progress.consultedPersonIds.includes(REPAIRER) ? [REPAIRER] : []),
  ].map((holder) => ({
    id: `knowledge-${offer.id}-day-${state.calendar.dayNumber}-${holder}` as KnowledgeEntryId,
    holder: holder === STOREHOUSE ? { kind: 'institution' as const, id: STOREHOUSE } : { kind: 'person' as const, id: holder as PersonId },
    subject: { kind: 'record' as const, id: recordId }, basis: 'received-copy' as const,
    learnedDay: state.calendar.dayNumber, sourcePersonId: person.id,
    assertion: { kind: 'fact' as const, text: 'Received a copy of the submitted storehouse report.' }, assessments: [],
  }));

  let relationships = state.world.relationships;
  for (const change of relationshipChanges) {
    const partial = relationship({ ...state, world: { ...state.world, relationships } }, change.from, change.to, change.trust, change.respect, change.summary);
    relationships = partial;
  }
  const updatedPerson = { ...person, scribal: {
    ...scribal, careerXp: scribal.careerXp + offer.careerXpReward,
    professionalReputation: { ...scribal.professionalReputation, judgment: Math.max(0, Math.min(100, scribal.professionalReputation.judgment + judgmentDelta)) },
    institutionalStanding: { ...scribal.institutionalStanding, [STOREHOUSE]: Math.max(0, Math.min(100, (scribal.institutionalStanding[STOREHOUSE] ?? 50) + (overclaim ? -2 : 1))) },
  } };
  const matter = matterId ? state.world.matters[matterId] : undefined;
  const reportProvenanceId = `assignment-report-${recordId}`;
  const nextMatter = matterId ? {
    ...(matter ?? {
      id: matterId,
      institutionId: STOREHOUSE,
      kind: id === 'activity-held-barley-inspection' ? 'held_barley_inspection' as const
        : id === 'activity-south-court-delivery-reconciliation' ? 'south_court_delivery_reconciliation' as const
          : 'south_loading_awning_inspection' as const,
      summary: matterSummary,
      status: 'active' as const,
      createdDay: state.calendar.dayNumber,
    }),
    sourceRecordId: matter?.sourceRecordId ?? recordId,
    provenance: [
      ...(matter?.provenance ?? []).filter((source) => source.id !== reportProvenanceId),
      { id: reportProvenanceId, kind: 'record_copy' as const, sourceId: recordId, description: 'Scribal report filed in response to this institutional matter; filing does not itself resolve the matter.' },
    ],
  } : undefined;
  const activeMatters = matterId && nextMatter
    ? nextMatter.status === 'active'
      ? (institution.activeMatters.includes(matterId) ? institution.activeMatters : [...institution.activeMatters, matterId])
      : institution.activeMatters.filter((id) => id !== matterId)
    : institution.activeMatters;
  const next: GameState = {
    ...state,
    actionEconomy: { ...state.actionEconomy, apRemaining: state.actionEconomy.apRemaining - cost },
    world: {
      ...state.world,
      people: { ...state.world.people, [person.id]: updatedPerson },
      relationships,
      institutions: { ...state.world.institutions, [STOREHOUSE]: { ...institution, activeMatters } },
      matters: nextMatter ? { ...state.world.matters, [matterId as MatterId]: nextMatter } : state.world.matters,
      knowledge: { ...state.world.knowledge, ...Object.fromEntries(holders.map((item) => [item.id, item])) },
    },
    records: { ...state.records, entries: { ...state.records.entries, [recordId]: record } },
    opportunities: { ...state.opportunities, assignments: {
      ...state.opportunities.assignments, [offer.id]: { ...offer, status: 'completed', activityProgress: progress },
    } },
  };
  const queued = queueSettlementCredit(next, {
    id: 'assignment:' + offer.id + ':' + state.calendar.dayNumber,
    source: { kind: 'assignment', id: offer.id },
    earnedDay: state.calendar.dayNumber,
    money: offer.compensation.money,
    provisions: offer.compensation.provisions,
  });
  const logged = addActivity(queued, offer, 'completed');
  return succeed(logged, `The report was filed. ${overclaim ? 'Its unsupported claim is preserved as disputed.' : 'Its findings and limitations are preserved; no executive authority was exercised.'}`);
}
