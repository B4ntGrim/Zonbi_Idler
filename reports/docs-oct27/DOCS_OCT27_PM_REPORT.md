# Docs report — Oct 27 PM (Addenda 10, 11, 11b–11i)

Applied by `apply_oct27_pm.py` (exact-match edits, each matched once). Pre-change copies in `pre-change-pm/`. Instruction source: Google Docs "Zed Idler — Code Instructions Oct 26 — Addendum 10 (PF15 order, hazard counters, Perimeter)", "— Addendum 11 (gear tiers, Legs slot, Concordance disguise)" and "— Addendum 11b … 11i" (Sam, Oct 26 22:30–22:40 UTC). Found by the daily sync; not covered by `docs-oct26/DOCS_OCT26_EVE_REPORT.md` (stops at 9c) or `DOCS_OCT27_REPORT.md` (voice session). Docs only; no game code.

| Addendum | Where |
|---|---|
| 10.1 PF15 first | `pf15-save-continue-slice.md` status and §3; index row; handoff |
| 10.2 improvised counters, 10.3 Perimeter | `biome-01-chunks-slice.md` City and Perimeter rows; counter-gap note resolved (original kept struck) |
| 11.1 Concordance = improvised tier | `concordance-introduction-concept.md` CI19; `biome-01-chunks-slice.md` resolution note |
| 11.2 Legs slot | `wandering-tab-spec.md` paperdoll line, 14.1 Belt line, 14.2 "no legs slot" struck |
| 11.3 disguise | `concordance-introduction-concept.md` CI20 |
| 11b, 11c, 11d | CI21, CI22; `trav-01-traversal-slice.md` new TRAV-02e |
| 11e stripped | CI23; `wandering-tab-spec.md` 13.8 Batch 3B note (exception line) and 15.3 pointer |
| 11f prisoner quest | new `parked/prisoner-quest-concept.md`; pointer in `parked/faction-quests-and-poi-density.md`; index parked row |
| 11g, 11h | CI14 table rows; CI24, CI25 |
| 11i actions inside | CI26 |
| All | `00-document-index.md` (rows, log); `DESIGN_HANDOFF.md` (old: `archive/design-handoff-oct27-am.md`) |

## Conflicts recorded `[OPEN]` for Sam (not chosen)
- **CI14 total:** CI14 was decided "values kept as set" at 25% total (also quoted in CI6). Addendum 11g's piece rates raise it to about 50%. Recorded as Sam's decision to add the pieces, with the total `[OPEN]`.
- **CI19 vs CI14 rarities:** Addendum 11 puts Concordance gear on the improvised tier and durability; CI14 gives rarities up to Legendary and calls the field scanner the strongest. Scope `[OPEN]`.
- Addendum 11 explicitly supersedes Addendum 10's ladder reading (Concordance above improvised); recorded as superseded, not a conflict.

## Findings
- Addendum 11's paperdoll list has no Ranged slot, but CI14's dart gun uses "Ranged" (and spec item 7 mentions a Rig slot). Not changed; flag for the W-3/paperdoll audit.
- GitHub branch `codex/faction-infiltration-20261026` (Oct 26 22:51) already contains infiltration code (disguise actions in Traversal, research log as story gear). It was written before these decisions were recorded in the docs; Code should reconcile it with CI19–CI26.
- The prisoner-quest file adds one `[OPEN]` (when capture replaces the light version); everything else is Sam's text.
