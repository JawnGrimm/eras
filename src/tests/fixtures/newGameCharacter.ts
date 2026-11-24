import type { EraICharacterCreationInput } from '../../state/newGameState';

export const TEST_CHARACTER_CREATION: EraICharacterCreationInput = {
  seed: 'scribe-of-eras-test-character-seed',
  name: 'Test Scribe',
  choices: {
    originId: 'OR-01',
    responsibilityId: 'RS-01',
    formativeExperienceId: 'FE-01',
    entryRouteId: 'EN-02',
    instructionId: 'TR-01',
  },
  careerPath: 'government',
};
