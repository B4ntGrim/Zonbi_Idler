# BALANCE-03 — Round 7 Phase B plan v2: carrying, activities, materials (Oct 18)

**Status:** proposal and simulation planning only. No production code, UI, real save or spec change. Unapproved values are marked `[PROPOSED]`.

## 1. Decisions recorded (Sam, Oct 18) `[DECIDED Oct 18]`
1. **Medkit recipe approved:** available from the start; 4 Cloth + 2 Medical; 30 game minutes; output 1 Medkit with 2 charges; First Aid formula; no free or regenerating charges.
2. **Carrying:**
   - one ordinary Medkit rides without a pocket (its weight counts); more Medkits use pockets;
   - an early craftable pouch gives exactly one extra pocket (recipe below);
   - the Fort-bound Med Kit occupies a pocket (this supersedes the pocket-free story-item rule for this item only) and keeps its other protections and the Fort hand-in;
   - the pouch comes first in the Jester delivery, with normal capacity checks.
3. **Player-directed activities:**
   - the player picks a square and the survivor walks there automatically;
   - a player-set crafting queue (with quantities) becomes the survivor's priority activity;
   - crafting and Wandering never run at the same time.
4. **Materials:** manual Traversal looting is the bootstrap and must lead to an idle source. Once-per-square loot is not called sustainable.
5. **Simulation:** explicit activity choices, real new squares, real materials and crafting time. Encounter spacing stays proposed; stress scaling, post-kill healing and regenerating charges are not adopted; about 1–2 recurring full Downings a day is acceptable for gentler policies.

## 2. Code check: the "guaranteed pocket"
**No guaranteed pocket exists today, in code or spec.**
- **Code:** `carryTotals` (`items.js:593`) starts at 0 pockets and adds only equipped carriers in the Pack, Belt and Body Armor slots (`CARRIER_SLOTS`).
- **Spec §14.1:** "Equipped gear grants pockets. Unequipped gear grants none." The carrier table (§14.2) has no base pocket.

So the earlier "a skipper has 0 pockets" finding is correct for the current build. **Conflict C1** asks how to treat this.

