# Activity, Work, and Evaluation Specification

**Authority:** Supporting specification under [the canonical GDD](../GDD.md).  
**Status:** Consolidated from the approved GDD draft on 23 November 2026.

The high-level separation of Assignments / Commissions, Challenges, and Works remains in the GDD. The Storehouse Reckoning is an Introductory Tutorial outside all three layers and must not be used as a template for future Works.

## 7. Era I Introductory Tutorial: The Storehouse Reckoning

### 7.1 Purpose and scope

**The Storehouse Reckoning** is the Introductory Tutorial, a guided apprenticeship exercise set in a fictional institutional storehouse in Uruk around 3200 BCE. It sits outside the three gameplay layers: it is not an Assignment / Commission, Challenge, or Work. Its people and immediate incident are fictional; the scenario reflects early administrative uses of impressed clay records without claiming to depict a documented historical event or the invention of writing itself.

This tutorial is a **supervised apprenticeship exercise**, not a request to invent a permanent stockkeeping system. The Storehouse Steward has submitted a situation requiring a one-time reconciliation and practical recommendation. The Senior Scribe assigns the case to the apprentice, evaluates the resulting document, provides instruction, and decides what action to authorize or forward.

The document's primary reader is the **Storehouse Steward**. The apprentice answers to the **Senior Scribe**. The Steward would not ordinarily commission an apprentice directly; the Senior Scribe uses the Steward's case as real professional work through which to assess the apprentice.

The tutorial introduces the apprentice to the following professional practices:
- Reconcile opening stock, dispatch, physical receipt, issue, and closing condition.
- Preserve the distinction between usable and held stock.
- Distinguish an established fact from an inference or unresolved cause.
- Cite the records that support material claims.
- Recommend practical, proportionate action without exceeding the evidence.
- Respond to assessment and instruction, revising deficient work where appropriate.

The tutorial does not ask the apprentice to solve a crime, identify a culprit, design a reusable register, or prove a new recordkeeping system against artificial unseen transactions. The ordinary institutional problem need not be sensational; its significance comes from the people relying on the account and the decisions it supports.

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

### 7.5 Tutorial sequence and player actions

The tutorial has three practical phases. These are specific to this guided exercise and are not a universal template for Assignments or Works.

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

Instruction follows the assessment. The Senior Scribe explains the relevant professional standard and what should be corrected. Where the account or evidence is deficient, the apprentice may revise and resubmit. The tutorial must not permanently soft-lock after a mistake.

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

The tutorial must preserve separate outcomes for accounting accuracy, evidence discipline, and professional judgment. Do not collapse them into one opaque score or make an arithmetic error silently change the underlying stock state.

### 7.8 Tutorial sustenance and onboarding

The apprentice begins with **five units of provisions**. This is an initial personal resource balance, not a daily ration or a continuing tutorial stipend. The tutorial is expected to require approximately 7–8 AP across about two Workdays. The starting provisions balance, together with compensation from the paid starter Assignments, provide the intended onboarding runway and allow the player to learn the ordinary employment loop before shortage consequences can begin.

The tutorial provides no special provisions contract. Completing, pausing, or leaving it does not create or end a separate sustenance entitlement. After onboarding, provisions come from ordinary compensation, purchases, assistance, or other established recovery routes under Sections 12.2–12.4.

Other goods may appear as world or institutional commodities, inventory items, or part of hospitality and social exchange. The five-unit provisions starting balance is intended to let the player complete onboarding without relying on optional Assignment acceptance merely to avoid an immediate shortage.

### 7.9 Action-budget test and expected duration

The tutorial minimum evidence path costs 4 AP: 1 AP for the opening/dispatch/arrival comparison, 1 AP for intake/issue records, and 2 AP for the physical recount. Requesting E-06 costs 1 additional AP. Initial submission costs 2 AP, and the Senior Scribe's disposition costs 1 AP. A first-time player who examines the complete dossier, prepares a complete document, and receives a disposition should therefore expect to spend approximately 7–8 AP, with additional AP for revision.

This is a tuning target, not a deadline. The tutorial may span two or more in-game days depending on the optional custody record, mistakes, and revision. The AP cost of every substantive action must be visible before commitment. Reviewing already acquired evidence, the case brief, and prior assessment feedback is free.

