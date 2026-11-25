import { describe, expect, it } from 'vitest';
import { rankSuccessorCandidates } from '../engine/characterContinuity';
import { createInitialGameState, INITIAL_PERSON_ID } from '../state/initialState';
import type { InstitutionId, PersonId } from '../state/ids';
import type { GameState, Person } from '../state/types';

const personalId = 'person-personal' as PersonId;
const professionalId = 'person-professional' as PersonId;
const networkId = 'person-network' as PersonId;
const intermediaryId = 'person-intermediary' as PersonId;
const sharedInstitution = 'institution-shared' as InstitutionId;

function addScribe(state: GameState, id: PersonId, options: {
  alive?: boolean;
  affiliations?: InstitutionId[];
} = {}): GameState {
  const person: Person = {
    id,
    name: id,
    alive: options.alive ?? true,
    affiliations: options.affiliations ?? [],
    scribal: {
      careerXp: 0,
      cumulativeShortageStress: 0,
      obligations: [],
      wallet: { money: 0, provisions: 0, shortageWorkdays: 0 },
      skills: {},
      attributes: {},
      specializations: [],
      traits: [],
      conditions: [],
      equipment: [],
      stress: 0,
      professionalReputation: { competence: 0, reliability: 0, discretion: 0, judgment: 0 },
      institutionalStanding: {},
    },
  };
  return { ...state, world: { ...state.world, people: { ...state.world.people, [id]: person } } };
}

describe('ranked character continuity candidates', () => {
  it('ranks direct personal relationships ahead of direct professional connections', () => {
    let state = createInitialGameState();
    state = addScribe(state, personalId, { affiliations: [sharedInstitution] });
    state = addScribe(state, professionalId, { affiliations: [sharedInstitution] });
    state = {
      ...state,
      world: {
        ...state.world,
        people: {
          ...state.world.people,
          [INITIAL_PERSON_ID]: { ...state.world.people[INITIAL_PERSON_ID], affiliations: [sharedInstitution] },
        },
        relationships: {
          [INITIAL_PERSON_ID]: {
            [personalId]: {
              dimensions: { trust: 70, respect: 60, affection: 50, resentment: 0, rivalry: 0 },
              history: [],
            },
          },
        },
      },
    };

    const result = rankSuccessorCandidates(state);
    expect(result.map((candidate) => [candidate.personId, candidate.tier])).toEqual([
      [personalId, 'direct_personal'],
      [professionalId, 'direct_professional'],
    ]);
    expect(result[0].reasons).toContainEqual({
      kind: 'shared_institution',
      institutionId: sharedInstitution,
    });
  });

  it('recognizes directional relationships from either side', () => {
    let state = addScribe(createInitialGameState(), personalId);
    state = {
      ...state,
      world: {
        ...state.world,
        relationships: {
          [personalId]: {
            [INITIAL_PERSON_ID]: {
              dimensions: { trust: 40, respect: 40, affection: 20, resentment: 0, rivalry: 0 },
              history: [],
            },
          },
        },
      },
    };
    expect(rankSuccessorCandidates(state)[0]).toMatchObject({
      personId: personalId,
      tier: 'direct_personal',
      reasons: [{ kind: 'direct_relationship', fromId: personalId, toId: INITIAL_PERSON_ID }],
    });
  });

  it('finds a wider-network candidate through an existing intermediary', () => {
    let state = createInitialGameState();
    state = addScribe(state, intermediaryId, { affiliations: [sharedInstitution] });
    state = addScribe(state, networkId, { affiliations: [sharedInstitution] });
    state = {
      ...state,
      world: {
        ...state.world,
        relationships: {
          [INITIAL_PERSON_ID]: {
            [intermediaryId]: {
              dimensions: { trust: 40, respect: 40, affection: 20, resentment: 0, rivalry: 0 },
              history: [],
            },
          },
        },
      },
    };

    expect(rankSuccessorCandidates(state)).toContainEqual({
      personId: networkId,
      tier: 'wider_network',
      reasons: [{
        kind: 'network_bridge',
        intermediaryId,
        formerConnection: 'relationship',
        candidateConnection: 'institution',
        sharedInstitutionIds: [sharedInstitution],
      }],
    });
  });

  it('excludes the current character, dead people, and people without a scribal capability sheet', () => {
    let state = createInitialGameState();
    state = addScribe(state, personalId, { alive: false });
    const nonScribe: Person = { id: professionalId, name: 'Non-scribe', alive: true, affiliations: [] };
    state = { ...state, world: { ...state.world, people: { ...state.world.people, [professionalId]: nonScribe } } };
    state = {
      ...state,
      world: {
        ...state.world,
        relationships: {
          [INITIAL_PERSON_ID]: {
            [personalId]: {
              dimensions: { trust: 40, respect: 40, affection: 20, resentment: 0, rivalry: 0 },
              history: [],
            },
            [professionalId]: {
              dimensions: { trust: 40, respect: 40, affection: 20, resentment: 0, rivalry: 0 },
              history: [],
            },
          },
        },
      },
    };
    expect(rankSuccessorCandidates(state)).toEqual([]);
  });
});
