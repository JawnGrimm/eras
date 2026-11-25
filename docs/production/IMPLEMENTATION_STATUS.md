# Implementation Status Snapshot

**Snapshot date:** 22 November 2026  
**Classification:** IMPLEMENTATION FACTS — not design authority.  
**Canonical design authority:** [Game Design Document](../GDD.md).

This document preserves the implementation-status note formerly embedded in the GDD. It is a dated snapshot, not a guarantee that every detail remains current. Verify against the repository, tests, and deployment before relying on it for a new implementation task.

**Implementation status (22 November 2026):** the production application is mounted from `src/App.tsx` through `ProductionApp` and `ProductionShell`. The Storehouse Reckoning is registered through the existing `works.progress` container with `kind: 'tutorial'`; completion awards no Historical Progress XP, does not enter `completedWorks`, grants no provisions contract, and retires its Temple Storehouse active matter. Existing v2 saves are normalized to remove the former 15,000 tutorial XP credit and correct stale Era I display dates; the save schema remains v2, and persisted tutorial provision-contract snapshots are ignored during settlement. P3 personal hardship and recovery is implemented: from the third consecutive Workday without provisions, the character gains +2 Stress per affected Workday, up to 10 cumulative shortage-attributed Stress per character, and the recoverable Underfed condition. Recovery routes are Temple Storehouse Auxiliary Labor (2 AP for +1 provision, once per Workday, with no money or Career XP) and an eligible Ur-gir advance (1 AP for +1 provision, creating a persistent obligation with silver repayment or a day of scribal assistance as alternatives). The advance requires Ur-gir to be alive, have provisions to spare, trust of at least 50, and no resentment toward the character; only one outstanding Ur-gir obligation is allowed. The obligation's eventual fulfillment interaction remains open design work. P2-2 also registers three recurring Uruk Assignment activities, a deterministic Assignment generator, two one-shot optional Challenge scenarios, and a character-situated Morning Report generated during daily settlement. The current runtime wallet stores money and provisions, matching the approved two-resource model. Era-specific names, denominations, and visual presentation may be reskinned as the setting changes; the underlying balances carry forward unchanged. The former prototype UI, the listed legacy state/data/engine modules, the disconnected `WorkRunner`, and the stale `src/content/works/storehouse_reckoning.json` definition have been retired. The production save uses only `scribe_game_v2`; legacy `scribe_*` keys are neither migrated nor deleted. This note describes implementation status, not a change to the approved six-AP rule.

## Current design-development baseline

- PR #56 persistence work merged as adecd6b.
- PR #57 staged scribal identity boundary merged as 001c148.
- The next character-history resolver step is blocked on authored Era I mappings recorded in the [Open Design Register](../design/OPEN_DESIGN_REGISTER.md).
- Later repository commits supersede this snapshot where implementation has changed.

Implementation facts do not amend the GDD. A code change that alters approved behavior requires owner review and, if approved, an explicit design-document update.


## Production update — 23 November 2026

