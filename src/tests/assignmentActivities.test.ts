import { describe, expect, it } from 'vitest';
import { getInitializedScribal } from '../state/scribalState';
import { transitionGame } from '../engine/actionEconomy';
import { createInitialGameState } from '../state/initialState';
import { createSaveEnvelope, isValidSaveEnvelope, restoreSave } from '../state/saveEnvelope';
import { INITIAL_WORK_CATALOG } from '../state/newGameState';
import { ERA1_COM_F02_F04_PEOPLE } from '../content/assignments/eraICommercialFamilies';
import type { AssignmentOffer, GameState } from '../state/types';
import type { AssignmentId } from '../state/ids';
import { NORTH_BAY_ACTIVITY_ID, NORTH_BAY_ASSIGNMENT_ID, NORTH_BAY_DISCOVERIES, northBayRoofInspection, validateAssignmentActivityDefinition, validateAssignmentActivityProgress, ASSIGNMENT_ACTIVITY_CATALOG } from '../content/assignments/northBayRoofInspection';
import { ERA_I_ANCHOR_ACTIVITY_CATALOG, sealedVesselTextileConsignment, legacySealedVesselTextileConsignment } from '../content/assignments/eraIAnchors';
import { evaluateAssignmentAssessment } from '../engine/eraIAnchorSubmission';
import { ERA_I_ANCHOR_OPPORTUNITY_DEFINITIONS } from '../content/assignments/eraIAnchorOpportunities';

