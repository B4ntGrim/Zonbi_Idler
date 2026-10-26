# Slice: Early-game balance (BALANCE-03 outcome). Batch A draft: Walk home and Broken

**Status:** LOCKED Oct 19; **implementation authorized Oct 19** after the Step-1 report (§3a). Originally DRAFT (Oct 19). Sam's answers to O1–O5 are recorded below (Oct 19, evening). O6–O8 answered the same evening. H2 closed (Sam, Oct 19). O7 starting values accepted. O9 recommendations recorded. **O9 (b)–(c) and the batch placement confirmed by Sam. BAL-A LOCKED Oct 19** and placed in `CURRENT_BATCH.md`. No production code, UI or save changed.
**Source:** BALANCE-03 reports, Oct 17–19 (Claude project), ending with `balance-03-confirmation-oct19.md`.
**Decisions:** index decisions log, Oct 18–19.

## 1. Next slice
BALANCE-03 found three things:
- **Stress** walled the survivor into bed for about 21 hours a day.
- **Roadside policy events** caused about 93% of the remaining Downings, mostly on the walk home after an HP retreat.
- With the decided fixes, the early game lands at **about 1–3 Downings a day (0.01–0.03 per km)** with **about 54–61% field time**.

The slice turns those results into rules, in **three batches** (Sam, Oct 19):

**Batch B note:** the Long Blade's Wood cost blocks its repairs (confirmation report §3.2). The recommendation is a Metal-only recipe (about 50 Metal).

| Batch | Content | Why this order |
|---|---|---|
| **A: Walk home and Broken** (this draft) | Rule 5 covers policy events; slow pursuers; groups met by standing; the Broken state replaces the Breaking Forced Retreat; resume after a Forced Retreat; status icons, log lines, return-report lines | Everything else is tuned on top of these rules |
| B: Supplies and gear | Deliberate Rest (O9) with the 8% injury cure roll; Medkit rules and recipe, stacking 3 per pocket, survivor repairs, the Improvised Long Blade, +2 max HP every 3 levels, solo Scavenging at 4× | Needs A's baseline |
| C: Jester and timing | First camp 3–5 real days with a hidden 1.5× recovery perk; later camps 3–5 real hours (the injury moved to Batch A, O5) | Clock fixes; independent of B |

## 2. Decided constraints (Batch A)
| # | Rule | Source | Why |
|---|---|---|---|
| A1 | **Once a withdrawal starts, no new zombie encounters and no roadside policy events** until the survivor arrives and rests (rule 5) | `[DECIDED Oct 18]` rule 5; `[DECIDED Oct 19]` scope includes policy events | A retreat should mean "getting out". The walk home caused 92–94% of Downings |
| A2 | **Slow pursuers** (Crawler-type) can still meet a withdrawing survivor: low accuracy, small hits, an easy escape, rare. A small but real Downing chance | `[DECIDED Oct 19]` (values below are starting values) | Keeps the walk home tense without it being the deadliest part of a trip |
| A3 | **Groups met on the walk home react by standing.** Friendly groups escort (the walk is faster; no pursuers after). Neutral groups pass by. Hostile groups mock the survivor, may injure it, steal its haul **if it is already Broken**, then leave it Broken and send it home to rest. A hostile send-home is **not** a Downing. Groups stay unnamed until the Fort hand-in; standing still applies | `[DECIDED Oct 19]` (thresholds and rates are starting values) | Reputation matters on the road |
| A4 | **Broken replaces the Breaking Forced Retreat** `[DECIDED Oct 19]`. At max stress the survivor becomes Broken and keeps going; stress resets to 80. While Broken: max HP −18%, 18% of its attacks lost, +5% damage taken, movement −30%; fumbles unchanged | `[DECIDED Oct 19]` (Broken model locked; penalties between mild and harsh, slower movement) | Removes the stress wall; the survivor becomes HP-limited |
| A5 | **Resume gate is HP only** (≥ 80%). The player's stress retreat rule is turned off. Overload above 100% doubles stress gains (was ×1.15) | `[DECIDED Oct 19]` (Broken model locked) | Otherwise stress loops "withdraw → can't resume" |
| A6 | **Release from Broken:** each completed rest rolls 1 in 6. After 3 failed rests the survivor is released anyway, and its equipped weapon and body armor lose 5–10% durability (never below 10% of max) | `[DECIDED Oct 19]` (Broken model locked) | Monopoly-style "jail": a chance, with a guaranteed way out (no dead end) |
| A7 | **After a Forced Retreat and rest, the survivor resumes its previous activity automatically,** heading back to where it was Wandering (no prompt) | `[DECIDED Oct 19]` | Waiting at home raised Downings (S0) and stalls the idle loop |
| A8 | **Presentation:** status icons for Broken and Injured with tooltips; log lines for pursuers, groups, Broken entry and release; return-report entries when it happened away. Animations are later (placeholders allowed) | `[DECIDED Oct 19]` | Nothing happens invisibly |

