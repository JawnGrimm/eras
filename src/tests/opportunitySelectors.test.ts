import { describe, expect, it } from 'vitest';
import { TEST_CHARACTER_CREATION } from './fixtures/newGameCharacter';
import { createNewGameState } from '../state/newGameState';
import { selectCharacterOpportunities } from '../state/opportunitySelectors';
import type { AssignmentId, ChallengeId, PersonId } from '../state/ids';
import type { AssignmentOffer, ChallengeInstance, GameState, OpportunityActivity } from '../state/types';
import { STOREHOUSE_WORK_ID } from '../works/storehouseReckoning';

function challenge(id: string, status: 'offered' | 'accepted', assigneePersonId?: PersonId): ChallengeInstance {
  return {
    id: id as ChallengeId, title: 'A disputed account', description: 'Two source records disagree.',
    category: 'accounts',
    context: {
      what: 'Determine how to carry a discrepancy into the next account.',
      who: ['Steward', 'Scribe'], quantity: 'One disputed measure.', when: 'Before the next tally.',
      where: 'Temple Storehouse', from: 'Dispatch tablet and receiving tally.', to: 'The next account.',
      purpose: 'Preserve the source figures without unsupported attribution.',
      responsibility: ['The scribe recommends; the Senior Scribe retains authority.'],
      provenance: ['Dispatch tablet', 'Receiving tally'],
    },
    deliveryChannels: [{ kind: 'baseline_reach', explanation: 'The source records reached the reporting scribe.' }],
    presentedDay: 1, apCost: 1, status,
    ...(assigneePersonId ? { assigneePersonId } : {}),
    choices: [{ id: 'preserve', label: 'Preserve both figures', description: 'Retain the discrepancy for further checking.', consequences: {} }],
  };
}

function withCompletedTutorial(state: GameState): GameState {
  const progress = state.works.progress[STOREHOUSE_WORK_ID];
  return {
    ...state,
    works: {
      ...state.works, activeWorkId: null,
      progress: { ...state.works.progress, [STOREHOUSE_WORK_ID]: { ...progress, status: 'completed' } },
    },
  };
}

describe('character opportunity selectors', () => {
  it('scopes accepted commitments to the active character and keeps offered items visible', () => {
    const base = withCompletedTutorial(createNewGameState(TEST_CHARACTER_CREATION));
    const currentId = base.player.currentCharacterId;
    const otherId = 'person-uruk-ur-gir' as PersonId;
    const starter = Object.values(base.opportunities.assignments)[0];
    const own = { ...starter, id: 'own-assignment' as AssignmentId, status: 'accepted' as const, assigneePersonId: currentId };
    const former = { ...starter, id: 'former-assignment' as AssignmentId, status: 'accepted' as const, assigneePersonId: otherId };
    const unownedLegacy = { ...starter, id: 'legacy-assignment' as AssignmentId, status: 'accepted' as const, assigneePersonId: undefined };
    const offered = { ...starter, id: 'offered-assignment' as AssignmentId, status: 'offered' as const };
    const ownChallenge = challenge('own-challenge', 'accepted', currentId);
    const formerChallenge = challenge('former-challenge', 'accepted', otherId);
    const offeredChallenge = challenge('offered-challenge', 'offered');
    const state = {
      ...base,
      opportunities: {
        ...base.opportunities,
        assignments: { [own.id]: own, [former.id]: former, [unownedLegacy.id]: unownedLegacy, [offered.id]: offered },
        challenges: { [ownChallenge.id]: ownChallenge, [formerChallenge.id]: formerChallenge, [offeredChallenge.id]: offeredChallenge },
      },
    };

    const selected = selectCharacterOpportunities(state);

    expect(selected.acceptedAssignments.map((item) => item.id)).toEqual([own.id]);
    expect(selected.offeredAssignments.map((item) => item.id)).toEqual([offered.id]);
    expect(selected.acceptedChallenges.map((item) => item.id)).toEqual([ownChallenge.id]);
    expect(selected.offeredChallenges.map((item) => item.id)).toEqual([offeredChallenge.id]);
  });

  it('holds Challenges behind the Era I tutorial and never releases the legacy Day 1 starter', () => {
    const base = createNewGameState(TEST_CHARACTER_CREATION);
    const legacyStarter = challenge('challenge-apprentice-copy-dispute', 'offered');
    const valid = challenge('valid-post-tutorial-challenge', 'offered');
    const withBoth = {
      ...base,
      opportunities: { ...base.opportunities, challenges: {
        [legacyStarter.id]: legacyStarter, [valid.id]: valid,
      } },
    };
    expect(selectCharacterOpportunities(withBoth).offeredChallenges).toEqual([]);

    const afterTutorial = withCompletedTutorial(withBoth);
    expect(selectCharacterOpportunities(afterTutorial).offeredChallenges.map((item) => item.id))
      .toEqual([valid.id]);
  });

  it('keeps only completed outcomes in the archive and retains resolver attribution', () => {
    const base = createNewGameState(TEST_CHARACTER_CREATION);
    const outcome = {
      challengeId: 'resolved-challenge' as ChallengeId,
      title: 'A resolved matter',
      category: 'records',
      resolvedDay: 4,
      choiceId: 'preserve',
      choiceLabel: 'Preserve the uncertainty',
      summary: 'The record retained the limits of the testimony.',
      assigneePersonId: base.player.currentCharacterId,
    };
    const state = { ...base, opportunities: { ...base.opportunities, challengeOutcomes: [outcome] } };
    const selected = selectCharacterOpportunities(state);

    expect(selected.challengeArchive).toEqual([outcome]);
    expect(selected.challengeArchive[0].assigneePersonId).toBe(base.player.currentCharacterId);
  });

  it('bounds recent Assignment activity to five and derives compact totals from aggregates', () => {
    const base = createNewGameState(TEST_CHARACTER_CREATION);
    const recentActivity = Array.from({ length: 7 }, (_, index) => ({
      dayNumber: index + 1, kind: 'presented' as const, employerKey: 'person|employer|records|',
      category: 'records', assignmentId: `recent-${index}` as AssignmentId,
    })) satisfies OpportunityActivity[];
    const completed: AssignmentOffer = {
      ...Object.values(base.opportunities.assignments)[0],
      id: 'completed-total' as AssignmentId,
      status: 'completed',
      compensation: { money: 3, provisions: 0 },
      careerXpReward: 8,
      completionConsequences: { moneyDelta: 2, careerXp: 4 },
    };
    const state = {
      ...base,
      opportunities: {
        ...base.opportunities,
        assignments: { ...base.opportunities.assignments, [completed.id]: completed },
        assignmentAggregates: {
          sample: { key: 'sample', employer: { kind: 'person' as const, id: base.player.currentCharacterId },
            category: 'records', presented: 7, accepted: 4, declined: 1, nonWorkLapsed: 1, completed: 2 },
        },
        recentActivity,
      },
    };

    const selected = selectCharacterOpportunities(state);

    expect(selected.recentAssignmentActivity).toHaveLength(5);
    expect(selected.recentAssignmentActivity[0].activity.dayNumber).toBe(7);
    expect(selected.totals).toMatchObject({
      presented: 7, accepted: 4, declined: 1, nonWorkLapsed: 1, completed: 2,
      silverEarned: 5, careerXpEarned: 12,
    });
  });
});
