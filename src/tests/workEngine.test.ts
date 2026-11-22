import { describe, expect, it } from 'vitest';
import { createInitialGameState, INITIAL_PERSON_ID } from '../state/initialState';
import { transitionGame } from '../engine/actionEconomy';
import { createSaveEnvelope, isValidSaveEnvelope } from '../state/saveEnvelope';
import type { EvidenceId, WorkId } from '../state/ids';
import type { ScribalCharacterState } from '../state/types';
import { evaluateEvidenceInterpretation } from '../works/evidenceInterpretation';
import { defineWork, validateWorkDefinition } from '../works/workDefinition';

const E1 = 'evidence-1' as EvidenceId;
const E2 = 'evidence-2' as EvidenceId;
const E3 = 'evidence-3' as EvidenceId;
const WORK = 'test-work' as WorkId;

interface ScenarioProgress extends Record<string, unknown> { accepted: boolean; recoveryCount: number; }
const definition = defineWork<ScenarioProgress>({
  id: WORK,
  title: 'Evidence Test Work',
  startingEvidence: [E1],
  evidence: [
    { id: E1, title: 'Initial account', source: 'Storehouse tablet', objectiveText: 'The source records an opening quantity.' },
    { id: E2, title: 'Later tally', source: 'Receiving official', objectiveText: 'The source records a later count.' },
    { id: E3, title: 'Unreachable record', source: 'Unknown custodian', objectiveText: 'This record is never granted.' },
  ],
  actions: [
    { id: 'retrieve-later-tally', apCost: 1, grantsEvidence: [E2] },
    { id: 'configure-register', apCost: 1, prerequisites: ['retrieve-later-tally'] },
    { id: 'auto-retrieve', apCost: 0, grantsEvidence: [E3], autoExamine: true },
  ],
  interpretationRules: [],
  historicalXpReward: 25,
  submissionApCost: 1,
  provisionsContract: { provisionsPerQualifiedWorkday: 1, minimumWorkApPerDay: 1 },
  createInitialProgress: () => ({ accepted: false, recoveryCount: 0 }),
  validateScenarioData: (value: unknown): value is ScenarioProgress =>
    typeof value === 'object' && value !== null && !Array.isArray(value)
      && typeof (value as ScenarioProgress).accepted === 'boolean'
      && Number.isInteger((value as ScenarioProgress).recoveryCount),
  evaluateSubmission: ({ progress }) => progress,
  assessSubmission: (submission) => (submission as ScenarioProgress).accepted
    ? { outcome: 'accepted', summary: 'The submission is supported.', dimensions: [{ dimension: 'accuracy', status: 'meets', summary: 'Quantities reconcile.' }] }
    : { outcome: 'revise', summary: 'Revise the submission using the available evidence.', dimensions: [{ dimension: 'accuracy', status: 'partial', summary: 'A quantity remains unresolved.' }] },
  recover: ({ progress }) => ({ ...progress, recoveryCount: progress.recoveryCount + 1 }),
});
const catalog = { [WORK]: definition };

function character(): ScribalCharacterState {
  return createInitialGameState().world.people[INITIAL_PERSON_ID].scribal!;
}

