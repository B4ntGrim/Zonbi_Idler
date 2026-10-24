# BATCH FX3 — Buffs on simulation time

**Status:** **CLOSED Oct 10** (`FX3 BUFF TIME: CLOSED`; `handoff/to-design/FX3_COMPLETION_REPORT.md`). Locked by Sam Oct 10 (D-FX3a = A); extra authorized test edit: `split-equivalence` `ADDED` + 3 names. Source: `reference/fx3-buffs-sim-time-slice.md` §7. Step 1 findings: that brief §3a.


**Goal.** Every buff effect is evaluated at the simulated moment of the step being processed, and no buff is deleted while unprocessed steps still need it. No other change.

**Decided behavior** (`[DECIDED Oct 10]`, Q4 and D-FX3a)
1. Damage, armor, escape and XP buffs all apply at a step if and only if `from ≤ step time < until`.
2. During simulation, "step time" is the simulated time; outside it, the current game clock.
3. Reading buffs never deletes them. Cleanup removes only buffs that ended before every catch-up has passed them.
4. Durations, effects, creation and stacking are unchanged.
5. (D-FX3a) Jobs and Routes completions processed in a catch-up are judged at their own finish time.

**Likely files.** `game/items.js` (`getActiveBuffs`, `addBuff`, new cleanup) · `game/wandering.js` (set and clear the step moment in `advance()`, `try/finally`; cleanup at the end of `_run`) · `game/jobs.js` (`_settleJobs`) and `game/routes.js` (`settleRouteRuns`) · new `tests/fx3-buffs-sim-time.test.js` · `tests/split-equivalence.test.js` (authorized edit only) · `CODE_STATE.md`. `combat.js`, `stats.js`, `active.js` and the screens are not expected to change.

**Steps.** 0 baseline · 1 done (§3a); re-confirm nothing changed since Oct 10, and stop if any reader or writer outside the likely files needs changing · 2 implement · 3 tests and full regression.

**Acceptance checks**
1. **G1 criterion:** a buff from t to t+d applies on every simulated step in [t, t+d) and on none from t+d, for 1-s, uneven and bulk processing, watched or offline.
2. **The G1 bug:** a 40-s buff used just before the player leaves, then a 2-hour absence: on return the catch-up applies the buff for exactly its 40 simulated seconds (today: zero).
3. Expiry exactly on a step boundary: the step at t+d is unbuffed.
4. Escape buff and XP buff follow the same rule as the damage buff (each checked at its boundary).
5. Long absence (72 h, FX2 cap) and carried time: identical buff windows to an uninterrupted run.
6. Cleanup: a buff still needed by unprocessed steps survives every read and every tick; a buff that ended before the simulation clock is removed.
7. A buff used during the catch-up (live) never applies to earlier steps.
8. XP-track refresh (no stacking) and durations unchanged.
9. Old saves with buffs in `zi_active_buffs` load and behave by these rules.
10. An error thrown mid-step leaves no step moment behind (the next live read uses the current clock).
11. (D-FX3a) A job and a route run that finish during an absence get an XP buff only if it was active at their finish time; a buff used after returning doesn't apply to them.

**Authorized test edits (only these):** `sim-clock-rng` test 4's comment about G1 may be updated to say G1 is fixed; its checks stay as they are. `split-equivalence` `CHANGED_FN` may add the names of functions FX3 changes, each with an `// FX3` note.

**Declared differences:** runs where a buff was active during a catch-up now apply it for its full simulated window; Jobs and Routes XP from a catch-up follows the finish time. Nothing else may change.

**Explicitly out.** Buff balance and durations; new buff types; the screen's buff timer display; FX4; H2; save keys or version.

**Required verification.** All suites; the new suite; `r1` checks 20 and 26 unedited; `sim-clock-rng` ×5 identical; differential against the pre-FX3 build. **Closing line:** `FX3 BUFF TIME: CLOSED` / `NOT CLOSED`.
