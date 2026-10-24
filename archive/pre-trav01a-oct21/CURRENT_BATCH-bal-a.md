# CURRENT_BATCH.md

**Status:** **LOCKED by Sam, Oct 19. IMPLEMENTATION AUTHORIZED Oct 19**, after the Step-1 report and decision sheet. BAL-A replaces H2 (closed and archived as `archive/batch-h2-closed-oct19.md`). The rules, the starting-value table and all decisions are in the slice brief (`claude/slice-retreat-broken-batch-a-draft.md`, Claude project: §2 rules A1–A8 and table, §3 O1–O9, **§3a clarifications D1–D7b**) and the index decisions log (Oct 18–19).

### BATCH BAL-A: Walk home and Broken

**Goal.** A withdrawing survivor no longer meets ordinary encounters or roadside policy events. Only rare slow pursuers and standing-based groups can appear on the walk home. Max stress makes the survivor Broken instead of ending the run. After a Forced Retreat and rest, the survivor resumes Wandering.

**Decided behavior.** Rules A1–A8 and the starting-value data table in the slice brief, §2 (O1 and O2 locked on Oct 19). The injury follows O5–O8 (§3). In this batch the injury is cured by the Field Bandage only (auto-used). The deliberate Rest and its 8% cure roll come in Batch B. **Clarifications D1–D7b (slice §3a) are part of the decided behavior:**
- home and return (D1);
- injury timing: exact frozen remainder, visible-page ticks, +30 s per HP lost capped at 3 h (D2);
- discoveries freeze during withdrawal (D3);
- haul-only theft, bandage from a pocket or a consumable slot, automatic rests count toward release (D4);
- pursuers yield nothing beyond the locked rules, and the getaway has no effect on them (D5);
- status icons (D6);
- save keys (D7);
- the one-time migration exception (D7b).

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
- `game/stats.js`: the injury (lines 375–378), changed to a stored remaining time, visible-tick countdown and extension, cures, and the D7b migration. `treatInjury` **is** called by the Traversal Make camp action (`screens-v3.jsx:886`), which stops curing the injury (O5).
- `game/items.js`: `field_bandage` (line 124) gains the injury cure.
- `game/items.js` `SurvivorRules.moveSpeed` (line 377): the Broken speed factor.
- `game/active.js` `wanderWithdraw` / `retreatEvadeRoll` (lines 393, 780): getaway wording (D5b).
- `screens-v3.jsx` Traversal travel and camp (lines 849, 881): clear the saved return (D1).
- `screens-v3.jsx`: status icons, log and return report.
- tests; `CODE_STATE.md`.

**Step-1 facts for Code (file:line).** *Answered in the Step-1 report (Oct 19).*
- **TQ-A1:** where a withdrawal begins and ends, and every timer that keeps running during it.
- **TQ-A2:** the survivor status-icon area and its tooltip pattern, if any.
- **TQ-A3:** every reader of `breaking`, the Shaken floor and the stress retreat rule (UI, return report, achievements, Hard mode).
- **TQ-A4:** how the Traversal position and the "frontier" are stored, for the resume.

**Acceptance checks.**
1. **Rule 5 scope:** a seeded run with a withdrawal shows 0 zombie encounters, 0 policy events and 0 new discovery prompts between withdrawal start and arrival, except pursuers and groups. The encounter, policy and discovery timers are unchanged across the walk (frozen).
2. **Pursuers:** deterministic tests with injected rolls cover escape, a hit, a miss, the kill, and HP ≤ 1 going through the normal Downed path (heal charge, else Forced Retreat). A pursuer gives no XP, loot, kill count or wear (D5a). A successful getaway doesn't change the 60% escape or 30% hit (D5b), and the getaway text doesn't promise evasion during a withdrawal.
3. **Groups:** with standing set ≥ 250, < 0 and in between, the friendly, hostile and neutral reactions occur respectively. The cap holds at 3 a day (real day, local midnight). A hostile send-home does not increment the Downing count. Theft happens only if the survivor was already Broken, takes the run haul only, and never takes pocket items, equipped gear or story items (D4a).
4. **Broken:** reaching max stress (in the field, during a withdrawal, or during HOLD) sets Broken, resets stress to 80, applies every penalty, and creates no Forced Retreat. **Release, by deterministic tests with injected rolls:**
   - success at rest 1, at rest 2, or at rest 3: release with no cost;
   - three failed rolls: forced release **after the third failed roll**, with 5–10% durability lost on the weapon slot `wearEquippedOnKill` uses and on the vest (floor 10% of max, never raised; empty or worn-out slots handled).
   
   Only completed automatic rests count (checkpoint, Base, Jester camp; not Make camp) (D4c).
5. **Home and return (D1):**
   - A Forced Retreat or hostile send-home sets the map position to home (the player's camp, else the starting cell; never the Jester camp) and rests at Base.
   - When the rest ends, the position returns instantly to the saved cell, with no prompt.
   - A second Forced Retreat while at home doesn't overwrite the saved cell.
   - Manual travel, Make camp, or the Jester's first-Downing relocation clears it.
6. **Presentation:** icons appear and clear with their states; the log and return report name each event.
7. **Parity:** watched, background and offline processing give the same results for the same seed (T1-style chunk test). **Named exception:** injury growth, which happens only while the game is open (O5).
8. **Regression:** all suites pass; H2 harness rerun (D7's HP-max check stays 100 in this batch).
9. **Injury:**
   - A new injury lasts 1.5 real hours.
   - It counts down and can be extended only during credited ticks while the page is visible (D2b): +30 s per HP lost, total capped at 3 h. A re-injury sets the timer to the larger of the time left or 1.5 h (D2c).
   - A 72-hour offline catch-up, a hidden tab and a simulated device sleep neither count it down nor extend it.
   - Reopening keeps the exact time left (D2a).
   - An old-format injury converts once to the smaller of its remaining real time and 1.5 h (D7b).
   - A Field Bandage, from a pocket or a consumable slot, clears it automatically, including offline (D4b). A Medkit and Make camp don't.
   - No Rest-based cure in this batch.
10. **Status display (D6):** the Broken and Injured icons sit beside the survivor's name and HP bar on the Wandering screen, Broken first. Tooltips list the effects; the Injured tooltip shows time left and "paused while the game isn't visible". The HP bar uses the reduced maximum while Broken.

**Explicitly out.**
- Batch B and C content;
- the trade screen;
- animations beyond placeholders;
- auto-repair;
- Option C heal thresholds (separate);
- the Heinous all-factions rule and the item-tier loss on entering Broken (parked);
- changes to the policy events themselves outside the walk home.

**Stop conditions.**
- Any save-format change beyond new keys for Broken, the resume target, the injury's remaining time and the daily group counter (D7), plus the D7b one-time injury conversion.
- A change in seeded sequences outside the walk home.
- A UI that would need a player response to continue.

**Closing line:** `BAL-A: CLOSED` / `NOT CLOSED`.
