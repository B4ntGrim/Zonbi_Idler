# CLOCK-01 online/offline progress fix — October 25, 2026

The original focused cap tests passed without exercising actual subsystem grants together. The new comparison reproduced differences and now covers live one-second callbacks against an actual module/bootstrap reload after 1, 8 and 24 real hours, plus a 30-hour capped absence.

## Fixed causes

- Camp schedules did not run on the live background timer. They now settle while open, and retain fractional XP on each assignment so frequent ticks cannot change the total award.
- Route catch-up stopped after 50 repeats. It now resolves every completion due within the shared credited window, validates timer data and uses the installed gameplay clock. Routes also settle from the background timer, independent of the open screen.
- Wandering could not drain carried work at a fixed comparison endpoint. Saved carry now processes even when no additional real time has elapsed.
- Banked loot and route reports used the return time. Their timestamps now use the actual simulated extraction/completion moment.
- Bulk camp/job/route grants could give Wandering future skill levels. When Wandering overlaps other activities, startup replays the credited window in one-second chronological steps using the ordinary subsystem functions. Unfinished timers are shifted over discarded time once.
- Offline job and schedule grants retain their original decay behavior; offline crafting does not reset its skill's active-use clock. The existing injury visibility exception is preserved.

## Verification

`tests/clock-01-equivalence.test.js` exercises real camp grants, craft/build queue promotion and unfinished jobs, repeating route resolution and unclaimed rewards, and seeded Wandering combat, HP, stress, inventory, charges and XP. It tests each activity separately and all activities together. Calendar and progress agree for 1, 8 and 24 hours. A 30-hour joint reload advances the calendar for 30 hours and grants exactly 24 hours of gameplay progress. The suite contains 33 passing checks.

`tests/load-regressions.test.js` also verifies that a craft overlapping Wandering grants XP during catch-up without resetting its offline decay clock. Compatibility expectations explicitly account for CLOCK-01's rescaled route/build tables and fractional schedule credit.

Run all suites on Windows or Linux with `node tools/run-tests.cjs`. The final run passed **775 checks across 34 suites, zero failures**, including all 33 comparison checks and the offline decay regression. Final output is retained in `reports/clock-01/regression-final.log`. `git diff --check` also passes.

All comparisons use isolated synthetic storage. No real save was opened or modified. These are headless gameplay checks; desktop/phone layout, live browser console and device-timezone visual checks remain pending. Joint replay is synchronous and bounded to 24 real hours; browser performance on a large real save has not been measured. Biome generation remains deferred.
