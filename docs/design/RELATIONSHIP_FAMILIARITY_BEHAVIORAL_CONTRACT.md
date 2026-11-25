# Relationship Familiarity Behavioral Contract

**ID:** GD-RELATIONSHIP-FAMILIARITY-001  
**Authority:** Game Director approval, 24 November 2026  
**Status:** **APPROVED — READY FOR TECHNICAL DESIGN**  
**Owner:** Design HQ  
**Scope:** Behavioral contract for directional personal familiarity, qualifying episodes, remembered Knowledge, and presentation.

This contract records approved behavior. It does not amend the canonical GDD or Decision Register. Production may develop the technical model and implementation plan within these requirements. Any persistent-state/schema change requires a compatibility, migration, and rollback plan for review before state-mutating implementation.

## 1. Design intent and distinctions

Familiarity represents the experiential depth of one person's meaningful contact with another. It is not a conversation counter, relationship sentiment, authority score, or qualification.

Keep three concepts distinct:

- **Episode:** A qualifying occasion through which one person gains meaningful experience of another.
- **Knowledge:** A specific fact, observation, or remembered tendency acquired through an identifiable source.
- **Familiarity:** A qualitative stage derived from accumulated qualifying episodes.

An episode need not create a particular item of Knowledge. A Knowledge record does not automatically establish deep familiarity.

## 2. Qualifying episodes

An episode qualifies only when all four conditions are met:

1. **Mutual awareness:** Both people participate, or one observes the other and knows whom they are observing. Proximity, mention, and indirect association do not qualify.
2. **Substance:** Something meaningful is at stake or revealed: a decision, disagreement, favor, shared task, commitment, or behavior under pressure.
3. **Distinct occasion:** It concerns a distinct matter or event, not a repeated visit or recycled interaction.
4. **Provenance:** It is traceable to an actual Event or Record. Biography prose and unsupported narrative summaries cannot create familiarity.

Routine greetings, errands, repeated questions, and incidental encounters do not qualify by themselves. Hostile or unsuccessful interactions may qualify. Disagreement can increase familiarity while reducing trust or affection.

## 3. Directionality, roles, and provenance

Familiarity is directional.

- If A observes B, this may increase A's familiarity with B; it does not automatically increase B's familiarity with A.
- A shared interaction may produce episodes in both directions only where each person's awareness and experience are independently supported.
- Observer-only experience remains distinct from direct participation.

Every episode must identify the ordered relationship pair, actor/observer and subject roles, interaction kind, and supporting Event or Record and matter where applicable. Typed references are required; free-text summaries are not sufficient provenance.

Duplicate prevention must distinguish the ordered pair, typed matter/event reference, and interaction kind. Re-presenting or repeating the same interaction on the same matter cannot create additional episodes. Do not create synthetic Events or Records merely to fill provenance gaps.

## 4. Qualitative stages

Familiarity uses derived qualitative stages, not a player-facing numerical meter:

- **Recognized:** Knows the person's identity or role through meaningful contact or observation.
- **Acquainted:** Has dealt with the person on a substantive matter and has some experience of how they participate.
- **Familiar:** Has accumulated enough varied experience to recognize how the person tends to act in relevant circumstances.

A single consequential episode may establish or advance a stage when its substance warrants it. Routine repetition does not. Stages do not decay merely because time passes. Specific Knowledge may become outdated; the historical episode remains.

No numeric thresholds, increments, or hidden backing score are part of this mechanic.

## 5. Knowledge and remembered tendencies

Specific remembered information must be represented as Knowledge with provenance. Familiarity stage is not the source of a remembered cue.

A tendency may be stated only when prior episodes provide evidence for it. For example:

> “Kuli's previous grain estimates have tended to run high.”

That statement requires prior estimates and subsequent checks supporting the pattern. Reaching Familiar does not create it.

A Knowledge record must retain what was observed, relevant context, source Event or Record, and later verification or contradiction where applicable.

**Cue consistency:** When an NPC gives an estimate of a kind for which the character holds relevant, verified Knowledge, the corresponding cue surfaces consistently whether the current estimate later proves accurate or inaccurate. Do not show the cue only when the current statement confirms the remembered tendency. It is context, not an answer key.

Familiarity may affect how readily relevant Knowledge is recognized or brought into an interaction. It must not manufacture Knowledge, alter provenance, or selectively suppress a relevant cue because of the current outcome. Lower familiarity may mean less contextual elaboration, not falsification or concealment of established evidence.

A remembered tendency is not a permanent character trait. Prefer “previous estimates have tended to run high” over “is an optimistic estimator.”

## 6. Behavioral effects and boundaries

Familiarity may shape recognition, contextual understanding, natural reference to shared experiences, the amount of unnecessary formal explanation, and recall of relevant provenanced Knowledge.

Familiarity does not itself grant trust, affection, respect, forgiveness, candor, cooperation, guaranteed disclosure, professional qualification, authority, appointment, or access. It does not prove that a current statement is accurate. An NPC may know the player well and still distrust or oppose them.

## 7. Existing runtime concepts

The audited runtime contains numeric `RelationshipDimensions.familiarity`, initialized at zero, with no audited gameplay accrual path. **Its numeric value is retired as an active gameplay dimension.** Do not add numeric increments, thresholds, or retain it as a hidden backing score.

This is a behavioral decision, not an instruction to delete a persisted property. Production owns the technical treatment of the legacy property and must document save compatibility, migration, and rollback before any persistent-state change. `PersonFamiliarity` remains the separate domain/exposure concept and must not be repurposed as personal relationship familiarity.

## 8. Acceptance criteria

- Repeating the same interaction on the same matter creates no additional episode.
- A distinct substantive matter can create a new episode.
- A consequential event may advance a stage without numeric accumulation.
- Observer-only familiarity is directional.
- Shared participation does not automatically mirror both directions.
- A dispute can increase familiarity while reducing trust.
- Biography prose, mere mention, and proximity create no episode.
- A remembered tendency requires specific supporting Knowledge and provenance.
- The cue appears consistently for relevant estimates, whether the current estimate is later confirmed or contradicted.
- A tendency is not presented as a permanent trait or proof about the current estimate.
- Outdated Knowledge can be qualified without erasing its historical episode.
- Familiarity does not grant authority, qualification, access, or guaranteed cooperation.
- Save/load and legacy compatibility preserve the distinctions among episodes, Knowledge, and derived familiarity.

## 9. Department ownership

- **Game Design:** Owns episode qualification, stages, Knowledge behavior, and player-facing effects.
- **Engineering & Architecture:** Owns technical representation, typed provenance, derived-stage computation, deterministic behavior, and compatibility design within this contract.
- **Art & UI/UX:** Presents remembered cues with clear source/context distinctions and readable uncertainty.
- **Production & QA:** Validates deduplication, directionality, cue consistency, migration, and separation from trust/access.
- **Historical Research:** Reviews specific historical claims when authored content introduces them.
- **Audio:** No material impact.

## 10. Authorization boundary

This behavioral contract is approved and ready for Production technical design. Production may assess existing Event, Record, Knowledge, relationship-history, persistence, and presentation systems and return its technical plan.

No technical schema, serialization format, module placement, or API is prescribed here. Any persistent-state change requires its compatibility/migration/rollback plan to be reviewed before implementation. No runtime implementation may weaken the behavioral requirements above.

This contract does not itself amend the GDD or Decision Register.