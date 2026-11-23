# Design Investigation 02A — Uruk Character-Creation Content Matrix

**Status:** Revised proposal for Game Director review; not canonical GDD text  
**Date:** 2026-11-23  
**Scope:** Cross-era character-creation framework, with Era I Uruk as its first historical expression  
**Authority:** `docs/GDD.md` remains the canonical design source. This document does not revise it.  
**Implementation:** Design documentation only. No production code, save schema, or runtime content is changed.

## 1. Design intent

*Scribe of Eras* is a historical RPG, not a comprehensive reconstruction or simulation of every society it visits. Character creation should make the player feel that they are taking up the life of a particular person in a credible historical setting. It should not require the player to understand the full institutional structure of that setting, nor should it create a separate character system for every era.

Use a life-history sequence inspired by games such as *Bannerlord*, rather than a conventional class/build screen. The central question remains:

> What kind of life has this person lived, and how has that life brought them to the profession of scribe?

The framework must be reusable across all seven eras. Its chapter structure and underlying concepts remain recognizable; the available choices, people, institutions, work, tools, and professional descriptions are authored for the era and location.

**Historical grounding should shape the content, not dictate the size of the simulation.** We need enough historical context to make each choice believable and consequential. We do not need a complete model of ancient household structures, labor administration, institutional jurisdictions, or every route by which a person could enter scribal work.

The character created is an existing person in the world, not a blank avatar or a collection of bonuses. Their history should establish:
- A recognizable origin and social context.
- A small number of meaningful formative experiences.
- Practical familiarity grounded in lived experience.
- A plausible route into scribal work, involving identifiable people.
- Some early professional practice.
- An initial professional orientation.
- One or two player-selected starting personality traits.
- A coherent opening situation and connections to the existing world.

Do not assign numerical attributes, skill levels, Career XP, or professional-rank benefits through this matrix. Those require the separate character balance and action-resolution work.

## 2. Design principles

### 2.1 One framework, era-specific expression

Use the same broad life-history questions throughout the game:
1. What kind of place and community did you grow up in?
2. What responsibilities did you take on?
3. What experience shaped how you see your work and other people?
4. How did you enter the profession of scribe?
5. What did you learn first?
6. What kind of professional life are you beginning?

These are narrative prompts, not mandatory simulation systems. A later era may express an origin through a family workshop, a monastery, a merchant household, a government office, a printing shop, or a digital workplace. The framework does not assume that every era has the same household structure, educational system, social categories, or professional institutions.

### 2.2 Professional orientation is a generalized player choice

The four GDD career paths—**Government, Military, Religious, and Merchant**—are broad professional orientations. They are not four historically universal institutions, castes, guilds, modern departments, or exclusive career classes.

When the player chooses one, explain:
- What kind of professional work the orientation generally represents across the game.
- What that orientation means in the current era and location.
- What kinds of people, responsibilities, and opportunities it is likely to bring the character into contact with.
- What it does **not** automatically grant: authority, appointment, qualification, rank, exclusive access, or mastery.

The underlying orientation can remain stable across eras while its local expression changes. For example, Government may mean institutional administration in Uruk, a royal or civic administrative service in another period, and a state department or public records office in a later one. The game should explain the local meaning at the moment of choice rather than expect the player to infer it from a historical label.

### 2.3 History creates texture and context, not exhaustive simulation

Historical research should establish the credible range of people, work, materials, institutions, and relationships available to the author. The game then selects the details needed to create a coherent and interesting character.

Do not build:
- A complete Uruk household or kinship simulator for character creation.
- A universal social-class ladder.
- A detailed institutional hierarchy solely to justify a starting path.
- A formal scribal school or standardized apprenticeship system without evidence.
- A standing military bureaucracy to make the Military orientation look symmetrical.
- A numerical bonus for every biographical choice.

A few well-authored relationships and responsibilities are more valuable than a large network of weakly justified entities.

## 3. Historical confidence and presentation

Use these labels in internal research and content review:

- **Attested:** A relevant object, text, architectural feature, or image is directly present in the archaeological record for the period. Attestation of an object does not automatically prove its interpretation.
- **Inferred:** A cautious interpretation supported by evidence or scholarly reconstruction, but not directly recorded in the form used by the game.
- **Reconstruction:** A specific person, biography, relationship, procedure, or playable event authored to make a plausible human story. It must not be presented as a documented historical event or universal practice.
- **Unsupported / reject:** The claim exceeds available evidence or imports a later institution or practice without justification.

