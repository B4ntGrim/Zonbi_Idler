# Zed Idler — JD1 First Displacement: Meeting the Elder Jester (Slice Brief)

**Status:** **JD1a CLOSED Oct 15** (`reference/archive/jd1a-batch.md`; rules built, switch off for players). **JD1b** (the scene) not yet drafted; queued after H2. Original status: Slice `[PROPOSED]`, Oct 10. All direction below is `[DECIDED Oct 10]` by Sam (U14–U37); details marked `[PROPOSED]` or `[OPEN]` need Sam's lock or Code's facts. **Not a build input until Sam locks it.** Split into two batches: **JD1a** (rules, headless) and **JD1b** (the scene on screen).
**Inputs:** `elder-jester-concept.md` §2a (U28–U36) · `elder-jester-narrative-draft.md` (voice, scene draft; not locked) · `fx1-hp-floor-slice.md` (Downed path) · R1 (Forced Retreat, rest) · `starter-weapons-cb1-slice.md` (Pocket Knife item) · `tutorial-first-session-spec.md` (to be folded).
**Tags:** `[DECIDED]` Sam · `[PROPOSED]` draft · `[OPEN]` needs a decision or fact · `[CODE]` current build

---

## 1. Next slice

A tutorial player's **first Downing** becomes their first meeting with the Elder Jester. Instead of the usual Forced Retreat to Base, the survivor wakes at his camp 3–5 squares away. He has scavenged everything they carried, and in exchange, in dialogue, he gives them the starter kit and a choice of three weapons. They rest at his camp. He leaves 3–5 game days later.

*Why now (after FX4, before H2):* H2's Scenario A is "the player who skipped the tutorial" and B is "the player who completed it" (U19). Today every new save still gets the starter kit at creation `[CODE]`, so neither scenario matches the design. JD1a makes the real new-save start and the real tutorial hand-over exist in code, so H2 measures the actual game instead of a fixture.

---

## 2. Decided constraints

