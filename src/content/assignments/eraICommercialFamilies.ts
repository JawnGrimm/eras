import type { PersonId, RecordId } from '../../state/ids';
import type { AssignmentActivityProgress } from '../../state/types';
import type { AssignmentActivityDefinition } from './northBayRoofInspection';
import type { AssignmentOpportunityDefinition } from './opportunityDefinitions';
import { ERA_I_ASSIGNMENT_PARAMETERS } from './eraIParameters';

/** Fictional participants for the authored Era I scenarios. */
export const ERA1_COM_F02_F04_PEOPLE = {
  luNanshe: 'person-lu-nanshe' as PersonId,
  urNanna: 'person-ur-nanna' as PersonId,
  gemeInana: 'person-geme-inana-provisional' as PersonId,
  utuMansum: 'person-utu-mansum' as PersonId,
  kuli: 'person-kuli' as PersonId,
  enlilKisu: 'person-enlil-kisu' as PersonId,
  amaGi: 'person-ama-gi-provisional' as PersonId,
  sigAna: 'person-sig-ana-provisional' as PersonId,
  dudu: 'person-dudu' as PersonId,
  shuruppak: 'person-shuruppak-ilu' as PersonId,
} as const;

export const ERA1_COM_F02_RECORD_IDS = {
  storehouseRequest: 'record-era1-com-f02-storehouse-request' as RecordId,
  householdRequest: 'record-era1-com-f02-household-request' as RecordId,
  deliveryReceipt: 'record-era1-com-f02-delivery-receipt' as RecordId,
  carrierAccount: 'record-era1-com-f02-carrier-account' as RecordId,
} as const;

export const ERA1_COM_F03_RECORD_IDS = {
  outboundDispatch: 'record-era1-com-f03-outbound-dispatch' as RecordId,
  partialReturn: 'record-era1-com-f03-partial-return' as RecordId,
} as const;

export const ERA1_COM_F04_RECORD_IDS = {
  dispatchTally: 'record-era1-com-f04-dispatch-tally' as RecordId,
  landingTally: 'record-era1-com-f04-landing-tally' as RecordId,
  receivingTally: 'record-era1-com-f04-receiving-tally' as RecordId,
} as const;

function activity(definition: Omit<AssignmentActivityDefinition, 'createInitialProgress'>): AssignmentActivityDefinition {
  return {
    ...definition,
    createInitialProgress: (): AssignmentActivityProgress => ({
      completedActionIds: [],
      discoveryIds: [],
      consultedPersonIds: [],
      draft: {
        finding: definition.reportSchema.findings[0].id,
        responsibilityClaim: definition.reportSchema.responsibilityClaims[0].id,
        citedDiscoveryIds: [],
        limitations: [],
        recommendations: [],
        selectedLimitationIds: [],
      },
    }),
  };
}

/** Estimates are derived from the actual authored action AP plus submission AP.
 * No proposed AP estimate or new skill threshold from the source portfolio is imported. */
function estimatedTotalAp(definition: AssignmentActivityDefinition): number {
  return definition.actions.reduce((total, action) => total + action.apCost, definition.submissionApCost);
}

const tierA = ERA_I_ASSIGNMENT_PARAMETERS.tierA;
const tierB = ERA_I_ASSIGNMENT_PARAMETERS.tierB;
const p = ERA1_COM_F02_F04_PEOPLE;

