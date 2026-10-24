# BAL-A completion report: walk home and Broken (Oct 20)

**Status:** implementation complete, and all automated checks pass. **`BAL-A: NOT CLOSED`** until three things are done:
- **(1)** Sam's hands-on check in the TEST SAVE page;
- **(2)** the full 30-day H2 matrix (`node tools/sim-harness/h2.js . full`, about an hour);
- **(3)** Sam's review of the scope note in §4.

**Backup:** originals of all 20 changed files are in `archive/pre-bal-a-oct20/`.

## 1. Files
| File | Change |
|---|---|
| `game/active.js` | BAL-A data tables; Broken (enter, penalties, release, durability cost); rest-completed hook; home and return; walk-back groups and pursuers; injury (remaining time, visible-tick countdown, extension, bandage cure, migration v8); return-report rows; stress rule off; HP-only gate; overload ×2; getaway wording; `maxHp()` everywhere |
| `game/wandering.js` | Walk-back timer freeze (encounters, policy, discoveries); walk-home hook; Broken combat flags; injury credit tick and present window; bandage check after each window; `flushTooHeavy` parity fix |
| `game/stats.js` | Broken attack skip and +5% damage taken in `resolveAttack` (rolls drawn only when Broken) |
| `game/items.js` | Broken speed factor in `SurvivorRules.moveSpeed` |
| `screens-v3.jsx` | Status icons; HP bar at current max; new log lines; wording; clear the saved return on travel and Make camp; Make camp no longer treats the injury; Make camp heals to current max |
| Both HTML pages | Version stamps for the 5 changed scripts |
| `tools/sim-harness/h2.js` | Counts pursuer Downings, Broken entries, group meetings |
| `tests/bal-a-walk-home-broken.test.js` | **New**, 50 checks (acceptance 1–10) |
| 12 test suites | Updated where they asserted superseded rules (Breaking, stress rule, stress gate, ×1.15, old injury format, tutorial migration as newest, step-0 golden hash); each change is marked `BAL-A (authorized, Oct 19)` |

## 2. Acceptance checks
| # | Check | Result |
|---|---|---|
| 1 | Rule 5: no encounters, policy events or discoveries on the walk back; timers frozen | PASS |
| 2 | Pursuers, deterministic: escape, hit, miss, kill, Downed path, no yield, getaway has no effect, wording | PASS (8 checks) |
| 3 | Groups: friendly escort, neutral, hostile chain, theft only when Broken (haul only), cap 3 a day, unnamed before the Fort | PASS (7) |
| 4 | Broken: entry, penalties, release at rest 1, 2 and 3 by roll, forced after the third failed roll with cost, durability floor, other rest types not counted | PASS (11) |
| 5 | Home and return: move home, save the cell, keep it on a second retreat, instant return, camp is home, clears; HP-only gate; stress rule never fires | PASS (5) |
| 6 | Presentation | PASS (see 10) |
| 7 | Parity: 1-s, uneven and bulk identical through walks back, groups, pursuers, Broken and rests | PASS (also fx1 #7, r1 #28, batch3b #14/15) |
| 8 | Regression | **All 26 suites: 502/502.** H2 harness: dry run OK; reduced matrix (4 starts × 4 policies × 7 days × seed 101) **16/16 OK**, no D7 bound failures. **Full 30-day matrix not run yet** (too long for remote calls) |
| 9 | Injury: 1.5 h; visible-tick countdown (5-s cap, hidden page and first tick credit 0); extension only while present (+30 s/HP, cap 3 h); re-injury; frozen through a 72-h catch-up; bandage cure from a pocket or slot; Medkit and Make camp don't cure; migration (D7b); Fort uses the same rule | PASS (10) |
| 10 | Status icons (Broken first, tooltips, "paused while the game isn't visible"); HP bar at max HP; wording; log kinds; return-report rows | PASS (source-level). **Visual check in the TEST SAVE page still to do** |

## 3. Facts found during implementation
- **A latent parity issue, fixed:** the "too heavy" notice used to wait for the end of the next movement segment, whose timing depends on how time is chunked. The long, encounter-free walk back exposed it. It's now reported right after the event that caused it. State was never affected, only the order of events.
- **The walk back goes to the last checkpoint** (scroll-based), not home on the map. That's unchanged; only a Forced Retreat or hostile send-home goes home (D1).
- **The step-0 golden sequence** (sim-clock-rng #8) is identical until the first walk back, then differs as rule 5 intends. It was re-recorded.

## 4. Scope note for Design: Batch A alone doesn't produce the simulated 1–2 Downings a day
In the reduced harness matrix (production rules plus BAL-A, ethical, 7 days), each run averages about **65 Downings a day over about 6.7 km a day**. The unchanged build averages **about 30 a day over about 2 km a day**.

| Measure | Unchanged build | With BAL-A |
|---|---|---|
| Downings per km | about 15 | **about 10 (about 30% fewer)** |
| Distance | about 2 km a day | about 3× more |
| Kills | — | about 3× more |

BALANCE-03's 0.4–2 a day figure also assumed rules that are decided or proposed but **not in any batch yet**:
- the zombie tier following the square's difficulty (decided Oct 17; production still scales tier with walked distance);
- Option C heal-then-retreat (decided direction Oct 18);
- the near-death stress scale (Oct 18);
- the post-kill heal (direction Oct 17);
- consumable-only healing with no free base charges (Phase A, Oct 18; Batch B touches Medkits, but the free base charges aren't listed there);
- encounter spacing EN3 ×2 (a proposed lever, never decided).

Recommend Design schedules these, or confirms which of them Batch B or C should absorb, before tuning against the harness.

## 5. Not done (deliberately)
- Batch B and C content.
- The trade screen and animations beyond the icons.
- The Heinous all-factions rule and the item-tier loss on entering Broken (both parked).

## Addendum (Oct 20): smoke-test fix
- Found during Sam's TEST SAVE smoke test: four HP displays in `screens-v3.jsx` were hard-coded to "/100" (survivor card, status command, two Traversal loot messages). They now show the current max HP (`ZI.maxHp()`), so a Broken survivor reads /82.
- Version stamp for `screens-v3.jsx` bumped in both HTML pages.
- Re-run: bal-a, rb1, rb2, fx4, batch3b, load-regressions, fx1, 134/134 pass.
- Second smoke-test fix: the Traversal map read the survivor's position once, when the screen opened. When the game moved the survivor itself (a forced retreat or hostile group sending them home, or the instant return after a Base rest), the map kept showing the old cell until the screen was reopened. Added `ZI.onTravPosChange` / `ZI._notifyTravPos` (same pattern as `ZI.onInventoryChange`). `_sendHomeOnMap` and `_returnFromHome` announce the move; the map subscribes and redraws. Player travel and Make camp already updated the screen directly.
- 4 new checks in `tests/bal-a-walk-home-broken.test.js` (notices on move, none when already home, map subscribes, no HP display hard-coded to /100). Full suite: 26 files, 506/506.
- Third: the Jester relocation (`_finishTrade`) also writes the position; it now calls `ZI._notifyTravPos()` too.
