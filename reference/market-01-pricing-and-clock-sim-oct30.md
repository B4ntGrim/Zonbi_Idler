# MARKET-01 — Shop pricing + CLOCK-01 simulator rebase (Oct 30)

**Status:** Claude (Creative Direction) design pass. New harness at `tools/balance-sim/clock_sim.py`.
No production code, spec or save changed. Prices below are `[PROPOSED]` placeholders.

## 1. Why the old numbers could not be reused

`balance_regen_sim.py` and `curse_rerun.py` (round 8, Oct 21) are **not in the project** — only
their reports survive. Every BALANCE-03 round also modelled a "day" as 24 hours of survivor
activity. CLOCK-01 makes one game day **24 real minutes** (1 game hour = 60 real seconds,
`game/core.js REAL_MS_PER_GAME_HOUR = 60000`), so those per-day figures describe a day the
game no longer has. The harness was rebuilt on a real-second tick with game days derived from it.

Calibration: survivor hit 20, zombie accuracy 70%, round-based as `game/combat.js`. This
reproduces the recorded damage per fight (T0 6.9 / T1 13.5) within ~10%, so the rebuilt model
matches the old one where the old one was measured.

## 2. Finding: tier escalation, not regen, ends the first day

Tiers unlock by **distance walked**, not by day: `_bgZombie` draws any tier whose rank
≤ `floor(lap / 1.5)`, lap = `floor(scroll / 100)`, and the survivor walks 1.4 m/s. So rank *r*
unlocks after ~107·*r* real seconds — **BOSS is drawable 0.52 game days in**. A starting
survivor meets every tier in the roster before the end of game day 1.

Regen barely moves this. Across 60–180 s pacing and 0–40 %/min regen, the first forced stop
never passed **0.69 game days**. The target (survive day 1, hard limit ~1.5 days) is
unreachable while the divisor is 1.5.

| Tier divisor | First forced stop (game days) | BOSS drawable at |
|---|---|---|
| 1.5 (live) | 0.44–0.47 | 0.52 gd |
| 3.0 | 0.61–0.82 | 1.04 gd |
| 4.3 | 0.75–1.12 | 1.49 gd |
| **6.0** | **1.08–1.43** | **2.08 gd** |
| 9.0 | 1.31–2.07 | 3.12 gd |

**Superseded — see §6.** The 6.0 figure was tuned against a flat placeholder survivor. Once the
STAT-02 + SURVIVAL framework is applied to the real starting survivor, the correct value is **3.0**.

## 3. 80-game-day run (interval 90 s, regen 10 %/min, divisor 6.0, 12 seeds)

80 game days = **32 real hours** of continuous field time.

| | |
|---|---|
| Kills | 392 (12.2 / real hour **with rest**) |
| Currency | 554 (17.3 / real hour, 6.9 / game day) |
| Mean currency per kill | 1.41 |
| Forced retreats | 142.7 (≈1.8 / game day — inside the 2–5 target) |

**Rest dominates.** Continuous fighting gives ~33 kills/real hour; once rest to the 80 % resume
gate is included it falls to **12.2**. This restates the Oct 17 finding ("rest is about 23 h/day")
on the new clock, and it is the single biggest lever on income.

## 4. Price placeholders

Anchored to Sam's placeholder of **30 kills per real hour** → at 1.41 per kill, **42 currency per
real hour**, 17 per game day, ~85 per real day at 2 h play. *If the simulated 17.3/real hour
proves truer in play, halve every figure below.*

| Item | Price | ≈ play time |
|---|---|---|
| Shelf: basic material (unit) | 3 | 5 min |
| Shelf: basic supply / consumable | 11 | 15 min |
| Shelf: stack of 5 basics | 17 | 25 min |
| Jester: rare world-drop component | 64 | 1.5 h |
| Jester: exclusive component (Unique gear) | 127 | 3 h |
| QoL: extra task queue slot | 339 | 8 h |
| QoL: auto-eat from stash | 424 | 10 h |
| QoL: auto-repeat tasks | 509 | 12 h |
| QoL: auto-send junk to recycler | 594 | 14 h |

QoL unlocks stay progress-gated first and purchasable second (Sam, Oct 27).

## 5. Open items for Sam

