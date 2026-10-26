# Zed Idler — Simulation and Test Harness v1 (Slice Brief)

**Status:** **H1 CLOSED (Oct 10).** Code reported `H1 CLOCK AND RNG: CLOSED` with all nine completion criteria met (`reference/archive/h1-acceptance-report.md`); Sam's browser save-isolation check passed on the local H1 build. H1's batch contract is archived as `reference/archive/h1-batch.md`. **H2 is decided in outline** (Section 6); **all prerequisites CLOSED Oct 15** (H1, FX1–FX5, CB1, JD1a). **H2 LOCKED Oct 15** (`h2-batch-draft.md`; H2-a designed-skipper A, H2-b meeting at the next 8 h return, H2-c T3 on A and B-bat); it is `CURRENT_BATCH.md`; it supersedes D4's run count, D5's derived values and D11's Belt Pouch fixture as recorded there (J7, U19, C5). **Standing precondition:** before the Claude Design real-game preview runs any H1 build, the TEST SAVE preview must pass the real-save fingerprint check (acceptance report §13).
**Companion to:** `wandering-tab-spec.md` (v2.1) §9, `zed-idler-design-lead-brief.md` §7.1 #5, §7.4 gates 1 and 3, `archive/r1-brief.md`.
**Tags:** `[DECIDED Oct 9]` locked by Sam · `[PROPOSED]` awaiting Sam · `[OPEN]` needs a decision or fact · `[CODE]` a fact about the current build

---

## 1. Next slice

A test harness that runs the game's rules with no screen, on simulated time and seeded randomness, for N simulated days per policy, and reports whether each run stayed healthy.

- **H1 (Clock and RNG):** deterministic simulation infrastructure. No player-facing change.
- **H2 (Matrix runner and report):** the baseline runs, health checks and the report. A separate batch that starts only after H1 is closed.

*Why now:* it is the next roadmap item (lead brief §8). It turns release gates 1 and 3 into measurable checks, and it removes the timing dependence behind R1 check 15.

---

## 2. Findings from Code's feasibility review

Recorded from Sam's summary (Oct 9). Code's full answers to C1–C13 (file:line detail) are **not in this workspace**. Code should carry them into `CODE_STATE.md` as H1's first step (H1 step 1).

| # | Finding | Used in |
|---|---|---|
| F1 | Verdict: **CONDITIONAL GO** for H1 | Status |
| F2 | Some timestamps serve both gameplay and record-keeping; they need individual audit | A1, H1 step 1 |
| F3 | The live game must keep unseeded rolls; harness-only seeding is feasible without save changes | A2 |
| F4 | Existing Wandering seeded sequences and seed-specific test expectations can be preserved | A3 |
| F5 | The Wandering **screen writes gameplay values into state**, among them `moveSpeed` and `healPct`. Watching therefore differs from offline in more than HOLD | A4, D5, D8, G2 |
| F6 | In-scope code directly calls three out-of-scope functions: `economy.toRecyclerItem`, `routes.tryDiscoverVehicle`, `items.getActiveBuffs` | A5 |
| F7 | The 24 h cap is applied in the `WanderEngine.tick` return path, where `_carryMs` must be treated correctly | A6, T2 |
| F8 | R1 check 15 is a **timing failure** tied to the `_simNow` re-anchor to the wall clock | §3, H1 step 4 |
| F9 | Three resource bounds are unresolved: **XP/level, charges, durability** | D7, H1 step 6 |
| F10 | Buffs are applied and expired using inconsistent real and simulated clocks | G1 |
| F11 | Reputation forgiveness processes **at most one day per page-load settle** | G3 |
| F12 | Difficulty multipliers are missing from the in-scope simulated systems | D4, G4 |
| F13 | Real time is also used for **simulation locking**, alongside session ids, `savedAt` and the resume window | A1 |

---

## 3. R1 check 15

- **Cause** (F8): a timing failure. `advance()` re-anchors `state._simNow` to `Date.now() - left` when it drifts more than 2 s from real time (`[CODE]` `game/wandering.js:372`), so machine speed decides whether the simulated clock moves during HOLD.
- **Expected after H1** `[DECIDED Oct 9]`: check 15 becomes deterministic and passes. It is the only existing result allowed to change.
- R1 itself stays open until Code reports `BATCH R1: CLOSED`. H1 closing does not close R1.

---

## 4. Constraints

### 4.1 Locked elsewhere

| Constraint | Source |
|---|---|
| One simulation, many views | Spec §9 |
| Rules as plain functions with no React coupling | Spec §9 |
| **24 h offline catch-up cap. Not changed** | Spec §9; Sam Oct 9 |
| Results are the same for any chunking of elapsed time | `[CODE]` `_move`, `CODE_STATE.md` |
| Watching (R1): screen laid out and visible; a chunk over 2 s is never watching | `[CODE]` R1 |
| Every prompt has a timer and a policy default | Design rules §4.5 |

