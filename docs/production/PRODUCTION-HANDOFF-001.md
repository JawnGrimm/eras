# PRODUCTION-HANDOFF-001 — Opportunity Systems and Issue #82 QA

**Status:** APPROVED — READY FOR PRODUCTION  
**Authority:** Game Director sign-off, 24 November 2026; PR #83 merged as `d6e426cf2317cb3b77c68ed086c5fb4431ca7c49`.  
**Behavioral specification:** `dev/GD-OPPORTUNITY-001.md` — APPROVED — READY FOR IMPLEMENTATION.  
**Independent QA package:** `dev/QA-ISSUE-82-TRIAGE.md` — APPROVED — READY FOR QA HANDOFF.  
**Scope:** Documentation/behavioral authorization. Production owns exact technical contracts and implementation. This handoff does not pre-approve a save-schema change or any deviation from the behavioral spec.

## 1. Production sequencing — two independent workstreams

### Workstream A — Issue #82 QA corrections (may start immediately)

Production may investigate and implement QA-82-1 through QA-82-5 independently, without waiting for GD-OPPORTUNITY-001's broader runtime work or the Evening Interlude UI. Current execution status is tracked in `dev/QA-ISSUE-82-TRIAGE.md`: Draft PR #88 implements QA-82-1, -2, -4, and -5 with passing latest-head CI; QA-82-3 is now unblocked by the Game Director's 24 November ruling approving temporary withholding of curated options containing raw sign-catalog notation. Issue #82 remains open and is still the runtime sequencing gate for overlapping opportunity/UI files. In particular:

- QA-82-1 cross-Assignment text bleed: isolate the active option's authored content.
- QA-82-2 raw `intake_issue` alert key: restore player-facing tutorial copy.
- QA-82-3 curated sign-catalog notation: **UNBLOCKED — temporarily withhold affected curated options from the Character Creator picker.** If fewer than approximately four choices remain, Design HQ may provide clean readable names from the verified Uruk pool or strip only a suffix whose remainder is a source-supported standalone display form. No speculative pronunciations; existing saves untouched.
- QA-82-4 “The Apprentice's Copy”: remove fresh-game Day 1 pre-seeding/bypass; enforce the approved post-TSR gate and narrative outcome feedback.
- QA-82-5 replace player-facing **Silver** with **Currency** across existing surfaces now. Do not wait for Evening Interlude UI. This is a presentation correction to the existing abstract Money balance, not a new balance or save migration.

Use `dev/QA-ISSUE-82-TRIAGE.md` for per-finding acceptance and regression criteria. Production should report exact source locations, root causes, files, tests actually executed, and save compatibility. The QA package does not require a broad localization, content, or Challenge rewrite. Keep the five findings separately traceable; Issue #82 remains open until the fixes are verified and accepted. The QA-82-3 owner decision is no longer a blocker.

### Workstream B — GD-OPPORTUNITY-001 runtime implementation

Proceed against the approved behavioral contract. Production may plan and implement the Assignment Supply, Challenge Director, and Day-Close / Evening Interlude as one coordinated behavioral milestone, while preserving the separation between their domain rules.

**Do not wait for a future edit to `docs/GDD.md` to implement the Evening Interlude.** The Game Director's approval recorded in `docs/design/DECISION_REGISTER.md` and the detailed approved sequence in GD-OPPORTUNITY-001 §3.7 are sufficient present authorization. The next coordinated GDD update should add the small §6.4 clarification note; that later documentation edit is not an implementation prerequisite. Do not independently edit the canonical GDD as part of this handoff.

## 2. Playtest 1 provisional numeric defaults — keep momentum

The Playtest 1 Currency-to-Provisions conversion and provisions-in-kind payouts are explicitly **PROVISIONAL**. Do not block the runtime milestone waiting for final balance calibration.

