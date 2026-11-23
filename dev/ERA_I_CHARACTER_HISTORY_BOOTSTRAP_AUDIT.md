# Era I Character-History Bootstrap Consumer Audit

**Task:** Issue #69 / ENG character-history resolver and new-game integration  
**Audit status:** IN PROGRESS — source inspection completed for the consumers listed below  
**Branch:** `feat/era1-character-history-resolver`  
**Scope:** Empty capability maps, Storehouse Reckoning initialization, fixed-protagonist references, persistence, rank, reputation, and identity boundary.

## 1. Empty attributes and skills

**Finding: structurally accepted; no evidence of a tutorial hard requirement for populated maps.**

- `InitializedScribalCharacterState.skills` and `.attributes` are `Partial<Record<...>>`; empty objects are valid.
- The current Enlil-barni bootstrap itself uses `skills: {}` and `attributes: {}`.
- `saveEnvelope.ts` validates only entries that exist in either map; it does not require every skill or attribute.
- `workEngine.test.ts` explicitly verifies that missing skill/attribute entries do not get coerced into zero and do not produce conditional interpretation annotations.
- Storehouse Reckoning's objective evidence and submission flow do not require a populated capability map. Skill/attribute predicates only govern optional character-situated interpretation annotations.
- The Work engine does require an initialized scribal state. `getInitializedScribal` rejects an identity-only record; therefore the new protagonist must be initialized, not merely identity-stage.

**Conclusion:** Empty skill and attribute maps are compatible with the approved structural baseline. Do not add zero-valued entries or copy Enlil-barni's profile to satisfy a nonexistent map-completeness requirement.

## 2. Other initialized-scribal fields

The current TypeScript type and save validator require more than the approved balances:

| Field | Current technical requirement | Approved baseline / issue |
|---|---|---|
| `careerXp` | Required finite non-negative number | Approved: `0` |
| `wallet.money` | Required finite non-negative number | Approved: `0` |
| `wallet.provisions` | Required finite non-negative number | Approved: `5` |
| `wallet.shortageWorkdays` | Required integer | Structural counter; current zero baseline is not a biography benefit |
| `skills`, `attributes` | Required maps; entries optional | Approved: empty maps |
| `stress` | Required number | Approved direction: no biography-derived starting penalty; initialize without a penalty |
| `cumulativeShortageStress` | Required integer 0–10 | Structural counter |
| `obligations` | Required array | Approved: no starting obligations |
| `specializations`, `traits`, `conditions`, `equipment` | Required arrays | Approved: no starting awards/effects; keep empty |
| `institutionalStanding` | Required map | No starting institutional authority/standing is approved; keep empty |
| `careerPath` | Optional on initialized type | Must receive the player's selected orientation |
| `professionalReputation` | **Required four-score object in type and save validator** | **No starting reputation baseline is specified in the approved package.** Existing Enlil-barni values must not be copied. |

The reputation object is a real integration dependency: assignment and submission consumers read and update `professionalReputation.judgment`; the save validator rejects its absence. Production must not invent 0, 50, or another baseline. Owner direction is required: approve a new-character baseline, or approve a reviewed technical/domain contract for an uninitialized reputation state and its action behavior.

## 3. Rank behavior

- `deriveProfessionalRank` is explicitly marked provisional pending the GDD §10.2 breadth/depth formula.
- Its current implementation treats every missing skill as level 1; an empty map therefore produces Grade 1.
- `ProductionShell` displays that derived Grade, and `SuccessionScreen` uses the helper for candidate display/ranking.
- The approved starting package says no assigned/copied rank and permits derivation only when the approved formula supports it. The current provisional helper is not evidence that the approved formula is settled.

**Conclusion:** Do not write a rank value into the new Person. The mismatch between the open GDD formula and current provisional rank consumers must be surfaced to Design HQ; Production must not revise the formula under this task.

## 4. Storehouse Reckoning requirements