const baseline = { kind: 'baseline_reach' as const, explanation: 'The Senior Scribe directed the inspection after reviewing the prior record.' };
function roofOffer(): Omit<AssignmentOffer, 'offeredDay' | 'expiresDay' | 'status' | 'lapsedDuringMandatoryWork'> {
  return {
    id: NORTH_BAY_ASSIGNMENT_ID, activityId: NORTH_BAY_ACTIVITY_ID, estimatedTotalAp: 7,
    title: 'North-Bay Roof Inspection', description: 'Inspect the repaired roof and report remaining storage risks.',
    employer: { kind: 'institution', id: 'institution-uruk-temple-storehouse' as never },
    category: 'building_inspection', commodity: 'barley',
    context: { what: 'Inspect the north-bay repair.', who: ['Ur-Nanna','Dudu','Enlil-barni'],
      quantity: 'One roof section and seven sealed pottery storage jars.', when: 'After the storm repair.',
      where: 'Temple Storehouse, Uruk', from: 'Storehouse Reckoning record', to: 'Shuruppak-ilu',
      purpose: 'Verify repair scope and remaining storage risks.',
      responsibility: ['Report findings; do not release held stock or authorize building expenditure.'],
      authority: 'Steward grants access; Senior Scribe determines follow-up.',
      provenance: ['Storehouse Reckoning report'] },
    requiredSkills: {}, difficulty: 'demanding', compensation: { money: 3, provisions: 0 },
    careerXpReward: 35, deliveryChannels: [baseline],
  };
}
function present(state: GameState): GameState {
  return transitionGame(state, { type: 'PRESENT_ASSIGNMENT', offer: roofOffer() }).state;
}
describe('North-Bay Roof Inspection activity definition and engine', () => {
  it('passes static validation for unique IDs, bounded AP, reachable prerequisites, valid person/skill/attribute references, and interpretation rules', () => {
    expect(validateAssignmentActivityDefinition(northBayRoofInspection)).toEqual([]);
  });

  it('validates all five authored Era I anchors and their approved provisional parameter values', () => {
    const anchors = Object.values(ERA_I_ANCHOR_ACTIVITY_CATALOG);
    expect(anchors).toHaveLength(5);
    expect(anchors.map((definition) => validateAssignmentActivityDefinition(definition))).toEqual([[],[],[],[],[]]);
    expect(ERA_I_ANCHOR_OPPORTUNITY_DEFINITIONS.map((definition) => definition.offer.estimatedTotalAp)).toEqual([5,4,4,5,4]);
    expect(ERA_I_ANCHOR_OPPORTUNITY_DEFINITIONS.every((definition) => definition.offer.compensation.money === 10
      && definition.offer.careerXpReward === 12)).toBe(true);
    expect(ERA_I_ANCHOR_OPPORTUNITY_DEFINITIONS.filter((definition) => definition.offer.compensation.provisions === 1)).toHaveLength(1);
    expect(ERA_I_ANCHOR_OPPORTUNITY_DEFINITIONS.find((definition) => definition.offer.compensation.provisions === 1)?.offer.compensationDisclosure).toContain('1 Provision');
  });

  it('uses sealed pottery storage jars throughout North-Bay evidence and actions', () => {
    const evidence = NORTH_BAY_DISCOVERIES.map((item) => item.text).join(' ');
    expect(evidence).toContain('seven sealed pottery storage jars');
    expect(evidence).not.toMatch(/\bsacks?\b/i);
    expect(northBayRoofInspection.actions.find((action) => action.id === 'inspect-roof')?.description).toContain('storage jars');
    expect(northBayRoofInspection.reportSchema.recommendations.find((item) => item.id === 'inspect_held_barley')?.label).toContain('held jars');
  });

  it('rejects duplicate IDs, out-of-range AP, and circular action prerequisites', () => {
    const duplicate = { ...northBayRoofInspection, actions: [...northBayRoofInspection.actions, { ...northBayRoofInspection.actions[0] }] };
    expect(validateAssignmentActivityDefinition(duplicate).some((issue) => issue.includes('unique'))).toBe(true);
    const excessive = { ...northBayRoofInspection, actions: northBayRoofInspection.actions.map((action, index) => index === 0 ? { ...action, apCost: 7 } : action) };
    expect(validateAssignmentActivityDefinition(excessive).some((issue) => issue.includes('AP'))).toBe(true);
    const circular = { ...northBayRoofInspection, actions: northBayRoofInspection.actions.map((action) =>
      action.id === 'brief-steward' ? { ...action, prerequisites: ['compare-scope'] } : action) };
    expect(validateAssignmentActivityDefinition(circular).some((issue) => issue.includes('unreachable'))).toBe(true);
  });

  it('rejects unknown PersonId, SkillId, and AttributeId references', () => {
    const badRefs = {
      ...northBayRoofInspection,
      actions: northBayRoofInspection.actions.map((action, index) => index === 0
        ? { ...action, consultedPersonId: 'person-not-registered' as never } : action),
      interpretationRules: northBayRoofInspection.interpretationRules.map((rule, index) => index === 0
        ? { ...rule, when: { kind: 'all' as const, predicates: [
          { kind: 'skillAtLeast' as const, skillId: 'skill-not-registered' as never, level: 2 },
          { kind: 'attributeAtLeast' as const, attributeId: 'attribute-not-registered' as never, value: 2 },
        ] } } : rule),
    };
    const issues = validateAssignmentActivityDefinition(badRefs);
    expect(issues.some((issue) => issue.includes('PersonId'))).toBe(true);
    expect(issues.some((issue) => issue.includes('SkillId'))).toBe(true);
    expect(issues.some((issue) => issue.includes('AttributeId'))).toBe(true);
  });

  it('keeps legacy v2 saves loadable by normalizing Dudu, the storehouse location, and initial appointments', () => {
    const state = createInitialGameState();
    const legacyPeople = { ...state.world.people };
    delete legacyPeople[ERA1_COM_F02_F04_PEOPLE.gemeInana];
    delete legacyPeople[ERA1_COM_F02_F04_PEOPLE.amaGi];
    delete legacyPeople[ERA1_COM_F02_F04_PEOPLE.sigAna];
    const luNanshe = legacyPeople['person-lu-nanshe' as never];
    if (luNanshe) legacyPeople['person-lu-nanshe' as never] = {
      ...luNanshe, affiliations: luNanshe.affiliations.filter((id) => id !== 'institution-uruk-eanna-precinct'),
    };
    const world = { ...state.world, people: legacyPeople, locations: {}, appointments: {},
      institutions: { ['institution-uruk-temple-storehouse' as never]: {
        ...state.world.institutions['institution-uruk-temple-storehouse' as never], locationId: undefined,
      } } };
    delete world.people['person-dudu' as never];
    const legacy = { ...state, world };
    const restored = restoreSave(JSON.stringify(createSaveEnvelope(legacy, 1)), INITIAL_WORK_CATALOG);
    expect(restored).not.toBeNull();
    expect(restored?.state.world.people['person-dudu' as never]?.name).toBe('Dudu');
    expect(Object.keys(restored?.state.world.appointments ?? {})).toHaveLength(3);
    expect(Object.keys(restored?.state.world.locations ?? {})).toContain('location-uruk-temple-storehouse');
  });

  it('retires legacy Day 1 instant starter offers when restoring older saves', () => {
    const base = createInitialGameState();
    const legacyContext = {
      what: 'Complete an obsolete one-click starter task.',
      who: ['Enlil-barni', 'Ur-Nanna'],
      quantity: 'One tablet copy.',
      when: 'Day 1',
      where: 'Temple Storehouse, Uruk',
      from: 'An earlier storehouse record.',
      to: 'Ur-Nanna',
      purpose: 'Legacy save compatibility test.',
      responsibility: ['The old starter card represented an instant task.'],
      authority: 'No institutional authority is changed.',
      provenance: ['Legacy starter content.'],
    };
    const legacyOffer = (id: string, status: 'offered' | 'accepted' | 'completed'): AssignmentOffer => ({
      id: id as AssignmentId,
      title: id === 'assignment-storehouse-copy-check' ? 'Check the Storehouse Copy' : 'Prepare a Practice Tablet',
      description: 'Legacy instant starter card.',
      employer: { kind: 'institution', id: 'institution-uruk-temple-storehouse' as never },
      category: 'legacy_starter',
      context: legacyContext,
      requiredSkills: {},
      difficulty: 'routine',
      apCost: 1,
      compensation: { money: 1, provisions: 0 },
      careerXpReward: 1,
      deliveryChannels: [baseline],
      offeredDay: 1,
      expiresDay: 4,
      status,
      ...(status === 'accepted' ? { assigneePersonId: base.player.currentCharacterId } : {}),
    });
    const state = {
      ...base,
      opportunities: {
        ...base.opportunities,
        assignments: {
          ['assignment-storehouse-copy-check' as AssignmentId]: legacyOffer('assignment-storehouse-copy-check', 'offered'),
          ['assignment-apprentice-tablet-preparation' as AssignmentId]: legacyOffer('assignment-apprentice-tablet-preparation', 'accepted'),
          ['assignment-completed-legacy' as AssignmentId]: legacyOffer('assignment-completed-legacy', 'completed'),
        },
      },
    };
    const restored = restoreSave(JSON.stringify(createSaveEnvelope(state, 1)), INITIAL_WORK_CATALOG);
    expect(restored).not.toBeNull();
    expect(restored?.state.opportunities.assignments['assignment-storehouse-copy-check' as AssignmentId].status).toBe('lapsed');
    expect(restored?.state.opportunities.assignments['assignment-apprentice-tablet-preparation' as AssignmentId].status).toBe('lapsed');
    expect(restored?.state.opportunities.assignments['assignment-completed-legacy' as AssignmentId].status).toBe('completed');
  });

  it('initializes activity progress, rejects single-click completion, and scopes actions to the accepting character', () => {
    let state = present(createInitialGameState());
    state = transitionGame(state, { type: 'ACCEPT_ASSIGNMENT', assignmentId: NORTH_BAY_ASSIGNMENT_ID }).state;
    expect(state.opportunities.assignments[NORTH_BAY_ASSIGNMENT_ID].activityProgress?.completedActionIds).toEqual([]);
    expect(isValidSaveEnvelope(createSaveEnvelope(state, 1), INITIAL_WORK_CATALOG)).toBe(true);
    expect(transitionGame(state, { type: 'COMPLETE_ASSIGNMENT', assignmentId: NORTH_BAY_ASSIGNMENT_ID }).feedback?.code).toBe('interactive-assignment-required');
    const performed = transitionGame(state, { type: 'PERFORM_ASSIGNMENT_ACTIVITY_ACTION', assignmentId: NORTH_BAY_ASSIGNMENT_ID, actionId: 'brief-steward' });
    expect(performed.feedback?.code).toBe('assignment-activity-action-completed');
    expect(performed.state.actionEconomy.apRemaining).toBe(5);
    const reassigned = { ...performed.state, player: { currentCharacterId: 'person-uruk-ur-gir' as never } };
    expect(transitionGame(reassigned, { type: 'PERFORM_ASSIGNMENT_ACTIVITY_ACTION', assignmentId: NORTH_BAY_ASSIGNMENT_ID, actionId: 'consult-repairer' }).feedback?.code).toBe('assignment-activity-not-active');
  });

  it('records unsupported certification and blame as disputed claims with directional consequences', () => {
    let state = present(createInitialGameState());
    state = transitionGame(state, { type: 'ACCEPT_ASSIGNMENT', assignmentId: NORTH_BAY_ASSIGNMENT_ID }).state;
    for (const actionId of ['brief-steward','inspect-roof','consult-repairer','compare-scope']) {
      state = transitionGame(state, { type: 'PERFORM_ASSIGNMENT_ACTIVITY_ACTION', assignmentId: NORTH_BAY_ASSIGNMENT_ID, actionId }).state;
    }
    state = { ...state, actionEconomy: { ...state.actionEconomy, apRemaining: 2 } };
    const draft = { finding: 'repair_appears_sound' as const, responsibilityClaim: 'dudu' as const,
      citedDiscoveryIds: ['roof-inspection','repairer-scope','scope-comparison'], limitations: [], recommendations: [] };
    state = transitionGame(state, { type: 'UPDATE_ASSIGNMENT_ACTIVITY_DRAFT', assignmentId: NORTH_BAY_ASSIGNMENT_ID, draft }).state;
    const result = transitionGame(state, { type: 'SUBMIT_ASSIGNMENT_ACTIVITY', assignmentId: NORTH_BAY_ASSIGNMENT_ID });
    expect(result.feedback?.code).toBe('assignment-activity-submitted');
    const record = result.state.records.entries['record-assignment-north-bay-roof-inspection-day-1' as never];
    expect(record.assertions.some((assertion) => assertion.classification === 'disputed' && assertion.id === 'assertion-unsupported-certification')).toBe(true);
    expect(result.state.world.relationships['person-enlil-barni' as never]?.['person-dudu' as never]).toBeUndefined();
    expect(result.state.world.relationships['person-ur-nanna' as never]?.['person-enlil-barni' as never]?.dimensions.trust).toBe(46);
    expect(getInitializedScribal(result.state.world.people['person-enlil-barni' as never])?.professionalReputation.judgment).toBe(46);
    expect(getInitializedScribal(result.state.world.people['person-enlil-barni' as never])?.institutionalStanding['institution-uruk-temple-storehouse' as never]).toBe(48);
    expect(result.state.opportunities.assignments[NORTH_BAY_ASSIGNMENT_ID].closingReceipt?.assessment).toBe('Overreached');
    expect(result.state.opportunities.assignments[NORTH_BAY_ASSIGNMENT_ID].receiptAcknowledged).toBe(false);
    expect(result.state.world.knowledge['knowledge-assignment-north-bay-roof-inspection-day-1-person-person-dudu' as never]).toBeDefined();
    expect(result.state.world.institutions['institution-uruk-temple-storehouse' as never].activeMatters.some((matterId) => result.state.world.matters[matterId]?.summary.includes('certified without sufficient supporting inspection'))).toBe(true);
  });

  it('accepts a qualified early report, writes deterministic records/knowledge, and grants no Historical Progress XP', () => {
    let state = present(createInitialGameState());
    state = transitionGame(state, { type: 'ACCEPT_ASSIGNMENT', assignmentId: NORTH_BAY_ASSIGNMENT_ID }).state;
    state = transitionGame(state, { type: 'PERFORM_ASSIGNMENT_ACTIVITY_ACTION', assignmentId: NORTH_BAY_ASSIGNMENT_ID, actionId: 'brief-steward' }).state;
    const draft = { finding: 'insufficient_evidence' as const, responsibilityClaim: 'none' as const, citedDiscoveryIds: ['steward-briefing'],
      limitations: ['The roof and shaded beam socket were not inspected.'], recommendations: [] };
    state = transitionGame(state, { type: 'UPDATE_ASSIGNMENT_ACTIVITY_DRAFT', assignmentId: NORTH_BAY_ASSIGNMENT_ID, draft }).state;
    const result = transitionGame(state, { type: 'SUBMIT_ASSIGNMENT_ACTIVITY', assignmentId: NORTH_BAY_ASSIGNMENT_ID });
    expect(result.feedback?.code).toBe('assignment-activity-submitted');
    expect(result.state.opportunities.assignments[NORTH_BAY_ASSIGNMENT_ID].status).toBe('completed');
    expect(result.state.records.entries['record-assignment-north-bay-roof-inspection-day-1' as never]?.title).toBe('North-Bay Roof Inspection Report');
    expect(result.state.records.entries['record-assignment-north-bay-roof-inspection-day-1' as never]?.uncertaintyLimits.join(' ')).toContain('seven sealed pottery storage jars');
    expect(result.state.world.knowledge['knowledge-assignment-north-bay-roof-inspection-day-1-person-person-ur-nanna' as never]).toBeDefined();
    expect(result.state.historicalProgression.historicalXp).toBe(0);
    expect(result.state.world.institutions['institution-uruk-temple-storehouse' as never].activeMatters.some((matterId) => result.state.world.matters[matterId]?.summary.includes('inspection incomplete'))).toBe(true);
    expect(isValidSaveEnvelope(createSaveEnvelope(result.state, 2), INITIAL_WORK_CATALOG)).toBe(true);
    const restored = restoreSave(JSON.stringify(createSaveEnvelope(result.state, 2)), INITIAL_WORK_CATALOG);
    expect(restored?.state.opportunities.assignments[NORTH_BAY_ASSIGNMENT_ID].closingReceipt?.assessment).toBe('Incomplete');
    expect(transitionGame(result.state, { type: 'END_DAY', expectedDayNumber: 1 }).feedback?.code).toBe('closing-receipt-pending');
    const returned = transitionGame(result.state, { type: 'ACKNOWLEDGE_ASSIGNMENT_RECEIPT', assignmentId: NORTH_BAY_ASSIGNMENT_ID });
    expect(returned.state.opportunities.assignments[NORTH_BAY_ASSIGNMENT_ID].receiptAcknowledged).toBe(true);
    expect(transitionGame(returned.state, { type: 'END_DAY', expectedDayNumber: 1 }).feedback?.code).not.toBe('closing-receipt-pending');
  });
  it('discloses COM-01 provenance and keeps reconstructed context separate from ancient evidence', () => {
    const activity = sealedVesselTextileConsignment;
    expect(activity.provenanceDisclosureRequired).toBe(true);
    expect(activity.discoveries.map((item) => item.provenance?.classification)).toEqual(['REPORTED','PHYSICAL','COPIED','REPORTED']);
    expect(activity.discoveries.every((item) => !!item.provenance?.explanation.trim())).toBe(true);
    expect(activity.historicalContextNote).toContain('fictional teaching material');
    expect(activity.discoveries.map((item) => item.text).join(' ')).not.toMatch(/\b(?:vessels?|bundles?|measures?)\s+\d+|\d+\s+(?:vessels?|bundles?|measures?)\b/i);
    expect(validateAssignmentActivityDefinition(activity)).toEqual([]);
    const invalidRubric = { ...activity, evaluation: { ...activity.evaluation!, incompleteFindingIds: ['missing-finding'] } };
    expect(validateAssignmentActivityDefinition(invalidRubric).some((issue) => issue.includes('unknown incomplete finding'))).toBe(true);
  });

  it('preserves the legacy COM-01 activity definition for already accepted saves', () => {
    const legacy = legacySealedVesselTextileConsignment;
    expect(ASSIGNMENT_ACTIVITY_CATALOG[legacy.id]).toBe(legacy);
    expect(legacy.provenanceDisclosureRequired).toBe(true);
    expect(validateAssignmentActivityDefinition(legacy)).toEqual([]);
    const progress = legacy.createInitialProgress();
    progress.completedActionIds = ['com01-consult-receiver'];
    progress.discoveryIds = ['com01-request'];
    progress.consultedPersonIds = ['person-utu-mansum' as never];
    expect(validateAssignmentActivityProgress(legacy, progress)).toBe(true);

    const base = createInitialGameState();
    const offer = {
      ...ERA_I_ANCHOR_OPPORTUNITY_DEFINITIONS[0].offer,
      id: 'assignment-legacy-com01' as AssignmentId,
      activityId: legacy.id,
      offeredDay: 1,
      expiresDay: 4,
      status: 'accepted' as const,
      assigneePersonId: base.player.currentCharacterId,
      activityProgress: progress,
    };
    const state = { ...base, opportunities: { ...base.opportunities,
      assignments: { ...base.opportunities.assignments, [offer.id]: offer } } };
    expect(isValidSaveEnvelope(createSaveEnvelope(state, 1), INITIAL_WORK_CATALOG)).toBe(true);
  });

  it('grades COM-01 by material completeness, not by the expansiveness of the conclusion', () => {
    const activity = sealedVesselTextileConsignment;
    const complete = activity.createInitialProgress();
    complete.discoveryIds = ['com01-tag','com01-receipt','com01-handover-account'];
    complete.draft.finding = 'bounded_tag_comparison';
    complete.draft.citedDiscoveryIds = ['com01-tag','com01-receipt','com01-handover-account'];
    complete.draft.selectedLimitationIds = ['original_entry_unavailable','handover_not_witnessed','no_release_authority'];
    expect(evaluateAssignmentAssessment(activity, complete)).toBe('Thorough');
    const reclassified = { ...activity, discoveries: activity.discoveries.map((item) => ({
      ...item, provenance: { ...item.provenance!, classification: 'REPORTED' as const },
    })) };
    expect(evaluateAssignmentAssessment(reclassified, complete)).toBe('Thorough');
    expect(activity.evaluation?.reactions.Thorough).toContain('We do not yet know what happened');
    expect(activity.evaluation?.reactions.Incomplete).toContain('missing comparison or qualification');
    expect(activity.evaluation?.reactions.Overreached).toContain('We will correct that');
    expect(activity.submissionNote).toContain('does not accept or release goods');

    const secondaryOmission = {
      ...complete,
      discoveryIds: [...complete.discoveryIds],
      draft: { ...complete.draft, citedDiscoveryIds: ['com01-tag','com01-receipt'] },
    };
    expect(evaluateAssignmentAssessment(activity, secondaryOmission)).toBe('Defensible');

    const materialOmission = {
      ...complete,
      draft: { ...complete.draft, selectedLimitationIds: ['original_entry_unavailable','no_release_authority'] },
    };
    expect(evaluateAssignmentAssessment(activity, materialOmission)).toBe('Incomplete');

    const noUsableComparison = { ...complete, draft: { ...complete.draft, finding: 'comparison_not_established' } };
    expect(evaluateAssignmentAssessment(activity, noUsableComparison)).toBe('Incomplete');

    const unsupportedCertainty = { ...complete, draft: { ...complete.draft, finding: 'delivery_verified' } };
    expect(evaluateAssignmentAssessment(activity, unsupportedCertainty)).toBe('Overreached');

    const unsupportedBlame = { ...complete, draft: { ...complete.draft, responsibilityClaim: 'carrier_blame' } };
    expect(evaluateAssignmentAssessment(activity, unsupportedBlame)).toBe('Overreached');
  });

});
