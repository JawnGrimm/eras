import { describe, expect, it } from 'vitest';
import type { AssignmentId, EventId, InstitutionId, MatterId } from '../state/ids';
import { createInitialGameState } from '../state/initialState';
import { transitionGame } from '../engine/actionEconomy';
import { createNewGameState } from '../state/newGameState';
import { TEST_CHARACTER_CREATION } from './fixtures/newGameCharacter';
import { STOREHOUSE_WORK_ID } from '../works/storehouseReckoning';
import { createSaveEnvelope, isValidSaveEnvelope } from '../state/saveEnvelope';
import { INITIAL_WORK_CATALOG } from '../state/newGameState';
import { generateDailyAssignments } from '../engine/assignmentGenerator';
import { runChallengeDirector } from '../engine/challengeDirector';
import { transitionOpportunityAction } from '../engine/opportunities';
import { transitionAssignmentActivityAction } from '../engine/assignmentActivity';
import { MATTER_IDS } from '../engine/institutionalMatters';
import {
  heldBarleyInspection, southCourtDeliveryReconciliation, southLoadingAwningInspection, URUK_ASSIGNMENT_ACTIVITY_CATALOG,
} from '../content/assignments/urukAssignments';
import { validateAssignmentActivityDefinition } from '../content/assignments/northBayRoofInspection';
import type { AssignmentOffer, GameState } from '../state/types';

const STOREHOUSE = 'institution-uruk-temple-storehouse' as InstitutionId;
const HELD_MATTER = MATTER_IDS.heldBarley;

function withHeldMatter(state: GameState, createdDay = 1): GameState {
  const sourceEventId = 'event-held-barley-test-source' as EventId;
  const sourceEvent = {
    ...Object.values(state.world.events)[0],
    id: sourceEventId, dayNumber: createdDay,
    summary: 'A separately recorded held-stock inspection occurrence supports the active matter.',
  };
  const matter = {
    id: HELD_MATTER, institutionId: STOREHOUSE, kind: 'held_barley_inspection' as const,
    summary: 'Seven held measures remain segregated in seven sealed pottery storage jars.', status: 'active' as const, createdDay,
    sourceEventId,
    provenance: [{ id: 'held-barley-test-source', kind: 'event' as const, sourceId: sourceEventId, description: 'Distinct test fixture source occurrence.' }],
  };
  const institution = state.world.institutions[STOREHOUSE];
  return {
    ...state,
    world: {
      ...state.world,
      events: { ...state.world.events, [sourceEventId]: sourceEvent },
      matters: { ...state.world.matters, [HELD_MATTER]: matter },
      institutions: { ...state.world.institutions, [STOREHOUSE]: {
        ...institution, activeMatters: [...institution.activeMatters, HELD_MATTER],
      } },
    },
  };
}

function withCompletedTutorial(state: GameState): GameState {
  const tutorial = createNewGameState(TEST_CHARACTER_CREATION).works.progress[STOREHOUSE_WORK_ID];
  return {
    ...state,
    works: {
      ...state.works,
      activeWorkId: null,
      progress: { ...state.works.progress, [STOREHOUSE_WORK_ID]: { ...tutorial, status: 'completed' } },
    },
  };
}

function accept(state: GameState, offer: AssignmentOffer): GameState {
  return transitionOpportunityAction(state, { type: 'ACCEPT_ASSIGNMENT', assignmentId: offer.id }).state;
}
function perform(state: GameState, assignmentId: AssignmentId, actionId: string): GameState {
  return transitionAssignmentActivityAction(state, { type: 'PERFORM_ASSIGNMENT_ACTIVITY_ACTION', assignmentId, actionId }).state;
}
function draft(state: GameState, assignmentId: AssignmentId, value: {
  finding: string; responsibilityClaim: string; citedDiscoveryIds: string[]; limitations: string[]; recommendations: string[]; selectedLimitationIds?: string[]; limitationNotes?: string;
}): GameState {
  return transitionAssignmentActivityAction(state, { type: 'UPDATE_ASSIGNMENT_ACTIVITY_DRAFT', assignmentId, draft: value }).state;
}
function submit(state: GameState, assignmentId: AssignmentId): GameState {
  return transitionAssignmentActivityAction(state, { type: 'SUBMIT_ASSIGNMENT_ACTIVITY', assignmentId }).state;
}

