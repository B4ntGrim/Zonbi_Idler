# Combat-balance investigation — zombie accuracy × tier escalation (Oct 17)

**Status:** read-only test results for Sam's decision. No production code changed; no balance value locked. Every number below is measured in these runs; nothing is extrapolated beyond 7 days, the ethical policy, or the settings listed.

**Correction (Oct 17, STRESS-01):** the explanation of the ~23 h rest in finding 5 and the recommendation in section 5 are superseded by `stress-01-stress-economy-investigation.md`. The measured numbers in this report are unchanged.

## 1. Test record
- **Build:** the project files as of Oct 17 (after the Oct 16 clock and PF1 changes). SHA-256 (first 16 hex): `active.js a7bedfeba4e9bcb0` · `bootstrap.js a999706d9602df03` · `camp.js a1f9bc90987db05d` · `combat.js 4ab47d83608aaf15` · `core.js 48bb00f8d9d516dd` · `crafting.js 2bb38a8defd348cf` · `economy.js bfbab7115f522e5c` · `factions.js af21b974e3df742f` · `fort.js 6089fdd5df76480f` · `items.js a945d3631aceb920` · `jobs.js 1c6cc45e82e81410` · `routes.js bbb31f1db6434ef9` · `save.js 28076a9a61e6d485` · `stats.js f89005797f0e9d0a` · `survival-data.js 4a9cec01649a1402` · `wandering.js 20d20e48f196be4a` · `world.js a8ef90e9c7842c33` · `bestiary-data.js 9b78614e2fb77a56` · harness `tools/sim-harness/h2.js b93504ed3ffccf79`. Node v22.22.0.
- **Harness:** H2 `runOne` unchanged (real page load each return, 1-s catch-up ticks, Jester switch on in the harness copy only).
- **Runs:** 4 starts (A, B-bat, B-iron_knuckles, B-pocket_knife) × 5 seeds (101, 202, 303, 404, 505) × 7 days, ethical policy, returns every 8 h. 14 scenario sets, 280 runs: 0 FAIL, 0 WARN.
- **Control:** with the test wrappers at baseline settings (95%, 150 m), all 20 runs were identical to the unmodified build (kills, Downings, withdrawals, rest ms).

