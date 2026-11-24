# Issue #85 — Production Technical Design Notes

**Status:** PROPOSED — technical review draft  
**Specification:** `GD-OPPORTUNITY-001` §§3.6–3.7 and 4.1–4.6  
**Scope:** Non-overlapping technical audit and implementation preparation. This note does not authorize persistent-state changes, economy rebalance, or runtime edits to the opportunity/UI surfaces while Issue #82 remains open.

## 1. Era I anchor content boundary

The authored semantic baseline is `dev/GD-ERA1-ANCHORS-001.md`, merged through PR #86. It remains the source of truth for the five anchor situations, historical confidence, evidence/provenance, apprentice authority, playable work, judgment, outcomes/recovery, and recurrence boundaries.

PR #87 deliberately does **not** mirror that document into `src/content/`. The previous typed catalog contained editorial/provenance prose but did not define executable Assignment behavior or a production-ready runtime contract. It has been removed rather than shipped as dead client-bundle content.

Production will create `src/content/` definitions when implementing the real playable Assignment schema and runtime integration under Issue #85. That implementation must preserve the approved anchor IDs and semantic constraints while adding only the executable fields required by the approved runtime contract. Do not treat this technical note as a substitute for the authored source document.

## 2. Provisions recovery audit

### 2.1 The second recovery category already exists in runtime

The current `actionEconomy.ts` has two recovery actions:

1. `PERFORM_RECOVERY_LABOR`: auxiliary grain-bagging for one Provision, at a cost of 2 AP, once per Workday.
2. `REQUEST_CONTACT_ADVANCE`: a conditional personal advance from Ur-gir, transferring one Provision and creating an outstanding repayment/service obligation.

The second action is the approved **conditional personal help/advance** category. It is not universally available: the current implementation requires Ur-gir to be alive and initialized, an existing directional relationship with trust at least 50 and no resentment, at least one Provision in Ur-gir's wallet, no outstanding obligation to him, and zero Provisions for the player. It costs 1 AP. That conditionality is compatible with the category; it must not be represented as a guaranteed universal bailout.

At the time of this source audit, the action described repayment as “one silver” or a day of scribal assistance. Draft PR #88 now implements the approved player-facing **Currency** wording for the Ur-gir advance alongside the other Issue #82 surfaces; persisted Money values and internal compatibility identifiers remain unchanged. Keep any remaining Currency-label correction within the Issue #82 workstream while that issue is open; do not create a parallel edit in this branch.

### 2.2 The baseline labor route currently fails the early-availability requirement

The current labor action rejects the request while the player has any Provisions:

```ts
if (scribal.wallet.provisions > 0) return recovery-not-needed;
```

It also requires the Temple Storehouse and its location to exist. That means the route is presently a zero-Provisions emergency action, not the approved pre-depletion replenishment path. The current engine has the action and the storehouse baseline, but its availability rule and presentation do not yet satisfy GD-OPPORTUNITY-001 §3.6.

**Required runtime correction after Issue #82:**
- Make the ordinary-workday route visible before the final Provision is consumed.
- Show it by the first Morning Report after Storehouse Reckoning, and again when balance plus known commitments indicate likely depletion.
- Make it available across all four orientations without Currency, appointment, or special relationship.
- Keep the work itself inside a normal Workday AP allocation or the existing Overtime rule; never perform labor in the Evening Interlude.
- Preserve the one-use-per-Workday safeguard unless playtest evidence and the approved contract justify changing it.
- Do not add free daily provisions or retroactive credit.

The current labor action and conditional Ur-gir advance already provide two distinct recovery categories in code. The remaining acceptance work is to make the baseline labor route timely, reliably accessible, legible, and correctly tested, and to verify that the conditional advance still has valid source/obligation semantics.

### 2.3 Sale/pawn alternative

Selling or pawning an actual possession is the other approved category, but the current character equipment representation is a list of strings, not an item/ownership/value model. Implementing sale/pawn now would require inventing a price and item semantics or expanding the persistent model. It is not the smallest safe route while a conditional advance category already exists. Revisit only if the personal-advance route fails the approved acceptance criteria or Design HQ prefers the possession route.

No Currency-to-Provisions rate is assigned here. The provisional Playtest 1 conversion requires a separate economy table and worked survival example for Game Director review.

