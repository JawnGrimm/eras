import type { GameState } from './types';
import type { PersonId } from './ids';
export const INITIAL_PERSON_ID = 'person-enlil-barni' as PersonId;
export function createInitialGameState(): GameState {
  const initialPerson = {
    id: INITIAL_PERSON_ID, name: 'Enlil-barni', alive: true, affiliations: [],
    scribal: {
      careerXp: 150, wallet: { money: 12, provisions: 5, shortageWorkdays: 0 },
      skills: {}, attributes: {}, specializations: [], traits: [], conditions: [], equipment: [], stress: 15,
      professionalReputation: { competence: 50, reliability: 50, discretion: 50, judgment: 50 },
      institutionalStanding: {},
    },
  };
  const apprenticeId = 'person-uruk-nin-aya' as PersonId;
  const colleagueId = 'person-uruk-ur-gir' as PersonId;
  // Authored fictional Uruk scribes provide a small, connected continuity network.
  const apprentice = {
    id: apprenticeId, name: 'Nin-aya', alive: true, affiliations: [],
    scribal: {
      careerXp: 35, wallet: { money: 7, provisions: 3, shortageWorkdays: 0 },
      skills: { reading_scripts: { level: 2, skillXp: 15 } }, attributes: {},
      specializations: [], traits: [], conditions: [], equipment: [], stress: 8,
      professionalReputation: { competence: 42, reliability: 48, discretion: 45, judgment: 40 },
      institutionalStanding: {},
    },
  };
  const colleague = {
    id: colleagueId, name: 'Ur-gir', alive: true, affiliations: [],
    scribal: {
      careerXp: 90, wallet: { money: 16, provisions: 6, shortageWorkdays: 0 },
      skills: { recordkeeping_accounts: { level: 3, skillXp: 30 } }, attributes: {},
      specializations: [], traits: [], conditions: [], equipment: [], stress: 12,
      professionalReputation: { competence: 55, reliability: 52, discretion: 50, judgment: 53 },
      institutionalStanding: {},
    },
  };
  return {
    calendar: { eraId: 'era-1', dayNumber: 1, displayDate: 'Day 1, Early Season of Inundation (c. 3200 BCE)' },
    actionEconomy: { dailyApAllocation: 6, apRemaining: 6, overtimeUsedToday: false, nextDayApPenalty: false },
    player: { currentCharacterId: INITIAL_PERSON_ID },
    pendingSuccession: null,
    characterTransitions: [],
    world: {
      people: { [INITIAL_PERSON_ID]: initialPerson, [apprenticeId]: apprentice, [colleagueId]: colleague },
      relationships: {
        [INITIAL_PERSON_ID]: {
          [apprenticeId]: { dimensions: { trust: 65, respect: 55, affection: 45, resentment: 0, rivalry: 5, familiarity: 60 }, history: [{ id: 'rel-enlil-nin-aya-1', dayNumber: 1, summary: 'Nin-aya has learned routine tablet preparation alongside Enlil-barni.' }] },
        },
        [colleagueId]: {
          [INITIAL_PERSON_ID]: { dimensions: { trust: 50, respect: 62, affection: 20, resentment: 0, rivalry: 10, familiarity: 45 }, history: [{ id: 'rel-ur-gir-enlil-1', dayNumber: 1, summary: 'Ur-gir has worked alongside Enlil-barni on storehouse accounts.' }] },
        },
      },
      institutions: {}, locations: {},
      appointments: {}, events: {}, knowledge: {},
    },
    historicalProgression: { historicalXp: 0, completedWorks: [] },
    opportunities: { assignments: {}, challenges: {}, challengeOutcomes: [], assignmentAggregates: {}, recentActivity: [] },
    works: { activeWorkId: null, progress: {} },
    records: { entries: {}, permanentOutcomes: [] },
    journal: { notices: [] },
  };
}
