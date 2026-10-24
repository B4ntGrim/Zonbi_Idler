# FOOD-01 — Design model results (Oct 21)

**Status:** design model only. No game code, balance value, spec or save changed. Code's H2 harness is the authority once FOOD-01 is built.

**Script:** `food_sim.py` (Python, 200 seeds per row, seeds 101–300).

## 1. What the model reuses

| Fact | Source |
|---|---|
| Max HP 100 | FX1, D7 HP-max check |
| Downed at HP ≤ 1; retreat setting default 30% | U5, U27 |
| HP lost per fight from full HP, Nail Bat, no jacket, 95% hit: tier 0 = 6.9, tier 1 = 13.5 | `zombie-accuracy-sim-oct17.md` |
| Heal tied to the zombie (test value 25% of that zombie's damage) | Decided direction Oct 18, `balance-03-round2-oct17.md` |
| Production encounter interval 6 s; EN3 explored 20 s (×2 = 40 s) | `best1-pre-balance-03-plan.md`, round 3 |

## 2. Assumptions (labelled, not facts)

| Assumption | Value |
|---|---|
| Fight length | 4 s |
| Early-game tier mix | 55% T0 · 35% T1 · 10% T2 |
| T2 mean damage per fight | 45 |
| Damage spread | mean × Gamma(2, 0.5) |
| Nutrition meter | 0–100, start 100 |
| Healing cost | full heal = 20% of the meter (0.202 per HP) |
| Walking drain | 4 per field hour |
| Auto-eat | below 40; a ration restores 25 |
| Hunger effect on recovery | Fed ×1 · Hungry ×0.5 · Starving ×0.1 (never zero) |

**Not modelled:** stress (the real limit on field time in BALANCE-03), heal charges, Medkits, armor, Endurance damage reduction.

## 3. Recovery models

| ID | Recovery |
|---|---|
| M0 | Today's direction: heal 25% of the zombie's damage after each kill; no regen |
| M1 | Sam's proposal: 5 HP/s out of combat only |
| M2 | 5 HP/s in and out of combat |
| M3 | Full heal in about 60 s out of combat (1.65 HP/s) |
| M4 | M3 plus slow in-combat recovery (0.5 HP/s) |

## 4. Results (mean per field run)

### Production pacing (an encounter every 6 s)

| Model | Run length | Downed | HP lost / h | Nutrition / h | Rations / h |
|---|---|---|---|---|---|
| M0 | 1.4 min | 22% | 4,487 | 203 | 0 |
| M1 | 8.0 min | 40% | 4,683 | 813 | 21.0 |
| M2 | 15.8 min | 40% | 4,688 | 882 | 28.2 |
| M3 | 3.7 min | 26% | 4,481 | 624 | 7.0 |
| M4 | 4.6 min | 34% | 4,577 | 701 | 11.7 |

### EN3 explored ×2 (an encounter every 40 s)

| Model | Run length | Downed | HP lost / h | Nutrition / h | Rations / h |
|---|---|---|---|---|---|
| M0 | 6.1 min | 22% | 1,020 | 49 | 0 |
| M1 | 39.2 min | 42% | 1,061 | 190 | 5.4 |
| M2 | 71.7 min | 38% | 1,062 | 204 | 6.6 |
| M3 | 39.2 min | 42% | 1,061 | 190 | 5.4 |
| M4 | 42.5 min | 40% | 1,062 | 193 | 5.6 |

## 5. Findings

1. **Fast recovery works: runs last 5–6× longer** (M1 against M0). This is the first lever in any record that moves time in the field this much.
2. **Food cost follows encounter pacing, not recovery speed.** HP lost per hour is the same in every model at the same pacing. At 6 s pacing the survivor would need about 21 rations an hour. At 40 s it needs about 5. **The food slice can't be tuned until BALANCE-03 sets encounter pacing.**
3. **Rate and price are separate (confirmed).** At 40 s pacing, M1 (5 HP/s) and M3 (1.65 HP/s) give identical results, because both refill fully between fights. Speed only matters when gaps are short.
4. **Recovery doesn't stop Downings.** About 40% of runs still end Downed, from single large tier-2 hits. Only damage reduction (Endurance, armor) answers a spike. This is the link between the food slice and the Endurance slice.
5. **In-combat recovery does not raise damage taken per hour,** so it is not an Endurance XP farm by rate. It does lengthen runs and raise food use. Food acts as the brake. Correction to the earlier chat note: the risk is "fights stop feeling dangerous," not "infinite XP per hour."
6. **The 20% cost target is too expensive** at either pacing. 5 rations an hour over an 8-hour idle stretch is 40 rations. Candidate: about 5% per full heal (roughly 2 rations an hour at 40 s pacing, including walking drain).

## 6. Endurance XP curve (HP lost needed)

| Level | Exponential (150, then ×3.33) — cost / total | Power curve (150 × L^1.5) — cost / total |
|---|---|---|
| 1 | 150 / 150 | 150 / 150 |
| 2 | 500 / 650 | 424 / 574 |
| 5 | 18,519 / 26,391 | 1,677 / 4,231 |
| 10 | 7.6 million / 10.9 million | 4,743 / 21,401 |
| 20 | about 1.3 trillion | 13,416 / 114,119 |
| 100 | unreachable | 150,000 / 6.1 million |

At about 1,000 HP lost per field hour (40 s pacing), the power curve gives **level 10 in about 21 field hours** and **level 20 in about 114**. Level 100 would need about 6,000 field hours, so the exponent or the base needs tuning in the Endurance slice. The exponential curve can't pass level 6 in any realistic play time.

## 7. Fish value test (added Oct 21, after Sam's decision)

**Script:** `fish_sim.py` (20,000 visits per row).
**Fishing numbers reused** (`poi-framework-v1-brief.md`, `[PROPOSED]`): 3 pulls per visit; empty 25% at low Foraging (10% assumed at high); loot on 15% of non-empty pulls; 1 fish per pull at low Foraging, 3 at high.
**Values:** common 10, uncommon 15 `[DECIDED Oct 21]`; legendary 25, 30 or rolled 25–30 (under test). Rarity weights are test values.

| Rarity C / U / L | Legendary | Foraging | Nutrition per visit (mean) | 90th percentile | Visits with a legendary |
|---|---|---|---|---|---|
| 80 / 17 / 3 | 25 | low | 21.4 | 35 | 5.3% |
| 80 / 17 / 3 | 30 | low | 21.7 | 35 | 5.3% |
| 80 / 17 / 3 | 25–30 rolled | low | 21.6 | 35 | 5.3% |
| 80 / 17 / 3 | 30 | high | 78.6 | 110 | 19.0% |
| 85 / 12 / 3 | 30 | low | 21.2 | 35 | 5.3% |
| 75 / 20 / 5 | 30 | low | 22.6 | 35 | 8.5% |
| 75 / 20 / 5 | 30 | high | 82.3 | 120 | 29.1% |

**Findings**
1. **The legendary value barely matters to supply.** 25 against 30 changes a visit's average by under 2 nutrition. It's a reward moment, so choose by feel: fixed 30 is clearer in the log and worth more than a ration.
2. **Foraging matters most.** A high-Foraging visit gives about 3.6× a low one. That's the progression the player feels.
3. **Fishing is a supplement, not a food supply.** A low-Foraging visit is about 21 nutrition, under one ration, and a water cell rests for a game day. At 5% per full heal the survivor uses about 57 nutrition per field hour at 40 s pacing. Cooking and foraging must carry the main supply.
4. **Overflow:** a high-Foraging visit can exceed the 100-point meter (max seen 170). Fish should be stored as items, not turned into nutrition on the catch (FOOD-01 O7).
5. **Rarity chance:** 3% legendary means one in about 19 low-Foraging visits shows one. 5% doubles how often a player sees it. Starting value 3%, revisit in playtesting.
