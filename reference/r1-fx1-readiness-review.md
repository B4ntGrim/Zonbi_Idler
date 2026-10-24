# R1 Closure and FX1 Readiness — Technical Review

**From:** Claude Code · **Date:** Oct 10 · **Type:** read-only review. No game code, tests, saves or documents were changed.
**Evidence base:** the local `E:\Zed_Idler` files (staged Oct 10), `reference/archive/r1-brief.md`, `CODE_STATE.md`, `PARKED.md`, and the Oct 8 design conversation in which the HP drain bug was first reported. All 15 suites were run on a copy. One dry run of the proposed fix was done **in memory on a throwaway copy**; nothing was saved.

---

## 1. H1 documentation: what still needs to sync

Claude Design's revised documents are **not yet in the local folder** or in the claude.ai Project. Nothing was recreated.

| Local file | Local state now | Claude Design's reported state | Action |
|---|---|---|---|
| `CURRENT_BATCH.md` (root) | Still present; Oct 9 text; line 37 and step 2 still say "add `now` to `ALWAYS`" | Archived as `reference/archive/h1-batch.md`, TQ7 wording corrected | Copy `h1-batch.md` in, then remove the root file |
| `reference/archive/h1-batch.md` | Missing | Exists | Copy from Claude Design |
| `reference/archive/H1_ACCEPTANCE_REPORT.md` | Present, content correct | Named `h1-acceptance-report.md` | Rename only |
| `reference/sim-harness-v1-brief.md` | Status line still "H1 `[DECIDED Oct 9]` … batch contract `CURRENT_BATCH.md`" | "H1 CLOSED (Oct 10)" plus the preview precondition | Copy from Claude Design |
| `reference/00-document-index.md` | Oct 9 rows | H1 CLOSED row, archived rows, decisions log | Copy from Claude Design |
| `DESIGN_HANDOFF.md` (root) | Oct 9 handoff | New Oct 10 handoff | Copy from Claude Design |
| Old handoff in archive | Missing | Archived as `design-handoff-oct9.md` | Confirm the folder (see note) |
| `H1_CLOSURE_FOR_CLAUDE_DESIGN.md` (root) | Present | Applied | Move to `reference/archive/` |

**Folder note:** the project has two archive folders, root `archive/` (legacy builds) and `reference/archive/` (design records). The closure package said `archive/design-handoff-oct9.md`. Ask Claude Design which one it used. The rules (§2) put retired documents in `archive/`; design records so far live in `reference/archive/`.

**A third copy is drifting.** The claude.ai Project holds `claude/DESIGN_HANDOFF.md` and `claude/00-document-index.md` at their **Oct 9** versions and has no copy of `sim-harness-v1-brief.md`. Decide which copy is the master, and update or remove the others.

**One correction to propagate (my error).** The closure package and the new handoff say "DH1 is the strongest candidate for the HP drain bug." This review shows they are **separate defects** (§3). Claude Design should replace that line wherever it appears with: "DH1 and the HP drain bug are separate. The drain is not yet diagnosed."

---

## 2. R1: what is still outstanding

R1 has **never been formally closed.** Every R1 completion report on record says `BATCH R1: NOT CLOSED`. Steps 2–5 were built later (`CODE_STATE.md`), but check 15 still failed at the H1 baseline, so R1 could not have closed before H1.

| # | Requirement | Status |
|---|---|---|
| R-a | Automated checks 1–30 (`r1.test.js`) | **42/42 PASS** today, including check 15 (deterministic since H1) |
| R-b | Check 30, regressions | **PASS**: all 15 suites green |
| R-c | **Check 31, the browser check** (TEST SAVE only; identify the page first; write monitor or real-save fingerprint throughout) | **No recorded result.** QA screenshots `r1-01` to `r1-06` exist, but no report records the fingerprint. Must be run on the current post-H1 build |
| R-d | **Code's completion report** stating `BATCH R1: CLOSED` | **Missing** |
| R-e | `PARKED.md`: confirm and remove the 4 rows R1 activates (overload withdrawal, "Pack heavy" prompt, overnight overload, repeated-Breaking spiral) | Not done |
| R-f | **The HP drain bug**: Sam saw HP fall steadily on the Wandering screen with no enemy and no log line, right after R1 step 1 | **Not diagnosed.** It may be an R1 regression, so R1 should not close until it is diagnosed, or until Sam formally separates it from R1 |
| R-g | `r1-brief.md` was archived before closure (Oct 9 handoff) | Stays valid once R-d exists |

