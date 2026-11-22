import React from 'react';
import { StorehouseWorkState, PlayerProfile } from '../types';
import { createStorehouseEvidence } from '../data/initialData';
import { CheckCircle2, ClipboardCheck, FileText, AlertCircle, ArrowRight } from 'lucide-react';

interface StorehouseReckoningProps {
  player: PlayerProfile;
  workState: StorehouseWorkState;
  onUpdateWorkState: (newState: Partial<StorehouseWorkState>) => void;
  onConsumeBlocks: (amount: number) => void;
  onAwardXp: (careerXp: number, historicalXp: number) => void;
  onShowToast: (msg: string) => void;
}

type RecordField = 'opening' | 'dispatched' | 'received' | 'intakeUsable' | 'intakeHeld' | 'issued' | 'closingUsable' | 'closingHeld';
type Recommendation = 'inspect_held_stock' | 'verify_roof_repair' | 'maintain_segregation' | 'assign_blame';
const EVIDENCE_ACTIONS = [
  { id: 'accounts', label: 'Compare opening, dispatch, and arrival records', cost: 1, evidence: ['ev-01', 'ev-02', 'ev-03'], result: 'The opening balance, dispatched quantity, and physical arrival can be compared.' },
  { id: 'intake_issue', label: 'Examine the intake inspection and issue records', cost: 1, evidence: ['ev-04', 'ev-05'], result: 'The initial condition and authorized issue are established.' },
  { id: 'recount', label: 'Review the witnessed physical recount with the Steward', cost: 2, evidence: ['ev-07'], result: 'The current usable and held quantities are established.' },
  { id: 'custody', label: 'Request the Steward’s custody and maintenance notes', cost: 1, evidence: ['ev-06'], result: 'A roof leak is documented, but its precise role in the damage is not.' },
] as const;

const fieldLabels: Record<RecordField, string> = {
  opening: 'Opening usable stock',
  dispatched: 'Dispatched',
  received: 'Physically received',
  intakeUsable: 'Usable at intake',
  intakeHeld: 'Held at intake',
  issued: 'Issued to brewing-house',
  closingUsable: 'Usable at recount',
  closingHeld: 'Held at recount',
};

const recommendations: { id: Recommendation; label: string; detail: string }[] = [
  { id: 'inspect_held_stock', label: 'Inspect the seven held measures', detail: 'Determine their present condition before any are returned to usable stock.' },
  { id: 'verify_roof_repair', label: 'Inspect the north bay and verify the roof repair', detail: 'Check whether the reported leak has been properly addressed.' },
  { id: 'maintain_segregation', label: 'Keep held measures separate pending inspection', detail: 'Prevent uncertain stock from being issued as usable.' },
  { id: 'assign_blame', label: 'Name a person responsible for the damage', detail: 'The current records do not establish individual responsibility.' },
];

