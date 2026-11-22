# Scribe of Eras

A historical career RPG and administrative simulation about the people who record, preserve, organize, interpret, and circulate knowledge. The journey begins in Uruk around 3200 BCE.

## Design reference

**[Read the Game Design Document](docs/GDD.md)**

The GDD is the canonical design reference for this repository. The current application is a proof of concept; existing UI or code behavior should not be treated as approved design when it conflicts with the GDD. Deliberate design changes should be reflected in the GDD.

## Core design

- **Assignments / Commissions** are optional professional jobs that develop the player's career.
- **Challenges** are optional narrative scenarios. They may award Career XP and scenario-specific consequences, but never Historical Progress XP.
- **Works** are mandatory, substantial historical undertakings and the sole ordinary source of Historical Progress XP.
- The player's personal economy has exactly two tracked resources: **money and provisions**. Money uses an era-appropriate currency name without conversion of the underlying value at era transitions; provisions represent food and sustenance. Other goods may appear in the world or inventory without becoming additional personal resource balances.
- The GDD specifies **six shared Action Points per Workday**, and the current application on `main` implements a six-AP daily budget. The active Storehouse component's AP charges and evidence-retrieval behavior have been checked against GDD §§7.5–7.6 and match. The separate JSON Work definition and `WorkRunner` remain disconnected and contain stale four-block/free-examination assumptions; they are not used by the running application.
- The design calls for immediate notifications, a persistent event log, and a selective **daily morning report** so players can follow consequential developments without monitoring every part of the world continuously. This is a design direction, not yet a runtime feature.
- Generational continuity proceeds through existing scribal NPCs connected to the current character and their profession. The player chooses among eligible candidates, subject to their circumstances and availability; if no eligible successor is available, a new character begins at the start of the current era. How this restart affects the era calendar, Works, and wider world state remains to be designed. The family desk is not automatically transferred to a non-family successor.

## Project status

The Storehouse Reckoning is the first vertical slice and proof of concept. The next development phase is to replace the prototype shell with the production game architecture, mechanics, content model, and interface described by the GDD.

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
