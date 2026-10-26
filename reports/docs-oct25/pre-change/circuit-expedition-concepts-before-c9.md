# Circuit Expeditions — concepts and open questions

**Status:** Planning only. New behavior in this note is **[PROPOSED]**; unresolved choices are **[OPEN]**. This is not a build input, and it does not lock any rules, numbers, or implementation scope.
**Purpose:** collect the circuit, offline routine, and related world-building ideas in one place so they can be evaluated and decided later.
**Related current documents:** `route-01-route-builder-concept.md` (map circuits and transport); `biome-01-chunks-slice.md` (biomes, hazards, map information); `clock-01-slice.md` (the locked continuous game clock and offline credit); `routes-preparation-implementation.md` (implemented Solo route preparation and its open boundaries).

This note supplements those documents. It does not replace them, restate their locked decisions as new decisions, or authorize implementation.

## Design aim [PROPOSED]

Make a journey feel lively when watched and trustworthy when unattended. The player should set a readable circuit and a few priorities, see the survivor move through meaningful stops, then understand the major outcomes on return. A route should support a short, attentive visit and a longer absence without requiring a detailed calendar of every action.

The strongest unifying direction is **a map that remembers the survivor's journeys**. Familiar paths, recovered caches, repaired crossings, helped people, and changed local dangers can give future trips a distinct history. These are candidate directions, not approved features.

## Decisions [DECIDED Oct 25]

Sam, Oct 25 (voice session with the Creative Director). These eight rules are decided. Everything else in this note stays `[PROPOSED]` or `[OPEN]`, and the note is still not a build input; a Solo circuit slice will carry these into a batch.

| # | Rule | Why |
|---|---|---|
| C1 | **Duration display.** Circuit time shows in real time as the main figure, with the game-time equivalent in small text underneath | Players plan in their own time; the small figure ties the loop to the world calendar |
| C2 | **Repeat.** Circuits repeat by default | Idlers reward set-and-leave play |
| C3 | **One loop only.** A toggle to run a circuit once, unlocked in the Shop for in-game currency | Convenience, not relief from designed friction (lead brief 5.1) |
| C4 | **Safe ending.** When a circuit must stop, the survivor finishes the loop and stops at the start cell. In an emergency (for example very low HP), they retreat straight home | Never strand the survivor mid-route |
| C5 | **First-version stop rules:** low HP, high stress, full pack. Weather and threat wait for BIOME-01 | The game already tracks these three; fewer rules are easier to read and test |
| C6 | **Night.** The survivor rests through the night by default. A free toggle keeps them travelling at night at higher risk | A hard "stop at nightfall" rule would end nearly every loop (one game day = 24 real minutes); the toggle trades speed for risk |
| C7 | **Rule conflicts.** HP first, then stress, then pack | A predictable safety order earns trust |
| C8 | **Return report** shows loops completed, stops visited, the rule that ended the run, and hauls to claim | Only the outcomes that matter |

**Still `[OPEN]` under these rules:** the return report's detailed contents (stop display, haul list, log depth); night rest length and the night risk value; the "one loop only" price.

## Clock and prototype context [CODE]

- The current rate is 1 game hour per real minute. A 24-real-minute interval advances one game day; a 24-real-hour absence advances 60 game days on the calendar.
- Offline systems currently receive at most 24 real hours of progress per absence, while the calendar advances through the full absence. Offline work is processed when the browser save is loaded; an always-running game server is not present in this prototype.
- Solo Routes already uses the survivor's skills, working gear, travel time, fighting and avoidance odds, and carrying capacity. Its predefined runs still resolve separately from Traversal cells; they are not map circuits.
- Existing Route preparation records explicitly leave map circuits, vehicle fuel, stamina, and food and water use outside that implemented slice.

**Design implication:** do not write a circuit plan as 24 in-game hours or a sixty-day itinerary. Whether route legs should follow real elapsed time, game time, or a clearer split between those clocks remains **[OPEN]**. A candidate is to show travel time in real-world terms and use the game clock for world conditions; this needs evaluation against existing timers and simulation rules before adoption.

