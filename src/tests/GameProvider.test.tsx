import React, { createElement } from 'react';
import { TEST_CHARACTER_CREATION } from './fixtures/newGameCharacter';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { GameProvider, useGame } from '../state/GameProvider';
import type { ProductionStorage } from '../state/GameProvider';
import { createNewGameState, INITIAL_WORK_CATALOG } from '../state/newGameState';
import { transitionGame } from '../engine/actionEconomy';
import { createSaveEnvelope, restoreSave, ROLLBACK_SAVE_KEY, SAVE_KEY } from '../state/saveEnvelope';
import type { GameState } from '../state/types';

class MemoryStorage implements ProductionStorage {
  values = new Map<string, string>();
  failWrites = false;
  corruptSaveWrites = false;
  corruptRollbackWrites = false;
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void {
    if (this.failWrites) throw new Error('Quota exceeded');
    this.values.set(key, this.corruptSaveWrites && key === SAVE_KEY ? '{"schemaVersion":4}'
      : this.corruptRollbackWrites && key === ROLLBACK_SAVE_KEY ? 'corrupted rollback bytes' : value);
  }
}

function renderProvider(storage: ProductionStorage | null) {
  let value: ReturnType<typeof useGame> | undefined;
  function Probe() {
    value = useGame();
    return null;
  }
  renderToString(createElement(GameProvider, { storage }, createElement(Probe)));
  if (!value) throw new Error('GameProvider did not render its context');
  return value;
}

function validSavedState(): GameState {
  return createNewGameState(TEST_CHARACTER_CREATION);
}

