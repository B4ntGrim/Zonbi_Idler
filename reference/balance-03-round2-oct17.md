# BALANCE-03 — Round 2: testing Sam's Oct 17 directions

**Status:** investigation only. No production code, balance value, spec or save changed. Not closed. Every model is test-only, applied in memory.

> **Superseded in part, Oct 21 (Sam):** the heal after a kill (input 2 and the Oct 18 answer 3 below) is replaced by out-of-combat regen that costs nutrition, `[DECIDED Oct 21]`. See `food-01-nutrition-slice.md`. The results below stay as the test record.

**Inputs:**
- Sam's answers to the first screening (`balance-03-screening-oct17.md` §5), recorded `[DECIDED Oct 17]` as directions:
  1. Near-death stress scales with how close to death the survivor got.
  2. ~~A little HP after each kill.~~ Superseded Oct 21: out-of-combat regen.
  3. Tier band from square difficulty.
  4. Keep the warned over-tier threats.
  5. Background Wandering awards character XP.
- All numbers below are `[PROPOSED]` test values.

## 1. Test record
- **Build:** production after BEST1 (`wandering.js dfcdfdfa41988ba5`); harness `h2.js` unchanged.
- **Runs:** 4 starts × 5 seeds (101–505) × 7 days, ethical policy, returns every 8 h. Traversal fixture on (one new square per return).
- **Sets:** 13 main sets + 8 sensitivity checks, 20 runs each. Every set: 0 FAIL / 0 WARN.
- **Every set includes:**
  - **ST2:** band = square difficulty − 1.
  - **Over-tier:** +1 tier at 3%, +2 at 0.5%, with the warning stand-in of one extra escape attempt.
  - **CX:** character XP banked per kill, the same amount watched Wandering banks.

| Model | Rule tested |
|---|---|
| **LHa** (scaled near-death) | Replaces the flat +5 at 25% HP. Steps at 25 / 15 / 5% HP add 1 / 1 / 3 stress (worst case 5, as today). Once per trip per step |
| **LHb** | Same thresholds, 1 / 1 / 1 (worst case 3) |
| **HK2 / HK5** (heal per kill) | +2 or +5 HP after each won fight |
| **EN3** | Encounter pacing from round 1 (calmer on cleared and low-threat ground) |
| **Sensitivity only** | HK10, HK15; reachable Cot (30/day) or Proper bed (50/day); all stress gains set to 0 |

