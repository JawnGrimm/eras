# GD-RELATIONSHIP-FAMILIARITY-001 — Technical Design Proposal

**Status:** PROPOSED — submitted to Design HQ for review  
**Authority:** Approved behavioral contract; technical investigation only  
**Prepared:** 24 November 2026 (the audited main commit timestamp is 25 November 2026 UTC)  
**Audited baseline:** `main` at `f7a10849d890c4367cbb352dbdac815545a8a15b`  
**Scope:** Relationship familiarity, Knowledge assertions and recall cues, schema compatibility  
**Authorization boundary:** No runtime implementation, persistent-state change, migration, or save rewrite is authorized by this proposal.

## 1. Recommendation

Adopt a **schema-v4 transition** with three deliberately separate data concepts:

1. **Directional familiarity episodes** are durable, typed evidence of one person's experience of another. Store them in a dedicated world-level episode map, keyed by deterministic episode identity. Derive the qualitative stage from explicit, authored stage contribution on qualifying episodes; do not store a numeric score or infer a stage from entry counts.
2. **Knowledge** remains a separate holder-specific assertion. Extend new Knowledge entries to preserve the particular fact, observation, or remembered tendency, its Event/Record provenance, and append-only later assessments. Preserve old entries as explicitly legacy source references without inventing their missing assertion.
3. **Relationship dimensions** retain trust, respect, affection, resentment, and rivalry. Remove numeric familiarity from the v4 active relationship dimensions. Keep the v3 field unchanged and inert until a deliberate schema transition can remove it.

Do not infer episodes from old relationship summaries, biography, Person Life Events, PersonFamiliarity, or Event participant lists. Existing Event/Record/Knowledge/history data must be preserved. The v2-to-v3 migration remains intact and becomes the first leg of a v2 → v3 → v4 restore chain.

This is the smallest design that meets the behavioral contract without pretending that the current untyped history contains evidence it does not contain.

## 2. Live repository audit

### 2.1 Baseline and core state model

The audit was performed against current `main`, commit `f7a10849d890c4367cbb352dbdac815545a8a15b`. Key source findings:

| Path | Current implementation | Consequence |
|---|---|---|
| `src/state/types.ts` | `RelationshipDimensions` requires six numeric dimensions, including `familiarity`. `PersonRelationship` stores those dimensions and a list of `RelationshipHistoryEntry`. | Numeric familiarity is part of the v3 persisted shape, not a separate episode system. |
| `src/state/types.ts` | `RelationshipHistoryEntry` contains only `id`, `dayNumber`, free-text `summary`, and optional `eventId`. | It cannot reliably identify observer, subject, interaction kind, matter/occasion, or a typed source. |
| `src/state/types.ts` | `WorldEvent` has `personIds`, not participant roles or observer relationships. | Event co-presence cannot establish who observed whom. |
| `src/state/types.ts` | `KnowledgeEntry` contains ID, holder, Event/Record subject, basis, learned day, and optional source person. | It records acquisition linkage, not the particular remembered assertion or its later verification/contradiction. |
| `src/state/types.ts` | `PersonFamiliarity` is a separate Person-level domain/scope/exposure structure with `basisLifeEventIds`. | It is not relationship familiarity and must remain unchanged. |
| `src/state/types.ts` | `GameState.world` owns relationships, Events, Knowledge, and matters. | A world-level episode collection fits existing ownership and avoids placing one shared episode on multiple directional relationship histories. |

### 2.2 Save validation, migration, and persistence

