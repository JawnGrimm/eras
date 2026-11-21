/**
 * Scribe of Eras - Career Work Log (src/engine/CareerWorkLog.ts)
 * Immutable snapshots of completed professional assignments, serving as raw analytical input for the Challenge Director.
 */

export interface CareerLogEntry {
  id: string;
  assignmentId: string;
  title: string;
  employer: string;
  npcsInvolved: string[];
  commodity?: string;
  documentType: string;
  location: string;
  category: string;
  activity: string;
  decisionsMade: string[];
  outcome: string;
  silverEarned: number;
  careerXpEarned: number;
  dateString: string;
  dayNumber: number;
  characterName: string;
}

export function createCareerLog(): CareerLogEntry[] {
  return [];
}

export function appendCareerLogEntry(
  log: CareerLogEntry[],
  entry: Omit<CareerLogEntry, 'id'>
): CareerLogEntry[] {
  const newEntry: CareerLogEntry = {
    ...entry,
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
  };
  return [newEntry, ...log];
}

/**
 * Pattern analysis helpers for the Challenge Director
 */
export function countEmployerInteractions(log: CareerLogEntry[], employer: string): number {
  return log.filter((entry) => entry.employer.toLowerCase().includes(employer.toLowerCase())).length;
}

export function countNpcInteractions(log: CareerLogEntry[], npcName: string): number {
  return log.filter((entry) => entry.npcsInvolved.some((n) => n.toLowerCase().includes(npcName.toLowerCase()))).length;
}

export function countCommodityMentions(log: CareerLogEntry[], commodity: string): number {
  return log.filter((entry) => entry.commodity?.toLowerCase().includes(commodity.toLowerCase())).length;
}
