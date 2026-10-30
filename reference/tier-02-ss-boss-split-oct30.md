# TIER-02 — Split SS and BOSS into separate tiers (slice brief, Oct 30)

**Status:** `[CONCEPT Oct 30]` from Sam — "establish an SS tier and a boss tier separate from one
another". Numbers below are `[PROPOSED]`.
**Why this exists:** the Oct 30 currency drop table assigned SS 2–4 *and* BOSS 2–5, but they are
currently the **same tier**: `ZI.TIER_ORDER` ends `…'S','BOSS'` and `world.js tierLabelShort` maps
`BOSS → "SS"` for display. One tier cannot carry two drop ranges.

## 0. Update Oct 30

Sam locked: canon roster is art IDs 49-108; S = 68 px, SS = 76 px, BOSS = 86 px; SS gets 3 new zombies.
See `reference/bestiary-03-ss-tier-roster-oct30.md`. Ranks become 0-8 with SS at rank 7.

## 1. Decision

Make SS a real tier sitting **between S and BOSS**. Nine tiers, ranks 0–8:

| Rank | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|---|
| Tier | F | E | D | C | B | A | S | **SS** | BOSS |

**Why separate:** they are different kinds of encounter. BOSS is scripted and placed (the Chained
Behemoth is a prison/industrial boss, one entry in the roster). SS should be the **top of the
wandering ladder** — an elite the player can meet in the field and choose to fight. Folding the two
meant the only "elite" a wanderer ever met was a boss that was never meant to roam.

## 2. Proposed rules

| # | Rule | Tag |
|---|---|---|
| T1 | `ZI.TIER_ORDER = ['F','E','D','C','B','A','S','SS','BOSS']` | `[PROPOSED]` |
| T2 | The rank ceiling becomes `min(8, …)` everywhere it is `min(7, …)` for tier draws | `[PROPOSED]` |
| T3 | **Retire `tierLabelShort`.** SS is now its own label; BOSS displays as "BOSS" | `[PROPOSED]` |
| T4 | Add `SS` to `ZI.BESTIARY_TIERS` with its own color and label | `[PROPOSED]` |
| T5 | **BOSS is removed from the wandering draw.** `_bgZombie` draws F–SS only; BOSS is placed, not roamed | `[PROPOSED]` |
| T6 | Currency: **SS 2–4, BOSS 2–5** (the Oct 30 table, now with two tiers to sit on) | `[PROPOSED]` |
| T7 | Roster: **3 new SS zombies** — now designed in `reference/bestiary-03-ss-tier-roster-oct30.md`. Stats still ~255 HP, ~21 dmg, ~3 armor, ~265 XP `[PROPOSED]` | `[DECIDED Oct 30]` (that SS gets 3) |

**Why 3 SS entries:** the draw is uniform over roster *entries*, not tiers (`_bgZombie` picks
`pool[floor(rng × pool.length)]`). S has 7 entries; a single SS would appear ~1/7 as often as the S
band and never read as a ladder step. Three gives it presence without swamping A and S.

**Why T5:** with BOSS in the pool a wanderer meets the Behemoth by chance at 1.19 game days. Bosses
should be sought, not stumbled into. This also protects the "never gate core progression behind
randomness" pillar.

## 3. Checked against the harness

Ran with a 9-tier roster, 3 SS placeholders, ceiling `min(8,…)`, divisor 3.0:

| | |
|---|---|
| First forced stop | **1.25 game days** (was 1.26 at 8 tiers — inside the 1.0–1.5 window) |
| Kills / real hour | 18.6 |
| Currency / real hour | 28.0 |

**TIER-01 is unaffected.** Divisor 3.0 still holds. Unlock schedule at 3.0: F 0.00, E 0.15, D 0.30,
C 0.45, B 0.60, A 0.74, S 0.89, **SS 1.04**, BOSS 1.19 game days. If T5 is taken, the BOSS row is a
placement threshold, not a wandering unlock.

## 4. Likely files

`game/world.js` (`TIER_ORDER`, `wanderDrawableTiers`, `tierLabelShort`, the comment at ~325),
`game/wandering.js` (`_bgZombie` rank map and ceiling), `bestiary-data.js` (`BESTIARY_TIERS` + 3 new
entries), `screens-v3.jsx` (~2154 `maxRank`, and any "SS" label logic), `zombie-sprites.js` (art for
the 3 new entries), `CODE_STATE.md`.

## 5. Watch for

1. **The rank map is duplicated.** `_bgZombie` has its own literal `{F:0,…BOSS:7}` separate from
   `TIER_ORDER`. Both must gain SS or draws and display desync.
2. **Codex / bestiary counts.** The roster is described as "45 zombies" in several documents; three
   additions make 48. The index and any count copy need updating together.
3. `scavengingXpForKill(tierRank)` is `6 + tierRank × 2` — a 9th rank quietly raises the XP ceiling.
4. Saves store tier letters in discovered/codex data; adding a tier is additive, but confirm no
   save reads a fixed 8-length array.

## 6. Open

- `[OPEN]` Do the 3 SS zombies get designed now, or does TIER-02 ship with the tier wired and the
  roster filled in a later content batch?
- `[OPEN]` Does BOSS leaving the wandering draw (T5) break the Fort or horde systems, which may
  assume BOSS is drawable?
