# GD-CHALLENGE-DIRECTOR-002 — Challenge Director Completion and Morning Report Integration

**Status:** APPROVED — READY FOR IMPLEMENTATION  
**Approval:** Game Director, 24 November 2026 (this handoff and controlling Morning Report sequence)  
**Owner:** Design HQ — Game Design; Production owns technical contracts and implementation  
**Target:** Issue #85  
**Branch baseline:** `main` at `388edce18a921e79f391798577674b659629cbe8`  
**Behavioral authority:** `dev/GD-OPPORTUNITY-001.md` §§3.7, 4.1–4.6, 8  
**Related production record:** `docs/production/ISSUE-85-TECHNICAL-DESIGN.md`  
**Shared process:** Scribe of Eras Shared Development Handoff Protocol

## 1. Purpose and scope

Complete the Phase 1 Challenge Director authorized by GD-OPPORTUNITY-001. Replace the current two-scenario hard-coded execution path with a general authored candidate pool, supported causal eligibility, deterministic weighted selection, occurrence-level duplicate control, and the approved Playtest 1 pacing safeguards.

Correct the Morning Report integration in the same behavioral slice. A newly selected Challenge must be included in the Morning Report delivered for that Workday. The report is assembled after Challenge evaluation, not before it.

This handoff authorizes implementation within the existing approved design. It does not authorize a new simulation layer, new activity category, new save-schema version, or new balance rule.

## 2. Current verified implementation baseline

Live repository inspection on `main` at the branch baseline found:

- `src/engine/challengeDirector.ts` contains two hard-coded Era I scenario functions: Seven Sealed Jars and Missing Measure. `runChallengeDirector()` invokes them in a fixed sequence and gates them behind Era I plus completed Storehouse Reckoning.
- Seven Sealed Jars currently checks an active held-barley matter aged at least two days or a completed qualified-incomplete inspection report.
- Missing Measure currently checks the compact Assignment trigger rule and a completed South-Court reconciliation with specified findings.
- `src/engine/opportunities.ts` provides generic aggregate-based `evaluateChallengeTriggers()` and the existing Challenge presentation/action lifecycle.
- `src/state/types.ts` already contains schema-v3 `selectionSeed` and `occurrenceLedger`. Ledger entries can retain scenario ID, occurrence key, lifecycle, optional matter ID, primary event/record fact, required source-fact IDs, delivery channel, presentation day, assignee, and legacy marker.
- `ChallengeInstance` itself still has only `offered | accepted | declined`; completed outcomes are archived separately.
- `src/engine/actionEconomy.ts` currently advances matters and responses, generates Assignments, builds the situated Morning Report, and only then runs `runChallengeDirector()`. This is the observed one-day delivery defect.
- Existing opportunity tests exercise generic Challenge lifecycle and aggregate trigger evaluation, but there is no dedicated Challenge Director suite covering the complete approved contract.

These findings describe the inspected baseline, not a claim about uninspected local changes or future Production work.

## 3. Required behavior

### 3.1 Authored candidate pool

Create an extensible authored scenario source. Each candidate must declare, in the production-owned technical representation:

- Stable scenario identity and authored relative weight.
- Eligibility predicate(s) and the exact supported trigger domain/fact(s) consumed.
- Required source facts and optional institutional matter association.
- Delivery route and an explanation grounded in actual character reach/knowledge.
- Era/content applicability and onboarding eligibility.
- Repeatability boundary and any scenario-specific cooldown.
- Complete player-facing Challenge content, choices, AP cost, authority limits, and outcomes.

The director evaluates authored content; it does not invent causes, records, evidence, motives, or outcomes.

Migrate Seven Sealed Jars and Missing Measure into this model without changing their approved scenario semantics, evidence limits, authority boundaries, choices, or consequences. Preserve their current trigger intent unless the producer audit demonstrates a concrete mismatch with GD-OPPORTUNITY-001; report any such mismatch rather than silently rewriting it.

### 3.2 Supported causal trigger domains

Audit actual producers and consumers, then support the five Phase 1 domains in GD-OPPORTUNITY-001 §4.2:

