import { describe, expect, it } from 'vitest';
import { transitionGame } from '../engine/actionEconomy';
import { createInitialGameState } from '../state/initialState';
import { createSaveEnvelope, isValidSaveEnvelope, restoreSave } from '../state/saveEnvelope';
import { INITIAL_WORK_CATALOG } from '../state/newGameState';
import type { AssignmentOffer, GameState } from '../state/types';
import type { AssignmentId } from '../state/ids';
import { NORTH_BAY_ACTIVITY_ID, NORTH_BAY_ASSIGNMENT_ID, northBayRoofInspection, validateAssignmentActivityDefinition } from '../content/assignments/northBayRoofInspection';

const baseline = { kind: 'baseline_reach' as const, explanation: 'The Senior Scribe directed the inspection after reviewing the prior record.' };
function roofOffer(): Omit<AssignmentOffer, 'offeredDay' | 'expiresDay' | 'status' | 'lapsedDuringMandatoryWork'> {
  return {
    id: NORTH_BAY_ASSIGNMENT_ID, activityId: NORTH_BAY_ACTIVITY_ID, estimatedTotalAp: 7,
    title: 'North-Bay Roof Inspection', description: 'Inspect the repaired roof and report remaining storage risks.',
    employer: { kind: 'institution', id: 'institution-uruk-temple-storehouse' as never },
    category: 'building_inspection', commodity: 'barley',
    context: { what: 'Inspect the north-bay repair.', who: ['Ur-Nanna','Dudu','Enlil-barni'],
      quantity: 'One roof section and seven segregated sacks.', when: 'After the storm repair.',
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

  it('rejects duplicate IDs, out-of-range AP, and circular action prerequisites', () => {
    const duplicate = { ...northBayRoofInspection, actions: [...northBayRoofInspection.actions, { ...northBayRoofInspection.actions[0] }] };
    expect(validateAssignmentActivityDefinition(duplicate).some((issue) => issue.includes('unique'))).toBe(true);
    const excessive = { ...northBayRoofInspection, actions: northBayRoofInspection.actions.map((action, index) => index === 0 ? { ...action, apCost: 7 } : action) };
    expect(validateAssignmentActivityDefinition(excessive).some((issue) => issue.includes('AP'))).toBe(true);
    const circular = { ...northBayRoofInspection, actions: northBayRoofInspection.actions.map((action) =>
      action.id === 'brief-steward' ? { ...action, prerequisites: ['compare-scope'] } : action) };
    expect(validateAssignmentActivityDefinition(circular).some((issue) => issue.includes('unreachable'))).toBe(true);
  });

  it('keeps legacy v2 saves loadable by normalizing Dudu, the storehouse location, and initial appointments', () => {
    const state = createInitialGameState();
    const world = { ...state.world, people: { ...state.world.people }, locations: {}, appointments: {},
      institutions: { ...state.world.institutions, ['institution-uruk-temple-storehouse' as never]: {
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
    expect(result.state.world.knowledge['knowledge-assignment-north-bay-roof-inspection-day-1-person-person-ur-nanna' as never]).toBeDefined();
    expect(result.state.historicalProgression.historicalXp).toBe(0);
    expect(result.state.world.institutions['institution-uruk-temple-storehouse' as never].activeMatters.some((matter) => matter.includes('inspection incomplete'))).toBe(true);
    expect(isValidSaveEnvelope(createSaveEnvelope(result.state, 2), INITIAL_WORK_CATALOG)).toBe(true);
  });
});
