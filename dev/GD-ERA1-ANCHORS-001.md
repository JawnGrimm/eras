# GD-ERA1-ANCHORS-001 — Era I Assignment Anchor Scripts (Draft)

**Status:** PROPOSED — DESIGN DRAFT  
**Owners:** Game Design; Historical Research review  
**Authority:** Approved seed portfolio in `dev/GD-OPPORTUNITY-001.md` §§3.2a–3.2b; Issue #80 (CLOSED)  
**Purpose:** Deliver the five approved Era I anchor scenarios as authored, playable content for Production integration.  
**Boundary:** This document defines scenario behavior and authored content, not TypeScript types, serialization, save schemas, module placement, or transition APIs. Production owns those technical contracts.  
**Historical setting:** Late Uruk / Uruk IV c. 3200 BCE, with chronology/provenience qualifications retained where the source corpus requires them.

## 1. Authoring rules applying to all five scripts

- These are **Assignments**, ordinary optional professional work. They are not Challenges or Works and award no Historical Progress XP.
- All five belong to one shared world pool. Their institutional context and access route determine eligibility; orientation is not a class lock and grants no skill, appointment, authority, or relationship.
- The player is an apprentice/junior scribe. The playable contribution is observation, comparison, calculation, organization, and reporting. A responsible person retains authority to release goods, accuse a person, change an institutional record, order a recount/remeasurement, or decide a disputed matter.
- Preserve the distinction between **Event, Record, and Knowledge**. Evidence shown to the player must remain objective and stable. Character-situated interpretation may affect recognition, confidence, and judgment, but must not hide or falsify evidence.
- Every discrepancy must be grounded in identified evidence or explicitly marked **PROVISIONAL** authored reconstruction. A mismatch is not proof of theft, fraud, negligence, or intent.
- **Vary outcome shape and human pressure.** Do not make all five Assignments a mismatch followed by cautious escalation. Instances may reconcile cleanly, reveal a simple copying/arithmetic error, expose a genuine but unresolved discrepancy, or show that the evidence is insufficient. Give the people involved understandable stakes and time pressure, without making their preferred answer automatically correct. The apprentice's professional judgment should have a human cost or benefit, not merely select the obvious safe option.
- **Compensation may be provisions-in-kind.** At least some shared-pool instances should explicitly offer Provisions under a stated contract/service condition. This is an authored gameplay arrangement, not evidence that every institution paid rations or that a source tablet documents the player's compensation. Disclose quantity, timing, and condition in the offer; never imply free daily rations.
- Do not imply a modern bureaucracy, private merchant house, coinage, standardized military administration, universal ration, or a modern state/church division.
- No scenario may silently invent a named historical individual, precise office, fixed institutional procedure, or source provenance not established by its cited research. Use authored fictional participants only where the content model supports them, and do not present them as attested historical persons.
- Reward amounts, AP costs, recurrence identity, and technical trigger fields are intentionally not specified here. Use approved global rules and versioned Era I parameter data; Production must not infer permanent balance values from this draft.
- A scenario becomes eligible only through its authored access route and a real source matter/record/event. Repeated presentation must not duplicate, reopen, or rename the same occurrence.

## 2. Shared authoring contract

Each script supplies:
1. **Human situation:** what practical problem needs attention and why it matters.
2. **Institutional context:** the people, goods, records, and responsibility actually involved; acknowledge overlap where relevant.
3. **Access and player role:** why this apprentice receives the task and what they are permitted to do.
4. **Evidence packet:** the records/objects presented, their provenance and confidence, and what they do *not* establish.
5. **Playable work:** concrete examination and comparison steps; choices should express judgment, not guess a hidden password.
6. **Deliverable:** what the apprentice submits or reports.
7. **Evaluation:** what constitutes careful, incomplete, or careless work, without treating unsupported assumptions as facts.
8. **Outcome and consequence:** what the responsible person can do with the report; distinguish immediate outcome from unresolved institutional matter.
9. **Recovery:** a credible path after an error or incomplete submission, without erasing consequences.
10. **Recurrence boundary:** what would make a genuinely new occurrence, and what must not be repeated.

Production schema mapping is pending. The headings below are semantic authoring fields, not a proposed data interface.

---

## 3. Commercial — Receiving-Tag and Handover Comparison

