import { describe, expect, it } from 'vitest';
import type { EventId, KnowledgeEntryId, PersonId } from './ids';
import type { KnowledgeEntry } from './types';
import { deriveKnowledgeStatus, resolveRememberedTendencyCues } from './knowledgeRecall';

const holder = 'person-scribe' as PersonId;
const subject = 'person-estimator' as PersonId;

function tendency(id: string, status?: 'verified' | 'contradicted' | 'obsolete'): KnowledgeEntry {
  return {
    id: id as KnowledgeEntryId,
    holder: { kind: 'person', id: holder },
    subject: { kind: 'event', id: 'event-estimate-review' as EventId },
    basis: 'direct-involvement',
    learnedDay: 2,
    assertion: {
      kind: 'remembered_tendency',
      text: 'Previous grain estimates in this context have tended to run high.',
      aboutPersonId: subject,
      situationKey: 'grain-quantity-estimate',
    },
    assessments: status ? [{
      status, dayNumber: 3,
      source: { kind: 'event', id: 'event-estimate-review' as EventId },
      rationale: 'A later comparison assessed the remembered observation.',
    }] : [],
  };
}

describe('remembered tendency cue resolution', () => {
  it('returns relevant memory independently of the current estimate outcome', () => {
    const cues = resolveRememberedTendencyCues(
      { verified: tendency('knowledge-verified', 'verified') }, holder, subject, 'grain-quantity-estimate',
    );
    expect(cues).toHaveLength(1);
    expect(cues[0]).toMatchObject({ assertion: 'Previous grain estimates in this context have tended to run high.', status: 'verified' });
  });

  it('does not suppress contradicted or obsolete memories; it labels their latest status', () => {
    const contradicted = tendency('knowledge-contradicted', 'contradicted');
    const obsolete = tendency('knowledge-obsolete', 'obsolete');
    expect(deriveKnowledgeStatus(contradicted)).toBe('contradicted');
    expect(resolveRememberedTendencyCues({ contradicted, obsolete }, holder, subject, 'grain-quantity-estimate')
      .map((cue) => cue.status)).toEqual(['contradicted','obsolete']);
  });

  it('does not expose legacy source-access references or unrelated situations', () => {
    const legacy: KnowledgeEntry = {
      id: 'knowledge-legacy' as KnowledgeEntryId,
      holder: { kind: 'person', id: holder },
      subject: { kind: 'event', id: 'event-estimate-review' as EventId },
      basis: 'received-copy', learnedDay: 1, legacy: true,
    };
    const base = tendency('knowledge-unrelated');
    const unrelated: KnowledgeEntry = {
      ...base, assertion: { ...base.assertion!, situationKey: 'other-situation' },
    };
    expect(resolveRememberedTendencyCues({ legacy, unrelated }, holder, subject, 'grain-quantity-estimate')).toEqual([]);
  });
});
