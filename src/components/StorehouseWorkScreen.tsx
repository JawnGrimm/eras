import React, { useEffect, useState } from 'react';
import type { EvidenceId } from '../state/ids';
import { useGame } from '../state/GameProvider';
import { STOREHOUSE_EVIDENCE, STOREHOUSE_WORK_ID, storehouseReckoning, interpretStorehouseEvidence } from '../works/storehouseReckoning';
import type { StorehouseField, StorehouseFinding, StorehouseRecommendation, StorehouseScenarioData } from '../works/storehouseReckoning';

const fieldLabels: Record<StorehouseField, string> = {
  opening: 'Opening usable stock',
  dispatched: 'Dispatched',
  received: 'Physically received',
  intakeUsable: 'Usable at intake',
  intakeHeld: 'Held at intake',
  issued: 'Issued to brewing-house',
  closingUsable: 'Usable at recount',
  closingHeld: 'Held at recount',
};
const fields = Object.keys(fieldLabels) as StorehouseField[];
const actionLabels: Record<string, string> = {
  accounts: 'Compare opening, dispatch, and arrival records',
  intake_issue: 'Examine intake inspection and issue records',
  recount: 'Review the witnessed physical recount with the Steward',
  custody: 'Request the Steward’s custody and maintenance notes',
};
const findingLabels: Record<StorehouseFinding, string> = {
  status_change_cause_unestablished: 'The records establish a change in stock condition, but not its precise cause',
  roof_leak_reported_unproven: 'A roof leak was reported; its precise contribution to the damage remains unproven',
};
const recommendationLabels: Record<StorehouseRecommendation, string> = {
  inspect_held_stock: 'Inspect the seven held measures',
  verify_roof_repair: 'Inspect the north bay and verify the roof repair',
  maintain_segregation: 'Keep held measures separate pending inspection',
  assign_blame: 'Name a person responsible for the damage',
};
const evidenceActions = storehouseReckoning.actions;

export function parseNumericDraft(draft: string): { valid: true; value: number | undefined } | { valid: false } {
  const trimmed = draft.trim();
  if (!trimmed) return { valid: true, value: undefined };
  if (!/^\d+$/.test(trimmed)) return { valid: false };
  const parsed = Number(trimmed);
  return Number.isSafeInteger(parsed) ? { valid: true, value: parsed } : { valid: false };
}

export function commitNumericDraftOnBlur(
  draft: string,
  field: StorehouseField,
  currentValue: number | undefined,
  onCommit: (field: StorehouseField, value: number | undefined) => void,
  onInvalid: () => void,
): void {
  const parsed = parseNumericDraft(draft);
  if (!parsed.valid) { onInvalid(); return; }
  onCommit(field, parsed.value);
}

export function NumericDraftField({ field, value, onCommit, disabled = false }: {
  field: StorehouseField; value: number | undefined; onCommit: (field: StorehouseField, value: number | undefined) => void; disabled?: boolean;
}) {
  const [draft, setDraft] = useState(value === undefined ? '' : String(value));
  useEffect(() => setDraft(value === undefined ? '' : String(value)), [value]);
  const commit = () => {
    commitNumericDraftOnBlur(
      draft,
      field,
      value,
      onCommit,
      () => setDraft(value === undefined ? '' : String(value)),
    );
  };
  return (
    <label className="grid gap-1 text-sm text-stone-700">
      <span>{fieldLabels[field]}</span>
      <input
        aria-label={fieldLabels[field]}
        inputMode="numeric"
        pattern="[0-9]*"
        value={draft}
        disabled={disabled}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 font-mono text-stone-900 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20"
      />
    </label>
  );
}

