import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { transitionGame } from '../engine/actionEconomy';
import type { ActionFeedback, CareerProgressionPolicy, GameAction, GameState, TransitionResult } from './types';
import type { WorkDefinition } from '../works/workDefinition';
import { createCharacterCreationPreviewState, createNewGameState, INITIAL_WORK_CATALOG, type EraICharacterCreationInput } from './newGameState';
import { createSaveEnvelope, isLegacyV2Save, restoreSave, ROLLBACK_SAVE_KEY, SAVE_KEY } from './saveEnvelope';

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
  hasUnsavedChanges: boolean;
  storageError: string | null;
  needsCharacterCreation: boolean;
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
 * Reads the stable production save slot. A v2 envelope is validated, backed up,
 * migrated, and durably rewritten as v3 before the session becomes playable.
 */
export function initializeProductionSession(
  storage: ProductionStorage | null,
  workCatalog: Readonly<Record<string, WorkDefinition<any>>> = INITIAL_WORK_CATALOG,
): ProductionSession {
  const placeholderState = () => createCharacterCreationPreviewState();
  if (!storage) {
    return {
      state: placeholderState(), loadStatus: 'ready', revision: 0,
      feedback: storageFeedback('save-write-failed', 'Browser storage is unavailable. You can create and play a character in this session, but progress cannot be saved between visits.'),
      hasUnsavedChanges: true, storageError: 'Browser storage is unavailable; progress exists only in this session.',
      needsCharacterCreation: true,
    };
  }
  let raw: string | null;
  try {
    raw = storage.getItem(SAVE_KEY);
  } catch {
    return {
      state: placeholderState(), loadStatus: 'read_error', revision: 0,
      feedback: storageFeedback('save-read-failed', 'The production save could not be read. It has not been overwritten.'),
      hasUnsavedChanges: false, storageError: 'The existing production save could not be read.',
      needsCharacterCreation: false,
    };
  }
  if (raw !== null) {
    const restored = restoreSave(raw, workCatalog);
    if (!restored) {
      return {
        state: placeholderState(), loadStatus: 'corrupt_save', revision: 0,
        feedback: storageFeedback('corrupt-save', 'The existing production save is malformed or incompatible. It has been preserved; choose Start Fresh Production Save only if you want to replace it.'),
        hasUnsavedChanges: false, storageError: 'The existing production save is malformed or incompatible.',
        needsCharacterCreation: false,
      };
    }
    if (isLegacyV2Save(raw)) {
      try {
        // Preserve the exact validated v2 bytes before replacing the primary slot.
        storage.setItem(ROLLBACK_SAVE_KEY, raw);
        storage.setItem(SAVE_KEY, JSON.stringify(restored));
      } catch {
        return {
          state: placeholderState(), loadStatus: 'read_error', revision: restored.revision,
          feedback: storageFeedback('save-migration-failed', 'The v2 save was validated and migrated in memory, but its rollback copy or v3 write could not be confirmed. The original save remains the recovery source; play is paused.'),
          hasUnsavedChanges: false, storageError: 'The v2-to-v3 migration could not be durably committed.',
          needsCharacterCreation: false,
        };
      }
    }
    return {
      state: restored.state, loadStatus: 'ready', revision: restored.revision,
      feedback: null, hasUnsavedChanges: false, storageError: null,
      needsCharacterCreation: false,
    };
  }

  return {
    state: placeholderState(), loadStatus: 'ready', revision: 0,
    feedback: null, hasUnsavedChanges: false, storageError: null,
    needsCharacterCreation: true,
  };
}

interface GameContextValue {
  state: GameState;
  feedback: ActionFeedback | null;
  loadStatus: ProductionLoadStatus;
  hasUnsavedChanges: boolean;
  storageError: string | null;
  needsCharacterCreation: boolean;
  dispatch: (action: GameAction) => TransitionResult;
  clearFeedback: () => void;
  startFreshProductionSave: () => boolean;
  createCharacterAndStartGame: (input: EraICharacterCreationInput) => boolean;
}

const GameContext = createContext<GameContextValue | null>(null);

