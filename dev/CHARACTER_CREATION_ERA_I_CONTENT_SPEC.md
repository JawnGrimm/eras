# Character Creation — Era I Authored Content and Starting-State Specification

**Status:** Proposal incorporating Game Director approvals dated 2026-11-23  
**Depends on:** `dev/URUK_CHARACTER_CREATION_MATRIX.md`; `dev/CHARACTER_CREATION_PLAYER_FLOW.md`; `dev/ERA_I_INSTITUTION_RESPONSIBILITY_MATRIX.md`  
**Canonical authority:** `docs/GDD.md`  
**Scope:** First playable Era I authored choices, character/NPC connections, biography assembly, and deterministic starting-state contract. This is not a production implementation or a numerical character-balance decision.

## 1. Owner decisions incorporated

The Game Director has approved:

1. The nine-screen character-creation flow and one primary choice per chapter.
2. The narrower first-playable Era I content set.
3. Inclusion of the Martial orientation in Era I character creation.
4. Inclusion of traits and ambition in the character-creation experience as placeholders.

These approvals establish the content direction. They do not approve numerical starting attributes, skill levels, Career XP, rank, equipment, money, provisions, or any new action-resolution formula.

### Placeholder interpretation for traits and ambition

The first playable creator should reserve and visibly present both areas, but the current content pass must not invent a trait catalog or imply that ambition is a quest system.

- **Traits:** Show two reserved starting-trait slots, with explanatory placeholder copy such as “Your starting traits will be chosen here in a later character-design pass.” Do not present fake trait names as selectable content. Do not populate `scribal.traits` with invented IDs.
- **Ambition:** Show the ambition prompt and a reserved response area with placeholder copy such as “Your character's ambition will be defined here.” It is not a selectable objective, hidden quest, progression track, or mechanical modifier yet.
- The final biography should reserve a short “Personal qualities” and “Ambition” area. Until authored content is approved, show neither as if the character has a selected trait or established ambition.

The placeholders are part of the approved presentation flow, not approved mechanics.

## 2. Era I content boundaries

The first-playable content package uses four options in each of the five life-history/orientation chapters:

1. Origin
2. Early responsibility
3. Formative experience
4. Entry into scribal work
5. First instruction

The sixth chapter is professional orientation, with the four GDD paths. Identity and biography review follow.

Historical grounding is used to author believable situations, not to model every household, labor system, office, or route into literacy. Choice combinations are curated and conditional. They are not a fully combinatorial narrative tree.

### Era I confidence convention

- **Attested:** The broad activity, material, or practice is directly supported by the cited Era I research.
- **Inferred:** A plausible relationship or activity is supported by the evidence but is not directly documented as this exact person's biography.
- **Reconstruction:** A deliberately authored fictional situation that makes the game playable without claiming it is a known historical event or standard institution.
- **Unsupported / exclude:** A claim that should not appear as fact in this period without new evidence.

A fictional person's existence and personal history are authored narrative content. Historical confidence applies to the social and institutional claims implied by that content.

## 3. Choice catalogue

The following is the first-playable authored option set. Player-facing copy is written for readability. Historical confidence and consequence notes are authoring metadata, not text the player must read.

### 3.1 Origins

**OR-01 — Food and provisioning**

Player-facing text:

> You grew up around the preparation, storage, and movement of food. You learned how much work sits behind an apparently simple allocation.

- Establishes familiarity candidate: food handling, storage, or provisioning. The exact domain is narrowed by later choices.
- Suggested compatible responsibilities: counting/measuring; helping with deliveries; coordinating a small task.
- Historical basis: administrative records and archaeological contexts support food production, storage, issue, and distribution.
- Confidence: Attested for the broad activity; Inferred for this particular household history.
- Does not establish ownership of stores, a privileged household, or institutional office.

**OR-02 — Fields and herds**

Player-facing text:

> Much of the work you knew began beyond the city: fields, animals, seasonal tasks, and bringing produce where it was needed.

- Familiarity candidate: agricultural or pastoral work and the movement of produce.
- Suggested compatible responsibilities: count/measure; deliveries; judge material or produce condition.
- Historical basis: agricultural and pastoral production and administrative recording are present in the wider Uruk-period evidence.
- Confidence: Attested for the broad activities; Inferred for the individual biography.
- Does not establish a universal corvée obligation, a fixed rural class, or a specific legal status.

