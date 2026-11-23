---
title: "Scribe of Eras"
subtitle: "Canonical Game Design Document"
date: "23 November 2026"
lang: en-US
---

> **Canonical authority.** This document defines the identity, pillars, approved design principles, and locked gameplay boundaries of Scribe of Eras. Supporting specifications explain how individual systems and content implement those boundaries. They may add detail but may not silently contradict or supersede this document.
> **Decision maturity.** Statements are authoritative unless explicitly marked provisional or open. Supporting documents distinguish locked decisions, approved principles with unresolved implementation details, provisional values, proposals, and implementation facts. An implementation fact does not itself approve a design change.
> **Change control.** A locked decision may be challenged, but it changes only through deliberate owner review and an explicit revision to this GDD and the Decision Register. Engineering may make technical decisions within approved design boundaries without requiring a GDD revision.
> **Documentation hierarchy.** See [Design Documentation Guide](design/README.md), [Decision Register](design/DECISION_REGISTER.md), [Open Design Register](design/OPEN_DESIGN_REGISTER.md), and [Implementation Status](production/IMPLEMENTATION_STATUS.md).

**Genre:** Historical career role-playing game / administrative simulation  
**Format:** Single-player, long-form historical journey  
**Starting place and period:** Uruk, southern Mesopotamia, c. 3200 BCE  
**Scope:** Seven planned eras, from early cuneiform to digital writing

---

## Executive Summary

*Scribe of Eras* is a historical role-playing game about the people who record, preserve, organize, interpret, and circulate knowledge. The player begins as an apprentice scribe in Uruk around 3200 BCE and builds a professional life through changing institutions, relationships, technologies, and historical eras.

The central activity is not copying text or completing typing tests. It is understanding a situation, examining evidence, deciding what the record must say, constructing an appropriate document, and accepting responsibility for its consequences. A delivery receipt can determine whether a storehouse is credited with usable goods. An inventory can expose a discrepancy. A disputed account can affect the standing of several people. The player's records matter because other people and institutions act on them.

The opening Storehouse Reckoning is a separate Introductory Tutorial, not one of the three gameplay layers. It introduces basic evidence handling, numerical reconciliation, submission, and assessment without awarding Historical Progress XP or counting as a completed Work.

The game has three distinct gameplay layers:

1. **Assignments / Commissions** are optional, playable professional jobs. The player chooses which available opportunities to pursue, subject to a shared daily action budget. Completing them develops the player's career and provides compensation, but is not required for historical advancement.
2. **Challenges** are optional, separate scenarios arising from behavior, neglected opportunities, relationships, or historical events. They are not ordinary employment and do not use the Assignment system.
3. **Works** are mandatory, substantial historical undertakings. They represent significant human achievements made possible by writing, records, communication, and institutions. Works—not routine assignments or optional Challenges—drive Historical Progress XP and advancement between eras.

The **Storehouse Reckoning** is the Introductory Tutorial. It teaches basic professional concepts and interface interactions through a guided apprenticeship exercise. It is not an Assignment, Challenge, or Work; it awards no Historical Progress XP and is excluded from completedWorks. Its guided evidence, numerical-entry, submission, and assessment sequence must not be treated as the standard structure for future Works.

Career progression and historical progression are separate. **Career XP** is earned through professional activity and serves as an investment currency for eligible skill improvements, specialization development, and other defined forms of professional development; it does not directly determine rank. A character's professional rank is derived from that character's own skill profile and influences the broad range of opportunities likely to reach them. Skills determine qualification for specific work, while appointments grant formal authority and responsibilities. **Historical Progress XP** measures the advancement represented by completed Works. A character can attain high professional standing while the player remains in an early historical era; entering a new era does not automatically increase that character's rank.

The player's personal economy has two resources: **money and provisions**. Money is spendable wealth, presented using the historically appropriate currency name and denomination for the current era. Provisions represent food and everyday sustenance, presented in historically appropriate forms. Their underlying balances carry across eras unchanged; only their presentation is reskinned. 

The player, not any individual character, is the constant across the historical journey. The player experiences history through the work of successive scribal characters: people live, age, leave the profession, and die, while the player's participation in the world continues. When a character can no longer be played, the player takes up another existing scribal NPC with an established connection to that character and their professional world, in the same historical period. The new character may be far less experienced or socially prominent than the previous one; their own skills, personality, relationships, obligations, affiliations, possessions, and circumstances determine the player's new starting position. This is a change of viewpoint, not an inheritance of the former character's identity or an era restart. The character-transition principle is defined in the [Character and Career Specification](design/CHARACTER_AND_CAREER_SPEC.md#16-player-continuity-through-successive-characters).

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

Assignments and Challenges offer agency, money, resources, experience, relationships, and narrative complications. They do not gate the core historical journey. Mandatory Works carry the main progression between eras. All three activity types draw from the same daily action budget, so optional work has a real opportunity cost without requiring real-time pressure.

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

### 2.12 Personal economy and hardship

