import type { InstitutionId, PersonId } from '../state/ids';
import type { WorkDefinition } from '../works/workDefinition';
import { getInitializedScribal, isInitializedScribalState } from '../state/scribalState';
import type { GameAction, GameState, PreservedWorkInvitationSnapshot, TransitionResult } from '../state/types';
import { evaluateCharacterPredicate } from '../works/evidenceInterpretation';

export type SuccessorConnectionTier = 'direct_personal' | 'direct_professional' | 'wider_network';

export type SuccessorConnectionReason =
  | { kind: 'direct_relationship'; fromId: PersonId; toId: PersonId }
  | { kind: 'shared_institution'; institutionId: InstitutionId }
  | {
      kind: 'network_bridge';
      intermediaryId: PersonId;
      formerConnection: 'relationship' | 'institution';
      candidateConnection: 'relationship' | 'institution';
      sharedInstitutionIds: InstitutionId[];
    };

export interface SuccessorCandidate {
  personId: PersonId;
  tier: SuccessorConnectionTier;
  /** All currently evidenced routes; the highest-priority route determines tier. */
  reasons: SuccessorConnectionReason[];
}

const TIER_ORDER: Record<SuccessorConnectionTier, number> = {
  direct_personal: 0,
  direct_professional: 1,
  wider_network: 2,
};

function hasDirectRelationship(state: GameState, a: PersonId, b: PersonId): boolean {
  return Boolean(state.world.relationships[a]?.[b] || state.world.relationships[b]?.[a]);
}

function institutionsForPerson(state: GameState, personId: PersonId): Set<InstitutionId> {
  const person = state.world.people[personId];
  const result = new Set<InstitutionId>(person?.affiliations ?? []);
  for (const appointment of Object.values(state.world.appointments)) {
    if (appointment.personId === personId) result.add(appointment.institutionId);
  }
  return result;
}

function sharedInstitutions(state: GameState, a: PersonId, b: PersonId): InstitutionId[] {
  const aInstitutions = institutionsForPerson(state, a);
  return [...institutionsForPerson(state, b)].filter((id) => aInstitutions.has(id)).sort();
}

/**
 * Returns living, existing scribal NPCs connected to the current character.
 * Connection priority is personal relationship, direct professional connection,
 * then a documented one-person professional/social network connection.
 *
 * This function ranks evidence of connection only. It does not score competence,
 * rank, reputation, wealth, or presumed suitability.
 */
export function rankSuccessorCandidates(state: GameState): SuccessorCandidate[] {
  const formerId = state.player.currentCharacterId;
  const former = state.world.people[formerId];
  if (!former) return [];

  const candidates: SuccessorCandidate[] = [];
  for (const person of Object.values(state.world.people)) {
    if (person.id === formerId || !person.alive || !isInitializedScribalState(person.scribal)) continue;

    const reasons: SuccessorConnectionReason[] = [];
    if (state.world.relationships[formerId]?.[person.id]) {
      reasons.push({ kind: 'direct_relationship', fromId: formerId, toId: person.id });
    }
    if (state.world.relationships[person.id]?.[formerId]) {
      reasons.push({ kind: 'direct_relationship', fromId: person.id, toId: formerId });
    }

    for (const institutionId of sharedInstitutions(state, formerId, person.id)) {
      reasons.push({ kind: 'shared_institution', institutionId });
    }

    for (const intermediary of Object.values(state.world.people)) {
      if (intermediary.id === formerId || intermediary.id === person.id) continue;

      const formerInstitutions = sharedInstitutions(state, formerId, intermediary.id);
      const candidateInstitutions = sharedInstitutions(state, intermediary.id, person.id);
      const formerHasRelationship = hasDirectRelationship(state, formerId, intermediary.id);
      const candidateHasRelationship = hasDirectRelationship(state, intermediary.id, person.id);
      const formerConnections: Array<'relationship' | 'institution'> = [];
      const candidateConnections: Array<'relationship' | 'institution'> = [];
      if (formerHasRelationship) formerConnections.push('relationship');
      if (formerInstitutions.length) formerConnections.push('institution');
      if (candidateHasRelationship) candidateConnections.push('relationship');
      if (candidateInstitutions.length) candidateConnections.push('institution');

      for (const formerConnection of formerConnections) {
        for (const candidateConnection of candidateConnections) {
          reasons.push({
            kind: 'network_bridge',
            intermediaryId: intermediary.id,
            formerConnection,
            candidateConnection,
            sharedInstitutionIds: [...formerInstitutions, ...candidateInstitutions].filter((id, index, all) => all.indexOf(id) === index).sort(),
          });
        }
      }
    }

    if (reasons.length === 0) continue;

    const tier: SuccessorConnectionTier = reasons.some((reason) => reason.kind === 'direct_relationship')
      ? 'direct_personal'
      : reasons.some((reason) => reason.kind === 'shared_institution')
        ? 'direct_professional'
        : 'wider_network';

    candidates.push({ personId: person.id, tier, reasons });
  }

  return candidates.sort((a, b) =>
    TIER_ORDER[a.tier] - TIER_ORDER[b.tier]
      || (a.personId < b.personId ? -1 : a.personId > b.personId ? 1 : 0));
}


