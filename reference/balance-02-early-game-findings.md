# BALANCE-02 — Early-game difficulty investigation (Oct 17)

**Status:** findings for review. Not closed. Design values UNLOCKED; nothing here is approved. No production code, spec, save or balance value was changed. Provisional target from Sam: **2–5 Downings/day**.

**Current build vs experiments:** rows marked "current" are the unmodified build. Every other row is a test-only, in-memory configuration. Experiments use the BESTIARY-01 F1 fixture (existing bestiary id, tier and armor carried into Wandering fights) as their base, because balance should not be tuned on armor-less enemies. Unexplored, untested settings are not reported.

## 1. Verified root causes
1. **Encounter density.** An encounter rolls every 6 s of walking (`ZI.WANDER_SIM_TABLE.encounterEverySec`, `game/wandering.js` 305), about 600 per active hour. With 59% of encounters ending in a Downing event in the current build, a few minutes of walking produce a Downing.
2. **Tier exposure.** The distance pool opens every tier up to Boss by about 1 km (`ZI._bgZombie`, `WanderSim.rollEncounter`; see the combat-balance report).
3. **Stress wall persists after Downings fall.** With Downings inside 2–5/day, stress inflow per active hour still exceeds Bedroll recovery (20/day), so the survivor stays at the < 70 resume gate and rests about 22 h. Sources:
   - the low-HP event (+5, or +2 when tested);
   - failed ventures from discovery prompts (+8 each; prompts run on their own timer, `ACTIVE_TABLE.discoveryEverySec`, so more walking means more prompts);
   - walking on explored or unexplored squares (+0.10 / +0.25 per min) once the survivor leaves home ground.
4. **Carry weight is next.** When the stress wall is removed (diagnostic), the load rule (withdraw at 115%) takes over: about 91 load withdrawals and 10 h of rest per day.

## 2. Files and functions involved
- **Encounter interval:** `game/wandering.js` 305 `WANDER_SIM_TABLE`; `advance` 385–468.
- **Tier exposure:** `ZI._bgZombie` 105–114; `rollEncounter` 310–313.
- **Zombie hit chance:** `game/stats.js` 274–293 `resolveAttack` (`BASE_HIT` 65 + zombie accuracy 55 − evasion, clamp 5–95).
- **Stress sources:** `game/active.js` 31–43 `ACTIVE_TABLE.stress`; `WS._move`, `_beforeSegment`, `_afterSegment` 266–365; venture outcomes 227–237.
- **HP recovery:** `ZI.WANDER_REST_TABLE` (`restHpPerMinutePct` 5); `WS._restNeedMs` / `_restStep` 737–770.
- **Resume gate:** `RETREAT_RULES_TABLE.resume` (HP ≥ 80, stress < 70; locked, PF1 Oct 16).
- **Carry:** load rule 115% (`RETREAT_RULES_TABLE.defaults.loadLimitPct`), `ZI.getCapacity`.
- **Familiarity:** `ZI.cellFamiliarity`, `ZI.isHomeCell` (`game/world.js` 159–173).

## 3. Test record
- **Build:** hashes as in STRESS-01, re-verified on Sam's machine Oct 17. H2 `runOne` unchanged. Node v22.22.0.
- **Runs:** ethical policy, returns every 8 h, 7 days. Seeds 101, 202, 303, 404, 505 are common to every scenario. Starts A, B-bat, B-iron_knuckles, B-pocket_knife are run separately (20 runs per scenario).
- **Exception:** one diagnostic ran 3 days (5 seeds), because its activity level made 7-day runs impractically slow.
- **Results:** every scenario 0 FAIL / 0 WARN (H2 failure classes S1–S5).
- **Control:** the current-build fixture is identical to the unmodified build in 20 of 20 runs.
- **Labels used below:**
  - **cap1:** max tier = day index + 1.
  - **cap2:** max tier = floor(day index / 2) + 1.
  - The 150 m distance rule still applies under either cap.
  - **70%:** zombie hit chance = 70 − survivor evasion.
  - **encN:** encounter every N s.
  - **lhN:** low-HP stress event size N.