export const era1ComF02TwoClaims = activity({
  id: 'activity-era1-com-f02-two-claims',
  title: 'Two Claims, One Load',
  submissionApCost: 1,
  participants: [p.luNanshe, p.urNanna, p.gemeInana, p.utuMansum, p.kuli, p.dudu, p.shuruppak],
  discoveries: [
    { id: 'f02-lu-nanshe-request', title: 'Lu-Nanshe’s request',
      text: 'Lu-Nanshe asks for a neutral summary of the two claims before she decides priority. She retains the decision; Shuruppak-ilu has no authority to choose between the claimants.',
      sourcePersonId: p.luNanshe },
    { id: 'f02-storehouse-request', title: 'Storehouse request',
      text: 'The Temple Storehouse request names timber for the north-bay repair. It establishes the Storehouse’s stated need and the wording recorded in that request, not priority over another claimant.',
      sourceProvenanceId: 'comf02-storehouse-request' },
    { id: 'f02-household-request', title: 'Textile household request and sealing',
      text: 'Geme-Inana’s household request names timber for work-frames and bears a sealing. The sealing establishes that a seal was impressed; it does not by itself establish that its holder had authority to commit this load.',
      sourceProvenanceId: 'comf02-household-request' },
    { id: 'f02-delivery-record', title: 'Delivery receipt and tag',
      text: 'The delivery receipt records a small load of timber arriving at the receiving court. The tag and receipt establish what was recorded about the delivered load; neither chooses which request is entitled to it.',
      sourceProvenanceId: 'comf02-delivery-receipt' },
    { id: 'f02-carrier-account', title: 'Kuli’s account',
      text: 'Kuli gives an account of the delivery instruction he received. His testimony is separately attributed and does not establish either claimant’s authority or good faith.',
      sourceProvenanceId: 'comf02-carrier-account' },
  ],
  actions: [
    { id: 'f02-consult-decider', family: 'consult', label: 'Consult Lu-Nanshe',
      description: 'Establish the question being reviewed and who retains the priority decision.',
      apCost: 1, discoveryIds: ['f02-lu-nanshe-request'], consultedPersonId: p.luNanshe },
    { id: 'f02-review-storehouse-claim', family: 'consult', label: 'Review the Storehouse claim',
      description: 'Read the Storehouse request and establish the need it records.',
      apCost: 1, prerequisites: ['f02-consult-decider'], discoveryIds: ['f02-storehouse-request'], consultedPersonId: p.urNanna },
    { id: 'f02-review-household-claim', family: 'consult', label: 'Review the household claim',
      description: 'Read Geme-Inana’s request and distinguish the sealing from proof of authority.',
      apCost: 1, prerequisites: ['f02-consult-decider'], discoveryIds: ['f02-household-request'], consultedPersonId: p.gemeInana },
    { id: 'f02-compare-delivery', family: 'compare', label: 'Compare delivery and carrier account',
      description: 'Compare the delivery receipt and tag with Kuli’s separately attributed account.',
      apCost: 1, prerequisites: ['f02-review-storehouse-claim','f02-review-household-claim'],
      discoveryIds: ['f02-delivery-record','f02-carrier-account'], consultedPersonId: p.kuli },
  ],
  interpretationRules: [],
  reportSchema: {
    title: 'Competing claims summary',
    responsibilityLabel: 'Responsibility or entitlement claim',
    findings: [
      { id: 'both_claims_documented', label: 'Both claims are documented; entitlement remains undecided' },
      { id: 'record_sequence_clear', label: 'The sequence of the recorded requests is clear; priority remains for Lu-Nanshe' },
      { id: 'record_sequence_uncertain', label: 'The available copies do not establish a reliable sequence' },
      { id: 'entitlement_established', label: 'The records establish which claimant is entitled to the load' },
    ],
    responsibilityClaims: [
      { id: 'none', label: 'No entitlement or individual fault assigned' },
      { id: 'storehouse_entitled', label: 'The Storehouse is entitled to the load' },
      { id: 'household_entitled', label: 'The textile household is entitled to the load' },
      { id: 'carrier_responsible', label: 'Kuli is responsible for the competing claims' },
      { id: 'bad_faith', label: 'One claimant acted in bad faith' },
    ],
    recommendations: [
      { id: 'present_both_claims', label: 'Present both claims and their source records neutrally' },
      { id: 'show_possible_division', label: 'Show whether a partial division is supported by the recorded quantities' },
      { id: 'request_authority_decision', label: 'Refer priority to Lu-Nanshe for decision' },
      { id: 'defer_pending_record', label: 'Defer allocation until a missing instruction or record is checked' },
    ],
    limitationsLabel: 'Evidence and authority limits',
    limitationOptions: [
      { id: 'sealing_not_authority', label: 'The sealing proves an impression, not the holder’s authority to commit the load' },
      { id: 'records_not_entitlement', label: 'The requests and delivery record do not themselves establish entitlement' },
      { id: 'no_allocation_authority', label: 'The scribe does not allocate the load or decide priority' },
    ],
  },
  evaluation: {
    requiredEvidenceIds: ['f02-storehouse-request','f02-household-request','f02-delivery-record','f02-carrier-account'],
    requiredLimitationIds: ['sealing_not_authority','records_not_entitlement','no_allocation_authority'],
    relevantEvidenceIds: ['f02-lu-nanshe-request'],
    relevantLimitationIds: [],
    unsupportedFindingIds: ['entitlement_established'],
    unsupportedResponsibilityClaimIds: ['storehouse_entitled','household_entitled','carrier_responsible','bad_faith'],
    receiverPersonId: p.luNanshe,
    relationshipPersonIds: [p.urNanna, p.gemeInana],
    rationales: {
      Thorough: 'Both requests, the delivery receipt, and the carrier account are kept distinct. The sealing and the limits of the scribe’s authority are explicit; the report does not choose a winner.',
      Defensible: 'The report states what each claim and delivery source establishes without treating sequence or sealing as entitlement.',
      Incomplete: 'One of the claims, the delivery record, the carrier account, or a required authority limitation is missing.',
      Overreached: 'The report decides entitlement, assigns fault, or infers bad faith from records that do not establish those conclusions.',
    },
    reactions: {
      Thorough: 'Lu-Nanshe reads the two claims side by side. “Good. Now I can decide what to do without pretending the seal chose for me.”',
      Defensible: 'Lu-Nanshe nods. “The claims are clear. The priority is still mine to decide.”',
      Incomplete: 'Lu-Nanshe sets the copy aside. “I need both claims and the delivery recorded before I decide.”',
      Overreached: 'Lu-Nanshe closes the tablet. “You have chosen a winner where the records have not.”',
    },
  },
  submissionNote: 'This is a neutral claims summary. Allocation, division, or deferral remains Lu-Nanshe’s decision; the report does not itself award the load.',
});