1. Player actions and outcomes: Assignment/Challenge presentation, acceptance, decline, lapse, completion, submitted activity, and authored consequences represented by existing opportunity state, compact aggregates, or world events.
2. Professional behavior patterns: compact aggregates by employer/category/commodity and the five-entry Assignment activity window. Mandatory-Work lapses remain excluded from neglect counts.
3. Directional relationship updates: changes actually written by current social actions, Assignment activity/submission, or authored opportunity consequences. Mere contact or factual participation is not a relationship change.
4. Institutional matter updates: recorded creation, development, escalation, resolution, responsibility change, or response.
5. Authored world events: existing authored events and events created by current institutional/opportunity processes, retaining their actual provenance.

Each candidate must consume bounded, identified facts or specifically referenced active state. Retain Event, Record, and Knowledge as distinct. A record of an event is not the event; character knowledge controls access/delivery but must not replace the source fact.

Do not add a general event bus, autonomous NPC scheduler, population simulation, unbounded archive scan, or generic queued trigger backlog. Time alone is not a cause. A date condition may constrain an authored opportunity only when a genuine causal occurrence also exists.

Production must report the producer/consumer audit, including domains with no suitable current producer. Do not fabricate coverage by synthesizing events or relationship changes.

### 3.3 Occurrence identity, lifecycle, and recurrence

Use the existing schema-v3 world-level `occurrenceLedger` and `selectionSeed` where sufficient. Do not add a schema version or alter persistent behavior without a separate compatibility review.

Every new presented occurrence must have a stable canonical identity derived from its authored scenario and actual causal source facts; include the durable matter identity where the authored scenario is matter-anchored. Preserve all required source-fact identities. Canonicalization and ordering must be deterministic.

A genuinely new occurrence requires a new supported source fact or distinct new matter satisfying the authored recurrence boundary. The following do not create a new occurrence by themselves: passage of time, repeated report mention, unchanged active matter, status-only changes, or amendment of an existing record. Do not manufacture a source event or record to force recurrence.

Lifecycle must prevent re-presentation of an occurrence already offered, accepted, declined, lapsed, cancelled, or completed. “Unresolved” is a query over offered and accepted only. A declined occurrence does not consume the unresolved cap, but it remains suppressed from re-presentation.

The ledger is world opportunity history, not character-owned career state. Succession must not clear it or make an already presented source occurrence eligible again.

Legacy compatibility is strict: preserve extant Challenge instances and archived outcomes. Legacy suppression may use only existing Challenge IDs/status/outcome data. Do not invent missing causal identities, historical declines/lapses/cancellations, source events, records, or knowledge.

### 3.4 Deterministic weighted selection

Selection has two stages:

1. Determine the complete eligible candidate set using supported causal facts, delivery/access, repeatability, onboarding, and current state.
2. Select zero or one candidate from that set using authored positive relative weights and a deterministic seeded process.

Use the persisted world-level `selectionSeed`. The same saved state, seed, and evaluation identity must yield the same result. Candidate ordering, canonical occurrence identity, integer weighting, and tie behavior must be stable. Do not use `Math.random`, wall-clock entropy, object iteration order, or an unpersisted seed.

Weights may choose among eligible candidates; they must never make an ineligible candidate eligible. Exact weights and modifiers remain authored content/playtest parameters; do not invent a universal cooldown or new balance rule.

### 3.5 Playtest 1 safeguards

Implement the approved provisional safeguards in GD-OPPORTUNITY-001 §4.5:

- Evaluate once at the normal approved evaluation point.
- Select at most one new Challenge per evaluation.
- Permit at most two unresolved Challenge instances (offered or accepted).
- Declined Challenges do not count as unresolved.
- If the unresolved cap is full, skip the evaluation; do not queue a delayed backlog.
- If the onboarding gate is closed, select nothing and do not accumulate generic triggers.
- No Day 1 or supervised Storehouse Reckoning arrival. The gate opens only after the initial tutorial is completed.
- A later evaluation may consider only a still-genuinely-eligible occurrence whose causal provenance and recurrence rules remain valid.
- No Challenge arrives merely because a day passed.

