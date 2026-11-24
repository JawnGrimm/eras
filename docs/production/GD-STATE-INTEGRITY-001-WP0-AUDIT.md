# GD-STATE-INTEGRITY-001 — WP0 Source/State Audit and Parallel UI/UX Review

**Specification:** GD-STATE-INTEGRITY-001  
**Handoff:** PRODUCTION-HANDOFF-002  
**Tracking:** Issue #107  
**Audit status:** WP0 source trace substantially complete; Day-13 save-level reconciliation remains blocked by absence of the actual save/export  
**Baseline:** `main` at `0644be85e415b44cbf1561e644d54e96862a2748`  
**Audit date:** 24 November 2026  
**Runtime changes in this audit:** None

This is an evidence report, not a design amendment. The approved specification and GDD remain authoritative. PR #106 is still open and unmerged; Issue #107 independently authorizes execution against the reviewed baseline. This document records the source audit performed against that baseline.

## 1. Executive findings

1. **People & Institutions is an eager-rendering/presentation problem, not a demonstrated data-loading problem.** The component reads the already-loaded `GameState` maps and renders every person, relationship edge, and institution with full detail. There is no search/filter or selected-person/detail interaction.
2. **A real relationship-history attribution defect exists in the rubric Assignment submission path.** `eraIAnchorSubmission.ts` writes the receiving person's authored reaction text to every additional `relationshipPersonIds` edge. The authored F02 and F04 definitions name Lu-Nanshe and Utu-mansum respectively as receivers while also listing other people as additional relationship recipients. Their spoken reaction is therefore presented as though it belongs to those other people's relationship perspectives. This is a producer defect, not a rendering transformation.
3. **The source-level defect matches the two relationship-attribution examples identified as directly observed in the approved Day-13 specification.** F02's Lu-Nanshe receiver reaction is written to Ur-Nanna and Geme-Inana edges; F04's Utu-mansum receiver reaction is written to Enlil-kisu and Ama-gi edges, while the receiver's own edge is also written by Closing Receipt processing. The source path therefore explains the reported cross-attribution.
4. **Numeric relationship familiarity has no current gameplay accrual path.** New-character bootstrap stores authored `PersonFamiliarity` entries, but those are domain/exposure knowledge and are not `RelationshipDimensions.familiarity`. New player worlds begin with no numeric relationship edges; current relationship consequence writers default missing familiarity to 0 and update trust/respect, not familiarity. This explains why new edges can remain at 0, but conflicts with the World Simulation Specification's principle that repeated meaningful contact can gradually shape familiarity. No formula or threshold is specified here; Production must not invent one.
5. **Assignment completion and institutional matter resolution are deliberately separate.** Report submission adds documentary evidence/provenance and may record a receiving disposition, but does not itself close a broader matter. The captured Day-13 North-Bay receipt was Overreached and received by Ur-Nanna; that is not evidence that the physical repair was executed and independently verified. The matter remaining open is consistent with the current lifecycle contract.
6. **The People/Institution UI repeats sparse-data placeholders and does not progressively disclose detail.** Age unknown, no affiliations, no initialized scribal capability sheet, no personal history, no standing, and no appointments are rendered inline for every affected profile. They are not fabricated, but their repeated presentation creates substantial visual noise.
7. **The Day-13 ledger values can be mapped to authoritative fields and producers, but cannot yet be numerically reconciled.** No exact Day-13 save envelope or transaction/event export was available to Production. The screenshot/playtest summary is not enough to reconstruct all credits, spending, stress, or AP transitions without inventing missing transactions.

## 2. Source map — relationships

### 2.1 Data contract

- `src/state/types.ts`: `RelationshipDimensions` contains trust, respect, affection, resentment, rivalry, and numeric familiarity. `RelationshipHistoryEntry` contains only `id`, `dayNumber`, `summary`, and optional `eventId`. It has no typed actor, subject, or Record reference.
- `GameState.world.relationships` is keyed by ordered person pair: `relationships[fromId][toId]`. The type comment explicitly says the reverse perspective is stored separately and is never mirrored automatically.
- The ordered edge supplies pair and perspective. The free-text summary is the only current place to express who acted/spoke. A history entry may link to an Event, but cannot directly link to a Record.

