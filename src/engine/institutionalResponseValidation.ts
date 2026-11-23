import type { EventId, KnowledgeEntryId, MatterId, RecordId } from '../state/ids';
import type { GameState, RecordEntry, WorldEvent } from '../state/types';

function nonEmpty(value: unknown): value is string {
  return typeof value === 'string' && !!value.trim();
}

function authorizedMaintenance(state: GameState, eventId: EventId | undefined, matterId: MatterId, recordId: RecordId) {
  if (!eventId) return null;
  const event = state.world.events[eventId];
  const response = event?.institutionalResponse;
  if (!event || response?.stage !== 'authorization' || response.decision !== 'authorized'
    || response.matterId !== matterId || response.recordId !== recordId
    || response.authorizedAction !== 'routine_storehouse_maintenance' || !nonEmpty(response.scope)) return null;
  return { event, response };
}

function recordAssertions(record: RecordEntry) {
  return [
    ...record.assertions,
    ...record.amendments.flatMap((amendment) => amendment.assertionsAdded),
  ];
}

function recordSources(record: RecordEntry) {
  return [
    ...record.sources,
    ...record.amendments.flatMap((amendment) => amendment.sourcesAdded),
  ];
}

/** A verification record must contain an observed assertion supported by a source independent of the worker and execution event. */
export function hasIndependentObservation(record: RecordEntry, workerPersonId: string, executionEventId: EventId): boolean {
  const sources = new Map(recordSources(record).map((source) => [source.id, source]));
  return recordAssertions(record).some((assertion) => assertion.classification === 'observed'
    && assertion.sourceIds.some((sourceId) => {
      const source = sources.get(sourceId);
      if (!source) return false;
      if (source.kind === 'person') return !!source.sourceId && source.sourceId !== workerPersonId;
      if (source.kind === 'material') return source.sourceId !== executionEventId;
      return false;
    }));
}

function executionForAssignment(state: GameState, assignmentEventId: EventId) {
  return Object.values(state.world.events).find((event) =>
    event.institutionalResponse?.stage === 'execution'
    && event.institutionalResponse.precedingEventId === assignmentEventId);
}

function priorAuthorizationHasFailedExecution(state: GameState, authorizationEventId: EventId): boolean {
  return Object.values(state.world.events).some((event) => {
    const response = event.institutionalResponse;
    if (response?.stage !== 'commitment' || response.precedingEventId !== authorizationEventId) return false;
    const execution = executionForAssignment(state, event.id);
    if (!execution) return false;
    return Object.values(state.world.events).some((verification) =>
      verification.institutionalResponse?.stage === 'verification'
      && verification.institutionalResponse.verification?.executionEventId === execution.id
      && verification.institutionalResponse.verification.outcome !== 'accepted');
  });
}

