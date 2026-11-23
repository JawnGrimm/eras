import type { AttributeId, PersonId, SkillId } from '../../state/ids';
import type { AssignmentActivityDraft, AssignmentActivityProgress } from '../../state/types';
import type { InterpretationRule, Predicate } from '../../works/evidenceInterpretation';
import { URUK_ASSIGNMENT_ACTIVITY_CATALOG } from './urukAssignments';

export const NORTH_BAY_ACTIVITY_ID = 'activity-north-bay-roof-inspection';
export const NORTH_BAY_POST_EXECUTION_ACTIVITY_ID = 'activity-north-bay-post-execution-inspection';
export const NORTH_BAY_ASSIGNMENT_ID = 'assignment-north-bay-roof-inspection' as import('../../state/ids').AssignmentId;
export const NORTH_BAY_PEOPLE = {
  steward: 'person-ur-nanna' as PersonId,
  repairer: 'person-dudu' as PersonId,
  receivingOfficial: 'person-utu-mansum' as PersonId,
  seniorScribe: 'person-shuruppak-ilu' as PersonId,
};
export const NORTH_BAY_LOCATION_ID = 'location-uruk-temple-storehouse' as import('../../state/ids').LocationId;
export const NORTH_BAY_DISCOVERIES = [
  { id: 'steward-briefing', title: 'Steward’s account', text: 'Ur-Nanna says storm wind tore the outer reed matting and mud-plaster coat and washed debris toward the north parapet. He says the leak continued for two days before the repair, describes the bay as repaired, names Dudu as the repairer, and confirms that seven held sacks remain segregated below. He wants the bay returned to use before the incoming harvest.' },
  { id: 'repairer-scope', title: 'Repairer’s account', text: 'Dudu states that he patched the mid-bay break with reed matting and mud plaster. Clearing the parapet runoff channel and replacing damp beam-ends were not included in the Steward’s fee.' },
  { id: 'roof-inspection', title: 'Physical inspection', text: 'From the courtyard the center appears repaired. Close inspection finds the mid-bay patch intact, but the north parapet runoff channel remains clogged with storm-washed reeds and cracked plaster. The exposed face of the north-east beam socket appears dry, but the shaded wall joint remains damp; it is not collapsed, but fresh grain should not be stacked against that wall until it is assessed. Seven sacks remain segregated on dry reed matting; their contents have not been tested.' },
  { id: 'intake-boundary', title: 'Original intake boundary', text: 'Utu-mansum can attest that the original intake inspection recorded 56 usable and 4 held measures. He was not present for the storm or subsequent repair.' },
  { id: 'scope-comparison', title: 'Repair scope comparison', text: 'The Steward’s maintenance note calls the bay repaired; Dudu’s account limits the paid work to the mid-bay patch. The accounts differ in scope, not necessarily in whether Dudu completed his contracted work.' },
] as const;

export interface AssignmentActivityActionDefinition {
  id: string; family: 'consult' | 'observe' | 'compare'; label: string; description: string;
  apCost: number; prerequisites?: string[]; discoveryIds: string[]; consultedPersonId?: PersonId;
}
export interface AssignmentActivityDiscoveryDefinition { id: string; title: string; text: string; }
export interface AssignmentActivityReportSchema {
  title: string;
  responsibilityLabel: string;
  findings: Array<{ id: string; label: string }>;
  responsibilityClaims: Array<{ id: string; label: string }>;
  recommendations: Array<{ id: string; label: string }>;
  limitationsLabel: string;
}
export interface AssignmentActivityDefinition {
  id: string; title: string; submissionApCost: number; participants: PersonId[];
  actions: AssignmentActivityActionDefinition[]; discoveries: AssignmentActivityDiscoveryDefinition[];
  interpretationRules: InterpretationRule[]; reportSchema: AssignmentActivityReportSchema; submissionNote?: string;
  createInitialProgress(): AssignmentActivityProgress;
}
const interpretationRules: InterpretationRule[] = [
  { id: 'roof-skilled-drainage-inference', evidenceId: 'roof-inspection' as never,
    when: { kind: 'all', predicates: [
      { kind: 'attributeAtLeast', attributeId: 'perception', value: 3 },
      { kind: 'skillAtLeast', skillId: 'analysis_research', level: 2 },
    ] }, text: 'The obstructed runoff channel is not incidental debris: another storm can force water beneath the repaired mid-bay patch.', category: 'inference', priority: 2, displayOrder: 1 },
  { id: 'roof-limited-reading', evidenceId: 'roof-inspection' as never,
    when: { kind: 'all', predicates: [
      { kind: 'attributeAtMost', attributeId: 'perception', value: 2 },
    ] }, text: 'The central plaster appears dry, but the shaded beam socket is damp. The significance of the blocked runoff channel is not yet clear.', category: 'uncertainty', priority: 1, displayOrder: 2 },
];