type ContinuityAction = Extract<GameAction, { type: 'BEGIN_CHARACTER_DEPARTURE' | 'SELECT_SUCCESSOR' }>;
const continuityFailure = (state: GameState, code: string, message: string): TransitionResult => ({
  state, feedback: { kind: 'error', code, message },
});
const continuitySuccess = (state: GameState, code: string, message: string): TransitionResult => ({
  state, feedback: { kind: 'success', code, message },
});

/** Handles persisted departure and successor selection without inheriting character state. */
export function transitionCharacterContinuity(state: GameState, action: ContinuityAction, workCatalog: Readonly<Record<string, WorkDefinition<any>>> = {}): TransitionResult {
  if (action.type === 'BEGIN_CHARACTER_DEPARTURE') {
    if (state.pendingSuccession) {
      return continuityFailure(state, 'succession-already-pending', 'A character transition is already awaiting resolution.');
    }
    if (action.departureKind !== 'death' && action.departureKind !== 'departure') {
      return continuityFailure(state, 'departure-kind-invalid', 'Choose a supported death or non-death departure.');
    }
    const formerId = state.player.currentCharacterId;
    const former = state.world.people[formerId];
    if (!former?.alive || !getInitializedScribal(former)) {
      return continuityFailure(state, 'departure-character-invalid', 'Only the living active scribal character can begin a departure.');
    }
    const people = {
      ...state.world.people,
      [formerId]: { ...former, alive: action.departureKind === 'death' ? false : former.alive },
    };
    const assignments = Object.fromEntries(Object.entries(state.opportunities.assignments).map(([id, offer]) => [
      id,
      offer.status === 'accepted' && (!offer.assigneePersonId || offer.assigneePersonId === formerId)
        ? { ...offer, assigneePersonId: formerId }
        : offer,
    ]));
    const departed: GameState = {
      ...state,
      world: { ...state.world, people },
      opportunities: { ...state.opportunities, assignments },
    };
    const candidates = rankSuccessorCandidates(departed);
    let status: 'awaiting_selection' | 'no_successor' = 'awaiting_selection';
    if (candidates.length === 0) {
      status = 'no_successor';
    }
    const pending = {
      formerCharacterId: formerId,
      departureKind: action.departureKind,
      dayNumber: state.calendar.dayNumber,
      status,
      candidateIds: candidates.map((candidate) => candidate.personId),
    };
    return continuitySuccess({ ...departed, pendingSuccession: pending },
      candidates.length ? 'succession-pending' : 'succession-no-successor',
      candidates.length
        ? 'The character has left play. Choose from the existing connected scribal candidates.'
        : 'No eligible connected scribal successor exists in the current world. No replacement has been created.');
  }

  const pending = state.pendingSuccession;
  if (!pending || pending.status !== 'awaiting_selection') {
    return continuityFailure(state, 'succession-selection-unavailable', 'There is no eligible successor selection to complete.');
  }
  const nextId = action.nextCharacterId;
  const nextPerson = state.world.people[nextId];
  const eligible = rankSuccessorCandidates(state).some((candidate) => candidate.personId === nextId);
  if (nextId === pending.formerCharacterId || !pending.candidateIds.includes(nextId)
    || !eligible || !nextPerson?.alive || !getInitializedScribal(nextPerson)) {
    return continuityFailure(state, 'successor-ineligible', 'The selected successor must be a living, existing scribal NPC in the connected candidate list.');
  }

  const activeWorkId = state.works.activeWorkId;
  const activeDefinition = activeWorkId ? workCatalog[activeWorkId] : undefined;
  const activeProgress = activeWorkId ? state.works.progress[activeWorkId] : undefined;
  const activeInstitutionalMatters = Object.values(state.world.matters).filter((matter) =>
    matter.status === 'active' && (matter.involvedPersonIds ?? []).includes(pending.formerCharacterId));
  const institutionId = activeDefinition?.institutionId
    ?? (activeInstitutionalMatters.length === 1 ? activeInstitutionalMatters[0].institutionId : undefined);
  const preserveWork = pending.departureKind === 'death' && !!activeWorkId && activeDefinition?.kind === 'work'
    && !!activeProgress && activeProgress.status === 'active';
  const successorRanked = rankSuccessorCandidates(state).find((candidate) => candidate.personId === nextId);
  const successorScribal = getInitializedScribal(nextPerson);
  const invitationDefinition = activeDefinition?.successionInvitation;
  const invitationInstitution = institutionId ? state.world.institutions[institutionId] : undefined;
  const activeAppointments = Object.values(state.world.appointments).filter((appointment) =>
    appointment.personId === nextId && appointment.institutionId === institutionId
      && appointment.startDay <= state.calendar.dayNumber
      && (appointment.endDay === undefined || appointment.endDay >= state.calendar.dayNumber));
  const hasInstitutionalAccess = !!institutionId && (nextPerson.affiliations.includes(institutionId) || activeAppointments.length > 0);
  const hasAuthority = !!invitationDefinition && !!invitationInstitution
    && (invitationInstitution.authority.includes(invitationDefinition.authorityScope)
      || activeAppointments.some((appointment) => appointment.authorityScope.includes(invitationDefinition.authorityScope)));
  const invitationEligible = !!preserveWork && !!invitationDefinition && !!institutionId
    && !!successorRanked && invitationDefinition.connectionTiers.includes(successorRanked.tier)
    && !!successorScribal && evaluateCharacterPredicate(invitationDefinition.qualification, successorScribal)
    && hasInstitutionalAccess && hasAuthority;
  const invitationSnapshot: PreservedWorkInvitationSnapshot | undefined = invitationEligible && invitationDefinition && successorRanked
    ? { connectionTier: successorRanked.tier, basis: invitationDefinition.basis,
        remainingRemit: invitationDefinition.remainingRemit, availableRecords: [...invitationDefinition.availableRecords],
        authorityScope: invitationDefinition.authorityScope, limits: [...invitationDefinition.limits] }
    : undefined;
  const preservedUndertaking = preserveWork && activeWorkId && activeDefinition ? {
    workId: activeWorkId,
    title: activeDefinition.title,
    ...(institutionId ? { institutionId } : {}),
    deceasedCharacterId: pending.formerCharacterId,
    successorCharacterId: nextId,
    deathDay: pending.dayNumber,
    status: 'waiting' as const,
    ...(invitationSnapshot ? { invitation: invitationSnapshot } : {}),
  } : undefined;
  const workNotice = preservedUndertaking
    ? {
        id: `notice-work-succession-${String(activeWorkId)}-${pending.dayNumber}-${String(nextId)}`,
        dayNumber: pending.dayNumber,
        category: 'work' as const,
        message: `${institutionId ? state.world.institutions[institutionId]?.name ?? 'The responsible institution' : 'The institution responsible for the undertaking'} sends condolences for ${state.world.people[pending.formerCharacterId]?.name ?? 'the deceased'}. ${invitationSnapshot ? `It invites you to take up the remaining remit: ${invitationSnapshot.remainingRemit}. Basis: ${invitationSnapshot.basis}. Records: ${invitationSnapshot.availableRecords.join('; ')}. Authority: ${invitationSnapshot.authorityScope}. Limits: ${invitationSnapshot.limits.join('; ')}. Please accept or decline; no handoff has occurred yet.` : `${activeDefinition!.title} and its completed progress will be waiting if you later choose to take it up. No handoff has occurred.`}`,
        read: false,
      }
    : undefined;
  const nextState: GameState = {
    ...state,
    player: { currentCharacterId: nextId },
    pendingSuccession: null,
    characterTransitions: [
      ...(state.characterTransitions ?? []),
      {
        formerCharacterId: pending.formerCharacterId,
        nextCharacterId: nextId,
        departureKind: pending.departureKind,
        dayNumber: state.calendar.dayNumber,
      },
    ],
    actionEconomy: {
      dailyApAllocation: 6,
      apRemaining: 6,
      overtimeUsedToday: false,
      nextDayApPenalty: false,
      recoveryLaborUsedToday: false,
    },
    works: {
      ...state.works,
      activeWorkId: preserveWork ? null : state.works.activeWorkId,
      preservedUndertakings: preservedUndertaking
        ? [...(state.works.preservedUndertakings ?? []), preservedUndertaking]
        : state.works.preservedUndertakings ?? [],
      contributionSegments: preserveWork
        ? (state.works.contributionSegments ?? []).map((segment) => segment.workId === activeWorkId
            && segment.personId === pending.formerCharacterId && segment.status === 'open'
            ? { ...segment, status: 'closed' as const, endedDay: pending.dayNumber, closureReason: 'death' as const } : segment)
        : state.works.contributionSegments ?? [],
      progress: Object.fromEntries(Object.entries(state.works.progress).map(([id, progress]) => [
        id, { ...progress, workApSpentToday: 0 },
      ])),
    },
    journal: workNotice ? { ...state.journal, notices: [...state.journal.notices, workNotice] } : state.journal,
  };
  return continuitySuccess(nextState, 'successor-selected',
    'Control passed to the selected character. Their own skills, resources, relationships, and circumstances remain unchanged; the world and calendar continue.');
}