### 4.2 H1 guarantees `[DECIDED Oct 9]`
H1 preserves all of these:
- player-facing gameplay and balance
- combat and encounter probability distributions
- save compatibility and the save format (no new keys, no version change)
- the 24 h offline cap
- the existing rules for buffs, decay, reputation, injury, HOLD and recovery
- every existing automated regression result, except R1 check 15, which becomes deterministic and passes

**H1 fixes no unrelated gameplay behavior.** Anything found goes to Section 7 as a follow-up candidate.

---

## 5. H1 decisions `[DECIDED Oct 9]`

### A1. Clocks
- **`ZI.now()`** is the gameplay clock and the deterministic record clock. Every rule, and every stored timestamp that a rule or a deterministic record reads, goes through it. In the game it returns real time; in the harness it returns installed simulated time.
- **Real time stays** for session ids, `savedAt`, the reload-resume window and simulation locking (F13).
- **Mixed-purpose timestamps** (F2) are audited one by one. For each, Code records which clock it uses and why. A case the rule above doesn't settle stops the work (CURRENT_BATCH stop conditions).

### A1a. `_simNow` contract
- `advance()` reads **neither** the real clock **nor** the injected clock.
- The engine (`WanderEngine`) seeds `state._simNow` from the previously established simulation timestamp. `advance()` moves it forward only by the simulation time it actually consumed.
- The 2 s re-anchor is removed.
- Required: before/after tests for the removal, in particular **buffs during carried or delayed simulation steps** (`_carryMs`, late ticks).

### A2. RNG: harness-only seeding (option c)
- Out-of-scope rolls in reach (A5) go through a per-system hook. In the live game the hook returns exactly what it returns today (`Math.random()`), and in the harness it returns a seeded per-system stream from one master seed.
- The live game keeps its existing random behavior. No new save keys and no save-version change.

### A3. Preserve existing sequences (option a)
- The existing seeded Wandering `rng` and its sequences are unchanged. New streams are added only where `Math.random()` is used today.
- **No test is changed to accommodate an altered sequence.** If a sequence changes, that is a stop condition.

### A4. Watching differences (option a)
Code lists every code path that behaves differently when watching, **including every screen-only gameplay write** (F5: `moveSpeed`, `healPct` and any others). H1 delivers the list; H2's T3 accounts for each item. Watched and offline runs are never assumed equivalent.

### A5. Reach (option b, widened)
- H1 covers the in-scope systems (the Wandering run, skill decay, timed buffs, reputation forgiveness) plus three direct dependencies: `economy.toRecyclerItem`, `routes.tryDiscoverVehicle` and `items.getActiveBuffs`.
- H1 is **not** a Routes, crafting or economy redesign. Only the clock and roll calls inside those three functions change.

### A6. Offline cap
- The 24 h cap is verified through the real `WanderEngine.tick` return path, including correct treatment of `_carryMs`. Calling `advance()` directly is not a cap test.

### D7 bounds (part of H1)
- Code verifies the three unresolved bounds (F9: XP/level, charges, durability) from the real rules, and writes invariant tests from what the rules define. No arbitrary limits are invented.
- Where a rule defines no bound, the invariant is "finite", and the finding is listed for Sam.

---

## 6. H2 decisions `[DECIDED Oct 9]` (separate batch, after H1 closes)

**D3 Scope.** In: the Wandering run, skill decay, timed buffs, reputation forgiveness. Out: Routes, Schedule, crafting, Fort scenes, Camp Leader. Every report repeats the effects:

| Excluded | Effect on results |
|---|---|
| Routes | No Routes claims into the Recycler; no Routes vehicle wear |
| Schedule | No camp job output or job XP. Base skills look more decayed than in real play |
| Crafting | **No material sinks.** Material accumulation is expected to read high. Kits and gear are never crafted |
| Fort scenes | No Fallow Ground quest. The Factions page stays locked. Heinous uses the unlocked start fixture |
| Camp Leader | Solo only |

**D4 Matrix.**
- 4 policies × **Normal** × 5 seeds × 30 days × **2 starting scenarios (D11)** = **40** baseline runs (was 20; amended Oct 10, Q6).
- Heinous starts unlocked as a labelled fixture.
- The harness implements no difficulty modifiers. Easy and Hard are **not meaningful** for the current in-scope systems (F12), and reports say so.

