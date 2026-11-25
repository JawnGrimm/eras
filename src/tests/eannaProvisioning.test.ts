import { describe, expect, it } from 'vitest';
import { createInitialGameState, INITIAL_PERSON_ID } from '../state/initialState';
import { getInitializedScribal } from '../state/scribalState';
import { validateWorkDefinition } from '../works/workDefinition';
import {
  EANNA_ALLOCATION_EVENT_ID, EANNA_ALLOCATION_FOLLOWUP_MATTER_ID,
  EANNA_PROVISIONING_MATTER_ID, EANNA_SOURCE_PACKET, EANNA_SUMMARY_RECORD_ID,
  createEannaScenario, eannaProvisioningWork,
} from '../works/eannaProvisioning';

function completeScenario() {
  const scenario = createEannaScenario();
  scenario.stage = 4;
  scenario.sourceClassifications = Object.fromEntries(EANNA_SOURCE_PACKET.map((item) => [item.id, item.classification]));
  scenario.obverseEntries = EANNA_SOURCE_PACKET.filter((item) => item.obverse).map((item) => item.id);
  scenario.proposal = { ninKasiBarley: 10, gemeInanaBarley: 3, breadGroupBarley: 5, offeringBeerVessels: 4 };
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

  it('accepts retrospective compilation without pretending the full window was met', () => {
    const ctx = context(39);
    const assessment = eannaProvisioningWork.assessSubmission(eannaProvisioningWork.evaluateSubmission(ctx), ctx);
    expect(assessment.outcome).toBe('accepted');
    expect(assessment.dimensions.find((dimension) => dimension.dimension === 'procedure')?.status).toBe('partial');
    expect(assessment.summary).toContain('reduced scope');
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

  it('does not create a carry-forward matter when Lu-Nanshe closes with the recorded shortfall', () => {
    const finalization = eannaProvisioningWork.finalizeDisposition?.(context(), 'adjust_to_default');
    expect(finalization?.addInstitutionMatters).toBeUndefined();
  });
});
