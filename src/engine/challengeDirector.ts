import type { ChallengeId, EventId, InstitutionId, MatterId, PersonId, RecordId } from '../state/ids';
import type {
  AssignmentOffer, ChallengeInstance, ChallengeTriggerRule, GameState, OpportunityDeliveryChannel,
  OpportunityOccurrenceLifecycle,
} from '../state/types';
import { evaluateChallengeTriggers, transitionOpportunityAction } from './opportunities';
import { MATTER_IDS } from './institutionalMatters';
import { STOREHOUSE_WORK_ID } from '../works/storehouseReckoning';

const STOREHOUSE = 'institution-uruk-temple-storehouse';
const STEWARD = 'person-ur-nanna' as PersonId;
const SENIOR = 'person-shuruppak-ilu' as PersonId;

export type ChallengeTriggerDomain =
  | 'player_action_outcome'
  | 'professional_behavior_pattern'
  | 'relationship_update'
  | 'institutional_matter_update'
  | 'authored_world_event';

type ChallengeSourceFact = { kind: 'event'; id: EventId } | { kind: 'record'; id: RecordId };

interface ChallengeOccurrence {
  matterId?: MatterId;
  primarySourceFact: ChallengeSourceFact;
  requiredSourceFactIds: string[];
  deliveryChannels: OpportunityDeliveryChannel[];
}

type ChallengeActivityKind = 'presented' | 'accepted' | 'declined' | 'lapsed' | 'completed' | 'cancelled';

export type ChallengeTriggerDescriptor =
  | {
      domain: 'player_action_outcome';
      activityId: string;
      matterId: MatterId;
      activityKinds: ChallengeActivityKind[];
      findingIds?: string[];
      reportTitle?: string;
    }
  | {
      domain: 'professional_behavior_pattern';
      rule: ChallengeTriggerRule;
      activityId: string;
      matterId: MatterId;
      activityKinds: ChallengeActivityKind[];
      findingIds?: string[];
      reportTitle: string;
    }
  | {
      domain: 'relationship_update';
      fromId: PersonId;
      toId: PersonId;
      deliveryChannels: OpportunityDeliveryChannel[];
    }
  | {
      domain: 'institutional_matter_update';
      matterId: MatterId;
      statuses: Array<'active' | 'resolved' | 'developed'>;
      minimumAgeDays?: number;
      deliveryActivityId: string;
      deliveryKinds: ChallengeActivityKind[];
    }
  | {
      domain: 'authored_world_event';
      eventId: EventId;
      matterId?: MatterId;
      deliveryChannels: OpportunityDeliveryChannel[];
    };

interface ChallengeCandidate {
  scenarioId: string;
  weight: number;
  repeatability: 'once_per_world' | 'once_per_matter' | 'per_occurrence';
  triggerDomains: ChallengeTriggerDomain[];
  resolveOccurrence(state: GameState): ChallengeOccurrence | null;
  buildChallenge(state: GameState, id: ChallengeId, occurrence: ChallengeOccurrence): Omit<ChallengeInstance, 'status' | 'assigneePersonId'>;
}

/** Aggregate-based rule is evaluated against compact counters and the five-entry activity window. */
export const CHALLENGE_TRIGGER_RULES: ChallengeTriggerRule[] = [
  { id: 'challenge-missing-measure', category: 'delivery_reconciliation', minCompleted: 1, recentKinds: ['completed'], recentWindow: 5 },
];

function challengeEffects(careerXp: number) { return { careerXp }; }

function recentOffer(
  state: GameState,
  activityId: string,
  kinds: Array<'presented' | 'accepted' | 'declined' | 'lapsed' | 'completed' | 'cancelled'>,
): AssignmentOffer | undefined {
  const allowed = new Set(kinds);
  for (let index = state.opportunities.recentActivity.length - 1; index >= 0; index--) {
    const activity = state.opportunities.recentActivity[index];
    if (!allowed.has(activity.kind)) continue;
    const offer = state.opportunities.assignments[activity.assignmentId];
    if (offer?.activityId === activityId
      && ['offered', 'accepted', 'completed'].includes(offer.status)) return offer;
  }
  return undefined;
}

