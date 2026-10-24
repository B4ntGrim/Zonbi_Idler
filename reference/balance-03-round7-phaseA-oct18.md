# BALANCE-03 — Round 7 Phase A: no healing items (Oct 18)

**Status:** simulation only. No production, UI, save or spec change. Phases B–D held until the open assumptions are settled.

## 1. Test record
- **Build:** production after BEST1 (`wandering.js dfcdfdfa41988ba5`); harness unchanged.
- **Runs:** matched seeds 101–505 × 4 starts × 7 days, ethical, returns every 8 h, traversal on. 20 runs per set.
- **Checks:** all 0 FAIL / 0 WARN; no Breakings.
- **Healing in every set:**
  - **free base charges set to 0** (scout charges unchanged);
  - **no ordinary Medkit:** no start carries one (start A forfeits the kit; the B starts get the Jester rewards, whose only med kit is the Fort-bound one);
  - **0 charges spent** in every set (verified).
- **Rules in every set** (test values):
  - square-difficulty tiers with rare warned threats;
  - near-death stress 1 / 1 / 3 at 25 / 15 / 5%;
  - full Downing tops up to 5;
  - character XP;
  - Option C 40/30 (with no items it acts as "retreat below 30%");
  - rule 5 (no encounters on the walk back).
- **First Downing:** the scripted introduction is not modelled in Phase A. The B starts use the existing H2 fixture (Jester rewards at the first 8 h return), so **every Downing here is a recurring Downing**.

**Post-kill HP recovery (healing with no item):**

| Set | Post-kill HP recovery |
|---|---|
| A0, A1, A3 | **None.** The old post-kill top-up was replaced by Option C's threshold heal, which needs an item charge |
| A2, A4 | **Yes, proposed lever:** heal after a kill = 50% of the damage that zombie dealt (538 and 1,197 HP a day) |

## 2. Results (per day, mean ±SD)
| Set | Full Downings | Field time | Distance | Encounters | Rest h (stress-only / HP) | Withdrawals | Downings per km | Downings per 100 encounters |
|---|---|---|---|---|---|---|---|---|
| **A0** decided rules only | 3.7 ±0.7 | 0.7% | 0.65 km | 36 | 23.1 (20.5 / 2.6) | 7.6 | 5.7 | 10.3 |
| A1 + stress ×¼ | 15.1 ±2.1 | 2.5% | 2.54 km | 140 | 22.6 (12.3 / 10.4) | 29.7 | 5.9 | 10.7 |
| A2 + post-kill heal | 4.0 ±0.6 | 0.9% | 1.20 km | 66 | 23.0 (20.4 / 2.6) | 8.3 | 3.4 | 6.0 |
| A3 + EN3 ×2 | 3.0 ±0.5 | 1.6% | 3.00 km | 27 | 23.0 (20.7 / 2.3) | 7.6 | 1.0 | 10.8 |
| A4 all three | 12.3 ±3.0 | 9.5% | 20.5 km | 175 | 21.1 (12.2 / 8.9) | 29.8 | 0.6 | 7.0 |

**Consumables:**
- 0 charges used;
- 0 wasted;
- 0 rescues.

**Stress per day (actual):**

| Set | Near-death (steps + full-Downing top-up) | Walking | Failed ventures | Removed by the Bedroll |
|---|---|---|---|---|
| A0 | 27.7 | 1.1 | 1.0 | 19.2 |
| A3 | 22.5 | 2.4 | 5.4 | 19.2 |
| A4 | 21.2 | 2.7 | 11.6 | 17.6 |

**By start:**
- **A0:** A 4.0 · Nail Bat 3.5 · Iron Knuckles 3.9 · Pocket Knife 3.4 full Downings.
- **A4:** 11.3–13.8, by the same order.
- Field time is within 0.4 points across starts.

## 3. Findings
1. **With no healing items, the decided rules give 3.7 full Downings a day and 0.7% field time** (A0). Rest is about 23 h, almost all of it waiting on stress.
2. **Stress ×¼ without healing is harmful.**
   - Downings rise to 12–15 a day (A1, A4), because stress no longer stops trips and every trip without a heal ends in a fight the survivor can't survive.
   - So round 6's ×¼ result depended on the free charges, as Sam expected.
