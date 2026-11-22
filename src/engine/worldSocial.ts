import type { EventId, InstitutionId, PersonId } from '../state/ids';
import type { GameAction, GameState, PersonRelationship, RecordEntry, TransitionResult } from '../state/types';
type WorldAction = Extract<GameAction, { type: 'SET_RELATIONSHIP' | 'SET_INSTITUTIONAL_STANDING' | 'CREATE_INSTITUTION' | 'CREATE_APPOINTMENT' | 'END_APPOINTMENT' | 'CREATE_EVENT' | 'CREATE_RECORD' | 'AMEND_RECORD' | 'GRANT_KNOWLEDGE' }>;
function fail(state: GameState, code: string, message: string): TransitionResult { return { state, feedback: { kind: 'error', code, message } }; }
function succeed(state: GameState, code: string, message: string): TransitionResult { return { state, feedback: { kind: 'success', code, message } }; }
const validScore = (n: number) => Number.isFinite(n) && n >= 0 && n <= 100;
function validRelationship(r: PersonRelationship) {
  return !!r && typeof r === 'object' && !!r.dimensions && typeof r.dimensions === 'object'
    && Object.values(r.dimensions).every(validScore) && Array.isArray(r.history)
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
      if (!x.id || !x.name || !validScore(x.standing) || !Array.isArray(x.responsibilities) || !Array.isArray(x.authority) || !Array.isArray(x.activeMatters) || !x.activeMatters.every((matterId) => typeof matterId === 'string' && !!w.matters[matterId]) || (x.locationId && !w.locations[x.locationId])) return fail(state, 'institution-invalid', 'The institution has invalid identity, standing, responsibilities, authority, or location.');
      return succeed({ ...state, world: { ...w, institutions: { ...w.institutions, [x.id]: x } } }, 'institution-created', x.name + ' was added to the world.');
    }
    case 'CREATE_APPOINTMENT': {
      const a = action.appointment;
      if (w.appointments[a.id]) return fail(state, 'appointment-exists', 'An appointment with this ID already exists.');
      if (!a.id || !w.people[a.personId] || !w.institutions[a.institutionId] || !a.title || !Array.isArray(a.authorityScope) || !a.authorityScope.length || !Array.isArray(a.responsibilities) || !Number.isInteger(a.startDay) || a.startDay < 1 || a.startDay > state.calendar.dayNumber || (a.endDay !== undefined && (!Number.isInteger(a.endDay) || a.endDay < a.startDay || a.endDay > state.calendar.dayNumber))) return fail(state, 'appointment-invalid', 'An appointment needs an existing person and institution, an office, an authority scope, and valid dates.');
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
      if (!e || typeof e !== 'object' || !Array.isArray(e.personIds) || !Array.isArray(e.institutionIds)) return fail(state, 'event-invalid', 'An event needs valid participant and institution lists.');
      if (w.events[e.id]) return fail(state, 'event-exists', 'An event with this ID already exists.');
      if (!e.id || !e.summary || !Number.isInteger(e.dayNumber) || e.dayNumber < 1 || e.dayNumber > state.calendar.dayNumber || e.personIds.some((id) => !w.people[id]) || e.institutionIds.some((id) => !w.institutions[id]) || (e.locationId && !w.locations[e.locationId])) return fail(state, 'event-invalid', 'The event has invalid identity, date, or world references.');
      return succeed({ ...state, world: { ...w, events: { ...w.events, [e.id]: e } } }, 'event-created', 'A world event was recorded.');
    }
    case 'CREATE_RECORD': {
      const r = action.record;
      if (!r || typeof r !== 'object') return fail(state, 'record-invalid', 'A record payload is required.');
      if (state.records.entries[r.id]) return fail(state, 'record-exists', 'A record with this ID already exists.');
      const sourceList = Array.isArray(r.sources) ? r.sources : [];
      const sourceIds = new Set(sourceList.map((s) => s.id));
      const validSources = Array.isArray(r.sources) && sourceList.every((s) => !!s.id && !!s.description
        && (s.kind === 'person' ? !!w.people[s.sourceId as PersonId]
          : s.kind === 'institution' ? !!w.institutions[s.sourceId as InstitutionId]
          : s.kind === 'event' ? !!w.events[s.sourceId as EventId]
          : s.kind === 'material' || s.kind === 'other'));
      if (!r.id || !r.title || !w.people[r.authorPersonId] || (r.institutionId && !w.institutions[r.institutionId])
        || !Number.isInteger(r.createdDay) || r.createdDay < 1 || r.createdDay > state.calendar.dayNumber
        || !Array.isArray(r.sources) || !Array.isArray(r.assertions) || !Array.isArray(r.uncertaintyLimits)
        || !Array.isArray(r.amendments) || r.amendments.length !== 0
        || !validSources || sourceIds.size !== r.sources.length
        || new Set(r.assertions.map((a) => a.id)).size !== r.assertions.length
        || r.assertions.some((a) => !a.id || !a.text || !Array.isArray(a.sourceIds) || a.sourceIds.some((id: string) => !sourceIds.has(id))))
        return fail(state, 'record-invalid', 'A new record needs a valid date, author, unique provenance, supported assertions, and no pre-existing amendments.');
      return succeed({ ...state, records: { ...state.records, entries: { ...state.records.entries, [r.id]: r } } }, 'record-created', r.title + ' was entered into the archive.');
    }
    case 'AMEND_RECORD': {
      const r = state.records.entries[action.recordId], a = action.amendment;
      if (!a || typeof a !== 'object') return fail(state, 'amendment-invalid', 'An amendment payload is required.');
      if (!r) return fail(state, 'record-missing', 'This record does not exist.');
      const existingSources = sourceIds(r);
      const addedList = Array.isArray(a.sourcesAdded) ? a.sourcesAdded : [];
      const addedIds = new Set(addedList.map((s) => s.id));
      const validAddedSources = Array.isArray(a.sourcesAdded) && addedList.every((s) => !!s.id && !!s.description && !existingSources.has(s.id)
        && (s.kind === 'person' ? !!w.people[s.sourceId as PersonId]
          : s.kind === 'institution' ? !!w.institutions[s.sourceId as InstitutionId]
          : s.kind === 'event' ? !!w.events[s.sourceId as EventId]
          : s.kind === 'material' || s.kind === 'other'));
      const allSourceIds = new Set([...existingSources, ...addedIds]);
      const assertionIds = new Set([...r.assertions.map((x) => x.id), ...r.amendments.flatMap((x) => x.assertionsAdded.map((y) => y.id))]);
      if (!a.id || r.amendments.some((x) => x.id === a.id) || !w.people[a.authorPersonId] || !a.reason
        || !Number.isInteger(a.dayNumber) || a.dayNumber < r.createdDay || a.dayNumber > state.calendar.dayNumber
        || !Array.isArray(a.sourcesAdded) || !Array.isArray(a.assertionsAdded) || !Array.isArray(a.uncertaintyLimitsAdded)
        || typeof a.note !== 'string' || !validAddedSources || addedIds.size !== a.sourcesAdded.length
        || new Set(a.assertionsAdded.map((x) => x.id)).size !== a.assertionsAdded.length
        || a.assertionsAdded.some((x) => !x.id || assertionIds.has(x.id) || !x.text || !Array.isArray(x.sourceIds)
          || x.sourceIds.some((id: string) => !allSourceIds.has(id)))) return fail(state, 'amendment-invalid', 'The amendment must be new, dated, authored, and supported by unique valid existing or newly added sources.');
      return succeed({ ...state, records: { ...state.records, entries: { ...state.records.entries, [r.id]: { ...r, amendments: [...r.amendments, a] } } } }, 'record-amended', 'An amendment was appended; the original record remains intact.');
    }
    case 'GRANT_KNOWLEDGE': {
      const k = action.knowledge;
      if (!k || typeof k !== 'object' || !k.holder || !k.subject) return fail(state, 'knowledge-invalid', 'Knowledge needs an explicit holder and subject.');
      if (w.knowledge[k.id]) return fail(state, 'knowledge-exists', 'This knowledge entry already exists.');
      const holder = k.holder.kind === 'person' ? !!w.people[k.holder.id] : k.holder.kind === 'institution' ? !!w.institutions[k.holder.id] : false;
      const subject = k.subject.kind === 'event' ? !!w.events[k.subject.id] : k.subject.kind === 'record' ? !!state.records.entries[k.subject.id] : false;
      if (!k.id || !holder || !subject || !['direct-involvement','testimony','received-copy','consulted-record','public-disclosure','other'].includes(k.basis) || !Number.isInteger(k.learnedDay) || k.learnedDay < 1 || k.learnedDay > state.calendar.dayNumber || (k.sourcePersonId && !w.people[k.sourcePersonId])) return fail(state, 'knowledge-invalid', 'Knowledge must identify an existing holder and subject, a plausible basis, and a valid date.');
      return succeed({ ...state, world: { ...w, knowledge: { ...w.knowledge, [k.id]: k } } }, 'knowledge-granted', 'The information was added only to the specified holder’s knowledge.');
    }
  }
}