**Starting values (data table): accepted by Sam as starting values, Oct 19.** Tunable in playtesting.

| Key | Value |
|---|---|
| Pursuers per walk | 0 / 1 / 2 at 60 / 30 / 10% |
| Pursuer escape chance | 60% |
| Pursuer hit chance / damage | 30% / 3–6 |
| Pursuer HP | 15 |
| Group meeting chance | 5% of walks |
| Group cap | 3 a day |
| Friendly threshold | standing ≥ 250 (Known) |
| Hostile threshold | standing < 0 (Wary or worse) |
| Escort | remaining walk ×0.5 |
| Mock | +5 stress |
| Injury chance | 50% (existing lasting injury) |
| Broken penalties | max HP −18%, attack loss 18%, damage taken +5%, movement −30% |
| Broken stress reset | 80 |
| Release | 1 in 6 per rest; forced after 3 rests; durability −5–10% |
| Overload stress multiplier | ×2 |

## 3. Decisions (Sam, Oct 19 evening) and what remains open
- **O1. Broken model locked as real rules** `[DECIDED Oct 19]`.
- **O2. Tested numbers accepted as starting values** `[DECIDED Oct 19]`.
- **O3. Heinous players are attacked by all factions** `[CONCEPT Oct 19, PARKED]`. To be written later as a policy rule, kept distinct from the standing rule. **Batch A uses standing only** (A3). The confirmation run showed the two give the same results today, because Heinous play already drives standing below 0.
- **O4. Item loss on entering Broken** `[CONCEPT Oct 19]` (Sam called it a policy rule): on entering Broken, the most valuable carried item drops one tier. **Details are parked** until Sam and Design work through items, values and tiers together. **Not in Batch A.**
- **O5. Injury clock fixed in Batch A** `[DECIDED Oct 19]`:
  - The lasting injury is a **persistent affliction** with a **1.5 real-hour** timer.
  - **More damage taken makes the timer longer**, but **only while the game is open**: offline processing never extends it.
  - On opening the save, the injury timer is **held at 1.5 hours** (Sam's wording).
  - It is **cured only by certain items**.
- **O6. The injury timer is frozen while the game is closed** `[DECIDED Oct 19]`. The survivor stays injured through the whole absence; the countdown runs only while the game is open.
- **O7. Cures** `[DECIDED Oct 19]`:
  - **(a)** a low random chance on each completed rest;
  - **(b)** the **Field Bandage**: the existing item (`field_bandage`, Default recipe 20 Cloth + 10 Medical, heals 30) is reused rather than a new bandage;
  - **(c)** an **ointment**, an item to add later (parked).
  - The ordinary Medkit **no longer cures** the injury, and rest by itself no longer guarantees a cure.
  - Starting values accepted (Sam, Oct 19):
    - **rest cure chance 8% per completed rest;**
    - **a carried Field Bandage is used automatically** while injured (nothing waits on the player).
- **O9. Deliberate Rest** `[CONCEPT Oct 19]`. A player action, **once per day**, with one limit shared by every entry point (Traversal page, schedule lock-in, any other page). `[CODE]` No manual Rest exists today.
  - **(a) The 8% injury cure roll happens only on the deliberate Rest** `[DECIDED Oct 19, on Design's recommendation; Sam delegated]`. Automatic HP rests (dozens a day) never roll.
    - *Why:* otherwise the injury would clear within an hour or two and stop mattering. The daily roll is a small bonus beside the reliable cure (the Field Bandage).
  - **(b) "Once per day" = once per real day, resetting at the player's local midnight** `[DECIDED Oct 19]`.
    - *Why:* a game day is 2.4 real minutes, so it wouldn't limit anything. Real days match the other daily systems (skill decay, the Jester's first camp).
    - A later **nutrition** system can add a food cost to resting; until then, the daily limit is the whole balance.
  - **(c) Effect** `[DECIDED Oct 19; values are starting values]`: rests where the survivor stands, with no travel and no trip ended. **+25 HP** (capped at max), **−10 stress**, and the 8% cure roll if injured. It doesn't count toward the Broken release (1 in 6 per completed rest). Unused at reset, it's simply lost: nothing waits on the player.
    - *Why these sizes:* smaller than one Medkit charge (about 32% at level 10) and half a day of Bedroll stress recovery (20 a day), so it helps without replacing supplies.
  - **Batch placement** `[DECIDED Oct 19]`: the deliberate Rest is a new action across several pages, so it ships in **Batch B**. **Batch A ships the injury cured by the Field Bandage** (and the timer); the 8% roll arrives with the Rest in B.
