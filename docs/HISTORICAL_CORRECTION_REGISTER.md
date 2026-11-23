# Historical Correction Register

**Status:** Planning register; no corrections in this document are implemented by virtue of being listed here.  
**Authority:** The canonical design authority remains [`docs/GDD.md`](GDD.md). This register organizes findings from the Staff Historian Assessment and Liberty Framework for Scribe of Eras.  
**Scope rule:** Historical corrections are to be delivered as focused content/documentation changes after the active institutional-lifecycle work reaches its planned integration point. This register does not authorize a broad rewrite or changes to active systems.

## Triage standard

- **P0 — Era I vertical-slice accuracy:** Clear, avoidable period mismatches in the current Uruk setting; address first, in a bounded correction pass.
- **P1 — Era I systems-facing historical detail:** Economy terminology and metrology. Requires careful separation of historical presentation from approved game mechanics.
- **P2 — Later-era chronology and framing:** Record now; implement when the relevant era enters active content production.
- **P3 — Research prerequisites:** Commission or complete targeted research before authoring the relevant content.

Statuses used here: **Proposed** (finding recorded, not approved for implementation), **Needs decision** (a design choice or source verification is required), **Ready for focused correction** (scope is sufficiently clear, but work remains deferred), and **Deferred** (not part of the current production slice).

## P0 — Era I vertical-slice corrections

| ID | Finding | Proposed correction | Known impact / verification target | Status |
|---|---|---|---|---|
| HC-001 | The assessment identifies Utu-mansum as an Ur III / Old Babylonian-attested name and Shuruppak-ilu as invoking the later Early Dynastic IIIa city/archive, both problematic for Uruk c. 3200 BCE. | Replace these names with readable, invented names grounded in archaic Uruk office terminology. Retain human-readable NPC names; do not force players to navigate undeciphered office codes. | GDD character references; runtime people and scenario references. Current main-branch search identifies `src/state/initialState.ts`, `src/content/assignments/urukAssignments.ts`, `src/engine/challengeDirector.ts`, `src/works/storehouseReckoning.ts`, and `dev/P2-2-authored-scenarios.md`. Rename consistently across IDs, dialogue, records, and references if/when implemented. | Ready for focused correction |
| HC-002 | The Era I heading uses “Sumerian Cuneiform” for c. 3200 BCE, while the assessment identifies the writing of Uruk IV–III as proto-cuneiform, not developed wedge-shaped cuneiform. | Decide whether to retain the player-facing chapter label as a deliberate simplification, while making all in-world descriptions and depictions accurate: incised pictograms, rounded/curviform quantity impressions, spatial cases/columns, and no fluent prose or letter-like documents. | GDD Era I title and historical/media guidance; future visual and text content. The assessment explicitly permits the chapter heading as a player-facing liberty if the actual artifacts remain accurate. | Needs decision |
| HC-003 | North-Bay Roof Inspection describes seven held barley sacks; the assessment considers cloth sacks an unnecessary modern image for the setting. | Replace the sacks with sealed pottery storage jars or covered reed baskets, choosing the form that best fits the scene and custody/inspection logic. | Current main-branch search identifies `src/content/assignments/northBayRoofInspection.ts`, `src/engine/assignmentActivity.ts`, `src/works/storehouseReckoning.ts`, and `dev/P2-2-authored-scenarios.md`. Update all associated evidence, matter summaries, labels, and scenario records consistently. | Ready for focused correction |
| HC-004 | “Family Desk” is a cross-era UI/workspace abstraction, but wooden desk imagery is not suitable for Late Uruk. | Preserve the workspace/upgrades as a UI and progression abstraction; use Era I materials such as reed mats, clay bins, water bowls, and styluses. | GDD workspace/equipment presentation and Era I art/content. Do not remove the workspace system or redesign its progression. | Ready for focused correction |
| HC-005 | Some Era I role/title language may imply later, rigid administrative ministries. The assessment notes uncertainty about the degree of centralization in Uruk's early institutions. | Review Era I offices and career-path framing. Present the four career paths as broad institutional emphases and relationships, not as modern departmental structures. | GDD career paths and institution/person content. Preserve the four paths; localize the institutions to the evidence and uncertainty of the period. | Needs decision |

## P1 — Economy, payment language, and metrology

| ID | Finding | Proposed correction | Constraint / decision boundary | Status |
|---|---|---|---|---|
| HC-006 | The assessment flags “shekel of silver” and silver bribes/payments as anachronistic for Uruk c. 3200 BCE; it places weighed silver payment and hacksilber evidence in Early Dynastic III, around 2600 BCE. | Audit Era I player-facing currency labels, assignment rewards, bribery, debts, and institutional records. Avoid describing the Era I wealth counter as silver shekels or implying established silver cash/payment circulation. Reserve historically grounded weighed-silver/hacksilber presentation for Era III where appropriate. | Do not infer a redesign of the player economy from this historical correction. The canonical GDD and README specify two tracked personal resources: money and provisions. The assessment's historical concerns apply to period-appropriate currency terminology, denominations, and payment practices; they do not change the approved resource model. Review Era I presentation separately from the abstract wallet balance. | Needs decision |
| HC-007 | Proto-cuneiform used multiple context-dependent numerical systems; the same sign can represent different quantities in discrete-goods counting and barley capacity measurement. | Keep “standard institutional measure” as an intentional Tutorial abstraction. Research a later Era I Assignment that teaches the distinction between Sexagesimal System S (N14 = 10 × N1 for discrete goods) and Capacity System Š (N14 = 6 × N1 for barley), without turning the Tutorial into a metrology lesson. | Verify scholarly interpretation, notation, and quantities before authoring. The assessment's modern-liter conversions are estimates and should not be treated as exact game constants. Do not change the Tutorial's existing 24 / 60 / 30 quantities solely to demonstrate the system. | Deferred |
| HC-008 | Barley, malt, beer, and worker rations are historically connected in Uruk III records; the assessment notes beveled-rim bowls and other ration contexts. | Preserve the contextual distinction between barley as an institutional commodity, beer as a social/economic good, and the player's personal resources. Use historically appropriate vessel and ration language when the relevant content is revised. | This is a content-context review, not a proposal to redesign the player economy. | Deferred |