### 7.10 Completion and progression boundary

The tutorial is complete when the Senior Scribe has issued a disposition: acceptance and authorization/forwarding, acceptance of the account while withholding the recommendation, or return for correction followed by a final disposition. A returned submission is not complete until it is corrected sufficiently for a final decision.

The tutorial awards **0 Historical Progress XP** and must not add an entry to completedWorks. It is not a Work and does not count toward the required Era I Work set or any historical progression threshold. It may award Career XP for demonstrated professional learning; any Career XP amount is balanced separately from Work rewards. The current engine reference value of 500 Career XP for an accepted disposition is provisional and must be revisited during reward tuning.

### 7.11 What this tutorial teaches

The tutorial teaches the player to:
- Understand who requested the document, who will use it, and why it matters.
- Examine a compact dossier and reconstruct a stock position.
- Distinguish dispatch, receipt, issue, condition, and balance.
- Preserve uncertainty rather than invent a cause or culprit.
- Make a practical recommendation with consequences for institutional action.
- Receive an assessment that separates accounting, evidence, and judgment.
- Learn from instruction and revise deficient work.

It does not test permanent register design, reusable register adoption, or unseen transaction validation. Those mechanics are not part of this tutorial. The tutorial validates basic onboarding interactions only. Future Works must be designed independently around their own historical undertakings, human and informational problems, mechanics, stages, and scale; they must not repeat this storehouse scenario with different commodities.

## 8. The Assignment Gameplay Loop

The following sequence describes possible parts of an Assignment, not a required pipeline. Each scenario selects and orders only the steps appropriate to its job; some steps may be combined, repeated, replaced, or omitted. Assignments must still provide meaningful player-controlled work rather than a single completion action. AP costs for the defined scope and its substantive stages are shown before commitment, including when work may span more than one day. Reviewing already acquired evidence and navigating the document interface do not create hidden costs. Challenges use the same principle, with costs based on their scope.

1. **Receive:** A person or institution presents a dispatch or request.
2. **Understand:** Read the situation and identify what must be established or recorded.
3. **Examine:** Review evidence, testimony, existing records, physical findings, and instructions.
4. **Interpret:** Determine what is known, what is missing, what conflicts, and which sources are reliable.
5. **Decide:** Make the required administrative, factual, or procedural judgment.
6. **Construct:** Complete the appropriate structured document.
7. **Review:** Check the assembled record for accuracy and completeness.
8. **Submit or certify:** Make the record official within the scenario's context.
9. **Resolve:** Receive an evaluation and experience the resulting consequences.

The player should never be shown a completed target document to copy. The dispatch provides the situation, instructions, and available leads—not the answer. Depending on the Assignment, playable actions may include observing or inspecting a place or object, consulting or questioning people, comparing or reconciling sources, and drafting or submitting an appropriate result. These are reusable interaction patterns, not mandatory stages. NPC disclosure must respect what each person plausibly knows, their interests and obligations, their authority, and what they are willing to share. The final result should create the appropriate record, knowledge, relationship, or institutional consequence for that job; it need not always be a formal report.

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

### 8.5 Interactive Assignment activity definitions

Substantive Assignments may use a typed, declarative activity definition registered in the Assignment Activity catalog. The definition identifies participants, interaction actions, prerequisites, discoveries, interpretation rules, a declarative report schema (finding options, cited discoveries, limitations, and recommendations, with optional responsibility claims), and the submission cost. A shared activity screen renders the declared interaction families; scenario content must not require a bespoke screen or a universal action sequence.

Interactive progress remains inside the existing `opportunities.assignments` container. The single-action `apCost` applies only to non-interactive Assignments and remains bounded to 1–6 AP. Interactive Assignments instead declare an `estimatedTotalAp` for the full scope; each individual action and the submission cost is independently bounded to 1–6 AP. The estimate is informational and may span multiple Workdays. The engine rejects `COMPLETE_ASSIGNMENT` for an interactive offer. All activity actions, draft changes, and submissions require an accepted offer owned by the current character.

