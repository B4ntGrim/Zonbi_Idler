# Docs report — Oct 26 evening (Addenda 3, 4, 5, 5b, 6, 6b)

Source: the six Google Docs named above (read Oct 26, 15:00). Applied by `apply_oct26_pm.py` plus an inline step for BAL-A, index and handoff. Pre-change copies in `pre-change-pm/`. Docs only; no game code.

## Applied
| Addendum | Where |
|---|---|
| 3 conflicts | `food-01-nutrition-slice.md` (O3a/O3b, F5, F11, F15, meals target; three conflict rows removed); `parked/food-02-cooking-concept.md` §1b; `balance-03-round8-regen-oct21.md` §6; `wandering-design-audit.md` §6; `sim-harness-v1-brief.md` §12; `reports/level-12/` |
| 3 weight | `wandering-tab-spec.md` §14.3 (W-1 supersedes salvage weight), §14.4 (W-2); `weapons-development-directive.md` (gem socketing parked) |
| 4 | `concordance-introduction-concept.md` §2a (CI14–CI18), CI6 wording |
| 5, 5b | `wandering-fort-scene.md` (Elder Jerry, §12.2a dialogue tree); `trav-01-traversal-slice.md` §2a (TRAV-02, 02a, 02b, Camp Leader assignment); `route-01-route-builder-concept.md` R3; `tutorial-first-session-spec.md` §5 |
| 6, 6b | `playtest-findings-oct15.md` PF14–PF16; `slice-retreat-broken-batch-a-draft.md` §3b status |

## Deviations and findings
- **Codex "fail" reclassified:** B6 isn't built; `codexFromWandering` is still `false` (`game/wandering.js:315`). Not a defect, not a BAL-A blocker.
- **Hide "[OPEN] confirm 2 uses":** already decided (CLOCK-01 O1, Oct 24); recorded as decided.
- **PF15 cause found (read-only):** Continue calls `loadSlot`, which replaces live `zi_*` keys with the slot snapshot; snapshots are written only at file creation and on manual Save; no autosave. Matches every symptom. Fix proposed, not applied.
- **New conflict:** T18 travel stamina vs ST1 and TRAV-02 (recorded `[OPEN]` in `trav-01` §2a).
