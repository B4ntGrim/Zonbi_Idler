# Zombie Idler — The Fort Scene (Design Brief)

**Companion to:** `wandering-tab-spec.md` (v2.1). Read that first; this document only adds the Fort.
**Status:** brainstorm started. Everything under "Locked constraints" is decided; everything else is a proposal or an open question.
**Read Section 10 first.** It supersedes the parts of Sections 1-5 that assumed the Fort was a random discovery that unlocks Heinous.
**Tags:** `[DECIDED]` confirmed by Sam · `[PROPOSED]` draft · `[OPEN]` needs a decision

---

## 1. Purpose

The Fort is the one-time threshold where a survivor first gains access to the **Heinous** policy. It is a rare discovery on Traversal squares. Choosing to venture closer is the player's own decision, made while present.

*Why it matters for design:* Heinous is the darkest and most rewarding policy, and every faction turns hostile while it is active. Unlocking it should feel like crossing a line, not clearing a checklist. The scene is where the game tells the player what that line is.

---

## 2. Locked constraints (from the spec) `[SUPERSEDED IN PART: see Section 10]`

| Rule | Source |
|---|---|
| The Fort is a **discovery**: a site the survivor comes across during a run on a **Traversal square** | Spec 2.5, 13.2 |
| Rolled at **low odds** (start 2%, plus a +0.25% pity step per roll without it, reset on unlock) | Spec 2.5, 12.4 |
| Rolled **only while the player is present** on the Wandering screen. Never by the background engine or offline catch-up | Spec 13.2 |
| Prompt: *"Venture closer?"* with a **90 s timer**. If unanswered, it resolves to **Move on** for every policy, with no penalty. It can be rolled again later | Spec 13.2 |
| **Venture closer** is the choice that sets `heinousUnlocked = true`, permanently | Spec 2.5 |
| **Risk tier: High.** Best cache tier in the game | Spec 13.2 |
| **Scout** works on it (Discovery level controls how much it reveals) | Spec 13.3 |
| Stress and gear wear apply as in any run. A failed venture adds stress | Spec 13.5, 13.8 |
| Faction-owned sites never change standing | Spec 13.9 |
| Difficulty (Easy/Normal/Hard) is fixed at save creation. Hard adds gear loss on a forced retreat | Spec 15 |
| Heinous unlock is **not** based on a criminal standing threshold | Sam, Sep 29 |

---

## 3. What we already know about Heinous (from the spec) `[still valid]`

- Feeds combat and endurance; pool includes ambushing convoys, raiding settlements, interrogating captives, stripping the fallen (spec 2.3).
- Largest raw loot, worst reputation. Every faction turns hostile while it is active.
- Stress multiplier ×1.3.
- The Lodge remains reachable as the neutral broker (clamped at Wary, never Hostile).
- A player can leave Heinous at any time; the policy-switch cooldown does not apply when leaving it.

---

## 4. Open design questions (work through these in order)

### 4.1 What is the Fort?
Lore and identity. Who built it, who holds it now, and why does going closer change what the player can do?
`[OPEN]` Is it tied to one of the six factions, or independent of all of them? (Constraint: it never changes standing, so ownership would be flavor only.)

### 4.2 What does "venture closer" involve?
`[OPEN]` One risk roll like any other venture, or a short multi-step scene? Options:
- **A. Single roll.** Fast; the unlock is the reward. Easy to build, less memorable.
- **B. Short scene (3-4 beats).** Approach, look, threshold choice, aftermath. Memorable, more content to write.
- **C. Hybrid.** A risk roll to get in, then one story choice inside.

### 4.3 What is the actual choice?
`[OPEN]` Is unlocking automatic on success, or does the scene ask the player to *accept* something (for example, to take part in or witness an act)? If there is a choice, what does refusing do? (Suggested default: refusing leaves the Fort rollable again, with no penalty.)

### 4.4 What does the player get besides Heinous?
`[OPEN]` The best cache tier is locked. What is in it, and is it gated by the risk roll? Is there a unique item or story item tied to the Fort?

### 4.5 What does failure look like?
`[OPEN]` Uses the venture failure penalties (HP loss, lost supplies, ambush, lost run time), scaled to High risk, plus stress. Does failing still let the player try again later (yes by default)?

### 4.6 How does the scene read at each policy?
`[OPEN]` The unlock is one-time, but the player arrives under Ethical, Immoral or Criminal. Should the text differ by current policy?

