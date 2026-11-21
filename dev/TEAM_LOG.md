# Team Communication Log

Use this file for asynchronous developer communication: progress updates, questions, proposals, handoffs, and discussion that does not belong in a code review or GitHub issue.

Append new entries at the bottom. Use the template in [the workspace guide](README.md). Keep the status explicit:

- **Discussion** — an open conversation; nothing has been decided.
- **Proposal** — a suggested approach awaiting review.
- **Decision** — an agreed direction. Update the relevant canonical documentation, especially `docs/GDD.md`, when the decision changes approved game design.
- **Handoff** — context and next steps for another contributor.

---

## 2026-11-21 — Developer workspace established

**Status:** Handoff

The `dev/` folder is now the shared repository space for developer notes and asynchronous communication. It is not part of the game or its runtime content. Changes confined to this folder are excluded from the GitHub Pages deployment trigger.

The repository is public, so entries here must be suitable for public viewing. Do not record secrets or confidential information.

## 2026-11-21 — Day model and Work framework: two designs need reconciling

**Contributor:** Claude (AI)  
**Status:** Discussion

I read `main` at `24535d6` and found three different descriptions of the Workday. These are observations from reading the code and docs; I have not run the game.

1. `docs/GDD.md` (v1.2) specifies six shared Action Points, plus an end-of-day overtime rule (one extra AP, +5 stress, five AP the next day).
2. `src/content/works/storehouse_reckoning.json` has `schema_version: "0.2"`, `config.blocks_per_day: 4`, and `block_cost` on its actions and evidence.
3. `src/types.ts` and `src/App.tsx` count up to six units in `blocksRemaining` (commented as Action Points). The type comments also say reading held evidence costs 0.

Separately, the owner's first playtest found that six AP was too small to finish a first assignment, which was the original reason to rethink the daily clock.

**A model I have drafted, for comparison (a proposal, not a decision)**
- A day has four time blocks (morning, midday, afternoon, evening).
- Thinking is free: rereading held evidence, comparing, drafting, auditing one's own entry, deciding.
- Visits and physical work take blocks, and each person is only available in certain blocks.
- Some evidence arrives after a delay; working late adds a block tonight and costs the next morning's first block.
- On the Storehouse Reckoning my scheduler finds the fastest valid run takes 11 blocks of visits over five days, leaving most days with free blocks. All costs and availability are untested guesses.

I also built a Python validator and a schema (`design_choices`, `cases`, `deliverable`, plus golden solution records). Chad's content JSON uses very similar names, so we may already agree on the shape.

**Questions for Chad**
- Is `blocks_per_day: 4` in the content JSON intentional, or left over from an earlier model?
- What has actually been run for the current engine and Work: build only, type-check, tests, or manual play?
- What do `deliverable.provenance_rules` check today, and where do the check results live?
- Would you want shared golden records (a correct record, an unsourced one, a blamed-carrier one, and so on) that both the TypeScript engine and a Python validator must agree on?

**Decisions needed from the owner**
- Which day model is canonical: six AP with overtime, or four time blocks with free thinking?
- Whose framework schema the Works should build on.

**Next action**
- Until the day model is decided, nobody edits the Workday sections of `docs/GDD.md`.
- Chad: reply to the questions above.
- Claude: if the owner approves, offer my GDD v1.3 draft, schema, validator, and playtest script as a pull request for review, not as a change to `docs/GDD.md`.
