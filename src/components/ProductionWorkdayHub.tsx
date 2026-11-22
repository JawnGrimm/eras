import React from 'react';
import { useGame } from '../state/GameProvider';
import type { DaySettlement } from '../state/types';
import { STOREHOUSE_WORK_ID } from '../works/storehouseReckoning';
import { selectCharacterOpportunities } from '../state/opportunitySelectors';
import { characterQualifiesForAssignment } from '../engine/opportunities';

function ContextDetails({ context }: { context: { what: string; who: string[]; quantity?: string; when?: string; where?: string; from?: string; to?: string; purpose: string; responsibility: string[]; authority?: string; provenance: string[] } }) {
  const rows: Array<[string, string | undefined]> = [
    ['What', context.what], ['Who', context.who.join('; ')], ['Quantity', context.quantity],
    ['When', context.when], ['Where', context.where], ['From', context.from], ['To', context.to],
    ['Purpose', context.purpose], ['Authority', context.authority],
    ['Responsibility', context.responsibility.join('; ')], ['Provenance', context.provenance.join('; ')],
  ];
  return <details className="mt-2 text-xs text-stone-600">
    <summary className="cursor-pointer font-medium text-amber-800">Full matter context</summary>
    <dl className="mt-2 grid gap-2 sm:grid-cols-2">{rows.filter((row) => row[1]).map(([label, value]) =>
      <div key={label}><dt className="font-semibold text-stone-700">{label}</dt><dd className="leading-5">{value}</dd></div>)}</dl>
  </details>;
}

function SettlementSummary({ settlement }: { settlement: DaySettlement }) {
  const reason = settlement.workContractProvisionReason === 'qualified_workday'
    ? 'Workday qualification met'
    : settlement.workContractProvisionReason === 'insufficient_work_ap'
      ? 'Work AP threshold not met'
      : 'No active Work provision contract';
  return <section aria-live="polite" className="rounded-xl border border-amber-300 bg-amber-50 p-5">
    <h2 className="font-serif text-xl font-semibold text-stone-900">Workday settlement</h2>
    <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div><dt className="text-xs text-stone-500">Starting provisions</dt><dd className="font-mono text-xl">{settlement.startingProvisions}</dd></div>
      <div><dt className="text-xs text-stone-500">Work contract provision earned</dt><dd className="font-mono text-xl">+{settlement.workContractProvisionEarned}</dd><dd className="text-xs text-stone-600">{reason}</dd></div>
      <div><dt className="text-xs text-stone-500">Sustenance deducted</dt><dd className="font-mono text-xl">−{settlement.sustenanceDeducted}</dd></div>
      <div><dt className="text-xs text-stone-500">Ending provisions</dt><dd className="font-mono text-xl font-semibold">{settlement.endingProvisions}</dd></div>
      <div><dt className="text-xs text-stone-500">Shortage workdays</dt><dd className="font-mono text-xl">{settlement.shortageWorkdays}</dd></div>
      <div><dt className="text-xs text-stone-500">Overtime Stress added</dt><dd className="font-mono text-xl">+{settlement.overtimeStress}</dd></div>
      <div><dt className="text-xs text-stone-500">Tomorrow’s AP allocation</dt><dd className="font-mono text-xl">{settlement.tomorrowAp}</dd></div>
    </dl>
  </section>;
}

