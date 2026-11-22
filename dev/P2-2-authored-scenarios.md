# P2-2 Authored Scenario Pack — Review Draft

**Status:** Proposed authored content for review; not yet runtime-integrated or canonical GDD approval.  
**Setting:** Uruk, c. 3200 BCE; Temple Storehouse and its immediate working spaces.  
**Authoring note:** These are fictional game scenarios grounded in the currently implemented Uruk cast and institutions. Quantities and incident details below are authored scenario facts, not claims about a documented historical event.

This pack supplies three distinct recurring Assignment activities and two optional Challenge scenarios. It preserves the distinction between source evidence, character interpretation, the player's report, and institutional judgment. No scenario awards Historical Progress XP. None is a prerequisite for a mandatory Work.

---

## 1. Held-Barley Inspection

**Activity ID proposal:** `activity-held-barley-inspection`  
**Assignment category:** `held_barley_inspection`  
**Employer:** Ur-Nanna, Storehouse Steward, acting for the Temple Storehouse  
**Recipient:** Shuruppak-ilu, Senior Scribe  
**Other participant:** Utu-mansum, Receiving Official  
**Location:** Temple Storehouse, north storage bay  
**Source / origin:** The North-Bay Roof Inspection Report and the earlier intake record  
**Destination:** A qualified inspection report entered into the Temple Storehouse record  
**Quantity:** Seven segregated barley sacks  
**Timing:** After the North-Bay Roof Inspection has been submitted and its recommendation to inspect the held sacks has been accepted by the Steward  
**Purpose:** Establish the sacks' observable condition and custody limits before any decision about their use  
**Responsibility:** The player inspects and reports. The Steward controls ordinary storehouse custody; the Receiving Official can explain the original intake record. The player cannot release stock or authorize its issue.

### Delivery reason

The North-Bay report recorded that seven sacks remained segregated on dry reed matting and explicitly stated that their contents had not been tested. Its recommendation for a separate inspection reached Ur-Nanna, who now asks for a condition report before the next stock allocation.

### Authored evidence and action sequence

1. **Review the prior record (1 AP).** The earlier intake record lists 56 usable measures and 4 held measures at the time of the original receipt. It does not describe the later seven-sack segregation and does not establish the present contents of those sacks.
2. **Consult Utu-mansum (1 AP).** He confirms that he made the original intake entry. He was not present for the storm, the roof repair, or the later segregation. His testimony establishes the boundary of his knowledge, not the sacks' present condition.
3. **Consult Ur-Nanna (1 AP).** He confirms that the seven sacks were kept apart after the roof incident. He can attest to the segregation decision and custody, but cannot certify the grain inside.
4. **Inspect the seven sacks (2 AP).** The outer surfaces of two sacks show damp staining; five appear dry. The sack seams remain tied. No contents are sampled, weighed, or opened. The staining is an observation, not proof that the barley is spoiled.

The order permits a qualified early report after the records and one or both consultations. Physical inspection is not mandatory for submission, but a report that claims present physical condition without it is unsupported.

### Report schema

- **Finding:** `condition_unverified`, `external_dampness_observed`, or `ready_for_release`.
- **Responsibility claim:** `none`, `steward_custody`, or `receiving_official`.
- **Recommendations:** `maintain_segregation`, `request_authorized_sampling`, `rehouse_outer_sacks`, or `release_for_issue`.
- **Limitations:** Free text, retained verbatim in the report.

### Assessment and consequences

- A report that says the contents remain unverified and recommends authorized sampling is qualified and traceable.
- A report that records damp staining but distinguishes it from spoilage is accurate.
- A report that declares the barley spoiled, sound, or fit for issue without sampling overstates the evidence.
- A report assigning responsibility to Utu-mansum for the later segregation or present condition exceeds his documented involvement.
- A report recommending release does not itself release the sacks. Only the Steward's separate authority can change their custody status.
- Submission creates a permanent report with source references, cited assertions, and explicit uncertainty limits. It grants Career XP and the Assignment's stated compensation only. It creates no Historical Progress XP.

**Provenance boundary:** The earlier intake quantities (56 usable and 4 held measures) and the later seven-sack segregation are separate observations at different times. Do not add, subtract, or equate them without an authored reconciliation record.

---

## 2. South-Court Delivery Reconciliation

**Activity ID proposal:** `activity-south-court-delivery-reconciliation`  
**Assignment category:** `delivery_reconciliation`  
**Employer:** Temple Storehouse, represented by Ur-Nanna  
**Recipient:** Shuruppak-ilu, Senior Scribe  
**Other participant:** Utu-mansum, Receiving Official  
**Location:** Temple Storehouse receiving court and tablet room  
**Source / origin:** A carrier's dispatch tablet from the canal-side holding yard  
**Destination:** Temple Storehouse stock account and a reconciliation report for the Senior Scribe  
**Quantity:** 24 measures of barley dispatched; 23 measures entered as received  
**Timing:** A routine delivery reconciliation during the current accounting period  
**Purpose:** Establish what the surviving records prove about a one-measure discrepancy  
**Responsibility:** The player compares records and reports. Utu-mansum owns the receiving entry; Ur-Nanna controls storehouse stock. The carrier is not identified in the surviving dispatch copy.

