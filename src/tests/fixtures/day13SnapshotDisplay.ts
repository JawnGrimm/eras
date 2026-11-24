import { createNewGameState, type EraICharacterCreationInput } from '../../state/newGameState';
import { getInitializedScribal } from '../../state/scribalState';
import { TEST_CHARACTER_CREATION } from './newGameCharacter';
import type { GameState } from '../../state/types';

/**
 * Display-projection fixture based on GD-STATE-INTEGRITY-001 §3.1.
 * The final observed ledger values are seeded as final state for UI projection
 * regression only. This is not a reconstructed gameplay save and must not be
 * used to infer or validate the transactions that produced those balances.
 */
export function createDay13SnapshotDisplayFixture(
  character: EraICharacterCreationInput = TEST_CHARACTER_CREATION,
): GameState {
  const base = createNewGameState(character);
  const person = base.world.people[base.player.currentCharacterId];
  const scribal = getInitializedScribal(person);
  if (!scribal) throw new Error('Day-13 display fixture requires the authored test character profile.');

  return {
    ...base,
    calendar: {
      ...base.calendar,
      dayNumber: 13,
      displayDate: 'Day 13 · Uruk (c. 3200 BCE)',
    },
    actionEconomy: {
      ...base.actionEconomy,
      apRemaining: 3,
      dailyApAllocation: 6,
    },
    world: {
      ...base.world,
      people: {
        ...base.world.people,
        [person.id]: {
          ...person,
          scribal: {
            ...scribal,
            wallet: { ...scribal.wallet, money: 77, provisions: 9 },
            careerXp: 631,
            stress: 5,
          },
        },
      },
    },
    historicalProgression: {
      ...base.historicalProgression,
      historicalXp: 0,
    },
  };
}
