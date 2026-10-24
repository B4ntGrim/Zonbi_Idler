# Zed Idler — Design Handoff (Oct 17–18)

**Read first:** `CLAUDE_DESIGN_RULES.md`, then this file, then `reference/00-document-index.md`.
**Replaces:** the Oct 15 handoff, archived as `archive/design-handoff-oct15.md`.
**Active work:** **BALANCE-03** investigation (read-only; no balance value authorized).

---

## 1. Decisions made (Oct 16–17)

- **Oct 16:** one game clock (1 game hour = 6 real s) for crafting, builds, camp schedule, world/header clock, routes, Jester's camp and injuries; skill decay stays on real days. PF1: resume gate stress < 70, Shaken 80, retreat ceiling 71–95. Headshot = instant kill (own roll); Sunken Blade passive Godly Strike + gauntlet set bonus vs bosses; armor/damage types and a shoulder slot filed as `[CONCEPT]`s. (Details: `reference/00-document-index.md` decisions log.)
- **Oct 17:** provisional early-game target 2–5 Downings/day (not locked, not a cap); no fixed active-exploration target yet (D4).
- **Oct 17: BEST1 approved with Option A, implemented, and CLOSED (Sam).** Wandering fights now carry the picked bestiary record's existing id, tier and armor; speed and traits excluded; Codex unlocks from Wandering stay off (`WANDER_SIM_TABLE.codexFromWandering: false`). Sam's hands-on TEST SAVE check passed (duplicate names show their own records; no Codex entries unlocked).
- **Oct 17:** keep the Oct 15 H2 results untouched; new baselines `legacy-oct17/` (unmodified build) and `best1/` (after BEST1).
- **Oct 17: BALANCE-03 directions `[DECIDED Oct 17]` (Sam, after the first screening):**
  1. Near-death stress scales with how close to death the survivor got (replaces the flat +5 at 25% HP).
  2. HP recovers a little after each kill.
  3. The zombie tier band follows the square's `difficulty`.
  4. Soft tiers keep rare stronger zombies, always warned through the existing prompt system (timer plus policy default).
  5. Background Wandering awards character XP, as watched Wandering already does.

  These are directions. Thresholds, amounts and rates stay `[PROPOSED]` until round 2 is reviewed, and no production code changes.

- **Oct 18: BALANCE-03 round 2 answers `[DECIDED Oct 18]` (Sam):**
  1. A Downing counts as the top of the near-death scale. It adds the full stress even when the survivor goes straight to rest; today about 80% of those Downings add none.
  2. Scale starting values: 1 / 1 / 3 stress at 25 / 15 / 5% HP (worst case 5, as today).
  3. The heal after a kill is tied to the zombie. Size stays `[PROPOSED]`.
  4. Round 3 (active-time levers) approved.

- **Oct 18: BALANCE-03 round 3 answers `[DECIDED Oct 18]` (Sam):**
  - The active-share target is 25–50% of the day out in the field (early game; a tuning target, not a cap).
  - A full Downing (Forced Retreat) costs 5 stress.
  - Answered later Oct 18: see the heal-or-retreat entry below.

- **Oct 18: heal-or-retreat, Option C preferred `[DECIDED Oct 18]` (direction; simulation before any UI or production change).**
  - Priority order: (1) check HP before each encounter; (2) heal below the heal threshold, re-checking after each heal, and never on a charge that can't restore HP; (3) retreat if still below the retreat threshold; (4) the in-fight emergency heal still prevents a Downing, then the same checks apply; (5) no encounters once a retreat starts.
  - The heal threshold must be above the retreat threshold. Test values 40/30 and 60/50.
  - The +5 top-up applies only to a full Downing (Forced Retreat). A heal rescue gets only the existing stress effects.

- **Oct 18: round 4 answers `[DECIDED Oct 18]` (Sam):**
  - Medkits are consumables; they never refill from returns.
  - Under Option C the post-kill top-up is replaced; the threshold rule controls proactive healing.
  - Fumbles stay. "Never spend a charge that can't restore HP" means no pointless heals; wasted charges are reported separately.
  - Round 5 approved, simulation only, with each change tested separately.
  - **Open:** the 2 base heal charges refill once per day (spec) or after every rest (code)?