- `src/state/saveEnvelope.ts` declares `SAVE_SCHEMA_VERSION = 3` and requires the six keys in `RELATIONSHIP_DIMENSIONS`. `isRelationship` validates every dimension as a 0–100 score.
- The same validator accepts relationship history entries with an optional Event reference, and the world validator checks that a supplied `eventId` exists. It does not validate observer/subject semantics because those are not represented.
- The v2 validator uses the v2 envelope version and the current legacy game-state validation. `migrateV2Envelope` spreads the existing state and adds Day-Close/occurrence-ledger fields; it does not synthesize or rewrite relationship history or Knowledge. The v2 migration therefore preserves numeric familiarity values as part of the existing relationship object.
- `restoreSave` normalizes known legacy state, validates v2, migrates it to v3, then validates the v3 envelope.
- `src/state/GameProvider.tsx` preserves exact raw v2 bytes in `ROLLBACK_SAVE_KEY` before writing a migrated v3 envelope. A failed backup or write pauses play rather than silently opening a partially migrated session. It currently has no v3-to-v4 path.

### 2.3 Relationship producers and consumers

**Current relationship writers / mutation paths**

- `src/engine/worldSocial.ts`: `SET_RELATIONSHIP` accepts a complete directional relationship and appends history; it currently permits any valid numeric familiarity value.
- `src/state/opportunityValidation.ts`: authored relationship consequences accept `familiarity` as a change key.
- `src/engine/opportunities.ts`: applies authored relationship deltas and appends a free-text history entry. It defaults a missing familiarity value to zero when constructing dimensions.
- `src/engine/closingReceipt.ts`: updates trust/respect and appends relationship history; its defaults include familiarity zero.
- `src/engine/eraIAnchorSubmission.ts`: updates trust/respect for receiver and other affected people and appends directional history; defaults include familiarity zero.
- `src/engine/urukAssignmentSubmission.ts`: its relationship helper updates trust/respect and appends history; defaults include familiarity zero.
- `src/state/initialState.ts`: the non-player seeded world includes legacy numeric familiarity values (60, 18, 45, and 18) and free-text relationship summaries. The player-start path uses an empty relationship map.
- Tests construct relationship values with the legacy required field; these fixtures will need schema-v4 shape updates when implementation is separately authorized.

The audit found no current automatic familiarity accrual formula or threshold. However, the field is not fully inert at the API boundary: `SET_RELATIONSHIP` can replace it, and authored opportunity consequences can still specify it. Both write paths must reject/remove familiarity as an active dimension in the implementation slice.

**Current consumers**

- `src/components/ProductionPeopleAndInstitutions.tsx` displays every dimension and labels the numeric value “Personal familiarity.”
- `src/components/SuccessionScreen.tsx` generically displays all relationship dimensions and history.
- `src/engine/characterContinuity.ts` uses the *existence and direction* of a relationship edge to establish a direct connection; it does not read the numeric familiarity value.
- `src/engine/opportunities.ts` delivery-channel validation checks that a referenced Person exists; it does not gate delivery by numeric familiarity.
- `src/engine/challengeDirector.ts` may consume a latest relationship-history entry for an explicitly authored relationship-update trigger when that entry has an Event reference. It does not use the familiarity score.
- Save validation is the principal structural consumer of the numeric field.

**Relationship history is not a reliable episode source.** Most existing writers append summaries without Event IDs. Some entries have Event IDs, but the current record still does not say who observed whom or what the observer learned. Preserve this history as historical display/audit data; do not reinterpret it as familiarity episodes.

### 2.4 Event, Record, and Knowledge producers/consumers

- `src/engine/worldSocial.ts` owns the generic `CREATE_EVENT`, `CREATE_RECORD`, `AMEND_RECORD`, and `GRANT_KNOWLEDGE` actions. Event creation validates participant IDs, not participant roles. Knowledge validation checks holder, subject, basis, date, and optional source person.
- `src/engine/opportunities.ts` applies authored Event, Record, and Knowledge consequences atomically.
- Scenario-specific Knowledge/Record producers include `src/engine/eraIAnchorSubmission.ts`, `src/engine/urukAssignmentSubmission.ts`, `src/engine/assignmentActivity.ts`, and `src/engine/northBayPostExecutionSubmission.ts`.
- `src/engine/institutionalResponseValidation.ts` creates Knowledge in the institutional response lifecycle when a worker is given the relevant record.
- Work definitions/finalization in `src/works/workDefinition.ts` and authored Work implementations (including `src/works/storehouseReckoning.ts`) can produce Records and Knowledge.
- Knowledge consumers include `src/engine/morningReport.ts` and `src/engine/institutionalResponseLifecycle.ts`, which check whether a holder knows a linked Event/Record; `src/components/ProductionRecordsAndJournal.tsx`, which presents the Knowledge collection; and the save validator.

