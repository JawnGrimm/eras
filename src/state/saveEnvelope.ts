import { CORE_SKILL_IDS } from './ids';
import type { AttributeId, SkillId } from './ids';
import type { GameState, SaveEnvelope, ScribalCharacterState } from './types';

export const SAVE_KEY = 'scribe_game_v2';
export const SAVE_SCHEMA_VERSION = 2 as const;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function finiteNonNegative(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

const ATTRIBUTE_IDS: readonly AttributeId[] = [
  'precision', 'perception', 'reasoning', 'expression', 'endurance', 'composure',
];
const SPECIALIZATION_LEVELS = ['practitioner', 'specialist', 'master'] as const;

function isSkillState(value: unknown): boolean {
  return isObject(value)
    && Number.isInteger(value.level) && finiteNonNegative(value.level)
    && value.level >= 1 && value.level <= 10
    && finiteNonNegative(value.skillXp);
}

function isConditionModifier(value: unknown): boolean {
  if (!isObject(value) || !isObject(value.target) || !Number.isFinite(value.value)
    || !Array.isArray(value.actionTags) || value.actionTags.length === 0
    || !value.actionTags.every((tag) => typeof tag === 'string' && tag.length > 0)) return false;
  if (value.target.kind === 'skill') return CORE_SKILL_IDS.includes(value.target.id as SkillId);
  if (value.target.kind === 'attribute') return ATTRIBUTE_IDS.includes(value.target.id as AttributeId);
  return false;
}

function isScribalCharacter(value: unknown): value is ScribalCharacterState {
  if (!isObject(value) || !finiteNonNegative(value.careerXp) || !finiteNonNegative(value.stress)
    || value.stress > 100 || !isObject(value.wallet)
    || !isObject(value.skills) || !isObject(value.attributes)
    || !Array.isArray(value.specializations) || !Array.isArray(value.traits)
    || !Array.isArray(value.conditions) || !Array.isArray(value.equipment)
    || !value.equipment.every((item) => typeof item === 'string')
    || !isObject(value.professionalReputation)) return false;

  const wallet = value.wallet;
  if (!finiteNonNegative(wallet.money) || !finiteNonNegative(wallet.provisions)
    || !finiteNonNegative(wallet.shortageWorkdays) || !Number.isInteger(wallet.shortageWorkdays)) return false;

  for (const [skillId, skill] of Object.entries(value.skills)) {
    if (!CORE_SKILL_IDS.includes(skillId as SkillId) || !isSkillState(skill)) return false;
  }
  for (const [attributeId, attribute] of Object.entries(value.attributes)) {
    if (!ATTRIBUTE_IDS.includes(attributeId as AttributeId) || !finiteNonNegative(attribute)) return false;
  }

  let primaryCount = 0;
  for (const specialization of value.specializations) {
    if (!isObject(specialization) || typeof specialization.id !== 'string' || !specialization.id
      || !SPECIALIZATION_LEVELS.includes(specialization.level as typeof SPECIALIZATION_LEVELS[number])
      || !finiteNonNegative(specialization.specializationXp)
      || typeof specialization.isPrimary !== 'boolean') return false;
    if (specialization.isPrimary) primaryCount += 1;
  }
  if (primaryCount > 1) return false;

  for (const trait of value.traits) {
    if (!isObject(trait) || typeof trait.id !== 'string' || !trait.id
      || ![1, 2, 3].includes(trait.intensity as number)
      || (trait.origin !== 'starting' && trait.origin !== 'emergent')) return false;
  }

  for (const condition of value.conditions) {
    if (!isObject(condition) || typeof condition.id !== 'string' || !condition.id
      || ![1, 2, 3].includes(condition.severity as number)
      || !Array.isArray(condition.modifiers) || !condition.modifiers.every(isConditionModifier)
      || (condition.remainingWorkdays !== undefined
        && (!finiteNonNegative(condition.remainingWorkdays) || !Number.isInteger(condition.remainingWorkdays)))) return false;
  }

  for (const dimension of ['competence', 'reliability', 'discretion', 'judgment'] as const) {
    const score = value.professionalReputation[dimension];
    if (!finiteNonNegative(score) || score > 100) return false;
  }
  return true;
}

export function isValidGameState(value: unknown): value is GameState {
  if (!isObject(value) || !isObject(value.calendar) || !isObject(value.actionEconomy)
    || !isObject(value.player) || !isObject(value.world) || !isObject(value.historicalProgression)
    || !isObject(value.opportunities) || !isObject(value.works) || !isObject(value.records)
    || !isObject(value.journal)) return false;

  const calendar = value.calendar;
  const economy = value.actionEconomy;
  const player = value.player;
  const world = value.world;
  if (typeof calendar.eraId !== 'string' || !finiteNonNegative(calendar.dayNumber)
    || !Number.isInteger(calendar.dayNumber) || calendar.dayNumber < 1 || typeof calendar.displayDate !== 'string') return false;
  if ((economy.dailyApAllocation !== 5 && economy.dailyApAllocation !== 6)
    || !finiteNonNegative(economy.apRemaining) || !Number.isInteger(economy.apRemaining)
    || economy.apRemaining > economy.dailyApAllocation
    || typeof economy.overtimeUsedToday !== 'boolean'
    || typeof economy.nextDayApPenalty !== 'boolean') return false;
  if (typeof player.currentCharacterId !== 'string' || !isObject(world.people)) return false;

  for (const [personId, person] of Object.entries(world.people)) {
    if (!isObject(person) || person.id !== personId || typeof person.alive !== 'boolean'
      || typeof person.name !== 'string' || !Array.isArray(person.affiliations)
      || !isObject(person.relationships)) return false;
    if (person.scribal !== undefined && !isScribalCharacter(person.scribal)) return false;
  }
  const activePerson = world.people[player.currentCharacterId];
  if (!isObject(activePerson) || activePerson.alive !== true || !isScribalCharacter(activePerson.scribal)) return false;

  if (!isObject(world.institutions) || !isObject(world.locations) || !isObject(world.appointments)
    || !finiteNonNegative(value.historicalProgression.historicalXp)
    || !Array.isArray(value.historicalProgression.completedWorks)
    || !isObject(value.opportunities.assignments) || !isObject(value.opportunities.challenges)
    || (value.works.activeWorkId !== null && typeof value.works.activeWorkId !== 'string')
    || !isObject(value.works.progress) || !Array.isArray(value.records.permanentOutcomes)
    || !Array.isArray(value.journal.notices)) return false;

  return true;
}

export function createSaveEnvelope(state: GameState, revision: number, savedAt = new Date().toISOString()): SaveEnvelope {
  return { schemaVersion: SAVE_SCHEMA_VERSION, gameVersion: '0.1.0', revision, savedAt, state };
}

export function isValidSaveEnvelope(value: unknown): value is SaveEnvelope {
  return isObject(value)
    && value.schemaVersion === SAVE_SCHEMA_VERSION
    && typeof value.gameVersion === 'string'
    && finiteNonNegative(value.revision)
    && Number.isInteger(value.revision)
    && typeof value.savedAt === 'string'
    && Number.isFinite(Date.parse(value.savedAt))
    && isValidGameState(value.state);
}

export function restoreSave(raw: string | null): SaveEnvelope | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isValidSaveEnvelope(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
