**Status:** [PARKED] until the Water POI fishing loop ships (POI Framework v1) and FOOD-01 closes.

# FISH-01 — Fishing activity, fish preparation and the Lady of the Lake (concept)

**Date:** Oct 27 (Sam, morning voice session). Instruction source: `reports/docs-oct27/ADDENDUM_OCT27.md`.
**Related:** `poi-framework-v1-brief.md` ("Fish"), `food-01-nutrition-slice.md` (fish values), `parked/food-02-cooking-concept.md` (stations, §2d), `parked/djinn-fishing-concept.md` (legendary-fish gate), `PARKED.md` (Sunken Blade row), `parked/headshots-concept.md` (Godly Strike, gauntlets), Google Drive "Excalibur Easter Egg" (Water Amendments 1–2, Oct 8).

## 1. Fishing activity `[DECIDED Oct 27]`

| # | Rule | Why |
|---|---|---|
| FA1 | Fishing lives in **Traversal**: travel to a water square; its actions menu offers **Fish**. No standing policy | Reuses the Traversal map and menu; no new tab to learn |
| FA2 | The screen says **"You are now fishing"**; the player can cancel at any time | Clear state, no lock-in |
| FA3 | **Tick-based:** a clock ticks at a set frequency; each tick is a fresh roll against the fish tiers. Supersedes "N pulls per visit, then the cell rests one game day" (POI brief) | Simple to read and tune: one number (tick length) sets the pace |
| FA4 | The square's **water type** decides which tiers can be caught | Gives exploring for water a reason |
| FA5 | Gear upgrade path **rod → net → traps**. Rod = base roll; net = more catches per tick; traps keep rolling after the player leaves | Each upgrade changes *how* you fish, not only a bigger number; traps serve the idle side |

`[PROPOSED]` Tick length: the POI brief's 45 s game-time action time becomes the tick (data table).

## 2. Fish tiers

| # | Rule | Tag |
|---|---|---|
| FT1 | More than four tiers, topped by **Legendary** | `[DECIDED Oct 27]` |
| FT2 | Legendary chance **0.1% per roll** (1 in 1,000). At about one roll a minute: one per ~17 h of fishing; five in ~85 h | `[DECIDED Oct 27, starting value]` — supersedes FOOD-01's 3% `[PROPOSED]` |
| FT3 | Tier list: Junk (materials, not food) · Common · Uncommon · Rare (rivers) · Prized (lakes) · Mutated (risky to eat, may drop RMAT) · Legendary | `[PROPOSED]` |
| FT4 | Nutrition values kept from FOOD-01: Common 10, Uncommon 15, Legendary 30 (fixed) | `[DECIDED Oct 21]` |

## 3. Fish preparation `[DECIDED Oct 27]`

| # | Rule | Why |
|---|---|---|
| FP1 | The player **prepares** caught fish; it is not auto-processed | A hands-on step that gives the knife and cooking a job |
| FP2 | **Descaling knife:** pocket item (not the Melee slot); full-nutrition and bulk preparation | It is a tool, not a weapon; costs a pocket like scout and med kits |
| FP3 | Without the knife, fish gives **less nutrition**; the loss **shrinks as cooking skill rises**; the knife is always best | Skill partly makes up for missing gear without making the knife pointless |
| FP4 | The knife **wears down with use** (stress speeds wear, existing rule) | Ties into durability and stress |

`[PROPOSED]` Fish guts become bait.

## 4. Fishing gear `[DECIDED Oct 27]`

| Item | Slot / type | Role | Materials (approved mix) |
|---|---|---|---|
| Rod | tool | Base roll | Wood; metal hook; plastic reel |
| Net | tool | More catches per tick | Plastic; wood frame |
| Traps | placed | Keep rolling after the player leaves | Wood; metal wire; plastic float |
| Descaling knife | pocket | Full nutrition, bulk prep | Metal; wood handle |
| Waders | boots | Deeper water, better tiers | Plastic; metal clasps |
| Tackle box | pocket | Holds bait and lures; improves the rod | Plastic; metal latch |
| Lures and bait | consumable | Better odds; rare bait from sirens | Metal and plastic (lures) |
| Fisher's hat | head | Comfort: lowers stress; small loot-quality bonus | Wood fibre or straw; plastic brim |

- **G2:** every recipe uses some combination of metal, wood and plastic.
- **G3:** named sub-parts are their own craftable **components** (raw → component → finished), e.g. metal clasps and waders are two items.
- `[PROPOSED]` New components: metal clasp, metal hook, plastic reel, wire, plastic float, wood frame, wood handle.
- **Reuse check (Oct 27, `[CODE]`):** no 17-component list exists on E: (not in `reference/` or `uploads/`). The code's component store uses `forged_iron`, `wiring` and `planks` (`game/camp.js`); `CRAFT_RECIPES` has Scrap Wire. Recommendation: wire → reuse `wiring`; wood frame and wood handle → made from `planks`; the rest are new. `[OPEN]` Sam confirms, and where the 17-component list lives.

## 5. The Sunken Blade and the Lady of the Lake `[DECIDED Oct 27]`

**Flow:** discover 10 fishing spots → the maiden appears at the tenth → gift her five legendary fish → she gives the Sunken Blade quest → pond scene → draw the blade (or leave it).

