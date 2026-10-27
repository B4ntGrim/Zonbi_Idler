# Proposed crafting frame cards

Updated after Sam's direction on 27 October 2026: the standalone Weapons page was not approved and was removed. This reference describes display-only, clickable proposed frame cards inside **Crafting → Proposed frame cards**, styled after the supplied dark pixel RPG card examples. Missing metrics stay **Not defined**. The cards do not approve recipes or add gameplay items, rolls, progression, sockets, or combat effects.

## Catalog selection

- Current `ZI.GEAR_ITEMS` weapons and Throw-slot consumables, read directly from the current game data. Base damage is shown as base damage, never converted into DPS.
- **100 regular axe concepts**, selected across all six axe sections: 17 / 17 / 17 / 17 / 16 / 16. The six named Unique candidates are excluded from this regular selection.
- **All six existing named axe Unique concepts**: Matilda, Delila, Judith, Ariadne, Adelaide and Odette. These use the original stable AXE IDs, epithets and suggested bonus types. Zelda remains absent.
- **Danielle and Raquelle**, two new axe Unique concepts, linked as a two-piece set.
- Additional authored Unique concepts and set types listed below.
- The seven primary/sidearm concepts discussed with Sam: Watchfire Marksman Rifle, Palisade Flare Pistol, Select-fire Carbine, Semi-automatic Precision Rifle, Drum-fed Support Rifle, Machine Pistol and Semi-automatic Pistol.
- Relic weapon candidates derived from current persistent Legendary weapons. Their enhanced stats are not defined; their pages link to the base weapon.
- The ten older Unity weapon seed records, explicitly labeled **Legacy prototype**. Their source values are not current game values.

The full 299-entry axe source remains intact. `node tools/build-weapon-catalog.cjs` exports only this selection and the legacy seeds to `weapon-design-data.js`. This file is a display reference, not a gameplay import. Current equipment is read at runtime by `crafting-frame-proposals.js`.

## Authored Unique concepts

All entries below are proposals. Bonus values, attribute assignments, acquisition, rarity rolls, requirements, duration, damage, and cooldowns remain undefined unless an original source explicitly supplies a value.

| Record | Identity | Proposed bonus themes | Exclusive mechanic direction |
|---|---|---|---|
| Danielle — The Opening Cut | Light one-handed silvered bearded axe; hooked heel, black cloth grip | Attack speed; Crit Chance | Creates an opening for its partner. |
| Raquelle — The Closing Argument | One-handed broad bronze crescent axe; reinforced poll, crimson binding | Damage; Status Chance | Consumes a prepared opening for a sweeping finisher. |
| Night Current — Borrowed Lightning | Katana with an exposed scavenged e-bike battery | Special Damage; Status Chance | Committed slashes prepare a battery discharge. |
| Hushline — Borrowed Breath | Suppressed SMG with bronze receiver and cloth stock wrap | Crit Chance; Movement speed | Rewards a clean approach against an unaware target. |
| Lamplighter — The Final Signal | Caged flare sidearm with a leather keeper | Duration; Status Chance | Reveals an approaching threat for a paired follow-up. |
| Duskplate — The Quiet Wall | Compact iron-rimmed shield with copper-stapled dark leather | Defense; Max HP | A committed guard prepares a deliberate counterstrike. |

S.U.R.V.I.V.A.L. fields appear on Unique records. None has an assigned attribute value in this pass. Duskplate is a proposed set companion, not an existing equip slot implementation.

## Two-piece set concepts

| Set | Type | Pieces | Pair effect direction |
|---|---|---|---|
| Duet of Iron | Dual axes | Danielle + Raquelle | Alternating eligible strikes creates and consumes an opening for a finisher. Repeating one axe does not complete the sequence. |
| Checkpoint Covenant | Axe and shield | Matilda + Duskplate | A successful committed block prepares Matilda's next eligible counterstrike. |
| Night Courier | Primary and sidearm | Hushline + Lamplighter | A threat revealed by Lamplighter becomes eligible for Hushline's prepared follow-up. |

Two distinct named pieces are required. These descriptions are not combat rules. Exact triggers, ownership, stacking, reset conditions, ranges, timing and anti-loop rules require a future design/implementation pass.

## Presentation and links

- Crafting contains the existing recipe browser and a separate **Proposed frame cards** view. Recipe details can link to a matching proposed card preview. The preview never performs a craft or grants an item.
- `#crafting/proposed/<record-id>` opens a proposed card within the Crafting page; `#crafting/proposed` opens the proposal overview.
- Copper trim with violet/cyan accents for signature weapons; leather and iron for axes/bows; slate and hazard stripes for heavy flame weapons; dark bronze for sidearms and compact guns.
- Frames and pixel silhouettes are code-native CSS/SVG. Card text is selectable, uses actual source fields and remains readable at different scales.
- A source panel distinguishes current records, proposals and archived prototype values. Unimplemented description effects are not promoted to numerical stats.
- An undefined value is never treated as zero. Undefined socket counts do not display a fabricated number of sockets.

Implementation: `crafting-frame-proposals.js`, `crafting-frame-proposals.jsx`, `crafting-frame-proposals.css`, `weapon-design-data.js`, and both HTML entry pages. The standalone Weapons navigation and Stockpile links have been removed.
