import { CORE_SKILL_IDS } from './ids';
import type { AttributeId, SkillId } from './ids';
import type { GameState, OpportunityConsequences, SaveEnvelope, ScribalCharacterState, WorkProgress } from './types';
import { validateOpportunityConsequences } from './opportunityValidation';
import type { WorkDefinition } from '../works/workDefinition';
import { rankSuccessorCandidates } from '../engine/characterContinuity';

export const SAVE_KEY = 'scribe_game_v2';
// Keep schema v2: the production provider has not been mounted, so shipped v2 saves have empty opportunity maps and works.progress.
// Populated Work progress is checked against the supplied Work catalog; legacy empty maps remain valid without migration.
export const SAVE_SCHEMA_VERSION = 2 as const;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function finiteNonNegative(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}
function score(value: unknown): value is number { return finiteNonNegative(value) && value <= 100; }
function stringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string' && item.length > 0);
}
const ATTRIBUTE_IDS: readonly AttributeId[] = ['precision','perception','reasoning','expression','endurance','composure'];
const SPECIALIZATION_LEVELS = ['practitioner','specialist','master'] as const;
const RELATIONSHIP_DIMENSIONS = ['trust','respect','affection','resentment','rivalry','familiarity'] as const;
const RECORD_CLASSES = ['observed','reported','inferred','disputed'] as const;
const SOURCE_KINDS = ['person','institution','event','material','other'] as const;
const KNOWLEDGE_BASES = ['direct-involvement','testimony','received-copy','consulted-record','public-disclosure','other'] as const;

