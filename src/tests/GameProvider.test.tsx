import React, { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { GameProvider, useGame } from '../state/GameProvider';
import type { ProductionStorage } from '../state/GameProvider';
import { createNewGameState, INITIAL_WORK_CATALOG } from '../state/newGameState';
import { transitionGame } from '../engine/actionEconomy';
import { createSaveEnvelope, restoreSave, SAVE_KEY } from '../state/saveEnvelope';
import type { GameState } from '../state/types';

class MemoryStorage implements ProductionStorage {
  values = new Map<string, string>();
  failWrites = false;
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void {
    if (this.failWrites) throw new Error('Quota exceeded');
    this.values.set(key, value);
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
  return createNewGameState();
}

describe('GameProvider production persistence', () => {
  it('allows in-memory play when browser storage is unavailable', () => {
    const game = renderProvider(null);
    const result = game.dispatch({ type: 'SPEND_AP', amount: 1, reason: 'Continue without storage' });

    expect(game.loadStatus).toBe('ready');
    expect(game.feedback?.code).toBe('save-write-failed');
    expect(game.hasUnsavedChanges).toBe(true);
    expect(game.storageError).toContain('only in this session');
    expect(result.state.actionEconomy.apRemaining).toBe(5);
    expect(result.state).not.toBe(game.state);
  });

  it('creates and persists the authored Day 1 state only when the v2 key is absent', () => {
    const storage = new MemoryStorage();
    const game = renderProvider(storage);
    const saved = restoreSave(storage.getItem(SAVE_KEY), INITIAL_WORK_CATALOG);

    expect(game.loadStatus).toBe('ready');
    expect(game.state.works.activeWorkId).toBe('work-storehouse-reckoning');
    expect(Object.keys(game.state.opportunities.assignments)).toHaveLength(2);
    expect(Object.keys(game.state.opportunities.challenges)).toHaveLength(1);
    expect(saved?.state.calendar.dayNumber).toBe(1);
  });

  it('restores a valid v2 save using the registered Work catalog', () => {
    const storage = new MemoryStorage();
    const state = transitionGame(validSavedState(), { type: 'SPEND_AP', amount: 2, reason: 'Test saved AP' }).state;
    storage.setItem(SAVE_KEY, JSON.stringify(createSaveEnvelope(state, 7, '2026-11-22T12:00:00.000Z')));

    const game = renderProvider(storage);

    expect(game.loadStatus).toBe('ready');
    expect(game.state.actionEconomy.apRemaining).toBe(4);
    expect(game.state.works.activeWorkId).toBe(validSavedState().works.activeWorkId);
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

    const raw = storage.getItem(SAVE_KEY);
    expect(raw).not.toBeNull();
    expect(restoreSave(raw, INITIAL_WORK_CATALOG)?.state.works.activeWorkId).toBe('work-storehouse-reckoning');
    expect(storage.getItem('scribe_legacy_state')).toBe('legacy-state');
    expect(storage.getItem('scribe_player')).toBe('legacy-player');
  });
});
