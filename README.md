# Scribe of Eras

A historical career RPG and administrative simulation about the people who record, preserve, organize, interpret, and circulate knowledge. The journey begins in Uruk around 3200 BCE.

## Design reference

**[Read the Game Design Document](docs/GDD.md)**

The GDD is the canonical design reference for this repository. The current application is a proof of concept; existing UI or code behavior should not be treated as approved design when it conflicts with the GDD. Deliberate design changes should be reflected in the GDD.

## Core design

- **Assignments / Commissions** are optional professional jobs that develop the player's career.
- **Challenges** are optional narrative scenarios. They may award Career XP and scenario-specific consequences, but never Historical Progress XP.
- **Works** are mandatory, substantial historical undertakings and the sole ordinary source of Historical Progress XP.
- The player's personal economy has exactly three resources: **silver, bread, and beer**. Grain is a world and institutional commodity, not a personal player resource.
- The prototype uses **six shared Action Points per Workday**. The Storehouse Reckoning action sequence is being aligned to the costed stages and validation requirements in GDD sections 7.5–7.6.

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
