# Operations and Schedule redesign — proposal

**Status:** Proposal only. No implementation is authorized by this document.
**Scope:** Redesign the Schedule tab around camp and survivor operations, with distinct Camp Leader and Solo Survivor experiences and connections to Traversal, Routes, factions, and reputation.

## Design goal

Make Schedule useful for planning what needs doing and understanding what is happening around the survivor's base or forward operating base (FOB). The page should connect field activity to base upkeep while preserving the different rules and player roles in Camp Leader and Solo Survivor.

The existing Schedule page is a generic 24-hour task queue and is not the desired end state. Do not present Traversal actions, route runs, camp duties, and facility jobs as interchangeable queue items. Use the existing system that owns each activity, and show their relationship in the Schedule/Operations overview.

## Shared page frame

The page may use an **Operations** framing (tab name still open) with:

1. **Now and next:** current field activity, route/circuit status, camp work, and attention items.
2. **Plan:** mode-specific choices grounded in available game actions.
3. **Base schedule:** chores, upkeep, and resource cycles that the active mode can actually perform.

Show requirements and expected effects before confirming an action. Timeline ordering should only imply sequencing when the underlying system executes work in that order. On small screens, stack sections and keep the current status and main action visible first.

## Mode-specific designs

## Proposed activity catalog for the Operations page

The player should choose from named activities grouped by purpose, rather than an incomplete generic “Add Task” list. Each card should say who performs it, what it needs, whether it runs while the player is away, and what result to expect. Keep existing mechanics distinguishable from proposed new chores.

### Field operations — both modes, with mode-specific controls

- **Traversal:** travel, scout, loot, hide, or make camp at a selected cell through the existing map actions.
- **Wandering patrol:** deploy or manage the survivor's active patrol through the existing system.
- **Route run:** prepare and dispatch using the existing Routes flow; show active run and return status.
- **Pending route deployment:** proposed handoff from Routes to Schedule. After the player selects **Deploy**, Schedule shows a clearly marked, animated pending-operation indicator, a short countdown, and **Cancel**. The route starts only when the countdown completes; cancellation prevents launch. Countdown length and whether any confirmation is needed remain open.
- **Deploy preview:** before the pending countdown, keep the first view compact: estimated return time, loot capacity/free carrying room, and a plain-language risk summary. Put avoidance chance, fight win chance, and equipment noise under an expandable **Readiness details** area, labeled as estimates. Use ranges and uncertainty language for loot; do not promise a specific haul. Reuse the shared Routes preparation calculation, and offer a Stockpile/Gear & Loadout link when preparation blocks deployment.
- **Plan a circuit:** choose waypoints, stops, and return conditions as a proposed bridge between Traversal and Routes; do not imply new unattended actions until designed.
- **Listen to radio:** proposed scheduled monitoring for faction traffic, contact, rumors, or time-limited cache leads.
- **Send intel report:** player-chosen radio transmission of eligible POI and route discoveries; separate from listening.

### Base and return operations — mode-specific availability

- **Process salvage:** send recyclable returned items to the existing Recycler and hold exceptional items for review under standing rules.
- **Cook / prepare meals:** proposed scheduled activity using available food and required resources; the exact nutrition and fuel rules are open.
- **Weapon upkeep:** proposed durability maintenance for selected/equipped weapons; any separate combat-readiness effect is deferred.
- **Laundry:** proposed clothing care that reduces accumulated scent and associated stress; water, fuel, timing, and effects are open.
- **Treat injury / recover:** connect to existing Solo Survivor treatment and rest where applicable; Camp Leader can use its infirmary/facility and survivor-assignment rules.
- **Craft / repair gear:** link to existing crafting and repair queues where available.
- **Sort and preserve supplies:** proposed review of food, medical items, components, and other returned stock; preservation/spoilage mechanics are open.
- **Water collection / purification:** proposed routine tied to cooking and laundry needs; not assumed available until designed.
- **Base maintenance / vehicle service:** use existing facility, build, repair, and garage systems where supported.

### Camp Leader activity choices

Camp Leader presents activities as **assignments to camp survivors and facilities**, not as the player personally spending each block of time. Existing duty definitions include Guard / Watch, Workshop / Forge, Garage / Motor Pool, Infirmary / Clinic, Farm Plot / Garden, Scavenge Detail, Recon / Scout Post, and Trade / Radio Post. The redesigned page should show requirements and actual outputs for these duties.

Proposed additions for Camp Leader include cooking, weapon upkeep, laundry, radio watch, and routine return processing, staffed only when the relevant survivor/facility/resources are available. The schedule should identify conflicts and show which duties remain uncovered.

### Solo Survivor activity choices

