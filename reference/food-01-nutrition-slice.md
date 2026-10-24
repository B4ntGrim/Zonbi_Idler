# FOOD-01 — Nutrition and HP recovery (slice brief)

**Status:** slice draft. O1, O2, O4, O5, O7, O8, O9 and O10 locked Oct 21; O3 and O6 open. The batch goes to Code once those close.
**Date:** Oct 21
**Evidence:** `food-01-sim-oct21.md` (design model, `food_sim.py`)

---

## 1. Next slice

Give food a job. HP recovery in the field costs nutrition, and a free auto-eat policy keeps the survivor fed.

**Why now:** food touches stress, Endurance, route changes and retreats. Endurance XP (FOOD-01's follow-up slice) is balanced against nutrition, so "fed" and "hungry" must exist first.

**What this reuses (no new concepts):**
- the **Food** paperdoll slot (quick-use, one stack, no pocket) `[DECIDED]`, spec §14.1;
- route changes already cost **stamina or nutrition**, spec §13.4;
- **fish give nutrition** through Foraging, `poi-framework-v1-brief.md`;
- **rations** already exist as items (the Jester's reward) `[CODE]`;
- **auto-retreat** and the **Downed** path (U5, U27).

---

## 2. Decided constraints

| Rule | Source |
|---|---|
| HP never falls below 1; reaching 1 Downs the survivor | U5 `[DECIDED Oct 10]` |
| Retreat setting decides withdrawal; resume gate 80% HP and stress < 50 | U27 `[DECIDED Oct 10]` |
| Never sell relief from a pain the design created | Lead brief 5.1 |
| Every prompt has a timer and a policy default; nothing waits on the player | Design rules §4.5 |
| Food is a commodity the player learns to balance | `[CONCEPT Oct 21]` Sam |
| Basic auto-eat is tied to normal HP recovery | `[CONCEPT Oct 21]` Sam |
| Eat-while-walking and auto-forage are RMAT shop unlocks | `[CONCEPT Oct 21]` Sam |
| Crafting tab gains food recipes | `[CONCEPT Oct 21]` Sam |
| Foraging ties to Traversal, small quests and general wandering | `[CONCEPT Oct 21]` Sam |
| **Out-of-combat regen replaces the heal after a kill.** Supersedes the Oct 18 "tie the heal to the zombie" direction | `[DECIDED Oct 21]` Sam (O1) |
| **A full heal costs 5% of the Nutrition meter** | `[DECIDED Oct 21]` Sam (O2) |
| **Base rest uses camp food,** not the survivor's meter, so an overnight absence can't leave the survivor Starving | `[DECIDED Oct 21]` Sam (O4) |
| **Camp food = food items in the base stash**, shown in Stockpile. Resting eats from it (starting value 1 ration per 8 h of rest). With none left, rest still works: the meter drains slowly and recovery follows the Hungry / Starving multipliers, never zero. Offline follows the 24 h cap | `[DECIDED Oct 21]` Sam (O9) |
| **Caught fish go into the Food slot as items** (not converted to nutrition on the catch); auto-eat uses them | `[DECIDED Oct 21]` Sam (O7) |
| **Fish beyond one stack:** a free pocket first, otherwise the Wandering haul, then into the stash when banked at base | `[DECIDED Oct 21]` Sam (O10) |
| **Legendary fish: fixed 30 nutrition** | `[DECIDED Oct 21]` Sam (O8); rarity 80 / 17 / 3 stays `[PROPOSED]` |
| **Fish nutrition by rarity:** common 10, uncommon 15, legendary 25–30 (legendary value under test) | `[DECIDED Oct 21]` Sam (O5); legendary `[PROPOSED]` |

---

## 3. Proposed rules `[PROPOSED]`

| # | Rule | Why |
|---|---|---|
| P1 | A **Nutrition** meter, 0–100, per survivor | One number the player can read at a glance |
| P2 | **HP recovery costs nutrition.** Each HP regained spends a fixed amount | Links damage to food; Endurance then saves food |
| P3 | **Out-of-combat recovery**, set as time to full HP (starting value 60 s) | Stays correct if max HP grows later |
| P4 | **No in-combat recovery** in this slice | Fights stay dangerous; the model shows it only lengthens runs and costs more food |
| P5 | Three states: **Fed ≥ 40 · Hungry 1–39 · Starving 0**. Recovery ×1 · ×0.5 · ×0.1 | Starving is slow, never zero, so a Downed survivor always recovers (no dead end) |
| P6 | **Basic auto-eat, free and on by default.** Below the threshold, the survivor eats from the Food slot | The policy decides; nothing waits on the player |
| P7 | Walking drains a small amount of nutrition per field hour | Food matters even on quiet runs |
| P8 | Shop items sell **efficiency only** (eat while walking, auto-forage), never basic auto-eat or food | Business-model rule 5.1 |

### Starting values (data table, tunable)

| Value | Start | Model note |
|---|---|---|
| Time to full HP, out of combat | 60 s | Same result as 5 HP/s at 40 s pacing |
| Nutrition per full heal | **5%** of the meter `[DECIDED Oct 21]` | 20% needed about 5 rations an hour; 5% about 2 |
| Walking drain | 4 per field hour | |
| Auto-eat threshold | 40 | |
| Ration restores | 25 | |
| Hunger recovery multipliers | 1 / 0.5 / 0.1 | |

### Fish values (fishing data table; used by the Water POI, not built in FOOD-01)

| Fish | Nutrition | Chance per fish | Tag |
|---|---|---|---|
| Common | 10 | 80% | value `[DECIDED Oct 21]`, chance `[PROPOSED]` |
| Uncommon | 15 | 17% | value `[DECIDED Oct 21]`, chance `[PROPOSED]` |
| Legendary | 30 (fixed) | 3% | value `[DECIDED Oct 21]`, chance `[PROPOSED]` |

*Why fixed 30:* the test showed 25, 30 or a rolled 25–30 change the average per visit by under 2 nutrition. The legendary value is a feeling, not a supply lever, so the bigger fixed number reads best in the log and beats a ration (25).

---

## 4. Open decisions

| # | Question | Recommendation |
|---|---|---|
| O3 | **Encounter pacing.** Food cost follows pacing | Design pre-screen (BALANCE-03 round 8, Oct 21): about **90 s average** between encounters hits the field-time band with decided stress values; food demand about **10 rations a day**. Awaiting Code's H2 rerun |
| O6 `[CODE]` | Does a nutrition or stamina value exist today? What does a ration do? Current field HP recovery rate and its file? | Code answers in step 1 |

---

## 4a. Stockpile direction `[CONCEPT Oct 21]` (Sam)

Stockpile becomes the home of everything at base: **Recycler, Storage, Food, and possibly Items**, with one page that lists all **weapons, armor, gear, items and food**, organised alongside crafted gear and loadout (equip) and carrying pockets (take).

- `[CODE]` today: Stockpile has two sub-views, Recycler and Storage (materials, carrying, crafted-gear loadout with equip and repair) (tutorial spec §7.1).
- **Reuse:** the base **stash** stays the data store; Stockpile is the screen that shows it. Camp food is stash food, so FOOD-01 needs only a camp-food count in Stockpile. The full category page is its own UI slice, **STOCK-01** (`stock-01-stockpile-concept.md`), not part of FOOD-01.

## 5. Parked

- Food spoilage.
- Cooking recipes in the Crafting tab (next food slice; ingredients by biome).
- Foraging by biome on Traversal cells, faction food quests.
- RMAT shop unlocks: eat while walking, auto-forage.
- Damage types and resistances.
- Endurance XP and damage reduction (FOOD-01 follow-up). Curve candidate: power curve `150 × L^1.5`, not exponential (see model §6).

---

## 6. Spec impact

- `wandering-tab-spec.md` §13.4 (route-change cost names nutrition), §13.8 (stress and comfort food), §14.1 (Food slot behavior).
- New spec section: **Nutrition**.
- `poi-framework-v1-brief.md`: fish nutrition values and storage (updated Oct 21).
- Tutorial spec §7.1 (Stockpile) when STOCK-01 is written.
- `balance-03-round2-oct17.md`: the Oct 18 heal-tied-to-the-zombie decision marked superseded (done Oct 21).

---

## 7. Proposed batch — draft `CURRENT_BATCH.md`

> Draft only. Behavior lines become `[DECIDED]` when Sam locks them; until then this batch must not go to Code.

### BATCH FOOD-01 — Nutrition and HP recovery

**Goal.** Out-of-combat HP recovery spends nutrition. A free auto-eat policy refills it from the Food slot. Hunger slows recovery but never stops it.

**Decided behavior:** the `[DECIDED Oct 21]` rows in §2 (regen replaces the heal after a kill; 5% per full heal; base rest uses camp food). P1–P8 join them once O3 (Code's rerun) and O6 (Code's facts) close.

Also: **remove the heal after a kill** wherever it exists in code or test fixtures (Code confirms in step 1).

**Likely files.** `game/wandering.js` (field recovery, encounter loop) · `game/stats.js` (nutrition state, shared recovery rule) · `game/items.js` (ration nutrition value) · `screens-v3.jsx` (meter, state icon, Stockpile camp-food count) · new `tests/food-01-nutrition.test.js` · `CODE_STATE.md`.

**Step 0.** Baseline: all suites; preserved build for a differential; hashes of the files above.
**Step 1.** Answer O6 with file:line evidence, and list every path that heals after a kill. **Stop and report** if nutrition or stamina already exists with different rules.

**Acceptance checks**
1. Out of combat at Fed, HP rises from 1 to 100 in 60 s (±1 s).
2. No HP recovery during a fight, and none after a kill.
3. A full heal from 1 HP spends 5 nutrition (±0.1).
4. At Hungry, recovery takes twice as long; at Starving, ten times as long, and it still reaches full HP.
5. With nutrition below 40 and a ration in the Food slot, the survivor eats once; nutrition rises by 25; the stack drops by 1.
6. With the Food slot empty, no error; the survivor keeps wandering and becomes Hungry.
7. Walking 1 field hour with no damage spends 4 nutrition (±0.1).
8. **Parity:** watched, background and offline processing give identical nutrition, HP and ration counts for the same seed.
9. Nutrition never goes below 0 or above 100; HP never below 1 (FX1 regression).
10. **Camp food:** 8 hours of base rest with rations in the stash eats 1 ration from the stash and leaves the survivor's meter unchanged.
11. **Empty stash:** base rest still reaches the resume gate; the meter drains slowly and recovery uses the Hungry / Starving multipliers. Offline rest respects the 24 h cap.
12. **Stockpile** shows the camp-food count, and it matches the stash.
13. **Regression:** all suites pass.

**Smoke test (Sam, browser, TEST SAVE):**
1. Start a run with 2 rations in the Food slot.
2. Take a hit; watch HP refill between fights and the meter drop.
3. Let the meter cross 40; confirm a ration is eaten and logged.
4. Remove food; confirm the Hungry icon and slower recovery.
5. Reload; confirm nutrition and the ration count persist.
6. Rest at base overnight with rations in the stash; confirm the Stockpile food count drops and the survivor isn't Hungry on return.

**Explicitly out.** Cooking, foraging changes, shop unlocks, spoilage, Endurance XP, damage types, stress changes, encounter pacing.

**Required verification.** Code's completion report with each check's result; H2 harness rerun reporting rations per field hour and run length; `FOOD-01: CLOSED` or `NOT CLOSED`.