function reportRecordForMatter(state: GameState, matterId: MatterId, title: string) {
  const matter = state.world.matters[matterId];
  if (!matter) return undefined;
  for (const source of matter.provenance ?? []) {
    if (source.kind !== 'record_copy' || !source.sourceId) continue;
    const record = state.records.entries[source.sourceId as RecordId];
    if (record?.title === title) return record;
  }
  return undefined;
}

function resolveAssignmentOccurrence(
  state: GameState,
  trigger: {
    activityId: string;
    matterId: MatterId;
    activityKinds: ChallengeActivityKind[];
    findingIds?: string[];
    reportTitle?: string;
  },
): ChallengeOccurrence | null {
  const offer = recentOffer(state, trigger.activityId, trigger.activityKinds);
  if (!offer) return null;
  const finding = offer.activityProgress?.draft.finding;
  if (trigger.findingIds && !trigger.findingIds.includes(finding ?? '')) return null;
  const matter = state.world.matters[trigger.matterId];
  if (!matter?.sourceEventId || !state.world.events[matter.sourceEventId]) return null;
  const report = trigger.reportTitle ? reportRecordForMatter(state, matter.id, trigger.reportTitle) : undefined;
  if (trigger.reportTitle && !report) return null;
  return {
    matterId: matter.id,
    primarySourceFact: report
      ? { kind: 'record', id: report.id }
      : { kind: 'event', id: matter.sourceEventId },
    requiredSourceFactIds: sourceIds(matter.sourceEventId, report?.id),
    deliveryChannels: offer.deliveryChannels,
  };
}

/**
 * Resolves one explicitly authored trigger without scanning historical archives.
 * Relationship triggers require an event-linked latest history entry because the
 * existing v3 occurrence ledger can persist only Event/Record source facts.
 */
export function resolveChallengeTrigger(state: GameState, trigger: ChallengeTriggerDescriptor): ChallengeOccurrence | null {
  switch (trigger.domain) {
    case 'player_action_outcome':
      return resolveAssignmentOccurrence(state, trigger);
    case 'professional_behavior_pattern':
      if (!evaluateChallengeTriggers(state, [trigger.rule]).includes(trigger.rule.id)) return null;
      return resolveAssignmentOccurrence(state, trigger);
    case 'relationship_update': {
      if (trigger.fromId === trigger.toId) return null;
      const history = state.world.relationships[trigger.fromId]?.[trigger.toId]?.history ?? [];
      const latest = history[history.length - 1];
      if (!latest?.eventId || !state.world.events[latest.eventId] || !trigger.deliveryChannels.length) return null;
      return {
        primarySourceFact: { kind: 'event', id: latest.eventId },
        requiredSourceFactIds: [latest.eventId],
        deliveryChannels: trigger.deliveryChannels,
      };
    }
    case 'institutional_matter_update': {
      const matter = state.world.matters[trigger.matterId];
      if (!matter || !trigger.statuses.includes(matter.status)
        || (trigger.minimumAgeDays !== undefined && state.calendar.dayNumber - matter.createdDay < trigger.minimumAgeDays)
        || !matter.sourceEventId || !state.world.events[matter.sourceEventId]) return null;
      const offer = recentOffer(state, trigger.deliveryActivityId, trigger.deliveryKinds);
      if (!offer) return null;
      const sourceRecordId = matter.sourceRecordId && state.records.entries[matter.sourceRecordId]
        ? matter.sourceRecordId : undefined;
      return {
        matterId: matter.id,
        primarySourceFact: { kind: 'event', id: matter.sourceEventId },
        requiredSourceFactIds: sourceIds(matter.sourceEventId, sourceRecordId),
        deliveryChannels: offer.deliveryChannels,
      };
    }
    case 'authored_world_event': {
      if (!state.world.events[trigger.eventId] || !trigger.deliveryChannels.length
        || (trigger.matterId && !state.world.matters[trigger.matterId])) return null;
      return {
        ...(trigger.matterId ? { matterId: trigger.matterId } : {}),
        primarySourceFact: { kind: 'event', id: trigger.eventId },
        requiredSourceFactIds: [trigger.eventId],
        deliveryChannels: trigger.deliveryChannels,
      };
    }
  }
}

