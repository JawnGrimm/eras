import type { PersonId } from '../../state/ids';
import type { AssignmentActivityProgress } from '../../state/types';
import type { AssignmentActivityDefinition } from './northBayRoofInspection';

const people = {
  steward: 'person-ur-nanna' as PersonId,
  receiver: 'person-utu-mansum' as PersonId,
  senior: 'person-shuruppak-ilu' as PersonId,
  carrier: 'person-enlil-kisu' as PersonId,
  offeringParticipant: 'person-nin-kasi' as PersonId,
};

function activity(definition: Omit<AssignmentActivityDefinition, 'createInitialProgress'>): AssignmentActivityDefinition {
  return {
    ...definition,
    createInitialProgress: (): AssignmentActivityProgress => ({
      completedActionIds: [], discoveryIds: [], consultedPersonIds: [],
      draft: { finding: definition.reportSchema.findings[0].id,
        responsibilityClaim: definition.reportSchema.responsibilityClaims[0].id,
        citedDiscoveryIds: [], limitations: [], recommendations: [], selectedLimitationIds: [] },
    }),
  };
}

const humanReactions = (who: string, subject: string) => ({
  Thorough: `${who} receives the report with visible relief. “Good. I can carry this forward without asking you to pretend the missing part is settled.” ${subject}`,
  Defensible: `${who} reads the note twice, then nods. “That is enough to make the next decision. Keep the source with it.”`,
  Incomplete: `${who} sets the tablet copy aside. “I can see what you checked. I still need the other part before I can use this.”`,
  Overreached: `${who} goes quiet at the unsupported claim. “You have written more than these records can carry. We will have to correct this before it travels.”`,
});
const rationales = (complete: string, defensible: string, incomplete: string, overreach: string) => ({
  Thorough: complete, Defensible: defensible, Incomplete: incomplete, Overreached: overreach,
});
export const sealedVesselTextileConsignment = activity({
  id: 'activity-era1-com-01-sealed-consignment',
  title: 'Sealed Vessel and Textile Consignment',
  submissionApCost: 1,
  participants: [people.steward, people.receiver, people.carrier, people.senior],
  discoveries: [
    { id: 'com01-request', title: 'The receiving request', text: 'Utu-mansum asks for the consignment to be checked before the receiving court closes. Enlil-kisu wants the goods accepted so his crew can leave; the receiving official wants the tag and custody note kept together.' },
    { id: 'com01-tag', title: 'Tag transcription', text: 'The tag identifies vessel lot V-17 and textile lot T-04. The two commodity groups remain separately identified; Keep the vessel and textile counts on separate lines; they are different goods.' },
    { id: 'com01-seal', title: 'Seal and custody observation', text: 'The seal impression on one vessel container is incomplete. No one can tell from the damaged impression when it happened, whether the contents changed, or who handled the vessel afterward.' },
    { id: 'com01-quantity', title: 'Quantity record', text: 'The dispatch account lists 8 vessels and 3 textile bundles under their separate identifiers.' },
    { id: 'com01-receipt', title: 'Receiving entry', text: 'The receiving entry lists 7 vessels and 3 textile bundles. The vessel count differs by one; the textile count agrees.' },
  ],
  actions: [
    { id: 'com01-consult-receiver', family: 'consult', label: 'Ask Utu-mansum what crossed the threshold', description: 'Hear what the receiving official actually counted before the court closes.', apCost: 1, discoveryIds: ['com01-request'], consultedPersonId: people.receiver },
    { id: 'com01-compare-tag', family: 'compare', label: 'Compare tag and dispatch account', description: 'Keep vessel and textile identifiers and counts separate.', apCost: 1, prerequisites: ['com01-consult-receiver'], discoveryIds: ['com01-tag','com01-quantity'] },
    { id: 'com01-check-seal', family: 'observe', label: 'Examine the seal impression', description: 'Record the visible condition without inferring when or why it changed.', apCost: 1, discoveryIds: ['com01-seal'] },
    { id: 'com01-compare-receipt', family: 'compare', label: 'Compare the receiving entry', description: 'Identify which commodity count agrees and which differs.', apCost: 1, discoveryIds: ['com01-receipt'] },
  ],
  interpretationRules: [],
  reportSchema: {
    title: 'Consignment comparison report', responsibilityLabel: 'Responsibility',
    findings: [
      { id: 'vessel_count_differs', label: 'Vessel count differs; textile count agrees' },
      { id: 'receipt_consistent', label: 'The supplied entries agree' },
      { id: 'insufficient_custody_evidence', label: 'Custody evidence is insufficient to clear the consignment' },
      { id: 'certify_or_accuse', label: 'Certify clearance or assign blame without support' },
    ],
    responsibilityClaims: [
      { id: 'none', label: 'No individual responsibility assigned' },
      { id: 'carrier_blame', label: 'Assign the discrepancy to the carrier' },
    ],
    recommendations: [
      { id: 'request_recount', label: 'Request a recount of the vessel lot' },
      { id: 'preserve_both_counts', label: 'Preserve dispatch and receiving counts pending review' },
      { id: 'accept_textiles', label: 'Record the textile count as reconciled' },
    ],
    limitationsLabel: 'What the evidence cannot establish',
    limitationOptions: [
      { id: 'seal_timing_unknown', label: 'The receiving official still cannot tell when the seal was damaged or who handled the vessel afterward' },
      { id: 'count_difference_unlocated', label: 'Dispatch lists eight vessels; receipt lists seven. Neither copy shows where the missing vessel went' },
      { id: 'no_release_authority', label: 'Utu-mansum must decide whether the goods are released; this report carries the comparison' },
    ],
  },
  evaluation: {
    requiredEvidenceIds: ['com01-tag','com01-quantity','com01-receipt'],
    requiredLimitationIds: ['count_difference_unlocated','no_release_authority'],
    relevantEvidenceIds: ['com01-request','com01-seal'],
    relevantLimitationIds: ['seal_timing_unknown'],
    unsupportedFindingIds: ['certify_or_accuse'],
    unsupportedResponsibilityClaimIds: ['carrier_blame'],
    receiverPersonId: people.receiver,
    rationales: rationales('Both commodity groups are compared separately, the count difference is precisely located, and custody limits are explicit.',
      'The dispatch and receiving entries are compared correctly and the report stays within the apprentice’s authority.',
      'A required source or limitation is missing, so the receiving official cannot safely carry the report forward.',
      'The report certifies clearance or assigns responsibility beyond what the tag, seal, and counts establish.'),
    reactions: humanReactions('Utu-mansum', 'He keeps the receiving tally beside the dispatch copy.'),
  },
  submissionNote: 'The receiving official decides whether to recount or proceed. The report itself does not release the goods.',
});

