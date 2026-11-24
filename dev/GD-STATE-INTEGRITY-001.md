# GD-STATE-INTEGRITY-001 — Day-13 State, Provenance, and Information Architecture Audit

**Status:** APPROVED — READY FOR IMPLEMENTATION  
**Specification owner:** Design HQ  
**Production owner:** Production (all implementation departments)  
**Baseline reviewed:** `main` at `0644be85e415b44cbf1561e644d54e96862a2748` (24 November 2026)  
**Evidence:** Game Director's Day-13 live-state snapshot and prior manual observations; current repository documents. Runtime source has not yet been audited for this specification.

## 1. Objective

Turn the Day-13 playtest observations into a bounded, independently trackable audit and correction package. Establish whether the current playable state presents people, relationships, institutions, active matters, records, and progression accurately and intelligibly, while making large information surfaces navigable.

This is a correctness and usability pass, not authorization for new simulation systems, balance changes, historical invention, or a broad redesign.

## 2. Authority and alignment

The canonical GDD governs. Relevant principles include:

- GDD §§2.1–2.3: administrative judgment, consequential documents, and people/relationships.
- GDD §2.9: distinguish Event, Record, and Knowledge; retain selective consequential continuity rather than an unlimited interaction transcript.
- GDD §2.11: player knowledge is situated.
- GDD §5: Assignments, Challenges, and Works remain distinct; the Introductory Tutorial is outside all three.
- GDD §6: the six-AP Workday and overtime trade-off remain unchanged.
- GDD progression/economy sections: Career XP, Professional Rank, Historical Progress XP, Money, and Provisions retain their separate meanings.
- `docs/design/WORLD_SIMULATION_SPEC.md`: bounded world simulation and consequential social/operational continuity.
- `docs/design/INTERFACE_AUDIO_ACCESSIBILITY_SPEC.md` and `ACCESSIBILITY.md`: readability, navigation, feedback, keyboard and assistive-technology goals.

No GDD revision, new design decision, numerical rebalance, or schema change is authorized by this proposal.

## 3. Evidence and interpretation

### 3.1 Directly observed in the Day-13 snapshot

- The People surface is exceptionally long and exposes many low-information profiles and repeated empty-state text.
- Several directional relationship histories display apparently duplicated or cross-attributed narrative/event text. Examples include a Lu-Nanshe action appearing on more than one person's edge, and a Utu-mansum action appearing on both Enlil-kisu and Utu-mansum edges.
- Relationship dimensions show trust/respect values around the low-to-mid 50s while familiarity remains 0 across displayed edges, despite a history of interactions.
- Institution pages show numerous active matters, including matters with apparently related evidence or activity.
- A completion toast reports that a comparison task completed while institution pages continue to display related active matters.
- The snapshot shows Career XP 631, Professional Rank Grade 1, Historical Progress XP 0, Currency 77, Provisions 9, Stress 5, and 3/6 AP.

### 3.2 Not defects by themselves

- Historical Progress XP 0 is consistent with the rule that only Works award it; the tutorial and ordinary Assignments/Challenges do not.
- Career XP 631 and Grade 1 are not inherently contradictory. Career XP and Professional Rank are independent.
- The player-facing label Currency is established for the Era I abstract Money balance; do not rename it based on the underlying concept alone.
- Institutional standing and formal affiliation are distinct concepts. Absence of affiliations alongside standing is not automatically inconsistent.
- A completed Assignment need not automatically close an institution-level matter. One record or one task completion may be insufficient to resolve a larger obligation.
- Sparse NPC data may be intentional. Do not fabricate ages, histories, capabilities, affiliations, or appointments to make profiles look complete.

These distinctions must be preserved during triage.

## 4. Required audit and behavior

### A. Relationship history, attribution, and familiarity

Production must trace the relationship-history write path from event/record creation through each directional relationship edge and its presentation.

Required behavior:
1. A relationship-history entry must identify the actual actor, subject/pair, event or record provenance where available, and the perspective/edge to which it belongs.
2. A fact or quote attributed to one person must not appear as that person's statement/action on another person's edge unless the model explicitly represents a shared event affecting both edges; the presentation must still make the actor and relationship perspective unambiguous.
3. Repeated history entries must be explainable by distinct events, distinct relationship effects, or explicit shared-event fan-out. Accidental duplicate writes must be prevented.
4. Event, Record, and Knowledge remain distinct. Do not manufacture an Event merely to make a relationship entry eligible as provenance.
5. Familiarity must be audited as its own dimension. Determine whether the displayed zeros are correct under the current relationship contract, an initialization/presentation omission, or a missing consequence path. Do not silently add familiarity or alter thresholds.

