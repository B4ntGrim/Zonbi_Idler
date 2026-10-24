# CLOCK-01 — Documents report (Oct 23)

Documents only. No game code, tests or save keys changed. Pre-change copies are in `reports/clock-01/pre-docs/`.

## Search hits (reference/ and reference/parked/) and action taken

| File | Hit | Action |
|---|---|---|
| `reference/trav-01-traversal-slice.md` | T3 (Year and Day only) | Superseded by CL2 |
| same | P3 (Hide short time) | Superseded by CL3 |
| same | T15 (Make camp) | Extended by CL4–CL5 |
| same | §7 CLOCK-01 row, status line | Point to `clock-01-slice.md` |
| `reference/playtest-findings-oct15.md` | PF7 decision note | Oct 23 note added |
| `reference/00-document-index.md` | trav-01 row | Updated; new slice row, reports row, Oct 23 log entry |
| `reference/fx2-per-return-cap-slice.md` | 24 h per-return cap | Consistent with CL6; no change |
| `reference/wandering-tab-spec.md:134, 585` | 24 h offline cap | Consistent with CL6; no change (confirm "real hours" wording when the slice closes) |
| `reference/sim-harness-v1-brief.md:68, 104` | 24 h offline cap | Consistent; no change |
| `reference/parked/wandering-workshop-scene.md:74` | 24 h offline cap | Consistent; no change |
| `reference/tutorial-first-session-spec.md:90` | Traversal tutorial lists Hide and Make camp | Flagged in slice §5 for update when CLOCK-01 closes |
| `reference/playtest-findings-oct15.md:164-168` (PF13) | Make camp and Hide noise | Parked; no change |

## Not changed
- `CURRENT_BATCH.md`: still the TRAV-01a contract. The CLOCK-01 draft (slice §6) replaces it after Sam locks O1–O6.
- Game code: `stats.js:396` still has `hideGameHours: 1` and `screens-v3.jsx:904` still skips 24 game hours, until the batch runs.

## Conflicts found
- **Rate:** T8 (1 real minute) and the timer survey (5 real minutes) disagree. Raised as O2.
- **Server clock:** CL1 names "the server's game clock", but the prototype has no connected server; the clock is saved in the browser and already runs while closed. Recorded as a `[CODE]` fact in the slice.
- **Calendar vs credit:** CL1 (date moves for the whole absence) and CL6 (24 h credit) need a stated relationship. Raised as O4.