**Implication:** existing Knowledge is useful as a record of who acquired access to which source and when, but it is not yet a durable remembered assertion. Extend it rather than conflating it with an episode or deleting it.

### 2.5 PersonFamiliarity audit

- `src/content/characterCreation/eraICharacterHistory.ts` creates and merges authored `PersonFamiliarity` by `(domainId, scopeId)`, retaining exposure and supporting Life Event IDs.
- `src/state/newGameState.ts` stores the resolver's output on the new Person.
- `src/state/saveEnvelope.ts` validates its structure, unique IDs/domain-scope keys, and Life Event provenance.
- `src/state/personHistory.ts` exposes it through the Person history read model.
- `src/components/PersonHistoryPanel.tsx` presents it as recorded domain familiarity and explicitly distinguishes it from a relationship score.

No domain, scope, exposure, merge, or provenance semantics in this subsystem should change under this proposal.

## 3. Proposed technical model

### 3.1 Directional episode ownership

Add a world-level map, conceptually:

```ts
type RelationshipFamiliarityStage = 'recognized' | 'acquainted' | 'familiar';
type FamiliarityAcquisitionMode =
  | 'direct_interaction'
  | 'shared_participation'
  | 'observation'
  | 'received_testimony';

interface RelationshipFamiliarityEpisode {
  id: string;                         // deterministic identity / dedupe key
  observerPersonId: PersonId;         // whose familiarity is derived
  subjectPersonId: PersonId;          // person experienced
  acquisitionMode: FamiliarityAcquisitionMode;
  interactionKind: string;            // stable authored kind, not prose
  occasionId: string;                 // shared by repeat contact on the same matter/occasion
  matterId?: MatterId;
  contextId: string;                  // authored context key
  stageContribution: RelationshipFamiliarityStage;
  dayNumber: number;
  provenance: Array<
    | { kind: 'event'; id: EventId }
    | { kind: 'record'; id: RecordId }
  >;                                  // at least one source
}
```

The final type may brand `interactionKind`, `occasionId`, and `contextId` after the content vocabulary is approved. The important invariant is explicit observer/subject direction plus explicit acquisition mode; neither is inferred from Event participants.

Store the map at `state.world.relationshipFamiliarityEpisodes`, keyed by the deterministic ID. Do not duplicate an episode onto both `A → B` and `B → A`; a second perspective requires its own episode with the observer and subject reversed and its own provenance.

**Episode creation must be explicit.** Producers create an episode only when they can supply the observer, subject, acquisition mode, interaction kind, occasion, context, stage contribution, and at least one existing Event or Record source. No synthetic Event is created to make an episode valid.

### 3.2 Deduplication and replay

Build the deterministic identity from the canonical tuple:

`observerPersonId + subjectPersonId + occasionId + interactionKind`

Use an unambiguous tuple serialization (not delimiter concatenation) before deriving the stable ID. All repeated contact within the same matter/occasion uses the same `occasionId`; a distinct occasion or materially distinct context receives a separately authored ID. Do not use day number, display summary, random IDs, or a per-edge array length as identity.

The episode writer is idempotent:
- Same ID and identical payload: no-op success / already recorded.
- Same ID with conflicting payload: reject atomically and surface a validation error.
- Missing or dangling Person, Event, Record, or Matter reference: reject atomically.
- Save validation rejects duplicate map keys, duplicate canonical identities, duplicate provenance references, self-pairs, and invalid dates.

This prevents repeated errands/contact about one matter from farming familiarity while allowing separately authored occasions to count. The producer—not a generic “contact occurred” hook—must decide whether an occasion is qualifying.

### 3.3 Stage derivation

