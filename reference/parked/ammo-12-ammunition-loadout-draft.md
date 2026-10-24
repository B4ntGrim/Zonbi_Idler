# AMMO-12 — Ammunition, Recovery & Loadout Systems (team draft)

**Status:** [PARKED] until weapons Phase 6 (Ranged combat) opens, per `weapons-development-directive.md` W6. Proposal only; nothing in it is `[DECIDED]`.
**Filed:** Oct 16 by Claude Design, at Sam's request ("put this review draft into our queue of batches"). Addendum (Player Intent Preservation Invariant) added Oct 16 from Sam's team; `[PROPOSED]`. **LR1 shared loadout resolver `[DECIDED Oct 16]`**: fold into v1.3 (see end of file).
**Source:** team draft AMMO-12 v1.2, "UNLOCKED — FOR REVIEW", "Implementation: NOT AUTHORIZED". Kept verbatim below the intake notes.
**Related:** `weapons-development-directive.md` (phase gates, W6) · `parked/weapons-encyclopedia-wlm-draft.md` (weapon XP, family mastery) · `weapon-files-inventory.md` (25 weapons in code, firearms with no ammo or noise) · `wandering-tab-spec.md` (policies, carry, offline cap).

---

## Intake notes (Claude Design, Oct 16)

### Where it sits in the queue

H2 → JD1b → Weapons Phase 1 audit → Phases 2–5 (Data, Persistence, Progression, Balance) → **Phase 6 Ranged combat: AMMO-12 is the input draft.**

AMMO-12's own Phases A–F nest inside weapons Phase 6. They are not separate top-level batches. Each still needs a GO/NO-GO, as both documents already require.

### First conflict check (to confirm in the Phase 1 audit; nothing decided)

| # | Point | Recommendation |
|---|---|---|
| A1 | **W6 order.** Ranged combat is the last weapons phase. Moving AMMO-12 earlier would supersede W6 | `[DECIDED Oct 16]` Stays at Phase 6 (Sam) |
| A2 | **Its Phase A audit overlaps weapons Phase 1** (inventory, saves, combat events, offline sim, policies) | `[DECIDED Oct 16]` AMMO-12 §18 Phase A items are folded into the weapons Phase 1 audit scope, read-only (Sam). AMMO-12 Phase A at Phase 6 then reuses those findings and checks only what changed |
| A3 | **Existing firearms fire without ammo today** (`weapon-files-inventory.md`). Adding physical ammo changes saved weapons' behavior | `[OPEN]` Old-save rule for firearms already owned (grandfather, starter ammo grant, or melee fallback) |
| A4 | **Reuse before inventing.** "Support capacity" slots, harness bonus slots and carry modules may duplicate existing equipment slots, the Belt Pouch and carry-weight rules | Phase 1 audit lists existing slot and carry concepts; AMMO-12 reuses them where it can |
| A5 | **Conservation policies (§4)** must sit inside the Wandering policy model, not beside it. Its own §4 says so | Map each policy onto the existing policy × difficulty structure before Phase D |
| A6 | **Business model (lead brief 5.1).** Ammo scarcity is a pain the design creates. Ammo, recovery gear and support slots must not be sold as relief | Note as a constraint for Phase F economy |
| A7 | **Attention rule (Design Rules §4.5).** Presets, priorities and auto-restoration all resolve without waiting on the player. This fits. In-combat preset switching is optional input, never a prompt | No change; keep restoration notices in logs or offline summaries (its §15 already says this) |
| A8 | **Inactive stats (§17).** Accuracy, evasion and speed must not appear as working bonuses. FX4 moved speed into shared rules, so check which stats are live at Phase 6 | Confirm in the Phase 1 audit |
| A9 | **Title.** The draft says "Zombie Idler"; the project name is Zed Idler | Cosmetic; fix when the draft is promoted |

### What Sam decides when Phase 6 opens

AMMO-12 §20 lists 14 open decisions. A3 above adds one more. None blocks anything before Phase 6. The Player Intent Preservation Invariant (addendum at the end of this file) is `[PROPOSED]` and awaits Sam's lock.

