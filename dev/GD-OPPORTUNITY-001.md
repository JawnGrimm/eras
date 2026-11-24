# GD-OPPORTUNITY-001 — Assignment Supply and Challenge Director

**Status:** PROPOSED — OWNER-APPROVED DIRECTION; BEHAVIORAL CONTRACT FOR REVIEW  
**Owners:** Game Design; Historical Research  
**Authority:** GDD §§5.1–5.2, 6.3; approved Assignment Orientation and Institutional Context Specification; Game Director direction, 24 November 2026  
**Implementation status:** Not ready for implementation. No runtime or save-state change is authorized by this document.

## 1. Decision maturity

### Approved direction

- Assignment supply follows the GDD §6.3 soft target: normally about **8 AP worth of newly presented eligible Assignments per Workday**. This is not a quota, fixed offer count, or guarantee.
- Quiet days remain possible when no plausible eligible source exists, but should be exceptional rather than the routine result of a narrow content pool.
- All four orientations use **one shared world pool**. They are professional emphases, not classes or exclusive queues. Cross-institutional access remains possible through supported contacts, matters, and institutional reach.
- The next Era I authoring pass targets roughly **8–9 distinct, richer institution-anchored Assignment definitions overall**, aiming for about two credible anchor opportunities in each orientation's institutional context. This is a portfolio target, not a daily count or a requirement for equal queues.
- Sustain the daily supply target through two tiers: bespoke anchor Assignments plus recurring, deterministically parameterized institutional occurrences grounded in active world matters.
- Replace the two-scenario Challenge special case with a general authored scenario pool, causal triggers, and weighted deterministic selection among eligible scenarios.

### Still open

Exact content count and distribution; which existing activities are retained or revised; recurrence conditions and parameter domains; generator weights and presentation safeguards; Challenge weights, cooldowns, active limits, and arrival pacing; evaluation-boundary details; technical state, persistence, and seed implementation. These require evidence, playtesting, and/or a separate owner decision. None is silently fixed here.

## 2. GDD alignment and invariants

- Assignments are ordinary optional professional work; Challenges are separate optional situations, not commissions or ordinary paid employment.
- Both remain distinct from Works. Neither awards Historical Progress XP or gates a mandatory Work.
- The six-AP Workday remains the shared economy. Assignment lifecycle and Challenge AP behavior continue to follow the GDD unless a separate proposal is approved.
- No runtime generative AI creates Assignments or Challenges, validates records, or determines outcomes.
- Preserve the distinctions among access, qualification, knowledge, interpretation, and authority. Orientation does not grant skill, appointment, authority, or a relationship.
- Preserve Event, Record, and Knowledge as distinct. Every generated situation needs credible provenance and a truthful delivery explanation.
- NPC and institutional developments may resolve without involving the player. Not every need becomes a player opportunity.
- Generation and presentation may pace an eligible opportunity; they may not fabricate its cause, rewrite history, conceal or invent a deadline, or erase an unresolved matter.

## 3. Track 1 — Assignment Supply

### 3.1 One shared pool; institutionally distinct anchors

The generator discovers from one shared pool of authored opportunities. It does not create Civic, Martial, Religious, or Commercial queues, class locks, or four-way variants of every job.

Weights and eligibility may reflect:
- the character's actual contacts and supported delivery routes;
- active matters and the people/institutions involved;
- institutional reach and relevant appointments or responsibilities;
- the character's orientation as a professional emphasis;
- rank-based reach, separately from task-specific skill qualification and formal authority.

Eligibility is evaluated before presentation weighting. Weighting may influence which eligible opportunity is surfaced first or more often; it must not bypass access, invent a relationship, or grant authority.

### 3.2 Era I anchor portfolio

Plan for roughly 8–9 distinct, richer bespoke Assignment definitions across the Era I shared pool. Aim for about two credible anchors in each orientation's institutional context, allowing genuine overlap where the same institution or responsibility serves more than one orientation.

The portfolio should:
- **Civic:** make institutional administration, land/labor, production, storage, redistribution, collective work, or public/monumental responsibilities legible.
- **Religious:** make cultic responsibilities—offerings, ritual goods, ceremonial provisioning, sacred property, or cultic maintenance—legible without inventing a separate modern church bureaucracy.
- **Commercial:** establish a genuine exchange, procurement, counterparty, delivery, custody, or transport setting; do not assume later private merchant houses or a standardized merchant profession.
- **Martial:** establish a historically restrained security, mobilization, organized-movement, logistics, custody, or accountability setting; do not invent a standing army, military scribal corps, quartermaster office, standardized muster system, or later defensive infrastructure.