### 2.2 Producers and write paths

| Producer | Write behavior | Attribution/provenance observation |
|---|---|---|
| `src/engine/worldSocial.ts` — `SET_RELATIONSHIP` | Appends supplied history to one ordered edge; rejects reused history IDs and invalid supplied Event IDs. | This is the validated action path, but several engine producers bypass it and mutate the relationship map directly. |
| `src/engine/opportunities.ts` — `applyConsequences` | Applies authored partial dimension deltas and appends a generated history ID to the specified `fromId → toId` edge. | No Event or Record reference is added. The summary is authored per change, so attribution depends on the content definition. |
| `src/engine/closingReceipt.ts` — `applyClosingAssessment` | Writes the receiver-to-player edge and stores `input.reaction` when trust or respect actually changes. | The reaction belongs to the receiver edge. No Event/Record reference is added to the history entry. |
| `src/engine/urukAssignmentSubmission.ts` | Uses a local helper to write explicitly authored directional changes. South-Court reconciliation can write player-to-carrier and carrier-to-player entries with different summaries. | The two perspectives are deliberately distinct; these direct writes do not include Event/Record references. |
| `src/engine/eraIAnchorSubmission.ts` | Applies the Closing Receipt receiver reaction, a special F01 Ur-Lamma relationship consequence, and additional `relationshipPersonIds` consequences. | **Verified attribution defect:** the same receiver `reaction` string is copied to each additional recipient's edge. |
| `src/state/initialState.ts` | Seeds legacy protagonist/NPC relationship edges and numeric familiarity values for the fixed-protagonist fixture. | New production characters do not use those legacy starting edges. |

### 2.3 Verified cross-attribution defect

The following authored combinations make the issue concrete:

- `src/content/assignments/eraICommercialFamilies.ts`, F02 “Two Claims, One Load”: `receiverPersonId = Lu-Nanshe`; `relationshipPersonIds = [Ur-Nanna, Geme-Inana]`. The authored reaction strings are Lu-Nanshe's words. `eraIAnchorSubmission.ts` reuses that same string on Ur-Nanna-to-player and Geme-Inana-to-player history edges.
- `src/content/assignments/eraICommercialFamilies.ts`, F04 “Handed Over Twice”: `receiverPersonId = Utu-mansum`; `relationshipPersonIds = [Enlil-kisu, Ama-gi]`. The authored reaction strings are Utu-mansum's words. The same receiver reaction is reused on Enlil-kisu-to-player and Ama-gi-to-player history edges.

The UI in `src/components/ProductionPeopleAndInstitutions.tsx` renders each edge with its correct `from → to` heading and prints the stored summary verbatim. It does not copy or reassign history. Therefore the defect originates in the producer.

Existing `src/tests/eraICommercialMartial.test.ts` verifies F01 receiver/secondary relationship dimensions and some history counts, but does not assert the speaker/summary attribution on F02/F04 secondary edges. Add targeted tests before changing the writer.

**Snapshot qualification:** The approved specification identifies the Lu-Nanshe and Utu-mansum cross-attribution examples as direct Day-13 observations. The source/content match is exact at the producer level. The actual serialized Day-13 save was not available, so the full edge histories and IDs cannot yet be reconciled one-by-one.

### 2.4 Provenance and persistence limitation

The current history type supports optional `eventId`, and `saveEnvelope.ts` validates that a supplied Event exists. The direct writers above generally omit it. No direct Record link exists in `RelationshipHistoryEntry`, even where the same submission creates a Record.

Do not create synthetic WorldEvents merely to fill this gap. Adding a typed Record reference or actor field would alter persistent state. Before any such change, Production must submit the required schema/legacy-save/migration/rollback/determinism plan and obtain review. No schema change was made during WP0.

## 3. Familiarity audit

Two different concepts currently share the word “familiarity”:

- **Numeric relationship familiarity:** `RelationshipDimensions.familiarity`, one of the six directional relationship scores.
- **Person/domain familiarity:** `PersonFamiliarity` in `src/state/types.ts`, containing `domainId`, `scopeId`, `exposure`, and supporting Life Event IDs. `createNewGameState` stores these on the player from the approved character-history resolver. `PersonHistoryPanel` displays them as “Recorded familiarity.” They are not numeric relationship familiarity and do not update it.

