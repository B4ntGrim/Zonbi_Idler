# CURRENT_BATCH — H1: One clock and seeded rolls

**Source:** `reference/sim-harness-v1-brief.md` §2–5 `[DECIDED Oct 9]`. If this file and the brief disagree, stop and ask.
**Status:** **CLOSED (Oct 10).** All nine completion criteria met; see `reference/archive/h1-acceptance-report.md`.
**Correction (Oct 10, TQ7):** Code's step report said adding `now` to `ALWAYS` changed 16 results. Tested in isolation, it changes none; those failures came from a name collision with the world clock's `ZI._clock`. The implementation was correct throughout; only the explanation and this wording were wrong.
**History:** Oct 9, Code stopped before implementation on the `split-equivalence` blocker; Sam resolved it (see "Authorized edits to existing tests"), accepted Code's file-list corrections, and replaced the baseline with Code's measurements. Second stop (step 3, Oct 9): the `bootstrap.js:69` conversion changes `awardXp`'s source text; Sam authorized `awardXp` as the 16th `CHANGED_FN` name, for that one line only.
**Oct 10 update:** Code reported 415/415 existing, 19/19 new, R1 check 15 25/25, no unexpected differential. Gameplay issues raised during H1 are decided in `reference/h1-findings-decisions-oct10.md`; none of those fixes enter H1. Code answered TQ6–TQ8 in the acceptance report (§7, §13, §14).
**Precondition:** none. H1 does not depend on R1 closing, and closing H1 does not close R1.
**Follow-on:** H2 (matrix runner and report) cannot begin until this batch reports `H1 CLOCK AND RNG: CLOSED` and Sam has reviewed it.

## Goal
Make simulated time and randomness fully controllable for the in-scope systems, so no test depends on wall-clock time or machine speed. No player-facing change.

## Exact scope
**In:**
- the Wandering run: `advance()`, `WanderEngine` tick and live step, R1 rule checks, HOLD, rest, forced retreat, prompts
- skill decay settlement
- timed buffs
- reputation forgiveness
- three direct dependencies, limited to their clock and roll calls: `economy.toRecyclerItem`, `routes.tryDiscoverVehicle`, `items.getActiveBuffs`

**Out:** everything else in Routes, Schedule, crafting, economy, Fort, camp and jobs; the matrix runner, health checks and report (H2); difficulty work; the gameplay issues G1–G4 (brief §7).

## Decided behavior
1. `ZI.now()` is the gameplay and deterministic record clock (implemented as `ZI.clockNow()` in `core.js`; `ZI.now()` in `jobs.js` defers to it). In the game it returns real time; tests can install a simulated clock that moves only when the test advances it. (A1)
2. Real time stays for session ids, `savedAt`, the reload-resume window and simulation locking. (A1)
3. Every mixed-purpose timestamp in scope is audited individually, and its clock and reason are recorded. (A1)
4. `advance()` reads neither the real nor the injected clock. `WanderEngine` seeds `state._simNow` from the previously established simulation timestamp; `advance()` moves it only by consumed simulation time. The 2 s re-anchor is removed. (A1a)
5. Rolls in scope that use `Math.random()` today go through a per-system hook. Live: returns `Math.random()`, unchanged. Harness: a seeded stream per system from one master seed. (A2)
6. The existing seeded Wandering `rng` and its sequences are unchanged; no test is edited to fit a new sequence. (A3)
7. Every behavior that differs when watching, including every screen-only gameplay write (`moveSpeed`, `healPct`, any others), is listed. Listed, not changed. (A4)
8. The 24 h cap is verified through `WanderEngine.tick`, including `_carryMs`. The cap is not changed. (A6)
9. The XP/level, charges and durability bounds are verified from the real rules, and invariant tests are written from them. Where no bound is defined: finite only, and listed for Sam. (D7)
10. No change to gameplay, balance, combat or encounter odds, save format or keys, the offline cap, or the rules for buffs, decay, reputation, injury, HOLD and recovery. No unrelated fixes.

