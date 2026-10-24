# BALANCE-03 — Round 7 Phase B2: travel, crafting activity, loot damage, skipper pouch (Oct 18)

**Status:** simulation and proposal only. No production code, UI or real save changed.

## 1. Decisions recorded (Sam, Oct 18) `[DECIDED Oct 18]`
- **Early craftable pouch approved:** 1 pocket; 3 Cloth + 4 Metal; 1 game hour. Distinct from the Jester's 2-pocket pouch.
- **The Jester camp counts as a camp for loading pockets** (no other base facilities).
- **Pouch-first reward delivery with shared capacity checks** approved.
- **"Place, else stash, else hold" stays `[PROPOSED]`**, with these requirements:
  - held rewards persist across reloads;
  - they stay claimable after a temporary giver leaves;
  - retries never equip gear unexpectedly.

## 2. Verified facts
**"Chest pouch":**
- No item by that name exists in code or design docs.
- The Jester's pouch is **`handmade_pouch` "Handmade Pouch"**, delivered to the **Pack (`backpack`) slot** (`Jester.TABLE.equip`).
- It allows Pack or Belt (carrier table, `items.js:547`), gives **2 pockets** and +5 kg capacity.
- No item change proposed.

**Scavenge Detail (the proposed idle source):**
- Today it is a camp schedule job (`camp.js:12`): no structure requirement, Scavenging XP 35 per hour, assigned to roster survivors.
- It uses the real clock (`Date.now`), not the game clock.
- It has **no material yield and no unlock threshold**. The "5 squares looted" unlock and "1 Cloth + 0.5 Medical per game hour" were my proposals, not code facts, and are not approved.
- **So the idle-source stage cannot run on settled rules** (blocker 1).

**Forced-retreat "return to base":**
- The spec says a Forced Retreat returns the survivor to base; the code rests the survivor "at base" (`restAt: 'base'`) but **does not move the Traversal position home**.
- Loading pockets checks the Traversal position (`atBaseOrCamp`), so a survivor resting "at base" after a Downing still can't load (blocker 2).

**Other facts:**
- **Jester camp lifetime:** 3–5 game days, about 7–12 real minutes at the current clock (`Jester.TABLE.dayMs`). The camp-loading window is short.
- **Metal is plentiful:** banked kill salvage recycles to Metal (`toRecyclerItem`), about 170–300 a day here. The pouch's Metal cost is never the constraint; Cloth is.

## 3. Simulation model (settled rules plus disclosed player choices)
**Rules:**
- square-difficulty tiers with warned threats;
- near-death 1 / 1 / 3;
- full-Downing top-up 5 (Forced Retreat only);
- Option C 40/30 + rule 5;
- no free charges;
- Medkit recipe; all Medkits use pockets;
- quest kit pocket-free;
- scripted intro for tutorial starts (Downed at 1 HP, meeting immediately, no stress, pouch first).

**Player choices:**
- **Cadence:** the player acts at each return (8 h; a 24 h variant shows cadence sensitivity).
- **Exploring:** at each return the player sends the survivor to one new adjacent square and loots it once.
  - **New squares per day therefore follow from player cadence** (3 a day at 8 h, 1 a day at 24 h), not from travel speed.
  - Travel itself is fast: 30 s per square, the existing Change Route step.
- **Loot failure:** applies its HP damage, floored at 1 HP, never Downs (U26).
- **Crafting trip:** if a craft or load is possible, the survivor walks home (or to the Jester camp while it stands), crafts, loads pockets and walks back.
  - Travel and crafting time are applied as Wandering pauses (no progress).
  - Walking stress is charged for the round trip.
  - Encounters during those minutes are not simulated.
- **Recycling:** banked salvage is recycled at each return. This is an existing parallel job; whether it should also pause Wandering is undecided (C13).
- **Skipper:** crafts the Scrap Belt Pouch first (Belt slot), then Medkits. Tutorial survivors don't craft it.

