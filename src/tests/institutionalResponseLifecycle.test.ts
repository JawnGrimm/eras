import { describe, expect, it } from 'vitest';
import { transitionGame } from '../engine/actionEconomy';
import { validateInstitutionalResponseEvent } from '../engine/institutionalResponseValidation';
import { createRoofRepairMatter, MATTER_IDS, NORTH_BAY_LOCATION_ID, STOREHOUSE_INSTITUTION_ID } from '../engine/institutionalMatters';
import { createInitialGameState, INITIAL_PERSON_ID } from '../state/initialState';
import { NORTH_BAY_POST_EXECUTION_ACTIVITY_ID } from '../content/assignments/northBayRoofInspection';
import type { AssignmentOffer, GameState, InstitutionalResponse, RecordEntry, WorldEvent } from '../state/types';
import type { AppointmentId, AssignmentId, EventId, InstitutionId, KnowledgeEntryId, PersonId, RecordId } from '../state/ids';

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
      id: 'assignment-auto-post-execution-event-lifecycle-execution' as AssignmentId,
      activityId: NORTH_BAY_POST_EXECUTION_ACTIVITY_ID,
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
  it('enforces independent evidence, verifier authority, and explicit resolution disposition', () => {
    const base = stateWithExecution(true);
    const recordId = 'record-lifecycle-inspection' as RecordId;
    const executionId = 'event-lifecycle-execution' as EventId;
    const seniorAppointment = 'appointment-shuruppak-ilu-senior-scribe' as AppointmentId;
    const makeVerification = (changes: Partial<InstitutionalResponse> = {}): WorldEvent => {
      const response: InstitutionalResponse = {
        matterId: MATTER_IDS.roofRepair, stage: 'verification', actorPersonId: verifierId,
        appointmentId: seniorAppointment, recordId, precedingEventId: executionId, decision: 'verified',
        verification: { executionEventId: executionId, outcome: 'accepted', rationale: 'Independent post-execution inspection supports verification.' },
        ...changes,
      };
      return { id: 'event-validation-verification' as EventId, dayNumber: 1,
        summary: 'An authorized official verifies the recorded execution.', personIds: [response.actorPersonId],
        institutionIds: [STOREHOUSE_INSTITUTION_ID], locationId: NORTH_BAY_LOCATION_ID, institutionalResponse: response };
    };
    expect(validateInstitutionalResponseEvent(base, makeVerification())).toBeNull();

    const noCapability = { ...base, world: { ...base.world, appointments: {
      ...base.world.appointments, [seniorAppointment]: { ...base.world.appointments[seniorAppointment],
        authorityCapabilities: ['assess_institutional_reports' as const] },
    } } };
    expect(validateInstitutionalResponseEvent(noCapability, makeVerification())?.toLowerCase()).toContain('does not authorize');

    const inactive = { ...base, world: { ...base.world, appointments: {
      ...base.world.appointments, [seniorAppointment]: { ...base.world.appointments[seniorAppointment], endDay: 0 },
    } } };
    expect(validateInstitutionalResponseEvent(inactive, makeVerification())?.toLowerCase()).toContain('active appointment');

    const wrongInstitution = { ...base, world: { ...base.world, appointments: {
      ...base.world.appointments, [seniorAppointment]: { ...base.world.appointments[seniorAppointment],
        institutionId: 'institution-other' as InstitutionId },
    } } };
    expect(validateInstitutionalResponseEvent(wrongInstitution, makeVerification())?.toLowerCase()).toContain('active appointment');

    const noKnowledge = { ...base, world: { ...base.world, knowledge: {} } };
    expect(validateInstitutionalResponseEvent(noKnowledge, makeVerification())?.toLowerCase()).toContain('explicit knowledge');

    const workerRecordId = 'record-worker-only' as RecordId;
    const workerRecord: RecordEntry = {
      ...base.records.entries[recordId], id: workerRecordId,
      sources: [{ id: 'source-worker-claim', kind: 'person', sourceId: workerId, description: 'The execution worker’s own statement.' }],
      assertions: [{ id: 'assertion-worker-claim', text: 'The work was completed.', classification: 'observed', sourceIds: ['source-worker-claim'] }],
    };
    const workerOnly = { ...base, records: { ...base.records, entries: { ...base.records.entries, [workerRecordId]: workerRecord } },
      world: { ...base.world, matters: { ...base.world.matters, [MATTER_IDS.roofRepair]: {
        ...base.world.matters[MATTER_IDS.roofRepair], provenance: [...(base.world.matters[MATTER_IDS.roofRepair].provenance ?? []),
          { id: 'worker-only-provenance', kind: 'observation' as const, sourceId: workerRecordId, description: 'Worker-only statement.' }],
      } }, knowledge: { ...base.world.knowledge, ['knowledge-worker-only' as KnowledgeEntryId]: {
        id: 'knowledge-worker-only' as KnowledgeEntryId, holder: { kind: 'person' as const, id: verifierId },
        subject: { kind: 'record' as const, id: workerRecordId }, basis: 'received-copy' as const, learnedDay: 1,
        sourcePersonId: INITIAL_PERSON_ID,
      } } } };
    expect(validateInstitutionalResponseEvent(workerOnly, makeVerification({ recordId: workerRecordId }))?.toLowerCase()).toContain('independent observed assertion');

    const workerAppointmentId = 'appointment-worker-verifier' as AppointmentId;
    const selfVerifying = { ...base, world: { ...base.world,
      appointments: { ...base.world.appointments, [workerAppointmentId]: {
        id: workerAppointmentId, personId: workerId, institutionId: STOREHOUSE_INSTITUTION_ID, title: 'Worker Verifier',
        authorityScope: ['Verify execution'], responsibilities: ['Inspect completed work'],
        authorityCapabilities: ['verify_institutional_execution' as const], startDay: 1,
      } },
      knowledge: { ...base.world.knowledge, ['knowledge-worker-inspection' as KnowledgeEntryId]: {
        id: 'knowledge-worker-inspection' as KnowledgeEntryId, holder: { kind: 'person' as const, id: workerId },
        subject: { kind: 'record' as const, id: recordId }, basis: 'received-copy' as const, learnedDay: 1,
        sourcePersonId: INITIAL_PERSON_ID,
      } },
    } };
    expect(validateInstitutionalResponseEvent(selfVerifying, makeVerification({ actorPersonId: workerId,
      appointmentId: workerAppointmentId }))?.toLowerCase()).toContain('cannot independently verify');

    const rejectedVerification = makeVerification({ decision: 'verification_rejected',
      verification: { executionEventId: executionId, outcome: 'rejected', rationale: 'The observed condition contradicts the reported result.' } });
    const withRejected = { ...base, world: { ...base.world, events: { ...base.world.events, [rejectedVerification.id]: rejectedVerification } } };
    const makeResolution = (disposition: 'accepted_verification' | 'escalated_override', rationale: string, decision: 'resolved' | 'escalated_override' = disposition === 'accepted_verification' ? 'resolved' : 'escalated_override'): WorldEvent => ({
      id: 'event-validation-resolution' as EventId, dayNumber: 1, summary: 'An authorized official records final disposition.',
      personIds: [verifierId], institutionIds: [STOREHOUSE_INSTITUTION_ID], locationId: NORTH_BAY_LOCATION_ID,
      institutionalResponse: { matterId: MATTER_IDS.roofRepair, stage: 'resolution', actorPersonId: verifierId,
        appointmentId: seniorAppointment, recordId, precedingEventId: rejectedVerification.id, decision,
        resolution: { verificationEventId: rejectedVerification.id, disposition, rationale } },
    });
    expect(validateInstitutionalResponseEvent(withRejected, makeResolution('accepted_verification', 'Routine disposition.'))?.toLowerCase()).toContain('requires the specific accepted');
    expect(validateInstitutionalResponseEvent(withRejected, makeResolution('escalated_override', 'Override.'))?.toLowerCase()).toContain('substantive recorded escalation');
    expect(validateInstitutionalResponseEvent(withRejected, makeResolution('escalated_override', 'Senior review authorizes an explicit escalation override.'))).toBeNull();

    const acceptedVerification = makeVerification();
    const withAccepted = { ...base, world: { ...base.world, events: { ...base.world.events, [acceptedVerification.id]: acceptedVerification } } };
    const acceptedResolution: WorldEvent = { ...makeResolution('accepted_verification', 'Accepted verification is entered as final disposition.'),
      institutionalResponse: { ...makeResolution('accepted_verification', 'Accepted verification is entered as final disposition.').institutionalResponse!,
        precedingEventId: acceptedVerification.id,
        resolution: { verificationEventId: acceptedVerification.id, disposition: 'accepted_verification',
          rationale: 'Accepted verification is entered as final disposition.' } },
    };
    expect(validateInstitutionalResponseEvent(withAccepted, acceptedResolution)).toBeNull();
    const duplicateResolution = { ...withAccepted, world: { ...withAccepted.world, events: {
      ...withAccepted.world.events, ['event-prior-resolution' as EventId]: acceptedResolution,
    } } };
    expect(validateInstitutionalResponseEvent(duplicateResolution, { ...acceptedResolution, id: 'event-duplicate-resolution' as EventId })?.toLowerCase()).toContain('already has a final disposition');
  });
  it('generates the post-execution Assignment and files independent evidence before NPC verification', () => {
    const firstDay = transitionGame(stateWithExecution(false), { type: 'END_DAY', expectedDayNumber: 1 });
    const offer = Object.values(firstDay.state.opportunities.assignments).find((item) =>
      item.activityId === NORTH_BAY_POST_EXECUTION_ACTIVITY_ID && item.originMatterId === MATTER_IDS.roofRepair);
    expect(offer).toBeDefined();
    expect(offer?.title).toBe('Post-Execution North-Bay Inspection');
    expect(offer?.status).toBe('offered');
    const accepted = transitionGame(firstDay.state, { type: 'ACCEPT_ASSIGNMENT', assignmentId: offer!.id });
    expect(accepted.feedback?.code).toBe('assignment-accepted');
    let state = accepted.state;
    for (const actionId of ['inspect-completed-work', 'review-execution-record']) {
      const performed = transitionGame(state, { type: 'PERFORM_ASSIGNMENT_ACTIVITY_ACTION', assignmentId: offer!.id, actionId });
      expect(performed.feedback?.code).toBe('assignment-activity-action-completed');
      state = performed.state;
    }
    const activeOffer = state.opportunities.assignments[offer!.id];
    const draft = {
      ...activeOffer.activityProgress!.draft,
      finding: 'channel_clear_beam_followup',
      responsibilityClaim: 'none',
      citedDiscoveryIds: ['post-execution-observation', 'post-execution-record'],
      limitations: ['The beam joint remains damp and must be assessed again after drying.'],
      recommendations: ['accept_execution_with_followup', 'inspect_beam_after_drying'],
    };
    const drafted = transitionGame(state, { type: 'UPDATE_ASSIGNMENT_ACTIVITY_DRAFT', assignmentId: offer!.id, draft });
    expect(drafted.feedback?.code).toBe('assignment-activity-draft-updated');
    const submitted = transitionGame(drafted.state, { type: 'SUBMIT_ASSIGNMENT_ACTIVITY', assignmentId: offer!.id });
    expect(submitted.feedback?.code).toBe('assignment-activity-submitted');
    const filedRecord = Object.values(submitted.state.records.entries).find((record) =>
      record.title === 'North-Bay Post-Execution Inspection Record');
    expect(filedRecord?.assertions.some((assertion) => assertion.classification === 'observed')).toBe(true);
    expect(Object.values(submitted.state.world.knowledge).some((entry) => entry.holder.kind === 'person'
      && entry.holder.id === verifierId && entry.subject.kind === 'record' && entry.subject.id === filedRecord?.id)).toBe(true);
    expect(submitted.state.opportunities.assignments[offer!.id].status).toBe('completed');

    const settled = transitionGame(submitted.state, { type: 'END_DAY', expectedDayNumber: 2 });
    const verification = Object.values(settled.state.world.events).find((event) => event.institutionalResponse?.stage === 'verification');
    const resolution = Object.values(settled.state.world.events).find((event) => event.institutionalResponse?.stage === 'resolution');
    expect(verification?.institutionalResponse?.verification?.outcome).toBe('accepted');
    expect(verification?.institutionalResponse?.recordId).toBe(filedRecord?.id);
    expect(resolution?.institutionalResponse?.resolution?.verificationEventId).toBe(verification?.id);
    expect(settled.state.world.matters[MATTER_IDS.roofRepair].status).toBe('resolved');
  });
});
