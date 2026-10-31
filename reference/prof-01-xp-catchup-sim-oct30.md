# PROF-01 — Profession XP catch-up: simulation results (Oct 30)

**Applied Oct 31** (P1–P5 as decided), in `game/stats.js` (`ZI.CATCHUP`). Two differences from the sim, both chosen by the build: the rate fades with the allowance and has no ramp (the pending `rampDays` is removed; the sim fades the same way); the base is the live level-1 XP of 148, so the 14-day allowance is 74 XP, where the sim's table shows 50 (the sim uses 100). A new absence replaces any unused allowance.

Sam asked for this to be modelled **before anything is built**. Model:
`tools/balance-sim/prof_xp_catchup.py`. Source of the rules: "Character Creation Instructions
(Draft)", Oct 28 — +15% max rate, 25% boosted allowance, decay as the allowance is consumed.
The doc leaves *accumulation timing* unspecified, so that is the swept parameter.

## 1. Headline: the mechanic is safe, but at the proposed values it is nearly inert

120 game days, 40 base XP per active day.

| Profession level | Pattern | Active days | End level | Total XP | Bonus XP | Bonus % |
|---|---|---|---|---|---|---|
| 8 | always active | 120 | 9 | 4800 | 0.0 | 0.00% |
| 8 | 5 on / 2 off | 86 | 9 | 3440 | 0.0 | **0.00%** |
| 8 | 10 on / 10 off | 60 | 9 | 2526 | 125.8 | 5.24% |
| 8 | 30 off then active | 90 | 9 | 3643 | 43.2 | 1.20% |
| 20 | 10 on / 10 off | 60 | 20 | 2569 | 168.5 | 7.02% |

**Two findings:**

1. **Deliberate inactivity never outperforms consistent practice.** Across every level (1, 8, 20),
   every pattern and both accrual thresholds, "always active" ends with the most total XP and the
   highest level. The audit's main worry is unfounded: a +15% rate on 25% of one level's XP cannot
   pay back the days not worked. No stockpiling exploit appeared.

2. **For the commonest real pattern it does nothing at all.** A 5-on/2-off rhythm earns **0.00%**
   bonus, because a 2-day gap never reaches the 3-day accrual threshold. The mechanic only fires
   for players who abandon a profession for ten days or more.

## 2. The accrual threshold is a cliff, not a dial

Level 8, 120 days, varying the accrual threshold:

| Accrual threshold | "weekend" (5 on / 2 off) bonus | 10-on/10-off | idle beats active? |
|---|---|---|---|
| 1 day | 6.70% | 5.24% | No |
| 2 days | 6.70% | 5.24% | No |
| **3 days (doc)** | **0.00%** | 5.24% | No |
| 5 days | 0.00% | 5.24% | No |
| 7 days | 0.00% | 5.24% | No |

The threshold does not scale the effect — it switches it on or off for a given rhythm. At 2 days
the weekend player gets the full benefit; at 3 they get none. There is no setting that gives a
little to short breaks and more to long ones.

## 3. The bonus grows with level, which may be backwards
Bonus share rises 2.99% (L1) → 5.24% (L8) → 7.02% (L20), because the 25% allowance is measured
against `xp_to_next`, which grows on the `curveK 1.5` curve. A catch-up meant to help neglected
low professions currently helps high ones most.

## 4. Recommendations `[PROPOSED]`
1. **Drop the accrual threshold to 2 days** if the intent is to soften ordinary breaks, or
   **accept that this is a returning-player mechanic only** and leave it at 3+. The doc does not
   say which was meant — this is the decision to make.
2. **Raise the ceiling or the allowance** if the bonus is meant to be felt. At 15%/25% the biggest
   effect seen anywhere was 170 XP over 120 days. Doubling the allowance to 50% is safe: inactivity
   still loses on every pattern tested.
3. **Make the allowance a flat multiple of level-1 XP**, not 25% of `xp_to_next`, if catch-up
   should favour neglected low-level professions.
4. Re-run before locking: `python3 tools/balance-sim/prof_xp_catchup.py`.

## 5. Not yet modelled
Offline catch-up, repeated inactivity cycles across all 16 tracks simultaneously, the no-damage
Combat / stalled-Endurance case, and level-up boundary behaviour. The model is single-profession;
extending it to 16 is straightforward once the rules above are settled.

---

# Decisions (Sam, Oct 30, voice)

The simulation's three findings all got an answer.

| # | Decision | Replaces | Tag |
|---|---|---|---|
| P1 | **No daily streak system.** Catch-up only | — | `[DECIDED Sam]` |
| P2 | **Threshold = 2 days away** | 3 days | `[DECIDED Sam]` |
| P3 | **Bonus size based on level-1 XP** (flat), not the current level's requirement | 25% of `xp_to_next` | `[DECIDED Sam]` |
| P4 | **Boosted allowance 50%** | 25% | `[DECIDED Sam]` |

**On P1.** A streak was considered and dropped because it pulls the opposite way: a streak rewards
players who never miss a day, catch-up helps players who have been away. Running both would have the
game paying out in both directions at once.

**On P2.** §2 showed the threshold is a cliff, not a dial — at 3 days a 5-on/2-off player earned
**0.00%**, at 2 days the full **6.70%**. Sam's reasoning: players are rarely away more than a day or
two, so the mechanic should catch the weekend rather than only the long absence.

**On P3.** §3 found the bonus grew with level (2.99% at L1 → 7.02% at L20) because the allowance was
measured against `xp_to_next`, which rises on the `curveK 1.5` curve. Basing it on level-1 XP makes
the absolute bonus constant, so it lands hardest *relative* to a neglected low-level profession —
which is what catch-up is for.

**On P4.** §1 showed deliberate inactivity never beat consistent play at any level or pattern, so
there is headroom. At 25% the largest effect anywhere was ~170 XP over 120 days, which no player
would notice.

→ **Audit pass 4** re-runs the model under P2–P4 and fails the design if any intermittent pattern
finishes ahead of always-active.

## P5 — the allowance scales with time away `[DECIDED Sam, Oct 30]`

Audit pass 4 found that a flat level-1-XP allowance gave a 30-day absence (0.11%) *less* than a
skipped weekend (1.89%) — the opposite of catch-up. Sam's fix:

**The allowance scales with days away**, from the 2-day threshold up to a **14-day cap**. A
fortnight away earns the largest boost; beyond that it stops growing.

Unchanged: the 2-day threshold (P2), the 15% max rate, and the level-1-XP base (P3).

`[PROPOSED]` form: `allowance = ALLOWANCE x xp_to_next(1) x min(daysAway, 14) / 14`

The no-exploit rule still governs: playing every day must finish ahead of any intermittent pattern,
so nobody gains by staying away deliberately. → verified in **AUD-01b re-run 4**.
