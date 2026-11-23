# Work Contribution Step 1 — Identity and Ledger Foundation

**Status:** Proposal for owner review; no runtime implementation authorized by this document.  
**Architecture authority:** The separate undertaking-owned contribution ledger is an **APPROVED PRINCIPLE**.  
**Implementation maturity:** Concrete type and transition shapes below are proposed, not final schema.  
**Depends on:** [Work Contribution Behavior Specification](WORK_CONTRIBUTION_BEHAVIOR_SPEC.md), [Work Contribution Architecture Decision](WORK_CONTRIBUTION_ARCHITECTURE_DECISION.md).  
**Repository baseline:** `main`, inspected 23 November 2026.

## 1. Purpose and boundary

Step 1 establishes a durable identity and authorship foundation for professional contributions. It must be possible to identify one contribution instance, associate it with the Work undertaking that owns it, record the character who actually created it, validate those references, and preserve the data through save/restore.

This step does **not** implement:

- Work-authored contribution definitions or validation of contribution-type IDs against a catalog (Step 2).
- Contribution completion, deliverables, evidence bundles, assessment, or correction/supersession (Steps 2–3 and 8).
- Career XP eligibility, amounts, receipts, or awards (Step 4).
- Overall Work completion changes or Historical Progress XP changes (Step 5).
- Institutional response, execution, invitation, or succession handoff (Steps 6–7).
- Multiple active Works, repeated concurrent instances of one Work, or a new undertaking-ID scheme.

The current `WorkId` is the provisional undertaking scope because the current game permits one persisted instance per Work ID. This is a practical compatibility boundary, not a claim that a Work definition and an undertaking are conceptually identical forever.

## 2. Current implementation constraints

The inspected `main` baseline currently has:

- `GameState.works = { activeWorkId, progress }`; `progress` is keyed by `WorkId`.
- `WorkProgress` is an operational cursor containing status, evidence IDs, completed action IDs, scenario data, submission count, a Work-level reward guard, and last Work-level assessment.
- `WorkDefinition` owns the authored scenario/action/evidence and submission pipeline, but has no contribution-type catalog.
- Submission context knows the current `personId` at submission time. That is not reliable evidence of who performed earlier professional work.
- `Person.scribal` distinguishes initialized professional characters from identity-only people. A contribution author must be an initialized scribal character at the time the contribution is registered.
- `SAVE_SCHEMA_VERSION` is currently 2; the save key is `scribe_game_v2`. `GameState.works.progress` is validated against the registered Work catalog. Optional additions have already been used for schema-v2 compatibility.
- `restoreSave` normalizes selected historical save differences before strict envelope/state validation. Missing optional fields are not generally materialized merely to make old saves look new.

Step 1 should add a separate persistence boundary without moving or duplicating the existing Work interaction cursor.

## 3. Proposed conceptual types

The following TypeScript is illustrative and intentionally limited to the Step 1 boundary. Names and exact placement remain reviewable.

```ts
// src/state/ids.ts
export type ContributionInstanceId =
  string & { readonly __brand: 'ContributionInstanceId' };

// Step 1 stores the authored type key as an opaque reference.
// Step 2 will introduce/validate the WorkDefinition contribution catalog.
export type ContributionTypeId =
  string & { readonly __brand: 'ContributionTypeId' };

// src/state/types.ts
export interface WorkContributionInstance {
  /** Unique within its owning undertaking ledger; never reused. */
  id: ContributionInstanceId;
  /** Redundant by design: enables cross-checking map ownership and record scope. */
  workId: WorkId;
  /** Opaque until Step 2 adds Work-authored contribution definitions. */
  contributionTypeId: ContributionTypeId;
  /** The character who actually undertook this responsibility. Immutable after creation. */
  actorPersonId: PersonId;
  /** World day on which this contribution instance was registered. */
  createdDay: number;
}

export interface WorkContributionLedger {
  /** Provisional undertaking identity under the current one-instance-per-WorkId rule. */
  workId: WorkId;
  /** Monotonic per-ledger sequence; never decremented or reused. */
  nextSequence: number;
  /** Keys must equal each instance's id. */
  contributions: Record<ContributionInstanceId, WorkContributionInstance>;
}

// GameState.works addition:
contributionLedgers?: Partial<Record<WorkId, WorkContributionLedger>>;
```

### Why this is deliberately small