## Proposed concept areas [PROPOSED]

### 1. Map circuits and a living travel display

- Build a loop from Traversal cells, with a visible path, current position marker, next stop, and useful arrival estimate.
- Make the survivor's state legible: traveling between cells, wandering at a stop, resting or camping, and returning.
- Let transport affect range, pace, encounter exposure, carrying, or the trail shown on the map. Existing route concept values and vehicle rules remain subject to their own open questions.
- Show route familiarity, danger, hazards, and available points of interest using the information each design slice supports.

### 2. Routine and contingency rules

- Queue waypoints and a purpose at each stop, such as scout, wander for supplies, visit an outpost, or return.
- Let the player set a small number of readable conditions: return when carrying space is low; avoid or leave a dangerous cell; camp at night when the selected gear is insufficient; or use a friendly outpost when available.
- Give every unattended choice a visible policy default and safe way forward. No low-stakes event should leave the schedule waiting for a player who is offline.
- Preview likely duration, carried supplies, remaining capacity, travel mode, and known dangers. Estimates should communicate uncertainty instead of promising a precise yield.

### 3. Meaningful travel events

- Surface occasional, consequential events on the route: a blocked road, an abandoned vehicle, a distress signal, a horde, or an unexpected supply cache.
- Allow the player to choose standing policies for event resolution: assist, investigate, bypass, or divert where feasible.
- Report both the event and the policy that resolved it. Avoid frequent low-stakes prompts and avoid turning random events into gates on core progression.

### 4. Weather, hazards, and equipment

- Let biome or local conditions change travel, shelter, visibility, scouting, stress, injury exposure, or item and vehicle wear.
- Provide understandable counters through clothing, tools, shelter, supplies, or route choice.
- Keep this aligned with the proposed biome hazards and hazard counters in BIOME-01 rather than creating a second hazard framework.

### 5. Vehicles, cargo, and field logistics

- Consider fuel or battery use, condition, repair parts, road suitability, and vehicle-specific cargo room.
- Let the player set aside supplies for the return trip or prioritize what the survivor brings home.
- Explore physical caches for surplus cargo as a possible future option; define their recovery and protection before using them.
- Make transport a choice with benefits and costs. A longer, faster vehicle circuit should not simply dominate every foot route.

### 6. Factions, territory, and parallel work

- Consider automated trade between discovered locations, faction contracts, outpost rest, delivery stops, and transport or squad escorts.
- Consider local territory response to player activity and neglect, with readable changes and a dependable route back.
- Consider dispatching companions or assigning base work in parallel as a later expansion. Keep Solo Survivor support clear before adding simultaneous schedules.

### 7. Stockpile and scavenging automation

- Let players mark priorities for loot categories and choose what happens to eligible common materials on return.
- Protect quest, unique, and explicitly reserved items. Preview sorting rules and provide an understandable recovery path before destructive recycling is considered.
- Show how scavenging focus may influence the current loot formula and whether it trades off quantity, quality, time, or risk.

### 8. Human stories, morale, and lasting map change

- Consider recurring survivors, radio reports, and place-specific stories that remember whether the player helped, traded, or threatened someone.
- Consider comfort, morale, or trauma as a narrative expansion of the existing stress and comfort systems. It is not yet established that this requires another meter or automated refusal behavior.
- Consider persistent route improvements—shelters, caches, cleared crossings, working relays, or restored services—that make later journeys safer or different.
- Consider larger reclamation projects as a long-term goal, with costs, useful outputs, and clear limits on resource generation.

These eight areas are a catalog, not a commitment to build them together. Several may be better as separate future concepts.

## Open questions [OPEN]

### Clock, cadence, and server behavior

