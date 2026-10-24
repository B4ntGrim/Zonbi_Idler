# BESTIARY-01 — Enemy identity and armor integrity (Oct 17)

**Status:** findings for review. Not closed. No production code, spec, save or balance value was changed; no enemy renamed; no identifier invented.

## 1. Verified root cause
Wandering encounters are built from a bestiary record and then stripped to a five-field object: `{ name, hp, atk, xp, seesThrough }`. Every later step (combat, escape, Codex, attribution, display) receives only the display name.
- **Ids:** the bestiary already has stable, unique ids (1–45, contiguous). No new identity scheme is needed; the existing `id` is simply not passed on.
- **Duplicate names:** two display names are used twice: Trapper Zed (`id 20` tier C; `id 38` tier S) and Battle Cry General (`id 22` tier B; `id 39` tier S).

## 2. Pipeline trace — where identity and attributes are lost
| Step | File · function | Current behavior `[CODE]` |
|---|---|---|
| 1. Definition | `bestiary-data.js` · `ZI.BESTIARY` | 45 records: `id, name, tier, base, traits, hp, dmg, spd, armor, xp, weakness, ability, loot, biome, notes`. No `stats` block |
| 2. Selection | `game/wandering.js` 105–114 · `ZI._bgZombie(lap, rng)` | Picks from the tier pool with one rng draw, then returns `{ name, hp, atk: dmg, xp, seesThrough }`. **`id`, `tier`, `armor`, `spd`, `traits`, `base` are dropped here.** `seesThrough` is computed from the full record, so the retreat-getaway counter is correct |
| 3. Encounter | `game/wandering.js` 310–313 · `WanderSim.rollEncounter` | Wraps the object as `{ kind:'zombie', z }` |
| 4. Codex | `game/wandering.js` 317 · `resolveEncounter` → `game/combat.js` 14 · `ZI.discoverZombie(id)` | Called only `if (z.bestiaryId)`, which is always undefined, so **no Wandering encounter ever unlocks a Codex entry.** Storage key: `zi_discovered_zombies` |
| 5. Escape (non-heinous policies) | `game/wandering.js` 318–320 · `game/stats.js` 196–212 · `escapeEnemyResist` / `escapeChance` | Reads `enemy.traits` (grab/hold/latch = unescapable; no bestiary entry has these today) and `enemy.spd`. With `spd` missing it falls back to 6 (resist 18) for every zombie |
| 6. Combat values | `game/stats.js` 261–272 · `STAT_FORMULAS.enemyStatBlock(z)` | Reads `z.armor` (missing → **0**), `z.spd` (missing → initiative 9), `z.stats` (none), `z.id` / `z.bestiaryId` (missing) |
| 7. Damage | `game/stats.js` 274–293 · `resolveAttack` | `dealt = max(1, dmg − def.armor)`: the existing formula is fine, but `def.armor` is 0 for every Wandering zombie |
| 8. Kill / headshot attribution | `game/wandering.js` 343 · `emitAction('kill', xp/10)`; 319–320 `'wander.escape'` meta `{ enemy: name }` | Kill events carry no enemy identity. Headshots are not implemented (`headshots-concept.md`, parked) |
| 9. Event record | `game/wandering.js` 316 · `out = { enemy: z.name, bestiaryId: z.bestiaryId, tier: z.tier, … }` | `bestiaryId` and `tier` are always undefined |
| 10. Live display | `screens-v3.jsx` ~1681 · Wandering screen `show(r)` | `undeadTypes.find(bestiaryId) \|\| find(name) \|\| undeadTypes[0]`. With no id it matches by name, which returns the **first** bestiary entry of that name (the lower tier). An S-tier Trapper Zed is shown with the C-tier record's details |
| 11. Codex screen | `screens-v3.jsx` ~2711 · `isKnown(z)` | Treats an entry as known if the discovered set holds its id, its `base`, or its lower-cased name. A name or base key would unlock both entries of a duplicated name (or every zombie of that base) together |
| 12. Save / reload / offline | `game/wandering.js` 276–296 · `WanderEngine._run` → `advance` | Fights resolve within one step; the encounter object is never saved. Offline catch-up uses the same path, so the same loss applies. `awaySummary.eventLog` stores text only |
| 13. Manual fight surface | `Zombie Idler v2 - TEST SAVE.html` ~1603 · `ActiveCombatView` | Uses `enemyStatBlock(enemy)` with whatever enemy it is given. Not rendered anywhere (dormant) |

## 3. Test-only alternative (in-memory fixtures)
Each fixture replaces `ZI._bgZombie` with the **same pool and the same single rng draw**, so enemy picks are identical to the current build for any seed. It only adds fields to the returned object:
- **F0 (current):** name only.
- **F1:** adds the existing `bestiaryId: z.id`, `tier`, and `armor`.
- **F2:** F1 plus `spd`, `traits`, `base` (the full record).

**Fight-level comparison:** 3,000 fights per bestiary entry per weapon, from full HP. Starter weapons; B starts with the Jester's jacket (armor 4). F0 → F1.

| Tier | Avg bestiary armor | Bat + jacket: survive % · hits · HP lost | Iron Knuckles + jacket: survive % · hits | Pocket Knife + jacket: survive % · hits | Fists (A): survive % |
|---|---|---|---|---|---|
| F (0) | 0 | no change (100 · 2.24 · 2.5) | no change | no change | no change |
| E (1) | 0 | no change | no change | no change | no change |
| D (2) | 0.2 | 100→100 · 3.29→3.32 · 9.3→9.5 | 100→100 · 5.28→5.34 | 100→100 · 5.28→5.34 | 99.9→99.9 |
| C (3) | 0.9 | 100→100 · 4.34→4.51 · 24.0→25.2 | 100→100 · 7.00→7.49 | 100→99.9 · 7.01→7.49 | **62.3→51.8** |
| B (4) | 1.6 | 99.2→96.0 · 5.41→5.76 · 43.7→47.8 | **98.9→91.3** | **94.7→85.7** | 5.0→4.4 |
| A (5) | 1.8 | 75.5→69.1 | 73.6→64.9 | 52.2→47.1 | 18.0→18.0 |
| S (6) | 3.1 | 43.7→42.6 | 43.6→42.4 | 39.1→39.1 | 17.7→17.7 |
| BOSS (7) | 2 | 0→0 | 0→0 | 0→0 | 0→0 |

