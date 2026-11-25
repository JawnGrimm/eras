import { describe, expect, it } from 'vitest';
import { createInitialGameState, INITIAL_PERSON_ID } from '../state/initialState';
import { getInitializedScribal } from '../state/scribalState';
import { validateWorkDefinition } from '../works/workDefinition';
import { transitionGame } from '../engine/actionEconomy';
import { INITIAL_WORK_CATALOG } from '../state/newGameState';
import { createSaveEnvelope, isValidSaveEnvelope, restoreSave } from '../state/saveEnvelope';
import {
  EANNA_ALLOCATION_EVENT_ID, EANNA_ALLOCATION_FOLLOWUP_MATTER_ID,
  EANNA_PROVISIONING_MATTER_ID, EANNA_SOURCE_PACKET, EANNA_SUMMARY_RECORD_ID,
  createEannaScenario, eannaProvisioningWork, isEraICareerScaleWorkChoiceEligible,
} from '../works/eannaProvisioning';

function completeScenario() {
  const scenario = createEannaScenario();
  scenario.stage = 4;
  scenario.sourceClassifications = Object.fromEntries(EANNA_SOURCE_PACKET.map((item) => [item.id, item.classification]));
  scenario.obverseEntries = EANNA_SOURCE_PACKET.filter((item) => item.obverse).map((item) => item.id);
  scenario.proposal = { ninKasiBarley: 8, gemeInanaBarley: 6, breadGroupBarley: 4, offeringBeerVessels: 3 };
  return scenario;
}

function context(dayNumber = 35) {
  const state = createInitialGameState();
  const person = state.world.people[INITIAL_PERSON_ID];
  const character = getInitializedScribal(person);
  if (!character) throw new Error('Test character is not initialized.');
  return { progress: completeScenario(), character, examinedEvidence: [], personId: person.id, dayNumber };
}

