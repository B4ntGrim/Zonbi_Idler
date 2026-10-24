# Design handoff — Oct 21

## Oct 22 — Workflow change (Sam)

**Decision:** `[DECIDED Oct 22]` Claude Design is retired. Sam decides and locks every design rule. The Creative Director (Claude in Desktop chat) brainstorms with Sam and writes decisions, slices and batch contracts as instructions; it does not edit files. Claude Code applies those instructions to the files, implements batches and reports back. `E:\Zed_Idler` stays the master copy of every document. Code's step and completion reports now go in `reports/<batch-id>/`.
- `[CONCEPT Oct 22]` PF13: Traversal actions need zombie pushback driven by Codex traits; sequence: tier band → TRAV-01b + pushback → balance audit.

**Files changed (documents only; no game code, tests or save keys):**
- `CREATIVE_DIRECTION_RULES.md` — new; replaces `CLAUDE_DESIGN_RULES.md` with the new roles.
- `CLAUDE_DESIGN_RULES.md` — now a one-line pointer to the new file.
- `archive/claude-design-rules-retired-oct22.md` — copy of the retired rules.
- `handoff/README.md` (new), `handoff/from-design/README.md`, `handoff/to-design/README.md` — retirement note at the top.
- `reference/00-document-index.md` — TRAV-01 rows, archive and report rows, rules pointer, Oct 21 and Oct 22 log entries.
- `DESIGN_HANDOFF.md` — this section.
- `reports/docs-oct22/` — pre-change copies and Code's report.

**Open items:**
- Sam's TRAV-01a smoke test.
- BAL-A is still NOT CLOSED: TEST SAVE check, the full 30-day H2 matrix, and review of scope note §4.
- `CLAUDE_CODE_RULES.md` was not found under `E:\Zed_Idler`, so its Claude Design references are not yet updated (Task 3). Sam to say where it lives.

---

