# STAT-02 — Audit of placeholder numbers (Oct 28, 2026)

**Asked by Sam:** "Leave the audit to figure out the numbers." Playtesting happens later, when Sam is ready.

**Method:** every number below was run through the game's own code in a headless copy of the game: the Wandering simulation, the combat simulator and the stat-pick simulator. Nothing was guessed from memory.

---

## 1. Main level from skill XP (Sam, Oct 28)

**Rule:** all profession XP adds up into one pool. A hidden formula turns the pool into main-level XP:

`main XP = 111.848 × (total skill XP)^0.87`

**How it was set:**
- 5 Wandering runs of 300 hours each, with a survivor carrying no gear.
- A player earns about 345,500 skill XP in 300 hours (median of the 5 runs), at the new Oct 28 walk pace of 1.4 m/s.
- The rate climbs gently over the run.
- The first fit (117.553 × S^0.86, at the old 3 m/s walk) was redone when the walk pace changed.
- The formula was searched until every milestone matched the locked hours table.

| Level | Locked target | Simulated (median) |
|---:|---:|---:|
| 25 | 2.1 h | 2 h |
| 50 | 12.3 h | 12 h |
| 75 | 61.7 h | 60 h |
| 90 | 159.5 h | 162 h |
| 100 | 300 h | 301 h |

Every milestone is within 4% of target.

**Other effects:**
- **Wandering score:** the banked Wandering score no longer adds to the main level directly. Its kills already give combat XP, so it would have counted twice. Before this change, main XP only went up when the survivor was downed.
- **Existing saves:** a save keeps its level. It continues on the curve from the skill total that matches its current XP.
- **Skill decay:** rust never lowers the main level.

**Watch in playtest:** gear and routes will raise skill XP per hour, so real players may level faster than a survivor with no gear. The formula is two numbers in one config line, easy to retune.

## 2. Stat picks after hiding Shield and Movement Speed

**The problem:** with 8 offered stats instead of 10, Damage appears in more offers. A damage build would cap at **level 76 (about 66 hours)**. That misses the locked target of the Specialize phase (115–200 hours).

**What was tested (4,000 runs each):**

| Option | Damage cap (median) | Never cap | Notes |
|---|---:|---:|---|
| Keep everything | L76 · 66 h | 0.1% | Misses target |
| Weaker safety net (any value) | L76 | ≤1% | No effect |
| **Ranks to cap 24 → 30** | **L90 · 160 h** | **8.6%** | **Applied**: same result as the locked design |
| Even-only picks to L70 | L91 · 170 h | 7.9% | Cuts picks from 91 to 74 |
| Even-only picks to L60 | L87 · 132 h | 2.8% | Cuts picks to 79 |

**Applied:** 30 hidden ranks per stat. Picks, cadence, checkpoints and safety net are all unchanged. Players never see ranks, so each card's step is simply a little smaller.

**Needs Sam's OK:** the original draft said 24 ranks. Balanced and survival builds still never cap a stat.

## 3. Status effects (combat-simulator checked)

**The problem:** in the old placeholders, Hunger and Rest mostly changed Attack Speed and HP Regen. Attack Speed only decides who strikes first, so being Hungry + Fatigued made **no difference** in a fight. Good states did nothing either.

**The fix:** moved part of each effect onto Damage and Evasion, then softened the severe tiers so the worst case is hard but not helpless.

**Test setup:** 4,000 fights per row, a mid weapon, against zombie tiers 2 (easy) and 6 (hard).

| State | Old win % (T6) | New win % (T6) | New win % (T2) |
|---|---:|---:|---:|
| Neutral | 82 | 82 | 100 |
| Well Fed + Rested | 82 | **84** | 100 |
| Hungry + Fatigued | 82 | **75.5** | 100 |
| Hungry + Fatigued + Wounded | 75 | **68** | 100 |
| Starving + Exhausted | 75.5 | **70** | 100 |
| All severe at once | 35 | **39** | 99.7 |

New values (also in `game/progression.js`):

| Track | Tier | Effect |
|---|---|---|
| Hunger | Well Fed | HP Regen +10%, Damage +4% |
| Hunger | Hungry | HP Regen −10%, Damage −6% |
| Hunger | Starving | HP Regen −25%, Damage −9%, Max HP −5% |
| Rest | Rested | Evasion +15%, Attack Speed +5% |
| Rest | Fatigued | Evasion −20%, Damage −4% |
| Rest | Exhausted | Evasion −30%, Damage −7%, Attack Speed −15% |
| Wounds | Scratched | HP Regen −5% |
| Wounds | Wounded | Max HP −10%, Damage −3% |
| Wounds | Badly Hurt | Max HP −20%, Damage −5% |
| Sickness | Queasy | HP Regen −5% |
| Sickness | Sick | HP Regen −15%, Damage −5% |
| Sickness | Feverish | HP Regen −30%, Damage −5%, Crit Chance −20% |
| Morale | Uneasy | Crit Chance −10%, Evasion −5% |
| Morale | Shaken | Crit Chance −25%, Evasion −10%, Damage −3% |

Peckish, Tired, Healthy and Steady are neutral. Stacking stays at ±15% per extra state.

## 4. Tiredness, nap and food

| Number | Old | New | Why |
|---|---|---|---|
| Tiredness speed | 1 tier per 2 game days (48 min) | **1 tier per 6 game days (~2.4 real h)** | Sam: build more slowly. Fatigued now arrives after about 4.8 h of play from fully rested, so one Make camp a day plus naps is enough |
| Nap at base | — | **+1 tier of rest, costs 2 game hours (2 real min), any time at base or camp** | Sam: nap at the forward base, shorter than camping |
| Food value | 30 per item | **25 per item** | One food item = one game day of hunger = one tier. It matches the hunger speed Sam set |
| Meals while away | 3 | 3 (kept) | Enough to go from the Hungry floor back to Well Fed |
| Sleep while away | after 8 game h | 8 game h (kept) | That is 8 real minutes away; matches "slept at camp" |

## 5. Auto-Eat price

**Rule:** Auto-Eat stays a Shop item paid in RMAT (Sam, Oct 28).

**New price:** **5 T1 RMAT**, unlocking at **500 m** (was 6 T1).

**Why:**
- It is the first quality-of-life item a player needs. A new survivor turns Hungry about 20 minutes in.
- So it is priced with the cheapest early items: Backpack (5 T1 at 1,000 m) and Medkits (4 T1 at 1,500 m).
- 500 m is about 1 to 1.5 hours of Wandering.

**Not measured:** Wandering salvage is metal only, so real early RMAT income comes from recycling, routes and contracts. Check the price against the BAL-03 sim harness on your computer, or in playtest.

---

## 6. Blocker found by the audit (needs Sam)

**There is no repeatable food source in the live game.**
- Wandering returns only metal salvage.
- Route "Canned food" becomes recycler salvage, not a food item.
- The only real food is the 2 starter rations.

**What this means:** with hunger at one tier per game day, a new survivor (starting at Peckish) turns Hungry after about 20 minutes of play and Starving after about 43 minutes, then stays Starving while online. Away from the game, the floor stops at Hungry.

**Options:**
- **A:** make route and POI food drops real food items.
- **B:** bring forward FOOD-02 cooking and fishing.
- **C:** slow hunger until a food source ships.

The audit did not change your hunger speed, because that was your decision.

## 7. Still placeholder after the audit

- Sickness has no live source, so it stays Healthy.
- Shield and Movement Speed are hidden until they have a job.
- Real RMAT income versus the Auto-Eat price.
