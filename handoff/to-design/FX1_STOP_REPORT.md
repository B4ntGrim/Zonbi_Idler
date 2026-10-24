# FX1 — Stop Report (Oct 10)

**Status:** `FX1 HP FLOOR: NOT CLOSED` — **stopped at step 3 (regression run) on a stop condition.** Waiting for Sam.

## What was done
- **Decisions recorded first:** U25 (Fort scene exempt) and U26 (Traversal loot exempt) in `CURRENT_BATCH.md`, `reference/fx1-hp-floor-slice.md`, spec §13.8, the handoff and the index.
- **Step 0 baseline:** all 15 suites green. A full copy of the pre-FX1 build is kept outside the project for the differential and for rollback.
- **Step 2, implemented** (only `game/wandering.js` and `game/active.js` changed; `combat.js`, `fort.js`, `screens-v3.jsx` and all tests unchanged, hash-checked):
  1. Fight write clamps HP to 1 (`wandering.js:326`).
  2. One shared Downed helper `ZI.WanderSim._downed(state, rng, away)`: heal → revive → Forced Retreat, unchanged from the fight path.
  3. Fights Down when lost **or** when they leave HP at exactly 1 (U5).
  4. Policy hits that bring HP to 1 Down (U5); the log line uses the existing `policy` event so the screen shows it with no screen change.
  5. Failed ventures that bring HP to 1 Down (U5); the ambush is skipped if the survivor was sent home.
- **Step 3 not done:** the new `tests/fx1-downed-hp.test.js` suite and the authorized `sim-clock-rng` test-11 edit are not written yet.

## Evidence the fix works (ad hoc, outside the project)
3 policies × 6 seeds × 24 h, in 1-minute chunks:

| | Before FX1 | After FX1 |
|---|---|---|
| Lowest HP seen | **0** | **1** |
| Chunks where rest started from HP 0 | 24,534 | **0** |
| Downed by a fight → Forced Retreat | 1,100 | 953 |
| Downed by a policy hit → Forced Retreat | 0 | 11 (new, U5) |

## The stop
**r1 check 28 fails** (not 20 or 26, which pass). Regression: 14 of 15 suites unchanged; r1 has 41 of 42.

Check 28 asserts two things: (a) 1-second, uneven and bulk processing give **identical** results through withdrawal, banking, rest and redeployment, and (b) its two 3-hour scenarios actually contain a completed checkpoint withdrawal (`withdrawn`).
- **(a) still passes:** all three chunkings stay identical. No chunking or timing defect.
- **(b) fails:** in the FX1 build, one scenario's survivor is Downed while walking back to the checkpoint at low HP (a fight that leaves exactly 1 HP, then a policy hit at 1 HP → Forced Retreat), so no `withdrawn` event happens in the 3-hour window. In the old build the survivor sat at 1 HP, immune to policy hits, and finished the walk. That is the exact "free risk at 1 HP" window U5 closes.

So the failure is the **declared U5 difference**, not a bug. But editing check 28 is not authorized in the batch, so the batch stops here.

## Options for Sam
1. **Authorize a scenario edit to check 28 (recommended).** Keep its equivalence assertion (a) exactly as is; change only the scenario so a withdrawal still completes under U5 (for example, give the first case heals, or start it with more HP). This tightens nothing and weakens nothing; it updates a scenario that relied on the old 1-HP immunity.
2. **Revisit U5 for low-HP withdrawals.** For example, a survivor already withdrawing can't be Downed by a policy hit. This is a design change and widens FX1.
3. **Roll back** to the pre-FX1 build (one copy command) and re-plan.

**Watch for (design note):** with U5, the R1 HP-rule withdrawal is no longer a guaranteed safe walk home. A survivor withdrawing at very low HP can now be Downed on the way. That's consistent with U5's intent, but it makes Forced Retreats a bit more common than R1 assumed. H2 will measure it.

## Current state of the folder
FX1 code changes are in place (two files). One r1 check fails. Nothing else changed. No save keys or save version touched.
