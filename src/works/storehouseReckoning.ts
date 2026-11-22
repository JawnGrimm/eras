import type { EvidenceId, WorkId } from '../state/ids';
import type { RecordAssertion, RecordEntry, RecordSource } from '../state/types';
import { defineWork } from './workDefinition';
import type { WorkAssessment, WorkFinalization, WorkSubmissionContext } from './workDefinition';
import { evaluateEvidenceInterpretation } from './evidenceInterpretation';

export const STOREHOUSE_WORK_ID = 'work-storehouse-reckoning' as WorkId;
export const STOREHOUSE_INSTITUTION_ID = 'institution-temple-storehouse';
export const STOREHOUSE_PEOPLE = {
  seniorScribe: 'person-shuruppak-ilu',
  steward: 'person-ur-nanna',
  receivingOfficial: 'person-utu-mansum',
  carrierForeman: 'person-enlil-kisu',
  brewingRepresentative: 'person-nin-kasi',
} as const;

export const STOREHOUSE_PROVISION_CONTRACT = {
  provisionsPerQualifiedWorkday: 1,
  minimumWorkApPerDay: 1,
} as const;

// Prototype reward values are retained only as provisional balance references.
export const STOREHOUSE_PROVISIONAL_CAREER_XP = 500;
export const STOREHOUSE_PROVISIONAL_HISTORICAL_XP = 15_000;

export type StorehouseField =
  | 'opening' | 'dispatched' | 'received' | 'intakeUsable'
  | 'intakeHeld' | 'issued' | 'closingUsable' | 'closingHeld';
export type StorehouseFinding = 'status_change_cause_unestablished' | 'roof_leak_reported_unproven';
export type StorehouseRecommendation =
  | 'inspect_held_stock' | 'verify_roof_repair' | 'maintain_segregation' | 'assign_blame';
export type StorehouseDisposition = 'returned' | 'account_accepted' | 'authorized';

export interface StorehouseScenarioData extends Record<string, unknown> {
  draft: Partial<Record<StorehouseField, number>>;
  finding: StorehouseFinding;
  citations: EvidenceId[];
  recommendations: StorehouseRecommendation[];
}
export const STOREHOUSE_EVIDENCE = [
  { id: 'ev-01' as EvidenceId, title: 'Prior Closing-Balance Tablet', source: 'Temple Archive (signed by Senior Scribe)', objectiveText: 'The storehouse began the accounting period with exactly 24 usable standard institutional measures of clean barley.' },
  { id: 'ev-02' as EvidenceId, title: 'Dispatch Tablet from Outer Fields', source: 'Carrier Foreman Enlil-kisu', objectiveText: '60 standard institutional measures were loaded onto river barges and dispatched to the central storehouse under official dispatch seal #4.' },
  { id: 'ev-03' as EvidenceId, title: 'Arrival Tally at Receiving Desk', source: 'Receiving Dock Log', objectiveText: '60 measures were physically unloaded and counted at the landing dock.' },
  { id: 'ev-04' as EvidenceId, title: 'Initial Receiving Inspection Tally', source: 'Receiving Official Utu-mansum', objectiveText: 'At intake inspection, 56 measures were classified as dry and usable, while 4 measures showed moisture damage and were segregated and held separately.' },
  { id: 'ev-05' as EvidenceId, title: 'Issue Instruction and Brewing-House Receipt', source: 'Brewing-House Representative Nin-kasi', objectiveText: '30 usable measures were authorized by temple decree and issued to the brewing-house operation. The representative confirms physical receipt of those 30 measures.' },
  { id: 'ev-06' as EvidenceId, title: 'Custody and Maintenance Log', source: 'Storehouse Steward Ur-Nanna', objectiveText: 'A severe rainstorm caused a roof leak over the north storage bay after intake. The leak lasted two days before repairs were made. Exact timing of moisture spread is unrecorded.' },
  { id: 'ev-07' as EvidenceId, title: 'Current Physical Recount', source: 'Witnessed recount with Steward Ur-Nanna', objectiveText: 'A physical recount finds 47 measures still usable and 7 damp and held. Total physical stock in storehouse is 54 measures (47 usable + 7 held).' },
] as const;

const requiredEvidence = ['ev-01','ev-02','ev-03','ev-04','ev-05','ev-07'] as EvidenceId[];
const fields: StorehouseField[] = ['opening','dispatched','received','intakeUsable','intakeHeld','issued','closingUsable','closingHeld'];
const findings: StorehouseFinding[] = ['status_change_cause_unestablished','roof_leak_reported_unproven'];
const recommendations: StorehouseRecommendation[] = ['inspect_held_stock','verify_roof_repair','maintain_segregation','assign_blame'];

export function createStorehouseScenario(): StorehouseScenarioData {
  return { draft: {}, finding: 'status_change_cause_unestablished', citations: [], recommendations: [] };
}