## Files expected to change
Corrected Oct 9 from Code's step-1 review, accepted by Sam.
- `game/core.js`: the clock **`ZI.clockNow()`**, the test-only clock install and the per-system roll hook
- `game/jobs.js`: `ZI.now()` stays and **defers to `ZI.clockNow()`**
- `game/bootstrap.js`: The replay keeps hiding `ZI.now` before old line 1650 (`now` is **not** in the `ALWAYS` list); rule code uses `ZI.clockNow()`, which the replay never hides. Line 69 inside the load-time `ZI.awardXp` wrapper: `st.lastActiveUtc = Date.now()` → `ZI.clockNow()`. That one line only (a gameplay read: decay computes idle days from `lastActiveUtc`)
- `game/save.js`: **line 154 only** (the v1→v2 migration's clock read). No other change to save or migration code
- `game/wandering.js`: `advance()` `_simNow` contract; `WanderEngine` seeding and tick; the policy cooldown and command window clock reads
- `game/stats.js`: decay clock reads
- `game/items.js`: `getActiveBuffs` and buff application clock reads
- `game/factions.js`: `settleRepForgiveness` and offense timestamp clock reads
- `game/economy.js`: `toRecyclerItem` clock and id roll
- `game/routes.js`: `tryDiscoverVehicle` timestamp
- `tests/split-equivalence.test.js`: only the authorized edits below
- `tests/sim-clock-rng.test.js`: new
- `CODE_STATE.md`

**Removed from the list:** `game/active.js`. Its only clock read is the session id, which is a real-time exemption.

**Not expected to change:** any screen file; any save or migration code other than `save.js` line 154; any existing test file other than the authorized `split-equivalence` edits.

## Authorized edits to existing tests
In `tests/split-equivalence.test.js`, and nowhere else:
1. Extend `ADDED` with each new `ZI.*` export H1 introduces (list them in the report).
2. Add **exactly these 16 names** to `CHANGED_FN`:
   `getCmdWindow`, `cmdResetInMs`, `policyCooldownLeftMs`, `setPolicy`, `skillDecayState`, `skillIdleDays`, `getDecayClock`, `_maybeSettleOnRead`, `getInjury`, `setInjury`, `getActiveBuffs`, `repApply`, `settleRepForgiveness`, `_boot`, `now`, **`awardXp`** (added Oct 9; its only permitted change is `bootstrap.js:69` `Date.now()` → `ZI.clockNow()`).

Any other edit to any existing test, including a 17th `CHANGED_FN` name, or any other change to `awardXp`, is a stop condition.

## Ordered implementation steps
Run all 14 suites after every step. A step is done only when they match the baseline, with R1 check 15 the only permitted change.
0. **Baseline.**
   - Confirm the measured baseline below: all 14 suites, `r1` ×20 with a frozen clock, and `r1` ×5 with a 5 ms delay per advance.
   - **Preserve the step-0 build** (tagged commit or copy) for the differential test (required test 14).
   - Capture a pre-H1 save for the compatibility test (required test 15).
   - Record the hash of every file in the list above.
1. **Audit.** Record in `CODE_STATE.md` every in-scope time read: file:line, purpose, clock assigned, reason. Do the same for every in-scope `Math.random()`. Carry over the C1–C13 answers.
2. **Seams.** In `core.js`, add `ZI.clockNow()`, the test clock install and the per-system roll hook, with live defaults identical to today. Make `ZI.now()` in `jobs.js` defer to `ZI.clockNow()`. Leave the bootstrap `ALWAYS` list unchanged, so `ZI.now` stays hidden before old line 1650. Apply the authorized `split-equivalence` edits. No call sites changed yet.
3. **Convert clock reads** in scope to the clock, one file at a time, including `bootstrap.js` line 69 (→ `ZI.clockNow()`, the authorized `awardXp` change) and `save.js` line 154.
4. **`_simNow` contract.** Write the before/after tests first (4a), then remove the re-anchor and move seeding to the engine (4b).
5. **Convert rolls** in scope to the hook, leaving the Wandering `rng` untouched.
6. **Bounds.** Verify XP/level, charges and durability from the rules, and write the invariant tests.
7. **Cap.** Write the `WanderEngine.tick` cap test with `_carryMs`.
8. **Watching list.** Record every watching-dependent path and screen-only write in `CODE_STATE.md`.
9. **Final verification and report** (below). Write Sam's browser steps (completion criterion 8).

## Required tests
All are in the new `tests/sim-clock-rng.test.js` unless stated.
1. **Clock install:** with a simulated clock installed, advancing 72 simulated hours needs no real waiting, and decay, buffs, cooldowns and rest all see the same 72 h.
2. **No stray reads:** a static scan finds no `Date.now()` or `Math.random()` in scope outside `ZI.now()`, the roll hook and the real-time exemptions.
3. **`_simNow` before/after:** `_simNow` advances by exactly the consumed simulation time across normal, carried (`_carryMs`) and delayed steps. An artificial delay between steps changes nothing.
4. **Buffs under carried and delayed steps:** a buff's active window is identical with and without delays and carried time. Compare only what H1 changed; G1 is not fixed here.
5. **Same-seed determinism:** the same seed and configuration give identical final states (sorted-key fingerprint).
6. **Stream isolation:** changing one system's stream does not change another system's results.
7. **Live default unchanged:** with no harness installed, every hook calls `Math.random()`, `ZI.clockNow()` returns `Date.now()`, and `ZI.now()` returns the same value as `ZI.clockNow()`.
8. **Wandering sequence preserved:** a fixed seed gives the same Wandering roll sequence as the step-0 build.
9. **Distributions:** 10,000 draws per converted roll keep the same range, and mean and spread match the old roll within sampling error.
10. **Cap:** 72 h away through `WanderEngine.tick` processes no more than 24 h, with `_carryMs` handled; the final state equals the 24 h-away run.
11. **Bounds:** invariant tests for XP/level, charges and durability, from the verified rules.
12. **Suite repeatability** (checklist 2): run the new suite **5 times**. All 5 runs produce identical results: the same pass/fail for every check, and the same fingerprints wherever a check records one.
13. **Frozen-clock HOLD** (checklist 3): `tests/r1.test.js` ×20 with a **frozen clock**, and ×5 with a **5 ms delay per advance**. Check 15 passes in all **25** runs, and every other r1 check passes in all 25.
14. **No gameplay change: before/after differential** (checklist 4).
    - Run the preserved step-0 build and the H1 build on the same **≥ 5 seeds**, the same start state and the same simulated durations (**1 h and 24 h**).
    - Supply time **identically** to both: the same scripted time source drives `Date.now()` in the step-0 build and `ZI.now()` (and any remaining `Date.now()`) in the H1 build.
    - **Pass:** the final run state is identical, except for fields H1 documents in advance as intended differences (for example `_simNow` semantics). Each intended difference is listed with its reason before the test runs.
    - **Any other difference is a stop condition:** investigate it and report it. It is never accepted by default.
15. **Save compatibility, headless** (checklist 5).
    - Load the pre-H1 save from step 0 into the H1 build.
    - **Pass:** the same keys, the same fields and the same save version as before loading, and the loaded run continues (an `advance()` and an engine tick complete and the run state moves forward).

## Baseline regression (measured by Code, Oct 9)

| Suite | Checks |
|---|---|
| batch1 | 16/16 |
| batch2a | 18/18 |
| batch2b | 53/53 |
| batch3a | 22/22 |
| batch3b | 34/34 |
| bug-fixes | 17/17 |
| carrying-1b | 34/34 |
| carrying | 27/27 |
| fort-s12 | 100/100 |
| load-regressions | 14/14 |
| r1 | **41/42** (check 15 fails) |
| retreat-getaway | 7/7 |
| split-equivalence | 17/17 |
| tutorial-flags | 14/14 |
| **Total (14 suites)** | **414/415** |

**`r1` repeat runs:**
- frozen clock, ×20: **2/20** full passes
- 5 ms delay per advance, ×5: **5/5** full passes

**Known pre-existing failure:** R1 check 15, the only failure. It is a timing failure tied to the `_simNow` re-anchor. After H1 it must pass under both conditions (required test 13). Re-confirm these counts in step 0; if they differ, report before continuing.

## Stop conditions
Stop and report; do not work around any of these:
- Any existing suite result changes, other than R1 check 15 becoming a pass.
- Any edit to an existing test beyond the authorized `split-equivalence` edits.
- The Wandering seeded sequence changes, or a test would need editing to fit a new sequence.
- Any save key, field, version or format would change, or a migration would be needed.
- The differential (required test 14) shows a difference not documented in advance as intended.
- A file outside "Files expected to change" would need editing, or a change in a listed file falls outside its stated purpose.
- A mixed-purpose timestamp that the A1 rule doesn't settle.
- A gameplay bug or design gap is found: report it as a Design Handoff, don't fix it.
- Reaching into Routes, crafting, economy, camp or Fort beyond the three named functions would be needed.
- A bound in step 6 cannot be determined from the rules.

## Rollback
- Commit each step on its own, from the step 0 baseline.
- If a stop condition is hit, revert to the last green step, then report.
- If H1 cannot close, revert to the baseline commit. The live game must remain exactly as it was.

## Completion criteria
H1 is CLOSED only when all of these hold:

| # | Criterion | Checklist |
|---|---|---|
| 1 | Steps 0–9 done; the `split-equivalence` blocker resolved with only the authorized edits | 1 |
| 2 | Required tests 1–11 pass, and the new suite gives identical results in 5 of 5 runs (test 12) | 2 |
| 3 | R1 check 15 passes in all 25 runs: frozen clock ×20 and 5 ms delay ×5 (test 13) | 3 |
| 4 | The before/after differential shows no difference beyond those documented as intended (test 14), and the existing suites read 415/415 | 4 |
| 5 | The headless save-compatibility test passes (test 15) | 5 |
| 6 | The changed-line inventory shows every changed line in one of the five allowed classes, with zero scope violations | 6 |
| 7 | The final report contains every item in "Required report" | 7 |
| 8 | **Sam reports** that the browser TEST SAVE real-save fingerprint is unchanged, using steps Code provides. Until then, H1 stays NOT CLOSED | 5 |
| 9 | `CODE_STATE.md` holds the audit, the watching list, the verified bounds and the hook locations | — |

## Required report
`CLAUDE_CODE_RULES.md` is not in the project, so the report contents are defined here. In order:
1. **Steps done:** 0–9, each with done or not done and a note.
2. **File inventory:** every changed file with its hash before and after, and every file confirmed unchanged.
3. **Changed-line inventory:** every changed line (file:line), classified as clock conversion, roll-hook conversion, `_simNow` contract, seam, or test. A line in any other class is listed as a **scope violation**.
4. **Existing suites:** baseline vs final for each of the 14 suites, plus the totals.
5. **New suite ×5:** results of each run and confirmation that all 5 are identical.
6. **`r1` repeat runs:** frozen clock ×20 and 5 ms delay ×5, as full-pass counts and the check 15 result per run.
7. **Differential results:** seeds, durations, the intended differences declared in advance, and any other difference with its investigation.
8. **Save and cap results:** required tests 15 and 10.
9. **Audit summary:** time reads and rolls by file, with the clock assigned and the reason.
10. **Watching list:** every watching-dependent path and screen-only write.
11. **Verified bounds:** XP/level, charges, durability, each with its source rule, plus any bound that is "finite only".
12. **Authorized test edits:** the `ADDED` names and the 16 `CHANGED_FN` names, exactly as applied, with the `awardXp` diff shown (one line).
13. **Browser steps for Sam:** how to take the sorted-key fingerprint in TEST SAVE before and after.
14. **Design Handoffs raised.**
15. **Final line:** `H1 CLOCK AND RNG: CLOSED` or `H1 CLOCK AND RNG: NOT CLOSED`. Until Sam reports criterion 8, the line is `NOT CLOSED (awaiting Sam's browser check)`. Do not begin H2.
