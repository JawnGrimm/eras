import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { transitionGame } from '../engine/actionEconomy';
import type { ActionFeedback, CareerProgressionPolicy, GameAction, GameState, TransitionResult } from './types';
import type { WorkDefinition } from '../works/workDefinition';
import { createNewGameState, INITIAL_WORK_CATALOG } from './newGameState';
import { createSaveEnvelope, restoreSave, SAVE_KEY } from './saveEnvelope';

export type ProductionLoadStatus = 'ready' | 'corrupt_save' | 'read_error';

export interface ProductionStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

interface ProductionSession {
  state: GameState;
  loadStatus: ProductionLoadStatus;
  revision: number;
  feedback: ActionFeedback | null;
}

function browserStorage(): ProductionStorage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

function storageFeedback(code: string, message: string): ActionFeedback {
  return { kind: 'error', code, message };
}

/**
 * Reads only the production v2 key. A malformed existing save is never replaced
 * by the fallback state; starting fresh is an explicit user action.
 */
export function initializeProductionSession(
  storage: ProductionStorage | null,
  workCatalog: Readonly<Record<string, WorkDefinition<any>>> = INITIAL_WORK_CATALOG,
): ProductionSession {
  const freshState = () => createNewGameState();
  if (!storage) {
    return { state: freshState(), loadStatus: 'read_error', revision: 0,
      feedback: storageFeedback('save-read-failed', 'Production storage is unavailable. Start a fresh production save explicitly to continue.') };
  }
  let raw: string | null;
  try {
    raw = storage.getItem(SAVE_KEY);
  } catch {
    return { state: freshState(), loadStatus: 'read_error', revision: 0,
      feedback: storageFeedback('save-read-failed', 'The production save could not be read. It has not been overwritten.') };
  }
  if (raw !== null) {
    const restored = restoreSave(raw, workCatalog);
    if (!restored) {
      return { state: freshState(), loadStatus: 'corrupt_save', revision: 0,
        feedback: storageFeedback('corrupt-save', 'The existing production save is malformed or incompatible. It has been preserved; choose Start Fresh Production Save only if you want to replace it.') };
    }
    return { state: restored.state, loadStatus: 'ready', revision: restored.revision, feedback: null };
  }

  const state = freshState();
  try {
    storage.setItem(SAVE_KEY, JSON.stringify(createSaveEnvelope(state, 0)));
    return { state, loadStatus: 'ready', revision: 0, feedback: null };
  } catch {
    return { state, loadStatus: 'ready', revision: 0,
      feedback: storageFeedback('save-write-failed', 'The new production state is active in memory, but could not be saved to browser storage.') };
  }
}

interface GameContextValue {
  state: GameState;
  feedback: ActionFeedback | null;
  loadStatus: ProductionLoadStatus;
  dispatch: (action: GameAction) => TransitionResult;
  clearFeedback: () => void;
  startFreshProductionSave: () => boolean;
}

const GameContext = createContext<GameContextValue | null>(null);

/**
 * Production state boundary. Dispatch applies pure transitions synchronously against
 * the latest snapshot. This provider remains unmounted until the 9B-6 cutover.
 */
export function GameProvider({
  children,
  initialState,
  careerPolicy,
  workCatalog,
  storage,
}: PropsWithChildren<{
  initialState?: GameState;
  careerPolicy?: CareerProgressionPolicy;
  workCatalog?: Readonly<Record<string, WorkDefinition<any>>>;
  storage?: ProductionStorage | null;
}>) {
  const resolvedCatalog = workCatalog ?? INITIAL_WORK_CATALOG;
  const resolvedStorage = storage === undefined ? browserStorage() : storage;
  const [session, setSession] = useState<ProductionSession>(() => initialState
    ? { state: initialState, loadStatus: 'ready', revision: 0, feedback: null }
    : initializeProductionSession(resolvedStorage, resolvedCatalog));
  const stateRef = useRef(session.state);
  const revisionRef = useRef(session.revision);
  const loadStatusRef = useRef(session.loadStatus);
  const [feedback, setFeedback] = useState<ActionFeedback | null>(session.feedback);

  const dispatch = useCallback((action: GameAction): TransitionResult => {
    if (loadStatusRef.current !== 'ready') {
      const blocked = storageFeedback('save-load-confirmation-required',
        'Production actions are paused because the existing save could not be loaded. Choose Start Fresh Production Save to replace it.');
      setFeedback(blocked);
      return { state: stateRef.current, feedback: blocked };
    }

    const result = transitionGame(stateRef.current, action, careerPolicy, resolvedCatalog);
    if (result.state !== stateRef.current) {
      stateRef.current = result.state;
      setSession((current) => ({ ...current, state: result.state }));
      try {
        const nextRevision = revisionRef.current + 1;
        resolvedStorage?.setItem(SAVE_KEY, JSON.stringify(createSaveEnvelope(result.state, nextRevision)));
        revisionRef.current = nextRevision;
        setFeedback(result.feedback);
      } catch {
        setFeedback(storageFeedback('save-write-failed',
          'The action was applied in memory, but the production save could not be written. Your current session remains active; storage will be retried on the next state change.'));
      }
      return result;
    }
    setFeedback(result.feedback);
    return result;
  }, [careerPolicy, resolvedCatalog, resolvedStorage]);

  const startFreshProductionSave = useCallback((): boolean => {
    if (!resolvedStorage) {
      setFeedback(storageFeedback('save-write-failed', 'Browser storage is unavailable; the existing production save was not changed.'));
      return false;
    }
    const fresh = createNewGameState();
    try {
      resolvedStorage.setItem(SAVE_KEY, JSON.stringify(createSaveEnvelope(fresh, 0)));
    } catch {
      setFeedback(storageFeedback('save-write-failed', 'The fresh production save could not be written. The current in-memory state and existing stored data were preserved.'));
      return false;
    }
    stateRef.current = fresh;
    revisionRef.current = 0;
    loadStatusRef.current = 'ready';
    setSession({ state: fresh, loadStatus: 'ready', revision: 0, feedback: null });
    setFeedback(null);
    return true;
  }, [resolvedStorage]);

  const clearFeedback = useCallback(() => setFeedback(null), []);

  return (
    <GameContext.Provider value={{
      state: session.state,
      feedback,
      loadStatus: session.loadStatus,
      dispatch,
      clearFeedback,
      startFreshProductionSave,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used inside GameProvider');
  return context;
}
