import type { GameState, SaveEnvelope } from './types';

export const SAVE_KEY = 'scribe_game_v2';
export const SAVE_SCHEMA_VERSION = 2 as const;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function finiteNonNegative(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
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

  const activePerson = world.people[player.currentCharacterId];
  if (!isObject(activePerson) || activePerson.id !== player.currentCharacterId || activePerson.alive !== true || !isObject(activePerson.scribal)) return false;
  const scribal = activePerson.scribal;
  if (!finiteNonNegative(scribal.careerXp) || !finiteNonNegative(scribal.stress)
    || scribal.stress > 100 || !isObject(scribal.wallet)
    || !isObject(scribal.skills) || !isObject(scribal.attributes)
    || !Array.isArray(scribal.specializations) || !Array.isArray(scribal.traits)
    || !Array.isArray(scribal.conditions) || !Array.isArray(scribal.equipment)
    || !isObject(scribal.professionalReputation)) return false;
  const wallet = scribal.wallet;
  if (!finiteNonNegative(wallet.money) || !finiteNonNegative(wallet.provisions)
    || !finiteNonNegative(wallet.shortageWorkdays) || !Number.isInteger(wallet.shortageWorkdays)) return false;
  for (const dimension of ['competence', 'reliability', 'discretion', 'judgment'] as const) {
    const score = scribal.professionalReputation[dimension];
    if (!finiteNonNegative(score) || score > 100) return false;
  }
  for (const skill of Object.values(scribal.skills)) {
    if (!isObject(skill) || !finiteNonNegative(skill.level) || !Number.isInteger(skill.level)
      || skill.level < 1 || skill.level > 10 || !finiteNonNegative(skill.experience)) return false;
  }
  for (const attribute of Object.values(scribal.attributes)) {
    if (!finiteNonNegative(attribute)) return false;
  }
  if (!isObject(world.institutions) || !isObject(world.locations)
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
