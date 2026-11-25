import { describe, expect, it } from 'vitest';
import { createInitialGameState, INITIAL_PERSON_ID } from '../state/initialState';
import { isValidSaveEnvelope, isValidV2SaveEnvelope, isValidV3SaveEnvelope, restoreSave } from '../state/saveEnvelope';
import type { ChallengeId } from '../state/ids';
import type { ChallengeInstance, GameState } from '../state/types';

function legacyV2State(): GameState {
  const base = createInitialGameState();
  const challenge: ChallengeInstance = {
    id: 'legacy-active-challenge' as ChallengeId,
    title: 'Legacy active challenge',
    description: 'A challenge preserved from a schema-v2 save.',
    category: 'legacy',
    context: {
      what: 'Review the existing matter.',
      who: ['Senior Scribe'],
      purpose: 'Preserve the recorded decision.',
      responsibility: ['The scribe recommends.'],
      provenance: ['Existing saved challenge'],
    },
    deliveryChannels: [{ kind: 'baseline_reach', explanation: 'The matter reached the character through ordinary work.' }],
    presentedDay: 1,
    apCost: 1,
    choices: [{ id: 'preserve', label: 'Preserve the record', description: 'Keep the existing facts intact.', consequences: {} }],
    status: 'accepted',
    assigneePersonId: INITIAL_PERSON_ID,
  };
  return {
    ...base,
    opportunities: {
      ...base.opportunities,
      challenges: { [challenge.id]: challenge },
      challengeOutcomes: [{
        challengeId: 'legacy-completed-challenge' as ChallengeId,
        title: 'Legacy completed challenge',
        category: 'legacy',
        resolvedDay: 1,
        choiceId: 'retain',
        choiceLabel: 'Retain the account',
        summary: 'The completed outcome remains in the archive.',
        assigneePersonId: INITIAL_PERSON_ID,
      }],
    },
  };
}

function asV2Envelope(state: GameState, revision = 4) {
  const legacyState = structuredClone(state) as unknown as Record<string, any>;
  for (const targets of Object.values(legacyState.world.relationships) as any[]) for (const relationship of Object.values(targets) as any[]) relationship.dimensions.familiarity = 0;
  delete legacyState.world.relationshipFamiliarityEpisodes;
  delete legacyState.dayClose;
  delete legacyState.opportunities.selectionSeed;
  delete legacyState.opportunities.occurrenceLedger;
  return {
    schemaVersion: 2,
    gameVersion: '0.1.0',
    revision,
    savedAt: '2026-11-24T12:00:00.000Z',
    state: legacyState,
  };
}

