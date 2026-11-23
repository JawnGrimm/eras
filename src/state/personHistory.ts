import type { Person, PersonFamiliarity, PersonLifeEvent } from './types';
import {
  resolveEraICharacterHistory,
  type EraICharacterHistoryChoices,
} from '../content/characterCreation/eraICharacterHistory';

export interface PersonHistoryEventView {
  id: string;
  kind: PersonLifeEvent['kind'];
  summary: string;
  stage: PersonLifeEvent['chronology']['stage'];
  order: number;
  participants: Array<{ role: string; name: string }>;
}

export interface PersonHistoryView {
  hasHistory: boolean;
  emptyMessage: string | null;
  events: PersonHistoryEventView[];
  familiarities: PersonFamiliarity[];
}

/**
 * Builds a biography/People You Know read model from durable Person history.
 * Current authored prose is re-resolved only when the persisted creation choices
 * and stable content ID agree; otherwise the frozen event summary is the fallback.
 */
export function selectPersonHistory(
  person: Person,
  people: Readonly<Record<string, Person>>,
): PersonHistoryView {
  const persistedEvents = person.lifeEvents ?? [];
  if (persistedEvents.length === 0) {
    return {
      hasHistory: false,
      emptyMessage: 'No personal history has been recorded.',
      events: [],
      familiarities: person.familiarities ?? [],
    };
  }

  let currentEvents: PersonLifeEvent[] = [];
  if (person.characterCreation) {
    try {
      const resolved = resolveEraICharacterHistory({
        personId: person.id,
        people,
        choices: {
          originId: person.characterCreation.originId,
          responsibilityId: person.characterCreation.responsibilityId,
          formativeExperienceId: person.characterCreation.formativeExperienceId,
          entryRouteId: person.characterCreation.entryRouteId,
          instructionId: person.characterCreation.instructionId,
        } as EraICharacterHistoryChoices,
      });
      currentEvents = resolved.lifeEvents;
    } catch {
      // An unavailable/retired content package must not erase the persisted fallback.
      currentEvents = [];
    }
  }

  const events = [...persistedEvents]
    .sort((left, right) => left.chronology.order - right.chronology.order)
    .map((persisted) => {
      const current = currentEvents.find((candidate) =>
        candidate.id === persisted.id && candidate.contentId === persisted.contentId);
      return {
        id: persisted.id,
        kind: persisted.kind,
        summary: current?.summary ?? persisted.summary,
        stage: persisted.chronology.stage,
        order: persisted.chronology.order,
        participants: persisted.participants.map((participant) => ({
          role: participant.role,
          name: people[participant.personId]?.name ?? participant.personId,
        })),
      };
    });

  return {
    hasHistory: true,
    emptyMessage: null,
    events,
    familiarities: person.familiarities ?? [],
  };
}
