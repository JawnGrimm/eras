import { describe, expect, it } from 'vitest';
import { transitionGame } from '../engine/actionEconomy';
import { createInitialGameState, INITIAL_PERSON_ID } from '../state/initialState';
import { createSaveEnvelope, isValidSaveEnvelope, restoreSave } from '../state/saveEnvelope';
import { validateWorkDefinition } from '../works/workDefinition';
import type { GameState } from '../state/types';
import {
  STOREHOUSE_EVIDENCE, STOREHOUSE_WORK_ID, STOREHOUSE_PROVISIONAL_CAREER_XP,
  STOREHOUSE_PROVISIONAL_HISTORICAL_XP, STOREHOUSE_LEGACY_HISTORICAL_XP, STOREHOUSE_INSTITUTION_ID, createStorehouseScenario, interpretStorehouseEvidence,
  storehouseAccountingPass, storehouseReckoning, validateStorehouseScenario,
} from '../works/storehouseReckoning';

const catalog = { [STOREHOUSE_WORK_ID]: storehouseReckoning };
const start = (state = createInitialGameState()) =>
  transitionGame(state, { type: 'START_WORK', workId: STOREHOUSE_WORK_ID }, undefined, catalog).state;

function acquireMinimum(state: GameState): GameState {
  let next = state;
  for (const actionId of ['accounts','intake_issue','recount']) {
    next = transitionGame(next, { type: 'ACQUIRE_WORK_EVIDENCE', workId: STOREHOUSE_WORK_ID, actionId }, undefined, catalog).state;
  }
  return next;
}
function validDraft() {
  return {
    draft: { opening: 24, dispatched: 60, received: 60, intakeUsable: 56, intakeHeld: 4, issued: 30, closingUsable: 47, closingHeld: 7 },
    finding: 'status_change_cause_unestablished' as const,
    citations: ['ev-01','ev-02','ev-03','ev-04','ev-05','ev-07'] as const,
    recommendations: ['maintain_segregation'] as const,
  };
}
function submitValid(state: GameState): GameState {
  const scenarioData = validDraft();
  state = transitionGame(state, { type: 'SET_WORK_SCENARIO_DATA', workId: STOREHOUSE_WORK_ID, scenarioData }, undefined, catalog).state;
  return transitionGame(state, { type: 'SUBMIT_WORK', workId: STOREHOUSE_WORK_ID }, undefined, catalog).state;
}
function nextDay(state: GameState): GameState {
  return transitionGame(state, { type: 'END_DAY', expectedDayNumber: state.calendar.dayNumber }, undefined, catalog).state;
}

