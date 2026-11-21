/**
 * Career Journal dashboard and permanent archive.
 */

import React, { useMemo, useState } from 'react';
import { CareerRecordState } from '../engine/CareerWorkLog';
import { ChallengeOpportunity } from '../engine/ChallengeDirector';
import { ProfessionalReputation } from '../engine/CharacterSystem';
import { BookOpen, Shield, Award, CheckCircle2, Clock3, Archive, ArrowLeft } from 'lucide-react';

interface CareerJournalProps {
  careerRecords: CareerRecordState;
  challenges: ChallengeOpportunity[];
  completedChallenges: ChallengeOpportunity[];
  reputation: ProfessionalReputation;
  onAcceptChallenge: (id: string) => void;
  onCompleteChallenge: (id: string) => void;
  onDeclineChallenge: (id: string) => void;
}

type ArchiveType = 'all' | 'challenge' | 'assignment';
type ArchiveItem =
  | { type: 'challenge'; id: string; title: string; employer: string; date: string; era: string; character: string; outcome: string; reward: string }
  | { type: 'assignment'; id: string; title: string; employer: string; date: string; era: string; character: string; outcome: string; reward: string };

export const CareerJournalModal: React.FC<CareerJournalProps> = ({
  careerRecords,
  challenges,
  completedChallenges,
  reputation,
  onAcceptChallenge,
  onCompleteChallenge,
  onDeclineChallenge,
}) => {
  const [showArchive, setShowArchive] = useState(false);
  const [archiveType, setArchiveType] = useState<ArchiveType>('all');
  const [institutionFilter, setInstitutionFilter] = useState('');
  const [eraFilter, setEraFilter] = useState('');
  const [characterFilter, setCharacterFilter] = useState('');

  const offeredChallenges = challenges.filter((c) => c.status === 'offered' || c.status === 'accepted');
  const recentEntries = careerRecords.recentWorkLog.slice(0, 5);
  const archiveItems = useMemo<ArchiveItem[]>(() => [
    ...completedChallenges.map((challenge) => ({
      type: 'challenge' as const,
      id: challenge.id,
      title: challenge.title,
      employer: challenge.employer,
      date: challenge.completedDate ?? 'Date not recorded',
      era: challenge.completedEra ?? 'Era not recorded',
      character: challenge.completedBy ?? 'Character not recorded',
      outcome: challenge.narrativeOutcome ?? challenge.description,
      reward: `+${challenge.rewardSilver} silver · +${challenge.rewardCareerXp} Career XP`,
    })),
    ...careerRecords.notableWorkArchive.map((entry) => ({
      type: 'assignment' as const,
      id: entry.id,
      title: entry.title,
      employer: entry.employer,
      date: `Day ${entry.dayNumber} · ${entry.dateString}`,
      era: entry.eraName ?? 'Era not recorded',
      character: entry.characterName,
      outcome: entry.outcome,
      reward: `+${entry.silverEarned} silver · +${entry.careerXpEarned} Career XP`,
    })),
  ], [completedChallenges, careerRecords.notableWorkArchive]);

  const filteredArchive = archiveItems.filter((item) =>
    (archiveType === 'all' || item.type === archiveType) &&
    (!institutionFilter || item.employer.toLowerCase().includes(institutionFilter.toLowerCase())) &&
    (!eraFilter || item.era.toLowerCase().includes(eraFilter.toLowerCase())) &&
    (!characterFilter || item.character.toLowerCase().includes(characterFilter.toLowerCase()))
  );

  const activeChallengeCount = offeredChallenges.length;
  const completedChallengeCount = completedChallenges.length;
  const summary = careerRecords.summary;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fadeIn">
      <div className="bg-[#FAF7F0] dark:bg-stone-900 border border-[#D6CEBE] dark:border-stone-800 rounded-2xl p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-[#C86D33]">Professional Record</span>
          <h2 className="text-3xl font-serif font-bold text-[#2B1B17] dark:text-stone-100 mt-1">Career Journal</h2>
          <p className="text-sm text-stone-600 dark:text-stone-300 mt-2 max-w-2xl leading-relaxed">
            A summary of your professional standing, current opportunities, and recorded accomplishments.
          </p>
        </div>
        <div className="bg-white dark:bg-stone-800 border border-[#D6CEBE] dark:border-stone-700 rounded-xl p-5 shadow-xs space-y-2 min-w-[260px]">
          <div className="text-xs font-mono uppercase tracking-wider text-[#C86D33] font-bold flex items-center gap-1.5">
            <Shield className="w-4 h-4" /><span>Professional Reputation</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs pt-1">
            <div className="text-stone-600 dark:text-stone-300">Competence:</div><div className="font-mono font-bold text-right">{reputation.competence}%</div>
            <div className="text-stone-600 dark:text-stone-300">Reliability:</div><div className="font-mono font-bold text-right">{reputation.reliability}%</div>
            <div className="text-stone-600 dark:text-stone-300">Discretion:</div><div className="font-mono font-bold text-right">{reputation.discretion}%</div>
            <div className="text-stone-600 dark:text-stone-300">Judgment:</div><div className="font-mono font-bold text-right">{reputation.judgment}%</div>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <h3 className="text-xl font-serif font-bold text-[#2B1B17] dark:text-stone-100 flex items-center gap-2">
          <Award className="w-5 h-5 text-[#C86D33]" />Current Challenges & Opportunities
          <span className="text-xs font-mono text-stone-500">({activeChallengeCount})</span>
        </h3>
        {offeredChallenges.length === 0 ? (
          <div className="bg-white dark:bg-stone-900 border border-[#D6CEBE] dark:border-stone-800 rounded-2xl p-6 text-center text-stone-500 text-xs italic">
            No emergent challenges currently offered.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {offeredChallenges.map((chal) => (
              <div key={chal.id} className={`bg-white dark:bg-stone-900 border rounded-2xl p-6 shadow-xs space-y-4 ${chal.status === 'accepted' ? 'border-[#C86D33] ring-1 ring-[#C86D33]/30' : 'border-[#D6CEBE] dark:border-stone-800'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-[#FAF7F0] dark:bg-stone-800 text-[#C86D33]">{chal.employer}</span>
                  <span className="text-xs font-mono text-stone-500 uppercase">{chal.status}</span>
                </div>
                <h4 className="text-lg font-serif font-bold text-[#2B1B17] dark:text-stone-100">{chal.title}</h4>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">{chal.description}</p>
                <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs font-mono text-stone-600 dark:text-stone-300">
                  <span>Reward: +{chal.rewardSilver} silver, +{chal.rewardCareerXp} XP</span><span>Cost: {chal.blockCost} AP</span>
                </div>
                <div className="flex gap-3 pt-2">
                  {chal.status === 'offered' && <>
                    <button onClick={() => onAcceptChallenge(chal.id)} className="flex-1 py-2.5 text-xs font-medium text-white bg-[#C86D33] hover:bg-[#b05c28] rounded-xl transition-colors shadow-sm">Accept Challenge</button>
                    <button onClick={() => onDeclineChallenge(chal.id)} className="px-4 py-2.5 text-xs font-medium text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 rounded-xl transition-colors">Decline</button>
                  </>}
                  {chal.status === 'accepted' && <button onClick={() => onCompleteChallenge(chal.id)} className="w-full py-2.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm">Resolve & Complete Challenge</button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-stone-900 border border-[#D6CEBE] dark:border-stone-800 rounded-xl p-5">
          <div className="text-xs uppercase tracking-wider text-stone-500">Assignments completed</div>
          <div className="text-3xl font-serif font-bold mt-1">{summary.assignmentsCompleted}</div>
          <div className="text-xs text-stone-500 mt-2">Routine work recorded as career totals, not an unlimited list.</div>
        </div>
        <div className="bg-white dark:bg-stone-900 border border-[#D6CEBE] dark:border-stone-800 rounded-xl p-5">
          <div className="text-xs uppercase tracking-wider text-stone-500">Challenges resolved</div>
          <div className="text-3xl font-serif font-bold mt-1">{completedChallengeCount}</div>
          <div className="text-xs text-stone-500 mt-2">Completed outcomes retained in the archive.</div>
        </div>
        <div className="bg-white dark:bg-stone-900 border border-[#D6CEBE] dark:border-stone-800 rounded-xl p-5">
          <div className="text-xs uppercase tracking-wider text-stone-500">Career rewards earned</div>
          <div className="text-3xl font-serif font-bold mt-1">{summary.silverEarned} silver</div>
          <div className="text-xs text-stone-500 mt-2">{summary.careerXpEarned.toLocaleString()} Career XP from Assignments</div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xl font-serif font-bold text-[#2B1B17] dark:text-stone-100 flex items-center gap-2"><Clock3 className="w-5 h-5 text-[#C86D33]" />Recent Activity</h3>
          <span className="text-xs text-stone-500">Latest {recentEntries.length} of {summary.assignmentsCompleted}</span>
        </div>
        {recentEntries.length === 0 ? (
          <div className="bg-white dark:bg-stone-900 border border-[#D6CEBE] dark:border-stone-800 rounded-xl p-6 text-center text-stone-500 text-xs italic">Completed Assignments will appear here.</div>
        ) : (
          <div className="bg-white dark:bg-stone-900 border border-[#D6CEBE] dark:border-stone-800 rounded-xl divide-y divide-stone-100 dark:divide-stone-800">
            {recentEntries.map((entry) => (
              <div key={entry.id} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div><div className="text-sm font-semibold">{entry.title}</div><div className="text-xs text-stone-500">{entry.employer}</div></div>
                <div className="text-xs font-mono text-stone-500 sm:text-right">Day {entry.dayNumber} · {entry.dateString}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white dark:bg-stone-900 border border-[#D6CEBE] dark:border-stone-800 rounded-xl overflow-hidden">
        <button onClick={() => setShowArchive((value) => !value)} className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-[#FAF7F0] dark:hover:bg-stone-800/60">
          <span className="flex items-center gap-2 font-semibold"><Archive className="w-4 h-4 text-[#C86D33]" />Permanent Career Archive <span className="text-xs text-stone-500 font-normal">({archiveItems.length})</span></span>
          <span className="text-xs text-stone-500">{showArchive ? 'Close archive' : 'Open archive'}</span>
        </button>
        {showArchive && (
          <div className="border-t border-stone-100 dark:border-stone-800 p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <select value={archiveType} onChange={(event) => setArchiveType(event.target.value as ArchiveType)} className="rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-2 text-xs">
                <option value="all">All record types</option><option value="challenge">Challenges</option><option value="assignment">Notable assignments</option>
              </select>
              <input value={institutionFilter} onChange={(event) => setInstitutionFilter(event.target.value)} placeholder="Filter institution" className="rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-2 text-xs" />
              <input value={eraFilter} onChange={(event) => setEraFilter(event.target.value)} placeholder="Filter era" className="rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-2 text-xs" />
              <input value={characterFilter} onChange={(event) => setCharacterFilter(event.target.value)} placeholder="Filter character" className="rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-2 text-xs" />
            </div>
            {filteredArchive.length === 0 ? (
              <p className="text-xs text-stone-500 italic">No archived records match these filters.</p>
            ) : (
              <div className="space-y-2">
                {filteredArchive.map((item) => (
                  <details key={`${item.type}-${item.id}`} className="border border-stone-200 dark:border-stone-800 rounded-lg">
                    <summary className="cursor-pointer list-none px-4 py-3 flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span><strong className="text-sm">{item.title}</strong><span className="block text-xs text-stone-500">{item.employer} · {item.type}</span></span>
                      <span className="text-xs text-stone-500">{item.date}</span>
                    </summary>
                    <div className="px-4 pb-3 text-xs text-stone-600 dark:text-stone-300 space-y-1">
                      <p>{item.outcome}</p><p>{item.era} · {item.character}</p><p>{item.reward}</p>
                    </div>
                  </details>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
