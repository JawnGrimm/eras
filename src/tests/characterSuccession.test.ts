import { describe, expect, it } from 'vitest';
import { transitionGame } from '../engine/actionEconomy';
import { rankSuccessorCandidates } from '../engine/characterContinuity';
import { createInitialGameState, INITIAL_PERSON_ID } from '../state/initialState';
import { createSaveEnvelope, restoreSave } from '../state/saveEnvelope';
import type { AssignmentId, PersonId, RecordId, WorkId } from '../state/ids';
import type { Person } from '../state/types';
import type { GameState } from '../state/types';
import type { WorkDefinition } from '../works/workDefinition';

const apprenticeId = 'person-uruk-nin-aya' as PersonId;
const colleagueId = 'person-uruk-ur-gir' as PersonId;
const priorWorkId = 'work-prior-record' as WorkId;
const priorRecordId = 'record-prior-work' as RecordId;
const oldOneId = 'old-one' as AssignmentId;
const oldTwoId = 'old-two' as AssignmentId;
const newOneId = 'new-one' as AssignmentId;

function withPriorHistory(state: GameState): GameState {
  return {
    ...state,
    calendar: { ...state.calendar, dayNumber: 8, displayDate: 'Day 8, Early Season of Inundation (c. 3200 BCE)' },
    actionEconomy: { dailyApAllocation: 5, apRemaining: 1, overtimeUsedToday: true, nextDayApPenalty: true, recoveryLaborUsedToday: false },
    historicalProgression: { historicalXp: 275, completedWorks: [priorWorkId] },
    works: {
      activeWorkId: null,
      progress: {
        [priorWorkId]: {
          status: 'completed', acquiredEvidence: [], examinedEvidence: [], workApSpentToday: 2,
          rewardGranted: true, completedActionIds: [], scenarioData: {}, submissionCount: 1,
        },
      },
    },
    records: {
      entries: {
        [priorRecordId]: {
          id: priorRecordId, createdDay: 4, authorPersonId: INITIAL_PERSON_ID,
          title: 'Earlier storehouse account', sources: [], assertions: [],
          uncertaintyLimits: ['The surviving copy is incomplete.'], amendments: [],
        },
      },
      permanentOutcomes: [],
    },
  };
}

const priorWorkCatalog = {
  [priorWorkId]: {
    id: priorWorkId, evidence: [], actions: [],
    validateScenarioData: (value: unknown): value is Record<string, unknown> =>
      typeof value === 'object' && value !== null && !Array.isArray(value),
  },
} as unknown as Readonly<Record<string, WorkDefinition<any>>>;

function offer(id: string, state: GameState) {
  return {
    id: id as AssignmentId, title: 'Copy a delivery tally', description: 'Prepare a short delivery tally.',
    employer: { kind: 'person' as const, id: INITIAL_PERSON_ID }, category: 'recordkeeping',
    context: { what: 'Copy a delivery tally', who: ['storehouse clerk'], purpose: 'Preserve the delivery count.',
      responsibility: ['accurate copying'], provenance: ['clerk testimony'] },
    requiredSkills: {}, difficulty: 'routine' as const, apCost: 1,
    compensation: { money: 1, provisions: 0 }, careerXpReward: 1,
    deliveryChannels: [{ kind: 'baseline_reach' as const, explanation: 'A routine local request.' }],
    expiresDay: state.calendar.dayNumber + 3,
  };
}

