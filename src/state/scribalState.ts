import type { Person, PersonScribalState, InitializedScribalCharacterState } from './types';

/**
 * Legacy schema-v2 scribal records have no stage field and remain initialized.
 * Only the explicit identity tag opts into the non-playable representation.
 */
export function isInitializedScribalState(
  scribal: PersonScribalState | undefined,
): scribal is InitializedScribalCharacterState {
  return !!scribal && scribal.stage !== 'identity';
}

/** Returns the career-capable state, never an identity-only record. */
export function getInitializedScribal(
  person: Person | undefined,
): InitializedScribalCharacterState | undefined {
  return isInitializedScribalState(person?.scribal) ? person.scribal : undefined;
}
