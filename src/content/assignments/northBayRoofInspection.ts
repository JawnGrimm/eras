import type { AttributeId, PersonId, SkillId } from '../../state/ids';
import type { AssignmentActivityDraft, AssignmentActivityProgress } from '../../state/types';
import type { InterpretationRule, Predicate } from '../../works/evidenceInterpretation';

export const NORTH_BAY_ACTIVITY_ID = 'activity-north-bay-roof-inspection';
export const NORTH_BAY_ASSIGNMENT_ID = 'assignment-north-bay-roof-inspection' as import('../../state/ids').AssignmentId;
export const NORTH_BAY_PEOPLE = {
  steward: 'person-ur-nanna' as PersonId,
  repairer: 'person-dudu' as PersonId,
  receivingOfficial: 'person-utu-mansum' as PersonId,
  seniorScribe: 'person-shuruppak-ilu' as PersonId,
};
export const NORTH_BAY_LOCATION_ID = 'location-uruk-temple-storehouse' as import('../../state/ids').LocationId;
export const NORTH_BAY_DISCOVERIES = [
  { id: 'steward-briefing', title: 'Steward’s account', text: 'Ur-Nanna reports that the north bay leaked during the storm, that a repairer was hired, and that seven held sacks remain segregated below.' },
  { id: 'repairer-scope', title: 'Repairer’s account', text: 'Dudu states that he patched and replastered the mid-bay break. Clearing the parapet runoff channel and replacing damp beam-ends were not included in the fee.' },
  { id: 'roof-inspection', title: 'Physical inspection', text: 'The mid-bay patch is intact. The north parapet runoff channel remains clogged with washed reeds and cracked plaster. The north-east beam socket is damp within the shaded wall joint. Seven sacks remain segregated on dry reed matting; their contents have not been tested.' },
  { id: 'intake-boundary', title: 'Original intake boundary', text: 'Utu-mansum can attest that the original intake inspection recorded 56 usable and 4 held measures. He was not present for the storm or subsequent repair.' },
  { id: 'scope-comparison', title: 'Repair scope comparison', text: 'The Steward’s maintenance note describes the bay as repaired; Dudu’s account limits the paid work to the mid-bay patch. The accounts differ in scope, not necessarily in whether Dudu completed his contracted work.' },
] as const;

export interface AssignmentActivityActionDefinition {
  id: string; family: 'consult' | 'observe' | 'compare'; label: string; description: string;
  apCost: number; prerequisites?: string[]; discoveryIds: string[]; consultedPersonId?: PersonId;
}
export interface AssignmentActivityDefinition {
  id: string; title: string; submissionApCost: number; participants: PersonId[];
  actions: AssignmentActivityActionDefinition[]; discoveries: typeof NORTH_BAY_DISCOVERIES[number][];
  interpretationRules: InterpretationRule[];
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
  createInitialProgress: () => ({ completedActionIds: [], discoveryIds: [], consultedPersonIds: [], draft: {
    finding: 'insufficient_evidence', responsibilityClaim: 'none', citedDiscoveryIds: [], limitations: [], recommendations: [],
  } }),
};

