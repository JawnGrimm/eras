import { describe, expect, it } from 'vitest';
import { transitionGame } from '../engine/actionEconomy';
import { deriveProfessionalRank } from '../engine/professionalRank';
import { createInitialGameState, INITIAL_PERSON_ID } from '../state/initialState';
import { isSkillEligibleForAdvancement } from '../engine/careerProgression';
import { isValidGameState } from '../state/saveEnvelope';
import type { CareerProgressionPolicy, GameState, SkillState } from '../state/types';
import type { SpecializationId } from '../state/ids';

const policy: CareerProgressionPolicy = {
  skillAdvancementByTargetLevel: {
    2: { requiredSkillXp: 100, careerXpCost: 40 },
    3: { requiredSkillXp: 250, careerXpCost: 60 },
    4: { requiredSkillXp: 450, careerXpCost: 80 },
    5: { requiredSkillXp: 700, careerXpCost: 100 },
    6: { requiredSkillXp: 1000, careerXpCost: 120 },
    7: { requiredSkillXp: 1400, careerXpCost: 140 },
    8: { requiredSkillXp: 1900, careerXpCost: 160 },
    9: { requiredSkillXp: 2500, careerXpCost: 180 },
    10: { requiredSkillXp: 3200, careerXpCost: 200 },
  },
};

