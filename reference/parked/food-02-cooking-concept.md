**Status:** [PARKED] until FOOD-01 closes and STOCK-01 is scheduled.

# FOOD-02 — Cooking (concept)

**Date:** Oct 21
**Related:** `food-01-nutrition-slice.md`, `stock-01-stockpile-concept.md` (Food tab)

## 1. Sam's direction `[CONCEPT Oct 21]`

- The **Food tab** in Stockpile holds cooking.
- **Active cooking (mini-game):** the player adds ingredients to a cooking pot. Doing it by hand **speeds up** cooking.
- **Automatic cooking:** otherwise food is crafted automatically, possibly tied to the shop.
- **"Cook greatest to least":** the automatic mode cooks the best foods first, then works down to the worst foods the player's ingredients allow.

## 1a. Decided `[DECIDED Oct 21]` (Sam)

- **The cooking pot is a bonus, not a requirement.** Cooking by hand speeds cooking up.
- **Idle path:** the player can click cook and walk away, choosing an item, a food group, or a specialty dish they know.
- **Specialty dish recipes** are unlocked through Traversal quests, factions, or other sources.
- **Food is cooked automatically while the player is away.**
- **Food can remove at most 5 stress per real day in total**, however many dishes are eaten (limit the rate, not the stack).
- **A cooking station at base does the cooking**, so food cooks while the survivor wanders and while the player is away (offline under the 24 h cap).
- `[CONCEPT Oct 21]` The cooking station **ties into the tutorial**, and the player can **improve it through a shop unlock**.

## 1b. Links from FOOD-01 (Oct 26)

Recorded in `food-01-nutrition-slice.md` §3b; listed here so this slice picks them up when unparked:
- **F3** raisins are dried grapes: the first simple recipe.
- **F10** hidden achievement "Can I get a number one?" (burger, fries, cola within one game hour) is inactive until this slice adds burgers and fries, which carry both Food and Component tags.
- **F13** dishes beat ingredients through nutrition plus a bonus (e.g. raw potato about 5; steak and potatoes about 35 plus comfort or a short buff) `[PROPOSED]`. Fits C6.
- **F14** food-group numbers are set in this slice.
- **F17** the variety-first auto-eat Shop unlock sits beside "Cook greatest to least".
- **Resolved Oct 26 (PM):** the food comfort cap stays **5 per real day** (§1a); F5's −10 wording is superseded.

## 2. Proposed rules `[PROPOSED]`

| # | Rule | Why |
|---|---|---|
| C1 | **Active is a bonus, never a requirement.** Automatic cooking makes every recipe; cooking by hand is faster (starting value ×1.5 speed) | The game is an idler; food is needed about 10 rations a day, too often for a required mini-game (design rules §4.5) |
| C2 | **The pot can discover recipes.** Combining ingredients by hand can reveal a recipe the player hasn't learned; once found, automatic cooking can make it | Gives active play a lasting reward without making it mandatory |
| C3 | **Basic automatic cooking is free.** "Cook greatest to least" (smart ordering) is an earned **RMAT shop unlock** | The shop sells efficiency, never relief from hunger (business-model rule 5.1); matches eat-while-walking |
| C4 | **Keep list.** The player can lock ingredients so automatic cooking never uses them | Stops "greatest to least" from burning a rare ingredient the player was saving |
| C5 | **The cooking station cooks** `[DECIDED Oct 21]`, in parallel with Wandering and while away, like the Recycler | Reuses the rule that only a worker or facility runs alongside Wandering (decided Oct 18) |
| C6 | **Better meals do more:** more nutrition, lower stress, and short buffs through the existing Stat Boosts consumable pillar | Cooking always beats eating raw; no new buff system |

## 2a. How big a stack of specialty food breaks the game? (test, Oct 21)

**Script:** `specialty_sim.py` (round 8 day model, 90 s pacing, stress ×1, 20 seeds × 7 days). A specialty dish gives +40 nutrition and −S stress, eaten first while any remain. "Breaks" = leaves the target band (field time 25–50%, Downings 2–5 a day). Baseline: 41% field time, 2.7 Downings.