### Teaching note

This draft is mostly about **separating intent from state**: the preset is what the player wants, and the applied loadout is what is possible right now. Keeping them apart is why repairs can restore modules automatically without rewriting the player's choices. The same pattern shows up in the retreat policy versus the actual retreat. Watch out for any rule that writes the current state back into the saved intent; that is how "the game changed my loadout" bugs start.

---

## Original draft (verbatim)

# Zombie Idler — Ammunition, Recovery & Loadout Systems

**Document:** AMMO-12 — Consolidated Design Proposal  
**Version:** 1.2  
**Status:** UNLOCKED — FOR REVIEW  
**Implementation:** NOT AUTHORIZED  
**Scope:** AMMO-01 through AMMO-11, with automatic restoration added

---

## 1. Design Objectives

Create a physical ammunition and equipment-support system appropriate for an idle survival RPG.

The system must:

1. Make ammunition a meaningful, finite resource.
2. Support automatic reloading and player-controlled conservation.
3. Allow crafted equipment to preserve ammunition or recover spent components.
4. Permit multiple support modules simultaneously.
5. Provide permanent progression-based slots and temporary equipment-granted capacity.
6. Support player-defined equipment priorities.
7. Save multiple complete loadout presets.
8. Allow preset requests during combat.
9. Apply usable equipment from incomplete presets.
10. Automatically restore eligible modules when availability returns.
11. Preserve existing equipment effects, inventory integrity, and deterministic simulation.

**Design principle:** Player intent is persistent; equipment availability is temporary.

## 2. Physical Ammunition

Ammunition exists as inventory items rather than an abstract ammunition currency.

### Categories

- Firearm cartridges.
- Shotgun shells.
- Arrows and crossbow bolts.
- Fictional energy cells.
- Recoverable spent components.

Each ammunition definition requires a unique identifier, compatibility class, inventory weight, stack behavior, and acquisition source.

Loaded ammunition must be accounted for separately from loose ammunition without duplication.

Spent casings are not immediately usable cartridges.

## 3. Automatic Reloading

The survivor reloads automatically when necessary and permitted.

The future combat system must define:

- Weapon ammunition compatibility.
- Loaded capacity.
- Ammunition required per attack.
- Reload duration.
- Available inventory ammunition.
- Reload interruption behavior.
- Rules when ammunition is exhausted.

Reloading consumes simulated time.

**Player preferences must remain authoritative.** Automatic reloading cannot override a protected ammunition reserve or ammunition-use restriction.

## 4. Ammunition Conservation Policies

Proposed player-selectable policies:

| Policy | Intended behavior |
|---|---|
| Unrestricted | Fire whenever existing combat rules permit |
| Conserve | Limit expenditure under approved conditions |
| Emergency Only | Reserve ammunition for designated danger conditions |
| Melee Only | Do not intentionally fire ammunition-consuming weapons |
| Reserve Minimum | Protect a selected ammunition quantity |

Policy conditions and thresholds remain undecided.

These policies must integrate with existing Wandering rules rather than replace them.

## 5. Craftable Ammunition Support

### Preservation

Preservation equipment reduces usable ammunition expenditure through an approved game mechanic.

Candidate effects include conservation modules and specialized ammunition-management equipment.

### Recovery

Recovery equipment automatically collects eligible spent components or projectiles.

Examples:

- Casing Recovery Pouch.
- Reinforced Brass Collector.
- Arrow Retrieval Kit.
- Bolt Recovery Rig.

Recovery occurs automatically when compatible equipment is active.

It must not require manual collection during unattended gameplay.

### Stacking

Different effect categories may function simultaneously.

Same-category effects require an approved stacking rule.

**Provisional recommendation:** Use the strongest eligible same-category effect until a balanced stacking formula is approved.

No exact percentages are locked.

## 6. Support Equipment Capacity

Support capacity combines permanent progression and temporary equipment benefits.

**Proposed formula:**