The surviving Uruk IV administrative record tells us much more about commodities and institutional transactions than about the childhood, family life, or training histories of individual scribes. Most specific life-history vignettes will therefore be authored reconstructions. That is acceptable for a historical RPG, provided they are plausible and are not falsely presented as recovered biographies.

The player-facing experience should not be cluttered with scholarly confidence labels. Historical uncertainty belongs in the content's research record and in the wording of the fiction where it matters. Use qualified descriptions rather than turning every choice into a lecture about archaeological uncertainty.

## 4. Proposed life-history sequence: Era I expression

The following choices are an initial content set for Uruk c. 3200 BCE. They are not claims that these were formal social categories or standardized life stages. They provide distinct, readable routes into the character's professional life.

### Chapter 1 — What kind of world did you grow up in?

**Player-facing question:** “Before you learned to work with tablets, what kind of work and people shaped your world?”

The player chooses a formative environment. Avoid presenting the options as castes, fixed occupations, or mutually exclusive ancient household types.

| Origin emphasis | Player-facing description | Historical basis | Character context created |
|---|---|---|---|
| Food and provisioning | “You grew up around the work of preparing, storing, and moving food. You learned how much effort sits behind an apparently simple allocation.” | Inferred / Reconstruction | Familiarity with provisions, storage, distribution, and people involved in supplying others. |
| Fields and herds | “Much of the work you knew began beyond the city: fields, animals, seasonal tasks, and bringing produce where it was needed.” | Inferred / Reconstruction | Familiarity with agricultural or pastoral work, seasonal conditions, and connections between producers and recipients. |
| Skilled making | “You grew up around people who shaped useful things, judged materials, and knew how much work a finished object concealed.” | Inferred / Reconstruction | Familiarity with one authored craft or material context, workmanship, and production relationships. |
| Exchange and movement | “You knew the work of moving goods: deliveries, routes, quantities, handovers, and the people waiting at the other end.” | Inferred / Reconstruction | Familiarity with transport, delivery, exchange, and relationships between counterparties. |
| Institutional service | “People close to you worked in or around a larger institution, where resources and responsibilities had to be organized.” | Inferred / Reconstruction; use only with a specific authored context | Familiarity with an institutional environment and its people. Do not imply a universal institutional household or a modern employer/employee relationship. |

**Authoring guardrails**
- The selected option is the strongest influence on the character, not the only work their household or community performed.
- An origin outside Uruk is possible only when the authored character history establishes a credible route into the opening setting.
- Do not make one origin the default poor path or another the prestigious path. Origins should create different contacts and familiarity, not a better build.
- “Institutional service” is a contextual option, not a new social class. Include it only when a specific relationship and circumstance can be authored.
- Do not force every character into a modern nuclear-family model. Use a household, kin group, work group, or other relevant social context as the particular biography requires.

### Chapter 2 — What responsibilities did you take on?

**Player-facing question:** “When you were old enough to be useful, what did people begin to rely on you to do?”

| Responsibility | Player-facing description | Context created |
|---|---|---|
| Count or measure | “You were asked to count, compare, or measure things that someone else needed to account for.” | Familiarity with quantities and a relevant commodity or measurement context. |
| Help with deliveries | “You learned who was expecting a delivery, what had to travel, and what could go wrong between handover and arrival.” | Familiarity with movement, custody, and delivery relationships; possibly a contact beyond the immediate household. |
| Judge materials or quality | “You learned to notice when material, workmanship, or condition did not match what was expected.” | Familiarity with one material or quality domain; possible habit of close inspection, not an automatic personality trait. |
| Coordinate a small task | “People began relying on you to remember who was doing what and whether the work had been finished.” | Familiarity with coordination and responsibility; named participants where relevant. |
| Observe a record or seal in use | “You watched someone use a mark, seal, token, or tablet to make a transaction or responsibility recognizable.” | Familiarity with a specific record, marking, or custody practice. Seeing a record does not grant literacy. |

A selected vignette creates one concise Life Event. If the text describes repeated practice, the event may record that repetition; do not simulate every instance. Familiarity is experience with a domain or practice, not a skill level, qualification, appointment, or authority.

