# Design Investigation 02A — Uruk Character-Creation Content Matrix

**Status:** Proposal for Game Director review; not approved or canonical  
**Date:** 2026-11-23  
**Scope:** Player-facing life-history sequence and deterministic starting-state content for the Era I Uruk opening  
**Authority:** `docs/GDD.md` remains the canonical design source. This document does not revise it.  
**Implementation:** None. No production code, save schema, or runtime content is changed by this proposal.

## 1. Design intent

Use a Bannerlord-like sequence of life-history chapters, not a class/build screen. The player is answering:

> What kind of life has this person lived, and how has that life brought them to the profession of scribe?

The choices establish a person who already exists in the world. They are not a blank avatar, a bundle of bonuses, or a modern occupational class transplanted into Uruk.

The resulting character should have:
- An identifiable household and social context.
- A small number of remembered experiences represented as Life Events.
- Practical familiarity grounded in those experiences.
- A plausible route into scribal training, with actual people and relationships.
- A modest, coherent record of early professional practice.
- One of the four GDD career paths as an initial professional orientation.
- One or two player-selected starting personality traits.
- A deterministic opening position in the existing world.

The sequence should not assign numerical attribute or skill values until the rank/action-resolution dependencies have been tested. It should not grant expertise merely because a character was exposed to a task.

## 2. Historical confidence key

- **Attested:** Directly supported by archaeological or textual evidence for the period, while retaining the limits of the surviving sample.
- **Inferred:** A cautious interpretation of attested evidence, social organization, or material practice.
- **Reconstruction:** A playable human-scale detail authored to make a plausible life, but not directly documented by the surviving Uruk evidence.

Important limitation: most surviving Uruk IV administrative texts concern the operations of central decision-making bodies. They tell us much more about recorded commodities and institutional transactions than about the childhood, family life, or training histories of individual scribes. The options below are therefore deliberately marked as reconstructions where appropriate. They should not be presented in-game as recovered biographies.

## 3. Proposed player sequence

### Chapter 1 — Where did you grow up?

**Player-facing question:** “Before you learned to work with tablets, whose work did you grow up around?”

The player chooses a formative household environment, not a social class or permanent occupation. The household may be in Uruk or outside the city; an outside origin should be available only where the world initialization can establish a credible move/contact into Uruk.

| Choice | Player-facing description | Confidence | Starting state created |
|---|---|---|---|
| Provisioning and food preparation | “The household's days were shaped by grain, food preparation, storage, and the movement of provisions.” | Inferred / Reconstruction | Household identity; familiarity with provisioning contexts and food commodities; one or more household contacts. |
| Fields and herds | “Much of the work you knew began beyond the crowded streets: fields, animals, seasonal tasks, and bringing produce where it was needed.” | Inferred / Reconstruction | Household identity; familiarity with agricultural or pastoral contexts and seasonal labor; a household contact. |
| Skilled production | “You grew up around people who shaped useful things, judged materials, and learned how much work a finished object concealed.” | Inferred / Reconstruction | Household identity; familiarity with one authored craft/material domain; a household contact. |
| Exchange and transport | “You knew the work of moving goods: deliveries, routes, quantities, handovers, and the people waiting at the other end.” | Inferred / Reconstruction | Household identity; familiarity with movement, delivery, and exchange contexts; a household contact. |

**Guardrails**
- These are not four castes, classes, or mutually exclusive ancient social categories. They are player-readable emphases within a household's working life.
- A household may have several activities; the selected option identifies the work most formative to this character.
- Do not imply that every household was a nuclear family, an isolated economic unit, or a formal institution. Household organization in early Mesopotamia is debated; the household model is a useful interpretive lens, not a settled universal description.
- Do not make the provisioning background the default “poor” path or craft/exchange backgrounds more prestigious. Each must offer a distinct kind of familiarity and social contact, not a better starting build.
- Do not add an “institutional dependent” origin until targeted research establishes what relationship and household form the option would actually represent.

### Chapter 2 — What work were you trusted to do?

**Player-facing question:** “When you were old enough to be useful, what did people begin to trust you with?”

