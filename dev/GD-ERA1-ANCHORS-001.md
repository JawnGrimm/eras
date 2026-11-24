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

## 3. Commercial — Sealed Vessel and Textile Consignment

**Anchor ID:** ERA1-COM-01  
**Core situation:** A consignment is being received or checked within an institutionally mediated movement of goods. The receiving evidence does not align cleanly with the tag/seal or quantity record. The institution needs a careful discrepancy report before a responsible person decides how to proceed.

### Historical grounding and confidence
- **ATTESTED:** Uruk IV administrative records include commodity quantities, warehouse entries/exits, tags, and sealing. Archaeological and textual evidence supports movement of textiles and vessels within and between cities.
- **INFERRED:** An institutionally mediated receipt/custody review is a defensible playable setting.
- **PROVISIONAL:** A broken-seal or tag/quantity discrepancy is the authored incident; the exact junior-scribe procedure and escalation path are game reconstruction.
- **Not established:** The sources do not authorize a universal consignment form, a private merchant house, a standardized carrier contract, or the apprentice's authority to release or detain goods.

### Situation and participants
Goods arrive or are presented for receipt. A receiving worker or responsible recorder asks that the tablet/tag information be checked against the physical or reported consignment. The named counterparty and location must come from the active matter/content instance; do not invent a permanent trade network or assume a long-distance origin.

### Player access and authority
The apprentice is assigned the comparison because they can read/compare the relevant entries under supervision. They may inspect the presented tag/seal evidence, compare recorded quantities and entries, identify what agrees or conflicts, and report uncertainty. They may not accuse the carrier, decide ownership, authorize release, or alter the authoritative record.

### Evidence packet
- The relevant tag or tag transcription, with source identity.
- The associated seal/custody observation, if the authored occurrence has one.
- The quantity/commodity record.
- The receiving or warehouse entry used for comparison.
- A short provenance note identifying which evidence is physical, copied, reported, or reconstructed.

Do not guarantee that every instance contains all four evidence types. Missing evidence is meaningful only when the authored matter explicitly identifies the expected source.

### Playable work and choices
1. Identify the commodity and quantity notation actually used; do not convert unlike systems.
2. Compare tag identity and recorded quantity with the receiving entry.
3. Compare seal/custody evidence only to the extent the instance supplies it.
4. Classify the result as consistent, inconsistent, or insufficient evidence.
5. Submit a concise discrepancy report identifying the exact conflict and what remains unknown.

Judgment choices:
- Report only the confirmed mismatch and request responsible review.
- Report a possible mismatch but mark the evidence gap.
- Treat the discrepancy as proof of carrier wrongdoing or ownership (careless/unsupported).
- Ignore the mismatch and certify consistency (careless if the conflict is visible).

### Deliverable and evaluation
**Deliverable:** A comparison report linking each relevant source and stating the agreement, mismatch, or missing evidence.

Careful work identifies the exact comparison and preserves uncertainty. Partial work finds the mismatch but omits provenance or leaves a source unexamined. Careless work invents a quantity, treats a broken seal as proof of theft, or makes an accusation beyond the apprentice's authority.

### Outcomes and recovery
A responsible recorder or custodian reviews the report and decides whether to verify the goods, seek another record, request a recount, or proceed. The player's report may prevent an unsupported certification; it does not itself decide release or liability. If the apprentice overstates the evidence, a supervisor may require a corrected report or additional review. Do not force a punishment or presume guilt.

### Recurrence boundary
A new occurrence requires a materially new consignment/custody matter with its own source evidence, counterparty, commodity-compatible quantity notation, and receiving context. Varying only a name or number is not new content. Do not combine unrelated tags, seals, commodities, or institutions.

---

## 4. Commercial — Brewing-Ingredient Account Reconciliation

**Anchor ID:** ERA1-COM-02  
**Core situation:** A recorder asks the apprentice to check an account involving grain products/groats and malt. A subtotal or carried total appears inconsistent with the underlying entries. The issue is an account discrepancy, not a dispute between invented suppliers.

### Historical grounding and confidence
- **ATTESTED:** MSVO 3, 51/52/55 include records involving grain products/groats and malt, totals/subtotals, and distinct numerical notations. Some readings and destinations remain uncertain.
- **INFERRED:** A junior scribe comparing entries and account totals is a bounded administrative task.
- **PROVISIONAL:** The specific mismatch and the apprentice's review procedure are authored reconstruction.
- **Excluded:** Do not create a two-supplier delivery dispute, assert a fixed grain-to-beer ratio, or resolve uncertain readings/destinations as settled fact.