Production is authorized to prepare concrete **PROVISIONAL numeric default proposals** for immediate playtesting:
- Propose an initial Currency-to-Provisions price/conversion value, with transaction quantities and limits, relative to the current 10–12 Currency Assignment payout scale.
- Propose explicit provisions-in-kind payout values and contract conditions for the guaranteed Era I baseline earning route across all four orientations, including a zero-Currency character without an appointment or unsupported relationship.
- Show the resulting opening/survival loop in a short worked example covering starting Provisions, earned in-kind provisions, purchase option, sustenance deduction, and shortage prevention/failure cases.

Keep these values in versioned era content/parameter data, clearly labelled **PROVISIONAL — PLAYTEST 1**. They are not historically attested rates and must not be hard-coded into shared engine logic. Production should send the proposed numeric table and its rationale to the Game Director for prompt balance confirmation; this calibration review must not stall unrelated engine, UI, QA-82, or content-authoring work. Do not silently treat a proposal as final balance approval.

## 3. Cross-era architecture and persistence boundary

- Keep the opportunity simulation era-agnostic and data-driven across all seven eras.
- Era I commodity/unit compatibility, notation, labels (Currency, jars, measures, bundles), allowed combinations, and provisional economic values belong in era content/parameter data. Do not add Uruk-only branches, hard-code Era I labels/commodities in shared logic, or create bespoke numerical-sign calculators.
- Shared engine behavior should consume validated semantic quantities and authored compatibility data. Production owns exact TypeScript types, interfaces, module placement, serialization, save schemas, and transition APIs.
- Preserve current schema-v2 compatibility unless a separately reviewed change is necessary. The Production technical note now identifies schema v3 plus a v2 migration/older-reader rejection strategy as a likely safe approach for persisted Day-Close phases. This remains a proposal, not approval to bump the schema or ship an intermediate Interlude save. Do not introduce a save-schema bump or migration by implication.
- Before any persistent-state change, duplicate-control change, or new occurrence/trigger persistence is shipped, provide a brief technical plan identifying:
  1. occurrence identity and how it is derived/stored;
  2. trigger provenance and bounded consumption/retention rules;
  3. duplicate prevention across reload, recurrence, decline, lapse, completion, and succession;
  4. deterministic seed ownership, candidate ordering, and tie behavior;
  5. save-v2 read/write compatibility and legacy-state defaults;
  6. migration necessity (expected: none unless demonstrated) and rollback/test strategy.
- The technical plan is a review gate for persistence-affecting design, not a reason to delay independent QA-82 corrections or non-persistent implementation. Return any behavior-changing persistence proposal for review before shipping.

## 4. Five Era I anchor scripts — Design HQ owns content authoring

Production is **not** responsible for inventing the five historical scenario scripts and must not wait for finished prose to begin the shared engine.

- **Game Design (Design HQ) owns** the five scenario scripts' playable behavior and semantic content. The five scripts are now authored in `dev/GD-ERA1-ANCHORS-001.md`, merged through PR #86, and form the canonical semantic source for the first Era I slice.
- **Historical Research (Design HQ) owns** source review, confidence labels, chronology/provenance constraints, and review of each scenario's Attested / Inferred / PROVISIONAL components. The bounded red-flag check against Issue #80 found no material contradiction; this does not constitute a new research cycle.
- **Production owns** the executable Assignment schema, validation tooling, deterministic runtime interpretation, and integration. Do not create an inert TypeScript mirror of editorial prose. The eventual `src/content/` definitions must be playable Assignment data under the actual runtime contract.
- **Game Director tone mandate (24 November 2026):** Design HQ owns the human voice of authored Era I Assignments, Challenges, and UI copy. Keep records/evidence objective; let character dialogue and situations carry grounded humor, pettiness, warmth, fatigue, and institutional friction. Production should preserve authored voice in presentation rather than replace it with generic compliance prose. This is a content-authoring direction, not a runtime scope expansion; see `dev/GD-ERA1-ANCHORS-001.md` §10.
- Draft PR #87 retains a documentation-only technical note covering occurrence/lifecycle identity, deterministic selection, recovery audit, and Day-Close compatibility. Its technical mechanisms remain proposals pending review; no schema-v3 migration or persistent Interlude is pre-approved.
- Do not expand the first milestone into all 8–9 portfolio targets, a general market simulator, an autonomous NPC scheduler, or exhaustive institutional simulation. The five approved seeds and bounded recurrence domains are the first content slice; remaining portfolio coverage follows playtest feedback and Item #20.

