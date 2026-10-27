# Zombie Idler — Wandering Tab Design Spec

**Version:** 2.1 (Oct 9): v2.0 plus Batch 1A, 1B, 3A and 3B decisions and the Oct 1 story-item and familiarity rules, merged from two diverged copies. v2.0 followed the Sep 30 consistency audit (see `wandering-design-audit.md`). Supersedes `zombie-idler-wandering-brainstorm.md`.
**Scope:** Solo Survivor first. Camp Leader is a deliberate shift of Solo Survivor and part of the base game, not paid content; solo saves must continue into it without migration loss (Section 8).
**Companion documents:** `wandering-fort-scene.md`, `tutorial-first-session-spec.md`, `zed-idler-design-lead-brief.md`.
**Status tags:** `[DECIDED]` confirmed by Sam · `[PROPOSED]` draft numbers/rules, tunable · `[OPEN]` needs a decision

**How to read this:** every rule has a *Why* line. Numbers live in tables (Section 12) so balancing means editing data, not code.

---

## 1. Core loop

The player sets a **standing policy** once, leaves for other tabs, and the survivor resolves encounters through that policy. The policy decides which encounters are rolled, how they default to resolving, which skills gain XP, and how factions react. Skills the policy does not exercise decay. Reputation with six factions shapes trade and whether an encounter becomes a fight or an evasion.

*Why:* an idler needs a reason to come back. Policy is a decision the player owns (identity), decay is a soft pressure (return), and factions are consequences (story). None of these require the player to stay on the Wandering tab.

Skills (16): combat, first aid, scavenging, stealth, athletics, endurance, foraging, smithing, medical, mechanical, discovery, trading, diplomat, logistics, engineering, command.

---

## 2. Standing policy

### 2.1 Policies `[DECIDED]`

| Policy | Availability | Identity |
|---|---|---|
| Ethical | From start | Help people, keep the peace, slow and safe |
| Immoral | From start | Self-interest, take what is left behind, no cruelty for its own sake |
| Criminal | From start | Theft, smuggling, gang conflict |
| Heinous | **Locked** until the survivor kills a guard at the first Fort (2.5) | Atrocity for maximum loot; every faction turns hostile |

Policy is stored under its own key (`zi_wander_policy`), never inside the run object. *Why:* the existing `evadeMode` flag lives in `zi_wander_run`, and `resetWanderRun()` wipes it on retreat. A standing policy must survive retreats, deaths, and restarts.

### 2.2 Policy = encounter pool + default resolution `[DECIDED, refined from Sam's answer on Criminal]`

A policy does **not** hard-wire skills. It defines which **encounter pool** is rolled. Each encounter declares which skills it checks. Skill XP is a consequence of the encounter presented.

Example (Sam's): Criminal rolls a *broken-down vehicle* → checks **mechanical**. Criminal rolls a *gang of faction members* (low odds) → checks **combat**. So Criminal feeds mechanical *and* combat, depending on what the world presents.

*Why:* this removes the "combat or mechanical?" question entirely, gives every policy variety, and makes the 16 skills reachable through situations instead of a lookup table. It also matches the fiction: a criminal does not choose to have a car break down.

**Consequence for decay `[PROPOSED]`:** a skill is *protected* by a policy only when at least one encounter in that policy's pool checks it. Protection is earned per event (each event resets that skill's clock, see 3.3). Low-weight encounters will protect their skill less reliably; tune weights so the expected gap between events for a pooled skill is well under the grace period (Section 12, `PolicyPools`).

### 2.3 Encounter pools `[PROPOSED]` (starting content; expand freely)

Weights are relative. "Faction" means a faction NPC is rolled, using 4.4.

| Policy | Encounter | Checks (primary → secondary) | Weight |
|---|---|---|---|
| Ethical | Wounded stranger | first aid → diplomat | 25 |
| Ethical | Sick settlement asks for help | medical → first aid | 15 |
| Ethical | Refugee convoy under threat | diplomat → command | 15 |
| Ethical | Fair-trade caravan | trading → diplomat | 20 |
| Ethical | Abandoned farm | foraging → discovery | 15 |
| Ethical | Zombie group | combat → stealth (evade default) | 10 |
| Immoral | Abandoned cache | scavenging → discovery | 30 |
| Immoral | Wounded stranger (ignore or loot) | stealth → scavenging | 20 |
| Immoral | Undefended field | foraging → stealth | 15 |
| Immoral | Lopsided trade | trading → diplomat | 15 |
| Immoral | Zombie group | combat → stealth | 20 |
| Criminal | Broken-down vehicle | mechanical → engineering | 20 |
| Criminal | Locked storehouse | stealth → mechanical | 20 |
| Criminal | Fence stolen goods | trading → diplomat | 20 |
| Criminal | Faction patrol or gang (low odds, 4.4) | combat → command | 10 |
| Criminal | Cache under guard | scavenging → stealth | 20 |
| Criminal | Zombie group | combat → stealth | 10 |
| Heinous | Ambush a convoy | combat → command | 30 |
| Heinous | Raid a settlement | combat → endurance | 25 |
| Heinous | Interrogate a captive | command → diplomat (intimidation) | 15 |
| Heinous | Strip the fallen | scavenging → combat | 15 |
| Heinous | Zombie group | combat → endurance | 15 |

> **Oct 26 (FOOD-01 F4) `[DECIDED]`:** orchard (apples, Foraging 5; oranges, Foraging 10) and vineyard (grapes, Foraging 12) are variants of "Abandoned farm" and "Undefended field", not new encounters. F7: the "Broken-down vehicle" encounter can roll the rare cola. See `food-01-nutrition-slice.md` §3b.

**Baseline skills** (athletics, endurance, discovery) get a small XP trickle from *every* encounter under *every* policy, and decay at half rate. `[DECIDED as a group, rates PROPOSED]`

**Base skills** (smithing, mechanical, engineering, logistics) also grow from base work: crafting, repairs, building, schedule jobs. Mechanical and engineering additionally appear in the Criminal pool above. `[PROPOSED]`

### 2.4 Command `[DECIDED]`

Command means **presence and authority**: how much the world defers to the survivor.
- Reduces hostile encounter odds and improves faction standoffs.
- Later, sets roster and squad size in Camp Leader.
- One visible **self-discipline perk** at the top of its track (for example, +1 heal charge), so the skill has a felt payoff in Solo.

*Why hybrid:* presence/authority survives the Solo → Camp Leader upgrade without redesign; the self-discipline perk gives Solo players a concrete reward.

### 2.5 The Fort and the Heinous unlock `[DECIDED]`

The Fort is now a **faction gate**, and killing a guard there is what unlocks Heinous. The full scene is in `wandering-fort-scene.md`; this section records the rules that touch the rest of the game.

**The first Fort**
- It is at a **fixed location on a Traversal square near the start**, so every player finds it early. It is part of the tutorial.
- It belongs to the **first faction: the Hearthguard** `[DECIDED, chosen by design]`.
- It is a colony of hostile human NPCs behind wooden pike fencing. They admit the survivor only if the survivor has something they want.
- The reception depends on policy and standing (Stranger, Neutral or Wary survivors can be offered a quest; Heinous is refused).

**Heinous unlock**
- **Killing a guard at the first Fort unlocks Heinous permanently** (`zi_heinous_unlocked = true`).
- It is a deliberate act inside the scene, made while the player is present. It cannot happen while away.
- Heinous is therefore not available on the first visit, so the "Heinous is refused" reception applies to later visits and other Forts.
- **No dead ends:** the Factions page opens when the quest is **turned in**, or, if the guard is killed, at once in a hostile state with the Lodge still reachable as the neutral broker (4.5). A survivor who is turned away stays locked out until they return and succeed, with the diplomat and command checks as a way in `[DECIDED]`. That is a retry loop, not a dead end, and the tutorial must make the way in clear (`tutorial-first-session-spec.md`).

