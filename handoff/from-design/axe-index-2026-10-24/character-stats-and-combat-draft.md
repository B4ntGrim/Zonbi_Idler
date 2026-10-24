# Zed Idler — Visible Character Stats and Combat Design

Status: BRAINSTORM / FORMULA PROPOSALS. Prepared 2026-10-24. The owner's metrics are a starting vocabulary for build planning, not permanent balance or authorization to change game code.

## Current-code findings

- E:/Zed_Idler/game/items.js defines ZI.GEAR_ITEMS, cat/slot mappings, rarity colors and loadout aggregation. Held axes fit weapon/melee; thrown consumables fit consumable/throwable.
- resolveLoadoutStats currently sums damage from every equipped weapon. Active-weapon selection and per-hand contribution must be designed before separate axe DPS is meaningful.
- E:/Zed_Idler/game/stats.js builds combatant blocks and resolves hit chance, flat critical bonus, flat armor subtraction, minimum chip, optional lifesteal, heavy swing and stagger. It is not already the proposed percentage pipeline.
- game/combat.js uses rounds; game/wandering.js calls that shared path and records displayed hits as replay. Attacks/s needs logical simulation time, not faster animation.
- game/active.js has a separate walk-home pursuer calculation whose current exception grants no XP, loot, kills or wear. Audit coverage without silently expanding those rewards.
- Movement-speed and evasion readers exist in current code. The older October 12 inventory's blanket dead-stats note is not a sufficient description of today's readers.
- game/core.js maps Common/Uncommon/Rare/Epic/Legendary/Exotic to T0–T5 and derives item colors from RMAT. The new rarity palette needs separation without recoloring RMAT or changing repair/economy gates accidentally.

## Requested metric index

Attack, Defense and Utility are display groups, not three additional hidden multipliers. A stat must affect the shared outcome before it can enter a live affix pool. The catalogue's stat affinities are proposals.

### Attack

| ID | Visible metric | Unit | Meaning | Current status |
|---|---|---|---|---|
| ATK-01 | **Damage** | % | Global outgoing-damage bonus. | New percentage bucket; existing dmg/weaponDamage are flat. |
| ATK-02 | **Physical Damage** | % | Bonus to authored physical damage components. | New typed routing. |
| ATK-03 | **Special Damage** | % | Bonus to authored nonphysical components. | New typed routing. |
| ATK-04 | **Atk. speed** | % and attacks/s | Attack cadence bonus and resulting rate. | New timing model; current shared combat uses rounds. |
| ATK-05 | **Projectiles/s** | X/s | Actual physical projectile launch rate. | New; only on eligible attack profiles. |
| ATK-06 | **Area** | % | Affected footprint of an authored attack. | New target/footprint model. |
| ATK-07 | **Duration** | % | Eligible status, effect or projectile lifetime. | Timed buffs exist; general modifier is new. |
| ATK-08 | **Projectile Speed** | % and world units/s | Travel speed of eligible projectiles. | New projectile model. |
| ATK-09 | **Crit Chance** | % | Probability of a critical eligible hit. | Current shared helper has a crit field/roll. |
| ATK-10 | **Crit Damage** | % total multiplier | Proposed total critical multiplier; 150% means ×1.5. | Current survivor crit adds a flat default +6. |
| ATK-11 | **Status Chance** | % | Chance to apply an authored eligible status. | New general status model. |
| ATK-12 | **Status Damage** | % | Bonus to tagged status damage. | New routing. |
| ATK-13 | **Damage to Elites** | % | Conditional bonus against agreed elite tags. | New target modifier. |
| ATK-14 | **Vulnerable Damage** | % | Bonus against explicitly vulnerable targets. | New condition model. |

### Defense

| ID | Visible metric | Unit | Meaning | Current status |
|---|---|---|---|---|
| DEF-01 | **Max HP** | X HP | Maximum health, distinct from current health. | Current maxHp path exists; gear bonus routing needs design. |
| DEF-02 | **Regen/s** | X HP/s | Regeneration under stated conditions. | New general regeneration. |
| DEF-03 | **Armor** | X rating (Y% versus reference hit) | Rating plus contextual damage prevented. | Current helper subtracts flat armor with minimum chip. |
| DEF-04 | **Evasion** | % versus reference attacker | Contextual avoidance estimate. | Current helper uses an evasion rating inside its hit equation. |
| DEF-05 | **Shield** | X absorption | Temporary damage-absorption pool. | New pool; separate from physical shield blocking. |
| DEF-06 | **Lifesteal** | % | Healing from eligible actual enemy HP removed. | Helper supports lifesteal; survivor builder sets it to 0. |
| DEF-07 | **Healing** | % | Bonus to eligible healing received. | New general modifier; First Aid already has formulas. |
| DEF-08 | **Thorns** | X reflected damage | Damage returned after eligible contact. | New reaction effect. |

### Utility

