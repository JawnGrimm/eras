import type { PersonId } from '../../state/ids';
import type { AssignmentActivityDefinition } from './northBayRoofInspection';

const people = {
  steward: 'person-ur-nanna' as PersonId,
  receiver: 'person-utu-mansum' as PersonId,
  senior: 'person-shuruppak-ilu' as PersonId,
  carrier: 'person-enlil-kisu' as PersonId,
  repairer: 'person-dudu' as PersonId,
};

function activity(
  definition: Omit<AssignmentActivityDefinition, 'createInitialProgress'>,
): AssignmentActivityDefinition {
  return {
    ...definition,
    createInitialProgress: () => ({
      completedActionIds: [],
      discoveryIds: [],
      consultedPersonIds: [],
      draft: {
        finding: definition.reportSchema.findings[0].id,
        responsibilityClaim: definition.reportSchema.responsibilityClaims[0].id,
        citedDiscoveryIds: [],
        limitations: [],
        recommendations: [],
      },
    }),
  };
}

/**
 * These activities deliberately keep capacity records, physical containers,
 * and the condition of the grain as separate evidentiary layers.
 */
export const heldBarleyInspection = activity({
  id: 'activity-held-barley-inspection',
  title: 'Held-Barley Inspection',
  submissionApCost: 1,
  participants: [people.steward, people.receiver, people.senior],
  discoveries: [
    { id: 'held-steward-briefing', title: 'Steward’s custody briefing', text: 'Ur-Nanna confirms that seven capacity measures of barley remain held in the Temple Storehouse after the north-bay leak. He requests a finding and recommendation; he retains authority over ordinary stock custody and release.' },
    { id: 'held-container-observation', title: 'Seven physical sacks on reed matting', text: 'The seven held capacity measures are physically contained in seven sacks segregated on reed matting. Two sacks show exterior damp-staining and crusting. Five sacks are surface-dry. This observation describes the containers only; it does not establish the condition of grain inside any sack.' },
    { id: 'held-intake-record', title: 'Original intake measure record', text: 'The immutable intake record ev-04 records 4 capacity measures held at intake. It does not record a physical sack count.' },
    { id: 'held-recount-record', title: 'Current recount measure record', text: 'The immutable recount record ev-07 records 7 capacity measures held at recount. It does not record a physical sack count.' },
    { id: 'held-senior-authority', title: 'Senior Scribe’s authority', text: 'Shuruppak-ilu confirms that the scribe may record findings and recommend disposition. Formal release authority belongs to Steward Ur-Nanna or Senior Scribe Shuruppak-ilu; this report itself is not a release order.' },
  ],
  actions: [
    { id: 'held-consult-steward', family: 'consult', label: 'Consult Ur-Nanna', description: 'Establish custody, urgency, and the requested report.', apCost: 1, discoveryIds: ['held-steward-briefing'], consultedPersonId: people.steward },
    { id: 'held-inspect-sacks', family: 'observe', label: 'Inspect the seven sacks', description: 'Observe the container exteriors and their segregation on reed matting.', apCost: 2, prerequisites: ['held-consult-steward'], discoveryIds: ['held-container-observation'] },
    { id: 'held-compare-measures', family: 'compare', label: 'Compare intake and recount', description: 'Keep the capacity-measure records distinct from the physical sack observation.', apCost: 1, discoveryIds: ['held-intake-record','held-recount-record'] },
    { id: 'held-consult-authority', family: 'consult', label: 'Consult Shuruppak-ilu', description: 'Clarify the boundary between a scribal recommendation and an authorized release.', apCost: 1, discoveryIds: ['held-senior-authority'], consultedPersonId: people.senior },
  ],
  interpretationRules: [],
  reportSchema: {
    title: 'Held-stock finding and recommendation',
    responsibilityLabel: 'Responsibility claim',
    findings: [
      { id: 'surface_condition_only', label: 'Exterior condition observed; grain untested' },
      { id: 'qualified_incomplete', label: 'Qualified finding; further examination required' },
      { id: 'grain_certified_sound', label: 'Certify grain sound without sampling' },
    ],
    responsibilityClaims: [
      { id: 'none', label: 'No individual responsibility assigned' },
      { id: 'roof_leak_cause', label: 'Attribute all internal damage to the roof leak' },
    ],
    recommendations: [
      { id: 'release_five_retain_two', label: 'Recommend release of 5 surface-dry sacks; retain 2 stained sacks for authorized sampling or cleaning' },
      { id: 'retain_all_sample', label: 'Recommend retaining all 7 sacks pending authorized sampling' },
      { id: 'release_all', label: 'Recommend release of all 7 sacks' },
    ],
    limitationsLabel: 'Unverified condition and authority limits',
  },
  submissionNote: 'The report is a finding and recommendation, not an executive release order. Sampling/coring or opening a sack is required to establish internal grain condition.',
});

