# CB1 — Stop Report (Oct 10)

**Status:** `CB1 STARTER WEAPONS: CLOSED` (Oct 10). Stopped once at step 3 on an unauthorized test edit; **Sam authorized option 1** and the batch then closed with all 18 suites passing.

## Step 1 answers
- **TQ-CB1a:** yes. `ZI.simulateCombat` (`game/combat.js`) is the one fight loop; it calls `STAT_FORMULAS.resolveAttack` (`game/stats.js`) for every attack, in watched, offline and headless play. No screen copy. The specials live in `resolveAttack` (per-fight flags on the fight's own copies), so `combat.js` is unchanged. The Wandering fight builds its stat block in `wandering.js` and now passes the two fight fields (one line; `wandering.js` is in the batch's likely files). Camp siege defenders use the same loop but carry no specials, so they're unchanged.
- **TQ-CB1b:** yes, alongside `activeEvadeBonus`: `escapeChance` adds the equipped weapon's `escapeBonus` (via `resolveLoadoutStats`), inside the existing 5–90 clamp. It is **not** added to combat evasion.
- **TQ-CB1c:** no test or seeded sequence references the Nail Bat or Iron Knuckles. Rolls for the specials are drawn only when a special is present, so fighters without one keep their exact sequences.

## Step 2 — implemented
| File | Change | sha256 (12) before → after |
|---|---|---|
| `game/items.js` | Nail Bat 28 dmg, 3 kg, `heavySwingPct` 30; Iron Knuckles 16 dmg, `staggerPct` 25; new Pocket Knife (16 dmg, `escapeBonus` 30, loot +5, 0.5 kg, common, no recipe); descriptions match; `resolveLoadoutStats` reports the three specials | see CODE_STATE |
| `game/stats.js` | `resolveAttack`: heavy swing and stagger (lost next attack); `survivorStatBlock` carries the specials; `escapeChance` adds the weapon bonus | |
| `game/wandering.js` | passes `heavySwingPct` / `staggerPct` into the Wandering fight | |
| `tests/cb1-starter-weapons.test.js` | new, 7 checks | |

## Verification so far
| Item | Result |
|---|---|
| New suite | **7/7 PASS.** On the pre-CB1 code it fails 5 of 7 (1, 2, 3, 4, 7). Check 4 measured Bat **2.561**, Knuckles **2.824**, Knife **3.704** HP lost per fight (targets 2.55 / 2.82 / 3.71) |
| 16 of 17 suites | PASS, unchanged |
| r1 ×5 | 42/42 each; checks 20 and 26 pass, unedited |
| sim-clock-rng ×5 | identical results |
| Differential vs pre-CB1 (no weapon, crowbar, machete, combat knife, spike board, Bat, Knuckles × 2 policies × 2 seeds, all saved game state, frozen clock) | **Identical for every weapon except the Nail Bat and Iron Knuckles** — exactly the declared difference |

## The stop
`split-equivalence` fails one check twice ("data values equal: CRAFT_RECIPES"). That test compares today's data with the archived pre-split `game-data.js`. The **Iron Knuckles crafting recipe copies the item's description** into its `lore` field, and decided behavior 3 changed that description from "15% stagger chance on hit." to "25% stagger chance on hit." That one text field is the whole difference (verified: 89 recipes each, one field differs).

Passing it needs a test edit: add `CRAFT_RECIPES` to that test's `DATA_CHANGED` list (the list of data tables that are allowed to differ from the archive). CB1 authorizes no test edits.

**Options for Sam**
1. **Authorize the one-word test edit (recommended).** The recipe text follows the item description by design; the alternative is a recipe that says "15%" for a 25% weapon.
2. Keep the old "15%" text. Contradicts decided behavior 3.

## Also found (existing, not CB1's)
With some weapon and load combinations, bulk processing and 1-second processing record the "too heavy" log row at different positions in the event list. Game state and the set of events are identical; only the position of that grouped log row differs (Batch 3A groups refused pickups once per processing call). Reproduced on the pre-CB1 build with a 16-damage weapon, so it is not caused by CB1. CB1's check 5 compares game state and all other events. **Not a bug in game state; noted for Design** (only matters if a future test compares raw event order).

## Folder state
CB1 code changes are in place (3 game files + new suite). One existing test fails as described. Pre-CB1 copy kept outside the project.

## Resolution (Oct 10)
Sam approved option 1. `split-equivalence` `DATA_CHANGED` now includes `CRAFT_RECIPES` (one word, commented). Rerun: **all 18 suites pass**, including split-equivalence 17/17 and the CB1 suite 7/7.

**Closing line:** `CB1 STARTER WEAPONS: CLOSED`
