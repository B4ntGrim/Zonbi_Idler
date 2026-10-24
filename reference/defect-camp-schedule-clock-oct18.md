# Defect candidate DC-1: camp schedule accrues game hours from the wall clock (Oct 18)

**Status:** logged for a separate fix (Sam, Oct 18). Not fixed in the BALANCE-03 slice. No code changed.

## Summary
Since the Oct 16 clock unification, camp schedule jobs credit **game hours** from the wall clock: `elapsed real ms ÷ REAL_MS_PER_GAME_HOUR (6,000)`. Each settle is capped at **24 game hours** (`SCHEDULE_OFFLINE_CAP_H = 24`).
- **While the page is open**, frequent settles each stay under the cap, so jobs accrue about **600 game hours per real hour**.
- **After an absence of any length**, one settle credits at most **24 game hours** (4 real minutes' worth).
- Online accrual per real hour is therefore about 25× an entire offline absence, and offline reward does not grow with time away.

**Code:**
- `camp.js:44–51` `ZI.settleSchedule`: `elapsedH = min(SCHEDULE_OFFLINE_CAP_H, (Date.now() − lastTick) / REAL_MS_PER_GAME_HOUR)`;
- `camp.js:19` (cap);
- `core.js:50` (`REAL_MS_PER_GAME_HOUR = 6000`).

**Also:** it reads `Date.now()` rather than the game clock (`ZI.clockNow()`), against the H1 one-clock rule.

## Reproduction (harness, read-only)
**Setup:** new survival save, roster survivor `sv_mason` assigned to Scavenge Detail (35 Scavenging XP per game hour).
- Script: `repro-schedule-clock.js` (workspace).
- It uses the H2 `pageLoad` with a controllable clock.

| Case | Real time | Scavenging XP gained | Game hours credited |
|---|---|---|---|
| Online: settle every 1 real second | 60 min | **21,600** | about 617 |
| Offline: one settle after 1 real hour | 60 min | **840** | 24.0 |
| Offline: one settle after 8 real hours | 480 min | **840** | 24.0 |

(617 rather than 600 reflects the job's attribute XP share and per-tick rounding.)

## Expected
One rule for online and offline accrual, as other systems have:
- Wandering: real time, 24 h per-return cap (FX2);
- skill decay: real days.

## Scope note
Affects every camp schedule job's XP (guard, workshop, garage, infirmary, farm, scavenge, recon, radio). The proposed material job (BALANCE-03 idle source) avoids it by using a real-hour yield. The fix itself is a separate batch.
