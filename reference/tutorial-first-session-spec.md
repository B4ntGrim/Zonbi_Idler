# Zed Idler — Tutorial and First-Session Spec

**Version:** 1.0 (draft for review)
**Companion documents:** `wandering-tab-spec.md` (v2.1), `wandering-fort-scene.md`, `wandering-design-audit.md`
**Scope:** Solo Survivor, first release (vertical slice). Camp Leader is not part of the first session.
**Tags:** `[DECIDED]` confirmed by Sam · `[PROPOSED]` draft · `[OPEN]` needs a decision · `[CODE]` a fact about the current prototype

---

## 1. Purpose and success measures

The first session decides whether a player stays. In an idler, retention is won or lost in the first 20-30 minutes, and this game adds many systems (policies, pockets, stress, factions, decay). The tutorial's job is to introduce **one idea at a time**, get the player to the Fort and the first quest, and leave them with a reason to come back.

### 1.1 Goals

1. The player understands the core loop: **set a policy, leave, come back to a report**.
2. The player reaches the **first Fort** in the first session and understands what it wants.
3. The player completes or clearly understands **Fallow Ground**.
4. The player leaves the first session with a **reason to return** (the quest turn-in, a rusting skill warning, a crafted item).
5. No system appears before the player has a reason to care about it (progressive disclosure).

### 1.2 Targets for playtesting `[PROPOSED]`

| Measure | Target |
|---|---|
| Players who reach the Fort in the first session | 80% or more |
| Players who accept Fallow Ground in the first session | 60% or more |
| Time from new game to the Fort scene | 10 minutes or less |
| Time from accepting Fallow Ground to turn-in | 5-15 minutes of play |
| Players who can explain, unprompted, what their policy does | 70% or more |
| Players stuck or confused with no next step (observed) | Under 10% |

Target numbers are starting values and will be tuned by playtesting.

---

## 2. Principles

1. **One idea at a time.** A prompt introduces one concept and disappears.
2. **Show, then explain.** Let the player do the thing, then explain what happened.
3. **Never block idle progress.** The survivor keeps working while the player reads.
4. **Skippable and replayable.** Skipping is always possible; a "?" button replays any step. `[CODE]` A replay button already exists on the Traversal screen.
5. **Guarantee the path.** Anything the player must find is placed, not rolled (the Fort, the first Campsite).
6. **No dead ends, no soft-locks.** Every required item can be crafted, and every required step can be retried.
7. **Teach the current rules only.** Old tutorial text about commands and the Evade toggle is retired (Section 7).
8. **Data-driven.** Tutorial text, triggers and unlocks live in a data table, not in code.

---

## 3. Starting state

### 3.1 New-game flow `[PROPOSED]`

1. **Mode:** Solo Survivor. `[OPEN]` Whether a mode screen appears at all, since Camp Leader is now a late-game shift of Solo (spec 8).
2. **Difficulty:** Easy, Normal or Hard, **fixed for the save** `[DECIDED]`. Show a one-line plain summary of each and a clear "cannot be changed later" line. Normal is preselected.
3. **Survivor:** name and character type. `[OPEN]` how many of the 30 designed character types appear in the first release.
4. **World seed:** generated; seeds the map and the starting faction standings (spec 4.6).
5. Start on the Traversal screen.

### 3.2 Starting loadout `[PROPOSED]`

| Item | Detail |
|---|---|
| Handmade pouch (Pack slot) | 2 pockets |
| Med kit | In pocket 1; holds 2 heal charges |
| Scout kit | In pocket 2; holds 2 scout charges |
| Base charges | Small daily heal and scout charges |
| A basic melee weapon | Melee slot |
| A little food | Food slot |
| Base weight capacity | 15 kg plus the pouch |

**Granted at save creation** `[DECIDED Oct 1]`, not at the first Traversal screen open. A flag `zi_starter_kit_given` grants the kit once to older saves that lack it. The tutorial step points at the kit.

