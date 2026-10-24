# Design sync Oct 10 — Report

**Closing line:** `DESIGN SYNC OCT10: VERIFIED` (Oct 10, on Sam's browser sign-off).

## Files (sha256, 12)
| File | Before | After |
|---|---|---|
| `screens-v3.jsx` | 68fa8f3da4df | 6c4695474113 |
| `Zombie Idler v2.html` | 5112a7eba005 | c5567f9e2879 |
| `Zombie Idler v2 - TEST SAVE.html` | 09f2cb1cb882 | ff2de90ecf77 |
| `CURRENT_BATCH.md` | 463ae02fa389 | 938bf005ca9c |
| `DESIGN_HANDOFF.md` | 5f0034cb33d3 | 939cc2439a94 |
| `reference/starter-weapons-cb1-slice.md` | 0b098dec8d97 | 537aee0213b7 |
Previous versions are kept outside the project. Every `game/*.js` and test file matches the Oct 10 package manifest.

## Diff confirmation (§3.2)
`screens-v3.jsx` differs from the package version in exactly the four places listed (state + `hpShown`; enemy-strike total added to `hpLag`; per-strike replay subtracts from `hpLag`; HP text, bar and InfoRow read `hpShown`). `hpShown` is never passed to `syncWanderState`, `wanderAct` or any save write. Both HTML files differ only in the `screens-v3.jsx?v=` value. **No stop.**

Handoff merge check: the only lines of the previous local `DESIGN_HANDOFF.md` absent from the new one are the two "CB1 awaiting lock / no active batch" status lines that CB1's lock replaces.

## Regression (§3.3)
All 17 suites pass. r1 ×5: 42/42 each. sim-clock-rng ×5: identical results. No test edited.

## Browser check (§3.4)
Sam, local TEST SAVE, Oct 10: the HP bar steps down by the exact amount with each red damage number; Sam signed off ("everything is adequate"). The before/after real-save fingerprint was **not recorded** for this check. Accepted because the change is display-only and touches no engine, save or storage code (verified in §3.2); the last recorded real-save fingerprint is 1048836096 (28 keys, FX1 V3).

## Follow-up (Oct 10)
A faster survivor HP-bar slide (0.08 s) was tried at Sam's request and **reverted** (no visible difference; not a concern). `screens-v3.jsx` and both HTML files are byte-identical to Design's sync versions again. Nothing for Design to record.

## Known limit (§4)
A heal top-up in the same beat briefly shows post-heal HP plus unreplayed damage, then steps down to the healed value (end value correct). Reported, not fixed.
