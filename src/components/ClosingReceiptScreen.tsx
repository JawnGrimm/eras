import React from 'react';
import type { AssignmentOffer, ClosingReceiptPayload, InstitutionalMatter } from '../state/types';
import { ASSIGNMENT_ACTIVITY_CATALOG } from '../content/assignments/northBayRoofInspection';
import { SealImpression } from './SealImpression';

export function assignmentReportForCloseout(assignment?: AssignmentOffer) {
  if (!assignment) return null;
  const definition = assignment.activityId ? ASSIGNMENT_ACTIVITY_CATALOG[assignment.activityId] : undefined;
  const draft = assignment.activityProgress?.draft;
  if (!definition || !draft) return null;
  const label = (options: readonly { id: string; label: string }[], id: string) =>
    options.find((option) => option.id === id)?.label ?? 'Not recorded';
  return {
    finding: label(definition.reportSchema.findings, draft.finding),
    responsibility: label(definition.reportSchema.responsibilityClaims, draft.responsibilityClaim),
    citedEvidence: draft.citedDiscoveryIds.map((id) => {
      const item = definition.discoveries.find((discovery) => discovery.id === id);
      return item ? { id, title: item.title, content: item.text, provenance: item.provenance } : { id, title: id, content: '', provenance: undefined };
    }),
    limitations: [
      ...(draft.selectedLimitationIds ?? []).map((id) => definition.reportSchema.limitationOptions?.find((item) => item.id === id)?.label ?? id),
      ...(draft.limitationNotes?.trim() ? [draft.limitationNotes.trim()] : []),
      ...(!definition.reportSchema.limitationOptions?.length ? draft.limitations.filter(Boolean) : []),
    ],
    recommendations: draft.recommendations.map((id) => definition.reportSchema.recommendations.find((item) => item.id === id)?.label ?? id),
  };
}

