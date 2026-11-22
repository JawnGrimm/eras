import type { EvidenceId, WorkId, SkillId, AttributeId } from '../state/ids';
import type { ScribalCharacterState } from '../state/types';
import type { InterpretationRule, Predicate } from './evidenceInterpretation';

export interface WorkEvidenceDefinition {
  id: EvidenceId;
  title: string;
  source: string;
  objectiveText: string;
}
export interface WorkActionDefinition {
  id: string;
  apCost: number;
  prerequisites?: string[];
  grantsEvidence?: EvidenceId[];
  autoExamine?: boolean;
}
export interface WorkSubmissionContext<TProgress> {
  progress: TProgress;
  character: ScribalCharacterState;
}
export interface WorkAssessment {
  outcome: 'accepted' | 'revise' | 'rejected';
  summary: string;
}
export interface WorkDefinition<TProgress extends Record<string, unknown> = Record<string, unknown>> {
  id: WorkId;
  title: string;
  startingEvidence: EvidenceId[];
  evidence: WorkEvidenceDefinition[];
  actions: WorkActionDefinition[];
  interpretationRules: InterpretationRule[];
  historicalXpReward: number;
  submissionApCost?: number;
  createInitialProgress(): TProgress;
  provisionsContract?: { provisionsPerQualifiedWorkday: number; minimumWorkApPerDay: number };
  validateScenarioData(value: unknown): value is TProgress;
  evaluateSubmission(context: WorkSubmissionContext<TProgress>): unknown;
  assessSubmission(submission: unknown, context: WorkSubmissionContext<TProgress>): WorkAssessment;
  recover(context: WorkSubmissionContext<TProgress>, assessment: WorkAssessment): TProgress;
}
export function defineWork<TProgress extends Record<string, unknown>>(definition: WorkDefinition<TProgress>): WorkDefinition<TProgress> {
  return definition;
}

export interface WorkValidationIssue { code: string; message: string; }
const SKILLS: readonly SkillId[] = ['reading_scripts','recordkeeping_accounts','analysis_research','writing_composition','administration_procedure','communication_instruction'];
const ATTRIBUTES: readonly AttributeId[] = ['precision','perception','reasoning','expression','endurance','composure'];

function validatePredicate(predicate: Predicate, issues: WorkValidationIssue[]): void {
  switch (predicate.kind) {
    case 'all':
    case 'any':
      if (!predicate.predicates.length) issues.push({ code: 'empty-predicate-group', message: `${predicate.kind} groups must contain at least one predicate.` });
      predicate.predicates.forEach((child) => validatePredicate(child, issues));
      break;
    case 'not': validatePredicate(predicate.predicate, issues); break;
    case 'skillAtLeast':
    case 'skillAtMost':
      if (!SKILLS.includes(predicate.skillId)) issues.push({ code: 'unknown-skill', message: `Unknown skill ID: ${predicate.skillId}.` });
      if (!Number.isInteger(predicate.level) || predicate.level < 1 || predicate.level > 10) issues.push({ code: 'invalid-skill-threshold', message: `Skill threshold for ${predicate.skillId} must be an integer from 1 to 10.` });
      break;
    case 'attributeAtLeast':
    case 'attributeAtMost':
      if (!ATTRIBUTES.includes(predicate.attributeId)) issues.push({ code: 'unknown-attribute', message: `Unknown attribute ID: ${predicate.attributeId}.` });
      if (!Number.isFinite(predicate.value)) issues.push({ code: 'invalid-attribute-threshold', message: `Attribute threshold for ${predicate.attributeId} must be finite.` });
      break;
    case 'examinedAll':
    case 'examinedNone':
      if (!predicate.evidenceIds.length) issues.push({ code: 'empty-evidence-group', message: `${predicate.kind} must reference at least one evidence item.` });
      break;
    case 'hasTrait':
    case 'hasCondition':
    case 'hasEquipment': break;
  }
}