### Delivery reason

The storehouse account cannot be closed while the dispatch and receipt quantities differ. Ur-Nanna asks for a reconciliation, not an accusation or an automatic stock adjustment.

### Authored evidence and action sequence

1. **Read the dispatch tablet (1 AP).** The surviving copy records 24 measures dispatched from the canal-side holding yard. It names no individual carrier in the copy available to the storehouse.
2. **Read the receiving entry (1 AP).** Utu-mansum's intake tablet records 23 measures received at the Temple Storehouse. It records no accepted explanation for the difference.
3. **Consult Utu-mansum (1 AP).** He confirms that 23 measures crossed the receiving threshold and were entered. He did not witness the loading at the origin yard.
4. **Compare the two entries (1 AP).** The dispatch and receiving quantities differ by one measure. Neither record establishes where the difference arose or who was responsible.
5. **Submit a reconciliation (1 AP).** The player can preserve the discrepancy as unresolved, or make an explicitly qualified inference. The player cannot silently alter either source entry.

### Report schema

- **Finding:** `unreconciled_difference`, `receipt_entry_confirmed`, or `dispatch_entry_confirmed`.
- **Responsibility claim:** `none`, `origin_handling`, or `receiving_handling`.
- **Recommendations:** `retain_both_entries`, `request_origin_copy`, `recount_storehouse_stock`, or `adjust_stock_account`.
- **Limitations:** Free text.

### Assessment and consequences

- The evidence supports a one-measure difference between the two surviving entries.
- It does not establish theft, loss in transit, a faulty origin count, or a faulty receiving count.
- A qualified report preserves both source entries and requests the missing origin copy or a stock recount.
- An unsupported accusation is entered as a disputed assertion, not silently treated as fact.
- An adjustment recommendation is not itself an authorized ledger change. Ur-Nanna and the Senior Scribe retain their respective institutional responsibilities.
- Submission creates a record and distributes copies only to the explicitly identified holders. It grants Career XP and the Assignment's compensation, never Historical Progress XP.

**Provenance boundary:** The dispatch tablet is a surviving copy, not direct observation of loading. The receiving entry is an institutional record of the threshold count. Neither source alone establishes the full movement of the barley.

---

## 3. South Loading-Awning Inspection

**Activity ID proposal:** `activity-south-loading-awning-inspection`  
**Assignment category:** `institutional_maintenance`  
**Employer:** Ur-Nanna, Storehouse Steward  
**Recipient:** Shuruppak-ilu, Senior Scribe  
**Other participant:** Dudu, repairer, consulted only about the limits of his existing contract  
**Location:** Temple Storehouse, south loading court  
**Source / origin:** Ur-Nanna's maintenance request and direct inspection  
**Destination:** A maintenance condition report for the Temple Storehouse  
**Quantity:** One loading awning; two visibly frayed reed ties; two inspected support posts  
**Timing:** Before the next expected delivery period  
**Purpose:** Identify observable maintenance needs and distinguish inspection from authorization to commission repairs  
**Responsibility:** The player inspects and reports. Ur-Nanna controls ordinary storehouse maintenance requests; the Senior Scribe determines what follow-up the submitted record warrants. Dudu's existing roof contract does not automatically include this awning.

### Delivery reason

Ur-Nanna reports that rainwater has collected near the south loading threshold and requests a condition report before another delivery is unloaded there. The request is an inspection, not a repair order.

### Authored evidence and action sequence

1. **Receive the Steward's request (1 AP).** Ur-Nanna identifies the south loading awning and the pooled water near the threshold. He does not claim that the support posts have failed.
2. **Inspect the awning (2 AP).** Two reed ties are visibly frayed. Both inspected support posts remain upright and show no visible splitting at their bases. Water has collected beside the threshold; the inspection does not establish the cause of the pooling.
3. **Consult Dudu about contract scope (1 AP).** Dudu confirms that his recorded paid work concerned the north-bay mid-bay patch. He has not been commissioned to inspect or repair the south loading awning.
4. **Submit the maintenance report (1 AP).** The player records the observed defects, the limits of the inspection, and a recommendation. No repair is performed by submitting the report.

### Report schema

- **Finding:** `minor_maintenance_required`, `support_condition_uncertain`, or `no_visible_defect`.
- **Responsibility claim:** `none`, `steward_authorization`, or `repairer_contract`.
- **Recommendations:** `replace_two_reed_ties`, `inspect_threshold_drainage`, `request_full_structural_assessment`, or `defer_until_authorized`.
- **Limitations:** Free text.

### Assessment and consequences

- The two frayed ties and pooled water are observable conditions.
- The support posts' visible condition does not prove the full awning structure is sound.
- Dudu's statement establishes the boundary of his existing contract, not responsibility for the new maintenance request.
- The report may recommend work, but it cannot spend institutional resources, commission Dudu, or alter his contract.
- Submission creates a maintenance record with cited sources and explicit limits. It grants Career XP and the Assignment's compensation only.