export function StorehouseWorkScreen({ onBack }: { onBack: () => void }) {
  const game = useGame();
  const workId = STOREHOUSE_WORK_ID;
  const definition = storehouseReckoning;
  const progress = game.state.works.progress[workId];
  const person = game.state.world.people[game.state.player.currentCharacterId];
  if (!progress || !person?.scribal) return <section className="rounded-xl border border-stone-300 bg-white p-6"><p>The Storehouse Work progress or active character is unavailable.</p><button onClick={onBack} className="mt-4 underline">Return to Workday</button></section>;

  const scenario = progress.scenarioData as StorehouseScenarioData;
  const acquired = progress.acquiredEvidence;
  const examined = progress.examinedEvidence;
  const completed = progress.completedActionIds;
  const active = progress.status === 'active' && game.state.works.activeWorkId === workId;
  const dispatch = game.dispatch;
  const commitField = (field: StorehouseField, value: number | undefined) => {
    const draft = { ...scenario.draft };
    if (value === undefined) delete draft[field];
    else draft[field] = value;
    dispatch({ type: 'SET_WORK_SCENARIO_DATA', workId, scenarioData: { ...scenario, draft } });
  };
  const toggleCitation = (id: EvidenceId) => {
    const citations = scenario.citations.includes(id)
      ? scenario.citations.filter((item) => item !== id)
      : [...scenario.citations, id];
    dispatch({ type: 'SET_WORK_SCENARIO_DATA', workId, scenarioData: { ...scenario, citations } });
  };
  const toggleRecommendation = (id: StorehouseRecommendation) => {
    const recommendations = scenario.recommendations.includes(id)
      ? scenario.recommendations.filter((item) => item !== id)
      : [...scenario.recommendations, id];
    dispatch({ type: 'SET_WORK_SCENARIO_DATA', workId, scenarioData: { ...scenario, recommendations } });
  };
  const initialCost = progress.submissionCount === 0
    ? (definition.initialSubmissionApCost ?? definition.submissionApCost ?? 0)
    : (definition.revisionSubmissionApCost ?? definition.submissionApCost ?? 0);
  const dispositionCost = definition.dispositionApCost ?? 0;
  const assessment = progress.lastAssessment;
  const canSubmit = active && !(progress.pendingDisposition
    && assessment?.outcome === 'accepted'
    && assessment.dimensions.every((dimension) => dimension.status === 'meets'));
  const submit = () => dispatch({ type: 'SUBMIT_WORK', workId });
  const dispose = (disposition: 'returned' | 'account_accepted' | 'authorized') =>
    dispatch({ type: 'DISPOSE_WORK', workId, disposition });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <button onClick={onBack} className="mb-2 text-sm text-amber-800 hover:underline">← Workday</button>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">Mandatory historical Work · Uruk</p>
          <h1 className="font-serif text-3xl font-semibold text-stone-900">The Storehouse Reckoning</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">Reconcile the storehouse account, preserve the limits of the evidence, and make a proportionate recommendation for the Senior Scribe’s review.</p>
        </div>
        <div className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm">
          <div className="text-stone-500">Workday AP remaining</div>
          <div className="font-mono text-2xl font-semibold text-stone-900">{game.state.actionEconomy.apRemaining} / {game.state.actionEconomy.dailyApAllocation}</div>
        </div>
      </div>

      <section className="rounded-xl border border-stone-300 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-serif text-xl font-semibold text-stone-900">Evidence packet</h2>
          <p className="text-xs text-stone-500">Examination and re-reading cost 0 AP</p>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {STOREHOUSE_EVIDENCE.filter((item) => acquired.includes(item.id)).map((item) => {
            const isExamined = examined.includes(item.id);
            const thoughts = isExamined
              ? interpretStorehouseEvidence(item.id, person.scribal!, examined)
              : [];
            return (
              <article key={item.id} className="rounded-lg border border-stone-200 bg-stone-50 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div><p className="text-xs font-mono text-stone-500">{item.id.toUpperCase()}</p><h3 className="font-semibold text-stone-900">{item.title}</h3></div>
                  <span className="text-xs text-stone-500">{isExamined ? 'Examined' : 'Acquired'}</span>
                </div>
                <p className="mt-2 text-xs font-medium text-stone-600">Source: {item.source}</p>
                <p className="mt-2 text-sm leading-6 text-stone-800">{item.objectiveText}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button disabled={!active} onClick={() => dispatch({ type: 'EXAMINE_WORK_EVIDENCE', workId, evidenceId: item.id })}
                    className="rounded-md border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 disabled:opacity-50">
                    {isExamined ? 'Re-read · 0 AP' : 'Examine · 0 AP'}
                  </button>
                </div>
                {thoughts.length > 0 && <div className="mt-3 border-l-2 border-amber-700/40 pl-3">
                  <p className="text-xs font-semibold text-stone-600">Your thoughts</p>
                  <ul className="mt-1 space-y-1.5">{thoughts.map((thought) => <li key={thought.id} className="text-sm italic leading-5 text-stone-700">{thought.text}</li>)}</ul>
                </div>}
              </article>
            );
          })}
        </div>
        <div className="mt-5 border-t border-stone-200 pt-4">
          <h3 className="font-semibold text-stone-900">Obtain additional records</h3>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {evidenceActions.map((action) => {
              const done = completed.includes(action.id);
              return <div key={action.id} className="flex items-center justify-between gap-3 rounded-lg bg-stone-50 p-3">
                <div><p className="text-sm font-medium text-stone-800">{actionLabels[action.id] ?? action.id}</p><p className="text-xs text-stone-500">{action.grantsEvidence?.map((id) => id.toUpperCase()).join(', ')}</p></div>
                <button disabled={!active || done || game.state.actionEconomy.apRemaining < action.apCost}
                  onClick={() => dispatch({ type: 'ACQUIRE_WORK_EVIDENCE', workId, actionId: action.id })}
                  className="shrink-0 rounded-md bg-stone-900 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">
                  {done ? 'Obtained' : `Obtain · ${action.apCost} AP`}
                </button>
              </div>;
            })}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-stone-300 bg-white p-5 shadow-sm">
        <h2 className="font-serif text-xl font-semibold text-stone-900">Construct the account</h2>
        <p className="mt-1 text-sm text-stone-600">Enter the quantities supported by the records. Values are committed when you leave a field; incomplete typing remains local to that field.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {fields.map((field) => <NumericDraftField key={field} field={field} value={scenario.draft[field]} onCommit={commitField} disabled={!active} />)}
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div>
            <h3 className="font-semibold text-stone-900">Finding about the change in condition</h3>
            <div className="mt-2 space-y-2">{(Object.keys(findingLabels) as StorehouseFinding[]).map((finding) =>
              <label key={finding} className="flex gap-2 text-sm text-stone-700">
                <input type="radio" name="storehouse-finding" checked={scenario.finding === finding} disabled={!active}
                  onChange={() => dispatch({ type: 'SET_WORK_SCENARIO_DATA', workId, scenarioData: { ...scenario, finding } })} />
                <span>{findingLabels[finding]}</span>
              </label>)}</div>
          </div>
          <div>
            <h3 className="font-semibold text-stone-900">Cite the records used</h3>
            <div className="mt-2 grid grid-cols-2 gap-2">{STOREHOUSE_EVIDENCE.map((item) =>
              <label key={item.id} className="flex gap-2 text-sm text-stone-700">
                <input type="checkbox" checked={scenario.citations.includes(item.id)}
                  disabled={!active || !examined.includes(item.id)}
                  onChange={() => toggleCitation(item.id)} />
                <span>{item.id.toUpperCase()} · {item.title}</span>
              </label>)}</div>
            <p className="mt-2 text-xs text-stone-500">Only acquired and examined records can be cited.</p>
          </div>
        </div>
        <div className="mt-5">
          <h3 className="font-semibold text-stone-900">Recommended follow-up</h3>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">{(Object.keys(recommendationLabels) as StorehouseRecommendation[]).map((recommendation) =>
            <label key={recommendation} className="flex items-start gap-2 rounded-lg bg-stone-50 p-3 text-sm text-stone-700">
              <input type="checkbox" checked={scenario.recommendations.includes(recommendation)} disabled={!active} onChange={() => toggleRecommendation(recommendation)} />
              <span>{recommendationLabels[recommendation]}</span>
            </label>)}</div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-stone-200 pt-4">
          <button disabled={!canSubmit || game.state.actionEconomy.apRemaining < initialCost}
            onClick={submit} className="rounded-lg bg-amber-800 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40">
            {progress.submissionCount > 0 ? 'Revise and resubmit' : 'Submit for assessment'} · {initialCost} AP
          </button>
          <p className="text-xs text-stone-500">Initial submission: {definition.initialSubmissionApCost ?? definition.submissionApCost ?? 0} AP · Revision: {definition.revisionSubmissionApCost ?? definition.submissionApCost ?? 0} AP · Senior disposition: {definition.dispositionApCost ?? 0} AP</p>
        </div>
      </section>

      {progress.status === 'completed' && <section className="rounded-xl border border-emerald-300 bg-emerald-50 p-5" role="status">
        <h2 className="font-serif text-xl font-semibold text-stone-900">Work completed</h2>
        <p className="mt-2 text-sm text-stone-700">Final disposition: {progress.finalDisposition ?? 'Completed'}.</p>
      </section>}

      {assessment && <section className="rounded-xl border border-stone-300 bg-white p-5 shadow-sm">
        <h2 className="font-serif text-xl font-semibold text-stone-900">Senior Scribe’s assessment</h2>
        <p className="mt-2 text-sm leading-6 text-stone-700">{assessment.summary}</p>
        <div className="mt-4 space-y-2">{assessment.dimensions.map((dimension) =>
          <div key={dimension.dimension} className="rounded-lg bg-stone-50 p-3">
            <div className="flex items-center justify-between gap-2"><span className="text-sm font-medium capitalize text-stone-800">{dimension.dimension.replaceAll('_', ' ')}</span><span className="text-xs text-stone-500">{dimension.status}</span></div>
            <p className="mt-1 text-sm text-stone-600">{dimension.summary}</p>
          </div>)}</div>
        {progress.pendingDisposition && <div className="mt-5 border-t border-stone-200 pt-4">
          <h3 className="font-semibold text-stone-900">Disposition · {dispositionCost} AP</h3>
          <p className="mt-1 text-sm text-stone-600">The assessment is complete. The Senior Scribe must decide whether to accept the account and whether to authorize the recommendation.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {assessment.outcome !== 'accepted' && <button disabled={!active || game.state.actionEconomy.apRemaining < dispositionCost} onClick={() => dispose('returned')} className="rounded-lg border border-stone-300 px-3 py-2 text-sm disabled:opacity-40">Return for correction · {dispositionCost} AP</button>}
            {assessment.outcome === 'accepted' && <>
              <button disabled={!active || game.state.actionEconomy.apRemaining < dispositionCost} onClick={() => dispose('account_accepted')} className="rounded-lg border border-stone-300 px-3 py-2 text-sm disabled:opacity-40">Accept account only · {dispositionCost} AP</button>
              <button disabled={!active || game.state.actionEconomy.apRemaining < dispositionCost || assessment.dimensions.some((item) => item.dimension === 'responsibility' && item.status !== 'meets')} onClick={() => dispose('authorized')} className="rounded-lg bg-stone-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40">Authorize recommendation · {dispositionCost} AP</button>
            </>}
          </div>
        </div>}
      </section>}
    </div>
  );
}
