import { describe, expect, it } from 'vitest';
import { transitionGame } from '../engine/actionEconomy';
import { createInitialGameState, INITIAL_PERSON_ID } from '../state/initialState';
import { isValidGameState } from '../state/saveEnvelope';
import type { AppointmentId, EventId, PersonId, RecordId } from '../state/ids';
import type { GameState, RecordEntry } from '../state/types';

const other = 'person-reviewer' as PersonId;
function stateWithOther(): GameState {
  const state = createInitialGameState();
  return { ...state, world: { ...state.world, people: { ...state.world.people,
    [other]: { id: other, name: 'Reviewer', alive: true, affiliations: [] },
  } } };
}
function record(createdDay = 1): RecordEntry {
  return { id: 'record-check' as RecordId, createdDay, authorPersonId: INITIAL_PERSON_ID, title: 'Check',
    sources: [{ id: 'source-one', kind: 'other', description: 'A supplied account' }],
    assertions: [{ id: 'assertion-one', text: 'A claim was made.', classification: 'reported', sourceIds: ['source-one'] }],
    uncertaintyLimits: [], amendments: [] };
}
describe('world social record validation', () => {
  it('rejects future record dates and records supplied with pre-existing amendments', () => {
    const state = stateWithOther();
    expect(transitionGame(state, { type: 'CREATE_RECORD', record: record(2) }).feedback?.code).toBe('record-invalid');
    const withAmendment = { ...record(), amendments: [{ id: 'amend-early', dayNumber: 1, authorPersonId: INITIAL_PERSON_ID,
      reason: 'Should be appended later', sourcesAdded: [], assertionsAdded: [], uncertaintyLimitsAdded: [], note: '' }] };
    expect(transitionGame(state, { type: 'CREATE_RECORD', record: withAmendment }).feedback?.code).toBe('record-invalid');
  });
  it('rejects invalid added sources and duplicate source IDs in amendments atomically', () => {
    const state = stateWithOther();
    const created = transitionGame(state, { type: 'CREATE_RECORD', record: record() });
    const bad = { id: 'amend-bad', dayNumber: 1, authorPersonId: other, reason: 'Add provenance',
      sourcesAdded: [{ id: 'new-source', kind: 'person' as const, sourceId: 'person-missing' as PersonId, description: 'Missing person' }],
      assertionsAdded: [], uncertaintyLimitsAdded: [], note: '' };
    const invalid = transitionGame(created.state, { type: 'AMEND_RECORD', recordId: 'record-check' as RecordId, amendment: bad });
    expect(invalid.feedback?.code).toBe('amendment-invalid');
    expect(invalid.state.records.entries['record-check'].amendments).toHaveLength(0);
    const duplicate = { ...bad, id: 'amend-duplicate', sourcesAdded: [
      { id: 'source-one', kind: 'other' as const, description: 'Duplicate' },
      { id: 'source-one', kind: 'other' as const, description: 'Duplicate again' },
    ] };
    expect(transitionGame(created.state, { type: 'AMEND_RECORD', recordId: 'record-check' as RecordId, amendment: duplicate }).feedback?.code).toBe('amendment-invalid');
  });
  it('rejects appointments without an ID and save records with future amendments', () => {
    const state = stateWithOther();
    const institution = transitionGame(state, { type: 'CREATE_INSTITUTION', institution: {
      id: 'institution-a' as never, name: 'Office', responsibilities: [], authority: [], standing: 50, activeMatters: [],
    } }).state;
    const malformed = { id: '' as AppointmentId, personId: other, institutionId: 'institution-a' as never, title: 'Clerk',
      authorityScope: ['Record deliveries'], responsibilities: [], startDay: 1 };
    expect(transitionGame(institution, { type: 'CREATE_APPOINTMENT', appointment: malformed }).feedback?.code).toBe('appointment-invalid');
    const created = transitionGame(institution, { type: 'CREATE_RECORD', record: record() }).state;
    const malformedSave = structuredClone(created);
    malformedSave.records.entries['record-check'] = { ...malformedSave.records.entries['record-check'], amendments: [{
      id: 'future-amendment', dayNumber: 2, authorPersonId: other, reason: 'Future', sourcesAdded: [],
      assertionsAdded: [], uncertaintyLimitsAdded: [], note: '',
    }] };
    expect(isValidGameState(malformedSave)).toBe(false);
  });
});
