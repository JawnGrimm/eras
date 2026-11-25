import { describe, expect, it } from 'vitest';
import { transitionGame } from '../engine/actionEconomy';
import { createSaveEnvelope, isValidSaveEnvelope, restoreSave } from '../state/saveEnvelope';
import { INITIAL_WORK_CATALOG, createNewGameState } from '../state/newGameState';
import type { CareerPathId } from '../state/ids';
import { TEST_CHARACTER_CREATION } from './fixtures/newGameCharacter';

const orientations: CareerPathId[] = ['government', 'religious', 'merchant', 'military'];

describe('GD-OPPORTUNITY-001 multi-day Day-Close and save/load regression', () => {
  it.each(orientations)('preserves the shared Assignment and Day-Close loop across the %s orientation', (careerPath) => {
    let state = createNewGameState({ ...TEST_CHARACTER_CREATION, careerPath });
    expect(state.world.people[state.player.currentCharacterId].scribal?.careerPath).toBe(careerPath);
    expect(Object.keys(state.opportunities.assignments)).toHaveLength(2);
    expect(Object.keys(state.opportunities.challenges)).toHaveLength(0);

    for (let completedDay = 1; completedDay <= 3; completedDay += 1) {
      const closed = transitionGame(state, {
        type: 'END_DAY', expectedDayNumber: state.calendar.dayNumber,
      }, undefined, INITIAL_WORK_CATALOG);
      expect(closed.feedback?.kind).toBe('success');
      expect(closed.state.dayClose.phase).toBe('interlude_open');
      const settlementId = closed.state.dayClose.pendingSettlementId;
      expect(settlementId).toBe(`era-1:${completedDay}`);

      const envelope = createSaveEnvelope(closed.state, completedDay, '2026-11-24T12:00:00.000Z');
      expect(isValidSaveEnvelope(envelope, INITIAL_WORK_CATALOG)).toBe(true);
      const restored = restoreSave(JSON.stringify(envelope), INITIAL_WORK_CATALOG);
      expect(restored).not.toBeNull();
      expect(restored?.state.dayClose.pendingSettlementId).toBe(settlementId);

      const opened = transitionGame(restored!.state, {
        type: 'BEGIN_WORKDAY', expectedSettlementId: settlementId!,
      }, undefined, INITIAL_WORK_CATALOG);
      expect(opened.feedback?.kind).toBe('success');
      expect(opened.state.calendar.dayNumber).toBe(completedDay + 1);
      expect(opened.state.dayClose.phase).toBe('workday_open');
      expect(opened.state.world.people[opened.state.player.currentCharacterId].scribal?.careerPath).toBe(careerPath);
      expect(new Set(Object.keys(opened.state.opportunities.assignments)).size)
        .toBe(Object.keys(opened.state.opportunities.assignments).length);
      state = opened.state;
    }

    expect(state.calendar.dayNumber).toBe(4);
    expect(state.world.people[state.player.currentCharacterId].scribal?.careerPath).toBe(careerPath);
  });
});
