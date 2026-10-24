# TRAV-01a — Completion report (Honest buttons, Traversal)

**Date:** Oct 21 · **Contract:** `CURRENT_BATCH.md` TRAV-01a, revision 1 (LOCKED by Sam Oct 21, after the step-1 report)
**Result:** all 12 acceptance checks pass. Full regression 662/662 (27 suites). Browser check 33/33, run twice.

**`TRAV-01a: CLOSED`** (code side). Next: Sam's TEST SAVE smoke test (CURRENT_BATCH §Smoke test, 7 steps).

---

## 1. Export applied first (rev1, compared before applying)

| File | Difference from the local copy | Applied |
|---|---|---|
| `CURRENT_BATCH.md` | Local was the first TRAV-01a export, unchanged. Rev1 adds S1–S7 and T14–T17 (separate scout pool, Hide shows tier range only, real-day XP limits incl. Travel, "play time left", Solo reload on Traversal, more Solo removals, Make camp no longer heals, Deploy disabled) | Yes. Old copy: `archive/pre-trav01a-oct21/CURRENT_BATCH-trav01a-v1.md` |
| `DESIGN_HANDOFF.md` | Additions only: TRAV-01a revision line; BAL-A NOT CLOSED carried again (E1 resolved); next step updated | Yes. Old copy: `archive/pre-trav01a-oct21/DESIGN_HANDOFF-oct21-v1.md` |
| `reference/trav-01-traversal-slice.md` | Additions only: T14–T17; P1/P3 now "real day" (S4 resolved); P2 deferred; panel "Lurking" → "Threats" | Yes. Old copy: `archive/pre-trav01a-oct21/reference/trav-01-traversal-slice-v1.md` |

No conflict between the batch and the slice after rev1. The game code had not changed since the step-0 hashes.
**Still open from step 1 (E3):** the index rows listed in the step-1 report, plus `reports/trav-01a/` and `archive/pre-trav01a-oct21/` (now also holding the v1 copies and `CODE_STATE-before-trav01a.md`).

## 2. What changed

| File | Change |
|---|---|
| `game/stats.js` (end) | `TRAVERSAL_TABLE` (5 scouts/day, Hide 1 game hour); Traversal scout pool `zi_trav_scout`; once-per-real-day XP gate `zi_trav_xp_day` (`travEmitOnce`) |
| `game/world.js` (end) | `wanderDrawableTiers` / `hideThreats`: Hide's threat level and tier range, using the same rule as `ZI._bgZombie` |
| `screens-v3.jsx` (Traversal only) | Behaviors 1–7 and 9: scout pool, XP limits, Hide, Make camp, tutorial target, Solo layout (afflictions, preview bar, zone panel, bottom sheet, controller), far/locked guards. Camp Leader branches are the pre-batch code, unchanged |
| `Zombie Idler v2.html`, `… TEST SAVE.html` | Solo reload boots on Traversal; Deploy disabled with its reason; cache-bust versions for the 3 changed scripts |
| `tests/trav-01a.test.js` | **New**, 57 checks |
| `tests/split-equivalence.test.js` | `ADDED` + 16 TRAV-01a symbols (labelled; same pattern as FX3, FX4) |
| `tools/browser-check/trav01a-checks.js` | **New** TEST SAVE browser check, 33 checks |
| `reports/trav-01a/` | Browser results (2 runs) and 4 screenshots (desktop, phone sheet, afflictions, Camp Leader) |
| `CODE_STATE.md` | TRAV-01a facts section |

**Not touched:** Wandering combat and charges (`active.js`, `wandering.js`, `combat.js` hashes unchanged), crafting, the Codex unlock rule, the game clock rate, loot amounts and safety, save version (still v8).

## 3. Acceptance checks

