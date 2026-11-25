import type { PersonId } from '../../state/ids';
import type { AssignmentActivityDefinition } from './northBayRoofInspection';
import type { AssignmentOpportunityDefinition } from './opportunityDefinitions';
import { ERA_I_ASSIGNMENT_PARAMETERS } from './eraIParameters';
import { ERA_I_COMMERCIAL_FAMILY_OPPORTUNITY_DEFINITIONS } from './eraICommercialFamilies';
import { ERA_I_MARTIAL_FAMILY_OPPORTUNITY_DEFINITIONS } from './eraIMartialFamilies';

export const ERA1_COM_F01_ACTIVITY_ID = 'activity-era1-com-f01-material-description';
export const ERA1_COM_F01_PEOPLE = {
  receiver: 'person-utu-mansum' as PersonId,
  workshopOverseer: 'person-ur-lamma' as PersonId,
  responsibleAuthority: 'person-lu-nanshe' as PersonId,
  carrier: 'person-kuli' as PersonId,
} as const;

function activity(definition: Omit<AssignmentActivityDefinition, 'createInitialProgress'>): AssignmentActivityDefinition {
  return {
    ...definition,
    createInitialProgress: () => ({
      completedActionIds: [], discoveryIds: [], consultedPersonIds: [],
      draft: {
        finding: 'tag_observation_differ', responsibilityClaim: 'none',
        citedDiscoveryIds: [], limitations: [], recommendations: [], selectedLimitationIds: [],
      },
    }),
  };
}

/** The records establish descriptions and observations, not identity, origin, or liability. */
export const materialNotAsDescribed: AssignmentActivityDefinition = activity({
  id: ERA1_COM_F01_ACTIVITY_ID,
  title: 'Material Not As Described',
  submissionApCost: 1,
  participants: Object.values(ERA1_COM_F01_PEOPLE),
  discoveries: [
    { id: 'comf01-request', title: 'The procurement request',
      text: 'the request asks for worked timber for a precinct craft commission. It does not specify a species or establish the origin of the material eventually delivered.' },
    { id: 'comf01-tag', title: 'The sender’s tag',
      text: 'the tag describes the load as worked timber. This establishes the sender’s written description, not the material’s actual species, origin, or suitability.' },
    { id: 'comf01-observation', title: 'The receiving observation',
      text: 'the receiving list describes the visible pieces as unworked. It records their observable state only; it does not identify the timber species, origin, or suitability for the intended work.' },
    { id: 'comf01-carrier-account', title: 'Kuli’s account',
      text: 'Kuli says he carried the covered load from the outlying counterparty to the receiving court. His account is testimony about his part in the movement; it does not independently establish the load’s contents or the custody of every earlier stage.' },
  ],
  actions: [
    { id: 'comf01-consult-receiver', family: 'consult', label: 'Consult Utu-mansum',
      description: 'Establish what was requested and why the receiving entry has been held for comparison.',
      apCost: 1, discoveryIds: ['comf01-request'], consultedPersonId: ERA1_COM_F01_PEOPLE.receiver },
    { id: 'comf01-compare-request-tag', family: 'compare', label: 'Compare request and tag',
      description: 'Record the requester’s wording separately from the sender’s description.',
      apCost: 1, prerequisites: ['comf01-consult-receiver'], discoveryIds: ['comf01-request','comf01-tag'] },
    { id: 'comf01-inspect-load', family: 'observe', label: 'Inspect the delivered material',
      description: 'Record visible characteristics and condition without claiming to identify the material.',
      apCost: 1, discoveryIds: ['comf01-observation'] },
    { id: 'comf01-consult-carrier', family: 'consult', label: 'Consult Kuli',
      description: 'Hear the carrier’s account and keep testimony distinct from the receiving observation.',
      apCost: 1, discoveryIds: ['comf01-carrier-account'], consultedPersonId: ERA1_COM_F01_PEOPLE.carrier },
  ],
  interpretationRules: [],
  reportSchema: {
    title: 'Material description comparison',
    responsibilityLabel: 'Responsibility claim',
    findings: [
      { id: 'tag_observation_differ', label: 'The sender’s tag and receiving observation differ on worked state' },
      { id: 'descriptions_agree', label: 'The supplied descriptions agree' },
      { id: 'request_silent', label: 'The request is silent on the disputed point' },
      { id: 'identify_material', label: 'Identify the delivered material and its origin' },
    ],
    responsibilityClaims: [
      { id: 'none', label: 'No individual responsibility assigned' },
      { id: 'carrier_blame', label: 'Assign responsibility to Kuli' },
      { id: 'sender_blame', label: 'Accuse the sender of deliberate substitution' },
    ],
    recommendations: [
      { id: 'hold_for_craft_examination', label: 'Hold the receipt pending a craft examination by Ur-Lamma' },
      { id: 'enter_with_exception', label: 'Enter the receipt with the description difference explicitly recorded' },
      { id: 'request_clarifying_record', label: 'Request a clarifying record from the counterparty' },
    ],
    limitationsLabel: 'Description, evidence, and authority limits',
    limitationOptions: [
      { id: 'material_not_identified', label: 'The available sources do not identify the material’s species or origin' },
      { id: 'no_intent_or_liability', label: 'The discrepancy does not establish deliberate substitution or individual responsibility' },
      { id: 'no_acceptance_authority', label: 'The scribe may report the difference but cannot accept, reject, or request replacement' },
    ],
  },
  evaluation: {
    requiredEvidenceIds: ['comf01-request','comf01-tag','comf01-observation'],
    requiredLimitationIds: ['material_not_identified','no_intent_or_liability','no_acceptance_authority'],
    relevantEvidenceIds: ['comf01-carrier-account'],
    relevantLimitationIds: [],
    unsupportedFindingIds: ['descriptions_agree','request_silent','identify_material'],
    unsupportedResponsibilityClaimIds: ['carrier_blame','sender_blame'],
    receiverPersonId: ERA1_COM_F01_PEOPLE.receiver,
    rationales: {
      Thorough: 'The request, sender’s tag, and receiving observation are compared separately; the difference is stated precisely, testimony is kept distinct, and the material and authority limits are explicit.',
      Defensible: 'The report identifies the documented difference and avoids claiming material identity, origin, intent, or authority it does not possess.',
      Incomplete: 'A required source or qualification is missing, so the receiving official cannot safely carry the comparison into the receipt.',
      Overreached: 'The report misstates the supplied descriptions, identifies material beyond the evidence, or assigns unsupported responsibility.',
    },
    reactions: {
      Thorough: 'Utu-mansum keeps the request, tag, and observation together. “That is the difference I needed recorded. Ur-Lamma must judge whether the material will serve the work.”',
      Defensible: 'Utu-mansum nods. “The description difference is clear. I will enter it as an exception and leave acceptance to the responsible authority.”',
      Incomplete: 'Utu-mansum sets the tablet copy aside. “I still need the missing source or qualification before I can use this entry.”',
      Overreached: 'Utu-mansum returns the report. “You have identified what the sources do not identify, or assigned blame they do not establish.”',
    },
  },
  submissionNote: 'The report supports a receiving entry or further examination. Utu-mansum retains responsibility for the receipt, Lu-Nanshe for acceptance or a replacement request, and Ur-Lamma for judging craft suitability.',
});

