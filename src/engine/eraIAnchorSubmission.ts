import type { AssignmentOffer, AssignmentActivityProgress, GameState, TransitionResult, RecordEntry, RecordSource, RecordAssertion, KnowledgeEntry } from '../state/types';
import type { InstitutionId, KnowledgeEntryId, PersonId, RecordId } from '../state/ids';
import type { AssignmentActivityDefinition } from '../content/assignments/northBayRoofInspection';
import { getInitializedScribal } from '../state/scribalState';
import { applyClosingAssessment } from './closingReceipt';
import { addActivity } from './opportunities';
import { queueSettlementCredit } from './dayClose';

const fail = (state: GameState, code: string, message: string): TransitionResult => ({ state, feedback: { kind: 'error', code, message } });
const succeed = (state: GameState, message: string): TransitionResult => ({ state, feedback: { kind: 'success', code: 'assignment-activity-submitted', message } });

function assess(definition: AssignmentActivityDefinition, progress: AssignmentActivityProgress) {
  const rubric = definition.evaluation;
  if (!rubric) return null;
  const cited = new Set(progress.draft.citedDiscoveryIds);
  const selectedLimitations = new Set(progress.draft.selectedLimitationIds ?? []);
  const overreached = rubric.unsupportedFindingIds.includes(progress.draft.finding)
    || rubric.unsupportedResponsibilityClaimIds.includes(progress.draft.responsibilityClaim)
    || (rubric.unsupportedRecommendationIds ?? []).some((id) => progress.draft.recommendations.includes(id));
  if (overreached) return 'Overreached' as const;
  const incomplete = rubric.requiredEvidenceIds.some((id) => !cited.has(id))
    || rubric.requiredLimitationIds.some((id) => !selectedLimitations.has(id));
  if (incomplete) return 'Incomplete' as const;
  const thorough = rubric.relevantEvidenceIds.every((id) => !progress.discoveryIds.includes(id) || cited.has(id))
    && rubric.relevantLimitationIds.every((id) => selectedLimitations.has(id));
  return thorough ? 'Thorough' as const : 'Defensible' as const;
}

