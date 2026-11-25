# GD-ERA1-TABLET-WORKSPACE-001 — Era I Physical Tablet Workspace

**Status:** PROPOSED — DESIGN SPECIFICATION FOR GAME DIRECTOR REVIEW  
**Approval:** Core interaction principles approved in conversation, 25 November 2026; artifact layout and detailed behavior remain proposed.  
**Owner:** Design HQ — Game Design, Historical Research, Art & UI/UX  
**Scope:** Era I tablet-centered document interaction, prototyped through the Eanna Consolidated Summary Tablet.  
**Implementation status:** No runtime changes. NOT READY FOR IMPLEMENTATION.

## 1. Purpose

Define the player-facing design of an Era I clay-tablet workspace in which the player character (PC) creates an administrative record through visible physical actions.

The tablet is the primary workspace and persistent visual focus. It is not a decorative background behind a modern form. Dialogue appears over or around the tablet while the PC works. Player actions create the accounting marks on the clay. The player deliberately finalizes the transaction through a **Seal** action.

The Eanna Consolidated Summary Tablet is the first design prototype. “Consolidated Summary Tablet” is a working game-design name, not a claim that this exact document type or layout is attested at Uruk c. 3200 BCE.

This document defines a design contract and a historical-research boundary. It does not define TypeScript interfaces, rendering technology, persistence, save schemas, or implementation modules.

## 2. Authority and design maturity

### 2.1 Game Director-approved interaction principles

The following interaction principles have explicit Game Director approval:

1. **Persistent tablet:** The Era I clay tablet remains visible as the player works.
2. **Dialogue overlay:** Dialogue appears over or around the tablet; conversations do not routinely move the player to a separate dialogue screen.
3. **Player-created marks:** Accounting marks appear on the tablet as a direct result of the player's actions. They are not merely pre-rendered after a form is completed.
4. **Physical finalization:** The player deliberately performs the final **Seal** action to commit the administrative work and end the interaction.
5. **Sealed is a gameplay state:** “Sealed” means the player has committed the record and closed the transaction. It does not certify that the record is objectively correct or that the underlying world problem is resolved.
6. **Historical material changes by era:** Later eras should use document materials and interaction conventions appropriate to their own periods rather than reusing the clay-tablet interaction unchanged.
7. **Administrative discrepancy is not guilt:** A shortage or discrepancy is not proof of theft, fraud, negligence, or intent. People may make informal arrangements, rely on future follow-through, make mistakes, or expect a temporary situation to resolve. Sometimes it does not.

The player may accept an authorized person's verbal assurance or carry-forward explanation instead of demanding physical verification. That is a consequential judgment, not proof that the goods have physically returned.

### 2.2 Design proposals in this document

The exact tablet layout, obverse/reverse organization, entry controls, correction behavior, visual sign library, seal presentation, and Eanna scenario sequence remain proposed pending Game Director review and historical validation.

The character having a distinctive personal seal is an approved creative direction in principle. Its historical function, relation to profession or institution, acquisition, and use on particular record types remain to be researched and specified.

## 3. GDD alignment and existing repository constraints

This proposal implements, without changing:

- **GDD §§1–2:** Administrative judgment is gameplay; documents have consequences; writing materials and practices change across eras.
- **GDD §2.9:** Event, Record, and Knowledge remain distinct. The record must preserve what was entered and the scope of its claims.
- **GDD §2.11:** The PC's access to information, ability to interpret it, and ability to establish its truth remain separate.
- **GDD §3.5:** Human, grounded, occasionally wry tone; social presence need not become a task or skill check.
- **GDD §5:** Assignments, Challenges, and Works remain distinct. This tablet prototype is not a new gameplay layer.
- **GDD §22:** No runtime generative AI for assignment generation, record validation, or outcome determination.

Relevant supporting constraints:

- docs/design/INTERFACE_AUDIO_ACCESSIBILITY_SPEC.md §§18.1–18.4 establishes a readable working environment, Era I clay/earth material identity, clear information hierarchy, and the rule that decorative generated marks must not be presented as verified historical writing.
- docs/design/ACTIVITY_AND_WORK_SPEC.md §7 defines the Storehouse Reckoning as a separate, supervised Introductory Tutorial. Its guided evidence/reconciliation/document sequence is not a general Assignment template.
- dev/ERA_I_INSTITUTIONAL_HISTORICAL_AUDIT.md §§6 and 8 requires constrained proto-cuneiform content, contextual numerical systems, oral dialogue rather than ordinary prose on Uruk IV tablets, and contextual treatment of seals.
- dev/ERA_I_INSTITUTION_RESPONSIBILITY_MATRIX.md supports Eanna as the strongest directly evidenced Era I administrative setting, while warning against inventing exact internal jurisdictions and workflows.

