# PRODUCTION-HANDOFF-002 — GD-STATE-INTEGRITY-001

**Status:** PROPOSED — not implementation-authorizing  
**Specification:** [GD-STATE-INTEGRITY-001](../../dev/GD-STATE-INTEGRITY-001.md)  
**Tracking:** New independent Production issue to be created after specification approval  
**Reviewed baseline:** `main` `0644be85e415b44cbf1561e644d54e96862a2748`  
**Related active track:** Issue #85 — GD-OPPORTUNITY-001 / GD-CHALLENGE-DIRECTOR-002

## 1. Purpose

Coordinate Production's cross-department investigation and implementation of the Day-13 state-integrity and information-architecture findings. This handoff is subordinate to GD-STATE-INTEGRITY-001 and the canonical GDD.

**Production includes Engineering, Historical Research, Art & UI/UX, Audio, and Production & QA.** Assignments below are Production responsibilities, not requests for Design HQ to perform those departments' work.

## 2. Work packages and ownership

### WP0 — Engineering source and state audit
**Owner:** Engineering & Architecture  
**Priority:** First

- Identify the components and state paths that generate People, relationship histories, institution matters, task completion feedback, and displayed progression/resource values.
- Trace representative Day-13 entries end-to-end: event/record creation → domain update → directional relationship/matter state → persistence → UI.
- Determine whether the People page is loading too much data, rendering too much data, or both.
- Inventory all consumers before changing shared relationship or matter behavior.
- Report exact files/modules, source-of-truth fields, persistence boundaries, and suspected root causes.

**Deliverable:** source map and findings table; no code changes in the audit-only stage.

### WP1 — Relationship provenance and familiarity
**Owner:** Engineering; QA supports reproduction  
**Priority:** High, after WP0

- Audit directional relationship edge semantics and relationship-history writer call sites.
- Determine whether duplicated/cross-attributed entries represent duplicate writes, intentional multi-edge consequences, or incorrect projection.
- Trace actor, target/pair, event/record reference, and perspective through every affected example.
- Audit familiarity initialization and update paths independently from trust/respect.
- Propose the smallest correction consistent with the current behavioral contract.

**Deliverable:** root-cause report, correction proposal, regression cases. No new dimensions or thresholds.

### WP2 — Institution matter lifecycle and feedback
**Owner:** Engineering; QA supports  
**Priority:** High, after WP0

- Trace the observed completion toast to the Assignment/Challenge result and any institution-matter updates.
- Map current lifecycle values to the behavioral states in the specification.
- Identify which Day-13 matters should remain open and why; identify any stale or prematurely closed state.
- Ensure task feedback communicates outcome and material consequence using supported data.

**Deliverable:** lifecycle mapping and test matrix; any proposed new state or transition requires Design HQ review before implementation.

### WP3 — People & Institutions information architecture
**Owner:** Art & UI/UX, with Engineering  
**Priority:** High; can design in parallel with WP0

- Propose a compact people index and focused profile-detail view.
- Progressively disclose relationship dimensions/history, personal history, capabilities, appointments, affiliations, and institutional context.
- Provide institution summaries with separately navigable current matters and relevant people/records.
- Add search/filter controls only over verified existing data.
- Audit mobile/responsive behavior, keyboard navigation, focus visibility, semantic labels, contrast, zoom, and assistive-technology structure.
- Keep full source records accessible; do not solve clutter by deleting data or hiding evidence.

**Deliverable:** interaction/layout proposal, component-level implementation plan, accessibility checklist, before/after screenshots or equivalent capture.

### WP4 — NPC sparse-data presentation
**Owner:** UI/UX and Engineering; Historical Research only if a factual claim is in question

- Audit placeholder language and distinguish unknown, unavailable, not applicable, and empty.
- Avoid showing repeated internal implementation phrases in player-facing profiles.
- Preserve sparse profiles and do not invent missing personal or professional data.
- Verify any capability fallback against the current character/career contract.

**Deliverable:** empty-state rules and regression examples.

### WP5 — Targeted Era I historical review
**Owner:** Historical Research  
**Priority:** Conditional; start only when WP0/WP4 identifies a specific claim needing review

