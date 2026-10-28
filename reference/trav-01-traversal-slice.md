# TRAV-01 — Traversal page fixes (slice brief, draft)

**Status:** design complete Oct 21. **TRAV-01a LOCKED and issued Oct 21; step 1 done; revised Oct 21 (T14–T17)**; TRAV-01b proposed (§7). **CLOCK-01 moved to its own slice Oct 23: `clock-01-slice.md`** (CL1–CL8 decided). Collects Sam's Oct 21 Traversal playtest (PF5–PF9 in `playtest-findings-oct15.md`). Route building is its own concept (`route-01-route-builder-concept.md`).
**Date:** Oct 21

## 1. Next slice

Make every Traversal action honest: each button has a clear effect, a limit, and a visible result. Solo players stop seeing Camp Leader controls.

**Why now:** these are the first buttons a new player presses. One is an XP exploit (Scout), one does nothing (Hide), and a whole section does nothing in Solo.

## 2. Decided constraints

| # | Rule | Source |
|---|---|---|
| T1 | **Scout charges: 5 to 10 per day.** Each Traversal scout spends one. Starting value 5; 10 is tested against it | `[DECIDED Oct 21]` Sam (PF5). Limits the Stealth XP a day can give |
| T2 | **Hide reveals what's lurking.** Hiding in a cell shows how many zombies are there and which kinds, and points to their Codex entries, so the player can scout further | `[DECIDED Oct 21]` Sam (PF8) |
| T3 | ~~**Clock shows Year and Day only.**~~ **Superseded Oct 23 by CL2 (`clock-01-slice.md`):** the clock shows "Year X, Day Y, Time". Days still run 1–364; day 365 starts the next year at Day 1 | `[DECIDED Oct 21]` Sam (PF7); time of day added `[DECIDED Oct 23]` |
| T4 | **Afflictions show on Traversal** (injury time left, curse, Broken, hunger), in the place of the current "available survivors" section | `[DECIDED Oct 21]` Sam (PF7) |
| T5 | **Remove the Camp Leader section in Solo:** the available-survivors list and the Scavenge, Contracts, Training, Patrol and Raid buttons | `[DECIDED Oct 21]` Sam. They do nothing in Solo and belong to Camp Leader |
| T6 | **Familiarity makes a cell safer and richer.** Each step (unexplored → explored → cleared) raises loot safety and loot amount and improves camp rest there. Scouting moves a cell from unexplored to explored. The tutorial explains it | `[DECIDED Oct 21]` Sam (PF9) |
| T7 | ~~Looted cells regrow loot.~~ **Corrected Oct 21 (Sam): looted cells do not regrow.** Loot stays once per cell | `[DECIDED Oct 21]` Sam |
| T8 | **Game clock: 1 game hour = 1 real minute.** A game day lasts 24 real minutes; a 364-day year about 6 real days (today: 1 game hour = 6 real seconds) | `[DECIDED Oct 21]` Sam |
| T10 | **The curse lasts 3 real days, and scout charges refill once per real day,** both resetting at the player's local midnight, like the deliberate Rest | `[DECIDED Oct 21]` Sam (P4a) |
| T9 | **Durations keep their real length.** Crafting, the Jester's stay and the other systems timed in game time are rescaled so they don't become 10× slower | `[DECIDED Oct 21]` Sam ("speed up crafting, the Jester's stay, and much more") |

