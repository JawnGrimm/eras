import React, { useState, useEffect } from 'react';
import { StorehouseWorkState, EvidenceItem, PlayerProfile, NpcRelation } from '../types';
import { createStorehouseEvidence, createTestCaseC1, createTestCaseC2, createInitialNpcs } from '../data/initialData';
import { ShieldCheck, BookOpen, CheckCircle2, AlertCircle, ArrowRight, FileText, Scale, Zap, Users, Clock } from 'lucide-react';

interface StorehouseReckoningProps {
  player: PlayerProfile;
  workState: StorehouseWorkState;
  onUpdateWorkState: (newState: Partial<StorehouseWorkState>) => void;
  onConsumeBlocks: (amount: number) => void;
  onAwardXp: (careerXp: number, historicalXp: number) => void;
  onShowToast: (msg: string) => void;
}

export const StorehouseReckoning: React.FC<StorehouseReckoningProps> = ({
  player,
  workState,
  onUpdateWorkState,
  onConsumeBlocks,
  onAwardXp,
  onShowToast,
}) => {
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>(() => {
    return createStorehouseEvidence().map((e) => ({
      ...e,
      examined: workState.examinedEvidence.includes(e.id),
    }));
  });
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);
  const [testC1, setTestC1] = useState<EvidenceItem>(createTestCaseC1());
  const [testC2, setTestC2] = useState<EvidenceItem>(createTestCaseC2());
  const [npcs] = useState<NpcRelation[]>(createInitialNpcs());
  const [activeNpc, setActiveNpc] = useState<NpcRelation | null>(null);

  // Register construction state for Stage B
  const [designChoice, setDesignChoice] = useState<'movement_ledger' | 'compact_balance' | null>(workState.registerDesign);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setEvidenceList((prev) =>
      prev.map((e) => ({
        ...e,
        examined: workState.examinedEvidence.includes(e.id),
      }))
    );
  }, [workState.examinedEvidence]);

  useEffect(() => {
    setDesignChoice(workState.registerDesign);
  }, [workState.registerDesign]);

  const handleExamineEvidence = (id: string) => {
    const item = evidenceList.find((e) => e.id === id);
    if (!item || item.examined) return;

    // Free thinking: reading held evidence costs 0 AP
    const updated = evidenceList.map((e) => (e.id === id ? { ...e, examined: true } : e));
    setEvidenceList(updated);
    setSelectedEvidence(updated.find((e) => e.id === id) || null);

    const examinedIds = updated.filter((e) => e.examined).map((e) => e.id);
    onUpdateWorkState({ examinedEvidence: examinedIds });
    onShowToast(`Examined ${item.code} (${item.title}) — Free thinking (0 AP).`);
  };

  const handleSelectDesign = (choice: 'movement_ledger' | 'compact_balance') => {
    const cost = choice === 'movement_ledger' ? 2 : 1;
    if (player.blocksRemaining < cost) {
      onShowToast(`Configuring register requires ${cost} AP.`);
      return;
    }
    onConsumeBlocks(cost);
    setDesignChoice(choice);
    onUpdateWorkState({ registerDesign: choice, registerConfigured: true, stage: 'C_TEST' });
    setSuccessMessage(`Successfully configured and drafted the ${choice === 'movement_ledger' ? 'Movement Ledger' : 'Compact Balance Register'}. Proceeding to Stage C: Testing against unseen transactions.`);
  };

  const handleRunTestC1 = () => {
    if (player.blocksRemaining < 1) {
      onShowToast('Running test requires 1 AP.');
      return;
    }
    onConsumeBlocks(1);
    setTestC1({ ...testC1, examined: true });
    onUpdateWorkState({ testC1Passed: true });
    setSuccessMessage('Test C-1 Passed: Held stock release of 5 measures recorded correctly without altering total physical stock.');
  };

  const handleRunTestC2 = () => {
    if (player.blocksRemaining < 1) {
      onShowToast('Running test requires 1 AP.');
      return;
    }
    onConsumeBlocks(1);
    setTestC2({ ...testC2, examined: true });
    onUpdateWorkState({ testC2Passed: true });
    setSuccessMessage('Test C-2 Passed: Short delivery discrepancy (20 dispatched vs 18 received) recorded with source provenance and no unsupported blame.');
  };

  const handleProceedToAdopt = () => {
    onUpdateWorkState({ stage: 'D_ADOPT' });
  };

  const handleFinalAdoption = (type: 'movement_ledger' | 'compact_balance' | 'provisional') => {
    if (player.blocksRemaining < 1) {
      onShowToast('Finalizing adoption requires 1 AP.');
      return;
    }
    onConsumeBlocks(1);
    onUpdateWorkState({
      stage: 'COMPLETED',
      adopted: true,
      adoptionType: type,
    });
    onAwardXp(500, 15000);
    setSuccessMessage('Congratulations! The Storehouse Reckoning is successfully completed and adopted by the Senior Scribe and Steward. Historical Progress XP awarded!');
  };

  const examinedCount = evidenceList.filter((e) => e.examined).length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fadeIn">
      {/* Title & Stage Banner */}
      <div className="bg-[#FAF7F0] dark:bg-stone-900 border border-[#D6CEBE] dark:border-stone-800 rounded-2xl p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-[#C86D33]">Era I Mandatory Work</span>
            <h2 className="text-3xl font-serif font-bold text-[#2B1B17] dark:text-stone-100 mt-1">
              The Storehouse Reckoning (Uruk c. 3200 BCE)
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-300 mt-2 max-w-3xl leading-relaxed">
              Investigate the discrepancy between intake tallies and current storehouse count, design a durable ledger, test it against unseen transactions, and secure institutional adoption.
            </p>
          </div>

          <div className="bg-white dark:bg-stone-800 border border-[#D6CEBE] dark:border-stone-700 rounded-xl p-4 shrink-0 space-y-1">
            <div className="text-xs font-mono text-stone-500">Current Stage</div>
            <div className="text-base font-serif font-bold text-[#C86D33]">
              {workState.stage === 'A_INVESTIGATE' && 'Stage A: Investigate Discrepancy'}
              {workState.stage === 'B_DESIGN' && 'Stage B: Design Register'}
              {workState.stage === 'C_TEST' && 'Stage C: Test Unseen Transactions'}
              {workState.stage === 'D_ADOPT' && 'Stage D: Audit & Adoption'}
              {workState.stage === 'COMPLETED' && 'Work Completed & Adopted'}
            </div>
          </div>
        </div>

        {successMessage && (
          <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
      </div>

      {/* Stage Navigation Stepper */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border ${workState.stage === 'A_INVESTIGATE' ? 'bg-[#C86D33] text-white border-[#C86D33]' : 'bg-white dark:bg-stone-900 border-[#D6CEBE] dark:border-stone-800 text-stone-700 dark:text-stone-300'}`}>
          <div className="text-xs font-mono opacity-80">Stage A</div>
          <div className="font-serif font-bold mt-0.5">Evidence & Discrepancy</div>
          <div className="text-xs mt-2 opacity-90">{examinedCount} / 7 items examined</div>
        </div>

        <div className={`p-4 rounded-xl border ${workState.stage === 'B_DESIGN' ? 'bg-[#C86D33] text-white border-[#C86D33]' : 'bg-white dark:bg-stone-900 border-[#D6CEBE] dark:border-stone-800 text-stone-700 dark:text-stone-300'}`}>
          <div className="text-xs font-mono opacity-80">Stage B</div>
          <div className="font-serif font-bold mt-0.5">Register Design</div>
          <div className="text-xs mt-2 opacity-90">{workState.registerConfigured ? 'Designed' : 'Pending Stage A'}</div>
        </div>

        <div className={`p-4 rounded-xl border ${workState.stage === 'C_TEST' ? 'bg-[#C86D33] text-white border-[#C86D33]' : 'bg-white dark:bg-stone-900 border-[#D6CEBE] dark:border-stone-800 text-stone-700 dark:text-stone-300'}`}>
          <div className="text-xs font-mono opacity-80">Stage C</div>
          <div className="font-serif font-bold mt-0.5">Test Unseen Transactions</div>
          <div className="text-xs mt-2 opacity-90">{workState.testC1Passed && workState.testC2Passed ? 'Tests Passed' : 'Pending Design'}</div>
        </div>

        <div className={`p-4 rounded-xl border ${workState.stage === 'D_ADOPT' || workState.stage === 'COMPLETED' ? 'bg-[#C86D33] text-white border-[#C86D33]' : 'bg-white dark:bg-stone-900 border-[#D6CEBE] dark:border-stone-800 text-stone-700 dark:text-stone-300'}`}>
          <div className="text-xs font-mono opacity-80">Stage D</div>
          <div className="font-serif font-bold mt-0.5">Audit & Adoption</div>
          <div className="text-xs mt-2 opacity-90">{workState.adopted ? 'Adopted' : 'Pending Tests'}</div>
        </div>
      </div>

      {/* STAGE A CONTENT: EVIDENCE DOSSIER */}
      {workState.stage === 'A_INVESTIGATE' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-serif font-bold text-[#2B1B17] dark:text-stone-100">
                Evidence Dossier & Source Examination (Free Thinking)
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                Reading held evidence is <strong>0 AP (Free Thinking)</strong>. Examine at least 4 core items before designing your register.
              </p>
            </div>
            <button
              onClick={() => {
                if (examinedCount < 4) {
                  onShowToast('Please examine at least 4 core evidence items before proceeding to Register Design.');
                  return;
                }
                onUpdateWorkState({ stage: 'B_DESIGN' });
              }}
              disabled={examinedCount < 4}
              className="px-5 py-2.5 text-xs font-medium text-white bg-[#C86D33] hover:bg-[#b05c28] rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <span>Proceed to Stage B: Design Register</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {evidenceList.map((item) => (
              <div
                key={item.id}
                className={`bg-white dark:bg-stone-900 border rounded-2xl p-6 shadow-xs flex flex-col justify-between ${
                  item.examined ? 'border-emerald-300 dark:border-emerald-800' : 'border-[#D6CEBE] dark:border-stone-800'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-[#FAF7F0] dark:bg-stone-800 text-[#C86D33]">
                      {item.code}
                    </span>
                    <span className="text-xs text-emerald-700 dark:text-emerald-400 font-mono">Free (0 AP)</span>
                  </div>

                  <h4 className="text-base font-serif font-bold text-[#2B1B17] dark:text-stone-100">
                    {item.title}
                  </h4>
                  <div className="text-xs text-stone-500 font-medium">Source: {item.source}</div>

                  {item.examined ? (
                    <p className="text-xs text-stone-700 dark:text-stone-300 bg-[#FAF7F0] dark:bg-stone-800/80 p-3.5 rounded-xl leading-relaxed border border-[#D6CEBE]/50">
                      {item.content}
                    </p>
                  ) : (
                    <p className="text-xs text-stone-400 italic">
                      [Sealed document. Click examine to read freely.]
                    </p>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                  <span className="text-xs text-stone-500">
                    {item.examined ? 'Examined & Held' : 'Unread'}
                  </span>
                  {!item.examined && (
                    <button
                      onClick={() => handleExamineEvidence(item.id)}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-[#2B1B17] dark:bg-stone-100 dark:text-stone-900 hover:bg-[#C86D33] rounded-lg transition-colors"
                    >
                      Examine (Free)
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STAGE B CONTENT: REGISTER DESIGN */}
      {workState.stage === 'B_DESIGN' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-serif font-bold text-[#2B1B17] dark:text-stone-100">
              Stage B: Choose Register Structure
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
              Select a register architecture that preserves provenance and can represent changing stock conditions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`bg-white dark:bg-stone-900 border rounded-2xl p-6 space-y-4 ${designChoice === 'compact_balance' ? 'border-[#C86D33] ring-1 ring-[#C86D33]/30' : 'border-[#D6CEBE]'}`}>
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-serif font-bold text-[#2B1B17] dark:text-stone-100">Compact Balance Register</h4>
                <span className="text-xs font-mono text-stone-500">1 AP</span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                Fast to enter. Records opening balance, receipt, usable/held totals, issue, and closing balance. However, later status changes require explanatory notes.
              </p>
              <button
                onClick={() => handleSelectDesign('compact_balance')}
                className="w-full py-2.5 text-xs font-medium text-white bg-[#2B1B17] hover:bg-[#C86D33] rounded-lg transition-colors"
              >
                Select Compact Balance (1 AP)
              </button>
            </div>

            <div className={`bg-white dark:bg-stone-900 border rounded-2xl p-6 space-y-4 ${designChoice === 'movement_ledger' ? 'border-[#C86D33] ring-1 ring-[#C86D33]/30' : 'border-[#D6CEBE]'}`}>
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-serif font-bold text-[#2B1B17] dark:text-stone-100">Movement Ledger (Recommended)</h4>
                <span className="text-xs font-mono text-[#C86D33]">2 AP</span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                Records each movement or status change as a dated, sourced line with quantity, status, authority, location, and responsible recorder. Superior audit trail.
              </p>
              <button
                onClick={() => handleSelectDesign('movement_ledger')}
                className="w-full py-2.5 text-xs font-medium text-white bg-[#C86D33] hover:bg-[#b05c28] rounded-lg transition-colors"
              >
                Select Movement Ledger (2 AP)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STAGE C CONTENT: UNSEEN TRANSACTION TESTS */}
      {workState.stage === 'C_TEST' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-serif font-bold text-[#2B1B17] dark:text-stone-100">
                Stage C: Test Register Against Unseen Transactions
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                Prove that your register structure handles held stock release and short delivery without creating false receipts.
              </p>
            </div>
            <button
              onClick={() => {
                if (!workState.testC1Passed || !workState.testC2Passed) {
                  onShowToast('Please complete both test transactions C-1 and C-2.');
                  return;
                }
                handleProceedToAdopt();
              }}
              disabled={!workState.testC1Passed || !workState.testC2Passed}
              className="px-5 py-2.5 text-xs font-medium text-white bg-[#C86D33] hover:bg-[#b05c28] rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <span>Proceed to Stage D: Adoption</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Test C-1 */}
            <div className="bg-white dark:bg-stone-900 border border-[#D6CEBE] dark:border-stone-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-[#FAF7F0] dark:bg-stone-800 text-[#C86D33]">Test C-1</span>
                <span className="text-xs text-emerald-600 font-semibold">{workState.testC1Passed ? 'Passed' : 'Pending'}</span>
              </div>
              <h4 className="text-base font-serif font-bold text-[#2B1B17] dark:text-stone-100">{testC1.title}</h4>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">{testC1.content}</p>
              {!workState.testC1Passed && (
                <button
                  onClick={handleRunTestC1}
                  className="w-full py-2 text-xs font-medium text-white bg-[#2B1B17] hover:bg-[#C86D33] rounded-lg transition-colors"
                >
                  Run Test C-1 Entry (1 AP)
                </button>
              )}
            </div>

            {/* Test C-2 */}
            <div className="bg-white dark:bg-stone-900 border border-[#D6CEBE] dark:border-stone-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-[#FAF7F0] dark:bg-stone-800 text-[#C86D33]">Test C-2</span>
                <span className="text-xs text-emerald-600 font-semibold">{workState.testC2Passed ? 'Passed' : 'Pending'}</span>
              </div>
              <h4 className="text-base font-serif font-bold text-[#2B1B17] dark:text-stone-100">{testC2.title}</h4>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">{testC2.content}</p>
              {!workState.testC2Passed && (
                <button
                  onClick={handleRunTestC2}
                  className="w-full py-2 text-xs font-medium text-white bg-[#2B1B17] hover:bg-[#C86D33] rounded-lg transition-colors"
                >
                  Run Test C-2 Entry (1 AP)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STAGE D CONTENT: AUDIT & ADOPTION */}
      {workState.stage === 'D_ADOPT' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-serif font-bold text-[#2B1B17] dark:text-stone-100">
              Stage D: Audit & Institutional Adoption
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
              Present your tested register to the Senior Scribe and Storehouse Steward for formal institutional approval.
            </p>
          </div>

          <div className="bg-white dark:bg-stone-900 border border-[#D6CEBE] dark:border-stone-800 rounded-2xl p-8 space-y-6 max-w-2xl">
            <h4 className="text-lg font-serif font-bold text-[#2B1B17] dark:text-stone-100">
              Final Institutional Ruling
            </h4>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              Your register has successfully preserved intake vs recount snapshots, accounted for the 30-measure brewing issue, and passed both unseen transaction tests (C-1 and C-2) without inventing false losses or unjustified blame.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => handleFinalAdoption('movement_ledger')}
                className="flex-1 py-3 text-xs font-medium text-white bg-[#C86D33] hover:bg-[#b05c28] rounded-xl transition-colors shadow-sm"
              >
                Secure Full Adoption (1 AP)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETED WORK BANNER */}
      {workState.stage === 'COMPLETED' && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-emerald-900 dark:text-emerald-100">
            Era I Work Complete: The Storehouse Reckoning
          </h3>
          <p className="text-sm text-emerald-800 dark:text-emerald-300 max-w-xl mx-auto leading-relaxed">
            You have successfully established a durable storehouse register. Your contribution has earned <strong className="font-mono">15,000 Historical Progress XP</strong> and <strong className="font-mono">500 Career XP</strong>. You are ready to advance your career and prepare for Era II!
          </p>
        </div>
      )}
    </div>
  );
};
