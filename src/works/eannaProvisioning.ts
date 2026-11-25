import type { EvidenceId, EventId, InstitutionId, LocationId, MatterId, PersonId, RecordId, WorkId } from '../state/ids';
import type { InstitutionalMatter, RecordEntry, WorldEvent } from '../state/types';
import { ERA1_COM_F02_F04_PEOPLE } from '../content/assignments/eraICommercialFamilies';
import { EANNA_INSTITUTION_ID, EANNA_TABLET_ROOM_LOCATION_ID } from '../engine/institutionalMatters';
import { STOREHOUSE_PEOPLE } from './storehouseReckoning';
import { defineWork } from './workDefinition';
import type { WorkAssessment, WorkFinalization, WorkSubmissionContext } from './workDefinition';

export const EANNA_PROVISIONING_WORK_ID = 'work-era1-eanna-provisioning-undertaking' as WorkId;
export const EANNA_PROVISIONING_MATTER_ID = 'matter-era1-eanna-provisioning-undertaking' as MatterId;
export const EANNA_ALLOCATION_FOLLOWUP_MATTER_ID = 'matter-era1-eanna-allocation-follow-up' as MatterId;
export const EANNA_SUMMARY_RECORD_ID = 'record-era1-eanna-consolidated-summary-tablet' as RecordId;
export const EANNA_ALLOCATION_EVENT_ID = 'event-era1-eanna-allocation-disposition' as EventId;

const PEOPLE = {
  luNanshe: ERA1_COM_F02_F04_PEOPLE.luNanshe,
  shuruppak: ERA1_COM_F02_F04_PEOPLE.shuruppak,
  gemeInana: ERA1_COM_F02_F04_PEOPLE.gemeInana,
  enlilKisu: ERA1_COM_F02_F04_PEOPLE.enlilKisu,
  ninKasi: STOREHOUSE_PEOPLE.brewingRepresentative,
} as const;

export const EANNA_SOURCE_IDS = [
  'eanna-ninkasi-barley-request',
  'eanna-geme-inana-barley-request',
  'eanna-bread-group-barley-request',
  'eanna-barley-physical-count',
  'eanna-offering-vessel-request',
  'eanna-prepared-vessel-count',
  'eanna-enlil-kisu-spoken-expectation',
] as const;

export type EannaSourceId = typeof EANNA_SOURCE_IDS[number];
export type EannaSourceClass = 'written_tally' | 'physical_count' | 'spoken_claim';
export type EannaDisposition = 'ratify_proposal' | 'adjust_to_default' | 'carry_forward';

export interface EannaScenarioData extends Record<string, unknown> {
  stage: number;
  sourceClassifications: Partial<Record<EannaSourceId, EannaSourceClass>>;
  obverseEntries: string[];
  proposal: { ninKasiBarley: number; gemeInanaBarley: number; breadGroupBarley: number; offeringBeerVessels: number };
}

export const EANNA_SOURCE_PACKET = [
  { id: EANNA_SOURCE_IDS[0], title: 'Nin-kasi household tally', source: 'Written household tally', text: 'Barley requested for the brewing-house work: 12 capacity measures.', classification: 'written_tally' as const, obverse: true },
  { id: EANNA_SOURCE_IDS[1], title: 'Geme-Inana household tally', source: 'Written household tally', text: 'Barley requested for the household work group: 9 capacity measures.', classification: 'written_tally' as const, obverse: true },
  { id: EANNA_SOURCE_IDS[2], title: 'Gathering bread-preparation tally', source: 'Written work-group tally', text: 'Barley requested for bread preparation: 8 capacity measures.', classification: 'written_tally' as const, obverse: true },
  { id: EANNA_SOURCE_IDS[3], title: 'Available barley count', source: 'Physical count at Eanna', text: '18 capacity measures of barley are counted as available.', classification: 'physical_count' as const, obverse: false },
  { id: EANNA_SOURCE_IDS[4], title: 'Inana-associated offering request', source: 'Written offering request', text: '6 discrete beer vessels are requested for the offering preparation.', classification: 'written_tally' as const, obverse: true },
  { id: EANNA_SOURCE_IDS[5], title: 'Prepared beer-vessel count', source: 'Physical count', text: '4 prepared beer vessels are counted as available.', classification: 'physical_count' as const, obverse: false },
  { id: EANNA_SOURCE_IDS[6], title: 'Enlil-kisu’s spoken account', source: 'Spoken statement; not a written tally', text: 'Enlil-kisu expects 3 further barley capacity measures later. They have not arrived and are not part of present stock.', classification: 'spoken_claim' as const, obverse: false },
] as const;