**Later Forts**
- Other factions have their own Forts. They are introduced by story events and can also appear as **low-odds discoveries** on Traversal squares (start 2%, +0.25% pity step, `[PROPOSED]`).
- **A faction's Fort is rollable only after that faction has been introduced by its story event** `[PROPOSED]`, so a random discovery cannot spoil the introduction of the Concordance or any later faction.
- Later Forts are rolled only while the player is present. They follow the discovery prompt rules in 13.2.

*Why fixed and scripted for the first one:* core progression must not depend on a random roll. Randomness is for optional content; anything the player must find to move forward needs a guarantee.

### 2.6 Switching policy `[PROPOSED]`

Cooldown of 4 real hours between policy changes (Heinous → anything is exempt, so players are never trapped in it). *Why:* without a cooldown, players flip to Heinous for loot and back to Ethical before reputation lands, which defeats consequences. The exemption prevents a regret trap.

---

## 3. Skill decay and floors

### 3.1 Model `[DECIDED structure, PROPOSED numbers]`

1. **Level-scaled decay.** Higher levels lose more per day.
2. **Policy-driven protection.** Skills exercised by encounters reset their clock. Unexercised skills decay at the full rate.
3. **Rust before loss.** Efficiency drops first; XP loss starts later. The player gets a warning.

### 3.2 Numbers (all tunable, see 12.2)

| Item | Value |
|---|---|
| Daily XP loss (% of XP above the floor) | ~1% at level 1 → ~4% at level 50 (linear interpolation) |
| Grace period | L1–14: 4 days · L15–29: 3 days · L30–44: 2 days · L45–50: 1 day |
| Rusty (2 days after grace ends) | Warning shown. Effective level −5% efficiency. No XP lost |
| Rusted | Effective level −10% efficiency. XP decay begins |
| Baseline skills (athletics, endurance, discovery) | Half decay rate |
| Base skills (smithing, mechanical, engineering, logistics) | Protected by crafting, repairs, building and schedule jobs; each such action resets the clock `[PROPOSED]` |
| Absence cap | One day of decay applied on return, matching the 24 h offline cap (`ZI.SCHEDULE_OFFLINE_CAP_H`). The cap is per return and includes carried time (§9, Q2 `[DECIDED Oct 10]`) |

*Why the absence cap:* an idle game that punishes a weekend away teaches players to quit. The cap keeps decay a nudge.

### 3.3 State (new per-skill data)

```
SkillDecayState {
  skillId
  lastActiveUtc        // reset by any qualifying event
  floorXp              // highest earned floor, in XP
  floorProgress        // { tier: eventsCompleted }
}
```

Level is computed from total XP (`ZI.statLevel`), not stored, so **decay subtracts XP** and floors are stored separately.

Efficiency is applied by lowering the skill's *effective level* in existing formulas (`lootSafeChance`, `escapeChance`, and so on). No new formula system is needed.

### 3.4 Floors `[DECIDED]`

- Milestones every 10 levels (10, 20, 30, 40, 50).
- A floor is **earned by doing**: it locks only after **25 qualifying events** at or above that milestone tier (25 is `[PROPOSED]`). Reaching the level alone does not bank it.
- Decay can never take XP below the highest floor earned.

> **Q3 `[PENDING — TECHNICAL VERIFICATION]` (Oct 10):** Code reports `settleSkillDecay` can take XP below an intended floor or below zero. The rule above is the only floor rule in this spec. It does not say what the floor is before any milestone floor is earned, or how it combines with §12.2. No fix is authorized and zero is not assumed. Code returns the evidence listed in `gameplay-fix-batches-proposal.md` §4 first.

*Why earned:* a floor you get for free is just a delayed level cap on decay. Earning it means a floor represents demonstrated mastery, and it rewards players who actually use the skill, not those who only leveled it once.

### 3.5 Base rest spot `[PROPOSED]`

A rest spot in the Solo base slows decay (for example, −25% decay rate for skills exercised in base work). Keeps the base meaningful without a new screen. This is separate from the stress recovery rates by bed tier in 13.8; both come from the same rest spot, so upgrading the bed can improve both `[OPEN]` whether the decay slowdown also scales by bed tier.

---

## 4. Factions and reputation

### 4.1 Factions `[DECIDED]`

The Concordance · The Iron March · The Dustwalkers · The Hearthguard · Black Haven Collective · Hearthbound Lodge.

### 4.2 Reputation range `[PROPOSED]`

| Standing | Range | Effect |
|---|---|---|
| Hunted | −1,000 to −601 | Actively tracked; evasion much harder; more ambushes |
| Hostile | −600 to −251 | Attacks on sight; no trade |
| Wary | −250 to −1 | Overcharged; limited trade |
| Stranger → Venerated | 0 to 2,500 | Existing ranks; thresholds `[0,100,250,500,900,1500,2500]` |

- Losing standing is faster than gaining it.
- Slow forgiveness: negative standing drifts toward zero while no new offenses occur.
- No single event moves standing by more than ~50.

### 4.3 Rivalries `[DECIDED]`

**Event-driven only. No fixed rival table. No seeded per-world grudges.**

Most faction encounters involve two factions. Helping one costs standing with the other, so no player can max all six.

*Why:* seeded grudges add save-variety but multiply test cases and are hard to explain to players. Event-driven rivalry is legible ("I helped them, so these people are angry") and cheaper to build. It can be added later without breaking saves because it would only be a modifier table.

### 4.4 Faction NPC encounters

- Rolled from the pool of the active policy (Criminal example: low-odds gang fight).
- The NPC's faction and the player's standing decide the opening: friendly → trade or pass; hostile → demand or rob.
- **Fight vs evade** is decided by policy default (Ethical → evade, Heinous → fight, others per encounter), then adjusted by standing (hostile NPCs are harder to evade) and the hexagon (Section 5).

### 4.5 Neutral broker: the Lodge `[DECIDED]`

The **Hearthbound Lodge** is the safety net. A player who is hostile with everyone can still reach it.

- **Floor rule:** Lodge standing is clamped at **Wary (−250)** at worst. It never reaches Hostile or Hunted.
- The Lodge trades with anyone at a steep markup (starting +60%) `[PROPOSED]`.
- Lodge standing still moves normally *above* Wary, so it remains a real faction, not a vending machine.

*Why clamp instead of a special rule:* one clamp in one function is easy to implement and test, and the player never hits a dead end.

### 4.6 Faction access and starting reputation `[DECIDED concept, PROPOSED numbers]`

- **All six factions exist from the start.** Their starting reputations are **not equal** and depend on the **world seed**, within odds bands `[DECIDED]`.
- Proposed bands: about 60% of factions start at Stranger (0), 20% at Wary (−100 to −1), 20% at Neutral (100 to 249). No faction starts Hostile or Hunted. The Hearthguard starts between −150 and +150 so the first Fort always works.
- This replaces the fixed starting values in the code today (for example Iron March 240, Dustwalkers 90).
- The seeded starting standings are separate from rivalries (4.3), which stay event-driven with no seeded grudges.
- **The Factions page is locked until the first Fort is resolved** `[DECIDED]`. Existence and access are different things: factions exist in the world, but trade, contracts, quests and the reputation view stay hidden until the page opens. `[DECIDED]` NPCs from a locked faction appear as **unnamed groups** until the page opens. The page opens when the first Fort quest is turned in (`wandering-fort-scene.md`, Section 11).
- Add a per-save unlock flag (for example `zi_factions_unlocked`).
- Rank names in the code (`ZI.REP_RANKS` with thresholds `[0,100,250,500,900,1500,2500]`) are Stranger 0-99, Neutral 100-249, Known 250-499, Allied 500-899, Trusted 900-1,499, Honored 1,500-2,499, Venerated 2,500. "Neutral" in design talk means this rank.

*Why:* teaching six factions at once is overwhelming. Starting with one and introducing the rest through events lets the player learn the system in steps.

### 4.7 How policies move reputation `[PROPOSED]`