**Can R1 close right after FX1 passes?** **No.** FX1 is not an R1 requirement: R1 passes 42/42 with or without it, and the dry run confirms checks 20 and 26 are unaffected. R1 needs R-c, R-d, R-e and a decision on R-f. The FX1 build is a good build to run check 31 on, so the two can share one browser session.

---

## 3. Are DH1 and FX1 the same defect as the HP drain bug?

**DH1 and FX1 are the same defect. DH1 is not the HP drain bug.**

| | DH1 (fixed by FX1) | HP drain bug (Oct 8) |
|---|---|---|
| Symptom | HP is **0** when a Downed survivor starts Base rest | HP **falls steadily** during patrol, with no enemy, no log line and no damage popup |
| When | Only after a lost fight with no heal and no revive | During normal patrol on the live screen |
| HP direction | Rises from 0 during rest | Falls |
| Reproduced | **Yes**: 15 of 15 seeded Downed retreats leave HP 0 and `restStartHp` 0 | **No** |

**Why the simulation can't be the drain.** Every HP decrease in the simulation is a discrete, logged event: a fight (`wandering.js:326`), a policy hit (`wandering.js:425`) or a failed venture (`active.js:225`). The only continuous HP change is rest, and rest only raises HP. No code path lowers HP over time.

**Leading hypothesis (unconfirmed).** Every beat, the live screen redraws HP from storage (`screens-v3.jsx:1748`, `setPlayerHp(run.hp)`). But it logs only the events its own `liveStep` returned. When another tab or preview frame of the same save holds the simulation lock (`WanderEngine._lead`, `wandering.js:266`), this screen becomes a "follower": `liveStep` returns no events while the other copy fights. The visible screen then shows HP falling with no enemy, no log line and no popup, which matches the report exactly. The Claude Design preview can show the same save in more than one frame, so it is a likely place for this.

**Two-minute reproduction (TEST SAVE only):** open the TEST SAVE Wandering screen in two tabs at once, then watch the tab that isn't focused. If its HP falls with an empty log, the hypothesis is confirmed. Its fix (for example, showing a "running in another tab" notice or relaying events to the follower) is a separate small batch, not FX1.

---

## 4. FX1: scope and required tests

### Decided rule (U1, Oct 10)
Downed triggers when damage would reduce HP to 0 or below. HP stays at 1.

### Where the defect is
| File:line | Function | Role |
|---|---|---|
| `game/combat.js:43` | `ZI.simulateCombat` | Returns `hpLeft: Math.max(0, s.hp)`, which can be 0. Shared by both play modes. **Leave unchanged.** |
| **`game/wandering.js:326`** | **`ZI.WanderSim.resolveEncounter`** | **`state.hp = res.hpLeft;` writes the 0. This is the defect.** |
| `game/active.js:541` | `ZI.forcedRetreat` | Copies it into `restStartHp = Math.max(0, state.hp)`, so Base rest starts from 0 |
| `game/active.js:730–757` | `WS._restNeedMs`, `WS._restStep` | Rest from `restStartHp`. Correct once the start value is right |

These paths already keep HP at 1 or above, and FX1 leaves them alone:
- `simHeal` sets HP to 1 + the heal amount when Downed (`active.js:441`).
- `simRevive` keeps HP ≥ 1 (`active.js:451`).
- A failed venture keeps HP ≥ 1 (`active.js:225`).
- Policy damage keeps HP ≥ 1 (`wandering.js:425`).
- The screen getaway keeps HP ≥ 1 (`screens-v3.jsx:886`).