No GDD revision is proposed by this document.

## 4. Core interaction model

The player performs three related kinds of work:

### 4.1 Make entries

The player chooses the accounting category and enters or confirms a quantity. The game renders the corresponding verified sign/number assets as visible impressions on the clay.

- The player makes the administrative choice.
- The game renders the physical marks.
- The player is not required to draw wedges or reproduce signs freehand.
- Quantity entry must be tied to the relevant commodity and metrological context. A numerically plausible value may still be wrong if it uses an incompatible numerical system.
- Modern-language labels and explanations may appear in the surrounding interface as accessibility aids. They are not represented as words written on the ancient tablet.

### 4.2 Review the developing record

The player can inspect the tablet while it is being made. The record must visibly distinguish entries already made from entries not yet made, and any relevant totals or outstanding amounts.

Review must not silently change the record. If the player changes an entry, the interface should show a deliberate correction action and preserve a legible state appropriate to the historically validated medium and practice.

### 4.3 Seal the transaction

The player selects **Seal** only when the required work is complete enough to commit.

- The transaction changes from open/in progress to sealed.
- The record becomes committed and is no longer silently editable.
- The player receives clear feedback that the transaction is closed.
- Sealing does not guarantee factual accuracy, prove a verbal assurance, resolve an outstanding physical shortage, assign guilt, or authorize an action outside the PC's authority.
- Where the scenario's historically reviewed practice supports a personal seal impression, the action should visibly press the PC's distinctive seal into the clay. The system must not imply that every Uruk tablet historically received a personal cylinder-seal impression. If a particular record should not bear one, the finalization action must still communicate closure without inventing a sealing practice.

## 5. Eanna prototype artifact

### 5.1 Working purpose

The Eanna prototype compiles separately supplied household counts into one consolidated administrative record. Its purpose is to make the combined quantities and resulting allocation legible to the responsible people.

The tablet is not a narrative report, legal compact, investigative dossier, or modern ledger. It should contain only the concise administrative information supported by the scenario and by the historically validated sign/number repertoire.

The human explanations, disagreement, pressure, and uncertainty are conveyed orally around the work. They are not converted into multi-clause legal caveats on the tablet.

### 5.2 Proposed physical organization

The proposed design uses one tablet with two faces:

**Obverse — source entries**
- The relevant household or administrative categories.
- The commodity categories being counted.
- The quantities entered from the separate source counts.
- Any concise grouping or subtotal that historical review supports.

**Reverse — consolidation**
- The combined totals for the relevant categories.
- The amount available for allocation, if supported by the scenario.
- A concise allocation entry or quantity distribution when available supplies are insufficient.

This obverse/reverse arrangement is a design proposal derived from the requested play experience. It must not be presented as a universal or attested Uruk tablet convention until the exact layout is researched against period examples.

### 5.3 The shortfall decision

If the combined quantity is insufficient, the player makes one clear allocation decision within the authority and options established by the assignment.

The tablet records the resulting administrative quantities or categories using concise marks. The reasoning, competing needs, objections, and assurances remain in spoken dialogue.

Do not ask the player to write a modern explanation of why the allocation was chosen. Do not equate an unfavorable allocation, a short count, or an outstanding amount with misconduct.

The scenario must distinguish:
- the quantity physically present or counted;
- the quantity entered in the administrative record;
- any quantity accepted as retained, carried forward, or otherwise accounted for on someone's assurance;
- what remains unresolved in the world.

A carry-forward entry may close an administrative step without making absent goods physically present.

### 5.4 Source material and provenance

The player must be able to see or consult the separate source counts that the summary compiles. The workspace must make it clear which source entry is being transcribed or consolidated.

The summary tablet is a new Record. It does not retroactively alter the source tablets or make the source records more reliable. The source record, the PC's new record, and what each person knows from them remain distinct.

Do not invent exact household names, commodity quantities, signs, numerical values, units, or institutional categories in the implementation contract. Those must be supplied by the authored scenario and checked against the relevant research.

## 6. Dialogue behavior

Dialogue should feel like people speaking while the PC works, not a sequence of mandatory investigation screens.

Use three presentation classes:

1. **Task-relevant dialogue:** Supplies an explanation, instruction, assurance, correction, or request that can reasonably affect the PC's administrative judgment.
2. **Decision-pressure dialogue:** Reveals a competing interest, objection, social cost, or request. It may influence the player's judgment but does not automatically establish a fact.
3. **Ambient dialogue:** Human comments, grumbling, jokes, side arguments, or background remarks that enrich the scene but do not require a player response or create an evidence-acquisition obligation.

