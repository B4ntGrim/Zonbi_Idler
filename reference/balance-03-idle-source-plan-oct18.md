# BALANCE-03 — Idle material source: proposal and bounded test plan (Oct 18)

**Status:** proposal and plan only. Nothing run for this document. No production code, UI or real save changed.

## 1. Decisions recorded (Sam, Oct 18) `[DECIDED Oct 18]`
- The approved crafting times stay.
- **A Forced Retreat returns the survivor to base on the map,** matching the spec.
- Recycling runs in parallel **only** when a base worker or facility does it. The active survivor can't recycle and Wander at the same time.
- **Save-level held rewards** are approved: claimable after the giver leaves. Automatic retries may carry or stash (never equip), must recheck capacity, and must not duplicate rewards.

## 2. Clocks (stated for every result)
| Thing | Clock | Conversion |
|---|---|---|
| All simulation "per day" results so far (rounds 1–7) | **Real day** (harness day = 86,400,000 ms; Wandering rates are per real second/minute) | — |
| Game clock | 1 game hour = **6 real seconds** | 1 real hour = 600 game hours; 1 real day = 14,400 game hours (600 game days) |
| **Jester's departure timer** | **3–5 game days** (`Jester.TABLE.dayMs = ZI.GAME_DAY_MS`, decided Oct 16) | **7.2–12 real minutes** |
| Crafting | Game time | Medkit 30 game min = 3 real s; pouch 1 game h = 6 real s |
| Camp schedule (Scavenge Detail and every other job) | **Game hours, on the wall clock** (`Date.now`, `camp.js:44`) | See §4 |

## 3. Forced Retreat return-time rule
- **Defined:** spec §13.8 (Batch 3B, `[DECIDED Oct 6]`): a Forced Retreat "returns to Base **immediately** and begins Base rest". The return takes no travel time.
- **Code gap:** the survivor rests "at base" (`restAt: 'base'`, `active.js:547`), but the Traversal position is not moved home (only the Jester displacement moves it).
- **Next simulation:** a Forced Retreat (Downed or Breaking) moves the position to the home square **instantly**, then base rest.
- **Not changed:** a voluntary withdrawal still walks back to the last checkpoint (existing rule).

## 4. Scavenge Detail as a roster material job `[PROPOSED]`
**Today (`[CODE]`):**
- Scavenge Detail is a schedule job (`camp.js:12`): no structure needed, 1 slot, Scavenging XP **35 per game hour**.
- Settling credits elapsed **game hours** from the wall clock, capped at **24 game hours per settle** (`SCHEDULE_OFFLINE_CAP_H = 24`).

**The size problem**, using my earlier draft yield of 1 Cloth + 0.5 Medical per game hour:

| Measure | Per game hour | Per real hour | Per real (simulation) day |
|---|---|---|---|
| **A. Draft yield, game-hour clock (existing schedule code)** | 1 Cloth, 0.5 Medical (0.25 Medkit) | **600 Cloth, 300 Medical** while the page is open (storage caps of 300/150 reached in about 30 real minutes) | **Online:** storage-capped. **Offline:** at most 24 game hours (24 Cloth, 12 Medical = 6 Medkits) **per absence, however long**. In the harness (3 absences a day) that is 72 Cloth / 36 Medical = **18 Medkits a day** |
| **B. Proposed yield, real-hour clock** `[PROPOSED]` | 0.0004 Cloth, 0.0002 Medical | **0.25 Cloth, 0.125 Medical** | **6 Cloth, 3 Medical = 1.5 Medkits a day per worker** (about the bootstrap rate); offline cap **24 real hours** per absence (matches Wandering's per-return cap, FX2) |

**Recommendation `[PROPOSED]`:** definition B.
- **Real-hour clock:** yields are counted in real hours, like Wandering and skill decay.
- **One rate:** online and offline accrue at the same rate.
- **Starting yield:** 1.5 Medkits a day of materials per worker.
- **Unlock:** after 5 Traversal squares looted (bootstrap → idle).
- *Why:* option A makes a material job worth 600× more per real hour online than offline, and turns one worker into 18 Medkits a day.

**Staffing availability (`[CODE]`):**
- Schedule jobs assign roster survivors. The roster is a fixed sample list of 5 named camp survivors (`ZI.SQUAD_ROSTER`); there is no recruiting system.
- Camp survivors are offered as workers only in **camp mode**: the recycler operator list hides them otherwise (`availableRecyclerOperators`).
- A **survival-mode (solo)** save, such as the harness's `survival` slot, has **no roster member to staff the job** (blocker S1).

**Related finding (existing behaviour, flagged):** the Oct 16 clock change made **all** schedule jobs accrue in game hours.
- Every job's XP accrues 600× faster per real hour while the page is open (Scavenge Detail: 35 XP per game hour = 21,000 per real hour).
- Offline it is capped at 24 game hours (840 XP) per absence.
- This is an online/offline mismatch in settled code, not part of this proposal.

## 5. Bounded idle-source test plan
**Common to all sets:**
- matched seeds 101–505 × **7 real days**;
- ethical policy;
- the player acts at each 8-real-hour return.

**Settled rules:**
- square-difficulty tiers with warned threats;
- near-death 1 / 1 / 3;
- full-Downing top-up 5 (Forced Retreat only);
- Option C 40/30 + rule 5;
- no free charges;
- Medkit recipe; all Medkits in pockets;
- quest kit pocket-free;
- scripted intro;
- skipper pouch;
- loot failure damage;
- travel to load;
- crafting pauses Wandering;
- **Forced Retreat moves the survivor home instantly** (new);
- **recycling by the survivor pauses Wandering** (new; solo operator, existing duration rule: item weight × 14 s / speed 1.0, real seconds).

| Set | Content | Kind |
|---|---|---|
| **S0** | All settled rules above (bootstrap only) | **Settled baseline** |
| **I1** | S0 + Scavenge Detail, definition B (0.25 Cloth + 0.125 Medical per real hour, 1 worker, unlocks after 5 squares looted, offline cap 24 real h) | Proposed, separate |
| **I2** | I1 with yield ×2 | Proposed sensitivity |

**Each set reports, per real day:**
- recurring full Downings and the intro Downing separately;
- field time and distance;
- squares looted;
- materials split by source (loot, job, recycling);
- Medkits crafted, carried, used and wasted;
- survivor time spent on crafting, recycling and travel;
- day of the job unlock;
- stress by source.

**Rule:** S0 results are reported apart from I1/I2.

## 6. Blockers before I1/I2 can run
- **S1 Staffing:** a survival-mode save has no roster worker. Run I1/I2 as if one worker were available (camp-mode assumption), or define who works the job in survival mode?
- **S2 Yield clock:** approve definition B (real-hour yield, same online and offline, 24 real h cap), or keep game hours with a far smaller number?
- **S3 Existing schedule mismatch** (§4, related finding): log it as a defect candidate for a separate fix?

S0 (settled) can run now.