describe('evidence interpretation', () => {
  it('does not coerce missing skills or attributes to zero', () => {
    const rules = [
      { id: 'skill-min', evidenceId: E1, when: { kind: 'skillAtLeast' as const, skillId: 'analysis_research' as const, level: 1 }, text: 'skill min', category: 'inference' as const, priority: 1, displayOrder: 1 },
      { id: 'skill-max', evidenceId: E1, when: { kind: 'skillAtMost' as const, skillId: 'analysis_research' as const, level: 10 }, text: 'skill max', category: 'inference' as const, priority: 1, displayOrder: 2 },
      { id: 'attribute-min', evidenceId: E1, when: { kind: 'attributeAtLeast' as const, attributeId: 'reasoning' as const, value: 1 }, text: 'attribute min', category: 'inference' as const, priority: 1, displayOrder: 3 },
      { id: 'attribute-max', evidenceId: E1, when: { kind: 'attributeAtMost' as const, attributeId: 'reasoning' as const, value: 10 }, text: 'attribute max', category: 'inference' as const, priority: 1, displayOrder: 4 },
    ];
    expect(evaluateEvidenceInterpretation({ evidenceId: E1, character: character(), examinedEvidence: [], rules })).toEqual([]);
  });

  it('re-evaluates cross-evidence rules and returns only display annotations', () => {
    const rules = [
      { id: 'base', evidenceId: E1, when: { kind: 'all' as const, predicates: [{ kind: 'examinedAll' as const, evidenceIds: [E2] }] }, text: 'Compare the later tally.', category: 'professional_reminder' as const, priority: 1, displayOrder: 2 },
      { id: 'high', evidenceId: E1, when: { kind: 'all' as const, predicates: [{ kind: 'examinedAll' as const, evidenceIds: [E2] }] }, text: 'A stronger interpretation.', category: 'inference' as const, priority: 5, conflictGroup: 'reading', displayOrder: 1 },
      { id: 'low', evidenceId: E1, when: { kind: 'all' as const, predicates: [{ kind: 'examinedAll' as const, evidenceIds: [E2] }] }, text: 'A weaker interpretation.', category: 'misinterpretation' as const, priority: 2, conflictGroup: 'reading', displayOrder: 0 },
      { id: 'display-z', evidenceId: E1, when: { kind: 'all' as const, predicates: [{ kind: 'examinedAll' as const, evidenceIds: [E2] }] }, text: 'Lower priority.', category: 'observation' as const, priority: 1, displayOrder: 1 },
      { id: 'display-a', evidenceId: E1, when: { kind: 'all' as const, predicates: [{ kind: 'examinedAll' as const, evidenceIds: [E2] }] }, text: 'Higher priority.', category: 'observation' as const, priority: 4, displayOrder: 1 },
      { id: 'tie-z', evidenceId: E1, when: { kind: 'all' as const, predicates: [{ kind: 'examinedAll' as const, evidenceIds: [E2] }] }, text: 'Tie z.', category: 'inference' as const, priority: 3, conflictGroup: 'tie', displayOrder: 3 },
      { id: 'tie-a', evidenceId: E1, when: { kind: 'all' as const, predicates: [{ kind: 'examinedAll' as const, evidenceIds: [E2] }] }, text: 'Tie a.', category: 'inference' as const, priority: 3, conflictGroup: 'tie', displayOrder: 3 },
    ];
    expect(evaluateEvidenceInterpretation({ evidenceId: E1, character: character(), examinedEvidence: [], rules })).toEqual([]);
    const result = evaluateEvidenceInterpretation({ evidenceId: E1, character: character(), examinedEvidence: [E1, E2], rules });
    expect(result.map((item) => item.id)).toEqual(['high', 'display-a', 'display-z', 'base', 'tie-a']);
    expect(result[0]).not.toHaveProperty('category');
    expect(result[0]).not.toHaveProperty('conflictGroup');
  });
});

