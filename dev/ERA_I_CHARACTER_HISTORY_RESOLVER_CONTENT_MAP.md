# Era I Character-History Resolver Content Map

**Status:** PROPOSED — Design HQ authored; Game Director review required  
**Implementation status:** Not ready for Production until this content map is approved  
**Package version:** `era1-character-history-v1` (proposed)  
**Authority:** `docs/GDD.md`; approved character-creation decisions in `docs/design/DECISION_REGISTER.md`  
**Depends on:** `dev/CHARACTER_CREATION_ERA_I_CONTENT_SPEC.md`, `dev/CHARACTER_CREATION_DATA_CONTRACT.md`, `dev/URUK_CHARACTER_CREATION_MATRIX.md`, `dev/ERA_I_INSTITUTION_RESPONSIBILITY_MATRIX.md`, `dev/ERA_I_INSTITUTIONAL_HISTORICAL_AUDIT.md`

## 1. Purpose and boundaries

This document completes the authored mapping required by the deterministic Era I character-history resolver. It defines what each selected choice establishes: one Life Event, narrow familiarity where justified, any existing Person who participated, chronology, historical confidence, and combination rules.

It does **not** approve starting skills, attributes, XP, rank, equipment, resources, traits, ambition mechanics, relationship scores, or familiarity bonuses. It creates no NPCs, institutions, appointments, obligations, or separate tutorial variants.

The biography is presentation assembled from persisted facts. It is not the source of truth.

## 2. Governing rules

1. Persist exactly five Life Events, one for each life-history chapter. Orientation is stored only in `scribal.careerPath`.
2. Use the existing `Person` model and existing Era I NPC roster. Never create a character-creation-only NPC or duplicate a Person.
3. A participant is recorded only when the authored event names an existing Person in a consequential role. Unnamed household members and other unnamed participants remain in the summary; do not fabricate IDs for them.
4. A recommender/introducer is recorded on the professional-entry event. Shuruppak-ilu is recorded as trainer on the first-instruction event. These are separate facts.
5. Familiarity is explicit, narrow, provenance-backed exposure—not a skill, qualification, authority, relationship dimension, or hidden bonus. Biography prose alone never creates familiarity.
6. The same seed, name, five choice IDs, orientation, and package version produce the same Person, events, familiarity, participants, summaries, and opening state.
7. The four orientations remain selectable across every valid life-history combination. Orientation is context, not a class restriction or institutional appointment.

## 3. Stable content IDs and chronology

Use these semantic IDs as the authored `contentId` values. Wording/localization edits preserve an ID; a changed underlying fact requires a new ID or explicit alias. The persisted `summary` is the frozen, self-contained fallback for that resolved event.

| Event kind | Stage | Order | Confidence convention |
|---|---|---:|---|
| `origin` | `early_life` | 0 | `inferred` |
| `early_responsibility` | `youth` | 1 | `inferred` |
| `formative_experience` | `youth` | 2 | `reconstruction` |
| `professional_entry` | `transition_to_scribal_work` | 3 | `reconstruction` |
| `first_instruction` | `transition_to_scribal_work` | 4 | `reconstruction` |

**Confidence meaning:** `historicalConfidence` describes the historical support for the social/practical claim implied by this particular Life Event—not whether the fictional character exists. Broad activities such as food storage, craft production, commodity movement, measurement, tablets, and sealings may be attested; the claim that this particular person experienced them is generally inferred. A specific remembered incident, named introduction, or supervised training episode is a reconstruction. Do not upgrade an event to `attested` merely because its broad setting is attested.

## 4. Origin and responsibility mappings

Each row creates one Life Event with the listed semantic ID, confidence, and familiarity. Origin and responsibility events have no named participants in the current authored content.

### Origins — event kind `origin`, stage `early_life`, order 0

| Choice | `contentId` | Fallback summary | Familiarity |
|---|---|---|---|
| OR-01 Food and provisioning | `era1.character_history.origin.food_provisioning` | Grew up around the preparation, storage, and movement of food. | `provisioning / food_preparation_storage_distribution / observed` |
| OR-02 Fields and herds | `era1.character_history.origin.fields_herds` | Grew up around fields, animals, seasonal work, and bringing produce where it was needed. | `agriculture_pastoral / fields_herds_seasonal_produce / observed` |
| OR-03 Skilled making | `era1.character_history.origin.skilled_making` | Grew up around people shaping useful things and judging materials and workmanship. | `craft_production / materials_processing_workmanship / observed` |
| OR-04 Exchange and movement | `era1.character_history.origin.exchange_movement` | Grew up around moving goods, routes, deliveries, quantities, and handovers. | `exchange_movement / goods_routes_deliveries_handovers / observed` |