**Verified repository baseline before this housekeeping update:** `main` at `36bae22547d8622e5a121b3c0c1f53e26fe4108b` (PR #72 merged). This update supplements the dated 22 November snapshot above; it does not rewrite that historical note or amend design authority.

- **Character history:** PR #68 approved and merged the Era I history content map. PR #70 remains a draft/open implementation branch containing the five-event resolver, familiarity/provenance merging, biography read model, deterministic Person ID primitive, tests, and a bootstrap-consumer audit. Its current head passed GitHub Actions run #344 (TypeScript, 27 test files / 201 tests, production build) and CodeQL run #193. The branch is not rebased to current main; its base predates PR #72 and this production-status update. Validation must be repeated after rebasing.
- **Character-creation direction:** The Game Director's 23 November direction supersedes the earlier blanket prohibition on starting benefits. Design HQ is preparing a replacement specification for traceable life-history- and orientation-derived starting consequences. No starting-benefit or new-game bootstrap runtime integration has yet been implemented. Approved opening balances remain Career XP 0, Historical Progress XP 0, Money 0, Provisions 5.
- **Protagonist gap:** The current main bootstrap still constructs Enlil-barni in `createInitialGameState()`; `createNewGameState()` remains zero-argument and uses fixed-protagonist references in starter Challenge context/consequences. The player-created protagonist decision is therefore not yet implemented in the fresh-game path. Existing save restore remains separate and must preserve legacy identities.
- **Bootstrap consumer findings:** Empty skill and attribute maps are structurally accepted. Initialized scribal state still requires a four-score professional-reputation object; Assignment activity and Uruk Assignment submission update judgment. The old 50-point helper has no runtime call sites and is not an approved baseline. The provisional rank helper displays Grade 1 for an empty skill map; the approved rank formula remains open.
- **Orientation and opportunities:** PR #72 merged the approved Assignment Orientation and Institutional Context behavioral contract. Production's specified cross-system delivery-channel/access audit remains outstanding.
- **Other open PRs:** PR #74 (HC-003 sealed pottery storage jars) passed validation run #337 and CodeQL #186. PR #75 (Civic / Religious / Commercial / Martial player-facing orientation vocabulary; persisted IDs unchanged) passed validation run #334 and CodeQL #183. Both remain open and unmerged. PR #71's starting-state proposal was closed as superseded by the revised Game Director direction; its branch remains as reference material.
- **Issue tracking:** Issue #69 remains open. Its former no-starting-benefits acceptance clause is superseded by the revised direction and must be reconciled with the replacement specification before full bootstrap completion.

No save-schema change, migration, new-game replacement, merge, or deployment is recorded by this status update.

## Repository housekeeping audit — 23 November 2026

**Baseline:** `main` at `36bae22547d8622e5a121b3c0c1f53e26fe4108b`.

- **Open PRs:** #70 (Era I character-history resolver; draft, active, awaiting replacement starting-state specification and rebase); #74 (HC-003 sealed pottery jars; implementation and CI validation complete, awaiting historical/content review); #75 (professional-orientation vocabulary; documentation-only, CI validation complete, awaiting confirmation of the terminology approval recorded in its branch).
- **Closed / merged PRs:** #72 merged; #68 and #67 merged; earlier implementation and documentation PRs #1–66 are closed. #71 is closed unmerged as superseded by the revised character-creation direction. #73 is closed unmerged as a zero-commit duplicate of the then-current main; #74 is the subsequent active correction PR. #53 is closed unmerged; its commit is also the merged head of #54.
- **Open Issues:** #69 only. It remains open and has been revised to distinguish the still-valid resolver/history requirements from the superseded no-starting-benefits clause and the pending replacement starting-state specification.
- **Branches:** 64 total, including `main`. Three branches are associated with open PRs (#70, #74, #75). Three branches should be retained pending design/spec reconciliation (`design/era1-life-history-starting-state-proposal`, `docs/work-contribution-architecture-decision`, and `docs/work-contribution-step-1-review`). Fifty-seven other non-main branches compare as fully contained in main or as the exact head of merged PR work and are deletion candidates after final owner/branch-owner confirmation.
- **Deletion limitation:** The connected GitHub operations available to Production in this session expose branch reads and ref updates, but no branch-delete operation. No branch refs were deleted or force-moved. The deletion candidates are recommendations, not completed cleanup.

No PR was merged, no unresolved issue was closed, and no deployment occurred during this audit.

## Cross-system and documentation alignment findings — 23 November 2026

- **Assignment delivery-channel audit:** The approved PR #72 contract's §11 is supported by the existing `dev/ERA_I_ASSIGNMENT_ORIENTATION_AUDIT.md`, but the complete production-consumer audit is not yet recorded as finished. Source inspection confirms `validChannels()` checks only that a relationship-channel Person exists; it does not inspect relationship dimensions. `generateDailyAssignments()` discovers authored definitions from active matters and does not filter by relationship score or orientation. Delivery reasons are presented in the Assignment Board and Challenge Journal. The current EN participant-only case therefore is not silently excluded by the present generator. Preserve this behavior until Design defines whether the channel is explanatory metadata or an eligibility predicate.
- **Qualification consumer:** `characterQualifiesForAssignment()` compares required skill levels and treats a missing skill entry as level 1. Rank is not used as a substitute for skill qualification. The replacement starting-state spec must account for this existing fallback rather than assuming missing skills equal zero.
- **Relationship consequences:** Factual Life Event participation is separate from `world.relationships`. Opportunity consequence application initializes relationship dimensions only when an authored relationship change is applied; participant identity alone does not create a relationship score.
- **Character-creation authority drift:** The main Decision Register still records the authored character-history mappings as OPEN / BLOCKING and the Open Design Register still lists the mapping contract as a blocking item, despite PR #68's approved content map being merged. Design HQ should reconcile these entries: the content map is approved; the replacement starting-benefit specification remains pending.
- **Protagonist implementation drift:** The main Decision Register marks player-created protagonist identity LOCKED, while `createInitialGameState()` and zero-argument `createNewGameState()` still bootstrap Enlil-barni. The fixed references identified in the PR #70 audit remain a production gap.
- **Orientation vocabulary:** Main GDD §3.4 and current persisted `CareerPathId` still use Government / Military / Religious / Merchant and `government | military | religious | merchant`. PR #75 proposes Civic / Martial / Religious / Commercial display terminology and records an owner-approval claim in its branch Decision Register, without renaming persisted IDs. The PR is not merged; confirm the recorded approval and integrate it deliberately.
- **HC-003:** The main Historical Correction Register offers sealed pottery jars or covered reed baskets. PR #74 selects sealed pottery jars and adds exact-string legacy matter-summary normalization during restore. This is schema-version-neutral but is still a persistent-load normalization change; historical/content review should confirm the jar choice and the three exact legacy replacements before merge.

These findings are implementation/documentation reconciliation items. Production has not edited the GDD, Decision Register, or Open Design Register in this audit.

## Game Director review follow-through — PRs #74 and #75 — 23 November 2026

- **PR #75 — MERGED** as `e036afc91250b9d7a09dd0494e564b56b89da80f`. Applied the approved player-facing orientation labels Civic, Martial, Religious, and Commercial across the GDD, Decision Register, Open Design Register, and supporting specifications. Persisted internal career-path IDs remain `government`, `military`, `religious`, and `merchant`. The PR changed documentation/specification files only; no `src/` files or runtime IDs changed. Rebased onto current main before merge. Pull Request Validation run #346 and CodeQL run #199 passed.
- **PR #74 — MERGED** as `302e64b610c924c8408826aab255f17138e53347`. Applied the Game Director-approved sealed pottery jar correction to the Held-Barley / North-Bay content. Rebased onto current main before merge. Production tightened the exact-string legacy summary normalization so replacements require the canonical Held-Barley matter in the Temple Storehouse; unrelated matter IDs and unknown/custom summaries are preserved. Added regression coverage for identical legacy wording on an unrelated matter ID. Pull Request Validation run #350 passed TypeScript, all 24 test files / 184 tests, and production build; CodeQL run #204 passed.
- Both PRs were squash-merged after the final rebased-head checks. No deployment is recorded by these merges.

**Post-merge integration commit (before this status entry):** `302e64b610c924c8408826aab255f17138e53347`.


## GD-CHARACTER-START-001 post-merge integration review — 24 November 2026

**Verified baseline:** PR #70 merged to `main` as `ca3c95466d8bbc7522dc54e2e6b566e28239874c`. The merge commit is the latest commit returned by the repository's commit listing at the time of this review. PR #70 is closed and merged. This entry supersedes earlier statements in this document and Issue #69 that describe PR #70 as open or awaiting rebase.

### Merged scope

PR #70 adds the deterministic Era I five-event history resolver, approved responsibility/formative compatibility and participant mapping, familiarity merging with exposure and Life Event provenance, Person history read model/profile presentation, deterministic Person ID primitive, tests, and the bootstrap-consumer audit. The merge does not implement the complete approved Character Creator or replace the fresh-game protagonist.

### Verified remaining implementation work

Source inspection on the merged `main` confirms:

- `src/content/characterCreation/eraICharacterHistory.ts` still writes `era1-character-history-v1` as `CharacterCreationRecord.contentVersion`.
- `src/state/characterIdentity.ts` still hashes the history-map version directly and validates only a non-empty trimmed name. The approved contract requires the combined package version `era1-character-creation-v1`, a retained explicit dependency on `era1-character-history-v1`, and the approved 1–60 Unicode-code-point name hygiene.
- The approved starting-state resolver is absent: explicit six-attribute baseline/emphases, six level-1 skills and lesson Skill XP, four reputation values, opening baseline/exclusions, and orientation context remain to be materialized.
- The eight approved curated sample names are not yet implemented.
- `src/state/newGameState.ts` still exports zero-argument `createNewGameState()`, calls `createInitialGameState()`, and authors the starter Challenge with Enlil-barni as the assisting scribe and relationship consequence source.
- `src/state/initialState.ts` still constructs Enlil-barni as the initial player character with the old profile (Career XP 150, Money 12, Stress 15) and old player relationship state. This is not an approved new-character template.
- Fixed player-name references remain in starter content, including the follow-on roof Assignment in `src/works/storehouseReckoning.ts` and the physical-inspection provenance in `src/engine/assignmentActivity.ts`.
- `src/state/GameProvider.tsx` still invokes the zero-argument factory for no-save initialization and explicit fresh-save reset. The Creator must become the fresh-game entry path; existing-save restoration must remain separate and unchanged.
- The minimal Creator, responsibility/formative compatibility interaction, final review/provenance presentation, and confirmation-to-Workday-1 handoff remain unimplemented.

These are implementation findings, not new design decisions. Follow `dev/GD-CHARACTER-START-001.md` without reopening its approved content mappings or provisional values.

### Validation and compatibility

PR #70's reported CI results apply to its pre-merge head `d9afa275adba4d784ee70e0fa00509c8e4634ac8`: TypeScript, 27 test files / 201 tests, production build, and CodeQL passed there. They are not evidence that the remaining Creator/bootstrap integration has been implemented or validated. The merge commit returned no combined status entries in the post-merge status query. No local build, type-check, or test execution is claimed by this review.

No save-schema bump or migration is authorized. Keep schema v2; preserve legacy save restoration and legacy Persons without synthesized Life Events, Familiarities, or CharacterCreationRecords. Do not create Enlil-barni as a second new-game character or carry his old identity, relationships, or starting values into a player-created character.

### Recommended production sequence

1. Implement the versioned creation-package boundary and approved name validation/catalogue; retain the PR #70 history resolver and its 3,328-combination coverage.
2. Implement deterministic starting-state resolution from the validated five choices and orientation.
3. Separate reusable world/NPC construction from the legacy fixed-player fixture; create/register the player Person before player-dependent opening content.
4. Parameterize starter Challenge, tutorial follow-on content, Assignment provenance, and all other audited protagonist consumers.
5. Add the minimal Creator and final review, including explicit replacement when a Responsibility change invalidates the selected Formative Experience.
6. Make no-save initialization and explicit reset enter the Creator; keep valid save restoration and corrupt-save protection unchanged.
7. Add integration and regression tests for new-game identity, all starting effects, all orientations, tutorial equivalence, name edge cases, reset, and legacy save restoration.
8. Run full validation on the integrated branch, review the complete diff, and report implementation, tests actually executed, deviations, and limitations.

**Current status:** History/identity foundation **MERGED**. GD-CHARACTER-START-001 **APPROVED — READY FOR IMPLEMENTATION**. Creator and fresh-game bootstrap **NOT IMPLEMENTED**. Integration **NOT VERIFIED**. Deployment **NOT RECORDED**.


## GD-CHARACTER-START-001 implementation and deployment — 24 November 2026

**Status:** IMPLEMENTED · TESTED · MERGED · DEPLOYED · VERIFIED

**Merged PR:** [#77 — Implement Era I character creator and fresh-game bootstrap](https://github.com/JawnGrimm/eras/pull/77)  
**Main commit:** `7641d3ff76f12034a177309d5df76549e0524330`  
**Verified main branch:** `main` points to the merge commit above.  
**Deployment:** GitHub Pages workflow run #157 completed successfully; the deployment step reported success for commit `7641d3ff`. Published URL: https://jawngrimm.github.io/eras/

### Implemented scope

- Added the approved deterministic Era I starting-state resolver and all three distinct version identifiers: history dependency `era1-character-history-v1`, starting-state rules `era1-character-start-v1`, and combined creation package `era1-character-creation-v1`.
- `CharacterCreationRecord.contentVersion` and deterministic Person ID hashing use the combined package version. The history dependency remains explicit. Person IDs use the caller-supplied seed, trimmed validated display name, five history choices, persisted career-path ID, and combined package version; collisions are rejected.
- Added the eight approved curated sample names with the approved editorial cautions, plus custom-name hygiene (trim, 1–60 Unicode code points, reject invisible controls, preserve ordinary creative names).
- Materialized the approved PROVISIONAL starting state: six attributes at baseline 5 with the Chapter 2/3 emphases; six explicit level-1 skills with lesson-specific Skill XP; Career XP 0; four reputation dimensions at 50; Money 0; Provisions 5; apprentice life stage; no starting appointment, formal affiliation, authority, relationship edges, obligations, stress, conditions, specializations, traits, or equipment. Grade 1 is displayed without persisting a rank value or changing the open skill-to-rank formula.
- Added the minimal Creator, responsibility/formative compatibility enforcement, and final review of five chronological Life Events, factual participants/roles, narrow Familiarities and supporting Life Events, attribute/skill provenance, provisional reputation, and opening state.
- Fresh-game initialization registers the created Person before resolving player-dependent history and opening content. The new-game preview uses a non-persistent placeholder and authored NPC roster; Enlil-barni is not included in the fresh playable state. The legacy default fixture remains available for existing tests/fixture consumers.
- Removed fixed protagonist assumptions from the starter Challenge, Storehouse tutorial copy, and follow-on Assignment inspection provenance. Challenge consequences use the current player ID; no starting relationship is inferred from Life Event participation.
- No-save initialization and explicit fresh-save reset now enter the Creator. A new save is written/replaced only after character confirmation. Valid schema-v2 save restoration remains separate; corrupt/read-error protection is preserved.

### Validation actually executed

- **Pull Request Validation run #368:** TypeScript check passed; **29 test files / 215 tests passed**; production build passed.
- **CodeQL run #230:** JavaScript/TypeScript analysis passed.
- **Deployment run #157:** build and GitHub Pages deployment passed.
- The existing history resolver matrix remains covered: the suite includes all **3,328 legal history/orientation combinations** across the four persisted orientations.
- Local tests/build were not run in this execution environment; the results above are the actual GitHub Actions runs.
- Manual interactive browser smoke testing after deployment: **NOT TESTED** in this session.

### Compatibility and remaining verification

- No save-schema bump or migration was introduced. Existing schema-v2 values and legacy identities remain authoritative on restore; the new resolver is not rerun for restored characters.
- Numerical starting values remain PROVISIONAL for playtest calibration. No new GDD formula, rank title, or gameplay rule was introduced.
- The Storehouse Reckoning remains the introductory tutorial outside Assignments, Challenges, and Works. It is not reclassified as a Work or treated as the Works template.
- No runtime generative AI was added.

**Production result:** The approved character-creation flow is on `main` and deployed. The live entry path is the Creator for players without a production save; confirmed creation leads to Workday 1 with six AP and the Storehouse Reckoning available.


## Issue #82 / Issue #85 execution snapshot — 24 November 2026

**Verified source:** live GitHub repository `JawnGrimm/eras`, `main` at `a6e00cb6fbb08bbec8773d1dce9da5a4341f750c`; PR metadata, current PR heads, and GitHub check runs inspected on 24 November 2026. This entry supplements earlier dated snapshots; it does not rewrite them.

### Historical content and authored source

- **PR #86 — MERGED:** `dev/GD-ERA1-ANCHORS-001.md` is present on `main` as the authored semantic source for the five approved Era I Assignment anchors. Its merge-commit blob matches the current `main` blob; no drift was found.
- The five scripts are authored content, not merely research seeds or Production fixtures. They remain a semantic authoring document; they are not yet executable Assignment definitions or a TypeScript content schema.
- **PR #87 — OPEN / DRAFT / UNMERGED:** current head `1d283ad3eeeda76e72940d7429528eda249629c9`; documentation-only. The inert TypeScript mirror and structural tests were removed. It retains `docs/production/ISSUE-85-TECHNICAL-DESIGN.md` as a proposed technical note. Pull Request Validation, TypeScript analysis, and CodeQL all passed on that exact head. No runtime files or save data changed.

### Issue #82 — QA corrections

- **Issue #82 remains OPEN.**
- **PR #88 — OPEN / DRAFT / UNMERGED**, head `16ae78c8a4f40ea5bd3ef16839fbba86a07f598e`. QA-82-1, QA-82-2, QA-82-4, and QA-82-5 are implemented in the PR. The latest-head checks `validate`, `Analyze (javascript-typescript)`, and `CodeQL` all completed successfully. The reported CI run executed 29 test files / 221 tests, TypeScript validation, and the production build; these are CI results, not local execution.
- QA-82-3 remains BLOCKED pending Game Director direction. The current character-creation specification requires curated transliterations to be displayed as written and prohibits invented pronunciations; the QA finding prohibits exposing raw sign/catalog notation as the player-facing name. Production has not invented pronunciations or silently renamed saved characters.
- No QA correction is yet merged, deployed, or accepted as verified. The issue remains open until the blocked item is resolved and the corrections meet their individual acceptance criteria.

### Issue #85 — authorized preparation; runtime held by sequencing

- **Issue #85 remains OPEN and authorized.** Runtime integration touching overlapping opportunity/UI surfaces remains sequenced after Issue #82 lands. Independent audit, technical design, and non-overlapping preparation may continue.
- **Runtime integration has not started** in the verified PRs described above. No persistent-state change, save-schema change, or migration has shipped; the live save schema remains v2.
- The Production technical note in PR #87 proposes a durable occurrence/lifecycle model, deterministic selection, and a Day-Close compatibility approach. These are proposals, not approved technical contracts. It correctly identifies that an optional schema-v2 field cannot safely represent a persisted intermediate Interlude to an older reader; a schema-v3/migration proposal requires review before implementation ships.
- Recovery audit: `REQUEST_CONTACT_ADVANCE` is an existing conditional personal-help/advance route from Ur-gir, transferring one Provision with a repayment/service obligation. It is not universally available. `PERFORM_RECOVERY_LABOR` exists but currently rejects use while the player has any Provisions; it therefore fails the approved pre-depletion availability requirement. The route must become visible and usable before depletion, across all four orientations, using ordinary Workday AP/approved Overtime only.
- The proposed Playtest 1 Currency-to-Provisions table and worked multi-day survival example have not yet been submitted/ratified. No Currency conversion rate or permanent recovery payout is approved by this status entry.

**Status summary:** Issue #82 — IN PROGRESS, with four corrections in an unmerged draft PR and one owner-blocked correction. Issue #85 — IN PROGRESS, with authored anchor source merged and non-overlapping technical preparation in draft review; runtime integration remains held behind #82. No merge, deployment, or end-to-end verification is claimed for either issue.


## Production update — 24 November 2026 (QA-82-3 owner ruling)

**Authority:** Game Director ruling, 24 November 2026, recorded on Issue #82 and PR #88.

- QA-82-3 is unblocked. Temporarily withhold any curated Character Creator sample containing raw sign-catalog notation (e.g. `×1N57`) from the picker. Do not expose the notation as a player-facing display name.
- If fewer than approximately four curated choices remain, Design HQ may provide clean, readable period-grounded names from the existing verified Uruk pool, or strip a suffix only when the remainder is already a source-supported standalone display form. No speculative pronunciation.
- Existing saves and character identities are unchanged; no save migration or identity rewrite.
- Production is authorized to complete QA-82-1 through QA-82-5, run the complete acceptance/regression suite, and merge Issue #82 when verified. Issue #82 remains the sequencing gate before overlapping Issue #85 runtime edits; non-overlapping Issue #85 preparation may continue.

This is an implementation authorization and presentation rule, not a revision to the historical name source or the character's saved identity model. No merge/deployment/verification status is implied by this note.

## Issue #82 verification and Issue #85 runtime authorization — 24 November 2026

**Verified main baseline:** `main` at `7fe4a2cb695ed8b4aaac18b02490f3871046d69b`. This addendum supersedes the earlier Issue #82 / #85 status entries above.

### Issue #82 — CLOSED · VERIFIED

- PR #88 merged as `45251e76482e7b770e0d35016d2eff11939ca4b8`.
- The Game Director recorded the deployed smoke-test results and formally closed Issue #82. Verification included Day 9 legacy-save restoration preserving `Šubur-e₂a×1N57`, all five QA findings, fresh character creation through tutorial/Assignment/causal Day 3 Challenge, Currency presentation, and narrative resolution feedback.
- The sequencing gate is satisfied. The earlier statements that Issue #82 remains open or blocks overlapping Issue #85 work are superseded.

### PR #87 — MERGED

- PR #87 merged after synchronization with `main` and fresh validation on the resulting documentation head.
- Merge commit: `7fe4a2cb695ed8b4aaac18b02490f3871046d69b`.
- Pull Request Validation #430 and CodeQL #301 passed on exact head `975de014c31d4a49eea4faea4f479606efa64b29`.
- The technical-design note now records the approved schema-v3/Day-Close contract, ratified provisional Playtest 1 economy, and non-blocking South-Court offer disclosure / Responsibility-choice polish.

### Issue #85 — runtime implementation authorized and in progress

- The Game Director authorized schema v3, v2→v3 migration and rollback protections, settlementId exactly-once settlement, the ratified provisional Playtest 1 economy, and authored per-Assignment Provisions-in-kind compensation.
- The current `main` save schema remains v2 until the runtime PR merges. Do not describe schema v3 as shipped.
- **PR #90 — OPEN:** first persistence-foundation slice on `production/issue-85-schema-v3-day-close`. It adds the v3 state/envelope model, validated v2 migration, exact-byte rollback copy, legacy Challenge suppression entries without fabricated provenance, explicit new-game seed persistence, and Day-Close provider write rollback.
- PR #90 does not yet implement the two-step preliminary close / Interlude / Begin Workday transitions, compensation credit timing, replenishment transactions, Assignment Supply, or the general Challenge Director.
- PR #90 current head after synchronizing with the PR #87 merge: `0ae9b4b030036e4ad4d5c905ea738aaea6c85985`. Pull Request Validation #433 and CodeQL #305 were in progress at the time of this status entry. An earlier validation attempt failed on tests that have since been corrected; do not treat the earlier run as current-head validation.
- No local tests were executed. No merge or deployment of PR #90 is claimed.

### Non-blocking content/UI follow-up

- South-Court offer cards disclose the authored +1 Provision compensation before acceptance.
- South-Court Responsibility choices add a second plausible scenario-specific claim beside “No individual responsibility assigned”; do not restore the unrelated Dudu option.

**Current production state:** Issue #82 — CLOSED / VERIFIED. PR #87 — MERGED. Issue #85 — IN PROGRESS / AUTHORIZED. PR #90 — OPEN / CI PENDING. The next implementation slices remain gated on review and merge of the persistence foundation, then will proceed through Day-Close transitions and compensation timing before broader Assignment Supply / Challenge Director integration.


## GD-CHALLENGE-DIRECTOR-002 — Challenge Director runtime progress — 24 November 2026

**Verified main baseline:** `main` at `34dfbd2cd09e151cc2c19ddcaa03d8bbd8b32fe7`. A direct comparison confirms `main` is identical to this merge commit.

### Authorization and merged slices

- **GD-CHALLENGE-DIRECTOR-002:** APPROVED — READY FOR IMPLEMENTATION by PR #101. Documentation handoff merged as `59ed493de6d520c2839d9361fb69fc7ebf5c8358`. It authorizes the Challenge Director runtime work under Issue #85; it does not complete Issue #85.
- **PR #102 — MERGED:** `c5f06ad2fdf96b7527a28bd8a3c00061fe5bad51`. Challenge evaluation now precedes Morning Report assembly in `BEGIN_WORKDAY`; an integration regression verifies that a newly selected Challenge appears in that same Workday's report exactly once. TypeScript, unit tests, production build, and CodeQL passed on its PR head.
- **PR #103 — MERGED:** `34dfbd2cd09e151cc2c19ddcaa03d8bbd8b32fe7`. Adds an authored candidate pool retaining The Seven Sealed Jars and The Missing Measure; typed trigger resolution for player-action outcomes, professional-behavior patterns, event-linked relationship updates, institutional-matter updates, and directly referenced authored world events; deterministic weighted selection using the existing schema-v3 seed; canonical occurrence identity and source provenance; occurrence lifecycle updates; duplicate suppression; the tutorial gate; at-most-one arrival per evaluation; and the two-unresolved cap, excluding declined Challenges.

### Technical and persistence decisions

- Existing schema-v3 `selectionSeed` and `occurrenceLedger` are reused. No save field, schema version, or migration was added.
- The canonical occurrence key is also the new Challenge instance ID, allowing the existing ledger entry to be found for lifecycle updates without changing `ChallengeInstance`.
- New ledger entries retain the scenario ID, matter ID when applicable, primary Event/Record, required source IDs, actual delivery channels, presentation day, and lifecycle.
- Legacy suppression uses existing fixed Challenge IDs, archived outcomes, and migrated legacy ledger entries. No missing historical cause or source identity is synthesized.
- The two existing one-shot Era I candidates currently use equal authored weight 1. Their existing one-time semantics are retained.
- The director selects at most one candidate per evaluation and does not create a queued backlog. A full unresolved cap skips evaluation; candidates are reconsidered only at a later normal evaluation if their causal facts remain eligible.

### Validation actually executed

On PR #103 head `5b0e9c7cdd2d920ac5e16ba6e7d9547ce2c89c6d`:
- TypeScript check: **passed**.
- Unit tests: **37 test files / 275 tests passed**.
- Production build: **passed**.
- CodeQL JavaScript/TypeScript analysis: **passed**.

Local test/build execution was not performed in this environment. These results are the actual GitHub Actions results for the PR head. The merged main commit was verified by comparison; no deployment workflow run or deployment result was returned for that merge commit. Deployment is therefore **NOT VERIFIED / NOT RECORDED** here.

### Remaining Issue #85 work

- The typed resolver accepts a directional relationship update only when the latest history entry for the specifically referenced pair links to an existing Event. Several current relationship producers append history without an event link; those changes cannot be used as durable occurrence provenance under the existing Event/Record-only ledger contract. No synthetic event or schema change was introduced.
- The current two Era I candidates do not use relationship-update or standalone authored-world-event triggers. The resolver supports both domains, but no additional scenario prose was invented.
- Complete integrated Issue #85 acceptance remains outstanding: multi-day gameplay, all four orientations, unresolved-cap/decline/recurrence behavior in the playable flow, succession continuity, and relevant save/load compatibility must be verified together.
- The non-blocking South-Court follow-ups remain outstanding on the verified main baseline: the Assignment offer card displays Money and Career XP but omits the authored +1 Provision compensation; the Responsibility list offers “No individual responsibility assigned” and an unsupported Enlil-kisu blame claim, but no second plausible scenario-specific claim. Do not restore the unrelated Dudu option.
- Issue #85 remains **OPEN / IN PROGRESS**. The Challenge Director runtime slices are **IMPLEMENTED / TESTED / MERGED**; integrated acceptance is **NOT VERIFIED**; deployment is **NOT VERIFIED / NOT RECORDED**.

This addendum supplements the earlier dated snapshots. It does not close Issue #85, amend the GDD, or claim deployment or manual acceptance.


## GD-STATE-INTEGRITY-001 — Production implementation status — 24 November 2026

**Specification:** GD-STATE-INTEGRITY-001  
**Authorization:** PR #106 merged as `53ddc2b07d1a9fbf1d05aad81231c9318845cc73`; Issue #107 remains OPEN / IN PROGRESS.  
**Verified main baseline:** `main` at `cc067da72a2c6d07d62a8eb7cafab3743f5de576`. A direct comparison confirms the branch's final implementation merge is identical to current `main`.

### Completed production slices

- **WP0 — IMPLEMENTED / MERGED:** PR #108, merge `01d8bb12d54d98553a2e16d4f499a1b77bbe95dc`. Added `docs/production/GD-STATE-INTEGRITY-001-WP0-AUDIT.md`, mapping the live source/state model, Day-13 fields, relationship writers, matter lifecycle, and People & Institutions presentation baseline. The audit did not change runtime code or design documents.
- **WP1 — IMPLEMENTED / TESTED / MERGED:** PR #109, merge `919e1e5c06bef32557520a8f9edcadb74663558e`. Corrected F02/F04 secondary relationship-history summaries: receiver dialogue remains on the receiver's directional edge; secondary recipients retain the authored trust/respect changes but receive neutral summaries identifying the submitting scribe, report title/day, and affected perspective. No NPC speech, relationship formula, or save field was invented.
- **WP2 task feedback — IMPLEMENTED / TESTED / MERGED:** PR #110, merge `3d1555b4de0dbeb37dfbee57c48c69431bf3ce78`. South-Court comparison feedback now reports 24 dispatched / 23 received, leaves cause/responsibility unresolved, and states that the storehouse matter remains open. The action still does not resolve or mutate the institutional matter.
- **WP3/WP4 — IMPLEMENTED / TESTED / MERGED:** PR #111, merge `131c58ea834a48c11d5ca6e6d27b10436f3b9f44`. Added searchable People and Institution directories, selected-profile detail, directional relationship disclosures, compact sparse-state presentation, current/historical matter separation, full linked institutional-record detail, and a repeatable Day-13 snapshot display-projection fixture.
- **WP2 lifecycle presentation — IMPLEMENTED / TESTED / MERGED:** PR #112, merge `cc067da72a2c6d07d62a8eb7cafab3743f5de576`. Institution matter detail now displays existing institutional-response stage events with actor, appointment, decision, linked Record, scope, execution, verification, resolution, and event references.

### Existing matter lifecycle mapping

No new matter status or transition was added.

- `InstitutionalMatter.status === 'active'` is presented as active/open.
- Evidence/activity updates are represented by Records, provenance, and activity history while the matter remains active.
- Assessment, authorization, commitment, execution, verification, and resolution are existing `InstitutionalResponse.stage` events. The UI displays recorded stages and does not infer an unrecorded “awaiting decision/authority” status.
- `developed` remains distinct from `resolved`; it is retained as a predecessor/follow-up matter.
- `resolved` remains the explicit resolved status.
- No distinct closed/archived matter status exists; historical matter and Record objects remain retained.

The People & Institutions UI derives current matter display from matter status and institution ID, rather than relying solely on the denormalized `Institution.activeMatters` index. This is read-only and does not repair state. The save validator still checks listed index entries but does not enforce the reverse invariant; no migration or persistent-state repair was introduced. The audited matter writers update status/index together, but a future validator/normalization change requires a separate compatibility review.

### Relationship familiarity — BLOCKED / DESIGN HQ DECISION REQUIRED

- `docs/design/WORLD_SIMULATION_SPEC.md` describes gradual personal familiarity from repeated meaningful interactions.
- Runtime directional `relationship.dimensions.familiarity` is initialized at 0, but the audited consequence writers do not accrue that numeric dimension.
- `PersonFamiliarity` is a separate domain-exposure record and is not a substitute for personal relationship familiarity.
- The approved contract does not specify which interactions count or the deterministic increment/threshold rule. Production changed no familiarity values, thresholds, formulas, or save fields.
- The question is escalated on Issue #107 for Design HQ to define the behavioral contract before Production implements it.

### Day-13 reconciliation — PARTIALLY IMPLEMENTED / NOT VERIFIED

- The merged Day-13 display fixture seeds the approved final observed values (AP 3/6, Currency 77, Provisions 9, Career XP 631, Professional Rank Grade 1, Historical Progress XP 0, Stress 5) and verifies that the UI projects those values from their respective state fields.
- The fixture is explicitly a **display-projection fixture**, not a reconstructed gameplay save or transaction trace. It does not prove how the balances or Stress were produced.
- The archived-record count is read from the actual Record collection; the exact Day-13 archived-record count and its transaction/history source remain unreconciled.
- Exact balance/source reconciliation requires the actual Day-13 save/export and its available event/Record history.

### Validation actually executed

GitHub Actions on the exact PR heads:

| PR | TypeScript | Unit tests | Production build | CodeQL |
|---|---|---:|---|---|
| #108 | Passed | 37 files / 276 tests | Passed | Passed |
| #109 | Passed | 37 files / 277 tests | Passed | Passed |
| #110 | Passed | 37 files / 276 tests | Passed | Passed |
| #111 | Passed | 38 files / 279 tests | Passed | Passed |
| #112 | Passed | 38 files / 279 tests | Passed | Passed |

These are GitHub Actions results on the respective PR heads. Local test/build execution was not performed in this environment.

### Outstanding work and limitations

- **BLOCKED — Design HQ:** define the numeric personal relationship-familiarity accrual contract (meaningful interaction types and deterministic behavior). No production formula may be inferred.
- **BLOCKED — Day-13 evidence:** obtain the actual Day-13 save/export to reconcile balances, Stress, transaction/event sources, and archived-record count.
- **NOT TESTED — UI accessibility:** manual browser interaction, keyboard-only operation, screen-reader announcements, 200% zoom, and narrow viewport checks remain outstanding. Static render captures are not a substitute for these checks.
- **NOT VERIFIED — Deployment:** no deployment workflow result was returned for the merged main commit. Deployment is not claimed.
- **Historical research:** no new specific historical claim requiring external verification was identified in this work package; no new historical content was authored.

**Issue #107 status:** OPEN / IN PROGRESS. WP0 audit, WP1 relationship attribution, WP2 comparison feedback and lifecycle presentation, WP3 information architecture, WP4 sparse-state presentation, and the Day-13 display fixture are IMPLEMENTED / TESTED / MERGED. Full Day-13 reconciliation, familiarity design decision, manual accessibility checks, and deployment verification remain outstanding. Issue #107 is not VERIFIED or closed.

## GD-FAITHFUL-RECALL-001 — queue placement and production preparation — 24 November 2026

**Authority:** Game Director directive through Design HQ, 24 November 2026.  
**Design status:** **APPROVED DESIGN PRINCIPLE — NOT READY FOR IMPLEMENTATION.**  
**Production status:** Queue placement recorded; architecture review **NOT STARTED**; runtime implementation **NOT AUTHORIZED**.

### Queue placement and priority protection

- **Issue #85 — GD-OPPORTUNITY-001:** remains the active implementation priority. Faithful Recall does not interrupt, reorder, or broaden Issue #85.
- **Issue #107 — GD-STATE-INTEGRITY-001:** continues within its existing approved audit scope. Existing WP1 relationship-provenance and familiarity findings may be noted as constraints where relevant, but no recall work package is added to Issue #107.
- **GD-FAITHFUL-RECALL-001:** placed in the post-Issue-#85 design/architecture queue. No overlapping implementation branch is to be created, and no speculative persistence changes are authorized.

### Documentation readiness

The approved principle establishes these boundaries: contemporaneous observation, contemporaneous recorded conclusion, and subsequent verification remain distinct and chronologically faithful; original records are immutable; corrections are additional records; unrecorded thoughts are never invented; recall has no fallible interpretive layer; current-character interpretation remains in labelled internal monologue; and succession does not transfer predecessor observations or conclusions.

The supporting behavioral contract is **NOT READY / NOT RECEIVED** by Production. Design HQ must settle the directive's listed questions before architecture assessment begins:
- encounter criteria for character observations;
- qualifying in-world artifacts for contemporaneous conclusions;
- representation and linkage of subsequent verification;
- chronology and provenance presentation;
- correction/amendment behavior preserving originals;
- personal experience versus institutional/inherited professional records;
- successor access without personal-knowledge inheritance;
- separation from current-character internal monologue.

Production will not infer these rules from the principle wording.

### Architecture review status and coverage

- **Architecture review:** **NOT STARTED — gated on the supporting behavioral contract and a later queue opening after Issue #85.**
- **Existing implementation coverage:** **NOT ASSESSED for Faithful Recall.** Existing Event, Record, Knowledge, history, journal, character-access, persistence, and succession systems have not yet been reviewed against a complete Faithful Recall contract. The Issue #107 source audit is not a substitute for that review.
- **Known adjacent implementation fact:** Issue #107's WP1 audit distinguishes numeric directional relationship familiarity from the separate `PersonFamiliarity` domain-exposure record. Neither is to be conflated with Knowledge, Record, or personal recall. This observation does not authorize familiarity changes or recall implementation.
- **Technical decisions:** none made. No data model, serialization, persistence, migration, correction API, or UI contract is proposed as settled.
- **Save compatibility / migration risk:** **UNKNOWN — NOT ASSESSED.** Any persistent-state proposal will require a reviewed plan covering migration, rollback, determinism, and legacy-save compatibility before implementation authorization.
- **Determinism:** the principle prohibits runtime generative AI for recall, record validation, or outcome determination. Detailed deterministic contracts remain for Design HQ and subsequent technical review to define within their respective authorities.

### Recommended post-contract architecture-review work packages

These are estimates for the bounded assessment only, not runtime implementation estimates:

| Work package | Scope | Estimate |
|---|---|---:|
| FR-A — Domain model inventory | Event, Record, Knowledge representations and relationships | 0.5–1 engineer-day |
| FR-B — Provenance and lifecycle trace | Record creation, contemporaneous conclusions, amendments, verification links, chronology | 1–2 engineer-days |
| FR-C — Access and succession trace | Character knowledge acquisition, personal/institutional records, successor access and non-inheritance | 1–1.5 engineer-days |
| FR-D — Presentation and persistence review | History/journal/recall surfaces, UI distinctions, save/load and compatibility implications | 1–1.5 engineer-days |
| FR-E — Technical assessment and test strategy | Coverage/gap matrix, technical contracts, migration risks, deterministic tests, dependencies and recommended slices | 0.5–1 engineer-day |

**Assessment estimate:** approximately **3.5–7 engineer-days**, after the behavioral contract is complete and the queue is opened. This estimate excludes implementation, migrations, authored content, and manual UX/accessibility validation. Runtime implementation effort is **NOT ESTIMATED** until the review identifies actual gaps and Design HQ issues a complete handoff.

### Required authorization boundary

This record is queue planning only. It does not mark Faithful Recall implemented, tested, verified, or ready for implementation. No runtime files, GDD, Decision Register, Open Design Register, save schema, migration, or existing record semantics were changed by this entry.

**Next action:** Design HQ completes and reconciles the supporting behavioral contract. After Issue #85 priority protection and contract readiness, Production conducts FR-A through FR-E and returns the technical assessment to Design HQ. A separate approved **READY FOR IMPLEMENTATION** handoff is required before runtime work.

## GD-OPPORTUNITY-001 — South-Court compensation correction — 25 November 2026

**Authority:** Game Director explicitly directed Production to preserve the observed +1 Provision as the intended South-Court Assignment compensation and correct the authored offer/settlement path. This is an authorized, scenario-specific content correction. The proposed second Responsibility claim remains **PROPOSED — NOT APPROVED FOR RUNTIME IMPLEMENTATION** and is not included.

- **PR #118 — OPEN / NOT MERGED:** `fix/issue85-south-court-provision-contract`, head `2f6f792c430592a723c8e8e057059fc0bba86315`.
- **Authored offer:** South-Court now reads `ERA_I_ASSIGNMENT_PARAMETERS.explicitProvisionContract.provisions` (1) rather than the tier-wide `tierB.defaultProvisions` (0). The global tier-B default remains 0; South Loading-Awning remains 0.
- **Generation and disclosure:** generator coverage checks the actual generated offer. The pre-acceptance Workday Hub test no longer mutates the offer fixture; it verifies the actual generated +1 contract is disclosed as `+1 Provision in kind`.
- **Acceptance and submission:** the activity integration test checks that the generated +1 contract survives acceptance and submission, queues exactly one pending Assignment credit for +1 Provision, and preserves the existing report/matter behavior.
- **Day-Close settlement:** the integration test checks the Day-Close breakdown credits +1 Assignment Provision, Begin Workday marks that credit against the settlement ID, and duplicate Begin Workday does not credit it again. With the fixture's initial 5 Provisions and one unit of sustenance, the resulting wallet remains 5.
- **Persistence:** no schema or save-shape change. The existing pending-credit and settlementId exactly-once path is reused.
- **Validation on exact PR head:** Pull Request Validation run 596 completed successfully: TypeScript passed, 38 test files / 279 tests passed, production build passed. CodeQL run 480 was still in progress at the time of this status entry. No local execution is claimed.
- **Review / merge / deployment:** no review recorded; PR not merged; deployment not performed or verified. Issue #85 remains OPEN / IN PROGRESS and integrated acceptance remains outstanding.

**Next:** complete CodeQL and review PR #118. Separately, Design HQ's qualified origin-side dispatch-count/handling Responsibility proposal requires design review and explicit approval before any runtime claim/evaluation changes. No Dudu option, Enlil-kisu default blame, Utu-mansum blame, institutional matter resolution, or account adjustment was introduced.