function sourceIds(...ids: Array<string | undefined>): string[] {
  return [...new Set(ids.filter((id): id is string => !!id))].sort();
}

function resolveSevenSacks(state: GameState): ChallengeOccurrence | null {
  const matter = state.world.matters[MATTER_IDS.heldBarley];
  if (!matter?.sourceEventId || !state.world.events[matter.sourceEventId]) return null;

  const reportOffer = recentOffer(state, 'activity-held-barley-inspection', ['completed']);
  if (reportOffer?.status === 'completed'
    && reportOffer.activityProgress?.draft.finding === 'qualified_incomplete') {
    const report = reportRecordForMatter(state, matter.id, 'Held-Barley Finding and Recommendation');
    if (report) return {
      matterId: matter.id,
      primarySourceFact: { kind: 'record', id: report.id },
      requiredSourceFactIds: sourceIds(matter.sourceEventId, report.id),
      deliveryChannels: reportOffer.deliveryChannels,
    };
  }

  if (matter.status !== 'active' || state.calendar.dayNumber - matter.createdDay < 2) return null;
  const deliveredOffer = recentOffer(state, 'activity-held-barley-inspection', ['presented', 'accepted', 'completed']);
  if (!deliveredOffer) return null;
  const sourceRecordId = matter.sourceRecordId && state.records.entries[matter.sourceRecordId]
    ? matter.sourceRecordId : undefined;
  return {
    matterId: matter.id,
    primarySourceFact: { kind: 'event', id: matter.sourceEventId },
    requiredSourceFactIds: sourceIds(matter.sourceEventId, sourceRecordId),
    deliveryChannels: deliveredOffer.deliveryChannels,
  };
}

function resolveMissingMeasure(state: GameState): ChallengeOccurrence | null {
  const matter = state.world.matters[MATTER_IDS.southCourtDelivery];
  if (!matter?.sourceEventId || !state.world.events[matter.sourceEventId]) return null;

  // Assignment-pattern eligibility is bounded by the compact aggregate and five-entry activity window.
  const aggregateTriggered = evaluateChallengeTriggers(state, CHALLENGE_TRIGGER_RULES).includes('challenge-missing-measure');
  const offer = recentOffer(state, 'activity-south-court-delivery-reconciliation', ['completed']);
  if (!offer || offer.status !== 'completed') return null;
  const finding = offer.activityProgress?.draft.finding ?? '';
  const completedReconciliation = ['unlocated_discrepancy', 'qualified_incomplete'].includes(finding);
  if (!aggregateTriggered && !completedReconciliation) return null;

  const report = reportRecordForMatter(state, matter.id, 'South-Court Delivery Reconciliation');
  if (!report) return null;
  return {
    matterId: matter.id,
    primarySourceFact: { kind: 'record', id: report.id },
    requiredSourceFactIds: sourceIds(matter.sourceEventId, report.id),
    deliveryChannels: offer.deliveryChannels,
  };
}