export function validateWorkDefinition<TProgress extends Record<string, unknown>>(work: WorkDefinition<TProgress>): WorkValidationIssue[] {
  const issues: WorkValidationIssue[] = [];
  const evidenceIds = new Set(work.evidence.map((item) => item.id));
  if (evidenceIds.size !== work.evidence.length) issues.push({ code: 'duplicate-evidence-id', message: 'Evidence IDs must be unique within a Work.' });
  if (!Number.isFinite(work.historicalXpReward) || work.historicalXpReward < 0) issues.push({ code: 'invalid-historical-xp-reward', message: 'Historical XP reward must be finite and non-negative.' });
  if (work.submissionApCost !== undefined && (!Number.isInteger(work.submissionApCost) || work.submissionApCost < 0 || work.submissionApCost > 6)) {
    issues.push({ code: 'invalid-submission-ap-cost', message: 'Submission AP cost must be an integer from 0 to 6.' });
  }
  if (work.provisionsContract && (!Number.isInteger(work.provisionsContract.provisionsPerQualifiedWorkday)
    || work.provisionsContract.provisionsPerQualifiedWorkday < 0
    || !Number.isInteger(work.provisionsContract.minimumWorkApPerDay)
    || work.provisionsContract.minimumWorkApPerDay < 1 || work.provisionsContract.minimumWorkApPerDay > 6)) {
    issues.push({ code: 'invalid-provisions-contract', message: 'Work provision contract values are invalid.' });
  }
  const reachable = new Set<EvidenceId>(work.startingEvidence);
  const actionIds = new Set(work.actions.map((action) => action.id));
  if (actionIds.size !== work.actions.length) issues.push({ code: 'duplicate-action-id', message: 'Work action IDs must be unique.' });
  const duplicateRuleIds = new Set<string>();
  const conflictPriorities = new Set<string>();
  if (!String(work.id).trim()) issues.push({ code: 'empty-work-id', message: 'Work ID must not be empty.' });
  if (!work.title.trim()) issues.push({ code: 'empty-work-title', message: 'Work title must not be empty.' });
  for (const evidence of work.evidence) {
    if (!evidence.title.trim() || !evidence.source.trim() || !evidence.objectiveText.trim()) {
      issues.push({ code: 'empty-evidence-text', message: `Evidence ${evidence.id} has empty source or text.` });
    }
  }
  for (const id of work.startingEvidence) if (!evidenceIds.has(id)) issues.push({ code: 'unknown-starting-evidence', message: `Starting packet references missing evidence ${id}.` });
  for (const action of work.actions) {
    if (!action.id.trim() || !Number.isInteger(action.apCost) || action.apCost < 0 || action.apCost > 6) {
      issues.push({ code: 'invalid-work-action', message: `Action ${action.id} needs an ID and an integer AP cost from 0 to 6.` });
    }
    for (const prerequisite of action.prerequisites ?? []) if (!actionIds.has(prerequisite)) {
      issues.push({ code: 'unknown-action-prerequisite', message: `Action ${action.id} requires missing action ${prerequisite}.` });
    }
  }
  // Reachability is a fixed point over declared action prerequisites, not custom evaluator code.
  const completedActions = new Set<string>();
  let changed = true;
  while (changed) {
    changed = false;
    for (const action of work.actions) {
      if (completedActions.has(action.id) || (action.prerequisites ?? []).some((id) => !completedActions.has(id))) continue;
      completedActions.add(action.id);
      for (const evidenceId of action.grantsEvidence ?? []) reachable.add(evidenceId);
      changed = true;
    }
  }
  for (const action of work.actions) for (const id of action.grantsEvidence ?? []) {
    if (!evidenceIds.has(id)) issues.push({ code: 'unknown-granted-evidence', message: `Action ${action.id} grants missing evidence ${id}.` });
  }
  for (const action of work.actions) if (!completedActions.has(action.id)) {
    issues.push({ code: 'unreachable-action', message: `Action ${action.id} is unreachable through its declared prerequisites (possibly cyclic).` });
  }
  for (const rule of work.interpretationRules) {
    if (duplicateRuleIds.has(rule.id)) issues.push({ code: 'duplicate-rule-id', message: `Duplicate interpretation rule ID: ${rule.id}.` });
    duplicateRuleIds.add(rule.id);
    if (!rule.id.trim() || !rule.text.trim()) issues.push({ code: 'empty-rule-text', message: `Rule ${rule.id || '(unnamed)'} must have non-empty ID and text.` });
    if (!['observation','inference','uncertainty','misinterpretation','professional_reminder'].includes(rule.category)
      || !Number.isFinite(rule.priority) || !Number.isFinite(rule.displayOrder)) {
      issues.push({ code: 'invalid-rule-metadata', message: `Rule ${rule.id} has invalid category, priority, or display order metadata.` });
    }
    if (!evidenceIds.has(rule.evidenceId)) issues.push({ code: 'unknown-rule-evidence', message: `Rule ${rule.id} references missing evidence ${rule.evidenceId}.` });
    else if (!reachable.has(rule.evidenceId)) issues.push({ code: 'unreachable-rule-evidence', message: `Rule ${rule.id} references evidence ${rule.evidenceId}, which is never in the starting packet or granted by a reachable action.` });
    validatePredicate(rule.when, issues);
    const key = rule.conflictGroup ? `${rule.conflictGroup}:${rule.priority}` : '';
    if (key && conflictPriorities.has(key)) issues.push({ code: 'conflict-priority-tie', message: `Conflict group ${rule.conflictGroup} has multiple rules at priority ${rule.priority}.` });
    if (key) conflictPriorities.add(key);
  }
  const checkEvidenceRefs = (predicate: Predicate): void => {
    if (predicate.kind === 'examinedAll' || predicate.kind === 'examinedNone') {
      for (const id of predicate.evidenceIds) {
        if (!evidenceIds.has(id)) issues.push({ code: 'unknown-predicate-evidence', message: `Predicate references missing evidence ${id}.` });
        else if (!reachable.has(id)) issues.push({ code: 'unreachable-predicate-evidence', message: `Predicate references unreachable evidence ${id}.` });
      }
    } else if (predicate.kind === 'all' || predicate.kind === 'any') predicate.predicates.forEach(checkEvidenceRefs);
    else if (predicate.kind === 'not') checkEvidenceRefs(predicate.predicate);
  };
  work.interpretationRules.forEach((rule) => checkEvidenceRefs(rule.when));
  return issues;
}