- **Multi-cell traversal fixture (T-runs):** from the first return on, each page load moves the Traversal position one open square east (else south), writing `zi_trav_pos` as the Traversal screen does. 21 moves per run.

## 4. Single-factor sensitivity (base EA = F1 + 70% + cap1; mean ± SD of 20 runs, per day)
| Scenario | Downed | Enc / Downing | Encounters | Kills | Explore h | Rest h | km | Stress % (calm / strained / stressed) | Withdrawals |
|---|---|---|---|---|---|---|---|---|---|
| Current build | 26.9 ±4.3 | 4.3 ±0.2 | 114 ±17 | 68.3 ±10.4 | 0.2 | 23.0 ±0.5 | 1.71 | 4.9 / 23.7 / 71.4 | 1.4 |
| F1 only | 29.8 ±5.3 | 4.2 ±0.2 | 126 ±23 | 74.2 ±11.5 | 0.2 | 23.0 ±0.5 | 1.91 | 6.5 / 25.5 / 68.0 | 1.4 |
| EA (F1 + 70% + cap1) | 10.9 ±1.3 | 6.3 ±0.7 | 69 ±9 | 48.2 ±5.7 | 0.1 | 23.1 ±0.5 | 0.89 | 1.5 / 8.3 / 90.2 | 1.3 |
| EA, cap2 | 7.0 ±0.9 | 8.3 ±1.2 | 58 ±7 | 43.6 ±4.9 | 0.1 | 23.1 ±0.5 | 0.71 | 1.5 / 4.0 / 94.5 | 1.4 |
| EA, enc30 | 4.0 ±0.6 | 9.9 ±1.9 | 39 ±5 | 29.1 ±3.5 | 0.3 | 22.9 ±0.5 | 2.73 | 1.6 / 4.0 / 94.5 | 4.1 |
| EA, enc60 | 1.8 ±0.5 | 15.5 ±3.5 | 27 ±4 | 20.2 ±3.4 | 0.4 | 22.8 ±0.4 | 4.02 | 1.4 / 2.7 / 95.9 | 4.7 |
| EA, enc120 | 1.0 ±0.4 | 19.9 ±10.6 | 18 ±2 | 13.4 ±1.3 | 0.5 | 22.8 ±0.4 | 5.65 | 1.2 / 1.8 / 97.0 | 4.4 |
| EA, lh2 | 25.7 ±3.3 | 7.2 ±0.5 | 184 ±21 | 121.8 ±12.5 | 0.2 | 22.9 ±0.5 | 2.44 | 3.7 / 20.5 / 75.7 | 3.5 |
| EA, lh0 (diagnostic) | 47.0 ±3.3 | 23.7 ±3.6 | 1112 ±172 | 401.4 ±18.5 | 1.3 | 21.3 ±0.4 | 14.19 | 63.7 / 12.2 / 24.1 | 27.3 |
| EA, HP regen ×2 | 10.4 ±2.0 | 6.5 ±0.8 | 67 ±8 | 47.0 ±5.3 | 0.1 | 23.0 ±0.5 | 0.86 | 0.8 / 4.0 / 95.2 | 1.2 |
| EA, gate 80 (test only; gate is locked at 70) | 11.0 ±1.9 | 6.1 ±0.7 | 67 ±7 | 47.7 ±4.2 | 0.1 | 23.1 ±0.5 | 0.86 | 1.5 / 1.1 / 96.3 | 1.3 |

**Reading:**
- **Encounter interval and tier gating** move Downings the most.
- **Low-HP stress size** moves activity but raises Downings (the loop reinvests).
- **HP regeneration and the resume gate** barely matter while the stress wall binds.
- **Rest stays at 21.3–23.1 h in every single-factor test.**

