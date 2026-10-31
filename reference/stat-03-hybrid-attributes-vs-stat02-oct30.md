# STAT-03 — SURVIVAL attributes and STAT-02 ranks: how to hybridise them (Oct 30)

`[PROPOSED]` by Claude at Sam's request. Nothing here is implemented. Sam to `[DECIDE]` §5.

## 1. The two systems as they stand in live code

### System A — SURVIVAL attributes (`game/core.js` `ZI.SURVIVAL_ATTRS`)
Eight attributes spelling **SURVIVAL**: Survival, Underhandedness, Reflex, Vitality, Insight,
Valor, Aptitude, Lucky. Each has a written identity (hazard tolerance, stealth, dodge, max HP,
loot/tech, melee and carry, stamina, drop luck). `ZI.CLASSES` gives each of 8 classes two primary
attributes. **No attribute currently drives a number.** The effect map is still the `[PROPOSED]`
table from Oct 30 and has not been reviewed.

### System B — STAT-02 ranked stats (`game/progression.js`)
Ten *hidden* stats, each ranked 0 → `ranksToCap: 30` on a `curveK: 1.5` diminishing curve:

| | | | |
|---|---|---|---|
| Max HP 40→60 | HP Regen 10→20 | Shield 50→80 | Armor 0→40% |
| Evasion 1→25% | Damage 1.00→1.30× | Crit Chance 1→35% | Crit Damage 2.00→3.00× |
| Attack Speed 100→150% | Move Speed 1.07→1.25× | | |

Picks: `offerSize: 3` offered per level-up, `evenOnlyUntil: 35` (even levels only to L35), extra
pick at `checkpoints: [10,20,35,50,70,85,90,95,100]`. This system **is** wired — combat, status
effects (`Starving`, `Badly Hurt`, `Feverish`) and `DEFENSE` groupings all read these keys.

### The overlap problem
They are not alternatives; they are the *same numbers* described twice.

| STAT-02 stat | SURVIVAL attribute that claims it |
|---|---|
| Max HP | Vitality ("Max HP, wound resistance") |
| Evasion | Underhandedness ("escape chance, evasion") |
| Crit / Attack Speed | Reflex ("speed, precision, dodge") |
| Damage, carry | Valor ("melee power, carry capacity") |
| Move Speed, stamina | Aptitude ("stamina, sprint duration") |
| Armor / hazard | Survival ("hazard tolerance, resistance") |
| — loot/tech | Insight (no STAT-02 equivalent) |
| — drop luck | Lucky (no STAT-02 equivalent) |

Six of eight attributes duplicate a ranked stat. Two (Insight, Lucky) have no ranked stat at all.
Shipping both as written would pay the player twice for Vitality and once for nothing on Insight.

## 2. The hybrid: attributes are *budgets*, ranks are *purchases*

The cleanest reading that keeps both, and keeps everything already wired:

> **SURVIVAL attributes decide what you may raise. STAT-02 ranks are the raising.**

- Each of the 10 ranked stats is **owned by one attribute**. Raising a rank spends a point of that
  attribute's budget.
