import type { PersonId, RecordId } from '../../state/ids';
import type { AssignmentActivityProgress } from '../../state/types';
import type { AssignmentActivityDefinition } from './northBayRoofInspection';
import type { AssignmentOpportunityDefinition } from './opportunityDefinitions';
import { ERA_I_ASSIGNMENT_PARAMETERS } from './eraIParameters';

/** Provisional authored identities. None is presented as an attested Uruk IV individual or office-holder. */
export const ERA1_MAR_PEOPLE = {
  luNanshe: 'person-lu-nanshe' as PersonId,
  shuruppak: 'person-shuruppak-ilu' as PersonId,
  urNanna: 'person-ur-nanna' as PersonId,
  urLamma: 'person-ur-lamma' as PersonId,
  enlilKisu: 'person-enlil-kisu' as PersonId,
  dudu: 'person-dudu' as PersonId,
  gemeInana: 'person-geme-inana-provisional' as PersonId,
  amaGi: 'person-ama-gi-provisional' as PersonId,
  sigAna: 'person-sig-ana-provisional' as PersonId,
  kuli: 'person-kuli' as PersonId,
  ninDara: 'person-nin-dara-provisional' as PersonId,
  sealingOwner: 'person-household-sealing-owner-unnamed' as PersonId,
  luKala: 'person-lu-kala-provisional' as PersonId,
  partyMember: 'person-task-party-member-unnamed' as PersonId,
  urAb: 'person-ur-ab-provisional' as PersonId,
} as const;

export const ERA1_MAR_F01_RECORD_IDS = {
  closureImpression: 'record-era1-mar-f01-closure-impression' as RecordId,
  inventory: 'record-era1-mar-f01-inventory' as RecordId,
  ninDaraAccount: 'record-era1-mar-f01-nin-dara-account' as RecordId,
  ownerAccount: 'record-era1-mar-f01-owner-account' as RecordId,
  authorizationSearch: 'record-era1-mar-f01-authorization-search' as RecordId,
} as const;

export const ERA1_MAR_F02_RECORD_IDS = {
  issueList: 'record-era1-mar-f02-issue-list' as RecordId,
  returnCount: 'record-era1-mar-f02-return-count' as RecordId,
  luKalaAccount: 'record-era1-mar-f02-lu-kala-account' as RecordId,
  partyMemberAccount: 'record-era1-mar-f02-party-member-account' as RecordId,
  siteObservation: 'record-era1-mar-f02-site-observation' as RecordId,
} as const;

export const ERA1_MAR_F03_RECORD_IDS = {
  dispatch: 'record-era1-mar-f03-dispatch' as RecordId,
  landingObservation: 'record-era1-mar-f03-landing-observation' as RecordId,
  enlilAccount: 'record-era1-mar-f03-enlil-account' as RecordId,
  messageClaim: 'record-era1-mar-f03-message-claim' as RecordId,
} as const;

