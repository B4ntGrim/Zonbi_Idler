# H1 — One clock and seeded rolls: Final Acceptance Report

**From:** Claude Code · **Date:** Oct 10 · **Batch:** `CURRENT_BATCH.md` (H1) · **Brief:** `reference/sim-harness-v1-brief.md` §2–5
**Result:** all completion criteria met. Final line at the end.

---

## 1. Steps done

| Step | Status | Note |
|---|---|---|
| 0 Baseline | Done | 414/415 (R1 check 15 the only failure); `r1` frozen ×20 = 2/20, 5 ms delay ×5 = 5/5. Step-0 build preserved, pre-H1 save captured, hashes recorded |
| 1 Audit | Done | `CODE_STATE.md`: every in-scope time read and roll, with clock and reason |
| 2 Seams | Done | `ZI.clockNow()`, `ZI.installClock()`, `ZI.roll()`, `ZI.installRolls()` in `core.js`; `ZI.now()` in `jobs.js` defers to the clock |
| 3 Clock conversion | Done | Includes `bootstrap.js:69` (`awardXp`, the 16th authorized name) |
| 4 `_simNow` contract | Done | Tests first (4a), then the change (4b): engine seeding, re-anchor removed, rest and HOLD time counted |
| 5 Rolls | Done | Recycler id only (`'ids'` stream); Wandering `rng` untouched |
| 6 Bounds | Done | See §11 |
| 7 Cap | Done | Through `WanderEngine.tick` |
| 8 Watching list | Done | `CODE_STATE.md` |
| 9 Validation | Done | Including Sam's browser check (criterion 8) |

## 2. File inventory (MD5, first 12 characters)

| File | Before | After |
|---|---|---|
| `game/bootstrap.js` | dce7e1976acc | 0ddf7e9bdda4 |
| `game/core.js` | eca13bdc4470 | 85b4c9f77eb2 |
| `game/economy.js` | 4fb11e006e8e | f265dad19fd9 |
| `game/factions.js` | 388036732857 | be1c0f523dfa |
| `game/items.js` | 59f5e08913e8 | 2ed7e1896ef3 |
| `game/jobs.js` | 4d95265c2a56 | e22a3b89f925 |
| `game/routes.js` | f2f0b2babb0c | 843d0e351cde |
| `game/save.js` | 26c5bd5d37d7 | d51376ffc9a1 |
| `game/stats.js` | ad4ee755ed27 | 609dbb47d2d0 |
| `game/wandering.js` | dd30a6b97d32 | d8af5414b0aa |
| `tests/split-equivalence.test.js` | 3c610ab267cf | d24781ff7655 |
| `tests/sim-clock-rng.test.js` | new | d06ed2c0bef9 |
| `CODE_STATE.md` | 39cdf37a2c64 | a6bcea99ed13 |

