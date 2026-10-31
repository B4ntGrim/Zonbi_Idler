# ROUTE-01 — Route builder on Traversal (concept)

**Status:** concept. Not scheduled. Becomes a slice after TRAV-01.
**Date:** Oct 21

## 1. Design direction `[CONCEPT Oct 21–28]`

- On **Routes**, select a biome available from the survivor's current Traversal position, then choose an entry under **Available Routes**.
- Select **Idle Run** and press **Deploy** to transition to Traversal with circuit drawing active. The route starts at the survivor's current cell; the player draws and closes a full loop there. The completed circuit is saved under the selected biome and route entry.
- The selected route entry and Idle Run state carry across the tab transition. Whether Deploy automatically begins the first loop after the drawing is saved remains open.
- The loop path is drawn over the Traversal map. Player-made circuits use visited, unlocked cells; a quest can authorize an unvisited unlocked cell.
- Use purple for the start cell and direction arrow, yellow for cells already added, and green for a valid next cell. Mark invalid cells clearly and use outlines or symbols as well as color.
- Transport sets the maximum squares in one loop; available food sets the planned run duration. Exact food-consumption rates remain open.
- Hovering a candidate cell shows a **yellow lens** with its details and an arrow preview; clicking adds it to the route. Touch controls use a first tap for preview and a second tap to add it.
- **Route length depends on transport:** on foot about 2 cells; a bike 3 or 5; a vehicle many cells.
- A route must be a **circuit** (it returns to where it started).
- A vehicle lets the survivor cover many cells to scout, loot, find water and find safer ground.

## 2. Proposed rules `[PROPOSED]`

| # | Rule | Why |
|---|---|---|
| R1 | **Circuit = ends next to or on its start cell.** The survivor loops it while idle | A loop never strands the survivor and repeats cleanly offline |
| R2 | Routes follow existing movement: one cell at a time to any of the 8 neighbours; player-made circuits use only visited, unlocked cells. A quest may authorize an unvisited unlocked cell (C28) | Reuses Traversal movement while keeping routine routes on known ground |
| R3 | **Route length by transport:** first version: foot 2 and bike 3 squares per loop. Later starting values: electric bike 5 and vehicle 8+. Direct Traversal movement still has its separate daily cap; circuit travel does not consume it (C22, C29) | Each step up is a clear upgrade; values live in the data table |
| R3a | **Electric bike is quieter:** fewer encounters on its route (starting value −25%), and it needs **charge** | Quiet is what makes it worth the step from 3 to 5 cells |
| R3b | **The electric bike runs on a battery item.** Batteries are recharged by a **generator that burns fuel**, fuel's second job | `[DECIDED Oct 21]` Sam |
| R4 | **Vehicles use fuel.** Fuel finally gets a job (it had none) | Systems touching each other; solves the resources-bar gap |
| R5 | Each circuit step records the visited cell as **explored**; sector map visibility alone does not make each cell familiar. A cell becomes **cleared** through its existing kill-based rule (C23; TRAV-01 T6) | Route familiarity reflects actual travel, while clearing remains tied to combat |
| R6 | **Lens on touch screens:** no hover on phones, so the first tap shows the lens and the second tap adds the cell. The lens and route states use an outline as well as color (C31) | Hover doesn't exist on mobile; color alone isn't readable for everyone |
| R7 | Each route cell shows its familiarity and danger on the lens | The player plans with the same numbers the game uses |

## 2a. Routes activation and Traversal drawing `[PROPOSED Oct 28]`

- On **Routes**, the player selects an available biome based on their current Traversal position, then selects a route entry under **Available Routes**.
- The player selects **Idle Run** and presses **Deploy**. The game transitions to Traversal and enters circuit-drawing mode, starting from the survivor's current cell.
- While drawing, an arrow marks the start and previews direction toward the adjacent cell under the pointer. Clicking commits the next cell. Continue through valid cells and close the path into a full loop; save it under the selected biome and route entry.
- The previous idea of entering drawing directly from Zone Details is superseded by this Routes-first activation flow. Zone Details can still show the current start cell and relevant travel information during drawing.
- Whether Deploy starts the circuit immediately after drawing, or only saves it for later activation, remains open.
- For circuits, the Routes **Last Run** panel reports the latest completed loop and holds unclaimed rewards. Replay follows the normal Routes-to-Traversal activation flow; the report is not a separate launch point (C32).
- Purple marks the start cell and direction arrow, yellow marks cells already added, and green marks a valid next cell. Invalid cells get a clear blocked marker; outlines or symbols also communicate state (C31). Touch controls use preview and confirm.
- Transport sets the maximum squares in one loop; available food sets the planned duration. Show the planned food coverage before departure. Exact consumption rates remain open (C29–C30); the first version uses foot and bike (C21).
- Schedule can launch a saved circuit, as proposed in `circuit-expedition-concepts.md` §10.

