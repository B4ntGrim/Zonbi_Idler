# BALANCE-03 — Round 8: pacing with regen, and the curse rerun (Oct 21)

**Status:** Claude Design pre-screen with a design model (`balance_regen_sim.py`, `curse_rerun.py`). No production code, spec or save changed. **Code's H2 harness is the authority**: §6 is the plan for Code's rerun.

**Why a new round:** every earlier BALANCE-03 round assumed the heal after a kill. Sam replaced it with out-of-combat regen on Oct 21 (FOOD-01 O1), so those results no longer describe the game.

## 1. Model

**Reused from records:** max HP 100; retreat at 30% HP (U27); Downed at HP 1 → Forced Retreat; near-death stress 1 / 1 / 3 at 25 / 15 / 5% HP, once per trip; a Forced Retreat tops the trip up to 5; resume gate 80% HP and stress < 50; Bedroll −20 stress a day; T0 / T1 damage per fight 6.9 / 13.5.
**Decided Oct 21:** regen full heal in about 60 s out of combat; no kill-heal; 5% of the meter per full heal; curse values (Hunted damage ×1.25 and over-tier ×2, Hollow food ×1.5). The model ran with a −25% Endurance XP offset, which Sam removed afterward (Oct 21).
**Assumptions:** tier mix 55 / 35 / 10; fight 4 s; walking drain 4 per hour; ration 25; walk home not timed.
**Not modelled (blind spots):** failed ventures, walking stress, policy multipliers, scouting. Round 5 found failed ventures became the largest stress source once the survivor was out longer, so **real field time will be lower** than shown here.
**Target:** field time 25–50% of the day (working band, still `[PROPOSED]`); Downings 2–5 a day (range used since round 2).

## 2. Pacing grid (7 days, 20 seeds; "interval" = average seconds between encounters)

| Interval | Stress | Field time | Downings / day | Rations / day | Endurance XP / day |
|---|---|---|---|---|---|
| 6 s | ×1 | 2.7% | 3.6 | 4.2 | 2,917 |
| 20 s | ×1 | 13.2% | 3.4 | 11.3 | 6,128 |
| 40 s | ×1 | 23.0% | 3.1 | 11.2 | 5,809 |
| **60 s** | **×1** | **30.9%** | **2.9** | **10.7** | **5,358** |
| **90 s** | **×1** | **40.9%** | **2.6** | **10.1** | **4,830** |
| 20 s | ×¼ | 42.0% | 10.2 | 36.0 | 19,415 |
| 40 s | ×¼ | 62.8% | 7.9 | 30.7 | 15,836 |

