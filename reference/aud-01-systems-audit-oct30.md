# AUD-01 — Systems audit (Oct 30)

Four passes over the systems Sam's Oct 30 voice decisions touch. Everything below is
`[PROPOSED]`; only Sam marks `[DECIDED]`. Sims live in `tools/balance-sim/`.

**Headline: 3 passes clean, 1 contradiction found, 3 judgement calls for Sam.**

| Pass | Subject | Result |
|---|---|---|
| 1 | Clock and weather | PASS on stated checks — **one gap in intent** |
| 2 | Progression | PASS on convergence — **one contradiction** |
| 3 | Flat damage reduction | PASS on both FAIL checks — **one gap in intent** |
| 4 | Profession catch-up | PASS — **one trade-off** |

---

## Pass 1 — Clock and weather
`tools/balance-sim/weather_sim.py` · 6 game years, 2,405 events, seed 1337

| Check | Result |
|---|---|
| Consecutive repeats after a forced change | **PASS** — 0 of 2,405 |
| Longest single event within the 96h cap | **PASS** — 94h |
| Deterministic from seed + day | **PASS** — SHA-256 of seed:day:salt |
| Cap actually fires | **0.00%** — never, in 2,405 events |

### The gap: the cap does not deliver its intent
Sam's words were *"it could rain indefinitely"*. The 96-hour cap stops a **single event** running
forever, but nothing stops **different** bad weathers chaining back to back. Worst observed run:

> **621 game hours of unbroken bad weather** — 25.9 game days, and because 1 game hour = 1 real
> minute, **621 real minutes, about 10.4 real hours** of continuous bad weather.

Winter is the culprit: Clear is only 28.9% of winter, so Blizzard → Rain → Blizzard chains freely.
The per-event cap is satisfied the whole time.

`[PROPOSED]` **Clear-sky guarantee**: after *N* consecutive bad-weather hours, force Clear for at
least one event. N = 48 game hours would cap a bad run at about 2 game days.

### Proposed constants
```
ZI.WEATHER_DURATION = {
  Spring: { minH: 4,  maxH: 36 },   Summer: { minH: 3,  maxH: 28 },
  Autumn: { minH: 6,  maxH: 48 },   Winter: { minH: 10, maxH: 96 },
}
HAZARD_MAX_H = 8        // AcidRain and RadiationStorm never run long
```
Measured share of season: Spring Rain 32.8% / Fog 32.2% / Clear 33.0% · Summer Clear 46.5% /
HeatWave 37.0% · Autumn Rain 33.9% / Fog 29.2% / Blizzard 8.6% · Winter Blizzard 41.2% / Clear 28.9%.

### Other pass-1 proposals
- **AcidRain → Spring and Autumn; RadiationStorm → Summer and Winter**, both seasonal rather than
  biome-based, capped at 8h. Keeping them seasonal means one weather system rather than two, and
  they already exist in `ZI.WEATHER_EFFECTS` so they need no new rules or art.
- **Forecast needs pre-rolling.** At +2h per Insight point, Insight 13 asks for 26h, which is about
  1.2 events ahead of a 21.8h mean — so it routinely asks for weather not yet rolled. Keep a rolling
  buffer of the next 3 events and clamp the visible forecast to `min(2 x Insight, buffer end)`.
- **Chilled fires from the SOAKED rung** of `ZI.MOODLES.Wet`, not Drenched. The ladder's own
  `coldBuildupRate` is `[0.5, 1.5, 3.0, 5.0]`/hour; Soaked at 3.0 is where cold outpaces recovery.
  Triggering at Drenched would make Chilled nearly unreachable outside a blizzard.
  Campfire cure: **2 game hours**.

---

## Pass 2 — Progression
`tools/balance-sim/progression_sim.py`

| Check | Result |
|---|---|
| 104 points = 8 attributes x cap 13 | **PASS** — exact |
| Focused and even builds identical at L100 | **PASS** |
| Any level granting nothing | **PASS** — none |
| First attribute capped, focused build | L14 |

### The contradiction: the gate ratio breaks convergence
STAT-03 Addendum A3 set `rankCap = min(30, 2 x attribute)`. With the cap now **13**:

| Gate | rankCap at attribute 13 | Fully unlocks a stat at |
|---|---|---|
| **2x (current)** | **26 of 30** | **never** |
| 2.31x | 30 | attribute 13 |
| **2.5x (proposed)** | **30** | **attribute 12** |
| 3x | 30 | attribute 10 |

At 2x, **no stat can ever reach rank 30** — 4 of 30 ranks are unreachable for every stat, forever.
That directly contradicts Sam's decision that everyone is fully built for the final boss. It also
leaves VIT-01's max-HP runaway permanently gated at rank 26.

`[PROPOSED]` **Gate = 2.5x.** I set 2x in Addendum A before the cap of 13 existed; the two decisions
were made separately and are incompatible.

### A measurement caveat
The power metric is linear in points spent, so focused and even builds score **identically at every
level** (0.0% gap at L10 through L100). That is the metric's fault, not a finding: differentiation
from ORDER is **qualitative** — which stats are reachable when — not a power gap. A focused build
has one attribute at 13 by **L14**, unlocking rank 26 in its three stats, while an even build sits
near 3 across the board. Measuring that properly needs a per-stat reachability metric, not a sum.

---

## Pass 3 — Flat damage reduction
`tools/balance-sim/flat_dr_sim.py` · zombie damage means read from the live bestiary

| FAIL check | Result |
|---|---|
| Any current-zone tier always at the floor | **PASS** — none |
| Flat DR mitigation at L35–70 >= 5% | **PASS** — 24.8% |

### The gap: "at the floor" is a lenient definition of harmless
Low tiers degrade progressively. Hits that land on the 20% floor: **F from L50, E from L70,
D from L90, C at L100**. In practice:

| | raw hits to down a 150HP survivor | at L50 | at L100 |
|---|---|---|---|
| F tier | 34.9 | **174.4** | 174.4 |
| D tier | 20.0 | 42.0 | 100.0 |
| BOSS | 6.0 | 7.8 | 11.5 |

An F-tier zombie needing 174 hits is trivial whether or not it is technically at the floor. Sam's
concern — *"whole tiers become free"* — is partly realised and the stated check does not catch it.

This may be correct: outgrowing early zones is normal in an idle game. But it should be chosen, not
inherited. `[OPEN]` for Sam.

### Proposed constants
```
FLAT_PER_RANK = 0.25     // flat DR gained per rank
TIER_SCALE    = 0.85     // flat DR x 0.85^(tiers above F)
FLOOR         = 0.20     // a hit never lands below 20% of its damage
```

---

## Pass 4 — Profession catch-up
`tools/balance-sim/prof_xp_catchup.py` · 120 days, 40 base XP per active day

| Check | Result |
|---|---|
| Any intermittent pattern ahead of always-active | **PASS** — none, at any level |
| Weekend player now benefits (P2) | **PASS** — 0.00% → **1.89%** |
| Bonus largest for neglected low professions (P3) | **PASS**, on the right measure |

P3 reads flat against raw XP earned — 1.89% at L1, L8, L20 and L40 alike. Against **the level it is
actually helping** it behaves exactly as intended:

| Level | xp_to_next | bonus as % of that level |
|---|---|---|
| 1 | 100 | **64.86%** |
| 8 | 2,263 | 2.87% |
| 20 | 8,944 | 0.73% |
| 40 | 25,298 | 0.26% |

### The trade-off
Basing the allowance on level-1 XP shrank the long-absence case sharply:

| Pattern | Before | After |
|---|---|---|
| 5-on / 2-off | 0.00% | **1.89%** |
| 10-on / 10-off | 5.24% | **0.80%** |
| 30 days off | 1.20% | **0.11%** |

The mechanic now rewards **frequent short breaks** far more than **genuine returns** — arguably the
opposite of catch-up. `[OPEN]` for Sam: if returning players are the target, the allowance should
scale with absence length rather than being flat.

---

## Proposed constants — all in one table

