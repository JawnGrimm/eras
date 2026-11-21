/**
 * Scribe of Eras - Career Journal & Challenges (src/components/CareerJournalModal.tsx)
 */

import React from 'react';
import { CareerLogEntry } from '../engine/CareerWorkLog';
import { CareerJournalEvent } from '../engine/CareerJournal';
import { ChallengeOpportunity } from '../engine/ChallengeDirector';
import { ProfessionalReputation } from '../engine/CharacterSystem';
import { BookOpen, Shield, Award, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface CareerJournalProps {
  workLog: CareerLogEntry[];
  journalEvents: CareerJournalEvent[];
  challenges: ChallengeOpportunity[];
  reputation: ProfessionalReputation;
  onAcceptChallenge: (id: string) => void;
  onCompleteChallenge: (id: string) => void;
  onDeclineChallenge: (id: string) => void;
}

export const CareerJournalModal: React.FC<CareerJournalProps> = ({
  workLog,
  journalEvents,
  challenges,
  reputation,
  onAcceptChallenge,
  onCompleteChallenge,
  onDeclineChallenge,
}) => {
  const offeredChallenges = challenges.filter((c) => c.status === 'offered' || c.status === 'accepted');
  const archivedChallenges = challenges.filter(
    (challenge) =>
      ['completed', 'declined', 'lapsed'].includes(challenge.status) &&
      !journalEvents.some((event) => event.challengeId === challenge.id)
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-[#FAF7F0] dark:bg-stone-900 border border-[#D6CEBE] dark:border-stone-800 rounded-2xl p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-[#C86D33]">Professional Archive</span>
          <h2 className="text-3xl font-serif font-bold text-[#2B1B17] dark:text-stone-100 mt-1">
            Career Journal & Emergent Challenges
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-300 mt-2 max-w-2xl leading-relaxed">
            Review your immutable professional work log snapshots and respond to emergent narrative challenges synthesized from your career history.
          </p>
        </div>

        {/* Reputation Card */}
        <div className="bg-white dark:bg-stone-800 border border-[#D6CEBE] dark:border-stone-700 rounded-xl p-5 shadow-xs space-y-2 min-w-[260px]">
          <div className="text-xs font-mono uppercase tracking-wider text-[#C86D33] font-bold flex items-center gap-1.5">
            <Shield className="w-4 h-4" />
            <span>Professional Reputation</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs pt-1">
            <div className="text-stone-600 dark:text-stone-300">Competence:</div>
            <div className="font-mono font-bold text-right text-[#2B1B17] dark:text-stone-100">{reputation.competence}%</div>
            <div className="text-stone-600 dark:text-stone-300">Reliability:</div>
            <div className="font-mono font-bold text-right text-[#2B1B17] dark:text-stone-100">{reputation.reliability}%</div>
            <div className="text-stone-600 dark:text-stone-300">Discretion:</div>
            <div className="font-mono font-bold text-right text-[#2B1B17] dark:text-stone-100">{reputation.discretion}%</div>
            <div className="text-stone-600 dark:text-stone-300">Judgment:</div>
            <div className="font-mono font-bold text-right text-[#2B1B17] dark:text-stone-100">{reputation.judgment}%</div>
          </div>
        </div>
      </div>

      {/* Emergent Challenges Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-serif font-bold text-[#2B1B17] dark:text-stone-100 flex items-center gap-2">
          <Award className="w-5 h-5 text-[#C86D33]" />
          <span>Emergent Challenges & Narrative Opportunities</span>
        </h3>

        {offeredChallenges.length === 0 ? (
          <div className="bg-white dark:bg-stone-900 border border-[#D6CEBE] dark:border-stone-800 rounded-2xl p-6 text-center text-stone-500 text-xs italic">
            No emergent challenges currently offered. Complete more assignments to establish recognizable professional patterns for the Challenge Director.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {offeredChallenges.map((chal) => (
              <div
                key={chal.id}
                className={`bg-white dark:bg-stone-900 border rounded-2xl p-6 shadow-xs space-y-4 ${
                  chal.status === 'accepted' ? 'border-[#C86D33] ring-1 ring-[#C86D33]/30' : 'border-[#D6CEBE] dark:border-stone-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-[#FAF7F0] dark:bg-stone-800 text-[#C86D33]">
                    {chal.employer}
                  </span>
                  <span className="text-xs font-mono text-stone-500 uppercase">{chal.status}</span>
                </div>

                <h4 className="text-lg font-serif font-bold text-[#2B1B17] dark:text-stone-100">{chal.title}</h4>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">{chal.description}</p>

                <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs font-mono text-stone-600 dark:text-stone-300">
                  <span>Reward: +{chal.rewardSilver} silver, +{chal.rewardCareerXp} XP</span>
                  <span>Cost: {chal.blockCost} block(s)</span>
                </div>

                <div className="flex gap-3 pt-2">
                  {chal.status === 'offered' && (
                    <>
                      <button
                        onClick={() => onAcceptChallenge(chal.id)}
                        className="flex-1 py-2.5 text-xs font-medium text-white bg-[#C86D33] hover:bg-[#b05c28] rounded-xl transition-colors shadow-sm"
                      >
                        Accept Challenge
                      </button>
                      <button
                        onClick={() => onDeclineChallenge(chal.id)}
                        className="px-4 py-2.5 text-xs font-medium text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 rounded-xl transition-colors"
                      >
                        Decline
                      </button>
                    </>
                  )}
                  {chal.status === 'accepted' && (
                    <button
                      onClick={() => onCompleteChallenge(chal.id)}
                      className="w-full py-2.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm"
                    >
                      Resolve & Complete Challenge
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Challenge History Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-serif font-bold text-[#2B1B17] dark:text-stone-100 flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#C86D33]" />
          <span>Challenge History ({journalEvents.length + archivedChallenges.length} Records)</span>
        </h3>

        {journalEvents.length === 0 && archivedChallenges.length === 0 ? (
          <div className="bg-white dark:bg-stone-900 border border-[#D6CEBE] dark:border-stone-800 rounded-2xl p-6 text-center text-stone-500 text-xs italic">
            Challenge offers, decisions, and outcomes will be recorded here as your career develops.
          </div>
        ) : (
          <div className="space-y-3">
            {journalEvents.map((event) => {
              const eventLabel = {
                challenge_offered: 'Offered',
                challenge_accepted: 'Accepted',
                challenge_declined: 'Declined',
                challenge_completed: 'Completed',
              }[event.eventType];

              return (
                <div
                  key={event.id}
                  className="bg-white dark:bg-stone-900 border border-[#D6CEBE] dark:border-stone-800 rounded-2xl p-5 shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#C86D33]">{eventLabel}</span>
                      <h4 className="text-base font-serif font-bold text-[#2B1B17] dark:text-stone-100 mt-1">{event.title}</h4>
                      <div className="text-xs text-stone-500 mt-1">{event.employer}</div>
                    </div>
                    <div className="text-xs font-mono text-stone-500">
                      Day {event.dayNumber} · {event.dateString}
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">{event.description}</p>
                  <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed bg-[#FAF7F0] dark:bg-stone-800/60 p-3.5 rounded-xl border border-[#D6CEBE]/50">
                    <strong>Record:</strong> {event.outcome}
                  </p>

                  {event.eventType === 'challenge_completed' && (
                    <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 font-mono">
                      <span>Silver: +{event.silverEarned}</span>
                      <span>Career XP: +{event.careerXpEarned}</span>
                      <span>Recorded by: {event.characterName}</span>
                    </div>
                  )}
                </div>
              );
            })}

            {archivedChallenges.map((challenge) => (
              <div
                key={challenge.id}
                className="bg-white dark:bg-stone-900 border border-[#D6CEBE] dark:border-stone-800 rounded-2xl p-5 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-base font-serif font-bold text-[#2B1B17] dark:text-stone-100">{challenge.title}</h4>
                  <span className="text-[11px] font-mono uppercase text-stone-500">{challenge.status} · prior save</span>
                </div>
                <div className="text-xs text-stone-500">{challenge.employer}</div>
                <p className="text-xs text-stone-600 dark:text-stone-300">{challenge.description}</p>
                <p className="text-[11px] italic text-stone-500">This Challenge was already in your save before detailed journal recording was introduced; its original decision date is unavailable.</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Immutable Career Work Log Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-serif font-bold text-[#2B1B17] dark:text-stone-100 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#C86D33]" />
          <span>Immutable Career Work Log ({workLog.length} Entries)</span>
        </h3>

        {workLog.length === 0 ? (
          <div className="bg-white dark:bg-stone-900 border border-[#D6CEBE] dark:border-stone-800 rounded-2xl p-8 text-center text-stone-500 text-xs italic">
            Your career log is currently empty. Complete assignments on the Assignment Board to record your professional activities and decisions.
          </div>
        ) : (
          <div className="space-y-4">
            {workLog.map((entry) => (
              <div
                key={entry.id}
                className="bg-white dark:bg-stone-900 border border-[#D6CEBE] dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-[#FAF7F0] dark:bg-stone-800 text-[#C86D33]">
                      {entry.employer}
                    </span>
                    <h4 className="text-base font-serif font-bold text-[#2B1B17] dark:text-stone-100">
                      {entry.title}
                    </h4>
                  </div>
                  <div className="text-xs font-mono text-stone-500">
                    Day {entry.dayNumber} · {entry.dateString}
                  </div>
                </div>

                <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed bg-[#FAF7F0] dark:bg-stone-800/60 p-3.5 rounded-xl border border-[#D6CEBE]/50">
                  <strong>Activity:</strong> {entry.activity} — <span className="italic">{entry.outcome}</span>
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 pt-1 font-mono">
                  <span>Location: {entry.location}</span>
                  {entry.commodity && <span>Commodity: {entry.commodity}</span>}
                  <span>Silver: +{entry.silverEarned}</span>
                  <span>Career XP: +{entry.careerXpEarned}</span>
                  <span>Recorded by: {entry.characterName}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
