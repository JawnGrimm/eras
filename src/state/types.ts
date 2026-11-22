import type {
  AttributeId, CareerPathId, ConditionId, EraId, PersonId, SkillId, InstitutionId, LocationId,
  WorkId, TraitId, SpecializationId,
} from './ids';

export interface WalletState {
  money: number;
  provisions: number;
  shortageWorkdays: number;
}

export interface SkillState {
  /** Current proficiency, bounded from 1 through 10. */
  level: number;
  /** Lifetime experience in this skill; it establishes eligibility but is not spent. */
  skillXp: number;
}

export type SpecializationLevel = 'practitioner' | 'specialist' | 'master';

export interface SpecializationState {
  id: SpecializationId;
  level: SpecializationLevel;
  /** Experience in this field is distinct from the Career XP investment currency. */
  specializationXp: number;
  isPrimary: boolean;
}

export interface PersonalityTraitState {
  id: TraitId;
  /** Intensity is descriptive state; no universal trait catalog or effect is implied. */
  intensity: 1 | 2 | 3;
  origin: 'starting' | 'emergent';
}

export type ConditionModifierTarget =
  | { kind: 'attribute'; id: AttributeId }
  | { kind: 'skill'; id: SkillId };

export interface ConditionModifier {
  target: ConditionModifierTarget;
  /** Additive modifier applied only to actions carrying at least one matching tag. */
  value: number;
  actionTags: string[];
}

export interface CharacterConditionState {
  id: ConditionId;
  severity: 1 | 2 | 3;
  modifiers: ConditionModifier[];
  remainingWorkdays?: number;
}

export interface ScribalCharacterState {
  /** Starting professional context; it does not restrict later learning or institutional access. */
  careerPath?: CareerPathId;
  /** Spendable professional-development currency; never used to derive rank. */
  careerXp: number;
  wallet: WalletState;
  skills: Partial<Record<SkillId, SkillState>>;
  attributes: Partial<Record<AttributeId, number>>;
  specializations: SpecializationState[];
  traits: PersonalityTraitState[];
  conditions: CharacterConditionState[];
  equipment: string[];
  stress: number;
  professionalReputation: {
    competence: number;
    reliability: number;
    discretion: number;
    judgment: number;
  };
}

export interface Appointment {
  id: string;
  personId: PersonId;
  institutionId: InstitutionId;
  title: string;
  startDay: number;
  endDay?: number;
}

export interface Person {
  id: PersonId;
  name: string;
  ageYears?: number;
  alive: boolean;
  currentLocationId?: LocationId;
  affiliations: InstitutionId[];
  relationships: Record<PersonId, {
    trust: number;
    regard: number;
    familiarity: number;
    history: string[];
  }>;
  /** Present for people with an established scribal/professional capability sheet. */
  scribal?: ScribalCharacterState;
}

export interface CalendarState {
  eraId: EraId;
  dayNumber: number;
  displayDate: string;
}

export interface ActionEconomyState {
  dailyApAllocation: 5 | 6;
  apRemaining: number;
  overtimeUsedToday: boolean;
  nextDayApPenalty: boolean;
}

export interface Institution {
  id: InstitutionId;
  name: string;
  locationId?: LocationId;
}

export interface Location {
  id: LocationId;
  name: string;
}

export interface DurableNotice {
  id: string;
  dayNumber: number;
  category: 'settlement' | 'opportunity' | 'relationship' | 'work' | 'world';
  message: string;
  read: boolean;
}

export interface GameState {
  calendar: CalendarState;
  actionEconomy: ActionEconomyState;
  player: { currentCharacterId: PersonId };
  world: {
    people: Record<PersonId, Person>;
    institutions: Record<InstitutionId, Institution>;
    locations: Record<LocationId, Location>;
    appointments: Record<string, Appointment>;
  };
  historicalProgression: { historicalXp: number; completedWorks: WorkId[] };
  opportunities: { assignments: Record<string, unknown>; challenges: Record<string, unknown> };
  works: { activeWorkId: WorkId | null; progress: Record<WorkId, unknown> };
  records: { permanentOutcomes: Array<{ id: string; dayNumber: number; summary: string; personIds: PersonId[] }> };
  journal: { notices: DurableNotice[] };
}

export interface SaveEnvelope {
  schemaVersion: 2;
  gameVersion: string;
  revision: number;
  savedAt: string;
  state: GameState;
}

export interface SkillAdvancementRule {
  /** Cumulative skill experience required to become eligible for this target level. */
  requiredSkillXp: number;
  /** Career XP spent to purchase this eligible level. */
  careerXpCost: number;
}

export type TargetSkillLevel = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface CareerProgressionPolicy {
  skillAdvancementByTargetLevel: Partial<Record<TargetSkillLevel, SkillAdvancementRule>>;
}

export type GameAction =
  | { type: 'SPEND_AP'; amount: number; reason: string }
  | { type: 'ACTIVATE_OVERTIME' }
  | { type: 'END_DAY'; expectedDayNumber: number }
  | { type: 'MARK_NOTICE_READ'; noticeId: string }
  | { type: 'AWARD_SKILL_XP'; skillId: SkillId; amount: number; reason: string }
  | { type: 'PURCHASE_SKILL_LEVEL'; skillId: SkillId }
  | { type: 'SET_PRIMARY_SPECIALIZATION'; specializationId: SpecializationId };

export interface ActionFeedback {
  kind: 'success' | 'error' | 'info';
  code: string;
  message: string;
}

export interface TransitionResult {
  state: GameState;
  feedback: ActionFeedback | null;
}
