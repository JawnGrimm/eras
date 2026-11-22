import type { EventId, AssignmentId, ChallengeId, InstitutionId, PersonId, SkillId } from '../state/ids';
import { ASSIGNMENT_ACTIVITY_CATALOG, validateAssignmentActivityDefinition } from '../content/assignments/northBayRoofInspection';
import { resolveOpportunityDatePolicies, validateOpportunityConsequences } from '../state/opportunityValidation';
import type {
  AssignmentActivityAggregate, AssignmentOffer, ChallengeInstance, ChallengeOutcome, ChallengeTriggerRule,
  GameAction, GameState, OpportunityActivity, OpportunityConsequences, OpportunityDeliveryChannel, TransitionResult,
} from '../state/types';

type OpportunityAction = Extract<GameAction, { type: 'PRESENT_ASSIGNMENT' | 'ACCEPT_ASSIGNMENT' | 'DECLINE_ASSIGNMENT' | 'CANCEL_ASSIGNMENT' | 'COMPLETE_ASSIGNMENT' | 'PRESENT_CHALLENGE' | 'ACCEPT_CHALLENGE' | 'DECLINE_CHALLENGE' | 'RESOLVE_CHALLENGE' }>;
const fail = (state: GameState, code: string, message: string): TransitionResult => ({ state, feedback: { kind: 'error', code, message } });
const succeed = (state: GameState, code: string, message: string): TransitionResult => ({ state, feedback: { kind: 'success', code, message } });
const finiteNonNegative = (n: number) => Number.isFinite(n) && n >= 0;
const score = (n: number) => Number.isFinite(n) && n >= 0 && n <= 100;

