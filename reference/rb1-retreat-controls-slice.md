# Zed Idler — RB1 Retreat Controls (Slice Brief)

**Status:** **CLOSED Oct 13** (`RB1 RETREAT CONTROLS: CLOSED`; `handoff/to-design/RB1_COMPLETION_REPORT.md`; batch archived as `archive/rb1-batch.md`). Locked by Sam Oct 13 with Claude Design's recommendations (RB1c, RB1d).
**Inputs:** Sam's finding (Oct 13 browser check: two "go back" buttons) · R1 retreat rules (`RETREAT_RULES_TABLE`, `wanderRetreatPress`, `wanderWithdraw`) · the code read Oct 13 (`screens-v3.jsx` 655–667 and ~2050–2075; `game/active.js` 565–632, 787–797; `game/wandering.js` 77–80).
**Tags:** `[DECIDED]` Sam · `[PROPOSED]` draft · `[OPEN]` needs a decision · `[CODE]` current build

---

## 1. Next slice

The Wandering screen has two ways back to the last checkpoint. They behave differently, and only one follows the rules. Make **Retreat** the automatic policy, shown in the main bar, and make **Run Back** the player's own manual control, running through the same rules.

*Why now:* small, and it removes a free escape that only works while watching. That's the same watched-vs-offline gap FX4 closed, and H2's numbers assume one set of retreat rules.

---

## 2. Decided direction (Sam, Oct 13)

| ID | Rule | Why |
|---|---|---|
| **RB1a** `[DECIDED Oct 13]` | **Run Back stays, as the player's manual control, and walks back like a retreat today:** travel time, stress, one getaway roll, then rest at the checkpoint until the resume gate. It no longer teleports or clears the fight | One set of rules for going back. Watched and offline play match, and there is no free escape |
| ~~**RB1b**~~ **superseded by RB2 (Oct 13)** `[DECIDED Oct 13]` | **Retreat becomes the policy control in the main bar**, merged with today's "Retreat Rules ▸" button: it shows the current rule and opens the rules to change it | Retreat is something the policy does on its own; the foreground shows what it will do. One button instead of two |
| **RB1c** `[DECIDED Oct 13]` | **The distance bar is display only.** Clicking a checkpoint no longer moves the survivor (found in step 1: a second free teleport, forward or back, not in any design doc) | Run Back is the one manual way back; no free travel |
| **RB1d** `[DECIDED Oct 13]` | **Run Back keeps the saved pace** (no reset to Walk) | The reset was a leftover of the teleport and would slow the escape |

---

## 3. What the code does today `[CODE]`

| | ↩ Retreat (main bar) | ⏪ Run Back (More actions) | ⚙ Retreat Rules ▸ (main bar) |
|---|---|---|---|
| What it does | `wanderRetreatPress` → `wanderWithdraw`: walks back to the last checkpoint through the simulation, one getaway roll; a second press during the walk rolls the getaway | Sets the position straight to the last checkpoint (`setWanderScroll`), clears the current encounter, resets pace to Walk. No time, stress, risk or rest | Opens the R1 rules panel: HP floor (default 30%), stress ceiling (85), load limit (115%). When a rule is true, the survivor withdraws on their own |
| Works offline | Yes (shared rules) | **No** (screen only) | Yes (shared rules) |

---

## 4. The change `[PROPOSED]`