export const northBayRoofInspection: AssignmentActivityDefinition = {
  id: NORTH_BAY_ACTIVITY_ID,
  title: 'North-Bay Roof Inspection',
  submissionApCost: 2,
  participants: Object.values(NORTH_BAY_PEOPLE),
  discoveries: [...NORTH_BAY_DISCOVERIES],
  actions: [
    { id: 'brief-steward', family: 'consult', label: 'Consult Ur-Nanna', description: 'Establish the request, access, and repairer identity.', apCost: 1, discoveryIds: ['steward-briefing'], consultedPersonId: NORTH_BAY_PEOPLE.steward },
    { id: 'inspect-roof', family: 'observe', label: 'Inspect roof and beam socket', description: 'Examine the repaired mid-bay section, north runoff channel, shaded beam joint, and segregated sacks.', apCost: 2, prerequisites: ['brief-steward'], discoveryIds: ['roof-inspection'] },
    { id: 'consult-repairer', family: 'consult', label: 'Consult Dudu', description: 'Ask what work was actually included in the repair contract.', apCost: 1, prerequisites: ['brief-steward'], discoveryIds: ['repairer-scope'], consultedPersonId: NORTH_BAY_PEOPLE.repairer },
    { id: 'consult-receiver', family: 'consult', label: 'Consult Utu-mansum', description: 'Check the limits of the original receiving inspection.', apCost: 1, discoveryIds: ['intake-boundary'], consultedPersonId: NORTH_BAY_PEOPLE.receivingOfficial },
    { id: 'compare-scope', family: 'compare', label: 'Compare repair accounts', description: 'Compare Dudu’s account with the Steward’s maintenance note.', apCost: 1, prerequisites: ['brief-steward','consult-repairer'], discoveryIds: ['scope-comparison'] },
  ],
  interpretationRules,
  reportSchema: {
    title: 'Inspection report',
    responsibilityLabel: 'Responsibility claim',
    findings: [
      { id: 'insufficient_evidence', label: 'Insufficient evidence to certify' },
      { id: 'repair_incomplete', label: 'Repair incomplete / further work required' },
      { id: 'repair_appears_sound', label: 'Repair appears sound' },
    ],
    responsibilityClaims: [
      { id: 'none', label: 'Do not assign individual responsibility' },
      { id: 'dudu', label: 'Attribute the unresolved work to Dudu' },
    ],
    recommendations: [
      { id: 'clear_parapet', label: 'Clear the north parapet runoff channel' },
      { id: 'assess_beam', label: 'Assess the damp north-east beam socket' },
      { id: 'inspect_held_barley', label: 'Arrange a separate inspection of the seven held sacks' },
      { id: 'monitor_repair', label: 'Monitor the repaired section after heavy rain' },
    ],
    limitationsLabel: 'Limitations and unverified matters',
  },
  submissionNote: 'Submission closes the Assignment. Held barley remains a separate inspection.',
  createInitialProgress: () => ({ completedActionIds: [], discoveryIds: [], consultedPersonIds: [], draft: {
    finding: 'insufficient_evidence', responsibilityClaim: 'none', citedDiscoveryIds: [], limitations: [], recommendations: [],
  } }),
};