---

## 4. Optional Challenge: The Seven Sacks

**Challenge ID proposal:** `challenge-seven-sacks`  
**Trigger:** Completion of the Held-Barley Inspection Assignment, evaluated from the recent activity record.  
**Category:** `institutional_judgment`  
**Delivery:** Ur-Nanna asks the current scribe for a recommendation after receiving the inspection report.  
**AP cost:** 2 AP to resolve after accepting.  
**Context:** The seven sacks remain segregated. Two outer sacks show damp staining, but no contents have been sampled. The next allocation is approaching and the Steward wants a decision he can act on.

### Choices and outcomes

1. **Maintain segregation and request authorized sampling.**  
   Preserve the seven sacks under hold, record the two stained exteriors, and ask the Steward to authorize a separate sampling procedure.  
   **Consequences:** +3 Career XP; +2 directional trust from the current character toward Ur-Nanna; preserve the existing held-barley matter as active; no stock is released. The authored outcome record notes that sampling remains unauthorized and outstanding.

2. **Release the five apparently dry sacks, retain the two stained sacks.**  
   Recommend a partial release based only on exterior appearance. The Steward must explicitly accept the risk; the scribe's report records that the contents were not sampled.  
   **Consequences:** +1 Career XP; -1 Temple Storehouse institutional standing; preserve the recommendation and its explicit uncertainty warning in the outcome record. The Challenge does not itself release stock.

3. **Certify all seven sacks as fit for issue.**  
   Treat the dry appearance of five sacks and the absence of visible leakage as sufficient proof for all seven.  
   **Consequences:** -2 directional trust from the current character toward Ur-Nanna; -2 Temple Storehouse institutional standing; preserve a disputed assertion that the report certified contents never sampled. No automatic stock release occurs.

**Resolution rule:** A Challenge choice records the player's recommendation and its social/professional consequences. It does not grant the player institutional authority. No choice awards Historical Progress XP.

---

## 5. Optional Challenge: The Missing Measure

**Challenge ID proposal:** `challenge-missing-measure`  
**Trigger:** Completion of the South-Court Delivery Reconciliation Assignment where the one-measure discrepancy remains unresolved.  
**Category:** `professional_discretion`  
**Delivery:** Shuruppak-ilu asks whether the storehouse account should be closed before the next tally.  
**AP cost:** 2 AP to resolve after accepting.  
**Context:** The dispatch copy records 24 measures sent; Utu-mansum's receiving tablet records 23 received. No surviving source identifies the carrier or establishes where the difference arose.

### Choices and outcomes

1. **Keep both entries and mark the discrepancy unresolved.**  
   Preserve the source quantities, add a cross-reference, and request the origin copy before any adjustment.  
   **Consequences:** +3 Career XP; +2 respect with Shuruppak-ilu; +1 trust with Utu-mansum. The account remains visibly open for reconciliation.

2. **Close the account at the receiving quantity with a qualification.**  
   Use 23 as the storehouse's received quantity while retaining the dispatch figure and a note that the origin-side count has not been checked.  
   **Consequences:** +1 Career XP; +1 Temple Storehouse institutional standing; the discrepancy remains in the record and is not treated as proof of loss.

3. **Attribute the missing measure to receiving error.**  
   Treat the difference as Utu-mansum's mistake without evidence of the loading or a second count.  
   **Consequences:** -3 directional trust from the current character toward Utu-mansum; -1 Temple Storehouse institutional standing; add a disputed assertion identifying the accusation as unsupported. The source entry is not rewritten.

**Resolution rule:** The Challenge concerns how the scribe handles uncertainty and institutional pressure. It does not determine whether the measure was lost, stolen, miscounted, or never loaded. No choice awards Historical Progress XP.

---

## 6. Runtime and authoring constraints

- The three Assignments are distinct activities, not reskins of one universal sequence. Each has its own action costs, source set, report schema, and resolution rules.
- Assignment and Challenge rewards are Career XP, compensation, resources, reputation, relationship, or institutional consequences only. They never award Historical Progress XP.
- The Held-Barley Inspection is offered only when its source matter exists and is active. The two recurring activities are generated from authored templates and plausible delivery channels.
- A generated offer must include the full contextual record: what, who, quantity, when, where, from, to, purpose, responsibility, authority where relevant, provenance, and why it reached this character.
- The generator must not create a second active copy of the same matter-specific follow-up.
- Challenge rules evaluate actual player activity, not the mere presence of an offer. Offers that lapse during mandatory Work do not count as ignored opportunities.
- Challenge triggers are one-shot per authored trigger key and must not repeatedly offer the same scenario after it has been declined or resolved.
- All outcomes are deterministic and authored. No runtime generative AI is used.
- Character knowledge remains character-scoped. A successor does not inherit the former character's personal knowledge merely because the earlier character authored or received a report.
- These scenarios are proposed content for review. The canonical GDD remains unchanged until the project owner approves the authored facts, outcomes, and resulting mechanics.