| Stress relief per dish | Stack 5 | Stack 10 | Stack 20 | Stack 50 | Stack 100 |
|---|---|---|---|---|---|
| None (nutrition only) | 41% | 41% | 41% | 41% | 41% |
| −2 | 43% | 45% | 49% | **63% (breaks)** | **78% (breaks)** |
| −5 | 44% | 47% | **54% (breaks)** | **75% (breaks)** | **100% (breaks)** |
| −10 | 45% | 48% | **54% (breaks)** | **75% (breaks)** | **100% (breaks)** |

**Findings**
1. **Nutrition alone never breaks balance.** Even 100 big dishes leave field time unchanged; they only remove food pressure while they last (a 100-dish stack is about 16 days of food).
2. **Stress relief is what breaks it.** Stress is the main limit on time in the field, so food that lowers stress converts directly into more time out.
3. **The break point is total relief, not stack size:** roughly 70–100 stress removed over a week, about half of what the Bedroll removes (140 a week). Twenty dishes at −5 already cross it.
4. At −5 and −10 per dish, the 100-dish stack keeps the survivor in the field all week and pushes Downings above 5.

**Decided Oct 21:** cap the stress food can remove at **5 per real day** in total, however many dishes are eaten. With a daily cap, stack size stops mattering for balance, and big specialty stacks stay safe. Nutrition and short buffs stay uncapped beyond the existing −20% penalty cap rules.

**Lesson:** limit the **rate**, not the **stack**. A stack limit is easy to dodge (more stacks, more crafting); a daily cap holds no matter how much the player hoards.

## 2b. Audit: the 5-per-day cap (Oct 21)

**Script:** `specialty_cap_audit.py` (same model, 20 seeds × 7 days, 90 s pacing). Dishes from −2 to −25 stress each, stacks from 20 to 500.

| Relief per dish | Stack | No cap: field time | With cap: field time | With cap: Downings / day | Most relief in one day (cap) |
|---|---|---|---|---|---|
| −2 | 100 | 78% (breaks) | 49% | 3.1 | 5.0 |
| −5 | 20 | 54% (breaks) | 43% | 2.8 | 5.0 |
| −5 | 500 | 100% (breaks) | 49% | 3.1 | 5.0 |
| −10 | 100 | 100% (breaks) | 49% | 3.1 | 5.0 |
| −25 | 500 | 100% (breaks) | 49% | 3.1 | 5.0 |

**Result: PASS.** With the cap, all 16 combinations stay inside the band (field time 43–49%, Downings 2.8–3.1). No day ever exceeded 5 relief. Stack size and dish strength stop mattering.

**Watch for:** with the cap fully used, field time sits at 49%, the top edge of the band, from food alone.

**Decided Oct 21 (Sam): no shared budget.** Each non-bed source (food, comfort items, camp rest, the Church) keeps **its own limit and its own strength**, and the player chooses the combination. Strong foods and a powerful Church are intended. Comfort items are worn (existing gear slots, spec §13.8); their details come later.

**Stacking audit `[PROPOSED]`:** with four sources there are 15 possible combinations. When each source has numbers, test each source alone and the **all-sources worst case**, and decide on purpose what the full combination should feel like (for example a late-game reward that may sit above the early-game band).

## 2b-i. Legendary Lunch Pail `[DECIDED Oct 21]` (Sam)

A rare item the player can **find** that **raises the daily food stress cap**.

| Raised cap | Field time (500 dishes at −5, 90 s pacing) | Downings / day |
|---|---|---|
| 5 (no pail) | 49% | 3.1 |
| 7 | 52% | 3.3 |
| **8 (proposed)** | **54%** | **3.3** |
| 10 | 57% | 3.5 |
| 15 | 65% | 4.0 |

`[DECIDED Oct 21]` (Sam accepted the proposals):
- **+3 to the cap (5 → 8).** It lifts field time a little above the band, which is acceptable for a rare find: a felt reward, not a new baseline.
- **Worn in the Trinket slot,** the slot already marked for pure stress items (spec §13.8), so it competes with other trinkets.
- **Found, never bought:** legendary loot, a quest reward, or an eligible djinn wish item. Selling a raise to a cap the game set would break the business-model rule.
- **One pail counts.** A second pail adds nothing.
- The name and art are original (design rule 4.7); "Legendary Lunch Pail" is a working name.

## 2c. Cooking station, tutorial and shop `[PROPOSED]`

