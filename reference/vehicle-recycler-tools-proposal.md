# Vehicle recovery and recycler tools — proposal

**Status:** Tool and recycler first pass wired in the working tree; vehicle recovery is designed below but not implemented. Route/Schedule integration remains open.
**Date:** Oct 30, 2026

## Goal

Connect vehicle recovery, POI discoveries, and Stockpile's Recycler through physical handyman tools. Finding a tool gives the player a useful capability, while keeping and wearing it out makes equipment condition and spare tools matter over time.

## Core loop

1. Find tools at Hardware Store or Scrapyard POIs and keep them in Stockpile.
2. Equip one on the Utility Tool belt slot or carry it in pockets for field use.
3. Contextual finds trigger automatically: pliers can recover bone fragments after zombie kills and wiring at electrical sites; hammers and wrenches recover fasteners; the torch cuts plate scrap for Metal and consumes Fuel.
4. In Stockpile's Recycler, choose a matching tool-assisted job to improve material recovery or processing time. The job reserves the tool, wears it only on completion, and returns it in the next condition state. Cancelling returns it unchanged.
5. Repair worn or broken tools at base/camp with Mechanical 2 or Engineering 2 plus 2 Metal and 1 Electronics. Broken tools can instead be recycled for scrap.

Tools are physical items, not permanent unlock flags. Only carried or equipped tools provide field effects; merely storing a tool does not. The current condition loop is Ready → Worn → Broken, with each successful use advancing one state.

## Tool roles `[PROPOSED]`

| Tool | Recycler role | Vehicle recovery role |
|---|---|---|
| Screwdriver | Adds Electronics when carefully processing mixed metal/electronics salvage | Can support an abstract temporary vehicle field-start check; it does not restore or permanently unlock the vehicle. |
| Adjustable wrench | Adds Metal when processing metal salvage | Finds Fasteners at vehicle and scrapyard sites. |
| Needle-nose pliers | Adds Wiring when processing electronics-only salvage; speeds that job | Finds Wiring at electrical sites and Bone Fragments after zombie kills. |
| Claw hammer | No dedicated Recycler bonus yet | Finds Fasteners while scavenging built-up locations. |
| Acetylene torch with portable tank | No dedicated Recycler bonus yet | Cuts plate salvage into Metal at selected POIs and consumes Fuel. It equips in the Utility Tool slot. |

Exact yields and encounter probabilities remain open for balancing. Bone Fragments, Fasteners, and Wiring are now materials; Bone-Plated Vest is craftable from Bone Fragments and Cloth.

## Recycler rules `[PROPOSED]`

- Tool-assisted jobs appear only when the player has the matching usable tool and eligible salvage.
- Tools wear only when a tool-assisted job completes; cancellation returns the reserved item unchanged.
- Usable tools are not Recycler salvage and cannot be bulk recycled. Broken tools can be intentionally recycled.
- Tool use should improve access to specific material categories or recovery quality, not multiply every recycler output indiscriminately.
- Preserve the current recycler's queued-job flow and Stockpile ownership model. Tool assistance is an explicit per-item action, and the tool is reserved while queued.

## Vehicle encounters and recovery `[PROPOSED BASELINE]`

### Encounter flow

1. Traversal reveals a vehicle encounter and automatically reports its visible condition and likely contents.
2. Cars are common, but most have no key and cannot be driven when found. Bikes are less common, but are more likely to be usable or recoverable with a light repair.
3. Searching yields basic contents without a tool: cloth, a small amount of fuel when present, and loose metal scrap. A search can also report that a vehicle is empty, stripped, or too dangerous to approach.
4. A carried or equipped utility tool enables an additional, tool-specific salvage action. Each action uses its associated skill, shows its result in the encounter log, and wears the tool after successful salvage. Skill checks are abstract; never show real-world vehicle bypass instructions.
5. A vehicle's reusable components are tracked separately from generic scrap. The player may keep parts for restoration or send unwanted parts through the Recycler. Dismantling a wreck permanently closes that wreck's restoration opportunity.