/** Evidence-gathering follow-up. The player inspects and files a record; appointed
 * institutional officials retain the separate verification and resolution authority. */
export const northBayPostExecutionInspection: AssignmentActivityDefinition = {
  id: NORTH_BAY_POST_EXECUTION_ACTIVITY_ID,
  title: 'Post-Execution North-Bay Inspection',
  submissionApCost: 1,
  participants: [NORTH_BAY_PEOPLE.steward, NORTH_BAY_PEOPLE.seniorScribe],
  discoveries: [
    { id: 'post-execution-observation', title: 'Physical inspection after maintenance',
      text: 'Inspect the runoff channel and shaded beam socket after this specific execution. Record the physical condition visible at the time of inspection; do not assume that a prior execution’s result still holds. This inspection does not certify the entire roof or establish future performance.' },
    { id: 'post-execution-record', title: 'Recorded maintenance execution',
      text: 'The Steward’s execution record states that the runoff channel was cleared and the damp beam socket assessed. The recorded result says the socket remained damp and required a separate inspection after drying. This is the worker’s recorded result, not independent physical confirmation.' },
    { id: 'post-execution-steward-request', title: 'Steward’s verification request',
      text: 'Ur-Nanna requests an independent inspection record after the assigned maintenance. The scribe may inspect and report, but may not authorize additional building expenditure or expand the completed work.' },
  ],
  actions: [
    { id: 'inspect-completed-work', family: 'observe', label: 'Inspect the completed maintenance',
      description: 'Physically inspect the cleared runoff channel and the shaded beam socket after the recorded execution.',
      apCost: 2, discoveryIds: ['post-execution-observation'] },
    { id: 'review-execution-record', family: 'compare', label: 'Review the execution record',
      description: 'Compare the worker’s recorded result with the scope of the authorized maintenance.',
      apCost: 1, discoveryIds: ['post-execution-record'] },
    { id: 'consult-steward-after-work', family: 'consult', label: 'Consult Ur-Nanna',
      description: 'Confirm the request and the boundary between inspection and further authorization.',
      apCost: 1, discoveryIds: ['post-execution-steward-request'], consultedPersonId: NORTH_BAY_PEOPLE.steward },
  ],
  interpretationRules: [],
  reportSchema: {
    title: 'Post-execution inspection record',
    responsibilityLabel: 'Responsibility claim',
    findings: [
      { id: 'channel_clear_beam_followup', label: 'Channel clear; damp beam joint requires follow-up after drying' },
      { id: 'channel_clear_beam_dry', label: 'Channel clear; beam joint appears dry at inspection' },
      { id: 'channel_obstructed', label: 'Runoff channel remains obstructed after execution' },

    ],
    responsibilityClaims: [
      { id: 'none', label: 'No individual responsibility assigned' },
      { id: 'aru', label: 'Assign responsibility to the maintenance worker' },
    ],
    recommendations: [
      { id: 'accept_execution_with_followup', label: 'Record the cleared channel and arrange a separate beam-joint follow-up after drying' },
      { id: 'inspect_beam_after_drying', label: 'Reinspect the shaded beam joint after it has had time to dry' },
      { id: 'reopen_channel_work', label: 'Request further channel maintenance' },
    ],
    limitationsLabel: 'Inspection scope and unresolved condition',
  },
  submissionNote: 'This report supplies independent evidence to an appointed verifier. It is not itself a verification decision, authorization, or final institutional disposition.',
  createInitialProgress: () => ({ completedActionIds: [], discoveryIds: [], consultedPersonIds: [], draft: {
    finding: 'channel_clear_beam_followup', responsibilityClaim: 'none', citedDiscoveryIds: [], limitations: [], recommendations: [],
  } }),
};
function validatePredicate(predicate: Predicate, issues: string[], discoveryIds: Set<string>): void {
  const skills: SkillId[] = ['reading_scripts','recordkeeping_accounts','analysis_research','writing_composition','administration_procedure','communication_instruction'];
  const attributes: AttributeId[] = ['precision','perception','reasoning','expression','endurance','composure'];
  if (predicate.kind === 'all' || predicate.kind === 'any') {
    if (!predicate.predicates.length) issues.push('Empty predicate group.');
    predicate.predicates.forEach((child) => validatePredicate(child, issues, discoveryIds));
  } else if (predicate.kind === 'not') validatePredicate(predicate.predicate, issues, discoveryIds);
  else if (predicate.kind === 'skillAtLeast' || predicate.kind === 'skillAtMost') {
    if (!skills.includes(predicate.skillId) || !Number.isInteger(predicate.level) || predicate.level < 1 || predicate.level > 10) issues.push('Invalid SkillId or skill threshold.');
  } else if (predicate.kind === 'attributeAtLeast' || predicate.kind === 'attributeAtMost') {
    if (!attributes.includes(predicate.attributeId) || !Number.isFinite(predicate.value)) issues.push('Invalid AttributeId or attribute threshold.');
  } else if (predicate.kind === 'examinedAll' || predicate.kind === 'examinedNone') {
    if (!predicate.evidenceIds.length) issues.push('Empty discovery predicate.');
    if (predicate.evidenceIds.some((id) => !discoveryIds.has(String(id)))) issues.push('Interpretation predicate references an unknown discovery.');
  }
}
export function validateAssignmentActivityDefinition(definition: AssignmentActivityDefinition): string[] {
  const issues: string[] = [];
  const actionIds = new Set<string>(definition.actions.map((action) => action.id));
  const discoveryIds = new Set<string>(definition.discoveries.map((item) => item.id));
  if (actionIds.size !== definition.actions.length) issues.push('Action IDs must be unique.');
  if (discoveryIds.size !== definition.discoveries.length) issues.push('Discovery IDs must be unique.');
  if (!definition.id || !definition.title || !Number.isInteger(definition.submissionApCost) || definition.submissionApCost < 1 || definition.submissionApCost > 6) issues.push('Activity identity and submission AP (1..6) are required.');
  for (const [field, options] of Object.entries({ findings: definition.reportSchema.findings, responsibilityClaims: definition.reportSchema.responsibilityClaims, recommendations: definition.reportSchema.recommendations })) {
    if (!Array.isArray(options) || options.length === 0 || new Set(options.map((option) => option.id)).size !== options.length || options.some((option) => !option.id.trim() || !option.label.trim())) issues.push(`Report schema ${field} must contain unique, labeled options.`);
  }
  if (!definition.reportSchema.title.trim() || !definition.reportSchema.responsibilityLabel.trim() || !definition.reportSchema.limitationsLabel.trim()) issues.push('Report schema requires title, responsibility, and limitations labels.');
  if (definition.participants.some((id) => typeof id !== 'string' || !id.trim()) || new Set(definition.participants).size !== definition.participants.length) issues.push('Participants need unique, non-empty PersonIds.');
  for (const action of definition.actions) {
    if (!action.id || !Number.isInteger(action.apCost) || action.apCost < 1 || action.apCost > 6) issues.push(`Action ${action.id} AP must be 1..6.`);
    if (!['consult','observe','compare'].includes(action.family)) issues.push(`Action ${action.id} has an invalid interaction family.`);
    if (action.consultedPersonId && !definition.participants.includes(action.consultedPersonId)) issues.push(`Action ${action.id} references an unknown PersonId.`);
    if (action.discoveryIds.some((id) => !discoveryIds.has(id))) issues.push(`Action ${action.id} references an unknown discovery.`);
    if ((action.prerequisites ?? []).some((id) => !actionIds.has(id))) issues.push(`Action ${action.id} has an unknown prerequisite.`);
  }
  const reachable = new Set<string>();
  let changed = true;
  while (changed) {
    changed = false;
    for (const action of definition.actions) {
      if (reachable.has(action.id) || (action.prerequisites ?? []).some((id) => !reachable.has(id))) continue;
      reachable.add(action.id); changed = true;
    }
  }
  for (const action of definition.actions) if (!reachable.has(action.id)) issues.push(`Action ${action.id} is circular or unreachable.`);
  const ruleIds = new Set<string>();
  const conflictPriorities = new Set<string>();
  for (const rule of definition.interpretationRules) {
    if (!rule.id || ruleIds.has(rule.id)) issues.push(`Duplicate or empty interpretation rule ID: ${rule.id}.`);
    ruleIds.add(rule.id);
    if (!discoveryIds.has(String(rule.evidenceId))) issues.push(`Rule ${rule.id} references an unknown discovery.`);
    validatePredicate(rule.when, issues, discoveryIds);
    if (!['observation','inference','uncertainty','misinterpretation','professional_reminder'].includes(rule.category)) issues.push(`Rule ${rule.id} has an invalid interpretation category.`);
    const conflictKey = rule.conflictGroup ? `${rule.conflictGroup}:${rule.priority}` : '';
    if (conflictKey && conflictPriorities.has(conflictKey)) issues.push(`Conflict group ${rule.conflictGroup} has duplicate priority ${rule.priority}.`);
    if (conflictKey) conflictPriorities.add(conflictKey);
    if (!rule.text.trim() || !Number.isFinite(rule.priority) || !Number.isFinite(rule.displayOrder)) issues.push(`Rule ${rule.id} has invalid metadata.`);
  }
  return issues;
}
export const ASSIGNMENT_ACTIVITY_CATALOG = { [NORTH_BAY_ACTIVITY_ID]: northBayRoofInspection, [NORTH_BAY_POST_EXECUTION_ACTIVITY_ID]: northBayPostExecutionInspection, ...URUK_ASSIGNMENT_ACTIVITY_CATALOG } as const;

