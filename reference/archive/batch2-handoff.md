# Batch 2 handoff (written Oct 4, before Batch 2 started)

Status: Batch 1 closed (check 1 INCOMPLETE, check 3 PARTIAL). Batch 2 not started.

## Where things live
- `game/wandering.js`: `ZI.WanderSim` (rollEncounter, resolveEncounter, step, advance, `_withRng` temporary Math.random swap), `ZI.WanderEngine` (offline/background, calls `WanderSim.advance`), policy (`zi_wander_policy`, cooldown, pools, `wanderPolicyStep(rng)`), `ZI.seededRng`.
- `game/stats.js`: XP bus (`awardXp`, `emitAction`, `ACTION_XP`: kill = combat only, loot = scavenging), decay (`DECAY` table, `skillRust`, `settleSkillDecay` runs only at load from bootstrap), combat roll formulas (3 `Math.random` uses).
- `game/combat.js`: `simulateCombat(survivor, enemy, mode)` (no rng parameter yet).
- `game/save.js`: `SAVE_FORMAT` / `migrateSave()` (v0 → v1), run last in `game/bootstrap.js`.
- `game/items.js`: carrying 1A/1B (carried store `zi_carried`, pockets/kg, take/put back, base/camp gate, single-copy equip, story protection).
- `screens-v3.jsx`: `WanderingScreen` still runs its own spawn + turn-based combat with typed commands (kill/heal/scout/push/retreat, 60/day limit). Live kills emit `kill` only (no `loot`), so live kills grant no Scavenging XP.

## Part A must-finish items (from the Batch 2 brief)
1. Live screen calls `WanderSim.step` and only animates; remove its own spawn/combat loop.
2. Live = offline for same seed + elapsed time.
3. Live kill grants Combat and Scavenging once each.
4. Pass rng directly through `_bgZombie`, `simulateCombat` and the stats.js rolls; review the 6 other `Math.random` uses in wandering.js; delete `_withRng`.
5. Periodic decay settle: `lastSettledUtc` per save; hourly from the engine and on skill-level read; one-day absence cap only for closed time.
6. Timed rest replaces the instant out-of-heals rest (5% max HP/min at base, resume at 80%, settles on read, offline under 24 h cap, rates in a data table). Current behaviour: instant rest to 100 HP (≈24 loops in 10 offline minutes).
7. Re-confirm v0 save → v1 migration.

## Tests to keep green
`tests/fort-s12.test.js` (100), `load-regressions` (14), `split-equivalence` (17; allow-lists in its CHANGED_FN / ADDED / DATA_CHANGED / STORE_ADDED), `bug-fixes` (17), `carrying` (27), `carrying-1b` (29), `batch1` (16). Test-save build: `Zombie Idler v2 - TEST SAVE.html` (zitest__ namespace); `tests/qa-helper.js` has `QA.fp()` / `QA.realSnap()` to prove the real save is untouched.

## Carrying already done (Batch 3 must not repeat)
Kilogram capacity model, pocket sizes, carrier data (incl. Belt slot and 6 new carriers as data only), `zi_carried` store + migration, totals, validation (pockets, 125% hard limit), take/put back UI with base/camp rule, story-item rules. Still for Batch 3: overload stress and speed, haul pickup limit and haul persistence, carrier recipes and balance, difficulty.
