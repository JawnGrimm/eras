import type { AttributeId, EraId, PersonId, SkillId, InstitutionId, LocationId, WorkId } from './ids';

export interface WalletState {
  money: number;
  provisions: number;
  shortageWorkdays: number;
}

export interface SkillState {
  level: number;
  experience: number;
}

export interface ScribalCharacterState {
  careerXp: number;
  wallet: WalletState;
  skills: Partial<Record<SkillId, SkillState>>;
  attributes: Partial<Record<AttributeId, number>>;
  specializations: string[];
  traits: string[];
  conditions: Array<{ id: string; severity?: number; remainingWorkdays?: number }>;
  equipment: string[];
  stress: number;
  professionalReputation: {
    competence: number;
    reliability: number;
    discretion: number;
    judgment: number;
  };
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
  };
  historicalProgression: { historicalXp: number; completedWorks: WorkId[] };
  opportunities: { assignments: Record<string, unknown>; challenges: Record<string, unknown> };
  works: { activeWorkId: WorkId | null; progress: Record<WorkId, unknown> };
  records: { permanentOutcomes: Array<{ id: string; dayNumber: number; summary: string }> };
  journal: { notices: DurableNotice[] };
}

export interface SaveEnvelope {
  schemaVersion: 2;
  gameVersion: string;
  revision: number;
  savedAt: string;
  state: GameState;
}

export type GameAction =
  | { type: 'SPEND_AP'; amount: number; reason: string }
  | { type: 'ACTIVATE_OVERTIME' }
  | { type: 'END_DAY' }
  | { type: 'MARK_NOTICE_READ'; noticeId: string };

export interface ActionFeedback {
  kind: 'success' | 'error' | 'info';
  code: string;
  message: string;
}

export interface TransitionResult {
  state: GameState;
  feedback: ActionFeedback | null;
}
