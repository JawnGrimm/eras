/**
 * Challenge Director evaluates compact career aggregates rather than rescanning
 * every completed Assignment record.
 */

import { CareerActivitySummary, countEmployerInteractions, countCommodityMentions } from './CareerWorkLog';

export type ChallengeStatus = 'candidate' | 'offered' | 'accepted' | 'declined' | 'lapsed' | 'completed';

export interface ChallengeOpportunity {
  id: string;
  title: string;
  employer: string;
  description: string;
  status: ChallengeStatus;
  rewardSilver: number;
  rewardCareerXp: number;
  blockCost: number;
  triggerCondition: {
    minCompletedAssignments?: number;
    requiredEmployer?: string;
    requiredCommodity?: string;
  };
  narrativeOutcome?: string;
  completedDay?: number;
  completedDate?: string;
  completedBy?: string;
  completedEra?: string;
}

export function createInitialChallenges(): ChallengeOpportunity[] {
  return [
    {
      id: 'chal-01',
      title: 'The Missing Barge Tally Dispute',
      employer: 'Inanna Temple Administration',
      description: 'Senior Steward Ur-Nanna notes recurring discrepancies in barge deliveries from the outer granaries. Because of your prior diligent tallies, he requests an independent confidential audit.',
      status: 'candidate',
      rewardSilver: 8,
      rewardCareerXp: 300,
      blockCost: 2,
      triggerCondition: {
        minCompletedAssignments: 2,
        requiredEmployer: 'Inanna Temple Administration',
      },
    },
    {
      id: 'chal-02',
      title: 'Secret Wool Allocation Inquiry',
      employer: 'Palace Overseer of Textiles',
      description: 'The Overseer suspects unrecorded diversion of sheared wool to private workshops. Your accurate reed-stylus receipts make you the logical investigator.',
      status: 'candidate',
      rewardSilver: 10,
      rewardCareerXp: 350,
      blockCost: 2,
      triggerCondition: {
        minCompletedAssignments: 2,
        requiredCommodity: 'Wool',
      },
    },
  ];
}

export function evaluateChallenges(
  challenges: ChallengeOpportunity[],
  careerSummary: CareerActivitySummary,
): ChallengeOpportunity[] {
  return challenges.map((chal) => {
    if (chal.status !== 'candidate') return chal;

    const cond = chal.triggerCondition;
    let eligible = true;

    if (cond.minCompletedAssignments !== undefined &&
      careerSummary.assignmentsCompleted < cond.minCompletedAssignments) {
      eligible = false;
    }
    if (cond.requiredEmployer &&
      countEmployerInteractions(careerSummary, cond.requiredEmployer) === 0) {
      eligible = false;
    }
    if (cond.requiredCommodity &&
      countCommodityMentions(careerSummary, cond.requiredCommodity) === 0) {
      eligible = false;
    }

    return eligible ? { ...chal, status: 'offered' } : chal;
  });
}
