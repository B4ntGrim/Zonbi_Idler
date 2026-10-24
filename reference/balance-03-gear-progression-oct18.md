# BALANCE-03 — Gear progression and repairs on the Broken model (Oct 18–19)

**Status:** simulation only. No production code, UI or real save changed. Started Oct 18; Sam paused it at 20:12 PT and it resumed Oct 19. This report replaces the interim note.

**Clock:** every "per day" figure is per **real day** (24 real hours). Crafting times are game time converted at 1 game hour = 6 real seconds.

**Primary measure:** **Downings per km** (Sam, Oct 18). There is no daily ceiling.

## 1. What was tested
**Base, all sets.**
- *Settled rules (S0):*
  - Option C 40/30 + rule 5 (zombie encounters stop once a withdrawal starts);
  - near-death 1 / 1 / 3; top-up +5;
  - no free charges; Medkit recipe; pockets; skipper pouch;
  - loot damage;
  - crafting and survivor recycling pause Wandering;
  - Forced Retreat returns home instantly.
- *Broken model (concept, approved for simulation):*
  - stress resets to 80; resume gate is HP only; overload ×2;
  - Monopoly release with durability cost;
  - "harsh" penalties (−25% max HP, 25% of attacks lost, +10% damage taken) unless noted.
- *Proposed lever:* encounter spacing EN3 ×2, unless noted.
- *Runs:* matched seeds 101–505 × 4 starts × 7 real days. All 180 runs OK.

**Repairs (existing code, `[CODE]`):**
- **Cost:** `ZI.repairCost` = recipe cost × 0.5 × missing fraction. Items without a recipe, such as the Nail Bat and the jacket, pay a small Metal fallback (at most 3 Metal).
- **Time:** `max(30, missing points × 2)` real seconds, survivor-operated, pausing Wandering (same as crafting).
- **Repair rule** (player choice, disclosed): repair every equipped item below 50% durability.

**Gear progression** (player choice, disclosed):
- Default-unlock recipes only, crafted before Medkits in a fixed order:
  1. Iron Knuckles, only if no weapon is equipped (30 Metal);
  2. Scrap Helmet (30 Metal, 10 Cloth);
  3. Pipe Pistol (25 Metal, 10 Wood; G4 onward);
  4. Leather Gloves (20 Cloth, 8 Fuel).
- No vest is craftable without a facility rank.

| Set | Content | Kind |
|---|---|---|
| G0 | Control: no repairs, no new gear (as in the Broken-model round) | Baseline |
| G1 | Repair at each 8-real-hour player return (a trip home if needed) | Player choice on existing code |
| G2 | G1 + automatic repair on every Forced-Retreat arrival home | `[PROPOSED]` automation |
| G3 | G2 + gear progression (no pistol) | Player choice |
| G4 | G3 + Pipe Pistol | Player choice |
| G5 | G4 + **strong** penalties (−40% max HP, 40% of attacks lost, +25% damage taken) | `[PROPOSED]` |
| G6 | G5 without encounter spacing | Sensitivity |
| **G7** | G4 + **rule 5 also stops policy events** during the walk back | **Sensitivity, not a rule** (§4) |