The character's tracked personal economy has exactly two balances: **Money** and **Provisions**. Do not add a separate Beer balance or grant universal free daily rations. Era-specific names, denominations, and visual presentation may change; the underlying two-resource model remains consistent.

A provisions shortage begins on the **third consecutive Workday without provisions**. Each affected Workday adds **+2 Stress**, up to **10 cumulative shortage-attributed Stress per character**. Shortage also causes the recoverable **Underfed** condition. Concrete recovery routes must be available in the same milestone that introduces the shortage consequences. These boundaries are locked; detailed prices, compensation, availability, and recovery balance are maintained in the Economy and Consequences Specification.

---

## 3. Genre, Structure, and Point of View

### 3.1 Genre

*Scribe of Eras* is a historical career RPG with administrative simulation, evidence-based problem solving, narrative choices, and long-form historical progression. It is not primarily a strategy game about controlling territory, a combat RPG, a typing game, or a transcription simulator.

### 3.2 Single-player experience

The player experiences history through successive scribal characters. An individual character's life is not the player's life: when a character dies or otherwise leaves play, the player takes up another existing scribal NPC with an established connection to the former character and their professional world, in the same historical period. The next character may be a low-ranking or inexperienced scribe rather than an equally accomplished replacement. Their own circumstances and abilities define the player's new position. The player should feel responsible for decisions and records, while the surrounding world continues to develop through authored historical events and scenario consequences.

### 3.3 Player role

The player begins as an apprentice scribe in Uruk. The player's precise name, family background, and early personal circumstances can be established during the opening of the game.

### 3.4 Character foundations and initial career paths

The character is a situated person, not a fixed class. The four initial career paths are **Government**, **Military**, **Religious**, and **Merchant**. They shape starting context, institutions, contacts, responsibilities, and opportunities without permanently restricting future work. Detailed attributes, skills, specializations, traits, conditions, creation, and career progression are defined in the [Character and Career Specification](design/CHARACTER_AND_CAREER_SPEC.md).


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
- Checking inventory and storage conditions.
- Recording distributions and allocations.
- Investigating discrepancies in accounts.
- Inspecting buildings, equipment, goods, or worksites.
- Preparing receipts, orders, reports, and correspondence.
- Recording labor, obligations, and institutional activity.
- Resolving administrative disputes and preparing findings.

An Assignment must be a playable professional activity, not a card that converts an AP cost directly into a completed outcome. It must give the player meaningful, context-appropriate actions and decisions before resolution. Most substantive Assignments will involve multiple steps; even a brief task must require more than a single generic completion click. Steps must represent actual work rather than interface filler.

The structure follows the job. Depending on the situation, the player may inspect a place or object, examine a record, question or consult a person, compare accounts or testimony, make a judgment, prepare a document, direct a practical response, or verify that an action was carried out. These are reusable kinds of interaction, not a mandatory sequence. An Assignment uses only the actions appropriate to its purpose and may produce a record, finding, instruction, verified status, or other fitting deliverable. Not every Assignment must end in the same form or require a formal document.

People are participants in the work, not decorative names attached to a docket. An NPC may share only information they plausibly know and are willing or authorized to disclose. Their knowledge, interests, obligations, authority, circumstances, and directional relationship with the player shape the interaction. The player may need to establish access, ask the right person, account for conflicting testimony, or proceed without information that cannot reasonably be obtained.

