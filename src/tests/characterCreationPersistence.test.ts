import { describe, expect, it } from 'vitest';
import { createInitialGameState, INITIAL_PERSON_ID } from '../state/initialState';
import { createSaveEnvelope, isValidGameState, restoreSave } from '../state/saveEnvelope';
import type { GameState, PersonLifeEvent } from '../state/types';
import type { PersonId } from '../state/ids';

const colleagueId = 'person-uruk-ur-gir' as PersonId;
const missingPersonId = 'person-does-not-exist' as PersonId;

function stateWithHistory(): GameState {
  const state = createInitialGameState();
  const event: PersonLifeEvent = {
    id: 'life-event-origin',
    kind: 'origin',
    contentId: 'origin-food-provisioning',
    summary: 'Grew up around the preparation and storage of food.',
    chronology: { stage: 'early_life', order: 0 },
    participants: [{ personId: colleagueId, role: 'witness' }],
    historicalConfidence: 'reconstruction',
  };
  return {
    ...state,
    world: {
      ...state.world,
      people: {
        ...state.world.people,
        [INITIAL_PERSON_ID]: {
          ...state.world.people[INITIAL_PERSON_ID],
          characterCreation: {
            contentVersion: 'era-i-1',
            originId: 'OR-01',
            responsibilityId: 'RS-01',
            formativeExperienceId: 'FE-01',
            entryRouteId: 'EN-02',
            instructionId: 'TR-01',
          },
          lifeEvents: [event],
          familiarities: [{
            id: 'familiarity-provisioning-quantities',
            domainId: 'provisioning',
            scopeId: 'quantity-comparison',
            exposure: 'assisted',
            basisLifeEventIds: [event.id],
          }],
        },
      },
    },
  };
}

