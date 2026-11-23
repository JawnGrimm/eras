# GD-CHARACTER-START-001 — Era I Replacement Starting-State, Naming & Creator UI Specification

**Status: APPROVED — READY FOR IMPLEMENTATION**  
**Approval:** Game Director decision, 23 November 2026, including the two naming adjustments recorded below.  
**Owner:** Game Design / Design HQ.  
**Production owner:** Production.  
**Implementation tracker:** Issue #69; draft implementation PR #70.  
**Scope:** Era I starting-state resolution, naming, minimal Character Creator, fresh-game initialization, and Workday 1 tutorial handoff.

## 1. Purpose and authority

This specification closes the design dependency that prevented Issue #69 / PR #70 from integrating a player-created Era I protagonist into a fresh game.

The approved historical foundation remains the immutable content map in PR #68:
- File: dev/ERA_I_CHARACTER_HISTORY_RESOLVER_CONTENT_MAP.md
- Version: era1-character-history-v1
- Authority: five Life Events, chronology, confidence, familiarity domains/scopes/exposure, participant mappings, and RS/FE compatibility.

This specification does not create or revise a second history map. It defines the starting consequences derived from that foundation and the minimum UI/bootstrap behavior needed for playtesting.

The closed PR #71 proposal is a structural reference only. This specification supersedes its conflicting or incomplete mappings, especially FE-02/FE-04 and TR-02–TR-04.

The Game Director has approved this specification. Numerical values explicitly marked PROVISIONAL are authorized for playtest calibration and are not final lifetime balance or new GDD formulas.

## 2. Preserved invariants

A new Era I character begins with:

| Field | Starting value |
|---|---:|
| lifeStage | apprentice |
| Career XP | 0 |
| Historical Progress XP | 0 |
| Money | 0 |
| Provisions | 5 |
| Stress | 0 |
| Attributes | six explicit values, see §4 |
| Skills | six explicit level-1 entries, see §5 |
| Professional reputation | 50 / 50 / 50 / 50, see §6 |
| Appointments | none |
| Formal authority | none |
| Obligations | none |
| Conditions | none |
| Specializations | none |
| Traits | none |
| Equipment | empty |
| Institutional standing | empty |

No additional starting resource, obligation, stress, equipment, appointment, authority, or affiliation is created by this package.

Career XP, Professional Rank, Appointments, and Historical Progress XP remain independent. Familiarity is not Skill; Skill is not Authority; Participant is not Friendship or Trust.

The Storehouse Reckoning remains identical across all orientations: same objective evidence, evidence availability, required fields, assessment, senior authority, stages, and tutorial progression. It remains an introductory tutorial outside Assignments, Challenges, and Works; it awards 0 Historical Progress XP and is not a completed Work or a template for future Works.

## 3. Chapter-derived starting effects

Every effect must be deterministic, explainable, and traceable to a selected choice or its Life Event in the final review.

### Chapter 1 — Origin: familiarity only

Use PR #68's familiarity mappings without alteration:

| Choice | Familiarity established |
|---|---|
| OR-01 Food and provisioning | food preparation, storage, and distribution |
| OR-02 Fields and herds | fields, herds, seasonal work, and produce |
| OR-03 Skilled making | materials, processing, and workmanship |
| OR-04 Exchange and movement | goods, routes, deliveries, and handovers |

Preserve the exact domain IDs, scope IDs, exposure levels, merge behavior, and basis Life Event IDs from PR #68. Origin familiarity is observed exposure; it does not imply that the character personally performed the work. Familiarity is not a skill, qualification, authority, or automatic action bonus.

### Chapter 2 — Responsibility: primary attribute emphasis

PROVISIONAL attribute emphasis: add +1 to the listed attribute.

