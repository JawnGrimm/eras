# Era I Life-History Starting-State Proposal

**ID:** GD-CHARACTER-START-001  
**Status:** PROPOSED — GAME DIRECTOR REVIEW REQUIRED  
**Date:** 23 November 2026  
**Scope:** Mechanical and world-state consequences of the approved Bannerlord-inspired Era I character-creation flow  
**Authority:** The canonical GDD and approved character-history content map remain authoritative. This proposal requests a bounded extension; it does not change them or authorize implementation.

## 1. Decision sought

Approve the principle and mapping by which the five life-history choices construct a character's initial professional and personal state.

The player is not selecting a class and then receiving a biography. The player is assembling a biography whose experiences explain the person who begins play.

The reference to *Mount & Blade: Bannerlord* concerns sequential, consequential life-history choices. It does not imply physical-avatar customization, a point-buy screen, combat attributes, or class-based restrictions.

**Recommendation:** let the five chapters establish different kinds of state, with a small and transparent mechanical footprint:
- Chapter 1 establishes social origin and household context.
- Chapter 2 establishes a principal developmental attribute emphasis through trusted responsibility.
- Chapter 3 establishes a secondary developmental attribute emphasis through formative experience.
- Chapter 4 establishes the actual route, people, and social context of professional entry.
- Chapter 5 establishes the character's narrowest supervised professional practice and its corresponding skill-development basis.
- Final identity establishes orientation, player-selected traits when the catalog exists, name, and optional ambition.

Every effect must be visible in the final review and traceable to a choice or Life Event. No hidden bonuses.

## 2. Source alignment and existing authority

This proposal builds on:
- GDD §§3.3–3.4 and the Character and Career Specification §3.4.
- Open Design Register item 22: attributes, skills, traits, action resolution, and starting profiles.
- `dev/URUK_CHARACTER_CREATION_MATRIX.md` and `dev/CHARACTER_CREATION_PLAYER_FLOW.md`.
- Approved `dev/ERA_I_CHARACTER_HISTORY_RESOLVER_CONTENT_MAP.md`.
- Approved `dev/CHARACTER_CREATION_DATA_CONTRACT.md`.

The approved content map currently prohibits starting attributes, skills, skill XP, Career XP, rank, resources, traits, and familiarity modifiers. This proposal does **not** silently override that prohibition. Its approval would authorize a separately versioned starting-state package and a controlled amendment to the relevant implementation handoff. The five Life Events, content IDs, participant mappings, confidence, familiarity scopes, and 3,328 valid combinations remain unchanged.

## 3. The six-step construction model

| Step | Character question | State established | Must not imply |
|---|---|---|---|
| 1. Origin | What kind of world and work shaped you? | Household/social context, origin facts, narrow observed familiarity, relevant existing contacts | Caste, fixed occupation, wealth tier, attribute bonus |
| 2. Responsibility | What did people trust you to do? | A principal developmental attribute emphasis; assisted familiarity and responsibility history | Literacy, authority, mastery, appointment |
| 3. Formative experience | What changed how you see the world? | A secondary developmental attribute emphasis; event and participant history; a possible interpretive habit candidate | A forced personality trait, a moral verdict, a guaranteed relationship score |
| 4. Professional entry | How did you enter scribal work? | Introducer/recommender/sponsor/contact facts and the actual route into instruction | Patronage, debt, office, institutional membership, trust or affection unless separately authored |
| 5. Early instruction | What did you learn first? | Narrow supervised practice; the basis for initial skill development; explicit familiarity | General literacy, universal numeracy, qualification, specialization, Career XP |
| 6. Identity | What professional life are you beginning? | One of four orientations, name, one or two player-selected traits when available, optional ambition | Class restriction, automatic appointment, guaranteed opportunity, quest obligation |

The sequence remains five authored Life Events plus final identity data. Do not add simulated childhood turns or persist routine childhood activity.

## 4. Attribute development proposal

Attributes are established at character creation under the GDD and are relatively stable. They should reflect the character's life rather than be selected through point-buy.

**Proposed rule:** Chapter 2 supplies one primary developmental emphasis; Chapter 3 supplies one secondary emphasis. Chapter 1, Chapter 4, and orientation do not grant attribute increases. This avoids making household origin or professional orientation a proxy for innate ability.

| Choice | Primary emphasis proposed | Rationale |
|---|---|---|
| RS-01 Count or measure | Precision | Repeated counting, comparing, and measuring require careful handling of quantities. |
| RS-02 Help with deliveries | Perception | Tracking handovers, movement, and changing circumstances depends on noticing relevant details. |
| RS-03 Judge materials or quality | Perception | Recognizing condition and differences in materials is primarily observational. |
| RS-04 Observe a record or seal | Reasoning | The character observes how a mark or record relates to a transaction or responsibility; this is not literacy. |
| FE-01 A quantity did not match | Reasoning | A discrepancy prompts comparison and consideration of competing explanations. |
| FE-02 You were blamed unfairly | Composure | The experience concerns responding to pressure and disputed responsibility. |
| FE-03 You helped settle a disagreement | Expression | The character participated in clarifying accounts and communicating between people. |
| FE-04 You were trusted with an adult responsibility | Composure | The experience concerns carrying responsibility under expectation and scrutiny. |

