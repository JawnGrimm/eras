# Work Contribution Behavior Specification

**Status:** Engineering behavior specification based on the owner-accepted Work Contribution Contract, 23 November 2026.  
**Design authority:** [Canonical GDD](../GDD.md) and [Decision Register](../design/DECISION_REGISTER.md).  
**Related design:** [Activity, Work, and Evaluation Specification](../design/ACTIVITY_AND_WORK_SPEC.md).  
**Scope:** Observable behavior and acceptance requirements for contribution-based Works.  
**Non-goals:** This document does not define a data schema, prescribe a universal Work sequence, approve individual Work content, or authorize runtime implementation by itself.

## 1. Purpose and authority

The Work Contribution Contract establishes a reusable standard for representing and recognizing professional contributions within Works.

**Standardize how professional contributions are represented and recognized. Do not standardize what professional work looks like.**

An individual Work authors its own contribution types, boundaries, evidence requirements, completion criteria, assessment criteria, deliverables, and Career XP eligibility. This specification defines the behaviors the shared system must preserve across those different Works.

The contract is accepted as a working design specification. The following remain separate:

- The shared framework is accepted.
- Individual Work proposals, including Eanna Provisioning Undertaking, The Ordered List, and The Long Delivery, require their own content review and approval.
- Implementation details, data structures, migration strategy, and delivery sequence remain engineering decisions within the accepted boundaries.
- A successful implementation or test does not approve unreviewed Work content or silently change the GDD.

## 2. Core concepts and invariants

### 2.1 Professional contribution

A **contribution** is an accountable professional unit: a meaningful responsibility undertaken by a character and the resulting professional output or finding.

A contribution is not synonymous with:
- A button press or engine action.
- A single evidence examination.
- A single record.
- A fixed number of Action Points or Workdays.
- A world event performed by an NPC or institution.
- Every intermediate task required to produce the output.

One contribution may involve several player actions, several evidence sources, collaboration, and multiple connected deliverables. Several actions may support one contribution assessment. A contribution may also be a professional judgment whose deliverable is a copy, account, recommendation, reference, or other authored output.

A Work defines the boundaries that make a responsibility independently meaningful and assessable. The shared system must not infer contribution boundaries from action counts or record counts.

### 2.2 Contribution identity and attribution

**WC-01 — Stable identity.** Each contribution instance must have a stable, unique identity within its overall undertaking. Its identity must survive save/restore, correction, succession, and later review. It must not depend on mutable list position, display order, or the currently active character.

**WC-02 — Actual actor attribution.** Each player contribution must identify the character who performed it. Attribution is recorded when the contribution is made or formally established; it must not be reconstructed from whichever character later submits or completes the Work.

**WC-03 — Historical attribution is immutable.** A successor does not become the author of a predecessor's contribution by inheriting access to its records or continuing the same undertaking. Corrections and later findings are separately attributed.

**WC-04 — Distinguish contribution from world event.** A player contribution to documenting, examining, interpreting, or verifying an event must not make the player the actor responsible for that event. Dispatch, production, authorization, delivery, execution, and fulfillment retain their actual world actors and dates. The professional contribution that establishes or records those events is separately represented.

### 2.3 Work-specific definition

**WC-05 — Authored contribution contract.** Each Work must define, for every contribution it uses:
- What professional responsibility the contribution represents.
- Its scope and completion boundary.
- The evidence and provenance requirements, where applicable.
- The contribution's required output or deliverables.
- The criteria for professional assessment.
- Whether it is eligible for Career XP and the authored award conditions.
- Its relationship to other required or optional contributions and to overall Work completion.

These definitions are Work-specific. The shared system must not impose common stages, a fixed number of contributions, or a universal deliverable type.

**WC-06 — Multiple deliverables.** A contribution may produce multiple related deliverables when they are outputs of one coherent responsibility. Splitting one responsibility into several nominal contributions must not create additional reward eligibility.

## 3. Evidence, records, and knowledge

**WC-07 — Preserve provenance and epistemic boundaries.** Contributions must retain the sources and limits that support material findings. The system must preserve the distinction between:
- What happened in the world (event).
- What a person or institution recorded or asserted (record).
- What a particular person or institution knows, and how they learned it (knowledge).
- What the contributing character interpreted or concluded from the available evidence (finding or judgment).

A claim, record, or testimony is not automatically established fact. A later record does not retroactively change what an earlier character could reasonably know.

**WC-08 — Evidence remains objective.** Character skill, experience, equipment, relationships, background, and circumstances may affect access, recognition, interpretation, confidence, and possible error. They must not falsify or conceal the underlying source evidence. Assessment must distinguish an unreasonable judgment against available evidence from a reasonable judgment later contradicted by new information.

