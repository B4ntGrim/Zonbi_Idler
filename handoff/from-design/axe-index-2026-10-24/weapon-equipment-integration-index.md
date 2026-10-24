# Zed Idler — Weapon and Equipment Integration Index

Status: BRAINSTORM / DOCUMENTATION DRAFT  
Date: 2026-10-24  
Purpose: Index the additions and instructions needed for later integration. This draft does not authorize changes to game code or existing project documents.

## Status key

- [AGREED]: The user explicitly selected the concept in this chat. Implementation details may remain open.
- [EXISTING]: Direction recorded in the project references; implementation has not been verified.
- [PROPOSED]: A recommendation for discussion.
- [OPEN]: A decision still required.
- [CHECK]: Inspect the working game files before defining the implementation.

The user's current decisions take precedence over earlier design notes. Preserve dated existing decisions unless the user changes them. Do not turn a proposed number or suggested name into a locked rule.

## Agreed scope

| ID | Addition | Agreed direction | Still open |
|---|---|---|---|
| A-01 | Equipment rarities | Common / White; Uncommon / Green; Rare / Blue; Legendary / Orange; Unique / Gold; Relic Legendary / Crimson, with the descriptions accepted in chat. | Exact hex values, availability, detailed roll counts/ranges and migration. |
| A-02 | Axe catalogue | Support axes from low to high construction tiers and multiple weapon families. | Exact families, item names, and tier variants. |
| A-03 | First equipment sets | Begin with two-piece axe-and-shield and dual-axe pairs. | Set names, effects, sources, and rarity eligibility. Armor sets remain a later expansion. |
| A-04 | Ancient-style enhancement | Initially applies to Legendaries only. | Acquisition and enhancement rules. Enhanced Uniques are outside the initial scope. |
| A-05 | Initial axe index | 300 fictional axe designs grounded in archaeological references; use invented names and the existing axes/choppers catalogue family. | Final admission, balance, construction tiers and acquisition. |
| A-06 | Throwing axes | Consumables with a recovery percentage, using the existing throwable category/slot. | Launch rate, base recovery, cap and settlement policy. |
| A-07 | Visible build metrics | The requested Attack, Defense and Utility metrics are the starting vocabulary. | Formulas, availability and numerical values remain brainstorm proposals. |

The user has now accepted the Relic Legendary label and the six color names. Its Ancient-style enhancement retains Legendary identity; it does not introduce a sixth construction tier. Existing code uses T0–T5 and ties rarity to those values, so separation requires a reviewed migration rather than silently renumbering equipment.

## Expansion files created October 24

| File | Contents |
|---|---|
| [300 axe designs](axe-catalogue-300.md) | 250 held axes and 50 consumable throwing axes; 30 historical anchor families; invented names, makers, distinct shape configurations and proposed stat affinities. |
| [Axe data](axe-catalogue-300.json) | Stable draft IDs and machine-readable catalogue records; not a runtime import. |
| [Historical source register](axe-historical-sources.md) | Country/location, culture, era, historical use, source links and evidence limits. |
| [Character stats and combat](character-stats-and-combat-draft.md) | All 29 requested metrics, conditional readouts, current-code findings, candidate formulas and worked examples. |
| [Throwing axes](throwable-axes-draft.md) | Category fit, stack consumption, recovery probability, one-time settlement and conservation rules. |
| [Claude Code handoff](CLAUDE_CODE_HANDOFF.md) | Verified code paths, category mapping, conflicts, handoff instructions and requested read-only response. |

The 300 designs are fictional proposals derived from 30 documented archaeological families, not 300 claims of distinct excavated typologies. Rarity upgrades and recolors are not counted as extra styles. Historical facts and invented combat identities are separated throughout.

## Accepted rarity presentation

| Rarity | Color | Accepted identity |
|---|---|---|
| Common | White | Base weapon stats; no additional bonuses. |
| Uncommon | Green | One useful bonus. |
| Rare | Blue | Several random bonuses supporting a build. |
| Legendary | Orange | Random bonuses plus one signature effect. |
| Unique | Gold | Named item with predetermined bonus types and an exclusive mechanic; values can vary. |
| Relic Legendary | Crimson | Enhanced Legendary with stronger stat ranges and better minimum rolls; retains its signature. |

Personal names are catalogue/model identities, not automatic Unique rarity. All production ranges and the migration of existing Epic/Exotic equipment remain open.

## Additions index

IDs below are draft tracking labels, not claims about existing project identifiers.

