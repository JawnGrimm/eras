import React from 'react';
import { StorehouseWorkState, PlayerProfile, RegisterDesignType } from '../types';
import { createStorehouseEvidence } from '../data/initialData';
import { ShieldCheck, CheckCircle2, ArrowRight, Clock } from 'lucide-react';

interface StorehouseReckoningProps {
  player: PlayerProfile;
  workState: StorehouseWorkState;
  onUpdateWorkState: (newState: Partial<StorehouseWorkState>) => void;
  onConsumeBlocks: (amount: number) => void;
  onAwardXp: (careerXp: number, historicalXp: number) => void;
  onShowToast: (msg: string) => void;
}

const ACTIONS = [
  { id: 'opening', label: 'Retrieve prior closing-balance tablet (E-01)', cost: 1, result: '24 usable measures at opening' },
  { id: 'dispatch_receipt', label: 'Examine arrival tally and compare dispatch (E-02 / E-03)', cost: 1, result: '60 dispatched; 60 physically received' },
  { id: 'intake', label: 'Retrieve intake inspection from Receiving Official (E-04)', cost: 1, result: '56 usable; 4 held at intake' },
  { id: 'recount', label: 'Conduct physical recount with Storehouse Steward (E-07)', cost: 2, result: '47 usable; 7 held at recount' },
  { id: 'maintenance', label: 'Ask Steward for custody and maintenance notes (E-06)', cost: 1, result: 'Roof leak reported; exact cause and responsibility unproven' },
  { id: 'carrier', label: 'Consult Carrier Foreman about dispatch (E-02)', cost: 1, result: 'Dispatch-side corroboration and response to proposed finding' },
  { id: 'brewing', label: 'Confirm issue with Brewing-House Representative (E-05)', cost: 1, result: '30 authorized measures received by brewing-house operation' },
] as const;

const evidenceByAction: Record<string, string[]> = {
  opening: ['ev-01'],
  dispatch_receipt: ['ev-02', 'ev-03'],
  intake: ['ev-04'],
  recount: ['ev-07'],
  maintenance: ['ev-06'],
  carrier: ['ev-02'],
  brewing: ['ev-05'],
};

