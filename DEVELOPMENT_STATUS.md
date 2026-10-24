# Zed Idler — Development Status

**Last updated:** 2026-07-05
**Prototype file:** `Zombie Idler v2.html` (React + Babel, in-browser)
**Data layer:** `game-data.js` (all systems live under the global `window.ZI` namespace)
**Companion files:** `screens-v3.jsx` (screen components), `bestiary-data.js` (45-zombie catalog), `pixel-art.js` (SVG sprite gen)
**Backend:** `server/` (C# serverless), `unity/` (C# client scaffolding) — not wired to the HTML prototype

---

## 1. What this document is

A snapshot of the **HTML prototype's** systems for Claude Code, so the Unity/C# implementation can mirror the same data shapes, formulas, and event hooks. The prototype is the source of truth for **game feel and balance**; Unity is the production target.

Every system below is implemented and functional in the prototype unless flagged **(scaffold)** or **(stub)**.

---

## 2. Namespace & persistence conventions

- All game data hangs off `window.ZI`.
- Persistent state uses `localStorage` with `zi_`-prefixed keys, each with a getter/setter pair on `ZI`.
- Formulas are pure functions on `ZI` (e.g. `ZI.estimateSuccessProbability(...)`) so they can be unit-tested and ported directly to C#.
- No auto-save; the prototype persists per-system on mutation. Unity should own a single `GameState` snapshot instead (see backend spec).

### localStorage keys in use
| Key | Owner system | Shape |
|---|---|---|
| `zi_stat_xp` | Survivor stats | `{ firstAid, scavenging, stealth, … : xp }` |
| `zi_cmd_window` | Command rate limit | `{ start, count }` |
| `zi_wander_loot` | Wandering → Recycler feed | `[ recyclerItem ]` |
| `zi_wander_run` | Background patrol engine | full run state (see §5) |
| `zi_loadout` | Gear loadout | `{ slotId: itemId | null }` |
| `zi_stash` | Crafted gear stash | `{ v, items: [itemId] }` |
| `zi_last_run` | Routes Last Run | run summary (see §6) |

---

## 3. Crafting system (`game-data.js`)

- **Materials:** `ZI_MATERIALS` — 6 base resources (metal, wood, cloth, electronics, fuel, medical), each `{ name, icon, color, current, max, sources }`.
- **RMAT tiers:** `ZI.RMAT_TIERS` — T0 Trace → T5 Exotic Echo, `{ tier, name, rarity, color, desc }`.
- **Recipes:** `ZI.CRAFT_RECIPES` — ~85 total:
  - 35 RMAT recipes (`kind: 'rmat'`), 5/7/7/6/5/5 across T0–T5.
  - ~50 gear/consumable recipes (`kind: 'gear' | 'consumable'`) appended by `ZI._appendGearRecipes()`, which runs **after** `GEAR_ITEMS` is defined (load-order matters — see §4).
- **Recipe shape:** `{ id, name, icon, tier, kind, out:[{n,q}], cost:{mat:qty}, time, unlock, lore, grantsGear?, grantsQty? }`.
- **Drop rates:** `ZI.CRAFT_DROP_RATES` — per-enemy T0–T5 % arrays (length 6).
- **Craft action** (in `RmatCraftingScreen`): atomically deducts materials, grants output. If a recipe has `grantsGear` (or an output name matches a `GEAR_ITEMS` entry), the item is granted into the equip stash via `ZI.grantGear()`. T5 requires a confirm modal + fires a full-screen lore event.

**UI:** 3-column (materials/tiers · recipe browser · detail+drop-rates). Filters: kind (ALL/RMAT/GEAR/CONSUM) + tier (ALL/T0–T5). Gear/consumable recipes show a `⚙ EQUIPS` badge.

**Not yet done:** real multi-hour craft timers/queues — crafting resolves instantly (prototype convenience). Unity should implement the timer + queue + offline catch-up per the crafting design doc.

---

## 4. Gear loadout system (`game-data.js` + Wandering/Storage UI)

- **Slots:** `ZI.GEAR_SLOTS` — 14 typed slots `{ id, label, accepts, group }`.
- **Items:** `ZI.GEAR_ITEMS` — weapons/armor/gear/consumables `{ id, name, slot, cat, rarity, icon, dmg, armor, carryW, speedDelta, lootBonus, desc, effect? }`.
- **Consumable effects:** unified `effect` schema resolved at use-time — `{ heal, healOverTime, speedPct, damagePct, armor, lootPct, duration, revive, clearEnemy }`.
- **Stat resolver:** `ZI.resolveLoadoutStats(loadout)` → `{ displayHP, armorRating, carryCapacity, speed, lootBonusPct, weaponDamage, filled, hasWeapon }` (spec §13 formulas).
- **Stash gating:** stash starts **empty**; only crafted gear appears (`ZI.grantGear`). `ZI.STASH_VER` bump wipes any older seeded stash.
- **Equip/unequip:** `ZI.equipGear(itemId, slotId)` / `ZI.unequipGear(slotId)` — enforce slot/category compatibility, displaced items return to stash.

**UI surfaces (share one loadout):**
- **Wandering** → 🎒 Gear overlay (paperdoll + stash + live stats) and per-consumable Use buttons in the HUD.
- **Stockpile → Storage** → interactive crafted-gear loadout menu.

---

## 5. Wandering (active patrol) — `screens-v3.jsx`

- **Bestiary pool:** built from `bestiary-data.js` (45 zombies), depth-gated by lap via tier rank.
- **Movement:** Walk/Jog/Run — base 3 m/s, jog/run scale with the survivor's Athletics; final speed also scales by gear Speed stat and active Stim buffs.
- **Stat integration (formulas in `ZI.STAT_FORMULAS`):**
  - **First Aid** → heal %/count per level; heals grant First Aid XP.
  - **Scavenging** → loot quality % + rarity-filter unlocks; XP per kill/item.
  - **Stealth** → scout reveal count + push distance; XP per scout/push.
- **Command rate limit:** 60 actionable cmds / rolling 24h (`ZI.consumeCommand`, `ZI.cmdsRemaining`). Free verbs: help/status/clear.
- **Background engine (`ZI.WanderEngine`):** single always-on 1s ticker; advances distance, resolves auto-combat, banks loot, registers checkpoints, auto-heals while the tab is **unmounted**. Returns a "while you were away" recap on remount. Run state persists in `zi_wander_run`.
- **Checkpoints & slider:** every 250m; a linear journey slider renders reached checkpoints as clickable travel points.
- **Loot → Recycler:** carried items bank to `zi_wander_loot` on Return to Base / retreat and surface in Stockpile → Recycler (green ◈ badge).
- **Downed state:** revive-on-downed if a `revive` consumable is primed; otherwise drop loot (except most valuable) and return to base.

---

## 6. Routes tab — `Zombie Idler v2.html` (`SoloMainScreen`)

Implements the full **Routes UI Revision Spec** + the three **Open Integration Hooks**.

- **Route data:** `ZI.ROUTES` enriched with `{ nodes, rmatTier, lootRange, recLevel, squadMin/Max, hasVehicle, vehicleWear, staminaCost }`.
- **Node chain (Change 1):** `ZI.routeNodeType(name)` + `ZI.NODE_META` (icon/color per type) → subway-style `RouteNodeChain` on cards (compact) and detail (labeled). **Scaffold only** — no encounter logic at nodes yet.
- **Canonical RMAT labels (Change 8):** `ZI.rmatLabel(tier)` → `"RMAT T1 (rare)"`, used everywhere.
- **Squad assignment (Change 3):** `ZI.SQUAD_ROSTER` (5 survivors); `SquadAssignPanel` toggles members into slots with live success prob.
- **Threat reflection (Change 4):** card border/pips shift toward danger with global threat; mutation-zone warning tag on high-risk routes.
- **Auto-repeat (Change 7):** per-route toggle in Idle mode (`autoRepeat` state), loop indicator on cards.

### Open hooks (now implemented)
- **Hook 3 — Success probability:** `ZI.estimateSuccessProbability(route, squadIds, threat)` (squad power vs. difficulty+threat) + `ZI.riskBand(prob)`. Live in squad panel + detail.
- **Hook 2 — Node resolution:** `ZI.resolveRunNodes(route, squadIds, mode, threat)` walks nodes by type (combat roll / loot / hazard / vehicle wear / extraction), returns `{ prob, loot, vehicleWear, losses, log }`. Idle applies ×0.7 loot.
- **Hook 1 — Run completion:** `ZI.completeRun(...)` resolves + writes Last Run (unclaimed). `LastRunPanel` shows the per-node log with **Claim** (`ZI.claimLastRun()` → banks loot to Recycler) and **Send Again** (`ZI.canSendAgain()` validates squad).

**Last Run summary shape:** `{ routeId, name, biome, nodes, squadIds, mode, time, loot, vehicleWear, losses, log:[{node,type,text}], claimed, at }`.

---

## 7. Other implemented screens

- **Stockpile** (parent tab): **Recycler** sub-view (breaks items → materials; runtime queue with background/offline processing; slowed to `weight × 14000 / opSpeed` ms) + **Storage** sub-view (materials + crafted-gear loadout).
- **Marketplace, Factions, Traversal (satellite grid), Codex, Stats** — present from earlier phases.
- **Zombie Codex:** per-zombie combat stats (min/max hit, chance to hit, accuracy, crit, lifesteal, DR, evasion); undiscovered entries show `????` until encountered.

---

## 8. Known gaps / next steps

1. **Craft timers & queues** — currently instant; needs real timers + offline catch-up (crafting design doc §7).
2. **Active-Run node encounters** — node chain is visual scaffold; per-node combat/choice logic is the next workstream (Routes spec §11, out of scope so far).
3. **Squad combat in Wandering** — resolver supports it as a degenerate 1-member call; multi-member live combat not surfaced in the active patrol UI.
4. **Success probability formula** — prototype heuristic; Combat/Traversal system owns the canonical version for Unity.
5. **Server wiring** — HTML prototype is fully client-side; the C# serverless endpoints (save/sync, telemetry, daily/claim, prestige) exist in `server/` but aren't called from the prototype.

---

## 9. Porting notes for Claude Code (Unity/C#)

- Treat every `ZI.*` pure function as a spec for a C# static method — the formulas are intentionally simple and side-effect-free.
- Mirror the localStorage key shapes as serializable structs folded into a single `GameState` snapshot (JSON, gzip per backend spec).
- Recipe/gear/route data are authored as flat arrays → port as ScriptableObjects + a seeder (matches the existing `unity/` catalog pattern).
- The prototype's balance numbers (craft times, drop rates, stat formulas, success-prob weights) are the tuned values — carry them over verbatim, then expose via `BalanceConfig` for later tuning.


---

## Section 12 Final Specification Decisions (Fort brief)

**Status (2026-10-01):** Section 12 is tested and stable. 20/20 manual QA tests accounted for, 84/84 automated tests pass, no game bug found. The behavior below is **unchanged and stays as implemented** until each decision is made. Nothing here is implemented differently; these are open specification questions only.

### 1. Quest eligibility — CONFLICT, decision required
- **Fort brief 10.1** (`wandering-fort-scene.md`): "Quest offered to Stranger or Wary survivors, not Heinous [DECIDED]". (9.2 item 5 proposed the same: "Stranger (neutral) or Wary (estranged), and not to Heinous".)
- **Wandering spec v2, 2.5**: "The reception depends on policy and standing (Stranger, Neutral or Wary survivors can be offered a quest; Heinous is refused)."
- **Conflict:** whether **Neutral** (rank 100–249) survivors are eligible.
- **Precedence:** neither document states that it overrides the other on this point.
- **Current implementation:** no standing check on the quest offer at all (Heinous is refused by policy only).
- **Decision needed:** Stranger + Wary, or Stranger + Neutral + Wary.

### 2. Fort placement — PROVISIONAL
- **Source wording:** "The first Fort is at a fixed Traversal square near the start, so every player finds it early. It is part of the tutorial" (Fort brief 10.1; spec v2 2.5 says "a fixed location on a Traversal square near the start").
- **Current implementation (provisional, Claude's value):** a seed-chosen open cell 2–3 cells from the start cell (Chebyshev distance; locked/contested cells excluded). Fallow Ground is placed next to it.
- **Known effect:** a sector is 8×6 cells, so the Fort can land outside the starting sector view. In QA this happened in 4 of 5 checked starts.
- **Decision needed:** the distance/placement rule, including whether the Fort must be inside the starting map view.

### 3. Failed-attack HP — PROVISIONAL
- **Source wording:** "Failure: you are wounded and driven from the pikes. You may try again." (10.4). 11.3 defines the lasting injury but gives no HP amount.
- **Current implementation (provisional):** −28 HP (never below 1) plus the injury (−10% combat and athletics, about 3 days).
- **Decision needed:** the HP loss on a failed attack.

### 4. Starter-kit timing — PENDING
- **Source wording:** "The tutorial gives the survivor a med kit" (11.2); "The tutorial gives the player a small item the Hearthguard want (a med kit is suggested…)" (10.5).
- **Current implementation:** one Field Medkit is granted the **first time the Traversal screen opens** in a save (`ZI.ensureStarterKit()`, guarded by `zi_fort_starter_given`), not at a specific tutorial step.
- **Decision needed:** the moment the kit is given (for example on first Traversal visit, at a named tutorial step, or at save creation).

### 5. Sealed Crate weight — PROVISIONAL
- **Source wording:** "The crate is a story item and takes 1 pocket." (12.2). No weight is given.
- **Current implementation (provisional):** 3 kg (`carryW: 3`). It goes to the stash; there is no pocket system yet.
- **Decision needed:** the crate's weight.