**Confirmed unchanged:** `active.js`, `camp.js`, `combat.js`, `crafting.js`, `fort.js`, `survival-data.js`, `world.js`, both screens files, both HTML hosts, and the 13 other existing test files. Re-verified Oct 10: `game/` and `tests/` are byte-identical to the validated step-9 snapshot.
**Rollback:** every step snapshotted in `E:\Zed_Idler_Quarantine\h1-snapshots\`.

## 3. Changed-line inventory — no scope violations

| Class | Lines |
|---|---|
| Seam | `core.js:10–27`; `jobs.js:44` |
| Clock conversion | `wandering.js:14, 27, 142, 150, 254, 259, 262, 317`; `stats.js:293, 296, 315, 339, 365, 369–370`; `items.js:322, 333`; `factions.js:172, 178`; `economy.js:36` and the clock half of 29; `routes.js:94`; `save.js:154`; `bootstrap.js:69` |
| Clock conversion (real-time exemption made explicit) | `wandering.js:269–273` (simulation lock) |
| Roll-hook conversion | `economy.js:29` |
| `_simNow` contract | `wandering.js:284, 374, 380, 391–392` |
| Test | `split-equivalence.test.js:18, 22`; new suite |

## 4. Existing suites

Baseline **414/415** → final **415/415**. Every recorded assertion identical except R1 check 15 (FAIL → PASS). Re-run Oct 10 with the new suite: **434/434** across 15 suites.

## 5. New suite ×5

19/19 each run; output byte-identical in 5 of 5 runs.

## 6. R1 repeat runs

| Run | Before | After |
|---|---|---|
| Frozen clock ×20 | 2/20 | **20/20** |
| 5 ms delay ×5 | 5/5 | **5/5** |

Check 15 passes in all 25. Cause (resolved): `advance()` re-anchored `_simNow` to the wall clock, so the check depended on machine speed.

## 7. Differential

- **Test 14:** 5 seeds × 1 h and 24 h; step-0 build vs H1 build with identical scripted time and randomness. Intended difference declared in advance: `zi_wander_run._simNow` only. Result: identical events in all 10 runs, `_simNow` the only differing field. **No unexpected differences.**
- **TQ6 extension:** 27 more runs (3 seeds × timed buffs with 1-min ticks, 10-min ticks and one 24 h catch-up; 7 days hourly; forced carried steps with and without a buff; capped 72 h absence with and without a buff; live watched beats). Same result: only `_simNow` differs. **No regressions.**

## 8. Save and cap

- **Test 15:** a pre-H1 save (v7) loads with the same keys, run fields and save version, and the run continues.
- **Test 10a:** 72 h away processes exactly 86,400 s and ends identical to 24 h away.
- **Test 10b:** carried time adds only the drain's own elapsed time.

## 9. Audit summary

In `CODE_STATE.md`. Real time kept only for the A1 exemptions: simulation lock, session ids, `savedAt`, the reload-resume window, and the UI stamp in `reportCarryRefusal`.

## 10. Watching list

In `CODE_STATE.md`. It includes the screen-only gameplay writes (`moveSpeed`, `healPct`, `hp`, `kills`, `xp`, `mats`, `healsUsed`, scroll, buffs, policy, stim timer).

## 11. Verified bounds

Level 1–50 · XP **finite only** (no floor clamp; DH3) · base charges 0–max · kit charges 1–full · durability 0–max · stress 0–max in integer units · HP **0–100** observed (DH1; U1 now decides HP stays at 1 on Downed — FX1).

## 12. Authorized test edits, as applied

- `ADDED`: `_installedClock`, `clockNow`, `installClock`, `_rollStreams`, `roll`, `installRolls`
- `CHANGED_FN` (16): `getCmdWindow`, `cmdResetInMs`, `policyCooldownLeftMs`, `setPolicy`, `skillDecayState`, `skillIdleDays`, `getDecayClock`, `_maybeSettleOnRead`, `getInjury`, `setInjury`, `getActiveBuffs`, `repApply`, `settleRepForgiveness`, `_boot`, `now`, `awardXp`
- `awardXp` diff (one line): `st.lastActiveUtc = Date.now()` → `ZI.clockNow()`

## 13. Browser check (criterion 8) — **PASSED**

Sam, Chrome, Oct 10, **local H1 build** served at `http://127.0.0.1:8080` (read-only PowerShell server, localhost only).

| | Before | After 1–2 min TEST SAVE play (incl. Wandering) |
|---|---|---|
| Diagnostic | `storage ok`, `shimActive true`, banner `true`, `h1Build true` | — |
| Real keys / game keys | 29 / 29 | 29 / 29 |
| Test keys | 11 | 24 |
| Real-save fingerprint | 1883847335 | **1883847335** |

The real-save store was untouched while the test store grew.

**Scope of this pass:** it validates the local H1 build. It does **not** validate a future sync into the Claude Design preview. That preview (origin `https://019defa1-…claudeusercontent.com`) currently runs the pre-H1 build (`h1Build: false`). **Requirement preserved:** before the real-game preview runs any H1 build, record the real-save fingerprint in the TEST SAVE preview frame, sync, confirm `h1Build: true` and `shimActive: true`, then confirm the fingerprint is unchanged before and after TEST SAVE play.

## 14. Design Handoffs and decisions

| # | Item | Status |
|---|---|---|
| DH1 | HP ~0 after a Downed forced retreat (pre-existing) | Decided as **U1** → FX1. Note: resting from 1 HP instead of 0 shortens rest slightly; sequence-dependent R1 checks 20 and 26 may shift — FX1 must check, not edit them |
| DH2 | Carried time can stack past 24 h when the step cap binds (pre-existing) | Decided as **U2** → FX2. No conflict with locked rules; test 10c's INFO measurement will change from 48 h to ≤ 24 h |
| DH3 | XP decay has no floor clamp | Open (FX3 candidate) |
| DH4 / TQ7 | Batch wording on `ALWAYS` was contradictory | Resolved: `ZI.now` stays hidden; `CODE_STATE.md` corrected Oct 10. **Batch wording fix needed (Claude Design)** |
| G1 | Buffs pruned by the current clock | Known follow-up; confirmed in testing |
| U4 | Scenario B with the Belt Pouch | **Finding:** over 24 h, Scenarios A and B gave identical withdrawal counts; HP and load fail together around 84–90 s, and the pouch only shifts the primary cause from load to HP. Scenario B needs an HP-side change (armor, weapon or heals) to test what it intends |

**Correction to an earlier Code statement:** the step report said adding `now` to `ALWAYS` changed 16 results. Tested in isolation, it changes none; those failures came from the `ZI._clock` name collision. The implementation was already correct; only the explanation was wrong.

## 15. Final line

`H1 CLOCK AND RNG: CLOSED` — all nine completion criteria met. H2 not begun; FX1 and FX2 not begun. The preview-sync isolation check (§13) remains a precondition for running H1 in the Claude Design real-game preview.
