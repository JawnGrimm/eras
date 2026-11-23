# Engineering and Production Documentation

This directory contains technical architecture notes, implementation contracts, QA/acceptance records, milestone plans, and dated development status.

These records explain how the approved game is built and verified. They do not independently approve design changes. When implementation and the [canonical GDD](../GDD.md) disagree, flag the discrepancy and resolve it deliberately; do not treat existing code as design authority.

## Current records

- [Implementation Status Snapshot](IMPLEMENTATION_STATUS.md) — dated implementation facts as of 22 November 2026. Verify against current code, tests, and deployment before relying on it.

## Technical boundaries

- Production code is TypeScript.
- The current production entry boundary is src/App.tsx, mounting ProductionApp and ProductionShell.
- The production save key is scribe_game_v2.
- Runtime generative AI must not create Assignments, validate records, or determine outcomes.

Detailed architecture, persistence, validation, test, and deployment contracts should be added here as their own focused documents when they become stable enough to serve as shared engineering references. Pull requests, issues, test output, and deployment workflows remain the authoritative evidence for the status of a particular implementation.