Do not persist a numeric score, episode count threshold, decay timer, or hidden accumulation value.

Derive the stage for ordered pair `observer → subject` by selecting the most advanced explicit `stageContribution` among that pair's qualifying episodes, using the fixed qualitative order:

`recognized < acquainted < familiar`

A single consequential episode may therefore carry `stageContribution: 'familiar'` and establish that stage immediately. Repeated low-significance episodes do not automatically advance the stage; their stage contribution is authored. Observer-only and direct/shared dealings remain distinguishable through `acquisitionMode` and can be explained in the read model. Do not impose a numeric count threshold or an unapproved observer-only ceiling.

Stage is derived on demand (or memoized as a read model); it is not stored in `RelationshipDimensions`. No qualifying episode means no derived stage; it must not be silently upgraded to “recognized” merely because a Person was mentioned, appears in a biography, shares an Event participant list, or has a relationship edge. Design HQ should confirm this null/absence presentation before UI implementation.

Familiarity stage does not alter trust, respect, affection, resentment, rivalry, authority, qualification, access, or professional skill. It does not decay when Knowledge becomes stale or is contradicted.

### 3.4 Knowledge as a remembered assertion

Keep Knowledge distinct from familiarity episodes. For newly authored entries, extend `KnowledgeEntry` with:

- A typed assertion: `fact`, `observation`, or `remembered_tendency`.
- Immutable assertion text and, where relevant, `aboutPersonId` and an authored `situationKey` identifying the context in which the tendency is relevant.
- Optional exact `RecordAssertion` reference (`recordId` + `assertionId`) when the learned statement comes from a specific record assertion.
- Existing holder, Event/Record subject, acquisition basis, learned day, and source-person fields.
- An append-only assessment list. Each assessment records `verified`, `contradicted`, or `obsolete`, the day, an existing supporting Event/Record reference, and a rationale. The original assertion is never overwritten. Current status is derived from the latest valid assessment; the history remains available.

Use a versioned union:
- **Current Knowledge:** must include its specific assertion and an assessment list (possibly empty).
- **Legacy Knowledge reference:** retains all existing fields and is explicitly marked as legacy with no assertion. It remains valid and queryable as source-access history, but cannot produce a remembered-tendency cue because no assertion was recorded.

Do not generate assertion text from a Record title, Event summary, or free-text relationship history. Do not turn every Record assertion into Knowledge automatically; the producer must explicitly state what the holder learned.

### 3.5 Cue consistency

For a situation with a canonical authored `situationKey`, the cue resolver queries the holder's relevant remembered-tendency assertions by subject Person and situation key **before** the current estimate is evaluated. It must not filter by whether the estimate later proves accurate, whether the remembered tendency was correct, or whether a later assessment marked it contradicted.

A cue should communicate the remembered assertion and its provenance/status context, not the answer to the current situation. The same matching assertion must surface in both accurate-estimate and inaccurate-estimate paths. A later contradiction changes the Knowledge assessment state, not the historical fact that the character remembers the earlier tendency. An obsolete tendency may be labelled stale/obsolete, but must not disappear selectively and must not lower the relationship familiarity stage.

## 4. Schema and migration proposal

### 4.1 Version decision

**Recommend schema v4.** A version increment is necessary because the persisted relationship-dimension shape changes, a new durable episode collection is introduced, and Knowledge gains a discriminated current/legacy representation with assertion/assessment fields. These are not merely optional presentation fields.

Keep the physical storage keys stable unless a separate storage audit identifies a collision. The envelope's `schemaVersion` is the compatibility discriminator; a v3-only client must reject v4 rather than partially interpreting it.

### 4.2 v3 → v4 migration

