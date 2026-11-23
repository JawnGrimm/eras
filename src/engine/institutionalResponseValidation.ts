import type { GameState, WorldEvent } from '../state/types';

function nonEmpty(value: unknown): value is string {
  return typeof value === 'string' && !!value.trim();
}

function authorizedMaintenance(state: GameState, eventId: string | undefined, matterId: string, recordId: string) {
  if (!eventId) return null;
  const event = state.world.events[eventId];
  const response = event?.institutionalResponse;
  if (!event || response?.stage !== 'authorization' || response.decision !== 'authorized'
    || response.matterId !== matterId || response.recordId !== recordId
    || response.authorizedAction !== 'routine_storehouse_maintenance' || !nonEmpty(response.scope)) return null;
  return { event, response };
}

/** Validates the authority, commitment, and evidence chain for institutional responses. */
export function validateInstitutionalResponseEvent(state: GameState, event: WorldEvent): string | null {
  const response = event.institutionalResponse;
  if (response === undefined) return null;
  if (!response || typeof response !== 'object') return 'The institutional response payload is malformed.';

  const matter = state.world.matters[response.matterId];
  const record = state.records.entries[response.recordId];
  const appointment = state.world.appointments[response.appointmentId];
  if (!matter || matter.status !== 'active') return 'An institutional response must refer to an existing active matter.';
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
  if (!knowsRecord) return 'The appointed actor must have an explicit knowledge entry for the report being assessed or acted upon.';

  if (response.stage === 'assessment') {
    if (!appointment.authorityCapabilities?.includes('assess_institutional_reports')) {
      return 'This appointment does not authorize assessment of institutional reports.';
    }
    if (!['accepted_for_action','request_more_evidence','referred','declined'].includes(response.decision)
      || response.precedingEventId !== undefined || response.authorizedAction !== undefined || response.scope !== undefined
      || response.assigneePersonId !== undefined || response.commitmentId !== undefined || response.execution !== undefined) {
      return 'An assessment needs a valid assessment decision and cannot contain authorization or execution fields.';
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
      || response.assigneePersonId !== undefined || response.commitmentId !== undefined || response.execution !== undefined) {
      return 'An authorization event needs an authorization decision and cannot contain assignment or execution fields.';
    }
    if (response.decision === 'authorized'
      && (response.authorizedAction !== 'routine_storehouse_maintenance' || !nonEmpty(response.scope))) {
      return 'A maintenance authorization must identify its authorized action and specific scope.';
    }
    if (response.decision === 'authorization_declined'
      && (response.authorizedAction !== undefined || response.scope !== undefined)) {
      return 'A declined authorization cannot carry an authorized action or scope.';
    }
    const alreadyAuthorized = Object.values(state.world.events).some((existing) => !!existing && existing.id !== event.id
      && existing.institutionalResponse?.stage === 'authorization'
      && existing.institutionalResponse.decision === 'authorized'
      && existing.institutionalResponse.matterId === matter.id
      && existing.institutionalResponse.recordId === record.id);
    if (alreadyAuthorized) return 'This report already has an active maintenance authorization.';
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
      || response.decision !== 'assigned' || response.execution !== undefined) {
      return 'A maintenance assignment must identify a living, affiliated worker and a unique commitment.';
    }
    const duplicate = Object.values(state.world.events).some((existing) => !!existing && existing.id !== event.id
      && existing.institutionalResponse?.stage === 'commitment'
      && (existing.institutionalResponse.commitmentId === response.commitmentId
        || (existing.institutionalResponse.matterId === matter.id && existing.institutionalResponse.assigneePersonId === assignee.id)));
    const commitmentIdUsed = Object.values(state.world.people).some((person) =>
      (person.commitments ?? []).some((commitment) => commitment.id === response.commitmentId
        && !(person.id === assignee.id && commitment.basis.kind === 'event' && commitment.basis.id === event.id)));
    if (duplicate || commitmentIdUsed) return 'This maintenance commitment identifier or worker assignment is already in use.';
    // Once persisted, the assignment event and the worker's typed commitment must exist together.
    if (state.world.events[event.id]) {
      const persisted = assignee.commitments?.find((item) => item.id === response.commitmentId);
      const hasExecution = Object.values(state.world.events).some((existing) => existing?.institutionalResponse?.stage === 'execution'
        && existing.institutionalResponse.commitmentId === response.commitmentId);
      if (!persisted || persisted.kind !== 'allocation' || !['active','fulfilled'].includes(persisted.status)
        || (persisted.status === 'fulfilled') !== hasExecution
        || persisted.basis.kind !== 'event' || persisted.basis.id !== event.id
        || !persisted.relatedMatterIds?.includes(matter.id) || persisted.institutionId !== matter.institutionId) {
        return 'A recorded assignment must have its matching active or executed worker commitment.';
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
      || !nonEmpty(response.execution.workPerformed) || !nonEmpty(response.execution.laborBasis)
      || !nonEmpty(response.execution.materialsBasis) || !nonEmpty(response.execution.result)
      || response.assigneePersonId === response.actorPersonId) {
      return 'Execution must record work performed, allocated labor, allocated materials, and the result.';
    }
    const alreadyExecuted = Object.values(state.world.events).some((existing) => !!existing && existing.id !== event.id
      && existing.institutionalResponse?.stage === 'execution'
      && existing.institutionalResponse.commitmentId === response.commitmentId);
    if (alreadyExecuted) return 'This maintenance commitment already has an execution record.';
    return null;
  }

  return 'The institutional response stage is not supported.';
}

/** Apply the commitment lifecycle effect after a validated event is appended. */
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
            id: knowledgeId as import('../state/ids').KnowledgeEntryId,
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
  return state;
}
