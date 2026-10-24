# CURRENT_BATCH — FX2: Per-return offline cap

**Source:** `reference/fx2-per-return-cap-slice.md` §7. If this file and the slice disagree, stop and ask.
**Status:** **CLOSED (Oct 10).** `FX2 RETURN CAP: CLOSED` — see `handoff/to-design/FX2_COMPLETION_REPORT.md`.
**Decisions:** Q2, U2 `[DECIDED Oct 10]`; P1 (no new saved field), P2 (save → load round-trip in check 4).
**Precondition:** FX1 CLOSED (Oct 10, `reference/archive/fx1-batch.md`). Standing precondition: the TEST SAVE fingerprint check before any real-game preview run (`DESIGN_HANDOFF.md` §2).
**Follow-on:** CB1 waits for `FX2 RETURN CAP: CLOSED` and Sam's lock of CB1.


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