The current Work engine's six assessment dimensions are implementation support, not a universal requirement that every Work use all six or that every contribution use an identical rubric.

## 4. Contribution completion and assessment

**WC-09 — Contribution completion is independent of action completion.** The Work determines when a contribution's professional responsibility and required deliverables are complete. Completing an action or examining all listed evidence does not automatically complete a contribution.

**WC-10 — Assess the authored unit.** Assessment applies to the contribution as a coherent professional unit, not automatically to every supporting subtask. One assessment may consider many actions, sources, and connected deliverables. A supporting action may have no independent assessment or reward.

**WC-11 — Professional quality is independent of institutional outcome.** Contribution assessment evaluates the character's work against the Work-authored criteria and the evidence reasonably available at the time. It must not be changed merely because:
- An authority accepts, modifies, rejects, or defers the recommendation.
- A recipient declines to adopt a document.
- A shipment, production activity, or other later operation fails.
- A later discovery contradicts a reasonable earlier conclusion.
- The institution chooses not to act.

Conversely, a favorable institutional or material outcome does not prove the professional contribution was sound.

**WC-12 — Correction is not erasure.** A correction by the original contributor, a challenge by another character, and a later independently established finding are distinct historical contributions or events. The original contribution and assessment remain part of the history. The system must be able to identify the current professional position without silently rewriting the earlier record. Institutional adoption or rejection is recorded separately from professional supersession.

## 5. Career XP recognition

**WC-13 — Authored eligibility.** Career XP eligibility belongs to the Work-authored contribution definition, not to the number of contributions a Work happens to contain. Not every contribution must earn Career XP.

**WC-14 — One-time award per qualifying instance.** A qualifying contribution instance may award Career XP only once. Repeated submission, correction, save/restore, repeated finalization, or succession must not duplicate its award. The award must be associated with the actual contributing character, not automatically with the character who later submits the overall Work.

**WC-15 — Anti-fragmentation safeguard.** Dividing one professional responsibility into smaller contribution definitions must not increase its intended total Career XP. The Work's overall Career XP reward budget must reflect the scope and difficulty of its professional undertaking, not the raw number of contribution definitions. Work content must author eligibility and amounts in advance; the engine must enforce one-time recognition.

The exact award formula, values, thresholds, and any shared calibration method remain open. This specification does not set numerical rewards.

## 6. Overall Work completion and Historical Progress XP

**WC-16 — Separate contribution and Work completion.** A Work defines its own overall professional completion conditions. Those conditions may require several contributions, but the shared system must not assume that every contribution is a fixed stage or that every Work has the same lifecycle.

**WC-17 — Completion does not require institutional action.** A Work may be professionally complete once its required professional contribution is complete and assessed, and its findings, evidence, uncertainty, deliverables, and institutional status are accurately recorded. The institution does not have to accept or execute the recommendation.

Where relevant, the record must capture the institutional response or its absence. Response categories may include accepted, modified, rejected, deferred, clarification requested, and no response. These describe institutional outcomes, not professional grades.

A clarification request within the character's remit may require further work and keep the Work active. A request that is outside the remit, impossible to satisfy, or dependent on unavailable information may be recorded as a limitation; the Work may then close with the institutional matter unresolved.

**WC-18 — Historical Progress XP is Work-level.** A professionally completed ordinary Work awards its authored Historical Progress XP once for the overall undertaking. This award is independent of institutional agreement, authorization, execution, or eventual success. It must not be awarded once per contribution or repeated through multiple character contributions to a handed-off undertaking. Tutorial classification and all existing GDD exclusions remain in force.

**WC-19 — Institutional process continues independently.** The Work's professional lifecycle and the institution's lifecycle are separate. A recommendation, authorization, commitment, execution, delivery, and verification are distinct events or records with their actual actors and dates. Later execution must not overwrite the original recommendation or authorization. A Work may be complete while the institutional matter remains active and continues to develop in the world.

## 7. Character succession and conditional handoff

**WC-20 — No automatic transfer.** Retention of Work progress, Work identity, or institutional context through character succession does not itself transfer the predecessor's personal professional undertaking to the successor.

The successor's access to records, personal connection to the predecessor, institutional recognition, and authority/remit are distinct facts.

**WC-21 — Acknowledgment is not an invitation or handoff.** An institution may acknowledge a predecessor's death or departure, express condolences, recognize service, or note that a matter remains unresolved. Such acknowledgment alone does not offer or establish a handoff. The institution may make no offer.

**WC-22 — Conditional invitation.** An institution may invite an eligible successor to take up a defined remaining responsibility when it has a credible reason to approach them. The invitation must establish the responsibility offered, its basis, the relevant access and authority, and its limits. An invitation is not acceptance and does not automatically transfer an entire office or the predecessor's authority.

