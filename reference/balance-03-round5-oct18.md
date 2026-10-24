# BALANCE-03 — Round 5: what moves field time under Option C (Oct 18)

**Status:** simulation only. No production code, UI, balance value, spec or save changed. Not closed.

## 1. Test record
- **Source:** Sam's Oct 18 approval ("simulation only, with changes tested separately"), plus the round-4 answers:
  - medkits are consumables;
  - the threshold rule replaces the post-kill top-up;
  - fumbles stay, with wasted charges reported separately.
- **Build:** production after BEST1 (`wandering.js dfcdfdfa41988ba5`); harness unchanged.
- **Runs:** matched seeds and starts: 4 starts × 5 seeds (101–505) × 7 days, ethical policy, returns every 8 h, traversal on. 20 runs per set; 22 sets.
- **Checks:** every set 0 FAIL / 0 WARN; no Breakings.
- **Reference** (production pacing, all test values):
  - square-difficulty tiers with rare warned threats;
  - near-death stress 1 / 1 / 3 at 25 / 15 / 5%;
  - full Downing tops up to 5;
  - character XP;
  - **Option C 40/30 with rule 5** (no encounters once a retreat starts).
- **Method:** each change was added to the reference alone, then in a few combinations.
- **Correction during the run:** my first "daily refill" model reset at every 8 h page reload, so it refilled 3 times a day. It was fixed (refill day stored in the save) and rerun; only corrected results are shown.

## 2. One change at a time (per day, mean of 20 runs)
| Change | Full Downings | Rescues | Field time | Rest h | Charges spent | Wasted (fumbles) | Trips ending empty |
|---|---|---|---|---|---|---|---|
| **Reference** | 2.8 ±0.5 | 1.8 | 0.9% | 23.2 | 22.2 | 1.3 | 94% |
| Base charges refill once per day (spec) | 3.4 ±0.4 | 0.2 | 0.8% | 23.1 | 2.3 | 0.2 | 100% |
| Failed venture stress 8 → 4 | 3.0 | 1.7 | 1.0% | 23.2 | 23.8 | 1.7 | 94% |
| Failed venture stress → 0 | 2.9 | 1.5 | 1.1% | 23.2 | 24.8 | 1.7 | 95% |
| Walking stress ÷2 | 3.0 | 1.7 | 1.0% | 23.2 | 22.6 | 1.5 | 94% |
| Walking stress ÷6 | 3.0 | 1.6 | 1.0% | 23.2 | 23.0 | 1.5 | 94% |
| Cot reachable (30/day) | 3.8 | 2.5 | 1.2% | 23.1 | 28.8 | 2.2 | 95% |
| Heal after a kill = 50% of that zombie's damage | 2.6 | 7.3 | 3.8% | 22.4 | 47.3 | 2.3 | 49% |
| Encounter spacing EN3 ×2 | 2.4 | 1.8 | 2.1% | 22.8 | 17.8 | 1.3 | 93% |
| Zombie hit chance capped at 70% | 2.0 | 1.3 | 1.6% | 22.9 | 30.0 | 2.0 | 89% |
| All three pacing changes | 1.5 ±0.5 | 3.0 | 4.7% | 22.3 | 23.4 | 1.7 | 53% |

**Combinations:**

| Combination | Full Downings | Field time | Rest h |
|---|---|---|---|
| Venture stress 4 + walking ÷2 | 2.8 | 1.1% | 23.1 |
| + Cot | 4.2 | 1.3% | 23.1 |
| + Cot + daily refill | 4.7 | 1.0% | 23.0 |
| Venture stress 0 + walking ÷6 + Cot | 4.1 | 1.4% | 23.0 |
| All pacing + daily refill | 2.2 ±0.5 | 2.7% | 22.6 |

**Stress by source** (reference / all pacing):
- near-death steps 19.8 / 4.2;
- full-Downing top-up 7.1 / 7.0;
- walking 1.5 / 8.5;
- failed ventures 1.7 / 11.8.