- `createNewGameState` starts the tutorial through the normal `START_WORK` action.
- The engine requires the active Person to have initialized scribal state and the ordinary structural economy fields.
- The tutorial definition has no skill/attribute entry requirement and no orientation-specific evidence or assessment branch.
- Empty maps suppress only interpretation annotations whose predicates require a skill/attribute threshold. Objective evidence, required fields, assessment, authority, and tutorial progression remain shared.

No tutorial mechanic, evidence, assessment, authority, or progression change is justified by the new starting baseline.

## 5. Fixed-protagonist reference audit

Production references found in the current bootstrap path:

| File | Fixed reference / dependency | Required integration treatment |
|---|---|---|
| `src/state/initialState.ts` | Fixed `INITIAL_PERSON_ID`, Enlil-barni Person, starting balances/XP/stress/reputation, and player relationship edges/history | Accept a created Person for new-game construction; do not copy legacy numerical or relationship state. Keep any Enlil fixture isolated from the new-game path. |
| `src/state/newGameState.ts` | Starter Challenge `who` text and relationship consequence `fromId` use Enlil / `INITIAL_PERSON_ID` | Resolve active Person ID and name from the new-game input. |
| `src/works/storehouseReckoning.ts` | Follow-on roof Assignment `who` text names Enlil-barni | Use a generic current-scribe role or pass the active Person name through a reviewed Work context interface; never hardcode a player name. |
| `src/engine/assignmentActivity.ts` | Physical-inspection provenance says “Direct physical inspection by Enlil-barni” | Resolve the current Person name from `state.player.currentCharacterId`. |
| `src/components/ProductionShell.tsx` | Reads active Person by `currentCharacterId` | Already uses the dynamic identity boundary for the header/profile. Rank display remains subject to §3. |

The resolver and People history panel use Person IDs and participant names from the world roster; they do not depend on the active protagonist being Enlil-barni.

## 6. Save and legacy compatibility

- Save schema remains version 2. The three history fields are optional and already validated when present.
- Existing saves are restored through `restoreSave`; the normal load path returns the saved state and does not call new-game initialization.
- New-game replacement must be confined to fresh initialization. Do not rename, delete, demote, or rewrite Enlil-barni in an existing save.
- No schema change or migration is proposed by this audit.

## 7. Naming and deterministic identity boundary

- The current production factory is zero-argument: `createNewGameState()`. `GameProvider` and the explicit “Start Fresh” action call it without identity input.
- There is no current UI input boundary for player name, five choices, orientation, or seed.
- The data contract requires a validated non-empty name; the content contract leaves the naming catalogue/custom-name validation policy to Design.
- Production can implement a deterministic identity function from a supplied seed, exact validated name, five choice IDs, orientation, and content package version, with collision detection against existing NPC IDs. The seed source and UI handoff still need a caller.
- Do not invent a name catalogue, transliteration rules, length limit, punctuation rule, or other naming policy. A technical non-empty check is the only currently documented minimum validation.

**Conclusion:** Naming policy remains a separate Design dependency. Deterministic seed handling and stable Person ID construction are Production responsibilities once the input contract is supplied. The absence of a current UI input boundary means the zero-argument fresh-game flow cannot yet be replaced end-to-end without a character-creation handoff.

## 8. Outstanding decisions / next steps

1. Game Director / Design HQ: resolve the initial `professionalReputation` state required by current production consumers and persistence validation.
2. Design HQ: resolve the provisional rank formula / display contract; Production will not alter it here.
3. Design HQ: complete the naming policy. Production can then wire the approved input into the deterministic identity factory without expanding the policy.
4. Production: after those dependencies are resolved, integrate the approved structural package, remove fixed player references from the new-game path, and add end-to-end tests for all four orientations, deterministic identity, tutorial start, and legacy-save preservation.

No runtime behavior, save schema, migration, or tutorial rules were changed by this audit.