## 5. Combined candidates (mean ± SD of 20 runs, per day)
Candidate Downing targets, as requested:
- **K5 "conservative":** about 5 Downings/day.
- **K3 "moderate":** about 3–4/day.
- **K2 "substantially less punishing":** about 2/day.

| Scenario | Target | Downed | Enc / Downing | Encounters | Kills | Explore h | Rest h | km | Stress % (calm / strained / stressed) | Withdrawals (of which load) | Longest rest h |
|---|---|---|---|---|---|---|---|---|---|---|---|
| C7 F1 + 70% + cap2 + enc30 + lh2 | K5 | 5.3 ±1.1 | 16.8 ±5.1 | 85 ±14 | 63.4 ±10.6 | 0.6 | 22.5 | 5.97 | 2.9 / 7.3 / 89.9 | 9.4 (6.6) | 12.9 |
| C8 F1 + **95%** + cap1 + enc60 + lh2 | K5 | 5.2 ±1.4 | 9.7 ±1.9 | 49 ±8 | 34.1 ±5.8 | 0.7 | 22.4 | 7.44 | 2.2 / 7.2 / 90.6 | 7.5 (3.9) | 12.6 |
| C5 F1 + 70% + cap1 + enc60 + lh1 | K5 | 4.5 ±1.0 | 15.2 ±3.8 | 66 ±10 | 46.8 ±6.7 | 0.9 | 22.2 | 10.09 | 3.3 / 9.7 / 87.0 | 10.4 (6.4) | 11.4 |
| C2 F1 + 70% + cap1 + enc60 + lh2 | K3 | 3.5 ±0.7 | 14.8 ±2.4 | 50 ±10 | 37.1 ±7.0 | 0.7 | 22.4 | 7.66 | 2.4 / 6.3 / 91.3 | 8.6 (4.9) | 12.8 |
| C4 = C2 + HP regen ×2 | K3 | 3.4 ±1.0 | 15.6 ±4.0 | 51 ±8 | 37.4 ±5.9 | 0.7 | 22.4 | 7.70 | 1.5 / 4.2 / 94.3 | 8.8 (4.9) | 12.6 |
| C3 F1 + 70% + cap2 + enc60 + lh2 | K2 | 2.4 ±0.6 | 23.1 ±7.4 | 52 ±9 | 39.2 ±6.9 | 0.7 | 22.4 | 7.79 | 2.4 / 5.3 / 92.3 | 8.7 (5.4) | 12.2 |
| C1 F1 + 70% + cap1 + enc30 + lh2 | above range | 9.0 ±1.7 | 10.0 ±1.7 | 88 ±15 | 62.6 ±10.7 | 0.6 | 22.5 | 6.36 | 2.9 / 10.9 / 86.3 | 8.5 (5.6) | 12.6 |
| C6 F1 + 70% + cap1 + enc30 + lh1 | above range | 11.4 ±2.3 | 11.3 ±2.0 | 128 ±29 | 87.0 ±17.8 | 0.9 | 22.2 | 9.31 | 3.9 / 17.0 / 79.1 | 12.3 (8.8) | 11.3 |

**Rest by cause (h/day; stress-only portion in brackets):**
- **C3:** withdrawal on HP 7.73 (7.05) · Downing 6.56 (5.96) · withdrawal on load 8.08 (7.26).
- **C2:** HP 8.52 (7.75) · Downing 7.99 (7.11) · load 5.88 (5.12).
- **C7:** HP 5.34 (4.74) · load 6.37 (5.37) · Downing 10.78 (9.42).

In every candidate, most rest is stress-only waiting, whatever started it.

