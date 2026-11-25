import type { EventId, InstitutionId, LocationId, MatterId, PersonId, RecordId } from '../state/ids';
import type { GameState, InstitutionalMatter, Person, RecordEntry } from '../state/types';
import { ERA1_COM_F02_F04_PEOPLE, ERA1_COM_F02_RECORD_IDS, ERA1_COM_F03_RECORD_IDS, ERA1_COM_F04_RECORD_IDS } from '../content/assignments/eraICommercialFamilies';
import { ERA1_MAR_PEOPLE, ERA1_MAR_F01_RECORD_IDS, ERA1_MAR_F02_RECORD_IDS, ERA1_MAR_F03_RECORD_IDS, ERA1_MAR_F04_RECORD_IDS } from '../content/assignments/eraIMartialFamilies';

export const STOREHOUSE_INSTITUTION_ID = 'institution-uruk-temple-storehouse' as InstitutionId;
export const NORTH_BAY_LOCATION_ID = 'location-uruk-temple-storehouse' as LocationId;
export const SOUTH_COURT_LOCATION_ID = 'location-uruk-south-receiving-court' as LocationId;
export const SOUTH_LOADING_LOCATION_ID = 'location-uruk-south-loading-court' as LocationId;
export const ERA1_COM_F01_LOCATION_ID = 'location-uruk-eanna-receiving-court' as LocationId;

export const EANNA_INSTITUTION_ID = 'institution-uruk-eanna-precinct' as InstitutionId;
export const EANNA_TABLET_ROOM_LOCATION_ID = 'location-uruk-eanna-tablet-room' as LocationId;

/** Provisional social grouping used by the authored textile-household assignments. */
export const TEXTILE_HOUSEHOLD_INSTITUTION_ID = 'institution-uruk-textile-household-provisional' as InstitutionId;
export const TEXTILE_HOUSEHOLD_LOCATION_ID = 'location-uruk-textile-household-provisional' as LocationId;
export const RIVER_LANDING_LOCATION_ID = 'location-uruk-river-landing-provisional' as LocationId;
/** Provisional household context for the finite strongroom access incident. */
export const HOUSEHOLD_STRONGROOM_INSTITUTION_ID = 'institution-uruk-household-strongroom-provisional' as InstitutionId;
export const HOUSEHOLD_STRONGROOM_LOCATION_ID = 'location-uruk-household-strongroom-provisional' as LocationId;



export const MATTER_IDS = {
  tutorial: 'matter-storehouse-reckoning-tutorial' as MatterId,
  roofRepair: 'matter-north-bay-roof-verification' as MatterId,
  heldBarley: 'matter-held-barley-inspection' as MatterId,
  waterIngress: 'matter-north-bay-water-ingress' as MatterId,
  southCourtDelivery: 'matter-south-court-delivery-reconciliation' as MatterId,
  southLoadingAwning: 'matter-south-loading-awning-inspection' as MatterId,
  era1ComF01: 'matter-era1-com-f01-material-description' as MatterId,
} as const;

const PEOPLE = {
  steward: 'person-ur-nanna' as PersonId,
  receivingOfficial: 'person-utu-mansum' as PersonId,
  carrierForeman: 'person-enlil-kisu' as PersonId,
  seniorScribe: 'person-shuruppak-ilu' as PersonId,
  repairer: 'person-dudu' as PersonId,
  workshopOverseer: 'person-ur-lamma' as PersonId,
  responsibleAuthority: 'person-lu-nanshe' as PersonId,
  carrier: 'person-kuli' as PersonId,
} as const;

const ERA_I_ANCHOR_MATTER_SEEDS = [
  {
    dayNumber: 2, matterId: 'matter-era1-com-01-consignment' as MatterId,
    eventId: 'event-era1-com-01-consignment-source' as EventId,
    kind: 'era1_com_01_consignment' as const,
    summary: 'A consignment is presented for comparison before its receiving entry is accepted.',
    eventSummary: 'A vessel and textile consignment is presented at the Eanna receiving court. The tag and custody note are beside the dispatch and receiving entries; Utu-mansum needs the figures compared before closing the receipt.',
    personIds: [PEOPLE.receivingOfficial, PEOPLE.carrierForeman, PEOPLE.steward, PEOPLE.seniorScribe],
    locationId: ERA1_COM_F01_LOCATION_ID,
    provenance: [
      { id: 'com01-request', kind: 'instruction' as const, description: 'The receiving official requests a comparison before accepting the consignment entry.' },
      { id: 'com01-event', kind: 'event' as const, sourceId: 'event-era1-com-01-consignment-source', description: 'A distinct consignment is presented for receiving review.' },
    ],
  },
  {
    dayNumber: 3, matterId: 'matter-era1-com-02-brewing-account' as MatterId,
    eventId: 'event-era1-com-02-brewing-account-source' as EventId,
    kind: 'era1_com_02_brewing_account' as const,
    summary: 'A grain-product and malt account is submitted for a second arithmetic check.',
    eventSummary: 'The brewer worries that a short total will reduce his credit. The senior recorder asks for the groats and malt figures checked separately; one sign remains uncertain.',
    personIds: [PEOPLE.seniorScribe, PEOPLE.steward],
    locationId: EANNA_TABLET_ROOM_LOCATION_ID,
    provenance: [
      { id: 'com02-request', kind: 'instruction' as const, description: 'The senior recorder requests a second arithmetic check before the account is copied forward.' },
      { id: 'com02-event', kind: 'event' as const, sourceId: 'event-era1-com-02-brewing-account-source', description: 'A distinct account review is initiated.' },
    ],
  },
  {
    dayNumber: 4, matterId: 'matter-era1-civ-01-field-measurement' as MatterId,
    eventId: 'event-era1-civ-01-field-measurement-source' as EventId,
    kind: 'era1_civ_01_field_measurement' as const,
    summary: 'A readable field-measurement transcription is submitted for arithmetic review.',
    eventSummary: 'A recorder wants the parcel figures checked before the summary is copied. The source copy gives no clear date or place, and the figures are a readable working copy.',
    personIds: [PEOPLE.seniorScribe, PEOPLE.steward],
    locationId: EANNA_TABLET_ROOM_LOCATION_ID,
    provenance: [
      { id: 'civ01-request', kind: 'instruction' as const, description: 'A responsible recorder requests an arithmetic check before the working summary is copied.' },
      { id: 'civ01-event', kind: 'event' as const, sourceId: 'event-era1-civ-01-field-measurement-source', description: 'A distinct field-measurement account is submitted for review.' },
    ],
  },
  {
    dayNumber: 6, matterId: 'matter-era1-civ-02-labor-disbursement' as MatterId,
    eventId: 'event-era1-civ-02-labor-disbursement-source' as EventId,
    kind: 'era1_civ_02_labor_disbursement' as const,
    summary: 'A labor-group account and a separate grain-disbursement record are submitted for a bounded review.',
    eventSummary: 'A labor-group account is brought for checking alongside a separately sourced grain-disbursement record. The two copies are being checked side by side; neither names the same group or establishes an entitlement.',
    personIds: [PEOPLE.seniorScribe, PEOPLE.steward],
    locationId: EANNA_TABLET_ROOM_LOCATION_ID,
    provenance: [
      { id: 'civ02-request', kind: 'instruction' as const, description: 'The senior reviewer requests separate checks of the labor-group account and the grain-disbursement record.' },
      { id: 'civ02-event', kind: 'event' as const, sourceId: 'event-era1-civ-02-labor-disbursement-source', description: 'A distinct two-source accountability review is initiated; the records remain separate.' },
    ],
  },
  {
    dayNumber: 7, matterId: 'matter-era1-rel-01-inana-offering' as MatterId,
    eventId: 'event-era1-rel-01-inana-offering-source' as EventId,
    kind: 'era1_rel_01_inana_offering' as const,
    summary: 'Inana-associated offering entries and a separate commodity record are submitted for review.',
    eventSummary: 'A participant in offering preparations asks for the Inana-associated copy and a separate commodity record to be checked before work continues. She needs to know whether the missing entry can be found; the records do not link the two copies.',
    personIds: [PEOPLE.seniorScribe, 'person-nin-kasi' as PersonId],
    locationId: EANNA_TABLET_ROOM_LOCATION_ID,
    provenance: [
      { id: 'rel01-request', kind: 'instruction' as const, description: 'A participant in offering preparations requests a bounded review of the entries.' },
      { id: 'rel01-event', kind: 'event' as const, sourceId: 'event-era1-rel-01-inana-offering-source', description: 'Nin-kasi asks for the missing entry to be found before preparations continue.' },
    ],
  },
] as const;

export function createSouthCourtDeliveryMatter(dayNumber: number): InstitutionalMatter {
  return {
    id: MATTER_IDS.southCourtDelivery,
    institutionId: STOREHOUSE_INSTITUTION_ID,
    kind: 'south_court_delivery_reconciliation',
    summary: 'Twenty-four capacity measures were recorded as dispatched and twenty-three at intake; the one-measure difference remains unexplained.',
    status: 'active',
    createdDay: dayNumber,
    locationId: SOUTH_COURT_LOCATION_ID,
    involvedPersonIds: [PEOPLE.steward, PEOPLE.receivingOfficial, PEOPLE.carrierForeman, PEOPLE.seniorScribe],
    provenance: [
      { id: 'south-court-dispatch-copy', kind: 'record_copy', description: 'Carrier dispatch tablet attributed to Enlil-kisu: 24 standard capacity measures dispatched.' },
      { id: 'south-court-receiving-tally', kind: 'record_copy', description: 'Utu-mansum receiving tally: 23 standard capacity measures counted at intake.' },
      { id: 'south-court-steward-instruction', kind: 'instruction', description: 'Ur-Nanna requests reconciliation before the next storehouse tally.' },
      { id: 'south-court-liability-limit', kind: 'other', description: 'The records establish a difference between dispatch and intake, not where it arose or who is responsible.' },
    ],
  };
}

