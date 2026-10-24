# Zed Idler — Document Index (Oct 9)

Start here. This lists every design document, its folder and its status.
Rules for how design work is done: `CLAUDE_DESIGN_RULES.md` (project root).
Latest session handoff: `DESIGN_HANDOFF.md` (project root).
Code's list of deferred items: `PARKED.md` (project root). Kept by Code; separate from the parked design briefs below.

**Status key:** Current (in force) · Active slice (next to build) · Planning (not a build input) · `[PARKED]` (designed, not scheduled) · Archived (finished or retired)

---

## Current design — `reference/`

| File | What it is | Status |
|---|---|---|
| `wandering-tab-spec.md` (v2.1) | The master spec: policies, decay, factions, discovery prompts, stress, pockets, difficulty | Current. Source of truth for game rules |
| `wandering-fort-scene.md` | The first Fort: gate, guard, quest Fallow Ground | Current. Sections 10 and 11 are current; Sections 2-9 are partly superseded |
| `tutorial-first-session-spec.md` | The first 20-30 minutes | Current |
| `poi-framework-v1-brief.md` | Shared POI rules (placement, discovery, saving, revisits), proven with Water | **Active slice. Blocked** until R1 is confirmed CLOSED and the HP drain bug is fixed |
| `sim-harness-v1-brief.md` | Simulation and test harness: one clock, seeded rolls, policy × difficulty runs, gates 1 and 3 | H1 **CLOSED** (Oct 10). H2 decided in outline; starts after H1, FX1 and FX2 are CLOSED (U3) |
| `h1-findings-decisions-oct10.md` | Decisions on gameplay issues found during H1 (Q1–Q6) and open questions for Code (TQ1–TQ6) | Current. Q1, Q2, Q4, Q5, Q6 `[DECIDED Oct 10]`; Q3 pending verification |
| `gameplay-fix-batches-proposal.md` | Where Q1–Q6 were recorded, spec conflicts, batch order FX1–FX4, questions for Code and Sam, H2 scenario matrix | `[PROPOSED]`. Not a build input until Sam approves a batch |

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

## Archived — `reference/archive/`

| File | Why |
|---|---|
| `batch2-handoff.md` | Batch 2 finished |
| `batch3b-brief.md` | Batch 3B finished |
| `r1-brief.md` | R1 built and tested (42/42). Confirm CLOSED with Code |
| `h1-batch.md` | H1 batch contract, CLOSED Oct 10 |
| `h1-acceptance-report.md` | Code's H1 acceptance report (Oct 10) |
| `wandering-tab-spec-pre-merge-oct9.md` | Spec copy replaced Oct 9 by the merged v2.1 |
| `wandering-church-scene-pre-disposition-oct9.md` | Church brief before the Oct 3 disposition was integrated (Oct 9) |

## Retired names (do not use)

| Name | Replaced by |
|---|---|
| `zombie-idler-wandering-spec.md` | `wandering-tab-spec.md` (its content was merged into v2.1 on Oct 9; the copy in `uploads/` is no longer current) |
| `zombie-idler-wandering-brainstorm.md` | `wandering-tab-spec.md` |

---

## Decisions log (recent)

| Date | Decision | Recorded in |
|---|---|---|
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
