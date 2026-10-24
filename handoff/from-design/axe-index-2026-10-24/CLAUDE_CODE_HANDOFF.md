# Claude Code Handoff — Zed Idler Axe Catalogue and Build Metrics

Prepared: 2026-10-24. Status: BRAINSTORM / READ-ONLY INTEGRATION REVIEW REQUEST.

Sam asked for 300 axe designs grounded in archaeological sites, eras, countries/cultures and historical uses; fictional personal names; the accepted six-rarity table; recoverable consumable throwing axes; and a visible character-stat vocabulary. Sam authorized cooperation through E:/C2C and matching deliverable copies within E:/Zed_Idler/handoff. This bundle records that design work. It does not replace CURRENT_BATCH.md or authorize game-code, test, save, live-loot or economy changes.

## Read first

1. README.md and weapon-equipment-integration-index.md.
2. E:/Zed_Idler/reference/weapons-development-directive.md.
3. E:/Zed_Idler/reference/parked/weapons-encyclopedia-wlm-draft.md.
4. E:/Zed_Idler/reference/weapon-files-inventory.md and the current starter-weapons specification.
5. The focused findings below; then inspect current code before proposing implementation details.

The original shared files in E:/C2C were read and preserved. Existing game/project reference files were read only. New material lives in a dedicated bundle subfolder.

## Agreed versus proposed

Agreed in this chat: six rarity labels and color names; the user's rarity descriptions; 300 axe-design proposals; two-piece weapon sets first; enhanced Legendaries only initially; throwable axes as consumables with recovery chance; the user's stat list as a brainstorm starting point.

Proposed, not locked: all weapon/stat numbers beyond existing CB1; exact damage and defense algorithms; enhancement acquisition; named sets/signatures; projectile timing; recovery base/cap; modified active-hand behavior; new status effects; which dormant metrics become functional first.

The older encyclopedia targeted 300 weapons across all families with about 35 axe/pole/historical entries. Sam's current request expands this brainstorm to 300 axe models alone. This is content-scope direction, not a bulk live-item import.

## Category mapping verified in current files

| Concept | Current/proposed mapping | Action |
|---|---|---|
| Held axe | Current cat: weapon; slot: melee | Reuse current item category and slot. |
| Throwing axe | Current cat: consumable; slot: throwable | Reuse the actual Throw slot, then design attack/stack/recovery behavior. |
| Catalogue family | axes/choppers in the existing encyclopedia proposal | Preserve hierarchy: category → family → invented manufacturer → model → variant. |
| Six historical browse sections | Editorial groupings inside axes/choppers | Do not introduce six new top-level runtime categories or mastery currencies. |
| Invented makers and models | W1, decided October 12 | All 300 makers/names in this bundle are fictional; archaeological metadata is separate. |
| Family mastery | W2: sub-track feeding Combat | Do not create another progression currency; consumable-instance progression remains open. |
| Off-hand | Planned October 22 for shields/light blades; absent from inspected slot declaration | Light axes need an explicit compatibility addition, not an assumption. |
| RMAT / prototypes | Earned RMAT; prototype Shop gates; no prototype drops | Do not promote an ordinary drop into a story-gated prototype. |

Country describes archaeological location/design context, not a modern nationality assigned to ancient people or an inherent stat modifier.

## Current-code findings to confirm

