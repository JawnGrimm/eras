import React, { useState } from 'react';
import { WorkDefinition } from '../engine/Engine';
import { PlayerProfile, StorehouseWorkState } from '../types';
import { ShieldCheck, BookOpen, CheckCircle2, ArrowRight, Clock, FileText } from 'lucide-react';

interface WorkRunnerProps {
  workDef: WorkDefinition;
  player: PlayerProfile;
  workState: StorehouseWorkState;
  onUpdateWorkState: (newState: Partial<StorehouseWorkState>) => void;
  onConsumeBlocks: (amount: number) => void;
  onAwardXp: (careerXp: number, historicalXp: number) => void;
  onShowToast: (msg: string) => void;
}

export const WorkRunner: React.FC<WorkRunnerProps> = ({
  workDef,
  player,
  workState,
  onUpdateWorkState,
  onConsumeBlocks,
  onAwardXp,
  onShowToast,
}) => {
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null);

  const examinedSet = new Set(workState.examinedEvidence);

  const handleExamineEvidence = (id: string) => {
    if (examinedSet.has(id)) return;
    const item = workDef.evidence.find((e) => e.id === id);
    if (!item) return;

    // Free thinking: 0 blocks
    const updated = [...workState.examinedEvidence, id];
    onUpdateWorkState({ examinedEvidence: updated });
    onShowToast(`Examined ${item.id} (${item.source}) — Free thinking (0 blocks).`);
  };

  const handleSelectDesignChoice = (choiceId: string, timeCost: number) => {
    if (player.blocksRemaining < timeCost) {
      onShowToast(`Configuring register requires ${timeCost} time block(s).`);
      return;
    }
    onConsumeBlocks(timeCost);
    onUpdateWorkState({
      registerDesign: choiceId as any,
      registerConfigured: true,
      stage: 'C_TEST',
    });
    onShowToast(`Successfully selected register design. Proceeding to Stage C: Testing cases.`);
  };

  const handleRunTestCase = (caseId: string) => {
    if (player.blocksRemaining < 1) {
      onShowToast('Running test case requires 1 time block.');
      return;
    }
    onConsumeBlocks(1);
    if (caseId === 'C-1') {
      onUpdateWorkState({ testC1Passed: true });
      onShowToast('Test C-1 Passed: Stock release handled correctly.');
    } else if (caseId === 'C-2') {
      onUpdateWorkState({ testC2Passed: true });
      onShowToast('Test C-2 Passed: Short delivery recorded with provenance.');
    }
  };

  const handleCompleteWork = () => {
    if (player.blocksRemaining < 1) {
      onShowToast('Finalizing adoption requires 1 time block.');
      return;
    }
    onConsumeBlocks(1);
    onUpdateWorkState({
      stage: 'COMPLETED',
      adopted: true,
    });
    onAwardXp(500, 15000);
    onShowToast('Work successfully completed and adopted! Historical Progress XP awarded.');
  };

  const getStageTitle = (stageId: string) => {
    const s = workDef.stages.find((st) => st.id === stageId);
    return s ? s.name : stageId;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fadeIn">
      {/* Title & Banner */}
      <div className="bg-[#FAF7F0] dark:bg-stone-900 border border-[#D6CEBE] dark:border-stone-800 rounded-2xl p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-[#C86D33]">Era {workDef.era} Mandatory Work</span>
            <h2 className="text-3xl font-serif font-bold text-[#2B1B17] dark:text-stone-100 mt-1">
              {workDef.title}
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-300 mt-2 max-w-3xl leading-relaxed">
              Data-driven Work execution powered by the generalized Scribe Engine. Investigate evidence, apply design choices, test cases, and secure adoption.
            </p>
          </div>

          <div className="bg-white dark:bg-stone-800 border border-[#D6CEBE] dark:border-stone-700 rounded-xl p-4 shrink-0 space-y-1">
            <div className="text-xs font-mono text-stone-500">Current Stage</div>
            <div className="text-base font-serif font-bold text-[#C86D33]">
              {workState.stage === 'A_INVESTIGATE' && 'Stage A: Investigate'}
              {workState.stage === 'B_DESIGN' && 'Stage B: Design Register'}
              {workState.stage === 'C_TEST' && 'Stage C: Test Cases'}
              {workState.stage === 'D_ADOPT' && 'Stage D: Audit & Adopt'}
              {workState.stage === 'COMPLETED' && 'Completed'}
            </div>
          </div>
        </div>
      </div>

      {/* Stage Navigation Stepper */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border ${workState.stage === 'A_INVESTIGATE' ? 'bg-[#C86D33] text-white border-[#C86D33]' : 'bg-white dark:bg-stone-900 border-[#D6CEBE] dark:border-stone-800 text-stone-700 dark:text-stone-300'}`}>
          <div className="text-xs font-mono opacity-80">Stage A</div>
          <div className="font-serif font-bold mt-0.5">Investigate</div>
          <div className="text-xs mt-2 opacity-90">{examinedSet.size} / {workDef.evidence.filter(e => e.visible_in_stage === 'A').length} items examined</div>
        </div>

        <div className={`p-4 rounded-xl border ${workState.stage === 'B_DESIGN' ? 'bg-[#C86D33] text-white border-[#C86D33]' : 'bg-white dark:bg-stone-900 border-[#D6CEBE] dark:border-stone-800 text-stone-700 dark:text-stone-300'}`}>
          <div className="text-xs font-mono opacity-80">Stage B</div>
          <div className="font-serif font-bold mt-0.5">Design Choice</div>
          <div className="text-xs mt-2 opacity-90">{workState.registerConfigured ? 'Designed' : 'Pending Stage A'}</div>
        </div>

        <div className={`p-4 rounded-xl border ${workState.stage === 'C_TEST' ? 'bg-[#C86D33] text-white border-[#C86D33]' : 'bg-white dark:bg-stone-900 border-[#D6CEBE] dark:border-stone-800 text-stone-700 dark:text-stone-300'}`}>
          <div className="text-xs font-mono opacity-80">Stage C</div>
          <div className="font-serif font-bold mt-0.5">Test Cases</div>
          <div className="text-xs mt-2 opacity-90">{workState.testC1Passed && workState.testC2Passed ? 'Cases Passed' : 'Pending Design'}</div>
        </div>

        <div className={`p-4 rounded-xl border ${workState.stage === 'D_ADOPT' || workState.stage === 'COMPLETED' ? 'bg-[#C86D33] text-white border-[#C86D33]' : 'bg-white dark:bg-stone-900 border-[#D6CEBE] dark:border-stone-800 text-stone-700 dark:text-stone-300'}`}>
          <div className="text-xs font-mono opacity-80">Stage D</div>
          <div className="font-serif font-bold mt-0.5">Adoption</div>
          <div className="text-xs mt-2 opacity-90">{workState.adopted ? 'Adopted' : 'Pending Tests'}</div>
        </div>
      </div>

      {/* STAGE A: EVIDENCE INVESTIGATION */}
      {workState.stage === 'A_INVESTIGATE' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-serif font-bold text-[#2B1B17] dark:text-stone-100">
                Evidence Dossier (Free Thinking)
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                Reading evidence is <strong>0 blocks (Free Thinking)</strong>. Examine at least 4 items to proceed.
              </p>
            </div>
            <button
              onClick={() => {
                if (examinedSet.size < 4) {
                  onShowToast('Please examine at least 4 evidence items.');
                  return;
                }
                onUpdateWorkState({ stage: 'B_DESIGN' });
              }}
              disabled={examinedSet.size < 4}
              className="px-5 py-2.5 text-xs font-medium text-white bg-[#C86D33] hover:bg-[#b05c28] rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <span>Proceed to Design Choice</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workDef.evidence.filter(e => e.visible_in_stage === 'A').map((item) => {
              const isExamined = examinedSet.has(item.id);
              return (
                <div
                  key={item.id}
                  className={`bg-white dark:bg-stone-900 border rounded-2xl p-6 shadow-xs flex flex-col justify-between ${
                    isExamined ? 'border-emerald-300 dark:border-emerald-800' : 'border-[#D6CEBE] dark:border-stone-800'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-[#FAF7F0] dark:bg-stone-800 text-[#C86D33]">
                        {item.id}
                      </span>
                      <span className="text-xs text-emerald-700 dark:text-emerald-400 font-mono">Free (0 blocks)</span>
                    </div>

                    <h4 className="text-base font-serif font-bold text-[#2B1B17] dark:text-stone-100">
                      {item.source}
                    </h4>
                    <div className="text-xs text-stone-500 font-medium">Reliability: {item.reliability}</div>

                    {isExamined ? (
                      <p className="text-xs text-stone-700 dark:text-stone-300 bg-[#FAF7F0] dark:bg-stone-800/80 p-3.5 rounded-xl leading-relaxed border border-[#D6CEBE]/50">
                        {item.establishes}
                      </p>
                    ) : (
                      <p className="text-xs text-stone-400 italic">
                        [Sealed document. Click examine to read freely.]
                      </p>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                    <span className="text-xs text-stone-500">{isExamined ? 'Examined' : 'Unread'}</span>
                    {!isExamined && (
                      <button
                        onClick={() => handleExamineEvidence(item.id)}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-[#2B1B17] hover:bg-[#C86D33] rounded-lg transition-colors"
                      >
                        Examine (Free)
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STAGE B: DESIGN CHOICES */}
      {workState.stage === 'B_DESIGN' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-serif font-bold text-[#2B1B17] dark:text-stone-100">
              Stage B: Select Design Choice
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
              Choose an architectural design choice defined in the Work definition.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workDef.design_choices.map((choice) => (
              <div key={choice.id} className="bg-white dark:bg-stone-900 border border-[#D6CEBE] dark:border-stone-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-serif font-bold text-[#2B1B17] dark:text-stone-100">{choice.label}</h4>
                  <span className="text-xs font-mono text-[#C86D33]">{choice.time_cost} Time Block{choice.time_cost > 1 ? 's' : ''}</span>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  <strong>Strength:</strong> {choice.strength}<br />
                  <strong>Limitation:</strong> {choice.limitation}
                </p>
                <button
                  onClick={() => handleSelectDesignChoice(choice.id, choice.time_cost)}
                  className="w-full py-2.5 text-xs font-medium text-white bg-[#C86D33] hover:bg-[#b05c28] rounded-lg transition-colors"
                >
                  Select {choice.label} ({choice.time_cost} Block{choice.time_cost > 1 ? 's' : ''})
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STAGE C: TEST CASES */}
      {workState.stage === 'C_TEST' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-serif font-bold text-[#2B1B17] dark:text-stone-100">
                Stage C: Test Cases Against Unseen Scenarios
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                Run the test cases specified in the Work definition.
              </p>
            </div>
            <button
              onClick={() => {
                if (!workState.testC1Passed || !workState.testC2Passed) {
                  onShowToast('Please complete all test cases.');
                  return;
                }
                onUpdateWorkState({ stage: 'D_ADOPT' });
              }}
              disabled={!workState.testC1Passed || !workState.testC2Passed}
              className="px-5 py-2.5 text-xs font-medium text-white bg-[#C86D33] hover:bg-[#b05c28] rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <span>Proceed to Adoption</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workDef.cases.map((testCase) => {
              const passed = testCase.id === 'C-1' ? workState.testC1Passed : workState.testC2Passed;
              return (
                <div key={testCase.id} className="bg-white dark:bg-stone-900 border border-[#D6CEBE] dark:border-stone-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-[#FAF7F0] dark:bg-stone-800 text-[#C86D33]">{testCase.id}</span>
                    <span className="text-xs text-emerald-600 font-semibold">{passed ? 'Passed' : 'Pending'}</span>
                  </div>
                  <h4 className="text-base font-serif font-bold text-[#2B1B17] dark:text-stone-100">{testCase.label}</h4>
                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">{testCase.capability}</p>
                  {!passed && (
                    <button
                      onClick={() => handleRunTestCase(testCase.id)}
                      className="w-full py-2 text-xs font-medium text-white bg-[#2B1B17] hover:bg-[#C86D33] rounded-lg transition-colors"
                    >
                      Run {testCase.id} Entry (1 Block)
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STAGE D: ADOPTION */}
      {workState.stage === 'D_ADOPT' && (
        <div className="space-y-6">
          <h3 className="text-xl font-serif font-bold text-[#2B1B17] dark:text-stone-100">
            Stage D: Secure Institutional Adoption
          </h3>
          <div className="bg-white dark:bg-stone-900 border border-[#D6CEBE] dark:border-stone-800 rounded-2xl p-8 space-y-6 max-w-2xl">
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              All test cases passed successfully. Present the register to secure final institutional adoption.
            </p>
            <button
              onClick={handleCompleteWork}
              className="w-full py-3 text-xs font-medium text-white bg-[#C86D33] hover:bg-[#b05c28] rounded-xl transition-colors shadow-sm"
            >
              Secure Full Adoption (1 Block)
            </button>
          </div>
        </div>
      )}

      {/* COMPLETED BANNER */}
      {workState.stage === 'COMPLETED' && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-emerald-900 dark:text-emerald-100">
            {workDef.title} — Completed Successfully
          </h3>
          <p className="text-sm text-emerald-800 dark:text-emerald-300 max-w-xl mx-auto leading-relaxed">
            Historical Progress XP and Career XP awarded. The Scribe Engine has validated all invariants and deliverables successfully.
          </p>
        </div>
      )}
    </div>
  );
};
