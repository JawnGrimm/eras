# GD-CLOSING-RECEIPT-001 — Assignment & Challenge Closing Receipt

**Status:** APPROVED — READY FOR IMPLEMENTATION  
**Scope:** Paired follow-up slice after the Issue #85 Assignment runner is playable  
**Owners:** Game Design; Engineering & Architecture; Production/QA  
**Authority:** Game Director approval recorded 24 Nov 2026  
**GDD alignment:** §3.5 Tone; §6 opportunity/activity structure; preserve the Event / Record / Knowledge distinction and the separation of Career XP, Professional Reputation, Institutional Standing, and relationships.

## 1. Objective and sequencing

Give Assignment submissions and Challenge resolutions a consequential, player-paced disposition. The player must see what was decided, who received the work, how the work was assessed, and what actually changed.

This is a separate, paired follow-up slice. It must not block PR #90, the two Issue #85 Assignment UI corrections, the Assignment/Anchor runner, or Evening Interlude work. Implement after the current Assignment runner is integrated enough to exercise real submissions. Reuse one receipt presentation contract across Assignment and Challenge paths, but retain their different evaluation inputs.

## 2. Approved design rules

1. Evaluation categories are **Thorough**, **Defensible**, **Incomplete**, and **Overreached**. **Overreached takes precedence over Incomplete.**
2. Contracted Assignment Currency and Provisions remain payable when work is filed, regardless of assessment.
3. Career XP, Judgment, Institutional Standing, and relevant NPC Trust/Respect reflect quality.
4. The receipt remains visible until the player explicitly chooses its return action. No timed dismissal or automatic navigation.
5. NPC reaction is authored, in voice, and responsive to the actual report/choice and assessment. Each scenario/choice authors category-specific reaction copy and may use only safe, authored substitutions for the selected finding, responsibility label, or choice label; no runtime generative text. Do not invent a receiving NPC: use an institutional filing response where no person is established.
6. Display actual deltas, not generic success copy. Show only relevant dimensions; unchanged relationship dimensions may be shown as zero only if the receipt layout clearly distinguishes “unchanged” from an omitted/untracked relationship.
7. Apply consequences once. Existing scenario-specific quality deltas must be migrated into, or reconciled with, the evaluation result—not stacked on top of it.

## 3. Assignment evidence and evaluation

### 3.1 Structured limitations

Replace the graded freeform Limitations textarea with scenario-authored selectable limitation options. Each option has a stable ID and player-facing label. Optional free-text notes may remain available but are explicitly **not graded**.

Compatibility requirements:
- Do not reinterpret legacy free-text limitation strings as selected options.
- Preserve legacy notes for display/record provenance; they must not satisfy a required limitation.
- New evaluation reads selected option IDs only.
- Record the selected option labels and optional note as report content. Keep system-generated mandatory caveats distinguishable from player-selected limitations.
- An empty submission cannot receive Thorough or Defensible merely because the engine appends automatic caveats.

Production owns the exact v3-compatible field representation. Prefer optional additive fields on the existing Assignment draft/progress; no schema-version change or migration that fabricates player choices.

### 3.2 Scenario-authored rubric

Each Assignment definition must author:
- required evidence IDs for a minimally defensible report;
- required selectable limitation IDs for a minimally defensible report;
- relevant/optional evidence and applicable limitation IDs used to distinguish Thorough from Defensible;
- unsupported-claim / unsupported-responsibility predicates, including scenario-specific conditions;
- the actual receiving person, if any, and authored disposition reactions.

Assessment:
- **Overreached:** any authored unsupported-claim or unsupported-blame predicate is true, regardless of completeness.
- **Incomplete:** no overreach, but one or more required evidence citations or required limitation selections are missing.
- **Defensible:** minimum evidence and limitation requirements are met; no overreach.
- **Thorough:** defensible requirements are met and all relevant, applicable evidence/limitations defined by the scenario are addressed.

Rubrics must allow multiple defensible findings where evidence supports them. Do not grade free-text notes, verbosity, writing style, or arbitrary phrase matching. Do not equate discrepancy with wrongdoing. Scenario authors own the evidence and limitation IDs; no universal checklist.

## 4. Challenge evaluation

Challenge choices are authored actions, not freeform reports. Each choice must author its evaluation category and concise rationale; the category is not inferred from prose or generated at runtime. The chosen outcome's authored consequences remain authoritative. Apply the same receipt and visible-delta contract, while preserving choice-specific world consequences and any non-evaluation relationship effects. If a choice awards Career XP, treat its authored amount as the base reward and apply the category multiplier in §5. Challenge choices do not receive Assignment contract pay unless the authored choice explicitly defines a separate contract.

For the evaluated recipient, do not double-apply Trust/Respect: the category schedule below is the single quality-related adjustment. If a Challenge has no career-XP reward or no relevant recipient/institution, omit those dimensions. Challenge choices do not inherit Assignment citation/limitation requirements.

