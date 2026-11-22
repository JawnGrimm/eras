import type { AssignmentId, PersonId, RecordId } from '../state/ids';
import type { AssignmentOffer, GameState, TransitionResult } from '../state/types';
import { ASSIGNMENT_ACTIVITY_CATALOG } from '../content/assignments/northBayRoofInspection';
import { MATTER_IDS } from './institutionalMatters';
import { transitionOpportunityAction } from './opportunities';

const STOREHOUSE = 'institution-uruk-temple-storehouse';
const STEWARD = 'person-ur-nanna' as PersonId;
const CARRIER = 'person-enlil-kisu' as PersonId;

interface Candidate {
  activityId: string;
  slug: string;
  category: string;
  estimatedTotalAp: number;
  title: string;
  description: string;
  context: AssignmentOffer['context'];
  compensation: AssignmentOffer['compensation'];
  careerXpReward: number;
  difficulty: AssignmentOffer['difficulty'];
  deliveryChannels: AssignmentOffer['deliveryChannels'];
  sourceRecordId?: RecordId;
  requiresHeldMatter?: boolean;
}

const candidates: Candidate[] = [
  {
    activityId: 'activity-held-barley-inspection',
    slug: 'held-barley',
    category: 'held_barley_inspection',
    estimatedTotalAp: 5,
    title: 'Held-Barley Inspection',
    description: 'Inspect the seven physical sacks containing the seven held capacity measures. Report exterior condition separately from the untested grain within; submit a finding and recommendation, not a release order.',
    context: {
      what: 'Inspect segregated held barley containers and prepare a finding and recommendation.',
      who: ['Ur-Nanna, Storehouse Steward', 'Utu-mansum, Receiving Official', 'Shuruppak-ilu, Senior Scribe'],
      quantity: 'Seven held capacity measures contained in seven physical sacks; two sacks show exterior damp-staining/crusting and five are surface-dry.',
      when: 'Following the north-bay leak and the current held-stock recount, during harvest preparation.',
      where: 'Temple Storehouse, north storage bay, on reed matting.',
      from: 'The segregated stock and its prior administrative intake/recount records.',
      to: 'Ur-Nanna, with a copy for Shuruppak-ilu.',
      purpose: 'Establish container condition and recommend whether sampling, continued segregation, or a proposed disposition is warranted.',
      responsibility: ['The scribe records observations and limitations; Ur-Nanna or Shuruppak-ilu retains formal stock-release authority.'],
      authority: 'The Assignment authorizes inspection and reporting only; it does not authorize sampling, release, cleaning, destruction, or issue.',
      provenance: ['North-Bay Roof Inspection Report and active held-barley institutional matter', 'Immutable capacity record ev-04 (4 measures held at intake)', 'Immutable capacity record ev-07 (7 measures held at recount)'],
    },
    compensation: { money: 15, provisions: 1 }, careerXpReward: 25, difficulty: 'demanding',
    deliveryChannels: [{ kind: 'baseline_reach', explanation: 'The Storehouse Steward has asked the junior scribe who filed the north-bay report to inspect the segregated stock.' }],
    requiresHeldMatter: true,
  },
  {
    activityId: 'activity-south-court-delivery-reconciliation',
    slug: 'south-court-delivery',
    category: 'delivery_reconciliation',
    estimatedTotalAp: 4,
    title: 'South-Court Delivery Reconciliation',
    description: 'Compare the carrier dispatch tablet with the receiving tally. Establish the one-measure discrepancy without assuming where it occurred or who is responsible.',
    context: {
      what: 'Reconcile a delivery dispatch quantity against the receiving count.',
      who: ['Ur-Nanna, Storehouse Steward', 'Utu-mansum, Receiving Official', 'Enlil-kisu, Carrier Foreman'],
      quantity: '24 standard capacity measures dispatched; 23 counted at intake; discrepancy of one measure.',
      when: 'Before the next storehouse tally, following the recorded delivery.',
      where: 'Temple Storehouse, south receiving court and tablet room; dispatch originated at the canal-side holding yard.',
      from: 'Carrier dispatch tablet attributed to Enlil-kisu.',
      to: 'Temple Storehouse stock account and Shuruppak-ilu’s review.',
      purpose: 'Preserve the dispatch and receipt figures, identify what is and is not established, and recommend a further record check or qualified closure.',
      responsibility: ['The scribe reconciles the records; Enlil-kisu is a consultable witness, not a presumed culprit; Utu-mansum attests only to the receiving count.'],
      authority: 'The scribe may report the discrepancy but may not silently amend the institutional account or assign liability.',
      provenance: ['Surviving carrier dispatch copy', 'Utu-mansum receiving tally', 'Witness testimony is separately attributed and does not replace the tablets.'],
    },
    compensation: { money: 12, provisions: 1 }, careerXpReward: 20, difficulty: 'demanding',
    deliveryChannels: [{ kind: 'relationship', personId: CARRIER, explanation: 'Enlil-kisu’s dispatch copy is being compared with the Temple Storehouse receiving tally.' }],
  },
  {
    activityId: 'activity-south-loading-awning-inspection',
    slug: 'south-loading-awning',
    category: 'institutional_maintenance',
    estimatedTotalAp: 3,
    title: 'South Loading-Awning Inspection',
    description: 'Inspect the south loading awning’s reed ties, support posts, and threshold conditions. Report the observed condition without treating the inspection as repair authorization.',
    context: {
      what: 'Inspect the condition of the south loading awning and prepare a maintenance report.',
      who: ['Ur-Nanna, Storehouse Steward', 'Dudu, contracted repairer (consulted only on commission scope)'],
      quantity: 'One loading awning; two visibly frayed reed ties; two inspected support posts.',
      when: 'Before the next period of heavy loading.',
      where: 'Temple Storehouse, south loading court.',
      from: 'Ur-Nanna’s inspection request and direct observation of the structure.',
      to: 'Ur-Nanna and Shuruppak-ilu.',
      purpose: 'Identify visible maintenance concerns and recommend inspection, monitoring, or a separately authorized repair commission.',
      responsibility: ['The scribe observes and reports; the Steward decides whether to commission repairs; Dudu is responsible only for work within his recorded contract.'],
      authority: 'Inspection only. The existing Dudu commission covers the north-bay mid-bay patch and does not authorize south-awning work.',
      provenance: ['Direct physical observation of the ties, posts, and threshold', 'Dudu’s testimony about the scope of his existing commission'],
    },
    compensation: { money: 10, provisions: 1 }, careerXpReward: 15, difficulty: 'routine',
    deliveryChannels: [{ kind: 'baseline_reach', explanation: 'Ur-Nanna has asked a storehouse scribe to document the awning before further loading.' }],
  },
];

