# Design handoff — Oct 27 (evening)

**Replaces:** the Oct 27 PM handoff, archived as `archive/design-handoff-oct27-pm.md` (morning one in `archive/design-handoff-oct27-am.md`).
**Active batch:** `CURRENT_BATCH.md` = **CLOCK-01** (NOT CLOSED). **PF15 is the next batch** `[DECIDED Oct 26, Sam, Addendum 10]`, ahead of CLOCK-01's remaining manual checks.
**Source:** Sam's answers in chat, Oct 27 14:02, applied by `reports/docs-oct27/apply_oct27_eve.py`. The Oct 27 morning (FISH-01) and PM (Addenda 10–11i) decisions stay in force; see the archived handoffs §1.

 force; see `archive/design-handoff-oct27-am.md` §1.

## 1. Decisions made

**Sam, Oct 27 evening:**
- **Cooking** is a new skill (17th), separate from Foraging. XP sources, cap and effects open.
- **Fish prep:** the no-knife loss shrinks as **Foraging** rises (FISH-01 FP3).
- **Plastics is the seventh base material.**
- **Smoker, cook basin, kettle pot** are steps of FOOD-02's station ladder, **unlocked in the Shop**; the Campfire stays free.
- **The Shop replaces the Market tab.**

**Sam, Oct 26 late evening (Addenda 10–11i, applied Oct 27 PM):**
- **PF15 first:** issue `pf15-save-continue-slice.md` as the next batch, ahead of CLOCK-01's manual checks.
- **Improvised base-tier hazard counters** for every hazard (improvised respirator; improvised radiation suit or medicine): from NPCs, POI and checkpoint loot, and the improvised crafting chain. Closes the BIOME-01 counter gap.
- **Debriefed Perimeter** hazard row decided (values proposed).
- **Concordance gear = improvised tier and durability;** its value is the disguise (supersedes Addendum 10's ladder reading).
- **Legs** paperdoll slot: Melee, Helmet, Mask, Body Armor, Gloves, Legs, Boots, Pack, Belt, Trinket, Food, Throw.
- **Disguise:** each Concordance piece lowers detection (respirator 25, chest 20, hood 15, legs 15, gloves 10, boots 10 — proposed); full set 5%; none = certain.
- **Discovered:** −50 standing (proposed), stripped of equipped faction pieces (the one exception to never-lost gear), thrown to an adjacent square that doesn't count against TRAV-02.
- **Disguise pieces** drop from survey teams (CI14; rates proposed); **chest piece and hazmat suit are separate** Body Armor items.
- **Inside undetected:** loot stores, steal research, listen in; each action re-rolls detection (proposed).
- **Prisoner quest** parked.

## 2. Files changed
This session: `wandering-tab-spec.md` (skills line, Cooking) · `parked/fish-01-fishing-concept.md` (FP3, Diplomat line, §8) · `parked/food-02-cooking-concept.md` (§2c, §2d) · `tutorial-first-session-spec.md` (Market row, 7.6) · `00-document-index.md` · this file · `reports/docs-oct27/` (`apply_oct27_eve.py`, `pre-change-eve/`, `DOCS_OCT27_EVE_REPORT.md`). PM files: see `archive/design-handoff-oct27-pm.md` §2.

## 3. Open questions
**Sam (from Addenda 10–11i):**
- **CI14 total:** the table was "values kept as set, 25% total"; the disguise pieces raise it to about 50%. Allow it, or scale the rates?
- **CI19 scope:** does "Concordance gear = improvised tier" cover the dart gun, field scanner and sample case (CI14 rarities up to Legendary), or only the wearable pieces?
- What sits above improvised gear (salvaged military, e.g. the NBC Gas Mask)? Legs pockets (cargo pants)? Disguise for other factions' forts? CI26 loot tables, research items and intel display.
- **Code (read-only, reuse first):** is the NBC Gas Mask the improvised base respirator or a higher rung? Note: GitHub branch `codex/faction-infiltration-20261026` already holds infiltration code written outside the batch process; reconcile it with CI19–CI26 before any batch.

**Carried from the Oct 27 morning handoff:**

**Sam (Oct 27 morning):**
- **Plastics:** where it drops and how common (proposed: between wood and metal).
- **Cooking skill:** XP sources, cap, what levels give.
- **Shop:** what happens to the Auction view and the "Marketplace Trade" schedule task; station order and prices (proposed Campfire → kettle pot → cook basin → camp stove → smoker → field kitchen; unlock in the Shop, then craft).
- **Components:** reuse plan read back to Sam Oct 27 PM (wire → `wiring`; wood frame and handle from `planks`; clasp, hook, reel, float new). Awaiting his confirmation. Where does the 17-component list live?
- **Diplomat:** level cap; does a trade give both Trading and Diplomat XP?
- **Fishing details:** net vs "one result per pull"; does rod fishing tick while away; quest step after the gift (which pond); crown stats and fight drop chance; timers and defaults on the maiden and siren dialogue boxes (rules §4.5).
- **Numbers:** rerun the fish sim at 0.1% per tick; djinn gate should count legendaries *caught*.

**Sam (11:30 list, not docs):** BAL-A is **implemented but NOT CLOSED**. Sam believes it is done (Oct 27); to write `BAL-A: CLOSED` he confirms: (1) TEST SAVE checks not yet run on Oct 26: Broken gear, injury timer, Solo-save T5, status icons; (2) the full 30-day H2 run (never completed; `reports/h2-full-2026-10-24/` holds only an empty log); (3) the scope note §4 review · review the team's new Wandering art in `assets/wandering-characters/` and `assets/wandering-backgrounds/` before building ANIM-01 · routes bug: the vehicle can't be selected (needs a repro at the desk).

**Carried from Oct 26:**
**Reminder:** until PF15 ships, press **Save** before closing.

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
Issue PF15 as `CURRENT_BATCH.md` (decided), then CLOCK-01's remaining checks, then a fresh test save for BAL-A closure. Sam settles the CI14 total and CI19 scope; the component reuse plan (Sam to confirm) is the last blocker on FISH-01's recipes.
