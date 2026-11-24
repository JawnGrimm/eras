import type { GameState, PendingSettlementCredit } from '../state/types';

/** Queue an earned Assignment payment for the next exactly-once preliminary close. */
export function queueSettlementCredit(
  state: GameState,
  credit: Omit<PendingSettlementCredit, 'status' | 'creditedBySettlementId'>,
): GameState {
  if (!Number.isFinite(credit.money) || !Number.isFinite(credit.provisions)
    || credit.money < 0 || credit.provisions < 0 || credit.money + credit.provisions <= 0) return state;
  if (state.dayClose.pendingCredits.some((item) => item.id === credit.id)) return state;
  return {
    ...state,
    dayClose: {
      ...state.dayClose,
      pendingCredits: [...state.dayClose.pendingCredits, { ...credit, status: 'pending' }],
    },
  };
}