function validatePredicate(predicate: Predicate, issues: string[]): void {
  const skills: SkillId[] = ['reading_scripts','recordkeeping_accounts','analysis_research','writing_composition','administration_procedure','communication_instruction'];
  const attributes: AttributeId[] = ['precision','perception','reasoning','expression','endurance','composure'];
  if (predicate.kind === 'all' || predicate.kind === 'any') {
    if (!predicate.predicates.length) issues.push('Empty predicate group.');
    predicate.predicates.forEach((child) => validatePredicate(child, issues));
  } else if (predicate.kind === 'not') validatePredicate(predicate.predicate, issues);
  else if (predicate.kind === 'skillAtLeast' || predicate.kind === 'skillAtMost') {
    if (!skills.includes(predicate.skillId) || !Number.isInteger(predicate.level) || predicate.level < 1 || predicate.level > 10) issues.push('Invalid SkillId or skill threshold.');
  } else if (predicate.kind === 'attributeAtLeast' || predicate.kind === 'attributeAtMost') {
    if (!attributes.includes(predicate.attributeId) || !Number.isFinite(predicate.value)) issues.push('Invalid AttributeId or attribute threshold.');
  } else if (predicate.kind === 'examinedAll' || predicate.kind === 'examinedNone') {
    if (!predicate.evidenceIds.length) issues.push('Empty discovery predicate.');
  }
}
export function validateAssignmentActivityDefinition(definition: AssignmentActivityDefinition): string[] {
  const issues: string[] = [];
  const actionIds = new Set(definition.actions.map((action) => action.id));
  const discoveryIds = new Set(definition.discoveries.map((item) => item.id));
  if (actionIds.size !== definition.actions.length) issues.push('Action IDs must be unique.');
  if (discoveryIds.size !== definition.discoveries.length) issues.push('Discovery IDs must be unique.');
  if (!definition.id || !definition.title || !Number.isInteger(definition.submissionApCost) || definition.submissionApCost < 1 || definition.submissionApCost > 6) issues.push('Activity identity and submission AP (1..6) are required.');
  if (definition.participants.some((id) => typeof id !== 'string' || !id.trim())) issues.push('Every participant needs a PersonId.');
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
  for (const rule of definition.interpretationRules) {
    if (!rule.id || ruleIds.has(rule.id)) issues.push(`Duplicate or empty interpretation rule ID: ${rule.id}.`);
    ruleIds.add(rule.id);
    if (!discoveryIds.has(String(rule.evidenceId))) issues.push(`Rule ${rule.id} references an unknown discovery.`);
    validatePredicate(rule.when, issues);
    if (!rule.text.trim() || !Number.isFinite(rule.priority) || !Number.isFinite(rule.displayOrder)) issues.push(`Rule ${rule.id} has invalid metadata.`);
  }
  return issues;
}
export function validateAssignmentActivityProgress(definition: AssignmentActivityDefinition, value: unknown): value is AssignmentActivityProgress {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const p = value as AssignmentActivityProgress;
  return Array.isArray(p.completedActionIds) && new Set(p.completedActionIds).size === p.completedActionIds.length
    && p.completedActionIds.every((id) => definition.actions.some((a) => a.id === id && (a.prerequisites ?? []).every((prerequisite) => p.completedActionIds.includes(prerequisite))))
    && Array.isArray(p.discoveryIds) && new Set(p.discoveryIds).size === p.discoveryIds.length
    && p.discoveryIds.every((id) => definition.discoveries.some((d) => d.id === id))
    && definition.actions.filter((a) => p.completedActionIds.includes(a.id)).every((a) => a.discoveryIds.every((id) => p.discoveryIds.includes(id)))
    && Array.isArray(p.consultedPersonIds) && p.consultedPersonIds.every((id) => definition.participants.includes(id))
    && !!p.draft && ['repair_incomplete','repair_appears_sound','insufficient_evidence'].includes(p.draft.finding)
    && ['none','dudu'].includes(p.draft.responsibilityClaim)
    && Array.isArray(p.draft.citedDiscoveryIds) && p.draft.citedDiscoveryIds.every((id) => p.discoveryIds.includes(id))
    && Array.isArray(p.draft.limitations) && p.draft.limitations.every((x) => typeof x === 'string')
    && Array.isArray(p.draft.recommendations) && p.draft.recommendations.every((x) => ['clear_parapet','assess_beam','inspect_held_barley','monitor_repair'].includes(x));
}
export function normalizeActivityDraft(draft: AssignmentActivityDraft): AssignmentActivityDraft {
  return { finding: draft.finding, responsibilityClaim: draft.responsibilityClaim, citedDiscoveryIds: [...new Set(draft.citedDiscoveryIds)],
    limitations: [...new Set(draft.limitations.map((x) => x.trim()).filter(Boolean))],
    recommendations: [...new Set(draft.recommendations)] };
}