export function createSouthLoadingAwningMatter(dayNumber: number): InstitutionalMatter {
  return {
    id: MATTER_IDS.southLoadingAwning,
    institutionId: STOREHOUSE_INSTITUTION_ID,
    kind: 'south_loading_awning_inspection',
    summary: 'The south loading awning has two visibly frayed reed ties; its condition should be documented before further loading.',
    status: 'active',
    createdDay: dayNumber,
    locationId: SOUTH_LOADING_LOCATION_ID,
    involvedPersonIds: [PEOPLE.steward, PEOPLE.repairer, PEOPLE.seniorScribe],
    provenance: [
      { id: 'south-awning-observation', kind: 'observation', description: 'Two reed ties are visibly frayed; two support posts have been identified for inspection.' },
      { id: 'south-awning-steward-request', kind: 'instruction', description: 'Ur-Nanna requests a condition report before further loading.' },
      { id: 'south-awning-repair-scope', kind: 'testimony', description: 'Dudu states that his existing commission covers the north-bay mid-bay patch, not the south loading awning.' },
    ],
  };
}

export function createRoofRepairMatter(dayNumber: number, sourceRecordId?: RecordId): InstitutionalMatter {
  return {
    id: MATTER_IDS.roofRepair,
    institutionId: STOREHOUSE_INSTITUTION_ID,
    kind: 'roof_repair_verification',
    summary: 'Verify the north-bay roof repair; the full condition remains unresolved.',
    status: 'active',
    createdDay: dayNumber,
    ...(sourceRecordId ? { sourceRecordId } : {}),
    locationId: NORTH_BAY_LOCATION_ID,
    scheduledDevelopment: { kind: 'rain', dayNumber: dayNumber + 3 },
    involvedPersonIds: [PEOPLE.steward, PEOPLE.repairer, PEOPLE.receivingOfficial, PEOPLE.seniorScribe],
    provenance: [
      { id: 'north-bay-steward-report', kind: 'instruction', description: 'The Storehouse Steward requests verification of the reported repair.' },
      { id: 'north-bay-repair-scope', kind: 'testimony', description: 'The repairer describes the work included in the commission.' },
    ],
  };
}

function createAuthoredSourceRecord(input: {
  id: RecordId;
  createdDay: number;
  authorPersonId: PersonId;
  reportedByPersonId?: PersonId;
  institutionId: InstitutionId;
  title: string;
  assertion: string;
  uncertaintyLimit: string;
}): RecordEntry {
  const authorSourceId = `source-${input.id}-author`;
  const reportSourceId = `source-${input.id}-reported-by`;
  const sources = [
    { id: authorSourceId, kind: 'person' as const, sourceId: input.authorPersonId, description: 'The named scribe is responsible for recording this entry.' },
    ...(input.reportedByPersonId ? [{ id: reportSourceId, kind: 'person' as const, sourceId: input.reportedByPersonId, description: 'The named participant is the source of the reported account.' }] : []),
  ];
  return {
    id: input.id,
    createdDay: input.createdDay,
    authorPersonId: input.authorPersonId,
    institutionId: input.institutionId,
    title: input.title,
    sources,
    assertions: [{ id: `assertion-${input.id}`, text: input.assertion, classification: 'reported', sourceIds: sources.map((source) => source.id) }],
    uncertaintyLimits: [input.uncertaintyLimit],
    amendments: [],
  };
}

