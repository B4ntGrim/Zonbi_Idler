# H2 — Step 3 Dry Run Report (Oct 15) — STOP for Design review

**Status:** steps 0–3 done. `H2 MATRIX: NOT CLOSED` (step 4, the 80-run matrix, waits for this review). Built by Claude at Sam's request ("continue"), in Code's role.
**Dry run:** 1 seed (101) × 4 starts × `ethical` × 3 days, returns every 8 h. Records: `reports/sim-harness-v1/dry/` (`SUMMARY.md` + one JSON per run).

## Step 1 facts (TQ-H2a–d)
| Q | Answer |
|---|---|
| a | A return = every game script evaluated fresh against the saved storage (`bootstrap.js` runs the schedule, jobs, decay and reputation settles and `Jester.onLoad`), then `WanderEngine.tick` (`wandering.js` 257–297; FX2 cap at 286). In the game the page then ticks every second (`start()`, 253); the harness ticks once per simulated second until `_carryMs` is 0 (needed: `maxStepsPerCall` 200 leaves carry, and a tick with no new time returns early, 283). |
| b | The switch is a code default (`active.js` 817); loading an eligible save with it off triggers the B5 fallback at boot. The harness turns it on in **its in-memory copy** of `active.js` before load (asserted to match exactly once); disk and saves untouched. H2-a fixture: Jester record `eligible:false` **plus `zi_starter_kit_given=true`** with no kit items — without the flag, `Jester.onLoad` grants the old kit to any non-eligible save (found in the smoke test). |
| c | Real clock and `Math.random` outside H1's streams: `_lead` (session id, lock), `_session`, `_boot`'s resume stamp, the Traversal start pick (screen). The harness pins `Date` to the simulated clock and `Math.random` to a per-load seeded stream, and leads as a single tab. |
| d | H1 §11: level 1–50 · XP finite only (DH3; Q3 unverified) · base charges 0–max · kit charges 1–full · durability 0–max · stress 0–max · HP 1–100 after FX1. |

**Also found:** a new save has no map position until the Traversal screen picks one (`screens-v3.jsx` 703–712). Without it every Downing skips the Jester camp (`campSkipped: noPosition`). The harness repeats the screen's pick (declared fixture "first Traversal visit"). In the real game a new save always opens on Traversal, so this matches play.

## Acceptance checks
| Check | Result |
|---|---|
| 1 Reproducible (each start twice; and cloud vs Sam's machine) | **PASS** — identical record and storage hashes; the dry run on Sam's machine matches the cloud run record for record |
| 3 Starts are what they claim | **PASS** — A: no kit, never on the Jester path. B ×3: eligible, no kit at start; first Downing → camp (1,0) → wait 7.7 h → meeting at the next return → chosen weapon equipped → jacket, pouch, scout kit, 2 rations, Fort-bound Med Kit, once |
| 4 No silent grants | **PASS** — A and B start identical (empty); B differs only by the JD1a rewards |
| 5 T1 (A): one call / 1 h / 1 s chunks over 3 h | **PASS** — identical state and storage |
| 5 T2 (A): 72 h away vs 24 h | **PASS** — both process exactly 24.00 h; identical state |
| 5 T3 (H2-c: A, B-bat; 1 h, 24 h) | Reported. **1 h: exact** for both. **24 h: differs only in stress** (A 50.59 offline vs 50.47 watched; B-bat 52.45 vs 52.16); kills, distance, loot, HP identical |
| 6 Planted states | **PASS** — no-timer pause and prompt → S3 FAIL; rest beyond worst case (60.3 h) → S5 FAIL; Jester wait INFO in B, S3 FAIL in A |
| 7 Isolation | **PASS** — `game/active.js` ships `firstMeetingOn: false`; no saved key mentions the switch; all 24 suites pass; r1 identical to post-FX5; `game/` and screen hashes unchanged |
| 2 Full matrix (80 records) | Not run — step 4, after review |

## Dry-run results (3 days, ethical)
| Start | Kills/day | km/day | Downed (Forced Retreat) | Withdrawals | Heals | Rest h of 72 | Stress-only rest h | First Downing | Meeting |
|---|---|---|---|---|---|---|---|---|---|
| A | 44 | 1.1 | 58 | 3 | 113 | 71.7 | 55.7 | day 0.33 | — |
| B-bat | 54 | 1.1 | 55 | 6 | 109 | 63.9 | 48.3 | day 0.33 | day 0.33 |
| B-iron_knuckles | 78 | 1.5 | 80 | 6 | 166 | 63.7 | 41.4 | day 0.33 | day 0.33 |
| B-pocket_knife | 53 | 1.4 | 66 | 9 | 132 | 63.8 | 44.7 | day 0.33 | day 0.33 |

No FAIL or WARN in any run. Runaway (D9) needs day 10, so it is blank in a 3-day run.

## For Design review (before step 4)
1. **The survivor rests almost all the time.** A rests 71.7 of 72 h; B starts about 64 h. **Most rest is waiting on stress** (41–56 h): HP is back at 80%, stress sits just above 50, and the Bedroll rate (20/day) needs about 72 min per point. This is PF1 at full scale, and it will dominate every H2 number.
2. **Downed about 18–27 times a day** in every start, with heals spent on nearly every fight. The Jester kit and weapon lift kills and distance but barely change the Downing rate.
3. **Iron Knuckles** gives the most kills and distance (and the most Downings); the Bat and Knife are close to each other.
4. **Reporting gap (existing, not H2):** a Downing in a fight calls `_downed` without the away summary (`wandering.js` 335), so the "while you were away" report undercounts Downed retreats. The harness counts them from the events instead.
5. **Proceed?** The harness is ready for step 4 (80 runs × 30 days; ~2–3 min). Since finding 1 will dominate the matrix, Sam may want the full matrix as-is (a true baseline), or to decide PF1 first. Recommended: **run the baseline as-is**; a baseline measured before a fix is what shows the fix's effect.