| Choice | Attribute | Rationale |
|---|---|---|
| RS-01 Count or measure | Precision | accuracy and careful comparison |
| RS-02 Help with deliveries | Perception | tracking movement and handovers |
| RS-03 Judge materials or quality | Perception | noticing material and condition differences |
| RS-04 Observe a record or seal in use | Reasoning | relating a mark, seal, or record to a transaction or responsibility |

### Chapter 3 — Formative experience: secondary attribute emphasis

PROVISIONAL attribute emphasis: add +1 to the listed attribute.

| Choice | Attribute | Rationale |
|---|---|---|
| FE-01 A quantity did not match | Reasoning | considering competing explanations |
| FE-02 You were blamed unfairly | Composure | maintaining control under pressure |
| FE-03 You helped settle a disagreement | Expression | clarifying competing accounts |
| FE-04 You were trusted with an adult responsibility | Endurance | sustaining effort and responsibility |

This explicitly corrects the PR #71 duplicate mapping: FE-02 maps to Composure; FE-04 maps to Endurance. RS-04 therefore has real Chapter 3 trade-offs: FE-01 reinforces Reasoning; FE-02, FE-03, and FE-04 instead emphasize Composure, Expression, or Endurance.

### Chapter 4 — Professional entry: factual participant

Use PR #68's participant mapping and roles without alteration:
- EN-01: introducer.
- EN-02: recommender.
- EN-03: sponsor.
- EN-04: professional_contact.

The selected participant is resolved from the approved RS/FE/EN mapping and existing Person roster. Chapter 4 contacts include Ur-Nanna, Enlil-kisu, Utu-mansum, and Ur-gir according to the approved map. Shuruppak-ilu remains the trainer on the Chapter 5 first-instruction event.

Record these as factual Life Event participants. Do not create friendship, trust, affection, respect, patronage, obligation, or institutional-standing scores from participation alone. Do not duplicate or synthesize NPCs.

### Chapter 5 — First instruction: explicit skill practice

All TR mappings are commitments, not conditional possibilities. Remove the PR #71 “only if...” skill-basis hedges.

| Choice | Skill practiced | PROVISIONAL Skill XP |
|---|---|---:|
| TR-01 Quantities and commodity notation | Recordkeeping & Accounts | 20 |
| TR-02 Clay, stylus, and tablet preparation | Writing & Composition | 20 |
| TR-03 Signs and category lists | Reading & Scripts | 20 |
| TR-03 Signs and category lists | Writing & Composition | 10 |
| TR-04 Checking and organizing records | Recordkeeping & Accounts | 15 |
| TR-04 Checking and organizing records | Analysis & Research | 15 |

TR-02 practices Writing & Composition because the lesson teaches tablet preparation, stylus handling, and legible mark production. TR-03 practices both recognition and reproduction of a limited sign/category set. TR-04 practices comparison and organization of records, supporting Recordkeeping & Accounts and Analysis & Research.

All six core skills start at level 1. Skills not practiced by the selected lesson start with 0 Skill XP. Chapter 5 Skill XP is stored on the relevant level-1 SkillState. It does not itself purchase a level. Career XP remains 0, and level advancement still requires the existing explicit purchase action and configured policy. These awards are PROVISIONAL and subject to playtest calibration.

## 4. Provisional attribute baseline

PROVISIONAL common baseline: 5 in each of the six existing attributes. Add exactly one point for the Chapter 2 emphasis and one for the Chapter 3 emphasis.

| Attribute ID | Baseline | Possible chapter emphasis |
|---|---:|---|
| precision | 5 | RS-01 |
| perception | 5 | RS-02 or RS-03 |
| reasoning | 5 | RS-04 or FE-01 |
| expression | 5 | FE-03 |
| endurance | 5 | FE-04 |
| composure | 5 | FE-02 |

Resulting values range from 5 to 7. No orientation-based attribute adjustment applies. These values are PROVISIONAL playtest values, not a final action-resolution formula or lifetime attribute balance.

## 5. Explicit skill baseline