### Chapter 3 — What experience changed how you see the world?

**Player-facing question:** “Was there a moment that changed what you paid attention to?”

| Formative experience | Player-facing description | Context created |
|---|---|---|
| A quantity did not match | “A quantity everyone relied on turned out not to match what had actually been received or used.” | Experience with discrepancy and comparison; relationship history with a participant where relevant. |
| You were blamed unfairly | “You were held responsible for a mistake you did not believe was yours.” | A remembered dispute and a specific relationship history; possible caution about assigning blame. |
| You helped settle a disagreement | “Two people remembered an agreement differently, and you helped establish what each had actually seen or promised.” | Familiarity with competing accounts and the people involved. |
| You were trusted with an adult responsibility | “Someone gave you responsibility before others thought you were ready.” | A meaningful relationship event and experience of responsibility. |
| Your circumstances changed | “A difficult season or loss of resources changed how the people around you divided their work.” | A past circumstance and familiarity with adaptation. Do not impose a current hardship unless the opening situation supports it. |

The event should shape memory and interpretation, not predetermine a moral identity or future answer. A habit may be recorded when the experience supports a stable interpretive tendency. It must not alter or conceal objective evidence. Do not automatically convert a formative event into a permanent personality trait.

### Chapter 4 — How did you enter the profession of scribe?

**Player-facing question:** “How did the chance to learn the work of a scribe come to you?”

| Route | Player-facing description | Context created |
|---|---|---|
| Someone introduced you | “Someone who knew you or your work introduced you to a person involved in keeping records.” | A named introducer and a named professional contact, with a clear basis for the connection. |
| Your work earned a recommendation | “Someone noticed how you handled a responsibility and recommended that you be given a chance to learn.” | A recommender connected to an earlier event and a reason for the recommendation. |
| You were needed as an assistant | “A group or institution needed a dependable assistant, and you were brought in to learn by helping.” | A specific work context and contact. Do not imply a modern recruitment office or centralized school. |
| An encounter opened a door | “A delivery, disagreement, or other piece of work brought you into contact with someone willing to teach you.” | A professional contact connected to the earlier life history or a plausible authored event. |

The trainer or mentor must be an actual Person in the shared world, not a character-creation-only placeholder. A recommender and trainer may be the same person, but the recommendation and teaching relationship are distinct facts.

Nissen's suggestion that economic administration recruited and trained later administrators is explicitly a reconstruction; he notes there is no direct evidence for such schools. The game may portray instruction and transmission of expertise, but must not claim that a formal Uruk scribal academy, standardized apprenticeship contract, or universal school system is archaeologically established.

A recommendation does not automatically create trust, affection, respect, or debt. Any obligation must have an explicit basis and scope. A mentor is a person, not a free bundle of bonuses or a guaranteed patron.

### Chapter 5 — What did you learn first?

**Player-facing question:** “What part of the work did your early instruction make familiar?”

The player selects one primary emphasis. It represents remembered supervised practice, not a complete curriculum or a modern subject specialization.

| Training emphasis | Player-facing description | Practice represented | Familiarity and limits |
|---|---|---|---|
| Quantities and commodity notation | “You practiced recording quantities beside the goods they described, and learned that a number only made sense in its proper system.” | Recordkeeping & Accounts; Reading & Scripts only where signs were actually recognized | One authored commodity and numerical context; no universal numeracy bonus. |
| Clay, stylus, and tablet preparation | “You learned how clay behaved, how a tablet was prepared, and how marks had to be made to remain legible.” | Material preparation; Writing & Composition only where the character actually made marks | Familiarity with clay and tablet preparation; not equivalent to reading or composing a complete text. |
| Signs and category lists | “You practiced recognizing and reproducing a limited set of signs and categories used in the work around you.” | Reading & Scripts and Writing & Composition at an introductory level | Familiarity with the practiced sign/category set; not fluent language literacy or ordinary prose writing. |
| Checking and organizing records | “You helped compare entries, keep related information together, and notice when two accounts did not agree.” | Recordkeeping & Accounts; Analysis & Research where comparison and inference were practiced | Familiarity with one record type and its working context. |
| Listening and explaining | “You learned by listening to instructions, repeating them accurately, and explaining a task to someone else.” | Communication & Instruction | Familiarity with a relevant oral procedure; no general authority to instruct or supervise. |
| Comparing sources | “You were taught not to rely on one account when another source could confirm or challenge it.” | Analysis & Research; Recordkeeping & Accounts where actual entries were compared | Familiarity with source comparison; do not make the character a modern investigator. |