| Choice | Player-facing description | Confidence | Starting state created |
|---|---|---|---|
| Count or measure | “You were asked to count, compare, or measure things that someone else needed to account for.” | Inferred / Reconstruction | A Life Event recording repeated practical responsibility; familiarity with quantities and the relevant commodity context. |
| Help with deliveries | “You learned who was expecting a delivery, what had to travel, and what could go wrong between handover and arrival.” | Inferred / Reconstruction | Familiarity with delivery and custody contexts; a contact beyond the immediate household may be established if authored. |
| Judge materials or quality | “You learned to notice when material, workmanship, or condition did not match what was expected.” | Inferred / Reconstruction | Familiarity with a selected material/quality domain; a habit candidate such as close inspection may be recorded, but not automatically assigned as a personality trait. |
| Coordinate a small task | “People began relying on you to remember who was doing what and whether the work had been finished.” | Reconstruction | Familiarity with coordination and responsibility; a Life Event with the people involved. |
| Observe a record or seal in use | “You watched someone use a mark, seal, token, or tablet to make a transaction or responsibility recognizable.” | Inferred / Reconstruction | Familiarity with a specific information or authorization practice. This does not grant reading or writing skill. |

**State rules**
- A single selected vignette creates one authored Life Event. Repeated-responsibility language may create a small number of linked events only if the content explicitly represents repeated practice.
- Familiarity records what the character has encountered and in what context. It is not a skill level, qualification, appointment, or authority.
- Do not infer literacy from seeing a tablet, seal, or mark. Recognition of a material object is not the same as reading its notation.
- If a relationship is created, its initial dimensions must follow the actual event. Kinship or repeated contact may establish familiarity; it does not automatically establish trust, affection, respect, or obligation.

### Chapter 3 — What changed how you saw the world?

**Player-facing question:** “Was there a moment that changed what you paid attention to?”

| Choice | Player-facing description | Confidence | Starting state created |
|---|---|---|---|
| A quantity did not match | “A quantity everyone relied on turned out not to match what had actually been received or used.” | Reconstruction grounded in administrative context | Life Event; familiarity with discrepancy and comparison; possible relationship history with the person involved. |
| You were blamed unfairly | “You were held responsible for a mistake you did not believe was yours.” | Reconstruction | Life Event; a specific directional relationship history entry if another person was involved; possible habit candidate of caution about attribution. |
| You helped settle a disagreement | “Two people remembered an agreement differently, and you helped establish what each had actually seen or promised.” | Reconstruction | Life Event; familiarity with testimony and competing accounts; relationship history with participants. |
| You were trusted with an adult responsibility | “Someone gave you responsibility before others thought you were ready.” | Reconstruction | Life Event; a relationship event with the person who trusted you; possible habit candidate concerning responsibility. |
| Household difficulty forced adaptation | “A difficult season or loss of resources changed how your household divided its work.” | Inferred / Reconstruction | Life Event; changed household circumstance at the time; familiarity with adaptation and resource pressure. It must not create a permanent current hardship unless the authored opening state supports it. |

**Guardrails**
- The event should shape memory and interpretation, not predetermine a moral identity or future answer.
- A habit is an interpretive tendency derived from experience, not a verdict. It may influence what the character notices or initially suspects; it must never alter or conceal objective evidence.
- Do not automatically convert a formative event into a permanent personality trait. The player chooses one or two initial traits in the final identity step; emergent traits require meaningful play.

### Chapter 4 — How did you enter scribal training?

**Player-facing question:** “How did the chance to learn the work of a scribe come to you?”

| Route | Player-facing description | Confidence | Starting state created |
|---|---|---|---|
| Household introduction | “Someone who knew your household introduced you to a person involved in scribal work.” | Reconstruction | A named introducer and a named training contact; an evidenced relationship route, not automatic affection or trust. |
| Recommendation through practical work | “Someone noticed how you handled a responsibility and recommended that you be given a chance to learn.” | Reconstruction | Recommender tied to the earlier Life Event; a reason for the recommendation; possible expectation or obligation only if explicitly stated. |
| Institutional need | “An office or working group needed a dependable assistant, and you were brought in to learn by helping.” | Inferred / Reconstruction | A specific institutional context and contact; no assumption of a modern formal recruitment office or centralized school. |
| Unexpected encounter | “A delivery, disagreement, or other piece of work brought you into contact with someone willing to teach you.” | Reconstruction | A contact whose identity and reason for involvement are recorded; route must connect to the earlier history or an authored world event. |

