import type { EvidenceId, EventId, InstitutionId, MatterId, PersonId, RecordId, WorkId } from '../state/ids';
import type { InstitutionalMatter, RecordEntry, RecordSource, WorldEvent } from '../state/types';
import { defineWork } from './workDefinition';
import type { WorkAssessment, WorkFinalization, WorkSubmissionContext } from './workDefinition';

export const EANNA_WORK_ID = 'work-era1-eanna-provisioning-undertaking' as WorkId;
export const EANNA_INSTITUTION_ID = 'institution-uruk-eanna-precinct' as InstitutionId;
export const EANNA_TABLET_ROOM_ID = 'location-uruk-eanna-tablet-room';
export const EANNA_ORIGIN_MATTER_ID = 'matter-era1-eanna-provisioning-undertaking' as MatterId;
export const EANNA_FOLLOW_UP_MATTER_ID = 'matter-era1-eanna-allocation-follow-up' as MatterId;
export const EANNA_REQUEST_EVENT_ID = 'event-era1-eanna-provisioning-request' as EventId;
export const EANNA_GATHERING_EVENT_ID = 'event-era1-eanna-gathering-outcome' as EventId;
export const EANNA_DISPOSITION_EVENT_ID = 'event-era1-eanna-allocation-disposition' as EventId;
export const EANNA_SUMMARY_RECORD_ID = 'record-era1-eanna-consolidated-summary-tablet' as RecordId;

export const EANNA_PEOPLE = {
  luNanshe: 'person-lu-nanshe' as PersonId,
  shuruppakIlu: 'person-shuruppak-ilu' as PersonId,
  urNanna: 'person-ur-nanna' as PersonId,
  ninKasi: 'person-nin-kasi' as PersonId,
  enlilKisu: 'person-enlil-kisu' as PersonId,
  gemeInana: 'person-geme-inana' as PersonId,
} as const;

export type EannaSourceId =
  | 'ninKasiRequest' | 'gemeInanaRequest' | 'breadPreparationRequest'
  | 'storehouseBarleyCount' | 'offeringVesselCount' | 'enlilKisuExpectation';
export type EannaSourceClassification = 'written_tally' | 'physical_count' | 'spoken_expectation';
export type EannaObverseField =
  | 'ninKasiBarley' | 'gemeInanaBarley' | 'breadPreparationBarley'
  | 'availableBarley' | 'offeringVesselsRequested' | 'offeringVesselsPrepared';
export type EannaAllocationField = 'ninKasiBarley' | 'breadPreparationBarley' | 'gemeInanaBarley';

export interface EannaProvisioningScenario extends Record<string, unknown> {
  sourceSorting: Partial<Record<EannaSourceId, EannaSourceClassification>>;
  obverse: Partial<Record<EannaObverseField, number>>;
  allocation: Partial<Record<EannaAllocationField, number>>;
}

export const EANNA_SOURCE_CLASSIFICATIONS: Record<EannaSourceId, EannaSourceClassification> = {
  ninKasiRequest: 'written_tally',
  gemeInanaRequest: 'written_tally',
  breadPreparationRequest: 'written_tally',
  storehouseBarleyCount: 'physical_count',
  offeringVesselCount: 'physical_count',
  enlilKisuExpectation: 'spoken_expectation',
};

export const EANNA_SOURCE_PACKET = {
  availableBarley: 18,
  ninKasiBarley: 12,
  gemeInanaBarley: 9,
  breadPreparationBarley: 8,
  offeringVesselsRequested: 6,
  offeringVesselsPrepared: 4,
  laterBarleyExpectation: 3,
} as const;

