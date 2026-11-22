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
- The GDD specifies **six shared Action Points per Workday**. The stabilization branch implements the six-AP daily budget; Work-action costs and evidence-retrieval steps are still being reconciled against the Storehouse Reckoning specification.
- The design calls for immediate notifications, a persistent event log, and a selective **daily morning report** so players can follow consequential developments without monitoring every part of the world continuously. This is a design direction, not yet a runtime feature.

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