## 1. Decisions made
- `[DECIDED Oct 20]` Sort drop-down removed; drag-to-reorder, saved order, Reset order, backup arrows (Profession XP).
- `[DECIDED Oct 21]` Touch, mouse and controller reorder rules, with starting values 5 px, 0.25 s, light vibration.
- `[DECIDED Oct 21]` Starting order = the spec's skill order.
- `[DECIDED Oct 20–21]` Fonts Caladea and Carlito; type scale 28 / 20 / 20 / 16.
- `[CONCEPT Oct 21]` Wandering is an activity that trains Combat, First Aid, Scavenging, Stealth, Athletics; the other 11 skills come from activities still to build.
- `[CONCEPT Oct 21]` Diplomat XP from faction help, none when robbed. Endurance = defense, XP from damage taken on a rising curve.
- `[CONCEPT Oct 21]` Food first; auto-eat tied to HP recovery; food recipes in Crafting; foraging tied to Traversal; eat-while-walking and auto-forage as RMAT shop unlocks; recycling into the shop; ammo and medicine tied to crafting; RMAT as main currency (not yet locked).
- `[CODE]` per Sam: combat has no damage types yet.
- `[DECIDED Oct 21]` FOOD-01 O1: out-of-combat regen replaces the heal after a kill (supersedes the Oct 17 and Oct 18 kill-heal directions).
- `[DECIDED Oct 21]` FOOD-01 O2: a full heal costs 5% of the Nutrition meter.
- `[DECIDED Oct 21]` FOOD-01 O5: fish nutrition common 10, uncommon 15; legendary 25–30 under test (recommended fixed 30).
- `[DECIDED Oct 21]` Djinn fishing secret, directions D1–D4: gated by legendary catches, Foraging improves odds, sealed bottle when rolled offline, the player chooses one of wish / trade / quest. Parked.
- `[DECIDED Oct 21]` Djinn D8–D9: one wish with three item choices ("I can grant you a wish… Choose one from the following"); one item for gear, a full stack for food and ammo. Free-text prompt removed (D5–D7 superseded).
- `[DECIDED Oct 21]` Djinn D10–D11: choices come from discovered items plus a Discovery-gated chance for a new item, never story or quest items; the djinn never trades.
- `[DECIDED Oct 21]` Djinn D12–D14: the advanced choice carries a curse (Hunted + Hollow), shown as an affliction with its own symbol, acting as a "difficulty +X%" layer (harder encounters that force retreats sooner, lower scouting discovery). Simulated Oct 21 (`curse_sim.py`); not locked.
- `[CONCEPT Oct 21]` Danger as a visible metric.
- `[DECIDED Oct 21]` Curse: no −25% Endurance XP offset (removed). Instead an unlisted "Endured" reward of about one day's Endurance XP (about 3,600) when the curse runs its full course; lifting it early forfeits the reward.
- `[DECIDED Oct 21]` Curse scouting guards (rules): 80% floor, fading 20 / 10 / 5, story/quest/Fort exempt; numbers are starting values. Tested at 30 / 50 / 70% base chance (`scout_sim.py`); Code's real base chance replaces the test values.
- `[DECIDED Oct 21]` FOOD-01 O4: base rest uses camp food, not the survivor's meter.
- `[DECIDED Oct 21]` FOOD-01 O9: camp food = food in the base stash, shown in Stockpile; 1 ration per 8 h of rest (starting value); an empty stash slows rest but never stops it.
- `[DECIDED Oct 21]` FOOD-01 O7: caught fish go into the Food slot as items. O8: legendary fish fixed 30 nutrition (rarity 80 / 17 / 3 still proposed).
- `[CONCEPT Oct 21]` Stockpile as the home of everything at base: Recycler, Storage, Food (maybe Items), with one page listing weapons, armor, gear, items and food alongside loadout and carrying pockets. Proposed as its own UI slice, STOCK-01.
- `[DECIDED Oct 21]` FOOD-01 O10: fish beyond one stack go to a free pocket, otherwise the haul, then the stash when banked.
- `[DECIDED Oct 21]` STOCK-01: each category row has buttons to equip an item or move it into pockets.
- `[CONCEPT Oct 21]` Cooking in the Stockpile Food tab: an optional cooking-pot mini-game that speeds cooking, and automatic "Cook greatest to least". Parked as FOOD-02.
- `[DECIDED Oct 21]` FOOD-02: pot is a bonus; idle cook-and-walk-away by item, food group or known specialty dish; specialty recipes unlocked through Traversal quests, factions and other sources; cooking runs while away. Specialty stack test: stress relief, not nutrition, breaks balance; daily cap of 5 food stress relief `[DECIDED Oct 21]`, audited: all 16 test combinations stay in band.
- `[DECIDED Oct 21]` A cooking station at base cooks (in parallel and while away). `[CONCEPT Oct 21]` It ties into the tutorial and can be improved through a shop unlock.
- `[DECIDED Oct 21]` No shared stress-relief budget: food, comfort items, camp rest and the Church each keep their own limit and strength; the player chooses the combination. A stacking audit tests each alone and all together once they have numbers.
- `[DECIDED Oct 21]` Legendary Lunch Pail: a found item that raises the daily food stress cap by 3 (5 → 8); Trinket slot; found, never bought; only one counts.
- `[CONCEPT Oct 21]` PF4: making camp should speed up checkpoint rest (logged in playtest findings with a proposal).
- Traversal playtest (Sam, Oct 21) logged as PF5–PF10.
- `[DECIDED Oct 21]` TRAV-01: 5–10 scout charges a day (start 5, test 10); Hide reveals lurking zombies (count, kinds, Codex pointer); clock shows Year and Day only (Days 1–364, Day 365 starts a new year); afflictions show on Traversal; the Camp Leader section (survivors list, Scavenge, Contracts, Training, Patrol, Raid) is removed in Solo; familiarity makes cells safer and richer; **looted cells do not regrow** (corrected Oct 21).
- `[DECIDED Oct 21]` ROUTE-01: bike 3 cells, electric bike 5 cells (quicker, quieter, faster). `[DECIDED Oct 21]` electric bike runs on a battery item, recharged by a generator that burns fuel.
- `[DECIDED Oct 21]` Game clock: 1 game hour = 1 real minute (24-minute days); crafting, the Jester's stay and other game-time durations keep their real length.
- `[DECIDED Oct 21]` The curse lasts 3 real days and scout charges refill once per real day, both at local midnight.
- `[DECIDED Oct 21]` TRAV-01 P1–P7 accepted; PF4 accepted (camp rest at the Cot rate, costs camp food, injury still needs its cure).
- `[DECIDED Oct 21]` Zone details panel approved: select-not-hover on every platform, bottom sheet on phones, Route mode toggle. TRAV-01 design complete; split into batches TRAV-01a (honest buttons), TRAV-01b (familiarity and camp) and CLOCK-01 (slower clock).
- `[DECIDED Oct 21]` TRAV-01a revised after step 1: separate Traversal scout pool; Hide shows only what Wandering uses; XP limits per real day for Scout, Hide and Travel; injury "play time left"; Solo reloads open on Traversal; Dispatch, Assigned and Expected yield removed in Solo; Make camp no longer a free unlimited full heal; Deploy disabled with its reason.
- `[DECIDED Oct 21]` **TRAV-01a LOCKED and issued to Code** (`handoff/from-design/export-oct21-trav01a/`).
- `[CONCEPT Oct 21]` ROUTE-01: build a circuit route over the Traversal map with a yellow lens; length by transport (foot 2, bike 3 or 5, vehicle many); vehicles scout, loot and find water across many cells.
- `[CONCEPT Oct 21]` Offsetting modifiers for weapons and gear (to add to `weapons-development-directive.md` before weapons Phase 2).

