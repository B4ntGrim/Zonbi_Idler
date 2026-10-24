# H1 Formal Documentation Closure — for Claude Design

**From:** Claude Code · **Date:** Oct 10 · **Companion file:** `H1_ACCEPTANCE_REPORT.md` (full evidence)
**Purpose:** close H1 in the design record. Every change below is documentation only. No gameplay code, test, save format or H1 decision changes.

---

## 1. Closure declaration

**`H1 CLOCK AND RNG: CLOSED` (Oct 10).** All nine completion criteria in `CURRENT_BATCH.md` are met:

| # | Criterion | Evidence |
|---|---|---|
| 1 | Steps 0–9 done; blocker resolved with authorized edits only | Report §1, §12 |
| 2 | Required tests 1–11 pass; new suite identical in 5 of 5 runs | 19/19 each run, byte-identical output |
| 3 | R1 check 15 passes in all 25 runs | Frozen ×20 = 20/20; 5 ms delay ×5 = 5/5 (was 2/20 frozen) |
| 4 | Differential shows only declared differences; existing suites 415/415 | 10 + 27 runs, only `_simNow` differs; 434/434 with the new suite |
| 5 | Headless save compatibility | Pre-H1 save (v7): same keys, fields, version; run continues |
| 6 | Changed-line inventory, zero scope violations | Report §3 |
| 7 | Report complete | `H1_ACCEPTANCE_REPORT.md`, all 15 items |
| 8 | Browser real-save isolation | **PASSED** (Sam, Chrome, Oct 10, local H1 build, `http://127.0.0.1:8080`): fingerprint 1883847335 before and after; real/game keys 29/29 unchanged; test keys 11 → 24 |
| 9 | `CODE_STATE.md` holds audit, watching list, bounds, hook locations | Updated Oct 10 (includes the TQ7 correction and H1 status) |

**R1 is not closed by this.** R1 still needs Code's `BATCH R1: CLOSED` report.

---

## 2. Edits to apply (exact text)

### 2.1 `reference/sim-harness-v1-brief.md` — status line (line 3)

Replace the whole `**Status:**` line with:

> **Status:** **H1 CLOSED (Oct 10).** Code reported `H1 CLOCK AND RNG: CLOSED` with all nine completion criteria met (`reference/archive/h1-acceptance-report.md`); Sam's browser save-isolation check passed on the local H1 build. H1's batch contract is archived as `reference/archive/h1-batch.md`. **H2 is decided in outline only** (Section 6) and cannot begin until H1, FX1 and FX2 are closed (U3, Oct 10). **Standing precondition:** before the Claude Design real-game preview runs any H1 build, the TEST SAVE preview must pass the real-save fingerprint check (acceptance report §13).

### 2.2 `CURRENT_BATCH.md` — TQ7 wording fix, then archive

**a. Line 37** (`game/bootstrap.js` entry). Replace:
> add `now` to the replay's `ALWAYS` list. The replay must keep hiding `ZI.now` before old line 1650.

with:
> The replay keeps hiding `ZI.now` before old line 1650 (`now` is **not** in the `ALWAYS` list); rule code uses `ZI.clockNow()`, which the replay never hides.

**b. Step 2.** Replace:
> Add `now` to the bootstrap `ALWAYS` list, keeping `ZI.now` hidden before old line 1650.

with:
> Leave the bootstrap `ALWAYS` list unchanged, so `ZI.now` stays hidden before old line 1650.

**c. Add a correction note** under the status line:
> **Correction (Oct 10, TQ7):** Code's step report said adding `now` to `ALWAYS` changed 16 results. Tested in isolation, it changes none; those failures came from a name collision with the world clock's `ZI._clock`. The implementation was correct throughout; only the explanation and this wording were wrong.

**d. Replace the status line** with:
> **Status:** **CLOSED (Oct 10).** All nine completion criteria met; see `reference/archive/h1-acceptance-report.md`.

**e. Archive:** move the file to `reference/archive/h1-batch.md`. The project root has **no** `CURRENT_BATCH.md` until the next batch (FX1) is locked. Code must not start any batch while it is absent.

### 2.3 Acceptance report — file it

Save `H1_ACCEPTANCE_REPORT.md` as `reference/archive/h1-acceptance-report.md`.

### 2.4 `reference/00-document-index.md`

