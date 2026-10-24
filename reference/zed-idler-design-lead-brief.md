# Zed Idler — Lead Design Brief

**Role:** lead designer (design advice and documentation) for Sam's team.
**Companion documents:** `wandering-tab-spec.md` (v2.1), `wandering-fort-scene.md`, `tutorial-first-session-spec.md`, `wandering-design-audit.md`.
**Purpose:** record how this project is designed, what we have decided, what to build next, and the rules for monetization, so any new team member or session can continue without a recap.

---

## 1. How this project is designed (working agreements)

Learned from the design sessions:

1. **Document first.** The master Markdown spec comes before code. Claude Code turns the spec into Unity C# files, so specs must be handoff-ready.
2. **Every decision has a reason.** Rules are recorded with a "why", not only a value.
3. **Decisions are tagged** `DECIDED`, `PROPOSED` or `OPEN`, so nobody builds on a guess.
4. **Numbers are starting values.** Playtesting tunes them; they live in data tables, not in code.
5. **Audit for gaps and conflicts before expanding.** Several conflicts were caught this way (Fort as random unlock vs. core progression; locked factions vs. existing starting reputations).
6. **Never gate core progression behind randomness.** Randomness is for optional content.
7. **No dead ends.** Every path a player can take needs a way back.
8. **Systems should touch each other.** The best decisions here connect systems (the med kit is the tutorial gift, crafting item, heal charge, Fort offering and injury treatment).
9. **Solo first, Camp Leader later.** Solo saves must upgrade to Camp Leader.

---

## 2. Design pillars (from the decisions so far)

| Pillar | What it means |
|---|---|
| **Idle with a reason to return** | The policy runs while the player is away; decay, prompts and the return report give them reasons to come back |
| **Attention where it matters** | Zombie fights and NPC encounters are automatic; the player is asked only at discoveries, tools and redirects |
| **Consequences, not punishments** | Risk, stress, wear and reputation shape choices; forced retreats are safe exits, and difficulty is fixed at save creation |
| **Identity through policy** | Ethical, Immoral, Criminal and Heinous change what the world offers and how factions respond |
| **Progressive disclosure** | Factions, policies and systems are introduced in steps (Fort first, then the rest) |
| **Earned mastery** | Floors and skills reward doing, not only reaching a level |

---

## 3. Where the design stands

**Decided or accepted as starting values:** standing policies and encounter pools; decay, rust and earned floors; six factions, reputation tiers and the strength hexagon; the Lodge as neutral broker; discovery prompts with timers; scout and heal charges; stress and its effects; rest and beds; pockets and weight; Easy/Normal/Hard fixed at save creation; the Fort as a faction gate with the Hearthguard first, the Concordance as the later counter, Heinous unlocked by killing a guard, and the quest Fallow Ground.

**Code changes already made:** cleared Traversal cells are now real saved progress (`game-data.js`).

**Still to design:** the Fort dialogue and story, the Concordance introduction event, the encounter content library, trade and settlement value, contracts and zone unlocking, base and rest spot definition, and Camp Leader.

---

## 4. Recommended roadmap

| Order | Work | Why now |
|---|---|---|
| 1 | Consolidate the two documents into the master design document and run a congruence audit | Many new systems; catch conflicts before code |
| 2 | Write the Fort dialogue tree and the story beat after the quest | Finishes the onboarding path |
| 3 | Build the shared encounter/roll simulation and single XP path | Fixes the integration issues; everything else depends on it |
| 4 | Decay, floors, stress and the return report | Core retention systems |
| 5 | Encounter and discovery content library | Gives the game variety |
| 6 | Trade and settlement value; contracts | Closes the faction system |
| 7 | Second faction (Concordance) introduction | First expansion of the story |
| 8 | Camp Leader: the deliberate shift of Solo Survivor | Part of the base game, not paid content |

---

## 5. Business model `[DECIDED by Sam, Sep 30]`

- **Premium only.** No free-to-play, no ads, no loot boxes. The game is priced as a finished product with real value.
- **Camp Leader is not a paid expansion.** It is a deliberate shift in the concept of Solo Survivor, part of the base game.
- **A second wave** after a successful first release: an expansion (for example the Concordance storyline and new regions) or a different variation of the game. The aim is to establish the team as game developers and partners.
- **Honest scope:** a design can improve the odds of earning well, but nothing guarantees profit.

### 5.1 The core rule

**Never sell relief from a pain the design created.** Decay, stress, wear and rest timers are friction added on purpose. Selling the cure gives a reason to make the friction worse. Sell content and expression instead.

### 5.2 What monetization looks like under a premium model

| Idea | Fit | Notes |
|---|---|---|
| One-time purchase price | Core | The whole model |
| Paid expansions (story, faction, region) | Good | Second wave; content, not relief |
| Cosmetic packs (optional) | Good | Skins and themes; a comfort item's stress effect stays on the item, not the skin |
| Soundtrack or art book (optional) | Small | Low effort, fan-friendly |
| Ads, loot boxes, stat sales | Not used | Conflicts with the model |

### 5.3 Linking Steam and mobile without free-to-play

| Option | How it works | Trade-off |
|---|---|---|
| **A. Separate purchases, same price** | Buy once per platform; no link | Simplest; buyers on both pay twice |
| **B. Cross-buy** | One purchase unlocks both | Store rules make this hard, especially on iOS, and it needs your own accounts and backend; not recommended |
| **C. Save transfer (recommended)** | Owners of both can move a save between platforms by export code/file, and later by cloud account | Cheap now: saves are already snapshots of the `zi_*` keys |
| **D. Free prologue + one-time unlock** | Mobile offers the tutorial through the first Fort quest for free, then a single paid unlock | Try-before-buy, not free-to-play, but some players will read it as free-to-play |