| ID | Addition | Integration instruction | Status / dependency |
|---|---|---|---|
| WI-01 | Existing-system audit | Read the current weapon catalogue, item loader, inventory, slots, combat, stats, loot, Shop, Workshop, saves, and offline settlement. Identify the actual owner of each rule before planning edits. Reuse the October 22 read-only report if it exists and is current. | [CHECK]; first step before implementation |
| WI-02 | Tier and rarity separation | Separate construction, six rarity labels, enemy tiers and condition. Current code uses T0–T5 and RARITY_TO_TIER; preserve existing IDs until the current tier-band work and migration are reconciled. | [PROPOSED]; actual coupling verified in game/core.js |
| WI-03 | Rarity definitions | Apply the accepted six-label presentation and descriptions above. Preserve one bonus for Uncommon; specify the remaining exact roll counts/ranges and acquisition rules. Keep RMAT colors independent. | Presentation [AGREED]; detailed ranges/migration [OPEN] |
| WI-04 | Shared definitions and individual items | Keep a reusable weapon definition separate from each owned item's identity, rolled values, condition, and enhancements. Persist generated results. Loading or equipping an item must not reroll it. Choose field names only after the audit. | [PROPOSED] |
| WI-05 | Axe families | Catalogue light hand axes, combat axes, and heavy two-handed axes. Candidates include hatchets, tomahawks, boarding axes, fire/rescue axes, felling axes, splitting axes, and double-bit axes. Preserve a role for light and heavy families at higher tiers. A double-bit axe is one weapon, not a dual-wield pair. | Scope [AGREED]; catalogue [PROPOSED] |
| WI-06 | Equipment slots | Build on the planned Off-hand slot. Two-handed weapons occupy both hands. Extend Off-hand eligibility to explicitly tagged light one-handed axes; the October 22 rule currently specifies shields and light blades. Preserve Rig and its pockets. Ring remains a separate unresolved slot. | Off-hand direction [EXISTING]; light-axe eligibility [PROPOSED] |
| WI-07 | Shields and blocking | Define block eligibility, chance, damage prevented, weight, wear, and attack interactions. Distinguish a blocked hit from a miss or dodge. Resolve whether shield effects apply to melee, ranged, and environmental damage. Preserve Silverglass breaking into a repairable state rather than being destroyed. | [PROPOSED], with Silverglass rule [EXISTING] |
| WI-08 | Dual-axe combat | Specify hand order, attack cadence, per-hand damage, accuracy, wear, and effect ownership. Balance the combined attack budget against axe-and-shield and two-handed play. Two axes must not create duplicate kill credit or XP. Decide how existing weapon-skill XP is allocated. | Pair support [AGREED]; rules [PROPOSED] |
| WI-09 | Legendary signatures | Give each signature a precise trigger, effect, duration, stacking limit, and cooldown where needed. Tag the originating event so reflection, splash damage, and secondary strikes cannot create unlimited effect loops. Reuse the shared combat path. | [PROPOSED] |
| WI-10 | Unique equipment | Author named items with curated bonus types and exclusive mechanics; values may still roll within defined ranges. Decide acquisition and duplicate-equip rules. Keep Unique rarity separate from the legacy signature-drop flag. | Label [AGREED]; details [OPEN] |
| WI-11 | Ancient-equivalent Legendaries | Retain the underlying Legendary identity, signature, construction tier, and set membership. Propose improved base-stat and selected bonus ranges without automatically multiplying every effect. Decide whether eligible items drop enhanced, can be upgraded, or use both routes. | Legendary-only scope [AGREED]; name and route [OPEN] |
| WI-12 | Two-piece sets | Define a set identity, two distinct required piece identities, individual item effects, and one pair effect. Count equipped eligible pieces only. Copies of one piece do not substitute for its partner. An enhanced version can satisfy the same piece requirement without counting twice. | Pair-first scope [AGREED]; rules [PROPOSED] |
| WI-13 | Loot and acquisition | Assign eligible families, construction tiers, rarities, and named items to existing sources. Decide whether each pool rolls one weighted result or independent drops; document probability units. Apply seeded generation and persist claimed results. Do not copy the old percentages as final balance. | [PROPOSED]; needs source eligibility rules |
| WI-14 | Faction and prototype restrictions | Preserve rank-unlocked faction listings, RMAT payment, and equal faction power budgets. Prototypes never drop; the specified prototype listings remain hidden until the Concordance introduction. Rarity rolls and enhancement must not bypass those gates. | [EXISTING]; enhanced faction-item access [OPEN] |
| WI-15 | Condition, Workshop, and salvage | Keep wear and rust separate from rarity. Repair restores allowed condition rather than changing rarity. Preserve the rusted-find restoration ceiling and repair-before-use direction. Define broken-item behavior, salvage returns, and any enhancement recipe using existing materials where practical. | Workshop direction [EXISTING]; recipes [OPEN] |
| WI-16 | Stats, load, and stamina | Reuse current skill, load and resource behavior. Count each item's weight once; inspect present stamina/Nutrition readers before adding combat costs. Older GDD attributes and build-log gaps are not proof of current implementation. | Focused inspection completed; remaining hooks [CHECK] |
| WI-17 | Inventory and equipment changes | Specify valid swaps, inventory capacity checks, favoriting, sorting, and comparison. One item instance cannot occupy two slots. A blocked two-handed/off-hand swap must preserve both items. Decide whether changes are restricted during encounters. | [PROPOSED] |
| WI-18 | Live and offline combat | Run attacks, blocks, wear, set effects, cooldowns, loot, and XP through the same simulation. Equal starting state, random seed, and elapsed simulation time must produce equal results, including across settlement boundaries. Retain existing offline-cap rules. | Shared-simulation requirement [EXISTING] |
| WI-19 | Save compatibility | Version the equipment changes after inspecting the current save version. Preserve item identities, rolls, acquired gear, and valid loadouts; provide deterministic migration for older items and missing Off-hand data. Loading or migrating twice must not duplicate items or rewards. | [CHECK], then [PROPOSED] |
| WI-20 | Interface and Codex | Display construction tier, rarity text/icon, condition, hand requirements, bonuses, and set progress separately. Compare whole-loadout consequences where supported. Use a set emblem rather than replacing the rarity indicator. Add catalogue entries without revealing story-gated Shop content early. | [PROPOSED] |
| WI-21 | Balance and regression checks | Compare time to kill, damage taken, successful returns, healing use, wear, and repair cost at comparable construction tiers and rarity budgets. Check that no loadout is universally superior and that ordinary legendary combinations remain viable. | [PROPOSED]; requires simulation support |
| WI-22 | Existing mods and future expansion | Define how new equipment interacts with existing sockets, infusions, perks, and weapon skills. Defer armor sets, enhanced Uniques, and additional enhancement grades from the first implementation. Keep those extensions possible without implementing them now. | [PROPOSED] |
| WI-23 | Documentation and handoff | Update the authoritative weapon directive, encyclopedia, document index, handoff, and affected loot specification together once decisions are settled. Record unresolved choices and verification results. Verify identifiers before assigning a new WPN number. | [PROPOSED] |
| WI-24 | 300 axe designs | Review AXE-001–AXE-300 under the existing axes/choppers family and invented-maker policy. The 250 held designs map to weapon/melee; 50 consumables map to consumable/throwable. | Index created; admission/balance [OPEN] |
| WI-25 | Archaeological provenance | Preserve each historical anchor's source, site, era, culture, use and uncertainty. Names, reforged silhouettes and gameplay remain fictional. | Reference register created |
| WI-26 | Consumable recovery | Specify launch cost, rate, stock ownership, eligible search and recovery. Resolve recovery once and conserve spent/recovered/lost quantities across reloads and offline settlement. | Concept [AGREED]; rules [PROPOSED] |
| WI-27 | Visible stat registry | Define all 29 requested metrics with units, current status and meaningful readers. Keep unused Pickup Range/Extra Jumps out of live affix pools until supported. | Registry created; formulas [OPEN] |
| WI-28 | Combat formula review | Compare current flat armor and flat critical bonuses with candidate percentage models. Resolve active-weapon damage instead of silently summing every equipped weapon. Preserve CB1 and special encounter exceptions. | Findings recorded; replacement design [OPEN] |
| WI-29 | C2C file cooperation | Publish this brainstorm bundle and request a read-only integration reply from Claude Code within E:/C2C. Publication does not imply receipt or code execution. | User-authorized file sharing |
| WI-30 | Project handoff duplicates | Keep matching copies of this cloud-assisted deliverable within E:/Zed_Idler/handoff, in a dedicated subfolder, and verify their contents match. | User-requested delivery requirement |

