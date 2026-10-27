# Design handoff — Oct 27

**Replaces:** the Oct 26 late-evening handoff, archived as `archive/design-handoff-oct26-late.md`.
**Active batch:** `CURRENT_BATCH.md` = **CLOCK-01** (unchanged). **PF15 comes first** once Sam approves the fix direction.
**Source:** `reports/docs-oct27/ADDENDUM_OCT27.md` (Sam's Oct 27 morning voice session), applied Oct 27 by `apply_oct27.py`.

## 1. Decisions made (Sam, Oct 27)
- **FISH-01 fishing:** lives in Traversal (water square → **Fish**; "You are now fishing"; cancel any time); **tick-based** rolls replace the per-cell rest; water type sets the tiers; rod → net → traps (base roll / more per tick / keeps rolling after you leave).
- **Fish tiers:** more than four, topped by Legendary; Legendary **0.1% per roll** (starting value; supersedes 3%). Seven-tier list proposed.
- **Fish prep:** the player prepares fish; **descaling knife** is a pocket item that wears down; without it, less nutrition, the loss shrinking with cooking skill.
- **Gear:** + waders, tackle box, lures and bait, fisher's hat; every recipe mixes metal, wood and plastic; named sub-parts are their own components.
- **Sunken Blade:** 10 fishing spots → the Lady of the Lake (mistakes you for a squire) → gift five legendary fish → quest → pond scene with "leave it" (blade waits as a Traversal action). **Broken Crown** (Helmet) = unbroken blade at a quality tier; Discovery and loot-quality % clothing push toward Relic. Crown sources: Command check, fight, or a random lake POI.
- **Naga Sirens:** Black Haven's hidden information network (round-robin background events); Black Haven water quests; Diplomat check by standing and level; pass = trade + hint, fail = fishing spoiled for a while.
- **Diplomat XP:** trading, negotiating, talking past NPCs; successes only.
- **FOOD-02:** smoker, cook basin, kettle pot (art, clickable) `[CONCEPT]`; wood more abundant than metal; **plastics proposed**.
- **ANIM-01:** retro pixel main character; loot pickup animation, bending at the waist `[CONCEPT]`.

## 2. Files changed
New `reference/parked/fish-01-fishing-concept.md` · `poi-framework-v1-brief.md` ("Fish", numbers table) · `food-01-nutrition-slice.md` (legendary chance) · `parked/djinn-fishing-concept.md` §5 · `parked/food-02-cooking-concept.md` §2d · `wandering-tab-spec.md` (Diplomat XP) · `playtest-findings-oct15.md` (ANIM-01) · `PARKED.md` (Sunken Blade row) · `00-document-index.md` · this file · `reports/docs-oct27/` (addendum, script, pre-change copies, report).

## 3. Open questions
**Sam (from today):**
- **Prep skill:** the spec has no Cooking skill. Use Foraging, or add Cooking?
- **Plastics:** seventh base material, or replace one of wood, metal, cloth, medical, electronics, fuel? Fishing gear recipes depend on it.
- **Components:** no 17-component list was found on E:. Reuse `wiring` for wire and `planks` for wood frame and handle? Where does the 17-component list live?
- **Stations vs ladder:** are the smoker, cook basin and kettle pot rungs of FOOD-02's Campfire → Camp stove → Field kitchen ladder, or separate stations?
- **Diplomat:** level cap; does a trade give both Trading and Diplomat XP?
- **Fishing details:** net vs "one result per pull"; does rod fishing tick while away; quest step after the gift (which pond); crown stats and fight drop chance; timers and defaults on the maiden and siren dialogue boxes (rules §4.5).
- **Numbers:** rerun the fish sim at 0.1% per tick; djinn gate should count legendaries *caught*.

**Sam (11:30 list, not docs):** BAL-A is **implemented but NOT CLOSED** (Oct 20 report: Sam's hands-on TEST SAVE check, the 30-day H2 run, scope note §4) · review the team's new Wandering art in `assets/wandering-characters/` and `assets/wandering-backgrounds/` before building ANIM-01 · routes bug: the vehicle can't be selected (needs a repro at the desk).

**Carried from Oct 26:**
**Sam (urgent):**
- **PF15 vs CLOCK-01 order:** ship PF15 first (recommended), or close CLOCK-01's manual checks first. Until PF15 ships, press **Save** before closing.
- **Hazard counters:** the city and Perimeter counters only drop from Concordance fights. Add basic counters for everyone (the existing NBC Gas Mask; a basic suit or anti-radiation medicine)?
- **Debriefed Perimeter:** confirm the hazard row (radiation, corrosive storms, hazmat suit, Crystallized RMAT); recorded as proposed.

**Sam (other):**
- BAL-A closure: Broken gear, injury timer and the Solo-save T5 check, on a fresh test save after PF15; the 30-day H2 run; BAL-A scope note §4.
- Codex unlocks from Wandering need the B6 batch (`codexFromWandering = true`); the smoke-test "fail" was expected.
- Meals-target mechanics (after the round 8 rerun); then resize the food containers.
- NB1 nutrition bar mock-up; CI14 item stats and weights; Concordance CI4 modifiers and scene text.
- Circuit questions 15–24; C21 depends on FOOD-01 auto-eat; fish rarity split.
- Tier-band batch: Sam's data to parse, then the slice's open decisions.
- STOCK-01 tab set: proposed Recycler · Storage · Food vs the built Recycler · Storage · Gear & Loadout.
- Route noise vs PF13 noise 0–4 (reuse one scale).
- Carried: TRAV-01a 7-step smoke test; FOOD-02 C1–C6; djinn P10–P16 and curse values; RMAT as main currency beyond the Shop (Shop currency decided RMAT, Oct 25); ROUTE-01 transport sourcing; Rig pocket ratio (proposed 0.5).

**Code:** CLOCK-01 step 1 (rescaled durations); FOOD-01 O6 facts; STATS-01 save key and UI reference size; BALANCE-03 round 8 rerun; Stockpile one-second polling (mobile).

**Code (read-only first):** PF15 fingerprint test and fix proposal · W-3 (salvage weights and callers, rarity tiers incl. "relic", walk/jog/run constants) · FOOD-01 O6 with ST3 · round 8 rerun (90 s base, three-meals target) · ANIM-01 current-sway report · whether the test save should have a Jester starter weapon.

## 4. Next step
Sam answers the prep-skill and plastics questions; they unblock FISH-01's recipes. Batch order is unchanged: PF15 first (once approved), then CLOCK-01's remaining checks, then a fresh test save for BAL-A closure.
