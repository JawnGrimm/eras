# Developer Workspace

This folder is a shared working space for the people and tools developing Scribe of Eras.

It is separate from the game itself. Nothing in this folder is gameplay content, player-facing documentation, application code, or a source of runtime data.

## How to use this space

- **[Team Communication Log](TEAM_LOG.md):** Add dated updates, questions, discussion topics, handoffs, and implementation notes.
- **[Performance Risks and Engineering Watchlist](PERFORMANCE_NOTES.md):** Track unverified scalability risks, measurement priorities, and data-preservation guardrails.
- **GitHub Issues:** Use issues for bugs, concrete tasks, and work that needs tracking or assignment.
- **Pull request discussions:** Keep code-specific review comments with the pull request they concern.
- **[Game Design Document](../docs/GDD.md):** This remains the canonical source for approved game design. A discussion note here does not change the GDD. Once a design decision is agreed, update the GDD as appropriate.

## Writing a team-log entry

Add new entries at the bottom of `TEAM_LOG.md`, using this format:

```md
## YYYY-MM-DD — Topic

**Contributor:** GitHub handle or name  
**Status:** Discussion / Proposal / Decision / Handoff

Brief context and current understanding.

**Questions or blockers**
- ...

**Next action**
- ...
```

Be clear about whether something is an idea, an open question, or an agreed decision. Link related issues, pull requests, commits, or GDD sections where useful.

## Visibility and confidentiality

The `JawnGrimm/eras` repository is public. Everything committed here is publicly readable and remains in the repository's Git history. This folder does not provide private or access-controlled communication.

Do not put passwords, API keys, tokens, private personal information, confidential material, or anything that should not be public in this folder. Use an appropriately private collaboration space for sensitive communication.

## Build and deployment separation

Changes limited to `dev/**` are excluded from the GitHub Pages workflow's push trigger. They do not build or deploy the game. The workflow can still be run manually through GitHub Actions.