Origin familiarity is **observed**, not assisted: “grew up around” does not establish that the character performed the work. The selected origin is the strongest influence, not an exclusive household occupation or social class.

### Early responsibilities — event kind `early_responsibility`, stage `youth`, order 1

| Choice | `contentId` | Fallback summary | Familiarity |
|---|---|---|---|
| RS-01 Count or measure | `era1.character_history.responsibility.count_measure` | Was asked to count, compare, or measure things others needed to account for. | `quantities_measurement / {origin_scope}_quantities / assisted` |
| RS-02 Help with deliveries | `era1.character_history.responsibility.help_deliveries` | Helped with deliveries and learned the people, sequence, and risks between handover and arrival. | `delivery_custody / delivery_sequence_and_handover / assisted` |
| RS-03 Judge materials or quality | `era1.character_history.responsibility.judge_quality` | Learned to notice when material, workmanship, or condition did not match expectations. | `material_quality / {origin_condition_scope} / assisted` |
| RS-04 Observe a record or seal in use | `era1.character_history.responsibility.observe_record_seal` | Watched a mark, seal, token, or tablet make a transaction or responsibility recognizable. | `records_custody / mark_seal_or_record_in_use / observed` |

For RS-01, resolve `{origin_scope}` deterministically:
- OR-01: `food_provisions`
- OR-02: `agricultural_produce`
- OR-03: `materials_and_products`
- OR-04: `goods_in_movement`

For RS-03, resolve `{origin_condition_scope}` to the corresponding narrow scope: 
- OR-01: `food_or_produce_condition`
- OR-02: `agricultural_produce_condition`
- OR-03: `craft_material_or_workmanship_condition`
- OR-04: `goods_in_transit_condition`

All four origins may combine with all four responsibilities. “Best origins” in the source content are narrative affinities, not eligibility gates. Where a combination is less typical, personalize the explanatory sentence; do not remove the choice or imply an impossible causal link.

## 5. Formative-experience mappings

All formative events use stage `youth`, order 2, and confidence `reconstruction`. They do not create permanent traits, relationship scores, obligations, or appointments.

| Choice | `contentId` | Compatibility | Familiarity |
|---|---|---|---|
| FE-01 A quantity did not match | `era1.character_history.formative.quantity_mismatch` | RS-01 or RS-02 only | RS-01: `quantities_measurement / discrepancy_in_selected_context / observed`. RS-02: `delivery_custody / delivery_mismatch_or_delay / observed`. |
| FE-02 You were blamed unfairly | `era1.character_history.formative.unfair_blame` | Any responsibility | None. Record the remembered accusation; do not identify a culprit or create resentment. |
| FE-03 You helped settle a disagreement | `era1.character_history.formative.settled_disagreement` | RS-01, RS-02, or RS-03 | `account_comparison / {responsibility_scope} / assisted`. |
| FE-04 You were trusted with an adult responsibility | `era1.character_history.formative.adult_responsibility` | Any responsibility | None. Record the burden of being relied upon; do not grant a positive relationship score. |

Resolve FE-03 `{responsibility_scope}` as follows:
- RS-01: `quantity_accounts`
- RS-02: `delivery_handover_accounts`
- RS-03: `material_condition_accounts`

Contextual summary rules:
- FE-01 + RS-01 describes a quantity that did not match what had been counted or measured. FE-01 + RS-02 describes a delayed or uncertain handover whose quantity/timing did not match expectations. Neither identifies fraud or a culprit.
- FE-02 names no accuser unless an existing authored scenario explicitly does so. The current creator does not.
- FE-03 describes the character helping establish what two people had actually seen, counted, received, or promised. It is not a court, formal legal office, or modern contract.
- FE-04 ties the responsibility to the selected RS option without inventing the identity of the person who entrusted it.

For FE-01 + RS-01, `discrepancy_in_selected_context` is a **literal scopeId**, shared across the selected provisioning/quantity context; it does not expand by origin. The familiarity from FE-01 is only **observed**; the event does not say the character reconciled the discrepancy. FE-03 is **assisted** because the selected choice explicitly says the character helped establish the competing accounts.

