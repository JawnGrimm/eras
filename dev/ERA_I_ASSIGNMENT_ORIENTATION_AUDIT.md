# Era I Assignment Orientation and Institutional Context Audit

**Status:** DESIGN AUDIT — FINDINGS AND RECOMMENDATIONS; NOT AN IMPLEMENTATION SPECIFICATION  
**Date:** 23 November 2026  
**Repository baseline:** `main`, inspected 23 November 2026  
**Scope:** The three recurring Assignment activities currently authored for Uruk; Merchant and Military orientation coverage.  
**Authority:** GDD and approved design decisions remain controlling. No runtime or canonical GDD changes are made by this audit.

## 1. Executive finding

The three current recurring Assignments are coherent, distinct administrative exercises, but they are all anchored in the same fictional Temple Storehouse and are commissioned by Storehouse Steward Ur-Nanna. They provide useful variety within one institutional setting; they do **not** yet demonstrate the approved orientation principle across four professional orientations.

- **Government:** Strongest present fit through institutional stock, records, inspection, reconciliation, and maintenance oversight.
- **Religious:** Strong contextual fit through the Temple Storehouse and its institutional goods, but not yet a clearly differentiated religious/cultic responsibility beyond the shared storehouse setting.
- **Merchant:** Partial contact and subject-matter foothold through carrier dispatch, delivery, and transport. There is no distinct exchange/procurement setting, external counterparty relationship, or merchant-oriented custody/transport situation in the current three-Assignment set.
- **Military:** No distinct set-and-setting. Delivery and loading are transport-adjacent, but none of the three involves a specific security, mobilization, organized-movement, or accountability situation that would make Military play meaningfully different.

**Conclusion:** The current three are suitable as an initial storehouse cluster, not as proof of orientation-sensitive Assignment coverage. Merchant and Military should be explicit coverage gaps in the next Era I content pass and in orientation playtesting. Do not solve this by creating four variants of each current Assignment.

## 2. Sources and method

Live repository files inspected on `main`:

- `docs/GDD.md`
- `docs/design/DECISION_REGISTER.md`
- `docs/design/OPEN_DESIGN_REGISTER.md`
- `docs/design/ACTIVITY_AND_WORK_SPEC.md`
- `docs/design/WORLD_SIMULATION_SPEC.md`
- `dev/ERA_I_INSTITUTION_RESPONSIBILITY_MATRIX.md`
- `dev/ERA_I_INSTITUTIONAL_HISTORICAL_AUDIT.md`
- `dev/P2-2-authored-scenarios.md`
- `src/content/assignments/urukAssignments.ts`
- `src/content/assignments/opportunityDefinitions.ts`

This is a source review, not a runtime playtest. The audit distinguishes the current authored content from intended future coverage. No claims are made about uninspected runtime behavior beyond the definitions and opportunity-channel declarations listed above.

## 3. Assignment-by-Assignment audit

### A. Held-Barley Inspection

**Current classification:** Specialized / contextual — Temple Storehouse held-stock inspection.

- **Set and setting:** North storage bay, segregated barley stock, reed matting, and prior intake/recount records.
- **People:** Ur-Nanna (employer and stock-custody authority), Utu-mansum (receiving record source), Shuruppak-ilu (scribal authority/review).
- **Evidence and procedure:** Steward's custody briefing; exterior container observation; comparison of intake and recount capacity records. Physical container condition is kept separate from untested grain condition.
- **Authority:** The scribe may inspect and report, but may not sample, release, clean, destroy, or issue stock.
- **Consequences:** A qualified finding and recommendation informs an authorized stock decision; the report itself is not a release order.
- **Access route:** The Steward asks the junior scribe who filed the preceding north-bay report. The opportunity definition uses baseline reach.
- **Orientation coverage:** Government and Religious have an obvious institutional relationship. Merchant and Military have no distinct reason to encounter this stock-inspection task in the current content. Their participation would require a real custody, procurement, transport, or security connection—not a cosmetic variant.
- **Assessment:** A strong institution-specific administrative task. Not a shared Assignment simply because it involves quantities and goods.

**Content note:** The current runtime definition describes seven physical sacks. The Historical Correction Register HC-003 already flags cloth sacks as an unsuitable material-culture choice and recommends sealed pottery jars or covered reed baskets. That correction remains separate from this orientation audit and should be resolved consistently across evidence, matter summaries, and labels.

### B. South-Court Delivery Reconciliation

**Current classification:** Contextual — Temple Storehouse receipt reconciliation, with the strongest existing Merchant-adjacent contact.