Solo Survivor presents activities as **the lone survivor's own plan**, with no camp roster. Existing controls can link to Traversal, Wandering, Routes, personal crafting/repair, Recycler use, treatment, rest, and radio contact where available.

Proposed personal activities include listening to the radio, choosing when to send intel, cooking, weapon upkeep, laundry, supply sorting, and planning a circuit. The page should make clear when an activity uses the survivor's time or pauses another activity.

### Availability labels

Use a small status on each activity: **Available now**, **Needs facility**, **Needs supplies**, **Busy until…**, or **Design proposal**. Do not show a proposed activity as selectable gameplay until the mechanic exists.

### Camp Leader

Focus on the camp roster, assignments, facilities, and recurring base needs. Show who is assigned to each duty, what it produces or maintains, what facility/resources it requires, and whether it is active or blocked. Camp Leader can support duties performed by assigned survivors and base-level operations.

Candidate duties for design:

- **Cooking:** prepare food on a recurring schedule interval. Connect recipes and outputs to available food, nutrition, fuel, and other required resources.
- **Weapon upkeep:** clean/sharpen or otherwise maintain assigned weapons, restoring durability up to the item's maximum. Keep a separate combat-preparation effect out of the initial proposal; it may be designed later.
- **Laundry:** wash clothing on a chosen schedule. Explore its links to cleanliness, psychological stress, water, fuel, and other supplies.
- **Clothing scent/exposure:** dirty or sweat-soaked clothes may build a scent risk that makes the survivor easier for zombies to detect during Traversal or a circuit. Laundry would reduce that risk. This could interact with existing danger and zombie-tier systems and threaten an expedition, including through a higher-tier encounter. The player-facing cue, accumulation/decay, and counterplay are open; avoid an invisible, unavoidable run-ending surprise.
- **Radio watch/listening:** assign time or a survivor to monitor the radio for faction traffic, rumors, contact attempts, or rendezvous updates. The schedule could queue listening as an operation; it is distinct from the player choosing to transmit an intel report. Radio/facility, power, staffing, and time requirements are open.
- Other camp chores (cleaning, guarding, etc.) may be added after their effects and inputs are defined.

The player's stated priority order for the core routine is **cooking → weapon upkeep → laundry**. Stress is a wellbeing floor/constraint the routine should protect, not a fourth chore competing in the queue. Exact intervals, resource equations, and numerical effects remain open.

### Solo Survivor

Do not show a camp roster or imply that other survivors perform duties. Focus on the player's own activity and upkeep, with links to:

- Traversal status: current location and circuit/expedition status, discoveries, action limits, and return/settlement state where available.
- Routes: active run status, expected return, and route actions through the existing route flow.
- Personal upkeep and processing at the chosen base/FOB, once the relevant mechanics are defined (including cooking, weapon upkeep, laundry, and processing field food/resources).
- Clothing upkeep may also manage scent exposure before or during a circuit; any field countermeasures and their costs remain open.
- Radio listening as a scheduled personal activity when the Solo Survivor has access to a working radio; the player still chooses whether to transmit collected intel.
- Stress and psychological state, including the proposed low-stress progression below.

Schedule can summarize field results and offer shortcuts, but should not claim to automatically execute a Traversal action unless that behavior is separately designed and implemented.

## Proposed psychological state design

Stress remains the existing measure. The current high-stress **Broken** condition remains distinct; do not place it as the fourth step in the low-stress progression. Low-stress thresholds, durations, effects, and recovery rules are not yet specified.

Proposed low-stress tiers:

1. **Numb:** first sign of prolonged low stress. Recognize it with a small mood icon beside the stress meter; tap/hover text: “Nothing seems to lift your mood.”
2. **Disconnection:** stronger state after Numb persists. In Solo Survivor, it can change which additional, clearly labeled response is offered in Wandering encounters. Keep normal choices available where possible; do not silently remove player agency.
3. **Isolation:** shift from dialogue options toward faction trust. It may affect relevant trust-building actions such as trading, helping, and sharing information, rather than imposing a blanket reputation penalty.

These are proposed stages, not implemented mechanics. Exact triggers and effects require review of the existing stress, encounter, and faction systems. Camp Leader may need different psychological/social rules because it represents a camp roster; do not automatically reuse Solo Survivor effects there.

## Traversal, Routes, and field intelligence

Traversal discoveries should have a path into Routes and faction interactions. Candidate information includes POIs discovered while away from the base and routes opened or made available. The Schedule/Operations view may show the circuit's status and what was brought back or learned, then link to the relevant route or report action.

### Route-return processing [PROPOSED]

