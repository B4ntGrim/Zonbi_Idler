# CURRENT_BATCH.md

**Status:** **CLOSED Oct 15** (`JD1a FIRST DISPLACEMENT: CLOSED`). Locked by Sam Oct 13 (S1–S5, B1–B5, G1, G2, E1); built and tested Oct 13; Sam's real-save fingerprint check passed Oct 15 (29 keys, 989431190 before and after). Report: `handoff/to-design/JD1a_COMPLETION_REPORT.md`. Source and decisions: `reference/jd1a-batch-draft.md` (v5). Archived Oct 15.

### BATCH JD1a — First displacement (rules; off for players)

**Goal.** The rules for a tutorial player's first meeting with the Jester exist, are tested, and are switched off in the real game until JD1b. Legacy saves migrate safely. No screen changes.

**Decided behavior** (S1–S5; B1–B4 as Sam locks them)
1. **Switch:** `ZI.JESTER_TABLE.firstMeetingOn = false` (data table, code default). Nothing reads it from a save. Tests set it in their own environment.
2. **Eligibility record (B4):** every new save writes `zi_jester = { v:1, eligible, met:false, phase:null }` at creation. `eligible` is true only if the switch was on. Switch on: **no** starter kit at creation. Switch off: the existing kit once, as today.
3. **Legacy saves** (no `zi_jester`): migrated once on load: write `{ v:1, eligible:false, migrated:true }`, and today's kit migration runs as is (once, guarded by `zi_starter_kit_given`). Never eligible. Kit receipt is read only from `zi_starter_kit_given` (and `zi_fort_starter_given` for the med kit), never from inventory.
4. **First Downing** (switch on, `eligible:true`, `met:false`, no heal or revive left): instead of the Base Forced Retreat → pick the camp square (G1: distances 3, 4, 5, 2, 1 in that order; inside the 8 × 6 sector; unlocked, uncontested, not Fort, Fallow or Home; reachable to the Downing square by 8-neighbour moves over non-locked squares inside the sector; within a distance, the run RNG picks; then the Downing square if it qualifies; else E1) → remove run haul + `zi_carried` items except story items, record them as traded → move the position to the camp → rest at the camp (Bedroll rate) from HP 1. Persist `{ phase:'resting', camp:{gx,gy}, traded:[…] }`.
5. **Wait:** when that rest completes with `met:false`, set `phase:'waiting'`. While waiting, Wandering consumes time with no events, stress, XP or loot, and nothing is carried over to replay.
6. **Meeting** (`ZI.jesterMeet(weaponId)`, called by JD1b's scene): only if `eligible`, `met:false` and `phase` is `'waiting'` (or `'resting'`). In order: grant the rewards (B3: equip into empty slots only, else stash; scout kit + 2 rations carried; story med kit to stash) → set `zi_starter_kit_given` → roll the stay (3–5 days, seeded) → persist `{ met:true, weapon, meetAt, stayDays, phase:'done' }` in one write → the survivor resumes from the camp. Any second call returns "already met" and changes nothing.
7. **Camp clock:** the camp exists while `simulation clock < meetAt + stayDays × 86,400,000 ms` (the game's day convention, §2a). Start and length are never re-rolled.
8. **Fort hand-in (B2):** `hasMedKit()` also counts the Fort-bound Med Kit; `takeMedKit()` takes it first and consumes only the one handed in. The story kit can't heal, be discarded, sold or lost.
8b. **Switch off with an eligible save (B5):** on load, by phase: `null` → `eligible:false` (exempt), existing kit once; `'trading'` → finish removing the recorded items (idempotent), then as below; `'resting'` → finish the outstanding rewards once (G2: weapon owed), keep resting until the resume gate, then normal Wandering; `'waiting'` → finish the outstanding rewards once, clear the wait, resume Wandering; `'done'` → nothing. Each outcome is written as `fallback:{at, from}` so it never runs twice, and turning the switch on later never starts a trade or grants again.
8c. **Weapon owed (G2):** when rewards are finished without a weapon choice (B5), the record holds `weaponOwed:true`. JD1a provides `ZI.jesterChooseOwedWeapon(weaponId)` for JD1b: it saves the choice first (`weaponPending`), grants it, then clears `weaponOwed` and `weaponPending`. On load, a saved `weaponPending` is completed without asking again. It never grants a second weapon, kit or trade, and nothing ever picks the weapon for the player.
8d. **Step records (no transaction helper exists; reuse "flag first, act idempotently"):** the trade writes `phase:'trading'` with the item list **before** removing anything, then `'resting'`; the meeting writes `phase:'granting'` with the reward list **before** granting, then `'done'`. On load, a `'trading'` or `'granting'` record finishes its list, skipping anything already done.
9. **Unchanged:** every later Downing, the standing policy (U39), Fort behavior, R1/RB retreat rules, FX1–FX4, save version (new keys are additive).

**Likely files.** `game/items.js` (two items, data table, kit placement, `hasMedKit`/`takeMedKit`) · `game/active.js` (Downing branch, wait, `jesterMeet`) · `game/wandering.js` (waiting in `advance()`) · `game/save.js` (marker, no kit when on) · `game/world.js` (camp square and its small reachability check) · new `tests/jd1a-first-displacement.test.js` · `CODE_STATE.md`. `game/bootstrap.js` (one call on load: the legacy record and the B5 fail safe, next to today's kit migration). `fort.js` and screens are not expected to change.

**Steps.** 0 baseline · 1 answer the step-1 facts; stop if a file outside the list must change · 2 implement · 3 targeted checks, then regressions.

**Acceptance checks** (automated unless marked)
1. **Legacy, kit received** (`zi_starter_kit_given`, no `zi_jester`): first load writes `eligible:false, migrated:true`; three loads grant nothing; with the switch on, its first Downing is the Base Forced Retreat.
2. **Legacy, no kit:** first load grants the old kit once (pouch, scout kit, med kit unless `zi_fort_starter_given`) and writes the record; the next loads grant nothing.
3. **Legacy with `zi_fort_starter_given` only:** no second med kit.
3b. **Created with the switch off, loaded with it on:** has the kit once, `eligible:false`; loading with the switch on grants no second kit, and its first Downing is the Base Forced Retreat (no trade).
3c. **Created with the switch on:** `eligible:true`, no kit items anywhere, `zi_starter_kit_given` not set.
4. **Trade:** equipped gear, stash and story items are untouched; run haul and `zi_carried` (non-story) are gone and recorded; removal happens before any reward.
5. **Rewards once:** `jesterMeet` grants exactly jacket, Fort-bound Med Kit, 2 rations, pouch, scout kit and the one chosen weapon; a second call, and a call after save → reload, grant nothing; a reload between the trade and the meeting never repeats the trade.
5b. **Placement, empty slots:** jacket in vest, pouch in backpack, weapon in melee; scout kit and 2 rations in carried; story med kit in the stash.
5c. **Placement, occupied slots:** with vest, backpack and melee already equipped, those stay equipped and unchanged; the jacket, pouch and weapon go to the stash.
6. **Story kit:** can't heal, be discarded, sold or lost to a Forced Retreat.
6b. **Both med kits owned:** the Fort hand-in takes the Fort-bound Med Kit and leaves the Field Medkit; entry terms and rewards match a Field Medkit hand-in. With only a Field Medkit, behavior is identical to today.
7. **Offline recovery:** an offline first Downing rests to the resume gate at the camp, then waits; 24 h more adds no kills, loot, XP or stress, and nothing is replayed after the meeting.
8. **Switch off:** a first Downing is the ordinary Base Forced Retreat and the survivor continues; no `waiting` state can be reached (differential vs pre-JD1a: identical).
9. **Timer:** starts at the meeting, not arrival; start and length are identical after three reloads; the length is rolled once.
10. **Isolation:** no test, harness or H2 build writes the switch into a save; on the real-game page `ZI.JESTER_TABLE.firstMeetingOn` is false; a legacy save gains only the `eligible:false` record.
10b. **Fail safe, trade not started:** loaded with the switch off → exempt, existing kit once; 3 more loads and a load with the switch on → no second kit, no trade.
10c. **Fail safe, waiting at the camp:** loaded with the switch off → outstanding rewards granted once (weapon owed), wait cleared, Wandering resumes; repeat loads and switch on → nothing more.
10d. **Fail safe, resting at the camp:** rewards granted once, rest continues to the resume gate (not skipped), then Wandering.
10e. **Fail safe, trade completed:** rewards and traded-away items stay as they are; no second kit; switch on → no trade.
10f. **Interrupted trade:** a save stopped at `'trading'` (items listed, some removed) finishes the removal exactly once on load; a save stopped at `'granting'` finishes the rewards exactly once; no item is removed or granted twice.
11. **Placement order:** on built maps, the camp is at distance 3 when a safe reachable square exists there; with 3 blocked, at 4; then 5, 2, 1; then the Downing square when it qualifies. Never locked, contested, Fort, Fallow or Home; always inside the sector (1,000 seeds × every Downing square in a sector).
11b. **Safe departure:** from every chosen camp, a legal path (8-neighbour moves over non-locked squares inside the sector) reaches the Downing square; a candidate walled in by locked squares is never chosen even if it's nearer.
11c. **E1, no safe camp:** with every candidate unsafe and a contested Downing square, the Downing is the ordinary Base Forced Retreat, no trade, the save stays eligible, and the next qualifying Downing gets the meeting.
11d. **Weapon owed across reloads:** after the B5 fallback with no weapon, `weaponOwed` survives 3 reloads and switching the feature on; `jesterChooseOwedWeapon` grants exactly the chosen weapon once and clears the state; a second call grants nothing; no kit, rewards or trade are repeated.
11e. **Saved choice completes:** a save stopped after `weaponPending` was written but before the grant completes that same weapon on load, without asking again; `weaponOwed` clears only after the grant.
11f. **Never auto-chosen:** no code path grants a weapon from `weaponOwed` without a player choice (static check plus every fallback path).
12. **Policy:** the standing policy is identical before and after every JD1a path.
13. **Manual browser check (Sam, TEST SAVE page):** fingerprint before and after loading the new build, unchanged; normal play unchanged. **PASS Oct 15** (performed on the real save: 29 keys, 989431190 before and after).

**Authorized test edits:** none expected; if any suite needs one, stop and list it.

**Required verification.** Targeted: the new suite. Regressions: all suites; r1 ×20 frozen; sim-clock-rng ×5; differential with the switch off vs pre-JD1a. Report each check as automated / manual / NOT RUN. Closing line: `JD1a FIRST DISPLACEMENT: CLOSED` / `NOT CLOSED`.

**Handoff to JD1b.** JD1b calls `jesterMeet(weaponId)` for the meeting and `jesterChooseOwedWeapon(weaponId)` for an owed weapon, and turns the switch on for players.

**Explicitly out.** The scene and dialogue (JD1b) · turning the switch on for players · the tutorial skip flag and warning · later Jester camps · weapon XP · any link to the standing policy · Fort quest changes beyond accepting the story kit.
