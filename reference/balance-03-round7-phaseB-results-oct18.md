# BALANCE-03 — Round 7 Phase B results (B0, B0-skipper, B1) and inventory policy proposal (Oct 18)

**Status:** simulation and proposal only. No production code, UI or real save changed. Policy items below stay `[PROPOSED]` until the conflicts in §4 are settled.

## 1. Decisions recorded (Sam, Oct 18) `[DECIDED Oct 18]`
- **Ordinary Medkits use normal pocket space.** The pocket-free allowance for one Medkit is withdrawn.
- **The quest Med Kit (Fort-bound) is pocket-free; its weight counts.** Quest protections and the Fort hand-in stay. This supersedes "the quest kit occupies a pouch pocket" and matches the existing story-item rule and JD1a stash placement.
- **The chest pouch gives 2 pockets.** The early craftable pouch stays a separate proposal (1 pocket proposed); no inference between them.
- **Quest-reward capacity policy:** Sam's text recorded as `[PROPOSED]` (§3).

## 2. Phase B results
**Test record:**
- **Build:** production after BEST1; harness unchanged.
- **Runs:** matched seeds 101–505 × 7 days, ethical, returns every 8 h. All 40 runs OK; 0 Breakings.

**Rules in both sets** (test values where not decided):
- square-difficulty tiers with warned threats;
- near-death 1 / 1 / 3;
- full-Downing top-up 5 (Forced Retreat only);
- Option C 40/30 + rule 5;
- **no free charges**;
- **Medkit recipe** (4 Cloth + 2 Medical, 30 game min);
- **all Medkits use pockets**.

**Activity model** (disclosed assumptions):
1. **Bootstrap:** the player loots each new square the survivor reaches, once, using the existing Traversal loot distribution. That is 3 squares a day at the harness pace.
2. **Crafting:** the craft queue makes every Medkit the materials allow. Crafting time is recorded at 3 real s per Medkit (about 4.5 s a day), but not simulated as a pause, because it is under 0.01% of the day.
3. **Loading:** finished Medkits go into free pockets at each return, under normal pocket and weight checks. Travelling back to the home square to load is **not** simulated (§4, C9).
4. **Loot-failure HP damage** is counted but not applied.

**Starts:**
- **Tutorial participants (B starts):** the scripted intro (Downed at exactly 1 HP, no heal or revive, Jester trade, camp, relocation, then the meeting **immediately** with the chosen weapon; no stress from the intro).
- **Skipper (start A):** no Jester rewards, 0 pockets.

| Per day | B0 participants | B0 skipper | B1 participants (+EN3 ×2) | B1 skipper |
|---|---|---|---|---|
| **Recurring full Downings** | 3.3 ±0.5 | 4.0 ±0.7 | **2.4 ±0.4** | 3.3 ±0.5 |
| Intro Downing (once, separate) | 1 (all runs; meeting "met") | — | 1 | — |
| Rescues (Medkit saved a Downing) | 0.6 | 0 | 0.6 | 0 |
| **Field time** | 0.8% | 0.6% | 2.1% | 1.4% |
| Distance | 0.87 km | 0.53 km | 4.17 km | 2.56 km |
| Encounters | 48 | 29 | 33 | 23 |
| Rest h (stress-only / HP) | 23.8 (20.9 / 2.9) | 23.9 (21.3 / 2.5) | 23.5 (21.0 / 2.5) | 23.7 (21.3 / 2.4) |
| Squares looted / Cloth / Medical gained | 3 / 6.5 / 6.0 | 3 / 7.0 / 6.5 | 3 / 6.3 / 6.0 | 3 / 7.0 / 6.5 |
| **Medkits crafted** | 1.51 | 1.57 | 1.51 | 1.57 |
| Medkits loaded into pockets (whole run) | 10.1 | **0** (no pockets) | 10.2 | **0** |
| Loading refused, no free pocket (whole run) | 1.9 | 18.8 | 2.0 | 18.8 |
| Medkits left in the stash at day 7 | 0.5 | 11.0 | 0.4 | 11.0 |
| Charges used (threshold / rescue) | 2.9 (2.1 / 0.6) | 0 | 2.9 (2.2 / 0.6) | 0 |
| Wasted charges (fumbles) | 0.2 | 0 | 0.1 | 0 |
| Downings per km / per 100 encounters | 3.9 / 7.0 | 7.6 / 13.6 | **0.6** / 7.2 | 1.3 / 14.1 |