Dialogue overlays should:
- appear without hiding the tablet's essential current state;
- preserve the speaker's identity and, where appropriate, their position in the scene;
- avoid turning every spoken line into a clickable choice;
- allow the player to continue the administrative task when a line is ambient;
- make an actual decision point clear when a response is required;
- never promote testimony or allegation into objective evidence merely because it appeared in dialogue.

The PC is not automatically responsible for interviewing witnesses, investigating a work site, determining intent, recovering goods, assigning blame, or authorizing a follow-up. Those are separate duties unless the assignment explicitly and credibly grants them.

## 7. Personal seal and historical representation

The PC should have a distinctive personal seal whose design can be recognized across their career. The design may be informed by professional context, affiliation, personal history, or authored character choices.

Historical research must determine:
- whether the seal is a cylinder seal, stamp seal, or another form in the specific period/context;
- whether a personal, institutional, or process-associated impression is appropriate for this record;
- what the impression can legitimately establish;
- whether the PC plausibly possesses and may use it at this career stage.

Do not treat a seal as a modern signature by default. An impression may relate to identity, institution, custody, access, authorization, or process depending on context. Do not imply that every scribe had an individually owned seal or that every tablet was sealed.

The game's **Seal** command is the player-facing verb for committing the transaction. The physical impression is a separate historical/material presentation decision governed by the particular record type.

## 8. Script and sign rendering

Do not rely on the player's operating-system fonts or browser support for ancient Unicode characters.

The proposed approach is a game-owned asset library:
- verified graphical assets for the exact signs and numerical notations needed by authored Era I content;
- deterministic placement and scaling on the tablet surface;
- consistent rendering independent of installed fonts;
- modern-language explanatory labels outside the clay artifact;
- historical source and confidence metadata maintained with the authored asset/content package.

Until a sign or numerical notation is verified for the intended period, commodity, and metrological system, use a clearly identified development placeholder in internal prototypes. Do not ship decorative pseudo-signs as if they were historical writing.

The player should not need to know the full sign inventory. Teach only the small working repertoire required by the current task.

## 9. Error, correction, and commitment behavior

The player must be allowed to make an incorrect or incomplete entry where the gameplay calls for meaningful judgment. The design should not turn every input into a pre-validated multiple-choice answer.

The detailed correction model remains OPEN. Historical Research must first determine what correction or cancellation practices are appropriate to the selected tablet type and stage of clay. The interface must then distinguish:
- an uncommitted draft entry that can be changed;
- a correction made to the physical record;
- an omission or unsupported assertion that remains in the sealed record;
- a later amendment or supplementary record, if the scenario supports one.

After sealing, the original committed record must not be silently rewritten. Any later correction should preserve the fact that a prior record existed and that a subsequent action changed or supplemented it.

## 10. Interaction sequence for the Eanna prototype

This is a proposed high-level sequence, not a final Assignment script:

1. **Open workspace:** The tablet is visible. The PC has access to the separate household counts and understands the administrative purpose.
2. **Enter source counts:** The player selects a category and quantity from the source material. Each committed entry produces visible marks on the tablet.
3. **Review entries:** The player inspects the developing record and the current consolidation. Dialogue may occur over the tablet.
4. **Resolve shortfall, if present:** The player chooses the allocation or other permitted administrative treatment. The tablet receives the corresponding concise entry.
5. **Review and Seal:** The player inspects the final artifact and deliberately seals the transaction.
6. **Outcome:** The record is committed. The interface communicates what was recorded and what remains physically or institutionally unresolved.

The sequence should remain compact. It must not grow into an investigation or multi-page legal report.

## 11. UX and accessibility requirements

- The tablet remains visible during dialogue and entry actions.
- Dialogue overlays must not obscure the active entry area, essential quantities, or the Seal action.
- Every mark-entry action has a clearly labeled equivalent control; do not require mouse drawing or precision dragging.
- Keyboard and non-pointer input must be able to select categories, enter quantities, review the tablet, and seal the transaction.
- Mark meaning must be available through text labels, focus/hover descriptions, or another accessible inspection method. Color alone must not carry meaning.
- Screen-reader and accessible-name support must describe the administrative entry and its quantity without pretending that the ancient sign itself is spoken language.
- Reduced-motion settings must not remove state clarity. Stylus and seal animations may be simplified while preserving the visible result.
- Dialogue must be readable and dismissible/advanceable through accessible controls.
- The player must be able to inspect the current tablet state before committing.
- The interface must clearly distinguish draft, corrected, and sealed states.

