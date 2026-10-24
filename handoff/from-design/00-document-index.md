# Zed Idler — Document Index (Oct 10)

Start here. This lists every design document, its folder and its status.
Rules for how design work is done: `CLAUDE_DESIGN_RULES.md` (project root).
Latest session handoff: `DESIGN_HANDOFF.md` (project root).
Code's list of deferred items: `PARKED.md` (project root). Kept by Code; separate from the parked design briefs below.

**Status key:** Current (in force) · Active slice (next to build) · Planning (not a build input) · `[PARKED]` (designed, not scheduled) · Archived (finished or retired)

---

## Current design — `reference/`

| File | What it is | Status |
|---|---|---|
| `wandering-tab-spec.md` (v2.1) | The master spec: policies, decay, factions, discovery prompts, stress, pockets, difficulty | Current. Source of truth for game rules. **Exception until FX1 closes:** on Downed, `fx1-hp-floor-slice.md` (U5) supersedes §13.8's "0 or below" wording |
| `fx1-hp-floor-slice.md` | FX1: HP floor at 1; reaching 1 HP from any source triggers Downed (U5); full damage in the log (U6); HP drain bug folded in (U7). Contains the draft batch | **Locked Oct 10**, sent onward. First in the fix train |
| `scenario-b-and-first-downed-oct10.md` | U8: Scenario B is the prepared survivor (belt pouch, padded jacket, board with nails). U9: the "hard at first" message lands at the first Downed. U10: B's weapon `[OPEN]`. U11: narrated finds point to tabs. U12: first Downed keeps the whole haul. U13: splash shows even if the tutorial was skipped. U14: skipping forfeits the tutorial's items. Code findings F1–F3 | Current, partly superseded by `elder-jester-concept.md` (U8, U10, U14). Code findings F1–F3 and U9, U11–U13 stand |
| `fx2-per-return-cap-slice.md` | FX2: clamp new + carried time to 24 h per return; excess discarded; draft batch | `[PROPOSED]`. Two points before Sam locks it (P1 drop `_discardedMs`, P2 save/load round-trip). Runs after FX1 CLOSED |
| `starter-weapons-cb1-slice.md` | CB1: balanced starter weapons (Nail Bat heavy, Iron Knuckles stagger, Pocket Knife escape + loot), three new weapon fields, simulated numbers, draft batch | **Active slice.** Batch awaiting Sam's lock. Runs after FX1 and before H2 |
| `elder-jester-concept.md` | The Elder Jester (renamed from Mystic Jester, Oct 10): a companion met in the tutorial who gives the only starter kit (armor, a choice of three weapons, food, med kit) and the Fort delivery quest; tutorial ends at the Fort's approach; skip warning; H2 A = skipped, B = completed | Current `[CONCEPT]`. **Supersedes** tutorial §3.2 and Beat 5, and U8/U10 |
| `wandering-fort-scene.md` | The first Fort: gate, guard, quest Fallow Ground | Current. Sections 10 and 11 are current; Sections 2-9 are partly superseded |
| `tutorial-first-session-spec.md` | The first 20-30 minutes | Current. First Downed beat (U9) pending fold from `scenario-b-and-first-downed-oct10.md` |
| `poi-framework-v1-brief.md` | Shared POI rules (placement, discovery, saving, revisits), proven with Water | **Blocked** until R1 is CLOSED and FX1 is CLOSED (the HP drain bug is now part of FX1, U7) |
| `sim-harness-v1-brief.md` | Simulation and test harness: one clock, seeded rolls, policy × difficulty runs, gates 1 and 3 | H1 **CLOSED** (Oct 10). H2 decided in outline; starts after H1, FX1, FX2 and CB1 are CLOSED (U3; CB1 added Oct 10). Scenario B redefined by U8 (`scenario-b-and-first-downed-oct10.md`); fold into D11 when H2 is drafted |
| `h1-findings-decisions-oct10.md` | Decisions on gameplay issues found during H1 (Q1–Q6) and open questions for Code (TQ1–TQ10) | Current. Q1, Q2, Q4, Q5, Q6 `[DECIDED Oct 10]`; Q3 pending verification |
| `gameplay-fix-batches-proposal.md` | Where Q1–Q6 were recorded, spec conflicts, batch order FX1–FX4, questions for Code and Sam, H2 scenario matrix | `[PROPOSED]`. Not a build input until Sam approves a batch. Its FX1 section is superseded by `fx1-hp-floor-slice.md` |
| `r1-fx1-readiness-review.md` | Code's read-only review: R1 closure items, DH1 vs the HP drain bug, FX1 scope and tests | Current (Code, Oct 10). Evidence record. §3's "separate defects" conclusion is superseded by U7 (Oct 10) |

## Planning — `reference/` (not a build input; do not give to Code)

| File | What it is |
|---|---|
| `zed-idler-design-lead-brief.md` | Business model, roadmap, release readiness, working agreements |
| `wandering-design-audit.md` | What was fixed and the decisions still open |
| `00-document-index.md` | This file |

## Parked — `reference/parked/`

| File | What it is | Parked until |
|---|---|---|
| `wandering-church-scene.md` | The Church: optional specialized comfort. Repeatable POI `[DECIDED Oct 9]`; never gates core comfort `[DECIDED Oct 3]`; shop and blessing output `[PARKED]` | POI Framework v1 is complete and the comfort-items system exists |
| `wandering-workshop-scene.md` | The Workshop: field repair and salvage. Normal POI placement `[DECIDED Oct 9]` | POI Framework v1 is complete |
| `wandering-horde-ground-scene.md` | The Horde Ground: wave combat for RMAT | POI Framework v1 is complete and the Horde Ground is scheduled |
| `faction-quests-and-poi-density.md` | Faction quests, travel altercations, per-grid POI density | POI Framework v1 and a faction quest system |
| `headshots-concept.md` | Headshots as killing-blow crits | Gear/weapon metrics are defined |
| `design-notes.js` | Old design tables removed from the game code. Predates spec v2.0; not authoritative | Ideas only; check against the spec before reusing |