describe('P2-2 authored Uruk Assignment activities', () => {
  it('validates all three typed activity definitions', () => {
    expect(validateAssignmentActivityDefinition(heldBarleyInspection)).toEqual([]);
    expect(validateAssignmentActivityDefinition(southCourtDeliveryReconciliation)).toEqual([]);
    expect(validateAssignmentActivityDefinition(southLoadingAwningInspection)).toEqual([]);
  });

  it('uses sealed pottery storage jars consistently in Held-Barley content', () => {
    const observation = heldBarleyInspection.discoveries.find((item) => item.id === 'held-container-observation')!;
    const inspectAction = heldBarleyInspection.actions.find((item) => item.id === 'held-inspect-sacks')!;
    const recommendationText = heldBarleyInspection.reportSchema.recommendations.map((item) => item.label).join(' ');
    expect(observation.title).toBe('Seven sealed pottery storage jars on reed matting');
    expect(observation.text).toContain('seven sealed pottery storage jars');
    expect(observation.text).not.toMatch(/\bsacks?\b/i);
    expect(inspectAction.label).toBe('Inspect the seven sealed jars');
    expect(recommendationText).toContain('jars');
    expect(recommendationText).not.toMatch(/\bsacks?\b/i);

    const generated = generateDailyAssignments(withHeldMatter(createInitialGameState()));
    const offer = Object.values(generated.opportunities.assignments).find((item) => item.activityId === heldBarleyInspection.id)!;
    expect(offer.description).toContain('sealed pottery storage jars');
    expect(offer.context.quantity).toContain('sealed pottery storage jars');
    expect(`${offer.description} ${offer.context.quantity}`).not.toMatch(/\bsacks?\b/i);
  });

  it('generates deterministic, bounded offers toward an 8 AP target and persists anti-repetition', () => {
    const state = createInitialGameState();
    const first = generateDailyAssignments(state);
    const second = generateDailyAssignments(state);
    const firstOffers = Object.values(first.opportunities.assignments);
    const secondOffers = Object.values(second.opportunities.assignments);
    expect(firstOffers.map((offer) => offer.id)).toEqual(secondOffers.map((offer) => offer.id));
    expect(firstOffers).toHaveLength(2);
    expect(firstOffers.every((offer) => !!offer.originMatterId)).toBe(true);
    expect(new Set(firstOffers.map((offer) => offer.originMatterId)).size).toBe(2);
    expect(firstOffers.reduce((sum, offer) => sum + (offer.estimatedTotalAp ?? 0), 0)).toBe(6);
    expect(first.opportunities.assignmentGeneratorLedger?.sequence).toBe(2);
    const sameDay = generateDailyAssignments(first);
    expect(Object.values(sameDay.opportunities.assignments)).toHaveLength(2);
    expect(Object.keys(sameDay.opportunities.assignmentGeneratorLedger?.lastPresentedDayByActivity ?? {})).toHaveLength(2);
  });

  it('offers Held-Barley only while the structured held-stock matter is active', () => {
    const fixture = withHeldMatter(createInitialGameState());
    expect(URUK_ASSIGNMENT_ACTIVITY_CATALOG[heldBarleyInspection.id as keyof typeof URUK_ASSIGNMENT_ACTIVITY_CATALOG]).toBeDefined();
    expect(fixture.world.events[fixture.world.matters[HELD_MATTER].sourceEventId!]).toBeDefined();
    expect(fixture.world.institutions[STOREHOUSE].activeMatters).toContain(HELD_MATTER);
    const generated = generateDailyAssignments(fixture);
    const held = Object.values(generated.opportunities.assignments).find((offer) => offer.activityId === heldBarleyInspection.id);
    expect(held?.estimatedTotalAp).toBe(3);
    expect(held?.originMatterId).toBe(HELD_MATTER);
    const withoutMatter = generateDailyAssignments(createInitialGameState());
    expect(Object.values(withoutMatter.opportunities.assignments).some((offer) => offer.activityId === heldBarleyInspection.id)).toBe(false);
  });

  it('validates and persists Assignment origin-matter references while rejecting missing matters', () => {
    const generated = generateDailyAssignments(createInitialGameState());
    const envelope = createSaveEnvelope(generated, 1, '2026-11-22T23:00:00.000Z');
    expect(isValidSaveEnvelope(envelope, INITIAL_WORK_CATALOG)).toBe(true);
    const offer = Object.values(generated.opportunities.assignments)[0];
    const invalid = {
      ...envelope,
      state: {
        ...envelope.state,
        opportunities: {
          ...envelope.state.opportunities,
          assignments: {
            ...envelope.state.opportunities.assignments,
            [offer.id]: { ...offer, originMatterId: 'matter-does-not-exist' as MatterId },
          },
        },
      },
    };
    expect(isValidSaveEnvelope(invalid, INITIAL_WORK_CATALOG)).toBe(false);
  });

  it('requires an active institution-linked source matter and never duplicates an opportunity for that matter', () => {
    const initial = createInitialGameState();
    const deliveryId = MATTER_IDS.southCourtDelivery;
    const delivery = initial.world.matters[deliveryId];
    const inactive = {
      ...initial,
      world: {
        ...initial.world,
        matters: { ...initial.world.matters, [deliveryId]: { ...delivery, status: 'resolved' as const } },
        institutions: { ...initial.world.institutions, [STOREHOUSE]: {
          ...initial.world.institutions[STOREHOUSE],
          activeMatters: initial.world.institutions[STOREHOUSE].activeMatters.filter((id) => id !== deliveryId),
        } },
      },
    };
    expect(Object.values(generateDailyAssignments(inactive).opportunities.assignments)
      .some((offer) => offer.originMatterId === deliveryId)).toBe(false);

    const generated = generateDailyAssignments(initial);
    const deliveryOffer = Object.values(generated.opportunities.assignments)
      .find((offer) => offer.originMatterId === deliveryId)!;
    const declined = transitionOpportunityAction(generated, {
      type: 'DECLINE_ASSIGNMENT', assignmentId: deliveryOffer.id,
    }).state;
    const later = { ...declined, calendar: { ...declined.calendar, dayNumber: declined.calendar.dayNumber + 5 } };
    const regenerated = generateDailyAssignments(later);
    expect(Object.values(regenerated.opportunities.assignments)
      .filter((offer) => offer.originMatterId === deliveryId)).toHaveLength(1);
  });

  it('files Held-Barley as a recommendation and preserves measure/container/grain boundaries', () => {
    let state = withHeldMatter(createInitialGameState());
    state = generateDailyAssignments(state);
    const offer = Object.values(state.opportunities.assignments).find((item) => item.activityId === heldBarleyInspection.id)!;
    state = accept(state, offer);
    state = perform(state, offer.id, 'held-consult-steward');
    state = perform(state, offer.id, 'held-inspect-sacks');
    state = perform(state, offer.id, 'held-compare-measures');
    state = draft(state, offer.id, {
      finding: 'surface_condition_only', responsibilityClaim: 'none',
      citedDiscoveryIds: ['held-container-observation','held-intake-record','held-recount-record'],
      limitations: [], recommendations: ['release_five_retain_two'], selectedLimitationIds: ['capacity_container_distinct','internal_condition_untested','no_release_authority'],
    });
    const historicalXp = state.historicalProgression.historicalXp;
    state = submit(state, offer.id);
    const completed = state.opportunities.assignments[offer.id];
    expect(completed.status).toBe('completed');
    const record = Object.values(state.records.entries).find((entry) => entry.title === 'Held-Barley Finding and Recommendation');
    expect(record).toBeDefined();
    expect(record && state.records.entries[record.id]).toEqual(record);
    expect(record?.uncertaintyLimits.join(' ').toLowerCase()).toContain('does not authorize release');
    expect(record?.assertions.map((assertion) => assertion.text).join(' ')).toContain('does not record a physical container count');
    expect(record?.assertions.map((assertion) => assertion.text).join(' ')).toContain('does not establish the condition of grain inside any jar');
    expect(record?.assertions.map((assertion) => assertion.text).join(' ')).toContain('sealed pottery storage jars');
    expect(record?.uncertaintyLimits.join(' ')).not.toMatch(/\bsacks?\b/i);
    expect(record?.assertions.map((assertion) => assertion.text).join(' ')).not.toMatch(/\bsacks?\b/i);
    expect(state.world.matters[HELD_MATTER]?.status).toBe('active');
    expect(state.world.matters[HELD_MATTER]?.provenance?.some((source) => source.kind === 'record_copy' && source.description.includes('does not itself resolve'))).toBe(true);
    expect(state.world.institutions[STOREHOUSE].activeMatters).toContain(HELD_MATTER);
    expect(state.historicalProgression.historicalXp).toBe(historicalXp);
  });

  it('holds real Challenge causes behind the introductory tutorial without queuing a generic onboarding Challenge', () => {
    let state = withHeldMatter(createInitialGameState(), 1);
    state = { ...state, calendar: { ...state.calendar, dayNumber: 3 } };
    const beforeTutorial = runChallengeDirector(state);
    expect(beforeTutorial.opportunities.challenges).toEqual({});

    const afterTutorial = runChallengeDirector(withCompletedTutorial(state));
    expect(afterTutorial.opportunities.challenges['challenge-seven-sacks' as never]?.title).toBe('The Seven Sealed Jars');

    const noCause = runChallengeDirector(withCompletedTutorial(createInitialGameState()));
    expect(noCause.opportunities.challenges).toEqual({});
  });

  it('records a neutral 24/23 reconciliation and triggers The Missing Measure without blaming Enlil-kisu', () => {
    let state = generateDailyAssignments(createInitialGameState());
    const offer = Object.values(state.opportunities.assignments).find((item) => item.activityId === southCourtDeliveryReconciliation.id)!;
    state = accept(state, offer);
    state = perform(state, offer.id, 'delivery-compare-tablets');
    state = perform(state, offer.id, 'delivery-consult-enlil');
    state = draft(state, offer.id, {
      finding: 'unlocated_discrepancy', responsibilityClaim: 'none',
      citedDiscoveryIds: ['delivery-dispatch-copy','delivery-arrival-tally','delivery-enlil-testimony'],
      limitations: [], recommendations: ['retain_both_request_origin'], selectedLimitationIds: ['cause_unlocated','no_individual_blame','no_amend_authority'],
    });
    state = submit(state, offer.id);
    expect(state.opportunities.recentActivity.some((activity) =>
      activity.assignmentId === offer.id && activity.kind === 'completed')).toBe(true);
    const record = Object.values(state.records.entries).find((entry) => entry.title === 'South-Court Delivery Reconciliation');
    expect(record?.assertions.some((assertion) => assertion.text.includes('24') && assertion.text.includes('23'))).toBe(true);
    expect(record?.assertions.some((assertion) => assertion.classification === 'disputed')).toBe(false);
    expect(state.world.matters[MATTER_IDS.southCourtDelivery]?.status).toBe('active');
    expect(state.world.matters[MATTER_IDS.southCourtDelivery]?.provenance?.some((source) => source.kind === 'record_copy')).toBe(true);
    const regenerated = generateDailyAssignments(state);
    expect(Object.values(regenerated.opportunities.assignments).filter((item) =>
      item.activityId === southCourtDeliveryReconciliation.id && item.originMatterId === MATTER_IDS.southCourtDelivery)).toHaveLength(1);
    expect(regenerated.opportunities.occurrenceLedger.filter((entry) =>
      entry.scenarioId === southCourtDeliveryReconciliation.id && entry.matterId === MATTER_IDS.southCourtDelivery)).toHaveLength(1);
    expect(state.world.matters['matter-south-court-delivery-discrepancy' as MatterId]).toBeUndefined();
    expect(state.world.relationships[state.player.currentCharacterId]?.['person-enlil-kisu' as never]?.dimensions).toMatchObject({ trust: 53, respect: 56 });
    expect(state.world.relationships['person-enlil-kisu' as never]?.[state.player.currentCharacterId]?.dimensions).toMatchObject({ trust: 57, respect: 53 });
    expect(state.world.relationships['person-shuruppak-ilu' as never]?.[state.player.currentCharacterId]).toBeUndefined();
    const directed = runChallengeDirector(withCompletedTutorial(state));
    expect(directed.opportunities.challenges['challenge-missing-measure' as never]?.title).toBe('The Missing Measure');
    expect(directed.historicalProgression.historicalXp).toBe(state.historicalProgression.historicalXp);
  });

  it('triggers The Seven Sacks after an open held-stock matter reaches two days and never reoffers after decline', () => {
    let state = withHeldMatter(createInitialGameState(), 1);
    state = { ...state, calendar: { ...state.calendar, dayNumber: 3 } };
    const directed = runChallengeDirector(withCompletedTutorial(state));
    const challenge = directed.opportunities.challenges['challenge-seven-sacks' as never];
    expect(challenge?.title).toBe('The Seven Sealed Jars');
    expect(challenge?.description).toContain('sealed pottery storage jars');
    expect(challenge?.description).not.toMatch(/\bsacks?\b/i);
    expect(challenge?.context.quantity).toContain('sealed pottery storage jars');
    const declined = transitionOpportunityAction(directed, { type: 'DECLINE_CHALLENGE', challengeId: challenge!.id }).state;
    const again = runChallengeDirector(withCompletedTutorial(declined));
    expect(again.opportunities.challenges['challenge-seven-sacks' as never]?.status).toBe('declined');
    expect(again.historicalProgression.historicalXp).toBe(state.historicalProgression.historicalXp);
  });
  it('includes a newly selected Challenge in the same Workday Morning Report', () => {
    let state = withHeldMatter(withCompletedTutorial(createInitialGameState()), 1);
    state = { ...state, calendar: { ...state.calendar, dayNumber: 3, displayDate: 'Day 3 · Uruk (c. 3200 BCE)' } };

    const closed = transitionGame(state, { type: 'END_DAY', expectedDayNumber: 3 });
    expect(closed.feedback?.code).toBe('evening-interlude-opened');
    const settlementId = closed.state.dayClose.pendingSettlementId;
    expect(settlementId).toBe('era-1:3');

    const begun = transitionGame(closed.state, { type: 'BEGIN_WORKDAY', expectedSettlementId: settlementId! });
    expect(begun.feedback?.code).toBe('workday-begun');
    const challenge = Object.values(begun.state.opportunities.challenges)
      .find((item) => item.title === 'The Seven Sealed Jars');
    expect(challenge?.presentedDay).toBe(4);

    const report = begun.state.journal.notices.find((notice) => notice.id === 'morning-report-day-4');
    expect(report?.message).toContain('New Challenge arose: The Seven Sealed Jars.');
    expect(begun.state.journal.notices.filter((notice) => notice.id === 'morning-report-day-4')).toHaveLength(1);
  });

});
