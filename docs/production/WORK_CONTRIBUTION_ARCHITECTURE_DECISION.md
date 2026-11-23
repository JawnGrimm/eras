# Work Contribution Architecture Decision

**Status:** APPROVED PRINCIPLE; implementation details remain open.  
**Depends on:** [Work Contribution Behavior Specification](WORK_CONTRIBUTION_BEHAVIOR_SPEC.md).  
**Repository baseline reviewed:** `main`, 23 November 2026.  
**Scope:** Conceptual ownership, persistence boundaries, compatibility strategy, and implementation sequence.  
**Non-goals:** This document does not define final TypeScript interfaces, a serialized schema, exact IDs, migrations, reward formulas, or individual Work content. It does not authorize implementation of the full system.

## 1. Approved architecture principle

The accepted Work Contribution Contract requires a durable professional history that the current engine does not represent. The key architecture decision is where that history belongs.

Two viable approaches are evaluated:

- **Approach A — Contribution history embedded in WorkProgress.** Keep contribution instances, actor attribution, assessments, deliverables, corrections, and award receipts inside each Work's existing progress object.
- **Approach B — Separate contribution ledger owned by the Work undertaking.** Keep WorkProgress as the interaction/scenario cursor and persist contribution instances in a distinct collection under the Works domain, linked to the stable undertaking and authored Work definition.

Both approaches retain Work-authored contribution definitions in the Work catalog. Neither makes records, events, institutional matters, or character XP balances the owner of contribution history.

**Approved principle: Approach B — a separate contribution ledger owned by the persistent Work undertaking.** The ledger is conceptually distinct from the mutable Work interaction-progress cursor, not owned by the current character, a submission, or a record. Under today's one-instance-per-Work-ID constraint, the existing Work ID may provisionally scope the ledger. Introduce a distinct runtime undertaking ID only when repeated instances, concurrent instances, or multiple active Works become a demonstrated requirement.

This approval establishes the ownership and persistence boundary only. It does not approve final TypeScript interfaces, serialized field names, collection shape, ID generation, schema versioning, migration behavior, reward formulas, lifecycle states, or individual Work content. Those remain subject to separate review.

## 2. Current architecture facts

The review inspected the current `main` implementations of:

- `src/state/types.ts`
- `src/works/workDefinition.ts`
- `src/state/saveEnvelope.ts`
- `src/engine/actionEconomy.ts`
- `src/engine/careerProgression.ts`
- `src/engine/characterContinuity.ts`

Relevant current facts:

1. `WorkDefinition` owns authored evidence, actions, scenario initialization/validation, submission evaluation, assessment, recovery, and optional disposition finalization. Its submission context includes the current `personId`.
2. `WorkProgress` is persisted by Work ID in `GameState.works.progress`. It contains status, acquired/examined evidence, completed action IDs, scenario data, submission count, a Work-level reward guard, and a last Work-level assessment.
3. `GameState.works` currently contains `activeWorkId` and the progress map. It does not contain contribution instances or contribution award receipts.
4. `SUBMIT_WORK` assesses the overall submission. Accepted submissions can complete the Work directly or await a disposition. The disposition path performs finalization and may award Career XP to the currently active character.
5. Career XP balance is held on each person's initialized scribal state. The general award action updates the active character's balance but has no contribution identity or idempotency key.
6. Character continuity preserves Work progress while changing the active character. Current continuity does not establish a separate institutional handoff or contribution ownership transfer.
7. Records already have an author, sources, assertions, uncertainty limits, and append-only amendments. World events, institutional matters, and knowledge are separate concepts.
8. Save envelopes are schema version 2. Work progress is validated against the registered Work catalog. Optional fields have been used for backward-compatible additions within schema v2; that precedent does not automatically prove every future change can avoid a version bump.

These facts are implementation observations, not design authority.

## 3. Ownership boundaries the architecture must preserve

The recommended architecture separates six responsibilities.