3. **Encounter spacing (EN3 ×2) is the only lever that improves things without healing:** Downings 3.7 → 3.0, and Downings per km fall from 5.7 to 1.0. Field time stays low (1.6%).
4. **Post-kill recovery alone changes little** (4.0 Downings, 0.9% field time), but it halves Downings per km.
5. **No Phase A set comes near 25–50% field time** (the best is 9.5%, with 12 Downings a day). With consumable-only healing, the result depends on how many Medkits the player has (Phase B), which waits on the supply decision.

## 4. Source conflicts
**Q1 Medkit heal size (two rules for one item):**

| Path | Code | What a Medkit does |
|---|---|---|
| Kit in a pocket (simulation, Heal button, offline) | `active.js` `spendCharge` / `simHeal` / `wanderHeal` | **2 charges**; each heals the **First Aid amount**: 20% + 1.2% per level, max 75% of 100 HP (about 21 HP at level 1) |
| Item equipped in a consumable slot (watched play only) | `screens-v3.jsx` `useConsumable` | **One use, +60 HP, whole item consumed**. Item text: "+60 HP over 8s" (`items.js:58`) |

- **Conflict:** "+60" is a per-item, single-use figure; the kit rule is per charge. One Medkit is worth about 42 HP early as a kit, or 60 HP as a slot item.
- **Recommendation `[PROPOSED]`:** one rule. The Medkit is a 2-charge pocket kit, and each charge heals the First Aid amount. The slot-use path stops applying to the Medkit, and its text describes the charges.
- *Why:* the automation, the offline simulation and the Heal button already use the kit rule, and First Aid growth stays meaningful.

**Q2 Ordinary Medkit sources:**

| Source | Requirement | Missing |
|---|---|---|
| Shop "Field Medkit ×3" (`economy.js:225`) | 1,500 m lifetime distance | **No price** (every shop entry has `cost: null`); "repeatable" with no limit. Not treated as free |
| Faction contract reward (`factions.js:45`) | Escort; Diplomat 5; equipped `vest_t3` | Late game; out of the early window |
| Crafting recipe | Tutorial spec Beat 6 and Fort scene: "recipe available from the start" `[DECIDED]` | **Not in code**; no cost or time anywhere. Already flagged Oct 10 as owed before U14 ships |
| Starter kit fallback (`items.js:493`) | See Q4 | — |
| Loot / POI drops | None found | — |

**Q4 Who receives the starter-kit fallback** (`ensureStarterKit`: pouch + ordinary Medkit + scout kit, once, flag `zi_starter_kit_given`; the Medkit is skipped if `zi_fort_starter_given`):