## P2 — Later-era chronological coherence

These are content-planning findings. No later-era implementation is scheduled by this register.

| ID | Era / anchor | Assessment finding | Recommended framing | Status |
|---|---|---|---|---|
| HC-009 | II — Egyptian Hieroglyphs, c. 3000 BCE | Earliest tags and marks precede mature Old Kingdom papyrus administration and later measures. | Consider a multi-century Early Dynastic-to-Old Kingdom arc (approximately 3000–2500 BCE), moving from ivory/stone tags toward mature papyrus administration. | Deferred |
| HC-010 | III — Earliest Coherent Texts, c. 2600 BCE | Strong alignment with Early Dynastic IIIa archives at Shuruppak and Tell Abu Salabikh; some administrative conventions continue developing into ED IIIb. | Retain the anchor; build around city-state institutions, named scribes, scholars, merchants, river trade, clay envelopes, and early literary copying as evidence supports. | Deferred |
| HC-011 | IV — Alphabetic Development, c. 1850 BCE | The early Proto-Sinaitic/Wadi el-Hol dating is debated; the earliest evidence is not yet mature commercial correspondence. | Either move the era window toward later trade networks or center the opening on marginalized expedition workers adapting Egyptian signs outside elite scribal schools. | Needs decision |
| HC-012 | V — Mesoamerican Scripts, c. 500 BCE–1 CE | The current research base lacks sufficient primary detail on everyday administration and perishable media. | Retain the proposed Preclassic window provisionally; require a dedicated epigraphic/material-culture brief before authoring detailed Works. | Deferred |
| HC-013 | VI — Printing Press, c. 1436 CE | Strasbourg-era Gutenberg activity predates printed books, pamphlets, and mature print circulation by roughly two decades. | Use an authored multi-decade arc from workshop secrecy, guild tension, and litigation in the late 1430s into 1450s printing and circulation. | Deferred |
| HC-014 | VII — Digital Writing, c. 1971 CE | ARPANET email and Project Gutenberg are defensible anchors, but the network is institutional and small rather than mass-public digital culture. | Preserve the early networking/protocol and ASCII preservation context; do not project later internet scale backward. | Deferred |

## P3 — Research prerequisites and protected design commitments

| ID | Topic | Required work | Status |
|---|---|---|---|
| HC-015 | Era V epigraphy and media | Commission targeted research on Zapotec and early Maya inscriptions, calendrical records, everyday administrative practice, and perishable writing media before Era V content production. | Deferred |
| HC-016 | Era IV chronology | Verify the competing Proto-Sinaitic/Wadi el-Hol dating and the historical context of Serabit el-Khadim inscriptions before choosing the era's opening framing. | Deferred |
| HC-017 | Era I office terminology | Verify archaic office roots and the limits of interpreting Uruk IV–III titles before selecting replacement names or titles. Human-readable invented names remain an acceptable readability liberty. | Deferred |
| HC-018 | Material culture | Verify period-specific storage, writing surfaces, tools, and workspace imagery when producing each era's content and art. | Deferred |
| HC-019 | Later-era institutions | Research institutional structures, professional roles, and social obligations for each era rather than reusing Uruk institutions with new names. | Deferred |

The assessment also recommends preserving the Event / Record / Knowledge distinction, non-hereditary succession through connected living scribal NPCs, and conflicting NPC obligations that are not reduced to a single loyalty score. These are **protected design commitments**, not correction tasks.

## Delivery rules

1. Do not interrupt the active institutional-lifecycle work for this backlog.
2. Start with a focused Era I content audit once the current lifecycle milestone is integrated and verified.
3. Separate editorial corrections from changes to simulation rules, data models, persistence, or player economy.
4. Before changing runtime content, search for all references to the affected names, materials, denominations, and labels; update IDs and cross-references consistently.
5. Do not implement a disputed historical interpretation until its evidence and design consequences are reviewed.
6. Update `docs/GDD.md` when an approved design decision changes canonical design. This register does not supersede the GDD.
7. Record implementation and verification separately; a documentation correction is not evidence that runtime content has been corrected.

## Source

- **Scribe of Eras Historical Framework.md** — “Staff Historian Assessment and Liberty Framework for Scribe of Eras,” supplied in the project conversation. This register records the assessment's findings and recommendations; it does not independently validate every cited historical claim.
- Repository baseline inspected for this register: `main`, 22 November 2026. Relevant runtime paths are listed in individual entries where identified.
