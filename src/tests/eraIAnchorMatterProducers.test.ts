import { describe, expect, it } from 'vitest';
import { advanceInstitutionalMatters, EANNA_INSTITUTION_ID, EANNA_TABLET_ROOM_LOCATION_ID } from '../engine/institutionalMatters';
import { generateDailyAssignments } from '../engine/assignmentGenerator';
import { createInitialGameState } from '../state/initialState';
import { createSaveEnvelope, restoreSave } from '../state/saveEnvelope';
import { ERA_I_ANCHOR_OPPORTUNITY_DEFINITIONS } from '../content/assignments/eraIAnchorOpportunities';

const ANCHOR_KINDS = new Set(['era1_com_01_consignment','era1_com_02_brewing_account','era1_civ_01_field_measurement','era1_civ_02_labor_disbursement','era1_rel_01_inana_offering']);

describe('Era I institutional anchor matter producers', () => {
  it('introduces each approved anchor through its own dated source event and active institutional matter', () => {
    let state = createInitialGameState();
    expect(Object.values(state.world.matters).filter((matter) => ANCHOR_KINDS.has(matter.kind))).toHaveLength(0);

    const expectedDays = new Map([
      ['era1_com_01_consignment', 2],
      ['era1_com_02_brewing_account', 3],
      ['era1_civ_01_field_measurement', 4],
      ['era1_civ_02_labor_disbursement', 6],
      ['era1_rel_01_inana_offering', 7],
    ]);

    for (const day of [2, 3, 4, 6, 7]) {
      state = advanceInstitutionalMatters(state, day);
      state = { ...state, calendar: { ...state.calendar, dayNumber: day } };
      const createdToday = Object.values(state.world.matters).filter((matter) => matter.createdDay === day
        && expectedDays.get(matter.kind) === day);
      expect(createdToday).toHaveLength(1);

      const matter = createdToday[0];
      expect(matter.sourceEventId).toBeDefined();
      expect(state.world.events[matter.sourceEventId!]).toMatchObject({
        id: matter.sourceEventId,
        dayNumber: day,
        institutionIds: [matter.institutionId],
      });
      expect(state.world.institutions[matter.institutionId].activeMatters).toContain(matter.id);

      const definition = ERA_I_ANCHOR_OPPORTUNITY_DEFINITIONS.find((item) => item.matterKind === matter.kind)!;
      state = generateDailyAssignments(state);
      expect(Object.values(state.opportunities.assignments).some((offer) =>
        offer.activityId === definition.offer.activityId && offer.originMatterId === matter.id
        && offer.sourceEventId === matter.sourceEventId,
      )).toBe(true);
    }

    expect(Object.values(state.world.matters).filter((matter) => expectedDays.has(matter.kind))).toHaveLength(5);
    expect(state.opportunities.occurrenceLedger.filter((entry) =>
      ERA_I_ANCHOR_OPPORTUNITY_DEFINITIONS.some((definition) => definition.offer.activityId === entry.scenarioId),
    )).toHaveLength(5);
  });

  it('creates the anchor institution lazily when advancing a save from before the anchor portfolio', () => {
    const initial = createInitialGameState();
    const institutions = { ...initial.world.institutions };
    const locations = { ...initial.world.locations };
    delete institutions[EANNA_INSTITUTION_ID];
    delete locations[EANNA_TABLET_ROOM_LOCATION_ID];
    const prePortfolioState = {
      ...initial,
      world: { ...initial.world, institutions, locations },
    };
    const restored = restoreSave(JSON.stringify(createSaveEnvelope(prePortfolioState, 1)))?.state;
    expect(restored).toBeDefined();
    expect(restored!.world.institutions[EANNA_INSTITUTION_ID]).toBeUndefined();

    const advanced = advanceInstitutionalMatters(restored!, 2);
    expect(advanced.world.institutions[EANNA_INSTITUTION_ID]).toMatchObject({
      id: EANNA_INSTITUTION_ID,
      locationId: EANNA_TABLET_ROOM_LOCATION_ID,
    });
    expect(advanced.world.locations[EANNA_TABLET_ROOM_LOCATION_ID]).toBeDefined();
    expect(Object.values(advanced.world.matters).some((matter) => matter.kind === 'era1_com_01_consignment')).toBe(true);
  });

  it('preserves anchor matters, source events, registration, and occurrence identity through save restoration', () => {
    let state = createInitialGameState();
    for (let day = 2; day <= 7; day++) {
      state = advanceInstitutionalMatters(state, day);
      state = { ...state, calendar: { ...state.calendar, dayNumber: day } };
      state = generateDailyAssignments(state);
    }

    const envelope = createSaveEnvelope(state, 1);
    const restored = restoreSave(JSON.stringify(envelope))?.state;
    expect(restored).toBeDefined();
    for (const matter of Object.values(state.world.matters).filter((item) => ANCHOR_KINDS.has(item.kind))) {
      expect(restored!.world.matters[matter.id]).toEqual(matter);
      expect(restored!.world.events[matter.sourceEventId!]).toEqual(state.world.events[matter.sourceEventId!]);
      expect(restored!.world.institutions[matter.institutionId].activeMatters).toContain(matter.id);
    }
    expect(restored!.opportunities.occurrenceLedger).toEqual(state.opportunities.occurrenceLedger);
  });

  it('does not recreate or re-present an anchor occurrence on repeated advancement', () => {
    let state = createInitialGameState();
    for (let day = 2; day <= 7; day++) {
      state = advanceInstitutionalMatters(state, day);
      state = { ...state, calendar: { ...state.calendar, dayNumber: day } };
      state = generateDailyAssignments(state);
    }
    const matterIds = Object.values(state.world.matters).filter((matter) => ANCHOR_KINDS.has(matter.kind))
      .map((matter) => matter.id).sort();
    const occurrenceKeys = state.opportunities.occurrenceLedger
      .filter((entry) => ERA_I_ANCHOR_OPPORTUNITY_DEFINITIONS.some((definition) => definition.offer.activityId === entry.scenarioId))
      .map((entry) => entry.occurrenceKey).sort();

    for (let repeat = 0; repeat < 3; repeat++) {
      state = advanceInstitutionalMatters(state, 7);
      state = generateDailyAssignments(state);
    }

    expect(Object.values(state.world.matters).filter((matter) => ANCHOR_KINDS.has(matter.kind)).map((matter) => matter.id).sort()).toEqual(matterIds);
    expect(state.opportunities.occurrenceLedger
      .filter((entry) => ERA_I_ANCHOR_OPPORTUNITY_DEFINITIONS.some((definition) => definition.offer.activityId === entry.scenarioId))
      .map((entry) => entry.occurrenceKey).sort()).toEqual(occurrenceKeys);
  });
});
