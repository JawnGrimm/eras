---
title: "Scribe of Eras"
subtitle: "Game Design Document — Revised Draft v1.2"
date: "21 November 2026"
lang: en-US
---

> **Canonical repository GDD.** This is the primary design reference for Scribe of Eras. Prototype code may lag behind or contradict this document; implementation decisions should be checked against the GDD rather than inferred from existing prototype behavior. Update this document when a design decision is deliberately changed.
>
> **Design decision (21 November 2026):** the Workday remains six shared Action Points (AP), with the end-of-day overtime rule in Section 6.4. The owner has explicitly confirmed this model for the current development phase. Four time blocks are not approved. Revisit the model only through an explicit design review informed by playtest evidence, followed by a deliberate GDD revision. This decision does not imply that every Work implementation or content definition is already compliant.
>
> **Implementation status:** the active Storehouse Work is implemented in `src/components/StorehouseReckoning.tsx`; its Action Point charges and evidence-retrieval behavior have been checked against Sections 7.5–7.6 and match. Retrieving initial evidence and unseen test dossiers costs AP; reviewing already acquired evidence is free. The separate JSON Work definition and `WorkRunner` are not wired into the running application and retain stale four-block/free-examination assumptions. They are not runtime authority and must not be wired in as a drop-in replacement. This note describes implementation status, not a change to the approved six-AP rule.

---

**Genre:** Historical career role-playing game / administrative simulation  
**Format:** Single-player, long-form historical journey  
**Starting place and period:** Uruk, southern Mesopotamia, c. 3200 BCE  
**Document status:** Revised design draft — Era I vertical slice and action economy added  

---

# Contents

- Executive Summary
- 1. High Concept
- 2. Design Pillars
- 3. Genre, Structure, and Point of View
- 4. Historical Scope and Era Progression
- 5. The Three Gameplay Layers
- 6. Workday and Action Economy
- 7. Era I Vertical Slice: The Storehouse Reckoning
- 8. The Assignment Gameplay Loop
- 9. Document Construction and Evaluation
- 10. Career Progression
- 11. Historical Progression and Works
- 12. Personal Economy
- 13. Stress, Trust, and Institutional Consequences
- 14. Bribery and Ethical Choices
- 15. People, Institutions, and Social Network
- 16. Player Continuity Through Successive Characters
- 17. Tools, Equipment, and Workspaces
- 18. Interface and Visual Direction
- 19. Content and Scenario Quality Standards
- 20. Progression Pacing and Player Experience
- 21. Audio, Feedback, and Accessibility
- 22. Boundaries and Exclusions
- 23. Remaining Design Work
- 24. Glossary
- 25. Design Summary
---

## Executive Summary

*Scribe of Eras* is a historical role-playing game about the people who record, preserve, organize, interpret, and circulate knowledge. The player begins as an apprentice scribe in Uruk around 3200 BCE and builds a professional life through changing institutions, relationships, technologies, and historical eras.

The central activity is not copying text or completing typing tests. It is understanding a situation, examining evidence, deciding what the record must say, constructing an appropriate document, and accepting responsibility for its consequences. A delivery receipt can determine whether a storehouse is credited with usable goods. An inventory can expose a discrepancy. A disputed account can affect the standing of several people. The player's records matter because other people and institutions act on them.

The game has three distinct gameplay layers:

1. **Assignments / Commissions** are optional, short professional jobs. The player chooses which available opportunities to pursue, subject to a shared daily action budget. Completing them develops the player's career and provides compensation, but is not required for historical advancement.
2. **Challenges** are optional, separate scenarios arising from behavior, neglected opportunities, relationships, or historical events. They are not ordinary employment and do not use the Assignment system.
3. **Works** are mandatory, long-form historical undertakings. They represent significant human achievements made possible by writing, records, communication, and institutions. Works—not routine assignments or optional Challenges—drive Historical Progress XP and advancement between eras.

Career progression and historical progression are separate. **Career XP** is earned through professional activity and serves as an investment currency for eligible skill improvements, specialization development, and other defined forms of professional development; it does not directly determine rank. A character's professional rank is derived from that character's own skill profile and influences the broad range of opportunities likely to reach them. Skills determine qualification for specific work, while appointments grant formal authority and responsibilities. **Historical Progress XP** measures the advancement represented by completed Works. A character can attain high professional standing while the player remains in an early historical era; entering a new era does not automatically increase that character's rank.

The player's personal economy uses two tracked resources: **money** and **provisions**. Money is presented using the historically appropriate currency name for the current era; provisions represent food and everyday sustenance using era-appropriate forms. Beer and other goods may appear in the world or inventory when relevant, but are not additional tracked personal resource balances.

The player, not any individual character, is the constant across the historical journey. The player experiences history through the work of successive scribal characters: people live, age, leave the profession, and die, while the player's participation in the world continues. When a character can no longer be played, the player takes up another existing scribal NPC with an established connection to that character and their professional world, in the same historical period. The new character may be far less experienced or socially prominent than the previous one; their own skills, personality, relationships, obligations, affiliations, possessions, and circumstances determine the player's new starting position. This is a change of viewpoint, not an inheritance of the former character's identity or an era restart. Section 16 defines the character-transition principle.

The world should continue to develop through the interaction of **social causality** and **operational causality**. People pursue interests and obligations within practical systems of work, resources, records, institutions, access, and time. The player's professional participation takes place where these forces meet: the player investigates, interprets, records, communicates, and makes decisions about situations created by both human intentions and ongoing processes.

---

## 1. High Concept

### 1.1 The game in one paragraph

The player is a professional scribe whose work connects people, institutions, and events across history. Starting in the administrative world of early Uruk, the player handles records, investigates discrepancies, resolves disputes, preserves texts, organizes information, and contributes to larger Works. Their career develops through experience and professional responsibility. Their participation in Works contributes to historical change. Over time, the materials and technologies of writing change, but the fundamental responsibility remains: make a record that other people can rely on.

### 1.2 The central idea

**Technology enables human advancement; what people do with that technology is what advances humanity.**

The game is interested in more than the invention of writing systems, writing tools, or printing machinery. It is interested in the human activity that follows: people create records, preserve stories, organize institutions, circulate arguments, teach one another, dispute authority, and use information to change how society works.

For example, the historical importance of printing is not exhausted by the press itself. Books, pamphlets, scientific publications, religious texts, political arguments, and wider access to information are part of what makes printing transformative. Those uses can create demands for new forms of communication and new technologies. The game should explore these chains of human action rather than treating history as a list of inventions.

### 1.3 The player fantasy

The player becomes a trusted professional whose records have consequences. They are not necessarily a ruler, hero, or inventor. Their influence often comes from being the person who knows what happened, understands what the evidence supports, and can make that knowledge usable by others.

The player may help an institution function, expose a dishonest official, preserve a literary work, make a complicated undertaking possible, or ensure that a person's obligation is not erased. Their choices can also protect powerful interests, conceal wrongdoing, or harm people. The game should allow moral and practical tensions rather than assume that recordkeeping is automatically neutral or benevolent.

---

## 2. Design Pillars

### 2.1 Administrative judgment is the gameplay

Reading, counting, reconciling, classifying, prioritizing, interpreting evidence, and making decisions are the central activities. The player should solve problems, not merely repeat supplied information.

### 2.2 Documents have consequences

A document is not a decorative output. It communicates facts, obligations, decisions, authority, and responsibility. An incomplete or inaccurate record can distort an inventory, misassign blame, create an invalid obligation, or damage trust.

### 2.3 People and relationships make the history personal

Characters, institutions, locations, family ties, mentors, apprentices, patrons, colleagues, and rivals are central to continuity and replayability. Historical context should be experienced through people and their circumstances, not only through encyclopedia entries.

### 2.4 History is made through use, not invention alone

New writing technologies matter because people adopt, adapt, distribute, regulate, preserve, and contest them. Works should reflect collective human activity and its consequences.

### 2.5 Professional identity persists while the world changes

The player's historical journey and professional identity continue across eras through successive characters. Each character retains their own skills, professional experience, relationships, reputation, and circumstances; those individual capabilities are not automatically transferred to the next character. The work, tools, institutions, and social environment change, while the player's continuing participation gives the journey its professional continuity.

### 2.6 Optional work enriches the journey; mandatory Works advance it

Assignments and Challenges offer agency, money, experience, relationships, and narrative complications. They do not gate the core historical journey. Mandatory Works carry the main progression between eras. All three activity types draw from the same daily action budget, so optional work has a real opportunity cost without requiring real-time pressure.

### 2.7 Work is a sequence of decisions, not a progress bar

A Work must define what the player investigates, compares, designs, drafts, tests, revises, authorizes, preserves, or distributes. Each stage must have a concrete output and a clear reason to exist. A Work is not complete merely because the player has spent enough days or accumulated enough points.

### 2.8 Complexity should serve play

Historical detail should make situations coherent and interesting without requiring a research-grade simulation of every ancient writing system, economic measure, or administrative practice. Accuracy matters, but playability and clarity matter too.

### 2.9 Records connect judgment to continuity

The player's judgment becomes consequential when it is preserved in a record that people and institutions can later consult, rely on, dispute, or act upon. When a matter may affect later play, preserve the substance of the judgment, the sources that support it, the scope of what the record asserts, and any material uncertainty or unresolved issue. A record should be capable of changing later obligations, decisions, access to information, relationships, or work.

Three things must remain conceptually distinct:

- **Event:** what happened in the world, whether or not it was witnessed or documented.
- **Record:** what a person or institution documented about the event, including its claims, omissions, qualifications, sources, and later amendments.
- **Knowledge:** what a particular person or institution has learned, and the basis on which they learned it. Possessing an event record does not mean every relevant person has read or understood it.

These distinctions matter when records are copied, circulated, withheld, consulted, amended, or misinterpreted. They do not require a complete simulation of every information route or every person's knowledge. Model the distinctions explicitly when they create a meaningful choice or consequence; otherwise use a simpler representation.

Continuity should be selective and consequential, not an unlimited transcript of every interaction. Routine resolved activity may remain in aggregate statistics or a searchable archive without remaining active narrative state. Retain active detail when it changes an obligation, dispute, relationship, access to information, or plausible future work.

The wider world should continue to change where relevant to play, but this does not require a fully autonomous population simulation. NPCs are an important human interface to the world, but not every interaction must trigger a task, negotiation, or skill check; ordinary social presence and conversation are valid. Event pacing may regulate when an eligible opportunity is presented, but must not rewrite causal history, conceal a genuine deadline, or silently move one. An empty presentation slot is valid.

Fairness means that the player can understand what a record or action asserts and can identify the evidence available to support a defensible response. It does not require one discoverable answer for every historical event or make every consequence predictable. Evaluate the quality of the player's judgment against the evidence available when the decision was made, not merely whether the conclusion matches a predetermined answer. A reasonable judgment later contradicted by new evidence should be distinguished from a careless judgment that ignored accessible evidence. More than one conclusion may be defensible when the evidence genuinely permits it. The evaluation principle is established; its scoring, feedback, and validation mechanics remain open design work.

### 2.10 The world moves through people and processes

The wider world develops through the interaction of **social causality** and **operational causality**:

- **Social causality:** People act according to their interests, personalities, relationships, obligations, authority, knowledge, and circumstances. Their choices can change their own situations and those of other people.
- **Operational causality:** Ongoing activities depend on resources, people, access, time, records, and other processes. These dependencies create requirements and consequences; interruptions or changes can affect connected activities and institutions.

**Professional participation is where these two forms of causality meet.** The player does not merely observe social drama or manage disconnected processes. Their profession places them inside situations where people's intentions and relationships intersect with the practical requirements and consequences of ongoing work. The player investigates, interprets evidence, creates and evaluates records, communicates, exercises judgment, and takes responsibility for actions that can influence people and institutions.

Meaningful professional situations should therefore connect human interests to consequential activity. Social interactions without practical stakes risk becoming isolated relationship mechanics; operational systems without people risk becoming abstract bookkeeping. Neither dimension should be treated as a separate substitute for the other.

This is a game, not an attempt to simulate every person or transaction. Important people and consequential processes should retain enough continuity to produce intelligible future developments and meaningful choices. Routine or temporary activity may be represented simply, summarized, or left in the background when its details do not affect future obligations, relationships, disputes, information access, opportunities, or plausible work. The design should spend detail where it creates interesting play, not pursue exhaustive simulation for its own sake. The exact technical architecture, scope, update frequency, and numerical rules remain open design work.


### 2.11 The player's knowledge is situated

The player's knowledge is shaped by their place in the world and by the character they inhabit. Information reaches the player when people, institutions, activities, or material evidence intersect with that character; the player does not receive a complete view of the simulation simply because the simulation tracks an event.

That intersection is shaped by existing character and world systems:

- **NPC relationships:** Who approaches the player, trusts them, avoids them, asks for help, or chooses to share information.
- **Reputation:** What others are willing to disclose, what they assume the player already knows, and whether they consider the player credible or worth approaching.
- **Attributes:** What the player notices, recognizes, or can make sense of in a situation.
- **Skills:** What the player can interpret in conversations, documents, accounts, and other evidence.
- **Equipment:** What information the player can access, examine, preserve, or communicate.
- **World circumstances:** What is happening among connected people and institutions, nearby communities, and relevant trade, travel, and administrative networks.

Three questions must remain distinct: **Can the player access the information? Can the player understand or interpret it? Can the player establish whether it is true?** A merchant may report a missing shipment and the player's relationships may explain why the merchant approaches them. Relevant skills may help the player examine the accounts, but determining whether the shipment was lost, stolen, delayed, or never dispatched requires evidence. A claim reaching the player is not automatically established fact.

This is a principle governing how existing systems intersect, not a separate information-source subsystem. The player's knowledge is a product of their place in the world, not a complete view of the world itself. Notifications and morning reports should present information that has plausibly reached the player through those connections and circumstances, while preserving its source, limits, and uncertainty.

---

## 3. Genre, Structure, and Point of View

### 3.1 Genre

*Scribe of Eras* is a historical career RPG with administrative simulation, evidence-based problem solving, narrative choices, and long-form historical progression. It is not primarily a strategy game about controlling territory, a combat RPG, a typing game, or a transcription simulator.

### 3.2 Single-player experience

The player experiences history through successive scribal characters. An individual character's life is not the player's life: when a character dies or otherwise leaves play, the player takes up another existing scribal NPC with an established connection to the former character and their professional world, in the same historical period. The next character may be a low-ranking or inexperienced scribe rather than an equally accomplished replacement. Their own circumstances and abilities define the player's new position. The player should feel responsible for decisions and records, while the surrounding world continues to develop through authored historical events and scenario consequences.