const evidence = [
  { id: 'eanna-storehouse-count' as EvidenceId, title: 'Ur-Nanna’s storehouse count', source: 'Ur-Nanna, Storehouse Steward', objectiveText: 'The storehouse tally records 18 barley capacity measures counted available for the gathering.' },
  { id: 'eanna-ninkasi-request' as EvidenceId, title: 'Nin-kasi’s barley request', source: 'Nin-kasi, brewing-house representative', objectiveText: 'The written request records 12 barley capacity measures for brewing-house work.' },
  { id: 'eanna-geme-request' as EvidenceId, title: 'Geme-Inana’s household request', source: 'Geme-Inana, textile-household organizer', objectiveText: 'The written request records 9 barley capacity measures for her household work group.' },
  { id: 'eanna-bread-request' as EvidenceId, title: 'Gathering bread-preparation tally', source: 'Tally supplied under Lu-Nanshe’s instruction', objectiveText: 'The written tally records 8 barley capacity measures requested for gathering bread preparation.' },
  { id: 'eanna-offering-vessels' as EvidenceId, title: 'Offering vessel count', source: 'Inana-associated offering preparation at Eanna', objectiveText: 'The separate count records 6 beer vessels requested and 4 prepared.' },
  { id: 'eanna-enlilkisu-report' as EvidenceId, title: 'Enlil-kisu’s spoken expectation', source: 'Enlil-kisu, carrier foreman', objectiveText: 'Enlil-kisu says 3 further barley capacity measures may arrive after Day 39. No arrival count or receipt is available.' },
  { id: 'eanna-obverse' as EvidenceId, title: 'Consolidated obverse', source: 'The apprentice’s source-linked tablet entries', objectiveText: 'The obverse keeps the three barley requests, storehouse count, and separate beer-vessel count in their own categories.' },
  { id: 'eanna-reverse' as EvidenceId, title: 'Consolidated reverse', source: 'The apprentice’s compatible totals and provisional allocation', objectiveText: 'The reverse records 29 barley capacity measures requested against 18 available, the proposed barley allocation, and the separate vessel shortfall.' },
  { id: 'eanna-final-check' as EvidenceId, title: 'Tablet final check', source: 'The apprentice’s completed tablet', objectiveText: 'The obverse entries, reverse totals, and proposed allocation are ready for Lu-Nanshe’s review.' },
] as const;

const obverseFields: EannaObverseField[] = [
  'ninKasiBarley', 'gemeInanaBarley', 'breadPreparationBarley',
  'availableBarley', 'offeringVesselsRequested', 'offeringVesselsPrepared',
];
const allocationFields: EannaAllocationField[] = ['ninKasiBarley', 'breadPreparationBarley', 'gemeInanaBarley'];
const sourceIds = Object.keys(EANNA_SOURCE_CLASSIFICATIONS) as EannaSourceId[];
const numericFields = [...obverseFields, ...allocationFields];

function validPartialObject<T extends string>(value: unknown, keys: readonly T[], validValue: (value: unknown) => boolean): value is Partial<Record<T, unknown>> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const object = value as Record<string, unknown>;
  return Object.keys(object).every((key) => keys.includes(key as T) && validValue(object[key]));
}

export function createEannaProvisioningScenario(): EannaProvisioningScenario {
  return { sourceSorting: {}, obverse: {}, allocation: {} };
}

export function validateEannaProvisioningScenario(value: unknown): value is EannaProvisioningScenario {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const scenario = value as Record<string, unknown>;
  if (Object.keys(scenario).some((key) => !['sourceSorting', 'obverse', 'allocation'].includes(key))) return false;
  const validNumber = (number: unknown) => typeof number === 'number' && Number.isSafeInteger(number) && number >= 0;
  const validClassification = (item: unknown) => item === 'written_tally' || item === 'physical_count' || item === 'spoken_expectation';
  return validPartialObject(scenario.sourceSorting, sourceIds, validClassification)
    && validPartialObject(scenario.obverse, obverseFields, validNumber)
    && validPartialObject(scenario.allocation, allocationFields, validNumber);
}

function sourceSortingComplete(progress: EannaProvisioningScenario): boolean {
  return sourceIds.every((id) => progress.sourceSorting[id] === EANNA_SOURCE_CLASSIFICATIONS[id]);
}
function obverseComplete(progress: EannaProvisioningScenario): boolean {
  const expected: Record<EannaObverseField, number> = {
    ninKasiBarley: 12, gemeInanaBarley: 9, breadPreparationBarley: 8,
    availableBarley: 18, offeringVesselsRequested: 6, offeringVesselsPrepared: 4,
  };
  return obverseFields.every((field) => progress.obverse[field] === expected[field]);
}
function allocationComplete(progress: EannaProvisioningScenario): boolean {
  const allocation = progress.allocation;
  const shares = [allocation.ninKasiBarley, allocation.breadPreparationBarley, allocation.gemeInanaBarley];
  if (shares.some((value) => value === undefined || !Number.isSafeInteger(value) || value < 0)) return false;
  return shares.reduce((sum, value) => sum + (value ?? 0), 0) === EANNA_SOURCE_PACKET.availableBarley
    && (allocation.ninKasiBarley ?? 0) <= EANNA_SOURCE_PACKET.ninKasiBarley
    && (allocation.breadPreparationBarley ?? 0) <= EANNA_SOURCE_PACKET.breadPreparationBarley
    && (allocation.gemeInanaBarley ?? 0) <= EANNA_SOURCE_PACKET.gemeInanaBarley;
}

