# Priority 3 — profession bonus audit (read-only, Oct 29)

Source: "Profession Rust Replacement" Google Doc, Addendum Priority 3. **No code changed for this part.** Exact-symbol searches over `game/*.js`, the `.jsx` screens and both HTML pages (`game/bootstrap.js` excluded: it only lists names). "Level read" = an exact `statLevel('id')` / `effectiveLevel('id')` call; every profession is also read indirectly by policy-encounter skill checks (`game/wandering.js:206`, `game/active.js:185`, the `enc.*` rows of `ZI.ACTION_XP`).

## Named formulas

| Formula (`ZI.STAT_FORMULAS`) | Runtime caller | Class | Decision needed |
|---|---|---|---|
| `firstAidHealPercent(L)` | `game/active.js:374` (`wanderHeal`), `:450` (`simHeal`), `game/items.js:434` (`SurvivorRules.healPct`) | **Live** | — |
| `firstAidHealCount(L)` | none | **Orphaned** | Must NOT mint Medkit charges (Priority 2). Repurpose, retire, or keep as UI-only? The profession card still says "Heal strength and **frequency**" (`game/stats.js:44`) |
| `firstAidXpForHeal(amount)` | none (heal XP comes from `ACTION_XP.heal` scaled by amount) | Orphaned / superseded | Retire? |
| `scavengingQualityBonus(L)` | none | **Orphaned** | The card says "Loot quality and filtering"; no loot-quality pipeline reads it. Wire into which loot roll, or retire? (Avoid double-counting with `lootBonus` on gear) |
| `scavengingXpForKill`, `scavengingXpForItem` | none (XP comes from `ACTION_XP`) | Superseded | Retire? |
| `scavDropRate(L)` / `scavDropProtection` | `game/active.js:520` (forced-retreat haul loss), `game/stats.js:230–234` | **Live** | — |
| `scavengingFilters` | `game/economy.js` (recycler filters) | **Live** | — |
| `stealthScoutCount(L)` | none | **Orphaned** | Card says "Scouting reach"; Wandering scout charges are base 2 + kits, Traversal scouts are a fixed 5/day. Do not raise daily scout charges without approval |
| `stealthPushDistance(L)` | none | **Orphaned** | Push On distance is fixed in `ACTIVE_TABLE.push`; wire it there? |
| `stealthEfficiency(L)` | none (only combines the two above) | Orphaned | — |
| `stealthXpForScout`, `stealthXpForPush` | none (XP from `ACTION_XP.scout` / `sneak`) | Superseded | Retire? |
| Combat (accuracy, crit via `survivorStatBlock`) | combat simulator | **Live** | The attack-damage / attack-speed / crit trio stays a proposal (not implemented) |

## Per-profession matrix

| Profession | XP sources (`ACTION_XP`) | Level-based effect found | Notes |
|---|---|---|---|
| Combat | kill, zombie-group / gang / ambush / raid / strip encounters | accuracy and crit (`survivorStatBlock`), injury penalty, routes skill check (`routes.js:187`), retreat evade | Live |
| First Aid | heal, revive, xp.firstAid, wounded / sickset encounters | heal amount (`firstAidHealPercent`) | `firstAidHealCount` orphaned |
| Scavenging | loot, escape, cache / guarded / strip encounters | forced-retreat haul protection, recycler filters, routes check | `scavengingQualityBonus` orphaned |
| Stealth | scout, sneak, escape, many encounters | retreat evade (`RETREAT_EVADE.stealthMul`), routes check | scout count / push distance orphaned |
| Athletics | sneak, move, checkpoint, escape, baseline | Jog/Run speed (`SurvivorRules.conditioning`), retreat evade, routes check | Live |
| Endurance | revive, endure, raid / horde, baseline | encounter skill checks only | Character-creation draft proposes armor %, max HP %, status resistance (not approved) |
| Foraging | forage, farm / field encounters | encounter checks only | F4 fruit unlocks by Foraging level are decided (Oct 26) but not built |
| Smithing | craft.smith, craft.mech | none found | Needs a three-bonus proposal (not invented here) |
| Medical | craft.medical, sickset | none found | Same |
| Mechanical | craft.*, repair, recycle, vehicle / storehouse | none found by exact name | Same |
| Discovery | craft.rmat, discover, farm / cache, baseline | scout power (spec 13.3, `ACTIVE_TABLE.scout` levels 15/30 via `effectiveLevel('discovery')`) | Live |
| Trading | transaction, caravan / lopsided / fence | encounter checks only | Same as Smithing |
| Diplomat | faction, contracts, convoy / caravan / fence / captive | contract gate (`diplomatLevel`), Fort checks (`fort.js:137`) | Live |
| Logistics | task, run.complete, schedule.* | none found | Same as Smithing |
| Engineering | build, vehicle | none found | Same as Smithing |
| Command | checkpoint, camp, run.complete, convoy / gang / ambush / captive | Fort Command check; the free heal perk at 40 was **removed Oct 29** (Priority 2) | Needs a replacement perk? Do not add one without approval |

All 16 professions still earn XP from their established actions (Oct 29 full suite 941/941).
