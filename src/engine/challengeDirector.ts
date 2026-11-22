import type { ChallengeId } from '../state/ids';
import type { ChallengeInstance, ChallengeTriggerRule, GameState, OpportunityConsequences } from '../state/types';
import { evaluateChallengeTriggers, transitionOpportunityAction } from './opportunities';
import { MATTER_IDS } from './institutionalMatters';

const STOREHOUSE = 'institution-uruk-temple-storehouse';
const STEWARD = 'person-ur-nanna' as const;
const SENIOR = 'person-shuruppak-ilu' as const;
const CARRIER = 'person-enlil-kisu' as const;

/** Aggregate-based rule is evaluated against the compact counters and five-entry activity window. */
export const CHALLENGE_TRIGGER_RULES: ChallengeTriggerRule[] = [
  { id: 'challenge-missing-measure', category: 'delivery_reconciliation', minCompleted: 1, recentKinds: ['completed'], recentWindow: 5 },
];

function alreadyPresented(state: GameState, id: string): boolean {
  return !!state.opportunities.challenges[id as ChallengeId]
    || state.opportunities.challengeOutcomes.some((outcome) => outcome.challengeId === id);
}

function present(state: GameState, challenge: Omit<ChallengeInstance, 'status' | 'assigneePersonId'>): GameState {
  const result = transitionOpportunityAction(state, { type: 'PRESENT_CHALLENGE', challenge });
  return result.feedback?.kind === 'error' ? state : result.state;
}

function challengeEffects(careerXp: number, relationships: OpportunityConsequences['relationships'], standing = 0): OpportunityConsequences {
  return {
    careerXp,
    ...(relationships?.length ? { relationships } : {}),
    ...(standing ? { institutionalStanding: [{ institutionId: STOREHOUSE as never, delta: standing }] } : {}),
  };
}

function sevenSacks(state: GameState): GameState {
  const id = 'challenge-seven-sacks';
  if (alreadyPresented(state, id)) return state;
  const matter = state.world.matters[MATTER_IDS.heldBarley];
  const activeAndAged = !!matter && matter.status === 'active' && state.calendar.dayNumber - matter.createdDay >= 2;
  const incompleteReport = Object.values(state.opportunities.assignments).some((offer) =>
    offer.activityId === 'activity-held-barley-inspection' && offer.status === 'completed'
    && offer.activityProgress?.draft.finding === 'qualified_incomplete');
  if (!activeAndAged && !incompleteReport) return state;

  const player = state.player.currentCharacterId;
  const challenge = {
    id: id as ChallengeId,
    title: 'The Seven Sacks',
    description: 'Harvest pressure is increasing. Ur-Nanna asks what should be recommended for the seven held sacks. The physical inspection distinguishes two stained exteriors from five surface-dry sacks; none of the grain has been sampled. Your answer is a professional recommendation, not a release order.',
    category: 'held_barley_disposition',
    employer: { kind: 'person' as const, id: STEWARD as never },
    context: {
      what: 'Advise the Steward on the next responsible step for the seven held sacks.',
      who: ['Ur-Nanna, Storehouse Steward', 'Shuruppak-ilu, Senior Scribe'],
      quantity: 'Seven capacity measures in seven physical sacks; two exteriors stained/crusted and five surface-dry.',
      when: 'During harvest preparation, while the held-stock matter remains open.',
      where: 'Temple Storehouse, north storage bay.',
      from: 'The held-stock inspection report and direct container observation.',
      to: 'Ur-Nanna for an authorized stock decision.',
      purpose: 'Balance harvest pressure against the unresolved internal condition of the grain.',
      responsibility: ['The scribe recommends; the Steward or Senior Scribe decides whether stock may be released.'],
      authority: 'The Challenge does not grant stock-release authority and cannot itself release, clean, or destroy stock.',
      provenance: ['Seven-sack physical observation', 'Capacity records ev-04 and ev-07 remain separate and unchanged'],
    },
    deliveryChannels: [{ kind: 'baseline_reach' as const, explanation: 'Ur-Nanna has received the report and asks the reporting scribe for a recommendation.' }],
    presentedDay: state.calendar.dayNumber,
    apCost: 2,
    choices: [
      { id: 'recommend-five-two', label: 'Recommend five for consideration; retain two', description: 'Recommend that Ur-Nanna consider releasing the five surface-dry sacks while retaining the two stained sacks for authorized sampling or cleaning. No release occurs until the Steward issues an order.', consequences: challengeEffects(12, [{ fromId: player as never, toId: STEWARD as never, changes: { trust: 2, respect: 2 }, summary: 'The scribe offered a bounded recommendation and left stock authority with the Steward.' }], 1) },
      { id: 'retain-all-sample', label: 'Retain all seven pending sampling', description: 'Recommend continued segregation until an authorized sample establishes internal grain condition.', consequences: challengeEffects(10, [{ fromId: player as never, toId: STEWARD as never, changes: { trust: 1, respect: 2 }, summary: 'The scribe prioritized a verified grain condition before disposition.' }], 1) },
      { id: 'certify-all-sound', label: 'Certify all seven as sound', description: 'Claim that the five surface-dry sacks and two stained sacks are all fit for use despite the absence of internal sampling.', consequences: challengeEffects(0, [{ fromId: player as never, toId: STEWARD as never, changes: { trust: -5, respect: -5 }, summary: 'The scribe certified internal grain condition without sampling evidence.' }], -4) },
    ],
  };
  return present(state, challenge);
}

