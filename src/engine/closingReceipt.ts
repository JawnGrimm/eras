import type { AssignmentAssessmentCategory, ClosingReceiptPayload, GameState } from '../state/types';
import type { EventId, InstitutionId, MatterId, PersonId } from '../state/ids';
import { addRelationshipFamiliarityEpisode, relationshipFamiliarityEpisodeId } from '../state/relationshipFamiliarity';
import { getInitializedScribal } from '../state/scribalState';

export const CLOSING_RECEIPT_SCHEDULE: Record<AssignmentAssessmentCategory, {
  careerXpMultiplier: number; judgment: number; institutionalStanding: number; trust: number; respect: number;
}> = {
  Thorough: { careerXpMultiplier: 1, judgment: 3, institutionalStanding: 1, trust: 2, respect: 1 },
  Defensible: { careerXpMultiplier: 0.75, judgment: 2, institutionalStanding: 1, trust: 1, respect: 1 },
  Incomplete: { careerXpMultiplier: 0.5, judgment: 0, institutionalStanding: 0, trust: 0, respect: 0 },
  Overreached: { careerXpMultiplier: 0.25, judgment: -4, institutionalStanding: -2, trust: -4, respect: -3 },
};

const clamp = (value: number) => Math.max(0, Math.min(100, value));