## 2. Results (mean of 20 runs; per day)
| Set | Downed | Encounters | Kills | Active h | Rest h | km | Near-death stress | Bed removed | Char. level day 7 |
|---|---|---|---|---|---|---|---|---|---|
| **R2 ref** (ST2 + CX) | **8.8** ±1.6 | 55 | 40 | 0.1 | 23.1 | 0.75 | 28.4 | 19.2 | 8.8 |
| LHa | 18.3 ±3.6 | 121 | 83 | 0.2 | 23.0 | 1.70 | 26.9 | 19.1 | 12.1 |
| LHb | 21.8 ±4.6 | 146 | 100 | 0.2 | 22.9 | 2.05 | 26.4 | 19.1 | 13.1 |
| HK2 | **7.7** ±1.5 | 57 | 42 | 0.1 | 23.1 | 0.78 | 28.2 | 19.2 | 8.4 |
| HK5 | 8.5 ±2.0 | 68 | 51 | 0.1 | 23.1 | 0.94 | 27.8 | 19.2 | 9.3 |
| LHa + HK2 | 18.2 ±2.6 | 143 | 100 | 0.2 | 22.9 | 2.02 | 26.2 | 19.1 | 12.6 |
| LHa + HK5 | 21.6 ±4.8 | 202 | 138 | 0.3 | 22.8 | 2.74 | 24.5 | 19.0 | 14.1 |
| LHb + HK2 | 20.9 ±3.8 | 164 | 113 | 0.2 | 22.9 | 2.31 | 25.8 | 19.1 | 13.1 |
| LHb + HK5 | 21.2 ±3.7 | 202 | 138 | 0.3 | 22.8 | 2.74 | 24.4 | 19.0 | 13.9 |
| ref + EN3 | **6.5** ±1.7 | 48 | 35 | 0.2 | 23.0 | 1.97 | 26.6 | 19.1 | 8.1 |
| LHa + HK2 + EN3 | 15.2 ±4.3 | 119 | 80 | 0.4 | 22.7 | 4.48 | 20.9 | 18.9 | 11.8 |
| LHb + HK2 + EN3 | 15.7 ±3.6 | 125 | 83 | 0.4 | 22.7 | 4.73 | 19.8 | 18.9 | 11.9 |
| LHb + HK5 + EN3 | 17.9 ±3.6 | 152 | 99 | 0.5 | 22.6 | 5.50 | 18.8 | 18.8 | 13.4 |
| *HK10* | 10.3 ±2.3 | 96 | 72 | 0.1 | 23.0 | 1.20 | 27.3 | 19.2 | 11.0 |
| *HK15* | 12.1 ±5.3 | 298 ±255 | 188 | 0.3 | 22.7 | 3.31 | 21.9 | 18.9 | 15.3 |
| *LHa + HK15* | 17.9 ±9.9 | 860 | 405 | 0.9 | 21.7 | 9.67 | 9.2 | 18.1 | 21.4 |
| *ref + Proper bed* | 18.0 ±2.9 | 111 | 76 | 0.1 | 23.0 | 1.54 | 55.3 | 47.9 | 12.1 |
| *LHb + HK5 + Cot* | 28.4 ±4.8 | 283 | 184 | 0.4 | 22.7 | 3.80 | 31.9 | 28.4 | 15.9 |
| *LHb + HK5 + Proper bed* | 39.5 ±6.9 | 482 | 276 | 0.6 | 22.4 | 6.27 | 46.6 | 46.6 | 19.3 |
| *No stress at all* | 54.7 ±10.1 | 2,272 | — | 2.9 (+0.6 walking back) | 19.4 | — | 0 | — | 25.4 |
| *No stress + HK5* | 34.6 ±12.6 | 4,043 | — | 5.2 (+2.4 walking back) | 16.4 | — | 0 | — | 28.1 |

**Other measures:**
- **Average HP lost per fight** (R2 ref; similar in every set): T0 14 · T1 25 · T2 36 · T3 46 · T4 50.
- **Tier mix by day 7:** T0 15% · T1 18% · T2 27% · T3 32% · T4 8% in every ST2 set.
- **Over-tier threats:** 1.7–7 per day, rising with activity; the warning escape avoided 12–24% of them.
- **Carry:** overload time stays under 0.3 h/day in every main set.
- **By start:** the spread matches round 1; no start dominates.

## 3. Findings
1. **Scaled near-death stress roughly doubles Downings** (8.8 → 18–22). Each trip now costs less stress, so the survivor takes more trips until near-death stress again fills the Bedroll's capacity. Near-death stress per day hardly moves (28.4 → 26–27), and rest stays about 23 h.
2. **A small heal per kill changes little** (HK2 7.7, HK5 8.5).
   - The heal is small next to the damage a fight deals (14–50 HP), so trips still end near death.
   - At HK15 the heal roughly matches tier-0 damage, and results split: some runs fight almost without stopping (SD of encounters ±255). This is a cliff, not a dial.