Institutional recognition is required when the successor needs institutional control of records, remit, or authority. It is not a universal prerequisite where the successor independently has credible access and a plausible professional remit.

**WC-23 — Valid handoff.** Continuation of the same overall undertaking requires an explicit handoff event and a credible professional/institutional basis. Eligibility must be grounded in an existing connected scribal NPC, a plausible connection to the predecessor, institution, participants, or documentary chain, plausible access to required people and records, and a plausible remit. These are qualitative requirements; this specification does not invent numeric skill, relationship, or rank thresholds.

Acceptance plus valid access/remit establishes the handoff. Decline, inability, ineligibility, or absence of a credible offer means no handoff. An invitation may expire or be withdrawn as circumstances change; it must not silently become an obligation.

**GD-SUCCESSION-001 — Institutional condolences and conditional invitation (Game Director ruling, 25 November 2026).** When the player character dies while carrying an unfinished personal Work, the institution responsible for that Work addresses the selected inheriting successor with condolences. Its deterministic response is either condolences only, or—when the successor is qualified and the institution has a credible basis—an explicit invitation to take up a defined remaining responsibility. Condolences are not an invitation; an invitation is not acceptance; acceptance is not a valid handoff until required access, remit, and authority are established. The successor may accept or decline. A qualified successor is not guaranteed an invitation: institutional need, credible connection, and the authored Work's access/remit conditions must support it. No numeric skill/rank threshold is introduced by this ruling; use existing authored qualification criteria or qualitative, evidenced access and remit. A valid handoff records a distinct Event and durable history, transfers documentary context and the defined unfinished remit only, and keeps predecessor/successor contributions separately attributed and independently assessed. If no offer is made, the successor is ineligible/unable, or the invitation is declined, no handoff occurs. The predecessor's personal contribution segment closes, but the overall Work undertaking and its progress remain preserved in institutional custody; the successor may later choose to take it up through a valid opportunity. The institutional matter, records, commitments, and world continue. No automatic continuation, inherited authority, guaranteed invitation, retroactive contribution, or generated replacement person.

This ruling applies to death. Non-death departure continues to use WC-21's general institutional acknowledgment discretion unless an authored circumstance specifies otherwise.

**WC-24 — Preserve contribution segments.** Under a valid handoff, the overall institutional undertaking and Work identity may continue, but predecessor and successor contributions remain separately attributed and independently assessed. The successor may rely on predecessor records, question them, or independently examine the matter. Reading an existing record is not automatically a new investigation; independently establishing a finding is a new contribution.

A handoff transfers documentary context and the unfinished remit, not personal knowledge, skill, reputation, authority, possessions, relationships, or identity.

**WC-25 — No handoff means no immediate player continuation; preserve the undertaking.** If no valid handoff occurs, the predecessor's personal contribution segment closes, but the overall Work undertaking, completed progress, documentary context, and unfinished institutional remit remain preserved in institutional custody. No player contribution is attributed during the gap. The successor may later choose to take up the preserved Work through a credible opportunity and valid handoff; there is no forced acceptance, guaranteed invitation, automatic queue, or retroactive contribution. The institutional matter, records, commitments, and world events continue. The world does not pause.

## 8. Persistence, validation, and compatibility

**WC-26 — Durable history.** Save/restore must preserve contribution identities, actor attribution, completion and assessment history, deliverable references, correction/supersession history, Career XP awards, Work completion, and handoff status without collapsing them into one current-character snapshot.

**WC-27 — Referential validation.** Persisted contribution history must be validated against the registered Work definition and relevant world state. Validation must reject duplicate contribution identities, invalid actors, invalid Work or undertaking references, invalid evidence/deliverable references, impossible lifecycle combinations, and duplicate award claims. Valid older saves must not be rejected merely because they predate contribution tracking.

**WC-28 — Explicit compatibility.** Existing schema-v2 saves and completed Work records must remain compatible through a deliberate migration or compatibility policy. Do not invent historical actor attribution for legacy progress when the saved data cannot establish it. Legacy progress may be represented as unattributed/legacy where necessary; do not assign it to the currently active character by assumption. Any schema change and migration plan require separate engineering review.

This specification does not choose between extending Work progress, adding a separate contribution ledger, or another representation. Those are implementation options to evaluate against these behaviors.

## 9. Observable acceptance scenarios

The following scenarios are mandatory behavioral tests for the shared system. Individual Works should add their own content-specific cases.

