import { describe, expect, it } from 'vitest';
import type { ChallengeId, EventId } from '../state/ids';
import type { ChallengeInstance, GameState } from '../state/types';
import { createInitialGameState } from '../state/initialState';
import { isValidSaveEnvelope, createSaveEnvelope } from '../state/saveEnvelope';
import { selectWeightedChallengeCandidate } from '../engine/challengeDirector';
import { transitionOpportunityAction } from '../engine/opportunities';

function challenge(id: string): Omit<ChallengeInstance, 'status' | 'assigneePersonId'> {
  return {
    id: id as ChallengeId,
    title: 'A bounded administrative question',
    description: 'Review the available evidence and recommend a defensible next step.',
    category: 'test',
    context: {
      what: 'Review the recorded discrepancy.',
      who: ['Senior Scribe'],
      purpose: 'Preserve the evidence without assigning unsupported responsibility.',
      responsibility: ['The scribe recommends; the appointed official decides.'],
      provenance: ['A specific recorded event.'],
    },
    deliveryChannels: [{ kind: 'baseline_reach', explanation: 'The source report reached the current scribe.' }],
    presentedDay: 1,
    apCost: 1,
    choices: [{
      id: 'preserve',
      label: 'Preserve the discrepancy',
      description: 'Carry both figures forward without inventing a cause.',
      consequences: { careerXp: 0 },
    }],
  };
}

describe('Challenge candidate selection and occurrence lifecycle', () => {
  it('selects deterministically regardless of candidate insertion order', () => {
    const candidates = [
      { scenarioId: 'scenario-b', occurrenceKey: 'scenario-b|event:event-b', weight: 3 },
      { scenarioId: 'scenario-a', occurrenceKey: 'scenario-a|event:event-a', weight: 1 },
      { scenarioId: 'scenario-c', occurrenceKey: 'scenario-c|event:event-c', weight: 2 },
    ];
    const selected = selectWeightedChallengeCandidate(candidates, 'creator-seed-123', 'era-1:4');
    const reversed = selectWeightedChallengeCandidate([...candidates].reverse(), 'creator-seed-123', 'era-1:4');
    expect(selected).toEqual(reversed);
    expect(selectWeightedChallengeCandidate(candidates, 'creator-seed-123', 'era-1:4')).toEqual(selected);
    expect(selectWeightedChallengeCandidate(candidates, 'creator-seed-123', 'era-1:5')).not.toBeUndefined();
  });

  it('rejects invalid candidate weights rather than falling back to nondeterministic choice', () => {
    expect(selectWeightedChallengeCandidate([
      { scenarioId: 'scenario-a', occurrenceKey: 'a', weight: 0 },
    ], 'seed', 'era-1:1')).toBeUndefined();
  });

  it('enforces two unresolved Challenges and excludes declined Challenges from the cap', () => {
    let state = createInitialGameState();
    for (const id of ['challenge-cap-a', 'challenge-cap-b']) {
      const presented = transitionOpportunityAction(state, { type: 'PRESENT_CHALLENGE', challenge: challenge(id) });
      expect(presented.feedback?.code).toBe('challenge-presented');
      state = presented.state;
    }
    const blocked = transitionOpportunityAction(state, { type: 'PRESENT_CHALLENGE', challenge: challenge('challenge-cap-c') });
    expect(blocked.feedback?.code).toBe('challenge-cap-reached');
    state = transitionOpportunityAction(state, {
      type: 'DECLINE_CHALLENGE',
      challengeId: 'challenge-cap-a' as ChallengeId,
    }).state;
    const allowed = transitionOpportunityAction(state, { type: 'PRESENT_CHALLENGE', challenge: challenge('challenge-cap-c') });
    expect(allowed.feedback?.code).toBe('challenge-presented');
  });

  it('updates an occurrence ledger through accepted and completed Challenge states', () => {
    const base = createInitialGameState();
    const sourceEventId = Object.keys(base.world.events)[0] as EventId;
    const id = 'scenario-a|matter:matter-a|primary:event:' + sourceEventId;
    const item = challenge(id);
    const state: GameState = {
      ...base,
      opportunities: {
        ...base.opportunities,
        challenges: { [id]: { ...item, status: 'offered' } },
        occurrenceLedger: [{
          scenarioId: 'scenario-a',
          occurrenceKey: id,
          lifecycle: 'offered',
          primarySourceFact: { kind: 'event', id: sourceEventId },
          requiredSourceFactIds: [sourceEventId],
          deliveryChannels: item.deliveryChannels,
          presentedDay: 1,
        }],
      },
    };
    const accepted = transitionOpportunityAction(state, { type: 'ACCEPT_CHALLENGE', challengeId: id as ChallengeId });
    expect(accepted.state.opportunities.occurrenceLedger[0].lifecycle).toBe('accepted');
    expect(accepted.state.opportunities.occurrenceLedger[0].assigneePersonId).toBe(state.player.currentCharacterId);

    const resolved = transitionOpportunityAction(accepted.state, {
      type: 'RESOLVE_CHALLENGE', challengeId: id as ChallengeId, choiceId: 'preserve',
    });
    expect(resolved.feedback?.code).toBe('challenge-resolved');
    expect(resolved.state.opportunities.occurrenceLedger[0].lifecycle).toBe('completed');
    expect(resolved.state.historicalProgression.historicalXp).toBe(0);
  });

  it('persists Challenge occurrence provenance in the existing schema-v3 ledger', () => {
    const base = createInitialGameState();
    const sourceEventId = Object.keys(base.world.events)[0] as EventId;
    const id = 'scenario-save|matter:matter-a|primary:event:' + sourceEventId;
    const item = challenge(id);
    const state: GameState = {
      ...base,
      opportunities: {
        ...base.opportunities,
        challenges: { [id]: { ...item, status: 'offered' } },
        occurrenceLedger: [{
          scenarioId: 'scenario-save',
          occurrenceKey: id,
          lifecycle: 'offered',
          primarySourceFact: { kind: 'event', id: sourceEventId },
          requiredSourceFactIds: [sourceEventId],
          deliveryChannels: item.deliveryChannels,
          presentedDay: 1,
        }],
      },
    };
    expect(isValidSaveEnvelope(createSaveEnvelope(state, 1))).toBe(true);
  });
});