*Why the pouch starts full:* both pockets are occupied, so the player sees the pocket system working from minute one. Giving away the med kit at the Fort frees a pocket, which teaches the trade-off.

### 3.3 Starting knowledge

- Only the tabs the player needs are visible: Traversal, Wandering, Crafting, Stockpile. The rest appear by the schedule in Section 6. `[PROPOSED]` `[OPEN]` how the tab bar hides unopened tabs.
- The **Factions page is locked** until the first Fort quest is turned in `[DECIDED]`.
- **Heinous is locked** `[DECIDED]`.
- Stress, decay and floors exist but are **not explained** until they matter (Section 6).

---

## 4. The first session, beat by beat

Times are targets, not limits. The player may skip or dawdle at any beat.

### Beat 1: Day One (Traversal), about 2 minutes `[CODE]` exists
The current Traversal tutorial has four steps: the grid, "You are here", moving one zone at a time, and choosing how to survive (Travel, Loot, Scout, Make Camp, Hide). Keep it. Changes:
- The line "Every outbreak drops you somewhere new" stays true; the start position is random per world, and the **Fort is placed at a fixed offset from the start** (Section 5).
- The step that points the player to the Wandering tab stays.

### Beat 2: First Wandering and choosing a policy, about 3 minutes
- The Wandering screen opens with the survivor already patrolling.
- **Policy choice:** three cards (Ethical, Immoral, Criminal), each with one sentence on what it does and what it costs. Heinous is not shown. The first choice is free and **exempt from the switch cooldown** `[PROPOSED]`.
- Then the Wandering tutorial runs (Section 7 has the revised steps).

### Beat 3: The first discovery, about 3 minutes
- A **scripted Campsite** (Low risk) appears in the first minutes of the first run `[PROPOSED]`, regardless of policy.
- The prompt teaches *Venture closer / Move on*, the risk label, the timer (a generous first-time timer of 60 s `[PROPOSED]`), and the fact that the policy decides if the player does not answer.
- The player is invited to **use a scout charge** to see the exact odds.
- Success grants a small reward and the first crafting material.

### Beat 4: The return report, about 1 minute
- The first time the player leaves the Wandering tab for a few minutes and returns, they see a **return report** (what happened while away).
- Because the player just left, the first report should always contain something interesting `[PROPOSED]`: at least one resolved event.
- One line introduces the idea that **the survivor keeps working while the player is away**.

### Beat 5: Rumor of the Fort, about 2 minutes
- After the first Campsite (or after a set time on the map), a log line: smoke on the horizon, a palisade to the `[direction]`.
- The Fort square is marked on the Traversal grid with a distinct icon. Nudge lines repeat at intervals but never force the player `[PROPOSED]`.

### Beat 6: The Fort gate, about 5 minutes
- The scene is in `wandering-fort-scene.md` (Sections 10 and 11). The tutorial adds:
  - **A "what they want" hint:** the guard says "Medicine. Bring medicine." The quest log adds a pointer.
  - **If the survivor arrived with no med kit** (used the charges or lost it): the quest log points to Crafting and the recipe is available from the start `[DECIDED]`; the diplomat and command checks stay open.
  - **A confirmation before attacking the guard:** "This cannot be undone. The Hearthguard will be hostile." One line only; the player may still proceed `[PROPOSED]`.
- Outcome: the quest **Fallow Ground** starts (or the alternatives in the Fort brief).

### Beat 7: Fallow Ground, about 5-15 minutes
- The quest assigns a Traversal cell next to the Fort. The survivor must clear it (40 kills, `ZI.CELL_CLEAR_KILLS`).
- The survivor's patrol does the work; the player can watch, use tools, or leave and return.
- This is the natural moment to teach **familiarity**: a cleared cell is calmer ground (stress).
- A progress line shows kills toward the goal.

