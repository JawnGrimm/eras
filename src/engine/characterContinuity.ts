import type { InstitutionId, PersonId } from '../state/ids';
import type { GameState } from '../state/types';

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
    if (person.id === formerId || !person.alive || !person.scribal) continue;

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
      const formerConnection = formerHasRelationship ? 'relationship' : formerInstitutions.length ? 'institution' : null;
      const candidateConnection = candidateHasRelationship ? 'relationship' : candidateInstitutions.length ? 'institution' : null;

      if (formerConnection && candidateConnection) {
        reasons.push({
          kind: 'network_bridge',
          intermediaryId: intermediary.id,
          formerConnection,
          candidateConnection,
          sharedInstitutionIds: [...formerInstitutions, ...candidateInstitutions].filter((id, index, all) => all.indexOf(id) === index).sort(),
        });
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
