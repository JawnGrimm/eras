import { describe, expect, it } from 'vitest';
import { generateDailyAssignments } from '../engine/assignmentGenerator';
import { transitionOpportunityAction } from '../engine/opportunities';
import { createInitialGameState } from '../state/initialState';
import type { GameState } from '../state/types';
import type { EventId, MatterId } from '../state/ids';

describe('matter-driven Assignment discovery', () => {
  it('discovers authored activities only from active matters listed by their institution', () => {
    const state = createInitialGameState();
    const generated = generateDailyAssignments(state);
    const offers = Object.values(generated.opportunities.assignments);

    expect(offers.map((offer) => offer.title)).toEqual([
      'South-Court Delivery Reconciliation',
      'South Loading-Awning Inspection',
    ]);
    expect(offers.every((offer) => !!offer.originMatterId)).toBe(true);
    expect(offers.every((offer) => generated.world.matters[offer.originMatterId!]?.status === 'active')).toBe(true);
    expect(offers.every((offer) => generated.world.institutions[generated.world.matters[offer.originMatterId!]!.institutionId]
      .activeMatters.includes(offer.originMatterId!))).toBe(true);
  });

  it('does not discover opportunities from developed or institutionally inactive matters', () => {
    const base = createInitialGameState();
    const institutionId = 'institution-uruk-temple-storehouse' as keyof typeof base.world.institutions;
    const deliveryId = 'matter-south-court-delivery-reconciliation' as MatterId;
    const awningId = 'matter-south-loading-awning-inspection' as MatterId;
    const materialId = 'matter-era1-com-f01-material-description' as MatterId;
    const matters = {
      ...base.world.matters,
      [deliveryId]: { ...base.world.matters[deliveryId], status: 'developed' as const },
    };
    const activeMatters = base.world.institutions[institutionId].activeMatters.filter((id) => id !== awningId && id !== materialId);
    const state: GameState = {
      ...base,
      world: {
        ...base.world,
        matters,
        institutions: { ...base.world.institutions, [institutionId]: { ...base.world.institutions[institutionId], activeMatters } },
      },
    };

    expect(Object.values(generateDailyAssignments(state).opportunities.assignments)).toHaveLength(0);
  });

  it('supports multiple matters of one authored type without conflating their offers', () => {
    const base = createInitialGameState();
    const institutionId = 'institution-uruk-temple-storehouse' as keyof typeof base.world.institutions;
    const originalId = 'matter-south-court-delivery-reconciliation' as MatterId;
    const secondId = 'matter-south-court-delivery-followup' as MatterId;
    const original = base.world.matters[originalId];
    const secondEventId = 'event-south-court-delivery-followup' as keyof typeof base.world.events;
    const secondEvent = { ...base.world.events['event-south-court-delivery-source' as keyof typeof base.world.events],
      id: secondEventId, dayNumber: 1, summary: 'A separate later dispatch and receiving tally require their own reconciliation.' };
    const second = { ...original, id: secondId, createdDay: 2, sourceEventId: secondEventId,
      summary: 'A second dispatch and receipt discrepancy requires its own reconciliation.' };
    const state: GameState = {
      ...base,
      world: {
        ...base.world,
        matters: { ...base.world.matters, [secondId]: second }, events: { ...base.world.events, [secondEventId]: secondEvent },
        institutions: {
          ...base.world.institutions,
          [institutionId]: {
            ...base.world.institutions[institutionId],
            activeMatters: [...base.world.institutions[institutionId].activeMatters, secondId],
          },
        },
      },
    };

    const generated = generateDailyAssignments(state);
    const deliveryOffers = Object.values(generated.opportunities.assignments)
      .filter((offer) => offer.activityId === 'activity-south-court-delivery-reconciliation');
    expect(deliveryOffers).toHaveLength(2);
    expect(new Set(deliveryOffers.map((offer) => offer.originMatterId))).toEqual(new Set([originalId, secondId]));
    expect(generated.opportunities.occurrenceLedger.filter((entry) => entry.scenarioId === 'activity-south-court-delivery-reconciliation')).toHaveLength(2);
    expect(deliveryOffers.reduce((sum, offer) => sum + (offer.estimatedTotalAp ?? 0), 0)).toBe(6);
    const nextDayDiscovery = generateDailyAssignments(generated);
    for (const matterId of [originalId, secondId]) {
      expect(Object.values(nextDayDiscovery.opportunities.assignments).filter((offer) => offer.originMatterId === matterId)).toHaveLength(1);
    }
  });
  it('does not enforce the soft AP supply target or a hard daily offer-count cap', () => {
    const base = createInitialGameState();
    const institutionId = 'institution-uruk-temple-storehouse' as keyof typeof base.world.institutions;
    const delivery = base.world.matters['matter-south-court-delivery-reconciliation' as MatterId];
    const awning = base.world.matters['matter-south-loading-awning-inspection' as MatterId];
    const additional = Array.from({ length: 3 }, (_, index) => [
      { ...delivery, id: `matter-delivery-additional-${index}` as MatterId, createdDay: 1,
        sourceEventId: `event-delivery-additional-${index}` as keyof typeof base.world.events },
      { ...awning, id: `matter-awning-additional-${index}` as MatterId, createdDay: 1,
        sourceEventId: `event-awning-additional-${index}` as keyof typeof base.world.events },
    ]).flat();
    const additionalEvents = additional.map((matter) => {
      const template = matter.kind === 'south_court_delivery_reconciliation'
        ? base.world.events['event-south-court-delivery-source' as keyof typeof base.world.events]
        : base.world.events['event-south-loading-awning-source' as keyof typeof base.world.events];
      return { ...template, id: matter.sourceEventId!, dayNumber: 1, summary: `A separate material occurrence for ${matter.id}.` };
    });
    const state: GameState = {
      ...base,
      world: {
        ...base.world,
        matters: { ...base.world.matters, ...Object.fromEntries(additional.map((matter) => [matter.id, matter])) },
        events: { ...base.world.events, ...Object.fromEntries(additionalEvents.map((event) => [event.id, event])) },
        institutions: {
          ...base.world.institutions,
          [institutionId]: {
            ...base.world.institutions[institutionId],
            activeMatters: [...base.world.institutions[institutionId].activeMatters, ...additional.map((matter) => matter.id)],
          },
        },
      },
    };
    const generated = generateDailyAssignments(state);
    const offers = Object.values(generated.opportunities.assignments);
    expect(offers.length).toBeGreaterThan(4);
    expect(offers.reduce((sum, offer) => sum + (offer.estimatedTotalAp ?? 0), 0)).toBeGreaterThan(8);
    expect(new Set(offers.map((offer) => offer.originMatterId)).size).toBe(offers.length);
  });

  it('keeps distinct durable matters independently addressable when they share a source fact', () => {
    const base = createInitialGameState();
    const institutionId = 'institution-uruk-temple-storehouse' as keyof typeof base.world.institutions;
    const originalId = 'matter-south-court-delivery-reconciliation' as MatterId;
    const duplicateId = 'matter-south-court-delivery-duplicate-wrapper' as MatterId;
    const duplicate = { ...base.world.matters[originalId], id: duplicateId };
    const state: GameState = {
      ...base,
      world: {
        ...base.world,
        matters: { ...base.world.matters, [duplicateId]: duplicate },
        institutions: { ...base.world.institutions, [institutionId]: {
          ...base.world.institutions[institutionId],
          activeMatters: [...base.world.institutions[institutionId].activeMatters, duplicateId],
        } },
      },
    };
    const generated = generateDailyAssignments(state);
    expect(Object.values(generated.opportunities.assignments).filter((offer) => offer.activityId === 'activity-south-court-delivery-reconciliation')).toHaveLength(2);
    expect(generated.opportunities.occurrenceLedger.filter((entry) => entry.scenarioId === 'activity-south-court-delivery-reconciliation')).toHaveLength(2);
  });

  it('generates an anchor only when an active matter has a real source event', () => {
    const base = createInitialGameState();
    const institutionId = 'institution-uruk-temple-storehouse' as keyof typeof base.world.institutions;
    const matterId = 'matter-era1-com-01-occurrence' as MatterId;
    const eventId = 'event-era1-com-01-occurrence' as EventId;
    const templateMatter = base.world.matters['matter-south-court-delivery-reconciliation' as MatterId];
    const templateEvent = base.world.events['event-south-court-delivery-source' as EventId];
    const event = { ...templateEvent, id: eventId, summary: 'A distinct provisional consignment occurrence is presented for receiving review.' };
    const matter = { ...templateMatter, id: matterId, kind: 'era1_com_01_consignment' as const,
      sourceEventId: eventId, summary: 'A provisional sealed consignment is presented for receiving review.',
      provenance: [...(templateMatter.provenance ?? []), { id: 'era1-com-01-event-source', kind: 'event' as const, sourceId: eventId, description: 'Distinct authored anchor occurrence.' }] };
    const state: GameState = {
      ...base,
      world: {
        ...base.world,
        events: { ...base.world.events, [eventId]: event },
        matters: { ...base.world.matters, [matterId]: matter },
        institutions: { ...base.world.institutions, [institutionId]: {
          ...base.world.institutions[institutionId], activeMatters: [...base.world.institutions[institutionId].activeMatters, matterId],
        } },
      },
    };
    const generated = generateDailyAssignments(state);
    const anchor = Object.values(generated.opportunities.assignments).find((offer) => offer.activityId === 'activity-era1-com-01-sealed-consignment');
    expect(anchor).toMatchObject({ title: 'Sealed Vessel and Textile Consignment', estimatedTotalAp: 5,
      compensation: { money: 10, provisions: 0 }, careerXpReward: 12, originMatterId: matterId });
    expect(generated.opportunities.occurrenceLedger.some((entry) => entry.scenarioId === 'activity-era1-com-01-sealed-consignment'
      && entry.primarySourceFact?.id === eventId && entry.requiredSourceFactIds.includes(eventId))).toBe(true);
  });

  it('reoffers the same active matter only when a new provenance-backed event appears', () => {
    const base = createInitialGameState();
    const first = generateDailyAssignments(base);
    const activityId = 'activity-south-court-delivery-reconciliation';
    const firstOffer = Object.values(first.opportunities.assignments).find((offer) => offer.activityId === activityId)!;
    const matterId = firstOffer.originMatterId!;
    const matter = first.world.matters[matterId];
    const eventId = 'event-south-court-delivery-second-occurrence' as EventId;
    const templateEvent = Object.values(first.world.events)[0];
    const event = { ...templateEvent, id: eventId, dayNumber: first.calendar.dayNumber,
      summary: 'A new, separately recorded receiving occurrence for the same active delivery matter.' };
    const updatedMatter = { ...matter, sourceEventId: eventId,
      provenance: [...(matter.provenance ?? []), { id: 'delivery-second-occurrence', kind: 'event' as const,
        sourceId: eventId, description: 'A materially new receiving occurrence.' }] };
    const withNewOccurrence: GameState = { ...first, world: {
      ...first.world, events: { ...first.world.events, [eventId]: event },
      matters: { ...first.world.matters, [matterId]: updatedMatter },
    } };
    const second = generateDailyAssignments(withNewOccurrence);
    const offers = Object.values(second.opportunities.assignments).filter((offer) =>
      offer.activityId === activityId && offer.originMatterId === matterId);
    expect(offers).toHaveLength(2);
    expect(new Set(offers.map((offer) => offer.occurrenceKey)).size).toBe(2);
    expect(new Set(offers.map((offer) => offer.id)).size).toBe(2);
    const secondOffer = offers.find((offer) => offer.id !== firstOffer.id)!;
    const accepted = transitionOpportunityAction(second, { type: 'ACCEPT_ASSIGNMENT', assignmentId: secondOffer.id });
    expect(accepted.feedback?.code).toBe('assignment-accepted');
    const ledger = accepted.state.opportunities.occurrenceLedger.filter((entry) => entry.scenarioId === activityId && entry.matterId === matterId);
    expect(ledger.find((entry) => entry.occurrenceKey === firstOffer.occurrenceKey)?.lifecycle).toBe('offered');
    expect(ledger.find((entry) => entry.occurrenceKey === secondOffer.occurrenceKey)?.lifecycle).toBe('accepted');
  });

});