T = `tests/trav-01a.test.js` (headless rules plus source checks). B = browser check on the TEST SAVE page.

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | 5 Traversal scouts a day; each Scout spends 1; greyed with reason at 0; Wandering charges unaffected | **PASS** | T: 7 checks. B: scouted 5 times → 4,3,2,1,0; button disabled "No Traversal scouts left today. Refills at midnight."; `zi_charges` still `{heal:2, scout:2}` |
| 2 | Refill at local midnight; an offline return across midnights refills once, to 5 | **PASS** | T: 23:54 → 2 left, 00:00:30 → 5; after 3 midnights → 5, next spend → 4 |
| 3 | Scout, Hide, Travel XP once per cell per real day; another cell grants again | **PASS** | T: 6 checks, incl. next day grants again. B: 5 scouts of one cell = +5 Stealth once; Travel out, back, out = 2 × 4 Athletics |
| 4 | Hide shows threat level and the tier range Wandering can draw (matches `_bgZombie`) | **PASS** | T: drawn tiers from 4,000 real `_bgZombie` draws equal Hide's range at 6 states, Push On included. B: result and panel "Threats" line show the same range |
| 5 | Hide advances the world clock 1 game hour; names no kinds or counts | **PASS** | T: exactly 3,600 game s. B: +3,810 game s over 0.35 real s (the clock runs 600× real time); no bestiary name in the text |
| 6 | Solo: none of the Camp Leader controls; Camp Leader unchanged | **PASS** | T: each control only in the Camp Leader branch; the 3 Camp Leader blocks are byte-identical to the pre-batch build. B: Solo shows none; Camp Leader shows survivors list and all 5 tabs (screenshot) |
| 7 | Afflictions: Broken and Injured with the Wandering icons; "play time left" | **PASS** | T: icons taken from the Wandering header. B: "💔 Broken" then "🩹 Injured … About 90 min play time left (counts down only while the game is open)" |
| 8 | Tutorial after Loot points at Wandering; Solo reload opens on Traversal (both pages) | **PASS** | T: source of both pages. B: with the tutorial running, the spotlight said "Now go Wandering"; outside it Loot stays on Traversal; reload with a Solo resume opened Traversal |
| 9 | Make camp keeps HP and `healsUsed`; Command XP once per day; camp cell stored | **PASS** | T: saved run kept HP 37 and heals 2; XP true/false/true across days. B: HP 30 and heals 1 kept; second camp gave no XP |
| 10 | Deploy disabled with its reason when stamina is too low | **PASS** | T: both pages have `disabled={!canRun}`, a title and a visible reason. B: a fresh save has no route above its stamina, so the disabled state wasn't reached in the browser |
| 11 | Click / tap (sheet) / confirm open the panel; hover = preview only; every action has a cost or reason; Route mode disabled with reason | **PASS** | B: hover → one line, no panel; click → panel beside the map; touch → bottom sheet flush with the screen bottom; tap outside or swipe down closes; phone-size window → sheet; arrow + Enter → panel; far cell → all 5 actions "Too far — move next to it."; Route mode disabled "Route builder coming soon" |
| 12 | Regression: all suites pass; existing saves load with 5 Traversal scouts | **PASS** | 662/662 (baseline 605 + 57 new). A save without the new keys reads 5 and writes nothing on load. No page errors in the browser runs |

**Check that the tests catch the old bugs:** the new suite run against the pre-batch build fails at check 1.

## 4. Notes for Claude Design and Sam

- **N1. Fort entry in Solo** now takes one extra click: clicking the Fort cell opens the zone panel, which has "Approach the palisade". Before, a click on your own Fort cell opened the gate scene directly. This follows "select, don't hover, one panel for every cell".
- **N2. Phone layout is only partly ready.** The bottom sheet works at phone width, but the rest of the Traversal screen still uses the fixed desktop columns (pre-existing). On the TEST SAVE page the red "TEST SAVE" banner covers the sheet's Close button at phone size; swipe down and tap outside still close it. A phone layout pass belongs in its own batch.
- **N3. "Threats" stays known for the session only.** It shows the last Hide on that cell since the page loaded, because Hide's range follows the run's distance (it can change as you walk). Nothing is saved, so the save stays unchanged.
- **N4. Hide's range is usually just "F" early on.** Wandering's tier band grows with distance walked in the current run, not with the cell. This is honest but plain; the tier-band batch (cells own their zombies) is what makes Hide interesting.
- **N5. Still unlimited (outside this batch):** `zi_trav_scouted` is written but never read. Loot's Scavenging XP and Hide's world-clock cost are unchanged.
- **Smoke test tip:** Sam's step 1 can run out of scouts on the first cell; the pool refills at local midnight, not on reload.

## 5. Required verification

- Step 1 report: `handoff/to-design/TRAV-01a_STEP1_REPORT.md` ✔
- This report ✔
- **`TRAV-01a: CLOSED`** (code). Waiting for Sam's TEST SAVE smoke test. **BAL-A is still NOT CLOSED** (unchanged by this batch).
