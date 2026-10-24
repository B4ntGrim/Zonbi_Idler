# BALANCE-03 — Idle source: S0 (settled) and I1/I2 (proposed camp worker); solo Scavenging proposal (Oct 18)

**Status:** simulation and proposal only. No production code, UI or real save changed.

**Clock:** every "per day" below is a **real day** (24 real hours). Game hours appear only where stated. The Jester's stay of 3–5 game days (7.2–12 real minutes) is **flagged for a separate timing decision** and is unchanged here.

## 1. Who recycles (confirmed before labelling)
- In a survival (solo) save the only recycler operator offered is **"The Wanderer" (Solo Survivor)**. Camp survivors appear only in camp mode (`availableRecyclerOperators`, `economy.js:288`).
- So in survival mode recycling is **survivor-operated**, and per Sam's Oct 18 rule it **pauses Wandering**.
- Duration uses the existing rule: item weight × 14 s ÷ speed 1.0, in **real seconds**.
- Independent base recycling (a camp worker or facility) would run in parallel; it is not modelled here.

## 2. Settled baseline S0 (survival mode)
**Settled rules in S0:**
- square-difficulty tiers with warned threats;
- near-death 1 / 1 / 3;
- full-Downing top-up 5 (Forced Retreat only);
- Option C 40/30 + rule 5;
- no free charges;
- Medkit recipe; all Medkits in pockets; quest kit pocket-free;
- scripted intro (Downed at 1 HP, meeting immediately, no stress, pouch first);
- skipper pouch;
- loot failure damage;
- crafting pauses Wandering;
- **Forced Retreat moves the survivor home instantly** (new);
- **survivor-operated recycling pauses Wandering** (new).

**Player choices** (disclosed): the player acts at each 8-real-hour return; it sends the survivor back to its frontier, then one new adjacent square, loots it, and crafts and loads at home.

**Matched seeds:** 101–505 × 7 real days. All runs OK; 0 Breakings.

| Per real day | S0 tutorial | S0 skipper |
|---|---|---|
| **Recurring full Downings** | 5.6 ±0.5 | 6.0 ±0.2 |
| Intro Downing (separate) | 1 | — |
| Rescues | 0.3 | 0.1 |
| **Field time** | 1.3% | 1.1% |
| Distance | 0.49 km | 0.34 km |
| Encounters | 47 | 39 |
| Rest h (stress-only) | 23.7 (20.9) | 23.7 (21.0) |
| Forced Retreats sent home | 5.6 | 6.1 |
| Squares looted / loot HP lost | 3.0 / 50 | 3.0 / 50 |
| Cloth / Medical from loot | 7.0 / 6.5 | 7.0 / 6.5 |
| Metal from recycling | 223 | 178 |
| **Survivor time: recycling / travel / crafting** | 16.5 min / 19.7 min / 5 s | 13.3 min / 22.7 min / 5 s |
| Skipper pouch made (real day) | — | 1.1 |
| Medkits crafted | 1.57 | 1.49 |
| Charges used / wasted | 3.0 / 0.17 | 2.5 / 0.17 |
| Downings per km / per 100 encounters | 11.3 / 11.8 | 18.0 / 15.4 |
| Stress: near-death / walking / ventures; Bedroll | 27.1 / 0.7 / 1.7; 19.7 | 26.8 / 0.5 / 1.8; 19.8 |

**Finding (settled-rule consequence): returning home after every Forced Retreat raised recurring Downings** (3.8 in B2 → 5.6).
- Between the player's 8-hour returns, the survivor now resumes Wandering on its **home square** (cleared ground: lower walking stress, near-death steps still +). So it makes more short trips there and is Downed more often, with fewer km.
- Frontier progress happens only at player returns.
- This makes **Downings per km** jump (3.9 → 11.3).
- A rule question follows (Q2 below): should the survivor resume toward the frontier automatically after a Forced Retreat and rest?

## 3. Proposed I1/I2 (camp mode only, one roster worker)
**Proposed values:**
- Scavenge Detail as a material job: **0.25 Cloth + 0.125 Medical per real hour** (I2 is ×2);
- same online and offline, 24-real-hour cap per absence (approved for simulation only);
- **unlock after 5 squares looted (proposed)**, which happened at real day 1.67 in every run.

