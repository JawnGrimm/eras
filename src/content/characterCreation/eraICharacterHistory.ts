import type { PersonId } from '../../state/ids';
import { ERA_I_CHARACTER_CREATION_CONTENT_VERSION, ERA_I_CHARACTER_HISTORY_DEPENDENCY_VERSION } from '../../state/eraICharacterStartingState';
import type {
  CharacterCreationRecord,
  FamiliarityExposure,
  Person,
  PersonFamiliarity,
  PersonLifeEvent,
} from '../../state/types';

export const ERA_I_CHARACTER_HISTORY_CONTENT_VERSION = ERA_I_CHARACTER_HISTORY_DEPENDENCY_VERSION;

export type EraIOriginId = 'OR-01' | 'OR-02' | 'OR-03' | 'OR-04';
export type EraIResponsibilityId = 'RS-01' | 'RS-02' | 'RS-03' | 'RS-04';
export type EraIFormativeExperienceId = 'FE-01' | 'FE-02' | 'FE-03' | 'FE-04';
export type EraIEntryRouteId = 'EN-01' | 'EN-02' | 'EN-03' | 'EN-04';
export type EraIInstructionId = 'TR-01' | 'TR-02' | 'TR-03' | 'TR-04';

export interface EraICharacterHistoryChoices {
  originId: EraIOriginId;
  responsibilityId: EraIResponsibilityId;
  formativeExperienceId: EraIFormativeExperienceId;
  entryRouteId: EraIEntryRouteId;
  instructionId: EraIInstructionId;
}

export interface ResolveEraICharacterHistoryInput {
  personId: PersonId;
  choices: EraICharacterHistoryChoices;
  people: Readonly<Record<string, Person>>;
}

export interface ResolvedEraICharacterHistory {
  characterCreation: CharacterCreationRecord;
  lifeEvents: PersonLifeEvent[];
  familiarities: PersonFamiliarity[];
}

type FamiliarityDraft = Omit<PersonFamiliarity, 'id' | 'basisLifeEventIds'> & { basisLifeEventId: string };

const ORIGINS: Record<EraIOriginId, {
  contentId: string; summary: string; domainId: string; scopeId: string;
}> = {
  'OR-01': { contentId: 'era1.character_history.origin.food_provisioning', summary: 'Grew up around the preparation, storage, and movement of food.', domainId: 'provisioning', scopeId: 'food_preparation_storage_distribution' },
  'OR-02': { contentId: 'era1.character_history.origin.fields_herds', summary: 'Grew up around fields, animals, seasonal work, and bringing produce where it was needed.', domainId: 'agriculture_pastoral', scopeId: 'fields_herds_seasonal_produce' },
  'OR-03': { contentId: 'era1.character_history.origin.skilled_making', summary: 'Grew up around people shaping useful things and judging materials and workmanship.', domainId: 'craft_production', scopeId: 'materials_processing_workmanship' },
  'OR-04': { contentId: 'era1.character_history.origin.exchange_movement', summary: 'Grew up around moving goods, routes, deliveries, quantities, and handovers.', domainId: 'exchange_movement', scopeId: 'goods_routes_deliveries_handovers' },
};

const ORIGIN_QUANTITY_SCOPES: Record<EraIOriginId, string> = {
  'OR-01': 'food_provisions',
  'OR-02': 'agricultural_produce',
  'OR-03': 'materials_and_products',
  'OR-04': 'goods_in_movement',
};
const ORIGIN_CONDITION_SCOPES: Record<EraIOriginId, string> = {
  'OR-01': 'food_or_produce_condition',
  'OR-02': 'agricultural_produce_condition',
  'OR-03': 'craft_material_or_workmanship_condition',
  'OR-04': 'goods_in_transit_condition',
};
const RESPONSIBILITY_SCOPES: Record<EraIResponsibilityId, string> = {
  'RS-01': 'quantity_accounts',
  'RS-02': 'delivery_handover_accounts',
  'RS-03': 'material_condition_accounts',
  'RS-04': 'marked_and_sealed_records',
};

