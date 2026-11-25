import { describe, expect, it } from 'vitest';
import { ERA1_COM_F01_ACTIVITY_ID, ERA1_COM_F01_PEOPLE } from '../content/assignments/eraICommercialMartial';
import { ASSIGNMENT_ACTIVITY_CATALOG } from '../content/assignments/northBayRoofInspection';
import { advanceInstitutionalMatters } from '../engine/institutionalMatters';
import { generateDailyAssignments } from '../engine/assignmentGenerator';
import { transitionAssignmentActivityAction } from '../engine/assignmentActivity';
import { createInitialGameState } from '../state/initialState';
import { createSaveEnvelope, isValidSaveEnvelope } from '../state/saveEnvelope';
import { deriveRelationshipFamiliarityStage } from '../state/relationshipFamiliarity';
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
