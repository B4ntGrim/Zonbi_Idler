# CURRENT_BATCH — FX1: HP floor and Downed

**Source:** `reference/fx1-hp-floor-slice.md` §7. If this file and the slice disagree, stop and ask.
**Status:** **CLOSED (Oct 10).** `FX1 HP FLOOR: CLOSED` — see `handoff/to-design/FX1_COMPLETION_REPORT.md`.
**Decisions:** Q1, U1, U5, U6, U7, U25, U26 `[DECIDED Oct 10]` (slice §2). U25/U26 added after step 1 (`handoff/to-design/FX1_STEP1_REPORT.md`, K1/K2).
**Precondition:** H1 CLOSED (Oct 10). **Standing precondition:** before the real-game preview runs any H1-or-later build, the TEST SAVE preview must pass the real-save fingerprint check (`DESIGN_HANDOFF.md` §2).
**Follow-on:** FX2 is not started until this batch reports `FX1 HP FLOOR: CLOSED` and Sam locks FX2.

**Goal.** HP never falls below 1. Reaching 1 HP from any damage source triggers the existing Downed path. No other gameplay change.

**Decided behavior** (all `[DECIDED Oct 10]`)
1. Every HP write stores a value ≥ 1 (Q1).
2. When damage **inside a Wandering run** (fights, policy hits, failed ventures and their ambushes) brings HP to 1, by being absorbed at the floor or by landing on exactly 1, the survivor is Downed. Downed runs heal → revive → Forced Retreat, unchanged (U5).
2a. **Exempt (U25, U26):** a failed Fort guard attack and a failed Traversal loot search floor HP at 1 and keep their own costs, but **never Down** the survivor. A survivor in the Fort scene cannot be Downed. The next damage inside a run Downs them as usual. `game/fort.js` and `screens-v3.jsx` are not changed.
3. Lethal fight damage: `state.hp = Math.max(1, res.hpLeft)` at `wandering.js:326`, then Downed (review §4).
4. Policy hits and failed ventures that bring HP to 1 call the same Downed handling as fights (U5; route per TQ-FX1b).
5. The log line for the Downing hit shows the attack's full damage (U6). No log wording change.
6. Base rest starts from `restStartHp` = 1.
7. Unchanged: max HP, heal and revive amounts, rest rate, the resume gate, Batch 3B consequences, save keys, save version.

**Likely files.** `game/wandering.js` (fight write, policy hit) · `game/active.js` (venture failure, possibly a shared Downed helper) · new `tests/fx1-downed-hp.test.js` · `tests/sim-clock-rng.test.js` (authorized edit only) · `CODE_STATE.md`. **Not** `game/combat.js` and not the separate hack-and-slash mode.

**Steps**
- **Step 0, baseline:** all 15 suites; a preserved copy of the current build for the differential; hashes of the files above.
- **Step 1, investigation:** answer TQ-FX1a–d. **Stop and report** if any HP-lowering path is not listed in the review, or if routing a source into Downed needs a change outside the likely files.
- **Step 2:** implement behaviors 1–6.
- **Step 3:** add the tests below; run the full regression.

**Acceptance checks** (new suite `tests/fx1-downed-hp.test.js`)
1. Lethal fight, no heal and no revive, 15+ seeds: outcome `forcedRetreat`, cause `downed`, `hp === 1`, `restStartHp === 1`, `restAt === 'base'`.
2. Lethal fight with a heal charge: outcome `healed`, HP = 1 + heal. With a revive item: outcome `revived`.
3. A fight hit that leaves exactly 1 HP: Downed (same outcomes as 1 and 2).
4. A policy hit that brings HP to 1: Downed. With a heal charge, the charge is spent and HP = 1 + heal; without one, Forced Retreat with cause `downed`.
5. A failed venture that brings HP to 1: same as 4. The pending discovery is recorded as `left behind (forced retreat)` only if one is still pending.
6. Rest from 1 HP resumes at the exact boundary: 80% HP at ⌈79 / rate⌉, with stress < 50 still required.
7. Chunk equivalence: 1-second, uneven and bulk processing through a Downed retreat and Base rest give identical results.
8. Invariant: HP ≥ 1 at every event and every chunk end over a 24 h multi-seed run, for all four policies.
9. No HP loss while in Forced Retreat or Base rest (TQ-FX1c).
10. The Downing hit's log line shows the attack's full damage, not HP lost.
11. Old save: a run saved mid-rest with `hp: 0` and `restStartHp: 0` loads and finishes rest normally, with no migration and no version change.

**Authorized test edit (the only one).** `sim-clock-rng` test 11: HP bound 0–100 → **1–100**, and its DH1 INFO note is removed. This tightens the test.

**Differential against the preserved build: allowed differences, declared in advance**
- After a Downed fight, HP and `restStartHp` are 1 instead of 0; Base rest is about 12 s shorter.
- Fights that end at exactly 1 HP, and policy hits or failed ventures that reach 1 HP, now Down: a heal charge is spent, or the run ends in a Forced Retreat.
- Later events in an affected run shift in time.
- **Any other difference is a stop condition.**

**Authorized test edit (Sam, Oct 10, after the FX1 stop):** `r1` check 28 gains a third scenario `{ far:false, heals:2, stress:20, load:116, seed:31 }` so a completed, banked withdrawal still occurs under U5. Its two original scenarios and its 1-s / uneven / bulk equivalence assertion are unchanged. Reason: under U5 the first scenario's survivor is Downed on the walk home (`handoff/to-design/FX1_STOP_REPORT.md`).

**Explicitly out.** Any change to `game/fort.js` or `screens-v3.jsx` (U25, U26); FX2, FX3, FX4, Q3, H2, Scenario B, R1 closure, `combat.js`, the separate hack-and-slash mode, heal or retreat tuning, a fix for the two-tab follower display, save keys, save version.

**Required verification**
- **V1:** all 15 suites plus the new suite; `r1` ×20 with a frozen clock and ×5 with a 5 ms delay. Checks 20 and 26 must be **checked, never edited**. U5 widens the trigger beyond Code's dry run, so if either check changes, stop and report.
- **V2:** `sim-clock-rng` ×5 with identical output.
- **V3, browser (TEST SAVE only; apply the standing precondition from the Oct 10 handoff §2 before any H1-or-later build runs in the real-game preview):** record the real-save fingerprint; in **one tab only**, reach a Downed state and confirm HP shows 1 and the log shows full damage; let Base rest run and confirm HP only rises. *Observation, not a pass condition:* if HP falls on screen with an empty log at any point, note the tab and frame count and raise a Design Handoff. Confirm the fingerprint is unchanged. R1 check 31 may run in the same session.
- **Closing line:** `FX1 HP FLOOR: CLOSED` or `NOT CLOSED`, with the differential summary.
