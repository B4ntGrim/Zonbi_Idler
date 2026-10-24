# BALANCE-03 — First screening (Oct 17)

**Status:** investigation only. No production code, balance value, spec or save changed. Not closed. Every model below is test-only, applied in memory.

## 1. Test record
- **Build:** the current production build after BEST1 (`wandering.js dfcdfdfa41988ba5`; other files as in the BEST1 report). H2 `runOne` unchanged.
- **Runs:**
  - 4 starts × 5 common seeds (101–505) × 7 days, ethical policy, returns every 8 h. 20 runs per set; 27 sets.
  - Every set: 0 FAIL / 0 WARN (H2 S1–S5).
- **Control:** the stay-home baseline with observation hooks is identical to the unmodified build in 20 of 20 runs.
- **Traversal:** all model sets use the traversal fixture: the Traversal position moves one open square per 8 h return, about 21 new squares per run. `base_home` is the stay-home control.
- **Model correction during the run:** my first MS1 build drained routine stress before persistent stress under Bedroll recovery, so near-death stress could never clear. It was fixed (Bedroll clears persistent first; the extra recovery clears routine) and MS1, MS2 and MS4 were rerun. Only corrected results are reported.

## 2. Models screened (one factor at a time; test values only)
| ID | Model | Test parameters |
|---|---|---|
| MS1 | Routine vs persistent stress. Low-HP and Breaking stress are persistent; everything else is routine. Displayed stress = sum; the gate (< 70) is unchanged | Bedroll clears persistent first; routine gets +2× the bed rate extra while resting |
| MS2 | Acute fade. 60% of each stress gain is acute and decays with a 30-minute half-life (real time, the clock rest already uses); 40% stays | — |
| MS3 | Stronger safe-ground recovery (existing mechanic) | cleared walking −0.10 → −0.30/min |
| MS4 | MS1 + MS3 | — |
| EN1 | Encounter interval by square familiarity | cleared 60 s · explored 20 s · unexplored 8 s |
| EN2 | Encounter interval by the square's `threatLevel` | 6 × (6 − threat) s, minimum 6 |
| EN3 | Combined | cleared: the longer of EN1/EN2; otherwise the shorter |
| ST1 | Tier band from combat level | band = floor(combat level / 10) |
| ST2 | Tier band from the square's `difficulty` | band = difficulty − 1 |
| ST3 | Tier band from distance to home or camp | band = floor(squares away / 3) |
| ST over-tier (all ST) | Rare stronger zombies with a warning | +1 tier 3% of encounters, +2 tiers 0.5%. Warning stand-in: one extra escape attempt before the fight |

## 3. Results (mean ± SD of 20 runs; per day)
| Set | Downed | Enc / Downing | Encounters | Kills | Explore h | Rest h | km | Stress % (calm/strained/stressed) | Over-tier / warned escape |
|---|---|---|---|---|---|---|---|---|---|
| base_home (no traversal) | 29.2 ±5.5 | 4.2 | 123 | 72.7 | 0.2 | 23.0 | 1.86 | 6/25/69 | — |
| **base_trav (reference)** | **25.6 ±3.6** | 4.1 | 106 | 64.0 | 0.1 | 23.0 | 1.60 | 6/21/73 | — |
| MS1 | 29.0 ±4.1 | 4.2 | 122 | 72.7 | 0.2 | 23.0 | 1.84 | 6/26/68 | — |
| MS2 | 39.6 ±6.5 | 4.5 | 178 | 102.3 | 0.3 | 22.9 | 2.69 | 17/28/55 | — |
| MS3 | 27.2 ±4.1 | 4.2 | 114 | 68.2 | 0.2 | 23.0 | 1.71 | 6/23/71 | — |
| MS4 | 29.9 ±5.5 | 4.2 | 127 | 74.8 | 0.2 | 23.0 | 1.93 | 7/26/67 | — |
| EN1 | 18.0 ±3.2 | 4.2 | 75 | 44.3 | 0.2 | 22.9 | 2.34 | 3/15/82 | — |
| EN2 | 14.2 ±3.4 | 4.2 | 59 | 35.0 | 0.2 | 22.9 | 2.30 | 2/9/88 | — |
| EN3 | 18.9 ±3.2 | 4.2 | 79 | 46.4 | 0.2 | 22.9 | 2.33 | 3/16/81 | — |
| **ST1** | **5.7 ±0.4** | 9.1 | 52 | 39.7 | 0.1 | 23.1 | 0.71 | 2/1/97 | 1.8 / 20% |
| ST2 | 8.8 ±1.6 | 6.4 | 55 | 39.6 | 0.1 | 23.1 | 0.75 | 2/5/94 | 1.8 / 12% |
| ST3 | 12.1 ±2.8 | 5.8 | 68 | 46.4 | 0.1 | 23.1 | 0.95 | 2/9/89 | 2.3 / 20% |
| C1 ST1+MS1 | 6.1 ±0.6 | 9.0 | 55 | 41.8 | 0.1 | 23.1 | 0.75 | 2/3/96 | 1.7 / 21% |
| C4 ST1+MS2 | 8.6 ±0.6 | 8.8 | 76 | 56.3 | 0.1 | 23.0 | 1.06 | 3/6/91 | 2.6 / 17% |
| C2 ST2+MS1 | 8.8 ±1.8 | 6.6 | 57 | 40.9 | 0.1 | 23.1 | 0.78 | 2/5/93 | 2.1 / 16% |
| C3 ST2+MS2 | 11.8 ±2.2 | 7.1 | 81 | 57.9 | 0.1 | 23.0 | 1.13 | 3/8/88 | 2.7 / 15% |
| C6 ST2+MS2+EN3 | 7.8 ±1.9 | 8.5 | 64 | 45.6 | 0.3 | 22.8 | 3.29 | 3/6/91 | 2.2 / 21% |
| C9 ST2+MS1+EN3 | 6.9 ±1.7 | 7.9 | 53 | 38.1 | 0.2 | 22.9 | 2.16 | 2/9/89 | 2.1 / 19% |
| C8 ST3+MS2 | 15.6 ±4.0 | 6.7 | 100 | 68.3 | 0.1 | 23.0 | 1.43 | 3/14/83 | 3.5 / 19% |