**OR-03 — Skilled making**

Player-facing text:

> You grew up around people who shaped useful things, judged materials, and knew how much work a finished object concealed.

- Familiarity candidate: materials, processing, workmanship, or a particular craft context.
- Suggested compatible responsibilities: judge materials/quality; coordinate a task; observe a record or seal in use.
- Historical basis: craft production and material flows occur in the archaeological and administrative context, but exact household organization is variable.
- Confidence: Attested for craft activity; Inferred for the specific social route.
- Does not establish a formal guild, craft qualification, or inherited occupation.

**OR-04 — Exchange and movement**

Player-facing text:

> You knew the work of moving goods: deliveries, routes, quantities, handovers, and the people waiting at the other end.

- Familiarity candidate: transport, delivery, custody, counterparties, or commodity movement.
- Suggested compatible responsibilities: deliveries; count/measure; observe a record or seal in use.
- Historical basis: commodity movement and regional/interregional exchange networks are supported, while exact individual commercial structures are less certain.
- Confidence: Attested for movement and exchange networks; Inferred for the individual biography.
- Does not establish an independent private merchant house, commercial ownership, or modern contract status.

### 3.2 Early responsibilities

**RS-01 — Count or measure**

> You were asked to count, compare, or measure things that someone else needed to account for.

- Familiarity candidate: quantities and the specific commodities/measures selected by the authored biography.
- Compatible origins: all four.
- Confidence: Attested for administrative measurement; Inferred for the person's early responsibility.
- Does not grant Recordkeeping & Accounts skill levels or accounting mastery.

**RS-02 — Help with deliveries**

> You learned who was expecting a delivery, what had to travel, and what could go wrong between handover and arrival.

- Familiarity candidate: delivery sequence, transport, and counterparties.
- Best origins: Food and provisioning; Fields and herds; Exchange and movement.
- Confidence: Attested for commodity movement; Inferred for the individual's participation.
- Does not grant transport authority, ownership, or guaranteed access to carriers.

**RS-03 — Judge materials or quality**

> You learned to notice when material, workmanship, or condition did not match what was expected.

- Familiarity candidate: one authored material or product context.
- Best origins: Skilled making; Food and provisioning; Fields and herds.
- Confidence: Attested for material/condition distinctions in relevant contexts; Inferred for the individual.
- Does not grant a craft qualification or universal expertise.

**RS-04 — Observe a record or seal in use**

> You watched someone use a mark, seal, token, or tablet to make a transaction or responsibility recognizable.

- Familiarity candidate: a particular record or custody practice.
- Best origins: Exchange and movement; Food and provisioning; Skilled making.
- Confidence: Attested for early tablets, sealings, and administrative use; Inferred for the specific observation.
- Does not establish literacy, the ability to read proto-cuneiform, or authority to apply a seal.

### 3.3 Formative experiences

**FE-01 — A quantity did not match**

> A quantity everyone relied on turned out not to match what had actually been received or used.

- Biography theme: discrepancy, uncertainty, and the difference between a count and its explanation.
- Compatible responsibilities: Count or measure; Help with deliveries.
- Confidence: Reconstruction built from attested administrative problem types.
- Does not identify a culprit or imply fraud.

**FE-02 — You were blamed unfairly**

> You were held responsible for a mistake you did not believe was yours.

- Biography theme: responsibility, evidence, and the consequences of an unsupported accusation.
- Compatible responsibilities: all, with wording tailored to the selected responsibility.
- Confidence: Reconstruction.
- Does not automatically create a permanent resentment relationship or a trait.

**FE-03 — You helped settle a disagreement**

> Two people remembered an agreement differently, and you helped establish what each had actually seen or promised.

- Biography theme: testimony, memory, and limits of what can be established.
- Compatible responsibilities: deliveries; counting/measuring; judging materials.
- Confidence: Reconstruction.
- Does not imply a formal court, legal office, or modern contract system.

**FE-04 — You were trusted with an adult responsibility**

> Someone gave you responsibility before others thought you were ready.

