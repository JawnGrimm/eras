import React, { useState, useEffect } from 'react';
import { PlayerProfile, Assignment, StorehouseWorkState } from './types';
import { initialPlayer, initialAssignments } from './data/initialData';
import { Header } from './components/Header';
import { WorkdayHub } from './components/WorkdayHub';
import { AssignmentBoard } from './components/AssignmentBoard';
import { StorehouseReckoning } from './components/StorehouseReckoning';
import { CodexModal } from './components/CodexModal';
import { CheckCircle2, X } from 'lucide-react';

export default function App() {
  // LocalStorage state persistence
  const [player, setPlayer] = useState<PlayerProfile>(() => {
    const saved = localStorage.getItem('scribe_player');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.dailyAp !== undefined) {
        // Migrate from AP to Time Blocks
        delete parsed.dailyAp;
        delete parsed.maxAp;
        parsed.currentBlock = parsed.currentBlock || 1;
        parsed.blocksRemaining = parsed.blocksRemaining !== undefined ? parsed.blocksRemaining : 4;
        parsed.workingLate = parsed.workingLate || false;
      }
      return parsed;
    }
    return initialPlayer;
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem('scribe_assignments');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((a: any) => ({
        ...a,
        blockCost: a.blockCost !== undefined ? a.blockCost : (a.apCost ? Math.ceil(a.apCost / 2) : 1),
      }));
    }
    return initialAssignments;
  });

  const [workState, setWorkState] = useState<StorehouseWorkState>(() => {
    const saved = localStorage.getItem('scribe_workstate');
    return saved
      ? JSON.parse(saved)
      : {
          stage: 'A_INVESTIGATE',
          examinedEvidence: [],
          registerDesign: null,
          registerConfigured: false,
          testC1Passed: false,
          testC2Passed: false,
          auditCompleted: false,
          adopted: false,
          adoptionType: null,
        };
  });

  const [activeTab, setActiveTab] = useState<string>('hub');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  useEffect(() => {
    localStorage.setItem('scribe_player', JSON.stringify(player));
  }, [player]);

  useEffect(() => {
    localStorage.setItem('scribe_assignments', JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem('scribe_workstate', JSON.stringify(workState));
  }, [workState]);

  const handleConsumeBlocks = (amount: number) => {
    setPlayer((prev) => {
      const newBlocks = Math.max(0, prev.blocksRemaining - amount);
      const newCurrentBlock = Math.min(4, prev.currentBlock + amount);
      return {
        ...prev,
        blocksRemaining: newBlocks,
        currentBlock: newCurrentBlock,
      };
    });
  };

  const handleAwardXp = (careerXp: number, historicalXp: number) => {
    setPlayer((prev) => {
      const newCareerXp = prev.careerXp + careerXp;
      const newHistoricalXp = prev.historicalXp + historicalXp;
      let newRank = prev.rank;
      let newTitle = prev.title;

      if (newCareerXp >= 20000) {
        newRank = 4;
        newTitle = 'Senior Scribe';
      } else if (newCareerXp >= 7500) {
        newRank = 3;
        newTitle = 'Journeyman Scribe';
      } else if (newCareerXp >= 2000) {
        newRank = 2;
        newTitle = 'Junior Scribe';
      }

      return {
        ...prev,
        careerXp: newCareerXp,
        historicalXp: newHistoricalXp,
        rank: newRank,
        rankTitle: newTitle,
      };
    });
  };

  const handleAcceptAssignment = (id: string) => {
    const activeCount = assignments.filter((a) => a.status === 'active').length;
    if (activeCount >= 2) {
      showToast('You may hold at most two active commitments at once.');
      return;
    }
    setAssignments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'active' } : a))
    );
    showToast('Commission accepted successfully.');
  };

  const handleCompleteAssignment = (id: string) => {
    const assignment = assignments.find((a) => a.id === id);
    if (!assignment) return;

    if (player.blocksRemaining < assignment.blockCost) {
      showToast('Not enough time blocks remaining today to complete this commission.');
      return;
    }

    handleConsumeBlocks(assignment.blockCost);
    setAssignments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'completed' } : a))
    );
    setPlayer((prev) => ({
      ...prev,
      silver: prev.silver + assignment.rewardSilver,
    }));
    handleAwardXp(assignment.rewardCareerXp, 0);
    showToast(`Commission completed! Earned +${assignment.rewardSilver} silver and +${assignment.rewardCareerXp} Career XP.`);
  };

  const handleCancelAssignment = (id: string) => {
    if (player.blocksRemaining < 1) {
      showToast('Not enough time blocks to process cancellation.');
      return;
    }
    handleConsumeBlocks(1);
    setAssignments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'available' } : a))
    );
    showToast('Commission cancelled (-1 block).');
  };

  const handleStudy = () => {
    if (player.blocksRemaining < 1) {
      showToast('Not enough time blocks remaining today.');
      return;
    }
    handleConsumeBlocks(1);
    handleAwardXp(15, 0);
    showToast('Studied scribal metrology and precedents for several hours. +15 Career XP gained.');
  };

  const handleRest = () => {
    if (player.blocksRemaining < 1) {
      showToast('Not enough time blocks remaining today.');
      return;
    }
    handleConsumeBlocks(1);
    setPlayer((prev) => ({
      ...prev,
      stress: Math.max(0, prev.stress - 10),
    }));
    showToast('Rested and recovered composure. Stress reduced by 10%.');
  };

  const handleWorkLate = () => {
    setPlayer((prev) => ({
      ...prev,
      stress: Math.min(100, prev.stress + 5),
      workingLate: true,
      blocksRemaining: Math.max(0, prev.blocksRemaining - 1),
    }));
    showToast('Worked late into the night. +5% Stress gained. Tomorrow morning block 1 will be skipped.');
  };

  const handleEndDay = () => {
    const breadDeduction = 1;
    const workProvision = workState.stage !== 'COMPLETED' ? 1 : 0;
    const netBreadChange = workProvision - breadDeduction;

    setPlayer((prev) => {
      const nextDayWorkingLate = prev.workingLate;
      return {
        ...prev,
        currentDay: prev.currentDay + 1,
        dateString: `Day ${prev.currentDay + 1}, Early Season of Inundation (c. 3200 BCE)`,
        currentBlock: nextDayWorkingLate ? 2 : 1,
        blocksRemaining: nextDayWorkingLate ? 3 : 4,
        bread: Math.max(0, prev.bread + netBreadChange),
        workingLate: false,
      };
    });

    showToast(`Daily Settlement: Advanced to Day ${player.currentDay + 1}. Time blocks reset.`);
  };

  const handleResetGame = () => {
    localStorage.clear();
    setPlayer(initialPlayer);
    setAssignments(initialAssignments);
    setWorkState({
      stage: 'A_INVESTIGATE',
      examinedEvidence: [],
      registerDesign: null,
      registerConfigured: false,
      testC1Passed: false,
      testC2Passed: false,
      auditCompleted: false,
      adopted: false,
      adoptionType: null,
    });
    setActiveTab('hub');
    showToast('Game reset successfully to Day 1 (Fresh Apprentice Save).');
  };

  return (
    <div className="min-h-screen bg-[#F4F1EA] dark:bg-[#120E0C] text-[#2B1B17] dark:text-stone-100 font-sans transition-colors relative">
      <Header
        player={player}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCodex={() => setActiveTab('codex')}
        onEndDay={handleEndDay}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2B1B17] dark:bg-stone-100 text-white dark:text-stone-900 px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-[#C86D33] shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-stone-400 hover:text-white dark:hover:text-stone-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <main className="pb-16">
        {activeTab === 'hub' && (
          <WorkdayHub
            player={player}
            workState={workState}
            onNavigateTab={setActiveTab}
            onStudy={handleStudy}
            onRest={handleRest}
            onResetGame={handleResetGame}
            onWorkLate={handleWorkLate}
          />
        )}
        {activeTab === 'assignments' && (
          <AssignmentBoard
            player={player}
            assignments={assignments}
            onAcceptAssignment={handleAcceptAssignment}
            onCompleteAssignment={handleCompleteAssignment}
            onCancelAssignment={handleCancelAssignment}
          />
        )}
        {activeTab === 'work' && (
          <StorehouseReckoning
            player={player}
            workState={workState}
            onUpdateWorkState={(newState) => setWorkState((prev) => ({ ...prev, ...newState }))}
            onConsumeBlocks={handleConsumeBlocks}
            onAwardXp={handleAwardXp}
            onShowToast={showToast}
          />
        )}
        {activeTab === 'codex' && <CodexModal onResetGame={handleResetGame} />}
      </main>
    </div>
  );
}
