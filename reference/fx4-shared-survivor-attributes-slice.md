# Zed Idler — FX4 Shared Survivor Attributes (Slice Brief)

**Status:** **CLOSED Oct 13** (`FX4 SHARED ATTRIBUTES: CLOSED`; `handoff/to-design/FX4_COMPLETION_REPORT.md`; batch archived as `archive/fx4-batch.md`). Locked by Sam Oct 12 (drafted Oct 10). The rule (Q5) is `[DECIDED Oct 10]`. Step 1 read-only investigation done Oct 10 (§3). D-FX4a and D-FX4b `[DECIDED Oct 12]`, both A. 
**Inputs:** `h1-findings-decisions-oct10.md` Q5 · `sim-harness-v1-brief.md` §7 G2 (F5) · `gameplay-fix-batches-proposal.md` FX4, TQ5 · spec §9 "Shared survivor attributes" · the code read Oct 10 (`screens-v3.jsx` 1528–1566, 1650–1700, 1846–1870, 2027–2064; `game/wandering.js` 57, 319, 324, 367; `game/active.js` 300–330, 365–372, 440–450; `game/items.js` 274; `game/stats.js` 157).
**Tags:** `[DECIDED]` Sam · `[PROPOSED]` draft · `[OPEN]` needs a decision · `[CODE]` current build

---

## 1. Next slice

Two survivor numbers, **movement speed** and **heal strength**, must come from shared rule functions. The Wandering screen reads them and never writes them. A run that is never watched must get the same values as a watched one.

*Why now:* last of the fix train before JD1a and H2. H2 runs 80 headless runs that never mount the screen. Today a headless survivor always walks at a fixed 3 m/s, whatever their gear, Athletics or the pace the player chose. That would make H2's distance, escape and initiative numbers wrong.

---

## 2. Decided constraint

**Q5 `[DECIDED Oct 10]`:** `moveSpeed` and `healPct` are computed by shared rule functions. The Wandering screen reads them; it never writes them. Watched, offline and headless runs use the same calculation, with no balance change. Existing modifiers (equipment, buffs, stims, skills) are preserved.

---

## 3. What the code does today `[CODE]` (step 1, read-only, Oct 10)

Searched every game file, screen file and HTML page.

### 3.1 Movement speed

The **screen** computes it (`screens-v3.jsx:1566`) and writes it into the saved run (`syncWanderState`, lines 1658 and 1697):

> speed = **pace** × (gear speed ÷ 100) × (1 + speed buff % ÷ 100) × (stim ? 1.3 : 1)

| Input | Where it comes from | Saved? |
|---|---|---|
| **Pace** (Walk 3 · Jog 3 + 0.6 × A · Run 3 + 1.3 × A), where A = Athletics conditioning 3–10 from the effective Athletics level | A screen button (`moveMode`); resets to Walk every time the screen opens | **No** |
| Gear speed | `resolveLoadoutStats().speed` = 100 + gear `speedDelta`, clamped 10–100 (gear can only slow you) | Yes (loadout) |
| Speed buff (Adrenaline Shot, Scrap Adrenaline, Overclock Patch…) | `useConsumable` → **screen-only state** (`setBuffs speed`). Not in the shared buff store | **No** |
| Stim (× 1.3) | `stimUntil`: **never set anywhere**. Dead code | n/a |

**Who reads the saved `moveSpeed`** (all in the shared simulation):
- distance walked (`wandering.js:367`), with the overload slowdown applied on top (`active.js:304, 322–330`);
- **escape chance** (`wandering.js:319`, speed stat = speed ÷ 0.03, so 3 m/s → 100);
- **fight initiative** (`wandering.js:324` → `survivorStatBlock`).

**The problem (G2):** while unwatched, the simulation uses whatever the screen last wrote, frozen. Change gear, level Athletics, or let a speed buff run out after closing the screen: the offline survivor never notices. A save that never opened the screen walks at the default 3 m/s, ignoring slow gear. So pace, gear and buffs currently change escape and initiative **only for watched play**.

### 3.2 Heal strength

- The screen computes `HEAL_PCT` from the First Aid level **without rust** (`statLevel`) and writes it as `healPct` (lines 1535, 1658, 1697).
- **No game code reads `healPct`.** Every real heal already uses the shared rule `firstAidHealPercent(effectiveLevel('firstAid'))` **with rust** (`active.js:369–370` player heal, `active.js:446` simulation heal).
- So healing is already shared. The only fault: the screen writes a value nobody uses, and it's computed differently (no rust).

### 3.3 Found in passing (not in Q5)

