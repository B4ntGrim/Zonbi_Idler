# H2 simulation harness (CURRENT_BATCH.md, locked Oct 15)

- `h2.js` — the runner. `node tools/sim-harness/h2.js <project root> dry` runs the step-3 dry run (1 seed × 4 starts × ethical × 3 days); `... full` runs the 80-run matrix (step 4). Records and `SUMMARY.md` go to `reports/sim-harness-v1/<mode>/` (artifacts; not under version control).
- `h2-tests.js` — the acceptance checks (reproducibility, starts, no silent grants, T1, T2, T3, planted soft-lock states, isolation). `node tools/sim-harness/h2-tests.js <project root>`.
- Every return is a real page load (all game scripts evaluated against the saved storage; bootstrap settles run), then one engine tick per simulated second until caught up.
- Harness-only environment, never in the game files or a save: the Jester switch is on in the harness's in-memory copy of `game/active.js`; `Date` and `Math.random` are pinned to the simulated clock and seeded streams; `ZI.installRolls(seed)`; single-tab lead.
- Declared fixtures in each record: H2-a (A: Jester record `eligible:false`, `zi_starter_kit_given=true` with no kit items), Heinous unlocked (D4), the first Traversal visit (start square picked exactly as `screens-v3.jsx` ~703 does).