- A level-up grants **1 attribute point** (the Oct 28 doc's rule) *and* the STAT-02 offer of 3.
  The offer is filtered to stats whose owning attribute has budget.
- Attribute level therefore gates **how far** a rank can go: `rankCap(stat) = min(30, 3 × attr)`.
  A survivor who never invests in Vitality cannot climb Max HP past rank 3.
- Class primaries (`ZI.CLASSES`) make their two attributes cheaper — the 1.25× multiplier already
  proposed — so a Ranger really is faster and sneakier, without a separate bonus system.

### Ownership map `[PROPOSED]`

| Attribute | Owns (STAT-02) | Owns (new, see §3) |
|---|---|---|
| **S**urvival | Armor | hazard resist |
| **U**nderhandedness | Evasion | escape chance |
| **R**eflex | Crit Chance, Attack Speed | — |
| **V**itality | Max HP, HP Regen | — |
| **I**nsight | — | RMAT yield, rare-loot chance |
| **V**alor | Damage, Crit Damage | carry capacity |
| **A**ptitude | Move Speed, Shield | stamina |
| **L**ucky | — | legendary drop, extra-token chance |

Every ranked stat gets exactly one owner, so no stat is paid for twice.

## 3. What this fixes, and the one thing it needs

**Fixes:** VIT-01's dead end. ART/VIT-01 found that 30 ranks of survivability buys 10 HP and 0.01
game days, because `maxHp` is capped at 60 additive. Under the hybrid, Vitality is the uncapped
build signal and `maxHp` rank is gated by it — which is exactly the structure VIT-01 proposed, but
falling out of the system rather than bolted on.

**Needs:** Insight and Lucky own nothing that exists. They need two or three real stats added to
`P.STATS` (RMAT yield, rare-loot chance, legendary chance) or they remain flavour text. That is the
only new wiring the hybrid requires.

## 4. What it does NOT do
- It does not replace STAT-02. Every key, curve, status-effect modifier and `DEFENSE` grouping
  keeps working; the change is a filter on which stats are *offered*.
- It does not touch Profession XP (16 tracks, `game/stats.js`). Those stay the third, orthogonal
  system: attributes are build choice, ranks are the numbers, professions are learned experience.

## 5. `[DECIDE]`
1. Adopt "attributes gate ranks" as the hybrid, or keep the two systems separate?
2. Accept the §2 ownership map, or redraw it?
3. Add stats for Insight and Lucky, or let those two attributes stay cosmetic for now?
4. `rankCap = 3 × attr` — right ratio? At 30 ranks it means attribute 10 fully unlocks a stat.

---

# Addendum A — three stats per attribute (Sam, Oct 30, voice)

`[DECIDED Oct 30, Sam]` Insight and Lucky must own real stats. `[PROPOSED]` every attribute owns
**three**, so the eight are symmetric and no attribute is flavour text.

## A1. The full ownership map — 24 ranked stats

Existing STAT-02 stats in **bold**; the rest are new and need adding to `P.STATS`.

| Attribute | Stat 1 | Stat 2 | Stat 3 |
|---|---|---|---|
| **S**urvival | **Armor** | Hazard Resist | Status Resist |
| **U**nderhandedness | **Evasion** | Escape Chance | Noise Reduction |
| **R**eflex | **Crit Chance** | **Attack Speed** | Accuracy |
| **V**itality | **Max HP** | **HP Regen** | Wound Resist |
| **I**nsight | Rare Loot Chance | Craft Tier-Up Chance | RMAT Yield |
| **V**alor | **Damage** | **Crit Damage** | Carry Capacity |
| **A**ptitude | **Move Speed** | **Shield** | Stamina |
| **L**ucky | Legendary Drop Chance | Extra Currency Chance | Extra Loot Roll |

10 existing + 14 new = **24**. Each attribute owns exactly three, so nothing is paid for twice and
nothing is unowned.

### The third stats, and why
- **Insight → RMAT Yield.** Covers the "RMAT attunement" half of the attribute's own description,
  which nothing else claimed. Insight now reads cleanly as *what you get and how good it is*:
  rarer loot, better crafts, more material.
- **Lucky → Extra Loot Roll.** A chance at a second roll on any loot table. Keeps Lucky about
  *quantity and jackpots* while Insight owns *quality*, so the two never collide. Legendary Drop
  sits with Lucky rather than Insight because it is a jackpot, not a grade.

`[OPEN]` Rare Loot (Insight) and Legendary Drop (Lucky) are adjacent. Fine if Insight shifts the
whole rarity curve and Lucky adds a flat top-end jackpot roll; worth confirming before building.

## A2. What 24 stats does to the pick economy

Picks available by L100: **82 standard** (`evenOnlyUntil: 35`, then every level) + **9 checkpoint**
= **91**.

| Stats | Ranks to cap all | Picks as % of that | Even spread | Stats you can fully cap |
|---|---|---|---|---|
| 10 (today) | 300 | 30.3% | 9.1 ranks each | **3** |
| 14 | 420 | 21.7% | 6.5 | **3** |
| **24** | 720 | 12.6% | **3.8** | **3** |

**The ceiling does not move.** 91 picks ÷ 30 ranks = 3 fully-capped stats whatever the stat count,
so going to 24 costs no specialisation depth. What changes is the generalist: spreading evenly now
buys 3.8 ranks per stat instead of 9.1 — thin enough that most stats stay near their start value.

That is the real effect of this decision: **24 stats makes specialising mandatory rather than
merely better.** If that is the intent, it works. If a generalist build should stay viable, either
keep the count nearer 14 or raise `offerSize`/pick frequency to match.

## A3. The attribute gate as written is non-binding — fix the ratio

STAT-03 §2 proposed `rankCap = min(30, 3 × attr)` with 1 attribute point per level. Checked:

- 99 attribute points by L100, 8 attributes → **12.4 each** if spread evenly.
- At attr 12, `3 × 12 = 36`, which is **above** the 30-rank cap.

So for anyone past roughly attribute 10 the gate never binds, and a specialist blows through it
immediately. It gates the early game only.

`[PROPOSED]` `rankCap = min(30, 2 × attr)` — attr 12 unlocks rank 24 of 30, so the gate still
matters late for a generalist while a specialist (attr 15+) is unconstrained. That keeps the
intended shape: commit early, free later.

## A4. `[DECIDE]`
1. Confirm the 24-stat map in A1, especially the two new third stats.
2. "Three bonuses per level up" — does that mean *each attribute owns three stats* (how A1 reads
   it), or *three rank offers per level-up* (which `offerSize: 3` already does)? If both, no change
   is needed to `offerSize`.
3. Is forcing specialisation (A2) the intent, or should generalists stay viable?
4. Gate ratio: 2× as proposed, or another number?

---

# Addendum B — Full Breakdown panel, shield, and attribute caps (Sam, Oct 30, voice)

## B1. Full Breakdown panel `[DECIDED Sam]`

A button on the stats screen opens **one scrolling page** — not tabs — with three sections in this
order: **Attack, Defence, Utility**.

Each stat is one row showing its total, expandable into where the total came from:
**Base / Level / Gear / Effects**. Negatives render in red, so a player can see at a glance what is
hurting them (weather, wounds, afflictions) rather than only what is helping.

| Section | Header number | Contents |
|---|---|---|
| **Attack** | combined **damage per second** | damage, crit chance, crit damage, attack speed |
| **Defence** | **effective health** — HP + shield scaled by armor and evasion. hpRegen is excluded and gets its own row | maxHp, hpRegen, armor, evasion, (shield from gear) |
| **Utility** | none — too mixed for one number | two groups: **Movement** (moveSpeed) and **Loot** (the six Insight/Lucky stats) |

Why Utility has no header: its stats do not combine into anything a player would compare. DPS and
effective health both answer "is this gear better"; "rare loot chance plus move speed" answers
nothing.

## B2. Shield leaves the rank system `[DECIDED Sam]`

**Shield comes only from items.** It is removed from `P.STATS` ranks (it was 50 → 80 over 30 ranks).
In the Full Breakdown it therefore appears under Gear only, never under Level.

That leaves Aptitude one stat short of three, so its slot is taken by:

**Flat damage reduction `[DECIDED Sam]`** — subtracts a fixed amount from every incoming hit, while
**armor stays the percentage reducer**. The two must not be the same mechanic twice.

Sam's concern, recorded because it drives pass 3: this is an idle game ground against many zombies,
so flat reduction is the dangerous kind. Grow it faster than zombie damage and whole low tiers do
literally nothing; grow it slower and the stat is dead weight. Two guards, both `[PROPOSED]`:

1. **Minimum damage floor** — every hit always lands for at least **20%** of its damage.
2. **Tier scaling** — the flat amount is scaled against the zombie's tier, so it shines against
   swarms in the current zone without trivialising them.

→ Both go to **audit pass 3**, which fails the design if any current-zone tier becomes harmless or
if flat DR contributes under 5% mitigation at L35–70.

## B3. Attribute caps and convergence  ~~`[DECIDED Sam]`~~  **SUPERSEDED by Addendum C**

> Cap 13 / 104 points / milestones at L20-85 are **retired**. See Addendum C below.


**Every build converges at L100.** Sam's reasoning: everyone faces the same final boss, so everyone
needs the full kit available. What differentiates players is the **order** they take things in, not
where they end up.

The arithmetic that forced a decision:

- 1 attribute point per level, L2–L100 = **99 points**
- 8 attributes × cap 12 = 96 → everything maxes at about L97, leaving the last levels with nothing
  to spend

So: **5 milestone points** at **L20, 35, 50, 70 and 85**, spread through the mid game where the
grind is longest. 99 + 5 = **104**, and 8 × **13** = 104. **Attribute cap is 13**, and the last
level-up still matters.

→ **Audit pass 2** confirms convergence and measures how different a focused build feels from an
even one at L25/50/75.
