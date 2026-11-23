# Comparative RPG Design Study — Architectural Reference

**Status:** Standing research and design reference; not an implementation plan or feature approval.  
**Authority:** The canonical design authority remains [`docs/GDD.md`](GDD.md). This document distills the supplied *Procedural RPG Design Case Studies* study for future architecture discussions.  
**Purpose:** Use comparative examples to evaluate future systems for Scribe of Eras while keeping scope appropriate to a solo/small-team project and the game's focus on recording, preserving, organizing, interpreting, and circulating knowledge.

## How to use this reference

- Consult it when a relevant system is being designed or revised; do not turn every observation into a backlog item.
- Treat case-study claims as findings reported by the supplied study, not as independently re-verified technical documentation.
- Distinguish the source study's recommendations from project decisions. Nothing below is automatically approved for implementation.
- Prefer a small, coherent simulation in which variables create consequential career and social situations over broad simulation for its own sake.
- Preserve historical and institutional specificity. Do not copy another game's surface mechanics or fiction wholesale.

## Comparative principles

### 1. World history and pre-existing context — Dwarf Fortress

**Study takeaway:** Generate a compact history before play, including named people, institutions, and relationship graphs. A world should have context beyond the player's immediate actions.

**Potential application:** Establish enough prior institutional history, people, obligations, and relationships to make the player's work feel situated in an existing world. Use persistent identities and traceable records rather than generating an enormous simulated population.

**Guardrail:** Do not pursue Dwarf Fortress-scale physical/anatomical simulation, opaque historical output, or exhaustive simulation of every citizen.

### 2. Event pacing and authored/emergent narrative — RimWorld

**Study takeaway:** Use rule-based storyteller pacing, conditions, rank/prosperity, and cooldowns to select consequential events. The study emphasizes combining authored narrative with emergent systems rather than relying exclusively on either.

**Potential application:** Let institutional circumstances, unresolved matters, character standing, and prior events determine when a bounded set of authored situations becomes relevant.

**Guardrail:** Avoid massive authored event pools, arbitrary threat escalation, and systems that generate activity without emotional or professional meaning.

### 3. Character traits, stress, and obligations — Crusader Kings

**Study takeaway:** Trait-incongruent choices can create stress and narrative pressure; condition-gated authored events can supply context around emergent situations. Hooks and obligations make relationships mechanically consequential.

**Potential application:** Consider how a character's actual traits, values, skills, relationships, and circumstances shape their interpretation of professional dilemmas and the consequences of choices.

**Guardrail:** Do not copy CK's numerical stress thresholds or build sprawling event/perk content. The source study's stress loop is a design reference, not a decision to add or change Scribe of Eras stress mechanics.

### 4. Modular simulation/content interfaces — Mount & Blade II: Bannerlord

**Study takeaway:** The study highlights explicit interfaces and default implementations as a way to separate campaign rules from extensible content. It also warns about autonomous agents abandoning strategic goals.

**Potential application:** Keep shared simulation rules and lifecycle transitions separate from era-specific content, institutional rosters, scenario definitions, and presentation. Define clear contracts at system boundaries so future content can extend behavior without rewriting the core.

**Guardrail:** Avoid large autonomous simulations without goal commitment, and avoid adding abstraction layers before a real extension point requires them. The study discusses Bannerlord's C# architecture; Scribe of Eras should use patterns appropriate to its actual TypeScript/React codebase rather than copying the language or framework.

### 5. Persistent NPC identity and consequential memory — Shadow of Mordor / Shadow of War

**Study takeaway:** Persistent character identity, relationship state, and interaction-weighted callbacks can make a small recurring cast feel as though it remembers the player's history. The study also notes production coordination costs and the risk that rapid player success prevents relationships from developing.

**Potential application:** Give recurring patrons, colleagues, rivals, mentors, and institutional contacts durable identities. Let a small number of consequential interactions influence later dialogue, access, obligations, and callbacks.

**Guardrail:** Do not reproduce the Nemesis military hierarchy, promotion/demotion loop, or its patented combination. The transferable design idea is limited, contextual memory in a civic and professional network, not a Nemesis clone. Keep the recurring cast small enough to remain credible.

### 6. NPC daily life and object-mediated actions — The Sims

**Study takeaway:** Smart Objects advertise actions and the needs they satisfy, allowing agents to select from available interactions rather than requiring bespoke scripts for every NPC-object pairing. Trait-varied needs can make behavior less uniform.

**Potential application:** When autonomous daily routines become necessary, consider capability-based interactions with workspaces, tools, meeting places, archives, and institutional facilities.

