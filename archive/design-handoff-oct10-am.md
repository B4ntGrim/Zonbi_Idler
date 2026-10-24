# Zed Idler — Design Handoff (Oct 10)

**Read first:** `CLAUDE_DESIGN_RULES.md`, then this file, then `reference/00-document-index.md`.
**Replaces:** `archive/design-handoff-oct9.md`. When the next handoff is written, move this one to `archive/`.
**No `CURRENT_BATCH.md` at the project root.** H1's contract is archived as `reference/archive/h1-batch.md`. Code must not start any batch until the next one (FX1) is locked.

---

## 1. Decisions made

- **Oct 10:** **U1** Downed triggers when damage would reduce HP to 0 or below; HP stays at 1. **U2** The offline per-return cap is strictly 24 h, including previously carried time; excess is discarded. **U3** H2 waits for H1, FX1 and FX2 to close; FX3 and FX4 may stay open only if their limits are stated in H2's validity and reports. **U4** Scenario B uses the existing Belt Pouch; T1 and T2 run in Scenario A; T3 in both.
- **Oct 10:** H1 CLOSED. Code reported `H1 CLOCK AND RNG: CLOSED` with all nine completion criteria met. Sam's browser save-isolation check passed on the local H1 build (`http://127.0.0.1:8080`): fingerprint 1883847335 before and after; real/game keys 29/29 unchanged; test keys 11 → 24.
- **Oct 10:** Q1, Q2, Q4, Q5, Q6 `[DECIDED]`; Q3 `[PENDING — TECHNICAL VERIFICATION]` (`reference/h1-findings-decisions-oct10.md`).

## 2. Standing precondition (acceptance report §13)

Sam's browser check validated the **local** H1 build only. The Claude Design preview still runs the **pre-H1** build (`h1Build: false`, Oct 10).

**Before the real-game preview runs any H1 build:**
1. In the TEST SAVE preview frame, record the real-save fingerprint (Snippet B).
2. Sync the H1 files into the project. Do not open the real-game preview yet.
3. In the TEST SAVE preview frame, confirm `h1Build: true` and `shimActive: true` (Snippet A).
4. Confirm the fingerprint matches step 1, play 1–2 minutes, and confirm it still matches.
5. Only then open the real-game preview.

## 3. Files changed (Oct 10)

**Code:** `CODE_STATE.md` (TQ7 correction, H1 status).

**Claude Design:**
| File | Change |
|---|---|
| `reference/sim-harness-v1-brief.md` | Status line replaced (H1 CLOSED); §10 batch line and standing precondition; D11 Scenario B finding with Code's numbers |
| `CURRENT_BATCH.md` → `reference/archive/h1-batch.md` | TQ7 wording fixed (file list, step 2); correction note; status CLOSED; archived. None left at root |
| `reference/archive/h1-acceptance-report.md` | **Filed** from Code's `H1_ACCEPTANCE_REPORT.md` |
| `reference/00-document-index.md` | Sim-harness row; two Archived rows; two decisions-log entries |
| `reference/gameplay-fix-batches-proposal.md` | H1 row and TQ6–TQ8 heading marked closed/answered |
| `reference/h1-findings-decisions-oct10.md` | "H1 remains NOT CLOSED" marked superseded (source text kept verbatim) |
| `reference/wandering-tab-spec.md` | Q1, Q2/U2, Q4, Q5, Q3 note (earlier Oct 10) |
| `DESIGN_HANDOFF.md` | **New** (this file); Oct 9 handoff archived as `archive/design-handoff-oct9.md`. Corrected after Code's review: DH1/drain line, FX1 checks 20 and 26 |
| `reference/r1-fx1-readiness-review.md` | **Filed** from Code's review (Oct 10) |

## 4. Open questions

- **U4 finding (Code, Oct 10):** over 24 h, Scenarios A and B produced identical withdrawal counts (17/17, 16/16, 15/15). HP and load fail together around 84–90 s; the Belt Pouch (cap 15 → 18 kg) only shifts the primary cause from load to HP. **Scenario B needs an HP-side change** (armor, weapon or heals) to test what it intends. Sam to decide before H2 is drafted.
- **FX1 (U1):** resting from 1 HP instead of 0 shortens rest slightly (15.8 min instead of 16 to reach 80%). Code's dry run of the one-line fix (`wandering.js:326`) passed r1 42/42 with checks 20 and 26 unchanged (`reference/r1-fx1-readiness-review.md` §4; this supersedes the "may shift" note in the acceptance report §14). FX1 must still check, never edit, them. Code's open presentation question: in a Downed fight the log shows the attack's full damage while HP only falls to 1; Code recommends keeping it.
- **FX2 (U2):** no conflict with locked rules found. The H1 suite's test 10b stays valid; test 10c's INFO reading will change from 48 h to at most 24 h.
- **FX3 / FX4 candidates:** DH3 (XP decay has no floor clamp) and G1 (buffs pruned by the current clock).
- **R1:** still open; needs Code's `BATCH R1: CLOSED` report. Outstanding (review §2): check 31 browser check with fingerprint on the post-H1 build; Code's completion report; removing the 4 rows R1 activates from `PARKED.md`; a decision on the HP drain bug. FX1 is not an R1 requirement. The POI framework stays blocked.
- **HP drain bug:** DH1 and the HP drain bug are separate. The drain is not yet diagnosed. Code's unconfirmed hypothesis (review §3): a second tab or preview frame of the same save holds the simulation lock, so the visible screen redraws HP with no events. Code proposes a two-tab TEST SAVE reproduction; a fix would be its own batch.
- **Archive folder:** the Oct 9 handoff is in root `archive/` (rules §2 and Sam's instruction); design records are in `reference/archive/`.
- Carried from Oct 9, unchanged: audit §2 items A–E; Church and Workshop counts per grid; distance scaling; Code's four world-grid questions; confirm `r1-brief.md` belongs in `archive/`.

## 5. Next step

Draft FX1 (U1) as the next slice and batch for Sam to lock. Do not start FX2 or H2 until FX1 is closed and Sam approves.
