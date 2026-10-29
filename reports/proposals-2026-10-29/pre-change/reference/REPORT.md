# STAT-02 — Report and Design Handoff

**Date:** Oct 28, 2026
**Batch:** STAT-02 (Progression curve, stat picks and status states)
**Status:** Step 2 done (Oct 28). Sam answered H1–H5; STAT-02 is now wired into live play. See section 7.

---

## 1. What was done

| Item | Where | Status |
|---|---|---|
| Melvor-style XP curve (a ≈ 906.05, ratio 1.065, total ≈ 7,557,000) | `game/progression.js` | Done |
| Hourly XP budget, 60/25/15 source mix, per-event XP by phase | `game/progression.js` | Done (placeholder counts) |
| 10 core stats, integer ranks 0–24, diminishing returns k = 1.5 | `game/progression.js` | Done |
| Stat picks: even levels to 35, every level after, 9 checkpoints | `game/progression.js` | Done (see H3) |
| Offers: 3 distinct uncapped stats, soft pity (1 + 0.35 × misses) | `game/progression.js` | Done |
| Hidden display: card text ("Max HP 46 → 47"), numbers-only breakdown | `game/progression.js` | Done |
| Status tracks: Hunger, Rest, Wounds, Sickness, Morale | `game/progression.js` | Done (placeholder values) |
| Stacking: +15% per extra bad state, +15% per extra good state | `game/progression.js` | Done |
| Offline settle: self-care from supplies, never past the mild tier, away summary | `game/progression.js` | Done (placeholder rates) |
| Headless simulation | `game/progression.js` | Done |
| Acceptance tests (30 checks) | `tests/stat-02-progression.test.js` | 30 / 30 pass |
| Module loaded in both game pages | `Zombie Idler v2.html`, `… TEST SAVE.html` | Done |

Everything lives under one name, `ZI.PROG`. It is pure data and functions.

**Not touched:** the current character level, profession skills, nutrition, moodles, injuries, combat stats and every save key. Old saves load exactly as before.

**Not done yet (waits on handoffs):**
- Level-up offer screen
- XP sources feeding the new curve
- Status effects applied to combat
- Away-screen summary
- Saving ranks and status in the save file

## 2. Checks

- **New suite:** `node tools/run-tests.cjs tests/stat-02-progression.test.js`: 30 passed, 0 failed.
- **Full suite:** 35 suites, 803 passed, 2 failed. The 2 failures (`describeGearItem`, `itemStatLines` in `split-equivalence`) were already there. CODE_STATE lists them as coming from earlier `game/items.js` work. STAT-02 did not cause them.
- **Browser load:** `Zombie Idler v2.html` was loaded in headless Chromium. The title screen renders and `ZI.PROG` is present (level 100 = 7,556,999 XP, 91 picks). The old `ZI.getCharacterLevel` still works. There were no script errors; the only 404s were zombie PNGs that were not copied into the test.

## 3. Simulation results (4,000 runs per build)

| Build | Median Damage cap | Runs that never cap Damage | Any stat capped before L100 |
|---|---:|---:|---:|
| Damage-first | Level 90 (~160 active hours) | 11.5% | 84% |
| Balanced | No cap | — | 0% |
| Survival | No cap | — | 0% |

All targets are met: median about 90, no more than 12% never capping, and balanced and survival builds never capping. Full output: `simulation-output.txt`.

**Values at k = 1.5:**
- Max HP by rank: 0 → 40, 6 → 47, 12 → 53, 18 → 57.5, 24 → 60
- Damage by rank: 0 → 1.00×, 6 → 1.105×, 12 → 1.194×, 18 → 1.263×, 24 → 1.30×

---

## 4. Design Handoff — decisions Sam needs to make

### H1. The new XP curve versus existing saves
**What I found:** the game already has a character level (`ZI.getCharacterLevel`, `game/stats.js`). It uses the old curve 100L + 10L² and stores **total XP** in the save key `zi_character_xp`. Today that XP comes only from Wandering scores.

