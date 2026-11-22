import { describe, expect, it } from 'vitest';
import { transitionGame } from '../engine/actionEconomy';
import { evaluateChallengeTriggers } from '../engine/opportunities';
import { createInitialGameState, INITIAL_PERSON_ID } from '../state/initialState';
import type { AssignmentId, ChallengeId, InstitutionId, PersonId, WorkId } from '../state/ids';
import type { AssignmentOffer, ChallengeInstance, GameState, OpportunityDeliveryChannel } from '../state/types';

const channel: OpportunityDeliveryChannel = { kind: 'baseline_reach', explanation: 'Within the character’s ordinary professional reach.' };
function offer(id: string): Omit<AssignmentOffer, 'offeredDay' | 'expiresDay' | 'status' | 'lapsedDuringMandatoryWork'> {
  return {
    id: id as AssignmentId, title: `Assignment ${id}`, description: 'Reconcile a delivery account.',
    employer: { kind: 'person', id: INITIAL_PERSON_ID }, category: 'accounts', commodity: 'barley',
    context: { what: 'A delivery account requires reconciliation.', who: ['Storehouse steward'], purpose: 'Establish the received quantity.',
      responsibility: ['Receiving official'], provenance: ['Dispatch tablet', 'Arrival tally'] },
    requiredSkills: {}, difficulty: 'routine', estimatedAp: 2, compensation: { money: 3, provisions: 1 },
    careerXpReward: 8, deliveryChannels: [channel],
  };
}
function present(state: GameState, id: string): GameState {
  return transitionGame(state, { type: 'PRESENT_ASSIGNMENT', offer: offer(id) }).state;
}
function challenge(id: string): ChallengeInstance {
  return {
    id: id as ChallengeId, title: 'Disputed delivery', description: 'Two accounts disagree about a delivery.',
    category: 'accounts', context: { what: 'A disputed delivery account.', who: ['Steward'], purpose: 'Determine what can responsibly be stated.', responsibility: ['Scribe'], provenance: ['Two conflicting accounts'] },
    deliveryChannels: [channel], presentedDay: 1,
    choices: [
      { id: 'record-qualified', label: 'Record the discrepancy', description: 'Preserve both claims and their limits.',
        consequences: { moneyDelta: 1, careerXp: 4, relationships: [{ fromId: INITIAL_PERSON_ID, toId: INITIAL_PERSON_ID as PersonId, changes: { trust: 2 }, summary: 'The steward appreciates the careful account.' }] } },
      { id: 'endorse-claim', label: 'Endorse one claim', description: 'Accept the senior official’s account without further proof.', consequences: { provisionsDelta: 2 } },
    ],
  };
}
describe('Assignment and Challenge foundations', () => {
  it('accepts without AP, enforces two active Assignments, and separates qualification from delivery channel', () => {
    let state = createInitialGameState();
    state = present(state, 'a1'); state = present(state, 'a2'); state = present(state, 'a3');
    const before = state.actionEconomy.apRemaining;
    state = transitionGame(state, { type: 'ACCEPT_ASSIGNMENT', assignmentId: 'a1' as AssignmentId }).state;
    state = transitionGame(state, { type: 'ACCEPT_ASSIGNMENT', assignmentId: 'a2' as AssignmentId }).state;
    const capped = transitionGame(state, { type: 'ACCEPT_ASSIGNMENT', assignmentId: 'a3' as AssignmentId });
    expect(capped.feedback?.code).toBe('assignment-cap-reached');
    expect(capped.state.actionEconomy.apRemaining).toBe(before);
    expect(capped.state.opportunities.assignments['a1'].status).toBe('accepted');
    expect(capped.state.opportunities.assignments['a1'].deliveryChannels[0].kind).toBe('baseline_reach');
  });

  it('expires after three days and counts only non-Work lapses for neglect triggers', () => {
    let state = present(createInitialGameState(), 'ordinary');
    for (let day = 1; day <= 4; day++) state = transitionGame(state, { type: 'END_DAY', expectedDayNumber: day }).state;
    expect(state.opportunities.assignments['ordinary'].status).toBe('lapsed');
    expect(state.opportunities.assignmentAggregates['person:person-enlil-barni|accounts|barley'].nonWorkLapsed).toBe(1);
    expect(evaluateChallengeTriggers(state, [{ id: 'neglect', category: 'accounts', minNonWorkLapsed: 1 }])).toContain('neglect');

    let workState = present(createInitialGameState(), 'work-offer');
    workState = { ...workState, works: { ...workState.works, activeWorkId: 'work-storehouse' as WorkId } };
    for (let day = 1; day <= 4; day++) workState = transitionGame(workState, { type: 'END_DAY', expectedDayNumber: day }).state;
    expect(workState.opportunities.assignments['work-offer'].lapsedDuringMandatoryWork).toBe(true);
    expect(workState.opportunities.assignmentAggregates['person:person-enlil-barni|accounts|barley'].nonWorkLapsed).toBe(0);
    expect(evaluateChallengeTriggers(workState, [{ id: 'neglect', category: 'accounts', minNonWorkLapsed: 1 }])).not.toContain('neglect');
  });

  it('cancels atomically for one AP and applies no automatic relationship penalty', () => {
    let state = present(createInitialGameState(), 'cancel-me');
    state = transitionGame(state, { type: 'ACCEPT_ASSIGNMENT', assignmentId: 'cancel-me' as AssignmentId }).state;
    const beforeTrust = state.world.relationships[INITIAL_PERSON_ID]?.[INITIAL_PERSON_ID];
    const result = transitionGame(state, { type: 'CANCEL_ASSIGNMENT', assignmentId: 'cancel-me' as AssignmentId });
    expect(result.feedback?.code).toBe('assignment-cancelled');
    expect(result.state.actionEconomy.apRemaining).toBe(state.actionEconomy.apRemaining - 1);
    expect(result.state.world.relationships[INITIAL_PERSON_ID]?.[INITIAL_PERSON_ID]).toBe(beforeTrust);
  });

  it('moves a resolved Challenge to the archive and never changes Historical Progress XP', () => {
    const base = createInitialGameState();
    const presented = transitionGame(base, { type: 'PRESENT_CHALLENGE', challenge: challenge('challenge-1') });
    expect(presented.feedback?.code).toBe('challenge-presented');
    const resolved = transitionGame(presented.state, { type: 'RESOLVE_CHALLENGE', challengeId: 'challenge-1' as ChallengeId, choiceId: 'endorse-claim' });
    expect(resolved.feedback?.code).toBe('challenge-resolved');
    expect(resolved.state.opportunities.challenges['challenge-1']).toBeUndefined();
    expect(resolved.state.opportunities.challengeOutcomes).toHaveLength(1);
    expect(resolved.state.world.people[INITIAL_PERSON_ID].scribal?.wallet.provisions).toBe(7);
    expect(resolved.state.historicalProgression.historicalXp).toBe(base.historicalProgression.historicalXp);
  });

  it('keeps only five recent activities for the Challenge Director', () => {
    let state = createInitialGameState();
    for (let i = 0; i < 7; i++) state = present(state, `recent-${i}`);
    expect(state.opportunities.recentActivity).toHaveLength(5);
    expect(evaluateChallengeTriggers(state, [{ id: 'presented-seven', minPresented: 7 }])).toContain('presented-seven');
  });
});
