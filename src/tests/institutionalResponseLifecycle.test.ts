import { describe, expect, it } from 'vitest';
import { transitionGame } from '../engine/actionEconomy';
import { createRoofRepairMatter, MATTER_IDS, NORTH_BAY_LOCATION_ID, STOREHOUSE_INSTITUTION_ID } from '../engine/institutionalMatters';
import { createInitialGameState, INITIAL_PERSON_ID } from '../state/initialState';
import type { AssignmentOffer, GameState, RecordEntry, WorldEvent } from '../state/types';
import type { AssignmentId, EventId, KnowledgeEntryId, PersonId, RecordId } from '../state/ids';

const verifierId = 'person-shuruppak-ilu' as PersonId;
const stewardId = 'person-ur-nanna' as PersonId;
const workerId = 'person-aru' as PersonId;

function stateWithExecution(includeEvidence = true): GameState {
  const base = createInitialGameState();
  const originalRecordId = 'record-lifecycle-original' as RecordId;
  const inspectionRecordId = 'record-lifecycle-inspection' as RecordId;
  const original: RecordEntry = {
    id: originalRecordId, createdDay: 1, authorPersonId: INITIAL_PERSON_ID,
    institutionId: STOREHOUSE_INSTITUTION_ID, title: 'Original maintenance report',
    sources: [], assertions: [], uncertaintyLimits: ['The initial report does not verify completed work.'], amendments: [],
  };
  const inspection: RecordEntry = {
    id: inspectionRecordId, createdDay: 1, authorPersonId: INITIAL_PERSON_ID,
    institutionId: STOREHOUSE_INSTITUTION_ID, title: 'Post-execution inspection',
    sources: [{ id: 'source-independent-observer', kind: 'person', sourceId: INITIAL_PERSON_ID,
      description: 'Direct physical inspection by a person other than the execution worker.' }],
    assertions: [{ id: 'assertion-independent-observation',
      text: 'The inspected north-bay runoff channel is clear after the maintenance execution.',
      classification: 'observed', sourceIds: ['source-independent-observer'] }],
    uncertaintyLimits: ['The inspection is limited to the runoff channel.'], amendments: [],
  };
  const matter = {
    ...createRoofRepairMatter(1, originalRecordId),
    provenance: [{ id: 'post-execution-inspection', kind: 'observation' as const,
      sourceId: inspectionRecordId, description: 'Independent post-execution inspection record.' }],
  };
  const execution: WorldEvent = {
    id: 'event-lifecycle-execution' as EventId, dayNumber: 1,
    summary: 'Aru completed the authorized North-Bay maintenance.',
    personIds: [stewardId, workerId], institutionIds: [STOREHOUSE_INSTITUTION_ID],
    locationId: NORTH_BAY_LOCATION_ID,
    institutionalResponse: {
      matterId: MATTER_IDS.roofRepair, stage: 'execution', actorPersonId: stewardId,
      appointmentId: 'appointment-ur-nanna-storehouse-steward' as never,
      recordId: originalRecordId, precedingEventId: 'event-lifecycle-assignment' as EventId,
      decision: 'executed', authorizedAction: 'routine_storehouse_maintenance',
      scope: 'Clear the north-bay parapet runoff channel and assess the damp beam socket.',
      assigneePersonId: workerId, commitmentId: 'commitment-lifecycle-worker',
      execution: { workPerformed: 'Clear the north-bay parapet runoff channel and assess the damp beam socket.',
        laborBasis: 'Existing maintenance labor.', materialsBasis: 'Existing maintenance materials.',
        result: 'The inspected runoff channel is clear.' },
    },
  };
  return {
    ...base,
    world: {
      ...base.world,
      events: { ...base.world.events, [execution.id]: execution },
      matters: { ...base.world.matters, [matter.id]: matter },
      institutions: { ...base.world.institutions,
        [STOREHOUSE_INSTITUTION_ID]: {
          ...base.world.institutions[STOREHOUSE_INSTITUTION_ID],
          activeMatters: [...new Set([...base.world.institutions[STOREHOUSE_INSTITUTION_ID].activeMatters, matter.id])],
        } },
      knowledge: includeEvidence ? { ...base.world.knowledge, ['knowledge-lifecycle-inspection' as KnowledgeEntryId]: {
        id: 'knowledge-lifecycle-inspection' as KnowledgeEntryId,
        holder: { kind: 'person', id: verifierId },
        subject: { kind: 'record', id: inspectionRecordId },
        basis: 'received-copy', learnedDay: 1, sourcePersonId: INITIAL_PERSON_ID,
      } } : base.world.knowledge,
    },
    records: { ...base.records, entries: {
      ...base.records.entries, [original.id]: original,
      ...(includeEvidence ? { [inspection.id]: inspection } : {}),
    } },
  };
}