### Situation and participants
A responsible recorder needs a second check of an account containing relevant grain-product and malt entries. The active instance identifies the records and the person requesting the check. Do not imply that all listed goods were delivered together or used in one standardized recipe.

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
4. Identify the first point at which the account ceases to reconcile.
5. Submit the arithmetic and a short statement of the unresolved point.

Judgment choices:
- Report the arithmetic mismatch and cite the entries used.
- Report a mismatch while explicitly flagging an uncertain reading.
- Force a conversion between incompatible notations or commodities.
- Invent a missing entry or declare a person responsible without evidence.

### Deliverable and evaluation
**Deliverable:** An account-check note showing the source entries, arithmetic, written total, and any uncertainty.

Careful work is reproducible and keeps categories separate. Partial work identifies a mismatch but omits an intermediate step or provenance. Careless work uses an unsupported ratio, conflates categories, or supplies missing data from guesswork.

### Outcomes and recovery
A responsible recorder may request a recount/recalculation, consult the source tablet, or prepare a corrected account. The apprentice's report does not itself authorize a correction. If the apprentice's arithmetic is wrong, a supervisor can return the calculation for a second pass; preserve the original evidence and make the correction traceable.

### Recurrence boundary
A new occurrence requires a distinct account/matter with compatible grain-product or malt entries and a real total/subtotal relationship. Do not generate arbitrary discrepancies, cross-combine unrelated tablets, or turn uncertain commodity readings into deterministic facts.

---

## 5. Civic — Field Measurement and Area Reconciliation

**Anchor ID:** ERA1-CIV-01  
**Core situation:** A measurement record is being checked because the dimensions and recorded area do not reconcile under the notation shown. The apprentice verifies the arithmetic and reports the result; any official decision about land, boundary, yield, or allocation remains outside the task.

### Historical grounding and confidence
- **ATTESTED:** MSVO 1, 2 and MSVO 1, 3 preserve field measurement/area records. Their catalogued chronology/provenience is uncertain; they are catalogued Uruk III and often attributed to Jemdet Nasr.
- **INFERRED:** Rechecking recorded dimensions and area arithmetic is a defensible administrative exercise.
- **PROVISIONAL:** The specific mismatch and the apprentice's review request are reconstructed.
- **Excluded from this anchor:** Yield-share, boundary, ownership, or allocation disputes.

### Situation and participants
A responsible recorder asks for a second arithmetic check of a field measurement record. The actual record identity and provenance qualification must be shown in the content instance. Do not silently relabel the tablets as securely excavated Late Uruk documents or place them at a precise site without evidence.

### Player access and authority
The apprentice may transcribe the presented dimensions, apply only the relationship explicitly supported by the record/authoring rules, recalculate the stated area, and report a mismatch. They cannot survey the land, establish a boundary, determine ownership, allocate yield, or order a remeasurement.

### Evidence packet
- The measurement record or a clearly identified teaching copy.
- The dimensions and area as represented in that record.
- The notation/reading aid needed to interpret those values.
- A provenance note retaining the uncertain chronology/provenience.

If the source does not support a required conversion or formula, do not invent one for convenience. Any gameplay arithmetic representation must be reviewed against the cited publication and source reading before implementation.

### Playable work and choices
1. Identify the dimensions and recorded area.
2. Check that the values have been transcribed accurately.
3. Recalculate using the source-compatible relationship supplied by the authored instance.
4. Compare the result with the recorded area.
5. Report the calculation and any unresolved reading.

Judgment choices:
- Submit the calculation and identify the discrepancy.
- Request confirmation of an uncertain sign/reading before concluding.
- Treat the arithmetic result as proof of a boundary or ownership claim.
- Invent a yield or allocation consequence not present in the evidence.

### Deliverable and evaluation
**Deliverable:** A measurement-check note showing source values, method, recalculation, and uncertainty.

Careful work is transparent and does not exceed the record. Partial work identifies a likely arithmetic issue but needs a transcription/provenance check. Careless work turns arithmetic into an unsupported land claim or uses an unverified conversion.

### Outcomes and recovery
A responsible official may request the source reading be checked, ask for a new measurement by an appropriately situated person, or correct an arithmetic record. Those actions are not automatic and do not establish that the land itself is wrongly measured. An incomplete report can be returned for a documented second calculation.

### Recurrence boundary
A new occurrence requires a distinct field-measurement record and a supported arithmetic check. Preserve the source's chronology/provenience caveat in every occurrence. Do not instantiate yield-share, boundary, or allocation disputes from this seed.

---

## 6. Civic — Labor-Group Records and Grain Disbursement

