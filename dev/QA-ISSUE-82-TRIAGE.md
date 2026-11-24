# QA-ISSUE-82 — Character Creation / Tutorial Smoke-Test Triage

**Status:** APPROVED — READY FOR QA HANDOFF (Game Director sign-off, 24 November 2026)  
**Source:** Game Director's manual smoke test of the deployed Character Creation → Workday 1 → Storehouse Reckoning build, 24 November 2026; Issue #82 and its source follow-up.  
**Authority:** Issue #82 records observed defects. The Game Director approved this triage package on 24 November 2026; Production is authorized to begin the five independent QA corrections under `docs/production/PRODUCTION-HANDOFF-001.md`.

## Current execution status — 24 November 2026

This status note tracks the authorized QA handoff; it does not change the acceptance criteria below.

- **QA-82-1:** Implemented in PR #88. Assignment-specific responsibility guidance is authored on the relevant Assignment definitions; the shared screen renders only the active definition's hint.
- **QA-82-2:** Implemented in PR #88. Storehouse Work actions carry authored success messages, and unknown action labels use a neutral fallback rather than exposing internal IDs.
- **QA-82-3:** Implemented in PR #88 under the approved temporary-withholding ruling. The source catalog remains unchanged; the Character Creator picker omits the single curated name containing the raw catalog multiplication marker. **Seven** curated choices remain, above the approximately-four-choice fallback threshold. No substitute names or suffix stripping are needed. No speculative pronunciations; saved identities are untouched.
- **QA-82-4:** Implemented in PR #88. Fresh-game Day 1 no longer seeds “The Apprentice's Copy”; Era I Challenge selection and the Challenge Director are held until Storehouse Reckoning is completed; the invalid legacy starter instance is suppressed from presentation without save mutation; resolution feedback identifies the selected authored outcome.
- **QA-82-5:** Implemented in PR #88. Player-facing Era I Money presentation uses **Currency**, including Assignment compensation, Workday/settlement guidance, succession, and Ur-gir advance/obligation copy. New obligations use Currency wording; legacy obligation descriptions are presented compatibly without rewriting saved records or balances.

**PR #88:** OPEN / DRAFT / UNMERGED at `c85425b601a29737aea95de40ccd6ada96dab0a1`. The branch includes current `main` at PR #89 merge commit `2a0e5081c456809e6c1e7129646b39629dd78a30`; GitHub reports no base divergence and no merge conflict. Pull Request Validation #421 passed: TypeScript check, **29 test files / 222 tests**, and production build. CodeQL #291 passed. No local test execution, merge, deployment, or manual in-browser acceptance verification is claimed. Issue #82 remains open until PR #88 is reviewed, merged, deployed, and verified.

## 1. Scope and disposition

Issue #82 contains five independent findings. Keep them separately traceable; do not fold them into the Assignment/Challenge generator implementation or treat this triage as permission to reprioritize Production.

- Findings 1–3 are direct UI/content defects. Their exact source locations and root causes remain **unverified by Design HQ** and must be established by Production.
- Finding 4 overlaps the approved GD-OPPORTUNITY-001 Challenge onboarding contract. The existing source path is known from repository follow-up: `starterChallenge()` in `src/state/newGameState.ts` seeds “The Apprentice's Copy” during fresh-game initialization; the generic resolution banner is returned by the Challenge resolution handler in `src/engine/opportunities.ts`. These are source leads, not a claim that the current main branch has been re-audited in this triage.
- Finding 5 is resolved at the design level: the player-facing Era I balance label is **Currency**, not Silver. The implementation surfaces still require audit and correction.

## 2. Defect triage

### QA-82-1 — Cross-Assignment text bleed

**Observed:** South-Court Delivery Reconciliation → “Responsibility claim”; the second option displays unrelated Dudu contract text.

**Classification:** Content isolation / scenario-data binding defect.  
**Root cause:** Not yet verified. Production must identify whether the wrong text is authored in the active scenario, referenced through a shared content key, or selected through a runtime binding/index error.

**Expected behavior:** Each choice displays only the text authored for that choice in the active Assignment. Content from another Assignment or scenario cannot leak across boundaries.