describe('typed Work definitions and validation', () => {
  it('accepts reachable evidence and rejects equal-priority conflict ties', () => {
    expect(validateWorkDefinition(definition)).toEqual([]);
    const invalid = defineWork<ScenarioProgress>({
      ...definition,
      interpretationRules: [
        { id: 'one', evidenceId: E2, when: { kind: 'examinedNone', evidenceIds: [E1] }, text: 'First', category: 'inference', priority: 3, conflictGroup: 'x', displayOrder: 1 },
        { id: 'two', evidenceId: E2, when: { kind: 'examinedAll', evidenceIds: [E1] }, text: 'Second', category: 'inference', priority: 3, conflictGroup: 'x', displayOrder: 2 },
      ],
    });
    expect(validateWorkDefinition(invalid).some((issue) => issue.code === 'conflict-priority-tie')).toBe(true);
  });

  it('rejects unknown and unreachable evidence references, empty groups, and bad thresholds', () => {
    const invalid = defineWork<ScenarioProgress>({
      ...definition,
      startingEvidence: [E1],
      actions: [{ id: 'blocked', apCost: 1, prerequisites: ['missing-action'], grantsEvidence: [E2] }],
      interpretationRules: [{
        id: 'bad', evidenceId: 'missing' as EvidenceId, text: ' ',
        category: 'observation', priority: 1, displayOrder: 0,
        when: { kind: 'all', predicates: [
          { kind: 'any', predicates: [] },
          { kind: 'skillAtLeast', skillId: 'unknown' as never, level: 11 },
          { kind: 'attributeAtMost', attributeId: 'unknown' as never, value: Number.NaN },
          { kind: 'examinedAll', evidenceIds: [E3] },
        ] },
      },
      { id: 'bad', evidenceId: E3, text: 'Second duplicate rule', category: 'observation', priority: 2, displayOrder: 1,
        when: { kind: 'examinedNone', evidenceIds: [E3] } },
      ],
    });
    const codes = validateWorkDefinition(invalid).map((issue) => issue.code);
    expect(codes).toContain('unknown-action-prerequisite');
    expect(codes).toContain('unreachable-action');
    expect(codes).toContain('unknown-rule-evidence');
    expect(codes).toContain('unreachable-rule-evidence');
    expect(codes).toContain('duplicate-rule-id');
    expect(codes).toContain('unreachable-predicate-evidence');
    expect(codes).toContain('empty-rule-text');
    expect(codes).toContain('empty-predicate-group');
    expect(codes).toContain('unknown-skill');
    expect(codes).toContain('invalid-skill-threshold');
    expect(codes).toContain('unknown-attribute');
    expect(codes).toContain('invalid-attribute-threshold');
  });
});

