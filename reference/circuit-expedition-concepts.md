# Circuit Expeditions — concepts and open questions

**Status:** Planning only. New behavior in this note is **[PROPOSED]**; unresolved choices are **[OPEN]**. This is not a build input, and it does not lock any rules, numbers, or implementation scope.
**Purpose:** collect the circuit, offline routine, and related world-building ideas in one place so they can be evaluated and decided later.
**Related current documents:** `route-01-route-builder-concept.md` (map circuits and transport); `biome-01-chunks-slice.md` (biomes, hazards, map information); `clock-01-slice.md` (the locked continuous game clock and offline credit); `routes-preparation-implementation.md` (implemented Solo route preparation and its open boundaries).

This note supplements those documents. It does not replace them, restate their locked decisions as new decisions, or authorize implementation.

## Design aim [PROPOSED]

Make a journey feel lively when watched and trustworthy when unattended. The player should set a readable circuit and a few priorities, see the survivor move through meaningful stops, then understand the major outcomes on return. A route should support a short, attentive visit and a longer absence without requiring a detailed calendar of every action.

The strongest unifying direction is **a map that remembers the survivor's journeys**. Familiar paths, recovered caches, repaired crossings, helped people, and changed local dangers can give future trips a distinct history. These are candidate directions, not approved features.

## Decisions [DECIDED Oct 25]

Sam, Oct 25 (voice session with the Creative Director); C10–C21 Sam, Oct 26. These rules are decided. Everything else in this note stays `[PROPOSED]` or `[OPEN]`, and the note is still not a build input; a Solo circuit slice will carry these into a batch.

| # | Rule | Why |
|---|---|---|
| C1 | **Duration display.** Circuit time shows in real time as the main figure, with the game-time equivalent in small text underneath | Players plan in their own time; the small figure ties the loop to the world calendar |
| C2 | **Repeat.** Circuits repeat by default | Idlers reward set-and-leave play |
| C3 | **One loop only.** A toggle to run a circuit once, unlocked in the Shop for in-game currency. The Shop currency is **RMAT**; price **10 Tier 2 RMAT** (Refined, `ZI.RMAT_TIERS` tier 2), starting value for the economy check to tune | Convenience, not relief from designed friction (lead brief 5.1), so modest; Tier 2 means the player has run a few circuits first |
| C4 | **Safe ending.** When a circuit must stop, the survivor finishes the loop and stops at the start cell. In an emergency (for example very low HP), they retreat straight home | Never strand the survivor mid-route |
| C5 | **First-version stop rules:** low HP, high stress, full pack. Weather and threat wait for BIOME-01 | The game already tracks these three; fewer rules are easier to read and test |
| C6 | **Night.** The survivor rests through the night by default. A free toggle keeps them travelling at night at higher risk | A hard "stop at nightfall" rule would end nearly every loop (one game day = 24 real minutes); the toggle trades speed for risk |
| C6a | **Night rest window:** 22:00–06:00 game time (8 game hours, about 8 real minutes), starting value | Matches Make camp's 06:00 wake |
| C6b | **Night travel risk:** travelling at night (toggle on) adds +25% encounters, starting value | Same size as the e-bike's quiet bonus (ROUTE-01 R3a, −25%), so the bike offsets it |
| C6c | **One night window game-wide:** night is 22:00–06:00 game time everywhere (header label, `ZI.TIME_STAT_MODS.night`, circuits). Dusk is 19:00–22:00 and 06:00–08:00 | One window everywhere; night ends at Make camp's 06:00 wake |
| C7 | **Rule conflicts.** HP first, then stress, then pack | A predictable safety order earns trust |
| C8 | **Return report** shows loops completed, stops visited, the rule that ended the run, and hauls to claim. **Order:** (1) headline: loops completed and the ending rule; (2) one line per stop: cell, kills, loot, repeat visits grouped; (3) notable events only: Downing, discovery, forced retreat; (4) haul total with Claim All | Only the outcomes that matter |
| C9 | **One repeat rule everywhere.** Once circuits take over Idle run, C2/C3 supersede the tutorial spec's "Auto-Repeat is a Shop unlock" (6.1). Until then, predefined Routes keep Auto-Repeat as a Shop unlock | One rule for near-identical features (rules §4.3); easier to teach |
| C10 | **Timers (Q2).** Movement and stop timers run on real time; the game clock only sets conditions. A stop crossing 22:00 follows C6 | Fits C1's real-time display; one clock for durations, the other for the world |
| C11 | **Quick circuit (Q3)** = 2–3 cells, about 5 real minutes per loop, at normal animation and simulation speed | Fits foot and bike range; no special speed keeps watched and offline results equal |
| C12 | **Long absence (Q5).** Beyond 24 real hours, settle 24 h and discard the rest; supplies drain only within it; the report says "progress capped at 24 hours" | Reuses FX2 and CLOCK-01 CL6 |
| C13 | **While away (Q6)** = settled on the next load with seeded rolls; no server in the first version | Same settle-on-read pattern as crafting and route runs |
| C14 | **Parity (Q7).** One shared step function (H1); the screen only animates results; a per-stop done flag prevents duplicate rewards and lets an interrupted circuit resume | Watched and offline must match; the recap must never reroll or pay twice |
| C15 | **Valid cells and stops (Q8).** Unlocked cells only; stops are scavenge and rest. A blocked stop is skipped and reported; a blocked way home means walking back the way they came | Small, testable first version; never stranded |
| C16 | **Fishing is not a circuit stop (Q8);** it is started in person | Keeps the POI framework rule (`poi-framework-v1-brief.md`: fishing must be started in person at the water cell) |
| C17 | **Missing information (Q9).** Treat unknown as dangerous, apply the standing policy, and skip a stop when in doubt | The safest default earns trust while unattended |
| C18 | **No pause (Q10).** Discovery prompts use their normal timer and policy default; while away, the policy decides at once. Forts are never rolled on circuits | Nothing waits on the player (rules §4.5). Narrows spec 2.5, which rolls later Forts only on Traversal squares while the player is present |
| C19 | **ETA (Q12)** = one real-time estimate per loop: travel + stops + 25% buffer for unfamiliar cells, with the line "estimate; encounters vary" | Honest about uncertainty without false precision |
| C20 | **Map while running (Q13):** route line, survivor marker, next stop, loop counter. Kills, loot and events wait for the return report | A calm map; matches C8 |
| C21 | **Supplies (Q14).** First version: foot and bike only, so nothing runs out mid-loop; food via Food-slot auto-eat; fuel, batteries and cargo wait for the vehicle slice | Keeps the first slice small. `[CODE]` auto-eat is not built yet; it comes from FOOD-01 (P6), so the circuit slice depends on FOOD-01 or ships without food use |