function missingMeasure(state: GameState): GameState {
  const id = 'challenge-missing-measure';
  if (alreadyPresented(state, id)) return state;
  const triggered = evaluateChallengeTriggers(state, CHALLENGE_TRIGGER_RULES).includes(id);
  const completedReconciliation = Object.values(state.opportunities.assignments).some((offer) =>
    offer.activityId === 'activity-south-court-delivery-reconciliation' && offer.status === 'completed'
    && ['unlocated_discrepancy','qualified_incomplete'].includes(offer.activityProgress?.draft.finding ?? ''));
  if (!triggered && !completedReconciliation) return state;

  const player = state.player.currentCharacterId;
  const challenge = {
    id: id as ChallengeId,
    title: 'The Missing Measure',
    description: 'The next tally is approaching. Shuruppak-ilu asks whether the account should close with the dispatch figure of 24 and the receiving figure of 23 both preserved, or whether a simpler entry should be made. The records establish a one-measure discrepancy, not where it occurred.',
    category: 'delivery_discrepancy',
    employer: { kind: 'person' as const, id: SENIOR as never },
    context: {
      what: 'Advise how the one-measure discrepancy should be carried into the next storehouse tally.',
      who: ['Shuruppak-ilu, Senior Scribe', 'Utu-mansum, Receiving Official', 'Enlil-kisu, Carrier Foreman'],
      quantity: '24 measures dispatched; 23 measures received; one measure unlocated.',
      when: 'Before the next Temple Storehouse tally.',
      where: 'Temple Storehouse tablet room and south receiving court.',
      from: 'Carrier dispatch tablet attributed to Enlil-kisu and Utu-mansum’s receiving tally.',
      to: 'Temple Storehouse stock account and Senior Scribe.',
      purpose: 'Preserve an accurate account without converting an unresolved discrepancy into an unsupported accusation.',
      responsibility: ['The scribe recommends accounting treatment; the Senior Scribe controls the official account.'],
      authority: 'The Challenge does not authorize amendment of the institutional ledger or assignment of liability.',
      provenance: ['24-measure dispatch copy', '23-measure receiving tally', 'Witness testimony does not establish the point of loss'],
    },
    deliveryChannels: [{ kind: 'baseline_reach' as const, explanation: 'Shuruppak-ilu requests a recommendation after receiving the reconciliation report.' }],
    presentedDay: state.calendar.dayNumber,
    apCost: 2,
    choices: [
      { id: 'preserve-request-origin', label: 'Preserve both figures and request the origin copy', description: 'Record 24 dispatched and 23 received, leave the difference unresolved, and request the originating record or further recount.', consequences: challengeEffects(14, [
        { fromId: player as never, toId: CARRIER as never, changes: { trust: 2, respect: 2 }, summary: 'The scribe preserved Enlil-kisu’s dispatch record without assigning him unsupported responsibility.' },
        { fromId: player as never, toId: SENIOR as never, changes: { trust: 1, respect: 2 }, summary: 'The scribe recommended a traceable reconciliation that preserves both source figures.' },
      ], 2) },
      { id: 'close-qualified-23', label: 'Close at 23 with a qualification', description: 'Carry 23 as the physically received quantity while preserving 24 as the dispatch figure and noting the unresolved difference.', consequences: challengeEffects(10, [
        { fromId: player as never, toId: CARRIER as never, changes: { trust: 1, respect: 1 }, summary: 'The scribe retained the dispatch figure while recording the receiving quantity.' },
        { fromId: player as never, toId: SENIOR as never, changes: { trust: 1, respect: 1 }, summary: 'The scribe proposed a qualified closing entry without concealing the discrepancy.' },
      ], 1) },
      { id: 'blame-carrier', label: 'Attribute the missing measure to Enlil-kisu', description: 'Name the carrier foreman as responsible even though neither the dispatch/receipt comparison nor the available route evidence locates the loss.', consequences: challengeEffects(0, [
        { fromId: player as never, toId: CARRIER as never, changes: { trust: -6, respect: -5 }, summary: 'The scribe blamed Enlil-kisu without evidence locating the one-measure loss.' },
        { fromId: CARRIER as never, toId: player as never, changes: { trust: -4, respect: -4 }, summary: 'Enlil-kisu lost trust and respect after being blamed without supporting evidence.' },
        { fromId: player as never, toId: SENIOR as never, changes: { trust: -2, respect: -3 }, summary: 'The Senior Scribe received an unsupported attribution in the account.' },
      ], -4) },
    ],
  };
  return present(state, challenge);
}

export function runChallengeDirector(state: GameState): GameState {
  return missingMeasure(sevenSacks(state));
}
