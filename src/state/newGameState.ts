import { transitionGame } from '../engine/actionEconomy';
import { generateDailyAssignments } from '../engine/assignmentGenerator';
import { createInitialGameState } from './initialState';
import type { GameState, Person } from './types';
import type { PersonId, CareerPathId } from './ids';
import { STOREHOUSE_WORK_ID, storehouseReckoning } from '../works/storehouseReckoning';
import { EANNA_WORK_ID, eannaProvisioningWork } from '../works/eannaProvisioning';
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
  [EANNA_WORK_ID]: eannaProvisioningWork,
} as const;

const CHARACTER_CREATION_PREVIEW_PERSON: Person = {
  id: 'person-character-creator-preview' as PersonId,
  name: 'New character',
  alive: true,
  affiliations: [],
};

/** Non-persistent Creator context containing the authored NPC roster, not a legacy protagonist. */
export function createCharacterCreationPreviewState(): GameState {
  return createInitialGameState(CHARACTER_CREATION_PREVIEW_PERSON);
}

export interface EraICharacterCreationInput {
  /** Caller-supplied deterministic seed; no clock or random source is consulted. */
  seed: string;
  name: string;
  choices: EraICharacterHistoryChoices;
  careerPath: CareerPathId;
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

  // Build the authored NPC roster from a non-persistent preview Person; the preview
  // identity is excluded from collision checks and never enters the playable state.
  const npcFixture = createCharacterCreationPreviewState();
  const occupied = new Set(Object.keys(npcFixture.world.people).filter((id) => id !== CHARACTER_CREATION_PREVIEW_PERSON.id));
  const personId = createEraIPlayerPersonId({
    seed: input.seed,
    name: nameResult.name,
    careerPath: input.careerPath,
    choices: input.choices,
  }, occupied);
  const initialPlayer: Person = {
    id: personId,
    name: nameResult.name,
    alive: true,
    affiliations: [],
    lifeStage: 'apprentice',
    socialIdentity: {
      occupation: 'Scribal apprentice',
      summary: 'An apprentice beginning professional instruction in Uruk.',
    },
  };
  // Register the new Person before resolving player-dependent history and opening content.
  const registeredWorld = createInitialGameState(initialPlayer);
  const history = resolveEraICharacterHistory({
    personId,
    people: registeredWorld.world.people,
    choices: input.choices,
  });
  const starting = resolveEraICharacterStartingState(input.choices, input.careerPath);
  const player: Person = {
    ...initialPlayer,
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

  let state = createInitialGameState(player, input.seed);
  const actions = [
    { type: 'START_WORK', workId: STOREHOUSE_WORK_ID } as const,
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
