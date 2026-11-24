import { describe, expect, it } from 'vitest';
import { TEST_CHARACTER_CREATION } from './fixtures/newGameCharacter';
import { getInitializedScribal } from '../state/scribalState';
import { transitionGame } from '../engine/actionEconomy';
import { createNewGameState, INITIAL_WORK_CATALOG } from '../state/newGameState';
import { createSaveEnvelope, isValidSaveEnvelope } from '../state/saveEnvelope';
import type { ChallengeId, PersonId } from '../state/ids';
import type { ChallengeInstance } from '../state/types';
import { STOREHOUSE_WORK_ID } from '../works/storehouseReckoning';
import { ERA_I_CHARACTER_CREATION_CONTENT_VERSION } from '../state/eraICharacterStartingState';

const catalog = INITIAL_WORK_CATALOG;

describe('Day 1 Uruk production bootstrap', () => {
  it('starts Storehouse and interactive Day 1 Assignments without pre-seeding a Challenge', () => {
    const state = createNewGameState(TEST_CHARACTER_CREATION);
    expect(state.works.activeWorkId).toBe('work-storehouse-reckoning');
    expect(state.works.progress[STOREHOUSE_WORK_ID]).toBeDefined();
    expect(state.works.progress[STOREHOUSE_WORK_ID].provisionContract).toBeUndefined();
    expect(getInitializedScribal(state.world.people[state.player.currentCharacterId])?.wallet.provisions).toBe(5);
    expect(state.calendar.displayDate).toBe('Day 1 · Uruk (c. 3200 BCE)');
    const dayOneOffers = Object.values(state.opportunities.assignments);
    expect(dayOneOffers.map((offer) => offer.title)).toEqual([
      'South-Court Delivery Reconciliation',
      'South Loading-Awning Inspection',
    ]);
    expect(dayOneOffers.every((offer) => offer.status === 'offered' && !!offer.activityId
      && Number.isInteger(offer.estimatedTotalAp) && offer.apCost === undefined)).toBe(true);
    expect(dayOneOffers.reduce((total, offer) => total + (offer.estimatedTotalAp ?? 0), 0)).toBe(7);
    expect(dayOneOffers.every((offer) => offer.offeredDay === 1 && offer.expiresDay === 4)).toBe(true);
    expect(state.opportunities.challenges).toEqual({});
    expect(state.actionEconomy.apRemaining).toBe(6);
    expect(state.world.people[state.player.currentCharacterId].name).toBe('Test Scribe');
    expect(state.world.people).not.toHaveProperty('person-enlil-barni');
    expect(getInitializedScribal(state.world.people[state.player.currentCharacterId])).toMatchObject({ careerXp: 0, wallet: { money: 0, provisions: 5 }, stress: 0 });
    expect(isValidSaveEnvelope(createSaveEnvelope(state, 1), catalog)).toBe(true);
  });

  it('keeps createInitialGameState separate from the production content bootstrap', async () => {
    const { createInitialGameState } = await import('../state/initialState');
    const state = createInitialGameState();
    expect(state.works.activeWorkId).toBeNull();
    expect(state.opportunities.assignments).toEqual({});
    expect(state.opportunities.challenges).toEqual({});
  });
});

