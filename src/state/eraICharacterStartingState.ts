import type { AttributeId, CareerPathId, SkillId } from './ids';
import { CORE_SKILL_IDS } from './ids';
import type { SkillState } from './types';
import type { EraICharacterHistoryChoices } from '../content/characterCreation/eraICharacterHistory';

/** Version of the immutable PR #68 historical resolver dependency. */
export const ERA_I_CHARACTER_HISTORY_DEPENDENCY_VERSION = 'era1-character-history-v1' as const;
/** Version of the approved GD-CHARACTER-START-001 starting-state rules. */
export const ERA_I_CHARACTER_STARTING_STATE_VERSION = 'era1-character-start-v1' as const;
/** Combined version persisted on new CharacterCreationRecords and used by Person ID hashing. */
export const ERA_I_CHARACTER_CREATION_CONTENT_VERSION = 'era1-character-creation-v1' as const;

export const ERA_I_CURATED_SAMPLE_NAMES = [
  { name: 'En-Unug-du10', note: 'Uruk-period attested name-form; reading remains cautious.' },
  { name: 'Ena-an-ru', note: 'Uruk-period attested name-form; reading remains cautious.' },
  { name: 'Šubur-e₂a×1N57', note: 'Uruk-period attested sign sequence; reading remains cautious.' },
  { name: 'BUₐ GI', note: 'Late Uruk name sequence reported by Englund; not a confidently reconstructed pronunciation.' },
  { name: 'DIMₐ', note: 'Late Uruk name sequence reported by Englund; not a confidently reconstructed pronunciation.' },
  { name: 'ENₐ U₂ᵦ DU', note: 'Late Uruk name sequence reported by Englund; not a confidently reconstructed pronunciation.' },
  { name: 'EZENᵦ ENₐ', note: 'Late Uruk name sequence reported by Englund; not a confidently reconstructed pronunciation.' },
  { name: 'NIₐ GIR₃c', note: 'Late Uruk name sequence reported by Englund; not a confidently reconstructed pronunciation.' },
] as const;

/**
 * Keep source-authored sign/catalog notation in provenance, not in the player
 * picker. Active NPC names are also excluded from player-character samples.
 * This does not rename or delete any underlying source entry.
 */
export const ERA_I_ACTIVE_NPC_NAME_FORMS = ['Ena-an-ru', 'DIMₐ'] as const;

export const ERA_I_AVAILABLE_SAMPLE_NAMES = ERA_I_CURATED_SAMPLE_NAMES.filter(
  (item) => !item.name.includes('×') && !ERA_I_ACTIVE_NPC_NAME_FORMS.includes(item.name as typeof ERA_I_ACTIVE_NPC_NAME_FORMS[number]),
);

const INVISIBLE_CONTROL_CHARACTERS = /[\u0000-\u001F\u007F-\u009F\u202A-\u202E\u2066-\u2069]/u;

export type EraICharacterNameValidation =
  | { valid: true; name: string }
  | { valid: false; error: string };

/** Minimal approved hygiene; preserves all other characters and internal whitespace. */
export function validateEraICharacterName(value: unknown): EraICharacterNameValidation {
  if (typeof value !== 'string') return { valid: false, error: 'A non-empty character name is required.' };
  const name = value.trim();
  if (name.length === 0) return { valid: false, error: 'A non-empty character name is required.' };
  if (Array.from(name).length > 60) {
    return { valid: false, error: 'Character names must be 60 Unicode code points or fewer.' };
  }
  if (INVISIBLE_CONTROL_CHARACTERS.test(name)) {
    return { valid: false, error: 'Character names cannot contain invisible control characters.' };
  }
  return { valid: true, name };
}

export interface EraICharacterStartingState {
  careerPath: CareerPathId;
  attributes: Record<AttributeId, number>;
  skills: Record<SkillId, SkillState>;
  professionalReputation: { competence: number; reliability: number; discretion: number; judgment: number };
  attributeSources: Partial<Record<AttributeId, string[]>>;
  skillXpSources: Partial<Record<SkillId, string[]>>;
}

