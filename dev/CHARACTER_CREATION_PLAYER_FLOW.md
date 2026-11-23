# Character Creation — Player-Facing Flow Proposal

**Status:** Design proposal for Game Director review  
**Date:** 2026-11-23  
**Depends on:** `dev/URUK_CHARACTER_CREATION_MATRIX.md`  
**Authority:** `docs/GDD.md` remains canonical. This document does not revise it.  
**Scope:** The player-facing sequence, authored choice language, choice consequences, and biography presentation. No numerical starting benefits or production implementation are approved here.

## 1. Experience goal

Character creation should feel like being introduced to a person whose life has already begun. The player is not selecting a class, optimizing a build, or filling out a historical census. They are making a small number of choices about the experiences that brought this person to the opening of the game.

The experience should answer five questions for the player:

1. Where did this person come from?
2. What did people rely on them to do?
3. What experience stayed with them?
4. How did they come to learn scribal work?
5. What kind of professional life are they beginning?

The result is a coherent biography and a small, understandable network of people and responsibilities in the existing world.

### Recommended format

Use a short sequence of narrative chapters with one primary choice per chapter. Each chapter presents three to five concise options. The player can inspect an option, see its likely narrative consequences, choose it, and continue. A persistent chapter navigator allows review and revision before final confirmation.

Do not show skill points, attribute modifiers, XP, rank forecasts, equipment bonuses, or hidden optimization ratings. The player should understand the kind of history they are choosing without being asked to calculate its mechanical value.

## 2. Flow at a glance

| Step | Screen | Player action | Establishes |
|---|---|---|---|
| 0 | Opening | Begin a new life | Sets the premise and era/location |
| 1 | Origins | Choose formative environment | Social context and first familiarity domain |
| 2 | Responsibilities | Choose an early responsibility | A practical experience and possible participant |
| 3 | Formative experience | Choose a consequential memory | A Life Event and the people involved |
| 4 | Entry into scribal work | Choose how the opportunity arose | A credible route, introducer/recommender, and actual trainer |
| 5 | First instruction | Choose an early practice emphasis | A limited area of supervised familiarity |
| 6 | Professional orientation | Choose Civic, Religious, Commercial, or Martial | Initial professional context and likely contacts |
| 7 | Identity | Name, traits, optional ambition | Personal identity and self-description |
| 8 | Biography | Review and confirm | Final coherent starting person and opening situation |

The framework is shared across eras. Screen titles and broad questions remain recognizable; the options, setting, people, materials, and local professional explanations are era-authored.

## 3. Screen specifications and proposed player-facing copy

### Screen 0 — A life already underway

**Heading:** A Life in the Making

**Introductory copy:**

> You are not beginning with an empty slate. You have grown up among other people, learned to be useful, made mistakes, and found your way toward the work of a scribe.
>
> The choices ahead describe the life that brought you here. They will shape the people you know, the work you recognize, and the circumstances in which your career begins.

**Interaction:** Begin.

**Design note:** State the current era and opening location in a small contextual line. Do not front-load a history lecture or explain every game system here.

### Screen 1 — Origins

**Heading:** Where did you come from?

**Prompt:**

> Before you learned to work with tablets, what kind of work and people shaped your world?

**Supporting copy:**

> Most people learn how the world works by taking part in it. Choose the environment that had the strongest influence on your early life.

**Era I Uruk options:**

**Food and provisioning**

> You grew up around the preparation, storage, and movement of food. You learned how much work sits behind an apparently simple allocation.

**Fields and herds**

> Much of the work you knew began beyond the city: fields, animals, seasonal tasks, and bringing produce where it was needed.

**Skilled making**

> You grew up around people who shaped useful things, judged materials, and knew how much work a finished object concealed.

**Exchange and movement**

> You knew the work of moving goods: deliveries, routes, quantities, handovers, and the people waiting at the other end.

**Institutional service** — conditional authored option

> People close to you worked in or around a larger institution, where resources and responsibilities had to be organized.