const WRITTEN_OBVERSE_IDS: readonly EannaSourceId[] = EANNA_SOURCE_PACKET.filter((item) => item.obverse).map((item) => item.id);
const REQUESTS = { ninKasi: 12, gemeInana: 9, breadGroup: 8, offeringVessels: 6 } as const;
const AVAILABLE = { barley: 18, beerVessels: 4 } as const;
const DEFAULT_ALLOCATION = { ninKasiBarley: 10, gemeInanaBarley: 3, breadGroupBarley: 5, offeringBeerVessels: 4 } as const;

export function createEannaScenario(): EannaScenarioData {
  return {
    stage: 0,
    sourceClassifications: {},
    obverseEntries: [],
    proposal: { ninKasiBarley: 0, gemeInanaBarley: 0, breadGroupBarley: 0, offeringBeerVessels: 0 },
  };
}

export function validateEannaScenario(value: unknown): value is EannaScenarioData {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const v = value as Record<string, unknown>;
  if (!Number.isInteger(v.stage) || (v.stage as number) < 0 || (v.stage as number) > 4
    || !v.sourceClassifications || typeof v.sourceClassifications !== 'object' || Array.isArray(v.sourceClassifications)
    || !Array.isArray(v.obverseEntries) || !v.proposal || typeof v.proposal !== 'object' || Array.isArray(v.proposal)) return false;
  const classifications = v.sourceClassifications as Record<string, unknown>;
  if (Object.keys(classifications).some((id) => !EANNA_SOURCE_IDS.includes(id as EannaSourceId))
    || Object.values(classifications).some((kind) => !['written_tally', 'physical_count', 'spoken_claim'].includes(kind as string))) return false;
  if (v.obverseEntries.some((id) => typeof id !== 'string' || !WRITTEN_OBVERSE_IDS.includes(id as EannaSourceId))
    || new Set(v.obverseEntries).size !== v.obverseEntries.length) return false;
  const proposal = v.proposal as Record<string, unknown>;
  const keys = ['ninKasiBarley', 'gemeInanaBarley', 'breadGroupBarley', 'offeringBeerVessels'];
  if (Object.keys(proposal).length !== keys.length || keys.some((key) =>
    !Number.isSafeInteger(proposal[key]) || (proposal[key] as number) < 0)) return false;
  return true;
}

interface EannaEvaluation { sourceSorting: boolean; obverse: boolean; allocation: boolean; finalCheck: boolean; retrospective: boolean; officialReview: boolean; }

function proposalIsWithinAvailable(progress: EannaScenarioData): boolean {
  const p = progress.proposal;
  return p.ninKasiBarley <= REQUESTS.ninKasi
    && p.gemeInanaBarley <= REQUESTS.gemeInana
    && p.breadGroupBarley <= REQUESTS.breadGroup
    && p.ninKasiBarley + p.gemeInanaBarley + p.breadGroupBarley <= AVAILABLE.barley
    && p.offeringBeerVessels <= AVAILABLE.beerVessels;
}

function sourceSortingIsCorrect(progress: EannaScenarioData): boolean {
  return EANNA_SOURCE_PACKET.every((item) => progress.sourceClassifications[item.id] === item.classification);
}

function obverseIsComplete(progress: EannaScenarioData): boolean {
  return WRITTEN_OBVERSE_IDS.every((id) => progress.obverseEntries.includes(id));
}

function createOriginMatter(personId: PersonId, dayNumber: number): InstitutionalMatter {
  return {
    id: EANNA_PROVISIONING_MATTER_ID,
    institutionId: EANNA_INSTITUTION_ID,
    kind: 'era1_eanna_provisioning_undertaking',
    summary: 'Eanna’s separate household and offering requests must be compiled against the available counts before Lu-Nanshe records an allocation.',
    status: 'active',
    createdDay: dayNumber,
    locationId: EANNA_TABLET_ROOM_LOCATION_ID,
    involvedPersonIds: [personId, PEOPLE.luNanshe, PEOPLE.shuruppak, PEOPLE.ninKasi, PEOPLE.gemeInana, PEOPLE.enlilKisu],
    provenance: [
      { id: 'eanna-three-household-requests', kind: 'record_copy', description: 'Three separate authored household/work-group barley tallies: 12, 9, and 8 capacity measures.' },
      { id: 'eanna-physical-barley-count', kind: 'observation', description: 'A physical count establishes 18 available barley capacity measures.' },
      { id: 'eanna-offering-vessel-counts', kind: 'record_copy', description: 'A separate offering request for 6 beer vessels and a physical count of 4 prepared vessels.' },
      { id: 'eanna-enlil-kisu-expectation', kind: 'testimony', description: 'Enlil-kisu expects 3 later barley measures; this is not present stock.' },
    ],
  };
}

