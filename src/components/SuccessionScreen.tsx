import React from 'react';
import { getInitializedScribal } from '../state/scribalState';
import { rankSuccessorCandidates } from '../engine/characterContinuity';
import { deriveProfessionalRank } from '../engine/professionalRank';
import { CORE_SKILL_IDS } from '../state/ids';
import type { GameState, PersonRelationship } from '../state/types';
import { useGame } from '../state/GameProvider';

const SKILL_LABELS: Record<(typeof CORE_SKILL_IDS)[number], string> = {
  reading_scripts: 'Reading scripts',
  recordkeeping_accounts: 'Recordkeeping & accounts',
  analysis_research: 'Analysis & research',
  writing_composition: 'Writing & composition',
  administration_procedure: 'Administration & procedure',
  communication_instruction: 'Communication & instruction',
};

function RelationshipView({ relationship, fromName, toName }: {
  relationship: PersonRelationship; fromName: string; toName: string;
}) {
  const dimensions = relationship.dimensions;
  return <div className="rounded-md border border-stone-200 bg-white p-3">
    <h4 className="text-sm font-semibold">{fromName} → {toName}</h4>
    <dl className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
      {Object.entries(dimensions).map(([key, value]) => <div key={key}>
        <dt className="text-xs capitalize text-stone-500">{key}</dt><dd className="font-mono text-sm">{value}/100</dd>
      </div>)}
    </dl>
    {relationship.history.length > 0 && <div className="mt-3 border-t border-stone-200 pt-2">
      <p className="text-xs font-semibold text-stone-600">Relationship history</p>
      <ul className="mt-1 space-y-1 text-xs text-stone-600">{relationship.history.map((entry) =>
        <li key={entry.id}>Day {entry.dayNumber}: {entry.summary}</li>)}</ul>
    </div>}
  </div>;
}

function ConnectionReasons({ state, candidateId }: { state: GameState; candidateId: string }) {
  const candidate = state.world.people[candidateId as keyof typeof state.world.people];
  const formerId = state.pendingSuccession!.formerCharacterId;
  const former = state.world.people[formerId];
  const ranked = rankSuccessorCandidates(state).find((item) => item.personId === candidateId);
  if (!candidate || !former || !ranked) return null;

  const tierLabel = ranked.tier === 'direct_personal' ? 'Direct personal connection'
    : ranked.tier === 'direct_professional' ? 'Direct professional connection' : 'Wider professional network';
  return <div className="mt-3 space-y-2">
    <p className="text-xs font-semibold text-amber-900">Connection priority: {tierLabel}</p>
    {ranked.reasons.map((reason, index) => {
      if (reason.kind === 'direct_relationship') {
        const from = state.world.people[reason.fromId];
        const to = state.world.people[reason.toId];
        const relationship = state.world.relationships[reason.fromId]?.[reason.toId];
        return <div key={index}>
          {relationship ? <RelationshipView relationship={relationship} fromName={from?.name ?? 'Unknown person'} toName={to?.name ?? 'Unknown person'} />
            : <p className="text-xs text-stone-600">Direct relationship recorded between {from?.name} and {to?.name}.</p>}
        </div>;
      }
      if (reason.kind === 'shared_institution') {
        const institution = state.world.institutions[reason.institutionId];
        return <p key={index} className="rounded-md bg-stone-100 p-2 text-xs text-stone-700">
          Direct professional connection: both people are affiliated with {institution?.name ?? 'a recorded institution'}.
        </p>;
      }
      const intermediary = state.world.people[reason.intermediaryId];
      const institutions = reason.sharedInstitutionIds.map((id) => state.world.institutions[id]?.name ?? id);
      return <p key={index} className="rounded-md bg-stone-100 p-2 text-xs text-stone-700">
        Wider professional network through {intermediary?.name ?? 'a recorded intermediary'}: the former character connects by {reason.formerConnection}, and {candidate.name} connects by {reason.candidateConnection}
        {institutions.length ? ` (institutions: ${institutions.join(', ')})` : ''}.
      </p>;
    })}
  </div>;
}

