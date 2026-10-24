# FX1 Step 1 — Investigation Report (Oct 10)

**Batch:** `CURRENT_BATCH.md` = FX1 HP floor and Downed (LOCKED Oct 10). **Step 1 only: read-only.** No game code, tests or saves were changed.
**Result:** **STOP for review.** Two HP-lowering paths are not listed in Code's review, and both sit outside FX1's likely files. Routing them into Downed needs a design decision (batch stop condition).

---

## TQ-FX1a — Every code path that lowers survivor HP

| # | Path | File:line | Where it runs | Floors at 1 today? | Triggers Downed today? |
|---|---|---|---|---|---|
| 1 | Fight (zombie encounter) | `game/wandering.js:326` `state.hp = res.hpLeft` | Wandering sim: watched, offline, headless | **No — stores 0** (the DH1 defect) | Yes when the fight isn't won (`res.outcome !== 'win'`, lines 327–331). **Not** when a won fight leaves exactly 1 HP |
| 2 | Policy hit | `game/wandering.js:425` `Math.max(1, hp − r.dmg)` | Wandering sim, every 30 s of run time | Yes | **No** — survivor keeps wandering at 1 HP |
| 3 | Failed venture (discovery prompt) | `game/active.js:224–225` `Math.max(1, hp − hpLoss)` | Wandering sim (policy default) and the screen (player choice) | Yes | **No.** Its optional ambush (`active.js:232`) is a fight, so it can Down through path 1 |
| 4 | **Failed Fort guard attack** | `game/fort.js:164–166` → `syncWanderState({ hp })` | Fort scene (player action) | Yes | **No.** Also sets a 3-day injury |
| 5 | **Failed Traversal loot search** | `screens-v3.jsx:884–887` → `syncWanderState({ hp })` | Traversal screen (player action) | Yes | **No** |

Not HP-lowering, checked and excluded: rest (`wandering.js:391–392`, `active.js:749`) only raises HP; heals (`active.js:365`, `441`; screen `1848`) and revive (`active.js:451`) only raise; `escapeOpportunityDamage` (`stats.js:211`) is defined but **never called**; screen line 1748 only displays stored HP; screen line 1711 lowers *zombie* HP.

**Correction to Code's readiness review §4:** it lists `screens-v3.jsx:886` as "the screen getaway". It is the **Traversal loot failure** (path 5). The review did not list the Fort attack (path 4).

## TQ-FX1b — Can the Downed handling be called from non-fight paths?

**Yes, for paths 1–3, without touching `combat.js` or the hack-and-slash mode.** Downed is handled inline in `resolveEncounter` (`wandering.js:327–331`): `ZI.simHeal(state, rng, true)` → `ZI.simRevive(state)` → `ZI.forcedRetreat(state, 'downed', rng)`. All three are plain functions in `game/active.js` that need only `state` and `rng`, and the policy-hit and venture code both have those in hand.

**Smallest shared function `[PROPOSED]`:** extract lines 327–331 into one helper (for example `ZI.WanderSim._downed(state, rng, away)`), call it from the fight path (also when a won fight leaves HP at 1), the policy hit and the failed venture. It must accept `away = null`, because a venture the player chooses on screen has no away summary. Files: `wandering.js` and `active.js` only, both in the batch's likely files.

**Paths 4 and 5 can't call it cleanly.** They run outside the simulation (no `rng`, no `away`, and the survivor may not be on a run), and they live in `fort.js` and `screens-v3.jsx`, which are **not** in FX1's likely files.

## TQ-FX1c — Can anything lower HP during Forced Retreat or Base rest?

- **Inside the simulation: no.** While `state.resting`, `advance()` runs only the rest step and `continue`s or `break`s (`wandering.js:379–383`). No encounter, policy hit or prompt can fire. `forcedRetreat` also refuses to run twice (`active.js:525`).
- **Outside the simulation: yes.** Paths 4 and 5 write HP with `syncWanderState` regardless of run state, so a Fort attack or Traversal loot during Base rest lowers HP. **Side effect found:** rest then recalculates HP from `restStartHp` + rate × elapsed (`wandering.js:391`), so that damage is **silently erased** on the next rest step. Minor, and not FX1's to fix; noted for the record.

## TQ-FX1d — Is `screens-v3.jsx:886` a gameplay write?

**Yes.** It is the Traversal screen's loot action writing survivor HP into the saved run: gameplay logic living in the screen, the same pattern FX4 removes for `moveSpeed` and `healPct` (spec §9, "the screen never writes"). It is not needed for paths 1–3. **Recommend:** do not move it in FX1; list it as a candidate for FX4 or a small follow-up.

---

## Conflicts with the locked HP rules

| # | Conflict | Detail |
|---|---|---|
| **K1** | **Fort attack vs U5** | U5: reaching 1 HP from **any** source Downs. Spec §13.8 (Batch 3B, still in force): "A failed Fort guard attack keeps its Fort-specific costs and **is not a Forced Retreat**." If the attack takes HP to 1, the two rules disagree |
| **K2** | **Traversal loot vs U5** | The loot action can take HP to 1 while the survivor isn't on a Wandering run. Downed → Forced Retreat has no run to end. U5 doesn't say what "Downed" means off-run |
| K3 | Fight that ends exactly at 1 HP | Today a *won* fight at exactly 1 HP doesn't Down. U5 requires it. Already covered by FX1 check 3; no conflict, just confirming the code needs a post-fight check, not only the clamp |

No conflict with Q1 (HP ≥ 1): every path except the fight already floors at 1.

## Other observations (out of FX1 scope, recorded only)

- A fight that hits the 100-round limit ends as `flee`, which also counts as "not won" and spends a heal even with HP above 1 (`wandering.js:327`). Pre-existing; rare.
- `escapeOpportunityDamage` is dead code.

---

## Recommendation for the next step

**Sam decides K1 and K2.** Recommended `[PROPOSED]`:

> **U5 applies to damage inside the Wandering run** (fights, policy hits, ventures and their ambushes). **Scene and Traversal actions** (the Fort guard attack, Traversal loot) floor HP at 1 and keep their own costs, but do not Down the survivor. The next damage inside a run Downs them as usual.

*Why:* it keeps the Batch 3B Fort rule intact, gives "Downed" a clear meaning (it ends a run, so it needs a run), and keeps FX1 inside its likely files (`wandering.js`, `active.js`). No exploit opens: a survivor at 1 HP can't take run damage without being Downed.

Then FX1 proceeds to step 2 with: the shared Downed helper for paths 1–3, the post-fight check for exactly 1 HP, the one-line clamp at `wandering.js:326`, and the 11 acceptance checks as written. If Sam instead wants paths 4–5 to Down, FX1's likely files must add `fort.js` and `screens-v3.jsx`, and the Fort rule in §13.8 must change. That's a bigger batch.

**Closing state:** FX1 step 1 complete. **Stopped**; waiting for Sam's decision on K1/K2 and approval to implement.