export const brewingIngredientAccount = activity({
  id: 'activity-era1-com-02-brewing-account',
  title: 'Brewing-Ingredient Account Reconciliation',
  submissionApCost: 1,
  participants: [people.senior, people.steward],
  discoveries: [
    { id: 'com02-request', title: 'The recorder’s request', text: 'The brewer is worried that an apparent shortfall will reduce the quantity credited to his work. Shuruppak-ilu wants the arithmetic checked before the account is closed; neither concern decides what the signs mean.' },
    { id: 'com02-groats', title: 'Grain-product entries', text: 'Three groats entries are 4, 3, and 2 capacity units. Their recalculated subtotal is 9; the working copy writes 8.' },
    { id: 'com02-malt', title: 'Malt entries', text: 'The separate malt entries total 7 in their own notation. Do not combine this total with the groats subtotal.' },
    { id: 'com02-reading', title: 'Reading and carry-forward note', text: 'The copied account marks one sign as uncertain. The supplied transcription permits a check of the displayed arithmetic but does not settle the uncertain destination or use of the goods.' },
  ],
  actions: [
    { id: 'com02-review-copy', family: 'observe', label: 'Review the account copy', description: 'Identify the grain-product and malt sections before calculating.', apCost: 1, discoveryIds: ['com02-request','com02-reading'] },
    { id: 'com02-recalculate-groats', family: 'compare', label: 'Recalculate the groats subtotal', description: 'Add only the entries in the same commodity and notation.', apCost: 1, prerequisites: ['com02-review-copy'], discoveryIds: ['com02-groats'] },
    { id: 'com02-check-malt', family: 'compare', label: 'Check the separate malt total', description: 'Keep the malt entries separate from the groats account.', apCost: 1, discoveryIds: ['com02-malt'] },
  ],
  interpretationRules: [],
  reportSchema: {
    title: 'Brewing-ingredient account check', responsibilityLabel: 'Responsibility',
    findings: [
      { id: 'groats_copying_error', label: 'Groats subtotal is copied incorrectly; malt total remains separate' },
      { id: 'account_reconciles', label: 'The displayed account reconciles' },
      { id: 'reading_uncertain', label: 'The uncertain reading requires the source copy' },
      { id: 'unsupported_ratio', label: 'Infer a fixed grain-to-beer ratio or alter the account' },
    ],
    responsibilityClaims: [
      { id: 'none', label: 'No individual responsibility assigned' },
      { id: 'brewer_or_supplier', label: 'Assign the shortfall to the brewer or supplier' },
    ],
    recommendations: [
      { id: 'correct_subtotal', label: 'Show the recalculated subtotal for review' },
      { id: 'consult_source', label: 'Check the source tablet before changing the account' },
      { id: 'preserve_malt', label: 'Keep the malt total distinct' },
    ],
    limitationsLabel: 'Reading and category limits',
    limitationOptions: [
      { id: 'no_shared_unit', label: 'Groats and malt totals are not combined or converted' },
      { id: 'uncertain_destination', label: 'The brewer still needs the destination checked; the uncertain sign cannot settle it' },
      { id: 'no_authority_to_amend', label: 'Only the responsible recorder can change the account; the apprentice’s report leaves the original entry intact' },
    ],
  },
  evaluation: {
    requiredEvidenceIds: ['com02-groats','com02-malt'],
    requiredLimitationIds: ['no_shared_unit','no_authority_to_amend'],
    relevantEvidenceIds: ['com02-request','com02-reading'],
    relevantLimitationIds: ['uncertain_destination'],
    unsupportedFindingIds: ['unsupported_ratio'],
    unsupportedResponsibilityClaimIds: ['brewer_or_supplier'],
    receiverPersonId: people.senior,
    rationales: rationales('The two commodity sections are checked separately, the copied subtotal is identified, and the reading limits are preserved.',
      'The arithmetic is reproducible and no unsupported ratio, destination, or responsibility is asserted.',
      'A required commodity section or limitation is missing, leaving the account check incomplete.',
      'The report invents a conversion or assigns blame that the source entries do not support.'),
    reactions: humanReactions('Shuruppak-ilu', 'He leaves the original account unchanged until the source can be checked.'),
  },
  submissionNote: 'A responsible recorder may correct a copying error after review; the apprentice does not alter the authoritative account.',
});

