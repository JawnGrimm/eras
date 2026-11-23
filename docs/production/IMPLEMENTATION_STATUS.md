# Implementation Status Snapshot

**Snapshot date:** 22 November 2026  
**Classification:** IMPLEMENTATION FACTS — not design authority.  
**Canonical design authority:** [Game Design Document](../GDD.md).

This document preserves the implementation-status note formerly embedded in the GDD. It is a dated snapshot, not a guarantee that every detail remains current. Verify against the repository, tests, and deployment before relying on it for a new implementation task.

**Implementation status (22 November 2026):** the production application is mounted from `src/App.tsx` through `ProductionApp` and `ProductionShell`. The Storehouse Reckoning is registered through the existing `works.progress` container with `kind: 'tutorial'`; completion awards no Historical Progress XP, does not enter `completedWorks`, grants no provisions contract, and retires its Temple Storehouse active matter. Existing v2 saves are normalized to remove the former 15,000 tutorial XP credit and correct stale Era I display dates; the save schema remains v2, and persisted tutorial provision-contract snapshots are ignored during settlement. P3 personal hardship and recovery is implemented: from the third consecutive Workday without provisions, the character gains +2 Stress per affected Workday, up to 10 cumulative shortage-attributed Stress per character, and the recoverable Underfed condition. Recovery routes are Temple Storehouse Auxiliary Labor (2 AP for +1 provision, once per Workday, with no money or Career XP) and an eligible Ur-gir advance (1 AP for +1 provision, creating a persistent obligation with silver repayment or a day of scribal assistance as alternatives). The advance requires Ur-gir to be alive, have provisions to spare, trust of at least 50, and no resentment toward the character; only one outstanding Ur-gir obligation is allowed. The obligation's eventual fulfillment interaction remains open design work. P2-2 also registers three recurring Uruk Assignment activities, a deterministic Assignment generator, two one-shot optional Challenge scenarios, and a character-situated Morning Report generated during daily settlement. The current runtime wallet stores money and provisions, matching the approved two-resource model. Era-specific names, denominations, and visual presentation may be reskinned as the setting changes; the underlying balances carry forward unchanged. The former prototype UI, the listed legacy state/data/engine modules, the disconnected `WorkRunner`, and the stale `src/content/works/storehouse_reckoning.json` definition have been retired. The production save uses only `scribe_game_v2`; legacy `scribe_*` keys are neither migrated nor deleted. This note describes implementation status, not a change to the approved six-AP rule.

## Current design-development baseline

- PR #56 persistence work merged as adecd6b.
- PR #57 staged scribal identity boundary merged as 001c148.
- The next character-history resolver step is blocked on authored Era I mappings recorded in the [Open Design Register](../design/OPEN_DESIGN_REGISTER.md).
- Later repository commits supersede this snapshot where implementation has changed.

Implementation facts do not amend the GDD. A code change that alters approved behavior requires owner review and, if approved, an explicit design-document update.
