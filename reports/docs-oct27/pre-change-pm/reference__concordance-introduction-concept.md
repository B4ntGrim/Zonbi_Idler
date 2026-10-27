# Concordance introduction (concept)

**Status:** Concept with decided parts (Sam, Oct 26). Not scheduled; not a build input. Follows the Sealed Crate beat (`wandering-fort-scene.md` §12.2).

## 1. Shape

| # | Rule | Tag | Why |
|---|---|---|---|
| CI1 | **Start:** begins at the Survey Point marker after the Sealed Crate beat. A Concordance survey team confronts the survivor; the crate is their stolen property | `[CONCEPT Oct 26]` | Gives the first meeting real stakes |
| CI2 | **Three exits (no dead ends):** (a) hand it back; (b) keep it and walk; (c) open it together (Diplomat check, CI4). Standing changes follow the ±50 per-event cap (spec 4.2) | `[CONCEPT Oct 26]` | First faction rivalry, event-driven (spec 4.3) |
| CI3 | **Crate contents:** medical supplies, rations, and a story item (a Concordance research log) | `[CONCEPT Oct 26]` | Medicine is what the Hearthguard wanted, so the crate ties both factions together |
| CI4 | **Open-together outcome by Diplomat:** low, crate returned with no thief penalty; mid, survivor keeps the rations; high, also keeps some medical supplies and the research log. Other modifiers (policy, scouting the team) `[OPEN]` | `[PROPOSED]` | Skill matters without gating the story |
| CI5 | **No dead end:** the research log is also reachable by another route (CI13), so core progression never rests on one skill check | `[PROPOSED, accepted by Sam]` | Pillar: never gate core progression behind randomness |
| CI6 | **Heinous:** the team will not talk. (a) Attack (Risk: HIGH): a win gives the full crate and the research log, plus a roll on the CI14 drop table (25% total; supersedes "uncommon gear drop"); the Concordance turns hostile. (b) Let them go: keep the crate; the log comes via CI13 | `[CONCEPT Oct 26]` | Heinous makes every faction hostile (spec 2.3) |
| CI7 | **Criminal:** the team may talk, but the Diplomat check is harder (CI11) | `[CONCEPT Oct 26]` | Reputation colours the meeting |

## 2. Details (Oct 26)

| # | Rule | Tag | Why |
|---|---|---|---|
| CI8 | **Seeded starting standing:** the scene is the same for every starting standing (spec 4.6). Only the team leader's tone changes: colder at Wary, more relaxed at Neutral. All exits work from any start | `[DECIDED Oct 26]` | One scene to build and test; no seed can break it |
| CI9 | **The research log is a story item** (`isStory`): no pocket, weight only, cannot be dropped or sold, never lost on a Hard-mode forced retreat until its quest ends (Fort brief 12.6, spec 14.1) | `[DECIDED Oct 26]` | Reuses the story-item rule |
| CI10 | **Crate supplies and pockets:** medical supplies and rations take pockets: a free pocket first, else the Wandering haul, then the stash when banked (same rule as fish) | `[DECIDED Oct 26]` | Nothing wasted or blocked |
| CI11 | **Diplomat tiers:** low below level 10; mid 10–19; high 20+. Criminal: +5 levels per tier (mid 15, high 25) | `[PROPOSED starting values, accepted by Sam]`; kept open in `wandering-design-audit.md` §6 for playtest | Early-game reach; Criminal pays for its reputation |
| CI12 | **Standing changes:** hand it back: Concordance +40, Hearthguard −25. Keep it and walk: Concordance −50, Hearthguard +10. Open it together: Concordance +20 at any tier. Heinous attack: Concordance −50 | `[DECIDED Oct 26, starting values]` | All within the ±50 per-event cap |
| CI13 | **Backup route:** if the survivor did not get the research log, a second survey site is marked a few game days after the first meeting `[PROPOSED 3 game days, about 72 real minutes]`, on an unlocked cell nearby, placed deterministically from the seed (like the first Fort). Entering it finds an abandoned Concordance camp with the log; guaranteed, no skill check | `[DECIDED Oct 26]` | Core progression never rests on a check or a fight |

## 2a. Gear, repeat teams and identity (Sam, Oct 26 PM)

**CI14 Survey team drop table** `[DECIDED Oct 26; values kept as set, no pity counter]`. Rolled once per win against a Concordance survey team; 25% total.

| Item | Chance per win | Slot | Category | Rarity | Tags |
|---|---|---|---|---|---|
| Respirator mask | 12% | Mask | Protective gear | Uncommon | Concordance, hazard protection |
| Sample case | 7% | Belt | Carrier (3 pockets) | Uncommon | Concordance, medical, storage |
| Hazmat suit | 4% | Body Armour | Protective gear | Rare | Concordance, hazard protection, heavy |
| Dart gun | 1.5% | Ranged | Weapon | Rare | Concordance, ranged, needs ammo, quiet |
| Field scanner | 0.5% (about 1 in 200 wins) | Trinket | Tool | Legendary | Concordance, information, scouting |

All five carry the drop-source tag "Concordance survey team". The rarity names must match the tiers in code (W-3 check).

| # | Rule | Tag | Why |
|---|---|---|---|
| CI15 | **Repeat survey teams:** after the introduction, teams join the Wandering pools as a faction NPC encounter (spec 4.4). Every defeated team rolls CI14. Friendly players may trade or pass; only hostile or Heinous players fight | `[DECIDED Oct 26]` | A one-time fight would make rare items unreachable |
| CI16 | **Frequency by distance** to the nearest Concordance fort: adjacent (1 square) about 6 a real day; near (2–4) about 2; far (5+) about 1. Before a Concordance fort exists, the far rate applies | Bands `[DECIDED Oct 26]`; rates `[PROPOSED]` | The map becomes the dial; rare items reward riskier territory |
| CI17 | **Sample case effect:** while equipped, each medical supply picked up has a 25% chance `[PROPOSED]` of one extra. Freshness may come with spoilage `[CONCEPT]` | `[DECIDED Oct 26]` | Replaces a forced-retreat protection idea that did nothing (carried items are never lost, spec 13.8 Batch 3B) |
| CI18 | **Identity:** they research the infection itself and capture the infected to study them; publicly they want a cure, privately some want control (the infected as weapons); they live in sealed labs with air filters and strict rules, and look down on "primitive" farmers like the Hearthguard | `[DECIDED Oct 26]` | Fits the hexagon, the crate's lab mark and all five items |

**Item roles** `[CONCEPT Oct 26]`: respirator and hazmat suit protect against BIOME-01 hazards (smoke, toxic ground, cold), later infection; the hazmat suit is heavy, weak against bites and replaces a vest. Dart gun `[PARKED]` until weapons Phase 6 and AMMO-12. Field scanner reads a zombie's tier and traits before a fight and speeds Codex entries; the strongest of the five.

**Pacing check** (about 2 teams a day, about 70% wins): respirator about 6 days, sample case about 10, hazmat suit about 2.5 weeks, dart gun about 7 weeks, field scanner about 5 months; faster near a fort.

## 3. Open
- `[OPEN]` CI14 item stats and weights (real-world weights, W-1).
- `[OPEN]` CI4 other modifiers (policy, scouting the team).
- `[OPEN]` Failed-check wording and the scene text (terminal style, original).
- `[OPEN]` Which Concordance gear item drops in CI6.