describe('persistent character creation data validation', () => {
  it('accepts a complete creation record, Life Event, and provenance-backed familiarity', () => {
    expect(isValidGameState(stateWithHistory())).toBe(true);
  });

  it('preserves character history through the complete save serialization and restoration boundary', () => {
    const state = stateWithHistory();
    const originalPerson = state.world.people[INITIAL_PERSON_ID];
    const envelope = createSaveEnvelope(state, 1, '2026-11-23T12:00:00.000Z');
    const restored = restoreSave(JSON.stringify(envelope));

    expect(restored).not.toBeNull();
    const restoredPerson = restored!.state.world.people[INITIAL_PERSON_ID];
    expect(restoredPerson.characterCreation).toEqual(originalPerson.characterCreation);
    expect(restoredPerson.lifeEvents).toEqual(originalPerson.lifeEvents);
    expect(restoredPerson.familiarities).toEqual(originalPerson.familiarities);
  });

  it('migrates v2 saves without fabricating missing character history', () => {
    const legacyState = createInitialGameState();
    const legacyPerson = legacyState.world.people[INITIAL_PERSON_ID];
    delete legacyPerson.characterCreation;
    delete legacyPerson.lifeEvents;
    delete legacyPerson.familiarities;

    const legacyEnvelope = JSON.parse(JSON.stringify(createSaveEnvelope(legacyState, 0, '2026-11-23T12:00:00.000Z')));
    legacyEnvelope.schemaVersion = 2;
    delete legacyEnvelope.state.world.relationshipFamiliarityEpisodes;
    for (const targets of Object.values(legacyEnvelope.state.world.relationships)) for (const relationship of Object.values(targets) as any[]) relationship.dimensions.familiarity = 0;
    delete legacyEnvelope.state.dayClose;
    delete legacyEnvelope.state.opportunities.selectionSeed;
    delete legacyEnvelope.state.opportunities.occurrenceLedger;
    const restored = restoreSave(JSON.stringify(legacyEnvelope));

    expect(restored).not.toBeNull();
    expect(restored?.schemaVersion).toBe(4);
    const restoredLegacyPerson = restored!.state.world.people[INITIAL_PERSON_ID];
    expect(restoredLegacyPerson.characterCreation).toBeUndefined();
    expect(restoredLegacyPerson.lifeEvents).toBeUndefined();
    expect(restoredLegacyPerson.familiarities).toBeUndefined();
  });

  it('rejects malformed character history through the save restoration boundary', () => {
    const envelope = createSaveEnvelope(stateWithHistory(), 1, '2026-11-23T12:00:00.000Z');
    const malformed = structuredClone(envelope);
    malformed.state.world.people[INITIAL_PERSON_ID].familiarities![0].basisLifeEventIds = [
      'life-event-not-present',
    ];

    expect(restoreSave(JSON.stringify(malformed))).toBeNull();
  });

  it('keeps legacy Persons without any character-creation fields valid', () => {
    expect(isValidGameState(createInitialGameState())).toBe(true);
  });

  it('rejects malformed creation records and malformed nested Life Event fields', () => {
    const base = stateWithHistory();
    const invalidCreation = structuredClone(base);
    (invalidCreation.world.people[INITIAL_PERSON_ID] as unknown as Record<string, unknown>).characterCreation = {
      contentVersion: 'era-i-1', originId: 'OR-01', responsibilityId: '', formativeExperienceId: 'FE-01',
      entryRouteId: 'EN-02', instructionId: 'TR-01',
    };
    expect(isValidGameState(invalidCreation)).toBe(false);

    const invalidEvent = structuredClone(base);
    (invalidEvent.world.people[INITIAL_PERSON_ID].lifeEvents![0] as unknown as Record<string, unknown>).historicalConfidence = 'certain';
    expect(isValidGameState(invalidEvent)).toBe(false);

    const invalidChronology = structuredClone(base);
    (invalidChronology.world.people[INITIAL_PERSON_ID].lifeEvents![0] as unknown as Record<string, unknown>).chronology = {
      stage: 'early_life', order: -1,
    };
    expect(isValidGameState(invalidChronology)).toBe(false);
  });

  it('rejects missing participant Persons and familiarity provenance outside the same Person history', () => {
    const missingParticipant = structuredClone(stateWithHistory());
    missingParticipant.world.people[INITIAL_PERSON_ID].lifeEvents![0].participants[0].personId = missingPersonId;
    expect(isValidGameState(missingParticipant)).toBe(false);

    const missingBasis = structuredClone(stateWithHistory());
    missingBasis.world.people[INITIAL_PERSON_ID].familiarities![0].basisLifeEventIds = ['life-event-not-present'];
    expect(isValidGameState(missingBasis)).toBe(false);
  });

  it('rejects duplicate Life Event ordering and duplicate familiarity domain/scope keys', () => {
    const duplicateOrder = structuredClone(stateWithHistory());
    duplicateOrder.world.people[INITIAL_PERSON_ID].lifeEvents!.push({
      ...duplicateOrder.world.people[INITIAL_PERSON_ID].lifeEvents![0],
      id: 'life-event-second',
      kind: 'first_instruction',
    });
    expect(isValidGameState(duplicateOrder)).toBe(false);

    const duplicateFamiliarity = structuredClone(stateWithHistory());
    duplicateFamiliarity.world.people[INITIAL_PERSON_ID].familiarities!.push({
      ...duplicateFamiliarity.world.people[INITIAL_PERSON_ID].familiarities![0],
      id: 'familiarity-duplicate',
    });
    expect(isValidGameState(duplicateFamiliarity)).toBe(false);
  });

  it('accepts events without named participants and rejects duplicate participant references', () => {
    const anonymousHistory = structuredClone(stateWithHistory());
    anonymousHistory.world.people[INITIAL_PERSON_ID].lifeEvents![0].participants = [];
    expect(isValidGameState(anonymousHistory)).toBe(true);

    const duplicateParticipants = structuredClone(stateWithHistory());
    duplicateParticipants.world.people[INITIAL_PERSON_ID].lifeEvents![0].participants.push({
      ...duplicateParticipants.world.people[INITIAL_PERSON_ID].lifeEvents![0].participants[0],
      role: 'helper',
    });
    expect(isValidGameState(duplicateParticipants)).toBe(false);
  });

  it('rejects duplicate Life Event IDs and whitespace-only identifiers or summaries', () => {
    const duplicateId = structuredClone(stateWithHistory());
    duplicateId.world.people[INITIAL_PERSON_ID].lifeEvents!.push({
      ...duplicateId.world.people[INITIAL_PERSON_ID].lifeEvents![0],
      chronology: { stage: 'youth', order: 1 },
    });
    expect(isValidGameState(duplicateId)).toBe(false);

    const whitespaceId = structuredClone(stateWithHistory());
    (whitespaceId.world.people[INITIAL_PERSON_ID].lifeEvents![0] as unknown as Record<string, unknown>).contentId = '   ';
    expect(isValidGameState(whitespaceId)).toBe(false);

    const whitespaceScope = structuredClone(stateWithHistory());
    (whitespaceScope.world.people[INITIAL_PERSON_ID].familiarities![0] as unknown as Record<string, unknown>).scopeId = '  ';
    expect(isValidGameState(whitespaceScope)).toBe(false);
  });

  it('rejects malformed familiarity and duplicate provenance IDs', () => {
    const invalidExposure = structuredClone(stateWithHistory());
    (invalidExposure.world.people[INITIAL_PERSON_ID].familiarities![0] as unknown as Record<string, unknown>).exposure = 'mastered';
    expect(isValidGameState(invalidExposure)).toBe(false);

    const duplicateBasis = structuredClone(stateWithHistory());
    duplicateBasis.world.people[INITIAL_PERSON_ID].familiarities![0].basisLifeEventIds = [
      'life-event-origin', 'life-event-origin',
    ];
    expect(isValidGameState(duplicateBasis)).toBe(false);
  });
});
