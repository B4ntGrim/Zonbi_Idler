# Design handoff — Oct 29 (morning, clean slate)

**Replaces:** the Oct 27 evening handoff, archived as `archive/design-handoff-oct27-evening.md` (its §1 decisions stay in force).
**Active batch:** `CURRENT_BATCH.md` = **STAT-02** (live; three open items below). CLOCK-01 closed for PC (Oct 25). PF15 (save Continue + autosave) done Oct 28.
**Live build:** https://b4ntgrim.github.io/Zonbi_Idler/ (branch `gh-pages`, built by `node tools/build-web.cjs`). Repository: `B4ntGrim/Zonbi_Idler` (public); `main` = E: as of Oct 29.

## 1. Done since Oct 27
- **Oct 28:** verification of CLOCK-01, saves and hosting (`reports/verify-2026-10-28/`); save fixes: Continue keeps live progress, autosave every 60 s and on page hide, per-slot last-seen (`reports/save-fixes-2026-10-28/`); save Export/Import; precompiled web build and GitHub Pages (`reports/export-build-2026-10-28/`); STAT-02 Step 3 (audit numbers).
- **Oct 29:** all proposed ideas in Sam's Google Docs checked (`reports/proposals-2026-10-29/REPORT.md`). Implemented: rust retired + catch-up XP (off), consumable-only healing, Codex dev tab hidden, monotonic clock, offline status cap, no phantom import, damaged-save backups and messages. Filed: Oct 22 Blocks 1, 2, 4 (`reference/oct22-decisions-wpn02-pf13-route-alc-perk.md`, `reference/parked/camp-01-fixtures-draft.md`). Full test suite 941/941.

- **Oct 29 (later):** Character Creation on New Game, the Crawler with the reusable Halved trait (new games only), and the read-only Operations page on the Schedule tab (`reports/char-crawler-ops-2026-10-29/REPORT.md`). Full suite 972/972.
- **Oct 29 (later still):** Camp Leader duty assignment on the Schedule tab; chore order recorded; Crawler tier F confirmed. Full suite 981/981.

## 2. Waiting on Sam (no defaults chosen)
1. Catch-up XP: grace days, ramp to +15%, refill after a new inactivity; then enable (`ZI.CATCHUP`).
2. STAT-02: 24 → 30 ranks OK; food source (AUDIT §6: A route/POI food, B bring FOOD-02 forward, C slow hunger); RMAT income vs Auto-Eat price.
3. New players start with 0 heals until they carry the starter Medkit: auto-carry, tutorial hint, or leave.
4. Orphaned profession formulas and the removed Command heal perk (`reports/proposals-2026-10-29/PROFESSION_MATRIX.md`).
5. Character Creation: appearance options and any appearance bonus, name entry, profession names (options in the Oct 29 reply). Crawler: gore, mid-fight Halved; sprite later (Sam). Decided Oct 29: tier F for now. ZI-SEC-01: set aside by Sam.
6. Oct 22 open items: Ring role, perk thresholds, guaranteed horse source; PERK-01 vs STAT-02 banked picks.
7. Operations — decided Oct 29: tab stays "Schedule"; Camp Leader assigns camp duties there (existing rate, 40 XP per game hour per duty, 35 for Scavenge); chore design order cooking → weapon upkeep → laundry. Still open: the chore mechanics themselves.
8. Refresh after 20 s opens the mode picker: keep, or resume straight into the game?

## 3. Still open from earlier handoffs
See `archive/design-handoff-oct27-evening.md` §3 and `archive/design-handoff-oct27-pm.md` (BAL-A closure checks, Concordance numbers, biome/season numbers, FOOD-01 O6). Cheap animation rules (Oct 22, `[PROPOSED]`): noise ripple on a grid cell, trait icon over a known zombie, vehicle sprite on the route line, screen sway when drunk.

## 4. Next step
Sam answers §2 items 1–3, then the next batch is chosen from §2 or BAL-A closure. Every change keeps the workflow: pre-change copies in `reports/<batch>/pre-change/`, full suite green, `node tools/build-web.cjs` before publishing.
