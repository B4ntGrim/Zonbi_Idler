# CURRENT_BATCH — CLOCK-01: Continuous clock and calendar

**Source:** `reference/clock-01-slice.md`. If this file and the slice disagree, stop and ask.
**Status:** **LOCKED by Sam (Oct 24).** Issued to Code as `CURRENT_BATCH.md`.

**Goal.** One clock that keeps running while the game is closed, shows Year, Day and time, and moves by clear, limited amounts when the player hides or makes camp.

## Decided behavior

1. **Rate.** `ZI.REAL_MS_PER_GAME_HOUR = 60000` (O2, T8). Old clocks settle at their saved rate (no jump).
2. **Continuous clock (CL1).** On load, the clock shows the full real time away, converted at the current rate.
3. **Calendar (CL2).** New `ZI.getCalendar()` returns `{ year, day, hh, mm }` from total game seconds: `totalDay = floor(t / 86400) + 1`; `year = floor((totalDay - 1) / 364) + 1`; `day = ((totalDay - 1) mod 364) + 1`. The header in both pages shows "Year X, Day Y, HH:MM". Integer maths only.
4. **Hide (CL3).** `TRAVERSAL_TABLE.hideGameHours = 12`. At most **2 uses in any rolling 24 real hours** (`TRAV_HIDE_MAX_PER_24H = 2`, O1). Each use becomes available again 24 real hours after its own use; at the cap, the button is greyed and shows when the next use returns. The Hide cost label shows "12 game hours".
5. **Make camp (CL4–CL5).** Moves the clock to 06:00 of the **next calendar day** (O3), from any time of day. It becomes available 24 real hours after its last successful use; at the cap, the button is greyed and shows when it is available again. Timezone changes and local midnight do not refill it early. Everything else Make camp does today stays (camp cell, saved-return clearing, Command XP once per local calendar day).
6. **Offline credit (CL6).** For each absence, calculate one shared processing window of at most 24 **real** hours and use it for all offline systems: Wandering, camp schedule, crafting and builds, and route runs. This is a server-capacity limit; it is not a player-facing explanation or status message. The calendar still advances for the full absence (O4). Time beyond the window receives no offline progress, as in FX2.
7. **Rescale (T9).** Each duration stored in game time is scaled so its real length stays the same at the new rate, **except the Elder Jester's stay**, which remains 3–5 full game days. At the new rate that stay lasts about 72–120 real minutes. Code lists each affected duration with its old and new value in the report.
8. **Injury treatment (O5).** `treatInjury(playMinutes)` subtracts the supplied real play minutes, not game days; clamp at zero and clear the injury when exhausted. Remove the dead legacy injury functions in `stats.js`. Make camp does not call `treatInjury` or treat injuries.
9. **Stale comments (A2).** Update the hard-coded "6 real seconds" / "2.4 real minutes" comments.

## Likely files

`game/core.js` (rate, calendar, passTime) · `game/stats.js` (`TRAVERSAL_TABLE`, rolling Hide timestamps, camp cooldown timestamp, dead injury copies) · `game/camp.js` (offline cap) · `game/active.js` (injury treatment, Jester stay) · `game/routes.js` · `game/crafting.js` (only if rescaling recipe data) · `screens-v2.jsx` (header) · `screens-v3.jsx` (Hide, Make camp and cooldowns) · both HTML pages (`craftRealSec`, header) · new save data for Hide uses and last successful camp time · new `tests/clock-01.test.js` · `CODE_STATE.md`.

## Acceptance checks (new suite `tests/clock-01.test.js`)

1. Calendar: total day 1 → Year 1, Day 1; 364 → Year 1, Day 364; 365 → Year 2, Day 1; 728 → Year 2, Day 364; 729 → Year 3, Day 1. Time shows HH:MM with leading zeros.
2. Both pages show "Year X, Day Y, HH:MM" in the header. No layout break at phone width or desktop width.
3. Closing the game for 1, 8 and 24 real hours moves the calendar by exactly that time at the current rate (± 1 game minute). Closing it for 30 real hours moves the calendar 30 hours' worth (O4) but credits only 24 hours of progress.
4. **Online/offline equivalence (CL7).** From the same seeded save, run 1, 8 and 24 real hours online and offline. Game clock, Wandering results, camp schedule, crafting and route progress differ by no more than 1 game minute.
5. Hide moves the clock exactly 12 game hours; a second Hide works; a third is refused; at the cap the button shows when the next use returns; each use returns exactly 24 real hours after it was spent, independent of local midnight or timezone.
6. Make camp lands at exactly 06:00 of the next calendar day (O3) from 00:00, 05:59, 06:00, 12:00 and 23:59.
7. Make camp becomes available exactly 24 real hours after its last successful use; earlier attempts are greyed with the remaining cooldown; crossing local midnight or changing timezone does not refill it.
8. Hide and Make camp cooldowns use elapsed real time and are unaffected by device timezone changes.
9. An old save (6-second rate) loads without jumping the day.
10. Injury treatment removes play time, not game days; a treatment never wipes an injury in one step unless its play time is used up.
11. No `NaN`, negative or non-integer values in the saved clock; no console errors in either page.
12. **Regression:** all existing suites pass.

## Smoke test (Sam, TEST SAVE)

1. Note the Year, Day and time. Close the game for about an hour. Reopen: the time moved forward about an hour's worth.
2. Hide twice; confirm the clock moves 12 game hours each time and the button greys out at the cap.
3. Make camp; confirm you wake at 06:00. Try again; confirm it is greyed until midnight.
4. Check the header at phone width.

## Explicitly out

Server authority for the clock · Drifts (T19) · Travel stamina (T18) · TRAV-01b familiarity and camp rest · noise and zombie reaction (PF13) · Wandering combat pacing (F4) · any change to skill decay (stays on real days).

## Required verification

Step 1 report (read-only: confirm every rescaled duration and its old/new real length) in `reports/clock-01/CLOCK-01_STEP1_REPORT.md` · completion report with each check's result in `reports/clock-01/CLOCK-01_COMPLETION_REPORT.md` · `CLOCK-01: CLOSED` or `NOT CLOSED`.
