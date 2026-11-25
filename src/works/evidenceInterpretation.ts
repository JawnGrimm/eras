import type { AttributeId, EvidenceId, SkillId } from '../state/ids';
import type { ScribalCharacterState } from '../state/types';

export type Predicate =
  | { kind: 'all'; predicates: Predicate[] }
  | { kind: 'any'; predicates: Predicate[] }
  | { kind: 'not'; predicate: Predicate }
  | { kind: 'skillAtLeast'; skillId: SkillId; level: number }
  | { kind: 'skillAtMost'; skillId: SkillId; level: number }
  | { kind: 'attributeAtLeast'; attributeId: AttributeId; value: number }
  | { kind: 'attributeAtMost'; attributeId: AttributeId; value: number }
  | { kind: 'hasTrait'; traitId: string }
  | { kind: 'hasCondition'; conditionId: string }
  | { kind: 'hasEquipment'; equipmentId: string }
  | { kind: 'examinedAll'; evidenceIds: EvidenceId[] }
  | { kind: 'examinedNone'; evidenceIds: EvidenceId[] };

export type InterpretationCategory = 'observation' | 'inference' | 'uncertainty' | 'misinterpretation' | 'professional_reminder';
export interface InterpretationRule {
  id: string;
  evidenceId: EvidenceId;
  when: Predicate;
  text: string;
  category: InterpretationCategory;
  priority: number;
  conflictGroup?: string;
  displayOrder: number;
}
export interface InterpretationAnnotation {
  id: string;
  evidenceId: EvidenceId;
  text: string;
  displayOrder: number;
}
export interface EvaluateEvidenceInterpretationInput {
  evidenceId: EvidenceId;
  character: ScribalCharacterState;
  examinedEvidence: readonly EvidenceId[];
  rules: readonly InterpretationRule[];
}

function matches(predicate: Predicate, character: ScribalCharacterState, examined: ReadonlySet<EvidenceId>): boolean {
  switch (predicate.kind) {
    case 'all': return predicate.predicates.length > 0 && predicate.predicates.every((p) => matches(p, character, examined));
    case 'any': return predicate.predicates.length > 0 && predicate.predicates.some((p) => matches(p, character, examined));
    case 'not': return !matches(predicate.predicate, character, examined);
    case 'skillAtLeast': {
      const level = character.skills[predicate.skillId]?.level;
      return typeof level === 'number' && Number.isFinite(level) && level >= predicate.level;
    }
    case 'skillAtMost': {
      const level = character.skills[predicate.skillId]?.level;
      return typeof level === 'number' && Number.isFinite(level) && level <= predicate.level;
    }
    case 'attributeAtLeast': {
      const value = character.attributes[predicate.attributeId];
      return typeof value === 'number' && Number.isFinite(value) && value >= predicate.value;
    }
    case 'attributeAtMost': {
      const value = character.attributes[predicate.attributeId];
      return typeof value === 'number' && Number.isFinite(value) && value <= predicate.value;
    }
    case 'hasTrait': return character.traits.some((trait) => trait.id === predicate.traitId);
    case 'hasCondition': return character.conditions.some((condition) => condition.id === predicate.conditionId);
    case 'hasEquipment': return character.equipment.includes(predicate.equipmentId);
    case 'examinedAll': return predicate.evidenceIds.every((id) => examined.has(id));
    case 'examinedNone': return predicate.evidenceIds.every((id) => !examined.has(id));
  }
}

/** Deterministic character predicate evaluation for authored qualification contracts. */
export function evaluateCharacterPredicate(predicate: Predicate, character: ScribalCharacterState): boolean {
  return matches(predicate, character, new Set<EvidenceId>());
}

/** Pure interpretation only: objective evidence/source text is never modified or filtered. */
export function evaluateEvidenceInterpretation(input: EvaluateEvidenceInterpretationInput): InterpretationAnnotation[] {
  const examined = new Set(input.examinedEvidence);
  if (!examined.has(input.evidenceId)) return [];
  const matchesForEvidence = input.rules.filter((rule) =>
    rule.evidenceId === input.evidenceId && matches(rule.when, input.character, examined));
  const winners = new Map<string, InterpretationRule>();
  const ungrouped: InterpretationRule[] = [];
  for (const rule of matchesForEvidence) {
    if (!rule.conflictGroup) { ungrouped.push(rule); continue; }
    const current = winners.get(rule.conflictGroup);
    if (!current || rule.priority > current.priority || (rule.priority === current.priority && rule.id < current.id)) {
      winners.set(rule.conflictGroup, rule);
    }
  }
  return [...ungrouped, ...winners.values()]
    .sort((a, b) => a.displayOrder - b.displayOrder || b.priority - a.priority || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .map(({ id, evidenceId, text, displayOrder }) => ({ id, evidenceId, text, displayOrder }));
}