function isSkill(value: unknown): boolean {
  return isObject(value) && Number.isInteger(value.level) && finiteNonNegative(value.level)
    && value.level >= 1 && value.level <= 10 && finiteNonNegative(value.skillXp);
}
function isConditionModifier(value: unknown): boolean {
  if (!isObject(value) || !isObject(value.target) || typeof value.value !== 'number'
    || !Number.isFinite(value.value) || !stringArray(value.actionTags) || value.actionTags.length === 0) return false;
  if (value.target.kind === 'skill') return CORE_SKILL_IDS.includes(value.target.id as SkillId);
  if (value.target.kind === 'attribute') return ATTRIBUTE_IDS.includes(value.target.id as AttributeId);
  return false;
}
function isScribal(value: unknown, institutionIds: Set<string>): value is ScribalCharacterState {
  if (!isObject(value) || (value.careerPath !== undefined
    && !['government','military','religious','merchant'].includes(value.careerPath as string))
    || !finiteNonNegative(value.careerXp) || !finiteNonNegative(value.stress) || value.stress > 100
    || !isObject(value.wallet) || !isObject(value.skills) || !isObject(value.attributes)
    || !Array.isArray(value.specializations) || !Array.isArray(value.traits) || !Array.isArray(value.conditions)
    || !Array.isArray(value.equipment) || !value.equipment.every((x) => typeof x === 'string')
    || !isObject(value.professionalReputation) || !isObject(value.institutionalStanding)) return false;
  const wallet = value.wallet;
  if (!finiteNonNegative(wallet.money) || !finiteNonNegative(wallet.provisions)
    || !finiteNonNegative(wallet.shortageWorkdays) || !Number.isInteger(wallet.shortageWorkdays)) return false;
  for (const [id, skill] of Object.entries(value.skills)) if (!CORE_SKILL_IDS.includes(id as SkillId) || !isSkill(skill)) return false;
  for (const [id, attribute] of Object.entries(value.attributes)) if (!ATTRIBUTE_IDS.includes(id as AttributeId) || !finiteNonNegative(attribute)) return false;
  for (const [id, standing] of Object.entries(value.institutionalStanding)) if (!institutionIds.has(id) || !score(standing)) return false;
  let primary = 0;
  for (const s of value.specializations) {
    if (!isObject(s) || typeof s.id !== 'string' || !s.id || !SPECIALIZATION_LEVELS.includes(s.level as typeof SPECIALIZATION_LEVELS[number])
      || !finiteNonNegative(s.specializationXp) || typeof s.isPrimary !== 'boolean') return false;
    if (s.isPrimary) primary++;
  }
  if (primary > 1) return false;
  for (const t of value.traits) if (!isObject(t) || typeof t.id !== 'string' || !t.id
    || ![1,2,3].includes(t.intensity as number) || (t.origin !== 'starting' && t.origin !== 'emergent')) return false;
  for (const c of value.conditions) if (!isObject(c) || typeof c.id !== 'string' || !c.id
    || ![1,2,3].includes(c.severity as number) || !Array.isArray(c.modifiers) || !c.modifiers.every(isConditionModifier)
    || (c.remainingWorkdays !== undefined && (!finiteNonNegative(c.remainingWorkdays) || !Number.isInteger(c.remainingWorkdays)))) return false;
  for (const d of ['competence','reliability','discretion','judgment'] as const) if (!score(value.professionalReputation[d])) return false;
  return true;
}
function isRelationship(value: unknown): boolean {
  if (!isObject(value) || !isObject(value.dimensions) || !Array.isArray(value.history)) return false;
  for (const d of RELATIONSHIP_DIMENSIONS) if (!score(value.dimensions[d])) return false;
  return value.history.every((h) => isObject(h) && typeof h.id === 'string' && !!h.id
    && finiteNonNegative(h.dayNumber) && Number.isInteger(h.dayNumber) && typeof h.summary === 'string' && !!h.summary
    && (h.eventId === undefined || typeof h.eventId === 'string'));
}
function isInstitution(value: unknown, locationIds: Set<string>): boolean {
  return isObject(value) && typeof value.id === 'string' && !!value.id && typeof value.name === 'string' && !!value.name
    && (value.locationId === undefined || (typeof value.locationId === 'string' && locationIds.has(value.locationId)))
    && stringArray(value.responsibilities) && stringArray(value.authority) && score(value.standing)
    && stringArray(value.activeMatters);
}
function isEvent(value: unknown, calendarDay: number, people: Record<string, unknown>, institutions: Record<string, unknown>, locations: Record<string, unknown>): boolean {
  return isObject(value) && typeof value.id === 'string' && !!value.id && finiteNonNegative(value.dayNumber)
    && Number.isInteger(value.dayNumber) && value.dayNumber >= 1 && value.dayNumber <= calendarDay && typeof value.summary === 'string' && !!value.summary
    && Array.isArray(value.personIds) && value.personIds.every((id) => typeof id === 'string' && isObject(people[id]))
    && Array.isArray(value.institutionIds) && value.institutionIds.every((id) => typeof id === 'string' && isObject(institutions[id]))
    && (value.locationId === undefined || (typeof value.locationId === 'string' && isObject(locations[value.locationId])));
}
function isSource(value: unknown, people: Record<string, unknown>, institutions: Record<string, unknown>, events: Record<string, unknown>): boolean {
  if (!isObject(value) || typeof value.id !== 'string' || !value.id || !SOURCE_KINDS.includes(value.kind as typeof SOURCE_KINDS[number])
    || typeof value.description !== 'string' || !value.description) return false;
  if (value.kind === 'person') return typeof value.sourceId === 'string' && isObject(people[value.sourceId]);
  if (value.kind === 'institution') return typeof value.sourceId === 'string' && isObject(institutions[value.sourceId]);
  if (value.kind === 'event') return typeof value.sourceId === 'string' && isObject(events[value.sourceId]);
  return value.sourceId === undefined || typeof value.sourceId === 'string';
}
function isAssertion(value: unknown, sourceIds: Set<string>): boolean {
  return isObject(value) && typeof value.id === 'string' && !!value.id && typeof value.text === 'string' && !!value.text
    && RECORD_CLASSES.includes(value.classification as typeof RECORD_CLASSES[number])
    && Array.isArray(value.sourceIds) && value.sourceIds.every((id) => typeof id === 'string' && sourceIds.has(id));
}

function isWorkAssessmentDimensions(value: unknown): boolean {
  if (!Array.isArray(value) || value.length === 0) return false;
  const valid = value.every((item) => isObject(item)
    && ['accuracy','completeness','responsible_interpretation','procedure','traceability','responsibility'].includes(item.dimension as string)
    && ['meets','partial','fails'].includes(item.status as string)
    && typeof item.summary === 'string' && !!item.summary);
  return valid && new Set(value.map((item) => (item as { dimension: string }).dimension)).size === value.length;
}

