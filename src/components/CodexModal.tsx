import React from 'react';
import { BookOpen, Award, Shield, Coins, Wheat, Beer, Zap, RotateCcw } from 'lucide-react';

interface CodexModalProps {
  onResetGame: () => void;
}

export const CodexModal: React.FC<CodexModalProps> = ({ onResetGame }) => {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8 animate-fadeIn">
      <div className="bg-[#FAF7F0] dark:bg-stone-900 border border-[#D6CEBE] dark:border-stone-800 rounded-2xl p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-[#C86D33]">Game Manual & GDD Codex</span>
          <h2 className="text-3xl font-serif font-bold text-[#2B1B17] dark:text-stone-100 mt-1">
            Scribe of Eras Knowledge Repository
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-300 mt-2 leading-relaxed max-w-2xl">
            Based on the official Game Design Document (v1.2). Explore the mechanics, design pillars, career ranks, and historical scope of the game.
          </p>
        </div>

        <button
          onClick={onResetGame}
          className="px-4 py-2.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors flex items-center gap-2 shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Game / Fresh Save</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Core Pillars */}
        <div className="bg-white dark:bg-stone-900 border border-[#D6CEBE] dark:border-stone-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-serif font-bold text-[#2B1B17] dark:text-stone-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#C86D33]" />
            Design Pillars
          </h3>
          <ul className="space-y-3 text-xs text-stone-700 dark:text-stone-300">
            <li className="leading-relaxed">
              <strong className="text-stone-900 dark:text-stone-100">1. Administrative judgment is the gameplay:</strong> Reading, counting, reconciling, and deciding are central. You solve problems, not repeat answers.
            </li>
            <li className="leading-relaxed">
              <strong className="text-stone-900 dark:text-stone-100">2. Documents have consequences:</strong> An incomplete or inaccurate record distorts inventories, misassigns blame, or creates invalid obligations.
            </li>
            <li className="leading-relaxed">
              <strong className="text-stone-900 dark:text-stone-100">3. Optional work enriches; mandatory Works advance:</strong> Assignments and Challenges offer agency and pay without gating historical progress.
            </li>
            <li className="leading-relaxed">
              <strong className="text-stone-900 dark:text-stone-100">4. Time Blocks & Free Thinking:</strong> 4 daily time blocks (Morning, Midday, Afternoon, Evening). Reading acquired evidence is 0 blocks (Free), while visits, audits, and assignments consume time blocks.
            </li>
          </ul>
        </div>

        {/* Personal Economy */}
        <div className="bg-white dark:bg-stone-900 border border-[#D6CEBE] dark:border-stone-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-serif font-bold text-[#2B1B17] dark:text-stone-100 flex items-center gap-2">
            <Coins className="w-5 h-5 text-[#C86D33]" />
            Personal Economy & Resources
          </h3>
          <ul className="space-y-3 text-xs text-stone-700 dark:text-stone-300">
            <li className="leading-relaxed">
              <strong className="text-amber-700 dark:text-amber-400">Silver Coins:</strong> Personal money for purchases, services, obligations, savings, and debts.
            </li>
            <li className="leading-relaxed">
              <strong className="text-orange-800 dark:text-orange-400">Bread Rations:</strong> Direct daily sustenance. Deducted during daily settlement.
            </li>
            <li className="leading-relaxed">
              <strong className="text-amber-900 dark:text-amber-300">Beer Jugs:</strong> Hospitality, social obligations, and institutional exchanges.
            </li>
            <li className="leading-relaxed">
              <strong className="text-stone-900 dark:text-stone-100">Grain Note:</strong> Grain is a world and institutional commodity, never a personal player wallet resource.
            </li>
          </ul>
        </div>

        {/* Career Ranks */}
        <div className="bg-white dark:bg-stone-900 border border-[#D6CEBE] dark:border-stone-800 rounded-2xl p-6 space-y-4 md:col-span-2">
          <h3 className="text-lg font-serif font-bold text-[#2B1B17] dark:text-stone-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-[#C86D33]" />
            Career Ranks & Professional Progression
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 bg-[#FAF7F0] dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
              <div className="font-bold text-[#C86D33]">Rank 1 (0 XP)</div>
              <div className="text-stone-900 dark:text-stone-100 font-serif font-bold mt-1">Apprentice Scribe</div>
              <div className="text-[11px] text-stone-500 mt-1">Novice Commissions</div>
            </div>
            <div className="p-3 bg-[#FAF7F0] dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
              <div className="font-bold text-[#C86D33]">Rank 2 (2,000 XP)</div>
              <div className="text-stone-900 dark:text-stone-100 font-serif font-bold mt-1">Junior Scribe</div>
              <div className="text-[11px] text-stone-500 mt-1">Adept Commissions</div>
            </div>
            <div className="p-3 bg-[#FAF7F0] dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
              <div className="font-bold text-[#C86D33]">Rank 3 (7,500 XP)</div>
              <div className="text-stone-900 dark:text-stone-100 font-serif font-bold mt-1">Journeyman Scribe</div>
              <div className="text-[11px] text-stone-500 mt-1">Expert Commissions</div>
            </div>
            <div className="p-3 bg-[#FAF7F0] dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
              <div className="font-bold text-[#C86D33]">Rank 4 (20,000 XP)</div>
              <div className="text-stone-900 dark:text-stone-100 font-serif font-bold mt-1">Senior Scribe</div>
              <div className="text-[11px] text-stone-500 mt-1">Perilous Commissions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
