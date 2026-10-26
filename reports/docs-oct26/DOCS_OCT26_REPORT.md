# Docs report — Oct 26 instruction docs applied

Source: Google Docs "Zed Idler — Code Instructions Oct 26", "… Addendum", "… Addendum 2" (read Oct 26, 12:40). Applied by `apply_oct26.py` and `apply_oct26_b.py` (exact-match edits; each matched once). Pre-change copies in `pre-change/`. Docs only; no game code.

## Applied
| Block | Where |
|---|---|
| B1–B6 | `slice-retreat-broken-batch-a-draft.md` §3b (with audit notes) |
| F1–F18, O3a–O3c, ST1–ST3, NB1 | `food-01-nutrition-slice.md` §3b, P6, §4 (O3 struck, O6 extended, 3 conflict rows) |
| F3, F10, F13, F14, F17 | `parked/food-02-cooking-concept.md` §1b |
| F4, F7, ST2, F5, F18 | `wandering-tab-spec.md` §2.3 note, 13.4 table, 13.8 route cost and food line, 14.1 Food slot |
| MS1–MS2 | `wandering-fort-scene.md` §12.2; `tutorial-first-session-spec.md` Beat 8 |
| MS3 | `sim-harness-v1-brief.md` §12 (proposed, conflict with D3) |
| CI1–CI13 | new `concordance-introduction-concept.md`; Fort §12.2 pointer |
| CI11, F11, F12, O3a | `wandering-design-audit.md` §6 |
| O3 rerun inputs | `balance-03-round8-regen-oct21.md` §6 |
| Level-12 | `reports/level-12/LEVEL12_REPORT.md` (read-only) |
| Index, handoff | `00-document-index.md`; `DESIGN_HANDOFF.md` (old: `archive/design-handoff-oct25-26.md`) |

## Deviations from the docs (and why)
- **NB1** recorded `[PROPOSED]`, not decided: Sam asked to see the mock-up first.
- **F5 cap, F15 day unit, F11 rate, O3a** recorded as Sam decided them, with `[OPEN]` conflict rows (FOOD-01 §4) rather than silently picking a value. Reasons in the handoff §3.
- **B5** recorded as steering A4's tuning toward mild; A4's values stand until a playtest batch.
- **B6:** BEST1 dependency confirmed (CLOSED Oct 17; `codexFromWandering` exists, `false`). Flipping it is batch work.
- **F7** names the actual encounter ("Broken-down vehicle", Criminal pool).
- **F18** notes it is distinct from the Legendary Lunch Pail (a Trinket).
- `stock-01-stockpile-concept.md`: no Food-slot capacity wording to change; untouched.
