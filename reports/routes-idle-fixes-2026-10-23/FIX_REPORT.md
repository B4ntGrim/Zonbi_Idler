# Idle route reward and XP fixes

Recorded October 23, 2026. Authorized by Sam after the smoke simulation reproduced both defects. All file work stayed in E:/Zed_Idler.

## Behavior

- Every completed haul remains claimable across auto-repeats, different routes, save-slot snapshots, and reloads. The Last Run path and loot still describe the latest individual run; an additional total shows every pending haul.
- Claim All banks each original haul separately, preserving material types and per-item conversion rounding. A second claim gives nothing. Old unclaimed reports participate once; already-claimed reports stay claimed.
- Idle completion and node-action base XP are scaled by 0.8 through the existing XP dispatcher. Per-profession rounding and existing bonuses retain their ordinary behavior. Active XP is unchanged.
- Both game pages show the pending total, use Claim All for multiple hauls, refresh while completions arrive, and read the XP multiplier from the same runtime table.

## Changed files

- game/routes.js
- Zombie Idler v2.html
- Zombie Idler v2 - TEST SAVE.html
- tests/routes-idle-rewards.test.js (new regression suite)
- tests/split-equivalence.test.js (four narrow entries registering authorized differences from the archived implementation)
- CODE_STATE.md

The new combat fixture was corrected to a stop classified as combat. The initial failing tests and pre-change files are retained in this report folder. Archives and original baselines were not edited.

## Verification

- 593/593 checks passed across 28 suites.
- 20/20 dedicated regression checks passed.
- Four fresh Solo scenarios each completed three simulated days; results are in SMOKE_RESULTS.json.
- JavaScript syntax checked; the two Last Run panels were confirmed identical.
- No real browser save was accessed. The tests used in-memory storage.
- Browser rendering, live clicks, touch, and controller behavior were not verified in this run.

## Audit notes

- The retained-haul array lives inside the existing Last Run save object, so the existing slot snapshot includes it automatically. No format-version bump is necessary.
- Route combat retains noCellKill metadata. Route actions still use the central XP dispatcher and existing finish-time buff evaluation.
- The earlier circuit-builder brainstorm remains a design concept. This task implements only the two reported route fixes and the UI needed to make pending claims clear.
- Loot multipliers, route risk formulas, transport, hydration, and Camp Leader design were not expanded.

## Session handoff

Both requested defects are fixed and covered by regression tests. Reload the main or TEST SAVE page to load the updated route module. Visual testing remains a separate check.