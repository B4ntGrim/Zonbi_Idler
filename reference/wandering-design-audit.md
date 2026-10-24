# Zed Idler — Wandering Design Audit (Sep 30)

**Purpose:** a consistency check across `wandering-tab-spec.md`, `wandering-fort-scene.md`, `zed-idler-design-lead-brief.md` and the current code, before building the tutorial.
**Result:** the design needed another polishing pass. Twelve items were fixed in the documents (spec now v2.0). Five decisions need Sam.

---

## 1. Fixed in the documents

| # | Finding | Fix |
|---|---|---|
| 1 | The spec header and Section 8 still called Camp Leader an expansion | Rewritten: Camp Leader is part of the base game, a deliberate shift of Solo, reached through a late-game fork (spec 8) |
| 2 | Spec 2.5 said every Fort outcome, including "turned away", opens the Factions page. Sam decided a turned-away survivor stays locked until they succeed | Corrected; the page opens on quest turn-in or a guard kill (spec 2.5, Fort brief 10.3) |
| 3 | Rank names: the spec called the seeded 100-250 band "Known". In the code, 100-249 is **Neutral**; Known starts at 250 | Corrected in 4.6; rank table added. Sam's "neutral or estranged" now maps to Neutral or Wary. The quest is offered to Stranger, Neutral or Wary (Fort brief wording corrected Oct 1) |
| 4 | Base skills (smithing, mechanical, engineering, logistics) had no decay protection in the spec | Row added to 3.2 |
| 5 | Policy-to-reputation effects had been dropped from the spec (the brainstorm had them) | Section 4.7 added as a proposal |
| 6 | Section 6 still said the Fort was a Traversal-only roll | Now "later Forts are rolled; the first is placed" |
| 7 | Later Forts could be randomly discovered before their faction was introduced, spoiling the story event | Rule added: a faction's Fort is rollable only after its introduction |
| 8 | Section 13.1 said "no fight/evade/talk choice" while 4.4 uses fight vs evade | Clarified: no player choice; the game still resolves it internally |
| 9 | The rest spot slows decay (3.5) and recovers stress by bed tier (13.8) with no statement of how they relate | Noted as one source with two effects; whether bed tier scales both is open |
| 10 | Fort brief Sections 2, 3, 7 and 10.3 still described the old random-discovery Fort | Marked superseded; 10.3 rewritten |
| 11 | Spec Section 11 was stale | Rewritten |
| 12 | The lead brief's endgame item and questions were stale | Updated with Sam's decisions and the late-game fork |

---

## 2. Decisions needed from Sam

| # | Question | Proposed default |
|---|---|---|
| A | **Are kits consumables that hold charges?** The spec said carried kits "add charges", but Sam's wording ("if the player uses them all up") implies kits are used up. These are different systems | A med kit holds 2 heal charges; each heal spends one; an empty kit is used up. Base charges refill daily; kits do not. Gifting a kit to the Hearthguard gives away its remaining charges |
| B | **May the scripted first Fort change Hearthguard standing?** Sam decided that faction-owned sites never change standing, but the Fort quest raises it and attacking the guard turns them Hostile | Yes: the scripted first Fort scene is a story event and the exception. Random discovery sites still never change standing |
| C | **How does a Criminal survivor fare at the first Fort?** The Fort brief had two versions (harder-terms quest vs turned away) | Criminal gets the quest on harder terms; a dirty job can be a later variation |
| D | **The late-game fork** (Camp Leader, or Solo master with maximum gear stats): what triggers it, is it permanent, what does "maximum" mean, and does the first release ship the paths or only the setup? | Trigger by a campaign chapter; choice is permanent per save; "maximum" is a raised gear tier cap; the first release ships setup only |
| E | **Policy reputation leaning** (spec 4.7) and whether Criminal locks lawful factions out | Leaning as written; Criminal makes lawful factions expensive, not locked |

---

## 3. Conflicts between the current code and the new design

These are prototype behaviors that the new design retires. They are listed here so the tutorial and the port do not carry them forward.

| Code today | New design |
|---|---|
| 60 commands per day, typed commands `kill`, `heal`, `scout`, `push`, `retreat` | Charges and buttons; `kill` removed (combat automatic) |
| Evade is a toggle stored in the run and wiped on retreat | Policy-driven and stored under its own key |
| The Wandering tutorial teaches the command limit and the Evade toggle | Must be rewritten (tutorial spec, Section 7) |
| All six factions start with fixed, unequal reputations (Iron March 240, Dustwalkers 90) | Seeded per world; Factions page locked until the first Fort quest |
| A Traversal square's "cleared" state came from a hash | Fixed: real saved progress (already patched in `game-data.js`) |
| Pack descriptions promise 6 or 12 stash slots | Packs give 2 pockets; strength comes from weight capacity |
| Capacity is a 0-100 stat | Kilograms internally, bar derived |
| Screen and background engine run different simulations | One shared roll and resolve function |

---

## 4. What remains healthy

- Systems are connected (the med kit alone touches the tutorial, crafting, heal charges, the Fort and injury treatment).
- Every major rule carries a reason.
- Progressive disclosure now protects the first session.
- Difficulty is a data table, not code branches.
- Stress and rust affect different things, so they do not double-punish.

---

## 5. Decisions made October 1 (Claude Design's five questions)

Full table and reasons: Fort brief 12.6.

| # | Decision |
|---|---|
| 1 | Quest offered to Stranger, Neutral or Wary (−250..+249); not Hostile, Hunted or Heinous policy |
| 2 | First Fort inside the starting view, 2 to 3 cells away, unlocked, with an unlocked neighbour, seeded and saved |
| 3 | Failed attack costs 25% of max HP, never below 1 HP, scaled by difficulty |
| 4 | Starter kit granted at save creation (`zi_starter_kit_given` for old saves) |
| 5 | Sealed Crate is 2 kg; story items need no pocket and cannot be lost |

Still open from Section 2: A to E, the returned med kit, and the story beat choice.

