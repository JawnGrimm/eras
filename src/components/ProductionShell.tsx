import React, { useState } from 'react';
import { getInitializedScribal } from '../state/scribalState';
import { Volume2, VolumeX } from 'lucide-react';
import { isAudioMuted, setAudioMuted } from '../engine/audio';
import { GameProvider, useGame } from '../state/GameProvider';
import type { ProductionStorage } from '../state/GameProvider';
import type { DaySettlement, CareerProgressionPolicy } from '../state/types';
import type { WorkDefinition } from '../works/workDefinition';
import { INITIAL_WORK_CATALOG } from '../state/newGameState';
import { ProductionWorkdayHub } from './ProductionWorkdayHub';
import { StorehouseWorkScreen } from './StorehouseWorkScreen';
import { ProductionAssignmentBoard } from './ProductionAssignmentBoard';
import { AssignmentActivityScreen } from './AssignmentActivityScreen';
import { ProductionChallengeJournal } from './ProductionChallengeJournal';
import { SuccessionScreen } from './SuccessionScreen';
import { ProductionPeopleAndInstitutions } from './ProductionPeopleAndInstitutions';
import { ProductionRecordsAndJournal } from './ProductionRecordsAndJournal';
import { deriveProfessionalRank } from '../engine/professionalRank';
import { CharacterCreator } from './CharacterCreator';
import { EveningInterlude } from './EveningInterlude';

type Screen = 'workday' | 'storehouse' | 'assignments' | 'activity' | 'challenges' | 'people' | 'records' | 'help';

function ProductionHeader() {
  const { state } = useGame();
  const [audioMuted, setAudioMutedState] = useState(isAudioMuted);
  const person = state.world.people[state.player.currentCharacterId];
  const location = person?.currentLocationId ? state.world.locations[person.currentLocationId]?.name : 'Uruk';
  const scribal = getInitializedScribal(person);
  const wallet = person?.alive ? scribal?.wallet : undefined;
  return <header className="sticky top-0 z-20 border-b border-stone-300 bg-[#f8f5ee]/95 shadow-sm backdrop-blur">
    <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
      <div className="min-w-[180px]"><p className="font-serif text-lg font-semibold text-stone-900">Scribe of Eras</p><p className="text-xs text-stone-500">{state.calendar.displayDate} · {location}</p></div>
      <div className="flex flex-wrap items-center gap-2 text-xs sm:gap-4">
        <div className="rounded-lg border border-stone-300 bg-white px-3 py-2"><span className="text-stone-500">Character</span><p className="font-semibold text-stone-900">{person?.name ?? 'Unknown'}</p>{state.pendingSuccession && <p className="text-[10px] font-semibold text-amber-800">{state.pendingSuccession.status === 'no_successor' ? 'No successor available' : 'Transition pending'}</p>}</div>
        <div className="rounded-lg border border-stone-300 bg-white px-3 py-2"><span className="text-stone-500">Action Points</span><p className="font-mono text-base font-semibold text-stone-900">{state.actionEconomy.apRemaining}/{state.actionEconomy.dailyApAllocation}</p></div>
        <div className="rounded-lg border border-stone-300 bg-white px-3 py-2"><span className="text-stone-500">Currency</span><p className="font-mono text-base font-semibold text-stone-900">{wallet ? wallet.money : '—'}</p></div>
        <div className="rounded-lg border border-stone-300 bg-white px-3 py-2"><span className="text-stone-500">Provisions</span><p className="font-mono text-base font-semibold text-stone-900">{wallet ? wallet.provisions : '—'}</p></div>
      </div>
      <button type="button" onClick={() => { const nextMuted = !audioMuted; setAudioMuted(nextMuted); setAudioMutedState(nextMuted); }} aria-label={audioMuted ? 'Unmute audio feedback' : 'Mute audio feedback'} title={audioMuted ? 'Unmute audio feedback' : 'Mute audio feedback'} className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-stone-300 bg-white p-2 text-stone-700 hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900">
        {audioMuted ? <VolumeX size={18} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}
      </button>
    </div>
  </header>;
}