export function validateAssignmentActivityProgress(definition: AssignmentActivityDefinition, value: unknown): value is AssignmentActivityProgress {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const p = value as AssignmentActivityProgress;
  if (!Array.isArray(p.completedActionIds) || new Set(p.completedActionIds).size !== p.completedActionIds.length
    || !p.completedActionIds.every((id) => definition.actions.some((a) => a.id === id && (a.prerequisites ?? []).every((prerequisite) => p.completedActionIds.includes(prerequisite))))
    || !Array.isArray(p.discoveryIds) || new Set(p.discoveryIds).size !== p.discoveryIds.length
    || !Array.isArray(p.consultedPersonIds) || new Set(p.consultedPersonIds).size !== p.consultedPersonIds.length) return false;
  const completedActions = definition.actions.filter((a) => p.completedActionIds.includes(a.id));
  const expectedDiscoveries = [...new Set(completedActions.flatMap((a) => a.discoveryIds))].sort();
  const expectedConsulted = [...new Set(completedActions.flatMap((a) => a.consultedPersonId ? [a.consultedPersonId] : []))].sort();
  return p.discoveryIds.every((id) => definition.discoveries.some((d) => d.id === id))
    && [...p.discoveryIds].sort().join('|') === expectedDiscoveries.join('|')
    && p.consultedPersonIds.every((id) => definition.participants.includes(id))
    && [...p.consultedPersonIds].sort().join('|') === expectedConsulted.join('|')
    && !!p.draft && definition.reportSchema.findings.some((option) => option.id === p.draft.finding)
    && definition.reportSchema.responsibilityClaims.some((option) => option.id === p.draft.responsibilityClaim)
    && Array.isArray(p.draft.citedDiscoveryIds) && p.draft.citedDiscoveryIds.every((id) => p.discoveryIds.includes(id))
    && Array.isArray(p.draft.limitations) && p.draft.limitations.every((x) => typeof x === 'string')
    && Array.isArray(p.draft.recommendations) && p.draft.recommendations.every((x) => definition.reportSchema.recommendations.some((option) => option.id === x));
}
export function normalizeActivityDraft(draft: AssignmentActivityDraft): AssignmentActivityDraft {
  return { finding: draft.finding, responsibilityClaim: draft.responsibilityClaim, citedDiscoveryIds: [...new Set(draft.citedDiscoveryIds)],
    limitations: [...new Set(draft.limitations.map((x) => x.trim()).filter(Boolean))],
    recommendations: [...new Set(draft.recommendations)] };
}
