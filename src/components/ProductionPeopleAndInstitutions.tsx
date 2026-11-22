import React from 'react';
import { useGame } from '../state/GameProvider';
import type { PersonRelationship } from '../state/types';

function RelationshipCard({ fromName, toName, relationship }: {
  fromName: string; toName: string; relationship: PersonRelationship;
}) {
  return <article className="rounded-lg border border-stone-200 bg-stone-50 p-4">
    <h3 className="font-semibold text-stone-900">{fromName} → {toName}</h3>
    <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {Object.entries(relationship.dimensions).map(([dimension, score]) => <div key={dimension}>
        <dt className="text-xs capitalize text-stone-500">{dimension}</dt><dd className="font-mono text-lg">{score}<span className="text-xs text-stone-400">/100</span></dd>
      </div>)}
    </dl>
    <div className="mt-3 border-t border-stone-200 pt-3">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-stone-500">History from this perspective</h4>
      {relationship.history.length === 0 ? <p className="mt-1 text-xs text-stone-500">No relationship history recorded.</p> :
        <ol className="mt-2 space-y-2">{relationship.history.map((entry) => <li key={entry.id} className="text-sm text-stone-700">
          <span className="mr-2 font-mono text-xs text-stone-500">Day {entry.dayNumber}</span>{entry.summary}
          {entry.eventId && <span className="ml-1 text-xs text-stone-500">(Event: {entry.eventId})</span>}
        </li>)}</ol>}
    </div>
  </article>;
}

