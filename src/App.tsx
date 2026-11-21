import React, { useState, useEffect } from 'react';
import { PlayerProfile, Assignment, StorehouseWorkState } from './types';
import { createInitialPlayer, createInitialAssignments } from './data/initialData';
import { CareerLogEntry, createCareerLog, appendCareerLogEntry } from './engine/CareerWorkLog';
import { ChallengeOpportunity, createInitialChallenges, evaluateChallenges } from './engine/ChallengeDirector';
import { ProfessionalReputation, createInitialReputation } from './engine/CharacterSystem';
import { Header } from './components/Header';
import { WorkdayHub } from './components/WorkdayHub';
import { AssignmentBoard } from './components/AssignmentBoard';
import { StorehouseReckoning } from './components/StorehouseReckoning';
import { CareerJournalModal } from './components/CareerJournalModal';
import { CodexModal } from './components/CodexModal';
import { CheckCircle2, X } from 'lucide-react';
import { loadGameState, saveGameState, calculateProvision } from './engine/Engine';

export default function App() {
  // LocalStorage state persistence
  const [player, setPlayer] = useState<PlayerProfile>(() => {
    const saved = loadGameState<Partial<PlayerProfile> & Record<string, unknown>>('scribe_player');
    if (!saved) return createInitialPlayer();

    const parsed = { ...saved } as PlayerProfile & Record<string, unknown>;
    if (parsed.actionPointsPerDay !== 6) {
      // Preserve AP already spent when migrating a legacy four-block Workday.
      const legacyRemaining = typeof parsed.blocksRemaining === 'number'
        ? Math.max(0, Math.min(4, parsed.blocksRemaining))
        : 4;
      const spentToday = 4 - legacyRemaining;
      parsed.blocksRemaining = Math.max(0, 6 - spentToday);
      parsed.currentBlock = 7 - parsed.blocksRemaining;
      parsed.actionPointsPerDay = 6;
    }
    parsed.currentBlock = Math.max(1, Math.min(7, parsed.currentBlock || 1));
    parsed.blocksRemaining = Math.max(0, Math.min(6, parsed.blocksRemaining ?? 6));
    parsed.workApSpentToday = Math.max(0, parsed.workApSpentToday ?? 0);
    parsed.workingLate = parsed.workingLate || false;
    delete parsed.dailyAp;
    delete parsed.maxAp;
    return parsed;
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = loadGameState<Assignment[]>('scribe_assignments');
    if (saved) {
      return saved.map((assignment) => ({
        ...assignment,
        blockCost: assignment.blockCost ?? (assignment as Assignment & { apCost?: number }).apCost ?? 1,
      }));
    }
    return createInitialAssignments();
  });

  const [workLog, setWorkLog] = useState<CareerLogEntry[]>(() => {
    const saved = loadGameState<CareerLogEntry[]>('scribe_worklog');
    return saved ?? createCareerLog();
  });

  const [challenges, setChallenges] = useState<ChallengeOpportunity[]>(() => {
    const saved = loadGameState<ChallengeOpportunity[]>('scribe_challenges');
    return saved ?? createInitialChallenges();
  });

  const [reputation, setReputation] = useState<ProfessionalReputation>(() => {
    const saved = loadGameState<ProfessionalReputation>('scribe_reputation');
    return saved ?? createInitialReputation();
  });

  const [workState, setWorkState] = useState<StorehouseWorkState>(() => {
    const saved = loadGameState<StorehouseWorkState>('scribe_workstate');
    return saved
      ? saved
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
    saveGameState('scribe_player', player);
  }, [player]);

  useEffect(() => {
    saveGameState('scribe_assignments', assignments);
  }, [assignments]);

  useEffect(() => {
    saveGameState('scribe_workstate', workState);
  }, [workState]);

  useEffect(() => {
    saveGameState('scribe_worklog', workLog);
  }, [workLog]);

  useEffect(() => {
    saveGameState('scribe_challenges', challenges);
  }, [challenges]);

  // Remove the temporary event-by-event Challenge journal from earlier builds.
  useEffect(() => {
    localStorage.removeItem('scribe_journal_events');
  }, []);

  useEffect(() => {
    saveGameState('scribe_reputation', reputation);
  }, [reputation]);

  const handleConsumeBlocks = (amount: number, isWorkAction = false) => {
    setPlayer((prev) => {
      const spent = Math.max(0, Math.min(prev.blocksRemaining, amount));
      return {
        ...prev,
        blocksRemaining: Math.max(0, prev.blocksRemaining - spent),
        currentBlock: Math.min(7, prev.currentBlock + spent),
        workApSpentToday: (prev.workApSpentToday ?? 0) + (isWorkAction ? spent : 0),
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
      showToast('Not enough AP remaining today to complete this commission.');
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

    // Append immutable entry to Career Work Log
    const newLog = appendCareerLogEntry(workLog, {
      assignmentId: assignment.id,
      title: assignment.title,
      employer: assignment.employer,
      npcsInvolved: [assignment.employer.split(' ')[0]],
      commodity: assignment.title.toLowerCase().includes('wool') ? 'Wool' : assignment.title.toLowerCase().includes('barley') ? 'Barley' : 'Silver/General',
      documentType: 'Certified Reed-Stylus Clay Tablet',
      location: 'E-anna District Scriptorium',
      category: assignment.tier,
      activity: assignment.description,
      decisionsMade: ['Verified quantities against official seal', 'Certified document in canonical script'],
      outcome: 'Successfully audited and sealed. Commission accepted by employer.',
      silverEarned: assignment.rewardSilver,
      careerXpEarned: assignment.rewardCareerXp,
      dateString: player.dateString,
      dayNumber: player.currentDay,
      characterName: player.name,
    });
    setWorkLog(newLog);

    // Evaluate Challenge Director for emergent narrative opportunities
    const updatedChallenges = evaluateChallenges(challenges, newLog, player.currentDay);
    setChallenges(updatedChallenges);
    const newlyOfferedChallenges = updatedChallenges.filter(
      (challenge, idx) => challenge.status === 'offered' && challenges[idx]?.status === 'candidate'
    );
    if (newlyOfferedChallenges.length > 0) {
      showToast('New emergent challenge unlocked in Career & Challenges based on your professional history!');
    } else {
      showToast(`Commission completed! Earned +${assignment.rewardSilver} silver and +${assignment.rewardCareerXp} Career XP.`);
    }
  };

  const handleAcceptChallenge = (id: string) => {
    const challenge = challenges.find((c) => c.id === id);
    if (!challenge || challenge.status !== 'offered') return;

    setChallenges((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'accepted' } : c)));
    showToast('Emergent challenge accepted. Review requirements and allocate AP.');
  };

  const handleCompleteChallenge = (id: string) => {
    const chal = challenges.find((c) => c.id === id);
    if (!chal || chal.status !== 'accepted') return;
    if (player.blocksRemaining < chal.blockCost) {
      showToast('Not enough AP remaining today to complete this challenge.');
      return;
    }
    handleConsumeBlocks(chal.blockCost);
    setChallenges((prev) => prev.map((c) => (c.id === id ? {
      ...c,
      status: 'completed',
      completedDay: player.currentDay,
      completedDate: player.dateString,
      completedBy: player.name,
    } : c)));
    setPlayer((prev) => ({
      ...prev,
      silver: prev.silver + chal.rewardSilver,
    }));
    handleAwardXp(chal.rewardCareerXp, 0);
    setReputation((prev) => ({
      ...prev,
      competence: Math.min(100, prev.competence + 5),
      judgment: Math.min(100, prev.judgment + 5),
    }));
    showToast(`Challenge successfully resolved! +${chal.rewardSilver} silver, +${chal.rewardCareerXp} Career XP, and reputation increased.`);
  };

  const handleDeclineChallenge = (id: string) => {
    const challenge = challenges.find((c) => c.id === id);
    if (!challenge || challenge.status !== 'offered') return;

    setChallenges((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'declined' } : c)));
    showToast('Challenge opportunity declined.');
  };

  const handleCancelAssignment = (id: string) => {
    if (player.blocksRemaining < 1) {
      showToast('Not enough AP to process cancellation.');
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
      showToast('Not enough AP remaining today.');
      return;
    }
    handleConsumeBlocks(1);
    handleAwardXp(15, 0);
    showToast('Studied scribal metrology and precedents for several hours. +15 Career XP gained.');
  };

  const handleRest = () => {
    if (player.blocksRemaining < 1) {
      showToast('Not enough AP remaining today.');
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
    if (player.workingLate) {
      showToast('You have already worked overtime today. Tomorrow morning first AP will be skipped.');
      return;
    }

    setPlayer((prev) => {
      // Defend against repeat clicks before the UI has re-rendered.
      if (prev.workingLate) return prev;
      return {
        ...prev,
        stress: Math.min(100, prev.stress + 5),
        workingLate: true,
        blocksRemaining: Math.max(0, prev.blocksRemaining - 1),
        currentBlock: Math.min(7, prev.currentBlock + 1),
      };
    });
    showToast('Worked late into the night. +5% Stress gained. Tomorrow morning first AP will be skipped.');
  };

  const handleEndDay = () => {
    const settlement = calculateProvision(workState.stage !== 'COMPLETED', player.workApSpentToday ?? 0);

    setPlayer((prev) => {
      const nextDayWorkingLate = prev.workingLate;
      return {
        ...prev,
        currentDay: prev.currentDay + 1,
        dateString: `Day ${prev.currentDay + 1}, Early Season of Inundation (c. 3200 BCE)`,
        currentBlock: nextDayWorkingLate ? 2 : 1,
        blocksRemaining: nextDayWorkingLate ? 5 : 6,
        actionPointsPerDay: 6,
        workApSpentToday: 0,
        bread: Math.max(0, prev.bread + settlement.breadChange),
        workingLate: false,
      };
    });

    showToast(`Daily Settlement: Advanced to Day ${player.currentDay + 1}. Time blocks reset.`);
  };

  const handleResetGame = () => {
    localStorage.clear();
    setPlayer(createInitialPlayer());
    setAssignments(createInitialAssignments());
    setWorkLog(createCareerLog());
    setChallenges(createInitialChallenges());
    setReputation(createInitialReputation());
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
        {activeTab === 'journal' && (
          <CareerJournalModal
            workLog={workLog}
            challenges={challenges}
            reputation={reputation}
            onAcceptChallenge={handleAcceptChallenge}
            onCompleteChallenge={handleCompleteChallenge}
            onDeclineChallenge={handleDeclineChallenge}
          />
        )}
        {activeTab === 'work' && (
          <StorehouseReckoning
            player={player}
            workState={workState}
            onUpdateWorkState={(newState) => setWorkState((prev) => ({ ...prev, ...newState }))}
            onConsumeBlocks={(amount) => handleConsumeBlocks(amount, true)}
            onAwardXp={handleAwardXp}
            onShowToast={showToast}
          />
        )}
        {activeTab === 'codex' && <CodexModal onResetGame={handleResetGame} />}
      </main>
    </div>
  );
}