- **O8. Difficulty modes stay** (Easy / Normal / Hard; Sam corrected "Hard mode is not a thing", Oct 19). Spec §15 stands.
  - **Still open, not blocking Batch A:** does the parked item loss on entering Broken (O4) apply to every mode, or only Hard as the old §15.3 had it? Decided when the item work is unparked.

## 3a. Batch A clarifications after the Step-1 code report (Oct 19)
*Sam approved D1, D3, D4, D6 and D7. Sam delegated D2, D5 and D7b to Design's recommendation, recorded as `[DECIDED Oct 19, on Design's recommendation; Sam delegated]`.*

**"Walk home" means two different things:**
- **A withdrawal** walks back to the **last checkpoint** and rests there (existing rule). The map cell doesn't change.
- **A Forced Retreat or hostile send-home** goes to Base (D1).

| # | Decision | Gameplay consequence |
|---|---|---|
| **D1** `[DECIDED Oct 19]` | **Home and return.** A Forced Retreat or a hostile send-home moves the survivor on the map to **home**: the player's camp if one exists, otherwise the starting cell (never the Jester camp). It rests at Base, then **returns instantly** to the cell it left. **Manual travel, Make camp, or the Jester's first-Downing relocation replace or clear the saved return.** A hostile send-home is still not a Downing (A3) | The Oct 18 "returns to base on the map" is built; A7's resume is real movement; the player's own moves always win |
| **D2a** `[DECIDED; delegated]` | **Reopening keeps the exact frozen time left.** "Held" means "not advanced while closed" (O5 with O6) | Extensions earned while playing are kept; short check-ins can still finish an injury |
| **D2b** `[DECIDED; delegated]` | **"Open" means the game page is visible.** The injury counts down, and can be extended, only during engine ticks while the page is visible. Each tick credits the real time since the previous credited tick, capped at a few seconds (an implementation constant) | The first catch-up after loading never counts; a background tab doesn't count; a sleeping device can't credit hours |
| **D2c** `[DECIDED; delegated]` | **Extension:** +30 s per HP lost while injured (credited ticks only), total capped at 3 h. A new injury while already injured sets the timer to the larger of the time left or 1.5 h (no stacking). Values are starting values | Fighting while injured visibly prolongs it, without spiralling |
| **D3** `[DECIDED Oct 19]` | **During a withdrawal, discoveries freeze** along with encounters and policy events. Timers are frozen, not reset | No new prompts or policy ventures on the walk |
| **D4a** `[DECIDED Oct 19]` | **Theft takes the run haul only.** Never pocket supplies, equipped gear or story items | A Broken robbery costs loot, not the means to recover |
| **D4b** `[DECIDED Oct 19]` | **A Field Bandage counts as carried in a pocket or a consumable slot.** Used at once when an injury starts, or as soon as one is available while injured, including during offline catch-up | No injury waits on the player while a bandage is on hand |
| **D4c** `[DECIDED Oct 19]` | **Every completed automatic rest counts toward Broken release** (checkpoint, Base, Jester camp). The Traversal Make camp action doesn't. The deliberate Rest (Batch B) is excluded (O9c) | Release follows the survivor's normal rhythm |
| **D5a** `[DECIDED; delegated]` | **Pursuers yield nothing beyond the locked rules:** they can cost HP or cause a Downing through the normal Downed path. No XP, loot, kill count or durability wear | No new reward or cost; a later decision could add wear or XP |
| **D5b** `[DECIDED; delegated]` | **The getaway roll stays separate and has no effect on pursuers.** The locked 60% escape and 30% hit apply unchanged. The getaway is still rolled and logged, but its text no longer promises evasion during a withdrawal | The locked pursuer numbers are untouched; only the getaway wording changes |
| **D6** `[DECIDED Oct 19]` | **Status icons** on the Wandering screen beside the survivor's name and HP bar; Broken before Injured; tooltips list the effects. The Injured tooltip shows time left, "paused while the game isn't visible" (matching D2b). No other screen changes in Batch A beyond log and return-report lines | The player can always see why the survivor is weaker |
| **D7** `[DECIDED Oct 19]` | **Save keys:** in addition to Broken and the resume target, the injury's remaining time and the daily group counter (real day, local midnight) | Needed to deliver O6 and the group cap |
| **D7b** `[DECIDED; delegated]` | **One-time migration exception:** an active old-format injury (an absolute end time on the wall clock) converts once, at load, to the smaller of its remaining real time and 1.5 h. From then on it follows D2a–c exactly. This is an explicit exception to D2a, because the old time left was produced under superseded clock rules | A save from before Oct 16 never wakes with a multi-day injury |

**Also resolved from the documents:**
- Make camp **stops curing the injury** (O5: "cured only by certain items").
- The Fort guard injury follows the same rules (it's the same lasting injury).
- **Broken release** (A6): each completed rest rolls 1 in 6, **including the third**. The forced release, with its durability cost, happens only after the third roll fails.
  - Release shares: 1/6 at rest 1, 5/36 at rest 2, 25/36 at rest 3.
  - Of all spells, 125/216 are forced with the cost.

**Parity note (for O5/O6):** the injury is the **first deliberate online/offline difference.** Every other system follows "one rule online and offline" (FX2, H1, DC-1). Batch A's parity check (acceptance 7) must list the injury as the named exception.

## 3b. Open questions answered (Sam, Oct 26)

| # | Decision | Why |
|---|---|---|
| B1 | **Main balance target: Downings per km** `[DECIDED Oct 26]`. Field time is a guardrail: tuning may not push it below about 50% | Downings are what the player feels; the guardrail stops "fewer Downings" coming from more time in bed |
| B2 | **Rule 5 scope: closed** `[DECIDED Oct 26]`. Already covered by BAL-A (policy events pause on the walk home, acceptance check 1) | Nothing left to decide |
| B3 | **Raise starting (T0) durability so gear lasts a full 8 h absence** `[DECIDED Oct 26]`. Values go in a later batch, not BAL-A. Repair cost revisited later | Gear breaking while away punishes being away |
| B4 | **Automatic repair `[PARKED]`** as a quality-of-life Shop idea (matches §4) | Tests showed it barely changes balance |
| B5 | **Broken penalty: mild for now; tune in playtests** `[DECIDED Oct 26]`. Steers the tuning of A4's penalties (A4 was set "between mild and harsh", Oct 19) toward the mild end; A4's values stand until a playtest batch changes them | Broken is only 2–5% of the time at current rates |
| B6 | **Codex Option B** `[DECIDED Oct 26]`: `WANDER_SIM_TABLE.codexFromWandering = true`; an entry unlocks on a fight, not an evade (tutorial spec 7.3); 13 Discovery XP once per new entry. Dependency met: BEST1 is CLOSED (Oct 17) and the flag exists in `game/wandering.js` (currently `false`). Flipping it belongs to a batch, not this document change | The Codex fills from where most zombies are met |

**Still needed to close BAL-A:** Sam's TEST SAVE smoke test; the 30-day H2 run; Sam's review of the BAL-A report scope note §4.

**Audit notes (Oct 26, for Sam):**
- Broken release at 1 in 6 per rest means about 58% of Broken spells end in the forced release (with 5–10% durability loss). Check that against B5 "mild" in the playtest.
- The injury timer's online/offline difference (O5/O6) is the one named parity exception. The 30-day run must treat it as such, or the comparison fails.

## 4. Parked (not in this slice)
- the friendly-group trade screen;
- full animations;
- automatic repair (a Shop upgrade, in-game currency);
- the real Machete;
- the skill tree;
- infection;
- ammo (AMMO-12, weapons Phase 6);
- lifesteal;
- the Heinous "attacked by all factions" policy rule (O3);
- the item-tier loss on entering Broken (O4).

## 5. Spec impact (when the slice closes)
**`wandering-tab-spec.md`:**
- **§13.8 Stress:**
  - the stress table's Breaking row;
  - the Batch 3B note (Forced Retreat triggers: Breaking removed);
  - the PF1 resume gate (HP only);
  - the Shaken-floor note (it now applies on entering Broken);
  - a new Broken subsection.
- **§13.5 Risk and failure:** the walk home (A1–A3).
- **§14 load note:** overload ×1.15 → ×2.
- **§15.3 Hard mode extras:** its Breaking trigger is gone; the item loss is reworked as the parked O4 rule (mode scope open).
- **Retreat controls note (around line 336):** rule 5 scope; the stress retreat rule removed.
- **Forced Retreat return:** add the A7 resume.

**Other documents:**
- `rb1-retreat-controls-slice.md`: the stress rule.
- `elder-jester-concept.md`: groups unnamed before the Fort; cross-reference.
- `CODE_STATE.md` after the batch.

## 6. Proposed batch (draft `CURRENT_BATCH.md`)

### BATCH BAL-A: Walk home and Broken

**Goal.** A withdrawing survivor no longer meets ordinary encounters or roadside policy events. Only rare slow pursuers and standing-based groups can appear on the walk home. Max stress makes the survivor Broken instead of ending the run. After a Forced Retreat and rest, the survivor resumes Wandering.

**Decided behavior.** A1–A8 in §2, with the §2 values as named data-table entries (once O1 and O2 are locked).

**Likely files.**
- `game/active.js`:
  - Breaking check at `_afterSegment` (around line 346);
  - `forcedRetreat` (around line 530);
  - `RETREAT_RULES_TABLE` (around line 565);
  - `ACTIVE_TABLE.load.overloadStressMult` (line 28);
  - the withdrawal state (around lines 296–330, 398).
- `game/wandering.js`:
  - encounter and policy timers in `advance` (around lines 430–455);
  - `WANDER_REST_TABLE`.
- `game/stats.js`: the injury (around line 376; `treatInjury` has no callers today, `[CODE]`): real-time timer, frozen while closed, active-only growth, cures (O5–O7). `game/items.js`: `field_bandage` (line 124) gains the injury cure.
- `screens-v3.jsx`: status icons, log and return report.
- tests; `CODE_STATE.md`.

**Step-1 facts for Code (file:line).**
- **TQ-A1:** where a withdrawal begins and ends, and every timer that keeps running during it.
- **TQ-A2:** the survivor status-icon area and its tooltip pattern, if any.
- **TQ-A3:** every reader of `breaking`, the Shaken floor and the stress retreat rule (UI, return report, achievements, Hard mode).
- **TQ-A4:** how the Traversal position and the "frontier" are stored, for the resume.

**Acceptance checks.**
1. **Rule 5 scope:** a seeded run with a withdrawal shows 0 zombie encounters and 0 policy events between withdrawal start and arrival, except pursuers and groups.
2. **Pursuers:** over a seeded 1,000-walk test, pursuer counts, escapes and hits fall within the table's expected ranges. A pursuer at HP ≤ 1 goes through the normal Downed path (heal charge, else Forced Retreat).
3. **Groups:** with standing set ≥ 250, < 0 and in between, the friendly, hostile and neutral reactions occur respectively. The cap holds at 3 a day. A hostile send-home does not increment the Downing count. Theft happens only if the survivor was already Broken, and never takes story items.
4. **Broken:** reaching max stress sets Broken, resets stress to 80, applies every penalty, and creates no Forced Retreat. Release follows the 1-in-6 roll, or is forced on the 3rd rest with the durability cost (floor 10%).
5. **Resume:** after a Forced Retreat and rest, the next segment is on the way back to the previous Wandering position, with no prompt.
6. **Presentation:** icons appear and clear with their states; the log and return report name each event.
7. **Parity:** watched, background and offline processing give the same results for the same seed (T1-style chunk test). **Named exception:** injury growth, which happens only while the game is open (O5).
8. **Regression:** all suites pass; H2 harness rerun (D7's HP-max check stays 100 in this batch).
9. **Injury:** a new injury lasts 1.5 real hours. Damage while the game is open extends it; offline catch-up never extends it. The timer doesn't move while the game is closed (O6). A Field Bandage clears it; a once-a-day Rest that qualifies under O9 clears it at 8%; a Medkit does not (O7).

**Explicitly out.**
- Batch B and C content;
- the trade screen;
- animations beyond placeholders;
- auto-repair;
- Option C heal thresholds (separate);
- the Heinous all-factions rule and the item-tier loss on entering Broken (parked);
- changes to the policy events themselves outside the walk home.

**Stop conditions.**
- Any save-format change beyond new keys for Broken and resume.
- A change in seeded sequences outside the walk home.
- A UI that would need a player response to continue.

**Closing line:** `BAL-A: CLOSED` / `NOT CLOSED`.