| Concept | Owns | Must not become |
|---|---|---|
| Work definition (`WorkDefinition`) | Authored contribution types, boundaries, required outputs, evidence requirements, assessment rules, XP eligibility, overall completion rules | A store of mutable player history |
| Work progress (`WorkProgress`) | Current interaction state: actions, evidence acquisition/examination, scenario cursor, submission/revision/disposition mechanics | The authoritative historical contribution ledger |
| Work undertaking | Persistent professional remit and its contribution history across characters | The current character's private task list or a single submission |
| Contribution instance | One attributable professional responsibility, its lifecycle, outputs, assessment, corrections, and award eligibility/receipt | An action ID, a record, or a world event |
| World and institutional state | Actual events, institutional matters, authority responses, execution, delivery, fulfillment, and world records | A proxy for the player's professional contribution or grade |
| Character state | Personal skills, knowledge, relationships, career XP balance, and identity | The owner of an undertaking's history or another character's contribution |

### 3.1 Work definition versus undertaking identity

A catalog Work ID identifies authored content. A persistent undertaking identifies one occurrence of that content in a particular world history. The current implementation effectively uses the Work ID as both because progress is keyed by Work ID and the design currently assumes a single occurrence. That is an existing constraint, not a universal design truth.

For the smallest compatible increment, the contribution ledger may be scoped by the current Work ID. Do not invent a new undertaking-instance ID until product requirements establish repeated or concurrent instances. If that requirement arrives, migrate the scope deliberately; do not rely on array order or the current character ID as identity.

### 3.2 Contribution history versus interaction progress

Action IDs and evidence examination remain useful as execution prerequisites and current progress. They do not become professional contributions automatically. A Work-specific adapter or authored rule determines when the evidence/actions support a contribution completion. The ledger stores the resulting professional unit, not every click or intermediate operation.

### 3.3 Contribution versus world history

A contribution can reference world events, source records, knowledge, institutional matters, and deliverables. It does not own or duplicate them. The contribution says what the character professionally did with that material; the world model says what happened and who actually did it. Records retain their own author and amendments. Institutional response and later execution remain separate lifecycle facts.

### 3.4 Career XP balance versus award provenance

The character's Career XP balance remains on that character. The contribution ledger records the one-time award receipt: which contribution instance qualified, how much was awarded, to which character, and when. Applying the receipt and updating the character balance must be one deterministic state transition. A generic Career XP award without a contribution key remains appropriate for other authored reward sources; contribution awards need a keyed, idempotent path.

Historical Progress XP remains a separate one-time award at overall Work completion.

### 3.5 Handoff versus character continuity

Character continuity selects the next playable person. It must not silently transfer the undertaking. The undertaking stores its own handoff state and contribution history. A valid handoff event links predecessor, successor, basis, recognizing actor where required, remit, available records, access, limits, and date. The successor's later contributions are new instances attributed to that successor. If no handoff occurs, the contribution ledger and institutional matter persist, but the player's active contribution to that undertaking ceases.

## 4. Competing approaches

### Approach A — Embed contribution history in WorkProgress

Each `WorkProgress` value gains a contribution collection and associated history. Contribution definitions still live in `WorkDefinition`. Every engine transition updates the progress object containing both the operational cursor and the professional history.

**Strengths**
- Smallest apparent change to the top-level `GameState` shape.
- Work-specific validation is already centered on progress keyed by Work ID.
- Contribution updates can be committed atomically with action, submission, and scenario progress.
- No separate cross-reference between progress and contribution collections is needed for the current one-Work-instance model.

**Weaknesses**
- Couples durable professional history to an object currently designed as mutable execution progress.
- Encourages the WorkProgress validator and action economy to own assessment, award, handoff, and correction semantics.
- Makes it harder to retain and inspect the professional history independently when progress is reset, archived, re-opened, or changed for implementation reasons.
- Risks treating contribution history as part of a single current Work session, especially across succession and institutional lifecycle changes.
- Makes future repeated Work instances or separate undertaking identity harder to introduce cleanly.
- Can turn a previously compact progress record into a large mixed-purpose object.

**Best fit:** A strictly single-run Work system where contribution history is intentionally inseparable from the Work's operational progress for its entire lifetime. That is not the desired long-term boundary in the accepted contract.

### Approach B — Separate contribution ledger under the Works domain

Keep `WorkProgress` focused on the operational cursor. Add a separate persistent contribution-history collection associated with the Work undertaking. The ledger is updated by deterministic Work/Contribution transitions and validated against the Work catalog and world state.