Production must report concrete examples, source paths, and the actual cause before proposing a correction.

### B. Institutional matter lifecycle and task feedback

Trace the completion toast and related active matters through their source records, event links, and lifecycle transitions.

Required behavior:
1. Task feedback describes the task outcome and material consequence, not only a generic completion state.
2. Institution matter state must distinguish at minimum: active/open, evidence or activity updated, awaiting decision/authority, resolved, and closed/archived where those states exist in the approved model. If the current model uses different names, document the mapping rather than introducing parallel states.
3. A task completion must not close a broader matter unless the approved resolution condition is met.
4. A matter must not remain presented as actionable/open after its actual closure, unless the display clearly identifies a retained historical/archive view.
5. Where several matters concern related goods, people, or events, the interface must preserve their separate identities and explain the relationship only when supported by data.

Do not add a generic matter-resolution engine or new lifecycle states without Design HQ review.

### C. People and Institutions information architecture

The current presentation is too long to scan effectively. Audit both data loading and rendering: do not assume the problem is only CSS or page layout.

Required behavior:
1. Provide a compact, scannable people index with name and meaningful distinguishing context.
2. Show full profile detail on selection rather than expanding every profile and relationship history by default.
3. Group or progressively disclose relationship dimensions, history, life history, capabilities, appointments, affiliations, and institutional context.
4. Support useful search/filtering over the people and institution data already available. Do not invent new categories or metadata solely to support filters.
5. Keep records and provenance discoverable; progressive disclosure must not delete or conceal objective evidence needed for play.
6. Institution views must separate concise institutional summary, current matters, relevant people/appointments, and historical records.
7. Use pagination, virtualization, or bounded rendering only if the source audit shows that the current list size or render cost warrants it. Do not truncate the underlying archive or silently omit records.

The target is an understandable information hierarchy, not a particular component implementation.

### D. Sparse and uninitialized NPC profiles

Audit why many listed people display repeated statements such as no initialized scribal capability sheet, no personal history, unknown age, and no affiliations/appointments.

Required behavior:
1. Distinguish unavailable, unknown, not applicable, and genuinely empty values.
2. Avoid repeating implementation-oriented placeholder language as if it were player-facing narrative.
3. Do not synthesize missing history, ages, skills, appointments, or affiliations.
4. Keep relevant sparse NPCs visible when they matter to current institutions, relationships, or work; reduce visual noise from empty sections.
5. Explain any capability-sheet fallback or default in a way consistent with the authoritative character/career contract.

### E. State and progression ledger reconciliation

Audit the Day-13 displayed values against authoritative state and event/transaction history: AP, Currency, Provisions, Career XP, Professional Rank, Historical Progress XP, Stress, and archived-record count.

Required behavior:
1. Identify the source of each displayed value and the events/transactions that changed it.
2. Confirm no resource, XP, rank, or stress value is being inferred from another independent progression track.
3. Confirm Historical Progress XP is awarded only by completed Works.
4. Confirm tutorial completion and ordinary Assignment/Challenge completion do not award Historical Progress XP.
5. Confirm UI labels reflect approved player-facing terminology without changing underlying balance semantics.
6. Report discrepancies as reproducible defects; do not rebalance values under this audit.

### F. Challenge and opportunity regression check

Issue #85 remains a separate authorized implementation track. This specification does not duplicate or supersede it.

As part of the integrated smoke test, verify that:
- the Workday 1 / Storehouse Reckoning onboarding gate remains respected;
- Challenge selection, occurrence provenance, and duplicate suppression continue to behave as implemented;
- the Assignment/Challenge/Work distinctions remain intact.

Any failure is reported with reproduction steps and linked to Issue #85; do not silently expand this specification into a second Challenge Director implementation.

## 5. Cross-department responsibilities

All departments below are part of Production.

- **Engineering & Architecture:** source-to-display trace; relationship provenance and edge semantics; lifecycle/state reconciliation; loading/rendering audit; deterministic regression tests; persistence and compatibility assessment.
- **Art & UI/UX:** information hierarchy, compact index/detail views, progressive disclosure, search/filter affordances, responsive layout, empty/unknown states, readable feedback, keyboard/focus/zoom/contrast and assistive-technology review.
- **Historical Research:** targeted review only where the audit finds historical claims, titles, institutional relationships, life-stage descriptions, or terminology that may be unsupported or anachronistic. Produce a concise evidence memo with citations and Attested / Inferred / PROVISIONAL distinctions. Reuse approved Era I research where applicable; do not repeat Issue #80 or reopen settled content without a specific discrepancy.
- **Production & QA:** reproducible Day-13 test fixture or equivalent test path; regression matrix; manual browser smoke test; accessibility checks; report actual test execution and outcomes.
- **Audio:** No material impact.