export const StorehouseReckoning: React.FC<StorehouseReckoningProps> = ({
  player, workState, onUpdateWorkState, onConsumeBlocks, onAwardXp, onShowToast,
}) => {
  const state = workState;
  const completed = state.completedActions ?? [];
  const examined = state.examinedEvidence ?? [];
  const sourceReferences = state.sourceReferences ?? [];
  const evidence = createStorehouseEvidence();
  const has = (id: string) => completed.includes(id);
  const stageAReady = has('opening') && has('dispatch_receipt') && has('intake') &&
    has('recount') && has('carrier') && has('brewing');
  const stageBReady = Boolean(state.registerConfigured && state.initialEntriesValid &&
    state.sourceNotationAdded && state.seniorReviewCompleted);
  const c1Ready = Boolean(state.c1EvidenceRetrieved && state.c1EntryRecorded && state.testC1Passed);
  const c2Ready = Boolean(state.c2EvidenceRetrieved && state.c2EntryRecorded && state.testC2Passed);
  const stageCReady = c1Ready && c2Ready;
  const canAct = (cost: number) => player.blocksRemaining >= cost;

  const commit = (label: string, cost: number, update: Partial<StorehouseWorkState>, success: string) => {
    if (!canAct(cost)) {
      onShowToast('Not enough AP remaining. This action costs ' + cost + ' AP.');
      return false;
    }
    onConsumeBlocks(cost);
    onUpdateWorkState(update);
    onShowToast(label + ' (' + cost + ' AP). ' + success);
    return true;
  };

  const doStageA = (id: typeof ACTIONS[number]['id']) => {
    if (has(id)) return;
    const action = ACTIONS.find((item) => item.id === id);
    if (!action) return;
    const ids = evidenceByAction[id] ?? [];
    commit(action.label, action.cost, {
      completedActions: [...completed, id],
      examinedEvidence: [...new Set([...examined, ...ids])],
    }, action.result + '.');
  };

  const changeStage = (stage: StorehouseWorkState['stage']) => onUpdateWorkState({ stage });

  const chooseDesign = (design: RegisterDesignType) => {
    if (state.registerConfigured) {
      onShowToast('A register design has already been configured. Use a revision pass if the structure must change.');
      return;
    }
    const cost = design === 'movement_ledger' ? 2 : 1;
    commit('Configure ' + (design === 'movement_ledger' ? 'Movement Ledger' : 'Compact Balance Register'),
      cost, { registerDesign: design, registerConfigured: true },
      'The register structure is selected.');
  };

  const initialRecord = state.initialRecord ?? {};
  const recordIsValid = () => {
    const findingValid = state.findingRuling === 'status_change_cause_unestablished' ||
      (state.findingRuling === 'roof_leak_reported_unproven' && has('maintenance'));
    return findingValid &&
      initialRecord.openingUsable === 24 &&
      initialRecord.dispatched === 60 &&
      initialRecord.received === 60 &&
      initialRecord.intakeUsable === 56 &&
      initialRecord.intakeHeld === 4 &&
      initialRecord.laterUsable === 47 &&
      initialRecord.laterHeld === 7 &&
      initialRecord.issueQuantity === 30 &&
      initialRecord.statusTransfer === 3 &&
      initialRecord.issueRecipient === 'brewing_house' &&
      initialRecord.issueAuthority === 'temple_decree' &&
      initialRecord.dispatchFrom === 'outer_fields' &&
      initialRecord.dispatchTo === 'central_storehouse' &&
      initialRecord.issuePurpose === 'brewing_operation' &&
      initialRecord.recordLocation === 'central_storehouse' &&
      initialRecord.responsibleRecorder === 'apprentice_under_senior_scribe';
  };
  const setRecordField = (field: keyof NonNullable<StorehouseWorkState['initialRecord']>, value: NonNullable<StorehouseWorkState['initialRecord']>[keyof NonNullable<StorehouseWorkState['initialRecord']>] | undefined) => {
    onUpdateWorkState({ initialRecord: { ...initialRecord, [field]: value } as NonNullable<StorehouseWorkState['initialRecord']> });
  };
  const draftInitial = () => {
    const valid = recordIsValid();
    commit('Draft opening, receipt, condition, status-change, and issue entries', 2,
      { initialEntriesDrafted: true, initialEntriesValid: valid },
      valid
        ? 'All initial quantities, recipient, authority, status movement, and finding are supported.'
        : 'The draft failed validation. Correct the structured fields and use a 1-AP revision pass.');
  };
  const reviseInitial = () => {
    const valid = recordIsValid();
    commit('Revise initial register entries', 1,
      { initialEntriesValid: valid, revisionPasses: (state.revisionPasses ?? 0) + 1 },
      valid
        ? 'The corrected initial record now satisfies the scenario invariants.'
        : 'The revised record still contains unsupported or inconsistent fields.');
  };

  const addSourceNotation = () => {
    const required = ['ev-01','ev-02','ev-03','ev-04','ev-05','ev-07'];
    const valid = required.every((id) => sourceReferences.includes(id)) &&
      (state.findingRuling !== 'roof_leak_reported_unproven' || sourceReferences.includes('ev-06'));
    commit('Add source references and unresolved-cause notation', 1,
      { sourceNotationAdded: valid },
      valid ? 'All material claims cite their supporting evidence.' : 'Required source references are missing. Correct the selections and repeat the action.');
  };

  const reviewWithSenior = () => commit('Ask Senior Scribe to review proposed fields', 1,
    { seniorReviewCompleted: true },
    'The proposed register fields have been reviewed.');

  const retrieveTest = (which: 'c1' | 'c2') => {
    const isC1 = which === 'c1';
    if (isC1 ? state.c1EvidenceRetrieved : state.c2EvidenceRetrieved) return;
    commit('Retrieve unseen test ' + which.toUpperCase() + ' evidence', 1,
      isC1 ? { c1EvidenceRetrieved: true } : { c2EvidenceRetrieved: true },
      'The test dossier is now available for examination.');
  };

  const enterTest = (which: 'c1' | 'c2') => {
    const isC1 = which === 'c1';
    if (isC1 ? state.testC1Passed : state.testC2Passed) return;
    if (!(isC1 ? state.c1EvidenceRetrieved : state.c2EvidenceRetrieved)) {
      onShowToast('Retrieve the test evidence before entering the transaction.');
      return;
    }
    const ruling = isC1 ? state.c1Ruling : state.c2Ruling;
    if (!ruling) {
      onShowToast('Choose the transaction treatment before recording the entry.');
      return;
    }
    commit('Enter test ' + which.toUpperCase() + ' in the register', 1,
      isC1 ? { c1EntryRecorded: true, testC1Passed: false } : { c2EntryRecorded: true, testC2Passed: false },
      'The entry is recorded and ready for audit.');
  };

  const addSupplement = (which: 'c1' | 'c2') => {
    const isC1 = which === 'c1';
    commit('Add linked supplemental movement note for ' + which.toUpperCase(), 1,
      isC1 ? { c1SupplementAdded: true } : { c2SupplementAdded: true },
      'The compact register now has a traceable linked movement record.');
  };

  const auditTest = (which: 'c1' | 'c2') => {
    const isC1 = which === 'c1';
    const retrieved = isC1 ? state.c1EvidenceRetrieved : state.c2EvidenceRetrieved;
    const entered = isC1 ? state.c1EntryRecorded : state.c2EntryRecorded;
    const ruling = isC1 ? state.c1Ruling : state.c2Ruling;
    const supplemental = isC1 ? state.c1SupplementAdded : state.c2SupplementAdded;
    if (!retrieved || !entered) {
      onShowToast('Retrieve the evidence and enter the transaction before auditing it.');
      return;
    }
    if (state.registerDesign === 'compact_balance' && !supplemental) {
      onShowToast('The compact register needs a linked supplemental movement note before this test can pass. Add that note for 1 AP.');
      return;
    }
    const valid = isC1 ? ruling === 'status_transfer' : ruling === 'discrepancy_pending';
    const count = (isC1 ? state.c1AuditAttempts : state.c2AuditAttempts) ?? 0;
    commit('Audit test ' + which.toUpperCase(), 1,
      isC1
        ? { testC1Passed: valid, c1AuditAttempts: count + 1 }
        : { testC2Passed: valid, c2AuditAttempts: count + 1 },
      valid
        ? (isC1
          ? '5 measures move from held to usable, 2 remain held, and total physical stock is unchanged.'
          : '20 dispatched, 18 received, 2 pending inquiry; no unsupported blame is assigned.')
        : (isC1
          ? 'Failed: this entry treats a status release as a new receipt. Revise and audit again.'
          : 'Failed: dispatch and receipt have been conflated or responsibility has been asserted without evidence. Revise and audit again.'));
  };

  const reviseTest = (which: 'c1' | 'c2') => {
    const isC1 = which === 'c1';
    commit('Revise test ' + which.toUpperCase() + ' entry', 1,
      isC1
        ? { c1Ruling: 'status_transfer', c1EntryRecorded: true, testC1Passed: false, c1AuditAttempts: 0, revisionPasses: (state.revisionPasses ?? 0) + 1 }
        : { c2Ruling: 'discrepancy_pending', c2EntryRecorded: true, testC2Passed: false, c2AuditAttempts: 0, revisionPasses: (state.revisionPasses ?? 0) + 1 },
      'The entry has been corrected and must be audited again.');
  };

  const finalAudit = () => {
    const findingValid = state.findingRuling === 'status_change_cause_unestablished' ||
      (state.findingRuling === 'roof_leak_reported_unproven' && has('maintenance') && sourceReferences.includes('ev-06'));
    const valid = stageBReady && findingValid && stageCReady &&
      examined.includes('ev-01') && examined.includes('ev-02') && examined.includes('ev-03') &&
      examined.includes('ev-04') && examined.includes('ev-05') && examined.includes('ev-07');
    commit('Run final audit against initial case and both test cases', 2,
      { finalAuditPassed: valid, auditCompleted: valid },
      valid
        ? 'All required evidence, arithmetic, status transitions, provenance, and test results satisfy the Work invariants.'
        : 'Audit failed. Check required evidence, initial entries, source notation, both tests, and the unresolved-cause finding.');
  };

  const institutionalReview = () => commit('Ask Steward and Senior Scribe for institutional review', 1,
    { institutionalReviewCompleted: true },
    'The Steward reviews allocation usefulness; the Senior Scribe reviews evidence discipline and procedure.');

  const reviseRegister = () => {
    if (!state.revisionFocus) {
      onShowToast('Choose the register field to revise before spending AP.');
      return;
    }
    const descriptions = {
      dispatch_receipt: 'Added distinct dispatch and physical-receipt references.',
      status_history: 'Added a linked movement-history field for stock-status changes.',
      responsibility: 'Added an explicit responsibility and unresolved-cause qualification.',
    };
    commit('Revise register: ' + descriptions[state.revisionFocus], 1,
      { revisionApplied: true, finalAuditPassed: false, auditCompleted: false,
        institutionalReviewCompleted: false, presentationCompleted: false,
        revisionPasses: (state.revisionPasses ?? 0) + 1 },
      'The selected register field has been added. Run the final audit and institutional review again.');
  };

  const present = (decision: 'full' | 'provisional' | 'decline') => {
    if (!state.finalAuditPassed || !state.institutionalReviewCompleted) {
      onShowToast('Complete the final audit and institutional review before presenting the register.');
      return;
    }
    if (decision === 'decline') {
      commit('Present register; institution declines pending revision', 1,
        { presentationCompleted: true, adopted: false, adoptionType: 'rejected',
          finalAuditPassed: false, auditCompleted: false, institutionalReviewCompleted: false },
        'The Work remains active. Revise the register, audit it, and present it again.');
      return;
    }
    const condition = decision === 'provisional'
      ? 'Use the register provisionally; retain linked source notes and review status changes at the next inventory review.'
      : null;
    const done = commit('Present register for institutional approval', 1,
      { presentationCompleted: true, adopted: true,
        adoptionType: decision === 'full' ? (state.registerDesign ?? 'compact_balance') : 'provisional',
        adoptionCondition: condition, stage: 'COMPLETED' },
      decision === 'full'
        ? 'The register is adopted for institutional use.'
        : 'The register is adopted provisionally with a documented follow-up condition.');
    if (done && !state.rewardGranted) {
      // Retain the prototype's existing award pending the GDD progression-allocation pass.
      onAwardXp(500, 15000);
      onUpdateWorkState({ rewardGranted: true });
    }
  };

  const renderAction = (id: typeof ACTIONS[number]['id']) => {
    const action = ACTIONS.find((item) => item.id === id)!;
    const done = has(id);
    return <div key={id} className="flex items-center justify-between gap-4 border-b border-stone-100 dark:border-stone-800 py-3">
      <div className="min-w-0">
        <div className="text-sm font-medium">{action.label}</div>
        <div className="text-xs text-stone-500 mt-1">{action.result}</div>
      </div>
      <div className="shrink-0 flex items-center gap-3">
        <span className="text-xs font-mono text-stone-500">{action.cost} AP</span>
        {done
          ? <span className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle2 size={14}/> Done</span>
          : <button disabled={!canAct(action.cost)} onClick={() => doStageA(id)}
              className="px-3 py-2 text-xs rounded-lg bg-[#2B1B17] text-white disabled:opacity-40">Perform</button>}
      </div>
    </div>;
  };

  const section = (title: string, subtitle: string, children: React.ReactNode) => (
    <section className="bg-white dark:bg-stone-900 border border-[#D6CEBE] dark:border-stone-800 rounded-2xl p-6 space-y-4">
      <div><h3 className="text-lg font-serif font-bold">{title}</h3><p className="text-xs text-stone-500 mt-1">{subtitle}</p></div>
      {children}
    </section>
  );

  return <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
    <header className="bg-[#FAF7F0] dark:bg-stone-900 border border-[#D6CEBE] dark:border-stone-800 rounded-2xl p-7">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider font-mono text-[#C86D33]">Era I mandatory Work · Uruk c. 3200 BCE</div>
          <h2 className="text-3xl font-serif font-bold mt-2">The Storehouse Reckoning</h2>
          <p className="text-sm text-stone-600 dark:text-stone-300 mt-2 max-w-3xl">Investigate the stock discrepancy, construct a durable register, test it against unseen transactions, and obtain a documented institutional decision.</p>
        </div>
        <div className="rounded-xl bg-white dark:bg-stone-800 border border-[#D6CEBE] dark:border-stone-700 p-4 min-w-40">
          <div className="text-xs text-stone-500">Workday AP</div>
          <div className="text-2xl font-mono font-bold">{player.blocksRemaining} / 6</div>
          <div className="text-xs text-stone-500 mt-1">Current stage: {state.stage}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-6">
        {[
          ['A','Investigate',stageAReady],
          ['B','Design',stageBReady],
          ['C','Test',stageCReady],
          ['D','Audit & adopt',state.stage === 'COMPLETED'],
        ].map(([letter,label,ready]) => <div key={String(letter)} className="rounded-lg border border-[#D6CEBE] dark:border-stone-700 p-3">
          <div className="text-xs font-mono text-stone-500">Stage {letter}</div>
          <div className="text-sm font-semibold">{label}</div>
          <div className={'text-xs mt-1 ' + (ready ? 'text-emerald-600' : 'text-stone-400')}>{ready ? 'Requirements met' : 'In progress'}</div>
        </div>)}
      </div>
    </header>

    {state.stage === 'A_INVESTIGATE' && <>
      {section('Stage A — Investigate the discrepancy',
        'Each retrieval, comparison, recount, and consultation costs AP. Once acquired, evidence can be reread without cost.',
        <div className="space-y-1">
          {ACTIONS.map((a) => renderAction(a.id))}
          <div className="pt-4">
            <h4 className="font-semibold text-sm mb-2">Evidence currently available</h4>
            <div className="grid md:grid-cols-2 gap-2">
              {evidence.map((item) => <div key={item.id} className="rounded-lg bg-[#FAF7F0] dark:bg-stone-800 p-3">
                <div className="text-xs font-mono text-[#C86D33]">{item.code} · {item.title}</div>
                <div className="text-xs text-stone-500 mt-1">{examined.includes(item.id) ? item.content : 'Not yet retrieved.'}</div>
                <div className="text-xs mt-1">{examined.includes(item.id) ? 'Retrieved · free review' : 'Sealed'}</div>
              </div>)}
            </div>
          </div>
          <div className="pt-3 flex justify-end">
            <button disabled={!stageAReady || !canAct(0)} onClick={() => changeStage('B_DESIGN')}
              className="px-4 py-2 rounded-lg bg-[#C86D33] text-white text-xs disabled:opacity-40">Proceed to Stage B <ArrowRight size={14} className="inline ml-1"/></button>
          </div>
          {!stageAReady && <p className="text-xs text-amber-700">Required before proceeding: E-01, dispatch/receipt comparison, E-04, E-07, Carrier Foreman consultation, and Brewing-House Representative confirmation. E-06 is optional unless you wish to cite the reported roof leak.</p>}
        </div>)}
    </>}

    {state.stage === 'B_DESIGN' && <>
      {section('Stage B — Design the register',
        'The register is a working institutional record, not a cosmetic layout. Configure it, draft the initial entries, add provenance, and obtain the Senior Scribe’s review.',
        <div className="space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-[#D6CEBE] dark:border-stone-700 p-4 space-y-2">
              <h4 className="font-semibold">Compact balance register · 1 AP</h4>
              <p className="text-xs text-stone-500">Quick routine balances; status changes and later releases need explanatory notes or linked cross-references.</p>
              <button disabled={state.registerConfigured || !canAct(1)} onClick={() => chooseDesign('compact_balance')} className="px-3 py-2 text-xs rounded-lg bg-[#2B1B17] text-white disabled:opacity-40">Configure compact register</button>
            </div>
            <div className="rounded-xl border border-[#D6CEBE] dark:border-stone-700 p-4 space-y-2">
              <h4 className="font-semibold">Movement ledger · 2 AP</h4>
              <p className="text-xs text-stone-500">Dated, sourced movement and status-change lines with quantity, authority, location, and responsible recorder.</p>
              <button disabled={state.registerConfigured || !canAct(2)} onClick={() => chooseDesign('movement_ledger')} className="px-3 py-2 text-xs rounded-lg bg-[#C86D33] text-white disabled:opacity-40">Configure movement ledger</button>
            </div>
          </div>
          {state.registerConfigured && <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-3 text-sm">Configured: <strong>{state.registerDesign === 'movement_ledger' ? 'Movement Ledger' : 'Compact Balance Register'}</strong></div>}
          <div className="border-t border-stone-200 dark:border-stone-700 pt-4 space-y-3">
            <h4 className="font-semibold text-sm">Initial finding and entries</h4>
            <p className="text-xs text-stone-500">Enter the register quantities and identify the issue recipient and authority. The target document is not prefilled; the validator checks the values against the examined evidence.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {([
                ['openingUsable','Opening usable stock'],
                ['dispatched','Dispatched quantity'],
                ['received','Physical receipt'],
                ['intakeUsable','Usable at intake'],
                ['intakeHeld','Held at intake'],
                ['laterUsable','Usable at recount'],
                ['laterHeld','Held at recount'],
                ['issueQuantity','Issue quantity'],
                ['statusTransfer','Usable-to-held transfer'],
              ] as const).map(([field,label]) => <label key={field} className="text-xs text-stone-600 dark:text-stone-300">
                <span className="block mb-1">{label}</span>
                <input type="number" min="0" disabled={state.initialEntriesValid}
                  value={initialRecord[field] ?? ''}
                  onChange={(event) => setRecordField(field, event.target.value === '' ? undefined : Number(event.target.value))}
                  className="w-full rounded-lg border border-[#D6CEBE] dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-2"/>
              </label>)}
              <label className="text-xs text-stone-600 dark:text-stone-300">Issue recipient
                <select disabled={state.initialEntriesValid} value={initialRecord.issueRecipient ?? ''} onChange={(event) => setRecordField('issueRecipient', event.target.value as 'brewing_house' | 'steward' | 'unknown' | undefined)} className="w-full mt-1 rounded-lg border border-[#D6CEBE] dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-2">
                  <option value="">Select recipient</option><option value="brewing_house">Brewing-house operation</option><option value="steward">Storehouse Steward</option><option value="unknown">Unknown</option>
                </select>
              </label>
              <label className="text-xs text-stone-600 dark:text-stone-300">Issue authority
                <select disabled={state.initialEntriesValid} value={initialRecord.issueAuthority ?? ''} onChange={(event) => setRecordField('issueAuthority', event.target.value as 'temple_decree' | 'none' | undefined)} className="w-full mt-1 rounded-lg border border-[#D6CEBE] dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-2">
                  <option value="">Select authority</option><option value="temple_decree">Temple decree</option><option value="none">No supplied authority</option>
                </select>
              </label>
              <label className="text-xs text-stone-600 dark:text-stone-300">Dispatch origin
                <select disabled={state.initialEntriesValid} value={initialRecord.dispatchFrom ?? ''} onChange={(event) => setRecordField('dispatchFrom', event.target.value as 'outer_fields' | 'unknown' | undefined)} className="w-full mt-1 rounded-lg border border-[#D6CEBE] dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-2"><option value="">Select origin</option><option value="outer_fields">Outer fields</option><option value="unknown">Unknown</option></select>
              </label>
              <label className="text-xs text-stone-600 dark:text-stone-300">Dispatch destination
                <select disabled={state.initialEntriesValid} value={initialRecord.dispatchTo ?? ''} onChange={(event) => setRecordField('dispatchTo', event.target.value as 'central_storehouse' | 'other' | undefined)} className="w-full mt-1 rounded-lg border border-[#D6CEBE] dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-2"><option value="">Select destination</option><option value="central_storehouse">Central storehouse</option><option value="other">Other</option></select>
              </label>
              <label className="text-xs text-stone-600 dark:text-stone-300">Issue purpose
                <select disabled={state.initialEntriesValid} value={initialRecord.issuePurpose ?? ''} onChange={(event) => setRecordField('issuePurpose', event.target.value as 'brewing_operation' | 'unknown' | undefined)} className="w-full mt-1 rounded-lg border border-[#D6CEBE] dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-2"><option value="">Select purpose</option><option value="brewing_operation">Brewing-house operation</option><option value="unknown">Unknown</option></select>
              </label>
              <label className="text-xs text-stone-600 dark:text-stone-300">Record location
                <select disabled={state.initialEntriesValid} value={initialRecord.recordLocation ?? ''} onChange={(event) => setRecordField('recordLocation', event.target.value as 'central_storehouse' | 'unknown' | undefined)} className="w-full mt-1 rounded-lg border border-[#D6CEBE] dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-2"><option value="">Select location</option><option value="central_storehouse">Central storehouse</option><option value="unknown">Unknown</option></select>
              </label>
              <label className="text-xs text-stone-600 dark:text-stone-300">Responsible recorder
                <select disabled={state.initialEntriesValid} value={initialRecord.responsibleRecorder ?? ''} onChange={(event) => setRecordField('responsibleRecorder', event.target.value as 'apprentice_under_senior_scribe' | 'unknown' | undefined)} className="w-full mt-1 rounded-lg border border-[#D6CEBE] dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-2"><option value="">Select recorder</option><option value="apprentice_under_senior_scribe">Apprentice under Senior Scribe</option><option value="unknown">Unknown</option></select>
              </label>
            </div>
            <p className="text-xs text-stone-500">Reconcile opening stock, receipt, issue, closing total, usable and held quantities, and the intervening status transfer. Preserve both condition snapshots.</p>
            <p className="text-xs text-stone-500">Select a defensible explanation. The record must preserve both condition snapshots; the three measures changed status rather than disappearing.</p>
            {([
              ['status_change_cause_unestablished','Three measures changed from usable to held; the cause is not established.'],
              ['roof_leak_reported_unproven','A roof leak was reported; its precise causal role and individual responsibility remain unproven.'],
              ['stock_loss','Three measures are recorded as a stock loss.'],
              ['carrier_blame','The carrier is held responsible for the damp stock.'],
            ] as const).map(([value,label]) => <label key={value} className="flex items-start gap-2 text-xs">
              <input type="radio" name="finding" checked={state.findingRuling === value} onChange={() => onUpdateWorkState({findingRuling:value})}/>
              <span>{label}</span>
            </label>)}
            <button disabled={!state.registerConfigured || state.initialEntriesDrafted || !canAct(2)} onClick={draftInitial} className="px-3 py-2 rounded-lg bg-[#2B1B17] text-white text-xs disabled:opacity-40">Draft initial entries · 2 AP</button>
            {state.initialEntriesDrafted && state.initialEntriesValid && <span className="text-xs text-emerald-600 ml-2">Draft passes factual checks</span>}
            {state.initialEntriesDrafted && !state.initialEntriesValid && <div className="space-y-2"><p className="text-xs text-amber-700">Draft does not satisfy the quantity, recipient, authority, or evidence invariants. Correct the fields and revise for 1 AP.</p><button disabled={!canAct(1)} onClick={reviseInitial} className="px-3 py-2 rounded-lg border text-xs disabled:opacity-40">Revise initial entries · 1 AP</button></div>}
            {state.findingRuling && state.findingRuling !== 'status_change_cause_unestablished' &&
              !(state.findingRuling === 'roof_leak_reported_unproven' && has('maintenance')) &&
              <p className="text-xs text-amber-700">This finding is not supported by the currently retrieved evidence.</p>}
          </div>
          <div className="border-t border-stone-200 dark:border-stone-700 pt-4 space-y-3">
            <div className="space-y-2">
              <div><h4 className="font-semibold text-sm">Source references and unresolved-cause notation</h4><p className="text-xs text-stone-500">Select the evidence linked to material claims, then commit the notation for 1 AP.</p></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                {['ev-01','ev-02','ev-03','ev-04','ev-05','ev-06','ev-07'].map((id) => <label key={id} className="flex gap-2"><input type="checkbox" disabled={state.sourceNotationAdded || !examined.includes(id)} checked={sourceReferences.includes(id)} onChange={(event) => onUpdateWorkState({sourceReferences:event.target.checked ? [...sourceReferences,id] : sourceReferences.filter((item) => item !== id)})}/>{id}</label>)}
              </div>
              {state.sourceNotationAdded ? <span className="text-xs text-emerald-600">Required provenance references recorded.</span> : <button disabled={!state.initialEntriesValid || !canAct(1)} onClick={addSourceNotation} className="px-3 py-2 rounded-lg bg-[#2B1B17] text-white text-xs disabled:opacity-40">Add notation · 1 AP</button>}
            </div>
            <div className="flex items-center justify-between"><div><h4 className="font-semibold text-sm">Senior Scribe review</h4><p className="text-xs text-stone-500">1 AP · Review proposed fields and evidence discipline.</p></div>
              {state.seniorReviewCompleted ? <span className="text-xs text-emerald-600">Complete</span> : <button disabled={!state.sourceNotationAdded || !canAct(1)} onClick={reviewWithSenior} className="px-3 py-2 rounded-lg bg-[#2B1B17] text-white text-xs disabled:opacity-40">Request review · 1 AP</button>}
            </div>
          </div>
          <div className="flex justify-end"><button disabled={!stageBReady} onClick={() => changeStage('C_TEST')} className="px-4 py-2 rounded-lg bg-[#C86D33] text-white text-xs disabled:opacity-40">Proceed to Stage C <ArrowRight size={14} className="inline ml-1"/></button></div>
        </div>)}
    </>}

    {state.stage === 'C_TEST' && <>
      {section('Stage C — Test against unseen transactions',
        'Each test has three costed steps: retrieve evidence (1 AP), enter the transaction (1 AP), and audit the entry (1 AP). The test evidence is not shown before retrieval.',
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="rounded-xl border border-[#D6CEBE] dark:border-stone-700 p-5 space-y-3">
            <div className="flex justify-between"><h4 className="font-semibold">Test C-1 · Release of held stock</h4><span className="text-xs">{state.testC1Passed ? 'Passed' : 'Pending'}</span></div>
            {!state.c1EvidenceRetrieved ? <button disabled={!canAct(1)} onClick={() => retrieveTest('c1')} className="px-3 py-2 rounded-lg bg-[#2B1B17] text-white text-xs disabled:opacity-40">Retrieve C-1 evidence · 1 AP</button> :
              <div className="bg-[#FAF7F0] dark:bg-stone-800 p-3 rounded-lg text-xs space-y-1"><p>C1-E01: Inspection establishes 5 of 7 held measures have dried; 2 remain held.</p><p>C1-E02: Steward authorizes 5 measures to return to usable stock.</p></div>}
            {state.c1EvidenceRetrieved && <>
              <div className="space-y-2 text-xs">
                <label className="flex gap-2"><input type="radio" name="c1" disabled={state.testC1Passed} disabled={state.c1EntryRecorded || state.testC1Passed} checked={state.c1Ruling === 'status_transfer'} onChange={() => onUpdateWorkState({c1Ruling:'status_transfer',c1EntryRecorded:false,testC1Passed:false})}/> Record 5 transferred from held to usable; no new receipt.</label>
                <label className="flex gap-2"><input type="radio" name="c1" disabled={state.testC1Passed} disabled={state.c1EntryRecorded || state.testC1Passed} checked={state.c1Ruling === 'new_receipt'} onChange={() => onUpdateWorkState({c1Ruling:'new_receipt',c1EntryRecorded:false,testC1Passed:false})}/> Record 5 as a new receipt.</label>
              </div>
              <button disabled={!state.c1Ruling || state.c1EntryRecorded || state.testC1Passed || !canAct(1)} onClick={() => enterTest('c1')} className="px-3 py-2 rounded-lg bg-[#2B1B17] text-white text-xs disabled:opacity-40">Enter C-1 · 1 AP</button>
              {state.registerDesign === 'compact_balance' && !state.c1SupplementAdded && <button disabled={!state.c1EntryRecorded || state.testC1Passed || !canAct(1)} onClick={() => addSupplement('c1')} className="px-3 py-2 rounded-lg border text-xs disabled:opacity-40">Add linked movement note · 1 AP</button>}
              {state.c1EntryRecorded && <button disabled={state.testC1Passed || ((state.c1AuditAttempts ?? 0) > 0) || !canAct(1)} onClick={() => auditTest('c1')} className="px-3 py-2 rounded-lg bg-[#C86D33] text-white text-xs disabled:opacity-40">Audit C-1 · 1 AP</button>}
              {state.c1AuditAttempts && state.c1AuditAttempts > 0 && !state.testC1Passed && <button disabled={!canAct(1)} onClick={() => reviseTest('c1')} className="px-3 py-2 rounded-lg border text-xs disabled:opacity-40">Revise C-1 · 1 AP</button>}
            </>}
            {state.testC1Passed && <p className="text-xs text-emerald-600 flex gap-1"><CheckCircle2 size={14}/> 5 transferred; 2 remain held; total stock unchanged.</p>}
          </div>
          <div className="rounded-xl border border-[#D6CEBE] dark:border-stone-700 p-5 space-y-3">
            <div className="flex justify-between"><h4 className="font-semibold">Test C-2 · Short delivery</h4><span className="text-xs">{state.testC2Passed ? 'Passed' : 'Pending'}</span></div>
            {!state.c2EvidenceRetrieved ? <button disabled={!canAct(1)} onClick={() => retrieveTest('c2')} className="px-3 py-2 rounded-lg bg-[#2B1B17] text-white text-xs disabled:opacity-40">Retrieve C-2 evidence · 1 AP</button> :
              <div className="bg-[#FAF7F0] dark:bg-stone-800 p-3 rounded-lg text-xs space-y-1"><p>C2-E01: Dispatch instruction authorizes 20 measures.</p><p>C2-E02: Receiving tally counts 18 physically unloaded.</p><p>C2-E03: No reliable departure or route inspection locates the 2-measure discrepancy.</p></div>}
            {state.c2EvidenceRetrieved && <>
              <div className="space-y-2 text-xs">
                <label className="flex gap-2"><input type="radio" name="c2" disabled={state.c2EntryRecorded || state.testC2Passed} checked={state.c2Ruling === 'discrepancy_pending'} onChange={() => onUpdateWorkState({c2Ruling:'discrepancy_pending',c2EntryRecorded:false,testC2Passed:false})}/> Record 20 dispatched, 18 received, 2 pending inquiry; no blame assigned.</label>
                <label className="flex gap-2"><input type="radio" name="c2" disabled={state.c2EntryRecorded || state.testC2Passed} checked={state.c2Ruling === 'full_receipt'} onChange={() => onUpdateWorkState({c2Ruling:'full_receipt',c2EntryRecorded:false,testC2Passed:false})}/> Record all 20 as received.</label>
                <label className="flex gap-2"><input type="radio" name="c2" disabled={state.c2EntryRecorded || state.testC2Passed} checked={state.c2Ruling === 'carrier_at_fault'} onChange={() => onUpdateWorkState({c2Ruling:'carrier_at_fault',c2EntryRecorded:false,testC2Passed:false})}/> Assign the 2-measure shortage to the carrier.</label>
              </div>
              <button disabled={!state.c2Ruling || state.c2EntryRecorded || state.testC2Passed || !canAct(1)} onClick={() => enterTest('c2')} className="px-3 py-2 rounded-lg bg-[#2B1B17] text-white text-xs disabled:opacity-40">Enter C-2 · 1 AP</button>
              {state.registerDesign === 'compact_balance' && !state.c2SupplementAdded && <button disabled={!state.c2EntryRecorded || state.testC2Passed || !canAct(1)} onClick={() => addSupplement('c2')} className="px-3 py-2 rounded-lg border text-xs disabled:opacity-40">Add linked dispatch/receipt note · 1 AP</button>}
              {state.c2EntryRecorded && <button disabled={state.testC2Passed || ((state.c2AuditAttempts ?? 0) > 0) || !canAct(1)} onClick={() => auditTest('c2')} className="px-3 py-2 rounded-lg bg-[#C86D33] text-white text-xs disabled:opacity-40">Audit C-2 · 1 AP</button>}
              {state.c2AuditAttempts && state.c2AuditAttempts > 0 && !state.testC2Passed && <button disabled={!canAct(1)} onClick={() => reviseTest('c2')} className="px-3 py-2 rounded-lg border text-xs disabled:opacity-40">Revise C-2 · 1 AP</button>}
            </>}
            {state.testC2Passed && <p className="text-xs text-emerald-600 flex gap-1"><CheckCircle2 size={14}/> 20 dispatched; 18 received; discrepancy remains unresolved.</p>}
          </div>
          <div className="lg:col-span-2 flex justify-end"><button disabled={!stageCReady} onClick={() => changeStage('D_ADOPT')} className="px-4 py-2 rounded-lg bg-[#C86D33] text-white text-xs disabled:opacity-40">Proceed to Stage D <ArrowRight size={14} className="inline ml-1"/></button></div>
        </div>)}
    </>}

    {state.stage === 'D_ADOPT' && <>
      {section('Stage D — Audit, revise, and obtain adoption',
        'The institution reviews the record as a working tool. A failed audit or declined presentation does not permanently block the Work.',
        <div className="space-y-4">
          <div className="rounded-lg bg-[#FAF7F0] dark:bg-stone-800 p-4 text-xs space-y-1">
            <p>Initial case: {stageBReady && state.initialEntriesDrafted ? 'entries drafted, sourced, and reviewed' : 'incomplete'}</p>
            <p>Test C-1: {state.testC1Passed ? 'passed' : 'not passed'}</p>
            <p>Test C-2: {state.testC2Passed ? 'passed' : 'not passed'}</p>
            <p>Register: {state.registerDesign === 'movement_ledger' ? 'Movement Ledger' : 'Compact Balance Register'}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button disabled={!stageCReady || !stageBReady || state.finalAuditPassed || !canAct(2)} onClick={finalAudit} className="px-3 py-2 rounded-lg bg-[#2B1B17] text-white text-xs disabled:opacity-40">Final audit · 2 AP</button>
            {state.finalAuditPassed && <span className="text-xs text-emerald-600 self-center">Final audit passed</span>}
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-stone-200 dark:border-stone-700 pt-3">
            <div><div className="text-sm font-semibold">Steward and Senior Scribe review</div><div className="text-xs text-stone-500">1 AP · Allocation usefulness, provenance, and professional confidence.</div></div>
            <button disabled={!state.finalAuditPassed || state.institutionalReviewCompleted || !canAct(1)} onClick={institutionalReview} className="px-3 py-2 rounded-lg border text-xs disabled:opacity-40">{state.institutionalReviewCompleted ? 'Reviewed' : 'Request review · 1 AP'}</button>
          </div>
          <div className="border-t border-stone-200 dark:border-stone-700 pt-3 space-y-3">
            <div><div className="text-sm font-semibold">Revision pass</div><div className="text-xs text-stone-500">Choose a concrete register improvement. Applying it costs 1 AP and requires a new final audit and review.</div></div>
            {([
              ['dispatch_receipt','Separate dispatch and physical-receipt references'],
              ['status_history','Add linked stock-status movement history'],
              ['responsibility','Clarify responsibility and unresolved-cause notation'],
            ] as const).map(([value,label]) => <label key={value} className="flex gap-2 text-xs">
              <input type="radio" name="revisionFocus" checked={state.revisionFocus === value} onChange={() => onUpdateWorkState({revisionFocus:value})}/>
              <span>{label}</span>
            </label>)}
            <button disabled={!state.revisionFocus || !canAct(1)} onClick={reviseRegister} className="px-3 py-2 rounded-lg border text-xs disabled:opacity-40">Apply revision · 1 AP</button>
            {state.revisionApplied && <p className="text-xs text-emerald-600">Revision applied: {state.revisionFocus === 'dispatch_receipt' ? 'dispatch / receipt references' : state.revisionFocus === 'status_history' ? 'stock-status history' : 'responsibility qualification'}.</p>}
          </div>
          <div className="border-t border-stone-200 dark:border-stone-700 pt-4 space-y-3">
            <h4 className="font-semibold text-sm">Present for institutional decision · 1 AP</h4>
            <p className="text-xs text-stone-500">Full adoption, provisional adoption with a stated follow-up condition, or decline pending revision.</p>
            <div className="flex flex-wrap gap-2">
              <button disabled={!state.finalAuditPassed || !state.institutionalReviewCompleted || !canAct(1)} onClick={() => present('full')} className="px-3 py-2 rounded-lg bg-[#C86D33] text-white text-xs disabled:opacity-40">Full adoption</button>
              <button disabled={!state.finalAuditPassed || !state.institutionalReviewCompleted || !canAct(1)} onClick={() => present('provisional')} className="px-3 py-2 rounded-lg border text-xs disabled:opacity-40">Provisional adoption</button>
              <button disabled={!state.finalAuditPassed || !state.institutionalReviewCompleted || !canAct(1)} onClick={() => present('decline')} className="px-3 py-2 rounded-lg border text-xs disabled:opacity-40">Decline pending revision</button>
            </div>
          </div>
        </div>)}
    </>}

    {state.stage === 'COMPLETED' && <div className="rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-8 space-y-3">
      <ShieldCheck className="w-8 h-8 text-emerald-700"/>
      <h3 className="text-2xl font-serif font-bold">Storehouse Reckoning completed</h3>
      <p className="text-sm">The {state.registerDesign === 'movement_ledger' ? 'Movement Ledger' : 'Compact Balance Register'} received {state.adoptionType === 'provisional' ? 'provisional' : 'full'} institutional adoption.</p>
      {state.adoptionCondition && <p className="text-sm">Follow-up condition: {state.adoptionCondition}</p>}
      <p className="text-xs text-stone-600 dark:text-stone-300">The prototype currently awards 500 Career XP and 15,000 Historical Progress XP. The Historical Progress allocation remains subject to the GDD’s Era I progression balancing.</p>
    </div>}
    <div className="text-xs text-stone-500 flex items-center gap-2"><Clock size={14}/> All costs are charged from the shared six-AP Workday budget. Previously retrieved evidence is free to review.</div>
  </div>;
};
