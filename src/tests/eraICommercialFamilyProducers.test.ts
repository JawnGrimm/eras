import { describe, expect, it } from 'vitest';
import { advanceInstitutionalMatters, MATTER_IDS, STOREHOUSE_INSTITUTION_ID, EANNA_INSTITUTION_ID, TEXTILE_HOUSEHOLD_INSTITUTION_ID } from '../engine/institutionalMatters';
import { generateDailyAssignments } from '../engine/assignmentGenerator';
import { createInitialGameState } from '../state/initialState';
import { createSaveEnvelope, restoreSave } from '../state/saveEnvelope';
import type { InstitutionalMatter, MatterId } from '../state/types';
import type { RecordId } from '../state/ids';

function withOpenNorthBayRepairNeed() {
  const base = createInitialGameState();
  const matter: InstitutionalMatter = {
    id: MATTER_IDS.roofRepair,
    institutionId: STOREHOUSE_INSTITUTION_ID,
    kind: 'roof_repair_verification',
    summary: 'A repair need remains open for the north-bay roof.',
    status: 'active',
    createdDay: 2,
  };
  return {
    ...base,
    world: {
      ...base.world,
      matters: { ...base.world.matters, [matter.id]: matter },
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

describe('Era I Commercial F02-F04 causal matter pipeline', () => {
  it('creates F02 only when both competing needs and a new timber delivery are present', () => {
    const noStorehouseNeed = advance(createInitialGameState(), 8);
    expect(Object.values(noStorehouseNeed.world.matters).some((matter) => matter.kind === 'era1_com_f02_two_claims')).toBe(false);

    const state = advance(withOpenNorthBayRepairNeed(), 8);
    const matter = Object.values(state.world.matters).find((item) => item.kind === 'era1_com_f02_two_claims');
    expect(matter).toMatchObject({
      status: 'active',
      institutionId: EANNA_INSTITUTION_ID,
      sourceEventId: 'event-era1-com-f02-two-claims-delivery',
      sourceRecordId: 'record-era1-com-f02-delivery-receipt',
    });
    expect(state.world.institutions[EANNA_INSTITUTION_ID].activeMatters).toContain(matter!.id);
    expect(state.world.events[matter!.sourceEventId!].personIds).toContain('person-geme-inana-provisional');
    expect(state.world.events[matter!.sourceEventId!].institutionIds).toEqual([
      EANNA_INSTITUTION_ID, STOREHOUSE_INSTITUTION_ID, TEXTILE_HOUSEHOLD_INSTITUTION_ID,
    ]);
    for (const id of [
      'record-era1-com-f02-storehouse-request',
      'record-era1-com-f02-household-request',
      'record-era1-com-f02-delivery-receipt',
      'record-era1-com-f02-carrier-account',
    ]) expect(state.records.entries[id as RecordId]).toBeDefined();

    expect(Object.values(state.opportunities.assignments).some((offer) =>
      offer.activityId === 'activity-era1-com-f02-two-claims' && offer.originMatterId === matter!.id,
    )).toBe(true);
  });

  it('creates F03 from a prior outbound event followed by a distinct partial-return event', () => {
    let state = advance(createInitialGameState(), 8);
    expect(state.world.events['event-era1-com-f03-outbound-dispatch']).toMatchObject({ dayNumber: 8 });
    expect(Object.values(state.world.matters).some((matter) => matter.kind === 'era1_com_f03_partial_return')).toBe(false);

    state = advance(state, 9);
    const matter = Object.values(state.world.matters).find((item) => item.kind === 'era1_com_f03_partial_return');
    expect(matter).toMatchObject({
      status: 'active',
      institutionId: TEXTILE_HOUSEHOLD_INSTITUTION_ID,
      sourceEventId: 'event-era1-com-f03-partial-return',
      sourceRecordId: 'record-era1-com-f03-partial-return',
    });
    expect(matter!.provenance?.some((source) => source.sourceId === 'event-era1-com-f03-outbound-dispatch')).toBe(true);
    expect(matter!.provenance?.some((source) => source.sourceId === 'record-era1-com-f03-outbound-dispatch')).toBe(true);
    expect(state.world.institutions[TEXTILE_HOUSEHOLD_INSTITUTION_ID].activeMatters).toContain(matter!.id);
    expect(Object.values(state.opportunities.assignments).some((offer) =>
      offer.activityId === 'activity-era1-com-f03-partial-return' && offer.originMatterId === matter!.id,
    )).toBe(true);
  });

  it('creates F04 from three independently authored custody tallies and preserves the first difference without assigning fault', () => {
    const state = advance(createInitialGameState(), 10);
    const matter = Object.values(state.world.matters).find((item) => item.kind === 'era1_com_f04_custody_chain');
    expect(matter).toMatchObject({
      status: 'active',
      institutionId: STOREHOUSE_INSTITUTION_ID,
      sourceEventId: 'event-era1-com-f04-custody-chain',
      sourceRecordId: 'record-era1-com-f04-receiving-tally',
    });
    expect(matter!.provenance?.filter((source) => source.kind === 'record_copy')).toHaveLength(3);
    expect(state.world.institutions[STOREHOUSE_INSTITUTION_ID].activeMatters).toContain(matter!.id);
    expect(state.records.entries['record-era1-com-f04-dispatch-tally' as never]?.assertions[0].text).toContain('Twelve');
    expect(state.records.entries['record-era1-com-f04-landing-tally' as never]?.assertions[0].text).toContain('Twelve');
    expect(state.records.entries['record-era1-com-f04-receiving-tally' as never]?.assertions[0].text).toContain('Eleven');
    expect(Object.values(state.opportunities.assignments).some((offer) =>
      offer.activityId === 'activity-era1-com-f04-custody-chain' && offer.originMatterId === matter!.id,
    )).toBe(true);
  });

  it('preserves all three family occurrences and their source records through save restoration without duplicate generation', () => {
    let state = advance(withOpenNorthBayRepairNeed(), 8);
    state = advance(state, 9);
    state = advance(state, 10);
    const expectedIds = [
      'matter-era1-com-f02-two-claims',
      'matter-era1-com-f03-partial-return',
      'matter-era1-com-f04-custody-chain',
    ];
    for (const id of expectedIds) expect(state.world.matters[id as MatterId]).toBeDefined();

    const occurrenceKeys = state.opportunities.occurrenceLedger
      .filter((entry) => ['activity-era1-com-f02-two-claims','activity-era1-com-f03-partial-return','activity-era1-com-f04-custody-chain'].includes(entry.scenarioId))
      .map((entry) => entry.occurrenceKey).sort();

    for (let repeat = 0; repeat < 3; repeat++) state = advance(state, 10);
    expect(state.opportunities.occurrenceLedger
      .filter((entry) => ['activity-era1-com-f02-two-claims','activity-era1-com-f03-partial-return','activity-era1-com-f04-custody-chain'].includes(entry.scenarioId))
      .map((entry) => entry.occurrenceKey).sort()).toEqual(occurrenceKeys);

    const restored = restoreSave(JSON.stringify(createSaveEnvelope(state, 1)))?.state;
    expect(restored).toBeDefined();
    for (const id of expectedIds) {
      const matter = state.world.matters[id as MatterId];
      expect(restored!.world.matters[id as MatterId]).toEqual(matter);
      expect(restored!.world.events[matter.sourceEventId!]).toEqual(state.world.events[matter.sourceEventId!]);
      expect(restored!.world.institutions[matter.institutionId].activeMatters).toContain(matter.id);
    }
    for (const id of Object.keys(state.records.entries).filter((key) => key.includes('era1-com-f0'))) {
      expect(restored!.records.entries[id as never]).toEqual(state.records.entries[id as never]);
    }
  });
});