Award skill experience only for skills genuinely practiced, and only after skill attribution has been validated. Do not award Career XP or a specialization merely for selecting a life-history vignette. Numerical skill levels, attributes, and rank remain outside this proposal.

### Final identity — What kind of professional life are you beginning?

This final step presents the four generalized career orientations. The player sees both the broad meaning and the local Era I interpretation before choosing.

| GDD orientation | General player-facing meaning | Uruk c. 3200 BCE explanation | Likely initial context |
|---|---|---|---|
| **Government** | “You are drawn to the work of institutions: organizing resources, keeping responsibilities clear, and helping collective work function.” | In Uruk, this may bring you into administrative activity associated with storage, distribution, labor, and institutional coordination. These responsibilities overlap with sacred and ceremonial life. | Contacts in an administrative setting; familiarity with coordination, records, goods, or labor, depending on the life history. |
| **Military** | “You are drawn to the work that supports security, organized movement, and the coordination of people and resources in dangerous circumstances.” | In this period, the evidence for a distinct military scribal career is weak. The game may represent specific security, transport, or mobilization matters, but does not assume a standing army, military bureaucracy, or combat training. | A specific contact or circumstance tied to a security or mobilization matter. This orientation remains historically provisional in Era I. |
| **Religious** | “You are drawn to institutions and people whose work is connected with sacred practice, ritual, and the responsibilities that support them.” | In Uruk, sacred activity and economic administration may overlap. Eanna provides the strongest administrative evidence; Anu/Kullaba is a distinct monumental/sacred context with a thinner excavated administrative record. | Contacts connected with cultic, ceremonial, or institutional activity where the authored scenario supports them. |
| **Merchant** | “You are drawn to exchange: moving goods, maintaining relationships between counterparties, and making sure what is promised reaches the people expecting it.” | In Uruk, this is best understood through procurement, exchange, delivery, and movement networks—not as a modern merchant house or a fully documented commercial profession. | Contacts among producers, carriers, recipients, and people involved in procurement or exchange. |

**Shared access rule:** orientations influence the character's initial professional context, contacts, responsibilities, and likely opportunities. They do not create exclusive access to institutions or content. A Government-oriented character may encounter religious or exchange matters; a Merchant-oriented character may work with institutional records. The player's actual skills, relationships, appointments, circumstances, and opportunities determine what they can do.

**Presentation rule:** explain the orientation in plain language first, then explain what it means in the current era. Do not expect the player to know what an ancient title or institutional category means. Avoid presenting a speculative historical title as the name of a universal career class.

The player also:
1. Chooses one or two initial personality traits from the approved trait catalog once that catalog is authored.
2. Chooses or confirms an era-appropriate name. Human-readable names are a readability liberty; do not imply every name is archaeologically attested.
3. May choose an optional personal ambition as narrative context, not as a new progression track or guaranteed quest.
4. Reviews the resulting biography, contacts, formative events, familiarity, training, and professional orientation before finalizing.

## 5. Era I institutional grounding

The institutional research is used here as a content guide, not as a mandate to reproduce a complete institutional simulation.

### Eanna and associated administration

Eanna is the strongest available Era I setting for administrative records, sealings, storage and distribution, production-related activity, and ceremonial or public gatherings. It should be a recurring institutional context for the opening era. Do not portray it as a fully reconstructed modern department, a single office, or proof of a neat separation between civic and religious authority.

### Anu/Kullaba monumental and sacred context

Anu/Kullaba provides a distinct monumental/sacred setting. Its exact divine dedication and internal administrative structure remain uncertain, and it has not yielded a tablet corpus comparable to Eanna. Use it for appropriately authored sacred, monumental, maintenance, material, or ceremonial situations; do not invent a parallel archive or detailed hierarchy simply to balance the paths.

### Wider working world

Character origins and contacts may connect to:
- Agricultural and pastoral provisioning.
- Craft and processing activities.
- Exchange, procurement, and transport networks.
- Institutional households, personnel, and work groups.
- Collective labor and construction.
- Specific security or mobilization matters where supported.

