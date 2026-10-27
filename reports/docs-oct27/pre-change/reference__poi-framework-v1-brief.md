<!-- POI Framework v1 brief. Sam's Water amendments (rounds 1 and 2, formerly WATER_POI.md) are merged in. Tags: [DECIDED] unless marked [PROPOSED]. -->

# NEXT DESIGN SLICE — POI FRAMEWORK v1
## Proving POI: Water

> **Precondition [DECIDED]:** R1 is CLOSED and the HP drain bug is fixed before
> this slice goes to Code.

## Goal

Create one reusable Point-of-Interest framework for Zed Idler.

Water is the first non-Fort POI implemented through that framework.

The framework should solve generic POI concerns once:

- world placement;
- discovery;
- map representation;
- persistent state;
- revisiting;
- interaction availability;
- Wandering integration;
- offline behavior;
- save migration;
- reporting;
- future POI extensibility.

Do not build Church or other future POIs yet.

---

# 1. CORE POI MODEL

Each POI should have a persistent world identity.

Recommended conceptual record:

`poiId`
`type`
`cellId`
`discovered`
`state`
`seed/stateSeed`
`visitCount`
`lastVisited`
`type-specific data`

Do not force every POI to use the same type-specific fields.

The shared POI layer owns identity, placement, discovery and persistence.

Each POI type owns its own interaction/state payload.

Example:

Water POI may store:

- water subtype;
- current condition;
- whether inspected;
- whether secured;
- whether exhausted, if exhaustion exists later.

Church may eventually store completely different state without changing the
generic POI schema.

---

# 2. PLACEMENT

POI placement should be deterministic from the world seed.

A given world seed should always produce the same POI locations unless a save
already contains authoritative stored POI placement.

Once a POI has been stored in a save:

> Never silently move it because placement rules later change.

This follows the same save-stability principle already used for existing
world objects.

New placement rules apply only where a POI has not already been persisted.

## World size [DECIDED Oct 9]

The world is not a fixed size. It keeps expanding as the player travels, at
the player's own risk.

- Placement is per grid: each grid places its own POIs from its own seed when
  it is generated. No POI type may depend on a per-world total.
- A grid generated late must produce the same POIs as if it had been
  generated at world creation.

## Water placement [DECIDED]

Water is possible but not guaranteed per world grid.

- Each grid's seed picks a water-cell count in **0–3**, then places the cells
  deterministically.
- Same seed always gives the same count and the same cells, including zero.

---

# 3. POI UNIQUENESS

The framework should support both:

## Unique POIs

Examples:

- Fort
- special story locations

Only one exists per world unless explicitly designed otherwise.

## Repeatable POIs

Water is repeatable [DECIDED]: 0–3 per world grid, each with its own `poiId`.

Future site types already decided as repeatable [DECIDED Oct 9]:

- Church (rare; count per world [OPEN]);
- Workshop (placed by normal POI placement, not created inside a garage discovery).

Examples may eventually include:

- wells;
- water towers;
- clinics;
- stores;
- campsites;
- industrial sites.

The framework should therefore not assume every POI type is unique.

Each POI instance needs its own stable `poiId`.

---

# 4. CELL OCCUPANCY

The framework must explicitly decide whether multiple POIs may occupy one cell.

Recommended baseline:

> One major POI per cell.

Minor discoveries/events are not POIs and may still occur there.

This keeps:

- map readability;
- interaction UI;
- save state;
- travel targeting

much simpler.

Exceptions can be deliberately introduced later.

---

# 5. PLACEMENT EXCLUSIONS

Generic placement should support per-type exclusions.

Possible exclusions include:

- starting cell;
- current Base/camp cell;
- Fort cell;
- quest-critical field cells;
- another major POI;
- impassable/invalid terrain;
- minimum or maximum distance from start;
- minimum distance from another POI.

Do not hard-code all exclusions globally.

Each POI definition should be able to declare its placement constraints.

---

# 6. DISCOVERY STATES

I recommend three generic visibility states:

## UNKNOWN

POI exists in the world but is not known to the player.

No map marker.

## SUSPECTED

Player has evidence that something is nearby.

Map may show an uncertain marker or vague location.

This state can support future scouting/information systems.

## DISCOVERED

Exact POI is known.

Persistent map marker appears.

The POI can now be intentionally revisited.

For POI Framework v1, we can implement only UNKNOWN and DISCOVERED if we want
to keep scope small, while reserving SUSPECTED in the model.

---

# 7. DISCOVERY METHOD

This should be generic but type-configurable.

Candidate triggers:

- entering the POI cell;
- successful Scout;
- adjacent-cell Scout;
- quest/reputation revelation;
- another POI revealing it;
- map/intelligence unlock.

Recommended v1 rule:

> Entering the POI's cell discovers it automatically.

Scout may reveal POIs earlier later, but that does not need to block the first
framework implementation.

This avoids making POI discovery dependent on unfinished scouting upgrades.

---

# 8. MAP BEHAVIOR

Once discovered, a POI should have:

- map marker;
- name/type;
- cell position;
- persistent discovered state.