The earlier brainstorm had this and the spec had dropped it. Each faction encounter or site lists its own reputation change; a policy gives a **leaning** that decides which factions its typical acts help or hurt.

| Policy | Standing rises with | Standing falls with |
|---|---|---|
| Ethical | Hearthguard, Concordance, Lodge | Black Haven, Dustwalkers (slowly) |
| Immoral | Dustwalkers | Hearthguard, Lodge (slowly) |
| Criminal | Black Haven, Dustwalkers | Hearthguard, Iron March, Concordance |
| Heinous | No faction | Every faction, at once, while active |

`[OPEN]` Whether Criminal fully locks lawful factions out of trade and contracts (the brainstorm said so) or only makes them expensive. Default: expensive, not locked.

---

## 5. The faction hexagon `[DECIDED pairings]`

Six-sided strength cycle, clockwise. Each faction is strong against the next and weak against the previous. No faction dominates.

```
                 IRON MARCH
               /            \
        LODGE                  DUSTWALKERS
          |                        |
     HEARTHGUARD              BLACK HAVEN
               \            /
                CONCORDANCE

   Clockwise:  Iron March -> Dustwalkers -> Black Haven
               -> Concordance -> Hearthguard -> Lodge -> (Iron March)
   "A -> B" means A is strong against B.
```

| Faction | Strong against | Weak against |
|---|---|---|
| Iron March | Dustwalkers | Lodge |
| Dustwalkers | Black Haven | Iron March |
| Black Haven | Concordance | Dustwalkers |
| Concordance | Hearthguard | Black Haven |
| Hearthguard | Lodge | Concordance |
| Lodge | Iron March | Hearthguard |

Reasons (for lore and tooltips): Iron March's discipline runs down scattered scavengers, but its supply lines are the Lodge's to starve. Dustwalkers know every den Black Haven hides in, but cannot stand against organized troops. Black Haven's bribery undercuts Concordance research supply, but its dens are raided. Concordance tech outclasses Hearthguard tools, but contraband and sabotage cut its supply. Hearthguard self-sufficiency undercuts the Lodge's resupply trade, but it is outmatched technologically. Lodge forecasting starves marching armies, but it loses its market to local farms.

### 5.1 Mechanic `[PROPOSED]`

- **Aligned faction** = the faction with the survivor's highest standing. Ties: the most recently gained.
- Against an NPC: aligned faction strong vs NPC's → **+15%** fight/evade odds. Weak vs NPC's → **−15%**. Otherwise no change.
- Hexagon modifies odds only. Reputation is a separate lever (trade, hostility, opening). *Why separate:* "how does this NPC feel about me" and "who wins if it turns physical" are different questions. Merging them removes interesting trade-offs, such as being hated by a faction you counter easily.
- Diagonal pairs stay neutral. Optional later: shared small trade bonus.

`[OPEN]` Because the Lodge is both the broker and Weak vs Hearthguard, decide if the +/−15% applies when trading at the Lodge (default: no, only to fights/evasion).

---

## 6. Encounter flow