1. Read the exact raw envelope and validate it as schema v3 before transformation.
2. Preserve all Person records, all existing relationship history entries, Events, Records, amendments, Knowledge holder/source links, matters, and unrelated state unchanged.
3. Remove `dimensions.familiarity` from each relationship in the v4 active model. Do not normalize it to a new number or retain a shadow score. The old value has no approved gameplay meaning. The exact pre-migration v3 bytes remain in the rollback slot for recovery.
4. Initialize `world.relationshipFamiliarityEpisodes` as an empty map. Do not convert numeric values, history summaries, Event participants, Person Life Events, or PersonFamiliarity into episodes.
5. Preserve each existing Knowledge entry's original fields and wrap it as `legacy: true` with no assertion/assessment invented. New Knowledge created after the transition must use the current asserted form.
6. Set envelope `schemaVersion: 4`; validate the entire v4 result before any primary-slot write.

The migration is deterministic and idempotent at the envelope boundary: the same valid v3 input produces the same v4 state, excluding the normal save timestamp behavior controlled by the persistence layer.

### 4.3 v2 → current migration

Do not rewrite the existing v2-to-v3 transformation. Keep its current validation and compatibility rules, then pass the validated v3 result through the v3-to-v4 migration in memory:

`v2 raw → validate v2 → existing v2-to-v3 transform → validate v3 → v3-to-v4 transform → validate v4 → backup original raw bytes → write v4`

The v2 migration must not become a second, divergent route that guesses at episodes or Knowledge assertions. The rollback slot stores the exact original v2 bytes when migrating v2; it stores exact v3 bytes when migrating v3.

### 4.4 Newly created relationships and saves

Schema-v4 `RelationshipDimensions` contains only trust, respect, affection, resentment, and rivalry. New relationship creation cannot accept a familiarity score. A new relationship with no qualifying episode has no derived familiarity stage. New saves are written as schema v4 after implementation is separately authorized and deployed.

### 4.5 Missing, malformed, and dangling data

- A v3 save with invalid relationship, Event, Record, or Knowledge references fails existing v3 validation and is not partially repaired.
- A v4 episode with missing observer/subject, self-pair, unsupported acquisition/interaction kind, empty provenance, dangling Event/Record/Matter reference, invalid day, or duplicate identity fails validation.
- A current Knowledge assertion with missing holder/subject, invalid assertion kind, missing referenced Person, invalid RecordAssertion link, or dangling assessment source fails validation.
- Legacy Knowledge without assertion is valid only when explicitly marked legacy; do not infer an assertion.
- On load failure, preserve the original save and pause play. Do not silently drop the bad episode/Knowledge entry or synthesize replacement provenance.

### 4.6 Backup, rollback, and recovery

Extend the current `GameProvider.initializeProductionSession` migration boundary to back up either v2 or v3 exact raw bytes before replacing the primary save with v4. The primary write occurs only after backup succeeds and the migrated envelope passes v4 validation. If backup or primary write fails, keep the original primary save and pause play; do not enter a partially migrated session.

Recovery uses the retained exact raw envelope: restore it to the primary slot under a compatible build, confirm it loads, then resume. A rollback to pre-v4 application code must not be attempted against a v4 primary envelope without restoring the saved v2/v3 raw bytes first. The migration must never overwrite the only known-good raw copy before v4 validation and successful persistence.

## 5. Runtime integration points after approval