function buildFinalization(context: WorkSubmissionContext<EannaScenarioData>, disposition: string): WorkFinalization {
  const p = context.progress.proposal;
  const allocation = disposition === 'adjust_to_default' || disposition === 'carry_forward'
    ? { ...DEFAULT_ALLOCATION }
    : { ...p };
  const retrospective = context.dayNumber > 38;
  const officialReview = context.dayNumber > 42;
  const record: RecordEntry = {
    id: EANNA_SUMMARY_RECORD_ID,
    createdDay: context.dayNumber,
    authorPersonId: context.personId,
    institutionId: EANNA_INSTITUTION_ID,
    title: 'Consolidated Summary Tablet: Eanna Gathering',
    sources: [
      { id: 'eanna-source-household-tallies', kind: 'institution', sourceId: EANNA_INSTITUTION_ID, description: 'Separate household/work-group written barley tallies and the offering request.' },
      { id: 'eanna-source-physical-counts', kind: 'institution', sourceId: EANNA_INSTITUTION_ID, description: 'Physical counts of available barley and prepared beer vessels.' },
      { id: 'eanna-source-spoken-account', kind: 'person', sourceId: PEOPLE.enlilKisu, description: 'Enlil-kisu’s spoken expectation of later barley; not counted as present stock.' },
      { id: 'eanna-official-disposition', kind: 'event', sourceId: EANNA_ALLOCATION_EVENT_ID, description: 'Lu-Nanshe’s separately recorded allocation disposition.' },
    ],
    assertions: [
      { id: 'eanna-obverse-ninkasi', text: 'Nin-kasi household request: 12 barley capacity measures.', classification: 'observed', sourceIds: ['eanna-source-household-tallies'] },
      { id: 'eanna-obverse-geme', text: 'Geme-Inana household work-group request: 9 barley capacity measures.', classification: 'observed', sourceIds: ['eanna-source-household-tallies'] },
      { id: 'eanna-obverse-bread', text: 'Gathering bread-preparation request: 8 barley capacity measures.', classification: 'observed', sourceIds: ['eanna-source-household-tallies'] },
      { id: 'eanna-reverse-barley', text: 'Available barley counted: 18 capacity measures. Total requests: 29. Shortfall against all requests: 11.', classification: 'observed', sourceIds: ['eanna-source-household-tallies', 'eanna-source-physical-counts'] },
      { id: 'eanna-offering-request', text: 'Inana-associated offering request: 6 discrete beer vessels.', classification: 'observed', sourceIds: ['eanna-source-household-tallies'] },
      { id: 'eanna-offering-available', text: 'Prepared beer vessels counted: 4; shortfall against request: 2.', classification: 'observed', sourceIds: ['eanna-source-physical-counts'] },
      { id: 'eanna-spoken-expectation', text: 'Enlil-kisu expects 3 later barley measures. They are not counted, received, or included in available stock.', classification: 'reported', sourceIds: ['eanna-source-spoken-account'] },
      { id: 'eanna-apprentice-proposal', text: 'Apprentice proposal: ' + p.ninKasiBarley + ' barley measures to Nin-kasi; ' + p.gemeInanaBarley + ' to Geme-Inana; ' + p.breadGroupBarley + ' to bread preparation; ' + p.offeringBeerVessels + ' beer vessels to the offering preparation.', classification: 'reported', sourceIds: ['eanna-source-household-tallies', 'eanna-source-physical-counts'] },
      { id: 'eanna-official-allocation', text: 'Official allocation decided by Lu-Nanshe: ' + allocation.ninKasiBarley + ' barley measures to Nin-kasi; ' + allocation.breadGroupBarley + ' to bread preparation; ' + allocation.gemeInanaBarley + ' to Geme-Inana; ' + allocation.offeringBeerVessels + ' beer vessels to the offering preparation. Remaining unmet requests: ' + (REQUESTS.ninKasi - allocation.ninKasiBarley) + ' barley measures for Nin-kasi; ' + (REQUESTS.breadGroup - allocation.breadGroupBarley) + ' for bread preparation; ' + (REQUESTS.gemeInana - allocation.gemeInanaBarley) + ' for Geme-Inana; ' + (REQUESTS.offeringVessels - allocation.offeringBeerVessels) + ' beer vessels.', classification: 'observed', sourceIds: ['eanna-official-disposition', 'eanna-source-household-tallies', 'eanna-source-physical-counts'] },
      { id: 'eanna-lunanshe-disposition', text: 'Lu-Nanshe’s official disposition: ' + disposition + '. The record preserves her allocation decision; it does not establish physical distribution or delivery.', classification: 'observed', sourceIds: ['eanna-official-disposition'] },
      ...(retrospective ? [{ id: 'eanna-retrospective-window', text: 'The compilation was completed after Day 38. The gathering proceeded at reduced scope on Day 39; this retrospective record does not claim that the full request was supplied.', classification: 'reported' as const, sourceIds: ['eanna-source-household-tallies'] }] : []),
      ...(officialReview ? [{ id: 'eanna-post-window-review', text: 'After Day 42, Lu-Nanshe reviewed the surviving source records and accepted this qualified retrospective account. The compilation date is not backdated.', classification: 'reported' as const, sourceIds: ['eanna-official-disposition'] }] : []),
    ],
    uncertaintyLimits: [
      'The household tallies and physical counts are authored gameplay reconstruction, not transcriptions of a single excavated tablet.',
      'Barley capacity measures and discrete beer vessels remain separate categories and are not converted or combined.',
      'Enlil-kisu’s spoken expectation is not a physical count or a receipt.',
      'The apprentice prepares a proposal; Lu-Nanshe alone makes the institutional allocation decision.',
      'The allocation disposition does not prove that goods were physically distributed, delivered, or received.',
      ...(retrospective ? ['The compilation was retrospective; the gathering had already proceeded at reduced scope.'] : []),
      ...(officialReview ? ['The account was accepted through official review of surviving source records after Day 42; no missing delivery or distribution is inferred.'] : []),
    ],
    amendments: [],
  };
  const event: WorldEvent = {
    id: EANNA_ALLOCATION_EVENT_ID,
    dayNumber: context.dayNumber,
    summary: (officialReview ? 'After Day 42, Lu-Nanshe reviews the surviving source records and records ' : 'Lu-Nanshe records ') + disposition + ': ' + allocation.ninKasiBarley + ' barley measures for Nin-kasi, ' + allocation.breadGroupBarley + ' for bread preparation, ' + allocation.gemeInanaBarley + ' for Geme-Inana, and ' + allocation.offeringBeerVessels + ' beer vessels for the offering preparation. This is an official decision; no physical distribution or delivery is inferred.',
    personIds: [context.personId, PEOPLE.luNanshe, PEOPLE.shuruppak, PEOPLE.ninKasi, PEOPLE.gemeInana, PEOPLE.enlilKisu],
    institutionIds: [EANNA_INSTITUTION_ID],
    locationId: EANNA_TABLET_ROOM_LOCATION_ID,
  };
  const followup: InstitutionalMatter | undefined = disposition === 'carry_forward' ? {
    id: EANNA_ALLOCATION_FOLLOWUP_MATTER_ID,
    institutionId: EANNA_INSTITUTION_ID,
    kind: 'era1_eanna_allocation_follow_up',
    summary: 'Lu-Nanshe has authorized a later account against the unmet Eanna gathering quantities. Enlil-kisu’s expected later barley remains unreceived until a separate count or receipt is recorded.',
    status: 'active',
    createdDay: context.dayNumber,
    sourceRecordId: EANNA_SUMMARY_RECORD_ID,
    locationId: EANNA_TABLET_ROOM_LOCATION_ID,
    involvedPersonIds: [context.personId, PEOPLE.luNanshe, PEOPLE.enlilKisu, PEOPLE.ninKasi, PEOPLE.gemeInana],
    provenance: [
      { id: 'eanna-followup-summary', kind: 'record_copy', sourceId: EANNA_SUMMARY_RECORD_ID, description: 'The accepted Consolidated Summary Tablet preserves the allocation and unmet quantities.' },
      { id: 'eanna-followup-expectation', kind: 'testimony', sourceId: PEOPLE.enlilKisu, description: 'The expected later barley is still only a spoken expectation until independently counted or received.' },
    ],
  } : undefined;
  return {
    record,
    events: [event],
    retireInstitutionMatters: [{ institutionId: EANNA_INSTITUTION_ID, matterId: EANNA_PROVISIONING_MATTER_ID }],
    ...(followup ? { addInstitutionMatters: [followup] } : {}),
  };
}