export const StorehouseReckoning: React.FC<StorehouseReckoningProps> = ({
  player, workState, onUpdateWorkState, onConsumeBlocks, onAwardXp, onShowToast,
}) => {
  const state = workState;
  const examined = state.examinedEvidence ?? [];
  const completed = state.completedActions ?? [];
  const evidence = createStorehouseEvidence();
  const record = state.reconciliationDraft ?? {};
  const citations = state.reconciliationSources ?? [];
  const selectedRecommendations = state.recommendations ?? [];
  const has = (id: string) => completed.includes(id);
  const canAct = (cost: number) => player.blocksRemaining >= cost;
  const assessment = state.assessment ?? null;

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

  const acquire = (id: typeof EVIDENCE_ACTIONS[number]['id']) => {
    if (has(id)) return;
    const action = EVIDENCE_ACTIONS.find((item) => item.id === id);
    if (!action) return;
    commit(action.label, action.cost, {
      completedActions: [...completed, id],
      examinedEvidence: [...new Set([...examined, ...action.evidence])],
    }, action.result);
  };

  const setField = (field: RecordField, value: number | undefined) => {
    onUpdateWorkState({ reconciliationDraft: { ...record, [field]: value }, assessment: null, seniorDisposition: null });
  };
  const toggleCitation = (id: string) => {
    const next = citations.includes(id) ? citations.filter((item) => item !== id) : [...citations, id];
    onUpdateWorkState({ reconciliationSources: next, assessment: null, seniorDisposition: null });
  };
  const toggleRecommendation = (id: Recommendation) => {
    const next = selectedRecommendations.includes(id) ? selectedRecommendations.filter((item) => item !== id) : [...selectedRecommendations, id];
    onUpdateWorkState({ recommendations: next, assessment: null, seniorDisposition: null });
  };

  const allEvidenceReady = ['ev-01','ev-02','ev-03','ev-04','ev-05','ev-07'].every((id) => examined.includes(id));
  const draftReady = allEvidenceReady && has('accounts') && has('intake_issue') && has('recount');

  const assess = () => {
    const accountingValid =
      record.opening === 24 && record.dispatched === 60 && record.received === 60 &&
      record.intakeUsable === 56 && record.intakeHeld === 4 && record.issued === 30 &&
      record.closingUsable === 47 && record.closingHeld === 7 &&
      record.dispatched === record.received &&
      record.intakeUsable! + record.intakeHeld! === record.received &&
      record.opening! + record.received! - record.issued! === record.closingUsable! + record.closingHeld! &&
      record.opening! + record.intakeUsable! - record.issued! - 3 === record.closingUsable &&
      record.intakeHeld! + 3 === record.closingHeld;

    const requiredSources = ['ev-01','ev-02','ev-03','ev-04','ev-05','ev-07'];
    const sourcesValid = requiredSources.every((id) => citations.includes(id)) &&
      (state.findingRuling !== 'roof_leak_reported_unproven' || (examined.includes('ev-06') && citations.includes('ev-06')));
    const findingValid = state.findingRuling === 'status_change_cause_unestablished' ||
      (state.findingRuling === 'roof_leak_reported_unproven' && examined.includes('ev-06'));
    const evidenceValid = sourcesValid && findingValid;

    const avoidsBlame = !selectedRecommendations.includes('assign_blame');
    const roofRecommendationSupported = !selectedRecommendations.includes('verify_roof_repair') ||
      (examined.includes('ev-06') && citations.includes('ev-06'));
    // Any one evidence-supported practical action is a defensible recommendation.
    // The options describe different kinds of follow-up, not a mandatory bundle.
    const hasPracticalAction = selectedRecommendations.some((id) =>
      id === 'inspect_held_stock' || id === 'verify_roof_repair' || id === 'maintain_segregation'
    );
    const judgmentValid = avoidsBlame && hasPracticalAction && roofRecommendationSupported && findingValid;

    const judgmentFeedback = !avoidsBlame
      ? 'The records do not establish individual responsibility. Recommend an action that addresses the stock or the storehouse condition without assigning unsupported blame.'
      : !hasPracticalAction
        ? 'Choose at least one practical action supported by the account. A precaution, an inspection, or a supported maintenance follow-up can each be a defensible recommendation.'
        : !roofRecommendationSupported
          ? 'The roof inspection may be appropriate, but first examine and cite E-06, the custody and maintenance record.'
          : selectedRecommendations.length === 1 && selectedRecommendations.includes('maintain_segregation')
            ? 'Keeping the seven held measures separate is a sound immediate precaution. It prevents uncertain stock from being issued as usable. Inspection could determine whether any measures can later be returned to usable stock, but that additional step is not required to make this precaution reasonable.'
            : selectedRecommendations.length === 1 && selectedRecommendations.includes('inspect_held_stock')
              ? 'Inspecting the seven held measures is a sound next action. Their present condition must be established before any are returned to usable stock.'
              : selectedRecommendations.length === 1 && selectedRecommendations.includes('verify_roof_repair')
                ? 'Verifying the roof repair is a sound maintenance follow-up, supported by the custody and maintenance record. It addresses the storehouse condition without claiming the leak caused all the damage.'
                : 'The selected actions are proportionate to the evidence and do not assign unsupported blame. Each is a distinct possible follow-up; no fixed combination is required.';

    const feedback = {
      accounting: accountingValid
        ? 'The quantities reconcile: 60 arrived, 30 were issued, and 54 remain—47 usable and 7 held.'
        : 'The account does not yet reconcile. Check the opening balance, dispatch against physical receipt, intake condition, issue, and closing condition. The three-measure change is a status change, not a disappearance.',
      evidence: evidenceValid
        ? 'The material claims are tied to their records, and the finding stays within what those records establish.'
        : 'Cite the records supporting each material figure. Do not treat the roof leak as proven cause, or name a responsible person, unless the evidence establishes it.',
      judgment: judgmentFeedback,
    };
    const result = { accounting: accountingValid, evidence: evidenceValid, judgment: judgmentValid, feedback };
    const passed = accountingValid && evidenceValid && judgmentValid;
    const cost = state.assessmentSubmitted ? 1 : 2;
    const submitted = commit('Submit reconciliation for Senior Scribe assessment', cost,
      { assessment: result, assessmentSubmitted: true, seniorDisposition: null, revisionPasses: (state.revisionPasses ?? 0) + (state.assessmentSubmitted ? 1 : 0) },
      passed ? 'The submission meets the assessment standards.' : 'The Senior Scribe has identified work that needs correction or further instruction.');
    void submitted;
  };

  const disposition = () => {
    if (!assessment) return;
    if (!canAct(1)) { onShowToast('Not enough AP remaining. The Senior Scribe’s disposition costs 1 AP.'); return; }
    onConsumeBlocks(1);
    if (!assessment.accounting || !assessment.evidence) {
      onUpdateWorkState({ seniorDisposition: 'returned', stage: 'B_DESIGN' });
      onShowToast('The Senior Scribe returns the document for correction. No action is authorized on an unreliable account.');
      return;
    }
    if (!assessment.judgment) {
      onUpdateWorkState({ seniorDisposition: 'account_accepted', stage: 'COMPLETED' });
      onShowToast('The account is accepted, but the recommendation is not authorized. The Senior Scribe will decide what follow-up is appropriate.');
      if (!state.rewardGranted) {
        onAwardXp(500, 15000);
        onUpdateWorkState({ rewardGranted: true });
      }
      return;
    }
    onUpdateWorkState({ seniorDisposition: 'authorized', stage: 'COMPLETED' });
    onShowToast('The Senior Scribe accepts the work and authorizes the proportionate follow-up recommendations.');
    if (!state.rewardGranted) {
      onAwardXp(500, 15000);
      onUpdateWorkState({ rewardGranted: true });
    }
  };

  const revise = () => {
    onUpdateWorkState({ assessment: null, assessmentSubmitted: true, seniorDisposition: null, revisionPasses: (state.revisionPasses ?? 0) + 1 });
    onShowToast('The submission is reopened. Correct the document and submit it for assessment again.');
  };

  const section = (title: string, subtitle: string, children: React.ReactNode) => (
    <section className="bg-white dark:bg-stone-900 border border-[#D6CEBE] dark:border-stone-800 rounded-2xl p-6 space-y-4">
      <div><h3 className="text-lg font-serif font-bold">{title}</h3><p className="text-xs text-stone-500 mt-1">{subtitle}</p></div>
      {children}
    </section>
  );

  const isComplete = state.stage === 'COMPLETED' || state.seniorDisposition === 'authorized' || state.seniorDisposition === 'account_accepted';

  return <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
    <header className="bg-[#FAF7F0] dark:bg-stone-900 border border-[#D6CEBE] dark:border-stone-800 rounded-2xl p-7">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider font-mono text-[#C86D33]">Era I mandatory Work · Uruk c. 3200 BCE</div>
          <h2 className="text-3xl font-serif font-bold mt-2">The Storehouse Reckoning</h2>
          <p className="text-sm text-stone-600 dark:text-stone-300 mt-2 max-w-3xl">A supervised apprenticeship assessment. Prepare a one-time reconciliation for the Storehouse Steward, explain what the records establish, and recommend proportionate action to your Senior Scribe.</p>
        </div>
        <div className="rounded-xl bg-white dark:bg-stone-800 border border-[#D6CEBE] dark:border-stone-700 p-4 min-w-40">
          <div className="text-xs text-stone-500">Workday AP</div>
          <div className="text-2xl font-mono font-bold">{player.blocksRemaining} / 6</div>
          <div className="text-xs text-stone-500 mt-1">Apprentice submission</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-6">
        {[
          ['01','Examine the case',allEvidenceReady],
          ['02','Prepare the document',Boolean(state.assessmentSubmitted)],
          ['03','Assessment & disposition',isComplete],
        ].map(([number,label,ready]) => <div key={String(number)} className="rounded-lg border border-[#D6CEBE] dark:border-stone-700 p-3">
          <div className="text-xs font-mono text-stone-500">{number}</div><div className="text-sm font-semibold">{label}</div>
          <div className={'text-xs mt-1 ' + (ready ? 'text-emerald-600' : 'text-stone-400')}>{ready ? 'Complete' : 'In progress'}</div>
        </div>)}
      </div>
    </header>

    <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-6">
      {section('The assignment', 'From Senior Scribe Shuruppak-ilu', <>
        <div className="rounded-lg bg-[#FAF7F0] dark:bg-stone-800 p-4 text-sm leading-relaxed">
          <p>“The Storehouse Steward has submitted an account of the barley held in the central storehouse. The earlier intake record and the present count do not describe the stock in the same condition.</p>
          <p className="mt-2">Prepare a reconciliation for the Steward. Show what was received, what was issued, what remains, and what changed in condition. Distinguish what the records establish from what they merely suggest. Recommend what should be done next. I will assess your account and your judgment before anything is authorized.”</p>
        </div>
        <div className="space-y-2 text-xs text-stone-600 dark:text-stone-300">
          <p><strong>Your task:</strong> prepare a one-time document, not a permanent stockkeeping system.</p>
          <p><strong>Primary reader:</strong> Storehouse Steward Ur-Nanna.</p>
          <p><strong>Person you answer to:</strong> Senior Scribe Shuruppak-ilu.</p>
        </div>
      </>)}
      {section('Case records', 'Choose an examination. Its records appear directly below and remain visible for rereading.', <>
        <div className="space-y-3">
          {EVIDENCE_ACTIONS.map((action) => <div key={action.id} className="rounded-xl border border-[#D6CEBE] dark:border-stone-700 p-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold">{action.label}</div>
                <div className="text-xs text-stone-500 mt-1">{has(action.id) ? action.result : 'Records: ' + action.evidence.map((id) => evidence.find((item) => item.id === id)?.code).join(', ') + ' · ' + action.cost + ' AP'}</div>
              </div>
              {has(action.id)
                ? <span className="text-xs text-emerald-600 flex items-center gap-1 shrink-0"><CheckCircle2 size={14}/> Examined</span>
                : <button disabled={!canAct(action.cost) || isComplete} onClick={() => acquire(action.id)} className="px-3 py-2 text-xs rounded-lg bg-[#2B1B17] text-white disabled:opacity-40 shrink-0">Examine · {action.cost} AP</button>}
            </div>
            {has(action.id) && <div className="mt-3 space-y-2">{action.evidence.map((id) => { const item = evidence.find((entry) => entry.id === id); return item ? <div key={item.id} className="rounded-lg bg-[#FAF7F0] dark:bg-stone-800 p-3"><div className="text-xs font-mono text-[#C86D33]">{item.code} · {item.title}</div><p className="text-xs text-stone-700 dark:text-stone-300 mt-1">{item.content}</p><p className="text-xs text-stone-400 mt-1">Source: {item.source}</p></div> : null; })}</div>}
          </div>)}
        </div>
      </>)}
    </div>

    {section('Prepare the reconciliation', 'Use the source records and the accounting guide to construct a defensible account. The Senior Scribe is assessing your method and judgment, not testing whether you can guess an unstated rule.', <>
      {!draftReady && <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 p-3 text-xs text-amber-800 dark:text-amber-200">Examine the account records, intake and issue records, and physical recount before submitting. The custody notes are optional unless you choose to discuss the reported roof leak.</div>}
      <div className="rounded-xl border border-[#D6CEBE] dark:border-stone-700 p-4 space-y-3">
        <div><h4 className="text-sm font-semibold">How to read the account</h4><p className="text-xs text-stone-500 mt-1">A reconciliation follows the stock through time. Each record answers a different question; do not treat every quantity as the same kind of movement.</p></div>
        <ol className="list-decimal pl-5 space-y-2 text-xs text-stone-700 dark:text-stone-300">
          <li><strong>Begin with what was already there.</strong> E-01 is the opening usable balance before this delivery.</li>
          <li><strong>Check what was sent against what arrived.</strong> E-02 records the quantity dispatched; E-03 records the quantity physically received. Compare them, but count the received quantity—not the dispatch instruction—as stock entering this storehouse.</li>
          <li><strong>Separate condition at intake.</strong> E-04 divides the received stock into usable and held. Those two categories together should account for the whole receipt. Held stock is still physically present; it is not an issue or a loss.</li>
          <li><strong>Subtract what was issued.</strong> E-05 records an authorized issue to the brewing-house. It reduces the storehouse's stock, and because the record says usable measures were issued, it reduces the usable balance.</li>
          <li><strong>Compare the later count with the expected balance.</strong> E-07 is a new physical count, divided into usable and held. Compare both categories as well as their combined total.</li>
        </ol>
        <div className="rounded-lg bg-[#FAF7F0] dark:bg-stone-800 p-3 space-y-2 text-xs">
          <div className="font-semibold">Work through the checks</div>
          <p><strong>Total stock:</strong> opening stock + physical receipt − issue = expected closing total. Compare that result with usable-at-recount + held-at-recount.</p>
          <p><strong>Usable stock:</strong> opening usable + usable received − usable issued = expected usable before any later condition change. Compare that with the later usable count.</p>
          <p><strong>Held stock:</strong> compare the held quantity at intake with the held quantity at recount. If total stock still balances but usable stock falls while held stock rises by the same amount, the difference is a change of condition—not missing stock.</p>
          <p className="text-stone-500">The records establish quantities and sequence. E-06 adds a reported roof leak, but because the timing of moisture spread was not recorded, it does not prove that the leak caused all later damage or identify a responsible person.</p>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">{(Object.keys(fieldLabels) as RecordField[]).map((field) => <label key={field} className="text-xs text-stone-600 dark:text-stone-300">
        <span className="block mb-1">{fieldLabels[field]}</span><input type="number" min="0" disabled={isComplete} value={record[field] ?? ''} onChange={(event) => setField(field, event.target.value === '' ? undefined : Number(event.target.value))} className="w-full rounded-lg border border-[#D6CEBE] dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-2"/>
      </label>)}</div>
      <div className="rounded-lg bg-[#FAF7F0] dark:bg-stone-800 p-4 text-xs space-y-1"><div className="font-semibold">Transaction context established by the records</div><p>60 measures were dispatched from the outer fields to the central storehouse. The storehouse received 60. Later, 30 usable measures were issued to the brewing-house operation under temple decree for its brewing work.</p><div className="font-semibold pt-2">What the document must make clear</div><p>Dispatch is not the same thing as physical receipt. Intake condition is not the same thing as later condition. Held stock is still physically present. A change in condition is not automatically a loss.</p></div>
      <div className="space-y-2"><div className="text-sm font-semibold">Finding</div>
        <label className="flex gap-2 items-start text-sm"><input type="radio" name="finding" checked={state.findingRuling === 'status_change_cause_unestablished'} disabled={isComplete} onChange={() => onUpdateWorkState({ findingRuling: 'status_change_cause_unestablished', assessment: null, seniorDisposition: null })}/> <span>The records show a change in stock condition; the cause of the additional damage is not established.</span></label>
        <label className="flex gap-2 items-start text-sm"><input type="radio" name="finding" checked={state.findingRuling === 'roof_leak_reported_unproven'} disabled={isComplete || !examined.includes('ev-06')} onChange={() => onUpdateWorkState({ findingRuling: 'roof_leak_reported_unproven', assessment: null, seniorDisposition: null })}/> <span>A roof leak was reported after intake, but its exact contribution to the damage is not established. <span className="text-xs text-stone-500">(Requires E-06)</span></span></label>
        <label className="flex gap-2 items-start text-sm"><input type="radio" name="finding" checked={state.findingRuling === 'stock_loss'} disabled={isComplete} onChange={() => onUpdateWorkState({ findingRuling: 'stock_loss', assessment: null, seniorDisposition: null })}/> <span>Three measures of stock are missing.</span></label>
        <label className="flex gap-2 items-start text-sm"><input type="radio" name="finding" checked={state.findingRuling === 'carrier_blame'} disabled={isComplete} onChange={() => onUpdateWorkState({ findingRuling: 'carrier_blame', assessment: null, seniorDisposition: null })}/> <span>The carrier is responsible for the damaged stock.</span></label>
      </div>
      <div className="space-y-2"><div className="text-sm font-semibold">Source references</div><p className="text-xs text-stone-500">Select the records that support the figures and finding in your document.</p>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">{evidence.filter((item) => examined.includes(item.id)).map((item) => <label key={item.id} className="flex items-center gap-2 text-xs"><input type="checkbox" checked={citations.includes(item.id)} disabled={isComplete} onChange={() => toggleCitation(item.id)}/>{item.code} · {item.title}</label>)}</div>
      </div>
      <div className="space-y-3"><div><div className="text-sm font-semibold">Recommendation to the Senior Scribe</div><p className="text-xs text-stone-500">What should the institution do next? Select the actions you believe the evidence supports.</p></div>
        {recommendations.map((item) => <label key={item.id} className="flex gap-2 items-start rounded-lg border border-[#D6CEBE] dark:border-stone-700 p-3"><input type="checkbox" checked={selectedRecommendations.includes(item.id)} disabled={isComplete} onChange={() => toggleRecommendation(item.id)} className="mt-1"/><span><span className="block text-sm font-medium">{item.label}</span><span className="block text-xs text-stone-500 mt-1">{item.detail}</span></span></label>)}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2"><p className="text-xs text-stone-500">Drafting and submission: 2 AP. Revision and resubmission: 1 AP.</p><button disabled={!draftReady || !canAct(state.assessmentSubmitted ? 1 : 2) || isComplete} onClick={assess} className="px-4 py-2 rounded-lg bg-[#C86D33] text-white text-sm disabled:opacity-40">{state.assessmentSubmitted ? 'Revise and resubmit' : 'Submit to Senior Scribe'} <ArrowRight size={14} className="inline ml-1"/></button></div>
    </>)}

    {assessment && section('Senior Scribe assessment', 'The work is assessed in separate dimensions. A correct account does not automatically make a recommendation sound.', <>
      <div className="grid md:grid-cols-3 gap-3">{([
        ['Accounting',assessment.accounting,assessment.feedback.accounting],['Evidence & provenance',assessment.evidence,assessment.feedback.evidence],['Professional judgment',assessment.judgment,assessment.feedback.judgment],
      ] as const).map(([label,passed,feedback]) => <div key={label} className="rounded-lg border border-[#D6CEBE] dark:border-stone-700 p-4"><div className="flex items-center gap-2 text-sm font-semibold">{passed ? <CheckCircle2 size={16} className="text-emerald-600"/> : <AlertCircle size={16} className="text-amber-600"/>}{label}</div><p className="text-xs text-stone-600 dark:text-stone-300 mt-2">{feedback}</p></div>)}</div>
      <div className="rounded-lg bg-[#FAF7F0] dark:bg-stone-800 p-4 space-y-2"><div className="flex items-center gap-2 text-sm font-semibold"><ClipboardCheck size={16}/> Instruction from Shuruppak-ilu</div><p className="text-sm">“A record is not made reliable by making every column agree. It is reliable when each figure has a source, each movement is represented honestly, and the reader can see where certainty ends. Your recommendation is a separate matter: tell me what should be done, and show me why the records justify it.”</p><p className="text-xs text-stone-500">The assessment identifies what must be corrected. Revise the document and submit it again if the account or evidence is deficient.</p></div>
      {!isComplete && <div className="flex flex-wrap gap-3 justify-end">{(!assessment.accounting || !assessment.evidence || !assessment.judgment) && <button onClick={revise} className="px-4 py-2 rounded-lg border border-[#D6CEBE] text-sm">Revise document</button>}<button disabled={!canAct(1)} onClick={disposition} className="px-4 py-2 rounded-lg bg-[#2B1B17] text-white text-sm disabled:opacity-40">Senior Scribe decides disposition · 1 AP</button></div>}
    </>)}

    {isComplete && section('Disposition', 'The Senior Scribe has made a decision about the submission.', <>
      <div className="rounded-lg bg-[#FAF7F0] dark:bg-stone-800 p-4 text-sm">{state.seniorDisposition === 'authorized' ? 'The account is accepted. The Senior Scribe authorizes the following follow-up:' : state.seniorDisposition === 'account_accepted' ? 'The figures and source record are accepted, but the recommendation is not approved. The Senior Scribe will determine the necessary follow-up separately.' : 'The document has been returned for correction.'}{state.seniorDisposition === 'authorized' && <ul className="list-disc pl-5 mt-2">{selectedRecommendations.filter((id) => id !== 'assign_blame').map((id) => <li key={id}>{recommendations.find((item) => item.id === id)?.label}</li>)}</ul>}{state.seniorDisposition === 'authorized' && <p className="mt-2">No individual is held responsible on the present evidence.</p>}</div>
      <div className="text-xs text-stone-500">Assessment: accounting {assessment?.accounting ? 'satisfactory' : 'requires correction'} · evidence {assessment?.evidence ? 'satisfactory' : 'requires correction'} · judgment {assessment?.judgment ? 'satisfactory' : 'requires correction'}</div>
    </>)}

    <div className="rounded-xl border border-[#D6CEBE] dark:border-stone-800 p-4 flex items-start gap-3 text-xs text-stone-500"><FileText size={16} className="shrink-0 mt-0.5"/><p>This is a one-time reconciliation prepared for the Storehouse Steward. It is not a design exercise for a permanent register, and the apprentice does not independently authorize institutional action.</p></div>
  </div>;
};