## 2. Results (per real day; tutorial survivors / skipper)
| | G0 control | G1 repair at returns | G2 + auto | G3 + gear | G4 + pistol | G5 strong penalties | G6 no spacing | **G7 rule 5 covers policy** |
|---|---|---|---|---|---|---|---|---|
| **Downings per km** | 0.30 / 0.34 | **0.08** / 0.34 | 0.08 / 0.34 | 0.08 / **0.13** | 0.08 / 0.13 | 0.08 / 0.14 | 0.63 / 1.82 | **0.01 / 0.02** |
| Recurring Downings | 16.2 / 17.7 | 7.8 / 17.7 | 7.5 / 17.7 | 7.6 / 11.1 | 7.5 / 11.1 | 7.8 / 11.7 | 22.2 / 35.7 | **0.6 / 1.8** |
| Field time | 35% / 34% | 59% / 34% | 60% / 34% | 60% / 51% | 60% / 52% | 61% / 51% | 39% / 26% | 63% / 55% |
| Distance (km) | 54 / 52 | 95 / 52 | 95 / 52 | 95 / 83 | 96 / 84 | 96 / 84 | 35 / 20 | 104 / 93 |
| Fights | 147 / 146 | 102 / 146 | 109 / 146 | 111 / 131 | 110 / 129 | 107 / 133 | 458 / 444 | 116 / 136 |
| Fights with weapon worn out or none | 95% / 100% | 16% / 100% | 11% / 100% | 15% / 23% | 10% / 21% | 10% / 20% | 15% / 14% | 11% / 24% |
| Average weapon damage in fights | 1 / 0 | 17 / 0 | 18 / 0 | 17 / 12 | 23 / 17 | 23 / 17 | 19 / 16 | 22 / 17 |
| Durability worn (% of one item) | 29 / 0 | 425 / 0 | 474 / 0 | 468 / 252 | 452 / 245 | 449 / 253 | 1195 / 580 | 467 / 247 |
| Repairs (Metal; survivor minutes) | 0 | 4.7 (22; 7) | 5.4 (25; 8) | 5.3 (25; 8) / 2.9 (38; 4) | 5.1 (26; 7) / 2.8 (35; 4) | 5.2 / 2.9 | 15.1 (68; 20) / 8.3 | 5.0 / 2.6 |
| — of which automatic | — | — | 1.7 | 1.5 / 0.7 | 1.4 / 0.7 | 1.3 / 0.9 | 11.1 / 6.8 | — |
| Time spent Broken | 11% / 10% | 3% / 10% | 3% / 10% | 3% / 4% | 3% / 4% | 2% / 5% | 12% / 19% | 1% / 1% |
| Medkits crafted | 1.57 / 1.49 | 1.57 | 1.57 | 1.29 / 1.14 | 1.27 / 1.14 | 1.29 / 1.14 | 1.29 / 1.14 | 1.29 / 1.14 |
| Rescues (heal charge on Downing) | 1.1 / 0.6 | 1.4 / 0.6 | 1.4 / 0.6 | 1.1 / 0.7 | 1.0 / 0.7 | 1.1 / 0.7 | 1.7 / 0.9 | 0 / 0 |

**Gear made (G4; G3 is the same without the pistol):**
- *Tutorial survivors:* Scrap Helmet and Pipe Pistol in 12 of 15 runs at real day 3.7; Leather Gloves in 3 of 15 at day 6.3.
- *Skipper:* Iron Knuckles in 5 of 5 runs at day 1.1; helmet and pistol in 4 of 5 at day 4.5; gloves in 1 of 5.
- **Cloth limits the gear** (about 7 a day from loot). Gear takes about 1.7 Cloth a day, so Medkits fall about 18%.

## 3. Findings
1. **Repairs are a large lever, and they cost almost nothing.**
   - A T0 item has 50 durability, which lasts about 50 kills (about 3 hours of field time).
   - Without repairs, gear was worn out in 95% of fights, so the survivor fought unarmed and unarmored (a worn item gives no benefit, `[CODE]`).
   - Repairing at player returns halved Downings per km for tutorial survivors (0.30 → 0.08) and raised field time to 59%.
   - It costs about 25 Metal a day (out of about 200 recycled) and 7–8 survivor-minutes, so **repair cost is not a real decision for the player today.**