describe('Work lifecycle and save validation', () => {
  it('acquires evidence for AP, examines it for free, and allows free re-examination', () => {
    let state = createInitialGameState();
    state = transitionGame(state, { type: 'START_WORK', workId: WORK }, undefined, catalog).state;
    expect(state.works.progress[WORK].acquiredEvidence).toEqual([E1]);
    state = transitionGame(state, { type: 'ACQUIRE_WORK_EVIDENCE', workId: WORK, actionId: 'retrieve-later-tally' }, undefined, catalog).state;
    expect(state.actionEconomy.apRemaining).toBe(5);
    expect(state.works.progress[WORK].acquiredEvidence).toContain(E2);
    state = transitionGame(state, { type: 'EXAMINE_WORK_EVIDENCE', workId: WORK, evidenceId: E2 }, undefined, catalog).state;
    expect(state.works.progress[WORK].examinedEvidence).toContain(E2);
    const reRead = transitionGame(state, { type: 'EXAMINE_WORK_EVIDENCE', workId: WORK, evidenceId: E2 }, undefined, catalog);
    expect(reRead.state).toBe(state);
    expect(reRead.state.actionEconomy.apRemaining).toBe(5);
  });

  it('supports optional auto-examination when an action acquires evidence', () => {
    let state = transitionGame(createInitialGameState(), { type: 'START_WORK', workId: WORK }, undefined, catalog).state;
    state = transitionGame(state, { type: 'COMPLETE_WORK_ACTION', workId: WORK, actionId: 'auto-retrieve' }, undefined, catalog).state;
    expect(state.works.progress[WORK].acquiredEvidence).toContain(E3);
    expect(state.works.progress[WORK].examinedEvidence).toContain(E3);
    expect(state.actionEconomy.apRemaining).toBe(6);
  });

  it('resolves non-evidence Work actions atomically with validated scenario data', () => {
    let state = transitionGame(createInitialGameState(), { type: 'START_WORK', workId: WORK }, undefined, catalog).state;
    state = transitionGame(state, { type: 'ACQUIRE_WORK_EVIDENCE', workId: WORK, actionId: 'retrieve-later-tally' }, undefined, catalog).state;
    const failed = transitionGame(state, { type: 'COMPLETE_WORK_ACTION', workId: WORK, actionId: 'configure-register',
      scenarioData: { accepted: 'yes', recoveryCount: 0 } }, undefined, catalog);
    expect(failed.state).toBe(state);
    expect(failed.state.actionEconomy.apRemaining).toBe(5);
    state = transitionGame(state, { type: 'COMPLETE_WORK_ACTION', workId: WORK, actionId: 'configure-register',
      scenarioData: { accepted: true, recoveryCount: 0 } }, undefined, catalog).state;
    expect(state.actionEconomy.apRemaining).toBe(4);
    expect(state.works.progress[WORK].completedActionIds).toEqual(['retrieve-later-tally', 'configure-register']);
    expect(state.works.progress[WORK].scenarioData.accepted).toBe(true);
  });

  it('keeps failed submissions recoverable and grants Historical XP exactly once on completion', () => {
    let state = transitionGame(createInitialGameState(), { type: 'START_WORK', workId: WORK }, undefined, catalog).state;
    state = transitionGame(state, { type: 'SUBMIT_WORK', workId: WORK }, undefined, catalog).state;
    expect(state.works.progress[WORK].status).toBe('active');
    expect(state.works.progress[WORK].scenarioData.recoveryCount).toBe(1);
    state = transitionGame(state, { type: 'SET_WORK_SCENARIO_DATA', workId: WORK, scenarioData: { accepted: true, recoveryCount: 1 } }, undefined, catalog).state;
    state = transitionGame(state, { type: 'SUBMIT_WORK', workId: WORK }, undefined, catalog).state;
    expect(state.historicalProgression.historicalXp).toBe(25);
    expect(state.historicalProgression.completedWorks).toEqual([WORK]);
    expect(state.works.progress[WORK].rewardGranted).toBe(true);
    expect(state.works.activeWorkId).toBeNull();
    expect(isValidSaveEnvelope(createSaveEnvelope(state, 2), catalog)).toBe(true);
  });

  it('counts only Work-identified AP toward the daily Work contract and resets it at settlement', () => {
    let state = transitionGame(createInitialGameState(), { type: 'START_WORK', workId: WORK }, undefined, catalog).state;
    state = transitionGame(state, { type: 'SPEND_AP', amount: 1, reason: 'Work action' }).state;
    expect(state.works.progress[WORK].workApSpentToday).toBe(0);
    state = transitionGame(state, { type: 'SPEND_AP', amount: 1, reason: 'Work action', workId: WORK }).state;
    expect(state.works.progress[WORK].workApSpentToday).toBe(1);
    state = transitionGame(state, { type: 'END_DAY', expectedDayNumber: 1 }).state;
    expect(state.works.progress[WORK].workApSpentToday).toBe(0);
    expect(state.world.people[INITIAL_PERSON_ID].scribal?.wallet.provisions).toBe(5);
  });

  it('validates structured Work progress while accepting legacy v2 saves with an empty progress map', () => {
    const state = createInitialGameState();
    const envelope = createSaveEnvelope(state, 0, '2026-11-22T12:00:00.000Z');
    expect(isValidSaveEnvelope(envelope)).toBe(true);
    const active = transitionGame(state, { type: 'START_WORK', workId: WORK }, undefined, catalog).state;
    expect(isValidSaveEnvelope(createSaveEnvelope(active, 1), catalog)).toBe(true);
    expect(isValidSaveEnvelope(createSaveEnvelope(active, 1))).toBe(false);
    const invalidScenario = structuredClone(createSaveEnvelope(active, 1));
    invalidScenario.state.works.progress[WORK].scenarioData = { accepted: 'yes', recoveryCount: 0 };
    expect(isValidSaveEnvelope(invalidScenario, catalog)).toBe(false);
    const invalid = structuredClone(envelope);
    invalid.state.works.progress[WORK] = {
      status: 'active', acquiredEvidence: [E1], examinedEvidence: [E2], workApSpentToday: 0,
      rewardGranted: false, completedActionIds: [], scenarioData: {}, submissionCount: 0,
    };
    expect(isValidSaveEnvelope(invalid)).toBe(false);
  });
});