/** Validates the authority, commitment, evidence, verification, and resolution chain. */
export function validateInstitutionalResponseEvent(state: GameState, event: WorldEvent): string | null {
  const response = event.institutionalResponse;
  if (response === undefined) return null;
  if (!response || typeof response !== 'object') return 'The institutional response payload is malformed.';

  const matter = state.world.matters[response.matterId];
  const record = state.records.entries[response.recordId];
  const appointment = state.world.appointments[response.appointmentId];
  const persistedEvent = !!state.world.events[event.id];
  if (!matter || (matter.status === 'resolved' && !persistedEvent)) return 'An institutional response must refer to an existing unresolved matter.';
  if (!record || record.institutionId !== matter.institutionId
    || (matter.sourceRecordId !== record.id && !(matter.provenance ?? []).some((source) => source.sourceId === record.id))) {
    return 'The response record must belong to the matter’s institution and be recorded as matter provenance.';
  }
  if (event.dayNumber < matter.createdDay || event.dayNumber < record.createdDay) {
    return 'An institutional response cannot predate its matter or supporting record.';
  }
  if (!state.world.people[response.actorPersonId] || !event.personIds.includes(response.actorPersonId)
    || !event.institutionIds.includes(matter.institutionId)
    || (matter.locationId && event.locationId && event.locationId !== matter.locationId)) {
    return 'The response event must identify its actor, owning institution, and a consistent location.';
  }
  if (!appointment || appointment.personId !== response.actorPersonId || appointment.institutionId !== matter.institutionId
    || appointment.startDay > event.dayNumber || (appointment.endDay !== undefined && appointment.endDay < event.dayNumber)) {
    return 'The response must be made by a person holding an active appointment at the matter’s institution.';
  }
  const knowsRecord = Object.values(state.world.knowledge).some((entry) =>
    !!entry && typeof entry === 'object' && !!entry.holder && !!entry.subject
    && entry.holder.kind === 'person' && entry.holder.id === response.actorPersonId
    && entry.subject.kind === 'record' && entry.subject.id === record.id);
  if (!knowsRecord) return 'The appointed actor must have explicit knowledge of the record being assessed or acted upon.';

  if (response.stage === 'assessment') {
    if (!appointment.authorityCapabilities?.includes('assess_institutional_reports')) {
      return 'This appointment does not authorize assessment of institutional reports.';
    }
    if (!['accepted_for_action','request_more_evidence','referred','declined'].includes(response.decision)
      || response.precedingEventId !== undefined || response.authorizedAction !== undefined || response.scope !== undefined
      || response.assigneePersonId !== undefined || response.commitmentId !== undefined || response.execution !== undefined
      || response.verification !== undefined || response.resolution !== undefined) {
      return 'An assessment needs a valid assessment decision and cannot contain authorization, execution, verification, or resolution fields.';
    }
    return null;
  }

  if (response.stage === 'authorization') {
    if (matter.kind !== 'roof_repair_verification') return 'Routine storehouse maintenance authorization is only defined for the North-Bay roof matter in this phase.';
    if (!appointment.authorityCapabilities?.includes('authorize_routine_storehouse_maintenance')) {
      return 'This appointment does not authorize routine storehouse maintenance.';
    }
    if (!response.precedingEventId) return 'An authorization must identify the preceding assessment event.';
    const assessment = state.world.events[response.precedingEventId];
    const prior = assessment?.institutionalResponse;
    if (!assessment || assessment.dayNumber > event.dayNumber || prior?.stage !== 'assessment'
      || prior.decision !== 'accepted_for_action' || prior.matterId !== matter.id || prior.recordId !== record.id) {
      return 'An authorization requires a prior accepted assessment of the same matter and report.';
    }
    if (!['authorized','authorization_declined'].includes(response.decision)
      || response.assigneePersonId !== undefined || response.commitmentId !== undefined || response.execution !== undefined
      || response.verification !== undefined || response.resolution !== undefined) {
      return 'An authorization event needs an authorization decision and cannot contain assignment, execution, verification, or resolution fields.';
    }
    if (response.decision === 'authorized'
      && (response.authorizedAction !== 'routine_storehouse_maintenance' || !nonEmpty(response.scope))) {
      return 'A maintenance authorization must identify its authorized action and specific scope.';
    }
    if (response.decision === 'authorization_declined'
      && (response.authorizedAction !== undefined || response.scope !== undefined)) {
      return 'A declined authorization cannot carry an authorized action or scope.';
    }
    const alreadyAuthorized = Object.values(state.world.events).some((existing) => {
      const priorResponse = existing?.institutionalResponse;
      return !!existing && existing.id !== event.id && priorResponse?.stage === 'authorization'
        && priorResponse.decision === 'authorized' && priorResponse.matterId === matter.id
        && priorResponse.recordId === record.id && !priorAuthorizationHasFailedExecution(state, existing.id);
    });
    if (alreadyAuthorized) return 'This report already has an active maintenance authorization; a new authorization requires a rejected or inconclusive prior execution.';
    return null;
  }

  if (response.stage === 'commitment') {
    if (matter.kind !== 'roof_repair_verification'
      || !appointment.authorityCapabilities?.includes('authorize_routine_storehouse_maintenance')) {
      return 'This appointment cannot assign routine North-Bay maintenance.';
    }
    const authorization = authorizedMaintenance(state, response.precedingEventId, matter.id, record.id);
    if (!authorization || authorization.event.dayNumber > event.dayNumber
      || authorization.response.scope !== response.scope
      || response.authorizedAction !== 'routine_storehouse_maintenance') {
      return 'A maintenance assignment must cite the matching prior authorization and preserve its exact scope.';
    }
    const assignee = response.assigneePersonId ? state.world.people[response.assigneePersonId] : undefined;
    if (!assignee?.alive || !assignee.affiliations.includes(matter.institutionId)
      || !event.personIds.includes(assignee.id) || !nonEmpty(response.commitmentId)
      || response.decision !== 'assigned' || response.execution !== undefined
      || response.verification !== undefined || response.resolution !== undefined) {
      return 'A maintenance assignment must identify a living, affiliated worker and a unique commitment.';
    }
    const duplicateCommitment = Object.values(state.world.events).some((existing) => !!existing && existing.id !== event.id
      && existing.institutionalResponse?.stage === 'commitment'
      && existing.institutionalResponse.commitmentId === response.commitmentId);
    const activeMatterAssignment = (assignee.commitments ?? []).some((commitment) =>
      commitment.status === 'active' && commitment.relatedMatterIds?.includes(matter.id)
      && !(commitment.id === response.commitmentId && commitment.basis.kind === 'event' && commitment.basis.id === event.id));
    const commitmentIdUsed = Object.values(state.world.people).some((person) =>
      (person.commitments ?? []).some((commitment) => commitment.id === response.commitmentId
        && !(person.id === assignee.id && commitment.basis.kind === 'event' && commitment.basis.id === event.id)));
    const knowledgeId = `knowledge-${response.commitmentId}-report`;
    if (duplicateCommitment || activeMatterAssignment || commitmentIdUsed
      || (!persistedEvent && state.world.knowledge[knowledgeId as KnowledgeEntryId])) {
      return 'This maintenance commitment identifier is already in use or the worker already has an active commitment for this matter.';
    }
    if (persistedEvent) {
      const persisted = assignee.commitments?.find((item) => item.id === response.commitmentId);
      const hasExecution = Object.values(state.world.events).some((existing) => existing?.institutionalResponse?.stage === 'execution'
        && existing.institutionalResponse.commitmentId === response.commitmentId);
      const knowledge = state.world.knowledge[knowledgeId as KnowledgeEntryId];
      if (!persisted || persisted.kind !== 'allocation' || !['active','fulfilled'].includes(persisted.status)
        || (persisted.status === 'fulfilled') !== hasExecution
        || persisted.basis.kind !== 'event' || persisted.basis.id !== event.id
        || !persisted.relatedMatterIds?.includes(matter.id) || persisted.institutionId !== matter.institutionId
        || !knowledge || knowledge.holder.kind !== 'person' || knowledge.holder.id !== assignee.id
        || knowledge.subject.kind !== 'record' || knowledge.subject.id !== record.id) {
        return 'A recorded assignment must have its matching worker commitment and report knowledge.';
      }
    }
    return null;
  }

  if (response.stage === 'execution') {
    if (!appointment.authorityCapabilities?.includes('authorize_routine_storehouse_maintenance')) {
      return 'This appointment does not authorize recording routine storehouse maintenance execution.';
    }
    if (!response.precedingEventId || !response.commitmentId || !response.assigneePersonId) {
      return 'An execution record must identify its assignment event, commitment, and worker.';
    }
    const assignment = state.world.events[response.precedingEventId];
    const assigned = assignment?.institutionalResponse;
    const authorization = authorizedMaintenance(state, assigned?.precedingEventId, matter.id, record.id);
    if (!assignment || assignment.dayNumber > event.dayNumber || assigned?.stage !== 'commitment'
      || assigned.decision !== 'assigned' || assigned.matterId !== matter.id || assigned.recordId !== record.id
      || assigned.assigneePersonId !== response.assigneePersonId || assigned.commitmentId !== response.commitmentId
      || assigned.scope !== response.scope || assigned.authorizedAction !== response.authorizedAction
      || !authorization || authorization.response.scope !== response.scope) {
      return 'Execution must follow the matching assignment and remain within the exact authorized scope.';
    }
    const worker = state.world.people[response.assigneePersonId];
    const commitment = worker?.commitments?.find((item) => item.id === response.commitmentId);
    if (!worker?.alive || !commitment || !['active','fulfilled'].includes(commitment.status)
      || commitment.basis.kind !== 'event' || commitment.basis.id !== assignment.id
      || !commitment.relatedMatterIds?.includes(matter.id) || commitment.institutionId !== matter.institutionId) {
      return 'Execution requires the worker’s active commitment created by the cited assignment.';
    }
    if (response.decision !== 'executed' || !response.execution
      || !nonEmpty(response.execution.workPerformed) || response.execution.workPerformed !== response.scope
      || !nonEmpty(response.execution.laborBasis) || !nonEmpty(response.execution.materialsBasis)
      || !nonEmpty(response.execution.result) || response.assigneePersonId === response.actorPersonId
      || response.verification !== undefined || response.resolution !== undefined) {
      return 'Execution must record work performed, allocated labor, materials, and result, and must be recorded by someone other than the worker.';
    }
    const alreadyExecuted = Object.values(state.world.events).some((existing) => !!existing && existing.id !== event.id
      && existing.institutionalResponse?.stage === 'execution'
      && existing.institutionalResponse.commitmentId === response.commitmentId);
    if (alreadyExecuted) return 'This maintenance commitment already has an execution record.';
    return null;
  }

  if (response.stage === 'verification') {
    const verification = response.verification;
    if (!appointment.authorityCapabilities?.includes('verify_institutional_execution')) {
      return 'This appointment does not authorize independent verification of institutional execution.';
    }
    if (!verification || !response.precedingEventId || response.precedingEventId !== verification.executionEventId
      || response.execution !== undefined || response.resolution !== undefined
      || !['accepted','rejected','inconclusive'].includes(verification.outcome)
      || !nonEmpty(verification.rationale)) {
      return 'Verification must identify one execution event, an outcome, and a reason, without unrelated response fields.';
    }
    const executionEvent = state.world.events[verification.executionEventId];
    const execution = executionEvent?.institutionalResponse;
    if (!executionEvent || executionEvent.dayNumber > event.dayNumber || execution?.stage !== 'execution'
      || execution.matterId !== matter.id || !execution.assigneePersonId) {
      return 'Verification requires a recorded execution for the same matter.';
    }
    if (execution.assigneePersonId === response.actorPersonId) {
      return 'The worker who executed the task cannot independently verify that execution.';
    }
    if (record.createdDay < executionEvent.dayNumber
      || !hasIndependentObservation(record, execution.assigneePersonId, executionEvent.id)) {
      return 'Verification requires a same-day-or-later inspection record with an independent observed assertion.';
    }
    const expectedDecision = verification.outcome === 'accepted' ? 'verified'
      : verification.outcome === 'rejected' ? 'verification_rejected' : 'verification_inconclusive';
    if (response.decision !== expectedDecision) return 'The verification decision must match its recorded outcome.';
    const duplicate = Object.values(state.world.events).some((existing) => !!existing && existing.id !== event.id
      && existing.institutionalResponse?.stage === 'verification'
      && existing.institutionalResponse.verification?.executionEventId === verification.executionEventId);
    if (duplicate) return 'This execution event already has a verification decision.';
    return null;
  }

  if (response.stage === 'resolution') {
    const resolution = response.resolution;
    if (!appointment.authorityCapabilities?.includes('resolve_institutional_matters')) {
      return 'This appointment does not authorize final institutional disposition.';
    }
    if (!resolution || !response.precedingEventId || response.precedingEventId !== resolution.verificationEventId
      || response.execution !== undefined || response.verification !== undefined || !nonEmpty(resolution.rationale)) {
      return 'Resolution must identify a specific verification event and a reason.';
    }
    const verificationEvent = state.world.events[resolution.verificationEventId];
    const verificationResponse = verificationEvent?.institutionalResponse;
    const verification = verificationResponse?.verification;
    if (!verificationEvent || verificationEvent.dayNumber > event.dayNumber || verificationResponse?.stage !== 'verification'
      || verificationResponse.matterId !== matter.id || verificationResponse.recordId !== record.id) {
      return 'Resolution requires a prior verification event for the same matter and evidence record.';
    }
    if (resolution.disposition === 'accepted_verification') {
      if (verification?.outcome !== 'accepted' || response.decision !== 'resolved') {
        return 'Ordinary resolution requires the specific accepted verification event.';
      }
    } else if (resolution.disposition === 'escalated_override') {
      if (!['rejected','inconclusive'].includes(verification?.outcome ?? '')
        || response.decision !== 'escalated_override' || resolution.rationale.trim().length < 12) {
        return 'An override requires a rejected or inconclusive verification and a substantive recorded escalation rationale.';
      }
    } else return 'The resolution disposition is not supported.';
    const duplicate = Object.values(state.world.events).some((existing) => !!existing && existing.id !== event.id
      && existing.institutionalResponse?.stage === 'resolution'
      && existing.institutionalResponse.resolution?.verificationEventId === resolution.verificationEventId);
    if (duplicate) return 'This verification event already has a final disposition.';
    return null;
  }

  return 'The institutional response stage is not supported.';
}

