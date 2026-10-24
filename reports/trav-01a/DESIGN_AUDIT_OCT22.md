# TRAV-01a + fix 1 — Creative Director audit (Oct 22)

Read-only. Nothing in the game changed. Tests were rerun with a fresh runner (`readFile` / `log`, as `CODE_STATE.md` line 12 describes).

## 1. Verification
| Check | Result |
|---|---|
| All 27 suites rerun independently | **672/672 PASS** (trav-01a 67/67, with the fix-1 checks) |
| Only contract files changed | **Yes.** Compared with `archive/pre-trav01a-oct21/build/HASHES.md5`, only `game/stats.js`, `game/world.js`, `screens-v3.jsx` and the HTML pages differ. `active.js`, `wandering.js`, `combat.js`, `core.js` (clock), `save.js` and `items.js` are byte-identical |
| Data-table values | `ZI.TRAVERSAL_TABLE` = 5 scouts per day, Hide 1 game hour (`game/stats.js:394-397`) |
| Saves | New keys `zi_trav_scout` and `zi_trav_xp_day` read as full or empty when missing; save version is still v8 |
| Not verified | Check 10 (Deploy disabled) was checked in source only, never reached in the browser. **Sam's 7-step smoke test is still owed.** |

**Verdict:** the batch meets its contract. CLOSED stands, pending the smoke test.

## 2. Design findings (for Sam to decide)
| # | Finding | Severity | Recommendation |
|---|---|---|---|
| D1 | **Time costs are nearly free.** Hide costs 1 game hour (6 real seconds) and Make camp costs 24 game hours (2.4 real minutes). The daily limits use real days. These are two time bases that don't relate. | High | Decide in CLOCK-01 before the simulation audit. Real-time limits are right for an idler; game-time costs only mean something on a slower clock. |
| D2 | **Travel has no cost.** XP is once per cell per day, so walking every unlocked cell each day farms Athletics, and Hide adds Stealth on the same cells. | Medium | Acceptable for now, since it rewards exploring. Revisit with familiarity (TRAV-01b). A small stamina cost per Travel is the usual fix. |
| D3 | **Scout has a limit but no lasting effect.** `zi_trav_scouted` is written (`screens-v3.jsx:893`) and never read. | Medium | Give Scout a use in TRAV-01b, for example raising familiarity or revealing loot safety, or Scout stays a 5-a-day XP button. |
| D4 | **Daily refills trust the device clock.** Changing the system date refills scouts. | Low | Accept for a solo premium game. Note it for mobile prep. |
| D5 | **Phone layout is only partly ready**, and the TEST SAVE banner covers the sheet's Close button (Code note N2). | Low | Give it its own UI batch. |
| D6 | **Fort entry takes one more click** (Code note N1). | Low | Accept. It follows "one panel for every cell." |

## 3. Next step
Sam runs the 7-step smoke test on the TEST SAVE page. D1 then goes into the CLOCK-01 slice before the simulation audit.

## Sam's rulings (Oct 22)
D1 CLOCK-01 before the simulation audit [DECIDED]. D2 Travel stamina cost [DECIDED concept, numbers PROPOSED]. D3 Scout lasting effect via drifts [CONCEPT]. D4–D6 accepted as they are [DECIDED]. Full wording lives in `DESIGN_HANDOFF.md`.