| T14 | **Travel XP limited** to once per cell per real day, like Scout and Hide | `[DECIDED Oct 21]` Sam (after step 1) |
| T15 | **Make camp is not a free, unlimited full heal.** In TRAV-01a it stops healing and its Command XP is once per real day; camp's real benefit comes in TRAV-01b (T12). **Extended Oct 23 (CL4–CL5):** Make camp moves the clock to 06:00 the following game morning (replaces the 24-game-hour skip) and is available once per real day, reset at local midnight | `[DECIDED Oct 21]` Sam; `[DECIDED Oct 23]` CL4–CL5 |
| T16 | **Deploy is disabled with its reason** when it can't run | `[DECIDED Oct 21]` Sam |
| T17 | **Step-1 answers accepted (S1–S7):** separate Traversal scout pool (5/real day, Wandering unchanged); Hide shows only what Wandering uses (threat level and tier range) until cells own their zombies; Codex unlocks decided later; XP limits per **real** day; injury labelled "play time left"; tutorial last step points at Wandering and Solo reloads open on Traversal; Dispatch, "Assigned" and "Expected yield" removed in Solo | `[DECIDED Oct 21]` Sam |
| T13 | **Zone details panel (§3a) approved**, including select-not-hover and the Route mode toggle | `[DECIDED Oct 21]` Sam |
| T11 | **Proposals P1–P7 accepted** (below) | `[DECIDED Oct 21]` Sam |
| T12 | **Making camp speeds up checkpoint rest (PF4):** resting at the camp cell recovers stress at the Cot rate (30 a day instead of 20); camp rest uses camp food; the bonus applies only at the camp cell and only for rest the gate requires; the injury still needs its cure; camp rest is its own stress-relief source | `[DECIDED Oct 21]` Sam |
| ~~T18~~ | ~~**Travel costs stamina**~~ **Superseded Oct 26 (Sam): dropped.** TRAV-02 is the only travel limit (no stamina meter, FOOD-01 ST1). Original: (stops daily walk-everything XP farming). Solo survivor gets a stamina pool; starting values `[PROPOSED]`: max 100 (+1 per Athletics level), 5 per cell, regen 10 per real hour, full on Make camp. Details in `DESIGN_HANDOFF.md` | `[DECIDED Oct 22]` Sam (concept) |
| T19 | **Drifts** `[CONCEPT]` give Scout a lasting effect: zombie groups cross a row or column from a grid edge; Scout reveals drifts in its row and column; Scout XP only for a newly revealed drift. Waits on the tier-band batch and CLOCK-01 | `[CONCEPT Oct 22]` Sam |

## 2a. TRAV-02 daily movement cap and Camp Leader assignment (Oct 26)

| # | Rule | Tag | Why |
|---|---|---|---|
| TRAV-02 | **Square-by-square Traversal movement is capped per real day by transport,** using ROUTE-01 R3: foot 2, bike 3, electric bike 5, vehicle 8+ (starting value). Resets each real day at local midnight, like scout charges (T1) | `[DECIDED Oct 26]` | Limits travel per day by transport |
| TRAV-02a | **Tutorial exemption:** uncapped until Fallow Ground is turned in | `[DECIDED Oct 26]` | The first Fort is 2–3 squares away; the first session must reach it, clear Fallow and return in 20–30 minutes |
| TRAV-02b | **Forced retreat, Run Back and other emergency withdrawals never count** against the cap. Circuit travel is separate from the direct-movement cap and follows its own rules (C1–C22) | `[DECIDED Oct 26, PM; circuit separation Oct 28]` | A spent cap must never strand the survivor (no dead ends); circuit pacing uses its own timing and stop rules |
| TRAV-02c | **Footwear (on foot only):** sneakers +1 square a day, light, wear out fast; military boots no extra squares, but camps made while wearing them recover stress at the Bunk rate (40 a day) instead of the Cot rate (T12), and last much longer; barefoot or worn-out footwear −1 square a day. Bikes and vehicles ignore footwear | `[DECIDED Oct 26]`; values `[PROPOSED]` | Gear shapes the day without a second meter; reuses the Boots slot, durability and camp rest rates |
| TRAV-02d | **Stacking and floor:** season modifiers (SEASON-01: summer +1, winter −1) stack with footwear; the daily cap never falls below **1 square** | `[DECIDED Oct 26]` | No dead ends |
| TRAV-02e | **Thrown out of a Concordance POI** (discovered in disguise): the survivor is placed on an adjacent passable, unlocked square, chosen deterministically from the seed `[PROPOSED]`. This move **never counts** against the cap, like TRAV-02b (`concordance-introduction-concept.md` CI22) | `[DECIDED Oct 26, Sam]` (Addenda 11c, 11d) | No dead ends |
| CL-assign | **Camp Leader assignment:** select an available survivor, then click a Traversal cell to assign that survivor's job there. T5 unchanged: the section stays hidden in Solo | `[CONCEPT Oct 26]` | Micromanage what each survivor does for the camp |