### 3.3 Player role

The player begins as an apprentice scribe in Uruk. The player's precise name, family background, and early personal circumstances can be established during the opening of the game.

### 3.4 Character foundations and initial career paths

The character system is built around the following interaction model:

**Attributes + Skills + Specializations + Personality Traits + Equipment + Conditions + Circumstances → Available Actions and Outcomes**

These elements should interact to change what a character can do, perceive, access, withstand, and accomplish. They are not intended as disconnected lists of bonuses. The exact action-resolution formula and numerical scales remain open.

#### Initial career paths

Character creation offers four initial career paths:

- **Government**
- **Military**
- **Religious**
- **Merchant**

A career path establishes the player's initial professional identity and context. It should shape the institutions, people, responsibilities, opportunities, and likely areas of expertise encountered at the beginning of play. These are starting paths, not permanent restrictions on what the character may learn or do. The starting benefits and any later movement between career paths have not yet been defined.

#### Attributes

The six broad character attributes are:

| Attribute | Scope |
|---|---|
| **Precision** | Accuracy, attention to detail, exactness, and fine control. |
| **Perception** | Noticing details, listening, reading situations, and recognizing inconsistencies. |
| **Reasoning** | Interpreting information, synthesizing ideas, comparing possibilities, and drawing conclusions. |
| **Expression** | Communicating clearly, organizing thoughts, and conveying intent. |
| **Endurance** | Sustaining effort, concentration, and performance over time. |
| **Composure** | Maintaining control under pressure, handling difficult situations, and resisting distraction. |

These are broad character capabilities, not measures of moral worth or professional rank. Attributes are established at character creation and are relatively stable rather than a routine XP-progression track. They may change only through significant life events or lasting circumstances. Ordinary professional practice develops skills, not the character's underlying attributes.

#### Core skills and primary attribute pairings

The current six-skill framework is:

| Core skill | Primary attribute | Scope |
|---|---|---|
| **Reading & Scripts** | Perception | Recognizing and interpreting written signs, scripts, and textual features. |
| **Recordkeeping & Accounts** | Precision | Maintaining records, tracking transactions, and reconciling quantities. |
| **Analysis & Research** | Reasoning | Comparing information, identifying patterns, and drawing supported conclusions. |
| **Writing & Composition** | Expression | Producing clear, coherent documents and written communication. |
| **Administration & Procedure** | Composure | Handling institutional responsibilities and applying procedures under pressure. |
| **Communication & Instruction** | Expression | Listening, explaining, teaching, and conveying information to others. |

These are primary pairings, not exclusive attribute-to-skill dependencies. The attribute relevant to an action may change with its specific demands and circumstances. Endurance, for example, may matter when an otherwise familiar skill must be sustained through prolonged effort.

Skills represent learned competencies and can develop across career paths. Each of the six core skills has its own independent experience track. Activities award experience to the skills they genuinely use; more demanding or complex work may award more, while routine repetition contributes without allowing expertise to arise from repetition alone. Formal study and mentorship can also develop skills without requiring repeated Assignments.

Each skill uses a numerical level from **1 to 10**, with the following descriptive bands:

| Levels | Proficiency |
|---|---|
| 1–2 | Novice |
| 3–4 | Developing |
| 5–6 | Competent |
| 7–8 | Advanced |
| 9–10 | Expert |

Skill-specific experience establishes eligibility for advancement; it does not automatically raise the skill. Once eligible, the player chooses whether to invest **Career XP** to improve that skill. Career XP is the shared investment currency for professional development. It may be spent on eligible skill improvements, specialization development, and other professional development options as those systems are defined. Relevant experience, qualifications, and accomplishments determine eligibility; Career XP alone cannot purchase expertise in a field the character has not meaningfully practiced or studied. Exact experience thresholds and XP costs remain open.

Skills and their experience tracks belong to the individual character. They remain with that character, including through era transitions that the character personally experiences, but are not inherited or copied when the player takes up another scribal NPC. A successor's own skill profile determines that character's qualifications and professional rank. Historical transitions may make additional era-appropriate branches of the skill tree available to characters who experience them.

#### Personality traits

Personality is represented through traits that influence a character's behavioral tendencies, decisions, relationships, and relevant action outcomes. Traits are distinct from attributes, learned skills, and temporary or lasting conditions.

At character creation, the player chooses **one or two initial personality traits**. These establish defining aspects of the character's starting personality. Additional traits emerge through play as a result of meaningful experiences, significant events, and patterns of behavior. A single isolated action should not automatically assign a lasting personality label; trait development should be grounded in the character's history rather than arbitrary rolls or simple activity counters.

Personality traits are not permanently fixed. Established traits may strengthen, weaken, or change as the character grows, becomes hardened, or changes priorities. Such changes should follow meaningful experiences rather than being freely swapped at will. Choices that conflict with a character's established personality may create internal tension or contribute to Stress where appropriate, providing a character-centered source of consequence. The precise trait catalog, emergence rules, change conditions, and mechanical effects remain open.

#### Specializations

Specializations represent focused professional expertise developed within the shared skill framework. They are not additional career classes and do not permanently restrict a character to their initial career path.

Characters qualify for specializations through relevant experience, skills, relationships, and opportunities. Once eligible, the player chooses which specialization to pursue; eligibility is earned through play, while the choice remains with the player. Repetitive Assignment grinding should not be the only route to qualification: significant Works, Challenges, study, mentorship, and professional opportunities may also contribute where relevant.

A character may develop multiple specializations. One is designated the **Primary Specialization**, representing the character's strongest professional identity and potentially influencing recognition, reputation, institutional opportunities, and career development. Other specializations remain mechanically useful. Primary status does not necessarily mean the character has the highest numerical skill in that field.

Each specialization has three levels of expertise:

1. **Practitioner** — competent in the specialized field.
2. **Specialist** — able to handle demanding work and use distinctive capabilities.
3. **Master** — exceptional expertise, advanced actions, and significant professional recognition.

Specializations should provide a combination of three benefits:

- **Unlock actions:** make new approaches or activities available.
- **Improve actions:** make relevant existing actions more effective.
- **Create opportunities:** change the professional work, appointments, relationships, and institutional opportunities available to the character.

Secondary specializations retain their relevant capabilities; they are not deliberately weakened merely because another specialization is primary. Career XP is the shared investment currency for specialization development, while relevant experience, skills, relationships, and opportunities determine eligibility. Exact qualification thresholds, advancement requirements, XP costs, and effects of individual specializations remain to be designed.

#### Character conditions

Conditions represent temporary or lasting states that affect a character's capabilities and experience. They may arise from three broad sources:

- **Player-driven:** actions and decisions, including demanding work, overtime, and difficult professional or social situations.
- **World-driven:** illness, accidents, seasonal circumstances, and other external events.
- **Character-driven:** personality, traits, existing conditions, and accumulated stress influencing how a character responds to circumstances.

Random events may introduce conditions, but should be grounded in plausible circumstances rather than functioning as arbitrary debuff rolls.

Conditions generally affect action resolution through modifiers to relevant attributes, skills, or both. Their effects are contextual: a condition applies when it is relevant to the action, not automatically to every activity. Multiple applicable conditions may stack, with their relevant modifiers combined.

Conditions influence capability and consequences; they do not arbitrarily remove player choice. If an action remains possible in the fiction, the player may attempt it and accept the applicable penalties or risks. Absolute restrictions should be exceptional and justified by genuine circumstances, not used as a routine consequence of a negative modifier.

A condition lasts as long as its cause and circumstances reasonably warrant. Some conditions recover naturally over time; rest, care, treatment, and appropriate items may accelerate or support recovery. Not every condition responds to the same remedy: rest may relieve fatigue, for example, but should not automatically cure an injury or erase a social or institutional consequence. Some conditions may become lasting or permanent.

The specific condition list, modifier values, stacking limits if any, duration rules, treatment effects, and recovery balance remain open design work.

### 3.5 Tone

The tone is grounded, human, and occasionally wry. The game can contain bureaucracy, absurdity, petty rivalries, corruption, friendship, ambition, generosity, grief, and discovery. It should avoid presenting ancient people as caricatures or treating every event as a grand epic. Much of history is made through ordinary people doing consequential work.

---

## 4. Historical Scope and Era Progression

The game begins in Uruk around 3200 BCE and follows a selected chronology of major developments in writing and communication. Dates are approximate historical settings for playable eras, not claims that a particular invention appeared precisely at the start of each era.

### 4.1 The seven planned eras

| Era | Historical setting | Approximate period | Broad focus |
|---|---|---|---|
| I. Sumerian Cuneiform | Uruk and southern Mesopotamia | c. 3200 BCE | Early administrative records, commodities, institutions, and the emergence of writing |
| II. Egyptian Hieroglyphs | Ancient Egypt | c. 3000 BCE | Monumental, religious, administrative, and material contexts of writing |
| III. Earliest Coherent Texts | Mesopotamia and neighboring traditions | c. 2600 BCE | Developed literary, scholarly, and institutional texts |
| IV. Alphabetic Development | Eastern Mediterranean and neighboring regions | c. 1850 BCE | Alphabetic systems, correspondence, trade, and expanding written networks |
| V. Mesoamerican Scripts | Mesoamerica | c. 500 BCE–1 CE | Independent writing traditions, calendrical records, rulership, and monumental inscription |
| VI. Printing Press | Europe and connected print networks | c. 1436 CE | Mechanical reproduction, books, pamphlets, circulation, and public debate |
| VII. Digital Writing | Networked digital era | c. 1971 CE | Electronic text, computation, networks, and the changing scale of information |

The sequence is a curated historical journey, not a claim that writing developed in one straight line or that each era replaced the previous one. Distinct writing traditions arose in different places and continued alongside one another. The selected eras are the current main progression path. Other traditions may be explored through later branches or expansions without being forced into this seven-era sequence.

### 4.2 Era identity

Each era should introduce meaningful differences in:

- Institutions and the people who employ or consult scribes.
- Types and purposes of documents.
- Materials, tools, and methods of authentication.
- Writing conventions and expectations of literacy.
- Trade, administration, education, law, religion, and political context.
- Social consequences of creating, controlling, copying, and circulating information.
- The Works that represent consequential uses of writing and knowledge in that period.

An era must not be only a visual reskin of the previous one. At the same time, the central player activity—understand, organize, record, and take responsibility—should remain recognizable.

### 4.3 Historical Progress XP thresholds

The current cumulative thresholds are retained as **legacy balancing targets**, not as a calendar conversion. The previous 365-XP-per-year rationale is removed: Historical Progress XP does not advance the calendar, and the calendar does not need to move at a fixed rate to match these values.

| Era reached | Current cumulative target |
|---|---:|
| Era I — Sumerian Cuneiform | 0 |
| Era II — Egyptian Hieroglyphs | 73,000 |
| Era III — Earliest Coherent Texts | 219,000 |
| Era IV — Alphabetic Development | 492,750 |
| Era V — Mesoamerican Scripts | 985,500 |
| Era VI — Printing Press | 1,691,775 |
| Era VII — Digital Writing | 1,887,050 |

These values remain provisional until the required Works and their awards are authored and playtested together. The progression invariant is more important than preserving the current numbers: the required Works for a transition must award exactly the XP increment needed for that transition, with no mandatory grind. Rounder thresholds may replace this table during the next progression-balancing pass.

### 4.4 Advancing between eras
Advancement is tied to a defined portfolio of required Works and their Historical Progress XP awards. A period may offer several historically grounded Works, including date-based milestone invitations and smaller career-scale undertakings. The exact required combination, the extent of player choice, and how missed or declined milestone invitations are accommodated must be defined for each progression transition. Historical advancement must not depend on accepting every invitation or following one fixed sequence of authored quests.

**Progression invariant:** for every era transition, the Works designated as required for that transition must award exactly the XP increment needed to reach the next threshold. Optional Assignments, Challenges, purchases, and repeatable actions award no Historical Progress XP. A player who completes the required Work portfolio therefore reaches the threshold without grinding optional content.

The in-game calendar—not Historical Progress XP—sets the date. Each completed day advances the current local date by one day. Era transitions use authored time and location transitions, including the years, generations, travel, and institutional changes required by the narrative. The number of in-game days spent in an era is determined by the Works, optional activities, and authored transitions, not by dividing XP by a yearly rate. Era pacing must be measured in playtests and is not yet fixed.

---

## 5. The Three Gameplay Layers

The game's main activities are deliberately separated. They can intersect narratively and mechanically, but they are not interchangeable.

### 5.1 Assignments / Commissions

Assignments are short, optional professional jobs offered by employers, institutions, officials, merchants, and other contacts. They are the ordinary work of the player's career.

Examples include:
- Receiving and reconciling deliveries.
- Checking inventory and storage records.
- Recording distributions and allocations.
- Investigating discrepancies in accounts.
- Preparing receipts, orders, reports, and correspondence.
- Recording labor, obligations, and institutional activity.
- Resolving administrative disputes and preparing findings.

Assignments are optional professional opportunities available during the workday. Each substantive step uses the shared daily AP budget. Offers normally expire three in-game days after presentation if not accepted; the default expiry is the offered day plus three, and expiry is applied during daily settlement. A character may hold at most two accepted Assignments at once. Accepting or declining an offer costs no AP; cancelling an accepted Assignment costs 1 AP. Cancellation has no automatic relationship or institutional penalty: only consequences explicitly authored for that Assignment apply. Accepted work remains active until resolved or cancelled. In the current atomic resolution model, an Assignment authors a visible AP cost from 1–6, charged once when it is completed; its compensation and authored consequences are applied in the same transaction. Future multi-stage Assignments may charge for substantive stages across multiple days, but must not charge both a full-scope cost and separate stage costs. Completing an Assignment can award Career XP, money, provisions, and other appropriate authored consequences. Assignments do not directly award Historical Progress XP.

### 5.2 Challenges

Challenges are separate, optional scenarios. They are not simply another commission and are not ordinary paid employment. They can present unusual circumstances, investigations, ethical choices, or wider consequences.

Challenges may arise from:
- Patterns in the player's professional choices.
- Opportunities repeatedly neglected or avoided.
- Particular institutions, commodities, locations, or people encountered.
- Relationships, rivalries, favors, or prior decisions.
- Historical events that alter the local situation.

Behavioral triggers should consider opportunities presented as well as choices made. A history that records only completed assignments can misread player behavior. The Challenge Director should consume compact aggregates of presented, accepted, declined, non-Work-lapsed, and completed Assignments by employer, category, and commodity, plus no more than the five most recent activity entries; it must not scan an unbounded event log. An offer that lapses while the character is engaged in a mandatory Work is marked as such and excluded from non-Work lapse counts, so it cannot be treated as neglect. For example, repeatedly choosing routine grain records means something different if the player was never offered other kinds of work. Challenge logic should distinguish what the player could have chosen from what they actually chose, accepted, declined, or ignored.

