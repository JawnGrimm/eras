import { describe, expect, it } from 'vitest';
import type { CareerPathId } from './ids';
import {
  createEraIPlayerPersonId,
  type EraIPlayerIdentityInput,
} from './characterIdentity';

const base: EraIPlayerIdentityInput = {
  seed: 'era1-seed-001',
  name: 'Aru',
  careerPath: 'government',
  choices: {
    originId: 'OR-01',
    responsibilityId: 'RS-01',
    formativeExperienceId: 'FE-01',
    entryRouteId: 'EN-02',
    instructionId: 'TR-01',
  },
};

describe('deterministic Era I player identity', () => {
  it('produces the same stable Person ID from the same complete input', () => {
    expect(createEraIPlayerPersonId(base)).toBe(createEraIPlayerPersonId({ ...base }));
  });

  it('incorporates seed, exact name, orientation, and all five history choices', () => {
    const baseline = createEraIPlayerPersonId(base);
    expect(createEraIPlayerPersonId({ ...base, seed: 'era1-seed-002' })).not.toBe(baseline);
    expect(createEraIPlayerPersonId({ ...base, name: 'Aru-esh' })).not.toBe(baseline);
    expect(createEraIPlayerPersonId({ ...base, careerPath: 'religious' })).not.toBe(baseline);
    expect(createEraIPlayerPersonId({
      ...base, choices: { ...base.choices, originId: 'OR-02' },
    })).not.toBe(baseline);
    expect(createEraIPlayerPersonId({
      ...base, choices: { ...base.choices, responsibilityId: 'RS-02' },
    })).not.toBe(baseline);
    expect(createEraIPlayerPersonId({
      ...base, choices: { ...base.choices, formativeExperienceId: 'FE-02' },
    })).not.toBe(baseline);
    expect(createEraIPlayerPersonId({
      ...base, choices: { ...base.choices, entryRouteId: 'EN-01' },
    })).not.toBe(baseline);
    expect(createEraIPlayerPersonId({
      ...base, choices: { ...base.choices, instructionId: 'TR-02' },
    })).not.toBe(baseline);
  });

  it('requires a non-empty name and seed without imposing extra name-format rules', () => {
    expect(() => createEraIPlayerPersonId({ ...base, name: '   ' })).toThrow(/non-empty character name/);
    expect(() => createEraIPlayerPersonId({ ...base, seed: '  ' })).toThrow(/non-empty deterministic character seed/);
    expect(() => createEraIPlayerPersonId({ ...base, name: 'Aru Šamaš-𒀭' })).not.toThrow();
  });

  it('rejects unsupported orientations and incompatible authored choices', () => {
    expect(() => createEraIPlayerPersonId({ ...base, careerPath: 'priest' as CareerPathId }))
      .toThrow(/Unsupported professional orientation/);
    expect(() => createEraIPlayerPersonId({
      ...base, choices: { ...base.choices, responsibilityId: 'RS-03', formativeExperienceId: 'FE-01' },
    })).toThrow(/not authored/);
  });

  it('fails explicitly if the deterministic ID is already occupied by an NPC or other Person', () => {
    const id = createEraIPlayerPersonId(base);
    expect(() => createEraIPlayerPersonId(base, new Set([id]))).toThrow(/ID collision/);
  });
});
