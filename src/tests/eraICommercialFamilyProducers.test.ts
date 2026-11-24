import { describe, expect, it } from 'vitest';
import { advanceInstitutionalMatters, MATTER_IDS, STOREHOUSE_INSTITUTION_ID, EANNA_INSTITUTION_ID, TEXTILE_HOUSEHOLD_INSTITUTION_ID } from '../engine/institutionalMatters';
import { NORTH_BAY_LOCATION_ID } from '../content/assignments/northBayRoofInspection';
import { generateDailyAssignments } from '../engine/assignmentGenerator';
import { createInitialGameState } from '../state/initialState';
import { createSaveEnvelope, restoreSave } from '../state/saveEnvelope';
import { era1ComF02TwoClaims, era1ComF03PartialReturn, era1ComF04CustodyChain, ERA1_COM_F02_F04_PEOPLE } from '../content/assignments/eraICommercialFamilies';
import { submitRubricAssignmentActivity } from '../engine/eraIAnchorSubmission';
import type { InstitutionalMatter } from '../state/types';
import type { EventId, InstitutionId, MatterId, RecordId } from '../state/ids';

function withOpenNorthBayRepairNeed() {
  const base = createInitialGameState();
  const matter: InstitutionalMatter = {
    id: MATTER_IDS.roofRepair,
    institutionId: STOREHOUSE_INSTITUTION_ID,
    kind: 'roof_repair_verification',
    summary: 'A repair need remains open for the north-bay roof.',
    status: 'active',
    createdDay: 2,
    sourceEventId: 'event-fixture-north-bay-repair-need' as EventId,
    locationId: NORTH_BAY_LOCATION_ID,
    involvedPersonIds: ['person-ur-nanna' as never, 'person-dudu' as never],
    provenance: [{ id: 'fixture-roof-repair-event', kind: 'event', sourceId: 'event-fixture-north-bay-repair-need', description: 'The north-bay repair need remains open.' }],
  };
  return {
    ...base,
    calendar: { ...base.calendar, dayNumber: 2, displayDate: 'Day 2 · Uruk (c. 3200 BCE)' },
    world: {
      ...base.world,
      matters: { ...base.world.matters, [matter.id]: matter },
      events: { ...base.world.events, ['event-fixture-north-bay-repair-need' as EventId]: {
        id: 'event-fixture-north-bay-repair-need' as EventId, dayNumber: 2,
        summary: 'The north-bay roof repair remains unfinished and requires timber.',
        personIds: ['person-ur-nanna' as never, 'person-dudu' as never],
        institutionIds: [STOREHOUSE_INSTITUTION_ID], locationId: NORTH_BAY_LOCATION_ID,
      } },
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
  it('adds provisional participants and their institutions lazily when continuing a save predating these families', () => {
    const base = withOpenNorthBayRepairNeed();
    const people = { ...base.world.people };
    const institutions = { ...base.world.institutions } as Record<InstitutionId, typeof base.world.institutions[keyof typeof base.world.institutions]>;
    const locations = { ...base.world.locations };
    delete people[ERA1_COM_F02_F04_PEOPLE.gemeInana];
    delete people[ERA1_COM_F02_F04_PEOPLE.amaGi];
    delete people[ERA1_COM_F02_F04_PEOPLE.sigAna];
    delete institutions[TEXTILE_HOUSEHOLD_INSTITUTION_ID];
    delete locations['location-uruk-textile-household-provisional' as never];
    delete locations['location-uruk-river-landing-provisional' as never];

    const preFamilySave = {
      ...base,
      world: { ...base.world, people, institutions, locations },
    };
    const restored = restoreSave(JSON.stringify(createSaveEnvelope(preFamilySave, 1)))?.state;
    expect(restored).toBeDefined();
    expect(restored!.world.people[ERA1_COM_F02_F04_PEOPLE.gemeInana]).toBeUndefined();

    let state = advance(restored!, 8);
    expect(state.world.people[ERA1_COM_F02_F04_PEOPLE.gemeInana]).toBeDefined();
    expect(state.world.institutions[TEXTILE_HOUSEHOLD_INSTITUTION_ID]).toBeDefined();
    state = advance(state, 9);
    state = advance(state, 10);
    expect(state.world.people[ERA1_COM_F02_F04_PEOPLE.amaGi]).toBeDefined();
    expect(state.world.people[ERA1_COM_F02_F04_PEOPLE.sigAna]).toBeDefined();
    expect(Object.values(state.world.matters).some((matter) => matter.kind === 'era1_com_f02_two_claims')).toBe(true);
    expect(Object.values(state.world.matters).some((matter) => matter.kind === 'era1_com_f03_partial_return')).toBe(true);
    expect(Object.values(state.world.matters).some((matter) => matter.kind === 'era1_com_f04_custody_chain')).toBe(true);
  });

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
    expect(state.world.events['event-era1-com-f03-outbound-dispatch' as EventId]).toMatchObject({ dayNumber: 8 });
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

  it('resolves F03 oral evidence to its current matter testimony sources when the report is filed', () => {
    let state = advance(createInitialGameState(), 8);
    state = advance(state, 9);
    const offer = Object.values(state.opportunities.assignments).find((item) =>
      item.activityId === era1ComF03PartialReturn.id,
    )!;
    const initialProgress = era1ComF03PartialReturn.createInitialProgress();
    const progress = {
      ...initialProgress,
      completedActionIds: era1ComF03PartialReturn.actions.map((action) => action.id),
      discoveryIds: era1ComF03PartialReturn.discoveries.map((item) => item.id),
      consultedPersonIds: [...new Set(era1ComF03PartialReturn.actions.flatMap((action) =>
        action.consultedPersonId ? [action.consultedPersonId] : [],
      ))],
      draft: {
        ...initialProgress.draft,
        finding: 'written_and_spoken_separated',
        responsibilityClaim: 'none',
        citedDiscoveryIds: era1ComF03PartialReturn.evaluation!.requiredEvidenceIds
          .concat(era1ComF03PartialReturn.evaluation!.relevantEvidenceIds),
        selectedLimitationIds: era1ComF03PartialReturn.evaluation!.requiredLimitationIds,
      },
    };
    const submitted = submitRubricAssignmentActivity(state, offer, era1ComF03PartialReturn, progress);
    expect(submitted?.feedback?.code).toBe('assignment-activity-submitted');
    const report = Object.values(submitted!.state.records.entries).find((entry) => entry.title === 'Exchange statement')!;
    expect(report.sources.find((source) => source.id === 'source-f03-geme-account')).toMatchObject({
      kind: 'person', sourceId: ERA1_COM_F02_F04_PEOPLE.gemeInana,
    });
    expect(report.sources.find((source) => source.id === 'source-f03-kuli-account')).toMatchObject({
      kind: 'person', sourceId: ERA1_COM_F02_F04_PEOPLE.kuli,
    });
    expect(report.sources.find((source) => source.id === 'source-f03-enlil-recollection')).toMatchObject({
      kind: 'person', sourceId: ERA1_COM_F02_F04_PEOPLE.enlilKisu,
    });
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

  it('files F02 evidence with its live source identities and applies the existing fair-report relationship schedule to both claimants', () => {
    const state = advance(withOpenNorthBayRepairNeed(), 8);
    const offer = Object.values(state.opportunities.assignments).find((item) =>
      item.activityId === era1ComF02TwoClaims.id,
    )!;
    const initialProgress = era1ComF02TwoClaims.createInitialProgress();
    const progress = {
      ...initialProgress,
      completedActionIds: era1ComF02TwoClaims.actions.map((action) => action.id),
      discoveryIds: era1ComF02TwoClaims.discoveries.map((item) => item.id),
      consultedPersonIds: [...new Set(era1ComF02TwoClaims.actions.flatMap((action) =>
        action.consultedPersonId ? [action.consultedPersonId] : [],
      ))],
      draft: {
        ...initialProgress.draft,
        finding: 'both_claims_documented',
        responsibilityClaim: 'none',
        citedDiscoveryIds: era1ComF02TwoClaims.evaluation!.requiredEvidenceIds
          .concat(era1ComF02TwoClaims.evaluation!.relevantEvidenceIds),
        selectedLimitationIds: era1ComF02TwoClaims.evaluation!.requiredLimitationIds,
        recommendations: ['present_both_claims'],
      },
    };

    const submitted = submitRubricAssignmentActivity(state, offer, era1ComF02TwoClaims, progress);
    expect(submitted?.feedback?.code).toBe('assignment-activity-submitted');
    const playerId = state.player.currentCharacterId;
    const urNannaRelationship = submitted!.state.world.relationships[ERA1_COM_F02_F04_PEOPLE.urNanna][playerId];
    const gemeRelationship = submitted!.state.world.relationships[ERA1_COM_F02_F04_PEOPLE.gemeInana][playerId];
    expect(urNannaRelationship?.dimensions).toMatchObject({ trust: 52, respect: 51 });
    expect(gemeRelationship?.dimensions).toMatchObject({ trust: 52, respect: 51 });

    const receiverRelationship = submitted!.state.world.relationships[ERA1_COM_F02_F04_PEOPLE.luNanshe][playerId];
    expect(receiverRelationship?.history.at(-1)?.summary).toContain('Lu-Nanshe reads the two claims side by side');
    for (const recipientId of [ERA1_COM_F02_F04_PEOPLE.urNanna, ERA1_COM_F02_F04_PEOPLE.gemeInana]) {
      const recipientName = submitted!.state.world.people[recipientId].name;
      const history = submitted!.state.world.relationships[recipientId][playerId]?.history;
      const latest = history?.at(-1);
      expect(latest?.summary).not.toContain('Lu-Nanshe reads the two claims side by side');
      expect(latest?.summary).toContain(`After Enlil-barni submitted "Competing claims summary" on Day 8, ${recipientName}'s trust toward Enlil-barni increased and respect increased.`);
    }

    const report = Object.values(submitted!.state.records.entries).find((entry) => entry.title === 'Competing claims summary')!;
    expect(report.sources.find((source) => source.id === 'source-f02-household-request')).toMatchObject({
      kind: 'other', sourceId: 'record-era1-com-f02-household-request',
    });
    expect(report.sources.find((source) => source.id === 'source-f02-storehouse-request')).toMatchObject({
      kind: 'other', sourceId: 'record-era1-com-f02-storehouse-request',
    });
  });

  it('keeps the F04 receiving official reaction on Utu-mansum’s edge, not the other recipients’ edges', () => {
    const state = advance(createInitialGameState(), 10);
    const offer = Object.values(state.opportunities.assignments).find((item) =>
      item.activityId === era1ComF04CustodyChain.id,
    )!;
    const initialProgress = era1ComF04CustodyChain.createInitialProgress();
    const progress = {
      ...initialProgress,
      completedActionIds: era1ComF04CustodyChain.actions.map((action) => action.id),
      discoveryIds: era1ComF04CustodyChain.discoveries.map((item) => item.id),
      consultedPersonIds: [...new Set(era1ComF04CustodyChain.actions.flatMap((action) =>
        action.consultedPersonId ? [action.consultedPersonId] : [],
      ))],
      draft: {
        ...initialProgress.draft,
        finding: 'first_difference_after_landing',
        responsibilityClaim: 'none',
        citedDiscoveryIds: era1ComF04CustodyChain.evaluation!.requiredEvidenceIds
          .concat(era1ComF04CustodyChain.evaluation!.relevantEvidenceIds),
        selectedLimitationIds: era1ComF04CustodyChain.evaluation!.requiredLimitationIds,
        recommendations: ['record_tallies_in_order'],
      },
    };

    const submitted = submitRubricAssignmentActivity(state, offer, era1ComF04CustodyChain, progress);
    expect(submitted?.feedback?.code).toBe('assignment-activity-submitted');
    const playerId = state.player.currentCharacterId;
    const receiverHistory = submitted!.state.world.relationships[ERA1_COM_F02_F04_PEOPLE.utuMansum][playerId]?.history;
    expect(receiverHistory?.at(-1)?.summary).toContain('Utu-mansum reads the sequence twice');

    for (const recipientId of [ERA1_COM_F02_F04_PEOPLE.enlilKisu, ERA1_COM_F02_F04_PEOPLE.amaGi]) {
      const recipientName = submitted!.state.world.people[recipientId].name;
      const history = submitted!.state.world.relationships[recipientId][playerId]?.history;
      const latest = history?.at(-1);
      expect(latest?.summary).not.toContain('Utu-mansum reads the sequence twice');
      expect(latest?.summary).toContain(`After Enlil-barni submitted "Custody-chain report" on Day 10, ${recipientName}'s trust toward Enlil-barni increased and respect increased.`);
    }
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