- Biography theme: early trust and the burden of being relied upon.
- Compatible responsibilities: all.
- Confidence: Reconstruction.
- Does not award appointment, qualification, or an automatic positive relationship score.

### 3.4 Entry into scribal work

Every route ends in supervised instruction by **Shuruppak-ilu**, the existing Senior Scribe in the current Era I opening. The route changes who brought the character to him and why. It does not create a separate school, formal admission system, or disposable mentor.

**EN-01 — Someone introduced you**

> Someone who knew you or your work introduced you to a person involved in keeping records.

- Primary recommender: **Ur-gir**, the existing established scribal colleague, where earlier choices establish a credible acquaintance; otherwise use **Ur-Nanna** as the introducer through a storehouse responsibility.
- Trainer: Shuruppak-ilu.
- Confidence: Reconstruction using existing fictional Persons and the documented administrative context.
- Relationship: familiarity from contact; respect or trust changes only if a specific authored event warrants it.
- Does not imply patronage, affection, or a debt.

**EN-02 — Your work earned a recommendation**

> Someone noticed how you handled a responsibility and recommended that you be given a chance to learn.

- Recommender mapping:
  - Count or measure / provisioning: **Ur-Nanna**, Storehouse Steward.
  - Delivery / movement / custody: **Enlil-kisu**, Carrier Foreman.
  - Quality / production context: **Nin-kasi**, Brewing-House Representative, only when the selected biography genuinely involves the relevant goods or delivery.
- Trainer: Shuruppak-ilu.
- Confidence: Reconstruction based on the existing fictional cast and roles.
- Relationship: record the recommendation as an event/history fact; do not automatically grant trust, qualification, or appointment.

**EN-03 — You were needed as an assistant**

> A group needed a dependable assistant, and you were brought in to learn by helping.

- Sponsor/context:
  - Institutional storage or allocation: Ur-Nanna.
  - Dispatch or delivery work: Enlil-kisu.
  - A relevant production/delivery matter: Nin-kasi.
- Trainer: Shuruppak-ilu.
- Confidence: Reconstruction.
- The player begins with a plausible work connection, not an office or guaranteed employment contract.

**EN-04 — An encounter opened a door**

> A delivery, disagreement, or other piece of work brought you into contact with someone willing to teach you.

- Contact mapping follows the formative experience:
  - Disagreement involving delivery: Enlil-kisu.
  - Storehouse quantity or allocation: Ur-Nanna.
  - Relevant production/delivery issue: Nin-kasi.
  - Existing scribal contact: Ur-gir.
- Trainer: Shuruppak-ilu.
- Confidence: Reconstruction.
- Does not imply that one brief encounter created a deep relationship.

**Trainer invariance:** Shuruppak-ilu remains the common supervisor for the opening tutorial. His role as Senior Scribe is already part of the established opening. Do not create four separate mentors or alter the tutorial to match the career orientation.

### 3.5 First instruction

**TR-01 — Quantities and commodity notation**

> You practiced recording quantities beside the goods they described, and learned that a number only made sense in its proper system.

- Familiarity candidate: one or two specific commodities and their relevant notation/measurement context.
- Does not imply broad literacy or fluency in every numerical system.

**TR-02 — Clay, stylus, and tablet preparation**

> You learned how clay behaved, how a tablet was prepared, and how marks had to be made to remain legible.

- Familiarity candidate: clay handling, tablet preparation, stylus handling.
- Does not imply ability to read complex texts or produce authoritative records.

**TR-03 — Signs and category lists**

> You practiced recognizing and reproducing a limited set of signs and categories used in the work around you.

- Familiarity candidate: a narrow authored set of signs/categories.
- Historical basis: archaic lexical lists and early sign use; avoid claiming a standardized school curriculum.
- Does not imply comprehensive reading ability.

**TR-04 — Checking and organizing records**

> You helped compare entries, keep related information together, and notice when two accounts did not agree.

- Familiarity candidate: comparison and organization of a narrow set of administrative records.
- Does not imply authority to amend official records or a qualification in accounting.

## 4. Professional orientation — four approved Era I options

The four GDD orientations remain available. The general explanation appears first, followed by the local Uruk expression. The local expression is not a claim that four distinct bureaucracies existed.

### Civic

**General role**