export function generateDailyAssignments(state: GameState): GameState {
  const ledger = state.opportunities.assignmentGeneratorLedger ?? { sequence: 0, lastPresentedDayByActivity: {} };
  let next: GameState = { ...state, opportunities: { ...state.opportunities, assignmentGeneratorLedger: ledger } };
  const openCount = () => Object.values(next.opportunities.assignments).filter((offer) => offer.status === 'offered' || offer.status === 'accepted').length;
  const heldMatter = next.world.matters[MATTER_IDS.heldBarley];
  const activeHeldMatter = heldMatter?.status === 'active';
  const rotated = [...candidates.slice(ledger.sequence % candidates.length), ...candidates.slice(0, ledger.sequence % candidates.length)];
  let offeredAp = 0;
  let sequence = ledger.sequence;
  const lastPresentedDayByActivity = { ...ledger.lastPresentedDayByActivity };

  for (const candidate of rotated) {
    if (offeredAp >= 8 || openCount() >= 4) break;
    if (candidate.requiresHeldMatter && !activeHeldMatter) continue;
    const lastDay = lastPresentedDayByActivity[candidate.activityId];
    if (lastDay !== undefined && next.calendar.dayNumber - lastDay < 3) continue;
    if (!ASSIGNMENT_ACTIVITY_CATALOG[candidate.activityId as keyof typeof ASSIGNMENT_ACTIVITY_CATALOG]) continue;
    const id = `assignment-auto-${candidate.slug}-day-${next.calendar.dayNumber}` as AssignmentId;
    if (next.opportunities.assignments[id]) continue;
    const offer: Omit<AssignmentOffer, 'offeredDay' | 'expiresDay' | 'status' | 'lapsedDuringMandatoryWork'> = {
      id, title: candidate.title, description: candidate.description,
      employer: { kind: 'person', id: STEWARD },
      ...(candidate.requiresHeldMatter && heldMatter?.sourceRecordId ? { sourceRecordId: heldMatter.sourceRecordId } : {}),
      category: candidate.category,
      context: candidate.context,
      requiredSkills: {},
      difficulty: candidate.difficulty,
      estimatedTotalAp: candidate.estimatedTotalAp,
      activityId: candidate.activityId,
      compensation: candidate.compensation,
      careerXpReward: candidate.careerXpReward,
      deliveryChannels: candidate.deliveryChannels,
    };
    const result: TransitionResult = transitionOpportunityAction(next, { type: 'PRESENT_ASSIGNMENT', offer });
    if (result.feedback?.kind === 'error') continue;
    next = result.state;
    offeredAp += candidate.estimatedTotalAp;
    sequence++;
    lastPresentedDayByActivity[candidate.activityId] = next.calendar.dayNumber;
  }

  return {
    ...next,
    opportunities: {
      ...next.opportunities,
      assignmentGeneratorLedger: { sequence, lastPresentedDayByActivity },
    },
  };
}
