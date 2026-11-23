# Work Contribution Step 1 — Identity and Ledger Foundation

**Status:** Proposal for owner review; no runtime implementation authorized.  
**Architecture authority:** Separate undertaking-owned contribution ledger is an **APPROVED PRINCIPLE**.  
**Implementation maturity:** Concrete types and transitions below are proposed, not a final serialized schema.  
**Depends on:** [Behavior Specification](WORK_CONTRIBUTION_BEHAVIOR_SPEC.md), [Architecture Decision](WORK_CONTRIBUTION_ARCHITECTURE_DECISION.md).  
**Baseline inspected:** `main`, 23 November 2026. `createInitialGameState()` initializes `calendar.dayNumber` to `1`.

## 1. Purpose and exclusions

Step 1 establishes durable contribution identity, undertaking scope, actual-character attribution, referential validation, and save/restore compatibility.

It does not implement Work-authored contribution definitions (Step 2), completion/assessment (Step 3), Career XP eligibility or awards (Step 4), overall Work completion/Historical Progress XP (Step 5), institutional lifecycle (Step 6), conditional handoff (Step 7), or correction/supersession (Step 8). It does not introduce multiple active Works, repeated concurrent instances, or a new undertaking-ID scheme.

The current `WorkId` is the provisional undertaking key because current persisted progress is one instance per Work ID. This is an implementation constraint, not a permanent equation between catalog content and an undertaking.

## 2. Relevant current implementation

The inspected baseline has these constraints:

- `GameState.works` contains `activeWorkId` and `progress: Record<WorkId, WorkProgress>`.
- `WorkProgress` is the operational cursor: status, acquired/examined evidence, completed action IDs, scenario data, submission count, Work-level reward guard, and last Work-level assessment.
- `WorkDefinition` has no contribution-type catalog.
- Submission context knows the current person at submission time; it cannot establish who performed earlier work.
- `Person.scribal` distinguishes initialized professional characters from identity-only people.
- Save key is `scribe_game_v2`; envelope schema is 2. WorkProgress is validated against the Work catalog. Optional fields already exist in schema-v2 state.
- `restoreSave` runs normalization before strict envelope/state validation.

The ledger must be separate from WorkProgress. It must not replace or duplicate the operational cursor.

## 3. Proposed concrete types

Illustrative TypeScript; final names and placement remain reviewable.

```ts
// src/state/ids.ts
export type ContributionInstanceId =
  string & { readonly __brand: 'ContributionInstanceId' };
export type ContributionTypeId =
  string & { readonly __brand: 'ContributionTypeId' };

// src/state/types.ts
export interface WorkContributionInstance {
  /** Unique within the owning undertaking ledger; never reused. */
  id: ContributionInstanceId;
  /** Redundant intentionally: validate against the owning ledger. */
  workId: WorkId;
  /** Opaque until Step 2 introduces Work-authored definitions. */
  contributionTypeId: ContributionTypeId;
  /** Actual contributor at registration time; immutable. */
  actorPersonId: PersonId;
  /** World day on which this contribution instance was registered. */
  createdDay: number;
}

export interface WorkContributionLedger {
  /** Provisional undertaking scope under the current one-instance-per-WorkId rule. */
  workId: WorkId;
  /** Next unused positive sequence; never decremented or reused. */
  nextSequence: number;
  /** Keys must equal each instance's id. */
  contributions: Record<ContributionInstanceId, WorkContributionInstance>;
}

// GameState.works addition:
contributionLedgers?: Partial<Record<WorkId, WorkContributionLedger>>;
```

This is intentionally a foundation, not a premature contribution lifecycle. Step 1 has no status, completion, assessment, deliverable, evidence bundle, award receipt, correction, or handoff fields. Those require later contracts. The type key is opaque in Step 1; Step 2 validates it against the Work's authored definition.

## 4. Identity and registration transition

### 4.1 Stable ID policy

Use a deterministic, persisted per-ledger monotonic sequence:

- First ID: `contribution-1`; next: `contribution-2`, etc.
- IDs are unique within their ledger. Identical local sequence values in different Work ledgers are valid.
- `nextSequence` is the next unused positive integer and must exceed every allocated sequence.
- Never reuse an ID, even if a contribution is later abandoned. Step 1 does not delete instances.
- Persist the counter in the ledger; do not derive it from array order or generate random UUIDs.

### 4.2 Proposed pure transition

Define a deterministic domain service, but do not yet expose a player-facing `GameAction`. No production Work currently authors valid contribution types; Step 2 supplies that catalog and wires the service into a real workflow.

Illustrative API:

```ts
registerWorkContribution(
  state: GameState,
  input: { workId: WorkId; contributionTypeId: ContributionTypeId },
 ): WorkContributionRegistrationResult
```

```ts
export type WorkContributionRegistrationFailureReason =
  | 'work-not-registered'
  | 'work-not-active'
  | 'tutorial-not-eligible'
  | 'missing-active-character'
  | 'invalid-contribution-type-id'
  | 'invalid-existing-ledger';

export type WorkContributionRegistrationResult =
  | { ok: true; state: GameState; contributionId: ContributionInstanceId }
  | { ok: false; state: GameState; reason: WorkContributionRegistrationFailureReason };
```

Transition contract:

1. Require a registered Work definition. Reject `kind: 'tutorial'`; omitted `kind` retains the existing ordinary-Work default. Require `state.works.activeWorkId === workId` **and** an existing `WorkProgress` with `status === 'active'`. A merely present progress entry is insufficient; completed, abandoned, or pre-start/available progress is ineligible.
2. Resolve `state.player.currentCharacterId` to an existing Person with initialized scribal capability. The active character is the only actor source; callers cannot pass an actor ID.
3. Require a non-empty contribution type key. Step 1 checks only syntax; Step 2 checks that the key is authored for this Work.
4. Create the ledger if absent: `nextSequence = 1`, empty contribution map.
5. Allocate `contribution-${nextSequence}`, store Work ID, type ID, active character ID, and current calendar day.
6. Increment the sequence and insert the instance in one immutable state transition.
7. Return a discriminated `WorkContributionRegistrationResult`, not a bare `GameState`. On success return `{ ok: true, state: nextState, contributionId }`, exposing the exact allocated ID. On an expected domain/precondition failure return `{ ok: false, state, reason }`, where `state` is the exact original state reference and `reason` is one of the declared failure codes. Expected invalid-state outcomes do not throw. A malformed existing ledger returns `invalid-existing-ledger` without repair or partial mutation.
8. Do not spend AP, mutate WorkProgress, complete an action, create an event/record, change institutional state, or award XP. Registration establishes identity and attribution only.

This service is intentionally dormant until Step 2. There is no UI/action wiring in Step 1.

### 4.3 Attribution invariants

- Actor is captured from the active initialized character at registration time.
- Actor attribution is immutable; Step 1 has no reassign operation.
- Later submission, restoration, or character succession cannot change the original actor.
- A contributor may later be dead or no longer active. Restore validation requires the Person record to exist, not that they remain alive/current.
- Creation requires initialized scribal capability. Restore validation checks the Person reference and does not re-derive historical eligibility from current player state.
- NPCs responsible for world events are not automatically contribution actors. Contribution authorship and event responsibility remain separate.

## 5. Validation contract

Add a focused ledger validator and call it from `isValidGameState`. Keep it separate from `isWorkProgress`. A present malformed ledger rejects the save; it is not silently dropped or repaired.

For each ledger and contribution:

1. Ledger map key is non-empty and equals `ledger.workId`.
2. Work ID exists in the registered Work catalog, is not `kind: 'tutorial'`, and has a WorkProgress entry. The WorkProgress may be active, completed, or abandoned; historical identity must not be deleted when a Work ends.
3. `nextSequence` is a positive integer.
4. `contributions` is an object/map, not an array.
5. Each contribution map key is non-empty and equals `instance.id`.
6. Each `instance.workId` equals the owning ledger's Work ID.
7. `contributionTypeId` is a non-empty string; catalog membership is deferred to Step 2.
8. `actorPersonId` resolves to an existing Person in `world.people`. Do not require alive/current status.
9. `createdDay` is a positive integer no later than the current calendar day.
10. ID matches the canonical regex `/^contribution-[1-9]\\d*$/` (no leading zeros, sign, whitespace, or zero); each parsed sequence is a positive safe integer, unique within the ledger, and lower than `nextSequence`.
11. No rule infers an actor from current player, WorkProgress, last assessment, or submission context.

