# BEST1 — Implementation and validation report (Oct 17)

**Status:** **CLOSED Oct 17 (Sam).** Implemented and validated per Sam's Gate 1 approval (Option A); Sam's own hands-on TEST SAVE check passed (duplicate names show their own records; no Codex entries unlocked). No balance value changed.

## 1. What changed
| File | Change | Hash before → after |
|---|---|---|
| `game/wandering.js` | `ZI._bgZombie` also returns the picked record's existing `bestiaryId`, `tier`, `armor` (missing armor → 0). New data key `WANDER_SIM_TABLE.codexFromWandering: false` gates the existing `discoverZombie` call in `WanderSim.resolveEncounter` | `20d20e48f196be4a` → `dfcdfdfa41988ba5` |
| `tests/best1-enemy-identity.test.js` | New 16-check regression suite (BEST1-11/12 conditional on the Codex flag) | new |
| `tools/browser-check/best1-checks.js` | New TEST SAVE browser check | new |
| `CODE_STATE.md` | "BEST1 implementation facts" section appended | appended |

- **Unchanged:** every other game file; CB1 weapon stats; enemy speed and traits (not carried); hit chance, encounter rate, tier progression, stress, beds, carry; Codex rewards (Option A: no Wandering Codex unlocks, no Discovery XP from them).
- **Backup** of the pre-BEST1 `wandering.js` and `CODE_STATE.md`: outside the project, on Sam's machine (`~/zirun/bak-best1/`).

## 2. Regression results (Sam's machine, after BEST1)
- **25 suites, 664 checks, 0 failures:** the earlier 648, plus the 16 new BEST1 checks, all PASS.
- **BEST1 suite:** 16/16, with BEST1-11/12 in their Option A form. Codex unlocks 0 and Discovery XP 0 from Wandering encounters.
- **H2 acceptance:** 17/17.

