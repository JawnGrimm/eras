import type { PersonId } from './ids';
import type { KnowledgeEntry } from './types';

export type KnowledgeStatus = 'unassessed' | 'verified' | 'contradicted' | 'obsolete';

export function deriveKnowledgeStatus(entry: KnowledgeEntry): KnowledgeStatus {
  return entry.assessments?.at(-1)?.status ?? 'unassessed';
}

export interface RememberedTendencyCue {
  knowledgeId: KnowledgeEntry['id'];
  assertion: string;
  status: KnowledgeStatus;
  learnedDay: number;
  source: KnowledgeEntry['subject'];
}

/**
 * Resolve relevant remembered tendencies before evaluating a current estimate.
 * The result deliberately does not accept the estimate or its outcome, and it
 * retains contradicted/obsolete memories with their status instead of hiding them.
 */
export function resolveRememberedTendencyCues(
  knowledge: Readonly<Record<string, KnowledgeEntry>>,
  holderPersonId: PersonId,
  aboutPersonId: PersonId,
  situationKey: string,
): RememberedTendencyCue[] {
  return Object.values(knowledge)
    .filter((entry) => entry.legacy !== true
      && entry.holder.kind === 'person' && entry.holder.id === holderPersonId
      && entry.assertion?.kind === 'remembered_tendency'
      && entry.assertion.aboutPersonId === aboutPersonId
      && entry.assertion.situationKey === situationKey)
    .sort((a, b) => a.learnedDay - b.learnedDay || String(a.id).localeCompare(String(b.id)))
    .map((entry) => ({
      knowledgeId: entry.id,
      assertion: entry.assertion!.text,
      status: deriveKnowledgeStatus(entry),
      learnedDay: entry.learnedDay,
      source: entry.subject,
    }));
}