The ledger conceptually owns contribution instances, attribution, deliverable references, assessment history, correction/supersession links, Career XP award receipts, and handoff history. It does not copy the underlying records, events, or character balances.

**Strengths**
- Matches the accepted distinction between interaction progress and professional contribution history.
- Preserves contribution history if operational progress is reset, archived, or refactored.
- Supports multiple character-attributed contribution segments within one continuing undertaking.
- Provides a natural home for one-time award receipts and append-only correction/supersession history.
- Keeps Work-specific definitions authored in the catalog while the runtime ledger remains generic.
- Leaves world events, records, knowledge, and institutional matters in their existing domains.
- Provides a cleaner future path to multiple/repeated undertaking instances without requiring that feature now.

**Weaknesses**
- Adds a persistent collection and cross-reference validation.
- Engine transitions must update contribution state, Work progress, character XP balance, and sometimes world records consistently.
- Requires explicit orphan/reference rules for legacy progress and completed Works.
- Care is needed not to duplicate WorkProgress scenario data or turn the ledger into a second world-record database.

**Best fit:** A system where the professional history is durable and independently meaningful beyond the current action cursor and active character. This best matches the accepted contract.

## 5. Evaluation against all 28 behavior requirements

Ratings mean: **Strong** = naturally supports the requirement; **Partial** = possible but needs additional discipline or becomes awkward; **Weak** = structurally works against the requirement. Ratings assess the architecture, not the quality of a future implementation.

| Requirement | Approach A: embedded | Approach B: ledger | Reason / condition |
|---|---|---|---|
| WC-01 Stable identity | Partial | Strong | Both can store stable IDs; B gives instances a durable identity independent of progress-object replacement or list order. |
| WC-02 Actual actor attribution | Partial | Strong | Both can capture actor at contribution time; B makes actor attribution a first-class history field, not inferred from the current progress owner. |
| WC-03 Immutable historical attribution | Partial | Strong | A can preserve immutable entries but its mutable parent encourages replacement; B treats entries/history as append-only facts. |
| WC-04 Contribution distinct from world event | Partial | Strong | Both can reference events; B's separate ownership makes the distinction explicit and avoids conflating event completion with progress mutation. |
| WC-05 Work-authored contribution contract | Strong | Strong | Both retain authored definitions in WorkDefinition; neither requires a universal stage model. |
| WC-06 Multiple deliverables | Strong | Strong | Both can link multiple deliverables to one contribution; B avoids embedding document content in progress. |
| WC-07 Evidence, provenance, knowledge boundaries | Partial | Strong | A can store references; B can maintain explicit links while leaving evidence, records, and knowledge in their own domains. |
| WC-08 Objective evidence and situated interpretation | Partial | Strong | Both can reference authored assessment; B can preserve assessed interpretation separately from source evidence and current world knowledge. |
| WC-09 Contribution completion independent of action completion | Partial | Strong | A risks action/progress coupling; B can record professional completion as its own transition, supported by actions but not defined by them. |
| WC-10 Assess authored contribution unit | Partial | Strong | B has a natural per-instance assessment history; A requires additional substructure inside the progress object. |
| WC-11 Quality independent of institutional outcome | Partial | Strong | B keeps professional assessment separate from institutional response and execution. A can do so only if carefully partitioned. |
| WC-12 Correction is not erasure | Partial | Strong | Append-only history is natural in B; A can implement it but risks overwriting the nested contribution object during progress recovery. |
| WC-13 Authored XP eligibility | Strong | Strong | Eligibility belongs in WorkDefinition under either approach. |
| WC-14 One-time award per instance | Partial | Strong | B's ledger provides a durable keyed receipt; A needs equivalent deduplication inside mutable progress. |
| WC-15 Anti-fragmentation safeguard | Partial | Partial | Neither data layout solves content fragmentation. Both need authored Work reward budgets and validation/review rules. |
| WC-16 Independent overall Work completion | Partial | Strong | B can aggregate required contribution states without equating them to the operational cursor; A risks making completion another WorkProgress status. |
| WC-17 Completion without institutional action | Partial | Strong | B permits professional completion while institutional matter remains active; A can represent it but is more tightly coupled to finalization. |
| WC-18 One-time Work-level Historical Progress XP | Strong | Strong | Existing Work-level reward guard and completedWorks list provide a starting point; keep this guard separate from contribution XP receipts. |
| WC-19 Institutional process continues independently | Partial | Strong | B leaves institutional matter and world event lifecycles outside the contribution ledger and WorkProgress. |
| WC-20 No automatic succession transfer | Partial | Strong | B makes undertaking handoff an explicit ledger lifecycle event, not a side effect of preserving progress. |
| WC-21 Acknowledgment is not handoff | Partial | Strong | B can record acknowledgment/invitation/handoff as distinct states/events without altering contribution ownership. |
| WC-22 Conditional invitation | Partial | Strong | B provides an explicit place to retain invitation basis, scope, response, and remit without changing character selection logic. |
| WC-23 Valid handoff | Partial | Strong | B can append a handoff record and retain its documentary basis independently of the current active character. |
| WC-24 Preserve contribution segments | Partial | Strong | B is designed for multiple actor-attributed segments under one undertaking. |
| WC-25 No handoff means no player continuation | Partial | Strong | B can keep the undertaking/world matter alive while marking player contribution paused/closed; A tends to retain the active Work cursor. |
| WC-26 Durable history | Partial | Strong | B's separate persisted ledger is purpose-built for history; A stores it inside a progress object whose original purpose is operational state. |
| WC-27 Referential validation | Partial | Strong | B requires explicit cross-reference validation; this is additional work but creates clear validation boundaries. A's embedded data reduces references but still needs actor and world-reference validation. |
| WC-28 Legacy compatibility | Partial | Strong | B can leave legacy WorkProgress intact and add an absent/empty ledger interpreted as legacy-unattributed; A changes the existing persisted progress shape and its validator more directly. |