## 12. Acceptance criteria for a future implementation specification

A later implementation-ready specification must demonstrate:

1. The tablet remains the primary visible workspace throughout the interaction.
2. Player entry actions cause corresponding marks to appear on the clay surface.
3. The same authored data renders consistently regardless of installed fonts.
4. Commodity/category and quantity interpretation use the authored, historically validated numerical system.
5. Dialogue overlays do not replace the workspace or force ambient dialogue into mandatory choices.
6. Testimony, assurances, allegations, and physical counts remain distinct in both presentation and resulting records.
7. A shortage does not automatically produce a guilt or misconduct conclusion.
8. A verbal assurance/carry-forward can change administrative treatment without changing physical inventory.
9. The player explicitly invokes Seal to commit and close the transaction.
10. Sealing does not imply that the record is objectively true or that all world consequences are resolved.
11. A sealed record is not silently editable; any supported later correction preserves the earlier record.
12. Keyboard, screen-reader, reduced-motion, and non-color-dependent interaction remain usable.
13. The artifact contains no ordinary prose or modern legal clauses presented as Uruk IV writing.
14. No unverified sign, number, unit, seal function, or tablet layout is presented as historical fact.

These are design acceptance targets only. They do not authorize production implementation.

## 13. Historical research required before content lock

Historical Research should produce a concise claim ledger for this artifact covering:

- the intended date range and relevant Uruk IV/III tablet corpus;
- whether the specific commodity and household categories selected for the scenario are attested in comparable administrative contexts;
- the appropriate numerical/metrological system for every quantity;
- the signs and sign variants required for the authored entries;
- whether the proposed obverse/reverse organization has appropriate period parallels;
- whether a consolidated summary of separate household counts is a defensible reconstruction;
- the material and working state of the clay during entry;
- plausible stylus and mark-making behavior;
- correction/erasure/revision practices for the relevant tablet type;
- whether and how a personal seal impression belongs on this record;
- what the seal could identify or authorize in the authored institutional context.

Use the existing historical audit and responsibility matrix as constraints, not as substitutes for this artifact-specific research. Label every substantive claim ATTESTED, INFERRED, RECONSTRUCTION, or UNSUPPORTED. Remove or revise unsupported claims rather than disguising them as interface flavor.

## 14. Cross-department impact

- **Game Design:** Define the Eanna task, source counts, allocation decision, authority boundaries, and consequences. Keep the activity a professional administrative task.
- **Historical Research:** Validate the exact tablet content, numerical systems, layout, corrections, stylus, and seal use.
- **Engineering & Architecture:** After design approval, assess a persistent tablet surface, deterministic mark placement, entry state, correction history, and committed/sealed state. Production owns all technical contracts and persistence design.
- **Art & UI/UX:** Develop a readable clay surface, marks, stylus actions, dialogue overlays, reverse-face interaction, and personal-seal presentation. Use the existing Era I visual language and accessibility requirements.
- **Audio:** Optional, semantically triggered stylus and seal feedback may support the physical action; visual state changes remain mandatory. No new audio system is required.
- **Production & QA:** No implementation authorized by this proposal. Later QA must test historical content boundaries, deterministic rendering, corrections, commit behavior, and accessible operation.

## 15. Outstanding Game Director decisions

The following remain OPEN and require owner review:

1. Approve or revise the proposed one-tablet obverse/source-entry and reverse/consolidation layout.
2. Confirm whether the shortfall allocation is always entered on the reverse or placed in a distinct closing area determined by historical research.
3. Decide whether the personal seal should be selected/commissioned during character creation or received through an initial professional appointment. The historical and narrative implications should inform this choice.
4. Approve the correction model after historical research presents viable options.
5. Confirm whether the Eanna Consolidated Summary Tablet should be authored as an Assignment deliverable, a Work-stage artifact, or another already-approved activity context. Do not let the interface proposal silently decide the gameplay layer.

**Current recommendation:** Continue with the obverse/reverse concept as a prototype layout, but keep its historical status provisional. Do not lock exact signs, quantities, seal placement, or correction behavior yet.

## 16. Next action

Design HQ should prepare a visual/interaction wireframe using clearly marked placeholder assets, alongside a Historical Research brief for the exact tablet conventions. The wireframe must show the tablet as the persistent workspace, player-created marks, dialogue overlays, the reverse/consolidation view, the shortfall decision, and the final Seal action.

Only after the artifact's content and behavior are approved should Design HQ prepare the detailed behavioral contract and Production handoff. This document is PROPOSED and NOT READY FOR IMPLEMENTATION.
