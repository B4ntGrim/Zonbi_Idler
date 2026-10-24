# Oct 22 read-only report (Block 3)

**Scope:** read-only. No game file, data file or design document was changed.
**Code read:** the live HTML/JS prototype (`game/*.js`, `screens-v*.jsx`, `bestiary-data.js`). The `unity/` folder was not read.
**Tag:** every fact below is `[CODE]` as of Oct 22.

---

## 1. Rig

- **The Rig slot exists:** `game/items.js:20`, `{ id:'rig', label:'Rig', accepts:'gear', group:'gear' }`.
- **It holds two items:**
  - Tactical Chest Rig, `rig_t2` (`game/items.js:54`). Its description says "+4 quick slots. +20% reload speed." Neither effect is implemented; the item has no pocket or capacity fields.
  - Sensor Rig, `sensor_rig` (`game/items.js:181`). It gives armor 2 and loot +8.
- **No Rig item gives pockets.** Pockets come only from the slots in `ZI.CARRIER_SLOTS = ['backpack', 'belt', 'vest']` (`game/items.js:533`), using the numbers in `ZI.CARRIER_DATA` (`game/items.js:547-557`). Neither `rig` nor any Rig item appears in either list.

**Design impact:** "Rig stays Rig and keeps its pockets" is half true. The slot stays, but it has no pockets to keep. Whether Rig should give pockets is a design decision, not a fact to preserve.

## 2. Off-hand

- **Saves:** low risk. The loadout is one object keyed by slot id, saved under `zi_loadout` (`game/items.js:191-201`). `getLoadout()` merges the saved object over `emptyLoadout()`, which is built from `ZI.GEAR_SLOTS`. A new slot appears as `null` in old saves with no migration. Any `zi_` key is saved per slot automatically (`game/save.js:9-14`).
- **Combat:** high impact. `resolveLoadoutStats` (`game/items.js:259-279`) **adds the `dmg` of every equipped weapon** across all slots that accept `weapon` (Primary, Sidearm, Melee). An Off-hand slot that accepts `weapon` would add its blade's damage to the total. Wandering combat reads this total (`game/wandering.js:328`, `game/active.js:1145`).
  - Shields are not weapons in the data model. A shield would need either a new category (for example `shield`) or `cat:'armor'` with a new slot group.
- **Paperdoll:** low risk. Both paperdoll views draw slots from `ZI.GEAR_SLOTS`, grouped by `accepts` (`screens-v3.jsx:2851-2880` and `3588-3600`). A new slot appears automatically in its group's two-column grid.
- **Two-handed weapons:** no flag exists. A search for two-hand, twoHand, two_hand and hands found nothing in `game/` or the screens.
- **Existing overlap:** a `secondary` slot labelled **Sidearm** already exists (`game/items.js:12`) for pistols and revolvers.

## 3. Ring

- **Saves:** same as Off-hand. No migration is needed.
- **Paperdoll:** same as Off-hand. It appears in its `accepts` group automatically.
- **Note:** the slot list has **17 slots** (16 at `game/items.js:10-27`, plus Belt at `:536`), but the comment at `:9` still says 14.

## 4. Day/night

- **One game clock exists:** `game/core.js:46-80`. `ZI.getGameTime()` (`:72`) returns `{ day, second }`, saved under `zi_game_clock`.
- **Rate:** `ZI.REAL_MS_PER_GAME_HOUR = 6000`. **One game hour is 6 real seconds, and one game day is 2.4 real minutes** (`game/core.js:50-51`). Skill decay stays on real days (same comment).
- **No shared day/night function exists.** The phase is worked out only inside a screen: `screens-v2.jsx:41-42` sets night as 21:00–05:00 and dusk as 18:00–21:00 and 05:00–07:00. Day is everything else.
- **What reads the phase:** only the Stats conditions panel, through `ZI.conditionMods` and `ZI.TIME_STAT_MODS` (`game/survival-data.js:340-372`).
- **No rule reads the world clock** (CODE_STATE, H1 audit, "out of scope"). Night Walker and Sun Stalker would need a shared `ZI.dayPhase()` in `game/core.js` first.

## 5. Leveling

- **Character level:** derived from total XP on every read (`game/stats.js:18-22`). The curve is `100L + 10L²`, **capped at 100**. No level number is stored.
- **Skill levels:** derived from per-skill XP in `zi_stat_xp` (`game/stats.js:142-153`), **capped at 50**.
- **No level-up event exists.** The XP bus is `ZI.awardXp` (`game/stats.js:112`), and `ZI.onXp(fn)` (`game/stats.js:110`) notifies listeners on every award.
  - **Hook point:** an `onXp` listener can compare the level before and after each award and add a banked pick when it crosses a level.
- **Existing perks:** names only, three per class, in `ZI.CLASSES` (`game/core.js:103-127`, with `masteryLevel`). One perk is wired as a rule: Command's +1 heal charge at level 40 (`game/active.js:90-94`).
- **Unspent picks in the save:** yes. A new `zi_` key (for example `zi_perk_picks`) is saved per slot automatically. A save-format bump in `ZI.SAVE_MIGRATIONS` (`game/save.js:150`) is only needed to fill in data for old saves. The current schema is v8.
- **Attribute names differ from PERK-01.** `ZI.SURVIVAL_ATTRS` (`game/core.js:91-100`) lists Survival, Underhandedness, Reflex, Vitality, Insight, Valor, Aptitude and Lucky. PERK-01 lists Strength, Utility, Resolve, Vitality, Intellect, Vigilance, Agility and Luck.