function isWorkProgress(value: unknown): value is WorkProgress {
  if (!isObject(value) || !['active','completed','abandoned'].includes(value.status as string)) return false;
  const acquiredEvidence = value.acquiredEvidence;
  const examinedEvidence = value.examinedEvidence;
  const completedActionIds = value.completedActionIds;
  if (!stringArray(acquiredEvidence) || !stringArray(examinedEvidence) || !stringArray(completedActionIds)) return false;
  if (new Set(acquiredEvidence).size !== acquiredEvidence.length
    || new Set(examinedEvidence).size !== examinedEvidence.length
    || examinedEvidence.some((id) => !acquiredEvidence.includes(id))
    || !Number.isInteger(value.workApSpentToday) || (value.workApSpentToday as number) < 0 || (value.workApSpentToday as number) > 7
    || typeof value.rewardGranted !== 'boolean' || (value.status === 'completed') !== value.rewardGranted
    || new Set(completedActionIds).size !== completedActionIds.length
    || !isObject(value.scenarioData) || !Number.isInteger(value.submissionCount) || (value.submissionCount as number) < 0) return false;
  if (value.provisionContract !== undefined && (!isObject(value.provisionContract)
    || !Number.isInteger(value.provisionContract.provisionsPerQualifiedWorkday)
    || (value.provisionContract.provisionsPerQualifiedWorkday as number) < 0
    || !Number.isInteger(value.provisionContract.minimumWorkApPerDay)
    || (value.provisionContract.minimumWorkApPerDay as number) < 1
    || (value.provisionContract.minimumWorkApPerDay as number) > 6)) return false;
  if (value.pendingDisposition !== undefined && typeof value.pendingDisposition !== 'boolean') return false;
  if (value.finalDisposition !== undefined && (typeof value.finalDisposition !== 'string' || !value.finalDisposition)) return false;
  if (value.pendingDisposition === true && (value.lastAssessment === undefined || value.status !== 'active' || value.rewardGranted)) return false;
  if (value.finalDisposition !== undefined && (value.status !== 'completed' || value.pendingDisposition === true)) return false;
  if (value.status === 'active' && value.lastAssessment !== undefined && value.lastAssessment.outcome === 'accepted'
    && value.pendingDisposition !== true) return false;
  if (value.lastAssessment !== undefined && (!isObject(value.lastAssessment)
    || !['accepted','revise','rejected'].includes(value.lastAssessment.outcome as string)
    || typeof value.lastAssessment.summary !== 'string' || !value.lastAssessment.summary
    || !Number.isInteger(value.lastAssessment.assessedDay) || (value.lastAssessment.assessedDay as number) < 1
    || !isWorkAssessmentDimensions(value.lastAssessment.dimensions))) return false;
  return true;
}

