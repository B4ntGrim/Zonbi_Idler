**Status:** CLOSED Oct 19 (Sam). `H2 MATRIX: CLOSED`. The full 80-run matrix ran twice (`reports/sim-harness-v1/legacy-oct17/`, `best1/`), all OK; BALANCE-03 used the harness throughout. Archived from `CURRENT_BATCH.md`.

# CURRENT_BATCH.md

**Status:** ACTIVE. **Locked by Sam Oct 15** (H2-a, H2-b, H2-c). **Steps 0–3 done Oct 15; stopped for Design review** (`handoff/to-design/H2_DRY_RUN_REPORT.md`). Runner: `tools/sim-harness/` (tests in `tools/sim-harness/h2-tests.js`, a node script, instead of `tests/h2-harness.test.js`: the harness needs `require`). Source and decisions: `reference/h2-batch-draft.md`. Design record: `reference/sim-harness-v1-brief.md` §6. Start at step 0; step 3 (dry run) stops for Design review before the full matrix.

### BATCH H2 — Matrix runner and report

**Goal.** A headless runner plays 80 idle 30-day runs on the real game rules and writes a reproducible report of soft-locks, validity, trap cycles, economy growth and the A vs B comparison.

**Decided behavior**
1. **Matrix:** policies `ethical`, `immoral`, `criminal`, `heinous` (unlocked fixture) × seeds (5, the same in every scenario) × starts **A** and **B-bat**, **B-iron_knuckles**, **B-pocket_knife** = **80 runs**, Normal, 30 simulated days.
2. **Start A** (H2-a): Jester feature on in the harness environment only, the save's Jester record set to `eligible:false`, **no starter kit**; first Downings are ordinary Base Forced Retreats; no meeting. **Start B:** a real new save created with the Jester feature on in the harness environment (`eligible:true`, no kit at creation, JD1a §2); the first Downing displaces the survivor to the camp (JD1a rules); the meeting (H2-b) at the idle player's first 8 h return after the wait starts, through `ZI.jesterMeet(weaponId)` with the run's weapon; the wait is recorded and classed INFO. If no Downing happens in 30 days, the run reports "no meeting" (a finding, not a failure).
3. **Idle player:** picks the policy at day 0, never answers prompts (timers and policy defaults decide), returns through the page-load path every 8 h; the only scripted action is the B meeting.
4. **Headless values:** `moveSpeed` and `healPct` come from `ZI.SurvivorRules`; recorded per run (start, and at each return). The harness grants nothing.
5. **Clock and rolls:** `ZI.installClock` and the master seed (H1); `Date` and `Math.random` outside the H1 streams are pinned in the harness environment so a replay is byte-identical.
6. **Checks per step / per run:** D6 S1–S5 classes; D7 bounds (HP 1–100, stress 0–100, load against each start's capacity, charges, XP per H1, durability); D9 growth flag.
7. **Run record (D10):** start id, weapon, policy, seed, fixtures, headless values, day of first Downing, Jester wait (ms) and meeting time (B), each check's result and class, daily stocks, withdrawals and Forced Retreats with causes, heals used (and how many while resting), **rest time spent waiting on stress after HP reached 80% (PF1)**, trap-cycle count, failure snapshot on any failure.
8. **Summary:** one policy table per start (A, B-bat, B-knuckles, B-knife); A vs B per policy; B weapon comparison per policy; the limitations block (§3); the excluded-systems table.
9. **Location:** runner and its tests under version control; artifacts in `reports/sim-harness-v1/` (excluded from version control).

**Likely files.** New `tools/sim-harness/` (runner, environment, report writer) · new `tests/h2-harness.test.js` · `CODE_STATE.md`. **No `game/` or screen file is expected to change**; if one must, stop.

**Steps.** 0 baseline (all suites, hashes of `game/` and screens) · 1 read-only facts (below) · 2 build the runner · 3 dry run: 1 seed × 4 starts × `ethical`, 3 days, review with Design · 4 full matrix · 5 report.

**Step-1 facts for Code (file:line)**
- **TQ-H2a** The page-load return path the harness calls (boot + `WanderEngine.tick`), and that it applies the 24 h cap (FX2).
- **TQ-H2b** How a harness environment turns the Jester switch on without writing it to a save (JD1a check 10), and how H2-a's fixture sets `eligible:false` with no kit.
- **TQ-H2c** Every remaining real-clock or `Math.random` read reachable in the runs (beyond H1's streams) that pinning must cover.
- **TQ-H2d** H1's verified bounds for XP, charges and durability (D7), and the Q3 status.

**Acceptance checks**
1. **Reproducible:** the same seed and configuration twice → identical run records (sorted-key hash), for one run of each start.
2. **Full matrix:** 80 run records; every one has all §4.7 fields.
3. **Starts are what they claim:** A has no starter kit and never enters the Jester path; every B run with a first Downing shows the camp displacement, the trade, the wait, one meeting, the run's weapon and the kit (JD1a §6); no B run gets a second kit.
4. **No silent grants:** inventory differences between A and B are only those JD1a defines.
5. **T1** (A): one call vs 1 h chunks vs 1 s chunks → identical. **T2** (A): 72 h away processes ≤ 24 h. **T3** (H2-c) on A and B-bat, 1 seed each: exact where equivalent, otherwise reported as aggregates.
6. **Classification:** a planted test state with no timer is reported S3 FAIL; a planted rest beyond its worst case is S5 FAIL; the Jester wait is INFO.
7. **Isolation:** after the matrix, the real-game page still reads `firstMeetingOn = false`; no harness code path writes the switch; regression: all suites pass, r1 ×20 identical, `game/` and screen hashes unchanged.
8. **Report:** summary tables per §4.8 with the limitations and excluded-systems blocks.

**Explicitly out.** Balance changes of any kind (findings go to Sam) · PF1 fix · difficulty modifiers (G4) · attentive player profiles · Routes, Schedule, crafting, Fort scenes, Camp Leader · JD1b scene · the tutorial skip flag · Unity harness.

**Stop conditions.** Any `game/` or screen change needed · a sequence change in existing seeded tests · a start that can't be built from existing code paths · any harness write to the real save or the Jester switch.

**Closing line:** `H2 MATRIX: CLOSED` / `NOT CLOSED`.