describe('schema v4 migration and state validation', () => {
  it('migrates a valid v2 save without changing its saved career data', () => {
    const legacy = asV2Envelope(legacyV2State());
    expect(isValidV2SaveEnvelope(legacy)).toBe(true);

    const raw = JSON.stringify(legacy);
    const restored = restoreSave(raw);

    expect(restored).not.toBeNull();
    expect(restored?.schemaVersion).toBe(4);
    expect(restored?.revision).toBe(4);
    expect(restored?.state.player.currentCharacterId).toBe(INITIAL_PERSON_ID);
    expect(restored?.state.calendar.dayNumber).toBe(1);
    expect(restored?.state.dayClose).toEqual({
      phase: 'workday_open',
      pendingSettlementId: null,
      lastFinalizedSettlementId: null,
      pendingCredits: [],
    });
    expect(restored?.state.opportunities.challenges['legacy-active-challenge' as ChallengeId].status).toBe('accepted');
    expect(restored?.state.opportunities.challengeOutcomes[0].summary).toBe('The completed outcome remains in the archive.');
    expect(restored?.state.opportunities.occurrenceLedger).toHaveLength(2);
    expect(restored?.state.opportunities.occurrenceLedger[0]).toMatchObject({
      scenarioId: 'legacy-active-challenge',
      lifecycle: 'accepted',
      assigneePersonId: INITIAL_PERSON_ID,
      legacy: true,
      requiredSourceFactIds: [],
    });
    expect(restored?.state.opportunities.occurrenceLedger[0].primarySourceFact).toBeUndefined();
    expect(restored?.state.opportunities.occurrenceLedger[0].matterId).toBeUndefined();
    expect(restored?.state.opportunities.occurrenceLedger[1]).toMatchObject({
      scenarioId: 'legacy-completed-challenge',
      lifecycle: 'completed',
      assigneePersonId: INITIAL_PERSON_ID,
      legacy: true,
    });
    expect(restored?.state.opportunities.selectionSeed).toMatch(/^legacy-v2-fnv1a32-[0-9a-f]{8}$/);
    expect(isValidSaveEnvelope(restored)).toBe(true);
    expect(isValidV2SaveEnvelope(restored)).toBe(false);
  });

  it('migrates a valid v3 save to v4 without deriving episodes from legacy familiarity or history', () => {
    const state = createInitialGameState();
    const fromId = Object.keys(state.world.relationships)[0] as keyof typeof state.world.relationships;
    const toId = Object.keys(state.world.relationships[fromId] ?? {})[0] as keyof typeof state.world.people;
    const relationship = state.world.relationships[fromId]?.[toId];
    expect(relationship).toBeDefined();
    const legacyState = structuredClone(state) as unknown as Record<string, any>;
    legacyState.world.relationships[fromId][toId].dimensions.familiarity = 73;
    delete legacyState.world.relationshipFamiliarityEpisodes;
    const legacy = {
      schemaVersion: 3, gameVersion: '0.1.0', revision: 9,
      savedAt: '2026-11-24T12:00:00.000Z', state: legacyState,
    };
    expect(isValidV3SaveEnvelope(legacy)).toBe(true);
    const restored = restoreSave(JSON.stringify(legacy));
    expect(restored?.schemaVersion).toBe(4);
    expect(restored?.state.world.relationshipFamiliarityEpisodes).toEqual({});
    expect(restored?.state.world.relationships[fromId]?.[toId]?.dimensions).not.toHaveProperty('familiarity');
    expect(restored?.state.world.relationships[fromId]?.[toId]?.history).toEqual(relationship?.history ?? []);
    expect(isValidSaveEnvelope(restored)).toBe(true);
  });

  it('derives the same migration seed from the exact same v2 bytes and a different seed from different bytes', () => {
    const firstRaw = JSON.stringify(asV2Envelope(createInitialGameState(), 1));
    const secondRaw = JSON.stringify(asV2Envelope(createInitialGameState(), 2));
    const first = restoreSave(firstRaw);
    const repeat = restoreSave(firstRaw);
    const second = restoreSave(secondRaw);

    expect(first?.state.opportunities.selectionSeed).toBe(repeat?.state.opportunities.selectionSeed);
    expect(first?.state.opportunities.selectionSeed).not.toBe(second?.state.opportunities.selectionSeed);
  });

  it('rejects malformed v2 envelopes rather than fabricating missing state', () => {
    const legacy = asV2Envelope(createInitialGameState());
    legacy.state.opportunities.challenges = null;
    expect(restoreSave(JSON.stringify(legacy))).toBeNull();
    expect(restoreSave(JSON.stringify({ schemaVersion: 2, gameVersion: '0.1.0', revision: 0, savedAt: 'invalid', state: {} }))).toBeNull();
  });

  it('requires a canonical active settlement identity and valid occurrence provenance in v3', () => {
    const state = createInitialGameState();
    const envelope = {
      schemaVersion: 3,
      gameVersion: '0.1.0',
      revision: 0,
      savedAt: '2026-11-24T12:00:00.000Z',
      state: {
        ...state,
        dayClose: { ...state.dayClose, phase: 'interlude_open', pendingSettlementId: 'era-1:2' },
      },
    };
    expect(isValidV3SaveEnvelope(envelope)).toBe(false);

    const invalidOccurrence = {
      ...envelope,
      state: {
        ...state,
        opportunities: {
          ...state.opportunities,
          occurrenceLedger: [{
            scenarioId: 'scenario-without-source',
            occurrenceKey: 'occurrence-without-source',
            lifecycle: 'offered',
            requiredSourceFactIds: [],
          }],
        },
      },
    };
    expect(isValidV3SaveEnvelope(invalidOccurrence)).toBe(false);
  });
});
