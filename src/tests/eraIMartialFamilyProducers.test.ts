import { describe, expect, it } from 'vitest';
import {
  advanceInstitutionalMatters, MATTER_IDS, STOREHOUSE_INSTITUTION_ID, EANNA_INSTITUTION_ID,
  TEXTILE_HOUSEHOLD_INSTITUTION_ID, HOUSEHOLD_STRONGROOM_INSTITUTION_ID,
} from '../engine/institutionalMatters';
import { generateDailyAssignments } from '../engine/assignmentGenerator';
import { createInitialGameState } from '../state/initialState';
import { createSaveEnvelope, restoreSave } from '../state/saveEnvelope';
import { NORTH_BAY_LOCATION_ID } from '../content/assignments/northBayRoofInspection';
import type { EventId, MatterId } from '../state/ids';
import type { InstitutionalMatter } from '../state/types';

function withOpenRepairNeed() {
  const base = createInitialGameState();
  const matter: InstitutionalMatter = {
    id: MATTER_IDS.roofRepair,
    institutionId: STOREHOUSE_INSTITUTION_ID,
    kind: 'roof_repair_verification',
    summary: 'The north-bay repair task remains open.',
    status: 'active',
    createdDay: 2,
    sourceEventId: 'event-fixture-martial-repair-need' as EventId,
    locationId: NORTH_BAY_LOCATION_ID,
    involvedPersonIds: ['person-ur-nanna' as never, 'person-dudu' as never],
    provenance: [{ id: 'martial-repair-need-event', kind: 'event', sourceId: 'event-fixture-martial-repair-need', description: 'The north-bay repair remains open.' }],
  };
  return {
    ...base,
    calendar: { ...base.calendar, dayNumber: 2, displayDate: 'Day 2 · Uruk (c. 3200 BCE)' },
    world: {
      ...base.world,
      matters: { ...base.world.matters, [matter.id]: matter },
      events: {
        ...base.world.events,
        ['event-fixture-martial-repair-need' as EventId]: {
          id: 'event-fixture-martial-repair-need' as EventId,
          dayNumber: 2,
          summary: 'The north-bay repair remains open and requires a task-specific party.',
          personIds: ['person-ur-nanna' as never, 'person-dudu' as never],
          institutionIds: [STOREHOUSE_INSTITUTION_ID],
          locationId: NORTH_BAY_LOCATION_ID,
        },
      },
      institutions: {
        ...base.world.institutions,
        [STOREHOUSE_INSTITUTION_ID]: {
          ...base.world.institutions[STOREHOUSE_INSTITUTION_ID],
          activeMatters: [...base.world.institutions[STOREHOUSE_INSTITUTION_ID].activeMatters, matter.id],
        },
      },
    },
  };
}

function advance(state: ReturnType<typeof createInitialGameState>, day: number) {
  const advanced = advanceInstitutionalMatters(state, day);
  return generateDailyAssignments({
    ...advanced,
    calendar: { ...advanced.calendar, dayNumber: day, displayDate: `Day ${day} · Uruk (c. 3200 BCE)` },
  });
}

const martialKinds = new Set<string>([
  'era1_mar_f01_door_opened',
  'era1_mar_f02_party_returns_short',
  'era1_mar_f03_late_turned_aside',
  'era1_mar_f04_valued_object_trail',
]);

