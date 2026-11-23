import { describe, expect, it } from 'vitest';
import { transitionGame } from '../engine/actionEconomy';
import { createInitialGameState, INITIAL_PERSON_ID } from './initialState';
import { createSaveEnvelope, isValidGameState, restoreSave } from './saveEnvelope';
import { getInitializedScribal, isInitializedScribalState } from './scribalState';
import type { Person } from './types';
import type { PersonId } from './ids';

const identityId = 'person-identity-only' as PersonId;
const identityScribal = { stage: 'identity' as const, careerPath: 'merchant' as const };

function stateWithIdentityNpc() {
  const state = createInitialGameState();
  const person: Person = {
    id: identityId,
    name: 'Identity-only colleague',
    alive: true,
    affiliations: [],
    scribal: identityScribal,
  };
  return {
    ...state,
    world: { ...state.world, people: { ...state.world.people, [identityId]: person } },
  };
}

describe('staged scribal capability boundary', () => {
  it('marks newly initialized prototype scribal records explicitly', () => {
    const state = createInitialGameState();
    const initialized = Object.values(state.world.people).filter((person) => !!person.scribal);
    expect(initialized.length).toBeGreaterThan(0);
    expect(initialized.every((person) => person.scribal?.stage === 'initialized')).toBe(true);
  });

  it('treats only the explicit identity stage as non-initialized', () => {
    const state = createInitialGameState();
    const legacyScribal = state.world.people[INITIAL_PERSON_ID].scribal;
    expect(isInitializedScribalState(legacyScribal)).toBe(true);
    expect(getInitializedScribal(state.world.people[INITIAL_PERSON_ID])).toBeDefined();
    expect(isInitializedScribalState(identityScribal)).toBe(false);
    expect(getInitializedScribal({ id: identityId, name: 'Identity', alive: true, affiliations: [], scribal: identityScribal })).toBeUndefined();
  });

  it('accepts and preserves an identity-stage NPC through save restoration', () => {
    const state = stateWithIdentityNpc();
    expect(isValidGameState(state)).toBe(true);
    const restored = restoreSave(JSON.stringify(createSaveEnvelope(state, 1)));
    expect(restored).not.toBeNull();
    expect(restored!.state.world.people[identityId].scribal).toEqual(identityScribal);
    const resaved = JSON.parse(JSON.stringify(createSaveEnvelope(restored!.state, 2)));
    expect(resaved.state.world.people[identityId].scribal).toEqual(identityScribal);
  });

  it('rejects an identity-stage active player as a playable game or save', () => {
    const state = createInitialGameState();
    state.world.people[INITIAL_PERSON_ID].scribal = identityScribal;
    expect(isValidGameState(state)).toBe(false);
    expect(restoreSave(JSON.stringify(createSaveEnvelope(state, 1)))).toBeNull();
  });

  it('preserves legacy initialized records without adding an initialized stage', () => {
    const state = createInitialGameState();
    delete state.world.people[INITIAL_PERSON_ID].scribal!.stage;
    expect(isValidGameState(state)).toBe(true);
    const restored = restoreSave(JSON.stringify(createSaveEnvelope(state, 1)));
    expect(restored).not.toBeNull();
    expect(restored!.state.world.people[INITIAL_PERSON_ID].scribal?.stage).toBeUndefined();
    const savedAgain = JSON.parse(JSON.stringify(createSaveEnvelope(restored!.state, 2)));
    expect(savedAgain.state.world.people[INITIAL_PERSON_ID].scribal.stage).toBeUndefined();
  });

  it('does not let legacy compatibility excuse malformed initialized career fields', () => {
    const state = createInitialGameState();
    delete state.world.people[INITIAL_PERSON_ID].scribal!.stage;
    delete (state.world.people[INITIAL_PERSON_ID].scribal as unknown as Record<string, unknown>).wallet;
    expect(isValidGameState(state)).toBe(false);
  });

  it('rejects unknown scribal stages rather than treating them as legacy initialized records', () => {
    const state = createInitialGameState();
    (state.world.people[INITIAL_PERSON_ID].scribal as unknown as Record<string, unknown>).stage = 'pending';
    expect(isValidGameState(state)).toBe(false);
  });

  it('leaves identity-stage NPC data unchanged during mixed-world day settlement', () => {
    const state = stateWithIdentityNpc();
    const before = structuredClone(state.world.people[identityId].scribal);
    const settled = transitionGame(state, { type: 'END_DAY', expectedDayNumber: state.calendar.dayNumber });
    expect(settled.state.calendar.dayNumber).toBe(state.calendar.dayNumber + 1);
    expect(settled.state.world.people[identityId].scribal).toEqual(before);
  });
});