**What the player sees after selecting:** A short confirmation line, such as “You know the work behind storing and distributing provisions.” This is a narrative summary, not a bonus.

**World consequences:** Establish one origin context and one initial domain of familiarity. Create only the household, kin, work-group, or community relationship needed to make the chosen biography concrete. Do not create a universal household object merely because the screen uses the word “home.”

### Screen 2 — Responsibilities

**Heading:** What did people rely on you to do?

**Prompt:**

> When you were old enough to be useful, what did people begin to trust you with?

**Supporting copy:**

> Choose one responsibility that gave you practical experience. It need not have been your only task.

**Era I Uruk options:**

- **Count or measure:** “You were asked to count, compare, or measure things that someone else needed to account for.”
- **Help with deliveries:** “You learned who was expecting a delivery, what had to travel, and what could go wrong between handover and arrival.”
- **Judge materials or quality:** “You learned to notice when material, workmanship, or condition did not match what was expected.”
- **Coordinate a small task:** “People began relying on you to remember who was doing what and whether the work had been finished.”
- **Observe a record or seal in use:** “You watched someone use a mark, seal, token, or tablet to make a transaction or responsibility recognizable.”

**What the player sees after selecting:** One sentence connecting the responsibility to the origin where possible. For example: “The work around provisions taught you to pay attention to quantities and what had actually arrived.”

**World consequences:** Add one concise Life Event describing the responsibility or period of repeated practice. Name another Person only when the authored vignette requires one. Observing a record or seal does not imply literacy.

### Screen 3 — A formative experience

**Heading:** What stayed with you?

**Prompt:**

> Was there an experience that changed what you paid attention to?

**Supporting copy:**

> Not every important lesson is a pleasant one. Choose an experience you still remember.

**Era I Uruk options:**

- **A quantity did not match:** “A quantity everyone relied on turned out not to match what had actually been received or used.”
- **You were blamed unfairly:** “You were held responsible for a mistake you did not believe was yours.”
- **You helped settle a disagreement:** “Two people remembered an agreement differently, and you helped establish what each had actually seen or promised.”
- **You were trusted with an adult responsibility:** “Someone gave you responsibility before others thought you were ready.”
- **Your circumstances changed:** “A difficult season or loss of resources changed how the people around you divided their work.”

**What the player sees after selecting:** A short reflective line that describes the memory without declaring what it means. Example: “You remember how quickly an uncertain account can become someone else's blame.”

**World consequences:** Add one formative Life Event, its date or approximate life stage, and the actual participants. Where supported, record a remembered interpretive tendency as a habit. Do not automatically assign a permanent personality trait or a moral alignment.

### Screen 4 — Entry into scribal work

**Heading:** How did you find your way to the tablets?

**Prompt:**

> How did the chance to learn the work of a scribe come to you?

**Supporting copy:**

> Someone had to notice you, introduce you, or give you a chance. Choose how that happened.

**Era I Uruk options:**

- **Someone introduced you:** “Someone who knew you or your work introduced you to a person involved in keeping records.”
- **Your work earned a recommendation:** “Someone noticed how you handled a responsibility and recommended that you be given a chance to learn.”
- **You were needed as an assistant:** “A group or institution needed a dependable assistant, and you were brought in to learn by helping.”
- **An encounter opened a door:** “A delivery, disagreement, or other piece of work brought you into contact with someone willing to teach you.”

**Conditional personalization:** Where the selected history already includes a plausible introducer or recommender, use that Person. Otherwise, the authored scenario supplies an existing Person in the world and a specific reason for the connection. Do not generate a new mentor as a disposable character-creation reward.

**What the player sees after selecting:** A small relationship vignette naming or identifying the person and explaining the basis of the connection. Example structure:

> [Person] noticed how you handled [earlier responsibility]. They spoke to [trainer], who agreed to let you assist and learn.

**World consequences:** Establish the introducer/recommender and trainer as actual Persons, with their roles and connection recorded separately. A recommendation is not automatically affection, trust, respect, debt, or a formal appointment. If an expectation or obligation exists, state what was agreed.

### Screen 5 — First instruction

