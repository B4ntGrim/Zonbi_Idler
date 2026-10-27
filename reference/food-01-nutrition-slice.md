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
| P6 | **Basic auto-eat, free and on by default.** Below the threshold, the survivor eats from the Food slot (order and containers: F2, F5, F17, F18, Oct 26) | The policy decides; nothing waits on the player |
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
| Legendary | 30 (fixed) | ~~3%~~ 0.1% per roll | value `[DECIDED Oct 21]`; chance `[DECIDED Oct 27, Sam, starting value]`, supersedes 3%. `[OPEN]` rerun the fish sim: Common/Uncommon shares and visit estimates assumed 3%; more tiers coming (`parked/fish-01-fishing-concept.md` §2) |

*Why fixed 30:* the test showed 25, 30 or a rolled 25–30 change the average per visit by under 2 nutrition. The legendary value is a feeling, not a supply lever, so the bigger fixed number reads best in the log and beats a ration (25).

---

## 3b. Decisions (Sam, Oct 26)

Recorded from Sam's voice sessions of Oct 26 (instruction docs "Zed Idler — Code Instructions Oct 26", Addendum and Addendum 2). Values are starting values unless marked otherwise.

### Top bar, auto-eat and fruit
| # | Rule | Tag | Why |
|---|---|---|---|
| F1 | **Top bar:** Nutrition shows this slice's meter (0–100) with Fed / Hungry / Starving; Medicine shows heal charges (kit + base). Any bar value with no system is hidden until one uses it. Display form: NB1 | `[DECIDED Oct 26]` | The bar must not show dead numbers |
| F2 | **Auto-eat eats the lowest-value food first.** The policy text says so; each meal is logged; a low-food warning shows on the Nutrition bar under 2 meals left. Nothing waits on the player | `[DECIDED Oct 26]` | Saves the good food; fair warning without a prompt |
| F3 | **Fruit nutrition:** apple 8, orange 8, grapes 6, raisins 8. Raisins are made by drying grapes (a simple recipe; FOOD-02 stays parked) | `[DECIDED Oct 26, starting values]` | Drying mainly buys shelf life |
| F4 | **Foraging finds** are variants of the existing "Abandoned farm" (Ethical) and "Undefended field" (Immoral) encounters (spec §2.3): orchard and vineyard. Unlock by Foraging level: apples 5, oranges 10, grapes 12. Finds appear in the log; higher Foraging finds more fruit | `[DECIDED Oct 26]` | Reuse before inventing (rules §4.3) |

### Comfort food, cola and cans
| # | Rule | Tag | Why |
|---|---|---|---|
| F5 | **Comfort food:** foods may carry a comfort value that lowers stress when eaten. Raisins −3, oranges −2, apples and grapes 0. Auto-eat picks comfort food first when stress is above 70; otherwise F2. **Daily cap: 5 stress per real day** (FOOD-02 §1a, audited; the −10 wording is superseded, Oct 26 PM). The Legendary Lunch Pail raises it to 8 | `[DECIDED Oct 26, testing values]` | Ties to spec §13.8 comfort food |
| F6 | Oranges may later reduce sickness or infection risk. Not built until a sickness system exists | `[CONCEPT, PARKED]` | — |
| F7 | **Cola:** comfort food, −5 stress, 2 nutrition. Found only, never crafted. Rare roadside find (gas stations, stalled trucks, the "Broken-down vehicle" encounter and roadside policy events), about 2% on a successful search. Auto-eat uses it only when stress is above 70 | `[DECIDED Oct 26, testing values]` | A treat, not a meal |
| F8 | **Empty can:** the usual find at vending machines and trash bins. Scrap; banks to the Recycler as aluminium | `[DECIDED Oct 26]` | Makes the sealed can mean something |
| F9 | **Easter egg "The last can":** **0.02%** per vending-machine find (supersedes 0.5%), at most once per save. A sealed can (cola). Original log line, e.g. "One can left. You save it for later." Homage only: no brand names or quoted text from any book (rules §4.7) | `[DECIDED Oct 26, testing values]` | Finds are common, so 0.02% lands after roughly 14 hours of Wandering |
| F10 | **Hidden achievement "Can I get a number one?":** a burger, fries and a cola eaten within one game hour. Hidden until earned. Burger and fries carry both Food and Component tags. Inactive until FOOD-02 adds burgers and fries. *Watch:* a game hour is one real minute, so this needs manual eating or a deliberate auto-eat sequence | `[DECIDED Oct 26]` | — |
| F11 | **Background scavenging finds:** vending machines and trash bins are common background finds, not POIs or prompts. They resolve on their own as a log line. Each gives one piece of metal (aluminium scrap, weight only, banks via the Recycler). Frequency **about one per 90 s of Wandering** `[DECIDED Oct 26, PM]` (supersedes one per 10 game minutes): about 960 finds a real day; the last can (0.02%) lands after about 5 days of nonstop wandering | `[DECIDED Oct 26]` | Idle-friendly; attention stays on rare moments (rules §4.5) |
| F12 | **Scavenging XP:** each find grants a small amount of Scavenging XP through `ZI.emitAction` and resets Scavenging's decay clock (spec 3.3). Amount `[OPEN]`, listed in `wandering-design-audit.md` §6 | `[DECIDED Oct 26]` | Frequent finds could inflate Scavenging |

