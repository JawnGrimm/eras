import type { ChallengeId, PersonId } from './ids';
import { STOREHOUSE_WORK_ID } from '../works/storehouseReckoning';
import type { AssignmentOffer, ChallengeInstance, ChallengeOutcome, GameState, OpportunityActivity } from './types';

export interface OpportunityTotals {
  presented: number;
  accepted: number;
  declined: number;
  nonWorkLapsed: number;
  completed: number;
  silverEarned: number;
  careerXpEarned: number;
}

export interface RecentAssignmentEntry {
  activity: OpportunityActivity;
  offer?: AssignmentOffer;
}

/**
 * Player-facing selectors for the current character's opportunity workspace.
 * Offered opportunities are visible to the character they reached; accepted
 * commitments belong only to the character explicitly recorded as assignee.
 * Completed Challenge outcomes remain in the career-wide archive.
 */
export function selectCharacterOpportunities(state: GameState): {
  offeredAssignments: AssignmentOffer[];
  acceptedAssignments: AssignmentOffer[];
  offeredChallenges: ChallengeInstance[];
  acceptedChallenges: ChallengeInstance[];
  challengeArchive: ChallengeOutcome[];
  recentAssignmentActivity: RecentAssignmentEntry[];
  totals: OpportunityTotals;
} {
  const currentCharacterId: PersonId = state.player.currentCharacterId;
  const assignments = Object.values(state.opportunities.assignments);
  const aggregates = Object.values(state.opportunities.assignmentAggregates);
  const eraIOnboardingComplete = state.calendar.eraId !== 'era-1'
    || state.works.progress[STOREHOUSE_WORK_ID]?.status === 'completed';
  const visibleChallenges = eraIOnboardingComplete
    ? Object.values(state.opportunities.challenges).filter((challenge) => challenge.id !== ('challenge-apprentice-copy-dispute' as ChallengeId))
    : [];
  const recentAssignmentActivity = state.opportunities.recentActivity
    .slice(-5)
    .reverse()
    .map((activity) => ({ activity, offer: state.opportunities.assignments[activity.assignmentId] }));

  const totals = aggregates.reduce<OpportunityTotals>((result, aggregate) => ({
    presented: result.presented + aggregate.presented,
    accepted: result.accepted + aggregate.accepted,
    declined: result.declined + aggregate.declined,
    nonWorkLapsed: result.nonWorkLapsed + aggregate.nonWorkLapsed,
    completed: result.completed + aggregate.completed,
    silverEarned: result.silverEarned,
    careerXpEarned: result.careerXpEarned,
  }), { presented: 0, accepted: 0, declined: 0, nonWorkLapsed: 0, completed: 0, silverEarned: 0, careerXpEarned: 0 });

  for (const offer of assignments) {
    if (offer.status !== 'completed') continue;
    totals.silverEarned += offer.compensation.money + (offer.completionConsequences?.moneyDelta ?? 0);
    totals.careerXpEarned += offer.careerXpReward + (offer.completionConsequences?.careerXp ?? 0);
  }

  return {
    offeredAssignments: assignments.filter((offer) => offer.status === 'offered'),
    acceptedAssignments: assignments.filter((offer) => offer.status === 'accepted' && offer.assigneePersonId === currentCharacterId),
    offeredChallenges: visibleChallenges.filter((challenge) => challenge.status === 'offered'),
    acceptedChallenges: visibleChallenges.filter((challenge) =>
      challenge.status === 'accepted' && challenge.assigneePersonId === currentCharacterId),
    challengeArchive: [...state.opportunities.challengeOutcomes].sort((a, b) => b.resolvedDay - a.resolvedDay),
    recentAssignmentActivity,
    totals,
  };
}
