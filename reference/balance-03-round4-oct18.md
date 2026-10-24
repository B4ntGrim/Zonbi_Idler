# BALANCE-03 — Round 4: Option C heal-then-retreat (Oct 18)

**Status:** simulation only. No production code, UI, balance value, spec or save changed. Not closed.

**Source:** Sam's Oct 18 instruction:
- Option C priority order (1)–(5).
- Thresholds: heal 40 / retreat 30, and heal 60 / retreat 50 (test values).
- The current U27 rule as the baseline.
- The +5 top-up applies only to a full Downing that ends in Forced Retreat; a heal rescue gets only the existing stress.

## 1. Test record
- **Build:** production after BEST1 (`wandering.js dfcdfdfa41988ba5`); harness `h2.js` unchanged.
- **Runs:** matched seeds and starts in every set: 4 starts × 5 seeds (101–505) × 7 days, returns every 8 h, traversal fixture on. 20 runs per set; 18 sets.
- **Checks:** every set 0 FAIL / 0 WARN; no Breakings.
- **Base R** (main comparison; round-3 candidate, all test values):
  - square-difficulty tiers with rare warned threats;
  - near-death stress 1 / 1 / 3 at 25 / 15 / 5% HP;
  - full Downing tops up to 5;
  - character XP;
  - heal after a kill = 50% of the damage that zombie dealt;
  - encounter spacing EN3 ×2;
  - zombie hit chance capped at 70%.
- **Base P:** the same without the last three (production pacing).
- **Policies:** all four were run on base R.
- Only the heal/retreat behaviour differs within a base.

| Behaviour | Rule |
|---|---|
| **U27** (baseline) | Current code. While charges remain the HP retreat setting (30%) is ignored. Heal after a kill below 30 HP (top-up); emergency heal when a fight would Down. Encounters continue on the walk back |
| **C 40/30** | Sam's order. Before each encounter and right after one: heal while HP < 40% and charges remain (existing heal), re-checking after each heal; then retreat if HP < 30%. The emergency heal is unchanged. The post-kill top-up is replaced by the threshold check |
| **C 60/50** | Same with 60 / 50 |
| **"nwe"** (rule 5) | No encounters once a withdrawal starts. Also run alone with U27, and C was also run without it, to separate its effect |

## 2. Results (base R, ethical; mean of 20 runs, per day)
| Measure | U27 | U27 + rule 5 | **C 40/30** | **C 60/50** | C 40/30 without rule 5 | C 60/50 without rule 5 |
|---|---|---|---|---|---|---|
| **Field time** (% of day; exploring + walk back) | 3.1 | 4.2 | **4.7** | **5.9** | 3.3 | 4.0 |
| Exploring only (%) | 2.5 | 3.4 | 3.7 | 4.9 | 2.8 | 3.2 |
| Walk back (h) | 0.13 | 0.20 | 0.22 | 0.25 | 0.14 | 0.18 |
| Distance (km) | 6.5 | 8.7 | 9.6 | 12.5 | 7.0 | 8.3 |
| Rest (h) | 22.5 | 22.5 | 22.3 | 22.1 | 22.4 | 22.5 |
| … waiting on stress only (h) | 20.7 | 20.3 | 20.0 | 20.2 | 20.5 | 20.6 |
| … HP recovery (h) | 1.8 | 2.1 | 2.2 | 1.9 | 1.9 | 1.9 |
| Encounters | 85 | 101 | 106 | 131 | 87 | 104 |
| Escapes | 18 | 26 | 26 | 39 | 19 | 25 |
| Kills | 65 | 73 | 78 | 92 | 66 | 76 |
| Encounters on the walk back | 17.1 | 0 | 0 | 0 | 17.2 | 22.6 |
| Withdrawals (trips ended on purpose) | 8.7 | 14.0 | 15.3 | 18.7 | 9.1 | 11.8 |
| **Full Downings** (Forced Retreat) | 2.5 ±0.5 | 1.5 | **1.5** | **1.0** | 2.5 | 2.3 |
| … of which on the walk back | 1.5 | 0 | 0 | 0 | 1.5 | 1.7 |
| **Heal rescues** | 2.8 | 4.4 | 3.0 | 1.8 | 3.1 | 1.7 |
| Threshold heals | — | — | 18.8 | 30.1 | 13.4 | 21.2 |
| Post-kill top-ups (U27 rule) | 14.1 | 16.5 | — | — | — | — |
| Fumbled charges | 1.5 | 1.9 | 1.7 | 2.5 | 1.2 | 1.9 |
| **Charges spent** | 18.4 | 22.8 | 23.4 | 34.4 | 17.8 | 24.8 |
| Kit charges spent | 0 | 0 | 0 | 0 | 0 | 0 |
| Times charges ran out | 8.0 | 8.7 | 8.6 | 15.2 | 7.1 | 10.9 |
| **Trips ending with 0 charges** | 74% | 58% | **53%** | **77%** | 64% | 79% |

**Stress by source (per day):**

