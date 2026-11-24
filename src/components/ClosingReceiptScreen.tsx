import React from 'react';
import type { ClosingReceiptPayload } from '../state/types';
import { SealImpression } from './SealImpression';

export function ClosingReceiptScreen({ receipt, kind, onReturn }: {
  receipt: ClosingReceiptPayload;
  kind: 'assignment' | 'challenge';
  onReturn: () => void;
}) {
  const formatDelta = (value: number) => value > 0 ? `+${value}` : String(value);
  const rows: Array<{ label: string; value: string }> = [];
  if (receipt.deltas.currency !== 0) rows.push({ label: 'Currency', value: formatDelta(receipt.deltas.currency) });
  if (receipt.deltas.provisions !== 0) rows.push({ label: 'Provisions', value: formatDelta(receipt.deltas.provisions) });
  if (receipt.deltas.careerXp !== 0) rows.push({ label: 'Career XP', value: formatDelta(receipt.deltas.careerXp) });
  rows.push({ label: 'Judgment', value: receipt.deltas.judgment > 0 ? `+${receipt.deltas.judgment}` : receipt.deltas.judgment < 0 ? String(receipt.deltas.judgment) : '0 · unchanged' });
  if (receipt.institutionName) rows.push({ label: `Institutional Standing · ${receipt.institutionName}`, value: receipt.deltas.institutionalStanding > 0 ? `+${receipt.deltas.institutionalStanding}` : receipt.deltas.institutionalStanding < 0 ? String(receipt.deltas.institutionalStanding) : '0 · unchanged' });
  if (receipt.receiverName) {
    rows.push({ label: `Trust · ${receipt.receiverName}`, value: receipt.deltas.trust > 0 ? `+${receipt.deltas.trust}` : receipt.deltas.trust < 0 ? String(receipt.deltas.trust) : '0 · unchanged' });
    rows.push({ label: `Respect · ${receipt.receiverName}`, value: receipt.deltas.respect > 0 ? `+${receipt.deltas.respect}` : receipt.deltas.respect < 0 ? String(receipt.deltas.respect) : '0 · unchanged' });
  }
  return <section role="dialog" aria-modal="true" aria-labelledby="closing-receipt-title" className="mx-auto max-w-3xl rounded-xl border border-stone-300 bg-[#fbf9f4] p-5 shadow-xl sm:p-8">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Filed docket · Day {receipt.dayNumber}</p>
        <h1 id="closing-receipt-title" className="mt-1 font-serif text-2xl font-semibold text-stone-900">Closing Receipt</h1>
        <p className="mt-1 text-sm text-stone-600">{kind === 'assignment' ? 'Assignment' : 'Challenge'} · {receipt.title}</p>
      </div>
      <SealImpression status="filed" institutionName={receipt.institutionName ?? 'Institutional Record'} dayNumber={receipt.dayNumber} />
    </div>
    <div className="mt-6 rounded-lg border border-stone-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Disposition</p>
      <p className="mt-1 font-semibold text-stone-900">{receipt.disposition}</p>
      <p className="mt-3 text-sm font-semibold text-stone-800">Assessment · {receipt.assessment}</p>
      <p className="mt-1 text-sm leading-6 text-stone-700">{receipt.rationale}</p>
    </div>
    <div className="mt-4 rounded-lg border border-stone-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">{receipt.receiverName ? `Received by · ${receipt.receiverName}` : 'Institutional filing response'}</p>
      <p className="mt-2 text-sm leading-6 text-stone-800">{receipt.reaction}</p>
    </div>
    <div className="mt-4 rounded-lg border border-stone-200 bg-white p-4">
      <h2 className="font-semibold text-stone-900">Recorded changes</h2>
      <dl className="mt-3 grid gap-3 sm:grid-cols-2">
        {rows.map((row) => <div key={row.label} className="flex items-baseline justify-between gap-3 border-b border-stone-100 pb-2">
          <dt className="text-sm text-stone-600">{row.label}</dt><dd className="font-mono text-sm font-semibold text-stone-900">{row.value}</dd>
        </div>)}
      </dl>
      {receipt.compensationTiming && <p className="mt-3 text-xs leading-5 text-stone-600">{receipt.compensationTiming}</p>}
    </div>
    <div className="mt-6 flex justify-end">
      <button type="button" onClick={onReturn} className="rounded-lg bg-stone-900 px-5 py-3 text-sm font-semibold text-white hover:bg-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900">
        {kind === 'assignment' ? 'Return to Assignment Board' : 'Return to Challenge Journal'}
      </button>
    </div>
  </section>;
}