| Save | Gets the fallback? | Code |
|---|---|---|
| New save, Jester switch **off** (today's player default) | **Yes**, at creation | `Jester.onNewSave` |
| New save, switch **on** (tests only) | **No.** Gets the Jester rewards instead (no ordinary Medkit) | `onNewSave` |
| Legacy save (no `zi_jester` record) | **Yes**, once on load | `Jester.onLoad` |
| Ineligible / exempt save | **Yes**, once on load | `onLoad` |
| Eligible save loaded with the switch off before the trade (B5) | **Yes**, once | `Jester.fallback` |
| Tutorial skipper | **No code path yet** (no skip flag in code); H2 models it by marking the kit as given with no items | H2 fixture |

The fallback stays unchanged, per Sam (consumable, one-time).

**Q7 Tutorial skipper vs legacy save:**

| Group | Settled rule (quoted) | Source |
|---|---|---|
| Tutorial skipper | U14 `[DECIDED, refined]`: "Skipping the tutorial is allowed. The skip button warns: *'You will not have access to an early, easy start.'* A skipper does not get the Jester's kit." U23 `[DECIDED Oct 10]`: "A player who skipped meets the Jester later, without the kit, for the story-correction role." Proposed: "when a skipper meets the Jester, he hands over the quest med kit only" | `elder-jester-concept.md` §1 and §7 |
| Legacy save (made before the Jester rules) | JD1a S1 `[DECIDED Oct 13]`: legacy saves "skip the whole first meeting and meet the Jester later. A legacy save that never received its starter kit gets it once on load." | `jd1a-batch-draft.md` §1 |

They differ: a skipper gets no starter kit and only the quest kit later; a legacy save keeps (or receives once) the old starter kit, including an ordinary Medkit. **Code gap:** a skipper and a legacy save are not distinguishable in code today; there is no skip flag.

**Other conflict found:** `tutorial-first-session-spec.md` §3.2 still lists:
- the kit as "granted at save creation `[DECIDED Oct 1]`";
- "Med kit in pocket 1; holds 2 heal charges";
- "Base charges: small daily heal and scout charges".

These conflict with U22/U30 (nothing granted before the first Downing), U21 (the first med kit is the quest kit) and today's consumable-only proposal. Not edited.

## 5. Proposals for review
**Q3 Scripted introductory encounter `[PROPOSED]`:**
- **Trigger:** the first Wandering encounter after the tutorial's Wandering pages, on an eligible save that hasn't met the Jester, while the player is watching (the tutorial is in progress).
- **Opponent:** one fixed scripted enemy (a named intro zombie defined in data, not drawn from the pool).
- **Outcome is fixed, not rolled:**
  - the survivor lands a few hits;
  - HP falls to exactly 1, which is Downed under U5 (the minimum-1-HP rule holds);
  - no heal or revive is attempted (the survivor has no ordinary Medkit then).
- **Then:** the existing first-Downing path (`Jester.firstDowning`) → blackout → the Jester scene plays **immediately**. There is no wait for the next return, because the player is present.
- **Fallback:** the S4/U38a wait ("Wandering pauses until the player returns") applies only if the player leaves before the scene plays.
- **Rewards:** granted in order with the pouch first, then the jacket, weapon choice, scout kit, 2 rations and the Fort-bound Med Kit (Q5, settled).
- **Inventory:** under normal inventory rules. **Code note:** `Jester._place` adds carried rewards directly with no pocket check, so it bypasses capacity today.
- **Balance separation:** reported as the intro Downing, never counted in daily Downings.
- *Why:* the introduction never depends on chance (pillar), and no ordinary combat number changes to produce it.

**Q6 Intro cost (current behaviour vs proposal):**

| Penalty | Today's code with the switch on | Proposed for the intro |
|---|---|---|
| Full-Downing +5 stress | Not in production (it is a test model); the test model would apply it (counts as a Forced Retreat) | **None** (Sam) |
| Near-death stress | Production: +5 once if HP went below 25% before the fight; test scale 1 / 1 / 3 | **None** for the scripted fight `[PROPOSED]` |
| Haul and carried items | **Taken by the Jester's trade** (S2: run haul + carried, never equipped, stash or story items) | Unchanged (settled S2). Early in the tutorial this is usually little |
| Rest | Rests at the Jester's camp until HP ≥ 80% and stress < 70 | Unchanged |
| Moved | To the camp square (U31) | Unchanged |
| Gear wear, injury, XP loss | None found | — |

## 6. Remaining decisions for Sam
1. **Q1:** adopt one Medkit rule (recommended: 2 charges × the First Aid amount; drop the +60 slot use for the Medkit)?
2. **Q2:** the early ordinary-Medkit source for Phase B. A crafting recipe (owed by the tutorial spec; cost and time to propose), the shop pack (needs a price and a limit), or none?
3. **Q3:** approve the scripted intro encounter as proposed (fixed opponent, fixed outcome at 1 HP, scene plays immediately)?
4. **Q6:** confirm no stress at all from the scripted fight (not only no +5)? The Jester's trade (S2) stays.
5. **Skipper flag:** a skip marker is needed so skippers and legacy saves can be told apart. Record it as needed for the tutorial batch?
6. **Encounter spacing (EN3 ×2)** is the one lever that helps without healing. Keep it in Phase B as a proposed lever?

*Recorded today:* Q5, Sam keeps the settled rewards (jacket, weapon choice, scout kit, rations) alongside the pouch and the Fort-bound Med Kit.
