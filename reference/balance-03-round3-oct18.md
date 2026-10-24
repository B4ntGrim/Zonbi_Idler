# BALANCE-03 — Round 3: active-time levers (Oct 18)

**Status:** investigation only. No production code, balance value, spec or save changed. Not closed.

## 1. Test record
- **Build:** production after BEST1 (`wandering.js dfcdfdfa41988ba5`); harness unchanged.
- **Runs:** 4 starts × 5 seeds (101–505) × 7 days, ethical policy, returns every 8 h, traversal fixture on. 20 runs per set.
- **Sets:** 27 matrix sets + 6 sensitivity sets. All 0 FAIL / 0 WARN; no Breakings.
- **Base in every set (Sam's decided directions, test values):**
  - square-difficulty tiers (ST2) with rare warned stronger zombies (3% / 0.5%);
  - near-death stress 1 / 1 / 3 at 25 / 15 / 5% HP;
  - **a Downing (forced or saved by a heal) adds whatever is left of the 5**, even when the survivor goes straight to rest;
  - character XP banked per kill.
- **Grid** (all combinations):

| Lever | Values tested |
|---|---|
| Heal tied to the zombie (HKZ) | 25% or 50% of the damage that zombie dealt in the fight |
| Encounter spacing (EN3) | ×1, ×2, ×4 the round-1 EN3 intervals (cleared 60 s · explored 20 s · unexplored 8 s, shortened by square threat) |
| Zombie hit chance | current (effectively 95%) or capped at 70% |
| HP rest rate | 5% (current) or 10% of max HP per minute |

- **Sensitivity:** walking stress ÷6 or 0; Cot (30/day) or Proper bed (50/day).
- **Active-share target:** not set. I compared against 25–50% of the day in the field as a working band, labelled `[PROPOSED]`.

## 2. Results (mean of 20 runs; per day)
"Out" = walking in the field, including the walk back. "Downed" counts Forced Retreats only.

| Set | Downed | Out % | Rest h | km | Near-death stress | Bed removed |
|---|---|---|---|---|---|---|
| Base only (no heal, no pacing) | 5.4 ±0.3 | 0.3 | 23.1 | 0.50 | 29.0 | 19.3 |
| + heal 25% | 5.3 | 0.3 | 23.1 | 0.61 | 28.8 | 19.2 |
| + heal 50% | 5.2 | 0.4 | 23.1 | 0.74 | 28.2 | 19.2 |
| heal 25 · EN ×1 · hit 95 | 4.0 ±0.5 | 1.0 | 23.0 | 2.12 | 25.2 | 19.1 |
| heal 25 · EN ×2 · hit 95 | 3.1 ±0.4 | 1.4 | 23.0 | 3.08 | 22.6 | 19.1 |
| heal 25 · EN ×4 · hit 95 | 2.4 ±0.5 | 1.7 | 22.9 | 3.92 | 21.1 | 19.1 |
| heal 25 · EN ×1 · hit 70 | 3.7 ±0.5 | 1.4 | 22.9 | 2.95 | 24.6 | 19.1 |
| **heal 25 · EN ×2 · hit 70** | **2.8 ±0.5** | 1.7 | 22.8 | 3.73 | 21.3 | 19.0 |
| heal 25 · EN ×4 · hit 70 | 1.9 ±0.5 | 2.3 | 22.7 | 5.03 | 19.6 | 19.0 |
| heal 50 · EN ×1 · hit 95 | 3.6 ±0.7 | 1.5 | 22.8 | 3.26 | 23.5 | 19.0 |
| heal 50 · EN ×2 · hit 95 | 2.7 ±0.5 | 1.9 | 22.8 | 4.09 | 21.0 | 19.0 |
| heal 50 · EN ×4 · hit 95 | 2.2 ±0.5 | 2.3 | 22.7 | 5.15 | 19.0 | 18.9 |
| heal 50 · EN ×1 · hit 70 | 3.1 ±0.5 | 1.9 | 22.8 | 3.72 | 21.5 | 19.0 |
| **heal 50 · EN ×2 · hit 70** | **2.1 ±0.6** | 2.4 | 22.7 | 5.15 | 19.2 | 18.9 |
| heal 50 · EN ×4 · hit 70 | 1.4 ±0.6 | 3.0 | 22.7 | 6.67 | 17.4 | 18.9 |
| *heal 50 · EN ×2 · hit 70, walking stress ÷6* | 2.3 ±0.7 | 2.8 | 22.6 | 5.8 | 21.3 | 18.8 |
| *same, walking stress 0* | 2.1 ±0.5 | 2.5 | 22.6 | 5.2 | 19.4 | 18.9 |
| *same, Cot (30/day)* | 2.9 ±0.8 | 3.2 | 22.5 | 6.6 | — | — |
| *same, Proper bed (50/day)* | 4.1 ±1.5 | 4.9 | 22.1 | 10.2 | — | — |

**Other measures:**
- **HP rest rate 10%:** within ±0.1 of the 5% twin in every pair, so the HP rest rate is not a limit. Only 5% rows are shown.
- **Downings by start** (heal 50 · EN ×2 · hit 70): A 2.6 · Nail Bat 1.8 · Iron Knuckles 1.9 · Pocket Knife 2.2.
- **Tier mix by day 7:** T0 17% · T1 20% · T2 27% · T3 30% · T4 6%.
- **Warned threats:** 2.5 per day, 18% avoided.
- **Withdrawals:** 6.8 per day.
- **Character level by day 7:** about 7–9.
- **Saved by a heal:** about the same number per day as Forced Retreats (2.2 vs 2.1 for heal 50 · EN ×2 · hit 70). These are also Downings under the decided rule, so they add the full 5 too.

## 3. Findings
1. **Downings are in the 2–5 range.**
   - The decided rules plus calmer pacing land at 2–4 Forced Retreats a day.
   - The best-balanced candidates are **heal 50 · EN ×2 · hit 70** (2.1) and **heal 25 · EN ×2 · hit 70** (2.8).
   - The Downed-is-top rule did most of the work: it alone took Downings from 8.8 to 5.4.
2. **Time out barely moves:** 0.3% to at most 4.9% of the day. Rest stays 22–23 h.
3. **Walking stress and the HP rest rate are not the limit.** Removing walking stress entirely or doubling the HP rest rate changes almost nothing.
4. **The limit is Downed moments per hour out.**
   - The candidate has about 4.2 Downed moments per day (2.1 forced + 2.2 saved by heal) in about 0.6 h out: roughly 7 per hour out.
   - Each costs up to 5 stress, a quarter of a Bedroll day.
   - The survivor keeps fighting on heal charges until it is Downed (rule U27), so nearly every trip ends with a Downing.
   - **With a 20/day bed, 4 Downings at 5 stress each use the whole day's recovery.**
5. **Better beds convert to time out only weakly.** The Proper bed doubles time out to 4.9% and Downings stay in range (4.1). Still far from 25%.
6. **Arithmetic for the working band.** To be out 25% of the day (6 h) with 2–5 Downings, the survivor must reach a Downed moment **less than once per hour out**, about 7× less often than now.
   - The levers that change this: much calmer encounters, survivors that leave before being Downed, or easier early fights.
   - Small stress tweaks will not get there.

## 4. Choices for Sam (nothing decided)
1. **Set the active-share target.** Is 25–50% of the day out the right goal, or is a low share acceptable if the survivor makes steady progress (distance, kills, levels)? This decides whether round 4 is needed at all.
2. **Leaving before being Downed.** Today the survivor heals instead of retreating while it has charges (U27, decided Oct 10). Options:
   - **(a)** keep U27;
   - **(b)** the HP retreat setting applies even with charges, and heals are kept for emergencies;
   - **(c)** add a "heal threshold" policy setting. This would reuse the existing retreat-rules prompt.

   Option (b) or (c) is the strongest remaining lever for time out.
3. **Should a Downing saved by a heal add the full 5,** or a smaller amount? It is a Downing (your Oct 18 rule), but it is also the player's tool working as intended.
4. **Candidate numbers for a balance batch** (only once 1–3 are settled), all `[PROPOSED]`:
   - heal = 50% of the zombie's damage dealt;
   - encounter spacing EN3 ×2;
   - zombie hit chance capped at 70%;
   - HP rest rate unchanged.

## 5. Proposed round 4 (only if Sam wants a higher time-out share)
- U27 options (b) and (c) with HP floors 30 / 50%.
- EN ×4 and ×8.
- A reachable Cot.

All on the candidate base. Same matrix size, then all four policies on the final pick.