**Summary:** Approach A can be made correct, but it relies on keeping a large nested progress object disciplined as its responsibilities expand. Approach B has a modest structural cost and better preserves the conceptual boundaries required by the contract. Neither approach removes the need for Work-authored anti-fragmentation rules or careful deterministic state transitions.

## 6. Evaluation against all 20 acceptance scenarios

| Scenario | Approach A: embedded | Approach B: ledger | Architectural observation |
|---|---|---|---|
| AT-01 Multi-action contribution, two deliverables | Supported | Supported | Both can group related outputs; B keeps the unit separate from the action cursor. |
| AT-02 Supporting actions do not earn XP | Partial | Strong | B separates action completion from contribution and award identity by default. A needs explicit safeguards against action-to-contribution auto-creation. |
| AT-03 NPC dispatch, player reconciliation | Partial | Strong | B records the player contribution separately from the event actor and source record. |
| AT-04 Character A contributes, B continues after handoff | Partial | Strong | B naturally retains A's immutable segment and appends B's new segment. |
| AT-05 Repeated submission/correction/restore/finalization | Partial | Strong | B can enforce one award receipt per contribution ID independently of submission count. |
| AT-06 Fragmenting one responsibility | Partial | Partial | Requires authored reward-budget constraints and review; a ledger alone cannot detect semantic fragmentation. |
| AT-07 Sound recommendation rejected | Partial | Strong | Separate contribution assessment and institutional response are first-class in B. |
| AT-08 Accepted recommendation, poor contribution | Partial | Strong | B avoids using institutional response as a proxy for professional quality. |
| AT-09 No response after professional completion | Partial | Strong | Work completion can be recorded while the institutional matter remains open. |
| AT-10 In-scope clarification request | Partial | Strong | A can continue progress; B can record a new contribution/correction against the same undertaking. |
| AT-11 Impossible/out-of-scope clarification | Partial | Strong | B can close player contribution with a limitation while leaving institutional status unresolved. |
| AT-12 Later execution event | Partial | Strong | B links the later event to the matter without overwriting contribution or authorization history. |
| AT-13 Correction, challenge, later finding | Partial | Strong | Append-only contribution history is the native model in B; A must prevent recovery from replacing nested history. |
| AT-14 Condolences without invitation | Partial | Strong | B preserves undertaking and matter but creates no handoff or successor contribution. |
| AT-15 Invitation accepted, eligible successor | Partial | Strong | B records explicit handoff and appends successor's contribution under the same undertaking. |
| AT-16 Invitation declined/unavailable | Partial | Strong | B records no handoff and leaves predecessor's contributions unchanged. |
| AT-17 Independent successor access/remit | Partial | Strong | B can record the alternative basis for handoff without requiring institutional invitation. |
| AT-18 Multiple successions | Partial | Strong | B can retain an ordered chain of explicit handoffs and contribution segments. |
| AT-19 Legacy save lacks actor history | Partial | Strong | B allows old progress to remain legacy/unattributed without fabricating actors. |
| AT-20 Completed Work restored/finalized again | Partial | Strong | B keeps contribution award receipts and Work completion reward guard separately durable and idempotent. |