**Anchor ID:** ERA1-COM-01  
**Core situation:** Utu-mansum needs a source-bounded comparison before the receiving work moves on. A physical clay tag is available; a documentary copy describes a tag of that form; Enlil-kisu gives the carrier's account that the tag remained with the goods through handover. The player's task is to compare what can be examined and preserve what remains reported or unknown. The assignment does not establish the contents, complete custody, or final disposition of a delivery.

### Historical grounding and confidence
- **ATTESTED:** Perforated clay tags are documented in Uruk IV–III contexts. Published Uruk examples include small tags bearing signs; one Uruk IV example is catalogued as containing an administrator's name. Tags could be attached to goods. The exact function and interpretation of individual examples remain object- and context-specific.
- **INFERRED:** A tag, a receiving-entry copy, and a carrier's reported account can form a plausible teaching situation for distinguishing physical examination, documentary copying, and testimony.
- **FICTIONAL RECONSTRUCTION:** The specific tag, receiving-entry copy, handover statement, and participants' interaction are authored for play. They are not a transcription of a named excavated object or a claim about a documented Uruk transaction.
- **Not established:** The sources do not establish this exact receiving workflow, a standardized consignment form, a universal carrier contract, the exact custody chain, or the apprentice's authority to accept/release goods. “Receiving tag” is a player-facing description for this fictional case, not a translation of an attested Uruk administrative category.

### Situation and participants
Utu-mansum asks for the tag and receiving-entry copy to be compared before the receiving work proceeds. Enlil-kisu says the tag remained with the consignment until it reached the receiving court. His account is presented as reported information; the player did not witness the handover. Neither urgency nor the carrier's account changes what the physical object and copy establish.

### Player access and authority
The player directly examines the physical tag, examines a documentary copy of the receiving entry, and may ask Enlil-kisu for his handover account. The original receiving entry is not available. The player compares only the visible features and description present in those sources. No sign is transcribed or interpreted, and no commodity, quantity, or transaction is inferred. The player does not independently verify the handover, accept or release goods, amend an authoritative record, or assign responsibility.

### Evidence packet
1. **PHYSICAL:** a small baked-clay tag pierced lengthwise and bearing signs, directly available for examination. No sign reading is supplied.
2. **COPIED:** a documentary copy describing an accompanying pierced clay tag bearing signs. The original receiving entry is not available for direct examination.
3. **REPORTED:** Enlil-kisu's statement that the tag remained with the consignment through handover. The player did not witness this.
4. **RECONSTRUCTED context:** a separate historical note explains that the authored tag and transaction are a fictional teaching reconstruction. It is not another ancient evidence item.

No authored commodity quantities, counts, dates, measurements, numeral-system assumptions, or invented sign readings enter this instructional evidence packet.

### Playable work and choices
1. Examine the physical tag and see its PHYSICAL provenance disclosure.
2. Examine the receiving-entry copy and see its COPIED disclosure.
3. Review the handover account and see its REPORTED disclosure.
4. Compare the physical tag's visible form with the description in the copy.
5. Record a bounded finding, cite the sources, and state what cannot be verified.
6. Submit the report for Utu-mansum's supervisory assessment.

A correct, materially complete comparison is **Thorough** even though it does not claim that the handover was witnessed or the delivery settled. A correct bounded comparison that omits the non-material secondary handover detail is **Defensible**. A missing comparison or material limitation is **Incomplete**. Treating the report as proof of complete delivery or assigning blame is **Overreached**.

### Deliverable and evaluation
**Deliverable:** A comparison report that links the physical tag and copied receiving entry, distinguishes the carrier's report, and preserves the unavailable original and unwitnessed handover as limitations.

Utu-mansum assesses whether the report is useful and properly bounded. He may retain the sources and initiate/request a further check within his authority. His positive response does not certify the underlying event, authorize acceptance/release, settle the delivery, or assign blame. Completing the player's Assignment completes only the player's current task.

### Recurrence boundary
A later occurrence requires a materially new matter and its own source evidence. Do not create apparent novelty by changing a tag description, inventing sign readings or quantities, or repeating this tutorial sequence as a generic template. Other commercial Assignments may use quantity records where historically supported and explicitly authored; this COM-01 instructional packet does not.


---

