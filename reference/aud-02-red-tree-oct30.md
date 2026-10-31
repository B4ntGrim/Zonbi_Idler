# AUD-02 — The red working tree of Oct 30: what broke and why

**Status:** diagnosis for the session building profession bonuses. Nothing here is a design
decision; it records what the suite is reporting and who owns each line.
**Measured at:** working tree on `codex/tome-milestone-content`, Oct 30, **26 failures / 46 suites**.
**Committed baselines for comparison:** clean `HEAD` is green, and `HEAD` plus only the SLOT-01,
SCOUT-01 and MED-01 work is green. Every failure below comes from uncommitted work in the tree.

## 1. What is being built

Three features are in flight at once, none of them documented in `reference/` or `CHANGELOG.md`:

1. **Profession passive bonuses** — `ZI.professionLevelDelta`, `ZI.professionBonus`, plus
   `bonuses:[…]` on every entry of `ZI.PROFESSIONS`. Combat scales weapon damage, Endurance adds
   `dmgReductionPct`, Athletics drives movement speed, Scavenging and Foraging change loot.
2. **World cell locking** — `ZI.isWorldCellLocked`, `ZI._rawWorldCellLocked`,
   `ZI.getLockedCellProgress`, with matching Traversal UI.
3. **Traversal field supplies** — eating, medkits and bandages usable from Traversal, and a
   nutrition path alongside the existing hunger tiers.

Most of the 26 failures are **not defects**. They are tests holding the pre-bonus numbers.

## 2. Failure map

| Suite | Failing | Cause | Owner | Action |
|---|---|---|---|---|
| `fx4-shared-attributes` | 6 | Athletics now moves walk/jog speed; the suite pins 1.4 m/s and the old gear deltas | Profession bonuses | Re-baseline **after** the numbers are settled |
| `stat-02-live` | 5 | Combat scales damage (22 → 30); nutrition rework changes the fresh-survivor tiers and the top-bar meter | Bonuses + nutrition | Re-baseline; confirm "fresh survivor is Well Fed" is intended |
| `carrying` | 2 | `carryCapacity` now derives from kg | Profession bonuses | Re-baseline |
| `bal-a-walk-home-broken` | 2 | Broken penalties (max HP 82, speed ×0.7) shift under the new modifiers | Profession bonuses | Re-baseline |
| `split-equivalence` | 6 | New symbols, changed shared functions, and `PROFESSIONS` data now carries `bonuses` | All three features | Register in the documented `ADDED` / `CHANGED_FN` / `DATA_CHANGED` lists, **after** reviewing the changed functions |
| `r1` | 1 | Resume-at-80%-HP timing moves with the new regen/HP modifiers | Profession bonuses | Re-baseline |
| `routes-preparation` | 1 | "Other-mode estimate changed" — squad runs pick up the new bonuses | Profession bonuses | Decide whether camp/squad runs should take them at all |
| `trav-01a` | 1 | The Camp Leader "right column" block is no longer byte-identical to `archive/pre-trav01a-oct21` | World cell locking UI | Confirm the Zone Details change is intended, then refresh the guard |
| `sim-clock-rng` | 1 | **A real defect — see §3** | Profession bonuses | **Fixed** |
| `fx3-buffs-sim-time` | 1 | Buff timing drifts with the new speed modifiers | Profession bonuses | Re-baseline |

## 3. The one real defect `[FIXED Oct 30]`

`game/wandering.js`, inside `wanderPolicyStep`:

```js
const bonusSalvage = Math.min(0.1225, ZI.professionBonus('scavenging', 0.0025));
if (bonusSalvage > 0 && rng() < bonusSalvage) loot.value += 1;   // ← conditional draw
```

The draw was taken **only once Scavenging was high enough for the bonus to exist**. That makes the
*number* of values pulled from the seeded stream depend on character state, so two survivors on the
same seed fall out of step and their runs stop being comparable. Every BALANCE-03 and CLOCK-01
comparison rests on one seed replaying one sequence.

Changed to draw unconditionally:

```js
if (rng() < bonusSalvage) loot.value += 1;
```

Guarded by `tests/sim-02-seeded-stream.test.js`, which fails if any new state-gated draw appears.

**The fix is applied in the working tree but is not committed**, because it sits inside the
uncommitted profession-bonus feature; committing the line would commit that feature with it.
Whoever commits that work carries the fix along.

### A pre-existing site, deliberately left alone
`WanderSim.resolveEncounter` has `if (chance > 0 && rng() * 100 < chance)`, where `chance` comes
from `escapeChance(stealth, athletics, speed)`. It predates this work, and its draw already sits
inside the state-dependent `policyEvades` branch, so making it unconditional would shift every
historical baseline without removing the underlying conditionality. The guard allows this one site
by name and fails on any additional one.

## 4. Recommended order
1. Settle the profession-bonus numbers, then re-baseline the suites in §2 in one pass.
2. Review the changed shared functions before registering them in `split-equivalence`.
3. Confirm the Camp Leader Zone Details change, then refresh the `trav-01a` guard.
4. Give the three features a `reference/` entry and a `CHANGELOG.md` line.

## 5. Open for Sam
- `[OPEN]` Should camp and assigned-squad runs receive profession bonuses, or Solo only?
- `[OPEN]` `professionLevelDelta` returns `Math.max(1, level)`, so a level-1 survivor already
  carries one increment of every bonus. Intended, or should level 1 be the zero point?
- `[OPEN]` Is a fresh survivor meant to read **Well Fed** rather than the previous **Peckish**?
