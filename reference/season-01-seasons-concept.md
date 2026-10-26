# SEASON-01 — Seasons (concept)

**Status:** Concept with decided parts (Sam, Oct 26 evening). Not scheduled; not a build input. Before any slice, check against BIOME-01 hazards, C6c day/night, the CLOCK-01 calendar, TRAV-02 / TRAV-02c, and the preview weather tables in code (`ZI.WEATHER_EFFECTS`, `ZI.WEATHER_STAT_MODS`, `game/survival-data.js`).

## 1. Decisions `[DECIDED Oct 26, Sam; values PROPOSED]`
- **Length:** one **real week** per season; a full cycle about a real month. Seasons run on real time, not the game calendar (a game year is about 6 real days). To be tested in the audit.
- **Display:** the calendar shows the season, e.g. "Year 2, Day 140 · Autumn".
- **Each season has two bonuses and two minuses** (one food-related, one not), all applied together:

| Season | Bonus 1 | Minus 1 | Bonus 2 | Minus 2 |
|---|---|---|---|---|
| Spring | Fishing and foraging +25% | Rain raises failed loot searches | Stress recovers faster | Mud wears boots faster |
| Summer | Longer days, less night-travel risk | Zombie encounters +15% | +1 travel square a day | Heat raises stress when carrying a heavy load |
| Autumn | Food finds +25%; orchards and vineyards (FOOD-01 F4) | Shorter days, more night | Falling leaves reveal zombies: fewer ambushes | Rain wears gear faster |
| Winter | Zombies slower, escapes easier | Cold hazards (BIOME-01), food finds −25% | Snow shows tracks: scouting cheaper | Cold: −1 travel square a day |

- **Stacking** `[DECIDED Oct 26]`: season travel modifiers stack with footwear (TRAV-02c); the cap never falls below 1 square (TRAV-02d).

*Why:* every season is a trade-off across food, combat, travel, stress and gear, so each feels like a chapter and planning changes with it.

## 2. Open
- `[OPEN]` How summer and autumn day length change the C6c night window (22:00–06:00) without breaking it.
- `[OPEN]` Seasons apply to offline catch-up through the shared step (proposed yes, for parity).
- `[OPEN]` Exact numbers for stress, wear and scouting effects (audit).
- `[OPEN]` How winter changes Mountain Country's hot days and cold nights.
