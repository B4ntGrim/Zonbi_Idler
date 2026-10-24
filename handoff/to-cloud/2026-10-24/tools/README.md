# Tools and scripts — 2026-10-24

Rule (Sam, Oct 24): every tool or script Claude writes or runs against this system is duplicated here.

| Script | Where it ran | What it did |
|---|---|---|
| `h2-worker.js` | Claude cloud workspace, on the copy in `source-snapshot.tar.gz` | Runs the H2 full matrix (80 runs × 30 days) split across workers: `node h2-worker.js <root> <k> <n>` runs every n-th combination. Same `runOne`, seeds and days as `tools/sim-harness/h2.js full`; skips runs already written |
| `oct24-clock01-lock.py` | Sam's PC (device shell), in `E:\Zed_Idler` | Recorded CLOCK-01 O1–O6 in `reference/clock-01-slice.md`, then copied §6 into `CURRENT_BATCH.md`. The TRAV-01a contract was archived as `archive/trav-01a-batch.md`. Pre-change copies: `reports/docs-oct24/pre-change/` |
| `oct24-route-prep-record.py` | Sam's PC (device shell) | Added §0 decision record to `reference/routes-preparation-implementation.md` and the Stockpile line to `CODE_STATE.md` |

The two .py files are reconstructions of the inline scripts as run (same logic), saved after Sam set this rule.
| (inline) index update | Sam's PC (device shell) | Added Oct 24 rows to `reference/00-document-index.md` (CLOCK-01 status, route-prep record, 39 copied documents, reports, handoff rule). Not saved as a file at the time; the change can be reproduced by diffing against `reports/docs-oct24/pre-change/00-document-index.md` |

From here on, every script is saved in this folder first and run from here.