### Beat 8: Return and turn-in, about 2 minutes
- When the cell is cleared, the quest log says to return to the Fort. **The player must return for the story to continue** `[DECIDED]`.
- The turn-in scene continues the story (`wandering-fort-scene.md`, still to be written).
- The **Factions page opens**, with a clear moment (highlight the tab, a short line). The Hearthguard appear by name; the other factions remain unnamed groups until their events.
- **Oct 26 `[DECIDED]` (MS1, MS2):** the turn-in is the first story milestone, closed by a one-time chapter card "Chapter One: Fallow Ground" (`wandering-fort-scene.md` §12.2). The turn-in scene is "The Sealed Crate".

### End of first session
The player should now have: chosen a policy, met a discovery prompt, seen a return report, learned pockets, reached the Fort, done the quest, and unlocked the Factions page. Total target: **20-30 minutes**.

---

## 5. Fort placement rule `[DECIDED concept, PROPOSED specifics]`

> **Oct 26 (TRAV-02a) `[DECIDED]`:** the daily Traversal movement cap does not apply until Fallow Ground is turned in, so the first session can reach the Fort, clear Fallow Ground and return.

- The start position is random per world (`[CODE]` "Every outbreak drops you somewhere new").
- The first Fort is placed **inside the starting map view**, **2 to 3 cells** (Chebyshev distance) from the start, on an unlocked Traversal square with **at least one unlocked neighbour** for the Fallow cell, chosen deterministically from the world seed `[DECIDED Oct 1]`. Claude Design reports the start view size so the rule fits it.
- It must be reachable without passing a locked or contested cell. If the offset lands on a locked cell, choose the nearest valid cell and record it in the save.
- Store the Fort's position in the save (for example `zi_fort1_pos`) so it never moves.
- The Fallow Ground cell is a second placed square next to the Fort.

---

## 6. Progressive disclosure schedule `[PROPOSED]`

| System | Introduced when | How |
|---|---|---|
| Traversal grid, Wandering tab | Beat 1 | Existing Traversal tutorial |
| Policy | Beat 2 | Three cards at the first Wandering visit |
| HP, haul, checkpoints, log | Beat 2 | Revised Wandering tutorial |
| Discovery prompts, timer, risk label | Beat 3 | Scripted Campsite |
| Scout and heal charges, pockets | Beats 2-3 | Starting kits; tooltips |
| Return report | Beat 4 | First return |
| Crafting (med kit recipe) | Beat 6, or when the player has no kit | Quest log pointer |
| Factions page, reputation | Beat 8 | Opens on quest turn-in |
| **Stress** | First time stress reaches 40, or when the player first changes route | One-time explanation |
| **Skill decay, rust** | First time any skill reaches its warning stage (usually days later) | One-time explanation with the return report |
| **Floors** | First floor earned | One-time banner |
| Gear wear and repair | First item below 50% durability | One-time tooltip |
| Beds and rest | First time stress is Strained and the player is at base | Suggest a bedroll |
| Hexagon (strengths and weaknesses) | When the second faction is introduced | Story event |
| Difficulty effects | Always available in the settings screen | Read-only summary |
| Late-game fork | Late game | Story beat (spec 8) |

*Why:* each system appears at the moment it starts to matter, so the first session never shows the player more than three or four new ideas at once.

### 6.1 Tab tutorials `[DECIDED]`

Each tab tutorial fires the **first time the player opens that tab** (per save), not at new-save creation. A tab cannot fire before the schedule below makes it relevant. Until open question 6 (hide or lock unopened tabs) is decided, `[CODE]` all tabs are visible, so the trigger is simply the first open.

