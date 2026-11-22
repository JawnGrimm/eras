import type { AttributeId, AppointmentId, CareerPathId, ConditionId, EraId, EventId, InstitutionId, KnowledgeEntryId, LocationId, MatterId, PersonId, RecordId, SkillId, TraitId, WorkId, SpecializationId } from './ids';

export interface WalletState { money: number; provisions: number; shortageWorkdays: number; }
export interface SkillState { level: number; skillXp: number; }
export type SpecializationLevel = 'practitioner' | 'specialist' | 'master';
export interface SpecializationState { id: SpecializationId; level: SpecializationLevel; specializationXp: number; isPrimary: boolean; }
export interface PersonalityTraitState { id: TraitId; intensity: 1 | 2 | 3; origin: 'starting' | 'emergent'; }
export type ConditionModifierTarget = { kind: 'attribute'; id: AttributeId } | { kind: 'skill'; id: SkillId };
export interface ConditionModifier { target: ConditionModifierTarget; value: number; actionTags: string[]; }
export interface CharacterConditionState { id: ConditionId; severity: 1 | 2 | 3; modifiers: ConditionModifier[]; remainingWorkdays?: number; }

export interface ScribalCharacterState {
  careerPath?: CareerPathId;
  careerXp: number;
  wallet: WalletState;
  skills: Partial<Record<SkillId, SkillState>>;
  attributes: Partial<Record<AttributeId, number>>;
  specializations: SpecializationState[];
  traits: PersonalityTraitState[];
  conditions: CharacterConditionState[];
  equipment: string[];
  stress: number;
  professionalReputation: { competence: number; reliability: number; discretion: number; judgment: number };
  /** Standing within particular institutions; independent of personal relationships and professional reputation. */
  institutionalStanding: Partial<Record<InstitutionId, number>>;
}

export interface RelationshipDimensions { trust: number; respect: number; affection: number; resentment: number; rivalry: number; familiarity: number; }
export interface RelationshipHistoryEntry { id: string; dayNumber: number; summary: string; eventId?: EventId; }
/** relationships[fromId][toId] is directional; the reverse perspective is stored separately. */
export interface PersonRelationship { dimensions: RelationshipDimensions; history: RelationshipHistoryEntry[]; }
export interface Person {
  id: PersonId; name: string; ageYears?: number; alive: boolean; currentLocationId?: LocationId;
  affiliations: InstitutionId[];
  /** Present for people with an established scribal/professional capability sheet. */
  scribal?: ScribalCharacterState;
}
export interface Appointment {
  id: AppointmentId; personId: PersonId; institutionId: InstitutionId;
  /** Historically situated office or designation, not a universal rank title. */
  title: string;
  /** The decisions or actions this office-holder is authorized to make. */
  authorityScope: string[];
  responsibilities: string[];
  startDay: number; endDay?: number;
}
export interface Institution {
  id: InstitutionId; name: string; locationId?: LocationId;
  responsibilities: string[]; authority: string[];
  /** General institutional standing in its historical/social context. */
  standing: number;
  activeMatterIds: MatterId[];
}
export interface Location { id: LocationId; name: string; }
export interface WorldEvent { readonly id: EventId; readonly dayNumber: number; readonly summary: string; readonly personIds: readonly PersonId[]; readonly institutionIds: readonly InstitutionId[]; readonly locationId?: LocationId; }

export interface RecordSource { id: string; kind: 'person' | 'institution' | 'event' | 'material' | 'other'; sourceId?: string; description: string; }
export interface RecordAssertion { id: string; text: string; classification: 'observed' | 'reported' | 'inferred' | 'disputed'; sourceIds: string[]; }
export interface RecordAmendment {
  id: string; dayNumber: number; authorPersonId: PersonId; reason: string;
  sourcesAdded: RecordSource[]; assertionsAdded: RecordAssertion[];
  uncertaintyLimitsAdded: string[]; note: string;
}
/** Original content is retained; corrections and qualifications are appended as amendments. */
export interface RecordEntry {
  readonly id: RecordId; readonly createdDay: number; readonly authorPersonId: PersonId; readonly institutionId?: InstitutionId;
  readonly title: string; readonly sources: readonly RecordSource[]; readonly assertions: readonly RecordAssertion[];
  readonly uncertaintyLimits: readonly string[]; readonly amendments: readonly RecordAmendment[];
}
export interface KnowledgeEntry {
  id: KnowledgeEntryId;
  holder: { kind: 'person'; id: PersonId } | { kind: 'institution'; id: InstitutionId };
  subject: { kind: 'event'; id: EventId } | { kind: 'record'; id: RecordId };
  basis: 'direct-involvement' | 'testimony' | 'received-copy' | 'consulted-record' | 'public-disclosure' | 'other';
  learnedDay: number; sourcePersonId?: PersonId;
}

