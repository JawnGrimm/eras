import type { EventId, InstitutionId, PersonId } from '../state/ids';
import type { GameAction, GameState, PersonRelationship, RecordEntry, TransitionResult } from '../state/types';
type WorldAction = Extract<GameAction, { type: 'SET_RELATIONSHIP' | 'SET_INSTITUTIONAL_STANDING' | 'CREATE_INSTITUTION' | 'CREATE_APPOINTMENT' | 'END_APPOINTMENT' | 'CREATE_EVENT' | 'CREATE_RECORD' | 'AMEND_RECORD' | 'GRANT_KNOWLEDGE' }>;
function fail(state: GameState, code: string, message: string): TransitionResult { return { state, feedback: { kind: 'error', code, message } }; }
function succeed(state: GameState, code: string, message: string): TransitionResult { return { state, feedback: { kind: 'success', code, message } }; }
const validScore = (n: number) => Number.isFinite(n) && n >= 0 && n <= 100;
function validRelationship(r: PersonRelationship) {
  return Object.values(r.dimensions).every(validScore) && Array.isArray(r.history)
    && r.history.every((h) => !!h.id && !!h.summary && Number.isInteger(h.dayNumber) && h.dayNumber >= 1);
}
function sourceIds(record: RecordEntry) {
  return new Set([...record.sources, ...record.amendments.flatMap((a) => a.sourcesAdded)].map((s) => s.id));
}
export function transitionWorldAction(state: GameState, action: WorldAction): TransitionResult {
  const w = state.world;
  switch (action.type) {
    case 'SET_INSTITUTIONAL_STANDING': {
      const person = w.people[action.personId];
      if (!person?.scribal || !w.institutions[action.institutionId]) return fail(state, 'institutional-standing-reference-invalid', 'Institutional standing requires an existing scribal person and institution.');
      if (!validScore(action.value)) return fail(state, 'institutional-standing-invalid', 'Institutional standing must be between 0 and 100.');
      return succeed({ ...state, world: { ...w, people: { ...w.people, [person.id]: { ...person, scribal: { ...person.scribal, institutionalStanding: { ...person.scribal.institutionalStanding, [action.institutionId]: action.value } } } } } }, 'institutional-standing-updated', 'Institutional standing was updated independently of personal relationships and professional reputation.');
    }
    case 'SET_RELATIONSHIP': {
      if (!w.people[action.fromId] || !w.people[action.toId] || action.fromId === action.toId) return fail(state, 'relationship-person-invalid', 'A relationship requires two distinct existing people.');
      if (!validRelationship(action.relationship)) return fail(state, 'relationship-invalid', 'Relationship dimensions and history must be valid.');
      const current = w.relationships[action.fromId]?.[action.toId];
      const oldIds = new Set(current?.history.map((h) => h.id) ?? []);
      if (action.relationship.history.some((h) => oldIds.has(h.id) || (h.eventId && !w.events[h.eventId]))) return fail(state, 'relationship-history-invalid', 'Relationship history must be append-only and reference existing events.');
      return succeed({ ...state, world: { ...w, relationships: { ...w.relationships, [action.fromId]: {
        ...w.relationships[action.fromId], [action.toId]: { dimensions: { ...action.relationship.dimensions }, history: [...(current?.history ?? []), ...action.relationship.history] },
      } } } }, 'relationship-updated', 'The directional relationship was updated.');
    }
    case 'CREATE_INSTITUTION': {
      const x = action.institution;
      if (w.institutions[x.id]) return fail(state, 'institution-exists', 'An institution with this ID already exists.');
      if (!x.id || !x.name || !validScore(x.standing) || !Array.isArray(x.responsibilities) || !Array.isArray(x.authority) || !Array.isArray(x.activeMatterIds) || (x.locationId && !w.locations[x.locationId])) return fail(state, 'institution-invalid', 'The institution has invalid identity, standing, responsibilities, authority, or location.');
      return succeed({ ...state, world: { ...w, institutions: { ...w.institutions, [x.id]: x } } }, 'institution-created', x.name + ' was added to the world.');
    }
    case 'CREATE_APPOINTMENT': {
      const a = action.appointment;
      if (w.appointments[a.id]) return fail(state, 'appointment-exists', 'An appointment with this ID already exists.');
      if (!w.people[a.personId] || !w.institutions[a.institutionId] || !a.title || !a.authorityScope.length || !Number.isInteger(a.startDay) || a.startDay < 1 || (a.endDay !== undefined && (!Number.isInteger(a.endDay) || a.endDay < a.startDay))) return fail(state, 'appointment-invalid', 'An appointment needs an existing person and institution, an office, an authority scope, and valid dates.');
      return succeed({ ...state, world: { ...w, appointments: { ...w.appointments, [a.id]: a } } }, 'appointment-created', a.title + ' was recorded as an appointment.');
    }
    case 'END_APPOINTMENT': {
      const a = w.appointments[action.appointmentId];
      if (!a) return fail(state, 'appointment-missing', 'This appointment does not exist.');
      if (a.endDay !== undefined) return fail(state, 'appointment-ended', 'This appointment has already ended.');
      if (state.calendar.dayNumber < a.startDay) return fail(state, 'appointment-date-invalid', 'An appointment cannot end before it begins.');
      return succeed({ ...state, world: { ...w, appointments: { ...w.appointments, [a.id]: { ...a, endDay: state.calendar.dayNumber } } } }, 'appointment-ended', a.title + ' ended.');
    }
    case 'CREATE_EVENT': {
      const e = action.event;
      if (w.events[e.id]) return fail(state, 'event-exists', 'An event with this ID already exists.');
      if (!e.id || !e.summary || !Number.isInteger(e.dayNumber) || e.dayNumber < 1 || e.personIds.some((id) => !w.people[id]) || e.institutionIds.some((id) => !w.institutions[id]) || (e.locationId && !w.locations[e.locationId])) return fail(state, 'event-invalid', 'The event has invalid identity, date, or world references.');
      return succeed({ ...state, world: { ...w, events: { ...w.events, [e.id]: e } } }, 'event-created', 'A world event was recorded.');
    }
    case 'CREATE_RECORD': {
      const r = action.record;
      if (state.records.entries[r.id]) return fail(state, 'record-exists', 'A record with this ID already exists.');
      if (!r.id || !r.title || !w.people[r.authorPersonId] || (r.institutionId && !w.institutions[r.institutionId])
        || r.sources.some((s) => (s.kind === 'person' && !w.people[s.sourceId as PersonId]) || (s.kind === 'institution' && !w.institutions[s.sourceId as InstitutionId]) || (s.kind === 'event' && !w.events[s.sourceId as EventId]))
        || r.assertions.some((a) => a.sourceIds.some((id) => !r.sources.some((s) => s.id === id)))) return fail(state, 'record-invalid', 'The record needs a valid author, provenance, and assertion references.');
      return succeed({ ...state, records: { ...state.records, entries: { ...state.records.entries, [r.id]: r } } }, 'record-created', r.title + ' was entered into the archive.');
    }
    case 'AMEND_RECORD': {
      const r = state.records.entries[action.recordId], a = action.amendment;
      if (!r) return fail(state, 'record-missing', 'This record does not exist.');
      if (!a.id || r.amendments.some((x) => x.id === a.id) || !w.people[a.authorPersonId] || !a.reason || !Number.isInteger(a.dayNumber) || a.dayNumber < r.createdDay || a.dayNumber > state.calendar.dayNumber
        || a.assertionsAdded.some((x) => x.sourceIds.some((id) => !sourceIds(r).has(id) && !a.sourcesAdded.some((s) => s.id === id)))) return fail(state, 'amendment-invalid', 'The amendment must be new, dated, authored, and supported by existing or newly added sources.');
      return succeed({ ...state, records: { ...state.records, entries: { ...state.records.entries, [r.id]: { ...r, amendments: [...r.amendments, a] } } } }, 'record-amended', 'An amendment was appended; the original record remains intact.');
    }
    case 'GRANT_KNOWLEDGE': {
      const k = action.knowledge;
      if (w.knowledge[k.id]) return fail(state, 'knowledge-exists', 'This knowledge entry already exists.');
      const holder = k.holder.kind === 'person' ? !!w.people[k.holder.id] : !!w.institutions[k.holder.id];
      const subject = k.subject.kind === 'event' ? !!w.events[k.subject.id] : !!state.records.entries[k.subject.id];
      if (!k.id || !holder || !subject || !Number.isInteger(k.learnedDay) || k.learnedDay < 1 || k.learnedDay > state.calendar.dayNumber || (k.sourcePersonId && !w.people[k.sourcePersonId])) return fail(state, 'knowledge-invalid', 'Knowledge must identify an existing holder and subject, a plausible basis, and a valid date.');
      return succeed({ ...state, world: { ...w, knowledge: { ...w.knowledge, [k.id]: k } } }, 'knowledge-granted', 'The information was added only to the specified holder’s knowledge.');
    }
  }
}