| Tab | Introduced when | How |
|---|---|---|
| Stockpile | Visible from the start (3.3). Also pointed to once, the **first time loot is banked** (live log or return report, 7.1) `[DECIDED]` | First-open tutorial (7.1) and one pointer line |
| Stats | After the survivor earns their first skill XP (Beat 2) `[PROPOSED]` | First-open tutorial (7.2) |
| Codex | After the first zombie fought (Beat 2) `[PROPOSED]` | First-open tutorial (7.3) |
| Routes | First open. A new game starts on Traversal (3.1) `[DECIDED]`; `[CODE]` the current Routes default start screen is a bug for Code to fix | First-open tutorial (7.4) |
| Schedule | Parked feature. Its tutorial is written in the batch that builds it | One-line placeholder until then (7.5) |
| Market | Parked feature. Its tutorial is written in the batch that builds it | One-line placeholder until then (7.6) |
| Active/Idle, Auto-Repeat | Introduced on Shop unlock `[DECIDED]` | One short step when unlocked in the Shop. Written in the Shop batch (parked); not mentioned in the Routes tutorial. **Superseded in part `[DECIDED Oct 25]`, C9:** once circuits take over Idle run, repeating is free (C2) and "one loop only" is the Shop unlock (C3); until then, predefined Routes keep Auto-Repeat as a Shop unlock. Active/Idle is unchanged. See `circuit-expedition-concepts.md`. |

---

## 7. Existing tutorial content to revise `[CODE]`

**Traversal tutorial** (4 steps, `TUTORIAL` in the Traversal screen): keep, with one change: mention the marked Fort square when it appears. Keys: `zi_trav_tutorial_done`.

**Wandering tutorial** (`WanderTutorial`, 7 steps). Keys: `zi_wander_tut_done`. Revisions:

| Existing step | Status | Change |
|---|---|---|
| This is the idle half of the game | Keep | Add one line about the standing policy |
| Health is the clock on every run | Keep | None |
| Your pack is at risk until you bank it | Revise | Add pockets and weight; keep the haul-at-risk idea |
| Distance, laps and checkpoints | Keep | None |
| Pace and risk | **Rewrite** | Removes the Evade toggle text; explains heal and scout charges from kits |
| The combat log | Keep | Add the return report |
| Commands: your active edge | **Replace** | The 60-commands-a-day system and typed commands are retired. Replace with *Discovery prompts and tools* |

New steps to add: **Policy** and **Discovery prompts / timer**.

Old wording that must not survive: "You get 60 commands a day", "With Evade on, Push tries to slip past a fight".

### Rules for all tab tutorials `[DECIDED]`

- 2-4 steps each `[PROPOSED]`: what the screen is for, and the one action worth doing first.
- Teach only implemented rules. Nothing about skill decay, stress or floors here; those keep their own triggers (Section 6).
- Progress is stored only in `zi_tut_progress` (9.2). No new per-screen boolean flags.
- Every tab's "?" replay button sits **bottom-right** and opens the step list, so the player can replay any single step (`TutStepMenu`). `[CODE]` Traversal and Crafting are already bottom-right; **Wandering is bottom-left and moves to bottom-right**.
- A tab tutorial fires on first open when none of its step ids are in `zi_tut_progress`. Finishing or skipping adds all of that tab's ids `[PROPOSED]`. Replaying a step does not change progress.

### 7.1 Stockpile (3 steps)

`[CODE]` Two sub-views: **Recycler** (breaks field salvage into materials; the queue keeps running in the background and offline) and **Storage** (materials, carrying, crafted gear loadout with equip and repair). Loot banked from Wandering waits in the Recycler.

| Id | Title | Body |
|---|---|---|
| `stockpile.purpose` | Everything you bring home | What your survivor banks ends up here. The Recycler turns salvage into materials. Storage holds those materials and your crafted gear. |
| `stockpile.recycler` | Break down your salvage | Loot banked from Wandering waits in the Recycler. Queue it to break it into materials. The Recycler keeps working while you're away. |
| `stockpile.storage` | Gear up in Storage | Crafted gear appears in Storage. Equip it here and your survivor takes it into Wandering. Damaged gear can be repaired here. |