/** Structural validation only. Incorrect but finite, non-negative figures remain saveable and assessable. */
export function validateStorehouseScenario(value: unknown): value is StorehouseScenarioData {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const v = value as Record<string, unknown>;
  if (!v.draft || typeof v.draft !== 'object' || Array.isArray(v.draft)
    || !findings.includes(v.finding as StorehouseFinding)
    || !Array.isArray(v.citations) || !Array.isArray(v.recommendations)) return false;
  const draft = v.draft as Record<string, unknown>;
  if (Object.keys(draft).some((key) => !fields.includes(key as StorehouseField))
    || Object.values(draft).some((number) => typeof number !== 'number' || !Number.isFinite(number) || number < 0)) return false;
  if (v.citations.some((id) => typeof id !== 'string' || !STOREHOUSE_EVIDENCE.some((e) => e.id === id))
    || new Set(v.citations).size !== v.citations.length) return false;
  if (v.recommendations.some((id) => typeof id !== 'string' || !recommendations.includes(id as StorehouseRecommendation))
    || new Set(v.recommendations).size !== v.recommendations.length) return false;
  return true;
}

export function storehouseAccountingPass(draft: StorehouseScenarioData['draft']): boolean {
  return draft.opening === 24 && draft.dispatched === 60 && draft.received === 60
    && draft.intakeUsable === 56 && draft.intakeHeld === 4 && draft.issued === 30
    && draft.closingUsable === 47 && draft.closingHeld === 7
    && draft.dispatched === draft.received
    && draft.intakeUsable + draft.intakeHeld === draft.received
    && draft.opening + draft.received - draft.issued === draft.closingUsable + draft.closingHeld
    && draft.opening + draft.intakeUsable - draft.issued - 3 === draft.closingUsable
    && draft.intakeHeld + 3 === draft.closingHeld;
}

function assess(context: WorkSubmissionContext<StorehouseScenarioData>): {
  accounting: boolean; evidence: boolean; judgment: boolean; feedback: Record<string, string>;
} {
  const { progress, examinedEvidence } = context;
  const examined = new Set(examinedEvidence);
  const accounting = storehouseAccountingPass(progress.draft);
  const requiredCitations = requiredEvidence.every((id) => progress.citations.includes(id) && examined.has(id));
  const roofFindingSupported = progress.finding !== 'roof_leak_reported_unproven'
    || (examined.has('ev-06' as EvidenceId) && progress.citations.includes('ev-06' as EvidenceId));
  const evidence = requiredCitations && roofFindingSupported;
  const hasPracticalAction = progress.recommendations.some((item) =>
    item === 'inspect_held_stock' || item === 'maintain_segregation' || item === 'verify_roof_repair');
  const noUnsupportedBlame = !progress.recommendations.includes('assign_blame');
  const roofRecommendationSupported = !progress.recommendations.includes('verify_roof_repair')
    || (examined.has('ev-06' as EvidenceId) && progress.citations.includes('ev-06' as EvidenceId));
  const judgment = hasPracticalAction && noUnsupportedBlame && roofRecommendationSupported && roofFindingSupported;
  return {
    accounting, evidence, judgment,
    feedback: {
      accounting: accounting
        ? 'The quantities reconcile: 60 arrived, 30 were issued, and 54 remain—47 usable and 7 held.'
        : 'The account does not yet reconcile. Check opening stock, dispatch against physical receipt, intake condition, issue, and closing condition. The three-measure change is a status change, not a disappearance.',
      evidence: evidence
        ? 'The material claims are tied to examined records, and the finding stays within what those records establish.'
        : 'Cite and examine the records supporting the material figures. E-06 is required only when the roof leak is included as a reported finding.',
      judgment: !noUnsupportedBlame
        ? 'The records do not establish individual responsibility. Recommend a practical action without assigning unsupported blame.'
        : !hasPracticalAction
          ? 'Choose at least one practical, evidence-supported action: inspect held stock, maintain segregation, or verify the reported roof repair.'
          : !roofRecommendationSupported
            ? 'The roof inspection may be appropriate, but first examine and cite E-06.'
            : 'The selected follow-up is proportionate to the evidence. The recommendation does not claim more than the records establish.',
    },
  };
}

