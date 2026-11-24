# GD-STATE-INTEGRITY-001 — WP3/WP4 People & Institutions IA and Sparse-State Proposal

**Specification:** GD-STATE-INTEGRITY-001  
**Tracking:** Issue #107  
**Status:** Implemented in reviewable PR #111; awaiting CI/review  
**Design basis:** WP0 source audit, live main baseline `53ddc2b07d1a9fbf1d05aad81231c9318845cc73`  
**Scope:** Presentation-only; no state/schema/domain changes

## 1. Problem statement

The former People & Institutions screen eagerly rendered every full Person profile, every directional relationship edge, and every Institution card in one long document. Sparse fields were repeatedly presented as full-profile empty-state blocks. The page had no search, life-status filter, compact index, or focused detail selection. Institution cards exposed current active matters but did not separately present developed/resolved matters or the institution's linked records.

All of these entities are already loaded into the in-memory GameState. WP3 is therefore a presentation and information-architecture correction, not a data-fetching/lazy-loading change.

## 2. Proposed and implemented structure

### Directory navigation

Two internal directory sections:
- **People** — searchable by existing name, authored occupation/social identity, life stage, affiliation name, and appointment title. Filter by Living / Deceased / All.
- **Institutions** — searchable by existing name, responsibilities, authority, matter summary, and appointment title.

The initial People selection is the current character. The initial Institution selection is the first institution with a canonical active matter; otherwise the first authored institution. Search results show a compact list; one selected entity receives the full detail panel.

### Person detail

- Identity, life status, age when recorded, life stage, and authored social-identity summary.
- Affiliations and professional reputation behind native disclosure controls.
- Institutional standing in a separate disclosure section.
- Personal history behind a single disclosure section. Domain familiarity is explicitly labelled **Recorded domain familiarity** and described as prior exposure, not a relationship score.
- Active public circumstances and commitments only when present.
- Appointments and office scopes behind disclosure.
- Only relationship edges incident to the selected person. Each arrow remains directional; dimensions and the history for that perspective are progressively disclosed. The relationship dimension is labelled **Personal familiarity**, distinct from **Recorded domain familiarity** in Personal history.

### Institution detail

The institution detail separates:
1. Responsibilities and authority.
2. **Current matters**, derived from canonical `world.matters` entries whose status is `active`.
3. **Historical matters**, retaining the current model's exact `developed` and `resolved` labels. No parallel lifecycle states were added.
4. Appointments and delegated office scopes, with the actual office-holder.
5. Institutional records, including records linked through matter `record_copy` provenance. Original sources and assertions remain available behind disclosure.

The UI derives the current-matter list from each matter's status and institution ID rather than relying solely on the denormalized `Institution.activeMatters` array. This makes an active matter visible even if that secondary index is stale; it does not mutate or repair state. The institution index's active count is derived from the same status query.

## 3. Sparse-state rules

| Data state | Presentation |
|---|---|
| `ageYears` absent | “Age not recorded”; no age inferred. |
| No affiliations | Counted/collapsed “Affiliations (0)” with “None recorded” inside. |
| No scribal capability sheet | “Professional reputation (no record)” in a collapsed section; no fictional capability values. |
| No institutional standing entries | “Institutional standing (0)” with an explicit empty message. |
| No Life Events | Preserve the neutral legacy fallback “No personal history has been recorded.”; the disclosure summary separately counts Life Events. |
| No PersonFamiliarity entries | No empty placeholder. |
| No appointments | “Appointments and office scopes (0)” with an empty message. |
| No public circumstances/commitments | Sections are omitted; private entries remain undisclosed. |

No missing actor, role, affiliation, office, historical event, age, or capability was synthesized.

## 4. Accessibility and responsive checklist

- [x] Native labelled search inputs.
- [x] Native labelled life-status select.
- [x] Buttons use `aria-pressed` for selected state.
- [x] Result counts and selected detail headings use `aria-live="polite"` without announcing the full detail panel.
- [x] Native `details/summary` controls are keyboard-operable.
- [x] Visible `focus-visible` outlines on selection and disclosure controls.
- [x] Mobile single-column flow and desktop two-column index/detail layout.
- [ ] Manual keyboard-only browser smoke test.
- [ ] Manual screen-reader announcement review.
- [ ] 200% zoom / narrow viewport browser smoke test.

The final three checks require an actual browser session and are not claimed complete by static rendering tests.

## 5. Equivalent before/after capture

The existing static render regression in `src/tests/productionContinuityScreens.test.tsx` now captures both default views:
- People view: search/filter controls, one full selected profile, its directional relationships, and collapsed personal-history/reputation/standing sections.
- Institutions view: search, current matters, historical matters, appointments, and institutional records.

The test also checks that implementation-language “No initialized scribal capability sheet” copy is absent and that the full People page no longer repeats a full Personal History block for every Person. A separate WP6 snapshot-display fixture uses the approved Day-13 final values to test state-to-UI projection; it is not a reconstructed gameplay save. These render assertions are the current non-browser before/after capture; they do not substitute for the outstanding interactive browser checks.

## 6. Technical decisions and boundaries

- No new persisted fields, save-schema version, migration, simulation transition, or domain content.
- Search operates only on existing state properties.
- Relationship direction and separate edges are preserved; history is not merged or mirrored.
- Matter status names remain `active`, `developed`, and `resolved`.
- Current matters are selected from canonical matter status; no state repair is performed.
- Institutional record details are a read-only view of existing Records and matter provenance.
- The optional `initialSection` and `initialPersonId` props support explicit directory entry/default selection and deterministic render tests; ProductionShell continues to use the People/current-character defaults.

## 7. Validation status

CI and review status are tracked in PR #111. Local test/build and manual browser accessibility checks have not been performed by Production in this environment. The exact GitHub Actions results will be recorded in the implementation report after completion.