**Recommendation:** launch on one platform (5.4), design the save format to be platform-neutral now (a version number, a plain data export), and add mobile in the second wave at the same price with save transfer (option C).

### 5.4 First platform `[PROPOSED]`

**Steam first**, for these reasons:
- Premium pricing is normal there.
- It has playtest tools and a refund policy that suits testing.
- Desktop has no background-process limits. (Mobile operating systems suspend background timers, so the offline settle-on-read approach is required there.)
- The port from the browser prototype to Unity desktop is the shortest.

Honest caveat: idle games have their largest audience on mobile, and premium mobile games are harder to sell. Steam-first lowers risk; mobile is a second-wave decision.

Costs and fees change, so verify current terms before committing: Steam charges a one-time fee per game, Apple's developer program is an annual fee, Google Play is a one-time fee, and stores typically take a commission on sales.

---

## 6. Partners and equity

Sam mentioned equity held over time between partners. Put any equity or revenue-sharing arrangement in a written agreement reviewed by a qualified professional. This brief cannot give legal advice.

---

## 7. Release readiness: candid assessment `[PROPOSED]`

The design has real strengths (clear pillars, connected systems, documented reasons), and Sam's own view is that it has many flaws and is not ready for launch. Here are the main ones, in order of risk.

### 7.1 Structural flaws

| # | Flaw | Why it matters | Fix |
|---|---|---|---|
| 1 | **Two simulations** (screen and background engine) with different rules | Results differ between watching and being away | One shared roll and resolve function (spec 10) |
| 2 | **XP does not flow through one path**; scavenging XP is double-counted | Decay and balance cannot be trusted | Route everything through `emitAction` |
| 3 | **No long-term goal or endgame.** What does a level-50 survivor do? | Idle games live or die on the long term | Define the endgame loop (see 7.3) |
| 4 | **No economy audit.** Sources and sinks of every resource are not mapped | Idle economies break quickly | Build a source/sink table and simulate it |
| 5 | **Balance is untested** across decay, stress, wear, difficulty (3 modes) and 4 policies | Interactions are unknown | A headless simulation that plays N days per policy and difficulty |
| 6 | **Logic lives inside a React prototype** | The Unity port can drift from the spec | Rules as plain functions; the spec is the source of truth |
| 7 | **No first-session design.** Fort, policies, pockets, stress and factions all arrive early | Retention is decided in the first sessions | A tutorial and first-session spec |
| 8 | **Ten structural gaps** from earlier planning (contracts, recycler and marketplace runtimes, camp infrastructure, zone unlocking, task duration sync, biomes, horde defense) | Unfinished systems block a release | Triage: which ship, which move to the second wave |
| 9 | **Content volume** (dialogue, discoveries, quests, encounters) | Content, not code, will take the most time | Set a content budget for the first release |
| 10 | **Save versioning** | Updates will break saves without it | Version number and migrations from day one |

### 7.2 Recommended first-release scope (vertical slice) `[PROPOSED]`

Ship less, finish it, and test it thoroughly:
- Solo Survivor only, with the Camp Leader shift as the campaign's turning point if it is ready; otherwise it moves to the second wave.
- The first region, the Fort onboarding, and the Hearthguard storyline through Fallow Ground.
- Policies Ethical, Immoral and Criminal fully working; Heinous through the Fort.
- Decay, floors, stress, pockets, crafting core, discovery prompts, the return report, three difficulty modes.
- Two factions with full content (Hearthguard and Concordance); the other four exist in the world as unnamed groups until the second wave.

*Why:* the hexagon needs six factions, but content depth does not. Four factions can exist mechanically while only two carry quests, which keeps the world consistent and the scope finite. The second wave then has obvious content to sell.

### 7.3 Endgame and long-term loop `[DECIDED concept, OPEN details]`

Sam's direction (Sep 30): a **late-game fork**. The player chooses **Camp Leader** (the deliberate shift of Solo Survivor) or **continues as a Solo Survivor and reaches maximum stats on items and gear**. Details are in the spec, Section 8: the trigger, whether the choice is permanent, and what "maximum stats" means are still open. For the first release, the fork can ship as setup only, with the paths delivered in the second wave `[PROPOSED]`.

### 7.4 Definition of "thoroughly tested"

Suggested release gates:
1. Headless simulation: 30 simulated days for each policy and difficulty with no soft-locks, no negative resources, and no economy runaway.
2. Save/load test: every state saves, loads and migrates.
3. Offline test: 1 hour, 24 hours and 72 hours away match the on-screen results within a defined tolerance.
4. Tutorial test with players who have not seen the design.
5. A closed playtest with measured session length, return rate, and where players quit.
6. Performance test on the lowest target device.

---

## 8. Decisions recorded (Sep 30) and next steps

**Decided:** premium only · Steam first, mobile in the second wave · **save transfer** links platforms (a free prologue is possible later, but save transfer is preferred) · vertical-slice cut accepted with two fully written factions (Hearthguard and Concordance) · Camp Leader is part of the base game, reached through a late-game fork with a solo-master alternative.

**Next:** the tutorial and first-session spec (`tutorial-first-session-spec.md`), then the simulation and test harness spec, then the endgame details.