## 4. Commercial — Brewing-Ingredient Account Reconciliation

**Anchor ID:** ERA1-COM-02  
**Core situation:** A recorder asks the apprentice to check an account involving grain products/groats and malt. The account may reconcile, contain a simple copying/subtotal error, or remain uncertain because a reading is unclear. A brewer is concerned that an apparent shortfall will reduce the quantity credited to his work; a supervisor wants the account closed promptly. Neither concern establishes what the numbers mean.

### Historical grounding and confidence
- **ATTESTED:** MSVO 3, 51/52/55 include records involving grain products/groats and malt, totals/subtotals, and distinct numerical notations. Some readings and destinations remain uncertain.
- **INFERRED:** A junior scribe comparing entries and account totals is a bounded administrative task.
- **PROVISIONAL:** The specific mismatch and the apprentice's review procedure are authored reconstruction.
- **Excluded:** Do not create a two-supplier delivery dispute, assert a fixed grain-to-beer ratio, or resolve uncertain readings/destinations as settled fact.

### Situation and participants
A responsible recorder needs a second check of an account containing relevant grain-product and malt entries. The active instance identifies the records and the person requesting the check. The brewer may press for the entries to be accepted as written; the recorder may prefer a quick correction. Do not imply that all listed goods were delivered together or used in one standardized recipe.

### Player access and authority
The apprentice may recalculate the entries using the notation represented in each source, compare subtotal/total relationships, and report the inconsistency. They do not decide the final destination or use of the goods, alter an authoritative account, or accuse a supplier/worker.

### Evidence packet
- A source account with its grain-product/groat entries.
- A source account with malt entries where the instance calls for it.
- The relevant subtotals/totals and any explicitly linked carry-forward.
- A provenance/reading note for uncertain signs or destinations.

Keep distinct numerical systems and commodity categories intact. The script must not imply that a shared unit or conversion exists where the sources do not establish one.

### Playable work and choices
1. Read each entry in its own commodity and numerical notation.
2. Recalculate only the sums supported by the displayed entries.
3. Compare the recalculated amount with the written subtotal/total.
4. Decide whether the account reconciles, contains a copying/subtotal error, or cannot be resolved from the displayed evidence.
5. Submit the arithmetic and identify the exact entry or reading that supports the conclusion.

Judgment choices:
- Confirm a clean account, even if that disappoints someone expecting an adjustment.
- Identify a simple scribe's copying error and show the corrected subtotal without assigning motive.
- Flag an uncertain reading and recommend checking the source before changing the account.
- Alter the account to protect the brewer's allocation or satisfy the supervisor's deadline without evidentiary support.

### Deliverable and evaluation
**Deliverable:** An account-check note showing the source entries, arithmetic, written total, and any uncertainty.

Careful work is reproducible whether the result is a clean reconciliation, a demonstrable copying error, or an unresolved reading. The brewer's concern should make the stakes legible: a mistaken reduction may affect his credited allocation, while an unsupported adjustment may compromise the account. Partial work omits an intermediate step or provenance. Careless work uses an unsupported ratio, conflates categories, or changes figures to satisfy pressure.

### Outcomes and recovery
A responsible recorder may accept a clean account, correct a copying error, consult the source tablet, or request a second check. The apprentice's report does not itself authorize a correction. If the brewer's allocation is affected, the recorder explains what the account does and does not establish; do not assume the brewer is dishonest or that the disputed quantity is owed. If the apprentice's arithmetic is wrong, a supervisor can return the calculation for a second pass; preserve the original evidence and make the correction traceable.

### Recurrence boundary
A new occurrence requires a distinct account/matter with compatible grain-product or malt entries and a real total/subtotal relationship. Do not generate arbitrary discrepancies, cross-combine unrelated tablets, or turn uncertain commodity readings into deterministic facts.

---

## 5. Civic — Field Measurement and Area Reconciliation

**Anchor ID:** ERA1-CIV-01  
**Core situation:** A recorder asks for a practical check of a parcel account before its figures are copied into a working summary. The account may balance cleanly, omit a parcel subtotal, or contain a straightforward dimension-to-area discrepancy. The task is readable arithmetic, not a specialist surveying examination; any official decision about land, boundary, yield, or allocation remains outside the task.