describe('Eanna Provisioning Undertaking', () => {
  it('is a valid ordinary Work with the four approved AP stages and provision contract', () => {
    expect(validateWorkDefinition(eannaProvisioningWork)).toEqual([]);
    expect(eannaProvisioningWork.kind).toBe('work');
    expect(eannaProvisioningWork.actions.map((action) => action.apCost)).toEqual([1, 2, 3, 1]);
    expect(eannaProvisioningWork.initialSubmissionApCost).toBe(1);
    expect(eannaProvisioningWork.dispositionApCost).toBe(1);
    expect(eannaProvisioningWork.provisionsContract).toEqual({
      minimumWorkApPerDay: 2, provisionsPerQualifiedWorkday: 1,
    });
    expect(eannaProvisioningWork.historicalXpReward).toBe(100);
  });

  it('accepts distinct source classes, complete obverse entries, and a bounded allocation', () => {
    const ctx = context();
    const submission = eannaProvisioningWork.evaluateSubmission(ctx);
    const assessment = eannaProvisioningWork.assessSubmission(submission, ctx);
    expect(assessment.outcome).toBe('accepted');
    expect(assessment.dimensions.every((dimension) => dimension.status === 'meets')).toBe(true);
  });

  it('accepts retrospective compilation through Day 42 without pretending the full window was met', () => {
    for (const day of [39, 42]) {
      const ctx = context(day);
      const assessment = eannaProvisioningWork.assessSubmission(eannaProvisioningWork.evaluateSubmission(ctx), ctx);
      expect(assessment.outcome).toBe('accepted');
      expect(assessment.dimensions.find((dimension) => dimension.dimension === 'procedure')?.status).toBe('partial');
      expect(assessment.summary).toContain('reduced scope');
    }
  });

  it('uses official review of surviving records after Day 42 without backdating', () => {
    const ctx = context(43);
    const assessment = eannaProvisioningWork.assessSubmission(eannaProvisioningWork.evaluateSubmission(ctx), ctx);
    expect(assessment.outcome).toBe('accepted');
    expect(assessment.dimensions.find((dimension) => dimension.dimension === 'procedure')?.summary).toContain('official review of surviving source records');
    const finalization = eannaProvisioningWork.finalizeDisposition?.(ctx, 'adjust_to_default');
    expect(finalization?.record?.createdDay).toBe(43);
    expect(finalization?.record?.assertions.some((assertion) => assertion.id === 'eanna-post-window-review')).toBe(true);
  });

  it('creates a separate official event, immutable summary record, and conditional carry-forward matter', () => {
    const ctx = context();
    const finalization = eannaProvisioningWork.finalizeDisposition?.(ctx, 'carry_forward');
    expect(finalization?.record?.id).toBe(EANNA_SUMMARY_RECORD_ID);
    expect(finalization?.events?.[0].id).toBe(EANNA_ALLOCATION_EVENT_ID);
    expect(finalization?.retireInstitutionMatters).toEqual([{
      institutionId: finalization?.record?.institutionId, matterId: EANNA_PROVISIONING_MATTER_ID,
    }]);
    expect(finalization?.addInstitutionMatters?.[0].id).toBe(EANNA_ALLOCATION_FOLLOWUP_MATTER_ID);
    expect(finalization?.record?.assertions.some((assertion) => assertion.text.includes('not counted, received'))).toBe(true);
  });

  it('unlocks the next career-scale Work choice only after Eanna is in completedWorks', () => {
    expect(isEraICareerScaleWorkChoiceEligible([])).toBe(false);
    expect(isEraICareerScaleWorkChoiceEligible(['work-other' as typeof eannaProvisioningWork.id])).toBe(false);
    expect(isEraICareerScaleWorkChoiceEligible([eannaProvisioningWork.id])).toBe(true);
  });

  it('persists the Work lifecycle, provisions, official decision, record, event, XP, and save compatibility', () => {
    const workId = eannaProvisioningWork.id;
    let state = createInitialGameState();
    state = { ...state, calendar: { ...state.calendar, dayNumber: 1 } };

    let result = transitionGame(state, { type: 'START_WORK', workId }, undefined, INITIAL_WORK_CATALOG);
    expect(result.feedback?.code).toBe('work-started');
    state = result.state;
    expect(state.world.matters[EANNA_PROVISIONING_MATTER_ID]?.status).toBe('active');
    const originMatter = state.world.matters[EANNA_PROVISIONING_MATTER_ID];
    expect(state.world.institutions[originMatter.institutionId].activeMatters).toContain(EANNA_PROVISIONING_MATTER_ID);

    const scenario = completeScenario();
    for (const [actionId, stage] of [
      ['sort-sources', 1], ['compile-obverse', 2],
    ] as const) {
      result = transitionGame(state, {
        type: 'COMPLETE_WORK_ACTION', workId, actionId, scenarioData: { ...scenario, stage },
      }, undefined, INITIAL_WORK_CATALOG);
      expect(result.feedback?.kind).toBe('success');
      state = result.state;
    }

    const closed = transitionGame(state, { type: 'END_DAY', expectedDayNumber: 1 }, undefined, INITIAL_WORK_CATALOG);
    expect(closed.settlement?.workContractProvisionEarned).toBe(1);
    const settlementId = closed.state.dayClose.pendingSettlementId;
    expect(settlementId).toBeTruthy();
    state = transitionGame(closed.state, { type: 'BEGIN_WORKDAY', expectedSettlementId: settlementId! }, undefined, INITIAL_WORK_CATALOG).state;
    expect(state.calendar.dayNumber).toBe(2);

    for (const [actionId, stage] of [
      ['consolidate-reverse', 3], ['final-check', 4],
    ] as const) {
      result = transitionGame(state, {
        type: 'COMPLETE_WORK_ACTION', workId, actionId, scenarioData: { ...scenario, stage },
      }, undefined, INITIAL_WORK_CATALOG);
      expect(result.feedback?.kind).toBe('success');
      state = result.state;
    }
    result = transitionGame(state, { type: 'SUBMIT_WORK', workId }, undefined, INITIAL_WORK_CATALOG);
    expect(result.feedback?.code).toBe('work-assessment-pending-disposition');
    state = result.state;
    result = transitionGame(state, { type: 'DISPOSE_WORK', workId, disposition: 'adjust_to_default' }, undefined, INITIAL_WORK_CATALOG);
    expect(result.feedback?.code).toBe('work-completed');
    state = result.state;

    expect(state.records.entries[EANNA_SUMMARY_RECORD_ID]).toBeDefined();
    const assertions = state.records.entries[EANNA_SUMMARY_RECORD_ID].assertions;
    expect(assertions.find((item) => item.id === 'eanna-apprentice-proposal')?.text).toContain('8 barley measures to Nin-kasi');
    expect(assertions.find((item) => item.id === 'eanna-official-allocation')?.text).toContain('10 barley measures to Nin-kasi');
    expect(assertions.find((item) => item.id === 'eanna-official-seal')?.text).toContain('seal impression applied by Lu-Nanshe');
    expect(state.world.events[EANNA_ALLOCATION_EVENT_ID]).toBeDefined();
    expect(state.world.matters[EANNA_PROVISIONING_MATTER_ID]?.status).toBe('resolved');
    expect(state.world.institutions[originMatter.institutionId].activeMatters).not.toContain(EANNA_PROVISIONING_MATTER_ID);
    expect(state.world.matters[EANNA_ALLOCATION_FOLLOWUP_MATTER_ID]).toBeUndefined();
    expect(state.historicalProgression.historicalXp).toBe(100);
    expect(state.historicalProgression.completedWorks).toContain(workId);
    expect(isEraICareerScaleWorkChoiceEligible(state.historicalProgression.completedWorks)).toBe(true);

    const repeated = transitionGame(state, { type: 'DISPOSE_WORK', workId, disposition: 'adjust_to_default' }, undefined, INITIAL_WORK_CATALOG);
    expect(repeated.feedback?.kind).toBe('error');
    expect(repeated.state.historicalProgression.historicalXp).toBe(100);
    expect(Object.keys(repeated.state.world.events).filter((id) => id === EANNA_ALLOCATION_EVENT_ID)).toHaveLength(1);

    const envelope = createSaveEnvelope(state, 1);
    expect(isValidSaveEnvelope(envelope, INITIAL_WORK_CATALOG)).toBe(true);
    const restored = restoreSave(JSON.stringify(envelope), INITIAL_WORK_CATALOG);
    expect(restored).not.toBeNull();
    expect(restored?.state.records.entries[EANNA_SUMMARY_RECORD_ID]).toEqual(state.records.entries[EANNA_SUMMARY_RECORD_ID]);
    expect(restored?.state.world.matters[EANNA_PROVISIONING_MATTER_ID]?.status).toBe('resolved');
  });

  it('does not create a carry-forward matter when Lu-Nanshe closes with the recorded shortfall', () => {
    const finalization = eannaProvisioningWork.finalizeDisposition?.(context(), 'adjust_to_default');
    expect(finalization?.addInstitutionMatters).toBeUndefined();
  });
});