**Anchor ID:** ERA1-CIV-02  
**Core situation:** An administrative reviewer wants two bounded checks: whether a labor-group account total is internally correct, and what a separate grain-disbursement record actually documents. The scenario deliberately teaches the player not to collapse two records into a single unsupported story.

### Historical grounding and confidence
- **ATTESTED:** W 9827 records laborer group accounts/totals. Separately, W 15897,c8 records grain disbursed to/consumed as rations by high-ranking officials.
- **INFERRED:** Each record supports a bounded administrative comparison of its own contents.
- **PROVISIONAL:** Pairing these two evidence types in one accountability review is a game reconstruction.
- **Not established:** The records do not establish the same people, institution, workflow, date, or a standardized work-gang ration system. Do not present the grain disbursement as the ration issue for the laborers in W 9827.

### Situation and participants
A responsible administrator asks the apprentice to check a labor-group total and separately summarize a grain-disbursement record that has been brought into the same review. The scenario's narrative must state plainly that the records are separate and that their relationship is not established. Do not invent a missing ration ledger linking them.

### Player access and authority
The apprentice may verify the group-account arithmetic, identify the separate disbursement's recorded recipient/category as the source permits, and report whether the records do or do not establish a link. They cannot claim the grain was owed to the labor group, accuse an official of withholding rations, or authorize redistribution.

### Evidence packet
- W 9827 or an explicitly identified source-based transcription/teaching copy of the labor-group account and total.
- W 15897,c8 or an explicitly identified source-based transcription/teaching copy of the grain disbursement.
- Separate provenance notes for each record.
- A review instruction that asks for bounded comparison, not a presupposed reconciliation.

Do not alter source identities or merge their dates/provenance. Any playable values must be verified against the publications before final content approval.

### Playable work and choices
1. Check the labor-group total against the entries in its own record.
2. Summarize what the separate disbursement record states.
3. Compare only the questions the records can actually answer.
4. Mark the relationship between the two records as established, contradicted, or not demonstrated.
5. Submit a two-part note preserving each record's identity.

Judgment choices:
- Keep the two records separate and state the limits of comparison.
- Identify an arithmetic error in the labor-group total, if present in the authored instance.
- Claim the disbursement was intended for the laborers despite no linking evidence.
- Treat absence of a link as proof of diversion or misconduct.

### Deliverable and evaluation
**Deliverable:** A two-part accountability note: (A) labor-group arithmetic and (B) separate disbursement summary, followed by a statement of what cannot be concluded.

Careful work makes the evidentiary boundary explicit. Partial work checks one record but fails to summarize the other or omits the limitation. Careless work invents a link, beneficiary, obligation, or accusation.

### Outcomes and recovery
A responsible reviewer may accept the arithmetic check, request clarification of the disbursement record, or seek other records. No outcome may imply that the grain was due to the labor group unless a separate, explicitly sourced future content instance establishes that link. If the apprentice conflates the records, the supervisor can require a corrected note that separates fact from inference.

### Recurrence boundary
A recurrence may use a new labor-group record or a separate disbursement record only when the active matter supplies it. The pairing remains explicitly **PROVISIONAL** unless new research establishes a connection. Do not turn this into a routine work-gang ration audit or generic laborer provisioning system.

---

## 7. Religious — Inana Offering Records and Sanctuary Supply

**Anchor ID:** ERA1-REL-01  
**Core situation:** A person responsible for an Inana-related offering or sanctuary obligation asks for a careful review of relevant offering entries and associated goods. The apprentice checks what the records show and reports a discrepancy or uncertainty. The scenario does not presume a single kitchen, office, schedule, or standardized supply chain.

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
4. Report a confirmed mismatch, missing source, or insufficient basis for comparison.
5. Submit the evidence with a clear distinction between attested record content and inferred institutional context.

Judgment choices:
- Report the exact discrepancy while preserving separate source identities.
- Request another source before concluding that a supply is missing.
- Treat a category mismatch as a quantity shortage without support.
- Declare a ritual interruption or prescribe a substitute offering beyond the apprentice's authority.

### Deliverable and evaluation
**Deliverable:** An offering/supply review note identifying each source, category, notation, comparison, and unresolved question.

Careful work preserves source distinctions and leaves ritual/institutional decisions to the responsible person. Partial work identifies a possible issue but omits a source or confidence qualification. Careless work invents a common schedule, kitchen, unit, shortage, or ritual consequence.

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

**Review status:** This is a first authored content draft, not final historical sign-off or an implementation-ready schema payload. Historical Research review and Game Director content approval remain required before the scripts are marked READY FOR IMPLEMENTATION.