export function applyClosingAssessment(state: GameState, input: {
  receiptId: string;
  title: string;
  disposition: string;
  assessment: AssignmentAssessmentCategory;
  rationale: string;
  reaction: string;
  baseCareerXp: number;
  institutionId?: InstitutionId;
  receiverPersonId?: PersonId;
  contextId?: string;
  occasionId?: string;
  matterId?: MatterId;
  currencyDelta?: number;
  provisionsDelta?: number;
  compensationTiming?: string;
}): { state: GameState; receipt: ClosingReceiptPayload } | null {
  const person = state.world.people[state.player.currentCharacterId];
  const scribal = getInitializedScribal(person);
  if (!person || !scribal || !Number.isFinite(input.baseCareerXp) || input.baseCareerXp < 0) return null;
  const schedule = CLOSING_RECEIPT_SCHEDULE[input.assessment];
  const careerXp = Math.round(input.baseCareerXp * schedule.careerXpMultiplier);
  const nextJudgment = clamp(scribal.professionalReputation.judgment + schedule.judgment);
  const judgmentDelta = nextJudgment - scribal.professionalReputation.judgment;
  const nextStanding = input.institutionId && state.world.institutions[input.institutionId] && schedule.institutionalStanding !== 0
    ? clamp((scribal.institutionalStanding[input.institutionId] ?? 50) + schedule.institutionalStanding)
    : undefined;
  const standingDelta = nextStanding === undefined ? 0
    : nextStanding - (scribal.institutionalStanding[input.institutionId!] ?? 50);
  const receiver = input.receiverPersonId ? state.world.people[input.receiverPersonId] : undefined;
  let relationships = state.world.relationships;
  let events = state.world.events;
  let familiarityEpisodes = state.world.relationshipFamiliarityEpisodes ?? {};
  let trustDelta = 0, respectDelta = 0;
  if (receiver && receiver.id !== person.id) {
    const eventId = `event-closing-receipt-${input.receiptId}` as EventId;
    if (events[eventId]) return null;
    const responseEvent = {
      id: eventId,
      dayNumber: state.calendar.dayNumber,
      summary: `A Closing Receipt was returned by ${receiver.name} for ${input.title}.`,
      personIds: [person.id, receiver.id],
      institutionIds: input.institutionId && state.world.institutions[input.institutionId] ? [input.institutionId] : [],
      ...(receiver.currentLocationId ? { locationId: receiver.currentLocationId } : {}),
    };
    events = { ...events, [eventId]: responseEvent };
    // The player directly receives the receiver's substantive assessment. Record only this evidenced direction;
    // the receiver's familiarity with the player is not inferred from shared Event participation.
    const occasionId = input.occasionId ?? input.receiptId;
    const episodeId = relationshipFamiliarityEpisodeId(person.id, receiver.id, occasionId, 'closing_receipt_assessment');
    // A later receipt on the same authored matter is still an Event, but it is not a second familiarity occasion.
    if (!familiarityEpisodes[episodeId]) {
      const episode = {
        id: episodeId,
        observerPersonId: person.id,
        subjectPersonId: receiver.id,
        acquisitionMode: 'direct_interaction' as const,
        interactionKind: 'closing_receipt_assessment',
        occasionId,
        ...(input.matterId ? { matterId: input.matterId } : {}),
        contextId: input.contextId ?? 'closing_receipt',
        stageContribution: 'acquainted' as const,
        dayNumber: state.calendar.dayNumber,
        provenance: [{ kind: 'event' as const, id: eventId }],
      };
      const recordedEpisode = addRelationshipFamiliarityEpisode(familiarityEpisodes, episode, {
        people: state.world.people, events, records: state.records.entries, matters: state.world.matters, currentDay: state.calendar.dayNumber,
      });
      if (!recordedEpisode.ok) return null;
      familiarityEpisodes = recordedEpisode.episodes;
    }
    const current = relationships[receiver.id]?.[person.id];
    const dimensions = { trust: 50, respect: 50, affection: 50, resentment: 0, rivalry: 0, ...current?.dimensions };
    const nextTrust = clamp(dimensions.trust + schedule.trust);
    const nextRespect = clamp(dimensions.respect + schedule.respect);
    trustDelta = nextTrust - dimensions.trust;
    respectDelta = nextRespect - dimensions.respect;
    if (trustDelta !== 0 || respectDelta !== 0) {
      relationships = {
        ...relationships,
        [receiver.id]: {
          ...relationships[receiver.id],
          [person.id]: {
            dimensions: { ...dimensions, trust: nextTrust, respect: nextRespect },
            history: [...(current?.history ?? []), {
              id: input.receiptId + ':receiver-relationship',
              dayNumber: state.calendar.dayNumber,
              summary: input.reaction,
              eventId,
            }],
          },
        },
      };
    }
  }
  const updatedPerson = {
    ...person,
    scribal: {
      ...scribal,
      careerXp: scribal.careerXp + careerXp,
      professionalReputation: { ...scribal.professionalReputation, judgment: nextJudgment },
      institutionalStanding: nextStanding === undefined ? scribal.institutionalStanding
        : { ...scribal.institutionalStanding, [input.institutionId!]: nextStanding },
    },
  };
  const nextState: GameState = {
    ...state,
    world: {
      ...state.world,
      people: { ...state.world.people, [person.id]: updatedPerson },
      relationships,
      events,
      relationshipFamiliarityEpisodes: familiarityEpisodes,
    },
  };
  const receipt: ClosingReceiptPayload = {
    dayNumber: state.calendar.dayNumber,
    title: input.title,
    disposition: input.disposition,
    assessment: input.assessment,
    rationale: input.rationale,
    ...(receiver ? { receiverName: receiver.name } : {}),
    ...(input.institutionId && state.world.institutions[input.institutionId] ? { institutionName: state.world.institutions[input.institutionId].name } : {}),
    reaction: input.reaction,
    deltas: {
      ...(input.currencyDelta ? { currency: input.currencyDelta } : {}),
      ...(input.provisionsDelta ? { provisions: input.provisionsDelta } : {}),
      ...(input.baseCareerXp > 0 ? { careerXp } : {}),
      judgment: judgmentDelta,
      ...(input.institutionId && state.world.institutions[input.institutionId] ? { institutionalStanding: standingDelta } : {}),
      ...(receiver && receiver.id !== person.id ? { trust: trustDelta, respect: respectDelta } : {}),
    },
    ...(input.compensationTiming ? { compensationTiming: input.compensationTiming } : {}),
  };
  return { state: nextState, receipt };
}
