import React, { useState } from 'react';
import type { CareerPathId, PersonId } from '../state/ids';
import type { EraICharacterHistoryChoices } from '../content/characterCreation/eraICharacterHistory';
import { resolveEraICharacterHistory } from '../content/characterCreation/eraICharacterHistory';
import {
  ERA_I_CURATED_SAMPLE_NAMES,
  resolveEraICharacterStartingState,
  validateEraICharacterName,
} from '../state/eraICharacterStartingState';
import { useGame } from '../state/GameProvider';

const ORIGINS = [
  ['OR-01', 'Food and provisioning'],
  ['OR-02', 'Fields and herds'],
  ['OR-03', 'Skilled making'],
  ['OR-04', 'Exchange and movement'],
] as const;
const RESPONSIBILITIES = [
  ['RS-01', 'Count or measure'],
  ['RS-02', 'Help with deliveries'],
  ['RS-03', 'Judge materials or quality'],
  ['RS-04', 'Observe a record or seal in use'],
] as const;
const FORMATIVE = [
  ['FE-01', 'A quantity did not match'],
  ['FE-02', 'You were blamed unfairly'],
  ['FE-03', 'You helped settle a disagreement'],
  ['FE-04', 'You were trusted with an adult responsibility'],
] as const;
const ENTRY_ROUTES = [
  ['EN-01', 'Introduced to scribal work'],
  ['EN-02', 'Recommended for scribal work'],
  ['EN-03', 'Sponsored into scribal work'],
  ['EN-04', 'Made a professional contact'],
] as const;
const INSTRUCTIONS = [
  ['TR-01', 'Quantities and commodity notation'],
  ['TR-02', 'Clay, stylus, and tablet preparation'],
  ['TR-03', 'Signs and category lists'],
  ['TR-04', 'Checking and organizing records'],
] as const;
const ORIENTATIONS: Array<{ id: CareerPathId; label: string; description: string }> = [
  { id: 'government', label: 'Civic', description: 'Public administration and civic responsibilities' },
  { id: 'military', label: 'Martial', description: 'Custody, transport, protection, and organized movement' },
  { id: 'religious', label: 'Religious', description: 'Temple institutions and religious administration' },
  { id: 'merchant', label: 'Commercial', description: 'Exchange, goods, routes, and commercial records' },
];
const SEED = 'era1-character-creation-v1';

function compatibleFormative(responsibilityId: string, formativeId: string): boolean {
  if (formativeId === 'FE-01') return responsibilityId === 'RS-01' || responsibilityId === 'RS-02';
  if (formativeId === 'FE-03') return responsibilityId === 'RS-01' || responsibilityId === 'RS-02' || responsibilityId === 'RS-03';
  return formativeId === 'FE-02' || formativeId === 'FE-04';
}

function SelectField({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<readonly [string, string]>;
}) {
  return <label className="block">
    <span className="mb-1 block text-sm font-semibold text-stone-800">{label}</span>
    <select value={value} onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 focus:outline-2 focus:outline-offset-2 focus:outline-stone-800">
      {options.map(([id, title]) => <option key={id} value={id}>{title}</option>)}
    </select>
  </label>;
}

