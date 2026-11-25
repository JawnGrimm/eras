import type { AssignmentOffer, InstitutionalMatterKind } from '../../state/types';
import type { AssignmentOpportunityDefinition } from './opportunityDefinitions';
import type { PersonId } from '../../state/ids';
import { ERA_I_ASSIGNMENT_PARAMETERS } from './eraIParameters';

const people = {
  receiver: 'person-utu-mansum' as PersonId,
  senior: 'person-shuruppak-ilu' as PersonId,
  offeringParticipant: 'person-nin-kasi' as PersonId,
};
type OfferContent = Pick<AssignmentOffer,
  'title' | 'description' | 'employer' | 'category' | 'context' | 'requiredSkills' | 'difficulty'
  | 'estimatedTotalAp' | 'activityId' | 'compensation' | 'careerXpReward' | 'deliveryChannels' | 'compensationDisclosure'
> & { activityId: string; estimatedTotalAp: number };
function offer(matterKind: InstitutionalMatterKind, slug: string, content: OfferContent): AssignmentOpportunityDefinition {
  return { matterKind, slug, offer: content };
}
const tierA = ERA_I_ASSIGNMENT_PARAMETERS.tierA;

export const ERA_I_ANCHOR_OPPORTUNITY_DEFINITIONS: readonly AssignmentOpportunityDefinition[] = [
  offer('era1_com_01_consignment','era1-com-01',{
    activityId:'activity-era1-com-01-provenance-v2',
    title:'Receiving-Tag and Handover Comparison',
    description:'Utu-mansum wants the physical tag compared with the receiving-entry copy before the work moves on. Enlil-kisu says the tag stayed with the goods; that handover account has not been independently witnessed.',
    employer:{kind:'person',id:people.receiver}, category:'commercial_consignment',
    context:{
      what:'Compare a physical clay tag with a copied receiving entry and review the carrier’s reported handover account.',
      who:['Utu-mansum, Receiving Official','Enlil-kisu, Carrier Foreman','Ur-Nanna, Storehouse Steward'],
      quantity:'No commodity quantity is supplied or assessed in this comparison.',
      when:'Before the receiving court closes.',
      where:'At the receiving court and tablet room in Uruk, before the crew leaves.',
      from:'A physical pierced clay tag, a copied receiving entry, and the carrier’s reported handover account.',
      to:'Utu-mansum for the receiving record and responsible review.',
      purpose:'Compare identifying descriptions without inventing a sign reading or treating the reported handover as witnessed.',
      responsibility:['The apprentice compares and reports; the receiving official or steward decides whether to recount or proceed.'],
      authority:'The report does not accuse the carrier, decide ownership, or authorize release.',
      provenance:['Perforated clay tags are attested in Uruk IV–III contexts. This specific tag, copied entry, and handover account are a fictional teaching reconstruction; no commodity, quantity, sign reading, or historical transaction is reproduced.'],
    },
    requiredSkills:{},difficulty:'demanding',
    estimatedTotalAp:tierA.estimatedTotalAp['ERA1-COM-01'],
    compensation:{money:tierA.currency,provisions:tierA.defaultProvisions},careerXpReward:tierA.baseCareerXp,
    deliveryChannels:[{kind:'baseline_reach',explanation:'The receiving official has asked for a source-bounded comparison before proceeding with the receiving entry.'}],
  }),
  offer('era1_com_02_brewing_account','era1-com-02',{
    activityId:'activity-era1-com-02-brewing-account',
    title:'Brewing-Ingredient Account Reconciliation',
    description:'A brewer is worried that an apparent shortfall will reduce what is credited to his work. Shuruppak-ilu wants the sums checked before the account is closed; he is not asking you to invent a ratio.',
    employer:{kind:'person',id:people.senior},category:'commercial_account',
    context:{
      what:'Recalculate grain-product and malt entries without combining their separate categories.',
      who:['Shuruppak-ilu, Senior Scribe','A brewer involved in the account'],
      quantity:'Groats entries 4, 3, and 2; written subtotal 8; separate malt total 7.',
      when:'Before the working account is copied forward.',
      where:'A tablet room used for supervised account review.',
      from:'A dated account copy with separate groats and malt entries, totals, and subtotals.',
      to:'Shuruppak-ilu for review; the brewer’s credited allocation remains under responsible authority.',
      purpose:'Show the arithmetic and uncertainty so a copying error can be corrected without assigning motive.',
      responsibility:['The apprentice recalculates and reports; a responsible recorder decides whether to amend the account.'],
      authority:'The apprentice does not determine the goods’ destination or alter the authoritative account.',
      provenance:['The source keeps groats and malt in separate categories and notations; the figures shown here are the working copy being checked.'],
    },
    requiredSkills:{},difficulty:'demanding',
    estimatedTotalAp:tierA.estimatedTotalAp['ERA1-COM-02'],
    compensation:{money:tierA.currency,provisions:tierA.defaultProvisions},careerXpReward:tierA.baseCareerXp,
    deliveryChannels:[{kind:'baseline_reach',explanation:'The senior recorder has requested a second arithmetic check of the account.'}],
  }),
  offer('era1_civ_01_field_measurement','era1-civ-01',{
    activityId:'activity-era1-civ-01-field-measurement',
    title:'Field Measurement and Area Reconciliation',
    description:'A working summary is being copied. Shuruppak-ilu wants the arithmetic checked before the figures travel; the source’s uncertain provenance must travel with them.',
    employer:{kind:'person',id:people.senior},category:'civic_field_measurement',
    context:{
      what:'Check a readable parcel-area transcription and its written subtotal.',
      who:['Shuruppak-ilu, Senior Scribe','The responsible recorder who supplied the working copy'],
      quantity:'Parcel areas 2, 3, and 4; written subtotal 8.',
      when:'Before the figures are copied into a working summary.',
      where:'At the tablet room, before the working summary is copied and sent onward.',
      from:'An older field-area copy whose origin is unrecorded.',
      to:'Shuruppak-ilu for review of the arithmetic and provenance note.',
      purpose:'Identify a simple arithmetic omission without turning the calculation into a claim about land rights.',
      responsibility:['The apprentice checks the transcription; any new measurement or land decision remains with an appropriately situated official.'],
      authority:'The report cannot establish a boundary, ownership, yield, or allocation.',
      provenance:['The copy’s date and origin are uncertain. The parcel figures shown here are a readable working copy, not a claim about a surveyed boundary.'],
    },
    requiredSkills:{},difficulty:'routine',
    estimatedTotalAp:tierA.estimatedTotalAp['ERA1-CIV-01'],
    compensation:{money:tierA.currency,provisions:tierA.defaultProvisions},careerXpReward:tierA.baseCareerXp,
    deliveryChannels:[{kind:'baseline_reach',explanation:'A responsible recorder has asked for a second arithmetic check before copying the figures.'}],
  }),
  offer('era1_civ_02_labor_disbursement','era1-civ-02',{
    activityId:'activity-era1-civ-02-labor-disbursement',
    title:'Labor-Group Records and Grain Disbursement',
    description:'The group leader wants an answer before the work group leaves. Shuruppak-ilu has brought two records into the same review, but he is careful not to say the grain was issued to these laborers.',
    employer:{kind:'person',id:people.senior},category:'civic_labor_accountability',
    context:{
      what:'Check a labor-group total and separately summarize a grain-disbursement record.',
      who:['Shuruppak-ilu, Senior Scribe','The group leader','The officials named in the separate grain copy'], 
      quantity:'Labor-group entries 6, 8, and 5; written total 19. A separate grain copy names its own recipients.',
      when:'Before the labor group is released from its current obligation.',
      where:'At the tablet room, while the work group waits for the figures to be settled.',
      from:'A labor-group tally and a separate grain-disbursement copy, kept distinct in this review.',
      to:'Shuruppak-ilu for a bounded two-part report.',
      purpose:'Give the group leader a checked total without letting the separate grain copy decide what his people received.',
      responsibility:['The apprentice reports each source separately; the responsible reviewer decides whether more records are needed.'],
      authority:'The report cannot claim an entitlement, accuse an official of diversion, or authorize redistribution.',
      provenance:['The labor-group tally and grain-disbursement copy concern separate entries. No link between the group and the grain is asserted.'],
    },
    requiredSkills:{},difficulty:'demanding',
    estimatedTotalAp:tierA.estimatedTotalAp['ERA1-CIV-02'],
    compensation:{money:tierA.currency,provisions:ERA_I_ASSIGNMENT_PARAMETERS.explicitProvisionContract.provisions},
    careerXpReward:tierA.baseCareerXp,
    compensationDisclosure:'Contracted pay: 10 Currency and 1 Provision when the two-part account check is filed. The Provision is compensation under this specific commission, not a ration issued to the labor group.',
    deliveryChannels:[{kind:'baseline_reach',explanation:'The senior reviewer has commissioned a two-part account check before the group is released.'}],
  }),
  offer('era1_rel_01_inana_offering','era1-rel-01',{
    activityId:'activity-era1-rel-01-inana-offering',
    title:'Inana Offering Records and Sanctuary Supply',
    description:'Nin-kasi wants the entries checked before preparations continue. She would rather not reopen the account late in the day; the senior recorder wants the source distinction preserved.',
    employer:{kind:'person',id:people.offeringParticipant},category:'religious_offering_records',
    context:{
      what:'Review an Inana-associated offering record and a separate commodity record without assuming they belong to one supply schedule.',
      who:['Nin-kasi, who is helping prepare the offering','Shuruppak-ilu, Senior Scribe'],
      quantity:'The offering copy omits one same-category entry; the separate fish record remains distinct.',
      when:'Before the next stage of offering preparations.',
      where:'Near the offering preparations, where Nin-kasi needs the entries checked before the next step.',
      from:'The offering copy and a separate fish-category copy, each with its own entries.',
      to:'Nin-kasi and the senior recorder for review by the responsible authority.',
      purpose:'Help Nin-kasi find the missing offering entry before preparations continue; do not use the separate fish entry as a substitute.',
      responsibility:['The apprentice compares entries and reports; the responsible participant decides whether to seek another source or proceed.'],
      authority:'The responsible participant decides whether preparations proceed or another source is sought; the apprentice reports only the comparison.',
      provenance:['The offering entries are linked to Inana; the separate fish entry is from another copy. Nin-kasi needs the missing entry checked before preparations continue.'],
    },
    requiredSkills:{},difficulty:'routine',
    estimatedTotalAp:tierA.estimatedTotalAp['ERA1-REL-01'],
    compensation:{money:tierA.currency,provisions:tierA.defaultProvisions},careerXpReward:tierA.baseCareerXp,
    deliveryChannels:[{kind:'baseline_reach',explanation:'A participant in the offering preparations has asked for the entries to be checked before the next step.'}],
  }),
];
