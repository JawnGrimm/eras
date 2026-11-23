import type { EventId, InstitutionId, LocationId, MatterId, PersonId, RecordId } from '../state/ids';
import type { GameState, InstitutionalMatter } from '../state/types';

export const STOREHOUSE_INSTITUTION_ID = 'institution-uruk-temple-storehouse' as InstitutionId;
export const NORTH_BAY_LOCATION_ID = 'location-uruk-temple-storehouse' as LocationId;
export const SOUTH_COURT_LOCATION_ID = 'location-uruk-south-receiving-court' as LocationId;
export const SOUTH_LOADING_LOCATION_ID = 'location-uruk-south-loading-court' as LocationId;

export const MATTER_IDS = {
  tutorial: 'matter-storehouse-reckoning-tutorial' as MatterId,
  roofRepair: 'matter-north-bay-roof-verification' as MatterId,
  heldBarley: 'matter-held-barley-inspection' as MatterId,
  waterIngress: 'matter-north-bay-water-ingress' as MatterId,
  southCourtDelivery: 'matter-south-court-delivery-reconciliation' as MatterId,
  southLoadingAwning: 'matter-south-loading-awning-inspection' as MatterId,
} as const;

const PEOPLE = {
  steward: 'person-ur-nanna' as PersonId,
  receivingOfficial: 'person-utu-mansum' as PersonId,
  carrierForeman: 'person-enlil-kisu' as PersonId,
  seniorScribe: 'person-shuruppak-ilu' as PersonId,
  repairer: 'person-dudu' as PersonId,
} as const;

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
  let changed = false;

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

  return changed ? { ...state, world: { ...state.world, matters, events, institutions } } : state;
}