export function CharacterCreator() {
  const game = useGame();
  const [name, setName] = useState('');
  const [originId, setOriginId] = useState<EraICharacterHistoryChoices['originId']>('OR-01');
  const [responsibilityId, setResponsibilityId] = useState<EraICharacterHistoryChoices['responsibilityId']>('RS-01');
  const [formativeExperienceId, setFormativeExperienceId] = useState<EraICharacterHistoryChoices['formativeExperienceId']>('FE-01');
  const [entryRouteId, setEntryRouteId] = useState<EraICharacterHistoryChoices['entryRouteId']>('EN-01');
  const [instructionId, setInstructionId] = useState<EraICharacterHistoryChoices['instructionId']>('TR-01');
  const [careerPath, setCareerPath] = useState<CareerPathId>('government');
  const [review, setReview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const choices: EraICharacterHistoryChoices = {
    originId, responsibilityId, formativeExperienceId, entryRouteId, instructionId,
  };
  const previewChoices: EraICharacterHistoryChoices = formativeExperienceId ? choices : {
    ...choices, formativeExperienceId: 'FE-02',
  };
  const nameResult = validateEraICharacterName(name);
  const choicesReady = Boolean(originId && responsibilityId && formativeExperienceId && entryRouteId && instructionId);
  const ready = nameResult.valid && choicesReady;
  const history = resolveEraICharacterHistory({
    personId: 'person-character-creator-preview' as PersonId,
    people: game.state.world.people,
    choices: previewChoices,
  });
  const starting = resolveEraICharacterStartingState(previewChoices, careerPath);
  const selectedOrientation = ORIENTATIONS.find((item) => item.id === careerPath)!;
  const eventNames = history.lifeEvents.map((event) => ({
    ...event,
    participants: event.participants.map((participant) => ({
      role: participant.role,
      name: game.state.world.people[participant.personId]?.name ?? participant.personId,
    })),
  }));
  const attributeLabels: Record<string, string> = {
    precision: 'Precision', perception: 'Perception', reasoning: 'Reasoning',
    expression: 'Expression', endurance: 'Endurance', composure: 'Composure',
  };
  const skillLabels: Record<string, string> = {
    reading_scripts: 'Reading & Scripts', recordkeeping_accounts: 'Recordkeeping & Accounts',
    analysis_research: 'Analysis & Research', writing_composition: 'Writing & Composition',
    administration_procedure: 'Administration & Procedure', communication_instruction: 'Communication & Instruction',
  };

  const begin = () => {
    if (!ready || !nameResult.valid) return;
    const result = game.createCharacterAndStartGame({
      seed: SEED, name: nameResult.name, choices, careerPath,
    });
    if (!result) setError('The new character could not be saved. Your existing save has not been replaced.');
  };

  return <div className="min-h-screen bg-[#f2eee5] px-4 py-8 text-stone-900">
    <main className="mx-auto max-w-4xl space-y-6">
      <header className="border-b border-stone-300 pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Scribe of Eras · Era I · Uruk</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold">Create your character</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-700">Your early experiences establish what you have encountered and practiced—not automatic competence, authority, or personal relationships. Starting values marked provisional are for playtest calibration.</p>
      </header>
      {game.storageError && <p role="status" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">{game.storageError} You can still begin a session, but it will not persist between visits.</p>}

      {!review ? <>
        <section className="rounded-xl border border-stone-300 bg-[#fbf9f4] p-5">
          <h2 className="font-serif text-xl font-semibold">1. Identity</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Character name</span>
              <input value={name} onChange={(event) => setName(event.target.value)} maxLength={120}
                placeholder="Enter any name" className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm" />
              {!nameResult.valid && name.length > 0 && <span className="mt-1 block text-xs text-red-800">{nameResult.error}</span>}
              <span className="mt-1 block text-xs text-stone-500">1–60 Unicode code points. Punctuation, symbols, numerals, and playful names are allowed.</span>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Or choose an Era I sample name</span>
              <select value="" onChange={(event) => { if (event.target.value) setName(event.target.value); }}
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm">
                <option value="">Choose a sample name…</option>
                {ERA_I_CURATED_SAMPLE_NAMES.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
              </select>
              <span className="mt-1 block text-xs text-stone-500">Some readings are uncertain sign sequences, not reconstructed pronunciations.</span>
            </label>
          </div>
        </section>

        <section className="rounded-xl border border-stone-300 bg-[#fbf9f4] p-5">
          <h2 className="font-serif text-xl font-semibold">2. Early life</h2>
          <p className="mt-1 text-sm text-stone-600">Where you grew up and what surrounded you.</p>
          <div className="mt-4"><SelectField label="Origin" value={originId} onChange={(value) => setOriginId(value as typeof originId)} options={ORIGINS} /></div>
        </section>

        <section className="rounded-xl border border-stone-300 bg-[#fbf9f4] p-5">
          <h2 className="font-serif text-xl font-semibold">3. Early responsibility</h2>
          <div className="mt-4"><SelectField label="Responsibility" value={responsibilityId} onChange={(value) => {
            const next = value as typeof responsibilityId;
            setResponsibilityId(next);
            if (!compatibleFormative(next, formativeExperienceId)) setFormativeExperienceId('' as typeof formativeExperienceId);
          }} options={RESPONSIBILITIES} /></div>
        </section>

        <section className="rounded-xl border border-stone-300 bg-[#fbf9f4] p-5">
          <h2 className="font-serif text-xl font-semibold">4. Formative experience</h2>
          <p className="mt-1 text-sm text-stone-600">Choose an experience compatible with your early responsibility.</p>
          <div className="mt-4"><SelectField label="Formative experience" value={formativeExperienceId}
            onChange={(value) => setFormativeExperienceId(value as typeof formativeExperienceId)}
            options={FORMATIVE.filter(([id]) => compatibleFormative(responsibilityId, id))} /></div>
          {!formativeExperienceId && <p className="mt-2 text-sm text-amber-800">Choose a replacement experience; your previous choice is no longer compatible.</p>}
        </section>

        <section className="rounded-xl border border-stone-300 bg-[#fbf9f4] p-5">
          <h2 className="font-serif text-xl font-semibold">5. Professional entry</h2>
          <div className="mt-4"><SelectField label="Entry route" value={entryRouteId} onChange={(value) => setEntryRouteId(value as typeof entryRouteId)} options={ENTRY_ROUTES} /></div>
        </section>

        <section className="rounded-xl border border-stone-300 bg-[#fbf9f4] p-5">
          <h2 className="font-serif text-xl font-semibold">6. First instruction</h2>
          <div className="mt-4"><SelectField label="First lesson" value={instructionId} onChange={(value) => setInstructionId(value as typeof instructionId)} options={INSTRUCTIONS} /></div>
        </section>

        <section className="rounded-xl border border-stone-300 bg-[#fbf9f4] p-5">
          <h2 className="font-serif text-xl font-semibold">7. Professional orientation</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {ORIENTATIONS.map((item) => <label key={item.id} className={`flex cursor-pointer gap-3 rounded-lg border p-3 ${careerPath === item.id ? 'border-stone-900 bg-stone-100' : 'border-stone-300 bg-white'}`}>
              <input type="radio" name="orientation" value={item.id} checked={careerPath === item.id}
                onChange={() => setCareerPath(item.id)} className="mt-1" />
              <span><span className="block text-sm font-semibold">{item.label}</span><span className="mt-1 block text-xs text-stone-600">{item.description}</span></span>
            </label>)}
          </div>
        </section>

        {error && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">{error}</p>}
        <div className="flex flex-wrap justify-end gap-3">
          <button type="button" disabled={!ready} onClick={() => { setError(null); setReview(true); }}
            className="rounded-lg bg-stone-900 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">Review character</button>
        </div>
      </> : <>
        <section className="rounded-xl border border-stone-300 bg-[#fbf9f4] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Character review</p><h2 className="mt-1 font-serif text-2xl font-semibold">{nameResult.valid ? nameResult.name : name}</h2><p className="text-sm text-stone-600">{selectedOrientation.label} orientation · Apprentice · Provisional Grade 1</p></div>
            <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">Playtest values · provisional</span>
          </div>
          <h3 className="mt-6 font-semibold">Life history</h3>
          <ol className="mt-2 space-y-3">
            {eventNames.map((event) => <li key={event.id} className="border-l-2 border-stone-300 pl-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{event.chronology.order + 1}. {event.chronology.stage.replace(/_/g, ' ')}</p>
              <p className="mt-1 text-sm">{event.summary}</p>
              {event.participants.map((participant, index) => <p key={index} className="mt-1 text-xs text-stone-600">{participant.role.replace(/_/g, ' ')}: {participant.name}</p>)}
            </li>)}
          </ol>
          <h3 className="mt-6 font-semibold">Familiarities</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {history.familiarities.map((item) => <li key={item.id}>{item.domainId} · {item.scopeId.replace(/_/g, ' ')} · {item.exposure.replace(/_/g, ' ')} · Life Event {item.basisLifeEventIds.map((id) => id.slice(-1)).join(', ')}</li>)}
          </ul>
          <h3 className="mt-6 font-semibold">Attributes</h3>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {Object.entries(starting.attributes).map(([id, value]) => <div key={id} className="rounded-lg bg-white p-3"><p className="text-xs text-stone-500">{attributeLabels[id]}</p><p className="font-mono text-lg font-semibold">{value}</p><p className="text-xs text-stone-600">{starting.attributeSources[id as keyof typeof starting.attributeSources]?.join(' · ') ?? 'Common baseline 5'}</p></div>)}
          </div>
          <h3 className="mt-6 font-semibold">Skills and first-lesson practice</h3>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {Object.entries(starting.skills).map(([id, skill]) => <div key={id} className="rounded-lg bg-white p-3"><p className="text-sm font-medium">{skillLabels[id]}</p><p className="font-mono text-sm">Level {skill.level} · {skill.skillXp} Skill XP</p><p className="text-xs text-stone-600">{starting.skillXpSources[id as keyof typeof starting.skillXpSources]?.join(', ') ?? 'No starting lesson XP'}</p></div>)}
          </div>
          <h3 className="mt-6 font-semibold">Professional reputation</h3>
          <p className="mt-1 text-sm">Competence 50 · Reliability 50 · Discretion 50 · Judgment 50</p>
          <h3 className="mt-6 font-semibold">Opening state</h3>
          <p className="mt-1 text-sm">Career XP 0 · Historical Progress XP 0 · Money 0 · Provisions 5 · Stress 0 · Six Action Points on Workday 1.</p>
          <p className="mt-2 text-sm text-stone-600">No appointments, formal authority, obligations, conditions, specializations, traits, equipment, or institutional standing. Participation in a Life Event does not create friendship, trust, or patronage.</p>
        </section>
        {error && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">{error}</p>}
        <div className="flex flex-wrap justify-between gap-3">
          <button type="button" onClick={() => setReview(false)} className="rounded-lg border border-stone-400 bg-white px-5 py-3 text-sm font-semibold">Return to choices</button>
          <button type="button" onClick={begin} className="rounded-lg bg-stone-900 px-5 py-3 text-sm font-semibold text-white">Confirm and begin Workday 1</button>
        </div>
      </>}
    </main>
  </div>;
}