export function ProductionWorkdayHub({ onOpenWork, onOpenActivity, settlement, onSettlement }: {
  onOpenWork: () => void; onOpenActivity: (assignmentId: string) => void; settlement: DaySettlement | null; onSettlement: (settlement: DaySettlement) => void;
}) {
  const game = useGame();
  const state = game.state;
  const person = state.world.people[state.player.currentCharacterId];
  if (state.pendingSuccession || !person?.alive || !person.scribal) {
    return <section role="status" className="mx-auto max-w-3xl rounded-xl border border-amber-300 bg-amber-50 p-6">
      <h1 className="font-serif text-2xl font-semibold">Workday paused</h1>
      <p className="mt-2 text-sm text-stone-700">Ordinary workday actions are unavailable while the character transition is unresolved.</p>
    </section>;
  }
  const wallet = person.scribal.wallet;
  const activeWork = state.works.progress[STOREHOUSE_WORK_ID];
  const opportunities = selectCharacterOpportunities(state);
  const offeredAssignments = opportunities.offeredAssignments;
  const activeAssignments = opportunities.acceptedAssignments;
  const offeredChallenges = opportunities.offeredChallenges;
  const acceptedChallenges = opportunities.acceptedChallenges;
  const canEndDay = !(state.actionEconomy.overtimeUsedToday && state.actionEconomy.apRemaining > 0);
  const endDay = () => {
    const result = game.dispatch({ type: 'END_DAY', expectedDayNumber: state.calendar.dayNumber });
    if (result.settlement) onSettlement(result.settlement);
  };
  const activateOvertime = () => game.dispatch({ type: 'ACTIVATE_OVERTIME' });

  return <div className="mx-auto max-w-6xl space-y-6">
    <header>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">Uruk · Workday {state.calendar.dayNumber}</p>
      <h1 className="font-serif text-3xl font-semibold text-stone-900">Workday Hub</h1>
      <p className="mt-2 text-sm text-stone-600">The introductory tutorial guides your first professional exercise. Optional Assignments and Challenges remain separate commitments; mandatory historical Works come later.</p>
    </header>
    {settlement && <SettlementSummary settlement={settlement} />}
    <section className="rounded-xl border border-stone-300 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">Introductory tutorial</p>
          <h2 className="mt-1 font-serif text-2xl font-semibold text-stone-900">The Storehouse Reckoning</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">Complete a guided exercise in reconciling the temple storehouse records and preparing a defensible account for the Senior Scribe.</p>
          <p className="mt-3 text-xs text-stone-500">{activeWork?.status === 'completed' ? 'Completed' : activeWork?.status === 'active' ? 'In progress' : 'Not started'} · No provision contract · 0 Historical Progress XP</p>
        </div>
        <button onClick={onOpenWork} className="rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-800">Open Tutorial</button>
      </div>
      <div className="mt-4 flex flex-wrap gap-4 border-t border-stone-200 pt-4 text-sm">
        <span><strong className="font-mono">{state.actionEconomy.apRemaining}/{state.actionEconomy.dailyApAllocation}</strong> AP remaining</span>
        <span><strong className="font-mono">{wallet.provisions}</strong> provisions</span>
        <span><strong className="font-mono">{wallet.money}</strong> silver</span>
        <span><strong className="font-mono">{state.historicalProgression.historicalXp.toLocaleString()}</strong> Historical Progress XP</span>
      </div>
    </section>

    <div className="grid gap-5 lg:grid-cols-2">
      <section className="rounded-xl border border-stone-300 bg-white p-5">
        <div className="flex items-center justify-between"><h2 className="font-serif text-xl font-semibold text-stone-900">Assignments / Commissions</h2><span className="text-xs text-stone-500">{activeAssignments.length}/2 active</span></div>
        <p className="mt-1 text-sm text-stone-600">Optional professional jobs award compensation and Career XP, not Historical Progress XP.</p>
        <div className="mt-4 space-y-3">
          {offeredAssignments.map((offer) => {
            const qualifies = characterQualifiesForAssignment(state, offer);
            const expired = state.calendar.dayNumber >= offer.expiresDay;
            return <article key={offer.id} className="rounded-lg bg-stone-50 p-3">
            <h3 className="font-semibold text-stone-900">{offer.title}</h3><p className="mt-1 text-sm text-stone-600">{offer.description}</p>
            <ContextDetails context={offer.context} />
            <p className="mt-2 text-xs text-stone-500">{offer.activityId ? `Estimated ${offer.estimatedTotalAp} AP total` : `Completion: ${offer.apCost} AP`} · {offer.compensation.money} silver · {offer.careerXpReward} Career XP</p>
            <div className="mt-2 flex gap-2"><button disabled={activeAssignments.length >= 2 || !qualifies || expired} onClick={() => game.dispatch({ type: 'ACCEPT_ASSIGNMENT', assignmentId: offer.id })} className="rounded-md bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40">Accept</button><button onClick={() => game.dispatch({ type: 'DECLINE_ASSIGNMENT', assignmentId: offer.id })} className="rounded-md border border-stone-300 px-3 py-1.5 text-xs">Decline</button></div>
            {Object.keys(offer.requiredSkills).length > 0 && <p className="mt-2 text-xs text-stone-500">Requirements: {Object.entries(offer.requiredSkills).map(([skill, level]) => `${skill.replaceAll('_', ' ')} ${level}`).join(', ')}</p>}
            {!qualifies && <p className="mt-1 text-xs text-amber-800">Current skills do not meet the stated requirements.</p>}
            {expired && <p className="mt-1 text-xs text-amber-800">This offer has reached its expiry day.</p>}
          </article>;
          })}
          {offeredAssignments.length === 0 && <p className="text-sm text-stone-500">No new commissions are currently offered.</p>}
          {activeAssignments.map((item) => <article key={item.id} className="rounded-lg bg-stone-50 p-3">
            <h3 className="font-semibold text-stone-900">{item.title}</h3>
            <p className="mt-1 text-sm text-stone-600">{item.description}</p>
            <ContextDetails context={item.context} />
            <p className="mt-1 text-xs text-stone-500">{item.activityId ? `Accepted commitment · estimated ${item.estimatedTotalAp} AP across Workdays` : `Accepted commitment · completion costs ${item.apCost} AP`}</p>
            <div className="mt-2 flex gap-2">
              {item.activityId ? <button onClick={() => onOpenActivity(item.id)} className="rounded-md bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white">{item.activityProgress?.completedActionIds.length ? 'Resume Activity' : 'Open Activity'}</button> : <button disabled={state.actionEconomy.apRemaining < (item.apCost ?? 0)} onClick={() => game.dispatch({ type: 'COMPLETE_ASSIGNMENT', assignmentId: item.id })} className="rounded-md bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40">Complete · {item.apCost} AP</button>}
              <button disabled={state.actionEconomy.apRemaining < 1} onClick={() => game.dispatch({ type: 'CANCEL_ASSIGNMENT', assignmentId: item.id })} className="rounded-md border border-stone-300 px-3 py-1.5 text-xs disabled:opacity-40">Cancel · 1 AP</button>
            </div>
          </article>)}
        </div>
      </section>
      <section className="rounded-xl border border-stone-300 bg-white p-5">
        <div className="flex items-center justify-between"><h2 className="font-serif text-xl font-semibold text-stone-900">Challenges</h2><span className="text-xs text-stone-500">{acceptedChallenges.length} accepted</span></div>
        <p className="mt-1 text-sm text-stone-600">Optional narrative situations. Their outcomes never award Historical Progress XP.</p>
        <div className="mt-4 space-y-3">
          {offeredChallenges.map((challenge) => <article key={challenge.id} className="rounded-lg bg-stone-50 p-3">
            <h3 className="font-semibold text-stone-900">{challenge.title}</h3><p className="mt-1 text-sm text-stone-600">{challenge.description}</p>
            <ContextDetails context={challenge.context} />
            <p className="mt-2 text-xs text-stone-500">Resolution costs {challenge.apCost} AP</p>
            <div className="mt-2 flex gap-2"><button onClick={() => game.dispatch({ type: 'ACCEPT_CHALLENGE', challengeId: challenge.id })} className="rounded-md bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white">Accept challenge</button><button onClick={() => game.dispatch({ type: 'DECLINE_CHALLENGE', challengeId: challenge.id })} className="rounded-md border border-stone-300 px-3 py-1.5 text-xs">Decline</button></div>
          </article>)}
          {acceptedChallenges.map((challenge) => <article key={challenge.id} className="rounded-lg bg-stone-50 p-3">
            <h3 className="font-semibold text-stone-900">{challenge.title}</h3>
            <p className="mt-1 text-sm text-stone-600">{challenge.description}</p>
            <ContextDetails context={challenge.context} />
            <div className="mt-2 flex flex-wrap gap-2">{challenge.choices.map((choice) => <button key={choice.id} disabled={state.actionEconomy.apRemaining < challenge.apCost} onClick={() => game.dispatch({ type: 'RESOLVE_CHALLENGE', challengeId: challenge.id, choiceId: choice.id })} className="rounded-md border border-stone-300 px-3 py-1.5 text-xs">{choice.label} · {challenge.apCost} AP</button>)}</div>
          </article>)}
          {offeredChallenges.length === 0 && acceptedChallenges.length === 0 && <p className="text-sm text-stone-500">No active challenges.</p>}
        </div>
      </section>
    </div>

    <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-300 bg-white p-5">
      <div><h2 className="font-serif text-xl font-semibold text-stone-900">Close the Workday</h2><p className="mt-1 text-sm text-stone-600">Settle provisions, sustenance, shortage, overtime, and tomorrow’s AP.</p></div>
      <div className="flex gap-2">
        {state.actionEconomy.apRemaining === 0 && !state.actionEconomy.overtimeUsedToday && <button onClick={activateOvertime} className="rounded-lg border border-amber-700 px-3 py-2 text-sm text-amber-900">Work overtime · +1 AP</button>}
        <button disabled={!canEndDay} onClick={endDay} className="rounded-lg bg-amber-800 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40">End Workday</button>
      </div>
    </section>
  </div>;
}
