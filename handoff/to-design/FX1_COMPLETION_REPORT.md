# FX1 — Completion Report (Oct 10)

**Closing line:** `FX1 HP FLOOR: CLOSED` (Oct 10, after V3 passed).

## Scope delivered (CURRENT_BATCH.md decided behavior 1–7, 2a)
- HP never stored below 1 (fight path clamp).
- One shared Downed path (`ZI.WanderSim._downed`): heal → revive → Forced Retreat, used by fights (lost, or won at exactly 1 HP), policy hits and failed ventures that bring HP to 1 (U5).
- Fort guard attack and Traversal loot never Down (U25, U26); `fort.js` and `screens-v3.jsx` unchanged.
- Downing hit logs full damage (U6), unchanged wording.
- Rest after a Downed retreat starts from 1.

## Files changed (sha256 prefix, before → after)
| File | Before | After |
|---|---|---|
| `game/wandering.js` | 1e5a87a1da6f | 9c874d9a52d0 |
| `game/active.js` | bda6b9dd8e6c | ed6a141b2e2b |
| `tests/sim-clock-rng.test.js` (authorized) | 1d63ad2c0199 | 195125eb6242 |
| `tests/r1.test.js` (authorized, Sam Oct 10) | — | 201361495c71 |
| `tests/fx1-downed-hp.test.js` | new | |
| `CODE_STATE.md` | FX1 section added | |
Unchanged (hash-checked): `game/combat.js`, `game/fort.js`, `screens-v3.jsx`. No save keys, migration or version change.

## Verification
| Item | Result |
|---|---|
| New suite `fx1-downed-hp` (12 checks, 15 results) | **15/15 PASS**. On the pre-FX1 code it fails 9 — it detects the bug |
| All 16 suites | **All PASS** (r1 42/42, sim-clock-rng 19/19, split-equivalence 17/17, batch3b 34/34, fort-s12 50/50, …) |
| r1 ×20 frozen clock | 20/20 runs 42/42; checks 20 and 26 pass unchanged (checked, never edited) |
| r1 ×5 with 5 ms clock delay | 5/5 runs 42/42 |
| sim-clock-rng ×5 | identical output all 5 runs |
| Authorized test edits | sim-clock-rng test 11 (HP 1–100); r1 check 28 third scenario. No other test touched |
| Differential vs pre-FX1 (24 runs: 4 policies × 3 seeds × heals 0/999, 90 min) | Every divergence is a declared difference: 19 "Forced Retreat rests from 1 instead of 0", 5 "fight won at exactly 1 HP now Downs". **Zero other differences** |
| Invariant (3 policies × 6 seeds × 24 h) | lowest HP 0 → **1**; rest starting from 0: 24,534 chunks → **0** |

## Remaining
- **V3, TEST SAVE browser check** (Sam): record the real-save fingerprint; in one tab, reach a Downed state; confirm HP shows 1 and the log shows full damage; let Base rest run (HP only rises); confirm the fingerprint is unchanged. If HP ever falls with an empty log, note tabs/frames and raise a Design Handoff. R1 check 31 can share the session.
- Rollback copy of the pre-FX1 build is kept outside the project until FX1 closes.

## V3 — TEST SAVE browser check: PASSED (Sam, Chrome, Oct 10, local build at http://127.0.0.1:8080, one tab)
| Item | Result |
|---|---|
| Build | `fx1Build: true`, `shimActive: true`, TEST SAVE banner shown |
| Downed | HP set to 3, heals 0. "Damp Lurker hits you for 3" (full damage logged, U6) → "Forced retreat — Downed with no healing left: lost 3 of 6 haul items, kept Damp Lurker salvage; 3 banked at Base" |
| HP floor | Monitor every 3 s: HP never below 1; `resting true · restAt base · restStartHp 1` |
| Rest | HP rose steadily (1.0075 → 44) at 5 HP/min; never fell; stress 5, so the resume gate waits only on HP |
| Real save | `realGameKeys 28`, `realFingerprint 1048836096` in three checks across ~3 minutes of test-save play; unchanged |
| Drain | No HP drop with an empty log at any point |
Note: the first fingerprint was taken after the Downed moment (the "before" snippet hadn't been run). The real save was unchanged across the checked window, and the TEST SAVE shim was active throughout.
