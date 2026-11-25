import type { EventId, InstitutionId, LocationId, MatterId, PersonId, RecordId } from '../state/ids';
import { EANNA_INSTITUTION_ID, EANNA_TABLET_ROOM_LOCATION_ID, TEXTILE_HOUSEHOLD_INSTITUTION_ID, TEXTILE_HOUSEHOLD_LOCATION_ID } from './institutionalMatters';
import { NORTH_BAY_LOCATION_ID } from '../content/assignments/northBayRoofInspection';
import type { GameState, InstitutionalMatter, RecordEntry, TierBRecurringOccurrence, WorldEvent } from '../state/types';

const STOREHOUSE = 'institution-uruk-temple-storehouse' as InstitutionId;
const STEWARD = 'person-ur-nanna' as PersonId;
const RECEIVER = 'person-utu-mansum' as PersonId;
const CARRIER = 'person-enlil-kisu' as PersonId;
const SENIOR = 'person-shuruppak-ilu' as PersonId;
const KULI = 'person-kuli' as PersonId;
const AMA_GI = 'person-ama-gi-provisional' as PersonId;
const DUDU = 'person-dudu' as PersonId;
const ARU = 'person-aru' as PersonId;
const GEME_INANA = 'person-geme-inana-provisional' as PersonId;
const LU_NANSHE = 'person-lu-nanshe' as PersonId;
const activityId = 'activity-tierb-recurring-institutional-check';

const operationalNames: Record<string, string> = {
  [CARRIER]: 'Enlil-kisu, Carrier Foreman',
  [KULI]: 'Kuli, Carrier',
  [AMA_GI]: 'Ama-gi, Household Participant',
  [DUDU]: 'Dudu, Repairer',
  [ARU]: 'Aru, Maintenance Worker',
};
const receivingNames: Record<string, string> = {
  [RECEIVER]: 'Utu-mansum, Receiving Official',
  [STEWARD]: 'Ur-Nanna, Storehouse Steward',
  [GEME_INANA]: 'Geme-Inana, Household Participant',
};
const reviewerNames: Record<string, string> = {
  [SENIOR]: 'Shuruppak-ilu, Senior Scribe',
  [LU_NANSHE]: 'Lu-Nanshe, Responsible Authority',
};