**D5 Idle player.**
- An actual new-save survivor that selects a policy and never responds to manual prompts. In Scenario B (D11) the one declared carrier fixture is the only difference.
- It returns through the game's ordinary page-load path every 8 simulated hours.
- Legitimate blocking and recovery behavior is preserved: prompt timeouts, HOLD timers, overload withdrawal, forced retreat, rest.
- **Headless values:** the values the screen would write (`moveSpeed`, `healPct`, F5) are derived explicitly from the chosen fixture's actual starting conditions and recorded in the run record. The harness never grants equipment, speed, healing bonuses or carrier capacity silently.
- A state that waits for input with no timer or default is never resolved by the harness; it is reported as an S3 failure.

**D6 Soft-locks.**

| Class | Meaning |
|---|---|
| FAIL: soft-lock | Progress demonstrably blocked; no timed state will end it |
| WARN: stall | 24 h without a progress event, with no block proven. A diagnostic |
| INFO: idle by design | A timed state is running (rest, HOLD, prompt timer, cooldown) |

- S1 safety guard hit, S2 unconsumed time with no resumable cause, S3 a waiting state with no finite end, S5 rest beyond its worst-case length: FAIL.
- S4 (24 h with no progress, INFO time excluded): WARN, promoted to FAIL only when S1–S3 or S5 confirm a block.
- Slow progression is never a soft-lock.

**D7 Validity.** After every step, every tracked value is finite and inside its rule-defined bounds as verified by Code (H1). Negative values are legal where a rule allows them (reputation down to −1000; Lodge ≥ −250).

**D8 Offline and watching.** Three separate tests:

| Test | What | Pass rule |
|---|---|---|
| T1 Chunk equivalence | Equal simulated time, identical seed and actions, unwatched, split three ways (one call, 1 h chunks, 1 s chunks), at the `advance()` level | Exact equality (sorted-key fingerprint) |
| T2 Cap verification | Away 72 h vs away 24 h through `WanderEngine.tick`, including `_carryMs` | 72 h processes no more than 24 h; exact equality where the inputs are equivalent |
| T3 Watched vs offline | Equal simulated durations (1 h, 24 h) | Exact equality only where semantics and inputs are genuinely equivalent, after accounting for HOLD, the screen-written values (A4 list) and the different decay behavior. Otherwise reported as aggregates. **No ±5% hard criterion** until initial results have been reviewed |

**D9 Economy runaway.** Report-only. Growth above 3× from day 10 to day 30 is flagged, never classified as a bug automatically. Elevated material accumulation is expected (no crafting).

**D10 Reporting.**
- Each run record carries the seed, the relevant starting state and fixtures, the configuration, the derived headless values, each check's result and class, daily resource stocks and flags, and a failure snapshot on any failure.
- The summary is a policy table, **one per scenario (D11)**, plus a comparison table A vs B per policy.
- Replaying the same seed and configuration reproduces identical results.
- **Artifacts** go to `reports/sim-harness-v1/`, excluded from version control. The runner and test definitions stay under version control.

**D11 Starting scenarios `[DECIDED Oct 10, Q6]`.** Every configuration runs in both scenarios; results are never pooled.

| | Scenario A: Authentic new save | Scenario B: Starter carrier fixture |
|---|---|---|
| Survivor | The real new-save survivor | The same survivor and rules |
| Inventory | The real starting inventory; nothing granted | Real start + one existing carrier item, normal capacity and effects. Simulation-only |
| Recorded | Starting load capacity | The item, the inventory difference and the resulting load capacity |
| Reports | Whether the survivor gets trapped in repeated overload/recovery cycles | The same measures, for comparison with A |
| Shared | Seeds, the four policies, Normal, 30 days | same |

Scenario B never changes the game's starting inventory and never grants players equipment. Carrier: **belt pouch** `[DECIDED Oct 10]`.

**Finding (acceptance report §14, Oct 10):** over 24 h, A and B produced identical withdrawal counts (17/17, 16/16, 15/15). HP and load fail together around 84–90 s; the belt pouch (cap 15 → 18 kg) only shifts the primary cause from load to HP. To test what it intends, B needs an HP-side change (armor, weapon or heals). `[OPEN]`: what change, for Sam to decide before H2 is drafted. Until then D11 stands as written.