## Conflicts that need explicit reconciliation

| Existing reference | Conflict | Integration instruction |
|---|---|---|
| Loot_Schema_Revised | Rarity is Common/Uncommon/Rare/Epic/Legendary, with Tier mapped directly to rarity. | Replace the coupling in the future equipment model. Define a reviewed migration for Epic and old Tier values; do not assume Epic means Unique or construction Tier IV. Confirm whether the rarity revision initially affects weapons and shields only. |
| Loot_Schema_Revised | Is_Unique identifies signature drops across multiple rarities. Some examples and descriptions also disagree about guarantees. | Preserve the old meaning under a clearly distinct concept during migration. A legacy TRUE value does not automatically confer Unique rarity or a guaranteed drop. Audit readers and drop overrides. |
| Older GDD sections 6.5 and 11 | “Quality” mixes construction descriptors and maintenance states; tier ranges differ between sections. | Establish separate construction, rarity and condition terminology. Reconcile the earlier I–V proposal with the current code's T0–T5 bands; do not silently renumber equipment. |
| Older GDD | Affixes start at Tier II, legendary traits at Tier IV, and some gear is level-gated. | Retain these as existing reference constraints until reconciled with current tier-band work. Do not silently make every rarity available at every tier or add new arbitrary level gates. |
| October 22 slot decisions | Off-hand supports shields and light blades; light axes are not yet listed. | Treat light-axe Off-hand eligibility as a new proposed rule. Complete or reuse the slot audit before building it. |
| October 22 acquisition decisions | Prototypes are Shop-only; faction weapons are rank-unlocked and purchased with earned RMAT. | Keep named equipment and enhanced versions subject to their original acquisition restrictions. Decide an enhancement route that respects those restrictions. |
| Excalibur and water notes | Rusted finds need Workshop restoration; fishing rewards must remain optional. | Preserve restoration rules and optional progression. Keep Excalibur's instant-kill mechanics parked until separately specified, including boss eligibility. |

