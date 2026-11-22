import { describe, expect, it } from 'vitest';
import { createInitialGameState, INITIAL_PERSON_ID } from '../state/initialState';
import { transitionGame } from '../engine/actionEconomy';
import { createSaveEnvelope, isValidSaveEnvelope, restoreSave } from '../state/saveEnvelope';
import { createNewGameState, INITIAL_WORK_CATALOG } from '../state/newGameState';
import { STOREHOUSE_WORK_ID } from '../works/storehouseReckoning';

const endDay = (state: ReturnType<typeof createInitialGameState>) => transitionGame(state, { type: 'END_DAY', expectedDayNumber: state.calendar.dayNumber });

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
    day = endDay(day).state;
    expect(day.actionEconomy.dailyApAllocation).toBe(5);

    day = transitionGame(day, { type: 'SPEND_AP', amount: 5, reason: 'Use reduced day' }).state;
    day = transitionGame(day, { type: 'ACTIVATE_OVERTIME' }).state;
    day = transitionGame(day, { type: 'SPEND_AP', amount: 1, reason: 'Second overtime task' }).state;
    day = endDay(day).state;
    expect(day.actionEconomy.dailyApAllocation).toBe(5);
    expect(day.actionEconomy.apRemaining).toBe(5);
  });

  it('emits the full engine-driven settlement breakdown for a day without a Work contract', () => {
    const initial = createInitialGameState();
    const result = endDay(initial);
    expect(result.settlement).toEqual({
      startingProvisions: 5,
      workContractProvisionEarned: 0,
      workContractProvisionReason: 'no_active_work_contract',
      sustenanceDeducted: 1,
      endingProvisions: 4,
      shortageWorkdays: 0,
      shortageStressDelta: 0,
      cumulativeShortageStress: 0,
      overtimeStress: 0,
      tomorrowAp: 6,
    });
    const settled = result.state;
    expect(settled.world.people[INITIAL_PERSON_ID].scribal?.wallet.provisions).toBe(4);
    expect(settled.world.people[INITIAL_PERSON_ID].scribal?.wallet.shortageWorkdays).toBe(0);
    expect(settled.journal.notices.filter((notice) => notice.category === 'settlement')).toHaveLength(0);
    expect(settled.calendar.displayDate).toBe('Day 2 · Uruk (c. 3200 BCE)');
    const duplicate = transitionGame(settled, { type: 'END_DAY', expectedDayNumber: initial.calendar.dayNumber });
    expect(duplicate.state).toBe(settled);
    expect(duplicate.feedback?.code).toBe('stale-day-settlement');
  });


  it('reports a qualified Work provision, overtime stress, and tomorrow AP from the engine', async () => {
    let state = createNewGameState();
    const activeProgress = state.works.progress[STOREHOUSE_WORK_ID];
    const priorWorkId = 'work-prior-completed' as typeof STOREHOUSE_WORK_ID;
    state = { ...state, works: { ...state.works, progress: {
      [priorWorkId]: { ...activeProgress, status: 'completed', workApSpentToday: 1, provisionContract: { provisionsPerQualifiedWorkday: 1, minimumWorkApPerDay: 1 } },
      ...state.works.progress,
    } } };
    state = transitionGame(state, { type: 'ACQUIRE_WORK_EVIDENCE', workId: STOREHOUSE_WORK_ID, actionId: 'accounts' }, undefined, INITIAL_WORK_CATALOG).state;
    state = transitionGame(state, { type: 'SPEND_AP', amount: 5, reason: 'Use remaining AP' }, undefined, INITIAL_WORK_CATALOG).state;
    state = transitionGame(state, { type: 'ACTIVATE_OVERTIME' }, undefined, INITIAL_WORK_CATALOG).state;
    state = transitionGame(state, { type: 'SPEND_AP', amount: 1, reason: 'Use overtime AP' }, undefined, INITIAL_WORK_CATALOG).state;
    const result = transitionGame(state, { type: 'END_DAY', expectedDayNumber: state.calendar.dayNumber }, undefined, INITIAL_WORK_CATALOG);
    expect(result.settlement).toMatchObject({
      workContractProvisionEarned: 1,
      workContractProvisionReason: 'qualified_workday',
      overtimeStress: 5,
      tomorrowAp: 5,
    });
    expect(result.settlement?.endingProvisions).toBe(result.settlement?.startingProvisions);
  });


  it('honors a qualified completed Work even when a later active Work has not met its AP threshold', () => {
    const state = createNewGameState();
    const activeProgress = state.works.progress[STOREHOUSE_WORK_ID];
    const priorWorkId = 'work-qualified-earlier-today' as typeof STOREHOUSE_WORK_ID;
    const withPriorCompletion = {
      ...state,
      works: { ...state.works, progress: {
        [priorWorkId]: { ...activeProgress, status: 'completed' as const, workApSpentToday: 1, provisionContract: { provisionsPerQualifiedWorkday: 1, minimumWorkApPerDay: 1 } },
        [STOREHOUSE_WORK_ID]: { ...activeProgress, workApSpentToday: 0 },
      } },
    };
    const result = transitionGame(withPriorCompletion, { type: 'END_DAY', expectedDayNumber: state.calendar.dayNumber }, undefined, INITIAL_WORK_CATALOG);
    expect(result.settlement?.workContractProvisionReason).toBe('qualified_workday');
    expect(result.settlement?.workContractProvisionEarned).toBe(1);
  });

  it('ignores a legacy provision-contract snapshot on the Storehouse tutorial in v2 saves', () => {
    const state = createNewGameState();
    const progress = state.works.progress[STOREHOUSE_WORK_ID];
    const legacyState = {
      ...state,
      works: { ...state.works, progress: { ...state.works.progress,
        [STOREHOUSE_WORK_ID]: { ...progress, provisionContract: { provisionsPerQualifiedWorkday: 1, minimumWorkApPerDay: 1 } },
      } },
    };
    const result = transitionGame(legacyState, { type: 'END_DAY', expectedDayNumber: state.calendar.dayNumber }, undefined, INITIAL_WORK_CATALOG);
    expect(result.settlement?.workContractProvisionReason).toBe('no_active_work_contract');
    expect(result.settlement?.workContractProvisionEarned).toBe(0);
    expect(result.state.world.people[INITIAL_PERSON_ID].scribal?.wallet.provisions).toBe(4);
  });

  it('emits shortage notices only on grace and shortage-entry transitions', () => {
    let state = createInitialGameState();
    const person = state.world.people[INITIAL_PERSON_ID];
    state = {
      ...state,
      world: { ...state.world, people: { ...state.world.people, [INITIAL_PERSON_ID]: {
        ...person, scribal: { ...person.scribal!, wallet: { money: 0, provisions: 0, shortageWorkdays: 0 } },
      } } },
    };

    state = endDay(state).state;
    expect(state.world.people[INITIAL_PERSON_ID].scribal?.wallet.shortageWorkdays).toBe(1);
    expect(state.journal.notices.filter((notice) => notice.category === 'settlement')).toHaveLength(1);
    state = endDay(state).state;
    expect(state.world.people[INITIAL_PERSON_ID].scribal?.wallet.shortageWorkdays).toBe(2);
    expect(state.journal.notices.filter((notice) => notice.category === 'settlement')).toHaveLength(2);
    state = endDay(state).state;
    expect(state.world.people[INITIAL_PERSON_ID].scribal?.wallet.shortageWorkdays).toBe(3);
    expect(state.journal.notices.filter((notice) => notice.category === 'settlement')).toHaveLength(3);
    expect(state.journal.notices.filter((notice) => notice.category === 'settlement').at(-1)?.message).toContain('Underfed condition active');

    for (let day = 4; day <= 8; day++) state = endDay(state).state;
    expect(state.world.people[INITIAL_PERSON_ID].scribal?.wallet.shortageWorkdays).toBe(8);
    expect(state.journal.notices.filter((notice) => notice.category === 'settlement')).toHaveLength(3);

    const current = state.world.people[INITIAL_PERSON_ID];
    state = {
      ...state,
      world: { ...state.world, people: { ...state.world.people, [INITIAL_PERSON_ID]: {
        ...current,
        scribal: { ...current.scribal!, wallet: { ...current.scribal!.wallet, provisions: 1 } },
      } } },
    };
    state = endDay(state).state;
    expect(state.world.people[INITIAL_PERSON_ID].scribal?.wallet.provisions).toBe(0);
    expect(state.world.people[INITIAL_PERSON_ID].scribal?.wallet.shortageWorkdays).toBe(0);
    expect(state.journal.notices.filter((notice) => notice.category === 'settlement')).toHaveLength(3);
  });

  it('applies shortage Stress from the third unprovisioned settlement and preserves the lifetime cap through recovery', () => {
    let state = createInitialGameState();
    const initial = state.world.people[INITIAL_PERSON_ID];
    state = { ...state, world: { ...state.world, people: { ...state.world.people, [INITIAL_PERSON_ID]: {
      ...initial, scribal: { ...initial.scribal!, wallet: { ...initial.scribal!.wallet, provisions: 0 } },
    } } } };
    state = endDay(state).state;
    expect(state.world.people[INITIAL_PERSON_ID].scribal?.stress).toBe(15);
    state = endDay(state).state;
    expect(state.world.people[INITIAL_PERSON_ID].scribal?.conditions).toHaveLength(0);
    const third = endDay(state);
    expect(third.settlement?.shortageStressDelta).toBe(2);
    expect(third.settlement?.cumulativeShortageStress).toBe(2);
    expect(third.state.world.people[INITIAL_PERSON_ID].scribal?.stress).toBe(17);
    expect(third.state.world.people[INITIAL_PERSON_ID].scribal?.conditions).toContainEqual({
      id: 'condition-underfed', severity: 2, modifiers: [],
    });
    state = third.state;
    for (let day = 4; day <= 7; day++) state = endDay(state).state;
    expect(state.world.people[INITIAL_PERSON_ID].scribal?.cumulativeShortageStress).toBe(10);
    const capped = endDay(state);
    expect(capped.settlement?.shortageStressDelta).toBe(0);
    expect(capped.state.world.people[INITIAL_PERSON_ID].scribal?.stress).toBe(25);
    const current = capped.state.world.people[INITIAL_PERSON_ID];
    state = { ...capped.state, world: { ...capped.state.world, people: { ...capped.state.world.people, [INITIAL_PERSON_ID]: {
      ...current, scribal: { ...current.scribal!, wallet: { ...current.scribal!.wallet, provisions: 1 } },
    } } } };
    state = endDay(state).state;
    expect(state.world.people[INITIAL_PERSON_ID].scribal?.wallet.shortageWorkdays).toBe(0);
    expect(state.world.people[INITIAL_PERSON_ID].scribal?.conditions).not.toContainEqual(expect.objectContaining({ id: 'condition-underfed' }));
    expect(state.world.people[INITIAL_PERSON_ID].scribal?.cumulativeShortageStress).toBe(10);
  });

  it('performs auxiliary labor once per Workday and resets its daily limit at settlement', () => {
    let state = createInitialGameState();
    const initial = state.world.people[INITIAL_PERSON_ID];
    state = { ...state, world: { ...state.world, people: { ...state.world.people, [INITIAL_PERSON_ID]: {
      ...initial, scribal: { ...initial.scribal!, wallet: { ...initial.scribal!.wallet, provisions: 0 } },
    } } } };
    const labor = transitionGame(state, { type: 'PERFORM_RECOVERY_LABOR' });
    expect(labor.feedback?.code).toBe('recovery-labor-completed');
    expect(labor.state.world.people[INITIAL_PERSON_ID].scribal?.wallet.provisions).toBe(1);
    expect(labor.state.actionEconomy.apRemaining).toBe(4);
    expect(labor.state.actionEconomy.recoveryLaborUsedToday).toBe(true);
    expect(transitionGame(labor.state, { type: 'PERFORM_RECOVERY_LABOR' }).feedback?.code).toBe('recovery-labor-already-used');
    const settled = endDay(labor.state);
    expect(settled.settlement?.shortageWorkdays).toBe(0);
    expect(settled.state.actionEconomy.recoveryLaborUsedToday).toBe(false);
  });

  it('records Ur-gir advance obligations and deducts the provision from his actual stock', () => {
    let state = createInitialGameState();
    const initial = state.world.people[INITIAL_PERSON_ID];
    state = { ...state, world: { ...state.world, people: { ...state.world.people, [INITIAL_PERSON_ID]: {
      ...initial, scribal: { ...initial.scribal!, wallet: { ...initial.scribal!.wallet, provisions: 0 } },
    } } } };
    const advance = transitionGame(state, { type: 'REQUEST_CONTACT_ADVANCE', contactId: 'person-uruk-ur-gir' as typeof INITIAL_PERSON_ID });
    expect(advance.feedback?.code).toBe('contact-advance-received');
    expect(advance.state.world.people[INITIAL_PERSON_ID].scribal?.wallet.provisions).toBe(1);
    expect(advance.state.world.people['person-uruk-ur-gir' as typeof INITIAL_PERSON_ID].scribal?.wallet.provisions).toBe(5);
    expect(advance.state.world.people[INITIAL_PERSON_ID].scribal?.obligations).toHaveLength(1);
    expect(advance.state.world.people[INITIAL_PERSON_ID].scribal?.obligations[0].creditorPersonId).toBe('person-uruk-ur-gir');
    const restored = restoreSave(JSON.stringify(createSaveEnvelope(advance.state, 1, '2026-11-21T12:00:00.000Z')));
    expect(restored?.state.world.people[INITIAL_PERSON_ID].scribal?.obligations[0].description).toContain('one day of scribal assistance');
    expect(transitionGame(advance.state, { type: 'REQUEST_CONTACT_ADVANCE', contactId: 'person-uruk-ur-gir' as typeof INITIAL_PERSON_ID }).feedback?.code).toBe('contact-advance-unavailable');
  });

  it('normalizes earlier v2 saves with no hardship fields without losing the save', () => {
    const envelope = createSaveEnvelope(createInitialGameState(), 0, '2026-11-21T12:00:00.000Z');
    const legacy = structuredClone(envelope) as unknown as { state: { actionEconomy: Record<string, unknown>; world: { people: Record<string, { scribal?: Record<string, unknown> }> } } };
    delete legacy.state.actionEconomy.recoveryLaborUsedToday;
    for (const person of Object.values(legacy.state.world.people)) {
      if (!person.scribal) continue;
      delete person.scribal.cumulativeShortageStress;
      delete person.scribal.obligations;
    }
    const restored = restoreSave(JSON.stringify(legacy));
    expect(restored).not.toBeNull();
    expect(restored?.state.actionEconomy.recoveryLaborUsedToday).toBe(false);
    expect(restored?.state.world.people[INITIAL_PERSON_ID].scribal?.cumulativeShortageStress).toBe(0);
    expect(restored?.state.world.people[INITIAL_PERSON_ID].scribal?.obligations).toEqual([]);
  });

  it('restores only structurally valid v2 envelopes and rejects partial or corrupt saves', () => {
    const envelope = createSaveEnvelope(createInitialGameState(), 0, '2026-11-21T12:00:00.000Z');
    expect(isValidSaveEnvelope(envelope)).toBe(true);
    expect(restoreSave(JSON.stringify(envelope))?.state.player.currentCharacterId).toBe(INITIAL_PERSON_ID);
    expect(restoreSave(JSON.stringify({ schemaVersion: 2, state: {} }))).toBeNull();
    const wrongVersion = { ...envelope, schemaVersion: 1 };
    expect(restoreSave(JSON.stringify(wrongVersion))).toBeNull();
    const corrupt = structuredClone(envelope);
    corrupt.state.actionEconomy.apRemaining = Number.NaN;
    expect(isValidSaveEnvelope(corrupt)).toBe(false);
    const negativeMoney = structuredClone(envelope);
    negativeMoney.state.world.people[INITIAL_PERSON_ID].scribal!.wallet.money = -1;
    expect(isValidSaveEnvelope(negativeMoney)).toBe(false);
    const invalidProvisions = structuredClone(envelope);
    invalidProvisions.state.world.people[INITIAL_PERSON_ID].scribal!.wallet.provisions = Number.POSITIVE_INFINITY;
    expect(isValidSaveEnvelope(invalidProvisions)).toBe(false);
    const invalidShortageDays = structuredClone(envelope);
    invalidShortageDays.state.world.people[INITIAL_PERSON_ID].scribal!.wallet.shortageWorkdays = -1;
    expect(isValidSaveEnvelope(invalidShortageDays)).toBe(false);
    const missingActive = structuredClone(envelope);
    missingActive.state.player.currentCharacterId = 'missing' as typeof INITIAL_PERSON_ID;
    expect(isValidSaveEnvelope(missingActive)).toBe(false);
  });
});