Initialize all six core skill keys explicitly; do not rely on the runtime's missing-skill fallback of level 1:
- reading_scripts
- recordkeeping_accounts
- analysis_research
- writing_composition
- administration_procedure
- communication_instruction

Each entry begins at level 1. Skill XP follows §3 Chapter 5. All unpracticed skills have 0 Skill XP. This explicit baseline prevents incomplete maps from being mistaken for intended apprentice capability and ensures predictable qualification/rank consumers.

## 6. Professional reputation and rank display

### Professional reputation

PROVISIONAL apprentice baseline:
- Competence: 50
- Reliability: 50
- Discretion: 50
- Judgment: 50

All four required 0–100 dimensions must be present. This approved baseline explicitly supersedes the unused createInitialReputation() fallback as the authority for new-character initialization. It does not authorize the helper's institutional-standing examples or create institution scores. No chapter or orientation modifies reputation at creation.

### Rank

The current provisional runtime rank helper displays Grade 1 when the six skills are at level 1. The new character therefore displays Grade 1. Present it neutrally as “Grade 1” or “Provisional professional grade: 1”; do not invent an apprentice rank title.

This is an implementation-compatible display expectation only. It does not approve, fossilize, or replace the GDD's still-open skill-to-rank formula or rank titles. Starting Skill XP must not automatically raise skill levels or inflate the starting rank.

## 7. Orientation

Use the approved player-facing labels and unchanged persisted IDs:

| Player-facing label | Persisted careerPath |
|---|---|
| Civic | government |
| Martial | military |
| Religious | religious |
| Commercial | merchant |

Orientation is a deterministic starting professional context. It informs the character's professional framing and the opportunities/circumstances presented under the approved Assignment Orientation and Institutional Context contract (PR #72). It does not grant attribute points, skill levels, Skill XP, reputation, formal affiliation, appointment, authority, qualification, or exclusive access.

All four orientations remain selectable for every valid history combination. The Storehouse Reckoning is not orientation-specific.

## 8. Naming policy — Game Director adjustments approved

### Custom-entered names

Players may name the character whatever they want. Apply minimal hygiene only:

1. Trim leading and trailing whitespace.
2. Require a non-empty result of 1–60 Unicode code points after trimming.
3. Reject or strip invisible control characters only (at minimum C0/C1 controls and directional override/isolate controls).
4. Do not reject ordinary punctuation, symbols, numerals, internal spaces, apostrophes, hyphens, emoji, or playful names.
5. Do not collapse internal whitespace or impose transliteration, historical-authenticity, profanity, or NPC-name restrictions.
6. Preserve the remaining name as plain text and render through normal text escaping; never interpret it as markup or HTML.

If control characters are rejected, explain the validation issue without substituting another name. Name validation must not prevent a player from using an ordinary creative name.

Person IDs remain independent of display-name uniqueness. A custom name may match an NPC name; the curated list avoids active NPC names, but custom entry is unrestricted.

### Curated Era I sample names

The sample list is deterministic and contains no active Day 1 NPC names. Preserve the three previously proposed early Uruk forms and replace all five NPC-name suggestions with the following unused Late Uruk sign-sequence forms:

| Selectable display name | Editorial note |
|---|---|
| En-Unug-du10 | Uruk-period attested name-form; reading remains cautious |
| Ena-an-ru | Uruk-period attested name-form; reading remains cautious |
| Šubur-e₂a×1N57 | Uruk-period attested sign sequence; reading remains cautious |
| BUₐ GI | Late Uruk name sequence reported by Englund; not a confidently reconstructed pronunciation |
| DIMₐ | Late Uruk name sequence reported by Englund; not a confidently reconstructed pronunciation |
| ENₐ U₂ᵦ DU | Late Uruk name sequence reported by Englund; not a confidently reconstructed pronunciation |
| EZENᵦ ENₐ | Late Uruk name sequence reported by Englund; not a confidently reconstructed pronunciation |
| NIₐ GIR₃c | Late Uruk name sequence reported by Englund; not a confidently reconstructed pronunciation |