- The **loot buff** (`lootPct`: Lucky Charm, Salvager's Oil) is also screen-only, so it never applies offline. Same kind of bug as the speed buff. It isn't a survivor attribute, so it's parked (§5) unless Sam wants it here.
- **Running has no cost today.** Run is strictly better than Walk (faster, and higher escape and initiative). That's a balance question, not FX4's. Parked.
- Twelve test files set `moveSpeed: 3` in their starting run; with no gear and Walk pace the rule also gives 3, so they should be unaffected.

---

## 4. The fix `[PROPOSED]`

1. **Shared rules.**
   - `ZI.survivorMoveSpeed(state)` = pace(mode, Athletics) × gear speed × speed buffs (read at the buff moment, FX3). The overload slowdown stays where it is, applied on top.
   - `ZI.survivorHealPct()` = `firstAidHealPercent(effectiveLevel('firstAid'))`, the formula the heals already use.
2. **The simulation calls the rule** wherever it reads `state.moveSpeed` today (distance, escape, initiative), at each step. It no longer trusts a stored speed.
3. **The screen reads the rules** for its display (speed label, heal %) and stops writing `moveSpeed` and `healPct`. The stored fields stay in old saves, unused (no migration).
4. **Pace is a player setting, not a computed value** (D-FX4a). The screen may write the *choice*; the rule computes the speed from it.
5. **Speed buffs go into the shared buff store** (D-FX4b) as `{ speedPct, durationSec }`, so FX3's timing rules apply to them.
6. Dead stim timer removed (it's never set, so no change).

### 4.1 Decisions for Sam

**D-FX4a `[DECIDED Oct 12]`: A — the pace when nobody is watching.** Pace (Walk / Jog / Run) is a button on the screen and isn't saved.

| | Option | Effect |
|---|---|---|
| **A (chosen Oct 12)** | **Save the chosen pace with the run.** Offline and headless use the same pace. The screen opens on the saved pace instead of resetting to Walk | Matches today's offline behavior (the survivor keeps going at the pace you left them on), but now gear, Athletics and buff changes count too. Adds one small saved field (`moveMode`, default Walk; old saves read as Walk) |
| B | Offline always walks | No new field, but anyone who left the survivor on Run loses speed, escape and initiative offline. That's a balance change, which Q5 rules out |

*Why A:* pace is a **choice**, like the policy. Q5 forbids the screen writing *computed results*, not the player's settings. Saving a setting is how the idle game honors "I set it and walked away."

**D-FX4b `[DECIDED Oct 12]`: A — speed consumables offline.** Sam: a speed buff lasts only its duration; if the player leaves mid-buff, the rest of it runs out offline on its normal timer, then stops.

| | Option | Effect |
|---|---|---|
| **A (chosen Oct 12)** | Speed buffs join the shared buff store (like damage, armor, escape and XP since B13 and FX3) | A shot used before closing the game keeps working for its duration offline. Watched and offline match |
| B | Keep them screen-only | Watched and offline differ, which Q5 forbids |

### 4.2 Declared differences (what will change)

- **Unwatched speed now follows the survivor's current gear, Athletics, pace and buffs** instead of the last value the screen wrote. Examples: a never-watched save wearing slowing gear moves slower; a speed buff runs out offline on time instead of lasting forever; leveling Athletics speeds up a Jog/Run survivor offline. Escape and initiative follow the same speed.
- **Watched play doesn't change**, except that the screen now opens on the saved pace (D-FX4a A) and the heal % label shows the First Aid level with rust, which is the value heals already use.

---

## 5. Parked and out

The loot buff offline (same fix pattern; candidate batch) · a cost for Jog/Run (balance) · heal amounts and pace numbers (unchanged) · overload rules · FX3 buff rules · the screen's other local state · JD1a, H2.

---

## 6. Spec impact

Spec §9 already states Q5. When FX4 closes:
- Spec §9 gets a line: "Pace (Walk/Jog/Run) is a saved player setting; speed is computed from it by rule."
- The batch proposal's FX4 row and the sim-harness brief's G2 entry are marked closed.

---

## 7. Proposed batch — draft `CURRENT_BATCH.md`

### BATCH FX4 — Shared survivor attributes

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

**Declared differences:** §4.2. Anything else is a stop condition.

**Explicitly out.** §5.

**Required verification.** All suites; the new suite; `r1` ×20 frozen, checks 20 and 26 unedited; `sim-clock-rng` ×5 identical; differential against the pre-FX4 build (no gear, Walk: identical); a browser check on the TEST SAVE page (pace button, speed label, heal label, the fingerprint unchanged). **Closing line:** `FX4 SHARED ATTRIBUTES: CLOSED` / `NOT CLOSED`.

---

## 8. Patterns used (for Sam)

- **Inputs, not outputs.** The screen may save what the *player chose* (pace), never what the *game computed* (speed). Store inputs and recompute outputs; a stored output goes stale the moment any input changes.
- **Single source of truth.** Heals were already right because both heal paths call one rule. The screen's own copy of the formula was the stale one (it skipped rust). Two copies of one formula drift apart.
