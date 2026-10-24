# FX5 — Medkit Heal (batch record)

**Status:** **CLOSED Oct 15** (`FX5 MEDKIT HEAL: CLOSED`). Authorized by Sam Oct 15: "find the bug and fix it for FX5 to close". Step 1 and the fix were done in one session. Report: `handoff/to-design/FX5_COMPLETION_REPORT.md`. Slice: `reference/fx5-medkit-heal-slice.md`.

**Goal.** A heal used while resting is kept.

**Decided behavior.**
1. A heal used while resting (checkpoint, Base or the Jester's camp; Heal button or an equipped Field Medkit) raises HP and is kept; rest continues upward from the healed HP. `[DECIDED Oct 15]`
2. If the healed HP is at or above the 80% resume mark, HP stays there while rest waits on stress; the resume gate (HP ≥ 80% and stress < 50) is unchanged.
3. Unchanged: heal amounts and charges (First Aid rule), Field Medkit +60, rest HP rate, stress recovery by bed, HP floor 1, Downed order, the Fort-bound Med Kit (story, can't heal), save keys and version.

**Files.** `game/active.js` (`WS._restStep`) · both HTML cache-busters · new `tests/fx5-medkit-heal.test.js` · new `tools/browser-check/fx5-checks.js`.

**Acceptance checks.** New suite 10/10; all suites; r1 ×20; sim-clock-rng ×5; differential vs pre-FX5 identical with no heal during rest; headless browser check of both use paths while resting. All passed (report).

**Explicitly out.** Refunds for lost kits (D-FX5b) · PF1 stress gate · the "+60 HP over 8s" item text (the heal is instant; text not changed) · H2.
