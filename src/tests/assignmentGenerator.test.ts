import { describe, expect, it } from 'vitest';
import { generateDailyAssignments } from '../engine/assignmentGenerator';
import { createInitialGameState } from '../state/initialState';
import type { GameState } from '../state/types';
import type { MatterId } from '../state/ids';

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
    const matters = {
      ...base.world.matters,
      [deliveryId]: { ...base.world.matters[deliveryId], status: 'developed' as const },
    };
    const activeMatters = base.world.institutions[institutionId].activeMatters.filter((id) => id !== awningId);
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
    const second = { ...original, id: secondId, createdDay: 2, summary: 'A second dispatch and receipt discrepancy requires its own reconciliation.' };
    const state: GameState = {
      ...base,
      world: {
        ...base.world,
        matters: { ...base.world.matters, [secondId]: second },
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
    expect(deliveryOffers.reduce((sum, offer) => sum + (offer.estimatedTotalAp ?? 0), 0)).toBe(8);
    const nextDayDiscovery = generateDailyAssignments(generated);
    for (const matterId of [originalId, secondId]) {
      expect(Object.values(nextDayDiscovery.opportunities.assignments).filter((offer) => offer.originMatterId === matterId)).toHaveLength(1);
    }
  });
});
