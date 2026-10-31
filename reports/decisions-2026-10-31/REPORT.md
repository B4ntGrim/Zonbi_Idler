# Sam's decisions applied — Oct 31, 2026

**Scope (Sam, Oct 31):** apply TIER-01 (divisor 3.0 as proposed), fix the phone-width bug with a fix I choose, remove the Max HP ceiling, and fix PROF-01 by my judgment. Uncommitted and waiting-on-decision work was left alone. Nothing is committed.

## 1. What changed, by decision

### TIER-01: tier divisor 1.5 → 3.0 (as proposed)
- `game/core.js`: `ZI.TIER_LAP_DIVISOR = 3.0`.
- Every reader now uses it: `_bgZombie` (`game/wandering.js`), `ZI.wanderDrawableTiers` (`game/world.js`, feeds `ZI.hideThreats`), and `poolForDepth` in `screens-v3.jsx` (not called anywhere; kept in step).
- Unchanged by design (TIER-01 D4/D6): the camp horde tier in `game/camp.js`, and Push On's ×1.5.
- Effect: one tier per 300 m of walking (0.15 game days). BOSS (rank 7) is first drawable at 2,100 m, about 1.04 game days (was 0.52).
- Test edits forced by the decision (authorized by it):
  - `tests/best1-enemy-identity.test.js` line 22 builds lap from `Z.TIER_LAP_DIVISOR` instead of 1.5. 7 failures → 0 (16/16).
  - `tests/trav-01a.test.js` check 4 (Hide range): at scroll 400 (lap 4), floor(4 / 3.0) = 1, so the range is now F–E, not F–D. 1 failure → 0 (76/76).

### ART-02: phone width (my choice: option C, one global fit)
- Why: the old per-sprite clamp shrank each sprite on its own. Tiers could reorder, so the roster stopped reading as one ladder.
- Now: `ZI.SCENE_WIDTH_SHARE = 0.65` (`game/core.js`). In `screens-v3.jsx`, `widthFit` = min(1, sceneWidth × 0.65 / worst), where worst is the widest drawable sprite (bestiary art at its tier height, plus the SS-BG-01 minions at F height). Every tier height = raw height × widthFit. The per-sprite clamp is removed.
- Effect: the fit is 1.0 at 420 px and wider. Narrower scenes shrink the whole roster together, about 13% at 360 px (rough estimate). Ordering holds by construction.
- Verified: vendored Babel parses `screens-v3.jsx`; `tests/art-02-width-fit.test.js` 4/4; numeric check of the ladder.
- **Not verified:** I have not seen it rendered at phone width. It needs an on-device look.

### VIT-01: Max HP has no ceiling (built, dormant)
- `game/progression-live.js`: `ZI.VIT01 = { perPoint: 2, gate: 25, compoundPct: 1.5 }` and `ZI.vitalityHp(points, runawayOpen)`. Each Vitality point gives +2 max HP. Past point 25, each further point compounds 1.5%, but only once the max HP rank reaches its cap (30). There is no hard stop at 300.
- Wired into `L._baseMaxHp`, `ZI.maxHp`, and `displayAt('maxHp')`.
- **Dormant:** Vitality points are not stored anywhere yet (attribute storage is STAT-03, undecided). `L.vitalityPoints()` reads `ZI.survivalAttributePoints('V')` when that exists and returns 0 otherwise. So live max HP does not change today.
- `tests/vit-01-maxhp.test.js` 7/7: constants, R2/R3/R4 values, closed form equals brute-force sum, no ceiling, hook adds the expected HP, and live max HP unchanged with no stored Vitality.

### PROF-01: profession catch-up on (my judgment)
- `game/stats.js`: `ZI.CATCHUP = { enabled: true, maxRatePct: 15, allowancePct: 50, graceDays: 2, awayCapDays: 14, maxLevel: 50 }`.
- Who and when: a profession below level 50, after at least 2 idle real days (same clock as skill decay).
- Size: 50% of the level-1 XP to next (148 for non-scavenging, so 74 XP), scaled by days away up to 14 days.
- Fade: each award draws up to 15% of its amount from the allowance, so the rate falls as the allowance is spent. Earned XP is never reduced.
- A new absence replaces any unused allowance.
- Judgment calls: (1) the cap uses the live level-1 curve (148), not the sim's base of 100, so the cap is 74 XP, not the sim's 50. (2) Fade rather than ramp, as the sim does; the ramp parameter is removed. (3) Enabled.
- Tests: `tests/prof-01-catchup.test.js` 12/12. `tests/proposals-oct29.test.js` 34/34 after 3 checks that asserted the old disabled catch-up were replaced (authorized by PROF-01). The P1 check now expects the first award after 60 idle days to be +15% (100 → 115).

## 2. Verification

Full run, 52 suites, run suite by suite. Two detached background runs died, so the final pass ran sequentially on the current tree. This is the last result for each suite.

**Total: 1,188 checks pass, 27 fail. 43 suites are fully green. 9 suites have failures.**

Failures, by attribution:

| Suite | Failing checks | Attribution |
|---|---|---|
| fx4-shared-attributes | 2, 3, 4, 5, 7, 9 | pre-existing |
| fx4-shared-attributes | 1 | **new**: see §4a |
| r1 | 26 | pre-existing |
| r1 | 22 | **new**: see §4b |
| fx3-buffs-sim-time | 7 | pre-existing |
| sim-clock-rng | 8 | pre-existing |
| carrying | 2 | pre-existing |
| bal-a-walk-home-broken | 2 | pre-existing |
| routes-preparation | 1 | pre-existing |
| stat-02-live | 5 | pre-existing (AUD-02 documents these five) |
| split-equivalence | 6 | **unresolved**: see §4c |

- **Pre-existing (19 checks):** these fail with TIER-01 and PROF-01 reverted (diagnostic copies kept outside the project in `$HOME`). VIT-01 and ART-02 were not isolated by reverting, so "pre-existing" means "not caused by TIER-01 or PROF-01."
- **New (2 checks):** fx4 check 1 and r1 check 22 pass with the divisor reverted and fail with it applied.
- **Unresolved (6 checks):** split-equivalence cannot run on the diagnostic copies (its `archive/legacy` folder is missing there), so it is not attributed.

## 3. Fixture edits (judgment calls, easy to reverse)
- `tests/fx3-buffs-sim-time.test.js`, checks 1 and 5: rig seed 7 → 3. The divisor re-rolled the seed-7 walk, and no encounter fell inside the buff window, so both checks passed on nothing (0 buffed steps). Seed 3 gives buffed steps in the window. Assertions are unchanged. Check 7 still fails and was failing before these changes. If you would rather keep these two red and flagged, I can revert.
- Test edits authorized by the decisions: `best1` (lapFor), `trav-01a` (Hide range at lap 4), `proposals-oct29` (PROF-01 checks).

## 4. Found during verification (not fixed; need a decision)

**a. fx4 check 1: stored speed after a buff expires in bulk processing.** The bulk path leaves `moveSpeed` at the buff-inclusive value (3.99 m/s) after a 45-second speed buff has expired. The watched and 1-second runs show the base 3.07 m/s. Scroll, HP, kills, and sim time are identical in all three runs. Only the stored speed differs. The comment at `game/wandering.js:460` says the stored value is "only this step's copy", which would make the check over-specified. Choose one: refresh the stored speed at the end of bulk processing, or change the check to compare the rule's speed. The divisor only changed the walk so that a step landed inside the buff.

**b. r1 check 22: second Broken entry within the hour.** With the 3.0 divisor, the one-hour Broken test records two Broken entries instead of one. This could be a balance effect (different encounters, more stress) or the repeated-Breaking loop BAL-A rules out. It needs a look before we accept it.

**c. split-equivalence: 6 checks.** The "only split" symbol list now includes my new globals (`TIER_LAP_DIVISOR`, `SCENE_WIDTH_SHARE`, `VIT01`, `CATCHUP`, `catchUpAllowanceFor`, `_profLevel1Xp`, and others) and globals added by other uncommitted work (`CAMP_HP_RESTORE_PCT`, `JESTER_*`, `VEHICLE_SKILL_GATES`, `WORLD_LOCK_CHANCE`, `LOCKED_CELL_*`). Its function-hash and `PROFESSIONS` data checks also fail, and I did not touch those. The legacy list needs an owner decision. I did not edit it.

**d.** `reference/market-01-pricing-and-clock-sim-oct30.md` is a historical sim and still reads 1.5 as its baseline. Left as written.

## 5. Flags for Sam (from the batch docs, still open)
1. Push On's ×1.5 is now half a tier at 3.0 (TIER-01 kept it as is).
2. Vitality storage (STAT-03) is needed before the runaway is reachable.
3. The runaway gate (25) is above the attribute cap in AUD-01 (10).
4. The regen cost and the R6 class gate are not built.
5. Live max HP base is 120 + Endurance, not the 160 in the VIT-01 doc. The Oct 30 "~150 at L14" claim is wrong.
6. Catch-up cap is 74 XP live vs 50 in the sim (see PROF-01).
7. The STAT-02 precondition ("do not start while STAT-02 open") was overridden on your direction.

## 6. Files changed
- Game: `game/core.js`, `game/wandering.js` (Push On note, OPEN), `game/world.js`, `game/progression-live.js`, `game/stats.js`, `screens-v3.jsx` (also has another session's uncommitted changes).
- Cache tags: `Zombie Idler v2.html` and `Zombie Idler v2 - TEST SAVE.html` (core, world, wandering, progression-live, stats, screens-v3 → `20261031-*`).
- Tests, new: `tier-01-divisor` (8), `art-02-width-fit` (4), `vit-01-maxhp` (7), `prof-01-catchup` (12).
- Tests, edited: `best1-enemy-identity`, `trav-01a`, `fx3-buffs-sim-time`, `proposals-oct29`.
- Docs: `CHANGELOG.md`, `CODE_STATE.md`, `reference/00-document-index.md`, `reference/tier-01-…`, `reference/art-02-…`, `reference/vit-01-…`, `reference/prof-01-…` (status blocks), `archive/design-handoff-oct29.md` (moved), `DESIGN_HANDOFF.md` (new), this report.

## 7. Not committed
Nothing has been committed or pushed.