export function assignmentAggregateKey(employer: AssignmentOffer['employer'], category: string, commodity?: string): string {
  return [employer.kind, employer.id, category, commodity ?? ''].join('|');
}
export function addActivity(state: GameState, offer: AssignmentOffer, kind: OpportunityActivity['kind'], extra: Partial<OpportunityActivity> = {}): GameState {
  const key = assignmentAggregateKey(offer.employer, offer.category, offer.commodity);
  const old = state.opportunities.assignmentAggregates[key] ?? {
    key, employer: offer.employer, category: offer.category, commodity: offer.commodity,
    presented: 0, accepted: 0, declined: 0, nonWorkLapsed: 0, completed: 0,
  } satisfies AssignmentActivityAggregate;
  const field = kind === 'presented' ? 'presented' : kind === 'accepted' ? 'accepted' : kind === 'declined' ? 'declined' : kind === 'completed' ? 'completed' : null;
  const aggregate = field ? { ...old, [field]: old[field] + 1 } : old;
  const activity: OpportunityActivity = {
    dayNumber: state.calendar.dayNumber, kind, employerKey: key, category: offer.category,
    ...(offer.commodity ? { commodity: offer.commodity } : {}), assignmentId: offer.id, ...extra,
  };
  return { ...state, opportunities: {
    ...state.opportunities,
    assignmentAggregates: { ...state.opportunities.assignmentAggregates, [key]: aggregate },
    recentActivity: [...state.opportunities.recentActivity, activity].slice(-5),
  } };
}
function incrementNonWorkLapsed(state: GameState, offer: AssignmentOffer): GameState {
  const key = assignmentAggregateKey(offer.employer, offer.category, offer.commodity);
  const old = state.opportunities.assignmentAggregates[key];
  if (!old) return state;
  return { ...state, opportunities: { ...state.opportunities, assignmentAggregates: {
    ...state.opportunities.assignmentAggregates, [key]: { ...old, nonWorkLapsed: old.nonWorkLapsed + 1 },
  } } };
}
export function characterQualifiesForAssignment(state: GameState, offer: Pick<AssignmentOffer, 'requiredSkills'>): boolean {
  const skills = state.world.people[state.player.currentCharacterId]?.scribal?.skills ?? {};
  return Object.entries(offer.requiredSkills).every(([id, level]) => (skills[id as SkillId]?.level ?? 1) >= (level ?? 1));
}
function validChannels(channels: OpportunityDeliveryChannel[], state: GameState): boolean {
  return Array.isArray(channels) && channels.length > 0 && channels.every((c) => {
    if (!c.explanation) return false;
    if (c.kind === 'relationship') return !!state.world.people[c.personId];
    if (c.kind === 'specialization') return !!state.world.people[state.player.currentCharacterId]?.scribal?.specializations.some((s) => s.id === c.specializationId);
    if (c.kind === 'appointment') return !!state.world.appointments[c.appointmentId];
    if (c.kind === 'reputation') return ['competence','reliability','discretion','judgment'].includes(c.dimension);
    return c.kind === 'baseline_reach';
  });
}
function applyConsequences(state: GameState, effects: OpportunityConsequences | undefined): GameState | null {
  if (!effects) return state;
  if (validateOpportunityConsequences(effects, state, 'runtime')) return null;
  effects = resolveOpportunityDatePolicies(effects, state.calendar.dayNumber);
  const person = state.world.people[state.player.currentCharacterId];
  if (!person?.scribal) return null;
  const money = effects.moneyDelta ?? 0, provisions = effects.provisionsDelta ?? 0, careerXp = effects.careerXp ?? 0;
  if (![money, provisions].every(Number.isFinite) || !finiteNonNegative(person.scribal.wallet.money + money)
    || !finiteNonNegative(person.scribal.wallet.provisions + provisions) || !finiteNonNegative(careerXp)
    || !finiteNonNegative(person.scribal.careerXp + careerXp)) return null;
  let next: GameState = { ...state, world: { ...state.world, people: {
    ...state.world.people, [person.id]: { ...person, scribal: { ...person.scribal,
      careerXp: person.scribal.careerXp + careerXp,
      wallet: { ...person.scribal.wallet, money: person.scribal.wallet.money + money, provisions: person.scribal.wallet.provisions + provisions },
    } },
  } } };
  for (const change of effects.relationships ?? []) {
    if (!next.world.people[change.fromId] || !next.world.people[change.toId] || change.fromId === change.toId
      || !change.summary || Object.values(change.changes).some((n) => !Number.isFinite(n))) return null;
    const current = next.world.relationships[change.fromId]?.[change.toId];
    const dimensions = { trust: 50, respect: 50, affection: 50, resentment: 0, rivalry: 0, familiarity: 0, ...current?.dimensions };
    for (const [key, delta] of Object.entries(change.changes)) {
      const k = key as keyof typeof dimensions;
      dimensions[k] = Math.max(0, Math.min(100, dimensions[k] + delta));
    }
    const history = [...(current?.history ?? []), { id: `opportunity-${next.calendar.dayNumber}-${change.fromId}-${change.toId}-${(current?.history.length ?? 0) + 1}`, dayNumber: next.calendar.dayNumber, summary: change.summary }];
    next = { ...next, world: { ...next.world, relationships: { ...next.world.relationships,
      [change.fromId]: { ...next.world.relationships[change.fromId], [change.toId]: { dimensions, history } },
    } } };
  }
  for (const change of effects.institutionalStanding ?? []) {
    const target = next.world.people[next.player.currentCharacterId];
    if (!target?.scribal || !next.world.institutions[change.institutionId] || !Number.isFinite(change.delta)) return null;
    const current = target.scribal.institutionalStanding[change.institutionId] ?? 50;
    const value = Math.max(0, Math.min(100, current + change.delta));
    next = { ...next, world: { ...next.world, people: { ...next.world.people,
      [target.id]: { ...target, scribal: { ...target.scribal, institutionalStanding: { ...target.scribal.institutionalStanding, [change.institutionId]: value } } },
    } } };
  }
  if (effects.event) {
    const e = effects.event;
    if (!e.id || next.world.events[e.id] || !e.summary || !Number.isInteger(e.dayNumber) || e.dayNumber < 1 || e.dayNumber > next.calendar.dayNumber
      || e.personIds.some((id) => !next.world.people[id]) || e.institutionIds.some((id) => !next.world.institutions[id])
      || (e.locationId && !next.world.locations[e.locationId])) return null;
    next = { ...next, world: { ...next.world, events: { ...next.world.events, [e.id]: e } } };
  }
  if (effects.record) {
    const r = effects.record;
    if (!r.id || next.records.entries[r.id] || !r.title || !Number.isInteger(r.createdDay) || r.createdDay < 1 || r.createdDay > next.calendar.dayNumber
      || !next.world.people[r.authorPersonId] || (r.institutionId && !next.world.institutions[r.institutionId])
      || r.amendments.length !== 0 || r.sources.some((s) =>
        (s.kind === 'person' && !next.world.people[s.sourceId as PersonId])
        || (s.kind === 'institution' && !next.world.institutions[s.sourceId as InstitutionId])
        || (s.kind === 'event' && !next.world.events[s.sourceId as EventId]))
      || r.assertions.some((a) => a.sourceIds.some((id) => !r.sources.some((s) => s.id === id)))) return null;
    next = { ...next, records: { ...next.records, entries: { ...next.records.entries, [r.id]: r } } };
  }
  for (const k of effects.knowledge ?? []) {
    const holder = k.holder.kind === 'person' ? !!next.world.people[k.holder.id] : !!next.world.institutions[k.holder.id];
    const subject = k.subject.kind === 'event' ? !!next.world.events[k.subject.id] : !!next.records.entries[k.subject.id];
    if (!k.id || next.world.knowledge[k.id] || !holder || !subject || !Number.isInteger(k.learnedDay) || k.learnedDay < 1 || k.learnedDay > next.calendar.dayNumber
      || (k.sourcePersonId && !next.world.people[k.sourcePersonId])) return null;
    next = { ...next, world: { ...next.world, knowledge: { ...next.world.knowledge, [k.id]: k } } };
  }
  return next;
}

