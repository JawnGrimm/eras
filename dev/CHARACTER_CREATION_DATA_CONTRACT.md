# Character Creation — Persistent Data Contract

**Status:** Engineering contract for the first playable Era I character creator  
**Date:** 2026-11-23  
**Authority:** `docs/GDD.md` is canonical for approved game design. This document translates the approved Era I character-creation content and flow into a minimum persistence and initialization contract.  
**Depends on:** `dev/CHARACTER_CREATION_ERA_I_CONTENT_SPEC.md`, `dev/CHARACTER_CREATION_PLAYER_FLOW.md`, `dev/URUK_CHARACTER_CREATION_MATRIX.md`  
**Scope:** Persistent Person history, domain familiarity, choice provenance, deterministic identity initialization, opening-world integration, and save compatibility.  
**Out of scope:** Numerical starting attributes/skills/XP/rank, trait catalog or effects, ambition mechanics, a full life simulation, succession redesign, and character-creation UI implementation.

---

## 1. Purpose and governing principle

Character creation establishes a person who already exists in the shared world. It must not create a detached avatar or a biography string that has no relationship to the simulation state.

The resolver takes the player's authored choices and identity input, then initializes the existing `Person` model with:

- a stable identity and the approved Era I professional orientation;
- a concise, ordered set of authored Life Events;
- narrow, evidence-based domain familiarity derived from those events;
- references to existing people who participated in the character's history;
- only those relationship facts and dimensions justified by authored interactions;
- the opening context needed for the common Era I tutorial.

The biography is a presentation assembled from those persistent facts. It is not the source of truth.

Character creation is deterministic world initialization, not a simulation of the character's entire childhood. It consumes no AP, awards no Career XP or Historical Progress XP, advances no time, and grants no unapproved mechanical benefits.

## 2. Decisions this contract records

The following decisions are approved for this contract:

1. **Enlil-barni is replaced as the new-game protagonist.** A newly created game must not create `person-enlil-barni` as an NPC or use that fixed identity for the player. The created Person occupies `player.currentCharacterId`. All starter content that refers to the protagonist must resolve that person dynamically.
2. **Existing saves are not rewritten as a side effect.** A saved Enlil-barni remains the character in that save. The replacement rule applies to newly initialized games; it does not rename, delete, or demote a character in an existing save.
3. **Five life-history choices are persisted.** Origin, early responsibility, formative experience, entry route, and first instruction each have a selected authored choice ID. Professional orientation remains in the existing `scribal.careerPath` field and is not duplicated in the creation record.
4. **The four complete biographies are curated QA fixtures, not classes or fixed templates.** They demonstrate coherent combinations across the five life-history choices and one of the four orientations. They do not limit the player to four builds.
5. **Authored content IDs are stable semantic identifiers.** The ID identifies the authored fact; prose may be edited or localized without changing the ID. Retired IDs must remain resolvable through an alias or archived definition.
6. **Life-event summary text is a frozen fallback snapshot.** The composer normally resolves current authored prose from `contentId`. The persisted summary is used if that content cannot be resolved; it is not the normal display source.
7. **Life-event chronology has a typed life stage and explicit integer order.** Display strings are not sort keys and no exact date is implied.
8. **Familiarity is merged by `(domainId, scopeId)`.** The strongest justified exposure is retained and its supporting Life Event IDs are accumulated without duplication.
9. **Life Events and familiarity are independent optional Person fields.** Neither requires a `CharacterCreationRecord`, allowing NPCs and future successors to have authored or accumulated histories without having passed through player character creation.
10. **No numerical starting-state model is approved here.** This contract does not assign skills, attributes, Career XP, money, provisions, stress, traits, rank, appointments, qualifications, or specializations.

## 3. Current architecture and integration boundary

The inspected production model already provides the required shared identity boundary:

- `Person` is the identity model for player characters and NPCs.
- `GameState.player.currentCharacterId` identifies the active player character.
- `Person.scribal.careerPath` retains the existing persisted values `government | military | religious | merchant`.
- Player-facing labels map to those values as follows: `government` → Civic, `religious` → Religious, `merchant` → Commercial, and `military` → Martial. This is a display/content terminology change, not a save-schema or identifier migration.
- `Person` already supports life stage, social identity, circumstances, objectives, commitments, affiliations, location, and optional scribal state.
- `world.relationships[fromId][toId]` is directional; the reverse perspective is stored separately.
- The save validator's `isPersonProfile` function validates the existing optional Person profile fields.
- The current production bootstrap still creates a fixed Enlil-barni Person and embeds that identity in opening content. This must be generalized as part of later integration.