These are overlapping contexts, not eight separate player factions or a complete roster of ancient departments. A character may have a personal connection to one context and a professional contact in another. The authored scenario needs only the people, responsibilities, and institutional facts required for coherent play.

## 6. People, relationships, and opening responsibilities

Character creation should produce a small, intelligible social starting point rather than simulate a complete biography.

For each selected route, author only the people needed to make the history concrete:
- A household, kin, work-group, or community contact appropriate to the chosen origin.
- A participant in a meaningful formative event, if another person was involved.
- An introducer or recommender, if that route was selected.
- A trainer or mentor.
- One initial professional contact connected to the chosen orientation, if distinct from the above.

One person may fill more than one role when the biography supports it. Avoid generating a large cast just to satisfy a schema.

Each consequential person must be an existing Person in the shared world model, with a stable identity and plausible place in the world. Their connection to the player must have a specific basis. Kinship, repeated contact, recommendation, instruction, and professional dependence are not interchangeable with trust, affection, respect, resentment, or obligation.

The character should begin with one or two concrete responsibilities or expectations that arise naturally from their training and current circumstances. These are narrative and operational context, not mandatory quest hooks. Do not silently create debt, consume AP, or make an NPC's commitment binding without an explicit basis.

## 7. Deterministic starting-state contract

Character creation should establish the player character as an existing Person in the world. It must not create a disconnected player-only character object or run a detailed simulation of every year of childhood.

### State established from the choices

| State element | Source | Handling |
|---|---|---|
| Person identity | Name and biography | Use the shared Person identity; player control is a control state/reference, not a second Person model. |
| Origin/social context | Chapter 1 | Use the appropriate household, kin, work-group, or community context. Do not force all eras into one household schema. |
| Life history | Chapters 1–5 | Store a small number of meaningful, typed Life Events with dates, participants, and provenance. Do not log routine childhood activity. |
| Relationships | Named contacts and event participants | Use the existing directional relationship model; relationship dimensions must follow the actual basis of the connection. |
| Familiarity | Actual exposure and practice | Represent domain familiarity separately from skills and relationship familiarity. Do not create a comprehensive knowledge ontology. |
| Habits | Formative events and repeated experience | Record only when an authored experience supports a meaningful interpretive tendency. Never conceal or alter objective evidence. |
| Skill experience | Chapter 5 practice | Attribute only to skills genuinely practiced, subject to separate validation. No numerical starting values approved here. |
| Career orientation | Final identity | Use the existing four GDD paths as generalized orientations; localize their display name and explanation by era. |
| Appointment/authority | None automatically | A path, mentor, recommendation, or training event grants no formal office or authority. |
| Commitments | Explicit authored duty or agreement only | Require an identifiable basis, scope, and status. No implicit debt or hidden AP cost. |
| Equipment/resources | Authored opening circumstances | No automatic wealth, equipment, or provisions bonuses from background without separate balance and historical review. |
| Opening world | World seed, choices, and authored rules | Deterministic initialization. No random event may invalidate or kill the player before control begins. |

### Initialization boundary

Use authored life events and a bounded pre-play initialization to establish a coherent opening situation. Do not simulate childhood day by day. Routine activity can be summarized; only consequential people, relationships, circumstances, and events need persistent detail.

The same world seed and the same character choices must produce the same character and opening state. Initialization consumes no player AP and awards no Career XP or Historical Progress XP. It must not create a separate tutorial path for each orientation.

### Existing implementation observations

The current main-branch model already provides:
- A shared `Person` identity for player and NPCs; `CharacterId` is an alias of `PersonId`.
- `lifeStage`, `socialIdentity`, `circumstances`, `objectives`, `commitments`, and optional `scribal` state on `Person`.
- Directional, multi-dimensional relationships with history.
- `careerPath` on `ScribalCharacterState`.
- A deterministic `createNewGameState()` bootstrap that currently creates a fixed initial character and then applies the tutorial and starter Challenge.

The visible schema does not yet provide dedicated household, Life Event history, domain familiarity, or habit models. These are design gaps, not fields this proposal assumes already exist. Do not implement them as an unrelated parallel character system. Any future implementation must first reconcile the desired data with the existing Person architecture and save model.

## 8. Three contrasting character tests

These profiles are test fixtures, not canonical characters or prescribed builds. They test whether the framework produces distinct people without creating unequal classes or bonus packages.

