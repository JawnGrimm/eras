import type { GameState } from './types';
import type { PersonId } from './ids';

export const INITIAL_PERSON_ID = 'person-enlil-barni' as PersonId;

export function createInitialGameState(): GameState {
  const initialPerson = {
    id: INITIAL_PERSON_ID,
    name: 'Enlil-barni',
    alive: true,
    affiliations: [],
    relationships: {},
    scribal: {
      careerXp: 150,
      wallet: { money: 12, provisions: 5, shortageWorkdays: 0 },
      skills: {},
      attributes: {},
      specializations: [],
      traits: [],
      conditions: [],
      equipment: [],
      stress: 15,
      professionalReputation: { competence: 50, reliability: 50, discretion: 50, judgment: 50 },
    },
  };

  return {
    calendar: {
      eraId: 'era-1',
      dayNumber: 1,
      displayDate: 'Day 1, Early Season of Inundation (c. 3200 BCE)',
    },
    actionEconomy: {
      dailyApAllocation: 6,
      apRemaining: 6,
      overtimeUsedToday: false,
      nextDayApPenalty: false,
    },
    player: { currentCharacterId: INITIAL_PERSON_ID },
    world: {
      people: { [INITIAL_PERSON_ID]: initialPerson },
      institutions: {},
      locations: {},
    },
    historicalProgression: { historicalXp: 0, completedWorks: [] },
    opportunities: { assignments: {}, challenges: {} },
    works: { activeWorkId: null, progress: {} },
    records: { permanentOutcomes: [] },
    journal: { notices: [] },
  };
}
