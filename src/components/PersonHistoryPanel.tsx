import React from 'react';
import type { Person } from '../state/types';
import { selectPersonHistory } from '../state/personHistory';

const STAGE_LABELS = {
  early_life: 'Early life',
  youth: 'Youth',
  transition_to_scribal_work: 'Transition to scribal work',
} as const;

export function PersonHistoryPanel({ person, people }: {
  person: Person;
  people: Readonly<Record<string, Person>>;
}) {
  const history = selectPersonHistory(person, people);
  return <section className="mt-4 rounded-lg border border-stone-200 bg-[#fbf9f4] p-4">
    <h4 className="text-sm font-semibold">Personal history</h4>
    {!history.hasHistory
      ? <p className="mt-1 text-sm text-stone-500">{history.emptyMessage}</p>
      : <ol className="mt-3 space-y-3">
        {history.events.map((event) => <li key={event.id} className="border-l-2 border-stone-300 pl-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            {event.order + 1}. {STAGE_LABELS[event.stage]}
          </p>
          <p className="mt-1 text-sm leading-5 text-stone-800">{event.summary}</p>
          {event.participants.length > 0 && <ul className="mt-1 space-y-1 text-xs text-stone-600">
            {event.participants.map((participant, index) => <li key={index}>
              {participant.role.replace(/_/g, ' ')}: {participant.name}
            </li>)}
          </ul>}
        </li>)}
      </ol>}
    {history.familiarities.length > 0 && <div className="mt-4 border-t border-stone-200 pt-3">
      <h5 className="text-xs font-semibold uppercase tracking-wide text-stone-500">Recorded familiarity</h5>
      <ul className="mt-2 space-y-1 text-xs text-stone-700">
        {history.familiarities.map((item) => <li key={item.id}>
          <span className="font-medium">{item.domainId}</span> · {item.scopeId.replace(/_/g, ' ')} · {item.exposure.replace(/_/g, ' ')}
        </li>)}
      </ul>
    </div>}
  </section>;
}
