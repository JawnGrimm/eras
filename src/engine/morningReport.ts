import type { GameState, InstitutionalMatter } from '../state/types';

function hasKnowledge(state: GameState, matter: InstitutionalMatter): boolean {
  if (!matter.sourceRecordId) return false;
  const record = state.records.entries[matter.sourceRecordId];
  if (record?.authorPersonId === state.player.currentCharacterId) return true;
  const holdsInstitutionalAppointment = Object.values(state.world.appointments).some((appointment) =>
    appointment.personId === state.player.currentCharacterId && appointment.institutionId === matter.institutionId);
  return Object.values(state.world.knowledge).some((entry) =>
    entry.subject.kind === 'record' && entry.subject.id === matter.sourceRecordId
    && ((entry.holder.kind === 'person' && entry.holder.id === state.player.currentCharacterId)
      || (holdsInstitutionalAppointment && entry.holder.kind === 'institution' && entry.holder.id === matter.institutionId)));
}

/**
 * Produces a character-situated daily briefing from changed state, delivered offers,
 * and deadlines. It never treats the simulation's global knowledge as player knowledge.
 */
export function buildSituatedMorningReport(previous: GameState, current: GameState): GameState {
  const day = current.calendar.dayNumber;
  const id = `morning-report-day-${day}`;
  if (current.journal.notices.some((notice) => notice.id === id)) return current;

  const items: string[] = [];
  const priorMatters = previous.world.matters;
  for (const matter of Object.values(current.world.matters)) {
    const old = priorMatters[matter.id];
    const changed = !old || old.summary !== matter.summary || old.status !== matter.status
      || old.developedDay !== matter.developedDay || old.sourceEventId !== matter.sourceEventId;
    const dueToday = matter.scheduledDevelopment?.dayNumber === day && matter.status === 'active';
    if (!changed && !dueToday) continue;
    if (!hasKnowledge(current, matter)) continue;
    const institution = current.world.institutions[matter.institutionId];
    const source = matter.sourceRecordId ? current.records.entries[matter.sourceRecordId]?.title : undefined;
    const timing = dueToday ? 'Scheduled development is due today.' : '';
    items.push(`${institution?.name ?? 'Institution'}: ${matter.summary}${source ? ` Source: ${source}.` : ''} ${timing}`.trim());
  }

  const newOffers = Object.values(current.opportunities.assignments)
    .filter((offer) => offer.offeredDay === day && offer.status === 'offered');
  for (const offer of newOffers) items.push(`New Assignment reached you: ${offer.title} (estimated ${offer.estimatedTotalAp ?? offer.apCost ?? 0} AP).`);

  const commitments = Object.values(current.opportunities.assignments)
    .filter((offer) => offer.status === 'accepted' && (offer.assigneePersonId ?? current.player.currentCharacterId) === current.player.currentCharacterId
      && offer.expiresDay <= day + 1);
  for (const offer of commitments) items.push(`Commitment approaching expiry: ${offer.title} (expires Day ${offer.expiresDay}).`);

  if (items.length === 0) return current;

  const message = `Morning report · Day ${day}\n${items.map((item) => `• ${item}`).join('\n')}`;
  const notice = { id, dayNumber: day, category: newOffers.length ? 'opportunity' as const : 'world' as const, message, read: false };
  return { ...current, journal: { ...current.journal, notices: [...current.journal.notices, notice] } };
}
