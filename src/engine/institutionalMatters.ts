import type { EventId, InstitutionId, LocationId, MatterId, PersonId, RecordId } from '../state/ids';
import type { GameState, InstitutionalMatter } from '../state/types';

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

export function advanceInstitutionalMatters(state: GameState, nextDay: number): GameState {
  const matters = { ...state.world.matters };
  const events = { ...state.world.events };
  const institutions = { ...state.world.institutions };
  const locations = { ...state.world.locations };
  let changed = false;


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

  return changed ? { ...state, world: { ...state.world, matters, events, institutions, locations } } : state;
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
