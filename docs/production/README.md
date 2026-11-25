# Engineering and Production Documentation

This directory contains technical architecture notes, implementation contracts, QA/acceptance records, milestone plans, and dated development status.

These records explain how the approved game is built and verified. They do not independently approve design changes. When implementation and the [canonical GDD](../GDD.md) disagree, flag the discrepancy and resolve it deliberately; do not treat existing code as design authority.

## Current records

- [Production Execution Rules](PRODUCTION-EXECUTION-RULES.md) — build authority, escalation boundaries, branch discipline, test-and-integrate expectations, and concise reporting.

- [Work Contribution Behavior Specification](WORK_CONTRIBUTION_BEHAVIOR_SPEC.md) — observable engineering requirements and acceptance scenarios for the owner-accepted contribution framework. This is not a schema or implementation decision.
- [Work Contribution Architecture Decision](WORK_CONTRIBUTION_ARCHITECTURE_DECISION.md) — records the approved separate undertaking-owned ledger principle and compares it against the alternative; final schema and implementation details remain open.
- [Work Contribution Step 1 Proposal](WORK_CONTRIBUTION_STEP_1_PROPOSAL.md) — proposed concrete identity/ledger types, registration transition, validation, save/restore behavior, migration alternatives, and acceptance tests; owner review pending, no runtime code.
- [Implementation Status Snapshot](IMPLEMENTATION_STATUS.md) — dated implementation facts as of 22 November 2026. Verify against current code, tests, and deployment before relying on it.

## Technical boundaries

- Production code is TypeScript.
- The current production entry boundary is src/App.tsx, mounting ProductionApp and ProductionShell.
- The production save key is scribe_game_v2.
- Runtime generative AI must not create Assignments, validate records, or determine outcomes.

Pull requests, issues, test output, and deployment workflows remain the authoritative evidence for the status of a particular implementation.