- **Row for `sim-harness-v1-brief.md`**, status column. Replace with:
  > H1 **CLOSED** (Oct 10). H2 decided in outline; starts after H1, FX1 and FX2 are CLOSED (U3)
- **Add to "Archived":**
  > | `h1-batch.md` | H1 batch contract, CLOSED Oct 10 |
  > | `h1-acceptance-report.md` | Code's H1 acceptance report (Oct 10) |
- **Add to the decisions log:**
  > | Oct 10 | H1 (one clock, seeded rolls) CLOSED; browser isolation passed on the local build | `archive/h1-acceptance-report.md` |
  > | Oct 10 | U1–U4 decided: Downed keeps HP at 1; strict 24 h per-return cap including carried time; H2 waits for H1, FX1, FX2; Scenario B uses the Belt Pouch | `sim-harness-v1-brief.md` |
- **`poi-framework-v1-brief.md` row:** unchanged (still blocked on R1 and the HP drain bug).

### 2.5 `DESIGN_HANDOFF.md` — new handoff

Move the Oct 9 handoff to `archive/design-handoff-oct9.md`. Write the new one with at least these contents (rules §11):

**1. Decisions made**
- Oct 10: **U1** Downed triggers when damage would reduce HP to 0 or below; HP stays at 1. **U2** The offline per-return cap is strictly 24 h, including previously carried time; excess is discarded. **U3** H2 waits for H1, FX1 and FX2 to close; FX3 and FX4 may stay open only if their limits are stated in H2's validity and reports. **U4** Scenario B uses the existing Belt Pouch; T1 and T2 run in Scenario A; T3 in both.
- Oct 10: H1 CLOSED.

**2. Files changed** (Oct 10)
- Code: `CODE_STATE.md` (TQ7 correction, H1 status).
- Claude Design: the brief's status line, `CURRENT_BATCH.md` (corrected, closed, archived), the index, this handoff, the acceptance report filed.

**3. Open questions**
- **U4 finding (Code, Oct 10):** over 24 h, Scenarios A and B produced identical withdrawal counts (17/17, 16/16, 15/15). HP and load fail together around 84–90 s; the Belt Pouch (cap 15 → 18 kg) only shifts the primary cause from load to HP. **Scenario B needs an HP-side change** (armor, weapon or heals) to test what it intends. Sam to decide before H2 is drafted.
- **FX1 (U1):** resting from 1 HP instead of 0 shortens rest slightly; sequence-dependent R1 checks 20 and 26 may shift. FX1 must check, never edit, them.
- **FX2 (U2):** no conflict with locked rules found. The H1 suite's test 10b stays valid; test 10c's INFO reading will change from 48 h to at most 24 h.
- **FX3 / FX4 candidates:** DH3 (XP decay has no floor clamp) and G1 (buffs pruned by the current clock).
- **R1:** still open; needs Code's `BATCH R1: CLOSED` report. DH1 (HP ~0 after Downed) is the strongest candidate for the HP drain bug.

**4. Next step**
Draft FX1 (U1) as the next slice and batch for Sam to lock. Do not start FX2 or H2 until FX1 is closed and Sam approves.

---

## 3. Standing precondition (carry forward, do not drop)

Sam's browser check validated the **local** H1 build only. The Claude Design preview (origin `https://019defa1-…claudeusercontent.com`) still runs the **pre-H1** build (`h1Build: false`, Oct 10).

**Before the real-game preview runs any H1 build:**
1. In the TEST SAVE preview frame, record the real-save fingerprint (Snippet B).
2. Sync the H1 files into the project. Do not open the real-game preview yet.
3. In the TEST SAVE preview frame, confirm `h1Build: true` and `shimActive: true` (Snippet A).
4. Confirm the fingerprint matches step 1, play 1–2 minutes, and confirm it still matches.
5. Only then open the real-game preview.

---

## 4. Out of scope (not started)

FX1, FX2, FX3, FX4, H2 and R1 closure. Nothing in this closure authorizes them.

---

## 5. Confirmation requested from Claude Design

Reply with:
1. Each edit in §2 applied, with the files changed.
2. The new `DESIGN_HANDOFF.md` written and the old one archived.
3. The §3 precondition recorded in the brief and the handoff.
4. Confirmation that no `CURRENT_BATCH.md` remains at the project root.
5. Stop. Do not draft or start FX1 until Sam asks.