## 3. Proposed early pouch `[PROPOSED]`
| Field | Value | Why |
|---|---|---|
| Item | **Scrap Belt Pouch** (new item, Belt slot, 1 pocket, +0 kg, 0.5 kg) | Exactly one pocket. The Belt slot exists in code and is free for a tutorial survivor (the Jester's pouch takes the Pack slot) |
| Cost | **3 Cloth + 4 Metal** | Metal is the one material Wandering already yields idly (kill salvage recycles to Metal), so only 3 Cloth comes from looting |
| Time | **1 game hour** (6 real s) | Same reasoning as the Medkit: materials, not time, are the limit |
| Requirements | Default unlock; crafted at base; one at a time | Reachable by skippers and participants alike |

**Unequipping a pouch that holds the Fort-bound Med Kit `[PROPOSED]`:**
- **At base:** the change is allowed only if another equipped carrier has a free pocket. The kit moves there automatically. Otherwise the change is refused with a message naming the kit.
- **In the field:** the existing refusal rule (`_carrierChangeCheck`) applies.
- The kit is never deleted, dropped or left stranded.
- The stash is not an option while the kit is in a pocket (conflict C3).

## 4. Player-directed activities `[PROPOSED]`, reusing what exists
| Activity | Reuse | Rule |
|---|---|---|
| **Travel to a chosen square** | Traversal position (`zi_trav_pos`); Change Route's travel step (`changeRoute.moveStepSec: 30`) | The survivor walks one square per step with Wandering encounters on the way. Arrival makes it the current square. A player-chosen route costs no route-change stress (it is a plan, not a mid-run redirect) |
| **Crafting queue as priority** | The existing job queue (`enqueueJob`: quantities, craft slots, offline settle) | While queued crafts have materials, the survivor stays at base crafting; Wandering is paused and time is counted as crafting |
| **When the queue ends** | — | **Queue complete** → the survivor resumes the previous activity. **Materials run out** → the job waits, a one-line notice is logged, and the previous activity resumes. Nothing waits on the player |

**Rule change to an existing system:** today crafting is a base job that runs alongside Wandering (it doesn't need the survivor). The priority rule makes crafting cost the survivor's time. This is intended (Sam), and flagged because it changes current behaviour.

## 5. Proposed idle material source `[PROPOSED]`, for review
- **Mechanism:** reuse the existing **Scavenge Detail** schedule job (`camp.js`, no structure required, Scavenging XP today) as an activity that also yields **Cloth and Medical over time**.
- **Unlock threshold:** after the player has manually looted **5 Traversal squares** (the bootstrap teaches looting, then automates it).
- **Yield:** a starting value for review only: **Cloth 1 and Medical 0.5 per game hour** worked (about 6 game hours = 1 Medkit).
- **Activity:** it competes with Wandering and crafting for the survivor's time.
- **Not decided:** the values, and whether the Wandering survivor or a camp roster member works it (`[CODE]` schedule jobs assign roster survivors; needs a Code check).

## 6. Phase B simulations
**Runnable now with settled rules** (assumptions disclosed):

| Set | What it tests |
|---|---|
| **B0 bootstrap** | Tutorial participants: the intro sequence (Downed at 1 HP, Jester immediately, no stress, pouch first, normal capacity, Fort kit in a pocket). The player loots each new square reached (the existing harness reaches 3 a day). The craft queue makes Medkits as materials allow, counting crafting time as survivor time. One Medkit is pocket-free; the rest use free pockets |
| **B0 skipper** | Same with no Jester rewards: 0 pockets, so only the one pocket-free Medkit |
| **B1** | B0 + encounter spacing EN3 ×2 (proposed lever) |
| **B-pol** | Best of B0/B1 × immoral, criminal, heinous |

**Report per day:**
- field time, distance, new squares and squares looted;
- crafting time and its opportunity cost;
- Cloth and Medical gained;
- Medkits crafted, carried, used, wasted and left;
- rescues, recurring full Downings, and the intro Downing separately;
- Downings per km and per 100 encounters;
- stress by source.

**Needs decisions first:**

| Set | Waiting on |
|---|---|
| Skipper with the Scrap Belt Pouch | Pouch recipe approval (§3) |
| Auto-travel to chosen squares (other than the harness's one-square-per-return walk) | §4 travel rule (step time, encounters, stress) |
| B2 idle source | §5 mechanism, threshold, yield, who works it |

## 7. Unresolved conflicts
| # | Conflict | Needed |
|---|---|---|
| C1 | "Preserve the existing guaranteed pocket," but none exists (§2) | Either add one base pocket for every survivor (a new rule), or treat the pocket-free Medkit as the guarantee |
| C2 | "The Fort-bound Med Kit occupies **that pouch's** extra pocket": the Jester gives the Handmade Pouch (2 pockets), while the craftable pouch has 1 | Which pouch holds the kit? The Jester's pouch, or must the Handmade Pouch change to 1 pocket? |
| C3 | Settled JD1a B3 puts the Fort-bound kit **in the stash**, and the Fort checks the stash (`hasMedKit`, `takeMedKit`, `items.js:504/518`). A pocket rule moves it to carried | Confirm carried placement replaces B3. The Fort check must then also read carried. **Completed Fort saves and existing saves are left as they are** |
| C4 | Settled delivery order is jacket → pouch → weapon → carried → stash (`Jester.TABLE.equip`); carried rewards skip the pocket check (`_place`) | Pouch first + normal capacity changes both. Confirm |
| C5 | Crafting today runs alongside Wandering; the priority rule changes that (§4) | Confirm crafting pauses Wandering |
| C6 | At the current clock a Medkit takes 3 real seconds and the pouch 6, so crafting's opportunity cost is negligible | Accept, or set recipe times on another basis |

## 8. Documents to update once settled (not edited)
- **Spec:** §13.3 (charges), §14.1 / §14.3 (the story-item pocket exception for the Fort-bound kit, the pocket-free Medkit, pockets).
- **Tutorial spec:** §3.2 (starter kit at save creation, base charges).
- **Elder Jester concept:** U21 note ("daily base charges").
- **JD1a:** B3 (stash placement and order).
- **Item text:** `medkit` ("+60 HP over 8s").
