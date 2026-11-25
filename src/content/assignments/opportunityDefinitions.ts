import type { AssignmentOffer, InstitutionalMatterKind } from '../../state/types';
import type { PersonId } from '../../state/ids';
import { ERA_I_ASSIGNMENT_PARAMETERS } from './eraIParameters';

const steward = 'person-ur-nanna' as PersonId;
const carrier = 'person-enlil-kisu' as PersonId;

type AuthoredOfferContent = Pick<AssignmentOffer,
  'title' | 'description' | 'employer' | 'category' | 'commodity' | 'context' | 'requiredSkills' |
  'difficulty' | 'estimatedTotalAp' | 'activityId' | 'compensation' | 'careerXpReward' | 'deliveryChannels' | 'compensationDisclosure'
> & { activityId: string; estimatedTotalAp: number };

export interface AssignmentOpportunityDefinition {
  /** The institutional situation that can surface this authored activity. */
  matterKind: InstitutionalMatterKind;
  /** Stable readable portion of the generated Assignment ID. */
  slug: string;
  /** Presentation pacing order; it does not determine eligibility. */
  offer: AuthoredOfferContent;
}

/**
 * Authored links between durable world matters and playable Assignment content.
 * The generator discovers matching active matters; it does not own scenario copy.
 */
export const URUK_ASSIGNMENT_OPPORTUNITY_DEFINITIONS: readonly AssignmentOpportunityDefinition[] = [
  {
    matterKind: 'held_barley_inspection',
    slug: 'held-barley',
    offer: {
      activityId: 'activity-held-barley-inspection',
      title: 'Held-Barley Inspection',
      description: 'Inspect the seven sealed pottery storage jars containing the seven held capacity measures. Report exterior condition separately from the untested grain within; submit a finding and recommendation, not a release order.',
      employer: { kind: 'person', id: steward },
      category: 'held_barley_inspection',
      context: {
        what: 'Inspect segregated held barley containers and prepare a finding and recommendation.',
        who: ['Ur-Nanna, Storehouse Steward', 'Utu-mansum, Receiving Official', 'Shuruppak-ilu, Senior Scribe'],
        quantity: 'Seven held capacity measures contained in seven sealed pottery storage jars; two jar exteriors show damp-staining/crusting and five are surface-dry.',
        when: 'Following the north-bay leak and the current held-stock recount, during harvest preparation.',
        where: 'Temple Storehouse, north storage bay, on reed matting.',
        from: 'The segregated stock and its prior administrative intake/recount records.',
        to: 'Ur-Nanna, with a copy for Shuruppak-ilu.',
        purpose: 'Establish container condition and recommend whether sampling, continued segregation, or a proposed disposition is warranted.',
        responsibility: ['The scribe records observations and limitations; Ur-Nanna or Shuruppak-ilu retains formal stock-release authority.'],
        authority: 'The Assignment authorizes inspection and reporting only; it does not authorize sampling, release, cleaning, destruction, or issue.',
        provenance: ['North-Bay Roof Inspection Report and active held-barley institutional matter', 'Immutable capacity record ev-04 (4 measures held at intake)', 'Immutable capacity record ev-07 (7 measures held at recount)'],
      },
      requiredSkills: {},
      difficulty: 'demanding',
      estimatedTotalAp: ERA_I_ASSIGNMENT_PARAMETERS.tierB.estimatedTotalAp.heldBarley,
      compensation: { money: ERA_I_ASSIGNMENT_PARAMETERS.tierB.currency, provisions: ERA_I_ASSIGNMENT_PARAMETERS.tierB.defaultProvisions },
      careerXpReward: ERA_I_ASSIGNMENT_PARAMETERS.tierB.baseCareerXp,
      deliveryChannels: [{ kind: 'baseline_reach', explanation: 'The Storehouse Steward has asked the junior scribe who filed the north-bay report to inspect the segregated stock.' }],
    },
  },
  {
    matterKind: 'south_court_delivery_reconciliation',
    slug: 'south-court-delivery',
    offer: {
      activityId: 'activity-south-court-delivery-reconciliation',
      title: 'South-Court Delivery Reconciliation',
      description: 'Compare the carrier dispatch tablet with the receiving tally. Establish the one-measure discrepancy without assuming where it occurred or who is responsible.',
      employer: { kind: 'person', id: steward },
      category: 'delivery_reconciliation',
      context: {
        what: 'Reconcile a delivery dispatch quantity against the receiving count.',
        who: ['Ur-Nanna, Storehouse Steward', 'Utu-mansum, Receiving Official', 'Enlil-kisu, Carrier Foreman'],
        quantity: '24 standard capacity measures dispatched; 23 counted at intake; discrepancy of one measure.',
        when: 'Before the next storehouse tally, following the recorded delivery.',
        where: 'Temple Storehouse, south receiving court and tablet room; dispatch originated at the canal-side holding yard.',
        from: 'Carrier dispatch tablet attributed to Enlil-kisu.',
        to: 'Temple Storehouse stock account and Shuruppak-ilu’s review.',
        purpose: 'Preserve the dispatch and receipt figures, identify what is and is not established, and recommend a further record check or qualified closure.',
        responsibility: ['The scribe reconciles the records; Enlil-kisu is a consultable witness, not a presumed culprit; Utu-mansum attests only to the receiving count.'],
        authority: 'The scribe may report the discrepancy but may not silently amend the institutional account or assign liability.',
        provenance: ['Surviving carrier dispatch copy', 'Utu-mansum receiving tally', 'Witness testimony is separately attributed and does not replace the tablets.'],
      },
      requiredSkills: {},
      difficulty: 'demanding',
      estimatedTotalAp: ERA_I_ASSIGNMENT_PARAMETERS.tierB.estimatedTotalAp.southCourtDelivery,
      compensation: { money: ERA_I_ASSIGNMENT_PARAMETERS.tierB.currency, provisions: ERA_I_ASSIGNMENT_PARAMETERS.explicitProvisionContract.provisions },
      careerXpReward: ERA_I_ASSIGNMENT_PARAMETERS.tierB.baseCareerXp,
      deliveryChannels: [{ kind: 'relationship', personId: carrier, explanation: 'Enlil-kisu’s dispatch copy is being compared with the Temple Storehouse receiving tally.' }],
    },
  },
  {
    matterKind: 'south_loading_awning_inspection',
    slug: 'south-loading-awning',
    offer: {
      activityId: 'activity-south-loading-awning-inspection',
      title: 'South Loading-Awning Inspection',
      description: 'Inspect the south loading awning’s reed ties, support posts, and threshold conditions. Report the observed condition without treating the inspection as repair authorization.',
      employer: { kind: 'person', id: steward },
      category: 'institutional_maintenance',
      context: {
        what: 'Inspect the condition of the south loading awning and prepare a maintenance report.',
        who: ['Ur-Nanna, Storehouse Steward', 'Dudu, contracted repairer (consulted only on commission scope)'],
        quantity: 'One loading awning; two visibly frayed reed ties; two inspected support posts.',
        when: 'Before the next period of heavy loading.',
        where: 'Temple Storehouse, south loading court.',
        from: 'Ur-Nanna’s inspection request and direct observation of the structure.',
        to: 'Ur-Nanna and Shuruppak-ilu.',
        purpose: 'Identify visible maintenance concerns and recommend inspection, monitoring, or a separately authorized repair commission.',
        responsibility: ['The scribe observes and reports; the Steward decides whether to commission repairs; Dudu is responsible only for work within his recorded contract.'],
        authority: 'Inspection only. The existing Dudu commission covers the north-bay mid-bay patch and does not authorize south-awning work.',
        provenance: ['Direct physical observation of the ties, posts, and threshold', 'Dudu’s testimony about the scope of his existing commission'],
      },
      requiredSkills: {},
      difficulty: 'routine',
      estimatedTotalAp: ERA_I_ASSIGNMENT_PARAMETERS.tierB.estimatedTotalAp.southLoadingAwning,
      compensation: { money: ERA_I_ASSIGNMENT_PARAMETERS.tierB.currency, provisions: ERA_I_ASSIGNMENT_PARAMETERS.tierB.defaultProvisions },
      careerXpReward: ERA_I_ASSIGNMENT_PARAMETERS.tierB.baseCareerXp,
      deliveryChannels: [{ kind: 'baseline_reach', explanation: 'Ur-Nanna has asked a storehouse scribe to document the awning before further loading.' }],
    },
  },

  {
    matterKind: 'tier_b_recurring_occurrence',
    slug: 'tierb-recurring',
    offer: {
      activityId: 'activity-tierb-recurring-institutional-check',
      title: 'Dated Tally Check',
      description: 'The steward needs the next tally ready before work continues. Compare the dated source and receiving records, then report what agrees and what remains unsettled.',
      employer: { kind: 'institution', id: 'institution-uruk-temple-storehouse' as import('../../state/ids').InstitutionId },
      category: 'tier_b_institutional_check',
      context: {
        what: 'Compare the dated source and receiving/check records for this institutional occurrence.',
        who: ['Ur-Nanna, Storehouse Steward', 'Utu-mansum, Receiving Official', 'Shuruppak-ilu, Senior Scribe'],
        quantity: 'The source records show the figures and their stated commodity and unit.',
        when: 'During the current storehouse workday, following the recorded occurrence.',
        where: 'At the storehouse work area where the two copies were brought together.',
        from: 'The dated dispatch/source copy and receiving/check record that prompted the comparison.',
        to: 'Shuruppak-ilu for review before the next tally.',
        purpose: 'Give the next tally a reliable comparison, whether the figures agree or leave a difference to check.',
        responsibility: ['The scribe compares and reports; Ur-Nanna or the receiving official decides whether to change the account or move the goods.'],
        authority: 'You may compare the entries and recommend a follow-up. The steward or receiving official decides whether to amend the account, change custody, or release goods.',
        provenance: ['The dated dispatch and receiving copies are kept together for this comparison.'],
      },
      requiredSkills: {},
      difficulty: 'routine',
      estimatedTotalAp: 4,
      compensation: { money: ERA_I_ASSIGNMENT_PARAMETERS.tierB.currency, provisions: ERA_I_ASSIGNMENT_PARAMETERS.tierB.defaultProvisions },
      careerXpReward: ERA_I_ASSIGNMENT_PARAMETERS.tierB.baseCareerXp,
      deliveryChannels: [{ kind: 'baseline_reach', explanation: 'The steward has brought the dated dispatch and receiving copies together because the next tally depends on them.' }],
    },
  },
];
