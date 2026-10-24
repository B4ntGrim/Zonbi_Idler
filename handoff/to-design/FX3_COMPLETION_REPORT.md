# FX3 — Completion Report (Oct 10)

**Closing line:** `FX3 BUFF TIME: CLOSED`

**Batch:** FX3 Buffs on simulation time, locked by Sam Oct 10 with D-FX3a = A (`reference/archive/fx3-batch.md`; brief `reference/fx3-buffs-sim-time-slice.md`). One extra test edit authorized by Sam during the batch (three new names in `split-equivalence` `ADDED`).

## Step 1
Done before the lock (brief §3a). Re-confirmed at step 0: no reader or writer had changed.

## Step 2 — implemented
| File | Change | sha256 (12) before → after |
|---|---|---|
| `game/items.js` | `ZI._buffMomentFn` / `ZI.buffMoment()` (the moment buffs are judged at: the step being processed, else the game clock). `getActiveBuffs()` filters by `from ≤ moment < until` and **never deletes**. New `ZI._pruneBuffs()`: removes a buff only when it ended before every catch-up (the Wandering run's unprocessed time, never more than 24 h back; unfinished jobs; route runs). `addBuff` uses the cleanup; a same-track XP refresh **ends the old buff now** instead of deleting it | c4dfd927e723 → e1c3535c349c |
| `game/wandering.js` | `advance()` sets the step moment to `state._simNow` and restores it in `finally`; `_run` calls the cleanup after saving the run | 68e2879df0a0 → 7a4c24b25836 |
| `game/jobs.js` | `_settleJobs`: the step moment is the job's finish time while its grant (and XP) runs | 5b4f538a8560 → 1c6cc45e82e8 |
| `game/routes.js` | `settleRouteRuns`: the step moment is the run's finish time while `completeRun` runs | 9532a6b80457 → b4d744446f23 |
| `tests/fx3-buffs-sim-time.test.js` | new, 11 checks | new → 3d767bfb9d66 |
| `tests/sim-clock-rng.test.js` | authorized: test 4 comment now says G1 is fixed; checks unchanged | 1f4a31c49454 → c2bd891d90a8 |
| `tests/split-equivalence.test.js` | authorized: `CHANGED_FN` + `_settleJobs`, `settleRouteRuns`; `ADDED` + `_buffMomentFn`, `buffMoment`, `_pruneBuffs` (Sam, Oct 10) | 980b37bdc2bd → b2a95e8df62e |

No other game or test file changed (hash comparison of `game/` and `tests/`). `combat.js`, `stats.js`, `active.js`, the screens and the save format are untouched.

**One implementation choice to note:** the XP "same track refreshes, doesn't stack" rule used to delete the running buff. Under Q4 that would remove a buff that catch-up steps before now still need, so the old buff now ends at the moment of the refresh. At every moment exactly one buff of that track applies (check 8), so stacking behavior is unchanged.

## Step 3 — verification
| Item | Result |
|---|---|
| New suite | **11/11 PASS** |
| All suites | **19/19 PASS** (18 existing + new) |
| G1 demo (40-s +50% damage buff, then 2 h away, seed 7) | pre-FX3: **0** of 25 fights buffed · FX3: **5** fights buffed, all inside the 40 simulated seconds |
| r1 ×20, frozen clock | 20 identical runs, identical to the pre-FX3 build; checks 20 and 26 pass, unedited |
| sim-clock-rng ×5 | identical results, identical to the pre-FX3 build |
| Differential vs pre-FX3 (2 policies × 3 seeds, all saved game state except the buff store, frozen clock) | No buff, 2 h away: identical · no buff, 10 min watched: identical · damage buff covering the whole run: identical · damage buff 40 s, watched: identical · XP buff or escape buff **used live** during watched play: identical · **Declared:** short damage, XP or escape buff then 2 h away: differs (the buff now applies for its window) |

**One extra difference found, within the decided rule:** a stored XP or escape buff whose start time is still in the future (only possible in a test setup or if the device clock moved backward) used to apply before it started; it now waits for its start, as damage buffs already did (Decided behavior 1). Buffs used normally in play are unaffected (identical above).

## Not done / for later
- HTML cache-busters (`?v=`) were not bumped; the local test server sends no-store headers. Bump them when this build goes to a browser that caches.
- No browser check was required by the batch.

## Folder state
`CURRENT_BATCH.md` is back to "none active"; the batch is archived as `reference/archive/fx3-batch.md`. Pre-FX3 copy kept outside the project.