### Crafting sectors and vehicle recovery recipes `[PROPOSED BASELINE]`

Add **Vehicles** as a recipe-sector card beside **Food / Cooking**. Unlock the Vehicles sector at **Character Level 30**—one level above the player's current Level 29—then reveal individual vehicle recipes at their own character and profession gates. Character level and profession levels are separate: profession tracks currently run from 1 to 50. This card belongs to recipe progression; the existing Proposed Frame Cards weapon gallery remains a display-only preview.

The counts below are the proposed exact restoration costs. The discovered frame/chassis is part of the wreck and is not charged as a separate component. A repair consumes the listed parts; Fuel is the initial operating fill. Reusable part items should stay separate from generic Metal until vehicle restoration is implemented.

| Recipe tier | Character unlock | Restoration bundle | Profession gates | Tools and station |
|---|---:|---|---|---|
| Bicycle | 30 | 2 Wheels, 1 Chain, 4 Fasteners | Mechanical 5 | Wrench or Pliers; Workshop 1 |
| E-bike | 35 | 2 Wheels, 1 Chain, 1 Battery, 1 Motor, 1 Controller, 6 Wiring, 6 Fasteners | Mechanical 10, Engineering 8 | Wrench, Pliers, Screwdriver; Workshop 2 |
| Car | 40 | 4 Wheels, 1 Engine Assembly, 1 Battery, 1 Wiring Harness, 8 Metal Parts, 2 Pipes, 12 Fasteners, 10 Fuel (initial fill) | Mechanical 15, Engineering 12, Smithing 8 | Wrench, Pliers, Screwdriver; Garage 1 and Forge 1 |
| Utility truck / 4x4 | 45 | 4 Heavy Wheels, 2 Engine Assemblies, 2 Batteries, 2 Wiring Harnesses, 20 Metal Parts, 6 Pipes, 20 Fasteners, 20 Fuel (initial fill) | Mechanical 22, Engineering 18, Smithing 15 | Wrench, Pliers, Torch; Garage 2 and Forge 2 |

Mechanical covers condition diagnosis, disassembly, fitting, and repair. Engineering covers batteries, wiring, controllers, and electrical compatibility. Smithing covers fabricated brackets, plates, and reinforced fittings from Metal Parts and Pipes; it does not replace Mechanical diagnosis or Engineering electrical work. Cloth is a common interior salvage result and can support seat/strap repairs, but is not mandatory for restoring the engine or frame.

### Tool and profession roles

| Tool | Vehicle use | Minimum profession check |
|---|---|---|
| Adjustable Wrench | Remove or fit wheels, bolts, and accessible mechanical assemblies | Mechanical 3 |
| Needle-Nose Pliers | Recover or reconnect wiring and small fittings | Engineering 3 |
| Screwdriver | Inspect/remove electronics and assess a missing ignition component | Engineering 4; Mechanical still gates full restoration |
| Claw Hammer | Recover fasteners and accessible fittings for workshop use | Smithing 3 or Mechanical 3 |
| Acetylene Torch with Portable Tank | Cut plate or pipe into usable metal salvage; consumes 1 Fuel per cut | Smithing 5 or Engineering 4 |

Basic searching does not require a skill or tool. Tool salvage uses the matching minimum above; failure yields no component and does not wear the tool. A one-time abstract field-start attempt on a keyless car requires a Screwdriver plus Engineering 8 or Mechanical 10. Success only reaches the next safe stop, does not grant ownership, and does not replace restoration.

Mechanical governs condition assessment, disassembly, fitting, and repair. Engineering governs electrical compatibility, batteries, wiring, and improvised systems. Smithing governs making or restoring metal fittings and processing heavy plate. A high skill can reduce salvage risk or wear, but does not waive required parts or stations.

### Biome distribution

Use **Ruined Suburbia = 1.00** as the reference wreck-site weight. These are relative weights for the wreck-site roll, not a per-cell spawn probability; the underlying cell/sector spawn rate remains a separate tuning value.