export const fieldMeasurementReconciliation = activity({
  id: 'activity-era1-civ-01-field-measurement',
  title: 'Field Measurement and Area Reconciliation',
  submissionApCost: 1,
  participants: [people.senior, people.steward],
  discoveries: [
    { id: 'civ01-provenance', title: 'Record identity and provenance', text: 'This is an older field-area copy; where it was found and when it was made are not recorded.' },
    { id: 'civ01-working-copy', title: 'Readable working transcription', text: 'The readable working copy gives parcel areas 2, 3, and 4 units. These figures are the values to add; they do not establish a boundary.' },
    { id: 'civ01-subtotal', title: 'Written area subtotal', text: 'The working summary writes a total of 8 units. The displayed parcel values add to 9.' },
  ],
  actions: [
    { id: 'civ01-review-source', family: 'observe', label: 'Review the source note', description: 'Check the copy’s date and origin note before carrying the figures forward.', apCost: 1, discoveryIds: ['civ01-provenance'] },
    { id: 'civ01-read-copy', family: 'observe', label: 'Read the parcel transcription', description: 'Read the working figures in the copy; keep the original notation note beside them.', apCost: 1, prerequisites: ['civ01-review-source'], discoveryIds: ['civ01-working-copy'] },
    { id: 'civ01-recalculate', family: 'compare', label: 'Recalculate the area subtotal', description: 'Add the three displayed parcel areas and compare the written total.', apCost: 1, discoveryIds: ['civ01-subtotal'] },
  ],
  interpretationRules: [],
  reportSchema: {
    title: 'Field measurement check', responsibilityLabel: 'Responsibility',
    findings: [
      { id: 'subtotal_omission', label: 'The displayed subtotal omits one area unit' },
      { id: 'figures_reconcile', label: 'The displayed figures reconcile' },
      { id: 'source_unclear', label: 'The source transcription needs clarification' },
      { id: 'land_claim', label: 'Treat the arithmetic as proof of a boundary or ownership claim' },
    ],
    responsibilityClaims: [
      { id: 'none', label: 'No individual responsibility assigned' },
      { id: 'boundary_claim', label: 'Assign a boundary or ownership conclusion' },
    ],
    recommendations: [
      { id: 'correct_summary', label: 'Return the arithmetic correction for review' },
      { id: 'check_source', label: 'Check the source transcription before copying' },
      { id: 'request_measurement', label: 'Request a separately authorized remeasurement if needed' },
    ],
    limitationsLabel: 'Source and authority limits',
    limitationOptions: [
      { id: 'provenance_uncertain', label: 'The copy gives no clear date or place; keep that uncertainty with the figures' },
      { id: 'transcription_simplified', label: 'The parcel figures are shown in a readable working measure; keep the source notation beside them' },
      { id: 'no_land_authority', label: 'The people waiting on the field summary still need an authorized measurement before any boundary or allocation is decided' },
    ],
  },
  evaluation: {
    requiredEvidenceIds: ['civ01-working-copy','civ01-subtotal'],
    requiredLimitationIds: ['provenance_uncertain','transcription_simplified','no_land_authority'],
    relevantEvidenceIds: ['civ01-provenance'],
    relevantLimitationIds: [],
    unsupportedFindingIds: ['land_claim'],
    unsupportedResponsibilityClaimIds: ['boundary_claim'],
    receiverPersonId: people.senior,
    rationales: rationales('The calculation is shown, the simplified transcription is identified, and the source’s chronology/provenience and authority limits remain explicit.',
      'The arithmetic is reproducible and the report makes no land or ownership claim.',
      'The calculation or one of the required source qualifications is missing.',
      'The report turns a working arithmetic transcription into an unsupported land, boundary, or ownership conclusion.'),
    reactions: humanReactions('Shuruppak-ilu', 'He keeps the source qualification with the corrected working summary.'),
  },
  submissionNote: 'The report checks arithmetic only. Any new measurement or land decision belongs to an appropriately situated official.',
});