## 5. Required implementation / QA sequence

1. **Land and verify Issue #82 first.** PR #88 currently implements QA-82-1, -2, -4, and -5 with passing latest-head CI. Implement the approved QA-82-3 temporary picker filter, then complete targeted and integrated regression for QA-82-1 through QA-82-5, review, merge, deployment, and acceptance reporting.
2. **Continue non-overlapping Issue #85 preparation.** Review the technical note in PR #87, complete producer/consumer and persistence audits, and prepare the executable content schema without editing runtime opportunity/UI surfaces that overlap #82.
3. **Use the authored anchor source.** The five scripts in `dev/GD-ERA1-ANCHORS-001.md` are merged through PR #86. Production may use fixtures during engine work, but shipping definitions must implement the real playable Assignment schema and preserve the authored semantic constraints.
4. **Implement Assignment Supply.** Shared pool, approved soft ~8 AP/day target, five approved Era I anchors, bounded recurrence data, deterministic occurrence identity, and supported delivery/access semantics.
5. **Implement Challenge Director.** Phase 1 supported trigger domains, deterministic weighted selection, post-TSR gate, no generic trigger backlog, 0–1 arrival per END_DAY pass and two unresolved Challenge cap as PROVISIONAL Playtest 1 safeguards.
6. **Implement Day-Close / Evening Interlude.** Follow §3.7's six-step order exactly: close labor; preliminary settlement and preview; finite review; eligible replenishment; final sustenance/shortage once on Begin Workday; calendar/AP/Morning Report/eligible Challenge. No evening AP, labor, study, Work advancement, free ration, negative Provisions, or repeatable income.
7. **Integrate authored content and test.** Replace fixtures only with reviewed scripts; validate evidence boundaries, commodity/unit compatibility, delivery explanations, and consequences.
8. **Integrated validation.** Test multi-Workday supply, all four orientations, quiet-day behavior, recurrence identity, deterministic selection, trigger provenance, duplicate prevention, cap/gate behavior, interlude settlement idempotence, provisional economic routes, schema-v2 load/save, and succession.
9. **Report separately:** implementation status, tests written vs actually executed, CI runs, merge, deployment, manual smoke results, deviations, limitations, and remaining defects. Do not conflate QA-82 completion with broader GD-OPPORTUNITY-001 completion.

## 6. Release/acceptance boundaries

- All behavioral acceptance criteria in GD-OPPORTUNITY-001 §§3–6 apply.
- All five QA findings meet their individual acceptance criteria in `dev/QA-ISSUE-82-TRIAGE.md`.
- The Evening Interlude's preliminary/final settlement boundary is exactly-once and auditable.
- All orientations have a reliable, signposted in-kind Provisions route before depletion; Currency purchase is the provisional Playtest 1 alternative.
- No challenge before initial TSR completion, including bootstrap state; no banked generic trigger released just because the gate opens.
- No unsupported historical workflow, fabricated cause, unit conversion, authority, relationship, or delivery route.
- No runtime generative AI.
- Cross-era data/engine separation and schema-v2 compatibility are verified.
- No implementation is described as tested, merged, deployed, or verified until the corresponding evidence exists.

**Handoff authority:** Production may begin the two workstreams above. This handoff authorizes implementation of the approved behavioral contract and QA corrections; it does not authorize unapproved behavior changes, a save-schema migration, or new permanent balance values.