| ID | Scenario | Required result |
|---|---|---|
| AT-01 | One contribution uses several actions and evidence sources and produces two connected deliverables. | One coherent contribution is completed and assessed once; both deliverables are linked to it. |
| AT-02 | Several actions support a contribution but are not independently reward-eligible. | Completing those actions does not create extra contribution completions or Career XP awards. |
| AT-03 | An NPC dispatches goods; the player reconciles and records the dispatch evidence. | The NPC remains the dispatch actor; the player's contribution is the professional reconciliation/record. |
| AT-04 | A contribution is completed by character A, then character B submits or completes the Work after a valid handoff. | Contribution remains attributed to A; B receives attribution only for B's own new contributions. |
| AT-05 | The same qualifying contribution is submitted, corrected, restored, or finalized repeatedly. | Its Career XP award occurs no more than once. |
| AT-06 | A Work divides one coherent responsibility into multiple contribution definitions. | The authored Work reward budget does not increase merely because of the split; validation or content review identifies the fragmentation risk. |
| AT-07 | A recommendation is professionally sound but the authority rejects it. | Contribution assessment remains sound; institutional rejection is recorded separately; the Work may complete if its professional remit is fulfilled. |
| AT-08 | An authority accepts a recommendation, but the underlying contribution is incomplete or poorly evidenced. | Institutional acceptance does not upgrade the professional assessment or bypass required contribution work. |
| AT-09 | No institutional response arrives after a professionally complete contribution. | The Work can complete with no response/outstanding status recorded; the institutional matter remains independent. |
| AT-10 | A clarification request is within remit. | The Work can remain active for a further contribution or correction. |
| AT-11 | A clarification request is impossible, out of remit, or depends on unavailable information. | The limitation is recorded and the Work can close without falsely marking the institution's matter resolved. |
| AT-12 | A later execution event follows an earlier recommendation and authorization. | The execution is a separate world event linked to the matter; earlier records are not overwritten. |
| AT-13 | The original contributor corrects a finding; another character challenges it; later evidence establishes a new position. | Original, correction, challenge, and later finding remain distinguishable and attributed; current professional position is identifiable. |
| AT-14 | The institution sends condolences but makes no invitation. | No handoff occurs; player contribution ceases while the matter and world continue. |
| AT-15 | An institution invites an eligible successor, who accepts a defined remit and has required access. | A valid handoff is recorded; the same undertaking can continue with separately attributed contribution segments. |
| AT-16 | A successor declines or is unable to accept an invitation. | No handoff occurs; no predecessor authority or personal Work ownership transfers. |
| AT-17 | A successor has independent access and remit; institutional recognition is not needed. | Handoff may be valid without an institutional invitation, provided the explicit basis and event are recorded. |
| AT-18 | A valid handoff is followed by another character succession. | Each handoff is explicit and validated; contribution history and one-time awards remain intact. |
| AT-19 | A legacy save contains Work progress but no contribution actor history. | Save remains loadable under the compatibility policy; no actor is fabricated. |
| AT-20 | A completed Work is restored and completion logic is invoked again. | Historical Progress XP and qualifying Career XP are not duplicated. |

## 10. Implementation sequence and verification

The dependency order below is recommended, not a schema prescription or delivery commitment:

1. Contribution identity, actor attribution, and durable history.
2. Work-authored contribution boundaries, completion, deliverables, and independent assessment.
3. Idempotent Career XP recognition and anti-fragmentation validation.
4. Overall Work completion and one-time Historical Progress XP independent of institutional response.
5. Institutional invitation, conditional handoff, and contribution continuity across characters.
6. Append-only correction, challenge, and supersession history.
7. Save validation, legacy compatibility, migration, and regression coverage.

Implementation should be split into reviewable increments. Each increment must include deterministic engine tests, persistence tests where state changes, and UI behavior tests where player-facing workflows change. A production build alone is not proof that TypeScript checks, automated tests, or deployment succeeded; report each verification result separately.

## 11. Explicitly unresolved engineering and design decisions

The following are intentionally not settled here:

- Data model and storage location for contribution definitions, instances, histories, and award ledger.
- Stable ID generation strategy and whether repeated contribution types are permitted within one undertaking.
- Exact contribution lifecycle states and transition API.
- Work-specific assessment rubric shape and whether any shared assessment dimensions are required.
- Career XP values, formulas, budgets, eligibility thresholds, and anti-fragmentation validation technique.
- Exact overall Work completion API and how clarification/revision loops are represented.
- Exact invitation issuer, eligibility evaluation, expiration, withdrawal, and remit authorization mechanics.
- Whether and how an unfinished Work may be paused, closed, re-opened, or superseded after no handoff.
- Schema versioning and migration implementation for existing saves.
- Whether more than one active Work is ever permitted. The current single-active-Work restriction is an implementation fact, not an approved design rule.
- Detailed content, cast, historical claims, quantities, deliverables, and reward values for individual Works.

No placeholder system should be implemented to make an unresolved item appear complete. Where a decision materially blocks a safe implementation increment, bring the specific conflict and options to the owner before coding.