New production bootstrap in `src/state/newGameState.ts` creates the authored player and calls `createInitialGameState(player)`. In `src/state/initialState.ts`, the `player ? {} : legacyRelationships` branch means the new player's world begins without the legacy numeric relationship edges.

When new relationship edges are created, current helpers in `closingReceipt.ts`, `opportunities.ts`, `urukAssignmentSubmission.ts`, and `eraIAnchorSubmission.ts` use the baseline familiarity value 0 unless an existing edge already has a value. The inspected runtime consequences update trust/respect; no current authored content change to numeric relationship familiarity was found. The generic opportunity consequence shape can represent partial dimension changes, but the current authored relationship consequence definitions do not supply familiarity deltas.

**Finding:** The zeroes are not caused by the UI. They are the result of the current initialization and consequence paths. The code has no meaningful-contact familiarity accrual rule. `docs/design/WORLD_SIMULATION_SPEC.md` states that repeated meaningful contact can gradually establish familiarity, but the exact numerical trigger/delta/threshold is not defined by this audit. Do not add arbitrary increments or reinterpret `PersonFamiliarity` as a relationship score. Return the missing behavioral rule to Design HQ before changing numeric relationship familiarity.

## 4. Source map — institutional matters and completion feedback

### 4.1 Current model

- `src/state/types.ts`: `InstitutionalMatter.status` is `active | resolved | developed`. `Institution.activeMatters` is the current active index.
- `src/state/saveEnvelope.ts`: save validation rejects an institution's listed matter if it is missing, belongs to another institution, or is not `active`. It validates each listed item, but does not enforce the reverse invariant that every `status: active` matter must appear in its institution's `activeMatters` array. This is an integrity test gap to include in WP2; it is not yet evidence that the Day-13 save contains an orphan.
- `src/components/ProductionPeopleAndInstitutions.tsx`: institution cards display only IDs in `institution.activeMatters`. They do not show developed/resolved history or provide a direct link from a matter to its source records.

### 4.2 Producers and transitions

| Path | Lifecycle behavior |
|---|---|
| `src/engine/assignmentActivity.ts` | The older North-Bay inspection report updates the roof matter summary/source record and leaves its status `active`; it may add the held-barley matter. |
| `src/engine/urukAssignmentSubmission.ts` | Uruk report submission updates the specific matter's summary/sourceRecord/provenance. The report provenance explicitly says filing does not itself resolve the matter. The active index is kept in sync with the matter status. |
| `src/engine/eraIAnchorSubmission.ts` | Submitted report and F01 receiving disposition are added to matter provenance. The authored disposition explicitly leaves the matter active pending an authorized decision. |
| `src/engine/institutionalMatters.ts` | Scheduled North-Bay development changes the relevant matter to `developed`, records a source event/developed day, and creates a distinct water-ingress matter. Development is not resolution. |
| `src/engine/institutionalResponseLifecycle.ts` and `institutionalResponseValidation.ts` | Bounded execution → independent verification → authorized resolution chain. A validated resolution event sets the matter to `resolved` and removes it from `activeMatters`. |
| `src/engine/actionEconomy.ts` | Work finalization applies explicitly authored `retireInstitutionMatters`, setting those matters to `resolved` and removing them from the active index. |
| `src/state/saveEnvelope.ts` | Legacy normalization can convert old string entries in `activeMatters` into typed active matters, preserving the old summary text. It does not establish that a later task resolved them. |

### 4.3 Day-13 task-feedback finding

The Day-13 playtest summary identifies the North-Bay Roof Inspection receipt as **Overreached**, received by Ur-Nanna, with Trust −4, Respect −3, and Temple Storehouse standing −2. That is a completed report/Assignment outcome, not evidence of completed physical maintenance or independent verification.

The current source contract separates:
- completion of the player's report/task;
- the record and recommendation added to the matter;
- an authorized institutional decision;
- any later execution;
- independent verification and final resolution.

