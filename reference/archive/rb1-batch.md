# BATCH RB1 — Retreat controls

**Status:** **CLOSED Oct 13** (`RB1 RETREAT CONTROLS: CLOSED`; `handoff/to-design/RB1_COMPLETION_REPORT.md`). Locked by Sam Oct 13 (RB1a–RB1d). Source: `reference/rb1-retreat-controls-slice.md` §6.


**Goal.** Run Back is the player's manual withdrawal under the shared retreat rules; the main-bar Retreat button is the retreat-policy control. No rule or number changes.

**Decided behavior** (`[DECIDED Oct 13]`, RB1a–RB1d)
1. Run Back performs the same withdrawal as today's Retreat press (walk to the last checkpoint, getaway roll, rest until the resume gate); it never teleports or clears an encounter.
2. The main-bar Retreat button shows the active retreat rule and opens the rules panel; the separate Retreat Rules button is removed.
3. Run Back keeps the saved pace (RB1d).
4. The distance bar is display only; checkpoints can't be clicked to travel (RB1c).

**Likely files.** `screens-v3.jsx` (the two buttons) · both HTML files (cache-buster) · new `tests/rb1-retreat-controls.test.js` · `CODE_STATE.md`. No `game/` file is expected to change.

**Steps.** 0 baseline · 1 done Oct 13 (callers: Run Back and the bar jump; Sam decided RB1c) · 2 implement · 3 tests, regression, browser check.

**Acceptance checks**
1. Static: Run Back's handler calls the shared withdrawal and no longer calls `setWanderScroll` or clears the encounter.
2. A Run Back press gives the same run state as a Retreat press did before (same seed): position, stress, getaway roll, rest.
3. A second Run Back press during the walk rolls the getaway, as before.
4. Pace is unchanged after Run Back.
5. The main-bar button text matches the current rules (each rule on/off and value), and shows withdrawal progress while withdrawing.
6. Static: only one retreat button remains in the main bar.
6b. Static: the distance bar's checkpoints have no click handler, and no screen code calls `setWanderScroll`.
7. Browser check (TEST SAVE): Run Back walks back with the distance counting down and rests at the checkpoint; the Retreat button opens the rules; fingerprint unchanged.

**Explicitly out.** Changing R1's rules or numbers; a manual "go to Base" action; other Run Back destinations; the More actions menu layout; R1 closure items.

**Required verification.** All suites; new suite; r1 ×20 frozen (checks unedited); differential (no gameplay change except Run Back); browser check. **Closing line:** `RB1 RETREAT CONTROLS: CLOSED` / `NOT CLOSED`.
