# CLOCK-01 — Step 2: timer survey checked against the code (Oct 23)

Read-only. No game or design files changed. No game file has changed since `TIMER_SURVEY.md` was written.

## Result: the survey matches the code
Spot-checked every rule-bearing line cited in sections 1, 2 and 5. All match:
- One clock constant: `ZI.REAL_MS_PER_GAME_HOUR = 6000` (`game/core.js:50`). Old clocks settle at their saved rate (`core.js:59-64`), so a rate change cannot jump the day.
- Hide and Make camp call `ZI.passTime` (`screens-v3.jsx:904,910`): an instant skip, as F1 says.
- Camp schedule cap is 24 **game** hours (`camp.js:19,47`), as F3 says.
- Crafting and builds convert game seconds through the clock (`Zombie Idler v2.html:3224`, `camp.js:160`), as F6 says.
- Wandering command window, offline cap and encounter steps are real time (`wandering.js:10,286,309`).
- Skill decay `absenceCapDays: 1` is real days (`stats.js:297,316`), as F5 says.

## Additions the survey missed
- **A1 (F2 detail):** `setInjury`/`treatInjury` are defined twice. `game/active.js:1185-1186` loads later and wins; the `stats.js:378-380` versions are dead code. The live injury counts **real play time** (`remainingMs`, 90–180 min) but `treatInjury` subtracts **game days**. At C1, one treatment day = 2 real hours, which wipes any injury. F2 is a live bug at C1, not only a naming issue.
- **A2:** comments with hard-coded "6 real seconds" / "2.4 real minutes" (`routes.js:152`, `core.js:51`, `active.js:819`) go stale at C1. Low; fix with the batch.
- **A3:** the Traversal scout day uses `ZI.clockNow` (real time with a test hook), not the game clock. Correct for C2.

## Blocking question for Sam
- **Q1:** The CLOCK-01 slice is not in `E:\Zed_Idler`, Drive, or the searchable chat history. Please paste it (or save it to `reference/`). Step 1 cannot start without it.
- **Q2:** The rate. `DESIGN_HANDOFF.md` and `trav-01-traversal-slice.md` (T8) say **1 game hour = 1 real minute** (Oct 21). The survey uses **C1 = 5 real minutes**. Which is locked? Both files need updating once you confirm.
- **Q3:** F1–F6 are still open. They should be decided in the slice before the build (step 4).
