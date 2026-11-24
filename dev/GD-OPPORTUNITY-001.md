# GD-OPPORTUNITY-001 — Assignment Supply and Challenge Arrival

**Status:** PROPOSED — DESIGN DIRECTION PARTIALLY APPROVED; BEHAVIORAL CONTRACT IN DEVELOPMENT  
**Owner:** Game Design, with Historical Research and Production/QA dependencies  
**Authority:** Canonical GDD §§5.1–5.2, 6.3; World Simulation Specification §§15.4–15.5  
**Purpose:** Replace the narrow prototype-era opportunity loop with a sustainable, historically grounded system.

## 1. Approved direction

The Game Director approved a **soft daily Assignment supply expectation, not a hard quota**.

The canonical GDD §6.3 already sets the initial content target at roughly **8 AP worth of newly presented Assignments per Workday**. This is a tuning target, not a guarantee, fixed slot count, or requirement to manufacture work. Low rank must not systematically reduce the baseline volume of ordinary playable work.

A quiet Workday remains possible when no plausible eligible opportunity exists. It should be an exception caused by the actual world and eligibility state, not the routine result of exhausting a tiny prototype catalog.

Assignments and Challenges remain distinct optional layers. Neither awards Historical Progress XP or gates mandatory Works.

## 2. Live implementation audit

Inspected live repository source on `main` at commit `e78def30e3ce732c001a70943a7cedd4314f0024`, alongside the canonical GDD and supporting specifications.

### Assignment generation

Current `generateDailyAssignments()`:

- Discovers a small set of authored Uruk opportunity definitions by matching active institutional matters.
- Has a special post-execution North-Bay inspection path.
- Caps each pass at 8 estimated AP of new offers and four open offers.
- Rotates definition order using a persisted sequence.
- Requires an active matter still listed by its institution.
- Prevents a second offer from the same matter, regardless of the first offer's eventual status.
- Writes `lastPresentedDayByActivity`, but does not read it to enforce the three-day interval described in the P2-2 development reference.
- Does not itself create recurring institutional needs or replenish the matter pool.

The current initial-state test expects exactly two offers. This proves the narrow opening fixture works; it does not test a sustainable career supply. The current three Uruk activities are a prototype content cluster, not a sufficient long-term opportunity portfolio.

### Challenge generation

Current `runChallengeDirector()`:

- Is called during END_DAY settlement.
- Evaluates two hard-coded, one-shot Uruk scenarios.
- Uses a held-stock matter age / qualified-incomplete report condition for one scenario.
- Uses delivery-reconciliation completion and compact Assignment aggregates for the other.
- Uses Assignment aggregates and at most five recent Assignment activity entries as its general trigger context.
- Has no general authored Challenge candidate pool, weighted selection among eligible scenarios, or broad trigger vocabulary for player decisions, relationship developments, and world events.
- Does not implement general ambient/random Challenge arrival.

The GDD §5.2 already describes a broader intended trigger domain: professional patterns, neglected opportunities, encountered institutions/commodities/locations/people, relationships/rivalries/favors/prior decisions, and historical events. The current two-scenario director is not that system.

## 3. Assignment behavioral direction

The generator should maintain a **soft supply target** by discovering and presenting eligible authored opportunities from a sufficiently broad set of sources.

Potential sources include:

1. Active institutional matters with a suitable authored activity.
2. Newly created matters arising from world events, NPC actions, or institutional developments.
3. Recurring institutional needs represented as distinct, authored occurrences (for example, periodic inspection, reconciliation, procurement, or record preparation where historically plausible).
4. Scheduled professional duties or seasonal activity.
5. Referrals, requests, or introductions with a factual and supported delivery route.

Every offer must have a traceable source and a truthful explanation of why it reached this character. A recurring need must represent a new occurrence or explicitly authored recurrence, not silently re-open a completed matter.

Eligibility must account for supported orientation/context, access, rank-based reach, specific skill qualification, required authority, character knowledge, NPC knowledge and willingness, and conflicting commitments. Keep access, qualification, and authority distinct. Do not infer them from unsupported relationship scores or fabricate relationships to make an offer appear.

The generator should prefer variety across institutions, kinds of work, and orientations when eligible content exists. It must not force four orientation variants of every activity. Shared work is appropriate where the institution and situation genuinely support it.

A declined, expired, cancelled, or completed offer must not be duplicated for the same source occurrence. A later recurrence may be offered only when a new occurrence or materially new circumstance exists and the authored definition permits it.

The soft target is measured in newly presented estimated AP, not offer count. Do not add fixed daily slots. Existing caps are implementation safeguards to review, not design goals. A quiet day is acceptable when eligible source supply is genuinely absent; the system should not invent a matter, false deadline, or fictitious referral to fill the target.

## 4. Challenge behavioral direction

Challenges should emerge through two complementary paths:

