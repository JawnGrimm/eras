import { describe, expect, it } from 'vitest';
import type { ChallengeId, EventId, PersonId, RecordId } from '../state/ids';
import type { ChallengeInstance, GameState } from '../state/types';
import { createInitialGameState } from '../state/initialState';
import { isValidSaveEnvelope, createSaveEnvelope } from '../state/saveEnvelope';
import { CHALLENGE_TRIGGER_RULES, resolveChallengeTrigger, selectWeightedChallengeCandidate } from '../engine/challengeDirector';
import type { ChallengeTriggerDescriptor } from '../engine/challengeDirector';
import { addActivity, transitionOpportunityAction } from '../engine/opportunities';
import { generateDailyAssignments } from '../engine/assignmentGenerator';
import { MATTER_IDS } from '../engine/institutionalMatters';

function challenge(id: string): Omit<ChallengeInstance, 'status' | 'assigneePersonId'> {
  return {
    id: id as ChallengeId,
    title: 'A bounded administrative question',
    description: 'Review the available evidence and recommend a defensible next step.',
    category: 'test',
    context: {
      what: 'Review the recorded discrepancy.',
      who: ['Senior Scribe'],
      purpose: 'Preserve the evidence without assigning unsupported responsibility.',
      responsibility: ['The scribe recommends; the appointed official decides.'],
      provenance: ['A specific recorded event.'],
    },
    deliveryChannels: [{ kind: 'baseline_reach', explanation: 'The source report reached the current scribe.' }],
    presentedDay: 1,
    apCost: 1,
    choices: [{
      id: 'preserve',
      label: 'Preserve the discrepancy',
      description: 'Carry both figures forward without inventing a cause.',
      consequences: { careerXp: 0 },
    }],
  };
}

