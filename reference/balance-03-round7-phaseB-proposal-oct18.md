# BALANCE-03 — Round 7 Phase B proposal: Medkit recipe and comparison matrix (Oct 18)

**Status:** proposal for review. Phase B does not run until Sam reviews the recipe. No production, UI, save or spec change.

## 1. The Medkit rule being balanced (`[DECIDED Oct 18]`)
- 2 consumable charges, never regenerating, and no free base charges.
- Each charge heals by the First Aid formula: `heal % of max HP = min(75, round(20 + 1.2 × First Aid level))`. Max HP is 100.
- First Aid levels up from heals (`emitAction('heal', 1 + amount/100)`).

| First Aid level | Heal per charge | One Medkit (2 charges) |
|---|---|---|
| 1 | 21 HP | 42 HP |
| 5 | 26 HP | 52 HP |
| 10 | 32 HP | 64 HP |
| 20 | 44 HP | 88 HP |
| 30 | 56 HP | 112 HP |
| 46+ (cap) | 75 HP | 150 HP |

For scale: early fights cost 14 HP (tier 0) to 25 HP (tier 1) each. One Medkit at level 1 buys about 2–3 more tier-0 fights.

## 2. Proposed recipe `[PROPOSED]`
| Field | Value | Why |
|---|---|---|
| Recipe | **Medkit** (`cr_medkit`, built with the existing gear-recipe helper) | Reuses the existing crafting path; outputs the existing `medkit` item |
| Output | 1 ordinary Medkit (2 charges) | Matches the decided rule |
| Cost | **Cloth 4, Medical 2** | Both come from the earliest source in the game (§3). Far cheaper than the Field Bandage (Cloth 20, Medical 10), because early supply is tiny |
| Time | **1,800 game seconds** (30 game minutes; **3 real seconds** at 1 game hour = 6 real s) | Crafting time is not a meaningful limit at the current clock; materials are |
| Requirements | Unlock **Default** (available from the start); crafted at base; 1 craft slot (the base number of slots) | The tutorial and Fort specs already promise "recipe available from the start" `[DECIDED]` |
| Skill | Trains Medical through the existing `craft.medical` action | Existing XP rule |

## 3. How the materials arrive early (`[CODE]` facts)
| Source | Cloth / Medical? | Notes |
|---|---|---|
| **Traversal "Loot" action** (`screens-v3.jsx` ~857) | **Yes** | Once per square, ever. Gives 2–3 random picks from 6 materials, each 2 to (5 + 2 × square tier). **Expected per tier-0 square: 1.46 Cloth and 1.46 Medical; tier 1: 1.9 each.** A failed search costs HP, never below 1 |
| Recycler (Wandering kill salvage) | **No** | Salvage is named "<zombie> salvage"; the recycler's name rules turn it into **Metal only** (`economy.js` `toRecyclerItem`) |
| Wandering "mats" (per kill and venture) | **No** | A counter only; never credited to any material store |
| Faction contract material rewards | Later | Not in the first week |
| Route runs | Not cloth or medical | A generic loot count |

**Sustainable rate** (cloth-limited):
- about **0.36 Medkits per tier-0 square looted** (0.47 on tier 1);
- at 3 new squares a day (the harness pace), **about 1.1 Medkits a day** (2.2 charges);
- at 6 squares a day, about 2.2.

Variance is high, because each pick's material type is random.

**Access by player type:**

| Player | Can loot and craft? | Can carry a Medkit? |
|---|---|---|
| Tutorial participant | Yes | Yes: pouch (2 pockets) + Old Padded Jacket (2 pockets). The scout kit uses 1 |
| Tutorial skipper | Yes (Traversal and Crafting are open to everyone) | **No:** 0 pockets and no early craftable pocket item (blocker 1) |

## 4. Proposed Phase B matrix (after recipe review)
**Every set:**
- the A0 rules: square-difficulty tiers with warned threats, near-death 1 / 1 / 3, full Downing 5, character XP;
- Option C 40/30 with rule 5;
- no free charges;
- the recipe above;
- matched seeds 101–505 × 7 days, returns every 8 h.

**Supply model (disclosed assumption):**
- at each return the player loots the new square once (existing loot distribution, seeded) and crafts every Medkit the materials allow;
- Medkits are carried up to free pockets (normal capacity), and the rest stay in the stash for the next trip.

**Intro (tutorial starts):**
- the scripted encounter Downs the survivor at 1 HP on the first watched encounter;
- the Jester meeting follows immediately: trade, camp rest, relocation, and the rewards with the pouch first and normal capacity;
- no stress from the intro;
- reported separately.

| Set | Change | Starts |
|---|---|---|
| **B0** | Recipe supply, 1 square looted per return | Tutorial participants (3 weapons) + skipper |
| B0-low | No looting (recipe exists, no materials) | Same |
| B0-high | 2 squares looted per return | Same |
| **B1** | B0 + encounter spacing EN3 ×2 (proposed lever) | Same |
| B1-high | B1 with 2 squares per return | Same |
| B-pol | The best of B0/B1 × immoral, criminal, heinous | Same |

**Report per day:**
- field time, distance, encounters;
- HP rest and stress rest;
- squares looted, Cloth and Medical gained;
- Medkits crafted, carried, used and wasted (fumbles), and left at day 7;
- rescues, recurring full Downings, and the intro Downing on its own line;
- Downings per km and per 100 encounters;
- stress by source.

**Not adopted, so not in the matrix:** stress scaling, post-kill healing. They stay `[PROPOSED]` and are listed only as earlier results.

## 5. Blockers
1. **Skippers can't carry Medkits.** A skipper has 0 pockets; the only pocket gear is the Jester's pouch and jacket, or `soft_armor_vest` (Infirmary rank 1, Cloth 40, Metal 25). The recipe is reachable, but a skipper can't use its output in Wandering.
   - Options: a small base pocket for every survivor; an early pocket recipe (for example a belt pouch); or allow one Medkit without a pocket.
2. **Wandering never yields Cloth or Medical.** Kill salvage recycles to Metal only, and Wandering "mats" are display-only.
   - Medkit supply therefore depends entirely on manual Traversal looting, once per square. An idle player gets none.
   - Accept this (Traversal as the supply loop), or map some salvage to Cloth/Medical (a separate proposal).
3. **Reward placement conflict:** the Jester's carried rewards (scout kit, 2 rations) are added without a pocket check (`Jester._place`).
   - The simulation will apply normal capacity.
   - The settled order is jacket → pouch → weapon → carried → stash, so the **jacket, not the pouch, is first today**. The pouch-first rule changes that order. Flagged, not changed.

## 6. Decisions requested
1. Approve or adjust the recipe values (Cloth 4, Medical 2, 30 game minutes, Default unlock).
2. Blocker 1: how a skipper carries a Medkit.
3. Blocker 2: accept Traversal looting as the only early Cloth/Medical source for now?
4. Confirm the Phase B supply assumption: one square looted per return, plus the 0 and 2 sensitivities.
