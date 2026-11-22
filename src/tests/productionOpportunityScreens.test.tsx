import React, { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ProductionAssignmentBoard } from '../components/ProductionAssignmentBoard';
import { ProductionChallengeJournal } from '../components/ProductionChallengeJournal';
import { GameProvider } from '../state/GameProvider';
import { createNewGameState } from '../state/newGameState';
import type { ChallengeId } from '../state/ids';

describe('production opportunity screens', () => {
  it('renders Assignment delivery reasons and visible calendar expiry', () => {
    const state = createNewGameState();
    const markup = renderToStaticMarkup(createElement(GameProvider, { initialState: state },
      createElement(ProductionAssignmentBoard)));

    expect(markup).toContain('Assignment Board');
    expect(markup).toContain('Why this reached you');
    expect(markup).toContain('Enlil-kisu’s dispatch copy is being compared with the Temple Storehouse receiving tally.');
    expect(markup).toContain('Ur-Nanna has asked a storehouse scribe to document the awning before further loading.');
    expect(markup).not.toContain('ordinary professional reach in Uruk');
    expect(markup).toContain('South-Court Delivery Reconciliation');
    expect(markup).toContain('South Loading-Awning Inspection');
    expect(markup).toContain('Expires Day 4');
    expect(markup).toContain('3 days remaining');
  });

  it('renders completed Challenge outcome and character attribution without operational declined state', () => {
    const state = createNewGameState();
    const outcome = {
      challengeId: 'archived-challenge' as ChallengeId,
      title: 'The Disputed Copy',
      category: 'scribal_instruction',
      resolvedDay: 3,
      choiceId: 'preserve',
      choiceLabel: 'Preserve the uncertain reading',
      summary: 'The uncertainty was retained in the copy.',
      assigneePersonId: state.player.currentCharacterId,
    };
    const withArchive = { ...state, opportunities: { ...state.opportunities, challengeOutcomes: [outcome] } };
    const markup = renderToStaticMarkup(createElement(GameProvider, { initialState: withArchive },
      createElement(ProductionChallengeJournal)));

    expect(markup).toContain('Challenge Journal');
    expect(markup).toContain('Completed Challenge archive');
    expect(markup).toContain('The Disputed Copy');
    expect(markup).toContain('Resolved by Enlil-barni');
    expect(markup).not.toContain('Declined challenges archive');
  });
});