### By starting survivor (Downed · enc/Downing · kills · explore h · km per day)
| Scenario | A | B Nail Bat | B Iron Knuckles | B Pocket Knife |
|---|---|---|---|---|
| Current | 28.7 · 4.0 · 67.3 · 0.2 · 1.88 | 28.9 · 4.2 · 74.3 · 0.2 · 1.78 | 27.3 · 4.3 · 71.4 · 0.2 · 1.67 | 22.7 · 4.6 · 60.1 · 0.1 · 1.51 |
| C7 (K5) | 6.5 · 12.8 · 62.2 · 0.6 · 6.27 | 4.7 · 18.6 · 65.0 · 0.5 · 5.57 | 5.4 · 17.0 · 67.7 · 0.6 · 6.14 | 4.5 · 18.8 · 58.9 · 0.6 · 5.88 |
| C5 (K5) | 4.9 · 13.0 · 44.4 · 0.9 · 9.75 | 4.5 · 15.6 · 49.7 · 1.0 · 10.35 | 4.3 · 16.0 · 49.0 · 0.9 · 10.03 | 4.3 · 16.4 · 43.9 · 1.0 · 10.22 |
| C2 (K3) | 4.0 · 12.6 · 37.1 · 0.7 · 7.83 | 3.1 · 14.4 · 34.3 · 0.6 · 6.55 | 3.6 · 16.4 · 44.5 · 0.8 · 8.82 | 3.1 · 15.7 · 32.6 · 0.7 · 7.43 |
| C3 (K2) | 3.2 · 16.4 · 39.6 · 0.8 · 8.08 | 2.3 · 23.8 · 41.4 · 0.7 · 7.85 | 1.8 · 31.1 · 42.5 · 0.8 · 8.09 | 2.2 · 21.3 · 33.1 · 0.7 · 7.16 |

Equipment still matters in every candidate: Start A (no weapon, no jacket) has the most Downings, and the Iron Knuckles has the most encounters per Downing. Per-seed SD for Downings by start: ±0.2 to ±1.4 per day.

### Per day — C3 (K2), per run
| Day | Encounters | Downing events (incl. saved) | Encounter tiers (% of fights) |
|---|---|---|---|
| 1 | 143.1 | 9.3 | T0 44 · T1 56 |
| 2 | 34.8 | 2.6 | T0 43 · T1 57 |
| 3 | 47.4 | 6.5 | T0 24 · T1 29 · T2 47 |
| 4 | 36.1 | 4.8 | T0 24 · T1 29 · T2 47 |
| 5 | 34.5 | 9.4 | T0 13 · T1 20 · T2 29 · T3 38 |
| 6 | 33.9 | 8.4 | T0 13 · T1 20 · T2 31 · T3 36 |
| 7 | 30.6 | 10.6 | T0 11 · T1 16 · T2 17 · T3 24 · T4 33 |

The current build, by comparison: day 1 235 encounters and 121 Downing events across all tiers T0–T7; days 2–7 77–103 encounters and 49–65 events per day.

Day 1 has 3–4× the encounters of later days in every scenario, because a new save starts at stress 0. Downing events rise again as the cap opens tier 3–4.

## 6. Multi-cell traversal (T-runs; mean of 20 runs)
| Scenario | Downed | Enc / Downing | Explore h | Rest h | km | Walking by familiarity (unexplored / explored / cleared) | Stress % stressed | Squares with kills |
|---|---|---|---|---|---|---|---|---|
| T current build | 26.0 ±3.7 | 4.1 | 0.2 | 23.0 | 1.62 | 59.8 / 22.7 / 17.6 | 72.7 | 20.8 |
| T C3 (K2) | 2.8 ±0.6 | 19.1 | 0.7 | 22.4 | 7.74 | 56.1 / 26.8 / 17.1 | 96.1 | 20.6 |
| T C2 (K3) | 3.8 ±1.0 | 13.6 | 0.7 | 22.5 | 7.44 | 55.2 / 26.9 / 17.9 | 96.0 | 20.6 |