| Biome | Relative wreck-site weight | Vehicle mix when a wreck appears: bicycle / e-bike / car / utility truck |
|---|---:|---|
| Mountain Country | 0.70 | 45% / 10% / 35% / 10% |
| Ruined Suburbia | 1.00 | 25% / 10% / 55% / 10% |
| Metropolis City | 1.20 | 10% / 15% / 60% / 15% |
| Debris Frontier (`perimeter` in current code) | 0.35 | 5% / 10% / 30% / 55% |

Cars remain the most common wreck class in suburbia and metro, but their ignition keys are absent in ordinary encounters. Bikes are concentrated in Mountain Country and have better recovery odds: a bicycle is proposed at 60% ride-ready, 30% field-repairable, and 10% full-restoration; an e-bike is 30% ride-ready with usable charge, 40% field-repairable/rechargeable, and 30% full-restoration. Cars and utility trucks are always keyless when discovered; their wreck condition determines whether they are full-restoration candidates or salvage-only. A temporary abstract start is a separate tool-and-skill action and never changes ownership.

| Biome | Vehicle profile | Likely salvage emphasis |
|---|---|---|
| Mountain Country | Bikes and utility vehicles are the characteristic finds; fewer ordinary cars | Wheels, chains, cloth, fuel, and rugged fittings |
| Ruined Suburbia | Most frequent ordinary car wrecks, alongside bicycles | Tires, batteries, wiring, interior cloth, and common metal parts |
| Metropolis City | Highest wreck-site frequency; many cars are stripped or blocked in | Electrical components, batteries, wiring harnesses, and occasional engine parts |
| Debris Frontier (`perimeter` in current code) | Lowest wreck-site frequency, but the heaviest vehicle mix and greatest danger | Heavy wheels, pipes, plate, engine assemblies, and high-value parts |

The current prototype's display name for `perimeter` is “The Debriefed Perimeter”; “Debris Frontier” is the proposed design label used here. Encounter odds and yields remain to be balanced.

### Upkeep and route limits

- Bicycles use no fuel. Wear or a breakdown reduces the run to on-foot travel until repaired; they remain recoverable at the breakdown location.
- E-bikes consume stored charge and can be recharged at a camp/base or with a spare battery. A depleted battery removes the range advantage but does not destroy the bike.
- Cars and trucks consume Fuel per route and lose condition from distance, hazards, and vehicle nodes. A breakdown delays or ends the run; the vehicle remains at its map cell for later recovery.
- Greater range and cargo must carry higher fuel, repair, and exposure costs. Vehicles do not bypass the separate daily direct-Traversal movement cap.
- Temporary vehicle starts and permanent restoration are separate outcomes. A temporary start is an abstract skill-gated event with limited use; it never grants ownership or substitutes for the restoration bundle.

## Art

Retro inventory sprites exist for ready, worn, and broken states of the screwdriver, adjustable wrench, needle-nose pliers, claw hammer, and acetylene torch with portable tank. All assets are in `art/tools/`.

## Open before implementation

- Absolute wreck-site spawn rate, salvage quantities, vehicle condition rates for cars/trucks, and condition loss; biome weights and bike usability rates above are the proposed baseline.
- Whether the proposed Workshop/Garage levels, skill thresholds, and fuel or charge costs fit the progression pace.
- Exact limits and risks for temporary starts, which remain separate from permanent ownership.
- Whether Routes and Schedule/Camp duties should consume tools or grant tool-assisted salvage and repair.
- UI and save-data design for keeping parts, stripping a wreck, and tracking a stranded vehicle.

## Existing system context

- Stockpile already contains Recycler, Storage, and Gear & Loadout views.
- Recycler jobs currently convert eligible salvage to materials over time; Mechanical receives XP for recycling.
- Tools now appear in Stockpile, can be equipped/carried, assist Recycler jobs, and can be repaired with skill and materials.
- Hardware Store and Scrapyard searches can discover tools. Traversal and Wandering include first-pass automatic salvage hooks.
- Vehicle parts, recovery tiers, and skill gates are proposed above; implementation and route integration remain open in the route design notes (`reference/route-01-route-builder-concept.md`).