**Acceptance / regression:**
- Reproduce the exact South-Court choice and verify its authored text.
- Inspect all choices in that Assignment and the source content mapping.
- Add a regression asserting the active choice resolves to its own authored content.
- Add a content-isolation test covering at least one other Assignment with similarly structured choices.
- Do not rewrite unrelated scenario prose or introduce a general content framework in this fix.

### QA-82-2 — Raw internal key in Tutorial alert

**Observed:** Tutorial alert displays `intake_issue`.

**Classification:** Player-facing presentation leak of an internal action/event identifier.  
**Root cause:** Not yet verified. Production should trace the alert producer, message-key mapping, and rendering fallback.

**Expected behavior:** The alert displays authored player-facing copy. Internal action IDs, event keys, and unresolved localization/content keys are never rendered as visible labels.

**Acceptance / regression:**
- Reproduce the alert through the tutorial path that emits `intake_issue`.
- Verify the intended authored copy is displayed.
- Add a regression for that alert and a defensive test that an unmapped internal key does not silently become player-facing text.
- Keep this narrowly scoped; no general localization rewrite is authorized.

### QA-82-3 — Raw sign-catalog notation in curated character name

**Observed:** The curated sample `Šubur-e₂a×1N57` is displayed literally in the protagonist header.

**Classification:** Display-name/content editorial defect; provenance/display separation.  
**Root cause:** Production must inspect the curated sample source and Creator/header display path; do not assume the header is the only affected surface.

**Game Director ruling (24 November 2026): APPROVED — TEMPORARY WITHHOLDING.**
- Temporarily omit any curated sample name containing raw sign-catalog notation (including suffix patterns such as `×1N57`) from the Character Creator picker.
- This is a picker availability filter, not a rename or deletion of historical source data. Preserve source notation/provenance separately where already represented.
- Fallback only if withholding leaves fewer than approximately four curated sample choices: Design HQ may supply clean, readable, period-grounded names from the existing verified Uruk pool, or strip catalog suffixes only where the remaining form is already a valid standalone display form supported by the source.
- Do not invent speculative pronunciations or unsupported names.
- Existing saved characters and identities remain untouched; no save migration or rewrite.

**Acceptance / regression:**
- Audit all curated sample names and identify which contain raw catalog notation.
- Confirm the picker omits every affected option and retains all unaffected valid options.
- Count the remaining curated choices. Invoke fallback only if fewer than approximately four remain; report the exact count and proposed source-backed forms to Design HQ.
- Verify Creator review and all player-facing name surfaces cannot expose the raw catalog notation through the curated picker path.
- Add a regression for the reported sample and a catalog-level test for the withholding rule.
- Preserve custom-name rules and existing saved character identities. Do not rewrite existing saves.

### QA-82-4 — “The Apprentice's Copy” onboarding gate and outcome feedback

**Observed:** The Challenge appears on fresh-game Workday 1 before initial Storehouse Reckoning completion. On resolution, the banner reports only that the Challenge was resolved and archived.

**Classification:** Approved behavioral-contract violation plus inadequate outcome feedback.

**Known source leads from Issue #82 follow-up:**
- `starterChallenge()` in `src/state/newGameState.ts` constructs the fresh-game Challenge as an initialization seed, bypassing the END_DAY Challenge Director.
- The generic resolution banner is returned by the Challenge resolution handler in `src/engine/opportunities.ts` and does not summarize the scenario's narrative outcome.

**Required design behavior (approved):**
- No unprompted Challenge is generated, selected, queued, or surfaced during Workday 1 or supervised Storehouse Reckoning onboarding.
- “The Apprentice's Copy” is held until the initial Storehouse Reckoning is complete. No Day 1 guided-vignette exception is approved.
- Do not bank a generic onboarding trigger and release it after the gate. After the gate opens, it may be eligible only if a real, still-valid authored cause exists.
- Challenge resolution feedback summarizes the actual narrative outcome and material consequence, not merely an archive/status transition.

**Acceptance / regression:**
- Fresh game: no Challenge exists or appears before initial TSR completion, including through bootstrap state.
- Complete TSR: no automatic release occurs solely because the gate opened; only a still-valid causal trigger can make a Challenge eligible at a later normal evaluation.
- Existing valid save restoration remains unchanged; test a save made before/after TSR completion as appropriate to the current save model.
- Resolve the Challenge through each supported outcome path and verify the feedback identifies the actual outcome and material consequence without revealing knowledge the character does not possess.
- Test duplicate prevention and the approved Playtest 1 zero-or-one arrival / two-unresolved cap behavior.
- Preserve the Challenge outcome archive and existing consequence semantics.

