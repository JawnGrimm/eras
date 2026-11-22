import React from 'react';
import { useGame } from '../state/GameProvider';

const classificationLabel: Record<string, string> = {
  observed: 'Observed', reported: 'Reported', inferred: 'Inferred', disputed: 'Disputed',
};
const basisLabel: Record<string, string> = {
  'direct-involvement': 'Direct involvement',
  testimony: 'Testimony',
  'received-copy': 'Received a copy',
  'consulted-record': 'Consulted a record',
  'public-disclosure': 'Public disclosure',
  other: 'Other basis',
};

export function ProductionRecordsAndJournal() {
  const { state, dispatch } = useGame();
  const records = Object.values(state.records.entries).sort((a, b) => b.createdDay - a.createdDay);
  const knowledge = Object.values(state.world.knowledge).sort((a, b) => b.learnedDay - a.learnedDay);
  const notices = [...state.journal.notices].sort((a, b) => b.dayNumber - a.dayNumber);

  const personName = (id: string) => state.world.people[id as keyof typeof state.world.people]?.name ?? 'Unknown person';
  const institutionName = (id: string) => state.world.institutions[id as keyof typeof state.world.institutions]?.name ?? 'Unknown institution';
  const sourceLabel = (source: { kind: string; sourceId?: string; description: string }) => {
    const origin = source.kind === 'person' && source.sourceId ? personName(source.sourceId)
      : source.kind === 'institution' && source.sourceId ? institutionName(source.sourceId)
        : source.kind === 'event' && source.sourceId ? state.world.events[source.sourceId as keyof typeof state.world.events]?.summary ?? source.sourceId
          : source.kind === 'material' ? 'Material source' : 'Other source';
    return `${origin}: ${source.description}`;
  };

  return <div className="mx-auto max-w-6xl space-y-6">
    <header>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">Documentary memory</p>
      <h1 className="font-serif text-3xl font-semibold">Records & Journal</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">Original record assertions remain intact. Later qualifications are appended as amendments; knowledge belongs only to its explicitly recorded holder. Durable notices preserve developments surfaced to the player.</p>
    </header>

    <section className="space-y-3">
      <div><h2 className="font-serif text-2xl font-semibold">Records</h2><p className="text-sm text-stone-600">{records.length} archived records</p></div>
      {records.map((record) => <article key={record.id} className="rounded-xl border border-stone-300 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div><h3 className="font-serif text-xl font-semibold">{record.title}</h3>
            <p className="mt-1 text-xs text-stone-500">Created Day {record.createdDay} · Author: {personName(record.authorPersonId)}{record.institutionId ? ` · ${institutionName(record.institutionId)}` : ''}</p>
          </div>
          <span className="rounded bg-stone-100 px-2 py-1 text-xs text-stone-600">Original record preserved</span>
        </div>
        <section className="mt-4"><h4 className="text-sm font-semibold">Original sources</h4>
          {record.sources.length ? <ul className="mt-2 space-y-1 text-sm text-stone-700">{record.sources.map((source) => <li key={source.id}>{sourceLabel(source)}</li>)}</ul> : <p className="mt-1 text-xs text-stone-500">No sources recorded.</p>}
        </section>
        <section className="mt-4"><h4 className="text-sm font-semibold">Original assertions</h4>
          {record.assertions.length ? <ol className="mt-2 space-y-2">{record.assertions.map((assertion) => <li key={assertion.id} className="rounded bg-stone-50 p-3">
            <p className="text-sm text-stone-800">{assertion.text}</p>
            <p className="mt-1 text-xs text-stone-500">{classificationLabel[assertion.classification] ?? assertion.classification} · Sources: {assertion.sourceIds.join(', ') || 'None cited'}</p>
          </li>)}</ol> : <p className="mt-1 text-xs text-stone-500">No assertions recorded.</p>}
        </section>
        <section className="mt-4"><h4 className="text-sm font-semibold">Original uncertainty limits</h4>
          {record.uncertaintyLimits.length ? <ul className="mt-2 list-inside list-disc text-sm text-stone-700">{record.uncertaintyLimits.map((limit, index) => <li key={index}>{limit}</li>)}</ul> : <p className="mt-1 text-xs text-stone-500">No explicit limits recorded in the original entry.</p>}
        </section>
        <section className="mt-4 border-t border-stone-200 pt-4"><div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-semibold">Append-only amendment history</h4><span className="text-xs text-stone-500">{record.amendments.length} amendments</span>
        </div>
          {record.amendments.length ? <ol className="mt-3 space-y-3">{record.amendments.map((amendment) => <li key={amendment.id} className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
            <div className="flex flex-wrap justify-between gap-2"><p className="text-sm font-semibold">Day {amendment.dayNumber} · {personName(amendment.authorPersonId)}</p><span className="text-xs text-stone-500">{amendment.id}</span></div>
            <p className="mt-1 text-xs text-stone-700"><strong>Reason:</strong> {amendment.reason}</p>
            {amendment.note && <p className="mt-2 text-sm text-stone-700">{amendment.note}</p>}
            {amendment.sourcesAdded.length > 0 && <div className="mt-2"><p className="text-xs font-semibold">Sources added</p><ul className="mt-1 list-inside list-disc text-xs text-stone-700">{amendment.sourcesAdded.map((source) => <li key={source.id}>{sourceLabel(source)}</li>)}</ul></div>}
            {amendment.assertionsAdded.length > 0 && <div className="mt-2"><p className="text-xs font-semibold">Additional assertions</p><ul className="mt-1 space-y-1 text-sm text-stone-700">{amendment.assertionsAdded.map((assertion) => <li key={assertion.id}>{assertion.text} <span className="text-xs text-stone-500">({classificationLabel[assertion.classification]})</span></li>)}</ul></div>}
            {amendment.uncertaintyLimitsAdded.length > 0 && <div className="mt-2"><p className="text-xs font-semibold">Additional uncertainty limits</p><ul className="mt-1 list-inside list-disc text-xs text-stone-700">{amendment.uncertaintyLimitsAdded.map((limit, index) => <li key={index}>{limit}</li>)}</ul></div>}
          </li>)}</ol> : <p className="mt-2 text-xs text-stone-500">No amendments have been appended. Original assertions remain the complete recorded text.</p>}
        </section>
      </article>)}
      {records.length === 0 && <p className="rounded-lg border border-stone-300 bg-white p-4 text-sm text-stone-500">No records have been archived yet.</p>}
    </section>

    <section className="space-y-3">
      <div><h2 className="font-serif text-2xl font-semibold">Knowledge holdings</h2><p className="text-sm text-stone-600">Who knows what, when they learned it, and on what basis.</p></div>
      {knowledge.length ? <div className="space-y-2">{knowledge.map((entry) => {
        const holder = entry.holder.kind === 'person' ? personName(entry.holder.id) : institutionName(entry.holder.id);
        const subject = entry.subject.kind === 'event'
          ? state.world.events[entry.subject.id]?.summary ?? entry.subject.id
          : state.records.entries[entry.subject.id]?.title ?? entry.subject.id;
        return <article key={entry.id} className="rounded-lg border border-stone-300 bg-white p-4">
          <p className="text-sm font-semibold">{holder} <span className="font-normal text-stone-500">knows</span> {subject}</p>
          <p className="mt-1 text-xs text-stone-600">Holder type: {entry.holder.kind} · Subject type: {entry.subject.kind} · Learned Day {entry.learnedDay}</p>
          <p className="mt-1 text-xs text-stone-700">Basis: {basisLabel[entry.basis] ?? entry.basis}</p>
          {entry.sourcePersonId && <p className="mt-1 text-xs text-stone-600">Source person: {personName(entry.sourcePersonId)}</p>}
        </article>;
      })}</div> : <p className="rounded-lg border border-stone-300 bg-white p-4 text-sm text-stone-500">No knowledge holdings are recorded.</p>}
    </section>

    <section className="space-y-3">
      <div><h2 className="font-serif text-2xl font-semibold">Durable journal notices</h2><p className="text-sm text-stone-600">Persistent notices are kept separately from the underlying records and knowledge entries.</p></div>
      {notices.length ? <div className="space-y-2">{notices.map((notice) => <article key={notice.id} className={`flex flex-wrap items-start justify-between gap-3 rounded-lg border p-4 ${notice.read ? 'border-stone-200 bg-stone-50' : 'border-amber-300 bg-amber-50'}`}>
        <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-semibold uppercase tracking-wide text-stone-500">{notice.category}</span><span className="text-xs text-stone-500">Day {notice.dayNumber}</span>{!notice.read && <span className="rounded bg-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-900">Unread</span>}</div>
          <p className="mt-2 text-sm text-stone-800">{notice.message}</p>
        </div>
        {!notice.read && <button onClick={() => dispatch({ type: 'MARK_NOTICE_READ', noticeId: notice.id })} className="rounded-md border border-stone-300 bg-white px-3 py-2 text-xs font-semibold">Mark read</button>}
      </article>)}</div> : <p className="rounded-lg border border-stone-300 bg-white p-4 text-sm text-stone-500">No durable notices have been recorded.</p>}
    </section>
  </div>;
}