const RESPONSIBILITIES: Record<EraIResponsibilityId, {
  contentId: string; summary: string; domainId: string; scopeId: (origin: EraIOriginId) => string; exposure: FamiliarityExposure;
}> = {
  'RS-01': {
    contentId: 'era1.character_history.responsibility.count_measure',
    summary: 'Was asked to count, compare, or measure things others needed to account for.',
    domainId: 'quantities_measurement',
    scopeId: (origin) => `${ORIGIN_QUANTITY_SCOPES[origin]}_quantities`,
    exposure: 'assisted',
  },
  'RS-02': {
    contentId: 'era1.character_history.responsibility.help_deliveries',
    summary: 'Helped with deliveries and learned the people, sequence, and risks between handover and arrival.',
    domainId: 'delivery_custody',
    scopeId: () => 'delivery_sequence_and_handover',
    exposure: 'assisted',
  },
  'RS-03': {
    contentId: 'era1.character_history.responsibility.judge_quality',
    summary: 'Learned to notice when material, workmanship, or condition did not match expectations.',
    domainId: 'material_quality',
    scopeId: (origin) => ORIGIN_CONDITION_SCOPES[origin],
    exposure: 'assisted',
  },
  'RS-04': {
    contentId: 'era1.character_history.responsibility.observe_record_seal',
    summary: 'Watched a mark, seal, token, or tablet make a transaction or responsibility recognizable.',
    domainId: 'records_custody',
    scopeId: () => 'mark_seal_or_record_in_use',
    exposure: 'observed',
  },
};

const FORMATIVE_CONTENT: Record<EraIFormativeExperienceId, string> = {
  'FE-01': 'era1.character_history.formative.quantity_mismatch',
  'FE-02': 'era1.character_history.formative.unfair_blame',
  'FE-03': 'era1.character_history.formative.settled_disagreement',
  'FE-04': 'era1.character_history.formative.adult_responsibility',
};

const ENTRY_CONTENT: Record<EraIEntryRouteId, string> = {
  'EN-01': 'era1.character_history.entry.someone_introduced',
  'EN-02': 'era1.character_history.entry.work_recommendation',
  'EN-03': 'era1.character_history.entry.assistant_needed',
  'EN-04': 'era1.character_history.entry.encounter_opened_door',
};

const INSTRUCTION_CONTENT: Record<EraIInstructionId, { contentId: string; summary: string }> = {
  'TR-01': {
    contentId: 'era1.character_history.instruction.quantities_commodity_notation',
    summary: 'Under Shuruppak-ilu’s supervision, practiced recording barley quantities and beer vessels or ingredients using their respective commodity-specific notations.',
  },
  'TR-02': {
    contentId: 'era1.character_history.instruction.clay_stylus_tablet',
    summary: 'Under Shuruppak-ilu’s supervision, practiced preparing clay and tablets and handling a stylus to make legible marks.',
  },
  'TR-03': {
    contentId: 'era1.character_history.instruction.signs_categories',
    summary: 'Under Shuruppak-ilu’s supervision, practiced recognizing and reproducing a limited set of signs and categories.',
  },
  'TR-04': {
    contentId: 'era1.character_history.instruction.check_organize_records',
    summary: 'Under Shuruppak-ilu’s supervision, practiced comparing and organizing a narrow set of related entries.',
  },
};

const ENTRY_SUMMARIES: Record<EraIEntryRouteId, string> = {
  'EN-01': 'Someone who knew the character or their work introduced them to a person involved in keeping records.',
  'EN-02': 'Someone noticed how the character handled a responsibility and recommended that they be given a chance to learn.',
  'EN-03': 'A group needed a dependable assistant, and the character was brought in to learn by helping.',
  'EN-04': 'A delivery, disagreement, or other piece of work brought the character into contact with someone willing to teach them.',
};

function isChoiceId<T extends string>(value: string, choices: readonly T[]): value is T {
  return choices.includes(value as T);
}
const ORIGIN_IDS = Object.keys(ORIGINS) as EraIOriginId[];
const RESPONSIBILITY_IDS = Object.keys(RESPONSIBILITIES) as EraIResponsibilityId[];
const FORMATIVE_IDS = Object.keys(FORMATIVE_CONTENT) as EraIFormativeExperienceId[];
const ENTRY_IDS = Object.keys(ENTRY_CONTENT) as EraIEntryRouteId[];
const INSTRUCTION_IDS = Object.keys(INSTRUCTION_CONTENT) as EraIInstructionId[];

