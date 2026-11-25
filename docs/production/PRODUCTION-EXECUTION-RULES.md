# Production Execution Rules

**Authority:** Game Director directive, 24 November 2026.  
**Purpose:** Prevent approved work from stalling in repeated handoffs and reviews.

## 1. Build authority

- An approved behavioral contract marked **READY FOR IMPLEMENTATION** authorizes Production to implement it. No second implementation authorization is required.
- Approval of a behavioral contract also authorizes the technical investigation needed to implement it. Once the contract is sufficiently determinate, Production must proceed; it must not return routine technical choices as approval questions.
- Production owns routine implementation decisions: types, module placement, APIs, serialization, schema versions, migrations, validation, tests, refactoring, and integration, provided approved behavior and compatibility requirements are preserved.
- A documented migration, rollback plan, and automated compatibility tests are part of implementation—not reasons to pause for another approval.
- Existing approved specifications and prior reviews remain valid. Do not repeat audits, design reviews, or approval requests unless new evidence identifies a concrete defect or conflict.

## 2. Stop only for real blockers

Escalate to the Game Director only when:
- implementation requires changing approved behavior, scope, balance, or a locked decision;
- authoritative sources conflict and the conflict cannot be resolved by the authority hierarchy;
- a destructive or irreversible data decision has no safe, testable compatibility path;
- a required player judgment cannot be automated and needs playtesting; or
- access, tooling, or an external dependency makes progress genuinely impossible.

Do not escalate ordinary engineering choices, incomplete report formatting, speculative future concerns, or questions already answered by an approved contract.

When blocked, state the exact decision or player action needed in one short question. Continue all independent work.

## 3. Backlog and branch discipline

- Work from the live repository, current main, approved specifications, and actual open PRs—not stale status prose.
- Inspect all open PRs and branches before creating another. Prefer finishing, rebasing, consolidating, or closing existing work over opening another branch.
- Keep one active implementation branch per coherent feature where practical. Do not create documentation-only PRs for routine status narration.
- Prioritize mergeable, tested work. Resolve conflicts, address CI failures, and merge completed work when repository policy and checks permit.
- Do not leave a completed task waiting for another Design HQ review when its requirements are already approved.

## 4. Test-and-integrate default

- Run the repository's relevant tests, type checks, build, and static analysis as part of the task.
- Add regression tests with behavior changes. Fix failures rather than reporting them as future work.
- Use CI when local execution is unavailable; report the exact commit and actual run results.
- After merging, verify the merge commit and required checks. Deployment and manual playtesting are separate only when they are genuinely required.
- Never claim a test, merge, deployment, or playtest that did not occur.

## 5. Reporting

Default update: **what changed; exact commit/PR; tests actually run; what remains; only the decision or playtest needed from the Game Director.**

Keep routine reports short. Do not produce long handoff documents when a concise task instruction is sufficient. Do not ask the Game Director to repeat or reapprove an existing decision.

## 6. Design integrity

This policy does not authorize silent design changes. The GDD and explicit Game Director decisions remain authoritative. Production must preserve approved behavior, identify genuine conflicts, and document material deviations. Design HQ reviews new design decisions—not routine implementation.