**Guardrail:** Do not add a large set of decaying needs simply to make NPCs appear alive. Avoid uniform decay, death spirals caused by fast decay/slow recovery, synchronized rush hours, and excessive micro-management. This is a future architecture option, not a current implementation request.

### 7. Professional procedure and moral pressure — Papers, Please

**Study takeaway:** Repetitive clerical work becomes engaging through escalating rules, limited time, consequential accuracy, and pressure between professional correctness and human need.

**Potential application:** Build meaningful variation through changing documentary requirements, provenance, responsibility, conflicting evidence, and consequences of decisions. Let procedure reveal institutional priorities and human stakes.

**Guardrail:** Avoid shallow rule escalation, arbitrary fines, or economic margins so forgiving that intended dilemmas become consequence-free. Do not copy the game's household-survival model or introduce new resource rules by analogy.

### 8. Recurring cast credibility — Far Cry 2

**Study takeaway:** A small recurring cast can support stronger relationships than a large roster of thinly characterized characters. The study stresses that characters must remain credible outside their direct mission function.

**Potential application:** Make recurring NPCs recognizable through their work, relationships, obligations, institutional position, and consistent responses to events.

**Guardrail:** Avoid contradictory world behavior—for example, institutions or people treating the player as trusted in one context and inexplicably hostile in another without a legible reason. Do not scale cast size beyond the project's ability to make characters coherent.

### 9. Historical daily life and simulation scale — Kingdom Come: Deliverance

**Study takeaway:** The supplied study explicitly identifies an evidence gap: its available notes do not document enough concrete technical detail about daily schedules, social-status checks, professional routines, or what the developers cut.

**Potential application:** Treat historically credible routines and social context as important research targets when designing future NPC life systems.

**Guardrail:** Do not present undocumented claims about Kingdom Come's internal systems as established fact. The study recommends directly reviewing the cited Warhorse lecture and postmortem material before drawing detailed architectural conclusions.

### 10. Strategic actor behavior, institutional politics, and systemic pressure — Total War

**Study status:** A multi-entry comparison, not a single-game blueprint. Total War is relevant because its campaign layer makes factions pursue goals, respond to threats, manage internal interests, and react to changing material conditions. Its military scale and map simulation are not appropriate implementation targets for Scribe of Eras.

#### Warhammer III — explicit task evaluation and AI debugging

**Study takeaway:** Creative Assembly's campaign-AI development notes describe distinct threat and strength evaluations, faction-relative threat assessments, task generation and prioritization, distance/time scaling, and changes to priorities as a campaign progresses. The developers also document concrete failure modes: incorrect threat queries, anti-player bias, idle or clustered armies, and factions repeatedly attempting recruitment that is unlikely to succeed. A later update describes storing attempted recruitment history so an army can move on to other tasks after repeated failures.

**Potential application:** Treat NPC and institutional action as a bounded decision made from current, relevant state. Check what the actor knows, what authority and resources they possess, which commitments and matters are relevant, and which actions are actually available. Keep eligibility separate from priority: an action that is not authorized or possible must not become selectable merely because it has a high score. When an action fails for a durable reason, preserve only enough history to avoid blindly repeating it until circumstances change.

**Guardrail:** Do not reproduce a grand-strategy task planner, influence maps, military strength calculations, campaign-scale distance evaluation, or continuous agent simulation. For Scribe, a small TypeScript evaluator called at relevant transitions is sufficient. Any weighting should be explicit, inspectable, deterministic, and covered by tests. The developer notes are valuable partly because they expose how priority systems can create pathological behavior; they are not evidence that a complex planner is necessary.