export function ProductionPeopleAndInstitutions() {
  const { state } = useGame();
  const people = Object.values(state.world.people);
  const institutions = Object.values(state.world.institutions);
  const relationshipRows = people.flatMap((from) => Object.entries(state.world.relationships[from.id] ?? {})
    .map(([toId, relationship]) => ({ from, to: state.world.people[toId], relationship }))
    .filter((entry) => !!entry.to));

  return <main className="mx-auto max-w-6xl space-y-6">
    <header>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">World and social network</p>
      <h1 className="font-serif text-3xl font-semibold">People & Institutions</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">Personal relationships are directional. Professional reputation and standing within each institution are separate records, as are an institution’s authority and the scopes of its appointed office-holders.</p>
    </header>

    <section className="space-y-4">
      <h2 className="font-serif text-2xl font-semibold">People</h2>
      {people.map((person) => {
        const scribal = person.scribal;
        const appointments = Object.values(state.world.appointments).filter((item) => item.personId === person.id);
        return <article key={person.id} className="rounded-xl border border-stone-300 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div><h3 className="font-serif text-xl font-semibold">{person.name}</h3>
              <p className="text-xs text-stone-500">{person.alive ? 'Living' : 'Deceased'} · {person.ageYears === undefined ? 'Age unknown' : `${person.ageYears} years`}</p>
            </div>
            {person.id === state.player.currentCharacterId && <span className="rounded bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900">Current character</span>}
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <section><h4 className="text-sm font-semibold">Affiliations</h4>
              {person.affiliations.length ? <ul className="mt-2 list-inside list-disc text-sm text-stone-700">{person.affiliations.map((id) => <li key={id}>{state.world.institutions[id]?.name ?? id}</li>)}</ul> : <p className="mt-1 text-xs text-stone-500">No affiliations recorded.</p>}
            </section>
            <section><h4 className="text-sm font-semibold">Professional reputation</h4>
              {scribal ? <dl className="mt-2 grid grid-cols-2 gap-2">{Object.entries(scribal.professionalReputation).map(([key, value]) =>
                <div key={key} className="rounded bg-stone-50 p-2"><dt className="text-xs capitalize text-stone-500">{key}</dt><dd className="font-mono">{value}/100</dd></div>)}</dl>
                : <p className="mt-1 text-xs text-stone-500">No scribal reputation profile.</p>}
            </section>
          </div>
          {scribal && <section className="mt-4"><h4 className="text-sm font-semibold">Institutional standing</h4>
            {Object.keys(scribal.institutionalStanding).length ? <dl className="mt-2 grid gap-2 sm:grid-cols-2">{Object.entries(scribal.institutionalStanding).map(([id, value]) =>
              <div key={id} className="rounded bg-stone-50 p-3"><dt className="text-xs text-stone-500">{state.world.institutions[id]?.name ?? id}</dt><dd className="font-mono">{value}/100</dd></div>)}</dl>
              : <p className="mt-1 text-xs text-stone-500">No institution-specific standing is recorded.</p>}
          </section>}
          <section className="mt-4"><h4 className="text-sm font-semibold">Appointments and office scopes</h4>
            {appointments.length ? <div className="mt-2 space-y-2">{appointments.map((appointment) => <div key={appointment.id} className="rounded bg-stone-50 p-3">
              <p className="text-sm font-semibold">{appointment.title} · {state.world.institutions[appointment.institutionId]?.name ?? appointment.institutionId}</p>
              <p className="mt-1 text-xs text-stone-500">From Day {appointment.startDay}{appointment.endDay === undefined ? ' · Current' : ` to Day ${appointment.endDay} · Ended`}</p>
              <p className="mt-2 text-xs text-stone-700"><strong>Authority scope:</strong> {appointment.authorityScope.join('; ')}</p>
              <p className="mt-1 text-xs text-stone-700"><strong>Responsibilities:</strong> {appointment.responsibilities.join('; ') || 'Not specified'}</p>
            </div>)}</div> : <p className="mt-1 text-xs text-stone-500">No appointments recorded.</p>}
          </section>
        </article>;
      })}
    </section>

    <section className="space-y-3">
      <div><h2 className="font-serif text-2xl font-semibold">Directional relationships</h2>
        <p className="mt-1 text-sm text-stone-600">Each arrow is one person’s perspective. A reverse relationship appears as a separate entry only when the world records it.</p></div>
      {relationshipRows.map(({ from, to, relationship }) => <RelationshipCard key={`${from.id}-${to!.id}`} fromName={from.name} toName={to!.name} relationship={relationship} />)}
      {relationshipRows.length === 0 && <p className="rounded-lg border border-stone-300 bg-white p-4 text-sm text-stone-500">No personal relationships are recorded.</p>}
    </section>

    <section className="space-y-3">
      <h2 className="font-serif text-2xl font-semibold">Institutions</h2>
      {institutions.map((institution) => {
        const appointments = Object.values(state.world.appointments).filter((item) => item.institutionId === institution.id);
        return <article key={institution.id} className="rounded-xl border border-stone-300 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-2"><h3 className="font-serif text-xl font-semibold">{institution.name}</h3><span className="font-mono text-sm">General standing {institution.standing}/100</span></div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <section><h4 className="text-sm font-semibold">Responsibilities</h4><ul className="mt-1 list-inside list-disc text-sm text-stone-700">{institution.responsibilities.map((item, index) => <li key={index}>{item}</li>)}</ul></section>
            <section><h4 className="text-sm font-semibold">Institutional authority</h4><ul className="mt-1 list-inside list-disc text-sm text-stone-700">{institution.authority.map((item, index) => <li key={index}>{item}</li>)}</ul></section>
          </div>
          <section className="mt-4"><h4 className="text-sm font-semibold">Active matters</h4>
            {institution.activeMatters.length ? <ul className="mt-1 list-inside list-disc text-sm text-stone-700">{institution.activeMatters.map((item, index) => <li key={index}>{item}</li>)}</ul> : <p className="mt-1 text-xs text-stone-500">No active matters recorded.</p>}
          </section>
          <section className="mt-4"><h4 className="text-sm font-semibold">Appointments and delegated office scopes</h4>
            {appointments.length ? <div className="mt-2 space-y-2">{appointments.map((appointment) => <div key={appointment.id} className="rounded bg-stone-50 p-3">
              <p className="text-sm font-semibold">{appointment.title} · {state.world.people[appointment.personId]?.name ?? appointment.personId}</p>
              <p className="mt-1 text-xs text-stone-700"><strong>Authority:</strong> {appointment.authorityScope.join('; ')}</p>
              <p className="mt-1 text-xs text-stone-700"><strong>Responsibilities:</strong> {appointment.responsibilities.join('; ')}</p>
              <p className="mt-1 text-xs text-stone-500">Day {appointment.startDay}{appointment.endDay === undefined ? ' onward' : ` through Day ${appointment.endDay}`}</p>
            </div>)}</div> : <p className="mt-1 text-xs text-stone-500">No appointments recorded.</p>}
          </section>
        </article>;
      })}
    </section>
  </main>;
}
