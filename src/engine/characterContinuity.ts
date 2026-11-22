import type { InstitutionId, PersonId } from '../state/ids';
import type { GameState } from '../state/types';

export type SuccessorConnectionTier = 'direct_personal' | 'direct_professional' | 'wider_network';

export type SuccessorConnectionReason =
  | { kind: 'direct_relationship'; fromId: PersonId; toId: PersonId }
  | { kind: 'shared_institution'; institutionId: InstitutionId }
  | { kind: 'network_relationship'; intermediaryId: PersonId }
  | { kind: 'network_institution'; intermediaryId: PersonId; institutionId: InstitutionId };

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
    if (hasDirectRelationship(state, formerId, person.id)) {
      reasons.push({ kind: 'direct_relationship', fromId: formerId, toId: person.id });
    }

    for (const institutionId of sharedInstitutions(state, formerId, person.id)) {
      reasons.push({ kind: 'shared_institution', institutionId });
    }

    for (const intermediary of Object.values(state.world.people)) {
      if (intermediary.id === formerId || intermediary.id === person.id) continue;

      if (hasDirectRelationship(state, formerId, intermediary.id)
        && hasDirectRelationship(state, intermediary.id, person.id)) {
        reasons.push({ kind: 'network_relationship', intermediaryId: intermediary.id });
      }

      for (const institutionId of sharedInstitutions(state, intermediary.id, person.id)) {
        if (hasDirectRelationship(state, formerId, intermediary.id)) {
          reasons.push({ kind: 'network_institution', intermediaryId: intermediary.id, institutionId });
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
    TIER_ORDER[a.tier] - TIER_ORDER[b.tier] || a.personId.localeCompare(b.personId));
}