**Resolved Oct 26 (evening):** T18 dropped; TRAV-02 is the only travel limit.

## 3. Proposed details (P1–P7 accepted Oct 21, T11)

| # | Detail | Why |
|---|---|---|
| P1 | Stealth XP from a scout is granted once per cell per **real** day (corrected Oct 21, S4); a scout with no charges left is greyed with the reason | Charges cap the day; the per-cell rule stops farming one cell |
| P2 | **Deferred Oct 21 (S2) to the tier-band batch.** **Hide and the Codex:** Hide marks an entry as **sighted** (name, tier, danger label). Full stats still unlock only when that zombie is fought | Keeps the decided Codex rule (unlock by fighting) while giving Hide real value |
| P3 | Hide costs time and trains Stealth once per cell per **real** day (corrected Oct 21, S4). ~~Short time (1 game hour)~~ **Superseded Oct 23 by CL3:** Hide advances the clock 12 game hours, repeatable up to **2 per real day** (`[DECIDED Oct 24]`, `clock-01-slice.md` O1) | Same farming guard as Scout |
| P4 | **Rescale rule for T9:** every duration stored in game time is divided by 10 so its real length stays the same, unless Sam picks a different length for it. Code lists every game-clock reader with today's real duration so Sam can review exceptions | One rule, not a hand-tuned list; nothing silently becomes 10× slower |
| P4a | ~~Proposal~~ **Decided Oct 21 as T10.** **Clock check for afflictions:** the curse's "3 days" and the scout-charge "per day" must name their clock. Recommended: the curse runs **3 real days** (as simulated in round 8); scout charges refill per **real day** at local midnight, like the deliberate Rest | Under the new clock, 3 game days is only 72 real minutes (7.2 minutes on today’s clock); the simulations assumed 3 real days |
| P5 | Real-time timers (injury, deliberate Rest, curse days) are labelled as real time beside the affliction icon | Two clocks only make sense when each says which it is |
| P6 | ~~Regrowth.~~ Withdrawn Oct 21 (T7). Instead: familiarity raises the safety and amount of the cell's **one** loot, so scouting and clearing a cell **before** looting it pays off | Patience becomes the reward; no regrowth needed |
| P7 | Familiarity steps in the data table: unexplored → explored +10 loot safety, explored → cleared +10 more and +25% loot amount (starting values) | Readable numbers; tuned in playtesting |

## 4. Open

- `[OPEN]` `[CODE]` What Traversal Scout, Hide, Loot and Make camp do today (PF4–PF6), and where "61% safe" comes from.
- `[OPEN]` `[CODE]` Why Loot opens Routes (PF6).
- `[OPEN]` `[CODE]` Every system that reads the game clock, with its real duration today (for T9).
- `[CONCEPT Oct 22]` PF13 Traversal pushback (noise and reaction by zombie traits). Designed with TRAV-01b after the tier-band batch. See playtest-findings PF13.

## 3a. Zone details panel `[DECIDED Oct 21]` (T13)

**Interaction: select, don't hover.** The same panel on every platform, opened by selecting a cell.

| Input | Quick look | Full panel |
|---|---|---|
| Mouse (Steam) | Hover shows a one-line preview (name, familiarity, danger) | Click opens the full panel beside the map |
| Touch (phone) | — | Tap opens the full panel as a sheet from the bottom of the screen; tap elsewhere or swipe down closes it |
| Controller (Steam Deck) | Moving the highlight shows the one-line preview | Confirm opens the full panel |

*Why:* hover can only ever be a shortcut, because phones and controllers don't have it. Anything a player needs must be reachable by selecting.

**Route mode:** while building a route (ROUTE-01), a tap adds the cell to the route instead of opening the panel. A visible "Route mode" toggle switches between the two, so the same tap never means two things at once.

**Panel contents:**

| Line | Shows |
|---|---|
| Familiarity | Unexplored / Explored / Cleared |
| Loot | Safety % and size, or "Looted" |
| Danger | The cell's threat level, plus any curse modifier |
| Threats | Hide's threat level and tier range (zombie kinds and Codex links come with the tier-band batch) |
| Features | Water, Fort, Church, Workshop, camp |
| On a route | Whether the cell is in the current route |
| Actions | Scout, Hide, Loot, Make camp, each with its charge cost or the reason it's greyed out |