## 5. Approved Playtest 1 scaling schedule

The Game Director ratified this schedule on 24 Nov 2026 for Playtest 1. The Career XP multiplier applies to the authored base Career XP reward on either an Assignment or Challenge outcome, when one exists; round to the nearest integer. Contracted Currency/Provisions are never multiplied or withheld.

| Assessment | Career XP multiplier | Judgment | Institutional Standing | Recipient Trust | Recipient Respect |
|---|---:|---:|---:|---:|---:|
| Thorough | 1.00× | +3 | +1 | +2 | +1 |
| Defensible | 0.75× | +2 | +1 | +1 | +1 |
| Incomplete | 0.50× | 0 | 0 | 0 | 0 |
| Overreached | 0.25× | -4 | -2 | -4 | -3 |

Application rules:
- Clamp Judgment, Standing, Trust, and Respect to their existing valid bounds.
- Standing applies only to the commissioning/receiving institution.
- Trust/Respect apply to the actual receiving NPC's directional relationship toward the player character. Do not change the player's reverse perspective unless a separate authored consequence explicitly requires it.
- If no receiver exists, omit Trust/Respect and use an institutional disposition.
- Preserve unrelated authored consequences. The table replaces existing quality-related deltas for the same outcome; it is not an additive bonus.
- Contracted Currency/Provisions settle exactly as offered on filed Assignment work, even when Incomplete or Overreached.
- These are approved Playtest 1 values; subsequent balance changes require Game Director approval.

## 6. Closing Receipt and persistence

The receipt shows:
- Assignment/Challenge title and disposition;
- assessment category and concise scenario-authored rationale;
- authored NPC handoff reaction, or institutional filing response;
- actual Currency, Provisions, Career XP, Judgment, Institutional Standing, Trust, and Respect deltas where applicable;
- SealImpression for the completed docket;
- one explicit return action: **Return to Workday / Assignment Board** for Assignments, and the appropriate Workday/Challenge Journal destination for Challenges.

Persist enough receipt data to restore the exact screen after reload. Receipt payload and pending/acknowledged state on completed Assignment outcomes/offers and Challenge outcomes must remain OPTIONAL in Schema v3. Completed records created before this slice ships, and any other completed records lacking receipt fields, must continue to pass validation and restore normally; absence of receipt state must not synthesize a receipt or retroactively trigger one. Completion, consequence application, and pending-receipt creation must be atomic for new completions. Return marks the receipt acknowledged; it does not reapply rewards or consequences.

**Schema constraint:** remain compatible with the approved Schema v3 envelope. No schema-version bump. No parallel save slot. Receipt fields remain optional for every completed Assignment and Challenge record. Existing v3 saves and completed records lacking receipt fields must validate and restore; absence means no pending receipt, not a migration error or retroactive receipt. Do not synthesize receipts for historical completed work. Production owns exact types, serialization, validation, and state transition APIs.

## 7. Acceptance and QA

- Selectable limitation options are authored per Assignment; free-text notes never affect assessment.
- Legacy free-text limitation data remains visible/preserved and does not count as selected structured limitations.
- Empty report with missing required citations/limitations is Incomplete, not Thorough/Defensible, and cannot receive the full Career XP reward.
- Unsupported blame/claim is Overreached even if every required citation/limitation is selected.
- Multiple scenario-supported conclusions can receive Defensible/Thorough.
- Contracted Currency/Provisions are paid exactly once at full authored amount for all four categories.
- XP and reputation/relationship deltas match the approved schedule and clamp rules.
- NPC reaction matches the actual receiver and submitted claim; no invented actor or runtime-generated prose.
- Challenge choice category/rationale and authored consequences are shown; no Assignment rubric is imposed on Challenge choices.
- Reload while a receipt is pending restores the same receipt; repeated submission/resolve/return cannot duplicate any reward or consequence.
- Return action reaches the correct destination and marks the receipt acknowledged.
- Regression tests cover all four categories, empty report, missing evidence, missing limitation, overreach precedence, legacy drafts, absent recipient, Challenge choice, reload, duplicate actions, and succession/assignee attribution.

## 8. Exclusions

No schema-v4 work; no grading of free-text prose; no AI-generated evaluation or NPC dialogue; no withholding contracted pay; no redesign of Assignment/Challenge generation, AP, economy, Workday, or historical evidence; no generic universal rubric; no new relationship dimensions.

## 9. Approval and implementation authorization

The Game Director approved the four-category model, Overreached precedence, structured-limitations guardrail, contracted-pay principle, Schema v3 compatibility constraint, and the complete numeric schedule in §5 on 24 Nov 2026. This specification is **APPROVED — READY FOR IMPLEMENTATION** for the paired follow-up slice. Production must preserve optional receipt fields and the legacy completed-record behavior stated in §6.