## 2. Test parameters and assumptions
| Parameter | How it was applied (in-memory wrapper only) |
|---|---|
| Zombie accuracy 70% | Zombie hit chance = 70 − survivor evasion, inside the existing 5–95 clamp. Replaces 65 + zombie accuracy (55) − evasion. Survivor attacks unchanged |
| Baseline 95% | No accuracy wrapper (today's formula; a starter survivor has evasion 1, so zombies sit at the 95 cap) |
| Tier step 150 / 300 / 500 m | Same formula as `WanderSim.rollEncounter`; the distance term is rescaled from 150 m per tier to the test step. The Push On boost term is unchanged (0 under the ethical policy) |
| Early-game tier cap (test model only) | Max zombie tier = simulated day index + 1: day 1 ≤ tier 1, day 2 ≤ tier 2, … day 7 ≤ tier 7. The 150 m distance rule still applies under the cap. Days are counted from the new game |
| Evasion sensitivity | Flat +10 or +20 added to the survivor's evasion |

Other assumptions:
- **Ethical policy only:** the survivor evades when it can; escapes are counted separately from fights. Other policies are untested.
- **Downing:** a Forced Retreat or a Jester displacement (the harness's Downed count). "Downing events" also counts Downings a heal or revive saved.
- **Days are real days:** Wandering and rest still run on real time.
- **First-Downing day** is only as fine as the 8 h return interval.
- **Tier labels:** tiers were tagged at pick time with the same pool and random draw as `ZI._bgZombie`. Bestiary names are not unique (Trapper Zed C/S, Battle Cry General B/S), so tiers cannot be read from names.

## 3. Results — all starts (average of 20 runs per row)
| Scenario | Downed/day | Saved by heal/day | Kills/day | km/day | HP lost/fight | Rest h/day | Stress-only rest h/day | Avg stress at day end | Withdrawals/day | Breakings |
|---|---|---|---|---|---|---|---|---|---|---|
| **Baseline 95% / 150 m** | 26.9 | 40.0 | 68.3 | 1.71 | 42.6 | 23.0 | 15.7 | 70.8 | 1.36 | 0 |
| 70% / 150 m | 17.7 | 22.8 | 53.4 | 1.17 | 36.3 | 23.0 | 18.2 | 71.9 | 1.22 | 0 |
| 70% / 300 m | 16.9 | 21.2 | 53.7 | 1.17 | 34.8 | 23.0 | 18.3 | 72.1 | 1.39 | 0 |
| 70% / 500 m | 15.2 | 18.3 | 53.0 | 1.10 | 32.2 | 23.0 | 18.8 | 72.3 | 1.41 | 0 |
| 70% / early-game cap | 10.8 | 10.9 | 48.7 | 0.89 | 25.9 | 23.1 | 20.0 | 72.4 | 1.46 | 0 |

### By starting survivor (Downed/day · kills/day · km/day · HP lost/fight)
| Scenario | A (no weapon) | B Nail Bat | B Iron Knuckles | B Pocket Knife |
|---|---|---|---|---|
| Baseline 95% / 150 m | 28.7 · 67.3 · 1.88 · 44.5 | 28.9 · 74.3 · 1.78 · 42.3 | 27.3 · 71.4 · 1.67 · 42.1 | 22.7 · 60.1 · 1.51 · 41.5 |
| 70% / 150 m | 19.1 · 51.7 · 1.25 · 38.5 | 17.4 · 55.4 · 1.12 · 35.0 | 15.9 · 50.1 · 1.02 · 35.4 | 18.6 · 56.3 · 1.29 · 36.5 |
| 70% / 300 m | 18.1 · 52.8 · 1.25 · 36.5 | 17.2 · 55.5 · 1.17 · 34.3 | 15.9 · 51.8 · 1.04 · 34.1 | 16.5 · 54.6 · 1.21 · 34.4 |
| 70% / 500 m | 16.8 · 50.8 · 1.21 · 34.6 | 14.8 · 54.9 · 1.05 · 31.4 | 14.8 · 54.1 · 1.04 · 31.3 | 14.6 · 52.0 · 1.10 · 31.6 |
| 70% / early-game cap | 10.4 · 41.8 · 0.87 · 27.4 | 10.6 · 50.1 · 0.85 · 24.8 | 12.3 · 54.6 · 0.95 · 27.2 | 10.0 · 48.1 · 0.90 · 24.3 |

Rest by start: A 23.8–23.9 h/day, B starts 22.7–22.8 h/day in every scenario. B starts meet the Jester at day 0.33 (first return) after a 7.72 h wait in all scenarios.

### Downing events by day (incl. saved; HP lost per fight in brackets), per run
| Scenario | Day 1 | Day 2 | Day 3 | Day 4 | Day 5 | Day 6 | Day 7 |
|---|---|---|---|---|---|---|---|
| Baseline | 121.2 (37) | 65.0 (43) | 51.1 (44) | 61.8 (45) | 60.1 (45) | 58.9 (46) | 48.9 (46) |
| 70% / 150 m | 88.8 (32) | 29.4 (39) | 32.9 (38) | 37.0 (40) | 28.9 (39) | 33.9 (39) | 31.3 (39) |
| 70% / 300 m | 67.5 (27) | 29.9 (40) | 30.9 (38) | 31.3 (39) | 35.1 (41) | 35.9 (39) | 34.4 (39) |
| 70% / 500 m | 42.0 (20) | 28.3 (39) | 27.6 (37) | 31.6 (39) | 38.0 (40) | 28.5 (39) | 36.9 (41) |
| 70% / cap | 17.1 (13) | 6.4 (21) | 12.2 (29) | 21.3 (35) | 28.8 (38) | 35.3 (39) | 29.6 (40) |

Encounters per run (fights + escapes) are 192–235 on day 1 and 33–103 on each later day.

### Encounter tiers by day (% of fights)
| Day | Baseline 95% / 150 m | 70% / 300 m | 70% / 500 m | 70% / early-game cap |
|---|---|---|---|---|
| 1 | T0 16 · T1 13 · T2 17 · T3 15 · T4 16 · T5 12 · T6 11 · T7 1 | T0 24 · T1 21 · T2 18 · T3 13 · T4 11 · T5 7 · T6 4 · T7 1 | T0 41 · T1 24 · T2 18 · T3 11 · T4 5 · T5 1 | T0 48 · T1 52 |
| 2 | T0 8 · T1 8 · T2 14 · T3 17 · T4 20 · T5 15 · T6 16 · T7 2 | T0 9 · T1 9 · T2 12 · T3 14 · T4 22 · T5 15 · T6 18 · T7 2 | T0 9 · T1 10 · T2 15 · T3 19 · T4 26 · T5 14 · T6 6 · T7 1 | T0 27 · T1 32 · T2 42 |
| 3 | T4 22 · T5 20 · T6 13 · T0–T3 43 · T7 2 | T4 19 · T5 21 · T6 15 · T0–T3 44 · T7 1 | T4 20 · T5 17 · T6 11 · T0–T3 52 · T7 1 | T0 15 · T1 18 · T2 33 · T3 35 |
| 7 | T0 7 · T1 9 · T2 12 · T3 16 · T4 21 · T5 17 · T6 16 · T7 2 | T0 7 · T1 9 · T2 15 · T3 16 · T4 19 · T5 17 · T6 16 · T7 1 | T0 6 · T1 8 · T2 13 · T3 16 · T4 19 · T5 19 · T6 16 · T7 2 | T0 6 · T1 8 · T2 12 · T3 16 · T4 19 · T5 18 · T6 16 · T7 3 |

The 70% / 150 m tier mix matches the baseline within a few points on every day (accuracy does not change which zombies appear).

### Evasion sensitivity (Downed/day · HP lost/fight)
| Scenario | +0 | +10 | +20 |
|---|---|---|---|
| Baseline 95% / 150 m | 26.9 · 42.6 | — | 27.0 · 42.8 |
| 70% / 150 m | 17.7 · 36.3 | 15.9 · 34.2 | 14.4 · 30.8 |
| 70% / 300 m | 16.9 · 34.8 | 14.3 · 32.1 | 12.3 · 28.2 |
| 70% / 500 m | 15.2 · 32.2 | 12.6 · 28.8 | 10.7 · 24.9 |
| 70% / cap | 10.8 · 25.9 | 9.6 · 22.9 | 7.7 · 18.3 |

Rest stays at 23.0–23.1 h/day in every evasion variant.

## 4. Findings
1. **Accuracy 70% alone:** Downings −34% (26.9 → 17.7 per day), HP per fight −15%. Kills/day and km/day also fall (68 → 53; 1.71 → 1.17 km).
2. **Evasion is a dead stat at 95%:** +20 evasion changes nothing (26.9 → 27.0). At 70%, each +10 evasion cuts Downings by about 10–17%.
3. **Distance-based tier steps only help on day 1.** Day-1 Downing events: 89 (150 m), 68 (300 m), 42 (500 m). From day 2 the three distance models have about the same tier mix and 28–38 Downing events a day, because day 1's walking already opens tiers 4–7.
4. **The early-game cap gave the lowest Downings** (10.8/day; day 1 17.1, day 2 6.4). Downings rise with the cap (day 5–7: 29–35 events, same as the other models once the cap reaches T5–T7). The cap model reaches Boss tier on day 7 by construction.
5. **Rest is about 23 h/day in every scenario** (22.7–23.9 by start). No combat lever tested changed it; the survivor's stress sits at 70–73 at the end of every day. *Superseded explanation:* this report first blamed walking stress on unexplored ground. STRESS-01 (`stress-01-stress-economy-investigation.md`) measured the cause: the survivor walks cleared home ground. Rest is set by a Downing loop: about 16 min of HP rest per Forced Retreat, plus the low-HP stress event (+5) holding the < 70 resume gate. Day 1 has 192–235 encounters per run; later days 33–103.
6. **By start:** at 70% / 150 m, Iron Knuckles was the lowest (15.9 Downings/day) and A the highest (19.1). Under the cap, the order changes (Pocket Knife 10.0, Iron Knuckles 12.3). Start differences are smaller than scenario differences.
7. **Data issue `[CODE]`:** two bestiary names are duplicated across tiers (Trapper Zed C/S, Battle Cry General B/S), and `ZI._bgZombie` passes neither a bestiary id nor a tier to the fight. Anything that identifies a Wandering zombie by name (Codex counts, headshot counts later) will misattribute these. Investigated further in STRESS-01 §8.

## 5. Recommended next decision
*Superseded by STRESS-01 (`stress-01-stress-economy-investigation.md`).* The original recommendation here rested on the walking-stress explanation, which was wrong. STRESS-01 recommends that Sam set a target Downing rate for a starting survivor, then tune combat lethality and the low-HP stress event together against it.

Provisional direction from these results (not decisions):
- Zombie accuracy 70% (evasion starts to matter).
- Gate zombie tiers by progression (the cap model) rather than distance alone, since distance steps stop working after day 1.