export const southCourtDeliveryReconciliation = activity({
  id: 'activity-south-court-delivery-reconciliation',
  title: 'South-Court Delivery Reconciliation',
  submissionApCost: 1,
  participants: [people.steward, people.receiver, people.senior, people.carrier],
  discoveries: [
    { id: 'delivery-dispatch-copy', title: 'Dispatch tablet', text: 'The surviving dispatch copy, attributed to Carrier Foreman Enlil-kisu, records 24 standard capacity measures dispatched from the canal-side holding yard to the Temple Storehouse receiving court.' },
    { id: 'delivery-arrival-tally', title: 'Receiving tally', text: 'Utu-mansum records 23 standard capacity measures physically counted at the Temple Storehouse receiving court. The records establish a one-measure discrepancy at intake, not its cause.' },
    { id: 'delivery-utu-testimony', title: 'Receiving official’s testimony', text: 'Utu-mansum confirms that 23 measures crossed the receiving threshold. He did not witness loading at the origin and cannot account for the difference before arrival.' },
    { id: 'delivery-enlil-testimony', title: 'Carrier foreman’s testimony', text: 'Enlil-kisu confirms responsibility for the dispatch tablet and says the crew handed the barge over at the receiving court. His account does not independently establish the quantity unloaded or the point at which the one-measure discrepancy arose.' },
    { id: 'delivery-route-inspection', title: 'Route and handling inspection', text: 'A route inspection may identify handling conditions, but without a witnessed loss or additional record it cannot determine whether the difference was a dispatch miscount, transit loss, carrier ration, or dock spill.' },
  ],
  actions: [
    { id: 'delivery-compare-tablets', family: 'compare', label: 'Compare dispatch and receipt', description: 'Set the two recorded quantities beside one another.', apCost: 1, discoveryIds: ['delivery-dispatch-copy','delivery-arrival-tally'] },
    { id: 'delivery-consult-utu', family: 'consult', label: 'Consult Utu-mansum', description: 'Establish what physically crossed the receiving threshold.', apCost: 1, discoveryIds: ['delivery-utu-testimony'], consultedPersonId: people.receiver },
    { id: 'delivery-consult-enlil', family: 'consult', label: 'Consult Enlil-kisu', description: 'Hear the carrier foreman’s account of dispatch and handover.', apCost: 1, discoveryIds: ['delivery-enlil-testimony'], consultedPersonId: people.carrier },
    { id: 'delivery-inspect-route', family: 'observe', label: 'Inspect route and handling points', description: 'Check the available route and handling evidence without presuming a culprit.', apCost: 1, discoveryIds: ['delivery-route-inspection'] },
  ],
  interpretationRules: [],
  reportSchema: {
    title: 'Delivery reconciliation report',
    responsibilityLabel: 'Responsibility claim',
    findings: [
      { id: 'unlocated_discrepancy', label: 'One-measure discrepancy; cause unlocated' },
      { id: 'qualified_incomplete', label: 'Qualified report; further records requested' },
      { id: 'blame_carrier', label: 'Attribute the missing measure to Enlil-kisu' },
    ],
    responsibilityClaims: [
      { id: 'none', label: 'No individual responsibility assigned' },
      { id: 'enlil_kisu', label: 'Assign responsibility to Enlil-kisu' },
    ],
    recommendations: [
      { id: 'retain_both_request_origin', label: 'Retain both figures and request the origin copy or a further recount' },
      { id: 'close_qualified', label: 'Close at 23 received with the 24 dispatched figure preserved as a qualification' },
      { id: 'inspect_route', label: 'Request further route and handling inspection' },
    ],
    limitationsLabel: 'Unresolved cause and source limitations',
  },
  submissionNote: 'The report records a discrepancy, not theft or negligence. A neutral unlocated discrepancy preserves the distinction between dispatch and receipt.',
});