**Critical historical caution**
Nissen's suggestion that the economic administration also recruited and trained the next generation of administrators is explicitly a reconstruction: he notes that there is no direct evidence for such “schools.” This design may portray instruction and transmission of expertise, but must not state that a formal Uruk scribal academy, standardized apprenticeship contract, or universal school system is archaeologically established.

**State rules**
- The trainer/mentor must be an actual Person in the shared world model, with a stable PersonId.
- A recommender and a trainer may be the same person, but the relationship route and the teaching relationship remain distinct facts.
- A recommendation records why the person acted. It does not create trust, affection, or a debt unless the authored event establishes those.
- Any obligation must be explicit, scoped, and based on an identifiable agreement, event, or other supported basis. Never silently deduct AP or create an unspoken debt.

### Chapter 5 — What did you learn first?

**Player-facing question:** “What part of the work did your early instruction make familiar?”

The player selects one primary emphasis. It represents actual supervised practice, not a complete curriculum or a modern subject specialization.

| Training emphasis | Player-facing description | Skills genuinely practiced | Familiarity / limits |
|---|---|---|---|
| Quantities and commodity notation | “You practiced recording quantities beside the goods they described, and learned that a number only made sense in its proper system.” | Recordkeeping & Accounts; potentially Reading & Scripts where signs were actually recognized | Familiarity with one authored commodity and numerical context. No universal numeracy bonus. |
| Clay, stylus, and tablet preparation | “You learned how clay behaved, how a tablet was prepared, and how marks had to be made to remain legible.” | Writing & Composition only where the character actually made marks; otherwise no automatic core-skill award | Material familiarity with clay/tablet preparation. This is not equivalent to reading or composing a complete text. |
| Signs and category lists | “You practiced recognizing and reproducing a limited set of signs and categories used in the work around you.” | Reading & Scripts and Writing & Composition, at novice practice level only | Familiarity with the practiced sign/category set. Do not imply fluent language literacy or the ability to write ordinary speech. |
| Checking and organizing records | “You helped compare entries, keep related information together, and notice when two accounts did not agree.” | Recordkeeping & Accounts; Analysis & Research only where comparison and inference were practiced | Familiarity with one record type and the context in which it was used. |
| Listening and explaining | “You learned by listening to instructions, repeating them accurately, and explaining a task to someone else.” | Communication & Instruction | Familiarity with the relevant oral procedure. No general authority to instruct or supervise. |
| Comparing sources | “You were taught not to rely on one account when another source could confirm or challenge it.” | Analysis & Research; potentially Recordkeeping & Accounts if actual entries were compared | Familiarity with comparison and source differences. Do not make the character a modern investigator. |

**Authoring rules**
- The selected emphasis creates a training Life Event with a trainer, setting, subject, and actual practice described.
- Award skill experience only for the skill(s) genuinely practiced. Do not award Career XP or a specialization automatically merely for selecting a childhood/training vignette.
- The exact starting skill levels, skill XP, and attribute values remain unassigned until the skill-to-rank and action-resolution tests are complete.
- The historical content should reflect the early administrative and proto-cuneiform environment: economic notation, quantities, categories, and material practices. Avoid modern ideas of essays, fluent prose composition, alphabetic reading, or a standardized school syllabus.
- Training may include more than one skill over time, but the player-selected emphasis is the strongest remembered focus, not a claim that all other learning was absent.

### Final identity — What kind of person have you become?

This is the player's final authorship step, not another occupational class selection.

1. **Initial career path / professional orientation:** choose one of the four GDD paths after seeing the life history. The path frames the kind of institutional work and contacts the character is entering; it is not a caste, exclusive membership, or permanent restriction.
2. **Personality:** choose one or two initial traits from the approved trait catalog when that catalog is authored. Do not invent a temporary catalog just to fill the screen.
3. **Name:** choose or confirm a name from an era-appropriate naming pool. Human-readable names remain an explicit readability liberty; do not imply that every name is archaeologically attested.
4. **Ambition (optional):** choose a personal hope or professional aspiration as narrative context. It is not a new progression track, quest obligation, or guaranteed opportunity.
5. **Review:** show the resulting biography, household context, Life Events, contacts, familiarity, training, and orientation. Allow the player to revisit choices before finalizing.

