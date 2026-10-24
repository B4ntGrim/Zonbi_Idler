# CLOCK-01 — Read-only timer survey (Oct 23)

Read-only. No game or design files changed. Today the clock is 1 game hour = 6 real s (`game/core.js:50`).
"At C1" = the decided rate, 1 game hour = 5 real min (×50 slower). One constant drives every game-time row: `ZI.REAL_MS_PER_GAME_HOUR` (`game/core.js:50`).

## 1. Game-time timers (all scale ×50 at C1)

| Timer | Where | Today | At C1 | Note |
|---|---|---|---|---|
| World and header clock | `core.js:50-80`, `screens-v2.jsx:37` | 1 day = 2.4 min | 1 day = 2 h | Old saves already settle at their stored rate (`core.js:57-64`), so C1 change cannot jump the day. Open decision 2 is already true in code. |
| Hide | `stats.js:396`, `screens-v3.jsx:910` | 1 game h | 1 game h | **F1:** `ZI.passTime` skips the clock forward instantly; nothing waits |
| Make camp | `screens-v3.jsx:904` | 24 game h | 24 game h | **F1:** same instant skip of a full game day |
| Jester stay | `active.js:818-819` | 3–5 game days ≈ 7–12 min | ≈ 6–10 h | |
| Injury (set / treat) | `stats.js:379-380`, `active.js:1186` | game days | ×50 | **F2:** mixed with the real-time injury table below |
| Camp builds | `camp.js:160` | game seconds → real | ×50 | |
| Route runs | `routes.js:154,162` | 1 game h = 6 s | 5 min | |
| Camp schedule accrual and its offline cap | `camp.js:19,47` | cap 24 **game** h = 2.4 min | cap 2 real h | **F3:** conflicts with C3 (24 real hours) |

## 2. Real-time timers (unchanged by C1)

| Timer | Where | Value | Matches C2/C3? |
|---|---|---|---|
| Traversal scout pool (5) | `stats.js:395-405` | local calendar day | Yes (C2) |
| Traversal XP once per cell | `stats.js:401` | local calendar day | Yes |
| Walk-home group meetings cap 3 | `active.js:1012-1114` | local calendar day | Yes |
| Wandering command window 60 | `wandering.js:8-10` | rolling 24 real h | Yes |
| Policy switch cooldown | `wandering.js:124,143` | 4 real h | — |
| Wandering encounter / policy step | `wandering.js:309` | 6 s / 30 s real | — **F4** |
| Wandering offline cap | `wandering.js:286,309`, `items.js:348` | 86 400 s = 24 real h | Yes (C3) |
| Rest HP regain | `wandering.js:311` | 5 % per real min | — |
| Stress gain and bed recovery | `active.js:51-53,85-86` | per real day | — |
| Skill decay, absence cap 1 day | `stats.js:297-344` | real days (Sam, Oct 16) | **F5** |
| Injury duration table | `active.js:1019-1020` | 90–180 real min | **F2** |
| Faction reputation drift | `factions.js:179-182` | real days | — |
| Camp siege interval | `camp.js:304` | 18–30 real h | — |
| Recycle jobs | `economy.js:300` | real seconds | — |
| Consumable buffs | `items.js:119`, `screens-v3.jsx:2056` | real seconds (`durSec`) | — |
| Save resume window | `save.js:134` | 20 real s | UI only |

## 3. Not found or unclear
- **Booze daily cap:** not in code (ALC-01 unbuilt). Nothing to reset yet.
- **Crafting recipe `time`** (`crafting.js:9+`, e.g. 180, 2700): the unit is not stated and the caller was not traced. Ask Code.
- **Reference data** (`survival-data.js:133,172,459` — HP drain per hour, zombification hours, crop growth days): unclear whether any system reads them.
- **Fort wear** (`fort.js:76-90`): clears by kills, not time. Unaffected.
- Cosmetic UI intervals (`setTimeout`/`setInterval` in the `.jsx` files: XP flash, damage pops, polling) are excluded; they do not touch rules.

## 4. Flags for Sam
- **F1 — Hide and Make camp skip time, they do not take time.** At C1, Make camp jumps the shared world clock a full day (2 real hours of world time) in one click. Decide: keep the skip (a "sleep" feature) or make them real waits.
- **F2 — Injury uses both units.** Its duration table is real minutes; set/treat use game days. Pick one.
- **F3 — Camp schedule offline cap is 24 game hours, not 24 real hours.** At C1 it becomes 2 real hours, against C3. Recommend changing it to real hours.
- **F4 — Wandering combat runs on real seconds.** Fine as pacing, but drifts at 1 cell per game hour will move 50× slower than fights. Expected; note it.
- **F5 — Skill decay is on real days by Sam's Oct 16 rule.** CLOCK-01 P1 said "absence cap read as game days." That would shrink the cap to 2 real hours. Recommend keeping decay on real days and withdrawing that wording.

## 5. Follow-up check (Oct 23): crafting units and survival reference data

**Crafting recipe `time` is in game seconds.** The comment at `crafting.js:6` says "seconds"; the caller converts game seconds to real seconds through the clock: `craftRealSec` in `Zombie Idler v2.html:3224` (and the TEST SAVE page, line 3266). Camp builds work the same way (`camp.js:159-160`). So crafting and builds are game-time and **slow down ×50 at C1**:

| Set | Count | Shortest | Median | Longest |
|---|---|---|---|---|
| Craft recipes, today | 35 | 0.3 s | 13.5 s | 4.8 min |
| Craft recipes, at C1 | 35 | 15 s | 11 min | 4 h |
| Camp builds, today | 65 | 0.2 s | — | 1 min |
| Camp builds, at C1 | 65 | 10 s | — | 50 min |

Recycle and repair jobs are real seconds (`economy.js:300`, `screens-v3.jsx:3523`) and do not change.

**F6 (new, for Sam):** C1 makes crafting and building 50× slower. The new lengths suit an idler (minutes to hours), but it is a large pacing change that the simulation audit must check.

**Survival reference data is inert.** `ZI.MOODLES` (`survival-data.js:99`, incl. `hpDrainPerHour`), `ZI.INFECTION` (`:168`, incl. `zombificationHours`) and the crop `growthDays` (`:459`) are read by nothing outside the file. The only read of `ZI.SKILL_XP_SOURCES` is a display of its `sources` list (`screens-v2.jsx:337`). `ZI.TIME_STAT_MODS` (`:340`) is read by `ZI.conditionMods` (known). CLOCK-01 does not need to touch any of it.