- **Oct 18 (later): Sam's proposal "Healing, first Downing, and Mystic Jester" (for review; no implementation).** Consumable-only healing; no free charges; the Fort-bound kit gives no charges; no extra tutorial Medkit; the first Downing leads to the Jester; 1–2 Downings a day is acceptable for gentler policies. **Supersedes the entry below.** Round 7 plan and questions: `balance-03-round7-plan-oct18.md`.
- ~~**Oct 18: healing supply `[DECIDED Oct 18]` (Sam):**~~ *(superseded; kept for history)*
  - The 2 free base heal charges stay and refill. **Open:** how often (per rest or once per day).
  - Completing the tutorial gives one Medkit (2 charges), destroyed when empty.
  - Completing the Mystic Jester encounter gives a quest-item medkit for the Fort (the existing Fort-bound Med Kit; can't heal).
  - Round 6 approved, simulation only.
  - **To propagate after Sam's go:** spec §13.3 and the tutorial spec. In today's code the starter kit comes with the new save and a tutorial skipper forfeits it.

- **Oct 18: round 7 Phase A answers `[DECIDED Oct 18]` (Sam), details in the index decisions log:**
  - one ordinary Medkit rule (2 charges × the First Aid formula everywhere; no +60 single use; no regeneration; no free base charges);
  - a crafting recipe to be proposed before Phase B;
  - the scripted intro encounter approved (Downed at exactly 1 HP, scene immediately, persisted, no duplicates, reported separately);
  - no stress from the intro fight, with the trade, camp, relocation and all rewards kept (pouch first, normal capacity);
  - a tutorial-skip flag planned;
  - Phase B keeps encounter spacing as a proposed lever; stress scaling and post-kill healing are not adopted.
  - **To propagate after Phase B review:** spec §13.3 (charges), the tutorial spec §3.2, elder-jester-concept U21 (the "daily base charges" note), and the `medkit` item text.

## 2. Where the build stands

**CLOSED:** H1 · FX1–FX5 · CB1 · RB1 · RB2 · JD1a · **BEST1**.
**H2:** the full 80-run matrix now exists twice (`reports/sim-harness-v1/legacy-oct17/`, `best1/`, all OK); H2's own close-out report is still to be reviewed with Sam.
**Queue:** BALANCE-03 (investigation) → balance batch (after Sam's decisions) → JD1b (Jester scene) → weapons Phase 1 read-only audit.

## 3. Files changed (Oct 16–17)

| File | Change |
|---|---|
| `game/core.js`, `camp.js`, `routes.js`, `active.js`, `stats.js`, `screens-v2.jsx`, both HTML pages | Oct 16 clock unification, PF1, Shaken 80 (see `CODE_STATE.md`) |
| `game/wandering.js` | BEST1 (`20d20e48f196be4a` → `dfcdfdfa41988ba5`) |
| `tests/best1-enemy-identity.test.js` | **New**, 16 checks |
| `tools/browser-check/best1-checks.js` | **New** TEST SAVE browser check (13/13) |
| `tests/*` (8 suites) | Oct 16 labelled updates for the clock and PF1 |
| `reports/sim-harness-v1/legacy-oct17/`, `best1/` | **New** 80-run baselines (each also holds `records.tgz`, a transfer copy; safe to delete) |
| `CODE_STATE.md` | Clock, PF1, BEST1 facts |
| `reference/…` | Oct 16 decisions propagated (spec, PARKED, headshots, armor/damage types, shoulder slot, index) |
| `DESIGN_HANDOFF.md` | This file; previous archived |

Investigation reports (Claude project, `claude/`): `zombie-accuracy-sim-oct17.md`, `combat-balance-investigation-oct17.md`, `stress-01-…`, `bestiary-01-…`, `balance-02-…`, `best1-pre-balance-03-plan.md`, `best1-implementation-report.md`.

## 4. Open questions

**For Sam (BALANCE-03):** answered Oct 17. The tier band follows square difficulty; over-tier threats are always warned. "Safe ground" (ST3) and "persistent" stress (MS1) are no longer needed for the chosen direction. Round 2 results and the remaining number choices: see `balance-03-round2-oct17.md` (Claude project).
**For Sam (BALANCE-03, Oct 19), `[OPEN]`, from `balance-03-gear-progression-oct18.md` §4:**
- rule 5 scope for policy events;
- whether field time (now 55–63%) or Downings per km governs;
- repair cost vs durability (proposed: raise T0 durability);
- park automatic repair;
- Broken penalty strength.

**For Code (facts to confirm, `[CODE]`):** equipped weapon damage is summed across slots; only the first weapon slot wears; helmet and gloves never wear.

**For Sam (later):** Codex Option B (one data key) · bestiary speed/traits in escape (needs a common speed scale) · renaming the two duplicate names · showing tier/armor on the encounter card · H2 close-out.
**Carried, unchanged:** see the Oct 15 handoff §4 (R1 `BATCH R1: CLOSED` for Code; Q3 decay floor; tutorial fold-in; U24; audit §2 A–E; world-grid questions).

## 5. Next step

**Oct 19 evening:** Sam answered Batch A:
- **Broken model locked;**
- tested numbers accepted as starting values;
- "Heinous attacked by all factions" parked;
- no Hard mode, and the item loss becomes a parked policy rule;
- injury fixed in Batch A: 1.5 real h, active-only growth, item cure.

**Files changed:**
- `reference/00-document-index.md` (decisions log);
- `reference/wandering-tab-spec.md` (superseding notes at §13.8 and §15.3);
- this handoff;
- `claude/slice-retreat-broken-batch-a-draft.md` (Claude project).

**Later the same evening:**
- **O6:** the injury timer is frozen while the game is closed.
- **O7:** cures are a low rest chance, the existing Field Bandage, or an ointment later. The Medkit no longer cures.
- **O8:** difficulty modes stay.

**Final answers:**
- 8% rest cure chance, with automatic Field Bandage use;
- a new **resting policy** (deliberate Rest once per day across all pages) `[CONCEPT]`;
- **H2 CLOSED** (archived as `archive/batch-h2-closed-oct19.md`);
- `CURRENT_BATCH.md` is the **BAL-A draft, not locked**.

**Files changed:**
- `CURRENT_BATCH.md`;
- `archive/batch-h2-closed-oct19.md` (new);
- `reference/00-document-index.md`;
- `reference/wandering-tab-spec.md` (§13.8 and §15.3 notes);
- this handoff;
- Claude project: the slice draft.

**Deliberate Rest:**
- The 8% cure roll happens only on the once-a-day Rest (decided on Design's recommendation).
- Proposed: real day, local-midnight reset; +25 HP and −10 stress in place; ships in Batch B.

**BAL-A LOCKED (Sam, Oct 19):** deliberate Rest details confirmed (real day, local-midnight reset, +25 HP and −10 stress, Batch B). `CURRENT_BATCH.md` is now the locked BAL-A.

**Step-1 report done. Clarifications D1–D7b recorded (slice brief §3a). Implementation AUTHORIZED (Sam, Oct 19).**

**Files changed:**
- `CURRENT_BATCH.md` (status, decided behavior, likely files, acceptance 1–5 and 9–10, stop conditions);
- `reference/00-document-index.md`;
- this handoff;
- Claude project slice brief (§3a, status, Batch C row).

**BAL-A implemented (Oct 20):** all automated checks pass (26 suites, 502/502; reduced H2 matrix 16/16 OK). Report: `handoff/to-design/BAL_A_COMPLETION_REPORT.md`. Backup: `archive/pre-bal-a-oct20/`. **`BAL-A: NOT CLOSED`** until three things are done: Sam's TEST SAVE check, the full 30-day H2 matrix, and Sam's review of the report's scope note §4.

**Scope note §4:** production with BAL-A gives about 10 Downings per km (about 30% fewer than before), but not the simulated 1–2 a day. These are decided or proposed but in no batch yet:
- tier by square difficulty;
- Option C;
- the near-death scale;
- the post-kill heal;
- consumable-only healing without free base charges;
- the encounter-spacing lever.

**Next:** Sam reviews and checks BAL-A; Design schedules the §4 rules (or folds them into Batch B or C); then Batch B is drafted.