export interface CalendarState { eraId: EraId; dayNumber: number; displayDate: string; }
export interface ActionEconomyState { dailyApAllocation: 5 | 6; apRemaining: number; overtimeUsedToday: boolean; nextDayApPenalty: boolean; }
export interface DurableNotice { id: string; dayNumber: number; category: 'settlement' | 'opportunity' | 'relationship' | 'work' | 'world'; message: string; read: boolean; }

export interface GameState {
  calendar: CalendarState; actionEconomy: ActionEconomyState; player: { currentCharacterId: PersonId };
  world: {
    people: Record<PersonId, Person>;
    /** Ordered pair: from-person key, then to-person key. Never mirror automatically. */
    relationships: Record<PersonId, Partial<Record<PersonId, PersonRelationship>>>;
    institutions: Record<InstitutionId, Institution>;
    locations: Record<LocationId, Location>;
    appointments: Record<AppointmentId, Appointment>;
    events: Record<EventId, WorldEvent>;
    knowledge: Record<KnowledgeEntryId, KnowledgeEntry>;
  };
  historicalProgression: { historicalXp: number; completedWorks: WorkId[] };
  opportunities: { assignments: Record<string, unknown>; challenges: Record<string, unknown> };
  works: { activeWorkId: WorkId | null; progress: Record<WorkId, unknown> };
  records: {
    entries: Record<RecordId, RecordEntry>;
    /** Legacy prototype outcomes retained until the later persistence/content port. */
    permanentOutcomes: Array<{ id: string; dayNumber: number; summary: string; personIds: PersonId[] }>;
  };
  journal: { notices: DurableNotice[] };
}
export interface SaveEnvelope { schemaVersion: 2; gameVersion: string; revision: number; savedAt: string; state: GameState; }
export interface SkillAdvancementRule { requiredSkillXp: number; careerXpCost: number; }
export type TargetSkillLevel = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export interface CareerProgressionPolicy { skillAdvancementByTargetLevel: Partial<Record<TargetSkillLevel, SkillAdvancementRule>>; }

export type GameAction =
  | { type: 'SPEND_AP'; amount: number; reason: string }
  | { type: 'ACTIVATE_OVERTIME' }
  | { type: 'END_DAY'; expectedDayNumber: number }
  | { type: 'MARK_NOTICE_READ'; noticeId: string }
  | { type: 'AWARD_SKILL_XP'; skillId: SkillId; amount: number; reason: string }
  | { type: 'AWARD_CAREER_XP'; amount: number; reason: string }
  | { type: 'PURCHASE_SKILL_LEVEL'; skillId: SkillId }
  | { type: 'SET_PRIMARY_SPECIALIZATION'; specializationId: SpecializationId }
  | { type: 'SET_RELATIONSHIP'; fromId: PersonId; toId: PersonId; relationship: PersonRelationship }
  | { type: 'SET_INSTITUTIONAL_STANDING'; personId: PersonId; institutionId: InstitutionId; value: number }
  | { type: 'CREATE_INSTITUTION'; institution: Institution }
  | { type: 'CREATE_APPOINTMENT'; appointment: Appointment }
  | { type: 'END_APPOINTMENT'; appointmentId: AppointmentId }
  | { type: 'CREATE_EVENT'; event: WorldEvent }
  | { type: 'CREATE_RECORD'; record: RecordEntry }
  | { type: 'AMEND_RECORD'; recordId: RecordId; amendment: RecordAmendment }
  | { type: 'GRANT_KNOWLEDGE'; knowledge: KnowledgeEntry };
export interface ActionFeedback { kind: 'success' | 'error' | 'info'; code: string; message: string; }
export interface TransitionResult { state: GameState; feedback: ActionFeedback | null; }