export const era1ComF03PartialReturn = activity({
  id: 'activity-era1-com-f03-partial-return',
  title: 'Sent Out, Not Yet Returned',
  submissionApCost: 1,
  participants: [p.gemeInana, p.kuli, p.enlilKisu, p.utuMansum],
  discoveries: [
    { id: 'f03-outbound-dispatch', title: 'Outbound dispatch record',
      text: 'The dispatch record shows which goods were sent out and in what recorded quantity. It does not record an exchange equivalence or prove what was agreed orally.',
      sourceProvenanceId: 'comf03-outbound-record' },
    { id: 'f03-partial-return', title: 'Partial return receipt',
      text: 'The receiving receipt records the first return and shows that it is partial against the outbound dispatch. It establishes what arrived, not what the counterparty owes under an unrecorded agreement.',
      sourceProvenanceId: 'comf03-return-record' },
    { id: 'f03-geme-account', title: 'Geme-Inana’s account of the agreement',
      text: 'Geme-Inana says the goods went out on the understanding that goods of another kind would come back. The agreement is present in her spoken account; no written equivalence is available.',
      sourceProvenanceId: 'comf03-geme-account' },
    { id: 'f03-kuli-account', title: 'Kuli’s account of the next trip',
      text: 'Kuli says the remainder will follow on the next trip. This is an attributed statement, not a written promise or proof that a default has occurred.',
      sourceProvenanceId: 'comf03-kuli-account' },
    { id: 'f03-enlil-recollection', title: 'Enlil-kisu’s recollection',
      text: 'Enlil-kisu recalls the outbound carrying and can speak to what he carried. His recollection does not establish the terms of the oral exchange.',
      sourceProvenanceId: 'comf03-enlil-recollection' },
  ],
  actions: [
    { id: 'f03-compare-dispatch-return', family: 'compare', label: 'Compare dispatch and return',
      description: 'Establish what was sent and what has returned so far.',
      apCost: 1, discoveryIds: ['f03-outbound-dispatch','f03-partial-return'] },
    { id: 'f03-consult-geme', family: 'consult', label: 'Consult Geme-Inana',
      description: 'Record her account of the understanding separately from the written dispatch and receipt.',
      apCost: 1, prerequisites: ['f03-compare-dispatch-return'], discoveryIds: ['f03-geme-account'], consultedPersonId: p.gemeInana },
    { id: 'f03-consult-kuli', family: 'consult', label: 'Consult Kuli',
      description: 'Hear the carrier’s account and distinguish a promised next trip from a written obligation.',
      apCost: 1, prerequisites: ['f03-compare-dispatch-return'], discoveryIds: ['f03-kuli-account','f03-enlil-recollection'], consultedPersonId: p.kuli },
  ],
  interpretationRules: [],
  reportSchema: {
    title: 'Exchange statement',
    responsibilityLabel: 'Responsibility claim',
    findings: [
      { id: 'partial_return_recorded', label: 'The written records show a partial return' },
      { id: 'written_and_spoken_separated', label: 'Written quantities and spoken agreement are clearly separated' },
      { id: 'outbound_record_uncertain', label: 'The outbound reading remains uncertain' },
      { id: 'exchange_closed', label: 'The exchange is closed' },
      { id: 'default_established', label: 'The counterparty has defaulted' },
    ],
    responsibilityClaims: [
      { id: 'none', label: 'No default or individual fault assigned' },
      { id: 'kuli_default', label: 'Kuli has failed to deliver the remainder' },
      { id: 'counterparty_default', label: 'The counterparty has defaulted' },
      { id: 'enlil_responsible', label: 'Enlil-kisu is responsible for the incomplete return' },
    ],
    recommendations: [
      { id: 'record_partial_return', label: 'Record the sent, returned, and claimed outstanding quantities separately' },
      { id: 'seek_next_trip_confirmation', label: 'Ask the counterparty to confirm through the next carrier' },
      { id: 'wait_for_next_return', label: 'Wait for the next return before closing the exchange' },
      { id: 'withhold_next_dispatch', label: 'Recommend that Geme-Inana consider withholding the next dispatch' },
    ],
    limitationsLabel: 'Written, spoken, and authority limits',
    limitationOptions: [
      { id: 'no_written_equivalence', label: 'No written equivalence between sent and returned goods is available' },
      { id: 'oral_agreement_unverified', label: 'The agreement is described orally and is not independently established by a record' },
      { id: 'no_default_or_liability', label: 'The partial return does not establish default or individual liability' },
    ],
  },
  evaluation: {
    requiredEvidenceIds: ['f03-outbound-dispatch','f03-partial-return','f03-geme-account','f03-kuli-account'],
    requiredLimitationIds: ['no_written_equivalence','oral_agreement_unverified','no_default_or_liability'],
    relevantEvidenceIds: ['f03-enlil-recollection'],
    relevantLimitationIds: [],
    unsupportedFindingIds: ['exchange_closed','default_established'],
    unsupportedResponsibilityClaimIds: ['kuli_default','counterparty_default','enlil_responsible'],
    receiverPersonId: p.gemeInana,
    rationales: {
      Thorough: 'The dispatch and partial return are compared, both spoken accounts are attributed, and the absence of written equivalence is explicit.',
      Defensible: 'The report separates the recorded movement from the claimed oral understanding and does not declare default.',
      Incomplete: 'A required written source, spoken account, or limitation is missing.',
      Overreached: 'The report closes the exchange or declares default without a recorded equivalence or evidence of the counterparty’s obligation.',
    },
    reactions: {
      Thorough: 'Geme-Inana studies the statement. “At least now I know what has come back and what I am still being told.”',
      Defensible: 'Geme-Inana nods. “I will wait for the next trip, but I will not mistake a promise for a receipt.”',
      Incomplete: 'Geme-Inana taps the empty line. “I need the sent and returned goods set out separately.”',
      Overreached: 'Geme-Inana frowns. “You have called it a default before the next trip has even come.”',
    },
  },
  submissionNote: 'The exchange remains open. A later return requires a new, provenance-backed event and a distinct occurrence; this report does not declare the obligation closed.',
});