| Constant | Value | Pass |
|---|---|---|
| `ZI.WEATHER_DURATION.Spring` | `{minH:4, maxH:36}` | 1 |
| `ZI.WEATHER_DURATION.Summer` | `{minH:3, maxH:28}` | 1 |
| `ZI.WEATHER_DURATION.Autumn` | `{minH:6, maxH:48}` | 1 |
| `ZI.WEATHER_DURATION.Winter` | `{minH:10, maxH:96}` | 1 |
| `ZI.WEATHER_HAZARD_MAX_H` | 8 | 1 |
| `ZI.WEATHER_CLEAR_GUARANTEE_H` | 48 | 1 (new) |
| `ZI.WEATHER_FORECAST_BUFFER` | 3 events | 1 |
| `ZI.CHILLED_TRIGGER_RUNG` | Soaked | 1 |
| `ZI.CHILLED_CURE_H` | 2 | 1 |
| `ZI.ATTR_RANK_GATE` | **2.5** (was 2) | 2 |
| `ZI.FLAT_DR_PER_RANK` | 0.25 | 3 |
| `ZI.FLAT_DR_TIER_SCALE` | 0.85 | 3 |
| `ZI.DAMAGE_FLOOR_PCT` | 0.20 | 3 |
| `ZI.CATCHUP_ACCRUAL_DAYS` | 2 | 4 |
| `ZI.CATCHUP_ALLOWANCE` | 0.50 of level-1 XP | 4 |
| `ZI.CATCHUP_MAX_RATE` | 0.15 | 4 |

## What needs Sam
1. **Gate 2x → 2.5x** (pass 2). The only outright contradiction; without it, convergence is false.
2. **Clear-sky guarantee** (pass 1). 10 real hours of unbroken bad weather is possible today.
3. **Low tiers going trivial** (pass 3). Intended, or worth a floor that scales with level?
4. **Catch-up favouring short breaks over long** (pass 4). Is that the mechanic you wanted?

## Not done
- No game code was touched; the other session's uncommitted files were left alone.
- The existing test suite was not re-run — nothing this audit produced is loaded by the game.

---

# AUD-01b re-run (Oct 30, after Sam's decisions)

Sam answered all four calls from the audit above, and three of the four answers changed the design
rather than just picking a number. Everything here re-verifies against those answers.

**All four re-runs PASS.**

| Re-run | Subject | Result |
|---|---|---|
| 1 | Clear-sky guarantee | **PASS** — worst bad run 621h → 132h |
| 2 | Progression at cap 10, gate 3 | **PASS** — every stat reaches rank 30 |
| 3 | Elemental Resistance | **PASS** — physical untouched, floors at 50% |
| 4 | Catch-up scaling with absence | **PASS** — no exploit, long absence now wins |

## Re-run 1 — Clear-sky guarantee
`CLEAR_GUARANTEE_H = 48` forces Clear once consecutive bad hours reach 48.

| | Before | After |
|---|---|---|
| Longest unbroken bad weather | 621h (10.4 real hours) | **132h** (2.2 real hours) |
| Allowed (48h + one max event) | — | 144h → **PASS** |
| Winter Clear share | 28.9% | **42.6%** |
| Consecutive repeats | 0 | 0 |
| Longest single event | 94h | 94h (cap 96h) |

## Re-run 2 — Progression at cap 10
The contradiction is gone, and it was the cap that was wrong, not the gate.

| Check | Result |
|---|---|
| 79 level points + 1 milestone = 80 = 8 × 10 | **PASS** — exact |
| Builds identical at the launch cap L80 | **PASS** |
| Lowest rankCap across all 8 attributes at L80 | **30 of 30 — PASS** |
| Any level granting nothing | none |
| First attribute capped, focused build | L11 |

**The differentiation finally measurable.** The old power metric was linear in points and showed a
0.0% gap at every level. Counting *attributes fully unlocked* instead shows what Sam actually
designed:

| Level | Focused | Even |
|---|---|---|
| 20 | **1** | 0 |
| 40 | **3** | 0 |
| 60 | **6** | 0 |
| 80 | 8 | 8 |

Identical destination, very different journey — differentiation is **when** stats become reachable.

**VIT-01 resolved.** Vitality 10 now ungates maxHp to rank 30; under the old 2× gate it topped out
at 26 forever.

## Re-run 3 — Elemental Resistance
Replaces flat DR. One resistance for all elements, armor still physical.

| FAIL check | Result |
|---|---|
| Physical-only tiers changed by resistance | **PASS** — never applied |
| Elemental damage below 50% of post-armor | **PASS** — floors at exactly 50% at rank 30 |

**The trivialisation test that killed flat DR.** Hits to down a 150HP survivor with an F-tier zombie:

| | hits |
|---|---|
| raw | 34.6 |
| armor alone at L80 | 49.9 |
| **Elemental Resistance at L80** | **81.0** |
| flat DR at L80 (retired) | 174.4 |

Low tiers still soften, but from gear the player chose rather than from a mechanic that punished
weak attackers hardest. Fixed by construction: resistance cannot touch a physical attacker.

### `[OPEN]` Elemental coverage is uneven
Tagged from the live bestiary:

| Tier | F | E | D | C | B | A | S | BOSS |
|---|---|---|---|---|---|---|---|---|
| elemental | 3/3 | **0/4** | 4/6 | 5/7 | 2/9 | 3/8 | 2/7 | **0/1** |

**E tier and the BOSS are entirely physical**, so Elemental Resistance does nothing against them.
For E tier that is probably fine — it is one early band. The BOSS is the problem: a stat every
player has fully maxed by L80 is dead weight in the fight the whole run builds toward. Either the
BOSS needs an elemental attack, or this is a deliberate "bring the right tool" statement. Worth
deciding before it is built.

## Re-run 4 — Catch-up scaling with absence
`allowance = ALLOWANCE × level-1 XP × min(daysAway, 14) / 14`

| Days away | Allowance granted |
|---|---|
| 2 | 7.1 XP |
| 5 | 17.9 XP |
| **14** | **50.0 XP** |
| 30 | 50.0 XP (capped) |

A fortnight away is worth **seven times** a skipped weekend, which is what Sam asked for. The
no-exploit rule holds: always-active finishes ahead of every intermittent pattern.

### The trade, stated plainly
Totals over 120 days shifted against the frequent-short-break player:

| Pattern | Flat allowance | Scaled allowance |
|---|---|---|
| 5-on / 2-off | 1.89% | **0.27%** |
| 10-on / 10-off | 0.80% | **0.57%** |

Scaling by absence length necessarily takes from the weekend player to give to the returner. That is
the trade Sam chose, and the ordering is now correct — but the weekend player gets noticeably less
than they did an hour ago.

## Updated constants

Removed: `ZI.FLAT_DR_PER_RANK`, `ZI.FLAT_DR_TIER_SCALE`, `ZI.DAMAGE_FLOOR_PCT`, and the 2.5 gate.

| Constant | Value | Source |
|---|---|---|
| `ZI.ATTR_CAP` | **10** | Addendum C1 |
| `ZI.ATTR_RANK_GATE` | **3** | Addendum C1 |
| `ZI.LAUNCH_MAX_LEVEL` | **80** (design max 100) | Addendum C2 |
| `ZI.ATTR_MILESTONE_LEVELS` | `[50]` `[PROPOSED]` | Addendum C2 |
| `ZI.ELEM_RESIST_CAP` | **0.50** over 30 ranks | Addendum C5 |
| `ZI.WEATHER_CLEAR_GUARANTEE_H` | **48** | WX-01 |
| `ZI.CATCHUP_AWAY_CAP_DAYS` | **14** | PROF-01 P5 |
| `ZI.CATCHUP_ACCRUAL_DAYS` | 2 | PROF-01 P2 |
| `ZI.CATCHUP_ALLOWANCE` | 0.50 of level-1 XP | PROF-01 P4 |
| `ZI.CATCHUP_MAX_RATE` | 0.15 | PROF-01 |
| `ZI.WEATHER_DURATION.*` | Spring 4–36, Summer 3–28, Autumn 6–48, Winter 10–96 | Pass 1 |
| `ZI.WEATHER_HAZARD_MAX_H` | 8 | Pass 1 |
| `ZI.WEATHER_FORECAST_BUFFER` | 3 events | Pass 1 |
| `ZI.CHILLED_TRIGGER_RUNG` | Soaked | Pass 1 |
| `ZI.CHILLED_CURE_H` | 2 | Pass 1 |

## What still needs Sam
1. **The BOSS has no elemental attack** — Elemental Resistance is dead weight in the final fight.
2. **Milestone level `[PROPOSED: 50]`** — the single bonus point's home is still a guess.
3. **The weekend player's reduced bonus** — correct ordering, but is 0.27% too little?

## Correction
FAIL check 2 in re-run 3 was implemented backwards on the first attempt — it tested for resistance
being too *weak* rather than too strong. Corrected before the result was recorded; the check as
written fails only if elemental damage drops below 50% of post-armor, which it never does.
