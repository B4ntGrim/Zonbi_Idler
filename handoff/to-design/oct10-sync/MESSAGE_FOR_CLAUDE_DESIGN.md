Oct 10 sync from the local project. Attached: zed-idler-oct10-sync.zip (51 files; MANIFEST.md inside lists each file and its hash).

What happened since your Export 3:
1. FX1 HP floor and Downed — CLOSED Oct 10. Implemented in game/wandering.js and game/active.js. All suites pass; the V3 TEST SAVE browser check passed (HP floor 1, restStartHp 1, full damage logged, real-save fingerprint unchanged). Evidence: handoff/to-design/FX1_COMPLETION_REPORT.md.
2. FX2 per-return cap — CLOSED Oct 10. One change in game/wandering.js (_run). Evidence: FX2_COMPLETION_REPORT.md.
3. New decisions, already written into the spec, slices, handoff and index:
   - U25: the Fort scene is exempt from U5; a player in the Fort scene cannot be Downed.
   - U26: Traversal loot is exempt the same way.
   - U27: order of authority for low HP. The player's retreat setting decides withdrawal (once heal charges run out). Downed at 1 HP and the fixed resume gate (80% HP, stress < 50) override it.
   - r1 check 28 gained a third scenario (authorized by Sam); sim-clock-rng tests 10c and 11 tightened (authorized).
4. Also in the package from the Oct 10 design session: elder-jester-concept.md, starter-weapons-cb1-slice.md, scenario-b-and-first-downed-oct10.md. mystic-jester-concept.md is retired; don't restore it.
5. CURRENT_BATCH.md now says no batch is active. Next in the fix train: CB1 starter weapons, awaiting my lock. Then FX3, FX4, H2.

Please:
A. Replace your copies with these files. The local versions are authoritative for everything in the package. Report any file where your copy has content the local one lacks, before overwriting it.
B. The game build in the package is the full current local build (post-H1, FX1, FX2). Your preview still runs the pre-H1 build. Before the real-game preview runs it, follow the standing precondition in DESIGN_HANDOFF.md §2: in the TEST SAVE preview frame, record the real-save fingerprint; sync the build; confirm h1Build and shimActive are true and that the fingerprint is unchanged after 1–2 minutes of play; only then open the real-game preview.
C. Reply with the files you replaced, anything you couldn't apply, and the fingerprint results from step B.