Ur-Nanna, Enlil-kisu, Utu-mansum, Ur-gir, and Nin-kasi are active Day 1 NPCs and must not appear in the curated sample list. They remain valid historical NPCs and may still be referenced by Life Events. This exclusion does not restrict custom-entered names.

Historical limitation: the Late Uruk evidence often records personal names through sign sequences rather than securely recoverable phonetic spellings. Display the transliterations as written; do not invent pronunciations or turn them into later conventional Sumerian name forms. The sample list is a convenience, not a claim that every entry's spoken form is known.

Research basis:
- Robert K. Englund, “The Smell of the Cage,” Cuneiform Digital Library Journal 2009:4, especially the Late Uruk name-frequency table (c. 3200 BCE): https://cdli.earth/articles/cdlj/2009-4
- Kristina Sauer and Dietrich Sürenhagen, “Zählmarken, Zeichenträger und Siegelpraxis: Einige Bemerkungen zu vor- und frühschriftlichen Verwaltungshilfen in frühsumerischer Zeit,” in Thomas E. Balke and Christina Tsouparopoulou (eds.), Materiality of Writing in Early Mesopotamia (2016), for the cited Uruk-period forms En-Unug-du10, Ena-an-ru, and Šubur-e₂a×1N57.

## 9. Determinism, provenance, and persistence

No additive provenance record or second benefit ledger is required.

