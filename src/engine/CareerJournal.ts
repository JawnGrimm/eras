/**
 * Scribe of Eras - Career Journal Events
 *
 * Challenge history is recorded separately from the completed-assignment work log.
 * The assignment log remains the Challenge Director's behavioral input.
 */

export type CareerJournalEventType =
  | 'challenge_offered'
  | 'challenge_accepted'
  | 'challenge_declined'
  | 'challenge_completed';

export interface CareerJournalEvent {
  id: string;
  eventType: CareerJournalEventType;
  challengeId: string;
  title: string;
  employer: string;
  description: string;
  outcome: string;
  dayNumber: number;
  dateString: string;
  characterName: string;
  silverEarned: number;
  careerXpEarned: number;
}

export function createCareerJournal(): CareerJournalEvent[] {
  return [];
}

export function appendCareerJournalEvent(
  journal: CareerJournalEvent[],
  event: Omit<CareerJournalEvent, 'id'>
): CareerJournalEvent[] {
  const newEvent: CareerJournalEvent = {
    ...event,
    id: `journal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
  };

  return [newEvent, ...journal];
}