export const era1ComF04CustodyChain = activity({
  id: 'activity-era1-com-f04-custody-chain',
  title: 'Handed Over Twice',
  submissionApCost: 1,
  participants: [p.utuMansum, p.enlilKisu, p.amaGi, p.kuli, p.sigAna],
  discoveries: [
    { id: 'f04-dispatch-tally', title: 'Dispatch tally',
      text: 'The dispatch tally records twelve sealed vessels leaving with the first carrier. It establishes the count at dispatch, not the condition at later handovers.',
      sourceProvenanceId: 'comf04-dispatch-tally' },
    { id: 'f04-landing-tally', title: 'Landing tally',
      text: 'The landing tally records twelve vessels at the handover to the second carrier. It establishes the count at the landing, not what happened afterward.',
      sourceProvenanceId: 'comf04-landing-tally' },
    { id: 'f04-receiving-tally', title: 'Receiving tally',
      text: 'The receiving tally records eleven vessels at arrival. It is the first count that differs from the earlier tallies.',
      sourceProvenanceId: 'comf04-receiving-tally' },
    { id: 'f04-condition-note', title: 'Receiving condition note',
      text: 'The receiving record notes that one vessel arrived cracked. The condition note exists at receipt; it does not establish when or how the damage occurred.',
      sourceProvenanceId: 'comf04-receiving-tally' },
    { id: 'f04-sig-ana-account', title: 'Sig-ana’s account',
      text: 'Sig-ana says she saw part of the landing handover. Her account may guide a further check, but it does not establish the exact contents or condition of every vessel.',
      sourceProvenanceId: 'comf04-sig-ana-account' },
  ],
  actions: [
    { id: 'f04-review-dispatch', family: 'observe', label: 'Review dispatch tally',
      description: 'Establish the count recorded when the consignment left the first carrier.',
      apCost: 1, discoveryIds: ['f04-dispatch-tally'] },
    { id: 'f04-review-landing', family: 'observe', label: 'Review landing tally',
      description: 'Establish the count recorded at the intermediate handover.',
      apCost: 1, prerequisites: ['f04-review-dispatch'], discoveryIds: ['f04-landing-tally'] },
    { id: 'f04-review-receiving', family: 'compare', label: 'Compare receiving tally and condition',
      description: 'Compare the arrival count with the earlier tallies and preserve the condition note as a separate fact.',
      apCost: 1, prerequisites: ['f04-review-landing'], discoveryIds: ['f04-receiving-tally','f04-condition-note'] },
    { id: 'f04-consult-witness', family: 'consult', label: 'Consult Sig-ana',
      description: 'Hear the witness’s account as a lead, not as a finding about custody or fault.',
      apCost: 1, prerequisites: ['f04-review-landing'], discoveryIds: ['f04-sig-ana-account'], consultedPersonId: p.sigAna },
  ],
  interpretationRules: [],
  reportSchema: {
    title: 'Custody-chain report',
    responsibilityLabel: 'Responsibility claim',
    findings: [
      { id: 'first_difference_after_landing', label: 'The first recorded difference appears between landing and receipt' },
      { id: 'counts_agree_condition_only', label: 'The counts agree; the receiving record alone notes damage' },
      { id: 'tallies_do_not_locate_loss', label: 'The tallies show where counts differ but not where loss or damage occurred' },
      { id: 'custodian_fault_established', label: 'The evidence establishes which custodian caused the loss or damage' },
    ],
    responsibilityClaims: [
      { id: 'none', label: 'No individual responsibility assigned' },
      { id: 'enlil_kisu', label: 'Assign responsibility to Enlil-kisu' },
      { id: 'ama_gi', label: 'Assign responsibility to Ama-gi' },
      { id: 'kuli', label: 'Assign responsibility to Kuli' },
      { id: 'sig_ana', label: 'Assign responsibility to Sig-ana' },
    ],
    recommendations: [
      { id: 'record_tallies_in_order', label: 'Record all three tallies in sequence' },
      { id: 'recount_remaining_goods', label: 'Request a recount of the goods that remain' },
      { id: 'treat_witness_as_lead', label: 'Treat Sig-ana’s account as a lead for a further check' },
      { id: 'check_custody_interval', label: 'Request a separate check of the interval where the records first diverge' },
    ],
    limitationsLabel: 'Custody and condition limits',
    limitationOptions: [
      { id: 'tallies_show_counts_only', label: 'The tallies show what was counted at each handover, not what happened between them' },
      { id: 'condition_not_cause', label: 'The receiving condition note does not establish when or how the vessel cracked' },
      { id: 'no_individual_fault', label: 'The available sources do not establish individual fault or negligence' },
    ],
  },
  evaluation: {
    requiredEvidenceIds: ['f04-dispatch-tally','f04-landing-tally','f04-receiving-tally','f04-condition-note'],
    requiredLimitationIds: ['tallies_show_counts_only','condition_not_cause','no_individual_fault'],
    relevantEvidenceIds: ['f04-sig-ana-account'],
    relevantLimitationIds: [],
    unsupportedFindingIds: ['custodian_fault_established'],
    unsupportedResponsibilityClaimIds: ['enlil_kisu','ama_gi','kuli','sig_ana'],
    receiverPersonId: p.utuMansum,
    relationshipPersonIds: [p.enlilKisu, p.amaGi],
    rationales: {
      Thorough: 'The three tallies are ordered, the receiving condition note is separated from the counts, and the witness is treated as a lead rather than proof of fault.',
      Defensible: 'The report identifies where the recorded counts first differ without claiming where or why the loss occurred.',
      Incomplete: 'A required tally, condition note, or custody limitation is missing.',
      Overreached: 'The report assigns fault or treats a tally as proof of what happened between handovers.',
    },
    reactions: {
      Thorough: 'Utu-mansum reads the sequence twice. “That tells me where to ask the next question. It does not tell me whom to punish.”',
      Defensible: 'Utu-mansum nods. “The exception is clear. I will decide whether a recount or inquiry is needed.”',
      Incomplete: 'Utu-mansum sets the copy aside. “I need the three counts and the condition note together.”',
      Overreached: 'Utu-mansum returns the report. “You have named a culprit where the tallies only show intervals.”',
    },
  },
  submissionNote: 'The report records the custody chain and first recorded difference. Utu-mansum retains receipt and follow-up authority; no individual fault is established.',
});