1. ~~What should a player see as a circuit's duration: real travel time, game time, or both?~~ **Answered by C1 `[DECIDED Oct 25]`.**
2. Should movement and stop timers advance by real elapsed time while the game clock continues to advance at its existing rate? How should accelerated day and night affect those stops?
3. What does “quick circuit” mean in active play: a short route with a few stops, brisk map animation, rapid simulation resolution, or some combination?
4. ~~Is a circuit a single trip, a repeat-until-stopped routine, or either? How does a repeat end safely?~~ **Answered by C2–C4 `[DECIDED Oct 25]`.**
5. How should a long absence beyond the existing 24-real-hour progress window affect a saved circuit, supplies, and its visible history?
6. Which parts of the current design depend on an always-running server? Until server support exists, should “while away” mean settled deterministically when the browser save is next loaded?
7. How will watched and offline circuit simulation produce equivalent outcomes, avoid duplicate rewards, and resume after interruption?

### Circuit rules, safety, and information

8. Which route cells and stop types are valid in a first version, and how are unreachable or newly blocked stops handled?
9. ~~How many conditions can a player set, what is their priority when conditions conflict, and which policy defaults apply when information is missing?~~ **Answered by C5 and C7 (rule set and priority); defaults beyond these stay [OPEN] `[DECIDED Oct 25]`.**
10. Can a route pause for a high-stakes discovery, and if so, what timer and default action prevent an unattended stall?
11. ~~Which safety triggers are supported—health, stress, injury, pack capacity, supplies, nightfall, weather, or threat—and which should stay out initially?~~ **Answered by C5 and C6 (HP, stress, pack; night by rest default; weather and threat after BIOME-01) `[DECIDED Oct 25]`.**
12. What does the ETA estimate, and how does it represent unfamiliar terrain, uncertain encounters, and route changes?
13. Which path details appear continuously on the map, and which belong only in the return report?

### Economy, vehicles, and world progression

14. Which supplies must a player pack, and can a vehicle's fuel, battery, or cargo run out partway through a circuit?
15. Can a survivor leave a physical cache? How safe is it, for how long, and what happens if a route becomes inaccessible?
16. Which materials, goods, or gear may be automatically recycled or stored? Which must always be protected, reserved, or confirmed?
17. Should scavenging focus change the loot result, the time spent searching, or the risk? How does it interact with the existing multi-factor loot calculation?
18. What does territory remember between trips, how quickly can it change, and can deterioration strand or unfairly punish a player?
19. Which faction actions and contracts fit the early game? Are any goals ever allowed to depend on randomized encounters?
20. When should companion dispatch, caravans, or Camp Leader systems enter the design, given the Solo-first working agreement?

### Story and scope

21. Should morale and trauma extend existing stress and comfort rules, or remain purely narrative until there is a clear need for a separate mechanic?
22. Which persistent changes make the map meaningfully different without turning every cell into a construction project?
23. What long-term project or destination gives repeated circuits a larger purpose?
24. Which of these concepts belong in ROUTE-01, BIOME-01, a new dedicated circuit slice, or later parked design?

## Design risks to watch

- The continuous calendar can outpace a real-time circuit dramatically. Do not require players to reason about sixty game days for one offline day.
- If the marker advances too slowly or the player must inspect frequent trivial events, circuits become chores instead of visible, satisfying journeys.
- Hidden automatic behavior erodes trust. Show the configured trigger, the reason a detour happened, and the result.
- Automatic sorting can destroy something the player wanted to keep. Use clear eligibility rules and protection for valuable or reserved items.
- Many simultaneous crews and reports can overwhelm a return. Start with one clear Solo itinerary and summarize only consequential milestones.
- Territory, weather, wear, and scarcity can punish players for being away. Consequences need counterplay, transparent forecasts, and a reliable way back into the loop.
- A deterministic offline replay must not let the visual recap reroll or award anything a second time.

## Suggested design sequence [PROPOSED]

1. Resolve the time model, repeat behavior, unattended defaults, and stop-condition priorities.
2. Audit how Traversal movement, the current Routes flow, offline settlement, and simulation parity can support a shared circuit. Record implementation facts separately from design decisions.
3. Draft a small Solo circuit slice with explicit decisions, open questions, visible acceptance checks, and exclusions. Keep weather, factions, morale, multiple squads, caches, and base construction out unless selected as the slice's core.
4. Only after the slice's open decisions are answered, prepare a build contract. Add one meaningful improvement at a time, then evaluate whether the route remains quick to understand and trustworthy while unattended.
