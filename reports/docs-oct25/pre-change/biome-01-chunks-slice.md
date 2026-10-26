**Slice:** BIOME-01 (proposed name) · **Saved:** Oct 25 from the Claude Docs draft (https://claude.ai/artifact/RVCmP28kFwPhFzU3pdEWqd) · **Status:** Ready for Step 0 only. Queued behind CLOCK-01 (NOT CLOSED). Not yet issued as CURRENT_BATCH.md. If this file and CURRENT_BATCH.md disagree, CURRENT_BATCH.md wins; stop and ask.

# Claude Code Instructions: Generative Biome Chunks (Zed Idler)

Status: \[PROPOSED\], from the Oct 25 brainstorm. All numbers are placeholders to be tuned in the simulation audit.

## Step 0: Read-only report (do this first, change nothing)

Report back on:

- How Traversal squares and cells are stored now (grid size, cell data, cleared-cell progress, noise per cell).
- Where zombie spawn and tier selection happen today.
- Whether there is any existing biome or lore-tag data (for example the loot schema's Lore\_Tag values).
- Which language and file layout this feature should go in, given the current stack.

Stop after the report and wait for approval.

## Goal

Build a chunk-based world generator. The Traversal grid is split into chunks. A world seed picks placeholder chunks and stitches them together. Every cell knows its biome. Hand-designed chunks will replace the placeholders later without any change to the generator.

## Biomes (from GDD v4.3)

1. Mountain Country: easiest, onboarding, low density.
2. Ruined Suburbia: moderate risk, structural hazards.
3. Metropolis City: combat-heavy, ambushes, toxic air.
4. The Debriefed Perimeter: endgame, radiation, corrosive storms.

Hazards gate the biomes, not level walls. Players can enter any biome at any time.

## Chunk data format

- Chunks are data files (JSON or the project's equivalent), one file per chunk, so they can be hand-edited later.
- Fields: chunk ID, biome, size (placeholder 8x8 cells), per-cell terrain or blocked flags, points of interest (campsite, structure, Fort, start), edge descriptors for each side, a difficulty band, and an isPlaceholder flag.
- A loader validates every chunk on load and fails loudly on bad data.

## Placeholder generation

- Write a generator script that produces a starter library: about 6 to 10 placeholder chunks per biome, with a varied POI count and layout.
- Generated chunks are saved as normal chunk files with isPlaceholder set to true.
- The script must be deterministic from its own seed, so the library can be rebuilt.

## World seed assembly rules

- One world seed per save produces the same map every time.
- The start chunk and the first Fort chunk are fixed, in Mountain Country, near the start.
- Difficulty rises with distance from the start. The Debriefed Perimeter sits on the outer edge.
- Neighbouring chunks must be compatible biomes, one step apart at most (Mountain next to Suburbia, never next to the Perimeter).
- Edge descriptors must line up between neighbouring chunks.
- Border cells between two biomes are flagged so they can blend both biomes' odds.

## Encounter hooks (wire in, keep tunable)

- Tiers F through S plus BOSS can appear in every biome. Each biome sets base tier weights. Easy biomes are mostly F and E, with S and BOSS rare. Hard biomes skew higher.
- Noise shifts weight up the tiers, and time on a cell adds a smaller nudge. The total boost is capped.
- At high noise, the main effect is more elites and extra traits, not guaranteed S-tier. S and BOSS stay rare even at max noise.
- Higher noise raises the chance of Uniques through a separate bonus roll.
- Variety guard: a tier that hasn't appeared for a while gains odds gradually, but only within the biome's normal range. It must never force S-tier or BOSS.
- Player tools to avoid high tiers: low noise and hiding lower the odds, and scouting (scaled by Discovery) reveals high-tier threats on or next to the cell so the player can redirect or retreat.
- Boss dungeons and final quests are out of scope for this slice.

## Biome hazards \[PROPOSED\]

These are draft ideas only. Add hazard data fields and hooks, but do not balance or build the full systems until they're approved. Each hazard has a gear or consumable counter, in line with the Hazard Counters pillar.

- Mountain Country, Cold Exposure: a mild stamina drain at night or when camping without a fire. Countered by warm clothing or a fire. Acts as the tutorial hazard.
- Ruined Suburbia, Collapse: unstable structures, so looting can injure the survivor or damage gear. Discovery or scouting shows which structures are safe.
- Metropolis City, Toxic Air: slow stress build-up and health drain in dense cells. A crafted mask in the Mask slot cancels it.
- The Debriefed Perimeter, Radiation and Corrosive Storms: radiation slowly builds up and lowers max health until treated. Storms wear down gear durability fast and push the survivor to take shelter.

## Biome loot bias \[PROPOSED\]

Riskier cells give better loot, so the extra danger of traversing them pays off. These are draft ideas only. Add the data fields and hooks, but do not tune the numbers until they're approved.

- Each cell gets a risk score built from zombie density, hazard strength and current noise.
- The risk score raises loot quality and the chance of rarer drops.
- Each biome keeps its own loot flavour. For example, Metropolis City leans towards electronics and industrial materials, and The Debriefed Perimeter leans towards rare materials.
- Map the existing lore tags in Loot\_Schema\_Revised, such as streets, scrapyard and military, onto the four biomes. Report the proposed mapping for approval before using it.
- Keep the risk-to-reward curve in one data table so it can be rebalanced without code changes.

## Fog of war \[PROPOSED\]

Squares the player can't see into are covered by dark clouds until they're scouted. These are draft ideas only. Add the data fields and hooks, but do not balance or build the full systems until they're approved, since how this fits with other systems is still open.

- Scouting works only before enemy activity happens, either on the adjacent square being scouted or on the square the player is on.
- A failed scout, meaning the player is discovered, makes encounters on the current square much harder for a short time.
- Scouting is a profession skill that levels with profession XP. Like Endurance, it gives three bonuses per level: a higher chance to lift fog, a looting bonus that raises the maximum loot quantity by a set amount per level (quantity only, not quality), and a lower chance of being discovered while scouting.
- A high Scouting level makes lifted fog stay lifted for good.
- A Pegasus vehicle (a winged horse) lifts fog for good on the squares it flies over along a circuit. It does not reveal threats.
- Scouting items such as binoculars, tactical visors and infrared visor sets reveal threats and improve scouting.
- Each square stores its fog state, whether that state is permanent, and an exposed timer for the harder encounters after a failed scout.

## Scout birds \[PROPOSED, PARKED\]

Captured birds can scout ahead for the player. This idea is parked: do not build it, and leave space in the scouting data so it can be added later. The conditions and risks for birds will be decided later.

- A pigeon can be captured and sent a few squares in a chosen direction while the player keeps travelling.
- A falcon can fly further than a pigeon.
- Birds can be lost, for example to flying zombies or bad weather, and the risk depends on the biome.

## Show biome on Traversal

Biome selection currently appears only under Routes. Update the Traversal screen so it also shows the biome of each square, using the per-cell biome lookup. In Step 0, report where Routes shows the biome and how Traversal draws its squares, then wait for approval before changing the UI.

Points of interest (for example the mall at C2 on seed 50876, which currently shows an orange highlight) should be marked with a small icon in the bottom-left or bottom-right corner of the square instead of a colour highlight. In Step 0, confirm what the orange highlight means today.

Each biome gets its own subtle tint on Traversal squares: Mountain Country, Ruined Suburbia, Metropolis City and The Debriefed Perimeter. Base the tints on the biome colours already used in Routes, adjusted to match the existing Traversal grid palette so the squares stay readable. Keep the tints in one data table so they're easy to change. In Step 0, report the current Routes biome colours and the Traversal grid palette, and propose the four tints for approval.

Rename the Afflictions panel on Traversal to "Buffs / Afflictions" with two tabs inside it, Buffs and Afflictions, that the player clicks between. In Step 0, report how the panel gets its data and where buffs are currently tracked.

Remove the Resources box from the bottom-left of Traversal and replace it with a Current Square panel showing the square's biome, any active hazard, the current noise level and time until it fades, and any scouted threats or points of interest.

Split the right-hand section of Traversal in half: keep Zone Details at half its current size, and add a Survivor Status panel in the other half showing health, stamina, stress, pack weight out of 40kg, Scouting level and progress to the next level, current vehicle with fuel and cargo space, food and water supply in days, equipped weapon and ammo, armour durability, and equipped scouting gear. Show only values that exist in the code today, and list any missing ones in the report.

Put Survivor Status on top and Zone Details on the bottom. When the player selects a new square, Zone Details should also pop out over the grid. The player can click and drag Zone Details to move it, so they can arrange the screen how they like. Its position is remembered across pop-ups and reloads, with a way to reset it to the default spot.

Remove the seed number from the top-right of the Traversal screen. The world seed and chunk assembly stay automatic and hidden from the player. Keep the seed in the save file and the debug map view only.

Bug: after travelling north, south, east or west, the hint "point at a zone for a quick tooltip, click or tap to confirm its details" is partly cut off the screen. Keep it fully visible at all screen sizes, including phones.

When the player selects a far-away square, plot the shortest possible path from the red "here" marker to it, shown with the yellow dashed squares. The path and reachable squares must account for movement modifiers such as the current vehicle, better walking boots and perks. Add a toggle in the right-hand panel so the player chooses between the shortest route (fewest squares) and the safest route (avoiding hazards and high-threat squares). In Step 0, report how the yellow dashed squares and movement range work today.

## Deliverables

- Chunk schema, loader and validator.
- Placeholder chunk generator and the generated starter library.
- World seed assembler that follows the rules above.
- Per-cell biome lookup used by spawn selection.
- A debug view or text dump of a generated map, coloured or lettered by biome.
- Tests: the same seed gives the same map, there are no illegal biome neighbours, the start and first Fort are always placed, and every cell has a biome.
- Update CODE\_STATE.md and the document index.