function sevenSacks(state: GameState, id: ChallengeId, occurrence: ChallengeOccurrence): Omit<ChallengeInstance, 'status' | 'assigneePersonId'> {
  return {
    id,
    title: 'The Seven Sealed Jars',
    description: 'Harvest pressure is increasing. Ur-Nanna asks what should be recommended for the seven sealed pottery storage jars. The physical inspection distinguishes two stained exteriors from five surface-dry jars; none of the grain has been sampled. Your answer is a professional recommendation, not a release order.',
    category: 'held_barley_disposition',
    employer: { kind: 'person', id: STEWARD },
    context: {
      what: 'Advise the Steward on the next responsible step for the seven sealed pottery storage jars.',
      who: ['Ur-Nanna, Storehouse Steward', 'Shuruppak-ilu, Senior Scribe'],
      quantity: 'Seven capacity measures in seven sealed pottery storage jars; two jar exteriors stained/crusted and five are surface-dry.',
      when: 'During harvest preparation, while the held-stock matter remains open.',
      where: 'Temple Storehouse, north storage bay.',
      from: 'The held-stock inspection report and direct container observation.',
      to: 'Ur-Nanna for an authorized stock decision.',
      purpose: 'Balance harvest pressure against the unresolved internal condition of the grain.',
      responsibility: ['The scribe recommends; the Steward or Senior Scribe decides whether stock may be released.'],
      authority: 'The Challenge does not grant stock-release authority and cannot itself release, clean, or destroy stock.',
      provenance: ['Seven sealed-jar physical observation', 'Capacity records ev-04 and ev-07 remain separate and unchanged'],
    },
    deliveryChannels: occurrence.deliveryChannels,
    presentedDay: state.calendar.dayNumber,
    apCost: 2,
    choices: [
      { id: 'recommend-five-two', label: 'Recommend five for consideration; retain two', description: 'Recommend that Ur-Nanna consider releasing the five surface-dry jars while retaining the two stained jars for authorized sampling or cleaning. No release occurs until the Steward issues an order.', consequences: challengeEffects(12), evaluation: { assessment: 'Thorough', rationale: 'The recommendation distinguishes the observed exterior from untested grain and leaves the release decision with the Steward.', receiverPersonId: STEWARD, institutionId: STOREHOUSE as InstitutionId, reaction: 'Ur-Nanna reads the recommendation. “You have separated what was seen from what remains unknown. I can decide what to sample.”' } },
      { id: 'retain-all-sample', label: 'Retain all seven pending sampling', description: 'Recommend continued segregation until an authorized sample establishes internal grain condition.', consequences: challengeEffects(10), evaluation: { assessment: 'Defensible', rationale: 'Retaining all seven pending sampling is cautious and within the evidence, though it does not offer a more discriminating next step.', receiverPersonId: STEWARD, institutionId: STOREHOUSE as InstitutionId, reaction: 'Ur-Nanna nods. “The jars remain held until we have a sample. That is safe, even if it delays the tally.”' } },
      { id: 'certify-all-sound', label: 'Certify all seven as sound', description: 'Claim that the five surface-dry jars and two stained jars are all fit for use despite the absence of internal sampling.', consequences: challengeEffects(0), evaluation: { assessment: 'Overreached', rationale: 'The choice certifies internal grain condition without sampling, which the physical inspection cannot establish.', receiverPersonId: STEWARD, institutionId: STOREHOUSE as InstitutionId, reaction: 'Ur-Nanna closes the copy. “You have certified what nobody has examined. I cannot use this recommendation.”' } },
    ],
  };
}