Selecting its cell should surface the POI interaction when the survivor is
physically present.

Selecting it from afar may show known information but must not allow remote
interaction.

The map should consume the canonical POI state rather than maintain its own
duplicate list.

---

# 9. ARRIVAL / INTERACTION MODEL

The generic POI framework should distinguish:

## Discover

First recognition of the location.

## Visit

The survivor enters a known POI cell.

## Interact

The survivor chooses a POI-specific action.

This matters because merely walking through a Water cell should not
necessarily perform every Water action automatically.

Generic framework:

`onDiscover`
`onEnter`
`availableActions`
`performAction`
`onLeave`

Not every POI type needs every hook.

---

# 10. POI STATE

POIs should support persistent lifecycle states.

Generic framework should not define what all states mean, but should support
something conceptually like:

`active`
`changed`
`depleted`
`secured`
`disabled`

Water may use only a subset.

Church may later use a different set.

Prefer type-owned state strings/data over one enormous universal POI enum.

---

# 11. REVISITING

A major POI should usually remain relevant after discovery.

The generic framework must therefore assume POIs are revisit-able unless a
type explicitly declares itself one-shot.

A POI interaction may be:

- always available;
- cooldown based;
- resource limited;
- condition based;
- quest gated;
- Standing gated;
- state gated.

This should be data/configurable per type.

---

# 12. WANDERING INTEGRATION

POIs exist inside the normal Wandering world.

Entering a POI cell must not create a second travel simulation.

Travel to and from POIs uses:

- existing movement;
- existing Stress;
- existing load;
- existing encounters;
- existing Retreat Rules;
- existing checkpoint logic unless the POI specifically changes checkpoint
  behavior.

A POI does not automatically become a checkpoint merely because it exists.

---

# 13. RETREAT / FAILURE INTERACTION

If the survivor voluntarily withdraws or is Forced Retreat while traveling
toward a POI:

- normal withdrawal/Forced Retreat behavior wins;
- POI state is unchanged unless an actual POI interaction already changed it.

Do not create a special "POI rescue" path.

---

# 14. OFFLINE SIMULATION

POI placement/discovery must remain deterministic offline.

If offline movement enters an undiscovered POI cell:

the framework must decide whether discovery happens automatically.

My recommendation:

> Yes. Physical arrival discovers the POI regardless of whether the player is
> watching.

The return report then records the discovery.

However:

> POI interactions requiring a player decision should not silently resolve
> themselves unless a Standing Policy or later automation rule explicitly
> permits it.

This mirrors our existing watched/unwatched design philosophy.

Water fishing [DECIDED]: fishing must be started in person at the water cell.
The timer then finishes offline and settles on read. The game never starts
fishing while the player is away.

---

# 15. REPORTING

Use one canonical POI event/result source.

Possible generic events:

- POI discovered;
- POI entered;
- POI interaction completed;
- POI state changed;
- POI unavailable/depleted.

Avoid having both the simulation and UI independently create duplicate
messages.

Example:

`💧 Discovered: Old Pump`

The map and Wandering log should read from the same canonical state/event.

---

# 16. SAVE BEHAVIOR

POI state must be persistent per save.

Save at minimum:

- stable POI ID;
- type;
- cell;
- discovery state;
- type-specific persistent state.

Do not regenerate stored POIs on every load.

For old saves:

- generate only missing POIs;
- never relocate already-stored world objects;
- use current world seed plus deterministic placement rules;
- migration should not alter unrelated save state.

Inspect the current canonical save version before adding a migration.

Do not assume the next version number.

---

# 17. DATA-DRIVEN POI DEFINITIONS

Avoid giant type-switch logic where possible.

Prefer a registry conceptually like:

`ZI.POI_TYPES`

Each type can define:

- id/type;
- display name;
- icon;
- unique/repeatable;
- placement constraints;
- discovery behavior;
- available actions;
- state initialization;
- interaction handler;
- report formatting.

Water should be implemented through this registry.

The framework should make adding the next POI mostly:

> define type + interactions

rather than:

> modify the entire Wandering engine.

---

# WATER — FIRST FRAMEWORK IMPLEMENTATION

Water should initially prove:

1. deterministic placement;
2. hidden → discovered transition;
3. map marker;
4. persistent POI state;
5. revisiting;
6. POI-specific action;
7. save/reload;
8. offline discovery;
9. canonical reporting.

Do not overload Water with every future survival mechanic in the first pass.

---

# WATER v1 — MINIMUM USEFUL DESIGN

Recommended Water POI concept:

## Water Source

v1 form [DECIDED]: a body of water (pond/creek) on **one passable cell**.

Out of v1: impassable terrain, multi-cell water.

For v1, choose one generic label if art/content isn't settled:

`Water Source`

On first arrival:

`💧 Water Source discovered.`

It remains permanently marked on the map.

---

# WATER v1 — INTERACTION

The first Water interaction should be useful without forcing us to build an
entire thirst simulation.

Recommended approach:

## "Fish" [DECIDED]

Water's benefit is fishing: timed idle work rather than a new constantly
depleting survival meter.