- The ledger is separate from `WorkProgress`; it does not become another mutable scenario/action cursor.
- The ledger is owned by the undertaking scope, not by `Person`, the current player, a submission, or a `RecordEntry`.
- `actorPersonId` is required on every newly registered contribution. There is no nullable actor and no "current actor" fallback during restore.
- The contribution type is an opaque authored key for now. Step 1 must not invent contribution definitions or treat action IDs as contribution types.
- No status, completion timestamp, assessment, deliverable, evidence, XP receipt, correction, or handoff fields are added yet. Those concepts require their later steps and authored contracts.
- No synthetic "legacy contribution" is created for old WorkProgress. Absence of ledger data means the old save has no contribution-level history.

## 4. Identity and creation transition

### 4.1 Stable identity

Use a deterministic, persisted per-ledger sequence rather than random UUID generation:

- First instance in a ledger: `contribution-1`.
- Next instance: `contribution-2`, and so on.
- The map key and `instance.id` must match.
- `nextSequence` is the next unused positive integer and must be greater than every sequence already present.
- A deleted/abandoned instance must not free its identifier for reuse. Step 1 should not delete contribution instances.

This produces stable identities across replay and restore without requiring a global ID service. Because IDs are scoped to the ledger, the same local sequence value may occur in another Work ledger.

### 4.2 Proposed domain transition

Step 1 should define a pure state transition/service boundary, but should not yet expose a player-facing `GameAction`. Until Step 2 supplies Work-authored contribution definitions, no production workflow has a valid catalog entry from which to create one.

Illustrative API:

```ts
registerWorkContribution(
  state: GameState,
  input: {
    workId: WorkId;
    contributionTypeId: ContributionTypeId;
  },
): GameState
```

Transition contract:

1. Require an existing registered Work definition and an existing active `WorkProgress` for `workId`. The Work must be active; this operation cannot attach a new contribution to a completed, abandoned, or unknown Work.
2. Require `state.player.currentCharacterId` to resolve to an existing Person with initialized scribal capability. The actor is derived from this state. The caller cannot supply an arbitrary `actorPersonId`.
3. Require a non-empty contribution type key. In Step 1 this is only syntactic validation; Step 2 will validate that the key is declared by this Work.
4. Create the ledger if it does not exist, with `nextSequence = 1` and an empty contribution map.
5. Allocate `id = contribution-${nextSequence}`, store the instance with `workId`, `contributionTypeId`, the current character's ID, and the current calendar day.
6. Increment `nextSequence` exactly once and commit the ledger and sequence increment as one immutable state transition.
7. Do not spend AP, mutate WorkProgress, complete an action, create a world event, create a RecordEntry, change institutional state, or award XP. Registration establishes identity and attribution only.

The transition must fail without partial mutation if any precondition fails. It must not silently repair malformed existing ledger data. The transition is not wired to a button/action in Step 1; Step 2 will connect it to authored Work contribution workflows.

### 4.3 Attribution rules

- Attribution is captured at registration time from the active initialized character.
- Attribution is immutable. There is no edit/reassign operation in Step 1.
- A later active character cannot become the actor by submitting the Work, reading the ledger, restoring a save, or succeeding the predecessor.
- A contributor need not remain alive or remain the active character. Validation requires the Person record to exist; it must not require the actor to be the current player.
- Creation-time capability checks require an initialized scribal character. Restore-time validation checks referential integrity (the Person exists) rather than re-deriving historical capability from present-day player state.
- NPCs responsible for world events are not contribution actors unless they are actually performing the professional contribution represented by the instance. Step 1 does not model world-event responsibility.

## 5. Validation contract

Add a focused `isWorkContributionLedger` validator and integrate it into `isValidGameState`. Validation must reject the entire save rather than silently dropping or repairing malformed contribution history.

For every ledger:

1. The ledger key is a non-empty Work ID and equals `ledger.workId`.
2. The Work ID exists in the registered Work catalog. The associated WorkProgress exists. A ledger may remain when its WorkProgress is completed or abandoned; historical contribution identity must not disappear with active status.
3. `nextSequence` is a positive integer.
4. `contributions` is a plain object/map (not an array).
5. Every contribution map key is non-empty and equals `instance.id`.
6. Every instance's `workId` equals the owning ledger's Work ID.
7. Every `contributionTypeId` is a non-empty string. Do not yet require a match in WorkDefinition; that becomes mandatory in Step 2.
8. Every `actorPersonId` resolves to an existing Person in `world.people`. Do not require that person to be alive or current.
9. Every `createdDay` is a positive integer no later than the current world day.
10. Every instance ID follows the selected local sequence format; IDs are unique in the ledger; each sequence is positive and lower than `nextSequence`.
11. There are no duplicate ledger keys (ordinary object keys already enforce this, but key/record identity still must be checked).
12. No validation rule infers an actor from `player.currentCharacterId`, `WorkProgress`, `lastAssessment`, or a submission record.

