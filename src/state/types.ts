import type { EvidenceId, AssignmentId, ChallengeId, AttributeId, AppointmentId, CareerPathId, ConditionId, EraId, EventId, InstitutionId, MatterId, KnowledgeEntryId, LocationId, PersonId, RecordId, SkillId, TraitId, WorkId, SpecializationId } from './ids';
import type { RelationshipFamiliarityEpisode } from './relationshipFamiliarity';

export interface WalletState { money: number; provisions: number; shortageWorkdays: number; }
export interface SkillState { level: number; skillXp: number; }
export type SpecializationLevel = 'practitioner' | 'specialist' | 'master';
export interface SpecializationState { id: SpecializationId; level: SpecializationLevel; specializationXp: number; isPrimary: boolean; }
export interface PersonalityTraitState { id: TraitId; intensity: 1 | 2 | 3; origin: 'starting' | 'emergent'; }
export type ConditionModifierTarget = { kind: 'attribute'; id: AttributeId } | { kind: 'skill'; id: SkillId };
export interface ConditionModifier { target: ConditionModifierTarget; value: number; actionTags: string[]; }
export interface CharacterConditionState { id: ConditionId; severity: 1 | 2 | 3; modifiers: ConditionModifier[]; remainingWorkdays?: number; }

export interface CharacterObligation {
  id: string;
  creditorPersonId: PersonId;
  createdDay: number;
  kind: 'repayment_or_service';
  description: string;
  status: 'outstanding';
}