## 4. Four career paths in Uruk: provisional local interpretation

The GDD's four paths remain. Their Era I implementation should describe overlapping professional orientations, not four modern ministries or fully separate scribal corps.

| GDD path | Cautious Uruk-facing interpretation | Starting emphasis | Historical confidence / open risk |
|---|---|---|---|
| Government | Administrative coordination and the management of institutional work, goods, or labor | Contact with an administrative setting and familiarity with coordination or accounts | Inferred from administrative records. Avoid projecting a later state bureaucracy or a modern civil service. |
| Religious | Work connected with cultic institutions, offerings, ceremonial goods, and their administration | Contact with a cultic/temple context where authored evidence supports it | Inferred; the relationship between economic administration, cult, and political authority is not cleanly separable in this period. |
| Merchant | Exchange, movement of goods, deliveries, and relationships between producers, carriers, and recipients | Contact with exchange or delivery networks | Inferred from commodity movement and wider networks; avoid projecting later merchant houses or commercial law. |
| Military | Organized security, mobilization, or logistical responsibilities associated with armed activity | Contact with a specific, historically supported person or institution; no combat skill or military command | **Weakest evidence as a distinct scribal career path in c. 3200 BCE.** Preserve the GDD path provisionally, but do not invent a standing military bureaucracy or a dedicated military scribal school. Targeted research is required before detailed content is authored. |

**Shared access rule:** all four paths can encounter institutions associated with other orientations. The path changes starting context, relationships, responsibilities, and likely opportunities; it does not create exclusive access.

## 5. Deterministic state-construction contract

Character creation must produce one coherent existing-world Person. It should not create a disconnected player-only character object.

### State to establish

| State element | Source in choices | Proposed handling |
|---|---|---|
| Person identity | Final name and generated biography | Existing shared `Person` identity; player control remains a control flag/state reference, not a second Person model. |
| Household | Chapter 1 | New household/social-identity data is required; current `Person` has no household field. Do not misuse institutional `affiliations` as household membership. |
| Life History | Chapters 1–5 | Append-only, typed Life Events with stable IDs, dates, participants, and provenance. This is not currently represented as a dedicated history collection in the visible Person schema. |
| Relationships | Named household contacts, recommender, trainer, formative-event participants | Use existing directional relationship dimensions and history. Structural ties must not imply affection or trust. |
| Familiarity | Actual repeated or supervised experience | Requires a distinct domain-familiarity model; do not encode it as a relationship's social familiarity dimension or as a skill. |
| Habits | Formative event and repeated experience | Add only if the event supports a stable interpretive tendency; no automatic trait conversion. |
| Skill experience | Chapter 5 practice | Record eligible practice/experience only after skill attribution is validated. Do not set numerical levels in this proposal. |
| Attributes | Character creation rules | Not assigned by this matrix. GDD says attributes are established at creation and relatively stable; exact values and derivation remain open. |
| Career path | Final identity | Existing `ScribalCharacterState.careerPath` field is available; its starting benefits and downstream effects remain open. |
| Appointment / authority | None automatically | A path, mentor, recommendation, or training event grants no appointment or formal authority. |
| Commitments / obligations | Only explicit authored agreement or duty | Create only with identifiable basis, scope, and status. A sponsor is not automatically a creditor. |
| Equipment / resources | Authored opening circumstances | Do not award special tools, money, or provisions from household background without a separate balance and historical review. |
| Opening world | All prior choices plus world seed and authored rules | Deterministic initialization; no random roll that can kill, displace, or invalidate the player before control begins. |

### Existing implementation observations

The current main-branch model already provides:
- A shared `Person` identity for player and NPCs; `CharacterId` is an alias of `PersonId`.
- `lifeStage`, `socialIdentity`, `circumstances`, `objectives`, `commitments`, and optional `scribal` state on `Person`.
- Directional, multi-dimensional relationships with history.
- `careerPath` on `ScribalCharacterState`.
- A deterministic `createNewGameState()` bootstrap that currently creates a fixed initial character and then applies the tutorial and starter Challenge.