Challenges can grant Career XP, resources, relationship changes, faction changes, knowledge, or consequences. In the current atomic resolution model, each Challenge authors a visible AP cost from 1–6, charged when the player commits a ruling; the AP charge and all consequences succeed or fail together. Future multi-stage Challenges may charge for individual substantive stages across multiple days. Challenges do not award Historical Progress XP and cannot be required to complete a mandatory Work or advance an era.

The player-facing Career Journal is an outcome archive, not a complete event log. It records **completed Challenges only**, including their outcome and completion details where available. Offers, acceptances, declines, and lapses remain operational Challenge state where needed for simulation and behavioral triggers, but they are not permanent Career Journal entries.

Challenge outcomes must reflect the player's decisions. Different rulings or resolutions should produce meaningfully different consequences, not merely different text followed by the same reward and epilogue.

Historical events can create new Challenges or alter existing ones. Examples might include a fire, a succession, a civic festival, a political crisis, or the loss of an archive. Such events should be contextual to the era and should affect people and institutions rather than serve only as random prompts.

### Career Journal and record lifecycle

The Career Journal is a compact career dashboard, not a complete event log. Its ordinary view presents current Challenges, professional reputation, career totals, and a bounded recent-activity list (five Assignment entries). Routine completed Assignments update compact aggregate statistics used by the Challenge Director; their full detail does not accumulate indefinitely in the everyday Journal.

Completed Challenges move out of operational Challenge state into a permanent outcome archive. Their meaningful outcome and completion context are retained. Offers, acceptances, declines, and lapses remain operational only while needed by the Challenge system; they are not permanent Journal entries by default.

A separate archive view exposes durable notable career records and completed Challenge outcomes. Archive records should preserve context that can matter later: era, institution, involved character, date, decision or outcome, and consequences where those fields exist. Routine activity is represented by career totals and recent activity rather than an unlimited detailed list. Future Assignment and Work content may explicitly designate a record as notable when it has lasting narrative, institutional, relational, or historical significance.

The Challenge Director must evaluate relevant professional patterns from compact aggregates rather than repeatedly scanning the full career archive. Aggregation must preserve distinctions required by its rules, especially completed activity by employer/category/commodity and, when opportunity tracking is implemented, opportunities presented versus accepted, declined, or allowed to lapse. The current prototype's simple trigger rules are preserved; this record-lifecycle change does not approve new Challenge trigger behavior.

### 5.3 Works

Works are historically grounded professional undertakings through which the player participates in the creation, preservation, organization, reproduction, dissemination, or use of knowledge. They remain the main historical progression layer, but they do not all need to be enormous projects or follow one universal structure.

The original concept remains important: Works should help the player experience what writing has made possible and how people have used it across history. Real historical developments provide a strong source of subject matter and narrative direction. A Work may be inspired by a documented historical undertaking, a broader development in recordkeeping or knowledge, or a plausible professional activity within the period. Historical grounding does not require the game to claim that its fictional player or characters performed a documented historical person's actual work.

Works can vary substantially in scale and presentation:
- **Historical milestone Works** may be larger, authored, quest-like experiences built around a significant historical development or undertaking. These are opportunities for scripted characters, particular institutions, consequential choices, and historically specific gameplay.
- **Career-scale Works** may be smaller and more numerous professional undertakings that let the player contribute to the period's wider work of recording, organizing, preserving, interpreting, and circulating knowledge.
- Some Works may be fully authored; others may use established scenario structures with authored historical context and characters. A hybrid is appropriate where it creates better play.

These are useful content distinctions, not separate mechanics or a fixed taxonomy. A Work's size, stages, and interaction should follow its subject. Later Works must not simply repeat the Storehouse Reckoning's accounting workflow with different materials.

#### Date-based historical invitations

Some historically significant Works become available as **date-based invitations**. History establishes when an undertaking or opportunity becomes relevant; the player's career and circumstances shape whether and how they can participate.

1. **Historical window:** The undertaking becomes available within an appropriate date or period. Use a precise date only where the evidence supports that precision; otherwise use a broader availability window.
2. **Invitation and discovery:** The player learns of the opportunity through a plausible person, institution, notice, correspondence, colleague, patron, or other channel available to the character. An invitation need not be a personal summons from an important figure.
3. **Eligibility and access:** Skills determine whether the character qualifies for the specific work. Professional rank shapes the baseline range of opportunities likely to reach the character; relationships may provide specific introductions, specializations may open discipline-specific opportunities, reputation may affect whether people approach or trust the character, and appointments may create office-related opportunities and responsibilities. Location and current commitments also matter. These factors should create plausible access conditions, not arbitrary gates. Rank is not a substitute for a required skill or appointment, and it must never remove every viable route to a Work required for historical progression. Required Works and their alternative routes must remain reachable regardless of rank; a lower rank may change how the character learns of or participates in a milestone, but not whether a valid progression route exists.
4. **Participation:** The player undertakes the Work, potentially alongside other people, with the scale and structure appropriate to its subject.
5. **Consequences:** The Work affects the people, institutions, records, and later opportunities involved. Completion may contribute Historical Progress XP according to the progression rules.

An invitation is an opportunity, not a guarantee of participation. The player may accept, decline, miss, or become unable to pursue it; the historical world does not wait or rearrange itself. The game must not imply that the player's character personally caused a major historical development merely because they participated in a related undertaking. Where a milestone opportunity is missed or declined, the player should still have a coherent historical career and progression route through other available Works. The exact portfolio of required Works, alternative routes, and progression thresholds remains to be designed.

Not every Work needs a special invitation or a major historical event. Ordinary professional opportunities and ongoing institutional needs can also provide the context for smaller Works. Works should be presented through the player's situated knowledge and plausible social or institutional connections, not as an omniscient quest feed.

Every Work definition must include:
- A historical and social context, including what is known and what is fictionalized for play.
- A human problem and a concrete reason the undertaking matters.
- Named or clearly identified people, institutions, locations, and relationships.
- The initial scenario state and all relevant facts.
- The evidence available to the player, including provenance and reliability.
- The actions the player can take, their action costs, and any prerequisites.
- Stages or other playable structure appropriate to the Work's scale, with objectives, deliverables, and state changes.
- A solution space: acceptable outcomes, factual invariants, and unsupported conclusions.
- Evaluation rules and explainable consequences appropriate to the scenario.
- Recovery or correction paths for mistakes that should not permanently soft-lock the Work.
- The Work's effect on people, institutions, records, and later play.
- Its Historical Progress XP award, if it contributes to historical progression, and any justified Career XP award.
- A completion condition that does not depend on optional Assignments or Challenges.

Works use the same daily Action Points as Assignments, study, and other substantive activities. They may span multiple days, but a Work's scale should not be inflated merely to occupy time. Optional content may improve the player's information, relationships, resources, or outcome, but must not become a hidden prerequisite for mandatory historical progression.

The first complete Era I example is specified in Section 7. It is a vertical slice for validating one kind of Work, not a template that all later Works must follow.

### 5.4 How the layers interact

| Layer | Optional? | Primary progression reward | Uses daily Action Points? | Can gate era advancement? ||---|---|---|---|---|
| Assignments / Commissions | Yes | Career XP and employment compensation | Yes | No |
| Challenges | Yes | Career XP and scenario-specific consequences | Yes, when they require substantive actions | No |
| Works | Required for main historical progression | Historical Progress XP; may also recognize professional contribution with Career XP | Yes | Yes |

Assignments and Challenges can enrich, support, or change the outcome of Works. They must not become hidden mandatory prerequisites.

---

## 6. Workday and Action Economy

### 6.1 Turn-based calendar

The workday is turn-based, not a real-time countdown. There is no live shift clock, gameplay deadline countdown, or real-time commission timer. The player manages activities at their own pace and explicitly chooses when to end the day.

The in-game date advances once when the player ends the day. The calendar controls dates, seasons, and the timing of authored events. Historical Progress XP does not advance time; it measures progress through the curated historical journey.

### 6.2 Daily Action Points

Each in-game day provides **6 Action Points (AP)**. AP represent the player's finite capacity to perform meaningful work and personal activities during that day. They are an abstract planning unit, not a real-time timer and not a fixed number of commission slots.

**Current approved model:** six AP is the locked Workday model for the current development phase. The alternative four-time-block proposal is not approved and must not be used as an implementation assumption. Any future change requires explicit owner approval and revision of this section.

- AP are shared by Assignments, Work activities, Challenges, study, substantial social visits, and other activities that require time or effort.
- AP reset to 6 at the start of each new day.
- Unused AP do not carry over.
- The player may end the day early and leave AP unused.
- No activity is mandatory merely because AP remain.
- Opening the status screen, reviewing evidence already acquired, reading the current Work plan, and inspecting the player's own completed records do not cost AP.

Initial action-cost guidance:

| Action | Typical cost |
|---|---:|
| Examine one straightforward source or conduct a brief conversation | 1 AP |
| Compare several records or consult a relevant specialist | 1–2 AP |
| Conduct a physical inspection or recount | 2 AP |
| Draft or revise a structured document | 1–2 AP |
| Run a formal audit or multi-party inquiry | 2–3 AP |
| Complete a routine Assignment | 2 AP |
| Complete a demanding Assignment | 3 AP |
| Study or undertake focused training | 1 AP |
| Substantial relationship visit or mentorship session | 1–2 AP |

These are starting balance values established for the vertical slice. A particular action may cost more or less when its scope is clearly different, but costs must be shown before the player commits. Do not add hidden AP costs after an action is selected.

Stress is a separate system. AP costs represent time and capacity; stress changes represent pressure and consequences. Ordinary actions should not automatically consume both. High-stakes, exhausting, or emotionally difficult actions may change stress when the scenario gives a clear reason.

### 6.3 Assignments and opportunity lifecycle

The professional opportunity board presents a changing set of available Assignments. The player can pursue any combination that fits the daily AP budget; there are no fixed daily assignment slots.

An unaccepted offer is normally available for three in-game days from the day it appears. At the end of that period it expires and is removed from the active board. Individual scenarios may specify a different period when their context requires it, but the duration must be visible to the player. Expiry is a calendar consequence, not a real-time countdown. The board should normally present more new opportunity-cost than the player can complete in a day; as an initial content target, offer roughly 8 AP worth of new Assignments per day against the 6-AP budget. This is a tuning target, not a quota. Rank and other access factors may change the composition and source of offers, but low rank must not systematically reduce the baseline volume of ordinary playable work. The 8-AP target concerns the overall mix of newly presented Assignments, not a rank-based entitlement or a guarantee that every offer suits every character.

The player may hold at most **two accepted Assignments** at once. Accepting an offer costs no AP, but it occupies one of those commitment slots. When both slots are occupied, the player must complete or cancel an accepted Assignment before accepting another. Cancelling an accepted Assignment costs 1 AP and may affect trust or reputation only when the specific employer or circumstances make that consequence credible; the penalty is not automatic. The cancellation cost and any relationship consequence are shown before confirmation.

The Assignment lifecycle uses explicit states:
- **Offered:** presented to the character and awaiting a decision; the offer has a visible calendar expiry.
- **Accepted:** the player commits to the Assignment. It remains active until completed or cancelled; it does not silently disappear on the original offer timer.
- **Declined:** the player explicitly refuses the offer. The refusal is recorded, but does not automatically create a penalty.
- **Lapsed:** the player takes no action before the offer expires. A lapse during a mandatory Work is marked separately and excluded from neglect-based Challenge counts.
- **Completed:** the accepted Assignment has been resolved and its authored compensation and consequences applied.
- **Cancelled:** the player ends an accepted Assignment by spending 1 AP. Only scenario-authored cancellation consequences apply; there is no default penalty.

An expired or declined offer may contribute to a later Challenge only when the underlying situation has a credible consequence or a meaningful pattern has emerged. **Offers that expire while the player is occupied with a mandatory Work do not count as ignored opportunities for behavioral Challenge triggers.** The system records that they were unavailable in practical terms because the player had a mandatory commitment. Behavioral logic must distinguish offers presented, offers accepted, offers declined, offers allowed to lapse without a conflicting mandatory commitment, and work actually completed.

### 6.4 Evening and free time

Study, mentorship, rest, relationship visits, family responsibilities, and preparation use the same daily AP budget when they require meaningful time. There is no separate unlimited evening action phase. This prevents the player from completing every available activity and then receiving all benefits without trade-offs.

Overtime is an end-of-day option, not an activity available during normal AP allocation. It may be offered only after the player has spent all six daily Action Points, before the day is settled. Using it grants one additional Action Point for immediate use that day, adds 5 Stress, and reduces the following day's AP allocation by one (five instead of six). The overtime AP can be spent on any otherwise available AP action. The interface and action handler must both enforce the zero-AP activation condition. The next-day reduction is a fixed one-AP penalty, not a cumulative penalty: using overtime on a five-AP day still leaves the following day at five AP, not four.

The established study reward of 15 Career XP once per day remains provisional. It must be rebalanced against the AP cost and actual Career XP earned through Assignments, Challenges, and Works before rank pacing is considered final.

### 6.5 Ending the day

The player explicitly ends the in-game day. Daily settlement occurs exactly once. It applies compensation from completed work or active contracts, penalties, sustenance, shortages, stress consequences, and calendar advancement in a documented order. The player reviews the settlement before beginning the next day.

The settlement must not grant a universal free ration merely because a day passed. Any money, provisions, or specific item credited as compensation must be tied to a defined employment arrangement, completed service, or explicit reward. The details of the sustenance model are defined in Section 12.

---

## 7. Era I Vertical Slice: The Storehouse Reckoning

### 7.1 Purpose and scope

**The Storehouse Reckoning** is the first mandatory Work and the design test for the Work system. It takes place in a fictional institutional storehouse in Uruk around 3200 BCE. Its people and immediate incident are fictional; the scenario reflects early administrative uses of impressed clay records without claiming to depict a documented historical event or the invention of writing itself.

This Work is a **supervised apprenticeship assessment**, not a request to invent a permanent stockkeeping system. The Storehouse Steward has submitted a situation requiring a one-time reconciliation and practical recommendation. The Senior Scribe assigns the case to the apprentice, evaluates the resulting document, provides instruction, and decides what action to authorize or forward.

The document's primary reader is the **Storehouse Steward**. The apprentice answers to the **Senior Scribe**. The Steward would not ordinarily commission an apprentice directly; the Senior Scribe uses the Steward's case as real professional work through which to assess the apprentice.

