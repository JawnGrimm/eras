import { describe, expect, it } from 'vitest';
import { assignmentReportForCloseout } from '../components/ClosingReceiptScreen';
import type { AssignmentOffer } from '../state/types';

describe('Assignment closeout report summary', () => {
  it('presents authored report labels and cited discoveries instead of internal option IDs', () => {
    const offer = {
      activityId: 'activity-era1-mar-f01-door-opened',
      activityProgress: {
        completedActionIds: [],
        discoveryIds: [],
        consultedPersonIds: [],
        draft: {
          finding: 'impression_differs',
          responsibilityClaim: 'none',
          citedDiscoveryIds: ['mar01-closure-impression', 'mar01-owner-account'],
          limitations: [],
          selectedLimitationIds: ['seal_not_authority'],
          limitationNotes: 'No authorization copy was brought.',
          recommendations: ['check_inventory'],
        },
      },
    } as unknown as AssignmentOffer;
    expect(assignmentReportForCloseout(offer)).toEqual({
      finding: 'The present impression differs from the household’s known sealing',
      responsibility: 'No accusation or individual fault assigned',
      citedDiscoveries: ['Present closure impression', 'Sealing owner’s account'],
      limitations: [
        'The household recognizes the seal, but still needs to ask whether the person who showed it was sent',
        'No authorization copy was brought.',
      ],
      recommendations: ['Order an inventory check before further conclusions'],
    });
  });

  it('returns no fabricated report when the Assignment has no authored activity or saved draft', () => {
    expect(assignmentReportForCloseout(undefined)).toBeNull();
    expect(assignmentReportForCloseout({ title: 'Legacy', activityId: 'missing' } as unknown as AssignmentOffer)).toBeNull();
  });
});
