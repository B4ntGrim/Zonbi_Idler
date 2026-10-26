# CLOCK-01 — Step 1: timer and duration audit

**Date:** Oct 24, 2026  
**Status:** Read-only timer survey. Follow-up implementation and verification are tracked in `CLOCK-01_SYSTEM_AUDIT.md`.
**Authority:** Locked rules in `CURRENT_BATCH.md` and `reference/clock-01-slice.md` supersede conflicting rate assumptions in the Oct 23 timer survey.

## Findings

The browser prototype already computes its saved world clock from wall time, so it advances while the page is closed. CLOCK-01 changes the rate and calendar, then makes each offline system consume no more than one shared 24-real-hour processing window per absence. The calendar continues to use the full elapsed absence.

The current rate is 6,000 real milliseconds per game hour. The locked rate is 60,000 milliseconds per game hour: a **10×** slowdown. The Oct 23 survey's “5 real minutes per game hour” and “50×” calculations are superseded and must not guide rescaling.

At the current rate, one game day takes 2.4 real minutes. At the locked rate, it takes 24 real minutes. A 364-day game year therefore takes about 14.6 real hours today and about 6.1 real days at the locked rate. One real hour away advances the game calendar by 60 game hours; 24 real hours advances it by 60 game days. For a 30-hour absence, the calendar advances by 75 game days while offline systems process only the first 24 real hours, or 60 game days' worth at the locked rate.

## Timers affected by the rate change

| System | Current timing | At locked rate if data stays as-is | To preserve current real duration |
|---|---|---|---|
| World clock and calendar | 1 game hour / 6 real seconds; 1 game day / 2.4 real minutes | 1 game hour / 60 real seconds; 1 game day / 24 real minutes | Intentionally changes; the slower world clock is the feature. Old saves first settle at their saved rate so the rate change does not jump their date. |
| Craft recipes (35) | Game-second recipe values convert through the shared rate; shortest 0.3 seconds, median 13.5 seconds, longest 4.8 minutes | Shortest 3 seconds, median 2 minutes 15 seconds, longest 48 minutes | Divide stored game-second recipe times by 10. Existing queued jobs store real durations and keep their scheduled finish. |
| Camp builds (65) | Game-second build values convert through the shared rate; shortest about 0.2 seconds, longest 1 minute | Shortest about 2 seconds, longest 10 minutes | Divide stored game-second build times by 10. Existing queued jobs store real durations and keep their scheduled finish. |
| Route runs | Route and preparation durations are expressed in game hours and converted to milliseconds at run start | New runs take 10× as long | Divide the game-hour duration used for new runs by 10, including prepared-run duration. In-flight runs store milliseconds and keep their existing finish time. |
| Elder Jester stay | 3–5 game days, about 7.2–12 real minutes | 3–5 game days, about 72–120 real minutes | **Sam's Oct 24 decision:** preserve 3–5 full game days. This is the deliberate exception to T9; the longer real-time wait is intended. Existing `stayDays` save values already represent this duration. |
| Camp schedule catch-up | Capped at 24 game hours, equal to 2.4 real minutes at today's rate | 24 game hours equal 24 real minutes | Replace the per-schedule game-hour cap with the shared 24-real-hour absence window. |
| Wandering catch-up | Already capped at 24 real hours | No rate conversion; must consume the same shared window | Keep its real-time pacing and avoid giving it a separate additional 24-hour allowance. Wandering encounter pacing is explicitly out of this batch. |
| Injury duration and treatment | Injury duration is 90–180 real minutes of active play; the live treatment helper had subtracted game days | Natural duration remains real play time; the helper now accepts real play minutes and clamps at zero. The active Make camp screen already had no treatment call; an old call appears only in an archived screen export. | The dead legacy functions in `stats.js` are removed; the live helper in `active.js` uses `treatInjury(playMinutes)`. |
| Daily and rolling limits | Scouts and other existing daily limits use local calendar-day keys; Wandering commands use a rolling real-time 24-hour window | Unchanged by the game clock rate | **Sam's Oct 24 decision:** Hide uses at most two rolling 24-hour timestamps, with each charge returning 24 hours after its use; camp returns 24 hours after a successful use. Timezone changes do not refill these actions. Existing scout and other daily limits retain their local-midnight behavior for this batch and move to rolling refills in a later batch. |
| Wandering fights, injury ticking, recycling, repairs, buffs, and other real-time systems | Real seconds/minutes/days | Unchanged by the game clock rate | Do not rescale. Keep skill decay on real days, as already decided. |

## Offline-cap implementation boundary

For an absence, derive one bounded wall-clock interval: `min(actual absence, 24 real hours)`. Give that same interval to Wandering, camp schedule, crafting/builds, and route catch-up. Do not let each subsystem independently claim a fresh 24 hours. Keep the calendar calculation based on the unbounded actual absence. No player-facing explanation or cap message is required.

The HTML prototype is client-side; its C# server is not connected to it. Sam confirmed that CLOCK-01 stays focused on the browser prototype and server enforcement is deferred to later server wiring. A local implementation can match the 24-hour rule, but it cannot limit work performed by an unconnected server.

## Items to resolve during implementation planning

1. Add one shared offline elapsed-time value at the settlement boundary and pass it to every offline system.
2. Implement the clock-rate conversion and calendar display in both HTML pages.
3. Keep server enforcement as a follow-up; it is outside this browser-prototype batch.

**Step 1 result:** complete. The rate conflict is resolved by the locked Oct 24 decision: 60,000 ms per game hour (one game hour per real minute), not the older survey's five minutes.