The Work tests whether the apprentice can:
- Reconcile opening stock, dispatch, physical receipt, issue, and closing condition.
- Preserve the distinction between usable and held stock.
- Distinguish an established fact from an inference or unresolved cause.
- Cite the records that support material claims.
- Recommend practical, proportionate action without exceeding the evidence.
- Respond to assessment and instruction, revising deficient work where appropriate.

The Work does not ask the apprentice to solve a crime, identify a culprit, design a reusable register, or prove a new recordkeeping system against artificial unseen transactions. The ordinary institutional problem need not be sensational; its significance comes from the people relying on the account and the decisions it supports.

### 7.2 People and institutional roles

| Person / role | Interest and responsibility |
|---|---|
| **Senior Scribe Shuruppak-ilu** | Assigns the case as an apprenticeship assessment, evaluates the account and recommendation, instructs the apprentice, and decides what action to authorize or forward. |
| **Storehouse Steward Ur-Nanna** | The client and primary reader. Needs an accurate account of stock and a defensible recommendation for dealing with held goods and the reported roof leak. |
| **Receiving Official Utu-mansum** | The source of the intake inspection record. The record establishes the condition classification at intake, not the later cause of damage. |
| **Carrier Foreman Enlil-kisu** | Identified as the source of the dispatch record. The dispatch record and arrival tally are compared; no separate interview is required to manufacture corroboration. |
| **Brewing-House Representative Nin-kasi** | Identified in the issue receipt. The record establishes the recipient and receipt of the authorized issue; no redundant confirmation action is required. |

The apprentice is not the authority responsible for storehouse operations. Their recommendation is addressed to the Senior Scribe. The Senior Scribe's disposition determines whether the account is accepted, whether the recommendation is approved, and what follow-up is authorized or forwarded.

### 7.3 Initial scenario state and evidence dossier

The Steward's case concerns a difference between the intake condition record and a later physical count. The dossier contains the following records:

| Evidence ID | Source | What it establishes |
|---|---|---|
| E-01 | Prior closing-balance tablet, held in the temple archive | The storehouse began the accounting period with 24 usable standard institutional measures of clean barley. |
| E-02 | Dispatch tablet from the outer fields, attributed to Carrier Foreman Enlil-kisu | 60 standard institutional measures were loaded onto river barges and dispatched to the central storehouse under dispatch seal #4. |
| E-03 | Arrival tally at the receiving desk | 60 measures were physically unloaded and counted at the landing dock. |
| E-04 | Initial receiving inspection tally, recorded by Receiving Official Utu-mansum | At intake, 56 measures were classified as dry and usable; 4 measures showed moisture damage and were segregated and held. |
| E-05 | Issue instruction and Brewing-House receipt, associated with Representative Nin-kasi | 30 usable measures were authorized by temple decree and issued to the brewing-house operation for its brewing work. The representative's receipt confirms physical delivery. |
| E-06 | Custody and maintenance notes from Storehouse Steward Ur-Nanna | A severe rainstorm caused a roof leak over the north storage bay after intake. The leak lasted two days before repairs were made. The exact timing of moisture spread is unrecorded. |
| E-07 | Later witnessed physical recount with the Steward | 47 measures are usable and 7 are damp and held. Total physical stock is 54 measures. |

The minimum case packet contains E-01 through E-05 and E-07. E-06 is an additional record the apprentice may request. It is necessary to cite the reported roof leak as contextual evidence, but not necessary to conclude that the precise cause of the additional damage remains unestablished.

The figures do not show missing stock. Dispatch and physical receipt both equal 60. The 30-measure issue is supported by an instruction and receipt. The total closing quantity is 54, consisting of 47 usable and 7 held. Compared with intake, three additional measures have changed from usable to held status. The roof leak is a plausible contextual event, but the record does not establish exactly when the moisture spread or who was responsible.

The phrase **standard institutional measure** is a gameplay abstraction. Exact historical metrology and local terminology must be researched during historical content production. It must not be represented as a modern kilogram or a universal Mesopotamian measure.

### 7.4 State model and factual invariants

The authored underlying state is:

- Opening usable stock: 24.
- Dispatch quantity: 60.
- Physical receipt: 60.
- Usable at intake: 56.
- Held at intake: 4.
- Authorized and completed issue to the brewing-house operation: 30.
- Usable at recount: 47.
- Held at recount: 7.
- Additional status movement from usable to held: 3.
- Total closing stock: 54.

The required relationships are:

1. Dispatch and physical receipt are separate facts; both happen to be 60 in this case.
2. Intake condition is 56 usable and 4 held.
3. The later recount is 47 usable and 7 held.
4. The 30-measure issue went to the brewing-house operation under the supplied temple authority.
5. Opening stock plus physical receipt minus issue equals total closing stock: 24 + 60 − 30 = 54.
6. Closing usable plus held stock equals total closing stock: 47 + 7 = 54.
7. The usable balance reconciles as 24 + 56 − 30 − 3 = 47.
8. The held balance reconciles as 4 + 3 = 7.
9. The three-measure status movement is not a disappearance or a new receipt.
10. The reported roof leak does not establish precise causation or individual responsibility.

The assessment evaluates these relationships and the apprentice's treatment of evidence. It must not depend on one exact sentence where multiple phrasings preserve the same factual meaning.

### 7.5 Work sequence and player actions

The Work has three practical phases. These are not a universal Work template; they fit this supervised document assignment.

**Phase A — Examine the case**

The Senior Scribe provides the case brief and identifies the intended reader and purpose of the document. The apprentice examines the available records. Reading an acquired record again is free.

| Action | Cost | Result |
|---|---:|---|
| Compare opening, dispatch, and arrival records (E-01, E-02, E-03) | 1 AP | Establishes opening stock, dispatch, and physical receipt. |
| Examine intake inspection and issue records (E-04, E-05) | 1 AP | Establishes intake condition, issue quantity, recipient, and authority. |
| Review the witnessed physical recount with the Steward (E-07) | 2 AP | Establishes current usable and held quantities. |
| Request custody and maintenance notes (E-06) | 1 AP | Adds the reported roof leak as contextual evidence, with its limits. |

The first three actions establish the minimum evidence needed to prepare the account. The custody note is optional unless the apprentice wishes to include the roof leak as a reported event in the finding. There is no separate Carrier Foreman consultation or redundant Brewing-House confirmation action: the supplied records already provide the relevant dispatch and receipt evidence. Every AP cost must be visible before commitment.

**Phase B — Prepare the reconciliation**

The apprentice prepares a one-time document for the Steward. The document records:
- Opening usable stock.
- Quantity dispatched and quantity physically received, separately.
- Usable and held quantities at intake.
- The authorized issue, its recipient, and its purpose.
- Usable and held quantities at the later recount.
- The reconciliation of total and usable balances.
- Source references for material figures and claims.
- A finding that distinguishes the established status change from any unproven cause.
- A practical recommendation for follow-up.

The apprentice selects the figures, finding, supporting source references, and recommended actions. The interface should explain the purpose of the document and why the distinctions matter; it must not present a completed target document to copy.

The recommendation may include:
- Inspect the seven held measures before any are returned to usable stock.
- Keep held measures segregated pending inspection.
- Inspect the north storage bay and verify that the reported roof repair has addressed the problem.
- Request further inquiry into the cause if the institution considers it necessary.

The apprentice may also make an unsupported recommendation, such as assigning individual blame. The assessment should explain why that exceeds the available evidence. The apprentice recommends; the Senior Scribe retains authority.

Drafting and initial submission cost 2 AP. A revision and resubmission costs 1 AP. All costs are shown before commitment.

**Phase C — Assessment, instruction, and disposition**

The Senior Scribe assesses the submitted document in three distinct dimensions:

1. **Accounting accuracy:** Are the quantities and stock relationships correct? Are dispatch, receipt, issue, usable stock, held stock, and closing total distinguished?
2. **Evidence and provenance:** Are material figures and claims supported by the appropriate records? Does the finding preserve the limits of the evidence?
3. **Professional judgment:** Does the recommendation identify useful, proportionate action? Does it avoid assigning responsibility or asserting causation beyond what is established?

The assessment is not a single pass/fail checklist. A correct account may accompany a poor recommendation; a sound recommendation cannot compensate for incorrect figures. Feedback identifies the dimension that needs attention and explains why.

Instruction follows the assessment. The Senior Scribe explains the relevant professional standard and what should be corrected. Where the account or evidence is deficient, the apprentice may revise and resubmit. The Work must not permanently soft-lock after a mistake.

The Senior Scribe then makes the disposition:
- **Accept and authorize/forward the recommendation:** the account and evidence are sound, and the recommendation is proportionate.
- **Accept the account but withhold the recommendation:** the figures and sources are reliable, but the proposed action is not adequately justified. The Senior Scribe determines the follow-up separately.
- **Return the document for correction:** the account or evidence is not reliable enough to support institutional action.

The player should see which parts of the work were accepted, which were not, and what the Senior Scribe decided. Institutional authority is not transferred to the apprentice.

### 7.6 Evaluation and feedback

Evaluation is deterministic and based on the authored evidence and scenario invariants. It does not use runtime generative AI.

**Accounting assessment**
- Checks all eight core quantities and their relationships.
- Distinguishes physical receipt from dispatch.
- Preserves the intake and later condition snapshots.
- Accounts for the 30-measure issue and the closing total.
- Recognizes the three-measure status movement.

**Evidence assessment**
- Requires sources for the opening balance, dispatch, arrival, intake, issue, and recount.
- Requires E-06 if the roof leak is included as a reported event.
- Rejects a finding that describes the three measures as missing or assigns unsupported blame.
- Does not punish the apprentice for leaving the cause unresolved.

**Professional-judgment assessment**
- Rewards a practical response to the seven held measures.
- Recognizes proportionate inspection, segregation, and verification of the reported roof repair.
- Rejects unsupported assignment of individual responsibility.
- Evaluates the recommendation separately from arithmetic accuracy.

The interface must not conceal all standards until after submission. The apprentice should understand the document's purpose and the importance of source support before committing. The assessment then evaluates the actual submission and provides the more specific instruction.

### 7.7 Consequences and institutional response

The recommendation matters to the Senior Scribe because it informs the action they may authorize or forward. The apprentice does not directly command the Steward or authorize institutional expenditure.

A sound submission can lead to inspection of the held stock, continued segregation pending inspection, and a check that the north-bay roof repair is adequate. No person is blamed on the current evidence. An accurate account with an unsupported recommendation can still be accepted as an account while the recommendation is withheld. An unreliable account is returned before it is used to authorize action.

The Work must preserve separate outcomes for accounting accuracy, evidence discipline, and professional judgment. Do not collapse them into one opaque score or make an arithmetic error silently change the underlying stock state.

### 7.8 Work contract and provisions

The apprentice is assigned to this Work under a specific institutional service arrangement. For each in-game day on which the Storehouse Reckoning remains active, the player must spend at least 1 AP on a Storehouse Reckoning action to qualify for **one unit of provisions** as the apprentice's meal provision. This is not a universal daily gift: it is compensation in kind under the Work contract and ends when the Work is completed, abandoned, or formally suspended. If the player spends no AP on the contracted Work that day, no Work provision is credited.

Beer is not part of the player's tracked personal economy or this daily food provision. It may still appear as a world commodity, an inventory item in a specific situation, or part of hospitality and social or institutional exchanges.

If the Work is suspended or abandoned, provisions stop according to the stated contract terms. The player must be told before confirming a suspension or abandonment. This arrangement ensures that the mandatory Work does not require the player to take optional Assignments merely to eat while performing the institution's contracted work.

### 7.9 Action-budget test and expected duration

The minimum evidence path costs 4 AP: 1 AP for the opening/dispatch/arrival comparison, 1 AP for intake/issue records, and 2 AP for the physical recount. Requesting E-06 costs 1 additional AP. Initial submission costs 2 AP, and the Senior Scribe's disposition costs 1 AP. A first-time player who examines the complete dossier, prepares a complete document, and receives a disposition should therefore expect to spend approximately 7–8 AP, with additional AP for revision.

This is a tuning target, not a deadline. The Work may span two or more in-game days depending on the optional custody record, mistakes, and revision. The AP cost of every substantive action must be visible before commitment. Reviewing already acquired evidence, the case brief, and prior assessment feedback is free.

### 7.10 Completion and progression reward

The Work is complete when the Senior Scribe has issued a disposition: acceptance and authorization/forwarding, acceptance of the account while withholding the recommendation, or return for correction followed by a final disposition. A returned submission is not complete until it is corrected sufficiently for a final decision.

The Work awards its fixed Historical Progress XP as part of the required Era I Work set. The exact award is allocated alongside the other mandatory Works and must satisfy the progression invariant in Section 4.4. A professional contribution may also award Career XP, separately balanced against other career activities. The current prototype reward values are provisional implementation values, not approved GDD balance.

### 7.11 What this vertical slice validates

The revised Work tests whether the player can:
- Understand who requested the document, who will use it, and why it matters.
- Examine a compact dossier and reconstruct a stock position.
- Distinguish dispatch, receipt, issue, condition, and balance.
- Preserve uncertainty rather than invent a cause or culprit.
- Make a practical recommendation with consequences for institutional action.
- Receive an assessment that separates accounting, evidence, and judgment.
- Learn from instruction and revise deficient work.

It does not test permanent register design, reusable register adoption, or unseen transaction validation. Those mechanics are removed from this Work. Future Works must introduce human and informational problems appropriate to their own subjects rather than repeat this storehouse scenario with different commodities.

## 8. The Assignment Gameplay Loop

A typical Assignment follows this sequence. The AP cost is shown before acceptance and covers the defined scope of the job; a larger or multi-stage Assignment may require additional AP across more than one day. Reviewing already acquired evidence and navigating the document interface do not create hidden costs: the stated cost covers the substantive work. Challenges use the same principle, with costs based on their scope.

1. **Receive:** A person or institution presents a dispatch or request.
2. **Understand:** Read the situation and identify what must be established or recorded.
3. **Examine:** Review evidence, testimony, existing records, physical findings, and instructions.
4. **Interpret:** Determine what is known, what is missing, what conflicts, and which sources are reliable.
5. **Decide:** Make the required administrative, factual, or procedural judgment.
6. **Construct:** Complete the appropriate structured document.
7. **Review:** Check the assembled record for accuracy and completeness.
8. **Submit or certify:** Make the record official within the scenario's context.
9. **Resolve:** Receive an evaluation and experience the resulting consequences.

The player should never be shown a completed target document to copy. The dispatch provides the situation, instructions, and evidence—not the answer.

### 8.1 Complete contextual records