const RESPONSIBILITY_ATTRIBUTE: Record<EraICharacterHistoryChoices['responsibilityId'], AttributeId> = {
  'RS-01': 'precision',
  'RS-02': 'perception',
  'RS-03': 'perception',
  'RS-04': 'reasoning',
};

const FORMATIVE_ATTRIBUTE: Record<EraICharacterHistoryChoices['formativeExperienceId'], AttributeId> = {
  'FE-01': 'reasoning',
  'FE-02': 'composure',
  'FE-03': 'expression',
  'FE-04': 'endurance',
};

const RESPONSIBILITY_LABEL: Record<EraICharacterHistoryChoices['responsibilityId'], string> = {
  'RS-01': 'Count or measure',
  'RS-02': 'Help with deliveries',
  'RS-03': 'Judge materials or quality',
  'RS-04': 'Observe a record or seal in use',
};
const FORMATIVE_LABEL: Record<EraICharacterHistoryChoices['formativeExperienceId'], string> = {
  'FE-01': 'A quantity did not match',
  'FE-02': 'You were blamed unfairly',
  'FE-03': 'You helped settle a disagreement',
  'FE-04': 'You were trusted with an adult responsibility',
};
const INSTRUCTION_LABEL: Record<EraICharacterHistoryChoices['instructionId'], string> = {
  'TR-01': 'Quantities and commodity notation',
  'TR-02': 'Clay, stylus, and tablet preparation',
  'TR-03': 'Signs and category lists',
  'TR-04': 'Checking and organizing records',
};

const ATTRIBUTE_IDS: readonly AttributeId[] = [
  'precision', 'perception', 'reasoning', 'expression', 'endurance', 'composure',
];

/** Resolves only the approved deterministic starting effects; orientation grants no bonuses. */
export function resolveEraICharacterStartingState(
  choices: EraICharacterHistoryChoices,
  careerPath: CareerPathId,
): EraICharacterStartingState {
  const responsibilityAttribute = RESPONSIBILITY_ATTRIBUTE[choices.responsibilityId];
  const formativeAttribute = FORMATIVE_ATTRIBUTE[choices.formativeExperienceId];
  const attributes = Object.fromEntries(ATTRIBUTE_IDS.map((id) => [id, 5])) as Record<AttributeId, number>;
  attributes[responsibilityAttribute] += 1;
  attributes[formativeAttribute] += 1;

  const skills = Object.fromEntries(CORE_SKILL_IDS.map((id) => [id, { level: 1, skillXp: 0 }])) as Record<SkillId, SkillState>;
  const skillXpSources: Partial<Record<SkillId, string[]>> = {};
  const award = (skillId: SkillId, amount: number) => {
    skills[skillId].skillXp += amount;
    skillXpSources[skillId] = [INSTRUCTION_LABEL[choices.instructionId]];
  };
  switch (choices.instructionId) {
    case 'TR-01':
      award('recordkeeping_accounts', 20);
      break;
    case 'TR-02':
      award('writing_composition', 20);
      break;
    case 'TR-03':
      award('reading_scripts', 20);
      award('writing_composition', 10);
      break;
    case 'TR-04':
      award('recordkeeping_accounts', 15);
      award('analysis_research', 15);
      break;
  }

  const attributeSources: Partial<Record<AttributeId, string[]>> = {
    [responsibilityAttribute]: ['Chapter 2 · ' + RESPONSIBILITY_LABEL[choices.responsibilityId]],
    [formativeAttribute]: [
      ...(responsibilityAttribute === formativeAttribute ? ['Chapter 2 · ' + RESPONSIBILITY_LABEL[choices.responsibilityId]] : []),
      'Chapter 3 · ' + FORMATIVE_LABEL[choices.formativeExperienceId],
    ],
  };

  return {
    careerPath,
    attributes,
    skills,
    professionalReputation: { competence: 50, reliability: 50, discretion: 50, judgment: 50 },
    attributeSources,
    skillXpSources,
  };
}
