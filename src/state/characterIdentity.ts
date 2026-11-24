import type { CareerPathId, PersonId } from './ids';
import { ERA_I_CHARACTER_CREATION_CONTENT_VERSION, validateEraICharacterName } from './eraICharacterStartingState';
import {
  validateEraICharacterHistoryChoices,
  type EraICharacterHistoryChoices,
} from '../content/characterCreation/eraICharacterHistory';

const CAREER_PATHS: readonly CareerPathId[] = ['government', 'religious', 'merchant', 'military'];
const FNV64_OFFSET = 0xcbf29ce484222325n;
const FNV64_PRIME = 0x100000001b3n;
const UINT64_MASK = 0xffffffffffffffffn;

export interface EraIPlayerIdentityInput {
  /** Caller-supplied seed. The same seed and character inputs always produce the same Person ID. */
  seed: string;
  /** Display name after the approved trim, Unicode code-point, and invisible-control hygiene. */
  name: string;
  careerPath: CareerPathId;
  choices: EraICharacterHistoryChoices;
}

function hashIdentity(value: string): string {
  let hash = FNV64_OFFSET;
  for (const byte of new TextEncoder().encode(value)) {
    hash ^= BigInt(byte);
    hash = (hash * FNV64_PRIME) & UINT64_MASK;
  }
  return hash.toString(16).padStart(16, '0');
}

/**
 * Builds a deterministic, collision-checked Person ID from the complete authored
 * creation input. This is an identity primitive only; it does not create or
 * initialize the Person and does not impose a curated catalogue or historical naming policy.
 */
export function createEraIPlayerPersonId(
  input: EraIPlayerIdentityInput,
  occupiedPersonIds: ReadonlySet<string> = new Set(),
): PersonId {
  if (typeof input.seed !== 'string' || input.seed.trim().length === 0) {
    throw new Error('A non-empty deterministic character seed is required.');
  }
  const nameValidation = validateEraICharacterName(input.name);
  if (!nameValidation.valid) throw new Error(nameValidation.error);
  if (!CAREER_PATHS.includes(input.careerPath)) {
    throw new Error('Unsupported professional orientation.');
  }
  const choiceErrors = validateEraICharacterHistoryChoices(input.choices);
  if (choiceErrors.length > 0) throw new Error(choiceErrors.join(' '));

  const canonicalInput = JSON.stringify([
    ERA_I_CHARACTER_CREATION_CONTENT_VERSION,
    input.seed,
    nameValidation.name,
    input.careerPath,
    input.choices.originId,
    input.choices.responsibilityId,
    input.choices.formativeExperienceId,
    input.choices.entryRouteId,
    input.choices.instructionId,
  ]);
  const id = `person-era1-${hashIdentity(canonicalInput)}` as PersonId;
  if (occupiedPersonIds.has(id)) {
    throw new Error(`Deterministic Person ID collision: ${id} is already occupied.`);
  }
  return id;
}
