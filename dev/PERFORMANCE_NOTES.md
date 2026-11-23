# Performance Risks and Engineering Watchlist

**Status:** Developer note / future consideration  
**Scope:** Performance and scalability risks to revisit as the simulation and save data grow  
**Authority:** This document records concerns and guardrails. It does not establish that every listed issue is currently a bottleneck, approve a refactor, or change the canonical game design.

## Purpose

The current application is an integrated proof of concept. Its present scale may not expose performance problems that emerge as more people, institutions, records, events, relationships, and historical periods are added.

The items below are risks to keep visible during development. Treat them as hypotheses until measured against the current implementation and representative workloads. Do not undertake broad optimization work solely because an item appears on this list.

## Risks to watch

### Persistence and serialization

The current save path has been identified as potentially serializing and synchronously writing the full game state to `localStorage` after state transitions. If confirmed in the current implementation, the cost of `JSON.stringify` and synchronous storage I/O may grow with save size and block the UI.

Repeated actions in quick succession may also trigger repeated full-state serialization and writes. Save-envelope creation may retain the full state graph while adding envelope metadata; measure actual allocation and serialization costs rather than assuming a separate deep copy occurs.

**Guardrails**
- Do not trade away save durability without making the persistence contract explicit.
- Distinguish an action accepted into in-memory game state from an action successfully persisted.
- If writes are delayed or batched, define what happens on tab close, crash, quota failure, or storage failure. Important actions must not silently appear saved when they are still pending.
- Debouncing reduces write frequency but does not make `localStorage` I/O asynchronous. Evaluate alternatives such as IndexedDB only with migration, failure-recovery, compatibility, and operational complexity considered.
- Preserve save-envelope validation and compatibility guarantees when optimizing persistence.

### Restore, migration, and validation

Save restoration may perform multiple normalization or migration passes before deeply validating entities and their references. As saves grow, startup cost may become noticeable.

**Guardrails**
- Profile restore and migration with representative large saves before changing validation.
- Prefer removing redundant passes, indexing repeated lookups, and improving validation implementation over weakening integrity checks.
- Keep legacy-save compatibility explicit and covered by tests.
- Consider progress or staged loading only if it can preserve a coherent, safe playable state.

### React state propagation and rendering

A broad provider context can cause consumers to rerender when unrelated parts of the game state change. Large screens, derived selectors, and retained conditional UI can add reconciliation and calculation costs.

**Guardrails**
- Identify high-frequency transitions and expensive consumers before splitting contexts or introducing selector infrastructure.
- Memoize expensive derived values where profiling demonstrates repeated work; avoid blanket memoization and difficult cache invalidation.
- Consider lazy loading major screens and code splitting when bundle analysis shows meaningful initial-load cost.
- Avoid retaining expensive inactive screen state without a concrete reason.

### Repeated entity and relationship lookups

Transitions and validation may repeatedly search people, institutions, relationships, obligations, matters, records, or other maps to resolve references. Nested scans can become costly as collections grow.

**Guardrails**
- Profile hot paths and establish collection-size assumptions.
- Where repeated scans are confirmed, consider indexes or precomputed lookup maps with clear ownership and invalidation rules.
- Keep indexes derived from authoritative state unless there is a compelling, validated reason to persist them.

### Growth of historical and activity data

Events, records, amendments, relationship histories, institutional transitions, journal notices, and recent-activity entries may accumulate over many Workdays.

This is both a performance concern and a design concern. These collections are not interchangeable: some are durable historical evidence, while others are presentation conveniences or rebuildable state.

**Preservation rules**
- **Permanent records and evidence:** preserve. Optimize storage, indexing, retrieval, and presentation before considering deletion.
- **Amendments and corrections:** preserve provenance and revision history; do not replace corrected evidence in a way that erases how or why it changed.
- **Relationship history:** retain consequential developments needed to explain present relationships, memories, and continuity. If compaction is ever considered, preserve the information needed to reconstruct those consequences.
- **Institutional matters:** retain unresolved matters and the consequential history of their development and resolution.
- **Succession and professional continuity:** preserve records needed to establish continuity, relationships, and the basis for later standing.
- **Journal notices and recent-activity presentation:** these may be candidates for archival, summarization, pagination, or bounded display, provided the underlying historical source remains available where required.
- **Temporary UI state and derived caches:** may generally be discarded and rebuilt when they are not authoritative game state.

Do not impose arbitrary maximum lengths or prune historical collections simply to reduce save size. First classify each collection by its role, authority, provenance requirements, and future gameplay relevance. Prefer compaction that preserves meaning and traceability over deletion.

### Initialization and fallback paths

Fresh-state creation, corrupt-save recovery, unavailable storage, catalog loading, and subsequent save attempts may duplicate expensive work or create repeated failure paths.

**Guardrails**
- Measure normal startup and recovery startup separately.
- Ensure storage failures are visible and do not create a false impression that progress has been safely saved.
- Defer or lazy-load catalogs only when their dependencies and failure behavior are understood.

## Recommended audit and measurement plan

Before implementing optimizations:

1. Inspect the current `main` branch and trace the actual save, restore, migration, and state-transition paths.
2. Measure serialization time, storage-write time, save size, and allocation behavior at representative save sizes.
3. Benchmark restore and validation independently, including legacy migration and malformed-save rejection.
4. Profile `transitionGame` and other common transitions with synthetic worlds of increasing size.
5. Inspect provider consumers and React Profiler output for avoidable rerenders.
6. Analyze production bundle composition and initial screen loading.
7. Inventory growing collections and classify each as authoritative history, archival/presentation data, transient state, or derived cache.
8. Record baseline measurements and acceptance criteria before and after any optimization.

Synthetic benchmarks should scale relevant dimensions independently where practical (people, relationships, institutions, matters, records, events, and journal entries). Keep fixtures deterministic and representative; avoid creating unrealistic data that obscures the actual hot paths.

## Decision rule

Optimize how the game stores, accesses, validates, and presents history before deciding to delete history.

Any proposal that delays persistence, changes save format, alters migration, compacts historical data, or changes what is retained must state its durability and provenance consequences and include appropriate recovery and compatibility tests.

This document is a watchlist, not a refactoring mandate. Revisit it when measured performance, content scale, or new systems make one of these risks actionable.