## 2. Files changed
- New: `reference/stats-01-profession-xp-slice.md`
- New: `reference/food-01-nutrition-slice.md` (includes draft `CURRENT_BATCH.md`)
- New: `reference/food-01-sim-oct21.md`, `food_sim.py`
- Updated Oct 21: `food-01-nutrition-slice.md` (O1, O2, O5 locked; O7, O8 added), `food-01-sim-oct21.md` (§7 fish test), new `fish_sim.py`.
- Updated Oct 21 (propagation): `poi-framework-v1-brief.md` (fish values, yield rule); `balance-03-screening-oct17.md` and `balance-03-round2-oct17.md` (kill-heal marked superseded).
- New, parked: `reference/parked/djinn-fishing-concept.md`.
- New: `reference/stock-01-stockpile-concept.md`; `reference/parked/food-02-cooking-concept.md`; PF4–PF10 added to `playtest-findings-oct15.md`; new `trav-01-traversal-slice.md` and `route-01-route-builder-concept.md`.
- Updated Oct 21: `food-01-nutrition-slice.md` (O10 locked; O4, O7, O8, O9 locked; O10 added; Stockpile direction; camp-food checks 10–12), `poi-framework-v1-brief.md` (fish storage and legendary value; djinn parked pointer).
- New: `scout_sim.py`; djinn file updated with scouting guards and results.
- New: `reference/balance-03-round8-regen-oct21.md`, `balance_regen_sim.py`, `curse_rerun.py`; FOOD-01 O3 updated with the pacing pre-screen.
- To do when FOOD-01 closes: `wandering-tab-spec.md` §13.4, §13.8, §14.1; `00-document-index.md` (add the djinn parked row).

## 3. Open questions
- **Sam:** FOOD-01 O3 (pacing), fish rarity 80 / 17 / 3; STOCK-01 tabs (Recycler / Storage / Food proposed); FOOD-02 C1–C6, station ladder, shop unlocks and tutorial step (§2c), the "3 tiers of resting" meaning, stacking-audit target; TRAV-01 P1–P7 (Hide marks Codex entries sighted; clock year length; rescale rule); ROUTE-01 how transport is obtained and what charges the e-bike; djinn open items (once per save or repeatable, P10–P16; whether djinn items can be traded or sold; lock curse values (Hunted ×1.25, Hollow ×1.5, 3 days), cure; round 8 R1, R3–R5 (90 s pacing, Hunted strength, food target 10 rations a day)); lock RMAT as main currency; Traversal dead buttons, zone details, scrap, fuel, medicine merge.
- **Code:** BALANCE-03 round 8 rerun in the H2 harness (plan in round 8 §6); FOOD-01 O6 (nutrition or stamina today, ration effect, field recovery rate, every path that heals after a kill); STATS-01 save key and UI reference size.