describe('GameProvider production persistence', () => {
  it('opens the Creator when browser storage is unavailable and permits session-only creation', () => {
    const game = renderProvider(null);
    expect(game.loadStatus).toBe('ready');
    expect(game.needsCharacterCreation).toBe(true);
    expect(game.feedback?.code).toBe('save-write-failed');
    expect(game.storageError).toContain('only in this session');
    expect(game.createCharacterAndStartGame(TEST_CHARACTER_CREATION)).toBe(true);
  });

  it('opens the Creator for a missing save and persists only after character confirmation', () => {
    const storage = new MemoryStorage();
    const game = renderProvider(storage);

    expect(game.loadStatus).toBe('ready');
    expect(game.needsCharacterCreation).toBe(true);
    expect(storage.getItem(SAVE_KEY)).toBeNull();
    expect(game.createCharacterAndStartGame(TEST_CHARACTER_CREATION)).toBe(true);
    const saved = restoreSave(storage.getItem(SAVE_KEY), INITIAL_WORK_CATALOG);
    expect(saved?.state.works.activeWorkId).toBe('work-storehouse-reckoning');
    expect(Object.keys(saved?.state.opportunities.assignments ?? {})).toHaveLength(2);
    expect(Object.keys(saved?.state.opportunities.challenges ?? {})).toHaveLength(0);
    expect(saved?.state.calendar.dayNumber).toBe(1);
  });

  it('restores a valid v4 save using the registered Work catalog', () => {
    const storage = new MemoryStorage();
    const state = transitionGame(validSavedState(), { type: 'SPEND_AP', amount: 2, reason: 'Test saved AP' }).state;
    storage.setItem(SAVE_KEY, JSON.stringify(createSaveEnvelope(state, 7, '2026-11-22T12:00:00.000Z')));

    const game = renderProvider(storage);

    expect(game.loadStatus).toBe('ready');
    expect(game.state.actionEconomy.apRemaining).toBe(4);
    expect(game.state.works.activeWorkId).toBe(validSavedState().works.activeWorkId);
  });

  it('backs up exact v2 bytes and durably rewrites the migrated v4 envelope before opening play', () => {
    const storage = new MemoryStorage();
    const state = validSavedState();
    const legacyState = structuredClone(state) as unknown as Record<string, any>;
    delete legacyState.world.relationshipFamiliarityEpisodes;
    for (const targets of Object.values(legacyState.world.relationships) as any[]) for (const relationship of Object.values(targets) as any[]) relationship.dimensions.familiarity = 0;
    delete legacyState.dayClose;
    delete legacyState.opportunities.selectionSeed;
    delete legacyState.opportunities.occurrenceLedger;
    const legacyRaw = JSON.stringify({
      schemaVersion: 2, gameVersion: '0.1.0', revision: 6,
      savedAt: '2026-11-22T12:00:00.000Z', state: legacyState,
    });
    storage.setItem(SAVE_KEY, legacyRaw);

    const game = renderProvider(storage);
    const persisted = JSON.parse(storage.getItem(SAVE_KEY) ?? 'null');

    expect(game.loadStatus).toBe('ready');
    expect(game.needsCharacterCreation).toBe(false);
    expect(storage.getItem(ROLLBACK_SAVE_KEY)).toBe(legacyRaw);
    expect(persisted.schemaVersion).toBe(4);
    expect(persisted.revision).toBe(6);
    expect(game.state.dayClose.phase).toBe('workday_open');
    expect(game.state.opportunities.selectionSeed).toMatch(/^legacy-v2-fnv1a32-/);
  });

  it('backs up exact v3 bytes before rewriting a v4 envelope and retires only the numeric field', () => {
    const storage = new MemoryStorage();
    const state = validSavedState();
    const legacyState = structuredClone(state) as unknown as Record<string, any>;
    const personIds = Object.keys(legacyState.world.people);
    const fromId = legacyState.player.currentCharacterId;
    const toId = personIds.find((id) => id !== fromId)!;
    legacyState.world.relationships = {
      [fromId]: {
        [toId]: {
          dimensions: { trust: 51, respect: 52, affection: 20, resentment: 0, rivalry: 0, familiarity: 68 },
          history: [{ id: 'legacy-history', dayNumber: 1, summary: 'Legacy history remains unchanged.' }],
        },
      },
    };
    delete legacyState.world.relationshipFamiliarityEpisodes;
    const legacyRaw = JSON.stringify({
      schemaVersion: 3, gameVersion: '0.1.0', revision: 8,
      savedAt: '2026-11-22T12:00:00.000Z', state: legacyState,
    });
    storage.setItem(SAVE_KEY, legacyRaw);

    const game = renderProvider(storage);
    const persisted = JSON.parse(storage.getItem(SAVE_KEY) ?? 'null');

    expect(game.loadStatus).toBe('ready');
    expect(storage.getItem(ROLLBACK_SAVE_KEY)).toBe(legacyRaw);
    expect(persisted.schemaVersion).toBe(4);
    expect(persisted.state.world.relationshipFamiliarityEpisodes).toEqual({});
    expect(persisted.state.world.relationships[fromId][toId].dimensions).not.toHaveProperty('familiarity');
    expect(persisted.state.world.relationships[fromId][toId].history).toEqual(legacyState.world.relationships[fromId][toId].history);
  });

  it('does not expose a migrated legacy save as playable when the rollback or v4 write fails', () => {
    const storage = new MemoryStorage();
    const state = validSavedState();
    const legacyState = structuredClone(state) as unknown as Record<string, any>;
    delete legacyState.world.relationshipFamiliarityEpisodes;
    for (const targets of Object.values(legacyState.world.relationships) as any[]) for (const relationship of Object.values(targets) as any[]) relationship.dimensions.familiarity = 0;
    delete legacyState.dayClose;
    delete legacyState.opportunities.selectionSeed;
    delete legacyState.opportunities.occurrenceLedger;
    const legacyRaw = JSON.stringify({
      schemaVersion: 2, gameVersion: '0.1.0', revision: 3,
      savedAt: '2026-11-22T12:00:00.000Z', state: legacyState,
    });
    storage.setItem(SAVE_KEY, legacyRaw);
    storage.failWrites = true;

    const game = renderProvider(storage);
    const result = game.dispatch({ type: 'SPEND_AP', amount: 1, reason: 'Must remain paused' });

    expect(game.loadStatus).toBe('read_error');
    expect(game.needsCharacterCreation).toBe(false);
    expect(result.feedback?.code).toBe('save-load-confirmation-required');
    expect(storage.getItem(SAVE_KEY)).toBe(legacyRaw);
  });

  it('does not overwrite a legacy primary save unless the exact rollback bytes are confirmed', () => {
    const storage = new MemoryStorage();
    const state = validSavedState();
    const legacyState = structuredClone(state) as unknown as Record<string, any>;
    delete legacyState.world.relationshipFamiliarityEpisodes;
    for (const targets of Object.values(legacyState.world.relationships) as any[]) for (const relationship of Object.values(targets) as any[]) relationship.dimensions.familiarity = 0;
    const legacyRaw = JSON.stringify({
      schemaVersion: 3, gameVersion: '0.1.0', revision: 11,
      savedAt: '2026-11-22T12:00:00.000Z', state: legacyState,
    });
    storage.setItem(SAVE_KEY, legacyRaw);
    storage.corruptRollbackWrites = true;

    const game = renderProvider(storage);

    expect(game.loadStatus).toBe('read_error');
    expect(storage.getItem(SAVE_KEY)).toBe(legacyRaw);
    expect(storage.getItem(ROLLBACK_SAVE_KEY)).not.toBe(legacyRaw);
  });

  it('keeps the exact legacy rollback when the v4 write cannot be confirmed by readback', () => {
    const storage = new MemoryStorage();
    const state = validSavedState();
    const legacyState = structuredClone(state) as unknown as Record<string, any>;
    delete legacyState.world.relationshipFamiliarityEpisodes;
    for (const targets of Object.values(legacyState.world.relationships) as any[]) for (const relationship of Object.values(targets) as any[]) relationship.dimensions.familiarity = 0;
    delete legacyState.dayClose;
    delete legacyState.opportunities.selectionSeed;
    delete legacyState.opportunities.occurrenceLedger;
    const legacyRaw = JSON.stringify({
      schemaVersion: 2, gameVersion: '0.1.0', revision: 10,
      savedAt: '2026-11-22T12:00:00.000Z', state: legacyState,
    });
    storage.setItem(SAVE_KEY, legacyRaw);
    storage.corruptSaveWrites = true;

    const game = renderProvider(storage);

    expect(game.loadStatus).toBe('read_error');
    expect(game.needsCharacterCreation).toBe(false);
    expect(storage.getItem(ROLLBACK_SAVE_KEY)).toBe(legacyRaw);
    expect(restoreSave(storage.getItem(ROLLBACK_SAVE_KEY), INITIAL_WORK_CATALOG)).not.toBeNull();
  });

  it('rolls back a Day-Close transition when its durable save write fails', () => {
    const storage = new MemoryStorage();
    const state = validSavedState();
    storage.setItem(SAVE_KEY, JSON.stringify(createSaveEnvelope(state, 2, '2026-11-22T12:00:00.000Z')));
    const game = renderProvider(storage);
    const priorState = game.state;
    storage.failWrites = true;

    const result = game.dispatch({ type: 'END_DAY', expectedDayNumber: priorState.calendar.dayNumber });

    expect(result.feedback?.code).toBe('day-close-save-failed');
    expect(result.state.calendar.dayNumber).toBe(priorState.calendar.dayNumber);
    expect(result.state).toBe(priorState);
    expect(storage.getItem(SAVE_KEY)).toContain('"revision":2');
  });

  it('persists and restores an open Evening Interlude without replaying settlement credits', () => {
    const storage = new MemoryStorage();
    const state = validSavedState();
    storage.setItem(SAVE_KEY, JSON.stringify(createSaveEnvelope(state, 4, '2026-11-22T12:00:00.000Z')));
    const game = renderProvider(storage);
    const opened = game.dispatch({ type: 'END_DAY', expectedDayNumber: state.calendar.dayNumber });
    expect(opened.state.dayClose.phase).toBe('interlude_open');
    expect(JSON.parse(storage.getItem(SAVE_KEY) ?? 'null').state.dayClose.phase).toBe('interlude_open');

    const restored = renderProvider(storage);
    expect(restored.state.dayClose.pendingSettlementId).toBe(opened.state.dayClose.pendingSettlementId);
    expect(restored.state.calendar.dayNumber).toBe(state.calendar.dayNumber);
    const begun = restored.dispatch({
      type: 'BEGIN_WORKDAY',
      expectedSettlementId: restored.state.dayClose.pendingSettlementId!,
    });
    expect(begun.state.calendar.dayNumber).toBe(state.calendar.dayNumber + 1);
    expect(begun.state.dayClose.phase).toBe('workday_open');
  });

  it('preserves a corrupt v2 save and blocks automatic production actions', () => {
    const storage = new MemoryStorage();
    const malformed = '{not valid json';
    storage.setItem(SAVE_KEY, malformed);

    const game = renderProvider(storage);
    const before = game.state;
    const result = game.dispatch({ type: 'SPEND_AP', amount: 1, reason: 'Must remain blocked' });

    expect(game.loadStatus).toBe('corrupt_save');
    expect(result.state).toBe(before);
    expect(result.feedback?.code).toBe('save-load-confirmation-required');
    expect(storage.getItem(SAVE_KEY)).toBe(malformed);
  });

  it('guards read errors without writing a fallback over storage', () => {
    let writes = 0;
    const storage: ProductionStorage = {
      getItem: () => { throw new Error('Storage access denied'); },
      setItem: () => { writes += 1; },
    };
    const game = renderProvider(storage);
    const result = game.dispatch({ type: 'SPEND_AP', amount: 1, reason: 'Must remain blocked' });

    expect(game.loadStatus).toBe('read_error');
    expect(result.feedback?.code).toBe('save-load-confirmation-required');
    expect(writes).toBe(0);
  });

  it('keeps transitions in memory when a storage write fails', () => {
    const storage = new MemoryStorage();
    storage.setItem(SAVE_KEY, JSON.stringify(createSaveEnvelope(validSavedState(), 2, '2026-11-22T12:00:00.000Z')));
    const game = renderProvider(storage);
    storage.failWrites = true;

    const first = game.dispatch({ type: 'SPEND_AP', amount: 1, reason: 'First in-memory action' });
    const second = game.dispatch({ type: 'SPEND_AP', amount: 5, reason: 'Second in-memory action' });
    const overdraw = game.dispatch({ type: 'SPEND_AP', amount: 1, reason: 'Confirm latest state' });

    expect(first.state.actionEconomy.apRemaining).toBe(5);
    expect(second.state.actionEconomy.apRemaining).toBe(0);
    expect(overdraw.state).toBe(second.state);
    expect(overdraw.feedback?.code).toBe('insufficient-ap');
    expect(storage.getItem(SAVE_KEY)).toContain('"revision":2');
  });

  it('resets only scribe_game_v2 after explicit confirmation', () => {
    const storage = new MemoryStorage();
    storage.setItem(SAVE_KEY, 'corrupt');
    storage.setItem('scribe_legacy_state', 'legacy-state');
    storage.setItem('scribe_player', 'legacy-player');
    const game = renderProvider(storage);

    expect(game.loadStatus).toBe('corrupt_save');
    expect(game.startFreshProductionSave()).toBe(true);
    expect(storage.getItem(SAVE_KEY)).toBe('corrupt');
    expect(game.createCharacterAndStartGame(TEST_CHARACTER_CREATION)).toBe(true);

    const raw = storage.getItem(SAVE_KEY);
    expect(raw).not.toBeNull();
    expect(restoreSave(raw, INITIAL_WORK_CATALOG)?.state.works.activeWorkId).toBe('work-storehouse-reckoning');
    expect(storage.getItem('scribe_legacy_state')).toBe('legacy-state');
    expect(storage.getItem('scribe_player')).toBe('legacy-player');
  });
});