The current `Person` type has an optional `ageYears` field. The approved character-creation content does not establish a starting age or age range. Do not invent one in the resolver. Unless a separate authored age decision is approved, leave `ageYears` unset and use the approved apprentice life stage.

`PersonCircumstance` describes a current or ongoing situation. It is not a substitute for a durable past Life Event. `WorldEvent` describes an event in the shared world timeline and is not a suitable container for every pre-game personal experience. Do not create fake Day 1 world events for childhood or pre-career events.

## 4. Persistent TypeScript contract

The following is the target domain shape. Names may be adjusted to match repository conventions during implementation, but semantics and invariants must remain unchanged.

```ts
export type LifeEventKind =
  | 'origin'
  | 'early_responsibility'
  | 'formative_experience'
  | 'professional_entry'
  | 'first_instruction';

export type LifeEventStage =
  | 'early_life'
  | 'youth'
  | 'transition_to_scribal_work';

export type HistoricalConfidence =
  | 'attested'
  | 'inferred'
  | 'reconstruction';

export interface PersonLifeEventParticipant {
  personId: PersonId;
  role: string;
}

export interface PersonLifeEvent {
  id: string;
  kind: LifeEventKind;
  /** Stable authored semantic ID, not a prose key that may be casually renamed. */
  contentId: string;
  /** Frozen source-language fallback; not the normal biography display source. */
  summary: string;
  chronology: {
    stage: LifeEventStage;
    /** Explicit order within this Person's life history; not a calendar date. */
    order: number;
  };
  participants: PersonLifeEventParticipant[];
  historicalConfidence: HistoricalConfidence;
}

export type FamiliarityExposure =
  | 'observed'
  | 'assisted'
  | 'practiced_under_instruction';

export interface PersonFamiliarity {
  id: string;
  domainId: string;
  /** Stable authored scope identifier; avoid using mutable display prose as a key. */
  scopeId: string;
  exposure: FamiliarityExposure;
  basisLifeEventIds: string[];
}

export interface CharacterCreationRecord {
  contentVersion: string;
  originId: string;
  responsibilityId: string;
  formativeExperienceId: string;
  entryRouteId: string;
  instructionId: string;
}
```

Add these as independent optional fields on `Person`:

```ts
characterCreation?: CharacterCreationRecord;
lifeEvents?: PersonLifeEvent[];
familiarities?: PersonFamiliarity[];
```

### 4.1 Field ownership

- `characterCreation` preserves the five selected life-history choice IDs and the authored content version used to resolve them.
- `scribal.careerPath` remains the single authoritative orientation value. Do not duplicate it in `CharacterCreationRecord`.
- `lifeEvents` stores durable personal-history facts and their participant references.
- `familiarities` stores the current merged familiarity facts and their provenance.
- Name, life stage, social identity, location, affiliations, and scribal state remain ordinary `Person` fields. Do not create a parallel avatar or identity object.
- Traits and ambition remain inactive placeholders. Do not add placeholder trait IDs, ambitions, objectives, or mechanical modifiers.

### 4.2 Life Event semantics

A Life Event is a concise, durable fact about the Person's past that helps explain their present relationships, familiarity, or professional context. It is not a transcript of every routine childhood activity.

The five event kinds map to the five life-history choice chapters. The professional orientation is not itself a Life Event. A recommender, introducer, or trainer is represented as a participant with a role in the relevant event; do not create a second relationship graph solely for the creator.

Use one event per authored chapter in the initial Era I resolver unless an authored option explicitly requires otherwise. Event IDs must be deterministic and unique within the Person, for example from the Person ID and event kind. Do not use random IDs or wall-clock values.

The participant list must reference existing `Person` records. A participant role describes what that person did in this event (for example, `recommender`, `introducer`, or `trainer`); it does not itself grant authority or a numerical relationship score.

The `historicalConfidence` field preserves the content specification's Attested / Inferred / Reconstruction distinction. It is authoring metadata, not a player-facing scholarly disclaimer. Do not silently upgrade confidence because an authored fragment is reused in several biographies.

### 4.3 Chronology