| ID | Visible metric | Unit | Meaning | Current status |
|---|---|---|---|---|
| UTL-01 | **Speed** | % and m/s | Movement modifier and effective traversal speed. | Existing movement and buff readers. |
| UTL-02 | **Pickup Range** | X world units | Automatic collection radius. | Deferred; no spatial pickup system verified. |
| UTL-03 | **Experience** | % | Multiplier to already qualifying XP. | Current XP bus supports flat per-track bonuses; percentage is new. |
| UTL-04 | **RMAT** | X holdings; separate yield bonus | Earned RMAT holdings, with yield modifiers shown separately. | Existing economy; new yield affixes need design. |
| UTL-05 | **Luck** | X rating | Bias toward eligible loot outcomes. | Universal Luck stat not verified in current combat. |
| UTL-06 | **Extra Jumps** | X | Additional jumps in a supporting movement mode. | Deferred; no jumping mechanic verified. |
| UTL-07 | **Difficulty** | XYZ / ruleset | Selected difficulty and comparison context. | Existing difficulty context. |

## Conditional equipment readouts

| Readout | Purpose |
|---|---|
| Recovery Chance % | Show throwing-axe recovery probability and eligibility separately from Luck. |
| Block Chance / Block Prevention | Explain physical shield mitigation; distinct from Shield absorption. |
| Throwing stock | Show available/readied axes and why desired projectiles/s may not be sustainable. |
| Effective attacks/s | Show the resulting active-weapon cadence under stated assumptions. |
| Estimated DPS | Use a named reference target and state burst/sustained, crit, armor and condition assumptions. |
| Load and condition | Show kg, carrying capacity and current wear. |

Do not present unavailable mechanics as functioning zero-valued attributes. Design previews may label them Proposed/Unavailable; live rolls should exclude them until meaningful.

## Modifier conventions

1. Separate flat values, percentage bonuses, percentage points, ratings and derived results.
2. In the candidate arithmetic below, +20% becomes 0.20. Final storage fields must match an audited schema.
3. Same-bucket bonuses add: +10% and +15% global Damage become +25%. Separate buckets multiply only when explicitly defined and budgeted.
4. Crit Chance +5 percentage points changes 10% to 15%. Proposed Crit Damage 150% means total ×1.50; +25 points would make it 175%.
5. Show weapon, gear, perk, set and temporary-buff contributions. The UI reads the same resolved values and logical moment as simulation.
6. Define scope: per-item, per-hand, global or attack-source-only. Off-hand signatures do not automatically duplicate global effects.
7. Route any new percentage Experience bonus and existing flat per-track bonuses through the XP bus once per qualifying action.
8. Bound probabilities and resources. Caps and stacking families remain open balance parameters.

## Existing helper versus candidate damage pipeline

Current shared helper, simplified:

    hitChance = clamp(65 + attackerAccuracy - defenderEvasion, 5, 95)
    rolledDamage = randomInteger(damageMin, damageMax) + damageBonus
    onCrit: rolledDamage += critBonus        # survivor default +6
    armorResult = max(MIN_CHIP, rolledDamage - defenderArmor)

Broken-state modifiers and other existing behavior also apply. This inspection summary is not permission to rewrite the helper. Preserve CB1 behavior in any future comparison.

Proposed component pipeline:

    W = selected attack base after agreed existing scaling and flat bonuses
    component = W × authored component share
    raw = component × (1 + sum(GlobalDamageBonus))
                    × (1 + sum(MatchingTypeBonus))
                    × (elite ? 1 + sum(EliteBonus) : 1)
                    × (vulnerable ? 1 + sum(VulnerableBonus) : 1)
    critical = raw × (eligible critical hit ? totalCritMultiplier : 1)

For mixed hits, physical/special shares sum to 1 before modifiers. Each typed bonus modifies only its own share. Active-weapon selection, typed damage, target conditions and percentage critical conversion are new design dependencies.

## Armor and defense candidates

    Preserve-flat display:
      preventedFraction = 1 - max(chip, referenceHit - armor) / referenceHit

    Diminishing-return replacement candidate:
      armorReduction = armor / (armor + K_for_reference_enemy)

The first derives a contextual percentage from the flat model. The second replaces that model for a future simulation comparison. K, caps, minimum chip, enemy scaling and damage-type coverage remain open. Do not silently apply both formulas. Do not apply physical armor to every hazard without reconciling existing resistance rules.

Candidate defense order: hit eligibility/evasion → eligible block → armor or typed resistance → explicitly separate reductions → absorption shield → HP. Choose and document one order. Do not add a second independent dodge roll to the existing accuracy/evasion equation.

Lifesteal uses actual eligible HP removed, bounded by the victim's pre-hit HP. Overkill and absorbed damage produce no healing. Thorns and secondary reactions do not recursively create crit, lifesteal, statuses or more reflection unless explicitly authored.

## Cadence, area and status candidates

    attacksPerSecond = baseAttacksPerSecond × (1 + sum(AttackSpeedBonus))
    projectilesPerSecond = attacksPerSecond × projectilesPerAttack
    circleRadius = baseRadius × sqrt(1 + AreaBonus)
    statusDuration = baseStatusDuration × (1 + DurationBonus)
    expectedCritFactor = 1 + critChance × (totalCritMultiplier - 1)