- **Set and setting:** Temple Storehouse south receiving court/tablet room; dispatch originates at a canal-side holding yard.
- **People:** Ur-Nanna; Utu-mansum; Enlil-kisu, identified in the runtime definition as carrier foreman and consultable witness; Shuruppak-ilu as review recipient.
- **Evidence and procedure:** Dispatch copy, receiving tally, separate testimony from the receiving official and carrier foreman, and optional route/handling inspection. The discrepancy is established; its cause and responsibility are not.
- **Authority:** The scribe may report but cannot silently amend the account or assign liability.
- **Consequences:** The report preserves both figures and can prompt a further record check or qualified closure.
- **Access route:** A relationship delivery channel names Enlil-kisu because his dispatch copy is being compared with the receiving tally.
- **Orientation coverage:** Merchant has a real but narrow foothold through transport, delivery custody, and a carrier contact. The institutional purpose remains the storehouse's receipt/account, not procurement or exchange from the carrier's perspective. Military receives no distinct security or mobilization framing; transport alone is insufficient.
- **Assessment:** The best candidate for a lightweight Merchant contact hook, but not enough to establish a Merchant set-and-setting across play.

**Source consistency note:** The current runtime definition attributes the dispatch copy to Enlil-kisu and includes his testimony. The older `dev/P2-2-authored-scenarios.md` narrative says the surviving dispatch copy names no individual carrier. The runtime definition is the inspected implementation baseline; the developer narrative is stale on this point and should not be used to override it.

### C. South Loading-Awning Inspection

**Current classification:** Specialized / contextual — Temple Storehouse maintenance condition report.

- **Set and setting:** South loading court and its awning, inspected before further loading.
- **People:** Ur-Nanna (requester and maintenance decision-maker), Dudu (repairer, consulted only to establish the boundary of his existing commission), Shuruppak-ilu (scribal recipient/reviewer).
- **Evidence and procedure:** Direct observation of frayed reed ties, support posts, pooled water, and a contract-scope clarification.
- **Authority:** Inspection and reporting only; the existing repair commission does not authorize work on the south awning.
- **Consequences:** The report may support a separate repair commission, monitoring, or a loading restriction; it is not itself repair authorization.
- **Access route:** Baseline reach: Ur-Nanna asks a storehouse scribe to document the awning before further loading.
- **Orientation coverage:** Strongest Government/Religious institutional fit. No distinct Merchant or Military connection is authored. The presence of a loading awning does not by itself make this a transport or security Assignment.
- **Assessment:** A useful maintenance/accountability task, but narrow to this storehouse and its delegated repair work.

## 4. Coverage matrix

| Dimension | Held-Barley Inspection | South-Court Delivery | South Loading-Awning |
|---|---|---|---|
| Primary institution | Temple Storehouse | Temple Storehouse | Temple Storehouse |
| Employer/requester | Ur-Nanna | Ur-Nanna | Ur-Nanna |
| Core craft | Stock inspection and qualified reporting | Dispatch/receipt reconciliation | Condition inspection and maintenance reporting |
| Strongest orientation fit | Government / Religious | Government / Religious; Merchant-adjacent | Government / Religious |
| Merchant set-and-setting | None distinct | Partial: carrier, dispatch, route, custody | None distinct |
| Military set-and-setting | None | None: transport is not sufficient | None: loading infrastructure is not sufficient |
| Cross-institutional route | None authored | Carrier relationship/contact | None authored |
| Distinct institutional consequence | Stock release decision | Stock-account qualification/follow-up | Maintenance commission or restriction |

## 5. Merchant coverage finding

**Current state: partial, not sufficient for a distinct Merchant experience.**

The delivery reconciliation gives Merchant a plausible point of contact and a real transport/custody subject. But all work is framed by the receiving institution's need to reconcile its own stock. The carrier is evidence-bearing contact, not an external exchange counterparty in a distinct procurement or delivery relationship.

A future Merchant-oriented Assignment should be an institution-anchored definition, not a Merchant branch of all three storehouse tasks. Suitable Era I directions for research and authoring include:
- receipt or inspection of a procured/imported material from an external counterpart;
- reconciling a dispatch, handover, seal, and receiving record across two parties;
- documenting a disputed quantity, quality, custody, or delivery obligation in an exchange relationship.

Use the Era I matrix's exchange/procurement network framing. Do not assume later private merchant houses, modern contracts, or a standardized merchant profession. Identify the actual parties, authority, evidence, and reconstructed procedure.

## 6. Military coverage finding

**Current state: no distinct set-and-setting.**

The current tasks contain transport, loading, and custody-adjacent material, but none establishes a specific security, mobilization, organized-movement, or accountability circumstance. A Military-oriented character would therefore experience the same storehouse world without a distinct professional setting.

A future Military-oriented Assignment should be separately authored around a historically restrained, specific matter—not a four-way variant. Research/authoring candidates include:
- accountability for people, animals, or loads assigned to a particular organized movement or collective task;
- custody and return of goods or equipment entrusted to a security or movement group;
- a delivery or route problem where an explicitly authored security responsibility changes who may inspect, release, or receive the goods.

