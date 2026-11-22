import React, { useState } from 'react';
import { Assignment, PlayerProfile } from '../types';
import { Coins, Award, Zap, Clock, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

interface AssignmentBoardProps {
  player: PlayerProfile;
  assignments: Assignment[];
  pendingAssignmentIds: string[];
  onAcceptAssignment: (id: string) => void;
  onCompleteAssignment: (id: string) => void;
  onCancelAssignment: (id: string) => void;
}

export const AssignmentBoard: React.FC<AssignmentBoardProps> = ({
  player,
  assignments,
  pendingAssignmentIds,
  onAcceptAssignment,
  onCompleteAssignment,
  onCancelAssignment,
}) => {
  const [filter, setFilter] = useState<'all' | 'available' | 'active'>('all');

  const activeCount = assignments.filter((a) => a.status === 'active').length;

  const filteredAssignments = assignments.filter((a) => {
    if (filter === 'available') return a.status === 'available';
    if (filter === 'active') return a.status === 'active';
    return a.status === 'available' || a.status === 'active' || a.status === 'completed';
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fadeIn">
      {/* Header & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-[#C86D33]">Professional Opportunities</span>
          <h2 className="text-2xl font-serif font-bold text-[#2B1B17] dark:text-stone-100 mt-1">
            Assignment & Commission Board
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
            Accept optional professional commissions to earn silver and Career XP. Active commitments: <strong className="text-stone-900 dark:text-stone-100">{activeCount} / 2 max</strong>.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#EBE6DF] dark:bg-stone-900 p-1 rounded-lg border border-[#D6CEBE] dark:border-stone-800">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filter === 'all'
                ? 'bg-white dark:bg-stone-800 text-[#2B1B17] dark:text-stone-100 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            All Listings
          </button>
          <button
            onClick={() => setFilter('available')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filter === 'available'
                ? 'bg-white dark:bg-stone-800 text-[#2B1B17] dark:text-stone-100 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            Available
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filter === 'active'
                ? 'bg-white dark:bg-stone-800 text-[#2B1B17] dark:text-stone-100 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            Active ({activeCount})
          </button>
        </div>
      </div>

      {/* Assignment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssignments.map((assignment) => (
          <div
            key={assignment.id}
            className={`bg-white dark:bg-stone-900 border rounded-2xl p-6 shadow-xs flex flex-col justify-between transition-all ${
              assignment.status === 'active'
                ? 'border-[#C86D33] ring-1 ring-[#C86D33]/30'
                : 'border-[#D6CEBE] dark:border-stone-800 hover:border-stone-400'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[#C86D33]">{assignment.employer}</span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                  assignment.difficulty === 'routine' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' :
                  assignment.difficulty === 'demanding' ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300' :
                  'bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-300'
                }`}>
                  {assignment.difficulty.charAt(0).toUpperCase() + assignment.difficulty.slice(1)}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-serif font-bold text-[#2B1B17] dark:text-stone-100">
                  {assignment.title}
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-2 leading-relaxed">
                  {assignment.description}
                </p>
              </div>

              {/* Rewards & Costs */}
              <div className="grid grid-cols-3 gap-2 py-3 border-y border-stone-100 dark:border-stone-800 text-xs font-mono">
                <div className="flex items-center gap-1 text-amber-700 dark:text-amber-500">
                  <Coins className="w-3.5 h-3.5" />
                  <span>+{assignment.rewardSilver} silver</span>
                </div>
                <div className="flex items-center gap-1 text-[#C86D33]">
                  <Award className="w-3.5 h-3.5" />
                  <span>+{assignment.rewardCareerXp} XP</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{assignment.blockCost} AP</span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-4 flex items-center justify-between mt-4">
              <span className="text-[11px] text-stone-500">
                {assignment.status === 'available' && `Expires in ${assignment.daysRemaining} days`}
                {assignment.status === 'active' && 'In Progress (Active)'}
                {assignment.status === 'completed' && 'Completed'}
              </span>

              {assignment.status === 'available' && (
                <button
                  onClick={() => onAcceptAssignment(assignment.id)}
                  disabled={activeCount >= 2 || pendingAssignmentIds.includes(assignment.id)}
                  className="px-4 py-2 text-xs font-medium text-white bg-[#2B1B17] dark:bg-stone-100 dark:text-stone-900 hover:bg-[#C86D33] dark:hover:bg-stone-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  Accept Commission
                </button>
              )}

              {assignment.status === 'active' && (
                <div className="flex items-center gap-2">
                  <button
                    disabled={pendingAssignmentIds.includes(assignment.id)}
                    onClick={() => onCancelAssignment(assignment.id)}
                    className="px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => onCompleteAssignment(assignment.id)}
                    disabled={pendingAssignmentIds.includes(assignment.id) || player.blocksRemaining < assignment.blockCost}
                    className="px-4 py-2 text-xs font-medium text-white bg-[#C86D33] hover:bg-[#b05c28] rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Complete ({assignment.blockCost} AP)</span>
                  </button>
                </div>
              )}

              {assignment.status === 'completed' && (
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Done
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
