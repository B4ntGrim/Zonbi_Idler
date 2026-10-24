# Zed Idler — FX2 Per-Return Offline Cap (Slice Brief)

**Status:** **Locked by Sam, Oct 10**, with P1 and P2 accepted (§4.1). Q2 and U2 `[DECIDED Oct 10]`. **CLOSED Oct 10** (`FX2 RETURN CAP: CLOSED`; batch archived as `reference/archive/fx2-batch.md`; evidence in `handoff/to-design/FX2_COMPLETION_REPORT.md`).
**Inputs:** `h1-findings-decisions-oct10.md` Q2 · `gameplay-fix-batches-proposal.md` U2, TQ2 · the engine code read Oct 10 (`game/wandering.js` 249–298, 368–437).
**Tags:** `[DECIDED]` Sam · `[PROPOSED]` draft · `[OPEN]` needs a fact or decision · `[CODE]` current build

---

## 1. Next slice

Make the 24-hour offline cap hold **per return**, including time carried over from earlier processing. Time beyond the cap is discarded.

*Why now:* second in the fix train. H2's T2 test (72 h away processes no more than 24 h) fails until this closes (U3), and FX3's buff timing depends on settled carry behavior.

---

## 2. Decided constraints

| # | Rule | Why |
|---|---|---|
| **Q2** `[DECIDED Oct 10]` | One player return processes **at most 24 h** of gameplay time in total, including carried or unprocessed simulation time. Repeated processing within one return cannot exceed it | The cap protects the idle promise: a week away is worth one good day, never more. A cap that leaks through carried time isn't a cap |
| **U2** `[DECIDED Oct 10]` | Time beyond the cap is **discarded**, not saved for later | Saving it would let a player bank absences and drain them later, which is the leak in another form |

**Unchanged:** the cap value (24 h, `offlineCapSec` 86400); step size and the 200-steps-per-call limit; encounter and policy timing; rest rules; the per-skill decay cap (§3.2) and the Schedule settle cap, which have their own rules; save format and version.

---

## 3. What the code does today `[CODE]`

`WanderEngine._run` (`wandering.js:276`) runs every second while the game is open:

1. `dt = min(86400 s, now − lastTickAt)`. **The new absence is capped**, then `lastTickAt = now`.
2. `advance()` processes `dt + _carryMs` (`wandering.js:373`), at most **200 steps per call**.
3. Whatever is left goes back into `_carryMs` (`wandering.js:436`) for the next call.

**The leak (DH2):** the cap applies to `dt` only, never to `dt + _carryMs`. 24 h of catch-up takes many calls to process. If the player closes the game partway through and comes back later, the next return adds a fresh capped `dt` **on top of** the leftover carry. One return can then process up to 24 h + the leftover (up to 48 h). The H1 suite's test 10c already reads this as 48 h `[CODE]`.

---

## 4. The fix `[PROPOSED]`

**One invariant:** the time waiting to be processed (`dt + _carryMs`) **never exceeds 24 h.** Clamp the total at the top of `_run`, before `_simNow` is seeded, and drop the excess.

```js
// wandering.js, WanderEngine._run, replacing the dt / _simNow lines
const capMs   = ZI.WANDER_SIM_TABLE.offlineCapSec * 1000;
const newMs   = Math.max(0, now - s.lastTickAt);
const pending = Math.min(capMs, newMs + (s._carryMs || 0));   // Q2: one return ≤ 24 h, carry included
s._carryMs = pending - Math.min(pending, newMs);               // the backlog part of the pending time
const dt = Math.min(pending, newMs) / 1000;                   // the new part
s._simNow = now - pending;                                    // H1 A1a: seed the window actually run
```

*Sketch only.* Code chooses the final form in step 1. What is locked is the invariant and the observable checks.

**Why this is the smallest change:**
- **Normal play** (a tick every second): new time is 1 s, the backlog is small, the clamp never bites. Nothing changes.
- **First return after 72 h:** pending = 24 h. Same as today.
- **Second return during catch-up:** pending = min(24 h, new + leftover) = 24 h at most. **This is the fix.**
- **The 200-step limit stays.** Large catch-ups still spread over several calls; only the total is bounded.
- **`_simNow` is seeded from the clamped total**, so H1's clock contract (advance by consumed time) holds.

**Open fact for Code:**
- **TQ2a** Confirm the clamp needs no change in `advance()`, and that nothing else reads or writes `_carryMs` or `lastTickAt` (Routes, Schedule, the live screen). List anything found.
- **No new saved field (P1).** The discarded amount is not stored; tests compute it as elapsed − processed.

---