These are candidate definitions, not present behavior. Set positive cadence bounds and define hand scheduling, skipped attacks and logical attack times. Every launched physical axe costs one stock unit. Range, flight lifetime, speed and collision are separate. Longer damage-over-time duration can increase total damage by lasting longer; do not also multiply its per-second rate by Duration.

## Worked arithmetic for discussion

| Case | Inputs | Candidate result |
|---|---|---|
| Additive global bonuses | +10% and +15% | +25% global Damage |
| Typed hit | 100 physical; +20% Damage; +25% Physical | 150 before crit/defense |
| Split hit | 60 physical + 40 special; +20% global; +25% Physical | 90 physical + 48 special = 138 |
| Critical expectation | 20% chance; ×1.5 crit | ×1.10 expected eligible damage |
| Cadence | 1 attack/s; +25% Atk. speed | 1.25 attacks/s before skips |
| Volley | 2 attacks/s; 3 physical axes/attack | Up to 6 axes/s, each costing one axe |
| Circular area | +44% area | Radius ×1.2 |
| Flat armor | 40 reference hit; 8 armor | 32 damage; 20% prevented against this hit |
| Candidate rating armor | 50 armor; illustrative K=100 | 33.33% reduction; K remains provisional |
| Recovery | 10 eligible axes; 40% chance | Mean 4 recovered; not a guaranteed result |
| Lifesteal / overkill | Target 10 HP; roll 100; 10% lifesteal | 1 HP base healing before eligible Healing bonus |

## Player-facing presentation

Show Attack / Defense / Utility, reference context and inspectable contributions. Max HP and current HP are distinct. Physical shield blocking and absorption Shield are distinct. Compare full loadouts against the same reference target, including actual stock and conditional effects.

A label such as Armor 40 (28% versus reference enemy) must be calculated from a stated real comparison context. Under the current formula, Crit Damage +6 flat is truthful; Crit Damage 150% requires the proposed conversion. Luck 12 requires an explicit relationship to current Scavenging/lootFind before it is eligible to roll.

## Per-metric integration instructions

- **ATK-01 Damage:** Add same-bucket bonuses, then apply once.
- **ATK-02 Physical Damage:** Apply only to physical shares, not the entire mixed hit.
- **ATK-03 Special Damage:** A bonus does not create special damage by itself.
- **ATK-04 Atk. speed:** Keep movement speed, initiative and skipped attacks separate.
- **ATK-05 Projectiles/s:** Attacks/s × projectiles/attack, limited by stock.
- **ATK-06 Area:** Circular radius scales with sqrt(area multiplier), not the full multiplier.
- **ATK-07 Duration:** Do not extend all unrelated buffs or recovery windows.
- **ATK-08 Projectile Speed:** Speed, range, collision and lifetime are separate.
- **ATK-09 Crit Chance:** Bound the chance and define secondary-hit eligibility.
- **ATK-10 Crit Damage:** Keep flat legacy display until a percentage conversion is designed.
- **ATK-11 Status Chance:** Does not give an untagged weapon poison or bleeding.
- **ATK-12 Status Damage:** Duration and damage/s are separate; apply once.
- **ATK-13 Damage to Elites:** Define which existing enemy tiers/tags qualify.
- **ATK-14 Vulnerable Damage:** The bonus does not apply vulnerability.
- **DEF-01 Max HP:** Reconcile maxHp(), healing, rest and downed thresholds; do not use displayHP universally.
- **DEF-02 Regen/s:** Define combat eligibility and logical-time settlement.
- **DEF-03 Armor:** Name the reference hit; do not present a universal reduction percentage.
- **DEF-04 Evasion:** Do not also roll an independent second dodge chance.
- **DEF-05 Shield:** Equipping a shield does not automatically create this pool.
- **DEF-06 Lifesteal:** Exclude overkill, shield absorption and recursive reflected damage by default.
- **DEF-07 Healing:** Define qualifying sources and apply once.
- **DEF-08 Thorns:** No reflection chains or crit/lifesteal/status procs by default.
- **UTL-01 Speed:** Do not treat movement speed as attack speed.
- **UTL-02 Pickup Range:** Hide/mark unavailable and exclude from rolls until meaningful.
- **UTL-03 Experience:** Preserve emitAction/awardXp and distinguish flat from percent.
- **UTL-04 RMAT:** A wallet amount is not an affix; no RMAT per hit/recovery; earned in-game only.
- **UTL-05 Luck:** Define relationship to Scavenging/lootFind; do not silently affect recovery, crit or faction gates.
- **UTL-06 Extra Jumps:** Do not roll this stat until it affects play; traversal reinterpretations need design.
- **UTL-07 Difficulty:** Read-only context, not a random affix.

## Open decisions

Flat versus rating armor; flat versus multiplicative critical damage; active weapon and dual-hand timing; first-slice damage/status/elite/vulnerability tags; recovery base/cap; Luck versus Scavenging; regeneration/shield/healing caps; meaningful support for Pickup Range and Extra Jumps.

This was a focused read-only inspection, not a completed formal Phase 1 audit or proof that every reader was traced. The active JavaScript and current directives take precedence over older uploaded GDD/loot sheets. No game code, tests, saves or economy records were edited.