1. **Types and identity:** `src/state/types.ts`, `src/state/ids.ts`; add episode and Knowledge assertion/assessment types; remove numeric familiarity from v4 dimensions.
2. **Pure domain module:** add a small `src/state/relationshipFamiliarity.ts` (or equivalent) for deterministic episode identity, validation, idempotent insertion, and stage derivation. No hidden state or time loop.
3. **World action boundary:** extend `src/engine/worldSocial.ts` with a typed episode action or dedicated transition; make `SET_RELATIONSHIP` reject the retired field in v4. Keep Event and Record creation separate.
4. **Authored consequence boundary:** update `src/state/opportunityValidation.ts` and `src/engine/opportunities.ts` to reject numeric familiarity deltas and accept only explicitly authored episode consequences where the producer supplies complete provenance and roles.
5. **Scenario producers:** audit and update `closingReceipt.ts`, `eraIAnchorSubmission.ts`, `urukAssignmentSubmission.ts`, `assignmentActivity.ts`, `northBayPostExecutionSubmission.ts`, `institutionalResponseValidation.ts`, and Work finalization only where an actual authored interaction qualifies. Do not automatically create episodes for all relationship trust/respect changes.
6. **Knowledge producers:** update `worldSocial.ts`, `opportunities.ts`, scenario submission modules, institutional response handling, and Work finalization so new entries include an explicit assertion and source.
7. **Consumers/UI:** replace numeric “Personal familiarity” displays in `ProductionPeopleAndInstitutions.tsx` and `SuccessionScreen.tsx` with a derived qualitative stage and evidence trail. Keep `PersonHistoryPanel.tsx` domain familiarity display separate and unchanged. Update cue resolver/presentation to use assertion + situation key without truth-dependent filtering.
8. **Persistence:** update `saveEnvelope.ts`, `GameProvider.tsx`, and save tests for v2/v3/v4 loading, validation, rollback, and deterministic serialization.

Do not modify the GDD or Decision Register as part of implementation unless Design HQ separately requests a design-document reconciliation.

## 6. QA plan (proposed; not executed)

The following tests are required for the later implementation. **No tests were written or executed as part of this documentation-only proposal.**

| Test | Required assertion |
|---|---|
| Existing v3 load and round-trip | v3 is validated, backed up, migrated to v4, and all non-retired relationship history, Events, Records, amendments, and Knowledge references survive. |
| v2-to-current migration | Existing v2 validation and v2→v3 behavior remain intact; result is then migrated to v4 with one exact raw-v2 rollback copy. |
| Numeric familiarity inertness | Different legacy v3 numeric values produce identical gameplay outcomes; no runtime consumer reads them for eligibility, qualification, trust, access, or stage. |
| No synthetic legacy episodes | Old numeric values, relationship summaries (with or without Event IDs), Person Life Events, PersonFamiliarity, and Event participant lists produce zero episodes. |
| Directional/asymmetric episodes | A→B and B→A are independent; recording one does not create the reverse episode or stage. |
| Observer vs direct participation | Observer-only, direct interaction, shared participation, and received testimony retain distinct acquisition modes in storage/read models. |
| Duplicate suppression | Same pair + occasion + interaction kind is idempotent; conflicting same-ID payload is rejected. |
| Distinct matters/occasions | A separately authored occasion creates a distinct episode; repeated contact on the same matter/occasion does not. |
| Single consequential episode | One episode explicitly carrying Familiar (or Acquainted) contribution derives that stage without a count threshold. |
| Qualitative stage ordering | Highest explicit contribution wins; no numeric familiarity or episode-count threshold exists. |
| Knowledge provenance | Current Knowledge retains the exact assertion, holder, source Event/Record, acquisition basis/date, and optional exact RecordAssertion link. |
| Verification/contradiction/obsolescence | Assessments append chronologically; original assertion remains unchanged; current status derives deterministically. |
| Cue accuracy independence | The same relevant tendency cue appears for both accurate and inaccurate current estimates. |
| Stale Knowledge | Obsolete/contradicted cues are surfaced with status; familiarity stage does not decay. |
| Independent dimensions | Trust/respect/affection/resentment/rivalry changes do not create or alter episodes/stage; stage changes do not mutate those dimensions. |
| PersonFamiliarity unchanged | Resolver output, domain/scope merge, exposure, Life Event provenance, save validation, and history UI remain identical. |
| Deterministic replay | Replaying the same authored episode consequence yields the same ID and one stored episode; save/load/replay produces the same derived stage and cue set. |
| Invalid provenance | Missing/dangling Person/Event/Record/Matter references and duplicate episode identities reject atomically and fail save validation. |
| Rollback failure | Backup failure or v4 primary-write failure leaves the prior raw v2/v3 save recoverable and the session paused. |

