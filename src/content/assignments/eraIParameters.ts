/** Era I Assignment economy and pacing parameters for Playtest 1.
 * These values are provisional and intentionally isolated from the era-agnostic engine.
 */
export const ERA_I_ASSIGNMENT_PARAMETERS = {
  version: 'era1-assignment-playtest1-v1',
  status: 'provisional' as const,
  tierA: {
    currency: 10,
    baseCareerXp: 12,
    defaultProvisions: 0,
    estimatedTotalAp: {
      'ERA1-COM-01': 5,
      'ERA1-COM-02': 4,
      'ERA1-CIV-01': 4,
      'ERA1-CIV-02': 5,
      'ERA1-REL-01': 4,
    },
  },
  tierB: {
    currency: 5,
    baseCareerXp: 6,
    defaultProvisions: 0,
    estimatedTotalAp: {
      heldBarley: 3,
      southCourtDelivery: 3,
      southLoadingAwning: 3,
    },
  },
  explicitProvisionContract: {
    provisions: 1,
    disclosureRequired: true,
  },
  supply: {
    softTargetApPerWorkday: 8,
    hardDailyOfferCap: null,
    universalCooldown: null,
  },
} as const;