export function validateEraICharacterHistoryChoices(choices: Partial<Record<keyof EraICharacterHistoryChoices, string>>): string[] {
  const errors: string[] = [];
  if (!choices.originId || !isChoiceId(choices.originId, ORIGIN_IDS)) errors.push('Unsupported origin choice.');
  if (!choices.responsibilityId || !isChoiceId(choices.responsibilityId, RESPONSIBILITY_IDS)) errors.push('Unsupported responsibility choice.');
  if (!choices.formativeExperienceId || !isChoiceId(choices.formativeExperienceId, FORMATIVE_IDS)) errors.push('Unsupported formative-experience choice.');
  if (!choices.entryRouteId || !isChoiceId(choices.entryRouteId, ENTRY_IDS)) errors.push('Unsupported professional-entry choice.');
  if (!choices.instructionId || !isChoiceId(choices.instructionId, INSTRUCTION_IDS)) errors.push('Unsupported first-instruction choice.');
  if (choices.responsibilityId && choices.formativeExperienceId
    && isChoiceId(choices.responsibilityId, RESPONSIBILITY_IDS)
    && isChoiceId(choices.formativeExperienceId, FORMATIVE_IDS)) {
    const allowed: Record<EraIFormativeExperienceId, readonly EraIResponsibilityId[]> = {
      'FE-01': ['RS-01', 'RS-02'],
      'FE-02': RESPONSIBILITY_IDS,
      'FE-03': ['RS-01', 'RS-02', 'RS-03'],
      'FE-04': RESPONSIBILITY_IDS,
    };
    if (!allowed[choices.formativeExperienceId].includes(choices.responsibilityId)) {
      errors.push('This formative experience is not authored for the selected responsibility.');
    }
  }
  return errors;
}

function participantForEntry(
  route: EraIEntryRouteId,
  responsibility: EraIResponsibilityId,
  origin: EraIOriginId,
): PersonId {
  if (responsibility === 'RS-01') return 'person-ur-nanna' as PersonId;
  if (responsibility === 'RS-02') return 'person-enlil-kisu' as PersonId;
  if (responsibility === 'RS-03') return (route === 'EN-01' ? 'person-uruk-ur-gir' : 'person-utu-mansum') as PersonId;
  if (origin === 'OR-03') return 'person-uruk-ur-gir' as PersonId;
  if (origin === 'OR-04') return 'person-enlil-kisu' as PersonId;
  return 'person-ur-nanna' as PersonId;
}

function formativeSummary(id: EraIFormativeExperienceId, responsibility: EraIResponsibilityId): string {
  if (id === 'FE-01') {
    return responsibility === 'RS-01'
      ? 'A quantity did not match what had been counted or measured.'
      : 'A delivery handover was delayed or uncertain, and its quantity or timing did not match expectations.';
  }
  if (id === 'FE-02') return 'Was held responsible for a mistake they did not believe was theirs; the remembered accusation does not establish who was at fault.';
  if (id === 'FE-03') {
    const detail: Record<'RS-01' | 'RS-02' | 'RS-03', string> = {
      'RS-01': 'counted quantities and the accounts describing them',
      'RS-02': 'what had been handed over and what was expected to arrive',
      'RS-03': 'the condition or quality of the material being discussed',
    };
    return `Helped establish what two people had actually seen or agreed about ${detail[responsibility as 'RS-01' | 'RS-02' | 'RS-03']}.`;
  }
  const detail: Record<EraIResponsibilityId, string> = {
    'RS-01': 'counting or measuring things others needed to account for',
    'RS-02': 'helping with deliveries and handovers',
    'RS-03': 'noticing differences in material, workmanship, or condition',
    'RS-04': 'observing a mark, seal, token, or tablet in use',
  };
  return 'Someone trusted the character with ' + detail[responsibility] + ' before others thought they were ready.';
}

function event(
  personId: PersonId,
  kind: PersonLifeEvent['kind'],
  contentId: string,
  summary: string,
  stage: PersonLifeEvent['chronology']['stage'],
  order: number,
  historicalConfidence: PersonLifeEvent['historicalConfidence'],
  participants: PersonLifeEvent['participants'] = [],
): PersonLifeEvent {
  return {
    id: `life-event-${personId}-${kind}`,
    kind, contentId, summary,
    chronology: { stage, order },
    participants,
    historicalConfidence,
  };
}

function familiarityDraft(
  domainId: string,
  scopeId: string,
  exposure: FamiliarityExposure,
  basisLifeEventId: string,
): FamiliarityDraft {
  return { domainId, scopeId, exposure, basisLifeEventId };
}

const EXPOSURE_RANK: Record<FamiliarityExposure, number> = {
  observed: 0,
  assisted: 1,
  practiced_under_instruction: 2,
};

function mergeFamiliarities(drafts: FamiliarityDraft[]): PersonFamiliarity[] {
  const merged = new Map<string, PersonFamiliarity>();
  for (const draft of drafts) {
    const key = JSON.stringify([draft.domainId, draft.scopeId]);
    const existing = merged.get(key);
    if (!existing) {
      merged.set(key, {
        id: `familiarity-${draft.domainId}-${draft.scopeId}`,
        domainId: draft.domainId,
        scopeId: draft.scopeId,
        exposure: draft.exposure,
        basisLifeEventIds: [draft.basisLifeEventId],
      });
      continue;
    }
    if (EXPOSURE_RANK[draft.exposure] > EXPOSURE_RANK[existing.exposure]) existing.exposure = draft.exposure;
    if (!existing.basisLifeEventIds.includes(draft.basisLifeEventId)) existing.basisLifeEventIds.push(draft.basisLifeEventId);
  }
  return [...merged.values()];
}