1. **SS is not a tier.** `world.js tierLabelShort` maps **BOSS → "SS"** for display. The roster has
   eight tiers (F E D C B A S BOSS). The Oct 30 drop table assigned SS 2–4 *and* BOSS 2–5 to what
   is one tier. Pick one range, or add a real SS tier to the roster.
2. **Drop table as recorded:** F/E 1, D 1, C 1–2, B 1–2, A 1–3, S 1–4, BOSS 2–5.
3. **Tier divisor 1.5 → 6.0** needs locking before Code touches `_bgZombie`.
4. **Currency needs its own name** — "RMAT" currently means both the shop currency and the T0–T5
   crafting materials, which stay separate (Sam, Oct 30).
5. Shelf refresh moved to **local midnight on real days** (was 06:00 game time).


## 6. Survivor stat framework (added Oct 30, same session)

Located in the live source, not re-invented:

| Thing | Where | Contents |
|---|---|---|
| SURVIVAL acronym | `game/core.js` `ZI.SURVIVAL_ATTRS` | **S**urvival, **U**nderhandedness, **R**eflex, **V**itality, **I**nsight, **V**alor (`V2`), **A**ptitude, **L**ucky |
| Classes | `game/core.js` `ZI.CLASSES` | 8 classes, each with two primary attributes + mastery level (standard 6 / advanced 8 / elite 10) |
| Profession XP | `game/stats.js` `ZI.PROFESSIONS` + `ZI.ACTION_XP` | 16 tracks, fed by a weighted action→profession split |
| Per-level bonuses | `game/progression.js` `ZI.PROG` (STAT-02) | 10 hidden-rank stats, `offerSize: 3`, extra pick at checkpoints 10/20/35/50/70/85/90/95/100 — the "3 to 4 bonuses per level" |
| Level-14 Ranger | `game/economy.js`, `game/routes.js` | **The Wanderer**, the Solo Survivor start |

New harness module `tools/balance-sim/survivor_stats.py` parses all of the above out of the live
source at run time (so it cannot drift) and produces one StatBlock covering damage output, damage
resistance, and the utility bonuses: move speed, XP %, RMAT currency and luck.

### Attribute → effect map `[PROPOSED Oct 30 — none of this is locked]`

| Attr | Per point |
|---|---|
| S Survival | +1.0 % hazard resistance |
| U Underhandedness | +0.6 % evasion, +0.8 % escape |
| R Reflex | +0.5 % crit chance, +0.6 % attack speed |
| V Vitality | +2 max HP |
| I Insight | +1.2 % RMAT currency, +0.5 % XP |
| V2 Valor | +1.0 % damage, +0.5 kg carry |
| A Aptitude | +0.4 % move speed, +1.5 stamina |
| L Lucky | +1.0 % luck, +0.8 % chance of an extra currency token |

A class counts its two primary attributes at **1.25×**. RMAT Chemist keeps its stated +40 % yield.
The two currency gear stats Sam decided on Oct 30 (percent chance, and a rare flat +1) map onto
**Lucky** and **Insight** respectively.

### Effect on the numbers

The Wanderer at level 14 earns **8 stat picks** → max HP 150, 23.0 damage per hit, 4.1 % armor,
7.2 % evasion, 11 %/min regen, RMAT ×1.04.

| | Flat placeholder | With the framework |
|---|---|---|
| Kills / 80 game days | 392 | 613 |
| Currency / real hour | 17.3 | 28.6 |
| Forced retreats | 142.7 | 91.2 |
| First forced stop | 1.24 gd | 2.13 gd |

**Re-tuned recommendation:** with the real survivor, the `_bgZombie` divisor should be
**1.5 → 3.0**, giving a first forced stop at **1.26 game days** and ~29 currency per real hour —
which also lands close to the 30 kills/hour placeholder the prices were built on, so §4 stands.

### Open for Sam
6. **Max HP conflict.** `WANDER_REST_TABLE.maxHp` is 100, but STAT-02's `maxHp` stat runs 40→60.
   Treated here as *additive* per STAT-02 H4 ("the 10 stats add on top of current survivor stats"),
   giving 150 at level 14. Confirm that is the intent and not a double-count.
7. The attribute → effect map above is the framework's one invented piece. Everything else is read
   from live source. It needs your pass before Code builds on it.