export function isValidGameState(value: unknown, workCatalog: Readonly<Record<string, WorkDefinition<any>>> = {}): value is GameState {
  if (!isObject(value) || !isObject(value.calendar) || !isObject(value.actionEconomy) || !isObject(value.player)
    || !isObject(value.world) || !isObject(value.historicalProgression) || !isObject(value.opportunities)
    || !isObject(value.works) || !isObject(value.records) || !isObject(value.journal)) return false;
  const calendar = value.calendar, economy = value.actionEconomy, player = value.player, world = value.world, works = value.works;
  const workProgressMap = works.progress;
  if (!isObject(workProgressMap)) return false;
  const activeWorkId = works.activeWorkId;
  if (activeWorkId !== null && (typeof activeWorkId !== 'string'
    || !isWorkProgress(workProgressMap[activeWorkId]) || workProgressMap[activeWorkId].status !== 'active')) return false;
  if (typeof calendar.eraId !== 'string' || !finiteNonNegative(calendar.dayNumber) || !Number.isInteger(calendar.dayNumber)
    || calendar.dayNumber < 1 || typeof calendar.displayDate !== 'string') return false;
  if ((economy.dailyApAllocation !== 5 && economy.dailyApAllocation !== 6) || !finiteNonNegative(economy.apRemaining)
    || !Number.isInteger(economy.apRemaining) || economy.apRemaining > economy.dailyApAllocation
    || typeof economy.overtimeUsedToday !== 'boolean' || typeof economy.nextDayApPenalty !== 'boolean') return false;
  if (typeof player.currentCharacterId !== 'string' || !isObject(world.people) || !isObject(world.relationships)
    || !isObject(world.institutions) || !isObject(world.locations) || !isObject(world.appointments)
    || !isObject(world.events) || !isObject(world.knowledge) || !isObject(value.records.entries)) return false;

  const people = world.people, institutions = world.institutions, locations = world.locations;
  const events = world.events, records = value.records.entries;
  for (const [id, p] of Object.entries(people)) {
    if (!isObject(p) || p.id !== id || typeof p.name !== 'string' || !p.name || typeof p.alive !== 'boolean'
      || !Array.isArray(p.affiliations) || !p.affiliations.every((x) => typeof x === 'string' && isObject(institutions[x]))
      || (p.currentLocationId !== undefined && (typeof p.currentLocationId !== 'string' || !isObject(locations[p.currentLocationId])))
      || (p.scribal !== undefined && !isScribal(p.scribal, new Set(Object.keys(institutions))))) return false;
  }
  const active = people[player.currentCharacterId];
  if (!isObject(active) || !isScribal(active.scribal, new Set(Object.keys(institutions)))) return false;
  const pendingSuccession = value.pendingSuccession;
  if (pendingSuccession === undefined || pendingSuccession === null) {
    if (active.alive !== true) return false;
  } else {
    if (!isObject(pendingSuccession) || pendingSuccession.formerCharacterId !== player.currentCharacterId
      || !['death','departure'].includes(pendingSuccession.departureKind as string)
      || pendingSuccession.dayNumber !== calendar.dayNumber
      || !['awaiting_selection','no_successor'].includes(pendingSuccession.status as string)
      || !stringArray(pendingSuccession.candidateIds)
      || new Set(pendingSuccession.candidateIds as string[]).size !== (pendingSuccession.candidateIds as string[]).length
      || (pendingSuccession.departureKind === 'death' ? active.alive !== false : active.alive !== true)) return false;
    const discovered = rankSuccessorCandidates(value as unknown as GameState).map((candidate) => candidate.personId);
    if (discovered.length !== (pendingSuccession.candidateIds as string[]).length
      || discovered.some((id, index) => id !== (pendingSuccession.candidateIds as string[])[index])
      || (discovered.length > 0) !== (pendingSuccession.status === 'awaiting_selection')) return false;
  }
  if (value.characterTransitions !== undefined && (!Array.isArray(value.characterTransitions)
    || value.characterTransitions.some((entry) => !isObject(entry)
      || typeof entry.formerCharacterId !== 'string' || !isObject(people[entry.formerCharacterId])
      || typeof entry.nextCharacterId !== 'string' || !isObject(people[entry.nextCharacterId])
      || entry.formerCharacterId === entry.nextCharacterId
      || !['death','departure'].includes(entry.departureKind as string)
      || !Number.isInteger(entry.dayNumber) || (entry.dayNumber as number) < 1 || (entry.dayNumber as number) > (calendar.dayNumber as number)))) return false;

  for (const [fromId, targets] of Object.entries(world.relationships)) {
    if (!isObject(people[fromId]) || !isObject(targets)) return false;
    for (const [toId, rel] of Object.entries(targets)) {
      if (fromId === toId || !isObject(people[toId]) || !isObject(rel) || !isRelationship(rel)
        || !Array.isArray(rel.history)
        || rel.history.some((h) => isObject(h) && h.eventId !== undefined && !isObject(events[h.eventId as string]))) return false;
    }
  }
  for (const [id, x] of Object.entries(institutions)) if (!isObject(x) || !isInstitution(x, new Set(Object.keys(locations))) || x.id !== id) return false;
  for (const [id, x] of Object.entries(locations)) if (!isObject(x) || x.id !== id || typeof x.name !== 'string' || !x.name) return false;
  for (const [id, x] of Object.entries(world.appointments)) {
    if (!isObject(x) || !id || x.id !== id || typeof x.personId !== 'string' || !isObject(people[x.personId])
      || typeof x.institutionId !== 'string' || !isObject(institutions[x.institutionId])
      || typeof x.title !== 'string' || !x.title || !stringArray(x.authorityScope) || x.authorityScope.length === 0
      || !stringArray(x.responsibilities) || !finiteNonNegative(x.startDay) || !Number.isInteger(x.startDay) || x.startDay < 1
      || (x.endDay !== undefined && (!finiteNonNegative(x.endDay) || !Number.isInteger(x.endDay) || x.endDay < x.startDay))) return false;
  }
  for (const [id, x] of Object.entries(events)) if (!isObject(x) || !isEvent(x, calendar.dayNumber, people, institutions, locations) || x.id !== id) return false;

  for (const [id, r] of Object.entries(records)) {
    if (!isObject(r) || r.id !== id || !finiteNonNegative(r.createdDay) || !Number.isInteger(r.createdDay) || r.createdDay < 1 || r.createdDay > calendar.dayNumber
      || typeof r.authorPersonId !== 'string' || !isObject(people[r.authorPersonId])
      || (r.institutionId !== undefined && (typeof r.institutionId !== 'string' || !isObject(institutions[r.institutionId])))
      || typeof r.title !== 'string' || !r.title || !Array.isArray(r.sources) || !Array.isArray(r.assertions)
      || !stringArray(r.uncertaintyLimits) || !Array.isArray(r.amendments)) return false;
    const sourceIds = new Set<string>();
    for (const s of r.sources) { if (!isSource(s, people, institutions, events) || sourceIds.has(s.id)) return false; sourceIds.add(s.id); }
    if (!r.assertions.every((a) => isAssertion(a, sourceIds))) return false;
    const amendmentIds = new Set<string>();
    for (const [amendmentIndex, a] of r.amendments.entries()) {
      if (!isObject(a) || typeof a.id !== 'string' || !a.id || amendmentIds.has(a.id)
        || !finiteNonNegative(a.dayNumber) || !Number.isInteger(a.dayNumber) || a.dayNumber < r.createdDay || a.dayNumber > calendar.dayNumber
        || typeof a.authorPersonId !== 'string' || !isObject(people[a.authorPersonId])
        || typeof a.reason !== 'string' || !a.reason || !Array.isArray(a.sourcesAdded)
        || !Array.isArray(a.assertionsAdded) || !stringArray(a.uncertaintyLimitsAdded) || typeof a.note !== 'string') return false;
      amendmentIds.add(a.id);
      for (const s of a.sourcesAdded) { if (!isSource(s, people, institutions, events) || sourceIds.has(s.id)) return false; sourceIds.add(s.id); }
      const existingAssertionIds = new Set<string>(r.assertions.map((base) => base.id));
      for (const prior of r.amendments.slice(0, amendmentIndex)) {
        if (isObject(prior) && Array.isArray(prior.assertionsAdded)) {
          for (const priorAssertion of prior.assertionsAdded) {
            if (isObject(priorAssertion) && typeof priorAssertion.id === 'string') existingAssertionIds.add(priorAssertion.id);
          }
        }
      }
      for (const added of a.assertionsAdded) {
        if (!isAssertion(added, sourceIds) || existingAssertionIds.has(added.id)) return false;
        existingAssertionIds.add(added.id);
      }
    }
  }
  for (const [id, k] of Object.entries(world.knowledge)) {
    if (!isObject(k) || k.id !== id || !isObject(k.holder) || !isObject(k.subject)
      || !KNOWLEDGE_BASES.includes(k.basis as typeof KNOWLEDGE_BASES[number])
      || !finiteNonNegative(k.learnedDay) || !Number.isInteger(k.learnedDay) || k.learnedDay < 1
      || (k.sourcePersonId !== undefined && (typeof k.sourcePersonId !== 'string' || !isObject(people[k.sourcePersonId])))) return false;
    const holder = k.holder.kind === 'person' ? typeof k.holder.id === 'string' && isObject(people[k.holder.id])
      : k.holder.kind === 'institution' && typeof k.holder.id === 'string' && isObject(institutions[k.holder.id]);
    const subject = k.subject.kind === 'event' ? typeof k.subject.id === 'string' && isObject(events[k.subject.id])
      : k.subject.kind === 'record' && typeof k.subject.id === 'string' && isObject(records[k.subject.id]);
    if (!holder || !subject) return false;
  }

  if (!isObject(value.opportunities.assignments) || !isObject(value.opportunities.challenges)
    || !isObject(value.opportunities.assignmentAggregates) || !Array.isArray(value.opportunities.challengeOutcomes)
    || !Array.isArray(value.opportunities.recentActivity)) return false;
  const assignmentStates = ['offered','accepted','declined','lapsed','completed','cancelled'];
  const opportunityContext = value as unknown as GameState;
  for (const [id, offer] of Object.entries(value.opportunities.assignments)) {
    if (!isObject(offer) || offer.id !== id || !assignmentStates.includes(offer.status as string)
      || typeof offer.title !== 'string' || !offer.title || typeof offer.description !== 'string'
      || !isObject(offer.employer) || (offer.employer.kind !== 'person' && offer.employer.kind !== 'institution')
      || typeof offer.employer.id !== 'string' || !(offer.employer.kind === 'person' ? isObject(people[offer.employer.id]) : isObject(institutions[offer.employer.id]))
      || typeof offer.category !== 'string' || !offer.category || !isObject(offer.context)
      || typeof offer.context.what !== 'string' || !offer.context.what || typeof offer.context.purpose !== 'string' || !offer.context.purpose
      || !Array.isArray(offer.context.who) || !stringArray(offer.context.responsibility) || !stringArray(offer.context.provenance)
      || !isObject(offer.requiredSkills) || Object.entries(offer.requiredSkills).some(([skill, level]) => !CORE_SKILL_IDS.includes(skill as SkillId) || !Number.isInteger(level) || (level as number) < 1 || (level as number) > 10)
      || !['routine','demanding','critical'].includes(offer.difficulty as string) || !Number.isInteger(offer.apCost) || (offer.apCost as number) < 1 || (offer.apCost as number) > 6
      || (offer.completionConsequences !== undefined && (!isObject(offer.completionConsequences) || !!validateOpportunityConsequences(offer.completionConsequences as OpportunityConsequences, opportunityContext, 'authoring')))
      || (offer.cancellationConsequences !== undefined && (!isObject(offer.cancellationConsequences) || !!validateOpportunityConsequences(offer.cancellationConsequences as OpportunityConsequences, opportunityContext, 'authoring')))
      || !isObject(offer.compensation) || !finiteNonNegative(offer.compensation.money) || !finiteNonNegative(offer.compensation.provisions)
      || !finiteNonNegative(offer.careerXpReward) || !finiteNonNegative(offer.offeredDay) || !Number.isInteger(offer.offeredDay)
      || !finiteNonNegative(offer.expiresDay) || !Number.isInteger(offer.expiresDay) || (offer.expiresDay as number) <= (offer.offeredDay as number)
      || !Array.isArray(offer.deliveryChannels) || !offer.deliveryChannels.length
      || offer.deliveryChannels.some((channel) => !isObject(channel) || typeof channel.explanation !== 'string' || !channel.explanation
        || !['baseline_reach','relationship','specialization','appointment','reputation'].includes(channel.kind as string))
      || (offer.lapsedDuringMandatoryWork !== undefined && typeof offer.lapsedDuringMandatoryWork !== 'boolean')
      || (offer.assigneePersonId !== undefined && (typeof offer.assigneePersonId !== 'string' || !isObject(people[offer.assigneePersonId])))) return false;
  }
  for (const [key, aggregate] of Object.entries(value.opportunities.assignmentAggregates)) {
    if (!isObject(aggregate) || aggregate.key !== key || !isObject(aggregate.employer)
      || !['person','institution'].includes(aggregate.employer.kind as string)
      || typeof aggregate.employer.id !== 'string'
      || !(aggregate.employer.kind === 'person' ? isObject(people[aggregate.employer.id]) : isObject(institutions[aggregate.employer.id]))
      || typeof aggregate.category !== 'string'
      || !['presented','accepted','declined','nonWorkLapsed','completed'].every((field) => Number.isInteger(aggregate[field]) && finiteNonNegative(aggregate[field]))) return false;
  }
  if (!Array.isArray(value.opportunities.recentActivity) || value.opportunities.recentActivity.length > 5
    || value.opportunities.recentActivity.some((entry) => !isObject(entry) || !finiteNonNegative(entry.dayNumber)
      || !['presented','accepted','declined','lapsed','completed','cancelled'].includes(entry.kind as string)
      || typeof entry.employerKey !== 'string' || typeof entry.category !== 'string' || typeof entry.assignmentId !== 'string'
      || (entry.lapsedDuringMandatoryWork !== undefined && typeof entry.lapsedDuringMandatoryWork !== 'boolean'))) return false;
  if (!Array.isArray(value.opportunities.challengeOutcomes)) return false;
  for (const [id, challenge] of Object.entries(value.opportunities.challenges)) {
    if (!isObject(challenge) || challenge.id !== id || typeof challenge.title !== 'string' || !challenge.title
      || typeof challenge.description !== 'string' || typeof challenge.category !== 'string'
      || !isObject(challenge.context) || typeof challenge.context.what !== 'string' || typeof challenge.context.purpose !== 'string'
      || !finiteNonNegative(challenge.presentedDay) || !Number.isInteger(challenge.apCost) || (challenge.apCost as number) < 1 || (challenge.apCost as number) > 6 || !Array.isArray(challenge.choices) || !challenge.choices.length
      || new Set(challenge.choices.filter(isObject).map((choice) => choice.id)).size !== challenge.choices.length
      || challenge.choices.some((choice) => !isObject(choice) || typeof choice.id !== 'string' || !choice.id
        || typeof choice.label !== 'string' || !choice.label || typeof choice.description !== 'string' || !choice.description
        || !isObject(choice.consequences) || !!validateOpportunityConsequences(choice.consequences as OpportunityConsequences | undefined, opportunityContext, 'authoring'))) return false;
  }
  return finiteNonNegative(value.historicalProgression.historicalXp) && stringArray(value.historicalProgression.completedWorks)
    && new Set(value.historicalProgression.completedWorks).size === value.historicalProgression.completedWorks.length
    && value.historicalProgression.completedWorks.every((id) => isWorkProgress(workProgressMap[id])
      && workProgressMap[id].status === 'completed')
    && isObject(value.opportunities.assignments) && isObject(value.opportunities.challenges)
    && (activeWorkId === null || typeof activeWorkId === 'string')
    && Object.entries(workProgressMap).every(([id, progress]) => !!id && isWorkProgress(progress)
      && !!workCatalog[id] && workCatalog[id].id === id
      && workCatalog[id].validateScenarioData((progress as WorkProgress).scenarioData)
      && (progress as WorkProgress).acquiredEvidence.every((evidenceId) => workCatalog[id].evidence.some((item) => item.id === evidenceId))
      && (progress as WorkProgress).completedActionIds.every((actionId) => workCatalog[id].actions.some((item) => item.id === actionId))
      && (workCatalog[id].finalizeDisposition
        ? ((progress as WorkProgress).status === 'completed'
          ? workCatalog[id].dispositions?.includes((progress as WorkProgress).finalDisposition ?? '') === true
          : (progress as WorkProgress).finalDisposition === undefined)
        : (progress as WorkProgress).finalDisposition === undefined))
    && Array.isArray(value.records.permanentOutcomes)
    && Array.isArray(value.journal.notices);
}
export function createSaveEnvelope(state: GameState, revision: number, savedAt = new Date().toISOString()): SaveEnvelope {
  return { schemaVersion: SAVE_SCHEMA_VERSION, gameVersion: '0.1.0', revision, savedAt, state };
}
export function isValidSaveEnvelope(value: unknown, workCatalog: Readonly<Record<string, WorkDefinition<any>>> = {}): value is SaveEnvelope {
  return isObject(value) && value.schemaVersion === SAVE_SCHEMA_VERSION && typeof value.gameVersion === 'string'
    && finiteNonNegative(value.revision) && Number.isInteger(value.revision) && typeof value.savedAt === 'string'
    && Number.isFinite(Date.parse(value.savedAt)) && isValidGameState(value.state, workCatalog);
}
export function restoreSave(raw: string | null, workCatalog: Readonly<Record<string, WorkDefinition<any>>> = {}): SaveEnvelope | null {
  if (!raw) return null;
  try { const parsed: unknown = JSON.parse(raw); return isValidSaveEnvelope(parsed, workCatalog) ? parsed : null; }
  catch { return null; }
}
