# Zed Idler — The Elder Jester and the Starter Kit (Concept Brief, Oct 10)

**Status:** U14 (refined), U16–U19, U21–U23 `[DECIDED Oct 10]`; U15, U24 `[CONCEPT Oct 10]`; details `[PROPOSED]`; J6, J7 `[DECIDED Oct 10]`.
**Renamed Oct 10 (J1):** the character is **the Elder Jester**. "Mystic Jester" is retired; this file replaces `mystic-jester-concept.md`.
**Supersedes:** U8's Scenario B loadout and U10 (`scenario-b-and-first-downed-oct10.md`); tutorial spec §3.2 "starter kit granted at save creation `[DECIDED Oct 1]`"; tutorial Beat 5 "Rumor of the Fort" as the way the player learns of the Fort.
**Folds into:** `tutorial-first-session-spec.md` (next tutorial batch) · `sim-harness-v1-brief.md` D11 (H2 draft) · `wandering-fort-scene.md` (gate offering) · spec §2.5 (the first Fort's place in the tutorial).

---

## 1. The idea

The survivor meets **the Elder Jester** on the first Wandering run. The Jester gives the starter kit, lets the player choose a starter weapon, and sends the survivor to the first Fort with a delivery quest. The tutorial ends when the survivor approaches the Fort. The Jester stays in the game afterwards as a companion who helps in times of need and steers the player back onto the main story.

*Why this works:* one character carries four jobs that were separate before: the starter kit (U14), the first Campsite discovery (tutorial Beat 3), the Fort lead (Beat 5) and the no-dead-ends safety net. A guide with a face teaches better than a pop-up, and the player gets a reason to come back to the story.

---

## 2. Decisions

| # | Decision | Why |
|---|---|---|
| **U15** `[CONCEPT]` | **The Elder Jester** is a companion met during the tutorial. It helps in times of need and corrects the player's path when they drift from the main story. It does **not** leave when the tutorial ends | A persistent guide is the in-world form of the "no dead ends" pillar |
| **U16** `[DECIDED]` | **The starter kit arrives only through the Jester:** armor (an old, dirty padded jacket), a weapon (U17), food, a med kit, **plus the handmade pouch and scout kit (U22)**. The Jester then gives a quest: take the med kit to the Fort | One source, one moment. The med kit is the Hearthguard's offering, so the delivery *is* the Fort's "something they want" (Fort brief §10–11) |
| **U17** `[DECIDED]` | **Starter weapon choice of three:** Nail Bat, Iron Knuckles or Pocket Knife, picked from the Jester like a classic monster-collector starter. Closes U10 | A first decision the player owns, with no wrong answer if the three are balanced (§4) |
| **U18** `[DECIDED]` | **The tutorial ends at the Fort's approach.** The gate scene, Fallow Ground and the turn-in are main story, not tutorial | The tutorial teaches systems; the Fort starts the story. Skipping the tutorial no longer skips story |
| **U14** `[DECIDED, refined]` | Skipping the tutorial is allowed. The skip button warns: *"You will not have access to an early, easy start."* A skipper does not get the Jester's kit | The skip is an informed choice with a stated cost |
| **U19** `[DECIDED]` | **U11 and U14 are one system.** The tutorial's items arrive through the Jester encounter and the narrated finds (U11); skipping removes both. **H2 measures the cost of skipping directly** (§5) | One mechanism; H2 tests the promise "doing the tutorial gives an easier start" |

---

## 3. The first session, revised `[PROPOSED]`

| Beat | What happens | Replaces |
|---|---|---|
| 1 Day One (Traversal) | Unchanged | — |
| 2 First Wandering, policy | Unchanged | — |
| **3 The Jester's camp** | The scripted first discovery is the Jester's camp. *Venture closer* teaches the prompt, timer and scout. Inside: the Jester, the starter pick (U17), the kit (U16). Each item points to its tab (U11): equip the jacket and weapon → Stockpile; food → Food slot; the med kit → pockets | Beat 3 scripted Campsite |
| 4 Return report | Unchanged | — |
| **5 The Jester's quest** | The Jester names the Fort and marks it on the Traversal grid: bring the med kit there | Beat 5 Rumor of the Fort |
| **End: the Fort's approach** | Reaching the Fort square ends the tutorial (U18). The gate scene begins as story | Beats 6–8 leave the tutorial |

- **If the player ignores the Jester's prompt:** the policy default must not skip the kit. The Jester's camp is the one discovery that **waits while the survivor keeps patrolling**, re-offered on the next run. Rules §4.5 is met because the run never stalls; only the kit waits. `[PROPOSED]`
- **First Downed (U9, U12, U13):** the Jester delivers the "hard at first" line in the splash. Same moment, now with a speaker.

---

## 4. Starter weapons

Identities `[DECIDED Oct 10, U20]`: Nail Bat = heavy, slow hits; Iron Knuckles = fast hits that stagger; Pocket Knife = quiet, better at getting away, small scavenging bonus. Balanced numbers, the simulation and the batch are in **`starter-weapons-cb1-slice.md`** (CB1). Balance is a combat decision outside H2.

## 5. H2 under U19 `[PROPOSED]`

| | Scenario A: skipped | Scenario B: completed tutorial |
|---|---|---|
| Survivor | Real new save, no Jester kit | Same survivor + the Jester's kit (padded jacket, starter weapon, food, med kit) |
| Measures | Forced retreats per day, run length, haul banked per day, time resting | Same, compared with A |
| Question | — | How much easier is the start for a player who did the tutorial? |

**Runs `[DECIDED Oct 10]`:** B runs **once per starter weapon** (B-Bat, B-Knuckles, B-Knife), which also checks that no starter is a trap. 80 runs `[DECIDED Oct 10, J7]`.

**H2 now also waits for CB1:** B per weapon measures nothing until the three weapons differ in code.

**Until the Jester exists in code,** B is a simulation fixture granting the same items (D11 allows declared fixtures). The Pocket Knife's item data comes from CB1.

---

## 6. Code impact (when built; not a batch yet)

- `ZI.ensureStarterKit` at save creation (`game/save.js`, `game/items.js:435`) is replaced by the Jester's grant. Old saves keep what they have (the `zi_starter_kit_given` flag already prevents a second grant).
- New: a Jester encounter (scripted discovery), a starter-choice screen, a `zi_jester` save key (met, kit given, companion state), and the **quest med kit** (U21): a story item that cannot be used. The Pocket Knife comes from CB1.
- Replaying a tutorial step ("?") never grants items again.

---

## 7. Sam's answers (Oct 10) and what is still open

| # | Answer | Recorded as |
|---|---|---|
| J1 | The name is **the Elder Jester** | `[DECIDED Oct 10]` |
| J2 | The handmade pouch and scout kit also come from the Jester; nothing is granted at save creation | **U22** `[DECIDED Oct 10]` |
| J3 | A player who skipped meets the Jester later, without the kit, for the story-correction role | **U23** `[DECIDED Oct 10]` |
| J4 | **The first med kit is a locked quest item.** It cannot be used; it can only be delivered to the Fort | **U21** `[DECIDED Oct 10]` |
| J5 | The Jester is **not a rescuer.** He is a guardrail: he keeps the player inside the story's bounds and is the in-world voice for the policies and rules, now and as they grow. Detailed in a later session | **U24** `[CONCEPT Oct 10]` |
| H2 | Scenario B once per starter weapon | `[DECIDED Oct 10]` |

**How U21 works** `[PROPOSED]`: the quest med kit reuses the existing **story item** rule (spec §14.1, §14.3): weight only, no pocket, cannot be dropped, sold, used or lost to a Forced Retreat until the quest ends. *Why:* the rule already exists and is implemented (`ZI.isStoryItem`); no new item behavior is invented. It also removes a failure path from the tutorial spec ("arrived with no med kit because the charges were used"), since the quest kit can't be used.

**Consequences to accept** `[PROPOSED]`:
- The starter kit has **no usable heal kit.** Early healing comes from the daily base charges (2 heals per day `[CODE]`). That fits "hard at first".
- **The skipper's dead end closes through U23:** when a skipper meets the Jester, he hands over the quest med kit only (no starter kit), so the Fort's story is reachable for everyone. Skipping skips the easy start, never the story (U18).

**Still open**
- **J6, the first meeting `[DECIDED Oct 10]`:** the survivor **wakes up after being Downed** and the scene composes, with blurred vision clearing, on the Elder Jester standing in front of them at his camp. He gives the kit there. **The first in-game Downed is his second appearance** (the optional, saint-like conversation, U9). *Why:* the meeting is scripted, so the kit never depends on chance, and the wake-up explains why a stranger is holding your gear. `[PROPOSED]` placement: the wake-up scene opens the Wandering tutorial in place of the Beat 3 camp discovery. `[PROPOSED]` for skippers (U23): they meet him later at his camp, awake, with no wake-up scene.
- **J7, H2 run count `[DECIDED Oct 10]`:** **80 runs** (Scenario A + three B variants × 4 policies × 5 seeds). The rest of H2's details are settled when H2 is drafted.

## 8. Patterns used (for Sam)

- **Diegetic tutorial.** The teaching comes from a character inside the world instead of UI pop-ups. Players accept "the old man gives you a sword" far more easily than a tooltip.
- **Starter choice.** Three balanced options with distinct identities give the player ownership on minute five. The rule: sidegrades, never upgrades.
- **Guide as safety net.** A companion who knows the main story is how open games avoid dead ends without hand-holding. *Watch:* it must speak rarely. A guide who comments on everything becomes noise, the same rule as prompts (rules §4.5).