> You are drawn to the work of institutions: organizing resources, keeping responsibilities clear, and helping collective work function.

**Uruk expression**

> This may bring you into administrative activity associated with storage, distribution, labor, and institutional coordination. These responsibilities can overlap with sacred and ceremonial life.

**Opening contact/context:** Ur-Nanna and the Temple Storehouse's existing responsibilities are the most direct contact. Shuruppak-ilu remains the shared trainer.

**Starting result:** Civic orientation; a plausible administrative contact; one relevant responsibility from earlier choices.

**Exclusions:** No office, appointment, authority to issue goods, institutional command, or exclusive access.

**Confidence:** Inferred at the level of broad institutional administration; the character's particular route is Reconstruction.

### Religious

**General role**

> You are drawn to institutions and people whose work is connected to sacred practice, ritual, and the responsibilities that support them.

**Uruk expression**

> Sacred activity and economic administration may overlap. Eanna offers the strongest administrative context in the surviving evidence; Anu/Kullaba is a distinct monumental and sacred setting with a thinner excavated administrative record.

**Opening contact/context:** The existing Temple Storehouse and Shuruppak-ilu provide a shared institutional/scribal connection. The character's orientation expresses interest in sacred and ceremonial responsibilities; it does not assert that Shuruppak-ilu or Ur-Nanna holds a priestly office. A specific ceremonial contact is not required for the first tutorial.

**Starting result:** Religious orientation; a narrative interest in sacred/ceremonial administration; the same shared trainer and tutorial.

**Exclusions:** No priestly title, ritual authority, temple office, or invented parallel archive at Anu/Kullaba.

**Confidence:** Inferred for the overlap between sacred and administrative activity; Reconstruction for this person's interest and route.

### Commercial

**General role**

> You are drawn to exchange: moving goods, maintaining relationships between counterparties, and making sure what is promised reaches the people expecting it.

**Uruk expression**

> This is best understood through procurement, exchange, delivery, and movement networks—not as a modern merchant house or a fully documented commercial profession.

**Opening contact/context:** Enlil-kisu is the most direct existing contact for dispatch and transport; Nin-kasi can be relevant where the biography involves goods received or issued to the brewing-house operation.

**Starting result:** Commercial orientation; a delivery, movement, or counterparty context; non-exclusive access to wider institutional work.

**Exclusions:** No private merchant-house membership, ownership of goods, commercial authority, or automatic access to every counterparty.

**Confidence:** Attested for exchange and movement networks; Inferred/Reconstruction for the specific person's route.

### Martial — included by owner decision

**General role**

> You are drawn to the work that supports security, organized movement, and the coordination of people and resources in dangerous circumstances.

**Uruk expression**

> In this period, the evidence for a distinct military scribal career is weak. Your connection is to a specific matter of custody, protection, or movement under risk—not to a documented standing army or military bureaucracy.

**Opening contact/context:** Enlil-kisu, the existing Carrier Foreman, is the most defensible contact because delivery and movement can create concrete custody and route-security concerns. The character's connection is through a specific delivery or sealed-load responsibility. It is not a military posting and does not imply Enlil-kisu is a soldier.

**Starting result:** Martial orientation with the local gloss “Security and Mobilization”; an authored personal experience involving the custody or safe movement of goods; an existing transport contact.

**Exclusions:** No standing army, quartermaster corps, conscription, military rank, combat skill, weapons package, standard military ration system, or military appointment.

**Confidence:** Low-confidence historical framing for the broader security/mobilization connection; Reconstruction for the individual event and professional aspiration. Keep the low-confidence note in the content ledger, not as a scholarly disclaimer in the main player-facing copy.

**Design rationale:** The GDD requires the Martial orientation. Its Era I expression should be asymmetrical rather than falsely made equivalent to better-attested administrative contexts. A specific custody/transport connection gives the player a playable identity while preserving historical restraint.

## 5. Deterministic NPC connection map

The current production world already contains a small fictional Uruk cast. The first character-creation content pass should reuse these Persons rather than create a large new social graph.