### Test A — Provisioning-connected apprentice
- Origin: food and provisioning.
- Early responsibility: count or measure.
- Formative experience: a quantity did not match.
- Entry route: work earned a recommendation.
- Training emphasis: quantities and commodity notation.
- Orientation: Government.
- Likely context: provisions, quantities, storage/distribution, discrepancy comparison, limited commodity notation.
- Likely contacts: one household/work contact, recommender, trainer, and an administrative contact if distinct.
- Does not receive: authority over stores, accounting mastery, automatic trust from a steward, or an appointment.

### Test B — Skilled-making apprentice
- Origin: skilled making.
- Early responsibility: judge materials or quality.
- Formative experience: circumstances changed how the people around them divided their work.
- Entry route: an encounter opened a door through a work interaction.
- Training emphasis: clay, stylus, and tablet preparation.
- Orientation: Religious, but only where the authored contact provides a credible connection to sacred or ceremonial work.
- Likely context: materials, workmanship, condition, clay handling, and a specific institutional or ceremonial connection.
- Does not receive: broad literacy, specialist craft qualification, religious office, or higher starting wealth.

### Test C — Movement-connected apprentice
- Origin: exchange and movement, with fields/herds as a sensitivity variant.
- Early responsibility: help with deliveries.
- Formative experience: helped settle a disagreement.
- Entry route: someone introduced them.
- Training emphasis: comparing sources.
- Orientation: Merchant.
- Likely context: handovers, routes, counterparties, delivery expectations, and comparison of accounts or testimony.
- Does not receive: commercial authority, ownership of transported goods, or automatic access to every exchange contact.

### Comparative acceptance criteria

The profiles pass only if:
1. Each has a distinct biography and at least one genuinely different domain familiarity.
2. Their contacts and opening responsibilities differ for understandable reasons.
3. None is universally stronger or receives unearned rank, appointment, authority, qualification, specialization, or high skill.
4. All can engage with the Storehouse Reckoning on the same terms.
5. Their interpretation may differ through familiarity and actual practice, but the objective tutorial evidence remains identical and complete.
6. The same seed and same choices produce the same person, relationships, history, and opening world.
7. Orientations alter initial context and likely opportunities without blocking cross-orientation play.
8. The Military orientation is presented honestly as a generalized professional path whose Era I expression is provisional and narrowly authored.

## 9. Tutorial compatibility

The Storehouse Reckoning remains the fixed introductory tutorial outside Assignments, Challenges, and Works, with zero Historical Progress XP.

Character background may influence the character's situated interpretation, but must not change:
- The objective evidence supplied by the tutorial.
- The tutorial's required record fields or assessment criteria.
- The Senior Scribe's formal authority or disposition.
- The tutorial's progression rewards or Historical Progress XP.
- The tutorial's role as a common first supervised exercise.

A character familiar with provisioning or quantities may recognize the context more readily. That must not make evidence easier to obtain, hide evidence from other characters, or predetermine the assessment. Every starting orientation completes the same tutorial with the same authored people, evidence, and assessment rules. Background may affect interpretation, not the tutorial's underlying facts or formal outcome criteria.

## 10. GDD alignment and cross-track impact

### GDD alignment

- **§3.3–3.4:** Develops the Uruk origin, four initial career paths, attributes, skills, and personality traits.
- **§4.2:** Establishes a reusable character-creation framework whose local expression changes by era.
- **§15.2–15.5:** Uses the shared Person model, social network, era-specific institutions, and bounded deterministic world.
- **§23 items 8, 10, 13, 22, and 25:** Informs relationships, character transitions, Era I institutions, the character system, and situated interpretation.
- **§25:** Supports continuity through existing people and a world that continues independently of the player.

No locked GDD invariant is contradicted. This proposal does not change the six-AP Workday, the three gameplay layers, progression independence, the two-resource economy, succession principles, or the no-runtime-generative-AI boundary. It does not revise the GDD or approve numerical starting values.

### Cross-department impact

