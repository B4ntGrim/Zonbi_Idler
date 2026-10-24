# Solo route preparation — implementation and audit report

October 23, 2026. Sam explicitly authorized this implementation and E-drive backups.

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


## Files changed

- game/routes.js
- Zombie Idler v2.html
- Zombie Idler v2 - TEST SAVE.html
- tests/routes-preparation.test.js (new)
- tests/routes-idle-rewards.test.js (separates XP dispatch from stochastic encounter results and checks only actual nonzero hauls)
- tests/trav-01a.test.js (retains disabled-departure/visible-reason coverage using the new preparation reason)
- tests/split-equivalence.test.js (narrowly records authorized new functions and changed route functions)
- CODE_STATE.md, DESIGN_HANDOFF.md, reference/00-document-index.md
- reference/routes-preparation-implementation.md (new)
- Two new C2C export files, as requested.

Existing weapon references in C2C were unchanged. An implementation helper remains at reports/routes-brainstorm-2026-10-23/APPLY_PREPARATION.cjs for audit history; it is not a game module or an instruction to rerun the change.

## Verification artifacts

TEST_RESULTS.json, SMOKE_RESULTS.json, AUDIT_RESULTS.json, and pre-change/ are in this folder. FOCUSED_RESULTS.json records an intermediate run before the mixed-haul fixture was adjusted for a legitimately empty extraction; the final TEST_RESULTS.json is the current result.

## Next step

Reload the TEST SAVE page and visually review preparation, navigation to Stockpile, deployment reasons, running snapshots, and the return report. New map circuits or survival systems require their own scope.

