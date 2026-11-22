import React, { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ProductionShellContent } from '../components/ProductionShell';
import { SuccessionScreen } from '../components/SuccessionScreen';
import { ProductionPeopleAndInstitutions } from '../components/ProductionPeopleAndInstitutions';
import { ProductionRecordsAndJournal } from '../components/ProductionRecordsAndJournal';
import { ProductionWorkdayHub } from '../components/ProductionWorkdayHub';
import { ProductionChallengeJournal } from '../components/ProductionChallengeJournal';
import { createNewGameState } from '../state/newGameState';
import { transitionGame } from '../engine/actionEconomy';
import { createInitialGameState, INITIAL_PERSON_ID } from '../state/initialState';
import { GameProvider } from '../state/GameProvider';
import type { AppointmentId, EventId, KnowledgeEntryId, PersonId, RecordId } from '../state/ids';
import type { GameState, RecordEntry } from '../state/types';

function renderScreen(state: GameState, screen: React.ReactElement) {
  return renderToStaticMarkup(createElement(GameProvider, { initialState: state }, screen));
}

describe('production continuity and social screens', () => {
  it('shows candidates in engine priority order with their own rank, skills, wallet, and directional ties', () => {
    const departed = transitionGame(createInitialGameState(), { type: 'BEGIN_CHARACTER_DEPARTURE', departureKind: 'death' });
    const state = departed.state;
    const markup = renderScreen(state, createElement(SuccessionScreen));
    const ninAyaIndex = markup.indexOf('Nin-aya');
    const urGirIndex = markup.indexOf('Ur-gir');

    expect(state.pendingSuccession?.status).toBe('awaiting_selection');
    expect(ninAyaIndex).toBeGreaterThan(-1);
    expect(urGirIndex).toBeGreaterThan(ninAyaIndex);
    expect(markup).toContain('Derived professional rank: Grade');
    expect(markup).toContain('Connection priority: Direct personal connection');
    expect(markup).toContain('Reading scripts');
    expect(markup).toContain('Silver');
    expect(markup).toContain('Enlil-barni → Nin-aya');
    expect(markup).toContain('Ur-gir → Enlil-barni');
    expect(markup).toContain('Relationship history');
  });

  it('renders a terminal no-successor state without inventing a replacement or resetting the era', () => {
    const base = createInitialGameState();
    const disconnected: GameState = {
      ...base,
      world: { ...base.world, people: { [INITIAL_PERSON_ID]: base.world.people[INITIAL_PERSON_ID] }, relationships: {} },
    };
    const pending = transitionGame(disconnected, { type: 'BEGIN_CHARACTER_DEPARTURE', departureKind: 'departure' }).state;
    const markup = renderScreen(pending, createElement(SuccessionScreen));

    expect(pending.pendingSuccession?.status).toBe('no_successor');
    expect(Object.keys(pending.world.people)).toEqual([INITIAL_PERSON_ID]);
    expect(markup).toContain('No successor is available');
    expect(markup).toContain('terminal continuity boundary');
    expect(markup).not.toContain('Continue as');
  });

  it('replaces ordinary navigation with succession UI while transition is pending', () => {
    const state = transitionGame(createInitialGameState(), { type: 'BEGIN_CHARACTER_DEPARTURE', departureKind: 'death' }).state;
    const markup = renderScreen(state, createElement(ProductionShellContent));
    expect(markup).toContain('Choose who continues');
    expect(markup).not.toContain('Assignment Board</button>');
    expect(markup).not.toContain('Workday Hub</button>');
  });

  it('keeps Workday quick Accept disabled for expired or unqualified offers and labels Assignment-only rewards accurately', () => {
    const fresh = createNewGameState();
    const first = Object.values(fresh.opportunities.assignments)[0];
    const expiredState: GameState = {
      ...fresh,
      calendar: { ...fresh.calendar, dayNumber: first.expiresDay },
    };
    const expiredMarkup = renderScreen(expiredState, createElement(ProductionWorkdayHub, {
      onOpenWork: () => undefined, settlement: null, onSettlement: () => undefined,
    }));
    const unqualifiedOffer = { ...first, requiredSkills: { reading_scripts: 10 } };
    const unqualifiedState: GameState = {
      ...fresh,
      opportunities: { ...fresh.opportunities, assignments: { [unqualifiedOffer.id]: unqualifiedOffer } },
    };
    const unqualifiedMarkup = renderScreen(unqualifiedState, createElement(ProductionWorkdayHub, {
      onOpenWork: () => undefined, settlement: null, onSettlement: () => undefined,
    }));
    const journalMarkup = renderScreen(fresh, createElement(ProductionChallengeJournal));

    expect(expiredMarkup).toContain('This offer has reached its expiry day.');
    expect(expiredMarkup).toMatch(/disabled=""[^>]*>Accept</);
    expect(unqualifiedMarkup).toContain('Current skills do not meet the stated requirements.');
    expect(unqualifiedMarkup).toMatch(/disabled=""[^>]*>Accept</);
    expect(journalMarkup).toContain('Assignment rewards');
    expect(journalMarkup).not.toContain('Career rewards');
  });

  it('renders directional relationships separately and separates reputation from institution standing and authority', () => {
    const base = createInitialGameState();
    const appointmentId = 'appointment-reviewer' as AppointmentId;
    const state: GameState = {
      ...base,
      world: {
        ...base.world,
        people: {
          ...base.world.people,
          [INITIAL_PERSON_ID]: { ...base.world.people[INITIAL_PERSON_ID], scribal: {
            ...base.world.people[INITIAL_PERSON_ID].scribal!,
            institutionalStanding: { ['institution-uruk-temple-storehouse' as never]: 73 },
          } },
        },
        appointments: {
          [appointmentId]: { id: appointmentId, personId: INITIAL_PERSON_ID,
            institutionId: 'institution-uruk-temple-storehouse' as never, title: 'Account Keeper',
            authorityScope: ['Verify incoming measures'], responsibilities: ['Maintain daily accounts'], startDay: 1 },
        },
      },
    };
    const markup = renderScreen(state, createElement(ProductionPeopleAndInstitutions));

    expect(markup).toContain('Enlil-barni → Nin-aya');
    expect(markup).toContain('Ur-gir → Enlil-barni');
    expect(markup).not.toContain('Nin-aya → Enlil-barni');
    expect(markup).toContain('Professional reputation');
    expect(markup).toContain('Institutional standing');
    expect(markup).toContain('Verify incoming measures');
    expect(markup).toContain('Active matters');
  });

  it('renders immutable record assertions, append-only amendments, knowledge holders, and durable notices', () => {
    const base = createInitialGameState();
    const recordId = 'record-ledger' as RecordId;
    const eventId = 'event-ledger' as EventId;
    const record: RecordEntry = {
      id: recordId, createdDay: 1, authorPersonId: INITIAL_PERSON_ID, title: 'Ledger of incoming measures',
      sources: [{ id: 'source-observation', kind: 'other', description: 'Direct observation at the storehouse' }],
      assertions: [{ id: 'assertion-original', text: 'Twelve measures were entered.', classification: 'observed', sourceIds: ['source-observation'] }],
      uncertaintyLimits: ['The seal was not independently verified.'],
      amendments: [{ id: 'amendment-1', dayNumber: 2, authorPersonId: INITIAL_PERSON_ID, reason: 'A later inspection qualified the entry.',
        sourcesAdded: [], assertionsAdded: [{ id: 'assertion-added', text: 'The seal impression is incomplete.', classification: 'reported', sourceIds: ['source-observation'] }],
        uncertaintyLimitsAdded: ['The responsible carrier remains unidentified.'], note: 'The original quantity assertion is preserved.' }],
    };
    const state: GameState = {
      ...base,
      calendar: { ...base.calendar, dayNumber: 2 },
      world: {
        ...base.world,
        events: { [eventId]: { id: eventId, dayNumber: 1, summary: 'A storehouse delivery was observed.', personIds: [INITIAL_PERSON_ID], institutionIds: [] } },
        knowledge: {
          ['knowledge-ledger' as KnowledgeEntryId]: { id: 'knowledge-ledger' as KnowledgeEntryId,
            holder: { kind: 'person', id: INITIAL_PERSON_ID }, subject: { kind: 'record', id: recordId },
            basis: 'received-copy', learnedDay: 2 },
        },
      },
      records: { ...base.records, entries: { [recordId]: record } },
      journal: { notices: [{ id: 'notice-1', dayNumber: 2, category: 'world', message: 'The seal impression was questioned.', read: false }] },
    };
    const markup = renderScreen(state, createElement(ProductionRecordsAndJournal));

    expect(markup).toContain('Original record preserved');
    expect(markup).toContain('Twelve measures were entered.');
    expect(markup).toContain('The original quantity assertion is preserved.');
    expect(markup).toContain('The seal was not independently verified.');
    expect(markup).toContain('The responsible carrier remains unidentified.');
    expect(markup).toContain('Enlil-barni');
    expect(markup).toContain('Received a copy');
    expect(markup).toContain('The seal impression was questioned.');
    expect(markup).toContain('Mark read');
  });
});
