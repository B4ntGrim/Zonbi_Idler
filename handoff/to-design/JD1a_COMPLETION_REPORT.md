# JD1a — Completion Report (Oct 13)

**Closing line:** `JD1a FIRST DISPLACEMENT: CLOSED` (Oct 15). Sam's real-save fingerprint check passed: 29 keys, fingerprint 989431190 before and after loading the JD1a build (hard refresh, Continue on the real save). *Closing line updated by Claude Design, Oct 15, from Sam's reported result.*

**Batch:** JD1a, locked by Sam Oct 13 (S1–S5, B1–B5, G1, G2, E1). `CURRENT_BATCH.md`; decisions `reference/jd1a-batch-draft.md` v5. One authorized test edit (Sam, Oct 13): `split-equivalence` CHANGED_FN + `hasMedKit`, `takeMedKit`.

## Implemented
| File | Change | sha256 (12) before → after |
|---|---|---|
| `game/active.js` | `ZI.Jester` module (switch `TABLE.firstMeetingOn = false`, records, legacy migration, trade, camp placement with the bounded reachability check, wait, meeting, B5 fallback, owed weapon); `restBed('camp')` = Bedroll. Placed before the tutorial save migration so that migration stays last | ed6a141b2e2b → 1e8c3fdbe655 |
| `game/items.js` | Old Padded Jacket (`old_padded_jacket`), Fort-bound Med Kit (`fort_medkit`, story, 1 kg), carrier data for the jacket; `hasMedKit`/`takeMedKit` accept the Fort-bound kit first | c50339764c66 → a945d3631ace |
| `game/wandering.js` | `_downed` asks `ZI.Jester.firstDowning` before the Base Forced Retreat; `advance()` waiting step; the end-of-chunk retreat-rule check is skipped while waiting | 0597646d4ac4 → 14644f8b3189 |
| `game/save.js` | New saves call `ZI.Jester.onNewSave()` (record; kit only while the switch is off) | efd014d6c1e9 → 28076a9a61e6 |
| `game/bootstrap.js` | Boot calls `ZI.Jester.onLoad()` (legacy record + kit once; fallback when off) instead of `ensureStarterKit()` directly | 1fed799ecfec → a999706d9602 |
| Both HTML files | Cache-busters for the five files | |
| `tests/jd1a-first-displacement.test.js` | New, 28 checks | new → 398ce852efa1 |
| `tests/split-equivalence.test.js` | Authorized edit (above) | 079cdf8bf88d → 27e44d028b95 |

`fort.js`, `world.js` and the screens are unchanged (the camp square and reachability check live in the Jester module and call the existing `worldCell`).

## Checks
| Check | Kind | Result |
|---|---|---|
| New suite (1, 2, 3, 3b, 3c, 4, 5, 5b, 5c, 6, 6b, 6c, 7, 8, 9, 10, 10b–10f, 11, 11b–11f, 12) | Automated | **28/28 PASS** |
| Mutation check: the suite fails when the reachability check or the grant-intent guard is removed | Automated | Both caught (11b, 10f) |
| All suites | Automated | **23/23 PASS** |
| r1 ×20, frozen clock | Automated | Identical runs; identical to pre-JD1a; checks 20 and 26 unedited |
| sim-clock-rng ×5 | Automated | Identical; identical to pre-JD1a |
| Differential, switch off (2 policies × 3 seeds, all saved state except the new `zi_jester` key): no gear; watched; Nail Bat; **new save with no heals, Downed 7 times in 2 h**; Downed while watched | Automated | **Identical** for every case |
| Headless browser, TEST SAVE page, new game | Automated (browser) | Switch off; record "not eligible"; the existing kit given as today; Wandering runs normally 15 s; no page errors |
| Real-save fingerprint before/after loading the new build (Sam's machine) | Manual | **PASS** (Oct 15): 29 keys, 989431190 before and after |

## Notes
- **Declared difference with the switch off:** every save gains a `zi_jester` record (new saves: not eligible; legacy saves: not eligible, migrated). Nothing else changes.
- **Fort-bound Med Kit display values** (rarity uncommon, icon 🧰) follow the Field Medkit, as B1 did for the jacket; only its weight was set by Sam (1 kg). Flagged for confirmation.
- **Forced Retreat text with the switch on** still reads "banked at Base" for a displacement (only reachable in tests); JD1b's scene text replaces it.
- A save closed between the trade's record and the run's own save is repaired on load (the run is put back at the camp resting). Tested for the trade and grant steps (10f).
