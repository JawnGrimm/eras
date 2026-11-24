import { describe, expect, it } from 'vitest';
import { createInitialGameState } from './initialState';
import { resolveEraICharacterHistory } from '../content/characterCreation/eraICharacterHistory';
import { selectPersonHistory } from './personHistory';
import type { PersonId } from './ids';
import type { Person } from './types';

const base = createInitialGameState();
const playerId = 'person-history-test' as PersonId;
const people: Record<string, Person> = {
  ...base.world.people,
  [playerId]: { id: playerId, name: 'Aru', alive: true, affiliations: [] },
};

function playerWithResolvedHistory(): Person {
  const resolved = resolveEraICharacterHistory({
    personId: playerId,
    people,
    choices: {
      originId: 'OR-03',
      responsibilityId: 'RS-03',
      formativeExperienceId: 'FE-04',
      entryRouteId: 'EN-02',
      instructionId: 'TR-02',
    },
  });
  return {
    ...people[playerId],
    characterCreation: resolved.characterCreation,
    lifeEvents: resolved.lifeEvents,
    familiarities: resolved.familiarities,
  };
}

describe('personal history read model', () => {
  it('resolves current authored history and displays participant roles by existing Person name', () => {
    const person = playerWithResolvedHistory();
    const view = selectPersonHistory(person, { ...people, [playerId]: person });
    expect(view.hasHistory).toBe(true);
    expect(view.events).toHaveLength(5);
    expect(view.events[3].participants).toEqual([{ role: 'recommender', name: 'Utu-mansum' }]);
    expect(view.events[4].participants).toEqual([{ role: 'trainer', name: 'Shuruppak-ilu' }]);
    expect(view.events.map((item) => item.order)).toEqual([0, 1, 2, 3, 4]);
  });

  it('uses the persisted summary when a content ID is no longer resolvable', () => {
    const person = playerWithResolvedHistory();
    const lifeEvents = person.lifeEvents!.map((item, index) => index === 0
      ? { ...item, contentId: 'retired.content.id', summary: 'Preserved legacy summary.' }
      : item);
    const view = selectPersonHistory({ ...person, lifeEvents }, { ...people, [playerId]: person });
    expect(view.events[0].summary).toBe('Preserved legacy summary.');
  });

  it('supports an NPC or successor with Life Events but no CharacterCreationRecord', () => {
    const person = playerWithResolvedHistory();
    const npc = { ...person, characterCreation: undefined };
    const view = selectPersonHistory(npc, { ...people, [playerId]: npc });
    expect(view.hasHistory).toBe(true);
    expect(view.events[0].summary).toBe(person.lifeEvents![0].summary);
  });

  it('shows a neutral fallback for legacy people with no recorded history', () => {
    const legacy = base.world.people['person-enlil-barni' as PersonId];
    const view = selectPersonHistory(legacy, base.world.people);
    expect(view).toEqual({
      hasHistory: false,
      emptyMessage: 'No personal history has been recorded.',
      events: [],
      familiarities: [],
    });
  });
});