**Heading:** What did you learn first?

**Prompt:**

> Your first instruction did not teach you everything. What part of the work became familiar first?

**Supporting copy:**

> Choose the practice that best describes your early experience. You are still learning.

**Era I Uruk options:**

- **Quantities and commodity notation:** “You practiced recording quantities beside the goods they described, and learned that a number only made sense in its proper system.”
- **Clay, stylus, and tablet preparation:** “You learned how clay behaved, how a tablet was prepared, and how marks had to be made to remain legible.”
- **Signs and category lists:** “You practiced recognizing and reproducing a limited set of signs and categories used in the work around you.”
- **Checking and organizing records:** “You helped compare entries, keep related information together, and notice when two accounts did not agree.”
- **Listening and explaining:** “You learned by listening to instructions, repeating them accurately, and explaining a task to someone else.”
- **Comparing sources:** “You were taught not to rely on one account when another source could confirm or challenge it.”

**What the player sees after selecting:** A confirmation of the limited practice represented. Example: “You have practiced a narrow set of commodity notations. You are not yet a fluent reader of every tablet.”

**World consequences:** Establish familiarity with the specific practice and domain. Skill attribution, skill levels, and numerical starting values are governed by separate approved design. This screen alone grants no Career XP, specialization, qualification, or appointment.

### Screen 6 — Professional orientation

**Heading:** What kind of work are you drawn toward?

**Prompt:**

> Scribes serve many kinds of people and institutions. What kind of responsibility do you hope to make your own?

**Supporting copy:**

> These are broad professional directions, not fixed ranks or exclusive memberships. Your work may cross their boundaries as your career develops.

Show four cards. Each card must contain the general explanation first and the current-era explanation second. Do not rely on the title alone.

**Civic**

*Across the game:*

> You are drawn to the work of institutions: organizing resources, keeping responsibilities clear, and helping collective work function.

*In Uruk:*

> This may bring you into administrative activity associated with storage, distribution, labor, and institutional coordination. These responsibilities can overlap with sacred and ceremonial life.

*Likely starting context:* An administrative contact or responsibility appropriate to the character's history.

**Martial**

*Across the game:*

> You are drawn to the work that supports security, organized movement, and the coordination of people and resources in dangerous circumstances.

*In Uruk:*

> Evidence for a distinct military scribal career is weak in this period. Your connection is to a specific matter of custody, protection, or movement under risk—not to a documented standing army or military bureaucracy.

*Likely starting context:* Enlil-kisu, the existing Carrier Foreman, through a specific delivery or sealed-load responsibility. This is a transport/custody connection, not a military posting.

**Religious**

*Across the game:*

> You are drawn to institutions and people whose work is connected with sacred practice, ritual, and the responsibilities that support them.

*In Uruk:*

> Sacred activity and economic administration may overlap. Eanna offers the strongest administrative context in the surviving evidence; Anu/Kullaba is a distinct monumental and sacred setting with a thinner excavated administrative record.

*Likely starting context:* A contact or responsibility connected with cultic, ceremonial, or institutional activity, as supported by the authored opening.

**Commercial**

*Across the game:*

> You are drawn to exchange: moving goods, maintaining relationships between counterparties, and making sure what is promised reaches the people expecting it.

*In Uruk:*

> This is best understood through procurement, exchange, delivery, and movement networks—not as a modern merchant house or a fully documented commercial profession.

*Likely starting context:* A contact among producers, carriers, recipients, or people involved in procurement and exchange.

**Shared explanatory line, always visible:**

> Your orientation shapes the people and responsibilities you are likely to encounter. It does not grant office, authority, mastery, or exclusive access. Your actual experience and relationships matter.

**What the player sees after selecting:** A one-sentence statement of the chosen direction and its local expression. Provide a “What this does not give you” expandable note: no appointment, rank, qualification, exclusive access, or guaranteed opportunity.

**World consequences:** Set the existing `careerPath` orientation and establish only the opening context needed to support it. Do not create separate institutional mechanics for each path.

### Screen 7 — Identity