### Historical grounding and confidence
- **ATTESTED:** MSVO 1, 2 and MSVO 1, 3 preserve field measurement/area records. Their catalogued chronology/provenience is uncertain; they are catalogued Uruk III and often attributed to Jemdet Nasr.
- **INFERRED:** Rechecking recorded dimensions and area arithmetic is a defensible administrative exercise.
- **PROVISIONAL:** The specific mismatch and the apprentice's review request are reconstructed.
- **Excluded from this anchor:** Yield-share, boundary, ownership, or allocation disputes.

### Situation and participants
A responsible recorder asks for a second arithmetic check of a field measurement record. The actual record identity and provenance qualification must be shown in the content instance. Do not silently relabel the tablets as securely excavated Late Uruk documents or place them at a precise site without evidence.

### Player access and authority
The apprentice may check parcel subtotals, identify an omitted line, or compare clearly presented dimensions and area using a simple, explicit relationship supplied in the playable instance. Present values in human-readable standard measures, as in the Storehouse Reckoning teaching approach; do not make the player decode GAN2 fractions or derive specialist metrology. Any simplified display must be labelled as a readable gameplay transcription, not a claim that the ancient tablet used modern notation. The apprentice cannot survey the land, establish a boundary, determine ownership, allocate yield, or order a remeasurement.

### Evidence packet
- The measurement record or a clearly identified teaching copy.
- A readable working summary with parcel dimensions, line items, and subtotals; any simplified standard-measure display must be identified as a gameplay transcription.
- The recorded area and the simple arithmetic relationship needed for the check.
- A provenance note retaining the uncertain chronology/provenience.

Keep the task to accessible operations such as adding parcel subtotals, spotting an omitted parcel line, or identifying a clear dimension-to-area discrepancy in the supplied readable units. Do not require the player to reconstruct an esoteric metrological system. A playable numerical example must be labelled **PROVISIONAL** unless its exact values are directly verified in the source publication; this verification is not a gate for Production to build the fixture-driven interaction.

### Playable work and choices
1. Read the parcel lines and the displayed standard-measure values.
2. Add the supplied parcel subtotals or compare the simple dimension/area figures.
3. Identify whether the account balances, omits a line, or contains a clear arithmetic discrepancy.
4. State the calculation in a short, checkable note.

Judgment choices:
- Confirm that the figures reconcile and return a clean check.
- Identify an omitted parcel subtotal or simple copying error.
- Ask for clarification where the source transcription itself is unclear.
- Claim the arithmetic establishes a boundary, ownership, or yield entitlement.

### Deliverable and evaluation
**Deliverable:** A measurement-check note showing source values, method, recalculation, and uncertainty.

Careful work is transparent and accessible: it may confirm a clean account or isolate a simple omission/error. Partial work spots the issue but leaves one addition or source check unfinished. Careless work turns arithmetic into an unsupported land claim or invents a conversion. The difficulty should come from attention and judgment, not obscure notation.

### Outcomes and recovery
A responsible official may request the source reading be checked, ask for a new measurement by an appropriately situated person, or correct an arithmetic record. Those actions are not automatic and do not establish that the land itself is wrongly measured. An incomplete report can be returned for a documented second calculation.

### Recurrence boundary
A new occurrence requires a distinct field-measurement record and a supported arithmetic check. Preserve the source's chronology/provenience caveat in every occurrence. Do not instantiate yield-share, boundary, or allocation disputes from this seed.

---

## 6. Civic — Labor-Group Records and Grain Disbursement

**Anchor ID:** ERA1-CIV-02  
**Core situation:** A reviewer needs a labor-group account checked before a work group is released from its current obligation. The group leader wants the figures settled so people can leave; a supervisor is concerned that the day's recorded total is incomplete. A separate grain-disbursement record is included for a distinct administrative question. The records must not be collapsed into a claim that the grain was issued to this labor group.

### Historical grounding and confidence
- **ATTESTED:** W 9827 records laborer group accounts/totals. Separately, W 15897,c8 records grain disbursed to/consumed as rations by high-ranking officials.
- **INFERRED:** Each record supports a bounded administrative comparison of its own contents.
- **PROVISIONAL:** Pairing these two evidence types in one accountability review is a game reconstruction.
- **Not established:** The records do not establish the same people, institution, workflow, date, or a standardized work-gang ration system. Do not present the grain disbursement as the ration issue for the laborers in W 9827.