Assignments must not become cloned dockets. A common data model may preserve contextual facts, provenance, roles, and state, but the player-facing activity must be designed around the actual job. Do not force every task through an identical evidence list, numeric form, interview, or report pipeline. Apply the complete-record dimensions in [Activity, Work, and Evaluation Specification §8.1](design/ACTIVITY_AND_WORK_SPEC.md#81-complete-contextual-records) where relevant; do not invent fields or roles that the situation does not require.

Assignments are optional professional opportunities available during the workday. Each substantive action uses the shared daily AP budget, with its cost and consequences shown before commitment. The offer must communicate the expected scope and likely AP commitment. A larger Assignment may span more than one day; charge for its substantive stages without also charging a duplicate full-scope cost. Reviewing information already acquired and navigating the interface do not create hidden AP costs.

Offers normally expire three in-game days after presentation if not accepted; the default expiry is the offered day plus three, and expiry is applied during daily settlement. A character may hold at most two accepted Assignments at once. Accepting or declining an offer costs no AP; cancelling an accepted Assignment costs 1 AP. Cancellation has no automatic relationship or institutional penalty: only consequences explicitly authored for that Assignment apply. Accepted work remains active until resolved or cancelled.

Completing an Assignment can award Career XP, money and provisions, and other appropriate authored consequences. Assignments do not directly award Historical Progress XP.

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

The Storehouse Reckoning described in the [Activity, Work, and Evaluation Specification](design/ACTIVITY_AND_WORK_SPEC.md#7-era-i-introductory-tutorial-the-storehouse-reckoning) is an introductory tutorial, not a Work example or a template for the Works system. Future Works must be designed around their own historical undertaking, human problem, mechanics, stages, and scale.

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

The settlement must not grant a universal free ration merely because a day passed. Any money and provisions, or specific item credited as compensation must be tied to a defined employment arrangement, completed service, or explicit reward. The details of the sustenance model are defined in the [Economy, Stress, and Ethical Consequences Specification](design/ECONOMY_AND_CONSEQUENCES_SPEC.md).

---

## 22. Boundaries and Exclusions

The following are not part of the current core design unless deliberately approved later:
- Combat as a primary gameplay system.
- Territory conquest or a ruler-focused strategy layer.
- A typing-speed or transcription-only core mechanic.
- Freehand handwriting recognition or a research-grade sign editor.
- A real-time countdown workday or real-time commission deadline mechanic.
- Historical Progress XP from ordinary Assignments or optional Challenges.
- Optional Challenge completion as a mandatory prerequisite for Works.
- Career rank determined by historical era or Historical Progress XP.
- Automatic free resources or negative personal resource balances.
- Runtime dependence on generative AI to create assignments, validate records, or determine outcomes.

The game may represent complex technologies, institutions, and historical events, but they should serve the central career and knowledge-history experience.

The production application is implemented in TypeScript. The current production entry boundary is `src/App.tsx`, mounting `ProductionApp` and `ProductionShell`; the production save key is `scribe_game_v2`. These are technical boundaries, not a substitute for the dated implementation record in [Implementation Status](production/IMPLEMENTATION_STATUS.md).

---

## 23. Remaining Design Work

The complete unresolved design inventory, maturity notes, dependencies, and milestone classifications are maintained in the [Open Design Register](design/OPEN_DESIGN_REGISTER.md). Open work is not discarded by moving it out of this document. The register distinguishes what blocks the current milestone from what is required soon or belongs to the future game.

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

Assignments provide optional professional work. Challenges introduce optional complications and opportunities. Works are the historical progression layer: a varied portfolio of historically grounded undertakings, from smaller career-scale projects to larger authored milestone experiences. Some milestone Works may be offered through date-based invitations, with availability windows appropriate to the historical evidence and access shaped by the character's career and circumstances. The player may miss or decline an invitation; history continues, and the wider Works portfolio must provide a coherent progression route. Works should be designed around the actual subject and the kind of gameplay it creates, not forced into one universal sequence or the Storehouse Reckoning template. The Storehouse Reckoning is the Introductory Tutorial, outside Assignments, Challenges, and Works. It awards 0 Historical Progress XP, is excluded from completedWorks, and teaches basic evidence, numerical-entry, submission, and assessment interactions. It is not a Work vertical slice or a model for future Works.

The daily economy of action is six shared Action Points, not a fixed number of commission slots, fixed commission count, or real-time timer. The player chooses how to divide those points among Assignments, Work progress, Challenges, study, and relationships. The Introductory Tutorial has no provisions contract. The apprentice begins with five units of provisions, supplemented by compensation from the paid starter Assignments; provisions are the daily food resource. Shortage consequences begin on the third consecutive Workday without provisions and follow the capped, recoverable rule in [Economy Specification §§12.3–12.4](design/ECONOMY_AND_CONSEQUENCES_SPEC.md#123-daily-sustenance), with recovery routes required in the same milestone. Unaccepted offers normally expire after three in-game days, while accepted work remains active until resolved or cancelled. The player may hold at most two accepted Assignments; offers that lapse while a mandatory Work occupies the player do not count as ignored opportunities for Challenge triggers.

Career XP is earned through professional activity and invested in eligible skill and specialization development; it does not directly determine rank. A character's rank follows from their own skill profile and shapes the broad range of opportunities likely to reach them. Skills determine qualification for specific work, and appointments grant formal authority. The former commission-tier ladder is removed; individual Assignments retain a separate difficulty marker. Historical Progress XP measures mandatory historical contributions. The calendar controls in-game dates; XP does not. Era-transition rewards must be calibrated so completing all required Works is sufficient to reach the next threshold without optional grinding.

The personal economy has two resources: money and provisions. Their presentation changes with the historical era, and their balances carry forward unchanged. Exact prices, availability, storage, compensation balance, crisis timing, and assistance frequency and effects remain open design work. The shortage trigger, shortage-attributed Stress cap, Underfed condition, and required recovery routes are established in Sections 12.3–12.4.

The journey continues through existing scribal NPCs connected to the current character and their profession. The player chooses among plausible candidates, subject to their actual circumstances and availability. If no close apprentice or obvious successor exists, the player continues through another existing connected scribal NPC in the same historical period; the calendar, completed Works, and wider world do not restart. The new character retains their own skills, reputation, relationships, obligations, possessions, and circumstances. The family desk remains a family heirloom and workspace, not a vessel of player continuity; access depends on the current character's own relationships, household, location, and circumstances. Exact candidate eligibility and selection details, and the desk's access rules for non-family characters, remain open.