**Primary references:** [Creative Assembly: Improving AI in Campaign](https://community.creative-assembly.com/total-war/total-war-warhammer/blogs/65-total-war-warhammer-iii-improving-ai-in-campaign); [Improving AI in Campaign — Part 2](https://community.creative-assembly.com/total-war/total-war-warhammer/blogs/69-total-war-warhammer-iii-improving-ai-in-campaign-part-2); [Update 9.0 release notes — recruitment attempt history](https://community.creative-assembly.com/total-war/total-war-warhammer/blogs/110-total-war-warhammer-iii-update-9-0-release-notes).

#### ROME II — institutional factions, offices, loyalty, and secession

**Study takeaway:** ROME II models internal political parties with influence and loyalty, important characters with gravitas and ambition, offices, and political actions. Campaign actions can affect party influence and loyalty; sufficiently low loyalty can lead to secession and civil war. The later political-system revisions made civil-war likelihood depend on support levels and added warning states rather than making civil war inevitable.

**Potential application:** This is a useful comparison for institutions as collections of people with overlapping interests, offices, authority, and competing claims. It reinforces the need to keep personal relationships, institutional standing, formal appointment authority, and actual commitments distinct. Institutional disagreement can produce consequences without every disagreement becoming a new faction or combat encounter.

**Guardrail:** Do not import a single loyalty meter that collapses trust, respect, resentment, institutional standing, and political support into one value. Do not turn every institution into a party-management minigame. A secession/civil-war threshold is a strategic-game abstraction, not a default model for a temple, archive, guild, court, or scholarly institution.

**Primary references:** [ROME II Politics Overview — official manual](https://r2edenc.totalwar.com/en/manual/rome-ii-politics-overview/index.html); [ROME II Patch 15 — political support and civil-war revisions](https://wiki.totalwar.com/w/Total_War_ROME_II%3A_Patch_15).

#### Attila — material pressure, migration, and reversibility

**Study takeaway:** Attila is useful for its survival-oriented campaign conditions. Its manual describes horde mechanics, settlement razing, and voluntary abandonment; razing or abandoning a settlement damages regional fertility, with recovery taking time. These systems make loss, relocation, and environmental consequences part of the campaign rather than treating settlement ownership as permanent.

**Potential application:** Represent historical pressure through discrete, authored conditions and scheduled developments: scarcity, disrupted supply, migration, damaged infrastructure, institutional decline, or recovery. A small number of connected conditions can change what people and institutions can do and create new records, responsibilities, and opportunities.

**Guardrail:** Do not simulate climate, agriculture, migration, population, or settlement economies continuously. Use coarse states and explicit transitions only where they create a meaningful professional or social consequence. Do not assume that Attila's historical framing is itself a neutral account of the period; mechanics and framing should be reviewed separately.

**Primary reference:** [Total War: ATTILA — official PC manual](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/325610/manuals/ATTILA_PC_MANUAL_EN.pdf).

#### Shogun 2 — campaign pressure and the danger of overriding relationships

**Study takeaway:** Realm Divide is a global campaign rule that changes the diplomatic environment after a fame threshold. It can create a dramatic endgame, but it also risks making accumulated alliances and diplomatic history feel provisional or disposable. Creative Assembly's later Complete Edition update added a slider that can preserve the original setting, increase the pressure, or turn Realm Divide off.

**Potential application:** Large historical changes can alter incentives and institutional behavior, but they should do so through legible causes and consequences. Preserve prior agreements and relationship history even when a new event makes them harder to honor. If a world-level rule changes behavior, make its scope and trigger understandable.

**Guardrail:** Avoid an arbitrary global hostility switch that overwrites relationship state or silently invalidates commitments. Do not confuse a dramatic campaign pacing device with a credible social simulation.

**Primary reference:** [Creative Assembly: SHOGUN 2 Complete Edition — gameplay additions and Realm Divide options](https://community.creative-assembly.com/total-war/total-war/blogs/115).

#### Three Kingdoms — targeted reference, not the benchmark

**Study takeaway:** Three Kingdoms is worth examining selectively for character satisfaction, appointments, titles, court positions, and diplomacy. Its official manual describes how characters can become dissatisfied when requests for advancement are ignored and may defect; a contemporary review also noted the prominence of character satisfaction and the expanded diplomacy system.

**Reception and production caveat:** Do not present Three Kingdoms as universally hated, but do not use aggregate review scores to dismiss the project owner's warning or treat it as a consensus exemplar. Creative Assembly announced in May 2021 that development had moved on after two years and seven DLC releases, prompting public fan dissatisfaction. The support decision and the quality of individual systems are separate questions.

**Potential application:** Study how an individual's career expectations and formal position can affect their behavior. This is relevant to appointments, obligations, institutional standing, and professional relationships.

**Guardrail:** Do not make Three Kingdoms the flagship Total War reference or assume its character model is a proven solution. Borrow only mechanics that withstand separate evaluation; keep its reception, support history, and individual design merits distinct.

**References:** [Total War: THREE KINGDOMS — official PC manual](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/779340/manuals/TW3K_PC_MAN_UK.pdf); [PC Gamer review](https://www.pcgamer.com/total-war-three-kingdoms-review/); [Creative Assembly: Moving on from Total War: THREE KINGDOMS](https://www.youtube.com/watch?v=0zId4puekfU); [NME report on fan reaction to the end of support](https://www.nme.com/news/total-war-three-kingdoms-fans-upset-as-development-is-halted-2951149).

#### Translation to the current TypeScript/React application

The useful Total War lessons fit the existing application without introducing a separate simulation engine:

- **Use the current typed world model.** GameState already distinguishes people, institutions, appointments, relationships, commitments, circumstances, objectives, events, records, knowledge, and institutional matters. Keep those concepts separate; do not replace them with a generic faction score.
- **Extend the existing transition pattern.** worldSocial.ts already applies validated world actions through state transitions. New consequential decisions should follow that pattern: validate references and authority, return a new state, and record the event that explains the change.
- **Use selective, event-driven evaluation.** institutionalMatters.ts already advances scheduled matter development and records resulting events. Evaluate only the people and institutions connected to a relevant event, matter, deadline, or changed circumstance.
- **Keep opportunity generation bounded.** opportunities.ts and challengeDirector.ts already use typed offers, trigger rules, compact aggregates, and a short recent-activity window. Extend those patterns rather than creating a general-purpose storyteller or continuously running NPC loop.
- **Persist causes, not every calculation.** Save durable decisions, commitments, event references, relevant failed attempts, and unresolved matters. Derive transient eligibility and priority scores from current state. Keep any history bounded where old entries no longer affect future play.
- **Test behavior as pure rules.** Prefer small evaluators and transition functions that can be tested with Vitest: eligibility, authority, priority ordering, duplicate prevention, failed-action cooldowns, event provenance, and save validation. Avoid time-dependent background loops and hidden side effects.

A future decision evaluator could be as small as: collect valid candidate actions for one actor; reject candidates that fail knowledge, authority, resource, commitment, or circumstance checks; rank the remaining candidates using a small authored priority function; select at most one action; then record its result. This is a design pattern for consideration, not an approved autonomous-NPC feature.

**Project-specific guardrails:** Preserve the GDD's distinction between event, record, and knowledge; preserve the six-AP Workday; keep Assignments, Challenges, and Works separate; retain the approved personal economy of money and provisions; and do not allow optional activities to gate mandatory Works. The objective is a coherent world experienced through consequential people and institutions, not a miniature Total War campaign.

## Synthesis: working architectural principles

The study's synthesis can be carried forward as these evaluation principles:

| System area | Principle to evaluate | Scope guardrail |
|---|---|---|
| World history | Compact pre-play history of named people, institutions, and relationships | No exhaustive world simulation |
| Event pacing | Rule-based triggers, conditions, cooldowns, and authored/emergent combinations | No giant event library |
| Career and roleplay | Consequences shaped by traits, obligations, and professional pressure | No copied stress thresholds or exploit-friendly margins |
| NPC daily life | Trait-aware behavior using available actions/capabilities | No excessive needs or synchronized chore loops |
| Memory and relationships | Persistent IDs, consequential interaction history, rare meaningful callbacks | No military rank ladder or sprawling generated kinship tree |
| Code and content | Modular boundaries between shared rules and era-specific content | No premature abstraction or autonomous actors without goal commitment |
| Recurring cast | Small, credible characters with continuity across contexts | No cast growth beyond narrative support capacity |

## Questions to apply when a future system is proposed

1. What player-facing or institutional problem does this system solve?
2. Which existing GDD pillar or approved system does it support?
3. What is the smallest simulation that produces the intended meaningful consequences?
4. Which state must persist, and which can be derived or authored?
5. How do people, institutions, records, and relationships observe or affect the system?
6. What prevents autonomous behavior from contradicting established goals, obligations, or context?
7. What is deliberately out of scope?
8. What evidence from the case study is strong, and what remains an open research question?

## Source and limitations

- **Procedural RPG Design Case Studies.txt** — supplied comparative design study covering RimWorld, Dwarf Fortress, Crusader Kings, Bannerlord, Shadow of Mordor/War, The Sims, Papers, Please, Far Cry 2, and Kingdom Come: Deliverance.
- This reference summarizes the supplied study's reported findings and recommendations. It does not independently verify the underlying interviews, technical descriptions, community analyses, or legal commentary.
- Kingdom Come: Deliverance is explicitly marked as an evidence gap in the source study.
- Patent discussion in the source study is not legal advice. This document preserves the practical scope guardrail: do not reproduce the Nemesis system's military hierarchy and patented combination.
- This reference is subordinate to the GDD and does not approve new gameplay mechanics, change existing systems, or authorize work that would interrupt the active institutional-lifecycle milestone.