**Heading:** What should people call you?

**Name:** Offer an era-appropriate authored name list and a custom-name field if the naming system supports it. Do not present a reconstructed name as a documented historical individual.

**Traits — approved placeholders:**

> Which qualities do you recognize in yourself?

Show two reserved starting-trait slots with explanatory placeholder copy. They are visible but inactive until the trait catalog and effects are authored and approved. Do not present invented trait names as selectable content or populate trait IDs with placeholders.

**Ambition — approved placeholder:**

> What do you hope your work might one day make possible?

Show the ambition prompt and a reserved response area with placeholder copy. It is visible but inactive until ambition content is authored. It is not a progression track, guaranteed quest, hidden objective, or mechanical bonus.

### Screen 8 — Biography and confirmation

**Heading:** This is where your story begins.

Show the character's biography as a readable, short narrative assembled from selected authored fragments. The player should see:
- Name and current era/location.
- Origin and early responsibilities.
- Formative experience.
- How they entered scribal work.
- What they first practiced.
- Their professional orientation, with its local meaning.
- Selected traits and ambition, if included.
- A small “People you know” list explaining why each person matters.
- One or two opening responsibilities or expectations, if the authored opening supports them.

**Sample biography — illustrative only**

> You grew up around the preparation and storage of food. Early on, people began asking you to count quantities and compare what had been expected with what had arrived.
>
> You remember one occasion when the figures did not agree. The disagreement mattered less for the missing amount than for the people who were ready to blame one another.
>
> Someone who had seen you handle that work recommended you to a record keeper. You were allowed to assist and began learning how quantities and commodity signs were placed on clay. Your instruction has been narrow, but you understand that a number belongs to a particular good and a particular system.
>
> You are drawn toward the work of institutions. In Uruk, that may mean helping organize resources and responsibilities in settings where administrative, sacred, and ceremonial activity can overlap.
>
> You begin your career with practical familiarity, a recommendation, a trainer, and much still to learn.

This example is a composed demonstration of the flow, not a canonical character, biography, or approved starting build.

**Confirmation copy:**

> This is the person you will play. Their past is established; their future is not. The people they know may help, hinder, disappoint, or surprise them. What happens next is yours to decide.

Buttons: **Revise history** and **Begin**.

On Begin, initialize the character and opening situation deterministically. No AP is consumed and no Career XP or Historical Progress XP is awarded during character creation.

## 4. Choice and consequence contract

Each chapter choice should produce a small, typed set of authored consequences. The exact data schema is a later architecture task, but content authors should supply the following information for every option:

| Required authoring field | Purpose |
|---|---|
| Choice ID and chapter | Stable identity and location in the flow |
| Player-facing title and copy | What the player reads |
| Historical confidence | Internal Attested / Inferred / Reconstruction / Unsupported review |
| Prerequisites | Any earlier choice or authored world condition required |
| Life Event | What happened, with approximate date/life stage and provenance |
| Participants | Existing Person IDs and each person's role in the event |
| Familiarity | The specific domain or practice actually encountered |
| Relationship change | Only the relationship dimension supported by the event |
| Opening context | Any responsibility, contact, or circumstance that persists into play |
| Biography fragment | The sentence or paragraph used in the final biography |
| Exclusions | What this choice does not grant or imply |

### Consequence rules

1. Choices establish facts about this character's past; they do not silently award a package of gameplay bonuses.
2. A choice may reference the same Person in multiple chapters. Reuse the Person and extend the relationship history; do not create duplicates.
3. Participants must be real entities in the shared world state, not character-creation-only placeholders.
4. Familiarity is specific and experience-based. It is not skill, qualification, authority, or trust.
5. A recommendation is not an appointment. Instruction is not qualification. Orientation is not institutional authority.
6. Life Events are concise and consequential. Do not persist every routine childhood task.
7. No choice should create hidden debt, automatic AP costs, or a mandatory future quest.
8. Choices should not alter the objective evidence or assessment rules of the Storehouse Reckoning.
9. The same world seed and choices must yield the same person, contacts, biography, and opening state.
10. No generative AI is used at runtime to create or resolve the character's history. Content is authored and resolution deterministic.

