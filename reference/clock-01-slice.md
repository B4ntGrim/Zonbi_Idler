# CLOCK-01 — Continuous clock, calendar, Hide and Make camp (slice brief)

**Status:** **LOCKED Oct 24.** Decisions CL1–CL8 `[DECIDED Oct 23]`; O1–O6 `[DECIDED Oct 24]` (§3). The §6 batch was issued as `CURRENT_BATCH.md` on Oct 24.
**Date:** Oct 23
**Parent:** `trav-01-traversal-slice.md` (T3, T8, T9, T10, P5; CLOCK-01 row in §7).
**Code input:** `reports/clock-01/TIMER_SURVEY.md` (flags F1–F6) and `reports/clock-01/STEP2_SURVEY_CHECK.md` (A1–A3, Q1–Q3).

---

## 1. Next slice

Give the game one honest clock. The world keeps moving while the game is closed. The player sees the date and time. Hide and Make camp move the clock by clear, limited amounts. Offline time is credited fairly and with a cap.

**Why now:** the audit decided (D1, Oct 22) that CLOCK-01 comes before the simulation audit. Game-time costs mean little at 6 real seconds per game hour, so balance numbers measured today would be wrong after the change.

---

## 2. Decided constraints `[DECIDED Oct 23]` (Sam)

| # | Rule | Why |
|---|---|---|
| CL1 | **Continuous clock.** The game clock keeps running while the app is closed. A returning player sees the date and time moved forward for the time they were away | The world should not wait for the player. Returning to a later date is part of the idle fantasy |
| CL2 | **Calendar display: "Year X, Day Y, Time".** It shows game time elapsed since the player began. Total day 365 is Year 2, Day 1, so each game year has **364 days** | One readable date. Supersedes T3's "Year and Day only" by adding the time of day |
| CL3 | **Hide advances the clock 12 game hours.** Hide can be used again, but a **cap** stops a player from hiding forever. At most **2 uses in any rolling 24 real hours**; each use returns 24 hours after it is spent (O1, `[DECIDED Oct 24]`) | Hiding is a way to wait out danger, so it should cost real time in the world. The cap stops it from becoming a free fast-forward |
| CL4 | **Make camp advances the clock to 06:00 the following game morning.** This replaces the fixed skip (24 game hours in code today; a fixed 12-hour skip had also been proposed) | Camp means "sleep until morning". A fixed skip lands at random times of day; a morning start reads naturally |
| CL5 | **Make camp becomes available 24 real hours after its last successful use** (`[DECIDED Oct 24]`) | A rolling cooldown avoids early refills caused by local-midnight and timezone changes |
| CL6 | **Offline progression.** Measure the real time that passed, including time the app was closed. **Credit at most 24 real hours per absence** | Matches the existing per-return cap (FX2). Also settles survey flag F3: the camp schedule cap becomes 24 **real** hours, not 24 game hours |
| CL7 | **Test acceptance.** Every required check passes, with no crashes, no integer or calculation errors, and no visual problems. **The same progress played online and offline must differ by no more than 1 game minute** | Players must not gain or lose by closing the game. 1 game minute is the tolerance |
| CL8 | **Both HTML pages are in scope:** `Zombie Idler v2.html` and `Zombie Idler v2 - TEST SAVE.html` (O6, `[DECIDED Oct 24]`) | Both pages carry their own copy of some clock code (`craftRealSec`), so both must change together |

### Carried from TRAV-01 (still in force)