function CandidateCard({ candidateId, state }: { candidateId: string; state: GameState }) {
  const game = useGame();
  const candidate = state.world.people[candidateId as keyof typeof state.world.people];
  const scribal = getInitializedScribal(candidate);
  if (!candidate || !scribal) return null;
  const rank = deriveProfessionalRank(scribal.skills);
  const appointments = Object.values(state.world.appointments).filter((appointment) =>
    appointment.personId === candidate.id && appointment.startDay <= state.calendar.dayNumber
      && (appointment.endDay === undefined || appointment.endDay >= state.calendar.dayNumber));

  return <article className="rounded-xl border border-stone-300 bg-white p-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h2 className="font-serif text-xl font-semibold">{candidate.name}</h2>
        <p className="mt-1 text-sm text-stone-600">Derived professional rank: Grade {rank} · {candidate.ageYears === undefined ? 'Age not recorded' : `Age ${candidate.ageYears}`}</p>
      </div>
      <button onClick={() => game.dispatch({ type: 'SELECT_SUCCESSOR', nextCharacterId: candidate.id })}
        className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white">Continue as {candidate.name}</button>
    </div>
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      <section><h3 className="text-sm font-semibold">Skills</h3>
        <dl className="mt-2 grid grid-cols-2 gap-2">{CORE_SKILL_IDS.map((id) => <div key={id} className="rounded bg-stone-50 p-2">
          <dt className="text-xs text-stone-500">{SKILL_LABELS[id]}</dt><dd className="font-mono text-sm">Level {scribal.skills[id]?.level ?? 1}</dd>
        </div>)}</dl>
      </section>
      <section><h3 className="text-sm font-semibold">Personal circumstances</h3>
        <dl className="mt-2 grid grid-cols-2 gap-2">
          <div className="rounded bg-stone-50 p-2"><dt className="text-xs text-stone-500">Currency</dt><dd className="font-mono text-sm">{scribal.wallet.money}</dd></div>
          <div className="rounded bg-stone-50 p-2"><dt className="text-xs text-stone-500">Provisions</dt><dd className="font-mono text-sm">{scribal.wallet.provisions}</dd></div>
          <div className="rounded bg-stone-50 p-2"><dt className="text-xs text-stone-500">Career XP</dt><dd className="font-mono text-sm">{scribal.careerXp.toLocaleString()}</dd></div>
          <div className="rounded bg-stone-50 p-2"><dt className="text-xs text-stone-500">Stress</dt><dd className="font-mono text-sm">{scribal.stress}</dd></div>
        </dl>
      </section>
    </div>
    <section className="mt-4"><h3 className="text-sm font-semibold">Affiliations and appointments</h3>
      <ul className="mt-2 space-y-1 text-xs text-stone-700">
        {candidate.affiliations.map((id) => <li key={id}>Affiliated with {state.world.institutions[id]?.name ?? id}</li>)}
        {appointments.map((appointment) => <li key={appointment.id}>
          {appointment.title} at {state.world.institutions[appointment.institutionId]?.name ?? appointment.institutionId}
          {' · '}Authority: {appointment.authorityScope.join('; ')}
        </li>)}
        {candidate.affiliations.length === 0 && appointments.length === 0 && <li>No current institutional affiliations or appointments are recorded.</li>}
      </ul>
    </section>
    <section className="mt-4"><h3 className="text-sm font-semibold">Established connection to the former character</h3>
      <ConnectionReasons state={state} candidateId={candidate.id} />
    </section>
  </article>;
}

export function SuccessionScreen() {
  const { state } = useGame();
  const pending = state.pendingSuccession;
  if (!pending) return null;
  const former = state.world.people[pending.formerCharacterId];
  const candidates = rankSuccessorCandidates(state).filter((candidate) => pending.candidateIds.includes(candidate.personId));

  if (pending.status === 'no_successor') {
    return <div className="mx-auto max-w-3xl space-y-5 rounded-xl border border-stone-400 bg-[#eee8dc] p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-600">Continuity boundary</p>
      <h1 className="font-serif text-3xl font-semibold">No successor is available</h1>
      <p className="text-sm leading-6 text-stone-700">
        {former?.name ?? 'The former character'} {pending.departureKind === 'death' ? 'has died' : 'has left play'}, and the current world roster contains no eligible, living scribal NPC with an established connection.
      </p>
      <p className="text-sm leading-6 text-stone-700">No replacement person will be generated. The calendar, era, completed Works, records, and world state have not been reset. This is a terminal continuity boundary for the currently authored roster, not an era restart.</p>
      <p className="border-t border-stone-300 pt-4 text-xs text-stone-600">Ordinary workspace actions remain paused. There is no automatic fallback character.</p>
    </div>;
  }

  return <div className="mx-auto max-w-5xl space-y-5">
    <header className="rounded-xl border border-amber-300 bg-amber-50 p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">Character transition · Day {pending.dayNumber}</p>
      <h1 className="mt-1 font-serif text-3xl font-semibold">Choose who continues</h1>
      <p className="mt-2 text-sm leading-6 text-stone-700">
        {former?.name ?? 'The former character'} {pending.departureKind === 'death' ? 'has died' : 'has left play'}. Choose an existing connected scribe to continue on the same day. Each candidate keeps their own skills, standing, possessions, and obligations.
      </p>
      <p className="mt-2 text-xs text-stone-600">Candidates are shown in the engine's connection-priority order. Rank, skills, and wealth do not change that order.</p>
    </header>
    <div className="space-y-4">
      {candidates.map((candidate) => <CandidateCard key={candidate.personId} candidateId={candidate.personId} state={state} />)}
      {candidates.length === 0 && <p className="rounded-xl border border-stone-300 bg-white p-5 text-sm">No currently eligible successor is available.</p>}
    </div>
  </div>;
}