Existing relevant test surfaces include `src/tests/saveSchemaV3.test.ts`, `src/tests/GameProvider.test.tsx`, `src/tests/worldSocial.test.ts`, `src/tests/worldSocialValidation.test.ts`, `src/tests/characterCreationPersistence.test.ts`, `src/tests/characterContinuity.test.ts`, `src/tests/characterSuccession.test.ts`, `src/tests/opportunities.test.ts`, `src/tests/closingReceipt.test.ts`, and `src/tests/assignmentActivities.test.ts`. New focused tests should be added rather than overloading unrelated fixtures.

## 7. Risks, unresolved items, and alternatives

### 7.1 Items requiring Design HQ review before implementation

1. **Episode authoring vocabulary:** approve the stable `interactionKind`, `acquisitionMode`, and `contextId` vocabulary, and which actual authored producers can emit each kind. Production must not treat every trust/respect consequence, Event participant, greeting, mention, or errand as a qualifying episode.
2. **Stage contribution authoring:** confirm the mapping from qualifying episode types to Recognized / Acquainted / Familiar. The technical proposal uses explicit authored `stageContribution` and a qualitative max-stage resolver; no formula or threshold is implied.
3. **No-episode presentation:** confirm that absence of qualifying episodes means no stage (rather than default Recognized).
4. **Situation-key ownership:** confirm the canonical `situationKey` taxonomy and how a live situation supplies the key used to retrieve remembered tendencies. The cue resolver must not use current-answer accuracy as a filter.
5. **Legacy Knowledge presentation:** confirm that legacy source-access entries without assertions remain visible as source history but do not create tendency cues.

### 7.2 Technical alternatives considered

| Alternative | Assessment |
|---|---|
| Keep numeric familiarity in v3 and remove in v4 (recommended) | Preserves existing v3 validation and old saves until a deliberate version boundary; no active score after v4. |
| Make familiarity optional inside schema v3 | Rejected: weakens a versioned persisted contract and leaves mixed v3 relationship shapes without a clear migration boundary. |
| Keep a shadow `legacyFamiliarity` field indefinitely | Rejected: risks retaining a misleading hidden score with no gameplay use. Exact raw rollback bytes provide recovery. |
| Convert old relationship summaries/Event participants into episodes | Rejected: observer, subject, occasion, and learned experience are not established by those sources. |
| Derive stages from episode counts or numeric weights | Rejected: introduces arbitrary thresholds and obscures the significance authored for a consequential episode. |
| Put episodes on both directional relationship histories | Rejected: duplicates shared facts, makes direction and provenance ambiguous, and complicates deduplication. |
| Reuse PersonFamiliarity | Rejected: changes its established domain/scope/exposure semantics and conflates professional-context exposure with interpersonal experience. |

### 7.3 Explicit schema-transition changes

The following require schema v4 and migration review:
- Envelope `schemaVersion: 4`, v3 validator, and v3→v4 migration (plus v2→v3→v4 chain).
- Removal of `RelationshipDimensions.familiarity` from the active v4 relationship shape.
- New `world.relationshipFamiliarityEpisodes` map and its validation.
- Knowledge current/legacy discriminated representation, assertion payload, and append-only assessment history.
- Updated exact-byte rollback/write boundary in `GameProvider.tsx`.

A derived stage read model, cue matching, UI changes, and new producer APIs are runtime changes but need not themselves add persisted fields beyond the episode and Knowledge structures listed above. No migration execution is authorized by this proposal.

## 8. Completion and authorization status

- **Audit:** completed against current `main` at the SHA stated above.
- **Technical recommendation:** schema v4; typed world-level directional episodes; explicit qualitative stage contribution; assertion-bearing Knowledge with legacy preservation; exact-byte rollback.
- **Runtime changes:** none.
- **Persistent-state changes / migration:** none.
- **Tests:** plan specified; not written or executed.
- **Design HQ review:** requested.
- **Implementation authorization:** NOT GRANTED by this handoff.

**Recommendation to Design HQ:** review and either approve this technical architecture or return targeted changes on the five unresolved items above. Once the technical contract is accepted, Production should receive a separate implementation authorization before modifying runtime code or save handling.