**Station ladder (crafted, like the bed ladder):**

| Tier | How it's gained | Effect |
|---|---|---|
| Campfire | Exists from the start | Cooks every basic recipe, one at a time |
| Camp stove | Crafted (needs workshop tools) | Faster cooking |
| Field kitchen | Crafted (higher tier) | Faster again; can cook specialty dishes in bulk |

**Stations as Shop unlocks `[DECIDED Oct 27 PM, Sam]`:** the kettle pot, cook basin and smoker are **steps of this ladder, unlocked in the Shop** (the Shop replaces the Market tab; currency RMAT, decided Oct 25). The Campfire stays free from the start and cooks every basic recipe, so eating is never locked behind the Shop (rule 5.1). `[PROPOSED]` order Campfire → kettle pot → cook basin → camp stove → smoker → field kitchen; the Shop unlocks a station, then the player crafts it from wood, metal and plastics (keeps the material balance in §2d). `[OPEN]` the order, whether the camp stove and field kitchen stay, and RMAT prices.

**Shop unlocks (RMAT, efficiency only):** an extra cooking queue slot; "Cook greatest to least" ordering; an automatic reserve that keeps camp food above a set number for rest.

*Why both:* crafting upgrades the station's power (earned through play); the shop sells convenience. The Campfire always cooks every basic recipe at a fair speed, so nothing about eating is ever locked behind the shop (business-model rule 5.1).

**Tutorial tie-in:**
- A fourth Stockpile step, `stockpile.food`: "Cook your first meal." The starter kit's food plus one starter ingredient lets the player cook once at the Campfire, by hand, to see the pot.
- Existing saves see it as **"What's new"** (decided tutorial rule, option A).
- A later hint points to the shop unlock once the player has cooked several times, so the shop appears when it's useful, not on day one.

## 2d. Cooking stations, materials and spoilage (Sam, Oct 27)

- `[CONCEPT Oct 27]` **Stations:** smoker, cook basin and kettle pot. **`[DECIDED Oct 27 PM, Sam]` They are steps of the §2c station ladder, unlocked through the Shop** (see §2c). Not built yet. Each needs its own art and is **clickable inside the crafting/cooking menu**. Spoilage is tackled through them (the smoker preserves fish and meat, `[PROPOSED]`).
- `[DECIDED Oct 27]` **Material balance:** metal and wood each get their own balance; **wood is more abundant than metal**. `[PROPOSED]` kettle pot mostly metal, smoker mostly wood, cook basin a mix, so neither material bottlenecks.
- `[DECIDED Oct 27 PM, Sam]` **Plastics is the seventh base material**, alongside `[CODE]` wood, metal, cloth, medical, electronics and fuel (containers and seals that slow spoilage, water jugs; fishing gear in FISH-01). `[OPEN]` where plastics drops and how abundant it is (proposed: between wood and metal). Code: `ZI_MATERIALS` and every "six base materials" recipe comment change when a batch builds it.
- `[PROPOSED]` **Spoilage starting reference:** GDD v5.3 decay, perishables lose 10% of value every two days at camp; during travel it depends on containers.
- ~~`[OPEN]` Rungs of the §2c ladder, or parallel stations?~~ **Decided Oct 27 PM (Sam): rungs of the ladder, as Shop unlocks** (§2c).
- Fish preparation (descaling knife, skill-scaled loss) lives in `fish-01-fishing-concept.md` §3.

## 3. Open

- `[OPEN]` Mini-game shape: drag ingredients into the pot, or tap ingredients in order?
- `[OPEN]` Station ladder, shop unlocks and tutorial step in §2c.
- `[OPEN]` What "3 tiers of resting" means: the bed ladder has four (Bedroll, Cot, Bunk, Proper bed), and there are three rest places (checkpoint, camp, base).
- `[OPEN]` Stacking audit target: should the all-sources combination stay inside the band, or may it exceed it as a late-game reward?
- `[OPEN]` Speed bonus size (×1.5 starting value).

## 4. Watch for

- **A mini-game that's always better becomes a chore.** If cooking by hand is much faster, players feel they *must* do it. Keep the bonus modest.
- **Auto-cook draining stores.** "Greatest to least" must never empty the camp food the survivor needs for rest (FOOD-01 O9). Keep a reserve.