const f02Ap = estimatedTotalAp(era1ComF02TwoClaims);
const f03Ap = estimatedTotalAp(era1ComF03PartialReturn);
const f04Ap = estimatedTotalAp(era1ComF04CustodyChain);

function opportunity(
  matterKind: 'era1_com_f02_two_claims' | 'era1_com_f03_partial_return' | 'era1_com_f04_custody_chain',
  slug: string,
  activityId: string,
  title: string,
  description: string,
  employer: PersonId,
  category: string,
  context: AssignmentOpportunityDefinition['offer']['context'],
  estimatedAp: number,
  money: number,
  careerXp: number,
  deliveryExplanation: string,
): AssignmentOpportunityDefinition {
  return {
    matterKind, slug,
    offer: {
      activityId, title, description,
      employer: { kind: 'person', id: employer },
      category, context,
      requiredSkills: {},
      difficulty: 'demanding',
      estimatedTotalAp: estimatedAp,
      compensation: { money, provisions: 0 },
      careerXpReward: careerXp,
      deliveryChannels: [{ kind: 'baseline_reach', explanation: deliveryExplanation }],
    },
  };
}

export const ERA1_COM_F02_OPPORTUNITY_DEFINITION = opportunity(
  'era1_com_f02_two_claims','era1-com-f02-two-claims',era1ComF02TwoClaims.id,'Two Claims, One Load',
  'Lu-Nanshe wants a neutral account of two claims to one small timber delivery. Compare each request, the sealing, the receipt, and the carrier’s account without deciding which claimant is entitled to the load.',
  p.luNanshe,'commercial_competing_claims',
  {
    what:'Prepare a neutral summary of two claims to one small timber delivery.',
    who:['Lu-Nanshe, responsible authority','Ur-Nanna, Storehouse Steward','Geme-Inana, textile household organizer','Utu-mansum, Receiving Official','Kuli, carrier'],
    quantity:'One small timber load; the two recorded requests may not describe the same quantity.',
    when:'After delivery and before Lu-Nanshe decides priority.',
    where:'Eanna receiving court and the connected textile household work space, Uruk.',
    from:'The Storehouse request, household request and sealing, delivery receipt, and Kuli’s attributed account.',
    to:'Lu-Nanshe for the priority decision; both claimants receive the neutral summary.',
    purpose:'State what each claim and source establishes, what the sealing does not establish, and whether the recorded quantities could support a partial division.',
    responsibility:['The apprentice summarizes only; Lu-Nanshe decides priority; each claimant remains responsible for their own account.'],
    authority:'The Assignment grants no authority to allocate the load, decide entitlement, accuse a claimant, or assign carrier liability.',
    provenance:['Two people give competing accounts of a timber load. The sealing is an impression, not permission to commit the load.'],
  },
  f02Ap,tierA.currency,tierA.baseCareerXp,
  'Lu-Nanshe has requested a neutral summary before making the priority decision.',
);

