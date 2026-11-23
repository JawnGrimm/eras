# Decision Register

**Authority:** Records owner-approved decisions and their maturity. The [GDD](../GDD.md) remains the canonical source for core design authority.  
**Owner:** Game Director / Lead Designer.  
**Last updated:** 23 November 2026.

## Decision maturity

- **LOCKED:** Explicitly approved boundary or rule. Changes require deliberate owner review and a GDD revision.
- **APPROVED PRINCIPLE:** The experience or design direction is approved; implementation details may remain open.
- **PROVISIONAL:** A working value, model, or implementation choice that must not be mistaken for a final design lock.
- **OPEN:** No approved resolution yet.
- **IMPLEMENTATION FACT:** A verified statement about current code, save format, tests, or deployment. It does not itself establish design authority.

## Locked decisions and approved principles

| Topic | Status | Decision / boundary | Authority |
|---|---|---|---|
| Core fantasy and tone | LOCKED | Administrative judgment is gameplay; documents have consequences. Grounded, human, occasionally wry. Not a typing test, combat RPG, or conquest game. | GDD §§1–2, 3.5, 22 |
| Workday economy | LOCKED | Six shared AP per Workday. Spending all six permits +1 overtime AP, +5 Stress, and next day starts at 5 AP. No four time blocks or real-time timers. | GDD §6 |
| Gameplay layers | LOCKED | Assignments / Commissions, Challenges, and Works are distinct. Assignments and Challenges are optional; Works are mandatory historical progression and sole source of Historical Progress XP. | GDD §5 |
| Storehouse Reckoning | LOCKED | Introductory Tutorial outside all three layers; 0 Historical Progress XP; not completedWorks; not a template for future Works. | GDD §5; Activity and Work Specification |
| Progression independence | LOCKED | Career XP, Professional Rank, Appointments, and Historical Progress XP are separate. Rank derives from the character's skill profile and shapes reach only; skills determine task qualification; appointments grant authority. | GDD §§2, 5; Character and Career Specification |
| Personal economy | LOCKED | Only Money and Provisions are tracked personal balances. No Beer balance or universal free daily ration. | GDD §§1, 22; Economy Specification |
| Provisions shortage | LOCKED | Trigger on third consecutive Workday without provisions; +2 Stress per affected Workday, maximum +10 cumulative shortage-attributed Stress per character; recoverable Underfed condition; concrete recovery routes ship in the same milestone. | Economy Specification |
| Situated knowledge | APPROVED PRINCIPLE | Distinguish Event, Record, and Knowledge. Objective evidence is not hidden or falsified by character interpretation. | GDD §2.9; Activity and Work Specification |
| Deterministic evaluation | APPROVED PRINCIPLE | Evaluation uses authored evidence and rules; no runtime generative AI for assignment generation, record validation, or outcomes. Multiple defensible judgments are possible where evidence permits. | GDD §§2.9, 22; Activity and Work Specification |
| Continuity | LOCKED | Player continues through an existing connected scribal NPC in the same period; no inherited skills/rank and no era restart. | GDD §3.2; Character and Career Specification |
| Work Contribution Contract | APPROVED PRINCIPLE | Professional contributions are stable, character-attributed, independently assessable units authored by each Work. Career XP eligibility and one-time awards attach to qualifying contribution instances; Historical Progress XP remains a one-time Work-level award. Institutional response and execution remain separate from professional assessment/completion. Succession continues an undertaking only through a credible, explicit handoff; contributions remain separately attributed. | Owner acceptance, 23 Nov 2026; [Engineering Behavior Specification](../production/WORK_CONTRIBUTION_BEHAVIOR_SPEC.md) |
| Technical boundary | LOCKED | Runtime generative AI does not create Assignments, validate records, or determine outcomes. Production application is TypeScript-based. | GDD §22; production records |
| Documentation architecture | APPROVED PRINCIPLE | GDD is core authority; supporting specs explain systems; historical/content specs establish authored evidence; engineering records implementation; registers record decision maturity and open work. | Owner approval, 23 Nov 2026 |
| Character creation flow | APPROVED PRINCIPLE | Nine-screen flow with one primary choice per chapter; narrower Era I first-playable option set; Military orientation remains selectable; traits and ambition appear as inactive placeholders until content/mechanics exist. | Owner approval, 23 Nov 2026 |
| Protagonist identity | LOCKED | Enlil-barni has been replaced by a player-created protagonist. Insert the new Person during world assembly; do not patch the old identity or leak its history, relationships, or stats. | Owner decision, 23 Nov 2026 |
| Character-history persistence | IMPLEMENTATION FACT | Optional characterCreation, lifeEvents, and familiarities persist and validate; legacy Persons without these fields remain valid. | PR #56, merged adecd6b |
| Staged scribal identity | IMPLEMENTATION FACT | Identity-stage and initialized scribal states are distinct; absent stage means legacy initialized; no schema bump/upcast; active player must be initialized. | PR #57, merged 001c148 |
| Current repository baseline | IMPLEMENTATION FACT | PR #57 is merged to main; it is the baseline for the next character-history content-resolution step. | Merge confirmation, 23 Nov 2026 |

## Provisional values and unresolved decisions

| Topic | Status | Current treatment |
|---|---|---|
| Historical Progress XP thresholds | PROVISIONAL | Legacy balancing targets only; re-evaluate after Works portfolio authoring. |
| Career XP rewards and study reward | PROVISIONAL | Balance against actual progression costs and playtests. |
| Skill-to-rank formula and rank titles | OPEN | No formula or universal office ladder is approved. |
| Character starting attributes, skills, XP, equipment, money, provisions | OPEN | Do not invent defaults or assign values without owner approval and supporting content. |
| Character-history authored mappings | OPEN / BLOCKING | Resolver data must be authored and approved; no inferred familiarity, chronology, confidence, or participant mappings. |
| Trait and ambition catalogs/effects | OPEN | UI placeholders are inactive; no fake IDs or mechanics. |
| Military career expression in Era I | APPROVED PRINCIPLE | Selectable but historically restrained: custody, transport, protection, security, and organized movement; do not invent a formal military bureaucracy. |

## Change procedure

1. Identify the decision and affected invariant(s).
2. Gather implementation, playtest, and historical evidence as appropriate.
3. Present options and consequences to the owner.
4. Record explicit approval or rejection.
5. Update this register and the affected supporting specification.
6. Revise the GDD only when core design authority or a locked boundary changes.
7. Record implementation status separately after code and tests verify the change.

A proposal, successful implementation, merged PR, or passing test does not silently approve a design change.
