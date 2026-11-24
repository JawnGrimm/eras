# QA-ISSUE-82 — Character Creation / Tutorial Smoke-Test Triage

**Status:** TRIAGED — READY FOR GAME DIRECTOR REVIEW  
**Source:** Game Director's manual smoke test of the deployed Character Creation → Workday 1 → Storehouse Reckoning build, 24 November 2026; Issue #82 and its source follow-up.  
**Authority:** Issue #82 records observed defects, not new design approval. This document is a QA handoff proposal, not Production authorization.

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
**Root cause:** Not yet verified. Production must inspect the curated sample source and Creator/header display path.

**Expected behavior:** Curated samples are player-readable display forms. Sign-list/catalog notation is not exposed as the character's display name. Historical source notation may be retained separately as provenance/reference metadata. Do not invent or imply a reconstructed pronunciation.

**Acceptance / regression:**
- Audit all curated sample names, not only the observed one.
- Separate any retained source/catalog notation from the display-name field.
- Verify Creator review, confirmed protagonist header, and relevant biography surfaces use the display form consistently.
- Add a regression for the reported sample and a catalog-level check preventing source notation from entering player-facing display names.
- Preserve the approved custom-name rules and existing saved character identities; do not silently rename existing saves.

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

**Status boundary:** This document is a Design HQ triage package for review. It does not authorize code changes, reprioritize Production, or declare any defect fixed. Issue #82 remains open until Production reports and the Game Director accepts the appropriate disposition.