`Active Capacity = min(System Maximum, Permanent Slots + Functional Equipment Bonus Slots)`

### Permanent capacity

- Earned through survivor progression.
- Persists after equipment breakage.
- Does not depend on the currently equipped harness.

### Temporary capacity

- Granted by approved harnesses or specialized equipment.
- Exists only while the granting equipment is eligible.
- Disappears when the equipment becomes nonfunctional or unequipped.

Initial capacity, unlock milestones, equipment slots, and maximum capacity remain undecided.

Unlocking a support slot does not automatically increase ammunition weight capacity.

## 7. Support Module Priorities

Players define an ordered priority list.

Priority determines which eligible modules occupy available support capacity.

### Resolution rules

1. Read the selected preset.
2. Determine functional permanent and temporary capacity.
3. Validate owned item instances.
4. Check accessibility, compatibility, and condition.
5. Skip ineligible modules for active allocation.
6. Activate eligible modules in saved priority order.
7. Suspend eligible modules exceeding capacity.
8. Preserve all assignments and player priorities.

Broken or unavailable modules retain their positions in the saved preset.

The system does not silently rewrite the player's preferences.

## 8. Full Loadout Presets

Each preset stores its own:

- Identifier and player-defined name.
- Requested harness.
- Assigned support-item instance references.
- Equipment priority order.
- Version information required for compatibility.

Presets do not own separate physical copies of equipment.

The same owned item may be referenced by multiple presets, but it can only be physically equipped according to valid equipment ownership rules.

### Player operations

- Create.
- Rename.
- Duplicate.
- Edit.
- Select.
- Preview.
- Apply.
- Inspect incomplete assignments.

Selecting a preset does not create equipment.

Preset-count limits remain undecided.

## 9. Switching Presets During Combat

Players may request changes immediately, including during combat.

Priority-only changes involving the current equipment can take effect for subsequent eligible actions without requiring a physical equipment swap.

Full preset changes involving physical equipment must respect approved equipment-change boundaries.

### Timing safeguards

- In-progress attacks retain their captured effects.
- In-progress reloads retain their captured timing.
- Previously fired shots retain their applicable recovery rules.
- Future actions use the newly applied configuration.
- No completed event can be recalculated using a later preset.

**Provisional rule:** When multiple pending preset requests exist, the latest valid player request takes precedence.

The exact legal physical-switch boundary requires code review.

## 10. Incomplete Loadouts

Selecting an incomplete preset applies the equipment that is currently eligible.

Missing, broken, incompatible, or capacity-restricted items remain visible.

### Required behavior

- Available compatible items may activate.
- Missing items are flagged.
- Broken items retain their references.
- Incompatible items remain inactive.
- Excess modules are suspended.
- The saved preset remains unchanged.
- Equipment is never invented to fill a missing assignment.

Partial application must still be an internally consistent equipment transaction.

If application fails unexpectedly, the game must retain or recover a valid equipment state without losing or duplicating items.

## 11. Automatic Module Restoration

### Core rule

When a previously unavailable module becomes eligible again, the system automatically reevaluates the selected preset and activates it if its saved priority and available capacity permit.

### Restoration triggers

- Equipment repair completes.
- A previously inaccessible owned item becomes accessible.
- Support capacity increases.
- Harness functionality returns.
- An approved incompatibility condition ends.
- A higher-priority module becomes eligible.

### Restoration procedure

1. Detect an event that changes equipment eligibility.
2. Verify the referenced item still exists and is owned.
3. Confirm the item is accessible.
4. Validate durability and compatibility.
5. Recalculate functional support capacity.
6. Reevaluate the applied preset's priority order.
7. Determine the new active and suspended modules.
8. Apply changes at the appropriate simulation boundary.
9. Update the equipment interface and event summary.

### Restrictions

Automatic restoration must not:

- Craft missing equipment.
- Purchase replacements.
- Retrieve items from inaccessible storage without an approved mechanism.
- Recreate deleted or recycled item instances.
- Duplicate items referenced by multiple presets.
- Apply effects retroactively.
- Switch to a different preset without player instruction.

