# CLOCK-01 — Browser system audit

**Updated:** Oct 25, 2026  
**Implementation status:** Browser prototype changes and automated checks complete. Overall batch remains **NOT CLOSED** pending a real-browser visual smoke check.  
**Scope:** Both browser pages. Server enforcement remains deferred, as agreed.  
**Decision source:** `CURRENT_BATCH.md` and `reference/clock-01-slice.md`.

## Confirmed implementation

- The shared game rate is **60,000 real milliseconds per game hour**. Existing clock records accrue up to the rate-change point at their saved rate, then continue at the selected rate.
- The calendar uses 364-day years and provides Year, Day, hour, and minute. Both HTML pages render the calendar and update the displayed clock every second.
- Hide advances 12 game hours and records up to two uses in a rolling 24-real-hour window. Each use expires 24 hours after its own timestamp.
- Make Camp advances to 06:00 on the next game day, records a successful use, and becomes available again after 24 real hours. Its existing camp effects remain. Injury treatment is separate and measured in real play minutes.
- Bootstrap establishes one browser absence window, capped at 24 real hours. Schedule, job, route, and Wandering catch-up use that window; the game calendar still reflects the full elapsed time. Unfinished job and route timers are shifted over the uncredited portion.
- New craft, build, route, and preparation durations are rescaled to preserve their prior real-time lengths. Elder Jester remains for 3–5 full game days, the agreed exception.
- Existing scout and other daily limits, real-time injury/decay/buff systems, and Wandering encounter pacing retain their prior rules.

## Verification evidence

- The CLOCK-01 focused checks cover calendar boundaries, saved-rate continuity, common offline-window behavior, rolling action limits, next-morning jumps, and selected duration conversions.
- The full regression run completed with **33 suites, 389 checks, and no failures**.
- `git diff --check` passes. Both HTML files contain the new calendar header and zero-padded HH:MM formatting.
- Automated coverage is not a substitute for the agreed browser visual check. No usable browser runtime is available in this Windows workspace: the repository harness points to a Linux Chromium installation and Linux-served file tree, while the connected Node runtime has no Playwright package. Therefore no rendered desktop/mobile screenshot or live-page console check has been claimed.

## Remaining closeout

Run the TEST SAVE page in a browser at desktop and phone widths. Confirm the header fits, Hide's two charges and next-refill label read correctly, Make Camp lands at 06:00 and disables for 24 hours, and the page has no console errors. Then record those observations in `CLOCK-01_COMPLETION_REPORT.md` and mark the batch closed if they pass.

The 24-hour offline window is browser-side only. Enforcing the same cap on the server is explicitly deferred to later server wiring.
