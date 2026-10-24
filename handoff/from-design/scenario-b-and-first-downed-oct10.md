# Zed Idler — Scenario B Loadout and the First Downed Beat (Decision Record, Oct 10)

**Status:** U8, U12, U13 `[DECIDED Oct 10]`; U9, U11, U14 `[CONCEPT Oct 10]` with `[PROPOSED]` details; U10 `[OPEN]` (Sam). F1–F3 answered by a read of the local code (Section 1.1, Oct 10); Code confirms in its next report.
**Folds into:** `sim-harness-v1-brief.md` §6 D11 (when H2 is drafted) · `tutorial-first-session-spec.md` §4, §6, §8 (in the next tutorial batch). Until then this record wins over both on these two topics.
**Supersedes:** U4's "belt pouch only" fixture for Scenario B.
**Partly superseded (Oct 10, later):** U8's loadout, U10 and U14 are replaced by `elder-jester-concept.md` (U14 refined, U16–U19). Scenario B is now "completed the tutorial" and Scenario A "skipped". Section 1.1's code findings, U9, U11, U12 and U13 still stand.

---

## 1. Scenario B: the prepared survivor

### U8 `[DECIDED Oct 10]`
Scenario B is **the prepared survivor**: the Scenario A new-save survivor plus three early items, equipped and in normal condition, with normal stats and effects:

| Slot | Item | Role |
|---|---|---|
| Belt | Belt pouch | Carrying (+3 kg, 2 pockets). Kept from U4 |
| Body Armor | Padded jacket | Light protection (2 pockets, 0 kg) |
| Melee | **`[OPEN]` U10**, see 1.1. Sam's first idea (a board with nails) turned out to exist already as the Spike Board, which is not a first-session item | A better starter weapon |

**The question B answers changes.** It no longer asks "does a carrier free the survivor from the overload trap?" It asks: **does preparing pay off, and by how much?** Sam's direction: carrying capacity alone is never the problem. Outcomes depend on what the survivor has, starting HP, and what they have crafted and are wearing. The early game is meant to be hard; strategic choices are the way through, and the player must not be discouraged.

*Why:* this turns H2 into a check on the promise the tutorial makes (U9). If B performs about the same as A, the game tells players their choices matter when they don't.

**Measures (A vs B, per policy)** `[PROPOSED]`: forced retreats per day; average run length; haul banked per day; time spent resting. **Payoff threshold** `[OPEN]`: how much better B must be. Set from the first report, the same way N is.

**Unchanged from D11:** B is simulation-only and never changes the game's starting inventory; same seeds, four policies, Normal, 30 days; results never pooled.

### 1.1 What the code does today (read Oct 10, local `E:\Zed_Idler`) `[CODE]`

**F1, starter kit: granted, but not as designed.**
- `ZI.startNewInSlot` (`game/save.js`) calls `ZI.ensureStarterKit` (`game/items.js:435`), which puts the **handmade pouch, med kit and scout kit in the stash**. `ZI.grantGear` only adds to the stash.
- **Nothing is equipped.** The new-save loadout is empty (`ZI.emptyLoadout`), so the pouch adds no capacity. That is why Code's Scenario A ran at **15 kg**.
- **No melee weapon and no food are granted.** Tutorial spec §3.2 lists "a basic melee weapon" and "a little food"; neither is implemented. A new survivor fights unarmed.
- So Scenario A, the real new save, is weaker than the designed start in three ways: an unequipped pouch, no weapon and no food.

**F2, weapons that already exist** (`ZI.GEAR_ITEMS`):

| Item | Id | Rarity | Damage | Recipe |
|---|---|---|---|---|
| Nail Bat ("Improvised. Gets the job done.") | `bat` | Common | 18 | None found (loot only?) |
| Iron Knuckles | `iron_knuckles` | Common | 20 | Metal 30, 30 min, **no building needed** |
| Crowbar | `crowbar` | Common | 22 | None found |
| Steel Baton | `steel_baton` | Uncommon | 26 | Armory (Rank 1) |
| **Spike Board** (a board with spikes) | `spike_board` | Uncommon | 28 | Wood 50 + metal 30, **Armory (Rank 1)** |
| Combat Knife | `combat_knife` | Uncommon | 30 | Armory (Rank 1) |