## 3. Assignment occurrence identity

### 3.1 Source-fact model

The existing world model already distinguishes:
- `WorldEvent`: an event with its own stable `EventId`;
- `RecordEntry`: an authored record with its own `RecordId`, source links, assertions, uncertainty limits, and amendments;
- `KnowledgeEntry`: holder-specific knowledge of an event or record, with basis and learned day;
- `InstitutionalMatter`: a durable matter with its own `MatterId`, status, and optional `sourceEventId` / `sourceRecordId`.

The runtime adapter must retain these distinctions. Knowledge may control whether a delivery route reaches the character; it must not be substituted for the event or record that caused the situation.

### 3.2 Proposed occurrence key

Use an occurrence identity derived from:
- authored scenario ID;
- durable institutional matter ID, when the scenario is matter-anchored;
- the primary causal source-fact kind and ID (`event:<EventId>` or `record:<RecordId>`);
- any additional source-fact IDs explicitly required by that scenario, canonicalized and sorted.

Conceptual form:

```text
<scenarioId>|<matterId>|<primarySourceKind>:<primarySourceId>|<sortedRequiredSourceFacts>
```

This is a technical proposal, not a new domain rule. It must be finalized against the producer/consumer audit before implementation.

A matter remaining active, changing only its status, or being mentioned in another Morning Report does **not** create a new occurrence. A new occurrence requires a genuinely new source fact (or a distinct new matter with its own source provenance) that satisfies the authored recurrence boundary. A source record amendment changes what the record says and must be represented as an amendment; it must not silently mint a new event or occurrence. If a scenario is caused by a new event, that event must retain its own ID even when a related record is also created.

Do not manufacture a source event or record merely to force recurrence. A scenario with no supported source fact is ineligible.

## 4. Challenge occurrence provenance and lifecycle

The current `ChallengeInstance.status` supports only `offered | accepted | declined`; completed outcomes are stored separately. It does not retain explicit lapsed or cancelled Challenge occurrence states.

A future ledger should be keyed by the occurrence identity in §3 and preserve the terminal/intermediate state of each presented occurrence:
- `offered` — presented and unresolved;
- `accepted` — committed and unresolved;
- `declined` — declined; never re-present this occurrence;
- `lapsed` — expired or otherwise lapsed; never re-present this occurrence;
- `cancelled` — cancelled by an authorized process; preserve as distinct from decline/lapse;
- `completed` — resolved and represented in the outcome archive.

“Unresolved” is a query over `offered` and `accepted`, not a terminal status. If the design later needs to retain an eligible-but-not-selected trigger, that is not an offered Challenge and must not be added as a queued occurrence: §4.5 explicitly rejects delayed backlogs.

Every ledger entry should retain:
- scenario ID and occurrence key;
- primary causal fact kind/ID and any required source fact IDs;
- matter ID when applicable;
- selected/presented day and delivery route;
- current lifecycle status and the day/status transition was recorded;
- player-character assignee for the commitment, without making the occurrence character-owned.

The ledger belongs to the world opportunity history, not the active character's career. Succession must not clear it or make the same source occurrence eligible for the successor.

**Legacy compatibility:** do not invent missing source events, records, knowledge, or historical lifecycle transitions. Existing active Challenge instances and archived outcomes can be carried forward as legacy suppression records using only their extant Challenge IDs and status/outcome data. Legacy declines, lapses, or cancellations that were never recorded cannot be reconstructed. Preserve that absence rather than synthesizing a false history.

## 5. Deterministic Challenge selection

The approved specification leaves exact seed ownership and weights open. The technical proposal is:

1. Persist one world-level opportunity-selection seed derived from the explicit new-game seed. It remains with the world through character succession; it is not inherited character skill or rank.
2. Evaluate at most once at the approved END_DAY evaluation point, using a stable evaluation identity such as `eraId + dayNumber`.
3. Build the eligible set only after checking trigger provenance, authored access route, repeatability, onboarding gate, and unresolved cap.
4. Reject duplicate occurrence keys; sort candidates by `scenarioId`, then occurrence key.
5. Use positive integer authored weights. Draw from a deterministic hash/PRNG input containing the world seed, evaluation identity, and canonical ordered candidate identities. Select by cumulative integer weight; candidate order defines deterministic interval boundaries. No `Math.random`, wall-clock seed, object iteration order, or ambient entropy.
6. If no candidate is eligible, the onboarding gate is closed, or the two-unresolved cap is full, select nothing. Do not queue a backlog. Re-evaluate only while the source trigger remains genuinely eligible at a later normal evaluation point.