## 6. Professional-entry routes and existing Person mapping

All routes lead to supervised instruction by Shuruppak-ilu. The professional-entry event uses stage `transition_to_scribal_work`, order 3, and confidence `reconstruction`. Record one existing Person participant with the role shown below. Do not add Shuruppak-ilu here; his trainer role belongs to the first-instruction event.

| Choice | `contentId` | Participant role | Contact resolution |
|---|---|---|---|
| EN-01 Someone introduced you | `era1.character_history.entry.someone_introduced` | `introducer` | Use the EN-01 mapping below. |
| EN-02 Your work earned a recommendation | `era1.character_history.entry.work_recommendation` | `recommender` | Use the EN-02 mapping below. |
| EN-03 You were needed as an assistant | `era1.character_history.entry.assistant_needed` | `sponsor` | Use the EN-03 mapping below. |
| EN-04 An encounter opened a door | `era1.character_history.entry.encounter_opened_door` | `professional_contact` | Resolve from FE + RS using the EN-04 mapping below. |

### EN-01 — introducer

| Earlier responsibility | Introducer |
|---|---|
| RS-01 Count or measure | Ur-Nanna |
| RS-02 Help with deliveries | Enlil-kisu |
| RS-03 Judge materials or quality | Ur-gir |
| RS-04 Observe a record or seal | OR-01/OR-02: Ur-Nanna; OR-03: Ur-gir; OR-04: Enlil-kisu |

This resolves the existing profile examples: Ur-gir for the materials-conscious profile and Enlil-kisu for the delivery-connected profile. Ur-Nanna remains the storehouse route for provisioning/counting. The selected person introduces the character; Shuruppak-ilu provides the instruction.

### EN-02 — recommender

| Earlier responsibility | Recommender |
|---|---|
| RS-01 Count or measure | Ur-Nanna |
| RS-02 Help with deliveries | Enlil-kisu |
| RS-03 Judge materials or quality | Utu-mansum, in his receiving/condition context |
| RS-04 Observe a record or seal | OR-01/OR-02: Ur-Nanna; OR-03: Ur-gir; OR-04: Enlil-kisu |

The recommender must have a credible basis to have noticed the responsibility. Utu-mansum is used for RS-03 because his existing role concerns incoming quantity and condition. Nin-kasi is **not** a default contact: use that Person only if a future authored choice explicitly establishes the relevant brewing-house goods or delivery context. No current choice does so.

### EN-03 — assistant sponsor

Use the same responsibility-to-context mapping as EN-02. The participant is the person or existing official who brings the character into the relevant work context. This is a reconstructed opportunity to assist, not a modern recruitment process, guaranteed employment contract, appointment, or debt.

### EN-04 — encounter contact

Resolve the contact using the same mapping as EN-02, with the formative experience explaining the encounter:
- FE-01: Ur-Nanna for RS-01; Enlil-kisu for RS-02.
- FE-03: Ur-Nanna for RS-01; Enlil-kisu for RS-02; Utu-mansum for RS-03.
- FE-02 or FE-04: use the responsibility mapping in EN-02; the encounter is described without asserting that the contact caused the blame or granted the responsibility.

For RS-04, use the origin-specific mapping in the EN-02 table. The event may say that the encounter arose from observing a record/seal in the relevant context; it must not imply the character could read proto-cuneiform or apply an official seal.

### Participant and relationship limits

- Participant roles are factual event roles, not relationship scores.
- Do not translate recommender into patron, sponsor into employer, introducer into friend, or trainer into authority beyond Shuruppak-ilu's established Senior Scribe role.
- Do not infer trust, respect, affection, resentment, rivalry, or obligation.
- Do not create duplicate people. If a Person is already referenced elsewhere in the same character history, reuse the same Person ID.
- The opening tutorial still uses Ur-Nanna as primary reader/client and Shuruppak-ilu as supervisor for every orientation.

## 7. First-instruction mappings

All instruction events use stage `transition_to_scribal_work`, order 4, confidence `reconstruction`, and one participant: Shuruppak-ilu with role `trainer`.

