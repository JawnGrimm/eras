import { describe, expect, it } from 'vitest';
import { createInitialGameState } from '../../state/initialState';
import type { Person } from '../../state/types';
import type { PersonId } from '../../state/ids';
import {
  ERA_I_CHARACTER_HISTORY_CONTENT_VERSION,
  resolveEraICharacterHistory,
  validateEraICharacterHistoryChoices,
  type EraICharacterHistoryChoices,
} from './eraICharacterHistory';

const base = createInitialGameState();
const playerId = 'person-created-test' as PersonId;
const people = {
  ...base.world.people,
  [playerId]: { id: playerId, name: 'Test Scribe', alive: true, affiliations: [] } satisfies Person,
};

function choices(overrides: Partial<EraICharacterHistoryChoices> = {}): EraICharacterHistoryChoices {
  return {
    originId: 'OR-01',
    responsibilityId: 'RS-01',
    formativeExperienceId: 'FE-01',
    entryRouteId: 'EN-02',
    instructionId: 'TR-01',
    ...overrides,
  };
}

function resolve(overrides: Partial<EraICharacterHistoryChoices> = {}) {
  return resolveEraICharacterHistory({ personId: playerId, choices: choices(overrides), people });
}

describe('Era I deterministic character-history resolver', () => {
  it('resolves the approved content package into exactly five ordered events and a five-choice record', () => {
    const result = resolve();
    expect(result.characterCreation).toEqual({
      contentVersion: ERA_I_CHARACTER_HISTORY_CONTENT_VERSION,
      originId: 'OR-01',
      responsibilityId: 'RS-01',
      formativeExperienceId: 'FE-01',
      entryRouteId: 'EN-02',
      instructionId: 'TR-01',
    });
    expect(result.lifeEvents.map((item) => [item.kind, item.chronology.stage, item.chronology.order])).toEqual([
      ['origin', 'early_life', 0],
      ['early_responsibility', 'youth', 1],
      ['formative_experience', 'youth', 2],
      ['professional_entry', 'transition_to_scribal_work', 3],
      ['first_instruction', 'transition_to_scribal_work', 4],
    ]);
    expect(new Set(result.lifeEvents.map((item) => item.id)).size).toBe(5);
    expect(result.lifeEvents[3].participants).toEqual([{ personId: 'person-ur-nanna', role: 'recommender' }]);
    expect(result.lifeEvents[4].participants).toEqual([{ personId: 'person-shuruppak-ilu', role: 'trainer' }]);
  });

  it('covers the explicit RS-03 + EN-02 route to Utu-mansum, separately from Profile B', () => {
    const profileB = resolve({
      originId: 'OR-03', responsibilityId: 'RS-03', formativeExperienceId: 'FE-04',
      entryRouteId: 'EN-01', instructionId: 'TR-02',
    });
    const workRecommendation = resolve({
      originId: 'OR-03', responsibilityId: 'RS-03', formativeExperienceId: 'FE-04',
      entryRouteId: 'EN-02', instructionId: 'TR-02',
    });
    expect(profileB.lifeEvents[3].participants).toEqual([
      { personId: 'person-uruk-ur-gir', role: 'introducer' },
    ]);
    expect(workRecommendation.lifeEvents[3].participants).toEqual([
      { personId: 'person-utu-mansum', role: 'recommender' },
    ]);
  });

  it('matches every authored entry-route participant mapping', () => {
    const origins = ['OR-01', 'OR-02', 'OR-03', 'OR-04'] as const;
    const responsibilities = ['RS-01', 'RS-02', 'RS-03', 'RS-04'] as const;
    const routes = ['EN-01', 'EN-02', 'EN-03', 'EN-04'] as const;
    for (const originId of origins) for (const responsibilityId of responsibilities)
      for (const entryRouteId of routes) {
        const formativeExperienceId = responsibilityId === 'RS-01' || responsibilityId === 'RS-02'
          ? 'FE-01' : 'FE-02';
        const participant = resolve({
          originId, responsibilityId, formativeExperienceId, entryRouteId,
        }).lifeEvents[3].participants[0];
        const expected = responsibilityId === 'RS-01' ? 'person-ur-nanna'
          : responsibilityId === 'RS-02' ? 'person-enlil-kisu'
            : responsibilityId === 'RS-03' ? (entryRouteId === 'EN-01' ? 'person-uruk-ur-gir' : 'person-utu-mansum')
              : originId === 'OR-03' ? 'person-uruk-ur-gir'
                : originId === 'OR-04' ? 'person-enlil-kisu' : 'person-ur-nanna';
        expect(participant.personId).toBe(expected);
      }
  });

  it('keeps FE-01 + RS-02 as an observed delivery mismatch rather than a finding of fraud', () => {
    const result = resolve({ responsibilityId: 'RS-02', formativeExperienceId: 'FE-01' });
    expect(result.familiarities).toContainEqual(expect.objectContaining({
      domainId: 'delivery_custody', scopeId: 'delivery_mismatch_or_delay', exposure: 'observed',
    }));
    expect(result.lifeEvents[2].summary).not.toMatch(/fraud|culprit/i);
  });

  it('uses the origin-specific RS-03 familiarity scope and the literal FE-01 + RS-01 scope', () => {
    const expected: Record<EraICharacterHistoryChoices['originId'], string> = {
      'OR-01': 'food_or_produce_condition',
      'OR-02': 'agricultural_produce_condition',
      'OR-03': 'craft_material_or_workmanship_condition',
      'OR-04': 'goods_in_transit_condition',
    };
    for (const originId of Object.keys(expected) as Array<keyof typeof expected>) {
      const result = resolve({ originId, responsibilityId: 'RS-03', formativeExperienceId: 'FE-04' });
      expect(result.familiarities).toContainEqual(expect.objectContaining({
        domainId: 'material_quality', scopeId: expected[originId], exposure: 'assisted',
      }));
    }
    expect(resolve().familiarities).toContainEqual(expect.objectContaining({
      domainId: 'quantities_measurement', scopeId: 'discrepancy_in_selected_context', exposure: 'observed',
    }));
  });

  it('keeps TR-01 barley and beer notation as separate familiarity facts', () => {
    const result = resolve({ instructionId: 'TR-01' });
    expect(result.familiarities).toContainEqual(expect.objectContaining({
      domainId: 'quantities_measurement', scopeId: 'barley_quantity_notation', exposure: 'practiced_under_instruction',
    }));
    expect(result.familiarities).toContainEqual(expect.objectContaining({
      domainId: 'quantities_measurement', scopeId: 'beer_vessel_and_ingredient_notation', exposure: 'practiced_under_instruction',
    }));
    expect(result.familiarities.some((item) => item.scopeId.includes('grain_and_beer'))).toBe(false);
  });

  it('uses marked_and_sealed_records for TR-04 + RS-04', () => {
    const result = resolve({
      responsibilityId: 'RS-04', formativeExperienceId: 'FE-02', instructionId: 'TR-04',
    });
    expect(result.familiarities).toContainEqual(expect.objectContaining({
      domainId: 'account_comparison', scopeId: 'marked_and_sealed_records',
      exposure: 'practiced_under_instruction',
    }));
  });

  it('merges repeated domain/scope exposure at the strongest level and preserves both event sources', () => {
    const result = resolve({
      responsibilityId: 'RS-01', formativeExperienceId: 'FE-03', instructionId: 'TR-04',
    });
    const merged = result.familiarities.find((item) =>
      item.domainId === 'account_comparison' && item.scopeId === 'quantity_accounts');
    expect(merged).toEqual(expect.objectContaining({
      exposure: 'practiced_under_instruction',
      basisLifeEventIds: [
        `life-event-${playerId}-formative_experience`,
        `life-event-${playerId}-first_instruction`,
      ],
    }));
    expect(result.familiarities.filter((item) =>
      item.domainId === 'account_comparison' && item.scopeId === 'quantity_accounts')).toHaveLength(1);
  });

  it('rejects every unsupported or incompatible responsibility/formative pair before resolution', () => {
    const invalidPairs: Array<[EraICharacterHistoryChoices['responsibilityId'], EraICharacterHistoryChoices['formativeExperienceId']]> = [
      ['RS-03', 'FE-01'],
      ['RS-04', 'FE-01'],
      ['RS-04', 'FE-03'],
    ];
    for (const [responsibilityId, formativeExperienceId] of invalidPairs) {
      expect(validateEraICharacterHistoryChoices(choices({ responsibilityId, formativeExperienceId }))).not.toHaveLength(0);
      expect(() => resolve({ responsibilityId, formativeExperienceId })).toThrow(/not authored/);
    }
  });

  it('rejects a missing player Person or missing authored participant rather than fabricating one', () => {
    expect(() => resolveEraICharacterHistory({
      personId: 'person-missing' as PersonId, choices: choices(), people,
    })).toThrow(/player Person/);
    const withoutReceiver = { ...people };
    delete (withoutReceiver as Record<string, Person>)['person-utu-mansum'];
    expect(() => resolveEraICharacterHistory({
      personId: playerId,
      choices: choices({ responsibilityId: 'RS-03', formativeExperienceId: 'FE-04', entryRouteId: 'EN-02' }),
      people: withoutReceiver,
    })).toThrow(/participant .* missing/);
  });

  it('is deterministic and does not emit numerical benefits or relationship changes', () => {
    const first = resolve();
    const second = resolve();
    expect(second).toEqual(first);
    expect(Object.keys(first)).toEqual(['characterCreation', 'lifeEvents', 'familiarities']);
    expect(first.lifeEvents.every((item) => item.participants.every((participant) => !!people[participant.personId]))).toBe(true);
  });

  it('resolves all 3,328 legal combinations across all four orientations without class restrictions', () => {
    const origins = ['OR-01', 'OR-02', 'OR-03', 'OR-04'] as const;
    const responsibilities = ['RS-01', 'RS-02', 'RS-03', 'RS-04'] as const;
    const formativeByResponsibility = {
      'RS-01': ['FE-01', 'FE-02', 'FE-03', 'FE-04'],
      'RS-02': ['FE-01', 'FE-02', 'FE-03', 'FE-04'],
      'RS-03': ['FE-02', 'FE-03', 'FE-04'],
      'RS-04': ['FE-02', 'FE-04'],
    } as const;
    const routes = ['EN-01', 'EN-02', 'EN-03', 'EN-04'] as const;
    const instructions = ['TR-01', 'TR-02', 'TR-03', 'TR-04'] as const;
    const orientations = ['government', 'religious', 'merchant', 'military'] as const;
    let resolved = 0;
    for (const originId of origins) for (const responsibilityId of responsibilities)
      for (const formativeExperienceId of formativeByResponsibility[responsibilityId])
        for (const entryRouteId of routes) for (const instructionId of instructions)
          {
            const byOrientation = Object.fromEntries(orientations.map((orientation) => [
              orientation,
              resolve({ originId, responsibilityId, formativeExperienceId, entryRouteId, instructionId }),
            ]));
            const results = Object.values(byOrientation);
            expect(results).toHaveLength(4);
            expect(results.every((result) => JSON.stringify(result) === JSON.stringify(results[0]))).toBe(true);
            for (const result of results) {
              expect(result.lifeEvents).toHaveLength(5);
              expect(result.lifeEvents.map((item) => item.chronology.order)).toEqual([0, 1, 2, 3, 4]);
              expect(result.lifeEvents.every((item) => item.participants.every((participant) => !!people[participant.personId]))).toBe(true);
              resolved++;
            }
          }
    expect(resolved).toBe(3328);
  });
});
