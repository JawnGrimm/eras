import type { EventId, InstitutionId, MatterId, PersonId, RecordId } from '../state/ids';
import type { GameState, InstitutionalMatter, RecordEntry, TierBRecurringOccurrence, WorldEvent } from '../state/types';

const STOREHOUSE = 'institution-uruk-temple-storehouse' as InstitutionId;
const LOCATION = 'location-uruk-south-receiving-court';
const STEWARD = 'person-ur-nanna' as PersonId;
const RECEIVER = 'person-utu-mansum' as PersonId;
const CARRIER = 'person-enlil-kisu' as PersonId;
const SENIOR = 'person-shuruppak-ilu' as PersonId;
const activityId = 'activity-tierb-recurring-institutional-check';

const counterpartyByDay = [CARRIER, RECEIVER, STEWARD, SENIOR] as const;
const names: Record<string, string> = {
  [CARRIER]: 'Enlil-kisu, Carrier Foreman',
  [RECEIVER]: 'Utu-mansum, Receiving Official',
  [STEWARD]: 'Ur-Nanna, Storehouse Steward',
  [SENIOR]: 'Shuruppak-ilu, Senior Scribe',
};

function authoredOccurrence(day: number): TierBRecurringOccurrence {
  const counterpartyPersonId = counterpartyByDay[day % counterpartyByDay.length] as PersonId;
  const counterpartyName = names[counterpartyPersonId];
  const index = day % 6;
  const data: TierBRecurringOccurrence[] = [
    { domain: 'grain_delivery', commodity: 'barley', unit: 'capacity measures', counterpartyPersonId, counterpartyName,
      quantitySummary: 'Dispatch: 8 capacity measures of barley; intake: 8 capacity measures.',
      sourceSummary: 'The dated dispatch and receiving records agree at eight capacity measures; the tally reconciles.' , outcomeShape: 'reconciled' },
    { domain: 'textile_receipt', commodity: 'textile bundles', unit: 'bundles', counterpartyPersonId, counterpartyName,
      quantitySummary: 'Dispatch: 6 textile bundles; intake: 5 bundles. One bundle is not accounted for at receipt.',
      sourceSummary: 'The dispatch and receiving records differ by one textile bundle; the point of difference is not established.', outcomeShape: 'discrepancy' },
    { domain: 'vessel_count', commodity: 'sealed vessels', unit: 'vessels', counterpartyPersonId, counterpartyName,
      quantitySummary: 'Dispatch: 9 sealed vessels; landing and receipt: 9 vessels.',
      sourceSummary: 'The dated tallies agree at nine vessels. Agreement of counts does not establish the condition of the contents.', outcomeShape: 'reconciled' },
    { domain: 'container_check', commodity: 'storage jars', unit: 'jar exteriors', counterpartyPersonId, counterpartyName,
      quantitySummary: 'Five storage jars were checked externally; four are surface-dry and one bears damp-staining.',
      sourceSummary: 'The container check records one damp-stained exterior. It does not establish the condition of the contents.', outcomeShape: 'discrepancy' },
    { domain: 'grain_account', commodity: 'groats entries', unit: 'recorded entries', counterpartyPersonId, counterpartyName,
      quantitySummary: 'Entries: 2, 3, and 4; recalculated sum: 9; written subtotal: 9.',
      sourceSummary: 'The three recorded groats entries sum to the written subtotal of nine; the arithmetic reconciles.', outcomeShape: 'reconciled' },
    { domain: 'fish_entry', commodity: 'KU6 fish category', unit: 'recorded category entries (not a universal fish measure)', counterpartyPersonId, counterpartyName,
      quantitySummary: 'Three KU6 category entries appear in the source copy; the carried-forward account lists two.',
      sourceSummary: 'The source copy and carried-forward account differ by one KU6 category entry. No universal fish unit is inferred.', outcomeShape: 'discrepancy' },
  ];
  return data[index];
}

function makeRecord(id: RecordId, day: number, title: string, assertion: string, author: PersonId, reportedBy: PersonId, eventId: EventId): RecordEntry {
  const sources = [
    { id: `source-${id}-reporter`, kind: 'person' as const, sourceId: reportedBy, description: 'The named institutional participant is the source of this reported tally.' },
    { id: `source-${id}-event`, kind: 'event' as const, sourceId: eventId, description: 'The dated occurrence to which this tally belongs.' },
  ];
  return {
    id, createdDay: day, authorPersonId: author, institutionId: STOREHOUSE, title, sources,
    assertions: [{ id: `assertion-${id}`, text: assertion, classification: 'reported', sourceIds: sources.map((source) => source.id) }],
    uncertaintyLimits: ['This source records its own count or observation only; it does not locate a discrepancy or establish individual responsibility.'],
    amendments: [],
  };
}