**Stockpile pointer** (`stockpile.report_pointer`, once per save) `[DECIDED]`: one line, "📋 Your banked haul is waiting in Stockpile → Recycler." Shown the first time loot is banked: in the **live log** if the player is watching, or in the **return report** if banked while away. Whichever happens first shows it; it never shows twice.

### 7.2 Stats (3 steps)

`[CODE]` Skill (profession) bars read live from the XP bus (`zi_stat_xp`), and a "+XP" flash appears when a skill is trained. The SURVIVAL Attributes panel, the time-of-day zombie panel and the weather selector use fixed sample values. In the first release they carry a visible **"Preview"** label `[DECIDED]`, and no tutorial step mentions them.

| Id | Title | Body |
|---|---|---|
| `stats.purpose` | Skills grow by doing | Your survivor's skills level up from what they actually do, in the field and at base. |
| `stats.read` | Reading a skill | Each bar shows the skill's level and the XP needed for the next one. A +XP flash appears when an action trains a skill. |
| `stats.first` | Train something | Go back to Wandering and use a tool. Then check here to see which skill it trained. |

### 7.3 Codex (3 steps)

`[CODE]` Lists every zombie type with combat stats (hit range, chance to hit, accuracy, crit, lifesteal, damage reduction, evasion). Undiscovered entries show `????`. Filters by category and tier, plus search.

Rules `[DECIDED]`:
- **Unlock:** an entry unlocks when the player has **fought** that zombie type. `[CODE]` Today `ZI.discoverZombie` runs at the start of every Wandering encounter, before the evade check, so an evaded zombie also unlocks. Code moves it so only a fight unlocks.
- **Canonical data:** Codex stats read from the canonical enemy data table, never a copy. `[CODE]` Code confirms the Codex and combat read the same table.
- **Danger rating:** shown to players as a simple label derived from canonical enemy data. `[CODE]` Today it comes from a tier-to-danger map inside the Codex screen; Code moves it to canonical data.

**Player record per entry** `[PROPOSED]`. Show only figures the simulation tracks or can track deterministically:

| Figure | Status |
|---|---|
| Encounters | Trackable: every Wandering encounter has the zombie's `bestiaryId` |
| Kills | Trackable: the encounter result records the outcome |
| Fought vs. evaded | Trackable: the encounter result records an evade/escape path |
| Damage dealt / taken against this type | Trackable: the encounter result records `dmgDealt` and `dmgTaken` |
| Critical hits landed | Trackable: the seeded hit roll already returns `crit`; needs a per-type counter |
| Times downed by this type | `[OPEN]` Needs Code to confirm a downed event can be tied to the zombie fought at the time |
| Best weapon used | `[OPEN]` Needs a definition of "best" (most kills? highest damage?) and the equipped weapon stored per kill |
| Headshots (count and rate) | `[OPEN]` No combat mechanic yet. Concept in `reference/headshots-concept.md`, numbers `[PARKED]`. Not shown until the mechanic is implemented; until then the record shows encounters and kills only |

All counters are per save, written by the same seeded combat resolution, so live and offline results match.

| Id | Title | Body |
|---|---|---|
| `codex.purpose` | Know what's out there | The Codex lists every kind of zombie. Entries stay ???? until you've fought one. |
| `codex.first` | Read a known entry | Open an entry you've fought to see how hard it hits, how often it lands a blow, and how much damage it shrugs off. Filter by category or tier to compare. |
| `codex.record` | Your record | Each entry you've fought also shows your own record against it: how often you've met it and how many you've killed. |

### 7.4 Routes (3 steps)