Use a middle-ground flow: routine returns follow player-defined standing instructions, while unusual or scarce finds are held for a player decision. This keeps ordinary idle progress moving without silently consuming or processing special items. The return review should show what came back, what standing rules handled, what is waiting, and what processing jobs were queued.

- Candidate routine destinations: food to cooking, recyclable salvage to the existing Recycler, and damaged equipment to weapon/gear upkeep.
- Camp Leader instructions can represent camp-wide rules carried out by available survivors/facilities.
- Solo Survivor instructions represent personal priorities and must respect that there is no camp roster.
- Define which items count as scarce/unusual and what happens if a needed facility, resource, operator, or capacity is unavailable.
- Reuse Routes settlement, the existing Recycler, and the existing job queue; do not create a parallel salvage-processing authority.

Radio information sharing is **player-chosen**, not automatic on discovery. A report may include POIs discovered and routes opened. The exact eligibility, recipients, requirements, and reputation calculation remain open. A safeguard against repeatedly claiming the same discovery is a design suggestion only and has not yet been decided.

Listening is a separate candidate scheduled operation: while monitoring a working radio, the player may receive faction traffic, rumors, contact attempts, or updates passed between factions. Some transmissions could reveal a **time-limited lead on a cache or supply opportunity involving human survivors**. The player can decide to act quickly, travel out, and try to reach or secure it before another group does. This supports proactive, offensive play and can offer valuable loot, while keeping the lead uncertain and the result earned through Traversal/Routes rather than granting loot from the schedule itself. Whether listening is continuous, time-blocked, staffed by a Camp Leader survivor, or consumes power remains open. Receiving a message should not automatically transmit the player's own discoveries.

## Human NPCs and faction contact

Human NPC logic is separate from zombie behavior. Factions may pass information to one another through the faction counter-wheel/network, but this is not the only contact channel: any faction may contact the player through a chance-based event, including radio contact.

Unknown human NPCs need not identify themselves or disclose their faction. Their cautious dialogue/behavior, subtle plot clues, rumors, and distinctive colored armbands can let the player recognize and gradually identify them. The armband is a visual clue, not necessarily an immediate faction label.

Radio contact can lead to an **optional rendezvous quest**: a faction tactical team proposes a meeting at a Traversal grid cell chosen by that faction from valid locations. The player chooses whether to pursue it. Faction **reputation plus temperament** should shape NPC behavior and how contact is made. A working interpretation to validate is: reputation reflects earned trust, while temperament shapes how directly or cautiously a faction approaches. The rendezvous is a planned meeting with the faction team at the specified grid cell.

Encounters with another faction may relay information about a rendezvous or other faction activity. This makes information propagation part of human NPC logic and gives the counter-wheel an in-world role. Exact propagation rules and whether information can change the rendezvous remain open.

## Open design questions

- Is the tab called Schedule or Operations?
- Should selecting Deploy always create a short pending state in Schedule, and how long should its cancel countdown last?
- Which preparation details belong in the compact Deploy preview, and which should be expandable?
- Which Camp Leader duties are in the first design slice, beyond cooking, weapon upkeep, and laundry?
- Is radio listening a time block, an assigned radio-watch duty, or both depending on mode? What facility, power, staffing, and chance rules apply?
- How precise and reliable are cache leads, how long do they remain actionable, which human groups may already be moving toward them, and what risks/rewards should the player face?
- Which route-return finds are routine versus scarce/unusual, and what standing processing rules can each mode set?
- What are the schedules, inputs, outputs, and equations for cooking and laundry? How do nutrition, water, fuel, clothing, and stress relate?
- How is weapon upkeep assigned to a person/item, and what durability restoration rate/cost is appropriate?
- What low-stress thresholds, durations, and recovery actions distinguish Numb, Disconnection, and Isolation?
- Which encounter response variants should Disconnection add, and which specific reputation actions should Isolation affect?
- How do faction temperament and reputation each alter contact, rendezvous offers, and information relays?
- How does clothing scent build and clear, how does it affect detection or threat tiers, and what warnings/counterplay keep route or circuit losses understandable?
- How are valid rendezvous cells selected, and what does the player learn if another faction passes along an update?
- Which discoveries are reportable by radio, to whom, and what reputation/route effects do reports have?
- How should each mode's page layout and instructions differ in detail?

## Explicit non-goals for this proposal

- No code or balance values are implemented here.
- No new unattended Traversal automation is assumed.
- No combat-preparation bonus is included in initial weapon upkeep; it is a possible later system.
- No fixed low-stress penalties, reputation formula, radio eligibility threshold, route unlock formula, or rendezvous timer is decided.
- Do not collapse Camp Leader and Solo Survivor into one shared assignment model.
