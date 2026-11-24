import { describe, expect, it } from 'vitest';
import { generateDailyAssignments } from '../engine/assignmentGenerator';
import { advanceInstitutionalMatters } from '../engine/institutionalMatters';
import { transitionGame } from '../engine/actionEconomy';
import { createInitialGameState } from '../state/initialState';
import { createSaveEnvelope, isValidSaveEnvelope, restoreSave } from '../state/saveEnvelope';
import { INITIAL_WORK_CATALOG } from '../state/newGameState';
import { ASSIGNMENT_ACTIVITY_CATALOG, validateAssignmentActivityDefinition } from '../content/assignments/northBayRoofInspection';
import { ERA1_COM_F01_ACTIVITY_ID, ERA1_COM_F01_OPPORTUNITY_DEFINITION, ERA1_COM_F01_PEOPLE } from '../content/assignments/eraICommercialMartial';
import type { GameState } from '../state/types';
import type { EventId, MatterId } from '../state/ids';

describe('ERA1-COM-F01 Material Not As Described', () => {
  it('is a valid authored activity and reuses the existing Tier A reward contract', () => {
    const activity = ASSIGNMENT_ACTIVITY_CATALOG[ERA1_COM_F01_ACTIVITY_ID];
    expect(validateAssignmentActivityDefinition(activity)).toEqual([]);
    expect(activity.discoveries.map((item) => item.id)).toEqual(['comf01-request','comf01-tag','comf01-observation','comf01-carrier-account']);
    expect(ERA1_COM_F01_OPPORTUNITY_DEFINITION.offer.estimatedTotalAp).toBe(5);
    expect(ERA1_COM_F01_OPPORTUNITY_DEFINITION.offer.compensation).toEqual({ money: 10, provisions: 0 });
    expect(ERA1_COM_F01_OPPORTUNITY_DEFINITION.offer.careerXpReward).toBe(12);
    expect(ERA1_COM_F01_OPPORTUNITY_DEFINITION.offer.requiredSkills).toEqual({});
  });

  it('becomes available on its scheduled day from one active matter and causal event, without duplicate presentation', () => {
    const initial = createInitialGameState();
    const dayOne = generateDailyAssignments(initial);
    expect(Object.values(dayOne.opportunities.assignments).some((offer) => offer.activityId === ERA1_COM_F01_ACTIVITY_ID)).toBe(false);
    const advanced = advanceInstitutionalMatters(dayOne, 2);
    const dayTwoWorld = { ...advanced, calendar: { ...advanced.calendar, dayNumber: 2 } };
    expect(dayTwoWorld.world.matters['matter-era1-com-f01-material-description' as MatterId]?.createdDay).toBe(2);
    const generated = generateDailyAssignments(dayTwoWorld);
    const offers = Object.values(generated.opportunities.assignments).filter((offer) => offer.activityId === ERA1_COM_F01_ACTIVITY_ID);
    expect(offers).toHaveLength(1);
    expect(offers[0]).toMatchObject({
      title: 'Material Not As Described',
      originMatterId: 'matter-era1-com-f01-material-description',
      sourceEventId: 'event-era1-com-f01-seeded-delivery',
      offeredDay: 2,
    });
    expect(generated.opportunities.occurrenceLedger.filter((entry) => entry.scenarioId === ERA1_COM_F01_ACTIVITY_ID)).toHaveLength(1);
    const repeated = generateDailyAssignments(generated);
    expect(Object.values(repeated.opportunities.assignments).filter((offer) => offer.activityId === ERA1_COM_F01_ACTIVITY_ID)).toHaveLength(1);
    expect(repeated.opportunities.occurrenceLedger.filter((entry) => entry.scenarioId === ERA1_COM_F01_ACTIVITY_ID)).toHaveLength(1);
  });

  it('gives separate matters and causal events distinct occurrence identities', () => {
    const advanced = advanceInstitutionalMatters(createInitialGameState(), 2);
    const base = { ...advanced, calendar: { ...advanced.calendar, dayNumber: 2 } };
    const matterId = 'matter-era1-com-f01-second-delivery' as MatterId;
    const eventId = 'event-era1-com-f01-second-delivery' as EventId;
    const originalMatter = base.world.matters['matter-era1-com-f01-material-description' as MatterId];
    const originalEvent = base.world.events['event-era1-com-f01-seeded-delivery' as EventId];
    const secondMatter = { ...originalMatter, id: matterId, sourceEventId: eventId, createdDay: 2 };
    const secondEvent = { ...originalEvent, id: eventId, dayNumber: 2, summary: 'A separate procurement request and delivery occurrence has its own source event.' };
    const institutionId = originalMatter.institutionId;
    const state: GameState = {
      ...base,
      world: {
        ...base.world,
        matters: { ...base.world.matters, [matterId]: secondMatter },
        events: { ...base.world.events, [eventId]: secondEvent },
        institutions: { ...base.world.institutions, [institutionId]: {
          ...base.world.institutions[institutionId], activeMatters: [...base.world.institutions[institutionId].activeMatters, matterId],
        } },
      },
    };
    const generated = generateDailyAssignments(state);
    const offers = Object.values(generated.opportunities.assignments).filter((offer) => offer.activityId === ERA1_COM_F01_ACTIVITY_ID);
    expect(offers).toHaveLength(2);
    expect(new Set(offers.map((offer) => offer.occurrenceKey)).size).toBe(2);
    expect(new Set(offers.map((offer) => offer.id)).size).toBe(2);
  });

  it('plays through evidence acquisition and submission without granting Historical Progress XP', () => {
    const advanced = advanceInstitutionalMatters(createInitialGameState(), 2);
    const initial = { ...advanced, calendar: { ...advanced.calendar, dayNumber: 2 } };
    let state = generateDailyAssignments(initial);
    const offer = Object.values(state.opportunities.assignments).find((item) => item.activityId === ERA1_COM_F01_ACTIVITY_ID)!;
    state = transitionGame(state, { type: 'ACCEPT_ASSIGNMENT', assignmentId: offer.id }).state;
    for (const actionId of ['comf01-consult-receiver','comf01-compare-request-tag','comf01-inspect-load','comf01-consult-carrier']) {
      const result = transitionGame(state, { type: 'PERFORM_ASSIGNMENT_ACTIVITY_ACTION', assignmentId: offer.id, actionId });
      expect(result.feedback?.kind).not.toBe('error');
      state = result.state;
    }
    const draft = {
      finding: 'tag_observation_differ', responsibilityClaim: 'none',
      citedDiscoveryIds: ['comf01-request','comf01-tag','comf01-observation','comf01-carrier-account'],
      limitations: [], recommendations: ['hold_for_craft_examination'],
      selectedLimitationIds: ['material_not_identified','no_intent_or_liability','no_acceptance_authority'],
    };
    state = transitionGame(state, { type: 'UPDATE_ASSIGNMENT_ACTIVITY_DRAFT', assignmentId: offer.id, draft }).state;
    const submitted = transitionGame(state, { type: 'SUBMIT_ASSIGNMENT_ACTIVITY', assignmentId: offer.id });
    expect(submitted.feedback?.code).toBe('assignment-activity-submitted');
    expect(submitted.state.opportunities.assignments[offer.id].status).toBe('completed');
    expect(submitted.state.opportunities.assignments[offer.id].closingReceipt?.assessment).toBe('Thorough');
    expect(Object.values(submitted.state.records.entries).some((record) => record.title === 'Material description comparison')).toBe(true);
    expect(submitted.state.historicalProgression.historicalXp).toBe(0);
    const playerId = submitted.state.player.currentCharacterId;
    const urLamma = ERA1_COM_F01_PEOPLE.workshopOverseer;
    expect(submitted.state.world.knowledge[`knowledge-${offer.id}-day-2-${ERA1_COM_F01_PEOPLE.responsibleAuthority}`]?.holder)
      .toEqual({ kind: 'person', id: ERA1_COM_F01_PEOPLE.responsibleAuthority });
    expect(submitted.state.world.relationships[urLamma]?.[playerId]?.dimensions).toMatchObject({ trust: 52, respect: 51 });
    expect(submitted.state.world.relationships[playerId]?.[urLamma]).toBeUndefined();
    expect(submitted.state.world.relationships[ERA1_COM_F01_PEOPLE.receiver]?.[playerId]?.dimensions).toMatchObject({ trust: 52, respect: 51 });
    const disposition = Object.values(submitted.state.records.entries).find((record) => record.title === 'Receiving disposition — Material Not As Described');
    expect(disposition?.assertions[0].text).toContain('Receiving entry held');
    expect(submitted.state.world.events[disposition!.sources[1].sourceId as EventId]).toBeDefined();
    expect(submitted.state.world.matters['matter-era1-com-f01-material-description' as MatterId].status).toBe('active');
    expect(submitted.state.world.matters['matter-era1-com-f01-material-description' as MatterId].provenance?.some((source) => source.sourceId === disposition!.id)).toBe(true);
    const envelope = createSaveEnvelope(submitted.state, 3);
    expect(isValidSaveEnvelope(envelope, INITIAL_WORK_CATALOG)).toBe(true);
    expect(restoreSave(JSON.stringify(envelope), INITIAL_WORK_CATALOG)?.state.opportunities.assignments[offer.id].status).toBe('completed');
    expect(submitted.state.world.people[ERA1_COM_F01_PEOPLE.workshopOverseer]?.name).toBe('Ur-Lamma');
    expect(submitted.state.world.people[ERA1_COM_F01_PEOPLE.responsibleAuthority]?.name).toBe('Lu-Nanshe');
  });
  it('records all recommendation dispositions and keeps incomplete or overreached reports on hold', () => {
    const run = (recommendation: string, incomplete = false, overreached = false) => {
      const advanced = advanceInstitutionalMatters(createInitialGameState(), 2);
      const initial = { ...advanced, calendar: { ...advanced.calendar, dayNumber: 2 } };
      let state = generateDailyAssignments(initial);
      const offer = Object.values(state.opportunities.assignments).find((item) => item.activityId === ERA1_COM_F01_ACTIVITY_ID)!;
      state = transitionGame(state, { type: 'ACCEPT_ASSIGNMENT', assignmentId: offer.id }).state;
      for (const actionId of ['comf01-consult-receiver','comf01-compare-request-tag','comf01-inspect-load','comf01-consult-carrier']) {
        state = transitionGame(state, { type: 'PERFORM_ASSIGNMENT_ACTIVITY_ACTION', assignmentId: offer.id, actionId }).state;
      }
      const draft = {
        finding: overreached ? 'identify_material' : 'tag_observation_differ',
        responsibilityClaim: 'none',
        citedDiscoveryIds: incomplete ? ['comf01-request','comf01-tag'] : ['comf01-request','comf01-tag','comf01-observation','comf01-carrier-account'],
        limitations: [], recommendations: [recommendation],
        selectedLimitationIds: incomplete ? [] : ['material_not_identified','no_intent_or_liability','no_acceptance_authority'],
      };
      state = transitionGame(state, { type: 'UPDATE_ASSIGNMENT_ACTIVITY_DRAFT', assignmentId: offer.id, draft }).state;
      return transitionGame(state, { type: 'SUBMIT_ASSIGNMENT_ACTIVITY', assignmentId: offer.id }).state;
    };
    const cases = [
      ['hold_for_craft_examination', 'Receiving entry held; referral recorded for Ur-Lamma'],
      ['enter_with_exception', 'Description difference entered as an exception; acceptance remains pending'],
      ['request_clarifying_record', 'Receiving entry held; clarifying-record request routed to Lu-Nanshe'],
    ];
    for (const [recommendation, expected] of cases) {
      const result = run(recommendation);
      const disposition = Object.values(result.records.entries).find((record) => record.title === 'Receiving disposition — Material Not As Described')!;
      expect(disposition.assertions[0].text).toContain(expected);
      expect(result.world.matters['matter-era1-com-f01-material-description' as MatterId].status).toBe('active');
      const restored = restoreSave(JSON.stringify(createSaveEnvelope(result, 3)), INITIAL_WORK_CATALOG)?.state;
      expect(restored?.records.entries[disposition.id]).toEqual(disposition);
    }
    for (const [incomplete, overreached, expected] of [
      [true, false, 'Report set aside'],
      [false, true, 'Report returned'],
    ] as const) {
      const result = run('enter_with_exception', incomplete, overreached);
      const disposition = Object.values(result.records.entries).find((record) => record.title === 'Receiving disposition — Material Not As Described')!;
      expect(disposition.assertions[0].text).toContain(expected);
      const playerId = result.player.currentCharacterId;
      expect(result.world.relationships[ERA1_COM_F01_PEOPLE.workshopOverseer]?.[playerId]).toBeUndefined();
      expect(result.world.matters['matter-era1-com-f01-material-description' as MatterId].status).toBe('active');
    }
  });

});