describe('Era I Martial F01-F04 causal matter pipeline', () => {
  it('creates F01 as a finite household access incident with distinct impression, inventory, and attributed accounts', () => {
    const state = advance(createInitialGameState(), 11);
    const matter = Object.values(state.world.matters).find((item) => item.kind === 'era1_mar_f01_door_opened');
    expect(matter).toMatchObject({
      status: 'active',
      institutionId: HOUSEHOLD_STRONGROOM_INSTITUTION_ID,
      sourceEventId: 'event-era1-mar-f01-door-opened',
      sourceRecordId: 'record-era1-mar-f01-closure-impression',
    });
    expect(matter!.provenance?.filter((source) => source.kind === 'record_copy')).toHaveLength(5);
    expect(state.world.institutions[HOUSEHOLD_STRONGROOM_INSTITUTION_ID].activeMatters).toContain(matter!.id);
    expect(state.records.entries['record-era1-mar-f01-authorization-search' as never]?.uncertaintyLimits[0])
      .toContain('does not prove');
    expect(Object.values(state.opportunities.assignments).some((offer) =>
      offer.activityId === 'activity-era1-mar-f01-door-opened' && offer.originMatterId === matter!.id,
    )).toBe(true);
  });

  it('creates F02 only after a repair need produces an issue event and a later task-party return', () => {
    let state = advance(createInitialGameState(), 11);
    expect(state.world.events['event-era1-mar-f02-party-issue' as EventId]).toBeUndefined();
    expect(Object.values(state.world.matters).some((item) => item.kind === 'era1_mar_f02_party_returns_short')).toBe(false);

    state = advance(withOpenRepairNeed(), 11);
    expect(state.world.events['event-era1-mar-f02-party-issue' as EventId]).toBeDefined();
    expect(Object.values(state.world.matters).some((item) => item.kind === 'era1_mar_f02_party_returns_short')).toBe(false);
    state = advance(state, 12);

    const matter = Object.values(state.world.matters).find((item) => item.kind === 'era1_mar_f02_party_returns_short');
    expect(matter).toMatchObject({
      status: 'active',
      institutionId: STOREHOUSE_INSTITUTION_ID,
      sourceEventId: 'event-era1-mar-f02-party-return',
      sourceRecordId: 'record-era1-mar-f02-return-count',
    });
    expect(matter!.provenance?.some((source) => source.sourceId === 'event-era1-mar-f02-party-issue')).toBe(true);
    expect(state.world.institutions[STOREHOUSE_INSTITUTION_ID].activeMatters).toContain(matter!.id);
    expect(Object.values(state.opportunities.assignments).some((offer) =>
      offer.activityId === 'activity-era1-mar-f02-party-returns-short' && offer.originMatterId === matter!.id,
    )).toBe(true);
  });

  it('creates F03 only after a distinct dispatch event is followed by a late-arrival event without receipt', () => {
    let state = advance(createInitialGameState(), 11);
    expect(state.world.events['event-era1-mar-f03-dispatch' as EventId]).toBeDefined();
    expect(Object.values(state.world.matters).some((item) => item.kind === 'era1_mar_f03_late_turned_aside')).toBe(false);
    state = advance(state, 12);

    const matter = Object.values(state.world.matters).find((item) => item.kind === 'era1_mar_f03_late_turned_aside');
    expect(matter).toMatchObject({
      status: 'active',
      institutionId: TEXTILE_HOUSEHOLD_INSTITUTION_ID,
      sourceEventId: 'event-era1-mar-f03-late-turned-aside',
      sourceRecordId: 'record-era1-mar-f03-dispatch',
    });
    expect(matter!.provenance?.some((source) => source.sourceId === 'event-era1-mar-f03-dispatch')).toBe(true);
    expect(state.world.institutions[TEXTILE_HOUSEHOLD_INSTITUTION_ID].activeMatters).toContain(matter!.id);
    expect(Object.values(state.opportunities.assignments).some((offer) =>
      offer.activityId === 'activity-era1-mar-f03-late-turned-aside' && offer.originMatterId === matter!.id,
    )).toBe(true);
  });

  it('creates F04 from a recorded removal and workshop receipt followed by a separate overdue-return event', () => {
    let state = advance(createInitialGameState(), 12);
    expect(state.world.events['event-era1-mar-f04-object-removed' as EventId]).toBeDefined();
    expect(Object.values(state.world.matters).some((item) => item.kind === 'era1_mar_f04_valued_object_trail')).toBe(false);
    state = advance(state, 13);

    const matter = Object.values(state.world.matters).find((item) => item.kind === 'era1_mar_f04_valued_object_trail');
    expect(matter).toMatchObject({
      status: 'active',
      institutionId: EANNA_INSTITUTION_ID,
      sourceEventId: 'event-era1-mar-f04-object-return-overdue',
      sourceRecordId: 'record-era1-mar-f04-storehouse-search',
    });
    expect(matter!.provenance?.filter((source) => source.kind === 'record_copy')).toHaveLength(5);
    expect(matter!.provenance?.some((source) => source.sourceId === 'event-era1-mar-f04-object-removed')).toBe(true);
    expect(state.world.institutions[EANNA_INSTITUTION_ID].activeMatters).toContain(matter!.id);
    expect(Object.values(state.opportunities.assignments).some((offer) =>
      offer.activityId === 'activity-era1-mar-f04-valued-object-trail' && offer.originMatterId === matter!.id,
    )).toBe(true);
  });

  it('preserves all Martial matters, source records, and occurrence identities through save restoration', () => {
    let state = advance(withOpenRepairNeed(), 11);
    state = advance(state, 12);
    state = advance(state, 13);
    for (const kind of martialKinds) expect(Object.values(state.world.matters).some((matter) => matter.kind === kind)).toBe(true);

    const before = state.opportunities.occurrenceLedger
      .filter((entry) => entry.scenarioId.startsWith('activity-era1-mar-'))
      .map((entry) => entry.occurrenceKey).sort();
    for (let repeat = 0; repeat < 3; repeat++) state = advance(state, 13);
    expect(state.opportunities.occurrenceLedger
      .filter((entry) => entry.scenarioId.startsWith('activity-era1-mar-'))
      .map((entry) => entry.occurrenceKey).sort()).toEqual(before);

    const restored = restoreSave(JSON.stringify(createSaveEnvelope(state, 1)))?.state;
    expect(restored).toBeDefined();
    for (const matter of Object.values(state.world.matters).filter((item) => martialKinds.has(item.kind))) {
      expect(restored!.world.matters[matter.id]).toEqual(matter);
      expect(restored!.world.events[matter.sourceEventId!]).toEqual(state.world.events[matter.sourceEventId!]);
      expect(restored!.world.institutions[matter.institutionId].activeMatters).toContain(matter.id);
    }
    for (const id of Object.keys(state.records.entries).filter((key) => key.includes('era1-mar-f'))) {
      expect(restored!.records.entries[id as never]).toEqual(state.records.entries[id as never]);
    }
  });
});