Civic and Religious contexts overlap historically. Their distinction must emerge from the actual purpose, people, evidence, responsibilities, authority, and consequences—not a secular-versus-religious label. Likewise, transport alone does not make an Assignment Martial, and the presence of a carrier alone does not establish a distinct Commercial setting.

The existing three Temple Storehouse activities remain the baseline cluster for content review. They do not, by themselves, demonstrate four-orientation coverage. Review them for retention, correction, and sharper Civic/Religious responsibility; do not multiply them into cosmetic variants.

### 3.3 Two-tier supply

**Tier A — Bespoke anchors.** Richer, institution-specific Assignments with their own human situation, evidence, procedure, authority boundaries, and consequences. They establish the distinctive settings and professional identity of the Era I portfolio.

**Tier B — Recurring institutional occurrences.** Reusable authored activity structures instantiated from active world matters and their supported developments. These provide ordinary work between anchor scenarios without requiring dozens of hand-authored one-offs.

Tier B occurrences are still normal Assignments: they use the same offer lifecycle, AP economy, evidence/judgment standards, and Career XP rules. They are not a third activity layer or a shortcut that turns AP directly into a completed result.

### 3.4 Deterministic parameterization and occurrence identity

A recurring occurrence may vary by counterparty, commodity and its appropriate units, discrepancy or other concrete problem, and setting—only where those facts are supported by the active matter, source records, events, and authored parameter rules.

Requirements:
1. Each parameter set must be a historically and operationally coherent combination. Do not form arbitrary cross-products of incompatible people, commodities, units, institutions, or locations.
2. A discrepancy must arise from identifiable conflicting or incomplete evidence; do not invent a missing quantity merely to create work.
3. Parameter values must be drawn deterministically from supported world facts and authored options. The same source state and evaluation point must not produce a different occurrence because of ambient randomness.
4. Each occurrence must have a stable identity and traceable provenance to its source matter and relevant record/event/need.
5. A recurrence is a new occurrence only when its authored recurrence condition is met and a materially new instance exists. Do not silently reopen a completed, declined, lapsed, or cancelled offer or re-present the same occurrence under a new title.
6. Variation must change the actual situation enough to matter to the player—who is involved, what is being accounted for, where custody or responsibility lies, what evidence exists, or what decision follows. Name-swapping alone is not meaningful variation.
7. Not every active matter is recurring, and not every recurring institutional need is suitable player work. Authored content decides whether the situation becomes an Assignment, Challenge, conversation, institutional action, or background development.

### 3.5 Supply pacing and lifecycle

- Measure supply in estimated AP represented by **newly presented eligible offers**, not offer count.
- The ~8 AP target applies to the overall mix of new offers across the shared pool. It is assessed as a soft pacing target over multiple Workdays, not a per-day pass/fail quota.
- The mix may include both anchor and recurring occurrences. No fixed daily slots or guaranteed orientation-specific allocation.
- A quiet day is acceptable when eligible source supply is genuinely absent; it is not an acceptable routine consequence of exhausting a tiny prototype catalog.
- Existing implementation caps are safeguards, not design. Rework or remove any cap that systematically prevents the approved supply target; retain only safeguards shown not to suppress healthy supply or create a flood.
- Preserve the GDD's visible expiry, accepted-commitment, cancellation, and AP rules unless separately reviewed and approved. The open-design item for offer caps and commitment balance remains subject to playtesting.
- Declined, expired, cancelled, and completed offers remain distinguishable. Mandatory-Work lapses must not be interpreted as neglect.

## 4. Track 2 — General Challenge Director

### 4.1 Authored scenario pool

Replace the two hard-coded Uruk functions with a general pool of authored Challenge scenarios. Each scenario must define its own:
- eligibility conditions and required causal trigger(s);
- trigger provenance and relevant source facts;
- delivery route and why the situation reaches this character;
- people, institution, setting, evidence, knowledge limits, and authority boundaries;
- choices, AP cost, consequences, and outcome record;
- repeatability and any scenario-specific cooldown or recurrence condition;
- relative selection weight.

The director evaluates and selects authored content. It does not invent a dispute, NPC motive, historical event, evidence, or outcome.

### 4.2 Causal trigger vocabulary

Authored scenarios may become eligible through one or more of these supported causal domains:

1. **Player decisions and outcomes:** Assignment and Challenge rulings, Work actions/dispositions where relevant, submitted records, institutional responses, commitments accepted or released, and other consequential choices.
2. **Professional behavior patterns:** offers presented, accepted, declined, non-Work-lapsed, and completed, with employer/category/commodity context. A presented offer is not automatically an ignored offer.
3. **Relationships:** significant directional changes in trust, respect, affection, resentment, rivalry, familiarity, or obligation, with the actual interaction/event as provenance. Do not infer a relationship change from mere contact or factual Life Event participation.
4. **NPC actions:** an authored action by a person whose motivation, knowledge, capacity, relationships, and authority make the action plausible.
5. **Institutional developments:** a matter's creation, development, escalation, resolution, changed responsibility, resource pressure, or institutional response.
6. **Historical/world events:** an authored event that changes relevant local circumstances.
7. **Encounters:** meaningful contact with a particular person, institution, commodity, location, or network, where the scenario's authored conditions explain why the encounter matters.

A trigger must identify what happened or what supported state changed. Passage of time may satisfy an authored date/condition, but time alone is not a cause and must not create arbitrary daily busywork. Offers that lapse during mandatory Work remain excluded from neglect-based interpretation.

### 4.3 Bounded trigger context

The GDD's compact-data boundary remains in force:
- Assignment-pattern rules consume compact aggregates by employer/category/commodity and no more than the five most recent Assignment activity entries.
- Other causal domains use relevant, bounded trigger facts or direct checks against specifically referenced active state. Do not scan an unbounded world-event archive, every relationship history, or the entire career record on each settlement.
- Trigger facts retain enough provenance to explain the scenario and prevent duplicate consumption.
- The trigger system must distinguish an event from a record of it and from what the player/NPC/institution knows about it.
- The production design must audit every producer and consumer of relationship changes, world events, institutional matters/responses, commitments, and opportunity outcomes before selecting a technical event-capture architecture.

### 4.4 Weighted deterministic selection

Selection is two-stage:
1. Determine which authored scenarios are eligible from their causal conditions, access/delivery route, repeatability, and current state.
2. Select among those eligible candidates using authored relative weights and a deterministic seeded process.

Weights influence selection among eligible scenarios; they never make an ineligible scenario eligible. The same saved state, seed, and evaluation point must yield the same candidate selection. Candidate ordering and tie behavior must be stable. No ambient nondeterministic random source.

Exact weights, modifiers, seed ownership, and persistence representation remain open for the technical proposal and playtesting. Do not add a new save field or schema migration without a separate compatibility review.

### 4.5 Evaluation and arrival pacing

**Recommended initial boundary for owner review:** evaluate once during END_DAY settlement, after authored world/institutional developments and Assignment generation, then surface any selected Challenge in the next Morning Report. This avoids interrupting an AP action and gives one predictable evaluation point while allowing the player to experience an unpredictable arrival schedule.

A candidate may be eligible and not arrive on that pass. If no candidate is eligible, no Challenge arrives. Random selection changes which eligible situation arrives and when; it does not manufacture the cause.

No numeric daily arrival quota, active-Challenge cap, or universal cooldown is approved. For initial playtesting, Game Design recommends testing a zero-or-one arrival per settlement pass, then tuning from observed player load and scenario density. This is a pacing proposal, not a locked rule.

### 4.6 Challenge lifecycle

- Challenges remain optional situations, not paid Assignments.
- They use the GDD's AP commitment and resolution model; show cost and consequences before commitment.
- A presented/declined/resolved Challenge must not duplicate the same causal occurrence.
- A scenario may recur only when its authored repeatability rule is satisfied by a new occurrence or materially new circumstance.
- Scenario-specific cooldowns are authored and testable; there is no assumed universal cooldown.
- Completed outcomes remain in the Challenge outcome archive; offers/declines remain operational only as needed for trigger and duplicate control.
- Challenges do not award Historical Progress XP or gate Works.

## 5. Live implementation findings

Inspected the live repository after PR #79 merged, on main at 783528cfb832ad251b50b0b43a5d4034b8d466c0, plus the canonical GDD, approved orientation specification, Era I orientation audit, institutional responsibility matrix, and relevant source/tests.

### Assignment generator

- Fresh-game initialization and END_DAY settlement call generateDailyAssignments().
- The generator currently discovers only the three authored Uruk opportunity definitions by matching active institutional matters, plus a special post-execution North-Bay inspection path.
- It has an 8-AP pass cap and a four-open-offer cap. The latter can prevent the soft target from being reached even when additional eligible source matters exist.
- It rotates definition order, checks active matter/institution linkage, and prevents another offer from the same matter.
- It writes lastPresentedDayByActivity, but does not read it as a cooldown.
- It does not create recurring occurrences or replenish its matter pool.
- The current opening test expects two offers totaling 7 AP and verifies same-day idempotence. It does not establish multi-day supply.
- All three authored recurring definitions are anchored in the Temple Storehouse under Ur-Nanna. The current orientation audit identifies Commercial as partial and Martial as absent; Civic and Religious need clearer differentiation.