export const ERA1_COM_F01_OPPORTUNITY_DEFINITION: AssignmentOpportunityDefinition = {
  matterKind: 'era1_com_f01_material_description',
  slug: 'era1-com-f01-material-description',
  offer: {
    activityId: ERA1_COM_F01_ACTIVITY_ID,
    title: 'Material Not As Described',
    description: 'Utu-mansum has held the receiving entry because the sender’s tag and the visible condition of the delivered material do not agree. Compare the request, tag, observation, and carrier account without claiming to identify the material or assign blame.',
    employer: { kind: 'person', id: ERA1_COM_F01_PEOPLE.receiver },
    category: 'commercial_material_description',
    context: {
      what: 'Compare the procurement request, sender’s tag, receiving observation, and carrier account for one delivered load.',
      who: ['Utu-mansum, Receiving Official','Ur-Lamma, precinct workshop overseer','Lu-Nanshe, responsible authority','Kuli, carrier'],
      quantity: 'one load of timber; the sender’s tag describes it as worked, while the receiving observation describes the visible pieces as unworked.',
      when: 'After delivery and before the receiving entry is accepted.',
      where: 'Eanna receiving court, Uruk; the related craft work is at a precinct workshop yard.',
      from: 'The request, sender’s tag, receiving observation, and Kuli’s separately attributed account.',
      to: 'Utu-mansum for the receiving entry; Lu-Nanshe retains the acceptance decision.',
      purpose: 'State exactly where the descriptions agree or differ and whether a craft examination or further record is needed.',
      responsibility: [
        'The scribe compares and reports only.',
        'Utu-mansum owns the receiving entry.',
        'Lu-Nanshe decides acceptance or a replacement request.',
        'Ur-Lamma judges whether the material is suitable for the workshop.',
        'Kuli supplies testimony about his part in the movement, not proof of earlier custody.',
      ],
      authority: 'The Assignment authorizes comparison and reporting only. It does not authorize acceptance, rejection, replacement, material identification, or assignment of liability.',
      provenance: [
        'Timber reached Uruk for a craft commission. The tag and receiving observation describe it differently; the specific load and people belong to this case.',
        'The tag establishes the sender’s description; the receiving list establishes the receiver’s observation. Neither independently identifies species or origin.',
      ],
    },
    requiredSkills: {},
    difficulty: 'demanding',
    estimatedTotalAp: ERA_I_ASSIGNMENT_PARAMETERS.tierA.estimatedTotalAp['ERA1-COM-01'],
    compensation: { money: ERA_I_ASSIGNMENT_PARAMETERS.tierA.currency, provisions: ERA_I_ASSIGNMENT_PARAMETERS.tierA.defaultProvisions },
    careerXpReward: ERA_I_ASSIGNMENT_PARAMETERS.tierA.baseCareerXp,
    deliveryChannels: [{ kind: 'baseline_reach', explanation: 'Utu-mansum has requested a supervised comparison before the receiving entry is accepted.' }],
  },
};

export const ERA_I_COMMERCIAL_MARTIAL_OPPORTUNITY_DEFINITIONS = [
  ERA1_COM_F01_OPPORTUNITY_DEFINITION,
  ...ERA_I_COMMERCIAL_FAMILY_OPPORTUNITY_DEFINITIONS,
  ...ERA_I_MARTIAL_FAMILY_OPPORTUNITY_DEFINITIONS,
] as const;
