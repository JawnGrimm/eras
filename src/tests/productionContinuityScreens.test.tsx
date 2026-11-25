import React, { createElement } from 'react';
import { TEST_CHARACTER_CREATION } from './fixtures/newGameCharacter';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ProductionShellContent } from '../components/ProductionShell';
import { SuccessionScreen } from '../components/SuccessionScreen';
import { ProductionPeopleAndInstitutions } from '../components/ProductionPeopleAndInstitutions';
import { ProductionRecordsAndJournal } from '../components/ProductionRecordsAndJournal';
import { ProductionWorkdayHub } from '../components/ProductionWorkdayHub';
import { StorehouseWorkScreen } from '../components/StorehouseWorkScreen';
import { ProductionChallengeJournal } from '../components/ProductionChallengeJournal';
import { createNewGameState } from '../state/newGameState';
import { transitionGame } from '../engine/actionEconomy';
import { createInitialGameState, INITIAL_PERSON_ID } from '../state/initialState';
import { GameProvider } from '../state/GameProvider';
import type { AppointmentId, EventId, KnowledgeEntryId, MatterId, PersonId, RecordId } from '../state/ids';
import type { GameState, InstitutionalMatter, RecordEntry, WorldEvent } from '../state/types';
import { getInitializedScribal } from '../state/scribalState';
import { createSaveEnvelope, restoreSave } from '../state/saveEnvelope';
import { INITIAL_WORK_CATALOG } from '../state/newGameState';
import { STOREHOUSE_WORK_ID } from '../works/storehouseReckoning';
import { relationshipFamiliarityEpisodeId } from '../state/relationshipFamiliarity';

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
    expect(markup).toContain('Currency');
    expect(markup).not.toContain('Silver');
    expect(markup).toContain('Enlil-barni → Nin-aya');
    expect(markup).toContain('Ur-gir → Enlil-barni');
    expect(markup).toContain('Relationship history');
  });

  it('shows a provenanced familiarity-only direction without fabricating sentiment dimensions', () => {
    const base = createInitialGameState();
    const subjectId = Object.keys(base.world.people).find((id) => id !== INITIAL_PERSON_ID
      && !base.world.relationships[INITIAL_PERSON_ID]?.[id as PersonId]
      && !base.world.relationships[id as PersonId]?.[INITIAL_PERSON_ID])! as PersonId;
    const eventId = 'event-familiarity-ui' as EventId;
    const event: WorldEvent = {
      id: eventId, dayNumber: 1, summary: 'A substantive response was returned.',
      personIds: [INITIAL_PERSON_ID, subjectId], institutionIds: [],
    };
    const episode = {
      id: relationshipFamiliarityEpisodeId(INITIAL_PERSON_ID, subjectId, 'assignment-ui-01', 'closing_receipt_assessment'),
      observerPersonId: INITIAL_PERSON_ID, subjectPersonId: subjectId,
      acquisitionMode: 'direct_interaction' as const, interactionKind: 'closing_receipt_assessment',
      occasionId: 'assignment-ui-01', contextId: 'era_i_assignment',
      stageContribution: 'acquainted' as const, dayNumber: 1,
      provenance: [{ kind: 'event' as const, id: eventId }],
    };
    const state: GameState = {
      ...base,
      world: {
        ...base.world,
        events: { ...base.world.events, [eventId]: event },
        relationshipFamiliarityEpisodes: { [episode.id]: episode },
      },
    };
    expect(state.world.relationships[INITIAL_PERSON_ID]?.[subjectId]).toBeUndefined();
    const markup = renderScreen(state, createElement(ProductionPeopleAndInstitutions));
    expect(markup).toContain('Personal familiarity');
    expect(markup).toContain('acquainted');
    expect(markup).toContain('Familiarity evidence');
    expect(markup).toContain('No sentiment scores are recorded in this direction.');
    expect(markup).toContain('A substantive response was returned.');
    expect(markup).not.toContain('event-familiarity-ui');
    expect(markup).toContain('No sentiment scores are recorded in this direction.');
  });

  it('renders singular relationship history with a readable event summary instead of its ID', () => {
    const base = createInitialGameState();
    const subjectId = Object.keys(base.world.people).find((id) => id !== INITIAL_PERSON_ID) as PersonId;
    const eventId = 'event-relationship-history-ui' as EventId;
    const event: WorldEvent = {
      id: eventId, dayNumber: 1, summary: 'The receiving official returned the report with thanks.',
      personIds: [INITIAL_PERSON_ID, subjectId], institutionIds: [],
    };
    const state: GameState = {
      ...base,
      world: {
        ...base.world,
        events: { ...base.world.events, [eventId]: event },
        relationships: {
          ...base.world.relationships,
          [INITIAL_PERSON_ID]: {
            ...base.world.relationships[INITIAL_PERSON_ID],
            [subjectId]: {
              dimensions: { trust: 52, respect: 51, affection: 50, resentment: 0, rivalry: 0 },
              history: [{ id: 'history-relationship-ui', dayNumber: 1, summary: 'The report was received.', eventId }],
            },
          },
        },
      },
    };
    const markup = renderScreen(state, createElement(ProductionPeopleAndInstitutions));
    expect(markup).toContain('1 history entry');
    expect(markup).toContain('The report was received.');
    expect(markup).toContain('The receiving official returned the report with thanks.');
    expect(markup).not.toContain('event-relationship-history-ui');
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

  it('shows Stress, derived Grade, and the tutorial label in the production shell', () => {
    const state = createNewGameState(TEST_CHARACTER_CREATION);
    const markup = renderScreen(state, createElement(ProductionShellContent));
    expect(markup).toContain('Stress: 0/100');
    expect(markup).toContain('Professional Rank: Grade 1');
    expect(markup).toContain('Introductory Tutorial · Storehouse');
    expect(markup).toContain('Currency');
    expect(markup).not.toContain('Silver');
    expect(markup).not.toContain('Active Work · Storehouse');
  });

  it('restores a legacy schema-v2 obligation and balance unchanged while presenting Currency copy', () => {
    const fresh = createNewGameState(TEST_CHARACTER_CREATION);
    const playerId = fresh.player.currentCharacterId;
    const person = fresh.world.people[playerId];
    const scribal = getInitializedScribal(person)!;
    const legacyObligation = {
      id: 'obligation-legacy-ur-gir',
      creditorPersonId: 'person-uruk-ur-gir' as PersonId,
      createdDay: 1,
      kind: 'repayment_or_service' as const,
      description: 'Repay one silver or provide one day of scribal assistance to Ur-gir, by mutual arrangement.',
      status: 'outstanding' as const,
    };
    const legacyState: GameState = {
      ...fresh,
      world: { ...fresh.world, people: { ...fresh.world.people, [playerId]: {
        ...person, scribal: { ...scribal, wallet: { ...scribal.wallet, money: 7, provisions: 3 }, obligations: [legacyObligation] },
      } } },
    };
    const restored = restoreSave(JSON.stringify(createSaveEnvelope(legacyState, 2)), INITIAL_WORK_CATALOG);
    expect(restored).not.toBeNull();
    const restoredScribal = getInitializedScribal(restored!.state.world.people[playerId])!;
    expect(restoredScribal.wallet).toMatchObject({ money: 7, provisions: 3 });
    expect(restoredScribal.obligations[0].description).toContain('one silver');
    const markup = renderScreen(restored!.state, createElement(ProductionWorkdayHub, {
      onOpenWork: () => undefined,
      onOpenEannaWork: () => undefined,
      onOpenEannaWork: () => undefined,
      onOpenEannaWork: () => undefined, onOpenActivity: () => undefined, settlement: null, onSettlement: () => undefined,
    }));
    expect(markup).toContain('one unit of Currency');
    expect(markup).not.toContain('silver');
  });

  it('renders authored tutorial action labels without exposing internal action IDs', () => {
    const state = createNewGameState(TEST_CHARACTER_CREATION);
    const markup = renderScreen(state, createElement(StorehouseWorkScreen, { onBack: () => undefined }));
    expect(markup).toContain('Examine intake inspection and issue records');
    expect(markup).not.toContain('intake_issue');
  });

  it('hides submission controls after the Storehouse tutorial is completed', () => {
    const fresh = createNewGameState(TEST_CHARACTER_CREATION);
    const progress = fresh.works.progress[STOREHOUSE_WORK_ID];
    const completed: GameState = {
      ...fresh,
      works: { activeWorkId: null, progress: {
        ...fresh.works.progress,
        [STOREHOUSE_WORK_ID]: {
          ...progress, status: 'completed', rewardGranted: true, pendingDisposition: false, finalDisposition: 'authorized',
        },
      } },
    };
    const markup = renderScreen(completed, createElement(StorehouseWorkScreen, { onBack: () => undefined }));
    expect(markup).toContain('Tutorial completed');
    expect(markup).not.toContain('Revise and resubmit');
    expect(markup).not.toContain('Submit for assessment');
  });

  it('keeps Workday quick Accept disabled for expired or unqualified offers and labels Assignment-only rewards accurately', () => {
    const fresh = createNewGameState(TEST_CHARACTER_CREATION);
    const first = Object.values(fresh.opportunities.assignments)[0];
    const expiredState: GameState = {
      ...fresh,
      calendar: { ...fresh.calendar, dayNumber: first.expiresDay },
    };
    const expiredMarkup = renderScreen(expiredState, createElement(ProductionWorkdayHub, {
      onOpenWork: () => undefined, onOpenActivity: () => undefined, settlement: null, onSettlement: () => undefined,
    }));
    const unqualifiedOffer = { ...first, requiredSkills: { reading_scripts: 10 } };
    const unqualifiedState: GameState = {
      ...fresh,
      opportunities: { ...fresh.opportunities, assignments: { [unqualifiedOffer.id]: unqualifiedOffer } },
    };
    const unqualifiedMarkup = renderScreen(unqualifiedState, createElement(ProductionWorkdayHub, {
      onOpenWork: () => undefined, onOpenActivity: () => undefined, settlement: null, onSettlement: () => undefined,
    }));
    const journalMarkup = renderScreen(fresh, createElement(ProductionChallengeJournal));

    expect(expiredMarkup).toContain('This offer has reached its expiry day.');
    expect(expiredMarkup).toMatch(/disabled=""[^>]*>Accept</);
    expect(unqualifiedMarkup).toContain('Current skills do not meet the stated requirements.');
    expect(unqualifiedMarkup).toMatch(/disabled=""[^>]*>Accept</);
    expect(journalMarkup).toContain('Assignment rewards');
    expect(journalMarkup).toContain('Currency');
    expect(journalMarkup).not.toContain('silver');
    expect(expiredMarkup).toContain('Currency');
    expect(expiredMarkup).not.toContain('silver');
    expect(journalMarkup).not.toContain('Career rewards');
  });

  it('renders directional relationships separately and separates reputation from institution standing and authority', () => {
    const base = createInitialGameState();
    const appointmentId = 'appointment-reviewer' as AppointmentId;
    const storehouseId = 'institution-uruk-temple-storehouse' as never;
    const unindexedActiveMatter: InstitutionalMatter = {
      id: 'matter-unindexed-active' as MatterId, institutionId: storehouseId, kind: 'general',
      summary: 'An active matter omitted from the institution index remains visible.', status: 'active', createdDay: 2,
    };
    const resolvedMatter: InstitutionalMatter = {
      id: 'matter-resolved-history' as MatterId, institutionId: storehouseId, kind: 'general',
      summary: 'A resolved matter remains available in institutional history.', status: 'resolved', createdDay: 1,
    };
    const institutionRecordId = 'record-institution-history' as RecordId;
    const institutionRecord: RecordEntry = {
      id: institutionRecordId, createdDay: 3, authorPersonId: INITIAL_PERSON_ID,
      title: 'Institutional ledger record',
      sources: [{ id: 'source-institution-ledger', kind: 'other', description: 'A signed tablet was copied.' }],
      assertions: [{ id: 'assertion-institution-ledger', text: 'Twenty-four measures were dispatched.', classification: 'observed', sourceIds: ['source-institution-ledger'] }],
      uncertaintyLimits: ['The second seal was not independently verified.'],
      amendments: [{ id: 'amendment-institution-ledger', dayNumber: 4, authorPersonId: INITIAL_PERSON_ID,
        reason: 'Later testimony qualified the count.', sourcesAdded: [], assertionsAdded: [],
        uncertaintyLimitsAdded: ['The carrier route remains unverified.'], note: 'The original count remains preserved.' }],
    };
    const responseEventId = 'event-institution-assessment' as EventId;
    const assessmentEvent: WorldEvent = {
      id: responseEventId, dayNumber: 5, summary: 'The appointed scribe assessed the comparison record.',
      personIds: [INITIAL_PERSON_ID], institutionIds: [storehouseId],
      institutionalResponse: {
        matterId: unindexedActiveMatter.id, stage: 'assessment', actorPersonId: INITIAL_PERSON_ID,
        appointmentId, recordId: institutionRecordId, decision: 'accepted_for_action',
        scope: 'Review the recorded comparison.',
      },
    };
    const state: GameState = {
      ...base,
      world: {
        ...base.world,
        people: {
          ...base.world.people,
          [INITIAL_PERSON_ID]: { ...base.world.people[INITIAL_PERSON_ID], scribal: {
            ...base.world.people[INITIAL_PERSON_ID].scribal!,
            institutionalStanding: { [storehouseId]: 73 },
          } },
        },
        matters: { ...base.world.matters, [unindexedActiveMatter.id]: unindexedActiveMatter, [resolvedMatter.id]: resolvedMatter },
        events: { ...base.world.events, [responseEventId]: assessmentEvent },
        appointments: {
          [appointmentId]: { id: appointmentId, personId: INITIAL_PERSON_ID,
            institutionId: storehouseId, title: 'Account Keeper',
            authorityScope: ['Verify incoming measures'], responsibilities: ['Maintain daily accounts'], startDay: 1 },
        },
      },
      records: { ...base.records, entries: { ...base.records.entries, [institutionRecordId]: institutionRecord } },
    };
    const markup = renderScreen(state, createElement(ProductionPeopleAndInstitutions));
    const institutionMarkup = renderScreen(state, createElement(ProductionPeopleAndInstitutions, { initialSection: 'institutions' }));

    expect(markup).toContain('Search people');
    expect(markup).toContain('Life status');
    expect(markup).toContain('Enlil-barni → Nin-aya');
    expect(markup).toContain('Ur-gir → Enlil-barni');
    expect(markup).not.toContain('Nin-aya → Enlil-barni');
    expect(markup).toContain('Professional reputation');
    expect(markup).toContain('Institutional standing');
    expect(markup).toContain('Verify incoming measures');
    expect(markup).toContain('History from this perspective');
    expect(markup).not.toContain('No initialized scribal capability sheet');
    expect((markup.match(/Personal history \(/g) ?? []).length).toBe(1);

    expect(institutionMarkup).toContain('Search institutions');
    expect(institutionMarkup).toContain('Current matters');
    expect(institutionMarkup).toContain('Historical matters');
    expect(institutionMarkup).toContain('Institutional records');
    expect(institutionMarkup).toContain('Appointments and delegated office scopes');
    expect(institutionMarkup).toContain('An active matter omitted from the institution index remains visible.');
    expect(institutionMarkup).toContain('A resolved matter remains available in institutional history.');
    expect(institutionMarkup).toContain('Institutional ledger record');
    expect(institutionMarkup).toContain('A signed tablet was copied.');
    expect(institutionMarkup).toContain('Twenty-four measures were dispatched.');
    expect(institutionMarkup).toContain('The second seal was not independently verified.');
    expect(institutionMarkup).toContain('The original count remains preserved.');
    expect(institutionMarkup).toContain('The carrier route remains unverified.');
    expect(institutionMarkup).toContain('Institutional response stages (1)');
    expect(institutionMarkup).toContain('assessment');
    expect(institutionMarkup).toContain('accepted for action');
    expect(institutionMarkup).toContain('Account Keeper');
    expect(institutionMarkup).toContain('The appointed scribe assessed the comparison record.');
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
            basis: 'received-copy', learnedDay: 2, legacy: true },
        },
      },
      records: { ...base.records, entries: { [recordId]: record } },
      journal: { notices: [{ id: 'notice-1', dayNumber: 2, category: 'world', message: 'The seal impression was questioned.', read: false }] },
    };
    const markup = renderScreen(state, createElement(ProductionRecordsAndJournal));

    expect(markup).toContain('1 archived record');
    expect(markup).not.toContain('1 archived records');
    expect(markup).toContain('Original record preserved');
    expect(markup).toContain('Twelve measures were entered.');
    expect(markup).toContain('Other source: Direct observation at the storehouse');
    expect(markup).not.toContain('source-observation');
    expect(markup).toContain('The original quantity assertion is preserved.');
    expect(markup).toContain('The seal was not independently verified.');
    expect(markup).toContain('The responsible carrier remains unidentified.');
    expect(markup).toContain('Enlil-barni');
    expect(markup).toContain('Received a copy');
    expect(markup).toContain('The seal impression was questioned.');
    expect(markup).toContain('Mark read');
  });
});
