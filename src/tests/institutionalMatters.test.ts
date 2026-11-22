import { describe, expect, it } from 'vitest';
import { advanceInstitutionalMatters, createRoofRepairMatter, MATTER_IDS, STOREHOUSE_INSTITUTION_ID } from '../engine/institutionalMatters';
import { createInitialGameState } from '../state/initialState';
import { createSaveEnvelope, restoreSave } from '../state/saveEnvelope';
import type { GameState } from '../state/types';

describe('typed institutional matters and bounded world tick', () => {
  it('normalizes the tutorial and all P1 north-bay matter descriptions into stable IDs', () => {
    const base = createInitialGameState();
    const legacyStrings = ['The Storehouse Reckoning', 'Verify north-bay roof repair', 'Verify north-bay roof repair (inspection incomplete)',
      'Roof repair certified without sufficient supporting inspection; physical condition remains unverified',
      'Clear north-bay parapet runoff channel and assess damp north-east beam socket',
      'North-bay roof repair inspected; continue monitoring after heavy rain',
      'Held-Barley Inspection recommended; seven sacks remain segregated, grain condition not yet assessed'];
    // Model a pre-Phase-2 schema-v2 save: the newer profile links did not yet exist.
    const people = Object.fromEntries(Object.entries(base.world.people).map(([id, person]) => [id, {
      ...person, circumstances: undefined, objectives: undefined, commitments: undefined,
    }]));
    const state = { ...base, world: { ...base.world, people, matters: {}, institutions: { ...base.world.institutions,
      [STOREHOUSE_INSTITUTION_ID]: { ...base.world.institutions[STOREHOUSE_INSTITUTION_ID], activeMatters: legacyStrings as unknown as typeof base.world.institutions[typeof STOREHOUSE_INSTITUTION_ID]['activeMatters'] } } } } as GameState;
    const restored = restoreSave(JSON.stringify(createSaveEnvelope(state, 1, '2026-11-22T12:00:00.000Z')));
    expect(restored).not.toBeNull();
    const institution = restored!.state.world.institutions[STOREHOUSE_INSTITUTION_ID];
    expect(institution.activeMatters).toEqual([MATTER_IDS.tutorial, MATTER_IDS.roofRepair, MATTER_IDS.heldBarley]);
    expect(restored!.state.world.matters[MATTER_IDS.roofRepair].scheduledDevelopment?.kind).toBe('rain');
    expect(restored!.state.world.matters[MATTER_IDS.heldBarley].sourceRecordId).toBeUndefined();
  });
  it('advances an unresolved roof matter once when its scheduled rain arrives', () => {
    const base = createInitialGameState();
    const matter = { ...createRoofRepairMatter(1), scheduledDevelopment: { kind: 'rain' as const, dayNumber: 4 } };
    const state: GameState = { ...base, calendar: { ...base.calendar, dayNumber: 3 }, world: { ...base.world,
      matters: { [matter.id]: matter }, institutions: { ...base.world.institutions,
        [STOREHOUSE_INSTITUTION_ID]: { ...base.world.institutions[STOREHOUSE_INSTITUTION_ID], activeMatters: [matter.id] } } } };
    const advanced = advanceInstitutionalMatters(state, 4);
    expect(advanced.world.events['event-north-bay-rain-day-4' as never]?.dayNumber).toBe(4);
    expect(advanced.world.matters[MATTER_IDS.roofRepair].status).toBe('developed');
    expect(advanced.world.matters[MATTER_IDS.waterIngress].status).toBe('active');
    expect(advanced.world.institutions[STOREHOUSE_INSTITUTION_ID].activeMatters).toEqual([MATTER_IDS.waterIngress]);
    expect(advanceInstitutionalMatters(advanced, 5).world.events).toEqual(advanced.world.events);
  });
});
