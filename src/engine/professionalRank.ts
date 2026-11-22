import { CORE_SKILL_IDS } from '../state/ids';
import type { SkillId } from '../state/ids';
import type { SkillState } from '../state/types';

export type ProfessionalRank = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type SkillProfile = Partial<Record<SkillId, SkillState>>;

/**
 * Derive the character's broad professional grade from their six core skills only.
 *
 * This is an intentionally small, replaceable baseline while the GDD's exact
 * breadth/depth formula remains open. Missing skills count at the minimum level
 * (1). The aggregate makes broad development matter: a single maxed skill cannot
 * produce a high broad-standing grade. Career XP, reputation, era, and history
 * are deliberately not accepted by this function.
 */
// PROVISIONAL: replace or tune after the GDD §10.2 breadth/depth rank formula is approved.
export function deriveProfessionalRank(skills: SkillProfile): ProfessionalRank {
  const totalSkillLevels = CORE_SKILL_IDS.reduce((total, skillId) => {
    const level = normalizedLevel(skills[skillId]);
    return total + level;
  }, 0);

  const grade = 1 + Math.floor((totalSkillLevels - CORE_SKILL_IDS.length) / 9);
  return Math.max(1, Math.min(7, grade)) as ProfessionalRank;
}

function normalizedLevel(skill: SkillState | undefined): number {
  if (!skill || !Number.isFinite(skill.level)) return 1;
  return Math.max(1, Math.min(10, Math.floor(skill.level)));
}