const interpretationRules = [
  { id: 'ev07-novice-misread', evidenceId: 'ev-07' as EvidenceId,
    when: { kind: 'all' as const, predicates: [{ kind: 'skillAtMost' as const, skillId: 'recordkeeping_accounts' as const, level: 2 }] },
    text: 'The three additional held measures may look like missing stock when the condition categories are read as separate movements.', category: 'misinterpretation' as const, priority: 2, conflictGroup: 'ev07-skill-reading', displayOrder: 1 },
  { id: 'ev07-experienced-observation', evidenceId: 'ev-07' as EvidenceId,
    when: { kind: 'all' as const, predicates: [{ kind: 'skillAtLeast' as const, skillId: 'recordkeeping_accounts' as const, level: 3 }] },
    text: 'The combined physical total remains 54; the change is between usable and held condition categories.', category: 'observation' as const, priority: 3, conflictGroup: 'ev07-skill-reading', displayOrder: 1 },
  { id: 'ev07-cause-uncertain', evidenceId: 'ev-07' as EvidenceId,
    when: { kind: 'examinedAll' as const, evidenceIds: ['ev-04','ev-07'] as EvidenceId[] },
    text: 'The records establish a three-measure change in condition, but do not establish exactly when or why it occurred.', category: 'uncertainty' as const, priority: 2, displayOrder: 2 },
  { id: 'ev04-dispatch-receipt', evidenceId: 'ev-04' as EvidenceId,
    when: { kind: 'all' as const, predicates: [{ kind: 'skillAtLeast' as const, skillId: 'recordkeeping_accounts' as const, level: 3 }, { kind: 'examinedAll' as const, evidenceIds: ['ev-02','ev-03'] as EvidenceId[] }] },
    text: 'Dispatch and physical receipt are separate events; both records state 60 measures, so this case shows no dispatch-to-receipt shortage.', category: 'inference' as const, priority: 2, displayOrder: 1 },
  { id: 'ev04-cross-evidence', evidenceId: 'ev-04' as EvidenceId,
    when: { kind: 'examinedAll' as const, evidenceIds: ['ev-04','ev-07'] as EvidenceId[] },
    text: 'Comparing intake with recount shows three measures moved from usable to held; the total stock did not decrease.', category: 'inference' as const, priority: 3, displayOrder: 2 },
] as const;

function sourceForEvidence(id: EvidenceId): RecordSource {
  const map: Record<string, RecordSource> = {
    'ev-01': { id, kind: 'institution', sourceId: STOREHOUSE_INSTITUTION_ID, description: 'Temple Storehouse prior closing-balance tablet' },
    'ev-02': { id, kind: 'person', sourceId: STOREHOUSE_PEOPLE.carrierForeman, description: 'Carrier Foreman Enlil-kisu dispatch tablet' },
    'ev-03': { id, kind: 'institution', sourceId: STOREHOUSE_INSTITUTION_ID, description: 'Temple Storehouse receiving dock tally' },
    'ev-04': { id, kind: 'person', sourceId: STOREHOUSE_PEOPLE.receivingOfficial, description: 'Receiving Official Utu-mansum inspection tally' },
    'ev-05': { id, kind: 'person', sourceId: STOREHOUSE_PEOPLE.brewingRepresentative, description: 'Nin-kasi brewing-house issue receipt' },
    'ev-06': { id, kind: 'person', sourceId: STOREHOUSE_PEOPLE.steward, description: 'Ur-Nanna custody and maintenance log' },
    'ev-07': { id, kind: 'person', sourceId: STOREHOUSE_PEOPLE.steward, description: 'Ur-Nanna witnessed physical recount' },
  };
  return map[id];
}

function makeAssertions(data: StorehouseScenarioData, disposition: Exclude<StorehouseDisposition, 'returned'>): RecordAssertion[] {
  const citations = new Set(data.citations);
  const assertions: RecordAssertion[] = [];
  const add = (id: string, text: string, classification: RecordAssertion['classification'], refs: string[]) => {
    const supported = refs.filter((ref) => citations.has(ref as EvidenceId));
    if (supported.length) assertions.push({ id, text, classification, sourceIds: supported });
  };
  add('opening-stock', 'Opening usable stock was 24 measures.', 'observed', ['ev-01']);
  add('dispatch-quantity', 'The dispatch record states 60 measures.', 'reported', ['ev-02']);
  add('physical-receipt', 'The receiving tally records 60 measures physically received.', 'observed', ['ev-03']);
  add('intake-condition', 'At intake, 56 measures were usable and 4 were held.', 'observed', ['ev-04']);
  add('authorized-issue', 'Thirty usable measures were issued to the brewing-house operation under temple authority.', 'observed', ['ev-05']);
  add('closing-condition', 'The witnessed recount found 47 usable and 7 held measures, 54 in total.', 'observed', ['ev-07']);
  add('condition-change', 'Comparison of intake and recount indicates that three measures changed from usable to held; the total stock did not decrease.', 'inferred', ['ev-04','ev-07']);
  if (citations.has('ev-06' as EvidenceId)) add('roof-leak-report', 'The custody log reports a two-day roof leak after intake; its precise contribution to the moisture damage is not established.', 'reported', ['ev-06']);
  assertions.push({ id: 'senior-disposition', text: `Senior Scribe disposition: ${disposition}.`, classification: 'observed', sourceIds: ['ev-07'] });
  return assertions;
}