`chronology.stage` is a broad relative life stage, not a claim about a specific age. `chronology.order` is the authoritative sort key and must be a non-negative integer. Order values must be unique within a Person's Life Event collection.

The initial resolver should use a stable order consistent with the selected chapter sequence. Later gameplay-added Life Events may be inserted using deterministic order allocation; they must not require sorting display labels or parsing prose. Do not imply that the relative order establishes an exact year or age.

### 4.4 Summary and content-version behavior

The biography composer must resolve a Life Event's current player-facing prose from `contentId` and the active locale. The persisted `summary` is a fallback snapshot only.

Content maintenance rules:

1. Editing wording or translating an existing event does not change its `contentId`.
2. A content edit that changes the underlying fact or meaning requires a new `contentId`; do not silently reinterpret old saves.
3. A retired ID must remain resolvable through an explicit alias or archived definition. If neither is available, the composer displays the persisted `summary`.
4. `contentVersion` records the authored package version used at creation. It is provenance, not a command to freeze all future prose or force the player to replay creation.
5. Never discard an old Life Event because its content version is no longer current.
6. The summary fallback should be readable and self-contained. It must not contain unsupported claims that are absent from the event's authored meaning.

This gives current content and localization control over normal presentation while ensuring old saves retain a readable account if content resolution fails.

## 5. Familiarity contract

Domain familiarity represents specific exposure to a practice, material, process, or context. It is not a skill level, specialization, qualification, authority, attribute, relationship dimension, or hidden bonus.

### 5.1 Exposure levels

The levels are qualitative and ordered:

1. `observed` — the Person witnessed the practice or its use.
2. `assisted` — the Person took part in the activity.
3. `practiced_under_instruction` — the Person practiced the activity under supervision or instruction.

These labels describe the basis of experience. They do not imply mastery or independent competence.

### 5.2 Merge rule

The resolver merges familiarity records by the composite key `(domainId, scopeId)`.

When a new Life Event establishes familiarity for an existing key:

- retain one record for that key;
- promote `exposure` only if the new event supports a higher exposure level;
- append the supporting Life Event ID to `basisLifeEventIds` if it is not already present;
- preserve all earlier supporting IDs;
- do not create duplicate rows for the same key.

The exposure ordering is `observed < assisted < practiced_under_instruction`. A lower later exposure never downgrades a stronger established exposure.

A familiarity fact is created only when an authored choice explicitly supports it. Merely mentioning a domain in biography prose is insufficient. Keep `scopeId` narrow enough to avoid turning a specific exposure (for example, handling one kind of commodity notation) into universal numeracy, broad literacy, or general accounting ability.

### 5.3 Gameplay boundary

Familiarity may later inform character-situated recognition, interpretation, confidence, or possible oversight. It must never hide, alter, or falsify objective evidence. No numerical action modifier or automatic skill benefit is authorized by this contract. Any mechanical use requires a separate approved design and GDD treatment where appropriate.

## 6. Identity and deterministic initialization

### 6.1 Identity input

The approved player flow includes an Identity screen asking what people should call the character. The intended input is a name selected from an era-appropriate authored list or entered as a custom name, subject to a separately defined naming/validation policy.

The resolver must receive a validated, non-empty name. Do not silently substitute Enlil-barni or invent a new name catalogue in engineering code. If the name catalogue or custom-name validation is not ready, that is a content/UI dependency to resolve before the creator can be considered complete.

The current content specification does not approve a starting age. Leave `ageYears` unset. Set `lifeStage` to `apprentice`, consistent with the GDD's opening premise and the authored common trainer/tutorial relationship. The resolver must not infer an age from that life stage.

### 6.2 Stable Person identity

The new-game resolver must generate a stable, collision-safe `PersonId` from deterministic new-game inputs. At minimum, the identity derivation must use the new-game seed and validated character identity input; it must not depend on wall-clock time, random runtime APIs, or iteration order over unordered objects.

The same seed, name, and authored choices must produce the same Person ID. A collision with an existing world Person must be handled deterministically and must never overwrite or duplicate an existing Person. The implementation must document its canonicalization and collision-resolution rule.

The current production bootstrap does not expose a completed character-creation boundary. If a seed is not currently available to new-game initialization, introduce it at that boundary rather than fabricating one from the current time. Persist any seed metadata needed to reproduce or audit the initialization according to the save architecture.

### 6.3 Initial Person construction

The new Person must be registered in `world.people`, and `player.currentCharacterId` must point to that Person before any opening content is initialized.