## 4. Results (per day, mean ±SD; matched seeds 101–505 × 7 days; all 80 runs OK; 0 Breakings)
| | B2 tutorial | B2 skipper | B2 + EN3 ×2 tutorial | B2 + EN3 ×2 skipper | 24 h cadence tutorial | 24 h + EN3 ×2 tutorial |
|---|---|---|---|---|---|---|
| **Recurring full Downings** | 3.8 ±0.6 | 4.6 ±0.4 | **2.8 ±0.4** | 3.3 ±0.3 | 2.9 | **1.6** |
| Intro Downing (separate) | 1 | — | 1 | — | 1 | 1 |
| Rescues | 0.7 | 0.6 | 0.6 | 0.6 | 0.0 | 0.0 |
| **Field time** | 1.0% | 0.7% | 2.3% | 1.5% | 1.1% | 2.9% |
| Distance (km) | 0.69 | 0.41 | 3.76 | 2.24 | 1.05 | 5.76 |
| Rest h (stress-only) | 23.8 (20.9) | 23.8 (21.3) | 23.5 (21.0) | 23.6 (21.2) | 23.7 (20.3) | 23.3 (20.5) |
| New squares looted | 3.0 | 3.0 | 3.0 | 3.0 | 1.0 | 1.0 |
| Loot failures / HP lost | 1.7 / 46 | 1.7 / 50 | 1.6 / 42 | 1.7 / 50 | 0.4 / 7 | 0.4 / 7 |
| Cloth / Medical gained | 6.5 / 6.0 | 7.0 / 6.5 | 6.3 / 6.0 | 7.0 / 6.5 | 1.3 / 2.4 | 1.3 / 2.4 |
| Home trips / travel | 1.0 / 10 min | 1.3 / 16 min | 1.0 / 10 min | 1.3 / 16 min | 0.2 / 1 min | 0.2 / 1 min |
| Crafting time | 4.5 s | 5.3 s | 4.5 s | 5.3 s | 0.8 s | 0.8 s |
| Skipper pouch made (day) | — | **0.8** (all runs) | — | 0.8 | — | — |
| **Medkits crafted** | 1.51 | 1.49 | 1.51 | 1.49 | 0.26 | 0.26 |
| Medkits loaded (whole run) / blocked by pockets | 10.2 / 1.8 | 8.4 / 4.2 | 9.9 / 1.9 | 8.6 / 4.4 | 1.8 / 0 | 1.8 / 0 |
| Charges used / wasted | 2.9 / 0.2 | 2.3 / 0.3 | 2.8 / 0.2 | 2.5 / 0.3 | 0.5 / 0.0 | 0.5 / 0.0 |
| Downings per km / per 100 encounters | 5.6 / 8.4 | 11.4 / 15.5 | **0.7** / 8.9 | 1.5 / 14.8 | 2.7 / 4.8 | **0.3** / 4.2 |
| Stress: near-death / walking / ventures; Bedroll | 26.4 / 2.0 / 1.1; 19.8 | 26.4 / 1.5 / 0.7; 19.9 | 20.2 / 3.5 / 6.5; 19.5 | 22.8 / 2.6 / 3.4; 19.7 | 28.3 / 1.2 / 1.2; 19.7 | 19.9 / 2.8 / 8.7; 19.4 |

Skipper 24 h variants (Downings · field time): 3.7 · 0.8%, and 2.4 · 1.9% with EN3 ×2.

**Findings:**
1. **The skipper pouch arrives early** (day 0.8, every run), because Metal is plentiful and only 3 Cloth is needed. After that the skipper carries 1 Medkit and uses about 2.3–2.5 charges a day, but still has more Downings than tutorial survivors (4.6 vs 3.8).
2. **Travel to load is cheap** (10–16 min a day, 1–1.3 trips). **Crafting time is negligible** (5 s a day) at the current clock.
3. **Loot failures cost about 45–50 HP a day** at 3 squares a day. This raised recurring Downings by about 0.5 against B0.
4. **Supply depends on player cadence.**
   - 3 new squares a day gives about 1.5 Medkits a day; 1 square a day gives 0.26.
   - Neither is sustainable; it ends when nearby squares are looted. This is the bootstrap only.
5. **Field time stays at 1–3% in every setup:** stress still gates rest (about 21 h stress-only).
6. **Encounter spacing plus a slower player cadence reaches the accepted Downing level** (1.6 recurring, tutorial survivors), but with almost no Medkit supply.

## 5. Held-reward handling and deadlock check
**Persistence (proposed):**
- Held rewards live in a **save-level pending-rewards record** (not the giver's camp record).
- It persists across reloads and stays claimable at base, or at any camp, after a temporary giver (the Jester, about 7–12 real minutes) has left.

**Retries (proposed):**
- Automatic retries **only carry or stash; they never equip**.
- Equipment that misses its empty slot goes to the stash, which always succeeds in code, so equipment is never held.

**Deadlock check:**

| Required item | Can it be held? | Deadlock? |
|---|---|---|
| Fort-bound Med Kit (Fort quest) | Only if its 1 kg would push the load past the 125% hard limit (pocket-free, but weight counts wherever it is stored) | **No hard deadlock.** The player frees weight by stashing carried items or unequipping at base or camp. The Fort also accepts an ordinary Medkit (JD1a B2) and keeps the diplomat and command checks open (tutorial spec Beat 6) |
| Weapon, jacket, pouch | No: an empty slot, else the stash | No |
| Scout kit, rations | Pocket if free, else the stash | No |

**Theoretical deadlock:** only if story items alone exceed the hard limit (base 15 kg × 1.25 = 18.75 kg). Not reachable early: the Fort kit is 1 kg.

## 6. Remaining blockers
1. **Idle-source stage:** Scavenge Detail has no material yield or unlock in code. Approve or adjust the proposal (unlock after 5 squares looted; 1 Cloth + 0.5 Medical per game hour worked), and say who works it: the Wandering survivor or a roster member. Also, it runs on the real clock today.
2. **"At base" after a Forced Retreat:** the spec says the survivor returns to base, but the code keeps the Traversal position. Should a Forced Retreat move the survivor home? If yes, loading becomes possible after every Downing without a trip.
3. **C13, recycling:** does recycling also pause Wandering (like crafting), or stay a parallel base job?
4. **Crafting times are negligible at the current clock** (C6, carried over): accept for now or revisit.
5. **Held-reward persistence and retry rules (§5):** confirm.