Accordingly, a completion toast alongside an active matter is **not a defect by itself**. The source code contains explicit examples where a submitted comparison/report updates the matter's provenance but intentionally leaves it active pending a separate authority decision. The exact Day-13 task ID, matter IDs, and displayed toast text still need to be captured in the repeatable WP6 fixture before the specific screenshot pairing can be declared reconciled.

## 5. People & Institutions information-architecture audit

### 5.1 Data and render path

- The page is mounted by `src/components/ProductionShell.tsx` when the People screen is selected.
- `src/components/ProductionPeopleAndInstitutions.tsx` reads `Object.values(state.world.people)`, `Object.values(state.world.institutions)`, and flattens every directional relationship edge from `state.world.relationships`.
- It renders every Person card with identity, affiliations, professional reputation, institutional standing, personal history/familiarities, public circumstances, public commitments, and appointments.
- It then renders every relationship card and every Institution card, including all currently active matter summaries and appointments.
- All world data is already present in the in-memory `GameState`; this component does not issue per-profile data fetches. The observed scale problem is eager rendering and information hierarchy, not demonstrated over-fetching.

### 5.2 Current affordances and gaps

- No search or filtering exists for people or institutions.
- No compact index/detail selection exists; all profiles and all details are rendered in one long page.
- Relationship history is expanded by default on every edge.
- Institution cards combine responsibilities, authority, active matters, and appointments; they do not provide focused matter/record navigation.
- The component uses headings and semantic sections, but has no detail-selection interaction, search labels, result counts, or focus-management flow because there is no selection state.
- The separate Records & Journal surface (`ProductionRecordsAndJournal.tsx`) also eagerly renders every Record, Knowledge entry, and notice. It preserves evidence and provenance but has no search/pagination. This is a related discoverability concern; do not solve it by truncating the archive.

### 5.3 Non-invasive IA direction for WP3

Subject to verified domain semantics, the smallest compatible direction is:
1. Compact People index showing name and only meaningful existing distinguishing context.
2. Search/filter over existing fields only (name, life stage, alive/deceased, authored social identity, affiliation/appointment where present).
3. Select one Person to view the full existing profile; group relationship edges and their history in a clearly directional section.
4. Compact Institution index and focused institution detail, with current matters distinct from appointments/people and historical records.
5. Preserve complete evidence and history behind progressive disclosure; do not remove underlying state, invent metadata, or truncate archives.
6. Use explicit accessible labels, keyboard-operable selection, visible focus, and a predictable back-to-index interaction. Verify responsive layout and zoom during WP6.

This is an audit recommendation, not an implemented UI design or approval to change domain semantics.

## 6. Sparse NPC presentation

The current People page renders repeated empty-state language directly in every full profile:

- Undefined age → “Age unknown”.
- Empty affiliations → “No affiliations recorded.”
- Missing initialized scribal capability → “No initialized scribal capability sheet.”
- No Life Events → `PersonHistoryPanel` says “No personal history has been recorded.”
- Empty institutional standing → “No institution-specific standing is recorded.”
- No appointments → “No appointments recorded.”

These conditions are not equivalent: age may be unknown; a capability sheet may be unavailable/not initialized; an empty affiliation/appointment list is genuinely empty; some sections may be not applicable. The current presentation does not consistently distinguish these states. The implementation does not fabricate missing facts; the correction should reduce repeated noise and label states accurately, not populate profiles.

No specific historical claim requiring external verification was identified in WP0. **WP5 current finding: No material research required at this stage.** Reopen targeted research only if subsequent UI/content review identifies a particular title, role, life-stage, or institutional claim needing validation.

## 7. Day-13 ledger and persistence map

| Displayed item | Authoritative state | Main producer/derivation |
|---|---|---|
| AP | `state.actionEconomy.apRemaining` and `dailyApAllocation` | Action transitions, Overtime, Day-Close/Begin Workday. |
| Currency | Current character `scribal.wallet.money` | Assignment settlement credits, approved consequences, and other explicit wallet transitions. |
| Provisions | Current character `scribal.wallet.provisions` | Assignment settlement credits, Work provision contract, purchase/recovery transitions, and sustenance. |
| Career XP | Current character `scribal.careerXp` | Closing Receipt assessment, authored opportunity consequences, and approved Work career rewards. |
| Professional Rank | Derived by `deriveProfessionalRank(scribal.skills)` in `src/engine/professionalRank.ts` | Not persisted as an independent rank value. The current helper is explicitly marked PROVISIONAL; this audit does not alter it. |
| Historical Progress XP | `state.historicalProgression.historicalXp` | Work completion finalization only. The Storehouse Reckoning tutorial and Assignments/Challenges are not Works and do not award it. |
| Stress | `scribal.stress`; shortage attribution also `scribal.cumulativeShortageStress` | Overtime and shortage settlement paths in `src/engine/actionEconomy.ts`. |
| Archived-record count | `Object.values(state.records.entries).length` | `CREATE_RECORD`, Assignment submissions, Work finalization, and authored record producers. |