This proposal requires Game Director/Design HQ review before any new seed or ledger field is persisted. Exact weights and selection modifiers remain open for playtesting.

## 6. Day-Close persistence and older-reader safety

### 6.1 Current compatibility facts

The current save envelope is schema version 2. `isValidSaveEnvelope` accepts only the current `SAVE_SCHEMA_VERSION`; the current state validator checks the required top-level maps and nested data. The schema-v2 compatibility strategy tolerates specified optional additive fields, but an older schema-v2 reader has no way to understand a new Day-Close phase if that phase is merely added as an optional field.

Therefore, **an intermediate Evening Interlude save must not be shipped as an optional additive schema-v2 field**. An old reader could ignore it and load the state as an ordinary open Workday.

### 6.2 Proposed safe transition model

A persistent Day-Close implementation should have explicit phases and a stable settlement identity, conceptually:
- `workday_open`;
- `preliminary_settlement_recorded` / `interlude_open`;
- `sustenance_finalized` (transitioned atomically into the next open Workday).

The preliminary settlement must be applied in one state transition and recorded with a stable settlement ID. It credits completed-work compensation and other earned entries exactly once, before calculating the sustenance preview. The pending sustenance deduction and projected shortage consequence are displayed but not applied. The calendar and next-day AP are unchanged.

Reload during the Interlude restores the recorded preliminary settlement and current post-credit balance. Reopening the screen is read-only; it does not replay compensation.

When the player confirms Begin Workday, one atomic transition:
1. checks that the current settlement ID is not already finalized;
2. computes sustenance and shortage from the post-interlude Provisions balance;
3. applies the deduction and any due Underfed/Stress consequence once;
4. marks the settlement finalized;
5. advances the calendar and initializes the next AP allocation;
6. prepares the Morning Report and only then evaluates/presents eligible Challenges at the approved point.

A repeated or stale Begin Workday action must be rejected without applying any entry twice. Settlement ledger entries and phase transition must be committed together in the same saved envelope revision.

### 6.3 Schema compatibility — approved contract and implementation status

Game Director approval authorizes an explicit schema-v3 envelope and v2→v3 migration. The approved implementation contract is:
- Keep the physical storage key `scribe_game_v2` so a v2-only client encounters the v3 envelope and rejects it through its exact-version check. Do not create a parallel v3 primary slot.
- Before replacing a validated v2 envelope, preserve its exact bytes in `scribe_game_v2_rollback`; write the complete validated v3 envelope to the primary slot before exposing the session as playable.
- Initialize migrated saves as `workday_open`, with no pending settlement or credits. Do not replay v2 settlement or infer unfinished Interlude state.
- Derive a stable migration-only selection seed from the exact UTF-8 bytes of the validated v2 envelope. New games use the explicit Character Creator seed.
- Preserve existing Assignment and Challenge state, including legacy Challenge instances/outcomes, without manufacturing missing causal facts or lifecycle history.
- A Day-Close boundary is committed to in-memory state only after its complete save envelope is durably written; on write failure, return the prior state and an error.

The first persistence implementation slice is in PR #90. It adds the v3 envelope/state model, v2 validation/migration, rollback-copy write ordering, and Day-Close provider write rollback. The two-step Interlude transitions, compensation crediting, and UI remain subsequent implementation work. Test coverage must include v2 open-Workday and post-v2-END_DAY saves, v3 Interlude reload, duplicate/stale transitions, write failures, and older-client rejection.

## 7. Sequencing and gates

