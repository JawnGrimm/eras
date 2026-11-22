import type { EventId, InstitutionId, LocationId, MatterId, RecordId } from '../state/ids';
import type { GameState, InstitutionalMatter } from '../state/types';
export const STOREHOUSE_INSTITUTION_ID = 'institution-uruk-temple-storehouse' as InstitutionId;
export const NORTH_BAY_LOCATION_ID = 'location-uruk-temple-storehouse' as LocationId;
export const MATTER_IDS = { tutorial: 'matter-storehouse-reckoning-tutorial' as MatterId, roofRepair: 'matter-north-bay-roof-verification' as MatterId, heldBarley: 'matter-held-barley-inspection' as MatterId, waterIngress: 'matter-north-bay-water-ingress' as MatterId } as const;
export function createRoofRepairMatter(dayNumber: number, sourceRecordId?: RecordId): InstitutionalMatter {
 return { id: MATTER_IDS.roofRepair, institutionId: STOREHOUSE_INSTITUTION_ID, kind: 'roof_repair_verification', summary: 'Verify the north-bay roof repair; the full condition remains unresolved.', status: 'active', createdDay: dayNumber, ...(sourceRecordId ? { sourceRecordId } : {}), locationId: NORTH_BAY_LOCATION_ID, scheduledDevelopment: { kind: 'rain', dayNumber: dayNumber + 3 } };
}
export function advanceInstitutionalMatters(state: GameState, nextDay: number): GameState {
 const matters = { ...state.world.matters }, events = { ...state.world.events }, institutions = { ...state.world.institutions }; let changed = false;
 for (const matter of Object.values(matters)) {
  if (matter.status !== 'active' || matter.scheduledDevelopment?.kind !== 'rain' || matter.scheduledDevelopment.dayNumber > nextDay) continue;
  const eventId = `event-north-bay-rain-day-${nextDay}` as EventId;
  events[eventId] = events[eventId] ?? { id: eventId, dayNumber: nextDay, summary: 'A hard rain drives water back beneath the north-bay roof patch; the obstructed parapet runoff channel has not been cleared.', personIds: [], institutionIds: [matter.institutionId], locationId: matter.locationId };
  matters[matter.id] = { ...matter, status: 'developed', developedDay: nextDay, sourceEventId: eventId };
  matters[MATTER_IDS.waterIngress] = matters[MATTER_IDS.waterIngress] ?? { id: MATTER_IDS.waterIngress, institutionId: matter.institutionId, kind: 'north_bay_water_ingress', summary: 'Rainwater has entered the north bay beneath the roof patch; affected storage must be assessed.', status: 'active', createdDay: nextDay, sourceRecordId: matter.sourceRecordId, locationId: matter.locationId, sourceEventId: eventId };
  const institution = institutions[matter.institutionId]; if (institution) institutions[matter.institutionId] = { ...institution, activeMatters: [...institution.activeMatters.filter((id) => id !== matter.id), ...(institution.activeMatters.includes(MATTER_IDS.waterIngress) ? [] : [MATTER_IDS.waterIngress])] };
  changed = true;
 }
 return changed ? { ...state, world: { ...state.world, matters, events, institutions } } : state;
}