export const laborGroupDisbursement = activity({
  id: 'activity-era1-civ-02-labor-disbursement',
  title: 'Labor-Group Records and Grain Disbursement',
  submissionApCost: 1,
  participants: [people.senior, people.steward],
  discoveries: [
    { id: 'civ02-request', title: 'The reviewer’s request', text: 'The group leader wants the figures settled so people can leave. Shuruppak-ilu asks for two separate checks; he does not claim the grain record belongs to this group.' },
    { id: 'civ02-labor-account', title: 'Labor-group account', text: 'The labor-group tally gives entries 6, 8, and 5; the written total is 19. The displayed values reconcile.' },
    { id: 'civ02-disbursement', title: 'Separate grain-disbursement record', text: 'The grain entry names high-ranking officials. The group leader cannot use it to claim a ration for his people.' },
    { id: 'civ02-provenance', title: 'Separate provenance notes', text: 'The group leader wants the grain included, but the two copies name different entries. No shared transaction is recorded.' },
  ],
  actions: [
    { id: 'civ02-review-request', family: 'consult', label: 'Consult the reviewer', description: 'Clarify the two-part report and the group’s need for a timely answer.', apCost: 1, discoveryIds: ['civ02-request'], consultedPersonId: people.senior },
    { id: 'civ02-check-labor', family: 'compare', label: 'Check the labor-group total', description: 'Recalculate the displayed group entries without assuming a ration link.', apCost: 1, prerequisites: ['civ02-review-request'], discoveryIds: ['civ02-labor-account'] },
    { id: 'civ02-review-disbursement', family: 'compare', label: 'Summarize the separate disbursement', description: 'Identify the recorded recipient/category without linking it to the labor group.', apCost: 1, discoveryIds: ['civ02-disbursement'] },
    { id: 'civ02-compare-provenance', family: 'compare', label: 'Compare the provenance notes', description: 'State why the two records cannot be treated as one transaction.', apCost: 1, discoveryIds: ['civ02-provenance'] },
  ],
  interpretationRules: [],
  reportSchema: {
    title: 'Labor and disbursement accountability note', responsibilityLabel: 'Responsibility',
    findings: [
      { id: 'labor_total_reconciles', label: 'Labor-group total reconciles; disbursement is separate' },
      { id: 'labor_total_error', label: 'A labor-group arithmetic error is identified' },
      { id: 'link_not_established', label: 'A further record is needed before claiming a connection' },
      { id: 'invented_entitlement', label: 'Claim the grain was owed to this labor group' },
    ],
    responsibilityClaims: [
      { id: 'none', label: 'No individual responsibility assigned' },
      { id: 'diversion_claim', label: 'Accuse an official of diverting the grain' },
    ],
    recommendations: [
      { id: 'preserve_separate', label: 'Preserve both records separately' },
      { id: 'request_linking_record', label: 'Request another record before claiming a link' },
      { id: 'accept_labor_total', label: 'Return the checked labor-group total' },
    ],
    limitationsLabel: 'Record-linkage limits',
    limitationOptions: [
      { id: 'no_group_link', label: 'The grain-disbursement record is not linked to this labor group' },
      { id: 'source_records_separate', label: 'The two source records have separate provenance' },
      { id: 'no_redistribution_authority', label: 'This report cannot reassign the grain; the officials named in the separate copy retain their own account' },
    ],
  },
  evaluation: {
    requiredEvidenceIds: ['civ02-labor-account','civ02-disbursement','civ02-provenance'],
    requiredLimitationIds: ['no_group_link','source_records_separate','no_redistribution_authority'],
    relevantEvidenceIds: ['civ02-request'],
    relevantLimitationIds: [],
    unsupportedFindingIds: ['invented_entitlement'],
    unsupportedResponsibilityClaimIds: ['diversion_claim'],
    receiverPersonId: people.senior,
    rationales: rationales('The labor arithmetic and separate disbursement are both reported accurately, with no unsupported link or authority claim.',
      'The two records remain distinct and the report avoids inventing a ration entitlement.',
      'One of the two records or the required non-linkage qualification is missing.',
      'The report invents a shared transaction or entitlement and attributes diversion without evidence.'),
    reactions: humanReactions('Shuruppak-ilu', 'He tells the group leader that a quick answer is not the same as a supported one.'),
  },
  submissionNote: 'For this commission, one Provision is paid when the two-part account check is filed. The group’s grain record is separate from this payment.',
});