The scenario must identify who ordered the activity and what authority exists. Do not invent a standing army, military scribal corps, quartermaster office, fixed conscription, standardized muster rolls, or a generic regiment. Security, mobilization, transport, and organized labor are possible scenario contexts, not evidence of a formal military bureaucracy.

## 7. Recommended next content pass

1. Retain the three existing activities as a coherent Temple Storehouse cluster; do not retrofit four orientation branches into them.
2. Resolve the HC-003 material-culture correction independently and consistently.
3. Develop at least one institution-anchored Merchant-facing Assignment with a genuine exchange/procurement/custody relationship.
4. Develop at least one institution-anchored Military-facing Assignment only after a specific Era I historical framing and authority chain are defensible.
5. Review Government and Religious distinction as well: their overlap is historically appropriate, but the content should expose different responsibilities, relationships, or stakes where the evidence supports it.
6. Test the four orientations against the actual authored set and circumstances, not against equal offer counts or four isolated queues.

These are content recommendations, not approval to add specific scenarios or to change the runtime generator.

## 8. Production audit boundary

The present audit finds a content coverage gap. It does not establish that the generator should filter opportunities by orientation. The current opportunity definitions explicitly author:
- baseline-reach channels for Held-Barley Inspection and South Loading-Awning Inspection;
- a relationship channel through Enlil-kisu for South-Court Delivery Reconciliation.

The three definitions are linked to active institutional matter kinds. The broader world-simulation contract says matter-driven discovery is only the first step; rank-based reach, access, skill qualification, authority, NPC knowledge/willingness, and commitment conflicts must be added only through explicit authored rules and supported state.

After the behavioral contract is approved, Production should audit all consumers of orientation, delivery channels, institutional access, matter eligibility, skill qualification, authority, NPC knowledge/willingness, and commitments. Do not add hard-coded orientation gates or infer access from relationship scores.

## 9. Cross-system handoff finding: relationship delivery channels

The South-Court definition uses a `relationship` delivery channel referencing Enlil-kisu. Cross-reference the approved `dev/ERA_I_CHARACTER_HISTORY_RESOLVER_CONTENT_MAP.md` (`era1-character-history-v1`): EN-01 through EN-04 may record Enlil-kisu as an existing Person participant on a factual LifeEvent, but participant roles explicitly do not create trust, affection, familiarity, or other numeric relationship dimensions.

The live code inspected on `main` provides this current baseline:

- `validChannels()` in `src/engine/opportunities.ts` validates a `relationship` channel by checking that `state.world.people[c.personId]` exists. It does not require or inspect `world.relationships` dimensions.
- `generateDailyAssignments()` in `src/engine/assignmentGenerator.ts` currently discovers authored definitions from matching active institutional matters. It does not filter opportunity discovery by relationship delivery-channel dimensions.
- Therefore the specific silent-failure scenario is **not demonstrated in the current generator**. However, the intended meaning of the channel is not yet a sufficient behavioral contract for future access filtering. Production must trace every consumer and decide whether the channel is explanatory/provenance metadata or an eligibility predicate.

**Production audit requirement:** Test a newly created Merchant-oriented character whose EN route records Enlil-kisu as a factual LifeEvent participant and who has no numeric PersonRelationship entry for him. If relationship-channel eligibility is intended, it must recognize the supported factual connection or another explicitly authored access route; it must not fabricate relationship scores to make the offer appear. Keep factual participation, personal relationship dimensions, and opportunity access distinct.

## 10. Department impact

- **Game Design:** The three activities are a storehouse cluster; Merchant and Military need distinct authored settings before orientation playtesting can establish differentiated experience.
- **Historical Research:** Merchant exchange/procurement and Military security/mobilization content need targeted period-specific review before scenario commitment.
- **Engineering:** No material impact until the behavioral contract and a content-backed implementation proposal are approved.
- **Art/UI:** Future content should visually distinguish exchange routes/counterparties and any defensible security/movement setting; no immediate UI change.
- **Audio:** No material impact.
- **Production/QA:** Preserve the current generator while auditing its access consumers after approval; later playtest for distinct set-and-setting rather than equal offer counts.

## 11. GDD alignment and status

This audit supports the approved principle that orientation affects both opportunity encounter and circumstances of performance. It does not alter the four orientations, establish new exclusive access rules, or approve specific new Era I Assignments.

The audit is based on live `main` repository files inspected 23 November 2026. It is not a runtime playtest, complete historical monograph, or claim that the current implementation fully supports orientation-sensitive access.

**Next action:** Game Director review of `dev/ASSIGNMENT_ORIENTATION_AND_INSTITUTIONAL_CONTEXT_SPEC.md` and this audit. Production implementation remains out of scope pending approval.
