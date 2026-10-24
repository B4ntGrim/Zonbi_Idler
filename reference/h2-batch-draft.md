# Zed Idler — H2 Matrix Runner and Report: Batch Draft (for Sam's lock)

**Status:** **LOCKED Oct 15** by Sam (H2-a, H2-b, H2-c decided, §2). §4 is `CURRENT_BATCH.md`. Everything else is carried from decided records.
**Sources:** `sim-harness-v1-brief.md` §6 (D3–D11), §7, §8 · `elder-jester-concept.md` J7, U19, U23, U37, U38 · `archive/jd1a-batch.md` (check 10: tests enable the Jester only in their own environment) · `fx4-shared-survivor-attributes-slice.md` (C5) · `playtest-findings-oct15.md` (PF1) · `gameplay-fix-batches-proposal.md` §5.
**Prerequisites:** H1, FX1, FX2, CB1, FX3, FX4, JD1a, FX5 all **CLOSED** (Oct 10–15). No fix batch remains open, so H2 carries no "open fix" limitation (U3 satisfied in full).

---

## 1. What changed since the brief (and why)

| Brief said | Now | Why |
|---|---|---|
| D4: 2 scenarios × 4 policies × 5 seeds = **40** runs | **80** runs: A once, B once per starter weapon (J7) | U19/J7: B is the completed-tutorial start, and its weapon is chosen at the Jester meeting |
| D11 B: real start + **Belt Pouch** fixture (U4) | B: the **real completed-tutorial start** built by JD1a (Jester first meeting at the first Downing) | U4's fixture is superseded by U8/U19; the acceptance-report §14 finding (pouch = no difference) no longer applies |
| D11 A: authentic new save (today's kit) | A: **skipped-tutorial start** (§2, H2-a) | U14/U19/U23/U37: skippers forfeit the kit and get no softening |
| D5: harness derives `moveSpeed` / `healPct` from the fixture | Harness **reads** them from `ZI.SurvivorRules` and records them; derives nothing | FX4 (C5): shared rules own both |
| D5: idle player never responds | Idle player, **plus one scripted meeting in B** (§2, H2-b) | U38: the meeting needs the player; nothing ever picks the weapon for them |
| — | New report measures for PF1 (stress-only rest time) and heals used while resting | Real-play findings Oct 15 |

## 2. Decisions `[DECIDED Oct 15]` (Sam)

- **H2-a Scenario A start** `[DECIDED Oct 15]` = the recommendation. The tutorial skip flag isn't built yet, so no "skipped" save exists in code.
  - **Decided:** a declared fixture: Jester feature on in the harness environment, save record set to `eligible:false`, **no starter kit**. This is the designed skipper (no kit, no meeting, ordinary Forced Retreats).
  - Not chosen: today's live start (feature off, the current kit of pouch, scout kit and Field Medkit).
  - *Why it matters:* A vs B is the comparison H2 exists for; A must be the start you intend to ship.
- **H2-b The meeting in B** `[DECIDED Oct 15]` = the recommendation. After the first Downing, the survivor rests at the Jester's camp, then waits for the player (U38a, no timer).
  - **Decided:** the idle player completes the meeting at its next 8 h return, choosing the run's weapon through `ZI.jesterMeet(weaponId)`. Wait time is recorded and classed INFO (idle by design, U38a), not S3.
  - Not chosen: meet immediately when the wait starts (understates real waiting).
- **H2-c T3 coverage** (watched vs offline) `[DECIDED Oct 15]`: **Scenario A and B with the Nail Bat only**, 1 seed each; not all four starts. *Why:* the three B starts share every rule except the weapon, so one B start proves watched/offline behavior for all.

## 3. Rules carried unchanged `[DECIDED]`

D3 scope and the excluded-systems table (Routes, Schedule, crafting, Fort scenes, Camp Leader) · D4 Normal only, Heinous unlocked as a labelled fixture, Easy/Hard not meaningful (G4) · D5 return through the ordinary page-load path every 8 simulated hours · D6 soft-lock classes S1–S5 · D7 validity after every step · D8 T1/T2 in A only, T3 per H2-c · D9 runaway report-only (>3× day 10 → 30) · D10 records and reproducibility · A's trap measure: N consecutive withdraw → rest → redeploy cycles with no net haul banked, N set from the first report · JD1a check 10: nothing writes the Jester switch into a save; the real game stays off.

**Known limitations (stated in every report):** G3 reputation forgiveness settles at most one day per page load (3 loads/day at 8 h returns, so small); G4 no difficulty modifiers; Q3 XP decay floor unverified (XP bound = H1's verified bound or "finite"); narrated tutorial finds (U11) are not built, so B's start has no scripted finds.

---

## 4. Proposed batch (`CURRENT_BATCH.md` once locked)

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

## 5. Spec impact (when H2 closes)
Spec §9 "One clock" and "Seeded rolls" (brief §9); spec §12.6 Harness (days, seeds, return interval, S4 window, runaway ratio, report path); lead brief §7.4 gates 1 and 3 point to the report.

## 6. Watch for (teaching)
- **A baseline is not a verdict.** H2's first report shows where the game *is*; tuning comes after, one change at a time, re-run against the same seeds.
- **Idle is the worst case on purpose.** If an idle survivor is healthy, an attentive one will be too; the reverse isn't true.
- **Compare like with like:** same seeds across starts means A vs B differences come from the start, not luck.