Design HQ owns the behavioral contract, reviews proposed deviations, and resolves any design ambiguity. Production owns implementation and technical contracts.

## 6. Dependencies and sequencing

1. **Source audit first:** identify the actual producers, consumers, persistence representation, and UI components before changing behavior.
2. **Research only on a finding:** Historical Research begins when Engineering/UI identifies a specific historical claim needing validation. It is not a blanket prerequisite for the technical audit.
3. **Relationship and matter corrections:** resolve data/provenance correctness before polishing their presentation.
4. **Information architecture:** can proceed in parallel with non-overlapping source audits, but its final design must reflect the verified domain model.
5. **Integrated QA:** run after corrections and alongside an Issue #85-compatible build. Do not block or reorder Issue #85 without a separate Game Director sequencing decision.
6. **No persistent-state change without a technical plan:** document schema impact, legacy-save behavior, migration/rollback needs, and deterministic replay implications before implementation.

## 7. Acceptance criteria

The specification is complete only when all applicable criteria pass:

- [ ] Every sampled relationship-history entry can be traced to its source event/record or explicitly documented non-event source; actor, subject/pair, and directional perspective are correct.
- [ ] No unexplained duplicate or cross-attributed relationship history remains in the Day-13 regression scenario.
- [ ] Familiarity behavior is explained against the approved contract and tested; any required correction is implemented without unapproved thresholds.
- [ ] The completed-task toast and institution matter state are reconciled with source evidence and lifecycle; no premature closure or stale active presentation remains.
- [ ] People and Institutions can be scanned without rendering every full profile/history at once.
- [ ] Full profile, relationship, institution, matter, and record detail remains reachable and provenance-preserving.
- [ ] Unknown/empty/uninitialized NPC fields are presented distinctly and without fabricated content.
- [ ] All displayed Day-13 ledger values reconcile to their authoritative sources; independent progression tracks remain independent.
- [ ] Challenge onboarding and occurrence behavior pass regression checks; failures are linked to Issue #85.
- [ ] Keyboard navigation, visible focus, zoom, contrast, semantic labels, and screen-reader-relevant structure are checked on the changed surfaces; limitations are recorded.
- [ ] Existing saves load without loss or silent reinterpretation. Any required migration is separately reviewed and approved before implementation.
- [ ] Relevant automated tests, production build, CI, and manual smoke tests are executed and reported. Written tests are not reported as executed tests.
- [ ] Production reports implementation, source files, technical decisions, persistence impact, deviations, limitations, and exact test results.

## 8. Explicit exclusions

- No GDD, Decision Register, or Open Design Register edits as part of implementation.
- No change to six-AP Workday, Overtime, progression formulas, XP awards, rank thresholds, resource rates, or economy balance.
- No new relationship dimensions, familiarity thresholds, faction systems, NPC simulation, or generic knowledge graph.
- No synthetic people/history/ages/skills/appointments/affiliations or fabricated provenance.
- No broad historical rewrite or new Era I content portfolio.
- No replacement or expansion of Issue #85's Assignment Supply, Challenge Director, or Evening Interlude scope.
- No Works redesign; preserve Works as the sole source of Historical Progress XP.
- No runtime generative AI.

## 9. Open questions reserved for evidence-based escalation

Production must return findings before proposing answers to:
- Are repeated relationship entries duplicate writes, shared-event fan-out, or a presentation bug?
- Does familiarity remain zero because it is intentionally independent of interaction history, because the displayed data is incomplete, or because a consequence path is missing?
- Which active institution matters are correctly still open after the observed task completion?
- Is the oversized People/Institutions surface caused by eager data loading, eager rendering, duplicated nested histories, or a combination?
- Which sparse profiles are intentionally partial versus incorrectly initialized?

Do not guess. Escalate any required behavioral choice to Design HQ and the Game Director.

## 10. Approval gate

**Approved by the Game Director on 24 November 2026. Status: APPROVED — READY FOR IMPLEMENTATION.** Production is authorized to execute the work packages and acceptance criteria in this specification, subject to its exclusions, dependencies, and escalation requirements. Routine technical choices remain Production-owned. Any behavior-changing proposal outside this approved contract, persistent-state change, new lifecycle behavior, numerical change, or scope expansion requires the appropriate Design HQ/Game Director review before implementation.
