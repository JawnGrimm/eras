import React, { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ProductionShellContent } from '../components/ProductionShell';
import { ProductionRecordsAndJournal } from '../components/ProductionRecordsAndJournal';
import { deriveProfessionalRank } from '../engine/professionalRank';
import { GameProvider } from '../state/GameProvider';
import { getInitializedScribal } from '../state/scribalState';
import { createDay13SnapshotDisplayFixture } from './fixtures/day13SnapshotDisplay';

function renderScreen(state: ReturnType<typeof createDay13SnapshotDisplayFixture>, screen: React.ReactElement) {
  return renderToStaticMarkup(createElement(GameProvider, { initialState: state }, screen));
}

describe('GD-STATE-INTEGRITY-001 Day-13 snapshot display fixture', () => {
  it('projects the approved ledger values from their independent authoritative fields', () => {
    const state = createDay13SnapshotDisplayFixture();
    const person = state.world.people[state.player.currentCharacterId];
    const scribal = getInitializedScribal(person)!;
    const shell = renderScreen(state, createElement(ProductionShellContent));

    expect(state.calendar.dayNumber).toBe(13);
    expect(shell).toContain('Day 13 · Uruk (c. 3200 BCE)');
    expect(shell).toContain('Action Points</span><p class="font-mono text-base font-semibold text-stone-900">3/6');
    expect(shell).toContain('Currency</span><p class="font-mono text-base font-semibold text-stone-900">77');
    expect(shell).toContain('Provisions</span><p class="font-mono text-base font-semibold text-stone-900">9');
    expect(shell).toContain('Career XP: 631');
    expect(shell).toContain('Historical XP: 0');
    expect(shell).toContain('Stress: 5/100');
    expect(deriveProfessionalRank(scribal.skills)).toBe(1);
    expect(shell).toContain('Professional Rank: Grade 1');
    expect(state.historicalProgression.historicalXp).toBe(0);
    expect(scribal.wallet.money).toBe(77);
    expect(scribal.wallet.provisions).toBe(9);
    expect(scribal.careerXp).toBe(631);
    expect(scribal.stress).toBe(5);
  });

  it('projects the archived-record count from the actual Record collection rather than another progression value', () => {
    const state = createDay13SnapshotDisplayFixture();
    const markup = renderScreen(state, createElement(ProductionRecordsAndJournal));
    const count = Object.values(state.records.entries).length;
    expect(markup).toContain(`${count} archived ${count === 1 ? 'record' : 'records'}`);
  });
});
