/** Shared identity namespace: a playable character is always an existing world person. */
export type PersonId = string & { readonly __brand: 'PersonId' };
export type CharacterId = PersonId;
export type InstitutionId = string & { readonly __brand: 'InstitutionId' };
export type LocationId = string & { readonly __brand: 'LocationId' };
export type WorkId = string & { readonly __brand: 'WorkId' };
export type AssignmentId = string & { readonly __brand: 'AssignmentId' };
export type ChallengeId = string & { readonly __brand: 'ChallengeId' };
export type TraitId = string & { readonly __brand: 'TraitId' };
export type ConditionId = string & { readonly __brand: 'ConditionId' };
export type SpecializationId = string & { readonly __brand: 'SpecializationId' };
export type CareerPathId = 'government' | 'military' | 'religious' | 'merchant';

export type EraId = 'era-1' | 'era-2' | 'era-3' | 'era-4' | 'era-5' | 'era-6' | 'era-7';
export type AttributeId = 'precision' | 'perception' | 'reasoning' | 'expression' | 'endurance' | 'composure';
export type SkillId =
  | 'reading_scripts'
  | 'recordkeeping_accounts'
  | 'analysis_research'
  | 'writing_composition'
  | 'administration_procedure'
  | 'communication_instruction';

export const CORE_SKILL_IDS = [
  'reading_scripts',
  'recordkeeping_accounts',
  'analysis_research',
  'writing_composition',
  'administration_procedure',
  'communication_instruction',
] as const satisfies readonly SkillId[];