describe('Challenge character ownership', () => {
  function presentFixtureChallenge(state: ReturnType<typeof createNewGameState>, id: string) {
    const result = transitionGame(state, { type: 'PRESENT_CHALLENGE', challenge: challenge(id) });
    expect(result.feedback?.code).toBe('challenge-presented');
    return result.state;
  }

  function challenge(id: string): Omit<ChallengeInstance, 'status' | 'assigneePersonId'> {
    return {
      id: id as ChallengeId,
      title: 'A disputed practice copy',
      description: 'An apprentice asks how to preserve an uncertain line.',
      category: 'scribal_instruction',
      context: {
        what: 'Decide how to handle an uncertain line.',
        who: ['Nin-aya', 'Current scribe'],
        quantity: 'One line on a practice tablet.',
        when: 'Day 1',
        where: 'Scribal room, Uruk',
        from: 'The apprentice’s oral recollection.',
        to: 'The practice tablet.',
        purpose: 'Preserve uncertainty without silently changing the source.',
        responsibility: ['The current scribe advises; the Senior Scribe retains authority.'],
        provenance: ['Apprentice report and practice copy.'],
      },
      deliveryChannels: [{ kind: 'baseline_reach', explanation: 'Within ordinary professional reach.' }],
      presentedDay: 1,
      apCost: 1,
      choices: [
        { id: 'preserve-uncertain-reading', label: 'Preserve uncertainty', description: 'Mark the line uncertain.', consequences: { careerXp: 3 } },
        { id: 'recopy', label: 'Request recitation', description: 'Wait for another recitation.', consequences: { moneyDelta: -1 } },
      ],
    };
  }

  it('does not share or consume the two-Assignment cap', () => {
    let state = createNewGameState(TEST_CHARACTER_CREATION);
    const assignmentIds = Object.keys(state.opportunities.assignments) as import('../state/ids').AssignmentId[];
    state = transitionGame(state, { type: 'ACCEPT_ASSIGNMENT', assignmentId: assignmentIds[0] }).state;
    state = transitionGame(state, { type: 'ACCEPT_ASSIGNMENT', assignmentId: assignmentIds[1] }).state;
    state = presentFixtureChallenge(state, 'challenge-cap-one');
    const challengeId = 'challenge-cap-one' as ChallengeId;
    const acceptedChallenge = transitionGame(state, { type: 'ACCEPT_CHALLENGE', challengeId });
    expect(acceptedChallenge.feedback?.code).toBe('challenge-accepted');
    expect(acceptedChallenge.state.opportunities.challenges[challengeId].status).toBe('accepted');

    const second = presentFixtureChallenge(createNewGameState(TEST_CHARACTER_CREATION), 'challenge-cap-two');
    const secondChallengeId = 'challenge-cap-two' as ChallengeId;
    const withChallenge = transitionGame(second, { type: 'ACCEPT_CHALLENGE', challengeId: secondChallengeId }).state;
    const firstAssignmentId = Object.keys(withChallenge.opportunities.assignments)[0] as import('../state/ids').AssignmentId;
    const acceptedAssignment = transitionGame(withChallenge, { type: 'ACCEPT_ASSIGNMENT', assignmentId: firstAssignmentId });
    expect(acceptedAssignment.feedback?.code).toBe('assignment-accepted');
  });

  it('requires acceptance and current-character ownership before resolution', () => {
    let state = presentFixtureChallenge(createNewGameState(TEST_CHARACTER_CREATION), 'challenge-ownership');
    const challengeId = 'challenge-ownership' as ChallengeId;
    const offeredResolution = transitionGame(state, { type: 'RESOLVE_CHALLENGE', challengeId, choiceId: 'preserve-uncertain-reading' });
    expect(offeredResolution.feedback?.code).toBe('challenge-not-active');
    state = transitionGame(state, { type: 'ACCEPT_CHALLENGE', challengeId }).state;
    const otherCharacter = 'person-uruk-nin-aya' as PersonId;
    const originalPlayerId = state.player.currentCharacterId;
    const switched = { ...state, player: { currentCharacterId: otherCharacter } };
    const wrongOwner = transitionGame(switched, { type: 'RESOLVE_CHALLENGE', challengeId, choiceId: 'preserve-uncertain-reading' });
    expect(wrongOwner.feedback?.code).toBe('challenge-not-active');
    expect(wrongOwner.state.opportunities.challenges[challengeId].status).toBe('accepted');
    expect(wrongOwner.state.opportunities.challenges[challengeId].assigneePersonId).toBe(originalPlayerId);
  });

  it('requires assigneePersonId for accepted Challenges in saves while preserving empty schema-v2 maps', () => {
    const emptyLegacy = {
      ...createNewGameState(TEST_CHARACTER_CREATION),
      opportunities: { ...createNewGameState(TEST_CHARACTER_CREATION).opportunities, challenges: {} },
    };
    expect(isValidSaveEnvelope(createSaveEnvelope(emptyLegacy, 1), catalog)).toBe(true);

    const state = presentFixtureChallenge(createNewGameState(TEST_CHARACTER_CREATION), 'challenge-save');
    const id = 'challenge-save' as ChallengeId;
    const accepted = transitionGame(state, { type: 'ACCEPT_CHALLENGE', challengeId: id }).state;
    expect(isValidSaveEnvelope(createSaveEnvelope(accepted, 1), catalog)).toBe(true);
    const { assigneePersonId: _owner, ...ownerless } = accepted.opportunities.challenges[id];
    const invalid = {
      ...accepted,
      opportunities: { ...accepted.opportunities, challenges: { ...accepted.opportunities.challenges, [id]: ownerless } },
    };
    expect(isValidSaveEnvelope(createSaveEnvelope(invalid, 1), catalog)).toBe(false);
  });

  it('preserves accepted Challenge ownership through succession after a relationship is established in play', () => {
    let state = presentFixtureChallenge(createNewGameState(TEST_CHARACTER_CREATION), 'challenge-succession-intro');
    const introductoryChallengeId = 'challenge-succession-intro' as ChallengeId;
    state = transitionGame(state, { type: 'ACCEPT_CHALLENGE', challengeId: introductoryChallengeId }).state;
    state = transitionGame(state, {
      type: 'RESOLVE_CHALLENGE', challengeId: introductoryChallengeId, choiceId: 'preserve-uncertain-reading',
    }).state;
    const originalPlayerId = state.player.currentCharacterId;
    const id = 'challenge-handoff-ownership' as ChallengeId;
    const acceptedChallenge = {
      ...challenge(id), status: 'accepted' as const, assigneePersonId: originalPlayerId,
    };
    state = {
      ...state,
      opportunities: {
        ...state.opportunities,
        challenges: { ...state.opportunities.challenges, [id]: acceptedChallenge },
      },
    };
    const departure = transitionGame(state, { type: 'BEGIN_CHARACTER_DEPARTURE', departureKind: 'departure' });
    expect(departure.state.pendingSuccession?.candidateIds).toContain('person-uruk-nin-aya');
    state = transitionGame(departure.state, {
      type: 'SELECT_SUCCESSOR', nextCharacterId: 'person-uruk-nin-aya' as PersonId,
    }).state;
    expect(state.player.currentCharacterId).toBe('person-uruk-nin-aya');
    expect(state.opportunities.challenges[id].assigneePersonId).toBe(originalPlayerId);
    const resolution = transitionGame(state, { type: 'RESOLVE_CHALLENGE', challengeId: id, choiceId: 'preserve-uncertain-reading' });
    expect(resolution.feedback?.code).toBe('challenge-not-active');
  });

  it('keeps declined Challenges archived as declined and unavailable for acceptance', () => {
    let state = presentFixtureChallenge(createNewGameState(TEST_CHARACTER_CREATION), 'challenge-decline');
    const id = 'challenge-decline' as ChallengeId;
    state = transitionGame(state, { type: 'DECLINE_CHALLENGE', challengeId: id }).state;
    expect(state.opportunities.challenges[id].status).toBe('declined');
    expect(transitionGame(state, { type: 'ACCEPT_CHALLENGE', challengeId: id }).feedback?.code).toBe('challenge-not-offered');
  });

  it('archives the resolving character on the permanent Challenge outcome', () => {
    let state = presentFixtureChallenge(createNewGameState(TEST_CHARACTER_CREATION), 'challenge-archive');
    const id = 'challenge-archive' as ChallengeId;
    const originalPlayerId = state.player.currentCharacterId;
    state = transitionGame(state, { type: 'ACCEPT_CHALLENGE', challengeId: id }).state;
    const result = transitionGame(state, { type: 'RESOLVE_CHALLENGE', challengeId: id, choiceId: 'preserve-uncertain-reading' });
    expect(result.feedback?.code).toBe('challenge-resolved');
    expect(result.feedback?.message).toContain('A disputed practice copy: Preserve uncertainty.');
    expect(result.feedback?.message).toContain('Mark the line uncertain.');
    expect(result.state.opportunities.challengeOutcomes[0].assigneePersonId).toBe(originalPlayerId);
    expect(result.state.historicalProgression.historicalXp).toBe(0);
  });
});


