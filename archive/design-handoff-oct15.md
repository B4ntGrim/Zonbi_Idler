# Zed Idler — Design Handoff (Oct 15)

**Read first:** `CLAUDE_DESIGN_RULES.md`, then this file, then `reference/00-document-index.md`.
**Replaces:** the Oct 10–13 running handoff, archived as `archive/design-handoff-oct13.md`.
**Active batch:** **H2**, locked Oct 15; **steps 0–3 done, stopped for review** (`handoff/to-design/H2_DRY_RUN_REPORT.md`).

---

## 1. Decisions made (Oct 15)

- **JD1a CLOSED.** Sam's real-save fingerprint passed (29 keys, 989431190 before and after).
- **Playtest findings logged:** PF1 stress alone holds the resume gate (balance, `[OPEN]`); PF2 medkit heals nothing (defect).
- **PF2 → FX5 before H2** (Sam). Then Sam: "find the bug and fix it for FX5 to close."
- **FX5 CLOSED.** Cause: the rest step rebuilt HP from its start value each step, erasing any heal used while resting (the kit or charge was still spent). Fix: a heal above the rest curve restarts the curve from the healed HP (`game/active.js` `WS._restStep`). Spec §13.8 gained "Healing while resting". D-FX5a `[DECIDED]`; D-FX5b no refund `[PROPOSED]`, not built.
- **H2 drafted and LOCKED.** H2-a Scenario A = designed skipper (feature on in the harness only, `eligible:false`, no kit). H2-b the B meeting at the idle player's next 8 h return (wait classed INFO). H2-c watched-vs-offline (T3) on A and B-bat only.
- Stray scratch files `a.tmp` and `b.tmp` deleted (Sam).
- **H2 steps 0–3 built** (Sam: "continue"): runner `tools/sim-harness/`, 17/17 acceptance checks, dry run clean and reproducible across machines. Finding: the survivor rests 89–99% of the time, mostly waiting on stress (PF1 at full scale); Downed ~18–27 times a day in every start.

## 2. Where the build stands

**CLOSED:** H1 · FX1–FX5 · CB1 · RB1 · RB2 · JD1a. The Jester rules exist with the switch off for players.
**Queue:** **H2** (80 runs) → JD1b (Jester scene) → weapons Phase 1 read-only audit.

## 3. Files changed (Oct 15)

| File | Change |
|---|---|
| `game/active.js` | FX5 fix in `WS._restStep` |
| `Zombie Idler v2.html`, `… - TEST SAVE.html` | `active.js` cache-buster |
| `tests/fx5-medkit-heal.test.js` | **New**, 10 checks |
| `tools/browser-check/fx5-checks.js` | **New** headless browser check |
| `handoff/to-design/JD1a_COMPLETION_REPORT.md` | Closing line CLOSED; fingerprint PASS |
| `handoff/to-design/FX5_COMPLETION_REPORT.md` | **New** |
| `CURRENT_BATCH.md` | H2, locked |
| `CODE_STATE.md` | FX5 fact; JD1a closed |
| `reference/archive/jd1a-batch.md`, `fx5-batch.md` | **New** archived contracts |
| `reference/fx5-medkit-heal-slice.md` | **New**; CLOSED |
| `reference/playtest-findings-oct15.md` | **New**; PF2 fixed |
| `reference/h2-batch-draft.md` | **New** |
| `reference/wandering-tab-spec.md` | §13.8 Healing while resting |
| `reference/sim-harness-v1-brief.md` | Status line → H2 draft |
| `reference/jd1a-batch-draft.md`, `first-displacement-slice.md`, `gameplay-fix-batches-proposal.md`, `00-document-index.md` | Status, rows, decisions log |
| `tools/sim-harness/h2.js`, `h2-tests.js`, `README.md` | **New** H2 runner and checks |
| `reports/sim-harness-v1/dry/`, `t3.json` | Dry-run records (artifacts) |
| `handoff/to-design/H2_DRY_RUN_REPORT.md` | **New** |
| `DESIGN_HANDOFF.md` | This file; previous archived |

## 4. Open questions

**For Sam (later):** PF1 option (after H2 measures it) · D-FX5b refund (default no) · Fort-bound Med Kit display values (copied from Field Medkit).
**For Sam (now):** run step 4 (the 80-run baseline) as-is (recommended), or decide PF1 first · **For Code:** R1 still needs `BATCH R1: CLOSED` (POI framework blocked until then) · Q3 XP decay floor evidence.
**Carried, unchanged:** tutorial spec fold-in of the Jester decisions; U24 Jester guardrail session; audit §2 A–E; Church and Workshop counts per grid; distance scaling; Code's four world-grid questions; duplicate H1 acceptance reports.

## 5. Next step

Sam reviews the dry run (`H2_DRY_RUN_REPORT.md`) and says go for step 4, the 80-run baseline.
