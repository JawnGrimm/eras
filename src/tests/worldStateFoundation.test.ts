import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ProductionPeopleAndInstitutions } from '../components/ProductionPeopleAndInstitutions';
import { GameProvider } from '../state/GameProvider';
import { advanceInstitutionalMatters, MATTER_IDS, STOREHOUSE_INSTITUTION_ID } from '../engine/institutionalMatters';
import { createInitialGameState, INITIAL_PERSON_ID } from '../state/initialState';
import { createNewGameState, INITIAL_WORK_CATALOG } from '../state/newGameState';
import { createSaveEnvelope, isValidSaveEnvelope, restoreSave } from '../state/saveEnvelope';
import type { PersonId } from '../state/ids';

describe('Phase 2 Uruk world-state foundation', () => {
  it('seeds typed NPC identity, circumstances, independent objectives, and sourced office duties', () => {
    const state = createInitialGameState();
    const steward = state.world.people['person-ur-nanna' as PersonId];
    const receivingOfficial = state.world.people['person-utu-mansum' as PersonId];
    const carrierForeman = state.world.people['person-enlil-kisu' as PersonId];
    const seniorScribe = state.world.people['person-shuruppak-ilu' as PersonId];

    expect(state.world.people[INITIAL_PERSON_ID].lifeStage).toBe('junior_scribe');
    expect(state.world.people['person-uruk-nin-aya' as PersonId].lifeStage).toBe('apprentice');
    expect(steward.lifeStage).toBe('active_official');
    expect(receivingOfficial.circumstances?.[0].relatedMatterIds).toContain(MATTER_IDS.southCourtDelivery);
    expect(carrierForeman.objectives?.[0].visibility).toBe('private');
    expect(seniorScribe.commitments?.[0].basis).toEqual({
      kind: 'appointment',
      id: 'appointment-shuruppak-ilu-senior-scribe',
    });
    expect(steward.objectives?.[0].summary).not.toBe(receivingOfficial.objectives?.[0].summary);
    expect(steward.commitments?.[0].summary).toContain('Safeguard institutional stocks');
  });

  it('seeds active matters with participants, locations, and explicit provenance', () => {
    const state = createInitialGameState();
    const delivery = state.world.matters[MATTER_IDS.southCourtDelivery];
    const awning = state.world.matters[MATTER_IDS.southLoadingAwning];
    const institution = state.world.institutions[STOREHOUSE_INSTITUTION_ID];

    expect(delivery.status).toBe('active');
    expect(delivery.involvedPersonIds).toEqual(expect.arrayContaining([
      'person-ur-nanna', 'person-utu-mansum', 'person-enlil-kisu', 'person-shuruppak-ilu',
    ]));
    expect(delivery.provenance?.map((source) => source.kind)).toContain('record_copy');
    expect(awning.locationId).toBe('location-uruk-south-loading-court');
    expect(awning.provenance?.some((source) => source.kind === 'testimony')).toBe(true);
    expect(institution.activeMatters).toEqual(expect.arrayContaining([
      MATTER_IDS.tutorial, MATTER_IDS.southCourtDelivery, MATTER_IDS.southLoadingAwning,
    ]));
  });

  it('keeps independent objectives private from the People and Institutions public dossier data', () => {
    const state = createInitialGameState();
    const foreman = state.world.people['person-enlil-kisu' as PersonId];
    expect(foreman.objectives?.every((objective) => objective.visibility === 'private')).toBe(true);
    expect(foreman.circumstances?.every((circumstance) => circumstance.visibility === 'public')).toBe(true);
  });

  it('shows public circumstances and duties without revealing private NPC objectives', () => {
    const state = createNewGameState();
    const markup = renderToStaticMarkup(createElement(GameProvider, { initialState: state }, createElement(ProductionPeopleAndInstitutions)));
    expect(markup).toContain('Current circumstances');
    expect(markup).toContain('Declared responsibilities and commitments');
    expect(markup).toContain('Two reed ties on the south loading awning are visibly frayed');
    expect(markup).not.toContain('Ensure the dispatch quantity is distinguished from the receiving count.');
    expect(markup).toContain('active official');
  });

  it('preserves the new profile and matter data through a schema-v2 save round trip', () => {
    const state = createNewGameState();
    const envelope = createSaveEnvelope(state, 3, '2026-11-22T12:00:00.000Z');
    expect(isValidSaveEnvelope(envelope, INITIAL_WORK_CATALOG)).toBe(true);
    const restored = restoreSave(JSON.stringify(envelope), INITIAL_WORK_CATALOG);
    expect(restored?.state.world.people['person-ur-nanna' as PersonId].objectives).toEqual(
      state.world.people['person-ur-nanna' as PersonId].objectives,
    );
    expect(restored?.state.world.matters[MATTER_IDS.southCourtDelivery].provenance).toEqual(
      state.world.matters[MATTER_IDS.southCourtDelivery].provenance,
    );
  });

  it('leaves unresolved matters untouched when no authored development condition is met', () => {
    const state = createInitialGameState();
    const advanced = advanceInstitutionalMatters(state, 2);
    expect(advanced.world.matters[MATTER_IDS.southCourtDelivery]).toEqual(state.world.matters[MATTER_IDS.southCourtDelivery]);
    expect(advanced.world.matters[MATTER_IDS.southLoadingAwning]).toEqual(state.world.matters[MATTER_IDS.southLoadingAwning]);
    expect(advanced.world.events).toEqual(state.world.events);
  });
});