**Still `[OPEN]` under these rules:** nothing. Night rest window, night risk, report order (C6a, C6b, C8) and the C3 currency and price were decided Oct 25. The C6c code change goes in a small follow-up batch after CLOCK-01 closes.

**Conflict resolved by C6c `[DECIDED Oct 25]`:** the header screen (`screens-v2.jsx` lines 41–42) treated night as 21:00–05:00 (dusk 18:00–21:00 and 05:00–07:00), with `ZI.TIME_STAT_MODS.night` (stealth +10%, combat −10%) in that window. The code change goes in a small follow-up batch after CLOCK-01 closes `[DECIDED Oct 25]`; until then, the code still uses the old window.

## Clock and prototype context [CODE]

- The current rate is 1 game hour per real minute. A 24-real-minute interval advances one game day; a 24-real-hour absence advances 60 game days on the calendar.
- Offline systems currently receive at most 24 real hours of progress per absence, while the calendar advances through the full absence. Offline work is processed when the browser save is loaded; an always-running game server is not present in this prototype.
- Solo Routes already uses the survivor's skills, working gear, travel time, fighting and avoidance odds, and carrying capacity. Its predefined runs still resolve separately from Traversal cells; they are not map circuits.
- Existing Route preparation records explicitly leave map circuits, vehicle fuel, stamina, and food and water use outside that implemented slice.
- Predefined Routes are tagged by biome. Completed route nodes already accumulate visit counts and familiarity labels; the highest POI visit-count label is “Mastered” at 10 visits. Route outcomes award profession XP through the action XP system. The existing run record supports active/passive XP multipliers and a separate repeat flag.
- Existing route-node familiarity is attached to predefined route nodes, not a saved record of which Traversal cells a player has personally traveled as a custom circuit. Route completion currently awards no explicit Survival-attribute XP or separate route-mastery XP. Class data has `masteryLevel` thresholds, but the route resolver does not grant a distinct Mastery-XP track.

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

### 9. Route discovery and progression [PROPOSED]

- Selecting a biome would show the places and routes the player has found there. Cells, points of interest, or route entries not yet discovered could appear grayed out or otherwise concealed, while their surrounding area still gives a sense of what remains unknown.
- Creating a custom route would become available only after the player gains access to its biome. How access is earned and how that differs from discovering individual cells are not settled.
- As the player travels a custom route, record which Traversal cells it actually visits. Use those records to populate that biome's **Available Routes** list, so routes are grounded in explored territory and the player can tell where each path goes.
- A route could be launched as a single active run or set as an idle circuit that repeats. Route progress could grant three kinds of advancement: route or biome Mastery XP, relevant Profession XP, and relevant Survival-attribute XP.
- Keep the repeat model consistent with decided circuit direction C2/C3/C9. Clarify whether “active” means a watched run and “idle” means unattended repetition, or whether the distinction also controls one run versus many.
- Show newly recorded cells, route progress, and XP earned in the route summary. Which tracks receive XP, at what rates, and what route mastery unlocks remain open.

