# FX4 — Completion Report (Oct 13)

**Closing line:** `FX4 SHARED ATTRIBUTES: CLOSED`

**Batch:** FX4 Shared survivor attributes, locked by Sam Oct 12 with D-FX4a = A (pace saved) and D-FX4b = A (speed buffs in the shared store, running out on their normal timer). Archived as `reference/archive/fx4-batch.md`; brief `reference/fx4-shared-survivor-attributes-slice.md`. One extra test edit authorized by Sam during the batch (`SurvivorRules` added to `split-equivalence` ADDED).

## Step 1
Done before the lock (brief §3). Re-confirmed Oct 12: no new reader or writer of `moveSpeed` / `healPct`.

## Step 2 — implemented
| File | Change | sha256 (12) before → after |
|---|---|---|
| `game/items.js` | New `ZI.SurvivorRules`: `PACE` table, `conditioning()`, `moveSpeed(state)` (pace × gear × speed buffs at the buff moment), `healPct()` (the First Aid rule heals already use), `msToSpeedChange(t)`. `addBuff`: a new speed buff ends the running one (the screen's old replace behavior) | e1c3535c349c → c50339764c66 |
| `game/wandering.js` | `advance()` recomputes `state.moveSpeed` from the rule at every step (the stored value is only that step's copy); a speed buff's start or end is an exact segment boundary, so movement is identical for any chunking | 7a4c24b25836 → 0597646d4ac4 |
| `screens-v3.jsx` | Reads the rules; pace opens on the saved `moveMode` and saves each change; speed shots go through `addBuff`; no longer writes `moveSpeed` / `healPct`; dead stim timer and unused heal % removed | 6c4695474113 → a24f8438d44d |
| Both HTML files | Cache-busters for `items.js`, `wandering.js`, `screens-v3.jsx` | |
| `tests/fx4-shared-attributes.test.js` | New, 10 checks | new → 1b68f8aca09a |
| `tests/split-equivalence.test.js` | Authorized: `ADDED` + `SurvivorRules` | b2a95e8df62e → 079cdf8bf88d |

`game/active.js` was not changed: the overload walker reads the per-step copy, so it applies on top as before (check 7). No other game or test file changed.

**Note:** the screen had no heal % label, so check 8 verifies the rule equals what heals use and that a heal restores exactly that amount.

## Step 3 — verification
| Item | Result |
|---|---|
| New suite | **10/10 PASS** |
| All suites | **20/20 PASS** |
| r1 ×20, frozen clock | 20 identical runs, identical to pre-FX4; checks 20 and 26 pass, unedited |
| sim-clock-rng ×5 | identical, identical to pre-FX4 |
| Differential vs pre-FX4 (2 policies × 3 seeds, all saved game state, frozen clock) | Identical: no gear on Walk (away and watched) · Nail Bat · old stored Run speed vs the same save with Run pace saved. **Declared:** slowing gear never watched (now slower) · an old save left on Run with no saved pace (now walks until the player picks Run once) |
| Browser check (Sam, TEST SAVE page, Oct 13) | Pace stayed on Run after leaving the tab and reloading. Fingerprint 989431190 (29 real-game keys) before and after play: unchanged. **Gap (Sam, Oct 13):** a speed buff was not used in the browser. The screen's speed-shot path (`useConsumable` → `addBuff`) is covered only by a browser check; follow-up check requested Oct 13. **Resolved Oct 13:** Sam had no save with a speed shot, so Claude Design ran the check in a headless browser on the TEST SAVE page (new game, Adrenaline Shot equipped from the console, Jog pace): the shot button appeared; using it logged "+30% speed"; `getActiveBuffs()` held one buff `speedPct 30` lasting 45 s; the pace label went 4.8 → 6.2 m/s (× 1.3); after 45 s it went back to 4.8 and the buff was gone; no page errors. Script: `tools/browser-check/` |

**Console warning seen during the browser check (not FX4):** React's "Updating a style property during rerender (border) when a conflicting property is set (borderLeft)" in `RmatCraftingScreen`. That screen lives inline in the HTML files, which FX4 changed only in their cache-busters; the same component is in the Oct 10 Design export. Existing, cosmetic; candidate for a later UI clean-up.

## Folder state
`CURRENT_BATCH.md` is back to "none active". Pre-FX4 copy kept outside the project.