`[CODE]` Pick a biome, then a route card (risk, RMAT tier, loot range, recommended level, success chance; cards shift toward danger with global threat). Each route is a chain of stops resolved by type. Launching starts a timed run; when it ends, **Last Run** shows the per-stop log with **Claim** (banks loot to the Recycler) and **Send Again**. The success formula is a prototype heuristic (Development Status 8.4). Active/Idle run modes and Auto-Repeat are Shop unlocks `[DECIDED]`; the Routes tutorial does not mention them (see 6.1). **Superseded in part `[DECIDED Oct 25]`, C9:** once circuits take over Idle run, repeating is free (C2) and "one loop only" is the Shop unlock (C3); until then, predefined Routes keep Auto-Repeat as a Shop unlock. Active/Idle is unchanged. See `circuit-expedition-concepts.md`.

| Id | Title | Body |
|---|---|---|
| `routes.purpose` | Planned runs | Routes are set loot runs through a chain of stops. Pick a biome, then a route. |
| `routes.read` | Reading a route | Each card shows the risk, the loot on offer, the recommended level and your chance of success. Risk rises with the threat level. |
| `routes.first` | Send a run, claim the result | Launch a route. When it finishes, Last Run shows what happened at each stop. Press Claim to bank the loot to the Recycler. |

### 7.5 Schedule (placeholder)

`[CODE]` Built today:
- **Screen** (`ScheduleScreenV2`): a 24-hour timeline with six task types (Craft, Train Stats, Repair, Marketplace Trade, Rest, Prepping for Horde, the last Camp only), drag to reorder, a 24 h cap, and Save Draft / Confirm. The task list starts from a fixed sample in screen state; I found no save key for it.
- **Logic** (`game/camp.js`): camp jobs (`ZI.SCHEDULE_JOBS`, each needs a building), assignments saved in `zi_schedule`, offline settle capped at 24 h, XP through the XP bus. Not confirmed whether the screen uses this logic.
- Parked: "Shop, Scheduling" (PARKED.md, 3A → Later).

| Id | Title | Body |
|---|---|---|
| `schedule.placeholder` | Schedule | Planning your survivor's day arrives in a later update. Nothing on this screen affects your game yet. |

### 7.6 Market (placeholder)

`[CODE]` Built today: a Market tab with an **Auction ⇄ Shop** switch (choice saved). Auction is a player-to-player listing screen filled from sample data (`ZI.MARKET_ITEMS`); the prototype does not call the server (Development Status 8.5). Shop is a fixed vendor gated by RMAT and distance, with a "new unlocks" badge. Parked: "Shop, Scheduling" (PARKED.md, 3A → Later).

| Id | Title | Body |
|---|---|---|
| `market.placeholder` | Market | Trading opens in a later update. Listings here are previews. |

---

## 8. Failure paths and edge cases

| Situation | Handling |
|---|---|
| Player skips the tutorial | All beats still trigger from state, not from tutorial steps. Missing explanations are available through the "?" button |
| Player has no med kit at the Fort | Guard names the need; quest log points to the recipe; diplomat and command checks still work |
| Player used up heal charges early | Base charges refill daily; crafting makes more kits; the tutorial explains this on the first empty charge |
| Player is downed in the first run `[CODE]` (sent home with part of the haul) | First downed event is softened: the haul is kept once, with an explanation `[PROPOSED]` |
| Player ignores the Fort for a long time | Rumor lines at intervals; never forced |
| Player attacks the guard immediately | Allowed after the confirmation. Heinous unlocks, the page opens hostile, the Lodge is available (spec 4.5). The tutorial must then explain the Lodge and hostile standing in one short step |
| Player turned away, no way in | Quest log lists: bring medicine, or pass a diplomat or command check |
| Player changes policy immediately | The first policy choice is exempt from the cooldown; after that the cooldown is explained |
| Player leaves for a long time mid-quest | Offline settle (24 h cap) continues clearing progress; the return report reports it |
| Player loses the required item after accepting | The quest does not require it again; it was consumed at the gate |

---

## 9. Tutorial data and integration

### 9.1 Data table `[PROPOSED]`

