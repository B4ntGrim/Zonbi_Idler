# Zed Idler — Design Handoff (Oct 10, merged)

**Read first:** `CLAUDE_DESIGN_RULES.md`, then this file, then `reference/00-document-index.md`.
**Replaces:** the Oct 10 morning handoff, archived as `archive/design-handoff-oct10-am.md` (the Oct 9 handoff is `archive/design-handoff-oct9.md`). When the next handoff is written, move this one to `archive/`.
**Merged Oct 10:** Export 3 (Claude Design) is the base; later decisions from the Oct 10 design session (Elder Jester, CB1, FX2 locked) are merged in.
**Active batch:** **CB1 starter weapons, LOCKED Oct 10** (`CURRENT_BATCH.md`). FX1 and FX2 **CLOSED Oct 10** (`reference/archive/fx1-batch.md`, `fx2-batch.md`). H1's contract is archived as `reference/archive/h1-batch.md` (Design's CLOSED copy) and `reference/archive/h1-batch-working-copy.md` (Code's working copy, kept as a record).

---

## 1. Decisions made

- **Oct 10:** **U1** Downed triggers when damage would reduce HP to 0 or below; HP stays at 1. **U2** The offline per-return cap is strictly 24 h, including previously carried time; excess is discarded. **U3** H2 waits for H1, FX1 and FX2 to close; FX3 and FX4 may stay open only if their limits are stated in H2's validity and reports. **U4** Scenario B uses the existing Belt Pouch; T1 and T2 run in Scenario A; T3 in both. *(U4's fixture is superseded by U8 and U19 below.)*
- **Oct 10:** H1 CLOSED. Code reported `H1 CLOCK AND RNG: CLOSED` with all nine completion criteria met. Sam's browser save-isolation check passed on the local H1 build (`http://127.0.0.1:8080`): fingerprint 1883847335 before and after; real/game keys 29/29 unchanged; test keys 11 → 24.
- **Oct 10:** **U5** reaching 1 HP from any damage source triggers Downed (supersedes U1's trigger wording). **U6** the Downing hit's log shows the attack's full damage. **U7** the HP drain bug is the DH1 defect, fixed by FX1; R1 item R-f is settled by FX1. **FX1 locked** ("run FX1 first").
- **Oct 10:** Q1, Q2, Q4, Q5, Q6 `[DECIDED]`; Q3 `[PENDING — TECHNICAL VERIFICATION]` (`reference/h1-findings-decisions-oct10.md`).
- **Oct 10 (FX2):** **locked** with P1 (no saved `_discardedMs`; tests compute discarded time as elapsed − processed) and P2 (acceptance check 4 interrupts with a save → load round-trip). Starts only after `FX1 HP FLOOR: CLOSED`.
- **Oct 10 (U8–U13, Scenario B and the first Downed):** Scenario B is "the prepared survivor" (U8; its loadout is superseded by U19). The "hard at first" message is delivered at the first Downed, in place or by a splash leading into the last Wandering tutorial steps (U9 `[CONCEPT]`). First-session Wandering narrates scripted finds that point to other tabs (U11 `[CONCEPT]`). The first Downed keeps the whole haul (U12). The splash shows even when the tutorial was skipped (U13). Record: `reference/scenario-b-and-first-downed-oct10.md`.
- **Oct 10 (code read, F1–F3):** the starter kit is granted to the stash **unequipped**, with **no weapon and no food** (explains Scenario A's 15 kg). The Spike Board (Armory) and Nail Bat already exist; no pocket knife existed. No recipes exist for the padded jacket, belt pouch or **med kit** (med kit only from the Shop at 1,500 distance or a faction contract).
- **Oct 10 (the Elder Jester, U14 refined, U15–U19, U21–U24, J1, J6, J7):** the **Elder Jester** (renamed from Mystic Jester) is a companion who stays after the tutorial (U15 `[CONCEPT]`). The starter kit comes **only** from him: old dirty padded jacket, starter weapon, food, a med kit, plus the handmade pouch and scout kit (U16, U22). Starter weapon pick: Nail Bat, Iron Knuckles or Pocket Knife (U17). The tutorial ends at the Fort's approach (U18). Skipping is allowed with the warning "You will not have access to an early, easy start" (U14). The tutorial items arrive through the Jester and the narrated finds; skipping removes them; H2 Scenario A = skipped, B = completed the tutorial (U19). The first med kit is a **locked quest item**, delivery to the Fort only (U21). Skippers meet the Jester later, without the kit (U23). The Jester is a story guardrail, not a rescuer (U24 `[CONCEPT]`, later session). First meeting: the survivor wakes after being Downed, blurred vision clearing on the Jester at his camp; the first in-game Downed is his second appearance (J6). H2 runs **80 runs**, Scenario B once per starter weapon (J7). Record: `reference/elder-jester-concept.md`.
- **Oct 10 (U20):** starter weapon identities: Nail Bat heavy and slow; Iron Knuckles fast hits that stagger; Pocket Knife quiet, better at evading, small scavenging bonus. Numbers `[PROPOSED]`, simulated, in `reference/starter-weapons-cb1-slice.md` (CB1, awaiting Sam's lock).

- **Oct 10 (U25, U26, after FX1 step 1):** the Fort scene is exempt from U5: a failed Fort guard attack floors HP at 1 and never Downs; a player who starts the Fort scene cannot be Downed (U25). A failed Traversal loot search is exempt the same way (U26). U5 now reads "damage inside a Wandering run". Recorded in `CURRENT_BATCH.md`, the FX1 slice and spec §13.8. FX1 implementation approved.
- **Oct 10 (FX1 stop → resolved):** r1 check 28 failed because of the declared U5 difference (`handoff/to-design/FX1_STOP_REPORT.md`). Sam authorized a third check-28 scenario; equivalence assertion unchanged.
- **Oct 10 (FX1 implemented):** all 16 suites pass; r1 ×20 frozen and ×5 delayed pass; checks 20 and 26 unchanged; the differential shows only declared differences. **Only V3 (TEST SAVE browser check) remains** before `FX1 HP FLOOR: CLOSED` (`handoff/to-design/FX1_COMPLETION_REPORT.md`).
- **Oct 10 (FX1 CLOSED):** V3 TEST SAVE browser check passed (HP floor 1, restStartHp 1, full damage logged, rest only rises, real-save fingerprint unchanged). FX2 is now `CURRENT_BATCH.md`.
- **Oct 10 (FX2 CLOSED):** one return now processes at most 24 h including carried time; the old leak let a second return process 33.9 h. All 17 suites pass; watched play and ordinary returns are identical to before. Report: `handoff/to-design/FX2_COMPLETION_REPORT.md`.
- **Oct 10 (CB1 locked):** Sam: "CB1 is fine." §3 values decided as drafted; the §7 batch is `CURRENT_BATCH.md`.
- **Oct 10 (preview sync):** standing precondition run in the Claude Design TEST SAVE frame. Before: pre-H1 build, shim active, real keys 20, fingerprint 4286997365 (Design's own hash of non-`zitest__` keys, not Snippet B's scale). Oct 10 sync build copied in. After reload: `h1Build` and `fx1Build` true, shim active, real keys 20, fingerprint 4286997365 unchanged. Step 4 (1–2 min play, recheck) pending; real-game preview not opened yet.
- **Oct 10 (display fix, made by Design at Sam's request, Code to port):** in watched Wandering, the HP bar dropped by a whole fight's damage at once while the per-strike damage numbers replayed over ~2 s, so the numbers looked smaller than the HP lost. Engine totals were checked and are correct (strike numbers sum to the logged damage). `screens-v3.jsx`: a display-only `hpLag` lets the HP bar and readouts step down with each enemy strike; the engine's HP and `syncWanderState` still use the real value. Both HTML files' `screens-v3.jsx?v=` raised to 1791672000000. **Code: port these to the local project, or the next sync will overwrite them.**
- **Oct 10 (U27):** order of authority for low HP: the player's retreat setting decides withdrawal; Downed at 1 HP (U5) and the fixed resume gate (80% HP, stress < 50) override it.

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
| `CURRENT_BATCH.md` → `reference/archive/h1-batch.md` | TQ7 wording fixed (file list, step 2); correction note; status CLOSED; archived |
| `reference/archive/h1-acceptance-report.md` | **Filed** from Code's `H1_ACCEPTANCE_REPORT.md` |
| `reference/00-document-index.md` | Sim-harness row; Archived rows; decisions log; merged Oct 10 (below) |
| `reference/gameplay-fix-batches-proposal.md` | H1 row and TQ6–TQ8 heading marked closed/answered; C6 (U7), FX1/FX2 rows, U1 superseded by U5; merged Oct 10: FX2 locked, CB1 in the order |
| `reference/h1-findings-decisions-oct10.md` | "H1 remains NOT CLOSED" marked superseded (source text kept verbatim) |
| `reference/wandering-tab-spec.md` | Q1, Q2/U2, Q4, Q5, Q3 note; §13.8 HP floor paragraph rewritten for U5/U6; Batch 3B trigger note |
| `reference/r1-fx1-readiness-review.md` | **Filed** from Code's review (Oct 10) |
| `reference/fx1-hp-floor-slice.md` | **Filed**, locked Oct 10 |
| `reference/fx2-per-return-cap-slice.md` | **Filed**, locked Oct 10 with P1 and P2 |
| `reference/scenario-b-and-first-downed-oct10.md` | **New.** U8–U13 and F1–F3; partly superseded by the Elder Jester brief |
| `reference/elder-jester-concept.md` | **New.** U14 refined, U15–U24, J1, J6, J7 |
| `reference/starter-weapons-cb1-slice.md` | **New.** CB1: three new weapon fields, simulated starting values, draft batch |
| `CURRENT_BATCH.md` | **New:** FX1, locked |
| `DESIGN_HANDOFF.md` | This file (merged); morning version archived |

**Sync (Oct 10, approved by Sam):** root H1 `CURRENT_BATCH.md` preserved as `reference/archive/h1-batch-working-copy.md`; `H1_CLOSURE_FOR_CLAUDE_DESIGN.md` preserved in `reference/archive/`; morning handoff archived as `archive/design-handoff-oct10-am.md`. No file was deleted. `mystic-jester-concept.md` (retired) was not placed.

## 4. Open questions

- **FX1 (U1, U5):** U5 widens the trigger beyond Code's dry run, so V1 stops if checks 20 or 26 change. Resting from 1 HP instead of 0 shortens rest slightly (15.8 min instead of 16 to reach 80%). FX1 must check, never edit, checks 20 and 26.
- **FX2 (U2):** locked (P1, P2). The H1 suite's test 10b stays valid; test 10c's reading changes from 48 h to at most 24 h (authorized in the FX2 batch).
- **CB1:** locked, active. Note for later combat balance: accuracy, evasion and weapon speed are dead stats in early fights (hit chance is capped at 95%).
- **FX3 / FX4 candidates:** DH3 (XP decay has no floor clamp) and G1 (buffs pruned by the current clock).
- **R1:** still open; needs Code's `BATCH R1: CLOSED` report. Outstanding (review §2): check 31 browser check with fingerprint (may share FX1's browser session); Code's completion report; removing the 4 rows R1 activates from `PARKED.md`. R-f (the drain) is settled by FX1 (U7). The POI framework stays blocked until R1 is CLOSED and FX1 is CLOSED.
- **HP drain bug:** U7 (Sam): it is the DH1 defect and FX1 fixes it. Code's two-tab hypothesis is kept as a V3 observation in FX1; if HP still falls with an empty log after FX1, Code raises a Design Handoff.
- **Not yet folded in (intentional):** `tutorial-first-session-spec.md` (Jester starter kit, skip-forfeit, wake-up scene, starter pick, narrated finds) and `sim-harness-v1-brief.md` D11 (Scenario A = skipped, B = completed, per weapon). The Elder Jester and Scenario B records win on these topics until the tutorial batch and the H2 draft.
- **Owed before the Jester ships:** the quest med kit as a story item (U21); the Pocket Knife item (CB1). For the Fort path, the proposed answer to the missing med kit recipe is U21 + U23: the Jester hands skippers the quest med kit only (`[PROPOSED]`, elder-jester §7).
- **Jester session (later):** U24 details: how he keeps the player inside the story, his second appearance at the first Downed.
- **Housekeeping:** `reference/archive/H1_ACCEPTANCE_REPORT.md` and `h1-acceptance-report.md` are byte-identical duplicates (left as they are).
- **Archive folder:** handoffs live in root `archive/`; design records in `reference/archive/`.
- Carried from Oct 9, unchanged: audit §2 items A–E; Church and Workshop counts per grid; distance scaling; Code's four world-grid questions; confirm `r1-brief.md` belongs in `archive/`.

## 5. Next step: the fix train

Order, each a separate batch with its own closing line: **FX1** HP floor → **FX2** per-return cap → **CB1** starter weapons → **FX3** buffs on simulation time → **FX4** shared survivor attributes → **H2** (80 runs).

FX1 is active: step 1 investigation (TQ-FX1a–d) first, then Sam's approval before implementation. FX2 waits for `FX1 HP FLOOR: CLOSED`. CB1 waits for Sam's lock.