export function resolveEraICharacterHistory(input: ResolveEraICharacterHistoryInput): ResolvedEraICharacterHistory {
  const { personId, choices, people } = input;
  const errors = validateEraICharacterHistoryChoices(choices);
  if (errors.length) throw new Error(errors.join(' '));
  if (!people[personId]) throw new Error(`The player Person ${personId} is not registered in the world.`);

  const origin = ORIGINS[choices.originId];
  const responsibility = RESPONSIBILITIES[choices.responsibilityId];
  const instruction = INSTRUCTION_CONTENT[choices.instructionId];
  const entryPersonId = participantForEntry(choices.entryRouteId, choices.responsibilityId, choices.originId);
  const trainerPersonId = 'person-shuruppak-ilu' as PersonId;
  for (const participantId of [entryPersonId, trainerPersonId]) {
    if (!people[participantId]) throw new Error(`Required existing participant ${participantId} is missing from the world roster.`);
  }

  const lifeEvents = [
    event(personId, 'origin', origin.contentId, origin.summary, 'early_life', 0, 'inferred'),
    event(personId, 'early_responsibility', responsibility.contentId, responsibility.summary, 'youth', 1, 'inferred'),
    event(personId, 'formative_experience', FORMATIVE_CONTENT[choices.formativeExperienceId],
      formativeSummary(choices.formativeExperienceId, choices.responsibilityId), 'youth', 2, 'reconstruction'),
    event(personId, 'professional_entry', ENTRY_CONTENT[choices.entryRouteId],
      ENTRY_SUMMARIES[choices.entryRouteId], 'transition_to_scribal_work', 3, 'reconstruction',
      [{ personId: entryPersonId, role: choices.entryRouteId === 'EN-01' ? 'introducer'
        : choices.entryRouteId === 'EN-02' ? 'recommender'
          : choices.entryRouteId === 'EN-03' ? 'sponsor' : 'professional_contact' }]),
    event(personId, 'first_instruction', instruction.contentId, instruction.summary,
      'transition_to_scribal_work', 4, 'reconstruction', [{ personId: trainerPersonId, role: 'trainer' }]),
  ];

  const drafts: FamiliarityDraft[] = [
    familiarityDraft(origin.domainId, origin.scopeId, 'observed', lifeEvents[0].id),
    familiarityDraft(responsibility.domainId, responsibility.scopeId(choices.originId), responsibility.exposure, lifeEvents[1].id),
  ];
  if (choices.formativeExperienceId === 'FE-01') {
    drafts.push(choices.responsibilityId === 'RS-01'
      ? familiarityDraft('quantities_measurement', 'discrepancy_in_selected_context', 'observed', lifeEvents[2].id)
      : familiarityDraft('delivery_custody', 'delivery_mismatch_or_delay', 'observed', lifeEvents[2].id));
  }
  if (choices.formativeExperienceId === 'FE-03') {
    drafts.push(familiarityDraft('account_comparison', RESPONSIBILITY_SCOPES[choices.responsibilityId],
      'assisted', lifeEvents[2].id));
  }
  if (choices.instructionId === 'TR-01') {
    drafts.push(familiarityDraft('quantities_measurement', 'barley_quantity_notation', 'practiced_under_instruction', lifeEvents[4].id));
    drafts.push(familiarityDraft('quantities_measurement', 'beer_vessel_and_ingredient_notation', 'practiced_under_instruction', lifeEvents[4].id));
  } else if (choices.instructionId === 'TR-02') {
    drafts.push(familiarityDraft('material_preparation', 'clay_tablet_and_stylus_handling', 'practiced_under_instruction', lifeEvents[4].id));
  } else if (choices.instructionId === 'TR-03') {
    drafts.push(familiarityDraft('early_signs_categories', 'limited_practiced_sign_set', 'practiced_under_instruction', lifeEvents[4].id));
  } else {
    drafts.push(familiarityDraft('account_comparison', RESPONSIBILITY_SCOPES[choices.responsibilityId],
      'practiced_under_instruction', lifeEvents[4].id));
  }

  return {
    characterCreation: {
      contentVersion: ERA_I_CHARACTER_CREATION_CONTENT_VERSION,
      originId: choices.originId,
      responsibilityId: choices.responsibilityId,
      formativeExperienceId: choices.formativeExperienceId,
      entryRouteId: choices.entryRouteId,
      instructionId: choices.instructionId,
    },
    lifeEvents,
    familiarities: mergeFamiliarities(drafts),
  };
}
