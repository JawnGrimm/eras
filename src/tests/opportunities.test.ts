import { describe, expect, it } from 'vitest';
import { transitionGame } from '../engine/actionEconomy';
import { evaluateChallengeTriggers } from '../engine/opportunities';
import { createInitialGameState, INITIAL_PERSON_ID } from '../state/initialState';
import { createSaveEnvelope, isValidSaveEnvelope } from '../state/saveEnvelope';
import type { AssignmentId, ChallengeId, WorkId } from '../state/ids';
import type { AssignmentOffer, ChallengeInstance, GameState, OpportunityDeliveryChannel } from '../state/types';

const channel: OpportunityDeliveryChannel = { kind: 'baseline_reach', explanation: 'Within the character’s ordinary professional reach.' };
function offer(id: string): Omit<AssignmentOffer, 'offeredDay' | 'expiresDay' | 'status' | 'lapsedDuringMandatoryWork'> {
  return {
    id: id as AssignmentId, title: `Assignment ${id}`, description: 'Reconcile a delivery account.',
    employer: { kind: 'person', id: INITIAL_PERSON_ID }, category: 'accounts', commodity: 'barley',
    context: { what: 'A delivery account requires reconciliation.', who: ['Storehouse steward'], purpose: 'Establish the received quantity.',
      responsibility: ['Receiving official'], provenance: ['Dispatch tablet', 'Arrival tally'] },
    requiredSkills: {}, difficulty: 'routine', apCost: 2, compensation: { money: 3, provisions: 1 },
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
    deliveryChannels: [channel], presentedDay: 1, apCost: 1,
    choices: [
      { id: 'record-qualified', label: 'Record the discrepancy', description: 'Preserve both claims and their limits.',
        consequences: { moneyDelta: 1, careerXp: 4 } },
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
    expect(capped.state.opportunities.assignments['a1' as AssignmentId].status).toBe('accepted');
    expect(capped.state.opportunities.assignments['a1' as AssignmentId].deliveryChannels[0].kind).toBe('baseline_reach');
  });


  it('keeps delivery separate from skill qualification and never uses rank as a skill substitute', () => {
    const unqualifiedOffer = { ...offer('skill-gated'), requiredSkills: { recordkeeping_accounts: 2 } };
    const shown = transitionGame(createInitialGameState(), { type: 'PRESENT_ASSIGNMENT', offer: unqualifiedOffer });
    expect(shown.feedback?.code).toBe('assignment-presented');
    const accepted = transitionGame(shown.state, { type: 'ACCEPT_ASSIGNMENT', assignmentId: 'skill-gated' as AssignmentId });
    expect(accepted.feedback?.code).toBe('assignment-unqualified');
    expect(accepted.state.opportunities.assignments['skill-gated' as AssignmentId].status).toBe('offered');
  });

  it('expires after three days and counts only non-Work lapses for neglect triggers', () => {
    let state = present(createInitialGameState(), 'ordinary');
    for (let day = 1; day <= 4; day++) state = transitionGame(state, { type: 'END_DAY', expectedDayNumber: day }).state;
    expect(state.opportunities.assignments['ordinary' as AssignmentId].status).toBe('lapsed');
    expect(state.opportunities.assignmentAggregates['person|person-enlil-barni|accounts|barley'].nonWorkLapsed).toBe(1);
    expect(evaluateChallengeTriggers(state, [{ id: 'neglect', category: 'accounts', minNonWorkLapsed: 1 }])).toContain('neglect');

    let workState = present(createInitialGameState(), 'work-offer');
    workState = { ...workState, works: { ...workState.works, activeWorkId: 'work-storehouse' as WorkId } };
    for (let day = 1; day <= 4; day++) workState = transitionGame(workState, { type: 'END_DAY', expectedDayNumber: day }).state;
    expect(workState.opportunities.assignments['work-offer' as AssignmentId].lapsedDuringMandatoryWork).toBe(true);
    expect(workState.opportunities.assignmentAggregates['person|person-enlil-barni|accounts|barley'].nonWorkLapsed).toBe(0);
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
    expect(resolved.state.opportunities.challenges['challenge-1' as ChallengeId]).toBeUndefined();
    expect(resolved.state.opportunities.challengeOutcomes).toHaveLength(1);
    expect(resolved.state.world.people[INITIAL_PERSON_ID].scribal?.wallet.provisions).toBe(7);
    expect(resolved.state.historicalProgression.historicalXp).toBe(base.historicalProgression.historicalXp);
  });

  it('bounds authored AP costs to 1..6 but does not compare them to an overtime allocation', () => {
    const base = createInitialGameState();
    for (const apCost of [0, 7, 1.5]) {
      const invalid = { ...offer(`bad-${apCost}`), apCost };
      expect(transitionGame(base, { type: 'PRESENT_ASSIGNMENT', offer: invalid }).feedback?.code).toBe('assignment-invalid');
      const forged = present(base, 'save-check');
      const changed = { ...forged, opportunities: { ...forged.opportunities, assignments: {
        ...forged.opportunities.assignments, ['save-check' as AssignmentId]: { ...forged.opportunities.assignments['save-check' as AssignmentId], apCost },
      } } };
      expect(isValidSaveEnvelope(createSaveEnvelope(changed, 1))).toBe(false);
    }
    const overtime = { ...base, actionEconomy: { ...base.actionEconomy, dailyApAllocation: 5 as const, apRemaining: 5 } };
    expect(transitionGame(overtime, { type: 'PRESENT_ASSIGNMENT', offer: { ...offer('six-ap'), apCost: 6 } }).feedback?.code).toBe('assignment-presented');
  });

  it('charges Assignment completion AP and applies only offer-authored consequences', () => {
    let state = present(createInitialGameState(), 'complete-me');
    state = transitionGame(state, { type: 'ACCEPT_ASSIGNMENT', assignmentId: 'complete-me' as AssignmentId }).state;
    const beforeAp = state.actionEconomy.apRemaining;
    const beforeMoney = state.world.people[INITIAL_PERSON_ID].scribal!.wallet.money;
    const completed = transitionGame(state, { type: 'COMPLETE_ASSIGNMENT', assignmentId: 'complete-me' as AssignmentId });
    expect(completed.feedback?.code).toBe('assignment-completed');
    expect(completed.state.actionEconomy.apRemaining).toBe(beforeAp - 2);
    expect(completed.state.world.people[INITIAL_PERSON_ID].scribal!.wallet.money).toBe(beforeMoney + 3);
    expect(completed.state.opportunities.assignments['complete-me' as AssignmentId].status).toBe('completed');
    expect(transitionGame(completed.state, { type: 'COMPLETE_ASSIGNMENT', assignmentId: 'complete-me' as AssignmentId }).feedback?.code).toBe('assignment-not-active');
  });

  it('preserves fixed event and knowledge dates while stamping a record on resolution day in a chained consequence sequence', () => {
    let state = present(createInitialGameState(), 'dated');
    state = transitionGame(state, { type: 'ACCEPT_ASSIGNMENT', assignmentId: 'dated' as AssignmentId }).state;
    state = transitionGame(state, { type: 'END_DAY', expectedDayNumber: 1 }).state;
    const offerWithEffects = { ...state.opportunities.assignments['dated' as AssignmentId], completionConsequences: {
      event: { id: 'event-authored', dayNumber: 99, summary: 'The shipment arrived.', personIds: [INITIAL_PERSON_ID], institutionIds: [] },
      record: { id: 'record-authored', createdDay: 99, authorPersonId: INITIAL_PERSON_ID, title: 'Arrival tally',
        sources: [{ id: 'source-event', kind: 'event' as const, sourceId: 'event-authored', description: 'Arrival event' }],
        assertions: [{ id: 'assertion-arrival', text: 'The shipment arrived.', classification: 'observed' as const, sourceIds: ['source-event'] }],
        uncertaintyLimits: [], amendments: [] },
      knowledge: [{ id: 'knowledge-authored', holder: { kind: 'person' as const, id: INITIAL_PERSON_ID },
        subject: { kind: 'record' as const, id: 'record-authored' }, basis: 'consulted-record' as const, learnedDay: 99 }],
      datePolicies: { event: { kind: 'fixed' as const, dayNumber: 1 }, record: { kind: 'resolution_day' as const },
        knowledge: { 'knowledge-authored': { kind: 'fixed' as const, dayNumber: 1 } } },
    } };
    state = { ...state, opportunities: { ...state.opportunities, assignments: { ...state.opportunities.assignments, ['dated' as AssignmentId]: offerWithEffects } } };
    const result = transitionGame(state, { type: 'COMPLETE_ASSIGNMENT', assignmentId: 'dated' as AssignmentId });
    expect(result.feedback?.code).toBe('assignment-completed');
    expect(result.state.world.events['event-authored' as keyof typeof result.state.world.events].dayNumber).toBe(1);
    expect(result.state.records.entries['record-authored' as keyof typeof result.state.records.entries].createdDay).toBe(2);
    expect(result.state.world.knowledge['knowledge-authored' as keyof typeof result.state.world.knowledge].learnedDay).toBe(1);
  });

  it('rejects Challenge consequences that attempt to award Historical Progress XP', () => {
    const invalid = challenge('xp-challenge');
    invalid.choices[0].consequences = { historicalXp: 10 } as never;
    const result = transitionGame(createInitialGameState(), { type: 'PRESENT_CHALLENGE', challenge: invalid });
    expect(result.feedback?.code).toBe('challenge-invalid');
    expect(result.state.opportunities.challenges['xp-challenge' as ChallengeId]).toBeUndefined();
  });

  it('leaves AP, active Challenge, wallet, and archive untouched when a Challenge consequence fails', () => {
    const invalid = challenge('atomic-challenge');
    invalid.apCost = 2;
    invalid.choices[0].consequences = { moneyDelta: -999 };
    const base = createInitialGameState();
    const shown = transitionGame(base, { type: 'PRESENT_CHALLENGE', challenge: invalid });
    expect(shown.feedback?.code).toBe('challenge-presented');
    const beforeWallet = shown.state.world.people[INITIAL_PERSON_ID].scribal!.wallet;
    const lowAp = { ...shown.state, actionEconomy: { ...shown.state.actionEconomy, apRemaining: 1 } };
    const failed = transitionGame(lowAp, { type: 'RESOLVE_CHALLENGE', challengeId: 'atomic-challenge' as ChallengeId, choiceId: invalid.choices[0].id });
    expect(failed.feedback?.code).toBe('insufficient-ap');
    expect(failed.state.actionEconomy.apRemaining).toBe(1);
    expect(failed.state.opportunities.challenges['atomic-challenge' as ChallengeId]).toBeDefined();
    expect(failed.state.world.people[INITIAL_PERSON_ID].scribal!.wallet).toEqual(beforeWallet);
    expect(failed.state.opportunities.challengeOutcomes).toHaveLength(0);
    const consequenceFailure = transitionGame(shown.state, { type: 'RESOLVE_CHALLENGE', challengeId: 'atomic-challenge' as ChallengeId, choiceId: invalid.choices[0].id });
    expect(consequenceFailure.feedback?.code).toBe('challenge-outcome-invalid');
    expect(consequenceFailure.state.actionEconomy.apRemaining).toBe(shown.state.actionEconomy.apRemaining);
    expect(consequenceFailure.state.opportunities.challenges['atomic-challenge' as ChallengeId]).toBeDefined();
    expect(consequenceFailure.state.world.people[INITIAL_PERSON_ID].scribal!.wallet).toEqual(beforeWallet);
    expect(consequenceFailure.state.opportunities.challengeOutcomes).toHaveLength(0);
  });

  it('keeps only five recent activities for the Challenge Director', () => {
    let state = createInitialGameState();
    for (let i = 0; i < 7; i++) state = present(state, `recent-${i}`);
    expect(state.opportunities.recentActivity).toHaveLength(5);
    expect(evaluateChallengeTriggers(state, [{ id: 'presented-seven', minPresented: 7 }])).toContain('presented-seven');
  });
});