## 6. Save, restore, and legacy compatibility

### 6.1 Recommended policy: optional additive schema-v2 field

- Keep `SAVE_KEY = 'scribe_game_v2'` and `SAVE_SCHEMA_VERSION = 2` for this non-breaking addition.
- Make `works.contributionLedgers` optional in the TypeScript state shape.
- A legacy schema-v2 save with no field remains valid. Absence means contribution-level history was not recorded; it is not evidence that there were no contributions.
- **Lazy initialization is selected:** omit `works.contributionLedgers` from new-game state and legacy state until the first successful registration. First registration creates the map and its Work ledger. An explicitly present empty object `{}` is valid and remains valid; restore does not add one.
- If the field is present, validate it strictly. Malformed present data is not treated as legacy absence.
- Save/restore preserves IDs, actors, Work scope, days, and sequence exactly.
- Do not derive contribution instances from `completedActionIds`, evidence arrays, submission count, last assessment, Work reward guard, or current character.
- Do not create synthetic unattributed contribution instances. Do not assign old progress to the currently active character.

This follows the repository's optional schema-v2 additions and avoids rewriting all saves for one optional field. It does not guarantee older application versions will preserve unknown fields if they load and resave them; note that limitation if mixed-version use is relevant.

### 6.2 Migration alternatives

| Option | Behavior | Advantages | Costs / risks |
|---|---|---|---|
| **A. Optional additive v2 field (recommended)** | Add optional `works.contributionLedgers`; absence remains valid. No upcast. | Smallest change; matches current optional v2 precedent; no mass rewrite or fabricated authorship. | v2 shape grows; older clients might discard unknown fields on resave. |
| **B. Schema-v3 envelope and explicit v2→v3 upcast** | Bump envelope version and migrate every v2 save, preserving missing contribution history explicitly as absent/untracked. | Clear version boundary; better for future breaking serialized changes. | Requires versioned restore path, save-key/read compatibility, migration tests, and careful preservation of existing v2 data; excessive for this optional addition. |
| **C. Eager empty/legacy ledger on restore** | Materialize a ledger for every existing WorkProgress during restore. | Uniform in-memory shape. | Unnecessary mutation and risks implying old professional history was represented. A read-time empty default is sufficient; do not persist synthetic ledgers. |

**Recommendation:** Option A for Step 1. If a later step requires a breaking persisted shape, introduce schema v3 with an explicit tested migration rather than accumulating incompatible shapes under v2.

### 6.3 Restore behavior

- If `contributionLedgers` is absent, do not materialize it during restore.
- If present, validate all entries and references before accepting the envelope.
- Preserve all identity/attribution fields and the sequence exactly.
- Valid old saves remain playable. A malformed new ledger causes restore rejection under the current `restoreSave` contract.
- Save→restore→save must not change authorship or allocate IDs.

## 7. Acceptance tests

These are Step 1 tests, not a claim that the wider Work Contribution contract is implemented.

