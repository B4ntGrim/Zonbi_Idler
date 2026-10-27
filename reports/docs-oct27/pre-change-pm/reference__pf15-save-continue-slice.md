# PF15 — Continue keeps progress, autosave (slice brief)

**Status:** Decisions `[DECIDED Oct 26, Sam]`. Draft batch below; **not yet issued** as `CURRENT_BATCH.md`. CLOCK-01 is still the active batch (NOT CLOSED: manual browser checks pending).

## 1. Next slice
Fix the critical defect PF15 (`playtest-findings-oct15.md`): the save-files screen's Continue calls `ZI.loadSlot`, which replaces live progress with the slot's creation-time snapshot (no autosave). Every playtest is unreliable until this is fixed.

## 2. Decided constraints
| # | Rule | Why |
|---|---|---|
| S1 | Continue on the **active** file resumes the live `zi_*` keys; loading a **different** file still restores that file | Continue must never discard progress |
| S2 | Autosave the active slot every **60 s** (starting value, data table) and on `visibilitychange` (hidden) and `pagehide` | Closing the tab must not lose progress |
| S3 | Regression test: close → reopen → Continue preserves every `zi_*` key except those offline catch-up legitimately changes; catch-up runs with the 24 h cap | Proves the fix and guards it |

## 3. Open decisions
- `[OPEN]` **Order with CLOCK-01:** pause CLOCK-01's remaining manual checks and ship PF15 first, or close CLOCK-01 first. Recommendation: PF15 first; CLOCK-01's remaining checks are manual browser checks that need a reliable save.
- `[CODE]` Step 1 confirms the cause and lists files before any change.

## 4. Parked / out
Server-side saves; cloud sync; changes to the TEST SAVE shim; any gameplay change.

## 5. Proposed batch (draft `CURRENT_BATCH.md`)

### BATCH PF15 — Continue keeps progress

**Goal.** Reopening the game and pressing Continue resumes exactly where the player left off, then runs offline catch-up.

**Decided behavior.** S1–S3 above.

**Likely files.** `game/save.js` (`loadSlot`, `_writeSlot`, new autosave), `Zombie Idler v2.html` (save-files screen Continue, autosave wiring), `Zombie Idler v2 - TEST SAVE.html` (regenerate), new `tests/pf15-continue.test.js`, `CODE_STATE.md`.

**Step 1 (read-only).** Confirm the cause: Continue → `loadSlot` → `_restore(snapshot)`; snapshots written only at creation and manual Save. Report in `reports/pf15/PF15_STEP1_REPORT.md`. Stop if the cause differs.

**Acceptance checks.**
1. Active file: play, close without pressing Save, reopen, Continue → every `zi_*` key matches the pre-close fingerprint except catch-up keys (clock, run progress, timers that settle).
2. Catch-up runs on that Continue (offline window, 24 h cap); the return report shows.
3. Loading a **different** file restores that file's snapshot (unchanged behaviour).
4. Autosave writes the active slot within 60 s of a change, and on page hide/unload.
5. New file: tutorial, starter kit and charges as before (no regression to JD1a).
6. No console errors in either page; all existing suites pass.

**Explicitly out.** CLOCK-01 changes; server saves; gameplay changes.

**Required verification.** Step 1 report; completion report `reports/pf15/PF15_COMPLETION_REPORT.md`; `PF15: CLOSED` or `NOT CLOSED`.