The resolved starting benefits are deterministic from the validated CharacterCreationRecord, its contentVersion, the selected orientation, and the versioned creation-package rules. The creation package is era1-character-creation-v1 and composes:
- historical map: era1-character-history-v1 (PR #68, unchanged);
- starting-state rules: era1-character-start-v1 (this specification).

Production must preserve the historical map version as an explicit dependency in the package implementation; the combined creation-package version is the CharacterCreationRecord contentVersion for this first playable package.

The resolver's output materializes values in existing Person state: Life Events, Familiarities, attributes, skills/Skill XP, reputation, name, and careerPath. Every derived effect must point back to its originating choice/Life Event in the final review. Do not add a persistent duplicate benefit/provenance record.

After creation, saved values and Life Events are authoritative. Loading a save must not re-run a newer resolver or silently rewrite the character. New package versions apply to new characters unless an explicit migration is approved. Preserve schema-v2 compatibility and optional legacy history fields; do not synthesize missing history in legacy saves.

The deterministic Person ID primitive must use the caller-supplied seed, validated display name, five choice IDs, orientation, and package contentVersion. Collision rejection remains mandatory. No runtime generative AI, clock-based randomness, or random sample-name selection is permitted.

## 10. Minimal Creator UI and tutorial handoff

The minimum playable flow is:

1. Enter a custom name or select one curated sample name.
2. Select one Origin (OR-01–OR-04).
3. Select one Responsibility (RS-01–RS-04).
4. Select one compatible Formative Experience, enforcing PR #68's rules:
   - FE-01: RS-01 or RS-02 only.
   - FE-02: any responsibility.
   - FE-03: RS-01, RS-02, or RS-03 only.
   - FE-04: any responsibility.
5. Select one Professional Entry route (EN-01–EN-04).
6. Select one First Instruction lesson (TR-01–TR-04).
7. Select Orientation: Civic, Martial, Religious, or Commercial.
8. Review the resolved character.
9. Confirm and begin the fresh game.

If Responsibility changes after a Formative Experience has been selected, revalidate compatibility and require an explicit replacement if the prior choice is no longer legal. Never silently remap it.

The final review must show:
- validated name and orientation;
- five chronological Life Events and their summaries;
- named Life Event participants and their factual roles;
- resolved Familiarities, including scope/exposure and supporting Life Event;
- all six attributes, showing the Chapter 2/3 choice behind each adjustment;
- all six skills and their levels, with Chapter 5 Skill XP awards identified;
- four provisional reputation scores and the Grade 1 display;
- opening balances and the absence of appointments, authority, obligations, stress, conditions, specializations, traits, and equipment.

Every starting effect must be explainable and traceable. Mark numerical values PROVISIONAL. Allow the player to return to choices before confirming. Keep implementation IDs in a debug view rather than making them the primary player presentation.

The approved broader nine-screen creator may retain inactive Traits and Ambition placeholders, but they are not selectable mechanics and must not block this minimal playable flow.

### Fresh-game handoff

Production owns the exact TypeScript API and module placement. Behaviorally, the new-game entry point must accept the validated creation payload and deterministic seed; it must not remain a zero-argument fixed-protagonist initializer.

On confirmation:

1. Validate name, choices, orientation, and compatibility.
2. Resolve the five Life Events and familiarity using PR #68.
3. Resolve the approved starting attributes, skills/Skill XP, reputation, and orientation context.
4. Construct and register the new Person in the fresh world before any player-dependent content initializes.
5. Set player.currentCharacterId to the new Person ID.
6. Initialize opening content and tutorial against that active protagonist.
7. Validate the resulting GameState and show Workday 1 with six AP and The Storehouse Reckoning available.

Remove Enlil-barni and all fixed Enlil-barni protagonist assumptions from fresh-game initialization and starter content. Do not create Enlil-barni as a second new-game character merely to satisfy stale references. Audit all protagonist consumers, including starter Challenge context/consequences, Assignments, tutorial, UI, and identity references.

Legacy save restoration is a separate path. Existing saves retain their saved protagonist and data unchanged; this specification does not rewrite, migrate, or replace legacy identities.

## 11. Acceptance criteria and handoff

Design acceptance is complete. Production implementation is accepted when:

- PR #70 is rebased onto current main, including PRs #72 and #75 and all intervening changes.
- The resolver still passes all 3,328 resolver calls (832 valid life-history combinations × four orientations), with invalid RS/FE pairs rejected.
- PR #68's history/familiarity mappings and participant rules remain unchanged.
- FE-02 and FE-04 produce distinct Composure and Endurance emphases.
- TR-02, TR-03, and TR-04 always produce their specified Skill XP mappings.
- Every new character has six explicit level-1 skills, six explicit attributes, four reputation values, and the exact opening baseline.
- Starting skill XP does not auto-advance levels or raise the starting Grade 1 display.
- All four orientations are available and the Storehouse Reckoning remains identical.
- The custom-name hygiene rules and curated sample catalogue pass tests.
- All Chapter 4 participants resolve to existing Persons; no numeric relationships are fabricated.
- Fresh games use the created protagonist; no Enlil-barni is present as a new-game protagonist or fixed player dependency.
- Legacy saves restore unchanged and no legacy Life Events/Familiarities are synthesized.
- The final review exposes provenance for every starting effect.
- Fresh-game initialization reaches Workday 1 with six AP and The Storehouse Reckoning playable.

Production reports files changed, technical decisions, save/migration impact, tests actually executed and results, deviations, and remaining limitations. CI passing on the pre-rebase PR #70 head does not substitute for validation after rebase and integration.

## 12. Register reconciliation

The same approval package updates:
- docs/design/DECISION_REGISTER.md: PR #68 history foundation recorded as approved; GD-CHARACTER-START-001 recorded as approved; numerical starting values recorded as PROVISIONAL; custom naming and curated sample-name policy recorded; skill-to-rank formula remains OPEN.
- docs/design/OPEN_DESIGN_REGISTER.md: remove the obsolete blocking history-authoring item because PR #68 is approved; track Creator/fresh-game bootstrap integration as the current Issue #69 / PR #70 implementation dependency; clarify that remaining character-system work is still open.

The GDD and DECISION_REGISTER are not silently changed beyond the approved register entries. This supporting specification does not establish final lifetime balance or close the broader character-system design questions.
