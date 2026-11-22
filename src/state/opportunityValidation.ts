import type { AuthoredDatePolicy, GameState, OpportunityConsequences } from './types';

type ValidationContext = Pick<GameState, 'calendar' | 'world' | 'records'>;
export type ConsequenceValidationPhase = 'authoring' | 'runtime';

function validPolicy(policy: unknown, currentDay: number, phase: ConsequenceValidationPhase): policy is AuthoredDatePolicy {
  if (!policy || typeof policy !== 'object') return false;
  const p = policy as Record<string, unknown>;
  if (p.kind === 'resolution_day') return Object.keys(p).length === 1;
  if (p.kind !== 'fixed' || Object.keys(p).some((key) => key !== 'kind' && key !== 'dayNumber')) return false;
  return Number.isInteger(p.dayNumber) && (p.dayNumber as number) >= 1
    && (phase !== 'runtime' || (p.dayNumber as number) <= currentDay);
}

/** Validates the complete authored sequence without mutating state. Newly-created IDs
 * become valid references only after their creating step appears in this sequence. */
export function validateOpportunityConsequences(
  effects: OpportunityConsequences | undefined,
  context: ValidationContext,
  phase: ConsequenceValidationPhase,
): string | null {
  if (!effects) return null;
  const currentDay = context.calendar.dayNumber;
  const raw = effects as OpportunityConsequences & { historicalXp?: unknown };
  if (Object.prototype.hasOwnProperty.call(raw, 'historicalXp')) return 'Opportunities cannot award Historical Progress XP.';
  for (const n of [effects.moneyDelta ?? 0, effects.provisionsDelta ?? 0, effects.careerXp ?? 0]) {
    if (typeof n !== 'number' || !Number.isFinite(n)) return 'Resource and Career XP consequences must be finite.';
  }
  if (effects.careerXp !== undefined && (!Number.isFinite(effects.careerXp) || effects.careerXp < 0)) return 'Career XP consequence is invalid.';
  if (effects.relationships !== undefined && (!Array.isArray(effects.relationships) || effects.relationships.some((x) =>
    !context.world.people[x.fromId] || !context.world.people[x.toId] || x.fromId === x.toId || !x.summary
      || !x.changes || Object.values(x.changes).some((n) => typeof n !== 'number' || !Number.isFinite(n))))) return 'Relationship consequence has invalid people or values.';
  if (effects.institutionalStanding !== undefined && (!Array.isArray(effects.institutionalStanding) || effects.institutionalStanding.some((x) =>
    !context.world.institutions[x.institutionId] || typeof x.delta !== 'number' || !Number.isFinite(x.delta)))) return 'Institutional-standing consequence has invalid references or values.';

  const policies = effects.datePolicies;
  const createdEvents = new Set<string>();
  const createdRecords = new Set<string>();
  const event = effects.event;
  if (event) {
    if (!validPolicy(policies?.event, currentDay, phase) || !event.id || context.world.events[event.id]
      || !event.summary || !Array.isArray(event.personIds) || event.personIds.some((id) => !context.world.people[id])
      || !Array.isArray(event.institutionIds) || event.institutionIds.some((id) => !context.world.institutions[id])
      || (event.locationId !== undefined && !context.world.locations[event.locationId])) return 'Event consequence or its date policy is invalid.';
    createdEvents.add(event.id);
  } else if (policies?.event !== undefined) return 'An event date policy has no event.';

  const record = effects.record;
  if (record) {
    if (!validPolicy(policies?.record, currentDay, phase) || !record.id || context.records.entries[record.id]
      || !record.title || !context.world.people[record.authorPersonId]
      || (record.institutionId !== undefined && !context.world.institutions[record.institutionId])
      || !Array.isArray(record.sources) || !Array.isArray(record.assertions) || !Array.isArray(record.uncertaintyLimits)
      || !Array.isArray(record.amendments) || record.amendments.length !== 0) return 'Record consequence or its date policy is invalid.';
    const sourceIds = new Set<string>();
    for (const source of record.sources) {
      if (!source.id || sourceIds.has(source.id) || !source.description) return 'Record provenance IDs must be unique and described.';
      sourceIds.add(source.id);
      if (source.kind === 'person' && (!source.sourceId || !context.world.people[source.sourceId as keyof typeof context.world.people])) return 'Record references a missing person source.';
      if (source.kind === 'institution' && (!source.sourceId || !context.world.institutions[source.sourceId as keyof typeof context.world.institutions])) return 'Record references a missing institution source.';
      if (source.kind === 'event' && (!source.sourceId || (!context.world.events[source.sourceId as keyof typeof context.world.events] && !createdEvents.has(source.sourceId)))) return 'Record references an event that has not been created yet.';
      if (!['person','institution','event','material','other'].includes(source.kind)) return 'Record source kind is invalid.';
    }
    const assertionIds = new Set<string>();
    for (const assertion of record.assertions) {
      if (!assertion.id || assertionIds.has(assertion.id) || !assertion.text || !Array.isArray(assertion.sourceIds)
        || assertion.sourceIds.some((id) => !sourceIds.has(id))
        || !['observed','reported','inferred','disputed'].includes(assertion.classification)) return 'Record assertion is invalid or unsupported by its sources.';
      assertionIds.add(assertion.id);
    }
    createdRecords.add(record.id);
  } else if (policies?.record !== undefined) return 'A record date policy has no record.';

  const knowledge = effects.knowledge ?? [];
  if (!Array.isArray(knowledge)) return 'Knowledge consequences must be an array.';
  const knowledgePolicies = policies?.knowledge ?? {};
  if (Object.keys(knowledgePolicies).some((id) => !knowledge.some((entry) => entry.id === id))) return 'Knowledge date policy references no knowledge entry.';
  const createdKnowledge = new Set<string>();
  for (const entry of knowledge) {
    if (!validPolicy(knowledgePolicies[entry.id], currentDay, phase) || !entry.id || context.world.knowledge[entry.id] || createdKnowledge.has(entry.id)) return 'Knowledge entry or its date policy is invalid.';
    const holderExists = entry.holder.kind === 'person' ? !!context.world.people[entry.holder.id]
      : entry.holder.kind === 'institution' ? !!context.world.institutions[entry.holder.id] : false;
    const subjectExists = entry.subject.kind === 'event' ? !!context.world.events[entry.subject.id] || createdEvents.has(entry.subject.id)
      : entry.subject.kind === 'record' ? !!context.records.entries[entry.subject.id] || createdRecords.has(entry.subject.id) : false;
    if (!holderExists || !subjectExists || (entry.sourcePersonId && !context.world.people[entry.sourcePersonId])
      || !['direct-involvement','testimony','received-copy','consulted-record','public-disclosure','other'].includes(entry.basis)) return 'Knowledge entry references an unavailable holder, subject, or source.';
    createdKnowledge.add(entry.id);
  }
  return null;
}

export function resolveOpportunityDatePolicies(effects: OpportunityConsequences, currentDay: number): OpportunityConsequences {
  const policies = effects.datePolicies;
  return {
    ...effects,
    ...(effects.event ? { event: { ...effects.event, dayNumber: policies?.event?.kind === 'fixed' ? policies.event.dayNumber : currentDay } } : {}),
    ...(effects.record ? { record: { ...effects.record, createdDay: policies?.record?.kind === 'fixed' ? policies.record.dayNumber : currentDay } } : {}),
    ...(effects.knowledge ? { knowledge: effects.knowledge.map((entry) => ({
      ...entry, learnedDay: policies?.knowledge?.[entry.id]?.kind === 'fixed' ? policies.knowledge[entry.id].dayNumber : currentDay,
    })) } : {}),
  };
}