No pocket knife exists. The board-with-nails idea is already the Spike Board, but it needs an Armory, so it isn't a first-session item.

**F3, craftable in the first session?** No recipe was found for the **padded jacket** (`vest_t1`) or the **belt pouch**. That matches spec §14.8 #6: "recipes owed in the crafting batch". Of the weapons, only Iron Knuckles can be crafted without a building.

**Consequence:** none of B's three items can be reached by crafting in real play today. B is still a valid simulation fixture (D11 allows it), but U14 and the tutorial both assume the player can actually get these items. Where they come from is the question U14 answers (Section 3).

### U10 `[OPEN]`: B's weapon (a combat decision, outside H2)

| Option | For | Against |
|---|---|---|
| **Nail Bat** (recommended) | Already exists; common; matches the "baseball bat" idea and the improvised tone | No recipe, so it would need a recipe or a scripted tutorial find |
| Iron Knuckles | The only weapon craftable now with no building | Weak fantasy for a first weapon; only slightly stronger |
| A new pocket knife | Fits "what a survivor has on them" | New item data: a new decision and a combat-balance question |

Whatever the choice, Scenario A stays the real new save. If the designed starting weapon (tutorial §3.2) is ever implemented, B's weapon must be better than it, or B tests nothing on the weapon side.

---

## 2. The first Downed beat in the tutorial

### U9 `[CONCEPT Oct 10]`
The "hard at first" message is delivered **at the player's first Downed state** (from any source, per FX1 U5).

- **Player on the Wandering screen:** the message appears there, in context.
- **Player not on the Wandering screen:** a **full-screen splash** ("Oh no…") brings the player's attention to Wandering and starts the **last part of the Wandering tutorial** there.

*Why at this moment:* the message lands when it is true. A warning in the first minute is ignored; the same words right after a setback explain what just happened and point to the way through.

### Details `[PROPOSED]`

| Topic | Proposal | Why |
|---|---|---|
| Message | *"The road is hard on the unprepared. Every run teaches something, and better gear goes further."* Placeholder wording | Frames the setback as learning and points at the fix |
| Splash behavior | Shown once per save. Dismissible. **The simulation never waits on it**: Downed, heal/revive and Forced Retreat resolve as normal underneath. The splash's button opens Wandering | Rules §4.5: nothing waits on the player |
| Downed while away (offline) | The splash shows on return, **before** the return report, worded in the past tense ("While you were away, your survivor was Downed") | Keeps the beat even when it happened offline |
| Last Wandering tutorial steps | (1) What Downed means: heal, revive, or Forced Retreat home. (2) Base rest: the survivor resumes at 80% HP once stress is below 50. (3) Prepare: a quest-log pointer to one item craftable right now, so the next run visibly lasts longer | Show, then explain (tutorial §2.2). The pointer gives the player an immediate, visible win |
| Tutorial skipped `[DECIDED Oct 10, U13]` | The splash still shows (it is a game event), but the tutorial steps do not auto-run; "?" replays them | Respects the skip without hiding a major event |
| First Downed softened `[DECIDED Oct 10, U12]` | The first Downed keeps the whole haul once, with the explanation (tutorial open question 4) | FX1 makes early Downs more frequent, so the first should teach, not punish. Sam: these are the starting items the tutorial provides |

**Tutorial spec impact (at fold):** §4 gains a beat "First Downed" (it can occur anywhere from Beat 2 onward); §6 adds a disclosure row "Downed and Forced Retreat → first Downed → in place or splash"; §8 "Player is downed in the first run" points here; §11 Q4 becomes `[DECIDED Oct 10, U12]`.

---

## 3. The tutorial as a guide through the first session

### U11 `[CONCEPT Oct 10]`: narrated finds point to other tabs
The idle Wandering log in the first session narrates notable finds and points the player at the tab where they matter: *"You found a dirty padded jacket"* → equip it in Stockpile; *"Here are some components. Why not take a look in the Crafting menu?"* → Crafting. The first session walks the player through the tabs by what the survivor finds, not by a menu tour.

