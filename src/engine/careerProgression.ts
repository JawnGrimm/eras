import type { SkillId, SpecializationId } from '../state/ids';
import type {
  CareerProgressionPolicy, GameAction, GameState, SkillState, TargetSkillLevel, TransitionResult,
} from '../state/types';

function result(state: GameState, kind: 'success' | 'error', code: string, message: string): TransitionResult {
  return { state, feedback: { kind, code, message } };
}

function activeScribal(state: GameState) {
  return state.world.people[state.player.currentCharacterId]?.scribal;
}

function currentSkill(scribal: NonNullable<ReturnType<typeof activeScribal>>, skillId: SkillId): SkillState {
  return scribal.skills[skillId] ?? { level: 1, skillXp: 0 };
}

function validRule(rule: { requiredSkillXp: number; careerXpCost: number } | undefined): rule is {
  requiredSkillXp: number; careerXpCost: number;
} {
  return !!rule
    && Number.isFinite(rule.requiredSkillXp) && rule.requiredSkillXp >= 0
    && Number.isFinite(rule.careerXpCost) && rule.careerXpCost >= 0;
}

/** Skill experience establishes eligibility; it is never consumed by a purchase. */
export function isSkillEligibleForAdvancement(
  skill: SkillState | undefined,
  policy: CareerProgressionPolicy,
): boolean {
  const current = skill ?? { level: 1, skillXp: 0 };
  if (!Number.isInteger(current.level) || current.level < 1 || current.level >= 10
    || !Number.isFinite(current.skillXp) || current.skillXp < 0) return false;
  const targetLevel = (current.level + 1) as TargetSkillLevel;
  const rule = policy.skillAdvancementByTargetLevel[targetLevel];
  return validRule(rule) && current.skillXp >= rule.requiredSkillXp;
}

export function transitionCareerAction(
  state: GameState,
  action: Extract<GameAction, { type: 'AWARD_SKILL_XP' | 'PURCHASE_SKILL_LEVEL' | 'SET_PRIMARY_SPECIALIZATION' }>,
  policy?: CareerProgressionPolicy,
): TransitionResult {
  const person = state.world.people[state.player.currentCharacterId];
  const scribal = person?.scribal;
  if (!scribal) return result(state, 'error', 'missing-active-character', 'The current character is unavailable.');

  if (action.type === 'AWARD_SKILL_XP') {
    if (!Number.isFinite(action.amount) || action.amount <= 0) {
      return result(state, 'error', 'invalid-skill-xp', 'Skill experience awards must be positive finite values.');
    }
    const skill = currentSkill(scribal, action.skillId);
    const nextSkill = { ...skill, skillXp: skill.skillXp + action.amount };
    if (!Number.isFinite(nextSkill.skillXp)) {
      return result(state, 'error', 'invalid-skill-xp', 'The skill experience total would be invalid.');
    }
    return {
      state: {
        ...state,
        world: {
          ...state.world,
          people: {
            ...state.world.people,
            [person.id]: { ...person, scribal: { ...scribal, skills: { ...scribal.skills, [action.skillId]: nextSkill } } },
          },
        },
      },
      feedback: { kind: 'success', code: 'skill-xp-awarded', message: action.reason },
    };
  }

  if (action.type === 'PURCHASE_SKILL_LEVEL') {
    if (!policy) return result(state, 'error', 'career-policy-unavailable', 'Skill advancement rules have not been configured.');
    const skill = currentSkill(scribal, action.skillId);
    if (skill.level >= 10) return result(state, 'error', 'skill-level-cap', 'This skill is already at the maximum level of 10.');
    const targetLevel = (skill.level + 1) as TargetSkillLevel;
    const rule = policy.skillAdvancementByTargetLevel[targetLevel];
    if (!validRule(rule)) return result(state, 'error', 'skill-rule-unavailable', 'No advancement rule is defined for this skill level.');
    if (!isSkillEligibleForAdvancement(skill, policy)) {
      return result(state, 'error', 'skill-xp-insufficient', 'More experience in this skill is required before it can be advanced.');
    }
    if (scribal.careerXp < rule.careerXpCost) {
      return result(state, 'error', 'career-xp-insufficient', 'There is not enough Career XP to invest in this advancement.');
    }
    const nextSkill: SkillState = { ...skill, level: targetLevel };
    return {
      state: {
        ...state,
        world: {
          ...state.world,
          people: {
            ...state.world.people,
            [person.id]: {
              ...person,
              scribal: {
                ...scribal,
                careerXp: scribal.careerXp - rule.careerXpCost,
                skills: { ...scribal.skills, [action.skillId]: nextSkill },
              },
            },
          },
        },
      },
      feedback: { kind: 'success', code: 'skill-level-purchased', message: `${action.skillId} advanced to level ${targetLevel}.` },
    };
  }

  return setPrimarySpecialization(state, scribal, person, action.specializationId);
}

function setPrimarySpecialization(
  state: GameState,
  scribal: NonNullable<ReturnType<typeof activeScribal>>,
  person: NonNullable<GameState['world']['people'][string]>,
  specializationId: SpecializationId,
): TransitionResult {
  if (!scribal.specializations.some((specialization) => specialization.id === specializationId)) {
    return result(state, 'error', 'specialization-not-owned', 'Only an established specialization can be designated Primary.');
  }
  const specializations = scribal.specializations.map((specialization) => ({
    ...specialization,
    isPrimary: specialization.id === specializationId,
  }));
  return {
    state: {
      ...state,
      world: {
        ...state.world,
        people: {
          ...state.world.people,
          [person.id]: { ...person, scribal: { ...scribal, specializations } },
        },
      },
    },
    feedback: { kind: 'success', code: 'primary-specialization-set', message: 'Primary specialization updated.' },
  };
}
