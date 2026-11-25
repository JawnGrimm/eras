import type { AssignmentOffer, AssignmentActivityProgress, GameState, TransitionResult, RecordEntry, RecordSource, RecordAssertion, KnowledgeEntry } from '../state/types';
import type { EventId, InstitutionId, KnowledgeEntryId, PersonId, RecordId } from '../state/ids';
import { ERA1_COM_F01_ACTIVITY_ID, ERA1_COM_F01_PEOPLE } from '../content/assignments/eraICommercialMartial';
import type { AssignmentActivityDefinition } from '../content/assignments/northBayRoofInspection';
import { getInitializedScribal } from '../state/scribalState';
import { applyClosingAssessment, CLOSING_RECEIPT_SCHEDULE } from './closingReceipt';
import { addActivity } from './opportunities';
import { queueSettlementCredit } from './dayClose';

const fail = (state: GameState, code: string, message: string): TransitionResult => ({ state, feedback: { kind: 'error', code, message } });
const succeed = (state: GameState, message: string): TransitionResult => ({ state, feedback: { kind: 'success', code: 'assignment-activity-submitted', message } });

export function evaluateAssignmentAssessment(definition: AssignmentActivityDefinition, progress: AssignmentActivityProgress) {
  const rubric = definition.evaluation;
  if (!rubric) return null;
  const cited = new Set(progress.draft.citedDiscoveryIds);
  const selectedLimitations = new Set(progress.draft.selectedLimitationIds ?? []);
  const overreached = rubric.unsupportedFindingIds.includes(progress.draft.finding)
    || (rubric.unsupportedFindingConditions ?? []).some((condition) => condition.findingId === progress.draft.finding
      && !condition.requiredEvidenceIds.every((id) => cited.has(id)))
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
  const matterInstitutionId = matter?.institutionId;
  const employerInstitutionId = offer.employer.kind === 'institution' ? offer.employer.id as InstitutionId : undefined;
  const institutionId: InstitutionId | undefined = matterInstitutionId && state.world.institutions[matterInstitutionId as InstitutionId]
    ? matterInstitutionId as InstitutionId
    : employerInstitutionId;
  const institution = institutionId ? state.world.institutions[institutionId] : undefined;
  if (!rubric || !person || !scribal || !institution) return fail(state, 'assignment-activity-world-invalid', 'The anchor report lacks its authored evaluation or receiving institution.');
  const assessment = evaluateAssignmentAssessment(definition, progress);
  if (!assessment) return fail(state, 'assignment-activity-rubric-invalid', 'The anchor report has no valid assessment.');
  const finding = definition.reportSchema.findings.find((option) => option.id === progress.draft.finding);
  const responsibility = definition.reportSchema.responsibilityClaims.find((option) => option.id === progress.draft.responsibilityClaim);
  const selectedLimitations = (progress.draft.selectedLimitationIds ?? []).flatMap((id) => {
    const option = definition.reportSchema.limitationOptions?.find((item) => item.id === id);
    return option ? [{ id, label: option.label }] : [];
  });
  const citedDiscoveries = definition.discoveries.filter((item) => progress.draft.citedDiscoveryIds.includes(item.id));
  const unresolvedSource = definition.discoveries.find((item) => progress.draft.citedDiscoveryIds.includes(item.id)
    && item.sourceProvenanceId && !matter?.provenance?.some((source) => source.id === item.sourceProvenanceId));
  if (unresolvedSource) return fail(state, 'assignment-activity-source-missing', `The source provenance for ${unresolvedSource.title} is not present on the active matter.`);
  const recordId = `record-${offer.id}-day-${state.calendar.dayNumber}` as RecordId;
  if (state.records.entries[recordId]) return fail(state, 'assignment-activity-record-exists', 'A report record already exists for this deterministic submission ID.');
  const sources: RecordSource[] = [
    ...(matter?.sourceEventId ? [{ id: 'source-matter-event', kind: 'event' as const, sourceId: matter.sourceEventId, description: matter.summary }] : []),
    ...(matter?.sourceRecordId ? [{ id: 'source-matter-record', kind: 'other' as const, sourceId: matter.sourceRecordId, description: 'Original source record linked to the active institutional matter.' }] : []),
    { id: 'source-player-report', kind: 'other', description: 'Submitted report by the current scribe; selected limitations and notes are player-authored content.' },
    ...citedDiscoveries.map((item) => {
      const linkedProvenance = item.sourceProvenanceId
        ? matter?.provenance?.find((source) => source.id === item.sourceProvenanceId)
        : undefined;
      const sourcePersonId = item.sourcePersonId
        ?? (linkedProvenance?.kind === 'testimony' ? linkedProvenance.sourceId as PersonId : undefined);
      const sourceEventId = item.sourceEventId
        ?? (linkedProvenance?.kind === 'event' ? linkedProvenance.sourceId as EventId : undefined);
      const sourceRecordId = item.sourceRecordId
        ?? (linkedProvenance?.kind === 'record_copy' ? linkedProvenance.sourceId as RecordId : undefined);
      return {
        id: `source-${item.id}`,
        kind: sourcePersonId ? 'person' as const : sourceEventId ? 'event' as const : 'other' as const,
        ...(sourcePersonId ? { sourceId: sourcePersonId }
          : sourceEventId ? { sourceId: sourceEventId }
          : sourceRecordId ? { sourceId: sourceRecordId } : {}),
        description: `${item.title}: ${item.text}`,
      };
    }),
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
    ...(offer.activityId === ERA1_COM_F01_ACTIVITY_ID ? [ERA1_COM_F01_PEOPLE.responsibleAuthority] : []),
    ...progress.consultedPersonIds,
  ])];
  const knowledge: KnowledgeEntry[] = [
    ...knowledgeHolders.map((holder) => ({
      id: `knowledge-${offer.id}-day-${state.calendar.dayNumber}-${holder}` as KnowledgeEntryId,
      holder: { kind: 'person' as const, id: holder },
      subject: { kind: 'record' as const, id: recordId },
      basis: 'received-copy' as const, learnedDay: state.calendar.dayNumber, sourcePersonId: person.id,
      assertion: { kind: 'fact' as const, text: 'Received a copy of the submitted assignment report.' }, assessments: [],
    })),
    {
      id: `knowledge-${offer.id}-day-${state.calendar.dayNumber}-institution` as KnowledgeEntryId,
      holder: { kind: 'institution' as const, id: institution.id },
      subject: { kind: 'record' as const, id: recordId },
      basis: 'received-copy' as const, learnedDay: state.calendar.dayNumber, sourcePersonId: person.id,
      assertion: { kind: 'fact' as const, text: 'Received a copy of the submitted assignment report.' }, assessments: [],
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
    contextId: offer.activityId ?? offer.category, occasionId: offer.originMatterId ? `${offer.originMatterId}:${offer.activityId ?? offer.category}` : offer.id,
    ...(offer.originMatterId && state.world.matters[offer.originMatterId] ? { matterId: offer.originMatterId } : {}),
    currencyDelta: offer.compensation.money,
    provisionsDelta: offer.compensation.provisions,
    ...(offer.compensation.money || offer.compensation.provisions
      ? { compensationTiming: 'Contracted compensation is payable in full at preliminary Day-Close, regardless of assessment.' } : {}),
  });
  if (!evaluated) return fail(state, 'assignment-activity-outcome-invalid', 'The Closing Receipt could not be applied to the current character.');
  const f01 = offer.activityId === ERA1_COM_F01_ACTIVITY_ID;
  const f01Recommendation = progress.draft.recommendations[0];
  const f01Supported = assessment === 'Thorough' || assessment === 'Defensible';
  const f01Disposition = !f01 ? undefined
    : !f01Supported ? (assessment === 'Incomplete' ? 'report_set_aside_existing_hold_retained' : 'report_returned_existing_hold_retained')
    : f01Recommendation === 'hold_for_craft_examination' ? 'held_for_craft_examination'
    : f01Recommendation === 'enter_with_exception' ? 'exception_recorded_acceptance_pending'
    : 'held_for_clarification';
  const f01DispositionLabel = !f01Disposition ? undefined : ({
    held_for_craft_examination: 'Receiving entry held; referral recorded for Ur-Lamma’s craft-suitability judgment.',
    exception_recorded_acceptance_pending: 'Description difference entered as an exception; acceptance remains pending.',
    held_for_clarification: 'Receiving entry held; clarifying-record request routed to Lu-Nanshe for an authorized decision.',
    report_set_aside_existing_hold_retained: 'Report set aside; the existing receiving hold remains unchanged.',
    report_returned_existing_hold_retained: 'Report returned; the existing receiving hold remains unchanged.',
  } as const)[f01Disposition];
  const f01EventId = f01 ? `event-${offer.id}-day-${state.calendar.dayNumber}-receiving-disposition` as EventId : undefined;
  const f01DispositionRecordId = f01 ? `record-${offer.id}-day-${state.calendar.dayNumber}-receiving-disposition` as RecordId : undefined;
  const f01Event = f01 && f01EventId ? {
    id: f01EventId, dayNumber: state.calendar.dayNumber,
    summary: `Utu-mansum’s receiving response to the submitted report: ${f01DispositionLabel}`,
    personIds: [ERA1_COM_F01_PEOPLE.receiver, ERA1_COM_F01_PEOPLE.responsibleAuthority, ERA1_COM_F01_PEOPLE.workshopOverseer, person.id],
    institutionIds: [institution.id], locationId: matter?.locationId,
  } : undefined;
  const f01DispositionRecord = f01 && f01DispositionRecordId && f01EventId && f01DispositionLabel ? {
    id: f01DispositionRecordId, createdDay: state.calendar.dayNumber, authorPersonId: ERA1_COM_F01_PEOPLE.receiver,
    institutionId: institution.id, title: 'Receiving disposition — Material Not As Described',
    sources: [
      { id: 'source-player-report', kind: 'other' as const, sourceId: recordId, description: 'Submitted apprentice report; this records the receiving official’s response, not an amendment to a pre-existing receiving entry.' },
      { id: 'source-disposition-event', kind: 'event' as const, sourceId: f01EventId, description: 'Utu-mansum’s authored receiving response to the submitted report.' },
    ],
    assertions: [
      { id: 'assertion-receiving-disposition', text: f01DispositionLabel, classification: 'reported' as const, sourceIds: ['source-disposition-event'] },
      { id: 'assertion-authority-boundary', text: 'This disposition does not accept or reject the material, authorize replacement, or resolve the institutional matter. Lu-Nanshe retains the acceptance or replacement decision.', classification: 'reported' as const, sourceIds: ['source-disposition-event'] },
    ],
    uncertaintyLimits: ['No separate original receiving RecordEntry existed to amend; this is a new durable disposition record linked to the player report.'],
    amendments: [],
  } : undefined;
  const f01Matter = f01 && matter && f01DispositionRecordId ? {
    ...(updatedMatter ?? matter),
    provenance: [
      ...(updatedMatter?.provenance ?? matter.provenance ?? []),
      { id: `f01-disposition-${recordId}`, kind: 'record_copy' as const, sourceId: f01DispositionRecordId,
        description: 'Durable receiving disposition linked to the submitted report; the matter remains active pending an authorized decision.' },
    ],
  } : undefined;
  let outcomeRelationships = evaluated.state.world.relationships;
  const relationshipEventIdFor = (affectedPersonId: PersonId): EventId | undefined => {
    if (f01Event && f01Event.personIds.includes(person.id) && f01Event.personIds.includes(affectedPersonId)) return f01Event.id;
    const consultationAction = definition.actions.find((item) =>
      item.family === 'consult' && item.consultedPersonId === affectedPersonId && progress.completedActionIds.includes(item.id),
    );
    if (!consultationAction) return undefined;
    const eventId = `event-assignment-consultation-${offer.id}-${consultationAction.id}` as EventId;
    return evaluated.state.world.events[eventId] ? eventId : undefined;
  };
  if (f01 && f01Supported) {
    const affected = ERA1_COM_F01_PEOPLE.workshopOverseer;
    const relationshipEventId = relationshipEventIdFor(affected);
    const current = outcomeRelationships[affected]?.[person.id];
    const dimensions = { trust: 50, respect: 50, affection: 50, resentment: 0, rivalry: 0, ...current?.dimensions };
    const trustDelta = assessment === 'Thorough' ? 2 : 1;
    outcomeRelationships = {
      ...outcomeRelationships,
      [affected]: {
        ...outcomeRelationships[affected],
        [person.id]: {
          dimensions: { ...dimensions, trust: Math.min(100, dimensions.trust + trustDelta), respect: Math.min(100, dimensions.respect + 1) },
          history: [...(current?.history ?? []), {
            id: `assignment-receipt-${offer.id}-day-${state.calendar.dayNumber}:ur-lamma-relationship`,
            dayNumber: state.calendar.dayNumber,
            summary: assessment === 'Thorough'
              ? 'Ur-Lamma regards the scribe as reliable after a thorough report supports the documented description difference.'
              : 'Ur-Lamma regards the scribe as reliable after a defensible report supports the documented description difference.',
          ...(relationshipEventId ? { eventId: relationshipEventId } : {}),
          }],
        },
      },
    };
  }
  for (const affectedPersonId of rubric.relationshipPersonIds ?? []) {
    if (affectedPersonId === receiverId || affectedPersonId === person.id) continue;
    const affectedPerson = state.world.people[affectedPersonId];
    if (!affectedPerson) continue;
    const relationshipEventId = relationshipEventIdFor(affectedPersonId);
    const current = outcomeRelationships[affectedPersonId]?.[person.id];
    const dimensions = { trust: 50, respect: 50, affection: 50, resentment: 0, rivalry: 0, ...current?.dimensions };
    const schedule = CLOSING_RECEIPT_SCHEDULE[assessment];
    const trust = Math.max(0, Math.min(100, dimensions.trust + schedule.trust));
    const respect = Math.max(0, Math.min(100, dimensions.respect + schedule.respect));
    if (trust === dimensions.trust && respect === dimensions.respect) continue;
    const trustChange = trust > dimensions.trust ? 'increased' : trust < dimensions.trust ? 'decreased' : 'remained unchanged';
    const respectChange = respect > dimensions.respect ? 'increased' : respect < dimensions.respect ? 'decreased' : 'remained unchanged';
    outcomeRelationships = {
      ...outcomeRelationships,
      [affectedPersonId]: {
        ...outcomeRelationships[affectedPersonId],
        [person.id]: {
          dimensions: { ...dimensions, trust, respect },
          history: [...(current?.history ?? []), {
            id: `assignment-receipt-${offer.id}-day-${state.calendar.dayNumber}:relationship-${affectedPersonId}`,
            dayNumber: state.calendar.dayNumber,
            summary: `After ${person.name} submitted "${record.title}" on Day ${record.createdDay}, ${affectedPerson.name}'s trust toward ${person.name} ${trustChange} and respect toward ${person.name} ${respectChange}.`,
          ...(relationshipEventId ? { eventId: relationshipEventId } : {}),
          }],
        },
      },
    };
  }
  const completedOffer = { ...offer, status: 'completed' as const, activityProgress: progress,
    closingReceipt: evaluated.receipt, receiptAcknowledged: false };
  const next: GameState = {
    ...evaluated.state,
    actionEconomy: { ...evaluated.state.actionEconomy, apRemaining: evaluated.state.actionEconomy.apRemaining - definition.submissionApCost },
    records: { ...evaluated.state.records, entries: { ...evaluated.state.records.entries, [recordId]: record, ...(f01DispositionRecord ? { [f01DispositionRecord.id]: f01DispositionRecord } : {}) } },
    world: {
      ...evaluated.state.world,
      relationships: outcomeRelationships,
      events: f01Event ? { ...evaluated.state.world.events, [f01Event.id]: f01Event } : evaluated.state.world.events,
      matters: updatedMatter || f01Matter ? { ...evaluated.state.world.matters, ...(updatedMatter ? { [updatedMatter.id]: updatedMatter } : {}), ...(f01Matter ? { [f01Matter.id]: f01Matter } : {}) } : evaluated.state.world.matters,
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