export function submitRubricAssignmentActivity(
  state: GameState, offer: AssignmentOffer, definition: AssignmentActivityDefinition, progress: AssignmentActivityProgress,
): TransitionResult | null {
  if (!definition.evaluation) return null;
  const rubric = definition.evaluation;
  const person = state.world.people[state.player.currentCharacterId];
  const scribal = getInitializedScribal(person);
  const matter = offer.originMatterId ? state.world.matters[offer.originMatterId] : undefined;
  const institutionId = matter?.institutionId ?? (offer.employer.kind === 'institution' ? offer.employer.id : undefined);
  const institution = institutionId ? state.world.institutions[institutionId] : undefined;
  if (!rubric || !person || !scribal || !institution) return fail(state, 'assignment-activity-world-invalid', 'The anchor report lacks its authored evaluation or receiving institution.');
  const assessment = assess(definition, progress);
  if (!assessment) return fail(state, 'assignment-activity-rubric-invalid', 'The anchor report has no valid assessment.');
  const finding = definition.reportSchema.findings.find((option) => option.id === progress.draft.finding);
  const responsibility = definition.reportSchema.responsibilityClaims.find((option) => option.id === progress.draft.responsibilityClaim);
  const selectedLimitations = (progress.draft.selectedLimitationIds ?? []).flatMap((id) => {
    const option = definition.reportSchema.limitationOptions?.find((item) => item.id === id);
    return option ? [{ id, label: option.label }] : [];
  });
  const citedDiscoveries = definition.discoveries.filter((item) => progress.draft.citedDiscoveryIds.includes(item.id));
  const recordId = `record-${offer.id}-day-${state.calendar.dayNumber}` as RecordId;
  if (state.records.entries[recordId]) return fail(state, 'assignment-activity-record-exists', 'A report record already exists for this deterministic submission ID.');
  const sources: RecordSource[] = [
    ...(matter?.sourceEventId ? [{ id: 'source-matter-event', kind: 'event' as const, sourceId: matter.sourceEventId, description: matter.summary }] : []),
    ...(matter?.sourceRecordId ? [{ id: 'source-matter-record', kind: 'other' as const, sourceId: matter.sourceRecordId, description: 'Original source record linked to the active institutional matter.' }] : []),
    { id: 'source-player-report', kind: 'other', description: 'Submitted report by the current scribe; selected limitations and notes are player-authored content.' },
    ...citedDiscoveries.map((item) => ({
      id: `source-${item.id}`, kind: 'other' as const,
      description: `${item.title}: ${item.text}`,
    })),
  ];
  const reportSourceIds = ['source-player-report'];
  const assertions: RecordAssertion[] = [
    ...citedDiscoveries.map((item) => ({
      id: `assertion-${item.id}`, text: item.text, classification: 'reported' as const,
      sourceIds: [`source-${item.id}`],
    })),
    { id: 'assertion-finding', text: `Finding: ${finding?.label ?? progress.draft.finding}`, classification: assessment === 'Overreached' ? 'disputed' : 'reported', sourceIds: reportSourceIds },
    { id: 'assertion-responsibility', text: `Responsibility: ${responsibility?.label ?? progress.draft.responsibilityClaim}`, classification: assessment === 'Overreached' ? 'disputed' : 'reported', sourceIds: reportSourceIds },
    ...progress.draft.recommendations.map((id, index) => ({
      id: `assertion-recommendation-${index}`,
      text: `Recommendation: ${definition.reportSchema.recommendations.find((option) => option.id === id)?.label ?? id}`,
      classification: (rubric.unsupportedRecommendationIds ?? []).includes(id) ? 'disputed' as const : 'reported' as const, sourceIds: reportSourceIds,
    })),
    ...selectedLimitations.map((item) => ({
      id: `assertion-selected-limitation-${item.id}`, text: `Player-selected limitation: ${item.label}`,
      classification: 'reported' as const, sourceIds: reportSourceIds,
    })),
    ...(progress.draft.limitationNotes?.trim() ? [{
      id: 'assertion-limitation-note', text: `Ungraded player note: ${progress.draft.limitationNotes.trim()}`,
      classification: 'reported' as const, sourceIds: reportSourceIds,
    }] : []),
    ...progress.draft.limitations.filter(Boolean).map((note, index) => ({
      id: `assertion-legacy-limitation-${index}`, text: `Legacy free-text limitation (ungraded): ${note}`,
      classification: 'reported' as const, sourceIds: reportSourceIds,
    })),
  ];
  const systemCaveats = definition.submissionNote ? [`System caveat: ${definition.submissionNote}`] : [];
  const record: RecordEntry = {
    id: recordId, createdDay: state.calendar.dayNumber, authorPersonId: person.id, institutionId: institution.id,
    title: definition.reportSchema.title, sources, assertions,
    uncertaintyLimits: systemCaveats, amendments: [],
  };
  const receiverId = rubric.receiverPersonId;
  const reportProvenanceId = `assignment-report-${recordId}`;
  const updatedMatter = matter ? {
    ...matter,
    provenance: [
      ...(matter.provenance ?? []).filter((source) => source.id !== reportProvenanceId),
      { id: reportProvenanceId, kind: 'record_copy' as const, sourceId: recordId, description: 'Submitted apprentice report; filing does not itself resolve the institutional matter.' },
    ],
  } : undefined;
  const knowledgeHolders = [...new Set<PersonId>([
    ...(receiverId ? [receiverId] : []),
    ...(offer.employer.kind === 'person' ? [offer.employer.id as PersonId] : []),
    ...progress.consultedPersonIds,
  ])];
  const knowledge: KnowledgeEntry[] = [
    ...knowledgeHolders.map((holder) => ({
      id: `knowledge-${offer.id}-day-${state.calendar.dayNumber}-${holder}` as KnowledgeEntryId,
      holder: { kind: 'person' as const, id: holder },
      subject: { kind: 'record' as const, id: recordId },
      basis: 'received-copy' as const, learnedDay: state.calendar.dayNumber, sourcePersonId: person.id,
    })),
    {
      id: `knowledge-${offer.id}-day-${state.calendar.dayNumber}-institution` as KnowledgeEntryId,
      holder: { kind: 'institution' as const, id: institution.id },
      subject: { kind: 'record' as const, id: recordId },
      basis: 'received-copy' as const, learnedDay: state.calendar.dayNumber, sourcePersonId: person.id,
    },
  ];
  const reaction = rubric.reactions[assessment]
    .replaceAll('{finding}', finding?.label ?? progress.draft.finding)
    .replaceAll('{responsibility}', responsibility?.label ?? progress.draft.responsibilityClaim);
  const evaluated = applyClosingAssessment(state, {
    receiptId: `assignment-receipt-${offer.id}-day-${state.calendar.dayNumber}`,
    title: offer.title,
    disposition: finding?.label ?? progress.draft.finding,
    assessment,
    rationale: rubric.rationales[assessment],
    reaction,
    baseCareerXp: offer.careerXpReward,
    institutionId: institution.id,
    receiverPersonId: receiverId,
    currencyDelta: offer.compensation.money,
    provisionsDelta: offer.compensation.provisions,
    ...(offer.compensation.money || offer.compensation.provisions
      ? { compensationTiming: 'Contracted compensation is payable in full at preliminary Day-Close, regardless of assessment.' } : {}),
  });
  if (!evaluated) return fail(state, 'assignment-activity-outcome-invalid', 'The Closing Receipt could not be applied to the current character.');
  const completedOffer = { ...offer, status: 'completed' as const, activityProgress: progress,
    closingReceipt: evaluated.receipt, receiptAcknowledged: false };
  const next: GameState = {
    ...evaluated.state,
    actionEconomy: { ...evaluated.state.actionEconomy, apRemaining: evaluated.state.actionEconomy.apRemaining - definition.submissionApCost },
    records: { ...evaluated.state.records, entries: { ...evaluated.state.records.entries, [recordId]: record } },
    world: {
      ...evaluated.state.world,
      matters: updatedMatter ? { ...evaluated.state.world.matters, [updatedMatter.id]: updatedMatter } : evaluated.state.world.matters,
      knowledge: { ...evaluated.state.world.knowledge, ...Object.fromEntries(knowledge.map((entry) => [entry.id, entry])) },
    },
    opportunities: { ...evaluated.state.opportunities, assignments: {
      ...evaluated.state.opportunities.assignments, [offer.id]: completedOffer,
    } },
  };
  const queued = queueSettlementCredit(next, {
    id: 'assignment:' + offer.id + ':' + state.calendar.dayNumber,
    source: { kind: 'assignment', id: offer.id },
    earnedDay: state.calendar.dayNumber,
    money: offer.compensation.money,
    provisions: offer.compensation.provisions,
  });
  return succeed(addActivity(queued, completedOffer, 'completed'), `The report was filed and a ${assessment} Closing Receipt is ready for review.`);
}