export function settleAssignmentOffers(state: GameState, workCatalog: Readonly<Record<string, { kind?: 'work' | 'tutorial' }>> = {}): GameState {
  let next = state;
  for (const offer of Object.values(state.opportunities.assignments)) {
    if (offer.status !== 'offered' || offer.expiresDay > state.calendar.dayNumber) continue;
    const activeWorkId = state.works.activeWorkId;
    const lapsedDuringMandatoryWork = activeWorkId !== null && workCatalog[activeWorkId]?.kind !== 'tutorial';
    const updated = { ...offer, status: 'lapsed' as const, lapsedDuringMandatoryWork };
    next = { ...next, opportunities: { ...next.opportunities, assignments: { ...next.opportunities.assignments, [offer.id]: updated } } };
    next = addActivity(next, offer, 'lapsed', { lapsedDuringMandatoryWork });
    if (!lapsedDuringMandatoryWork) next = incrementNonWorkLapsed(next, offer);
  }
  return next;
}

export function getChallengeDirectorContext(state: GameState) {
  return { aggregates: Object.values(state.opportunities.assignmentAggregates), recentActivity: state.opportunities.recentActivity.slice(-5) };
}
export function evaluateChallengeTriggers(state: GameState, rules: ChallengeTriggerRule[]): string[] {
  const context = getChallengeDirectorContext(state);
  return rules.filter((rule) => {
    const aggregates = context.aggregates.filter((a) => !rule.category || a.category === rule.category);
    const sum = (field: 'presented' | 'accepted' | 'declined' | 'nonWorkLapsed' | 'completed') => aggregates.reduce((n, a) => n + a[field], 0);
    if (rule.minPresented !== undefined && sum('presented') < rule.minPresented) return false;
    if (rule.minAccepted !== undefined && sum('accepted') < rule.minAccepted) return false;
    if (rule.minDeclined !== undefined && sum('declined') < rule.minDeclined) return false;
    if (rule.minNonWorkLapsed !== undefined && sum('nonWorkLapsed') < rule.minNonWorkLapsed) return false;
    if (rule.minCompleted !== undefined && sum('completed') < rule.minCompleted) return false;
    if (rule.recentKinds?.length) {
      const recent = context.recentActivity.slice(-(rule.recentWindow ?? 5)).filter((x) => !x.lapsedDuringMandatoryWork);
      if (!recent.some((x) => rule.recentKinds!.includes(x.kind) && (!rule.category || x.category === rule.category))) return false;
    }
    return true;
  }).map((rule) => rule.id);
}