| # | Rule |
|---|---|
| SB1 | The maiden's quest unlocks after **10 fishing spots** discovered. It spans several maps on purpose (0–3 water cells per map) |
| SB2 | She appears at the **tenth** spot discovered; that becomes her pond |
| SB3 | She mistakes the survivor for a young squire and asks them to seek the sword of the lake |
| SB4 | Gifting her **five legendary fish** starts the Sunken Blade quest. Supersedes "50 water visits or fishing attempts" (PARKED.md) and the earlier same-session "five legendaries caught" counter |
| SB5 | Scene: the light fades; the pond shows a rock with a sword in it; a description and a dialogue box at the bottom; the text suggests pulling the blade |
| SB6 | **"Leave it":** the blade waits at that same pond and appears as an option in that square's Traversal actions menu |
| SB7 | **Broken Crown** (Helmet slot): wearing it guarantees the blade comes out unbroken and shiny at a quality tier. Without it: the unique rusted claymore, restored before use (as before) |
| SB8 | With the crown, quality rolls from the weapon quality categories (Common, Uncommon, Rare, Unique, Relic). Max Discovery guarantees at least Rare; then Rare > Unique > Relic. Lower Discovery opens Common and Uncommon |
| SB9 | Other gear is optional (regular gear, not a set) and pushes the odds toward Relic through loot-quality bonuses |
| SB10 | **Loot quality %** has two stacking sources: the Discovery skill level, and clothing with its own loot-quality % stat. Clothing never raises Discovery past its max |
| SB11 | Broken Crown sources: pass the maiden's **Command** check; fail and fight her (winning does not guarantee the crown); or seek it at a random lake POI, which the sirens guard or hint at |

Kept from Oct 16: the Godly Strike passive and the gauntlets set bonus (`headshots-concept.md`).

*Why the gift replaces the counter:* one set of fish now drives the whole story (find, meet, gift, quest), so there is no double-counting question.

## 6. Naga Sirens and Black Haven `[DECIDED Oct 27]`

| # | Rule |
|---|---|
| NS1 | Other "ladies of the lake" are **Naga Sirens**, tied to the **Black Haven Collective**, which depends on them for information |
| NS2 | A hidden background script runs predetermined events between Black Haven and siren locations, **round-robin**. Faction and siren pawns each have their own system, joined by these events. Players never see the system, only its effects |
| NS3 | Black Haven gives water quests (e.g. find supplies around lakes); players fishing there can meet sirens |
| NS4 | Encounters depend on Black Haven standing; when the dialogue box appears while fishing, a **Diplomat** check by level |
| NS5 | Pass: a trade (information or rare bait for part of the catch) plus a hint about the Lady. Fail: they spoil the fishing for a while and disappear |
| NS6 | Sirens guard or hint at the random crown lake (SB11) |

Skill split: the maiden uses **Command** (you stand tall before a lady); sirens use **Diplomat** (you bargain).

## 7. Diplomat XP `[DECIDED Oct 27]`

Diplomat is already one of the 16 skills (spec, top). It gains XP from trading, negotiating and successfully talking past NPC encounters; **successes only**. Recorded in `wandering-tab-spec.md` under the skills line.

## 8. Open

- `[OPEN]` **Prep skill:** the spec has no Cooking skill. FP3 needs one: Foraging (fishing already trains it; the Excalibur doc scaled fish nutrition with Foraging) or a new Cooking skill.
- `[OPEN]` **Net vs one result per pull:** the POI brief says each pull gives exactly one result and Foraging scales fish per pull (1–3). How does the net's "more catches per tick" combine with that?
- `[OPEN]` **Offline:** the POI brief starts fishing in person and lets it finish offline. Does rod fishing keep ticking while away, or only traps (FA5)? Traps: 24 h cap, settle on read; robbed or broken (proposed earlier, not decided)?
- `[OPEN]` **FOOD-01 / djinn numbers:** the fish table (80 / 17 / 3) and the djinn gate estimate assumed 3% legendaries. Rerun `fish_sim.py` at 0.1% per tick with the new tiers.
- `[OPEN]` **Djinn gate:** recommended that it counts legendaries *caught*, so gifting five to the maiden never closes it.
- `[OPEN]` Quest step after the gift: is the blade at the maiden's pond, or another pond she names?
- `[OPEN]` Broken Crown stats and drop chance from the fight; Command check level; siren "spoil" duration; standing thresholds.
- `[OPEN]` **Prompt timers (rules §4.5):** maiden and siren dialogue boxes need a timer and a policy default unless Sam exempts them like the djinn scene (P3).
- `[OPEN]` **Quality names:** code has an "epic" tier and no "unique"/"relic" pair (W-3 check).
- `[OPEN]` **Plastic** is not a base material yet (FOOD-02 §2d); every gear recipe here depends on it.
- `[OPEN]` Diplomat level cap; whether a trade gives both Trading and Diplomat XP.

## 9. Watch for

- **Rare content must be reachable.** 0.1% with ten spots and five legendaries is a long road (several real days of fishing). Check it in the sim before locking.
- **Original names.** "Excalibur" and "Lady of the Lake" are shared folklore and fine as inspiration, but shipped names, text and art stay original (rules §4.7). The item stays "the Sunken Blade".
- **Hidden systems need visible effects.** If players never feel the Black Haven–siren network, it is cost without payoff; plan at least one event they notice.
