import React from 'react';
import { useGame } from '../state/GameProvider';
import { characterQualifiesForAssignment } from '../engine/opportunities';
import { selectCharacterOpportunities } from '../state/opportunitySelectors';
import { ASSIGNMENT_ACTIVITY_CATALOG } from '../content/assignments/northBayRoofInspection';

function ContextDetails({ context }: { context: { what: string; who: string[]; quantity?: string; when?: string; where?: string; from?: string; to?: string; purpose: string; responsibility: string[]; authority?: string; provenance: string[] } }) {
  const rows: Array<[string, string | undefined]> = [
    ['What', context.what], ['Who', context.who.join('; ')], ['Quantity', context.quantity],
    ['When', context.when], ['Where', context.where], ['From', context.from], ['To', context.to],
    ['Purpose', context.purpose], ['Authority', context.authority],
    ['Responsibility', context.responsibility.join('; ')], ['Provenance', context.provenance.join('; ')],
  ];
  return <details className="mt-3 text-xs text-stone-600">
    <summary className="cursor-pointer font-medium text-amber-800">Full matter context</summary>
    <dl className="mt-2 grid gap-2 sm:grid-cols-2">{rows.filter((row) => row[1]).map(([label, value]) =>
      <div key={label}><dt className="font-semibold text-stone-700">{label}</dt><dd>{value}</dd></div>)}</dl>
  </details>;
}

function DeliveryReasons({ channels }: { channels: Array<{ explanation: string }> }) {
  return <div className="mt-3 rounded-md border border-stone-200 bg-white px-3 py-2">
    <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">Why this reached you</p>
    <ul className="mt-1 space-y-1 text-xs text-stone-700">{channels.map((channel, index) => <li key={index}>{channel.explanation}</li>)}</ul>
  </div>;
}