## 5. Dependencies and conditional presentation

The sequence should feel responsive without becoming a complex branching narrative graph.

- **Origins → Responsibilities:** Prefer choices that naturally connect to the selected origin, but retain at least two credible alternatives. Do not make the origin a hard class restriction.
- **Responsibilities → Formative experience:** Earlier experience may personalize wording or identify a participant. The player should still choose the formative event.
- **Formative experience → Entry route:** Reuse an existing participant as introducer/recommender when the authored story supports it. Otherwise offer an authored encounter with an existing Person.
- **Entry route → First instruction:** The trainer and work context determine which training options are credible. Do not imply a formal school.
- **Life history → Orientation:** All four orientations should remain available where the Era I content package can support a plausible connection. If one cannot be supported, either author the minimum credible opening connection or clearly mark the orientation as unavailable for this particular opening—not silently substitute another path.
- **Orientation → Opening context:** Establish a likely contact or responsibility, not an exclusive institution membership or guaranteed assignment.

Avoid a combinatorial explosion. Use authored fragments and a small number of meaningful conditional variations, not a unique fully branched biography for every possible combination.

## 6. Revisit, accessibility, and pacing

- Allow the player to revisit any prior chapter before confirmation.
- Show a short summary of selected choices in the chapter navigator.
- Do not punish experimentation with irreversible hidden consequences during creation.
- Keep each option to a title and one or two short sentences; put historical explanation in optional detail.
- Avoid unexplained ancient titles and technical terms in the main choice text.
- Distinguish the player's choice from the character's certainty. A character may remember an event imperfectly, but the game should not falsify the objective facts established in the world.
- Do not require the player to read the entire biography before making choices.
- The sequence should be completable without an encyclopedia or knowledge of ancient Mesopotamia.

## 7. Era I content readiness and recommended first playable set

### Recommended initial set

For the first authored implementation, use:
- Four origin options: Food and provisioning; Fields and herds; Skilled making; Exchange and movement.
- Four responsibility options: Count or measure; Help with deliveries; Judge materials or quality; Observe a record or seal in use.
- Four formative experiences: A quantity did not match; You were blamed unfairly; You helped settle a disagreement; You were trusted with an adult responsibility.
- Four entry routes: Someone introduced you; Your work earned a recommendation; You were needed as an assistant; An encounter opened a door.
- Four training emphases: Quantities and commodity notation; Clay, stylus, and tablet preparation; Signs and category lists; Checking and organizing records.
- Four professional orientations, subject to a credible authored opening connection for each. Martial is the most historically provisional.
- Name selection. Traits and ambition only if their catalogs and presentation are ready.

This is a proposed content scope, not an approved vertical-slice commitment. The narrower set reduces writing and test burden while retaining visibly different life histories. Listening/explaining and comparing sources can be added after the first pass if they create distinct experiences rather than redundant options.

### Conditional or deferred content

- Institutional service origin: retain as an authored conditional option until a specific, credible biography and contact chain are ready.
- Martial orientation: do not remove the GDD path; do not overstate Era I evidence. Include only with a tightly scoped, authored security/mobilization context that can connect to the existing opening.
- Personality traits: wait for the approved trait catalog and effect model.
- Ambition: optional; omit if it would imply a quest or progression system that does not exist.
- Custom name validation and historical name lists: separate naming/content task.

## 8. Test cases and acceptance criteria

Test at least these three complete biographies:

**A. Provisioning-connected / Civic**
- Food and provisioning → Count or measure → A quantity did not match → Work earned a recommendation → Quantities and commodity notation → Civic.
- Expected result: familiarity with provisions and quantities; a specific discrepancy memory; credible recommendation and trainer; administrative opening context.
- Must not receive storehouse authority, accounting mastery, or a guaranteed relationship with the Storehouse Steward.

