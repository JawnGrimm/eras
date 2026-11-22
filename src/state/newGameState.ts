import { transitionGame } from '../engine/actionEconomy';
import { INITIAL_PERSON_ID, createInitialGameState } from './initialState';
import type { AssignmentOffer, ChallengeInstance, GameState, OpportunityDeliveryChannel } from './types';
import type { AssignmentId, ChallengeId, PersonId } from './ids';
import { STOREHOUSE_WORK_ID, STOREHOUSE_INSTITUTION_ID, STOREHOUSE_PEOPLE, storehouseReckoning } from '../works/storehouseReckoning';

/** The production Work catalog is supplied to every bootstrap transition. */
export const INITIAL_WORK_CATALOG = {
  [STOREHOUSE_WORK_ID]: storehouseReckoning,
} as const;

const baseline: OpportunityDeliveryChannel = {
  kind: 'baseline_reach',
  explanation: 'This matter is within the character’s ordinary professional reach in Uruk.',
};

function starterAssignments(): Array<Omit<AssignmentOffer, 'offeredDay' | 'expiresDay' | 'status' | 'lapsedDuringMandatoryWork'>> {
  return [
    {
      id: 'assignment-storehouse-copy-check' as AssignmentId,
      title: 'Check the Storehouse Copy',
      description: 'Compare a steward’s working copy with the issued temple account before it is circulated.',
      employer: { kind: 'institution', id: STOREHOUSE_INSTITUTION_ID },
      category: 'document_copying',
      commodity: 'barley',
      context: {
        what: 'Verify a working copy of the latest storehouse issue account.',
        who: ['Ur-Nanna, Storehouse Steward', 'Enlil-barni, junior scribe'],
        quantity: 'One tablet copy covering 30 standard measures of barley.',
        when: 'Day 1, before the next routine issue.',
        where: 'Temple Storehouse, Uruk',
        from: 'The temple issue tablet held by the storehouse.',
        to: 'Ur-Nanna, Storehouse Steward.',
        purpose: 'Prevent a copying error from entering the steward’s working records.',
        responsibility: ['The scribe must compare the copy against the source and report discrepancies without silently correcting the original.'],
        authority: 'The steward may request a copy check; the scribe does not authorize stock movement.',
        provenance: ['The steward’s request and the existing temple issue tablet.'],
      },
      requiredSkills: {},
      difficulty: 'routine',
      apCost: 1,
      compensation: { money: 2, provisions: 0 },
      careerXpReward: 8,
      deliveryChannels: [baseline],
    },
    {
      id: 'assignment-apprentice-tablet-preparation' as AssignmentId,
      title: 'Prepare a Practice Tablet',
      description: 'Prepare a clean practice tablet for a junior learner using the established scribal exercise.',
      employer: { kind: 'person', id: STOREHOUSE_PEOPLE.seniorScribe },
      category: 'scribal_training',
      context: {
        what: 'Prepare one practice tablet for supervised copying instruction.',
        who: ['Shuruppak-ilu, Senior Scribe', 'Nin-aya, apprentice', 'Enlil-barni, assisting scribe'],
        quantity: 'One prepared practice tablet.',
        when: 'Day 1, during the morning instruction period.',
        where: 'Temple scribal room, Uruk',
        from: 'The Senior Scribe’s approved exercise text.',
        to: 'Nin-aya, apprentice.',
        purpose: 'Provide a legible exercise copy for supervised practice.',
        responsibility: ['The assisting scribe prepares the tablet; the Senior Scribe remains responsible for instruction and review.'],
        authority: 'The Senior Scribe controls the exercise text and approves its use.',
        provenance: ['The Senior Scribe’s instruction and approved exercise text.'],
      },
      requiredSkills: {},
      difficulty: 'routine',
      apCost: 1,
      compensation: { money: 1, provisions: 0 },
      careerXpReward: 6,
      deliveryChannels: [baseline],
    },
  ];
}

function starterChallenge(): Omit<ChallengeInstance, 'status' | 'assigneePersonId'> {
  return {
    id: 'challenge-apprentice-copy-dispute' as ChallengeId,
    title: 'The Apprentice’s Copy',
    description: 'Nin-aya has copied a short practice passage, but one line differs from the wording she recalls hearing. She asks whether to erase it, preserve the uncertain reading, or seek another recitation.',
    category: 'scribal_instruction',
    employer: { kind: 'person', id: STOREHOUSE_PEOPLE.seniorScribe },
    context: {
      what: 'Decide how to handle one uncertain line in an apprentice practice copy.',
      who: ['Nin-aya, apprentice', 'Enlil-barni, assisting scribe', 'Shuruppak-ilu, Senior Scribe'],
      quantity: 'One disputed line in a practice tablet.',
      when: 'Day 1, during instruction.',
      where: 'Temple scribal room, Uruk',
      from: 'Nin-aya’s recollection of the oral exercise.',
      to: 'The practice tablet retained for instruction.',
      purpose: 'Balance legibility, fidelity, and the apprentice’s opportunity to learn.',
      responsibility: ['The assisting scribe advises; the Senior Scribe retains authority over instruction.'],
      authority: 'The Senior Scribe may approve a correction or require a new recitation.',
      provenance: ['The apprentice’s practice copy and her report of the oral instruction.'],
    },
    deliveryChannels: [{
      kind: 'relationship',
      personId: STOREHOUSE_PEOPLE.seniorScribe,
      explanation: 'The Senior Scribe has involved the current scribe in routine instruction.',
    }],
    presentedDay: 1,
    apCost: 1,
    choices: [
      {
        id: 'preserve-uncertain-reading',
        label: 'Preserve the uncertain reading',
        description: 'Mark the line as uncertain and retain the apprentice’s copy for comparison.',
        consequences: {
          careerXp: 5,
          relationships: [{
            fromId: INITIAL_PERSON_ID,
            toId: 'person-uruk-nin-aya' as PersonId,
            changes: { respect: 3, familiarity: 2 },
            summary: 'The apprentice’s uncertainty was preserved rather than erased.',
          }],
        },
      },
      {
        id: 'request-new-recitation',
        label: 'Request another recitation',
        description: 'Set the copy aside and ask the Senior Scribe to repeat the passage before a clean copy is made.',
        consequences: {
          moneyDelta: -1,
          relationships: [{
            fromId: INITIAL_PERSON_ID,
            toId: 'person-uruk-nin-aya' as never,
            changes: { trust: 3, familiarity: 1 },
            summary: 'The apprentice was asked to wait for a fresh recitation before correcting the line.',
          }],
        },
      },
    ],
  };
}

/**
 * Creates a complete first-day production state by applying authored engine actions.
 * IDs and authored content are stable; no random or wall-clock values enter transitions.
 */
export function createNewGameState(): GameState {
  let state = createInitialGameState();
  const catalog = INITIAL_WORK_CATALOG;
  const actions = [
    { type: 'START_WORK', workId: STOREHOUSE_WORK_ID } as const,
    ...starterAssignments().map((offer) => ({ type: 'PRESENT_ASSIGNMENT', offer } as const)),
    { type: 'PRESENT_CHALLENGE', challenge: starterChallenge() } as const,
  ];
  for (const action of actions) {
    const result = transitionGame(state, action, undefined, catalog);
    if (result.feedback?.kind === 'error') {
      throw new Error(`Initial Uruk content failed (${result.feedback.code}): ${result.feedback.message}`);
    }
    state = result.state;
  }
  return state;
}