- This PR is limited to this technical-design note. The authored semantic source remains `dev/GD-ERA1-ANCHORS-001.md` on `main`; no mirrored TypeScript content catalog or inert catalog tests are included.
- Issue #82 is CLOSED — VERIFIED by the Game Director's recorded smoke test. Its sequencing gate is satisfied.
- Runtime implementation is authorized under the approved Issue #85 contracts and is proceeding in separately reviewable slices. PR #90 is the first persistence foundation slice; it does not yet implement the full Interlude transition or compensation timing.
- Keep Assignment Supply, Challenge Director, occurrence ledger, deterministic selection, and Day-Close work within the approved `GD-OPPORTUNITY-001` / `PRODUCTION-HANDOFF-001` contracts. No generic trigger backlog, ambient randomness, invented source facts, or unbounded history scan.
- The provisional Playtest 1 economy package is ratified: 2 Currency → 1 Provision remains provisional for Playtest 1; recovery labor is 2 AP → 1 Provision, once per Workday; Ur-gir remains conditional; provisions-in-kind amounts remain authored per Assignment.
- Non-blocking content/UI polish recorded on Issue #85: (1) South-Court offer cards must disclose its authored +1 Provision compensation before acceptance; (2) South-Court must offer a second plausible scenario-specific Responsibility claim alongside “No individual responsibility assigned,” without restoring the unrelated Dudu option.

## 8. Validation status

This note is the documentation-only foundation for Issue #85. The five authored Era I anchors remain canonical in `dev/GD-ERA1-ANCHORS-001.md`; the inert TypeScript mirror and structural tests were removed so future executable content definitions are authored in `src/content/` during runtime implementation.

PR #87's branch was synchronized with `main` in merge commit `001d77cdc7a39d8f8f553a6239e95a16e49c2f6d`. PR #88 is merged and Issue #82 is CLOSED — VERIFIED. Runtime work is authorized; PR #90 contains the first schema-v3 persistence foundation slice. PR #87 still requires fresh CI on the synchronized, documentation-updated head before merge. No local test execution is claimed.

## 9. Combined review — approved contracts and production implementation

**Review scope:** the Game Director's consolidated Issue #85 direction (24 Nov 2026), subsequently approved in the Issue #85 sequencing/authorization update. This section records the approved technical and economy boundaries and the current Production implementation references. No separate test-vector, interface, PRNG-code, or coverage-design documents are required.

### 9.1 Schema v3 and v2→v3 migration safety

**Approved:** use an explicit schema-v3 envelope. Do not represent a saved intermediate Evening Interlude as an optional schema-v2 field. The v2 reader requires `schemaVersion === 2`; a v2-only client therefore rejects the v3 envelope rather than silently loading an ordinary open Workday.

**Approved field-level contract**

| Area | v3 addition / treatment |
|---|---|
| Save envelope | Change `schemaVersion` from 2 to 3. Retain the existing physical storage slot during the transition so a v2-only client encounters the v3 envelope and rejects it, rather than loading an older parallel save. The current v2 reader already rejects an unsupported envelope and preserves it without overwriting. |
| `GameState.dayClose` | Add `phase: workday_open | interlude_open`, the pending `settlementId` (null outside the Interlude), and `lastFinalizedSettlementId` (nullable). A fresh game starts `workday_open`. |
| `GameState.opportunities.selectionSeed` | Persist the world-level deterministic selection seed. New games take it from the explicit Creator seed; it belongs to the world and survives succession. |
| `GameState.opportunities.occurrenceLedger` | Add world-level occurrence/lifecycle history for new authored occurrences. New entries retain scenario ID, canonical occurrence key, actual primary causal fact kind/ID, required source-fact IDs, optional matter ID, delivery/presentation data, lifecycle, and assignee where a commitment exists. |
| `dayClose.pendingCredits` | Add a durable, uniquely keyed pending-credit ledger for Money/Provisions earned during a Workday but not yet credited. Each entry retains its real source kind/ID, earned day, amounts, and the settlement ID that credited it. Do not infer a credit from a completed status alone. |
| Existing opportunity state | Preserve `assignments`, `challenges`, `challengeOutcomes`, aggregates, recent activity, and the optional Assignment generator ledger. Do not replace or re-key their existing IDs during migration. |

**Migration rules**

