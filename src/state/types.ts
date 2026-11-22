import type { AssignmentId, ChallengeId, AttributeId, AppointmentId, CareerPathId, ConditionId, EraId, EventId, InstitutionId, KnowledgeEntryId, LocationId, PersonId, RecordId, SkillId, TraitId, WorkId, SpecializationId } from './ids';

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
  /** Concise descriptions of currently active matters; no full matter simulator is implied. */
  activeMatters: string[];
}
export interface Location { id: LocationId; name: string; }
export interface WorldEvent { readonly id: EventId; readonly dayNumber: number; readonly summary: string; readonly personIds: readonly PersonId[]; readonly institutionIds: readonly InstitutionId[]; readonly locationId?: LocationId; }

export interface RecordSource { readonly id: string; readonly kind: 'person' | 'institution' | 'event' | 'material' | 'other'; readonly sourceId?: string; readonly description: string; }
export interface RecordAssertion { readonly id: string; readonly text: string; readonly classification: 'observed' | 'reported' | 'inferred' | 'disputed'; readonly sourceIds: readonly string[]; }
export interface RecordAmendment {
  readonly id: string; readonly dayNumber: number; readonly authorPersonId: PersonId; readonly reason: string;
  readonly sourcesAdded: readonly RecordSource[]; readonly assertionsAdded: readonly RecordAssertion[];
  readonly uncertaintyLimitsAdded: readonly string[]; readonly note: string;
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


export type OpportunityDeliveryChannel =
  | { kind: 'baseline_reach'; explanation: string }
  | { kind: 'relationship'; personId: PersonId; explanation: string }
  | { kind: 'specialization'; specializationId: SpecializationId; explanation: string }
  | { kind: 'appointment'; appointmentId: AppointmentId; explanation: string }
  | { kind: 'reputation'; dimension: 'competence' | 'reliability' | 'discretion' | 'judgment'; explanation: string };

export interface AssignmentContext {
  what: string; who: string[]; quantity?: string; when?: string; where?: string;
  from?: string; to?: string; purpose: string; responsibility: string[];
  authority?: string; provenance: string[];
}
export interface OpportunityEmployer { kind: 'person' | 'institution'; id: PersonId | InstitutionId; }
export interface AssignmentActivityAggregate {
  key: string; employer: OpportunityEmployer; category: string; commodity?: string;
  presented: number; accepted: number; declined: number; nonWorkLapsed: number; completed: number;
}
export type OpportunityActivityKind = 'presented' | 'accepted' | 'declined' | 'lapsed' | 'completed' | 'cancelled';
export interface OpportunityActivity {
  dayNumber: number; kind: OpportunityActivityKind; employerKey: string; category: string; commodity?: string;
  assignmentId: AssignmentId; lapsedDuringMandatoryWork?: boolean;
}
export type AuthoredDatePolicy = { kind: 'fixed'; dayNumber: number } | { kind: 'resolution_day' };
export interface OpportunityDatePolicies {
  event?: AuthoredDatePolicy;
  record?: AuthoredDatePolicy;
  knowledge?: Record<string, AuthoredDatePolicy>;
}
export interface OpportunityConsequences {
  moneyDelta?: number; provisionsDelta?: number; careerXp?: number;
  /** Separate dates for event occurrence, record creation, and knowledge acquisition. */
  datePolicies?: OpportunityDatePolicies;
  relationships?: Array<{ fromId: PersonId; toId: PersonId; changes: Partial<RelationshipDimensions>; summary: string }>;
  institutionalStanding?: Array<{ institutionId: InstitutionId; delta: number }>;
  event?: WorldEvent; record?: RecordEntry; knowledge?: KnowledgeEntry[];
}
export interface AssignmentOffer {
  id: AssignmentId; title: string; description: string; employer: OpportunityEmployer;
  category: string; commodity?: string; context: AssignmentContext;
  requiredSkills: Partial<Record<SkillId, number>>; difficulty: 'routine' | 'demanding' | 'critical';
  apCost: number; compensation: { money: number; provisions: number }; careerXpReward: number;
  deliveryChannels: OpportunityDeliveryChannel[];
  offeredDay: number; expiresDay: number; status: 'offered' | 'accepted' | 'declined' | 'lapsed' | 'completed' | 'cancelled';
  lapsedDuringMandatoryWork?: boolean; cancellationConsequences?: OpportunityConsequences; completionConsequences?: OpportunityConsequences;
}
export interface ChallengeChoice {
  id: string; label: string; description: string; consequences: OpportunityConsequences;
}
export interface ChallengeInstance {
  id: ChallengeId; title: string; description: string; category: string; commodity?: string;
  employer?: OpportunityEmployer; context: AssignmentContext; deliveryChannels: OpportunityDeliveryChannel[];
  presentedDay: number; apCost: number; choices: ChallengeChoice[];
}
export interface ChallengeOutcome {
  challengeId: ChallengeId; title: string; category: string; resolvedDay: number;
  choiceId: string; choiceLabel: string; summary: string;
}
export interface ChallengeTriggerRule {
  id: string; category?: string; minPresented?: number; minAccepted?: number; minDeclined?: number;
  minNonWorkLapsed?: number; minCompleted?: number; recentKinds?: OpportunityActivityKind[];
  recentWindow?: number;
}

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
  opportunities: { assignments: Record<AssignmentId, AssignmentOffer>; challenges: Record<ChallengeId, ChallengeInstance>; challengeOutcomes: ChallengeOutcome[]; assignmentAggregates: Record<string, AssignmentActivityAggregate>; recentActivity: OpportunityActivity[] };
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
  | { type: 'GRANT_KNOWLEDGE'; knowledge: KnowledgeEntry }
  | { type: 'PRESENT_ASSIGNMENT'; offer: Omit<AssignmentOffer, 'offeredDay' | 'expiresDay' | 'status' | 'lapsedDuringMandatoryWork'> & { expiresDay?: number } }
  | { type: 'ACCEPT_ASSIGNMENT'; assignmentId: AssignmentId }
  | { type: 'DECLINE_ASSIGNMENT'; assignmentId: AssignmentId }
  | { type: 'CANCEL_ASSIGNMENT'; assignmentId: AssignmentId }
  | { type: 'COMPLETE_ASSIGNMENT'; assignmentId: AssignmentId }
  | { type: 'PRESENT_CHALLENGE'; challenge: ChallengeInstance }
  | { type: 'RESOLVE_CHALLENGE'; challengeId: ChallengeId; choiceId: string };
export interface ActionFeedback { kind: 'success' | 'error' | 'info'; code: string; message: string; }
export interface TransitionResult { state: GameState; feedback: ActionFeedback | null; }