export const inanaOfferingRecords = activity({
  id: 'activity-era1-rel-01-inana-offering',
  title: 'Inana Offering Records and Sanctuary Supply',
  submissionApCost: 1,
  participants: [people.offeringParticipant, people.senior],
  discoveries: [
    { id: 'rel01-request', title: 'A request before preparations', text: 'Nin-kasi asks for the entries to be checked before preparations continue. She would rather not reopen the account late in the day; the senior recorder wants the source distinction preserved.' },
    { id: 'rel01-offering-record', title: 'Inana-associated offering record', text: 'The offering record is associated with Inana. The copy before you contains two same-category entries; its summary leaves one out.' },
    { id: 'rel01-commodity-record', title: 'Separate commodity record', text: 'A separate copy contains a fish-category entry. Nin-kasi asks whether it can fill the missing offering entry, but the copies provide no link.' },
    { id: 'rel01-provenance', title: 'Provenance and category note', text: 'Nin-kasi needs an answer before preparations continue. The copies use different fish categories, and neither tells her whether the separate entry can fill the gap.' },
  ],
  actions: [
    { id: 'rel01-consult-participant', family: 'consult', label: 'Consult Nin-kasi', description: 'Establish which offering entries she is asking to have checked.', apCost: 1, discoveryIds: ['rel01-request'], consultedPersonId: people.offeringParticipant },
    { id: 'rel01-review-offering', family: 'compare', label: 'Review the offering entries', description: 'Compare only the entries directly associated with the Inana offering record.', apCost: 1, prerequisites: ['rel01-consult-participant'], discoveryIds: ['rel01-offering-record'] },
    { id: 'rel01-check-separate-source', family: 'compare', label: 'Review the separate commodity record', description: 'Keep the broader commodity record distinct from the offering tablet.', apCost: 1, discoveryIds: ['rel01-commodity-record','rel01-provenance'] },
  ],
  interpretationRules: [],
  reportSchema: {
    title: 'Offering and supply review', responsibilityLabel: 'Responsibility',
    findings: [
      { id: 'copying_omission', label: 'The offering summary omits one displayed entry' },
      { id: 'offering_reconciles', label: 'The offering entries reconcile' },
      { id: 'source_link_unclear', label: 'The separate commodity record cannot be linked' },
      { id: 'ritual_shortage_claim', label: 'Declare a shortage or ritual interruption' },
    ],
    responsibilityClaims: [
      { id: 'none', label: 'No individual responsibility assigned' },
      { id: 'diversion_claim', label: 'Accuse a participant of withholding an offering' },
    ],
    recommendations: [
      { id: 'correct_offering_summary', label: 'Show the omitted entry for responsible review' },
      { id: 'request_more_records', label: 'Request another source before claiming a shortage' },
      { id: 'preserve_categories', label: 'Keep the offering and commodity categories separate' },
    ],
    limitationsLabel: 'Offering, category, and authority limits',
    limitationOptions: [
      { id: 'no_shared_schedule', label: 'The sources do not establish one kitchen or supply schedule' },
      { id: 'no_commodity_link', label: 'The separate fish record is not linked to the offering record' },
      { id: 'no_ritual_authority', label: 'The apprentice cannot determine ritual validity or interrupt a rite' },
    ],
  },
  evaluation: {
    requiredEvidenceIds: ['rel01-offering-record','rel01-commodity-record','rel01-provenance'],
    requiredLimitationIds: ['no_shared_schedule','no_commodity_link','no_ritual_authority'],
    relevantEvidenceIds: ['rel01-request'],
    relevantLimitationIds: [],
    unsupportedFindingIds: ['ritual_shortage_claim'],
    unsupportedResponsibilityClaimIds: ['diversion_claim'],
    receiverPersonId: people.offeringParticipant,
    rationales: rationales('The offering record is checked separately from the broader commodity record, and all institutional limits are explicit.',
      'The source categories remain distinct and no unsupported ritual or shortage claim is made.',
      'A required source or qualification is missing, so the account cannot be carried forward confidently.',
      'The report invents a shortage, ritual consequence, or personal diversion unsupported by the records.'),
    reactions: humanReactions('Nin-kasi', 'She keeps the offering copy separate from the broader commodity note.'),
  },
  submissionNote: 'The responsible participant decides whether to correct an entry or seek another source. This report does not determine ritual validity.',
});

export const ERA_I_ANCHOR_ACTIVITY_CATALOG = {
  [sealedVesselTextileConsignment.id]: sealedVesselTextileConsignment,
  [brewingIngredientAccount.id]: brewingIngredientAccount,
  [fieldMeasurementReconciliation.id]: fieldMeasurementReconciliation,
  [laborGroupDisbursement.id]: laborGroupDisbursement,
  [inanaOfferingRecords.id]: inanaOfferingRecords,
} as const;