These are Playtest 1 safeguards, not permanent balance decisions. Keep them configurable/authored where appropriate and report observed arrival density for later review.

### 3.6 Preserve Challenge lifecycle and reward boundaries

Preserve existing Challenge acceptance, AP commitment, resolution, archive, Closing Receipt, and player feedback behavior. Present cost and consequences before commitment. Challenges remain optional situations, not paid Assignments. They do not award Historical Progress XP and do not gate Works.

Do not conflate Challenge occurrence lifecycle with a player's career or succession. Do not change the six-AP Workday or add evening AP.

## 4. Controlling Morning Report sequence — Game Director approved

This handoff resolves the sequencing ambiguity between GD-OPPORTUNITY-001 §3.7 and §4.5. The Game Director explicitly approves the following controlling order:

1. Finalize the Day-Close sustenance/shortage settlement and advance the calendar / initialize the next Workday, using the existing exactly-once Day-Close contract.
2. Advance institutional matters and institutional responses for the new Workday.
3. Generate that Workday's eligible Assignment offers.
4. Run the Challenge Director once at the approved evaluation point. It may select zero or one Challenge.
5. Build the situated Morning Report from the resulting state.
6. Deliver the Morning Report. If a Challenge was selected, that same report includes it.

**The Morning Report is the delivery surface for the newly selected Challenge.** The Challenge Director remains the selection authority. Do not build the report first and append a Challenge afterward; do not rebuild it as a second pass; do not delay the Challenge until the following Workday's report.

This is an explicit clarification of the controlling sequence, not a change to Challenge eligibility, causation, frequency safeguards, or Day-Close settlement. It supersedes only the ambiguous ordering language that would place report assembly before Challenge selection. The approved END_DAY/BEGIN_WORKDAY boundary and finite non-AP Evening Interlude remain unchanged.

## 5. Domain invariants and edge cases

- One shared world pool; no four orientation queues or class locks.
- Orientation is not skill, qualification, appointment, authority, or relationship.
- Delivery/access, qualification, knowledge, interpretation, and authority remain distinct.
- All causal evidence remains objective and traceable; character interpretation does not hide or falsify it.
- No unsupported NPC motive or autonomous actor action.
- No fabricated recurrence, arbitrary numerical discrepancy, or accusation unsupported by evidence.
- No Challenge before tutorial completion; no onboarding backlog release.
- A cap-full evaluation produces no arrival and no queued candidate.
- A declined Challenge is not unresolved but its occurrence remains suppressed.
- A source record amendment is not a new event or occurrence.
- A matter status change or repeated Morning Report mention is not a new occurrence unless an authored causal rule explicitly identifies a new source fact.
- Succession preserves world occurrence history and does not re-offer old occurrences.
- Deterministic results must survive save/load and be independent of object iteration order.
- No Historical Progress XP from Challenges.

## 6. Dependencies and exclusions

**Dependencies**
- GD-OPPORTUNITY-001 §§3.7 and 4.1–4.6.
- Approved Issue #85 schema-v3 migration, `selectionSeed`, and `occurrenceLedger` contract.
- Existing opportunity lifecycle and Closing Receipt behavior.
- Existing institutional matter/response, world-event, relationship, and Assignment producers.
- Morning Report construction in the Workday transition.

**Explicit exclusions**
- New save-schema version or unapproved persistent-state shape.
- General autonomous NPC scheduler, event bus, population simulation, or unbounded history scan.
- Runtime generative AI.
- New Challenge layer, AP model, universal cooldown, or balance change.
- Reauthoring the two existing scenarios' meaning or evidence.
- Changes to Assignments, Works, Historical Progress XP, or the Evening Interlude beyond the required sequencing integration.
- Broad UI polish; that remains a separate post-core-loop pass.

## 7. Production-owned technical decisions and required report

Production owns exact TypeScript types, module placement, serialization, deterministic hash/PRNG implementation, transition API signatures, and test fixture architecture.

