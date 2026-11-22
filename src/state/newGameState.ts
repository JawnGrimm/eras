import { transitionGame } from '../engine/actionEconomy';
import { generateDailyAssignments } from '../engine/assignmentGenerator';
import { INITIAL_PERSON_ID, createInitialGameState } from './initialState';
import type { ChallengeInstance, GameState } from './types';
import type { ChallengeId, PersonId } from './ids';
import { STOREHOUSE_WORK_ID, STOREHOUSE_PEOPLE, storehouseReckoning } from '../works/storehouseReckoning';
import { ASSIGNMENT_ACTIVITY_CATALOG } from '../content/assignments/northBayRoofInspection';

/** The production Work catalog is supplied to every bootstrap transition. */
export const INITIAL_ASSIGNMENT_ACTIVITY_CATALOG = ASSIGNMENT_ACTIVITY_CATALOG;

export const INITIAL_WORK_CATALOG = {
  [STOREHOUSE_WORK_ID]: storehouseReckoning,
} as const;

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
            toId: 'person-uruk-nin-aya' as PersonId,
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
    { type: 'PRESENT_CHALLENGE', challenge: starterChallenge() } as const,
  ];
  for (const action of actions) {
    const result = transitionGame(state, action, undefined, catalog);
    if (result.feedback?.kind === 'error') {
      throw new Error(`Initial Uruk content failed (${result.feedback.code}): ${result.feedback.message}`);
    }
    state = result.state;
  }
  return generateDailyAssignments(state);
}
