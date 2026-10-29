# Character Creation · Crawler (Halved) · Operations page — Oct 29, 2026

**Asked by Sam (Oct 29, 08:13):** "In your safest building of documents, establish the character creation page. When starting a new game, the crawler have trait and the Operations/Schedule proposal. Ignore ZI-SEC-01 security plan."
**Sources:** Google Docs "Character Creation Instructions (Draft)" and "Crawler Sprite & Halved Trait — Team Review Draft"; `reference/operations-schedule-proposal.md`. ZI-SEC-01: not touched.
**"Safest" rule used:** build what the documents define; where a document leaves a detail open, use a clearly marked placeholder with no gameplay effect, never invent stats or balance; existing saves keep exactly what they had. Pre-change copies: `pre-change/` (the first files there were saved by an earlier session at 00:42, which had started this work: `game/character.js` and the `startNewInSlot` hook were continued, not redone).

## 1. Character Creation (New Game)
- **Flow:** Save Files → New Game (or overwrite) opens four steps: **Choose Your Survivor** ("Who will survive?", Male / Female with the retro survivor art) → **Make Your Mark** (hair, clothing, scars, accessories; portrait updates) → **What Were You Before?** (profession cards with flavour lines and their effects) → **One More Survivor** (review, Change buttons back to any step, **Start Surviving**). The file is created only on Start Surviving; Back keeps every other choice. Both pages, both modes.
- **Rules kept:** gender changes art only (identical stats, tested). Appearance options are **placeholders, cosmetic only** (no stat fields; the screen says so); exact options stay open. Professions are the **existing four starting archetypes** (Vanguard, Forager, Artisan, Envoy, `ZI.LEADER_ARCHETYPES`) with their **existing starting Profession XP** shown as "+120 Combat XP" etc.; no new values. Camp Leader's old leader picker no longer appears because the choice is made here.
- **Saved:** `zi_survivor_profile` (inside the save file). The Wandering survivor uses the chosen gender (female art) and name. Older saves have no profile and look as before.
- Code: `game/character.js`, `character-creation.jsx`, `SaveFilesScreen` in both HTML pages, `screens-v3.jsx` (`activeSurvivor`).

## 2. Crawler with the reusable Halved trait (new games)
- `ZI.ZOMBIE_TRAITS.halved` (50% max HP, 50% damage, 50% attack frequency) and `ZI.applyZombieTrait` (applied once when the record is built, whole numbers, so never double-applied).
- **Crawler** (id 46) = Simple Shambler torn in half: HP 20, damage 2, attacks every second turn (`attackEvery: 2`, handled in `resolveAttack`, so the auto-fight and the manual fight screen both follow it). Animation speed (`spd`) is unchanged. XP stays the base 10 (the draft does not halve rewards).
- **Tier F — provisional** (the draft leaves the tier to a bestiary review; Halved F is the weakest choice that keeps it in the opening pool). **No sprite yet:** none has been exported, so it is drawn by the existing zombie painter at 60% height. Halved is assigned to the Crawler only.
- **New games only:** `ZI.BESTIARY` (45) is unchanged; the Crawler lives in `ZI.BESTIARY_ROSTER` with `minRoster: 2`. New saves store `zi_roster_v = 2`; `ZI.fieldBestiary()` feeds the field pool, the watched Wandering scene and the Codex (46 threats in a new save, 45 in an old one).
- Code: `bestiary-data.js` (end), `game/wandering.js` `_bgZombie`, `game/stats.js` (`enemyStatBlock`, `resolveAttack`), `game/save.js` (`ROSTER_VERSION`), `screens-v3.jsx`.

## 3. Operations page (Schedule tab)
- The Schedule tab now shows **Operations** in both modes: **Now and next** (patrol state, active route runs with return time, Traversal cell with scouts / hide / Make camp, crafting and recycling jobs, camp duties count, attention items: injury, Broken, hunger, tiredness, waiting stat picks, no food, unclaimed route hauls) · **Plan** (activity catalog grouped Field / Base and return; each card: who, needs, while away, result, and an availability label: Available now / Needs facility / Needs supplies / Busy until… / Design proposal) · **Base schedule** (Camp Leader: every existing duty with its facility and who is on it; Solo: your own upkeep, no camp roster).
- **Read-only.** Open buttons only navigate to the screen that owns the activity; the page never runs or queues work (tested: reading it changes nothing in the save; the screen code has no write calls). Proposed activities (pending deploy, circuits, radio listen, intel, cooking, weapon upkeep, laundry, supply sorting, water) are shown as **Design proposal**, greyed, never selectable, and can be hidden with a checkbox.
- **Not built** (proposal only, mechanics open): the chores themselves, psychological low-stress tiers, Grocery / Pharmacy / Laundromat POIs, route-return processing rules, radio and human-NPC contact. **Camp duty assignment:** the engine supports it but no screen exposes it; it was left read-only because assigning duties grants schedule XP (40 XP per game hour per duty) and that rate has not been reviewed for play.
- The old mock timeline (`ScheduleScreenV2`) stays in `screens-v2b.jsx`, unused, for rollback.
- Code: `game/operations.js`, `operations-ui.jsx`, `renderScreen` in both HTML pages.

## 4. Checks
- New `tests/char-crawler-ops.test.js`: 31 checks. Full suite **40 suites, 972 passed, 0 failed**.
- Browser (Chromium, compiled build, both modes): 24/24 — New Game opens step 1 with no file created; Continue disabled until a survivor is chosen; choices survive going back; Start Surviving creates the file with the profile, starting XP and roster 2; the Schedule tab shows Operations (camp duties only in Camp Leader); Open navigates; the Codex shows 46 threats; no console errors. Screenshots: `screenshots/`.
- `tools/build-web.cjs` now overwrites `compiled/` in place and only warns when a stale file cannot be deleted (it failed when file deletion was not allowed).

## 5. Needs Sam
1. Crawler tier (provisional F), sprite/atlas, gore level, whether Halved can be applied mid-fight (draft gates).
2. Appearance options and whether any appearance gives a bonus; survivor name entry; profession names (the four archetypes are used today).
3. Operations: tab name (still "Schedule"); camp duty assignment and its XP rate; which proposed chores to design first (your order: cooking → weapon upkeep → laundry).
