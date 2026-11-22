# Scribe of Eras

A historical career RPG and administrative simulation about the people who record, preserve, organize, interpret, and circulate knowledge. The journey begins in Uruk around 3200 BCE.

## Design reference

**[Read the Game Design Document](docs/GDD.md)**

The GDD is the canonical design reference for this repository. The current application is a proof of concept; existing UI or code behavior should not be treated as approved design when it conflicts with the GDD. Deliberate design changes should be reflected in the GDD.

## Core design

- **Assignments / Commissions** are optional professional jobs that develop the player's career.
- **Skills, rank, and authority are distinct:** skills determine what a character is qualified to do, professional rank shapes the broad range of opportunities likely to reach them, and appointments grant formal authority. Rank is derived from the current character's own skills, not Career XP, and is not inherited by a successor. The exact rank formula and localized titles remain under design. The prototype still uses a legacy Career-XP-based rank calculation; that code is not the approved design and awaits the skill-to-rank formula and runtime skill model.
- **Challenges** are optional narrative scenarios. They may award Career XP and scenario-specific consequences, but never Historical Progress XP.
- **Works** are the historical progression layer: a varied portfolio of historically grounded undertakings, from smaller career-scale projects to larger authored milestone experiences. Some milestone Works may arrive as date-based invitations, with availability windows and access shaped by historical context and the character's circumstances. Missing or declining an invitation does not stop history; the required Works portfolio must provide a coherent progression route. Works are the sole ordinary source of Historical Progress XP.
- The player's personal economy has exactly two tracked resources: **money and provisions**. Money uses an era-appropriate currency name without conversion of the underlying value at era transitions; provisions represent food and sustenance. Other goods may appear in the world or inventory without becoming additional personal resource balances.
- The GDD specifies **six shared Action Points per Workday**, and the current application on `main` implements a six-AP daily budget. The active Storehouse component's AP charges and evidence-retrieval behavior have been checked against GDD §§7.5–7.6 and match. The separate JSON Work definition and `WorkRunner` remain disconnected and contain stale four-block/free-examination assumptions; they are not used by the running application.
- The design calls for immediate notifications, a persistent event log, and a selective **daily morning report** so players can follow consequential developments without monitoring every part of the world continuously. This is a design direction, not yet a runtime feature.
- The player, not an individual character, is the constant across the historical journey. When a character dies or leaves play, the player continues through another existing scribal NPC connected to that character and their professional world, in the same historical period. The new character may be a low-ranking or inexperienced scribe; no family heir or era restart is required.

## Project status

The Storehouse Reckoning is the first vertical slice and proof of concept. The next development phase is to replace the prototype shell with the production game architecture, mechanics, content model, and interface described by the GDD.

## Community and contributing

Outside contributions are welcome. Please read the project guidelines before opening an issue or pull request:

- [Contributing guide](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security policy](SECURITY.md)
- [Accessibility statement](ACCESSIBILITY.md)

Bug reports, accessibility barriers, documentation improvements, tests, historical research, and feature proposals are welcome. The Game Design Document remains the canonical authority for approved gameplay design.

**The project's original material is dedicated to the public domain under [CC0 1.0 Universal](LICENSE).** You may use, modify, redistribute, and build upon it for any purpose, including commercially, without asking permission or providing attribution. Third-party materials remain subject to their own rights and licenses; see [CONTRIBUTING.md](CONTRIBUTING.md) for contribution and scope details.

## Development

Requirements: Node.js 22 or compatible.

```bash
npm install
npm run dev
```

Create a production build with:

```bash
npm run build
```

GitHub Pages deployment is handled by the workflow in `.github/workflows/deploy.yml`.
