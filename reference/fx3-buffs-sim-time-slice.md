# Zed Idler — FX3 Buffs on Simulation Time (Slice Brief)

**Status:** **CLOSED Oct 10** (`FX3 BUFF TIME: CLOSED`; `handoff/to-design/FX3_COMPLETION_REPORT.md`; batch archived as `archive/fx3-batch.md`). Locked by Sam Oct 10, with D-FX3a = A. The rule (Q4) is `[DECIDED Oct 10]`. Step 1 read-only investigation done Oct 10 (§3a). 
**Inputs:** `h1-findings-decisions-oct10.md` Q4 · `sim-harness-v1-brief.md` §7 G1 · spec §9 "Simulation time for buffs" · the buff code read Oct 10 (`game/items.js` 320–360, `game/active.js` 461–467, `game/stats.js` 118–127, 203–254).
**Tags:** `[DECIDED]` Sam · `[PROPOSED]` draft · `[OPEN]` needs a fact or decision · `[CODE]` current build

---

## 1. Next slice

Timed buffs (from consumables: extra damage, armor, escape, XP per action) must be judged by the **game's simulated time**, the same clock the fights run on. Today, some of them are judged by the real clock, so during a catch-up after time away a buff can vanish before the simulation reaches the moments it should cover.

*Why now:* next in the queue after CB1. H2 runs 30 simulated days of catch-up; wrong buff timing would skew its results.

---

## 2. Decided constraint

**Q4 `[DECIDED Oct 10]`:** buff effects and expiry are evaluated at the simulation timestamp of the step being processed. A buff applies at every simulated moment before its expiry and stops when simulated time reaches it. Real-time cleanup never removes a buff that unprocessed steps still need. Durations, effects and stacking are unchanged.

---

## 3. What the code does today `[CODE]`

Buffs live in one store (`zi_active_buffs`); each has a start (`from`) and end (`until`), set from the game clock when the consumable is used.

| Reader | Clock it uses | Problem |
|---|---|---|
| `combatBuffsAt(t)` (damage, armor; `active.js:462`) | **Simulated time** `t` (B13) | Correct. But it reads the store *after* the cleanup below may have deleted entries |
| `getActiveBuffs()` (`items.js:323`) | **Current clock**, and it **deletes** every buff that has ended by now | **G1.** During a catch-up, "now" is ahead of the simulation. A short buff is deleted before the simulation reaches the steps it should cover |
| `activeEvadeBonus()` (escape chance and combat evasion) | Current clock, via `getActiveBuffs()` | Escape buffs apply by real time, not simulated time |
| `activeXpBonuses()` (XP per action, via `emitAction`) | Current clock, via `getActiveBuffs()` | XP buffs apply by real time, not simulated time |

The existing H1 test 4 works around G1 by using a buff that outlasts the run (its comment says so).


## 3a. Step 1 findings: every reader and writer (read-only, Oct 10) `[CODE]`

Searched every game file, screen file and HTML page, not only the likely files.

**TQ-FX3a: who touches the buff store (`zi_active_buffs`)**

| Where | What it does | Clock today | Change needed |
|---|---|---|---|
| `items.js` `getActiveBuffs()` | Reads, filters, **deletes** ended buffs | Real clock | Yes: use the step moment; stop deleting |
| `items.js` `addBuff()` | Creates a buff (`from`/`until` = now). Calls `getActiveBuffs()` first, so it also deletes | Real clock | Yes: must not drop buffs a catch-up still needs. Creation itself unchanged |
| `items.js` `activeEvadeBonus()` | Escape and combat evasion from buffs + gear | Via `getActiveBuffs()` | No code change; fixed through `getActiveBuffs()` |
| `items.js` `activeXpBonuses()` | Flat XP per action from buffs + gear | Via `getActiveBuffs()` | No code change; fixed through `getActiveBuffs()` |
| `active.js` `combatBuffsAt(t)` | Damage and armor | Simulated time, correct | None (it already applies the `from` rule) |
| `save.js` save slots | Copies the key with the rest of the save | n/a | None |
| `screens-v3.jsx` 1856–1862 | Calls `addBuff` when a consumable is used; keeps its own display timer | n/a | None (display is out of scope) |
| `uploads/game-data.js` | Old single-file copy of the game, used only as the reference in `split-equivalence` | Not loaded by the game | None |

No screen, Routes, Fort or Camp code reads the buff store directly.

**Who uses the buff readers**

- `escapeChance` and `survivorStatBlock` (stats.js): called only from the Wandering fight (`wandering.js` 318, 323). Covered by the step moment.
- `emitAction` (the XP bus, stats.js 123) is called from **three kinds of places** (TQ-FX3b):
  1. **Inside the Wandering simulation:** fights, escapes, checkpoints, policy prompts, heals, revives (wandering.js, active.js, combat.js). Covered by the step moment.
  2. **Live player actions:** Fort, Shop, contracts, repairs, screen buttons. These happen now, so the current clock is right.
  3. **Two other catch-ups:** **Jobs** (`jobs.js` `_settleJobs`: a craft, build, repair or recycle that finished while you were away) and **Routes** (`routes.js` `settleRouteRuns` → `completeRun`: a route run that finished while you were away). Each completion has its own finish time, but today the XP buff is checked at the real clock. **This is outside the expected files → D-FX3a.**
