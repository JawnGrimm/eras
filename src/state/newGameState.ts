import { transitionGame } from '../engine/actionEconomy';
import { generateDailyAssignments } from '../engine/assignmentGenerator';
import { INITIAL_PERSON_ID, createInitialGameState } from './initialState';
import type { ChallengeInstance, GameState, Person } from './types';
import type { ChallengeId, PersonId, CareerPathId } from './ids';
import { STOREHOUSE_WORK_ID, STOREHOUSE_PEOPLE, storehouseReckoning } from '../works/storehouseReckoning';
import { ASSIGNMENT_ACTIVITY_CATALOG } from '../content/assignments/northBayRoofInspection';
import {
  resolveEraICharacterHistory,
  validateEraICharacterHistoryChoices,
  type EraICharacterHistoryChoices,
} from '../content/characterCreation/eraICharacterHistory';
import {
  resolveEraICharacterStartingState,
  validateEraICharacterName,
} from './eraICharacterStartingState';
import { createEraIPlayerPersonId } from './characterIdentity';

/** The production Work catalog is supplied to every bootstrap transition. */
export const INITIAL_ASSIGNMENT_ACTIVITY_CATALOG = ASSIGNMENT_ACTIVITY_CATALOG;

export const INITIAL_WORK_CATALOG = {
  [STOREHOUSE_WORK_ID]: storehouseReckoning,
} as const;

export interface EraICharacterCreationInput {
  /** Caller-supplied deterministic seed; no clock or random source is consulted. */
  seed: string;
  name: string;
  choices: EraICharacterHistoryChoices;
  careerPath: CareerPathId;
}

function starterChallenge(player: Person): Omit<ChallengeInstance, 'status' | 'assigneePersonId'> {
  return {
    id: 'challenge-apprentice-copy-dispute' as ChallengeId,
    title: 'The Apprentice’s Copy',
    description: 'Nin-aya has copied a short practice passage, but one line differs from the wording she recalls hearing. She asks whether to erase it, preserve the uncertain reading, or seek another recitation.',
    category: 'scribal_instruction',
    employer: { kind: 'person', id: STOREHOUSE_PEOPLE.seniorScribe },
    context: {
      what: 'Decide how to handle one uncertain line in an apprentice practice copy.',
      who: ['Nin-aya, apprentice', `${player.name}, assisting scribe`, 'Shuruppak-ilu, Senior Scribe'],
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
            fromId: player.id,
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
            fromId: player.id,
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
 * Creates a complete first-day production state from the approved creation payload.
 * All player-dependent opening content is initialized only after the new Person
 * has been registered in the world.
 */
export function createNewGameState(input: EraICharacterCreationInput): GameState {
  const nameResult = validateEraICharacterName(input.name);
  if (!nameResult.valid) throw new Error(nameResult.error);
  const choiceErrors = validateEraICharacterHistoryChoices(input.choices);
  if (choiceErrors.length > 0) throw new Error(choiceErrors.join(' '));

  // Build the authored NPC roster first; the legacy fixture protagonist is excluded
  // from collision checks and is replaced entirely by the newly created Person.
  const npcFixture = createInitialGameState();
  const occupied = new Set(Object.keys(npcFixture.world.people).filter((id) => id !== INITIAL_PERSON_ID));
  const personId = createEraIPlayerPersonId({
    seed: input.seed,
    name: nameResult.name,
    careerPath: input.careerPath,
    choices: input.choices,
  }, occupied);
  const history = resolveEraICharacterHistory({
    personId,
    people: npcFixture.world.people,
    choices: input.choices,
  });
  const starting = resolveEraICharacterStartingState(input.choices, input.careerPath);
  const player: Person = {
    id: personId,
    name: nameResult.name,
    alive: true,
    affiliations: [],
    lifeStage: 'apprentice',
    socialIdentity: {
      occupation: 'Scribal apprentice',
      summary: 'An apprentice beginning professional instruction in Uruk.',
    },
    characterCreation: history.characterCreation,
    lifeEvents: history.lifeEvents,
    familiarities: history.familiarities,
    scribal: {
      stage: 'initialized',
      careerXp: 0,
      cumulativeShortageStress: 0,
      obligations: [],
      careerPath: starting.careerPath,
      wallet: { money: 0, provisions: 5, shortageWorkdays: 0 },
      skills: starting.skills,
      attributes: starting.attributes,
      specializations: [],
      traits: [],
      conditions: [],
      equipment: [],
      stress: 0,
      professionalReputation: starting.professionalReputation,
      institutionalStanding: {},
    },
  };

  let state = createInitialGameState(player);
  const actions = [
    { type: 'START_WORK', workId: STOREHOUSE_WORK_ID } as const,
    { type: 'PRESENT_CHALLENGE', challenge: starterChallenge(player) } as const,
  ];
  for (const action of actions) {
    const result = transitionGame(state, action, undefined, INITIAL_WORK_CATALOG);
    if (result.feedback?.kind === 'error') {
      throw new Error(`Initial Uruk content failed (${result.feedback.code}): ${result.feedback.message}`);
    }
    state = result.state;
  }
  return generateDailyAssignments(state);
}