**Carried from the Oct 20 handoff (Code's E1):** **BAL-A is NOT CLOSED.** It needs Sam's TEST SAVE check, the full 30-day H2 matrix, and Sam's review of the BAL-A report's scope note §4 (decided rules still in no batch, including the square-difficulty tier band). Also open from Oct 19: rule 5 scope for policy events; whether field time or Downings per km governs; repair cost vs durability; parking automatic repair; Broken penalty strength; Codex Option B.

**Carried, unchanged:** every open item in the Oct 16 handoff (H2, AMMO-12, PF3/FX6, LR-a and the rest), now archived as `archive/design-handoff-oct16.md`. Later BALANCE-03 and retreat/Broken work (Oct 17–20) is in its own records.

## 4. Next step
TRAV-01a step 1 is done and stopped on S1–S7 (`handoff/to-design/TRAV-01a_STEP1_REPORT.md`). Sam accepted S1–S7 and the additions (T14–T17); the revised batch is in the export folder; Code starts step 2. In parallel, FOOD-01 waits on Code's round 8 rerun and O6 facts.

## Oct 22 addition: Rig pockets
- **[DECIDED Oct 22]** The Rig gives pockets only while a vest (Body Armor slot) is worn. The vest decides how many.
- **[PROPOSED Oct 22]** The vest keeps its own pockets. The Rig adds half of the vest's pockets, rounded down (tactical vest 7 → +3, cargo jacket 4 → +2, padded jacket 2 → +1, heavy plate 0 → +0). Store the ratio as a data-table value (`rig_pocket_ratio = 0.5`).
- *Why:* in the code today the Rig gives no pockets (reports/oct22-readonly/READONLY_REPORT.md §1). Tying it to the vest keeps Body Armor as the main carrying choice, so the Rig adds to the vest rather than replacing it.

## Oct 22 addition: TRAV-01a audit decisions (reports/trav-01a/DESIGN_AUDIT_OCT22.md)
- **D1 [DECIDED Oct 22]** The CLOCK-01 slice comes before the simulation audit. Game-time costs (Hide 1 game hour, Make camp 24 game hours) mean little at 6 real seconds per game hour.
- **D2 Travel stamina [DECIDED Oct 22 concept; numbers PROPOSED]** The Solo survivor gets a stamina pool (none exists in code; it can serve Routes later). Starting values, as data-table values:
  - `stamina_max` 100, plus 1 per Athletics level
  - `travel_stamina_cost` 5 per cell, diagonals included
  - `stamina_regen_per_real_hour` 10; Make camp refills it fully
  - *Why:* about 60 cells a day at most against a 256-cell grid, so daily XP farming is impossible while normal play never runs out. Make camp gains a real use.
- **D3 Drifts [CONCEPT Oct 22, Sam's idea; working name]** A drift is a group of one zombie type that enters from a grid edge and walks one row or column (north, south, east or west) to the far side.
  - Scout reveals drifts in the scouted cell's row and column (type and direction). The knowledge lasts until the drift leaves.
  - Scout grants XP only when it reveals a new drift. The 5-a-day pool stays as a safety cap.
  - Touchpoints `[PROPOSED]`: a drift raises danger in the cells it crosses; Hide lets it pass; a noise 3+ cell (PF13) can pull it off course.
  - *Why:* reward information, not clicks. Fixes "Scout is a 5-a-day XP button" (D3 in the audit).
  - **Depends on:** the tier-band batch (cells own their zombies) and CLOCK-01.
- **D4–D6 [DECIDED Oct 22]** Accepted as they are: device-date scout refills (revisit at mobile prep); phone layout gets its own UI batch; Fort entry through the zone panel (one extra click).
- **Still owed:** Sam's 7-step TEST SAVE smoke test for TRAV-01a.
