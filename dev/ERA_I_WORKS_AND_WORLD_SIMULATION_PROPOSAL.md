# Design Investigation 04 — Era I Works Portfolio and Supporting World Simulation

**Status:** Design proposal for Game Director review; not approved GDD canon  
**Date:** 2026-11-23  
**Scope:** Era I Works portfolio, Work lifecycle and invitation principles, and the minimum bounded world simulation required to support meaningful Works  
**Authority:** \`docs/GDD.md\` remains canonical. This document does not revise the GDD or approve an open design item.  
**Implementation:** None. No production code, save schema, content catalog, or numerical progression value is changed.

## 1. Executive recommendation

Build Era I around **one required historical milestone Work and a small number of career-scale Work alternatives**, all grounded in the same overlapping institutional world. The first recommended milestone is a multi-party institutional provisioning undertaking associated with a major Eanna gathering. Two career-scale candidates are:

1. **The Ordered List** — maintain, compare, and produce a useful copy of an existing lexical/reference list.
2. **The Long Delivery** — coordinate and preserve the record of a complex procurement and delivery undertaking across multiple counterparties.

A third candidate, **The Work Group Account**, is retained as an alternative or later addition if the personnel evidence and scenario scope can be made sufficiently specific.

The milestone Work must not claim that the player invents writing, creates the first archive, establishes a temple-state bureaucracy, or introduces a new universal accounting system. It is a designed reconstruction in a world where administrative writing, commodity accounts, sealings, and lexical lists already exist.

The minimum supporting world simulation is not a continuously simulated population. It is a deterministic, event-driven model of consequential people, institutions, commitments, and durable institutional matters. Works should use and develop the existing typed world model rather than introduce a parallel simulation.

**Recommended sequence:** resolve the character-history data blocker already identified in the Open Design Register; in parallel, approve the Work portfolio direction and define the first milestone Work; then implement the smallest stage-to-world transition extension needed to make its consequences persistent.

## 2. GDD alignment check

The proposal preserves the following approved boundaries:

- **Core fantasy:** administrative judgment and consequential documents remain the gameplay.
- **Activity separation:** Assignments / Commissions, Challenges, and Works remain distinct. The Storehouse Reckoning remains the Introductory Tutorial outside all three.
- **Work progression:** Works remain the sole ordinary source of Historical Progress XP. Ordinary Assignments, Challenges, wages, and purchases do not award it.
- **Work structure:** a Work is a meaningful historical undertaking with people, institutions, resources, stages, deliverables, choices, quality, consequences, and a lasting impact.
- **Optional-content independence:** a required Work must have a viable path that does not depend on a particular optional Assignment or Challenge.
- **Workday economy:** all substantive Work actions use the shared six-AP Workday. No real-time timers or four time blocks are introduced.
- **Progression independence:** Career XP, Professional Rank, Appointments, and Historical Progress XP remain separate.
- **Situated knowledge:** Events, Records, and Knowledge remain distinct. The player does not automatically know what the world knows.
- **Technical boundary:** deterministic authored rules only; no runtime generative AI for content generation, validation, or outcomes.

No GDD invariant is changed. The portfolio size, Work invitation policy, active-Work concurrency, Work reward policy, and detailed Work stages remain open pending owner approval.

## 3. Work versus other activity

The distinction must be apparent in the human purpose and scope, not merely in the activity label.

| Layer | Typical scope | Player commitment | Result |
|---|---|---|---|
| **Assignment / Commission** | A bounded job or request from a person or institution | Optional; offer lifecycle and commitment limits apply | Career XP, compensation, a report or defined service, and possible consequences |
| **Challenge** | A behavioral or situational choice | Optional; event-driven | A consequential choice and an archived Career Journal outcome |
| **Work** | A substantial historical undertaking that coordinates people, information, resources, or institutions over a meaningful arc | Part of the mandatory historical-progression layer; the portfolio determines which undertakings or alternatives are required | A durable achievement, institutional or historical consequences, and Historical Progress XP |
| **Storehouse Reckoning** | Guided supervised apprenticeship exercise | Introductory Tutorial | Teaches basic professional interaction; 0 Historical Progress XP and no completed-Work entry |

A Work must not be a longer Assignment merely because it has more evidence. It should have several of the following:

- A purpose extending beyond one person's immediate request.
- More than one consequential person, responsibility, institution, or flow of goods/information.
- Several linked stages whose decisions constrain later stages.
- More than one meaningful approach or sequence.
- Multiple deliverables or a connected record set, rather than one isolated report.
- A result that an institution, group, or later person can use.
- Consequences that persist after the player's immediate task is complete.

A Work may contain optional Assignments or Challenges, but these provide assistance, context, resources, or alternative approaches. They do not become mandatory sub-quests.

## 4. Proposed Era I portfolio

### 4.1 Required milestone: The Eanna Provisioning Undertaking

**Working title only.** Alternative player-facing titles include *The Gathering Account* or *Provisioning the Gathering*. The title should be chosen after the scenario's institutional and human context is authored.

**Historical basis**
- Eanna is the strongest Era I setting for administrative tablets, sealings, storage/distribution, production-related activity, and large-scale ceremonial or public gatherings.
- Archaic accounts include fields, plowing, yields, animal husbandry, cereal production, bread/beer, and labor inventories or allocations.
- The evidence supports multiple activities within the precinct, not a fully reconstructed modern department or a single all-powerful office.
- A particular gathering, its precise supply chain, named participants, and its workflow would be an authored reconstruction, not a documented historical event.

**Human problem**

A substantial institutional gathering is approaching. Goods and services depend on several overlapping relationships: stored commodities, incoming deliveries, production or processing, transport, work groups, and people responsible for receipt and allocation. The institution needs enough reliable information to make defensible decisions without pretending that every source, recipient, quantity, or responsibility is already known.

The player helps produce and preserve a connected account of the undertaking. The challenge is not to invent writing or a new accounting system. It is to use existing administrative practices responsibly across a complex situation.

**Candidate stages**

1. **Establish the undertaking**
   - Identify the institution's purpose, the authority behind the request, the intended uses, known requirements, and the people affected.
   - Distinguish declared requirements from estimates, preferences, and unsupported expectations.
2. **Establish available resources**
   - Examine relevant store, field, herd, production, and delivery information where the authored scenario makes it available.
   - Identify missing information and avoid assuming all producers or workshops are directly controlled by Eanna.
3. **Plan the flows**
   - Choose a viable combination of available stock, incoming goods, production, or adjusted requirements.
   - Keep commodity-specific numerical/metrological systems distinct.
   - Make trade-offs visible: timing, quantity, condition, source confidence, and the people who bear a shortfall.
4. **Coordinate movement and custody**
   - Track dispatch, transport, receipt, sealing, and responsibility where applicable.
   - Treat seals as contextual evidence of closure, custody, and authority—not as modern personal signatures.
5. **Resolve discrepancies and exceptions**
   - Compare records, physical observations, and attributed statements.
   - Distinguish a missing record from missing goods, delay from diversion, and a plausible explanation from an established cause.
   - Preserve unresolved matters rather than manufacture certainty.
6. **Close and preserve the undertaking**
   - Produce a connected record set sufficient to explain the major flows, decisions, receipts, allocations, and unresolved questions.
   - Present the result to the appropriate institutional authority for assessment and disposition.
   - Record what the institution can responsibly use, what remains uncertain, and what follow-up is authorized.

**Deliverables**
- A requirements/authority record or equivalent initial brief.
- A set of linked commodity, dispatch, receipt, or allocation records appropriate to the scenario.
- A reconciliation or closing account that preserves the relevant units and qualifications.
- A final institutional record of decisions, outcomes, and unresolved matters.

These are functional deliverables, not claims that Uruk used a modern requisition form, ledger, or standardized document suite.

**Meaningful approaches**
- Fulfil the undertaking using the best-supported available supply route.
- Negotiate a change in quantity, timing, or scope with the relevant authority or counterparties.
- Prioritize some needs while explicitly recording what cannot be met.
- Delay or qualify a decision until essential evidence is available.
- Preserve a defensible partial result rather than claim a complete outcome unsupported by the records.

**Consequences**
- The quality and completeness of the account affect what the institution can authorize, verify, remember, or repeat.
- Poorly supported allocations can damage relationships, create unresolved obligations, or produce later shortages/disputes.
- A responsible partial result can preserve trust and institutional memory even when the undertaking is not fully fulfilled.
- The final record may become a source for later people, but it must not grant them knowledge automatically; knowledge transfer requires an authored channel.

**Why this qualifies as a Work**

Its scope is a coordinated undertaking, not a single stock discrepancy. It involves multiple people and flows, several stages, meaningful trade-offs, and a durable record of an institutional result. It creates a visible contribution to how information supports collective activity without claiming the player invented the underlying technology or institution.

**Historical confidence**
- Attested/inferred: administrative commodity accounts, sealings, storage and distribution, field/herd/production categories, labor allocations, and multiple activities at Eanna.
- Reconstruction: this particular gathering, its named actors, its exact supply chain, its stages, and its final record set.
- Unsupported and excluded: a universal Eanna bureaucracy, fixed annual festival calendar, modern procurement department, standardized universal measures, or an invented historical office hierarchy.

### 4.2 Optional career-scale Work: The Ordered List

**Historical basis**
- Archaic lexical lists are part of the early written corpus, including lists of professions, titles, cities, animals, and other categories.
- They likely served reference and teaching purposes, but the existence of a formal school at Uruk c. 3200 BCE is not established.
- Exact readings and the organization of some early lists remain debated.

**Human problem**

A working/reference list is needed by a small group of scribes or administrators who encounter recurring categories in their work. An existing exemplar or partial list is available, but copying, ordering, variants, and uncertain readings require care.

**Candidate stages**
1. Establish the list's intended use and who will consult it.
2. Compare available exemplars or source tablets, where the scenario provides them.
3. Distinguish secure readings, variants, damaged signs, and uncertain categories.
4. Select an order or grouping appropriate to the stated purpose without claiming it is universal.
5. Produce and check a usable copy.
6. Place the copy with a person or institutional context that can actually use it; record its provenance.

**Deliverable and impact**

A checked reference copy or organized list that supports later recognition, classification, and instruction. It may improve a group's ability to consult existing categories, but it does not create a formal school, a universal curriculum, or a new writing system.

**Work test**

The task must extend beyond copying a short tablet. It needs comparison, editorial judgment, a real use context, and a durable outcome. If the authored scenario cannot establish those elements, this should be an Assignment or instructional activity rather than a Work.

**Historical confidence**
- Attested: early lexical lists and their thematic content.
- Inferred: reference and teaching functions.
- Reconstruction: the specific exemplar, group, editorial problem, and intended use.
- Unsupported and excluded: a documented formal school, a named schoolmaster hierarchy, or a claim that the player creates the first lexical list.

### 4.3 Optional career-scale Work: The Long Delivery

**Historical basis**
- Uruk's material economy depended on regional and interregional movement of resources not locally available in sufficient quantity.
- Tablets, tags, sealings, and administrative devices provide evidence for commodity movement and custody.
- Surviving records often do not identify the full origin or final recipient of goods. A complete, modern-style chain of custody should not be assumed.

**Human problem**

A significant procurement undertaking involves multiple deliveries or counterparties. The institution needs to know what was requested, what was dispatched, what physically arrived, what the evidence can establish about custody, and what remains unknown about origin, delay, substitution, or responsibility.

**Candidate stages**
1. Establish the institution's need and the authority for procurement.
2. Identify plausible counterparties and available evidence about the goods and their movement.
3. Compare dispatch records, tags, sealings, and carrier accounts.
4. Record receipt and condition without assuming the sender, carrier, or receiver is automatically at fault.
5. Resolve discrepancies or negotiate a defensible alternative.
6. Preserve a connected procurement and receipt record, including limits on provenance.

**Deliverable and impact**

A defensible account of a complex procurement/delivery undertaking, useful to the institution and its future dealings with counterparties. The Work may improve continuity and accountability without claiming that the player invents a standardized trade network or modern shipping documentation.

**Work test**

This must cover a substantial procurement undertaking with multiple linked deliveries, counterparties, or consequential stages. A single delayed load or broken seal remains an Assignment or Challenge.

**Historical confidence**
- Attested/inferred: interregional resource dependencies, movement of goods, tablets/tags/sealings, and institutional procurement contexts.
- Reconstruction: the exact counterparties, route, delivery sequence, and dispute.
- Unsupported and excluded: modern private merchant houses, a fully documented trade bureaucracy, or certainty about a shipment's origin when the sources do not provide it.

### 4.4 Reserve candidate: The Work Group Account

This is a possible alternative to *The Long Delivery*, or a later career-scale Work.

**Historical basis:** Uruk-period and broader late-fourth-to-third-millennium records include human-resource categories and allocations. The relevant Bartash study spans c. 3350–2500 BCE, so individual categories and procedures must not be projected wholesale onto c. 3200.

**Human problem:** a work group is associated with a defined institutional task and allocation. The player must preserve who or what category is recorded, what allocation is documented, what task is assigned, and what the evidence does not establish about individual status or responsibility.

**Potential deliverable:** a bounded personnel/allocation account linked to the task and its receipts or outcome.

**Risks:** it could easily become a generic workforce-management system, assume universal corvée, flatten dependents and workers into one category, or imply modern employment/conscription. Keep it scenario-specific and evidence-qualified.

## 5. Portfolio shape and progression recommendation

### Recommended portfolio for initial Era I playtesting

- **One required milestone Work:** The Eanna Provisioning Undertaking.
- **Two career-scale alternatives:** The Ordered List and The Long Delivery.
- **One reserve candidate:** The Work Group Account, to be used only if research and playtesting show a distinct need.

**Recommended progression shape:** require the milestone Work and let the player choose one of the two career-scale alternatives as the second required Work for Era I progression. The unchosen alternative is not a failure or an abandoned obligation; it is simply the other authored route. This keeps Works within the mandatory historical-progression layer while offering meaningful choice. Whether a later build also includes additional non-required Works remains an explicit owner decision.

This is a deliberately small portfolio. It gives the first era one substantial shared undertaking and two different forms of career-scale work: reference/knowledge organization and procurement/custody. It avoids creating a separate mandatory Work for each career orientation.

Government, Religious, Merchant, and Military orientations should affect initial context, contacts, responsibilities, and plausible approaches—not exclusive eligibility for a Work. Military participation remains especially conditional and historically restrained. No Work should grant a combat role or imply a standing military bureaucracy.

### Required versus optional

Recommended:
- The milestone Work is required for the main historical journey.
- One career-scale Work is also required for Era I progression, selected by the player from the authored alternatives.
- The selected career-scale Work is not a side quest; it is part of the mandatory Work layer and awards Historical Progress XP.
- The unselected alternative is not required in that playthrough. It may be reserved for replayability or a later content expansion; do not silently classify it as an optional Work.
- Every required Work has a complete viable route without optional Assignments or Challenges.

This interpretation preserves the GDD's mandatory Works layer while allowing a player's historical contribution to take one of several forms. Whether non-required Works should exist as an additional category is a separate owner decision.

### Historical Progress XP

Do not set numerical rewards or era thresholds in this proposal.

Recommended reward principle:
- Each authored Work has an explicit Historical Progress XP award.
- A Work's historical award is distinct from any Career XP, compensation, provisions, relationship changes, or institutional standing.
- Completion of an accepted Work earns its authored historical award once.
- Quality and choices primarily change the historical/institutional result and later consequences. Consider outcome-sensitive Historical Progress XP only if playtesting demonstrates a clear benefit; avoid making responsible but imperfect completion feel as though the historical undertaking never happened.
- Final thresholds and total pacing remain Future work until the Era I portfolio and expected duration are playtested.

## 6. Work invitation, date, and continuity policy

A Work's invitation is not an Assignment offer and must not inherit the Assignment's three-day expiry rule.

Recommended distinction:

- **Historically anchored window:** an invitation may arise because a gathering, procurement need, institutional undertaking, or other dated circumstance is approaching.
- **Player-facing notice:** explain why the invitation reached this character, who is asking, the expected commitment, known timing, and what happens if the player waits.
- **No real-time timer:** all timing is expressed in the in-game calendar and AP economy.
- **No hidden deadline:** the simulation may not invent or conceal a deadline merely to force activity.
- **Required Work recovery:** if the player misses the original invitation, provide a historically plausible later entry, reduced-scope version, successor undertaking, or other authored catch-up route. Missing a date must not silently make the main historical journey impossible.
- **Unselected alternative:** where the player chooses between two required career-scale routes, the unselected route is not treated as a declined obligation and creates no automatic penalty.
- **Any future non-required Work:** if such Works are approved, one may genuinely become unavailable when its underlying circumstances pass, but only where the content defines why. The player should see that risk before committing to another use of time.
- **Declining is not automatically misconduct:** consequences depend on an actual responsibility, promise, or institutional need—not on a hidden penalty for refusing content.

The exact catch-up forms are scenario-specific. Do not make every Work infinitely repeatable or automatically re-offer the same event.

## 7. Minimum world simulation required

### 7.1 Reuse the existing world model

The existing architecture already distinguishes:
- Persons and directional relationships.
- Institutional affiliations, appointments, authority, and responsibilities.
- Circumstances, objectives, and commitments.
- Institutions and durable institutional matters.
- Events, Records, and Knowledge.
- Deterministic day settlement and matter advancement.
- Assignment opportunities generated from authored definitions and active matters.

Keep these concepts distinct. Do not add a second NPC model, a generic faction score, or a separate Work-only world.

### 7.2 Minimum actors for a Work

Every Work should author only the people needed to make its consequences understandable. Depending on the Work, these may include:

1. **Sponsor/requesting authority:** establishes why the undertaking exists and its scope.
2. **Operational counterparties:** people responsible for goods, production, transport, custody, or information.
3. **Affected people or group:** those who depend on the result or bear its costs.
4. **Reviewer/authorizer:** the person whose appointment actually permits assessment or disposition.
5. **Verifier or later user:** a person who can establish whether execution occurred or use the resulting record.

One person may fill more than one role, but the scenario must not infer authority from seniority, relationship, career path, or participation alone.

### 7.3 Matter-driven world state

A Work should originate from one or more of:
- An active institutional matter.
- A scheduled, authored historical circumstance.
- A durable institutional need or commitment established by a prior event or record.

The Work is not itself merely a matter or notification. It is the player's sustained undertaking in response to the situation. Related matters preserve the unresolved world conditions that may outlast the Work.

A Work should retain traceable links to its originating matters, people, institutions, events, and records. Do not let presentation text become the state key.

### 7.4 Event-driven NPC agency

The minimum viable NPC simulation is consequence-driven:

- Update a person when a relevant event changes their circumstances, a commitment or scheduled matter reaches a meaningful point, a condition becomes true, or the player needs a current decision from them.
- Give consequential NPCs immediate objectives and, where justified, longer-term ambitions.
- Let NPCs independently fulfill, delay, dispute, renegotiate, or fail commitments when authored circumstances and capabilities support that action.
- Do not run a full daily decision loop for every person.
- Do not create random daily busywork to make the world appear active.
- Do not make every NPC development revolve around the player.
- Do not reveal private objectives or knowledge to the player without a plausible channel.

The world must be capable of changing while the player works on a Work, but only through deterministic rules grounded in known circumstances, commitments, authority, resources, and authored schedules.

### 7.5 Stage-to-world effects

A Work's stages should have consequences before final completion when the undertaking requires them. Examples include:
- Recording an accepted instruction or agreement.
- Establishing a person's commitment to transport, deliver, inspect, or perform a task.
- Creating a receipt or custody record.
- Recording a delay, refusal, shortage, or disputed claim.
- Updating an institutional matter when new evidence or an authorized response changes its state.
- Granting Knowledge only to people or institutions that plausibly received or examined the information.

The final disposition should not retroactively create every event that supposedly happened during the Work. Stage effects must be recorded at the point the player commits to them.

### 7.6 Consequence loop

The smallest useful world loop is:

1. A historically grounded circumstance or existing matter creates a need.
2. An authored Work definition determines whether that need is a mandatory historical undertaking or a career-scale Work.
3. The player receives a situated invitation and can see its scope and timing.
4. Work stages acquire evidence, support decisions, and record consequential actions.
5. Deterministic world rules advance only relevant people, commitments, and matters.
6. The player produces the Work's deliverables and submits them for the appropriate assessment.
7. An authorized person assesses, authorizes, verifies, or declines within their actual authority.
8. The final result updates the record, institutional matter, relevant Knowledge, and later opportunities.
9. Other NPCs and institutions may continue acting on unresolved matters without the player.

An Assignment generated from a related matter remains optional. Completing it records its report and provenance; it does not automatically resolve the Work or underlying institutional situation.

## 8. Engineering and production fit

### Existing capability

Repository inspection of \`src/works/workDefinition.ts\`, \`src/engine/actionEconomy.ts\`, \`src/state/newGameState.ts\`, and \`src/tests/workEngine.test.ts\` establishes:

- The generic Work engine supports typed Work definitions, evidence packets, AP-costed actions, prerequisites, scenario progress, deterministic submission assessment, recovery, and finalization.
- Static validation checks Work IDs/titles, evidence references, action reachability, AP costs, and interpretation-rule integrity.
- Work finalization can create Records and Knowledge, retire or add institutional matters, and present Assignments.
- Historical Progress XP is awarded once on accepted completion for non-tutorial Works.
- The Storehouse Reckoning is registered as the only production Work-catalog entry and is explicitly typed as a tutorial.
- The current state stores one \`activeWorkId\`; a second Work cannot be started while one is active.
- The current Work action contract changes Work progress and acquired/examined evidence. Persistent world effects are concentrated in finalization; it does not yet expose a general typed stage-to-world-effect result.
- The existing world simulation advances institutional matters and institutional response lifecycles deterministically. Assignment generation is matter-driven and bounded.

### Gaps to resolve before implementation

1. **Work catalog/content:** author and register the first actual \`kind: 'work'\` definition. Do not repurpose the tutorial.
2. **Stage effects:** define a typed, validated way for a Work stage to emit Events, Records, Knowledge, commitments, matter updates, and appropriate notices. Keep transitions pure and deterministic.
3. **Work-to-matter linkage:** persist stable references from Work progress to its originating matters and relevant institutional context.
4. **Invitation model:** define how a mandatory or optional Work becomes available, how date windows are represented, and how catch-up routes are selected.
5. **Active-Work behavior:** current implementation permits one active Work at a time and has no general pause/resume action. Decide whether this is an acceptable initial rule or whether the player must be able to suspend one Work and begin another. Do not silently treat the current implementation limit as approved design.
6. **Multi-day behavior:** preserve progress across Workdays; show remaining stages, known dependencies, and estimated AP commitments. Do not require a player to spend all six AP on the Work in one day.
7. **Authority:** validate assessments, authorizations, execution, and verification against actual appointments and capabilities. Rank and relationship values do not grant institutional authority.
8. **Persistence and QA:** test save/restore at every stage, missed dates, unresolved matters, NPC action during an active Work, duplicate rewards, optional-content independence, and deterministic replay.

The existing typed transition architecture is a good starting point. Prefer small deterministic evaluators and state transitions over a general-purpose storyteller, real-time loop, or new simulation subsystem.

## 9. Cross-department impact

### Game Design
- Make the Work's human purpose and lasting result clear before the player commits.
- Keep Work, Assignment, Challenge, and tutorial boundaries legible.
- Give players meaningful approaches without making optional content a hidden prerequisite.
- Ensure imperfect but responsible outcomes remain viable.

### Historical Research
- Verify Eanna's large-gathering and provisioning contexts without inventing a specific attested festival or annual procedure.
- Review the chronology and intended use of lexical lists.
- Research procurement, delivery, sealing, and raw-material movement.
- Review labor categories and the date range of human-resource evidence before using *The Work Group Account*.
- Maintain attested / inferred / reconstruction / unsupported distinctions for every major claim.

### Engineering & Architecture
- Extend the existing Work and world transition contracts; do not create a second NPC or institutional-matter system.
- Add stage-level world effects only as typed, validated, deterministic transitions.
- Preserve schema-v2 compatibility and current identity-stage boundaries unless a separately reviewed change is necessary.
- Keep Historical Progress XP separate from Career XP, compensation, and authority.

### Art & UI/UX
- Present Works as multi-stage undertakings with people, institutional purpose, deliverables, timing, and visible consequences.
- Use the material culture of tablets, tags, sealings, vessels, storage, production, and transport.
- Do not visually imply a later temple-state bureaucracy, formal school, modern ledger office, or standing army.

### Audio
- Support the undertaking through clay, stylus, seals, vessels, transport, production, and gathering ambience.
- Avoid treating Military orientation as a battlefield soundscape.

### Production & QA
- Build a claim ledger for each Work: period, source, confidence, assumptions, and authored reconstruction.
- Validate all mandatory routes without optional Assignments or Challenges.
- Test stage persistence, world consequences, authority, deterministic replay, date-window recovery, and no duplicate Historical Progress XP.

## 10. Decision options for Game Director review

### Decision A — Era I portfolio shape

**Option 1 — Recommended:** One required milestone Work plus one required career-scale Work chosen from two alternatives (*The Ordered List* or *The Long Delivery*); retain *The Work Group Account* as a reserve.

- Strengths: compact first portfolio; demonstrates distinct forms of writing and administration; preserves player choice while keeping all required content in the mandatory Works layer; avoids four career-path-specific tracks.
- Costs: requires two substantial Work definitions and a fair choice between career-scale alternatives; the alternatives must be comparable in historical significance and progression value.

**Option 2:** Require the milestone Work and both career-scale Works.

- Strengths: more substantial mandatory historical arc and broader Era I coverage.
- Costs: more content and historical dependencies before Era I can be tested; risks turning the opening into a long checklist and reducing player choice.

**Option 3:** Require the milestone Work only; treat career-scale Works as additional non-required Works.

- Strengths: smaller mandatory path and greater freedom to pursue additional historical undertakings.
- Costs: requires an explicit owner decision clarifying how non-required Works fit the GDD's mandatory Works layer; progression rewards and thresholds become more complex.

### Decision B — Work invitation dates

**Recommended:** Date-anchored invitations with visible timing; mandatory Works receive an authored catch-up route if the original window is missed. Optional Works may lapse only when their underlying circumstances genuinely pass and the risk is visible.

Alternative: keep all Works continuously available. This is easier to manage but weakens the relationship between historical events and the calendar.

### Decision C — Stage effects on the world

**Recommended:** Work stages may create typed, deterministic world events and records before final submission. Finalization then records assessment and institutional disposition rather than inventing the entire history at the end.

Alternative: keep all world effects until finalization. This is simpler but makes multi-day Works feel less alive and prevents NPCs from responding to intermediate commitments and events.

### Decision D — Active-Work concurrency

**Recommended for the first implementation:** one active Work at a time, while Assignments, Challenges, conversations, and ordinary actions remain available. Work progress persists across days and does not impose a daily AP quota. Revisit only if playtesting shows that a long Work unfairly blocks another historical undertaking.

Alternative: add explicit suspend/resume support so a player can switch between Works. This provides flexibility but expands state, UI, and QA requirements.

### Decision E — Historical XP and quality

**Recommended:** each Work has a fixed authored Historical Progress XP award on accepted completion; quality changes the result, institutional response, relationships, and future consequences. Revisit variable awards only after the portfolio and thresholds are playtested.

Alternative: vary Historical Progress XP by outcome quality. This more directly rewards exceptional results but risks conflating historical significance with the player's professional performance and punishing a responsible partial outcome.

## 11. Owner decisions requested

The following remain OPEN until explicitly approved:

1. Portfolio shape: Option 1, 2, or 3 under Decision A.
2. Whether *The Eanna Provisioning Undertaking* is the right first mandatory milestone concept.
3. Whether *The Ordered List* and *The Long Delivery* are the right career-scale alternatives, or whether *The Work Group Account* should replace one.
4. Work invitation date and catch-up policy.
5. Whether Work stages may commit world effects before final disposition.
6. Whether one active Work at a time is acceptable for the first implementation.
7. Whether Historical Progress XP should be fixed per Work or outcome-sensitive.

No XP amounts, thresholds, Work duration, calendar dates, or stage AP costs are proposed as final values.

## 12. Next actions after direction is approved

1. Author a detailed Work brief for the selected milestone: historical claims, human problem, people/institutions, evidence dossier, stages, approaches, deliverables, outcomes, and recovery.
2. Build its stage graph and identify which steps must create persistent world events, records, knowledge, commitments, or matter updates.
3. Conduct targeted historical review of the exact claims and material culture used in the brief.
4. Specify the minimal Work-stage transition contract and save-validation tests.
5. Author the first actual Work definition and register it separately from the Storehouse tutorial.
6. Playtest the Work over multiple six-AP Workdays, including a delayed route, an imperfect but responsible result, and a path that uses no optional Assignment or Challenge.
7. Update the Open Design Register and Decision Register only after owner decisions are made.

## 13. Sources and repository basis

### Existing Era I research and content proposals

- \`dev/ERA_I_INSTITUTIONAL_HISTORICAL_AUDIT.md\` — historical cautions concerning Eanna, Anu/Kullaba, proto-cuneiform, numerical systems, sealings, provisioning, and military evidence.
- \`dev/ERA_I_INSTITUTION_RESPONSIBILITY_MATRIX.md\` — institutional contexts, cross-path responsibilities, confidence rules, and nine scenario seeds.
- Hans J. Nissen, “Uruk: Early Administration Practices and the Development of Proto-Cuneiform Writing,” *Archéo-Nil* 26 (2016), pp. 33–48.
- Giacomo Benati, “The Construction of Large-scale Networks in Late Chalcolithic Mesopotamia: Emergent Political Institutions and Their Strategies,” in *Urbanized Landscapes in Early Syro-Mesopotamia* (2018), pp. 103–122.
- Vitali Bartash, “Age, Gender and Labor: Recording Human Resources in 3350–2500 BC Mesopotamia,” AOAT 440 (2018), pp. 45–80.
- Gil J. Stein, “The Political Economy of Mesopotamian Colonial Encounters” (2005).
- Digital Corpus of Cuneiform Lexical Texts, “The Archaic Lexical Corpus.”
- *The Oxford History of the Ancient Near East*, “The Uruk Phenomenon” (2020).

The existing research notes contain the source URLs and explain their limits. This proposal does not claim a new external literature review.

### Design and implementation sources inspected

- \`docs/design/ACTIVITY_AND_WORK_SPEC.md\`, especially §11.1–11.4.
- \`docs/design/WORLD_SIMULATION_SPEC.md\`, especially §15.1–15.6.
- \`docs/content/CONTENT_AND_SCENARIO_STANDARDS.md\`, especially §19.1–19.6.
- \`docs/design/PROGRESSION_AND_PACING_SPEC.md\`, especially §20.1–20.4.
- \`docs/design/OPEN_DESIGN_REGISTER.md\`, original items 1, 8, 11, 13, 20, 21, 22, and 25.
- \`src/works/workDefinition.ts\`, \`src/engine/actionEconomy.ts\`, \`src/state/newGameState.ts\`, \`src/state/types.ts\`, and \`src/tests/workEngine.test.ts\`.

