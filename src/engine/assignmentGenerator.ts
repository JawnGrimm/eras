import type { AssignmentId } from '../state/ids';
import type { AssignmentOffer, GameState, TransitionResult, WorldEvent } from '../state/types';
import { ASSIGNMENT_ACTIVITY_CATALOG, NORTH_BAY_POST_EXECUTION_ACTIVITY_ID } from '../content/assignments/northBayRoofInspection';
import { URUK_ASSIGNMENT_OPPORTUNITY_DEFINITIONS } from '../content/assignments/opportunityDefinitions';
import { transitionOpportunityAction } from './opportunities';

/**
 * Discover playable opportunities from active institutional matters.
 * Authored definitions own scenario copy and rewards; this engine owns bounded,
 * deterministic discovery, duplicate prevention, and offer presentation.
 */
export function generateDailyAssignments(state: GameState): GameState {
  const ledger = state.opportunities.assignmentGeneratorLedger ?? { sequence: 0, lastPresentedDayByActivity: {} };
  let next: GameState = { ...state, opportunities: { ...state.opportunities, assignmentGeneratorLedger: ledger } };
  const openCount = () => Object.values(next.opportunities.assignments).filter(
    (offer) => offer.status === 'offered' || offer.status === 'accepted',
  ).length;
  const definitions = URUK_ASSIGNMENT_OPPORTUNITY_DEFINITIONS;
  const offset = ledger.sequence % definitions.length;
  const rotated = [...definitions.slice(offset), ...definitions.slice(0, offset)];
  let offeredAp = 0;
  let sequence = ledger.sequence;
  const lastPresentedDayByActivity = { ...ledger.lastPresentedDayByActivity };

  // A completed institutional execution may create a separate evidence-gathering
  // Assignment. The player files an inspection record; appointed officials retain
  // verification and resolution authority.
  const latestExecutionByMatter = new Map<string, WorldEvent>();
  for (const event of Object.values(next.world.events)
    .filter((item) => item.institutionalResponse?.stage === 'execution')
    .sort((a, b) => a.dayNumber - b.dayNumber || a.id.localeCompare(b.id))) {
    latestExecutionByMatter.set(event.institutionalResponse!.matterId, event);
  }
  const executions = [...latestExecutionByMatter.values()]
    .sort((a, b) => a.dayNumber - b.dayNumber || a.id.localeCompare(b.id));
  for (const executionEvent of executions) {
    if (offeredAp >= 8 || openCount() >= 4) break;
    const response = executionEvent.institutionalResponse!;
    const matter = next.world.matters[response.matterId];
    if (!matter || matter.kind !== 'roof_repair_verification' || matter.status === 'resolved' || !response.assigneePersonId
      || response.assigneePersonId === next.player.currentCharacterId
      || !next.records.entries[response.recordId]) continue;
    const id = `assignment-auto-post-execution-${executionEvent.id}` as AssignmentId;
    if (next.opportunities.assignments[id]) continue;
    if (Object.values(next.world.events).some((event) => event.institutionalResponse?.stage === 'verification'
      && event.institutionalResponse.verification?.executionEventId === executionEvent.id)) continue;
    const hasVerifier = Object.values(next.world.appointments).some((appointment) =>
      appointment.institutionId === matter.institutionId
      && appointment.authorityCapabilities?.includes('verify_institutional_execution')
      && appointment.startDay <= next.calendar.dayNumber
      && (appointment.endDay === undefined || appointment.endDay >= next.calendar.dayNumber)
      && appointment.personId !== response.assigneePersonId
      && !!next.world.people[appointment.personId]?.alive);
    if (!hasVerifier || !ASSIGNMENT_ACTIVITY_CATALOG[NORTH_BAY_POST_EXECUTION_ACTIVITY_ID]) continue;

    const offer: Omit<AssignmentOffer, 'offeredDay' | 'expiresDay' | 'status' | 'lapsedDuringMandatoryWork'> = {
      id,
      activityId: NORTH_BAY_POST_EXECUTION_ACTIVITY_ID,
      originMatterId: matter.id,
      sourceRecordId: response.recordId,
      title: 'Post-Execution North-Bay Inspection',
      description: 'Independently inspect the completed maintenance and file evidence for an appointed official. This Assignment does not itself verify or authorize the work.',
      employer: { kind: 'institution', id: matter.institutionId },
      category: 'institutional_verification_support',
      context: {
        what: 'Inspect the completed North-Bay maintenance and file an independent physical inspection record.',
        who: ['The current scribe', 'Ur-Nanna, Storehouse Steward', 'Shuruppak-ilu, Senior Scribe', 'Aru, maintenance worker'],
        quantity: 'One recorded maintenance execution, one runoff channel, and one shaded beam socket.',
        when: 'After the recorded North-Bay maintenance execution.',
        where: 'North storage bay, Temple Storehouse, Uruk.',
        from: 'The authorized maintenance execution and its recorded result.',
        to: 'The Temple Storehouse record, for review by an appointed verifier.',
        purpose: 'Provide independent post-execution evidence without assuming the authority to verify, authorize further work, or resolve the institutional matter.',
        responsibility: ['The player performs the inspection and submits the evidence.', 'An appointed Storehouse official independently verifies the execution and records any final disposition.'],
        authority: 'Inspection and reporting only. The Assignment grants no institutional office or verification authority.',
        provenance: ['The recorded North-Bay maintenance execution and its linked authorization and commitment.'],
      },
      requiredSkills: {},
      difficulty: 'demanding',
      estimatedTotalAp: 5,
      compensation: { money: 3, provisions: 0 },
      careerXpReward: 35,
      deliveryChannels: [{ kind: 'baseline_reach', explanation: 'The Storehouse requests an independent inspection record after the assigned maintenance.' }],
    };
    const result: TransitionResult = transitionOpportunityAction(next, { type: 'PRESENT_ASSIGNMENT', offer });
    if (result.feedback?.kind === 'error') continue;
    next = result.state;
    offeredAp += offer.estimatedTotalAp ?? 0;
    sequence++;
    lastPresentedDayByActivity[NORTH_BAY_POST_EXECUTION_ACTIVITY_ID] = next.calendar.dayNumber;
  }

  for (const definition of rotated) {
    const matchingMatters = Object.values(next.world.matters)
      .filter((matter) => matter.kind === definition.matterKind)
      .sort((a, b) => a.createdDay - b.createdDay || a.id.localeCompare(b.id));

    for (const sourceMatter of matchingMatters) {
      if (offeredAp >= 8 || openCount() >= 4) break;
      const sourceInstitution = next.world.institutions[sourceMatter.institutionId];
      if (sourceMatter.status !== 'active' || !sourceInstitution?.activeMatters.includes(sourceMatter.id)) continue;
      if (Object.values(next.opportunities.assignments).some((offer) => offer.originMatterId === sourceMatter.id
        || (!offer.originMatterId && offer.activityId === definition.offer.activityId))) continue;
      if (!ASSIGNMENT_ACTIVITY_CATALOG[definition.offer.activityId as keyof typeof ASSIGNMENT_ACTIVITY_CATALOG]) continue;

      const id = `assignment-auto-${definition.slug}-${sourceMatter.id}` as AssignmentId;
      if (next.opportunities.assignments[id]) continue;
      const offer: Omit<AssignmentOffer, 'offeredDay' | 'expiresDay' | 'status' | 'lapsedDuringMandatoryWork'> = {
        ...definition.offer,
        id,
        originMatterId: sourceMatter.id,
        ...(sourceMatter.sourceRecordId ? { sourceRecordId: sourceMatter.sourceRecordId } : {}),
      };
      const result: TransitionResult = transitionOpportunityAction(next, { type: 'PRESENT_ASSIGNMENT', offer });
      if (result.feedback?.kind === 'error') continue;
      next = result.state;
      offeredAp += definition.offer.estimatedTotalAp ?? 0;
      sequence++;
      lastPresentedDayByActivity[definition.offer.activityId] = next.calendar.dayNumber;
    }
  }

  return {
    ...next,
    opportunities: {
      ...next.opportunities,
      assignmentGeneratorLedger: { sequence, lastPresentedDayByActivity },
    },
  };
}
