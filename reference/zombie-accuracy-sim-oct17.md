# Zombie accuracy test — Oct 17 (read-only)

**Status:** test results for Sam's decision. Nothing decided; no game files changed.

## Setup
- **Today `[CODE]`:** zombie hit chance = 65 + zombie accuracy (55) − survivor evasion, capped at 95% (`STAT_FORMULAS.resolveAttack`, `game/stats.js`). A starter survivor has evasion 1, so every zombie hits 95% of the time.
- **Test:** zombie hit chance set to 80, 70 and 60% (minus survivor evasion) in an in-memory copy. Today's 95% was re-run as the baseline because the clock and PF1 changes (Oct 16) altered the dry-run numbers.
- **Part 1, single fights:** 20,000 fights from full HP per row, against tier 0 (F) and tier 1 (E) bestiary zombies, for each starter weapon, with and without the Jester's jacket (armor 4).
- **Part 2, Downing rate:** H2 harness, ethical policy, 3 days, 5 seeds (101–505), all four starts: 80 runs per setting, 320 total. 0 FAILs.

## Part 1 — HP lost per fight from full HP (tier 0 / tier 1)

| Weapon | 95% (today) | 80% | 70% | 60% |
|---|---|---|---|---|
| Fists (Start A) | 17.8 / 32.1 | 14.8 / 26.7 | 13.0 / 23.3 | 11.1 / 20.0 |
| Nail Bat | 6.9 / 13.5 | 5.7 / 11.2 | 5.0 / 9.8 | 4.2 / 8.4 |
| Nail Bat + jacket | 2.5 / 5.0 | 2.1 / 4.1 | 1.8 / 3.6 | 1.6 / 3.1 |
| Iron Knuckles | 7.9 / 14.4 | 6.5 / 12.0 | 5.6 / 10.5 | 4.8 / 8.9 |
| Iron Knuckles + jacket | 2.9 / 5.2 | 2.4 / 4.4 | 2.0 / 3.8 | 1.7 / 3.3 |
| Pocket Knife | 10.3 / 19.0 | 8.6 / 15.7 | 7.5 / 13.7 | 6.4 / 11.7 |
| Pocket Knife + jacket | 3.7 / 7.0 | 3.1 / 5.8 | 2.7 / 5.0 | 2.3 / 4.3 |

**Hits per kill (survivor's landed hits; unchanged by zombie accuracy):** Fists 5.4 / 6.7 · Nail Bat 2.2 / 2.8 · Iron Knuckles 3.5 / 4.3 · Pocket Knife 3.5 / 4.3. Swings per kill are about 5% higher (misses; the bat's heavy swing also skips turns).

**Fights before HP runs out (100 HP ÷ HP per fight), tier 0:** Nail Bat 14 → 17 → 20 → 24; Iron Knuckles 13 → 15 → 18 → 21; Pocket Knife 10 → 12 → 13 → 16; Fists 6 → 7 → 8 → 9 (95 → 80 → 70 → 60%).

## Part 2 — Downing rate in 3-day runs (average of 4 starts × 5 seeds)

| Zombie hit chance | Downed per day | Change | Kills per day | Rest h of 72 | Stress-only rest h |
|---|---|---|---|---|---|
| 95% (today) | 33.1 | — | 85.6 | 65.5 | 38.3 |
| 80% | 27.9 | −16% | 80.0 | 65.6 | 42.6 |
| 70% | 23.1 | −30% | 72.3 | 65.7 | 46.3 |
| 60% | 21.6 | −35% | 73.2 | 65.7 | 47.4 |

By start at 70%: A 27.7 · Nail Bat 22.4 · Iron Knuckles 19.7 · Pocket Knife 22.7 per day.

## Finding: most Downings are not from tier 0–1 zombies
- In the runs, **96–97% of Downings come from tier 2 and above**, at every accuracy setting. Chance a fight Downs the survivor (95% → 60%): tier 0 5.8% → 4.0%; tier 1 16.6% → 6.9%; tier 2 41% → 17%; tier 3 86% → 54%; tier 4+ 77–100%.
- **Why `[CODE]`:** the Wandering zombie pool widens with distance walked (`ZI._bgZombie`, `game/wandering.js`): every 150 m adds a tier, so by about 1 km every tier up to Boss is in the pool, picked evenly. A survivor walking about 1 km a day meets tier 4–7 zombies on day 1.
- Lowering zombie accuracy helps tier 0–2 fights a lot, but cannot fix fights the survivor is not meant to win yet.
- Rest still fills ~65 of 72 hours. Lower accuracy shifts it from HP-waiting to stress-waiting.

## Open for Sam
- `[OPEN]` Starting zombie hit chance (60, 70 or 80%).
- `[OPEN]` How it is implemented: lower the zombie accuracy stat (today 55) or change the formula. Either way evasion gear starts to count; today up to 25 points of evasion are hidden under the 95% cap.
- `[OPEN]` How fast the zombie tier rises with distance (the main Downing driver).
