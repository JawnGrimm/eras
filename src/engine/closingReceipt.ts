import type { AssignmentAssessmentCategory, ClosingReceiptPayload, GameState } from '../state/types';
import type { InstitutionId, PersonId } from '../state/ids';
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
  const nextStanding = input.institutionId && state.world.institutions[input.institutionId]
    ? clamp((scribal.institutionalStanding[input.institutionId] ?? 50) + schedule.institutionalStanding)
    : undefined;
  const standingDelta = nextStanding === undefined ? 0
    : nextStanding - (scribal.institutionalStanding[input.institutionId!] ?? 50);
  const receiver = input.receiverPersonId ? state.world.people[input.receiverPersonId] : undefined;
  let relationships = state.world.relationships;
  let trustDelta = 0, respectDelta = 0;
  if (receiver && receiver.id !== person.id) {
    const current = relationships[receiver.id]?.[person.id];
    const dimensions = { trust: 50, respect: 50, affection: 50, resentment: 0, rivalry: 0, familiarity: 0, ...current?.dimensions };
    const nextTrust = clamp(dimensions.trust + schedule.trust);
    const nextRespect = clamp(dimensions.respect + schedule.respect);
    trustDelta = nextTrust - dimensions.trust;
    respectDelta = nextRespect - dimensions.respect;
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
          }],
        },
      },
    };
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
    },
  };
  const receipt: ClosingReceiptPayload = {
    title: input.title,
    disposition: input.disposition,
    assessment: input.assessment,
    rationale: input.rationale,
    ...(receiver ? { receiverName: receiver.name } : {}),
    reaction: input.reaction,
    deltas: {
      currency: input.currencyDelta ?? 0,
      provisions: input.provisionsDelta ?? 0,
      careerXp,
      judgment: judgmentDelta,
      institutionalStanding: standingDelta,
      trust: trustDelta,
      respect: respectDelta,
    },
    ...(input.compensationTiming ? { compensationTiming: input.compensationTiming } : {}),
  };
  return { state: nextState, receipt };
}