```
TutorialStep {
  id, screen,
  trigger,          // event or state: "first_wander_open", "first_discovery", "stress>=40"
  targetSelector,   // UI element to spotlight
  title, body,      // short, terminal-style
  once,             // show once per save
  skippable, replayable,
  unlocks[]         // features revealed when the step completes
}
```

### 9.2 Save state
- `zi_tut_progress`: completed step ids (replaces per-screen booleans over time). The six tab tutorials (6.1, 7.1-7.6) are the first to use it; they add no new boolean keys. `[CODE]` Not implemented yet: only the boolean keys exist (`ZI.TUTORIAL_DONE_KEYS`), so Code must add it.
- `zi_trav_tutorial_done` and `zi_wander_tut_done` remain for existing saves.
- `zi_fort1_pos`, `zi_factions_unlocked`, `zi_heinous_unlocked`, `zi_quest_fallow_ground` (state).

### 9.3 Analytics for closed playtests `[PROPOSED]`
Record, locally and only with consent: tutorial step completed or skipped, policy chosen, first discovery response, Fort reached, offering accepted, quest accepted, quest turned in, time to each, and the last screen before quitting. These are the measures in 1.2.

---

## 10. Test plan

1. **Unassisted playtest:** 5 new players, no help, observed. Record time to the Fort, confusion points, and whether they can explain their policy.
2. **State tests:** every failure path in Section 8 reachable and recoverable.
3. **Skip test:** skip the whole tutorial and confirm the game is still completable.
4. **Placement test:** 1,000 generated worlds; the first Fort is always inside the starting view, 2 to 3 cells away, reachable, never on a locked cell, and always has an unlocked neighbour.
5. **Offline test:** leave mid-quest for 1 h and 24 h; progress and report correct.
6. **Replay test:** "?" replays each step without corrupting state.
7. **Regression:** old saves that used the removed commands load and migrate.

---

## 11. Open questions

1. Is there a mode-select screen, given Camp Leader is now a late-game shift of Solo?
2. How many of the 30 character types are in the first release?
3. Is a scripted first Campsite acceptable regardless of policy? (Proposed: yes, for guaranteed teaching.)
4. Is the softened first "downed" penalty acceptable?
5. What is the story beat after the quest turn-in? (Needed to end the first session with a hook; to be written with the Fort dialogue.)
6. Should the tab bar hide unopened tabs, or show them locked?
7. Should the first policy choice be free of the cooldown? (Proposed: yes.)
8. ~~**Routes:** when is the Routes tab introduced?~~ **Resolved `[DECIDED]`:** a new game starts on Traversal (3.1). The code's Routes default is a bug for Code.
9. ~~**Routes:** should the tutorial teach Active/Idle and Auto-Repeat?~~ **Resolved `[DECIDED]`:** they are Shop unlocks, taught by a short step on unlock, written in the Shop batch (6.1). **Superseded in part `[DECIDED Oct 25]`, C9:** once circuits take over Idle run, repeating is free (C2) and "one loop only" is the Shop unlock (C3); until then, predefined Routes keep Auto-Repeat as a Shop unlock. Active/Idle is unchanged. See `circuit-expedition-concepts.md`.
10. ~~**Stats:** are the sample panels in the first release?~~ **Resolved `[DECIDED]`:** shown with a visible "Preview" label; no tutorial step mentions them (7.2).
11. ~~**Codex:** what unlocks an entry; are stats canonical?~~ **Resolved `[DECIDED]`:** unlocks when fought; stats read from the canonical enemy table; entries add a player record `[PROPOSED]` (7.3). Still `[OPEN]`: times downed by a type, best weapon used, headshots (7.3 table).
12. ~~**Codex:** is the danger rating for players?~~ **Resolved `[DECIDED]`:** yes, a simple label derived from canonical enemy data (7.3).
13. ~~**Stockpile pointer:** where does it show when loot is banked while watching?~~ **Resolved `[DECIDED]`:** live log if watching, return report if away; first one wins, never twice (7.1).
