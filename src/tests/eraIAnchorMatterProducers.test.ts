import { describe, expect, it } from 'vitest';
import { advanceInstitutionalMatters } from '../engine/institutionalMatters';
import { generateDailyAssignments } from '../engine/assignmentGenerator';
import { createInitialGameState } from '../state/initialState';
import { ERA_I_ANCHOR_OPPORTUNITY_DEFINITIONS } from '../content/assignments/eraIAnchorOpportunities';

describe('Era I institutional anchor matter producers', () => {
  it('introduces each approved anchor through its own dated source event and active institutional matter', () => {
    let state = createInitialGameState();
    expect(Object.values(state.world.matters).filter((matter) => matter.kind.startsWith('era1_'))).toHaveLength(0);

    const expectedDays = new Map([
      ['era1_com_01_consignment', 2],
      ['era1_com_02_brewing_account', 3],
      ['era1_civ_01_field_measurement', 4],
      ['era1_civ_02_labor_disbursement', 5],
      ['era1_rel_01_inana_offering', 6],
    ]);

    for (let day = 2; day <= 6; day++) {
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

    expect(Object.values(state.world.matters).filter((matter) => matter.kind.startsWith('era1_'))).toHaveLength(5);
    expect(state.opportunities.occurrenceLedger.filter((entry) =>
      ERA_I_ANCHOR_OPPORTUNITY_DEFINITIONS.some((definition) => definition.offer.activityId === entry.scenarioId),
    )).toHaveLength(5);
  });

  it('does not recreate or re-present an anchor occurrence on repeated advancement', () => {
    let state = createInitialGameState();
    for (let day = 2; day <= 6; day++) {
      state = advanceInstitutionalMatters(state, day);
      state = { ...state, calendar: { ...state.calendar, dayNumber: day } };
      state = generateDailyAssignments(state);
    }
    const matterIds = Object.values(state.world.matters).filter((matter) => matter.kind.startsWith('era1_'))
      .map((matter) => matter.id).sort();
    const occurrenceKeys = state.opportunities.occurrenceLedger
      .filter((entry) => ERA_I_ANCHOR_OPPORTUNITY_DEFINITIONS.some((definition) => definition.offer.activityId === entry.scenarioId))
      .map((entry) => entry.occurrenceKey).sort();

    for (let repeat = 0; repeat < 3; repeat++) {
      state = advanceInstitutionalMatters(state, 6);
      state = generateDailyAssignments(state);
    }

    expect(Object.values(state.world.matters).filter((matter) => matter.kind.startsWith('era1_')).map((matter) => matter.id).sort()).toEqual(matterIds);
    expect(state.opportunities.occurrenceLedger
      .filter((entry) => ERA_I_ANCHOR_OPPORTUNITY_DEFINITIONS.some((definition) => definition.offer.activityId === entry.scenarioId))
      .map((entry) => entry.occurrenceKey).sort()).toEqual(occurrenceKeys);
  });
});