## Open questions [OPEN]

Questions 1–14 are answered (C1–C21, Oct 25–26). Questions 15–24 stay `[OPEN]` for later slices. The Routes-page questions 25–33 below are also `[OPEN]`.

### Clock, cadence, and server behavior

1. ~~What should a player see as a circuit's duration: real travel time, game time, or both?~~ **Answered by C1 `[DECIDED Oct 25]`.**
2. ~~Should movement and stop timers advance by real elapsed time while the game clock continues to advance at its existing rate? How should accelerated day and night affect those stops?~~ **Answered by C10 `[DECIDED Oct 26]`.**
3. ~~What does “quick circuit” mean in active play: a short route with a few stops, brisk map animation, rapid simulation resolution, or some combination?~~ **Answered by C11 `[DECIDED Oct 26]`.**
4. ~~Is a circuit a single trip, a repeat-until-stopped routine, or either? How does a repeat end safely?~~ **Answered by C2–C4 `[DECIDED Oct 25]`.**
5. ~~How should a long absence beyond the existing 24-real-hour progress window affect a saved circuit, supplies, and its visible history?~~ **Answered by C12 `[DECIDED Oct 26]`.**
6. ~~Which parts of the current design depend on an always-running server? Until server support exists, should “while away” mean settled deterministically when the browser save is next loaded?~~ **Answered by C13 `[DECIDED Oct 26]`.**
7. ~~How will watched and offline circuit simulation produce equivalent outcomes, avoid duplicate rewards, and resume after interruption?~~ **Answered by C14 `[DECIDED Oct 26]`.**

### Circuit rules, safety, and information

8. ~~Which route cells and stop types are valid in a first version, and how are unreachable or newly blocked stops handled?~~ **Answered by C15–C16 `[DECIDED Oct 26]`.**
9. ~~How many conditions can a player set, what is their priority when conditions conflict, and which policy defaults apply when information is missing?~~ **Answered by C5 and C7 (rule set and priority); missing-information defaults by C17 `[DECIDED Oct 26]`.**
10. ~~Can a route pause for a high-stakes discovery, and if so, what timer and default action prevent an unattended stall?~~ **Answered by C18 `[DECIDED Oct 26]`.**
11. ~~Which safety triggers are supported—health, stress, injury, pack capacity, supplies, nightfall, weather, or threat—and which should stay out initially?~~ **Answered by C5 and C6 (HP, stress, pack; night by rest default; weather and threat after BIOME-01) `[DECIDED Oct 25]`.**
12. ~~What does the ETA estimate, and how does it represent unfamiliar terrain, uncertain encounters, and route changes?~~ **Answered by C19 `[DECIDED Oct 26]`.**
13. ~~Which path details appear continuously on the map, and which belong only in the return report?~~ **Answered by C20 `[DECIDED Oct 26]`.**

### Economy, vehicles, and world progression

14. ~~Which supplies must a player pack, and can a vehicle's fuel, battery, or cargo run out partway through a circuit?~~ **Answered by C21 `[DECIDED Oct 26]`.**
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

### Route discovery and rewards

25. What exactly counts as biome **access** for enabling route creation: entering any cell, reaching a named point of interest, completing a discovery, or another milestone?
26. What is the player's discovery boundary? Should the biome show a grayed grid, grayed points of interest and routes, silhouettes, or only locations the player has some clue about?
27. Does a route become “available” automatically from cells the player traversed, or does the player still choose and save a path? Can a route include only visited cells, or may a known route include an unexplored leg?
28. What makes two recorded journeys the same route, and how should reversed paths, loops, overlapping routes, and changed or blocked cells appear in the list?
29. Does **Active run** mean playing/watching one dispatch while **Idle run** means unattended repetition, or does “single active run” specifically mean one loop? How should this relate to the decided default-repeat and one-loop option?
30. Which actions earn Profession XP on custom circuits, and how will those grants avoid double-counting combat, travel, and scavenging already represented by route outcomes?
31. What is route or biome **Mastery XP** tied to—repeated completed loops, new cells, discoveries, or safe successful returns—and what does mastery unlock?
32. Which Survival attributes should each route action develop, and how will that XP use the existing attribute progression rather than creating a conflicting second system?
33. What pacing or limits keep repeated idle loops from becoming an unintended XP farm while still rewarding a useful circuit?

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