The Bedroll removes 19.3 / 18.6.

## 3. Feasibility check: scale every stress gain
To test whether 25–50% is reachable at all, every stress gain (all sources) was multiplied by ¼ or ⅛. Bed recovery and all other rules were unchanged.

| Set | Full Downings | Rescues | Field time | Rest h (stress-only / HP) | Encounters | Charges spent | Trips ending empty |
|---|---|---|---|---|---|---|---|
| Reference, stress ×¼ | 7.7 | 7.8 | 8.1% | 21.5 (11.4 / 10.1) | 683 | 120 | 87% |
| Reference, stress ×⅛ | 9.6 | 27.5 | 33.9% | 15.3 (0.1 / 15.2) | 3,518 | 236 | 55% |
| **All pacing, stress ×¼** | **1.0 ±0.7** | 5.3 | **35.3% ±3.1** | 15.0 (9.6 / 5.3) | 692 | 49 | 16% |
| All pacing, stress ×⅛ | 0.3 | 8.4 | 65.0% | 7.7 (0 / 7.7) | 1,119 | 55 | 7% |

- **All pacing, stress ×¼, by start (full Downings · field time):** A 1.9 · 33.8% · Nail Bat 0.9 · 34.3% · Iron Knuckles 0.6 · 38.0% · Pocket Knife 0.6 · 35.2%.
- **Failed ventures become the largest stress source** once the survivor is out longer (all pacing ×¼: 44 a day after scaling, against walking 10).

## 4. Findings
1. **Field time stays at about 1–5% under every single change, so no one change is enough.**
   - **Pacing moves it most:** the heal tied to the zombie gives 3.8%, all three pacing changes 4.7%.
   - **Ventures, walking and the Cot change almost nothing at production pacing,** because near-death steps (about 20 a day) fill the bed first.
2. **Daily refill makes charges scarce.** About 2 charges are spent a day; nearly every trip ends with none, rescues fall to 0.2, and full Downings rise to 3.4. Field time doesn't change. With daily refill, a medkit supply becomes the main healing source.
3. **The target is reachable only by rescaling the stress economy against bed recovery,** about 4× lower gains (or about 4× more recovery), together with the round-3 pacing.
   - That combination gives **35% field time** (inside 25–50%).
   - Stress and HP both gate rest (9.6 h and 5.3 h).
   - Charges last most trips (16% end empty).
   - At ×⅛ stress no longer matters at all (65% field time; HP is the only limit), which overshoots.
4. **Downings and field time pull against each other.**
   - **Pacing + stress ×¼:** 1.0 full Downings a day, just under the 2–5 range.
   - **Production pacing + stress ×⅛:** 9.6, above it.
   - A middle setting (partial pacing with stress about ×¼) should land in both ranges; it hasn't been tested yet.
5. **Why this keeps happening:** every earlier round changed one stress source, and the freed budget went into more activity until the bed was full again. The ratio that sets field time is total stress per hour in the field against bed recovery per day. Today that ratio is roughly 8× too high for 25% field time.

## 5. Recommendation (nothing decided)
1. **Keep Option C 40/30 with rule 5** as the direction (round 4).
2. **Treat the stress economy as one dial, not many:** rescale all stress gains together (or raise bed recovery), so the relative costs Sam has decided stay the same:
   - near-death 1 / 1 / 3;
   - full Downing 5;
   - ventures and walking.

   Test values: gains ×¼ with partial pacing, aiming for 25–50% field time and 2–5 Downings.
3. **Base charges:** decide daily (spec) versus per rest (code). Daily makes medkits matter but needs a medkit supply in testing. Today no start carries one.
4. **Next step if approved, simulation only:**
   - stress ×¼ and ×⅓;
   - pacing subsets (heal tied to the zombie alone; heal + EN ×2);
   - per-rest and daily charges;
   - all four policies on the best two.
