# Design handoff — Oct 31

**Replaces:** the Oct 29 handoff, archived at `archive/design-handoff-oct29.md`.
**Active batch:** `CURRENT_BATCH.md` (STAT-02). Its status is unchanged by today's work.
**Full report:** `reports/decisions-2026-10-31/REPORT.md`.
**Commits:** nothing committed. Commit only when asked.

## 1. Decided Oct 31 (applied)
- **TIER-01:** tier divisor 1.5 → 3.0 (`ZI.TIER_LAP_DIVISOR`, `game/core.js`). Applied to `_bgZombie`, `wanderDrawableTiers` (feeds Hide), and `poolForDepth`. Camp horde tier and Push On ×1.5 unchanged.
- **ART-02:** phone-width fix, option C. Per-sprite clamp removed; one global fit at `ZI.SCENE_WIDTH_SHARE` 0.65. Chosen by Code under Sam's delegation. Not yet seen on a phone-width screen.
- **VIT-01:** no max HP ceiling. Vitality +2 per point. Compounding runaway (gate 25, 1.5%) opens once the max HP rank is at cap. Built but dormant until Vitality is stored (STAT-03).
- **PROF-01:** catch-up on. 2 idle real days to start. Allowance 50% of level-1 XP (74 XP), scaled to 14 days away. Fades as it is spent. A new absence refills it.

## 2. Test status (Oct 31 full run)
52 suites: 1,188 checks pass, 27 fail. 43 suites fully green.
- **Pre-existing, 19 checks** (not caused by TIER-01 or PROF-01): fx4 2–5/7/9, r1 26, fx3 7, sim-clock-rng 8, carrying (2), bal-a (2), routes-preparation (1), stat-02-live (5).
- **Need a decision, 8 checks:** fx4 check 1, r1 check 22, split-equivalence (6). See §3.

## 3. Waiting on Sam
1. **fx4 check 1:** bulk processing leaves the stored speed at the buff value after the buff expires. Refresh it at the end of bulk, or change the check to compare the rule's speed?
2. **r1 check 22:** under the 3.0 divisor, a second Broken entry happens within the hour. Balance effect, or the BAL-A loop?
3. **split-equivalence:** the legacy symbol list needs an owner. Update it, or leave it red?
4. **fx3 checks 1 and 5:** seed changed 7 → 3 so the checks run on real buffed steps. Keep, or revert and flag red?
5. **Push On ×1.5** is now half a tier at 3.0. Keep, or change?
6. **VIT-01:** gate 25 is above the attribute cap (10). Regen cost and the R6 class gate are not built.
7. **STAT-03:** where Vitality is stored. This blocks the runaway.
8. **Live max HP base** is 120 + Endurance, not the 160 in the VIT-01 doc. The Oct 30 "~150 at L14" claim is wrong.
9. **Catch-up cap:** 74 XP live vs 50 in the sim. Keep 74?
10. **Phone width:** check the ART-02 fit on a real phone-width scene.

## 4. Files changed
Game: `game/core.js`, `game/wandering.js`, `game/world.js`, `game/progression-live.js`, `game/stats.js`, `screens-v3.jsx`. Cache tags bumped in both HTML files. Tests: 4 new, 4 edited (`best1`, `trav-01a`, `fx3`, `proposals-oct29`). Docs: `CHANGELOG.md`, `CODE_STATE.md`, the index, and the four decision references. Full list in the report §6.

## 5. Next step
Sam answers §3. Then the next batch is chosen from STAT-02 open items or BAL-A closure. Keep the workflow: pre-change copies in `reports/<batch>/pre-change/`, full suite run, and `node tools/build-web.cjs` before publishing.
