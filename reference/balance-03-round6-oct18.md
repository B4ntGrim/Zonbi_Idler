# BALANCE-03 — Round 6: stress scale × pacing × charge refill (Oct 18)

**Status:** simulation only. No production code, UI, balance value, spec or save changed. Not closed.

> **Superseded for the healing design (Sam, Oct 18).** These results rely on free base charges refilling after rest. Under Sam's consumable-only proposal they do not validate the candidate. See `balance-03-round7-plan-oct18.md`.

## 1. Test record
- **Source:** Sam's Oct 18 approval and healing-supply decisions:
  - the 2 free base heal charges refill;
  - finishing the tutorial gives one 2-charge Medkit, destroyed when empty;
  - the Jester gives a Fort quest-item medkit that can't heal.
- **Build:** production after BEST1 (`wandering.js dfcdfdfa41988ba5`); harness unchanged.
- **Runs:** matched seeds and starts: 4 starts × 5 seeds × 7 days, returns every 8 h, traversal on. 20 runs per set; 19 sets.
- **Checks:** all 0 FAIL / 0 WARN; no Breakings.
- **Fixed in every set** (test values):
  - square-difficulty tiers with rare warned threats;
  - near-death stress 1 / 1 / 3 at 25 / 15 / 5%;
  - full Downing tops up to 5;
  - character XP;
  - Option C heal 40% / retreat 30% with rule 5 (no encounters once a retreat starts);
  - **tutorial Medkit** (2 charges) carried from the first 8 h return.
- **Medkit fixture:** the test survivors have no free pocket at that point (0/0), so the medkit is added directly. The tutorial spec places it in the starter pouch.

**Grid:**

| Factor | Values |
|---|---|
| Stress scale (all gains together; relative costs unchanged) | ×¼, ×⅓ |
| Pacing | heal tied to the zombie (50% of its damage) · heal + encounter spacing EN3 ×2 · heal + spacing + zombie hit cap 70% |
| Base charge refill | after every rest (code) · once per day (spec) |

## 2. Results (ethical; per day, mean ±SD)
| Stress | Pacing | Refill | Full Downings | Rescues | Field time | Rest h | Charges spent | Trips ending empty |
|---|---|---|---|---|---|---|---|---|
| ×¼ | heal | rest | 2.2 ±2.1 | 15.6 | 34.3% | 15.1 | 124 | 17% |
| ×¼ | heal | daily | 16.7 | 0.5 | 4.1% | 22.3 | 2.6 | 99% |
| ×¼ | heal + spacing | **rest** | **1.5 ±1.5** | 7.2 | **33.2%** | 15.6 | 57 | 19% |
| ×¼ | heal + spacing | daily | 12.9 | 0.6 | 9.9% | 21.1 | 2.5 | 99% |
| ×¼ | all three | rest | 1.0 ±0.8 | 5.3 | 32.3% | 15.7 | 50 | 18% |
| ×¼ | all three | daily | 7.8 | 0.3 | 16.5% | 19.4 | 2.5 | 98% |
| ×⅓ | heal | rest | 1.8 ±1.6 | 9.6 | 22.7% | 17.9 | 103 | 22% |
| ×⅓ | heal | daily | 12.0 | 0.6 | 3.0% | 22.5 | 2.6 | 99% |
| ×⅓ | heal + spacing | **rest** | **2.7 ±1.7** | 10.2 | **19.7%** | 18.8 | 59 | 34% |
| ×⅓ | heal + spacing | daily | 9.3 | 0.6 | 6.3% | 21.9 | 2.5 | 98% |
| ×⅓ | all three | rest | 1.4 ±1.2 | 5.9 | 22.3% | 18.1 | 51 | 25% |
| ×⅓ | all three | daily | 6.1 | 0.3 | 9.8% | 21.1 | 2.5 | 97% |
| ×¼ | all three, **no medkit** | rest | 1.0 | 5.3 | 35.3% | 15.0 | 49 | 16% |

**Notes:**
- **Wasted charges (fumbles)** are reported separately: 1.4–3.5 a day with per-rest refill, 0.1 with daily refill.
- **Stress sources** (×¼, heal + spacing, rest): failed ventures 42 a day and walking 9 (after scaling) are now the largest sources; the Bedroll removes 13.
- **Heal-only pacing has high variance** (3,600 encounters a day at ×¼): heal-per-kill sustain approaches the "never stops" edge seen in round 2.
- **The tutorial Medkit's 2 charges are spent once over the week** (0.3 a day). It barely changes the totals.

**Policies on the two best candidates (heal + spacing, per-rest refill; full Downings · field time):**

| Policy | Stress ×¼ | Stress ×⅓ |
|---|---|---|
| Ethical | 1.5 · 33.2% | 2.7 · 19.7% |
| Immoral | 1.0 · 21.3% | 1.9 · 12.8% |
| Criminal | 1.0 · 34.7% | 1.9 · 14.7% |
| Heinous | 3.9 · 36.1% | 3.8 · 14.7% |

**By start:** start A (tutorial skipper: no pouch, no Jester weapon) has 2–5 Downings where the B starts have about 1. Field time is similar across starts.

## 3. Findings
1. **Per-rest refill is required for the field-time target.**
   - With once-per-day refill, every combination has 6–17 full Downings a day and 3–17% field time.
   - The survivor walks out with no heals, and a single fight from just above the 30% retreat line Downs it. Rescues fall to about 0.5 a day.
   - One tutorial Medkit does not change this.
2. **Stress ×¼ with heal + encounter spacing (per-rest refill) is the first candidate inside the field-time target for most policies:** 21–36%, with 1.0–3.9 full Downings.
3. **Stress ×⅓ lands Downings in range for ethical (2.7) but field time below target** (13–20%).
4. **Field time and Downings still pull against each other.** At ×¼, Downings sit at or just below the 2–5 range for every policy except Heinous. The remaining lever for Downings is the combat side (warned over-tier rate, retreat threshold), not stress.
5. **Failed ventures are now the biggest stress source.** Ventures fire from discovery prompts while the survivor is out, so their share grows with field time.

## 4. Recommendation (nothing decided)
1. **Base charges refill after every rest** (keep the code; update spec §13.3), with the tutorial Medkit as a one-off bonus.
2. **Candidate for a balance slice** (all `[PROPOSED]` starting values):
   - all stress gains ×¼, implemented as new table values, not a multiplier;
   - heal after a kill = 50% of the zombie's damage;
   - encounter spacing EN3 ×2;
   - Option C 40/30 with rule 5;
   - plus the decided rules (near-death 1 / 1 / 3, full Downing 5, square-difficulty tiers with warned threats).
3. **Before drafting the slice, Sam decides:**
   - **(a)** per-rest refill (recommended);
   - **(b)** accept Downings of about 1–2 a day for the gentler policies, or test one combat lever (warned over-tier rate) to lift them;
   - **(c)** the Medkit pocket: the tutorial spec puts it in the starter pouch, but the H2 starts have no pouch at that point.
