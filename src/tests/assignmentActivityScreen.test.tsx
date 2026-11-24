import { describe, expect, it } from 'vitest';
import { responsibilityClaimPreviewLabel } from '../components/AssignmentActivityScreen';

describe('authored responsibility-claim preview', () => {
  const options = [
    { id: 'none', label: 'No individual responsibility assigned' },
    { id: 'dudu', label: 'Attributes unresolved work to Dudu' },
    { id: 'carrier_blame', label: 'Assign the discrepancy to the carrier' },
  ];

  it('uses authored labels for default and non-default claim selections', () => {
    expect(responsibilityClaimPreviewLabel(options, 'none')).toBe('No individual responsibility assigned');
    expect(responsibilityClaimPreviewLabel(options, 'carrier_blame')).toBe('Assign the discrepancy to the carrier');
  });
});