1. Roll encounter from active policy's pool (Section 2.3), plus Traversal-only rolls (later Forts, 2.5; the first Fort is placed, not rolled).
2. If faction NPC: pick faction, look up standing → opening (4.4).
3. Determine resolution: policy default → apply standing → apply hexagon.
4. Roll outcome with effective skill levels (rust applied).
5. Award XP via the single XP path (Section 7 #4), reset skill clocks, apply floor progress.
6. Apply reputation change (capped ±50) and loot.

---

## 7. Integration fixes (from `game-data.js` / `screens-v3.jsx` review)

| # | Finding | Fix |
|---|---|---|
| 1 | `evadeMode` lives in the run object; `resetWanderRun()` wipes it | Store policy in `zi_wander_policy` (2.1) |
| 2 | Evade differs on screen (`push` command, spends 1 of 60 daily commands) vs offline (auto roll each encounter) | One rule for both, driven by policy default |
| 3 | Two separate simulations (screen spawns every 1.4 s; `ZI.WanderEngine` every 6 s; offline ignores gear, loot always Common) | One `RollEncounter` and one `ResolveEncounter`; screen animates the result, offline runs it in bulk (Section 10) |
| 4 | XP bypasses `emitAction` (heal, scout, push, scavenging kill bonus call `addStatXp` directly); scavenging XP double-counted on kills | Route every XP grant through `ZI.emitAction`; remove direct calls; fix double count. Decay timestamps hook here |
| 5 | Offline run stalls when heals run out | Policy defines low-resource behavior: retreat to base and rest, then resume. Idle must keep idling |
| 6 | `ATHLETICS = route.athletics \|\| 6` hard-coded | Read the survivor's real athletics level (with rust) |
| 7 | Foraging, smithing, medical, mechanical, trading, diplomat, logistics, engineering never fed by wandering | Pools in 2.3 feed foraging, medical, mechanical, engineering, trading, diplomat; smithing and logistics stay base skills |
| 8 | Faction mismatch: contract faction `freeholders` is not one of six; reputation split between static `rep` and `repByFaction`; no negatives | Remap or delete `freeholders`; one reputation store (`repByFaction`); add negative tiers (4.2) |
| 9 | Decay needs new state | Add `SkillDecayState` (3.3) |

Save system: all `zi_*` keys are snapshotted, so new keys (`zi_wander_policy`, `zi_skill_decay`, `zi_heinous_unlocked`, `zi_fort_pity`) are saved automatically.

---

## 8. Camp Leader and the endgame `[DECIDED concept, OPEN details]`

Camp Leader is **not a paid expansion**. It is a deliberate shift in the concept of Solo Survivor, part of the base game.

- Wandering events are identical in both modes; Camp Leader only adds *who* goes out.
- Command's presence/authority drives roster and squad size in Camp Leader.
- Policy and reputation are per-save. In Camp Leader they become the camp's policy; keep the same keys and add a per-squad override later.
- Solo base stays thin: storage and recycler (Stockpile), crafting bench, a rest spot that slows decay. Do not build a separate base screen for Solo.

**Late-game fork (Sam, Sep 30):** at the late game the player chooses between two paths:
1. **Camp Leader:** the shift into leading a camp.
2. **Solo master:** continue the save as a Solo Survivor and reach **maximum stats on items and gear**.

`[OPEN]` details: what triggers the fork (a level, a campaign chapter, a Fort story beat); whether the choice is permanent or can be reversed; what "maximum stats" means (a raised gear tier cap, a new top tier, prestige-style upgrades); whether the first release ships only the fork's setup and the second wave ships the paths.

*Why this is a strong shape:* the endgame is the largest missing design piece (`zed-idler-design-lead-brief.md`, 7.3). A fork with two real fantasies (leader or lone master) gives the long game direction and a reason to replay.

---

## 9. Design principles for adaptability

- **One simulation, many views.** State + elapsed time in, results out. Live screen and offline catch-up both call it.
- **One XP bus.** Everything goes through `emitAction`.
- **Data-driven tables.** Pools, decay, matchups, and reputation tiers live in data (ScriptableObjects or JSON in Unity).
- **Cap offline effects.** 24 h. **Per return `[DECIDED Oct 10, Q2]`:** one player return processes at most 24 h of gameplay time in total, including carried or unprocessed simulation time (`_carryMs`). Repeated processing within one return cannot exceed it. Time beyond the cap is discarded `[DECIDED Oct 10, U2]`.
- **Simulation time for buffs `[DECIDED Oct 10, Q4]`.** Buff effects and expiry are evaluated at the simulation timestamp of the step being processed. A buff applies at every simulated moment before its expiry and stops when simulated time reaches it. Real-time cleanup never removes a buff that unprocessed steps still need. Durations, effects and stacking are unchanged.
- **Shared survivor attributes `[DECIDED Oct 10, Q5]`.** `moveSpeed` and `healPct` are computed by shared rule functions. The Wandering screen reads them; it never writes them. Watched, offline and headless runs use the same calculation, with no balance change.
- **Pace `[DECIDED Oct 12, D-FX4a]`.** Pace (Walk / Jog / Run) is a saved player setting; speed is computed from it by the shared rule (`ZI.SurvivorRules`). Speed consumables live in the shared buff store and follow the buff timing rules (D-FX4b).
- **Retreat controls `[DECIDED Oct 13, RB1/RB2]`.** Retreat is a policy: the R1 rules withdraw the survivor on their own, in the background. While resting, the scene shows the limits ("Retreats at HP 30% · stress 85 · load 115%"). There is no retreat button in the main bar and no rules editor (editing the limits is parked for the shop). **Run Back** is the player's manual command and uses the same withdrawal (walk to the last checkpoint, one getaway roll, rest; pace kept). Nothing on the screen moves the survivor directly; the distance bar is display only.
- **Port-friendly rules.** Rules as plain functions with no React coupling, so they move to Unity C# as-is.
- **Additive changes.** New policy = new pool. New faction = new row in the hexagon table. New skill = new check tag.
- **Platform-neutral saves.** Every save carries a version number and is a plain data export, so a save can move between Steam and (later) mobile by export code or file, and migrations can upgrade old saves. Save transfer is the decided way to link platforms.

---

## 10. Unity / C# implementation notes

```csharp
public enum Policy { Ethical, Immoral, Criminal, Heinous }

public struct EncounterDef {
    public string Id;
    public Policy[] Pools;            // which policies can roll it
    public int Weight;
    public SkillId[] Checks;          // primary first
    public bool TraversalOnly;        // e.g. the Fort
    public FactionId? RequiresFaction;
}

public static class WanderSim {
    // Called by the live screen (1 step) and offline catch-up (N steps, capped at 24h).
    public static EncounterResult Step(SurvivorState s, WorldState w, Policy p, IRng rng);
}
```

- `IRng` is injectable so offline and live runs are testable and reproducible.
- `SkillDecayService.Settle(skill, nowUtc)` runs on load and when a skill is read; it applies the absence cap.
- `ReputationService.Apply(faction, delta)` enforces the ±50 cap and the Lodge clamp.
- `FortService.Roll(square, rng, playerPresent)` handles later Forts (chance, pity counter). The first Fort is placed by world setup at a fixed square near the start. `HeinousUnlock` is set when a guard is killed in the first Fort scene.

---

## 11. Open questions

1. Are kits consumables that hold charges (13.3)? Proposed: yes.
2. May the scripted first Fort scene change Hearthguard standing, as an exception to "faction-owned sites never change standing"? Proposed: yes.
3. How does a Criminal survivor fare at the first Fort? (`wandering-fort-scene.md`, 10.4)
4. What triggers the late-game fork, and what does "maximum stats" mean? (Section 8)
5. Is the policy reputation leaning in 4.7 right, and does Criminal lock lawful factions out or only make them expensive?
6. Does the hexagon modifier apply while trading at the Lodge? Default: no.
7. Does the bed tier also scale the decay slowdown (3.5)?
8. Confirm decay numbers (1–4% daily, grace 4→1 days, 25 events per floor) and the 4-hour switch cooldown by playtesting.
9. Encounter pool contents and weights in 2.3 are starting content only.

---

## 12. Data tables (edit these to balance)

### 12.1 Reputation

`RepTiers`: Hunted −1000..−601 · Hostile −600..−251 · Wary −250..−1 · Stranger 0.. (existing ranks up to 2500). `MaxEventDelta = 50`. `LodgeMinRep = −250`. `LodgeMarkup = 0.60`.

### 12.2 Decay

`DecayRatePerDay(level) = lerp(0.01, 0.04, (level−1)/49)`. `GraceDays = {1–14:4, 15–29:3, 30–44:2, 45–50:1}`. `RustyOffsetDays = 2`. `RustyEfficiency = 0.95`. `RustedEfficiency = 0.90`. `BaselineDecayMultiplier = 0.5`. `AbsenceCapDays = 1`. `FloorTierStep = 10`. `FloorEventsRequired = 25`.

### 12.3 Hexagon

`HexOrder = [IronMarch, Dustwalkers, BlackHaven, Concordance, Hearthguard, Lodge]`. Strong vs the next index (wraps), weak vs the previous. `HexModifier = 0.15`.

### 12.4 Fort

`FortChance = 0.02`. `FortPityStep = 0.0025`. Rolled only on Traversal squares, only while the player is present, and only for **later Forts**. The first Fort is placed at a fixed location near the start.

### 12.5 Policy switching

`PolicySwitchCooldownHours = 4`. Heinous → other is exempt.

---

### 12.7 Starter weapons `[DECIDED Oct 10, CB1]`

| Weapon | Damage | Special | Loot | Weight | Rarity |
|---|---|---|---|---|---|
| Nail Bat (`bat`) | 28 | `heavySwingPct` 30: after attacking, 30% chance to lose the next attack | 0 | 3 kg | Common |
| Iron Knuckles (`iron_knuckles`) | 16 | `staggerPct` 25: on a hit, 25% chance the target loses its next attack | 0 | 1 kg | Common |
| Pocket Knife (`pocket_knife`) | 16 | `escapeBonus` +30 to escape chance (not combat evasion) | +5 | 0.5 kg | Common |

The Elder Jester offers all three; the player picks one (U17, U29). Identities: heavy and slow · fast and staggering · quiet, evasive, small scavenging bonus. Balanced against early zombies (F–E); see `starter-weapons-cb1-slice.md` §3.

---

## 13. Active play: discovery prompts, tools, and redirects `[DECIDED unless tagged]`

Added after design review. This is the layer that gives a player who is watching the tab something meaningful to do, without breaking the idle promise.

### 13.1 Principles

- **Zombie fights are automatic.** The player has no fight/evade/talk choice. The game still resolves each encounter as a fight or an evasion behind the scenes, using policy default, standing and the hexagon (4.4). `[DECIDED]`
- **Faction NPC encounters are automatic** and less frequent than zombie encounters. They resolve by policy, standing and the hexagon (Sections 4-6). `[DECIDED]`
- **Player attention is reserved for three things:** discovery prompts (13.2), tools (13.3), and redirecting the run (13.4).
- **The cost of active choices is risk**, not reputation. Reputation is not a cost of any override. `[DECIDED]`

*Why:* automation for the frequent, low-stakes events keeps the game idle-friendly, and a prompt on the rare, high-stakes ones makes each prompt feel important. If everything asked for input, players would learn to ignore the prompts or feel chained to the screen.

### 13.2 Discovery prompts

A **discovery** is a location the survivor finds during a run. The screen asks: *"Venture closer?"*

| Discovery | Base risk tier | Reward | Notes |
|---|---|---|---|
| Campsite | Low | Small cache, supplies | Common |
| Structure (house, depot, clinic, garage) | Medium | Mid cache, possible crafting parts | Common on most routes |
| Fort (later Forts) | High | Quests, best cache tier | Traversal squares only, low odds. The **first** Fort is fixed near the start and is a scripted scene (2.5) |
| `[OPEN]` Others (wreck, outpost, bunker) | - | - | Add as content grows |

**Choices:** *Venture closer* or *Move on*.
- **Move on:** safe, no reward, small discovery XP.
- **Venture closer:** a risk roll. Success gives the discovery's reward and XP for the skills it checks. Failure applies a penalty (13.5).

**Risk is shown, not hidden `[PROPOSED]`:** a label (Low / Medium / High / Deadly) computed from the survivor's effective skill levels against the site's tier. Rust and decay change the label, so skill maintenance stays visible. Exact odds are revealed only by scouting (13.3).

*Why a label:* players can read it at a glance, and hiding the numbers keeps the scout tool valuable.

**Prompt handling: timer, then policy decides `[DECIDED]`.** Every discovery prompt has a live timer. If the player does not answer before it ends, or is away from the tab, the **policy default** makes the choice (the Fort is the one exception, below). Nothing ever waits on the player, so the run never stalls.

| Proc chance | Starting timer `[PROPOSED]` |
|---|---|
| Common (campsite) | 20 s |
| Uncommon (structure) | 45 s |
| Rare (Fort) | 90 s; if unanswered it resolves to *Move on* for every policy |

Rarer, higher-stakes discoveries get more time to notice.

**Policy defaults:**

| Policy | Default |
|---|---|
| Ethical | Move on, unless risk is Low |
| Immoral | Venture if risk is Medium or lower |
| Criminal | Venture if risk is High or lower |
| Heinous | Always venture |

**Forts are the exception `[DECIDED]`:** Forts are story moments and should be attended.
- Later Forts are rolled **only while the player is on the Wandering screen**. They are never rolled by the background engine or offline catch-up.
- If a later Fort's timer runs out, it resolves to *Move on* for every policy, with no penalty. It can be rolled again (the pity counter counts only on-screen rolls).
- The first Fort is not a discovery prompt. It is a fixed, scripted scene (2.5).

### 13.3 Tools: scout and heal

- **Scout** (free action, `[DECIDED]`): before deciding on a discovery, it can **reveal the exact odds and reward tier** and/or **lower the risk**. How much depends on the survivor's **Discovery level** `[DECIDED]`: low levels reveal the risk label more precisely; mid levels reveal exact odds; high levels also lower the risk one step.
- **Heal** (free action): restores HP.
- Both use **charges**. `[DECIDED]` Two sources:
  - **Base charges** refill once per day.
  - **Kits** carried in pockets (Section 14) hold their own charges. `[PROPOSED]` A kit is a consumable: a med kit carries 2 heal charges, each heal spends one, and an empty kit is used up. Kits do not refill daily; crafting more kits is how a player gets more charges. This matches "if the player uses them all up" and makes the Fort's medicine offering a real cost. `[OPEN]` whether an empty kit can be refilled instead of replaced.
  - The number of kits a player can hold is limited by pocket space and weight.
- The typed-command daily limit (60/day) is **retired** and replaced by charges. `[PROPOSED]`

Starting examples (names and numbers are placeholders):

| Item | Effect |
|---|---|
| Field med kit | Holds 2 heal charges. Occupies 1 pocket (Section 14) |
| Binoculars / scout kit | Holds 2 scout charges. Occupies 1 pocket (Section 14) |
| Upgraded variants | Higher capacity, cheaper scout, stronger heal |

*Why crafted:* it ties the Crafting tab to Wandering, follows your supply-chain principle (components before finished items), and gives smithing, mechanical and engineering a reason to matter to a player who spends most of their time wandering.

### 13.4 Redirecting the run

| Action | Effect | Cost |
|---|---|---|
| Push on | Extends the run, raises encounter tier and rate | Nutrition and risk (~~stamina~~: superseded Oct 26, FOOD-01 ST2) |
| Retreat | Banks loot, returns to base, ends the run safely | Ends the run |
| Change route | Choose a different route or Traversal square | **Stress** (13.8) |

Retreat also gives the idle run a graceful stop when resources are low (fixes integration item #5).

### 13.5 Risk and failure

Failure penalties on "Venture closer" `[PROPOSED]`, scaled by risk tier: HP loss, lost supplies, an ambush encounter, or lost run time. Higher tiers combine more penalties. Reward scales up with the risk tier so the gamble is worth it.

### 13.6 XP, decay and the return report

> **Batch 3A `[DECIDED Oct 5]`:** The return report includes `left behind (too heavy)` with a count.

- **Active play counts for decay.** Prompts, tools and redirects award XP through `ZI.emitAction` and reset skill clocks exactly like policy events. `[DECIDED]` Players who show up keep their skills fresher.
- Charge limits already cap tool XP, so no separate daily XP cap is needed.
- The **return report** lists everything resolved while the player was away: every discovery the policy decided while the player was away, and decay warnings for rusting skills. `[PROPOSED]`

### 13.7 Integration changes

- Typed commands `kill`, `heal`, `scout`, `push`, `retreat` become buttons or tool actions. `kill` disappears (combat is automatic). `status`, `clear`, `help` stay as UI.
- Heal, scout and push XP move onto `ZI.emitAction` (extends integration fix #4).
- Discovery rolls use the same shared `RollEncounter`/`ResolveEncounter` functions as the offline engine (Section 10) so screen and offline behave alike.

### 13.8 Stress `[DECIDED concept, PROPOSED numbers]`

> **Superseding decision `[DECIDED Oct 19]`:** the **Broken** state replaces the Breaking Forced Retreat. At max stress the survivor becomes Broken and keeps going; stress resets to 80. The resume gate is HP only, and the stress retreat rule is off. Overload above 100% gives stress gains ×2. Release: 1 in 6 per rest, or forced after 3 rests with a 5–10% durability cost. Penalties and values: Batch A draft (`claude/slice-retreat-broken-batch-a-draft.md`). The Breaking, PF1-gate, Shaken and ×1.15 wording below is superseded and will be rewritten when BAL-A closes.

> **Batch 3A `[DECIDED Oct 5]`:** Overload (load > 100%) multiplies positive stress gains ×1.15 — a load rule, not a policy multiplier.
> **Accounting `[CLOSED Oct 5]`:** the multiplied per-millisecond stress rate and each one-off stress event are rounded to the smallest stored stress unit (1/5.184×10¹² of a point). This is canonical: live, chunked and offline results are identical. No saved fractional remainder.

**Stress** is a new run resource (0-100). It measures how uneasy the survivor is, and it is the cost of changing route.

**Gains:**
- **Change route:** a stress cost, plus a ~~**stamina or nutrition**~~ **nutrition** cost (~~the resource used is `[PROPOSED]`: stamina by default, nutrition on long routes~~; superseded Oct 26, FOOD-01 ST1–ST2: no separate stamina meter). Costs vary and are tuned over time.
- **Unfamiliar ground:** time spent on Traversal squares the survivor does not know how to leave. Stress per minute is high on unexplored or uncleared squares, lower on explored ones, and near zero on cleared ones.
- **Negative outcomes:** a failed venture, an injury, an ambush, or dropping to low HP add stress.

**Familiarity comes from saved player progress `[IMPLEMENTED in game-data.js]`:** explored sectors (`zi_world_explored`) and cleared cells (`zi_world_cleared`). A cell becomes `cleared` after 40 kills (`ZI.CELL_CLEAR_KILLS`) while the survivor is stationed there, counted from both the screen and the background engine. Use `ZI.cellFamiliarity(gx, gy)` which returns `cleared`, `explored` or `unexplored`. The survivor's **start cell and the base cell count as cleared** (home ground), because no cells start cleared `[PROPOSED]`. A cell's clear target is 40 kills by default and can differ for a specific quest cell (`wandering-fort-scene.md`, 12.4).

**Effects `[DECIDED split, PROPOSED numbers]`:** *rust equals skill level; stress equals clumsiness and durability.*

| Stress | Stage | Effect |
|---|---|---|
| 0-39 | Calm | None |
| 40-69 | Strained | Gear wear ×1.25; 5% chance a scout/heal charge is fumbled (wasted) |
| 70-99 | Stressed | Gear wear ×1.5; 10% fumble chance; risk labels read one step worse; effective skill levels −5% |
| 100 | Breaking | Run ends in a forced retreat; ~~small loot loss~~ `[SUPERSEDED by Batch 3B]` haul loss = floor(N × 50% × Scavenging factor), best entry protected (see 13.8 Batch 3B note); no death |

**Batch 3B note — Forced Retreat consequences `[DECIDED Oct 6]`** (supersedes the old 10% Breaking haul loss, the "small loot loss" wording above, and the historical Downed best-item + Scavenging-share retention rule, all `[SUPERSEDED by Batch 3B]`):
- Forced Retreat = the survivor can no longer stay in the field and is driven back to Base; the run ends. Current triggers: Stress Breaking, and Downed with no successful Heal/revive (Downed = HP reaches 1 from any damage source, U5). Low HP, zero Heal charges, overload, worn gear and voluntary withdrawal are not triggers by themselves.
- One canonical path for both triggers. Haul loss: N = eligible non-story haul entries; lossCount = floor(N × 0.50 × factor), factor = scavDropRate(effective Scavenging) / DROP_MAX (1 at ≤1, 0 at ≥50); actual = min(N − 1, lossCount). The most valuable entry (Recycler value) is always kept; ties go to the earliest pickup by stored sequence. Losses are chosen with the seeded RNG. Retained haul banks to the Recycler.
- Never lost: carried items, kits (partial charges kept), equipped gear (no extra wear), story items.
- Returns to Base immediately and begins Base rest. The fixed resume gate is HP ≥ 80% **and** stress < 70 `[DECIDED Oct 16, Sam, PF1]` (was stress < 50); it applies to every rest (Base, checkpoint, camp). Breaking additionally resets stress to 80 (Shaken) `[DECIDED Oct 16, Sam]`; Downed does not. A pending discovery is recorded as `left behind (forced retreat)`. One report row per Forced Retreat.
- A failed Fort guard attack keeps its Fort-specific costs and is not a Forced Retreat.

**HP floor and Downed `[DECIDED Oct 10, Q1, U5, U6]`:** survivor HP never falls below **1**, in any state (Downed, Forced Retreat, Base rest, recovery), in watched play, offline catch-up and headless simulation. **Reaching 1 HP from damage inside a Wandering run triggers Downed** (fights, policy hits, failed ventures and their ambushes); damage beyond that is absorbed. **Exempt `[DECIDED Oct 10, U25, U26]`:** the failed Fort guard attack and the failed Traversal loot search floor HP at 1 and keep their own costs but never Down; a survivor in the Fort scene cannot be Downed. **Order of authority `[DECIDED Oct 10, U27]`:** the player's retreat setting (R1 HP floor 10–60%, default 30%, applying once heal charges run out) decides withdrawal; Downed at 1 HP and the fixed resume gate (80% HP and stress below 50) override it. Downed resolves by heal, then revive, then Forced Retreat. The log shows the full damage of the hit that Downs the survivor. Maximum HP and healing rules are unchanged. (U5 supersedes U1's "damage would take HP to 0 or below" wording. Built by FX1, `fx1-hp-floor-slice.md`.)

**Healing while resting `[DECIDED Oct 15, FX5]`:** a heal used while resting (checkpoint, Base or camp) is kept, and rest continues upward from the healed HP. The resume gate is unchanged. *Why:* a heal spends a charge or an item; erasing it would charge the player for nothing.


- **Gear wear** multiplies the durability drain on the equipped weapon and body armor. In the current code `wearEquipped()` calls `Z.applyWear(it, Z.itemDrainPerUse(it))`; multiply that drain by the stress factor. Worn-out items give no benefit until repaired, so stress feeds the repair loop (smithing, mechanical). The background engine ignores gear today, so offline wear only happens once the engine shares the screen's resolve function (integration fix #3).
- **Combined cap:** all skill-level penalties from rust and stress together never exceed **−20%** `[DECIDED]`. Rust lowers effective skill level; stress mostly does not, apart from the small Stressed-stage penalty.

**Policy stress multiplier (option B) `[DECIDED to start here]`:** multiplies stress *gained*, not recovery.

| Policy | Multiplier |
|---|---|
| Ethical | ×0.8 |
| Immoral | ×1.0 |
| Criminal | ×1.1 |
| Heinous | ×1.3 |

Later experiment: option C, where a policy shifts *which* sources cause stress (for example Criminal stressed by unfamiliar ground, Heinous numb to failure but with a steady drip) instead of scaling everything.

**Stress carries over between runs `[DECIDED]`.** It does not reset at base. Recovery is gradual:
- **Resting at base** (the rest spot and schedule rest task) lowers stress steadily. Offline recovery follows the same 24 h cap as other offline systems. Recovery is deliberately modest so it cannot be abused, and beds are crafted upgrades `[DECIDED]`:

| Rest spot | Recovery per day `[PROPOSED]` |
|---|---|
| Bedroll | −20 |
| Cot | −30 |
| Bunk | −40 |
| Proper bed | −50 |

Better beds need better tools (workshop tier), so engineering and mechanical matter here. Abuse guards: rest only counts while the survivor is at base, and the 24 h offline cap applies.
- It drifts down slowly on cleared squares.
- **After a Breaking forced retreat, stress resets to a "Shaken" floor** of 80 `[DECIDED Oct 16, Sam]` (was 60 `[PROPOSED]`), not 100. *Why:* if it stayed at 100, the next run would break immediately and the player would be stuck. It stays above the resume gate (stress < 70) so a Breaking still forces a stress rest (~12 h at the Bedroll rate) and is never faster than withdrawing on purpose. The player's stress retreat ceiling likewise starts at 71 (range 71–95).
- Command's self-discipline perk (2.4) reduces stress gained.

**Stress-reducing crafted items `[DECIDED]`:** whimsical and comfort clothing (flower hat, patchwork scarf, woven charm, other fantasy-style clothing) reduce stress gained or speed recovery.

The paperdoll slots are: **Melee, Helmet, Mask, Body Armor, Gloves, Boots, Pack, Trinket, Food, Throw.** `[DECIDED]`

Comfort items use these existing slots `[PROPOSED]`:
- **Helmet, Mask, Body Armor, Gloves, Boots:** a comfort version replaces the protective item, so the trade-off is protection against stress. A flower hat sits in the Helmet slot.
- **Trinket:** the natural slot for a pure stress item. Charge kits no longer use it.
- **Food:** comfort food reduces stress and ties into the nutrition cost of route changes. Values and daily cap: FOOD-01 F5 (Oct 26) and FOOD-02 §1a.
- **Melee, Throw, Pack:** no comfort items (carriers provide pockets, Section 14).

There is no separate stat penalty. The cost is that the slot is not holding armor.

*Why this works:* it turns a map feature you already have (clearing Traversal squares) into a benefit, gives "change route" a real price without touching reputation, and adds a soft second consequence to failure.

*Watch out:* stress raises risk, risk causes failures, failures add stress. That loop can spiral. The cap, the forced retreat (a safe exit, not death), and the recovery paths are what keep it fair. Stress effects are temporary, and the combined −20% cap on level penalties keeps stress and rust from stacking too far.

### 13.9 Resolved and open questions

**Resolved:** prompts use a timer, then policy decides (13.2) · the Fort is rolled only while the player is present and times out to Move on (13.2) · scout power comes from Discovery (13.3) · faction-owned **discovery** sites never change standing (the scripted first Fort scene and its quest are the exception: they are story events and do change Hearthguard standing) `[PROPOSED, confirm]` · charges refill daily and extra charges come from carried kits (13.3, Section 14) · change route costs stress plus stamina or nutrition (13.4, 13.8) · stress carries over, recovers gradually with modest bed rates, and resets to a Shaken floor after a forced retreat (13.8) · rust = skill level, stress = clumsiness and durability, combined level penalty capped at −20% (13.8) · policy stress multiplier option B (13.8) · cleared cells are saved progress (13.8) · comfort items use existing gear slots (13.8). Thresholds, gain rates and route costs are tuned over time.

**Open:**
1. The Fort scene, dialogue and first quest. **See `wandering-fort-scene.md`.**
2. Pocket and weight questions in 14.5.

---

## 14. Carrying: pockets and weight `[DECIDED concept, PROPOSED numbers]`

Added from design review. Carrying space comes from the gear the survivor is wearing, not from one fixed backpack.

### 14.1 Rules

> **Batch 3A `[DECIDED Oct 5]`:** The haul consumes weight, never pockets.

- A **pocket** is one standard unit of carrying space.
- **Equipped gear grants pockets. Unequipped gear grants none.** `[DECIDED]`
- Every carryable item has a **set size** in pockets, the same everywhere in the game `[DECIDED]`.
- **Weight still applies.** Pockets limit *how many separate items*; weight limits *how heavy the load is*. This ties into the existing 40 kg carry capacity and the per-item weight (`carryW`) already in the gear data.
- **A second carrier slot, named Belt** `[DECIDED]`, so a player can carry, for example, med kits and scout kits in separate carriers. It holds a **belt pouch, satchel, hip bag or similar**; it is not a second Pack. The paperdoll becomes: Melee, Helmet, Mask, Body Armor, Gloves, Boots, Pack, **Belt**, Trinket, Food, Throw.
- **Raw crafting materials take up weight only, never pockets** `[DECIDED]`. Pockets are for distinct items: kits, consumables, tools, keys, documents.
- **Story items take weight only, never pockets** `[DECIDED Oct 1]`, so a full pack can never block a scripted beat (Fort brief 12.6).
- ~~Food and Throw are quick-use slots holding one stack each.~~ **Superseded in part Oct 26 (FOOD-01 F18):** Throw holds one stack; Food holds one stack, or a food container (lunch bag, lunch pack, cooler) holding several food types with no stack limit inside. They do not count as pockets.

### 14.2 Carriers: pockets and weight `[PROPOSED numbers]`

Carriers have **two stats**: *pockets* (distinct items) and *weight capacity* (bulk materials). A rucksack is mostly about weight; a vest is mostly about pockets. That is why the vest gives 6-8 pockets while a rucksack gives 2.

Only three slots hold carriers, because the paperdoll has no legs or belt slot. Helmet, Mask, Gloves, Boots, Trinket, Food, Throw and Melee give **0 pockets**.

| Carrier | Slot | Pockets | Weight capacity | Note |
|---|---|---|---|---|
| Handmade pouch | Pack or Belt | 2 | +5 kg | Cheapest |
| Rucksack | Pack | 2 | +25 kg | Matches the 40 kg total in the master design |
| Belt pouch | Belt | 2 | +3 kg | |
| Satchel | Belt | 3 | +5 kg | |
| Padded jacket | Body Armor | 2 | 0 | Light protection |
| Cargo/hunting jacket | Body Armor | 4 | +2 kg | |
| Ballistic vest | Body Armor | 2 | 0 | Strong protection |
| Plate carrier | Body Armor | 5 | +3 kg | Heavier |
| Tactical vest | Body Armor | 6-8 | +5 kg | Best carrying; moderate protection |
| Heavy plate armor | Body Armor | 0 | 0 | Maximum protection |

Base weight capacity with no carriers: **15 kg** `[PROPOSED]`. A rucksack brings it to 40 kg. Typical loadouts have 6-9 pockets; the maximum is 13 (tactical vest 8 + rucksack 2 + satchel 3).

*Why the trade-off works:* the Body Armor slot decides between protection, comfort items (13.8) and carrying space, and only the vest tier makes carrying space a major reason to give up armor.

### 14.3 Item sizes `[PROPOSED]`

> **Batch 3A `[DECIDED Oct 5]`:** Haul entry — 0 pockets; weight from the canonical salvage-weight helper shared with the Recycler (`ZI.salvageWeight`), stored on the entry at pickup. Side effect accepted: valuable entries are heavy. **Superseded Oct 26 (W-1, Sam):** every item has its own real-world weight per item type in the data table (e.g. aluminium can about 0.02 kg, gemstone about 0.05 kg `[PROPOSED]`); rarity never changes weight. Code reports current `ZI.salvageWeight` values and callers first (W-3).

| Item | Pockets |
|---|---|
| Med kit, scout kit | 1 |
| Consumable stack (one type, up to its stack limit) | 1 |
| Small tool | 1 |
| Story item (`isStory`) | 0 pockets; weight only; cannot be lost or dropped until its quest ends `[DECIDED Oct 1]` |
| Key item or document (not a story item) | 1 |
| Large item | 2 |
| Raw materials | 0 (weight only) |

### 14.4 How this drives Wandering

> **Batch 3A `[DECIDED Oct 5]` — replaces the overload paragraph below:**
> - A pickup is allowed when the resulting load is ≤ 125% of capacity, refused if it would exceed 125%. Entries are picked up whole or not at all. Refused loot is left behind, logged once, and reported as `left behind (too heavy)` (one grouped row with a count).
> - Movement: ×1.00 up to 100%, linear to ×0.75 at 125% (110% → ×0.90, 120% → ×0.80). Above 125% without a pickup, movement stays clamped at ×0.75.
> - **Oct 26 (W-2, Sam) `[DECIDED]`, values `[PROPOSED]`:** load up to 50% of capacity costs no speed; above that each extra kg slows movement by pace (walk −1%, jog −1.5%, run −2% per kg). The 125% pickup limit stays. `[OPEN]` How W-2 replaces or combines with the line above: Code reports the walk/jog/run constants first (W-3).
> - Stress: while load is strictly above 100%, positive stress gains are ×1.15. Recovery, negative changes and the Breaking reset are not multiplied. Overload is a load rule, not a policy multiplier. It never triggers a Forced Retreat and does not change its consequence.

- Extra heal and scout charges come from kits carried in pockets, so charges compete with other items for space.
- [SUPERSEDED by Batch 3A — see the 3A note in this section] **Overload adds stress `[DECIDED]`.** Carrying above weight capacity slows the survivor (`speedDelta`) and multiplies stress gained by ×1.15 (`[PROPOSED]`, scales with difficulty, Section 15). Above 125% of capacity nothing more can be picked up.

### 14.5 Open questions

1. Are the pocket and weight numbers in 14.2 right for early, mid and late game? (See 14.7 for what the code has today.) Playtesting will tune them.

### 14.6 Integration

- Add `pockets` and `weightCapacity` to carrier items and `pocketSize` to carryable items in `ZI.GEAR_ITEMS`.
- Paperdoll UI shows pockets per equipped carrier and a weight bar.
- Charge totals are computed from the kits currently in pockets.
- Overload stress is a source in the stress system (13.8).

### 14.7 What the current code does, and what changes

From `game-data.js`:
- [SUPERSEDED by Batch 3A — see the 3A note in this section] **Capacity is a 0-100 stat, not kilograms:** `carryCapacity = clamp(100 - weight, 0, 100)`, where each gear item's `carryW` adds weight. Packs use *negative* `carryW` (Daypack −3, Military MOLLE −8, crafted MOLLE −10), which lowers the weight burden.
- **Packs already describe stash slots in text only:** Daypack "6 extra stash slots", Military MOLLE "12 extra stash slots". There is no pocket system behind those descriptions.
- **A kilogram field exists in upgrades:** `cap_backpack` grants `backpackKg` +10 per level, up to 5 levels.

What this spec changes:
- Pack pockets follow your rule (a rucksack or pouch gives 2), so the 6- and 12-slot descriptions must be rewritten, or those packs re-tiered. **Decided:** packs stay at 2 pockets, and higher-tier packs (Daypack, Military MOLLE, crafted MOLLE) get their strength from **weight capacity** (for example Military MOLLE about +35 kg, `[PROPOSED]`), with the `backpackKg` upgrades stacking on top. Pockets come from vests and jackets.
- [SUPERSEDED by Batch 3A — see the 3A note in this section] Decide whether the 0-100 `carryCapacity` stat is replaced by kilograms, or kept as a display value derived from kg. Suggested: kilograms internally, the bar derived from it.
- `backpackKg` upgrades already fit the weight-capacity model.

### 14.8 Batch 1A decisions (Oct 3) `[DECIDED]`

> **Batch 3A `[DECIDED Oct 5]`:** Load = equipped + carried + applicable story weight + current haul (kg authoritative), recomputed on any input change (pickup, haul loss, banking/return, consumption, equipment or carried changes). Movement, stress and pickup eligibility always read the current load; results never depend on simulation chunk size.

Terms used everywhere: **Stash** = items owned and stored at base. **Carried** = items deliberately brought along (`zi_carried`). **Loadout** = equipped items.

| # | Decision | Reason |
|---|---|---|
| A | Carried inventory is a separate store next to the stash (`zi_carried = { v:1, items:[{ id, qty }] }`). The stash is not turned into carried inventory. | Keeps base storage, what travels, and what is worn as three distinct ideas, which the Gauntlet's carried-only rule depends on. |
| B | Carried items can be changed only at the start/base cell or an established camp cell. | Makes packing a real decision and gives camping a purpose. |
| C | Kilograms are the authoritative capacity unit. Capacity = 15 kg + equipped carriers (Pack, Belt, Body Armor) + `backpackKg` upgrades. Load = equipped items + carried items + story items + the Wandering haul. The old 0–100 value is retired; the displayed carry % is derived from kg. | One model, no conversion layer to replace later. |
| 1 | Story items are always on the survivor and their weight counts everywhere. They take no pocket and cannot be stashed, dropped, sold or lost until their quest ends (Oct 1 rule). In 1A they stay in their current store and are counted as worn; nothing is relocated. | Story items are plot objects, not luggage. |
| 2 | Per-item `stackLimit`, default 5 for consumables. Kits (med kit, scout kit) stack 1. | Kits carry their own charges. |
| 3 | Carrier numbers (pockets / kg): Daypack 2/+15, Rucksack 2/+25, Military MOLLE 2/+35, crafted MOLLE 2/+40, Tactical vest 7/+5; plus the 14.2 table (handmade pouch 2/+5 in Pack or Belt, belt pouch 2/+3, satchel 3/+5, cargo jacket 4/+2, ballistic vest 2/0, plate carrier 5/+3, heavy plate 0/0). | Crafted MOLLE must beat Military MOLLE, as in the code. |
| 4 | Existing armor: Padded Jacket = padded jacket (2/0); SAPI Plate Carrier and crafted Plate Carrier = plate carrier (5/+3); Soft Armor Vest = ballistic vest (2/0). No other body armor exists today. | Fit existing items to the 14.2 tiers. |
| 5 | Losing pockets (unequipping or swapping a carrier): at base or camp, the overflow returns to the stash; in the field, the change is refused and the message names the items to drop first. | No silent loss, no stuck state. |
| 6 | New carriers (belt pouch, satchel, rucksack, cargo jacket, tactical vest, heavy plate) are item data only, with a developer-only grant for testing. **Recipes owed in the crafting batch** for all six. Their armor/speed values are placeholders mirroring the closest existing item. | Model first; balancing and crafting later. |
| 7 | Rig slot: 0 pockets in 1A. **[OPEN]** Rig slot role and the Med/Stim quick slots — decide together before batch 2 (charges). | Not in the §14 paperdoll; affects charges. |

Pockets: carried items only, by size (kits 1, consumable stack 1, small tool 1, large item 2); story items, raw materials, equipped items and the Food/Throw quick slots take none. Adding is refused when no pocket is free, or when load would pass 125% of capacity. Loot picked up while Wandering stays in the run haul (not the carried store); its weight counts toward load, and the pickup limit is not wired in until the overload batch. Old saves: an empty `zi_carried` is created once; stash and loadout are untouched.

### 14.9 Batch 1B decisions (Oct 3) `[DECIDED]`

> **Batch 3A `[CLOSED Oct 5]`:** The Wandering haul persists in the saved run (`zi_wander_run`); a 25-item haul survived reload in regression tests. The open issue below is closed. Haul entries without a stored weight get one on load (save v4).

| # | Decision | Reason |
|---|---|---|
| 1 | Equipping takes exactly **one** copy out of the stash (it used to remove every copy with that id). | A survivor with three med kits who equips one keeps the other two. |
| 2 | **Story items are protected from generic stash operations that consume, destroy, sell, recycle, or use an arbitrary matching item.** They may still be stored, displayed, saved, loaded, and handled by their own story mechanics. | Plot objects must survive generic housekeeping without becoming unreachable. |
| 3 | Take (stash → carried) and Put back (carried → stash) are allowed only at the start/base cell or an established camp cell. Equipping and unequipping move items to and from the stash, so they follow the same rule. Every refusal uses one message: "You can only change what you carry at your base or a camp." | No remote repacking, no bypass through the loadout. |
| 4 | When a carrier is taken off in the field, the refusal also names the items to drop first (keeps decision 14.8 #5's information). | Both rules stay visible to the player. |

**Open issue (recorded Oct 3):** Wandering haul currently lives primarily in screen/runtime state and may be lost if the app closes during an active run. Resolve haul persistence and its final relationship to carried inventory, pockets and kg load in the shared-simulation batch.

---

## 15. Difficulty modes `[DECIDED concept, PROPOSED numbers]`

Solo Survivor has **Easy, Normal and Hard**, and Camp Leader will get the same three later.

### 15.1 How it works

- Difficulty is stored in one key (`zi_difficulty`), per save. **It is chosen when the save is created and cannot be changed afterward** `[DECIDED]`. Solo saves that upgrade to Camp Leader keep it.
- **Difficulty is a table of multipliers on existing tunables, not separate code paths.** Every system reads its numbers through one function (`DifficultyService.Get(paramId)`), so adding a mode or rebalancing means editing data.
- *Why:* if difficulty were branches in code (`if hard {...}`), every new system would need new branches and modes would drift apart. Multipliers keep Solo and Camp Leader consistent.

### 15.2 Profile table `[PROPOSED]`

> **Batch 3A note:** the overload stress multiplier currently uses the Normal value (×1.15) in all modes until the Difficulty slice.

| Parameter | Easy | Normal | Hard |
|---|---|---|---|
| Skill decay rate | ×0.5 | ×1.0 | ×1.5 |
| Decay grace period | +2 days | base | −1 day (minimum 1) |
| Events needed to earn a floor | 15 | 25 | 35 |
| Offline decay cap on return | 1 day | 1 day | 2 days |
| Stress gained | ×0.75 | ×1.0 | ×1.25 |
| Rest recovery rate | ×1.25 | ×1.0 | ×0.85 |
| Overload stress multiplier [SUPERSEDED by Batch 3A — see the 3A note in this section] | ×1.05 | ×1.15 | ×1.30 |
| Gear wear rate | ×0.75 | ×1.0 | ×1.25 |
| Reputation loss | ×0.75 | ×1.0 | ×1.25 |
| Reputation forgiveness | faster | base | slower |
| Venture success odds | +10% | base | −10% |
| Venture rewards | ×0.9 | ×1.0 | ×1.15 |
| Base heal and scout charges | +1 | base | base |

Hard pays more because it risks more. Timers on prompts, the Fort chance and hexagon modifier stay the same in every mode, so the rules a player learns transfer between modes.

### 15.3 Hard mode extras `[DECIDED to add, PROPOSED details]`

> **Oct 19 (Sam):** difficulty modes stay (Easy / Normal / Hard). The Breaking trigger below no longer exists (Broken replaces Breaking). Its replacement is a parked rule: on entering Broken, the most valuable carried item drops one tier. Whether it applies to every mode or only Hard is `[OPEN]`, with item details parked. Do not implement the item-loss line below.

Hard changes consequences, not just numbers:
- **Forced retreat costs gear.** When stress reaches 100 (Breaking), the survivor permanently loses one random **unequipped, non-story** item from their pockets, on top of the normal loot loss. Equipped gear and story items are never lost this way.
- Easy and Normal keep the forced retreat as a loot loss only.

*Why unequipped and non-story only:* the loss hurts, but it cannot delete a character-defining item or the gear the player is standing in, so the punishment stays a story about a bad run, not a lost save.

### 15.4 Open questions

**Resolved:** the multiplier spread in 15.2 is accepted as a starting point and will be tuned by playtesting.