## 3. Browser acceptance (performed; TEST SAVE page)
**Setup:**
- Harness: `tools/browser-check/harness.js` (TEST SAVE page, `zitest__` storage shim, new browser profile). Run in the cloud workspace on the patched build files (`wandering.js dfcdfdfa41988ba5`; other page files identical to Sam's build).
- Test fixture only: the real `ZI._bgZombie` is steered onto each record.

**Results: 13/13 PASS.**

| Bestiary id | Record | Card shown | Sprite | Fight event and armor used |
|---|---|---|---|---|
| 20 | Trapper Zed, tier C | Trapper Zed · 80/80 HP · INIT 7 | own record | id 20, tier C, armor 0 |
| 38 | Trapper Zed, tier S | Trapper Zed · 200/200 HP · INIT 8 | own record | id 38, tier S, armor 3 |
| 22 | Battle Cry General, tier B | 115/115 HP · INIT 8 | own record | id 22, tier B, armor 1 |
| 39 | Battle Cry General, tier S | 240/240 HP · INIT 7 | own record | id 39, tier S, armor 4 |
| 1 | Simple Shambler, tier F | 40/40 HP · INIT 7 | own record | id 1, tier F, armor 0 |
| 14 | Chrome Dome Bruiser, tier C | 100/100 HP · INIT 6 | own record | id 14, tier C, armor 2 |

- No page errors. React's existing "border/borderLeft" style warning is excluded, as in earlier checks.
- **The card shows no tier or armor.** Armor consistency was checked through page state: the event id resolves to the record whose armor equals the armor the fight used.
- **The check discriminates:** on the unmodified build every per-zombie check fails (events carry no id). The Oct 17 probe also rendered the old defect: for `id 38`, INIT 7 and the C-tier sprite.

## 4. H2 baselines (D3)
| Label | Folder (Sam's machine) | Build | Matrix | Result |
|---|---|---|---|---|
| H2-LEGACY | `reports/sim-harness-v1/dry/` | Oct 15 | 1 seed × 4 starts × ethical × 3 days | **Untouched** (file hashes identical before and after) |
| H2-LEGACY-OCT17 | `reports/sim-harness-v1/legacy-oct17/` | Oct 17, unmodified (`wandering.js 20d20e48f196be4a`) | full: 4 starts × 4 policies × 5 seeds (101–505) × 30 days, returns every 8 h | 80 OK / 0 WARN / 0 FAIL |
| H2-BEST1 | `reports/sim-harness-v1/best1/` | Oct 17 + BEST1 (`wandering.js dfcdfdfa41988ba5`) | identical | 80 OK / 0 WARN / 0 FAIL |

**How the runs were made:**
- Both ran in the cloud workspace with the unchanged harness (`h2.js b93504ed3ffccf79`), on copies hash-checked against Sam's build. The only differing file was `wandering.js`.
- Each folder holds 80 run records, `SUMMARY.md`, and `records.tgz` (an archive of the same files, used to transfer them).
- **Supplementary observation pass:** encounter tiers, armor applied, HP per fight, escapes, Codex and Discovery XP were counted in a second pass with observation-only hooks. All 160 of those runs reproduce the official records exactly (record hashes identical).

### Comparison (mean ± SD across 80 runs; per day unless noted)
| Measure | H2-LEGACY-OCT17 | H2-BEST1 | Reading |
|---|---|---|---|
| Downings | 21.07 ±2.17 | 21.67 ±2.23 | Small rise, within seed variation; expected from armor |
| Saved by heal | 32.55 ±3.25 | 33.85 ±3.38 | Same |
| Kills | 58.16 ±5.87 | 59.45 ±5.67 | Within variation |
| Distance (km) | 1.72 ±0.39 | 1.78 ±0.41 | Within variation |
| Rest (h) | 23.62 ±0.11 | 23.61 ±0.12 | Unchanged (STRESS-01 loop) |
| Withdrawals | 1.29 ±0.48 | 1.37 ±0.52 | Within variation |
| Breakings (per run) | 0 | 0 | — |
| Day-30 stress | 71.6 ±2.1 | 71.8 ±2.6 | Unchanged |
| First Downing day | 0.33 | 0.33 | Unchanged |
| Encounters | 114.9 ±23.8 | 119.2 ±26.4 | Within variation |
| Escape share | 28.2% ±17.0 | 28.8% ±17.7 | **No speed-driven change** (F2 had shown 17% → 38%) |
| Enemy armor applied per fight | **0.00** | **1.27** ±0.06 | **Intended correction** |
| HP lost per fight | 48.2 ±1.5 | 48.7 ±1.7 | Slight rise from armor |
| Fights with a bestiary id | **0%** | **100%** | **Intended correction** |
| Encounter tiers (% of fights) | not measurable (no id) | T0 8.0 · T1 10.0 · T2 13.3 · T3 15.2 · T4 19.4 · T5 17.0 · T6 15.0 · T7 2.1 | Now measurable |
| Codex entries unlocked (per run) | 0 | 0 | **Option A boundary holds** |
| Discovery XP (per run) | 1,470 ±640 | 1,560 ±786 | Within variation; comes from ventures, not Codex (Codex awards 0 in both) |

**By start (Downings · kills · armor per fight):**
- A: 22.8 → 22.5 · 60.9 → 59.7 · 0 → 1.29
- B-bat: 20.4 → 21.2 · 56.9 → 58.8 · 0 → 1.26
- B-iron_knuckles: 20.7 → 21.4 · 58.0 → 59.6 · 0 → 1.26
- B-pocket_knife: 20.3 → 21.5 · 56.8 → 59.7 · 0 → 1.28

**By policy (Downings · escape share):**
- ethical: 20.9 → 21.7 · 37.7% → 38.9%
- immoral: 20.0 → 20.8 · 42.1% → 44.3%
- criminal: 20.6 → 20.1 · 32.8% → 32.0%
- heinous: 22.7 → 24.1 · 0% → 0%

### Intended vs unintended
- **Intended:**
  - Bestiary armor now applies (0 → 1.27 per fight on average).
  - Every fight carries its bestiary id and tier.
  - Duplicate names display their own record.
  - Codex stays off (Option A).
- **Consequential, not regressions:** small shifts in Downings, kills, encounters and Discovery XP. The enemy pick sequence is identical (BEST1-PICK), but different fight outcomes change later timing, so no run record is byte-identical between builds (0 of 80, as expected). Every shift is inside one standard deviation of seed variation.
- **Unintended regressions found:** none.

## 5. Not verified here
- **Real-save fingerprint:** no step opened or wrote the real save (Node suites use an in-memory store; browser checks use only the TEST SAVE page in a fresh profile). The real save lives in Sam's browser, so the before/after fingerprint must be checked on Sam's machine, as in earlier batches.
- **Codex Option B** (separate approval).

## 6. Rollback
- Restore `game/wandering.js` from `~/zirun/bak-best1/wandering.js.20d20e48`.
- Remove the BEST1 section from `CODE_STATE.md` and the two new test files.
- No save migration is involved.
