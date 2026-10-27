# Zed Idler — Axe Catalogue and Build Design Bundle

Prepared 2026-10-24. Status: BRAINSTORM / READY FOR DISCUSSION.

## Start here

| Document | What it contains |
|---|---|
| [Integration index](weapon-equipment-integration-index.md) | Agreed rarity table, 30 additions, conflicts and file integration targets. |
| [299 axe designs](axe-catalogue-300.md) | Names, shapes, categories, historical anchors and candidate playstyles. |
| [Machine-readable axe index](axe-catalogue-300.json) | Stable draft model IDs and normalized source references; not a runtime import. |
| [Historical source register](axe-historical-sources.md) | 30 archaeological anchor families with dates, cultures, locations, uses and evidence limits. |
| [Visible stats and combat](character-stats-and-combat-draft.md) | All 29 requested stats, current-code findings, candidate calculations and worked examples. |
| [Recoverable throwing axes](throwable-axes-draft.md) | Consumable category fit, stock, recovery, persistence and conservation. |
| [Claude Code handoff](CLAUDE_CODE_HANDOFF.md) | Current file mapping, conflicts and requested read-only integration reply. |
| [Validation report](VALIDATION_REPORT.md) | Catalogue counts, reference integrity and arithmetic checks. |

## Catalogue scope

| Browse section | Models | Current runtime category / slot |
|---|---:|---|
| Stone and early hand axes | 50 | weapon / melee |
| Copper and early metal axes | 50 | weapon / melee |
| Socketed and working axes | 50 | weapon / melee |
| Iron hand axes, bearded axes and broad axes | 49 | weapon / melee |
| Double-bit, broad-blade and prestige-inspired axes | 50 | weapon / melee |
| Recoverable throwing axes | 50 | consumable / throwable |
| **Total** | **299** | **249 held; 50 thrown consumables** |

These are 299 fictional game designs based on 30 documented historical anchor families. Names, makers, variant shapes and gameplay are invented; the era/culture/site/use fields refer to the archaeological anchor. This is not a claim of 299 separate attested archaeological typologies.

The six browse sections live inside the existing axes/choppers catalogue family. They do not replace current item categories or create mastery currencies. Current source inspection found that the actual game already has a Throw slot for consumables.

## Accepted rarity table

| Rarity | Color | Identity |
|---|---|---|
| Common | White | Base stats; no additional bonus. |
| Uncommon | Green | One useful bonus. |
| Rare | Blue | Several random bonuses supporting a build. |
| Legendary | Orange | Random bonuses plus one signature effect. |
| Unique | Gold | Predetermined bonus types and an exclusive mechanic; values may vary. |
| Relic Legendary | Crimson | Enhanced Legendary with stronger stat ranges and minimum rolls; retains its signature. |

Two-piece sets come first. Enhanced Uniques are outside the initial scope. Personal names do not determine rarity. Exact production numbers, scopes and migration remain open.

## Iconic names and fictional identity pitches

These pitches are proposed effects, not historical facts or locked balance.

| Model | Name / epithet | Candidate identity |
|---|---|---|
| AXE-151 | Matilda — The Last Word | A deliberate execution axe: heavy strikes reward commitment and punish exposed elites. |
| AXE-152 | Delila — The Quiet End | A fast duelist: successive eligible hits prepare an authored bleed or finishing effect. |
| AXE-153 | Judith — The Wide Verdict | A sweeping axe: trades movement and recovery time for a wider authored cutting footprint. |
| AXE-201 | Ariadne — The Twin Arc | A fictional double-axe reforging with a large sweep; it never counts as wielding two separate axes. |
| AXE-251 | Adelaide — The Quick Return | A quick-release throwing consumable; its physical axes are spent and recovery settles after the encounter. |
| AXE-258 | Odette — The Lucky Grave | A precision/recovery throwing design; its recovery bonus is explicit rather than hidden behind Luck. |

No item pitch grants a dormant stat by itself. Shared mechanics and simulation budgets must exist first.

## Stat vocabulary

| Attack | Defense | Utility |
|---|---|---|
| Damage % | Max HP | Speed % / m/s |
| Physical Damage % | Regen/s | Pickup Range |
| Special Damage % | Armor rating / contextual reduction | Experience % |
| Atk. speed % / attacks/s | Evasion versus reference attacker | RMAT holdings / separate yield bonus |
| Projectiles/s | Shield absorption | Luck rating |
| Area % | Lifesteal % | Extra Jumps |
| Duration % | Healing % | Difficulty |
| Projectile Speed % | Thorns | |
| Crit Chance % | | |
| Crit Damage % | | |
| Status Chance % | | |
| Status Damage % | | |
| Damage to Elites % | | |
| Vulnerable Damage % | | |

Recovery %, blocking, throwing stock and estimated DPS are conditional equipment readouts. These values are proposals for build planning, not permanent commitments. Pickup Range and Extra Jumps should not roll on live gear before they have meaningful supporting mechanics.

## Main findings for discussion

1. Current code sums damage from all equipped weapons; active-weapon and dual-hand behavior need an explicit design.
2. Current critical hits use flat bonus damage, and armor subtracts flat damage. Percentage alternatives are proposed replacements.
3. Current rarity/tier/RMAT-color coupling must be reconciled before adopting the accepted six-rarity display.
4. Throwing recovery needs a persistent one-time settlement; a chance of recovery must never duplicate stock.
5. Culture and archaeological age do not determine inherent power. Construction, rarity and balanced role budgets do.

## Shared locations

- E:/C2C/Zed_Idler_Axes_2026-10-24
- E:/Zed_Idler/handoff/from-design/axe-index-2026-10-24

The second folder duplicates this cloud-assisted deliverable as requested. Existing project source and reference files remain intact. Claude Code receipt or execution is not implied by publishing a handoff file.