Assignments should use the relevant dimensions of a complete record:
- **Who:** parties, witnesses, officials, responsible people, or affected groups.
- **What:** the event, transaction, request, dispute, or action.
- **Quantity:** amount, count, measure, classification, or value where relevant.
- **When:** date, period, sequence, or time of the recorded event.
- **Where:** location, institution, field, storehouse, office, or destination.
- **From:** origin, source, sender, or previous custodian.
- **To:** recipient, destination, beneficiary, or next custodian.
- **Purpose:** why the transaction or action occurred.
- **Responsibility:** who performed, approved, witnessed, or is accountable for it.
- **Authority:** the office, instruction, agreement, decree, or procedure that legitimizes the action when relevant.
- **Provenance:** where the information came from and how it is supported.

Not every record requires every field. Each assignment defines its relevant fields and roles. Do not invent a sender, recipient, witness, or authority simply to fill a template. Roles must reflect the actual situation.

### 8.2 Evidence and source quality

Evidence can include primary records, physical evidence, tallies, seals, testimony, depositions, inspection reports, correspondence, and prior documents. Sources may agree, conflict, omit information, or have different reliability.

Every required factual field in an assignment should be supported by at least one explicit source in the dossier. When evidence conflicts, the player should be able to identify the conflict and decide how to handle it. A conclusion must not depend on information that was never supplied or reasonably inferable.

Evidence should be presented in a way that lets the player distinguish:
- Direct observation or primary record.
- Testimony or reported information.
- An inference drawn from multiple sources.
- An unsupported claim or unresolved question.

### 8.3 Events, records, and knowledge

Scenario design and persistent consequences must distinguish the underlying event from the record made about it and from what each person or institution knows.

- An event may occur without being witnessed, recorded, or widely known.
- A record represents an account of an event; it may be accurate, incomplete, disputed, mistaken, or deliberately misleading. Preserve its source and relevant amendments rather than silently replacing an earlier account with a later one.
- A person or institution may know something through direct involvement, testimony, a received copy, consultation of an archive, or public disclosure. Do not assume that everyone automatically knows what appears in a record.

The game should model these differences when they affect what a character can reasonably say or do, what an institution can authorize, or what later work can establish. This is not a requirement to simulate every communication or track every character's complete knowledge state. The level of detail must be justified by a meaningful gameplay consequence.

When a record becomes the basis for later action, preserve enough context to interpret it responsibly: what it asserts, who or what supports the assertion, its relevant limits or uncertainty, and whether it has been amended or challenged. A later consequence should arise from the record's actual content and circulation, not from a hidden assumption that all parties know the underlying truth.

### 8.4 Scenario consistency

Every Assignment must have a coherent underlying situation from which both the player-facing evidence and the expected solution are derived. Quantities must reconcile. Dates, people, institutions, locations, roles, and relationships must remain consistent throughout the dossier and resulting document.

Examples of basic accounting constraints:
- Delivered quantity equals accepted plus held plus rejected quantities, with missing or disputed quantities represented explicitly where appropriate.
- Opening stock plus receipts minus distributions equals closing stock.
- Recipient allocations plus any stated reserve equal the available quantity.

The game should not create evidence and an answer independently and then hope they agree.

---

## 9. Document Construction and Evaluation

### 9.1 Hybrid document workflow

The player first reasons about the situation, then constructs the record using the conventions of the current era. The interaction should be clear and purposeful. The game is not a typing-speed test, a sentence-copying exercise, or a realistic handwriting simulator.

Depending on era and professional development, the player may use:
- Selectable fields and classifications.
- Numeric controls and quantity reconciliation.
- Evidence references.
- Structured line items.
- Document layouts and templates.
- Rulings, authorizations, and seals.
- More independent construction of records as professional capability develops.

The player should see a readable preview of the resulting document and be able to review it before submission. The physical presentation changes with the era; in the opening Sumerian setting, clay tablets, tags, and sealed clay objects are appropriate. Parchment should not be used as the normal dispatch format in early Uruk.

### 9.2 What makes a good document

A record should be judged on more than appearance. A beautifully formatted document can still be wrong. Evaluate the quality of the player's judgment against the evidence available when the decision was made, not merely whether the conclusion matches a predetermined answer.

The assessment should distinguish:

- **Accuracy:** Are people, quantities, dates, classifications, and dispositions consistent with the available evidence?
- **Completeness:** Does the record preserve the relevant information, qualifications, and unresolved questions required by the task?
- **Responsible interpretation:** Does the player distinguish established facts, attributed claims, supported interpretations, and matters that remain unknown? Does the conclusion stay within what the evidence supports?

The document must also meet the requirements appropriate to its purpose:

- **Procedure:** Is the document type and authorization appropriate?
- **Traceability:** Can a reader understand where important claims came from?
- **Responsibility:** Does the record accurately identify who acted, approved, received, or remains accountable?

These dimensions are related but should not be collapsed into a single test of whether the player selected the expected answer. A record can get the quantities right while making an unsupported accusation, or preserve uncertainty responsibly while omitting a material detail. A more complete, qualified record may therefore be better than a narrower record that is technically accurate but leaves out a relevant unresolved issue. The task's actual purpose still determines what information is required; extra wording alone is not a virtue.

When the evidence genuinely permits more than one defensible conclusion, the game should recognize those alternatives. A reasonable conclusion later contradicted by new evidence should not be treated as equivalent to a careless conclusion that ignored evidence available at the time. Conversely, a claim that contradicts the evidence or asserts more than it supports should be judged poorly.

Where relevant, the player should be able to make a defensible record even if some facts remain uncertain. Recording uncertainty honestly can be better than inventing certainty.

### 9.3 Feedback and consequences

Feedback should explain what was correct, incomplete, unsupported, or incorrect. The game should distinguish a harmless omission from a consequential false record. A wrong quantity, an incorrect recipient, an omitted held item, or a forged authorization should not all have identical consequences.

Rulings and document choices must lead to outcomes that reflect what the player actually selected. Alternative decisions should have meaningful differences in trust, stress, resources, relationships, institutional standing, or later opportunities.

### 9.4 Character interpretation and internal monologue

When a character examines evidence, the presentation should include both the evidence itself and the character's internal response to it. The source material remains consistent; what changes is what this particular character notices, recognizes, infers, and understands.

The internal monologue is character-situated interpretation, not an omniscient explanation or a guaranteed hint. It should be generated from the examined evidence and the character's actual state. Relevant influences may include:

- **Skills and professional knowledge:** recognition of patterns, procedures, technical details, and implications.
- **Attributes and abilities:** perception, memory, reasoning, and other capacities relevant to the situation.
- **Experience:** familiarity gained through prior work and exposure to similar circumstances.
- **Equipment and items:** tools or reference materials that reveal, verify, or help interpret additional details.
- **Relationships and background:** contextual knowledge about people, institutions, practices, and prior events that the character plausibly possesses.
- **Current circumstances:** conditions that may affect attention, recall, confidence, or reasoning.

These influences shape interpretation, confidence, and the possibility of overlooking or misunderstanding significance. Low skill must not arbitrarily hide, falsify, or alter objective evidence already available to the character. The game should distinguish what the source states from what the character thinks it means, and should allow the character to recognize uncertainty or lack sufficient knowledge.

A character's interpretation may be incomplete or mistaken. The monologue must not reveal facts the character has no plausible way to know, nor should it automatically tell the player which action to select. It should communicate the character's reasoning and limits in a way that lets the player make the decision.

Keep four layers distinct: **evidence** (what the source provides), **interpretation** (what the character makes of it), **judgment** (what the character recommends or decides), and **assessment** (how another person evaluates that reasoning and its result). This is a reusable interaction principle across professions and eras, not dialogue authored separately for every possible skill value.

The approved engine contract represents interpretation as deterministic authored rules evaluated against the character and the set of evidence they have examined. Supported predicates include grouped logic, skill and attribute thresholds, traits, conditions, equipment, and cross-evidence examination requirements. Missing skill or attribute values do not count as meeting either a minimum or maximum threshold. Interpretation rules may be re-evaluated whenever the examined-evidence set changes. Objective evidence remains independently available and is never altered or hidden by an interpretation result. Authoring categories, conflict groups, and priority remain internal content metadata; only surviving annotation text and display data are presented. Conflicting rules resolve deterministically, while display order remains independent of rule priority.

---

## 10. Career Progression

### 10.1 Career XP

Career XP is earned through professional activity and serves as a shared investment currency for eligible skill improvements, specialization development, and other defined professional development. It is distinct from Historical Progress XP and does not measure the advancement of civilization. Career XP earned or spent is not itself a rank score; rank is derived from the current character's own skill profile.

Appropriate Career XP sources include:
- Successfully completed Assignments / Commissions.
- Optional professional Challenges.
- Qualifying study, training, and mentorship. The established evening-study reward is 15 Career XP, available once per in-game day.
- Recognized professional contribution to a Work, when appropriate.

The same activity should not award the same performance twice through separate scoring paths. Field accuracy and document evaluation should be incorporated coherently into the final commission award rather than accidentally counted multiple times.

Career XP is not awarded for merely selecting an answer, purchasing equipment, receiving daily wages, or accepting a bribe. Accepted bribes award zero Career XP and zero Historical Progress XP.

### 10.2 Professional rank

The design retains **seven continuous rank grades** as a broad measure of a character's professional standing. Rank is derived from the current character's own skill profile, not from cumulative Career XP, Career XP spent, historical era, reputation, or an inherited counter. When the player takes up a different scribal NPC, that character's rank follows from their own skills; no rank value is transferred from the former character.

The seven grades are numbered 1–7 for design purposes. The skill-to-rank formula, including how it rewards breadth without making a specialist's depth irrelevant, remains open. A breadth-oriented model and a ceiling on the highest grades for narrow specialists have been proposed, but the exact rule and its play consequences have not yet been approved.

Rank grades are not universal office titles, job titles, or appointments. The former labels Apprentice Scribe, Junior Scribe, Journeyman Scribe, Senior Scribe, Master Scribe, Chief Archivist, and Grand Archivist are removed as a universal ladder. In-world titles must be localized to the historical setting and the character's actual institutional context. In particular, Chief Archivist and Grand Archivist describe offices or positions rather than universal competence grades, while Senior Scribe already appears as a specific role in the Storehouse setting.

### 10.3 Rank and opportunity access

Rank has a defined job: it influences the **baseline range of professional opportunities likely to reach the character**. Higher rank can widen the character's ordinary professional reach, make broader institutional circles more likely to approach them, and affect the initial level of trust or responsibility an opportunity offers. Rank does not establish whether the character is competent to perform a particular task, and it does not grant formal authority.

Opportunity generation should use **a baseline range plus identifiable channels**, not an opaque composite score:

- **Rank** establishes the character's baseline professional reach and the broad kinds of opportunities normally presented.
- **Relationships** can provide specific introductions, recommendations, and invitations that would not otherwise reach the character.
- **Specializations** can surface focused opportunities that require depth in a particular discipline.
- **Appointments** create opportunities and responsibilities attached to an office; the appointment, not rank, grants its formal authority.
- **Reputation** influences whether a person or institution is willing to approach the character, trust their work, or offer particular terms and responsibility.

These factors do not add together into a hidden eligibility score. Each opportunity should store an intelligible delivery reason, grounded in one or more explicit channels: baseline professional reach, relationship, specialization, appointment, or reputation. Delivery/visibility is separate from skill qualification. The offer may reach a character who does not yet qualify; any skill prerequisites are separately stated and determine qualification. Rank shapes reach only and is never a competence gate. The player does not need to see opportunities that never reached the character, but should be able to read a plain-language description of their current professional standing and the kinds of work and invitations it typically attracts.

Skills determine qualification for a specific commission, action, or Work requirement. Any skill prerequisites must be stated at the opportunity level and shown to the player. Rank is not a second competence gate, and an offer does not imply qualification. Appointments separately determine whether the character has the authority to act in an institutional capacity.

Rank must not gate a required Work or eliminate a viable route through the required Works portfolio. A date-based milestone invitation may reach a lower-ranked character through a different channel or in a different form; whatever the route, the player must retain a valid progression path regardless of rank. Rank may shape access, not the existence of required historical progression.

Rank should affect the **composition** of ordinary Assignment offers, not systematically starve lower-ranked characters of playable work. The initial target of roughly 8 AP worth of new Assignment offers per day in Section 6.3 remains a tuning target for the overall board, not a quota or rank-based entitlement.

The former Novice / Adept / Expert / Perilous commission-tier ladder and rank-to-tier mapping are removed. Each commission retains a separate difficulty marker. Section 18.3's green / yellow / red convention remains: routine, demanding, or critical. Difficulty communicates the nature of the work; it does not determine qualification. Specific skill requirements do that.

### 10.4 Career progression and historical progression are independent

A character may attain high professional rank while the player remains in the earliest era. Rank does not unlock the next historical era. Conversely, completing a major Work and entering another era does not automatically increase the current character's rank.

### 10.5 Specialization and professional identity

Specializations provide focused expertise within the shared character skills. They are earned through relevant experience and opportunities, then selected by the player from those for which the character qualifies. They are not locked to the character's initial career path.

A character may hold multiple specializations, with one designated as Primary. Primary status represents professional identity and may influence recognition, reputation, appointments, and access to opportunities; it is not simply a label for the highest numerical skill. Secondary specializations retain their relevant mechanical benefits.

Each specialization has three expertise levels: **Practitioner**, **Specialist**, and **Master**. These represent increasing competence, access to demanding work and distinctive capabilities, and exceptional expertise with advanced actions and professional recognition.

Specializations should unlock actions, improve relevant actions, and create professional opportunities. Their effects should connect to the character-action model and the people and institutions of the world rather than exist only as passive percentage bonuses. Rank provides broad professional reach; specialization provides a separate route to focused, discipline-specific opportunities. A character with a lower broad rank should not be treated as having no meaningful professional opportunities when their specialization creates a credible reason for relevant work to reach them. Exact qualification and advancement requirements, the content of individual specializations, and the balance between broad and specialist opportunity channels remain open.

---

## 11. Historical Progression and Works

### 11.1 Historical Progress XP

Historical Progress XP represents the cumulative historical significance of completed Works. It is not awarded for ordinary employment, routine Assignments, optional Challenges, daily wages, or purchases.

Works are the sole ordinary source of Historical Progress XP. A Work may award Career XP separately if the player's professional contribution deserves recognition, but that does not change the Work's historical award.

### 11.2 Works as human achievement

