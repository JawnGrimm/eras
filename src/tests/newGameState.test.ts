import { describe, expect, it } from 'vitest';
import { transitionGame } from '../engine/actionEconomy';
import { createNewGameState, INITIAL_WORK_CATALOG } from '../state/newGameState';
import { INITIAL_PERSON_ID } from '../state/initialState';
import { createSaveEnvelope, isValidSaveEnvelope } from '../state/saveEnvelope';
import type { ChallengeId, PersonId } from '../state/ids';
import type { ChallengeInstance } from '../state/types';
import { STOREHOUSE_WORK_ID } from '../works/storehouseReckoning';

const catalog = INITIAL_WORK_CATALOG;

describe('Day 1 Uruk production bootstrap', () => {
  it('starts Storehouse and seeds interactive Day 1 Assignments and the authored Challenge', () => {
    const state = createNewGameState();
    expect(state.works.activeWorkId).toBe('work-storehouse-reckoning');
    expect(state.works.progress[STOREHOUSE_WORK_ID]).toBeDefined();
    expect(state.works.progress[STOREHOUSE_WORK_ID].provisionContract).toBeUndefined();
    expect(state.world.people[INITIAL_PERSON_ID].scribal?.wallet.provisions).toBe(5);
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
    expect(Object.values(state.opportunities.challenges)).toHaveLength(1);
    const challenge = Object.values(state.opportunities.challenges)[0];
    expect(challenge.status).toBe('offered');
    expect(challenge.assigneePersonId).toBeUndefined();
    expect(challenge.choices).toHaveLength(2);
    expect(challenge.choices[0].consequences).not.toEqual(challenge.choices[1].consequences);
    expect(challenge.choices.every((choice) => !('historicalXp' in choice.consequences))).toBe(true);
    expect(JSON.stringify(challenge)).not.toMatch(/ev-0[1-7]/);
    expect(state.actionEconomy.apRemaining).toBe(6);
    expect(state.player.currentCharacterId).toBe(INITIAL_PERSON_ID);
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
  function challenge(id: string): Omit<ChallengeInstance, 'status' | 'assigneePersonId'> {
    return {
      id: id as ChallengeId,
      title: 'A disputed practice copy',
      description: 'An apprentice asks how to preserve an uncertain line.',
      category: 'scribal_instruction',
      context: {
        what: 'Decide how to handle an uncertain line.',
        who: ['Nin-aya', 'Enlil-barni'],
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
    let state = createNewGameState();
    const assignmentIds = Object.keys(state.opportunities.assignments) as import('../state/ids').AssignmentId[];
    state = transitionGame(state, { type: 'ACCEPT_ASSIGNMENT', assignmentId: assignmentIds[0] }).state;
    state = transitionGame(state, { type: 'ACCEPT_ASSIGNMENT', assignmentId: assignmentIds[1] }).state;
    const challengeId = Object.keys(state.opportunities.challenges)[0] as ChallengeId;
    const acceptedChallenge = transitionGame(state, { type: 'ACCEPT_CHALLENGE', challengeId });
    expect(acceptedChallenge.feedback?.code).toBe('challenge-accepted');
    expect(acceptedChallenge.state.opportunities.challenges[challengeId].status).toBe('accepted');

    const second = createNewGameState();
    const secondChallengeId = Object.keys(second.opportunities.challenges)[0] as ChallengeId;
    const withChallenge = transitionGame(second, { type: 'ACCEPT_CHALLENGE', challengeId: secondChallengeId }).state;
    const firstAssignmentId = Object.keys(withChallenge.opportunities.assignments)[0] as import('../state/ids').AssignmentId;
    const acceptedAssignment = transitionGame(withChallenge, { type: 'ACCEPT_ASSIGNMENT', assignmentId: firstAssignmentId });
    expect(acceptedAssignment.feedback?.code).toBe('assignment-accepted');
  });

  it('requires acceptance and current-character ownership before resolution', () => {
    let state = createNewGameState();
    const challengeId = Object.keys(state.opportunities.challenges)[0] as ChallengeId;
    const offeredResolution = transitionGame(state, { type: 'RESOLVE_CHALLENGE', challengeId, choiceId: 'preserve-uncertain-reading' });
    expect(offeredResolution.feedback?.code).toBe('challenge-not-active');
    state = transitionGame(state, { type: 'ACCEPT_CHALLENGE', challengeId }).state;
    const otherCharacter = 'person-uruk-nin-aya' as PersonId;
    const switched = { ...state, player: { currentCharacterId: otherCharacter } };
    const wrongOwner = transitionGame(switched, { type: 'RESOLVE_CHALLENGE', challengeId, choiceId: 'preserve-uncertain-reading' });
    expect(wrongOwner.feedback?.code).toBe('challenge-not-active');
    expect(wrongOwner.state.opportunities.challenges[challengeId].status).toBe('accepted');
    expect(wrongOwner.state.opportunities.challenges[challengeId].assigneePersonId).toBe(INITIAL_PERSON_ID);
  });

  it('requires assigneePersonId for accepted Challenges in saves while preserving empty schema-v2 maps', () => {
    const emptyLegacy = {
      ...createNewGameState(),
      opportunities: { ...createNewGameState().opportunities, challenges: {} },
    };
    expect(isValidSaveEnvelope(createSaveEnvelope(emptyLegacy, 1), catalog)).toBe(true);

    const state = createNewGameState();
    const id = Object.keys(state.opportunities.challenges)[0] as ChallengeId;
    const accepted = transitionGame(state, { type: 'ACCEPT_CHALLENGE', challengeId: id }).state;
    expect(isValidSaveEnvelope(createSaveEnvelope(accepted, 1), catalog)).toBe(true);
    const { assigneePersonId: _owner, ...ownerless } = accepted.opportunities.challenges[id];
    const invalid = {
      ...accepted,
      opportunities: { ...accepted.opportunities, challenges: { ...accepted.opportunities.challenges, [id]: ownerless } },
    };
    expect(isValidSaveEnvelope(createSaveEnvelope(invalid, 1), catalog)).toBe(false);
  });

  it('preserves Challenge ownership through a real character handoff', () => {
    let state = createNewGameState();
    const id = Object.keys(state.opportunities.challenges)[0] as ChallengeId;
    state = transitionGame(state, { type: 'ACCEPT_CHALLENGE', challengeId: id }).state;
    state = transitionGame(state, { type: 'BEGIN_CHARACTER_DEPARTURE', departureKind: 'departure' }).state;
    state = transitionGame(state, { type: 'SELECT_SUCCESSOR', nextCharacterId: 'person-uruk-nin-aya' as PersonId }).state;
    expect(state.player.currentCharacterId).toBe('person-uruk-nin-aya');
    expect(state.opportunities.challenges[id].assigneePersonId).toBe(INITIAL_PERSON_ID);
    const resolution = transitionGame(state, { type: 'RESOLVE_CHALLENGE', challengeId: id, choiceId: 'preserve-uncertain-reading' });
    expect(resolution.feedback?.code).toBe('challenge-not-active');
  });

  it('keeps declined Challenges archived as declined and unavailable for acceptance', () => {
    let state = createNewGameState();
    const id = Object.keys(state.opportunities.challenges)[0] as ChallengeId;
    state = transitionGame(state, { type: 'DECLINE_CHALLENGE', challengeId: id }).state;
    expect(state.opportunities.challenges[id].status).toBe('declined');
    expect(transitionGame(state, { type: 'ACCEPT_CHALLENGE', challengeId: id }).feedback?.code).toBe('challenge-not-offered');
  });

  it('archives the resolving character on the permanent Challenge outcome', () => {
    let state = createNewGameState();
    const id = Object.keys(state.opportunities.challenges)[0] as ChallengeId;
    state = transitionGame(state, { type: 'ACCEPT_CHALLENGE', challengeId: id }).state;
    const result = transitionGame(state, { type: 'RESOLVE_CHALLENGE', challengeId: id, choiceId: 'preserve-uncertain-reading' });
    expect(result.feedback?.code).toBe('challenge-resolved');
    expect(result.state.opportunities.challengeOutcomes[0].assigneePersonId).toBe(INITIAL_PERSON_ID);
    expect(result.state.historicalProgression.historicalXp).toBe(0);
  });
});
