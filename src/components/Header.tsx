import React from 'react';
import { PlayerProfile } from '../types';
import { Coins, Wheat, Beer, Zap, Award, Calendar, BookOpen } from 'lucide-react';

interface HeaderProps {
  player: PlayerProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCodex: () => void;
  onEndDay: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  player,
  activeTab,
  setActiveTab,
  onOpenCodex,
  onEndDay,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#F4F1EA] dark:bg-[#1C1614] border-b border-[#D6CEBE] dark:border-stone-800 px-6 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-lg bg-[#C86D33] text-white flex items-center justify-center font-serif font-bold text-xl shadow-sm">
            ☩
          </div>
          <div>
            <h1 className="text-lg font-serif font-bold tracking-tight text-[#2B1B17] dark:text-stone-100">
              Scribe of Eras
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-sans">
              {player.eraName}
            </p>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 bg-[#EBE6DF] dark:bg-stone-900 p-1 rounded-lg border border-[#D6CEBE] dark:border-stone-800">
          <button
            onClick={() => setActiveTab('hub')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'hub'
                ? 'bg-white dark:bg-stone-800 text-[#2B1B17] dark:text-stone-100 shadow-sm font-semibold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            Workday Hub
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'assignments'
                ? 'bg-white dark:bg-stone-800 text-[#2B1B17] dark:text-stone-100 shadow-sm font-semibold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            Commissions
          </button>
          <button
            onClick={() => setActiveTab('work')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 relative ${
              activeTab === 'work'
                ? 'bg-white dark:bg-stone-800 text-[#2B1B17] dark:text-stone-100 shadow-sm font-semibold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            Storehouse Reckoning
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#C86D33]" />
          </button>
          <button
            onClick={() => setActiveTab('codex')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'codex'
                ? 'bg-white dark:bg-stone-800 text-[#2B1B17] dark:text-stone-100 shadow-sm font-semibold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            Codex & GDD
          </button>
        </nav>

        {/* Zone 3: Resources & Primary Action */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Resources Mini Wallet */}
          <div className="flex items-center gap-3 bg-[#EBE6DF] dark:bg-stone-900 px-3 py-1.5 rounded-lg border border-[#D6CEBE] dark:border-stone-800 text-xs font-mono">
            <div className="flex items-center gap-1 text-amber-700 dark:text-amber-500" title="Silver Coins">
              <Coins className="w-3.5 h-3.5" />
              <span className="tabular-nums font-semibold">{player.silver}</span>
            </div>
            <div className="w-px h-3 bg-stone-300 dark:bg-stone-700" />
            <div className="flex items-center gap-1 text-orange-800 dark:text-orange-400" title="Bread Rations">
              <Wheat className="w-3.5 h-3.5" />
              <span className="tabular-nums font-semibold">{player.bread}</span>
            </div>
            <div className="w-px h-3 bg-stone-300 dark:bg-stone-700" />
            <div className="flex items-center gap-1 text-amber-900 dark:text-amber-300" title="Beer Jugs">
              <Beer className="w-3.5 h-3.5" />
              <span className="tabular-nums font-semibold">{player.beer}</span>
            </div>
            <div className="w-px h-3 bg-stone-300 dark:bg-stone-700" />
            <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400" title="Daily Time Blocks (4 per day)">
              <Calendar className="w-3.5 h-3.5" />
              <span className="tabular-nums font-semibold">
                {player.currentBlock === 1 ? 'Morning (1/4)' :
                 player.currentBlock === 2 ? 'Midday (2/4)' :
                 player.currentBlock === 3 ? 'Afternoon (3/4)' : 'Evening (4/4)'}
              </span>
            </div>
          </div>

          <button
            onClick={onEndDay}
            className="px-3.5 py-2 text-xs font-medium text-white bg-[#C86D33] hover:bg-[#b05c28] rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            title="End in-game day and perform daily settlement"
          >
            <Calendar className="w-3.5 h-3.5" />
            End Day ({player.currentDay})
          </button>
        </div>
      </div>
    </header>
  );
};
