# Routes → Stockpile loadout link — completion report

**Batch id:** stockpile-loadout-2026-10-23
**Work date:** October 23, 2026, about 6:52–6:56 PM Pacific (Code).
**Report written:** October 24, 2026, retroactively (Creative Director, from the scripts, backups, test results and a diff against the pre-change copies in this folder). Code wrote no report at the time; this file closes that gap.
**Authority:** part of Sam's Oct 23 route-preparation authorization (`reference/routes-preparation-implementation.md`). No separate batch contract existed.

---

## 1. What changed

| Area | Change |
|---|---|
| Routes preparation panel | "Manage gear & carried items" now opens Stockpile **on a Gear & Loadout tab** and remembers the route plan (biome, selected route, Active/Idle mode, auto-repeat settings). The panel title shows the route name |
| Stockpile, Gear & Loadout tab | When opened from Routes, a **compact preparation panel** sits at the top: weapon, protection, carried kg, room for loot, travel estimate, fight win chance, avoid chance, updated live as gear changes. A **Return to selected route** button goes back to Routes with the plan restored |
| Stockpile tabs | A third tab, **Gear & Loadout**, joins Recycler and Storage. The loadout and carry panels moved there from Storage. Tabs got keyboard support (arrow keys, Home, End) and screen-reader roles |
| Storage tab | Now a grouped list of stored equipment and supplies (icon, name, count, rarity, condition) with buttons to **Gear & Loadout** and **Open Crafting** |
| Refresh | Stockpile refreshes on inventory changes and also polls once a second; refreshes are coalesced and cleaned up when the screen closes |
| Navigation | Any screen change clears the "preparing a route" state, so Stockpile opens normally from the tab bar |

**Files:** `screens-v3.jsx` (StockpileScreen), `Zombie Idler v2.html`, `Zombie Idler v2 - TEST SAVE.html` (SoloRoutePreparationPanel, new RouteLoadoutPreparation, SoloMainScreen, App routing, cache-buster `screens-v3.jsx?v=20261023-stockpile-loadout`).
**Scripts:** `APPLY_NAVIGATION.cjs` (checks pre-change hashes, then applies exact one-match replacements), `COMPACT_PREPARATION.cjs` (compact panel variant), `VERIFY.cjs` (runs all suites and re-verifies backup hashes).
**Not changed:** game rules, save keys, `game/*.js`. Route plan state is temporary UI state only; inventory and route-run saves stay the source of truth.

## 2. Verification

- `TEST_RESULTS.json`: **617/617** checks across 29 suites, no failures.
- Backup hashes re-verified by `VERIFY.cjs`.
- **Not verified:** browser rendering, clicks, touch, phone width, controller. No new test covers the Routes → Stockpile → Routes round trip.

## 3. Gaps found while writing this report

1. **Documentation was not updated at the time.** `CODE_STATE.md`, `DESIGN_HANDOFF.md`, the document index, `routes-preparation-implementation.md` and the tutorial spec are byte-identical to the pre-change copies. Fixed Oct 24 (CODE_STATE line added; index and handoff updated).
2. **Design conflict with STOCK-01 `[OPEN]`.** `reference/stock-01-stockpile-concept.md` proposes three tabs **Recycler · Storage · Food**, with Equip and Carry buttons on Storage rows. The code now has **Recycler · Storage · Gear & Loadout**. Sam needs to decide the tab set when STOCK-01 becomes a slice (for example, four tabs, or Food inside Storage).
3. **Tutorial spec §7.1** describes Stockpile as Recycler and Storage. It needs a line for Gear & Loadout when the tutorial batch is written.
4. **One-second polling** on Stockpile is a performance cost on phones. Note for mobile prep; the inventory-change event alone should be enough.

## 4. Smoke test for Sam (TEST SAVE)

1. Routes → select a route → **Manage gear & carried items**. Stockpile opens on Gear & Loadout with the compact preparation panel.
2. Equip or unequip a weapon; the win chance and travel estimate change.
3. **Return to selected route**: the same biome, route, mode and auto-repeat are selected.
4. Open Stockpile from the tab bar: it opens on Recycler with no preparation panel.