describe('institutional response lifecycle', () => {
  it('does not invent evidence, respects accepted player commitments, then verifies and resolves developed matters', () => {
    let state = stateWithExecution(false);
    const noEvidence = transitionGame(state, { type: 'END_DAY', expectedDayNumber: 1 });
    expect(Object.values(noEvidence.state.world.events).some((event) => event.institutionalResponse?.stage === 'verification')).toBe(false);
    state = stateWithExecution(true);
    const acceptedOffer = {
      id: 'assignment-player-inspection' as AssignmentId,
      originMatterId: MATTER_IDS.roofRepair,
      status: 'accepted',
    } as unknown as AssignmentOffer;
    state = { ...state, opportunities: { ...state.opportunities,
      assignments: { ...state.opportunities.assignments, [acceptedOffer.id]: acceptedOffer } } };

    const held = transitionGame(state, { type: 'END_DAY', expectedDayNumber: 1 });
    expect(held.feedback?.code).toBe('day-settled');
    expect(Object.values(held.state.world.events).some((event) => event.institutionalResponse?.stage === 'verification')).toBe(false);

    const released = { ...held.state, opportunities: { ...held.state.opportunities,
      assignments: { ...held.state.opportunities.assignments,
        [acceptedOffer.id]: { ...acceptedOffer, status: 'cancelled' as const } } } };
    const settled = transitionGame(released, { type: 'END_DAY', expectedDayNumber: 2 });
    const verification = Object.values(settled.state.world.events).find((event) => event.institutionalResponse?.stage === 'verification');
    const resolution = Object.values(settled.state.world.events).find((event) => event.institutionalResponse?.stage === 'resolution');

    expect(verification?.institutionalResponse?.verification?.outcome).toBe('accepted');
    expect(verification?.institutionalResponse?.actorPersonId).toBe(verifierId);
    expect(resolution?.institutionalResponse?.resolution?.verificationEventId).toBe(verification?.id);
    expect(settled.state.world.matters[MATTER_IDS.roofRepair].status).toBe('resolved');
    expect(settled.state.world.institutions[STOREHOUSE_INSTITUTION_ID].activeMatters).not.toContain(MATTER_IDS.roofRepair);
  });

  it('leaves verification inconclusive when the independent inspection record contains disputed assertions', () => {
    const base = stateWithExecution(true);
    const recordId = 'record-lifecycle-inspection' as RecordId;
    const record = base.records.entries[recordId];
    const disputed: RecordEntry = { ...record,
      assertions: [...record.assertions, { id: 'assertion-disputed', text: 'The reported condition is disputed.',
        classification: 'disputed', sourceIds: ['source-independent-observer'] }],
    };
    const state = { ...base, records: { ...base.records, entries: { ...base.records.entries, [recordId]: disputed } } };
    const settled = transitionGame(state, { type: 'END_DAY', expectedDayNumber: 1 });
    const verification = Object.values(settled.state.world.events).find((event) => event.institutionalResponse?.stage === 'verification');
    expect(verification?.institutionalResponse?.verification?.outcome).toBe('inconclusive');
    expect(Object.values(settled.state.world.events).some((event) => event.institutionalResponse?.stage === 'resolution')).toBe(false);
    expect(settled.state.world.matters[MATTER_IDS.roofRepair].status).toBe('active');
  });
});
