# GD-CHALLENGE-DIRECTOR-002 — Production Trigger and Persistence Audit

**Status:** Runtime implementation in progress; this is an implementation record, not Issue #85 acceptance.

## Authority and sequence

This work implements the Game Director-approved `GD-CHALLENGE-DIRECTOR-002` handoff. PR #102 merged the settled Workday order: Day-Close and calendar initialization, institutional updates, Assignment generation, Challenge evaluation, then Morning Report assembly.

## Trigger producer / consumer audit

| Phase 1 domain | Current producer and stored representation | Bounded consumption path / current limitation |
|---|---|---|
| Player actions and outcomes | Assignment transitions are recorded by `addActivity` in `src/engine/opportunities.ts`; completed interactive reports are persisted as Records and linked from matter provenance. | Use the five-entry `recentActivity` window to identify a specific Assignment, then dereference its ID and linked Record. Do not scan all historical Assignments or Records. |
| Professional behavior patterns | `assignmentAggregates` stores compact counts by employer/category/commodity; `recentActivity` stores at most five recent entries. | Existing `evaluateChallengeTriggers` consumes aggregate thresholds and the bounded recent window. The Missing Measure candidate retains this mechanism. |
| Directional relationship updates | `SET_RELATIONSHIP` in `src/engine/worldSocial.ts` accepts directional history entries and permits an optional existing `eventId`. Other current producers—including opportunity consequences, Closing Receipts, Uruk Assignment submission, and Era I anchor submission—append relationship history without an event link. | The typed resolver supports a specifically referenced relationship pair only when its latest history entry links to an existing Event. Unlinked relationship history cannot be promoted into ledger provenance under the current v3 contract. No current Era I candidate uses relationship changes as a trigger. This remains a producer/provenance gap, not a synthesized event. |
| Institutional matter updates | `advanceInstitutionalMatters`, `advanceInstitutionalResponses`, and Assignment submissions update specific matters, provenance, and response events. Matters retain source event/record references. | Candidate logic checks specifically referenced matter IDs and linked source facts. It does not scan the full matter or event archive. |
| Authored world events | `CREATE_EVENT`, institutional response processing, authored opportunity consequences, and matter producers create explicit `world.events` entries with stable IDs. | Current Era I candidates use directly referenced matter source events as provenance. No independent generic event-trigger candidate is authored yet; adding one requires an authored scenario and a specific event selector. |

## Persistence and determinism

- Reuse schema-v3 `opportunities.selectionSeed` and `opportunities.occurrenceLedger`.
- Do not add a save field or schema version. A generated Challenge's ID is its canonical occurrence key, allowing lifecycle transitions to find the existing ledger entry without adding an optional property to `ChallengeInstance`.
- A new occurrence ledger entry records the authored scenario ID, canonical occurrence key, matter ID, primary Event/Record, all required Event/Record IDs, actual delivery channels, presentation day, and lifecycle.
- The existing v3 validator remains authoritative: required source IDs must resolve to actual Events or Records; a non-legacy entry must have a valid primary Event/Record.
- Legacy suppression uses only existing fixed Challenge IDs, archived outcomes, and already-migrated legacy ledger entries. It does not infer a missing historical cause or create a synthetic legacy occurrence.
- Selection uses a stable FNV-1a 32-bit hash over the persisted selection seed, the Era/Workday evaluation identity, and sorted eligible occurrence keys. Candidate weights are positive authored integers. The two existing one-shot Era I candidates currently use equal weight 1; this is a neutral initial weighting, not a balance claim.
- The two existing scenarios retain a `once_per_world` recurrence boundary. No universal cooldown is introduced.
- The director selects at most one candidate per evaluation. It skips evaluation when two Challenges are unresolved. The action transition independently enforces the same two-unresolved cap; declined Challenges do not count.
- There is no queued backlog. A candidate is reconsidered only at a later normal evaluation if its underlying trigger is still eligible.

## Current implementation boundary

This slice establishes the authored candidate pool for The Seven Sealed Jars and The Missing Measure, a typed resolver for all five trigger domains, deterministic weighted selection, occurrence provenance, lifecycle updates, and cap enforcement. Current Era I candidates consume player-action outcomes, professional behavior patterns, and institutional-matter updates. The relationship resolver requires an event-linked latest history entry; the authored-world-event resolver requires a specific event ID and delivery channel. No current Era I candidate yet uses those latter two domains, and unlinked relationship producers remain unsupported. Issue #85 must remain open until suitable authored coverage, acceptance tests, and integrated gameplay validation pass.
