# Solo Survivor routes: brainstorm and file review

Recorded October 23, 2026 (America/Los_Angeles).

**Status:** captured design conversation and source review. New mechanics are concepts or proposals. This report does not authorize game implementation or replace the master specification.

## Current scope

- Use only the E drive. The main project is E:/Zed_Idler.
- The quarantine folder contains material excluded from uploading. Its contents were not used in this review.
- Solo Survivor only. Camp Leader remains a later option and is outside this design task.
- The user authorized saving the notes and structured parsing records. No game code, authoritative design specification, active batch, or save was changed by this review.

## Main finding

The circuit idea already exists in the project handoff: plan routes over the Traversal map, with reach determined by transport. The current browser implementation has separate predefined route-stop arrays and coordinate-based map cells. Its route-builder control is disabled. Our discussion develops the missing connection between these systems.

## Map from discussion to files

| Discussion topic | Established evidence | Proposed connection |
|---|---|---|
| Move the biome sidebar | Both HTML pages contain the Routes character panel, biome selector, run modes, cards, and launch behavior. The main page's Routes screen begins at line 1763. | Full territory selection belongs in Traversal; a compact Routes heading selector preserves region access; use the freed panel for travel preparation. This remains a recorded concept. |
| Build a foot or vehicle circuit | DESIGN_HANDOFF.md:57,64 records transport-dependent circuits. game/world.js owns map geography, roads, and location. screens-v3.jsx:987-988 shows the disabled route-builder control. game/routes.js:6 holds predefined routes. | A planned circuit should reference ordered map cells, deliberate stop actions, transport, and a return point. Define validity and reach before implementing. |
| Make route choice develop the character | game/stats.js:42-105 defines 16 professions and shared action XP. game/routes.js:262-283 already sends route completion and node events through it. | Use actual activities to train existing skills. Athletics fits walking; Mechanical fits repair; Scavenging fits looting. Endurance currently means surviving damage. Do not introduce Navigation as though it were an existing skill. |
| Make growth change what routes can accomplish | game/routes.js:207 estimates success from biome danger alone. Route familiarity is separate from map familiarity. | Define how real skills, supplies, transport, and place familiarity affect reach, safety, capacity, or efficiency; show those effects in preparation. |
| Give familiarity lasting value | game/routes.js:103-127 stores visits per route stop and reveals loot information. game/world.js:167-172 tracks explored/cleared ground. | Reconcile familiarity around real places and activities. Shortcuts, caches, cleared access, and reliable travel are proposals, not approved effects. |
| Nutrition, hydration, and craftable provisions | The Routes card uses fixed sample values at Zombie Idler v2.html:1775-1789. game/survival-data.js:8-24 has display modifier tables. game/items.js, game/crafting.js, and game/jobs.js provide inventory, recipes, and timed output. | Define a shared, saved Solo readiness model and useful supply items before making a hydration meter an ongoing requirement. Water sourcing and use remain open. |
| Active and Idle execution | game/routes.js:159-190 has timers/repeat settlement; its node resolver begins at line 224. The present risk estimate ignores run mode and real skills. | Define the few meaningful active decisions and unattended policy defaults, plus consistent rewards and costs. The UI's advertised lower risk and reduced XP need verification against the final rules. |
| Future Unity mapping | Unity has traversal context, inventory services, seeded food/water, and Eat/Drink commands. The inspected commands consume items but do not update hydration/nutrition state. | Keep browser and Unity integration facts distinct. Port an approved shared rules model later rather than assuming either copy has a complete survival loop. |

Both browser entry pages load the same game modules and screen files but retain duplicated inline Routes UI. A later Routes UI change must account for both the main page and TEST SAVE page.

## Existing rules the new concept must preserve

1. **Finite cell salvage.** The Traversal slice explicitly says looted cells do not regrow (reference/trav-01-traversal-slice.md:22). A repeat circuit may revisit places, but it cannot automatically refill emptied shelves. Repeatable activities need their own approved yield and cooldown rules.
2. **Activity XP limits.** Traversal Travel, Scout, and Hide have per-cell, per-real-day XP restrictions. Automation must not bypass them.
3. **Travel costs stamina.** The handoff and Traversal slice record this as a decided concept; numeric values remain proposed. Bicycle and electric-bicycle ranges and the generator/battery relationship are recorded existing decisions; clarify range accounting before using them.
4. **Water v1 currently means fishing.** The POI framework's Water interaction is fishing, started in person, with its timer able to finish offline. It deliberately defers thirst, purification, containers, and automated POI schedules. The user's realism/crafting direction is a potential expansion of this scope.
5. **Idle consistency.** Route execution, supply use, and progression need the shared online/offline rules and documented progress cap. Existing open clock decisions belong to their current slice.
6. **Sam locks mechanics.** Preserve CONCEPT, PROPOSED, OPEN, CODE, and DECIDED distinctions. Recording an idea does not turn it into a locked game rule.

The earlier suggestion to remove hydration is superseded as a recommendation by the user's interest in realism and craftable supplies. Whether a separate meter remains, and how it works, is still open.

## Documentation gap

The main handoff references dedicated route-builder, food, cooking, stockpile, and profession-XP briefs that were not found in the project inventory. In particular, reference/route-01-route-builder-concept.md is referenced by the Traversal slice but absent here. The relevant handoff entries remain usable evidence; the absent briefs were not reviewed.

Recover the originals or produce explicitly marked drafts from the existing handoff and this conversation. Do not silently present a reconstruction as an authoritative recovered document. The older Routes integration-hooks file under uploads is historical reference; parts of its reported implementation state are now obsolete.

## Recommended next design task

Draft the Solo route-builder concept around one end-to-end circuit: choose connected map cells, select transport, choose stop actions, preview readiness and purpose, execute under Active or Idle policies, return with a report, and decide whether repeating is valid.

The first progression question should be what a useful activity improves and how that improvement changes future travel. Define a survival/crafting expansion separately so the map connection does not depend on inventing a complete thirst simulation.

## Instructions for a later LLM dataframe compiler

- Read PARSING_RECORDS.json as a JSON array. Preserve one object per dataframe row.
- All columns are strings: id, topic, status, statement, why, evidence, proposed_target, open_question.
- Preserve status exactly. DECIDED rows cite explicit user constraints or existing documented decisions. CODE rows describe inspected source, not runtime test results. New mechanics remain CONCEPT or PROPOSED until Sam confirms them.
- Preserve OPEN records and unresolved fields. Do not fabricate recipes, formulas, costs, durations, thresholds, new skills, or implementation results.
- Exclude SUPERSEDED proposals from current requirements while retaining decision history.
- Keep current scope Solo-only. Preserve the later Camp Leader option without designing or implementing it.
- Treat proposed target paths as planning references, not instructions to edit files. Do not turn this compilation into a code implementation or replace CURRENT_BATCH.md.
- Verify source locations again before a future implementation; this review reflects the inspected files on the recording date.

## Session handoff

**Recorded direction:** map-based Solo circuits; territory selection in Traversal; Routes focused on travel preparation; progression through existing activities and skills; realism and craftable supplies under consideration.

**Files created:** this report and PARSING_RECORDS.json in this report folder only.

**Open questions:** circuit shape and return rules; transport range accounting; meaningful active choices; repeatable activities under finite salvage; familiarity effects; hydration scope and supply rules; recovery of the missing briefs.

**Next step:** develop the Solo route-builder concept with Sam, then lock its unresolved mechanics before drafting an implementation batch.