| Existing Person | Existing role in current production state | Appropriate character-creation use | Do not imply |
|---|---|---|---|
| Shuruppak-ilu | Senior Scribe; reviews scribal work and determines institutional follow-up | Common trainer and tutorial supervisor | Priesthood, universal head of all scribes, or authority beyond his appointment |
| Ur-Nanna | Storehouse Steward; custody, access, maintenance records | Recommender/contact for provisioning and institutional work | Authority outside the Storehouse appointment |
| Enlil-kisu | Carrier Foreman; dispatch records and delivery context | Recommender/contact for movement, custody, and Martial-orientation context | Soldier, military officer, or proof of an army |
| Utu-mansum | Receiving Official; records incoming delivery quantity and condition | Optional contact for intake/counting experience | Authority to determine what happened before arrival |
| Nin-kasi | Brewing-House Representative; confirms receipt of issued goods | Optional counterparty/contact for production and delivery experience | Priest, temple official, or owner of the goods |
| Ur-gir | Established scribal colleague with a household and professional obligations | Existing scribal introducer where appropriate | Formal instructor or senior authority |
| Nin-aya | Scribal apprentice learning under senior instruction | Peer/apprentice context in later biography or opening prose | Mentor or independent authority |

### Relationship consequences

Character creation should establish the *basis* of a relationship, not award arbitrary relationship scores.

- Record who introduced or recommended the character and what they observed.
- Record who agreed to provide instruction and the scope of that instruction.
- Use familiarity to represent repeated contact only where it is actually established.
- Trust, respect, affection, resentment, and rivalry remain distinct directional dimensions. Do not infer one from another.
- A recommendation is not an obligation unless an explicit expectation or agreement is authored.
- Do not grant the character an obligation simply to make a biography feel consequential.
- If the current relationship model requires numerical dimensions, use the approved baseline/starting-state policy when one exists. This document does not set relationship numbers.

### NPC reuse rule

If a later choice refers to a Person already established by an earlier choice, reuse the same Person ID and extend the biography/relationship history. Never create a duplicate Ur-Nanna or a second Shuruppak-ilu because another chapter needs a contact.

## 6. Curated complete biographies

These profiles are the minimum authoring and QA set. They demonstrate the choices as complete people rather than mechanical builds. The biography paragraphs are examples to be refined by narrative editing.

### Profile A — The provisioning-connected administrator

**Choices**

- Origin: OR-01 Food and provisioning.
- Responsibility: RS-01 Count or measure.
- Formative experience: FE-01 A quantity did not match.
- Entry: EN-02 Your work earned a recommendation; Ur-Nanna recommends the character.
- First instruction: TR-01 Quantities and commodity notation.
- Orientation: Civic.

**People and connections**

- Ur-Nanna: saw the character handle a provisioning/counting responsibility and recommended them.
- Shuruppak-ilu: accepted the character for supervised instruction.
- The recommendation and instruction are separate relationship facts.

**Biography**

> You grew up around the preparation and storage of food. Early on, people began asking you to count quantities and compare what had been expected with what had actually arrived.
>
> You remember one occasion when the figures did not agree. The disagreement mattered less for the missing amount than for the people who were ready to blame one another.
>
> Ur-Nanna noticed that you took care to distinguish the count from the explanation. He recommended that you be allowed to assist Shuruppak-ilu, the Senior Scribe. Your first instruction has been narrow: quantities, commodity signs, and the measures used in the work around you.
>
> You are drawn toward institutional administration. In Uruk, that may mean helping organize resources and responsibilities in settings where administrative, sacred, and ceremonial activity can overlap.

**Starting context:** A credible introduction to the Temple Storehouse's administrative work. No authority over stock or official accounts.

### Profile B — The materials-conscious religious orientation

**Choices**

- Origin: OR-03 Skilled making.
- Responsibility: RS-03 Judge materials or quality.
- Formative experience: FE-04 You were trusted with an adult responsibility.
- Entry: EN-01 Someone introduced you; Ur-gir introduces the character.
- First instruction: TR-02 Clay, stylus, and tablet preparation.
- Orientation: Religious.

**People and connections**

- Ur-gir: existing scribal colleague who makes the introduction.
- Shuruppak-ilu: common trainer.
- No invented priest or formal religious office is required.

**Biography**