Before shipping any persistence-affecting change, report the exact technical plan and compatibility implications. Prefer the existing v3 fields and migration contract. Any proposed new persisted field, altered ledger semantics, or save compatibility change must be raised for review before implementation.

Return the implementation report required by the shared handoff protocol:

- Files/modules changed and concise implementation summary.
- Trigger producer/consumer audit and any unsupported domain gaps.
- Candidate schema/content representation and migration of both existing scenarios.
- Occurrence identity and lifecycle behavior, including legacy handling.
- Seed/weighting/order algorithm and reproducibility evidence.
- Morning Report sequencing change.
- Persistence and save/load/succession implications.
- Deviations, known limitations, and blockers.
- Tests written versus tests actually executed, with exact results.
- CI, integration, merge, deployment, and verification status as separate states.

## 8. Acceptance criteria

### Candidate model and causal coverage
- [ ] No hard-coded sequential two-scenario director remains as the selection architecture.
- [ ] Seven Sealed Jars and Missing Measure are represented as authored candidates and preserve their approved semantics.
- [ ] Each of the five trigger domains is covered by a supported producer/consumer path, or a precise evidence-backed gap is reported without inventing a producer.
- [ ] Candidate eligibility checks causal provenance, delivery/access, recurrence, and onboarding before weighting.
- [ ] Trigger context is bounded; no unbounded archive/history scans or new general scheduler.

### Identity, determinism, and lifecycle
- [ ] Every newly presented occurrence has stable canonical identity and source-fact provenance.
- [ ] Duplicate occurrence keys are rejected across active, declined, lapsed, cancelled, completed, reload, and succession cases.
- [ ] Legitimate recurrence is possible only from a genuinely new qualifying occurrence.
- [ ] The same state/seed/evaluation point produces the same selection.
- [ ] Candidate ordering and weighted boundaries are stable.
- [ ] Legacy Challenge data is preserved without fabricated causal/lifecycle history.
- [ ] Occurrence history survives reload and succession.

### Safeguards and behavior
- [ ] At most one new Challenge is selected per evaluation.
- [ ] At most two unresolved Challenges are allowed; declined instances do not count.
- [ ] Full cap and closed onboarding gate produce no arrival and no backlog.
- [ ] Day passage alone never creates a Challenge.
- [ ] Challenge lifecycle, AP costs, receipts, archive, and no-Historical-Progress-XP rule remain intact.

### Morning Report integration
- [ ] The Challenge Director runs after institutional updates and Assignment generation, but before Morning Report assembly.
- [ ] A newly selected Challenge appears in that same Workday's Morning Report.
- [ ] No second report rebuild or next-day delay occurs.
- [ ] No-candidate days produce a normal report without a fabricated Challenge.

### Required QA
- [ ] Dedicated Challenge Director tests cover each trigger domain, including positive, negative, and provenance-invalid cases.
- [ ] Determinism tests cover candidate insertion/order changes, weights, ineligible candidates, and repeated evaluation identity.
- [ ] Pacing tests cover tutorial gate, one-arrival limit, two-unresolved cap, declined-not-counted, full-cap skip, no backlog, and no time-only arrival.
- [ ] Recurrence tests cover duplicate source facts, new source fact, active matter status changes, record amendments, and scenario-specific repeatability.
- [ ] Save/load and succession tests preserve seed, occurrence ledger, and suppression.
- [ ] Morning Report tests prove same-report delivery and no-candidate behavior.
- [ ] Existing Assignment/Challenge lifecycle, Closing Receipt, and Issue #82 regression suites pass.

## 9. Review and completion gates

This handoff is **APPROVED — READY FOR IMPLEMENTATION**. Production may implement the defined behavior in reviewable slices.

Do not close Issue #85 on the basis of this work alone. Challenge Director completion is one gate in the integrated Issue #85 acceptance, which still includes Assignment supply/economy, Day-Close, presentation follow-ups, multi-day playtesting, legacy compatibility, deployment, and Game Director smoke acceptance.

Implementation, tests, merge, deployment, and verification must be reported separately. Any design conflict or required behavior change returns to Design HQ and, where design authority is affected, the Game Director.