function missingMeasure(state: GameState, id: ChallengeId, occurrence: ChallengeOccurrence): Omit<ChallengeInstance, 'status' | 'assigneePersonId'> {
  return {
    id,
    title: 'The Missing Measure',
    description: 'The next tally is approaching. Shuruppak-ilu asks whether the account should close with the dispatch figure of 24 and the receiving figure of 23 both preserved, or whether a simpler entry should be made. The records establish a one-measure discrepancy, not where it occurred.',
    category: 'delivery_discrepancy',
    employer: { kind: 'person', id: SENIOR },
    context: {
      what: 'Advise how the one-measure discrepancy should be carried into the next storehouse tally.',
      who: ['Shuruppak-ilu, Senior Scribe', 'Utu-mansum, Receiving Official', 'Enlil-kisu, Carrier Foreman'],
      quantity: '24 measures dispatched; 23 measures received; one measure unlocated.',
      when: 'Before the next Temple Storehouse tally.',
      where: 'Temple Storehouse tablet room and south receiving court.',
      from: 'Carrier dispatch tablet attributed to Enlil-kisu and Utu-mansum’s receiving tally.',
      to: 'Temple Storehouse stock account and Senior Scribe.',
      purpose: 'Preserve an accurate account without converting an unresolved discrepancy into an unsupported accusation.',
      responsibility: ['The scribe recommends accounting treatment; the Senior Scribe controls the official account.'],
      authority: 'The Challenge does not authorize amendment of the institutional ledger or assignment of liability.',
      provenance: ['24-measure dispatch copy', '23-measure receiving tally', 'Witness testimony does not establish the point of loss'],
    },
    deliveryChannels: occurrence.deliveryChannels,
    presentedDay: state.calendar.dayNumber,
    apCost: 2,
    choices: [
      { id: 'preserve-request-origin', label: 'Preserve both figures and request the origin copy', description: 'Record 24 dispatched and 23 received, leave the difference unresolved, and request the originating record or further recount.', consequences: challengeEffects(14), evaluation: { assessment: 'Thorough', rationale: 'Both source figures are preserved, the unresolved difference remains visible, and the originating record is requested rather than inventing a cause.', receiverPersonId: SENIOR, institutionId: STOREHOUSE as InstitutionId, reaction: 'Shuruppak-ilu keeps both figures in the working account. “This can be traced. We will not write a culprit where the tablet gives us none.”' } },
      { id: 'close-qualified-23', label: 'Close at 23 with a qualification', description: 'Carry 23 as the physically received quantity while preserving 24 as the dispatch figure and noting the unresolved difference.', consequences: challengeEffects(10), evaluation: { assessment: 'Defensible', rationale: 'The physically received quantity is carried forward while the dispatch figure and unresolved difference remain attached to the entry.', receiverPersonId: SENIOR, institutionId: STOREHOUSE as InstitutionId, reaction: 'Shuruppak-ilu nods. “We can close the received quantity without erasing the dispatch figure.”' } },
      { id: 'blame-carrier', label: 'Attribute the missing measure to Enlil-kisu', description: 'Name the carrier foreman as responsible even though neither the dispatch/receipt comparison nor the available route evidence locates the loss.', consequences: challengeEffects(0), evaluation: { assessment: 'Overreached', rationale: 'The dispatch/receipt comparison and available route evidence do not locate the loss or establish carrier responsibility.', receiverPersonId: SENIOR, institutionId: STOREHOUSE as InstitutionId, reaction: 'Shuruppak-ilu refuses the accusation. “The account does not locate the loss. I will not enter a name as its cause.”' } },
    ],
  };
}

export const CHALLENGE_CANDIDATE_POOL: readonly ChallengeCandidate[] = [
  {
    scenarioId: 'challenge-seven-sacks',
    weight: 1,
    repeatability: 'once_per_world',
    triggerDomains: ['player_action_outcome', 'institutional_matter_update'],
    resolveOccurrence: resolveSevenSacks,
    buildChallenge: sevenSacks,
  },
  {
    scenarioId: 'challenge-missing-measure',
    weight: 1,
    repeatability: 'once_per_world',
    triggerDomains: ['player_action_outcome', 'professional_behavior_pattern'],
    resolveOccurrence: resolveMissingMeasure,
    buildChallenge: missingMeasure,
  },
];

interface EligibleCandidate {
  definition: ChallengeCandidate;
  occurrence: ChallengeOccurrence;
  occurrenceKey: string;
}

