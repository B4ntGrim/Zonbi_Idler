# STOCK-01 — Stockpile screen (concept, pre-slice)

**Status:** concept. Not scheduled. Becomes a slice brief once FOOD-01 closes.
**Date:** Oct 21

## 1. Sam's direction `[CONCEPT Oct 21]`

- Stockpile is the home of everything at base: Recycler, Storage, Food, possibly Items.
- One page lists all **weapons, armor, gear, items and food**.
- **Each category has buttons on its rows to equip an item or move it into pockets** `[DECIDED Oct 21]`.
- The top of the screen needs more tabs than Recycler and Storage.

## 2. What exists `[CODE]`

- Two sub-views: **Recycler** (breaks field salvage into materials, runs in the background and offline) and **Storage** (materials, carrying, crafted-gear loadout with equip and repair). Tutorial spec §7.1.
- Terms (spec §14.8): **Stash** = items owned at base; **Carried** = items brought along (pockets); **Loadout** = equipped items.

## 3. Proposed layout `[PROPOSED]`

**Three top tabs, grouped by the job the player is doing:**

| Tab | Job | Contents |
|---|---|---|
| Recycler | Break things down | Unchanged |
| Storage | Manage what you own | Category filters: **All · Weapons · Armor · Gear · Items · Materials**. Each row: **Equip** and **Carry** buttons |
| Food | Keep the survivor fed | Camp food stock, how many days of rest it covers, fish and rations, buttons **To Food slot** and **Carry** |

*Why three tabs, not six:* on a phone, six tabs don't fit at the 16-point label floor (STATS-01) without shrinking or scrolling. Categories are views of the same list, so they work better as filters inside Storage. Food gets its own tab because it has its own job: supplying rest and the Food slot.

**Row buttons follow the existing rules:**
- Equip and Carry work only at the base or a camp cell (spec §14.9 #3). Elsewhere the button is **shown greyed with the reason**, not hidden.
- Carry is refused when no pocket is free or load would pass 125%; the message names the limit.
- Story items show no Carry, Recycle or Sell buttons (spec §14.9 #2).
- Equipping takes exactly one copy from the stash (spec §14.9 #1).

## 4. Open

- `[OPEN]` Three tabs as proposed, or Items as its own tab?
- `[OPEN]` Does Food also show the survivor's current Nutrition meter, or only camp stock?
- `[OPEN]` `[CODE]` How Storage currently lists crafted gear and carrying, so the filters reuse it.

## 5. Watch for

- **One list, many views.** The Storage list and the Loadout screen must read the same stash data, never two copies.
- **Greyed, not hidden.** A missing button teaches nothing; a greyed one with a reason teaches the rule.