1. Validate the complete v2 envelope with the v2 rules before transforming it. Preserve the original raw v2 payload as a rollback copy until the v3 envelope has passed v3 validation and been written successfully.
2. Copy all existing world, career, Work, record, knowledge, relationship, wallet, Assignment, Challenge, and archive data without changing historical claims or attribution. Keep absent optional fields absent unless the v3 runtime requires a safe, explicitly documented default.
3. Initialize `dayClose.phase = workday_open`, with no pending settlement ID. A v2 save has no persisted Interlude phase: the existing v2 `END_DAY` transition already applies sustenance, advances the calendar, initializes next-day AP, and writes one complete state. Do not replay that prior settlement or infer an unfinished Interlude from balances/AP.
4. V2 Assignment compensation and opportunity consequences were applied directly to the wallet when completed/resolved. Initialize the v3 pending-credit ledger empty; **never re-credit old completed Assignments or archived outcomes** during migration.
5. Preserve every extant Assignment offer and its exact status, sourceRecordId/originMatterId when present, activity progress, compensation, and assignee attribution. Preserve missing legacy assignee fields as missing; do not invent an actor or source event.
6. Preserve extant Challenge instances and their recorded `offered | accepted | declined` status, plus every `challengeOutcomes` archive entry. Create legacy suppression entries keyed only by a namespaced legacy instance/outcome ID and marked `legacy`; leave causal occurrence key and source-fact identity absent. Do not invent EventIds, RecordIds, KnowledgeEntries, declined/lapsed/cancelled history, or other unrecorded lifecycle transitions. A completed archive entry remains the only evidence of a completed legacy Challenge.
7. Existing v2 saves do not contain the original world opportunity seed. For migrated saves, derive a stable migration-only seed once from a digest of the exact validated v2 envelope bytes and persist it; do not use wall-clock time, `Math.random`, or fabricate a historical source fact. New games persist the explicit Creator seed directly.
8. Migrate in memory, validate the full v3 state, then write one complete v3 envelope. Do not expose the migrated session as playable if migration validation or persistence fails. Retain the v2 rollback copy until the first successful v3 save is confirmed.

**Exactly-once settlement contract**

- Use a stable settlement identity for the Workday being closed (era ID + day number, encoded canonically). Preliminary close is accepted only from `workday_open`; it credits each eligible pending-credit entry once, marks those entries with that settlement ID, and atomically records `interlude_open` plus the pending settlement ID.
- Reloading an Interlude restores the post-credit wallet and the same pending settlement ID. Reopening the screen is read-only; it cannot credit earnings again.
- Replenishment transactions during the Interlude update only their explicitly authorized balances/obligations. They do not grant AP or perform labor.
- Begin Workday requires the exact pending settlement ID and rejects stale, repeated, or already-finalized IDs. In one state transition it applies sustenance and any due shortage/Underfed/Stress consequence, records the finalized settlement ID, advances the calendar, initializes the correct AP allocation, and returns to `workday_open`. Morning Report preparation and the approved Challenge evaluation follow that transition.
- The settlement ledger, wallet changes, phase change, calendar/AP transition, and finalized ID must be serialized in one complete save envelope. Never split the financial credit and phase marker across independent writes.

**Persistence risk and implementation disposition:** the former `GameProvider.dispatch` write-failure behavior allowed an unsaved state to remain active. PR #90 changes the Day-Close boundary to persist before committing the in-memory state; a failed write returns the previous state and an error. This change is implemented on PR #90 and remains subject to its CI/review/merge gate. The older-reader rejection and rollback-copy policy are implemented in the same slice.

**Remaining implementation work:** complete preliminary settlement crediting, the persisted Interlude, Begin Workday finalization, transaction eligibility, and reload/duplicate/stale-action tests in subsequent Issue #85 slices. Schema v3 and its migration policy are approved; PR #90 is the first implementation slice, not the completion of the Day-Close feature.

### 9.2 Playtest 1 economy numbers and practical consequences

**Design status:** the Game Director ratified the provisional Playtest 1 economy package. Abstract Currency purchasing at **2 Currency → 1 Provision** remains a provisional game parameter for Playtest 1, not a claim that a universal Uruk market or historically attested retail price existed. Player-facing text must call it an abstract, provisional replenishment option. The 3- and 4-Currency columns remain sensitivity comparisons, not approved alternatives.