- **Game Design:** Establishes one reusable life-history framework; keeps career paths as understandable professional orientations rather than era-specific classes; avoids turning biography into a bonus-selection exercise.
- **Historical Research:** Validates the Era I vignettes and local path descriptions. Prioritize household/social-context wording, training plausibility, and the weak evidence for a distinct Military scribal career.
- **Engineering & Architecture:** Future design may need compact Life Event and familiarity representations and era-localized orientation descriptions. Reuse the shared Person and careerPath foundations; do not create a parallel character model or simulate childhood day by day.
- **Art & UI/UX:** Present the sequence as concise narrative chapters or vignettes. The professional orientation screen must explain the general role and its Era I meaning. No physical avatar editor is required. Use period-appropriate materials and settings; avoid later writing forms or modern school imagery in Uruk.
- **Audio:** Optional restrained material and environmental cues. No separate audio system or cinematic dependency is required.
- **Production & QA:** Test choice combinations, deterministic initialization, distinct biographies, orientation explanation, profile parity, and tutorial invariance. Historical review should focus on claims actually presented to the player.

## 11. Recommendation and remaining owner decisions

**Recommendation:** adopt the reusable life-history framework as the working direction for character creation. Keep the five life-history chapters and final identity/orientation step, with the Era I content above serving as the first authored expression rather than a permanent template for all eras.

The revision deliberately treats the four career paths as generalized professional orientations. Their descriptions should explain the broad fantasy first and the historical meaning second. The institutional matrix supplies credible context and content possibilities; it does not require four separate institutional career systems.

The following remain open and are not approved by this document:
1. The final wording and availability of individual Era I origin and vignette choices.
2. Whether the institutional-service origin belongs in the first playable set or should remain a conditional authored option.
3. The precise Era I presentation of the Military orientation and whether its first playable scenario is included in the vertical slice.
4. The exact character-state representation for household/social context, Life Events, familiarity, and habits.
5. Starting attributes, skill levels, skill experience, Career XP, equipment, resources, and any mechanical benefits.
6. The final trait catalog, ambition presentation, and whether ambition is included in the first release.
7. Whether the first character's pre-play history is established entirely through authored events or uses a bounded initialization pass.

These are design tasks, not reasons to postpone the content framework. Resolve each with evidence and playability tests before implementation; do not fill gaps with arbitrary placeholder mechanics.

## 12. Research basis and limitations

1. Hans J. Nissen, “Uruk: Early Administration Practices and the Development of Proto-Cuneiform Writing,” *Archéo-Nil* 26 (2016), pp. 33–48. [Persée article](https://www.persee.fr/doc/arnil_1161-0492_2016_num_26_1_1102). Supports early administration, commodity movement, seals/counters, proto-cuneiform development, and the limited scope of surviving records. Nissen explicitly identifies the proposed “school before writing” as an assumption without direct evidence.
2. Jason Ur, “Households and the Emergence of Cities in Ancient Mesopotamia,” *Cambridge Archaeological Journal* 24:2 (2014), pp. 249–268. [Author-hosted PDF](https://jasonur.scholars.harvard.edu/sites/g/files/omnuum6996/files/jasonur/files/ur_2014_caj_households_and_the_emergence_of_cities.pdf). Offers a household-centered interpretive model and cautions against assuming an abrupt shift to rational bureaucracy. It is a model, not proof that every Uruk household had one fixed structure.
3. Digital Corpus of Cuneiform Lexical Texts, “The Archaic Administrative Corpus.” [ORACC](https://oracc.museum.upenn.edu/dcclt/intro/arch_intro.html). Summarizes the administrative character of the earliest writing and its commodity, labor, and land-management contexts.
4. Davide Domenici and Nicolò Marchetti (eds.), *Urbanized Landscapes in Early Syro-Mesopotamia* (2018), [open-access volume](https://site.unibo.it/eduu/en/work-package-1-archaeological-cultural-and-environmental-research/results/978-3-447-11086-0_free-open-access_.pdf). Provides context for Late Chalcolithic networks and proto-cuneiform, while noting that surviving written evidence is concentrated on central institutional operations.
5. “The Political Economy of Mesopotamian Colonial Encounters,” Gil J. Stein (2005). Informs the cautious treatment of procurement and interregional exchange; it does not justify treating all exchange as a modern merchant profession.
6. “Mesopotamia and the ‘New’ Military History,” Oriental Institute / University of Chicago. Informs the low-confidence treatment of a distinct military scribal path in the Uruk period.

The evidence supports the administrative and material contexts more strongly than the specific biographies, household experiences, or training routes. Most player-facing vignette details therefore remain authored reconstructions and should be presented as plausible lives, not documented facts.