| Choice | `contentId` | Fallback summary | Familiarity |
|---|---|---|---|
| TR-01 Quantities and commodity notation | `era1.character_history.instruction.quantities_commodity_notation` | Under Shuruppak-ilu's supervision, practiced recording barley quantities and beer vessels or ingredients using their respective commodity-specific notations. | Two familiarity facts: `quantities_measurement / barley_quantity_notation / practiced_under_instruction` and `quantities_measurement / beer_vessel_and_ingredient_notation / practiced_under_instruction`. |
| TR-02 Clay, stylus, and tablet preparation | `era1.character_history.instruction.clay_stylus_tablet` | Under Shuruppak-ilu's supervision, practiced preparing clay and tablets and handling a stylus to make legible marks. | `material_preparation / clay_tablet_and_stylus_handling / practiced_under_instruction` |
| TR-03 Signs and category lists | `era1.character_history.instruction.signs_categories` | Under Shuruppak-ilu's supervision, practiced recognizing and reproducing a limited set of signs and categories. | `early_signs_categories / limited_practiced_sign_set / practiced_under_instruction` |
| TR-04 Checking and organizing records | `era1.character_history.instruction.check_organize_records` | Under Shuruppak-ilu's supervision, practiced comparing and organizing a narrow set of related entries. | `account_comparison / {responsibility_scope} / practiced_under_instruction` |

Resolve TR-04 `{responsibility_scope}` as follows:
- RS-01: `quantity_accounts`
- RS-02: `delivery_handover_accounts`
- RS-03: `material_condition_accounts`
- RS-04: `marked_and_sealed_records`

FE-03 remains restricted to RS-01, RS-02, and RS-03. RS-04's TR-04 scope is specific to comparing and organizing marked/sealed records; it does not imply that the character could read proto-cuneiform or apply an official seal. If FE-03 and TR-04 share the same `(domainId, scopeId)`, merge them into one familiarity record, retain `practiced_under_instruction`, and preserve both Life Event IDs in `basisLifeEventIds`.

TR-01 deliberately uses barley and beer as two separately scoped commodity contexts. Late Uruk proto-cuneiform administrative texts document barley/grain accounting and beer deliveries, vessels, and ingredients; the records use commodity-dependent numerical notations rather than one context-free system. Keep these as two familiarity records, not one merged 'grain and beer' skill. The specific supervised lesson is a fictional reconstruction, not an attested curriculum. The character learns only the narrow notation/measurement contexts authored for those commodities—not universal numeracy. Beer is an in-world commodity only, never a third player balance. Do not teach unsupported numerical values or claim one universal system.

TR-03 may draw on the attested existence of archaic lexical lists and early sign use, but this specific supervised instruction episode is reconstructed. Do not present it as a standardized school curriculum or comprehensive literacy.

## 8. Orientation mapping — no additional Life Event

The selected orientation is stored only in `scribal.careerPath`. It adds no Life Event, familiarity, participant, relationship score, affiliation, appointment, qualification, or exclusive access.

| Orientation | Era I framing | Opening constraint |
|---|---|---|
| Government | Interest in institutional administration, storage, distribution, labor, and coordination. | No office, storehouse authority, command, or exclusive access. |
| Religious | Interest in sacred practice and the responsibilities that support it; sacred and economic administration may overlap. | No priestly title, ritual authority, or invented Anu/Kullaba archive. |
| Merchant | Interest in exchange, procurement, delivery, and counterparties. | No private merchant house, ownership of goods, or commercial authority. |
| Military | Local gloss: Security and Mobilization; interest in custody, protection, organized movement, and coordination under risk. | Low-confidence Era I framing; no standing army, military bureaucracy, soldier identity, combat skill, military rank, or appointment. |

Orientation may change the final biography's closing paragraph and likely professional context. It must not rewrite the five earlier events or make the character's past contradict the selected choices. Government and Religious remain overlapping contexts; Merchant and Military are not exclusive institutions.

## 9. Compatibility and deterministic resolution

Legal combinations:
- All 4 origins × all 4 responsibilities.
- FE-01 only with RS-01 or RS-02.
- FE-02 and FE-04 with any responsibility.
- FE-03 only with RS-01, RS-02, or RS-03.
- All 4 entry routes and all 4 instruction choices remain available for every valid origin/responsibility/formative combination.
- All 4 orientations remain available for every valid life-history combination.

This yields 3,328 valid complete combinations before name input. The resolver must validate compatibility as authored data, not encode career-path restrictions. The four curated profiles in the persistent data contract remain regression fixtures, not the only valid builds.

