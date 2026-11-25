import React from 'react';
import { useGame } from '../state/GameProvider';
import { SealImpression } from './SealImpression';
import {
  EANNA_WORK_ID,
  EANNA_SUMMARY_RECORD_ID,
} from '../works/eannaProvisioning';
import { STOREHOUSE_WORK_ID } from '../works/storehouseReckoning';
import type {
  EannaAllocationField,
  EannaObverseField,
  EannaProvisioningScenario,
  EannaSourceClassification,
  EannaSourceId,
} from '../works/eannaProvisioning';

const SOURCE_ROWS: Array<{ id: EannaSourceId; label: string; note: string }> = [
  { id: 'ninKasiRequest', label: 'Nin-kasi’s barley request', note: '12 barley capacity measures' },
  { id: 'gemeInanaRequest', label: 'Geme-Inana’s household request', note: '9 barley capacity measures' },
  { id: 'breadPreparationRequest', label: 'Gathering bread-preparation tally', note: '8 barley capacity measures' },
  { id: 'storehouseBarleyCount', label: 'Ur-Nanna’s storehouse count', note: '18 barley capacity measures available' },
  { id: 'offeringVesselRequest', label: 'Offering vessel request', note: '6 discrete beer vessels requested' },
  { id: 'offeringVesselCount', label: 'Prepared vessel count', note: '4 beer vessels counted as prepared' },
  { id: 'enlilKisuExpectation', label: 'Enlil-kisu’s spoken expectation', note: '3 barley capacity measures may arrive after Day 39' },
];

const OBVERSE_FIELDS: Array<{ id: EannaObverseField; label: string; unit: string }> = [
  { id: 'ninKasiBarley', label: 'Nin-kasi · barley request', unit: 'capacity measures' },
  { id: 'gemeInanaBarley', label: 'Geme-Inana · household barley request', unit: 'capacity measures' },
  { id: 'breadPreparationBarley', label: 'Bread preparation · barley request', unit: 'capacity measures' },
  { id: 'availableBarley', label: 'Storehouse · barley counted available', unit: 'capacity measures' },
  { id: 'offeringVesselsRequested', label: 'Offering · beer vessels requested', unit: 'vessels' },
  { id: 'offeringVesselsPrepared', label: 'Offering · beer vessels prepared', unit: 'vessels' },
];

const ALLOCATION_FIELDS: Array<{ id: EannaAllocationField; label: string; requested: number }> = [
  { id: 'ninKasiBarley', label: 'Nin-kasi · brewing-house work', requested: 12 },
  { id: 'breadPreparationBarley', label: 'Gathering bread preparation', requested: 8 },
  { id: 'gemeInanaBarley', label: 'Geme-Inana · household work group', requested: 9 },
];