**B. Skilled-making / Religious**
- Skilled making → Judge materials or quality → Circumstances changed the work around you (if included in the expanded set) → An encounter opened a door → Clay, stylus, and tablet preparation → Religious.
- Expected result: familiarity with materials and workmanship; a specific sacred/ceremonial connection authored for this character; narrow tablet-material practice.
- Must not receive broad literacy, craft qualification, religious office, or a prestige/wealth advantage.

**C. Movement-connected / Commercial**
- Exchange and movement → Help with deliveries → You helped settle a disagreement → Someone introduced you → Checking and organizing records → Commercial.
- Expected result: familiarity with delivery, custody, counterparties, and comparing accounts; a plausible professional introduction.
- Must not receive commercial authority, ownership of transported goods, or automatic access to all exchange contacts.

**Acceptance criteria**
1. Each profile reads as a distinct person, not a different bonus loadout.
2. Every consequential NPC referenced is an existing Person with a stable identity and a plausible role.
3. The biography is coherent across chapter choices and does not contradict itself.
4. No profile receives unearned rank, appointment, authority, qualification, specialization, or mastery.
5. All four orientations retain non-exclusive access to the wider world.
6. The Storehouse Reckoning presents the same objective evidence, fields, formal authority, and assessment criteria to every profile.
7. Background may affect situated interpretation only through justified experience and familiarity; it never hides or alters objective evidence.
8. Repeating the same seed and choices reproduces the same starting state.
9. Character creation consumes no AP and awards no Career XP or Historical Progress XP.
10. The complete flow is understandable to a player with no prior knowledge of Uruk.

## 9. GDD alignment and cross-department impact

### GDD alignment

- **§3.3–3.4:** Makes the opening person and four initial career paths legible through a life-history sequence.
- **§4.2:** Establishes a reusable player-facing structure with era-specific content.
- **§15.2–15.5:** Uses shared Persons, relationships, institutional contexts, and bounded deterministic initialization.
- **§23 items 8, 10, 13, 22, and 25:** Informs relationships, continuity candidates, historical content, character systems, and situated interpretation.

No locked invariant is changed. The Workday economy, gameplay layers, progression tracks, resource model, succession rules, and no-runtime-generative-AI boundary remain intact. The tutorial remains a common first supervised exercise.

### Cross-department impact

- **Game Design:** Owns the chapter sequence, choice consequences, and parity between biographies. Must keep history distinct from numerical build optimization.
- **Historical Research:** Reviews the claims embedded in player-facing copy, especially training, household/social context, and the Martial orientation. The player-facing copy should remain readable without scholarly caveat overload.
- **Engineering & Architecture:** Later implementation should resolve the choice results into the existing Person/careerPath architecture. Do not implement a parallel character object or persist routine childhood simulation.
- **Art & UI/UX:** Build a chapter-based narrative flow with readable option cards, a compact progress indicator, review/edit, and a biography preview. Avoid physical avatar customization as a prerequisite.
- **Audio:** Optional understated material/environmental cues. The flow must work fully without bespoke cinematic audio.
- **Production & QA:** Validate all choice combinations, conditional options, stable Person references, coherent biography assembly, deterministic initialization, and tutorial invariance.

## 10. Recommendation and owner decisions

**Approved by Game Director (2026-11-23):** The nine-screen flow and one primary choice per chapter; the narrower Era I first-playable option set; inclusion of the Martial orientation; and visible but inactive placeholders for traits and ambition.

The Martial option must use a historically restrained custody/transport/security connection, not a standing army or formal military posting. Trait and ambition placeholders must not masquerade as implemented mechanics.

The most important implementation gate is not numerical balance. It is whether the authored choice chains can produce a small, coherent cast of existing Persons and a believable opening biography without creating a large branching system.

**Remaining Game Director decisions:**
1. Review the detailed authored profiles, NPC connection map, and deterministic starting-state contract in `dev/CHARACTER_CREATION_ERA_I_CONTENT_SPEC.md`.
2. Approve the eventual numerical starting-state model separately; this flow intentionally does not propose values.

The approved flow remains a design proposal for implementation planning. It does not authorize GDD edits, schema changes, or production implementation.