describe('character and career foundation', () => {
  it('keeps skill experience as eligibility and Career XP as the separate purchase currency', () => {
    const initial = createInitialGameState();
    const award = transitionGame(initial, {
      type: 'AWARD_SKILL_XP', skillId: 'recordkeeping_accounts', amount: 100, reason: 'Reconcile accounts',
    }, policy);
    const scribal = award.state.world.people[INITIAL_PERSON_ID].scribal!;
    expect(scribal.skills.recordkeeping_accounts).toEqual({ level: 1, skillXp: 100 });
    expect(scribal.skills.analysis_research).toBeUndefined();
    expect(scribal.careerXp).toBe(150);
    expect(isSkillEligibleForAdvancement(scribal.skills.recordkeeping_accounts, policy)).toBe(true);

    const purchase = transitionGame(award.state, { type: 'PURCHASE_SKILL_LEVEL', skillId: 'recordkeeping_accounts' }, policy);
    const advanced = purchase.state.world.people[INITIAL_PERSON_ID].scribal!;
    expect(advanced.skills.recordkeeping_accounts).toEqual({ level: 2, skillXp: 100 });
    expect(advanced.careerXp).toBe(110);
  });

  it('validates Career XP awards independently from Skill XP awards', () => {
    const initial = createInitialGameState();
    const invalidAmounts = [0, -1, Number.NaN, Number.POSITIVE_INFINITY];
    for (const amount of invalidAmounts) {
      const result = transitionGame(initial, { type: 'AWARD_CAREER_XP', amount, reason: 'Test award' }, policy);
      expect(result.state).toBe(initial);
      expect(result.feedback?.code).toBe('invalid-career-xp');
    }
    const awarded = transitionGame(initial, { type: 'AWARD_CAREER_XP', amount: 25, reason: 'Completed commission' }, policy);
    expect(awarded.state.world.people[INITIAL_PERSON_ID].scribal!.careerXp).toBe(175);
    expect(awarded.state.world.people[INITIAL_PERSON_ID].scribal!.skills).toEqual({});
  });

  it('rejects advancement without skill eligibility, investment currency, or room below the level-10 cap', () => {
    const initial = createInitialGameState();
    const noSkillXp = transitionGame(initial, { type: 'PURCHASE_SKILL_LEVEL', skillId: 'reading_scripts' }, policy);
    expect(noSkillXp.state).toBe(initial);
    expect(noSkillXp.feedback?.code).toBe('skill-xp-insufficient');

    const lowCareerXp = {
      ...initial,
      world: { ...initial.world, people: { ...initial.world.people, [INITIAL_PERSON_ID]: {
        ...initial.world.people[INITIAL_PERSON_ID],
        scribal: { ...initial.world.people[INITIAL_PERSON_ID].scribal!, careerXp: 0,
          skills: { reading_scripts: { level: 1, skillXp: 100 } } },
      } } },
    };
    const unaffordable = transitionGame(lowCareerXp, { type: 'PURCHASE_SKILL_LEVEL', skillId: 'reading_scripts' }, policy);
    expect(unaffordable.state).toBe(lowCareerXp);
    expect(unaffordable.feedback?.code).toBe('career-xp-insufficient');

    const capped = { level: 10, skillXp: 99999 } satisfies SkillState;
    expect(isSkillEligibleForAdvancement(capped, policy)).toBe(false);
    const atCap = {
      ...initial,
      world: { ...initial.world, people: { ...initial.world.people, [INITIAL_PERSON_ID]: {
        ...initial.world.people[INITIAL_PERSON_ID], scribal: {
          ...initial.world.people[INITIAL_PERSON_ID].scribal!, skills: { reading_scripts: capped },
        },
      } } },
    };
    const capResult = transitionGame(atCap, { type: 'PURCHASE_SKILL_LEVEL', skillId: 'reading_scripts' }, policy);
    expect(capResult.state).toBe(atCap);
    expect(capResult.feedback?.code).toBe('skill-level-cap');
  });

  it('keeps professional rank a skill-derived grade from 1 to 7, independent of Career XP', () => {
    const skills = {
      reading_scripts: { level: 10, skillXp: 99999 },
    };
    const lowXpCareer = { careerXp: 0, skills };
    const highXpCareer = { careerXp: 1_000_000, skills };
    expect(deriveProfessionalRank(lowXpCareer.skills)).toBe(2);
    expect(deriveProfessionalRank(highXpCareer.skills)).toBe(2);
    expect(deriveProfessionalRank({})).toBe(1);
    expect(deriveProfessionalRank({
      reading_scripts: { level: 10, skillXp: 0 },
      recordkeeping_accounts: { level: 10, skillXp: 0 },
      analysis_research: { level: 10, skillXp: 0 },
      writing_composition: { level: 10, skillXp: 0 },
      administration_procedure: { level: 10, skillXp: 0 },
      communication_instruction: { level: 10, skillXp: 0 },
    })).toBe(7);
  });

  it('supports Primary and secondary specializations without hard-coded specialization content', () => {
    const initial = createInitialGameState();
    const firstId = 'accounts' as SpecializationId;
    const secondId = 'research' as SpecializationId;
    const person = initial.world.people[INITIAL_PERSON_ID];
    const state = {
      ...initial,
      world: { ...initial.world, people: { ...initial.world.people, [INITIAL_PERSON_ID]: {
        ...person, scribal: { ...person.scribal!, specializations: [
          { id: firstId, level: 'practitioner' as const, specializationXp: 25, isPrimary: true },
          { id: secondId, level: 'specialist' as const, specializationXp: 100, isPrimary: false },
        ] },
      } } },
    };
    const result = transitionGame(state, { type: 'SET_PRIMARY_SPECIALIZATION', specializationId: secondId }, policy);
    const specializations = result.state.world.people[INITIAL_PERSON_ID].scribal!.specializations;
    expect(specializations.find((item) => item.id === firstId)?.isPrimary).toBe(false);
    expect(specializations.find((item) => item.id === secondId)?.isPrimary).toBe(true);
    expect(specializations.find((item) => item.id === secondId)?.level).toBe('specialist');
  });

  it('stores conditions as contextual skill or attribute modifiers, not universal penalties', () => {
    const initial = createInitialGameState();
    const person = initial.world.people[INITIAL_PERSON_ID];
    const state: GameState = {
      ...initial,
      world: { ...initial.world, people: { ...initial.world.people, [INITIAL_PERSON_ID]: {
        ...person, scribal: { ...person.scribal!, conditions: [{
          id: 'fatigue',
          severity: 1 as const,
          modifiers: [{
            target: { kind: 'skill' as const, id: 'recordkeeping_accounts' as const },
            value: -1,
            actionTags: ['prolonged-audit'],
          }],
          remainingWorkdays: 2,
        }] },
      } } },
    };
    expect(state.world.people[INITIAL_PERSON_ID].scribal!.conditions[0].modifiers[0].actionTags).toEqual(['prolonged-audit']);
    expect(isValidGameState(state)).toBe(true);
    const invalid = structuredClone(state);
    invalid.world.people[INITIAL_PERSON_ID].scribal!.conditions[0].modifiers[0].actionTags = [];
    expect(isValidGameState(invalid)).toBe(false);
  });
});