> You grew up around people who worked with materials and knew the difference between something that would serve its purpose and something that would fail. You learned to pay attention to condition, preparation, and the care taken before a finished object was presented.
>
> Someone trusted you with a responsibility earlier than you expected. You remember the care that required, and how easily a small mistake could affect work that belonged to other people.
>
> Ur-gir, whom you came to know through work, introduced you to Shuruppak-ilu. Your first instruction has been practical: preparing clay, handling a stylus, and making marks that remain clear.
>
> You are drawn toward work connected with sacred practice and the responsibilities that support it. In Uruk, those responsibilities may overlap with the administration of goods, people, and institutional activity. You begin with an interest and a connection—not a religious office.

**Starting context:** Shared Temple Storehouse training; an orientation toward sacred/ceremonial work, without a fabricated cultic appointment.

### Profile C — The delivery-connected merchant orientation

**Choices**

- Origin: OR-04 Exchange and movement.
- Responsibility: RS-02 Help with deliveries.
- Formative experience: FE-03 You helped settle a disagreement.
- Entry: EN-01 Someone introduced you; Enlil-kisu introduces the character through delivery work.
- First instruction: TR-04 Checking and organizing records.
- Orientation: Commercial.

**People and connections**

- Enlil-kisu: knows the character through delivery work and introduces them.
- Shuruppak-ilu: common trainer.
- Nin-kasi may appear as a known counterparty only if the selected delivery history involves the brewing-house operation.

**Biography**

> You grew up around the movement of goods. You learned that a delivery was not finished when something left one place: someone had to receive it, recognize it, and understand what had been handed over.
>
> You remember helping settle a disagreement between people who recalled a handover differently. You learned to ask what each person had actually seen rather than assume that one account explained the whole event.
>
> Enlil-kisu came to know you through delivery work and introduced you to Shuruppak-ilu. Your first instruction has been to compare and organize records, and to notice when two accounts do not agree.
>
> You are drawn toward exchange and the movement of goods. In Uruk, that means relationships between producers, carriers, institutions, and recipients—not membership in a modern merchant house.

**Starting context:** Delivery and counterparty familiarity. No ownership, private commercial authority, or guaranteed market access.

### Profile D — The custody-conscious Martial orientation

**Choices**

- Origin: OR-04 Exchange and movement.
- Responsibility: RS-04 Observe a record or seal in use.
- Formative experience: FE-01 A quantity did not match, personalized as a delayed or uncertain handover.
- Entry: EN-02 Your work earned a recommendation; Enlil-kisu recommends the character.
- First instruction: TR-04 Checking and organizing records.
- Orientation: Martial (Era I gloss: Security and Mobilization).

**People and connections**

- Enlil-kisu: existing Carrier Foreman; the relationship arises from transport/custody work.
- Shuruppak-ilu: common trainer.
- No soldier, commander, army, or military institution is created.

**Biography**

> You grew up around the movement of goods and the people responsible for getting them safely from one place to another. You learned to notice who had custody, what had been sealed, and whether a handover could be accounted for.
>
> You remember a delivery whose quantity or timing did not match what people expected. The available accounts did not establish whether the cause was delay, error, or something that happened along the way. What stayed with you was how exposed people and valuable goods could become when responsibility was unclear.
>
> Enlil-kisu noticed that you paid attention to the handover and its records. He recommended you to Shuruppak-ilu, whose instruction began with comparing and organizing records.
>
> You are drawn toward the work of security and organized movement. In this period, that does not mean joining a documented standing army. Your starting connection is to the practical problem of protecting people and goods and keeping responsibility clear when circumstances are uncertain.

**Starting context:** A credible transport/custody connection and Martial orientation. No combat capability, military office, or claim that a military scribal career existed.

**Historical note:** The specific remembered incident is a fictional reconstruction. It is not a claim about a known Uruk event or an attested military organization.

## 7. Combination rules and conflict handling

Do not author every possible permutation as a separate biography. Use a small set of authored fragments and deterministic compatibility rules.

