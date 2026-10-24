# Routes Tab — Open Integration Hooks

**Status:** Follow-up to `Routes_Tab_UI_Revision_Spec.md`
**Source:** Gaps surfaced by Claude Design after implementing the Routes tab revision
**Audience:** Claude Code
**Related systems:** TraversalContext, RuntimeZombieSpawner, CombatSystem, ScheduleSystem, TimeService

---

## 1. Context

The Routes tab UI revision (see `Routes_Tab_UI_Revision_Spec.md`) has been implemented. Claude Design correctly left three things as scaffolding rather than guessing at systems it doesn't own. Those three things now need a logic-side owner. This spec defines what each hook needs to do, not how the UI should look — the UI already exists and is waiting for data/events.

---

## 2. Hook 1 — Run-completion event → `ZI.setLastRun()`

**Current state:** `ZI.setLastRun()` exists as a UI-side call that populates the Last Run box (loot extracted, time, path) and enables the Claim / Send Again actions. Nothing currently calls it.

**What's needed:**
- A run-completion event in the runtime (likely owned by `TraversalContext` or `ScheduleSystem`, wherever route timers resolve) that fires once when a route run finishes, whether Idle or Active.
- The event payload should include everything the Last Run UI displays: route ID, biome, path/nodes traversed, elapsed time, loot table results (items + quantities), and any losses (survivor injury, vehicle condition delta).
- On firing, call `ZI.setLastRun(payload)` so the UI updates without a manual refresh.
- **Claim** action (if rewards aren't auto-granted on completion): needs a corresponding `ZI.claimLastRun()` or equivalent that triggers inventory/currency grant and marks the run as claimed.
- **Send Again** action: needs to re-submit the same route + same squad through the existing route-start logic. If the squad is no longer valid (survivor injured, vehicle condition too low), this should fail gracefully with a reason shown in the UI rather than silently no-op.

**Why this is first priority:** Without this, the Routes tab visually works but reports stale or empty data — the highest-traffic reward moment in the loop is currently non-functional.

---

## 3. Hook 2 — Encounter logic at Active Run nodes

**Current state:** The node-chain UI renders combat/loot/hazard/vehicle/extraction nodes as a visual scaffold. Clicking or reaching a node in Active Run mode does nothing yet — there's no encounter system behind it.

**What's needed:**
- A per-node trigger system that fires when the Active Run's progress reaches a node, presumably driven by `RuntimeZombieSpawner` for combat nodes and `CombatSystem` for resolution.
- Each node type needs a minimum viable behavior:
  - **Combat node** — spawn an encounter via `RuntimeZombieSpawner`, hand off to `CombatSystem`, return result (win/loss/flee) to the route runtime.
  - **Loot/cache node** — roll against the route's loot table, add results to the in-progress run's pending extraction total.
  - **Hazard node** — apply the route's listed hazard effect (e.g. Structural Collapse, Noise Traps) — effect type TBD by whoever owns hazard definitions.
  - **Vehicle node** — offer repair/refuel; if the player is actively monitoring, this could be a prompt; if unattended, default behavior should be defined (auto-skip vs. auto-repair if resources available).
  - **Extraction node** — terminal node, triggers Hook 1's run-completion event.
- Idle Run mode should resolve all nodes automatically using whatever default/auto-resolve logic Idle Runs already use elsewhere (this may already partially exist — check current Idle Run resolution logic before building new).

**Why this matters:** This is the actual gameplay behind "Active Run" as a distinct mode. The UI scaffold (this spec's predecessor, Change 1) has no function until this exists.

**Scope note:** This is the largest piece of remaining work. Recommend breaking it into its own spec per node type rather than building all five at once.

---

## 4. Hook 3 — Success Probability formula

**Current state:** The route card and squad assignment view reserve a UI slot for Success Probability, currently showing a placeholder/heuristic value.

**What's needed:**
- A formula owned by Combat/Traversal that takes: assigned squad's aggregate stats (likely weighted by the existing S/R/I/V/A/L stat block), route difficulty tier, zombie ecology mix for the biome (e.g. Shambler/Runner ratio), and current global Threat level — and returns a probability or qualitative risk band.
- Output needs to be cheap enough to recompute live as the player changes squad assignment (per the squad assignment view's live-updating requirement from the original spec).
- Suggest exposing this as a single function, e.g. `TraversalContext.EstimateSuccessProbability(route, squad)`, so the UI can call it without knowing the formula internals.

**Why this matters:** Right now the squad assignment screen's main feedback loop (try a squad, see risk change) is not actually live — it's cosmetic until this formula exists.

---

## 5. Suggested order

1. Hook 1 (run completion / `setLastRun`) — smallest scope, unblocks the highest-visibility broken UI element
2. Hook 3 (success probability) — formula-only, no new runtime systems, unblocks squad assignment feedback
3. Hook 2 (encounter logic) — largest scope, break into per-node sub-specs before starting

---

## 6. Out of scope for this spec

- Hazard effect definitions (referenced in Hook 2, owned elsewhere)
- Idle Run's existing auto-resolve logic, if any already exists — audit before building new logic for Idle nodes
- Visual changes to the Routes tab — UI is considered complete pending these data/logic hooks
