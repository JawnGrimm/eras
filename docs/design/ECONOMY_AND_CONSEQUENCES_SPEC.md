# Economy, Stress, and Ethical Consequences Specification

**Authority:** Supporting specification under [the canonical GDD](../GDD.md).  
**Status:** Consolidated from the approved GDD draft on 23 November 2026.

The GDD's locked two-resource model and provisions-shortage rules remain authoritative. Numerical balance not explicitly approved remains provisional or open.

## 12. Personal Economy

### 12.1 Personal resources

The player's personal economy has two resources: **money and provisions**. Their names, forms, denominations, and presentation adapt to the current historical era. When eras change, the resources are reskinned and their balances carry forward unchanged; no conversion is required.

### 12.2 Employment compensation

The player receives money compensation for employment, with professional rank and legitimate performance bonuses potentially affecting pay. Poor performance may reduce money compensation. Good performance can earn legitimate bonuses. Compensation in kind, including provisions or specific items, is permitted only when it is part of an explicit employment or Work contract, with the amount, duration, and conditions shown before acceptance.

There is no universal daily employment ration. A player who performs no paid work and has no active contract receives no automatic provisions. Mandatory Works must nevertheless define their own provisions compensation when the institution expects the player to spend several days working for it. The Introductory Tutorial has no provisions contract: the apprentice begins with five units of provisions, supplemented by compensation from the paid starter Assignments.

### 12.3 Daily sustenance

The player normally consumes one unit of provisions at the end of each Workday.

A player may complete **two consecutive Workdays without provisions before suffering a shortage penalty**. If the player still has no provisions at the end of a third consecutive Workday, shortage consequences begin. The shortage count advances by Workday, not by calendar time, and resets when the player consumes provisions. Time that passes without a Workday being completed does not advance the count.

If the player lacks provisions, the game records the shortage rather than creating a negative balance or granting an automatic free resource. The first two consecutive Workdays without provisions are a grace period. At the end of the third consecutive Workday without provisions, the character gains the recoverable **Underfed** condition and receives **+2 Stress**. Each subsequent Workday ending without provisions adds a further +2 Stress. Shortage-attributed Stress is capped at **10 cumulative points per character**; this cap does not reset when provisions are consumed, so repeated shortage episodes cannot bypass it. Stress already gained remains part of the character's Stress and can be reduced through ordinary recovery. The Underfed condition persists while the character remains without provisions and clears when the character consumes provisions. It marks the current hardship and may shape contextually appropriate options or reactions, but it must not create an additional automatic Stress ratchet or cascading loss of resources.

### 12.4 Recovery from hardship

Shortage consequences may be implemented only in the same release or milestone as concrete recovery actions. At least two of these recovery categories must be implemented in the system when shortage consequences ship, with at least one viable recovery path guaranteed in the character's actual circumstances:

- **Quick provisions-paid labor:** a short, plausible task that can be completed for provisions rather than money, with its work and payment terms shown before commitment.
- **Personal help or an advance:** ask a trusted contact—such as Ur-gir or Nin-aya where the established relationship and circumstances support it—for provisions, money, or an advance. Assistance carries a real obligation, such as repayment, future service, or a relationship cost; it is not an unexplained gift.
- **Sell or pawn equipment:** exchange a possession or equipment item for provisions or money, with the item, value, and any recovery or repurchase terms made clear.

The availability of each route depends on the people, institutions, possessions, laws, and circumstances actually present. The game must not assume that every character has a trusted contact or saleable equipment. It must, however, preserve at least one viable recovery path and present the available routes when shortage consequences begin; a character must not be left with only the End Workday action. These routes may coexist with other legitimate, informal, or illicit responses where plausible in the setting.

The game should not restrict the player to respectable or institutionally approved ways of responding to hardship. The player cannot die from a depleted provisions balance, and economic hardship must not create an unavoidable game-over state. This does not mean the player receives an automatic bailout, unlimited negative balance, or unexplained free resource.


---

## 13. Stress, Trust, and Institutional Consequences

### 13.1 Stress

Stress represents the cumulative pressure of work, shortages, conflict, difficult choices, and personal circumstances. It can change through Assignments, Challenges, daily settlement, sustenance shortages, rest, study, and social interactions.

Reaching the eventual critical or maximum Stress threshold should place the character in a **crisis state** and prompt the world to consider whether support is available. It is not an automatic rescue, a guaranteed Stress reset, or by itself a game-over condition.

Provision-shortage Stress and the recoverable Underfed condition follow the fixed increment, cumulative cap, and recovery requirements in Sections 12.3–12.4. The shortage condition clears when provisions are consumed; Stress already gained remains and can be reduced through ordinary recovery.

The character's positive personal relationships are the first potential source of intervention. A friend, relative, colleague, patron, or other contact may reach out or offer practical help when both willing and able. The form of assistance should reflect the relationship, the person's means, and their circumstances; a positive relationship does not guarantee that the person can help. Repeated hardship or repeated requests may strain a relationship, change the terms of assistance, or leave the contact unable or unwilling to intervene.

When personal support is unavailable or insufficient—because the character lacks positive relationships, has already relied on them repeatedly, or remains in hardship over an extended period—the wider society may offer other avenues. These must be appropriate to the historical place and period, including relevant charitable, religious, household, civic, or institutional practices where they existed. Do not impose modern charitable organizations or assumptions on earlier societies.

Support is an opportunity, not an entitlement or guaranteed bailout. The character may still need to seek work, negotiate obligations, accept assistance with conditions, or pursue informal and illicit alternatives. A character with no positive relationships must not be locked into an unavoidable failure state.

The overall Stress scale is 0–100. The critical threshold, crisis timing, intervention frequency, general recovery rates, and effects of assistance remain open design work. The shortage-specific Stress increment and cumulative cap are established in Section 12.3. All Stress changes must be explained when they occur, and the player must be able to see the likely cost and obligations of a recovery action before committing.

### 13.2 Trust and reputation

Trust and reputation operate at more than one level:
- An employer or institution may trust a character's work.
- Individual NPCs may trust or distrust a character for personal reasons.
- Factions or broad social groups may respond to a character's actions.
- A character's professional reputation can affect future opportunities.

These levels should not be collapsed into a single universal approval number. A decision can earn an institution's approval while damaging a personal relationship, or protect an individual while frustrating an employer.

### 13.3 Consequences should be traceable

When a ruling, omission, error, bribe, or disputed record changes the world, the player should receive a comprehensible explanation. Consequences can persist into later assignments, Challenges, Works, and relationships.

---

## 14. Bribery and Ethical Choices

Bribes may be offered by people with a reason to influence a particular record or decision. They should be contextual to the NPC, institution, assignment, and stakes—not generic random rewards detached from the situation.

Accepting a bribe can provide money or other specified resources, but it awards zero XP. It should carry credible consequences, which may include:
- Loss of trust from an employer, faction, or individual.
- Increased stress or vulnerability to future pressure.
- Damage to professional reputation.
- Changed relationships with the person offering the bribe or those harmed by it.
- Later exposure, investigation, or obligations.

Refusing, reporting, negotiating, or accepting may lead to different results depending on the evidence and relationships. Bribery should be a genuine choice with a trade-off, not a simple bonus button or a guaranteed morality test.

---
