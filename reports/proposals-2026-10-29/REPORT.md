# Proposed ideas from Google Docs — check and safe implementation (Oct 29, 2026)

**Asked by Sam (Oct 28, 23:45):** "check for all proposed ideas in my google docs. And implement them as safely as possible to my E drive, then push the information that has been updated on the e drive to the GitHub repo. I wish to have a clean slate when coding with you tomorrow."
**Rule used for "safely":** implement only what a doc marks approved / `[DECIDED]` (or an existing approved rule); record docs-only decisions where they belong; never invent balance numbers; leave drafts, concepts and anything that says "not approved" or "do not implement" untouched and list it under **Needs Sam** below. Pre-change copies: `pre-change/`.

## 1. Inventory of the Google Docs (Drive, modified Oct 20–29)

| Doc | Status in the doc | What was on E: | Action Oct 29 |
|---|---|---|---|
| Profession Rust Replacement — Priority 1 (catch-up XP) | Approved design; ramp numbers **not** approved | Rust decay live | **Implemented** (rules 1–2 live; catch-up built, **off**) |
| — Priority 2 (consumable-only healing) | Existing approved rule | 2 free base heals + Command +1 | **Implemented** |
| — Priority 3 (profession bonuses) | Investigation only | — | **Audit written:** `PROFESSION_MATRIX.md` (no code) |
| STAT-02 Step 3 — Audit & Apply (Oct 28) | Apply instructions | Code applied; docs steps 3–6 missing | **Docs finished** (REPORT §8, CURRENT_BATCH, CODE_STATE, FOOD-01 note) |
| CURRENT_BATCH STAT-02, Stat Progression Addenda v1–v4, XP Pace draft | Batch contract / design | Live (STAT-02) | Nothing to do |
| Code Instructions Oct 26 + Addenda 1–11i (food, Concordance, TRAV-02, seasons, biomes, PF15, disguise…) | Docs-only instructions | Already filed in `reference/` (checked by key terms) | Nothing to do. Code items from them: PF15 (done Oct 28), Codex dev tab (**done today**, below) |
| Oct 22 instruction blocks (WPN-02, PF13, ROUTE-01, ALC-01, PERK-01, camp fixtures) | Docs-only; Block 3 answered earlier | Blocks 1, 2, 4 **never filed** | **Filed:** `reference/oct22-decisions-wpn02-pf13-route-alc-perk.md`, `reference/parked/camp-01-fixtures-draft.md`, lead brief §5.2 RMAT note |
| Character Creation Instructions | **Draft proposal** | — | Not implemented (needs Sam) |
| Crawler Sprite & Halved Trait | **"Proposal only / not approved / not implemented"** | — | Not implemented |
| ZI-SEC-01 Beta Security Monitoring | Planning only; "no deployment or paid provisioning" | Section 7 audit done Oct 28 (`reports/verify-2026-10-28/`) | Not implemented (planning task for Sam) |
| `reference/operations-schedule-proposal.md` (appeared on E: Oct 29, 07:24, another session) | "Proposal only. No implementation is authorized" | — | Not implemented (needs Sam) |
| Older docs (GDD v4.2/v5.0, Game Setting & Theme, Idler Notes, 2025; AI Generated Content, Oct 4) | Background / another owner | — | Not treated as instructions |
| Verify report leftovers (F2, F3, F5, F7, F8; listed in the Oct 28 voice call) | Proposed fixes | — | **Implemented** |

## 2. What changed in the game

**P1 — rust retired, catch-up XP (`game/stats.js`).**
- Inactivity never subtracts profession XP, never lowers a level and never lowers effectiveness. `ZI.skillRust` now always reports full efficiency; `ZI.settleSkillDecay` only advances its clock. `zi_skill_decay` / `zi_decay_clock` are kept untouched (rollback-safe). Injury and stress penalties are unchanged (−20% cap).
- Catch-up XP: `ZI.CATCHUP` (+15% max rate, allowance 25% of XP-to-next snapshotted when it starts, per track, none at level 50, integer floor so repeated tiny awards cannot beat the cap, no recursion, invalid amounts ignored). Idle time comes from each skill's existing activity stamp; a missing stamp counts as "active now". **`enabled: false`, `graceDays: null`, `rampDays: null`**: no gameplay effect and no save key until Sam sets the two numbers.
- UI text: the Wandering tutorial no longer says unused skills "go rusty"; the Stats screen rust label no longer appears.

**P2 — consumable-only healing (`game/active.js`).** `baseHeal 0`, `commandPerkHeal 0`. Older saves' stored free heal charges read as 0 (never converted to Medkits); scout charges unchanged; rest never refills heals. Medkits keep 2 charges each and are used up on the second; First Aid still sets the heal amount. The Fort-bound Med Kit is not a heal charge. `wandering.js` `maxHeals: 3` / `healPct: 25` in `defaultWanderRun` are legacy fields with no reader (left as they are).
- **Consequence to know:** a new save's starter Medkit goes to the **stash**, so a survivor who has not carried it has **0 heals** in the field (seen in the browser check). See Needs Sam #3.