## Document and file integration map

The local mirror contains no game source, but the shared C2C inventory identified the actual working checkout at E:/Zed_Idler. The weapon directive, parked encyclopedia and relevant game modules were subsequently inspected read-only. Paths below are relative to that working checkout; any remaining file ownership still needs the formal audit before implementation.

| Integration target | Intended change |
|---|---|
| reference/weapons-development-directive.md | Record agreed scope, six rarity labels, construction separation, acquisition constraints, and open decisions. |
| reference/parked/weapons-encyclopedia-wlm-draft.md | Add axe families, shield compatibility, hand requirements, named items, and two-piece set entries. Preserve its draft/parked status until the project explicitly changes it. |
| reference/00-document-index.md | Link the agreed integration document and keep status/dependency rows current. |
| DESIGN_HANDOFF.md | Record decisions, migration conflicts, outstanding audits, implementation sequence, and checks. |
| GDD_v5.3, especially sections 6.5 and 11 | Reconcile older tier, quality, affix, legendary, and maintenance terminology with current decisions. |
| Loot_Schema_Revised and its active import/validation path | Revise equipment rarity semantics, tier separation, signature flags, Off-hand eligibility, and source restrictions. Determine whether the sheet is active data or reference only. |
| game/items.js; game/stats.js; game/combat.js; game/wandering.js; game/active.js | Inspected current item categories, shared attack helpers and callers. Extend these readers coherently; keep active.js walk-home exceptions explicit. |
| game/core.js; game/economy.js | Rarity-to-tier/color coupling exists in core.js and has economy readers. Separate new rarity presentation with reviewed migration. |
| game/save.js; game/bootstrap.js | Migration and initialization ownership remain to be fully audited; do not invent save fields. |
| Existing item, inventory, Shop, Workshop, paperdoll, and Codex modules | Locate their real files and reuse their registries and state. No additional module names are prescribed here. |
| reference/parked/camp-01-fixtures-draft.md and Workshop specifications | Where applicable, reconcile camp workbench capabilities with Workshop restoration. Do not introduce a competing repair economy or assume parked fixtures are implemented. |

## Proposed first sets

Names and effects are brainstorm candidates, not locked content.

| Set | Pieces | Individual direction | Pair direction |
|---|---|---|---|
| Last Watch | Gatekeeper axe + Holdfast shield | Axe rewards controlled heavy strikes; shield improves reliable protection. | A valid block empowers the next axe strike. The empowered effect cannot recursively generate itself. |
| Red Harvest | Reaper's Right + Reaper's Left | Each axe has a useful standalone offensive identity. | Alternating successful hits builds toward a cleaving strike. Define misses, hand ordering, charge decay, and target eligibility before implementation. |