**The problem:** if the game simply switches curves, every existing save changes level.

| Old level | Same XP on the new curve |
|---:|---:|
| 5 | 2 |
| 10 | 7 |
| 20 | 22 |
| 35 | 43 |
| 50 | 58 |

Early players would drop levels, and later players would jump up.

**Options:**
- **A (recommended):** keep each player's current level and set their XP to the start of that level on the new curve. Nobody gains or loses a level.
- **B:** keep total XP and let the level recalculate.

**Also needed:** which actions give regular, elite and objective XP. Today only the Wandering score feeds character XP.

### H2. Status tracks overlap with systems that already exist
**What I found:** the game already has:
- `ZI.NUTRITION`: 7 tiers from Starving to Peak Fueled. FOOD-01 builds on it, and the top bar is waiting for `ZI.getNutrition()`.
- `ZI.MOODLES`: Hungry (5 levels), Thirsty, Tired, Sick, Injured, Stressed and more.
- `ZI.INFECTION` and `ZI.FATIGUE_MODEL`.
- Timed injuries (`zi_injury_v2`, `game/active.js`).

**The problem:** STAT-02's Hunger, Rest, Wounds and Sickness would be a second copy of these. Two hunger systems would disagree with each other.

**Options:**
- **A (recommended):** STAT-02 tracks become the *display and stacking layer* only. Hunger tier is read from FOOD-01 nutrition, Wounds from the injury system, and so on. There is one source of truth for each track.
- **B:** STAT-02 replaces nutrition, moodles and injuries. This is much larger, and it reopens FOOD-01, CLOCK-01 injury rules and the injury tests.

### H3. Level 35 checkpoint gives 1 pick, not 2
Level 35 is odd. Under the "even levels only to 35" rule it gets no standard pick, only its checkpoint bonus. The contract says checkpoints give exactly two picks.

Every simulation you locked used **one** pick at level 35, so the code keeps that. Total picks from level 2 to 100 = **91**.

**Options:**
- **A (current):** keep 1 pick at 35.
- **B:** give 35 a standard pick too. This adds 1 pick (92 total) and moves the damage cap very slightly earlier.

### H4. The 10 core stats versus the current survivor stats
**What I found:** the live survivor has 100 max HP (`ZI.SURVIVOR_MAX_HP`). Its combat stats come from gear and profession levels (`STAT_FORMULAS.survivorStatBlock`). STAT-02 defines Max HP 40 → 60, Damage 1.00× → 1.30× and so on.

**Options:**
- **A (recommended):** treat the 10 stats as a *new layer* on top of the current stats. For example, Max HP ranks add to the current 100 HP, and Damage is a multiplier on current damage.
- **B:** replace the current survivor stat block. This needs combat rebalancing (BAL-03 work).

### H5. Status timing is placeholder
**What is set:** offline drift is one Hunger tier per 8 game hours, a meal every 8 game hours, and sleep every 16 game hours. All are placeholders. Online ticking is not wired in.

**Decision needed:** how fast each track worsens during play, in game hours. Also, should food eaten offline come from the same stash that FOOD-01 auto-eat uses?

### Note: engine
The contract says Unity / C#. The live game is the HTML/JS build (`game/*.js`), and the `unity/` folder is empty. So STAT-02 was built in JavaScript to match the running game. A C# port can follow the same data and tests later.

---

## 5. Placeholder modifier table (not final balance)

Modifiers are fractional changes to the stat (−0.10 = −10%). The table is set in `ZI.PROG.STATUS` in `game/progression.js`.

