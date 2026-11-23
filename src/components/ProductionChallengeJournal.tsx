import React from 'react';
import { getInitializedScribal } from '../state/scribalState';
import { useGame } from '../state/GameProvider';
import { selectCharacterOpportunities } from '../state/opportunitySelectors';
import type { AssignmentOffer, GameState } from '../state/types';
import type { InstitutionId, PersonId } from '../state/ids';

function employerName(offer: AssignmentOffer | undefined, state: GameState): string {
  if (!offer) return 'Employer not recorded';
  if (offer.employer.kind === 'person') return state.world.people[offer.employer.id as PersonId]?.name ?? 'Person not recorded';
  return state.world.institutions[offer.employer.id as InstitutionId]?.name ?? 'Institution not recorded';
}

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

export function ProductionChallengeJournal() {
  const { state, dispatch } = useGame();
  const data = selectCharacterOpportunities(state);
  const person = state.world.people[state.player.currentCharacterId];
  const reputation = getInitializedScribal(person)?.professionalReputation;

  return <div className="mx-auto max-w-6xl space-y-6">
    <header>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">Career record</p>
      <h1 className="font-serif text-3xl font-semibold text-stone-900">Challenge Journal</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">The journal keeps current situations separate from completed outcomes. Offers, refusals, and expired challenges are operational state, not permanent career accomplishments.</p>
    </header>

    {reputation && <section className="rounded-xl border border-stone-300 bg-white p-5">
      <h2 className="font-serif text-xl font-semibold">Professional reputation</h2>
      <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Object.entries(reputation).map(([key, value]) => <div key={key}><dt className="text-xs capitalize text-stone-500">{key}</dt><dd className="font-mono text-xl font-semibold">{value}</dd></div>)}
      </dl>
    </section>}

    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {[
        ['Assignments presented', data.totals.presented],
        ['Assignments completed', data.totals.completed],
        ['Challenges resolved', data.challengeArchive.length],
        ['Assignment rewards', `${data.totals.silverEarned} silver · ${data.totals.careerXpEarned.toLocaleString()} XP`],
      ].map(([label, value]) => <div key={String(label)} className="rounded-xl border border-stone-300 bg-white p-4">
        <p className="text-xs text-stone-500">{label}</p><p className="mt-1 font-serif text-2xl font-semibold text-stone-900">{value}</p>
      </div>)}
    </section>

    <section className="rounded-xl border border-stone-300 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-serif text-xl font-semibold">Current Challenges</h2><span className="text-xs text-stone-500">{data.offeredChallenges.length} offered · {data.acceptedChallenges.length} accepted by this character</span></div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {data.offeredChallenges.map((challenge) => <article key={challenge.id} className="rounded-lg border border-stone-200 bg-stone-50 p-4">
          <h3 className="font-semibold text-stone-900">{challenge.title}</h3><p className="mt-2 text-sm text-stone-600">{challenge.description}</p>
          <DeliveryReasons channels={challenge.deliveryChannels} /><ContextDetails context={challenge.context} />
          <p className="mt-3 text-xs text-stone-500">Presented Day {challenge.presentedDay} · Resolution costs {challenge.apCost} AP</p>
          <div className="mt-3 flex gap-2">
            <button onClick={() => dispatch({ type: 'ACCEPT_CHALLENGE', challengeId: challenge.id })} className="rounded-md bg-stone-900 px-3 py-2 text-xs font-semibold text-white">Accept</button>
            <button onClick={() => dispatch({ type: 'DECLINE_CHALLENGE', challengeId: challenge.id })} className="rounded-md border border-stone-300 px-3 py-2 text-xs">Decline</button>
          </div>
        </article>)}
        {data.acceptedChallenges.map((challenge) => <article key={challenge.id} className="rounded-lg border border-amber-300 bg-amber-50/50 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-amber-800">Accepted commitment</div>
          <h3 className="mt-1 font-semibold text-stone-900">{challenge.title}</h3><p className="mt-2 text-sm text-stone-600">{challenge.description}</p>
          <DeliveryReasons channels={challenge.deliveryChannels} /><ContextDetails context={challenge.context} />
          <div className="mt-3 space-y-2">{challenge.choices.map((choice) => <div key={choice.id} className="rounded-md border border-stone-200 bg-white p-3">
            <p className="text-sm font-semibold text-stone-800">{choice.label}</p>
            <p className="mt-1 text-xs leading-5 text-stone-600">{choice.description}</p>
            <button disabled={state.actionEconomy.apRemaining < challenge.apCost}
              onClick={() => dispatch({ type: 'RESOLVE_CHALLENGE', challengeId: challenge.id, choiceId: choice.id })}
              className="mt-2 rounded-md border border-stone-300 px-3 py-2 text-xs disabled:opacity-40">Choose · {challenge.apCost} AP</button>
          </div>)}</div>
        </article>)}
        {data.offeredChallenges.length === 0 && data.acceptedChallenges.length === 0 && <p className="text-sm text-stone-500">No current Challenges have reached this character.</p>}
      </div>
    </section>

    <section className="rounded-xl border border-stone-300 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-serif text-xl font-semibold">Recent Assignment activity</h2><span className="text-xs text-stone-500">Latest {data.recentAssignmentActivity.length} · bounded to five entries</span></div>
      {data.recentAssignmentActivity.length === 0 ? <p className="mt-3 text-sm text-stone-500">Assignment activity will appear here.</p> :
        <ol className="mt-3 divide-y divide-stone-200">{data.recentAssignmentActivity.map(({ activity, offer }) => <li key={`${activity.assignmentId}-${activity.dayNumber}-${activity.kind}`} className="flex flex-wrap items-center justify-between gap-2 py-3">
          <div><p className="text-sm font-medium text-stone-900">{offer?.title ?? 'Assignment record'} <span className="font-normal text-stone-500">· {activity.kind}</span></p>
            <p className="text-xs text-stone-500">{employerName(offer, state)} · {activity.category}
              {activity.lapsedDuringMandatoryWork ? ' · Lapsed during mandatory Work' : ''}</p></div>
          <span className="text-xs text-stone-500">Day {activity.dayNumber}</span>
        </li>)}</ol>}
      <p className="mt-3 text-xs text-stone-500">Totals: {data.totals.presented} presented · {data.totals.accepted} accepted · {data.totals.declined} declined · {data.totals.nonWorkLapsed} non-Work lapses · {data.totals.completed} completed</p>
    </section>

    <section className="rounded-xl border border-stone-300 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-serif text-xl font-semibold">Completed Challenge archive</h2><span className="text-xs text-stone-500">{data.challengeArchive.length} outcomes</span></div>
      {data.challengeArchive.length === 0 ? <p className="mt-3 text-sm text-stone-500">Resolved Challenge outcomes will be preserved here.</p> :
        <div className="mt-3 space-y-3">{data.challengeArchive.map((outcome) => {
          const resolver = outcome.assigneePersonId ? state.world.people[outcome.assigneePersonId]?.name ?? 'Former character' : 'Character not recorded';
          return <article key={outcome.challengeId} className="rounded-lg border border-stone-200 bg-stone-50 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2"><h3 className="font-semibold text-stone-900">{outcome.title}</h3><span className="text-xs text-stone-500">Resolved Day {outcome.resolvedDay}</span></div>
            <p className="mt-1 text-xs text-stone-500">{outcome.category} · Resolved by {resolver}</p>
            <p className="mt-2 text-sm font-medium text-stone-800">{outcome.choiceLabel}</p><p className="mt-1 text-sm text-stone-600">{outcome.summary}</p>
          </article>;
        })}</div>}
    </section>
  </div>;
}
