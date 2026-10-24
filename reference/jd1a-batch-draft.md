# Zed Idler — JD1a First Displacement: Implementation Batch (for review)

**Status:** Proposed batch, **v5**, Oct 13. Decisions S1–S5, B1–B5, G1, G2 settled by Sam Oct 13 (§1). Step 1 (read-only) done (§2a). E1 approved Oct 13. **Locked by Sam Oct 13. CLOSED Oct 15** (fingerprint check passed); §4 is archived as `reference/archive/jd1a-batch.md`.
**Sources:** `first-displacement-slice.md` (JD1) · `elder-jester-concept.md` U28–U40 · read-only code check Oct 13 (`items.js` 46, 54–60, 219–225, 489–520, 523–579; `save.js` 100–110; `bootstrap.js` 96, 116–117; `active.js` 85–86, 521–551; `fort.js` 124–130; `wandering.js` 270–300, 384–460).

---

## 1. Settled decisions (Sam, Oct 13)

| ID | Rule |
|---|---|
| **S1 Legacy saves** | Every new save gets a persistent marker; a save without it is a **legacy save**. Legacy saves **skip the whole first meeting** and meet the Jester later. A legacy save that never received its starter kit gets it once on load, by the existing migration. The grant flag `zi_starter_kit_given` prevents duplicates (inventory can't prove past receipt). Migration completion is persisted |
| **S2 The trade** | The Jester takes the **run haul and the carried items**, never equipped gear, the stash, or protected story items. Traded items are removed **before** rewards are granted. Completion is persisted; reloads never repeat the trade or the rewards. The weapon choice stays as agreed (Nail Bat, Iron Knuckles, Pocket Knife); no other rewards |
| **S3 Rewards** | Old Padded Jacket (body slot, armor 4, 2 kg) · Fort-bound Med Kit (protected story item: no healing, no drop, no sale, no loss; can be handed in for the Fort quest; existing story-item pocket and weight rules) · 2 rations. Plus the existing Handmade Pouch and Scout Kit (U22). Values live in data tables |
| **S4 Offline first Downing** | With the feature on: the survivor recovers at the Jester's camp (recovery continues while away), then **Wandering pauses until the player returns and completes the meeting**. Intentional exception to automatic continuation. The departure clock (3–5 days) starts when the meeting plays; duration chosen once; start and duration persisted |
| **S5 Safety switch** | JD1a ships **off** for players until JD1b supplies the scene. While off, Downed recovery and continuation are exactly as today and no player can be left waiting. Tests and H2 may turn it on only in isolated test environments or test saves; never the real save |
| **B1 Items** | **Old Padded Jacket** is a separate item: body (vest) slot, armor 4, 2 kg, 2 pockets, no extra carry capacity, common, durability and icon as the existing Padded Jacket (`vest_t1`, unchanged at armor 8). **Fort-bound Med Kit** weighs 1 kg |
| **B2 Fort hand-in** | The Fort accepts the Fort-bound Med Kit **before** a regular med kit. Only the kit actually handed in is consumed. Entry terms and rewards unchanged |
| **B3 Placement** | Jacket, pouch and chosen weapon are equipped **only if their slot is empty**, otherwise placed in the stash; equipped gear is never replaced. Scout kit and 2 rations go with the survivor (carried). The Fort-bound Med Kit goes to the stash and is recognized by the Fort's hand-in check |
| **B4 Eligibility vs kit** | **First-meeting eligibility and starter-kit receipt are two separate, explicit facts.** Every new save records both at creation, switch on or off. A save created with the switch **off** gets the existing kit once (`zi_starter_kit_given`) and is **not eligible**, so it never gets the trade, even after the switch is turned on. **Older saves with no eligibility record are exempt** and are migrated once (record written: not eligible). Kit receipt is never inferred from inventory |
| **B5 Switch off, eligible save** | On load with the switch off: **trade not started** → permanently exempt, existing kit once (grant flag). **Trade done, rewards not yet granted** → finish the outstanding rewards exactly once, then clear the wait (not treated as untouched). **Waiting at the camp** → clear the meeting wait and resume normal recovery or Wandering; unfinished recovery is never skipped. **Trade and rewards completed** → keep them; nothing returned, no second kit. The fallback is persisted so repeated loads or turning the switch back on never repeat rewards or the trade. Eligibility, kit receipt and trade completion stay separate records |
| **G1 Camp placement** | Search open camp squares at distance **3, 4, 5, then 2, then 1** (the game's distance: Chebyshev, as the Fort). The camp square must be **unlocked and uncontested** (also not Fort, Fallow or Home). The survivor must be able to **leave the camp by legal movement**: a small reachability check that follows the existing movement rules (no general pathfinding). Only reachable candidates count, in that order. The Downing square is the last fallback **only if it meets the same conditions**; a camp is never placed on a locked or contested square |
| **G2 Weapon owed** | If a trade took items but no weapon was chosen, finish every other outstanding reward once and persist **"weapon choice owed"**. When JD1b exists it offers **only** that weapon choice: no second trade, no duplicate kit or rewards. The Jester never chooses for the player. The owed state clears only when the chosen weapon is granted; a choice already saved is completed, not asked again |

---

## 2. Code facts that shape the batch `[CODE]`

1. **Three inventories:** stash (`zi_stash`, at base), carried (`zi_carried`, brought along), loadout (equipped). The run haul is the run's own `carried` list. S2 takes **run haul + `zi_carried`**, minus story items.
2. **The kit grant** (`ensureStarterKit`) runs at save creation **and on every boot of an active save**, guarded by `zi_starter_kit_given` (plus `zi_fort_starter_given` for the med kit). That boot call is the existing migration S1 reuses.
3. **A Padded Jacket already exists** (`vest_t1`: vest slot, armor 8, 2 kg, 2 pockets). The Old Padded Jacket is a new, weaker item in the same slot (rule §4.3: reuse checked; a separate item keeps the shop's jacket unchanged).
4. **The Fort quest hand-in** checks `hasMedKit()` and takes one with `takeMedKit()`; both only know the usable Field Medkit (`medkit`). `fort.js` itself needn't change: those two functions in `items.js` learn the story kit.
5. **Story items** (`isStory`) are already protected by `removeFromStash`, `canDiscard` and `_haulIsStory` (never lost in a Forced Retreat).
6. **No "skipped the tutorial" flag exists** (Skip counts as done). JD1a can't tell a skipper; with the switch off this has no effect. The skip flag belongs to the tutorial batch.
7. **The existing `paused` flag replays the paused time later**, so the wait needs its own state.

---

## 2a. Step 1 findings (read-only, Oct 13) `[CODE]`

| Question | Finding | Used as |
|---|---|---|
| **Clock for "3–5 days"** | Every "days" rule in the game counts **real 24-hour days on the game clock** (`ZI.clockNow()`, the H1 simulation clock): injury (`setInjury(days)`), skill idle days, Reputation forgiveness, rest stress per day. The core "game clock" (`CLOCK_RATE` 0.5) is display-only | **Reuse:** stay = `stayDays × 86,400,000 ms` on the simulation clock; FX2's 24-h cap applies as everywhere |
| **Locked-cell check** | `ZI.worldCell(gx, gy, 'scavenge').state` is `'locked'`, `'contested'`, `'cleared'` or `'available'`. The Fort placement (`getFortPos`) treats locked and contested as ineligible | **Reuse:** eligible = not locked, not contested; also not the Fort, Fallow or Home cell |
| **"Same grid"** | A sector is **8 × 6** cells (`SECTOR_COLS` 8, `SECTOR_ROWS` 6; earlier notes saying 16 × 16 were wrong). The Fort keeps its pick "inside the starting view" (the start's sector) | **Reuse:** the camp stays in the Downing square's sector |
| **Distance** | The Fort uses **Chebyshev** distance (king moves: diagonals count as 1) | **Reuse:** 3–5 = Chebyshev distance 3 to 5 |
| **Reachability** | The Fort placement does no path check, and no path check exists anywhere | Added as a small bounded check (G1), following the movement rules below |
| **Legal movement** | Traversal travel moves **one square at a time to any of the 8 neighbours**; **locked squares can't be entered** (the click is ignored); **contested squares can be entered**; moves cross sector edges | **Reuse for G1's check:** from the camp, a path of 8-neighbour moves over non-locked squares, kept inside the sector (≤ 48 squares, so it stays small), must reach the Downing square, which is where the survivor last stood legally |
| **Seeded pick** | The Fort picks with the world seed; JD1a needs the run's seeded RNG (H1 rule) so watched and offline match | Run RNG |
| **Fallback** | `getFortPos` returns `null` when no eligible cell exists; **no fallback exists to reuse** | G1 order; E1 below |
| **Save writes** | The trade touches three separately saved stores (run haul, `zi_carried`, the new record). No transaction helper exists; the established pattern is "flag first, act idempotently" (`ensureStarterKit`) | **Reuse that pattern:** record the step before acting, make each step safe to redo (below) |

## 3. Edge case E1 `[DECIDED Oct 13]` (Sam approved the recommendation)

| # | Edge case | Smallest safe fallback (recommendation) |
|---|---|---|
| **E1** | **No safe camp at all.** No reachable, unlocked, uncontested square at distance 3, 4, 5, 2 or 1 in the sector, **and** the Downing square fails the same conditions (it can be **contested**, since contested squares can be entered, or be the Fort, Fallow or Home square). Rare (an island of locked squares, or a Downing on a contested square with no safe neighbours) but possible | **This Downing becomes the ordinary Base Forced Retreat** (today's rule: some haul lost, rest at Base). **No trade happens; the save stays eligible** with the meeting not started, so the first meeting happens at the next qualifying Downing. Logged as `campSkipped:{at, reason}`. Nobody is placed on an unsafe square, and nobody is stranded |

## 4. Proposed batch — draft `CURRENT_BATCH.md`

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
13. **Manual browser check (Sam, TEST SAVE page):** fingerprint before and after loading the new build, unchanged; normal play unchanged. *Marked NOT RUN until Sam performs it.*

**Authorized test edits:** none expected; if any suite needs one, stop and list it.

**Required verification.** Targeted: the new suite. Regressions: all suites; r1 ×20 frozen; sim-clock-rng ×5; differential with the switch off vs pre-JD1a. Report each check as automated / manual / NOT RUN. Closing line: `JD1a FIRST DISPLACEMENT: CLOSED` / `NOT CLOSED`.

**Handoff to JD1b.** JD1b calls `jesterMeet(weaponId)` for the meeting and `jesterChooseOwedWeapon(weaponId)` for an owed weapon, and turns the switch on for players.

**Explicitly out.** The scene and dialogue (JD1b) · turning the switch on for players · the tutorial skip flag and warning · later Jester camps · weapon XP · any link to the standing policy · Fort quest changes beyond accepting the story kit.
