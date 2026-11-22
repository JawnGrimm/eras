import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { createInitialGameState } from './initialState';
import { transitionGame } from '../engine/actionEconomy';
import type { ActionFeedback, GameAction, GameState, TransitionResult } from './types';

interface GameContextValue {
  state: GameState;
  feedback: ActionFeedback | null;
  dispatch: (action: GameAction) => TransitionResult;
  clearFeedback: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

/**
 * Production state boundary. Dispatch applies pure transitions synchronously against
 * the latest snapshot, so batched UI events cannot read a stale React closure.
 * This provider is intentionally not mounted by App.tsx until the prototype shell
 * is replaced after the Storehouse regression port.
 */
export function GameProvider({ children, initialState }: PropsWithChildren<{ initialState?: GameState }>) {
  const [state, setState] = useState<GameState>(() => initialState ?? createInitialGameState());
  const stateRef = useRef(state);
  const [feedback, setFeedback] = useState<ActionFeedback | null>(null);

  const dispatch = useCallback((action: GameAction): TransitionResult => {
    const result = transitionGame(stateRef.current, action);
    stateRef.current = result.state;
    setState(result.state);
    setFeedback(result.feedback);
    return result;
  }, []);

  const clearFeedback = useCallback(() => setFeedback(null), []);

  return (
    <GameContext.Provider value={{ state, feedback, dispatch, clearFeedback }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used inside GameProvider');
  return context;
}