Steady state (days 3–7, after the first day's fresh stress budget is spent): 60 s gives about 21–24% field time; **90 s gives about 29–31%**.

## 3. Findings

1. **Regen removes the need to rescale stress.** Earlier rounds reached the target only with every stress gain cut to a quarter (round 5). With regen, the **decided stress values (×1)** reach the band at 60–90 s pacing. ×¼ now overshoots Downings (8–13 a day).
2. **Recommended pacing: an average of about 90 s between encounters.** It stays inside the band in steady state, with room for the stress from ventures and walking the model leaves out. 60 s falls just under 25% once day 1's budget is spent. Translating "90 s average" into EN3 values per familiarity is Code's job (round 3 tested EN3 ×4: cleared 240 s, explored 80 s, unexplored 32 s).
3. **Food demand is about 10 rations a day** at the recommended pacing. That is the supply target for cooking, foraging and fishing. One low-Foraging fishing visit (about 21 nutrition) covers under one ration.
4. **Endurance XP is about 4,800–5,400 per day.** On the candidate curve (150 × L^1.5) that is level 10 in about 4 days, level 20 in about 3 weeks, level 50 in about 7 months, and level 100 in about 3 years. The top of the curve needs a target before tuning.

## 4. Curse rerun at the recommended pacing (cursed days 3–5, same seeds uncursed)

| Pacing | Days 3–5 | Field time | Downings / day | Rations / day | Endurance XP / day |
|---|---|---|---|---|---|
| 90 s | uncursed | 30.3% | 1.9 | 7.5 | 3,594 |
| 90 s | **cursed** | **11.2%** | **2.7** | **5.2** | **1,520** |
| 90 s | days 6–7 after the curse | 31.3% | 1.8 | 7.7 | 3,686 |
| 60 s | uncursed | 23.7% | 2.2 | 8.1 | 4,094 |
| 60 s | cursed | 7.8% | 2.7 | 5.2 | 1,575 |

5. **The curse cuts field time by about two-thirds for its 3 days.** Harder fights mean more Downings, more stress, and more time resting.
6. **Over a whole day, the curse lowers food use** (7.5 → 5.2 rations). Hollow costs more per field hour, but the survivor spends far less time in the field. Hollow is barely felt at the day scale.
7. **The silver lining doesn't exist over a day.** Per field hour, Hunted raises Endurance XP by about 53%. Per day, cursed Endurance XP falls by **58%** because the survivor is out so much less. The −25% offset was sized on per-hour data, so it deepens a loss rather than trimming a gain. **Corrected Oct 21 after the offset was removed:** the cursed figure in §4 (1,520) includes the −25%. Without it, cursed Endurance XP is about 2,030 a day (−44%). Over 3 days that is about 4,700 below uncursed; the decided Endured reward (about 3,600) brings the net to about −1,100.
8. **No lingering effect.** Days 6–7 return to normal. No spiral.

**Lesson:** measure at the scale the player lives in. An idler is felt per day, not per field hour. Both curse surprises (Hollow and the Endurance offset) come from switching between those two scales.

## 5. Recommendations for Sam

| # | Item | Recommendation |
|---|---|---|
| R1 | Pacing (FOOD-01 O3) | About 90 s average between encounters, stress ×1, pending Code's harness |
| R2 | Endurance offset while cursed | **Resolved Oct 21 (Sam), `[DECIDED Oct 21]`:** −25% removed; unlisted "Endured" reward of about one day's Endurance XP (about 3,600) when the curse runs its full course |
| R3 | Hollow | Keep, but know it's mild over a day; its real weight is between runs, in supplies |
| R4 | Hunted strength | ×1.25 costs about two-thirds of field time for 3 days. Consider 2 days, or ×1.15, if playtesting finds it too harsh |
| R5 | Food supply target | About 10 rations a day at the recommended pacing |

## 6. Plan for Code's rerun (H2 harness, read-only)

- **Build:** current production with an in-memory regen model (full heal 60 s out of combat; no kill-heal; no in-combat recovery).
- **Runs:** 4 starts × 5 seeds (101–505) × 7 days, ethical policy, returns every 8 h, traversal on. Then the best set under all four policies.
- **Grid:** EN3 ×2, ×3, ×4; stress ×1 and ×⅓.
- **Report per day:** field time, full Downings, rescues, rest by cause (stress / HP), stress by source (including failed ventures and walking), nutrition used, Endurance-eligible damage taken.
- **Scouting (added Oct 21):** report the real base discovery chance and scouts per day, then the cursed-scouting loss with the decided guards (fade 20 / 10 / 5, floor 80%, story/quest/Fort exempt). Code's real base chance **replaces** the 30 / 50 / 70% test values in `scout_sim.py`.
- **Then:** the curse on days 3–5 at the best pacing, with the decided "Endured" reward (about 3,600 at full course), and report net Endurance XP over the curse against uncursed.
- **Stop and report** if any decided rule can't be modelled in memory.
- **Oct 26 inputs (FOOD-01 O3a–O3c):** Sam set a 60 s base with familiarity scaling (about 40 / 60 / 90 s) as the starting value. Include 60 s and 90 s bases in the grid, report steady-state days 3–7 separately, and report Downings per km (B1, the main target) and rations per day (for F18 container sizes).

## 7. Reflection: improving Endurance XP and "deprivation gains" (for the Endurance slice)

What this conversation's models taught, and what it suggests. All `[PROPOSED]`.

| # | Lesson | Proposal |
|---|---|---|
| E1 | Raw damage taken rewards being hurt, and regen now turns damage into food cost | Endurance XP from **damage taken plus damage absorbed** by armor (a share of the blocked amount). Defense-focused players train the skill that means defense to them |
| E2 | The curse showed per-hour gains can be per-day losses | Size every Endurance XP rule against **XP per day**, not per field hour |
| E3 | Players read Endurance as "enduring hardship" | **Deprivation gains:** a small, capped trickle of Endurance XP for active field time spent Hungry, Stressed or Cursed. Only while wandering; never while resting or Starving at base, so starving on purpose can't farm it |
| E4 | A hidden offset can backfire | **"Endured" lump** when an affliction (curse, injury) runs its full course: a moment the player can discover. Decided for the curse Oct 21 (R2); injury still a proposal |
| E5 | The curve's top is unreachable without a goal | Set a target first, for example "level 50 in about 6 months of normal play", then fit the curve to the measured XP per day |

**Watch for:** E1 and E3 add XP sources, so the curve must be fitted after they exist, not before.
