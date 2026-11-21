import React from 'react';
import { PlayerProfile, StorehouseWorkState } from '../types';
import { Award, BookOpen, Clock, Zap, AlertCircle, CheckCircle2, ChevronRight, ShieldAlert, Sparkles, Coffee, Moon } from 'lucide-react';

interface WorkdayHubProps {
  player: PlayerProfile;
  workState: StorehouseWorkState;
  onNavigateTab: (tab: string) => void;
  onStudy: () => void;
  onRest: () => void;
  onResetGame: () => void;
  onWorkLate: () => void;
}

export const WorkdayHub: React.FC<WorkdayHubProps> = ({
  player,
  workState,
  onNavigateTab,
  onStudy,
  onRest,
  onResetGame,
  onWorkLate,
}) => {
  const getStageTitle = (stage: string) => {
    switch (stage) {
      case 'A_INVESTIGATE': return 'Stage A: Investigate Discrepancy';
      case 'B_DESIGN': return 'Stage B: Design Register Structure';
      case 'C_TEST': return 'Stage C: Test Against Unseen Transactions';
      case 'D_ADOPT': return 'Stage D: Audit & Institutional Adoption';
      case 'COMPLETED': return 'Work Successfully Completed';
      default: return 'Active Investigation';
    }
  };

  const getBlockName = (block: number) => {
    switch (block) {
      case 1: return 'Morning (1/4)';
      case 2: return 'Midday (2/4)';
      case 3: return 'Afternoon (3/4)';
      case 4: return 'Evening (4/4)';
      default: return 'Overtime / Night';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fadeIn">
      {/* Top Hero Banner */}
      <div className="bg-[#FAF7F0] dark:bg-stone-900 border border-[#D6CEBE] dark:border-stone-800 rounded-2xl p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#C86D33]">
                <span>{player.eraName}</span>
                <span>·</span>
                <span>Day {player.currentDay} ({getBlockName(player.currentBlock)})</span>
              </div>
              <button
                onClick={onResetGame}
                className="px-2.5 py-1 text-[11px] font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 rounded border border-red-200 dark:border-red-900 transition-colors"
                title="Reset game state to Day 1"
              >
                Reset Game
              </button>
            </div>
            <h2 className="text-3xl font-serif font-bold text-[#2B1B17] dark:text-stone-100">
              Welcome, {player.title} {player.name}
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 max-w-2xl leading-relaxed">
              Reading, comparing sources, drafting, and thinking are <strong>free</strong>. Visiting officials, conducting audits, and assignments cost time blocks.
            </p>
          </div>

          {/* Time Blocks & Stress Card */}
          <div className="bg-white dark:bg-stone-800 border border-[#D6CEBE] dark:border-stone-700 rounded-xl p-5 flex items-center gap-6 shadow-xs shrink-0">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 mx-auto mb-1">
                <Clock className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold font-mono text-[#2B1B17] dark:text-stone-100 tabular-nums">
                {player.blocksRemaining} <span className="text-xs text-stone-400 font-normal">/ 4</span>
              </div>
              <div className="text-[11px] font-medium text-stone-500 uppercase tracking-wide">Time Blocks</div>
            </div>

            <div className="w-px h-12 bg-stone-200 dark:bg-stone-700" />

            <div className="space-y-1.5 min-w-[140px]">
              <div className="flex justify-between text-xs">
                <span className="text-stone-500">Career XP</span>
                <span className="font-mono font-bold text-[#2B1B17] dark:text-stone-200">{player.careerXp}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-stone-500">Historical XP</span>
                <span className="font-mono font-bold text-[#C86D33]">{player.historicalXp}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-stone-500">Stress</span>
                <span className="font-mono font-bold text-amber-700 dark:text-amber-400">{player.stress}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Mandatory Work vs Commissions & Evening Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Mandatory Work Focus */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-stone-900 border border-[#D6CEBE] dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-[#C86D33]">Mandatory Historical Work</span>
                <h3 className="text-xl font-serif font-bold text-[#2B1B17] dark:text-stone-100 mt-0.5">
                  The Storehouse Reckoning (Uruk c. 3200 BCE)
                </h3>
              </div>
              <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                workState.stage === 'COMPLETED'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}>
                {workState.stage === 'COMPLETED' ? 'Completed' : 'In Progress'}
              </span>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                A discrepancy between intake tallies and current storehouse physical stock has exposed weaknesses in temple recordkeeping. You are tasked by the Senior Scribe with investigating the evidence, designing a durable movement register, and testing it against unseen future transactions.
              </p>

              <div className="bg-[#FAF7F0] dark:bg-stone-800/60 rounded-xl p-4 border border-[#D6CEBE]/60 dark:border-stone-700 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-stone-500">
                  <span>Current Phase</span>
                  <span className="font-bold text-[#2B1B17] dark:text-stone-200">{getStageTitle(workState.stage)}</span>
                </div>
                <div className="w-full bg-stone-200 dark:bg-stone-700 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#C86D33] h-full transition-all duration-500"
                    style={{
                      width: workState.stage === 'A_INVESTIGATE' ? '25%' :
                             workState.stage === 'B_DESIGN' ? '50%' :
                             workState.stage === 'C_TEST' ? '75%' :
                             workState.stage === 'D_ADOPT' ? '90%' :
                             workState.stage === 'COMPLETED' ? '100%' : '10%'
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-stone-500">
                  Contract Provision: Earn <strong className="text-stone-700 dark:text-stone-300">1 Bread</strong> per active contracted workday.
                </div>
                <button
                  onClick={() => onNavigateTab('work')}
                  className="px-5 py-2.5 text-xs font-medium text-white bg-[#2B1B17] dark:bg-stone-100 dark:text-stone-900 hover:bg-[#C86D33] dark:hover:bg-stone-200 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                >
                  <span>Open Storehouse Reckoning</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Professional Rank & Progression Info */}
          <div className="bg-white dark:bg-stone-900 border border-[#D6CEBE] dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-serif font-bold text-[#2B1B17] dark:text-stone-100">
              Professional Standing & Career Progression
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="p-4 rounded-xl bg-[#FAF7F0] dark:bg-stone-800/60 border border-[#D6CEBE]/50 dark:border-stone-700">
                <div className="text-xs text-stone-500 font-medium">Current Rank</div>
                <div className="text-lg font-serif font-bold text-[#2B1B17] dark:text-stone-100 mt-1">Rank 1: Apprentice</div>
                <div className="text-xs text-[#C86D33] mt-1">Unlocks Novice Commissions</div>
              </div>
              <div className="p-4 rounded-xl bg-[#FAF7F0] dark:bg-stone-800/60 border border-[#D6CEBE]/50 dark:border-stone-700">
                <div className="text-xs text-stone-500 font-medium">Next Rank Threshold</div>
                <div className="text-lg font-serif font-bold text-[#2B1B17] dark:text-stone-100 mt-1">2,000 Career XP</div>
                <div className="text-xs text-stone-500 mt-1">{2000 - player.careerXp} XP remaining</div>
              </div>
              <div className="p-4 rounded-xl bg-[#FAF7F0] dark:bg-stone-800/60 border border-[#D6CEBE]/50 dark:border-stone-700">
                <div className="text-xs text-stone-500 font-medium">Historical Progress</div>
                <div className="text-lg font-serif font-bold text-[#C86D33] mt-1">{player.historicalXp} XP</div>
                <div className="text-xs text-stone-500 mt-1">Required for Era II: 73,000 XP</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Commissions Quick Actions & Evening Actions */}
        <div className="space-y-6">
          {/* Commissions Teaser */}
          <div className="bg-white dark:bg-stone-900 border border-[#D6CEBE] dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-serif font-bold text-[#2B1B17] dark:text-stone-100">
                Available Commissions
              </h3>
              <button
                onClick={() => onNavigateTab('assignments')}
                className="text-xs font-medium text-[#C86D33] hover:underline flex items-center gap-1"
              >
                <span>View Board</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              Optional short professional jobs offer silver and Career XP. You may hold up to 2 active commissions simultaneously.
            </p>
            <button
              onClick={() => onNavigateTab('assignments')}
              className="w-full py-2.5 text-xs font-medium text-[#2B1B17] dark:text-stone-200 bg-[#FAF7F0] dark:bg-stone-800 hover:bg-[#EBE6DF] dark:hover:bg-stone-700 border border-[#D6CEBE] dark:border-stone-700 rounded-xl transition-colors"
            >
              Browse Assignment Board
            </button>
          </div>

          {/* Evening Study, Rest & Working Late */}
          <div className="bg-white dark:bg-stone-900 border border-[#D6CEBE] dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-serif font-bold text-[#2B1B17] dark:text-stone-100">
              Time Management & Evening Routine
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              Thinking is free (0 blocks). Spend time blocks on study, rest, or working late.
            </p>

            <div className="space-y-3">
              <button
                onClick={onStudy}
                disabled={player.blocksRemaining < 1}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#FAF7F0] dark:bg-stone-800 hover:bg-[#EBE6DF] dark:hover:bg-stone-700 border border-[#D6CEBE] dark:border-stone-700 transition-colors disabled:opacity-50 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#2B1B17] dark:text-stone-100">Study Scribes & Metrology</div>
                    <div className="text-[11px] text-stone-500">Costs 1 Block · Grants +15 Career XP</div>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-[#C86D33]">-1 Block</span>
              </button>

              <button
                onClick={onRest}
                disabled={player.blocksRemaining < 1}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#FAF7F0] dark:bg-stone-800 hover:bg-[#EBE6DF] dark:hover:bg-stone-700 border border-[#D6CEBE] dark:border-stone-700 transition-colors disabled:opacity-50 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center">
                    <Coffee className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#2B1B17] dark:text-stone-100">Rest & Recover</div>
                    <div className="text-[11px] text-stone-500">Costs 1 Block · Reduces Stress by 10%</div>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-[#C86D33]">-1 Block</span>
              </button>

              <button
                onClick={onWorkLate}
                disabled={player.workingLate}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 border border-orange-200 dark:border-orange-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 flex items-center justify-center">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-orange-900 dark:text-orange-200">
                      {player.workingLate ? 'Overtime Completed' : 'Work Late (Overtime)'}
                    </div>
                    <div className="text-[11px] text-orange-700 dark:text-orange-400">
                      {player.workingLate ? "Tomorrow's Block 1 will be skipped." : "+5% Stress · Skips tomorrow's Block 1 · Once per day"}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-orange-800 dark:text-orange-300">
                  {player.workingLate ? 'Used Today' : '+1 Block'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
