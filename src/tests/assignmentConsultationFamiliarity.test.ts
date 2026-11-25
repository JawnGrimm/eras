import { describe, expect, it } from 'vitest';
import { ERA1_COM_F01_ACTIVITY_ID, ERA1_COM_F01_PEOPLE } from '../content/assignments/eraICommercialMartial';
import { ERA1_MAR_F03_OPPORTUNITY_DEFINITION, ERA1_MAR_PEOPLE } from '../content/assignments/eraIMartialFamilies';
import { ASSIGNMENT_ACTIVITY_CATALOG } from '../content/assignments/northBayRoofInspection';
import { advanceInstitutionalMatters } from '../engine/institutionalMatters';
import { generateDailyAssignments } from '../engine/assignmentGenerator';
import { transitionAssignmentActivityAction } from '../engine/assignmentActivity';
import { resolveChallengeTrigger } from '../engine/challengeDirector';
import { createInitialGameState } from '../state/initialState';
import { createSaveEnvelope, isValidSaveEnvelope } from '../state/saveEnvelope';
import { deriveRelationshipFamiliarityStage } from '../state/relationshipFamiliarity';
import type { AssignmentId } from '../state/ids';
import type { AssignmentOffer, GameState } from '../state/types';

function acceptedF01State(): { state: GameState; offer: AssignmentOffer } {
  let state = createInitialGameState();
  state = advanceInstitutionalMatters(state, 2);
  state = { ...state, calendar: { ...state.calendar, dayNumber: 2 } };
  state = generateDailyAssignments(state);
  const offer = Object.values(state.opportunities.assignments).find((item) => item.activityId === ERA1_COM_F01_ACTIVITY_ID);
  if (!offer) throw new Error('Expected the F01 anchor Assignment to be generated.');
  const definition = ASSIGNMENT_ACTIVITY_CATALOG[ERA1_COM_F01_ACTIVITY_ID];
  const accepted: AssignmentOffer = {
    ...offer, status: 'accepted', assigneePersonId: state.player.currentCharacterId,
    activityProgress: definition.createInitialProgress(),
  };
  state = { ...state, opportunities: { ...state.opportunities, assignments: {
    ...state.opportunities.assignments, [offer.id]: accepted,
  } } };
  return { state, offer: accepted };
}