- The Schedule's offline XP (`camp.js` `emitScheduleTick`) calls `awardXp` directly, so XP buffs never applied to it. Unaffected.

**TQ-FX3c: can the step moment leak?** Yes if it isn't cleared: an error mid-step would leave every later live read on an old time. The batch requires it to be set and cleared inside `advance()` with `try/finally`.

**Tests affected**
- `split-equivalence` compares every function with the old single-file copy. `getActiveBuffs` and `addBuff` are already on its "changed" list. Any other function FX3 changes (for example `_settleJobs`, `completeRun`, a new cleanup function is fine since it's new) must be added → **authorized edit needed**.
- `sim-clock-rng` test 1 expects no active buffs after 72 h. Reading outside the simulation still filters by the current clock, so it still passes.
- `batch2b` B13 checks on `combatBuffsAt`: unchanged.

---

## 4. The fix `[PROPOSED]`

1. **One "now" for buffs.** While the Wandering simulation processes a step, buff readers use that step's simulated time. Outside the simulation they use the current game clock. *Proposed mechanism:* the simulation sets an ambient "simulation moment" (`ZI._simMoment`) while it runs a step and clears it after; `getActiveBuffs` and the evade/XP readers use it when set. That avoids changing every function signature between the simulation and the XP bus.
2. **Reading never deletes.** `getActiveBuffs()` only filters. Deleting moves to a separate cleanup that removes a buff only when it ended **before the earliest moment any catch-up may still process** (the Wandering run's simulated clock, and the earliest unfinished job and route finish; D-FX3a), never by the current clock alone. `addBuff` uses the same cleanup.
3. **Same start rule everywhere.** A buff counts only from its `from` (as `combatBuffsAt` already does), so a buff used now never applies to earlier steps being caught up.
4. Unchanged: how buffs are created (`addBuff`), durations, effects, the "same XP track refreshes instead of stacking" rule, the screen's own buff display.

Items 1–3 are **one fix, not alternatives.** Item 3 alone would not fix G1: buffs would still be deleted by the real clock before the catch-up reaches them.

TQ-FX3a–c are answered in §3a.

### 4.1 D-FX3a `[DECIDED Oct 10]`: A, Jobs and Routes catch-ups use each finish time

Jobs and Routes also catch up time while you're away and award XP through the same bus. Should an XP buff be judged at **each job's or run's finish time**?

| | Option | Effect |
|---|---|---|
| **A (chosen Oct 10)** | **Yes.** Jobs and Routes set the same step moment to each completion's finish time while they award its XP. Cleanup also waits until those catch-ups have passed a buff's end | One clock for every catch-up. A craft that finished while an XP buff was active gets it; a buff used now no longer boosts a craft that finished hours ago. Adds `jobs.js` and `routes.js` (a few lines each) and the `split-equivalence` edit |
| B | **No.** Only the Wandering simulation changes | Smaller batch, but Q4 holds only for Wandering. Jobs and Routes keep the real clock, and the limit must be written into H2's validity notes |

*Why A:* Q4 says "the step being processed", and a finished job is a processed step. Live play doesn't change (a job finishing now has finish time ≈ now). The practical effect is small (XP buffs last 60 s by default), which is also why the risk is low.


---

## 5. Parked and out

Buff balance and durations · new buff types · the screen's buff timer display · FX4 (shared survivor attributes) · H2.

---

## 6. Spec impact

None beyond what is recorded: spec §9 already states Q4. When FX3 closes, the batch proposal's FX3 row and the sim-harness brief's G1 entry are marked closed.

---

## 7. Proposed batch — draft `CURRENT_BATCH.md`

### BATCH FX3 — Buffs on simulation time

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

**Explicitly out.** Everything in §5; save keys or version.

**Required verification.** All suites; the new suite; `r1` checks 20 and 26 unedited; `sim-clock-rng` ×5 identical; differential against the pre-FX3 build. **Closing line:** `FX3 BUFF TIME: CLOSED` / `NOT CLOSED`.

---

## 8. Patterns used (for Sam)

- **One clock per question.** The bug exists because two parts of the game asked "is this buff active?" using two different clocks. The fix is to make every part ask the same clock: the one the simulation is on.
- **Search wider than the likely files.** The buff store had only the expected readers, but the XP bus it feeds is called from two other catch-up systems. Bugs about time often hide in "who else replays the past?"
- **Reading shouldn't delete.** A function that answers a question and also throws data away can destroy data another part still needs. Splitting "read" from "clean up" is a common fix for this class of bug.