function assess(context: WorkSubmissionContext<EannaProvisioningScenario>): {
  sourceSorting: boolean; obverse: boolean; allocation: boolean; allStages: boolean;
} {
  const examined = new Set(context.examinedEvidence);
  return {
    sourceSorting: sourceSortingComplete(context.progress),
    obverse: obverseComplete(context.progress),
    allocation: allocationComplete(context.progress),
    allStages: ['eanna-storehouse-count','eanna-ninkasi-request','eanna-geme-request','eanna-bread-request',
      'eanna-offering-vessels','eanna-enlilkisu-report','eanna-obverse','eanna-reverse','eanna-final-check']
      .every((id) => examined.has(id as EvidenceId)),
  };
}

function finalize(context: WorkSubmissionContext<EannaProvisioningScenario>, disposition: string): WorkFinalization {
  if (disposition !== 'authorized') throw new Error('Lu-Nanshe must authorize the final tablet disposition.');
  const { progress, personId, dayNumber } = context;
  const nin = progress.allocation.ninKasiBarley ?? 0;
  const bread = progress.allocation.breadPreparationBarley ?? 0;
  const geme = progress.allocation.gemeInanaBarley ?? 0;
  const event: WorldEvent = {
    id: EANNA_DISPOSITION_EVENT_ID,
    dayNumber,
    summary: dayNumber <= 38
      ? `Lu-Nanshe ratifies and seals the Eanna gathering allocation: ${nin} barley capacity measures for Nin-kasi’s brewing-house work, ${bread} for gathering bread preparation, and ${geme} for Geme-Inana’s household work group. Four prepared beer vessels are assigned to the offering preparation; two requested vessels remain unmet.`
      : `After the gathering proceeded at reduced scope, Lu-Nanshe accepts the retrospective Consolidated Summary Tablet and records the allocation: ${nin} barley capacity measures for Nin-kasi’s brewing-house work, ${bread} for gathering bread preparation, and ${geme} for Geme-Inana’s household work group. Four prepared beer vessels are assigned to the offering preparation; two requested vessels remain unmet.`,
    personIds: [personId, EANNA_PEOPLE.luNanshe, EANNA_PEOPLE.shuruppakIlu, EANNA_PEOPLE.urNanna,
      EANNA_PEOPLE.ninKasi, EANNA_PEOPLE.enlilKisu, EANNA_PEOPLE.gemeInana],
    institutionIds: [EANNA_INSTITUTION_ID],
    locationId: EANNA_TABLET_ROOM_ID as import('../state/ids').LocationId,
  };

  const sources: RecordSource[] = [
    { id: 'source-eanna-storehouse-count', kind: 'person', sourceId: EANNA_PEOPLE.urNanna, description: 'Ur-Nanna’s storehouse count of barley capacity measures available.' },
    { id: 'source-eanna-ninkasi-request', kind: 'person', sourceId: EANNA_PEOPLE.ninKasi, description: 'Nin-kasi’s written barley request.' },
    { id: 'source-eanna-geme-request', kind: 'person', sourceId: EANNA_PEOPLE.gemeInana, description: 'Geme-Inana’s written household barley request.' },
    { id: 'source-eanna-bread-request', kind: 'person', sourceId: EANNA_PEOPLE.luNanshe, description: 'Gathering bread-preparation tally supplied under Lu-Nanshe’s instruction.' },
    { id: 'source-eanna-offering-vessels', kind: 'institution', sourceId: EANNA_INSTITUTION_ID, description: 'Separate Inana-associated offering vessel count.' },
    { id: 'source-eanna-enlilkisu-expectation', kind: 'person', sourceId: EANNA_PEOPLE.enlilKisu, description: 'Enlil-kisu’s spoken expectation of a later barley arrival; not a receipt.' },
    { id: 'source-eanna-disposition', kind: 'event', sourceId: EANNA_DISPOSITION_EVENT_ID, description: 'Lu-Nanshe’s official allocation disposition and seal.' },
  ];
  const record: RecordEntry = {
    id: EANNA_SUMMARY_RECORD_ID,
    createdDay: dayNumber,
    authorPersonId: personId,
    institutionId: EANNA_INSTITUTION_ID,
    title: 'Consolidated Summary Tablet: Eanna Gathering',
    sources,
    assertions: [
      { id: 'eanna-obverse-ninkasi', text: `Barley · Nin-kasi · ${progress.obverse.ninKasiBarley} capacity measures`, classification: 'observed', sourceIds: ['source-eanna-ninkasi-request'] },
      { id: 'eanna-obverse-geme', text: `Barley · Geme-Inana · ${progress.obverse.gemeInanaBarley} capacity measures`, classification: 'observed', sourceIds: ['source-eanna-geme-request'] },
      { id: 'eanna-obverse-bread', text: `Barley · Bread preparation · ${progress.obverse.breadPreparationBarley} capacity measures`, classification: 'observed', sourceIds: ['source-eanna-bread-request'] },
      { id: 'eanna-obverse-stock', text: `Barley · Available · ${progress.obverse.availableBarley} capacity measures`, classification: 'observed', sourceIds: ['source-eanna-storehouse-count'] },
      { id: 'eanna-obverse-vessels', text: `Beer vessels · Requested ${progress.obverse.offeringVesselsRequested} · Prepared ${progress.obverse.offeringVesselsPrepared}`, classification: 'observed', sourceIds: ['source-eanna-offering-vessels'] },
      { id: 'eanna-reverse-barley-total', text: 'Barley · Requested total · 29 capacity measures', classification: 'inferred', sourceIds: ['source-eanna-ninkasi-request','source-eanna-geme-request','source-eanna-bread-request'] },
      { id: 'eanna-reverse-barley-allocation', text: `Barley · Allocated · Nin-kasi ${nin} · Bread preparation ${bread} · Geme-Inana ${geme} capacity measures`, classification: 'observed', sourceIds: ['source-eanna-disposition'] },
      { id: 'eanna-reverse-barley-shortfall', text: 'Barley · Available 18 · Requested 29 · Shortfall 11 capacity measures', classification: 'inferred', sourceIds: ['source-eanna-storehouse-count','source-eanna-ninkasi-request','source-eanna-geme-request','source-eanna-bread-request'] },
      { id: 'eanna-reverse-vessel-shortfall', text: 'Beer vessels · Requested 6 · Prepared 4 · Unmet 2', classification: 'observed', sourceIds: ['source-eanna-offering-vessels'] },
      { id: 'eanna-later-supply-report', text: 'Barley · 3 capacity measures expected after Day 39; not counted as present stock', classification: 'reported', sourceIds: ['source-eanna-enlilkisu-expectation'] },
      { id: 'eanna-official-disposition', text: 'Allocation disposition authorized and sealed by Lu-Nanshe', classification: 'observed', sourceIds: ['source-eanna-disposition'] },
    ],
    uncertaintyLimits: [
      'All gathering-specific quantities and the scenario relationship among these requests are authored reconstruction, not transcriptions of an excavated transaction.',
      'The phrase barley capacity measure is a readable scenario unit label; no particular ancient sign or modern volume conversion is asserted.',
      'Enlil-kisu’s expected later supply is a spoken report, not a physical count or receipt.',
      'The tablet records an authorized allocation; it does not prove that goods were physically distributed or that every request was fulfilled.',
      'The records do not establish individual blame for any shortfall.',
    ],
    amendments: [],
  };

  const followUp: InstitutionalMatter = {
    id: EANNA_FOLLOW_UP_MATTER_ID,
    institutionId: EANNA_INSTITUTION_ID,
    kind: 'era1_eanna_allocation_follow_up',
    summary: 'The official allocation leaves 11 barley capacity measures and 2 beer vessels unmet. Enlil-kisu reports that 3 further barley capacity measures may arrive after Day 39; no receipt is recorded.',
    status: 'active',
    createdDay: dayNumber,
    sourceRecordId: record.id,
    sourceEventId: event.id,
    locationId: EANNA_TABLET_ROOM_ID as import('../state/ids').LocationId,
    involvedPersonIds: [EANNA_PEOPLE.luNanshe, EANNA_PEOPLE.urNanna, EANNA_PEOPLE.enlilKisu,
      EANNA_PEOPLE.ninKasi, EANNA_PEOPLE.gemeInana],
    provenance: [
      { id: 'eanna-follow-up-record', kind: 'record_copy', sourceId: record.id, description: 'The accepted Consolidated Summary Tablet and official allocation.' },
      { id: 'eanna-follow-up-event', kind: 'event', sourceId: event.id, description: 'Lu-Nanshe’s official allocation disposition.' },
      { id: 'eanna-follow-up-report', kind: 'testimony', sourceId: EANNA_PEOPLE.enlilKisu, description: 'Enlil-kisu’s report of expected later barley; receipt remains unverified.' },
    ],
  };
  return {
    events: [event],
    record,
    addInstitutionMatters: [followUp],
    retireInstitutionMatters: [{ institutionId: EANNA_INSTITUTION_ID, matterId: EANNA_ORIGIN_MATTER_ID }],
  };
}