describe('assignment consultation familiarity', () => {
  it('records a directional, Event-provenanced episode for a substantive authored consultation', () => {
    const { state, offer } = acceptedF01State();
    const playerId = state.player.currentCharacterId;
    const result = transitionAssignmentActivityAction(state, {
      type: 'PERFORM_ASSIGNMENT_ACTIVITY_ACTION', assignmentId: offer.id, actionId: 'comf01-consult-receiver',
    });

    expect(result.feedback?.kind).toBe('success');
    expect(result.state.actionEconomy.apRemaining).toBe(state.actionEconomy.apRemaining - 1);
    const event = Object.values(result.state.world.events).find((item) =>
      item.id === `event-assignment-consultation-${offer.id}-comf01-consult-receiver`,
    );
    expect(event?.personIds).toEqual([playerId, ERA1_COM_F01_PEOPLE.receiver]);
    expect(event?.summary).toContain('consulted');
    expect(deriveRelationshipFamiliarityStage(
      result.state.world.relationshipFamiliarityEpisodes, playerId, ERA1_COM_F01_PEOPLE.receiver,
    )).toBe('acquainted');
    expect(deriveRelationshipFamiliarityStage(
      result.state.world.relationshipFamiliarityEpisodes, ERA1_COM_F01_PEOPLE.receiver, playerId,
    )).toBeNull();
    const episode = Object.values(result.state.world.relationshipFamiliarityEpisodes)[0];
    expect(episode.provenance).toEqual([{ kind: 'event', id: event?.id }]);
    expect(episode.matterId).toBe(offer.originMatterId);
    expect(isValidSaveEnvelope(createSaveEnvelope(result.state, 1))).toBe(true);
  });

  it('links anchor relationship history to the actual disposition Event', () => {
    const { state: initial, offer } = acceptedF01State();
    let state = initial;
    for (const actionId of [
      'comf01-consult-receiver', 'comf01-consult-carrier',
      'comf01-compare-request-tag', 'comf01-inspect-load',
    ]) {
      const action = transitionAssignmentActivityAction(state, {
        type: 'PERFORM_ASSIGNMENT_ACTIVITY_ACTION', assignmentId: offer.id, actionId,
      });
      expect(action.feedback?.kind).toBe('success');
      state = action.state;
    }
    const draft = transitionAssignmentActivityAction(state, {
      type: 'UPDATE_ASSIGNMENT_ACTIVITY_DRAFT', assignmentId: offer.id,
      draft: {
        finding: 'tag_observation_differ', responsibilityClaim: 'none',
        citedDiscoveryIds: ['comf01-request', 'comf01-tag', 'comf01-observation', 'comf01-carrier-account'],
        limitations: [], recommendations: ['hold_for_craft_examination'],
        selectedLimitationIds: ['material_not_identified', 'no_intent_or_liability', 'no_acceptance_authority'],
      },
    });
    expect(draft.feedback?.kind).toBe('success');
    const submitted = transitionAssignmentActivityAction(draft.state, {
      type: 'SUBMIT_ASSIGNMENT_ACTIVITY', assignmentId: offer.id,
    });
    expect(submitted.feedback?.kind).toBe('success');

    const playerId = initial.player.currentCharacterId;
    const relationship = submitted.state.world.relationships[ERA1_COM_F01_PEOPLE.workshopOverseer]?.[playerId];
    const dispositionEvent = Object.values(submitted.state.world.events).find((event) =>
      event.summary.includes('Utu-mansum’s receiving response to the submitted report'),
    );
    expect(dispositionEvent).toBeDefined();
    expect(relationship?.history.at(-1)?.eventId).toBe(dispositionEvent?.id);
    const trigger = resolveChallengeTrigger(submitted.state, {
      domain: 'relationship_update', fromId: ERA1_COM_F01_PEOPLE.workshopOverseer, toId: playerId,
      deliveryChannels: [{ kind: 'baseline_reach', explanation: 'A recorded institutional disposition entered the scribe’s professional history.' }],
    });
    expect(trigger?.primarySourceFact).toEqual({ kind: 'event', id: dispositionEvent?.id });
    expect(isValidSaveEnvelope(createSaveEnvelope(submitted.state, 1))).toBe(true);
  });

  it('does not treat a compare action source attribution as a direct consultation', () => {
    let state = createInitialGameState();
    state = advanceInstitutionalMatters(state, 13);
    state = { ...state, calendar: { ...state.calendar, dayNumber: 13 } };
    const activityId = ERA1_MAR_F03_OPPORTUNITY_DEFINITION.offer.activityId;
    const definition = ASSIGNMENT_ACTIVITY_CATALOG[activityId];
    expect(state.world.people[ERA1_MAR_PEOPLE.sigAna]).toBeDefined();
    const base = Object.values(state.opportunities.assignments)[0];
    if (!base) throw new Error('Expected an Assignment offer fixture.');
    const offer: AssignmentOffer = {
      ...base, id: 'assignment-mar03-source-test' as AssignmentId,
      activityId, title: ERA1_MAR_F03_OPPORTUNITY_DEFINITION.offer.title,
      employer: ERA1_MAR_F03_OPPORTUNITY_DEFINITION.offer.employer,
      originMatterId: undefined, status: 'accepted', assigneePersonId: state.player.currentCharacterId,
      activityProgress: definition.createInitialProgress(),
    };
    state = { ...state, opportunities: { ...state.opportunities, assignments: {
      ...state.opportunities.assignments, [offer.id]: offer,
    } } };
    const reviewed = transitionAssignmentActivityAction(state, {
      type: 'PERFORM_ASSIGNMENT_ACTIVITY_ACTION', assignmentId: offer.id, actionId: 'mar03-review-dispatch',
    });
    expect(reviewed.feedback?.kind).toBe('success');
    const compared = transitionAssignmentActivityAction(reviewed.state, {
      type: 'PERFORM_ASSIGNMENT_ACTIVITY_ACTION', assignmentId: offer.id, actionId: 'mar03-check-landing-message',
    });
    expect(compared.feedback?.kind).toBe('success');
    expect(compared.state.world.events).toEqual(reviewed.state.world.events);
    expect(compared.state.world.relationshipFamiliarityEpisodes).toEqual(reviewed.state.world.relationshipFamiliarityEpisodes);
    expect(compared.state.opportunities.assignments[offer.id].activityProgress?.consultedPersonIds).toContain(ERA1_MAR_PEOPLE.sigAna);
  });

  it('does not create an Event or familiarity episode for an action without a consultation subject', () => {
    const { state, offer } = acceptedF01State();
    const result = transitionAssignmentActivityAction(state, {
      type: 'PERFORM_ASSIGNMENT_ACTIVITY_ACTION', assignmentId: offer.id, actionId: 'comf01-inspect-load',
    });
    expect(result.feedback?.kind).toBe('success');
    expect(result.state.world.events).toEqual(state.world.events);
    expect(result.state.world.relationshipFamiliarityEpisodes).toEqual(state.world.relationshipFamiliarityEpisodes);
  });
});
