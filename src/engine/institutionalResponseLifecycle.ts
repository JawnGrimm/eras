import type { EventId, PersonId } from '../state/ids';
import type { GameState, InstitutionalAuthorityCapability, InstitutionalMatter, InstitutionalResponse, RecordEntry, WorldEvent } from '../state/types';
import { NORTH_BAY_POST_EXECUTION_ACTIVITY_ID } from '../content/assignments/northBayRoofInspection';
import { applyInstitutionalResponseEvent, hasIndependentObservation, validateInstitutionalResponseEvent } from './institutionalResponseValidation';

function knowsRecord(state: GameState, personId: PersonId, recordId: RecordEntry['id']): boolean {
  return Object.values(state.world.knowledge).some((entry) => entry
    && entry.holder.kind === 'person' && entry.holder.id === personId
    && entry.subject.kind === 'record' && entry.subject.id === recordId);
}

function eligibleAppointment(
  state: GameState,
  matter: InstitutionalMatter,
  capability: InstitutionalAuthorityCapability,
  dayNumber: number,
  excludedPersonId?: PersonId,
  recordId?: RecordEntry['id'],
) {
  return Object.values(state.world.appointments)
    .filter((appointment) => appointment.institutionId === matter.institutionId
      && appointment.authorityCapabilities?.includes(capability)
      && appointment.startDay <= dayNumber
      && (appointment.endDay === undefined || appointment.endDay >= dayNumber)
      && appointment.personId !== excludedPersonId
      && !!state.world.people[appointment.personId]?.alive
      && (!recordId || knowsRecord(state, appointment.personId, recordId)))
    .sort((a, b) => a.id.localeCompare(b.id))[0];
}

function hasAcceptedPlayerCommitment(state: GameState, matterId: InstitutionalMatter['id']): boolean {
  return Object.values(state.opportunities.assignments).some((offer) =>
    offer.status === 'accepted' && offer.originMatterId === matterId
      && offer.activityId === NORTH_BAY_POST_EXECUTION_ACTIVITY_ID);
}

function hasDisputedAssertion(record: RecordEntry): boolean {
  return [...record.assertions, ...record.amendments.flatMap((amendment) => amendment.assertionsAdded)]
    .some((assertion) => assertion.classification === 'disputed');
}

function appendResponse(state: GameState, event: WorldEvent): GameState {
  if (validateInstitutionalResponseEvent(state, event)) return state;
  const appended = {
    ...state,
    world: { ...state.world, events: { ...state.world.events, [event.id]: event } },
  };
  return applyInstitutionalResponseEvent(appended, event);
}

/**
 * Bounded END_DAY processing for institutional execution.
 *
 * NPCs may act only when an unresolved matter has a recorded execution, a qualifying
 * post-execution independent observation, explicit knowledge of that record, and an
 * active appointment with the required capability. An accepted player Assignment
 * owns the matter until the player completes or releases that commitment.
 */
export function advanceInstitutionalResponses(state: GameState, dayNumber: number): GameState {
  let next = state;
  const executions = Object.values(state.world.events)
    .filter((event) => event.institutionalResponse?.stage === 'execution')
    .sort((a, b) => a.dayNumber - b.dayNumber || a.id.localeCompare(b.id));

  for (const executionEvent of executions) {
    const execution = executionEvent.institutionalResponse!;
    const matter = next.world.matters[execution.matterId];
    if (!matter || matter.status === 'resolved' || hasAcceptedPlayerCommitment(next, matter.id)) continue;

    const priorVerifications = Object.values(next.world.events).filter((event) =>
      event.institutionalResponse?.stage === 'verification'
      && event.institutionalResponse.verification?.executionEventId === executionEvent.id);
    let acceptedVerification = priorVerifications.find((event) =>
      event.institutionalResponse?.verification?.outcome === 'accepted');

    if (priorVerifications.length === 0) {
      const evidence = Object.values(next.records.entries)
        .filter((record) => record.institutionId === matter.institutionId
          && record.createdDay >= executionEvent.dayNumber
          && hasIndependentObservation(record, execution.assigneePersonId!, executionEvent.id))
        .sort((a, b) => a.createdDay - b.createdDay || a.id.localeCompare(b.id))[0];
      if (!evidence) continue;

      const appointment = eligibleAppointment(next, matter, 'verify_institutional_execution',
        dayNumber, execution.assigneePersonId, evidence.id);
      if (!appointment) continue;

      const outcome = hasDisputedAssertion(evidence) ? 'inconclusive' : 'accepted';
      const response: InstitutionalResponse = {
        matterId: matter.id,
        stage: 'verification',
        actorPersonId: appointment.personId,
        appointmentId: appointment.id,
        recordId: evidence.id,
        precedingEventId: executionEvent.id,
        decision: outcome === 'accepted' ? 'verified' : 'verification_inconclusive',
        verification: {
          executionEventId: executionEvent.id,
          outcome,
          rationale: outcome === 'accepted'
            ? 'A post-execution record contains an observed assertion supported by a source independent of the worker and execution event.'
            : 'The post-execution inspection record contains disputed assertions; the available evidence does not support an unqualified acceptance.',
        },
      };
      const id = `event-institutional-verification-${executionEvent.id}` as EventId;
      const event: WorldEvent = {
        id,
        dayNumber,
        summary: outcome === 'accepted'
          ? 'An authorized official accepted the independent post-execution inspection evidence.'
          : 'An authorized official recorded an inconclusive verification because the inspection record contains disputed assertions.',
        personIds: [appointment.personId],
        institutionIds: [matter.institutionId],
        ...(matter.locationId ? { locationId: matter.locationId } : {}),
        institutionalResponse: response,
      };
      const before = next;
      next = appendResponse(next, event);
      if (next === before) continue;
      if (outcome !== 'accepted') continue;
      acceptedVerification = event;
    }

    if (!acceptedVerification) continue;
    const verificationResponse = acceptedVerification.institutionalResponse!;
    const recordId = verificationResponse.recordId;
    const resolutionAppointment = eligibleAppointment(next, matter, 'resolve_institutional_matters',
      dayNumber, undefined, recordId);
    if (!resolutionAppointment) continue;

    const resolutionId = `event-institutional-resolution-${executionEvent.id}` as EventId;
    if (next.world.events[resolutionId]) continue;
    const resolution: InstitutionalResponse = {
      matterId: matter.id,
      stage: 'resolution',
      actorPersonId: resolutionAppointment.personId,
      appointmentId: resolutionAppointment.id,
      recordId,
      precedingEventId: acceptedVerification.id,
      decision: 'resolved',
      resolution: {
        verificationEventId: acceptedVerification.id,
        disposition: 'accepted_verification',
        rationale: 'The specific accepted independent verification is entered as the institution’s final disposition.',
      },
    };
    const event: WorldEvent = {
      id: resolutionId,
      dayNumber,
      summary: 'The authorized official records final disposition following accepted independent verification.',
      personIds: [resolutionAppointment.personId],
      institutionIds: [matter.institutionId],
      ...(matter.locationId ? { locationId: matter.locationId } : {}),
      institutionalResponse: resolution,
    };
    next = appendResponse(next, event);
  }

  return next;
}
