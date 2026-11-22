# Contributing to Scribe of Eras

Thank you for considering a contribution. Scribe of Eras is actively open to outside contributions, including bug fixes, tests, documentation, accessibility improvements, historical research, and carefully scoped feature work.

Please read this guide before opening a pull request.

## Start with the project design

- The canonical Game Design Document is [docs/GDD.md](docs/GDD.md).
- The current code is the authority for what is implemented; the GDD is the authority for approved design.
- The Storehouse Reckoning is a proof of concept, not the complete game or a universal template for every future Work.
- If implementation and the GDD disagree, don't assume the implementation is intentional. Raise the discrepancy and follow the GDD unless the project owner approves a design change.
- A proposed gameplay or systems change that alters approved design should include the corresponding GDD update. Discussion in developer notes alone does not approve a design change.

Before substantial work, search existing issues and pull requests. For a large feature, architectural change, or design change, open an issue first so the scope and approach can be discussed before time is spent implementing it.

## Ways to contribute

Contributions are welcome in areas such as:

- Reproducing and fixing bugs.
- Improving automated tests and validation.
- Improving accessibility, usability, and responsive behavior.
- Clarifying documentation and developer workflows.
- Historical research, source notes, and corrections.
- Implementing approved gameplay and technical designs.
- Proposing new mechanics or revisions to existing design.

Historical claims should include credible sources where practical. Distinguish primary evidence, scholarly interpretation, and speculation. Do not present uncertain reconstructions as established fact.

## Development workflow

1. Fork the repository and create a focused branch from `main`.
2. Install dependencies with `npm install`.
3. Make a focused change that preserves unrelated working behavior.
4. Add or update tests for changed behavior where appropriate.
5. Run the relevant checks:
   - `npm run lint` — TypeScript check (`tsc --noEmit`).
   - `npm test` — automated Vitest suite.
   - `npm run build` — Vite production build.
6. Open a pull request against `main`, describing the change and its verification.

Do not claim a check passed unless you ran it and observed the result. If you cannot run a check, say so in the pull request.

## Design and implementation expectations

- Prefer small, integrated changes over broad rewrites.
- Avoid placeholder systems, disconnected demonstrations, and UI that implies mechanics which do not actually work.
- Preserve the distinction between Assignments / Commissions, Challenges, and mandatory Works.
- Do not introduce new player-wallet resources or change progression rules without checking the GDD.
- Keep historical evidence, interpretation, judgment, and later assessment distinct.
- Preserve provenance and uncertainty in historical records.
- Do not add runtime generative-AI behavior; the approved design prohibits it.
- Treat people, relationships, institutions, and locations as meaningful systems rather than decorative text.
- Keep data validation and save compatibility in mind when changing persistent state.

If you find a conflict between requirements, code, or existing documentation, describe it in the issue or pull request rather than silently choosing a direction.

## Pull requests

A useful pull request should include:

- The problem being solved and why it matters.
- A concise description of the implementation.
- Relevant issue links.
- Any GDD sections affected and whether the GDD was updated.
- Tests and checks run, with results.
- Screenshots or a short recording for meaningful UI changes.
- Known limitations, migration concerns, and follow-up work.

Keep pull requests focused. Maintainers may ask for revisions, request that a change be split, or decline work that conflicts with approved design or project direction.

## Issues and discussion

Use the issue templates for bug reports and feature or design proposals. For questions or uncertain ideas, explain the problem and context before prescribing a solution. Please don't use issues to report security vulnerabilities; follow [SECURITY.md](SECURITY.md).

## Licensing

The repository's license has not yet been selected. Until a license is added, the project remains subject to applicable default copyright rules; public availability does not itself grant permission to reuse, redistribute, or modify its contents. Please do not assume that code, writing, art, or other assets are open-licensed. The project owner will clarify licensing before accepting contributions under a chosen license.
