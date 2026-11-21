/**
 * Compact career records and bounded recent activity.
 * Routine assignment details are retained only in the recent window; aggregate
 * counters support simulation patterns without rescanning an unbounded log.
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
  eraName?: string;
  archiveLevel?: 'routine' | 'notable';
}

export interface CareerActivitySummary {
  assignmentsCompleted: number;
  silverEarned: number;
  careerXpEarned: number;
  byEmployer: Record<string, number>;
  byCategory: Record<string, number>;
  byCommodity: Record<string, number>;
  lastCompletedDay: number;
}

export interface CareerRecordState {
  summary: CareerActivitySummary;
  recentWorkLog: CareerLogEntry[];
  notableWorkArchive: CareerLogEntry[];
}

export const RECENT_CAREER_ENTRY_LIMIT = 5;

export function createCareerLog(): CareerRecordState {
  return {
    summary: {
      assignmentsCompleted: 0,
      silverEarned: 0,
      careerXpEarned: 0,
      byEmployer: {},
      byCategory: {},
      byCommodity: {},
      lastCompletedDay: 0,
    },
    recentWorkLog: [],
    notableWorkArchive: [],
  };
}

function incrementCounter(record: Record<string, number>, key: string): Record<string, number> {
  const normalized = key.trim() || 'Unclassified';
  return { ...record, [normalized]: (record[normalized] ?? 0) + 1 };
}

export function recordAssignmentCompletion(
  state: CareerRecordState,
  entry: CareerLogEntry,
): CareerRecordState {
  const summary = {
    ...state.summary,
    assignmentsCompleted: state.summary.assignmentsCompleted + 1,
    silverEarned: state.summary.silverEarned + entry.silverEarned,
    careerXpEarned: state.summary.careerXpEarned + entry.careerXpEarned,
    byEmployer: incrementCounter(state.summary.byEmployer, entry.employer),
    byCategory: incrementCounter(state.summary.byCategory, entry.category),
    byCommodity: entry.commodity
      ? incrementCounter(state.summary.byCommodity, entry.commodity)
      : state.summary.byCommodity,
    lastCompletedDay: Math.max(state.summary.lastCompletedDay, entry.dayNumber),
  };

  const recentWorkLog = [entry, ...state.recentWorkLog].slice(0, RECENT_CAREER_ENTRY_LIMIT);
  const notableWorkArchive = entry.archiveLevel === 'notable'
    ? [entry, ...state.notableWorkArchive]
    : state.notableWorkArchive;

  return { summary, recentWorkLog, notableWorkArchive };
}

/**
 * One-time migration from the prototype's unbounded work-log array.
 * Existing entries are preserved in the archive; future routine entries use
 * the bounded recent window and aggregate counters.
 */
export function migrateCareerLog(legacyEntries: CareerLogEntry[]): CareerRecordState {
  let migrated = createCareerLog();
  for (const entry of [...legacyEntries].reverse()) {
    migrated = recordAssignmentCompletion(migrated, entry);
  }
  return {
    ...migrated,
    recentWorkLog: legacyEntries.slice(0, RECENT_CAREER_ENTRY_LIMIT),
    notableWorkArchive: legacyEntries.slice(RECENT_CAREER_ENTRY_LIMIT).map((entry) => ({
      ...entry,
      archiveLevel: 'notable' as const,
    })),
  };
}

export function normalizeCareerRecords(saved: Partial<CareerRecordState> | null): CareerRecordState {
  const empty = createCareerLog();
  if (!saved || !saved.summary) return empty;
  return {
    summary: {
      ...empty.summary,
      ...saved.summary,
      byEmployer: saved.summary.byEmployer ?? {},
      byCategory: saved.summary.byCategory ?? {},
      byCommodity: saved.summary.byCommodity ?? {},
    },
    recentWorkLog: (saved.recentWorkLog ?? []).slice(0, RECENT_CAREER_ENTRY_LIMIT),
    notableWorkArchive: saved.notableWorkArchive ?? [],
  };
}

export function countEmployerInteractions(summary: CareerActivitySummary, employer: string): number {
  const target = employer.toLowerCase();
  return Object.entries(summary.byEmployer)
    .filter(([name]) => name.toLowerCase().includes(target))
    .reduce((total, [, count]) => total + count, 0);
}

export function countCommodityMentions(summary: CareerActivitySummary, commodity: string): number {
  const target = commodity.toLowerCase();
  return Object.entries(summary.byCommodity)
    .filter(([name]) => name.toLowerCase().includes(target))
    .reduce((total, [, count]) => total + count, 0);
}