| Source | U27 | U27 + rule 5 | C 40/30 | C 60/50 |
|---|---|---|---|---|
| Near-death steps (25 / 15 / 5%) | 5.8 | 5.6 | 4.2 | 1.0 |
| Full-Downing top-up | 11.0 | 7.6 | 7.0 | 5.2 |
| Walking (explored + unexplored) | 4.7 | 8.2 | 8.5 | 9.3 |
| Failed ventures | 9.6 | 9.7 | 11.8 | 17.4 |
| **Total added** | 31.1 | 31.1 | 31.5 | 32.9 |
| Removed by the Bedroll | 18.7 | 18.7 | 18.6 | 18.4 |
| Removed on cleared ground | 1.9 | 2.1 | 2.6 | 4.1 |

Ambush and route-change stress were 0 in every set.

**Base P (production pacing):**

| Behaviour | Full Downings | Rescues | Field time | Charges spent | Trips ending with 0 charges |
|---|---|---|---|---|---|
| U27 | 5.6 | 3.0 | 0.3% | 12.4 | 96% |
| C 40/30 | 2.8 | 1.8 | 0.9% | 22.2 | 94% |
| C 60/50 | 1.6 | 1.4 | 3.0% | 61.2 | 97% |

**Policies (base R; full Downings · field time %):**

| Policy | U27 | C 40/30 | C 60/50 |
|---|---|---|---|
| Ethical | 2.5 · 3.1 | 1.5 · 4.7 | 1.0 · 5.9 |
| Immoral | 2.0 · 2.8 | 0.8 · 3.4 | 0.8 · 3.7 |
| Criminal | 2.1 · 2.0 | 0.9 · 2.8 | 0.7 · 3.0 |
| Heinous | 2.3 · 1.8 | 1.3 · 2.6 | 0.8 · 3.4 |

The direction is the same in every policy. Starts differ by at most 1.1 Downings and 0.6 points of field time.

## 3. Findings
1. **Option C with rule 5 improves every Downing and field-time measure against U27, but far from the 25–50% target.**
   - Field time: 3.1% → 4.7% (C 40/30) → 5.9% (C 60/50).
   - Full Downings: 2.5 → 1.5 → 1.0.
2. **Rule 5 does most of the work on Downings.**
   - Today 17 encounters a day happen on the walk back, and they cause 1.5 of the 2.5 full Downings.
   - U27 + rule 5 alone gives 1.5. C without rule 5 is no better than U27.
   - **C's own contribution is predictability:** fewer rescues at 60/50 (1.8 vs 4.4), much less near-death stress, and longer trips.
3. **Near-death stress is no longer the limit under C.** At 60/50 it falls to 6.2 a day (1.0 steps + 5.2 top-up). The survivor still rests about 22 h, because **failed ventures (17.4) and walking (9.3)** take its place. Total stress added barely changes (31–33 a day), because the bed caps it: activity expands until the bed is full, as in every earlier round.
4. **Charges run out routinely.** 53–77% of trips end with no charges (base R) and 94–97% in base P. No start carries a healing kit, so only the 2 base charges are available, refilled after each rest. C 60/50 spends the most (34 a day in base R, 61 in base P).
5. **Downings fall below the 2–5 range in base R** (1.0–1.5). Base P with C 40/30 lands at 2.8. Option C makes the round-3 pacing levers partly unnecessary.

## 4. Undefined or mismatched healing mechanics (flagged; they change the comparison)
1. **Base charge refill.** The spec (§13.3) says "base charges refill once per day". The code refills them **after every rest** (`active.js` `_restStep`, "D2"). All results use the code. With a once-per-day refill, C would empty its charges early each day and behave like "retreat at the threshold" for the rest of it, so heals would matter far less. **Needs a decision.**
2. **Encounters on the walk back.** Today's code keeps encounters going during a withdrawal, and it has a getaway evasion buff for that case. Rule 5 removes both. This is the largest single effect measured.
3. **Post-kill top-up.** U27's automatic heal after a kill below 30 HP (`topUpBelowHp`) has no defined place under C. I treated it as replaced by C's threshold check; keeping both would double-heal.
4. **Fumbles.** While Strained or Stressed, 5–10% of heals waste the charge (existing rule). This conflicts with "never spend a charge that cannot restore HP" in spirit: 1.7–2.5 wasted a day.
5. **Heal-rescue stress.** The existing low-HP check reads HP *after* the rescue heal (1 + heal amount, about 21–40 HP). A rescue usually crosses only the 25% step.
6. **Heal size grows with First Aid** (20% + 1.2% per level, max 75%). More heals level First Aid faster, so C 60/50 heals get bigger over the week.

## 5. Recommendation (nothing decided)
1. **Keep Option C as the direction, with rule 5.**
   - Rule 5 is the biggest single gain and matches Sam's intent ("once retreat starts, no further encounters").
   - C makes trips end on the player's terms.
2. **Thresholds:**
   - **40/30 for the next round:** fewer charges spent and the highest share of trips ending with charges left.
   - 60/50 gives more field time but empties charges on most trips and pushes Downings below range.
3. **Do not propose UI or production changes yet.** Field time is still about 5%, not 25–50%. The new limit is stress from **failed ventures and walking**, not combat.
4. **Decisions needed before round 5:**
   - **(a)** base charges: once per day (spec) or after every rest (code);
   - **(b)** confirm the top-up is replaced under C;
   - **(c)** whether fumbles apply to threshold heals;
   - **(d)** approve a round 5 on the venture and walking stress economy under C 40/30 + rule 5, also re-checking pacing so Downings return to 2–5.
