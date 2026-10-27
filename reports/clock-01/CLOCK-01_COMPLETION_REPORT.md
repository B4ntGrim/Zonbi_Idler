# CLOCK-01 — Completion report

**Date:** Oct 25, 2026  
**Status:** **CLOSED for PC deployment** — automated checks and reported desktop browser checks are complete. Phone-width layout is deferred by Sam until full PC deployment is finished.  
**Scope:** Browser prototype only. Server enforcement is deferred.

## Acceptance results

| Check | Result | Evidence / note |
|---|---|---|
| 1. 364-day calendar boundaries and padded time fields | PASS | `tests/clock-01-calendar.test.js` covers days 1, 364, 365, 728, 729 and 08:07. |
| 2. Both HTML pages render Year, Day, and HH:MM | PASS (PC) | Both HTML pages use the updated top bar. Sam confirmed the TEST SAVE desktop header displays the digital clock beside Year/Day and replaces Threat. Phone-width layout is deferred until full PC deployment is finished. |
| 3. Full calendar absence and capped offline processing | PASS | `tests/clock-01-offline.test.js` confirms one shared 24-real-hour window and six-hour discarded portion for a 30-hour absence. |
| 4. Online/offline equivalence within one game minute | PASS | `tests/clock-01-equivalence.test.js`: actual seeded gameplay after 1, 8 and 24 real hours, isolated activities and all activities together. Also verifies a 30-hour absence grants only 24 hours of progress. See `CLOCK-01_PARITY_FIX_REPORT.md`. |
| 5. Hide's two uses and per-use 24-hour refill | PASS | `tests/clock-01-limits.test.js` verifies two uses, rejection of a third, and staged refill. Sam reports Hide advances time; the second Hide in the same cell did not grant Stealth XP again. |
| 6. Make Camp reaches 06:00 next day from specified times | PASS | Focused test covers 00:00, 05:59, 06:00, 12:00, and 23:59. Sam confirms the browser time jump passed. |
| 7. Make Camp's 24-hour cooldown | PASS | Focused test checks refusal before expiry and availability at expiry. Sam confirms the cooldown initiated in the browser. |
| 8. Cooldowns independent of timezone | PASS | Sam emulated a different browser timezone. Zone and offset changed; Camp `availableAt` stayed the same and remaining cooldown changed only by elapsed real time. |
| 9. Old save retains time at its saved rate before switching | PASS | Calendar test checks saved-rate accrual and current-rate persistence. |
| 10. Injury treatment uses play minutes; camp does not treat | PASS | Updated implementation and regression coverage confirm treatment is separate from Make Camp. |
| 11. No invalid clock values or browser console errors | PASS | Automated calendar cases passed. Sam reports no browser console errors during the desktop closeout checks. |
| 12. Full regression | PASS | 34 suites, 775 checks, zero failures, including the 33 real online/offline comparison checks. `git diff --check` passes. Full output: `reports/clock-01/regression-final.log`. |

## Browser smoke check

**Desktop checks reported by Sam (Oct 26):** the Year/Day header uses a digital clock instead of Threat; Hide advances time; a second Hide in the same cell does not award Stealth XP again; Make Camp advances to the expected time and starts its cooldown; the browser console has no errors. A timezone-emulation check confirmed Camp cooldown availability is independent of local timezone. Phone-width layout is explicitly deferred until full PC deployment is finished.

**Automated browser harness limitation:** the repository's harness expects Linux-specific paths (`/opt/...`, `/home/claude/...`) unavailable from this Windows workspace. The connected Node runtime also has no Playwright package.

## Closeout decision

**CLOCK-01: CLOSED for PC deployment.** All automated checks and desktop checks reported by Sam are recorded above. Phone-width layout is deferred by approval until full PC deployment is finished. Keep server-side enforcement out of this batch.