The validator should remain separate from the existing `isWorkProgress` validator. Do not fold contribution history into WorkProgress validation.

## 6. Save, restore, and legacy compatibility

### 6.1 Proposed compatibility behavior

For the first increment, prefer an **optional additive field within schema v2**, subject to confirming no undocumented consumer requires exact `GameState.works` keys:

- Keep `SAVE_KEY = 'scribe_game_v2'` and `SAVE_SCHEMA_VERSION = 2`.
- Make `works.contributionLedgers` optional in the TypeScript state shape.
- Old schema-v2 saves without the field remain valid and restore unchanged; the validator treats absence as "no contribution ledger data recorded."
- New games may initialize the field as an empty object, or the first contribution registration may create it. Choose one consistently in implementation; either is compatible with this contract.
- Saves with the field persist it unchanged through create/save/restore.
- Restore must validate a present ledger; malformed present data is not treated as legacy absence.
- Do not derive contribution instances from `WorkProgress.completedActionIds`, acquired/examined evidence, submission count, last assessment, Work reward guard, or the active character.
- Do not attach historical contributions to the currently selected character to make old saves appear complete.
- Do not synthesize a legacy/unattributed contribution record. A missing ledger is an explicit compatibility condition, not an instance.

This approach follows the repository's existing schema-v2 optional-field precedent and avoids rewriting existing saves merely to add an empty map. It does not promise forward compatibility with older application versions that may rewrite and discard unknown fields; that limitation should be recorded in release notes if relevant.

### 6.2 Migration alternatives

| Option | Behavior | Advantages | Costs / risks |
|---|---|---|---|
| **A. Optional additive schema-v2 field (recommended)** | Add optional `works.contributionLedgers`; absence remains valid. No upcast for old saves. | Smallest change; consistent with current optional v2 additions; no mass rewrite; no false attribution. | Schema v2 becomes incrementally richer; old clients may not preserve unknown fields if they load and resave. |
| **B. Schema-v3 envelope and explicit v2→v3 upcast** | Increment envelope version and transform every v2 save into v3 with an explicit legacy marker or absent ledger. | Clear version boundary; future incompatible shape changes easier to reason about. | Requires migration path, key/read compatibility, migration tests, and careful treatment of all existing v2 data; disproportionate for one optional field. |
| **C. Eager compatibility ledger for every old Work** | Restore creates an empty ledger or a special legacy ledger for every WorkProgress. | Uniform in-memory shape. | Unnecessary mutation; risks implying that missing historical authorship was examined or represented. An empty ledger can be derived at read time without persisting it. |

**Recommendation:** Option A. Keep absence semantically meaningful and preserve it. If later steps require a breaking persisted structure, introduce schema v3 with an explicit, tested migration rather than accumulating incompatible shapes under v2.

### 6.3 Restore semantics

- Parse and normalize the save using the existing restore pipeline.
- If `contributionLedgers` is absent, do not materialize it during restore.
- If present, validate all ledgers and references before accepting the envelope.
- Preserve contribution IDs, actor IDs, Work scope, created day, and next sequence exactly.
- A valid old save with no contribution history remains playable; a malformed new ledger causes restore rejection (returns `null` under the current boundary).
- Save→restore→save must not change attribution or allocate new IDs.

## 7. Acceptance tests

These tests are Step 1 scope. The wider WC/AT contract remains authoritative for later steps; these tests do not claim that the full contract is implemented.