/** Apply durable lifecycle effects after a validated response event is appended. */
export function applyInstitutionalResponseEvent(state: GameState, event: WorldEvent): GameState {
  const response = event.institutionalResponse;
  if (!response) return state;
  const workerId = response.assigneePersonId;
  if (response.stage === 'commitment' && workerId && response.commitmentId) {
    const worker = state.world.people[workerId];
    if (!worker) return state;
    const commitment = {
      id: response.commitmentId,
      kind: 'allocation' as const,
      summary: `Carry out the authorized North-Bay maintenance: ${response.scope ?? 'routine maintenance'}`,
      basis: { kind: 'event' as const, id: event.id },
      createdDay: event.dayNumber,
      status: 'active' as const,
      visibility: 'public' as const,
      institutionId: response.matterId ? state.world.matters[response.matterId]?.institutionId : undefined,
      relatedMatterIds: [response.matterId],
    };
    const knowledgeId = `knowledge-${response.commitmentId}-report`;
    return {
      ...state,
      world: {
        ...state.world,
        people: { ...state.world.people, [workerId]: { ...worker, commitments: [...(worker.commitments ?? []), commitment] } },
        knowledge: {
          ...state.world.knowledge,
          [knowledgeId]: {
            id: knowledgeId as KnowledgeEntryId,
            holder: { kind: 'person', id: workerId },
            subject: { kind: 'record', id: response.recordId },
            basis: 'received-copy',
            learnedDay: event.dayNumber,
            sourcePersonId: response.actorPersonId,
          },
        },
      },
    };
  }
  if (response.stage === 'execution' && workerId && response.commitmentId) {
    const worker = state.world.people[workerId];
    if (!worker?.commitments) return state;
    return {
      ...state,
      world: {
        ...state.world,
        people: { ...state.world.people, [workerId]: {
          ...worker,
          commitments: worker.commitments.map((commitment) => commitment.id === response.commitmentId
            ? { ...commitment, status: 'fulfilled' as const }
            : commitment),
        } },
      },
    };
  }
  if (response.stage === 'verification' && response.verification?.outcome !== 'accepted') {
    const matter = state.world.matters[response.matterId];
    const institution = matter ? state.world.institutions[matter.institutionId] : undefined;
    if (!matter || !institution) return state;
    return { ...state, world: {
      ...state.world,
      institutions: { ...state.world.institutions, [institution.id]: {
        ...institution, activeMatters: institution.activeMatters.includes(matter.id)
          ? institution.activeMatters : [...institution.activeMatters, matter.id],
      } },
    } };
  }
  if (response.stage === 'resolution') {
    const matter = state.world.matters[response.matterId];
    const institution = matter ? state.world.institutions[matter.institutionId] : undefined;
    if (!matter || !institution) return state;
    return { ...state, world: {
      ...state.world,
      matters: { ...state.world.matters, [matter.id]: { ...matter, status: 'resolved' } },
      institutions: { ...state.world.institutions, [institution.id]: {
        ...institution, activeMatters: institution.activeMatters.filter((matterId) => matterId !== matter.id),
      } },
    } };
  }
  return state;
}
