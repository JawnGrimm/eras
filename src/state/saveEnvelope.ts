import { CORE_SKILL_IDS } from './ids';
import { MATTER_IDS, SOUTH_COURT_LOCATION_ID, SOUTH_LOADING_LOCATION_ID } from '../engine/institutionalMatters';
import type { AttributeId, SkillId } from './ids';
import type { GameState, Institution, OpportunityConsequences, SaveEnvelope, PersonScribalState, WorkProgress } from './types';
import { validateOpportunityConsequences } from './opportunityValidation';
import type { WorkDefinition } from '../works/workDefinition';
import { validateWorkDefinition } from '../works/workDefinition';
import { rankSuccessorCandidates } from '../engine/characterContinuity';
import { validateInstitutionalResponseEvent } from '../engine/institutionalResponseValidation';
import { isInitializedScribalState } from './scribalState';
import { NORTH_BAY_PEOPLE, NORTH_BAY_LOCATION_ID, ASSIGNMENT_ACTIVITY_CATALOG, validateAssignmentActivityProgress } from '../content/assignments/northBayRoofInspection';

export const SAVE_KEY = 'scribe_game_v2';
// Keep schema v2 for compatibility with early production saves that contain empty opportunity maps and works.progress; populated entries are validated against the registered Work catalog.
// Populated Work progress is checked against the supplied Work catalog; legacy empty maps remain valid without migration.
export const SAVE_SCHEMA_VERSION = 2 as const;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function nonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
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
function isScribal(value: unknown, institutionIds: Set<string>): value is PersonScribalState {
  if (!isObject(value)) return false;
  if (value.stage === 'identity') {
    return ['government','military','religious','merchant'].includes(value.careerPath as string)
      && Object.keys(value).every((key) => key === 'stage' || key === 'careerPath');
  }
  if (value.stage !== undefined && value.stage !== 'initialized') return false;
  if ((value.careerPath !== undefined
    && !['government','military','religious','merchant'].includes(value.careerPath as string))
    || !finiteNonNegative(value.careerXp) || !finiteNonNegative(value.stress) || value.stress > 100
    || !isObject(value.wallet) || !isObject(value.skills) || !isObject(value.attributes)
    || !Array.isArray(value.specializations) || !Array.isArray(value.traits) || !Array.isArray(value.conditions)
    || !Array.isArray(value.equipment) || !value.equipment.every((x) => typeof x === 'string')
    || !Number.isInteger(value.cumulativeShortageStress) || (value.cumulativeShortageStress as number) < 0 || (value.cumulativeShortageStress as number) > 10
    || !Array.isArray(value.obligations) || value.obligations.some((item) => !isObject(item)
      || typeof item.id !== 'string' || !item.id || typeof item.creditorPersonId !== 'string'
      || !Number.isInteger(item.createdDay) || (item.createdDay as number) < 1
      || item.kind !== 'repayment_or_service' || typeof item.description !== 'string' || !item.description
      || item.status !== 'outstanding')
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
function isInstitution(value: unknown, locationIds: Set<string>): value is Institution {
  return isObject(value) && typeof value.id === 'string' && !!value.id && typeof value.name === 'string' && !!value.name
    && (value.locationId === undefined || (typeof value.locationId === 'string' && locationIds.has(value.locationId)))
    && stringArray(value.responsibilities) && stringArray(value.authority) && score(value.standing)
    && stringArray(value.activeMatters);
}

const LIFE_EVENT_KINDS = ['origin','early_responsibility','formative_experience','professional_entry','first_instruction'] as const;
const LIFE_EVENT_STAGES = ['early_life','youth','transition_to_scribal_work'] as const;
const HISTORICAL_CONFIDENCE = ['attested','inferred','reconstruction'] as const;
const FAMILIARITY_EXPOSURES = ['observed','assisted','practiced_under_instruction'] as const;

function isCharacterCreationRecord(value: unknown): boolean {
  return isObject(value) && nonEmptyString(value.contentVersion)
    && ['originId','responsibilityId','formativeExperienceId','entryRouteId','instructionId']
      .every((field) => nonEmptyString(value[field]));
}
function isPersonLifeEvent(value: unknown): boolean {
  return isObject(value) && nonEmptyString(value.id)
    && LIFE_EVENT_KINDS.includes(value.kind as typeof LIFE_EVENT_KINDS[number])
    && nonEmptyString(value.contentId)
    && nonEmptyString(value.summary)
    && isObject(value.chronology)
    && LIFE_EVENT_STAGES.includes(value.chronology.stage as typeof LIFE_EVENT_STAGES[number])
    && Number.isInteger(value.chronology.order) && (value.chronology.order as number) >= 0
    && Array.isArray(value.participants)
    && value.participants.every((participant) => isObject(participant)
      && nonEmptyString(participant.personId)
      && nonEmptyString(participant.role))
    && new Set(value.participants.map((participant) => (participant as Record<string, unknown>).personId)).size === value.participants.length
    && HISTORICAL_CONFIDENCE.includes(value.historicalConfidence as typeof HISTORICAL_CONFIDENCE[number]);
}
function isPersonFamiliarity(value: unknown): boolean {
  return isObject(value) && nonEmptyString(value.id)
    && nonEmptyString(value.domainId)
    && nonEmptyString(value.scopeId)
    && FAMILIARITY_EXPOSURES.includes(value.exposure as typeof FAMILIARITY_EXPOSURES[number])
    && Array.isArray(value.basisLifeEventIds) && value.basisLifeEventIds.length > 0
    && value.basisLifeEventIds.every(nonEmptyString)
    && new Set(value.basisLifeEventIds).size === value.basisLifeEventIds.length;
}

function isPersonProfile(value: Record<string, unknown>): boolean {
  const lifeStages = ['apprentice','junior_scribe','established_scribe','active_official','senior_scribe','craft_practitioner','elder'];
  if (value.lifeStage !== undefined && !lifeStages.includes(value.lifeStage as string)) return false;
  if (value.socialIdentity !== undefined && (!isObject(value.socialIdentity)
    || typeof value.socialIdentity.summary !== 'string' || !value.socialIdentity.summary
    || (value.socialIdentity.occupation !== undefined && (typeof value.socialIdentity.occupation !== 'string' || !value.socialIdentity.occupation)))) return false;
  if (value.circumstances !== undefined && (!Array.isArray(value.circumstances) || value.circumstances.some((item) =>
    !isObject(item) || typeof item.id !== 'string' || !item.id
    || !['work','resource','dispute','instruction','institutional_duty','other'].includes(item.kind as string)
    || typeof item.summary !== 'string' || !item.summary || !Number.isInteger(item.sinceDay) || (item.sinceDay as number) < 1
    || !['active','resolved'].includes(item.status as string) || !['public','private'].includes(item.visibility as string)
    || (item.relatedMatterIds !== undefined && !stringArray(item.relatedMatterIds))
    || (item.sourceEventId !== undefined && typeof item.sourceEventId !== 'string')))) return false;
  if (value.objectives !== undefined && (!Array.isArray(value.objectives) || value.objectives.some((item) =>
    !isObject(item) || typeof item.id !== 'string' || !item.id
    || !['immediate','long_term'].includes(item.horizon as string)
    || typeof item.summary !== 'string' || !item.summary || typeof item.motivation !== 'string' || !item.motivation
    || !Number.isInteger(item.createdDay) || (item.createdDay as number) < 1
    || !['active','fulfilled','abandoned'].includes(item.status as string) || !['public','private'].includes(item.visibility as string)
    || (item.relatedMatterIds !== undefined && !stringArray(item.relatedMatterIds))))) return false;
  if (value.commitments !== undefined && (!Array.isArray(value.commitments) || value.commitments.some((item) =>
    !isObject(item) || typeof item.id !== 'string' || !item.id
    || !['office_duty','agreement','personal_undertaking','allocation'].includes(item.kind as string)
    || typeof item.summary !== 'string' || !item.summary || !Number.isInteger(item.createdDay) || (item.createdDay as number) < 1
    || !isObject(item.basis) || !['appointment','record','event','institutional_matter','agreement'].includes(item.basis.kind as string)
    || typeof item.basis.id !== 'string' || !item.basis.id
    || !['active','fulfilled','disputed','released'].includes(item.status as string) || !['public','private'].includes(item.visibility as string)
    || (item.dueDay !== undefined && (!Number.isInteger(item.dueDay) || (item.dueDay as number) < (item.createdDay as number)))
    || (item.institutionId !== undefined && typeof item.institutionId !== 'string')
    || (item.relatedMatterIds !== undefined && !stringArray(item.relatedMatterIds))))) return false;
  if (value.characterCreation !== undefined && !isCharacterCreationRecord(value.characterCreation)) return false;
  if (value.lifeEvents !== undefined) {
    if (!Array.isArray(value.lifeEvents) || !value.lifeEvents.every(isPersonLifeEvent)) return false;
    const events = value.lifeEvents as Array<Record<string, unknown>>;
    if (new Set(events.map((event) => event.id)).size !== events.length
      || new Set(events.map((event) => (event.chronology as Record<string, unknown>).order)).size !== events.length) return false;
  }
  if (value.familiarities !== undefined) {
    if (!Array.isArray(value.familiarities) || !value.familiarities.every(isPersonFamiliarity)) return false;
    const familiarity = value.familiarities as Array<Record<string, unknown>>;
    if (new Set(familiarity.map((item) => item.id)).size !== familiarity.length
      || new Set(familiarity.map((item) => JSON.stringify([item.domainId, item.scopeId]))).size !== familiarity.length) return false;
  }
  return true;
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
  if (!isObject(value) || !['active','completed','abandoned','suspended'].includes(value.status as string)) return false;
  const effectiveStatus = value.status === 'suspended' ? value.suspendedFromStatus : value.status;
  if (value.status === 'suspended'
    ? !['active','completed','abandoned'].includes(value.suspendedFromStatus as string)
    : value.suspendedFromStatus !== undefined) return false;
  if (value.definitionCompatibilityKey !== undefined
    && (typeof value.definitionCompatibilityKey !== 'string' || !value.definitionCompatibilityKey.trim())) return false;
  const acquiredEvidence = value.acquiredEvidence;
  const examinedEvidence = value.examinedEvidence;
  const completedActionIds = value.completedActionIds;
  if (!stringArray(acquiredEvidence) || !stringArray(examinedEvidence) || !stringArray(completedActionIds)) return false;
  if (new Set(acquiredEvidence).size !== acquiredEvidence.length
    || new Set(examinedEvidence).size !== examinedEvidence.length
    || examinedEvidence.some((id) => !acquiredEvidence.includes(id))
    || !Number.isInteger(value.workApSpentToday) || (value.workApSpentToday as number) < 0 || (value.workApSpentToday as number) > 7
    || typeof value.rewardGranted !== 'boolean' || (effectiveStatus === 'completed') !== value.rewardGranted
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
  if (value.pendingDisposition === true && (value.lastAssessment === undefined || effectiveStatus !== 'active' || value.rewardGranted)) return false;
  if (value.finalDisposition !== undefined && (effectiveStatus !== 'completed' || value.pendingDisposition === true)) return false;
  if (effectiveStatus === 'active' && isObject(value.lastAssessment) && value.lastAssessment.outcome === 'accepted'
    && value.pendingDisposition !== true) return false;
  if (value.lastAssessment !== undefined && (!isObject(value.lastAssessment)
    || !['accepted','revise','rejected'].includes(value.lastAssessment.outcome as string)
    || typeof value.lastAssessment.summary !== 'string' || !value.lastAssessment.summary
    || !Number.isInteger(value.lastAssessment.assessedDay) || (value.lastAssessment.assessedDay as number) < 1
    || !isWorkAssessmentDimensions(value.lastAssessment.dimensions))) return false;
  return true;
}


function isCompatibleWorkProgress(id: string, value: unknown, workCatalog: Readonly<Record<string, WorkDefinition<any>>>): boolean {
  if (!isWorkProgress(value)) return false;
  if (value.status === 'suspended') return true;
  const definition = workCatalog[id];
  return !!definition && definition.id === id
    && (definition.kind === 'work' || definition.kind === 'tutorial')
    && validateWorkDefinition(definition).length === 0
    && value.definitionCompatibilityKey === definition.progressCompatibilityKey
    && definition.validateScenarioData(value.scenarioData)
    && value.acquiredEvidence.every((evidenceId) => definition.evidence.some((item) => item.id === evidenceId))
    && value.completedActionIds.every((actionId) => definition.actions.some((item) => item.id === actionId))
    && (definition.finalizeDisposition
      ? (value.status === 'completed'
        ? definition.dispositions?.includes(value.finalDisposition ?? '') === true
          && value.submissionCount >= 1 && value.lastAssessment?.outcome === 'accepted'
        : value.finalDisposition === undefined)
      : value.finalDisposition === undefined);
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
    || typeof economy.overtimeUsedToday !== 'boolean' || typeof economy.nextDayApPenalty !== 'boolean'
    || typeof economy.recoveryLaborUsedToday !== 'boolean') return false;
  if (typeof player.currentCharacterId !== 'string' || !isObject(world.people) || !isObject(world.relationships)
    || !isObject(world.institutions) || !isObject(world.locations) || !isObject(world.appointments)
    || !isObject(world.events) || !isObject(world.knowledge) || !isObject(world.matters) || !isObject(value.records.entries)) return false;

  const people = world.people, institutions = world.institutions, locations = world.locations;
  const events = world.events, records = value.records.entries;
  for (const [id, p] of Object.entries(people)) {
    if (!isObject(p) || p.id !== id || typeof p.name !== 'string' || !p.name || typeof p.alive !== 'boolean'
      || !Array.isArray(p.affiliations) || !p.affiliations.every((x) => typeof x === 'string' && isObject(institutions[x]))
      || (p.currentLocationId !== undefined && (typeof p.currentLocationId !== 'string' || !isObject(locations[p.currentLocationId])))
      || !isPersonProfile(p)
      || (p.scribal !== undefined && !isScribal(p.scribal, new Set(Object.keys(institutions))))) return false;
  }
  for (const person of Object.values(people)) {
    if (!isObject(person)) return false;
    const lifeEvents = Array.isArray(person.lifeEvents) ? person.lifeEvents : [];
    const eventIds = new Set(lifeEvents.filter(isObject).map((event) => String(event.id)));
    for (const event of lifeEvents) {
      if (!isObject(event) || !Array.isArray(event.participants)
        || event.participants.some((participant) => !isObject(participant) || !isObject(people[String(participant.personId)]))) return false;
    }
    const familiarities = Array.isArray(person.familiarities) ? person.familiarities : [];
    for (const familiarity of familiarities) {
      if (!isObject(familiarity) || !Array.isArray(familiarity.basisLifeEventIds)
        || familiarity.basisLifeEventIds.some((eventId) => !eventIds.has(String(eventId)))) return false;
    }
  }
  for (const p of Object.values(people)) {
    if (isObject(p) && isObject(p.scribal) && Array.isArray(p.scribal.obligations)
      && p.scribal.obligations.some((item) => !isObject(item) || !isObject(people[String(item.creditorPersonId)])
        || !Number.isInteger(item.createdDay) || (item.createdDay as number) > (calendar.dayNumber as number))) return false;
  }
  const active = people[player.currentCharacterId];
  if (!isObject(active) || !isScribal(active.scribal, new Set(Object.keys(institutions)))
    || !isInitializedScribalState(active.scribal)) return false;
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

  const matters = world.matters as Record<string, unknown>;
  const matterIds = new Set(Object.keys(matters));
  for (const [id, matter] of Object.entries(matters)) {
    if (!isObject(matter) || matter.id !== id || typeof matter.institutionId !== 'string' || !isObject(institutions[matter.institutionId])
      || !['tutorial','roof_repair_verification','held_barley_inspection','north_bay_water_ingress','south_court_delivery_reconciliation','south_loading_awning_inspection','general'].includes(matter.kind as string)
      || typeof matter.summary !== 'string' || !matter.summary || !['active','resolved','developed'].includes(matter.status as string)
      || !Number.isInteger(matter.createdDay) || (matter.createdDay as number) < 1 || (matter.createdDay as number) > (calendar.dayNumber as number)
      || (matter.sourceRecordId !== undefined && !isObject(records[matter.sourceRecordId as string])) || (matter.locationId !== undefined && !isObject(locations[matter.locationId as string]))
      || (matter.sourceEventId !== undefined && !isObject(events[matter.sourceEventId as string]))
      || (matter.involvedPersonIds !== undefined && (!stringArray(matter.involvedPersonIds) || matter.involvedPersonIds.some((personId) => !isObject(people[personId]))))
      || (matter.provenance !== undefined && (!Array.isArray(matter.provenance) || matter.provenance.some((source) =>
        !isObject(source) || typeof source.id !== 'string' || !source.id
        || !['record_copy','instruction','agreement','observation','testimony','event','other'].includes(source.kind as string)
        || typeof source.description !== 'string' || !source.description
        || (source.sourceId !== undefined && typeof source.sourceId !== 'string')
        || (source.kind === 'event' && (!source.sourceId || !isObject(events[source.sourceId as string]))))))) return false;
    if (matter.scheduledDevelopment !== undefined && (!isObject(matter.scheduledDevelopment) || matter.scheduledDevelopment.kind !== 'rain' || !Number.isInteger(matter.scheduledDevelopment.dayNumber) || (matter.scheduledDevelopment.dayNumber as number) < (matter.createdDay as number))) return false;
  }
  for (const person of Object.values(people)) {
    if (!isObject(person)) continue;
    for (const item of Array.isArray(person.circumstances) ? person.circumstances : []) {
      if (!isObject(item) || (item.sinceDay as number) > (calendar.dayNumber as number)
        || (Array.isArray(item.relatedMatterIds) && item.relatedMatterIds.some((id) => !matterIds.has(String(id))))
        || (item.sourceEventId !== undefined && !isObject(events[String(item.sourceEventId)]))) return false;
    }
    for (const item of Array.isArray(person.objectives) ? person.objectives : []) {
      if (!isObject(item) || (item.createdDay as number) > (calendar.dayNumber as number)
        || (Array.isArray(item.relatedMatterIds) && item.relatedMatterIds.some((id) => !matterIds.has(String(id))))) return false;
    }
    for (const item of Array.isArray(person.commitments) ? person.commitments : []) {
      if (!isObject(item) || (item.createdDay as number) > (calendar.dayNumber as number)
        || (Array.isArray(item.relatedMatterIds) && item.relatedMatterIds.some((id) => !matterIds.has(String(id))))
        || (item.institutionId !== undefined && !isObject(institutions[String(item.institutionId)]))
        || !isObject(item.basis)) return false;
      const basis = item.basis;
      const validBasis = basis.kind === 'appointment' ? isObject(world.appointments) && isObject(world.appointments[String(basis.id)])
        : basis.kind === 'record' ? isObject(records[String(basis.id)])
        : basis.kind === 'event' ? isObject(events[String(basis.id)])
        : basis.kind === 'institutional_matter' ? matterIds.has(String(basis.id))
        : basis.kind === 'agreement' ? typeof basis.id === 'string' && !!basis.id : false;
      if (!validBasis) return false;
    }
  }
  for (const [institutionId, institution] of Object.entries(institutions)) {
    if (!isInstitution(institution, new Set(Object.keys(locations))) || institution.id !== institutionId) return false;
    for (const matterId of institution.activeMatters) {
      const matter = matters[matterId];
      if (!matterIds.has(matterId) || !isObject(matter) || matter.institutionId !== institutionId || matter.status !== 'active') return false;
    }
  }
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
      || (x.authorityCapabilities !== undefined && (!stringArray(x.authorityCapabilities) || x.authorityCapabilities.some((capability) => !['assess_institutional_reports','authorize_routine_storehouse_maintenance','verify_institutional_execution','resolve_institutional_matters'].includes(capability))))
      || !stringArray(x.responsibilities) || !finiteNonNegative(x.startDay) || !Number.isInteger(x.startDay) || x.startDay < 1
      || (x.endDay !== undefined && (!finiteNonNegative(x.endDay) || !Number.isInteger(x.endDay) || x.endDay < x.startDay))) return false;
  }
  for (const [id, x] of Object.entries(events)) if (!isObject(x) || !isEvent(x, calendar.dayNumber, people, institutions, locations) || x.id !== id
    || !!validateInstitutionalResponseEvent(value as unknown as GameState, x as unknown as import('./types').WorldEvent)) return false;

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
      || (offer.sourceRecordId !== undefined && (typeof offer.sourceRecordId !== 'string' || !isObject(records[offer.sourceRecordId])))
      || (offer.originMatterId !== undefined && (typeof offer.originMatterId !== 'string' || !isObject(matters[offer.originMatterId]))) || typeof offer.category !== 'string' || !offer.category || !isObject(offer.context)
      || typeof offer.context.what !== 'string' || !offer.context.what || typeof offer.context.purpose !== 'string' || !offer.context.purpose
      || !Array.isArray(offer.context.who) || !stringArray(offer.context.responsibility) || !stringArray(offer.context.provenance)
      || !isObject(offer.requiredSkills) || Object.entries(offer.requiredSkills).some(([skill, level]) => !CORE_SKILL_IDS.includes(skill as SkillId) || !Number.isInteger(level) || (level as number) < 1 || (level as number) > 10)
      || !['routine','demanding','critical'].includes(offer.difficulty as string) || (offer.activityId ? (!ASSIGNMENT_ACTIVITY_CATALOG[String(offer.activityId) as keyof typeof ASSIGNMENT_ACTIVITY_CATALOG] || ASSIGNMENT_ACTIVITY_CATALOG[String(offer.activityId) as keyof typeof ASSIGNMENT_ACTIVITY_CATALOG].participants.some((personId) => !isObject(people[personId])) || !Number.isInteger(offer.estimatedTotalAp) || (offer.estimatedTotalAp as number) < 1 || offer.apCost !== undefined || (['accepted','completed','cancelled'].includes(offer.status as string) ? !validateAssignmentActivityProgress(ASSIGNMENT_ACTIVITY_CATALOG[String(offer.activityId) as keyof typeof ASSIGNMENT_ACTIVITY_CATALOG], offer.activityProgress) : offer.activityProgress !== undefined)) : (!Number.isInteger(offer.apCost) || (offer.apCost as number) < 1 || (offer.apCost as number) > 6 || offer.estimatedTotalAp !== undefined || offer.activityProgress !== undefined))
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
  const generatorLedger = value.opportunities.assignmentGeneratorLedger;
  if (generatorLedger !== undefined && (!isObject(generatorLedger) || !Number.isInteger(generatorLedger.sequence) || (generatorLedger.sequence as number) < 0
    || !isObject(generatorLedger.lastPresentedDayByActivity) || Object.values(generatorLedger.lastPresentedDayByActivity).some((day) => !Number.isInteger(day) || !finiteNonNegative(day)))) return false;
  if (!Array.isArray(value.opportunities.recentActivity) || value.opportunities.recentActivity.length > 5
    || value.opportunities.recentActivity.some((entry) => !isObject(entry) || !finiteNonNegative(entry.dayNumber)
      || !['presented','accepted','declined','lapsed','completed','cancelled'].includes(entry.kind as string)
      || typeof entry.employerKey !== 'string' || typeof entry.category !== 'string' || typeof entry.assignmentId !== 'string'
      || (entry.lapsedDuringMandatoryWork !== undefined && typeof entry.lapsedDuringMandatoryWork !== 'boolean'))) return false;
  if (!Array.isArray(value.opportunities.challengeOutcomes) || value.opportunities.challengeOutcomes.some((outcome) => !isObject(outcome)
    || typeof outcome.challengeId !== 'string' || typeof outcome.title !== 'string' || typeof outcome.category !== 'string'
    || !Number.isInteger(outcome.resolvedDay) || (outcome.resolvedDay as number) < 1 || (outcome.resolvedDay as number) > (calendar.dayNumber as number)
    || typeof outcome.choiceId !== 'string' || typeof outcome.choiceLabel !== 'string' || typeof outcome.summary !== 'string'
    || (outcome.assigneePersonId !== undefined && (typeof outcome.assigneePersonId !== 'string' || !isObject(people[outcome.assigneePersonId]))))) return false;
  for (const [id, challenge] of Object.entries(value.opportunities.challenges)) {
    if (!isObject(challenge) || challenge.id !== id || !['offered','accepted','declined'].includes(challenge.status as string)
      || (challenge.status === 'accepted' && (typeof challenge.assigneePersonId !== 'string' || !isObject(people[challenge.assigneePersonId])))
      || (challenge.assigneePersonId !== undefined && (typeof challenge.assigneePersonId !== 'string' || !isObject(people[challenge.assigneePersonId]))) || typeof challenge.title !== 'string' || !challenge.title
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
    && isObject(value.opportunities.assignments) && isObject(value.opportunities.challenges)
    && (activeWorkId === null || typeof activeWorkId === 'string')
    && Object.entries(workProgressMap).every(([id, progress]) => !!id && isCompatibleWorkProgress(id, progress, workCatalog))
    && (activeWorkId === null || isCompatibleWorkProgress(activeWorkId, workProgressMap[activeWorkId], workCatalog))
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
function normalizeNorthBayWorldBaseline(parsed: unknown): unknown {
  if (!isObject(parsed) || !isObject(parsed.state) || !isObject(parsed.state.world)) return parsed;
  const state = parsed.state, world = state.world as Record<string, unknown>;
  const institutionId = 'institution-uruk-temple-storehouse';
  if (!isObject(world.people) || !isObject(world.institutions) || !isObject(world.locations) || !isObject(world.appointments)) return parsed;
  const people = { ...world.people };
  const locations = { ...world.locations };
  const institutions = { ...world.institutions };
  const appointments = Object.fromEntries(Object.entries(world.appointments).filter(([, appointment]) =>
    isObject(appointment) && typeof appointment.personId === 'string' && isObject(people[appointment.personId])
      && typeof appointment.institutionId === 'string' && isObject(institutions[appointment.institutionId])));
  if (!isObject(people[NORTH_BAY_PEOPLE.repairer])) people[NORTH_BAY_PEOPLE.repairer] = {
    id: NORTH_BAY_PEOPLE.repairer, name: 'Dudu', alive: true, affiliations: [institutionId], currentLocationId: NORTH_BAY_LOCATION_ID,
  };
  if (!isObject(people['person-aru'])) people['person-aru'] = {
    id: 'person-aru', name: 'Aru', alive: true, affiliations: [institutionId], currentLocationId: NORTH_BAY_LOCATION_ID,
    lifeStage: 'craft_practitioner',
    socialIdentity: { occupation: 'Storehouse maintenance worker', summary: 'A storehouse laborer available for routine maintenance assigned from the existing maintenance allocation.' },
  };
  if (!isObject(locations[NORTH_BAY_LOCATION_ID])) locations[NORTH_BAY_LOCATION_ID] = {
    id: NORTH_BAY_LOCATION_ID, name: 'Temple Storehouse, north storage bay',
  };
  if (!isObject(locations[SOUTH_COURT_LOCATION_ID])) locations[SOUTH_COURT_LOCATION_ID] = {
    id: SOUTH_COURT_LOCATION_ID, name: 'Temple Storehouse, south receiving court',
  };
  if (!isObject(locations[SOUTH_LOADING_LOCATION_ID])) locations[SOUTH_LOADING_LOCATION_ID] = {
    id: SOUTH_LOADING_LOCATION_ID, name: 'Temple Storehouse, south loading court',
  };
  const existingInstitution = institutions[institutionId];
  if (isObject(existingInstitution) && !existingInstitution.locationId) {
    institutions[institutionId] = { ...existingInstitution, locationId: NORTH_BAY_LOCATION_ID };
  }
  const offices = [
    { id: 'appointment-shuruppak-ilu-senior-scribe', personId: NORTH_BAY_PEOPLE.seniorScribe, title: 'Senior Scribe', authorityScope: ['Assign and review scribal work', 'Determine institutional follow-up from submitted records'], responsibilities: ['Review submitted accounts and reports', 'Determine whether further institutional action is warranted'], authorityCapabilities: ['assess_institutional_reports', 'verify_institutional_execution', 'resolve_institutional_matters'] },
    { id: 'appointment-ur-nanna-storehouse-steward', personId: NORTH_BAY_PEOPLE.steward, title: 'Storehouse Steward', authorityScope: ['Control ordinary storehouse access', 'Maintain custody and maintenance records', 'Authorize routine storehouse maintenance within the existing maintenance allocation'], responsibilities: ['Safeguard institutional stocks', 'Maintain custody and maintenance records', 'Commission ordinary maintenance using already allocated storehouse labor and materials'], authorityCapabilities: ['authorize_routine_storehouse_maintenance', 'verify_institutional_execution'] },
    { id: 'appointment-utu-mansum-receiving-official', personId: NORTH_BAY_PEOPLE.receivingOfficial, title: 'Receiving Official', authorityScope: ['Inspect and record incoming deliveries'], responsibilities: ['Record intake quantities and condition'] },
  ];
  for (const office of offices) if (isObject(people[office.personId]) && isObject(institutions[institutionId])) {
    const existing = appointments[office.id];
    if (!isObject(existing)) appointments[office.id] = { ...office, personId: office.personId, institutionId, startDay: 1 };
    else {
      appointments[office.id] = {
        ...existing,
        authorityScope: Array.isArray(existing.authorityScope)
          ? [...new Set([...existing.authorityScope, ...office.authorityScope])]
          : office.authorityScope,
        responsibilities: Array.isArray(existing.responsibilities)
          ? [...new Set([...existing.responsibilities, ...office.responsibilities])]
          : office.responsibilities,
        authorityCapabilities: [...new Set([
          ...(Array.isArray(existing.authorityCapabilities) ? existing.authorityCapabilities : []),
          ...(office.authorityCapabilities ?? []),
        ])],
      };
    }
  }
  return { ...parsed, state: { ...state, world: { ...world, people, locations, appointments, institutions } } };
}

function normalizeInstitutionalMatters(parsed: unknown): unknown {
 if (!isObject(parsed) || !isObject(parsed.state) || !isObject(parsed.state.world) || !isObject(parsed.state.world.institutions)) return parsed;
 const state = parsed.state, world = state.world as Record<string, unknown>, day = isObject(state.calendar) && Number.isInteger(state.calendar.dayNumber) ? state.calendar.dayNumber as number : 1;
 const existingMatters = world.matters;
 const matters: Record<string, unknown> = isObject(existingMatters) ? { ...existingMatters } : {};
 const existingInstitutions = world.institutions;
 if (!isObject(existingInstitutions)) return parsed;
 const institutions: Record<string, unknown> = { ...existingInstitutions };
 const records = isObject(state.records) && isObject(state.records.entries) ? Object.values(state.records.entries) : [];
 const roofRecord = records.find((r) => isObject(r) && typeof r.title === 'string' && r.title.includes('North-Bay Roof Inspection')) as any;
 for (const [institutionId, raw] of Object.entries(institutions)) { if (!isObject(raw) || !Array.isArray(raw.activeMatters)) continue; const active: string[] = [];
  for (const entry of raw.activeMatters) { if (typeof entry !== 'string') continue; if (matters[entry]) { active.push(entry); continue; }
   let id: string, kind: string; if (entry === 'The Storehouse Reckoning') { id = MATTER_IDS.tutorial; kind = 'tutorial'; }
   else if (entry.startsWith('Held-Barley Inspection recommended')) { id = MATTER_IDS.heldBarley; kind = 'held_barley_inspection'; }
   else if (entry === 'Verify north-bay roof repair' || entry.startsWith('Verify north-bay roof repair (') || entry.startsWith('Roof repair certified without sufficient supporting inspection') || entry.startsWith('Clear north-bay parapet runoff channel') || entry.startsWith('North-bay roof repair inspected')) { id = MATTER_IDS.roofRepair; kind = 'roof_repair_verification'; }
   else { id = `matter-legacy-${institutionId}-${entry.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}`; kind = 'general'; }
   const matter: any = { id, institutionId, kind, summary: entry, status: 'active', createdDay: day };
   if (kind === 'roof_repair_verification') { matter.locationId = NORTH_BAY_LOCATION_ID; if (roofRecord?.id) matter.sourceRecordId = roofRecord.id; matter.scheduledDevelopment = { kind: 'rain', dayNumber: day + 3 }; }
   if (kind === 'held_barley_inspection') { matter.locationId = NORTH_BAY_LOCATION_ID; if (roofRecord?.id) matter.sourceRecordId = roofRecord.id; }
   matters[id] = matters[id] ?? matter; if (!active.includes(id)) active.push(id);
  } institutions[institutionId] = { ...raw, activeMatters: active }; }
 return { ...parsed, state: { ...state, world: { ...world, institutions, matters } } };
}

function normalizeLegacyTutorialProgression(
  parsed: unknown,
  workCatalog: Readonly<Record<string, WorkDefinition<any>>>,
): unknown {
  if (!isObject(parsed) || !isObject(parsed.state)) return parsed;
  let state = parsed.state;

  // Existing v2 saves may retain the original Day 1 display string even after
  // dayNumber advanced. Era I currently has no finer calendar model.
  if (isObject(state.calendar) && state.calendar.eraId === 'era-1'
    && Number.isInteger(state.calendar.dayNumber) && (state.calendar.dayNumber as number) >= 1) {
    const dayNumber = state.calendar.dayNumber as number;
    state = { ...state, calendar: { ...state.calendar, displayDate: `Day ${dayNumber} · Uruk (c. 3200 BCE)` } };
  }

  const progressMap = isObject(state.works) && isObject(state.works.progress) ? state.works.progress : {};
  const completedTutorialIds = Object.entries(progressMap)
    .filter(([id, progress]) => workCatalog[id]?.kind === 'tutorial' && isObject(progress) && progress.status === 'completed')
    .map(([id]) => id);

  let historicalProgression = state.historicalProgression;
  if (isObject(historicalProgression) && Array.isArray(historicalProgression.completedWorks)) {
    const completedWorkIds: unknown[] = historicalProgression.completedWorks;
    const completedWorks = completedWorkIds.filter((id: unknown) => !completedTutorialIds.includes(String(id)));
    const legacyTutorialCredits = completedWorkIds.filter((id: unknown): id is string =>
      typeof id === 'string' && completedTutorialIds.includes(id));
    const legacyXpToRemove = legacyTutorialCredits.reduce<number>((total, id) =>
      total + (workCatalog[id]?.legacyHistoricalXpReward ?? 0), 0);
    const historicalXp = typeof historicalProgression.historicalXp === 'number' && Number.isFinite(historicalProgression.historicalXp)
      ? Math.max(0, historicalProgression.historicalXp - legacyXpToRemove)
      : historicalProgression.historicalXp;
    historicalProgression = { ...historicalProgression, historicalXp, completedWorks };
  }

  let world = state.world;
  if (completedTutorialIds.length && isObject(world) && isObject(world.institutions)) {
    const institutions = { ...world.institutions };
    for (const workId of completedTutorialIds) {
      for (const retirement of workCatalog[workId]?.legacyCompletionCleanup?.retireInstitutionMatters ?? []) {
        const institution = institutions[retirement.institutionId];
        if (isObject(institution) && Array.isArray(institution.activeMatters)) {
          institutions[retirement.institutionId] = {
            ...institution,
            activeMatters: institution.activeMatters.filter((matterId) => matterId !== retirement.matterId),
          };
        }
      }
    }
    world = { ...world, institutions };
  }

  return {
    ...parsed,
    state: {
      ...state,
      ...(historicalProgression ? { historicalProgression } : {}),
      ...(world ? { world } : {}),
    },
  };
}


function normalizeUnavailableWorkProgress(
  parsed: unknown,
  workCatalog: Readonly<Record<string, WorkDefinition<any>>>,
): unknown {
  if (!isObject(parsed) || !isObject(parsed.state) || !isObject(parsed.state.works)
    || !isObject(parsed.state.works.progress)) return parsed;
  const state = parsed.state;
  const works = state.works;
  const progress = { ...works.progress };
  let activeWorkId = typeof works.activeWorkId === 'string' ? works.activeWorkId : null;

  for (const [id, raw] of Object.entries(progress)) {
    if (!isObject(raw)) continue;
    const definition = workCatalog[id];
    const definitionValid = !!definition && definition.id === id
      && (definition.kind === 'work' || definition.kind === 'tutorial')
      && validateWorkDefinition(definition).length === 0;
    const compatible = definitionValid
      && typeof raw.definitionCompatibilityKey === 'string'
      && raw.definitionCompatibilityKey === definition!.progressCompatibilityKey
      && definition!.validateScenarioData(raw.scenarioData)
      && Array.isArray(raw.acquiredEvidence)
      && raw.acquiredEvidence.every((evidenceId) => definition!.evidence.some((item) => item.id === evidenceId))
      && Array.isArray(raw.completedActionIds)
      && raw.completedActionIds.every((actionId) => definition!.actions.some((item) => item.id === actionId));

    if (raw.status === 'suspended') {
      const priorStatus = raw.suspendedFromStatus;
      const canResume = compatible && ['active','completed','abandoned'].includes(String(priorStatus));
      if (canResume && (priorStatus !== 'active' || activeWorkId === null || activeWorkId === id)) {
        const { suspendedFromStatus: _suspendedFromStatus, ...rest } = raw;
        progress[id] = { ...rest, status: priorStatus };
        if (priorStatus === 'active' && activeWorkId === null) activeWorkId = id;
      } else if (activeWorkId === id) {
        activeWorkId = null;
      }
      continue;
    }

    if (!compatible) {
      progress[id] = { ...raw, status: 'suspended', suspendedFromStatus: raw.status };
      if (activeWorkId === id) activeWorkId = null;
    }
  }

  if (activeWorkId !== null) {
    const active = progress[activeWorkId];
    if (!isObject(active) || active.status !== 'active') activeWorkId = null;
  }
  return { ...parsed, state: { ...state, works: { ...works, activeWorkId, progress } } };
}

function normalizeLegacyStarterAssignments(parsed: unknown): unknown {
  if (!isObject(parsed) || !isObject(parsed.state)) return parsed;
  const state = parsed.state;
  if (!isObject(state.opportunities)) return parsed;
  const opportunities = state.opportunities;
  if (!isObject(opportunities.assignments)) return parsed;
  const assignments = { ...opportunities.assignments };
  const legacyIds = new Set([
    'assignment-storehouse-copy-check',
    'assignment-apprentice-tablet-preparation',
  ]);
  let changed = false;
  for (const id of legacyIds) {
    const offer = assignments[id];
    if (!isObject(offer) || !['offered', 'accepted'].includes(String(offer.status))) continue;
    // Retire old instant cards without inventing a player cancellation or undoing
    // any completed historical reward. Completed records remain untouched.
    assignments[id] = { ...offer, status: 'lapsed' };
    changed = true;
  }
  return changed
    ? { ...parsed, state: { ...state, opportunities: { ...opportunities, assignments } } }
    : parsed;
}

function normalizeHardshipState(parsed: unknown): unknown {
  if (!isObject(parsed) || !isObject(parsed.state)) return parsed;
  const state = parsed.state;
  const economy = isObject(state.actionEconomy)
    ? { ...state.actionEconomy, recoveryLaborUsedToday: state.actionEconomy.recoveryLaborUsedToday ?? false }
    : state.actionEconomy;
  if (!isObject(state.world) || !isObject(state.world.people)) return { ...parsed, state: { ...state, actionEconomy: economy } };
  const people = Object.fromEntries(Object.entries(state.world.people).map(([id, rawPerson]) => {
    if (!isObject(rawPerson) || !isObject(rawPerson.scribal)) return [id, rawPerson];
    const scribal = rawPerson.scribal;
    if (scribal.stage === 'identity') return [id, rawPerson];
    return [id, { ...rawPerson, scribal: {
      ...scribal,
      cumulativeShortageStress: scribal.cumulativeShortageStress ?? 0,
      obligations: scribal.obligations ?? [],
    } }];
  }));
  return { ...parsed, state: { ...state, actionEconomy: economy, world: { ...state.world, people } } };
}

export function restoreSave(raw: string | null, workCatalog: Readonly<Record<string, WorkDefinition<any>>> = {}): SaveEnvelope | null {
  if (!raw) return null;
  try {
    const parsed: unknown = normalizeHardshipState(normalizeLegacyStarterAssignments(normalizeUnavailableWorkProgress(normalizeLegacyTutorialProgression(normalizeInstitutionalMatters(normalizeNorthBayWorldBaseline(JSON.parse(raw))), workCatalog), workCatalog)));
    return isValidSaveEnvelope(parsed, workCatalog) ? parsed : null;
  } catch { return null; }
}
