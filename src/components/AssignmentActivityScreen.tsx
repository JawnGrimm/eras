import React from 'react';
import { getInitializedScribal } from '../state/scribalState';
import { playSealStamp } from '../engine/audio';
import { useGame } from '../state/GameProvider';
import type { AssignmentId, InstitutionId, PersonId } from '../state/ids';
import { ASSIGNMENT_ACTIVITY_CATALOG } from '../content/assignments/northBayRoofInspection';
import { evaluateEvidenceInterpretation } from '../works/evidenceInterpretation';

export function responsibilityClaimPreviewLabel(
  options: readonly { id: string; label: string }[], selectedId: string,
): string {
  return options.find((option) => option.id === selectedId)?.label
    ?? options.find((option) => option.id === 'none')?.label
    ?? options[0]?.label
    ?? 'No responsibility claim recorded';
}

export function AssignmentActivityScreen({ assignmentId, onBack }: { assignmentId: AssignmentId; onBack: () => void }) {
  const game = useGame();
  const offer = game.state.opportunities.assignments[assignmentId];
  const definition = offer?.activityId ? ASSIGNMENT_ACTIVITY_CATALOG[offer.activityId as keyof typeof ASSIGNMENT_ACTIVITY_CATALOG] : undefined;
  const progress = offer?.activityProgress;
  const character = getInitializedScribal(game.state.world.people[game.state.player.currentCharacterId]);
  if (offer && definition && offer.status === 'completed') {
    return <section className="rounded-xl border border-stone-300 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">Assignment completed</p>
      <h1 className="mt-1 font-serif text-2xl">{offer.title}</h1>
      <p className="mt-2 text-sm leading-6 text-stone-600">The inspection report has been filed. Its findings, limitations, and institutional consequences are now part of the record.</p>
      <button onClick={onBack} className="mt-4 rounded bg-stone-900 px-3 py-2 text-sm text-white">Return to Assignment Board</button>
    </section>;
  }
  if (!offer || !definition || !progress || offer.status !== 'accepted' || offer.assigneePersonId !== game.state.player.currentCharacterId || !character) {
    return <section className="rounded-xl border border-stone-300 bg-white p-5"><h1 className="font-serif text-2xl">Activity unavailable</h1><p className="mt-2 text-sm text-stone-600">This activity is not an accepted commitment of the current character.</p><button onClick={onBack} className="mt-4 rounded bg-stone-900 px-3 py-2 text-sm text-white">Back</button></section>;
  }
  const dispatchDraft = (draft: typeof progress.draft) => game.dispatch({ type: 'UPDATE_ASSIGNMENT_ACTIVITY_DRAFT', assignmentId, draft });
  const submitReport = () => {
    const result = game.dispatch({ type: 'SUBMIT_ASSIGNMENT_ACTIVITY', assignmentId });
    if (result.state !== game.state) playSealStamp();
  };
  const actions = definition.actions;
  const canPerform = (action: typeof actions[number]) => !progress.completedActionIds.includes(action.id)
    && (action.prerequisites ?? []).every((id) => progress.completedActionIds.includes(id));
  const annotations = progress.discoveryIds.flatMap((id) => evaluateEvidenceInterpretation({
    evidenceId: id as import('../state/ids').EvidenceId, character, examinedEvidence: progress.discoveryIds as import('../state/ids').EvidenceId[],
    rules: definition.interpretationRules,
  }));
  const draft = progress.draft;
  return <div className="mx-auto max-w-5xl space-y-5">
    <header className="rounded-xl border border-stone-300 bg-white p-5">
      <button onClick={onBack} className="text-xs font-semibold text-amber-900 underline">Back to Assignment Board</button>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-amber-800">Interactive Assignment · {offer.employer.kind === 'institution' ? game.state.world.institutions[offer.employer.id as InstitutionId]?.name : game.state.world.people[offer.employer.id as PersonId]?.name}</p>
      <h1 className="mt-1 font-serif text-3xl font-semibold">{offer.title}</h1>
      <p className="mt-2 text-sm leading-6 text-stone-600">{offer.description}</p>
      <p className="mt-3 text-sm"><strong>{game.state.actionEconomy.apRemaining} AP</strong> remaining today · estimated {offer.estimatedTotalAp} AP total · submission {definition.submissionApCost} AP</p>
    </header>
    <section className="rounded-xl border border-stone-300 bg-white p-5">
      <h2 className="font-serif text-xl font-semibold">Investigative actions</h2>
      <p className="mt-1 text-sm text-stone-600">Actions are optional and may be completed in any available order. You can submit a qualified incomplete report without exhausting the activity.</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {actions.map((action) => {
          const done = progress.completedActionIds.includes(action.id);
          const ready = canPerform(action);
          return <article key={action.id} className="rounded-lg border border-stone-200 bg-stone-50 p-3">
            <div className="flex justify-between gap-2"><h3 className="font-semibold">{action.label}</h3><span className="text-xs text-stone-500">{action.apCost} AP</span></div>
            <p className="mt-1 text-sm text-stone-600">{action.description}</p>
            {action.consultedPersonId && <p className="mt-1 text-xs text-stone-500">Person: {game.state.world.people[action.consultedPersonId]?.name ?? action.consultedPersonId}</p>}
            <button disabled={!ready || game.state.actionEconomy.apRemaining < action.apCost} onClick={() => game.dispatch({ type: 'PERFORM_ASSIGNMENT_ACTIVITY_ACTION', assignmentId, actionId: action.id })} className="mt-3 rounded bg-stone-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40">{done ? 'Completed' : ready ? 'Perform action' : 'Prerequisite required'}</button>
          </article>;
        })}
      </div>
    </section>
    <section className="rounded-xl border border-stone-300 bg-white p-5">
      <h2 className="font-serif text-xl font-semibold">Discoveries and interpretation</h2>
      <div className="mt-3 space-y-3">
        {definition.discoveries.filter((item) => progress.discoveryIds.includes(item.id)).map((item) => <article key={item.id} className="rounded-lg bg-stone-50 p-3">
          <h3 className="font-semibold">{item.title}</h3><p className="mt-1 text-sm leading-6 text-stone-700">{item.text}</p>
          {annotations.filter((annotation) => annotation.evidenceId === item.id).map((annotation) => <p key={annotation.id} className="mt-2 border-l-2 border-amber-700 pl-3 text-sm italic text-stone-600">{annotation.text}</p>)}
        </article>)}
        {progress.discoveryIds.length === 0 && <p className="text-sm text-stone-500">No findings recorded yet.</p>}
      </div>
    </section>
    <section className="rounded-xl border border-stone-300 bg-white p-5">
      <h2 className="font-serif text-xl font-semibold">Draft {definition.reportSchema.title.toLowerCase()}</h2>
      <label className="mt-3 block text-sm font-medium">Finding
        <select value={draft.finding} onChange={(e) => dispatchDraft({ ...draft, finding: e.target.value as typeof draft.finding })} className="mt-1 block w-full rounded border border-stone-300 bg-white p-2">
          {definition.reportSchema.findings.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
        </select>
      </label>
      <label className="mt-4 block text-sm font-medium">{definition.reportSchema.responsibilityLabel}
        <select value={draft.responsibilityClaim} onChange={(e) => dispatchDraft({ ...draft, responsibilityClaim: e.target.value as typeof draft.responsibilityClaim })} className="mt-1 block w-full rounded border border-stone-300 bg-white p-2">
          {definition.reportSchema.responsibilityClaims.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
        </select>
        {definition.reportSchema.responsibilityHint && <span className="mt-1 block text-xs font-normal text-stone-500">{definition.reportSchema.responsibilityHint}</span>}
      </label>
      <fieldset className="mt-4"><legend className="text-sm font-medium">Cite discoveries</legend>
        {definition.discoveries.filter((item) => progress.discoveryIds.includes(item.id)).map((item) => <label key={item.id} className="mt-2 flex gap-2 text-sm">
          <input type="checkbox" checked={draft.citedDiscoveryIds.includes(item.id)} onChange={(e) => dispatchDraft({ ...draft, citedDiscoveryIds: e.target.checked ? [...draft.citedDiscoveryIds, item.id] : draft.citedDiscoveryIds.filter((id) => id !== item.id) })} />{item.title}
        </label>)}
      </fieldset>
      <fieldset className="mt-4"><legend className="text-sm font-medium">Recommendations</legend>
        {definition.reportSchema.recommendations.map(({ id, label }) => <label key={id} className="mt-2 flex gap-2 text-sm">
          <input type="checkbox" checked={draft.recommendations.includes(id)} onChange={(e) => dispatchDraft({ ...draft, recommendations: e.target.checked ? [...draft.recommendations, id] : draft.recommendations.filter((x) => x !== id) })} />{label}
        </label>)}
      </fieldset>
      {definition.reportSchema.limitationOptions?.length ? <fieldset className="mt-4">
        <legend className="text-sm font-medium">{definition.reportSchema.limitationsLabel}</legend>
        {definition.reportSchema.limitationOptions.map(({ id, label }) => <label key={id} className="mt-2 flex gap-2 text-sm">
          <input type="checkbox" checked={(draft.selectedLimitationIds ?? []).includes(id)}
            onChange={(e) => dispatchDraft({ ...draft, selectedLimitationIds: e.target.checked
              ? [...(draft.selectedLimitationIds ?? []), id]
              : (draft.selectedLimitationIds ?? []).filter((item) => item !== id) })} />{label}
        </label>)}
        {draft.limitations.length > 0 && <p className="mt-2 text-xs text-stone-500">Legacy notes preserved, ungraded: {draft.limitations.join('; ')}</p>}
        <label className="mt-3 block text-sm font-medium">Additional note (optional)
          <textarea rows={2} value={draft.limitationNotes ?? ''} onChange={(e) => dispatchDraft({ ...draft, limitationNotes: e.target.value })}
            placeholder="Add a source-specific qualification." className="mt-1 block w-full rounded border border-stone-300 p-2 text-sm" />
        </label>
      </fieldset> : <label className="mt-4 block text-sm font-medium">{definition.reportSchema.limitationsLabel}
        <textarea rows={3} value={draft.limitations.join('\n')} onChange={(e) => dispatchDraft({ ...draft, limitations: e.target.value.split('\n') })} placeholder="State what you did not inspect or cannot establish." className="mt-1 block w-full rounded border border-stone-300 p-2 text-sm" />
      </label>}
      <section className="mt-5 rounded-lg border border-stone-200 bg-stone-50 p-3">
        <h3 className="font-semibold">Report preview</h3>
        <p className="mt-2 text-sm"><strong>Finding:</strong> {draft.finding.replaceAll('_', ' ')}</p>
        <p className="mt-1 text-sm"><strong>Responsibility:</strong> {responsibilityClaimPreviewLabel(definition.reportSchema.responsibilityClaims, draft.responsibilityClaim)}</p>
        <p className="mt-1 text-sm"><strong>Cited discoveries:</strong> {draft.citedDiscoveryIds.map((id) => definition.discoveries.find((item) => item.id === id)?.title ?? id).join('; ') || 'None'}</p>
        <p className="mt-1 text-sm"><strong>Limitations:</strong> {definition.reportSchema.limitationOptions?.length
          ? (draft.selectedLimitationIds ?? []).map((id) => definition.reportSchema.limitationOptions?.find((option) => option.id === id)?.label ?? id).join('; ') || 'None selected'
          : draft.limitations.join('; ') || 'None stated'} {draft.limitationNotes ?? ''}</p>
        <p className="mt-1 text-sm"><strong>Recommendations:</strong> {draft.recommendations.map((id) => definition.reportSchema.recommendations.find((item) => item.id === id)?.label ?? id).join('; ') || 'None'}</p>
      </section>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button disabled={game.state.actionEconomy.apRemaining < definition.submissionApCost} onClick={submitReport} className="rounded bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40">Submit report · {definition.submissionApCost} AP</button>
        <span className="text-xs text-stone-500">{definition.submissionNote ?? 'Submission closes the Assignment.'}</span>
      </div>
    </section>
  </div>;
}
