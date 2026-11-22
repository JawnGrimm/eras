import { describe, expect, it } from 'vitest';
import { transitionGame } from '../engine/actionEconomy';
import { deriveProfessionalRank } from '../engine/professionalRank';
import { createInitialGameState, INITIAL_PERSON_ID } from '../state/initialState';
import { isValidGameState } from '../state/saveEnvelope';
import type { PersonId, InstitutionId, AppointmentId, EventId, RecordId, KnowledgeEntryId } from '../state/ids';
import type { GameState, Person } from '../state/types';

const otherId = 'person-shuruppak-ilu' as PersonId;
const institutionId = 'institution-temple-storehouse' as InstitutionId;
const base = () => {
  const state = createInitialGameState();
  const other: Person = { id: otherId, name: 'Shuruppak-ilu', alive: true, affiliations: [], scribal: {
    careerXp: 0, wallet: { money: 0, provisions: 0, shortageWorkdays: 0 }, skills: {}, attributes: {},
    specializations: [], traits: [], conditions: [], equipment: [], stress: 0,
    professionalReputation: { competence: 50, reliability: 50, discretion: 50, judgment: 50 },
    institutionalStanding: {},
  } };
  return { ...state, world: { ...state.world, people: { ...state.world.people, [otherId]: other } } };
};