### 4.7 After the unlock
`[OPEN]`
- Is the Fort still visitable? (Suggested: it becomes a known site; revisits use the standard venture rules.)
- Is there an in-world change when Heinous first turns on (a message, a banner, a faction reaction)?
- Is there a Camp Leader version (a camp leader choosing for a whole camp)? Park for later.

### 4.8 Presentation
The game uses a terminal/monospace look. The scene should be text-forward and short, with the prompt appearing as a log entry the player must notice. `[PROPOSED]` a sample format is in Section 6.

---

## 5. Starting concepts to react to `[PROPOSED]`

These are prompts for discussion, not decisions. Keep, merge, or discard.

**Concept A: The Ledger.** A fort that looks like any other, but its gatehouse holds a ledger of what its last occupants did to stay alive. The threshold choice is whether to read it and sign on.
*Strength:* small scene, strong theme (complicity). *Risk:* needs good writing.

**Concept B: The Pen.** A fort where a faction kept infected as leverage. Going closer means learning how the horde was controlled and what was done to feed it.
*Strength:* ties into the zombie world and horde design. *Risk:* leans on a faction, which conflicts with "no standing change."

**Concept C: The Toll.** A fort whose garrison offers survivors safety in exchange for one act. The scene is a negotiation; Heinous unlocks when the player accepts.
*Strength:* a real choice with a clear cost. *Risk:* more branching to build.

---

## 6. Sample prompt format (terminal style) `[PROPOSED]`

```
[TRAVERSAL C4] > Structure sighted: FORT
  Risk: HIGH        Reward: BEST
  Scout charges: 2  Stress: 34/100
  > VENTURE CLOSER     > MOVE ON        (90s)
```

Timer expires -> `> Moved on.` Fort re-enters the roll pool.

---

## 7. Integration notes (for the developer)

- Data: a `FortEncounter` entry in the discovery table, flagged `TraversalOnly` and `PlayerPresentOnly`.
- Roll: a `FortService.Roll(square, rng, playerPresent)` that returns false when `playerPresent` is false.
- State: `zi_heinous_unlocked` (bool) and `zi_fort_pity` (float), both saved automatically as `zi_*` keys.
- Unlock: set once, never cleared. Heinous appears in the policy selector when true.
- Scene content lives in data (text, choices, outcomes), not in code, so it can be edited without a rebuild.

---

## 8. Where we left off

- Spec is at v1.7 with policies, decay, factions, hexagon, discovery prompts, stress, carrying, and difficulty all decided or tuned as starting values.
- Numbers in both documents are starting values and will be tuned by playtesting.
- Next step: work through Section 4 above, starting with **4.1 (what the Fort is)** and **4.2 (how the scene plays)**, then draft the scene text for the chosen concept.

---

## 9. Revision: the Fort as a faction gate (Sam's answers to 4.1 and 4.2)

**Status:** recorded as Sam described it. Items in "Conflicts to resolve" must be settled before the spec is changed.

### 9.1 What Sam described `[DECIDED as concept]`

**4.1, what the Fort is:**
- A colony or base held by **hostile human NPCs** who will not let the survivor in unless the survivor has **something they want**.
- It is the survivor's **first encounter with a colony** they might join, and it opens a **dialogue** into the story.
- Possible outcomes: **rejected**, **accepted**, or **sent on a quest**. The outcome depends on the survivor's **standing and policy** (Heinous or one of the other three).
- Its purpose is to **give quests**. It belongs to the **initial faction** the journey starts with.
- Later, a story **event introduces a second faction that opposes this one**.

**4.2, how the scene plays:**
- Visuals: **wooden pike fencing, a guard, and a dialogue box**.
- A survivor who is **neutral or estranged** (not Heinous) can get a **quest** that grants access to factions.
- Until then, the **Factions page is locked**. The player does not have access to factions right away, only to this Fort.

### 9.2 Conflicts to resolve `[OPEN]`

