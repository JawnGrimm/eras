import { describe, expect, it } from 'vitest';
import {
  ERA_I_CHARACTER_CREATION_CONTENT_VERSION,
  ERA_I_CHARACTER_HISTORY_DEPENDENCY_VERSION,
  ERA_I_CHARACTER_STARTING_STATE_VERSION,
  ERA_I_CURATED_SAMPLE_NAMES,
  resolveEraICharacterStartingState,
  validateEraICharacterName,
} from './eraICharacterStartingState';
import type { EraICharacterHistoryChoices } from '../content/characterCreation/eraICharacterHistory';

const base: EraICharacterHistoryChoices = {
  originId: 'OR-01',
  responsibilityId: 'RS-01',
  formativeExperienceId: 'FE-01',
  entryRouteId: 'EN-02',
  instructionId: 'TR-01',
};

describe('GD-CHARACTER-START-001 starting-state resolver', () => {
  it('keeps the three content versions distinct', () => {
    expect(ERA_I_CHARACTER_HISTORY_DEPENDENCY_VERSION).toBe('era1-character-history-v1');
    expect(ERA_I_CHARACTER_STARTING_STATE_VERSION).toBe('era1-character-start-v1');
    expect(ERA_I_CHARACTER_CREATION_CONTENT_VERSION).toBe('era1-character-creation-v1');
  });

  it('creates six explicit baseline attributes and six level-one skills', () => {
    const result = resolveEraICharacterStartingState(base, 'government');
    expect(result.attributes).toEqual({
      precision: 6, perception: 5, reasoning: 6, expression: 5, endurance: 5, composure: 5,
    });
    expect(Object.keys(result.skills)).toHaveLength(6);
    expect(Object.values(result.skills)).toEqual(Array.from({ length: 6 }, (_, i) =>
      i === 1 ? { level: 1, skillXp: 20 } : { level: 1, skillXp: 0 }));
    expect(result.professionalReputation).toEqual({
      competence: 50, reliability: 50, discretion: 50, judgment: 50,
    });
  });

  it('uses the approved distinct FE-02 and FE-04 emphases', () => {
    const fe02 = resolveEraICharacterStartingState({ ...base, responsibilityId: 'RS-04', formativeExperienceId: 'FE-02' }, 'military');
    const fe04 = resolveEraICharacterStartingState({ ...base, responsibilityId: 'RS-04', formativeExperienceId: 'FE-04' }, 'military');
    expect(fe02.attributes.composure).toBe(6);
    expect(fe02.attributes.endurance).toBe(5);
    expect(fe04.attributes.endurance).toBe(6);
    expect(fe04.attributes.composure).toBe(5);
  });

  it('awards the specified lesson Skill XP without raising levels', () => {
    const cases: Array<[EraICharacterHistoryChoices['instructionId'], Record<string, number>]> = [
      ['TR-01', { recordkeeping_accounts: 20 }],
      ['TR-02', { writing_composition: 20 }],
      ['TR-03', { reading_scripts: 20, writing_composition: 10 }],
      ['TR-04', { recordkeeping_accounts: 15, analysis_research: 15 }],
    ];
    for (const [instructionId, expected] of cases) {
      const result = resolveEraICharacterStartingState({ ...base, instructionId }, 'merchant');
      for (const [skillId, skill] of Object.entries(result.skills)) {
        expect(skill.level).toBe(1);
        expect(skill.skillXp).toBe(expected[skillId as keyof typeof expected] ?? 0);
      }
    }
  });

  it('does not modify starting attributes or reputation by orientation', () => {
    const orientations = ['government', 'military', 'religious', 'merchant'] as const;
    const results = orientations.map((orientation) => resolveEraICharacterStartingState(base, orientation));
    expect(results.map((result) => result.attributes)).toEqual(Array(4).fill(results[0].attributes));
    expect(results.map((result) => result.professionalReputation)).toEqual(Array(4).fill(results[0].professionalReputation));
  });
});

describe('Era I character name policy', () => {
  it('trims names and counts Unicode code points', () => {
    expect(validateEraICharacterName('  Aru Šamaš-𒀭  ')).toEqual({ valid: true, name: 'Aru Šamaš-𒀭' });
    expect(validateEraICharacterName('𒀭'.repeat(60)).valid).toBe(true);
    expect(validateEraICharacterName('𒀭'.repeat(61)).valid).toBe(false);
  });

  it('rejects empty and invisible control characters but preserves ordinary punctuation and internal spaces', () => {
    expect(validateEraICharacterName('   ').valid).toBe(false);
    expect(validateEraICharacterName('Aru\u202eName').valid).toBe(false);
    expect(validateEraICharacterName('Aru / Šamaš! 𒀭').valid).toBe(true);
  });

  it('provides exactly the eight approved curated names without active Day 1 NPC names', () => {
    expect(ERA_I_CURATED_SAMPLE_NAMES.map((item) => item.name)).toEqual([
      'En-Unug-du10', 'Ena-an-ru', 'Šubur-e₂a×1N57', 'BUₐ GI', 'DIMₐ',
      'ENₐ U₂ᵦ DU', 'EZENᵦ ENₐ', 'NIₐ GIR₃c',
    ]);
    expect(ERA_I_CURATED_SAMPLE_NAMES.map((item) => item.name)).not.toEqual(expect.arrayContaining([
      'Ur-Nanna', 'Enlil-kisu', 'Utu-mansum', 'Ur-gir', 'Nin-kasi',
    ]));
  });
});