**Codex developer tab (Oct 26 Addendum 6 decision).** The reveal-all "In development" tab only exists with `?dev` (`screens-v3.jsx`).

**Verify-report fixes.**
- F2 clock moved back: the calendar is monotonic (`game/core.js`); no more Year 0 / negative days.
- F3 status: offline hunger/rest catch-up counts at most the CLOCK-01 credited 24 h (`progression-live.js`).
- F5: a first visit no longer shows a phantom "Imported progress" file (import only with real progress).
- F7: a damaged active-file pointer reads as "no file"; a damaged Traversal position picks a new start.
- F8: each slot write keeps `zisave_prev_<mode>_<n>` (the previous good copy); Continue on a damaged file loads the backup (and heals the copy); a damaged index lists intact files again ("recovered"); Continue on a damaged file with no backup shows a message; Delete removes the backup too.

## 3. Tests

- New `tests/proposals-oct29.test.js` (33 checks).
- Updated (expectations changed by Sam's decisions, each marked in the file): `batch1` #4 and `batch2a` A4 (no decay), `batch2b` B5 (no rust), `save-fixes` (backup fallback), `export-import` (cache tag). Heal-mechanics suites (`batch2b`, `fx1`, `fx3`, `fx4`, `fx5`, `r1`, `batch3a`, `sim-clock-rng`) run with the legacy 2 base heals injected into their test copy, because they test heal mechanics, not the shipped amount (the shipped rule is tested in `proposals-oct29`).
- **The 16 older failures are fixed.** They came from the Oct 28 walk pace (3 → 1.4 m/s, `reference/wandering-real-world-pace.md`): `fx4` now asserts the decided 1.4 / 0.28 / 0.6067 paces; `r1`, `bal-a-walk-home-broken` and `sim-clock-rng` (timing suites written for 3 m/s) pin the old pace in their test copy; `bal-a` #4 reads the pace from the rule. `split-equivalence` registers `describeGearItem` / `itemStatLines` (Oct 27 items.js work) and today's symbols.
- **Full suite: 39 suites, 941 passed, 0 failed.**
- Browser (Chromium, compiled build on a Linux sub-path host): saves 7/7 (the one "fail" is the by-design 20-s resume window), damaged `zi_prog_v1` 4/4 load, Export/Import 11/11, new checks 6/6 (no phantom file, no dev tab, no free heals, damaged-file message, clock rollback valid).

## 4. Needs Sam (decisions, nothing guessed)

1. **Catch-up XP numbers:** inactivity grace (days) and ramp to +15%; does the allowance refill after a new inactivity; then set `ZI.CATCHUP.enabled = true`. Run the balance audit the Character Creation doc asks for first.
2. **STAT-02:** OK the 24 → 30 ranks change; choose a food source (AUDIT §6 A/B/C); RMAT income vs Auto-Eat price.
3. **Heals for new players:** carry the starter Medkit automatically, add a tutorial hint, or leave it (survivor starts with 0 heals until it is carried).
4. **Orphaned profession formulas** (`PROFESSION_MATRIX.md`): First Aid heal count, Scavenging quality bonus, Stealth scout count / push distance; profession cards still promise them. Command lost its heal perk at 40: replacement or none.
5. **Character Creation draft:** appearance options, whether any give bonuses, profession names, art.
6. **Crawler / Halved:** team review gates in the doc (tier, atlas, renderer).
7. **ZI-SEC-01:** hosting is GitHub Pages (static); review before any paid service.
8. **Oct 22 open items:** Ring role, perk thresholds, guaranteed horse source; whether PERK-01 is STAT-02's banked picks.
9. **Operations / Schedule redesign** (`reference/operations-schedule-proposal.md`): review the proposal; nothing is built.
10. Refresh after 20 s still opens the mode picker (Continue keeps everything); keep or resume straight into the game?

## 5. Files
Game: `game/stats.js`, `game/active.js`, `game/core.js`, `game/save.js`, `game/progression-live.js`, `screens-v3.jsx`, both HTML pages (Continue message; cache tags `20261029-proposals1`). Tests: see §3. Docs: `reference/oct22-decisions-wpn02-pf13-route-alc-perk.md` (new), `reference/parked/camp-01-fixtures-draft.md` (new), `reference/wandering-tab-spec.md` (§3, §13.3 superseded notes), `reference/food-01-nutrition-slice.md` (P6/P8 + Oct 28 note), `reference/zed-idler-design-lead-brief.md` (§5.2 RMAT note), `reference/00-document-index.md`, `reports/STAT-02/REPORT.md` §8, `CURRENT_BATCH.md`, `CODE_STATE.md`, `DESIGN_HANDOFF.md` (new; Oct 27 evening one archived), this report and `PROFESSION_MATRIX.md`.
