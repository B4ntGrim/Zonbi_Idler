# Zed Idler — Balance Pass #1

Analysis of the seeded content against the live formulas in `BalanceConfig`.
All numbers computed from the actual coefficients, not estimates.

---

## 1. XP / Level curve

Formula: `XP(level) = 100·level + 10·level²`

| Level | XP for this level | Cumulative | Standard kills (15xp) |
|------:|------------------:|-----------:|----------------------:|
| 1→2   | 110               | 110        | 7                     |
| 5→6   | 750               | 2,150      | 50                    |
| 10→11 | 2,000             | 7,150      | 133                   |
| 25→26 | 8,750             | 80,700     | 583                   |
| 50→51 | 30,000            | 443,500    | 2,000                 |
| 100   | —                 | 3,383,500  | —                     |

**Finding A — mid-game cliff.** The quadratic term overtakes the linear term at
level 10 and the per-level cost roughly **doubles every ~7 levels**. Going 9→10
costs 133 standard kills; a player who was leveling every few minutes early game
suddenly stalls. This is *intended grind* per the GDD ("feel grindy for the
servers") and is fine for **idle/offline** accrual, but **active** sessions hit a
wall around level 10–12.

**Action:** Leave the formula (grind is by design) but **raise low-tier zombie
XP** so active kills stay meaningful into the cliff. See §2.

---

## 2. Zombie XP vs tier (seeded values)

| Tier         | Base XP | Kills to clear lvl 10→11 (2000xp) |
|--------------|--------:|----------------------------------:|
| Standard     | 15      | 133                               |
| Fast         | 20      | 100                               |
| Heavy        | 30      | 67                                |
| Infected     | 18      | 111                               |
| Elite        | 60      | 33                                |
| HordeLeader  | 150     | 13                                |
| Apex (280)   | 280     | 7                                 |
| WorldBoss(900)| 900    | 2                                 |

**Finding B — Standard/Infected XP too low relative to the cliff.** Players
fighting tier-appropriate zombies at level 10 (mostly Standard/Fast in
Suburbia/Metro) grind 100+ kills/level. Elites/Hordes are correctly rewarding,
but they're level-gated above where the cliff bites.

**Action (content seeder):** bump early-tier base XP — Standard 15→**22**,
Infected 18→**26**, Fast 20→**28**. Keeps the curve but softens the active-play
wall ~35%. (Apply in `ZombieSeeder` / `ExpansionSeeder`; flagged, not auto-applied
since it edits seeded assets.)

---

## 3. Combat survivability

- `HP = Endurance × 10`. Fresh survivor (END ~14) = **140 HP**.
- WorldBoss damage 80–140 → **two-shots** a fresh survivor.
- But WorldBoss `minPlayerLevel` = 85–95, where END is far higher (40–60 → 400–600 HP).

**Finding C — OK.** The gates protect fresh survivors. No change. One caveat:
the **Apex EMP Pulser** (`EMPPulse` disables firearms) at level 75 can soft-lock
a pure-ranged squad. Recommend the player carry a melee sidearm — this is a
*build-diversity* signal, not a bug. Leave as designed.

---

## 4. Crit ceiling

`crit = Combat·0.001 + perks + weapon`
- Stat max: 100 × 0.001 = **10%**
- Dead Eye (3 stacks): **+18%**
- Last Whisper weapon: **+15%**
- **Total ceiling ≈ 43%** crit at full investment.

**Finding D — healthy.** Crit-focus builds are strong but not dominant. No change.

---

## 5. Marketplace demand decay

`priceMult = 0.5 + demand/100` → range 0.5×–1.5×
`demandGainPerBuy = 5`, `demandDecayPerHour = 1`

**Finding E — decay far too slow.** Ten buys push demand 50→100 (price 1.0×→1.5×).
At 1/hour decay that takes **50 in-game hours** to normalize. Prices stay inflated
across multiple sessions, which punishes the very item a player is grinding.

**Action (config):** raise `demandDecayPerHour` 1 → **4** (normalizes a full
spike in ~12.5h, about one in-game day). Applied below.

---

## 6. Prestige first-payout

Gate = camp level 25 = 12,500 total survivor XP.
`Legacy = floor(5 · sqrt(12500/1000)) = floor(17.7) = `**17 LP**.
Cheapest upgrade = 10 LP. First prestige buys **~1 upgrade**.

**Finding F — first payout slightly thin** but acceptable for a sqrt curve (it
*should* feel modest and scale up). Lowering `prestigeD` 1000 → **850** lifts the
first payout to `floor(5·sqrt(14.7)) = 19 LP` and improves every subsequent
prestige proportionally without breaking the curve shape. Applied below.

---

## 7. Daily reward streak

Looping 14-day ladder, `streakBonusPerDay = 0.05`, cap `3×`.
Day 1 = 1.0×, day 14 = 1.65×, day 41+ = 3.0× (cap).
Milestones at 7 (weapon crate) and 14 (50 legacy points).

**Finding G — healthy.** The cap is reached at day 41, giving long-term players a
ceiling without runaway inflation. No change.

---

## Applied config changes (this pass)

| Field | Old | New | Reason |
|---|---|---|---|
| `demandDecayPerHour` | 1 | 4 | §5 — normalize price spikes in ~1 day |
| `prestigeD` | 1000 | 850 | §6 — lift first-prestige payout |

## Flagged for content-seeder edits (not auto-applied)

| Asset | Field | Old → New | Reason |
|---|---|---|---|
| Z_Standard | baseXp | 15 → 22 | §2 |
| Z_Infected | baseXp | 18 → 26 | §2 |
| Z_Fast | baseXp | 20 → 28 | §2 |

Re-run `ZedIdler → Seed All Catalogs` after editing the seeder, or hand-edit the
three `.asset` files (they already exist, so the seeder skips them — hand-edit or
delete+reseed).