describe('character departure and succession lifecycle', () => {
  it('discovers connected scribes, persists a pending death, selects without inheritance, and round-trips the save', () => {
    let state = withPriorHistory(createInitialGameState());
    expect(rankSuccessorCandidates(state).map((candidate) => candidate.personId)).toEqual([apprenticeId, colleagueId]);

    state = {
      ...state,
      opportunities: {
        ...state.opportunities,
        assignments: {
          [oldOneId]: {
            ...offer('old-one', state), offeredDay: state.calendar.dayNumber, expiresDay: state.calendar.dayNumber + 3,
            status: 'accepted', assigneePersonId: INITIAL_PERSON_ID,
          },
          [oldTwoId]: {
            ...offer('old-two', state), offeredDay: state.calendar.dayNumber, expiresDay: state.calendar.dayNumber + 3,
            status: 'accepted', assigneePersonId: INITIAL_PERSON_ID,
          },
        },
      },
    };
    const death = transitionGame(state, { type: 'BEGIN_CHARACTER_DEPARTURE', departureKind: 'death' }, undefined, priorWorkCatalog);
    expect(death.feedback?.code).toBe('succession-pending');
    state = death.state;
    expect(state.world.people[INITIAL_PERSON_ID].alive).toBe(false);
    expect(state.pendingSuccession?.status).toBe('awaiting_selection');
    expect(restoreSave(JSON.stringify(createSaveEnvelope(state, 3)), priorWorkCatalog)?.state.pendingSuccession)
      .toMatchObject({ formerCharacterId: INITIAL_PERSON_ID, departureKind: 'death', status: 'awaiting_selection' });

    const blocked = transitionGame(state, { type: 'SPEND_AP', amount: 1, reason: 'should be blocked' }, undefined, priorWorkCatalog);
    expect(blocked.feedback?.code).toBe('succession-pending');

    const selected = transitionGame(state, { type: 'SELECT_SUCCESSOR', nextCharacterId: apprenticeId }, undefined, priorWorkCatalog);
    expect(selected.feedback?.code).toBe('successor-selected');
    state = selected.state;
    expect(state.player.currentCharacterId).toBe(apprenticeId);
    expect(state.calendar.dayNumber).toBe(8);
    expect(state.historicalProgression).toEqual({ historicalXp: 275, completedWorks: [priorWorkId] });
    expect(state.records.entries[priorRecordId]).toBeDefined();
    expect(state.actionEconomy).toEqual({ dailyApAllocation: 6, apRemaining: 6, overtimeUsedToday: false, nextDayApPenalty: false });
    expect(state.works.progress[priorWorkId].workApSpentToday).toBe(0);
    expect(state.characterTransitions).toEqual([{
      formerCharacterId: INITIAL_PERSON_ID, nextCharacterId: apprenticeId, departureKind: 'death', dayNumber: 8,
    }]);

    const successor = state.world.people[apprenticeId].scribal!;
    expect(successor.skills.reading_scripts).toEqual({ level: 2, skillXp: 15 });
    expect(successor.wallet).toEqual({ money: 7, provisions: 3, shortageWorkdays: 0 });
    expect(successor.careerXp).toBe(35);
    expect(successor.stress).toBe(8);
    expect(state.world.people[INITIAL_PERSON_ID].scribal?.wallet).toEqual({ money: 12, provisions: 5, shortageWorkdays: 0 });

    const restored = restoreSave(JSON.stringify(createSaveEnvelope(state, 4)), priorWorkCatalog);
    expect(restored?.state.player.currentCharacterId).toBe(apprenticeId);
    expect(restored?.state.calendar.dayNumber).toBe(8);
    expect(restored?.state.historicalProgression).toEqual({ historicalXp: 275, completedWorks: [priorWorkId] });
    expect(restored?.state.records.entries[priorRecordId]).toBeDefined();
    expect(restored?.state.characterTransitions).toHaveLength(1);

    // Former-character commitments remain assigned to that person and do not consume the successor's slots.
    expect(state.opportunities.assignments[oldOneId].assigneePersonId).toBe(INITIAL_PERSON_ID);
    let next = transitionGame(state, { type: 'PRESENT_ASSIGNMENT', offer: offer(newOneId, state) }, undefined, priorWorkCatalog);
    next = transitionGame(next.state, { type: 'ACCEPT_ASSIGNMENT', assignmentId: newOneId }, undefined, priorWorkCatalog);
    expect(next.feedback?.code).toBe('assignment-accepted');
    expect(next.state.opportunities.assignments[newOneId].assigneePersonId).toBe(apprenticeId);
  });

  it('records a no-successor terminal state without inventing a person', () => {
    const state = createInitialGameState();
    const disconnected = {
      ...state,
      world: {
        ...state.world,
        people: {
          [INITIAL_PERSON_ID]: state.world.people[INITIAL_PERSON_ID],
          [colleagueId]: state.world.people[colleagueId],
        },
        relationships: {},
      },
    };
    const result = transitionGame(disconnected, { type: 'BEGIN_CHARACTER_DEPARTURE', departureKind: 'departure' }, undefined, priorWorkCatalog);
    expect(result.feedback?.code).toBe('succession-no-successor');
    expect(result.state.pendingSuccession?.status).toBe('no_successor');
    expect(result.state.world.people[INITIAL_PERSON_ID].alive).toBe(true);
    expect(Object.keys(result.state.world.people)).toEqual([INITIAL_PERSON_ID, colleagueId]);
    expect(restoreSave(JSON.stringify(createSaveEnvelope(result.state, 1)), priorWorkCatalog)?.state.pendingSuccession?.status)
      .toBe('no_successor');
    expect(transitionGame(result.state, { type: 'SELECT_SUCCESSOR', nextCharacterId: colleagueId }, undefined, priorWorkCatalog).feedback?.code)
      .toBe('succession-selection-unavailable');
  });

  it('rejects disconnected, dead, non-scribal, and former-character selections', () => {
    let state = createInitialGameState();
    const deadId = 'person-dead-scribe' as PersonId;
    const nonScribeId = 'person-connected-non-scribe' as PersonId;
    const deadPerson: Person = { ...state.world.people[apprenticeId], id: deadId, name: 'Dead colleague', alive: false };
    const nonScribe: Person = { id: nonScribeId, name: 'Connected non-scribe', alive: true, affiliations: [] };
    state = {
      ...state,
      world: {
        ...state.world,
        people: { ...state.world.people, [deadId]: deadPerson, [nonScribeId]: nonScribe },
        relationships: {
          ...state.world.relationships,
          [INITIAL_PERSON_ID]: {
            ...state.world.relationships[INITIAL_PERSON_ID],
            [deadId]: { dimensions: { trust: 40, respect: 40, affection: 20, resentment: 0, rivalry: 0, familiarity: 30 }, history: [] },
            [nonScribeId]: { dimensions: { trust: 40, respect: 40, affection: 20, resentment: 0, rivalry: 0, familiarity: 30 }, history: [] },
          },
        },
      },
    };
    const begun = transitionGame(state, { type: 'BEGIN_CHARACTER_DEPARTURE', departureKind: 'death' });
    for (const id of [INITIAL_PERSON_ID, deadId, nonScribeId, 'not-connected' as PersonId]) {
      expect(transitionGame(begun.state, { type: 'SELECT_SUCCESSOR', nextCharacterId: id }).feedback?.code).toBe('successor-ineligible');
    }
  });
});