**H2 checks affected by D11** (to settle when H2 is drafted): D4 run count; D5 idle-player definition; D6 soft-lock classes reported per scenario (A's trap measure: N or more consecutive withdraw → rest → redeploy cycles with no net haul banked between them; N set from the first report `[DECIDED Oct 10]`); D7 load bounds use each scenario's capacity; D8 T1 and T2 in A only, T3 in both `[DECIDED Oct 10]`; D9 runaway flag per scenario; D10 records carry the scenario id and fixture.

---

## 7. Separate gameplay issues: follow-up candidates (not in H1 or H2)

Each is documented here only; none is implemented in this slice. Each needs Sam's decision before it becomes a batch. **Oct 10:** G1 is decided as Q4 and G2 as Q5; with Q1 (HP minimum) and Q2 (per-return cap) they are proposed as batches FX1–FX4 in `gameplay-fix-batches-proposal.md`. G3 and G4 remain candidates.

| # | Issue | Proposed verification criteria |
|---|---|---|
| **G1** | Buffs are applied and expired with inconsistent real and simulated clocks (F10). **Fixed by FX3, CLOSED Oct 10** | A buff applied at simulated time t with duration d is active on every step in [t, t+d) and inactive from t+d. The result is identical for any chunking and for watched or offline |
| **G2** | The Wandering screen writes `moveSpeed` and `healPct` into game state (F5). **Fixed by FX4, CLOSED Oct 13** | Both are computed by rule code from gear and stats. A run with the screen never mounted gets the same values as a watched run |
| **G3** | Reputation forgiveness processes at most one day per page-load settle (F11) | After N offense-free days away, standing has drifted N days' worth (subject to the 2-day wait and the cap), whatever the number of page loads |
| **G4** | Difficulty multipliers are missing from the simulated systems (F12) | Each spec §15.2 parameter in scope reads through the one difficulty function; Easy, Normal and Hard runs differ by exactly the table values |

*Why separate:* each one changes player-facing behavior. Fixing any inside H1 would break §4.2 and mix infrastructure with balance.

---

## 8. Parked

| Item | Why |
|---|---|
| Attentive player profiles | Idle must hold first |
| Mid-game and late-game start states | Needs fixture saves |
| Easy and Hard matrix runs | After G4 |
| Routes, Schedule, crafting, Fort scenes, Camp Leader in the sim | D3 |
| Economy source/sink table and real thresholds | After the first D9 report |
| Save/load gate (gate 2), performance gate (gate 6) | Separate slices |
| Live-game replay from saved streams | A2 kept seeding harness-only |
| Unity/C# harness | After the port |

---

## 9. Spec impact (when H1 and H2 close)

- **Spec §9:** add "One clock" (A1, A1a) and "Seeded rolls" (A2, A3).
- **Spec §12:** add `12.6 Harness` (days, seeds, return interval, S4 window, runaway ratio, report path).
- **Lead brief §7.4:** gates 1 and 3 point here.
- **`CODE_STATE.md`** (Code): the time audit, the A4 watching list, the verified bounds and the clock and RNG hooks.

---

## 10. Batch

- **H1:** CLOSED Oct 10. Batch contract archived as `reference/archive/h1-batch.md`; evidence in `reference/archive/h1-acceptance-report.md`. This brief is the design record.
- **Standing precondition (acceptance report §13):** the browser check validated the local H1 build only; the Claude Design preview still runs the pre-H1 build. Before the real-game preview runs any H1 build: (1) in the TEST SAVE preview frame, record the real-save fingerprint (Snippet B); (2) sync the H1 files into the project without opening the real-game preview; (3) in the TEST SAVE frame, confirm `h1Build: true` and `shimActive: true` (Snippet A); (4) confirm the fingerprint matches step 1, play 1–2 minutes, and confirm it still matches; (5) only then open the real-game preview.
- **H2:** drafted only after H1 reports `H1 CLOCK AND RNG: CLOSED` and Sam has reviewed the result. **Oct 10 (U3):** H2 also waits for FX1 (HP minimum) and FX2 (per-return cap) to close. FX3 and FX4 may be open during H2 only as documented limitations, if Code's TQ10 answer supports it.

---

## 11. Patterns used (for Sam)

- **Injectable clock:** rules ask one function for the time, so tests control time like any other input.
- **Advance by consumed time** (A1a): the simulation's clock moves only by the time the simulation actually spent. It never jumps to match the machine, so a slow machine cannot change the outcome.
- **Seams with a live default** (A2): a hook that returns exactly today's behavior in the game and a controlled value in tests. You get testability without changing what players see.
- **Diagnose, then fix:** check 15's cause was identified (F8) before H1 was scoped to remove it.

## 12. Proposed milestone metric (MS3, Oct 26) `[PROPOSED]`

Report per run whether MS1 (turning in Fallow Ground) is reached, game days to reach it, and Downings and retreats before it. A run that never reaches it is flagged as a possible dead end.

**Proxy `[DECIDED Oct 26, PM]`:** H2 scope D3 stays unchanged (no Fort scenes). MS3 reports whether the survivor becomes strong enough to clear the Fallow Ground cell (its clear target) and game days to get there. The real turn-in is tested with players.