### Challenge Director and trigger producers

- runChallengeDirector() currently runs during END_DAY settlement after Assignment generation.
- It evaluates two hard-coded, one-shot Uruk scenarios: held-stock age/incomplete inspection and delivery-reconciliation completion/aggregate activity.
- Assignment aggregates are keyed by employer/category/commodity; recent Assignment activity is bounded to five entries.
- Current world-event producers include explicit world-event creation, scheduled institutional-matter development, institutional response lifecycle events, and authored opportunity consequences.
- Relationship changes are written through world-social actions, Assignment activity/submission, and authored opportunity consequences. Factual participation alone does not create a relationship.
- The current institutional world update is a narrow deterministic matter/response pipeline, not a general autonomous NPC-action scheduler. Person objectives, circumstances, and commitments exist as state, but their existence alone does not mean a general NPC agency loop is implemented.
- The current director does not consume general relationship, NPC-action, institutional-event, or historical-event candidates from an authored pool.

These are source findings, not a claim that the full world simulation is implemented. Production must repeat the consumer/producer audit against the exact approved contract before changing runtime architecture.

## 6. Acceptance and playtest coverage

### Track 1

1. Multi-Workday supply from a fresh character through and beyond the initial Storehouse cluster.
2. Report new estimated AP offered per Workday and over a multi-day window; assess the soft target as a trend, not a daily quota.
3. Exercise all four orientations against the same shared pool; verify plausible access, cross-institution routes, and meaningful differences in circumstances.
4. Validate the ~8–9 anchor portfolio and approximately two credible institutional contexts per orientation without forcing equal queues or cosmetic variants.
5. Verify recurring occurrences vary through coherent, supported counterparties, commodities/units, discrepancies, and settings.
6. Same state and seed produce the same occurrence; reload does not duplicate it.
7. A recurrence has a new occurrence identity and source facts; completed/declined/lapsed/cancelled occurrences do not silently reopen.
8. No fabricated matter, false discrepancy, deadline, relationship, authority, or delivery route.
9. Low rank does not systematically starve ordinary work; skill qualification and authority remain separate.
10. A genuinely quiet day remains possible when no eligible source exists.

### Track 2

1. Each trigger domain has positive, negative, and provenance tests.
2. A scenario is selected only when its authored eligibility conditions and access route are satisfied.
3. Weighted selection is deterministic for the same saved state, seed, and evaluation point.
4. Changing a relevant trigger or weight can change the selected eligible candidate; ineligible candidates are never selected.
5. No candidate means no arrival; passage of a day alone does not create a Challenge.
6. Mandatory-Work lapses are excluded from neglect interpretation.
7. Repeatability, cooldown, and duplicate prevention work across save/load and succession.
8. No Challenge flood, hidden Work prerequisite, AP bypass, or Historical Progress XP award.
9. Player-facing delivery identifies the actual cause and source without exposing information the character does not know.
10. The director remains bounded and does not scan unbounded archives.

## 7. Cross-department dependencies

- **Game Design:** Own the anchor portfolio, recurrence semantics, trigger vocabulary, candidate weighting policy, and pacing playtests.
- **Historical Research:** Deliver the Era I anchor research brief and validate parameter domains; see dev/ERA_I_ASSIGNMENT_HISTORICAL_RESEARCH_BRIEF.md.
- **Engineering/Architecture:** After behavioral approval, propose deterministic bounded trigger capture, occurrence identity, and persistence compatibility. Production owns exact types, module placement, serialization, and APIs.
- **Production/QA:** No immediate implementation work. The Character Creation → Storehouse Reckoning milestone is already reported complete under Issue #69; do not divert Production to this proposal. After approval and handoff, test multi-day supply, trigger coverage, determinism, save/load, and succession.
- **Art/UI/UX:** No immediate change. Distinct settings may later need differentiated scene/context presentation; preserve accessibility and readability.
- **Audio:** No material impact at this stage.

## 8. Owner review items

1. Confirm the proposed END_DAY evaluation boundary and next-Morning-Report delivery.
2. Confirm whether zero-or-one Challenge arrival per settlement pass is the preferred initial playtest default, or leave the first pacing test unconstrained.
3. Confirm the approximate 8–9 anchor portfolio target as an authoring target, with overlap allowed and no orientation queues.

Until these are resolved, the document remains a proposed behavioral contract, not READY FOR IMPLEMENTATION.