1. **Heinous unlock.** Until now the Fort was the trigger that unlocked Heinous. In the new version the survivor can arrive as Heinous, which means Heinous was already unlocked. What unlocks Heinous now? Options: a later fort event; an attack on the Fort (the fourth exit of the scene); a deed elsewhere in the game.
2. **RNG gating.** The Fort was a low-odds random discovery (2% plus pity). It now gates the Factions page, which is core progression. A random gate can stall a new player. It needs a guaranteed placement (a fixed Traversal square near the start, or a hard ceiling on the pity counter).
3. **Locked Factions page.** In the current code all six factions exist from the start, with starting reputations already set (Iron March 240 "Known", Dustwalkers 90, Concordance 0). A locked Factions page means faction NPC encounters and contracts for locked factions must also be gated, and starting reputations reset to 0 until introduced.
4. **Which faction is first?** Not yet chosen. The wooden fence fits a farming or homestead faction better than a bunker faction.
5. **"Neutral or estranged, but the least of the four."** Unclear reading. Proposed: the quest is offered to survivors whose standing is Stranger (neutral) or Wary (estranged), and not to Heinous.

### 9.3 Proposed answers to help decide

- **Who counters the first faction?** The hexagon already defines it: the counter faction is the one that is *strong against* the first faction (the previous faction in the clockwise cycle). Later story events can introduce that faction.
- **What "something they want" is:** a distinct item in the survivor's pockets (a story item or kit), so the Fort connects to the pocket system. Skill checks (diplomat, command, trading) can substitute for it.
- **Policy shapes the greeting, not only standing:** at first contact standing is 0 for everyone, so policy is the main difference.

| Policy on arrival | Suggested reception |
|---|---|
| Ethical | Tested, then welcomed; quest offered |
| Immoral | Suspicious; quest offered with harder terms |
| Criminal | Turned away, or offered a dirty job |
| Heinous | Refused or driven off; no quest |

- **A fourth exit for the scene:** attack the guard or the fence. Consequences: the first faction turns Hostile, and this could be the act that unlocks Heinous (resolves conflict 1). `[PROPOSED]`

### 9.4 New content and integration this implies

- A per-faction unlock state (for example `zi_faction_unlocked`) and a gated Factions tab.
- A first-contact quest chain for the initial faction.
- A dialogue system with conditions on policy, standing, items and skill checks. Content should live in data.
- A later story event that introduces the opposing faction.

---

## 10. Decisions (Sep 30) and scene draft

### 10.1 Conflicts resolved

| Conflict | Decision |
|---|---|
| What unlocks Heinous? | **Killing a guard at the first Fort** `[DECIDED]` |
| RNG gating | **The first Fort is at a fixed Traversal square near the start**, so every player finds it early. It is part of the tutorial `[DECIDED]` |
| Factions vs locked page | **All six factions exist from the start with unequal, world-seeded reputations.** The Factions *page* is locked until the first Fort is resolved `[DECIDED]` (spec 4.6) |
| Which faction is first? | **The Hearthguard** `[DECIDED by design]` |
| Quest standing rule | Quest offered to survivors with Hearthguard standing from Wary up to Neutral (−250 to +249), not Hostile or Hunted, and not under Heinous policy `[DECIDED Oct 1, see 12.6]` |
| Presentation | Wooden pike fencing and perimeter fencing appear in the description and in the dialogue boxes that follow `[DECIDED]` |

### 10.2 Why the Hearthguard

