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
import { generateDailyAssignments } from '../engine/assignmentGenerator';
import { createInitialGameState } from '../state/initialState';
import { transitionAssignmentActivityAction } from '../engine/assignmentActivity';
import { ASSIGNMENT_ACTIVITY_CATALOG } from '../content/assignments/northBayRoofInspection';
import { ERA_I_ANCHOR_OPPORTUNITY_DEFINITIONS } from '../content/assignments/eraIAnchorOpportunities';
import { ERA_I_COMMERCIAL_MARTIAL_OPPORTUNITY_DEFINITIONS } from '../content/assignments/eraICommercialMartial';
import { URUK_ASSIGNMENT_OPPORTUNITY_DEFINITIONS } from '../content/assignments/opportunityDefinitions';
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

  it('renders the actual Tier B commodity, unit, counterparty, figures, and linked records', () => {
    const base = createInitialGameState();
    const atDay14 = { ...base, calendar: { ...base.calendar, dayNumber: 14 } };
    const generated = generateDailyAssignments(atDay14);
    const offer = Object.values(generated.opportunities.assignments).find((item) =>
      item.activityId === 'activity-tierb-recurring-institutional-check'
      && item.originMatterId === 'matter-tierb-recurring-day-14');
    expect(offer).toBeDefined();
    const occurrence = generated.world.matters[offer!.originMatterId!]!.tierBRecurring!;
    const accepted = transitionGame(generated, { type: 'ACCEPT_ASSIGNMENT', assignmentId: offer!.id });
    expect(accepted.feedback?.kind).toBe('success');
    const markup = renderToStaticMarkup(createElement(GameProvider, { initialState: accepted.state },
      createElement(AssignmentActivityScreen, { assignmentId: offer!.id, onBack: () => undefined })));
    expect(markup).toContain('Occurrence particulars');
    expect(markup).toContain(occurrence.commodity);
    expect(markup).toContain(occurrence.unit);
    expect(markup).toContain(generated.world.people[occurrence.counterpartyPersonId]?.name);
    expect(markup).toContain(occurrence.quantitySummary);
    expect(markup).toContain(occurrence.sourceSummary);
    expect(markup).toContain('Dated source records');
    expect(markup).toContain(occurrence.quantitySummary);
  });

  it('rejects a Tier B finding that contradicts the dated outcome and files a Closing Receipt when corrected', () => {
    for (const [day, expectedFinding, wrongFinding] of [
      [14, 'records_reconcile', 'bounded_difference'],
      [16, 'bounded_difference', 'records_reconcile'],
    ] as const) {
      const base = createInitialGameState();
      const generated = generateDailyAssignments({
        ...base, calendar: { ...base.calendar, dayNumber: day },
      });
      const offer = Object.values(generated.opportunities.assignments).find((item) =>
        item.activityId === 'activity-tierb-recurring-institutional-check'
        && item.originMatterId === `matter-tierb-recurring-day-${day}`);
      expect(offer).toBeDefined();
      const accepted = transitionGame(generated, { type: 'ACCEPT_ASSIGNMENT', assignmentId: offer!.id });
      expect(accepted.feedback?.kind).toBe('success');
      let state = accepted.state;
      for (const actionId of ['tierb-compare-records', 'tierb-review-account', 'tierb-confirm-authority']) {
        const action = transitionAssignmentActivityAction(state, {
          type: 'PERFORM_ASSIGNMENT_ACTIVITY_ACTION', assignmentId: offer!.id, actionId,
        });
        expect(action.feedback?.kind).toBe('success');
        state = action.state;
      }
      const draft = {
        finding: wrongFinding, responsibilityClaim: 'none',
        citedDiscoveryIds: ['tierb-source-records', 'tierb-authority-boundary', 'tierb-counterparty-account'],
        limitations: [], recommendations: ['retain_sources'],
        selectedLimitationIds: ['source_scope', 'no_individual_blame', 'cause_unlocated'],
      };
      const draftUpdate = transitionAssignmentActivityAction(state, {
        type: 'UPDATE_ASSIGNMENT_ACTIVITY_DRAFT', assignmentId: offer!.id, draft,
      });
      expect(draftUpdate.feedback?.kind).toBe('success');
      state = draftUpdate.state;
      const rejected = transitionAssignmentActivityAction(state, {
        type: 'SUBMIT_ASSIGNMENT_ACTIVITY', assignmentId: offer!.id,
      });
      expect(rejected.feedback?.code).toBe('tierb-finding-outcome-mismatch');
      expect(rejected.state).toBe(state);
      const corrected = transitionAssignmentActivityAction(state, {
        type: 'UPDATE_ASSIGNMENT_ACTIVITY_DRAFT', assignmentId: offer!.id,
        draft: { ...draft, finding: expectedFinding },
      });
      expect(corrected.feedback?.kind).toBe('success');
      const submitted = transitionAssignmentActivityAction(corrected.state, {
        type: 'SUBMIT_ASSIGNMENT_ACTIVITY', assignmentId: offer!.id,
      });
      expect(submitted.feedback?.kind).toBe('success');
      const completed = submitted.state.opportunities.assignments[offer!.id];
      expect(completed.status).toBe('completed');
      expect(completed.closingReceipt).toBeDefined();
      expect(completed.closingReceipt?.assessment).toBe('Thorough');
      expect(completed.closingReceipt?.title).toBeTruthy();
      const report = Object.values(submitted.state.records.entries).find((record) => record.id === `record-${offer!.id}-day-${day}`);
      expect(report?.assertions.some((assertion) => assertion.text === `Finding: ${expectedFinding === 'records_reconcile'
        ? 'The cited records reconcile within their stated categories and units'
        : 'A bounded difference or condition is recorded; its cause is not established'}`)).toBe(true);
    }
  });

  it('keeps player-facing assignment and NPC text free of research/meta labels and museum identifiers', () => {
    const base = createInitialGameState();
    const generated = generateDailyAssignments({
      ...base, calendar: { ...base.calendar, dayNumber: 20 },
    });
    const collectStrings = (value: unknown): string[] => {
      if (typeof value === 'string') return [value];
      if (Array.isArray(value)) return value.flatMap(collectStrings);
      if (value && typeof value === 'object') return Object.values(value as Record<string, unknown>).flatMap(collectStrings);
      return [];
    };
    const authoredOffers = [
      ...ERA_I_ANCHOR_OPPORTUNITY_DEFINITIONS.map((definition) => definition.offer),
      ...ERA_I_COMMERCIAL_MARTIAL_OPPORTUNITY_DEFINITIONS.map((definition) => definition.offer),
      ...URUK_ASSIGNMENT_OPPORTUNITY_DEFINITIONS.map((definition) => definition.offer),
      ...Object.values(generated.opportunities.assignments),
    ];
    const offerText = authoredOffers.flatMap((offer) => [
      offer.title, offer.description, ...collectStrings(offer.context),
    ]);
    const activityText = Object.values(ASSIGNMENT_ACTIVITY_CATALOG).flatMap((definition) => [
      definition.title, ...definition.discoveries.map((discovery) => discovery.text),
      ...(definition.reportSchema.limitationOptions ?? []).map((option) => option.label),
    ]);
    const socialIdentityText = Object.values(generated.world.people).flatMap((person) =>
      collectStrings(person.socialIdentity));
    const playerFacing = [...offerText, ...activityText, ...socialIdentityText].join('\n');
    expect(playerFacing).not.toMatch(/tier\s*b|provisional|authored gameplay fiction|authored reconstruction|authored participant|gameplay fiction/i);
    expect(playerFacing).not.toMatch(/W\s*9827|W\s*15897|MSVO|catalogued Uruk III and often attributed to Jemdet Nasr/i);
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