export function advanceInstitutionalMatters(state: GameState, nextDay: number): GameState {
  const matters = { ...state.world.matters };
  const events = { ...state.world.events };
  const institutions = { ...state.world.institutions };
  const locations = { ...state.world.locations };
  const people = { ...state.world.people };
  const records = { ...state.records.entries };
  let changed = false;

  // New authored participants and their social context are added lazily to
  // older saves when their first approved content event becomes eligible.
  if (nextDay >= 8 && !people[ERA1_COM_F02_F04_PEOPLE.gemeInana]) {
    people[ERA1_COM_F02_F04_PEOPLE.gemeInana] = {
      id: ERA1_COM_F02_F04_PEOPLE.gemeInana, name: 'Geme-Inana', alive: true,
      affiliations: [TEXTILE_HOUSEHOLD_INSTITUTION_ID], currentLocationId: TEXTILE_HOUSEHOLD_LOCATION_ID,
      lifeStage: 'craft_practitioner',
      socialIdentity: { occupation: 'Textile household organizer', summary: 'A household member who coordinates textile work and exchange obligations.' },
      objectives: [
        { id: 'objective-geme-inana-workframes', horizon: 'immediate', summary: 'Secure timber for household work-frames.', motivation: 'The household has work waiting that depends on the timber request.', createdDay: nextDay, status: 'active', visibility: 'public' },
        { id: 'objective-geme-inana-exchange', horizon: 'immediate', summary: 'Receive the goods expected from an earlier outbound exchange.', motivation: 'People in the household are waiting on the return before the next dispatch is sent.', createdDay: nextDay, status: 'active', visibility: 'public' },
      ],
      circumstances: [
        { id: 'circumstance-geme-inana-workframes', kind: 'work', summary: 'A household work-frame task is waiting on timber.', sinceDay: nextDay, status: 'active', visibility: 'public' },
        { id: 'circumstance-geme-inana-exchange', kind: 'dispute', summary: 'An earlier outbound exchange has not yet been fully returned.', sinceDay: nextDay, status: 'active', visibility: 'public' },
      ],
    } satisfies Person;
    changed = true;
  }
  if (nextDay >= 10 && !people[ERA1_COM_F02_F04_PEOPLE.amaGi]) {
    people[ERA1_COM_F02_F04_PEOPLE.amaGi] = {
      id: ERA1_COM_F02_F04_PEOPLE.amaGi, name: 'Ama-gi', alive: true, affiliations: [],
      currentLocationId: RIVER_LANDING_LOCATION_ID, lifeStage: 'craft_practitioner',
      socialIdentity: { occupation: 'Landing worker', summary: 'A participant in a consignment handover at the river landing.' },
    } satisfies Person;
    changed = true;
  }
  if (nextDay >= 10 && !people[ERA1_COM_F02_F04_PEOPLE.sigAna]) {
    people[ERA1_COM_F02_F04_PEOPLE.sigAna] = {
      id: ERA1_COM_F02_F04_PEOPLE.sigAna, name: 'Sig-ana', alive: true, affiliations: [],
      currentLocationId: RIVER_LANDING_LOCATION_ID, lifeStage: 'craft_practitioner',
      socialIdentity: { occupation: 'Witness', summary: 'A witness who observed part of a consignment handover.' },
    } satisfies Person;
    changed = true;
  }
  if (nextDay >= 8 && !institutions[EANNA_INSTITUTION_ID]) {
    institutions[EANNA_INSTITUTION_ID] = {
      id: EANNA_INSTITUTION_ID, name: 'Eanna Precinct', locationId: EANNA_TABLET_ROOM_LOCATION_ID,
      responsibilities: ['Maintain precinct records and supervised administrative work', 'Receive reports concerning precinct goods, labor, and offering preparations'],
      authority: ['Review submitted administrative records', 'Refer matters to the responsible precinct authority'],
      standing: 50, activeMatters: [],
    };
    changed = true;
  }
  if (nextDay >= 8 && !locations[ERA1_COM_F01_LOCATION_ID]) {
    locations[ERA1_COM_F01_LOCATION_ID] = { id: ERA1_COM_F01_LOCATION_ID, name: 'Eanna receiving court, Uruk' };
    changed = true;
  }
  if (nextDay >= 8 && !locations[EANNA_TABLET_ROOM_LOCATION_ID]) {
    locations[EANNA_TABLET_ROOM_LOCATION_ID] = { id: EANNA_TABLET_ROOM_LOCATION_ID, name: 'Eanna precinct tablet room, Uruk' };
    changed = true;
  }
  if (nextDay >= 8 && !institutions[TEXTILE_HOUSEHOLD_INSTITUTION_ID]) {
    institutions[TEXTILE_HOUSEHOLD_INSTITUTION_ID] = {
      id: TEXTILE_HOUSEHOLD_INSTITUTION_ID, name: 'Geme-Inana’s Textile Household',
      locationId: TEXTILE_HOUSEHOLD_LOCATION_ID,
      responsibilities: ['Coordinate household textile work and its associated exchange obligations'],
      authority: ['Decide whether to wait for an exchange return, send word, or withhold a later dispatch'],
      standing: 50, activeMatters: [],
    };
    changed = true;
  }
  if (nextDay >= 8 && !locations[TEXTILE_HOUSEHOLD_LOCATION_ID]) {
    locations[TEXTILE_HOUSEHOLD_LOCATION_ID] = { id: TEXTILE_HOUSEHOLD_LOCATION_ID, name: 'Textile household work space, Uruk' };
    changed = true;
  }
  if (nextDay >= 10 && !locations[RIVER_LANDING_LOCATION_ID]) {
    locations[RIVER_LANDING_LOCATION_ID] = { id: RIVER_LANDING_LOCATION_ID, name: 'River landing, Uruk' };
    changed = true;
  }



  // Commercial F02: a new timber delivery becomes an Assignment only while
  // both the Storehouse repair need and the household work-frame need remain open.
  if (nextDay >= 8 && !matters['matter-era1-com-f02-two-claims' as MatterId]) {
    const storehouseNeedOpen = Object.values(matters).some((matter) =>
      matter.status === 'active' && (matter.kind === 'roof_repair_verification' || matter.kind === 'north_bay_water_ingress'));
    const household = people[ERA1_COM_F02_F04_PEOPLE.gemeInana];
    const householdNeedOpen = household?.objectives?.some((objective) =>
      objective.id === 'objective-geme-inana-workframes' && objective.status === 'active');
    if (storehouseNeedOpen && householdNeedOpen && institutions[EANNA_INSTITUTION_ID]
      && institutions[TEXTILE_HOUSEHOLD_INSTITUTION_ID]) {
      const eventId = 'event-era1-com-f02-two-claims-delivery' as EventId;
      const sourceRecords: RecordId[] = [
        ERA1_COM_F02_RECORD_IDS.storehouseRequest,
        ERA1_COM_F02_RECORD_IDS.householdRequest,
        ERA1_COM_F02_RECORD_IDS.deliveryReceipt,
        ERA1_COM_F02_RECORD_IDS.carrierAccount,
      ];
      records[ERA1_COM_F02_RECORD_IDS.storehouseRequest] = createAuthoredSourceRecord({
        id: ERA1_COM_F02_RECORD_IDS.storehouseRequest, createdDay: nextDay,
        authorPersonId: ERA1_COM_F02_F04_PEOPLE.shuruppak, reportedByPersonId: ERA1_COM_F02_F04_PEOPLE.urNanna, institutionId: STOREHOUSE_INSTITUTION_ID,
        title: 'Storehouse request for timber', assertion: 'The Storehouse requests timber for the north-bay repair.',
        uncertaintyLimit: 'The Storehouse needs the timber for repair, while the household has work waiting; Lu-Nanshe must decide which request takes priority.',
      });
      records[ERA1_COM_F02_RECORD_IDS.householdRequest] = createAuthoredSourceRecord({
        id: ERA1_COM_F02_RECORD_IDS.householdRequest, createdDay: nextDay,
        authorPersonId: ERA1_COM_F02_F04_PEOPLE.shuruppak, reportedByPersonId: ERA1_COM_F02_F04_PEOPLE.gemeInana, institutionId: TEXTILE_HOUSEHOLD_INSTITUTION_ID,
        title: 'Sealed textile-household request', assertion: 'The household requests timber for work-frames; a sealing is present on the request.',
        uncertaintyLimit: 'The sealing establishes an impression, not the holder’s authority to commit this delivery.',
      });
      records[ERA1_COM_F02_RECORD_IDS.deliveryReceipt] = createAuthoredSourceRecord({
        id: ERA1_COM_F02_RECORD_IDS.deliveryReceipt, createdDay: nextDay,
        authorPersonId: ERA1_COM_F02_F04_PEOPLE.utuMansum, institutionId: STOREHOUSE_INSTITUTION_ID,
        title: 'Timber delivery receipt', assertion: 'A small load of timber is recorded as arrived at the receiving court.',
        uncertaintyLimit: 'The receipt establishes what arrived as recorded; it does not decide which request is entitled to the load.',
      });
      records[ERA1_COM_F02_RECORD_IDS.carrierAccount] = createAuthoredSourceRecord({
        id: ERA1_COM_F02_RECORD_IDS.carrierAccount, createdDay: nextDay,
        authorPersonId: ERA1_COM_F02_F04_PEOPLE.shuruppak, reportedByPersonId: ERA1_COM_F02_F04_PEOPLE.kuli, institutionId: EANNA_INSTITUTION_ID,
        title: 'Carrier account of delivery instruction', assertion: 'Kuli gives his account of the instruction he received for the delivery.',
        uncertaintyLimit: 'Kuli can say what instruction he heard, but both claimants still need their own accounts compared.',
      });
      events[eventId] = {
        id: eventId, dayNumber: nextDay,
        summary: 'A small timber delivery arrives while the Storehouse north-bay repair need and Geme-Inana’s household work-frame need are both open. Two documented requests compete for the same load; Lu-Nanshe asks for a neutral account before deciding priority.',
        personIds: [ERA1_COM_F02_F04_PEOPLE.luNanshe, ERA1_COM_F02_F04_PEOPLE.urNanna,
          ERA1_COM_F02_F04_PEOPLE.gemeInana, ERA1_COM_F02_F04_PEOPLE.utuMansum,
          ERA1_COM_F02_F04_PEOPLE.kuli, ERA1_COM_F02_F04_PEOPLE.dudu, ERA1_COM_F02_F04_PEOPLE.shuruppak],
        institutionIds: [EANNA_INSTITUTION_ID, STOREHOUSE_INSTITUTION_ID, TEXTILE_HOUSEHOLD_INSTITUTION_ID],
        locationId: ERA1_COM_F01_LOCATION_ID,
      };
      const matterId = 'matter-era1-com-f02-two-claims' as MatterId;
      matters[matterId] = {
        id: matterId, institutionId: EANNA_INSTITUTION_ID, kind: 'era1_com_f02_two_claims',
        summary: 'A small timber load is claimed by the Storehouse for north-bay repair and by a textile household for work-frames.',
        status: 'active', createdDay: nextDay, sourceEventId: eventId,
        sourceRecordId: ERA1_COM_F02_RECORD_IDS.deliveryReceipt,
        locationId: ERA1_COM_F01_LOCATION_ID,
        involvedPersonIds: [ERA1_COM_F02_F04_PEOPLE.luNanshe, ERA1_COM_F02_F04_PEOPLE.urNanna,
          ERA1_COM_F02_F04_PEOPLE.gemeInana, ERA1_COM_F02_F04_PEOPLE.utuMansum,
          ERA1_COM_F02_F04_PEOPLE.kuli, ERA1_COM_F02_F04_PEOPLE.dudu],
        provenance: [
          { id: 'comf02-storehouse-request', kind: 'record_copy', sourceId: ERA1_COM_F02_RECORD_IDS.storehouseRequest, description: 'The Storehouse claim and its stated repair need.' },
          { id: 'comf02-household-request', kind: 'record_copy', sourceId: ERA1_COM_F02_RECORD_IDS.householdRequest, description: 'The textile household claim and its sealing.' },
          { id: 'comf02-delivery-receipt', kind: 'record_copy', sourceId: ERA1_COM_F02_RECORD_IDS.deliveryReceipt, description: 'The receiving entry for the small timber load.' },
          { id: 'comf02-carrier-account', kind: 'record_copy', sourceId: ERA1_COM_F02_RECORD_IDS.carrierAccount, description: 'Kuli’s separately attributed account.' },
          { id: 'comf02-source-event', kind: 'event', sourceId: eventId, description: 'The delivery arrives while both documented needs remain open.' },
        ],
      };
      institutions[EANNA_INSTITUTION_ID] = {
        ...institutions[EANNA_INSTITUTION_ID],
        activeMatters: [...institutions[EANNA_INSTITUTION_ID].activeMatters, matterId],
      };
      changed = true;
    }
  }

  // Commercial F03 begins with a distinct outbound dispatch. The Assignment
  // is not offered until a later, separate partial-return event exists.
  if (nextDay >= 8 && !events['event-era1-com-f03-outbound-dispatch' as EventId]) {
    const household = people[ERA1_COM_F02_F04_PEOPLE.gemeInana];
    const exchangeOpen = household?.objectives?.some((objective) =>
      objective.id === 'objective-geme-inana-exchange' && objective.status === 'active');
    if (exchangeOpen && institutions[TEXTILE_HOUSEHOLD_INSTITUTION_ID]) {
      records[ERA1_COM_F03_RECORD_IDS.outboundDispatch] = createAuthoredSourceRecord({
        id: ERA1_COM_F03_RECORD_IDS.outboundDispatch, createdDay: nextDay,
        authorPersonId: ERA1_COM_F02_F04_PEOPLE.shuruppak, reportedByPersonId: ERA1_COM_F02_F04_PEOPLE.gemeInana, institutionId: TEXTILE_HOUSEHOLD_INSTITUTION_ID,
        title: 'Outbound household dispatch', assertion: 'The household records goods sent out with a carrier party under an expected return of goods of another kind.',
        uncertaintyLimit: 'The dispatch records what was sent; it does not record a written exchange equivalence.',
      });
      events['event-era1-com-f03-outbound-dispatch' as EventId] = {
        id: 'event-era1-com-f03-outbound-dispatch' as EventId, dayNumber: nextDay,
        summary: 'Goods leave Geme-Inana’s textile household under an expected return of goods of another kind. The dispatch is recorded, but no written equivalence is entered.',
        personIds: [ERA1_COM_F02_F04_PEOPLE.gemeInana, ERA1_COM_F02_F04_PEOPLE.enlilKisu],
        institutionIds: [TEXTILE_HOUSEHOLD_INSTITUTION_ID],
        locationId: TEXTILE_HOUSEHOLD_LOCATION_ID,
      };
      changed = true;
    }
  }

  if (nextDay >= 9 && !matters['matter-era1-com-f03-partial-return' as MatterId]
    && events['event-era1-com-f03-outbound-dispatch' as EventId]
    && events['event-era1-com-f03-outbound-dispatch' as EventId].dayNumber < nextDay) {
    const eventId = 'event-era1-com-f03-partial-return' as EventId;
    records[ERA1_COM_F03_RECORD_IDS.partialReturn] = createAuthoredSourceRecord({
      id: ERA1_COM_F03_RECORD_IDS.partialReturn, createdDay: nextDay,
      authorPersonId: ERA1_COM_F02_F04_PEOPLE.utuMansum, institutionId: EANNA_INSTITUTION_ID,
      title: 'Partial return receipt', assertion: 'The first return is received and recorded as partial against the earlier outbound dispatch.',
      uncertaintyLimit: 'The receipt shows what came back; Geme-Inana still needs the earlier agreement checked before deciding what is owed.',
    });
    events[eventId] = {
      id: eventId, dayNumber: nextDay,
      summary: 'The first return from the earlier outbound dispatch arrives only in part. Geme-Inana says the exchange was to return goods of another kind; Kuli says the remainder will follow on the next trip.',
      personIds: [ERA1_COM_F02_F04_PEOPLE.gemeInana, ERA1_COM_F02_F04_PEOPLE.kuli,
        ERA1_COM_F02_F04_PEOPLE.enlilKisu, ERA1_COM_F02_F04_PEOPLE.utuMansum],
      institutionIds: [TEXTILE_HOUSEHOLD_INSTITUTION_ID, EANNA_INSTITUTION_ID],
      locationId: ERA1_COM_F01_LOCATION_ID,
    };
    const matterId = 'matter-era1-com-f03-partial-return' as MatterId;
    matters[matterId] = {
      id: matterId, institutionId: TEXTILE_HOUSEHOLD_INSTITUTION_ID, kind: 'era1_com_f03_partial_return',
      summary: 'A first return has arrived only in part; the written dispatch and receipt do not record an exchange equivalence.',
      status: 'active', createdDay: nextDay, sourceEventId: eventId,
      sourceRecordId: ERA1_COM_F03_RECORD_IDS.partialReturn,
      locationId: TEXTILE_HOUSEHOLD_LOCATION_ID,
      involvedPersonIds: [ERA1_COM_F02_F04_PEOPLE.gemeInana, ERA1_COM_F02_F04_PEOPLE.kuli,
        ERA1_COM_F02_F04_PEOPLE.enlilKisu, ERA1_COM_F02_F04_PEOPLE.utuMansum],
      provenance: [
        { id: 'comf03-outbound-record', kind: 'record_copy', sourceId: ERA1_COM_F03_RECORD_IDS.outboundDispatch, description: 'The earlier outbound dispatch record.' },
        { id: 'comf03-outbound-event', kind: 'event', sourceId: 'event-era1-com-f03-outbound-dispatch', description: 'The distinct earlier dispatch event.' },
        { id: 'comf03-return-record', kind: 'record_copy', sourceId: ERA1_COM_F03_RECORD_IDS.partialReturn, description: 'The first partial return receipt.' },
        { id: 'comf03-return-event', kind: 'event', sourceId: eventId, description: 'The later partial-return event.' },
        { id: 'comf03-geme-account', kind: 'testimony', sourceId: ERA1_COM_F02_F04_PEOPLE.gemeInana, description: 'Geme-Inana’s spoken account of the exchange understanding.' },
        { id: 'comf03-kuli-account', kind: 'testimony', sourceId: ERA1_COM_F02_F04_PEOPLE.kuli, description: 'Kuli’s spoken account of the next trip.' },
        { id: 'comf03-enlil-recollection', kind: 'testimony', sourceId: ERA1_COM_F02_F04_PEOPLE.enlilKisu, description: 'Enlil-kisu’s recollection of the outbound carrying.' },
      ],
    };
    institutions[TEXTILE_HOUSEHOLD_INSTITUTION_ID] = {
      ...institutions[TEXTILE_HOUSEHOLD_INSTITUTION_ID],
      activeMatters: [...institutions[TEXTILE_HOUSEHOLD_INSTITUTION_ID].activeMatters, matterId],
    };
    changed = true;
  }

  // Commercial F04 is a separate finite consignment with three independent
  // tallies; the first recorded difference is visible, but the cause is not.
  if (nextDay >= 10 && !matters['matter-era1-com-f04-custody-chain' as MatterId]) {
    const eventId = 'event-era1-com-f04-custody-chain' as EventId;
    records[ERA1_COM_F04_RECORD_IDS.dispatchTally] = createAuthoredSourceRecord({
      id: ERA1_COM_F04_RECORD_IDS.dispatchTally, createdDay: nextDay,
      authorPersonId: ERA1_COM_F02_F04_PEOPLE.shuruppak, reportedByPersonId: ERA1_COM_F02_F04_PEOPLE.enlilKisu, institutionId: STOREHOUSE_INSTITUTION_ID,
      title: 'Dispatch tally', assertion: 'Twelve sealed vessels are recorded at dispatch.',
      uncertaintyLimit: 'The tally establishes the dispatch count, not the condition at later handovers.',
    });
    records[ERA1_COM_F04_RECORD_IDS.landingTally] = createAuthoredSourceRecord({
      id: ERA1_COM_F04_RECORD_IDS.landingTally, createdDay: nextDay,
      authorPersonId: ERA1_COM_F02_F04_PEOPLE.shuruppak, reportedByPersonId: ERA1_COM_F02_F04_PEOPLE.amaGi, institutionId: EANNA_INSTITUTION_ID,
      title: 'Landing tally', assertion: 'Twelve vessels are recorded at the intermediate landing handover.',
      uncertaintyLimit: 'The tally establishes the count at landing, not what happened after that handover.',
    });
    records[ERA1_COM_F04_RECORD_IDS.receivingTally] = createAuthoredSourceRecord({
      id: ERA1_COM_F04_RECORD_IDS.receivingTally, createdDay: nextDay,
      authorPersonId: ERA1_COM_F02_F04_PEOPLE.utuMansum, institutionId: STOREHOUSE_INSTITUTION_ID,
      title: 'Receiving tally and condition note', assertion: 'Eleven vessels are recorded at receipt; one vessel is noted as cracked.',
      uncertaintyLimit: 'The receiving tally and condition note do not establish when or how the vessel was damaged.',
    });
    events[eventId] = {
      id: eventId, dayNumber: nextDay,
      summary: 'A consignment of twelve sealed vessels is tallied at dispatch and again at the river landing. The receiving tally records eleven; one vessel is noted as cracked. The three tallies do not identify where or why the difference occurred.',
      personIds: [ERA1_COM_F02_F04_PEOPLE.enlilKisu, ERA1_COM_F02_F04_PEOPLE.amaGi,
        ERA1_COM_F02_F04_PEOPLE.kuli, ERA1_COM_F02_F04_PEOPLE.sigAna, ERA1_COM_F02_F04_PEOPLE.utuMansum],
      institutionIds: [STOREHOUSE_INSTITUTION_ID, EANNA_INSTITUTION_ID],
      locationId: RIVER_LANDING_LOCATION_ID,
    };
    const matterId = 'matter-era1-com-f04-custody-chain' as MatterId;
    matters[matterId] = {
      id: matterId, institutionId: STOREHOUSE_INSTITUTION_ID, kind: 'era1_com_f04_custody_chain',
      summary: 'Three custody tallies record twelve vessels at dispatch and landing, then eleven at receipt, with one cracked vessel noted.',
      status: 'active', createdDay: nextDay, sourceEventId: eventId,
      sourceRecordId: ERA1_COM_F04_RECORD_IDS.receivingTally,
      locationId: RIVER_LANDING_LOCATION_ID,
      involvedPersonIds: [ERA1_COM_F02_F04_PEOPLE.enlilKisu, ERA1_COM_F02_F04_PEOPLE.amaGi,
        ERA1_COM_F02_F04_PEOPLE.kuli, ERA1_COM_F02_F04_PEOPLE.sigAna, ERA1_COM_F02_F04_PEOPLE.utuMansum],
      provenance: [
        { id: 'comf04-dispatch-tally', kind: 'record_copy', sourceId: ERA1_COM_F04_RECORD_IDS.dispatchTally, description: 'The first tally at dispatch.' },
        { id: 'comf04-landing-tally', kind: 'record_copy', sourceId: ERA1_COM_F04_RECORD_IDS.landingTally, description: 'The second tally at landing.' },
        { id: 'comf04-receiving-tally', kind: 'record_copy', sourceId: ERA1_COM_F04_RECORD_IDS.receivingTally, description: 'The third tally and receiving condition note.' },
        { id: 'comf04-source-event', kind: 'event', sourceId: eventId, description: 'The consignment arrives with a recorded count difference.' },
        { id: 'comf04-sig-ana-account', kind: 'testimony', sourceId: ERA1_COM_F02_F04_PEOPLE.sigAna, description: 'Sig-ana’s account of the landing handover.' },
      ],
    };
    institutions[STOREHOUSE_INSTITUTION_ID] = {
      ...institutions[STOREHOUSE_INSTITUTION_ID],
      activeMatters: [...institutions[STOREHOUSE_INSTITUTION_ID].activeMatters, matterId],
    };
    changed = true;
  }

  // The five authored institutional anchors enter through distinct, dated
  // source events. They are finite opening situations, not recurring quota
  // generation; each retains its own matter and occurrence identity.
  for (const seed of ERA_I_ANCHOR_MATTER_SEEDS) {
    if (seed.dayNumber !== nextDay || matters[seed.matterId]) continue;
    if (!institutions[EANNA_INSTITUTION_ID]) {
      institutions[EANNA_INSTITUTION_ID] = {
        id: EANNA_INSTITUTION_ID,
        name: 'Eanna Precinct',
        locationId: EANNA_TABLET_ROOM_LOCATION_ID,
        responsibilities: ['Maintain precinct records and supervised administrative work', 'Receive reports concerning precinct goods, labor, and offering preparations'],
        authority: ['Review submitted administrative records', 'Refer matters to the responsible precinct authority'],
        standing: 50,
        activeMatters: [],
      };
    }
    if (!locations[EANNA_TABLET_ROOM_LOCATION_ID]) {
      locations[EANNA_TABLET_ROOM_LOCATION_ID] = {
        id: EANNA_TABLET_ROOM_LOCATION_ID,
        name: 'Eanna precinct tablet room, Uruk',
      };
    }
    const institution = institutions[EANNA_INSTITUTION_ID];
    events[seed.eventId] = {
      id: seed.eventId,
      dayNumber: nextDay,
      summary: seed.eventSummary,
      personIds: seed.personIds,
      institutionIds: [EANNA_INSTITUTION_ID],
      locationId: seed.locationId,
    };
    matters[seed.matterId] = {
      id: seed.matterId,
      institutionId: EANNA_INSTITUTION_ID,
      kind: seed.kind,
      summary: seed.summary,
      status: 'active',
      createdDay: nextDay,
      sourceEventId: seed.eventId,
      locationId: seed.locationId,
      involvedPersonIds: [...seed.personIds],
      provenance: seed.provenance.map((source) => ({ ...source })),
    };
    institutions[EANNA_INSTITUTION_ID] = {
      ...institution,
      activeMatters: [...new Set([...institution.activeMatters, seed.matterId])],
    };
    changed = true;
  }

  // The first Commercial procurement occurrence enters the world on Day 2,
  // after the Day 1 board has presented its existing six-AP supply.
  if (nextDay === 2 && !matters[MATTER_IDS.era1ComF01]) {
    const eventId = 'event-era1-com-f01-seeded-delivery' as EventId;
    events[eventId] = {
      id: eventId,
      dayNumber: nextDay,
      summary: 'The craft worker needs timber described as worked. The tag says worked; the receiving list describes the visible pieces as unworked. The difference is recorded, but its cause is not known.',
      personIds: [PEOPLE.receivingOfficial, PEOPLE.workshopOverseer, PEOPLE.responsibleAuthority, PEOPLE.carrier],
      institutionIds: [STOREHOUSE_INSTITUTION_ID],
      locationId: ERA1_COM_F01_LOCATION_ID,
    };
    const created = createMaterialNotAsDescribedMatter(nextDay);
    matters[created.id] = {
      ...created,
      sourceEventId: eventId,
      provenance: [
        ...(created.provenance ?? []),
        { id: 'comf01-source-event', kind: 'event', sourceId: eventId, description: 'The procurement/delivery description difference is recorded as a distinct causal source event.' },
      ],
    };
    const institution = institutions[STOREHOUSE_INSTITUTION_ID];
    if (institution && !institution.activeMatters.includes(created.id)) {
      institutions[STOREHOUSE_INSTITUTION_ID] = {
        ...institution,
        activeMatters: [...institution.activeMatters, created.id],
      };
    }
    changed = true;
  }


  // Martial family identities and institutional context are introduced lazily,
  // so existing schema-v2 saves receive only the provisional participants needed
  // when the corresponding finite source events become eligible.
  // These replaceable NPC display forms come from the approved Era I name pool. Ena-an-ru is an attested name-form with a cautious reading; DIMₐ is a reported sign sequence, not a reconstructed pronunciation. Neither implies an attested individual.
  const martialPeople = [
    [ERA1_MAR_PEOPLE.ninDara, 'Nin-dara', HOUSEHOLD_STRONGROOM_INSTITUTION_ID, HOUSEHOLD_STRONGROOM_LOCATION_ID],
    [ERA1_MAR_PEOPLE.sealingOwner, 'Ena-an-ru', HOUSEHOLD_STRONGROOM_INSTITUTION_ID, HOUSEHOLD_STRONGROOM_LOCATION_ID],
    [ERA1_MAR_PEOPLE.luKala, 'Lu-kala', STOREHOUSE_INSTITUTION_ID, NORTH_BAY_LOCATION_ID],
    [ERA1_MAR_PEOPLE.partyMember, 'DIMₐ', STOREHOUSE_INSTITUTION_ID, NORTH_BAY_LOCATION_ID],
    [ERA1_MAR_PEOPLE.urAb, 'Ur-ab', EANNA_INSTITUTION_ID, EANNA_TABLET_ROOM_LOCATION_ID],
  ] as const;
  if (nextDay >= 11) {
    for (const [id, name, affiliation, locationId] of martialPeople) {
      const existing = people[id];
      const socialIdentity = id === ERA1_MAR_PEOPLE.sealingOwner
        ? { occupation: 'Household sealing holder', summary: 'The person responsible for the household sealing and the strongroom’s contents.' }
        : id === ERA1_MAR_PEOPLE.partyMember
          ? { occupation: 'Member of the repair party', summary: 'A participant in the repair party who gives an account of the tools and the person still away.' }
          : undefined;
      if (existing) {
        const legacyPlaceholder = (id === ERA1_MAR_PEOPLE.sealingOwner && existing.name === 'The sealing owner')
          || (id === ERA1_MAR_PEOPLE.partyMember && existing.name === 'A task-party member');
        if (legacyPlaceholder || (socialIdentity && !existing.socialIdentity)) {
          people[id] = { ...existing, ...(legacyPlaceholder ? { name } : {}), ...(socialIdentity ? { socialIdentity } : {}) };
          changed = true;
        }
        continue;
      }
      people[id] = { id, name, alive: true, affiliations: [affiliation], currentLocationId: locationId,
        lifeStage: 'craft_practitioner', ...(socialIdentity ? { socialIdentity } : {}) };
      changed = true;
    }
    if (!institutions[HOUSEHOLD_STRONGROOM_INSTITUTION_ID]) {
      institutions[HOUSEHOLD_STRONGROOM_INSTITUTION_ID] = {
        id: HOUSEHOLD_STRONGROOM_INSTITUTION_ID,
        name: 'Household strongroom',
        locationId: HOUSEHOLD_STRONGROOM_LOCATION_ID,
        responsibilities: ['Maintain household custody of a sealed storage space'],
        authority: ['Household members determine access and authorize any inquiry'],
        standing: 50,
        activeMatters: [],
      };
      changed = true;
    }
    if (!locations[HOUSEHOLD_STRONGROOM_LOCATION_ID]) {
      locations[HOUSEHOLD_STRONGROOM_LOCATION_ID] = { id: HOUSEHOLD_STRONGROOM_LOCATION_ID, name: 'Household strongroom, Uruk' };
      changed = true;
    }
  }

  // Martial F01: a finite household access incident. The differing closure
  // impression, intact inventory, and attributed accounts remain separate
  // sources; neither the seal nor the missing authorization link proves fault.
  const mar01MatterId = 'matter-era1-mar-f01-door-opened' as MatterId;
  if (nextDay >= 11 && !matters[mar01MatterId] && institutions[HOUSEHOLD_STRONGROOM_INSTITUTION_ID]) {
    const eventId = 'event-era1-mar-f01-door-opened' as EventId;
    const author = ERA1_MAR_PEOPLE.shuruppak;
    records[ERA1_MAR_F01_RECORD_IDS.closureImpression] = createAuthoredSourceRecord({
      id: ERA1_MAR_F01_RECORD_IDS.closureImpression, createdDay: nextDay, authorPersonId: author,
      institutionId: HOUSEHOLD_STRONGROOM_INSTITUTION_ID, title: 'Present strongroom closure impression',
      assertion: 'The present closure bears an impression different from the household sealing available for comparison.',
      uncertaintyLimit: 'The household knows which seal was pressed, but still needs to ask who gave permission to open the room.',
    });
    records[ERA1_MAR_F01_RECORD_IDS.inventory] = createAuthoredSourceRecord({
      id: ERA1_MAR_F01_RECORD_IDS.inventory, createdDay: nextDay, authorPersonId: author,
      institutionId: HOUSEHOLD_STRONGROOM_INSTITUTION_ID, title: 'Strongroom contents inventory',
      assertion: 'The contents checked are present and match the listed inventory.',
      uncertaintyLimit: 'The contents are present; the household still needs the accounts to learn who entered and when.',
    });
    records[ERA1_MAR_F01_RECORD_IDS.ninDaraAccount] = createAuthoredSourceRecord({
      id: ERA1_MAR_F01_RECORD_IDS.ninDaraAccount, createdDay: nextDay, authorPersonId: author,
      reportedByPersonId: ERA1_MAR_PEOPLE.ninDara, institutionId: HOUSEHOLD_STRONGROOM_INSTITUTION_ID,
      title: 'Nin-dara account of the opening',
      assertion: 'Nin-dara says she opened the door for a man who showed a sealing.',
      uncertaintyLimit: 'Nin-dara describes the man and sealing she saw, but not who sent him.',
    });
    records[ERA1_MAR_F01_RECORD_IDS.ownerAccount] = createAuthoredSourceRecord({
      id: ERA1_MAR_F01_RECORD_IDS.ownerAccount, createdDay: nextDay, authorPersonId: author,
      reportedByPersonId: ERA1_MAR_PEOPLE.sealingOwner, institutionId: HOUSEHOLD_STRONGROOM_INSTITUTION_ID,
      title: 'Sealing owner account',
      assertion: 'The sealing owner says no one was sent to open the strongroom.',
      uncertaintyLimit: 'The owner says no one was sent; the household must compare that account with Nin-dara’s.',
    });
    records[ERA1_MAR_F01_RECORD_IDS.authorizationSearch] = createAuthoredSourceRecord({
      id: ERA1_MAR_F01_RECORD_IDS.authorizationSearch, createdDay: nextDay, authorPersonId: author,
      institutionId: HOUSEHOLD_STRONGROOM_INSTITUTION_ID, title: 'Search for an earlier authorization record',
      assertion: 'No earlier authorization record is linked to this opening in the records examined.',
      uncertaintyLimit: 'No earlier copy was found; Lu-Nanshe must ask the people involved before deciding whether permission was given.',
    });
    events[eventId] = {
      id: eventId, dayNumber: nextDay,
      summary: 'A household strongroom is found re-sealed with an impression different from the household sealing. Its checked contents match the inventory; two attributed accounts differ and no earlier authorization record is linked in the records examined.',
      personIds: [ERA1_MAR_PEOPLE.luNanshe, ERA1_MAR_PEOPLE.ninDara, ERA1_MAR_PEOPLE.sealingOwner, ERA1_MAR_PEOPLE.urNanna, author],
      institutionIds: [HOUSEHOLD_STRONGROOM_INSTITUTION_ID],
      locationId: HOUSEHOLD_STRONGROOM_LOCATION_ID,
    };
    const matter: InstitutionalMatter = {
      id: mar01MatterId, institutionId: HOUSEHOLD_STRONGROOM_INSTITUTION_ID,
      kind: 'era1_mar_f01_door_opened',
      summary: 'A household strongroom has been re-sealed with a different impression; the contents checked match the inventory, while the opening and its authorization remain unresolved.',
      status: 'active', createdDay: nextDay, sourceEventId: eventId,
      sourceRecordId: ERA1_MAR_F01_RECORD_IDS.closureImpression, locationId: HOUSEHOLD_STRONGROOM_LOCATION_ID,
      involvedPersonIds: [ERA1_MAR_PEOPLE.luNanshe, ERA1_MAR_PEOPLE.ninDara, ERA1_MAR_PEOPLE.sealingOwner, ERA1_MAR_PEOPLE.urNanna, author],
      provenance: [
        { id: 'mar01-closure-impression', kind: 'record_copy', sourceId: ERA1_MAR_F01_RECORD_IDS.closureImpression, description: 'The present closure impression and its comparison.' },
        { id: 'mar01-inventory', kind: 'record_copy', sourceId: ERA1_MAR_F01_RECORD_IDS.inventory, description: 'The checked contents and listed inventory.' },
        { id: 'mar01-nin-dara-account', kind: 'record_copy', sourceId: ERA1_MAR_F01_RECORD_IDS.ninDaraAccount, description: 'Nin-dara’s separately attributed account.' },
        { id: 'mar01-owner-account', kind: 'record_copy', sourceId: ERA1_MAR_F01_RECORD_IDS.ownerAccount, description: 'The sealing owner’s separately attributed account.' },
        { id: 'mar01-authorization-search', kind: 'record_copy', sourceId: ERA1_MAR_F01_RECORD_IDS.authorizationSearch, description: 'The bounded search for a linked authorization record.' },
        { id: 'mar01-source-event', kind: 'event', sourceId: eventId, description: 'The distinct household access incident.' },
      ],
    };
    matters[matter.id] = matter;
    institutions[HOUSEHOLD_STRONGROOM_INSTITUTION_ID] = {
      ...institutions[HOUSEHOLD_STRONGROOM_INSTITUTION_ID],
      activeMatters: [...institutions[HOUSEHOLD_STRONGROOM_INSTITUTION_ID].activeMatters, matter.id],
    };
    changed = true;
  }

  // Martial F02: the issue event is caused only by an active repair need.
  // The return shortfall is a separate next-day event, not an automatic
  // consequence of issuing tools or evidence of a formal muster.
  const mar02MatterId = 'matter-era1-mar-f02-party-returns-short' as MatterId;
  const mar02IssueEventId = 'event-era1-mar-f02-party-issue' as EventId;
  if (nextDay >= 11 && !events[mar02IssueEventId]) {
    const repairNeedOpen = Object.values(matters).some((matter) =>
      matter.status === 'active' && (matter.kind === 'roof_repair_verification' || matter.kind === 'north_bay_water_ingress'));
    if (repairNeedOpen && institutions[STOREHOUSE_INSTITUTION_ID]) {
      records[ERA1_MAR_F02_RECORD_IDS.issueList] = createAuthoredSourceRecord({
        id: ERA1_MAR_F02_RECORD_IDS.issueList, createdDay: nextDay, authorPersonId: ERA1_MAR_PEOPLE.shuruppak,
        institutionId: STOREHOUSE_INSTITUTION_ID, title: 'Task-party tool and provision issue list',
        assertion: 'Tools and provisions are recorded as issued to a sponsor-gathered party for the north-bay repair task.',
        uncertaintyLimit: 'The issue list records this task-specific handover; it does not create a universal same-day return obligation or a formal muster.',
      });
      events[mar02IssueEventId] = {
        id: mar02IssueEventId, dayNumber: nextDay,
        summary: 'Lu-Nanshe gathered a group for the north-bay repair. Tools and provisions were handed out against an issue list; the count must be settled before the group disperses.',
        personIds: [ERA1_MAR_PEOPLE.luNanshe, ERA1_MAR_PEOPLE.luKala, ERA1_MAR_PEOPLE.partyMember, ERA1_MAR_PEOPLE.dudu, ERA1_MAR_PEOPLE.urAb],
        institutionIds: [STOREHOUSE_INSTITUTION_ID], locationId: NORTH_BAY_LOCATION_ID,
      };
      changed = true;
    }
  }
  if (nextDay >= 12 && !matters[mar02MatterId] && events[mar02IssueEventId]
    && events[mar02IssueEventId].dayNumber < nextDay) {
    const eventId = 'event-era1-mar-f02-party-return' as EventId;
    records[ERA1_MAR_F02_RECORD_IDS.returnCount] = createAuthoredSourceRecord({
      id: ERA1_MAR_F02_RECORD_IDS.returnCount, createdDay: nextDay, authorPersonId: ERA1_MAR_PEOPLE.shuruppak,
      institutionId: STOREHOUSE_INSTITUTION_ID, title: 'Task-party return count',
      assertion: 'The return count lists tools returned and tools not yet accounted for.',
      uncertaintyLimit: 'The tools missing from the count may be at the site or kept for tomorrow; someone needs to check before closing it.',
    });
    records[ERA1_MAR_F02_RECORD_IDS.luKalaAccount] = createAuthoredSourceRecord({
      id: ERA1_MAR_F02_RECORD_IDS.luKalaAccount, createdDay: nextDay, authorPersonId: ERA1_MAR_PEOPLE.shuruppak,
      reportedByPersonId: ERA1_MAR_PEOPLE.luKala, institutionId: STOREHOUSE_INSTITUTION_ID,
      title: 'Lu-kala account of the task-party return',
      assertion: 'Lu-kala says some tools were left at the work site for the next day and one person has not yet returned.',
      uncertaintyLimit: 'Lu-kala says tools were left for tomorrow; the return count still needs the site checked.',
    });
    records[ERA1_MAR_F02_RECORD_IDS.partyMemberAccount] = createAuthoredSourceRecord({
      id: ERA1_MAR_F02_RECORD_IDS.partyMemberAccount, createdDay: nextDay, authorPersonId: ERA1_MAR_PEOPLE.shuruppak,
      reportedByPersonId: ERA1_MAR_PEOPLE.partyMember, institutionId: STOREHOUSE_INSTITUTION_ID,
      title: 'Task-party member account',
      assertion: 'A returning party member gives a different account of one missing tool and the person still away.',
      uncertaintyLimit: 'The party member gives a different account; the missing tool’s location remains unsettled.',
    });
    records[ERA1_MAR_F02_RECORD_IDS.siteObservation] = createAuthoredSourceRecord({
      id: ERA1_MAR_F02_RECORD_IDS.siteObservation, createdDay: nextDay, authorPersonId: ERA1_MAR_PEOPLE.shuruppak,
      reportedByPersonId: ERA1_MAR_PEOPLE.urAb, institutionId: STOREHOUSE_INSTITUTION_ID,
      title: 'Work-site observation',
      assertion: 'A watcher reports that tools may have been left at the repair site.',
      uncertaintyLimit: 'The watcher thinks tools may be at the site; a visit is needed before the count is closed.',
    });
    events[eventId] = {
      id: eventId, dayNumber: nextDay,
      summary: 'The repair group returns with tools not yet accounted for and one person still away. Lu-Nanshe needs the return count settled before the group disperses.',
      personIds: [ERA1_MAR_PEOPLE.luNanshe, ERA1_MAR_PEOPLE.luKala, ERA1_MAR_PEOPLE.partyMember, ERA1_MAR_PEOPLE.dudu, ERA1_MAR_PEOPLE.urAb],
      institutionIds: [STOREHOUSE_INSTITUTION_ID], locationId: NORTH_BAY_LOCATION_ID,
    };
    const matter: InstitutionalMatter = {
      id: mar02MatterId, institutionId: STOREHOUSE_INSTITUTION_ID, kind: 'era1_mar_f02_party_returns_short',
      summary: 'The repair group has returned with tools not yet accounted for and one person still away. The reason remains unsettled.',
      status: 'active', createdDay: nextDay, sourceEventId: eventId,
      sourceRecordId: ERA1_MAR_F02_RECORD_IDS.returnCount, locationId: NORTH_BAY_LOCATION_ID,
      involvedPersonIds: [ERA1_MAR_PEOPLE.luNanshe, ERA1_MAR_PEOPLE.luKala, ERA1_MAR_PEOPLE.partyMember, ERA1_MAR_PEOPLE.dudu, ERA1_MAR_PEOPLE.urAb],
      provenance: [
        { id: 'mar02-issue-list', kind: 'record_copy', sourceId: ERA1_MAR_F02_RECORD_IDS.issueList, description: 'The earlier task-specific issue list.' },
        { id: 'mar02-return-count', kind: 'record_copy', sourceId: ERA1_MAR_F02_RECORD_IDS.returnCount, description: 'The separate return count.' },
        { id: 'mar02-lu-kala-account', kind: 'record_copy', sourceId: ERA1_MAR_F02_RECORD_IDS.luKalaAccount, description: 'Lu-kala’s attributed account.' },
        { id: 'mar02-party-member-account', kind: 'record_copy', sourceId: ERA1_MAR_F02_RECORD_IDS.partyMemberAccount, description: 'The party member’s attributed account.' },
        { id: 'mar02-site-observation', kind: 'record_copy', sourceId: ERA1_MAR_F02_RECORD_IDS.siteObservation, description: 'The watcher’s site observation.' },
        { id: 'mar02-issue-event', kind: 'event', sourceId: mar02IssueEventId, description: 'The earlier issue event.' },
        { id: 'mar02-return-event', kind: 'event', sourceId: eventId, description: 'The distinct later return event.' },
      ],
    };
    matters[matter.id] = matter;
    institutions[STOREHOUSE_INSTITUTION_ID] = {
      ...institutions[STOREHOUSE_INSTITUTION_ID],
      activeMatters: [...institutions[STOREHOUSE_INSTITUTION_ID].activeMatters, matter.id],
    };
    changed = true;
  }

  // Martial F03: preserve a distinct dispatch and later overdue-arrival event.
  const mar03MatterId = 'matter-era1-mar-f03-late-turned-aside' as MatterId;
  const mar03DispatchEventId = 'event-era1-mar-f03-dispatch' as EventId;
  if (nextDay >= 11 && !events[mar03DispatchEventId] && institutions[TEXTILE_HOUSEHOLD_INSTITUTION_ID]) {
    records[ERA1_MAR_F03_RECORD_IDS.dispatch] = createAuthoredSourceRecord({
      id: ERA1_MAR_F03_RECORD_IDS.dispatch, createdDay: nextDay, authorPersonId: ERA1_MAR_PEOPLE.shuruppak,
      reportedByPersonId: ERA1_MAR_PEOPLE.gemeInana, institutionId: TEXTILE_HOUSEHOLD_INSTITUTION_ID,
      title: 'Household outbound dispatch and expected arrival',
      assertion: 'A valued load is dispatched with an expected arrival recorded.',
      uncertaintyLimit: 'The load was expected; the recipient has no arrival tally yet.',
    });
    events[mar03DispatchEventId] = {
      id: mar03DispatchEventId, dayNumber: nextDay,
      summary: 'A valued load leaves the textile household with an expected arrival. The dispatch records the plan but does not establish arrival.',
      personIds: [ERA1_MAR_PEOPLE.gemeInana, ERA1_MAR_PEOPLE.enlilKisu, ERA1_MAR_PEOPLE.kuli],
      institutionIds: [TEXTILE_HOUSEHOLD_INSTITUTION_ID], locationId: TEXTILE_HOUSEHOLD_LOCATION_ID,
    };
    changed = true;
  }
  if (nextDay >= 12 && !matters[mar03MatterId] && events[mar03DispatchEventId]
    && events[mar03DispatchEventId].dayNumber < nextDay) {
    const eventId = 'event-era1-mar-f03-late-turned-aside' as EventId;
    records[ERA1_MAR_F03_RECORD_IDS.enlilAccount] = createAuthoredSourceRecord({
      id: ERA1_MAR_F03_RECORD_IDS.enlilAccount, createdDay: nextDay, authorPersonId: ERA1_MAR_PEOPLE.shuruppak,
      reportedByPersonId: ERA1_MAR_PEOPLE.enlilKisu, institutionId: TEXTILE_HOUSEHOLD_INSTITUTION_ID,
      title: 'Carrier account of the halt',
      assertion: 'Enlil-kisu says the carrying party halted at a landing because the approach route was unsafe.',
      uncertaintyLimit: 'Enlil-kisu says the route was unsafe; the delay remains unexplained until the receiving side is heard.',
    });
    records[ERA1_MAR_F03_RECORD_IDS.landingObservation] = createAuthoredSourceRecord({
      id: ERA1_MAR_F03_RECORD_IDS.landingObservation, createdDay: nextDay, authorPersonId: ERA1_MAR_PEOPLE.shuruppak,
      reportedByPersonId: ERA1_MAR_PEOPLE.amaGi, institutionId: TEXTILE_HOUSEHOLD_INSTITUTION_ID,
      title: 'Landing observation',
      assertion: 'Ama-gi reports that the carrying party was at the landing later than expected.',
      uncertaintyLimit: 'The observation establishes reported presence and delay, not the reason for the halt or the load’s final destination.',
    });
    records[ERA1_MAR_F03_RECORD_IDS.messageClaim] = createAuthoredSourceRecord({
      id: ERA1_MAR_F03_RECORD_IDS.messageClaim, createdDay: nextDay, authorPersonId: ERA1_MAR_PEOPLE.shuruppak,
      reportedByPersonId: ERA1_MAR_PEOPLE.sigAna, institutionId: TEXTILE_HOUSEHOLD_INSTITUTION_ID,
      title: 'Claimed change-of-plan message',
      assertion: 'Sig-ana says word of a change was sent.',
      uncertaintyLimit: 'No record confirms who carried the message or whether Geme-Inana received it.',
    });
    events[eventId] = {
      id: eventId, dayNumber: nextDay,
      summary: 'The expected arrival passes without a receipt. The carrier reports a halt, a landing observation places the party there later than expected, and a change-of-plan message is claimed but unconfirmed.',
      personIds: [ERA1_MAR_PEOPLE.gemeInana, ERA1_MAR_PEOPLE.enlilKisu, ERA1_MAR_PEOPLE.amaGi, ERA1_MAR_PEOPLE.sigAna, ERA1_MAR_PEOPLE.kuli],
      institutionIds: [TEXTILE_HOUSEHOLD_INSTITUTION_ID], locationId: RIVER_LANDING_LOCATION_ID,
    };
    const matter: InstitutionalMatter = {
      id: mar03MatterId, institutionId: TEXTILE_HOUSEHOLD_INSTITUTION_ID, kind: 'era1_mar_f03_late_turned_aside',
      summary: 'A valued load is late. The carrier, landing witness, and message claim give different parts of the story, but no one has confirmed why it stopped.',
      status: 'active', createdDay: nextDay, sourceEventId: eventId,
      sourceRecordId: ERA1_MAR_F03_RECORD_IDS.dispatch, locationId: RIVER_LANDING_LOCATION_ID,
      involvedPersonIds: [ERA1_MAR_PEOPLE.gemeInana, ERA1_MAR_PEOPLE.enlilKisu, ERA1_MAR_PEOPLE.amaGi, ERA1_MAR_PEOPLE.sigAna, ERA1_MAR_PEOPLE.kuli],
      provenance: [
        { id: 'mar03-dispatch', kind: 'record_copy', sourceId: ERA1_MAR_F03_RECORD_IDS.dispatch, description: 'The earlier dispatch and expected arrival.' },
        { id: 'mar03-enlil-account', kind: 'record_copy', sourceId: ERA1_MAR_F03_RECORD_IDS.enlilAccount, description: 'The carrier’s attributed account of the halt.' },
        { id: 'mar03-landing-observation', kind: 'record_copy', sourceId: ERA1_MAR_F03_RECORD_IDS.landingObservation, description: 'The landing observation.' },
        { id: 'mar03-message-claim', kind: 'record_copy', sourceId: ERA1_MAR_F03_RECORD_IDS.messageClaim, description: 'The claimed but unconfirmed message.' },
        { id: 'mar03-dispatch-event', kind: 'event', sourceId: mar03DispatchEventId, description: 'The distinct earlier dispatch event.' },
        { id: 'mar03-late-event', kind: 'event', sourceId: eventId, description: 'The later event after expected arrival passes.' },
      ],
    };
    matters[matter.id] = matter;
    institutions[TEXTILE_HOUSEHOLD_INSTITUTION_ID] = {
      ...institutions[TEXTILE_HOUSEHOLD_INSTITUTION_ID],
      activeMatters: [...institutions[TEXTILE_HOUSEHOLD_INSTITUTION_ID].activeMatters, matter.id],
    };
    changed = true;
  }

  // Martial F04: removal and workshop receipt precede a separate overdue-return
  // event. The missing entry is not treated as proof that no handover occurred.
  const mar04MatterId = 'matter-era1-mar-f04-valued-object-trail' as MatterId;
  const mar04RemovalEventId = 'event-era1-mar-f04-object-removed' as EventId;
  if (nextDay >= 12 && !events[mar04RemovalEventId] && institutions[EANNA_INSTITUTION_ID]) {
    records[ERA1_MAR_F04_RECORD_IDS.removalNote] = createAuthoredSourceRecord({
      id: ERA1_MAR_F04_RECORD_IDS.removalNote, createdDay: nextDay, authorPersonId: ERA1_MAR_PEOPLE.shuruppak,
      institutionId: EANNA_INSTITUTION_ID, title: 'Valued-object removal note',
      assertion: 'A valued object is recorded leaving permanent storage for repair or cleaning.',
      uncertaintyLimit: 'The removal note establishes the recorded departure, not the object’s later custody or present location.',
    });
    records[ERA1_MAR_F04_RECORD_IDS.workshopReceipt] = createAuthoredSourceRecord({
      id: ERA1_MAR_F04_RECORD_IDS.workshopReceipt, createdDay: nextDay, authorPersonId: ERA1_MAR_PEOPLE.shuruppak,
      reportedByPersonId: ERA1_MAR_PEOPLE.urLamma, institutionId: EANNA_INSTITUTION_ID,
      title: 'Workshop receipt for valued object',
      assertion: 'The workshop receipt records the object arriving with Ur-Lamma for repair or cleaning.',
      uncertaintyLimit: 'The workshop received the object; the Storehouse has no later return line.',
    });
    events[mar04RemovalEventId] = {
      id: mar04RemovalEventId, dayNumber: nextDay,
      summary: 'A valued object is recorded leaving permanent storage for repair or cleaning, and a separate workshop receipt records its arrival.',
      personIds: [ERA1_MAR_PEOPLE.luNanshe, ERA1_MAR_PEOPLE.urNanna, ERA1_MAR_PEOPLE.urLamma, ERA1_MAR_PEOPLE.enlilKisu, ERA1_MAR_PEOPLE.urAb],
      institutionIds: [EANNA_INSTITUTION_ID, STOREHOUSE_INSTITUTION_ID], locationId: EANNA_TABLET_ROOM_LOCATION_ID,
    };
    changed = true;
  }
  if (nextDay >= 13 && !matters[mar04MatterId] && events[mar04RemovalEventId]
    && events[mar04RemovalEventId].dayNumber < nextDay) {
    const eventId = 'event-era1-mar-f04-object-return-overdue' as EventId;
    records[ERA1_MAR_F04_RECORD_IDS.storehouseSearch] = createAuthoredSourceRecord({
      id: ERA1_MAR_F04_RECORD_IDS.storehouseSearch, createdDay: nextDay, authorPersonId: ERA1_MAR_PEOPLE.shuruppak,
      institutionId: STOREHOUSE_INSTITUTION_ID, title: 'Storehouse return-entry search',
      assertion: 'No return handover entry is located in the Storehouse record examined.',
      uncertaintyLimit: 'No return line was found; Lu-Nanshe must ask the custodians before calling it missing.',
    });
    records[ERA1_MAR_F04_RECORD_IDS.enlilAccount] = createAuthoredSourceRecord({
      id: ERA1_MAR_F04_RECORD_IDS.enlilAccount, createdDay: nextDay, authorPersonId: ERA1_MAR_PEOPLE.shuruppak,
      reportedByPersonId: ERA1_MAR_PEOPLE.enlilKisu, institutionId: EANNA_INSTITUTION_ID,
      title: 'Enlil-kisu account of the object movement',
      assertion: 'Enlil-kisu gives an account of carrying the object between locations.',
      uncertaintyLimit: 'Enlil-kisu’s account gives an interval to check, but not where the vessel is now.',
    });
    records[ERA1_MAR_F04_RECORD_IDS.urAbAccount] = createAuthoredSourceRecord({
      id: ERA1_MAR_F04_RECORD_IDS.urAbAccount, createdDay: nextDay, authorPersonId: ERA1_MAR_PEOPLE.shuruppak,
      reportedByPersonId: ERA1_MAR_PEOPLE.urAb, institutionId: EANNA_INSTITUTION_ID,
      title: 'Ur-ab observation near the yard',
      assertion: 'Ur-ab reports seeing part of the movement near the yard.',
      uncertaintyLimit: 'Ur-ab saw part of the movement; the rest of the route still needs a custodian’s account.',
    });
    events[eventId] = {
      id: eventId, dayNumber: nextDay,
      summary: 'The expected return handover has not been located in the Storehouse record examined. The removal note and workshop receipt remain distinct from the later search and attributed accounts.',
      personIds: [ERA1_MAR_PEOPLE.luNanshe, ERA1_MAR_PEOPLE.urNanna, ERA1_MAR_PEOPLE.urLamma, ERA1_MAR_PEOPLE.enlilKisu, ERA1_MAR_PEOPLE.urAb],
      institutionIds: [EANNA_INSTITUTION_ID, STOREHOUSE_INSTITUTION_ID], locationId: EANNA_TABLET_ROOM_LOCATION_ID,
    };
    const matter: InstitutionalMatter = {
      id: mar04MatterId, institutionId: EANNA_INSTITUTION_ID, kind: 'era1_mar_f04_valued_object_trail',
      summary: 'A valued object was recorded leaving permanent storage and arriving at a workshop, but no return handover is located in the Storehouse record examined.',
      status: 'active', createdDay: nextDay, sourceEventId: eventId,
      sourceRecordId: ERA1_MAR_F04_RECORD_IDS.storehouseSearch, locationId: EANNA_TABLET_ROOM_LOCATION_ID,
      involvedPersonIds: [ERA1_MAR_PEOPLE.luNanshe, ERA1_MAR_PEOPLE.urNanna, ERA1_MAR_PEOPLE.urLamma, ERA1_MAR_PEOPLE.enlilKisu, ERA1_MAR_PEOPLE.urAb],
      provenance: [
        { id: 'mar04-removal-note', kind: 'record_copy', sourceId: ERA1_MAR_F04_RECORD_IDS.removalNote, description: 'The removal note.' },
        { id: 'mar04-workshop-receipt', kind: 'record_copy', sourceId: ERA1_MAR_F04_RECORD_IDS.workshopReceipt, description: 'The workshop receipt.' },
        { id: 'mar04-storehouse-search', kind: 'record_copy', sourceId: ERA1_MAR_F04_RECORD_IDS.storehouseSearch, description: 'The Storehouse return-entry search.' },
        { id: 'mar04-enlil-account', kind: 'record_copy', sourceId: ERA1_MAR_F04_RECORD_IDS.enlilAccount, description: 'Enlil-kisu’s attributed account.' },
        { id: 'mar04-ur-ab-account', kind: 'record_copy', sourceId: ERA1_MAR_F04_RECORD_IDS.urAbAccount, description: 'Ur-ab’s attributed observation.' },
        { id: 'mar04-removal-event', kind: 'event', sourceId: mar04RemovalEventId, description: 'The earlier removal and workshop-receipt event.' },
        { id: 'mar04-overdue-event', kind: 'event', sourceId: eventId, description: 'The separate later overdue-return event.' },
      ],
    };
    matters[matter.id] = matter;
    institutions[EANNA_INSTITUTION_ID] = {
      ...institutions[EANNA_INSTITUTION_ID],
      activeMatters: [...institutions[EANNA_INSTITUTION_ID].activeMatters, matter.id],
    };
    changed = true;
  }

  for (const matter of Object.values(matters)) {
    const schedule = matter.scheduledDevelopment;
    if (matter.status === 'resolved' || matter.status === 'developed' || schedule?.kind !== 'rain' || schedule.dayNumber > nextDay) continue;

    const eventId = `event-north-bay-rain-day-${nextDay}` as EventId;
    events[eventId] = events[eventId] ?? {
      id: eventId,
      dayNumber: nextDay,
      summary: 'A hard rain drives water back beneath the north-bay roof patch; the obstructed parapet runoff channel has not been cleared.',
      personIds: matter.involvedPersonIds ?? [],
      institutionIds: [matter.institutionId],
      locationId: matter.locationId,
    };
    matters[matter.id] = { ...matter, status: 'developed', developedDay: nextDay, sourceEventId: eventId };
    matters[MATTER_IDS.waterIngress] = matters[MATTER_IDS.waterIngress] ?? {
      id: MATTER_IDS.waterIngress,
      institutionId: matter.institutionId,
      kind: 'north_bay_water_ingress',
      summary: 'Rainwater has entered the north bay beneath the roof patch; affected storage must be assessed.',
      status: 'active',
      createdDay: nextDay,
      sourceRecordId: matter.sourceRecordId,
      locationId: matter.locationId,
      sourceEventId: eventId,
      involvedPersonIds: matter.involvedPersonIds ?? [],
      provenance: [{ id: 'water-ingress-rain-event', kind: 'event', sourceId: eventId, description: 'Rainwater entered beneath the unresolved north-bay roof patch.' }],
    };
    const institution = institutions[matter.institutionId];
    if (institution) {
      institutions[matter.institutionId] = {
        ...institution,
        activeMatters: [
          ...institution.activeMatters.filter((id) => id !== matter.id),
          ...(institution.activeMatters.includes(MATTER_IDS.waterIngress) ? [] : [MATTER_IDS.waterIngress]),
        ],
      };
    }
    changed = true;
  }

  return changed ? { ...state, world: { ...state.world, matters, events, institutions, locations, people }, records: { ...state.records, entries: records } } : state;
}

