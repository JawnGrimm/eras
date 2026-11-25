import React, { createElement } from 'react';
import { TEST_CHARACTER_CREATION } from './fixtures/newGameCharacter';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ProductionAssignmentBoard } from '../components/ProductionAssignmentBoard';
import { AssignmentActivityScreen } from '../components/AssignmentActivityScreen';
import { ProductionChallengeJournal } from '../components/ProductionChallengeJournal';
import { ProductionWorkdayHub } from '../components/ProductionWorkdayHub';
import { GameProvider } from '../state/GameProvider';
import { createNewGameState } from '../state/newGameState';
import { transitionGame } from '../engine/actionEconomy';
import type { ChallengeId } from '../state/ids';

describe('production opportunity screens', () => {
  it('renders Assignment delivery reasons and visible calendar expiry', () => {
    const state = createNewGameState(TEST_CHARACTER_CREATION);
    const markup = renderToStaticMarkup(createElement(GameProvider, { initialState: state },
      createElement(ProductionAssignmentBoard)));

    expect(markup).toContain('Assignment Board');
    expect(markup).toContain('Currency');
    expect(markup).not.toContain('silver');
    expect(markup).toContain('Why this reached you');
    expect(markup).toContain('Enlil-kisu’s dispatch copy is being compared with the Temple Storehouse receiving tally.');
    expect(markup).toContain('Ur-Nanna has asked a storehouse scribe to document the awning before further loading.');
    expect(markup).not.toContain('ordinary professional reach in Uruk');
    expect(markup).toContain('South-Court Delivery Reconciliation');
    expect(markup).toContain('South Loading-Awning Inspection');
    expect(markup).toContain('Expires Day 4');
    expect(markup).toContain('3 days remaining');
  });

  it('discloses authored Provision compensation on the pre-acceptance Workday offer card', () => {
    const state = createNewGameState(TEST_CHARACTER_CREATION);
    const southCourtOffer = Object.values(state.opportunities.assignments)
      .find((offer) => offer.activityId === 'activity-south-court-delivery-reconciliation');
    expect(southCourtOffer).toBeDefined();
    expect(southCourtOffer!.compensation.provisions).toBe(1);
    const markup = renderToStaticMarkup(createElement(GameProvider, { initialState: state },
      createElement(ProductionWorkdayHub)));
    const assignmentSection = markup.indexOf('Assignments / Commissions');
    const southCourtTitle = markup.indexOf('South-Court Delivery Reconciliation', assignmentSection);
    const southCourtCard = markup.slice(southCourtTitle, markup.indexOf('</article>', southCourtTitle));

    expect(southCourtTitle).toBeGreaterThan(assignmentSection);
    expect(southCourtCard).toContain('+1 Provision in kind');
    expect(southCourtCard).toContain(`${southCourtOffer!.compensation.money} Currency`);
    expect(southCourtCard).toContain('Career XP');
  });

  it('shows responsibility guidance only on the Assignment that authors it', () => {
    const fresh = createNewGameState(TEST_CHARACTER_CREATION);
    const southCourt = Object.values(fresh.opportunities.assignments).find((offer) => offer.title === 'South-Court Delivery Reconciliation')!;
    const southCourtAccepted = transitionGame(fresh, { type: 'ACCEPT_ASSIGNMENT', assignmentId: southCourt.id });
    const southCourtMarkup = renderToStaticMarkup(createElement(GameProvider, { initialState: southCourtAccepted.state },
      createElement(AssignmentActivityScreen, { assignmentId: southCourt.id, onBack: () => undefined })));
    expect(southCourtMarkup).not.toContain('Dudu’s recorded contract');

    const awning = Object.values(fresh.opportunities.assignments).find((offer) => offer.title === 'South Loading-Awning Inspection')!;
    const awningAccepted = transitionGame(fresh, { type: 'ACCEPT_ASSIGNMENT', assignmentId: awning.id });
    const awningMarkup = renderToStaticMarkup(createElement(GameProvider, { initialState: awningAccepted.state },
      createElement(AssignmentActivityScreen, { assignmentId: awning.id, onBack: () => undefined })));
    expect(awningMarkup).toContain('Dudu’s recorded contract');
  });

  it('renders completed Challenge outcome and character attribution without operational declined state', () => {
    const state = createNewGameState(TEST_CHARACTER_CREATION);
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
    expect(markup).toContain('Resolved by Test Scribe');
    expect(markup).not.toContain('Declined challenges archive');
  });
});