**Restoration means reactivating an eligible owned item—not recovering a nonexistent item.**

### Priority example

A survivor has two active support slots.

1. Preservation Module — Active.
2. Recovery Module — Broken.
3. Reload Module — Active.
4. Carry Module — Suspended.

The Recovery Module is repaired.

The engine reevaluates priorities:

1. Preservation Module — Active.
2. Recovery Module — Active.
3. Reload Module — Suspended.
4. Carry Module — Suspended.

The saved order does not change.

### Important distinction

If an item is currently suspended solely because capacity is insufficient, the game must not equip it until a capacity slot becomes available.

Restoration does not override capacity limits.

## 12. Equipment Failure and Repair

When a harness fails:

- Temporary capacity decreases.
- Excess modules suspend in reverse priority order.
- Permanent support capacity remains.
- No support item is discarded.
- Existing actions retain their previously captured effects.

When a harness is repaired:

- Capacity is recalculated.
- Eligible suspended modules reactivate according to saved priorities.
- No additional confirmation is required.

If a carrying module stops functioning, existing ammunition remains owned. Any overload consequences must use the established inventory rules.

## 13. Inventory Integrity

The following invariants are mandatory:

1. Each owned equipment instance has one physical identity.
2. Preset references never duplicate physical items.
3. Equipment switches do not create or destroy inventory.
4. Ammunition cannot become negative.
5. Recovered components cannot exceed eligible recovery events.
6. Spent components are not automatically live ammunition.
7. Existing item progression is preserved.
8. Failed transitions cannot leave contradictory equipment states.

Concurrent-browser-tab behavior requires a separate save-consistency review.

## 14. Idle and Offline Simulation

All ammunition-support systems must operate through shared game rules.

The player does not need to watch combat for recovery, reloading, or equipment restoration to occur.

### Offline requirements

- Use the last successfully applied preset.
- Respect saved equipment priorities.
- Process equipment damage at its simulated timestamp.
- Restore eligible modules at the correct simulated timestamp.
- Never change completed ammunition transactions retroactively.
- Respect the existing FX2 24-hour processing cap.
- Preserve deterministic random-stream behavior.
- Report material equipment changes on return.

### Pending switches

A pending player-requested switch may be resolved during unattended simulation only at an approved legal transition boundary.

The team must verify that pending-switch persistence is safe before enabling it.

### Catch-up conflict

If a player requests a preset change during offline catch-up, the change must not retroactively affect already elapsed simulation.

**Recommended first implementation:** Complete catch-up before applying new live equipment requests.

## 15. Player Interface

Place ammunition support inside the existing equipment/loadout interface unless a later UI review identifies a better location.

### Required information

- Selected preset.
- Requested equipment.
- Actually applied equipment.
- Available support capacity.
- Current module priorities.
- Effective bonuses.
- Durability where applicable.
- Missing, broken, incompatible, and suspended items.
- Pending equipment changes.

### Suggested statuses

| Status | Player meaning |
|---|---|
| Active | Currently providing its effect |
| Pending | Requested change not yet applied |
| Suspended | Available but insufficient support capacity |
| Broken | Equipment requires repair |
| Missing | Referenced item is not accessible or no longer owned |
| Incompatible | Current configuration prevents activation |
| Incomplete | Some requested equipment could not be applied |

Missing and inaccessible equipment should be distinguishable in detailed UI when the game can determine the difference.

### Automatic restoration feedback

Example:

**Support Equipment Restored**

*Brass Recovery Rig repaired. Automatically reactivated under Conservation preset. Reload Assistance suspended.*

Routine state changes should appear in equipment logs or offline summaries rather than interrupting combat with repeated modal dialogs.

## 16. Noise and Zombie Attraction

Ranged weapons produce sound according to their eventual approved noise profiles.

Noise may influence nearby zombies or encounter generation.

Important restrictions:

- Preservation does not inherently silence a fired weapon.
- Casing recovery does not cancel gunfire noise.
- Changing presets does not erase previously generated noise.
- Noise consequences must use shared simulation time.
- Existing encounter and world-generation rules remain authoritative until specifically revised.

No noise-to-zombie-attraction formula is approved.

## 17. Compatibility Requirements

The system must preserve:

- CB1 starter weapon values and special abilities.
- Existing equipment and crafting rules.
- Survivor carry-weight and overload mechanics.
- R1 retreat and Downed behavior.
- H1 deterministic clock and seeded randomness.
- FX1 minimum-HP behavior.
- FX2 offline processing limit.
- Existing save compatibility.
- Future individual weapon XP and transferable weapon-family mastery.

No currently inactive accuracy, evasion, or speed stat may be represented as a functioning bonus without an approved implementation.

## 18. Engineering Phase Gates

### Phase A — Read-Only Audit

Inspect current inventory, crafting, equipment slots, combat events, saves, offline simulation, and policy architecture.

Identify conflicts with locked rules.

**Deliverable:** Compatibility report and GO/NO-GO recommendation.

### Phase B — Data and Preset Definitions

Design item definitions, preset references, validation, and persistence.

**Gate:** Old saves remain compatible.

### Phase C — Equipment Application

Design capacity calculation, equipment eligibility, partial application, priority resolution, and automatic restoration.

**Gate:** No item loss or duplication.

### Phase D — Ammunition Transactions

Integrate ammunition consumption, automatic reload, conservation, and recovery.

**Gate:** Resource-accounting invariants pass.

### Phase E — Combat and Offline Integration

Integrate action snapshots, breakage, repairs, preset transitions, and catch-up behavior.

**Gate:** Deterministic watched/offline equivalence.

### Phase F — Noise and Balancing

Define noise consequences, ammunition economy, equipment bonuses, and long-term resource sustainability.

**Gate:** Simulation and regression acceptance.

No phase advances without explicit approval.

## 19. Minimum Acceptance Test Matrix

| ID | Test | Required result |
|---|---|---|
| A01 | Create multiple full presets | Independent definitions persist |
| A02 | Reference one item from several presets | No duplicated item |
| A03 | Change priorities during combat | Future actions use new eligible effects |
| A04 | Switch presets during reload | Reload remains consistent |
| A05 | Apply incomplete preset | Eligible items apply; missing items flagged |
| A06 | Broken priority-one module | Next eligible module activates |
| A07 | Repair priority-one module | Automatically reclaims its priority |
| A08 | Harness breaks | Temporary capacity removed safely |
| A09 | Harness repaired | Suspended modules reactivate by priority |
| A10 | Missing item becomes accessible | Restores only if genuinely owned and eligible |
| A11 | Item permanently recycled | Never recreated by preset |
| A12 | Support capacity decreases | No item deletion |
| A13 | Ammunition storage capacity decreases | Existing ammunition retained |
| A14 | Duplicate preset | No inventory duplication |
| A15 | Rapid preset requests | No inconsistent partial transitions |
| A16 | Automatic reload | Correct ammunition and timing |
| A17 | Ammunition preservation | No duplicate or negative consumption |
| A18 | Casing recovery | Only eligible spent components returned |
| A19 | Watched versus offline | Identical results from identical event histories |
| A20 | Save/reload | No duplicated equipment or ammunition |
| A21 | Two browser tabs | No duplicate rewards or silent state corruption |
| A22 | FX2 offline cap | No events beyond processed time |
| A23 | CB1 regression | All locked starter properties remain unchanged |
| A24 | Restoration during offline play | Takes effect at the correct simulated time |

## 20. Open Decisions

The following require design approval or engineering investigation:

1. Permanent slot progression and maximum capacity.
2. Harness equipment-slot compatibility.
3. Support-item durability and failure thresholds.
4. Same-category bonus stacking.
5. Ammunition preservation probability and consumption model.
6. Ammunition and spent-component storage behavior.
7. Magazine, chamber, and partial-reload handling.
8. Exact combat boundary for full equipment swaps.
9. Preset quantity and naming constraints.
10. Missing versus inaccessible item handling.
11. Pending-switch behavior across save/reload.
12. Concurrent-tab authority and state synchronization.
13. Noise propagation and zombie-attraction rules.
14. Final ammunition economy and equipment bonus values.

## 21. Implementation Restrictions

This document is a consolidated proposal, not an implementation contract.

The engineering team must:

- Review authoritative specifications first.
- Identify conflicts before writing code.
- Preserve all locked gameplay behavior.
- Quantify and test proposed numerical mechanics before approval.
- Maintain the established project development queue.
- Request approval before each phase.

**No code changes, new equipment slots, crafting recipes, stat modifications, save migrations, or gameplay implementations are authorized by AMMO-12.**

---

## Addendum — Player Intent Preservation Invariant

**Status:** `[PROPOSED]` clarification, UNLOCKED. Submitted by Sam, Oct 16. Recorded verbatim, then Claude Design's notes.

The saved equipment preset represents the player's choices and must not be automatically rewritten by changes in equipment availability.

### Rules

1. Equipment breakage, repair, suspension, inventory changes, and capacity changes may alter the active loadout but must not modify the saved preset.
2. Automatic restoration recalculates active equipment from the saved preset without changing assignments or priorities.
3. Missing, broken, and incompatible equipment retains its saved reference and priority until the player explicitly edits the preset.
4. Only an explicit player editing action, or an approved and audited save migration, may modify a saved preset.
5. The game must never copy the currently active loadout back into the saved preset as part of automatic synchronization.
6. Applying an incomplete preset must not permanently replace missing assignments with whatever items happen to be available.
7. Pending transitions must remain distinct from both the requested preset and the physically applied loadout.

### Engineering acceptance test

- Save a preset containing modules A, B, and C.
- Break module A. Verify the active loadout changes but the preset remains A, B, C.
- Repair module A. Verify it automatically regains its assigned priority when eligible.
- Remove module B from accessible inventory. Verify its preset reference remains.
- Restore access to B. Verify the system restores it when eligible.
- Save and reload after each transition. Verify the preset remains unchanged.
- Repeat the sequence during offline simulation.
- Verify no automatic game event writes the derived active loadout back into the saved preset.

**Invariant:** The simulation may change what is possible, but it cannot silently change what the player asked for.

### Claude Design notes (Oct 16)