| # | Rule | Status |
|---|---|---|
| T8 | 1 game hour = 1 real minute (a game day is 24 real minutes; a 364-day year is about 6 real days) | `[DECIDED Oct 21]`; reconfirmed Oct 24 (O2). Code's 5-minute survey value is not used |
| T9 / P4 | Durations timed in game time keep their real length (crafting, builds and other timers are rescaled), unless Sam picks a new length. **Exception:** the Elder Jester remains for 3–5 full game days, even though the real wait grows to about 72–120 minutes at the new rate | General rule `[DECIDED Oct 21]`; Jester exception `[DECIDED Oct 24, Sam]`. Settles survey flag F6 |
| T10 | Curse runs 3 real days; scout charges refill once per real day at local midnight | `[DECIDED Oct 21]` |
| P5 | Real-time timers are labelled as real time beside their icon | `[DECIDED Oct 21]` (accepted with P1–P7) |
| Oct 16 | Skill decay stays on real days | `[DECIDED Oct 16]`. Settles survey flag F5: the "absence cap read as game days" wording is withdrawn |
| Oct 19 O6 | The injury timer is frozen while the game is closed (play time) | `[DECIDED Oct 19]`. Basis for O5 |

---

## 3. Decisions O1–O6 — LOCKED `[DECIDED Oct 24]` (Sam)

| # | Locked rule | Data-table value |
|---|---|---|
| O1 | **Hide cap: 2 uses in any rolling 24 real hours.** Each spent use returns 24 real hours after its own use. At the cap, Hide is greyed and shows when the next use returns (Sam chose 2 over the recommended 3) | `TRAV_HIDE_MAX_PER_24H = 2`; rolling use timestamps |
| O2 | **Clock rate stays T8:** 1 game hour = 1 real minute | `ZI.REAL_MS_PER_GAME_HOUR = 60000` |
| O3 | **Make camp always wakes at 06:00 of the next calendar day** (skip of 6 to 30 game hours) | `CAMP_WAKE_HOUR = 6` |
| O4 | **Calendar shows the full absence; all offline systems share one processing window of at most 24 real hours per absence.** This is a server-capacity limit; it does not require a player-facing message | `OFFLINE_CREDIT_CAP_REAL_HOURS = 24` |
| O5 | **Injury treatment subtracts play time** (real minutes), not game days | — |
| O6 | **Pages in scope:** `Zombie Idler v2.html` and `Zombie Idler v2 - TEST SAVE.html` | — |

*Why 2 Hides:* At most two uses fit in any rolling 24 real hours. Each advances 12 game hours. Hide can wait out a bad night while Make camp remains the way to reach the next morning.

### Original recommendations (kept for the record; superseded by the table above)

| # | Question | Director's recommendation `[PROPOSED]` | Why |
|---|---|---|---|
| O1 | **Hide cap.** How many Hides, and over what period? | **3 Hides per real day**, reset at local midnight like scouts and Make camp. Data-table value `TRAV_HIDE_MAX_PER_DAY = 3`. At the cap, Hide is greyed with the reason "No more hiding today. Resets at midnight." | Reuses the daily-reset pattern (no new rule to learn). 3 × 12 = 36 game hours a day at most, so a player can wait out a bad night but cannot skip days |
| O2 | **Clock rate.** T8 says 1 game hour = 1 real minute. Code's timer survey used 5 real minutes ("C1"), and its source is not in the project | **Keep T8 (1 real minute)** unless Sam changed it after Oct 21 | T8 is the only rate recorded as decided. All rescale numbers (T9) depend on this, so it must be locked first |
| O3 | **"The following morning" before dawn.** If the player makes camp at 02:00, do they wake at 06:00 the same calendar day (4 hours) or the next day (28 hours)? | **A: always 06:00 of the next calendar day** (skip of 6 to 30 game hours) | Matches "the following game morning" word for word. Option B (the next 06:00 after now) can skip as little as 1 minute and still use the once-a-day camp |
| O4 | **Calendar versus offline processing.** CL1 moves the calendar for the whole absence. All systems use the same CL6 window, capped at 24 real hours. After 3 real days away, the date moves 3 days' worth, but offline systems process only the first 24 hours | **Yes, keep them separate:** the calendar always shows true elapsed time; one shared offline processing window is capped at 24 real hours | This is an infrastructure limit, not a player-facing explanation |
| O5 | **Injury units (survey F2, check A1).** The injury timer counts real play time, but treatment subtracts **game days**. At the slower clock, one treatment wipes any injury | **Treatment subtracts play time** (real minutes), matching the Oct 19 O6 rule | One unit per timer. This is a live bug after the clock change, not a naming issue |
| O6 | **The two HTML pages.** CL8 leaves the names open | `[CODE]` The project has two: `Zombie Idler v2.html` and `Zombie Idler v2 - TEST SAVE.html` (the same pair as TRAV-01a). Confirm these are the two | Both hold their own `craftRealSec` (survey §5) |

