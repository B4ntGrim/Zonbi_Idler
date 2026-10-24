# BATCH FX4 — Shared survivor attributes

**Status:** **CLOSED Oct 13** (`FX4 SHARED ATTRIBUTES: CLOSED`; `handoff/to-design/FX4_COMPLETION_REPORT.md`). Locked by Sam Oct 12 (D-FX4a = A, D-FX4b = A); extra authorized test edit: `split-equivalence` `ADDED` + `SurvivorRules`. Source: `reference/fx4-shared-survivor-attributes-slice.md` §7; step 1 findings in its §3.


**Goal.** Movement speed and heal strength come from shared rule functions that watched, offline and headless play all use. The screen reads them and never writes them. No other change.

**Decided behavior** (`[DECIDED Oct 10]` Q5; `[DECIDED Oct 12]` D-FX4a, D-FX4b)
1. Movement speed = pace × gear speed × speed buffs, computed by one shared rule at each simulation step; the overload slowdown is applied on top as today. Distance, escape and initiative use it.
2. Heal strength = `firstAidHealPercent(effective First Aid level)`, one shared rule (already what heals use).
3. The Wandering screen displays both from the rules and writes neither.
4. Pace is a saved player setting (default Walk); the screen opens on it (D-FX4a).
5. Speed consumables are stored in the shared buff store and follow FX3's timing rules: they apply for exactly their duration, watched or offline, then stop (D-FX4b).
6. Formulas and numbers are unchanged.

**Likely files.** `game/wandering.js` (the rule calls; the `moveMode` default) · `game/active.js` (overload movement reads the rule) · `game/stats.js` or `game/items.js` (the two rule functions; Code picks one and says why) · `screens-v3.jsx` (read the rules; save the pace choice; speed buffs via `addBuff`; stop writing `moveSpeed`/`healPct`; remove the dead stim timer) · both HTML files (cache-buster only) · new `tests/fx4-shared-attributes.test.js` · `CODE_STATE.md`.

**Steps.** 0 baseline · 1 done (§3); re-confirm nothing changed, and stop if a reader of `moveSpeed` or `healPct` outside the likely files appears · 2 implement · 3 tests, full regression, browser check.

**Acceptance checks**
1. **G2 criterion:** the same save run headless (screen never mounted) and watched gives the same speed at every step, and the same distance, escapes and fight results for the same seed.
2. New save, no gear, Walk: speed 3 (unchanged from today).
3. Equipment change while unwatched (slowing gear on, then off): offline speed follows within the next step.
4. Athletics level change while unwatched: Jog and Run speed follow; Walk stays 3 × gear.
5. Speed buff used, then the player leaves: offline speed is raised for exactly the buff's duration (FX3 rule), then drops.
6. Pace saved: set Run, close, reload; offline and the reopened screen both use Run.
7. Overload slowdown still applies on top, unchanged.
8. Heals heal exactly what they do today; the screen's heal % equals the rule's value.
9. Old saves (with stored `moveSpeed`/`healPct`, without `moveMode`) load with no migration; pace reads as Walk.
10. Static check: no screen code writes `moveSpeed` or `healPct` into the run.

**Authorized test edits:** none expected. If a suite relies on the stored `moveSpeed` value, Code stops and lists it.

**Declared differences:** unwatched speed now follows the survivor's current gear, Athletics, pace and buffs instead of the last value the screen wrote (escape and initiative follow the same speed). Watched play is unchanged except that the screen opens on the saved pace and the heal % label includes rust. Anything else is a stop condition.

**Explicitly out.** The loot buff offline; a cost for Jog/Run; heal amounts and pace numbers; overload rules; FX3 buff rules; the screen's other local state; JD1a; H2.

**Required verification.** All suites; the new suite; `r1` ×20 frozen, checks 20 and 26 unedited; `sim-clock-rng` ×5 identical; differential against the pre-FX4 build (no gear, Walk: identical); a browser check on the TEST SAVE page (pace button, speed label, heal label, the fingerprint unchanged). **Closing line:** `FX4 SHARED ATTRIBUTES: CLOSED` / `NOT CLOSED`.