The Person uses the existing shared model. The approved identity facts are:

- validated player-selected name;
- deterministic Person ID;
- `alive: true`;
- `lifeStage: 'apprentice'`;
- opening Era I location using the existing authored location ID;
- authored social identity describing an apprentice beginning supervised scribal work;
- `scribal.careerPath` set to the selected orientation.

Age is omitted until an age decision is approved. Affiliations, appointments, authority, skills, attributes, specializations, traits, Career XP, wallet balances, stress, equipment, and reputation must come from a separately approved starting-state package. This contract does not copy Enlil-barni's current numerical state onto every created character.

The initial Person must not be granted an institutional affiliation merely because they have a recommender, trainer, or likely starting context. Add only the specific affiliation or circumstance that the authored opening explicitly supports.

### 6.4 Determinism

For identical seed, name, five choice IDs, orientation, and content version, initialization must produce identical:

- Person ID and baseline identity;
- `CharacterCreationRecord`;
- Life Event IDs, chronology, content IDs, summaries, participants, and confidence metadata;
- merged familiarity records and provenance;
- relationship facts that are explicitly supported by the authored choices;
- opening state and authored starter opportunities.

No runtime generative AI, wall-clock timestamps, nondeterministic random values, or unstable object iteration may influence the result. If deterministic random selection is ever introduced for a separately approved purpose, it must use the supplied seed and a documented deterministic algorithm.

## 7. NPC connections and relationship handling

Reuse the existing Era I roster. The current authored mapping identifies:

- Shuruppak-ilu as the common trainer and tutorial supervisor;
- Ur-Nanna as a possible recommender/contact for provisioning and institutional work;
- Enlil-kisu as a possible recommender/contact for delivery, movement, and custody;
- Nin-kasi where the selected history genuinely involves the relevant production/delivery context;
- Ur-gir as an existing scribal introducer where the biography supports that acquaintance;
- Utu-mansum as a possible intake/counting contact where appropriate;
- Nin-aya as an apprentice/peer context, not as a mentor or independent authority.

The exact participant mapping remains governed by the Era I content specification. Do not create duplicate Persons, invented mentors, or new institutions to satisfy a choice.

Relationship rules:

- Persist the relevant interaction as a Life Event with existing Person references and explicit participant roles.
- A recommender, introducer, and trainer are distinct roles. They may belong to the same Person only where the authored content explicitly supports it.
- A recommendation is not an obligation, appointment, or proof of trust.
- Familiarity, trust, respect, affection, resentment, and rivalry are distinct. Do not infer one from another.
- Do not assign arbitrary relationship scores to make the biography feel consequential.
- The existing relationship model is directional. If a supported relationship dimension is initialized, create the correct direction only; do not assume the reverse perspective is identical.
- The numeric baseline/initialization policy for relationship dimensions is not defined by this contract. Until an approved policy exists, the resolver must not invent numeric deltas. The event and participant references still preserve the factual connection.

## 8. Enlil-barni replacement and opening-content audit

### 8.1 New-game rule

For newly created games, Enlil-barni is not present as a separate NPC. The player-created Person is the assisting apprentice/scribe in the opening situation. The new game must not register `person-enlil-barni` in `world.people`.

All authored opening content that refers to the protagonist must resolve the active Person from `state.player.currentCharacterId` (or receive that Person ID explicitly as resolver context). Do not hardcode a particular player name or Person ID into reusable opening content.

### 8.2 Audit targets

The inspected current bootstrap and opening content include at least these character-specific references:

- `src/state/initialState.ts`: fixed `INITIAL_PERSON_ID` and Enlil-barni Person construction;
- `src/state/newGameState.ts`: starter Challenge `who` text and relationship consequences reference Enlil-barni / `INITIAL_PERSON_ID`;
- `src/works/storehouseReckoning.ts`: tutorial text or evidence descriptions that identify Enlil-barni as the acting scribe;
- `src/engine/assignmentActivity.ts`: evidence provenance description for the current scribe's physical inspection.

This is a minimum audit list, not a claim that the search is exhaustive. Before integration, search the full repository for `Enlil-barni`, `person-enlil-barni`, and `INITIAL_PERSON_ID`, then classify each occurrence:

- **Protagonist reference:** resolve dynamically to the active Person.
- **Historical or authored world fact:** retain only if the content genuinely requires that named individual; under the approved new-game rule, do not preserve it by silently creating an Enlil-barni NPC.
- **Legacy-save compatibility:** preserve the existing saved Person and references as they are; do not mutate old saves to satisfy the new-game rule.
- **Tests/fixtures/docs:** update to reflect the distinction between legacy save data and newly initialized games.

Generalize the tutorial and opening scenario. Do not create four copies of the Storehouse Reckoning. Its objective evidence, required fields, formal authority, and assessment criteria remain invariant across orientations and biographies. Shuruppak-ilu remains the trainer/supervisor; Ur-Nanna remains the primary reader/client as established by the tutorial design.

## 9. Biography composition and inspection fallback

The biography composer reads the Person's identity, `characterCreation`, `lifeEvents`, `familiarities`, and relevant participant references. It must not depend on an ephemeral UI selection object after initialization.

It must support three cases:

1. **Player-created Person:** use the creation record and resolved Life Event content to compose the authored biography.
2. **NPC or successor with Life Events but no creation record:** compose a history from the available Life Events and familiarity facts. Do not require a `CharacterCreationRecord`.
3. **Legacy Person or NPC with neither creation record nor Life Events:** show a neutral fallback such as “No personal history has been recorded.” Do not invent a biography from current occupation, relationships, or circumstances.

When an event's `contentId` cannot be resolved, display its persisted `summary` fallback. If the Person has no Life Events, do not display an empty timeline or fabricated childhood narrative.

The People You Know panel should derive its explanations from Life Event participant roles and other supported world facts. It must not translate “recommender” into “patron,” “trainer” into “employer,” or “contact” into a formal relationship without authored support.

## 10. Save validation and compatibility

The current save validator checks Person profile fields in `isPersonProfile`. Implementation must extend that validation to check the complete nested shape of each new optional field.

At minimum validate:

- `characterCreation`: non-empty content version and all five non-empty choice IDs;
- `lifeEvents`: array shape; unique non-empty IDs; valid event kind, content ID, summary, chronology stage, non-negative integer order; unique order values per Person; valid confidence value; participant arrays with non-empty roles and Person IDs that resolve in `world.people`;
- `familiarities`: array shape; unique IDs; valid domain/scope IDs; valid exposure enum; non-empty, duplicate-free basis IDs that resolve to Life Events on the same Person;
- cross-field consistency: each familiarity basis ID must refer to a Life Event on that Person; participant references must not point to missing Persons; no duplicate `(domainId, scopeId)` familiarity keys.

Optional fields must remain optional so older Person records without them remain valid. Do not fabricate Life Events or familiarity for legacy characters during normalization. Do not require `characterCreation` for an NPC or successor with Life Events.

The current production save is schema v2. This contract does not pre-empt the implementation's migration decision. Keep v2 only if the actual serializer, validator, and normalization path prove that the additive optional fields remain safely backward-compatible. If the new persisted shape requires a schema-version change, implement an explicit migration and preserve old-save behavior. Never claim compatibility solely because TypeScript fields are optional.

## 11. Initialization sequence

The new-game flow should follow this order:

1. Receive and validate the seed, selected name, five life-history choice IDs, and orientation.
2. Validate the choice combination using authored compatibility rules. Do not encode hidden class restrictions in UI or resolver code.
3. Resolve the existing NPC references required by the authored choices.
4. Derive the deterministic Person ID and construct the baseline Person identity.
5. Build the `CharacterCreationRecord` with the five choice IDs and content version.
6. Resolve the five authored Life Events with stable IDs, chronology, participants, confidence, and fallback summaries.
7. Derive familiarity facts from explicit authored exposure declarations and merge by `(domainId, scopeId)`.
8. Establish only supported relationship facts; do not invent numerical relationship deltas.
9. Set `scribal.careerPath` to the selected orientation and apply only a separately approved starting-state package.
10. Register the Person in `world.people` and set `player.currentCharacterId`.
11. Initialize the common Era I opening/tutorial and starter opportunities using the active character ID.
12. Validate the complete GameState, serialize it, and verify deterministic reproduction.

The Person must exist in the world before any opening Challenge, Work/tutorial, Assignment, or relationship consequence references them.

## 12. QA and acceptance criteria

### Curated profile fixtures

The four authored profiles in the Era I content specification are required QA fixtures:

| Fixture | Life-history choices | Orientation | Key assertions |
|---|---|---|---|
| A — Provisioning-connected administrator | OR-01 / RS-01 / FE-01 / EN-02 / TR-01 | Civic | Ur-Nanna recommendation; narrow provisioning/quantity familiarity; no storehouse authority |
| B — Materials-conscious religious orientation | OR-03 / RS-03 / FE-04 / EN-01 / TR-02 | Religious | Ur-gir introduction; Shuruppak-ilu trainer; no priestly office or craft qualification |
| C — Delivery-connected commercial orientation | OR-04 / RS-02 / FE-03 / EN-01 / TR-04 | Commercial | Enlil-kisu introduction; delivery/custody familiarity; no ownership or commercial authority |
| D — Custody-conscious Martial orientation | OR-04 / RS-04 / FE-01 / EN-02 / TR-04 | Martial | Enlil-kisu recommendation; custody/transport context; no army, combat skill, or military appointment |

These four fixtures are examples and regression baselines, not the only legal combinations. Test the broader authored compatibility matrix separately.

### Required tests

1. **Identity:** same seed/name/choices produce the same Person ID; collisions are handled deterministically; custom names are validated.
2. **Choice provenance:** exactly five life-history choice IDs are persisted; orientation is stored only in `scribal.careerPath`.
3. **Life Events:** all five event kinds are present for the standard Era I creator; IDs are unique; order is stable; participants resolve to existing Persons.
4. **Summary fallback:** normal composition uses current content by ID; retired/unresolvable IDs display the stored summary.
5. **Content version:** prose-only edits preserve IDs; semantic changes use new IDs; old saves remain readable.
6. **Familiarity merge:** repeated domain/scope exposure yields one record, highest justified exposure, and all unique supporting Life Event IDs.
7. **Familiarity restraint:** no skill levels, qualifications, authority, or universal domain bonuses are inferred.
8. **Relationships:** recommendation, introduction, and instruction remain distinct; no unsupported trust/respect/affection/obligation is created.
9. **NPC reuse:** the same Person ID is reused across chapters; no duplicate NPC is created.
10. **Enlil-barni replacement:** a new game has no `person-enlil-barni`; all protagonist references resolve to the active created Person; a legacy save retains its saved Enlil-barni.
11. **Tutorial invariance:** all four profiles receive the same objective evidence, required fields, authority, and assessment criteria.
12. **Progression invariance:** character creation costs 0 AP and awards 0 Career XP and 0 Historical Progress XP; it grants no rank, appointment, qualification, specialization, or unapproved skill/attribute values.
13. **Save compatibility:** legacy v2 records without the new optional fields load; malformed nested fields are rejected; no fabricated history is added during normalization.
14. **Biography fallback:** creator, NPC/successor-with-history, and legacy/no-history cases all render coherently.
15. **Determinism:** repeated initialization with identical inputs yields equivalent complete opening GameStates.

## 13. Implementation sequence and boundaries

This contract authorizes the following engineering sequence; it does not authorize a numerical starting build or a broader simulation:

1. Add the optional domain types to the shared `Person` model and implement nested save validation.
2. Implement pure, deterministic content resolution for choice IDs, Life Events, familiarity, and biography fragments.
3. Define and implement the new-game identity/seed boundary and Person ID derivation.
4. Generalize opening initialization and remove the new-game dependency on Enlil-barni.
5. Add the biography and People You Know read model with the fallback behavior above.
6. Add fixture, combination, determinism, legacy-save, and tutorial-invariance tests.
7. Only then connect the player-facing character-creation flow.

Do not implement UI first and retrofit persistence afterward. Do not use this document to settle starting skills, attributes, Career XP, wallet balances, stress, rank, trait effects, ambitions, or relationship scores. Those require their own approved design decisions.

---

## 14. Open dependencies that remain outside this contract

The following are deliberately not decided here:

- the era-appropriate name catalogue and custom-name validation policy;
- starting age or age range;
- numerical starting skills, attributes, XP, rank, wallet, stress, equipment, or reputation;
- trait definitions, starting trait choices, and trait effects;
- ambition content or mechanics;
- numerical baseline values for directional relationship dimensions;
- any mechanical effect of domain familiarity;
- whether the new save payload requires a schema-version increment, pending implementation against the actual serializer and migration path.

These are not reasons to weaken the persistence contract. They are separate decisions or implementation dependencies and must remain visible rather than being guessed in code.