### Smallest change: one line
`game/wandering.js:326`:
```js
state.hp = Math.max(1, res.hpLeft);
```
- **Downed still triggers at lethal damage.** The Downed decision reads `res.outcome` from `simulateCombat`, which works on its own copy of HP. The clamp happens afterwards.
- **HP never goes below 1.** That makes the fight path match every other damage path.
- **Rest and recovery rules are unchanged.** Rest now starts from 1: at 5 HP per minute, reaching 80% takes 15.8 minutes instead of 16. The 80% HP AND stress < 50 gate is untouched.
- **Nothing unrelated changes:** no change to `combat.js`, active mode, `forcedRetreat`, the save format or the save version. `active.js:541` becomes unreachable at 0 and can stay as it is.

**Dry run (in memory, on a throwaway copy):**
- 15 of 15 Downed retreats now start rest at HP 1 and `restStartHp` 1.
- **All 15 suites pass unchanged:** r1 42/42 (checks 20 and 26 unaffected), sim-clock-rng 19/19, split-equivalence 17/17 (needs no new permitted differences), batch3b 34/34 and the others.

**One small open presentation question for Claude Design.** In a Downed fight the log says "hits you for N" using the full attack (e.g. 12), while HP only falls from 12 to 1. Recommend keeping it as is, because N is the attack's damage, not HP lost. Claude Design should confirm.

### Tests to add (new suite `tests/fx1-downed-hp.test.js`)
1. Downed with no heals and no revive, over 15+ seeds: outcome `forcedRetreat`, cause `downed`, `state.hp === 1`, `restStartHp === 1`, `restAt === 'base'`.
2. Lethal damage still triggers Downed: with a heal charge, the outcome is `healed` and HP is 1 + the heal; with a revive item, the outcome is `revived`.
3. Rest from 1 HP resumes at the exact boundary: 80% HP, at ⌈79 / rate⌉ ms, with stress < 50 still required.
4. Equivalence: 1-second, uneven and bulk processing through a Downed retreat and Base rest give identical results.
5. Invariant: HP is ≥ 1 at every event and every chunk end over a 24 h multi-seed run.
6. Old save: a run saved mid-rest with `hp: 0` and `restStartHp: 0` loads and finishes rest normally, with no migration and no version change.

### Existing tests to rerun, and one authorized edit
- All 15 suites; `r1` ×20 with a frozen clock and ×5 with a 5 ms delay (checks 20 and 26 by name); `sim-clock-rng` ×5 (identical output).
- **Authorized tightening (the batch must state it):** `sim-clock-rng` test 11's HP bound changes from 0–100 to **1–100**, and its DH1 INFO note is removed. This tightens a test; it does not weaken it.
- **Differential against the current build, with the difference declared in advance:** after a Downed fight, HP and `restStartHp` are 1 instead of 0. Base rest is 12 s shorter, so later events in that run shift in time. No other difference is allowed.

### Explicitly out of FX1
FX2 (U2 cap), FX3/DH3, FX4/G1, H2, the HP drain bug, R1 closure, `combat.js`, active mode, the save version.

---

## 5. Recommendation

| Item | Verdict | Conditions |
|---|---|---|
| **FX1** | **CONDITIONAL GO** | (1) Sync the H1 documents locally first (§1). (2) Claude Design writes the FX1 batch with the one-line scope, the 6 new tests, the authorized test-11 tightening and the declared differential above. (3) Claude Design corrects the "DH1 = drain candidate" line. (4) Sam locks the batch |
| **R1 closure** | **NO-GO** for now | Needs check 31 (TEST SAVE browser check with fingerprint), the PARKED.md cleanup, a decision on the HP drain bug, and Code's `BATCH R1: CLOSED` report |
| **HP drain bug** | Diagnose next, separately | Run the two-tab reproduction (§3) before or alongside FX1. If confirmed, it gets its own small batch |
| **POI framework precondition** | Not met | Needs R1 CLOSED **and** the drain fixed. FX1 alone does not satisfy it |

**Suggested order:** sync the documents → run the drain reproduction → FX1 batch → one TEST SAVE browser session that covers FX1 and R1 check 31 → R1 completion report → drain fix batch if confirmed → POI framework.
