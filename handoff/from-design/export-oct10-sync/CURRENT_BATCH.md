# BATCH CB1 — Starter weapons

**Status:** LOCKED Oct 10 (Sam). Active. Source: `reference/starter-weapons-cb1-slice.md` (§3 values, §7 batch).
**Previous:** FX1 and FX2 CLOSED Oct 10 (`reference/archive/fx1-batch.md`, `reference/archive/fx2-batch.md`). **After CB1:** FX3, FX4, H2.

## Goal
The Nail Bat, Iron Knuckles and a new Pocket Knife have the identities and starting values below. No other balance change.

| Weapon | Damage | Special | Loot | Weight | Rarity |
|---|---|---|---|---|---|
| Nail Bat | 28 (was 18) | `heavySwingPct` 30 | 0 | 3 kg (was 2) | Common |
| Iron Knuckles | 16 (was 20) | `staggerPct` 25 | 0 | 1 kg | Common |
| Pocket Knife (new, id `pocket_knife`) | 16 | `escapeBonus` +30 | +5 | 0.5 kg | Common |

## Decided behavior
1. Three new item fields: `heavySwingPct` (after the survivor attacks, chance to lose its next attack), `staggerPct` (when the survivor hits, chance the enemy loses its next attack), `escapeBonus` (added to escape chance when the policy evades). They are read only by the shared fight and escape code.
2. Item values exactly as in the table. The Pocket Knife is a new Melee item, common, with no recipe in this batch.
3. Item descriptions match their mechanics: Knuckles "25% stagger chance on hit"; Bat "Heavy swing: 30% chance to lose your next attack."
4. Items without the new fields behave exactly as today.

## Likely files
`game/items.js` · `game/stats.js` · `game/wandering.js` (only if escape needs the field passed) · new `tests/cb1-starter-weapons.test.js` · `CODE_STATE.md`.

## Steps
0. Baseline: all suites green; keep a pre-CB1 copy outside the project.
1. Answer, then continue only if no answer moves the change outside the likely files:
   - **TQ-CB1a** Can the fight function read the three fields in one shared place (`STAT_FORMULAS.resolveAttack` / `simulateCombat`) for watched, offline and headless fights, with no screen-side copy?
   - **TQ-CB1b** Can `escapeBonus` feed `escapeChance` the same way `activeEvadeBonus` does today?
   - **TQ-CB1c** List every test or seeded sequence that depends on the Nail Bat's or Iron Knuckles' current damage. A changed sequence not listed here is a stop condition.
2. Implement.
3. New suite and full regression.

## Acceptance checks
1. With `staggerPct` 100 the enemy never attacks after a survivor hit; with 0, fights match today's for the same seed.
2. With `heavySwingPct` 100 the survivor attacks at most every other turn; with 0, results match today's.
3. `escapeBonus` +30 raises escape chance by exactly 30 points, within the existing 5–90 clamp.
4. Over 20,000 seeded fights against tiers F–E (padded jacket, new-save levels), HP lost per fight is within ±0.15 of: Bat 2.55, Knuckles 2.82, Knife 3.71.
5. Watched, offline and headless fights give identical results for the same seed and loadout.
6. All other weapons give identical results to the baseline (differential).
7. Old saves holding a Nail Bat or Iron Knuckles load, and the items use the new values.

**Declared differences:** fights with the Nail Bat or Iron Knuckles equipped change. Nothing else may change.

**Explicitly out:** the Elder Jester, the starter-pick UI, recipes, the quest med kit, other weapons, the accuracy/evasion/speed rework, save keys and save version.

**Required verification:** all suites; the new suite; `sim-clock-rng` ×5 identical; r1 checks 20 and 26 checked, never edited.

**Closing line:** `CB1 STARTER WEAPONS: CLOSED` / `CB1 STARTER WEAPONS: NOT CLOSED`.