Persistence:
- `src/state/types.ts` declares `SaveEnvelope.schemaVersion: 3`.
- `src/state/saveEnvelope.ts` validates schema-v3 state and supports validated schema-v2 migration/normalization. Relationship edges and Event references are validated; matter statuses and institution active-matter entries are validated.
- `src/state/GameProvider.tsx` restores the save from browser localStorage and writes the complete envelope after state transitions, with rollback/error handling for failed writes.

Day-13 display values stated by the approved specification:
- AP 3/6; Currency 77; Provisions 9; Career XP 631; Professional Rank Grade 1; Historical Progress XP 0; Stress 5.
- The approved specification also reports the archived-record count as a value to reconcile, but does not state the numeric count in its observation summary.
- Historical Progress XP 0 is consistent with the Works-only rule. Career XP 631 and Grade 1 are not inherently contradictory: Career XP and Professional Rank are separate tracks, and the current Grade is derived from skills rather than stored as an independent rank value.

**Not reconciled:** The actual save envelope and full transaction/event history were not available. The approved display summary alone cannot prove the exact path to Currency 77, Provisions 9, Career XP 631, Stress 5, or AP 3/6, nor supply the archived-record count. Do not infer missing purchases, awards, or transitions. A Day-13 fixture must capture the full state and transaction/event trace to establish these balances reproducibly.

## 8. WP0 findings table and next actions

| Area | Finding | Status / next action |
|---|---|---|
| Relationship cross-attribution | F02/F04 receiver reaction is copied to secondary relationship edges. | **Defect verified in source.** WP1: add failing tests, correct the producer without inventing NPC speech, and preserve the correct directional score effects. |
| Relationship provenance | History type has optional Event link but no Record link/typed actor; several producers omit provenance. | **Contract limitation verified.** Prepare technical proposal; no persistent change until schema/legacy-save review. |
| Numeric familiarity | No runtime accrual path; PersonFamiliarity is a separate domain exposure model. | **Gap verified.** Return the missing rule to Design HQ; no arbitrary score increments. |
| Matter completion | Report completion does not equal institutional resolution. | **Expected behavior confirmed** for North-Bay Overreached report. WP2: test the active-index invariant and exact Day-13 matter IDs. |
| Active matter reverse invariant | Save validation checks listed active matters but not all active matters are listed. | **Test gap / potential integrity risk.** WP2: reproduce before proposing code correction. |
| People/Institutions IA | Full eager rendering, no search/filter or focused detail. | **UI audit complete.** WP3: produce a compact index/detail proposal in parallel; implementation follows domain verification. |
| Sparse NPC states | Distinct unknown/unavailable/empty states are repeated as full-profile placeholders. | **Presentation gap verified.** WP4: define compact empty-state rules without creating facts. |
| Ledger | Field sources and producer paths mapped; exact Day-13 balance reconstruction unavailable. | **Partially verified.** WP6 needs the exact save/fixture and deterministic transaction trace. |
| Historical research | No specific claim requiring verification identified by WP0. | **No material research required at this stage.** Reassess only if a concrete claim is flagged. |

## 9. Scope and verification record

- No runtime code, GDD, Decision Register, save schema, migration, numerical formula, or player-facing content was changed in WP0.
- No tests were written or executed as part of this audit-only stage.
- No local build/type-check was run.
- Source paths above were read from the live `main` baseline identified at the top of this report.
- The next authorized runtime work is WP1's relationship-history attribution correction and WP2's matter-state invariant audit, with any persistent-state proposal held for review.