Activity definitions require static validation before use: unique action and discovery IDs, valid PersonId / SkillId / AttributeId references, bounded AP costs, reachable acyclic prerequisites, and valid interpretation rules. Saved progress is validated against the registered definition. Existing schema-v2 saves are normalized with newly required baseline people, locations, and appointments before validation; existing Assignment offers without activity fields retain their prior single-action behavior.

Activity submission is one atomic transition. It charges the declared submission AP, resolves the actual completed actions and submitted report, and applies the authored compensation, Career XP, record, knowledge, directional relationship changes, and institutional matter transitions. It awards no Historical Progress XP. Record and KnowledgeEntry identifiers must be deterministic and traceable to the Assignment and resolution day.

### 8.6 Era I example: North-Bay Roof Inspection

The North-Bay Roof Inspection is an optional, multi-day Assignment presented from the Storehouse Reckoning record only when the player cited the roof-leak evidence and recommended verifying the repair. On an `authorized` tutorial disposition, the Senior Scribe's authorization is the delivery basis. On `account_accepted`, the account is accepted but the Senior Scribe separately directs verification through the relevant Appointment; an account accepted without the cited leak evidence and recommendation does not generate the Assignment and awaits a later institutional opportunity loop.

The physical truth is fixed: the mid-bay reed-mat and mud-plaster patch is intact; the north parapet runoff channel remains clogged with washed reeds and cracked plaster; the shaded north-east beam socket remains damp within its wall joint, without evidence of collapse; and seven held barley sacks remain segregated on dry reed matting. Their contents are not assessed by this Assignment. The roof inspection may recommend a separate Held-Barley Inspection, but P1 records that recommendation as an institutional active matter only. The follow-up Assignment and its own interactive activity are deferred to P2; no one-click docket or second full scenario is included in P1.

Ur-Nanna controls ordinary bay access and knows the custody and repair arrangements, but cannot authorize major building expenditure alone. Dudu knows the scope and materials of his contracted mid-bay patch, but has no stock authority. Utu-mansum can attest only to the original intake inspection (56 usable / 4 held), not the storm or later roof condition. Shuruppak-ilu reviews the filed report and determines institutional follow-up from the record; he does not gain firsthand roof knowledge by reviewing it. The player may submit a qualified incomplete report. Unsupported certification or attribution of work outside Dudu's contract is a consequential overclaim, not merely a lower score.


### 8.7 Post-execution inspection and institutional verification

The post-execution North-Bay Inspection is a separate optional Assignment generated only after a maintenance execution has been recorded. It does not replace or reuse the earlier North-Bay Roof Inspection in 8.6: that Assignment investigates the initial condition and informs authorization; this Assignment gathers independent evidence after the worker's execution.

The player must perform a physical inspection, review the execution record, and cite both sources before submitting. The resulting RecordEntry distinguishes the player's direct observation from the worker's reported result and preserves the limits of the inspection. For the current vertical slice, the post-execution observation is that the runoff channel is clear, the shaded north-east beam socket remains damp, and no collapse is visible. It does not establish that the joint has dried or certify the entire roof. Later remediation executions must be inspected anew; reports record the current observed condition rather than carrying forward earlier findings. An observed obstruction that conflicts with the execution record, or unsupported attribution of responsibility to the worker, remains disputed evidence.

This Assignment gathers evidence only. It grants no Appointment, verification authority, power to authorize additional expenditure, or power to resolve the matter. The submitted record is delivered to the Storehouse institution, Ur-Nanna, and Shuruppak-ilu. Verification requires an active Appointment at the owning institution with `verify_institutional_execution`; the execution worker may never verify their own work. Resolution is a separate action requiring `resolve_institutional_matters` and a specific accepted verification. Rejected or inconclusive verification leaves the matter unresolved.

An accepted player Assignment owns only the execution event for which it was offered. END_DAY must not complete that commitment, invent observations, or substitute NPC verification while it remains accepted. Declined, unaccepted, expired, or released offers do not freeze the lifecycle; NPC fallback is permitted only when independent post-execution evidence, explicit knowledge, and an eligible Appointment already exist. A later remediation execution is evaluated independently from earlier verification decisions. An inspection offer is bound to its specific execution; if a later execution supersedes an accepted offer, the old offer cannot be submitted against the new work and must be released before the player uses the latest execution’s offer.



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
