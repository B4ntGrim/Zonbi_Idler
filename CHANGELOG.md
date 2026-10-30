# Changelog

## 2026-10-30 — Hand tools, salvage, and vehicle recovery baseline

### Implemented in the working tree

- Added screwdriver, adjustable wrench, needle-nose pliers, claw hammer, and acetylene torch with portable tank as physical utility tools. Each has ready, worn, and broken retro sprite variants.
- Connected carried or equipped tools to contextual salvage during Traversal, Wandering, and Routes. Successful tool use advances its condition.
- Added tool-assisted Recycler jobs, Stockpile storage/equipping/repair controls, broken-tool recycling, salvage materials, and related crafting recipes.
- Repair requires Mechanical 2 or Engineering 2 and costs 2 Metal plus 1 Electronics.

### Vehicle recovery design baseline — proposed, not implemented

- Vehicle encounters report visible details and automatically expose basic contents for searching. Cars are common but usually keyless; bikes are less common and more likely to be recovered in usable condition.
- A usable carried tool enables deeper component salvage. Reusable vehicle parts remain separate from generic scrap so they can support restoration; excess parts can go through the Recycler.
- Proposed a **Vehicles** recipe-sector card beside Food/Cooking, unlocked at Character Level 30. Character-level recipe unlocks are separate from profession requirements; the player's current Level 29 makes this an imminent progression milestone.
- Set proposed restoration costs and profession gates: Bicycle at Character 30 / Mechanical 5; E-bike at 35 / Mechanical 10 / Engineering 8; Car at 40 / Mechanical 15 / Engineering 12 / Smithing 8; Utility Truck at 45 / Mechanical 22 / Engineering 18 / Smithing 15. Each tier has an exact parts bundle, required tools, and Workshop/Garage/Forge gate in [reference/vehicle-recycler-tools-proposal.md](reference/vehicle-recycler-tools-proposal.md).
- Set proposed tool-salvage checks: Wrench—Mechanical 3; Pliers—Engineering 3; Screwdriver—Engineering 4; Hammer—Smithing 3 or Mechanical 3; Torch—Smithing 5 or Engineering 4. A temporary abstract car start requires a Screwdriver and Engineering 8 or Mechanical 10, grants only a one-time trip to the next safe stop, and never grants ownership.
- Proposed biome profile: Mountain Country favors bikes and utility vehicles; Ruined Suburbia has frequent ordinary cars; Metropolis City has abundant but often-stripped cars and electrical components; Debris Frontier (the current `perimeter` biome) has rarer industrial wrecks and higher danger.
- Set proposed wreck-site weights relative to Suburbia 1.00: Mountain Country 0.70, Metropolis City 1.20, Debris Frontier 0.35. Vehicle-class percentages per wreck and bicycle/e-bike ready-versus-repairable rates are in the vehicle recovery proposal; absolute per-cell spawn probability remains open.
- Proposed upkeep keeps bicycles fuel-free, gives e-bikes charge costs, and makes cars/trucks consume Fuel and condition on routes. Greater range and cargo come with higher costs and exposure. A temporary start remains separate from permanent restoration and is only an abstract in-game skill check.
- Encounter rates, component salvage yields, and the `perimeter` display name remain open. These are design proposals, not implemented recipes. No real-world vehicle-starting procedure is specified.

### Checkpoint

This entry records the local working-tree baseline. The changes have not been committed or tested.