| Route | Playtest 1 terms | Practical effect / boundary |
|---|---|---|
| Assignment compensation in kind | The authored Assignment may award Provisions directly; the amount is defined by that contract. One Provision is one additional Workday of sustenance at the current rate. | No Currency conversion is needed. Do not impose a universal in-kind payout across every Assignment or invent a payment where the authored contract does not offer it. |
| Recovery labor | **2 AP → 1 Provision**, once per Workday. | Must be visible before depletion and available to all four orientations without Currency, appointment, or special relationship. It consumes ordinary Workday AP; never offer it in the Interlude. |
| Ur-gir personal advance | **1 AP → 1 Provision**, with one outstanding obligation at a time. | Retain existing conditions: player has zero Provisions; Ur-gir is alive/initialized and has a Provision; directional trust is at least 50 with no resentment; no outstanding obligation to him. Repayment remains one unit of Currency or one day of scribal assistance by mutual arrangement. This is conditional help, not the universal recovery route. |
| Abstract Currency purchase — baseline | **2 Currency → 1 Provision**. | 10–12 Currency buys 5–6 Provisions. |
| Abstract Currency purchase — comparison | **3 Currency → 1 Provision**. | 10–12 Currency buys 3–4 Provisions (with any remainder retained). |
| Abstract Currency purchase — comparison | **4 Currency → 1 Provision**. | 10–12 Currency buys 2–3 Provisions (with any remainder retained). |

**Worked survival example — starting balance 5 Provisions**

Assumptions are explicit: a new Era I character begins with 5 Provisions and 0 Currency; sustenance is 1 Provision per Workday settlement; the Storehouse Reckoning is a tutorial, not a Work and not a provisions-in-kind earning route. There is no qualifying Work provision contract in this example. A typical completed Assignment earns **10 Currency** at the preliminary close on Day 3. The player may purchase before confirming Begin Workday; the normal 1-Provision sustenance deduction then applies.

| Point in the example | No replenishment | 2 Currency rate | 3 Currency comparison | 4 Currency comparison |
|---|---:|---:|---:|---:|
| Start Day 1 | 5 Provisions | 5 | 5 | 5 |
| After Day 1 settlement | 4 | 4 | 4 | 4 |
| After Day 2 settlement | 3 | 3 | 3 | 3 |
| Day 3 preliminary close | 3 Provisions; no earnings | 3 + 10 Currency | 3 + 10 Currency | 3 + 10 Currency |
| Purchase before Day 3 sustenance | 0 | +5 Provisions | +3 Provisions, 1 Currency remains | +2 Provisions, 2 Currency remain |
| After Day 3 sustenance | 2 | 7 | 5 | 4 |
| Provisioned Workdays remaining after Day 3 | 2 | 7 | 5 | 4 |
| First unprovisioned settlement if no further recovery | Day 6 | Day 11 | Day 9 | Day 8 |
| Third consecutive unprovisioned settlement if no further recovery | Day 8: Underfed and +2 Stress | Day 13 | Day 11 | Day 10 |

Without replenishment, the initial five Provisions cover Days 1–5; the first shortage day is Day 6, followed by the two-day grace period. At the end of the third consecutive unprovisioned settlement (Day 8), Underfed applies and shortage-attributed Stress increases by 2, subject to the existing lifetime cap. The 2-Currency baseline turns a 10-Currency Assignment reward into five additional provisioned Workdays; 3 and 4 Currency reduce that buffer to three and two days respectively.

An authored in-kind award of **1 Provision** on Day 3 would change the post-Day-3 balance from 2 to 3 and add one provisioned Workday without spending Currency. This is a unit comparison, not a proposed universal Assignment reward. On Day 5, when the example character has 1 Provision remaining, recovery labor can add 1 before settlement for 2 AP; the sustenance deduction then leaves 1 Provision, preventing depletion that day. If the character instead reaches zero, the eligible Ur-gir advance can bridge one settlement for 1 AP, but creates the stated obligation and may be unavailable.

**Implementation direction:** retain the ratified provisional **2 Currency → 1 Provision** baseline for Playtest 1, with the 3/4 comparisons available only for later tuning. Keep the universally accessible, signposted 2-AP labor route as the non-Currency safety net; use authored in-kind compensation at the amount defined by each Assignment; retain Ur-gir as conditional support only. Do not treat the purchase mechanic as a substitute for the required all-orientation recovery route. No universal in-kind payout amount is authorized.