export const ERA1_COM_F03_OPPORTUNITY_DEFINITION = opportunity(
  'era1_com_f03_partial_return','era1-com-f03-partial-return',era1ComF03PartialReturn.id,'Sent Out, Not Yet Returned',
  'Geme-Inana’s household sent goods out and a first return has arrived only in part. Separate the written dispatch and receipt from the spoken understanding and the carrier’s promise of a later trip.',
  p.gemeInana,'commercial_exchange_obligation',
  {
    what:'Prepare a statement of goods sent, goods returned, and goods claimed outstanding.',
    who:['Geme-Inana, textile household organizer','Kuli, carrier for the outlying counterparty','Enlil-kisu, outbound carrier','Utu-mansum, Receiving Official if the return passed the court'],
    quantity:'One recorded outbound dispatch and one partial return; no written exchange equivalence is established.',
    when:'After the first partial return and before the next outbound dispatch.',
    where:'Geme-Inana’s textile household and the Eanna receiving court, Uruk.',
    from:'The outbound dispatch record, partial return receipt, and separately attributed spoken accounts.',
    to:'Geme-Inana for the decision whether to wait, send word, or withhold the next dispatch.',
    purpose:'Keep sent, returned, and claimed outstanding goods distinct, marking each statement as written or spoken only.',
    responsibility:['The apprentice records the exchange statement; Geme-Inana decides her next step; the counterparty’s obligation is not adjudicated.'],
    authority:'The Assignment grants no authority to declare default, set exchange terms, or determine what the counterparty owes.',
    provenance:['Exchange with outlying communities is known. In this case, the partial return and spoken promise are reported by the people involved, not established by a separate record.'],
  },
  f03Ap,tierB.currency,tierB.baseCareerXp,
  'Geme-Inana has requested a statement of the partial return before deciding what to do with the next dispatch.',
);

