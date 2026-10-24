# Zed Idler — The Workshop (Design Brief)

**Companion to:** `wandering-tab-spec.md` (v2.1), `wandering-fort-scene.md`, `wandering-church-scene.md`. Read those first; this document adds the Workshop.
**Status:** `[PARKED]` until POI Framework v1 is complete. Brainstorm captured Oct 3; updated Oct 9 (Workshop uses normal POI placement). Everything is `[PROPOSED]` unless tagged otherwise.
**Tags:** `[DECIDED]` confirmed by Sam · `[PROPOSED]` draft · `[OPEN]` needs a decision

---

## 1. Purpose

The Workshop is a Traversal site where the survivor can mend, strip and improve gear in the field. Where the Fort gates factions and the Church offers optional specialized comfort (never core comfort; Church brief §0), the Workshop gates **field maintenance**.

*Why it matters for design:*
- **It keeps long runs alive.** Stress and wear drain equipped gear (spec 13.8), and today the only fix is a retreat to base. A Workshop lets a "push on" run continue instead of ending.
- **It gives the base skills a field role.** Smithing, mechanical and engineering mostly grow at base. The Workshop gives a wandering player a reason to train them.
- **It turns repair into a decision.** With limited materials on hand, the player chooses which piece to save. That is attention where it matters (design pillar), not a vending machine.

---

## 2. Placement and availability

- **Placed by the POI framework** `[DECIDED Oct 9]`. Workshops are a repeatable POI type, placed at world generation and revealed through the framework's discovery states, like any other POI. They are **not** created by chance inside a garage discovery.
- *Why:* one placement system for every site means one set of rules for discovery, map marking, saving and revisiting. A Workshop created inside a discovery would need its own path through all of those.
- More common than a Church. Workshops are a convenience; Churches are a rarity. `[PROPOSED]`
- A garage can still be the Workshop's look and description; that is flavor, not a placement rule.
- `[OPEN]` How many Workshops per world, and their placement constraints.

---

## 3. The interaction screen: four options `[PROPOSED]`

1. **Repair** — mend equipped gear for a material cost.
2. **Salvage** — break an item into components.
3. **Bench work** — leave an item for a timed upgrade.
4. **Tune** — bias a weapon or armor piece toward one stat. `[OPEN]`, see Section 7.

Sample screen (terminal style):
```
[TRAVERSAL C3] > Structure: WORKSHOP
  A vise bolted to the bench. Tools hang where someone left them.
  Stress: 41/100   Scrap: 6   Bench: EMPTY
  Machete      ███████░░░  68%
  Padded jacket ███░░░░░░░  31%
  > REPAIR     > SALVAGE     > BENCH     > LEAVE
```

---

## 4. Option 1 — Repair (field triage)

- Repair restores durability on **equipped** gear for a material cost (scrap and the item's base material).
- **Field cap:** a field repair restores an item to at most **75% of max durability**. Full repair happens at base. `[PROPOSED]`
- *Why the cap:* the Workshop keeps a run going; it does not replace the base. The base bench stays the place to fully restore gear.
- **Triage is the interaction.** Costs scale with damage, and the player usually carries enough materials for one or two pieces, not all of them. The screen shows each item's durability and repair cost side by side so the choice is visible.
- Repair awards smithing XP (metal and blades) or mechanical XP (tools and armor fittings) through `ZI.emitAction`.
- Repairing only equipped gear avoids the base-only rule for moving items to and from the stash (batch 1B). Nothing changes slots.

---

## 5. Option 2 — Salvage

- Feed an unwanted or broken item from the pockets into the bench; receive components (scrap, cloth, fittings, sometimes an intermediate).
- Salvaged components are raw materials: **weight only, no pockets** (spec 14.1). Salvage frees pockets and turns junk into repair stock.
- Yield scales with the item's tier and the survivor's engineering level.
- **Never salvageable:** story items (`isStory`) and equipped gear. Same guard as the Church and stash operations.
- *Why:* a full pack is a common reason to retreat. Salvage gives the player a third option between dropping loot and going home.
- **Economy note:** salvage is a source of components and must yield less than the recipe cost of the item, so craft-then-salvage can never profit. `[PROPOSED]` yield at 30-50% of recipe inputs.

---

## 6. Option 3 — Bench work (idle upgrade)

- The player leaves one item on the bench with a material offering and starts a timer. On return, the item comes back improved (for example +1 upgrade step, or a higher max durability).
- **Timers settle on read,** like crafting, so they work while the player is away and follow the 24 h offline cap.
- **One item per Workshop.** A player with three found Workshops can run three bench jobs. That is a reason to find more, and a reason to route runs past them.
- **The item stays at the Workshop.** It is not carried, so it cannot be lost to Hard-mode forced-retreat loss. To collect it, the survivor must return to that cell.
- Story items cannot be benched.
- Craft time follows the same tier-driven rule as recipes: higher-tier items take longer, and the value lives in a data table.
- *Why:* this mirrors the Church's greater blessing. Leave something working, go on a run, come back. That is the idle game's core rhythm applied to a site.

---

## 7. Option 4 — Tune `[OPEN]`

- Bias one item between two stats (for example damage against durability, protection against weight) with a three-step setting.
- **Risk:** this is the most engaging option and the most likely to feel fiddly in an idle game. It also adds balance cases for every item.
- **Recommendation:** leave it out of the first release. Prototype it as an HTML widget and test it before committing.

---

## 8. Risk and failure

- A Workshop in an uncleared cell can be interrupted: each action rolls a small chance of a zombie encounter that resolves automatically (13.1).
- Failed repair `[OPEN]`: should low skill risk wasting materials? Proposed: no. Low skill means a smaller repair, never a lost item. Losing gear to a bad roll at a site meant to save gear works against the site's purpose.

---

## 9. System touchpoints

| System | What the Workshop does |
|---|---|
| Traversal | A placed, repeatable POI; a permanent site once discovered |
| Stress and wear (13.8) | Gives worn gear a field fix, so long runs survive |
| Carrying (14) | Salvage turns pocket items into weight-only materials |
| Crafting | Bench work uses tier-driven timers; salvage feeds components |
| Base skills | Smithing, mechanical and engineering earn XP in the field |
| Base | Field cap of 75% keeps full repair at base |

---

## 10. Integration notes `[PROPOSED]`

- Data: a Workshop POI definition in the POI framework's data table (repeatable type, its own placement constraints). Per-instance state, including the bench job, is saved through the framework, keyed by `poiId`.
- Repair costs, field cap, salvage yields and bench timers live in data tables.
- Repair calls the same durability function as base repair (`Z.applyWear` inverse), with the field cap passed in.
- Bench state per Workshop: `{ itemId, startUtc, durationS, offering }`, settled on read.
- All XP through `ZI.emitAction`.
- Every Workshop operation skips `isStory` items, with a test for each operation.

---

## 11. Open questions

1. How many Workshops per world, and their placement constraints?
2. Field repair cap: 75% (proposed) or another value?
3. Salvage yield range and which items give intermediates.
4. Bench upgrade effect: upgrade step, max durability, or both?
5. Tune: cut for the first release (proposed) or prototype now?
6. Can low skill waste materials on a repair? Proposed: no.
7. Camp Leader version (park for later).
