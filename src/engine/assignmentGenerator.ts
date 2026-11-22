import type { AssignmentId } from '../state/ids';
import type { AssignmentOffer, GameState, TransitionResult } from '../state/types';
import { ASSIGNMENT_ACTIVITY_CATALOG } from '../content/assignments/northBayRoofInspection';
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