- The world names already include **Hearthguard Farm**, and a wooden pike fence fits a farming colony better than a bunker faction.
- They lean Ethical, so an Ethical survivor gets the smoothest first meeting and other policies feel different.
- The hexagon already gives the later counter-faction: the **Concordance** is strong against the Hearthguard (advanced tech against farmers' tools). So the second faction introduced later is the Concordance, a clean farm-against-lab story, and it fits the RMAT progression that comes later in the game `[PROPOSED]`.

### 10.3 No-dead-end rule (final, per Sections 11 and the audit)

The Factions page opens when the **quest is turned in**, or at once, in a hostile state, when the **guard is killed**.

| Exit | Result |
|---|---|
| Offering accepted, quest given | Quest Fallow Ground starts; the page opens when the quest is turned in |
| Quest turned in | Page opens; Hearthguard first |
| Turned away (no offering, checks failed) | Page stays locked; the survivor can return with an offering or pass a diplomat or command check `[DECIDED]` |
| Guard killed | Heinous unlocks; the Hearthguard turn Hostile; the page opens in a hostile state; the Lodge remains reachable as the neutral broker |

The survivor is always able to try again, so there is no dead end. The tutorial must make the way in clear.

### 10.4 Scene draft (terminal style) `[PROPOSED]`

**Approach**
```
[TRAVERSAL B2] > Structure sighted: PALISADE
  A ring of sharpened wooden pikes. Perimeter fencing, patched and tied.
  Smoke behind it. A watchtower. One gate.
  > APPROACH                 > SCOUT (2)        > LEAVE
```

**Gate: first contact**
```
GUARD: "Far enough. Nobody comes past the pikes without a reason.
        What do you have that we want?"

  > OFFER: [item in pockets]        (shown only if you carry one they want)
  > TALK: Diplomat check            (read the guard, ask for terms)
  > TALK: Command check             (hold your ground)
  > LEAVE
  > ATTACK THE GUARD                (Risk: HIGH)
```

**Policy changes the guard's tone (first visit)**
| Policy | Guard's line |
|---|---|
| Ethical | "You don't look like a raider. Show me what you carry." |
| Immoral | "Keep your hands where I can see them." |
| Criminal | "We know your kind. What are you selling?" `[OPEN]` whether a Criminal survivor gets the quest on harder terms (proposed) or is turned away or offered a dirty job |
| Heinous | Not possible on the first visit. On later visits: "Not here. Move on." |

**Quest offer (Stranger, Neutral or Wary; not Hostile, not Heinous)**
```
GUARD: "The elder might hear you out. There's a field south of here
        crawling with the dead. Clear it and the gate opens."
  > ACCEPT QUEST      > DECLINE
  Reward: access to the factions.
```
`[PROPOSED]` The first quest is to **clear a nearby Traversal cell** (the 40-kill cleared-cell rule already in the code). It teaches Wandering, and it teaches why cleared ground lowers stress.

**Attack**
```
> You go for the guard.
  Risk: HIGH.  Stress +.  Scout can reveal odds.
  Success: the guard falls. A horn sounds. HEINOUS UNLOCKED.
  Failure: you are wounded and driven from the pikes. You may try again.
```
Success sets `zi_heinous_unlocked`, turns the Hearthguard Hostile, and opens the Factions page in a hostile state.

### 10.5 Tutorial fit

- The tutorial walks the player to the fixed Fort square.
- The tutorial gives the player a small item the Hearthguard want (a med kit is suggested, since medicine is scarce on a farm) so a fair "something they want" is always in their pockets.
- The first Fort teaches: pockets (the offered item), policy (guard's tone), skills (diplomat and command checks), and scouting.

### 10.6 Still open

1. Does "turned away" also open the Factions page, or must the player return?
2. Exact quest: clear a nearby cell (suggested) or another task?
3. Which item do the Hearthguard want, and is it always supplied by the tutorial?
4. What does the attack cost beyond a Hostile Hearthguard (durability, stress, a scar)?
5. How NPCs from locked factions appear before the Factions page opens (suggested: unnamed groups).
6. Camp Leader version of the Fort (park for later).

---

## 11. Quest, offering and cost decisions (Sep 30)

Supersedes the matching open items in 10.6. Where this section and 10.3 differ, this section wins.

### 11.1 The first quest `[DECIDED concept, name PROPOSED]`

- Clearing a nearby Traversal cell is the first quest, using the existing 40-kill cleared-cell rule.
- **The player must return to the Fort for the story to continue.** Turning the quest in is what opens the Factions page (not accepting it).
- It needs a new name that is not "clear a nearby cell". Proposed: **"Fallow Ground"** (farm language; ground made ready to sow). Alternates: "The South Field", "Before the Frost", "Holding the Line".

Quest flow:
1. Gate: the survivor offers something the Hearthguard want (11.2), or passes a diplomat or command check on harder terms.
2. The guard lets the survivor speak to the elder, who gives **Fallow Ground**.
3. The quest assigns one specific Traversal cell next to the Fort.
4. The survivor clears it (40 kills while stationed there).
5. The survivor **returns to the Fort** and turns it in.
6. The story continues and the **Factions page opens**, with the Hearthguard first. Other factions are introduced by later story events.

### 11.2 The offering: a med kit `[DECIDED]`

- The tutorial gives the survivor a **med kit**. Medicine is what the Hearthguard want.
- The med kit is **craftable**, so a player who used theirs up (they are also the heal-charge item, 13.3) can make another.
- Gifting the kit costs the player the heal charges it carried. This is a real trade-off, not a free hand-in.
- **No soft-lock rules `[PROPOSED]`:**
  - The med kit recipe is available from the start.
  - If the survivor arrives without a kit, the guard says plainly what they want ("Medicine. Bring medicine."), and the quest log adds a pointer to craft one.
  - The diplomat and command checks stay available as a substitute on harder terms.

### 11.3 Cost of attacking the guard `[DECIDED concept, PROPOSED numbers]`

Attacking is a deliberate act with costs in three places:

| Cost | Detail |
|---|---|
| Gear wear | Extra gear wear (starting ×2) while the survivor stays in the grid of cells around the Fort |
| Stress | A stress gain on the attack, on top of any failure stress |
| Lasting injury | Damages the skills the survivor uses near the settlement (starting −10% effective level on combat and athletics) until treated |

- The lasting injury is applied on **failure**, and on **success too on Hard**.
- It counts toward the combined **−20% cap** on skill-level penalties (spec 13.8).
- It heals with **treatment**: a med kit or the medical skill, or about 3 days of rest. This gives first aid and medical a use, and it ties to the same med kit the Hearthguard want.
- Success still gives Heinous and turns the Hearthguard Hostile (10.4).

### 11.4 Locked-faction NPCs `[DECIDED]`

Before the Factions page opens, NPCs from locked factions appear as **unnamed groups**. Once the page opens, they resolve to their faction names.

### 11.5 Confirmed (Sep 30) and remaining

**Confirmed:** the quest is named **Fallow Ground** · a survivor turned away without an offering stays locked out of the Factions page until they return and succeed, with the diplomat and command checks as the way in · gear wear, stress, injury size and healing time will be tuned by playtesting · the Camp Leader version of the Fort is parked for later.

**Remaining (content work):** write the full dialogue tree for the gate, the elder and the quest turn-in; write the story beat that follows the turn-in; design the event that introduces the Concordance.

---

## 12. Harder terms and the story beat after the turn-in (added Sep 30 after the first Claude Design build)

Claude Design correctly noted two gaps: "harder terms" was never defined, and the post-turn-in story beat was marked "to be written". This section closes both. Everything here is `[PROPOSED]` until Sam confirms.

### 12.1 What "harder terms" means

The gate has two ways in. Both lead to the quest Fallow Ground, but the terms differ:

| | Offering the med kit | Passing a diplomat or command check |
|---|---|---|
| Kills to clear the cell | 40 (`ZI.CELL_CLEAR_KILLS`) | **60** (×1.5) |
| Hearthguard standing gained on turn-in | +50 | **+25** |
| Med kit | Consumed at the gate | Kept |
| Guard's tone | Warm | Wary; watches the survivor |

Where a Criminal survivor gets the quest on harder terms (open decision C in `wandering-design-audit.md`), the harder-terms row applies whichever way they got in.

*Why:* the offering costs the player a real item (heal charges), so it should be rewarded with an easier quest and more goodwill. The check path costs nothing but effort, so it asks for more effort. Both are fair, and neither is a dead end.

Implementation: store the terms on the quest (`terms: "offering" | "check"`); the kill target and the standing reward read from a data table.

### 12.2 The story beat after the turn-in (draft)

Goal: reward the player, explain what just opened (the Factions page), and end the first session on a hook that leads to the Concordance, the second fully written faction.

**Recommended beat: "The Sealed Crate"**

1. The survivor returns to the gate. The guard opens it. The pikes and perimeter fencing are described from the inside for the first time.
2. The **elder** thanks the survivor for clearing Fallow Ground and gives the standing reward (per 12.1).
3. While clearing the field, the survivor found a **sealed crate** at its edge, stamped with a laboratory mark the Hearthguard do not recognise. The crate is a story item: it adds weight (2 kg) but needs no pocket (see 12.6).
4. The elder unrolls a hand-drawn map: "Five other groups live between here and the ridge. We trade with some. We fear one." The **Factions page opens**: the Hearthguard appear by name, and the other five appear as unnamed groups.
5. The elder asks the survivor to find out who made the crate. This begins the Concordance introduction event (the next quest, to be written).
6. End of first session: a marked Traversal square appears, and the log says a survey team has been seen near it.

Sample terminal lines:
```
ELDER: "You cleared the south field. That is more than most would do
        for a stranger with a satchel of medicine."
  Hearthguard standing +50.
  New item: SEALED CRATE (story item, 2 kg, no pocket).
ELDER: "That mark is not ours. Somebody built this. Find out who."
  FACTIONS page unlocked.
  New marker: SURVEY POINT on the Traversal map.
```

**Alternatives** (for Sam to choose from):
- **B. The Escort.** The elder asks the survivor to escort a trader to the Lodge. Introduces the neutral broker first; slower link to the Concordance.
- **C. The Patrol.** An Iron March patrol arrives at the gate as the survivor turns in the quest. Raises the stakes at once, but introduces a third faction before the second.

`[OPEN]` Which beat, and the elder's name.

### 12.3 Extra gear wear near the Fort after an attack

Claude Design flagged this as unbuilt. It depends on the stress and gear-wear system (spec 13.8), so it should be built after those. The rule (Section 11.3) is that after attacking the guard, gear wear is ×2 while the survivor stays in the grid of cells around the Fort. Suggested radius: the Fort's cell plus adjacent cells, `[PROPOSED]`. It lasts until the survivor clears the Fort's cell again or completes a reconciliation quest (`[OPEN]`).

### 12.4 One number for the map and the quest (added after the second Claude Design build)

Claude Design found a mismatch: on harder terms the map showed the Fallow Ground cell as cleared at 40 kills, while the quest still needed 60. The cause was two rules reading two counters: the map read total kills in the cell, and the quest read kills since acceptance (`baseKills`).

**Rule `[PROPOSED]`:** the map and the quest read the **same** number.
- Each cell has a **clear target**: 40 kills (`ZI.CELL_CLEAR_KILLS`) by default. The Fallow Ground cell's target is **60 on harder terms** (12.1).
- A cell is **cleared** when its total kills reach its target.
- Fallow Ground is **ready to turn in** when the Fallow cell is cleared. Remove the `baseKills` baseline, so kills made before accepting count.
- The quest progress line shows kills against the same target.
- If the player already cleared that cell before accepting, the quest is ready at once, and the player still has to return to the Fort to turn it in.

*Why:* two rules reading two numbers will drift apart. One number keeps the map, the stress familiarity system and the quest in sync.

### 12.5 Start-of-game familiarity

Now that no cells start cleared, unfamiliar-ground stress would apply everywhere from minute one. The survivor's **start cell and the base cell count as cleared** (home ground) `[PROPOSED]`. This matters when stress is built.

### 12.6 Decisions made October 1 (answers to Claude Design's five questions)

| # | Question | Decision `[DECIDED]` | Why |
|---|---|---|---|
| 1 | Who is offered the quest? | **Stranger, Neutral or Wary** (Hearthguard standing −250 to +249). Not Hostile or Hunted. Not under Heinous policy. This replaces "Stranger or Wary" everywhere in this brief. The game checks standing when the gate dialogue opens. | Seeded standing runs −150..+150, so some worlds start Neutral; excluding them would gate core progression behind a seed roll. The check matters mainly as the guard on the Hostile path after a guard kill. |
| 2 | Where is the first Fort? | Inside the **starting map view**, **2 to 3 cells** from the start (Chebyshev distance), on an unlocked cell with **at least one unlocked neighbour** (for the Fallow cell). Picked deterministically from the world seed and stored in `zi_fort1_pos`. Claude Design reports the start view size so the rule fits it. | The Fort is a tutorial beat; the player must see it without searching. Adjacent (1 cell) is too close because the Fallow cell must be a different, neighbouring cell. |
| 3 | HP lost on a failed attack | **25% of max HP, never below 1 HP**, scaled by the difficulty table (Hard loses more). Hearthguard −400 and the 3-day injury still apply. | A percentage keeps working when max HP grows. The floor means the gate can never kill or soft-lock the player (no dead ends). |
| 4 | When is the starter kit given? | At **save creation**, as part of the starting loadout (tutorial spec 3.2). A flag `zi_starter_kit_given` grants it once to older saves. The tutorial step points at the kit and does not hand it over. | State the player needs should come from the save, not from a screen event. Skipped tutorials, reloads and save transfer cannot lose or duplicate it. |
| 5 | Sealed Crate weight and pocket | **2 kg. Story items need no pocket**; they add weight only and are never lost to the Hard-mode forced-retreat item loss. | The starting pouch holds 2 pockets and both are full (med kit, scout kit). On harder terms the player keeps the med kit, so a pocket-needing crate would have no space: a dead end. |

**Rule `[DECIDED]`:** items flagged **story item** (`isStory`) never need a pocket, always count toward weight, and cannot be dropped, sold or lost to forced-retreat loss until their quest ends.

