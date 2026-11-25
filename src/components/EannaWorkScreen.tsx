import React from 'react';
import { useGame } from '../state/GameProvider';
import { STOREHOUSE_WORK_ID } from '../works/storehouseReckoning';
import {
  EANNA_PROVISIONING_WORK_ID, EANNA_SOURCE_PACKET,
  type EannaScenarioData, type EannaSourceId, type EannaSourceClass,
} from '../works/eannaProvisioning';

const classNames: Record<EannaSourceClass, string> = {
  written_tally: 'Written tally', physical_count: 'Physical count', spoken_claim: 'Spoken claim',
};
const obverseLines: Record<string, string> = {
  'eanna-ninkasi-barley-request': 'Nin-kasi · barley · 12 capacity measures',
  'eanna-geme-inana-barley-request': 'Geme-Inana · barley · 9 capacity measures',
  'eanna-bread-group-barley-request': 'Bread preparation · barley · 8 capacity measures',
  'eanna-offering-vessel-request': 'Inana-associated offering · 6 beer vessels',
};
function TabletFace({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-xl border border-amber-900/30 bg-[#d8c59e] p-4 shadow-inner">
    <h3 className="border-b border-amber-950/30 pb-2 text-xs font-semibold uppercase tracking-widest text-amber-950">{title}</h3>
    <div className="mt-3 space-y-2 font-serif text-sm leading-6 text-stone-950">{children}</div>
  </section>;
}

export function EannaWorkScreen({ onBack }: { onBack: () => void }) {
  const game = useGame();
  const state = game.state;
  const workId = EANNA_PROVISIONING_WORK_ID;
  const progress = state.works.progress[workId];
  const tutorialComplete = state.works.progress[STOREHOUSE_WORK_ID]?.status === 'completed';
  const canStart = tutorialComplete && state.calendar.dayNumber >= 35;
  const active = progress?.status === 'active' && state.works.activeWorkId === workId;
  const scenario = progress?.scenarioData as EannaScenarioData | undefined;
  const done = (id: string) => progress?.completedActionIds.includes(id) ?? false;
  const setData = (next: EannaScenarioData) => game.dispatch({ type: 'SET_WORK_SCENARIO_DATA', workId, scenarioData: next });
  const finishStage = (actionId: string, stage: number) => scenario && game.dispatch({
    type: 'COMPLETE_WORK_ACTION', workId, actionId, scenarioData: { ...scenario, stage },
  });
  const late = state.calendar.dayNumber > 38;
  const officialReview = state.calendar.dayNumber > 42;

  if (!progress) return <div className="mx-auto max-w-5xl space-y-4">
    <button onClick={onBack} className="text-sm text-amber-800 hover:underline">← Workday</button>
    <section className="rounded-xl border border-stone-300 bg-white p-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">Era I · Career-scale Work</p>
      <h1 className="mt-1 font-serif text-3xl font-semibold text-stone-900">The Eanna Provisioning Undertaking</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-700">Compile Eanna’s separate household and offering requests onto one Consolidated Summary Tablet. Keep the obverse entries distinct, consolidate only compatible totals on the reverse, and prepare an allocation for Lu-Nanshe’s decision.</p>
      <p className="mt-3 text-sm text-stone-600">The full compilation window is Days 35–38. The gathering is scheduled for Day 39. A later compilation remains possible, but the gathering will have proceeded at reduced scope.</p>
      {!tutorialComplete ? <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Complete the Storehouse Reckoning tutorial first.</p>
        : !canStart ? <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Available from Day 35. Current day: {state.calendar.dayNumber}.</p>
          : <button onClick={() => game.dispatch({ type: 'START_WORK', workId })} className="mt-5 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white">Begin Work · no AP cost</button>}
    </section>
  </div>;

  if (progress.status === 'suspended') return <section role="status" className="rounded-xl border border-amber-300 bg-amber-50 p-6">
    <h1 className="font-serif text-2xl font-semibold">Saved Work unavailable</h1>
    <p className="mt-2 text-sm text-stone-700">The saved undertaking is preserved, but this version cannot confirm compatibility.</p>
    <button onClick={onBack} className="mt-4 underline">Return to Workday</button>
  </section>;
  if (!scenario) return null;

  const setClass = (id: EannaSourceId, value: EannaSourceClass) => setData({
    ...scenario, sourceClassifications: { ...scenario.sourceClassifications, [id]: value },
  });
  const toggleObverse = (id: EannaSourceId) => setData({
    ...scenario, obverseEntries: scenario.obverseEntries.includes(id)
      ? scenario.obverseEntries.filter((item) => item !== id) : [...scenario.obverseEntries, id],
  });
  const setNumber = (key: keyof EannaScenarioData['proposal'], value: number) => setData({
    ...scenario, proposal: { ...scenario.proposal, [key]: Math.max(0, Math.min(99, value)) },
  });
  const p = scenario.proposal;
  const barleyTotal = p.ninKasiBarley + p.breadGroupBarley + p.gemeInanaBarley;
  const proposalValid = p.ninKasiBarley <= 12 && p.breadGroupBarley <= 8 && p.gemeInanaBarley <= 9
    && barleyTotal > 0 && barleyTotal <= 18 && p.offeringBeerVessels <= 4;
  const sortingComplete = EANNA_SOURCE_PACKET.every((item) => scenario.sourceClassifications[item.id] !== undefined);
  const obverseIds = EANNA_SOURCE_PACKET.filter((item) => item.obverse).map((item) => item.id);
  const obverseComplete = obverseIds.every((id) => scenario.obverseEntries.includes(id));
  const submitCost = 1;
  const canSubmit = active && done('final-check') && !(progress.pendingDisposition
    && progress.lastAssessment?.outcome === 'accepted'
    && progress.lastAssessment.dimensions.every((item) => item.status === 'meets'));
  const submit = () => game.dispatch({ type: 'SUBMIT_WORK', workId });
  const dispose = (value: 'ratify_proposal' | 'adjust_to_default' | 'carry_forward') =>
    game.dispatch({ type: 'DISPOSE_WORK', workId, disposition: value });

  return <div className="mx-auto max-w-6xl space-y-5">
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div><button onClick={onBack} className="mb-2 text-sm text-amber-800 hover:underline">← Workday</button>
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-800">Era I · Eanna · Day {state.calendar.dayNumber}</p>
        <h1 className="font-serif text-3xl font-semibold text-stone-900">The Eanna Provisioning Undertaking</h1>
        <p className="mt-1 text-sm text-stone-600">Four stages · Consolidated Summary Tablet · 9 AP normal path</p></div>
      <div className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm">
        <span className="text-stone-500">AP remaining</span><p className="font-mono text-2xl font-semibold">{state.actionEconomy.apRemaining}/{state.actionEconomy.dailyApAllocation}</p>
        <p className="text-xs text-stone-500">2 AP on this Workday earns +1 Provision at settlement</p>
      </div>
    </header>
    {late && <p role="status" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">{officialReview ? 'The retrospective window (Days 39–42) has passed. Lu-Nanshe can now review the surviving source records and accept a qualified retrospective account. Record today’s review; do not backdate the tablet or imply that the full gathering was supplied.' : 'The full window has passed. The gathering proceeded at reduced scope on Day 39. Complete the retrospective compilation by Day 42; do not backdate the tablet or imply that the full gathering was supplied.'}</p>}
    <section className="rounded-xl border border-stone-300 bg-white p-4">
      <h2 className="font-serif text-xl font-semibold">The people around the work</h2>
      <div className="mt-3 grid gap-2 md:grid-cols-2 text-sm text-stone-700">
        <p><strong>Nin-kasi:</strong> “If the barley goes elsewhere, my work waits.”</p>
        <p><strong>Geme-Inana:</strong> “My people are already set to work.”</p>
        <p><strong>Enlil-kisu:</strong> “Three more measures may come later. I cannot put them on the count now.”</p>
        <p><strong>Lu-Nanshe:</strong> “Bring me the separate counts. I will decide what is assigned.”</p>
      </div>
    </section>

    <section className="rounded-xl border border-stone-300 bg-white p-5">
      <h2 className="font-serif text-xl font-semibold">Stage 1 · Sort the sources <span className="text-xs font-sans text-stone-500">{done('sort-sources') ? 'Complete' : '· 1 AP'}</span></h2>
      <p className="mt-1 text-sm text-stone-600">Distinguish written tallies, physical counts, and spoken expectations before transcription.</p>
      <div className="mt-3 space-y-2">{EANNA_SOURCE_PACKET.map((item) => <label key={item.id} className="grid gap-2 rounded-lg bg-stone-50 p-3 md:grid-cols-[1fr_190px] md:items-center">
        <span><strong className="block text-sm text-stone-800">{item.title}</strong><span className="text-sm text-stone-700">{item.text}</span><span className="block text-xs text-stone-500">{item.source}</span></span>
        <span className="text-xs text-stone-600">Source class<select aria-label={`Source class for ${item.title}`} disabled={!active} value={scenario.sourceClassifications[item.id] ?? ''} onChange={(e) => setClass(item.id, e.target.value as EannaSourceClass)} className="mt-1 w-full rounded border border-stone-300 bg-white p-2 text-sm">
          <option value="">Choose</option>{Object.entries(classNames).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></span>
      </label>)}</div>
      <button disabled={!active || done('sort-sources') || !sortingComplete || state.actionEconomy.apRemaining < 1} onClick={() => finishStage('sort-sources',1)} className="mt-3 rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">{done('sort-sources') ? 'Sources sorted' : 'Complete sorting · 1 AP'}</button>
    </section>

    <section className="rounded-xl border border-stone-300 bg-white p-5">
      <h2 className="font-serif text-xl font-semibold">Stage 2 · Compile the obverse <span className="text-xs font-sans text-stone-500">{done('compile-obverse') ? 'Complete' : '· 2 AP'}</span></h2>
      <p className="mt-1 text-sm text-stone-600">Keep each written request on its own line and in its own unit.</p>
      <div className="mt-3 space-y-2">{EANNA_SOURCE_PACKET.filter((item) => item.obverse).map((item) => <label key={item.id} className="flex gap-2 rounded-lg bg-stone-50 p-3 text-sm text-stone-700">
        <input type="checkbox" disabled={!active || !done('sort-sources')} checked={scenario.obverseEntries.includes(item.id)} onChange={() => toggleObverse(item.id)} />
        {obverseLines[item.id]}
      </label>)}</div>
      <button disabled={!active || done('compile-obverse') || !done('sort-sources') || !obverseComplete || state.actionEconomy.apRemaining < 2} onClick={() => finishStage('compile-obverse',2)} className="mt-3 rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">{done('compile-obverse') ? 'Obverse compiled' : 'Compile obverse · 2 AP'}</button>
    </section>

    <section className="rounded-xl border border-stone-300 bg-white p-5">
      <h2 className="font-serif text-xl font-semibold">Stage 3 · Consolidate the reverse <span className="text-xs font-sans text-stone-500">{done('consolidate-reverse') ? 'Complete' : '· 3 AP'}</span></h2>
      <p className="mt-1 text-sm text-stone-600">Barley: 29 requested against 18 counted. Beer vessels: 6 requested, 4 prepared. These units remain separate.</p>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="rounded-lg bg-stone-50 p-3"><h3 className="font-semibold">Barley allocation · capacity measures</h3>
          {([['ninKasiBarley','Nin-kasi · request 12'],['breadGroupBarley','Bread preparation · request 8'],['gemeInanaBarley','Geme-Inana · request 9']] as const).map(([key,label]) => <label key={key} className="mt-2 flex items-center justify-between gap-2 text-sm">{label}<input type="number" min="0" max="18" disabled={!active || !done('compile-obverse')} value={p[key]} onChange={(e) => setNumber(key,Number(e.target.value))} className="w-20 rounded border border-stone-300 bg-white p-1.5 text-right font-mono" /></label>)}
          <p className="mt-3 text-sm font-semibold">Proposed {barleyTotal} / 18 · {18-barleyTotal} unallocated</p>
        </div>
        <div className="rounded-lg bg-stone-50 p-3"><h3 className="font-semibold">Offering · discrete beer vessels</h3><p className="mt-1 text-sm text-stone-600">6 requested · 4 prepared</p>
          <label className="mt-3 flex items-center justify-between gap-2 text-sm">Proposed allocation<input type="number" min="0" max="4" disabled={!active || !done('compile-obverse')} value={p.offeringBeerVessels} onChange={(e) => setNumber('offeringBeerVessels',Number(e.target.value))} className="w-20 rounded border border-stone-300 bg-white p-1.5 text-right font-mono" /></label>
          <p className="mt-3 text-sm font-semibold">Unmet request: {6-p.offeringBeerVessels} vessels</p>
        </div>
      </div>
      <button disabled={!active || done('consolidate-reverse') || !done('compile-obverse') || !proposalValid || state.actionEconomy.apRemaining < 3} onClick={() => finishStage('consolidate-reverse',3)} className="mt-3 rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">{done('consolidate-reverse') ? 'Reverse consolidated' : 'Consolidate reverse · 3 AP'}</button>
    </section>

    <section className="rounded-xl border border-stone-300 bg-white p-5">
      <h2 className="font-serif text-xl font-semibold">Stage 4 · Final check <span className="text-xs font-sans text-stone-500">{done('final-check') ? 'Complete' : '· 1 AP'}</span></h2>
      <p className="mt-1 text-sm text-stone-600">The reverse is a proposal, not an order. Lu-Nanshe retains allocation and sealing authority.</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <TabletFace title="Obverse · Separate entries">{scenario.obverseEntries.map((id) => <p key={id}>{obverseLines[id]}</p>)}</TabletFace>
        <TabletFace title="Reverse · Totals and proposal">
          <p>Barley available · 18 capacity measures</p><p>Barley requested · 29 capacity measures</p><p>Barley shortfall · 11 capacity measures</p>
          <p>Beer vessels requested · 6</p><p>Beer vessels prepared · 4</p>
          <p>Proposal · Nin-kasi {p.ninKasiBarley} · Bread {p.breadGroupBarley} · Geme-Inana {p.gemeInanaBarley}</p><p>Beer vessels · {p.offeringBeerVessels}</p>
        </TabletFace>
      </div>
      <button disabled={!active || done('final-check') || !done('consolidate-reverse') || state.actionEconomy.apRemaining < 1} onClick={() => finishStage('final-check',4)} className="mt-3 rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">{done('final-check') ? 'Final check complete' : 'Complete final check · 1 AP'}</button>
    </section>

    {progress.status === 'active' && <section className="rounded-xl border border-stone-300 bg-white p-5">
      <h2 className="font-serif text-xl font-semibold">Submit the tablet · 1 AP</h2>
      <button disabled={!canSubmit || state.actionEconomy.apRemaining < submitCost} onClick={submit} className="mt-3 rounded-lg bg-amber-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">{progress.submissionCount ? 'Resubmit tablet' : 'Submit for assessment'} · 1 AP</button>
      {progress.lastAssessment && <div className="mt-4 rounded-lg bg-stone-50 p-3"><h3 className="font-semibold">Assessment</h3><p className="mt-1 text-sm">{progress.lastAssessment.summary}</p><ul className="mt-2 space-y-1 text-sm">{progress.lastAssessment.dimensions.map((d) => <li key={d.dimension}><strong>{d.dimension} · {d.status}:</strong> {d.summary}</li>)}</ul></div>}
      {progress.pendingDisposition && progress.lastAssessment?.outcome === 'accepted' && <div className="mt-4 border-t pt-4">
        <h3 className="font-semibold">Lu-Nanshe’s official disposition · 1 AP</h3><p className="mt-1 text-sm text-stone-600">She may ratify the proposal, adjust to the default allocation, or authorize a later account for unmet quantities.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button disabled={!active || state.actionEconomy.apRemaining < 1} onClick={() => dispose('ratify_proposal')} className="rounded border px-3 py-2 text-sm">Ratify proposal · 1 AP</button>
          <button disabled={!active || state.actionEconomy.apRemaining < 1} onClick={() => dispose('adjust_to_default')} className="rounded bg-stone-900 px-3 py-2 text-sm font-semibold text-white">Adjust to default · 1 AP</button>
          <button disabled={!active || state.actionEconomy.apRemaining < 1} onClick={() => dispose('carry_forward')} className="rounded border border-amber-700 px-3 py-2 text-sm">Carry unmet quantities forward · 1 AP</button>
        </div>
      </div>}
    </section>}
    {progress.status === 'completed' && <section role="status" className="rounded-xl border border-emerald-300 bg-emerald-50 p-5">
      <h2 className="font-serif text-xl font-semibold">Work accepted</h2><p className="mt-2 text-sm">Lu-Nanshe’s disposition is recorded. The originating compilation matter is closed; any authorized carry-forward remains separate.</p><p className="mt-2 font-semibold">+100 Historical Progress XP · awarded once</p>
    </section>}
  </div>;
}
