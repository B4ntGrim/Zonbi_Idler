# Zed Idler — Design Handoff (Oct 10, session 2)

**Read first:** `CLAUDE_DESIGN_RULES.md`, then this file, then `reference/00-document-index.md`.
**Replaces:** the morning Oct 10 handoff, archived as `archive/design-handoff-oct10-am.md`. When the next handoff is written, move this one to `archive/`.
**No `CURRENT_BATCH.md` at the project root yet.** The FX1 batch is drafted in `reference/fx1-hp-floor-slice.md` §7. It becomes `CURRENT_BATCH.md` only after Sam locks it.

---

## 1. Decisions made

- **Oct 10 (U5):** reaching 1 HP from **any** damage source (fights, policy hits, failed ventures, any other path) triggers Downed: heal, then revive, then Forced Retreat. Damage beyond the floor is absorbed. Supersedes U1's trigger wording ("0 or below"); a hit that leaves exactly 1 HP now Downs too.
- **Oct 10 (U6):** the log shows the full damage of the hit that Downs the survivor.
- **Oct 10 (U7):** the HP drain bug is the HP-below-1-on-Downed defect (Sam's reclassification of his Oct 8 report). Folded into FX1; R1 item R-f is settled by FX1. Code's two-tab follower hypothesis is kept only as an observation in FX1's browser check.
- **Oct 10 (U8):** Scenario B is **the prepared survivor**: belt pouch + padded jacket + a board with nails. It tests whether preparing pays off (A vs B). Supersedes U4's pouch-only fixture.
- **Oct 10 (U9, `[CONCEPT]`):** the "hard at first" message is delivered at the first Downed: in place on the Wandering screen, or by a full-screen splash that leads into the last Wandering tutorial steps. Details `[PROPOSED]`.
- **Oct 10 (U12, U13):** the first Downed keeps the whole haul (tutorial Q4); the first-Downed splash shows even when the tutorial was skipped.
- **Oct 10 (U11, U14, `[CONCEPT]`):** first-session Wandering narrates scripted finds that point to other tabs; skipping the tutorial forfeits its items. U14 would reverse tutorial §3.2's `[DECIDED Oct 1]` grant at save creation once its details are locked.
- **Oct 10, code read (F1–F3):** the starter kit is granted to the stash **unequipped**, with **no weapon and no food** (explains Scenario A's 15 kg). The Spike Board (Armory) and Nail Bat already exist; no pocket knife. No recipes for the padded jacket, belt pouch or **med kit** (med kit only from the Shop at 1,500 distance or a faction contract).
- **Oct 10 (U14 refined, U15–U19):** the Elder Jester `[CONCEPT]` is a tutorial companion who stays afterwards. The starter kit comes only from the Jester (old dirty padded jacket, weapon, food, med kit) with a quest to take the med kit to the Fort. Starter weapon pick: Nail Bat, Iron Knuckles or Pocket Knife (closes U10). The tutorial ends at the Fort's approach. Skipping is allowed with the warning "You will not have access to an early, easy start." U11 + U14 are one system; H2 A = skipped, B = completed tutorial. Supersedes U8's loadout and tutorial §3.2/Beat 5 (`elder-jester-concept.md`).
- **Oct 10 (J1, U20–U24):** the character is **the Elder Jester**. Starter weapon identities locked (numbers proposed in CB1). The first med kit is a **locked quest item**, delivery only (U21). The pouch and scout kit also come from the Jester (U22). Skippers meet the Jester later without the kit (U23). The Jester is a story guardrail, not a rescuer (U24 `[CONCEPT]`, later session). H2 runs Scenario B once per starter weapon.
- **Oct 10 (J6, J7):** the Elder Jester is first met in a wake-up scene at his camp (blurred vision clearing) after the survivor is Downed; the first in-game Downed is his second appearance. H2 runs 80 runs; its other details are settled when H2 is drafted.
- **Oct 10 (FX2):** locked with P1 (no saved `_discardedMs`; tests compute discarded time) and P2 (check 4 interrupts with a save → load round-trip). Starts only after `FX1 HP FLOOR: CLOSED`.
- Earlier today (unchanged): U1–U4; H1 CLOSED; Q1, Q2, Q4, Q5, Q6 decided; Q3 pending verification.

## 2. Standing precondition (H1 acceptance report §13)

Unchanged. Before the real-game preview runs any H1-or-later build: record the real-save fingerprint in the TEST SAVE frame (Snippet B); sync the files without opening the real-game preview; confirm `h1Build: true` and `shimActive: true` (Snippet A); confirm the fingerprint, play 1–2 minutes, confirm again; only then open the real-game preview.

## 3. Files changed (session 2)

| File | Change |
|---|---|
| `reference/fx1-hp-floor-slice.md` | **New.** FX1 slice: U5–U7, Code's open facts TQ-FX1a–d, spec impact, draft batch |
| `reference/fx2-per-return-cap-slice.md` | **New.** FX2: the leak (cap on new time only), the clamp, 8 checks, draft batch |
| `reference/starter-weapons-cb1-slice.md` | **New.** CB1: three new weapon fields, simulated starting values, draft batch |
| `reference/elder-jester-concept.md` | **New** (replaces `mystic-jester-concept.md`, deleted). U14 refined, U15–U19, revised first session, starter weapon identities, H2 under U19, J1–J5 |
| `reference/scenario-b-and-first-downed-oct10.md` | **New**, then partly superseded by the Jester brief. U8, U9, facts F1–F3, tutorial fold plan |
| `reference/00-document-index.md` | Scenario B record row; FX1 slice row; POI framework blocking condition; decisions log |
| `DESIGN_HANDOFF.md` | This file; morning version archived |

**Deliberately not edited yet:**
- `wandering-tab-spec.md` §13.8 still says Downed triggers at "0 or below". The replacement text is in the slice brief §6 and is folded in when FX1 closes (rules §2). Until then the slice brief wins on Downed.
- `gameplay-fix-batches-proposal.md` FX1 section: superseded by the slice brief; the index records this.
- `sim-harness-v1-brief.md` D11 and `tutorial-first-session-spec.md`: the decision record supersedes them on these topics; folded in when H2 is drafted and in the next tutorial batch.
- `r1-fx1-readiness-review.md` is Code's evidence record and is left as filed. U7 supersedes its §3 conclusion that the drain is a separate defect.

**Master copy (Oct 10):** Claude Design's workspace is the master for `reference/`, the spec, the index, `DESIGN_HANDOFF.md` and `CURRENT_BATCH.md`. This advisory chat develops concepts and briefs and hands them over through `handoff/from-design/`; it does not overwrite Claude Design's versions. Export 3 (seven files) must be applied to `E:\Zed_Idler`; its `CURRENT_BATCH.md` replaces the old H1 copy at the root.
**Sync note:** `E:\Zed_Idler` is now linked (read-only use so far). The files above are in the claude.ai Project; they are also placed in `handoff/from-design/` for Code to compare before applying.

## 4. Open questions

- **Sam:** lock the FX1 batch (slice brief §7).
- **Code (FX1 step 1):** TQ-FX1a–d: every HP-lowering path; reusing the Downed handling from non-fight paths; HP loss during retreat or rest; whether the screen getaway is a gameplay write.
- **Scenario B:** redefined by U19 as "completed the tutorial". **Sam:** run B per starter weapon (80 runs) or Nail Bat only (40)? Code confirms the F1–F3 reading in its next report. The payoff threshold is set from the first report. Re-measure A vs B after FX1 (U5 changes the HP side).
- **Sam: J1–J5** (`elder-jester-concept.md` §7): the name; pouch and scout kit source; skippers meet the Jester later; the med kit dead end (recipe recommended); what "help in times of need" means.
- **Balance (combat decision, outside H2):** the Nail Bat (18 dmg) is strictly worse than Iron Knuckles (20 dmg, +3 speed, stagger). The three starters need distinct identities (brief §4).
- **Blocking U14 and tutorial Beat 6:** a first-session med kit recipe does not exist. Owed to the crafting/tutorial batch.
- **Sam (U9):** remaining splash details (wording, past-tense return version) stay `[PROPOSED]` until the tutorial batch.
- **R1:** still open. Needs check 31 (can share FX1's browser session), Code's `BATCH R1: CLOSED` report and the `PARKED.md` cleanup. R-f is now settled by FX1.
- **POI framework:** blocked until R1 is CLOSED and FX1 is CLOSED (the drain is now FX1).
- Carried, unchanged: FX2 notes (test 10c reading drops to ≤ 24 h); FX3/FX4 candidates DH3 and G1; archive folder split (root `archive/` for handoffs, `reference/archive/` for design records); audit §2 items A–E; Church and Workshop counts per grid; distance scaling; Code's four world-grid questions; confirm `r1-brief.md` belongs in `archive/`.

## 5. Next step: the fix train

Sam wants bug fixing to run without him in the loop. Proposed order, each a separate batch with its own closing line:

**FX1** HP floor → **FX2** per-return cap → **CB1** starter weapons → **FX3** buffs on simulation time → **FX4** shared survivor attributes → **H2** (simulation matrix).

- **FX1 locked by Sam and set as `CURRENT_BATCH.md` by Claude Design (Oct 10, export 3).** FX2 is `[PROPOSED]`: P1 (drop the `_discardedMs` saved field) and P2 (save → load round-trip in check 4) to settle, then Sam locks it; it starts only after `FX1 HP FLOOR: CLOSED`. CB1 is drafted and awaits Sam's lock. Before FX1 starts, the old H1 `CURRENT_BATCH.md` at the root of `E:\Zed_Idler` must be archived (Code's review §1). FX2–FX4 rules are already `[DECIDED Oct 10]` (Q2/U2, Q4, Q5), so Claude Design drafts each batch when the one before closes.
- **Standing approval (if Sam grants it):** a drafted batch whose rules are all `[DECIDED]` goes to Code without a separate lock. Code runs it and reports the closing line. **Only stop conditions reach Sam:** a new design question, a change to balance outside the declared differences, a save-version change, or a test edit not authorized in the batch.
- Sam's role becomes: send a concept → Claude Design develops it into files → the files go to `handoff/from-design/` → Code builds.