export function createMaterialNotAsDescribedMatter(dayNumber: number): InstitutionalMatter {
  return {
    id: MATTER_IDS.era1ComF01,
    institutionId: STOREHOUSE_INSTITUTION_ID,
    kind: 'era1_com_f01_material_description',
    summary: 'A sender’s tag describes a delivered timber load as worked, while the receiving observation describes the visible pieces as unworked; the difference remains unexplained.',
    status: 'active',
    createdDay: dayNumber,
    locationId: ERA1_COM_F01_LOCATION_ID,
    involvedPersonIds: [
      PEOPLE.receivingOfficial,
      PEOPLE.workshopOverseer,
      PEOPLE.responsibleAuthority,
      PEOPLE.carrier,
    ],
    provenance: [
      { id: 'comf01-procurement-request', kind: 'instruction', description: 'A craft worker requests timber described as worked for a precinct commission.' },
      { id: 'comf01-sender-tag', kind: 'record_copy', description: 'The sender’s tag describes the delivered load as worked timber.' },
      { id: 'comf01-receiving-observation', kind: 'observation', description: 'The receiving observation describes the visible pieces as unworked without identifying species or origin.' },
      { id: 'comf01-carrier-account', kind: 'testimony', description: 'Kuli gives a separate account of carrying the covered load to the receiving court.' },
      { id: 'comf01-authority-boundary', kind: 'other', description: 'The scribe reports; the receiving official records, the responsible authority decides acceptance, and the workshop overseer judges suitability.' },
    ],
  };
}