export interface InitializedScribalCharacterState {
  /** Explicit on newly initialized records; absent only on legacy schema-v2 records. */
  stage?: 'initialized';
  /** Lifetime shortage-attributed Stress; never resets when provisions are consumed. */
  cumulativeShortageStress: number;
  obligations: CharacterObligation[];
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

/** Identity and career capability are separate stages; identity-only records are not playable. */
export interface ScribalIdentityState {
  stage: 'identity';
  careerPath: CareerPathId;
}
export type PersonScribalState = InitializedScribalCharacterState | ScribalIdentityState;
/** Backward-compatible name for APIs that specifically require initialized career capability. */
export type ScribalCharacterState = InitializedScribalCharacterState;

export interface RelationshipDimensions { trust: number; respect: number; affection: number; resentment: number; rivalry: number; }
export interface RelationshipHistoryEntry { id: string; dayNumber: number; summary: string; eventId?: EventId; }
/** relationships[fromId][toId] is directional; the reverse perspective is stored separately. */
export interface PersonRelationship { dimensions: RelationshipDimensions; history: RelationshipHistoryEntry[]; }


export type LifeEventKind = 'origin' | 'early_responsibility' | 'formative_experience' | 'professional_entry' | 'first_instruction';
export type LifeEventStage = 'early_life' | 'youth' | 'transition_to_scribal_work';
export type HistoricalConfidence = 'attested' | 'inferred' | 'reconstruction';
export interface PersonLifeEventParticipant { personId: PersonId; role: string; }
export interface PersonLifeEvent {
  id: string;
  kind: LifeEventKind;
  contentId: string;
  /** Frozen source-language fallback; authored content is the normal display source. */
  summary: string;
  chronology: { stage: LifeEventStage; order: number };
  participants: PersonLifeEventParticipant[];
  historicalConfidence: HistoricalConfidence;
}
export type FamiliarityExposure = 'observed' | 'assisted' | 'practiced_under_instruction';
export interface PersonFamiliarity {
  id: string;
  domainId: string;
  scopeId: string;
  exposure: FamiliarityExposure;
  basisLifeEventIds: string[];
}
export interface CharacterCreationRecord {
  contentVersion: string;
  originId: string;
  responsibilityId: string;
  formativeExperienceId: string;
  entryRouteId: string;
  instructionId: string;
}

export type LifeStage = 'apprentice' | 'junior_scribe' | 'established_scribe' | 'active_official' | 'senior_scribe' | 'craft_practitioner' | 'elder';
export interface PersonSocialIdentity { summary: string; occupation?: string; }
export interface PersonCircumstance {
  id: string;
  kind: 'work' | 'resource' | 'dispute' | 'instruction' | 'institutional_duty' | 'other';
  summary: string;
  sinceDay: number;
  status: 'active' | 'resolved';
  visibility: 'public' | 'private';
  relatedMatterIds?: MatterId[];
  sourceEventId?: EventId;
}
export interface PersonObjective {
  id: string;
  horizon: 'immediate' | 'long_term';
  summary: string;
  motivation: string;
  createdDay: number;
  status: 'active' | 'fulfilled' | 'abandoned';
  visibility: 'public' | 'private';
  relatedMatterIds?: MatterId[];
}
export type CommitmentBasis =
  | { kind: 'appointment'; id: AppointmentId }
  | { kind: 'record'; id: RecordId }
  | { kind: 'event'; id: EventId }
  | { kind: 'institutional_matter'; id: MatterId }
  | { kind: 'agreement'; id: string };
export interface PersonCommitment {
  id: string;
  kind: 'office_duty' | 'agreement' | 'personal_undertaking' | 'allocation';
  summary: string;
  basis: CommitmentBasis;
  createdDay: number;
  dueDay?: number;
  status: 'active' | 'fulfilled' | 'disputed' | 'released';
  visibility: 'public' | 'private';
  institutionId?: InstitutionId;
  relatedMatterIds?: MatterId[];
}
export interface Person {
  id: PersonId; name: string; ageYears?: number; alive: boolean; currentLocationId?: LocationId;
  affiliations: InstitutionId[];
  /** Typed context is optional for legacy saves and populated only where authored evidence supports it. */
  lifeStage?: LifeStage;
  socialIdentity?: PersonSocialIdentity;
  circumstances?: PersonCircumstance[];
  objectives?: PersonObjective[];
  commitments?: PersonCommitment[];
  /** Present only for people whose player-character creation choices were persisted. */
  characterCreation?: CharacterCreationRecord;
  /** Durable personal history; independent of player character creation. */
  lifeEvents?: PersonLifeEvent[];
  /** Qualitative, provenance-backed exposure; not a skill or qualification. */
  familiarities?: PersonFamiliarity[];
  /** Present for people with an established scribal/professional capability sheet. */
  scribal?: PersonScribalState;
}
export type InstitutionalAuthorityCapability = 'assess_institutional_reports' | 'authorize_routine_storehouse_maintenance' | 'verify_institutional_execution' | 'resolve_institutional_matters';
export type InstitutionalResponseStage = 'assessment' | 'authorization' | 'commitment' | 'execution' | 'verification' | 'resolution';
export type InstitutionalVerificationOutcome = 'accepted' | 'rejected' | 'inconclusive';
export type InstitutionalResolutionDisposition = 'accepted_verification' | 'escalated_override';
export interface InstitutionalResponse {
  matterId: MatterId;
  stage: InstitutionalResponseStage;
  actorPersonId: PersonId;
  appointmentId: AppointmentId;
  recordId: RecordId;
  decision: 'accepted_for_action' | 'request_more_evidence' | 'referred' | 'declined' | 'authorized' | 'authorization_declined' | 'assigned' | 'executed' | 'verified' | 'verification_rejected' | 'verification_inconclusive' | 'resolved' | 'escalated_override';
  precedingEventId?: EventId;
  authorizedAction?: 'routine_storehouse_maintenance';
  scope?: string;
  assigneePersonId?: PersonId;
  commitmentId?: string;
  execution?: { workPerformed: string; laborBasis: string; materialsBasis: string; result: string };
  verification?: { executionEventId: EventId; outcome: InstitutionalVerificationOutcome; rationale: string };
  resolution?: { verificationEventId: EventId; disposition: InstitutionalResolutionDisposition; rationale: string };
}
export interface Appointment {
  id: AppointmentId; personId: PersonId; institutionId: InstitutionId;
  /** Historically situated office or designation, not a universal rank title. */
  title: string;
  /** The decisions or actions this office-holder is authorized to make. */
  authorityScope: string[];
  responsibilities: string[];
  /** Machine-checkable permissions; descriptive authorityScope remains the human-readable office record. */
  authorityCapabilities?: InstitutionalAuthorityCapability[];
  startDay: number; endDay?: number;
}
export type InstitutionalMatterKind = 'tutorial' | 'roof_repair_verification' | 'held_barley_inspection' | 'north_bay_water_ingress'
  | 'south_court_delivery_reconciliation' | 'south_loading_awning_inspection'
  | 'era1_com_01_consignment' | 'era1_com_02_brewing_account' | 'era1_civ_01_field_measurement'
  | 'era1_civ_02_labor_disbursement' | 'era1_rel_01_inana_offering'
  | 'era1_com_f01_material_description' | 'era1_com_f02_two_claims' | 'era1_com_f03_partial_return' | 'era1_com_f04_custody_chain'
  | 'era1_mar_f01_door_opened' | 'era1_mar_f02_party_returns_short' | 'era1_mar_f03_late_turned_aside' | 'era1_mar_f04_valued_object_trail' | 'era1_eanna_provisioning_undertaking' | 'era1_eanna_allocation_follow_up' | 'tier_b_recurring_occurrence' | 'general';
export interface MatterProvenance {
  id: string;
  kind: 'record_copy' | 'instruction' | 'agreement' | 'observation' | 'testimony' | 'event' | 'other';
  description: string;
  sourceId?: string;
}
export interface TierBRecurringOccurrence {
  domain: 'grain_delivery' | 'textile_receipt' | 'vessel_count' | 'container_check' | 'grain_account' | 'fish_entry' | 'dairy_entry' | 'field_measurement';
  commodity: string; unit: string; counterpartyPersonId: PersonId; counterpartyName: string;
  quantitySummary: string; sourceSummary: string; outcomeShape: 'reconciled' | 'discrepancy';
}
export interface InstitutionalMatter {
  id: MatterId; institutionId: InstitutionId; kind: InstitutionalMatterKind; summary: string;
  /** Optional, deterministic Tier B instance data; absent on legacy and bespoke matters. */
  tierBRecurring?: TierBRecurringOccurrence;
  status: 'active' | 'resolved' | 'developed'; createdDay: number; sourceRecordId?: RecordId;
  locationId?: LocationId; scheduledDevelopment?: { kind: 'rain'; dayNumber: number }; developedDay?: number; sourceEventId?: EventId;
  /** Participants and provenance are optional for compatibility with earlier schema-v2 matter records. */
  involvedPersonIds?: PersonId[];
  provenance?: MatterProvenance[];
}
export interface Institution {
  id: InstitutionId; name: string; locationId?: LocationId; responsibilities: string[]; authority: string[];
  standing: number; activeMatters: MatterId[];
}
export interface Location { id: LocationId; name: string; }
export interface WorldEvent { readonly id: EventId; readonly dayNumber: number; readonly summary: string; readonly personIds: readonly PersonId[]; readonly institutionIds: readonly InstitutionId[]; readonly locationId?: LocationId; readonly institutionalResponse?: InstitutionalResponse; }

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
export type KnowledgeAssertionKind = 'fact' | 'observation' | 'remembered_tendency';
export interface KnowledgeAssertion {
  kind: KnowledgeAssertionKind;
  text: string;
  aboutPersonId?: PersonId;
  situationKey?: string;
  recordAssertion?: { recordId: RecordId; assertionId: string };
}
export interface KnowledgeAssessment {
  status: 'verified' | 'contradicted' | 'obsolete';
  dayNumber: number;
  source: { kind: 'event'; id: EventId } | { kind: 'record'; id: RecordId };
  rationale: string;
}
export interface KnowledgeEntryBase {
  id: KnowledgeEntryId;
  holder: { kind: 'person'; id: PersonId } | { kind: 'institution'; id: InstitutionId };
  subject: { kind: 'event'; id: EventId } | { kind: 'record'; id: RecordId };
  basis: 'direct-involvement' | 'testimony' | 'received-copy' | 'consulted-record' | 'public-disclosure' | 'other';
  learnedDay: number;
  sourcePersonId?: PersonId;
}
/** Old source-access history is preserved without an invented assertion. */
export type LegacyKnowledgeEntry = KnowledgeEntryBase & {
  legacy: true;
  assertion?: never;
  assessments?: never;
};
/** New Knowledge always carries the exact remembered assertion and append-only assessments. */
export type CurrentKnowledgeEntry = KnowledgeEntryBase & {
  legacy?: false;
  assertion: KnowledgeAssertion;
  assessments: KnowledgeAssessment[];
};
export type KnowledgeEntry = LegacyKnowledgeEntry | CurrentKnowledgeEntry;

export interface CalendarState { eraId: EraId; dayNumber: number; displayDate: string; }
export interface ActionEconomyState { dailyApAllocation: 5 | 6; apRemaining: number; overtimeUsedToday: boolean; nextDayApPenalty: boolean; recoveryLaborUsedToday: boolean; }
export type DayClosePhase = 'workday_open' | 'interlude_open';
export interface PendingSettlementCredit {
  id: string;
  source: { kind: 'assignment' | 'work'; id: string };
  earnedDay: number;
  money: number;
  provisions: number;
  status: 'pending' | 'credited';
  creditedBySettlementId?: string;
}
export interface DayCloseState {
  phase: DayClosePhase;
  pendingSettlementId: string | null;
  lastFinalizedSettlementId: string | null;
  pendingCredits: PendingSettlementCredit[];
  /** Present only while an Interlude is open; optional for existing schema-v3 saves. */
  preview?: DaySettlement | null;
}
export type OpportunityOccurrenceLifecycle = 'offered' | 'accepted' | 'declined' | 'lapsed' | 'cancelled' | 'completed';
export interface OpportunityOccurrenceLedgerEntry {
  scenarioId: string;
  occurrenceKey: string;
  lifecycle: OpportunityOccurrenceLifecycle;
  matterId?: MatterId;
  primarySourceFact?: { kind: 'event'; id: EventId } | { kind: 'record'; id: RecordId };
  requiredSourceFactIds: string[];
  deliveryChannels?: OpportunityDeliveryChannel[];
  presentedDay?: number;
  assigneePersonId?: PersonId;
  legacy?: true;
}
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
export type AssignmentAssessmentCategory = 'Thorough' | 'Defensible' | 'Incomplete' | 'Overreached';
export interface ClosingReceiptDeltas {
  currency?: number; provisions?: number; careerXp?: number; judgment: number;
  institutionalStanding?: number; trust?: number; respect?: number;
}
export interface ClosingReceiptPayload {
  dayNumber: number;
  title: string;
  disposition: string;
  assessment: AssignmentAssessmentCategory;
  rationale: string;
  receiverName?: string;
  institutionName?: string;
  reaction: string;
  deltas: ClosingReceiptDeltas;
  compensationTiming?: string;
}
export interface AssignmentActivityDraft {
  finding: string;
  responsibilityClaim: string;
  citedDiscoveryIds: string[];
  /** Legacy free-text limitations are preserved for display and record provenance; never graded. */
  limitations: string[];
  recommendations: string[];
  /** New structured selections; absence is preserved for legacy activity progress. */
  selectedLimitationIds?: string[];
  limitationNotes?: string;
}
export interface AssignmentActivityProgress {
  completedActionIds: string[];
  discoveryIds: string[];
  consultedPersonIds: PersonId[];
  draft: AssignmentActivityDraft;
}
export interface AssignmentOffer {
  id: AssignmentId; title: string; description: string; employer: OpportunityEmployer; sourceRecordId?: RecordId; sourceEventId?: EventId; occurrenceKey?: string; originMatterId?: MatterId;
  category: string; commodity?: string; context: AssignmentContext;
  requiredSkills: Partial<Record<SkillId, number>>; difficulty: 'routine' | 'demanding' | 'critical';
  /** Single-action completion cost; omitted for interactive Assignments. */
  apCost?: number; estimatedTotalAp?: number; activityId?: string; activityProgress?: AssignmentActivityProgress;
  compensation: { money: number; provisions: number }; careerXpReward: number;
  deliveryChannels: OpportunityDeliveryChannel[];
  offeredDay: number; expiresDay: number; status: 'offered' | 'accepted' | 'declined' | 'lapsed' | 'completed' | 'cancelled';
  /** Character who accepted this commitment; legacy accepted offers without an owner belong to the active character. */
  assigneePersonId?: PersonId;
  lapsedDuringMandatoryWork?: boolean; cancellationConsequences?: OpportunityConsequences; completionConsequences?: OpportunityConsequences;
  compensationDisclosure?: string;
  closingReceipt?: ClosingReceiptPayload;
  receiptAcknowledged?: boolean;
}
export interface ChallengeChoice {
  id: string; label: string; description: string; consequences: OpportunityConsequences;
  /** Authored evaluation metadata for the shared Closing Receipt; legacy choices may omit it. */
  evaluation?: {
    assessment: AssignmentAssessmentCategory;
    rationale: string;
    receiverPersonId?: PersonId;
    institutionId?: InstitutionId;
    reaction: string;
  };
}
export interface ChallengeInstance {
  id: ChallengeId; title: string; description: string; category: string; commodity?: string;
  employer?: OpportunityEmployer; context: AssignmentContext; deliveryChannels: OpportunityDeliveryChannel[];
  presentedDay: number; apCost: number; choices: ChallengeChoice[];
  status: 'offered' | 'accepted' | 'declined';
  /** Character who accepted this optional commitment. */
  assigneePersonId?: PersonId;
}
export interface ChallengeOutcome {
  challengeId: ChallengeId; title: string; category: string; resolvedDay: number;
  choiceId: string; choiceLabel: string; summary: string; assigneePersonId?: PersonId;
  closingReceipt?: ClosingReceiptPayload;
  receiptAcknowledged?: boolean;
}
export interface ChallengeTriggerRule {
  id: string; category?: string; minPresented?: number; minAccepted?: number; minDeclined?: number;
  minNonWorkLapsed?: number; minCompleted?: number; recentKinds?: OpportunityActivityKind[];
  recentWindow?: number;
}


export type WorkStatus = 'active' | 'completed' | 'abandoned' | 'suspended';
export type WorkAssessmentDimension = 'accuracy' | 'completeness' | 'responsible_interpretation' | 'procedure' | 'traceability' | 'responsibility';
export interface WorkAssessmentDimensionResult {
  dimension: WorkAssessmentDimension;
  status: 'meets' | 'partial' | 'fails';
  summary: string;
}
export interface WorkProgress {
  status: WorkStatus;
  /** Original operational status retained while unavailable content is suspended. */
  suspendedFromStatus?: 'active' | 'completed' | 'abandoned';
  /** Must match the authored definition before this progress can resume or advance. */
  definitionCompatibilityKey?: string;
  acquiredEvidence: EvidenceId[];
  examinedEvidence: EvidenceId[];
  workApSpentToday: number;
  rewardGranted: boolean;
  completedActionIds: string[];
  provisionContract?: { provisionsPerQualifiedWorkday: number; minimumWorkApPerDay: number };
  scenarioData: Record<string, unknown>;
  submissionCount: number;
  pendingDisposition?: boolean;
  finalDisposition?: string;
  lastAssessment?: { outcome: 'accepted' | 'revise' | 'rejected'; summary: string; assessedDay: number; dimensions: WorkAssessmentDimensionResult[] };
}

export interface PendingSuccession {
  formerCharacterId: PersonId;
  departureKind: 'death' | 'departure';
  dayNumber: number;
  status: 'awaiting_selection' | 'no_successor';
  candidateIds: PersonId[];
}
export interface CharacterTransitionRecord {
  formerCharacterId: PersonId;
  nextCharacterId: PersonId;
  departureKind: 'death' | 'departure';
  dayNumber: number;
}
/** An unfinished Work retained by its institution after the contributor's death. */
export interface PreservedWorkUndertaking {
  workId: WorkId;
  title: string;
  institutionId?: InstitutionId;
  deceasedCharacterId: PersonId;
  successorCharacterId: PersonId;
  deathDay: number;
  status: 'waiting' | 'taken_up';
  takenUpDay?: number;
}
/** Durable record of an explicit successor acceptance and institutional handoff. */
export interface WorkHandoffRecord {
  workId: WorkId;
  institutionId: InstitutionId;
  formerCharacterId: PersonId;
  successorCharacterId: PersonId;
  dayNumber: number;
  eventId: EventId;
}

export interface GameState {
  calendar: CalendarState; actionEconomy: ActionEconomyState; player: { currentCharacterId: PersonId };
  /** Optional for compatibility with earlier schema-v2 saves. */
  pendingSuccession?: PendingSuccession | null;
  /** Completed player-character handoffs; optional for earlier schema-v2 saves. */
  characterTransitions?: CharacterTransitionRecord[];
  world: {
    people: Record<PersonId, Person>;
    /** Ordered pair: from-person key, then to-person key. Never mirror automatically. */
    relationships: Record<PersonId, Partial<Record<PersonId, PersonRelationship>>>;
    institutions: Record<InstitutionId, Institution>;
    locations: Record<LocationId, Location>;
    appointments: Record<AppointmentId, Appointment>;
    events: Record<EventId, WorldEvent>;
    knowledge: Record<KnowledgeEntryId, KnowledgeEntry>;
    /** Current-schema directional experience; legacy v2/v3 envelopes have no episode map. */
    relationshipFamiliarityEpisodes: Record<string, RelationshipFamiliarityEpisode>;
    matters: Record<MatterId, InstitutionalMatter>;
  };
  historicalProgression: { historicalXp: number; completedWorks: WorkId[] };
  dayClose: DayCloseState;
  opportunities: { assignments: Record<AssignmentId, AssignmentOffer>; challenges: Record<ChallengeId, ChallengeInstance>; challengeOutcomes: ChallengeOutcome[]; assignmentAggregates: Record<string, AssignmentActivityAggregate>; recentActivity: OpportunityActivity[]; selectionSeed: string; occurrenceLedger: OpportunityOccurrenceLedgerEntry[]; assignmentGeneratorLedger?: { sequence: number; lastPresentedDayByActivity: Record<string, number> } };
  works: { activeWorkId: WorkId | null; progress: Record<WorkId, WorkProgress>; preservedUndertakings?: PreservedWorkUndertaking[]; handoffHistory?: WorkHandoffRecord[] };
  records: {
    entries: Record<RecordId, RecordEntry>;
    /** Legacy prototype outcomes retained until the later persistence/content port. */
    permanentOutcomes: Array<{ id: string; dayNumber: number; summary: string; personIds: PersonId[] }>;
  };
  journal: { notices: DurableNotice[] };
}
export type LegacyRelationshipDimensionsV3 = RelationshipDimensions & { familiarity: number };
export type LegacyPersonRelationshipV3 = Omit<PersonRelationship, 'dimensions'> & { dimensions: LegacyRelationshipDimensionsV3 };
export type LegacyGameStateV3 = Omit<GameState, 'world'> & {
  world: Omit<GameState['world'], 'relationships' | 'knowledge' | 'relationshipFamiliarityEpisodes'> & {
    relationships: Record<PersonId, Partial<Record<PersonId, LegacyPersonRelationshipV3>>>;
    knowledge: Record<KnowledgeEntryId, LegacyKnowledgeEntry>;
    relationshipFamiliarityEpisodes?: never;
  };
};
export interface SaveEnvelope { schemaVersion: 4; gameVersion: string; revision: number; savedAt: string; state: GameState; }
export interface LegacySaveEnvelopeV3 { schemaVersion: 3; gameVersion: string; revision: number; savedAt: string; state: LegacyGameStateV3; }
export interface LegacySaveEnvelopeV2 { schemaVersion: 2; gameVersion: string; revision: number; savedAt: string; state: GameState; }
export interface SkillAdvancementRule { requiredSkillXp: number; careerXpCost: number; }
export type TargetSkillLevel = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export interface CareerProgressionPolicy { skillAdvancementByTargetLevel: Partial<Record<TargetSkillLevel, SkillAdvancementRule>>; }

export type GameAction =
  | { type: 'BEGIN_CHARACTER_DEPARTURE'; departureKind: 'death' | 'departure' }
  | { type: 'SELECT_SUCCESSOR'; nextCharacterId: PersonId }
  | { type: 'TAKE_UP_PRESERVED_WORK'; workId: WorkId }
  | { type: 'SPEND_AP'; amount: number; reason: string; workId?: WorkId }
  | { type: 'START_WORK'; workId: WorkId }
  | { type: 'ACQUIRE_WORK_EVIDENCE'; workId: WorkId; actionId: string }
  | { type: 'COMPLETE_WORK_ACTION'; workId: WorkId; actionId: string; scenarioData?: Record<string, unknown> }
  | { type: 'EXAMINE_WORK_EVIDENCE'; workId: WorkId; evidenceId: EvidenceId }
  | { type: 'SET_WORK_SCENARIO_DATA'; workId: WorkId; scenarioData: Record<string, unknown> }
  | { type: 'SUBMIT_WORK'; workId: WorkId }
  | { type: 'DISPOSE_WORK'; workId: WorkId; disposition: string }
  | { type: 'RECORD_WORK_ASSESSMENT'; workId: WorkId; outcome: 'accepted' | 'revise' | 'rejected'; summary: string; historicalXpReward: number }
  | { type: 'ACTIVATE_OVERTIME' }
  | { type: 'END_DAY'; expectedDayNumber: number; confirmUnusedOvertimeApForfeit?: boolean }
  | { type: 'BEGIN_WORKDAY'; expectedSettlementId: string }
  | { type: 'BUY_PROVISIONS'; amount: number }
  | { type: 'PERFORM_RECOVERY_LABOR' }
  | { type: 'REQUEST_CONTACT_ADVANCE'; contactId: PersonId }
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
  | { type: 'ASSESS_KNOWLEDGE'; knowledgeId: KnowledgeEntryId; assessment: KnowledgeAssessment }
  | { type: 'RECORD_RELATIONSHIP_FAMILIARITY_EPISODE'; episode: RelationshipFamiliarityEpisode }
  | { type: 'PRESENT_ASSIGNMENT'; offer: Omit<AssignmentOffer, 'offeredDay' | 'expiresDay' | 'status' | 'lapsedDuringMandatoryWork'> & { expiresDay?: number } }
  | { type: 'ACCEPT_ASSIGNMENT'; assignmentId: AssignmentId }
  | { type: 'DECLINE_ASSIGNMENT'; assignmentId: AssignmentId }
  | { type: 'CANCEL_ASSIGNMENT'; assignmentId: AssignmentId }
  | { type: 'COMPLETE_ASSIGNMENT'; assignmentId: AssignmentId }
  | { type: 'PERFORM_ASSIGNMENT_ACTIVITY_ACTION'; assignmentId: AssignmentId; actionId: string }
  | { type: 'UPDATE_ASSIGNMENT_ACTIVITY_DRAFT'; assignmentId: AssignmentId; draft: AssignmentActivityDraft }
  | { type: 'SUBMIT_ASSIGNMENT_ACTIVITY'; assignmentId: AssignmentId }
  | { type: 'PRESENT_CHALLENGE'; challenge: Omit<ChallengeInstance, 'status' | 'assigneePersonId'> }
  | { type: 'ACCEPT_CHALLENGE'; challengeId: ChallengeId }
  | { type: 'DECLINE_CHALLENGE'; challengeId: ChallengeId }
  | { type: 'RESOLVE_CHALLENGE'; challengeId: ChallengeId; choiceId: string }
  | { type: 'ACKNOWLEDGE_ASSIGNMENT_RECEIPT'; assignmentId: AssignmentId }
  | { type: 'ACKNOWLEDGE_CHALLENGE_RECEIPT'; challengeId: ChallengeId };
export interface ActionFeedback { kind: 'success' | 'error' | 'info'; code: string; message: string; }
export interface DaySettlement {
  startingProvisions: number;
  assignmentMoneyEarned: number;
  assignmentProvisionsEarned: number;
  workContractProvisionEarned: number;
  workContractProvisionReason: 'qualified_workday' | 'no_active_work_contract' | 'insufficient_work_ap';
  sustenanceDeducted: number;
  endingProvisions: number;
  shortageWorkdays: number;
  shortageStressDelta: number;
  cumulativeShortageStress: number;
  overtimeStress: number;
  tomorrowAp: 5 | 6;
}
export interface TransitionResult { state: GameState; feedback: ActionFeedback | null; settlement?: DaySettlement; }