export const ERA1_COM_F04_OPPORTUNITY_DEFINITION = opportunity(
  'era1_com_f04_custody_chain','era1-com-f04-custody-chain',era1ComF04CustodyChain.id,'Handed Over Twice',
  'Utu-mansum needs the three tallies set in order after a consignment arrived short and one vessel was cracked. Identify where the records first differ without assigning fault to a custodian.',
  p.utuMansum,'commercial_custody_chain',
  {
    what:'Build a custody chain from dispatch, landing, and receiving tallies.',
    who:['Utu-mansum, Receiving Official','Enlil-kisu, first carrier','Ama-gi, landing agent','Kuli, second carrier','Sig-ana, witness'],
    quantity:'Twelve sealed vessels at dispatch and landing; eleven at receipt, with one vessel noted as cracked.',
    when:'After the receiving tally records the shortage and condition note.',
    where:'The river landing and Eanna receiving court, Uruk.',
    from:'Three separately authored tallies, the receiving condition note, and Sig-ana’s account.',
    to:'Utu-mansum for the receiving exception and any decision to recount or inquire.',
    purpose:'Set the counts in sequence, locate the first recorded difference, and distinguish the interval from the cause.',
    responsibility:['Each custodian accounts for their own interval; the apprentice reports the chain; Utu-mansum decides the receiving follow-up.'],
    authority:'The Assignment grants no authority to assign fault, determine negligence, or decide where loss or damage occurred.',
    provenance:['Tags and sealings accompany the movement of vessels. The landing accounts disagree about this load; the shortage is not located by the available records.'],
  },
  f04Ap,tierA.currency,tierA.baseCareerXp,
  'Utu-mansum has requested a custody-chain report after the receiving tally recorded a difference.',
);

export const ERA_I_COMMERCIAL_FAMILY_OPPORTUNITY_DEFINITIONS = [
  ERA1_COM_F02_OPPORTUNITY_DEFINITION,
  ERA1_COM_F03_OPPORTUNITY_DEFINITION,
  ERA1_COM_F04_OPPORTUNITY_DEFINITION,
] as const;

export const ERA_I_COMMERCIAL_FAMILY_ACTIVITY_CATALOG: Record<string, AssignmentActivityDefinition> = {
  [era1ComF02TwoClaims.id]: era1ComF02TwoClaims,
  [era1ComF03PartialReturn.id]: era1ComF03PartialReturn,
  [era1ComF04CustodyChain.id]: era1ComF04CustodyChain,
} as const;
