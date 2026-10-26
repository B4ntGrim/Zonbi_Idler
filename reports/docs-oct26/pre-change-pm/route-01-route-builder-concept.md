# ROUTE-01 — Route builder on Traversal (concept)

**Status:** concept. Not scheduled. Becomes a slice after TRAV-01.
**Date:** Oct 21

## 1. Sam's direction `[CONCEPT Oct 21]`

- Clicking **Idle run** lets the player pick cells (by letter and number) to build a route.
- The route is drawn **over the Traversal map** (a layer on top of the grid).
- Hovering a cell shows a **yellow lens** that's easy on the eyes; clicking adds the cell to the route.
- **Route length depends on transport:** on foot about 2 cells; a bike 3 or 5; a vehicle many cells.
- A route must be a **circuit** (it returns to where it started).
- A vehicle lets the survivor cover many cells to scout, loot, find water and find safer ground.

## 2. Proposed rules `[PROPOSED]`

| # | Rule | Why |
|---|---|---|
| R1 | **Circuit = ends next to or on its start cell.** The survivor loops it while idle | A loop never strands the survivor and repeats cleanly offline |
| R2 | Routes follow existing movement: one cell at a time to any of the 8 neighbours; locked cells can't be added | Reuses Traversal movement (JD1a facts) |
| R3 | **Route length by transport:** foot 2, **bike 3** `[DECIDED Oct 21]`, **electric bike 5** `[DECIDED Oct 21]` (quicker, quieter, faster), vehicle 8+ (starting value) | Each step up is a clear upgrade; values live in the data table |
| R3a | **Electric bike is quieter:** fewer encounters on its route (starting value −25%), and it needs **charge** | Quiet is what makes it worth the step from 3 to 5 cells |
| R3b | **The electric bike runs on a battery item.** Batteries are recharged by a **generator that burns fuel**, fuel's second job | `[DECIDED Oct 21]` Sam |
| R4 | **Vehicles use fuel.** Fuel finally gets a job (it had none) | Systems touching each other; solves the resources-bar gap |
| R5 | Walking a route builds **familiarity** on every cell in it (TRAV-01 T6) | Routes become the way a player tames an area |
| R6 | **Lens on touch screens:** no hover on phones, so the first tap shows the lens and the second tap adds the cell. The lens uses an outline as well as yellow | Hover doesn't exist on mobile; color alone isn't readable for everyone |
| R7 | Each route cell shows its familiarity and danger on the lens | The player plans with the same numbers the game uses |

## 3. Open

- **Circuit decisions C1–C8 `[DECIDED Oct 25]`** live in `circuit-expedition-concepts.md` (Decisions): real-time duration with game time in small text, repeat by default, Shop "one loop only" toggle, safe ending at the start cell, first stop rules (HP, stress, pack), rest through the night by default, rule priority, return report. R1's "loops it while idle" now follows C2–C4. **C10–C21 `[DECIDED Oct 26]`:** the first circuit version is foot and bike only, with no fuel, battery or cargo use (C21); scavenge and rest stops only (C15–C16). Whether a bike ever uses fuel stays open below.

- `[OPEN]` Battery capacity (how many route loops per charge) and generator fuel cost.
- `[OPEN]` How bikes and vehicles are obtained (crafted, found, quest), and whether a bike uses fuel.
- `[OPEN]` `[CODE]` How Routes works today (route cards, stops, dead buttons from PF6), so the builder reuses it.
- `[OPEN]` Does a route replace the current Wandering patrol, or is it one way to set it?

## 4. Watch for

- **Longer routes mean more exposure.** A vehicle route crosses more unfamiliar cells, so danger and fuel must rise with length, or the vehicle becomes the only sensible choice.
- **Offline loops** must use the same seeded movement as watched play.
