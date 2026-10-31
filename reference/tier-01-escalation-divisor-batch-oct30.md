# TIER-01 — Tier escalation divisor (batch contract draft, Oct 30)

**Batch ID:** TIER-01
**Status:** `[DECIDED Oct 31, Sam]`: divisor 3.0 as proposed. Applied Oct 31; report in `reports/decisions-2026-10-31/REPORT.md`; acceptance checks in `tests/tier-01-divisor.test.js`.
**Source of truth:** `reference/market-01-pricing-and-clock-sim-oct30.md` §2 and §6; harness
`tools/balance-sim/clock_sim.py` + `survivor_stats.py`.
**Target:** E:\Zed_Idler
**Handoff:** copy into `CURRENT_BATCH.md` when STAT-02 closes. Report to `reports/TIER-01/`.

> **Do not start while STAT-02 is still open.** STAT-02 is Live with open items; this contract
> changes encounter difficulty and would confound its remaining checks.

## 1. Goal

Slow zombie tier escalation so a starting survivor survives game day 1 and is forced to stop
around 1.5 game days, and move the divisor out of three hard-coded copies into one constant.

**Why:** tiers unlock by distance walked, not by day. With `lap = floor(scroll/100)` and a tier
drawable at `rank ≤ floor(lap/1.5)`, and the survivor walking 1.4 m/s, rank *r* unlocks after
~107·*r* real seconds. BOSS is drawable **0.52 game days** in, so the starting survivor meets the
whole roster before the end of day 1. Regen does not fix this: across 60–180 s pacing and 0–40 %/min
regen the first forced stop never passed 0.69 game days.

## 2. Decided behaviour  `[DECIDED Oct 31]`

| # | Rule | Tag |
|---|---|---|
| D1 | Introduce one constant, `ZI.TIER_LAP_DIVISOR`, in `game/core.js` beside the other clock/rate constants | `[PROPOSED]` |
| D2 | Set it to **3.0** (was 1.5) | `[PROPOSED]` |
| D3 | Every drawable-tier calculation reads that constant. No file keeps its own copy | `[PROPOSED]` |
| D4 | The Push On boost term is unchanged | `[PROPOSED]` |
| D5 | The rank ceiling stays `min(7, …)` **unless TIER-02 lands first**, which raises it to `min(8, …)` — see `reference/tier-02-ss-boss-split-oct30.md` | `[PROPOSED]` |
| D6 | `game/camp.js:278` horde tier (`1 + floor(t/1.5)`) is a **different system** and is NOT changed | `[PROPOSED]` |

**Why 3.0:** measured against the real starting survivor (The Wanderer, L14 Ranger, 8 STAT-02
picks) rather than a flat placeholder. First forced stop **1.26 game days** — inside Sam's
1.0–1.5 window — at ~19.6 kills and ~29 currency per real hour.

| Divisor | First forced stop | Verdict |
|---|---|---|
| 1.5 (live) | 0.92 gd (at 2.0) / ~0.5 gd | too fast |
| **3.0** | **1.26 gd** | **in window** |
| 4.0 | 1.63 gd | over |
| 6.0 | 2.19 gd | well over |

## 3. Likely files

- `game/core.js` — add `ZI.TIER_LAP_DIVISOR = 3.0` with a comment saying what it tunes
- `game/wandering.js` ~line 109 — `_bgZombie` pool filter
- `game/world.js` ~line 330 — `wanderDrawableTiers` (and the comment at ~325)
- `screens-v3.jsx` ~line 2154 — `maxRank` for the threat display
- `CODE_STATE.md` — record the constant and its three readers

## 4. Acceptance checks

1. `ZI.TIER_LAP_DIVISOR` exists in `game/core.js` and is the only literal.
2. `_bgZombie`, `wanderDrawableTiers` and the `screens-v3.jsx` threat readout all use it; a grep for
   `/ 1.5` in `game/` and `screens-v3.jsx` returns only `camp.js:278`.
3. **They cannot desync:** with the same scroll and boost, the tier range shown by `ZI.hideThreats`
   equals the set `_bgZombie` can actually draw. This is the main regression risk — the Hide screen
   promising a range the spawner contradicts.
4. At divisor 3.0 the top tier first becomes drawable at lap ≥ 21 (scroll ≥ 2,100 m) — **1.04 game
   days** of walking, not 0.52. (Corrected Oct 30: an earlier draft of this contract said 2.08 gd,
   which was the divisor-6.0 figure copied by mistake.)
5. Existing saves keep their scroll; no save migration.
6. `tests/trav-01a.test.js`, `tests/best1-enemy-identity.test.js`, `tests/batch2b.test.js`,
   `tests/split-equivalence.test.js` and `tests/char-crawler-ops.test.js` still pass (all touch
   `_bgZombie` or `wanderDrawableTiers`).

## 5. Explicitly out

- Encounter pacing (`encounterEverySec`), regen, rest rates, retreat thresholds.
- The horde tier in `camp.js`.
- Shop pricing (`market-01-…` §4) — a separate batch.
- The attribute → effect map in `market-01-…` §6 — still `[PROPOSED]`, not for implementation.
- The SS/BOSS split (TIER-02) and the max-HP runaway (VIT-01) — separate contracts.

## 6. Required verification

Code reports, before and after: the game day at which each tier first becomes drawable (F through
BOSS), for a survivor walking at 1.4 m/s from scroll 0. Expected after, ranks 0–7: **0.00 / 0.15 / 0.30 / 0.45 /
0.60 / 0.74 / 0.89 / 1.04** game days at the 24-real-minute day. Any disagreement with the harness is
reported as a Design Handoff rather than silently retuned.

## 7. Recorded decisions from the same session

- `[DECIDED Oct 30]` STAT-02 `maxHp` (40→60) is **additive** on top of the base survivor HP of 100
  (`WANDER_REST_TABLE.maxHp`), giving ~150 for The Wanderer at level 14. Not a double-count.
- `[CONCEPT Oct 30]` Sam wants a **max-HP runaway for certain builds** — tank-leaning builds should
  be able to scale max HP well past the current ceiling. Not designed yet; no numbers. Needs its own
  slice, and it interacts with the rank curve (`ranksToCap`, `curveK`) and with the Vitality
  attribute. **Not part of TIER-01.**