Duplicate names, Bat + jacket: Trapper Zed C (`id 20`, armor 0) is unchanged at 100%; Trapper Zed S (`id 38`, armor 3) 9.2% → 1.8%; Battle Cry General B (`id 22`, armor 1) 100% → 100% (hits 5.21 → 5.43); Battle Cry General S (`id 39`, armor 4) 0.2% → 0%.

**Run-level comparison:** H2 harness, ethical policy, 7 days, seeds 101–505, 4 starts × 5 seeds = 20 runs each. Mean ± SD across runs.

| Measure | F0 current | F1 id + tier + armor | F2 full record |
|---|---|---|---|
| Downings/day | 26.9 ±4.3 | 29.8 ±5.3 | 26.0 ±5.1 |
| Encounters per Downing | 4.3 ±0.2 | 4.2 ±0.2 | 5.7 ±0.5 |
| Encounters/day | 114 ±17 | 126 ±23 | 149 ±38 |
| Kills/day | 68.3 ±10.4 | 74.2 ±11.5 | 65.0 ±12.6 |
| Escape share of encounters | 16.8% | 17.4% | **38.1%** |
| Avg enemy armor faced / applied | 1.21 / **0.00** | 1.22 / 1.22 | 1.21 / 1.21 |
| Codex entries unlocked (of 45) | **0** | 45 | 45 |
| Rest h/day | 23.0 | 23.0 | 22.9 |

- **F1:** armor now applies. Run-level Downings are within seed variation (the Downing loop from STRESS-01 dominates). Codex unlocks every type the survivor meets.
- **F2:** escapes more than double, because bestiary `spd` (0.25–2.0) is on a different scale from the escape formula, which expects about 4 for a Shambler and 12+ for a Runner (resist = spd × 3). Initiative has the same mismatch (spd × 1.5), but the survivor (initiative about 21) moves first either way, so turn order is unchanged.
- **Attribution accuracy (current build):** 45.4 ±5.7% of fights against a duplicated name are the S-tier entry, which the live display shows with the lower-tier record. With the id carried, the display resolves by id first, so these fights would show the correct record (code inspection; the screen was not rendered).

## 4. Compatibility risks
- **Outcomes:** adding armor changes combat outcomes (mainly tier B and up, and fists against tier C). The H2 record and storage hashes will change. H1 reproducibility is preserved, because picks and rng draws are identical.
- **Split-equivalence:** `tests/split-equivalence.test.js` will flag `_bgZombie` as a changed function. It needs an authorized label like earlier batches.
- **Codex XP:** Codex unlocks award Discovery XP through `emitAction('discover', 0.5)` (up to 45 one-time grants), which slightly changes skill XP.
- **Speed and traits (F2):** passing `spd` and `traits` changes escape odds through the scale mismatch. That is a design decision, not part of a defect fix.
- **Saves:** no save-format change; the encounter object is transient.

## 5. Recommended design decisions
1. **Verified defect, minimal repair:** carry the existing `bestiaryId`, `tier` and `armor` from the picked record on every Wandering encounter (F1). No renames, no new ids, no formula changes.
2. **Proposed, separate decision:** whether bestiary `spd` and `traits` should feed escape and initiative. If yes, the formulas or the data need a common speed scale first.
3. **Proposed:** whether to rename the two duplicated display names. Not needed for correctness once ids are carried, but it removes the remaining name-keyed risks (Codex `isKnown` by name, text logs).

## 6. Regression tests that would prove the repair
- Every Wandering fight event has a `bestiaryId` matching a `ZI.BESTIARY` record, and its `tier` equals that record's tier.
- For a fixed seed, the sequence of picked enemies is identical before and after the repair (same rng draws).
- Picking `id 38` produces an event with `bestiaryId 38`, tier S; the live display resolves `id 38`, not `id 20`. The same holds for `id 39` vs `id 22`.
- `enemyStatBlock` armor equals the bestiary armor for every record, and `resolveAttack` reduces damage accordingly (MIN_CHIP 1 still holds).
- A Wandering encounter adds its id to `zi_discovered_zombies` once; repeat encounters add nothing.
- Chunking equivalence (H2 T1) and the 24 h cap (T2) still pass. The full existing suite still passes. H2 hashes are re-baselined with the change documented.

## 7. Requires explicit approval
- Implementing F1 (production change to `ZI._bgZombie`) and the resulting combat-outcome, Codex-XP and H2-hash changes.
- The authorized split-equivalence label.
- Any use of `spd` or `traits` in Wandering.
- Any rename.

## 8. Existing regression results (current build, unchanged)
On Sam's machine: 24 game suites, 648 checks, 0 failures; H2 acceptance checks 17/17. Build hashes as in STRESS-01 (re-verified Oct 17).

## 9. Test record
Node v22.22.0. Fixture runs: F0/F1/F2 × 20 runs, 0 FAIL / 0 WARN. Control: F0 is identical to the unmodified build in 20 of 20 runs.

**Limitations:**
- Ethical policy only.
- The live screen was not rendered; the display finding is from code.
- Fight-level tables are from full HP, one fight each.
