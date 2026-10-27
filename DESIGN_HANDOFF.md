# Design handoff — Oct 27 (PM)

**Replaces:** the Oct 27 morning handoff, archived as `archive/design-handoff-oct27-am.md`.
**Active batch:** `CURRENT_BATCH.md` = **CLOCK-01** (NOT CLOSED). **PF15 is the next batch** `[DECIDED Oct 26, Sam, Addendum 10]`, ahead of CLOCK-01's remaining manual checks.
**Source:** Google Docs "Zed Idler — Code Instructions Oct 26 — Addendum 10" and "Addendum 11, 11b–11i" (Sam, Oct 26 late evening, voice), applied Oct 27 by `reports/docs-oct27/apply_oct27_pm.py`. The Oct 27 morning decisions (FISH-01 and others) stay in force; see `archive/design-handoff-oct27-am.md` §1.

## 1. Decisions made (Sam, Oct 26 late evening)
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
`pf15-save-continue-slice.md` (status, §3) · `biome-01-chunks-slice.md` (counters, Perimeter row, gap resolved) · `concordance-introduction-concept.md` (CI14 rows and conflict notes, new §2b CI19–CI26, §3) · `wandering-tab-spec.md` (13.8 exception, 14.1 Legs, 14.2, 15.3, paperdoll line) · `trav-01-traversal-slice.md` (TRAV-02e) · new `parked/prisoner-quest-concept.md` · `parked/faction-quests-and-poi-density.md` (pointer) · `00-document-index.md` · this file · `reports/docs-oct27/` (`apply_oct27_pm.py`, `pre-change-pm/`, `DOCS_OCT27_PM_REPORT.md`).

## 3. Open questions
**Sam (from Addenda 10–11i):**
- **CI14 total:** the table was "values kept as set, 25% total"; the disguise pieces raise it to about 50%. Allow it, or scale the rates?
- **CI19 scope:** does "Concordance gear = improvised tier" cover the dart gun, field scanner and sample case (CI14 rarities up to Legendary), or only the wearable pieces?
- What sits above improvised gear (salvaged military, e.g. the NBC Gas Mask)? Legs pockets (cargo pants)? Disguise for other factions' forts? CI26 loot tables, research items and intel display.
- **Code (read-only, reuse first):** is the NBC Gas Mask the improvised base respirator or a higher rung? Note: GitHub branch `codex/faction-infiltration-20261026` already holds infiltration code written outside the batch process; reconcile it with CI19–CI26 before any batch.

**Carried from the Oct 27 morning handoff:**

**Sam (Oct 27 morning):**
- **Prep skill:** the spec has no Cooking skill. Use Foraging, or add Cooking?
- **Plastics:** seventh base material, or replace one of wood, metal, cloth, medical, electronics, fuel? Fishing gear recipes depend on it.
- **Components:** no 17-component list was found on E:. Reuse `wiring` for wire and `planks` for wood frame and handle? Where does the 17-component list live?
- **Stations vs ladder:** are the smoker, cook basin and kettle pot rungs of FOOD-02's Campfire → Camp stove → Field kitchen ladder, or separate stations?
- **Diplomat:** level cap; does a trade give both Trading and Diplomat XP?
- **Fishing details:** net vs "one result per pull"; does rod fishing tick while away; quest step after the gift (which pond); crown stats and fight drop chance; timers and defaults on the maiden and siren dialogue boxes (rules §4.5).
- **Numbers:** rerun the fish sim at 0.1% per tick; djinn gate should count legendaries *caught*.

**Sam (11:30 list, not docs):** BAL-A is **implemented but NOT CLOSED** (Oct 20 report: Sam's hands-on TEST SAVE check, the 30-day H2 run, scope note §4) · review the team's new Wandering art in `assets/wandering-characters/` and `assets/wandering-backgrounds/` before building ANIM-01 · routes bug: the vehicle can't be selected (needs a repro at the desk).

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
Issue PF15 as `CURRENT_BATCH.md` (decided), then CLOCK-01's remaining checks, then a fresh test save for BAL-A closure. Sam settles the CI14 total and CI19 scope; the prep-skill and plastics questions still block FISH-01's recipes.