Each piece should be useful alone. Both sets require a valid loadout and two distinct pieces. Final numbers, sources, eligible rarities, and stacking rules remain open.

## Proposed implementation sequence

This is a dependency order within the future equipment work, not a replacement for the project's current roadmap.

| Phase | Scope | Completion evidence |
|---|---|---|
| 1 — Reconcile | Inspect the existing files, read-only reports, tier-band work, and legacy loot semantics. | File ownership map and reviewed decisions for each conflict. |
| 2 — Foundation | Introduce agreed definitions, instance identity, slot validation, and save migration using a small test catalogue. | Old saves load; equipment and rolls survive reload; invalid swaps preserve inventory. |
| 3 — Combat | Integrate axe families, shields, dual wielding, signatures, and Unique effects. | Shared combat resolves each action once, with bounded effects and correct XP. |
| 4 — Sets and enhancement | Add the two proposed pair types and the agreed Legendary enhancement route. | Distinct-piece counting, enhanced-piece compatibility, and acquisition gates work. |
| 5 — Acquisition and presentation | Integrate loot, Shop, Workshop, comparisons, Codex, and documentation. | Items can be acquired, equipped, repaired, inspected, saved, and used through the intended loop. |
| 6 — Simulation review | Verify live/offline equivalence and compare loadouts across appropriate encounters. | Recorded results for survival, output, upkeep, migration, source restrictions, and effect-loop checks. |

For each phase, use the smallest complete slice. Report relevant checks as PASS, FAIL, or NOT RUN, distinguishing automated checks from manual playthroughs.

## Decisions to brainstorm next

| Decision | Proposed starting point | Alternatives |
|---|---|---|
| Relic Legendary production details | Label/color accepted; retain underlying Legendary identity. | Final ranges, acquisition, consumable eligibility and exact presentation remain open. |
| Unique acquisition | A mixture: predictable challenges for selected Uniques and repeatable targeted sources for others. | All random drops, or all fixed rewards. |
| Enhanced Legendary acquisition | Rare enhanced drops for ordinary eligible loot, with a deterministic enhancement path for purchased faction equipment. | Upgrade-only, or eligible-drop-only; faction gates must still be preserved. |
| Duplicate set pieces | Eventually allow salvage toward a missing piece using existing resources. | Trade duplicates, reroll within the set, or keep purely random collection. |
| First-release rarity scope | Weapons and shields first; assess other equipment separately. | Apply the new rarity model to all equipment at once. |
| Tier and rarity eligibility | Follow reconciled progression bands, rather than permitting every combination immediately. | Broader early rarity access after an explicit design change. |
| Dual wielding | Limit Off-hand axes to tagged light one-handed models. | Allow all one-handed axes after balancing. |
| Rarity presentation | Accepted White/Green/Blue/Orange/Gold/Crimson names, plus distinct text/icons and separate set emblem. | Exact hex values, contrast and icon treatment remain open. |

## References inspected

- [October 22 instruction blocks for Code](https://docs.google.com/document/d/18Bok8lccbkj8o7UXZYZPfCaaNc00JXfAoFpNzihYEks/edit): current slot, Shop, faction, prototype, and audit decisions.
- [Loot_Schema_Revised](https://docs.google.com/spreadsheets/d/12_DCjEQDjvgfTQP5RTX473tDDgNcys7cg2_djlv6h2w/edit): legacy rarity, tier, signature-drop, validation, and probability semantics.
- [GDD_v5.3](https://docs.google.com/document/d/1tEtt7VRBzROQzreqteuOUTrATkLjtVTe/edit): earlier equipment, scaling, durability, and progression framework.
- [Build log](https://docs.google.com/spreadsheets/d/1qq_Z3PkOImMhpYpdYwInoRTZp7QEWalg/edit): reported module split, simulation checks, save work, and unresolved resource design.
- [Excalibur Easter Egg / Water amendments](https://docs.google.com/document/d/1b--fcCojdi6aGfMFyklryDe7yhr8t2HaGW1T7fNWBpU/edit): rusted equipment, restoration ceilings, and parked unique-weapon mechanics.
- [AI Generated Content](https://docs.google.com/document/d/14pD4kse5dnqwj8j09M11ZQWJjSEucJLjGm8NXTZabeo/edit): optional fishing progression and planned site-system boundaries.