**Encounter tiers:**
- **Reference:** every tier T0–T7 from day 1.
- **ST1:** day 1 T0 98%; day 7 T0 41% · T1 55% · T2 2%.
- **ST2:** day 7 T0 15% · T1 18% · T2 27% · T3 32% · T4 8%.
- **ST3:** day 7 spans T0–T6.

**By start (ST1; Downed · encounters per Downing · kills):**
- A: 6.1 · 7.9 · 37.7
- Nail Bat: 5.5 · 9.1 · 39.8
- Iron Knuckles: 5.4 · 9.2 · 39.0
- Pocket Knife: 5.9 · 10.1 · 42.2

Equipment differences remain in every set.

**Other measures:**
- **Carry:** overload time stays at about 0.0–0.1 h/day in every set.
- **Load withdrawals:** under 1 a day in every set.

## 4. Findings
1. **Soft tier gating cuts Downings the most:** ST1 25.6 → 5.7 per day (just above the 2–5 range); ST2 8.8; ST3 12.1. Rare warned threats appeared 1.8–3.5 times a day, and the warning-escape stand-in avoided 12–21% of them.
2. **Encounter pacing alone cuts Downings by a third to a half** (EN2 14.2) and roughly doubles distance walked. Rest is unchanged.
3. **No model changes rest share:** 22.8–23.1 h/day in every set, and stress stays in the Stressed band 55–97% of the time.
4. **Root cause of the remaining rest (measured, base_trav / ST1 / C1):** stress added per day:
   - low-HP events about 27–30 (5.4–6.0 events/day);
   - unexplored walking 0.6–1.6;
   - failed ventures 0.5.

   Bedroll removes about 19–20.
   - **Why the low-HP events don't fall:** HP does not recover between fights, so even tier 0–1 zombies wear a survivor down within about 9 encounters (roughly a minute of walking at 6 s per encounter). Nearly every trip ends with a low-HP event (+5).
   - **The equilibrium:** 5 stress is about 6 hours of Bedroll rest, so activity expands until about 4–6 low-HP events fill the bed's 20/day.
   - **Consequence:** fewer Downings per encounter (ST models) does not reduce low-HP events per day, because the survivor simply walks out again until the bed is saturated.
5. **The stress models don't help at the current near-death cost.** MS1 cannot clear near-death stress faster than it arrives. MS2 fades stress, and the survivor spends the relief on more fighting (Downings 39.6).
6. **New `[CODE]` facts found:**
   - Combat skill rises from level 1 to 24 on day 1, 37 by day 3 and 50 by day 7 in background Wandering.
   - Character XP and character level never rise in background Wandering (character XP stays 0).
   - A progression band built on combat level would reach the top tiers in about a week; one built on character level would never move.

## 5. Decisions for Sam

> **Answered Oct 17 (Sam) — directions `[DECIDED Oct 17]`; numbers stay `[PROPOSED]`:**
> 1. Scaled by how close to death.
> 2. ~~A little HP after each kill.~~ **Superseded Oct 21 (Sam):** HP recovers between fights through out-of-combat regen that costs nutrition; the heal after a kill is removed, `[DECIDED Oct 21]`. See `food-01-nutrition-slice.md`.
> 3. Square difficulty.
> 4. Yes, keep it.
> 5. Yes.
>
> Results of testing these directions are in `balance-03-round2-oct17.md`.
1. **What should a near-death moment cost?** Today one low-HP event (+5) costs about 6 hours of Bedroll rest, and the 2–5 Downings target alone already fills a day of bed recovery. Options to test:
   - a smaller event;
   - fire it once per rest cycle instead of once per run;
   - scale it by how close to death the survivor got.
2. **Should HP recover between fights?** For example, slowly while walking on cleared ground, or a small amount after a kill. Without it, every trip ends near death regardless of tier.
3. **Tier-band signal:** combat level rises too fast and character level not at all. Options: square difficulty (ST2, uses existing world data); distance from safe ground (ST3); or a slower progression measure (a design question).
4. Keep the soft-tier rule with rare warned threats? (ST1–3 show it works mechanically; the warning would use the existing prompt system.)
5. **Character XP:** is background Wandering supposed to award character XP? (A possible defect, to be confirmed against the spec.)

## 6. Proposed next test round (after Sam's answers on 1–3)
- Near-death cost variants:
  - low-HP event 5 → 2 or 1;
  - once per rest cycle;
  - scaled.
- Between-fight HP recovery variants: on cleared ground; per kill.
- Each crossed with ST2 (or the chosen band) and EN3.

**Same settings:** 4 starts × 5 seeds × 7 days, traversal on. Also add all four policies for the final candidates.
