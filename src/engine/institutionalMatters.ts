import type { EventId, InstitutionId, LocationId, MatterId, PersonId, RecordId } from '../state/ids';
import type { GameState, InstitutionalMatter, RecordEntry } from '../state/types';
import { ERA1_COM_F02_F04_PEOPLE, ERA1_COM_F02_RECORD_IDS, ERA1_COM_F03_RECORD_IDS, ERA1_COM_F04_RECORD_IDS } from '../content/assignments/eraICommercialFamilies';

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
    eventSummary: 'A vessel and textile consignment is presented at the Eanna receiving court. Its tag, custody observation, dispatch account, and receiving entry are available for a bounded comparison; the authored occurrence does not establish loss or responsibility.',
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
    eventSummary: 'A working account containing separate grain-product/groats and malt entries is brought for review before it is copied forward. The displayed gameplay transcription and its uncertain reading remain qualified.',
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
    eventSummary: 'A responsible recorder asks for a second check of a field-measurement working copy. Its source chronology and provenience remain qualified; the simplified values are a gameplay transcription, not ancient notation.',
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
    eventSummary: 'A labor-group account is brought for checking alongside a separately sourced grain-disbursement record. Their pairing is a provisional accountability exercise; no shared group, institution, workflow, date, or entitlement is established.',
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
    eventSummary: 'A participant in offering preparations asks for an Inana-associated offering copy and a separate commodity record to be reviewed before preparations continue. Their combined use as one supply schedule is provisional gameplay fiction.',
    personIds: [PEOPLE.seniorScribe, 'person-nin-kasi' as PersonId],
    locationId: EANNA_TABLET_ROOM_LOCATION_ID,
    provenance: [
      { id: 'rel01-request', kind: 'instruction' as const, description: 'A participant in offering preparations requests a bounded review of the entries.' },
      { id: 'rel01-event', kind: 'event' as const, sourceId: 'event-era1-rel-01-inana-offering-source', description: 'A distinct offering-record review is initiated; no ritual outcome is implied.' },
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
  institutionId: InstitutionId;
  title: string;
  assertion: string;
  uncertaintyLimit: string;
}): RecordEntry {
  const sourceId = `source-${input.id}`;
  return {
    id: input.id,
    createdDay: input.createdDay,
    authorPersonId: input.authorPersonId,
    institutionId: input.institutionId,
    title: input.title,
    sources: [{ id: sourceId, kind: 'person', sourceId: input.authorPersonId, description: 'The named author is responsible for this authored record.' }],
    assertions: [{ id: `assertion-${input.id}`, text: input.assertion, classification: 'reported', sourceIds: [sourceId] }],
    uncertaintyLimits: [input.uncertaintyLimit],
    amendments: [],
  };
}