Works should focus on what people accomplish through writing and information. Examples of broad kinds of achievement include:
- Establishing practices for durable records and institutional memory.
- Preserving and organizing bodies of literature or technical knowledge.
- Creating, editing, compiling, and transmitting texts.
- Developing systems for correspondence and information exchange.
- Reproducing and circulating books and pamphlets.
- Making new kinds of knowledge accessible to wider communities.
- Applying records and communication to institutional, scientific, social, or political change.

These examples illustrate the design philosophy; they are not a fixed list of Works or prescribed rewards.

### 11.3 Work structure

A Work should have a meaningful arc rather than a simple completion bar. Its design should specify:
- The human and historical problem.
- The people, relationships, and institutions involved.
- The knowledge, materials, and resources available.
- Its stages, objectives, and deliverables.
- The decisions and approaches open to the player.
- How optional Assignments or Challenges can help without becoming required.
- How quality, choices, and consequences affect the final result.
- The Work's impact on the historical record, institutions, people, or later generations.
- Its Historical Progress XP reward.

Works may extend over multiple days or generations. The player's decisions should have visible consequences for the quality, reach, preservation, or use of the result.

### 11.4 Mandatory progression without optional-content gates

Required Works are mandatory for the main historical journey. Assignments and Challenges are optional. Therefore, a mandatory Work must have a viable completion path that does not depend on completing a particular optional Assignment or Challenge. Optional content may improve its outcome, open an alternative approach, provide useful relationships or resources, or reveal additional context.

---
## 12. Personal Economy

### 12.1 The two personal resources

The player's tracked personal economy has exactly two resource categories:

| Resource | Distinct role |
|---|---|
| **Money** | The player's spendable wealth for purchases, services, obligations, savings, and debts. The interface uses the historically appropriate currency name and denomination for the current era. |
| **Provisions** | An abstract food and sustenance resource. It represents what the player has available to meet everyday food needs, regardless of the specific foods customary in the current place and period. |

The underlying money and provisions systems remain standardized across eras. Historical presentation changes to fit the setting, but the game does not need a separate economy for each era.

Money's displayed currency name changes at an era transition to the appropriate historical unit (for example, a shekel of silver in early Mesopotamia or a deben in ancient Egypt). **This is a presentation change only:** the player's underlying accumulated wealth carries forward without currency conversion, exchange calculations, or a transition fee. The displayed name and denomination change; the standardized game value does not.

Provisions remain one abstract personal resource rather than separate balances for bread, fish, dates, or other foods. The interface, contracts, and narrative use period- and place-appropriate descriptions of the food represented. Specific foods may still appear as goods, evidence, or inventory items when a scenario requires them, but they do not create additional personal economy meters.

Beer is not a tracked personal resource. It may appear as a world or institutional commodity, an item the player can acquire or receive in a particular situation, or part of hospitality and social exchange. Such appearances do not create a permanent beer balance.

### 12.2 Employment compensation

The player receives money compensation for employment, with professional rank and legitimate performance bonuses potentially affecting pay. Poor performance may reduce money compensation. Good performance can earn legitimate bonuses. Compensation in kind, including provisions or specific items, is permitted only when it is part of an explicit employment or Work contract, with the amount, duration, and conditions shown before acceptance.

There is no universal daily employment ration. A player who performs no paid work and has no active contract receives no automatic provisions. Mandatory Works must nevertheless define their own provisions when the institution expects the player to spend several days working for it. The Storehouse Reckoning provides one unit of provisions per active contracted Workday under its explicit service arrangement.

### 12.3 Daily sustenance

The player normally consumes one unit of provisions at the end of each Workday. Other foods and beverages are not separate mandatory daily deductions.

A player may complete **two consecutive Workdays without provisions before suffering a shortage penalty**. If the player still has no provisions at the end of a third consecutive Workday, shortage consequences begin. The shortage count advances by Workday, not by calendar time, and resets when the player consumes provisions. Time that passes without a Workday being completed does not advance the count.

If the player lacks provisions, the game records the shortage rather than creating a negative balance or granting an automatic free resource. The specific penalty, recovery schedule, stress scale, and stress ceiling remain under design. Shortage consequences must be bounded and recoverable; they must not create an automatic, indefinitely compounding stress ratchet that makes recovery impossible.

### 12.4 Recovery from hardship

Potential recovery routes include:
- Selling or trading personal possessions.
- Pawning or selling equipment.
- Seeking an advance or loan with real obligations.
- Asking for help or calling in a social favor.
- Taking legitimate or informal work, including work paid in provisions.
- Pursuing illicit opportunities, such as theft, fraud, smuggling, or black-market exchange, where plausible in the setting.
- Accepting ethically compromising offers, including bribes, with consequences.

The game should not restrict the player to respectable or institutionally approved ways of responding to hardship. Legitimate, informal, and illicit actions are part of the same world; their availability, risks, and consequences depend on the people, institutions, laws, evidence, and circumstances involved. The game should not reduce these choices to a universal morality label.

The player cannot die from a depleted provisions balance, and economic hardship must not create an unavoidable game-over state. The world should preserve plausible avenues of recovery, even when those avenues are difficult, risky, or socially costly. This does not mean the player receives an automatic bailout, unlimited negative balance, or unexplained free resource.

### 12.5 Era-appropriate presentation

The two underlying resource systems remain consistent across eras, while their presentation adapts to historical context. Money uses the appropriate currency name and denomination for the setting without changing the player's standardized accumulated value. Provisions use appropriate food and ration descriptions without creating separate personal balances for individual foods. The exact historical labels and presentation for each era remain content work.

---

## 13. Stress, Trust, and Institutional Consequences

### 13.1 Stress

Stress represents the cumulative pressure of work, shortages, conflict, difficult choices, and personal circumstances. It can change through Assignments, Challenges, daily settlement, sustenance shortages, rest, study, and social interactions.

Reaching the eventual critical or maximum Stress threshold should place the character in a **crisis state** and prompt the world to consider whether support is available. It is not an automatic rescue, a guaranteed Stress reset, or by itself a game-over condition.

The character's positive personal relationships are the first potential source of intervention. A friend, relative, colleague, patron, or other contact may reach out or offer practical help when both willing and able. The form of assistance should reflect the relationship, the person's means, and their circumstances; a positive relationship does not guarantee that the person can help. Repeated hardship or repeated requests may strain a relationship, change the terms of assistance, or leave the contact unable or unwilling to intervene.

When personal support is unavailable or insufficient—because the character lacks positive relationships, has already relied on them repeatedly, or remains in hardship over an extended period—the wider society may offer other avenues. These must be appropriate to the historical place and period, including relevant charitable, religious, household, civic, or institutional practices where they existed. Do not impose modern charitable organizations or assumptions on earlier societies.

Support is an opportunity, not an entitlement or guaranteed bailout. The character may still need to seek work, negotiate obligations, accept assistance with conditions, or pursue informal and illicit alternatives. A character with no positive relationships must not be locked into an unavoidable failure state.

The final stress scale, ceiling, thresholds, crisis timing, intervention frequency, recovery rates, and effects of assistance are not yet approved. Any shortage or crisis consequence must be bounded and recoverable; it must not compound automatically into an unavoidable poverty spiral. Stress changes must be explained when they occur, and the player must be able to see the likely cost of a recovery action before committing.

### 13.2 Trust and reputation

Trust and reputation operate at more than one level:
- An employer or institution may trust a character's work.
- Individual NPCs may trust or distrust a character for personal reasons.
- Factions or broad social groups may respond to a character's actions.
- A character's professional reputation can affect future opportunities.

These levels should not be collapsed into a single universal approval number. A decision can earn an institution's approval while damaging a personal relationship, or protect an individual while frustrating an employer.

### 13.3 Consequences should be traceable

When a ruling, omission, error, bribe, or disputed record changes the world, the player should receive a comprehensible explanation. Consequences can persist into later assignments, Challenges, Works, and relationships.

---

## 14. Bribery and Ethical Choices

Bribes may be offered by people with a reason to influence a particular record or decision. They should be contextual to the NPC, institution, assignment, and stakes—not generic random rewards detached from the situation.

Accepting a bribe can provide silver or other specified resources, but it awards zero XP. It should carry credible consequences, which may include:
- Loss of trust from an employer, faction, or individual.
- Increased stress or vulnerability to future pressure.
- Damage to professional reputation.
- Changed relationships with the person offering the bribe or those harmed by it.
- Later exposure, investigation, or obligations.

Refusing, reporting, negotiating, or accepting may lead to different results depending on the evidence and relationships. Bribery should be a genuine choice with a trade-off, not a simple bonus button or a guaranteed morality test.

---

## 15. People, Institutions, and Social Network

### 15.1 NPC agency, roles, and individual relationships

NPCs are people with interests and lives of their own, not characters waiting for the player to activate them. Relevant NPCs can pursue objectives, meet obligations, respond to changing circumstances, and interact with other people without the player's involvement. Their actions may change relationships, institutional circumstances, ongoing work, opportunities, and the player's interests. The player has agency, but no veto over everyone else's decisions.

Agency should be proportionate to an NPC's importance to play. Important recurring characters may have long-term ambitions alongside immediate objectives; other relevant NPCs may need only immediate concerns and obligations. Long-term ambitions can be reinforced, delayed, redirected, or undermined by events and competing priorities. NPC goals can conflict with one another, including within the same person.

Independent action must remain causally understandable rather than arbitrary. A consequential decision should make sense in light of the NPC's motivations, circumstances, capabilities, knowledge, relationships, resources, and authority. NPCs should not routinely act on information they could not plausibly obtain or exercise powers they do not possess. The player may know an action is coming, discover it afterward, or remain unaware until later evidence or interaction brings it to light; the game should not grant advance warning merely because an event affects the player.

This is a game, not an attempt to simulate every person's routine. Preserve and present NPC developments when they meaningfully affect people, obligations, relationships, institutions, opportunities, or ongoing work. Routine activity can be summarized or left in the background when its detail has no meaningful consequence for play.

When defining an NPC's role, keep three things distinct:
- **Social identity:** who the person is, what they want, whom they know, and what matters to them.
- **Institutional position:** their affiliations, responsibilities, authority, and limitations.
- **Current involvement:** what they are doing in a particular situation and what they know about it.

Responsibility for an outcome does not automatically confer authority over every action that contributes to it. Likewise, authority does not prove that a person acted, and participation does not by itself establish fault. Duties, decision rights, practical capacity, knowledge, and accountability should be considered separately when they matter to a playable situation. Historical job titles and designations must be interpreted in context; an attested designation is not automatically a fully understood job description or a reason to create a permanent NPC type.

Named NPCs are important recurring characters. The game should track individual relationships and relevant history rather than relying only on broad faction scores. Relationships are directional: each person has their own perspective on the other, and those perspectives need not match. The player may trust someone who distrusts them, or respect someone who dislikes them.

A relationship can contain several qualities at once. Trust, respect, affection, resentment, rivalry, familiarity, and obligation are not mutually exclusive states and should not be collapsed into one shared friendship value. A merchant may dislike the player yet still fulfill a tithe or other obligation; a personal relationship can influence how someone approaches an obligation without automatically erasing or overriding it. Conversely, fulfilling an obligation does not prove affection, loyalty, or trust.

Relationships develop through significant shared events or through accumulated meaningful interactions. One consequential experience can substantially change a relationship; repeated meaningful contact can gradually establish familiarity, trust, respect, resentment, or other qualities. Routine exchanges do not all need permanent individual memories. Preserve the experiences that explain a consequential relationship or later decision.

### Conflicting commitments and obligations

NPCs may hold several commitments at once. A conflict arises when two or more recognized commitments cannot all be fulfilled under the NPC's present circumstances, given available time, resources, knowledge, authority, or practical capacity. Conflicting obligations should create meaningful situations and decisions, not a universal hidden loyalty contest or a separate obligation-management simulation.

Keep the basis of a commitment identifiable when it matters to play. It may arise from a recorded allocation or agreement, an instruction, an office responsibility, a personal undertaking, or an expectation grounded in an ongoing relationship. A demand or request is not automatically a valid obligation, and a preference or desire is not equivalent to a duty. The game should preserve distinctions between what someone expects, what someone claims is required, and what the available evidence establishes. A commitment may be disputed, misunderstood, conditional, or beyond the person's authority or capacity.

When apparent commitments conflict, an NPC should have room to pursue a resolution before making an irreversible choice where circumstances permit. Contextually appropriate responses may include seeking clarification or authorization, requesting more time, negotiating, delegating, obtaining assistance, substituting or dividing performance, or referring the matter to someone else. These are possible responses, not a mandatory sequence or a universal procedure. The NPC's available choices depend on the actual situation and historical context.

If the conflict remains unresolved, the NPC's response should be understandable in light of their motivations, authority, dependence on others, relationships, knowledge, exposure to consequences, discretion, resources, and alternatives. Do not reduce the decision to one hidden loyalty or relationship score. Personality may shape how an NPC responds, but should not replace the concrete circumstances or grant knowledge and authority they do not possess.

Fulfilling one commitment does not silently erase another. The outstanding expectation or disputed matter may continue and affect later interactions, relationships, institutional circumstances, or work. Consequences are not automatic penalties: they depend on what the affected parties know, what they can do, and how they interpret the failure or explanation. Failure to fulfill a commitment does not by itself establish dishonesty or bad faith.

Player-facing presentation should distinguish:
- **Observable action or result:** what happened or what can be directly observed, such as a delayed delivery, refusal, or recorded quantity.
- **Attributed explanation or claim:** what an NPC says happened, what instruction they report receiving, or what another person alleges.
- **Supporting evidence:** records, observations, testimony, or later confirmation that support, qualify, or contradict an explanation.

An NPC's explanation may be sincere and mistaken, incomplete, self-serving, or unsupported. It should not become established fact merely because the NPC states it. The player's knowledge remains situated; the player may encounter the action first, hear an explanation later, or obtain supporting evidence through people, records, and other plausible channels.

Historical evidence may establish that people participated in differentiated relationships to goods, labor, allocations, and accounts without revealing how they deliberated between competing demands. Where the historical record does not preserve motives, procedures, or individual decisions, those elements are designed reconstruction and must not be presented as recovered historical fact. The game should not invent an obligation merely to explain an NPC's obstruction; the commitment should have a basis in the situation and remain meaningful after the immediate encounter.

Relationship information can include:
- Trust, affinity, resentment, or professional respect.
- Prior assignments and shared events.
- Promises, debts, favors, and obligations.
- Mentorship and apprenticeship.
- Family and household connections.
- Professional collaboration or rivalry.
- Institutional role and changing authority.
- Whether the person is alive, active, retired, displaced, or represented by descendants or successors, where relevant to the era.

Not every relationship needs every field. The record should capture details that matter to future play.

### 15.2 Persistent social network