The current visible schema does **not** yet provide a dedicated household, Life Event history, domain familiarity, or habit model. These are model gaps to design, not fields this proposal assumes already exist. Do not implement them as an unrelated parallel character system.

## 6. Three contrasting character tests

These are authored test profiles, not canonical named NPCs. Their purpose is to check whether life history creates distinct people without creating unequal classes or bonus packages.

### Test A — Provisioning-household apprentice

- **Origin:** provisioning and food preparation.
- **Early responsibility:** count or measure goods.
- **Formative event:** a quantity did not match.
- **Training route:** recommendation through practical work.
- **Training emphasis:** quantities and commodity notation.
- **Orientation:** Government.
- **Likely familiarity:** grain/provisions, quantities, storage or distribution context, discrepancy comparison, limited commodity notation.
- **Likely relationships:** household contact, recommender, trainer; each relationship has a specific basis.
- **Not granted:** authority over stores, mastery of accounting, automatic trust from the steward, or an appointment.

### Test B — Skilled-production household apprentice

- **Origin:** skilled production.
- **Early responsibility:** judge materials or quality.
- **Formative event:** household difficulty forced adaptation.
- **Training route:** unexpected encounter through a delivery or work interaction.
- **Training emphasis:** clay, stylus, and tablet preparation.
- **Orientation:** Religious (provisional example only; the path must be justified by the actual institutional contact, not by the household's craft identity).
- **Likely familiarity:** one or more production materials, workmanship/condition, clay handling, preparation of tablets.
- **Likely relationships:** household contact, person who noticed the work, trainer.
- **Not granted:** broad literacy, specialist craft qualification, religious office, or higher starting wealth.

### Test C — Field- or transport-connected apprentice

- **Origin:** fields and herds **or** exchange and transport; use one as the primary test and the other as a sensitivity variant.
- **Early responsibility:** help with deliveries.
- **Formative event:** helped settle a disagreement.
- **Training route:** household introduction.
- **Training emphasis:** comparing sources.
- **Orientation:** Merchant.
- **Likely familiarity:** seasonal or delivery context, handovers, people and places connected by movement, comparison of accounts or testimony.
- **Likely relationships:** household contact, introducer, trainer, and at least one person involved in the disagreement.
- **Not granted:** commercial authority, ownership of transported goods, or automatic access to every merchant contact.

### Comparative acceptance criteria

The three profiles pass only if:
1. Each has a distinct biography and at least one genuinely different domain familiarity.
2. Their opening actions differ in plausible ways, but none is universally stronger.
3. No profile receives an unearned appointment, authority, qualification, specialization, or high skill level.
4. All can engage with the introductory tutorial and its objective evidence on the same terms.
5. The character's interpretation may differ because of familiarity and actual practice, but the evidence itself is identical and complete.
6. The same seed and same choices produce the same person, relationships, history, and opening world.
7. Different paths alter initial contacts and likely opportunity channels without blocking cross-path play.
8. The Military path is not treated as a balanced, fully evidenced option until the historical gap is researched.

## 7. Tutorial compatibility

The Storehouse Reckoning remains the fixed introductory tutorial outside Assignments, Challenges, and Works, with zero Historical Progress XP. Character background may affect the character's situated interpretation, but must not change:
- The objective evidence supplied by the tutorial.
- The tutorial's required record fields or assessment criteria.
- The Senior Scribe's formal authority or disposition.
- The tutorial's progression rewards or Historical Progress XP.
- The tutorial's role as a common first supervised exercise.

A character familiar with provisioning or quantities may recognize the context more readily; that must not make the tutorial's evidence easier to obtain, hide evidence from other characters, or predetermine the assessment. The current runtime tutorial and starter Challenge are fixed in `src/state/newGameState.ts`; any future character-creation integration must preserve their authored identities and avoid silently changing their relationships or responsibilities.

## 8. GDD alignment and cross-track impact

### GDD alignment

- **§3.3–3.4:** Directly develops the player's Uruk origin, four initial career paths, attributes, skills, personality traits, and specializations.
- **§15.2–15.5:** Uses the persistent social network, shared Person model, era-specific institutions, and bounded deterministic world.
- **§23 items 8, 10, 13, 22, and 25:** Touches relationship detail, character transition connections, Era I institutions, complete character system, and situated interpretation.
- **§25 design summary:** Supports continuity through existing people and a world that continues independently of the player.

No locked invariant is contradicted. The proposal does not alter the six-AP Workday, the three gameplay layers, progression independence, the two-resource economy, succession rules, or the no-runtime-generative-AI boundary.

### Cross-department impact

- **Game Design:** Defines a life-history sequence and avoids class/build-screen framing. Starting mechanical parity still requires rank/action testing.
- **Historical Research:** Must verify household language, Uruk social organization, training routes, the four path interpretations, especially Military, and names.
- **Engineering:** Requires future design for household identity, Life Events, domain familiarity, habits, deterministic character/world initialization, and save migration. Existing Person model remains the foundation.
- **Art/UI:** Chapter-based vignette UI; no physical avatar editor required. Use period-appropriate clay, seals, counters, tools, commodities, and work settings. Do not depict later wedge-shaped writing or modern school desks in Era I.
- **Audio:** Optional light environmental and material cues for the vignettes; no separate audio system or expensive cinematic dependency.
- **Production/QA:** Author choice/state fixtures, deterministic seed tests, profile parity tests, tutorial invariance tests, and historical review gates.

## 9. Recommendation and decisions still required

**Recommendation:** adopt the life-history sequence as the working design direction, with the six stages above (five chapters plus final identity). Keep the matrix as authored Era I content under review, not as canonical GDD text yet.

Before implementation, the Game Director should approve:
1. The sequence and player-facing choice families.
2. Whether the four household environments are suitable as the first playable origin set.
3. Whether Military remains selectable in Era I pending targeted research, or is presented with an explicit provisional framing.
4. Whether the opening character's household and Life Events are authored as a bounded pre-play history in the world initialization pass.

Do not approve numerical starting attributes, skill levels, Career XP, or benefits from this document. Those require a separate balance/action-resolution test.

## 10. Research basis and limitations

1. Hans J. Nissen, “Uruk: Early Administration Practices and the Development of Proto-Cuneiform Writing,” *Archéo-Nil* 26 (2016), pp. 33–48. [Persée article](https://www.persee.fr/doc/arnil_1161-0492_2016_num_26_1_1102). Supports the importance of early administration, commodity movement, seals/counters, proto-cuneiform development, and the limited scope of surviving records. Nissen explicitly identifies the proposed “school before writing” as an assumption without direct evidence.
2. Jason Ur, “Households and the Emergence of Cities in Ancient Mesopotamia,” *Cambridge Archaeological Journal* 24:2 (2014), pp. 249–268. [Author-hosted PDF](https://jasonur.scholars.harvard.edu/sites/g/files/omnuum6996/files/jasonur/files/ur_2014_caj_households_and_the_emergence_of_cities.pdf). Offers a household-centered interpretive model and cautions against assuming an abrupt shift to rational bureaucracy. It is a model, not proof that every Uruk household had one fixed structure.
3. Digital Corpus of Cuneiform Lexical Texts, “The Archaic Administrative Corpus.” [ORACC](https://oracc.museum.upenn.edu/dcclt/intro/arch_intro.html). Summarizes the administrative character of the earliest writing and its commodity, labor, and land-management contexts.
4. Davide Domenici and Nicolò Marchetti (eds.), *Urbanized Landscapes in Early Syro-Mesopotamia* (2018), [open-access volume](https://site.unibo.it/eduu/en/work-package-1-archaeological-cultural-and-environmental-research/results/978-3-447-11086-0_free-open-access_.pdf). Provides context for Late Chalcolithic networks and proto-cuneiform, while noting that surviving written evidence is concentrated on central institutional operations.

The sources support the administrative and material contexts more strongly than the specific biographies, household experiences, or training routes. Most player-facing vignette details therefore remain authored reconstructions and must be presented as plausible lives, not documented facts.
