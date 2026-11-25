import React, { useState } from 'react';
import { getInitializedScribal } from '../state/scribalState';
import { useGame } from '../state/GameProvider';
import type { InstitutionId, PersonId, RecordId } from '../state/ids';
import type { Appointment, Institution, InstitutionalMatter, Person, PersonRelationship, RecordEntry, WorldEvent } from '../state/types';
import { PersonHistoryPanel } from './PersonHistoryPanel';
import { ASSIGNMENT_ACTIVITY_CATALOG } from '../content/assignments/northBayRoofInspection';
import { deriveRelationshipFamiliarityStage, relationshipFamiliarityEpisodesFor, type RelationshipFamiliarityEpisodeMap } from '../state/relationshipFamiliarity';

export type PeopleInstitutionSection = 'people' | 'institutions';
type PersonLifeFilter = 'all' | 'living' | 'deceased';

function matchesQuery(values: Array<string | undefined>, query: string): boolean {
  const normalized = query.trim().toLocaleLowerCase();
  return !normalized || values.some((value) => value?.toLocaleLowerCase().includes(normalized));
}

function humanizeContextKey(value: string): string {
  const activity = ASSIGNMENT_ACTIVITY_CATALOG[value];
  if (activity) return activity.title;
  return value.replace(/^activity-/, '').replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toLocaleUpperCase());
}

function familiaritySourceLabel(source: { kind: 'event' | 'record'; id: string },
  events: Readonly<Record<string, WorldEvent>>, records: Readonly<Record<string, RecordEntry>>): string {
  return source.kind === 'event'
    ? events[source.id]?.summary ?? 'Related event recorded'
    : records[source.id]?.title ?? 'Related record recorded';
}

function RelationshipCard({ fromName, toName, relationship, familiarityStage, familiarityEpisodes, events, records }: {
  fromName: string; toName: string; relationship: PersonRelationship | null;
  familiarityStage: 'recognized' | 'acquainted' | 'familiar' | null;
  familiarityEpisodes: ReturnType<typeof relationshipFamiliarityEpisodesFor>;
  events: Readonly<Record<string, WorldEvent>>;
  records: Readonly<Record<string, RecordEntry>>;
}) {
  return <details className="rounded-lg border border-stone-200 bg-stone-50 p-3">
    <summary className="cursor-pointer rounded text-sm font-semibold text-stone-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-700">
      {fromName} → {toName}
      <span className="ml-2 text-xs font-normal text-stone-500">{relationship?.history.length ?? 0} {relationship?.history.length === 1 ? 'history entry' : 'history entries'}</span>
    </summary>
    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {relationship && Object.entries(relationship.dimensions).map(([dimension, score]) => <div key={dimension}>
        <dt className="text-xs capitalize text-stone-500">{dimension}</dt>
        <dd className="font-mono text-base">{score}<span className="text-xs text-stone-400">/100</span></dd>
      </div>)}
      {!relationship && <p className="col-span-full text-xs text-stone-600">No sentiment scores are recorded in this direction.</p>}
      {familiarityStage && <div>
        <dt className="text-xs text-stone-500">Personal familiarity</dt>
        <dd className="text-sm font-semibold capitalize">{familiarityStage}</dd>
      </div>}
    </div>
    {familiarityEpisodes.length > 0 && <details className="mt-3 border-t border-stone-200 pt-3">
      <summary className="cursor-pointer text-xs font-semibold text-stone-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-700">Familiarity evidence ({familiarityEpisodes.length} qualifying {familiarityEpisodes.length === 1 ? 'episode' : 'episodes'})</summary>
      <ol className="mt-2 space-y-2">{familiarityEpisodes.map((episode) => <li key={episode.id} className="text-xs text-stone-700">
        <p className="font-medium">Day {episode.dayNumber} · {episode.stageContribution} · {episode.acquisitionMode.replace(/_/g, ' ')}</p>
        <p>{humanizeContextKey(episode.contextId)} · {episode.interactionKind.replace(/_/g, ' ')}</p>
        <p className="text-stone-600">Source: {episode.provenance.map((source) => familiaritySourceLabel(source, events, records)).join('; ')}</p>
      </li>)}</ol>
    </details>}
    {relationship && relationship.history.length > 0 && <details className="mt-3 border-t border-stone-200 pt-3">
      <summary className="cursor-pointer text-xs font-semibold text-stone-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-700">
        History from this perspective ({relationship.history.length})
      </summary>
      {relationship.history.length === 0
        ? <p className="mt-2 text-xs text-stone-500">No relationship history recorded.</p>
        : <ol className="mt-2 space-y-2">{relationship.history.map((entry) => <li key={entry.id} className="text-sm text-stone-700">
          <span className="mr-2 font-mono text-xs text-stone-500">Day {entry.dayNumber}</span>{entry.summary}
          {entry.eventId && <span className="ml-1 text-xs text-stone-500">· {events[entry.eventId]?.summary ?? 'Related event recorded'}</span>}
        </li>)}</ol>}
    </details>}
  </details>;
}

