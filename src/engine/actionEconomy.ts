import type { GameAction, GameState, TransitionResult } from '../state/types';

function feedback(kind: 'success' | 'error' | 'info', code: string, message: string) {
  return { kind, code, message } as const;
}

function withNotice(state: GameState, category: 'settlement', message: string): GameState {
  const notice = {
    id: `notice-${state.calendar.dayNumber}-${state.journal.notices.length + 1}`,
    dayNumber: state.calendar.dayNumber,
    category,
    message,
    read: false,
  };
  return { ...state, journal: { ...state.journal, notices: [...state.journal.notices, notice] } };
}

/** Pure, deterministic state transition. UI feedback is ephemeral; notices are saved in GameState. */
export function transitionGame(state: GameState, action: GameAction): TransitionResult {
  const economy = state.actionEconomy;
  const person = state.world.people[state.player.currentCharacterId];
  const scribal = person?.scribal;
  if (!scribal) return { state, feedback: feedback('error', 'missing-active-character', 'The current character is unavailable.') };

  switch (action.type) {
    case 'SPEND_AP': {
      if (!Number.isFinite(action.amount) || action.amount <= 0 || !Number.isInteger(action.amount)) {
        return { state, feedback: feedback('error', 'invalid-ap-cost', 'The AP cost must be a positive whole number.') };
      }
      if (economy.apRemaining < action.amount) {
        return { state, feedback: feedback('error', 'insufficient-ap', 'There is not enough AP remaining today.') };
      }
      return {
        state: { ...state, actionEconomy: { ...economy, apRemaining: economy.apRemaining - action.amount } },
        feedback: feedback('success', 'ap-spent', action.reason),
      };
    }
    case 'ACTIVATE_OVERTIME': {
      if (economy.apRemaining !== 0 || economy.overtimeUsedToday) {
        return { state, feedback: feedback('error', 'overtime-unavailable', 'Overtime is available once, only after all allocated AP have been spent.') };
      }
      return {
        state: {
          ...state,
          actionEconomy: { ...economy, apRemaining: 1, overtimeUsedToday: true, nextDayApPenalty: true },
          world: {
            ...state.world,
            people: {
              ...state.world.people,
              [person.id]: { ...person, scribal: { ...scribal, stress: Math.min(100, scribal.stress + 5) } },
            },
          },
        },
        feedback: feedback('success', 'overtime-activated', 'One overtime AP is available. Stress increased by 5; tomorrow will have five AP.'),
      };
    }
    case 'END_DAY': {
      if (action.expectedDayNumber !== state.calendar.dayNumber) {
        return { state, feedback: feedback('error', 'stale-day-settlement', 'This Workday has already been settled or the calendar has changed.') };
      }
      if (economy.overtimeUsedToday && economy.apRemaining > 0) {
        return { state, feedback: feedback('error', 'overtime-ap-unspent', 'Spend the overtime AP before settling the day.') };
      }
      const hadProvision = scribal.wallet.provisions > 0;
      const shortageWorkdays = hadProvision ? 0 : scribal.wallet.shortageWorkdays + 1;
      const updatedScribal = {
        ...scribal,
        wallet: {
          ...scribal.wallet,
          provisions: hadProvision ? scribal.wallet.provisions - 1 : 0,
          shortageWorkdays,
        },
      };
      let next = {
        ...state,
        calendar: { ...state.calendar, dayNumber: state.calendar.dayNumber + 1 },
        actionEconomy: {
          dailyApAllocation: economy.nextDayApPenalty ? 5 as const : 6 as const,
          apRemaining: economy.nextDayApPenalty ? 5 : 6,
          overtimeUsedToday: false,
          nextDayApPenalty: false,
        },
        world: {
          ...state.world,
          people: { ...state.world.people, [person.id]: { ...person, scribal: updatedScribal } },
        },
      };
      if (hadProvision) {
        next = withNotice(next, 'settlement', 'One provision was consumed for daily sustenance.');
      } else {
        next = withNotice(next, 'settlement', shortageWorkdays <= 2
          ? `No provisions were available. Shortage day ${shortageWorkdays} of 2 grace days.`
          : 'No provisions were available for a third consecutive Workday. Shortage consequences begin.');
      }
      return { state: next, feedback: feedback('success', 'day-settled', 'The Workday has been settled.') };
    }
    case 'MARK_NOTICE_READ': {
      return {
        state: {
          ...state,
          journal: {
            ...state.journal,
            notices: state.journal.notices.map((notice) => notice.id === action.noticeId ? { ...notice, read: true } : notice),
          },
        },
        feedback: null,
      };
    }
  }
}