- Timed idle work. Settles on read. Works offline under the 24 h cap.
- Must be started in person at the water cell; the timer then finishes
  offline and settles on read. The game never starts fishing while the
  player is away.
- One action, one per-cell cooldown.
- Each pull returns exactly one result: **fish**, **loot**, or **empty**.
  Never fish and loot together.
  - Fish: nutrition (feeds stamina). Each fish = 1 nutrition [PROPOSED].
  - Loot: junk/trinket find (old boots, mementos). **Scavenging scales item
    tier only** (not loot share, not item count). Comfort stays out of this
    slice: trinket loot enters the haul and banks via the Recycler until a
    comfort system exists.
    - Rusted gear [DECIDED]: a rarer sub-result of a loot pull, below
      trinkets. Still one result per pull. Arrives at very low durability.
      Repairs to a capped quality below crafted gear [PROPOSED number].
      Scales with Scavenging (find quality). Fallback: until a Workshop
      repair loop exists, rusted gear is salvage only and banks via the
      Recycler.
- **Foraging** lowers the empty-pull chance (Foraging only) and scales the
  number of fish per successful pull [PROPOSED: 1 at low Foraging, up to 3
  at high].
- Action time is one fixed data-table value, not rolled.
- A cell gives up to **N pulls per visit**, then rests for one game day.
- Yield rule: each caught fish converts directly to nutrition
  [PROPOSED: 1 per fish]. No daily consumption rate is needed.
- The Sunken Blade Easter egg is [PARKED] (see PARKED.md); not in v1 scope.
- No new skills. XP routes through Foraging / Scavenging via `emitAction`.

## Fishing numbers [PROPOSED — tune in playtesting]

| Lever | Value |
|---|---|
| Action time | 45 s game time, fixed (data table) |
| Fish per successful pull | 1 at low Foraging, up to 3 at high |
| Empty-pull chance | ~25% at low Foraging, falling as Foraging rises |
| Loot share of non-empty pulls | ~15% |
| Pulls per visit (N) | 3 |
| Cell rest after N pulls | One game day (primary balance lever) |

## Dependencies (read-only question for Code)

Code confirms whether nutrition→stamina and the comfort/trinket line exist.
If missing:

- fish map to an existing food item, or the nutrition effect is parked until
  Stamina ships;
- trinkets and rusted gear enter the haul and bank via the Recycler (this is
  the v1 path regardless, since Comfort is out of this slice).

This avoids adding:

- thirst ticks;
- dehydration;
- water-container micro-management;
- another death spiral

before we actually want those systems.

The POI proves the framework first.

---

# WATER RESOURCE DIRECTION

There were three broad models.

## Option B — Physical carried Water

Water occupies kg/container capacity.

Advantages:

- strongly integrates with Carrying and Load.

Disadvantages:

- requires containers;
- stacking rules;
- consumption;
- inventory UX;
- more complexity immediately.

## Option C — POI benefit only

Water is not stored yet.

Interacting grants a temporary benefit or recovery effect.

Advantages:

- smallest first implementation.

Disadvantages:

- less useful as infrastructure for future systems.

Option A (Abstract Water Reserve) is dropped [DECIDED]. Water's benefit is
fishing (see "Fish" above).

---

# WATER v1 — WHAT NOT TO ADD YET

Do not automatically introduce:

- thirst;
- dehydration;
- purification;
- contamination;
- disease;
- Afflictions;
- water containers;
- rain collection;
- farming;
- irrigation;
- cooking requirements;
- bath/hygiene mechanics;
- water-based Comfort bonuses.

Those can build on the framework later.

---

# FRAMEWORK ACCEPTANCE TARGETS

Before calling POI Framework v1 complete, verify at minimum:

1. Same seed gives the same water count and cells, including zero.
2. At least one tested seed produces no water.
2a. At least one tested seed produces more than one water cell.
2b. No seed produces more than 3 water cells.
3. Placement respects declared exclusions.
4. Existing stored POI never moves after save/reload.
5. Unknown POI does not appear on map.
6. Entering its cell discovers it.
7. Discovery persists after reload.
8. Discovered marker uses canonical POI state.
9. Revisiting produces no duplicate discovery event.
10. Water-specific action is available only while physically present.
11. Remote map selection cannot execute the action.
12. Offline arrival can discover the POI.
13. Offline discovery produces one canonical discovery event.
14. POI interaction state persists.
15. Voluntary withdrawal does not corrupt POI state.
16. Forced Retreat does not corrupt POI state.
17. Fort behavior remains unchanged.
18. Existing Survey Point behavior remains unchanged.
19. Live/chunked/offline placement/discovery behavior is deterministic.
20. Old saves gain missing POI state without unrelated mutation.
21. Existing test suites remain green.

---

# EXPLICITLY OUT OF THIS SLICE

- Church implementation;
- Comfort;
- Afflictions;
- thirst/dehydration;
- contaminated water;
- water purification;
- physical bottles/canteens;
- POI combat encounters;
- POI ownership;
- factions claiming POIs;
- automated POI schedules;
- Resource Priorities;
- Shop automation;
- multiple Water subtypes unless needed for placement testing;
- new Standing mechanics.