Traversal exercises unexplored-walking stress for the first time (55–60% of walking). Downings stay in range, and the stress wall gets stronger (96% of time Stressed).

## 7. Diagnostics (not candidates)
| Diagnostic | Downed | Explore h | Rest h | km | Stress | Main rest cause |
|---|---|---|---|---|---|---|
| C3 + Bedroll ×4 (80/day) | 3.6 ±1.0 | 2.5 ±0.3 | 20.3 | 26.25 | 3 / 20 / 77 | load withdrawals 12.1 h (25/day); failed ventures add 66 stress/day |
| C3 + no low-HP and no venture stress (3 days) | 2.5 ±1.3 | 8.5 ±1.2 | 12.3 | 90.7 | 100% calm | load withdrawals 10.1 h (91/day) |

## 8. Answers to the acceptance questions
- **Closest to 2–5 Downings/day:** C3 (2.4), C2 (3.5), C5 (4.5), C8 (5.2), C7 (5.3). With traversal: T C3 2.8, T C2 3.8.
- **Not successful:** no candidate meets the other acceptance measures. Active exploration is 0.6–1.0 h/day, rest 22.2–22.5 h/day, and stress is in the Stressed band 87–96% of the time: a near-permanent recovery state.
- **Encounter tiers:** in C3, matched (T0–T1 days 1–2, up to T2 days 3–4, up to T4 by day 7).
- **Equipment:** differences remain (A vs B starts; Iron Knuckles best encounters per Downing in C3).
- **Armor:** applied (F1); its effect is modest at tiers 0–2, where the candidates spend days 1–4.

## 9. Compatibility risks
- **Encounter interval:** changing it changes loot, XP and material rates per active hour and the feel of the live screen (the screen animates each encounter for half the gap).
- **Tier gating by day:** introduces time-gating, which the design pillars treat carefully. It is an alternative to distance; a progression- or level-based gate is untested.
- **Low-HP event:** changing its size interacts with headshots' stress reduction (decided Oct 16).
- **Bed rates:** raising the Bedroll conflicts with the bed-tier ladder and spec §13.8.
- **Resume gate:** locked (R1, PF1 Oct 16); tested only as sensitivity.
- **Discovery prompts:** prompts run on their own timer, so any change that increases walking increases failed-venture stress.
- **Carry capacity:** becomes the main limiter once stress stops binding.
- **H2 hashes:** every candidate changes them; re-baseline needed.
- **Preserved in all tests:** H1, FX1, FX2, CB1, R1 rules and CB1 weapon stats.

## 10. Recommended design decisions (for Sam; none taken)
1. **Treat Downings/day and active exploration as two separate targets.** Reaching 2–5 Downings does not create activity while stress inflow per active hour exceeds Bedroll recovery.
2. **Set an active-exploration target** (hours per day, or a stress-per-active-hour budget). The tests show the stress economy, not combat, decides how long the survivor is out.
3. **Directions most worth a follow-up test, once (2) is set:**
   - encounter interval about 60 s;
   - tier gating (cap2-like);
   - 70% zombie hit chance;
   - smaller low-HP event;
   - a decision on failed-venture stress and walking stress per familiarity;
   - then carry capacity.

## 11. Requires explicit approval
Any change to:
- encounter interval;
- tier progression model;
- zombie hit chance;
- low-HP or venture stress;
- walking stress;
- bed rates;
- the resume gate (locked);
- carry capacity.

Plus the H2 re-baseline.

## 12. Existing regression results (current build, unchanged)
On Sam's machine: 24 game suites, 648 checks, 0 failures; H2 acceptance checks 17/17.

## 13. Limitations
- Ethical policy only.
- 7 days (one diagnostic 3 days).
- The traversal fixture moves one square per 8 h return, not per player decision, and no sector is scouted.
- Breakings never occurred.
- The live screen and the encounter animation were not rendered.
- Experiments sit on the F1 identity fixture, which is not in the current build.