1. **Run Back** calls the same withdrawal Retreat calls today (`wanderRetreatPress`). Its label shows progress while walking (today's "↩ Withdrawing 120m" text). The getaway roll happens once per withdrawal, on the first press; a second press reports it was already tried (unchanged R1 rule; corrected Oct 13). It stays in **More actions** (Sam: "remains").
2. **Run Back no longer resets the pace to Walk** (RB1d, decided). The walk back uses the saved pace (FX4), so a Run pace gets you back faster. *Why:* resetting the pace is a leftover of the teleport and would slow the escape for no reason.
3. **The main-bar Retreat button** shows the active rule in a short form, for example `↩ Auto-retreat: HP 30% · Stress 85` (rules switched off are left out), and opens the R1 rules panel. While the survivor is withdrawing, it shows `↩ Withdrawing 120m` (the policy is acting). The separate "⚙ Retreat Rules ▸" button is removed. `[PROPOSED]` wording.
4. `setWanderScroll` stays in the code. **Step 1 (Oct 13):** its only callers were Run Back and the distance bar's checkpoint jump (`jumpTo`). Both stop calling it (RB1a, RB1c).
5. Unchanged: the R1 rules, their numbers and ranges, the getaway roll, rest and the resume gate, the HOLD prompt.

### 4.1 Declared differences
- Run Back now costs travel time, stress and a getaway roll, then rest, instead of an instant, free teleport. While walking back, encounters can still happen as in any retreat.
- The pace no longer resets to Walk on Run Back.
- The main bar has one retreat button (the policy control) instead of two.
- Checkpoints on the distance bar are markers only; clicking them does nothing (RB1c).

---

## 5. Parked and out
Changing R1's rules or numbers · a manual "go to Base" action · Run Back destinations other than the last checkpoint · the More actions menu layout · R1 closure items (check 31, PARKED.md clean-up).

---

## 6. Proposed batch — draft `CURRENT_BATCH.md`

### BATCH RB1 — Retreat controls

**Goal.** Run Back is the player's manual withdrawal under the shared retreat rules; the main-bar Retreat button is the retreat-policy control. No rule or number changes.

**Decided behavior** (`[DECIDED Oct 13]`, RB1a–RB1d)
1. Run Back performs the same withdrawal as today's Retreat press (walk to the last checkpoint, getaway roll, rest until the resume gate); it never teleports or clears an encounter.
2. The main-bar Retreat button shows the active retreat rule and opens the rules panel; the separate Retreat Rules button is removed.
3. Run Back keeps the saved pace (RB1d).
4. The distance bar is display only; checkpoints can't be clicked to travel (RB1c).

**Likely files.** `screens-v3.jsx` (the two buttons) · both HTML files (cache-buster) · new `tests/rb1-retreat-controls.test.js` · `CODE_STATE.md`. No `game/` file is expected to change.

**Steps.** 0 baseline · 1 done Oct 13 (callers: Run Back and the bar jump; Sam decided RB1c) · 2 implement · 3 tests, regression, browser check.

**Acceptance checks**
1. Static: Run Back's handler calls the shared withdrawal and no longer calls `setWanderScroll` or clears the encounter.
2. A Run Back press gives the same run state as a Retreat press did before (same seed): position, stress, getaway roll, rest.
3. A second Run Back press during the walk does not start a second withdrawal (one getaway roll per withdrawal, as before).
4. Pace is unchanged after Run Back.
5. The main-bar button text matches the current rules (each rule on/off and value), and shows withdrawal progress while withdrawing.
6. Static: only one retreat button remains in the main bar.
6b. Static: the distance bar's checkpoints have no click handler, and no screen code calls `setWanderScroll`.
7. Browser check (TEST SAVE): Run Back walks back with the distance counting down and rests at the checkpoint; the Retreat button opens the rules; fingerprint unchanged.

**Explicitly out.** §5.

**Required verification.** All suites; new suite; r1 ×20 frozen (checks unedited); differential (no gameplay change except Run Back); browser check. **Closing line:** `RB1 RETREAT CONTROLS: CLOSED` / `NOT CLOSED`.

---

## 7. Patterns used (for Sam)
- **One path per action.** Two buttons may exist, but they should call the same rule. The UI decides what the player sees; the rules decide what happens.
- **Policy vs. command.** Retreat is now a *policy* (the game acts on rules you set). Run Back is a *command* (you act now). Idle games need both: policies for when you're away, commands for when you're watching.

---

## 8. RB2 — Retreat layout (Sam, Oct 13) `[DECIDED Oct 13]` — **CLOSED Oct 13** (`RB2 RETREAT LAYOUT: CLOSED`; `handoff/to-design/RB2_COMPLETION_REPORT.md`)

Sam reviewed RB1 in the browser and changed the layout:

| ID | Rule | Why |
|---|---|---|
| **RB2a** | **Run Back (More actions) is the only retreat control.** No retreat button in the main bar | One control for the player; the automatic retreat needs no button |
| **RB2b** | **The automatic retreat runs in the background** with the stored rules (HP 30%, stress 85, load 115% on every new save) | It's a policy, not a control |
| **RB2c** | **Under "Resting at the checkpoint" / "Resting at Base", the scene shows the limits:** `Retreats at HP 30% · stress 85 · load 115%` (a rule switched off is left out; all off reads "Automatic retreat is off") | The player sees the cap that pulled the survivor back, where it matters |
| **RB2d** | **The retreat-rules editor is parked** for the shop later (`reference/parked/retreat-rules-shop.md`). No rules panel on the screen | Changing the limits becomes a purchasable option; until then everyone uses the defaults |

Supersedes RB1b (the main-bar policy control). Saves that changed their rules before RB2 keep their values (no migration); they just can't change them on this screen.

**Batch RB2 (locked Oct 13).** Files: `screens-v3.jsx`, HTML cache-busters, new `tests/rb2-retreat-layout.test.js` (4 checks), authorized rewrite of RB1 checks 5 and 6. Checks: no retreat button in the main bar; Run Back is the only call to the shared withdrawal; no rules editor; the resting line follows the rules; the automatic retreat still fires at the stored limits; headless browser check; Sam's fingerprint check. Closing line: `RB2 RETREAT LAYOUT: CLOSED` / `NOT CLOSED`.