export function ProductionAssignmentBoard({ onOpenActivity }: { onOpenActivity: (assignmentId: string) => void }) {
  const game = useGame();
  const state = game.state;
  const opportunities = selectCharacterOpportunities(state);
  const activeCount = opportunities.acceptedAssignments.length;

  return <div className="mx-auto max-w-6xl space-y-6">
    <header>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">Professional opportunities</p>
      <h1 className="font-serif text-3xl font-semibold text-stone-900">Assignment Board</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">Commissions are optional professional commitments. Accepting reserves a slot but costs no AP; completion and cancellation spend the stated AP.</p>
    </header>
    <section className="rounded-xl border border-stone-300 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-serif text-xl font-semibold">Available offers</h2><span className="text-xs text-stone-500">{activeCount}/2 commitments held by this character</span></div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {opportunities.offeredAssignments.map((offer) => {
          const daysRemaining = Math.max(0, offer.expiresDay - state.calendar.dayNumber);
          const qualifies = characterQualifiesForAssignment(state, offer);
          const activityDefinition = offer.activityId ? ASSIGNMENT_ACTIVITY_CATALOG[offer.activityId as keyof typeof ASSIGNMENT_ACTIVITY_CATALOG] : undefined;
          return <article key={offer.id} className="rounded-lg border border-stone-200 bg-stone-50 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2"><h3 className="font-semibold text-stone-900">{offer.title}</h3><span className="rounded bg-white px-2 py-1 text-[11px] uppercase tracking-wide text-stone-600">{offer.difficulty}</span></div>
            <p className="mt-2 text-sm leading-5 text-stone-600">{offer.description}</p>
            <p className="mt-2 text-xs font-medium text-amber-900">Expires Day {offer.expiresDay} · {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining</p>
            <DeliveryReasons channels={offer.deliveryChannels} /><ContextDetails context={offer.context} />
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-stone-200 pt-3 text-xs text-stone-600">
              <span>{offer.activityId ? `Estimated ${offer.estimatedTotalAp} AP across multiple Workdays` : `${offer.apCost} AP to complete`}</span><span>{offer.compensation.money} Currency</span><span>{offer.compensation.provisions} provisions</span><span>{offer.careerXpReward} Career XP</span>
            </div>
            {offer.compensationDisclosure && <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">{offer.compensationDisclosure}</p>}
            {activityDefinition && <details className="mt-2 rounded-md border border-stone-200 bg-white px-3 py-2 text-xs text-stone-600">
              <summary className="cursor-pointer font-medium text-amber-800">Action costs before accepting</summary>
              <ul className="mt-2 space-y-1">
                {activityDefinition.actions.map((action) => <li key={action.id}>{action.label} · {action.apCost} AP</li>)}
                <li className="border-t border-stone-200 pt-1 font-semibold">Submit report · {activityDefinition.submissionApCost} AP</li>
              </ul>
              <p className="mt-2 text-stone-500">Investigative actions are optional unless a listed prerequisite applies. The estimated total reflects a typical route, not every optional action.</p>
            </details>}
            {Object.keys(offer.requiredSkills).length > 0 && <p className="mt-2 text-xs text-stone-600">Requirements: {Object.entries(offer.requiredSkills).map(([skill, level]) => `${skill.replaceAll('_', ' ')} ${level}`).join(', ')}</p>}
            {!qualifies && <p className="mt-2 text-xs text-amber-800">The current character does not yet meet the stated skill requirements.</p>}
            <div className="mt-3 flex gap-2">
              <button disabled={activeCount >= 2 || !qualifies || state.calendar.dayNumber >= offer.expiresDay} onClick={() => game.dispatch({ type: 'ACCEPT_ASSIGNMENT', assignmentId: offer.id })} className="rounded-md bg-stone-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40">Accept</button>
              <button onClick={() => game.dispatch({ type: 'DECLINE_ASSIGNMENT', assignmentId: offer.id })} className="rounded-md border border-stone-300 px-3 py-2 text-xs">Decline</button>
            </div>
          </article>;
        })}
        {opportunities.offeredAssignments.length === 0 && <p className="text-sm text-stone-500">No new commissions are currently offered.</p>}
      </div>
    </section>
    <section className="rounded-xl border border-stone-300 bg-white p-5">
      <h2 className="font-serif text-xl font-semibold">Accepted commitments</h2><p className="mt-1 text-xs text-stone-500">Only commitments accepted by the current character appear here.</p>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {opportunities.acceptedAssignments.map((offer) => <article key={offer.id} className="rounded-lg border border-stone-200 bg-stone-50 p-4">
          <h3 className="font-semibold text-stone-900">{offer.title}</h3><p className="mt-2 text-sm text-stone-600">{offer.description}</p>
          <DeliveryReasons channels={offer.deliveryChannels} /><ContextDetails context={offer.context} />
          <p className="mt-3 text-xs text-stone-600">{offer.activityId ? `Estimated total: ${offer.estimatedTotalAp} AP · submitted report` : `Completion: ${offer.apCost} AP`} · {offer.compensation.money} Currency · {offer.careerXpReward} Career XP</p>
          <div className="mt-3 flex gap-2">
            {offer.activityId ? <button onClick={() => onOpenActivity(offer.id)} className="rounded-md bg-stone-900 px-3 py-2 text-xs font-semibold text-white">{offer.activityProgress?.completedActionIds.length ? 'Resume Activity' : 'Open Activity'}</button> : <button disabled={state.actionEconomy.apRemaining < (offer.apCost ?? 0)} onClick={() => game.dispatch({ type: 'COMPLETE_ASSIGNMENT', assignmentId: offer.id })} className="rounded-md bg-stone-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40">Complete · {offer.apCost} AP</button>}
            <button disabled={state.actionEconomy.apRemaining < 1} onClick={() => game.dispatch({ type: 'CANCEL_ASSIGNMENT', assignmentId: offer.id })} className="rounded-md border border-stone-300 px-3 py-2 text-xs disabled:opacity-40">Cancel · 1 AP</button>
          </div>
        </article>)}
        {opportunities.acceptedAssignments.length === 0 && <p className="text-sm text-stone-500">This character has no accepted Assignments.</p>}
      </div>
    </section>
  </div>;
}