export function advanceInstitutionalMatters(state: GameState, nextDay: number): GameState {
  const matters = { ...state.world.matters };
  const events = { ...state.world.events };
  const institutions = { ...state.world.institutions };
  const locations = { ...state.world.locations };
  const records = { ...state.records.entries };
  let changed = false;



  // Commercial F02: a new timber delivery becomes an Assignment only while
  // both the Storehouse repair need and the household work-frame need remain open.
  if (nextDay === 8 && !matters['matter-era1-com-f02-two-claims' as MatterId]) {
    const storehouseNeedOpen = Object.values(matters).some((matter) =>
      matter.status === 'active' && (matter.kind === 'roof_repair_verification' || matter.kind === 'north_bay_water_ingress'));
    const household = state.world.people[ERA1_COM_F02_F04_PEOPLE.gemeInana];
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
        authorPersonId: ERA1_COM_F02_F04_PEOPLE.urNanna, institutionId: STOREHOUSE_INSTITUTION_ID,
        title: 'Storehouse request for timber', assertion: 'The Storehouse requests timber for the north-bay repair.',
        uncertaintyLimit: 'The request records the Storehouse need; it does not establish priority over another claimant.',
      });
      records[ERA1_COM_F02_RECORD_IDS.householdRequest] = createAuthoredSourceRecord({
        id: ERA1_COM_F02_RECORD_IDS.householdRequest, createdDay: nextDay,
        authorPersonId: ERA1_COM_F02_F04_PEOPLE.gemeInana, institutionId: TEXTILE_HOUSEHOLD_INSTITUTION_ID,
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
        authorPersonId: ERA1_COM_F02_F04_PEOPLE.kuli, institutionId: EANNA_INSTITUTION_ID,
        title: 'Carrier account of delivery instruction', assertion: 'Kuli gives his account of the instruction he received for the delivery.',
        uncertaintyLimit: 'The carrier account is attributed testimony and does not establish either claimant’s authority or good faith.',
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
  if (nextDay === 8 && !events['event-era1-com-f03-outbound-dispatch' as EventId]) {
    const household = state.world.people[ERA1_COM_F02_F04_PEOPLE.gemeInana];
    const exchangeOpen = household?.objectives?.some((objective) =>
      objective.id === 'objective-geme-inana-exchange' && objective.status === 'active');
    if (exchangeOpen && institutions[TEXTILE_HOUSEHOLD_INSTITUTION_ID]) {
      records[ERA1_COM_F03_RECORD_IDS.outboundDispatch] = createAuthoredSourceRecord({
        id: ERA1_COM_F03_RECORD_IDS.outboundDispatch, createdDay: nextDay,
        authorPersonId: ERA1_COM_F02_F04_PEOPLE.gemeInana, institutionId: TEXTILE_HOUSEHOLD_INSTITUTION_ID,
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

  if (nextDay === 9 && !matters['matter-era1-com-f03-partial-return' as MatterId]
    && events['event-era1-com-f03-outbound-dispatch' as EventId]) {
    const eventId = 'event-era1-com-f03-partial-return' as EventId;
    records[ERA1_COM_F03_RECORD_IDS.partialReturn] = createAuthoredSourceRecord({
      id: ERA1_COM_F03_RECORD_IDS.partialReturn, createdDay: nextDay,
      authorPersonId: ERA1_COM_F02_F04_PEOPLE.utuMansum, institutionId: EANNA_INSTITUTION_ID,
      title: 'Partial return receipt', assertion: 'The first return is received and recorded as partial against the earlier outbound dispatch.',
      uncertaintyLimit: 'The receipt establishes what arrived; it does not establish what the counterparty owes under the spoken understanding.',
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
  if (nextDay === 10 && !matters['matter-era1-com-f04-custody-chain' as MatterId]) {
    const eventId = 'event-era1-com-f04-custody-chain' as EventId;
    records[ERA1_COM_F04_RECORD_IDS.dispatchTally] = createAuthoredSourceRecord({
      id: ERA1_COM_F04_RECORD_IDS.dispatchTally, createdDay: nextDay,
      authorPersonId: ERA1_COM_F02_F04_PEOPLE.enlilKisu, institutionId: STOREHOUSE_INSTITUTION_ID,
      title: 'Dispatch tally', assertion: 'Twelve sealed vessels are recorded at dispatch.',
      uncertaintyLimit: 'The tally establishes the dispatch count, not the condition at later handovers.',
    });
    records[ERA1_COM_F04_RECORD_IDS.landingTally] = createAuthoredSourceRecord({
      id: ERA1_COM_F04_RECORD_IDS.landingTally, createdDay: nextDay,
      authorPersonId: ERA1_COM_F02_F04_PEOPLE.amaGi, institutionId: EANNA_INSTITUTION_ID,
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
      summary: 'A provisional procurement request calls for worked timber; the sender’s tag describes the load as worked, while the receiving observation describes the visible pieces as unworked. The difference is documented but not explained.',
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

  return changed ? { ...state, world: { ...state.world, matters, events, institutions, locations }, records: { ...state.records, entries: records } } : state;
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
      { id: 'comf01-procurement-request', kind: 'instruction', description: 'A provisional request calls for worked timber for a precinct craft commission.' },
      { id: 'comf01-sender-tag', kind: 'record_copy', description: 'A provisional sender tag describes the delivered load as worked timber.' },
      { id: 'comf01-receiving-observation', kind: 'observation', description: 'The receiving observation describes the visible pieces as unworked without identifying species or origin.' },
      { id: 'comf01-carrier-account', kind: 'testimony', description: 'Kuli gives a separate account of carrying the covered load to the receiving court.' },
      { id: 'comf01-authority-boundary', kind: 'other', description: 'The scribe reports; the receiving official records, the responsible authority decides acceptance, and the workshop overseer judges suitability.' },
    ],
  };
}