### Food groups, variety and containers
| # | Rule | Tag | Why |
|---|---|---|---|
| F13 | **One healing path:** food never heals HP directly. Food fills the meter; nutrition pays for out-of-combat recovery (P2/P3). Cooked dishes are worth more than their ingredients through more nutrition plus a bonus (e.g. raw potato about 5; steak and potatoes about 35 plus comfort or a short buff, `[PROPOSED]`, FOOD-02) | `[DECIDED Oct 26]` | A second heal path would duplicate med kits and drift (rules §4.3) |
| F14 | **Food groups:** every food item carries one group tag. Staples (potatoes, bread, rations): high nutrition, no extras. Protein (meat, fish): small recovery boost. Produce (fruit, vegetables): lighter; oranges link to F6. Dairy (mostly preserved: powdered milk, hard cheese, canned butter): slows nutrition drain for a while. Treats (cola, raisins): low nutrition, lower stress (F5). Numbers wait for FOOD-02 | `[CONCEPT Oct 26]` | Gives food a second dimension besides how filling it is |
| F15 | **Variety bonus "Well Nourished":** 3 groups eaten in one day: +5% damage, +5 max HP; all 5: +10% damage, +10 max HP; recalculated each day. Uses the shared buff store and simulation time (FX3). **Counted over one real day** `[DECIDED Oct 26, PM]`, the unit of the food stress cap | `[DECIDED Oct 26]`; values `[PROPOSED]` | Sam's priority: a varied diet makes a stronger survivor |
| F16 | **Wandering icon:** Well Nourished shows in the BAL-A status-icon row: an icon while active, five dots (one per group, filled when eaten that day), tap or hover for the bonus and time left | `[DECIDED Oct 26]` | — |
| F17 | **Auto-eat order:** default stays cheapest first (F2), with the F5 comfort rule above stress 70. A Shop unlock (RMAT) switches to variety first (a missing group first, then cheapest). Auto-eat draws from the Food slot's container | `[DECIDED Oct 26]` | Sells convenience, not relief (lead brief 5.1; P8) |
| F18 | **Food containers** go in the Food slot with a food-carrier tag. Capacity is total meals plus a cap on food types; stacks inside have no limit. Lunch bag: 6 meals, up to 4 types, 0.3 kg, early craft or find. Lunch pack: 12 meals, up to 6 types, 0.8 kg, mid craft. Cooler: 28 meals, up to 9 types, top tier, later craft; slows spoilage once spoilage exists; weight `[PROPOSED about 5 kg]`. No container: 1 stack, as today. Other consumables keep the normal stack rule (spec 14.8 #2). Not to be confused with the Legendary Lunch Pail (FOOD-02 §2b-i), a Trinket | `[DECIDED Oct 26]` | Sized to about half a day, one day and 2.5 days at about 11 meals a real day; **to be resized for the three-meals target** after the round 8 rerun, so food stays a planning limit for 24 h circuits (C12, C21). The lunch bag can't hold all 5 groups |

### Pacing, stamina and the bar (closes O3)
| # | Rule | Tag | Why |
|---|---|---|---|
| O3a | **Base pacing: 90 s average between Wandering encounters** `[DECIDED Oct 26, PM]` (supersedes 60 s; code today `encounterEverySec: 6`). Data-table value | `[DECIDED Oct 26, starting value]` | Round 8: 60 s falls under the field-time band in steady state; 90 s holds about 29–31% |
| O3b | **Familiarity scaling** (`ZI.cellFamiliarity`, spec 13.8): uncleared about 60 s, explored 90 s, cleared about 135 s (supersedes 40 / 60 / 90) | `[PROPOSED]` | Dangerous ground feels busy, home ground calm |
| O3c | **Confirmation:** Code's round 8 rerun in H2 (round 8 §6) with O3a/O3b, plus Sam's smoke test for feel. Re-check F18 container sizes against the measured rations per day | `[DECIDED Oct 26]` | — |
| ST1 | **No separate stamina meter.** Stamina is the combat effect of the hunger states (P5). Fed: normal attack speed and evasion. Hungry: −25% attack speed, slightly lower evasion. Starving: −40% attack speed, lower evasion again | `[DECIDED Oct 26]`; values `[PROPOSED]` (Sam suggested −25 to −30%) | One food number; food now matters in fights |
| ST2 | Spec 13.4's "stamina or nutrition" route cost reads as nutrition; "stamina" wording superseded | `[DECIDED Oct 26]` | Follows ST1 |
| NB1 | **One layered bar** (top bar and Wandering): green fill = nutrition 0–100; blue layer = nutrition the carried food would add; outline colour = hunger state (normal / amber / red when the ST1 penalty applies) | **`[PROPOSED]` until Sam sees the mock-up** (Sam asked to see it before locking) | One place to read food, supply and penalty |

**O3a conflict resolved Oct 26 (PM):** Sam moved the base to 90 s with familiarity 60 / 90 / 135 s.

**Meals target `[DECIDED Oct 26, PM]`:** about **three meals per real day** (supersedes the ~11 rations a day sizing). `[OPEN]` How food reaches that (meal value, nutrition per full heal, walking drain), set with the round 8 rerun; then resize F18 (6 / 12 / 28 meals).

## 4. Open decisions

| # | Question | Recommendation |
|---|---|---|
| ~~O3~~ | ~~**Encounter pacing.**~~ **Decided Oct 26 as O3a–O3c (§3b).** See the conflict note there: round 8 recommended 90 s; Sam chose 60 s with familiarity scaling | — |
| O6 `[CODE]` | Does a nutrition or stamina value exist today? What does a ration do? Current field HP recovery rate and its file? **Extended Oct 26 (ST3):** does an attack-speed stat exist, where does evasion come from (gear bonuses and anything else), and can attack speed take a multiplier? Stop and report if a stamina system already exists with different rules | Code answers in step 1 |

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