function stableHash32(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index++) {
    hash = Math.imul(hash ^ value.charCodeAt(index), 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

function canonicalOccurrenceKey(scenarioId: string, occurrence: ChallengeOccurrence): string {
  const facts = sourceIds(...occurrence.requiredSourceFactIds);
  return scenarioId + '|matter:' + occurrence.matterId
    + '|primary:' + occurrence.primarySourceFact.kind + ':' + occurrence.primarySourceFact.id
    + '|facts:' + facts.join(',');
}

/** Stable weighted choice; input ordering never changes the selected occurrence. */
export function selectWeightedChallengeCandidate<T extends { scenarioId: string; occurrenceKey: string; weight: number }>(
  candidates: readonly T[],
  selectionSeed: string,
  evaluationIdentity: string,
): T | undefined {
  if (!selectionSeed.trim() || candidates.length === 0) return undefined;
  const compareText = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;
  const ordered = [...candidates].sort((a, b) =>
    compareText(a.scenarioId, b.scenarioId) || compareText(a.occurrenceKey, b.occurrenceKey));
  if (ordered.some((candidate) => !Number.isInteger(candidate.weight) || candidate.weight <= 0)) return undefined;
  const totalWeight = ordered.reduce((sum, candidate) => sum + candidate.weight, 0);
  if (!Number.isSafeInteger(totalWeight) || totalWeight <= 0) return undefined;
  let roll = stableHash32(selectionSeed + '|' + evaluationIdentity + '|' + ordered.map((item) => item.occurrenceKey).join('|')) % totalWeight;
  for (const candidate of ordered) {
    if (roll < candidate.weight) return candidate;
    roll -= candidate.weight;
  }
  return undefined;
}

function hasScenarioHistory(
  state: GameState,
  candidate: ChallengeCandidate,
  occurrence: ChallengeOccurrence,
  occurrenceKey: string,
): boolean {
  // A legacy fixed ID has no recoverable causal identity. Suppress that authored
  // scenario rather than inventing a source fact or migrating a fabricated occurrence.
  if (state.opportunities.challenges[candidate.scenarioId as ChallengeId]
    || state.opportunities.challengeOutcomes.some((outcome) => outcome.challengeId === candidate.scenarioId)
    || state.opportunities.occurrenceLedger.some((entry) => entry.legacy === true && entry.scenarioId === candidate.scenarioId)) return true;

  if (candidate.repeatability === 'once_per_world') {
    return state.opportunities.occurrenceLedger.some((entry) => entry.scenarioId === candidate.scenarioId);
  }
  if (candidate.repeatability === 'once_per_matter') {
    return state.opportunities.occurrenceLedger.some((entry) =>
      entry.scenarioId === candidate.scenarioId && entry.matterId === occurrence.matterId);
  }
  return state.opportunities.occurrenceLedger.some((entry) => entry.occurrenceKey === occurrenceKey);
}

export function runChallengeDirector(state: GameState): GameState {
  // The supervised tutorial is an onboarding gate, not a queued Challenge trigger.
  if (state.calendar.eraId !== 'era-1' || state.works.progress[STOREHOUSE_WORK_ID]?.status !== 'completed') return state;

  const unresolved = Object.values(state.opportunities.challenges)
    .filter((challenge) => challenge.status === 'offered' || challenge.status === 'accepted').length;
  if (unresolved >= 2) return state;
  if (!state.opportunities.selectionSeed.trim()) return state;

  const eligible: EligibleCandidate[] = [];
  for (const definition of CHALLENGE_CANDIDATE_POOL) {
    const occurrence = definition.resolveOccurrence(state);
    if (!occurrence || !occurrence.primarySourceFact || occurrence.requiredSourceFactIds.length === 0
      || !occurrence.requiredSourceFactIds.includes(occurrence.primarySourceFact.id)
      || occurrence.requiredSourceFactIds.some((id) => !state.world.events[id as EventId] && !state.records.entries[id as RecordId])
      || !occurrence.deliveryChannels.length) continue;
    const occurrenceKey = canonicalOccurrenceKey(definition.scenarioId, occurrence);
    if (hasScenarioHistory(state, definition, occurrence, occurrenceKey)) continue;
    eligible.push({ definition, occurrence, occurrenceKey });
  }

  const selected = selectWeightedChallengeCandidate(
    eligible.map((candidate) => ({
      scenarioId: candidate.definition.scenarioId,
      occurrenceKey: candidate.occurrenceKey,
      weight: candidate.definition.weight,
      candidate,
    })),
    state.opportunities.selectionSeed,
    state.calendar.eraId + ':' + state.calendar.dayNumber,
  );
  if (!selected) return state;

  const { definition, occurrence, occurrenceKey } = selected.candidate;
  const challenge = definition.buildChallenge(state, occurrenceKey as ChallengeId, occurrence);
  const result = transitionOpportunityAction(state, { type: 'PRESENT_CHALLENGE', challenge });
  if (result.feedback?.kind === 'error') return state;

  const entry = {
    scenarioId: definition.scenarioId,
    occurrenceKey,
    lifecycle: 'offered' as OpportunityOccurrenceLifecycle,
    matterId: occurrence.matterId,
    primarySourceFact: occurrence.primarySourceFact,
    requiredSourceFactIds: occurrence.requiredSourceFactIds,
    deliveryChannels: occurrence.deliveryChannels,
    presentedDay: state.calendar.dayNumber,
  };
  return {
    ...result.state,
    opportunities: {
      ...result.state.opportunities,
      occurrenceLedger: [...result.state.opportunities.occurrenceLedger, entry],
    },
  };
}
