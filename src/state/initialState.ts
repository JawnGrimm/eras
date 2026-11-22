import type { GameState } from './types';
import type { InstitutionId, PersonId, AppointmentId } from './ids';
import { NORTH_BAY_LOCATION_ID, NORTH_BAY_PEOPLE } from '../content/assignments/northBayRoofInspection';
import { MATTER_IDS, STOREHOUSE_INSTITUTION_ID } from '../engine/institutionalMatters';
export const INITIAL_PERSON_ID = 'person-enlil-barni' as PersonId;
export function createInitialGameState(): GameState {
  const initialPerson = {
    id: INITIAL_PERSON_ID, name: 'Enlil-barni', alive: true, affiliations: [],
    scribal: {
      careerXp: 150, cumulativeShortageStress: 0, obligations: [], wallet: { money: 12, provisions: 5, shortageWorkdays: 0 },
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
      careerXp: 35, cumulativeShortageStress: 0, obligations: [], wallet: { money: 7, provisions: 3, shortageWorkdays: 0 },
      skills: { reading_scripts: { level: 2, skillXp: 15 } }, attributes: {},
      specializations: [], traits: [], conditions: [], equipment: [], stress: 8,
      professionalReputation: { competence: 42, reliability: 48, discretion: 45, judgment: 40 },
      institutionalStanding: {},
    },
  };
  const colleague = {
    id: colleagueId, name: 'Ur-gir', alive: true, affiliations: [],
    scribal: {
      careerXp: 90, cumulativeShortageStress: 0, obligations: [], wallet: { money: 16, provisions: 6, shortageWorkdays: 0 },
      skills: { recordkeeping_accounts: { level: 3, skillXp: 30 } }, attributes: {},
      specializations: [], traits: [], conditions: [], equipment: [], stress: 12,
      professionalReputation: { competence: 55, reliability: 52, discretion: 50, judgment: 53 },
      institutionalStanding: {},
    },
  };
  const shuruppakId = 'person-shuruppak-ilu' as PersonId;
  const urNannaId = 'person-ur-nanna' as PersonId;
  const utuMansumId = 'person-utu-mansum' as PersonId;
  const enlilKisuId = 'person-enlil-kisu' as PersonId;
  const ninKasiId = 'person-nin-kasi' as PersonId;
  const templeStorehouseId = 'institution-uruk-temple-storehouse' as InstitutionId;
  const storehouseLocationId = NORTH_BAY_LOCATION_ID;
  const dudu = { id: NORTH_BAY_PEOPLE.repairer, name: 'Dudu', alive: true, affiliations: [templeStorehouseId], currentLocationId: storehouseLocationId };
  const appointments = [
    { id: 'appointment-shuruppak-ilu-senior-scribe' as AppointmentId, personId: shuruppakId, institutionId: templeStorehouseId, title: 'Senior Scribe', authorityScope: ['Assign and review scribal work', 'Determine institutional follow-up from submitted records'], responsibilities: ['Review submitted accounts and reports', 'Determine whether further institutional action is warranted'], startDay: 1 },
    { id: 'appointment-ur-nanna-storehouse-steward' as AppointmentId, personId: urNannaId, institutionId: templeStorehouseId, title: 'Storehouse Steward', authorityScope: ['Control ordinary storehouse access', 'Maintain custody and maintenance records'], responsibilities: ['Safeguard institutional stocks', 'Maintain custody and maintenance records'], startDay: 1 },
    { id: 'appointment-utu-mansum-receiving-official' as AppointmentId, personId: utuMansumId, institutionId: templeStorehouseId, title: 'Receiving Official', authorityScope: ['Inspect and record incoming deliveries'], responsibilities: ['Record intake quantities and condition'], startDay: 1 },
  ];
  const casePeople = [
    { id: shuruppakId, name: 'Shuruppak-ilu', alive: true, affiliations: [templeStorehouseId] },
    { id: urNannaId, name: 'Ur-Nanna', alive: true, affiliations: [templeStorehouseId] },
    { id: utuMansumId, name: 'Utu-mansum', alive: true, affiliations: [templeStorehouseId] },
    { id: enlilKisuId, name: 'Enlil-kisu', alive: true, affiliations: [] },
    { id: ninKasiId, name: 'Nin-kasi', alive: true, affiliations: [templeStorehouseId] },
  ];
  return {
    calendar: { eraId: 'era-1', dayNumber: 1, displayDate: 'Day 1 · Uruk (c. 3200 BCE)' },
    actionEconomy: { dailyApAllocation: 6, apRemaining: 6, overtimeUsedToday: false, nextDayApPenalty: false, recoveryLaborUsedToday: false },
    player: { currentCharacterId: INITIAL_PERSON_ID },
    pendingSuccession: null,
    characterTransitions: [],
    world: {
      people: { [INITIAL_PERSON_ID]: initialPerson, [apprenticeId]: apprentice, [colleagueId]: colleague, ...Object.fromEntries(casePeople.map((person) => [person.id, person])), [dudu.id]: dudu },
      relationships: {
        [INITIAL_PERSON_ID]: {
          [apprenticeId]: { dimensions: { trust: 65, respect: 55, affection: 45, resentment: 0, rivalry: 5, familiarity: 60 }, history: [{ id: 'rel-enlil-nin-aya-1', dayNumber: 1, summary: 'Nin-aya has learned routine tablet preparation alongside Enlil-barni.' }] },
          [enlilKisuId]: { dimensions: { trust: 52, respect: 55, affection: 20, resentment: 0, rivalry: 0, familiarity: 18 }, history: [{ id: 'rel-enlil-barni-enlil-kisu-1', dayNumber: 1, summary: 'Enlil-barni knows Carrier Foreman Enlil-kisu through the Temple Storehouse dispatch and receiving work.' }] },
        },
        [colleagueId]: {
          [INITIAL_PERSON_ID]: { dimensions: { trust: 50, respect: 62, affection: 20, resentment: 0, rivalry: 10, familiarity: 45 }, history: [{ id: 'rel-ur-gir-enlil-1', dayNumber: 1, summary: 'Ur-gir has worked alongside Enlil-barni on storehouse accounts.' }] },
        },
        [enlilKisuId]: {
          [INITIAL_PERSON_ID]: { dimensions: { trust: 55, respect: 52, affection: 20, resentment: 0, rivalry: 0, familiarity: 18 }, history: [{ id: 'rel-enlil-kisu-enlil-barni-1', dayNumber: 1, summary: 'Enlil-kisu knows Enlil-barni as a junior scribe who handles receiving and dispatch records.' }] },
        },
      },
      institutions: { [templeStorehouseId]: {
        id: templeStorehouseId, name: 'Temple Storehouse', locationId: storehouseLocationId, responsibilities: ['Receive, safeguard, and issue institutional barley stocks'],
        authority: ['Maintain storehouse accounts', 'Authorize stock inspection and segregation'], standing: 50, activeMatters: [MATTER_IDS.tutorial],
      } }, locations: { [storehouseLocationId]: { id: storehouseLocationId, name: 'Temple Storehouse, north storage bay' } },
      appointments: Object.fromEntries(appointments.map((appointment) => [appointment.id, appointment])), events: {}, knowledge: {},
      matters: { [MATTER_IDS.tutorial]: { id: MATTER_IDS.tutorial, institutionId: STOREHOUSE_INSTITUTION_ID, kind: 'tutorial', summary: 'The Storehouse Reckoning introductory tutorial.', status: 'active', createdDay: 1 } },
    },
    historicalProgression: { historicalXp: 0, completedWorks: [] },
    opportunities: { assignments: {}, challenges: {}, challengeOutcomes: [], assignmentAggregates: {}, recentActivity: [], assignmentGeneratorLedger: { sequence: 0, lastPresentedDayByActivity: {} } },
    works: { activeWorkId: null, progress: {} },
    records: { entries: {}, permanentOutcomes: [] },
    journal: { notices: [] },
  };
}