These are developmental emphases, not claims that an event permanently changes innate capacity. They should influence the initial attribute profile modestly, not create a specialist build.

**Numerical values remain OPEN.** The six-attribute scale and action-resolution formula are not approved. Do not invent a point budget, attribute range, or modifier size. Before numerical calibration, Engineering and Design HQ must test the current action/evidence requirements and identify whether missing attributes are safely supported. The current engine's missing-value behavior must not be replaced with silent zeroes.

## 5. Skill development proposal

Familiarity and skill remain distinct. Familiarity describes exposure; skill describes learned competence.

**Proposed rule:** Chapter 5 is the only character-creation chapter eligible to establish a starting skill-development basis. It records the specific supervised practice and may grant a small, explicit amount of skill experience once its amount and thresholds are approved. It does not award Career XP or automatically purchase a skill level.

| Instruction choice | Candidate skill basis | Boundary |
|---|---|---|
| TR-01 Quantities and commodity notation | Recordkeeping & Accounts | Barley and beer notation remain separate familiarity scopes. No universal numeracy or general reading competence. |
| TR-02 Clay, stylus, and tablet preparation | Writing & Composition only to the extent that the authored lesson includes making marks | Material handling alone is not writing competence. |
| TR-03 Signs and category lists | Reading & Scripts; Writing & Composition only if reproducing signs is part of the authored practice | Limited practiced signs/categories, not fluent literacy or ordinary prose. |
| TR-04 Checking and organizing records | Recordkeeping & Accounts; Analysis & Research only where the selected scope includes comparison/inference | Narrow record type and context; no general investigative qualification. |

The approved Life Event and familiarity content remains the source of truth for what was practiced. If a proposed skill mapping is not supported by the exact authored event, omit that skill rather than infer it.

**Numerical skill XP and starting skill levels remain OPEN.** The current skill scale is 1–10; skill XP establishes eligibility and Career XP is separately invested to raise levels. Do not start a character at level 2 merely because they selected an instruction vignette. The initial package should preserve the distinction between a supervised practice history, skill XP eligibility, purchased skill level, and qualification.

## 6. Non-numerical consequences are real consequences

The following are approved or proposed state effects and must not be dismissed as flavor:

- **Household and social origin:** establish the character's relevant social context without inventing a universal household model.
- **Life Events:** preserve the five authored experiences, their chronology, confidence, participants, and fallback summaries.
- **Familiarity:** preserve only explicit domain/scope/exposure facts and their provenance. Familiarity may later shape recognition, interpretation, confidence, or oversight; it is not a numerical action modifier.
- **Relationships:** persist factual, directional history where supported. Do not invent numeric trust, affection, respect, resentment, or obligation.
- **Professional entry:** preserve who introduced, recommended, sponsored, or trained the character and why. Roles remain distinct.
- **Opportunity channels:** a contact may provide a specific introduction or invitation when an authored opportunity supports it. Orientation may shape likely professional context. Neither creates exclusive access or guarantees an offer.
- **Knowledge:** establish only what the character plausibly learned or witnessed. Do not equate seeing a seal/tablet with reading it or knowing the underlying transaction.
- **Habits:** a formative event may support an interpretive tendency candidate. Do not persist a habit as a personality trait until a distinct habit model and effects are approved.
- **Traits:** the player chooses one or two from an approved catalog. Until that catalog exists, retain the approved visible/inactive placeholder; do not invent IDs or effects.
- **Ambition:** optional narrative aspiration only. No quest, obligation, progression track, or guaranteed opportunity.

## 7. Orientation and parity

Government, Military, Religious, and Merchant remain professional orientations, not classes. Their effect is contextual: the closing biography, initial professional framing, and plausible opportunity/contact channels.

No orientation grants a numerical attribute or skill bonus, formal affiliation, appointment, authority, qualification, or exclusive access. Government and Religious contexts may overlap. Era I Military content remains historically restrained: custody, transport, security, or mobilization contexts only where specifically authored; no invented standing army, military bureaucracy, combat skill, or military appointment.

All orientations receive the same Storehouse Reckoning evidence, required fields, assessment criteria, formal authority, and tutorial progression. Background may affect situated interpretation only through justified knowledge and familiarity; objective evidence remains identical and visible.

## 8. Common opening package — recommendation

The following is the recommended common *structural* baseline, not a numerical balance approval:

- `lifeStage: apprentice`; no starting age until separately approved.
- `scribal.stage: initialized`; selected `careerPath`.
- Career XP: 0 at creation; creation awards none.
- Historical Progress XP: 0.
- No appointment, formal authority, specialization, qualification, or institutional affiliation unless an explicit authored fact supports it.
- No starting obligations unless an authored agreement or duty explicitly establishes one.
- No starting stress or condition caused merely by biography.
- No inherited equipment or household wealth inferred from origin.
- Provisions: 5, as established by GDD §3.3.
- Money: proposed 0 pending owner approval; do not copy Enlil-barni's 12.
- Skills and attributes: resolved only by the approved life-history model; empty maps are a valid technical initialization state, not a claim that the character has no human capabilities.
- Professional reputation: use the approved neutral baseline only after its scale and meaning are confirmed; do not copy Enlil-barni's values as biography.
- Traits and ambition remain placeholders until their content contracts are approved.

The existing Enlil-barni values are legacy bootstrap data, not a canonical apprentice template. They must not be copied wholesale.

## 9. Technical boundary and immediate Production direction

The current `InitializedScribalCharacterState` permits partial skill and attribute maps, and the current Enlil-barni initializer itself uses `skills: {}` and `attributes: {}`. The validator checks the initialized state shape; it does not require every skill or attribute to have a numeric value. Therefore, the absence of approved numerical starting skills/attributes is **not by itself a reason to stop the resolver, biography read model, or their tests**.

Production should:
1. Continue the independent resolver/read-model work in PR #70 and execute the tests already written.
2. Keep new-game bootstrap integration isolated behind a starting-state input/factory; do not hardcode Enlil-barni's numerical values into the created Person.
3. Preserve the current approved content map exactly. Do not implement the proposed attribute/skill effects until this proposal is approved and the numerical dependencies are resolved.
4. Report which fields the actual bootstrap and tutorial require, distinguishing required structural fields from values that are merely inherited from the old fixture.
5. Audit all consumers of the active character's skills, attributes, rank, reputation, wallet, stress, equipment, and career path before proposing any fallback.
6. Keep the naming catalogue/custom-name validation and seed boundary as separate dependencies. The seed/ID algorithm is Production-owned; the naming policy is a content/design dependency.
7. Do not change the tutorial's evidence, authority, assessment, or progression to accommodate a background.

The implementation may proceed with a test fixture that has a structurally valid initialized scribal state and empty skill/attribute maps. It must not ship an arbitrary player-facing starting package under the guise of a technical default.

## 10. Required design/QA validation before numerical approval

- Compare the proposed attribute mappings against representative tutorial and early Assignment actions; reject mappings that do not meaningfully affect the intended action.
- Confirm that no chapter grants the same attribute emphasis twice in a way that creates an unintended dominant build.
- Confirm each instruction choice maps only to skills genuinely practiced in its authored event.
- Confirm no character reaches an implausible rank from starting skills under the current provisional rank formula; do not treat that formula as canon.
- Confirm all four orientations remain viable and have equal access to the common tutorial.
- Confirm the same seed, name, choices, orientation, and content version produce the same full starting state.
- Confirm the player can inspect the exact reason for each starting attribute/skill effect in the final review.
- Test all 3,328 valid choice combinations and the four curated profiles, plus boundary combinations for each attribute and skill mapping.
- Verify legacy saves remain unchanged and no history is synthesized for existing characters.

## 11. Approval boundary

Approval of this proposal would authorize Design HQ to finalize the Era I starting-state contract and amend the affected handoff documents. It would **not** approve:
- exact attribute values, scales, or action-resolution formulas;
- exact starting skill XP or skill levels;
- starting age;
- trait catalog/effects or habit mechanics;
- ambition mechanics;
- money or reputation values;
- new institutions, NPCs, appointments, obligations, or tutorial variants;
- changes to the GDD or Decision Register.

Those remain separate decisions. Production implementation is authorized only after the resulting contract is explicitly marked **APPROVED — READY FOR IMPLEMENTATION**.

## 12. Cross-department impact

- **Game Design:** owns the chapter-to-state mapping and numerical starting package.
- **Historical Research:** validates the historical claims and ensures instruction-to-skill mappings do not overstate literacy, numeracy, or institutional structure.
- **Engineering & Architecture:** verifies consumers, validation, deterministic construction, and legacy compatibility; owns technical types and migration.
- **Art & UI/UX:** displays chapter consequences and a readable final character review; no physical avatar editor is required.
- **Audio:** No material impact.
- **Production & QA:** continues resolver validation and prepares a complete bootstrap-consumer audit; does not invent unresolved values.

## Recommendation

Approve the **life-history-derived construction model** in principle. Keep exact numbers open until the actual Era I action requirements and provisional rank behavior have been tested. This preserves the Bannerlord-inspired design without turning character creation into arbitrary stat allocation or allowing Production to fossilize Enlil-barni's legacy build.
