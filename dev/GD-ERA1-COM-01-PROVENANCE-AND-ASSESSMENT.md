# GD-ERA1-COM-01 — Provenance Disclosure and Supervisory Assessment

**Provenance disclosure:** APPROVED · Design direction by Game Director  
**Supervisory assessment:** PROPOSED · Design HQ specification for Game Director review  
**Scope:** First Assignment instructional sequence; Utu-mansum's assessment of the submitted comparison  
**Authority:** Game Director direction supplied 25 November 2026; canonical boundaries in `docs/GDD.md`, especially §§2.9, 3.5, 5, and 22  
**Handoff:** Production owns the evidence metadata schema, UI implementation, deterministic evaluation integration, persistence, and tests. This document does not prescribe TypeScript interfaces or save structure.

## 1. Purpose

Teach the player to keep four things separate:

1. What the evidence contains.
2. Where the evidence came from.
3. What the player concludes from comparing it.
4. What remains unverified.

The Assignment is successful when the player makes a useful, evidence-supported comparison without claiming more than the sources establish. It is not a test of whether the player can guess which source is most trustworthy.

## 2. Approved provenance disclosure contract

Every presented evidence item displays its provenance classification at the point of examination. The label is persistent and visible without a skill check, hover-only interaction, or separate discovery action. An accessible explanation is available alongside the label.

| Classification | Meaning | Example disclosure |
|---|---|---|
| **PHYSICAL** | An object directly available for the player to examine. | Provenance: Physical object examined directly. |
| **COPIED** | A documentary reproduction or transcription; the original is not directly available unless separately stated. | Provenance: Documentary copy examined; original record not directly available. |
| **REPORTED** | Information communicated by another person or source and not independently witnessed by the player. | Provenance: Reported information; not independently witnessed by the player. |
| **RECONSTRUCTED** | Modern editorial or historical reconstruction, not a surviving ancient artifact. | Disclose in an accompanying historical/context note, not as another ancient evidence item. |

These labels describe provenance, not reliability. They do not imply a ranking, confidence score, truth value, or automatic assessment result. A physical object can mislead; a copy can accurately preserve an original; a report can be truthful; a reconstruction can be well-supported or uncertain.

A reconstructed note must distinguish what is attested, inferred, reconstructed, and unknown. Do not style or position it as an additional ancient artifact.

### 2.1 Evidence and context remain distinct

- The evidence item is the thing or statement being examined.
- Provenance explains how that item reached the player and what kind of access the player has to it.
- A historical/context note explains modern reconstruction or editorial qualification.
- Character interpretation is a separate, situated layer. It may affect recognition, confidence, and reasoning, but never changes the evidence text or hides a provenance label.

The labels do not decide whether evidence is admissible, sufficient, accurate, or persuasive. Those are questions for the player's judgment and the authored scenario rubric.

## 3. Instructional sequence

The first Assignment teaches the following sequence:

1. Examine the receiving tag and see its PHYSICAL classification.
2. Examine the receiving entry and see its COPIED classification.
3. Review the handover account and see its REPORTED classification.
4. Review any modern reconstruction/context note separately; do not mistake it for an ancient artifact.
5. Compare the identifying information actually present in the sources.
6. Record a bounded comparison finding, cite the relevant sources, and state what cannot be verified.
7. Submit the report and receive Utu-mansum's supervisory assessment.

The sequence teaches source discipline through use. The player should not be asked to memorize a taxonomy before being allowed to inspect the evidence.

**Content constraint:** Do not introduce invented quantities, counts, dates, measurements, or numeral-system assumptions into the evidence packet. Any quantity or notation that is present must be source-grounded, historically reviewed, and represented without silently converting unlike systems. This Assignment's comparison can be taught through identifying information without manufacturing numerical discrepancies.

## 4. Supervisory assessment — proposed behavior

Utu-mansum assesses the quality and limits of the player's submitted work. He is the receiving official and instructional supervisor for this task; his assessment is not a declaration that the underlying delivery matter is closed.

A correct bounded finding should be recognized as professionally useful. It is not timid, incomplete, or inferior merely because it refuses to claim physical verification of a copied entry or reported handover. The player is being assessed on whether the conclusion is supportable, not whether it is maximal.

### 4.1 Correct, deliberately bounded finding

**Expected assessment:** Defensible at minimum; Thorough when the player has also completed and cited the full relevant comparison and disclosed the material provenance/verification limits.

Utu-mansum's response:

> Utu-mansum reads the comparison again, then sets the copied entry beside the tag. “Good. You have shown me what agrees and what does not, and you have not turned the handover account into something you witnessed. I can take this forward and ask for the point still in question to be checked. Keep these sources together. We do not yet know what happened after the goods left the handover.”

The response must communicate four things:
- The comparison is useful and has been understood.
- The player has correctly distinguished direct examination from copied and reported information.
- The remaining uncertainty is real and has not been resolved by the report.
- Utu-mansum can use the report to take the next appropriate step, but the player has not made that decision or established the wider matter's outcome.

This is positive supervisory feedback. Do not add a reprimand, suspicion, relationship penalty, or reduced professional credit merely because the conclusion is bounded.

### 4.2 Assessment categories

Use the existing Assignment assessment vocabulary and deterministic authored rubric. Scenario-specific requirements determine the category; provenance labels themselves do not.

