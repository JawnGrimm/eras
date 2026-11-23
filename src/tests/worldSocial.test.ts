import { describe, expect, it } from 'vitest';
import { transitionGame } from '../engine/actionEconomy';
import { validateInstitutionalResponseEvent } from '../engine/institutionalResponseValidation';
import { deriveProfessionalRank } from '../engine/professionalRank';
import { createInitialGameState, INITIAL_PERSON_ID } from '../state/initialState';
import { createSaveEnvelope, isValidGameState, restoreSave } from '../state/saveEnvelope';
import { createRoofRepairMatter, MATTER_IDS, STOREHOUSE_INSTITUTION_ID, NORTH_BAY_LOCATION_ID } from '../engine/institutionalMatters';
import type { PersonId, InstitutionId, AppointmentId, EventId, RecordId, KnowledgeEntryId } from '../state/ids';
import type { GameState, Person } from '../state/types';

const otherId = 'person-shuruppak-ilu' as PersonId;
const institutionId = 'institution-temple-storehouse' as InstitutionId;
const base = (): GameState => {
  const state = createInitialGameState();
  const other: Person = { id: otherId, name: 'Shuruppak-ilu', alive: true, affiliations: [], scribal: {
    careerXp: 0, cumulativeShortageStress: 0, obligations: [], wallet: { money: 0, provisions: 0, shortageWorkdays: 0 }, skills: {}, attributes: {},
    specializations: [], traits: [], conditions: [], equipment: [], stress: 0,
    professionalReputation: { competence: 50, reliability: 50, discretion: 50, judgment: 50 },
    institutionalStanding: {},
  } };
  return { ...state, world: { ...state.world, people: { ...state.world.people, [otherId]: other } } } as GameState;
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
    const institution = { id: institutionId, name: 'Temple Storehouse', responsibilities: ['Receive and safeguard grain'], authority: ['Maintain storehouse accounts'], standing: 65, activeMatters: [] };
    const created = transitionGame(state, { type: 'CREATE_INSTITUTION', institution });
    expect(created.feedback?.code).toBe('institution-created');
    const standing = transitionGame(created.state, { type: 'SET_INSTITUTIONAL_STANDING', personId: otherId, institutionId, value: 72 });
    expect(standing.feedback?.code).toBe('institutional-standing-updated');
    expect(standing.state.world.people[otherId].scribal?.institutionalStanding[institutionId]).toBe(72);
    expect(standing.state.world.relationships).toEqual(created.state.world.relationships);
    expect(standing.state.world.people[otherId].scribal?.professionalReputation).toEqual(created.state.world.people[otherId].scribal?.professionalReputation);
    const appointment = { id: 'appointment-steward' as AppointmentId, personId: otherId, institutionId, title: 'Storehouse Steward',
      authorityScope: ['Approve receipt of grain', 'Authorize issue under decree'], responsibilities: ['Maintain custody of stock'], startDay: 1 };
    const appointed = transitionGame(standing.state, { type: 'CREATE_APPOINTMENT', appointment });
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

  it('records institutional assessment and maintenance authorization against evidence and active office authority', () => {
    const baseState = createInitialGameState();
    const storehouseId = STOREHOUSE_INSTITUTION_ID;
    const shuruppakId = 'person-shuruppak-ilu' as PersonId;
    const stewardId = 'person-ur-nanna' as PersonId;
    const report = {
      id: 'record-north-bay-response-test' as RecordId, createdDay: 1, authorPersonId: INITIAL_PERSON_ID,
      institutionId: storehouseId, title: 'North-Bay Roof Inspection Report',
      sources: [], assertions: [], uncertaintyLimits: ['The report is limited to the inspected roof areas.'], amendments: [],
    };
    const createdRecord = transitionGame(baseState, { type: 'CREATE_RECORD', record: report });
    expect(createdRecord.feedback?.code).toBe('record-created');
    const roofMatter = createRoofRepairMatter(1, report.id);
    let state: GameState = {
      ...createdRecord.state,
      world: {
        ...createdRecord.state.world,
        matters: { ...createdRecord.state.world.matters, [MATTER_IDS.roofRepair]: roofMatter },
        institutions: {
          ...createdRecord.state.world.institutions,
          [storehouseId]: {
            ...createdRecord.state.world.institutions[storehouseId],
            activeMatters: [...createdRecord.state.world.institutions[storehouseId].activeMatters, MATTER_IDS.roofRepair],
          },
        },
      },
    };
    for (const [holderId, id] of [[shuruppakId, 'knowledge-roof-report-shuruppak'], [stewardId, 'knowledge-roof-report-steward']] as const) {
      const granted = transitionGame(state, { type: 'GRANT_KNOWLEDGE', knowledge: {
        id: id as KnowledgeEntryId, holder: { kind: 'person', id: holderId },
        subject: { kind: 'record', id: report.id }, basis: 'received-copy', learnedDay: 1,
        sourcePersonId: INITIAL_PERSON_ID,
      } });
      expect(granted.feedback?.code).toBe('knowledge-granted');
      state = granted.state;
    }
    const assessment = {
      id: 'event-north-bay-assessment' as EventId, dayNumber: 1,
      summary: 'Shuruppak-ilu accepts the qualified roof report for routine maintenance consideration.',
      personIds: [shuruppakId], institutionIds: [storehouseId], locationId: NORTH_BAY_LOCATION_ID,
      institutionalResponse: {
        matterId: MATTER_IDS.roofRepair, stage: 'assessment' as const, actorPersonId: shuruppakId,
        appointmentId: 'appointment-shuruppak-ilu-senior-scribe' as AppointmentId,
        recordId: report.id, decision: 'accepted_for_action' as const,
      },
    };
    const assessed = transitionGame(state, { type: 'CREATE_EVENT', event: assessment });
    expect(assessed.feedback?.code).toBe('event-created');
    state = assessed.state;
    const authorization = {
      id: 'event-north-bay-maintenance-order' as EventId, dayNumber: 1,
      summary: 'Ur-Nanna authorizes routine maintenance within the existing storehouse allocation.',
      personIds: [stewardId], institutionIds: [storehouseId], locationId: NORTH_BAY_LOCATION_ID,
      institutionalResponse: {
        matterId: MATTER_IDS.roofRepair, stage: 'authorization' as const, actorPersonId: stewardId,
        appointmentId: 'appointment-ur-nanna-storehouse-steward' as AppointmentId,
        recordId: report.id, precedingEventId: assessment.id, decision: 'authorized' as const,
        authorizedAction: 'routine_storehouse_maintenance' as const,
        scope: 'Clear the north-bay parapet runoff channel and assess the damp north-east beam socket using already allocated maintenance labor and materials.',
      },
    };
    const authorized = transitionGame(state, { type: 'CREATE_EVENT', event: authorization });
    expect(authorized.feedback?.code).toBe('event-created');
    expect(authorized.state.world.events[authorization.id].institutionalResponse?.stage).toBe('authorization');
    expect(authorized.state.world.matters[MATTER_IDS.roofRepair].status).toBe('active');

    const workerId = 'person-aru' as PersonId;
    expect(authorized.state.world.people[workerId]?.name).toBe('Aru');
    const assignment = {
      id: 'event-north-bay-maintenance-assignment' as EventId, dayNumber: 1,
      summary: 'Ur-Nanna assigns Aru to carry out the authorized North-Bay maintenance using the existing allocation.',
      personIds: [stewardId, workerId], institutionIds: [storehouseId], locationId: NORTH_BAY_LOCATION_ID,
      institutionalResponse: {
        matterId: MATTER_IDS.roofRepair, stage: 'commitment' as const, actorPersonId: stewardId,
        appointmentId: 'appointment-ur-nanna-storehouse-steward' as AppointmentId,
        recordId: report.id, precedingEventId: authorization.id, decision: 'assigned' as const,
        authorizedAction: 'routine_storehouse_maintenance' as const, scope: authorization.institutionalResponse.scope,
        assigneePersonId: workerId, commitmentId: 'commitment-aru-north-bay-maintenance',
      },
    };
    const assigned = transitionGame(authorized.state, { type: 'CREATE_EVENT', event: assignment });
    expect(assigned.feedback?.code).toBe('event-created');
    state = assigned.state;
    const commitment = state.world.people[workerId].commitments?.find((item) => item.id === 'commitment-aru-north-bay-maintenance');
    expect(commitment?.status).toBe('active');
    expect(commitment?.basis).toEqual({ kind: 'event', id: assignment.id });
    expect(Object.values(state.world.knowledge).some((entry) => entry.holder.kind === 'person'
      && entry.holder.id === workerId && entry.subject.kind === 'record' && entry.subject.id === report.id)).toBe(true);
    expect(validateInstitutionalResponseEvent(state, state.world.events[assignment.id])).toBeNull();
    expect(isValidGameState(state)).toBe(true);

    const outOfScope = {
      id: 'event-north-bay-maintenance-out-of-scope' as EventId, dayNumber: 1,
      summary: 'An attempted execution expands the authorized work.',
      personIds: [stewardId, workerId], institutionIds: [storehouseId], locationId: NORTH_BAY_LOCATION_ID,
      institutionalResponse: {
        matterId: MATTER_IDS.roofRepair, stage: 'execution' as const, actorPersonId: stewardId,
        appointmentId: 'appointment-ur-nanna-storehouse-steward' as AppointmentId,
        recordId: report.id, precedingEventId: assignment.id, decision: 'executed' as const,
        authorizedAction: 'routine_storehouse_maintenance' as const, scope: 'Replace the entire north roof structure.',
        assigneePersonId: workerId, commitmentId: 'commitment-aru-north-bay-maintenance',
        execution: { workPerformed: 'Replace the entire north roof structure.', laborBasis: 'Existing maintenance labor.', materialsBasis: 'Existing maintenance materials.', result: 'Roof replaced.' },
      },
    };
    const rejectedScope = transitionGame(state, { type: 'CREATE_EVENT', event: outOfScope });
    expect(rejectedScope.state).toBe(state);
    expect(rejectedScope.feedback?.code).toBe('institutional-response-invalid');

    const execution = {
      id: 'event-north-bay-maintenance-execution' as EventId, dayNumber: 1,
      summary: 'Ur-Nanna records Aru’s completed North-Bay maintenance.',
      personIds: [stewardId, workerId], institutionIds: [storehouseId], locationId: NORTH_BAY_LOCATION_ID,
      institutionalResponse: {
        matterId: MATTER_IDS.roofRepair, stage: 'execution' as const, actorPersonId: stewardId,
        appointmentId: 'appointment-ur-nanna-storehouse-steward' as AppointmentId,
        recordId: report.id, precedingEventId: assignment.id, decision: 'executed' as const,
        authorizedAction: 'routine_storehouse_maintenance' as const, scope: authorization.institutionalResponse.scope,
        assigneePersonId: workerId, commitmentId: 'commitment-aru-north-bay-maintenance',
        execution: {
          workPerformed: authorization.institutionalResponse.scope,
          laborBasis: 'Aru’s assigned labor under the existing storehouse maintenance allocation.',
          materialsBasis: 'No new materials issued; work used the existing maintenance allocation and available tools.',
          result: 'The runoff channel is clear; the beam socket remains damp and requires separate inspection after drying.',
        },
      },
    };
    const executed = transitionGame(state, { type: 'CREATE_EVENT', event: execution });
    expect(executed.feedback?.code).toBe('event-created');
    expect(executed.state.world.people[workerId].commitments?.find((item) => item.id === 'commitment-aru-north-bay-maintenance')?.status).toBe('fulfilled');
    expect(executed.state.world.matters[MATTER_IDS.roofRepair].status).toBe('active');
    const responseErrors = Object.values(executed.state.world.events).flatMap((event) => {
      const error = validateInstitutionalResponseEvent(executed.state, event);
      return error ? [[event.id, error]] : [];
    });
    expect(responseErrors).toEqual([]);
    expect(isValidGameState(executed.state)).toBe(true);

    const duplicateExecution = transitionGame(executed.state, { type: 'CREATE_EVENT', event: {
      ...execution, id: 'event-north-bay-maintenance-execution-duplicate' as EventId,
    } });
    expect(duplicateExecution.state).toBe(executed.state);
    expect(duplicateExecution.feedback?.code).toBe('institutional-response-invalid');

    const restored = restoreSave(JSON.stringify(createSaveEnvelope(executed.state, 1, '2026-11-22T12:00:00.000Z')));
    expect(restored?.state.world.events[authorization.id].institutionalResponse?.precedingEventId).toBe(assessment.id);
    expect(restored?.state.world.events[execution.id].institutionalResponse?.stage).toBe('execution');
    expect(restored?.state.world.matters[MATTER_IDS.roofRepair].status).toBe('active');
  });

  it('migrates older North-Bay saves with the authored maintenance worker', () => {
    const legacy = structuredClone(createInitialGameState());
    delete legacy.world.people['person-aru' as PersonId];
    const restored = restoreSave(JSON.stringify(createSaveEnvelope(legacy, 1, '2026-11-23T00:00:00.000Z')));
    expect(restored).not.toBeNull();
    expect(restored?.state.world.people['person-aru' as PersonId]?.name).toBe('Aru');
    expect(restored?.state.world.people['person-aru' as PersonId]?.affiliations).toContain(STOREHOUSE_INSTITUTION_ID);
  });

  it('blocks new referrals without a recipient while preserving legacy referral events in saves', () => {
    const baseState = createInitialGameState();
    const report = {
      id: 'record-referral-completeness-test' as RecordId, createdDay: 1, authorPersonId: INITIAL_PERSON_ID,
      institutionId: STOREHOUSE_INSTITUTION_ID, title: 'North-Bay Roof Inspection Report',
      sources: [], assertions: [], uncertaintyLimits: ['The report is limited to the inspected roof areas.'], amendments: [],
    };
    const created = transitionGame(baseState, { type: 'CREATE_RECORD', record: report });
    expect(created.feedback?.code).toBe('record-created');
    const matter = createRoofRepairMatter(1, report.id);
    let state: GameState = {
      ...created.state,
      world: {
        ...created.state.world,
        matters: { ...created.state.world.matters, [MATTER_IDS.roofRepair]: matter },
        institutions: {
          ...created.state.world.institutions,
          [STOREHOUSE_INSTITUTION_ID]: {
            ...created.state.world.institutions[STOREHOUSE_INSTITUTION_ID],
            activeMatters: [...created.state.world.institutions[STOREHOUSE_INSTITUTION_ID].activeMatters, MATTER_IDS.roofRepair],
          },
        },
      },
    };
    const actorId = 'person-shuruppak-ilu' as PersonId;
    const knowledge = transitionGame(state, { type: 'GRANT_KNOWLEDGE', knowledge: {
      id: 'knowledge-referral-report' as KnowledgeEntryId,
      holder: { kind: 'person', id: actorId }, subject: { kind: 'record', id: report.id },
      basis: 'received-copy', learnedDay: 1, sourcePersonId: INITIAL_PERSON_ID,
    } });
    expect(knowledge.feedback?.code).toBe('knowledge-granted');
    state = knowledge.state;

    const referral = {
      id: 'event-incomplete-referral' as EventId, dayNumber: 1,
      summary: 'The report is referred without a recorded receiving official or institution.',
      personIds: [actorId], institutionIds: [STOREHOUSE_INSTITUTION_ID], locationId: NORTH_BAY_LOCATION_ID,
      institutionalResponse: {
        matterId: MATTER_IDS.roofRepair, stage: 'assessment' as const, actorPersonId: actorId,
        appointmentId: 'appointment-shuruppak-ilu-senior-scribe' as AppointmentId,
        recordId: report.id, decision: 'referred' as const,
      },
    };
    const attempted = transitionGame(state, { type: 'CREATE_EVENT', event: referral });
    expect(attempted.state).toBe(state);
    expect(attempted.feedback?.code).toBe('institutional-response-invalid');
    expect(attempted.feedback?.message).toContain('receiving person or institution');

    // Existing schema-v2 saves may already contain a referral decision. Keep those
    // historical events loadable; they are not retroactively assigned a recipient.
    const legacyState: GameState = {
      ...state,
      world: { ...state.world, events: { ...state.world.events, [referral.id]: referral } },
    };
    expect(isValidGameState(legacyState)).toBe(true);
    const restored = restoreSave(JSON.stringify(createSaveEnvelope(legacyState, 1, '2026-11-23T00:00:00.000Z')));
    expect(restored).not.toBeNull();
    expect(restored?.state.world.events[referral.id].institutionalResponse?.decision).toBe('referred');
  });

  it('rejects an assessment by an appointed official without the required authority capability', () => {
    const baseState = createInitialGameState();
    const report = {
      id: 'record-delivery-response-test' as RecordId, createdDay: 1, authorPersonId: INITIAL_PERSON_ID,
      institutionId: STOREHOUSE_INSTITUTION_ID, title: 'Delivery Reconciliation Report',
      sources: [], assertions: [], uncertaintyLimits: ['The records do not establish where the measure was lost.'], amendments: [],
    };
    const created = transitionGame(baseState, { type: 'CREATE_RECORD', record: report });
    const matter = {
      ...created.state.world.matters[MATTER_IDS.southCourtDelivery],
      sourceRecordId: report.id,
    };
    let state: GameState = {
      ...created.state,
      world: { ...created.state.world, matters: { ...created.state.world.matters, [MATTER_IDS.southCourtDelivery]: matter } },
    };
    const actorId = 'person-utu-mansum' as PersonId;
    const knowledge = transitionGame(state, { type: 'GRANT_KNOWLEDGE', knowledge: {
      id: 'knowledge-delivery-report-utu' as KnowledgeEntryId,
      holder: { kind: 'person', id: actorId }, subject: { kind: 'record', id: report.id },
      basis: 'received-copy', learnedDay: 1, sourcePersonId: INITIAL_PERSON_ID,
    } });
    expect(knowledge.feedback?.code).toBe('knowledge-granted');
    state = knowledge.state;
    const attempted = transitionGame(state, { type: 'CREATE_EVENT', event: {
      id: 'event-unauthorized-assessment' as EventId, dayNumber: 1,
      summary: 'The receiving official attempts to assess the report outside his office authority.',
      personIds: [actorId], institutionIds: [STOREHOUSE_INSTITUTION_ID],
      institutionalResponse: {
        matterId: MATTER_IDS.southCourtDelivery, stage: 'assessment' as const, actorPersonId: actorId,
        appointmentId: 'appointment-utu-mansum-receiving-official' as AppointmentId,
        recordId: report.id, decision: 'accepted_for_action' as const,
      },
    } });
    expect(attempted.state).toBe(state);
    expect(attempted.feedback?.code).toBe('institutional-response-invalid');
    expect(attempted.feedback?.message).toContain('does not authorize assessment');
  });

  it('migrates the two known initial office capabilities into earlier schema-v2 saves', () => {
    const legacy = structuredClone(createInitialGameState());
    delete (legacy.world.appointments['appointment-shuruppak-ilu-senior-scribe' as AppointmentId] as { authorityCapabilities?: unknown }).authorityCapabilities;
    delete (legacy.world.appointments['appointment-ur-nanna-storehouse-steward' as AppointmentId] as { authorityCapabilities?: unknown }).authorityCapabilities;
    const restored = restoreSave(JSON.stringify(createSaveEnvelope(legacy, 1, '2026-11-22T12:00:00.000Z')));
    expect(restored).not.toBeNull();
    expect(restored!.state.world.appointments['appointment-shuruppak-ilu-senior-scribe' as AppointmentId].authorityCapabilities)
      .toContain('assess_institutional_reports');
    expect(restored!.state.world.appointments['appointment-ur-nanna-storehouse-steward' as AppointmentId].authorityCapabilities)
      .toContain('authorize_routine_storehouse_maintenance');
  });

});
