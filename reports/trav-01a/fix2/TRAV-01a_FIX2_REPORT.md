# TRAV-01a — Fix 2 report (Oct 25)

**Trigger:** Sam's 7-step TEST SAVE smoke test (Oct 25, by voice). Steps 3–6 and desktop step 7 passed. Two failures were reported.
**Status:** **TRAV-01a: NOT CLOSED.** One fix applied; one report did not reproduce. Sam re-checks both (below).

## Bug A — Scout gives Stealth XP on every scout of the same cell

**Result: not reproduced on the current build. No code change.**

- Real page, headless Chromium, new save, no Wandering: five Scouts on the same cell. Stealth XP went 0 → 5 on the first Scout and stayed at 5. The result line said "No XP: already earned here today" on scouts 2–5. The daily record held one entry (`scout:<gx>,<gy>`).
- The Stats screen showed "Stealth Lv 1/50 · 5/148 XP" after each of three Scouts.
- `tests/trav-01a.test.js` check 3 and the browser check "five scouts of the same cell gave Stealth XP once (+5)" both pass.
- All Traversal actions go through `doAction` → `ZI.travEmitOnce`; no other code grants Scout XP on this screen.

**Likely causes of what Sam saw:**
1. The zone panel acts on the **last cell clicked**. Scout works on your own cell and the cells next to it, and each new cell gives XP once. Clicking a neighbour between scouts gives XP again, which is intended.
2. Wandering running in the background also gives Stealth XP (seen earlier in the same session with Hide).

**Re-check for Sam:** after each Scout, read the result line under the panel. "+Stealth XP" should appear once per cell per day; repeats should say "No XP: already earned here today". If a repeat on the **same coordinate** says "+Stealth XP", note the coordinate and the time.

## Bug B — Zone panel does not open as a bottom sheet at phone width

**Result: reproduced and fixed.**

- **Cause:** below 760 px the Solo Traversal screen kept its three desktop columns (Afflictions 240 px, map, Zone Details 300 px). At 390 px the map was 4 × 4 px, so no cell could be tapped and the sheet never opened. This also caused "I can't move around". The sheet code itself was correct.
- **Fix (`screens-v3.jsx` only):** in Solo below 760 px (the same breakpoint Wandering uses) the screen stacks: map first at full width, Afflictions and Resources below, and the side column is hidden because the bottom sheet replaces it. Camp Leader and desktop layouts are unchanged. Marked `TRAV-01a fix 2` in the code.
- **Evidence:** at 390 × 844 the map renders (32 px cells) and a tap opens `[data-trav="sheet"]`, both with a mouse and with touch. Screenshots: `phone-map-before.png`, `phone-map-after.png`, `phone-sheet-after.png`.
- **Desktop:** `tools/browser-check/trav01a-checks.js` gives identical results before and after the fix. (Its check "Hide moved the clock by 1 game hour" fails in both runs because CLOCK-01 changed Hide to 12 game hours; that browser check needs updating by the CLOCK-01 work.)
- **Regression:** `node tools/run-tests.cjs` — 34 suites, 775 passed, 0 failed.
- Pre-fix copy: `reports/trav-01a/fix2/screens-v3.before-fix2.jsx`.

**Out of scope (phone-layout batch, D5 Oct 22):** the header line ("THREAT 5/5" is clipped at 390 px) and general phone polish.

## Re-check for Sam (closes TRAV-01a if both pass)

1. Reload the TEST SAVE with **Ctrl+F5**. The HTML pages still load `screens-v3.jsx?v=20261024-allart`, so a normal reload can use the old cached file. They were not edited because another session was changing them at the time.
2. Narrow the window to phone width (or F12 → Ctrl+Shift+M → a phone). The map should show at the top; tap a cell; the zone panel should slide up from the bottom; tap outside it to close.
3. Scout one cell twice and read the result line both times (Bug A re-check above).