**Stress per day (participants B0 / B1):**
- near-death 28.0 / 21.9;
- walking 1.3 / 2.7;
- failed ventures 1.2 / 6.5;
- the Bedroll removes 19.8 / 19.6.

**Findings:**
1. **Supply:** about 1.5 Medkits a day from the bootstrap, cloth-limited and variable (Cloth 6.5 ±1.5 a day). This depends on reaching new squares; once-per-square loot is not sustainable.
2. **Medkits help but don't change the shape.** Participants have 3.3 recurring Downings with 0.6 rescues a day (Phase A A0: 3.7). Field time stays about 1%, because stress still gates rest (21 h stress-only).
3. **Encounter spacing (B1) is again the most useful lever:** 2.4 Downings a day (inside the accepted 1–2 range plus some) and 6.7× fewer Downings per km. Field time is still about 2%.
4. **Skippers craft Medkits they can't carry.** 11 Medkits sit in the stash by day 7; their Downings are higher (4.0 / 3.3). This is the pocket gap, not the recipe.
5. **The intro sequence works in the model:** one scripted Downing per participant run, the meeting completes immediately, rewards are delivered, and no intro stress is added.

## 3. Inventory policy (proposed)
| Item | Pockets | Weight | Protections |
|---|---|---|---|
| Ordinary Medkit | 1 (normal pocket rules) `[DECIDED]` | Counts | None special |
| Fort-bound (quest) Med Kit | **0** `[DECIDED]` | Counts `[DECIDED]` | No healing, drop, sale or loss; Fort hand-in `[DECIDED]` |
| Chest pouch (the Jester's) | Gives **2** `[DECIDED]` | — | — |
| Early craftable pouch | Gives 1 | 0.5 kg | `[PROPOSED]` (separate) |

**Quest-reward capacity policy `[PROPOSED]`** (Sam's text, applied with the shared inventory rules):
- Every quest reward is checked individually: does it use a pocket, its pocket size, its weight, and any restrictions.
- Pocket-free quest items skip only the pocket check.
- Looting and crafting keep their existing checks.
- No separate capacity system.

**One handling rule when a quest reward can't be placed `[PROPOSED]` ("place, else stash, else hold"):**
1. **Place:** equip into an empty slot (settled B3: never replace); or carry if a pocket is free and weight stays within the hard limit (125%).
2. **Else stash:** if the item may be stashed (existing B3 fallback; the stash has no capacity limit in code), it goes to the stash and is marked delivered.
3. **Else hold:** an item that can be neither carried nor stashed is **held as "awaiting pickup"** in the giver's reward record. It is not granted and not discarded.
   - Delivery retries automatically at every inventory change and every return.
   - The quest log says what blocks it ("too heavy: drop 2 kg").
   - Quest steps that need the item wait for it.
- **Order:** the pouch first, so its pockets count for the rest; then the remaining rewards in the settled order.
- **Granted means placed:** a reward is marked granted only once placed (the existing per-reward intent record, `Jester._placeOnce`).

## 4. Small unresolved conflicts
| # | Conflict | Proposed resolution |
|---|---|---|
| C7 | **Pocket-free quest items and weight.** The code already counts a story item's weight on the survivor *wherever it is stored* (`carryTotals` adds stash story items). So the stash can't relieve a quest item's weight; if it pushes the load over the hard limit, step 3 (hold) is the only rule that doesn't exceed capacity | Hold it at the giver until the load allows. In the intro this can't happen in practice: the trade empties the haul and carried items first, and the rewards total about 6 kg against 20 kg capacity |
| C8 | **Code bypasses capacity today.** `Jester._place` adds carried rewards without a pocket or weight check, and delivers the jacket before the pouch | Adopt the rule above in the slice; until then, flagged only |
| C9 | **Loading Medkits needs the home square.** Pocket changes are allowed only at base or camp (`atBaseOrCamp`, the home square). With auto-travel to chosen squares, crafted Medkits reach pockets only after a trip home | Decide whether the Jester camp counts as "camp" for loading, or whether the auto-activity includes a return trip |
| C10 | **Name:** "chest pouch" vs the code item "Handmade Pouch" (Pack slot) | Confirm they are the same item |
| C11 | **Skippers still can't carry any Medkit** now the pocket-free allowance is gone | The proposed craftable pouch (1 pocket) is the only path; it needs recipe approval |

## 5. Next simulations, once decided
1. Skipper + craftable pouch.
2. Auto-travel to chosen squares, including the return trip to load (C9).
3. The idle-source stage.

The B-pol policy check remains available for the B1 setup.
