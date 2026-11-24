import type { Appointment, GameState, Person, WorldEvent } from './types';
import type { EventId, InstitutionId, PersonId, AppointmentId } from './ids';
import { UR_GIR_PERSON_ID } from './ids';
import { NORTH_BAY_LOCATION_ID, NORTH_BAY_PEOPLE } from '../content/assignments/northBayRoofInspection';
import { ERA1_COM_F01_PEOPLE } from '../content/assignments/eraICommercialMartial';
import {
  MATTER_IDS, STOREHOUSE_INSTITUTION_ID, SOUTH_COURT_LOCATION_ID, SOUTH_LOADING_LOCATION_ID, ERA1_COM_F01_LOCATION_ID,
  createSouthCourtDeliveryMatter, createSouthLoadingAwningMatter, createMaterialNotAsDescribedMatter,
} from '../engine/institutionalMatters';
export const INITIAL_PERSON_ID = 'person-enlil-barni' as PersonId;
export function createInitialGameState(player?: Person, opportunitySeed = 'era1-initial-state-seed'): GameState {
  const initialPerson: Person = player ?? {
    id: INITIAL_PERSON_ID, name: 'Enlil-barni', alive: true, affiliations: [],
    lifeStage: 'junior_scribe' as const,
    socialIdentity: { occupation: 'Scribe', summary: 'A junior scribe attached to the Temple Storehouse work.' },
    scribal: {
      stage: 'initialized',
      careerXp: 150, cumulativeShortageStress: 0, obligations: [], wallet: { money: 12, provisions: 5, shortageWorkdays: 0 },
      skills: {}, attributes: {}, specializations: [], traits: [], conditions: [], equipment: [], stress: 15,
      professionalReputation: { competence: 50, reliability: 50, discretion: 50, judgment: 50 },
      institutionalStanding: {},
    },
  };
  const activePlayer = initialPerson;
  const apprenticeId = 'person-uruk-nin-aya' as PersonId;
  const colleagueId = UR_GIR_PERSON_ID;
  // Authored fictional Uruk scribes provide a small, connected continuity network.
  const apprentice: Person = {
    id: apprenticeId, name: 'Nin-aya', alive: true, affiliations: [],
    lifeStage: 'apprentice' as const,
    socialIdentity: { occupation: 'Scribal apprentice', summary: 'An apprentice learning tablet preparation and copying under senior instruction.' },
    circumstances: [{ id: 'circumstance-nin-aya-instruction', kind: 'instruction', summary: 'Practicing copied lines under the Senior Scribe’s instruction.', sinceDay: 1, status: 'active', visibility: 'public' }],
    objectives: [{ id: 'objective-nin-aya-scribal-learning', horizon: 'long_term', summary: 'Become a capable independent scribe.', motivation: 'She wants to progress beyond practice copies and take responsibility for real records.', createdDay: 1, status: 'active', visibility: 'private' }],
    scribal: {
      stage: 'initialized',
      careerXp: 35, cumulativeShortageStress: 0, obligations: [], wallet: { money: 7, provisions: 3, shortageWorkdays: 0 },
      skills: { reading_scripts: { level: 2, skillXp: 15 } }, attributes: {},
      specializations: [], traits: [], conditions: [], equipment: [], stress: 8,
      professionalReputation: { competence: 42, reliability: 48, discretion: 45, judgment: 40 },
      institutionalStanding: {},
    },
  };
  const colleague: Person = {
    id: colleagueId, name: 'Ur-gir', alive: true, affiliations: [],
    lifeStage: 'established_scribe' as const,
    socialIdentity: { occupation: 'Scribe', summary: 'An established scribal colleague with his own household resources and professional obligations.' },
    scribal: {
      stage: 'initialized',
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
  const maintenanceWorkerId = 'person-aru' as PersonId;
  const templeStorehouseId = 'institution-uruk-temple-storehouse' as InstitutionId;
  const storehouseLocationId = NORTH_BAY_LOCATION_ID;
  const maintenanceWorker: Person = {
    id: maintenanceWorkerId, name: 'Aru', alive: true, affiliations: [templeStorehouseId], currentLocationId: storehouseLocationId,
    lifeStage: 'craft_practitioner' as const,
    socialIdentity: { occupation: 'Storehouse maintenance worker', summary: 'A storehouse laborer available for routine maintenance assigned from the existing maintenance allocation.' },
  };
  const dudu: Person = {
    id: NORTH_BAY_PEOPLE.repairer, name: 'Dudu', alive: true, affiliations: [templeStorehouseId], currentLocationId: storehouseLocationId,
    lifeStage: 'craft_practitioner' as const,
    socialIdentity: { occupation: 'Repairer', summary: 'A repairer engaged for specific storehouse maintenance commissions.' },
  };
  const appointments: Appointment[] = [
    { id: 'appointment-shuruppak-ilu-senior-scribe' as AppointmentId, personId: shuruppakId, institutionId: templeStorehouseId, title: 'Senior Scribe', authorityScope: ['Assign and review scribal work', 'Determine institutional follow-up from submitted records'], responsibilities: ['Review submitted accounts and reports', 'Determine whether further institutional action is warranted'], authorityCapabilities: ['assess_institutional_reports', 'verify_institutional_execution', 'resolve_institutional_matters'], startDay: 1 },
    { id: 'appointment-ur-nanna-storehouse-steward' as AppointmentId, personId: urNannaId, institutionId: templeStorehouseId, title: 'Storehouse Steward', authorityScope: ['Control ordinary storehouse access', 'Maintain custody and maintenance records', 'Authorize routine storehouse maintenance within the existing maintenance allocation'], responsibilities: ['Safeguard institutional stocks', 'Maintain custody and maintenance records', 'Commission ordinary maintenance using already allocated storehouse labor and materials'], authorityCapabilities: ['authorize_routine_storehouse_maintenance', 'verify_institutional_execution'], startDay: 1 },
    { id: 'appointment-utu-mansum-receiving-official' as AppointmentId, personId: utuMansumId, institutionId: templeStorehouseId, title: 'Receiving Official', authorityScope: ['Inspect and record incoming deliveries'], responsibilities: ['Record intake quantities and condition'], startDay: 1 },
  ];
  const deliveryMatterId = MATTER_IDS.southCourtDelivery;
  const awningMatterId = MATTER_IDS.southLoadingAwning;
  const materialDescriptionMatterId = MATTER_IDS.era1ComF01;
  const deliveryEventId = 'event-south-court-delivery-source' as EventId;
  const awningEventId = 'event-south-loading-awning-source' as EventId;
  const materialDescriptionEventId = 'event-era1-com-f01-seeded-delivery' as EventId;
  const deliveryEvent: WorldEvent = {
    id: deliveryEventId, dayNumber: 1,
    summary: 'A dispatch copy records 24 capacity measures and the receiving tally records 23; the difference is not located.',
    personIds: [urNannaId, utuMansumId, enlilKisuId, shuruppakId],
    institutionIds: [templeStorehouseId], locationId: SOUTH_COURT_LOCATION_ID,
  };
  const awningEvent: WorldEvent = {
    id: awningEventId, dayNumber: 1,
    summary: 'Two reed ties on the south loading awning are observed frayed; the steward requests a condition report before further loading.',
    personIds: [urNannaId, shuruppakId, maintenanceWorkerId],
    institutionIds: [templeStorehouseId], locationId: SOUTH_LOADING_LOCATION_ID,
  };
  const materialDescriptionEvent: WorldEvent = {
    id: materialDescriptionEventId, dayNumber: 1,
    summary: 'A provisional procurement request calls for worked timber; the sender’s tag describes the load as worked, while the receiving observation describes the visible pieces as unworked. The difference is documented but not explained.',
    personIds: [utuMansumId, ERA1_COM_F01_PEOPLE.workshopOverseer, ERA1_COM_F01_PEOPLE.responsibleAuthority, ERA1_COM_F01_PEOPLE.carrier],
    institutionIds: [templeStorehouseId], locationId: ERA1_COM_F01_LOCATION_ID,
  };
  const materialDescriptionMatter = { ...createMaterialNotAsDescribedMatter(1), sourceEventId: materialDescriptionEventId,
    provenance: [...(createMaterialNotAsDescribedMatter(1).provenance ?? []),
      { id: 'comf01-source-event', kind: 'event' as const, sourceId: materialDescriptionEventId, description: 'The procurement/delivery description difference is recorded as a distinct causal source event.' }] };
  const deliveryMatter = { ...createSouthCourtDeliveryMatter(1), sourceEventId: deliveryEventId,
    provenance: [...(createSouthCourtDeliveryMatter(1).provenance ?? []),
      { id: 'delivery-source-event', kind: 'event' as const, sourceId: deliveryEventId, description: 'The dispatch/receiving discrepancy is recorded as an active in-world matter.' }] };
  const awningMatter = { ...createSouthLoadingAwningMatter(1), sourceEventId: awningEventId,
    provenance: [...(createSouthLoadingAwningMatter(1).provenance ?? []),
      { id: 'awning-source-event', kind: 'event' as const, sourceId: awningEventId, description: 'The observed frayed ties and request for inspection are recorded as an active in-world matter.' }] };
  const casePeople: Person[] = [
    {
      id: shuruppakId, name: 'Shuruppak-ilu', alive: true, affiliations: [templeStorehouseId],
      lifeStage: 'senior_scribe' as const,
      socialIdentity: { occupation: 'Senior Scribe', summary: 'The senior scribe responsible for reviewing accounts and determining institutional follow-up.' },
      objectives: [{ id: 'objective-shuruppak-record-integrity', horizon: 'long_term' as const, summary: 'Preserve the reliability of storehouse records.', motivation: 'Senior review is only useful when claims remain within what their sources establish.', createdDay: 1, status: 'active' as const, visibility: 'private' as const, relatedMatterIds: [deliveryMatterId] }],
      commitments: [{ id: 'commitment-shuruppak-review', kind: 'office_duty' as const, summary: 'Review submitted accounts and determine whether further institutional action is warranted.', basis: { kind: 'appointment' as const, id: 'appointment-shuruppak-ilu-senior-scribe' as AppointmentId }, createdDay: 1, status: 'active' as const, visibility: 'public' as const, institutionId: templeStorehouseId, relatedMatterIds: [deliveryMatterId] }],
      circumstances: [{ id: 'circumstance-shuruppak-review-pending', kind: 'institutional_duty' as const, summary: 'A review may follow once the dispatch and receiving records have been reconciled.', sinceDay: 1, status: 'active' as const, visibility: 'public' as const, relatedMatterIds: [deliveryMatterId] }],
    },
    {
      id: urNannaId, name: 'Ur-Nanna', alive: true, affiliations: [templeStorehouseId],
      lifeStage: 'active_official' as const,
      socialIdentity: { occupation: 'Storehouse Steward', summary: 'The steward responsible for storehouse access, custody, and maintenance records.' },
      objectives: [
        { id: 'objective-ur-nanna-delivery', horizon: 'immediate' as const, summary: 'Resolve the delivery discrepancy before the next stock tally.', motivation: 'The stock account cannot be reconciled while dispatch and intake figures differ.', createdDay: 1, status: 'active' as const, visibility: 'private' as const, relatedMatterIds: [deliveryMatterId] },
        { id: 'objective-ur-nanna-awning', horizon: 'immediate' as const, summary: 'Establish whether the south loading awning is safe for further loading.', motivation: 'Frayed ties may worsen under the weight and movement of loading activity.', createdDay: 1, status: 'active' as const, visibility: 'private' as const, relatedMatterIds: [awningMatterId] },
      ],
      commitments: [{ id: 'commitment-ur-nanna-custody', kind: 'office_duty' as const, summary: 'Safeguard institutional stocks and maintain custody and maintenance records.', basis: { kind: 'appointment' as const, id: 'appointment-ur-nanna-storehouse-steward' as AppointmentId }, createdDay: 1, status: 'active' as const, visibility: 'public' as const, institutionId: templeStorehouseId, relatedMatterIds: [deliveryMatterId, awningMatterId] }],
      circumstances: [
        { id: 'circumstance-ur-nanna-delivery', kind: 'dispute' as const, summary: 'The south-court stock account remains open pending comparison of dispatch and receiving quantities.', sinceDay: 1, status: 'active' as const, visibility: 'public' as const, relatedMatterIds: [deliveryMatterId] },
        { id: 'circumstance-ur-nanna-awning', kind: 'work' as const, summary: 'Two reed ties on the south loading awning are visibly frayed; the condition should be documented before further loading.', sinceDay: 1, status: 'active' as const, visibility: 'public' as const, relatedMatterIds: [awningMatterId] },
      ],
    },
    {
      id: utuMansumId, name: 'Utu-mansum', alive: true, affiliations: [templeStorehouseId],
      lifeStage: 'active_official' as const,
      socialIdentity: { occupation: 'Receiving Official', summary: 'The official who inspects incoming deliveries and records intake quantities and condition.' },
      objectives: [{ id: 'objective-utu-mansum-receipt', horizon: 'immediate' as const, summary: 'Keep the receiving tally within the quantity actually counted at intake.', motivation: 'His attestation establishes the receiving count, not what left the dispatch yard or where any difference arose.', createdDay: 1, status: 'active' as const, visibility: 'private' as const, relatedMatterIds: [deliveryMatterId] }],
      commitments: [{ id: 'commitment-utu-mansum-receiving', kind: 'office_duty' as const, summary: 'Inspect incoming deliveries and record intake quantities and condition.', basis: { kind: 'appointment' as const, id: 'appointment-utu-mansum-receiving-official' as AppointmentId }, createdDay: 1, status: 'active' as const, visibility: 'public' as const, institutionId: templeStorehouseId, relatedMatterIds: [deliveryMatterId] }],
      circumstances: [{ id: 'circumstance-utu-mansum-receipt', kind: 'dispute' as const, summary: 'His receiving tally records 23 measures at intake; it does not establish what happened before arrival.', sinceDay: 1, status: 'active' as const, visibility: 'public' as const, relatedMatterIds: [deliveryMatterId] }],
    },
    {
      id: enlilKisuId, name: 'Enlil-kisu', alive: true, affiliations: [],
      socialIdentity: { occupation: 'Carrier Foreman', summary: 'A carrier foreman whose dispatch copy records quantities leaving the canal-side holding yard.' },
      objectives: [{ id: 'objective-enlil-kisu-dispatch', horizon: 'immediate' as const, summary: 'Ensure the dispatch quantity is distinguished from the receiving count.', motivation: 'The dispatch copy records what left the yard; it does not establish what arrived or assign responsibility for the difference.', createdDay: 1, status: 'active' as const, visibility: 'private' as const, relatedMatterIds: [deliveryMatterId] }],
      circumstances: [{ id: 'circumstance-enlil-kisu-dispatch', kind: 'dispute' as const, summary: 'His dispatch copy records 24 measures leaving the holding yard; the receiving tally records 23 at intake.', sinceDay: 1, status: 'active' as const, visibility: 'public' as const, relatedMatterIds: [deliveryMatterId] }],
    },
    { id: ninKasiId, name: 'Nin-kasi', alive: true, affiliations: [templeStorehouseId] },
    { id: ERA1_COM_F01_PEOPLE.workshopOverseer, name: 'Ur-Lamma', alive: true, affiliations: [], currentLocationId: ERA1_COM_F01_LOCATION_ID,
      lifeStage: 'craft_practitioner' as const, socialIdentity: { occupation: 'Precinct workshop overseer', summary: 'A workshop overseer who judges whether delivered material is suitable for the work in hand.' } },
    { id: ERA1_COM_F01_PEOPLE.responsibleAuthority, name: 'Lu-Nanshe', alive: true, affiliations: [templeStorehouseId], currentLocationId: ERA1_COM_F01_LOCATION_ID,
      lifeStage: 'active_official' as const, socialIdentity: { occupation: 'Household overseer', summary: 'A responsible overseer who decides whether a disputed delivery is accepted or referred for replacement.' } },
    { id: ERA1_COM_F01_PEOPLE.carrier, name: 'Kuli', alive: true, affiliations: [], currentLocationId: ERA1_COM_F01_LOCATION_ID,
      lifeStage: 'craft_practitioner' as const, socialIdentity: { occupation: 'Carrier', summary: 'A carrier who brought the covered load to the receiving court and can give an account of his part in its movement.' } },
  ];
  const people: Record<PersonId, Person> = {
    [activePlayer.id]: activePlayer,
    [apprenticeId]: apprentice,
    [colleagueId]: colleague,
    ...Object.fromEntries(casePeople.map((person) => [person.id, person])) as Record<PersonId, Person>,
    [dudu.id]: dudu,
    [maintenanceWorker.id]: maintenanceWorker,
  };
  return {
    calendar: { eraId: 'era-1', dayNumber: 1, displayDate: 'Day 1 · Uruk (c. 3200 BCE)' },
    dayClose: { phase: 'workday_open', pendingSettlementId: null, lastFinalizedSettlementId: null, pendingCredits: [], preview: null },
    actionEconomy: { dailyApAllocation: 6, apRemaining: 6, overtimeUsedToday: false, nextDayApPenalty: false, recoveryLaborUsedToday: false },
    player: { currentCharacterId: activePlayer.id },
    pendingSuccession: null,
    characterTransitions: [],
    world: {
      people,
      relationships: player ? {} : {
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
        authority: ['Maintain storehouse accounts', 'Authorize stock inspection and segregation'], standing: 50, activeMatters: [MATTER_IDS.tutorial, deliveryMatterId, awningMatterId, materialDescriptionMatterId],
      } }, locations: {
        [storehouseLocationId]: { id: storehouseLocationId, name: 'Temple Storehouse, north storage bay' },
        [SOUTH_COURT_LOCATION_ID]: { id: SOUTH_COURT_LOCATION_ID, name: 'Temple Storehouse, south receiving court' },
        [SOUTH_LOADING_LOCATION_ID]: { id: SOUTH_LOADING_LOCATION_ID, name: 'Temple Storehouse, south loading court' },
        [ERA1_COM_F01_LOCATION_ID]: { id: ERA1_COM_F01_LOCATION_ID, name: 'Eanna receiving court, Uruk' },
      },
      appointments: Object.fromEntries(appointments.map((appointment) => [appointment.id, appointment])), events: { [deliveryEventId]: deliveryEvent, [awningEventId]: awningEvent, [materialDescriptionEventId]: materialDescriptionEvent }, knowledge: {},
      matters: {
        [MATTER_IDS.tutorial]: { id: MATTER_IDS.tutorial, institutionId: STOREHOUSE_INSTITUTION_ID, kind: 'tutorial', summary: 'The Storehouse Reckoning introductory tutorial.', status: 'active', createdDay: 1 },
        [deliveryMatterId]: deliveryMatter,
        [awningMatterId]: awningMatter,
        [materialDescriptionMatterId]: materialDescriptionMatter,
      },
    },
    historicalProgression: { historicalXp: 0, completedWorks: [] },
    opportunities: { assignments: {}, challenges: {}, challengeOutcomes: [], assignmentAggregates: {}, recentActivity: [], selectionSeed: opportunitySeed, occurrenceLedger: [], assignmentGeneratorLedger: { sequence: 0, lastPresentedDayByActivity: {} } },
    works: { activeWorkId: null, progress: {} },
    records: { entries: {}, permanentOutcomes: [] },
    journal: { notices: [] },
  };
}
