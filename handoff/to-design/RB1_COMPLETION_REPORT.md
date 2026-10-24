# RB1 — Completion Report (Oct 13)

**Closing line:** `RB1 RETREAT CONTROLS: CLOSED`

**Batch:** RB1 Retreat controls, locked by Sam Oct 13 (RB1a–RB1d). Archived as `reference/archive/rb1-batch.md`; brief `reference/rb1-retreat-controls-slice.md`. No authorized test edits.

## Step 1
`setWanderScroll` had two screen callers: Run Back and the distance bar's checkpoint jump (a second free teleport, forward or back, in no design doc). Stopped; Sam decided RB1c (bar display only).

## Step 2 — implemented
| File | Change | sha256 (12) after |
|---|---|---|
| `screens-v3.jsx` | Run Back → `wanderAct(wanderRetreatPress)` (walk back, one getaway roll, rest; pace kept); main-bar policy control `↩ Auto-retreat: …` / `↩ Withdrawing Nm`, opens the rules; manual Retreat and Retreat Rules buttons removed; distance-bar checkpoints are markers | see `CODE_STATE.md` |
| Both HTML files | `screens-v3.jsx` cache-buster | |
| `tests/rb1-retreat-controls.test.js` | New, 7 checks | 1a0905b1e9be |

No `game/` file changed, so game rules are unchanged by construction.

## Step 3 — verification
| Item | Result |
|---|---|
| New suite | **7/7 PASS** |
| All suites | **21/21 PASS** |
| r1 ×20, frozen clock | 20 identical runs; checks 20 and 26 pass, unedited |
| Headless browser check (TEST SAVE page, new game) | Policy button shows `HP 30% · Stress 85 · Load 115%` and opens the rules; Run Back started a 61 m withdrawal at Jog pace, main bar `↩ Withdrawing 61m`; no clickable checkpoints; no page errors. Script: `tools/browser-check/` |
| Real-save fingerprint (Sam, Oct 13) | 29 keys, 989431190: unchanged |

**Correction recorded:** a withdrawal gets one getaway roll, on the first press; a second press reports it was already tried (unchanged R1 rule).
