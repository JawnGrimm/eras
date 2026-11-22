import { describe, expect, it } from 'vitest';
import { createInitialGameState, INITIAL_PERSON_ID } from '../state/initialState';
import { transitionGame } from '../engine/actionEconomy';
import { createSaveEnvelope, isValidSaveEnvelope, restoreSave } from '../state/saveEnvelope';

describe('production foundation: AP, overtime, settlement and saves', () => {
  it('starts each ordinary Workday with six shared AP and prevents overspending', () => {
    const initial = createInitialGameState();
    expect(initial.actionEconomy.apRemaining).toBe(6);
    const spent = transitionGame(initial, { type: 'SPEND_AP', amount: 6, reason: 'Complete work' });
    expect(spent.state.actionEconomy.apRemaining).toBe(0);
    const rejected = transitionGame(spent.state, { type: 'SPEND_AP', amount: 1, reason: 'Extra work' });
    expect(rejected.state).toBe(spent.state);
    expect(rejected.feedback?.code).toBe('insufficient-ap');
  });

  it('allows overtime only at zero AP, once per day, and applies a non-stacking five-AP next day', () => {
    const initial = createInitialGameState();
    const early = transitionGame(initial, { type: 'ACTIVATE_OVERTIME' });
    expect(early.state).toBe(initial);
    let day = transitionGame(initial, { type: 'SPEND_AP', amount: 6, reason: 'Use the day' }).state;
    day = transitionGame(day, { type: 'ACTIVATE_OVERTIME' }).state;
    expect(day.actionEconomy.apRemaining).toBe(1);
    expect(day.world.people[INITIAL_PERSON_ID].scribal?.stress).toBe(20);
    const stacked = transitionGame(day, { type: 'ACTIVATE_OVERTIME' });
    expect(stacked.state).toBe(day);
    day = transitionGame(day, { type: 'SPEND_AP', amount: 1, reason: 'Overtime task' }).state;
    day = transitionGame(day, { type: 'END_DAY' }).state;
    expect(day.actionEconomy.dailyApAllocation).toBe(5);

    day = transitionGame(day, { type: 'SPEND_AP', amount: 5, reason: 'Use reduced day' }).state;
    day = transitionGame(day, { type: 'ACTIVATE_OVERTIME' }).state;
    day = transitionGame(day, { type: 'SPEND_AP', amount: 1, reason: 'Second overtime task' }).state;
    day = transitionGame(day, { type: 'END_DAY' }).state;
    expect(day.actionEconomy.dailyApAllocation).toBe(5);
    expect(day.actionEconomy.apRemaining).toBe(5);
  });

  it('consumes one provision per Workday and resets shortage count when provisions are available', () => {
    const initial = createInitialGameState();
    const settled = transitionGame(initial, { type: 'END_DAY' }).state;
    expect(settled.world.people[INITIAL_PERSON_ID].scribal?.wallet.provisions).toBe(4);
    expect(settled.world.people[INITIAL_PERSON_ID].scribal?.wallet.shortageWorkdays).toBe(0);
    expect(settled.journal.notices).toHaveLength(1);
  });

  it('allows two consecutive Workdays without provisions before shortage consequences begin on the third', () => {
    let state = createInitialGameState();
    const person = state.world.people[INITIAL_PERSON_ID];
    state = {
      ...state,
      world: { ...state.world, people: { ...state.world.people, [INITIAL_PERSON_ID]: {
        ...person, scribal: { ...person.scribal!, wallet: { money: 0, provisions: 0, shortageWorkdays: 0 } },
      } } },
    };
    state = transitionGame(state, { type: 'END_DAY' }).state;
    expect(state.world.people[INITIAL_PERSON_ID].scribal?.wallet.shortageWorkdays).toBe(1);
    state = transitionGame(state, { type: 'END_DAY' }).state;
    expect(state.world.people[INITIAL_PERSON_ID].scribal?.wallet.shortageWorkdays).toBe(2);
    state = transitionGame(state, { type: 'END_DAY' }).state;
    expect(state.world.people[INITIAL_PERSON_ID].scribal?.wallet.shortageWorkdays).toBe(3);
    expect(state.journal.notices.at(-1)?.message).toContain('Shortage day 3');
  });

  it('restores only structurally valid v2 envelopes and rejects partial or corrupt saves', () => {
    const envelope = createSaveEnvelope(createInitialGameState(), 0, '2026-11-21T12:00:00.000Z');
    expect(isValidSaveEnvelope(envelope)).toBe(true);
    expect(restoreSave(JSON.stringify(envelope))?.state.player.currentCharacterId).toBe(INITIAL_PERSON_ID);
    expect(restoreSave(JSON.stringify({ schemaVersion: 2, state: {} }))).toBeNull();
    const corrupt = structuredClone(envelope);
    corrupt.state.actionEconomy.apRemaining = Number.NaN;
    expect(isValidSaveEnvelope(corrupt)).toBe(false);
    const missingActive = structuredClone(envelope);
    missingActive.state.player.currentCharacterId = 'missing' as typeof INITIAL_PERSON_ID;
    expect(isValidSaveEnvelope(missingActive)).toBe(false);
  });
});