describe('Challenge candidate selection and occurrence lifecycle', () => {
  it('selects deterministically regardless of candidate insertion order', () => {
    const candidates = [
      { scenarioId: 'scenario-b', occurrenceKey: 'scenario-b|event:event-b', weight: 3 },
      { scenarioId: 'scenario-a', occurrenceKey: 'scenario-a|event:event-a', weight: 1 },
      { scenarioId: 'scenario-c', occurrenceKey: 'scenario-c|event:event-c', weight: 2 },
    ];
    const selected = selectWeightedChallengeCandidate(candidates, 'creator-seed-123', 'era-1:4');
    const reversed = selectWeightedChallengeCandidate([...candidates].reverse(), 'creator-seed-123', 'era-1:4');
    expect(selected).toEqual(reversed);
    expect(selectWeightedChallengeCandidate(candidates, 'creator-seed-123', 'era-1:4')).toEqual(selected);
    expect(selectWeightedChallengeCandidate(candidates, 'creator-seed-123', 'era-1:5')).not.toBeUndefined();
  });

  it('resolves direct institutional-matter, event, and event-linked relationship triggers', () => {
    const base = createInitialGameState();
    const channels = [{ kind: 'baseline_reach' as const, explanation: 'The recorded source reached the current scribe through the stated work.' }];
    const generated = generateDailyAssignments(base);
    const matterOccurrence = resolveChallengeTrigger(generated, {
      domain: 'institutional_matter_update',
      matterId: MATTER_IDS.southCourtDelivery,
      statuses: ['active'],
      minimumAgeDays: 0,
      deliveryActivityId: 'activity-south-court-delivery-reconciliation',
      deliveryKinds: ['presented'],
    });
    expect(matterOccurrence?.matterId).toBe(MATTER_IDS.southCourtDelivery);
    expect(matterOccurrence?.primarySourceFact.kind).toBe('event');

    const southCourtMatter = generated.world.matters[MATTER_IDS.southCourtDelivery];
    const matterWithoutSource = {
      ...generated,
      world: {
        ...generated.world,
        matters: { ...generated.world.matters, [southCourtMatter.id]: { ...southCourtMatter, sourceEventId: undefined } },
      },
    };
    expect(resolveChallengeTrigger(matterWithoutSource, {
      domain: 'institutional_matter_update',
      matterId: MATTER_IDS.southCourtDelivery,
      statuses: ['active'],
      minimumAgeDays: 0,
      deliveryActivityId: 'activity-south-court-delivery-reconciliation',
      deliveryKinds: ['presented'],
    })).toBeNull();

    const eventId = Object.keys(base.world.events)[0] as EventId;
    const eventOccurrence = resolveChallengeTrigger(base, {
      domain: 'authored_world_event',
      eventId,
      deliveryChannels: channels,
    });
    expect(eventOccurrence?.primarySourceFact).toEqual({ kind: 'event', id: eventId });
    expect(resolveChallengeTrigger(base, {
      domain: 'authored_world_event',
      eventId: 'event-not-present' as EventId,
      deliveryChannels: channels,
    })).toBeNull();
    expect(resolveChallengeTrigger(base, {
      domain: 'authored_world_event',
      eventId,
      deliveryChannels: [],
    })).toBeNull();

    const people = Object.keys(base.world.people);
    const fromId = people[0] as PersonId;
    const toId = people[1] as PersonId;
    const linked: GameState = {
      ...base,
      world: {
        ...base.world,
        relationships: {
          ...base.world.relationships,
          [fromId]: {
            ...base.world.relationships[fromId],
            [toId]: {
              dimensions: { trust: 50, respect: 50, affection: 50, resentment: 0, rivalry: 0 },
              history: [{ id: 'relationship-trigger-test', dayNumber: 1, summary: 'A recorded directional relationship change.', eventId }],
            },
          },
        },
      },
    };
    const relationshipOccurrence = resolveChallengeTrigger(linked, {
      domain: 'relationship_update',
      fromId,
      toId,
      deliveryChannels: channels,
    });
    expect(relationshipOccurrence?.primarySourceFact).toEqual({ kind: 'event', id: eventId });

    const unlinked: GameState = {
      ...linked,
      world: {
        ...linked.world,
        relationships: {
          ...linked.world.relationships,
          [fromId]: {
            ...linked.world.relationships[fromId]!,
            [toId]: {
              ...linked.world.relationships[fromId]![toId]!,
              history: [{ id: 'relationship-unlinked-test', dayNumber: 1, summary: 'No linked event.' }],
            },
          },
        },
      },
    };
    expect(resolveChallengeTrigger(unlinked, {
      domain: 'relationship_update',
      fromId,
      toId,
      deliveryChannels: channels,
    })).toBeNull();
  });

  it('resolves player-action outcomes only from a completed Assignment with a valid causal matter event', () => {
    const generated = generateDailyAssignments(createInitialGameState());
    const offer = Object.values(generated.opportunities.assignments)
      .find((item) => item.activityId === 'activity-south-court-delivery-reconciliation')!;
    const completedOffer = { ...offer, status: 'completed' as const };
    const withCompletedOffer = {
      ...generated,
      opportunities: {
        ...generated.opportunities,
        assignments: { ...generated.opportunities.assignments, [offer.id]: completedOffer },
      },
    };
    const state = addActivity(withCompletedOffer, completedOffer, 'completed');
    const trigger: ChallengeTriggerDescriptor = {
      domain: 'player_action_outcome',
      activityId: 'activity-south-court-delivery-reconciliation',
      matterId: MATTER_IDS.southCourtDelivery,
      activityKinds: ['completed'],
    };

    const resolved = resolveChallengeTrigger(state, trigger);
    expect(resolved?.primarySourceFact).toEqual({
      kind: 'event',
      id: state.world.matters[MATTER_IDS.southCourtDelivery].sourceEventId,
    });

    const noActivity = {
      ...state,
      opportunities: { ...state.opportunities, recentActivity: [] },
    };
    expect(resolveChallengeTrigger(noActivity, trigger)).toBeNull();

    const matter = state.world.matters[MATTER_IDS.southCourtDelivery];
    const noSourceEvent = {
      ...state,
      world: {
        ...state.world,
        matters: { ...state.world.matters, [matter.id]: { ...matter, sourceEventId: undefined } },
      },
    };
    expect(resolveChallengeTrigger(noSourceEvent, trigger)).toBeNull();
  });

  it('resolves professional-behavior patterns only when the aggregate, recent activity, report, and source facts agree', () => {
    const generated = generateDailyAssignments(createInitialGameState());
    const offer = Object.values(generated.opportunities.assignments)
      .find((item) => item.activityId === 'activity-south-court-delivery-reconciliation')!;
    const completedOffer = { ...offer, status: 'completed' as const };
    const withCompletedOffer = {
      ...generated,
      opportunities: {
        ...generated.opportunities,
        assignments: { ...generated.opportunities.assignments, [offer.id]: completedOffer },
      },
    };
    const state = addActivity(withCompletedOffer, completedOffer, 'completed');
    const activity = state.opportunities.recentActivity[state.opportunities.recentActivity.length - 1];
    const recordId = `record-${offer.id}-day-${activity.dayNumber}` as RecordId;
    const report = {
      id: recordId,
      createdDay: activity.dayNumber,
      authorPersonId: state.player.currentCharacterId,
      title: 'South-Court Delivery Reconciliation',
      sources: [],
      assertions: [],
      uncertaintyLimits: [],
      amendments: [],
    };
    const withReport = {
      ...state,
      records: {
        ...state.records,
        entries: { ...state.records.entries, [recordId]: report },
      },
    };
    const trigger: ChallengeTriggerDescriptor = {
      domain: 'professional_behavior_pattern',
      rule: CHALLENGE_TRIGGER_RULES[0],
      activityId: 'activity-south-court-delivery-reconciliation',
      matterId: MATTER_IDS.southCourtDelivery,
      activityKinds: ['completed'],
      reportTitle: report.title,
    };

    const resolved = resolveChallengeTrigger(withReport, trigger);
    expect(resolved?.primarySourceFact).toEqual({ kind: 'record', id: recordId });

    expect(resolveChallengeTrigger(state, trigger)).toBeNull();

    const noPattern = {
      ...withReport,
      opportunities: {
        ...withReport.opportunities,
        assignmentAggregates: {},
        recentActivity: [],
      },
    };
    expect(resolveChallengeTrigger(noPattern, trigger)).toBeNull();
  });

  it('rejects invalid candidate weights rather than falling back to nondeterministic choice', () => {
    expect(selectWeightedChallengeCandidate([
      { scenarioId: 'scenario-a', occurrenceKey: 'a', weight: 0 },
    ], 'seed', 'era-1:1')).toBeUndefined();
  });

  it('enforces two unresolved Challenges and excludes declined Challenges from the cap', () => {
    let state = createInitialGameState();
    for (const id of ['challenge-cap-a', 'challenge-cap-b']) {
      const presented = transitionOpportunityAction(state, { type: 'PRESENT_CHALLENGE', challenge: challenge(id) });
      expect(presented.feedback?.code).toBe('challenge-presented');
      state = presented.state;
    }
    const blocked = transitionOpportunityAction(state, { type: 'PRESENT_CHALLENGE', challenge: challenge('challenge-cap-c') });
    expect(blocked.feedback?.code).toBe('challenge-cap-reached');
    state = transitionOpportunityAction(state, {
      type: 'DECLINE_CHALLENGE',
      challengeId: 'challenge-cap-a' as ChallengeId,
    }).state;
    const allowed = transitionOpportunityAction(state, { type: 'PRESENT_CHALLENGE', challenge: challenge('challenge-cap-c') });
    expect(allowed.feedback?.code).toBe('challenge-presented');
  });

  it('updates an occurrence ledger through accepted and completed Challenge states', () => {
    const base = createInitialGameState();
    const sourceEventId = Object.keys(base.world.events)[0] as EventId;
    const id = ('scenario-a|matter:matter-a|primary:event:' + sourceEventId) as ChallengeId;
    const item = challenge(id);
    const state: GameState = {
      ...base,
      opportunities: {
        ...base.opportunities,
        challenges: { [id]: { ...item, status: 'offered' } },
        occurrenceLedger: [{
          scenarioId: 'scenario-a',
          occurrenceKey: id,
          lifecycle: 'offered',
          primarySourceFact: { kind: 'event', id: sourceEventId },
          requiredSourceFactIds: [sourceEventId],
          deliveryChannels: item.deliveryChannels,
          presentedDay: 1,
        }],
      },
    };
    const duplicate = transitionOpportunityAction({
      ...state,
      opportunities: { ...state.opportunities, challenges: {} },
    }, { type: 'PRESENT_CHALLENGE', challenge: item });
    expect(duplicate.feedback?.code).toBe('challenge-occurrence-duplicate');

    const accepted = transitionOpportunityAction(state, { type: 'ACCEPT_CHALLENGE', challengeId: id });
    expect(accepted.state.opportunities.occurrenceLedger[0].lifecycle).toBe('accepted');
    expect(accepted.state.opportunities.occurrenceLedger[0].assigneePersonId).toBe(state.player.currentCharacterId);

    const resolved = transitionOpportunityAction(accepted.state, {
      type: 'RESOLVE_CHALLENGE', challengeId: id, choiceId: 'preserve',
    });
    expect(resolved.feedback?.code).toBe('challenge-resolved');
    expect(resolved.state.opportunities.occurrenceLedger[0].lifecycle).toBe('completed');
    expect(resolved.state.historicalProgression.historicalXp).toBe(0);
  });

  it('persists Challenge occurrence provenance in the existing schema-v3 ledger', () => {
    const base = createInitialGameState();
    const sourceEventId = Object.keys(base.world.events)[0] as EventId;
    const id = ('scenario-save|matter:matter-a|primary:event:' + sourceEventId) as ChallengeId;
    const item = challenge(id);
    const state: GameState = {
      ...base,
      opportunities: {
        ...base.opportunities,
        challenges: { [id]: { ...item, status: 'offered' } },
        occurrenceLedger: [{
          scenarioId: 'scenario-save',
          occurrenceKey: id,
          lifecycle: 'offered',
          primarySourceFact: { kind: 'event', id: sourceEventId },
          requiredSourceFactIds: [sourceEventId],
          deliveryChannels: item.deliveryChannels,
          presentedDay: 1,
        }],
      },
    };
    expect(isValidSaveEnvelope(createSaveEnvelope(state, 1))).toBe(true);
  });
});
