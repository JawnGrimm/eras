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