| ID | Test | Expected result |
|---|---|---|
| S1-01 | Register first contribution for active Work. | Ledger created; ID `contribution-1`; active initialized character attributed; next sequence 2. |
| S1-02 | Register second contribution in same ledger. | ID `contribution-2`; first instance unchanged; next sequence 3. |
| S1-03 | Register in two different Work ledgers. | Each ledger sequences independently; same local ID may exist in each. |
| S1-04 | `activeWorkId` does not equal the requested Work ID, or progress is missing/not `active` (including completed, abandoned, or pre-start). | Returns `{ ok: false, state: originalState, reason: 'work-not-active' }`; no partial mutation. |
| S1-05 | Registered Work definition has `kind: 'tutorial'` (including Storehouse Reckoning). | Returns `tutorial-not-eligible`; no ledger is created or changed. |
| S1-06 | Work completed or abandoned. | Registration fails; existing historical ledger remains unchanged. |
| S1-07 | Active character missing, identity-only, or uninitialized. | Returns `missing-active-character`; original state reference is unchanged. |
| S1-08 | Caller attempts to choose another actor. | API has no actor input; actor derives from active state. |
| S1-09 | Successor becomes active after predecessor contributed. | Existing actor remains predecessor; any later instance is separately attributed. |
| S1-10 | Ledger key differs from embedded Work ID. | Save validation rejects. |
| S1-11 | Contribution map key differs from embedded instance ID. | Save validation rejects. |
| S1-12 | Duplicate/malformed/reused sequence, leading-zero ID, or invalid next counter. | Save validation rejects. |
| S1-13 | Actor Person reference is missing. | Save validation rejects; no fallback actor is inferred. |
| S1-14 | Actor exists but is dead or no longer current. | Save remains valid; attribution persists. |
| S1-15 | Created day is zero, non-integer, or in the future. | Save validation rejects. New-game baseline is Day 1, so initial-day registration records `createdDay: 1`. |
| S1-16 | Legacy v2 save omits contributionLedgers. | Restore succeeds; no empty ledger or contribution is synthesized. |
| S1-17 | Save has a present malformed ledger. | Restore rejects; malformed data is not treated as legacy absence. |
| S1-18 | New save with ledger round-trips. | IDs, actors, scope, days, and next sequence are identical. |
| S1-19 | Repeated restore/save cycles. | No IDs are allocated; authorship and sequence remain unchanged. |
| S1-20 | Legacy WorkProgress has actions/evidence/assessment but no ledger. | No contribution or actor is inferred from progress fields. |

| S1-21 | Ledger belongs to a completed Work. | Ledger remains valid and persisted; it is not tied to active status. |
| S1-22 | `createInitialGameState()` calendar starts at Day 1. | Initial-day registration records `createdDay: 1`. |
| S1-23 | Existing ledger is malformed when registration is attempted. | Returns `invalid-existing-ledger` with the exact original state; no partial mutation. |
| S1-24 | Successful registration result is consumed by caller. | Result exposes exact `ContributionInstanceId` and next state. |

### Regression requirements

- Existing schema-v2 fixtures still restore.
- Existing WorkProgress validation, tutorial exclusion, submission/finalization, and Historical Progress XP behavior are unchanged.
- Character succession still does not create a handoff or transfer contribution authorship.
- Save normalization preserves a present contribution ledger.
- Invalid references and duplicate IDs fail at the actual `restoreSave` boundary, not only in helper tests.

## 8. Implementation sequence after approval

1. Confirm exact type names and placement; recommended location is directly under a dedicated Works state interface or `GameState.works`.
2. Add branded ID and ledger/instance interfaces.
3. Add deterministic registration service, deriving actor from active state; do not wire a UI action.
4. Add ledger validator and integrate with `isValidGameState`.
5. Add save/restore round-trip and legacy tests.
6. Audit all normalization/save paths for ledger preservation.
7. Verify separately: `npm run lint` (TypeScript check), configured test suite, `npm run build`, and relevant deployment workflow. Deployment is not part of Step 1.

## 9. Owner decisions requested

1. Use current `WorkId` as provisional undertaking key until repeated/concurrent instances are required.
2. Use deterministic per-ledger monotonic IDs, scoped to the ledger and never reused.
3. Derive actor from active initialized character at registration; do not accept actor input.
4. Treat absent ledger as untracked legacy contribution history; never synthesize or infer authors.
5. Add optional schema-v2 field for this non-breaking addition; reserve v3 for a breaking persisted-shape change.
6. Define the registration service and persistence/validation now, but do not connect it to gameplay until Step 2 supplies authored contribution definitions.

Approval would authorize implementation planning for this bounded foundation only. It would not approve Steps 2–9, final contribution lifecycle, Career XP design, handoff mechanics, or individual Work content.
