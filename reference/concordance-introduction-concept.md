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
| Gloves (disguise) | 6% `[PROPOSED]` | Gloves | Disguise gear | `[OPEN]` improvised tier (CI19) | Concordance, disguise |
| Boots (disguise) | 6% `[PROPOSED]` | Boots | Disguise gear | `[OPEN]` improvised tier (CI19) | Concordance, disguise |
| Hood | 5% `[PROPOSED]` | Helmet | Disguise gear | `[OPEN]` improvised tier (CI19) | Concordance, disguise |
| Legs piece | 5% `[PROPOSED]` | Legs | Disguise gear | `[OPEN]` improvised tier (CI19) | Concordance, disguise |
| Chest piece | 3% `[PROPOSED]` | Body Armor | Disguise gear | `[OPEN]` improvised tier (CI19) | Concordance, disguise; separate from the hazmat suit (CI25) |

All five carry the drop-source tag "Concordance survey team". The rarity names must match the tiers in code (W-3 check).

**Oct 26 late evening additions (Sam, Addenda 11g, 11h):** the five disguise pieces above join the table `[DECIDED]`; their rates are `[PROPOSED]` starting values and the audit sets the final ones. They carry the same drop-source tag.
- **Conflict `[OPEN]` (for Sam):** the table header says "values kept as set" with **25% total** (also quoted in CI6). The added pieces raise the total to about **50%**. Addendum 11g leaves this to the audit; Sam to confirm the total is allowed to change.
- **Conflict `[OPEN]` (for Sam):** CI19 (Addendum 11) puts Concordance gear on the **improvised tier and durability**, but this table gives the original five rarities Uncommon to Legendary and calls the field scanner "the strongest of the five". Does CI19 cover all Concordance items (dart gun, field scanner, sample case) or only the wearable pieces (respirator, hazmat suit, disguise pieces)?

## 2b. Concordance disguise (Sam, Oct 26 late evening, Addenda 11–11i)

| # | Rule | Tag | Why |
|---|---|---|---|
| CI19 | **Concordance gear = improvised tier.** Concordance items keep their own names but sit on the **same tier and durability** as improvised gear (BIOME-01 base-tier counters). Their value is the disguise, not stats. Supersedes Addendum 10's reading that put Concordance gear above improvised. What sits above improvised is `[OPEN]` | `[DECIDED Oct 26, Sam]` | Disguise is the reason to wear them |
| CI20 | **Disguise:** wearing Concordance pieces lets the survivor enter a Concordance fort or POI undetected. Each piece lowers the chance of being discovered; no full-set requirement; with no pieces detection is certain; a full set leaves 5% (never fully safe). Reductions (data table): respirator (Mask) 25% · chest piece (Body Armor) 20% · hood (Helmet) 15% · legs piece (Legs) 15% · gloves 10% · boots 10% | Rule `[DECIDED Oct 26, Sam]`; values `[PROPOSED]` | Partial sets still help; never a guaranteed safe entry |
| CI21 | **Discovered in disguise:** Concordance standing drops and the survivor is **thrown out of the POI**. Standing loss −50 (the per-event cap, spec 4.2). Being thrown out never blocks a later retry | Rule `[DECIDED Oct 26, Sam]`; −50 `[PROPOSED]` | No dead ends |
| CI22 | **Thrown out to an adjacent Traversal square.** A passable, unlocked neighbour chosen deterministically from the seed `[PROPOSED]`. The move does **not** count against the daily movement cap (`trav-01-traversal-slice.md` TRAV-02e, like TRAV-02b) | `[DECIDED Oct 26, Sam]` (Addenda 11c, 11d) | A spent cap must never strand the survivor |
| CI23 | **Stripped of faction gear:** when discovered, the survivor loses every **equipped Concordance (faction) piece**, then is thrown out (CI22) with the standing loss (CI21). A **deliberate exception** to "equipped gear is never lost" (spec 13.8 Batch 3B note; 15.3), for this case only. Story items are never stripped; non-faction gear is kept | `[DECIDED Oct 26, Sam]` (Addendum 11e) | Sneaking into a faction base should cost something |
| CI24 | **Disguise piece sources:** hood, chest piece, legs piece, gloves and boots drop from Concordance survey teams via CI14 (§2a) | `[DECIDED Oct 26, Sam]`; rates `[PROPOSED]` (Addendum 11g) | Reuses the existing drop table |
| CI25 | **Chest piece and hazmat suit are separate items,** both Body Armor: the survivor wears one or the other, a deliberate trade-off between disguise and radiation protection | `[DECIDED Oct 26, Sam]` (Addendum 11h) | A real choice per trip |
| CI26 | **Actions inside, undetected:** (1) **Loot their stores**: better medical and tech supplies than elsewhere; (2) **Steal research**: notes that advance the Concordance story (the Sealed Crate thread, Fort brief 12.2); (3) **Listen in**: learn where survey teams will be (avoid or ambush them; ties to CI16). Each action makes a fresh detection roll at the disguise's current chance `[PROPOSED]`, so staying longer is riskier; discovery follows CI21–CI23. Player decisions made in person, with a timer and a default of leaving (rules §4.5) | Actions `[DECIDED Oct 26, Sam]`; per-action roll `[PROPOSED]` (Addendum 11i) | Attention goes to a moment that deserves it |

**Prisoner quest** `[PARKED]` (Addendum 11f): a harsher capture version is parked in `parked/prisoner-quest-concept.md`. CI21–CI23 are the light version.

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
- `[OPEN]` CI14 total chance with the disguise pieces (25% → about 50%), and the final piece rates (audit).
- `[OPEN]` CI19 scope: all Concordance items, or only the wearable pieces? What sits above improvised?
- `[OPEN]` CI26 loot tables, research items, and how intel is shown; numbers to the audit.
- `[OPEN]` Does disguise work for other factions' forts later (same pattern)?