describe('GD-CHARACTER-START-001 fresh-game integration', () => {
  it('starts each orientation with the approved baseline and the same Storehouse tutorial', () => {
    const orientations = ['government', 'military', 'religious', 'merchant'] as const;
    const states = orientations.map((careerPath) => createNewGameState({
      ...TEST_CHARACTER_CREATION,
      careerPath,
    }));
    const tutorial = states[0].works.progress[STOREHOUSE_WORK_ID];

    for (const state of states) {
      const person = state.world.people[state.player.currentCharacterId];
      const scribal = getInitializedScribal(person)!;
      expect(person.name).toBe(TEST_CHARACTER_CREATION.name);
      expect(person.lifeStage).toBe('apprentice');
      expect(person.characterCreation?.contentVersion).toBe(ERA_I_CHARACTER_CREATION_CONTENT_VERSION);
      expect(person.lifeEvents).toHaveLength(5);
      expect(Object.keys(scribal.attributes)).toHaveLength(6);
      expect(Object.keys(scribal.skills)).toHaveLength(6);
      expect(Object.values(scribal.skills).every((skill) => skill.level === 1)).toBe(true);
      expect(scribal.professionalReputation).toEqual({
        competence: 50, reliability: 50, discretion: 50, judgment: 50,
      });
      expect(scribal).toMatchObject({
        careerXp: 0,
        wallet: { money: 0, provisions: 5 },
        stress: 0,
        obligations: [],
        specializations: [],
        traits: [],
        conditions: [],
        equipment: [],
        institutionalStanding: {},
      });
      expect(state.world.appointments && Object.values(state.world.appointments).some((item) => item.personId === person.id)).toBe(false);
      expect(state.world.relationships[person.id]).toBeUndefined();
      expect(state.world.people).not.toHaveProperty('person-enlil-barni');
      expect(state.player.currentCharacterId).toBe(person.id);
      expect(state.actionEconomy).toMatchObject({ dailyApAllocation: 6, apRemaining: 6 });
      expect(state.works.activeWorkId).toBe(STOREHOUSE_WORK_ID);
      expect(state.works.progress[STOREHOUSE_WORK_ID]).toEqual(tutorial);
      expect(state.historicalProgression.historicalXp).toBe(0);
    }
    expect(states.map((state) => state.world.people[state.player.currentCharacterId].scribal?.careerPath))
      .toEqual(orientations);
  });
});
