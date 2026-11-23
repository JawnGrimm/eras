# Design Documentation Guide

This directory contains supporting design specifications subordinate to the [canonical Game Design Document](../GDD.md).

## Authority hierarchy

1. **Canonical GDD — docs/GDD.md:** game identity, pillars, approved principles, locked gameplay boundaries, and exclusions.
2. **System specifications — docs/design/:** detailed rules and contracts for individual systems. They may explain the GDD but cannot contradict it.
3. **Historical and content specifications — docs/content/:** era-specific evidence, institutional models, authored characters, scenarios, and content quality standards.
4. **Engineering and production — docs/production/ and dev/:** implementation contracts, architecture, QA, tests, milestones, and dated development status. Implementation facts do not approve design changes.
5. **Decision Register:** owner-approved decisions and their maturity.
6. **Open Design Register:** unresolved questions, dependencies, recommendations, and milestone priority.

## System specifications

- [Character and Career Specification](CHARACTER_AND_CAREER_SPEC.md) — character foundations, career progression, continuity, and equipment.
- [Activity, Work, and Evaluation Specification](ACTIVITY_AND_WORK_SPEC.md) — tutorial, Assignments, document construction/evaluation, and Works.
- [People, Institutions, and World Simulation Specification](WORLD_SIMULATION_SPEC.md) — NPC agency, relationships, institutions, and world advancement.
- [Economy, Stress, and Ethical Consequences Specification](ECONOMY_AND_CONSEQUENCES_SPEC.md) — personal economy, hardship, stress, trust, and ethical choices.
- [Progression Pacing Specification](PROGRESSION_AND_PACING_SPEC.md) — pacing and player-experience principles.
- [Interface, Audio, and Accessibility Specification](INTERFACE_AUDIO_ACCESSIBILITY_SPEC.md) — presentation, feedback, audio, and accessibility.
- [Content and Scenario Quality Standards](../content/CONTENT_AND_SCENARIO_STANDARDS.md) — authored content quality requirements.

## Historical and content documentation

- [Historical and Content Documentation](../content/README.md) — Era I research, content-authoring proposals, and promotion rules.

## Engineering and production

- [Engineering and Production Documentation](../production/README.md) — technical boundaries, implementation contracts, QA, and production records.

## Governance

- [Decision Register](DECISION_REGISTER.md) — approved decisions and maturity.
- [Open Design Register](OPEN_DESIGN_REGISTER.md) — all unresolved design work and current milestone triage.
- [Implementation Status](../production/IMPLEMENTATION_STATUS.md) — dated implementation snapshot, not design authority.

## Rules for contributors and agents

- Label content as **LOCKED**, **APPROVED PRINCIPLE**, **PROVISIONAL**, **OPEN**, or **IMPLEMENTATION FACT** where maturity could be confused.
- Do not promote a proposal, code behavior, passing test, or merge into an approved design decision without explicit owner approval.
- Do not defer analysis merely because an item is open. Investigate and recommend; distinguish that work from owner approval.
- Use the milestone filter to avoid making future-game completeness a prerequisite for the current Era I task.
- When a supporting specification conflicts with the GDD, stop and resolve the conflict; do not choose whichever document is more detailed.
