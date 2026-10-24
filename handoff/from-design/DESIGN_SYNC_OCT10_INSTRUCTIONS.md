# Design → Code: Oct 10 Design sync (read and execute)

**From:** Claude Design · **Authorized by:** Sam (Oct 10: "Find it and fix it")
**Do this before CB1 step 0.** CB1's baseline must include this change.

## 1. What happened
Design made one game-code change at Sam's direct request (a display bug), and locked CB1. Six files changed. Sam copies them into `E:\Zed_Idler`; your job is to verify them, record them, and confirm.

| File | Change |
|---|---|
| `screens-v3.jsx` | Display fix (§2). The only code change |
| `Zombie Idler v2.html` | `screens-v3.jsx?v=1791000000000` → `?v=1791672000000` (cache-buster only) |
| `Zombie Idler v2 - TEST SAVE.html` | Same cache-buster change |
| `CURRENT_BATCH.md` | **CB1 starter weapons, LOCKED Oct 10.** Now the active batch |
| `DESIGN_HANDOFF.md` | CB1 locked; preview sync check; display fix record |
| `reference/starter-weapons-cb1-slice.md` | Status line: LOCKED |

No other file changed. No engine file (`game/*.js`), test, save key or save version was touched.

## 2. The display fix (`screens-v3.jsx`)
**Bug (Sam's report):** in watched Wandering, the red damage numbers over the survivor didn't match the HP lost.
**Cause:** the screen called `setPlayerHp(run.hp)` as soon as a fight resolved, so the HP bar dropped by the whole fight's damage at once. The per-strike numbers then replayed over ~2 s. A "−3" floated up after the bar had already lost 26.
**Engine checked, correct:** across 500 `simulateCombat` runs, the sum of enemy `dealt` always equalled `hpBefore − hpLeft`. The logged "hits you for N" matches.

**Change (display only, four places):**
1. After `const [dmgPops, setDmgPops] = React.useState([]);`:
   ```js
   const [hpLag, setHpLag] = React.useState(0);
   const hpShown = Math.min(100, playerHp + hpLag);
   ```
2. In the live-beat `show()`, zombie branch, after the `hits`/`gap` line: sum the enemy strikes (`h.by !== 's'`, `h.d > 0`) and `setHpLag(l => l + eTot)`.
3. In the per-strike replay: an enemy strike now does `popDmg('player', h.d); setHpLag(l => Math.max(0, l - h.d));`.
4. The HP text, the `ProgressBar` (value, color, `animated`) and the Current Survivor `InfoRow` read `hpShown` instead of `playerHp`.

**Unchanged on purpose:** `playerHp` and the `syncWanderState({ hp: playerHp, … })` effect still use the real value, so the engine never sees the display value. No rule moved into the screen.

## 3. Execute
1. **Hash check.** sha256 the six files and record before → after in `CODE_STATE.md`. Confirm every `game/*.js` file and every test file is unchanged from the Oct 10 package (`MANIFEST.md` hashes).
2. **Read the diff.** Confirm `screens-v3.jsx` differs from the Oct 10 package only in the four places in §2. **Stop and raise a Design Handoff** if anything else differs, or if you find `hpShown` reaching the engine (any `syncWanderState`, `wanderAct` or save write).
3. **Regression.** Run all 17 suites; `r1` ×5; `sim-clock-rng` ×5 identical. Everything must pass unchanged. No test edits are authorized.
4. **Browser check (with Sam, TEST SAVE, one tab).** Record the real-save fingerprint first. Watch 3 fights:
   - the HP bar and readout step down with each red number;
   - when the replay ends, the HP shown equals the engine HP (`ZI.getWanderRun().hp`, rounded);
   - a fight followed by a heal top-up ends on the healed value;
   - a Downed fight → Forced Retreat ends at 1 HP and rest rises from there.
   The fingerprint must be unchanged at the end.
5. **Record.** Add a short "Oct 10 Design display fix" section to `CODE_STATE.md`: files, hashes, results.
6. **Then start CB1** from `CURRENT_BATCH.md` at step 0 (baseline includes this change).

## 4. Known limit (report, don't fix)
If a heal top-up follows a fight in the same beat, the bar briefly shows the post-heal value plus the unreplayed damage, then steps down to the healed value. The order of display is slightly off and the end value is right. Note it in your report; Design will decide whether it needs work.

## 5. Report back
One file, `handoff/to-design/DESIGN_SYNC_OCT10_REPORT.md`: hash table, diff confirmation (§3.2), suite results, browser check results with the fingerprint, and the closing line:
`DESIGN SYNC OCT10: VERIFIED` or `DESIGN SYNC OCT10: NOT VERIFIED — <reason>`.