export const eannaProvisioningWork = defineWork<EannaScenarioData>({
  kind: 'work',
  progressCompatibilityKey: 'eanna-provisioning-four-stage-v1',
  id: EANNA_PROVISIONING_WORK_ID,
  title: 'The Eanna Provisioning Undertaking',
  startingEvidence: EANNA_SOURCE_IDS as unknown as EvidenceId[],
  evidence: EANNA_SOURCE_PACKET.map((item) => ({
    id: item.id as EvidenceId, title: item.title, source: item.source, objectiveText: item.text,
  })),
  actions: [
    { id: 'sort-sources', successMessage: 'The written tallies, physical counts, and spoken expectation have been sorted by source type.', apCost: 1 },
    { id: 'compile-obverse', successMessage: 'The separate household and offering requests have been compiled on the obverse.', apCost: 2, prerequisites: ['sort-sources'] },
    { id: 'consolidate-reverse', successMessage: 'Compatible totals and a provisional allocation have been prepared on the reverse.', apCost: 3, prerequisites: ['compile-obverse'] },
    { id: 'final-check', successMessage: 'The two faces have been checked and are ready for submission.', apCost: 1, prerequisites: ['consolidate-reverse'] },
  ],
  interpretationRules: [],
  historicalXpReward: 100,
  initialSubmissionApCost: 1,
  revisionSubmissionApCost: 1,
  dispositionApCost: 1,
  dispositions: ['ratify_proposal', 'adjust_to_default', 'carry_forward'],
  provisionsContract: { minimumWorkApPerDay: 2, provisionsPerQualifiedWorkday: 1 },
  createInitialProgress: createEannaScenario,
  createInitialMatters: ({ personId, dayNumber }) => [createOriginMatter(personId, dayNumber)],
  validateScenarioData: validateEannaScenario,
  evaluateSubmission: ({ progress, dayNumber }) => ({
    sourceSorting: sourceSortingIsCorrect(progress),
    obverse: obverseIsComplete(progress),
    allocation: proposalIsWithinAvailable(progress),
    finalCheck: progress.stage >= 4,
    retrospective: dayNumber > 38,
    officialReview: dayNumber > 42,
  }),
  assessSubmission: (submission) => {
    const result = submission as EannaEvaluation;
    const sorting = result.sourceSorting;
    const obverse = result.obverse;
    const allocation = result.allocation;
    const finalCheck = result.finalCheck;
    const accepted = sorting && obverse && allocation && finalCheck;
    const dimensions: WorkAssessment['dimensions'] = [
      { dimension: 'accuracy', status: sorting && allocation ? 'meets' : 'fails', summary: sorting ? 'The three source classes remain distinct; the spoken expectation is not counted as stock.' : 'Sort each source as a written tally, physical count, or spoken claim before submission.' },
      { dimension: 'completeness', status: obverse ? 'meets' : 'fails', summary: obverse ? 'All separate written household and offering requests appear on the obverse.' : 'The obverse is missing one or more separate written requests.' },
      { dimension: 'traceability', status: obverse && sorting ? 'meets' : 'fails', summary: 'Each tablet entry remains tied to its source and unit.' },
      { dimension: 'procedure', status: finalCheck ? (result.retrospective ? 'partial' : 'meets') : 'fails', summary: finalCheck ? (result.officialReview ? 'Lu-Nanshe reviewed the surviving source records after Day 42 and accepted a qualified retrospective account; the original compilation date is not backdated.' : result.retrospective ? 'The compilation is accepted retrospectively during Days 39–42; the Day 39 gathering proceeded at reduced scope.' : 'The tablet was checked and submitted within the full gathering window.') : 'Complete the final tablet check before submission.' },
      { dimension: 'responsibility', status: allocation ? 'meets' : 'fails', summary: allocation ? 'The proposed allocation stays within the counted quantities and does not treat expected barley as present stock.' : 'The proposed allocation exceeds a request or the physically counted supply.' },
    ];
    return { outcome: accepted ? 'accepted' : 'revise', summary: dimensions.map((item) => item.summary).join(' '), dimensions };
  },
  recover: ({ progress }) => progress,
  finalizeDisposition: buildFinalization,
});

export function eannaEvidenceId(id: EannaSourceId): EvidenceId {
  return id as EvidenceId;
}

export function eannaInstitutionId(): InstitutionId {
  return EANNA_INSTITUTION_ID;
}

export function eannaLocationId(): LocationId {
  return EANNA_TABLET_ROOM_LOCATION_ID;
}

/** The milestone's accepted Work completion is the sole eligibility gate for the next Era I career-scale Work choice. */
export function isEraICareerScaleWorkChoiceEligible(completedWorkIds: readonly WorkId[]): boolean {
  return completedWorkIds.includes(EANNA_PROVISIONING_WORK_ID);
}