/**
 * Production state boundary. Dispatch applies pure transitions synchronously against
 * the latest snapshot. Fresh games are persisted only after Creator confirmation.
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
    ? {
      state: initialState, loadStatus: 'ready', revision: 0, feedback: null,
      hasUnsavedChanges: false, storageError: null, needsCharacterCreation: false,
    }
    : initializeProductionSession(resolvedStorage, resolvedCatalog));
  const stateRef = useRef(session.state);
  const revisionRef = useRef(session.revision);
  const loadStatusRef = useRef(session.loadStatus);
  const [feedback, setFeedback] = useState<ActionFeedback | null>(session.feedback);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(session.hasUnsavedChanges);
  const [storageError, setStorageError] = useState<string | null>(session.storageError);

  const dispatch = useCallback((action: GameAction): TransitionResult => {
    if (loadStatusRef.current !== 'ready') {
      const blocked = storageFeedback('save-load-confirmation-required',
        'Production actions are paused because the existing save could not be loaded. Choose Start Fresh Production Save to replace it.');
      setFeedback(blocked);
      return { state: stateRef.current, feedback: blocked };
    }

    const previousState = stateRef.current;
    const result = transitionGame(previousState, action, careerPolicy, resolvedCatalog);
    if (result.state !== previousState) {
      const dayCloseBoundary = action.type === 'END_DAY' || action.type === 'BUY_PROVISIONS' || action.type === 'BEGIN_WORKDAY';
      if (dayCloseBoundary) {
        try {
          const nextRevision = revisionRef.current + 1;
          if (!resolvedStorage) throw new Error('Browser storage is unavailable.');
          resolvedStorage.setItem(SAVE_KEY, JSON.stringify(createSaveEnvelope(result.state, nextRevision)));
          revisionRef.current = nextRevision;
        } catch {
          const blocked = storageFeedback('day-close-save-failed',
            'The Day-Close transition was rolled back because it could not be saved. No settlement phase, credit, sustenance, or calendar change was applied.');
          setHasUnsavedChanges(false);
          setStorageError('The Day-Close transition could not be durably written; the prior saved state remains active.');
          setFeedback(blocked);
          return { state: previousState, feedback: blocked };
        }
        stateRef.current = result.state;
        setSession((current) => ({ ...current, state: result.state }));
        setHasUnsavedChanges(false);
        setStorageError(null);
        setFeedback(result.feedback);
        return result;
      }

      stateRef.current = result.state;
      setSession((current) => ({ ...current, state: result.state }));
      try {
        const nextRevision = revisionRef.current + 1;
        if (!resolvedStorage) throw new Error('Browser storage is unavailable.');
        resolvedStorage.setItem(SAVE_KEY, JSON.stringify(createSaveEnvelope(result.state, nextRevision)));
        revisionRef.current = nextRevision;
        setHasUnsavedChanges(false);
        setStorageError(null);
        setFeedback(result.feedback);
      } catch {
        setHasUnsavedChanges(true);
        setStorageError('The latest in-memory changes could not be written to the production save.');
        setFeedback(storageFeedback('save-write-failed',
          'The action was applied in memory, but the production save could not be written. Your current session remains active; storage will be retried on the next state change.'));
      }
      return result;
    }
    setFeedback(result.feedback);
    return result;
  }, [careerPolicy, resolvedCatalog, resolvedStorage]);

  const startFreshProductionSave = useCallback((): boolean => {
    const placeholder = createCharacterCreationPreviewState();
    stateRef.current = placeholder;
    loadStatusRef.current = 'ready';
    setSession({
      state: placeholder, loadStatus: 'ready', revision: 0, feedback: null,
      hasUnsavedChanges: false, storageError: resolvedStorage ? null : 'Browser storage is unavailable; progress exists only in this session.',
      needsCharacterCreation: true,
    });
    setHasUnsavedChanges(!resolvedStorage);
    setStorageError(resolvedStorage ? null : 'Browser storage is unavailable; progress exists only in this session.');
    setFeedback(null);
    revisionRef.current = 0;
    return true;
  }, [resolvedStorage]);

  const createCharacterAndStartGame = useCallback((input: EraICharacterCreationInput): boolean => {
    let fresh: GameState;
    try {
      fresh = createNewGameState(input);
    } catch (error) {
      setFeedback(storageFeedback('character-creation-invalid',
        error instanceof Error ? error.message : 'The character could not be created.'));
      return false;
    }
    if (resolvedStorage) {
      try {
        resolvedStorage.setItem(SAVE_KEY, JSON.stringify(createSaveEnvelope(fresh, 0)));
      } catch {
        setFeedback(storageFeedback('save-write-failed',
          'The new character could not be saved. Your existing save has not been replaced.'));
        return false;
      }
    }
    stateRef.current = fresh;
    revisionRef.current = 0;
    loadStatusRef.current = 'ready';
    setSession({
      state: fresh, loadStatus: 'ready', revision: 0, feedback: null,
      hasUnsavedChanges: !resolvedStorage,
      storageError: resolvedStorage ? null : 'Browser storage is unavailable; progress exists only in this session.',
      needsCharacterCreation: false,
    });
    setHasUnsavedChanges(!resolvedStorage);
    setStorageError(resolvedStorage ? null : 'Browser storage is unavailable; progress exists only in this session.');
    setFeedback(null);
    return true;
  }, [resolvedStorage]);

  const clearFeedback = useCallback(() => setFeedback(null), []);

  return (
    <GameContext.Provider value={{
      state: session.state,
      feedback,
      loadStatus: session.loadStatus,
      hasUnsavedChanges,
      storageError,
      needsCharacterCreation: session.needsCharacterCreation,
      dispatch,
      clearFeedback,
      startFreshProductionSave,
      createCharacterAndStartGame,
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