Characters, locations, institutions, and relationships are central to continuity. Contacts should recur where historically and narratively plausible. A person may introduce a new patron, recommend an apprentice, call in a favor, or become involved in a later dispute.

The social network should be persistent enough that the player recognizes consequences across years and generations. A new era should introduce new people and institutions without making the previous history feel erased.

### 15.3 Institutions and factions

Institutions use a **shared underlying gameplay model** rather than separate mechanical systems for each institutional or career type. Their common properties may include identity and historical context, responsibilities and authority, resources and personnel, relationships with other institutions and people, and current circumstances or unresolved matters. The model should remain proportionate: institutions have objectives, constraints, and organizational interests, but do not need the full personality, memory, or decision-making complexity of individual NPCs.

Institutional rosters are specific to each historical era. Do not assume that the same organizations persist unchanged across eras or simply receive new names and visual skins. Each era should introduce institutions appropriate to its historical setting. The four initial career paths—Government, Military, Religious, and Merchant—can guide a small number of especially relevant institutions for each path, alongside general institutions and organizations that people from multiple careers may encounter.

Career paths do not create exclusive access or membership boundaries. A character's career shapes their starting position, relationships, responsibilities, opportunities, and likely institutional contacts; it does not prevent them from interacting with institutions associated with other careers.

Institutional differences should initially be expressed through historical and narrative character, style, terminology, customs, attitudes, priorities, and context. Differences in authority, responsibilities, resources, or available actions should be represented through the shared model's properties and circumstances, not bespoke mechanics. Introduce mechanically distinct institutional types only if later gameplay demonstrates a genuine need.

Institutional continuity across eras is not assumed. Professional traditions, records, knowledge, family or social connections, and other specific legacies may persist where the historical context supports them, but that does not require the institution itself to survive. Faction standing can represent broad relationships with groups such as temple authorities, citizens, guilds, merchants, or other era-appropriate organizations. It complements, but does not replace, individual NPC relationships.

### 15.4 Historical events

Historical events can alter institutions, locations, opportunities, and relationships. Events may create Challenges, change Work conditions, or reshape the social network. They should be represented through human consequences rather than as detached timeline announcements.

---

## 16. Player Continuity Through Successive Characters

### 16.1 The player is not the character

The player is the continuing participant in the historical journey; individual player characters are mortal people through whom the player experiences that history. A character's death ends that person's life and playable role. It does not end the player's journey, trigger a game over, or require a family heir to preserve the player's identity.

When a character dies or otherwise leaves play, the player takes up another **existing scribal NPC** in the same historical period. The NPC must have an established connection to the former character and their professional world. Connections may be personal or professional and may arise through colleagues, apprentices, former students, shared institutions, patrons, mentors, households, or the wider network of scribal work. This is not unrestricted selection of any scribe in the world, nor does it require a blood relationship or a designated heir.

Connected candidates are presented in a **connection-priority ranking**:

1. **Direct personal connection:** an established person-to-person relationship with the former character.
2. **Direct professional connection:** an established professional link, such as a shared institution or appointment.
3. **Wider professional network:** a connection through an identifiable intermediary in the former character's personal or professional network.

A candidate with more than one kind of connection is placed in the highest-priority category they qualify for, while the other evidenced connections remain visible as context. This ranking orders the presentation of plausible candidates; it is not a competence score. Skills, rank, reputation, wealth, and authority do not determine connection priority. The candidate's own circumstances and availability still determine whether they can actually be taken up. Ties within a category must not be broken by an invented character-quality formula.

The engine may only recognize connection types supported by actual world data. Shared affiliations, appointments, and recorded person-to-person relationships can support the initial ranking. More specific ties such as apprenticeship, mentorship, patronage, or household membership require explicit authored data before they can be treated as established connections.

### 16.2 A different person, not an inherited character

The player may choose among plausible connected NPCs, subject to their actual circumstances and availability. The next character does not need to match the former character's skill, rank, reputation, wealth, or authority. The player may continue as a low-ranking, inexperienced, or otherwise less established scribe. The successor's rank is determined from that character's own skills; no rank counter or former character's skill profile is transferred. A character's existing skills and circumstances determine what the player can do and what opportunities are available; they are not adjusted to preserve the previous character's level of accomplishment.

Each NPC retains their own identity, skills, personality, relationships, professional history, institutional affiliations, obligations, possessions, and circumstances. These do not automatically become the former character's simply because the player now inhabits them. Records, knowledge, professional traditions, institutional standing, and other consequences of the former character's work remain in the world where appropriate, but their survival does not depend on being inherited by the next character.

### 16.3 Death, transition, and legacy

People die without successors. That is an ordinary part of the historical world, not a player failure or a reason to restart the era. If no close apprentice or obvious successor exists, the player can continue through another existing, connected scribal NPC in the same period, including someone of modest professional standing. The game should not manufacture an heir, create a replacement NPC solely to rescue the player, or send the player back to the beginning of the era.

The transition does not itself rewind the calendar, erase completed Works, or reset the surrounding world. The new character enters the world as it currently exists, with their own position in its ongoing events and institutions. The precise presentation and candidate-selection interface remain to be designed.

The family desk remains a distinct family heirloom and workspace object. It is not the player, not a required vessel of player continuity, and not automatically transferred to every character the player inhabits. Whether a particular character can use or access it depends on that character's own relationships, household, location, and circumstances. Its item, upgrade, and historical treatment remain governed by the equipment and workspace design in Section 17.

---

## 17. Tools, Equipment, and Workspaces

Equipment and workspace improvements should change with historical context and support the character-action model. The player and the family desk have separate inventories, but items and upgrades for either may be acquired through the same world sources, including merchants, artisans, institutions, patrons, and professional contacts. Acquisition does not require separate systems for player equipment and desk improvements.

### 17.1 Player equipment and carried inventory

The player's equipment includes clothing and accessories, tools and objects held or used, and a satchel or pack for carried possessions. The interface may present equipment through a straightforward series of clearly labeled buttons and item lists. It may be visually organized, but it should not require a spatial grid, drag-and-drop placement, or a tactical inventory minigame. Categories and labels communicate an item's function; they do not impose a spatial inventory model.

The current equipment categories are:

- **Clothing:** headwear, torso garments, and footwear.
- **Hands and tools:** left-hand and right-hand use. Some objects may require both hands.
- **Neckwear:** a necklace.
- **Accessories:** two accessory choices, which may be rings, bracelets, armbands, or compatible combinations.
- **Satchel / pack:** carried storage for tools, supplies, and other possessions.

The interface should provide clearly labeled controls for these categories and show relevant item information, including weight, effects, and whether an item is currently equipped or carried. The exact interface layout may evolve without changing the underlying equipment rules.

Carrying capacity is weight-based rather than based on a fixed number of inventory cells or item slots. The pack contributes to the character's carrying capacity, and carried items contribute their weight. The player may exceed normal carrying capacity; overburdening is not an absolute inventory prohibition. It creates contextual consequences, particularly for movement, travel, and sustained physical effort. The severity of those consequences should reflect how heavily the character is overburdened and the action being attempted. It should not automatically penalize unrelated activities, such as interpreting a document while seated at a desk.

### 17.2 Family desk and its components

The family desk has a separate inventory and three principal components:

- **Writing surface / top:** the working surface and improvements that support writing, viewing, arranging, or handling materials.
- **Storage:** compartments and improvements for keeping tools, materials, documents, and references.
- **Construction:** the desk's underlying structure, materials, stability, and craftsmanship.

The desk interface may use a series of clearly labeled buttons for these components, with lists of available, installed, or replaceable improvements. The desk is a persistent family heirloom and workspace, not simply another portable inventory.

Player equipment and desk improvements may be obtained from the same acquisition sources. Their inventories remain distinct because they serve different purposes: the player carries and uses personal equipment, while the desk provides a persistent working environment.

The desk is upgraded and personalized during each era. At an era transition, it remains in the family, but previous-era upgrades become modest inherited bonuses based on what was installed rather than retaining their full former-era effects. New eras make historically appropriate desk improvements and workspace capabilities available.

### 17.3 Equipment effects

Equipment modifies particular actions contextually rather than directly increasing the character's underlying attributes or skills. Its usefulness depends on the action, environment, available information, and circumstances.

Equipment may provide three broad kinds of benefit:

1. **Performance bonuses:** improve the quality, efficiency, reliability, or other outcome of particular actions.
2. **Capability unlocks:** make additional actions or approaches available.
3. **Information access:** reveal details, references, or useful information that would otherwise be unavailable or harder to obtain.

An item may provide more than one kind of benefit. For example, a better stylus may improve relevant writing actions without raising the character's Precision attribute; improved lighting may reveal details in a document or workspace; and reference materials may provide information relevant to a research or writing action. These examples illustrate contextual effects, not a finalized item list or numerical specification.

Equipment should connect to skills, specializations, conditions, and circumstances without replacing character development. Purchasing an item alone does not award Career XP.

### 17.4 Condition, wear, repair, and replacement

Equipment may deteriorate through use and may require repair or replacement. Durability loss should be gradual where wear is historically and mechanically appropriate, and should reflect the item's material, construction, use, and circumstances. Damage or deterioration may also result from specific accidents, environmental exposure, neglect, or other grounded events.

Durability should create meaningful decisions about care, repair, replacement, and the use of equipment—not constant maintenance busywork. The game should communicate an item's condition and the practical consequences of deterioration before those consequences become significant. Not every item needs a durability mechanic; disposable materials, durable references, heirlooms, and other item types may require different treatment.

The exact equipment catalog, item weights, carrying-capacity values, overburdening thresholds and effects, durability rules, repair costs, quality levels, acquisition costs, and era-specific progression remain open design work.
## 18. Interface and Visual Direction

### 18.1 General presentation

The interface should feel like a readable working environment rather than a conventional fantasy RPG menu covered in decorative text. The player needs clear information about people, evidence, choices, documents, resources, and consequences.

### 18.2 First-era visual identity

The opening Uruk setting uses:
- Warm clay and earth tones.
- Clay tablets, tags, and sealed clay dispatches.
- Impressed marks and seal imagery as visual motifs.
- Worn natural materials and restrained lighting.
- Clear text and strong visual hierarchy.

Suggested palette:
- Deep brown: `#2B1B17`.
- Warm limestone: `#FAEDCD`.
- Sand / ochre: `#D4A373`.
- Burnished amber: `#C86D33`.
- Neutral light: `#F4F1EA`.
- Neutral dark: `#1C1614`.

These colors are visual guidance, not a claim about a historically standardized Uruk palette.

### 18.3 Difficulty and information design

Difficulty may use green, yellow, and red markers as a modern interface convention:
- Green: routine.
- Yellow: demanding.
- Red: critical or complex.

Markers must be readable through labels or shapes as well as color. Difficulty is not urgency, and the interface should not imply a real-time countdown.

### 18.4 Era-specific material design
The presentation should evolve with the era: clay and seals in early Mesopotamia, materials and conventions appropriate to Egypt and later societies, manuscript and paper traditions where relevant, printed pages and presses, and digital documents and networked interfaces in the modern era. Important information must remain readable; decorative generated marks must not be presented as verified historical writing.

### 18.5 Notifications, event history, and morning reports

The player needs a selective way to stay informed about developments in the wider simulation without having to monitor every person, institution, process, or location continuously. The notification approach should take inspiration from strategy games such as *Total War*, adapted to the player's professional life rather than a territory- or army-management interface.

The presentation system should provide three complementary channels:

- **Immediate notifications:** Surface developments during the Workday when they warrant timely awareness or action. Urgent matters must not wait for the next morning report. Most notifications should inform rather than forcibly interrupt the player's current activity.
- **Persistent event log:** Preserve notifications and notable developments so the player can review items they dismissed or did not act on immediately. Entries should link to relevant people, institutions, records, assignments, Works, or locations when those references exist.
- **Daily morning report:** At the beginning of each new Workday, provide a concise briefing of relevant developments since the previous report. This is a regular daily feature, not a report generated only after an arbitrary number of events.

The morning report is for what is relevant to the player **right now**, at the beginning of the new Workday. It is not an exhaustive news bulletin or a feed of everything that happened in the world. Prioritize:
- Current circumstances affecting the player's personal, professional, social, or institutional situation.
- Approaching deadlines and commitments, including work, deliveries, appointments, decisions, and obligations coming due.
- Changes to ongoing matters the player already knows about.
- New opportunities that are plausibly within the player's reach or professional sphere.
- Warnings about emerging problems that could affect the player if left unattended.

Relevance is not limited to matters in which the player is already directly involved. A development elsewhere may be worth reporting when it creates a credible opportunity or consequence within the player's reach—for example, a nearby settlement's surplus creating demand for storage, transport, or recordkeeping. Conversely, proximity alone does not make an event relevant. Ordinary developments with no meaningful connection to the player's present circumstances or plausible opportunities should remain background information.

The report should distinguish what needs attention today from what the player should know today. An approaching deadline may deserve visibility without being an emergency; an opportunity may be worth knowing about without demanding immediate action. The report informs the player's priorities and use of the Workday's six Action Points but does not prescribe a task list.

Information must have a plausible path to the player through people, institutions, notices, correspondence, trade, travel, records, direct observation, or other appropriate sources. Do not present events as known merely because the simulation knows they occurred. Preserve source and uncertainty: market talk, testimony, allegations, and rumors are not automatically established facts. The player may receive useful information without every item becoming a quest or requiring action.

Contents must remain selective: do not repeat unchanged information merely to fill space, and group developments when they share an established cause or affected matter. The player remains free to decide what deserves attention.

Notifications and reports must distinguish established facts from testimony, allegations, attributed explanations, and unresolved interpretations. Grouping must reflect actual shared state rather than inventing a causal connection because events occurred near one another. Important developments should be discoverable through relevant people, records, and changed work as well as through notifications.

The attention system should distinguish at least these presentation needs conceptually: developments requiring timely interruption or prominence; developments relevant to the player's current work or focus; related changes suitable for a consolidated report; and background or resolved information that should remain inspectable without demanding attention. These are design categories, not a finalized notification taxonomy or numerical importance score. Urgency and broader significance are not interchangeable.

The exact notification thresholds, prioritization rules, delivery timing within a Workday, report layout, archive navigation, and handling of missed or repeated developments remain open design work. No runtime notification system or simulation architecture is implied by this interface decision.
The presentation should evolve with the era: clay and seals in early Mesopotamia, materials and conventions appropriate to Egypt and later societies, manuscript and paper traditions where relevant, printed pages and presses, and digital documents and networked interfaces in the modern era. Important information must remain readable; decorative generated marks must not be presented as verified historical writing.

---