export function ClosingReceiptScreen({ receipt, kind, onReturn, assignment, employerName, matter }: {
  receipt: ClosingReceiptPayload;
  kind: 'assignment' | 'challenge';
  onReturn: () => void;
  assignment?: AssignmentOffer;
  employerName?: string;
  matter?: InstitutionalMatter;
}) {
  const formatDelta = (value: number) => value > 0 ? `+${value}` : String(value);
  const rows: Array<{ label: string; value: string }> = [];
  if (receipt.deltas.currency !== undefined && receipt.deltas.currency !== 0) rows.push({ label: 'Currency', value: formatDelta(receipt.deltas.currency) });
  if (receipt.deltas.provisions !== undefined && receipt.deltas.provisions !== 0) rows.push({ label: 'Provisions', value: formatDelta(receipt.deltas.provisions) });
  if (receipt.deltas.careerXp !== undefined) rows.push({ label: 'Career XP', value: formatDelta(receipt.deltas.careerXp) });
  rows.push({ label: 'Judgment', value: receipt.deltas.judgment > 0 ? `+${receipt.deltas.judgment}` : receipt.deltas.judgment < 0 ? String(receipt.deltas.judgment) : '0 · unchanged' });
  if (receipt.institutionName && receipt.deltas.institutionalStanding !== undefined) rows.push({ label: `Institutional Standing · ${receipt.institutionName}`, value: receipt.deltas.institutionalStanding > 0 ? `+${receipt.deltas.institutionalStanding}` : receipt.deltas.institutionalStanding < 0 ? String(receipt.deltas.institutionalStanding) : '0 · unchanged' });
  if (receipt.receiverName && receipt.deltas.trust !== undefined && receipt.deltas.respect !== undefined) {
    rows.push({ label: `Trust · ${receipt.receiverName}`, value: receipt.deltas.trust > 0 ? `+${receipt.deltas.trust}` : receipt.deltas.trust < 0 ? String(receipt.deltas.trust) : '0 · unchanged' });
    rows.push({ label: `Respect · ${receipt.receiverName}`, value: receipt.deltas.respect > 0 ? `+${receipt.deltas.respect}` : receipt.deltas.respect < 0 ? String(receipt.deltas.respect) : '0 · unchanged' });
  }
  const report = kind === 'assignment' ? assignmentReportForCloseout(assignment) : null;
  return <section role="dialog" aria-modal="true" aria-labelledby="closing-receipt-title" className="mx-auto max-w-3xl rounded-xl border border-stone-300 bg-[#fbf9f4] p-5 shadow-xl sm:p-8">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Filed docket · Day {receipt.dayNumber}</p>
        <h1 id="closing-receipt-title" className="mt-1 font-serif text-2xl font-semibold text-stone-900">{kind === 'assignment' ? 'Assignment Closeout' : 'Closing Receipt'}</h1>
        <p className="mt-1 text-sm text-stone-600">{kind === 'assignment' ? 'Assignment' : 'Challenge'} · {receipt.title}</p>
      </div>
      <SealImpression status="filed" institutionName={receipt.institutionName ?? 'Institutional Record'} dayNumber={receipt.dayNumber} />
    </div>
    {kind === 'assignment' && assignment && <section className="mt-6 rounded-lg border border-stone-200 bg-white p-4">
      <h2 className="font-semibold text-stone-900">The work you completed</h2>
      <p className="mt-2 text-sm font-medium text-stone-800">{assignment.title}</p>
      <p className="mt-1 text-sm leading-6 text-stone-700">{assignment.context.what}</p>
      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        {employerName && <div><dt className="text-xs font-semibold text-stone-500">Requested by</dt><dd>{employerName}</dd></div>}
        {assignment.context.where && <div><dt className="text-xs font-semibold text-stone-500">Place</dt><dd>{assignment.context.where}</dd></div>}
        {assignment.context.purpose && <div className="sm:col-span-2"><dt className="text-xs font-semibold text-stone-500">Purpose</dt><dd>{assignment.context.purpose}</dd></div>}
      </dl>
    </section>}
    {report && <section className="mt-4 rounded-lg border border-stone-200 bg-white p-4">
      <h2 className="font-semibold text-stone-900">Your submitted report</h2>
      <dl className="mt-3 space-y-3 text-sm">
        <div><dt className="font-semibold text-stone-600">Finding</dt><dd className="mt-1 text-stone-800">{report.finding}</dd></div>
        <div><dt className="font-semibold text-stone-600">Responsibility</dt><dd className="mt-1 text-stone-800">{report.responsibility}</dd></div>
        <div><dt className="font-semibold text-stone-600">Cited evidence</dt><dd className="mt-1 text-stone-800">
          {report.citedEvidence.length ? <ul className="space-y-3">
            {report.citedEvidence.map((item) => <li key={item.id} className="rounded border border-stone-200 bg-stone-50 p-3">
              <p className="font-semibold">{item.title}</p>
              {item.content && <p className="mt-1 leading-6">{item.content}</p>}
              {item.provenance && <p className="mt-2 text-sm leading-5"><strong>{item.provenance.classification}</strong> · Provenance: {item.provenance.explanation}</p>}
            </li>)}
          </ul> : 'No discoveries cited'}
        </dd></div>
        <div><dt className="font-semibold text-stone-600">Limitations</dt><dd className="mt-1 text-stone-800">{report.limitations.length ? report.limitations.join('; ') : 'No limitations recorded'}</dd></div>
        <div><dt className="font-semibold text-stone-600">Recommendations</dt><dd className="mt-1 text-stone-800">{report.recommendations.length ? report.recommendations.join('; ') : 'No recommendations made'}</dd></div>
      </dl>
    </section>}
    <div className="mt-4 rounded-lg border border-stone-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Assessment and disposition</p>
      <p className="mt-1 font-semibold text-stone-900">{receipt.disposition}</p>
      <p className="mt-3 text-sm font-semibold text-stone-800">Assessment · {receipt.assessment}</p>
      <p className="mt-1 text-sm leading-6 text-stone-700">{receipt.rationale}</p>
    </div>
    <div className="mt-4 rounded-lg border border-stone-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">{receipt.receiverName ? `Received by · ${receipt.receiverName}` : 'Institutional filing response'}</p>
      <p className="mt-2 text-sm leading-6 text-stone-800">{receipt.reaction}</p>
    </div>
    {kind === 'assignment' && <section className="mt-4 rounded-lg border border-amber-200 bg-amber-50/70 p-4">
      <h2 className="font-semibold text-stone-900">The wider matter</h2>
      {matter ? <>
        <p className="mt-2 text-sm leading-6 text-stone-800">{matter.summary}</p>
        <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-stone-600">Current status · {matter.status === 'active' ? 'Still active' : matter.status.replace(/_/g, ' ')}</p>
      </> : <p className="mt-2 text-sm leading-6 text-stone-800">Your part of this Assignment is complete. The institution may continue the wider matter through other officials, further records, or another Assignment.</p>}
      <p className="mt-2 text-sm leading-6 text-stone-700">This receipt records the work you submitted and its assessment. It does not, by itself, settle every question or complete any further work that the matter may require.</p>
    </section>}
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