### Situation and participants
A responsible administrator asks the apprentice to check a labor-group total and separately summarize a grain-disbursement record that has been brought into the same review. The group leader's urgency is understandable, but does not link the records. The narrative must state plainly that the records are separate and that their relationship is not established. Do not invent a missing ration ledger linking them.

### Player access and authority
The apprentice may verify the group-account arithmetic, identify the separate disbursement's recorded recipient/category as the source permits, and report whether the records do or do not establish a link. They cannot claim the grain was owed to the labor group, accuse an official of withholding rations, or authorize redistribution.

### Evidence packet
- W 9827 or an explicitly identified source-based transcription/teaching copy of the labor-group account and total.
- W 15897,c8 or an explicitly identified source-based transcription/teaching copy of the grain disbursement.
- Separate provenance notes for each record.
- A review instruction that asks for bounded comparison, not a presupposed reconciliation.

Do not alter source identities or merge their dates/provenance. Any playable values must be verified against the publications before final content approval.

### Playable work and choices
1. Check whether the labor-group total reconciles internally; it may be correct or contain a simple arithmetic/copying error.
2. Summarize what the separate disbursement record actually states.
3. State whether the records establish any connection (the approved baseline does not).
4. Submit a two-part note preserving each record's identity.

Judgment choices:
- Confirm the labor-group total and report the separate disbursement accurately.
- Identify and document a simple error in the labor-group account.
- Ask for another record before claiming the disbursement concerns this group.
- Tell the group leader the grain was theirs, or accuse an official of diversion, without a linking source.

### Deliverable and evaluation
**Deliverable:** A two-part accountability note: (A) labor-group arithmetic and (B) separate disbursement summary, followed by a statement of what cannot be concluded.

Careful work can confirm that the group total is correct; it need not manufacture a discrepancy. It also makes the evidentiary boundary explicit when the group leader presses for a quick answer. Partial work checks one record but fails to summarize the other or omits the limitation. Careless work invents a link, beneficiary, obligation, or accusation.

**Compensation option — PROVISIONAL authored contract:** This Assignment may offer a stated quantity of Provisions-in-kind for completing the account check, with the terms disclosed before acceptance. This is the apprentice's compensation under this specific playable contract; it is not a claim that W 15897,c8 records provisions for the W 9827 labor group, nor that the two source records concern the same people or institution. Production should use the approved versioned Era I compensation parameters and may fixture the quantity pending balance approval.

### Outcomes and recovery
A responsible reviewer may accept the arithmetic check, request clarification of the disbursement record, or seek other records. No outcome may imply that the grain was due to the labor group unless a separate, explicitly sourced future content instance establishes that link. If the apprentice conflates the records, the supervisor can require a corrected note that separates fact from inference.

### Recurrence boundary
A recurrence may use a new labor-group record or a separate disbursement record only when the active matter supplies it. The pairing remains explicitly **PROVISIONAL** unless new research establishes a connection. Do not turn this into a routine work-gang ration audit or generic laborer provisioning system.

---

## 7. Religious — Inana Offering Records and Sanctuary Supply

**Anchor ID:** ERA1-REL-01  
**Core situation:** A person responsible for an Inana-related offering asks for a review of the relevant entries before deciding whether the recorded goods are accounted for. The records may be complete, contain a simple copying omission, or leave a genuine uncertainty. A participant is concerned that a late correction will complicate preparations; another wants the record closed as written. The scenario does not presume a single kitchen, office, schedule, or standardized supply chain.

### Historical grounding and confidence
- **ATTESTED:** Archaic Uruk offering records are associated with Inana. The broader archaic commodity corpus includes dairy products and fish categories.
- **INFERRED:** A bounded review of offering entries and associated goods within overlapping cultic/economic administration is plausible.
- **PROVISIONAL:** Combining particular goods in one supply review, a shortage, a ritual interruption, a schedule, and the junior-scribe response are reconstructions.
- **Not established:** The sources do not show that all cited goods belonged to one kitchen, one office, or one delivery schedule, nor do they establish a specific shortage or interrupted rite.

### Situation and participants
A responsible cultic/institutional participant requests a check of identified offering entries or associated goods. The active instance must identify exactly which record(s) and commodity categories are involved. Do not create a separate modern church administration or imply that religious and economic administration are institutionally isolated.