## 5. Parked / out

- Route building (`route-01-route-builder-concept.md`).
- Camp Leader controls (return when Camp Leader is built).

## 6. Spec impact

- Tutorial spec Beat 1 (Traversal steps): add the familiarity step; retire any Camp Leader buttons from Solo text.
- `wandering-tab-spec.md` §13.3 (scout charges per day), §13.8 (familiarity).

## 7. Proposed batches — draft `CURRENT_BATCH.md` contracts

**Why three batches, not one:** one batch per contract (design rules §7). The clock change touches every timed system, so it must not share a batch with screen fixes; and the familiarity rules change balance, so they get their own test pass.

| Batch | Contents | Depends on |
|---|---|---|
| **TRAV-01a — Honest buttons** | T1/T10 scout charges, P1 XP limit, T2/P2/P3 Hide, T4 afflictions on Traversal, T5 remove Camp Leader section, PF6 loot no longer opens Routes, T13 zone panel | Code step 1 |
| **TRAV-01b — Familiarity and camp** | T6/T7/P6/P7 familiarity effects on the one loot, T12 camp rest at the Cot rate using camp food | TRAV-01a; FOOD-01 (camp food) |
| **CLOCK-01 — Slower clock** | **Moved Oct 23 to `clock-01-slice.md`:** CL1–CL8 (continuous clock, Year/Day/Time, Hide 12 h with cap, Make camp to 06:00 once per real day, 24 real-hour offline cap, equivalence test), plus T8, T9/P4, P5 | Code's timer survey (`reports/clock-01/`); O1–O6 `[DECIDED Oct 24]`; issued as `CURRENT_BATCH.md` Oct 24 |

### BATCH TRAV-01a — Honest buttons (draft)

**Goal.** Every Traversal action has a clear effect, a limit and a visible result. Solo players see no Camp Leader controls.

**Decided behavior** (all `[DECIDED Oct 21]`): T1, T2, T4, T5, T10, T11 (P1–P3), T13.

**Likely files.** Traversal screen (`screens-v3.jsx`), Traversal actions and world-cell state, Codex data (sighted flag), save keys for charges and sighted entries, new `tests/trav-01a.test.js`, `CODE_STATE.md`.

**Step 1 (read-only).** Answer the TRAV-01 §4 questions with file:line: what Scout, Hide, Loot and Make camp do today; where "61% safe" comes from; why Loot opens Routes. **Stop and report** if any answer changes the plan.

**Acceptance checks**
1. A new real day gives 5 scout charges (data-table value); each Traversal scout spends 1; at 0 the button is greyed with the reason.
2. Scouting the same cell twice in one day grants Stealth XP once.
3. Charges refill at the player's local midnight, online and offline.
4. Hide on a cell lists the zombie count and kinds; each kind is marked **sighted** in the Codex (name, tier, danger), and full stats stay locked until fought.
5. Hide grants Stealth XP once per cell per day.
6. In Solo, the available-survivors list and the Scavenge, Contracts, Training, Patrol and Raid buttons are absent.
7. The afflictions area shows each active affliction with its icon and, for real-time ones, time left labelled as real time.
8. Loot shows its result on Traversal and does not open Routes.
9. Selecting a cell opens the zone panel: click on Steam, tap (bottom sheet) on phone, confirm on controller. Hover shows only the one-line preview.
10. In Route mode a tap adds a cell to the route; outside it, a tap opens the panel.
11. **Regression:** all suites pass; existing saves load with charges initialised.

**Smoke test (Sam, TEST SAVE):** scout one cell until charges run out; hide in a cell and open the Codex; check Traversal in Solo has no Camp Leader section; loot a cell and stay on Traversal; open the zone panel by click and (if possible) on a phone.

**Explicitly out.** Familiarity effects and camp rest (TRAV-01b), the clock change (CLOCK-01), the route builder itself (ROUTE-01), Camp Leader controls.

**Required verification.** Completion report with each check's result; `TRAV-01a: CLOSED` or `NOT CLOSED`.