### 4.1 Points raised by Claude Design (Oct 10), with recommendations

| # | Point | Outcome | Why |
|---|---|---|---|
| P1 | `_discardedMs` would be a **new saved field** in the run object | **Accepted Oct 10: dropped.** FX2 saves no new field. Tests check discarded time from inputs (time away − time processed). If the return report ever shows "time beyond 24 h was lost", that UI batch adds the field | Don't add state nobody reads yet. Every saved field must survive every future save migration |
| P2 | Acceptance check 4 says "page reload", which a test can't do cleanly | **Accepted Oct 10: replaced** with a **save → load round-trip** mid-catch-up (`_snapshot` / `_restore`, the same path a real reload takes) | Same behavior, now observable in a test |

Both edits are applied in §4 and §7.

## 5. Parked and out

FX1 (must close first) · FX3 buffs, FX4 attributes · Q3 XP floor · decay and Schedule caps (their own rules) · a return-report line for discarded time · Reputation forgiveness at one day per load (G3, separate candidate) · H2.

---

## 6. Spec impact

None beyond what is already recorded: spec §9 "Cap offline effects" and §3.2 already state Q2 and U2 `[DECIDED Oct 10]`. When FX2 closes, the batch proposal's FX2 row is marked closed.

---

## 7. Proposed batch — draft `CURRENT_BATCH.md`

### BATCH FX2 — Per-return offline cap

**Goal.** No single return processes more than 24 h of Wandering time, carry included. Excess is discarded. No other change.

**Decided behavior** (`[DECIDED Oct 10]`)
1. At every engine run, new elapsed time plus carried time is clamped to `offlineCapSec` (24 h) before processing (Q2).
2. Time beyond the clamp is discarded and never processed later (U2). No new field is saved (P1).
3. `_simNow` is seeded from the clamped total (H1 A1a unchanged).
4. Watched play, normal background ticks and short absences behave exactly as today.

**Likely files.** `game/wandering.js` (`WanderEngine._run`) · new `tests/fx2-return-cap.test.js` · `tests/sim-clock-rng.test.js` (authorized edit only) · `CODE_STATE.md`.

**Steps.** 0 baseline (all suites, preserved build, file hashes) · 1 answer TQ2a; stop if another system shares `_carryMs` or `lastTickAt` · 2 implement · 3 tests and full regression.

**Acceptance checks** (new suite, all through the real `WanderEngine.tick` path, never by calling `advance()` directly)
1. **Ordinary 24 h return:** 24 h processed; result identical to the preserved build for the same seed.
2. **72 h away:** exactly 24 h processed (72 h away − 24 h processed = 48 h discarded, computed by the test).
3. **Consecutive absences:** away 24 h → process only part of it → away 10 h → total processed in the second return ≤ 24 h.
4. **Interrupted processing:** the same return processed in one go, in 200-step calls, and in calls interrupted by a **save → load round-trip** (`_snapshot` / `_restore`, the path a real reload takes; P2), give an identical end state.
5. **Large carry:** a save loaded with `_carryMs` = 30 h processes at most 24 h on its next return.
6. **Invariant:** across a 30-day multi-seed run with returns every 8 h and random interruptions, `dt + _carryMs` never exceeds 24 h at the start of any run, and total processed time ≤ real elapsed time.
7. **Watched play unchanged:** 1 h watched with 1-second beats is identical to the preserved build.
8. **Old saves:** a save with any `_carryMs` value loads with no migration and no version change.

**Authorized test edit (the only one).** `sim-clock-rng` test 10c: its INFO reading changes from 48 h to **≤ 24 h**, and it becomes a PASS check. This tightens the test.

**Differential, declared in advance.** Returns that previously processed more than 24 h (a leftover carry plus a new absence) now process 24 h; later events in those runs shift. **Any other difference is a stop condition.**

**Explicitly out.** Everything in §5; the 200-step limit; the cap value; the live screen; any new saved field; the save version.

**Required verification.** All suites plus the new suite; `r1` ×20 frozen clock (checks 20 and 26 checked, never edited); `sim-clock-rng` ×5 identical except the authorized 10c change. **Closing line:** `FX2 RETURN CAP: CLOSED` / `NOT CLOSED`, with the differential summary.

---

## 8. Patterns used (for Sam)

- **Clamp the total, not the part.** The bug existed because the cap was applied to one input (the new absence) instead of the quantity the rule is about (everything waiting to be processed). When a rule says "at most X", find the one number that must never exceed X, and clamp that.
- **Invariant tests.** Check 6 doesn't test one scenario; it checks a property across thousands of random returns. Invariants catch the cases nobody thought to write down.
