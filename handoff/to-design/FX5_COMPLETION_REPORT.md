# FX5 — Completion Report (Oct 15)

**Closing line:** `FX5 MEDKIT HEAL: CLOSED` (Oct 15).
**Batch:** FX5, authorized by Sam Oct 15 ("find the bug and fix it for FX5 to close"). Investigation and fix done in one session by Claude at Sam's request (Code's role); contract archived as `reference/archive/fx5-batch.md`. Finding: `reference/playtest-findings-oct15.md` PF2.

## Step 1 — cause (TQ-FX5a–d)
| Q | Answer (file:line, pre-FX5) |
|---|---|
| a | **Reproduced** headless and in the browser. In the field a heal works (30 → 51, kept). **While resting** (checkpoint, Base or camp) the heal lands (30 → 51) and is overwritten on the next rest step (→ 30.08). The heal charge (Heal button) or the Field Medkit itself (equipped, `useConsumable` removes it from the loadout, `screens-v3.jsx` ~1835) **is consumed**. Same watched and offline. Sam was resting ("already resting at the checkpoint"), which matches. |
| b | Both paths write the engine's saved run correctly: Heal button → `ZI.wanderHeal` (`active.js` 367–373, `spendCharge` then `state.hp +=`); equipped kit → `useConsumable` → `ZI.wanderAct(s => s.hp += e.heal)` (`screens-v3.jsx` 1827). The engine owns HP; FX4 did not change these paths. |
| c | **HP overwritten, not zero.** `WS._restStep` (`active.js` 751–755) sets `state.hp = restStartHp + rate × restElapsedMs` (capped at 80%; or `restStartHp` when it was already ≥ 80%). It never reads the current HP, so any heal during rest is erased. `hpLag` (display only) is not involved. |
| d | No. JD1a's `hasMedKit`/`takeMedKit` are only used by the Fort hand-in; the use paths don't call them. |

## Fix
`game/active.js`, `WS._restStep`: before each rest step, if HP is above where the rest curve would put it (a heal landed), restart the curve from the current HP (`restStartHp = hp`, `restElapsedMs = 0`). Only upward changes trigger it. No new save fields; heal amounts, charges, the 80% / stress < 50 resume gate, stress recovery and the HP floor are unchanged. The unused fallback rest block in `wandering.js` 409–416 (runs only if `_restStep` is missing) is unchanged.

| File | Change | sha256 (12) before → after |
|---|---|---|
| `game/active.js` | FX5 block at the top of `WS._restStep` (5 lines) | 1e8c3fdbe655 → e595769d2064 |
| Both HTML files | `active.js?v=` cache-buster → 1792090800000 | real ef1762fe8b13 → cc63b8db951e; TEST SAVE 24abad10ff06 → c0de94df583c |
| `tests/fx5-medkit-heal.test.js` | New, 10 checks | new → 95db9e610bda |
| `tools/browser-check/fx5-checks.js` | New headless browser check | new |

No other `game/` file, screen, test or save key changed (hashes compared).

## Checks
| Check | Kind | Result |
|---|---|---|
| New suite (1 Heal at checkpoint, 2 equipped kit, 3 Base rest, 4 healed above 80% with stress 51 waits on stress and keeps HP, 5 healed above 80% with stress 10 resumes at once, 6 no-heal curve unchanged, 7 offline 12 h, 8 watched never falls, 9 two heals, 10 heal amount unchanged) | Automated | **10/10 PASS** |
| Mutation: the same suite on the pre-FX5 build | Automated | Fails 7/10 (1–5, 8, 9); 6 and 10 are invariants; 7 passes on both because one long offline step jumps straight to the gate |
| All suites | Automated | **24/24 PASS** (23 existing, counts identical to baseline, + FX5) |
| r1 ×20 | Automated | 42/42 every run; output identical across all 20 runs. Differs from pre-FX5 only in check 25's call-trace detail (rest now asks `restBed()` once more per step); same pass, same rates |
| sim-clock-rng ×5 | Automated | 20/20 every run (detail text varies run to run on any build: check 9 samples `Math.random`) |
| Differential vs pre-FX5: 4 policies × 3 seeds × watched/offline × with/without heal charges, 4 h watched / 48 h offline, full save state, pinned `Date`/`Math.random` | Automated | **48/48 identical** |
| Headless browser, TEST SAVE page: ⛑ Heal while resting; equipped Field Medkit (More actions → 🧰 Use) while resting; no page errors | Automated (browser) | **PASS**: 30.1 → 51.2 → 51.7; 20.2 → 80.2 → 80.2. On the pre-FX5 build the same check fails (30.1 → 30.2; 80.2 → 20.7), reproducing Sam's symptom |
| Real-save fingerprint (Sam's machine) | Manual | **Not required** for this batch: no save key, save version, migration or load path changed, and the differential shows identical saves. Recommended next time Sam plays (expect 29 keys, 989431190 unless play has changed the save) |

## Notes
- **D-FX5b (refund):** not built. Kits or charges already lost to the defect are not returned (recommended default; Sam may overrule).
- Test-runner note: suites need a host `readFile`/`log`; a local runner was used (`node` + async wrapper), not committed.
- Two stray scratch files `a.tmp` and `b.tmp` left in the project root by the session were deleted Oct 15 at Sam's request.