Deterministic resolution order:
1. Validate the five choice IDs and the RS/FE compatibility pair.
2. Resolve one Life Event per chapter using the stable content IDs, stages, and orders above.
3. Resolve the entry-route participant from the tables above; confirm the Person exists in the opening roster.
4. Add Shuruppak-ilu as trainer to the first-instruction event; confirm the Person exists.
5. Derive only the familiarity facts explicitly listed above.
6. Merge by `(domainId, scopeId)`, promote only to the strongest justified exposure, and retain every unique supporting Life Event ID.
7. Store the five choice IDs and package version in `characterCreation`; store orientation only in `scribal.careerPath`.
8. Compose the biography from authored content. Persist each event's self-contained fallback summary.
9. Initialize the common opening/tutorial using the active created Person ID.

Do not infer exact age or set `ageYears`; use the approved apprentice life stage. Do not create household NPCs, simulate childhood, grant numerical benefits, or use runtime generative AI.

## 10. Required QA and acceptance

- All 20 choice IDs resolve to exactly one authored semantic content definition.
- Every valid combination resolves to exactly five Life Events with unique deterministic IDs and orders 0–4.
- Every invalid RS/FE pair is rejected before initialization; no option is silently substituted.
- All 3,328 valid combinations resolve without missing content, missing Person references, or contradictory causal wording.
- The four curated profiles A–D in `CHARACTER_CREATION_DATA_CONTRACT.md` reproduce their specified recommender/trainer mapping and narrow familiarity.
- Familiarity merge preserves all supporting event IDs and never downgrades exposure.
- No choice creates skill levels, skill XP, Career XP, Historical Progress XP, rank, appointment, qualification, specialization, attribute values, money, provisions, stress, equipment, traits, ambition, authority, or obligations.
- New games contain no `person-enlil-barni`; legacy saves retain their saved character unchanged.
- All orientations receive identical Storehouse Reckoning objective evidence, required fields, authority, assessment criteria, and tutorial progression treatment.
- Missing/retired content uses the persisted summary fallback; old optional history remains valid under the existing save contract.

## 11. Dependencies intentionally left open

This map does not settle:
- the era-appropriate name catalogue or custom-name validation;
- numerical starting attributes, skills, XP, rank, resources, equipment, stress, or reputation;
- trait definitions/effects or ambition mechanics;
- numerical relationship baselines;
- mechanical effects of familiarity;
- save-schema changes or technical ID formats.

The content specification's earlier reference to “one or two specific commodities” is made concrete here as grain and beer for TR-01. This is a content proposal grounded in the Era I institutional research; it does not imply a player beer balance or teach exact metrological values. Historical Research should verify the final player-facing commodity examples before this package is approved.

## 12. Source basis and limitations

This map follows the current Era I authored content and persistence contracts, especially their confidence convention, existing NPC roles, four curated profiles, and explicit familiarity merge rules. Historical constraints are drawn from:
- `dev/ERA_I_INSTITUTIONAL_HISTORICAL_AUDIT.md`: administrative commodity records, contextual numerical systems, early lexical lists, seals/custody, and limits on claims about military organization and formal training.
- `dev/ERA_I_INSTITUTION_RESPONSIBILITY_MATRIX.md`: Eanna administrative context, agricultural/pastoral provisioning, craft/processing, exchange networks, and the existing cast's responsibility boundaries.
- Hans J. Nissen, “Uruk: Early Administration Practices and the Development of Proto-Cuneiform Writing,” *Archéo-Nil* 26 (2016), pp. 33–48.
- Peter Damerow, “Sumerian Beer: The Origins of Brewing Technology in Ancient Mesopotamia,” *Cuneiform Digital Library Journal* 2012:2. The article identifies Late Uruk proto-cuneiform documentation (3200–3000 BCE) for beer in centralized production/distribution and distinguishes administrative records of raw materials, amounts, and transactions from reconstructions of brewing practice.
- Salvatore F. Monaco, “Unusual Accounting Practices in Archaic Mesopotamian Tablets,” *Cuneiform Digital Library Journal* 2005:1. The article documents commodity-dependent grain-product accounting and examples in which grain products/beer ingredients use distinct numerical systems.
- Digital Corpus of Cuneiform Lexical Texts, “The Archaic Administrative Corpus.”

This is a targeted content map, not a new historical monograph. It distinguishes attested broad practices from inferred personal contexts and reconstructed individual experiences. It does not claim that any fictional Life Event is an excavated biography.