"Partial" for Approach A means the behavior is implementable but depends on additional internal partitioning and invariants inside WorkProgress; it does not mean the behavior is impossible.

## 7. Recommended conceptual architecture

Adopt the following ownership model as the target for implementation planning:

1. **Authored Work definition:** declares contribution types, required/optional status, boundaries, deliverables, evidence/provenance expectations, assessment criteria, Career XP eligibility and award conditions, and overall Work completion requirements.
2. **Operational Work progress:** continues to track action/evidence/scenario/submission interaction. It may reference contribution IDs or expose the current work context, but it is not the authoritative professional history.
3. **Persistent undertaking contribution ledger:** stores contribution instances and their append-only history. Each instance has stable identity, Work/undertaking scope, actor, authored contribution type, lifecycle/completion facts, deliverable references, evidence/provenance references, assessments, correction/supersession links, and any one-time Career XP award receipt.
4. **Character career state:** stores the resulting Career XP balance on the character who earned it. The ledger receipt and balance update are committed together.
5. **World/institutional state:** stores events, records, knowledge, institutional matters, responses, authorizations, and execution. Contribution instances reference these objects; they do not duplicate or own them.
6. **Undertaking handoff history:** stores explicit handoff events and current remit/access status at the undertaking level. Character continuity alone cannot create or imply a handoff.

The ledger is append-oriented, not a second event-sourcing framework. A contribution may have a current derived status for efficient UI/validation, but original assessment, correction, challenge, award, and handoff facts must remain recoverable. The exact event/record representation is open.

### 7.1 Smallest compatible extension

The minimum first architectural increment should be:

- Preserve the current `WorkDefinition` and `WorkProgress` responsibilities.
- Add a separate contribution-history collection under the existing Works state boundary, initially scoped by the existing Work ID.
- Define the conceptual contribution instance and assessment history only far enough to support stable identity, actor attribution, completion, and deliverable/evidence references.
- Add a keyed Career XP award receipt to the contribution history and make the award + character-balance update atomic and idempotent.
- Keep correction/supersession and handoff as explicit later increments; do not fake them with status strings or automatically transfer them during character continuity.
- Keep existing schema-v2 saves loadable. Absence of contribution history means legacy history is unknown/unattributed, not that the active character performed it.

This is a minimal conceptual extension, not a final schema. It does not prescribe property names, nesting, ID generation, event sourcing, or whether the collection is a map or list.

### 7.2 What not to do

- Do not add every contribution field to `WorkProgress` simply because it is already persisted.
- Do not put the authoritative contribution history on `Person`; an undertaking may span characters.
- Do not use a `RecordEntry` as the contribution; a contribution can have multiple deliverables or none that are conventional records.
- Do not put institutional response or physical execution inside professional assessment.
- Do not infer actor attribution from the active character at final submission.
- Do not award Career XP directly from Work finalization to whichever character happens to submit.
- Do not make `completedActionIds` the contribution ledger.
- Do not transfer active Work ownership automatically when `SELECT_SUCCESSOR` changes the player character.
- Do not create an undertaking-instance ID, multi-Work scheduler, generic event-sourcing framework, or broad save rewrite without a demonstrated requirement.

## 8. Implementation sequence

The following sequence minimizes cross-cutting changes and makes each increment independently testable. It is a recommended order, not authorization to skip design review where unresolved questions block implementation.