## 19. Content and Scenario Quality Standards

### 19.1 Historical coherence

Every scenario should be appropriate to its selected period in terms of people, institutions, materials, titles, practices, and available technologies. Historical dates are playable settings, not reasons for pedantic claims about a single invention date. Avoid placing a developed later work into an earlier setting as if it already existed in finished form.

### 19.2 Internal consistency

Scenario facts, evidence, document fields, quantities, NPC roles, and outcomes must agree. An administrator is not automatically the recipient; a witness is not automatically responsible; an authority is not automatically the sender. Every role should be defined by the scenario.

### 19.3 Evidence coverage

The dossier must support every important required factual field. If the evidence does not establish a fact, the game should leave it uncertain or give the player a way to investigate it. It should not punish the player for failing to supply information the scenario never provides.

### 19.4 Human context

Assignments should involve specific people, places, institutions, and relationships. Repeated templates can vary, but should not become anonymous arithmetic exercises. The player should understand who is affected by the record and why it matters.

### 19.5 Consequence quality

Consequences should arise from the facts and choices in the scenario. Avoid arbitrary changes to trust, stress, faction standings, resources, or NPC relationships. Alternative rulings should have coherent and distinguishable outcomes.

### 19.6 Character-situated interpretation

Evidence presentation must distinguish source content from the examining character's interpretation. Internal monologue should reflect only knowledge and capabilities plausibly available to that character, including relevant skills, attributes, experience, equipment, relationships, background, and circumstances. It may express uncertainty or contain a mistaken interpretation, but it must not silently rewrite the source evidence or function as an infallible answer key. Scenarios should provide enough source information for the player to reason about the task even when the character lacks the expertise to interpret every implication.

---

## 20. Progression Pacing and Player Experience

### 20.1 Two different kinds of advancement

Career XP funds eligible professional development, including skill and specialization advancement. Character rank is derived from the character's skill profile and shapes professional opportunity access. Historical Progress XP is slower, cumulative, and tied to major Works. The systems should create different rhythms:
- Professional advancement recognizes practice, learning, and the development of a character's capabilities.
- Rank reflects broad professional standing and influences which opportunities are likely to reach the character.
- Historical advancement recognizes substantial accomplishments with broader consequences.

### 20.2 Long-form pacing

The game should allow enough in-game days for relationships, professional contacts, hardship, study, family developments, and ongoing stories to matter. Career rank should not be exhausted too early, and historical eras should not be skipped through repetitive routine work.

### 20.3 Rewards must have a clear meaning

Career XP, Historical Progress XP, money, provisions, trust, stress, faction standing, and relationship changes are different things. They should not be used interchangeably. A reward should communicate what the player accomplished and why that reward changed.

---

## 21. Audio, Feedback, and Accessibility

Audio is optional. Local sound effects or music can support dispatch arrival, selection, document submission, Work milestones, and major historical events. Sound should never be required to understand gameplay.

Visual feedback is mandatory. The player must be able to understand:
- What action is available.
- What evidence supports a conclusion.
- What information is missing.
- What changed after submission or resolution.
- Why resources, stress, trust, reputation, or relationships changed.
- The character's current professional standing and, in plain language, the broad kinds of work and invitations that standing is likely to attract. This summary describes the character's known professional reach; it does not reveal opportunities or information that never reached them.

Text must remain readable, controls must be clearly labeled, and color must not be the sole way to communicate difficulty or status. Layout should accommodate different screen sizes and input methods without hiding required information.

---

## 22. Boundaries and Exclusions

The following are not part of the current core design unless deliberately approved later:
- Combat as a primary gameplay system.
- Territory conquest or a ruler-focused strategy layer.
- A typing-speed or transcription-only core mechanic.
- Freehand handwriting recognition or a research-grade sign editor.
- A real-time countdown workday or real-time commission deadline mechanic.
- Additional tracked personal resource balances beyond money and provisions.
- Historical Progress XP from ordinary Assignments or optional Challenges.
- Optional Challenge completion as a mandatory prerequisite for Works.
- Career rank determined by historical era or Historical Progress XP.
- Automatic free resources or negative personal resource balances.
- Runtime dependence on generative AI to create assignments, validate records, or determine outcomes.

The game may represent complex technologies, institutions, and historical events, but they should serve the central career and knowledge-history experience.

---

## 23. Remaining Design Work

The following details require further design before they can be treated as fixed mechanics:

1. The Works portfolio for Eras I–VII: identify historically grounded milestone opportunities and smaller career-scale undertakings; determine which Works are required for each era transition, how much choice the player has, how missed or declined date-based invitations are accommodated, and the appropriate scale, structure, and XP awards.
2. Playtesting the Storehouse Reckoning: whether the recount, register-design choice, unseen transaction tests, and adoption consequences are engaging rather than procedural.
3. The maximum active Assignment commitment count, cancellation costs, and offer-generation balance beyond the initial two-commitment / 6-AP model.
4. The precise balance of Career XP rewards across Assignments, Challenges, Works, and study.
5. Professional rank: define the skill-to-rank formula and test it against broad generalists and narrow specialists; decide whether a specialist ceiling is appropriate; localize in-world titles without treating offices as universal competence grades; define the opportunity profiles of all seven grades, including meaningful differences at ranks 5–7; and decide whether rank affects compensation. The approved direction is that rank shapes baseline opportunity access, while skills determine specific qualifications and appointments grant authority. Retain the former 200,000 Career XP total only as a provisional career-pacing target, not as a rank threshold, and reconcile it with total skill and specialization purchase costs once those costs are defined.
6. The complete money and provisions economy: prices, availability, storage/spoilage, daily sustenance and shortage consequences, era-appropriate currency names and food presentation.
7. The stress scale, ceiling, thresholds, crisis timing, recovery rates, and fully priced recovery options; define how crisis interventions are paced and how assistance affects Stress and relationships. Shortage consequences must remain recoverable.
8. Complete the NPC relationship, agency, and obligation model: determine how directional, multi-dimensional relationships are represented and changed; how significant events and accumulated meaningful interactions shape them; how relationships persist through successors, institutions, and geographically separated eras; how positive relationships can provide crisis support; how repeated assistance affects those relationships; and how conflicting commitments are represented and resolved in specific contexts. Established principles include independent NPC agency, proportionate immediate objectives and longer-term ambitions, commitments with identifiable bases, the distinction between demands and obligations, contextually appropriate attempts at resolution, and the persistence of unresolved matters. Detailed decision rules, memory scope, presentation, and runtime mechanics remain open.
9. Determine how professional traditions, records, archives, and institutions provide historical connections across distant eras. These are continuities within the world and its history, not mechanisms required to preserve the player's identity; the player continues through successive characters.
10. Character-transition details: define how and when a player character leaves play, how connected scribal NPC candidates are presented and selected, and how their circumstances and availability are communicated. The approved principle is that the player continues through an existing scribal NPC connected to the former character and their professional world in the same historical period; the new character may be much less experienced or prominent. Character death does not require a family successor, trigger a game over, or restart the era.
11. Era pacing in actual in-game days, including the number and expected duration of Works, optional activity density, and authored calendar transitions.
12. The historical progression thresholds and XP allocation after Work plans are complete; rounder values may replace the current legacy targets.
13. The exact institutional rosters and historical content for each era, alongside era-specific documents, Assignments, and Works; determine the relevant institutions for each career path and the shared institutions encountered across careers. The shared institutional gameplay model and era-specific presentation principle are established.
14. Detailed equipment categories, qualities, costs, and effects.
15. The precise progression of document-building autonomy and professional training.
16. Platform, target audience, accessibility targets, and technical scope.
17. Comparable games and positioning, including the intended relationship to narrative investigation, administrative simulation, and historical RPG conventions.
18. The end state after Era VII, the role of an ending or continuing mode, and any failure states or recovery boundaries.
19. A defined minimum viable product (MVP): which era, Works, Assignments, characters, systems, and content must exist for a complete first release.
20. Content-authoring and validation pipeline: scenario state schemas, evidence generation, invariant checks, branch coverage, historical review, and automated QA for authored or AI-assisted drafts.
21. Evaluation implementation: define the detailed player-facing feedback language, scoring weights, and scenario-specific validator behavior. Preserve the distinction between a reasonable judgment based on evidence available at decision time and a careless or unsupported conclusion. Do not assume every scenario has one correct ruling; determine how task purpose and required information shape completeness. The engine contract now supports Work-specific assessment results across the applicable Section 9.2 dimensions, each with a meets/partial/fails status and explanation. Universal scoring weights, outcome thresholds, and final feedback language remain undecided.
22. Complete the character system: define class-specific starting circumstances and benefits; specialization content, qualification and advancement requirements; the detailed personality-trait catalog, emergence and change rules, and mechanical effects; the detailed condition catalog and numerical effects; the action-resolution model connecting attributes, skills, specializations, equipment, conditions, and circumstances; and the detailed equipment catalog and balancing. The four initial career paths, six attributes and their relatively stable progression, six core skills and primary attribute pairings, independent skill-experience tracks, 1–10 skill scale, Career XP investment principle, multi-specialization model, Primary Specialization, three expertise levels, initial personality-trait selection and emergent/changeable personality principles, condition principles, and initial equipment principles are established. Exact thresholds, costs, trait content, and action-resolution mechanics remain open.
23. Define the family desk's upgrade economy and era-transition treatment, including upgrade effects, costs, adaptation, and the modest inherited bonuses retained from previous eras. The desk's continuity role and broad transition principle are established; individual upgrades and numerical effects are not.
24. Define the notification and attention rules: event prioritization, immediate-alert thresholds, morning-report delivery and grouping, event-log organization, and navigation from notices to relevant people, records, institutions, and locations. The morning report's purpose is established as a selective briefing of what is relevant to the player now, including approaching deadlines, changes to ongoing matters, plausible opportunities, and warnings; exact thresholds, layout, and runtime behavior remain open.
25. Define the reusable internal-monologue system: determine how examined evidence is paired with character-situated interpretation; how skills, attributes, experience, equipment, relationships, background, and current circumstances influence recognition, reasoning, confidence, and possible error; and how the system communicates uncertainty without becoming an omniscient hint or concealing objective evidence. The evidence/interpretation/judgment/assessment distinction and the initial deterministic predicate/rule engine contract are approved. The engine contract includes safe handling of missing skill/attribute values, cross-evidence re-evaluation, conflict resolution, display ordering, and a static authoring validator. The full set of character influences, authored interpretation content, confidence/error presentation, and playtested thresholds remain open.

These are open design tasks, not invitations to fill gaps with arbitrary placeholder systems.

---

## 24. Glossary

| Term | Meaning |
|---|---|
| **Assignment / Commission** | An optional short professional job offered by an employer, institution, official, merchant, or other contact. |
| **Career XP** | Experience earned through professional work, Challenges, and qualifying learning; used as an investment currency for eligible professional development, not as a direct rank score. |
| **Professional rank** | A character-level grade derived from that character's own skill profile; it shapes baseline opportunity access but does not establish task competence or formal authority. |
| **Appointment** | A specific institutional office or position that grants the authority and responsibilities attached to it. |
| **Challenge** | An optional, separate scenario arising from behavior, relationships, neglected opportunities, or historical events. |
| **Era** | A historical period with distinct people, institutions, materials, writing practices, and Works. |
| **Historical Progress XP** | Progress earned through completed Works and used for historical milestone advancement. |
| **Legacy** | The professional, social, familial, and institutional history that can persist beyond one character or generation. |
| **Action Point (AP)** | One unit of the shared daily capacity used for substantive activities. The initial daily budget is 6 AP. |
| **Work** | A mandatory long-form historical undertaking with defined actions, stages, evidence, deliverables, solution space, and consequences. It advances the main historical progression. |
| **Workday** | An in-game day with 6 shared Action Points. The player chooses professional and personal activities, then explicitly initiates one daily settlement. |

---

## 25. Design Summary

*Scribe of Eras* is about the human history of making knowledge durable and useful. The player begins in Uruk, develops a professional identity, and becomes involved in the people and institutions that shape written culture.

Assignments provide optional professional work. Challenges introduce optional complications and opportunities. Works are the historical progression layer: a varied portfolio of historically grounded undertakings, from smaller career-scale projects to larger authored milestone experiences. Some milestone Works may be offered through date-based invitations, with availability windows appropriate to the historical evidence and access shaped by the character's career and circumstances. The player may miss or decline an invitation; history continues, and the wider Works portfolio must provide a coherent progression route. Works should be designed around the actual subject and the kind of gameplay it creates, not forced into one universal sequence or the Storehouse Reckoning template. The Storehouse Reckoning is the first vertical slice, not the model for every future Work.

The daily economy of action is six shared Action Points, not a fixed number of commission slots, fixed commission count, or real-time timer. The player chooses how to divide those points among Assignments, Work progress, Challenges, study, and relationships. The Storehouse Reckoning provides one unit of provisions per active contracted Workday; provisions are the abstract daily food resource. Unaccepted offers normally expire after three in-game days, while accepted work remains active until resolved or cancelled. The player may hold at most two accepted Assignments; offers that lapse while a mandatory Work occupies the player do not count as ignored opportunities for Challenge triggers.

Career XP is earned through professional activity and invested in eligible skill and specialization development; it does not directly determine rank. A character's rank follows from their own skill profile and shapes the broad range of opportunities likely to reach them. Skills determine qualification for specific work, and appointments grant formal authority. The former commission-tier ladder is removed; individual Assignments retain a separate difficulty marker. Historical Progress XP measures mandatory historical contributions. The calendar controls in-game dates; XP does not. Era-transition rewards must be calibrated so completing all required Works is sufficient to reach the next threshold without optional grinding.

The personal economy has two tracked resources: money and provisions. Money uses an era-appropriate currency name without conversion of the underlying value at era transitions; provisions remain an abstract food resource presented through era-appropriate foods and rations. Beer is not a tracked personal resource, though it may appear in the world, inventory, hospitality, and institutional or social exchanges. Exact prices, availability, storage, crisis timing, assistance frequency and effects, sustenance shortage consequences, and historical presentation remain open design work.

The journey continues through existing scribal NPCs connected to the current character and their profession. The player chooses among plausible candidates, subject to their actual circumstances and availability. If no close apprentice or obvious successor exists, the player continues through another existing connected scribal NPC in the same historical period; the calendar, completed Works, and wider world do not restart. The new character retains their own skills, reputation, relationships, obligations, possessions, and circumstances. The family desk remains a family heirloom and workspace, not a vessel of player continuity; access depends on the current character's own relationships, household, location, and circumstances. Exact candidate eligibility and selection details, and the desk's access rules for non-family characters, remain open.