| Track | Tier | Kind | Hidden effect |
|---|---|---|---|
| Hunger | Well Fed | good | HP Regen +5% |
| Hunger | Peckish | neutral | — |
| Hunger | Hungry | bad | HP Regen −10%, Attack Speed −5% |
| Hunger | Starving | bad | HP Regen −25%, Attack Speed −15%, Damage −10% |
| Rest | Rested | good | Attack Speed +5% |
| Rest | Tired | neutral | — |
| Rest | Fatigued | bad | Attack Speed −8%, Evasion −10% |
| Rest | Exhausted | bad | Attack Speed −20%, Evasion −25%, Move Speed −10% |
| Wounds | Healthy | neutral | — |
| Wounds | Scratched | bad | HP Regen −5% |
| Wounds | Wounded | bad | Max HP −10%, Move Speed −5% |
| Wounds | Badly Hurt | bad | Max HP −25%, Move Speed −15%, Damage −10% |
| Sickness | Healthy | neutral | — |
| Sickness | Queasy | bad | HP Regen −5% |
| Sickness | Sick | bad | HP Regen −15%, Damage −5% |
| Sickness | Feverish | bad | HP Regen −30%, Damage −10%, Crit Chance −20% |
| Morale | Steady | neutral | — |
| Morale | Uneasy | bad | Crit Chance −5%, Evasion −5% |
| Morale | Shaken | bad | Crit Chance −15%, Evasion −15%, Damage −5% |

**Stacking rule:** with n bad states active, every bad modifier is multiplied by 1 + 0.15 × (n − 1). Good states use the same rule. Example: Hungry + Fatigued + Sick together give HP Regen −32.5%, Attack Speed −16.9%, Evasion −13% and Damage −6.5%.

**Offline floor (worst reachable tier while away):** Hungry, Fatigued, Wounded, Sick, Uneasy.

**Design change:** Morale "Steady" was changed from a small buff to neutral. Otherwise every new character would start with a free bonus.

---

## 6. Files

- **New:** `game/progression.js`, `tests/stat-02-progression.test.js`, `reports/STAT-02/REPORT.md`, `reports/STAT-02/simulation-output.txt`
- **Changed:** `Zombie Idler v2.html` and `Zombie Idler v2 - TEST SAVE.html` (one script line each, after `game/stats.js`), `CURRENT_BATCH.md` (now STAT-02), `CODE_STATE.md` (new STAT-02 section at the top)
- **Pre-change copies:** `reports/STAT-02/pre-change/` (both HTML pages, the CLOCK-01 `CURRENT_BATCH.md`, `CODE_STATE.md`)
- **Not committed to git or pushed to GitHub.**


---

## 7. Step 2 — live wiring (Oct 28, after Sam's answers)

### Sam's answers
| # | Decision |
|---|---|
| H1 | Keep each player's level; refit their XP onto the new curve |
| H2 | Status tracks read the systems that already run |
| H3 | Level 35 keeps one pick |
| H4 | The 10 stats add on top of the current survivor stats |
| H5 | Hunger drops one tier per game day (about 24 real minutes). Eating is by hand until **Auto-Eat** is bought in the Shop. Tiredness drops one tier every two game days (about 48 real minutes); Make camp resets it |

### What now runs in the game
- **New file `game/progression-live.js`**, loaded right after `game/bootstrap.js` in both pages.
- **Save migration (H1):** runs once per save (`zi_prog_curve_ver = 2`). The level stays the same, and progress inside the level is kept as a fraction. Picks already earned are granted (an old level 12 save gets 7 picks). Browser-checked with an old level 12 save.
- **Character level** now uses the new curve (`ZI.getCharacterLevel`). New picks are added whenever Wandering XP is banked.
- **Picks:** the open offer is saved in `zi_prog_v1`, so a reload never re-rolls it. Ranks, pity counters and waiting picks are saved there too.
- **Stats on top (H4):**
  - Max HP: +0 to +20 on top of current max HP
  - Damage: ×1.00 to ×1.30 on weapon damage
  - Crit Chance and Evasion: +0 to +34 and +0 to +24 points
  - Crit Damage: scales the crit bonus
  - Armor: 0–40% damage reduction (one guarded line added to `resolveAttack` in `game/stats.js`; it does nothing at 0)
  - Attack Speed: scales initiative
  - HP Regen: scales the rest regen rate