/** Deterministic, source-backed Tier B occurrence production and NPC closure. */
export function prepareTierBRecurringOccurrences(input: GameState): GameState {
  const day = input.calendar.dayNumber;
  let state = input;
  const matters = { ...state.world.matters };
  const events = { ...state.world.events };
  const institutions = { ...state.world.institutions };
  const entries = { ...state.records.entries };
  let changed = false;

  // Routine matters are closed by institutional staff after the visible offer
  // window when they remain unaccepted; accepted player commitments stay open.
  const storehouse = institutions[STOREHOUSE];
  if (storehouse) {
    const activeMatters = [...storehouse.activeMatters];
    for (const matter of Object.values(matters)) {
      if (matter.kind !== 'tier_b_recurring_occurrence' || matter.status !== 'active' || day < matter.createdDay + 3) continue;
      const offer = Object.values(state.opportunities.assignments).find((item) => item.originMatterId === matter.id && item.activityId === activityId);
      if (offer?.status === 'accepted') continue;
      if (offer?.status === 'offered' && day <= offer.expiresDay) continue;
      matters[matter.id] = { ...matter, status: 'resolved' };
      const index = activeMatters.indexOf(matter.id);
      if (index >= 0) activeMatters.splice(index, 1);
      changed = true;
    }
    if (activeMatters.length !== storehouse.activeMatters.length) institutions[STOREHOUSE] = { ...storehouse, activeMatters };
  }

  // A fresh occurrence is authored from the date/cadence and a bounded
  // compatible domain. IDs are date-scoped, so repeated evaluation is idempotent.
  if (day >= 14) {
    const eventId = `event-tierb-recurring-day-${day}` as EventId;
    const matterId = `matter-tierb-recurring-day-${day}` as MatterId;
    if (!events[eventId] && !matters[matterId] && institutions[STOREHOUSE]) {
      const occurrence = authoredOccurrence(day);
      const dispatchId = `record-tierb-recurring-day-${day}-dispatch` as RecordId;
      const receivingId = `record-tierb-recurring-day-${day}-receiving` as RecordId;
      const summary = `Tier B ${occurrence.domain.replaceAll('_', ' ')} with ${occurrence.counterpartyName}: ${occurrence.quantitySummary} ${occurrence.sourceSummary}`;
      const event: WorldEvent = {
        id: eventId, dayNumber: day, summary,
        personIds: [STEWARD, RECEIVER, CARRIER, SENIOR, occurrence.counterpartyPersonId],
        institutionIds: [STOREHOUSE], locationId: LOCATION as import('../state/ids').LocationId,
      };
      const dispatch = makeRecord(dispatchId, day, `Day ${day} ${occurrence.commodity} dispatch/source copy`,
        occurrence.quantitySummary, SENIOR, occurrence.counterpartyPersonId, eventId);
      const receipt = makeRecord(receivingId, day, `Day ${day} ${occurrence.commodity} receiving/check copy`,
        occurrence.sourceSummary, SENIOR, RECEIVER, eventId);
      const matter: InstitutionalMatter = {
        id: matterId, institutionId: STOREHOUSE, kind: 'tier_b_recurring_occurrence',
        summary, status: 'active', createdDay: day, sourceEventId: eventId, sourceRecordId: dispatchId,
        locationId: LOCATION as import('../state/ids').LocationId,
        involvedPersonIds: [STEWARD, RECEIVER, CARRIER, SENIOR, occurrence.counterpartyPersonId],
        tierBRecurring: occurrence,
        provenance: [
          { id: `tierb-${day}-event`, kind: 'event', sourceId: eventId, description: 'Distinct dated institutional occurrence.' },
          { id: `tierb-${day}-dispatch`, kind: 'other', sourceId: dispatchId, description: 'Dated source/dispatch record.' },
          { id: `tierb-${day}-receipt`, kind: 'other', sourceId: receivingId, description: 'Dated receiving/check record.' },
          { id: `tierb-${day}-instruction`, kind: 'instruction', description: 'Routine storehouse cadence calls for a bounded check; this does not imply a fixed daily player quota.' },
        ],
      };
      events[eventId] = event;
      entries[dispatchId] = dispatch;
      entries[receivingId] = receipt;
      matters[matterId] = matter;
      institutions[STOREHOUSE] = {
        ...institutions[STOREHOUSE],
        activeMatters: [...new Set([...institutions[STOREHOUSE].activeMatters, matterId])],
      };
      changed = true;
    }
  }

  if (!changed) return state;
  return {
    ...state,
    world: { ...state.world, events, matters, institutions },
    records: { ...state.records, entries },
  };
}