3. **EN3 plus ST2 gives the lowest Downings so far: 6.5 a day.**
4. **Even better beds don't free the survivor.** A Proper bed (50/day) doubles Downings (18.0) and leaves rest at 23 h: the survivor spends the larger budget on more trips.
5. **Rest stays 21.7–23.1 h/day in every set, and the reason is the HP-to-rest ratio.** A fight costs 14–50 HP and comes every 6 s, while rest restores 5 HP a minute. A trip lasts under a minute; recovering from it takes about 16 minutes for HP alone and about 6 hours when near-death stress is added. **No-stress ceiling check:** with every stress gain set to 0, the survivor is out only about 3.5 h a day (2.9 h active plus 0.6 h walking back), rests 19.4 h for HP alone, and is Downed 54.7 times a day. So stress tuning alone can never take the survivor much past about 15% of the day in the field; trip length has to change too. Adding +5 HP per kill with no stress raises time out to about 7.6 h a day (rest 16.4 h).
6. **Measured gap in the current rule (unmodified build, 3 days, 4 runs):** about 80% of Downings that end in a Forced Retreat add **no** near-death stress. The survivor goes straight to rest, and the low-HP check skips resting survivors. The stress comes from the times the survivor drops below 25% and keeps fighting on heal charges (U27). Under Sam's scaled direction, a Downing is by definition the closest to death, so it should sit at the top of the scale.
7. **Character XP (CX):** banking per kill takes character level from 1 to about 8–14 by day 7, depending on activity. **Nothing in the game reads character level today** (`getCharacterLevel` has no callers), so CX changes no balance yet. It needs its own small batch plus a decision on what character level unlocks.

## 4. What the numbers say about the targets
**Two ratios set the outcome:**
- **Downings per day** ≈ Bedroll recovery ÷ near-death stress per trip.
  - At 20/day with near-death the only real cost, 2–5 Downings needs each trip to cost about 4–10 stress.
  - Lowering that cost (scaling) or raising recovery (better beds) raises Downings.
  - Lowering encounter pressure (ST2, EN3) lowers them.
- **Active share** ≈ how long HP lasts in the field ÷ how long rest takes. Today a trip lasts under a minute.
  - Only the heal per kill (at large values), encounter pacing and combat damage (zombie hit chance, round 1 accuracy work) move this ratio.

**Consequence for decision 1:** to keep Downings in range, a scaled near-death cost should keep its top step at about today's +5 and apply it to Downed. Scaling then works as intended: brushes with death cost less, real near-death costs the full amount.

## 5. Choices for Sam

> **Answered Oct 18 (Sam), `[DECIDED Oct 18]`:**
> 1. Yes, Downed is the top of the scale.
> 2. 1 / 1 / 3 at 25 / 15 / 5% HP.
> 3. ~~Tie the heal to the zombie.~~ **Superseded Oct 21 (Sam):** out-of-combat regen replaces the heal after a kill, `[DECIDED Oct 21]`. See `food-01-nutrition-slice.md`.
> 4. Round 3 approved.
>
> **Still open:** item 5 (character-XP batch) and the active-share target. Round 3 results: `balance-03-round3-oct18.md`.
1. **Downed sits at the top of the near-death scale** (it adds the full step even when the survivor goes straight to rest)? Recommended. It closes the measured gap and keeps the scale's worst case at today's +5.
2. **Scale values:**
   - **LHa** (1 / 1 / 3 at 25 / 15 / 5%, Downed = full 5): recommended.
   - **LHb** (1 / 1 / 1): roughly 2.5× today's Downings.
3. **Heal per kill size:**
   - **Small and flat (+2 to +5):** keeps the decision's "a little" but barely changes play. Recommended as a feel and progression reward.
   - **Scaled to the zombie** (for example a share of its damage dealt): would test as a real sustain dial without the HK15 cliff.
4. **Active time is the next problem.** Approve a round 3 that tests the active-share levers together with LHa + Downed-top + HK + ST2 + EN3:
   - encounter interval (EN with longer base intervals);
   - zombie hit chance (the earlier 70% candidate);
   - HP rest rate.

   It also needs an **active-share target**, which is still open (D4): for example, the survivor out in the field 25–50% of the day.
5. **Character XP:**
   - Queue a small batch: background Wandering banks character XP, plus a test.
   - Decide separately what character level should do; today it does nothing.