describe('world, relationships, institutions and records', () => {
  it('stores personal relationships by ordered person pair and keeps dimensions separate', () => {
    const state = base();
    const relationship = { dimensions: { trust: 75, respect: 60, affection: 20, resentment: 5, rivalry: 10, familiarity: 40 }, history: [] };
    const result = transitionGame(state, { type: 'SET_RELATIONSHIP', fromId: INITIAL_PERSON_ID, toId: otherId, relationship });
    expect(result.feedback?.code).toBe('relationship-updated');
    expect(result.state.world.relationships[INITIAL_PERSON_ID]?.[otherId]?.dimensions.trust).toBe(75);
    expect(result.state.world.relationships[otherId]?.[INITIAL_PERSON_ID]).toBeUndefined();
    expect(result.state.world.people[INITIAL_PERSON_ID].scribal?.professionalReputation).toEqual(state.world.people[INITIAL_PERSON_ID].scribal?.professionalReputation);
    expect(result.state.world.people[INITIAL_PERSON_ID].scribal?.institutionalStanding).toEqual({});
    const reverse = transitionGame(result.state, { type: 'SET_RELATIONSHIP', fromId: otherId, toId: INITIAL_PERSON_ID,
      relationship: { dimensions: { trust: 15, respect: 25, affection: 0, resentment: 70, rivalry: 55, familiarity: 10 }, history: [] } });
    expect(reverse.state.world.relationships[otherId]?.[INITIAL_PERSON_ID]?.dimensions.trust).toBe(15);
    expect(reverse.state.world.relationships[INITIAL_PERSON_ID]?.[otherId]?.dimensions.trust).toBe(75);
  });

  it('uses one institution shape and stores office authority in appointments, not rank', () => {
    const state = base();
    const institution = { id: institutionId, name: 'Temple Storehouse', responsibilities: ['Receive and safeguard grain'], authority: ['Maintain storehouse accounts'], standing: 65, activeMatterIds: [] };
    const created = transitionGame(state, { type: 'CREATE_INSTITUTION', institution });
    expect(created.feedback?.code).toBe('institution-created');
    const appointment = { id: 'appointment-steward' as AppointmentId, personId: otherId, institutionId, title: 'Storehouse Steward',
      authorityScope: ['Approve receipt of grain', 'Authorize issue under decree'], responsibilities: ['Maintain custody of stock'], startDay: 1 };
    const appointed = transitionGame(created.state, { type: 'CREATE_APPOINTMENT', appointment });
    expect(appointed.feedback?.code).toBe('appointment-created');
    expect(appointed.state.world.appointments[appointment.id].authorityScope).toContain('Approve receipt of grain');
    expect(deriveProfessionalRank(appointed.state.world.people[otherId].scribal!.skills)).toBe(1);
    expect(isValidGameState(appointed.state)).toBe(true);
  });

  it('keeps event facts, authored records, append-only amendments, and knowledge holdings distinct', () => {
    let state: GameState = base();
    const event = { id: 'event-delivery' as EventId, dayNumber: 1, summary: 'A delivery arrived at the storehouse.',
      personIds: [INITIAL_PERSON_ID], institutionIds: [], };
    state = transitionGame(state, { type: 'CREATE_EVENT', event }).state;
    const record = { id: 'record-delivery' as RecordId, createdDay: 1, authorPersonId: INITIAL_PERSON_ID,
      title: 'Delivery account', sources: [{ id: 'source-event', kind: 'event' as const, sourceId: event.id, description: 'Observed delivery event' }],
      assertions: [{ id: 'assertion-1', text: 'The delivery arrived.', classification: 'observed' as const, sourceIds: ['source-event'] }],
      uncertaintyLimits: ['The contents have not yet been independently recounted.'], amendments: [] };
    const created = transitionGame(state, { type: 'CREATE_RECORD', record });
    expect(created.feedback?.code).toBe('record-created');
    state = created.state;
    const amendment = { id: 'amendment-1', dayNumber: 1, authorPersonId: otherId, reason: 'A later count qualifies the first account.',
      sourcesAdded: [], assertionsAdded: [{ id: 'assertion-2', text: 'The delivered quantity remains unverified.', classification: 'reported' as const, sourceIds: ['source-event'] }],
      uncertaintyLimitsAdded: ['The quantity is still not established.'], note: 'The original assertion is retained.' };
    const amended = transitionGame(state, { type: 'AMEND_RECORD', recordId: record.id, amendment });
    expect(amended.feedback?.code).toBe('record-amended');
    expect(amended.state.records.entries[record.id].assertions).toEqual(record.assertions);
    expect(amended.state.records.entries[record.id].amendments).toHaveLength(1);
    state = amended.state;
    const knowledge = { id: 'knowledge-enlil' as KnowledgeEntryId, holder: { kind: 'person' as const, id: INITIAL_PERSON_ID },
      subject: { kind: 'record' as const, id: record.id }, basis: 'received-copy' as const, learnedDay: 1, sourcePersonId: otherId };
    const informed = transitionGame(state, { type: 'GRANT_KNOWLEDGE', knowledge });
    expect(informed.feedback?.code).toBe('knowledge-granted');
    expect(informed.state.world.knowledge[knowledge.id]).toEqual(knowledge);
    expect(Object.values(informed.state.world.knowledge).some((entry) => entry.holder.kind === 'person' && entry.holder.id === otherId)).toBe(false);
    expect(isValidGameState(informed.state)).toBe(true);
  });

  it('rejects invalid relationship scores, dangling institutional references, and unsupported knowledge', () => {
    const state = base();
    const invalidRelationship = transitionGame(state, { type: 'SET_RELATIONSHIP', fromId: INITIAL_PERSON_ID, toId: otherId,
      relationship: { dimensions: { trust: 101, respect: 0, affection: 0, resentment: 0, rivalry: 0, familiarity: 0 }, history: [] } });
    expect(invalidRelationship.state).toBe(state);
    expect(invalidRelationship.feedback?.code).toBe('relationship-invalid');
    const invalidKnowledge = transitionGame(state, { type: 'GRANT_KNOWLEDGE', knowledge: {
      id: 'knowledge-missing' as KnowledgeEntryId, holder: { kind: 'person', id: INITIAL_PERSON_ID },
      subject: { kind: 'event', id: 'event-not-created' as EventId }, basis: 'testimony', learnedDay: 1,
    } });
    expect(invalidKnowledge.state).toBe(state);
    expect(invalidKnowledge.feedback?.code).toBe('knowledge-invalid');
    const malformed = structuredClone(state);
    malformed.world.relationships[INITIAL_PERSON_ID] = { [otherId]: { dimensions: { trust: 101, respect: 0, affection: 0, resentment: 0, rivalry: 0, familiarity: 0 }, history: [] } };
    expect(isValidGameState(malformed)).toBe(false);
  });
});