2. **Automatic repair adds little** over repairing at player returns. It's a convenience, not a balance lever.
3. **Gear progression mainly fixes the skipper**, who starts with no weapon: Iron Knuckles by day 1.1 cut its Downings per km from 0.34 to 0.13. For tutorial survivors, the helmet, pistol and gloves change nothing measurable.
4. **Stronger penalties change nothing** (G5 vs G4). With repairs, the survivor is Broken only 2–5% of the time, so the penalty strength barely applies.
5. **Encounter spacing is still essential.** Without it (G6), Downings per km rise 8–14× (0.63 / 1.82), and field time falls to 39% / 26%.
6. **Main finding: about 93% of the remaining Downings come from policy events, not zombies.**
   - *What policy events are (`[CODE]`, `wandering.js:445`, `ZI.wanderPolicyStep`):* roadside events (checks, trades, raids) that roll every 30 real seconds of field time, about 1,700 a day. About 16% fail, dealing 4–18 HP each, for **about 2,300–2,400 HP a day**. Zombie fights deal about 500–1,200.
   - Policy events **ignore armor, weapons and encounter spacing**.
   - They **keep rolling during the walk back** after the 30% HP retreat (rule 5 stops only zombie encounters, `_encMs`). 92–94% of Downings happened during that walk.
   - Explains findings 3 and 4: better gear and stronger penalties don't touch this damage source.
   - The same source is inside every earlier per-day and per-km Downing figure in BALANCE-03.
7. **G7 sensitivity (rule 5 also stops policy events during the walk back):**
   - Downings drop to **0.6 / 1.8 a day (0.01 / 0.02 per km)**, inside the 1–2 a day once accepted, with field time 63% / 55%.
   - No danger was added or removed elsewhere.
   - This is a **test of scope, not a rule** (§4, decision 1).
8. **Field time is now above the 25–50% target** in every spaced set with repairs (55–63%). Danger was not raised to pull it back, per Sam's instruction.

## 4. Decisions for Sam
1. **Rule 5 scope `[OPEN]`.** Rule 5 says "no encounters once a retreat starts". Should that include policy events (G7)? Alternatives, each needing its own test:
   - **(a)** Policy events pause during the walk back (G7).
   - **(b)** Policy damage can't Down the survivor (floors at 1 HP, like loot damage, U26).
   - **(c)** Policy damage is reduced by armor.
   - **(d)** Policy events roll less often.
   - **Recommendation `[PROPOSED]`:** (a). It matches the stated intent of rule 5, and the HP retreat then means what the player expects ("I'm heading home").
   - *Why not (d) alone:* it would cut XP and loot from events too.
2. **Which measure governs field time?** With repairs, field time is 55–63%. Keep 25–50% as a target (then a lever is needed), or let Downings per km govern and treat field time as a result?
3. **Repair cost and durability `[OPEN]`.** Repairs are nearly free, and gear lasts about 3 field hours. Options:
   - **(a)** Leave as is: repairs are routine upkeep.
   - **(b)** Raise `REPAIR_FACTOR` or give no-recipe items a real cost, so repairs compete for materials.
   - **(c)** Raise T0 durability so gear lasts a full 8-hour absence.
   - **Recommendation `[PROPOSED]`:** (c), possibly with (b) later.
   - *Why:* in an idler, gear that breaks mid-absence punishes the player for being away. Long-lasting gear plus a meaningful repair cost keeps the decision at the return, where the player's attention is.
4. **Automatic repair:** park it as a quality-of-life idea. It isn't needed for balance.
5. **Broken penalties:** strength doesn't matter at current rates. Choose mild or harsh by feel, or defer.
6. **Code facts to route to Claude Code (`[CODE]`, not changed):**
   - **(i)** `resolveLoadoutStats` adds damage from **every** equipped weapon. A Pipe Pistol plus the Nail Bat gives 48.
   - **(ii)** `wearEquippedOnKill` wears only the **first** weapon slot found (primary, then secondary, then melee), so a pistol takes all the wear and the bat never wears.
   - **(iii)** Helmet and gloves never wear.
   - Are these intended?

## 5. Next layer (Sam's order, after decision 1)
1. Solo Scavenging at yields ×1, ×2, ×4 and ×8.
2. Character-level HP growth.
3. Medkit stacking (3 or 5 per pocket).
4. The post-Forced-Retreat destination.

Each should use the baseline Sam picks in decision 1. Otherwise policy-event Downings will hide their effect, as they hid gear here.