describe('Storehouse Reckoning introductory tutorial', () => {
  it('passes static Work validation and declares the revised evidence/AP path', () => {
    expect(validateWorkDefinition(storehouseReckoning)).toEqual([]);
    expect(storehouseReckoning.kind).toBe('tutorial');
    expect(storehouseReckoning.historicalXpReward).toBe(0);
    expect(storehouseReckoning.evidence.map((item) => item.id)).toEqual(STOREHOUSE_EVIDENCE.map((item) => item.id));
    expect(storehouseReckoning.actions.map((item) => [item.id, item.apCost])).toEqual([
      ['accounts',1], ['intake_issue',1], ['recount',2], ['custody',1],
    ]);
    expect(storehouseReckoning.initialSubmissionApCost).toBe(2);
    expect(storehouseReckoning.revisionSubmissionApCost).toBe(1);
    expect(storehouseReckoning.dispositionApCost).toBe(1);
    expect(storehouseReckoning.historicalXpReward).toBe(STOREHOUSE_PROVISIONAL_HISTORICAL_XP);
  });

  it('allows the minimum path and keeps custody evidence optional', () => {
    let state = acquireMinimum(start());
    expect(state.actionEconomy.apRemaining).toBe(2);
    expect(state.works.progress[STOREHOUSE_WORK_ID].examinedEvidence).toEqual(['ev-01','ev-02','ev-03','ev-04','ev-05','ev-07']);
    expect(state.works.progress[STOREHOUSE_WORK_ID].examinedEvidence).not.toContain('ev-06');
    state = submitValid(state);
    expect(state.works.progress[STOREHOUSE_WORK_ID].pendingDisposition).toBe(true);
    expect(state.works.progress[STOREHOUSE_WORK_ID].status).toBe('active');
    expect(state.works.progress[STOREHOUSE_WORK_ID].provisionContract).toBeUndefined();
    expect(state.historicalProgression.historicalXp).toBe(0);
    expect(state.world.people[INITIAL_PERSON_ID].scribal!.careerXp).toBe(150);
    expect(state.actionEconomy.apRemaining).toBe(0);
  });

  it('acquires E-06 for one additional AP only when the player requests the custody record', () => {
    const state = acquireMinimum(start());
    const result = transitionGame(state, { type: 'ACQUIRE_WORK_EVIDENCE', workId: STOREHOUSE_WORK_ID, actionId: 'custody' }, undefined, catalog);
    expect(result.state.actionEconomy.apRemaining).toBe(1);
    expect(result.state.works.progress[STOREHOUSE_WORK_ID].examinedEvidence).toContain('ev-06');
  });

  it('separates objective evidence from character-situated interpretation', () => {
    const initial = createInitialGameState();
    const novice = initial.world.people[INITIAL_PERSON_ID].scribal!;
    const noviceCharacter = { ...novice, skills: { recordkeeping_accounts: { level: 1, skillXp: 0 } } };
    const expertCharacter = { ...novice, skills: { recordkeeping_accounts: { level: 4, skillXp: 0 } } };
    const before = STOREHOUSE_EVIDENCE.find((item) => item.id === 'ev-07')!.objectiveText;
    const low = interpretStorehouseEvidence('ev-07' as never, noviceCharacter, ['ev-07' as never]);
    const high = interpretStorehouseEvidence('ev-07' as never, expertCharacter, ['ev-07' as never]);
    expect(low.some((item) => item.text.includes('missing stock'))).toBe(true);
    expect(high.some((item) => item.text.includes('combined physical total'))).toBe(true);
    expect(STOREHOUSE_EVIDENCE.find((item) => item.id === 'ev-07')!.objectiveText).toBe(before);
  });

  it('gives a novice a bounded uncertainty reading without changing the evidence', () => {
    const base = createInitialGameState().world.people[INITIAL_PERSON_ID].scribal!;
    const novice = { ...base, skills: { recordkeeping_accounts: { level: 1, skillXp: 0 } } };
    const notes = interpretStorehouseEvidence('ev-07' as never, novice, ['ev-04','ev-07'] as never[]);
    expect(notes.some((item) => item.text.includes('do not tell you when'))).toBe(true);
    expect(STOREHOUSE_EVIDENCE.find((item) => item.id === 'ev-07')!.objectiveText).toContain('47 measures still usable and 7 damp and held');
  });

  it('requires both E-04 and E-07 for the skilled cross-evidence condition inference', () => {
    const base = createInitialGameState().world.people[INITIAL_PERSON_ID].scribal!;
    const character = { ...base, skills: { recordkeeping_accounts: { level: 3, skillXp: 0 } } };
    const alone = interpretStorehouseEvidence('ev-04' as never, character, ['ev-04' as never]);
    const together = interpretStorehouseEvidence('ev-04' as never, character, ['ev-04','ev-07'] as never[]);
    expect(alone.some((item) => item.text.includes('three measures moved'))).toBe(false);
    expect(together.some((item) => item.text.includes('three measures moved'))).toBe(true);
  });

  it('treats arithmetic errors as assessable data, not structural save corruption', () => {
    const inaccurate = { ...validDraft(), draft: { ...validDraft().draft, received: 59 } };
    expect(validateStorehouseScenario(inaccurate)).toBe(true);
    expect(storehouseAccountingPass(inaccurate.draft)).toBe(false);
    expect(validateStorehouseScenario({ ...inaccurate, draft: { ...inaccurate.draft, received: -1 } })).toBe(false);
    expect(validateStorehouseScenario({ ...inaccurate, draft: { ...inaccurate.draft, received: Number.NaN } })).toBe(false);
    expect(validateStorehouseScenario({ ...inaccurate, draft: { ...inaccurate.draft, received: Number.POSITIVE_INFINITY } })).toBe(false);
    expect(validateStorehouseScenario({ ...inaccurate, finding: 'roof_is_certain' })).toBe(false);
    expect(validateStorehouseScenario({ ...inaccurate, citations: ['ev-99'] })).toBe(false);
  });

  it('requires all mandatory evidence citations to be both examined and cited', () => {
    let state = acquireMinimum(start());
    const incomplete = { ...validDraft(), citations: ['ev-01','ev-02','ev-03','ev-04','ev-05'] as const };
    state = transitionGame(state, { type: 'SET_WORK_SCENARIO_DATA', workId: STOREHOUSE_WORK_ID, scenarioData: incomplete }, undefined, catalog).state;
    state = transitionGame(state, { type: 'SUBMIT_WORK', workId: STOREHOUSE_WORK_ID }, undefined, catalog).state;
    expect(state.works.progress[STOREHOUSE_WORK_ID].lastAssessment?.outcome).toBe('revise');
  });

  it('does not permit a roof finding or roof recommendation without examined and cited E-06', () => {
    let state = acquireMinimum(start());
    const roof = { ...validDraft(), finding: 'roof_leak_reported_unproven' as const, recommendations: ['verify_roof_repair'] as const };
    state = transitionGame(state, { type: 'SET_WORK_SCENARIO_DATA', workId: STOREHOUSE_WORK_ID, scenarioData: roof }, undefined, catalog).state;
    state = transitionGame(state, { type: 'SUBMIT_WORK', workId: STOREHOUSE_WORK_ID }, undefined, catalog).state;
    expect(state.works.progress[STOREHOUSE_WORK_ID].lastAssessment?.outcome).toBe('revise');
  });

  it('allows direct 1-AP revision from a failed assessment without a returned disposition', () => {
    let state = acquireMinimum(start());
    const bad = { ...validDraft(), draft: { ...validDraft().draft, closingHeld: 6 } };
    state = transitionGame(state, { type: 'SET_WORK_SCENARIO_DATA', workId: STOREHOUSE_WORK_ID, scenarioData: bad }, undefined, catalog).state;
    state = transitionGame(state, { type: 'SUBMIT_WORK', workId: STOREHOUSE_WORK_ID }, undefined, catalog).state;
    expect(state.works.progress[STOREHOUSE_WORK_ID].lastAssessment?.outcome).toBe('revise');
    expect(state.actionEconomy.apRemaining).toBe(0);
    state = nextDay(state);
    state = transitionGame(state, { type: 'SET_WORK_SCENARIO_DATA', workId: STOREHOUSE_WORK_ID, scenarioData: validDraft() }, undefined, catalog).state;
    expect(state.works.progress[STOREHOUSE_WORK_ID].lastAssessment).toBeUndefined();
    expect(state.works.progress[STOREHOUSE_WORK_ID].pendingDisposition).toBe(false);
    state = transitionGame(state, { type: 'SUBMIT_WORK', workId: STOREHOUSE_WORK_ID }, undefined, catalog).state;
    expect(state.actionEconomy.apRemaining).toBe(5);
    expect(state.works.progress[STOREHOUSE_WORK_ID].submissionCount).toBe(2);
    expect(state.works.progress[STOREHOUSE_WORK_ID].lastAssessment?.outcome).toBe('accepted');
  });

  it('allows the Senior Scribe to return a failed assessment, but does not require that step', () => {
    let state = acquireMinimum(start());
    const bad = { ...validDraft(), draft: { ...validDraft().draft, received: 58 } };
    state = transitionGame(state, { type: 'SET_WORK_SCENARIO_DATA', workId: STOREHOUSE_WORK_ID, scenarioData: bad }, undefined, catalog).state;
    state = transitionGame(state, { type: 'SUBMIT_WORK', workId: STOREHOUSE_WORK_ID }, undefined, catalog).state;
    state = nextDay(state);
    state = transitionGame(state, { type: 'DISPOSE_WORK', workId: STOREHOUSE_WORK_ID, disposition: 'returned' }, undefined, catalog).state;
    expect(state.actionEconomy.apRemaining).toBe(5);
    expect(state.works.progress[STOREHOUSE_WORK_ID].pendingDisposition).toBe(false);
    state = transitionGame(state, { type: 'SET_WORK_SCENARIO_DATA', workId: STOREHOUSE_WORK_ID, scenarioData: validDraft() }, undefined, catalog).state;
    state = transitionGame(state, { type: 'SUBMIT_WORK', workId: STOREHOUSE_WORK_ID }, undefined, catalog).state;
    expect(state.works.progress[STOREHOUSE_WORK_ID].submissionCount).toBe(2);
  });

  it('invalidates an accepted assessment when the draft is edited, preventing stale disposition', () => {
    let state = submitValid(acquireMinimum(start()));
    expect(state.works.progress[STOREHOUSE_WORK_ID].pendingDisposition).toBe(true);
    state = transitionGame(state, { type: 'SET_WORK_SCENARIO_DATA', workId: STOREHOUSE_WORK_ID, scenarioData: {
      ...validDraft(), recommendations: ['assign_blame'],
    } }, undefined, catalog).state;
    expect(state.works.progress[STOREHOUSE_WORK_ID].lastAssessment).toBeUndefined();
    expect(state.works.progress[STOREHOUSE_WORK_ID].pendingDisposition).toBe(false);
    const blocked = transitionGame(state, { type: 'DISPOSE_WORK', workId: STOREHOUSE_WORK_ID, disposition: 'authorized' }, undefined, catalog);
    expect(blocked.state).toBe(state);
  });

  it('allows direct revision after a failed judgment dimension without first spending disposition AP', () => {
    let state = acquireMinimum(start());
    state = transitionGame(state, { type: 'SET_WORK_SCENARIO_DATA', workId: STOREHOUSE_WORK_ID,
      scenarioData: { ...validDraft(), recommendations: ['assign_blame'] } }, undefined, catalog).state;
    state = transitionGame(state, { type: 'SUBMIT_WORK', workId: STOREHOUSE_WORK_ID }, undefined, catalog).state;
    expect(state.works.progress[STOREHOUSE_WORK_ID].lastAssessment?.dimensions.find((item) => item.dimension === 'responsibility')?.status).toBe('fails');
    state = nextDay(state);
    state = transitionGame(state, { type: 'SET_WORK_SCENARIO_DATA', workId: STOREHOUSE_WORK_ID, scenarioData: validDraft() }, undefined, catalog).state;
    state = transitionGame(state, { type: 'SUBMIT_WORK', workId: STOREHOUSE_WORK_ID }, undefined, catalog).state;
    expect(state.works.progress[STOREHOUSE_WORK_ID].submissionCount).toBe(2);
    expect(state.actionEconomy.apRemaining).toBe(5);
  });

  it('rolls back the entire disposition if durable record creation fails', () => {
    const brokenDefinition = {
      ...storehouseReckoning,
      finalizeDisposition: (
        context: Parameters<NonNullable<typeof storehouseReckoning.finalizeDisposition>>[0],
        disposition: string,
      ) => {
        const result = storehouseReckoning.finalizeDisposition!(context, disposition);
        return { ...result, record: { ...result.record!, authorPersonId: 'missing-person' as never } };
      },
    };
    const brokenCatalog = { [STOREHOUSE_WORK_ID]: brokenDefinition };
    let state = acquireMinimum(start());
    state = submitValid(state);
    state = nextDay(state);
    const before = state;
    const failed = transitionGame(state, { type: 'DISPOSE_WORK', workId: STOREHOUSE_WORK_ID, disposition: 'authorized' }, undefined, brokenCatalog);
    expect(failed.state).toBe(before);
    expect(failed.state.actionEconomy.apRemaining).toBe(before.actionEconomy.apRemaining);
    expect(failed.state.world.people[INITIAL_PERSON_ID].scribal!.careerXp).toBe(before.world.people[INITIAL_PERSON_ID].scribal!.careerXp);
    expect(failed.state.historicalProgression.historicalXp).toBe(0);
    expect(failed.state.records.entries).toEqual({});
    expect(failed.state.world.knowledge).toEqual({});
  });

  it('prevents authorization when the recommendation dimension failed but permits account acceptance', () => {
    let state = acquireMinimum(start());
    const unsupported = { ...validDraft(), recommendations: ['assign_blame'] as const };
    state = transitionGame(state, { type: 'SET_WORK_SCENARIO_DATA', workId: STOREHOUSE_WORK_ID, scenarioData: unsupported }, undefined, catalog).state;
    state = transitionGame(state, { type: 'SUBMIT_WORK', workId: STOREHOUSE_WORK_ID }, undefined, catalog).state;
    expect(state.works.progress[STOREHOUSE_WORK_ID].lastAssessment?.outcome).toBe('accepted');
    state = nextDay(state);
    const denied = transitionGame(state, { type: 'DISPOSE_WORK', workId: STOREHOUSE_WORK_ID, disposition: 'authorized' }, undefined, catalog);
    expect(denied.state).toBe(state);
    state = transitionGame(state, { type: 'DISPOSE_WORK', workId: STOREHOUSE_WORK_ID, disposition: 'account_accepted' }, undefined, catalog).state;
    expect(state.works.progress[STOREHOUSE_WORK_ID].status).toBe('completed');
  });

  it.each(['account_accepted','authorized'] as const)('finalizes %s with distinct recorded disposition and provisional rewards', (disposition) => {
    let state = submitValid(acquireMinimum(start()));
    state = nextDay(state);
    const beforeCareer = state.world.people[INITIAL_PERSON_ID].scribal!.careerXp;
    state = transitionGame(state, { type: 'DISPOSE_WORK', workId: STOREHOUSE_WORK_ID, disposition }, undefined, catalog).state;
    expect(state.works.activeWorkId).toBeNull();
    expect(state.works.progress[STOREHOUSE_WORK_ID].status).toBe('completed');
    expect(state.works.progress[STOREHOUSE_WORK_ID].rewardGranted).toBe(true);
    expect(state.works.progress[STOREHOUSE_WORK_ID].finalDisposition).toBe(disposition);
    expect(state.historicalProgression.historicalXp).toBe(0);
    expect(state.historicalProgression.completedWorks).not.toContain(STOREHOUSE_WORK_ID);
    expect(state.world.institutions[STOREHOUSE_INSTITUTION_ID].activeMatters).toEqual([]);
    expect(state.world.people[INITIAL_PERSON_ID].scribal!.careerXp - beforeCareer).toBe(STOREHOUSE_PROVISIONAL_CAREER_XP);
    const record = Object.values(state.records.entries)[0];
    expect(record.assertions.some((item) => item.text.includes(disposition))).toBe(true);
    expect(record.sources.some((item) => item.id === 'ev-06')).toBe(false);
    expect(state.actionEconomy.apRemaining).toBe(5);
    expect(Object.values(state.world.knowledge).some((item) => item.holder.kind === 'person' && item.holder.id === 'person-shuruppak-ilu')).toBe(true);
    expect(isValidSaveEnvelope(createSaveEnvelope(state, 2), catalog)).toBe(true);
  });

  it('includes E-06 in the durable record only when it was examined and cited', () => {
    let state = acquireMinimum(start());
    state = transitionGame(state, { type: 'ACQUIRE_WORK_EVIDENCE', workId: STOREHOUSE_WORK_ID, actionId: 'custody' }, undefined, catalog).state;
    const scenario = { ...validDraft(), finding: 'roof_leak_reported_unproven' as const,
      citations: [...validDraft().citations, 'ev-06'] as const, recommendations: ['verify_roof_repair'] as const };
    state = transitionGame(state, { type: 'SET_WORK_SCENARIO_DATA', workId: STOREHOUSE_WORK_ID, scenarioData: scenario }, undefined, catalog).state;
    state = nextDay(state);
    state = transitionGame(state, { type: 'SUBMIT_WORK', workId: STOREHOUSE_WORK_ID }, undefined, catalog).state;
    state = nextDay(state);
    state = transitionGame(state, { type: 'DISPOSE_WORK', workId: STOREHOUSE_WORK_ID, disposition: 'authorized' }, undefined, catalog).state;
    expect(Object.values(state.records.entries)[0].sources.some((item) => item.id === 'ev-06')).toBe(true);
  });

  it('never grants tutorial provisions and consumes only the character’s existing stock', () => {
    let state = acquireMinimum(start());
    expect(state.works.progress[STOREHOUSE_WORK_ID].provisionContract).toBeUndefined();
    state = submitValid(state);
    state = nextDay(state);
    state = transitionGame(state, { type: 'DISPOSE_WORK', workId: STOREHOUSE_WORK_ID, disposition: 'authorized' }, undefined, catalog).state;
    state = nextDay(state);
    expect(state.world.people[INITIAL_PERSON_ID].scribal!.wallet.provisions).toBe(3);
  });

  it('normalizes completed tutorial progression in existing v2 saves without invalidating the save', () => {
    let state = submitValid(acquireMinimum(start()));
    state = nextDay(state);
    state = transitionGame(state, { type: 'DISPOSE_WORK', workId: STOREHOUSE_WORK_ID, disposition: 'authorized' }, undefined, catalog).state;
    const legacyState: GameState = {
      ...state,
      calendar: { ...state.calendar, dayNumber: 47, displayDate: 'Day 1, Early Season of Inundation (c. 3200 BCE)' },
      historicalProgression: {
        historicalXp: STOREHOUSE_LEGACY_HISTORICAL_XP,
        completedWorks: [STOREHOUSE_WORK_ID],
      },
      world: { ...state.world, institutions: {
        ...state.world.institutions,
        [STOREHOUSE_INSTITUTION_ID]: {
          ...state.world.institutions[STOREHOUSE_INSTITUTION_ID],
          activeMatters: ['The Storehouse Reckoning'] as unknown as import('../state/ids').MatterId[],
        },
      } },
    };
    const legacyEnvelope = createSaveEnvelope(legacyState, 7, '2026-11-22T12:00:00.000Z');
    const restored = restoreSave(JSON.stringify(legacyEnvelope), catalog);
    expect(restored).not.toBeNull();
    expect(restored?.schemaVersion).toBe(2);
    expect(restored?.state.historicalProgression.historicalXp).toBe(0);
    expect(restored?.state.historicalProgression.completedWorks).toEqual([]);
    expect(restored?.state.calendar.displayDate).toBe('Day 47 · Uruk (c. 3200 BCE)');
    expect(restored?.state.works.progress[STOREHOUSE_WORK_ID].status).toBe('completed');
    expect(restored?.state.world.institutions[STOREHOUSE_INSTITUTION_ID].activeMatters).toEqual([]);
    expect(isValidSaveEnvelope(restored, catalog)).toBe(true);
  });

  it('saves active drafts and pending assessments, and rejects malformed scenario structures', () => {
    let state = acquireMinimum(start());
    const draft = { ...validDraft(), draft: { ...validDraft().draft, received: 57 } };
    state = transitionGame(state, { type: 'SET_WORK_SCENARIO_DATA', workId: STOREHOUSE_WORK_ID, scenarioData: draft }, undefined, catalog).state;
    expect(isValidSaveEnvelope(createSaveEnvelope(state, 1), catalog)).toBe(true);
    expect(restoreSave(JSON.stringify(createSaveEnvelope(state, 1)), catalog)?.state.works.progress[STOREHOUSE_WORK_ID].scenarioData).toEqual(draft);
    state = transitionGame(state, { type: 'SUBMIT_WORK', workId: STOREHOUSE_WORK_ID }, undefined, catalog).state;
    expect(isValidSaveEnvelope(createSaveEnvelope(state, 2), catalog)).toBe(true);
    const invalid = structuredClone(createSaveEnvelope(state, 3));
    invalid.state.works.progress[STOREHOUSE_WORK_ID].scenarioData = { ...draft, draft: { received: -1 } };
    expect(isValidSaveEnvelope(invalid, catalog)).toBe(false);
    const invalidDisposition = structuredClone(createSaveEnvelope(state, 4));
    invalidDisposition.state.works.progress[STOREHOUSE_WORK_ID].finalDisposition = 'approve_everything';
    expect(isValidSaveEnvelope(invalidDisposition, catalog)).toBe(false);
    const missingAssessment = structuredClone(createSaveEnvelope(state, 5));
    missingAssessment.state.works.progress[STOREHOUSE_WORK_ID].lastAssessment = undefined;
    expect(isValidSaveEnvelope(missingAssessment, catalog)).toBe(false);
  });

  it('does not duplicate Historical Progress XP on any repeated or rejected disposition', () => {
    let state = submitValid(acquireMinimum(start()));
    state = nextDay(state);
    state = transitionGame(state, { type: 'DISPOSE_WORK', workId: STOREHOUSE_WORK_ID, disposition: 'authorized' }, undefined, catalog).state;
    const repeated = transitionGame(state, { type: 'DISPOSE_WORK', workId: STOREHOUSE_WORK_ID, disposition: 'authorized' }, undefined, catalog);
    expect(repeated.state).toBe(state);
    expect(state.historicalProgression.historicalXp).toBe(0);
  });
});