### Implementation facts (`[CODE]`, from the survey and a check on Oct 23)

- **There is no live server clock in the prototype.** The game clock is saved in the browser (`zi_game_clock`, `game/core.js:53-80`) and computed from the device clock, so it already keeps running while closed. The C# server in `server/` is not connected to the prototype (`DEVELOPMENT_STATUS.md`). In this batch, "the server's game clock" means this saved clock. Making the server the authority belongs to the server-wiring work.
- Hide and Make camp both call `ZI.passTime` (`screens-v3.jsx:904,910`), which jumps the clock instantly. CL3 and CL4 keep this as a skip (settles survey flag F1).
- Changing the rate cannot jump the day: old clocks settle at their saved rate (`core.js:57-64`).
- The camp schedule offline cap is 24 **game** hours today (`camp.js:19,47`). CL6 changes it to 24 real hours.
- Wandering combat runs on real seconds (survey F4). This is expected and does not change in this batch.

---

## 4. Parked

- Server authority for the clock and daily resets, including server enforcement of the 24-real-hour offline-processing limit (later server-wiring work). Device-clock tampering was accepted for now (audit D4, Oct 22: revisit at mobile prep).
- Drifts (T19), which wait on the tier-band batch and this batch.
- Travel stamina (D2/T18) refill on Make camp: concept decided, numbers proposed; not part of this batch.
- Noise and zombie reaction to Hide and Make camp (PF13).

---

## 5. Spec impact (when CLOCK-01 closes)

- `trav-01-traversal-slice.md`: T3 superseded by CL2; P3 (Hide time) superseded by CL3; T15 extended by CL4–CL5; §7 CLOCK-01 row points here.
- `playtest-findings-oct15.md` PF7: time of day is now shown.
- `wandering-tab-spec.md` §9 / decay row (line 134): unchanged; the 24 h offline cap is already real time. Confirm the wording names real hours.
- `tutorial-first-session-spec.md` §Traversal step: Hide and Make camp descriptions should state their new effects.
- `CODE_STATE.md`: clock rate, calendar function, Hide and camp limits, new save keys.

---

## 6. Proposed batch (draft; becomes `CURRENT_BATCH.md` only after O1–O6 are locked)

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
6. **Offline credit (CL6).** For each absence, calculate one shared processing window of at most 24 **real** hours and use it for all offline systems: Wandering, camp schedule (change from 24 game hours), crafting and builds, and route runs. This is a server-capacity limit; it is not a player-facing explanation or status message. The calendar still advances for the whole absence (O4). Time beyond the window receives no offline progress, as in FX2.
7. **Rescale (T9).** Each duration stored in game time is scaled so its real length stays the same at the new rate. Code lists each one with its old and new value in the report.
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
10. `treatInjury(playMinutes)` removes exactly the supplied real play time, clamps at zero, and clears the injury only when its remaining time is used up. Make camp does not reduce or cure injury.
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

---

## 7. Lessons for this decision

- **Separate "what time is it" from the server's offline work budget.** The calendar records the full absence; every offline system uses the same processing window, capped at 24 real hours. This is an infrastructure constraint, not a player-facing explanation.
- **Two reset styles coexist during this batch.** Hide and Make camp use 24-hour rolling cooldowns; Traversal scouts and other existing daily limits retain their local-midnight rules. Keep each action's refill timing visible so players can tell them apart. `[DECIDED Oct 24]` Move the remaining daily limits to rolling 24-hour refills in a later batch; do not expand CLOCK-01 to include them.
- **Skips need caps.** Any button that jumps the clock is a fast-forward. Without a cap, it turns time-based systems (rest, crafting, events) into clicks.