| # | Rule | Source |
|---|---|---|
| Kit source | The starter kit comes **only** from the Elder Jester: padded jacket, the chosen weapon, food, the quest med kit, handmade pouch, scout kit. Nothing is granted at save creation | U16, U22, U30 |
| Weapon pick | Three choices: Nail Bat, Iron Knuckles, Pocket Knife (CB1 stats) | U17, U29, CB1 |
| When | The **first Downing** of a tutorial player is the first meeting. No earlier meeting | U28 |
| Relocation | The survivor wakes at his camp on a randomly chosen square **3–5 squares away, within the same grid**. Their real map position changes | U31, U32 |
| Rest | The camp is a rest spot; the survivor rests there from 1 HP until the resume gate (80% HP, stress < 70; PF1 Oct 16) | U33, FX1, U27 |
| The trade | **All items the survivor carries are lost to the Jester** (the haul and carried items). In exchange, in dialogue, he gives the kit and the choice of 3 weapons | U34, **U37** |
| Camp clock | His stay is 3–5 game days and **starts when the survivor arrives**. Then the camp is gone | U35 |
| Exactly once | Once per save; survives a reload mid-scene; seeded RNG | U36, H1 |
| Skippers | A player who skipped the tutorial does **not** meet him at their first Downing. That Downing is an ordinary Forced Retreat to Base under the Batch 3B rules. They meet him later, without the kit | U14, U23, **U37** |
| Quest med kit | The kit's med kit is a locked quest item: it can't be used, only delivered to the Fort | U21 |
| Skip warning | Skipping the tutorial says: "You will not have access to an early, easy start." | U14 |
| Writing rule | The Jester never states a false fact (proposed rule; Sam's direction for review) | narrative draft §3 |

**U37 `[DECIDED Oct 10]`:** U12 ("the first Downing keeps the whole haul") is **retired**. For a tutorial player the first Downing loses everything carried to the Jester (U34). A skipper's first Downing gets no special softening.

**Unchanged:** FX1 (HP floor, Downed path), all other Downings (Forced Retreat to Base), R1 retreat rules, FX2 offline cap, CB1 weapon stats, save version policy (any new key is additive).

---

## 3. What happens, step by step

1. A tutorial player (has not skipped; has not met the Jester) is Downed with no heal or revive.
2. **Instead of** `ZI.forcedRetreat(state, 'downed')` sending them to Base, the first-displacement path runs:
   - choose the camp square (seeded): 3–5 squares from where they were Downed, same sector, eligible (§4);
   - **all non-story haul and carried items are removed** and recorded as "taken by the Jester";
   - the survivor's map position becomes the camp square; rest starts there (`restAt: 'camp'`), from HP 1;
   - the camp is saved with its arrival time and a stay of 3–5 game days (seeded);
   - a **pending scene** flag is set.
3. The scene plays the next time the player is on the Wandering screen, or on return before the return report (U9, U13). It is the "hard at first" moment.
4. In the scene the Jester gives the kit (equipped where it fits: jacket on Body Armor, pouch on Pack, food in the Food slot; the scout kit and quest med kit carried) and offers the three weapons.
5. ~~**The weapon choice is the scene's one prompt.** Rule: nothing waits on the player (design rules §4.5). `[PROPOSED]`: the survivor keeps resting while the choice waits. If rest finishes and no weapon is chosen, the Jester chooses by the standing policy and says so (Ethical or Immoral → Pocket Knife; Criminal or Heinous → Nail Bat; this follows CB1's leanings). `[OPEN]` for Sam.~~ **Superseded by U38 `[DECIDED Oct 13]`** (Sam): the first meeting's scene and choices **appear only while the player is playing**; if the player isn't there, they never appear on their own and the Jester never chooses for them. In the scene the player chooses **one of the three weapons**, by clicking around and interacting with the Jester. **U39 `[DECIDED Oct 13]`:** the scene does **not** offer or change the standing policy; that system stays independent of the Jester (a later link is out of scope). This holds only for the first meeting. A deliberate exception to design rule §4.5 ("nothing waits on the player"): a once-per-save story beat for a player who is present. Follow-ups settled Oct 13: **U38a** `[DECIDED]` after the offline rest at the camp, Wandering pauses until the player returns and completes the meeting (intentional exception to automatic continuation); **U38b** `[DECIDED]` the departure clock starts when the meeting plays, with its start and stay length saved. U38c withdrawn by U39. **JD1a batch draft for review: `reference/jd1a-batch-draft.md`** (supersedes §7's JD1a draft).
6. When rest completes, the survivor resumes wandering **from the camp square**.
7. After 3–5 game days from arrival the camp is gone. Later appearances are a separate design (parked).

---

## 4. Open facts for Code (JD1a step 1)

Design doesn't guess these (rules §8).

- **TQ-JD1a** How the map grid is stored and which squares are "locked" or "contested" (`ZI.worldCell`, unlocked zones, `zi_trav_pos`). How to test that a square is reachable without crossing a locked or contested one.
- **TQ-JD1b** What "the same grid" maps to in code (answered Oct 13: an 8 × 6 sector, `SECTOR_COLS` 8 / `SECTOR_ROWS` 6; see `jd1a-batch-draft.md` §2a). What to do when fewer than one eligible square exists 3–5 away (edge of the sector, locked area). `[PROPOSED]`: widen to the nearest eligible square in the same sector; if none, use the start square.
- **TQ-JD1c** Is there a saved "tutorial skipped" flag today (`zi_tut_progress`)? If not, the smallest additive flag.
- **TQ-JD1d** Where the Downed Forced Retreat decides "rest at Base" (`forcedRetreat`, `restAt`) and how the Wandering run's position relates to the Traversal position. Both must agree after waking (one position, not two).
- **TQ-JD1e** How removing `ZI.ensureStarterKit` from save creation affects old saves (they keep what they have; the `zi_starter_kit_given` flag) and every test that expects the kit.
- **TQ-JD1f** Does a "rest at a non-Base spot" already exist (checkpoint rest, R1)? Reuse it for the camp if so.

---

## 5. Parked and out

The Jester's later camps and return triggers · the rat as a game object · his long arc and secret agenda · the Fort delivery quest changes · the full tutorial rewrite (narrated finds U11, tab pointers) · 2D art · voice and dialogue polish beyond the first scene · recipes.

---

## 6. Spec impact (when JD1 closes)

- **Spec §13.8 (Batch 3B note):** add "Exception: a tutorial player's first Downing is the first displacement (JD1)".
- **Tutorial spec §3.2:** the starting loadout is replaced by "nothing; the kit comes from the Elder Jester at the first Downing". §4 Beats 3 and 5 rewritten around U28.
- **New spec section 16 "The Elder Jester":** first displacement rules and data (distance 3–5, stay 3–5 days).

---

## 7. Proposed batches

### BATCH JD1a — First displacement (rules, headless)

**Goal.** The first Downing of a tutorial player relocates them to the Jester's camp, takes everything they carry, grants the starter kit, and runs the camp clock. Everything testable without the screen.

**Decided behavior** (`[DECIDED Oct 10]`)
1. New saves receive **no** starter kit at creation (U16, U22). Old saves keep what they have.
2. A tutorial player's first Downing with no heal or revive runs the first-displacement path instead of the Base Forced Retreat (U28, U31).
3. Camp square: 3–5 squares from the Downing square, same grid, eligible; chosen with the seeded RNG (U32, U36).
4. All non-story haul and carried items are removed and logged (U34, U37). Story items are never taken (existing rule).
5. Position moves to the camp square; rest runs there from HP 1 under the normal resume gate (U33, FX1).
6. The kit is granted: padded jacket, food, quest med kit (story item, unusable), handmade pouch, scout kit; plus the weapon the player picks (U30, U21). The grant is a rule function the scene calls; JD1a tests call it directly.
7. Camp stay 3–5 game days from arrival, on the simulation clock (U35, H1, FX2).
8. Exactly once per save, reload-safe (U36). Skippers never take this path (U23, U37).

**Likely files.** `game/active.js` (Forced Retreat branch) · `game/items.js` (kit grant, quest med kit item, remove the creation grant) · `game/save.js` (new-save path) · `game/world.js` (square selection) · `game/wandering.js` (only if the run's position needs it) · new `tests/jd1a-first-displacement.test.js` · `CODE_STATE.md`.

**Acceptance checks**
1. A new save has no starter kit items in stash, carried or loadout.
2. Tutorial player, first Downing, no heals: position changes to a square 3–5 away in the same grid; `restAt` is the camp; HP 1; resting.
3. Over 1,000 seeds the camp square is always eligible (unlocked, reachable, same grid, 3–5 away or the documented fallback).
4. Every non-story carried and haul item is gone and listed as taken; story items remain.
5. The kit grant gives exactly the U30 items; the quest med kit can't be used for a heal.
6. The second Downing of the same save is an ordinary Forced Retreat to Base.
7. A skipper's first Downing is an ordinary Forced Retreat to Base, with Batch 3B haul loss.
8. Save and reload at each point (after the Downing, before the grant, after the grant) resume identically; relocation never repeats.
9. The camp exists for 3–5 game days from arrival, then not; offline time counts the same (FX2).
10. Same seed → same camp square and stay length; watched, offline and headless give the same result.
11. ~~Old saves (with the old kit) load unchanged and still trigger the displacement once if the player hasn't met the Jester. `[OPEN]` for Sam: or should old saves skip it?~~ **U40 `[DECIDED Oct 13]`, part:** decide from `zi_starter_kit_given` or other reliable evidence; never grant twice. Whole meeting vs reward only: open (draft §3 Q1).

**Explicitly out.** The scene UI (JD1b), the weapon-choice prompt UI, later Jester camps, the Fort quest, the tutorial rewrite, CB1 stats.

**Required verification.** All suites (expect tests that assume the creation kit to need **authorized** updates, listed in step 1); new suite; r1 checks 20 and 26 unchanged; sim-clock-rng ×5; differential: only first-Downing and new-save-kit behavior differs.

### BATCH JD1b — The scene (outline; drafted after JD1a closes)
The camp scene on the Wandering screen and the off-screen splash (U9, U13); the Jester's dialogue (first displacement script, truth-checked against game state); the three-weapon choice prompt with its timer and policy default (§3 step 5); the weapon-choice record for later callbacks. Browser check on the TEST SAVE.

---

## 8. Queue placement

**CB1 → FX3 → FX4 → JD1a → H2 → JD1b.** JD1a needs CB1 (the Pocket Knife item). H2 needs JD1a so Scenario A (skipped) and B (completed) are the real starts. JD1b is screen work and doesn't change H2's numbers.

---

## 9. Patterns used (for Sam)

- **Trade, not punishment.** The first loss is exchanged for something, so the setback carries meaning instead of only cost.
- **Rules first, scene second.** JD1a makes the rules exist and testable headless; JD1b puts the story on top. If the scene changes later, the rules don't.
- **Every prompt has a default.** Even a story choice can't stall an idle game; the Jester choosing for an absent player is itself a character beat.
