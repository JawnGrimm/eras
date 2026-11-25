import { describe, expect, it } from 'vitest';
import type { EventId, PersonId, RecordId } from './ids';
import {
  addRelationshipFamiliarityEpisode,
  deriveRelationshipFamiliarityStage,
  relationshipFamiliarityEpisodeId,
  type RelationshipFamiliarityEpisode,
} from './relationshipFamiliarity';

const observer = 'person-observer' as PersonId;
const subject = 'person-subject' as PersonId;
const eventId = 'event-substantive-contact' as EventId;

function episode(overrides: Partial<RelationshipFamiliarityEpisode> = {}): RelationshipFamiliarityEpisode {
  const base = {
    observerPersonId: observer,
    subjectPersonId: subject,
    acquisitionMode: 'observation' as const,
    interactionKind: 'observed-dispute',
    occasionId: 'matter-dispute-01',
    contextId: 'storehouse-dispute',
    stageContribution: 'acquainted' as const,
    dayNumber: 4,
    provenance: [{ kind: 'event' as const, id: eventId }],
  };
  const value = { ...base, ...overrides };
  return {
    ...value,
    id: relationshipFamiliarityEpisodeId(value.observerPersonId, value.subjectPersonId, value.occasionId, value.interactionKind),
  };
}

describe('relationship familiarity episodes', () => {
  it('keeps observer direction independent; it never mirrors an episode', () => {
    const first = episode();
    const inserted = addRelationshipFamiliarityEpisode({}, first);
    expect(inserted.ok && inserted.inserted).toBe(true);
    if (!inserted.ok) throw new Error('expected insertion');
    expect(deriveRelationshipFamiliarityStage(inserted.episodes, observer, subject)).toBe('acquainted');
    expect(deriveRelationshipFamiliarityStage(inserted.episodes, subject, observer)).toBeNull();
  });

  it('uses explicit qualitative contribution rather than entry counts', () => {
    const first = episode({ stageContribution: 'recognized' });
    const second = episode({ occasionId: 'matter-distinct-02', interactionKind: 'shared-accounting', stageContribution: 'familiar' });
    const a = addRelationshipFamiliarityEpisode({}, first);
    if (!a.ok) throw new Error('expected first insertion');
    const b = addRelationshipFamiliarityEpisode(a.episodes, second);
    if (!b.ok) throw new Error('expected second insertion');
    expect(deriveRelationshipFamiliarityStage(b.episodes, observer, subject)).toBe('familiar');
  });

  it('treats the same ordered pair, occasion, and interaction kind as idempotent', () => {
    const first = episode();
    const inserted = addRelationshipFamiliarityEpisode({}, first);
    if (!inserted.ok) throw new Error('expected insertion');
    const repeated = addRelationshipFamiliarityEpisode(inserted.episodes, first);
    expect(repeated).toEqual({ ok: true, episodes: inserted.episodes, inserted: false });
  });

  it('rejects a conflicting payload for the same deterministic identity', () => {
    const first = episode();
    const inserted = addRelationshipFamiliarityEpisode({}, first);
    if (!inserted.ok) throw new Error('expected insertion');
    const conflict = { ...first, contextId: 'different-context' };
    expect(addRelationshipFamiliarityEpisode(inserted.episodes, conflict)).toEqual({ ok: false, code: 'episode-conflict' });
  });

  it('requires a typed Event or Record source and rejects self-pairs', () => {
    expect(addRelationshipFamiliarityEpisode({}, episode({ provenance: [] }))).toEqual({ ok: false, code: 'episode-invalid' });
    expect(addRelationshipFamiliarityEpisode({}, episode({ subjectPersonId: observer }))).toEqual({ ok: false, code: 'episode-invalid' });
  });

  it('accepts a Record whose author and typed person source support the named pair', () => {
    const recordId = 'record-shared-observation' as RecordId;
    const first = episode({ provenance: [{ kind: 'record', id: recordId }] });
    const result = addRelationshipFamiliarityEpisode({}, first, {
      people: { [observer]: {}, [subject]: {} },
      records: {
        [recordId]: {
          createdDay: first.dayNumber, authorPersonId: observer,
          sources: [{ kind: 'person', sourceId: subject }], amendments: [],
        },
      },
      currentDay: first.dayNumber,
    });
    expect(result.ok).toBe(true);
  });

  it('rejects an Event that does not evidence both named people', () => {
    const first = episode();
    expect(addRelationshipFamiliarityEpisode({}, first, {
      events: { [eventId]: { dayNumber: first.dayNumber, personIds: [observer] } },
    })).toEqual({ ok: false, code: 'episode-invalid' });
  });

  it('rejects provenance dated after the familiarity episode', () => {
    const first = episode();
    expect(addRelationshipFamiliarityEpisode({}, first, {
      events: { [eventId]: { dayNumber: first.dayNumber + 1 } },
    })).toEqual({ ok: false, code: 'episode-invalid' });
  });

  it('does not treat routine repetition or a relationship edge as a stage', () => {
    expect(deriveRelationshipFamiliarityStage({}, observer, subject)).toBeNull();
  });
});