| ID | Test | Expected result |
|---|---|---|
| S1-01 | Register the first contribution for an active Work. | Ledger is created; ID is `contribution-1`; actor is the active initialized character; next sequence becomes 2. |
| S1-02 | Register a second contribution in the same ledger. | ID is `contribution-2`; first instance remains unchanged; next sequence becomes 3. |
| S1-03 | Register contributions in two different Work ledgers. | Each ledger has its own sequence; local IDs may match without cross-ledger collision. |
| S1-04 | Attempt registration with no active WorkProgress for the supplied Work ID. | Transition fails; no ledger or sequence mutation occurs. |
| S1-05 | Attempt registration for a completed or abandoned Work. | Transition fails; historical ledger, if any, remains unchanged. |
| S1-06 | Active character is missing, identity-only, or lacks initialized scribal capability. | Transition fails; no contribution is created. |
| S1-07 | Caller attempts to provide an actor other than the active character. | API does not accept actor input; attribution is derived from state. |
| S1-08 | A successor becomes the active character after an earlier contribution. | Earlier contribution retains predecessor actor; successor can only author a separately registered new instance when a valid workflow permits it. |
| S1-09 | Ledger key and embedded `workId` disagree. | Save validation rejects the state. |
| S1-10 | Contribution map key and embedded `id` disagree. | Save validation rejects the state. |
| S1-11 | Duplicate/local malformed IDs, reused sequence, or `nextSequence` not greater than all allocated IDs. | Save validation rejects the state. |
| S1-12 | Actor Person ID does not resolve. | Save validation rejects the state; no active-character fallback is attempted. |
| S1-13 | Actor exists but is dead or is no longer the current character. | Save remains valid; historical attribution is preserved. |
| S1-14 | Created day is zero, non-integer, or in the future. | Save validation rejects the state. |
| S1-15 | Legacy schema-v2 save has no `contributionLedgers`. | Save restores successfully; restore does not invent an empty persisted ledger or contribution instance. |
| S1-16 | Save contains a present but malformed contribution ledger. | Restore rejects it; malformed data is not silently treated as legacy absence. |
| S1-17 | New save with contribution ledger is saved and restored. | All IDs, actors, Work references, day values, and sequence counters round-trip exactly. |
| S1-18 | Save is restored and saved repeatedly. | No new IDs are allocated; actor attribution and sequence remain unchanged. |
| S1-19 | Legacy WorkProgress contains completed actions and a last assessment but no ledger. | No contribution instances or actor attribution are inferred from those fields. |
| S1-20 | Ledger belongs to a known Work whose WorkProgress is completed. | Ledger remains valid and persisted; historical contribution identity is not tied to active status. |

### Required regression coverage

In addition to S1-01–S1-20:

- Existing schema-v2 save fixtures continue to restore.
- Existing WorkProgress validation and tutorial exclusions remain unchanged.
- Existing Work submission/finalization and Historical Progress XP behavior remain unchanged.
- Character succession still does not create a handoff or transfer contribution authorship.
- Existing save normalization does not drop or rewrite a present contribution ledger.
- Invalid references and duplicate identities fail at the actual `restoreSave` boundary, not only in isolated helper tests.

## 8. Proposed implementation sequence after approval

1. Confirm exact type names and whether the optional field lives directly under `GameState.works` (recommended) or a dedicated Works-state interface.
2. Add branded ID type and Step 1 interfaces.
3. Add pure deterministic registration transition/service with actor derived from active state; do not wire a UI action yet.
4. Add ledger validator and integrate it into `isValidGameState`.
5. Add save/restore round-trip and legacy compatibility tests.
6. Audit every normalization/save path for preservation of the optional ledger.
7. Run and report separately: `npm run lint` (TypeScript check), test suite (if configured), `npm run build`, and any relevant deployment workflow. No deployment is part of Step 1.

## 9. Decisions requested from owner

Please review these specific implementation-shaping recommendations:

1. **Scope identity:** use current `WorkId` as the provisional undertaking key until repeated/concurrent Work instances are actually required.
2. **ID policy:** use a deterministic per-ledger monotonic sequence, with IDs scoped to their ledger and never reused.
3. **Actor policy:** derive the contributor from the active initialized character at registration; never accept caller-supplied actor attribution.
4. **Legacy policy:** missing ledger means untracked historical contribution data; do not synthesize contribution instances or infer authors.
5. **Save policy:** add an optional schema-v2 field for this non-breaking addition; reserve schema v3 for a genuinely breaking persisted-shape change.
6. **Step boundary:** define the registration service and persistence/validation now, but do not connect it to gameplay until Step 2 supplies Work-authored contribution definitions.

Approval of this proposal would authorize implementation planning for this bounded foundation only. It would not approve the Step 2–9 sequence, final contribution lifecycle, Career XP design, handoff mechanics, or individual Work content.