function PersonIndexRow({ person, context, selected, onSelect }: {
  person: Person; context?: string; selected: boolean; onSelect: () => void;
}) {
  return <button type="button" onClick={onSelect} aria-pressed={selected}
    className={`w-full rounded-lg border px-3 py-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700 ${selected ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white text-stone-900 hover:bg-stone-50'}`}>
    <span className="flex items-center justify-between gap-2">
      {selected ? <span className="font-semibold">Viewing</span> : <span className="font-semibold">{person.name}</span>}
      {selected && <span className="text-[10px] font-semibold uppercase tracking-wide">Selected</span>}
    </span>
    <span className={`mt-1 block text-xs ${selected ? 'text-stone-200' : 'text-stone-500'}`}>
      {person.alive ? 'Living' : 'Deceased'}{person.lifeStage ? ` · ${person.lifeStage.replace(/_/g, ' ')}` : ''}
    </span>
    <span className={`mt-1 block line-clamp-2 text-xs ${selected ? 'text-stone-200' : 'text-stone-600'}`}>{context}</span>
  </button>;
}

function PersonDetail({ person, people, institutions, relationships, appointments, familiarityEpisodes, events, records, isCurrentCharacter }: {
  person: Person;
  people: Readonly<Record<string, Person>>;
  institutions: Readonly<Record<InstitutionId, Institution>>;
  events: Readonly<Record<string, WorldEvent>>;
  records: Readonly<Record<string, RecordEntry>>;
  relationships: Array<{ from: Person; to: Person; relationship: PersonRelationship | null }>;
  appointments: Appointment[];
  familiarityEpisodes: Readonly<RelationshipFamiliarityEpisodeMap>;
  isCurrentCharacter: boolean;
}) {
  const scribal = getInitializedScribal(person);
  const circumstances = (person.circumstances ?? []).filter((item) => item.status === 'active' && item.visibility === 'public');
  const commitments = (person.commitments ?? []).filter((item) => item.status === 'active' && item.visibility === 'public');
  const historyCount = person.lifeEvents?.length ?? 0;
  const familiarityCount = person.familiarities?.length ?? 0;

  return <article aria-labelledby="selected-person-heading" className="rounded-xl border border-stone-300 bg-white p-4 sm:p-5">
    <header>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 id="selected-person-heading" aria-live="polite" className="font-serif text-2xl font-semibold">{person.name}</h3>
          <p className="mt-1 text-xs text-stone-500">
            {person.alive ? 'Living' : 'Deceased'} · {person.ageYears === undefined ? 'Age not recorded' : `${person.ageYears} years`}
            {person.lifeStage ? ` · ${person.lifeStage.replace(/_/g, ' ')}` : ''}
          </p>
          {person.socialIdentity?.summary && <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-700">{person.socialIdentity.summary}</p>}
        </div>
        {isCurrentCharacter && <span className="rounded bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900">Current character</span>}
      </div>
    </header>

    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <details className="rounded-lg border border-stone-200 bg-stone-50 p-3">
        <summary className="cursor-pointer text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-700">
          Affiliations ({person.affiliations.length})
        </summary>
        {person.affiliations.length
          ? <ul className="mt-2 list-inside list-disc text-sm text-stone-700">{person.affiliations.map((id) => <li key={id}>{institutions[id as InstitutionId]?.name ?? id}</li>)}</ul>
          : <p className="mt-2 text-xs text-stone-500">None recorded.</p>}
      </details>

      <details className="rounded-lg border border-stone-200 bg-stone-50 p-3">
        <summary className="cursor-pointer text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-700">
          Professional reputation {scribal ? '' : '(no record)'}
        </summary>
        {scribal
          ? <dl className="mt-2 grid grid-cols-2 gap-2">{Object.entries(scribal.professionalReputation).map(([key, value]) =>
            <div key={key} className="rounded bg-white p-2"><dt className="text-xs capitalize text-stone-500">{key}</dt><dd className="font-mono">{value}/100</dd></div>)}</dl>
          : <p className="mt-2 text-xs text-stone-500">No professional reputation record is available for this person.</p>}
      </details>

      <details className="rounded-lg border border-stone-200 bg-stone-50 p-3 sm:col-span-2">
        <summary className="cursor-pointer text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-700">
          Institutional standing ({scribal ? Object.keys(scribal.institutionalStanding).length : 0})
        </summary>
        {scribal && Object.keys(scribal.institutionalStanding).length
          ? <dl className="mt-2 grid gap-2 sm:grid-cols-2">{Object.entries(scribal.institutionalStanding).map(([id, value]) =>
            <div key={id} className="rounded bg-white p-3"><dt className="text-xs text-stone-500">{institutions[id as InstitutionId]?.name ?? id}</dt><dd className="font-mono">{value}/100</dd></div>)}</dl>
          : <p className="mt-2 text-xs text-stone-500">No institutional standing entries are recorded.</p>}
      </details>
    </div>

    <details className="mt-3 rounded-lg border border-stone-200 bg-white p-3">
      <summary className="cursor-pointer text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-700">
        Personal history ({historyCount} {historyCount === 1 ? 'life event' : 'life events'} · {familiarityCount} {familiarityCount === 1 ? 'domain familiarity entry' : 'domain familiarity entries'})
      </summary>
      <PersonHistoryPanel person={person} people={people} compact />
    </details>

    {(circumstances.length > 0 || commitments.length > 0) && <div className="mt-3 grid gap-3 sm:grid-cols-2">
      {circumstances.length > 0 && <details className="rounded-lg border border-stone-200 bg-stone-50 p-3">
        <summary className="cursor-pointer text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-700">Current circumstances ({circumstances.length})</summary>
        <ul className="mt-2 space-y-2">{circumstances.map((item) => <li key={item.id} className="rounded bg-white p-3 text-sm text-stone-700">{item.summary}</li>)}</ul>
      </details>}
      {commitments.length > 0 && <details className="rounded-lg border border-stone-200 bg-stone-50 p-3">
        <summary className="cursor-pointer text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-700">Declared responsibilities and commitments ({commitments.length})</summary>
        <ul className="mt-2 space-y-2">{commitments.map((item) => <li key={item.id} className="rounded bg-white p-3 text-sm text-stone-700">{item.summary}</li>)}</ul>
      </details>}
    </div>}

    <details className="mt-3 rounded-lg border border-stone-200 bg-stone-50 p-3">
      <summary className="cursor-pointer text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-700">
        Appointments and office scopes ({appointments.length})
      </summary>
      {appointments.length
        ? <div className="mt-2 space-y-2">{appointments.map((appointment) => <article key={appointment.id} className="rounded bg-white p-3">
          <p className="text-sm font-semibold">{appointment.title} · {institutions[appointment.institutionId]?.name ?? appointment.institutionId}</p>
          <p className="mt-1 text-xs text-stone-500">From Day {appointment.startDay}{appointment.endDay === undefined ? ' · Current' : ` to Day ${appointment.endDay} · Ended`}</p>
          <p className="mt-2 text-xs text-stone-700"><strong>Authority scope:</strong> {appointment.authorityScope.join('; ')}</p>
          <p className="mt-1 text-xs text-stone-700"><strong>Responsibilities:</strong> {appointment.responsibilities.join('; ') || 'Not specified'}</p>
        </article>)}</div>
        : <p className="mt-2 text-xs text-stone-500">No appointments are recorded.</p>}
    </details>

    <section className="mt-4 border-t border-stone-200 pt-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="text-sm font-semibold">Directional relationships</h4>
        <span className="text-xs text-stone-500">{relationships.length} recorded edges</span>
      </div>
      <p className="mt-1 text-xs text-stone-500">Each arrow is one person's perspective. A reverse relationship appears only when separately recorded.</p>
      {relationships.length
        ? <div className="mt-2 space-y-2">{relationships.map(({ from, to, relationship }) =>
          <RelationshipCard key={`${from.id}-${to.id}`} fromName={from.name} toName={to.name} relationship={relationship}
              familiarityStage={deriveRelationshipFamiliarityStage(familiarityEpisodes, from.id, to.id)}
              familiarityEpisodes={relationshipFamiliarityEpisodesFor(familiarityEpisodes, from.id, to.id)} events={events} records={records} />)}</div>
        : <p className="mt-2 text-xs text-stone-500">No directional relationship entries are recorded for this person.</p>}
    </section>
  </article>;
}

function MatterSources({ matter, records, people, events, appointments }: {
  matter: InstitutionalMatter;
  records: Readonly<Record<string, RecordEntry>>;
  people: Readonly<Record<string, Person>>;
  events: Readonly<Record<string, WorldEvent>>;
  appointments: Appointment[];
}) {
  const responseEvents = Object.values(events)
    .filter((event) => event.institutionalResponse?.matterId === matter.id)
    .sort((a, b) => a.dayNumber - b.dayNumber || a.id.localeCompare(b.id));
  const provenance = matter.provenance ?? [];
  return <>
    {!provenance.length && matter.sourceRecordId && <p className="mt-2 text-xs text-stone-600">Source record: {records[matter.sourceRecordId]?.title ?? matter.sourceRecordId}</p>}
    {!provenance.length && !matter.sourceRecordId && <p className="mt-2 text-xs text-stone-500">No linked provenance is recorded for this matter.</p>}
    {provenance.length > 0 && <details className="mt-3 border-t border-stone-200 pt-2">
    <summary className="cursor-pointer text-xs font-semibold text-stone-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-700">
      Source trail ({provenance.length})
    </summary>
    <ul className="mt-2 space-y-1 text-xs text-stone-700">{provenance.map((source) => {
      const sourceId = source.sourceId;
      const label = source.kind === 'record_copy' ? (sourceId ? records[sourceId]?.title ?? sourceId : 'Record not identified')
        : source.kind === 'event' ? (sourceId ? events[sourceId]?.summary ?? sourceId : 'Event not identified')
          : source.kind === 'testimony' ? (sourceId ? people[sourceId]?.name ?? sourceId : 'Person not identified')
            : `${source.kind.replace(/_/g, ' ')}${sourceId ? ` · ${sourceId}` : ''}`;
      return <li key={source.id}><span className="font-medium">{label}</span> · {source.description}</li>;
    })}</ul>
  </details>}
    {responseEvents.length > 0 && <details className="mt-3 border-t border-stone-200 pt-2">
      <summary className="cursor-pointer text-xs font-semibold text-stone-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-700">Institutional response stages ({responseEvents.length})</summary>
      <ol className="mt-2 space-y-2">{responseEvents.map((event) => {
        const response = event.institutionalResponse!;
        const actor = people[response.actorPersonId]?.name ?? response.actorPersonId;
        const appointment = appointments.find((item) => item.id === response.appointmentId);
        const recordTitle = records[response.recordId]?.title ?? response.recordId;
        return <li key={event.id} className="rounded bg-stone-50 p-2 text-xs text-stone-700">
          <p className="font-semibold">Day {event.dayNumber} · {response.stage.replace(/_/g, ' ')} · {actor}{appointment ? ` · ${appointment.title}` : ''}</p>
          <p className="mt-1">{event.summary}</p>
          <p className="mt-1">Decision: {response.decision.replace(/_/g, ' ')} · Record: {recordTitle}</p>
          {response.scope && <p className="mt-1">Scope: {response.scope}</p>}
          {response.authorizedAction && <p className="mt-1">Authorized action: {response.authorizedAction.replace(/_/g, ' ')}</p>}
          {response.commitmentId && <p className="mt-1">Commitment: {response.commitmentId}</p>}
          {response.precedingEventId && <p className="mt-1">Preceding event: {events[response.precedingEventId]?.summary ?? response.precedingEventId}</p>}
          {response.assigneePersonId && <p className="mt-1">Assignee: {people[response.assigneePersonId]?.name ?? response.assigneePersonId}</p>}
          {response.execution && <p className="mt-1">Execution: {response.execution.workPerformed} · Labor: {response.execution.laborBasis} · Materials: {response.execution.materialsBasis} · Result: {response.execution.result}</p>}
          {response.verification && <p className="mt-1">Verification: {response.verification.outcome} · {response.verification.rationale} · Execution event: {events[response.verification.executionEventId]?.summary ?? response.verification.executionEventId}</p>}
          {response.resolution && <p className="mt-1">Resolution: {response.resolution.disposition} · {response.resolution.rationale} · Verification event: {events[response.resolution.verificationEventId]?.summary ?? response.resolution.verificationEventId}</p>}
        </li>;
      })}</ol>
    </details>}
  </>;
}

function InstitutionDetail({ institution, people, matters, records, events, appointments }: {
  institution: Institution;
  people: Readonly<Record<string, Person>>;
  matters: InstitutionalMatter[];
  records: Readonly<Record<string, RecordEntry>>;
  events: Readonly<Record<string, WorldEvent>>;
  appointments: Appointment[];
}) {
  const currentMatters = matters.filter((matter) => matter.status === 'active');
  const historicalMatters = matters.filter((matter) => matter.status !== 'active');
  return <article aria-labelledby="selected-institution-heading" className="rounded-xl border border-stone-300 bg-white p-4 sm:p-5">
    <header className="flex flex-wrap items-start justify-between gap-2">
      <div><h3 id="selected-institution-heading" aria-live="polite" className="font-serif text-2xl font-semibold">{institution.name}</h3>
        <p className="mt-1 text-xs text-stone-500">General standing <span className="font-mono">{institution.standing}/100</span></p></div>
    </header>

    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <section className="rounded-lg bg-stone-50 p-3"><h4 className="text-sm font-semibold">Responsibilities</h4>
        {institution.responsibilities.length ? <ul className="mt-2 list-inside list-disc text-sm text-stone-700">{institution.responsibilities.map((item, index) => <li key={index}>{item}</li>)}</ul> : <p className="mt-2 text-xs text-stone-500">No responsibilities are recorded.</p>}
      </section>
      <section className="rounded-lg bg-stone-50 p-3"><h4 className="text-sm font-semibold">Institutional authority</h4>
        {institution.authority.length ? <ul className="mt-2 list-inside list-disc text-sm text-stone-700">{institution.authority.map((item, index) => <li key={index}>{item}</li>)}</ul> : <p className="mt-2 text-xs text-stone-500">No authority scopes are recorded.</p>}
      </section>
    </div>

    <section className="mt-4">
      <h4 className="text-sm font-semibold">Current matters ({currentMatters.length})</h4>
      {currentMatters.length
        ? <div className="mt-2 space-y-2">{currentMatters.map((matter) => <article key={matter.id} className="rounded-lg border border-amber-200 bg-amber-50/40 p-3">
          <p className="text-sm font-medium text-stone-800">{matter.summary}</p>
          <p className="mt-1 text-xs text-stone-500">Active · opened Day {matter.createdDay}{matter.involvedPersonIds?.length ? ` · ${matter.involvedPersonIds.map((id) => people[id]?.name ?? id).join(', ')}` : ''}</p>
          <MatterSources matter={matter} records={records} people={people} events={events} appointments={appointments} />
        </article>)}</div>
        : <p className="mt-2 text-xs text-stone-500">No active matters are recorded for this institution.</p>}
    </section>

    <details className="mt-4 border-t border-stone-200 pt-3">
      <summary className="cursor-pointer text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-700">
        Historical matters ({historicalMatters.length})
      </summary>
      {historicalMatters.length
        ? <div className="mt-2 space-y-2">{historicalMatters.map((matter) => <article key={matter.id} className="rounded-lg bg-stone-50 p-3">
          <p className="text-sm text-stone-800">{matter.summary}</p>
          <p className="mt-1 text-xs capitalize text-stone-500">{matter.status.replace(/_/g, ' ')} · opened Day {matter.createdDay}{matter.developedDay ? ` · developed Day ${matter.developedDay}` : ''}</p>
          <MatterSources matter={matter} records={records} people={people} events={events} appointments={appointments} />
        </article>)}</div>
        : <p className="mt-2 text-xs text-stone-500">No developed or resolved matters are recorded.</p>}
    </details>

    <details className="mt-4 border-t border-stone-200 pt-3">
      <summary className="cursor-pointer text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-700">
        Appointments and delegated office scopes ({appointments.length})
      </summary>
      {appointments.length
        ? <div className="mt-2 space-y-2">{appointments.map((appointment) => <article key={appointment.id} className="rounded-lg bg-stone-50 p-3">
          <p className="text-sm font-semibold">{appointment.title} · {people[appointment.personId]?.name ?? appointment.personId}</p>
          <p className="mt-1 text-xs text-stone-700"><strong>Authority:</strong> {appointment.authorityScope.join('; ')}</p>
          <p className="mt-1 text-xs text-stone-700"><strong>Responsibilities:</strong> {appointment.responsibilities.join('; ')}</p>
          <p className="mt-1 text-xs text-stone-500">Day {appointment.startDay}{appointment.endDay === undefined ? ' onward' : ` through Day ${appointment.endDay}`}</p>
        </article>)}</div>
        : <p className="mt-2 text-xs text-stone-500">No appointments are recorded.</p>}
    </details>

    <details className="mt-4 border-t border-stone-200 pt-3">
      <summary className="cursor-pointer text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-700">
        Institutional records ({Object.values(records).length})
      </summary>
      {Object.values(records).length
        ? <div className="mt-2 space-y-2">{Object.values(records).sort((a, b) => b.createdDay - a.createdDay).map((record) => <details key={record.id} className="rounded-lg bg-stone-50 p-3">
          <summary className="cursor-pointer text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-700">
            {record.title} · Day {record.createdDay} · {record.assertions.length} assertions
          </summary>
          <p className="mt-2 text-xs text-stone-500">Author: {people[record.authorPersonId]?.name ?? record.authorPersonId}</p>
          <h5 className="mt-2 text-xs font-semibold">Sources</h5>
          {record.sources.length
            ? <ul className="mt-1 space-y-1 text-xs text-stone-700">{record.sources.map((source) => <li key={source.id}>{source.kind.replace(/_/g, ' ')} · {source.description}</li>)}</ul>
            : <p className="mt-1 text-xs text-stone-500">No sources recorded.</p>}
          <h5 className="mt-2 text-xs font-semibold">Original assertions</h5>
          {record.assertions.length
            ? <ul className="mt-1 space-y-1 text-sm text-stone-700">{record.assertions.map((assertion) => <li key={assertion.id}>{assertion.text} <span className="text-xs text-stone-500">({assertion.classification})</span></li>)}</ul>
            : <p className="mt-1 text-xs text-stone-500">No assertions recorded.</p>}
          <h5 className="mt-2 text-xs font-semibold">Original uncertainty limits</h5>
          {record.uncertaintyLimits.length
            ? <ul className="mt-1 list-inside list-disc text-xs text-stone-700">{record.uncertaintyLimits.map((limit, index) => <li key={index}>{limit}</li>)}</ul>
            : <p className="mt-1 text-xs text-stone-500">No explicit limits recorded in the original entry.</p>}
          <details className="mt-3 border-t border-stone-200 pt-2">
            <summary className="cursor-pointer text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-700">Append-only amendments ({record.amendments.length})</summary>
            {record.amendments.length
              ? <ol className="mt-2 space-y-2">{record.amendments.map((amendment) => <li key={amendment.id} className="rounded bg-white p-2 text-xs text-stone-700">
                <p className="font-semibold">Day {amendment.dayNumber} · {people[amendment.authorPersonId]?.name ?? amendment.authorPersonId}</p>
                <p className="mt-1"><strong>Reason:</strong> {amendment.reason}</p>
                {amendment.note && <p className="mt-1">{amendment.note}</p>}
                {amendment.sourcesAdded.length > 0 && <p className="mt-1">Sources added: {amendment.sourcesAdded.map((source) => source.description).join('; ')}</p>}
                {amendment.assertionsAdded.length > 0 && <p className="mt-1">Assertions added: {amendment.assertionsAdded.map((assertion) => assertion.text).join('; ')}</p>}
                {amendment.uncertaintyLimitsAdded.length > 0 && <p className="mt-1">Limits added: {amendment.uncertaintyLimitsAdded.join('; ')}</p>}
              </li>)}</ol>
              : <p className="mt-2 text-xs text-stone-500">No amendments have been appended.</p>}
          </details>
        </details>)}</div>
        : <p className="mt-2 text-xs text-stone-500">No institutional records are linked.</p>}
    </details>
  </article>;
}

export function ProductionPeopleAndInstitutions({ initialSection = 'people', initialPersonId }: { initialSection?: PeopleInstitutionSection; initialPersonId?: PersonId }) {
  const { state } = useGame();
  const people = Object.values(state.world.people).sort((a, b) => a.name.localeCompare(b.name));
  const institutions = Object.values(state.world.institutions).sort((a, b) => a.name.localeCompare(b.name));
  const [section, setSection] = useState<PeopleInstitutionSection>(initialSection);
  const [personQuery, setPersonQuery] = useState('');
  const [personLifeFilter, setPersonLifeFilter] = useState<PersonLifeFilter>('all');
  const [institutionQuery, setInstitutionQuery] = useState('');
  const [selectedPersonId, setSelectedPersonId] = useState<PersonId>(initialPersonId ?? state.player.currentCharacterId);
  const initialInstitution = institutions.find((item) => Object.values(state.world.matters).some((matter) => matter.institutionId === item.id && matter.status === 'active')) ?? institutions[0];
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<InstitutionId | null>(initialInstitution?.id ?? null);

  const matchingPeople = people.filter((person) => {
    if (personLifeFilter === 'living' && !person.alive) return false;
    if (personLifeFilter === 'deceased' && person.alive) return false;
    const appointments = Object.values(state.world.appointments).filter((item) => item.personId === person.id);
    const affiliationNames = person.affiliations.map((id) => state.world.institutions[id as InstitutionId]?.name);
    return matchesQuery([
      person.name, person.socialIdentity?.occupation, person.socialIdentity?.summary, person.lifeStage?.replace(/_/g, ' '),
      ...affiliationNames, ...appointments.map((item) => item.title),
    ], personQuery);
  });
  const selectedPerson = matchingPeople.find((person) => person.id === selectedPersonId)
    ?? matchingPeople.find((person) => person.id === state.player.currentCharacterId)
    ?? matchingPeople[0];
  const relationshipRowMap = new Map<string, { from: Person; to: Person; relationship: PersonRelationship | null }>();
  if (selectedPerson) {
    for (const [fromId, targets] of Object.entries(state.world.relationships)) {
      for (const [toId, relationship] of Object.entries(targets)) {
        if ((fromId === selectedPerson.id || toId === selectedPerson.id) && relationship) {
          const from = state.world.people[fromId as PersonId], to = state.world.people[toId as PersonId];
          if (from && to) relationshipRowMap.set(`${fromId}:${toId}`, { from, to, relationship });
        }
      }
    }
    for (const episode of Object.values(state.world.relationshipFamiliarityEpisodes ?? {})) {
      if (episode.observerPersonId !== selectedPerson.id && episode.subjectPersonId !== selectedPerson.id) continue;
      const key = `${episode.observerPersonId}:${episode.subjectPersonId}`;
      if (relationshipRowMap.has(key)) continue;
      const from = state.world.people[episode.observerPersonId], to = state.world.people[episode.subjectPersonId];
      if (from && to) relationshipRowMap.set(key, { from, to, relationship: null });
    }
  }
  const relationshipRows = [...relationshipRowMap.values()];
  const selectedPersonAppointments = selectedPerson
    ? Object.values(state.world.appointments).filter((item) => item.personId === selectedPerson.id)
    : [];

  const matchingInstitutions = institutions.filter((institution) => {
    const matters = Object.values(state.world.matters).filter((matter) => matter.institutionId === institution.id);
    const appointments = Object.values(state.world.appointments).filter((item) => item.institutionId === institution.id);
    return matchesQuery([
      institution.name, ...institution.responsibilities, ...institution.authority,
      ...matters.map((matter) => matter.summary), ...appointments.map((item) => item.title),
    ], institutionQuery);
  });
  const selectedInstitution = matchingInstitutions.find((item) => item.id === selectedInstitutionId) ?? matchingInstitutions[0];
  const selectedInstitutionMatters = selectedInstitution
    ? Object.values(state.world.matters).filter((matter) => matter.institutionId === selectedInstitution.id)
    : [];
  const selectedInstitutionAppointments = selectedInstitution
    ? Object.values(state.world.appointments).filter((item) => item.institutionId === selectedInstitution.id)
    : [];
  const selectedInstitutionMatterIds = new Set(selectedInstitutionMatters.map((matter) => matter.id));
  const linkedRecordIds = new Set([
    ...selectedInstitutionMatters.flatMap((matter) => [
      ...(matter.sourceRecordId ? [matter.sourceRecordId] : []),
      ...(matter.provenance ?? []).filter((source) => source.kind === 'record_copy' && source.sourceId).map((source) => source.sourceId as RecordId),
    ]),
    ...Object.values(state.world.events)
      .filter((event) => event.institutionalResponse && selectedInstitutionMatterIds.has(event.institutionalResponse.matterId))
      .map((event) => event.institutionalResponse!.recordId),
  ]);
  const selectedInstitutionRecords = selectedInstitution
    ? Object.values(state.records.entries).filter((record) => record.institutionId === selectedInstitution.id || linkedRecordIds.has(record.id))
    : [];

  const personContext = (person: Person) => person.socialIdentity?.occupation
    ?? person.socialIdentity?.summary
    ?? person.affiliations.map((id) => state.world.institutions[id as InstitutionId]?.name).filter(Boolean).join(', ');

  return <div className="mx-auto max-w-6xl space-y-5">
    <header>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">World and social network</p>
      <h1 className="font-serif text-3xl font-semibold">People & Institutions</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">Personal relationships are directional. Professional reputation and standing within each institution are separate records, as are an institution's authority and the scopes of its appointed office-holders.</p>
    </header>

    <nav aria-label="People and institution directories" className="flex flex-wrap gap-2 border-b border-stone-300 pb-3">
      <button type="button" aria-pressed={section === 'people'} onClick={() => setSection('people')}
        className={`rounded-lg px-4 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700 ${section === 'people' ? 'bg-stone-900 text-white' : 'border border-stone-300 bg-white text-stone-700'}`}>People ({people.length})</button>
      <button type="button" aria-pressed={section === 'institutions'} onClick={() => setSection('institutions')}
        className={`rounded-lg px-4 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700 ${section === 'institutions' ? 'bg-stone-900 text-white' : 'border border-stone-300 bg-white text-stone-700'}`}>Institutions ({institutions.length})</button>
    </nav>

    {section === 'people'
      ? <section aria-label="People directory" className="grid gap-4 lg:grid-cols-[minmax(220px,300px)_minmax(0,1fr)]">
        <aside className="space-y-3">
          <div className="rounded-xl border border-stone-300 bg-[#fbf9f4] p-3">
            <label htmlFor="people-search" className="text-xs font-semibold text-stone-700">Search people</label>
            <input id="people-search" type="search" value={personQuery} onChange={(event) => setPersonQuery(event.target.value)}
              placeholder="Name, role, affiliation, appointment" className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-700" />
            <label htmlFor="people-life-filter" className="mt-3 block text-xs font-semibold text-stone-700">Life status</label>
            <select id="people-life-filter" value={personLifeFilter} onChange={(event) => setPersonLifeFilter(event.target.value as PersonLifeFilter)}
              className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-700">
              <option value="all">All people</option><option value="living">Living</option><option value="deceased">Deceased</option>
            </select>
            <p className="mt-2 text-xs text-stone-500" aria-live="polite">{matchingPeople.length} of {people.length} people</p>
          </div>
          <ul aria-label="Matching people" className="space-y-2">
            {matchingPeople.map((person) => <li key={person.id}><PersonIndexRow person={person}
              context={personContext(person) || undefined}
              selected={selectedPerson?.id === person.id} onSelect={() => setSelectedPersonId(person.id)} /></li>)}
            {matchingPeople.length === 0 && <li><p className="rounded-lg border border-stone-300 bg-white p-3 text-sm text-stone-500">No people match this search.</p></li>}
          </ul>
        </aside>
        <div id="people-detail" className="min-w-0">
          {selectedPerson
            ? <PersonDetail person={selectedPerson} people={state.world.people} institutions={state.world.institutions}
              relationships={relationshipRows} appointments={selectedPersonAppointments}
              events={state.world.events} records={state.records.entries}
              familiarityEpisodes={state.world.relationshipFamiliarityEpisodes ?? {}}
              isCurrentCharacter={selectedPerson.id === state.player.currentCharacterId} />
            : <p className="rounded-lg border border-stone-300 bg-white p-4 text-sm text-stone-500">Select a person to view recorded detail.</p>}
        </div>
      </section>
      : <section aria-label="Institution directory" className="grid gap-4 lg:grid-cols-[minmax(220px,300px)_minmax(0,1fr)]">
        <aside className="space-y-3">
          <div className="rounded-xl border border-stone-300 bg-[#fbf9f4] p-3">
            <label htmlFor="institutions-search" className="text-xs font-semibold text-stone-700">Search institutions</label>
            <input id="institutions-search" type="search" value={institutionQuery} onChange={(event) => setInstitutionQuery(event.target.value)}
              placeholder="Name, responsibility, matter, office" className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-700" />
            <p className="mt-2 text-xs text-stone-500" aria-live="polite">{matchingInstitutions.length} of {institutions.length} institutions</p>
          </div>
          <div className="space-y-2" aria-label="Matching institutions">
            {matchingInstitutions.map((institution) => <button key={institution.id} type="button" onClick={() => setSelectedInstitutionId(institution.id)}
              aria-pressed={selectedInstitution?.id === institution.id}
              className={`w-full rounded-lg border px-3 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700 ${selectedInstitution?.id === institution.id ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white text-stone-900 hover:bg-stone-50'}`}>
              <span className="block font-semibold">{institution.name}</span>
              <span className={`mt-1 block text-xs ${selectedInstitution?.id === institution.id ? 'text-stone-200' : 'text-stone-500'}`}>{Object.values(state.world.matters).filter((matter) => matter.institutionId === institution.id && matter.status === 'active').length} active matters · Standing {institution.standing}/100</span>
            </button>)}
            {matchingInstitutions.length === 0 && <p className="rounded-lg border border-stone-300 bg-white p-3 text-sm text-stone-500">No institutions match this search.</p>}
          </div>
        </aside>
        <div id="institution-detail" className="min-w-0">
          {selectedInstitution
            ? <InstitutionDetail institution={selectedInstitution} people={state.world.people}
              matters={selectedInstitutionMatters} records={Object.fromEntries(selectedInstitutionRecords.map((record) => [record.id, record]))}
              events={state.world.events} appointments={selectedInstitutionAppointments} />
            : <p className="rounded-lg border border-stone-300 bg-white p-4 text-sm text-stone-500">Select an institution to view recorded detail.</p>}
        </div>
      </section>}
  </div>;
}
