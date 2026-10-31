# VIT-01 — Max HP runaway for tank builds (slice brief, Oct 30)

**Decided Oct 31 (Sam): max HP has no ceiling.** R5 (the 300 HP stop) is dropped. R1–R4 are built in `game/progression-live.js` (`ZI.vitalityHp`, `ZI.VIT01`) but **dormant**: no Vitality value is stored yet (attribute storage is STAT-03, not decided). Not built: R6 (class gate) and the regen cost in §3. Open: the R3 gate (25) is above the attribute cap in AUD-01 (10), so the runaway cannot open until that is settled. Also: the live base adds only the stat's gain above 40, so the live ceiling before Endurance is 120, not the 160 used in §2.

**Status:** `[CONCEPT Oct 30]` from Sam — max HP is additive on the base, and "there should be a
runaway for max HP for certain builds". Everything below is `[PROPOSED]`.

## 1. What is locked

`[DECIDED Oct 30]` STAT-02's `maxHp` stat (40 → 60) is **additive** on the survivor's base 100
(`WANDER_REST_TABLE.maxHp`). The Wanderer at level 14 therefore has ~150 max HP. Not a double-count.

## 2. The problem

Additive-and-capped means max HP has a **hard ceiling of 160** no matter the build or the level.
From the harness, at divisor 3.0:

| Build | Max HP | First forced stop |
|---|---|---|
| L14 balanced (today) | 150 | 1.29 gd |
| L50 tank, fully capped | 160 | 1.30 gd |

A player who spends 30 ranks and an entire build on survivability buys **10 HP and one hundredth of
a game day**. That is a dead end — it fails the "no dead ends" pillar in the design lead brief, and
it means the Enforcer, Warden and Medic classes have nothing to scale into.

For contrast, lifting the ceiling:

| | Max HP | First forced stop |
|---|---|---|
| Runaway ×2 | 220 | 1.43 gd |
| Runaway ×3 | 280 | 1.70 gd |

So the runaway has real reach, and ×3 already pushes past the 1.5-day limit — the ceiling is what
keeps that limit honest, which means the runaway must be **earned and gated**, not free.

## 3. Proposed design

**Shape: a soft cap, not a raised cap.** Keep 40→60 as the ranked stat on the existing
diminishing-returns curve. Add a second, separate source that only tank-leaning builds can reach,
and let *that* run away.

| # | Rule | Tag |
|---|---|---|
| R1 | Max HP = `100 (base) + maxHp stat (40→60) + Vitality contribution + runaway` | `[PROPOSED]` |
| R2 | **Vitality** (SURVIVAL `V`) contributes +2 max HP per point, uncapped — this is the build signal | `[PROPOSED]` |
| R3 | The runaway unlocks only when `maxHp` rank is **at cap** AND Vitality is at or above a threshold (start: 25) | `[PROPOSED]` |
| R4 | Past that gate, each further Vitality point gives **+2 HP compounding at 1.5 %**, so late points are worth more, not less — the opposite of every other stat | `[PROPOSED]` |
| R5 | **Hard stop at 300 max HP** so the 1.5-day limit cannot be fully escaped | `[PROPOSED]` |
| R6 | Class gate: only classes with `V` or `S` as a primary (Enforcer, Medic, Warden) can pass R3's threshold | `[PROPOSED]` |

**Why compounding:** a runaway has to feel like a runaway. Every other stat in STAT-02 uses
`curveK = 1.5` diminishing returns; if max HP did the same it would be just another stat. Inverting
the curve past a high gate is what makes a tank build a *choice* rather than a rounding error.

**Why a hard stop:** §2 shows ×3 breaking the 1.5-game-day limit that TIER-01 was tuned to. 300 keeps
the best tank around 1.75 gd — meaningfully tougher, still mortal.

**The cost.** The runaway must be paid for, or it is strictly better than not taking it. Proposed:
HP regen (`hpRegen`) scales **down** with the runaway, so a tank has a huge pool that refills slowly.
That makes rest time the tank's weakness and keeps the rest economy (the biggest lever on income)
load-bearing. `[PROPOSED]`

## 4. Interactions to check before building

1. **TIER-01.** The divisor was tuned to a 150 HP survivor. A 300 HP tank sits at ~1.75 gd, outside
   the 1.0–1.5 window. Decide whether that window describes the *starting* survivor only.
2. **`ranksToCap` / `curveK`** in `game/progression.js` — R4 needs a per-stat override, and the
   config already has an unused `perStatK` field for exactly this.
3. **Retreat and resume gates** are percentages (retreat 30 %, resume 80 %). At 300 HP those are 90
   and 240 HP, so rest time roughly doubles. This is the cost in R3's paragraph — confirm it is
   intended and not an accident.
4. **Shield** (50→80) is currently hidden (`hiddenStats`). If tanks are a real build, Shield probably
   un-hides with them.
5. **Status states.** Wounds/Sickness tiers apply hidden modifiers; confirm none are flat HP numbers
   that become trivial at 300.

## 5. Open

- `[OPEN]` Is the Vitality threshold (R3) the right gate, or should it be a perk pick at a checkpoint
  level?
- `[OPEN]` Does the regen penalty (§3 cost) apply to the whole pool or only the runaway portion?
- `[OPEN]` Should Camp Leader mode's squad survivors get the runaway, or is it Solo-only?

## 6. Not in this slice

Shield rework, armor/evasion changes, the attribute → effect map in
`market-01-pricing-and-clock-sim-oct30.md` §6 (still unapproved), TIER-01 and TIER-02.