| # | Point | Recommendation |
|---|---|---|
| I1 | **Fit.** The invariant restates, as one rule, what §1 ("player intent is persistent"), §7 step 8, §10 and §11 already imply. No conflict with the draft or with locked rules found | Fold in as a §13 invariant (#9) when AMMO-12 is promoted, so it lives in one place |
| I2 | **Test numbering.** The sequence above becomes test **A25** in §19. It overlaps A05, A07 and A10 but adds the save/reload and offline repeats, and the "no write-back" check | `[PROPOSED]` A25 = this sequence |
| I3 | **Permanently gone items.** Rule 3 keeps a recycled or destroyed item's reference until the player edits the preset (consistent with A11: never recreated). Such presets can stay "Incomplete" forever | Ties to open decision §20 #10 (missing vs inaccessible). The UI needs a one-tap "clear missing" edit; that edit is a player action, so rule 4 holds |
| I4 | **Rule 4 migrations.** "Approved and audited save migration" is the only non-player writer | At Phase 6, any migration that touches presets gets its own acceptance check (preset fingerprint before/after, as JD1a did) |

**Teaching note:** this is the **source of truth vs derived state** pattern. The preset is the source; the active loadout is *computed* from it plus the world's current state. A derived value should be recomputable at any time and never written back. The moment it is, you have two sources of truth that drift. The final test bullet ("no automatic event writes the active loadout into the preset") is the most valuable check because it tests for the *absence* of a write, which normal play never reveals.


---

## LR1 — Single shared loadout resolver

**Status:** `[DECIDED Oct 16]` (Sam). **Fold into AMMO-12 at its next design revision (v1.3).** A dedicated regression test group is **required before implementation**.

**Sam's direction (verbatim):** Use a single shared loadout resolver for watched combat, offline simulation, repairs, and save loading. Each system should read the saved intent and current eligibility, then calculate the effective loadout consistently. That eliminates an entire class of bugs where the UI, combat engine, and offline simulator disagree about what is equipped.

**Why:** If two systems each work out "what is equipped," they will eventually disagree, and the player sees one loadout while combat uses another. With one resolver there is nothing to keep in sync. It is the same choice as H1 (one clock) and FX4 (shared survivor rules; the screen reads, never writes).

### What v1.3 must say (Claude Design draft, `[PROPOSED]` wording)

- **One resolver.** Watched combat, offline simulation, repair and breakage events, capacity changes, preset application and save loading all get the effective loadout from the same resolver. No other code computes it.
- **Inputs:** the saved preset (intent), current eligibility (ownership, access, durability, compatibility), functional capacity, and simulation time.
- **Output:** the effective loadout. Each module is Active, Suspended, Broken, Missing or Incompatible, plus the totals for effective bonuses. The UI shows this output and does not recalculate it.
- **Pure.** The resolver never writes to the preset, the inventory or the save. This is how invariant rule 5 is enforced.
- **Deterministic.** The same inputs always give the same output. The resolver draws nothing from random streams.
- **Called at simulation boundaries.** In-progress actions keep their captured snapshot (§9). The resolver's result applies to the next action.
- §7 (resolution rules), §11 (restoration procedure) and §12 (failure and repair) are rewritten as *calls to the resolver*, not separate procedures.

### Open (`[OPEN]`, decide at v1.3)

| ID | Question | Recommendation |
|---|---|---|
| LR-a | Is the effective loadout saved, or recomputed on every load? | **Recompute; do not save it.** If a cached copy is ever saved, it must be thrown away on load. A saved derived value is a second source of truth |
| LR-b | Tie-breaks inside the resolver (equal priority, one item referenced twice) | Saved list order; an item fills only its first eligible position |
| LR-c | Where it lives in code | Fact for Code (Phase 1 audit): which modules compute equipped state today |

### Regression test group LR (`[PROPOSED]`; required before implementation)

| ID | Test | Required result |
|---|---|---|
| LR-01 | Identical inputs sent through every caller (watched combat, offline sim, repair event, capacity change, save load, UI) | Identical effective loadout from every caller |
| LR-02 | Resolver purity | Preset, inventory and save fingerprints unchanged after any number of calls |
| LR-03 | Determinism | Repeated calls on one machine and across machines give byte-identical output; random-stream positions unchanged |
| LR-04 | Single source | A code check finds no other place that computes active, suspended or bonus state; the UI renders the resolver's output |
| LR-05 | Watched vs offline | Same event history → same effective loadout at every simulated timestamp (extends A19, A24) |
| LR-06 | Save/load | After load, the recomputed loadout equals the loadout before the save; any saved derived copy is ignored (LR-a) |
| LR-07 | Break or repair mid-action | The in-progress action keeps its snapshot; the next action uses the newly resolved loadout |
| LR-08 | Edge inputs: empty preset, every module broken, zero capacity, one item in several presets, item recycled | Valid output with correct statuses; no crash; no item duplicated or recreated |
| LR-09 | Invariant run (A25) driven only through the resolver | Preset stays A, B, C through every transition, in watched and offline play |

The LR group runs in the AMMO-12 Phase C gate ("No item loss or duplication") and again as regression at Phases D and E.

**Teaching note:** the name for this is a **single point of truth for derived state**. The usual design is a *pure function*: same inputs, same output, no side effects. Pure functions are cheap to test (LR-01 to LR-03 need no gameplay) and safe to call from anywhere, including offline catch-up. The thing to watch is quiet duplication. Someone writes a quick "is this equipped?" check in the UI for speed, and that's a second resolver. LR-04 exists to catch it.