function finalize(context: WorkSubmissionContext<StorehouseScenarioData>, disposition: string): WorkFinalization {
  if (disposition !== 'account_accepted' && disposition !== 'authorized') throw new Error('Unsupported final disposition.');
  const { progress, personId, dayNumber } = context;
  const sources = progress.citations.map((id) => sourceForEvidence(id));
  const record: RecordEntry = {
    id: `record-storehouse-reckoning-day-${dayNumber}`,
    createdDay: dayNumber,
    authorPersonId: personId,
    institutionId: STOREHOUSE_INSTITUTION_ID,
    title: 'Storehouse Reckoning — Reconciliation and Senior Scribe Disposition',
    sources,
    assertions: makeAssertions(progress, disposition),
    uncertaintyLimits: [
      'The records do not establish the exact time or cause of the three-measure condition change.',
      'The roof leak is reported in the custody log but is not established as the cause of all moisture damage.',
      'The available evidence does not establish individual responsibility.',
    ],
    amendments: [],
  };
  const knowledge = [
    { id: `knowledge-storehouse-record-senior-${dayNumber}`, holder: { kind: 'person' as const, id: STOREHOUSE_PEOPLE.seniorScribe }, subject: { kind: 'record' as const, id: record.id }, basis: 'consulted-record' as const, learnedDay: dayNumber, sourcePersonId: personId },
    { id: `knowledge-storehouse-record-steward-${dayNumber}`, holder: { kind: 'person' as const, id: STOREHOUSE_PEOPLE.steward }, subject: { kind: 'record' as const, id: record.id }, basis: 'received-copy' as const, learnedDay: dayNumber, sourcePersonId: personId },
    { id: `knowledge-storehouse-record-institution-${dayNumber}`, holder: { kind: 'institution' as const, id: STOREHOUSE_INSTITUTION_ID }, subject: { kind: 'record' as const, id: record.id }, basis: 'received-copy' as const, learnedDay: dayNumber, sourcePersonId: personId },
  ];
  return { careerXpReward: STOREHOUSE_PROVISIONAL_CAREER_XP, record, knowledge };
}

export const storehouseReckoning = defineWork<StorehouseScenarioData>({
  id: STOREHOUSE_WORK_ID,
  title: 'The Storehouse Reckoning',
  startingEvidence: [],
  evidence: STOREHOUSE_EVIDENCE.map(({ id, title, source, objectiveText }) => ({ id, title, source, objectiveText })),
  actions: [
    { id: 'accounts', apCost: 1, grantsEvidence: ['ev-01','ev-02','ev-03'] as EvidenceId[], autoExamine: true },
    { id: 'intake_issue', apCost: 1, grantsEvidence: ['ev-04','ev-05'] as EvidenceId[], autoExamine: true },
    { id: 'recount', apCost: 2, grantsEvidence: ['ev-07'] as EvidenceId[], autoExamine: true },
    { id: 'custody', apCost: 1, grantsEvidence: ['ev-06'] as EvidenceId[], autoExamine: true },
  ],
  interpretationRules: [...interpretationRules],
  historicalXpReward: STOREHOUSE_PROVISIONAL_HISTORICAL_XP,
  initialSubmissionApCost: 2,
  revisionSubmissionApCost: 1,
  dispositionApCost: 1,
  dispositions: ['returned','account_accepted','authorized'],
  provisionsContract: STOREHOUSE_PROVISION_CONTRACT,
  createInitialProgress: createStorehouseScenario,
  validateScenarioData: validateStorehouseScenario,
  evaluateSubmission: (context) => assess(context),
  assessSubmission: (submission) => {
    const result = submission as ReturnType<typeof assess>;
    const outcome = !result.accounting || !result.evidence ? 'revise' : 'accepted';
    const dimensions: WorkAssessment['dimensions'] = [
      { dimension: 'accuracy', status: result.accounting ? 'meets' : 'fails', summary: result.feedback.accounting },
      { dimension: 'traceability', status: result.evidence ? 'meets' : 'fails', summary: result.feedback.evidence },
      { dimension: 'responsibility', status: result.judgment ? 'meets' : 'fails', summary: result.feedback.judgment },
    ];
    return { outcome, summary: dimensions.map((item) => item.summary).join(' '), dimensions };
  },
  recover: ({ progress }) => progress,
  finalizeDisposition: finalize,
});

export function interpretStorehouseEvidence(evidenceId: EvidenceId, character: WorkSubmissionContext<StorehouseScenarioData>['character'], examinedEvidence: readonly EvidenceId[]) {
  return evaluateEvidenceInterpretation({ evidenceId, character, examinedEvidence, rules: storehouseReckoning.interpretationRules });
}
