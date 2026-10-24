# BEST1-PRE / BALANCE-03 — Plans and decision register (Oct 17)

**Status:** Gate 0, plan review. No production file, test baseline, H2 record, spec, index or save was changed. BEST1 and BALANCE-03 are not closed.

**Pre-flight verification (Oct 17, Sam's machine):**
- The project folder is not a git repository. Working-tree state is recorded by SHA-256 (first 16 hex):
  - `wandering.js 20d20e48f196be4a` · `stats.js f89005797f0e9d0a` · `combat.js 4ab47d83608aaf15` · `active.js a7bedfeba4e9bcb0` · `bootstrap.js a999706d9602df03` · `bestiary-data.js 9b78614e2fb77a56` · `h2.js b93504ed3ffccf79` · `screens-v3.jsx 7cd246e1a6dc693c` · `Zombie Idler v2.html 69b4b11faad07df0` · `Zombie Idler v2 - TEST SAVE.html 7f5f737c16abb53d`.
  - Other game files are as recorded in STRESS-01.
- **Starting results:** 24 suites, 648 checks, 0 failures; H2 acceptance 17/17. No unrelated failures.
- **Reports read:** `bestiary-01-enemy-identity-findings.md`, `balance-02-early-game-findings.md`, `post-stress-01-next-batch-recommendation.md`, `stress-01-stress-economy-investigation.md` (all present).

---

# Deliverable 1 — BEST1 patch plan

## 1.1 Files and functions (verified in the current build)
| File | Function / data | Line | Role |
|---|---|---|---|
| `game/wandering.js` | `ZI._bgZombie(lap, rng)` | 105–114 | Picks the bestiary record; returns `{ name, hp, atk, xp, seesThrough }` — **the defect** |
| `game/wandering.js` | `ZI.WANDER_SIM_TABLE` | 305 | Data table; the Codex boundary flag would live here |
| `game/wandering.js` | `WanderSim.resolveEncounter` | 314–317 | Already reads `z.bestiaryId` and `z.tier` into the event, and calls `ZI.discoverZombie(z.bestiaryId)` when an id exists |
| `game/stats.js` | `STAT_FORMULAS.enemyStatBlock(z)` | 261–272 | Already reads `z.armor` and `z.bestiaryId`; **no change needed** |
| `game/stats.js` | `escapeEnemyResist` / `escapeChance` | 196–212 | Reads `spd` and `traits`; **must not receive them** (excluded) |
| `game/combat.js` | `ZI.discoverZombie(id)` | 14–21 | Existing Codex unlock: adds the id once to `zi_discovered_zombies`, then `emitAction('discover', 0.5)` |
| `screens-v3.jsx` | Wandering screen `show(r)` | ~1681 | Resolves the displayed record by `bestiaryId`, then by name. **No change needed**; it starts working once ids arrive |

## 1.2 Proposed minimal change
- **`ZI._bgZombie`:** add three existing fields from the already-selected record to the returned object: `bestiaryId: z.id`, `tier: z.tier`, `armor: z.armor || 0`. The pool, the single rng draw and every existing field stay as they are.
- **Codex boundary:** one data key, `WANDER_SIM_TABLE.codexFromWandering`, checked at the existing `discoverZombie` call in `resolveEncounter`.
  - `false` = Option A; `true` = Option B. Both options ship the same code, and switching later is a data change.
  - *Why a flag:* without it, carrying `bestiaryId` switches the Codex unlock on automatically, which D2 says must be reviewed separately.

| | Kept | Added | Intentionally excluded |
|---|---|---|---|
| Encounter object | `name, hp, atk, xp, seesThrough` | `bestiaryId, tier, armor` | `spd`, `traits`, `base`, `weakness`, `ability` (speed is on a different scale from the escape formula: 17% → 38% escapes when passed) |

## 1.3 Codex boundary — Option A vs Option B
| | **Option A — identity and armor only** | **Option B — plus the existing Codex unlock** |
|---|---|---|
| Functions changed | `_bgZombie` (3 fields); `resolveEncounter` (flag check); `WANDER_SIM_TABLE` (`codexFromWandering: false`) | Same, with `codexFromWandering: true` |
| Rewards newly reachable | None | Existing Codex entries unlock from Wandering. Existing Discovery XP: `ACTION_XP.discover` base 25 × 0.5 = **13 XP per new entry**, once, up to 45 entries (about 585 XP total) |
| Save migration | None. No save shape changes; the encounter is transient | None. Uses the existing key `zi_discovered_zombies` |
| Offline catch-up | Same enemy data watched and offline (draft test BEST1-13) | A long first return after the patch can unlock many entries in one catch-up, each once. The XP lands inside the away window. Discovery XP marks Discovery as active for skill decay (`game/bootstrap.js` 63–75); verify this is acceptable |
| One-time safeguards | Not applicable | `discoverZombie` returns early when the id is already in the set, so XP is awarded once per entry. Verified: a second encounter of `id 38` adds no XP (13 → 13) |
| Duplicate-name safety | Ids keep 20/38 and 22/39 apart | Unlock is by id; `id 38` does not unlock `id 20` (verified) |
| Regression implications | BEST1-11/12 run in their Option A form | BEST1-11/12 run in their Option B form. Discovery XP totals in any XP-sensitive suite would change (none in the current suites did) |

**Recommendation:** Option A for BEST1. It fixes the defect without activating a reward that was never reviewed. Option B can then be approved as a one-key data change with its own review.

## 1.4 Evidence the plan is safe (patched copies in an isolated folder; production untouched)
- **Draft BEST1 tests:** current build 7 pass / 8 fail (every identity, armor, duplicate and Codex-flag check fails); Option A 16/16; Option B 16/16.
- **All 24 existing suites with Option A and with Option B applied:** 648/648 pass.
  - **Note:** split-equivalence does not flag the change, because `_bgZombie`, `WanderSim` and `WANDER_SIM_TABLE` are already in its allow-lists. That suite cannot catch regressions here; the new BEST1 tests must.
- **H2 acceptance checks with Option A and with Option B:** 17/17.
- **Browser feasibility probe** (workspace copies, TEST SAVE page, fresh profile; **not acceptance**). The real pick function was forced onto `id 38` (Trapper Zed, tier S, base Mutant, INIT 8):
  - **Current build:** the card shows "Trapper Zed · 200/200 HP · INIT 7" with the C-tier Trapper sprite. HP comes from the S-tier fight; INIT and sprite come from the C-tier record. **The display defect is now observed, not only inferred.**
  - **Option A copy:** "200/200 HP · INIT 8" with the S-tier Mutant sprite.

## 1.5 Browser verification steps (Gate 3; must actually be run)
1. Use `tools/browser-check/harness.js` (TEST SAVE page, `zitest__` storage shim, new browser profile each run).
2. Start a new save; open Wandering.
3. For each of `id 20`, `38`, `22`, `39`, force the real `ZI._bgZombie` onto the record with a test fixture (tier pool plus chosen rng). Read the encounter card and screenshot it.
4. Expected:
   - `20` → INIT 7, Trapper sprite.
   - `38` → INIT 8, Mutant sprite.
   - `22` → INIT 8, Wretched sprite.
   - `39` → INIT 7, Mutant sprite.
   - HP equals each record's HP.
5. Regression sample: `id 1` (Simple Shambler, tier F, armor 0) and `id 14` (Chrome Dome Bruiser, tier C, armor 2) show their own records.
6. **Armor consistency:** the card displays neither tier nor armor. Verify through page state that the fight event's `bestiaryId` resolves to a record whose armor equals the armor applied in `enemyStatBlock`.
   - Showing tier or armor on the card would be a UI design change and is out of BEST1.
7. No page errors.
8. Do not declare the display repaired from unit tests alone.

## 1.6 Rollback
- Restore `game/wandering.js` to hash `20d20e48f196be4a`: three lines plus one data key. No save migration, so saves need no rollback.
- **Option B caveat:** Codex entries and Discovery XP awarded before a rollback stay in those saves. They are real encounters, but they are not reversible.

## 1.7 Scope and risks
- **Scope:** about 4 lines in one production file; one new test file (16 checks); one new browser-check script. Documentation (`CODE_STATE.md`) is updated by Code at implementation.
- **Intended effects:**
  - Armor applies: no change at tiers 0–1; mainly tier B (4) and up, and fists against tier C (3).
  - Correct Codex identity (Option B only).
  - Correct display.
- **Risks:**
  - H2 record and storage hashes change (re-baseline under D3).
  - Under Option B: Discovery XP and the skill-decay "active" stamp.
  - Low code risk: the pick and rng sequence are unchanged (draft test BEST1-PICK).

---

# Deliverable 2 — BEST1 test plan

## 2.1 Entry points
- **New suite:** `tests/best1-enemy-identity.test.js`, using the existing convention (`const T = await readFile(...); await (new Function('readFile','log', T))(readFile, log);`, returns PASS/FAIL rows). The draft is in the project as `claude/best1-draft/best1-enemy-identity.test.js`, not in `tests/`.
- **Browser check:** `tools/browser-check/best1-checks.js` (to write at Gate 2), modelled on `fx5-checks.js` and using `harness.js`.
- **H2:** `node tools/sim-harness/h2.js <root> <mode>` with new output folders (section 2.6).

## 2.2 Fixture construction (isolated)
- **Sandbox:** in-memory `localStorage`, pinned `Date` and seeded `Math.random`, harness clock via `ZI._installedClock`. Loads `bestiary-data.js` plus the 17 game modules in order.
- **Forced picks:** call the **real** `ZI._bgZombie` with a lap whose pool is exactly tiers 0…rank, and an rng that lands on the wanted record. No reimplementation of the pick.

## 2.3 Draft checks (CONDITIONAL marks the Codex option)
| Check | What it proves | Current build | A | B |
|---|---|---|---|---|
| BEST1-01 | 45 unique integer ids | PASS | PASS | PASS |
| BEST1-PICK | 1,600 seeded picks: same record as the pool-and-draw rule (selection unchanged) | PASS | PASS | PASS |
| BEST1-02 | Encounters carry the selected id | FAIL | PASS | PASS |
| BEST1-03 | Tier equals the selected record's tier | FAIL | PASS | PASS |
| BEST1-04 | `enemyStatBlock` armor = bestiary armor (45 records) | FAIL | PASS | PASS |
| BEST1-05 | Tier 0–1 fights identical with or without the new fields (7 records) | PASS | PASS | PASS |
| BEST1-06 | 19 armored records reduce a 10-damage hit by their armor; MIN_CHIP 1 holds | FAIL | PASS | PASS |
| BEST1-07 | Trapper Zed 20/38 and Battle Cry General 22/39 distinguishable by id and tier | FAIL | PASS | PASS |
| BEST1-08 | Unit: the event resolves to the S-tier record in the screen's lookup rule (browser check still required) | FAIL | PASS | PASS |
| BEST1-09 | No `spd`, `traits` or `base` on encounters | PASS | PASS | PASS |
| BEST1-10 | Escape chance identical for all 45 records | PASS | PASS | PASS |
| BEST1-11 CONDITIONAL | A: no Codex unlock from Wandering · B: unlock records `38`, not `20` | FAIL (flag unset) | PASS | PASS |
| BEST1-12 CONDITIONAL | A: no Discovery XP · B: 13 XP once, a second encounter adds none | (with 11) | PASS | PASS |
| BEST1-13 | One 1 h offline catch-up and 3,600 watched 1-s steps give the same enemy id sequence | FAIL (ids null) | PASS | PASS |
| BEST1-14 | Saved run holds no encounter object (identity is not lost on reload because it is never saved) | PASS | PASS | PASS |
| BEST1-15 | Existing 24 suites and H2 acceptance pass (run by the runner, not inside the file) | 648 + 17 | 648 + 17 | 648 + 17 |
| BEST1-16 | Tests ran on the in-memory store only | PASS | PASS | PASS |

## 2.4 Offline equivalence
BEST1-13 is in the suite. At Gate 3, also rerun H2 T1 (chunking) and T2 (24 h cap) on the patched build.

## 2.5 Real-save isolation
- Node suites use an in-memory store.
- Browser checks run only the TEST SAVE page (`zitest__` shim) in a new profile.
- No test opens `Zombie Idler v2.html` or reads real save keys.
- Code records the real-save fingerprint before and after Gate 2, as in earlier batches.

## 2.6 H2 baselines (D3)
| Label | What | Where |
|---|---|---|
| **H2-LEGACY** | The existing Oct 15 dry-run records (1 seed × 4 starts × ethical × 3 days, pre-clock and pre-PF1 build). Preserved untouched | `reports/sim-harness-v1/dry/` (unchanged) |
| **H2-LEGACY-OCT17** (proposed) | The current pre-BEST1 build, same configuration as H2-BEST1 | new folder, e.g. `reports/sim-harness-v1/legacy-oct17/` |
| **H2-BEST1** | The approved repair; not accepted until Gate 3 passes | new folder `reports/sim-harness-v1/best1/` |

**Why a third label:** the Oct 15 records predate the Oct 16 clock and PF1 changes, so comparing them with H2-BEST1 would mix three changes. The only valid A/B is LEGACY-OCT17 vs BEST1, with identical seeds, starts, horizon, policies and harness settings.

**Report:**
- **Measures:** Downings, kills, encounter tiers, enemy armor applied, HP loss, rest, exploration, escape rate, Codex progression (B only), XP.
- **Labelling:** each change is marked intended (armor, identity) or unintended.
- **Preview** (fixture, not a baseline; BESTIARY-01, 20 runs): armor applied 0 → 1.22 average; Downings 26.9 → 29.8 (within seed SD); escapes 16.8% → 17.4%.

---

# Deliverable 3 — BALANCE-03 experimental plan

## 3.1 Audit of the existing stress system `[CODE]`
| Item | Current build |
|---|---|
| Sources | Walking per minute by square familiarity: unexplored +0.25, explored +0.10, cleared −0.10 (×1.15 when overloaded). Failed venture +8. Ambush +5. Route change +3. Low HP +5 (once per run, below 25% HP). Fights themselves add none |
| Recovery | Only while resting: Bedroll 20/day (checkpoint and camp fixed at Bedroll; Base uses `defaultBed` = Bedroll). Walking on cleared ground −0.10/min |
| HP-triggered | Low-HP event above; Downed (HP 1) leads to Forced Retreat |
| Thresholds | Stages: Calm < 40, Strained 40, Stressed 70, Breaking 100. Resume gate HP ≥ 80% and stress < 70 (locked). Retreat ceiling 71–95 (default 85) |
| Forced retreat / resume | Downed or Breaking → Base rest. Breaking sets Shaken 80. Withdrawal → checkpoint rest |
| Bed tiers | `bedRecoveryPerDay` lists Cot 30 / Bunk 40 / Bed 50, but **no code selects them**; every rest uses the Bedroll. The camp "Bunks" structure has a `regenRate` effect unrelated to Wandering stress |
| Comfort items | None implemented (the Church comfort scene is parked) |
| World data available | Per square: `difficulty` 1–5 (distance from origin plus noise), `threatLevel` 0–5, `biome`, familiarity (cleared / explored / unexplored; home and camp count as cleared). **Not available:** local zombie density, noise generation, special encounter classes |
| Progression data available | Character level, skill levels (combat, stealth, athletics…), cleared-cell counts, home and camp cells, distance walked |

## 3.2 Mixed stress-recovery candidates (test-only; same single stress number, so the locked gate is unchanged)
| ID | Model | Test parameters (starting values for the test only) | Why |
|---|---|---|---|
| MS0 | Current | — | Reference |
| MS1 | **Routine vs persistent split.** Each stress gain is tagged *routine* (walking, ventures, route changes) or *persistent* (low-HP, Breaking/Shaken). Displayed stress = routine + persistent. Routine also recovers while walking on cleared ground and at 3× the bed rate when resting; persistent recovers only at the bed rate | routine recovery ×3; persistent ×1 | Keeps near-death stress meaningful while letting everyday pressure clear |
| MS2 | **Acute fade with residue.** Part of each stress gain fades over a few game hours on the existing simulated clock; the rest is persistent and needs bed rest | 60% fades over 2 game hours; 40% persistent | Spikes settle; repeated near-death still accumulates |
| MS3 | **Safe-ground recovery.** Only the existing cleared-ground walking recovery is scaled | cleared −0.10 → −0.30/min | Uses an existing mechanic; rewards clearing and returning to known ground |
| MS4 | MS1 + MS3 | — | Combined |

**Measures:** time in each stress band; stress-only rest by cause; share of the day "trapped" (stress-only rest above 50% of the day); Breakings.

**Constraints:** the gate stays at < 70, bed rates are unchanged, no new clock, no consumables.

## 3.3 Area- and danger-dependent encounter candidates (test-only; production stays at 6 s)
| ID | Model | Test parameters | Data used |
|---|---|---|---|
| EN0 | Current fixed interval | 6 s | — |
| EN1 | **Area:** interval by familiarity of the current square | cleared 60 s · explored 20 s · unexplored 8 s | Existing familiarity |
| EN2 | **Danger:** interval from the square's `threatLevel` | 6 × (6 − threatLevel) s, minimum 6 s (threat 5 → 6 s; threat 0 → 36 s) | Existing `threatLevel` |
| EN3 | **Combined** | max(EN1, EN2) for safe ground, min for dangerous ground (exact rule written in the test record) | Both |

**Why:** a player can see why a square is dangerous (its familiarity and threat), so this is not hidden adaptive difficulty.

**Unknowns:** no density or noise data exists. EN2 depends on how `threatLevel` is generated (hash and distance), which may not match intended danger.

## 3.4 Soft tier-progression candidates (test-only; production formulas unchanged)
| ID | Model | Inputs | Over-tier threats |
|---|---|---|---|
| ST0 | Current distance pool | scroll distance | Not designed; all tiers by about 1 km |
| ST1 | **Progression band.** Normal pool = tiers ≤ survivor band (from character or combat level). Over-tier picks happen at a small rate | character level | +1 tier: 3% of encounters; +2: 0.5% (test values) |
| ST2 | **Region band.** Pool centred on the square's `difficulty` (±1 tier) | square difficulty | as ST1 |
| ST3 | **Distance from safe ground.** Band grows with Traversal distance from home or camp, not walked scroll | home/camp cells, square position | as ST1 |
| Warned-threat handling (all) | An over-tier encounter **uses the existing prompt system** (timer plus policy default): the policy chooses evade or fight, and the player can redirect if watching. Test-only stand-in: an extra escape attempt before the fight | existing prompt and escape code | Matches design rule 4.5: attention only where it matters, with a timer and a default |

**Note:** no "special encounter class" or warning UI exists. The prompt reuse is a proposal to check against the prompt system before any build.

## 3.5 Matrix and feasibility (run only after BEST1 is accepted and H2-BEST1 is recorded)
**Structure:**
- **Reference:** H2-BEST1.
- **Factors:** MS0–MS4 × EN0–EN3 × ST0–ST3, screened one factor at a time, then about 6 promising combinations.
- **Also include:** the 70% hit-chance candidate as a separate axis.
- **Runs:** 4 starts × 5 common seeds × 7 days (14 days for ST1, which needs character growth).
- **Movement:** traversal fixture on (one square per return) plus a stay-home control.

**Policies:** the harness supports ethical, immoral, criminal and heinous (heinous via the existing D4 unlock fixture). Run all four on the final candidates; ethical only for screening.

| Metric | Feasible now? |
|---|---|
| Downings/day, encounters per Downing, encounters/day, kills/day | Yes |
| Exploration hours/day; rest by cause; stress bands over time | Yes (observation hooks from STRESS-01) |
| Distance; **new cells visited** | Yes. New cells come from Traversal position changes, not scroll. Repeated walking on a cleared square is never counted as exploration |
| Enemy tiers encountered; armor-adjusted damage | Yes once BEST1 carries tier and armor |
| Ammunition and equipment effects | **No.** Ammunition is a parked draft (`ammo-12`); only starter weapons and the jacket can be compared |
| Carry/overload time | Yes (overload flag and load withdrawals) |
| Forced retreats and recovery loops | Yes (H2 S1–S5, empty-cycle streaks) |

## 3.6 Unresolved design questions
1. What counts as "safe ground" for ST3 (home and camp only, or any cleared square)?
2. Which progression measure drives the tier band (character level, combat level, or something else)?
3. Should over-tier threats always be warned, or only above +1 tier?
4. Is `threatLevel` the intended danger signal, or should danger be redesigned?
5. Which stress gains are "persistent" in MS1 (is Shaken persistent)?
6. How should bed tiers become reachable? (Out of scope here, but MS results depend on the Bedroll staying the only bed.)
7. Candidate exploration ranges to compare (D4: no fixed target). Proposed reporting bands: < 1 h, 1–4 h, 4–8 h, > 8 h of exploring per day.

---

# Deliverable 4 — Decision register

## 4.1 Verified defects
| ID | Defect | Evidence |
|---|---|---|
| DF1 | Wandering encounters drop the bestiary id, tier, armor, speed and traits (`ZI._bgZombie`) | Code; BESTIARY-01 runs; draft BEST1-02/03 fail on the current build |
| DF2 | Existing enemy armor never reaches Wandering combat (all 45 types fight at armor 0) | BEST1-04/06 fail; BESTIARY-01 armor applied 0.00 |
| DF3 | Wandering never unlocks Codex entries (`discoverZombie` gated on a missing id) | 0 of 45 in 7-day runs |
| DF4 | The Wandering card mixes records for duplicated names (S-tier HP with C-tier INIT and sprite) | **Rendered** Oct 17 (probe, `id 38`) |
| DF5 (test coverage) | split-equivalence cannot detect changes to `_bgZombie`, `WanderSim` or `WANDER_SIM_TABLE` (already allow-listed) | Patched copies pass it unchanged |

## 4.2 Proposed corrections (awaiting Gate 1)
- **BEST1:** carry `bestiaryId`, `tier`, `armor`; add the `codexFromWandering` flag (recommended Option A, false).
- **New suite:** `best1-enemy-identity.test.js` and browser check `best1-checks.js`.
- **H2 labels:** H2-LEGACY (kept), H2-LEGACY-OCT17, H2-BEST1.

## 4.3 Existing locked rules (preserved)
- H1 one clock and seeded rolls; FX1 HP floor 1; FX2 per-return 24 h cap; FX3 buffs on simulation time; CB1 starter weapon stats; R1 retreat rules.
- PF1 resume gate stress < 70; Shaken 80; retreat ceiling 71–95 (Oct 16).
- One game clock (1 game hour = 6 real s); Jester stay and injuries on game days; skill decay on real days (Oct 16).
- Headshot decisions (Oct 16) — concept parked.

## 4.4 Provisional balance targets
- 2–5 Downings/day for a starting survivor against matched early enemies (D8). Not a cap; not locked.
- No active-exploration target (D4). Ranges to be compared.

## 4.5 Decisions requiring Sam's approval
1. BEST1 scope as written (three fields; speed and traits excluded).
2. **Codex boundary: Option A or B** (D2).
3. The `codexFromWandering` data key and its default.
4. New test suite and browser check as acceptance; H2 labels and folders, including H2-LEGACY-OCT17.
5. Separately: whether Codex Discovery XP may mark Discovery as active for skill decay (Option B only).
6. Separately: bestiary speed and traits in escape or initiative (needs a common speed scale).
7. Separately: renaming the two duplicated names.
8. Separately: whether the encounter card should show tier or armor (UI change).
9. BALANCE-03: which candidate families to run, and the open questions in 3.6.

## 4.6 Deferred to future systems
- Armor and damage types (WEAP-ARMOR-01, parked).
- Headshot mechanics (concept parked).
- Ammunition (`ammo-12`, parked).
- Comfort items and the Church scene (parked).
- Reachable bed tiers.
- Local zombie density and noise.
- Special encounter classes.
- Visible tier or armor on the encounter card.

---

**Stop point:** plans and register delivered. No production code will be written until Sam approves Gate 1 (BEST1 scope, Codex option, tests).