### QA-82-5 — Era I “Silver” balance label

**Observed:** The abstract Money balance/payment is presented as “Silver” in the Workday header, Assignment compensation, and hardship UI.

**Classification:** Historical-presentation defect. The Game Director has resolved the design question.

**Approved correction:** Use **Currency** as the player-facing Era I label for the abstract balance. Keep the two-balance model unchanged. Do not imply silver coinage, shekel denomination, or an attested Late Uruk silver-payment economy.

**Acceptance / regression:**
- Audit every player-facing occurrence of the old label, including balances, Assignment offers/settlement, hardship/shortage UI, transaction confirmations, reports, and tooltips.
- Replace player-facing balance/payment label with **Currency** consistently; retain internal identifiers only where required by technical compatibility.
- Ensure no copy describes a silver coin, shekel, or historically attested silver payment.
- Test existing schema-v2 save restoration and balances unchanged; this is a presentation/content correction, not a new balance or save migration.
- Currency-to-Provisions purchasing in the Evening Interlude follows GD-OPPORTUNITY-001: abstract price/conversion is **PROVISIONAL for Playtest 1**, not a historical rate.

## 3. Dependencies and sequencing

| Finding | Relationship to GD-OPPORTUNITY-001 | Handoff treatment |
|---|---|---|
| QA-82-1 | Independent Assignment content defect | Separate narrow QA fix; no generator redesign |
| QA-82-2 | Independent tutorial alert presentation defect | Separate narrow QA fix; no localization-system expansion |
| QA-82-3 | Character Creator curated-name presentation | Separate narrow QA fix; preserve source provenance and existing saves |
| QA-82-4 | Directly overlaps Challenge onboarding and outcome-feedback behavior | Keep linked to Track 2 acceptance; Production should implement one coherent gate/feedback behavior, not parallel fixes |
| QA-82-5 | Currency presentation is an approved Era I boundary; purchase behavior is in §3.6–3.7 of GD-OPPORTUNITY-001 | Coordinate label audit with the provisional Interlude transaction UI; do not alter balances or infer historical exchange rates |

Production determines implementation order, hotfix size/risk, exact source files, technical approach, and whether defects can ship independently. No priority displacement is implied. If Production proposes a shared fix that changes approved behavior, persistence, or save compatibility, return it for review before implementation.

## 4. Shared compatibility and QA requirements

- Preserve schema-v2 saves and existing character identities; do not synthesize new history/provenance or rename saved characters as part of these fixes.
- Do not alter the approved Creator's custom-name validation contract.
- Keep internal IDs, catalog/source notation, and technical content keys separate from player-facing display strings.
- Challenge onboarding behavior must match the approved GD-OPPORTUNITY-001 contract.
- Currency is a display label for the existing abstract balance, not a new resource.
- Run targeted regressions for each finding, then the relevant integrated Creator → Workday 1 → TSR → post-TSR Challenge path. Report tests actually executed, not merely added.

## 5. Production response required

For each finding, report:
1. Reproduction result and exact source/content location.
2. Root cause and proposed minimal correction.
3. Files and technical/data-model impact.
4. Save/persistence compatibility impact (expected: none).
5. Regression tests written and tests actually executed.
6. Hotfix risk/size and recommended sequencing.
7. Any deviation from the approved expected behavior.

**Execution boundary:** This approved package authorizes Production to investigate and implement QA-82-1 through QA-82-5 independently and immediately, without waiting for the broader GD-OPPORTUNITY-001 runtime milestone or Evening Interlude UI. QA-82-5 Currency-label replacement may ship across existing surfaces now. This does not silently reprioritize other roadmap work; Production reports sizing/risk and coordinates sequencing. Issue #82 remains open until fixes are verified and accepted. No defect is declared fixed by this document.


## Game Director ruling update — 24 November 2026

QA-82-3 is unblocked under the temporary-withholding decision above. Production is authorized to complete QA-82-1 through QA-82-5 together, run the complete regression/acceptance set, and merge Issue #82 once verified. Issue #82 remains ahead of overlapping Issue #85 runtime edits; independent Issue #85 preparation may continue. The ruling is recorded in the Issue #82 GitHub thread.