## 6. Enemy table (PF13 §0)

- **Where it lives:** `ZI.BESTIARY` in `bestiary-data.js:21`, with 45 entries. The tier colors are in `ZI.BESTIARY_TIERS` (`bestiary-data.js:7-16`). The old `ZI.ZOMBIE_CODEX` table was retired (`game/combat.js:4`).
- **Which files read it:**
  - Wandering: `ZI._bgZombie` (`game/wandering.js:105-114`).
  - Tier display: `ZI.wanderDrawableTiers` (`game/world.js:178-184`).
  - Traversal combat: `mapBestiary` (`screens-v3.jsx:1815-1830`).
  - Codex: `screens-v3.jsx:2942-3094`.
- **How tiers are stored:** **one row per named zombie, each with one fixed tier** (F, E, D, C, B, A, S or BOSS). There is no type-scaled-by-tier table.
  - `base` holds a type name (Shambler, Creeper and so on), but nothing scales one type across tiers.
  - The tier pool opens with distance: one tier about every 1.5 laps (`game/wandering.js:108`).
- **Fields:** id, name, tier, base, traits[], hp, dmg, spd, armor, xp, weakness[2], ability, loot, biome, notes.
- **Traits:** a `traits` array exists, but it holds flavor strings such as 'Clothed' and 'T0 Stinky', not PF13 traits. Only two rules read it, both by text pattern:
  - `ZI.retreatEvadeCounters` (`game/active.js:777`) looks for "Awareness skill" or "Stealth reveal".
  - Escape odds (`game/stats.js:198`) look for grab, hold or latch.
- **How combat and the Codex read it:**
  - Wandering copies name, hp, dmg as atk, xp, id, tier and armor. It deliberately leaves out spd and traits (BEST1 comment, `game/wandering.js:113`).
  - Traversal maps more fields, including weakness and loot.
  - The Codex shows the full row, including traits, and uses the discovered set `zi_discovered_zombies` (`game/combat.js:9-23`).

## 7. Grid distance

- **Chebyshev distance** (diagonal moves count as 1):
  - Adjacency on the Traversal map is `max(|dx|, |dy|) === 1` (`screens-v3.jsx:772`).
  - Elder Jester camp placement searches by Chebyshev rings (`game/active.js:817`, `:868`).
- **No path-length measure exists.** Route runs use fixed node lists, not grid cells (`game/routes.js:6-20`).

**Kibble impact:** with Chebyshev distance, d is the number of king-moves, so a diagonal jump costs the same as a straight one.

## 8. Camp

- **Solo base:** no fixtures. Rest at base uses a bed tier, but no bed tiers are built yet, so it is always the Bedroll (`game/active.js:40-41`, `:83-86`).
- **Camp Leader camp:** 13 structures in `ZI.CAMP_STRUCTURES` (`game/camp.js:57-97`), each with levels 1–5, build costs and build times:
  - Bunks, Farm, Recycler, Workshop, Watchtower, Forge, Infirmary, Kitchen, Garage, Scout Post, Radio Post, Barracks, Walls.
  - All are gated by `campLeaderLevel`, so Solo cannot use them today.
- **Timed processes that run while away:**
  - The **job engine** (`game/jobs.js`) runs crafting, repair, build and recycle timers, and settles them on load (offline catch-up).
  - **Schedule jobs** (`game/camp.js:6-24`) give XP per game hour, capped at 24 hours offline (`ZI.SCHEDULE_OFFLINE_CAP_H`, `game/camp.js:16`).
- **No item runs a process.** Only jobs and structures do. A Generator would fit best as a job-engine timer or a structure, not as an item.
- **Existing overlap:** Camp Leader already has a **Radio Post** (Trade/Radio job, Diplomat XP) and a **Workshop**.

---

## Extra findings (not asked, but they affect the design)

1. **The game clock is fast.** One game day is 2.4 real minutes, so every "game hour" and "game day" in the Oct 22 designs is very short:

   | Design value | Real time |
   |---|---|
   | Noise drop of 1 level per game hour | 6 seconds |
   | Scent clearing after 6 game hours | 36 seconds |
   | Perk auto-pick after 3 game days | 7.2 minutes |
   | Dependence after 3 game days addicted | 7.2 minutes |
   | Booze daily cap of 10 | per 2.4 minutes |

2. **Shop name collision.** The Market tab already has two sub-views, **Auction** and **Shop** (`screens-v2b.jsx:523-568`; tab label in `Zombie Idler v2.html:414` and `:425`). Renaming the tab to Shop creates a Shop tab with a Shop sub-view. `ZI.SHOP_ITEMS` (`game/economy.js:197`) and `ZI.MARKET_ITEMS` (`game/survival-data.js:47`) are separate tables.
3. **Level caps.** The code caps character level at 100 and skills at 50. PERK-01 proposes 70 for both.