*Why:* this is show-then-explain at the scale of the whole game. Each tab appears at the moment it has something useful in it, which is the tutorial spec's progressive disclosure (§6) carried by events.

`[PROPOSED]` details:
- These finds are **scripted** (placed, not rolled) in the first session, the same way the first Campsite is (tutorial §2.5). Teaching must not depend on luck.
- Each pointer is one log line plus a highlight on the target tab, shown once per save; the survivor keeps working.
- Sam expects the tutorial to need several rounds of revision. The finds and their order live in the tutorial data table (§9.1), so revising them is a data edit.

### U14 `[CONCEPT Oct 10]`: skipping the tutorial forfeits its items
The starter items come **through the tutorial**. A player who skips the tutorial does not receive them. Skipping becomes the game's first real choice, with a cost the player learns from.

**This reverses a locked rule.** Tutorial spec §3.2 has the starter kit "granted at save creation `[DECIDED Oct 1]`", and the code does that today (F1). U14 supersedes it once Sam locks the details below.

Risks to settle before this is a build rule `[OPEN]`:

| Risk | Proposal |
|---|---|
| **Dead end at the Fort.** The Hearthguard want medicine. A skipper has no med kit. `[CODE]` There is **no med kit recipe**: the only sources are the Shop ("Field Medkit ×3", needs 1,500 distance, `economy.js:225`) and a faction contract reward (`factions.js:45`). The tutorial spec says the recipe is available from the start `[DECIDED]`, but it isn't implemented | A first-session med kit recipe must exist before U14 ships (it is already owed by tutorial §4 Beat 6). The diplomat and command checks stay open. **No dead ends** is a pillar |
| **An uninformed choice punishes, it doesn't teach** | The skip button says what is given up: *"Skip the tutorial? You'll start without the survivor's kit."* Then the cost is a decision, not a surprise |
| **Experienced players** (second saves, Steam-to-mobile transfer) are the ones who skip | Accept the cost (it's a choice), or let a save that has completed the tutorial once grant the kit on skip. Sam decides |
| **Replay exploit.** "?" replays steps | Replaying never grants items again. Items are granted once per save, by flag |
| **Old saves** already hold the kit | Unchanged; the flag `zi_starter_kit_given` already prevents a second grant |

**How U11 and U14 fit together** `[PROPOSED]`: the tutorial grants its items **as the scripted finds** in U11. The dirty padded jacket, the components and the weapon are found on the first runs, and each points to a tab. Skipping removes the scripted finds, and with them the items. One mechanism does both jobs.

**What this means for H2:** with U14, Scenario A (the real new save, no kit) is the player who **skipped**, and Scenario B is close to the player who **completed** the tutorial. H2 would then measure the cost of skipping directly. Worth considering when H2 is drafted.

## 4. Open for Sam

1. **U10:** B's weapon: Nail Bat (recommended), Iron Knuckles, or a new pocket knife.
2. **U14 details:** the skip warning; experienced players; confirm that the tutorial items arrive as scripted finds (U11).
3. **Starter kit as designed:** the code grants the kit unequipped, with no weapon and no food (F1). Should the tutorial equip the pouch and grant a weapon and food (§3.2), or does U11 replace §3.2's starting loadout with finds?

## 5. Patterns used (for Sam)

- **Testing the promise.** A simulation scenario is most useful when it tests something you tell the player. "Preparation pays off" is now a claim the harness measures.
- **Teachable moment.** Tutorial text sticks best right after the event it explains. Front-loaded warnings are skimmed.
- **Fail forward.** A setback that comes with a clear next step reads as progress. The same setback without one reads as a wall.
- **Reward framing beats penalty framing.** "Finish the tutorial and you get the kit" and "skip it and you lose the kit" are the same mechanic, but players feel losses about twice as strongly as gains (loss aversion). If you want the lesson without the sting, present it as the reward and keep the skip warning factual.