**Labelled proposed:** camp-mode staffing; the harness itself runs a survival save.

| Per real day | S0 tutorial | **I1** tutorial | I2 tutorial | S0 skipper | **I1** skipper | I2 skipper |
|---|---|---|---|---|---|---|
| Cloth / Medical from the job (7-day average incl. pre-unlock) | 0 / 0 | 4.6 / 2.3 | 9.1 / 4.6 | 0 / 0 | 4.6 / 2.3 | 9.1 / 4.6 |
| Medkits crafted | 1.57 | **2.70** | 3.84 | 1.49 | **2.63** | 3.77 |
| Charges used / wasted | 3.0 / 0.17 | 5.1 / 0.45 | 7.0 / 0.56 | 2.5 / 0.17 | 3.8 / 0.31 | 4.5 / 0.40 |
| Medkits left in stash at day 7 | 0.4 | 0.8 | 2.3 | 1.6 | 5.0 | **10.8** (1 pocket) |
| Recurring full Downings | 5.6 | 5.7 | 5.7 | 6.0 | 5.6 | 5.9 |
| Rescues | 0.3 | 0.3 | 0.4 | 0.1 | 0.1 | 0.1 |
| Field time | 1.3% | 1.5% | 1.6% | 1.1% | 1.2% | 1.3% |

**Finding:** the worker raises Medkit supply by about 70% (I1) or 145% (I2), and charges used rise to match. But **recurring Downings and field time barely move**.
- Most charges are threshold heals that extend trips (more encounters); rescues stay rare.
- Stress (near-death steps about 26–27 a day against the Bedroll's 20) still gates rest at about 21 stress-only hours a day.
- **Skippers are pocket-limited** (1 pocket): extra supply piles up in the stash.

## 4. Proposal: solo Scavenging activity (not tested) `[PROPOSED]`
| Field | Proposal | Why |
|---|---|---|
| What | A survivor activity the player selects, **"Scavenge"**, for a chosen number of real hours or "until cancelled" | Gives solo players an idle material source without a roster |
| Where | The home square or an active camp (safe, cleared ground) | No combat on safe ground; reuses the base/camp location rule |
| Effect on Wandering | **Pauses Wandering**, like crafting and survivor recycling. No encounters, no walking stress, no scroll progress | Sam's rule: one survivor activity at a time |
| Yield | **0.25 Cloth + 0.125 Medical per real hour**, the same as one worker (definition B); same online and offline; 24-real-hour cap per absence | One unit across the design. 24 real hours = 1.5 Medkits |
| Unlock | After 5 Traversal squares looted (proposed) | Bootstrap → idle |
| Rest | **Rest comes first:** scavenging time counts only when the survivor is not resting for HP or stress. It does not recover HP or stress | Otherwise it would be free during the survivor's ~23 rest hours |
| End | At the chosen duration, on cancel, or if the material store is full. Then the previous activity resumes, with a one-line notice | Nothing waits on the player |

**Trade-off it creates:** each hour scavenging is an hour not Wandering (no km, kills, XP or new squares), against about 1/16 of a Medkit's materials.

**Open before testing:**
- **(a)** Confirm "rest first, no overlap". If scavenging may run during rest, it becomes nearly free.
- **(b)** Is the same yield as a worker right, or should the survivor scavenge faster (it's active) or slower?

**Test plan once approved (simulation only):**
- **SC1:** S0 + Scavenge for 2 real hours after each return.
- **SC2:** Scavenge for 6 real hours after each return.
- Report the same table, plus time lost from Wandering.

## 5. Decisions for Sam
1. **Solo Scavenging:** approve the proposal in §4 (with the rest-first rule and the yield) for testing?
2. **After a Forced Retreat and rest:** should the survivor automatically head back toward its frontier (or the last player-chosen square), or Wander at home until the player redirects it? (S0's Downing rise comes from this.)
3. **Jester stay timing** (flagged, separate decision): 3–5 game days = 7.2–12 real minutes.
4. **DC-1** (camp-job clock) logged separately: `defect-camp-schedule-clock-oct18.md`.