export const eannaProvisioningWork = defineWork<EannaProvisioningScenario>({
  kind: 'work',
  progressCompatibilityKey: 'eanna-provisioning-summary-tablet-v1',
  id: EANNA_WORK_ID,
  title: 'The Eanna Provisioning Undertaking',
  startingEvidence: [],
  evidence: [...evidence],
  actions: [
    { id: 'sort-source-packet', successMessage: 'The written tallies, physical counts, and spoken expectation have been sorted by source status.', apCost: 1, grantsEvidence: evidence.slice(0, 6).map((item) => item.id), autoExamine: true },
    { id: 'compile-obverse', successMessage: 'The source-linked entries have been placed on the obverse.', apCost: 2, prerequisites: ['sort-source-packet'], grantsEvidence: ['eanna-obverse' as EvidenceId], autoExamine: true },
    { id: 'consolidate-reverse', successMessage: 'Compatible barley totals and the separate vessel count have been placed on the reverse.', apCost: 3, prerequisites: ['compile-obverse'], grantsEvidence: ['eanna-reverse' as EvidenceId], autoExamine: true },
    { id: 'final-check', successMessage: 'The two tablet faces are ready for Lu-Nanshe’s review.', apCost: 1, prerequisites: ['consolidate-reverse'], grantsEvidence: ['eanna-final-check' as EvidenceId], autoExamine: true },
  ],
  interpretationRules: [],
  historicalXpReward: 100,
  initialSubmissionApCost: 1,
  revisionSubmissionApCost: 1,
  dispositionApCost: 1,
  dispositions: ['returned','authorized'],
  provisionsContract: { minimumWorkApPerDay: 2, provisionsPerQualifiedWorkday: 1 },
  createInitialProgress: createEannaProvisioningScenario,
  validateScenarioData: validateEannaProvisioningScenario,
  evaluateSubmission: (context) => assess(context),
  assessSubmission: (submission, context) => {
    const result = submission as ReturnType<typeof assess>;
    const dimensions: WorkAssessment['dimensions'] = [
      { dimension: 'accuracy', status: result.sourceSorting && result.obverse ? 'meets' : 'fails',
        summary: result.sourceSorting && result.obverse ? 'The obverse preserves the source tallies and separate categories.' : 'The source sorting or obverse entries need correction.' },
      { dimension: 'completeness', status: result.allStages ? 'meets' : 'fails',
        summary: result.allStages ? 'All four stages and their source material are present.' : 'Complete each stage and retain the source packet before submission.' },
      { dimension: 'traceability', status: result.sourceSorting ? 'meets' : 'fails',
        summary: result.sourceSorting ? 'Written tallies, physical counts, and spoken expectation remain distinguishable.' : 'At least one source has been placed in the wrong source-status group.' },
      { dimension: 'responsibility', status: result.allocation ? 'meets' : 'fails',
        summary: result.allocation ? 'The provisional split uses the 18 counted barley measures without exceeding any claim; Lu-Nanshe retains final authority.' : 'The provisional split must total 18 barley capacity measures and must not exceed a claimant’s request.' },
    ];
    const accepted = dimensions.every((item) => item.status === 'meets');
    return { outcome: accepted ? 'accepted' : 'revise', summary: dimensions.map((item) => item.summary).join(' '), dimensions };
  },
  recover: ({ progress }) => progress,
  finalizeDisposition: finalize,
});