| File / location | Observed behavior | Integration consequence |
|---|---|---|
| E:/Zed_Idler/game/items.js, slots and GEAR_ITEMS | melee accepts weapon; throwable accepts consumable; combat_axe already exists | Keep existing combat_axe identity and distinguish new catalogue proposals. |
| E:/Zed_Idler/game/items.js, resolveLoadoutStats | Sums every equipped weapon's dmg | Define active-weapon/per-hand contributions before adding dual axes or meaningful per-model DPS. |
| E:/Zed_Idler/game/stats.js, survivorStatBlock / resolveAttack | Evasion rating in hit equation; flat +6 survivor crit bonus; flat armor subtraction; MIN_CHIP | Percentage Crit Damage, Armor reduction and independent dodge are design changes. Do not implement two evasion rolls. |
| E:/Zed_Idler/game/combat.js, simulateCombat | Round-style combat; injected RNG | Attack Speed/Projectiles per second require logical-time semantics and deterministic ordering. |
| E:/Zed_Idler/game/wandering.js, resolveEncounter | Builds stats, calls shared combat, records hits for presentation | Use the actual shared outcome; UI must not generate damage, loot, XP or recovery. |
| E:/Zed_Idler/game/active.js, _walkPursuers | Separate special-path damage; explicit no XP/loot/kill/wear | Decide stat coverage without changing the exception's rewards. |
| E:/Zed_Idler/game/items.js, itemHasDurability | Consumables excluded | Recovery is stack accounting unless a new explicit consumable-condition model is designed. |
| E:/Zed_Idler/game/items.js, wearEquippedOnKill | Wears the first filled primary/secondary/melee slot plus vest | Multi-hand/active-weapon wear must be reconciled rather than copied to every axe. |
| E:/Zed_Idler/game/core.js, RARITY_TO_TIER / tierColor | Old rarity words map T0–T5; colors derive from RMAT | Separate new rarity vocabulary/palette while preserving RMAT and construction/repair/economy meaning. |
| E:/Zed_Idler/game/stats.js, scavengingFilters | Unlock list still includes Epic | Audit every rarity reader; renaming colors alone is incomplete. |
| E:/Zed_Idler/game/stats.js, ACTION_XP / emitAction | Existing per-action XP and flat per-track bonuses | Preserve one award path. A new Experience % is separate from flat bonuses. |

This is a focused inspection, not the formal completed Phase 1 audit. Exact current revisions and further readers still need confirmation.

## Content contracts

- 300 unique AXE-### tracking IDs and 300 unique draft model IDs.
- 250 held models and 50 throwing-consumable models.
- 30 historical anchor families, each with 10 fictional design variations.
- 300 distinct personal model names. A personal name does not automatically imply Unique rarity.
- Rarity upgrades, recolors and owned copies are not counted as separate designs.
- Each row references an H-number; the source register contains the archaeological era, culture, modern country, use and evidence limitations.
- JSON normalizes shared historical metadata under origins/source_id instead of repeating it in every item.
- All base damage, mass, rarity, construction-tier and recovery fields remain unset. This is deliberate: no invented production balance.
- AXE IDs and draft.* model IDs are proposal identifiers. Audit collisions and production ID conventions before admission.
- Candidate stat directions do not authorize nonfunctional affixes. Pickup Range and Extra Jumps remain deferred unless a meaningful mechanic is selected.
- Historical ceremonial objects and manufacturing moulds are not presented as proven battle weapons. Their combat-capable game versions are fictional reforgings.
- The first catalogue is weighted toward Europe; it does not claim exhaustive global cultural coverage.

## Review outputs requested from Claude Code

Please place a reply named CLAUDE_CODE_REPLY.md in this shared bundle folder, or another clearly named reply in E:/C2C. Acknowledgement is not assumed until a reply is actually present.

1. Confirm current category/slot/model/instance representations, with file and line evidence.
2. List the existing rarity/tier/color readers and a proposed compatibility approach; no migration code yet.
3. Classify the 29 metrics as current, partly supported, new or deferred, citing real readers.
4. Identify the smallest future slice for held axes and recoverable throwing consumables, including stock persistence and one-time settlement.
5. Identify affected combat paths and the active-weapon/per-hand issue.
6. Preserve CB1, W1, W2, prototype/faction restrictions and current encounter exceptions.
7. Flag catalogue/style/provenance ambiguities for Design rather than silently changing their meaning.
8. Recommend an implementation batch only after the remaining decisions are resolved and within the project's current sequencing.

Do not implement merely because this handoff exists. Sam requested brainstorming and file cooperation.

## Suggested future sequence

Read-only reconciliation → data/identity and save plan → small held-axe slice → active-hand and shield design → signature/Unique rules → consumable throw/recovery slice → two-piece sets and enhanced Legendary acquisition → expanded content rollout and simulation review.

Keep firearms/ammunition/noise expansion in its existing separate phase. The owner's throwing-axe brainstorm does not silently complete or unpark that phase.

## File list

- README.md
- weapon-equipment-integration-index.md
- axe-catalogue-300.md
- axe-catalogue-300.json
- axe-historical-sources.md
- character-stats-and-combat-draft.md
- throwable-axes-draft.md
- VALIDATION_REPORT.md

## Sharing

Primary exchange folder: E:/C2C/Zed_Idler_Axes_2026-10-24  
Matching project handoff copy: E:/Zed_Idler/handoff/from-design/axe-index-2026-10-24

Relative Markdown links work inside either complete folder. Only newly authored deliverables are duplicated; source/reference files are not moved or overwritten.