export function transitionOpportunityAction(state: GameState, action: OpportunityAction): TransitionResult {
  const opportunities = state.opportunities;
  switch (action.type) {
    case 'PRESENT_ASSIGNMENT': {
      const offer = action.offer;
      if (!offer.id || opportunities.assignments[offer.id] || !offer.title || !offer.description
        || !offer.employer.id || (offer.employer.kind === 'person' ? !state.world.people[offer.employer.id as PersonId] : !state.world.institutions[offer.employer.id as InstitutionId])
        || (offer.sourceRecordId && !state.records.entries[offer.sourceRecordId]) || !offer.category || !offer.context.what || !offer.context.purpose || !Array.isArray(offer.context.who)
        || !Array.isArray(offer.context.responsibility) || !Array.isArray(offer.context.provenance)
        || (offer.activityId ? (!ASSIGNMENT_ACTIVITY_CATALOG[offer.activityId as keyof typeof ASSIGNMENT_ACTIVITY_CATALOG] || !Number.isInteger(offer.estimatedTotalAp) || (offer.estimatedTotalAp ?? 0) < 1 || offer.apCost !== undefined || offer.activityProgress !== undefined || validateAssignmentActivityDefinition(ASSIGNMENT_ACTIVITY_CATALOG[offer.activityId as keyof typeof ASSIGNMENT_ACTIVITY_CATALOG]).length > 0 || ASSIGNMENT_ACTIVITY_CATALOG[offer.activityId as keyof typeof ASSIGNMENT_ACTIVITY_CATALOG].participants.some((id) => !state.world.people[id])) : (!Number.isInteger(offer.apCost) || (offer.apCost ?? 0) < 1 || (offer.apCost ?? 0) > 6 || offer.estimatedTotalAp !== undefined || offer.activityProgress !== undefined)) || !validChannels(offer.deliveryChannels, state)
        || (offer.completionConsequences !== undefined && (!offer.completionConsequences || !!validateOpportunityConsequences(offer.completionConsequences, state, 'authoring')))
        || (offer.cancellationConsequences !== undefined && (!offer.cancellationConsequences || !!validateOpportunityConsequences(offer.cancellationConsequences, state, 'authoring')))
        || !['routine','demanding','critical'].includes(offer.difficulty)
        || !finiteNonNegative(offer.compensation.money) || !finiteNonNegative(offer.compensation.provisions)
        || !finiteNonNegative(offer.careerXpReward) || Object.values(offer.requiredSkills).some((n) => !Number.isInteger(n) || (n ?? 0) < 1 || (n ?? 0) > 10)) {
        return fail(state, 'assignment-invalid', 'The Assignment needs a complete context, valid employer, visible delivery reason, requirements, and reward values.');
      }
      const expiresDay = offer.expiresDay ?? state.calendar.dayNumber + 3;
      if (!Number.isInteger(expiresDay) || expiresDay <= state.calendar.dayNumber) return fail(state, 'assignment-expiry-invalid', 'An Assignment offer must expire after its offered day.');
      const created: AssignmentOffer = { ...offer, offeredDay: state.calendar.dayNumber, expiresDay, status: 'offered' };
      let next = { ...state, opportunities: { ...opportunities, assignments: { ...opportunities.assignments, [created.id]: created } } };
      next = addActivity(next, created, 'presented');
      return succeed(next, 'assignment-presented', 'A new Assignment reached the character.');
    }
    case 'ACCEPT_ASSIGNMENT': {
      const offer = opportunities.assignments[action.assignmentId];
      if (!offer || offer.status !== 'offered') return fail(state, 'assignment-not-offered', 'Only an offered Assignment can be accepted.');
      if (state.calendar.dayNumber >= offer.expiresDay) return fail(state, 'assignment-expired', 'This Assignment has reached its expiry day.');
      if (Object.values(opportunities.assignments).filter((x) => x.status === 'accepted' && (x.assigneePersonId ?? state.player.currentCharacterId) === state.player.currentCharacterId).length >= 2) return fail(state, 'assignment-cap-reached', 'No more than two Assignments may be active at once.');
      if (!characterQualifiesForAssignment(state, offer)) return fail(state, 'assignment-unqualified', 'The character does not meet the Assignment skill requirements. Professional rank does not substitute for those skills.');
      const activityProgress = offer.activityId ? ASSIGNMENT_ACTIVITY_CATALOG[offer.activityId as keyof typeof ASSIGNMENT_ACTIVITY_CATALOG].createInitialProgress() : undefined;
      const next = { ...state, opportunities: { ...opportunities, assignments: { ...opportunities.assignments, [offer.id]: { ...offer, ...(activityProgress ? { activityProgress } : {}), status: 'accepted', assigneePersonId: state.player.currentCharacterId } } } };
      return succeed(addActivity(next, offer, 'accepted'), 'assignment-accepted', 'The Assignment was accepted without spending AP.');
    }
    case 'DECLINE_ASSIGNMENT': {
      const offer = opportunities.assignments[action.assignmentId];
      if (!offer || offer.status !== 'offered') return fail(state, 'assignment-not-offered', 'Only an offered Assignment can be declined.');
      const next = { ...state, opportunities: { ...opportunities, assignments: { ...opportunities.assignments, [offer.id]: { ...offer, status: 'declined' } } } };
      return succeed(addActivity(next, offer, 'declined'), 'assignment-declined', 'The Assignment was declined.');
    }
    case 'CANCEL_ASSIGNMENT': {
      const offer = opportunities.assignments[action.assignmentId];
      if (!offer || offer.status !== 'accepted' || (offer.assigneePersonId ?? state.player.currentCharacterId) !== state.player.currentCharacterId) return fail(state, 'assignment-not-active', 'Only an Assignment accepted by the current character can be cancelled.');
      if (state.actionEconomy.apRemaining < 1) return fail(state, 'insufficient-ap', 'Cancelling an active Assignment costs 1 AP.');
      const effected = applyConsequences(state, offer.cancellationConsequences);
      if (!effected) return fail(state, 'assignment-cancellation-invalid', 'The scenario-defined cancellation consequences could not be applied.');
      const next = { ...effected, actionEconomy: { ...effected.actionEconomy, apRemaining: effected.actionEconomy.apRemaining - 1 },
        opportunities: { ...effected.opportunities, assignments: { ...effected.opportunities.assignments, [offer.id]: { ...offer, status: 'cancelled' } } } };
      return succeed(addActivity(next, offer, 'cancelled'), 'assignment-cancelled', 'The Assignment was cancelled; only its authored scenario consequences were applied.');
    }
    case 'COMPLETE_ASSIGNMENT': {
      const offer = opportunities.assignments[action.assignmentId];
      if (!offer || offer.status !== 'accepted' || (offer.assigneePersonId ?? state.player.currentCharacterId) !== state.player.currentCharacterId) return fail(state, 'assignment-not-active', 'Only an Assignment accepted by the current character can be completed.');
      if (offer.activityId) return fail(state, 'interactive-assignment-required', 'This Assignment must be completed through its interactive activity.');
      if (state.actionEconomy.apRemaining < (offer.apCost ?? 0)) return fail(state, 'insufficient-ap', `Completing this Assignment costs ${offer.apCost ?? 0} AP.`);
      const authored = offer.completionConsequences ?? {};
      const effects: OpportunityConsequences = { ...authored, moneyDelta: (authored.moneyDelta ?? 0) + offer.compensation.money,
        provisionsDelta: (authored.provisionsDelta ?? 0) + offer.compensation.provisions,
        careerXp: (authored.careerXp ?? 0) + offer.careerXpReward };
      const effected = applyConsequences(state, effects);
      if (!effected) return fail(state, 'assignment-outcome-invalid', 'The Assignment outcome contains invalid resource, relationship, institution, event, record, or knowledge effects.');
      const next = { ...effected, actionEconomy: { ...effected.actionEconomy, apRemaining: effected.actionEconomy.apRemaining - (offer.apCost ?? 0) },
        opportunities: { ...effected.opportunities, assignments: { ...effected.opportunities.assignments, [offer.id]: { ...offer, status: 'completed' } } } };
      return succeed(addActivity(next, offer, 'completed'), 'assignment-completed', 'The Assignment was completed and its authored compensation and consequences were applied.');
    }
    case 'PRESENT_CHALLENGE': {
      const c = action.challenge;
      if (!c.id || opportunities.challenges[c.id] || !c.title || !c.description || !c.category || !c.context.what
        || !c.context.purpose || !validChannels(c.deliveryChannels, state) || !Number.isInteger(c.apCost) || c.apCost < 1 || c.apCost > 6
        || !Array.isArray(c.choices) || !c.choices.length
        || new Set(c.choices.map((x) => x.id)).size !== c.choices.length || c.choices.some((x) => !x.id || !x.label || !x.description || !x.consequences || typeof x.consequences !== 'object' || Array.isArray(x.consequences) || !!validateOpportunityConsequences(x.consequences, state, 'authoring'))
        || (c.employer && (c.employer.kind === 'person' ? !state.world.people[c.employer.id as PersonId] : !state.world.institutions[c.employer.id as InstitutionId]))) {
        return fail(state, 'challenge-invalid', 'A Challenge needs contextual grounding, a delivery reason, and distinct authored resolution choices.');
      }
      const created: ChallengeInstance = { ...c, presentedDay: state.calendar.dayNumber, status: 'offered' };
      return succeed({ ...state, opportunities: { ...opportunities, challenges: { ...opportunities.challenges, [c.id]: created } } }, 'challenge-presented', 'A Challenge became available through the stated channel.');
    }
    case 'ACCEPT_CHALLENGE': {
      const challenge = opportunities.challenges[action.challengeId];
      if (!challenge || challenge.status !== 'offered') return fail(state, 'challenge-not-offered', 'Only an offered Challenge can be accepted.');
      const accepted = { ...challenge, status: 'accepted' as const, assigneePersonId: state.player.currentCharacterId };
      return succeed({ ...state, opportunities: { ...opportunities, challenges: { ...opportunities.challenges, [challenge.id]: accepted } } }, 'challenge-accepted', 'The Challenge was accepted by the current character without spending AP.');
    }
    case 'DECLINE_CHALLENGE': {
      const challenge = opportunities.challenges[action.challengeId];
      if (!challenge || challenge.status !== 'offered') return fail(state, 'challenge-not-offered', 'Only an offered Challenge can be declined.');
      const declined = { ...challenge, status: 'declined' as const };
      return succeed({ ...state, opportunities: { ...opportunities, challenges: { ...opportunities.challenges, [challenge.id]: declined } } }, 'challenge-declined', 'The Challenge was declined.');
    }
    case 'RESOLVE_CHALLENGE': {
      const challenge = opportunities.challenges[action.challengeId];
      if (!challenge || challenge.status !== 'accepted' || challenge.assigneePersonId !== state.player.currentCharacterId) return fail(state, 'challenge-not-active', 'Only a Challenge accepted by the current character can be resolved.');
      const choice = challenge.choices.find((x) => x.id === action.choiceId);
      if (!choice) return fail(state, 'challenge-choice-invalid', 'Select one of the authored Challenge rulings.');
      if (state.actionEconomy.apRemaining < challenge.apCost) return fail(state, 'insufficient-ap', `Resolving this Challenge costs ${challenge.apCost} AP.`);
      const effected = applyConsequences(state, choice.consequences);
      if (!effected) return fail(state, 'challenge-outcome-invalid', 'The selected ruling contains invalid resource, relationship, institution, event, record, or knowledge effects.');
      const outcome: ChallengeOutcome = { challengeId: challenge.id, title: challenge.title, category: challenge.category,
        resolvedDay: state.calendar.dayNumber, choiceId: choice.id, choiceLabel: choice.label, summary: choice.description, assigneePersonId: challenge.assigneePersonId };
      const { [challenge.id]: _removed, ...active } = effected.opportunities.challenges;
      const next = { ...effected, actionEconomy: { ...effected.actionEconomy, apRemaining: effected.actionEconomy.apRemaining - challenge.apCost },
        opportunities: { ...effected.opportunities, challenges: active,
        challengeOutcomes: [...effected.opportunities.challengeOutcomes, outcome] } };
      return succeed(next, 'challenge-resolved', 'The Challenge was resolved and moved to the permanent outcome archive.');
    }
  }
}