### A. Causal triggers

Authored scenarios may become eligible through meaningful developments, including:

- Player decisions and outcomes in Assignments, Works, records, institutional responses, and commitments.
- Patterns in opportunities presented, accepted, declined, lapsed without mandatory-work conflict, and completed.
- Significant changes in relationships, favors, rivalry, trust, resentment, or obligation.
- NPC actions and institutional developments.
- Historical events that alter local circumstances.
- Encounters with particular people, institutions, commodities, or places.

A trigger must identify the actual event, state, or pattern that makes the scenario relevant. Merely displaying an offer is not evidence that the player ignored it. Lapses during mandatory Works remain excluded from neglect-based interpretation.

### B. Unpredictable arrival among eligible authored scenarios

The player should not be able to predict every Challenge from a fixed daily checklist. The director may use weighted, seeded selection to choose **which eligible authored situation arrives and when**.

Randomness selects among situations whose authored eligibility conditions are already satisfied; it does not invent an uncaused dispute, NPC motive, historical event, or arbitrary daily busywork. The same state, seed, and evaluation point must produce the same result. No runtime generative AI creates scenarios or determines outcomes.

Challenge content owns its eligibility, trigger provenance, delivery route, repeatability, cooldown, and consequences. The director owns bounded evaluation, candidate selection, duplicate prevention, and presentation pacing.

The system must avoid flooding the player. Arrival pacing and simultaneous active-Challenge limits require playtesting; no new numeric values are approved by this document.

## 5. Shared invariants

- Assignments are optional professional jobs; Challenges are optional situations, not ordinary employment.
- Both use the shared six-AP Workday economy when substantive player action is required.
- Neither awards Historical Progress XP or becomes a hidden prerequisite for Works.
- Authored content determines context, evidence, choices, consequences, and historical framing.
- The player-facing explanation must state why the situation reached the character and what they are being asked to do.
- Evidence, event, record, knowledge, interpretation, and authority remain distinct.
- Unresolved institutional matters persist even when they do not produce an Assignment.
- NPC developments may resolve without involving the player.
- Generation is deterministic and bounded; it must not scan an unbounded career archive every day.
- Save/load and succession must preserve the distinction between the former character's personal opportunities and the successor's new access, knowledge, and commitments.

## 6. Required audit and acceptance coverage

Production/QA should establish:

1. Multi-Workday Assignment supply from a fresh game, including what happens after the initial prototype matters are exhausted.
2. Supply from multiple institutions and distinct authored activity types.
3. Commercial, Martial, Religious, and Civic characters each receive plausible opportunities; no orientation is artificially locked out of shared work.
4. Low rank does not systematically starve the board of ordinary work.
5. Every offer has valid source provenance, delivery route, eligibility, and no duplicate for the same occurrence.
6. Recurring opportunities create distinct occurrences and cannot be farmed by re-presenting the same matter.
7. A genuinely quiet day remains valid when no eligible source exists.
8. Challenge triggers respond correctly to player decisions, Assignment behavior, relationship changes, NPC/institutional events, and historical events.
9. Unpredictable selection is reproducible for the same state and seed, chooses only eligible authored scenarios, and respects scenario-specific repeatability/cooldown.
10. No Challenge arrives solely because a day passed when no eligible situation exists.
11. Challenge arrival does not flood the player, bypass AP rules, award Historical Progress XP, or gate a Work.
12. Save/load, fresh-game reset, and succession do not duplicate, erase, or misattribute opportunities and triggers.

Tests must exercise multiple days and changing state. A test asserting exactly two initial Uruk offers is not sufficient evidence of generator health.

## 7. Dependencies and exclusions

**Historical Research:** Author and review a broader institutional opportunity portfolio, beginning with the known Era I Commercial and Martial coverage gaps. Distinguish attested context from designed reconstruction.

**Game Design:** Set scenario-level repeatability and trigger provenance; playtest arrival pacing. The soft daily Assignment expectation is approved; exact balancing beyond the GDD's initial 8-AP target remains tunable.

**Engineering/Production:** Own technical architecture, exact state types, persistence, migration, deterministic seed handling, and transition APIs. Audit all consumers before changing persistent state. No schema change is authorized by this document.

**Production/QA:** Build lifecycle and regression coverage described above.

This document does not prescribe TypeScript interfaces, module placement, save schemas, or migration strategy. It does not authorize changes to runtime code, the canonical GDD, or the Decision Register. Those require the appropriate approval and production handoff.

## 8. Next work

1. Reconcile the supporting World Simulation and Decision Register wording with the approved soft daily supply expectation.
2. Complete the Assignment source/content coverage audit, including recurring authored needs and orientation coverage.
3. Develop the general Challenge trigger and candidate-selection contract.
4. Submit the completed behavioral contract for Game Director approval before runtime implementation.
