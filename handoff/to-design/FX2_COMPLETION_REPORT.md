# FX2 — Completion Report (Oct 10)

**Closing line:** `FX2 RETURN CAP: CLOSED`

## Step 1 (TQ2a)
`_carryMs` is read and written only in `game/wandering.js` (`WanderEngine._run` and `WanderSim.advance`). `lastTickAt` is also written by the screen once when a run restarts (`screens-v3.jsx` ~2502, sets it to now; harmless to the cap). No other system shares either value. `advance()` needed no change. **No stop.**

## Step 2 (one change, `game/wandering.js` `_run`)
New time plus carried time is clamped to 24 h before processing; the new part runs now, the backlog stays carried, anything beyond 24 h is discarded. No new saved field (P1).

## Files changed (sha256 prefix, before → after)
| File | Before | After |
|---|---|---|
| `game/wandering.js` | 9c874d9a52d0 | be6513871a23 |
| `tests/sim-clock-rng.test.js` (authorized 10c) | 195125eb6242 | 1f4a31c49454 |
| `tests/fx2-return-cap.test.js` | new | |
| `CODE_STATE.md` | FX2 section added | |
All other game files unchanged (hash-checked), including `active.js`, `combat.js`, `fort.js`, `screens-v3.jsx`.

## Verification
| Item | Result |
|---|---|
| New suite `fx2-return-cap` (8 checks) | **8/8 PASS**. On the pre-FX2 code checks 3 and 5 fail: a second return processed **33.9 h**; a 30 h carry left 22.8 h backlog after 8.2 h processed |
| sim-clock-rng 10c (authorized) | backlog after a second return: **47.99 h → ≤ 24 h**, now a PASS check |
| All 17 suites | **All PASS** |
| r1 ×20 frozen clock / ×5 with 5 ms delay | 42/42 every run; checks 20 and 26 pass (checked, never edited) |
| sim-clock-rng ×5 | identical PASS/FAIL results all 5 runs (detail text varies only in random-sample statistics and timing readouts, by design) |
| Differential vs pre-FX2 (4 scenarios × 4 seeds, all game state compared with fields sorted; real-time housekeeping stamp and random loot ids excluded) | 30 min watched 1-s play: identical · 8 h return: identical · 24 h return: identical · **leftover carry + new absence: differs (the declared fix)** |

## Noted
- Field order inside the saved run JSON changes (`_carryMs` is set earlier). Values are identical; nothing reads field order. The QA helper's storage fingerprint hashes values as text, so a TEST SAVE fingerprint taken across this change could differ; the real-save check is unaffected.
- Pre-FX2 rollback copy kept outside the project.