function authoredOccurrence(day: number, counterpartyPersonId: PersonId, counterpartyName: string): TierBRecurringOccurrence {
  const n = day;
  const patterns: TierBRecurringOccurrence[] = [
    (() => { const sent = 5 + n % 7; const received = sent - (n % 3 === 0 ? 0 : 1); return {
      domain: 'grain_delivery', commodity: 'barley', unit: 'capacity measures', counterpartyPersonId, counterpartyName,
      quantitySummary: `Dispatch: ${sent} capacity measures of barley; intake: ${received} capacity measures.`,
      sourceSummary: received === sent ? `The dated dispatch and receiving records agree at ${sent} capacity measures; the tally reconciles.` : `The receiving record is short by ${sent - received} capacity measure; the cause is not established.`,
      outcomeShape: received === sent ? 'reconciled' : 'discrepancy',
    }; })(),
    (() => { const sent = 4 + n % 6; const received = sent - (n % 4 === 1 ? 0 : 1 + n % 2); return {
      domain: 'textile_receipt', commodity: 'textile bundles', unit: 'bundles', counterpartyPersonId, counterpartyName,
      quantitySummary: `Dispatch: ${sent} textile bundles; intake: ${received} bundles.`,
      sourceSummary: received === sent ? `The textile dispatch and intake tallies agree at ${sent} bundles.` : `The textile records differ by ${sent - received} bundle(s); the point of difference is not established.`,
      outcomeShape: received === sent ? 'reconciled' : 'discrepancy',
    }; })(),
    (() => { const sent = 6 + n % 5; const received = sent - (n % 3 === 2 ? 1 : 0); return {
      domain: 'vessel_count', commodity: 'sealed vessels', unit: 'vessels', counterpartyPersonId, counterpartyName,
      quantitySummary: `Dispatch: ${sent} sealed vessels; landing and receipt: ${received} vessels.`,
      sourceSummary: received === sent ? `The dated tallies agree at ${sent} vessels; contents are not established by the count.` : `The tallies differ by ${sent - received} vessel; the cause is not established.`,
      outcomeShape: received === sent ? 'reconciled' : 'discrepancy',
    }; })(),
    (() => { const checked = 4 + n % 5; const damp = n % 4; return {
      domain: 'container_check', commodity: 'storage jars', unit: 'jar exteriors', counterpartyPersonId, counterpartyName,
      quantitySummary: `${checked} storage jars were checked externally; ${checked - damp} are surface-dry and ${damp} bear damp-staining.`,
      sourceSummary: damp === 0 ? `The external check records ${checked} surface-dry jar exteriors; contents were not inspected.` : `The external check records ${damp} damp-stained jar exterior(s); contents were not inspected.`,
      outcomeShape: damp === 0 ? 'reconciled' : 'discrepancy',
    }; })(),
    (() => { const a = 1 + n % 4, b = 2 + n % 3, c = 2 + n % 5, sum = a + b + c, written = sum + (n % 4 === 0 ? 0 : n % 2 ? 1 : -1); return {
      domain: 'grain_account', commodity: 'groats entries', unit: 'recorded entries', counterpartyPersonId, counterpartyName,
      quantitySummary: `Entries: ${a}, ${b}, and ${c}; recalculated sum: ${sum}; written subtotal: ${written}.`,
      sourceSummary: written === sum ? `The groats entries sum to the written subtotal of ${sum}; the arithmetic reconciles.` : `The groats entries differ from the written subtotal by ${Math.abs(written-sum)}; no cause is established.`,
      outcomeShape: written === sum ? 'reconciled' : 'discrepancy',
    }; })(),
    (() => { const source = 2 + n % 5, carried = source - (n % 3 === 0 ? 0 : 1); return {
      domain: 'fish_entry', commodity: 'KU6 fish category', unit: 'recorded category entries (not a universal fish measure)', counterpartyPersonId, counterpartyName,
      quantitySummary: `${source} KU6 category entries appear in the source copy; the carried-forward account lists ${carried}.`,
      sourceSummary: source === carried ? `The KU6 category entries agree at ${source}; no universal fish measure is inferred.` : `The KU6 category records differ by ${source-carried} entry; no universal fish measure or cause is inferred.`,
      outcomeShape: source === carried ? 'reconciled' : 'discrepancy',
    }; })(),
    (() => { const source = 2 + n % 4, carried = source - (n % 3 === 1 ? 1 : 0); return {
      domain: 'dairy_entry', commodity: n % 2 ? 'DUGb dairy category' : 'cheese category', unit: 'recorded category entries', counterpartyPersonId, counterpartyName,
      quantitySummary: `The source copy records ${source} ${n % 2 ? 'DUGb dairy' : 'cheese'} category entries; the receiving copy lists ${carried}.`,
      sourceSummary: source === carried ? `The identified dairy category entries agree at ${source}; category identity is retained.` : `The identified dairy category copies differ by ${source-carried} entry; no conversion or cause is inferred.`,
      outcomeShape: source === carried ? 'reconciled' : 'discrepancy',
    }; })(),
    (() => { const a = 3 + n % 6, b = 2 + n % 5, sum = a + b, written = sum + (n % 3 === 0 ? 0 : n % 2 ? 1 : -1); return {
      domain: 'field_measurement', commodity: 'field notation', unit: 'GAN2 source-specific notation', counterpartyPersonId, counterpartyName,
      quantitySummary: `The cited field copy gives parcel subtotals ${a} and ${b} GAN2; recalculated total: ${sum}; written total: ${written}.`,
      sourceSummary: written === sum ? `The supplied parcel subtotals reconcile to the written GAN2 total of ${sum}; no boundary or yield conclusion follows.` : `The recalculated GAN2 total differs from the written total by ${Math.abs(written-sum)}; source notation and provenance qualification remain attached.`,
      outcomeShape: written === sum ? 'reconciled' : 'discrepancy',
    }; })(),
  ];
  return patterns[day % patterns.length];
}

function makeRecord(id: RecordId, day: number, title: string, assertion: string, author: PersonId, reportedBy: PersonId, eventId: EventId, institutionId: InstitutionId): RecordEntry {
  const sources = [
    { id: `source-${id}-reporter`, kind: 'person' as const, sourceId: reportedBy, description: 'The named institutional participant is the source of this reported tally.' },
    { id: `source-${id}-event`, kind: 'event' as const, sourceId: eventId, description: 'The dated occurrence to which this tally belongs.' },
  ];
  return {
    id, createdDay: day, authorPersonId: author, institutionId, title, sources,
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
