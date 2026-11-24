import React from 'react';
import { getInitializedScribal } from '../state/scribalState';
import { useGame } from '../state/GameProvider';

export function EveningInterlude({ onBeginWorkday }: { onBeginWorkday: () => void }) {
  const game = useGame();
  const state = game.state;
  const person = state.world.people[state.player.currentCharacterId];
  const scribal = getInitializedScribal(person);
  const preview = state.dayClose.preview;
  const settlementId = state.dayClose.pendingSettlementId;

  if (!person || !scribal || !preview || !settlementId) {
    return <section role="alert" className="mx-auto max-w-3xl rounded-xl border border-red-300 bg-red-50 p-6">
      <h1 className="font-serif text-2xl font-semibold text-red-950">Evening settlement unavailable</h1>
      <p className="mt-2 text-sm text-red-900">The saved Interlude is missing its validated settlement details. No balances or calendar values have been changed.</p>
    </section>;
  }

  const canExchange = scribal.wallet.money >= 2;
  const beginWorkday = () => {
    const result = game.dispatch({ type: 'BEGIN_WORKDAY', expectedSettlementId: settlementId });
    if (result.state !== state && result.feedback?.kind !== 'error') onBeginWorkday();
  };

  return <main className="mx-auto max-w-4xl space-y-5">
    <header>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">Uruk · Evening after Workday {state.calendar.dayNumber}</p>
      <h1 className="mt-1 font-serif text-3xl font-semibold text-stone-900">Evening Interlude</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">The day’s earned payments have been credited. Sustenance has not yet been deducted, and no shortage consequence has been applied. Review the balances and make any eligible exchange before beginning the next Workday.</p>
    </header>

    <section className="rounded-xl border border-stone-300 bg-white p-5">
      <h2 className="font-serif text-xl font-semibold text-stone-900">Preliminary settlement</h2>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div><dt className="text-xs text-stone-500">Assignment Currency credited</dt><dd className="font-mono text-2xl">+{preview.assignmentMoneyEarned}</dd></div>
        <div><dt className="text-xs text-stone-500">Assignment Provisions credited</dt><dd className="font-mono text-2xl">+{preview.assignmentProvisionsEarned}</dd></div>
        <div><dt className="text-xs text-stone-500">Work-contract Provisions credited</dt><dd className="font-mono text-2xl">+{preview.workContractProvisionEarned}</dd></div>
      </dl>
      <div className="mt-4 grid gap-3 border-t border-stone-200 pt-4 sm:grid-cols-2">
        <div><p className="text-xs text-stone-500">Current Currency</p><p className="font-mono text-2xl font-semibold">{scribal.wallet.money}</p></div>
        <div><p className="text-xs text-stone-500">Current Provisions</p><p className="font-mono text-2xl font-semibold">{scribal.wallet.provisions}</p></div>
      </div>
    </section>

    <section className="rounded-xl border border-amber-300 bg-amber-50 p-5">
      <h2 className="font-serif text-xl font-semibold text-stone-900">Tonight’s sustenance</h2>
      <p className="mt-2 text-sm text-stone-700">Sustenance costs exactly 1 Provision at Begin Workday. If you proceed now, the projected balance afterward is <strong>{preview.endingProvisions}</strong>.</p>
      {preview.sustenanceDeducted === 0
        ? <p className="mt-2 text-sm font-semibold text-amber-900">No Provision is available. This would be shortage day {preview.shortageWorkdays}{preview.shortageWorkdays >= 3 ? ', applying Underfed and +' + preview.shortageStressDelta + ' Stress.' : ' within the two-Workday grace period.'}</p>
        : <p className="mt-2 text-sm text-stone-700">The sustenance deduction is covered. No shortage consequence will be applied.</p>}
      <dl className="mt-4 grid gap-3 sm:grid-cols-3">
        <div><dt className="text-xs text-stone-500">Projected provisions after sustenance</dt><dd className="font-mono text-xl font-semibold">{preview.endingProvisions}</dd></div>
        <div><dt className="text-xs text-stone-500">Shortage Stress if proceeding</dt><dd className="font-mono text-xl">+{preview.shortageStressDelta}</dd></div>
        <div><dt className="text-xs text-stone-500">Tomorrow’s AP allocation</dt><dd className="font-mono text-xl">{preview.tomorrowAp}/6</dd></div>
      </dl>
    </section>

    {state.calendar.eraId === 'era-1' && <section className="rounded-xl border border-stone-300 bg-white p-5">
      <h2 className="font-serif text-xl font-semibold text-stone-900">Currency exchange</h2>
      <p className="mt-2 text-sm leading-6 text-stone-600">For Playtest 1, you may exchange 2 Currency for 1 Provision. This is a provisional game conversion, not a claim about a universal market price or coinage in Late Uruk. The exchange spends Currency immediately and updates the sustenance preview.</p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-stone-800">2 Currency → 1 Provision</p>
        <button disabled={!canExchange} onClick={() => game.dispatch({ type: 'BUY_PROVISIONS', amount: 1 })}
          className="rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40">
          Exchange 2 Currency
        </button>
      </div>
      {!canExchange && <p className="mt-2 text-xs text-stone-500">At least 2 Currency is required for this exchange.</p>}
    </section>}

    <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-300 bg-white p-5">
      <div><h2 className="font-serif text-xl font-semibold text-stone-900">Ready for tomorrow?</h2><p className="mt-1 text-sm text-stone-600">Begin Workday finalizes sustenance and any due shortage consequence, advances the calendar, and initializes tomorrow’s AP. No evening AP or labor is available.</p></div>
      <button onClick={beginWorkday} className="rounded-lg bg-amber-800 px-5 py-3 text-sm font-semibold text-white">Begin Workday</button>
    </section>
  </main>;
}