1. Each chapter has one selected option.
2. Earlier selections may personalize later option descriptions and contact mapping but do not remove the four orientations.
3. If a selected entry route names a Person, that Person must already exist in the opening world roster or be created by an explicit authored world-initialization package. Prefer the current existing roster.
4. The entry route must be coherent with the formative experience and responsibility. If it is not, use the route's alternate contact mapping or present a different explanatory sentence—not an impossible causal link.
5. The orientation sets initial professional context only. It must not overwrite the life history or force a contradictory biography.
6. Martial remains selectable. If a particular combination cannot credibly support the Martial wording, adapt the local context to custody/transport/security rather than inventing an army or denying the choice.
7. The biography composer must not state that a person recommended the character unless the selected route actually records that recommendation.
8. A person who introduces the character and a person who trains the character may be the same only if the authored content explicitly supports both roles. Otherwise keep recommender and trainer distinct.
9. A choice's historical confidence metadata must not be silently upgraded because it appears in several biographies.
10. The same seed and choices must produce the same Person identity, connections, Life Events, biography, and opening state.

## 8. Deterministic starting-state contract

Character creation establishes an existing Person and a small set of durable world facts. It is not a pre-play simulation of every year of the character's life.

### Required outputs

- A Person identity with an era-appropriate name and the existing world identity model.
- One selected `careerPath` from the four existing IDs.
- A concise ordered set of authored Life Events.
- A small set of specific familiarity facts derived from selected responsibilities and instruction.
- Existing Person references for recommender, trainer, and any other consequential participant.
- Directional relationship history only where a meaningful interaction supports it.
- A coherent biography assembled from authored fragments.
- The opening state required by the current Era I tutorial and common starting scenario.

### Initialization invariants

- Character creation consumes no AP.
- Character creation awards no Career XP and no Historical Progress XP.
- It does not grant an appointment, qualification, specialization, or professional rank.
- It does not grant unearned skill levels or numerical attributes.
- It does not alter the objective evidence, required fields, assessment criteria, or authority of the Storehouse Reckoning.
- It does not silently create a debt, obligation, or commitment.
- It does not advance the calendar or simulate years of childhood.
- It does not use runtime generative AI.
- It must not create a duplicate of an existing Person.
- The opening tutorial remains supervised by Shuruppak-ilu and retains Ur-Nanna as the primary reader/client as defined by the existing tutorial design.

### Suggested output shape — conceptual only

The content should resolve into the existing Person/world model rather than create a parallel avatar system. The following is a conceptual contract, not a finalized TypeScript schema:

- `personId`: stable Person ID.
- `careerPath`: one of government / military / religious / merchant.
- `lifeHistory[]`: authored events in chronological order, with choice ID, approximate life stage, summary, participants, and historical-confidence metadata.
- `familiarity[]`: domain and basis of experience; no numeric bonuses until the familiarity model is approved.
- `connections[]`: existing Person ID, relationship basis, and whether the person introduced, recommended, or trained the character.
- `biographyFragments[]`: stable authored fragment IDs and resolved text.
- `identityPlaceholders`: reserved trait and ambition presentation slots, not mechanics.

The current production `Person` type has no dedicated life-history or familiarity fields. The `ScribalCharacterState` supports a career path and trait state, but this proposal does not define trait IDs or trait effects. The current production state also initializes a fixed Enlil-barni player character and fixed starting world. A later implementation task must replace or parameterize that new-game bootstrap without creating a separate character object or breaking existing save compatibility.

### Existing architecture facts to preserve

- `Person` is the shared identity model for player and NPCs.
- `CareerPathId` already contains the four GDD orientations.
- `ScribalCharacterState.careerPath` already supports an optional career path.
- `ScribalCharacterState.traits` already stores typed trait states, but this content pass does not establish the trait catalog.
- The current Person model includes relationships, affiliations, circumstances, objectives, commitments, and scribal state.
- The current model does not yet expose a dedicated Life Event collection or domain-familiarity field on Person.
- The current new-game bootstrap uses fixed character and NPC data; a creator needs a deterministic initialization boundary.
- Save schema is currently version 2. Any implementation that persists new life-history/familiarity data must explicitly review validation and migration/normalization behavior. Do not assume the schema can remain unchanged.

## 9. Storehouse Reckoning invariance test

Run the same tutorial with each of the four orientation profiles. The following must remain identical:

- Objective evidence and source wording.
- Required evidence acquisition/examination.
- Required fields and available recommendations.
- Formal authority: Shuruppak-ilu assesses and determines disposition; Ur-Nanna remains the primary reader/client.
- Assessment criteria and evidence/provenance rules.
- Career XP and Historical Progress XP treatment already defined for the tutorial.
- Workday/AP rules and all other locked invariants.

Character background may shape the internal monologue only when the specific experience justifies it. It may affect recognition, interpretation, confidence, or possible oversight, but cannot hide, falsify, or change objective evidence. Do not grant a Martial character combat options in the tutorial or a Religious character privileged access to evidence.

## 10. Content QA matrix

| Test | Expected result | Failure condition |
|---|---|---|
| Four origins crossed with all responsibilities | Coherent wording or authored alternate fragment | Origin acts as a hard class restriction |
| Each formative experience | A specific but bounded Life Event | Automatically grants a permanent trait or moral label |
| Four entry routes | Existing recommender/contact and Shuruppak-ilu trainer | Disposable NPC, duplicate Person, or unsupported formal school |
| Four orientations | All four remain selectable | Martial removed or made a formal army career |
| Religious orientation | Sacred/administrative overlap explained carefully | Invented priesthood or unsupported Anu archive |
| Martial orientation | Custody/security/transport context; low-confidence authoring metadata | Standing army, quartermaster corps, combat skill, or appointment implied |
| Traits and ambition | Visible placeholder slots only | Fake traits or quest mechanics presented as real |
| Biography assembly | Clear, consistent person and relationships | Contradictory choices or unsupported recommender claims |
| Determinism | Same seed and choices reproduce same starting state | Randomly generated NPC identities or biography drift |
| Tutorial parity | Same evidence and assessment for all four orientations | Path-specific objective evidence or authority |
| Progression parity | No free rank, XP, skill, qualification, or appointment | Background becomes an unapproved numerical build |

## 11. GDD alignment and cross-department impact

### GDD alignment

- **§3.3–3.4:** Makes the starting apprentice and four initial professional orientations concrete without inventing numerical benefits.
- **§4:** Provides a reusable cross-era character-creation content contract, with Era I as the first expression.
- **§7:** Preserves the common Storehouse Reckoning tutorial.
- **§15:** Uses existing Persons and relationships; does not create four exclusive institutions.
- **§16:** A new player character is an existing Person in the world; no inherited skills or rank are introduced.
- **§23 items 8, 10, 13, 22, and 25:** Advances relationship/agency context, continuity, Era I content, character creation, and situated interpretation.

No locked invariant is changed. The numerical starting-state model remains open and is intentionally not guessed here.

### Cross-department impact

- **Game Design:** Review combination coherence and ensure orientation is context, not class lock.
- **Historical Research:** Validate the exact wording of training, early lexical practice, religious-administrative overlap, and the low-confidence Martial expression.
- **Engineering & Architecture:** Add a deterministic new-game initialization boundary to the existing Person model; resolve life-history/familiarity persistence and save compatibility before coding.
- **Art/UI:** Include the approved trait and ambition placeholder areas; keep them visually present but clearly inactive.
- **Audio:** No required new system; optional low-key material cues.
- **Production/QA:** Test the four curated profiles, combinations, Person identity reuse, deterministic initialization, save compatibility, and tutorial invariance.

## 12. Recommendation and next gate

**Recommendation:** Adopt the four curated profiles in §6 as the first content and QA baselines. Retain all four orientations, including Martial, with the specific Era I limitations documented here. Keep trait and ambition areas visible as placeholders, not fake content.

The next design gate is to approve the content/relationship mapping and settle the minimum persistent representation for Life Events and familiarity. The numerical starting-state balance should remain a separate decision after the player-facing content and opening experience are validated.

**Game Director review requested**
1. Approve the four authored profile baselines or request changes.
2. Approve reuse of the existing opening NPC roster for recommender/trainer connections, with Shuruppak-ilu as the common trainer.
3. Approve the Martial expression as a custody/transport/security orientation rather than a formal military posting.
4. Confirm the traits and ambition placeholders are visible but inactive pending their catalogs.
5. Decide whether the next work should define the minimum Life Event/familiarity data contract or proceed to an interactive UI prototype after content approval.

Until reviewed, this document remains a proposal. It does not authorize GDD edits, schema changes, or production implementation.
