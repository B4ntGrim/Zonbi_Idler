# Solo routes: preparation implementation

**Date:** October 23, 2026.
**Status:** implemented from Sam's explicit authorization (Oct 23). **Decision record added Oct 24** (§0): this slice went straight to code without a slice brief or `CURRENT_BATCH.md`; §0 records retroactively what Sam decided, what stays proposed, and what is out. Starting values accepted by Sam Oct 24.

## 0. Decision record (added Oct 24, retroactive)

*Why this section exists:* every implemented rule must live in a design document with its tag. This work was authorized in conversation and built the same evening, so these lines are written after the fact from Sam's authorization and Code's reports.

### Decided constraints

| Rule | Tag |
|---|---|
| Solo route preparation uses the survivor's real skills, equipped working gear and carrying space, for both the preview and the result | `[DECIDED Oct 23]` Sam |
| Preview and result use one shared calculation | `[DECIDED Oct 23]` Sam |
| Returned loot is capped by remaining carrying room; overflow is reported | `[DECIDED Oct 23]` Sam |
| XP comes from what actually happened on the run (movement, avoidance, won fights, loot, hazards) through the existing dispatcher | `[DECIDED Oct 23]` Sam |
| Every completed idle haul stays claimable; Claim All banks each one; idle XP ×0.8 | `[DECIDED Oct 23]` Sam (idle fixes) |
| Routes links to Stockpile Gear & Loadout and back, keeping the route plan | `[DECIDED Oct 23]` Sam (built; report `reports/stockpile-loadout-2026-10-23/STOCKPILE_LINK_REPORT.md`) |
| `ROUTE_PREP_TABLE` values below are **accepted as starting values**; playtesting tunes them | `[DECIDED Oct 24]` Sam |

### Data table — `ZI.ROUTE_PREP_TABLE` (`game/routes.js`), starting values accepted Oct 24

| Value | Start | Meaning |
|---|---|---|
| `combatPerLevel` | 0.5 | Fight win % per Combat level above 1 |
| `athleticsCombatPerLevel` | 0.1 | Fight win % per Athletics level above 1 |
| `weaponPerDamage` / `referenceDamage` | 0.3 / 8 | Win % per weapon damage point above 8 |
| `armorPerPoint` | 0.25 | Win % per armor point |
| `threatPenalty` | 2 | Win % lost per threat level |
| `minWin` / `maxWin` | 5 / 95 | Win chance clamp |
| `stealthPerLevel` | 0.8 | Avoid % per Stealth level above 1 |
| `escapeToAvoid` | 0.2 | Share of gear escape bonus added to avoid |
| `quietAvoidBonus` / `maxAvoid` | 12 / 65 | Bonus for quiet gear; avoid cap |
| `athleticsTravelPerLevel` | 0.01 | Travel speed-up per Athletics level |
| `loadTravelPenalty` | 0.4 | Extra travel time at a full load |
| `minTravelMultiplier` / `maxTravelMultiplier` | 0.5 / 3 | Travel time clamp |
| `weaponNoise` | rifle 1, shotgun 1.2, pistol 0.8, revolver 1, suppressed 0.25, compound bow 0; other ranged 1, melee 0.2; T2 boots ×0.8 | Loudest equipped weapon sets noise |

### Open `[OPEN]`

- Stockpile tab set: STOCK-01 proposes Recycler · Storage · Food; the code now has Recycler · Storage · Gear & Loadout.
- How route noise relates to PF13 noise 0–4 (two noise scales would drift apart; reuse one).
- Whether route kills and route injuries should touch persistent HP, wear and the Codex (today they are summary text only).

### Explicitly out

Map circuits (ROUTE-01) · stamina and travel stamina (D2) · food and water use (FOOD-01) · vehicles and fuel · Camp Leader routes.

### Lesson

**Decision record before code.** A one-paragraph record like this, written before the build, takes five minutes and saves reconstructing intent later from diffs. The pattern is sometimes called an ADR (architecture decision record).

## Authorized scope and reason

Connect existing Solo skills, equipped gear, and carrying space to both preparation feedback and run results. Preparation should answer whether the survivor can handle encounters, how long travel takes, and how much salvage can come home. Stamina, food/water consumption, vehicle reliability, map circuit building, and new Camp Leader work remain outside this slice.

## Implemented behavior

- A shared preparation function reads actual effective skills, equipped working gear, and existing carrying totals. The Solo interface no longer uses the sample character's meters as readiness authority.
- Athletics, load, and equipment speed affect duration. Combat, Athletics, weapon power, and armor affect the chance of winning a detected fight. Stealth, quiet equipment, and existing escape bonuses affect avoidance.
- The preview and resolver use the same calculation. All tuning lives in game/routes.js under ROUTE_PREP_TABLE; values are initial implementation defaults.
- Departure saves a preparation snapshot and duration in the existing run record. Reloads and repeats retain it. Legacy records without one still resolve.
- Remaining hard-limit carrying room is converted through the canonical salvage-weight rule. Actual returned loot is capped and overflow is reported. Zero loot cannot manufacture Recycler material.
- Actual movement, avoidance, won combat, loot, and hazards feed the existing XP dispatcher. Route kills remain off-map, and existing idle XP scaling remains applied.
- Main and TEST SAVE pages display live Solo preparation, actual character level, capacity-based deployment reasons, a Stockpile gear-management link, and explanatory return summaries.
- UI refreshes are deferred, coalesced, and cancelled on unmount.
- Other-mode behavior is explicitly excluded from the new preparation path.

## Persistence and compatibility

Preparation is an optional field in the existing per-slot route-run record; no global key or save-format migration was needed. Unclaimed hauls continue to use the earlier reward-retention fix. Equipment or skills changed after departure do not retroactively alter that run or its repeat series; restart to use new preparation.

Current predefined routes still resolve separately from Traversal cells. This slice does not turn them into map circuits. Injury text remains a route-summary outcome; no new persistent injury, HP-loss, or equipment-wear loop was introduced.

## Verification

617/617 checks passed across 29 suites, including 24 preparation checks and 20 idle reward/XP checks. Four fresh Solo starts each completed three simulated days without harness failures or warnings. A deterministic 4,000-encounter check confirms the resolver follows its displayed avoidance and fight probabilities.

JavaScript syntax and matching components in both pages were checked. Browser rendering, live clicks, touch, and controller behavior were not exercised. No real save was accessed.

Pre-change source/test/document backups and machine-readable verification results are in reports/routes-preparation-2026-10-23/.

## LLM handoff

Sam requested reusable instructions and parsing data in E:/C2C:

- Zed_Idler_Routes_LLM_Instructions.md
- Zed_Idler_Routes_Parsing_Records.json

Those exports distinguish implemented code, user decisions, open questions, and proposed future work. The master project remains E:/Zed_Idler.