| Assessment | Player work | Supervisory response |
|---|---|---|
| **Thorough** | Correctly compares all relevant identifying information, cites the material sources, distinguishes their provenance, and explicitly preserves the limits of what is not verified. | Utu-mansum acknowledges the complete, usable comparison and says he can carry it into the next check. |
| **Defensible** | Reaches the correct bounded comparison and avoids unsupported claims, but omits a relevant detail or secondary source that would make the report more complete. | Utu-mansum accepts the useful finding and identifies the specific remaining check without treating the report as wrong. |
| **Incomplete** | Does not make the comparison usable: a required source is absent, the identifying information is not actually compared, or a material limitation is omitted. | He explains what is missing and why he cannot yet carry the report forward. His response is instructional, not punitive. |
| **Overreached** | Treats a copied or reported statement as direct physical verification, claims an unobserved event as fact, or assigns responsibility/intent not established by the evidence. | He points to the unsupported step and asks for correction. He does not accuse the player of dishonesty or invent a culprit. |

**Important:** A player who correctly says “the copied entry agrees/disagrees with the identifying information on the tag” has not claimed to verify the original record or the whole delivery. Do not mark that conclusion incomplete merely because direct access to the original is unavailable.

### 4.3 Feedback must explain the distinction

Assessment feedback should separately identify:

- **Evidence content:** what the tag, entry, and account actually state.
- **Provenance:** which item was examined physically, copied, or reported.
- **Player conclusion:** the comparison the player recorded.
- **Unverified:** what cannot be established from the available sources.

Do not collapse these into a generic “right/wrong” verdict. Do not make the evidence classification itself the answer to the Assignment.

## 5. Matter continuity and authority

Submitting the Assignment completes the player's current task. It does not automatically settle the underlying delivery matter.

The closeout should state that Utu-mansum has received the comparison and what next check he can initiate or request within his established authority. It must not assert that:
- the goods have been accepted or released;
- a discrepancy has been resolved;
- the carrier or another person is responsible;
- the handover account has been independently verified; or
- the wider institutional matter is closed,

unless separate authored evidence and an authorized decision establish that outcome.

The report becomes a Record that can inform subsequent institutional work. A later Assignment may arise from a genuinely new step, new evidence, or a decision by the responsible official. Do not automatically spawn another Assignment merely to dramatize continuity.

## 6. Historical and authoring controls

- Historical Research validates the terms used for tags, receiving entries, handover accounts, copies, and any contextual reconstruction.
- Do not imply that modern documentary categories were named or administered exactly this way in Uruk. These are player-facing provenance labels describing the player's access to evidence.
- Distinguish attested evidence, historical interpretation, reconstruction, and fictional scenario details.
- Do not present fictional participants as attested historical persons.
- Do not add unsupported office hierarchies, formal procedures, or modern bureaucratic language to dialogue.
- Keep the human pressure understandable and ordinary: a receiving official needs a useful comparison before work moves on; a carrier may want the handover accepted; neither preference changes the evidence.

## 7. Acceptance criteria

### Provenance disclosure — approved

- [ ] Every presented evidence item identifies PHYSICAL, COPIED, or REPORTED at the point of examination.
- [ ] The explanation is readable and accessible without skill checks or hover discovery.
- [ ] RECONSTRUCTED material is disclosed in a separate historical/context note.
- [ ] The four labels are not used as reliability or quality ratings.
- [ ] Provenance labels do not automatically determine assessment or outcome.
- [ ] No invented quantities or numeral-system assumptions enter the evidence packet.

### Supervisory assessment — proposed

- [ ] A correct, bounded comparison receives Defensible or Thorough, never Incomplete solely for declining to claim physical verification.
- [ ] Thorough versus Defensible depends on authored completeness requirements, not how bold or expansive the conclusion sounds.
- [ ] Assessment explains evidence content, provenance, conclusion, and remaining uncertainty separately.
- [ ] Utu-mansum's positive reaction recognizes the usefulness of the bounded finding.
- [ ] The player is not penalized for refusing unsupported certainty or responsibility claims.
- [ ] An incomplete report identifies the missing source/comparison/limitation.
- [ ] An overreached report identifies the unsupported inference and offers a correction path.
- [ ] Completing the player's Assignment does not imply that the underlying matter is closed.
- [ ] No assessment category invents a delivery outcome, culprit, or institutional decision.

## 8. Production handoff boundary

### 8.1 Provenance disclosure — APPROVED · READY FOR IMPLEMENTATION

The Game Director has approved the provenance disclosure direction. Production is authorized to implement the approved classification and point-of-examination presentation without waiting for the supervisory-assessment proposal to be approved.

Production determines:
- the evidence metadata type and compatibility strategy;
- where provenance is rendered in the examination UI;
- persistence and migration behavior, if any; and
- automated tests for visibility, classification neutrality, and reconstructed-context separation.

### 8.2 Supervisory assessment — PROPOSED

The assessment section is not yet an approved behavioral contract. After Game Director approval, it becomes **READY FOR IMPLEMENTATION**. Production may then integrate the rubric with the existing deterministic assessment and Closing Receipt, and test correct bounded findings, incomplete work, overreach, and matter continuity.

No new balance values, AP rules, tracked resources, autonomous NPC scheduler, or generative runtime system are authorized by this specification.
