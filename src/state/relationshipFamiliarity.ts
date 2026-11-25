import type { EventId, MatterId, PersonId, RecordId } from './ids';

export type RelationshipFamiliarityStage = 'recognized' | 'acquainted' | 'familiar';
export type FamiliarityAcquisitionMode =
  | 'direct_interaction'
  | 'shared_participation'
  | 'observation'
  | 'received_testimony';
export type FamiliarityProvenance =
  | { kind: 'event'; id: EventId }
  | { kind: 'record'; id: RecordId };

export interface RelationshipFamiliarityEpisode {
  id: string;
  observerPersonId: PersonId;
  subjectPersonId: PersonId;
  acquisitionMode: FamiliarityAcquisitionMode;
  interactionKind: string;
  occasionId: string;
  matterId?: MatterId;
  contextId: string;
  stageContribution: RelationshipFamiliarityStage;
  dayNumber: number;
  provenance: FamiliarityProvenance[];
}

export type RelationshipFamiliarityEpisodeMap = Record<string, RelationshipFamiliarityEpisode>;

const STAGE_ORDER: Record<RelationshipFamiliarityStage, number> = {
  recognized: 1,
  acquainted: 2,
  familiar: 3,
};

const ACQUISITION_MODES: readonly FamiliarityAcquisitionMode[] = [
  'direct_interaction', 'shared_participation', 'observation', 'received_testimony',
];

/** JSON tuple serialization is unambiguous; unlike delimiter concatenation it cannot alias IDs. */
export function relationshipFamiliarityEpisodeId(
  observerPersonId: PersonId,
  subjectPersonId: PersonId,
  occasionId: string,
  interactionKind: string,
): string {
  return `familiarity:${JSON.stringify([observerPersonId, subjectPersonId, occasionId, interactionKind])}`;
}

export function isRelationshipFamiliarityEpisode(
  value: unknown,
  refs?: {
    people?: Readonly<Record<string, unknown>>;
    events?: Readonly<Record<string, unknown>>;
    records?: Readonly<Record<string, unknown>>;
    matters?: Readonly<Record<string, unknown>>;
    currentDay?: number;
  },
): value is RelationshipFamiliarityEpisode {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const episode = value as Record<string, unknown>;
  if (typeof episode.observerPersonId !== 'string' || !episode.observerPersonId
    || typeof episode.subjectPersonId !== 'string' || !episode.subjectPersonId
    || episode.observerPersonId === episode.subjectPersonId
    || !ACQUISITION_MODES.includes(episode.acquisitionMode as FamiliarityAcquisitionMode)
    || typeof episode.interactionKind !== 'string' || !episode.interactionKind.trim()
    || typeof episode.occasionId !== 'string' || !episode.occasionId.trim()
    || typeof episode.contextId !== 'string' || !episode.contextId.trim()
    || !Object.prototype.hasOwnProperty.call(STAGE_ORDER, String(episode.stageContribution))
    || !Number.isInteger(episode.dayNumber) || (episode.dayNumber as number) < 1
    || (refs?.currentDay !== undefined && (episode.dayNumber as number) > refs.currentDay)
    || !Array.isArray(episode.provenance) || episode.provenance.length === 0) return false;
  if (episode.id !== relationshipFamiliarityEpisodeId(
    episode.observerPersonId as PersonId,
    episode.subjectPersonId as PersonId,
    episode.occasionId as string,
    episode.interactionKind as string,
  )) return false;
  if (refs?.people && (!refs.people[episode.observerPersonId] || !refs.people[episode.subjectPersonId])) return false;
  if (episode.matterId !== undefined && refs?.matters && !refs.matters[String(episode.matterId)]) return false;
  const seen = new Set<string>();
  for (const source of episode.provenance) {
    if (!source || typeof source !== 'object' || Array.isArray(source)) return false;
    const item = source as Record<string, unknown>;
    if (typeof item.id !== 'string' || !item.id || (item.kind !== 'event' && item.kind !== 'record')) return false;
    const key = `${item.kind}:${item.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    if (item.kind === 'event' && refs?.events && !refs.events[item.id]) return false;
    if (item.kind === 'record' && refs?.records && !refs.records[item.id]) return false;
  }
  return true;
}

export type AddFamiliarityEpisodeResult =
  | { ok: true; episodes: RelationshipFamiliarityEpisodeMap; inserted: boolean }
  | { ok: false; code: 'episode-invalid' | 'episode-conflict' };

function canonicalEpisodePayload(episode: RelationshipFamiliarityEpisode): string {
  const provenance = [...episode.provenance]
    .map((source) => [source.kind, source.id])
    .sort((a, b) => String(a[0]).localeCompare(String(b[0])) || String(a[1]).localeCompare(String(b[1])));
  return JSON.stringify([
    episode.observerPersonId, episode.subjectPersonId, episode.acquisitionMode, episode.interactionKind,
    episode.occasionId, episode.matterId ?? null, episode.contextId, episode.stageContribution,
    episode.dayNumber, provenance,
  ]);
}

export function addRelationshipFamiliarityEpisode(
  episodes: RelationshipFamiliarityEpisodeMap,
  episode: RelationshipFamiliarityEpisode,
  refs?: Parameters<typeof isRelationshipFamiliarityEpisode>[1],
): AddFamiliarityEpisodeResult {
  if (!isRelationshipFamiliarityEpisode(episode, refs)) return { ok: false, code: 'episode-invalid' };
  const existing = episodes[episode.id];
  if (existing) {
    return canonicalEpisodePayload(existing) === canonicalEpisodePayload(episode)
      ? { ok: true, episodes, inserted: false }
      : { ok: false, code: 'episode-conflict' };
  }
  return { ok: true, episodes: { ...episodes, [episode.id]: episode }, inserted: true };
}

/** The most advanced explicitly authored contribution wins; there is no score or count threshold. */
export function deriveRelationshipFamiliarityStage(
  episodes: Readonly<RelationshipFamiliarityEpisodeMap>,
  observerPersonId: PersonId,
  subjectPersonId: PersonId,
): RelationshipFamiliarityStage | null {
  let result: RelationshipFamiliarityStage | null = null;
  for (const episode of Object.values(episodes)) {
    if (episode.observerPersonId !== observerPersonId || episode.subjectPersonId !== subjectPersonId) continue;
    if (!result || STAGE_ORDER[episode.stageContribution] > STAGE_ORDER[result]) result = episode.stageContribution;
  }
  return result;
}

export function relationshipFamiliarityEpisodesFor(
  episodes: Readonly<RelationshipFamiliarityEpisodeMap>,
  observerPersonId: PersonId,
  subjectPersonId: PersonId,
): RelationshipFamiliarityEpisode[] {
  return Object.values(episodes)
    .filter((episode) => episode.observerPersonId === observerPersonId && episode.subjectPersonId === subjectPersonId)
    .sort((a, b) => a.dayNumber - b.dayNumber || a.id.localeCompare(b.id));
}