## Archived — `reference/archive/` (design records) and `archive/` (handoffs)

| File | Why |
|---|---|
| `batch2-handoff.md` | Batch 2 finished |
| `batch3b-brief.md` | Batch 3B finished |
| `r1-brief.md` | R1 built and tested (42/42). Confirm CLOSED with Code |
| `h1-batch.md` | H1 batch contract, CLOSED Oct 10 |
| `h1-acceptance-report.md` | Code's H1 acceptance report (Oct 10) |
| `wandering-tab-spec-pre-merge-oct9.md` | Spec copy replaced Oct 9 by the merged v2.1 |
| `wandering-church-scene-pre-disposition-oct9.md` | Church brief before the Oct 3 disposition was integrated (Oct 9) |
| `archive/design-handoff-oct9.md` | Oct 9 handoff |
| `archive/design-handoff-oct10-am.md` | Oct 10 morning handoff, replaced by session 2 |

## Retired names (do not use)

| Name | Replaced by |
|---|---|
| `zombie-idler-wandering-spec.md` | `wandering-tab-spec.md` (its content was merged into v2.1 on Oct 9; the copy in `uploads/` is no longer current) |
| `zombie-idler-wandering-brainstorm.md` | `wandering-tab-spec.md` |

---

## Decisions log (recent)

| Date | Decision | Recorded in |
|---|---|---|
| Oct 10 | FX2 locked with P1 (no new saved field for discarded time) and P2 (check 4 uses a save → load round-trip) | `fx2-per-return-cap-slice.md` §4.1 |
| Oct 10 | J6: the first meeting is a wake-up scene at the Elder Jester's camp after being Downed; the first in-game Downed is his second appearance. J7: H2 runs 80 runs | `elder-jester-concept.md` §7 |
| Oct 10 | J1: the Elder Jester. U20: starter weapon identities. U21: the first med kit is a locked quest item (deliver only). U22: pouch and scout kit also come from the Jester. U23: skippers meet the Jester later, without the kit. U24 `[CONCEPT]`: the Jester is a story guardrail, not a rescuer. H2: B once per starter weapon | `elder-jester-concept.md` §7; `starter-weapons-cb1-slice.md` |
| Oct 10 | U15 `[CONCEPT]` Elder Jester companion. U16 starter kit only through the Jester. U17 starter weapon pick: Nail Bat, Iron Knuckles or Pocket Knife. U18 tutorial ends at the Fort's approach. U14 refined: skip allowed with the warning "You will not have access to an early, easy start." U19: U11 + U14 are one system; H2 measures the cost of skipping | `elder-jester-concept.md` §2 |
| Oct 10 | U12: first Downed keeps the whole haul (tutorial Q4). U13: the first-Downed splash shows even when the tutorial was skipped. U11 and U14 `[CONCEPT]`: narrated first-session finds point to tabs; skipping the tutorial forfeits its items (would supersede tutorial §3.2's Oct 1 "granted at save creation" once locked) | `scenario-b-and-first-downed-oct10.md` §2–3 |
| Oct 10 | U8: Scenario B = belt pouch + padded jacket + board with nails; tests whether preparing pays off. U9 `[CONCEPT]`: "hard at first" message at the first Downed, with a splash when the player is off the Wandering screen | `scenario-b-and-first-downed-oct10.md` |
| Oct 10 | U5: reaching 1 HP from any damage source triggers Downed (supersedes U1's "0 or below"). U6: the Downing hit's log shows full damage. U7: the HP drain bug is the HP-below-1-on-Downed defect; folded into FX1 | `fx1-hp-floor-slice.md` §2; spec §13.8 at FX1 close |
| Oct 10 | HP floor 1 in all states (Q1); 24 h cap counts carried time per return (Q2); buffs evaluated at simulation time (Q4); `moveSpeed`/`healPct` move to shared rules (Q5). Each a separate batch, not H1 | Spec §13.8, §9, §3.2; `h1-findings-decisions-oct10.md` §1 |
| Oct 10 | H2 runs two scenarios: authentic new save, and a simulation-only starter-carrier fixture (Q6) | Sim-harness brief §6 D4, D5, D10, D11 |
| Oct 10 | U1–U4 decided: Downed keeps HP at 1; strict 24 h per-return cap including carried time; H2 waits for H1, FX1, FX2; Scenario B uses the Belt Pouch | `sim-harness-v1-brief.md` |
| Oct 10 | H1 (one clock, seeded rolls) CLOSED; browser isolation passed on the local build | `archive/h1-acceptance-report.md` |
| Oct 10 | XP decay floor (Q3) pending Code's verification; no fix authorized | Spec §3.4 note |
| Oct 9 | The Church is a repeatable POI type | POI framework §3; Church brief §2 |
| Oct 9 | The Workshop uses normal POI placement | POI framework §3; Workshop brief §2 |
| Oct 9 | The world is not a fixed size; every POI type places per grid | POI framework §2; faction quests brief §3 |
| Oct 9 | Church disposition integrated: core comfort independent of the Church; shop and trade `[PARKED]`; blessing output `[PARKED]`; Remove stress `[PROPOSED]` | Church brief §0, §3-6, §10 |
| Oct 9 | Spec v2.1: two diverged copies merged (batch 1A-3B decisions + Oct 1 story-item and familiarity rules) | `wandering-tab-spec.md` |
