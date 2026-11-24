# GD-ASSIGNMENT-SUPPLY-RECOVERY-001 — Era I Assignment Supply Recovery

**Status:** APPROVED — READY FOR IMPLEMENTATION  
**Authority:** Game Director approval, 24 November 2026.  
**Owners:** Design HQ — domain/behavioral contract; Production — technical design and implementation.  
**Scope:** Repair fresh-game Era I matter-to-Assignment reachability and implement the eight already-approved Commercial/Martial Assignment families as playable, causally grounded opportunities.

## 1. Objective

Fresh-game play currently exhausts its small starter set of Assignments while the world continues accumulating institutional matters. The player can receive Challenges and observe new matters without receiving enough new paid professional work.

Repair the complete path from world development to a reachable Assignment:

**world event / source fact → durable institutional matter → authored Assignment definition → eligibility and delivery → offer → player acceptance and resolution.**

The target is a living shared Assignment pool, not a quota filled with repeated or synthetic jobs.

## 2. Authority and alignment

This specification implements, and does not supersede:
- Canonical GDD §§3, 6.3, 6.4 and the three-layer activity model.
- Approved GD-OPPORTUNITY-001 and PRODUCTION-HANDOFF-001.
- dev/GD-ERA1-ANCHORS-001.md (five semantic anchor scripts).
- The already-approved Era I Commercial/Martial seeding families listed in §4 below.
- Existing occurrence identity, provenance, determinism, lifecycle, and cross-era requirements in docs/production/ISSUE-85-TECHNICAL-DESIGN.md.

The GDD's approximately **8 AP worth of new Assignment supply per Workday** remains a soft pacing target, not a hard quota. Quiet days are valid when no plausible work exists, but should be exceptional in representative Era I play. One shared pool serves all four orientations; no orientation-exclusive queues or arbitrary class gates.

## 3. Required audit before implementation changes

Production must provide a compact source-to-offer coverage matrix for every Era I Assignment definition and relevant active matter kind. For each, identify:
1. Authored scenario/activity definition and its matter-kind match.
2. The actual fresh-game seed or world-development producer for that matter.
3. Causal source Event/Record identity and provenance.
4. Institutional registration and active/inactive lifecycle.
5. Delivery channel, recipient/access conditions, and why the player can plausibly receive it.
6. Recurrence identity and duplicate/lapse/decline/completion behavior.
7. Current observed availability in a fresh game.

Explicitly distinguish:
- definition exists but no producer creates a matching matter;
- matter exists but is not institutionally registered/eligible;
- eligible occurrence exists but delivery/access rejects it;
- occurrence is correctly suppressed as duplicate or lifecycle-ineligible;
- content is not yet implemented as a playable Assignment.

Do not infer reachability from unit tests that manually construct matching matters. Demonstrate the normal world path.

## 4. Approved content scope

Implement the eight approved families as playable Assignment definitions using the existing executable content contract. Their content approval is closed; do not reopen it.

**Commercial**
- ERA1-COM-F01 — Material Not As Described (already implemented; retain and regression-test).
- ERA1-COM-F02 — Two Claims, One Load.
- ERA1-COM-F03 — Sent Out, Not Yet Returned.
- ERA1-COM-F04 — Handed Over Twice.

**Martial**
- ERA1-MAR-F01 — The Door That Was Opened.
- ERA1-MAR-F02 — The Gathered Party Returns Short.
- ERA1-MAR-F03 — Late, or Turned Aside.
- ERA1-MAR-F04 — The Trail of a Valued Object.

Preserve each family's distinct institutional circumstances, human conflict, evidence, procedure, authority, and consequences. Martial work remains situational security, custody, movement, and mobilization; it must not imply a standing army, military bureaucracy, or exclusive Martial queue. All characters may receive any suitable opportunity through plausible circumstances and access.

The five earlier anchor definitions remain part of the coverage audit and content portfolio. This milestone does not authorize inventing new anchor families or replacing their semantic source.

## 5. Behavioral requirements

### 5.1 Causal world supply
- Every offered Assignment must trace to a real, durable matter and the actual causal source fact(s) required by its authored scenario.
- New matters arise only from authored fresh-game setup or supported world/player developments. Do not create arbitrary matters solely to satisfy the AP target.
- A matter's continued existence, status change, repeated notice, or derivative player report must not manufacture a new occurrence.
- A genuinely new occurrence requires a new qualifying source fact or distinct durable matter under the approved recurrence contract.
- World developments that create a matter must register it with the relevant institution and preserve provenance consistently.