Research questions may include:
- Is a displayed office/title, institutional relationship, life-stage description, or occupational description supported for Late Uruk c. 3200 BCE?
- Does the current presentation imply a modern institutional separation or administrative structure unsupported by the approved Era I research?
- Is a specific person/institution description attested, inferred, or authored reconstruction?

Requirements:
- Reuse Issue #80 and the approved Era I institutional audit/matrix before commissioning new research.
- Cite primary/secondary sources and provide page/section references where available.
- Label conclusions **Attested / Inferred / PROVISIONAL**.
- Separate evidence from interpretation and game reconstruction.
- Identify uncertainty and anachronism risk.
- Do not rewrite approved content or invent a correction. Return findings to Design HQ where a design/content decision is needed.

**Deliverable:** concise research memo limited to the identified claims. If no historical claim is implicated, report **No material research required**.

### WP6 — Integrated QA and regression
**Owner:** Production & QA  
**Priority:** After WP0 findings; final gate after fixes

Build a repeatable Day-13 scenario or equivalent fixture and test:
- directional relationship provenance and duplicate handling;
- familiarity behavior;
- task completion vs institution-matter lifecycle;
- profile/index disclosure and record discoverability;
- sparse NPC field presentation;
- AP/resources/XP/rank/stress ledger reconciliation;
- Issue #85 Challenge onboarding, occurrence provenance, duplicate suppression, and cap behavior;
- legacy save load and post-load state integrity.

Run:
- automated regression tests;
- type-check and production build;
- CI on the exact proposed merge head;
- manual browser smoke test through the changed flows;
- keyboard/zoom/contrast/assistive-technology checks for changed surfaces.

**Deliverable:** test matrix with each test marked written / executed / passed / failed / not run; environment and build SHA; defects and reproduction steps.

### WP7 — Audio
**Owner:** Audio  
**Status:** No material impact. No audio work is requested.

## 3. Dependencies and sequencing

1. WP0 is required before any shared domain-state correction.
2. WP3 may conduct a non-invasive layout audit while WP0 proceeds, but final UI implementation depends on verified data semantics.
3. WP5 is conditional and targeted; historical research is a Production workstream and must not be omitted if claims need validation.
4. WP1 and WP2 must preserve provenance and current lifecycle semantics; any new domain behavior returns to Design HQ.
5. WP6 validates the integrated result and Issue #85 compatibility.
6. Do not reorder or block Issue #85 without Game Director direction. Its current runtime work is separately authorized and has its own sequencing.
7. Any persistent-state change requires a technical plan covering schema impact, old-save behavior, migration, rollback, and determinism before implementation.

## 4. Technical ownership and constraints

Production owns exact TypeScript types, module placement, serialization, save schemas, migrations, and transition API signatures, subject to the approved behavioral contract.

Before a persistent change, report:
- current and proposed schema versions;
- fields added/changed/removed;
- migration and rollback behavior;
- legacy-save compatibility;
- deterministic replay/seed implications;
- recovery behavior if persistence fails.

No save-schema change is implied or authorized by this handoff.

## 5. Acceptance and completion reporting

Do not close the independent tracking issue until:
- every applicable GD-STATE-INTEGRITY-001 acceptance criterion is addressed;
- root causes are documented, including criteria found not to be defects;
- approved corrections are implemented;
- relevant tests are actually executed;
- integrated browser and accessibility checks are reported;
- legacy-save and Issue #85 compatibility are verified;
- deviations, limitations, and follow-up defects are listed.

Return a Production report containing:
1. specification ID;
2. implementation summary and exact files changed;
3. technical/data-model decisions;
4. persistence and migration impact;
5. deviations from the specification;
6. tests written and tests executed, with actual results;
7. CI run IDs and exact tested commit;
8. manual smoke-test results;
9. accessibility review findings;
10. Historical Research memo or explicit no-research-needed finding;
11. known limitations/blockers;
12. decisions required from Design HQ/Game Director;
13. merge, deployment, and verification status as separate facts;
14. recommended next action.

## 6. Approval gate

This handoff is **PROPOSED**. It authorizes non-mutating audit and estimation only after the Game Director approves the specification. Implementation requires explicit **APPROVED — READY FOR IMPLEMENTATION** status. Do not treat the existence of this document or its tracking issue as authorization.