| Step | Scope | Observable exit condition |
|---|---|---|
| 0. Contract and catalog audit | Map each current Work definition and progress lifecycle to the contribution contract; identify content that cannot yet define contributions. | No individual Work is silently re-authored; gaps and content dependencies are listed. |
| 1. Contribution identity and ledger foundation | Add the separate undertaking-scoped contribution history boundary; stable instance identity; actor attribution; validation; legacy absent-history behavior. | A contribution can be created and saved/restored with correct actor and undertaking identity; invalid/duplicate IDs are rejected. |
| 2. Work-authored contribution definitions | Extend WorkDefinition authoring/validation to describe contribution types, boundaries, deliverables, required evidence, and completion rules without imposing common stages. | At least one reviewed Work can author contributions; invalid references and ambiguous reward eligibility fail validation. |
| 3. Contribution completion and assessment | Add deterministic transitions that complete and assess a contribution independently of overall Work submission. | Contribution assessments persist with actor, day, dimensions/reasoning, evidence, and deliverable references; institutional response does not alter the grade. |
| 4. Idempotent Career XP | Add contribution-keyed award receipt and atomic update to the attributed character's balance; author eligibility and Work budget constraints. | Replaying the same award transition cannot award twice; awards go to the contributor; fragmentation review/validation is documented. |
| 5. Overall Work completion | Aggregate Work-authored requirements; preserve one-time Historical Progress XP; complete professionally with response/no-response/outstanding status recorded. | Work can complete without authority agreement or execution; historical award remains one-time. |
| 6. Institutional lifecycle linkage | Link recommendation, authority response, authorization, execution, delivery, and verification as separate events/records/matter changes. | Later events append; no prior contribution or authorization record is overwritten. |
| 7. Conditional handoff | Add acknowledgment/invitation/acceptance/decline/expiry and explicit handoff basis, remit, access, and restrictions. Keep player continuity separate. | No invitation or no acceptance means no handoff; valid handoff preserves old contribution segments and permits new attributed work. |
| 8. Correction and supersession | Add append-only correction, challenge, independent finding, and current professional-position derivation. | Original and later positions remain distinguishable and attributable; institutional adoption remains separate. |
| 9. Save compatibility and regression hardening | Finalize schema-version decision, migration/compatibility path, referential validation, and all AT-01–AT-20 tests. | Legacy schema-v2 saves load without fabricated authorship; all acceptance scenarios pass; build, type-check, tests, and deployment are reported separately. |

Steps may be split into smaller PRs. Avoid implementing handoff before contribution identity and attribution exist; avoid contribution XP before stable IDs and idempotency exist; avoid finalizing save migration before the target persisted concepts are settled.

## 9. Open decisions intentionally not settled

This document does not settle:

- Final TypeScript types, field names, collection shape, or exact nesting.
- Whether an undertaking gets a distinct runtime ID now or only when repeated instances are supported.
- Stable ID generation and collision policy.
- Exact contribution lifecycle states and whether assessments are stored as snapshots or append-only events.
- The representation of multiple contributors/collaboration within one contribution.
- The boundary between a contribution deliverable and an independently authored world record.
- Exact Career XP values, budget formula, eligibility thresholds, or automated anti-fragmentation checks.
- Whether every contribution assessment uses shared dimensions or Work-specific rubrics only.
- Exact institutional invitation issuer, eligibility evaluation, expiration, withdrawal, and remit mechanics.
- Whether active Work can pause/reopen or whether no-handoff closure is terminal.
- Schema version bump versus compatible optional additions; no assumption is made that schema v2 can absorb all changes safely.
- Whether multiple Works can be active concurrently. The current one-active-Work constraint remains an implementation fact.
- Individual Work content and historical detail for Eanna Provisioning Undertaking, The Ordered List, and The Long Delivery.

If an implementation step requires one of these decisions, present the concrete options and consequences before committing to a behavior that would effectively settle it.

## 10. Approved principle and implementation boundary

The owner has approved the following architecture principle:

> Professional contribution history belongs to the persistent Work undertaking and should be stored separately from the mutable Work interaction-progress cursor. Work definitions author contribution contracts; the undertaking ledger records actor-attributed contribution instances and their professional history; character state holds earned Career XP balances; world/institutional state holds events, records, knowledge, responses, and execution. The first implementation can scope the ledger by the existing Work ID while the single-instance constraint remains, without defining a new undertaking-ID scheme or final save schema.

This approval authorizes preparation of a bounded Step 1 type/transition/migration proposal. It does not authorize runtime implementation, the entire implementation sequence, or individual Work content. The Step 1 proposal is a separate review artifact.
