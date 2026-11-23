import type { GameState, WorldEvent } from '../state/types';

/**
 * Validates the institutional authority and evidence chain attached to a response event.
 * Generic world events remain unaffected; only events carrying institutionalResponse
 * are subject to this stricter contract.
 */
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
      || response.precedingEventId !== undefined || response.authorizedAction !== undefined || response.scope !== undefined) {
      return 'An assessment needs a valid assessment decision and cannot contain authorization fields.';
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
    if (!['authorized','authorization_declined'].includes(response.decision)) {
      return 'An authorization event needs an authorization decision.';
    }
    if (response.decision === 'authorized'
      && (response.authorizedAction !== 'routine_storehouse_maintenance' || typeof response.scope !== 'string' || !response.scope.trim())) {
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

  return 'The institutional response stage is not supported.';
}
