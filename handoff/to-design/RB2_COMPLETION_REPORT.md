# RB2 — Completion Report (Oct 13)

**Closing line:** `RB2 RETREAT LAYOUT: CLOSED`

**Batch:** RB2 Retreat layout, locked by Sam Oct 13 (RB2a–d). Record: `reference/rb1-retreat-controls-slice.md` §8; archived as `reference/archive/rb2-batch.md`. Authorized test edit: RB1 checks 5 and 6 rewritten for the new layout.

| Item | Result |
|---|---|
| Change | `screens-v3.jsx` only (plus HTML cache-busters): no retreat button in the main bar; Run Back is the only retreat control; no rules editor; while resting the scene shows `Retreats at HP 30% · stress 85 · load 115%` |
| New suite `tests/rb2-retreat-layout.test.js` | 4/4 PASS |
| All suites | 22/22 PASS |
| r1 ×20, frozen clock | 20 identical runs; checks 20 and 26 unedited |
| Headless browser check (TEST SAVE, new game) | Main bar has no retreat buttons; More actions = Idle Run / Run Back / Gear; Run Back starts the walk-back; "Resting at the checkpoint" shows the limits line; no page errors (`tools/browser-check/rb2-checks.js`) |
| Real-save fingerprint (Sam, Oct 13) | 29 keys, 989431190: unchanged |
| Game rules | No `game/` file changed. The retreat-rules editor is parked (`reference/parked/retreat-rules-shop.md`) |
