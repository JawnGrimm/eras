import { describe, expect, it } from 'vitest';
import { advanceInstitutionalMatters, createRoofRepairMatter, MATTER_IDS, STOREHOUSE_INSTITUTION_ID } from '../engine/institutionalMatters';
import { createInitialGameState } from '../state/initialState';
import { createSaveEnvelope, restoreSave } from '../state/saveEnvelope';
import type { GameState } from '../state/types';
import type { MatterId } from '../state/ids';

describe('typed institutional matters and bounded world tick', () => {
  it('normalizes the tutorial and all P1 north-bay matter descriptions into stable IDs', () => {
    const base = createInitialGameState();
    const legacyStrings = ['The Storehouse Reckoning', 'Verify north-bay roof repair', 'Verify north-bay roof repair (inspection incomplete)',
      'Roof repair certified without sufficient supporting inspection; physical condition remains unverified',
      'Clear north-bay parapet runoff channel and assess damp north-east beam socket',
      'North-bay roof repair inspected; continue monitoring after heavy rain',
      'Held-Barley Inspection recommended; seven sacks remain segregated, grain condition not yet assessed'];
    // Model a pre-Phase-2 schema-v2 save: the newer profile links did not yet exist.
    const people = Object.fromEntries(Object.entries(base.world.people).map(([id, person]) => [id, {
      ...person, circumstances: undefined, objectives: undefined, commitments: undefined,
    }]));
    const state = { ...base, world: { ...base.world, people, matters: {}, institutions: { ...base.world.institutions,
      [STOREHOUSE_INSTITUTION_ID]: { ...base.world.institutions[STOREHOUSE_INSTITUTION_ID], activeMatters: legacyStrings as unknown as typeof base.world.institutions[typeof STOREHOUSE_INSTITUTION_ID]['activeMatters'] } } } } as GameState;
    const restored = restoreSave(JSON.stringify(createSaveEnvelope(state, 1, '2026-11-22T12:00:00.000Z')));
    expect(restored).not.toBeNull();
    const institution = restored!.state.world.institutions[STOREHOUSE_INSTITUTION_ID];
    expect(institution.activeMatters).toEqual([MATTER_IDS.tutorial, MATTER_IDS.roofRepair, MATTER_IDS.heldBarley]);
    expect(restored!.state.world.matters[MATTER_IDS.roofRepair].scheduledDevelopment?.kind).toBe('rain');
    expect(restored!.state.world.matters[MATTER_IDS.heldBarley].sourceRecordId).toBeUndefined();
    expect(restored!.state.world.matters[MATTER_IDS.heldBarley].summary).toBe('Held-Barley Inspection recommended; seven sealed pottery storage jars containing held barley remain segregated, grain condition not yet assessed');
  });
  it('normalizes only known legacy held-barley matter summaries and preserves unknown copy', () => {
    const base = createInitialGameState();
    const oldSummary = 'Seven held barley sacks remain segregated; grain condition has not yet been assessed.';
    const customSummary = 'A custom note about sacks remains as originally authored.';
    const matter = { id: MATTER_IDS.heldBarley, institutionId: STOREHOUSE_INSTITUTION_ID, kind: 'held_barley_inspection' as const, summary: oldSummary, status: 'active' as const, createdDay: 1 };
    const customMatterId = 'matter-custom-held-note' as MatterId;
    const customMatter = { ...matter, id: customMatterId, summary: customSummary };
    const state = { ...base, world: { ...base.world,
      matters: { ...base.world.matters, [MATTER_IDS.heldBarley]: matter, [customMatterId]: customMatter },
      institutions: { ...base.world.institutions, [STOREHOUSE_INSTITUTION_ID]: { ...base.world.institutions[STOREHOUSE_INSTITUTION_ID], activeMatters: [...base.world.institutions[STOREHOUSE_INSTITUTION_ID].activeMatters, MATTER_IDS.heldBarley, customMatterId] } },
    } } as GameState;
    const restored = restoreSave(JSON.stringify(createSaveEnvelope(state, 1)));
    expect(restored?.state.world.matters[MATTER_IDS.heldBarley].summary).toBe('Seven sealed pottery storage jars containing held barley remain segregated; grain condition has not yet been assessed.');
    expect(restored?.state.world.matters[customMatterId].summary).toBe(customSummary);

    const submittedSummary = 'Seven held capacity measures are contained in seven segregated sacks. A finding and recommendation have been filed; internal grain condition and formal release remain unresolved.';
    const submittedMatter = { ...matter, summary: submittedSummary };
    const submittedState = { ...base, world: { ...base.world,
      matters: { ...base.world.matters, [MATTER_IDS.heldBarley]: submittedMatter },
      institutions: { ...base.world.institutions, [STOREHOUSE_INSTITUTION_ID]: { ...base.world.institutions[STOREHOUSE_INSTITUTION_ID], activeMatters: [...base.world.institutions[STOREHOUSE_INSTITUTION_ID].activeMatters, MATTER_IDS.heldBarley] } },
    } } as GameState;
    const submittedRestored = restoreSave(JSON.stringify(createSaveEnvelope(submittedState, 1)));
    expect(submittedRestored?.state.world.matters[MATTER_IDS.heldBarley].summary).toBe('Seven held capacity measures are contained in seven sealed pottery storage jars segregated on reed matting. A finding and recommendation have been filed; internal grain condition and formal release remain unresolved.');
  });

  it('does not rewrite an unrelated matter that happens to contain the same legacy wording', () => {
    const base = createInitialGameState();
    const legacySummary = 'Held-Barley Inspection recommended; seven sacks remain segregated, grain condition not yet assessed';
    const unrelatedMatterId = 'matter-custom-held-note' as MatterId;
    const unrelatedMatter = {
      id: unrelatedMatterId,
      institutionId: STOREHOUSE_INSTITUTION_ID,
      kind: 'general' as const,
      summary: legacySummary,
      status: 'active' as const,
      createdDay: 1,
    };
    const state = { ...base, world: { ...base.world,
      matters: { ...base.world.matters, [unrelatedMatterId]: unrelatedMatter },
      institutions: { ...base.world.institutions,
        [STOREHOUSE_INSTITUTION_ID]: { ...base.world.institutions[STOREHOUSE_INSTITUTION_ID],
          activeMatters: [...base.world.institutions[STOREHOUSE_INSTITUTION_ID].activeMatters, unrelatedMatterId] },
      },
    } } as GameState;
    const restored = restoreSave(JSON.stringify(createSaveEnvelope(state, 1)));
    expect(restored?.state.world.matters[unrelatedMatterId].summary).toBe(legacySummary);
  });

  it('advances an unresolved roof matter once when its scheduled rain arrives', () => {
    const base = createInitialGameState();
    const matter = { ...createRoofRepairMatter(1), scheduledDevelopment: { kind: 'rain' as const, dayNumber: 4 } };
    const state: GameState = { ...base, calendar: { ...base.calendar, dayNumber: 3 }, world: { ...base.world,
      matters: { [matter.id]: matter }, institutions: { ...base.world.institutions,
        [STOREHOUSE_INSTITUTION_ID]: { ...base.world.institutions[STOREHOUSE_INSTITUTION_ID], activeMatters: [matter.id] } } } };
    const advanced = advanceInstitutionalMatters(state, 4);
    expect(advanced.world.events['event-north-bay-rain-day-4' as never]?.dayNumber).toBe(4);
    expect(advanced.world.matters[MATTER_IDS.roofRepair].status).toBe('developed');
    expect(advanced.world.matters[MATTER_IDS.waterIngress].status).toBe('active');
    expect(advanced.world.institutions[STOREHOUSE_INSTITUTION_ID].activeMatters).toEqual([MATTER_IDS.waterIngress]);
    expect(advanceInstitutionalMatters(advanced, 5).world.events).toEqual(advanced.world.events);
  });
});