export const ERA1_MAR_F04_RECORD_IDS = {
  removalNote: 'record-era1-mar-f04-removal-note' as RecordId,
  workshopReceipt: 'record-era1-mar-f04-workshop-receipt' as RecordId,
  storehouseSearch: 'record-era1-mar-f04-storehouse-search' as RecordId,
  enlilAccount: 'record-era1-mar-f04-enlil-account' as RecordId,
  urAbAccount: 'record-era1-mar-f04-ur-ab-account' as RecordId,
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

/** Estimate from the authored action AP plus submission AP; proposed source-document estimates are not imported. */
function estimatedTotalAp(definition: AssignmentActivityDefinition): number {
  return definition.actions.reduce((total, action) => total + action.apCost, definition.submissionApCost);
}

const tierA = ERA_I_ASSIGNMENT_PARAMETERS.tierA;
const tierB = ERA_I_ASSIGNMENT_PARAMETERS.tierB;
const p = ERA1_MAR_PEOPLE;

export const era1MarF01DoorOpened = activity({
  id: 'activity-era1-mar-f01-door-opened',
  title: 'The Door That Was Opened',
  submissionApCost: 1,
  participants: [p.luNanshe,p.shuruppak,p.urNanna,p.ninDara,p.sealingOwner],
  discoveries: [
    { id: 'mar01-closure-impression', title: 'Present closure impression', text: 'The strongroom closure is re-sealed with an impression that differs from the household’s known sealing. The impression establishes which seal was used, not who was authorized to open the room.', sourceProvenanceId: 'mar01-closure-impression' },
    { id: 'mar01-inventory', title: 'Inventory of contents', text: 'The inventory lists what should be inside the strongroom; the current check finds the listed contents present. The contents match the inventory, but this does not identify who entered or when.', sourceProvenanceId: 'mar01-inventory' },
    { id: 'mar01-nin-dara-account', title: 'Nin-dara’s account', text: 'Nin-dara says she opened the door for a man who showed a sealing. She was trusted with access that day; her account does not identify the man or establish who sent him.', sourceProvenanceId: 'mar01-nin-dara-account' },
    { id: 'mar01-owner-account', title: 'Sealing owner’s account', text: 'The sealing owner says no one was sent to open the strongroom. This is an attributed account and does not by itself prove who entered.', sourceProvenanceId: 'mar01-owner-account' },
    { id: 'mar01-authorization-search', title: 'Earlier authorization search', text: 'No earlier authorization record has been linked to this opening in the records examined. The absence of a linked record does not prove that no authorization was given.', sourceProvenanceId: 'mar01-authorization-search' },
  ],
  actions: [
    { id: 'mar01-review-closure-inventory', family: 'compare', label: 'Compare closure and inventory',
      description: 'Compare the present impression with the known household sealing and check the inventory of contents.',
      apCost: 1, discoveryIds: ['mar01-closure-impression','mar01-inventory'] },
    { id: 'mar01-consult-nin-dara', family: 'consult', label: 'Hear Nin-dara’s account',
      description: 'Record what Nin-dara says about opening the door and the sealing shown to her.',
      apCost: 1, prerequisites: ['mar01-review-closure-inventory'], discoveryIds: ['mar01-nin-dara-account'], consultedPersonId: p.ninDara },
    { id: 'mar01-consult-owner', family: 'consult', label: 'Hear the sealing owner’s account',
      description: 'Record the owner’s account and check whether an authorization is linked to this opening.',
      apCost: 1, prerequisites: ['mar01-review-closure-inventory'], discoveryIds: ['mar01-owner-account','mar01-authorization-search'], consultedPersonId: p.sealingOwner },
  ],
  interpretationRules: [],
  reportSchema: {
    title: 'Strongroom access account',
    responsibilityLabel: 'Responsibility claim',
    findings: [
      { id: 'impression_differs', label: 'The present impression differs from the household’s known sealing' },
      { id: 'contents_match_inventory', label: 'The contents checked match the inventory' },
      { id: 'authorization_not_linked', label: 'No authorization record is linked to this opening in the records examined' },
      { id: 'theft_established', label: 'The evidence establishes theft' },
    ],
    responsibilityClaims: [
      { id: 'none', label: 'No accusation or individual fault assigned' },
      { id: 'nin_dara', label: 'Assign fault to Nin-dara' },
      { id: 'sealing_owner', label: 'Assign fault to the sealing owner' },
      { id: 'unknown_entrant', label: 'Assign fault to the unidentified entrant' },
    ],
    recommendations: [
      { id: 'check_inventory', label: 'Order an inventory check before further conclusions' },
      { id: 'further_inquiry', label: 'Recommend a further inquiry by Lu-Nanshe' },
      { id: 'no_further_action', label: 'Record the account and recommend no further action' },
    ],
    limitationsLabel: 'Access and evidence limits',
    limitationOptions: [
      { id: 'seal_not_authority', label: 'An authentic impression proves a seal was used, not that its holder was authorized' },
      { id: 'inventory_not_entrant', label: 'The inventory shows expected contents, not who entered' },
      { id: 'accounts_attributed', label: 'Nin-dara’s and the owner’s statements remain separately attributed accounts' },
      { id: 'absence_not_proof', label: 'No linked authorization record does not prove that no authorization existed' },
    ],
  },
  evaluation: {
    requiredEvidenceIds: ['mar01-closure-impression','mar01-inventory','mar01-nin-dara-account','mar01-owner-account','mar01-authorization-search'],
    requiredLimitationIds: ['seal_not_authority','inventory_not_entrant','accounts_attributed','absence_not_proof'],
    relevantEvidenceIds: [],
    relevantLimitationIds: [],
    unsupportedFindingIds: ['theft_established'],
    unsupportedResponsibilityClaimIds: ['nin_dara','sealing_owner','unknown_entrant'],
    receiverPersonId: p.luNanshe,
    relationshipPersonIds: [p.ninDara],
    rationales: {
      Thorough: 'The different impression, matching contents, and two accounts are kept distinct. The report states what is and is not linked to an authorization without accusing anyone.',
      Defensible: 'The report compares the different seal impression and matching inventory while preserving the difference between physical access and permission.',
      Incomplete: 'A required account, inventory comparison, or authorization limitation is missing.',
      Overreached: 'The report calls the event theft or treats an impression as proof of authority or guilt.',
    },
    reactions: {
      Thorough: 'Lu-Nanshe studies the account. “You have shown what the seal can tell me and what it cannot. I will decide whether to inquire further.”',
      Defensible: 'Lu-Nanshe nods. “The opening is accounted for as far as these sources allow. I will decide what follows.”',
      Incomplete: 'Lu-Nanshe sets the copy aside. “I need the inventory and both accounts before I can act.”',
      Overreached: 'Lu-Nanshe closes the tablet. “You have accused someone where the evidence only shows an opening and conflicting accounts.”',
    },
  },
  submissionNote: 'Lu-Nanshe retains authority to order an inventory check, make a further inquiry, or take no further action. The scribe does not accuse, discipline, or release the contents.',
});

export const era1MarF02PartyReturnsShort = activity({
  id: 'activity-era1-mar-f02-party-returns-short',
  title: 'The Gathered Party Returns Short',
  submissionApCost: 1,
  participants: [p.luNanshe,p.shuruppak,p.luKala,p.partyMember,p.dudu,p.urAb,p.enlilKisu],
  discoveries: [
    { id: 'mar02-issue-list', title: 'Task issue list', text: 'The issue list records tools and provisions handed to a party gathered for a repair. The leader needs the count settled before they disperse; the list says nothing about a standing unit.', sourceProvenanceId: 'mar02-issue-list' },
    { id: 'mar02-return-count', title: 'Return count', text: 'The return count lists tools returned and tools not yet accounted for. It does not establish whether an item was lost, left at the site, or retained for the next day.', sourceProvenanceId: 'mar02-return-count' },
    { id: 'mar02-lu-kala-account', title: 'Lu-kala’s account', text: 'Lu-kala says some tools were left at the work site for the next day and one person has not yet returned. His account is attributed and is not proof of deliberate retention or neglect.', sourceProvenanceId: 'mar02-lu-kala-account' },
    { id: 'mar02-party-member-account', title: 'Party member’s account', text: 'A member of the task party gives a different account of one missing tool and the person still away. This is an attributed statement, not a formal disciplinary finding.', sourceProvenanceId: 'mar02-party-member-account' },
    { id: 'mar02-site-observation', title: 'Work-site observation', text: 'A watcher reports that tools may have been left at the site. The observation is a lead for a visit, not proof of the final count or of anyone’s conduct.', sourceProvenanceId: 'mar02-site-observation' },
  ],
  actions: [
    { id: 'mar02-compare-issue-return', family: 'compare', label: 'Compare issue list and return count',
      description: 'Set out what the sponsor issued and what was counted on return.',
      apCost: 1, discoveryIds: ['mar02-issue-list','mar02-return-count'] },
    { id: 'mar02-consult-lu-kala', family: 'consult', label: 'Hear Lu-kala’s account',
      description: 'Record the task leader’s explanation without treating it as proof.',
      apCost: 1, prerequisites: ['mar02-compare-issue-return'], discoveryIds: ['mar02-lu-kala-account'], consultedPersonId: p.luKala },
    { id: 'mar02-consult-party-witness', family: 'consult', label: 'Hear a party member and check the site account',
      description: 'Keep the member’s account and the watcher’s observation separately attributed.',
      apCost: 1, prerequisites: ['mar02-compare-issue-return'], discoveryIds: ['mar02-party-member-account','mar02-site-observation'], consultedPersonId: p.partyMember },
  ],
  interpretationRules: [],
  reportSchema: {
    title: 'Task-party return account',
    responsibilityLabel: 'Responsibility claim',
    findings: [
      { id: 'issue_return_gap_documented', label: 'The issue list and return count show an unresolved gap' },
      { id: 'tools_left_for_next_day_reported', label: 'The accounts report that some tools were left at the site for the next day' },
      { id: 'one_person_not_returned', label: 'One person remains away from the returning party' },
      { id: 'deliberate_retention_established', label: 'The evidence establishes deliberate retention of tools' },
      { id: 'negligence_established', label: 'The evidence establishes neglect of the task' },
    ],
    responsibilityClaims: [
      { id: 'none', label: 'No individual fault assigned' },
      { id: 'lu_kala', label: 'Assign fault to Lu-kala' },
      { id: 'party_member', label: 'Assign fault to the unnamed party member' },
      { id: 'sponsor', label: 'Assign fault to the sponsor' },
    ],
    recommendations: [
      { id: 'visit_site', label: 'Recommend a visit to the work site' },
      { id: 'ask_party_member', label: 'Ask the returning party member for clarification' },
      { id: 'check_tools_with_dudu', label: 'Ask Dudu to identify tools that may need repair or remain at the site' },
      { id: 'accept_provisional_account', label: 'Accept the account as reported and keep the gap open' },
    ],
    limitationsLabel: 'Task and accountability limits',
    limitationOptions: [
      { id: 'issue_not_obligation', label: 'The issue list shows what was handed out, not a universal obligation to return every item that day' },
      { id: 'count_not_reason', label: 'The return count shows a gap, not why it exists' },
      { id: 'no_muster', label: 'This was a sponsor-gathered task party, not a formal muster or standing unit' },
      { id: 'accounts_not_verified', label: 'The explanations are attributed accounts and have not been independently verified' },
    ],
  },
  evaluation: {
    requiredEvidenceIds: ['mar02-issue-list','mar02-return-count','mar02-lu-kala-account','mar02-party-member-account','mar02-site-observation'],
    requiredLimitationIds: ['issue_not_obligation','count_not_reason','no_muster','accounts_not_verified'],
    relevantEvidenceIds: [],
    relevantLimitationIds: [],
    unsupportedFindingIds: ['deliberate_retention_established','negligence_established'],
    unsupportedResponsibilityClaimIds: ['lu_kala','party_member','sponsor'],
    receiverPersonId: p.luNanshe,
    relationshipPersonIds: [p.luKala],
    rationales: {
      Thorough: 'The issue list, return count, and each account remain distinct. The report does not turn an unresolved gap into a finding of neglect or deliberate retention.',
      Defensible: 'The report identifies the outstanding items and the accounts given while preserving the limits of a task-specific party.',
      Incomplete: 'A required issue, return, account, or limitation is missing.',
      Overreached: 'The report declares neglect, deliberate retention, or a formal muster obligation without evidence.',
    },
    reactions: {
      Thorough: 'Lu-Nanshe reads the account. “I can ask what remains at the site without accusing the party of abandoning it.”',
      Defensible: 'Lu-Nanshe nods. “The shortfall is recorded. I will decide whether to visit the site or ask further questions.”',
      Incomplete: 'Lu-Nanshe sets the tablet aside. “I need the issue and return counts together before I act.”',
      Overreached: 'Lu-Nanshe frowns. “A task party is not a standing unit, and a missing tool is not proof of neglect.”',
    },
  },
  submissionNote: 'Lu-Nanshe decides whether to ask questions, send someone to the site, or accept the account. The scribe does not find fault or recover tools.',
});

export const era1MarF03LateTurnedAside = activity({
  id: 'activity-era1-mar-f03-late-turned-aside',
  title: 'Late, or Turned Aside',
  submissionApCost: 1,
  participants: [p.gemeInana,p.enlilKisu,p.amaGi,p.sigAna,p.kuli],
  discoveries: [
    { id: 'mar03-dispatch', title: 'Dispatch and expected arrival', text: 'The dispatch records a valued load and an expected arrival. It establishes the plan, not that the load reached the destination.', sourceProvenanceId: 'mar03-dispatch' },
    { id: 'mar03-enlil-account', title: 'Enlil-kisu’s account of the halt', text: 'Enlil-kisu says the carrying party halted at a landing because the approach route was unsafe. This is his account; the evidence does not independently establish danger on the road.', sourceProvenanceId: 'mar03-enlil-account' },
    { id: 'mar03-landing-observation', title: 'Landing observation', text: 'Ama-gi reports that the party was at the landing later than expected. The observation establishes presence and delay, not the reason for the halt or what happened to the load.', sourceProvenanceId: 'mar03-landing-observation' },
    { id: 'mar03-message-claim', title: 'Claimed change-of-plan message', text: 'Sig-ana says word of a change was sent. No record confirms who carried the message or whether Geme-Inana received it.', sourceProvenanceId: 'mar03-message-claim' },
  ],
  actions: [
    { id: 'mar03-review-dispatch', family: 'observe', label: 'Review dispatch and expected arrival',
      description: 'Establish what was sent and when it was expected.',
      apCost: 1, discoveryIds: ['mar03-dispatch'] },
    { id: 'mar03-consult-carrier', family: 'consult', label: 'Hear Enlil-kisu’s account',
      description: 'Record the carrier’s explanation of the halt without endorsing it.',
      apCost: 1, prerequisites: ['mar03-review-dispatch'], discoveryIds: ['mar03-enlil-account'], consultedPersonId: p.enlilKisu },
    { id: 'mar03-check-landing-message', family: 'compare', label: 'Compare landing observation and message claim',
      description: 'Keep the observed delay separate from the unconfirmed message.',
      apCost: 1, prerequisites: ['mar03-review-dispatch'], discoveryIds: ['mar03-landing-observation','mar03-message-claim'], consultedPersonId: p.sigAna },
  ],
  interpretationRules: [],
  reportSchema: {
    title: 'Movement account',
    responsibilityLabel: 'Responsibility claim',
    findings: [
      { id: 'dispatch_expected_arrival', label: 'The dispatch and expected arrival are recorded' },
      { id: 'halt_reported', label: 'A halt at the landing is reported but its cause is not independently confirmed' },
      { id: 'message_claim_unconfirmed', label: 'A change-of-plan message is claimed but not confirmed by a record' },
      { id: 'diversion_established', label: 'The evidence establishes that the load was diverted' },
      { id: 'road_unsafe_established', label: 'The evidence establishes that the road was unsafe' },
    ],
    responsibilityClaims: [
      { id: 'none', label: 'No diversion or individual fault assigned' },
      { id: 'enlil_kisu', label: 'Assign fault to Enlil-kisu' },
      { id: 'sig_ana', label: 'Assign fault to Sig-ana' },
      { id: 'ama_gi', label: 'Assign fault to Ama-gi' },
      { id: 'unknown_party', label: 'Assign fault to an unidentified party' },
    ],
    recommendations: [
      { id: 'wait_for_load', label: 'Wait for the load while keeping the delay unresolved' },
      { id: 'send_to_landing', label: 'Send someone to check the landing and the load' },
      { id: 'verify_message', label: 'Ask who carried the claimed message and whether it was received' },
      { id: 'record_unresolved', label: 'Record the delay and the competing accounts without a conclusion' },
    ],
    limitationsLabel: 'Movement and authority limits',
    limitationOptions: [
      { id: 'dispatch_not_arrival', label: 'The dispatch records the plan, not arrival at the destination' },
      { id: 'accounts_not_cause', label: 'The accounts do not independently establish the cause of the halt' },
      { id: 'message_unconfirmed', label: 'The claimed message has no confirming record or confirmed recipient' },
      { id: 'no_judgment_or_payment', label: 'The scribe has no authority to judge the carrier or release payment' },
    ],
  },
  evaluation: {
    requiredEvidenceIds: ['mar03-dispatch','mar03-enlil-account','mar03-landing-observation','mar03-message-claim'],
    requiredLimitationIds: ['dispatch_not_arrival','accounts_not_cause','message_unconfirmed','no_judgment_or_payment'],
    relevantEvidenceIds: [],
    relevantLimitationIds: [],
    unsupportedFindingIds: ['diversion_established','road_unsafe_established'],
    unsupportedResponsibilityClaimIds: ['enlil_kisu','sig_ana','ama_gi','unknown_party'],
    receiverPersonId: p.gemeInana,
    relationshipPersonIds: [p.enlilKisu],
    rationales: {
      Thorough: 'The dispatch, carrier account, landing observation, and message claim remain distinct. Neither diversion nor unsafe travel is asserted as fact.',
      Defensible: 'The report records the delay and competing accounts while leaving the cause unresolved.',
      Incomplete: 'A required dispatch, account, observation, or authority limitation is missing.',
      Overreached: 'The report declares diversion, danger, or individual fault without confirming evidence.',
    },
    reactions: {
      Thorough: 'Geme-Inana studies the account. “I know what was expected and what is being said. I will decide whether to wait or send someone.”',
      Defensible: 'Geme-Inana nods. “The delay is clear. The reason is not. I will decide what to do with the carrier’s credit.”',
      Incomplete: 'Geme-Inana taps the dispatch line. “I need the expected arrival and the landing account together.”',
      Overreached: 'Geme-Inana frowns. “You have called it diversion when the load has not yet been found.”',
    },
  },
  submissionNote: 'Geme-Inana decides whether to wait, send someone, or hold the carrier’s credit. The scribe does not judge the carrier or declare theft.',
});

export const era1MarF04ValuedObjectTrail = activity({
  id: 'activity-era1-mar-f04-valued-object-trail',
  title: 'The Trail of a Valued Object',
  submissionApCost: 1,
  participants: [p.luNanshe,p.shuruppak,p.urLamma,p.urNanna,p.urAb,p.enlilKisu],
  discoveries: [
    { id: 'mar04-removal-note', title: 'Removal note', text: 'The removal note records a carved stone vessel taken from storage for repair or cleaning. The household wants it returned before the next ceremony; the note does not establish its exact use.', sourceProvenanceId: 'mar04-removal-note' },
    { id: 'mar04-workshop-receipt', title: 'Workshop receipt', text: 'The workshop receipt records the object arriving with Ur-Lamma for repair or cleaning. It establishes receipt at the workshop, not a later return handover.', sourceProvenanceId: 'mar04-workshop-receipt' },
    { id: 'mar04-storehouse-search', title: 'Storehouse return-entry search', text: 'No return handover entry is located in the Storehouse record examined. The absence of an entry does not prove that a spoken handover did not occur.', sourceProvenanceId: 'mar04-storehouse-search' },
    { id: 'mar04-enlil-account', title: 'Enlil-kisu’s account', text: 'Enlil-kisu gives an account of carrying the object between locations. His statement may identify an interval to check but does not establish where the object is now.', sourceProvenanceId: 'mar04-enlil-account' },
    { id: 'mar04-ur-ab-account', title: 'Ur-ab’s observation', text: 'Ur-ab reports seeing part of the movement near the yard. This is an attributed observation, not proof of the complete custody chain or individual fault.', sourceProvenanceId: 'mar04-ur-ab-account' },
  ],
  actions: [
    { id: 'mar04-review-removal', family: 'observe', label: 'Review removal note',
      description: 'Establish why and under whose authority the object left permanent storage.',
      apCost: 1, discoveryIds: ['mar04-removal-note'] },
    { id: 'mar04-review-workshop', family: 'observe', label: 'Review workshop receipt',
      description: 'Establish the recorded arrival at the workshop.',
      apCost: 1, prerequisites: ['mar04-review-removal'], discoveryIds: ['mar04-workshop-receipt'] },
    { id: 'mar04-check-storehouse-entry', family: 'compare', label: 'Check the return entry and carrier account',
      description: 'Compare the absence of a located return entry with the attributed carrying account.',
      apCost: 1, prerequisites: ['mar04-review-workshop'], discoveryIds: ['mar04-storehouse-search','mar04-enlil-account'], consultedPersonId: p.enlilKisu },
    { id: 'mar04-consult-ur-ab', family: 'consult', label: 'Hear Ur-ab’s observation',
      description: 'Record the yard observation as a lead for the next custody check.',
      apCost: 1, prerequisites: ['mar04-review-workshop'], discoveryIds: ['mar04-ur-ab-account'], consultedPersonId: p.urAb },
  ],
  interpretationRules: [],
  reportSchema: {
    title: 'Valued-object custody trail',
    responsibilityLabel: 'Responsibility claim',
    findings: [
      { id: 'removal_and_workshop_receipt', label: 'Removal and workshop receipt are recorded' },
      { id: 'return_handover_not_recorded', label: 'No return handover is recorded in the Storehouse entry examined' },
      { id: 'spoken_handover_reported', label: 'A spoken handover is reported but not recorded' },
      { id: 'object_location_unknown', label: 'The object’s present location remains unknown' },
      { id: 'custodian_fault_established', label: 'The evidence establishes which custodian is at fault' },
    ],
    responsibilityClaims: [
      { id: 'none', label: 'No individual responsibility assigned' },
      { id: 'ur_lamma', label: 'Assign responsibility to Ur-Lamma' },
      { id: 'ur_nanna', label: 'Assign responsibility to Ur-Nanna' },
      { id: 'ur_ab', label: 'Assign responsibility to Ur-ab' },
      { id: 'enlil_kisu', label: 'Assign responsibility to Enlil-kisu' },
    ],
    recommendations: [
      { id: 'locate_before_inquiry', label: 'Recommend locating the object before asking anyone to explain the gap' },
      { id: 'ask_each_custodian', label: 'Ask each custodian to account for their own interval' },
      { id: 'check_workshop', label: 'Check the workshop and its return records' },
      { id: 'record_custody_intervals', label: 'Record each known custody interval and leave the gap open' },
    ],
    limitationsLabel: 'Custody and authority limits',
    limitationOptions: [
      { id: 'records_show_intervals', label: 'The removal note and workshop receipt establish only their own custody intervals' },
      { id: 'missing_entry_not_missing_handover', label: 'A missing return entry does not prove that no spoken handover occurred' },
      { id: 'spoken_account_is_lead', label: 'A spoken account is a lead to check, not a complete custody record' },
      { id: 'gap_not_fault', label: 'A gap in the trail does not establish individual fault or mishandling' },
    ],
  },
  evaluation: {
    requiredEvidenceIds: ['mar04-removal-note','mar04-workshop-receipt','mar04-storehouse-search','mar04-enlil-account','mar04-ur-ab-account'],
    requiredLimitationIds: ['records_show_intervals','missing_entry_not_missing_handover','spoken_account_is_lead','gap_not_fault'],
    relevantEvidenceIds: [],
    relevantLimitationIds: [],
    unsupportedFindingIds: ['custodian_fault_established'],
    unsupportedResponsibilityClaimIds: ['ur_lamma','ur_nanna','ur_ab','enlil_kisu'],
    receiverPersonId: p.luNanshe,
    relationshipPersonIds: [p.urLamma,p.urNanna,p.urAb],
    rationales: {
      Thorough: 'The removal, workshop receipt, return-entry search, and two accounts are ordered as separate intervals. The report does not treat a gap as fault.',
      Defensible: 'The report records the known trail and the missing return entry while preserving the limits of spoken accounts.',
      Incomplete: 'A required custody source or limitation is missing.',
      Overreached: 'The report assigns responsibility or claims to know where the object is without a complete trail.',
    },
    reactions: {
      Thorough: 'Lu-Nanshe reads the trail. “I can ask each person about their own interval. I will not accuse someone because a line is missing.”',
      Defensible: 'Lu-Nanshe nods. “The gap is clear. I will decide whether to search or ask the custodians.”',
      Incomplete: 'Lu-Nanshe sets the tablet aside. “I need the removal and workshop records before I can follow the trail.”',
      Overreached: 'Lu-Nanshe frowns. “A missing handover is not proof of mishandling.”',
    },
  },
  submissionNote: 'Lu-Nanshe and the responsible institutional authority decide whether to search, ask custodians, or report the object missing. The scribe does not assign responsibility or demand the object.',
});

const m01Ap = estimatedTotalAp(era1MarF01DoorOpened);
const m02Ap = estimatedTotalAp(era1MarF02PartyReturnsShort);
const m03Ap = estimatedTotalAp(era1MarF03LateTurnedAside);
const m04Ap = estimatedTotalAp(era1MarF04ValuedObjectTrail);

function opportunity(
  matterKind: 'era1_mar_f01_door_opened' | 'era1_mar_f02_party_returns_short' | 'era1_mar_f03_late_turned_aside' | 'era1_mar_f04_valued_object_trail',
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

export const ERA1_MAR_F01_OPPORTUNITY_DEFINITION = opportunity(
  'era1_mar_f01_door_opened','era1-mar-f01-door-opened',era1MarF01DoorOpened.id,'The Door That Was Opened',
  'Lu-Nanshe asks for an access account after a household strongroom is found re-sealed. Compare the impression, inventory, and attributed accounts without accusing anyone or treating a seal as proof of authority.',
  p.luNanshe,'security_access_account',
  {
    what:'Write an access account for a household strongroom found re-sealed.',
    who:['Lu-Nanshe, responsible authority','Nin-dara, household member entrusted with access','The sealing owner, unnamed household member','Ur-Nanna, custody comparison'],
    quantity:'One strongroom closure and its recorded inventory.',
    when:'After the re-sealed closure is found and before Lu-Nanshe decides whether to inquire.',
    where:'A household strongroom in Uruk, where a disputed opening has left two accounts to compare.',
    from:'The closure impression, inventory, two attributed accounts, and a search for an earlier authorization record.',
    to:'Lu-Nanshe for a decision about inventory check or further inquiry.',
    purpose:'Separate physical access, the seal impression, the inventory, and the question of permission.',
    responsibility:['Lu-Nanshe decides whether to inquire; Nin-dara and the sealing owner answer for their own accounts.'],
    authority:'The Assignment grants no authority to accuse, discipline, or release the contents.',
    provenance:['Seals and sealings are used to track custody. Here, the household must decide what to do with two conflicting accounts; the sealing alone does not identify who opened the room.'],
  },
  m01Ap,tierB.currency,tierB.baseCareerXp,
  'Lu-Nanshe requests the account; an existing household connection or access to the custodian may also bring the matter within reach.',
);

export const ERA1_MAR_F02_OPPORTUNITY_DEFINITION = opportunity(
  'era1_mar_f02_party_returns_short','era1-mar-f02-party-returns-short',era1MarF02PartyReturnsShort.id,'The Gathered Party Returns Short',
  'A sponsor-gathered task party returns with tools not yet accounted for and one person still away. Compare the issue list, return count, and attributed accounts without treating the party as a formal muster or standing unit.',
  p.luNanshe,'task_party_return_account',
  {
    what:'Write a return account for a task-specific party and the tools and provisions issued to it.',
    who:['Lu-Nanshe, sponsor','Lu-kala, who gathered the repair party','An unnamed party member','Dudu, tool repairer and witness','Ur-ab, who was waiting at the yard'],
    quantity:'One task party, its issue list, returned tools, and unresolved gaps.',
    when:'After the party returns from the north-bay repair task.',
    where:'Uruk and the nearby repair site.',
    from:'The issue list, return count, Lu-kala’s account, a party member’s account, and a site observation.',
    to:'Lu-Nanshe for questions, a site visit, or acceptance of the account.',
    purpose:'State what was issued, returned, and unaccounted for; preserve each explanation as an attributed account.',
    responsibility:['Lu-Nanshe decides what to do about the shortfall; Lu-kala answers for his party’s account.'],
    authority:'The Assignment grants no authority to find fault, recover items, or impose a formal muster obligation.',
    provenance:['Tools were issued for a particular repair and counted on return. The people gathered for this task had to settle the missing item before leaving; no standing unit is implied.'],
  },
  m02Ap,tierB.currency,tierB.baseCareerXp,
  'Lu-Nanshe requests a return account after a task-specific party comes back from the repair site.',
);

export const ERA1_MAR_F03_OPPORTUNITY_DEFINITION = opportunity(
  'era1_mar_f03_late_turned_aside','era1-mar-f03-late-turned-aside',era1MarF03LateTurnedAside.id,'Late, or Turned Aside',
  'A valued load has not arrived by its expected day. Separate the dispatch plan, the carrier’s account of a halt, the landing observation, and the unconfirmed message claim.',
  p.gemeInana,'movement_delay_account',
  {
    what:'Write a movement account for a dispatch that has not arrived by its expected day.',
    who:['Geme-Inana, sponsor','Enlil-kisu, carrier','Ama-gi, landing observer','Sig-ana, claimed message carrier','Kuli, connected carrier'],
    quantity:'One valued load and one unresolved lateness episode.',
    when:'After the expected arrival passes without a receipt.',
    where:'The route runs from Uruk toward the outlying work site. The carrier’s account describes why the party halted; the exact path is not recorded.',
    from:'The dispatch record, Enlil-kisu’s account, landing observation, and claimed message.',
    to:'Geme-Inana for a decision to wait, send someone, or hold the carrier’s credit.',
    purpose:'Record what was dispatched, what was expected, and what is and is not known about the delay and claimed change of plan.',
    responsibility:['Geme-Inana decides how to respond; Enlil-kisu remains responsible for the load and his own account.'],
    authority:'The Assignment grants no authority to judge the carrier, declare diversion, or release payment.',
    provenance:['Goods and people moved between settlements. In this incident the carrier halted when the route seemed unsafe; the account gives no basis for assuming a permanent escort or road office.'],
  },
  m03Ap,tierB.currency,tierB.baseCareerXp,
  'Geme-Inana requests an account after the expected arrival passes without a receipt.',
);

export const ERA1_MAR_F04_OPPORTUNITY_DEFINITION = opportunity(
  'era1_mar_f04_valued_object_trail','era1-mar-f04-valued-object-trail',era1MarF04ValuedObjectTrail.id,'The Trail of a Valued Object',
  'A valued object was recorded leaving permanent storage for repair, and the workshop receipt is present, but no return handover is recorded. Order the known custody intervals without assigning fault.',
  p.luNanshe,'valued_object_custody_trail',
  {
    what:'Reconstruct the known custody trail for one valued object moved out of permanent storage.',
    who:['Lu-Nanshe, responsible authority','Ur-Lamma, workshop overseer','Ur-Nanna, Storehouse Steward','Ur-ab, who was waiting at the yard','Enlil-kisu, carrier'],
    quantity:'One valued object, described in the removal note as a carved stone vessel.',
    when:'After the workshop receipt exists and the expected return handover remains open.',
    where:'A precinct handover point, workshop, and Storehouse in Uruk.',
    from:'The removal note, workshop receipt, Storehouse return-entry search, and two attributed accounts.',
    to:'Lu-Nanshe and the precinct body for a search or custodian inquiry.',
    purpose:'Set out each known custody interval, identify the gap, and state who can attest to each interval.',
    responsibility:['Each custodian answers for their own interval; Lu-Nanshe and the precinct body decide what follows.'],
    authority:'The Assignment grants no authority to demand the object, assign fault, or declare mishandling.',
    provenance:['Seals and records can trace custody of valued objects. The household wants the vessel returned before preparations; the note does not establish a particular rite or the object’s full history.'],
  },
  m04Ap,tierA.currency,tierA.baseCareerXp,
  'Lu-Nanshe requests a custody trail after the object’s expected return is not recorded.',
);

export const ERA_I_MARTIAL_FAMILY_OPPORTUNITY_DEFINITIONS = [
  ERA1_MAR_F01_OPPORTUNITY_DEFINITION,
  ERA1_MAR_F02_OPPORTUNITY_DEFINITION,
  ERA1_MAR_F03_OPPORTUNITY_DEFINITION,
  ERA1_MAR_F04_OPPORTUNITY_DEFINITION,
] as const;

export const ERA_I_MARTIAL_FAMILY_ACTIVITY_CATALOG: Record<string, AssignmentActivityDefinition> = {
  [era1MarF01DoorOpened.id]: era1MarF01DoorOpened,
  [era1MarF02PartyReturnsShort.id]: era1MarF02PartyReturnsShort,
  [era1MarF03LateTurnedAside.id]: era1MarF03LateTurnedAside,
  [era1MarF04ValuedObjectTrail.id]: era1MarF04ValuedObjectTrail,
} as const;