export const southLoadingAwningInspection = activity({
  id: 'activity-south-loading-awning-inspection',
  title: 'South Loading-Awning Inspection',
  submissionApCost: 1,
  participants: [people.steward, people.senior, people.repairer],
  discoveries: [
    { id: 'awning-steward-request', title: 'Steward’s inspection request', text: 'Ur-Nanna requests a condition report on the south loading awning before further loading. The assignment is inspection only; it does not authorize repair.' },
    { id: 'awning-physical-observation', title: 'Awning and support observations', text: 'Two reed ties are visibly frayed. The two inspected support posts remain upright, with no visible splitting at their bases. Water is pooled beside the threshold; the cause of pooling and the full structural condition are not established.' },
    { id: 'awning-repair-scope', title: 'Repairer’s contract boundary', text: 'Dudu confirms that his existing contract covered the north-bay mid-bay patch only. It did not commission work on the south loading awning.' },
  ],
  actions: [
    { id: 'awning-consult-steward', family: 'consult', label: 'Consult Ur-Nanna', description: 'Establish the purpose and limits of the inspection.', apCost: 1, discoveryIds: ['awning-steward-request'], consultedPersonId: people.steward },
    { id: 'awning-inspect', family: 'observe', label: 'Inspect awning and supports', description: 'Observe ties, posts, shade structure, and threshold conditions.', apCost: 1, prerequisites: ['awning-consult-steward'], discoveryIds: ['awning-physical-observation'] },
    { id: 'awning-consult-repairer', family: 'consult', label: 'Consult Dudu', description: 'Confirm whether the existing repair commission included this structure.', apCost: 1, discoveryIds: ['awning-repair-scope'], consultedPersonId: people.repairer },
  ],
  interpretationRules: [],
  reportSchema: {
    title: 'South loading-awning condition report',
    responsibilityLabel: 'Responsibility claim',
    findings: [
      { id: 'ties_frayed_posts_upright', label: 'Two ties frayed; inspected posts upright' },
      { id: 'qualified_incomplete', label: 'Qualified report; inspection incomplete' },
      { id: 'structure_certified_sound', label: 'Certify the entire awning sound' },
    ],
    responsibilityClaims: [
      { id: 'none', label: 'No individual responsibility assigned' },
      { id: 'dudu', label: 'Attribute condition to Dudu’s prior work' },
    ],
    recommendations: [
      { id: 'authorize_tie_repair', label: 'Recommend a separate repair commission for the two frayed ties' },
      { id: 'monitor_pooling', label: 'Monitor pooling and investigate its cause' },
      { id: 'restrict_loading', label: 'Recommend limiting loading until the ties are repaired' },
    ],
    limitationsLabel: 'Uninspected structure and causal limits',
  },
  submissionNote: 'This is a condition report, not a repair order or proof that the existing north-bay commission covered the awning.',
});

export const URUK_ASSIGNMENT_ACTIVITY_CATALOG = {
  [heldBarleyInspection.id]: heldBarleyInspection,
  [southCourtDeliveryReconciliation.id]: southCourtDeliveryReconciliation,
  [southLoadingAwningInspection.id]: southLoadingAwningInspection,
} as const;