export function ProductionShellContent() {
  const game = useGame();
  const [screen, setScreen] = useState<Screen>('workday');
  const [settlement, setSettlement] = useState<DaySettlement | null>(null);
  const [activeActivityId, setActiveActivityId] = useState<string | null>(null);
  const openActivity = (assignmentId: string) => { setActiveActivityId(assignmentId); setScreen('activity'); };
  const person = game.state.world.people[game.state.player.currentCharacterId];
  const scribal = getInitializedScribal(person);

  if (game.needsCharacterCreation) return <CharacterCreator />;

  const alerts = <>
    {game.loadStatus !== 'ready' && <section role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4">
      <h2 className="font-semibold text-red-950">{game.loadStatus === 'corrupt_save' ? 'Production save needs recovery' : 'Production save could not be read'}</h2>
      <p className="mt-1 text-sm text-red-900">{game.storageError ?? 'The existing save has not been replaced. Ordinary actions are paused.'}</p>
      <p className="mt-1 text-sm text-red-900">Starting fresh opens the Character Creator. The production save is replaced only after you confirm the new character. Legacy prototype saves are left untouched.</p>
      <button onClick={() => { if (window.confirm('Open the Character Creator? The current production save will not be replaced until you confirm a new character.')) { if (game.startFreshProductionSave()) { setSettlement(null); setScreen('workday'); } } }} className="mt-3 rounded-lg bg-red-900 px-4 py-2 text-sm font-semibold text-white">Start Fresh Production Save</button>
    </section>}
    {game.hasUnsavedChanges && <section role="status" className="rounded-xl border border-amber-400 bg-amber-50 px-4 py-3">
      <p className="text-sm font-semibold text-amber-950">This session has unsaved changes</p>
      <p className="mt-1 text-sm text-amber-900">{game.storageError ?? 'The latest changes have not been confirmed in browser storage. Keep this session open.'}</p>
    </section>}
    {game.feedback && <section role="status" className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${game.feedback.kind === 'error' ? 'border-red-200 bg-red-50 text-red-900' : 'border-stone-300 bg-white text-stone-700'}`}>
      <p>{game.feedback.message}</p><button onClick={game.clearFeedback} aria-label="Dismiss message" className="text-xs underline">Dismiss</button>
    </section>}
  </>;

  if (game.state.pendingSuccession) {
    return <div data-era={game.state.calendar.eraId} className="min-h-screen bg-[var(--surface-ground)] text-[var(--ink-primary)]">
      <ProductionHeader />
      <div className="mx-auto max-w-[1600px] px-4 py-6 lg:px-6">
        <main className="min-w-0 space-y-4">{alerts}<SuccessionScreen /></main>
      </div>
    </div>;
  }
  if (game.state.dayClose.phase === 'interlude_open') {
    return <div data-era={game.state.calendar.eraId} className="min-h-screen bg-[var(--surface-ground)] text-[var(--ink-primary)]">
      <ProductionHeader />
      <div className="mx-auto max-w-[1600px] px-4 py-6 lg:px-6">
        {alerts}
        <EveningInterlude onBeginWorkday={() => setScreen('workday')} />
      </div>
    </div>;
  }

  return <div data-era={game.state.calendar.eraId} className="min-h-screen bg-[var(--surface-ground)] text-[var(--ink-primary)]">
    <ProductionHeader />
    <div className="mx-auto grid max-w-[1600px] gap-5 px-4 py-5 lg:grid-cols-[230px_minmax(0,1fr)] lg:px-6">
      <aside className="h-fit rounded-xl border border-stone-300 bg-[#e9e3d7] p-3 lg:sticky lg:top-24">
        <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-stone-500">Workspace</p>
        <nav className="space-y-1">
          <button onClick={() => setScreen('workday')} aria-current={screen === 'workday' ? 'page' : undefined} className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium ${screen === 'workday' ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-white/70'}`}>Workday Hub</button>
          <button onClick={() => setScreen('storehouse')} aria-current={screen === 'storehouse' ? 'page' : undefined} className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium ${screen === 'storehouse' ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-white/70'}`}>Introductory Tutorial · Storehouse</button>
          <button onClick={() => setScreen('assignments')} aria-current={screen === 'assignments' ? 'page' : undefined} className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium ${screen === 'assignments' ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-white/70'}`}>Assignment Board</button>
          <button onClick={() => setScreen('challenges')} aria-current={screen === 'challenges' ? 'page' : undefined} className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium ${screen === 'challenges' ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-white/70'}`}>Challenge Journal</button>
          <button onClick={() => setScreen('people')} aria-current={screen === 'people' ? 'page' : undefined} className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium ${screen === 'people' ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-white/70'}`}>People & Institutions</button>
          <button onClick={() => setScreen('records')} aria-current={screen === 'records' ? 'page' : undefined} className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium ${screen === 'records' ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-white/70'}`}>Records & Journal</button>
          <button onClick={() => setScreen('help')} aria-current={screen === 'help' ? 'page' : undefined} className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium ${screen === 'help' ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-white/70'}`}>Help & Rules</button>
        </nav>
        <div className="mt-4 border-t border-stone-300 px-3 pt-4 text-xs leading-5 text-stone-600">
          <p className="font-semibold text-stone-800">{person?.name}</p>
          <p>Uruk · Late Uruk period (c. 3200 BCE)</p>
          <p className="mt-2">Career XP: {scribal?.careerXp.toLocaleString() ?? 'Not initialized'}</p>
          <p>Historical XP: {game.state.historicalProgression.historicalXp.toLocaleString()}</p>
          <p>Stress: {scribal ? `${scribal.stress}/100` : 'Not initialized'}</p>
          <p>Professional Rank: {scribal ? `Grade ${deriveProfessionalRank(scribal.skills)}` : 'Not initialized'}</p>
        </div>
      </aside>

      <main className="min-w-0 space-y-4">
        {alerts}
        {screen === 'workday'
          ? <ProductionWorkdayHub onOpenWork={() => setScreen('storehouse')} onOpenActivity={openActivity} settlement={settlement} onSettlement={setSettlement} />
          : screen === 'storehouse'
            ? <StorehouseWorkScreen onBack={() => setScreen('workday')} />
            : screen === 'assignments'
              ? <ProductionAssignmentBoard onOpenActivity={openActivity} />
               : screen === 'activity' && activeActivityId
                ? <AssignmentActivityScreen assignmentId={activeActivityId as import('../state/ids').AssignmentId} onBack={() => setScreen('assignments')} />
                : screen === 'challenges'
                ? <ProductionChallengeJournal />
                : screen === 'people'
                  ? <ProductionPeopleAndInstitutions />
                  : screen === 'records'
                    ? <ProductionRecordsAndJournal />
                    : <section className="space-y-5 rounded-xl border border-stone-300 bg-[#fbf9f4] p-5 sm:p-7">
                        <div><p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Player reference</p><h1 className="mt-1 font-serif text-2xl font-semibold text-stone-900">Help & Rules</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-stone-700">A short guide to the current production slice. The Storehouse Reckoning is the introductory tutorial, not a Work and not a template for future historical undertakings. It awards no Historical Progress XP.</p></div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <article className="rounded-lg border border-stone-200 bg-white p-4"><h2 className="font-semibold text-stone-900">Your Workday</h2><p className="mt-2 text-sm leading-6 text-stone-700">You have six shared Action Points (AP) each day. Assignments, Challenges, Work actions, study, and other activities draw from the same budget. Unused AP do not carry over.</p></article>
                          <article className="rounded-lg border border-stone-200 bg-white p-4"><h2 className="font-semibold text-stone-900">Works</h2><p className="mt-2 text-sm leading-6 text-stone-700">Works are substantial historical undertakings that advance the main journey. They are the sole ordinary source of Historical Progress XP. Follow each Work's evidence, submission, revision, and disposition requirements.</p></article>
                          <article className="rounded-lg border border-stone-200 bg-white p-4"><h2 className="font-semibold text-stone-900">Assignments</h2><p className="mt-2 text-sm leading-6 text-stone-700">Assignments are optional professional commitments. They can provide Career XP and compensation, but never Historical Progress XP. You may hold up to two accepted Assignments at once.</p></article>
                          <article className="rounded-lg border border-stone-200 bg-white p-4"><h2 className="font-semibold text-stone-900">Challenges</h2><p className="mt-2 text-sm leading-6 text-stone-700">Challenges are optional narrative situations. Their outcomes can affect Career XP, resources, reputation, and relationships, but they do not award Historical Progress XP.</p></article>
                          <article className="rounded-lg border border-stone-200 bg-white p-4"><h2 className="font-semibold text-stone-900">Evidence and records</h2><p className="mt-2 text-sm leading-6 text-stone-700">Acquiring evidence costs the AP shown by the action. Examining acquired evidence is free. Keep source claims, your interpretation, your judgment, and senior assessment distinct; do not claim more than the records establish.</p></article>
                          <article className="rounded-lg border border-stone-200 bg-white p-4"><h2 className="font-semibold text-stone-900">Settlement</h2><p className="mt-2 text-sm leading-6 text-stone-700">End the Workday from the Hub to apply sustenance and any qualifying Work provisions, advance the calendar, and receive tomorrow's AP allocation. The first two consecutive Workdays without provisions are a grace period. At the end of the third, you gain the Underfed condition and +2 Stress; each further Workday without provisions adds +2 Stress, up to 10 shortage-attributed Stress over the character’s lifetime. Underfed clears when you consume provisions, but Stress already gained remains. Recovery options shown in Sustenance & Hardship include Temple Storehouse auxiliary labor (2 AP for one provision, once per Workday) and, when Ur-gir is eligible, a one-provision advance (1 AP) owed as one unit of Currency or a day of scribal assistance. Overtime adds one AP now, increases Stress by five, and reduces tomorrow's allocation by one.</p></article>
                        </div>
                        <section className="rounded-lg border border-red-200 bg-red-50 p-4">
                          <h2 className="font-semibold text-red-950">Start a new character</h2>
                          <p className="mt-1 text-sm leading-6 text-red-900">This opens the Character Creator. The current production save is replaced only when you confirm the new character. Legacy <code>scribe_*</code> keys are not read, migrated, or deleted.</p>
                          <button onClick={() => { if (window.confirm('Open the Character Creator? The current production save will not be replaced until you confirm a new character.')) { if (game.startFreshProductionSave()) { setSettlement(null); setScreen('workday'); } } }} className="mt-3 rounded-lg bg-red-900 px-4 py-2 text-sm font-semibold text-white">Start New Character</button>
                        </section>
                      </section>}
      </main>
    </div>
  </div>;
}

/** Production entry surface mounted by src/App.tsx. */
export function ProductionApp({ storage, careerPolicy, workCatalog }: {
  storage?: ProductionStorage | null;
  careerPolicy?: CareerProgressionPolicy;
  workCatalog?: Readonly<Record<string, WorkDefinition<any>>>;
}) {
  return <GameProvider storage={storage} careerPolicy={careerPolicy} workCatalog={workCatalog ?? INITIAL_WORK_CATALOG}>
    <ProductionShellContent />
  </GameProvider>;
}
