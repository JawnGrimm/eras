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

### 6.3 Schema compatibility proposal

Before shipping any intermediate phase:
- introduce a new explicit save schema version (provisionally v3);
- teach the new reader to validate and migrate existing v2 saves into the new model without inventing missing settlement history;
- keep the older v2 reader's exact behavior documented: it rejects the v3 envelope because its schema check requires version 2, rather than silently ignoring the phase field;
- test v2 open-Workday saves, v2 saves after existing END_DAY settlement, v3 interlude reload, repeated preliminary close, repeated Begin Workday, stale day IDs, and rollback/older-client rejection.

The save key and local persistence behavior must be inspected before choosing the final versioning implementation. A schema bump is a proposal requiring review, not authorization to change the save contract in this PR.

## 7. Sequencing and gates

- This PR is limited to this technical-design note. The authored semantic source remains `dev/GD-ERA1-ANCHORS-001.md` on `main`; no mirrored TypeScript content catalog or inert catalog tests are included.
- Do not modify `assignmentGenerator.ts`, `challengeDirector.ts`, opportunity state, save normalization/validation, `actionEconomy.ts`, or production UI until Issue #82's QA-82-1 through QA-82-5 corrections are merged.
- After #82 lands, implement runtime integration in separately reviewable slices with acceptance tests for source identity, no duplicate occurrence, all lifecycle states, determinism, succession, and save reload.
- The economy correction must include the early-visible baseline labor route and verify the already-present conditional personal advance category. Currency wording and any Playtest 1 conversion table must be coordinated with the #82 Currency correction and returned for Game Director review.
- No Day-Close persistence implementation ships until the schema/older-reader proposal is reviewed and approved.

## 8. Validation status

This note is an engineering proposal based on `main` source inspection at the time of the audit, reconciled with the current Issue #82 implementation branch. It is not a runtime implementation or an approved technical contract. PR #87 contains documentation only; the inert TypeScript semantic catalog and its tests were removed so the future `src/content/` layer can be authored as playable Assignment definitions. On prior PR #87 head `1d283ad3eeeda76e72940d7429528eda249629c9`, Pull Request Validation, TypeScript analysis, and CodeQL all completed successfully. The current head at this note's revision is `d5741a77080e20017283549cd11970cedb301fb5`: Pull Request Validation has passed, TypeScript analysis is still in progress, and no new CodeQL result has been reported for this documentation-only update. Treat validation as complete only when checks for the exact current head have finished. No local test execution is claimed.
