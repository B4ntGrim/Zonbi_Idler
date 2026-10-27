# Zed Idler — Parked Design Items

Items deliberately deferred from a batch. Each row names where it came from
and which future slice owns it. Remove a row only when its slice decides it.

| Item | Source | Destination slice | Notes |
|---|---|---|---|
| Automatic withdrawal when overloaded | 3A | Retreat Rules | Built in R1 (load rule, 115% default) — confirm and remove |
| "Pack heavy: bank and return?" prompt for an attending player | 3A | Retreat Rules | Built in R1 (HOLD prompt, 20 s, watching only) — confirm and remove |
| Overnight overloaded run keeps fighting at ×1.15 stress and leaves loot behind | 3A | Retreat Rules | Addressed in R1 (r1 check 27: withdraws at 115%, banks, redeploys) — confirm and remove |
| Return-resource reserve | 3A | Retreat Rules | |
| Voluntary Stress withdrawal may create more recovery downtime than Breaking; compare safe-path vs failure-path costs during R1 tuning so intentional Breaking does not become the optimal strategy | R1 | Retreat Rules (tuning) | Balance item, not an R1 requirement. Stress 85 → <50 at −20/day ≈ 42 h; Breaking 60 → <50 at Bedroll ≈ 12 h |
| Repeated-Breaking and recovery spiral (resume checks HP, not stress) | 3B | Retreat Rules | Addressed in R1 (resume needs HP ≥ 80% AND stress < 70 since PF1, Oct 16; Shaken floor 80 keeps a Breaking in Base rest; r1 check 22) — confirm and remove |
| Dangerous / emergency Forced Retreat travel | 3B | Retreat Rules | Forced Retreat returns to Base immediately for now |
| Approximate value in the "left behind (too heavy)" report row | 3A | Retreat Rules | Count only for now; value becomes useful when the return report is redesigned |
| Dropping or abandoning haul in the field | 3A | Resource Priorities | |
| Resource Priorities and automatic item replacement | 3A | Resource Priorities | |
| Difficulty scaling of the overload multiplier | 3A | Difficulty | Uses Normal ×1.15 in every mode until then |
| Hard-mode minimum Forced Retreat loss floor | 3B | Difficulty | Zero loss at effective Scavenging 50+ is intended on Normal |
| Hard-mode carried-item loss on Forced Retreat | 3B | Difficulty | Spec 15.3 |
| Carrier recipes and final carrier balance | 3A | Carrying (later) | |
| Rig slot, Med/Stim quick slots | 3A | Carrying (later) | |
| Shop, Scheduling | 3A | Later | |
| Church, Workshop, Horde Ground and other points of interest | Oct 3 briefs | Later | Briefs exist; not scheduled |
| Water POI (fishing, 0–3 cells per grid) | Sam amendments | Water POI | Spec in `reference/poi-framework-v1-brief.md`. Blocked until R1 CLOSED and HP drain bug fixed |
| The Sunken Blade [PARKED]: one-time, world-unique Easter egg. ~~After [PROPOSED: 50] water visits or fishing attempts, a pull triggers a terminal-style dialogue scene granting a unique rusted claymore that must be restored before use.~~ **Trigger superseded Oct 27 (Sam):** 10 fishing spots → the Lady of the Lake → gift five legendary fish → quest → pond scene (`reference/parked/fish-01-fishing-concept.md` §5). Without the Broken Crown the blade is the unique rusted claymore that must be restored; wearing the crown it comes out unbroken at a quality tier. Two independent bonuses [DECIDED Oct 16, Sam]: (1) unique passive "Godly Strike", a chance to instantly kill a target (separate from headshots; not on bosses by itself); (2) set bonus with its set-piece gauntlets (Gloves slot): Godly Strike also works on bosses. Gauntlets' name and how they're obtained [OPEN] | Water Amendment 2 | Water POI (post-v1) | Blocked on: basic fishing shipped AND gear/weapon metrics defined. Exact stats wait for gear/weapon metrics. ~~OPEN: does the scene offer a real choice (draw it / leave it)?~~ Decided Oct 27: draw it or leave it; a left blade waits at that pond as a Traversal action. Not in Water v1 scope |
| Gear/weapon metrics | Water Amendment 2, Headshots concept | Gear/weapons (later) | Not yet defined. Blocks the Sunken Blade stats and headshot numbers |
| Armor types and damage types [CONCEPT] (Sam, Oct 16) | Sam, Oct 16 | Gear/weapons (later) | Different armor types and damage types, from weapons and from opponents. Intended way armored or helmeted zombies resist headshots. Types and interactions [OPEN]. Concept in `reference/parked/armor-damage-types-concept.md`. Not in any current batch |
| Shoulder slot (pauldrons) [CONCEPT] (Sam, Oct 16) | Sam, Oct 16 | Gear/weapons (later) | New paperdoll slot in the armor group for items such as pauldrons. Also to consider [OPEN]: an abstract placeholder item for gear from parked concepts. Needs a loadout save migration when built. Concept in `reference/parked/shoulder-slot-concept.md`. Not in any current batch |
| Headshot numbers — blocked on gear/weapon metrics | Headshots concept | Gear/weapons (later) | [DECIDED Oct 16, Sam] Headshot = instant kill: the enemy dies on that strike whatever HP is left, so headshots shorten fights (replaces "crit on the killing blow"). [DECIDED Oct 16, Sam] separate headshot roll on each strike, not the crit roll. Quiet-kill effect [DECIDED]: reduces stress gained from that encounter; no change to follow-up encounter rates. Parked: headshot chance per strike, skill scaling, weapon and zombie modifiers (high-tier/armored/boss types need a low or zero chance), wear/stress reductions. Codex figure needs a per-type headshot counter (not yet built). Concept in `reference/parked/headshots-concept.md`. Not in any current batch |
| Bed tiers (Cot, Bunk, Proper bed) for Base rest stress recovery | R1 addendum | Base / Comfort (later) | `restBed()` always returns Bedroll (−20/day) until built; Base rest picks tiers up through `restBed()` with no R1 change. Spec 13.8 |