### Player access and authority
The apprentice may compare the relevant entries, preserve distinct commodity categories and notations, identify what is recorded versus absent, and report the discrepancy. The responsible authority decides whether to verify, correct, substitute, or proceed. The apprentice does not determine ritual validity, invent a replacement offering, or declare that a rite must be interrupted.

### Evidence packet
- The specific Inana-associated offering record or source-based transcription.
- Any additional commodity record included in the instance, separately identified with its own source and confidence.
- The instruction explaining the limited question being checked.
- Provenance notes identifying the difference between directly attested offering evidence and broader commodity-corpus evidence.

Dairy categories (including DUGb and cheese) and fish categories (KU6 / SUḪUR) must remain distinct where used. Do not force them into one common unit or imply they appear together in a single attested record.

### Playable work and choices
1. Identify which entries are directly associated with the offering record.
2. Identify any additional goods record as a separate source.
3. Compare only like categories and compatible notations.
4. Determine whether the supplied entries reconcile, contain a simple copying omission, or leave the question unresolved.
5. Submit the evidence with a clear distinction between attested record content and inferred institutional context.

Judgment choices:
- Confirm that the offering entries reconcile and report the clean check.
- Identify a specific copying omission in the supplied record and show its source.
- Request another source where the evidence cannot establish whether goods are missing.
- Declare a shortage, ritual interruption, or substitute offering beyond the evidence and apprentice's authority.

### Deliverable and evaluation
**Deliverable:** An offering/supply review note identifying each source, category, notation, comparison, and unresolved question.

Careful work may confirm a clean account or identify a bounded record error while preserving source distinctions and leaving ritual/institutional decisions to the responsible person. Human pressure should come from the consequences of delay or premature closure, not a melodramatic threat. Partial work identifies a possible issue but omits a source or confidence qualification. Careless work invents a common schedule, kitchen, unit, shortage, or ritual consequence.

### Outcomes and recovery
The responsible authority may request a further record check, correct an entry, or decide to proceed. A specific shortage or ritual interruption may occur only in an authored instance whose evidence and reconstruction are explicitly reviewed and marked **PROVISIONAL**. If the apprentice overstates the record, the report can be returned for correction; do not impose an automatic spiritual or social penalty.

### Recurrence boundary
A new occurrence requires a distinct Inana-related offering matter and its own identified records. Additional dairy or fish evidence may be included only when the active matter supports the specific category and source relationship. Do not reuse the same record under a new shortage label or imply a universal sanctuary supply schedule.

---

## 8. Cross-script review checklist

Before a script is marked ready for Production integration:

- [ ] Historical Research confirms every **ATTESTED** statement and the exact source/provenance.
- [ ] Every **INFERRED** relationship is identified as interpretation, not direct evidence.
- [ ] Every **PROVISIONAL** incident/procedure is explicit and bounded.
- [ ] No unsupported institution, office, role, commodity combination, unit conversion, chronology, or named historical person has entered the script.
- [ ] The apprentice's actions and authority limits are explicit.
- [ ] Evidence is presented objectively; interpretation does not conceal evidence.
- [ ] Player choices express defensible professional judgment and have legible consequences.
- [ ] Across the portfolio, outcomes include clean reconciliation, simple record error, genuine discrepancy, and insufficient evidence; no single response pattern is optimal in every scenario.
- [ ] At least one shared-pool Assignment explicitly offers Provisions-in-kind under disclosed, bounded contract terms.
- [ ] Deliverables are concrete and reviewable.
- [ ] Outcomes preserve responsible authority and do not assume guilt.
- [ ] Recovery permits correction without erasing the original action or record.
- [ ] Recurrence requires a materially new, provenance-backed matter.
- [ ] No script creates a Martial-exclusive queue or changes the approved zero-exclusive-Martial-anchor ruling.
- [ ] No numerical reward/AP/cooldown/weight is silently approved here.
- [ ] Production's schema/validator can represent the semantic contract without hard-coding Era I assumptions into shared engine logic.

## 9. Research references carried forward

The scripts rely on the approved Issue #80 research baseline. Key references:

- Nissen (2016), *Archéo-Nil* 26, pp. 33–48. https://www.persee.fr/doc/arnil_1161-0492_2016_num_26_1_1102
- Kelley, Cartolano, Ferrara (2025), *Antiquity* 99 (403), pp. 64–82. https://doi.org/10.15184/aqy.2024.165
- Monaco (2005), “Unusual Accounting Practices in Archaic Mesopotamian Tablets,” *CDLJ* 2005:1. https://cdli.earth/articles/cdlj/2005-1
- CDLI P005362, MSVO 3, 51. https://cdli.earth/artifacts/5362/reader/93877
- CDLI P005069/P005070; Monaco (2011), “Archaic Field Measurements Texts,” *Rivista degli Studi Orientali* 84, pp. 11–16.
- Englund (2009), “The Smell of the Cage,” *CDLJ* 2009:4, §3.6.1/Fig. 3. https://cdli.earth/articles/cdlj/2009-4
- Englund and Nissen (2005), W 15897,c8, *Visible Language*, OIMP 32, p. 66, pl. 81. https://isac-assets.s3.amazonaws.com/isac-publications/oimp32.pdf
- Szarzyńska (1993), “Offerings for the Goddess Inana in Archaic Uruk,” *RAO* 87, pp. 7–28. https://cdli.earth/publications/1669966
- Englund (1991), “Archaic Dairy Metrology,” *Iraq*. https://doi.org/10.2307/4200340
- Englund (1998), “Texts from the Late Uruk Period,” OBO 160/1, pp. 13–233.

**Review status:** This is an authored content draft, not an implementation-ready schema payload. A rapid Historical Research red-flag comparison against the closed and approved Issue #80 baseline found **no material contradiction** in the five seed identities, confidence boundaries, Martial exclusion, or commodity/provenance guardrails. That is a bounded sanity check, not a reopened research cycle or fresh source audit. Numerical examples remain provisional fixture content; Production need not wait for Assyriological number verification to build the interactions. Game Director approval of this revision is still required before the scripts are marked READY FOR IMPLEMENTATION.


## 10. Game Director voice and presentation mandate — 24 November 2026

This is an approved authoring direction for turning these semantic blueprints into playable Era I Assignment scripts and for upcoming Challenges and player-facing UI copy. It governs presentation, not historical claims or simulation outcomes.

**Keep the evidence sober; let the people be human.** Tablets, labels, quantities, provenance notes, and evidence packets remain objective, internally consistent, and appropriately qualified. Carriers, brewers, stewards, colleagues, and senior scribes may be impatient, defensive, petty, wry, exhausted, territorial, self-important, absurdly particular, quietly generous, or kind under pressure. Their motives and reactions should arise from their circumstances and stakes, not from modern caricature.

**Write lived situations, not compliance prompts.** Replace rulebook-style player-facing disclaimers with concrete human friction: who needs the account closed, whose allocation may be affected, who is tired of being blamed, who insists that the reed awning is absolutely not their responsibility, or who quietly helps an apprentice avoid a public embarrassment. Preserve the same exact authority limits and evidentiary boundaries in the actual actions, records, and outcomes; do not make the player read those boundaries as sterile warnings at every choice.

**Ground humor and warmth in the setting.** Use small bureaucratic comedy, pettiness, ordinary generosity, strained patience, rivalries, pride in one's work, and everyday absurdity. Avoid modern idiom, contemporary institutional assumptions, sitcom caricature, and jokes that undermine the seriousness of material consequences. Historical people should feel like people, not props for anachronistic jokes.

**Authoring review:**
- [ ] Evidence text remains factual and does not inherit an NPC's bias or interpretation.
- [ ] Character dialogue and reactions reveal plausible motives, relationships, fatigue, pride, or pressure.
- [ ] Player prompts describe a recognizable situation and meaningful stakes rather than reciting policy constraints.
- [ ] Authority and evidentiary limits remain enforced by the actual available actions and outcomes.
- [ ] Humor and warmth are specific to the people and situation, not generic quips.
- [ ] No historical uncertainty has been converted into confident exposition merely to improve the scene.

This mandate does not authorize new institutions, offices, procedures, commodities, or historical claims. Apply it as Game Design develops the five anchors into playable scripts and cleans up existing starter prose. Production's Issue #82 → Issue #85 sequence is unchanged.