### 5.2 Discovery and delivery
- The shared generator discovers eligible authored opportunities from live world state; it must not rely on test-only fixtures or hardcoded offer cards.
- Eligibility and delivery are distinct. A valid matter may remain unavailable when the character lacks a plausible access/knowledge path; the reason must be explainable in diagnostics.
- Preserve the approved delivery-channel semantics and orientation-neutral shared pool.
- A completed, declined, lapsed, cancelled, or otherwise ineligible occurrence follows the approved lifecycle contract. Do not silently recycle it.
- The existing F01 Day 2 arrival and five-AP playable flow must remain reachable in fresh games.

### 5.3 Supply and pacing
- Use the GDD's approximately 8 AP/day new-offer target as a portfolio-level soft pacing signal.
- Do not enforce a hard daily offer count or AP quota.
- Do not create repeated offers for the same occurrence to inflate supply.
- Quiet days remain possible, but sustained droughts in representative play are a defect when authored, plausible, eligible work exists.
- The board must continue producing distinct work after the initial starter matters have been completed or resolved.

### 5.4 Player-facing integrity
- Preserve authored human voice and grounded institutional friction. Records and evidence remain sober, qualified, and reliable.
- Offer copy must disclose contracted compensation, including any Provisions-in-kind, before acceptance.
- Reports remain recommendations/records, not authority beyond the character's actual scope.
- Assignments award Career XP and contracted compensation under their authored terms; they do not award Historical Progress XP.

## 6. Persistence and technical boundary

Production owns exact TypeScript contracts, module placement, serialization, save schema, migrations, and transition APIs.

Prefer the current approved persistence contract. Do not introduce a schema change as an incidental consequence of supply recovery. If implementation demonstrates a necessary persistent-state change, stop that portion and return a technical proposal covering compatibility, migration, rollback, determinism, and tests before shipping it.

Do not change economy values, AP costs, Overtime, sustenance, Challenge rules, rank/skill formulas, or GDD/Decision Register as part of this milestone. No runtime generative AI.

## 7. Acceptance and QA

Production must execute and report all of the following:
1. **Coverage audit:** Every Era I Assignment definition is mapped to a real matter producer, source fact, registration path, delivery channel, and lifecycle outcome.
2. **Fresh-game reachability:** A fresh character can receive F01 through the normal Day 2 world path; the other seven approved families each have at least one demonstrated normal world path, not a synthetic fixture.
3. **Multi-day supply:** Run fresh games for at least 20 Workdays, recording each day: new offers and estimated AP; active/accepted Assignments and status; active institutional matters by kind; eligible-but-undelivered occurrences and exclusion reasons; source events/records and occurrence identities.
4. **Portfolio breadth:** Demonstrate continued distinct Assignment availability after starter opportunities are completed, across the eight approved families and five anchor definitions as supported by their causal triggers.
5. **Orientation coverage:** Repeat representative fresh-game runs for Civic, Martial, Religious, and Commercial orientations. The shared pool must remain available without orientation-exclusive queues.
6. **Determinism and persistence:** Verify stable selection for the same state/seed; no duplicate occurrence on reload, repeated day close, or repeated generation; correct decline/lapse/completion behavior; save/load continuity.
7. **Evidence and authority:** Validate each implemented family against its approved semantic content, source confidence, authority boundaries, and authored consequences.
8. **Regression:** Preserve six-AP Workday/Overtime, two-resource economy, Evening Interlude settlement, Challenge gate/trigger behavior, TSR separation, and F01 Closing Receipt behavior.
9. **CI and reporting:** Report tests written versus actually executed, exact CI results, files changed, deviations, known limitations, merge/deployment state, and any remaining defects.

A passing synthetic generator test alone does not satisfy reachability. A passing CI run does not establish deployed or manually verified behavior.

## 8. Explicit exclusions
- No hard daily Assignment quota or random filler.
- No repeated presentation of unresolved work merely to increase card count.
- No autonomous NPC scheduler or exhaustive institutional simulation.
- No general market simulator or economy rebalance.
- No changes to provisions recovery, AP, Overtime, Challenge selection, or Works.
- No new save schema/migration without a separately reviewed technical proposal.
- No changes to src/ by Design HQ; Production owns runtime implementation.
- No GDD or Decision Register edits under this specification.

## 9. Required Production return

Return the coverage matrix and identified root causes first. Then implement in reviewable slices, beginning with the smallest complete causal supply path and the approved Assignment content. Provide a fresh-game multi-day supply report before declaring the milestone verified.

**Completion standard:** the player encounters a continuing stream of distinct, plausible, consequential professional work because the world creates it—not because the generator manufactures cards.