## 2b. Routes page layout `[PROPOSED Oct 28]`

- Reduce the **Active Run / Idle Run** cards to a compact two-choice control; keep their descriptions available without using a large block of vertical space.
- Make **Available Routes** a tighter, scrollable list with concise route rows, giving more room to route details and results.
- Widen the right column so the player can read and claim the latest results. Keep **Last Run** visible with its unclaimed total and **Claim All** action easy to reach; allow the event log to scroll inside the panel.
- Replace **Lone Operative** with **Run Readiness**, focused on the selected route/circuit: transport, squares used versus the transport limit, planned duration and food coverage, danger/encounter estimate, room for loot, and any reason deployment is blocked. Show vehicle fuel or condition when those systems are part of the route version.
- Treat identity details such as survivor name/class/level as secondary. The panel's main job is to help the player decide whether the selected trip is ready and understand its risks.
- Exact column widths, responsive breakpoints, and which readiness values fit in the first version remain open.

## 3. Open

- `[PROPOSED Oct 28]` Routes selects the biome and route entry; **Idle Run** plus **Deploy** transitions to Traversal drawing mode. Traversal owns the circuit geometry. Schedule could launch or schedule a saved circuit later; reconcile its timeline with real-time circuit timers and decide what happens after a late return. Review how Routes' Idle Run control relates to the Shop gate for one-loop mode (C3). Details are in `circuit-expedition-concepts.md` §§9–10.
- `[OPEN]` Does **Available Routes** select an existing circuit to edit, a blank route slot, or a route template?

- **Circuit decisions C1–C8 `[DECIDED Oct 25]`** live in `circuit-expedition-concepts.md` (Decisions): real-time duration with game time in small text, repeat by default, Shop "one loop only" toggle, safe ending at the start cell, first stop rules (HP, stress, pack), rest through the night by default, rule priority, return report. R1's "loops it while idle" now follows C2–C4. **C10–C32 `[DECIDED Oct 26–28]`:** the first circuit version is foot and bike only, with food setting planned duration and no fuel, battery or cargo use (C21, C30); scavenge and rest stops only (C15–C16); player circuits use visited unlocked cells, with quests allowed to authorize unvisited unlocked cells (C28); transport sets squares per loop (C29); purple marks the start, yellow the selected path, green a valid next cell, and invalid cells get a blocked marker (C31); circuit movement has its own timing and stop rules and does not consume the direct Traversal movement cap (C22); each visited cell records per-cell discovery, and clearing remains kill-based (C23); circuits collect only remaining loot, which does not respawn on revisit (C24); breakdowns can delay return, bicycles can be walked home, and stranded vehicles stay recoverable at their map cells (C25–C26); repeat visits do not pay XP again for the same resolved encounter, while new encounters remain eligible (C27); Last Run reports the latest loop and unclaimed totals, with replay through the Routes-to-Traversal flow (C32). Exact food rates and whether a bike uses fuel stay open below.

- **Idle patrol connection `[DECIDED Oct 28]`:** a custom Traversal circuit defines the survivor's idle patrol path. It reuses the Traversal movement and cell-visit system rather than running as a second, parallel patrol. Existing predefined Routes remain separate unless a later design decision migrates them.

- `[OPEN]` Battery capacity (how many route loops per charge) and generator fuel cost.
- `[OPEN]` How bikes and vehicles are obtained (crafted, found, quest), and whether a bike uses fuel.
- `[OPEN]` Which repair items, tools, or actions are required to restore a stranded vehicle.
- `[PROPOSED Oct 30]` Handyman tools connect Stockpile's Recycler to salvage and vehicle recovery; see `vehicle-recycler-tools-proposal.md`. This proposal does not yet define the permanent vehicle restoration recipe.
- `[OPEN]` `[CODE]` How Routes works today (route cards, stops, dead buttons from PF6), so the builder reuses it.

## 4. Watch for

- **Longer routes mean more exposure.** A vehicle route crosses more unfamiliar cells, so danger and fuel must rise with length, or the vehicle becomes the only sensible choice.
- **Offline loops** must use the same seeded movement as watched play.