- **Status (H2):**
  - Hunger: a 0–100 meter. This is now `ZI.getNutrition()`, so the top-bar Nutrition chip shows real values.
  - Rest: a 0–100 meter.
  - Wounds: read from the injury system and the Wandering HP.
  - Morale: read from Broken (Shaken) and stress of 70 or more (Uneasy).
  - Sickness: always Healthy. No sickness system runs yet.
- **Timing (H5):** meters drain on the world clock. Make camp sets Rest to 100.
- **Eating:** the Eat button uses the lowest-value food in camp. Loot boosters in the Food slot are not food.
- **Auto-Eat:** a new Shop item (QoL, T1 × 6, unlocks at 500 m). It is switched on with `autoEatRequiresShop`.
- **Away rules:** while the app is closed, meters never fall past Hungry or Fatigued. The survivor eats up to 3 meals from camp food, and sleeps if away 8+ game hours. The Stats panel shows "While you were away: …".
- **UI:** new `progression-ui.jsx`. A Survivor panel sits at the top of the Stats screen. It shows level, the XP still needed, upgrade cards, condition words, Eat, the Auto-Eat status and the stat sheet. It shows values only, never ranks or formulas (checked in the browser).

### Checks
- `tests/stat-02-live.test.js`: 44 / 44 pass. It covers migration, picks, the stat layer, timing, eating, Auto-Eat, Make camp, the away floor and the readers.
- `tests/stat-02-progression.test.js`: 30 / 30 pass.
- Full suite: 36 suites, 847 passed, 2 failed (the same older `describeGearItem` and `itemStatLines` failures).
- Browser, both pages: Solo → More → Stats renders the panel, and clicking a card spends a pick. No script errors.

### New handoffs (need Sam)
- **H6: Auto-Eat conflicts with FOOD-01.** FOOD-01 locked P6 ("basic auto-eat, free and on by default") and P8 / business-model rule 5.1 ("the Shop sells efficiency only, never basic auto-eat or food"). Sam's Oct 28 answer makes Auto-Eat a Shop purchase. The code follows Sam's newer answer. Turning `autoEatRequiresShop` off restores FOOD-01. **Sam to confirm which rule stands, and update FOOD-01 or the business-model rules to match.**
- **H7: Shield and Movement Speed do nothing yet.** There is no shield mechanic, and travel speed was left alone to protect route pacing. Both can still be offered as picks. Options: hide them from offers until they work, or decide what they do.
- **H8: XP sources.** Character XP still comes only from banked Wandering scores. The 300-hour pacing assumes the 60/25/15 source mix. Which actions should give character XP?
- **H9: Make camp versus tiredness.** Make camp can be used once per 24 real hours, but tiredness hits Fatigued after about 1 hour 36 minutes of play. Long sessions will end Fatigued or worse. Options: allow resting another way, or slow tiredness.
- **H10: Placeholder numbers.** Placeholders still to set: food value (30 per item), Auto-Eat price and gate, 3 away meals, 8-hour away sleep, and every status modifier in section 5.
- **Offline combat note:** Wandering fights replayed while the app was closed run before the live wiring loads, so they do not use the new stats.

### Files (step 2)
- **New:** `game/progression-live.js`, `progression-ui.jsx`, `tests/stat-02-live.test.js`
- **Changed:**
  - `game/stats.js` (one guarded Armor line)
  - `screens-v2.jsx` (panel mount)
  - both HTML pages (script tags and cache-busted versions for `stats.js` and `screens-v2.jsx`)
  - this report, `CODE_STATE.md`, `CURRENT_BATCH.md`
- **Pre-change copies:** `reports/STAT-02/pre-change/` (HTML pages from step 1) and `reports/STAT-02/pre-change/step2/` (git HEAD copies of `stats.js` and `screens-v2.jsx`; both files already had other uncommitted work, and STAT-02 adds only one line to each)
- **Not committed to git or pushed to GitHub.**