function TabletFace({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-lg border border-amber-900/30 bg-[#d8bd88] p-4 text-stone-950 shadow-inner">
    <h3 className="border-b border-stone-900/30 pb-2 text-center font-mono text-xs font-bold uppercase tracking-[0.2em]">{title}</h3>
    <div className="mt-3 space-y-2 font-mono text-sm">{children}</div>
  </section>;
}

function TabletLine({ category, value }: { category: string; value: string | number }) {
  return <div className="flex items-baseline justify-between gap-3 border-b border-stone-900/15 pb-1">
    <span>{category}</span><strong className="text-right">{value}</strong>
  </div>;
}

function NumberField({ label, value, unit, max, onChange }: {
  label: string; value: number | undefined; unit: string; max?: number; onChange: (value: string) => void;
}) {
  return <label className="grid gap-1 text-sm text-stone-800">
    <span className="font-medium">{label}</span>
    <span className="flex items-center gap-2">
      <input aria-label={label} type="number" inputMode="numeric" min={0} max={max} step={1}
        value={value ?? ''} onChange={(event) => onChange(event.target.value)}
        className="w-28 rounded-md border border-stone-300 bg-white px-3 py-2 font-mono text-base" />
      <span className="text-xs text-stone-500">{unit}</span>
    </span>
  </label>;
}

function Voices({ lines }: { lines: Array<[string, string]> }) {
  return <aside aria-label="Spoken dialogue around the work" className="rounded-lg border border-stone-300 bg-white p-4">
    <h3 className="font-semibold text-stone-900">Voices around the work</h3>
    <div className="mt-2 space-y-2 text-sm leading-5 text-stone-700">
      {lines.map(([name, line]) => <p key={name}><strong>{name}:</strong> “{line}”</p>)}
    </div>
    <p className="mt-3 text-xs text-stone-500">These are spoken exchanges. They are not written on the tablet.</p>
  </aside>;
}

export function EannaWorkScreen({ onBack }: { onBack: () => void }) {
  const game = useGame();
  const state = game.state;
  const workId = EANNA_WORK_ID;
  const progress = state.works.progress[workId];
  const day = state.calendar.dayNumber;
  const tutorialComplete = state.works.progress[STOREHOUSE_WORK_ID]?.status === 'completed';
  const active = progress?.status === 'active' && state.works.activeWorkId === workId;
  const scenario = (progress?.scenarioData ?? { sourceSorting: {}, obverse: {}, allocation: {} }) as EannaProvisioningScenario;
  const completed = progress?.completedActionIds ?? [];
  const done = (id: string) => completed.includes(id);
  const updateScenario = (next: EannaProvisioningScenario) => game.dispatch({ type: 'SET_WORK_SCENARIO_DATA', workId, scenarioData: next });
  const updateSource = (id: EannaSourceId, value: EannaSourceClassification) =>
    updateScenario({ ...scenario, sourceSorting: { ...scenario.sourceSorting, [id]: value } });
  const updateObverse = (id: EannaObverseField, raw: string) => {
    const obverse = { ...scenario.obverse };
    if (raw.trim() === '') delete obverse[id];
    else if (Number.isSafeInteger(Number(raw)) && Number(raw) >= 0) obverse[id] = Number(raw);
    updateScenario({ ...scenario, obverse });
  };
  const updateAllocation = (id: EannaAllocationField, raw: string) => {
    const allocation = { ...scenario.allocation };
    if (raw.trim() === '') delete allocation[id];
    else if (Number.isSafeInteger(Number(raw)) && Number(raw) >= 0) allocation[id] = Number(raw);
    updateScenario({ ...scenario, allocation });
  };
  const completeAction = (actionId: string) => game.dispatch({ type: 'COMPLETE_WORK_ACTION', workId, actionId, scenarioData: scenario });
  const canStart = day >= 35 && tutorialComplete && state.works.activeWorkId === null && !progress;
  const start = () => game.dispatch({ type: 'START_WORK', workId });
  const submit = () => game.dispatch({ type: 'SUBMIT_WORK', workId });
  const dispose = (disposition: 'returned' | 'authorized') => game.dispatch({ type: 'DISPOSE_WORK', workId, disposition });
  const assessment = progress?.lastAssessment;
  const allObverseEntered = OBVERSE_FIELDS.every((field) => scenario.obverse[field.id] !== undefined);
  const allAllocationEntered = ALLOCATION_FIELDS.every((field) => scenario.allocation[field.id] !== undefined);
  const allocationTotal = ALLOCATION_FIELDS.reduce((sum, field) => sum + (scenario.allocation[field.id] ?? 0), 0);
  const record = state.records.entries[EANNA_SUMMARY_RECORD_ID];
  const followUp = Object.values(state.world.matters).find((matter) => matter.id === 'matter-era1-eanna-allocation-follow-up');

  if (progress?.status === 'suspended') return <section role="status" className="mx-auto max-w-3xl rounded-xl border border-amber-300 bg-amber-50 p-6">
    <h1 className="font-serif text-2xl font-semibold text-stone-900">Saved Work unavailable</h1>
    <p className="mt-2 text-sm leading-6 text-stone-700">This saved Eanna Work is preserved, but its progress version cannot be confirmed as compatible. It has not been reset or failed. Return to the Workday Hub to continue other activities.</p>
    <button onClick={onBack} className="mt-4 underline">Return to Workday</button>
  </section>;

  if (progress?.status === 'completed') return <div className="mx-auto max-w-6xl space-y-5">
    <button onClick={onBack} className="text-sm text-amber-800 hover:underline">← Workday</button>
    <header><p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">Era I · Uruk · Historical Work</p><h1 className="mt-1 font-serif text-3xl font-semibold text-stone-900">The Eanna Provisioning Undertaking</h1><p className="mt-2 text-sm text-stone-600">Your compilation is complete. The wider allocation follow-up remains a separate institutional matter.</p></header>
    <div className="flex flex-wrap items-center gap-4 rounded-xl border border-stone-300 bg-white p-5">
      <SealImpression status="authorized" institutionName="Eanna Precinct" dayNumber={day} />
      <div><h2 className="font-semibold text-stone-900">Lu-Nanshe’s disposition recorded</h2><p className="mt-1 text-sm text-stone-600">The Consolidated Summary Tablet is retained as a RecordEntry. Historical Progress XP was awarded once at accepted disposition.</p><p className="mt-2 text-sm font-medium">Historical Progress XP: {state.historicalProgression.historicalXp.toLocaleString()}</p></div>
    </div>
    {record && <section className="rounded-xl border border-stone-300 bg-white p-5"><h2 className="font-serif text-xl font-semibold">Durable record</h2><p className="mt-2 text-sm">{record.title}</p><ul className="mt-2 list-disc pl-5 text-sm text-stone-600">{record.assertions.slice(0, 7).map((item) => <li key={item.id}>{item.text}</li>)}</ul></section>}
    {followUp && <section className="rounded-xl border border-amber-300 bg-amber-50 p-5"><h2 className="font-semibold text-stone-900">Still open</h2><p className="mt-1 text-sm text-stone-700">{followUp.summary}</p></section>}
    <button onClick={onBack} className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white">Return to Workday</button>
  </div>;

  if (!progress) return <div className="mx-auto max-w-4xl space-y-5">
    <button onClick={onBack} className="text-sm text-amber-800 hover:underline">← Workday</button>
    <header><p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">Era I · Uruk · c. 3200 BCE · Historical Work</p><h1 className="mt-1 font-serif text-3xl font-semibold text-stone-900">The Eanna Provisioning Undertaking</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-stone-700">Compile the separate household and offering tallies into one Consolidated Summary Tablet. The obverse keeps each source tally distinct; the reverse consolidates compatible totals and records a provisional allocation for Lu-Nanshe’s decision.</p></header>
    <section className="rounded-xl border border-stone-300 bg-white p-5">
      <h2 className="font-serif text-xl font-semibold">Before you begin</h2>
      <p className="mt-2 text-sm text-stone-700">The compilation window is Days 35–38. The gathering is scheduled for Day 39. If the window passes, the gathering proceeds at reduced scope and you can still prepare a retrospective tablet through Day 42; later official review remains possible.</p>
      <p className="mt-2 text-sm text-stone-700">The four stages cost 7 AP in total. Initial submission costs 1 AP and Lu-Nanshe’s disposition costs 1 AP: 9 AP on the normal accepted path. A qualified Workday (at least 2 AP spent on this Work) earns +1 Provision through the existing provisions contract. Accepted disposition awards 100 Historical Progress XP once.</p>
      <p className="mt-2 text-sm text-stone-700">The apprentice prepares the allocation layout but has no office, formal allocation authority, or personal seal. Lu-Nanshe makes the institutional decision and applies the seal.</p>
      <button disabled={!canStart} onClick={start} className="mt-4 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40">{day < 35 ? 'Available on Day 35' : !tutorialComplete ? 'Complete the introductory tutorial first' : 'Begin Work'}</button>
    </section>
  </div>;

  if (!active) return <section role="status" className="mx-auto max-w-3xl rounded-xl border border-amber-300 bg-amber-50 p-6"><h1 className="font-serif text-2xl font-semibold">Eanna Work is not active</h1><p className="mt-2 text-sm text-stone-700">Return to the Workday Hub to resume the active Work or continue another activity.</p><button onClick={onBack} className="mt-4 underline">Return to Workday</button></section>;

  const stages = [
    { id: 'sort-source-packet', title: '1 · Sort the source packet', cost: 1 },
    { id: 'compile-obverse', title: '2 · Compile the obverse', cost: 2 },
    { id: 'consolidate-reverse', title: '3 · Consolidate the reverse', cost: 3 },
    { id: 'final-check', title: '4 · Final check', cost: 1 },
  ];
  const currentStage = stages.find((stage) => !done(stage.id));
  const voices = currentStage?.id === 'sort-source-packet'
    ? [
      ['Shuruppak-ilu', 'Keep each tally with its source. A spoken expectation is not a count.'],
      ['Ur-Nanna', 'Eighteen measures are counted here. The later word is not in my tally.'],
      ['Nin-kasi', 'Twelve measures are what the brewing work needs. I cannot brew from promises.'],
      ['Geme-Inana', 'The work group has its own need. If our share is cut again, fewer hands can stay at the task.'],
      ['Enlil-kisu', 'Three measures may come after the gathering. I can tell you what I expect; I cannot show you a receipt.'],
      ['Lu-Nanshe', 'Put the claims together. The allocation is mine to decide.'],
    ] as Array<[string,string]>
    : currentStage?.id === 'consolidate-reverse'
      ? [
        ['Nin-kasi', 'The brewing work needs its share before the gathering.'],
        ['Geme-Inana', 'Our household cannot make use of a promise written as if it were already here.'],
        ['Lu-Nanshe', 'Show me the shortfall plainly. I will decide what is assigned.'],
      ] as Array<[string,string]>
      : [
        ['Shuruppak-ilu', 'The tablet should show the counts and totals. Leave the arguments to the people speaking.'],
        ['Lu-Nanshe', 'I will accept, alter, or defer the allocation. The seal is mine to apply.'],
      ] as Array<[string,string]>;

  return <div className="mx-auto max-w-6xl space-y-5">
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div><button onClick={onBack} className="mb-2 text-sm text-amber-800 hover:underline">← Workday</button><p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">Era I · Uruk · Day {day}</p><h1 className="font-serif text-3xl font-semibold text-stone-900">The Eanna Provisioning Undertaking</h1><p className="mt-1 text-sm text-stone-600">A four-stage Work · 9 AP normal path · +1 Provision per qualified Workday</p></div>
      <div className="rounded-lg border border-stone-300 bg-white px-4 py-3 text-right"><p className="text-xs text-stone-500">Action Points</p><p className="font-mono text-2xl font-semibold">{state.actionEconomy.apRemaining}/{state.actionEconomy.dailyApAllocation}</p><p className="text-xs text-stone-500">Workday {day}</p></div>
    </header>
    {day <= 38 ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">Full gathering scope remains available through the end of Day 38.</p>
      : <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">The Day 39 gathering proceeded at reduced scope. Complete a retrospective compilation; do not backdate the tablet.</p>}
    <div className="grid gap-3 sm:grid-cols-4">{stages.map((stage) => <div key={stage.id} className={`rounded-lg border p-3 ${done(stage.id) ? 'border-emerald-300 bg-emerald-50' : currentStage?.id === stage.id ? 'border-amber-500 bg-amber-50' : 'border-stone-300 bg-white'}`}><p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{done(stage.id) ? 'Complete' : stage.cost + ' AP'}</p><p className="mt-1 text-sm font-semibold text-stone-900">{stage.title}</p></div>)}</div>
    <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
      <section className="space-y-4">
        {!done('sort-source-packet') && <article className="rounded-xl border border-stone-300 bg-white p-5"><h2 className="font-serif text-xl font-semibold">Stage 1 · Sort the source packet</h2><p className="mt-1 text-sm text-stone-600">Separate written tallies, physical counts, and spoken expectations before entering quantities.</p><div className="mt-4 space-y-3">{SOURCE_ROWS.map((row) => <label key={row.id} className="grid gap-1 rounded-lg bg-stone-50 p-3 text-sm"><span className="font-semibold text-stone-900">{row.label}</span><span className="text-stone-600">{row.note}</span><select aria-label={`Source status for ${row.label}`} value={scenario.sourceSorting[row.id] ?? ''} onChange={(event) => updateSource(row.id, event.target.value as EannaSourceClassification)} className="mt-1 rounded-md border border-stone-300 bg-white px-3 py-2"><option value="">Choose source status</option><option value="written_tally">Written tally</option><option value="physical_count">Physical count</option><option value="spoken_expectation">Spoken expectation</option></select></label>)}</div><button disabled={SOURCE_ROWS.some((row) => !scenario.sourceSorting[row.id]) || state.actionEconomy.apRemaining < 1} onClick={() => completeAction('sort-source-packet')} className="mt-4 rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">Sort sources · 1 AP</button></article>}
        {done('sort-source-packet') && !done('compile-obverse') && <article className="rounded-xl border border-stone-300 bg-white p-5"><h2 className="font-serif text-xl font-semibold">Stage 2 · Compile the obverse</h2><p className="mt-1 text-sm text-stone-600">Enter each source quantity on its own line. Keep barley capacity measures separate from beer vessels.</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{OBVERSE_FIELDS.map((field) => <NumberField key={field.id} label={field.label} unit={field.unit} value={scenario.obverse[field.id]} onChange={(raw) => updateObverse(field.id,raw)} />)}</div><button disabled={!allObverseEntered || state.actionEconomy.apRemaining < 2} onClick={() => completeAction('compile-obverse')} className="mt-4 rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">Compile obverse · 2 AP</button></article>}
        {done('compile-obverse') && !done('consolidate-reverse') && <article className="rounded-xl border border-stone-300 bg-white p-5"><h2 className="font-serif text-xl font-semibold">Stage 3 · Consolidate the reverse</h2><p className="mt-1 text-sm text-stone-600">The three barley requests total 29 capacity measures against 18 counted available: 11 short. The separate offering count is 6 vessels requested and 4 prepared: 2 short. Do not combine the categories.</p><h3 className="mt-4 font-semibold">Prepare the provisional barley allocation</h3><p className="mt-1 text-xs text-stone-500">Your recommendation must use the 18 counted measures. Lu-Nanshe retains the authority to ratify or adjust it.</p><div className="mt-3 grid gap-3 sm:grid-cols-2">{ALLOCATION_FIELDS.map((field) => <NumberField key={field.id} label={field.label} unit={`of ${field.requested} requested`} max={field.requested} value={scenario.allocation[field.id]} onChange={(raw) => updateAllocation(field.id,raw)} />)}</div><p className="mt-3 font-mono text-sm text-stone-700">Allocated: {allocationTotal} / 18 capacity measures</p><button disabled={!allAllocationEntered || state.actionEconomy.apRemaining < 3} onClick={() => completeAction('consolidate-reverse')} className="mt-4 rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">Prepare reverse · 3 AP</button></article>}
        {done('consolidate-reverse') && !done('final-check') && <article className="rounded-xl border border-stone-300 bg-white p-5"><h2 className="font-serif text-xl font-semibold">Stage 4 · Final check</h2><p className="mt-1 text-sm text-stone-600">Review both faces. The tablet records categories, counts, totals, and the provisional allocation only. The spoken arguments and the limits of the source material remain outside the clay.</p><Voices lines={voices} /><button disabled={state.actionEconomy.apRemaining < 1} onClick={() => completeAction('final-check')} className="mt-4 rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">Final check · 1 AP</button></article>}
        {done('final-check') && !progress.pendingDisposition && <article className="rounded-xl border border-stone-300 bg-white p-5"><h2 className="font-serif text-xl font-semibold">Submit the tablet</h2><p className="mt-1 text-sm text-stone-600">Submit the completed summary to Lu-Nanshe. Submission costs 1 AP; the official disposition is a separate 1 AP action.</p>{assessment && <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3"><p className="font-semibold">Returned for correction</p><ul className="mt-2 list-disc pl-5 text-sm">{assessment.dimensions.map((item) => <li key={item.dimension}>{item.summary}</li>)}</ul></div>}<button disabled={state.actionEconomy.apRemaining < 1} onClick={submit} className="mt-4 rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">Submit · 1 AP</button></article>}
        {progress.pendingDisposition && <article className="rounded-xl border border-amber-300 bg-amber-50 p-5"><h2 className="font-serif text-xl font-semibold">Lu-Nanshe’s official review</h2>{assessment?.outcome === 'accepted' ? <><p className="mt-2 text-sm text-stone-700">The source sorting, obverse entries, and reverse allocation are accepted. Lu-Nanshe ratifies the provisional split and applies the institutional seal. The apprentice does not authorize or seal the allocation.</p><Voices lines={voices} /><button disabled={state.actionEconomy.apRemaining < 1} onClick={() => dispose('authorized')} className="mt-4 rounded-lg bg-amber-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">Record Lu-Nanshe’s disposition · 1 AP</button></> : <><p className="mt-2 text-sm text-stone-700">{assessment?.summary ?? 'The report requires correction before disposition.'}</p><button disabled={state.actionEconomy.apRemaining < 1} onClick={() => dispose('returned')} className="mt-4 rounded-lg border border-stone-400 bg-white px-4 py-2 text-sm font-semibold text-stone-900 disabled:opacity-40">Return for correction · 1 AP</button></>}</article>}
      </section>
      <section className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TabletFace title="Obverse">
            <TabletLine category="Barley · Nin-kasi" value={scenario.obverse.ninKasiBarley ?? '—'} />
            <TabletLine category="Barley · Geme-Inana" value={scenario.obverse.gemeInanaBarley ?? '—'} />
            <TabletLine category="Barley · Bread preparation" value={scenario.obverse.breadPreparationBarley ?? '—'} />
            <TabletLine category="Barley · Available" value={scenario.obverse.availableBarley ?? '—'} />
            <TabletLine category="Beer vessels · Requested" value={scenario.obverse.offeringVesselsRequested ?? '—'} />
            <TabletLine category="Beer vessels · Prepared" value={scenario.obverse.offeringVesselsPrepared ?? '—'} />
          </TabletFace>
          <TabletFace title="Reverse">
            <TabletLine category="Barley · Requested total" value={allObverseEntered ? 29 : '—'} />
            <TabletLine category="Barley · Available" value={scenario.obverse.availableBarley ?? '—'} />
            <TabletLine category="Barley · Shortfall" value={allObverseEntered ? 11 : '—'} />
            <TabletLine category="Nin-kasi · Allocated" value={scenario.allocation.ninKasiBarley ?? '—'} />
            <TabletLine category="Bread · Allocated" value={scenario.allocation.breadPreparationBarley ?? '—'} />
            <TabletLine category="Geme-Inana · Allocated" value={scenario.allocation.gemeInanaBarley ?? '—'} />
            <TabletLine category="Beer vessels · Unmet" value={allObverseEntered ? 2 : '—'} />
            {progress.pendingDisposition && assessment?.outcome === 'accepted' && <p className="pt-2 text-center text-xs font-bold uppercase tracking-widest">Seal authorized</p>}
          </TabletFace>
        </div>
        <Voices lines={voices} />
        <section className="rounded-xl border border-stone-300 bg-white p-4"><h2 className="font-semibold text-stone-900">Work contract</h2><dl className="mt-2 grid grid-cols-2 gap-2 text-sm"><div><dt className="text-xs text-stone-500">Normal path</dt><dd className="font-mono">9 AP</dd></div><div><dt className="text-xs text-stone-500">Provisions</dt><dd className="font-mono">2 AP/day → +1</dd></div><div><dt className="text-xs text-stone-500">Historical XP</dt><dd className="font-mono">100 once</dd></div><div><dt className="text-xs text-stone-500">Deadline</dt><dd className="font-mono">Day 38</dd></div></dl></section>
      </section>
    </div>
  </div>;
}
