**Status:** [PARKED] until the Water POI fishing loop ships (POI Framework v1) and FOOD-01 closes.

# The Djinn — fishing secret (concept)

**Date:** Oct 21
**Related:** `poi-framework-v1-brief.md` (fishing, fish values), `food-01-sim-oct21.md` §7 (fish test), the parked Sunken Blade Easter egg.

## 1. Directions confirmed by Sam `[DECIDED Oct 21]`

| # | Rule | Why |
|---|---|---|
| D1 | **Gated rarity.** The djinn can't appear until the player has caught a set number of legendary fish. Only then do the rare odds start | Rarity comes from mastery first, luck second (earned-mastery pillar) |
| D2 | **Foraging improves the odds** once the gate is open | Rewards the skill that fishing already trains |
| D3 | **Sealed bottle.** A djinn roll during offline fishing produces a *Sealed Bottle* in the catch. The player opens it in person to meet the djinn | A once-in-a-lifetime scene is never resolved by the simulation while the player is away (same principle as the Fort) |
| D4 | ~~Three offers, the player chooses one: wish, trade, or story/quest.~~ **Superseded Oct 21 by D5** | — |
| D5 | ~~Three wishes, each typed as an in-game item.~~ **Superseded Oct 21 by D8** | — |
| D6 | ~~Free-text "I wish for…" prompt in the combat log.~~ **Removed Oct 21** | — |
| D7 | ~~Protected text box.~~ **No longer needed Oct 21:** there is no free text | — |
| D8 | **One wish, three choices.** The djinn says *"I can grant you a wish."* Three items appear on screen with the line *"Choose one from the following."* The player picks one | A clear, bounded choice with no typing, no parsing and no text-input attack surface |
| D10 | **Eligible items:** the choices come from items the player has discovered, **plus a chance for a newly discovered item**. That chance is set only by the player's **Discovery** skill. Never story or quest items | The djinn can surprise the player, and Discovery gains another use |
| D11 | **The djinn never trades** | It grants; it doesn't bargain (also confirms D4's trade offer is gone) |
| D12 | **The djinn's curse.** Taking the highly advanced choice (the new item, or one a tier above) brings a curse with two parts: **Hunted** (danger) and **Hollow** (food) | Risk against reward: the strongest pick costs something, so the safe picks stay real options |
| D13 | **A curse is an affliction,** the same family as Injured and Broken, with its **own distinct symbol** on the Wandering page | Reuses the existing status-icon area; the player can always see why the run feels harder |
| D14 | **The curse acts as a "difficulty +X%" layer:** shorter Wandering intervals and lower discovery chances when scouting a grid cell | One readable idea for the player: the world is harder while cursed |
| D9 | **Quantity:** a single item for gear and tools; a **full stack** for stackable items such as food and ammo | A single ration or bullet would feel like a joke next to a once-in-a-lifetime event |

## 2. Proposed rules `[PROPOSED]`

| # | Rule | Why |
|---|---|---|
| P1 | The djinn is **bonus content only**. Nothing core progression needs comes only from it | Never gate core progression behind randomness |
| P2 | ~~Choose one of three.~~ Superseded Oct 21 (D5) | — |
| P6 | ~~Typed text matched against the item table; discovered items only.~~ Superseded Oct 21 by D8 and D10 | — |
| P6a | ~~old P6:~~ **A wish only matches an eligible item.** The typed text is matched against the canonical item table, with suggestions as the player types (autocomplete). Eligible: items the player has **already discovered** and that are not story, quest or djinn items | An allowlist is safer and clearer than guessing; limiting it to discovered items stops players using the box to probe for unreleased or hidden items |
| P7 | ~~A failed match never spends a wish.~~ Superseded Oct 21 (no typing) | — |
| P8 | **An unused wish stays in the bottle.** Closing the choice without picking keeps the wish, and the same three items, for later | Same as P3; nothing is lost by accident |
| P10 | **Roll once, store the result.** The three items are chosen when the bottle is created, from the save's seeded random source, and stored in the bottle. Reloading or reopening never rerolls them | Stops save-scumming (reloading until a better roll appears) and keeps watched and offline play identical |
| P11 | **Three different kinds:** one piece of gear, one stackable supply (food, ammo, medical), one crafting item or material | Variety makes the choice a real trade-off instead of picking the biggest number |
| P12 | **Tier window:** offered items sit at the player's current tier or one above | Exciting without skipping progression |
| P14 | **At most one of the three choices can be a new item.** The new-item chance starts at 0% at Discovery 1 and rises to 50% at Discovery 100 (linear, data table) | Keeps the offer mostly familiar, so the player can judge it; a new item is a bonus, not the norm |
| P15 | **New items still obey the tier window (P12) and the eligible-item table.** Unreleased, hidden, story and quest items are never offered | A reveal must never spoil content the game is holding back |
| P16 | **A new item shown by the djinn counts as discovered** (it unlocks wherever discovery is recorded), whether or not the player picks it | The player learned it exists; the record should match |
| P13 | **Full stack** = that item's maximum stack size from the item data table | One number, one source; no special djinn stack size |
| P9 | **Items only.** The three choices are always items, never more wishes, levels, floors, RMAT or stat changes | Protects earned mastery and the economy |
| P3 | **No timer on the scene.** Opening the bottle is the player's action and blocks nothing; Wandering keeps running. Closing the scene without choosing reseals the bottle | No dead end, and the meeting can't be lost by accident. This is the one deliberate exception to "every prompt has a timer," because nothing waits on it |
| P4 | Every reward is **earned and in-game only**. Nothing the djinn gives is ever sold for real money or RMAT | Business-model rule 5.1 |
| P5 | Rolls only happen on **fish results**, never on loot or empty pulls | Keeps the pull rule "exactly one result per pull" intact; the bottle replaces that fish |

### Starting values (data table, to test before locking)

| Value | Start | Note |
|---|---|---|
| Legendary fish needed to open the gate | 5 | About 100 low-Foraging visits, or about 26 at high Foraging (§7 test rates) |
| Djinn chance per fish, once open | 1 in 1,000 | |
| Foraging bonus | up to ×2 at high Foraging (1 in 500) | |

At high Foraging and about 9 pulls a day, the gate opens in a few weeks and the djinn arrives about two months later. These values need a run in `fish_sim.py` before they lock.

## 2a. The djinn's curse `[PROPOSED]` details

**Not the save's difficulty setting.** Difficulty is fixed at save creation `[DECIDED]`, so the curse never changes it. It is a separate modifier shown as its own line, for example "Cursed: +25% danger."

| Part | Effect | Starting value |
|---|---|---|
| Hunted | Encounters hit harder, so retreats come sooner (Sam, Oct 21: this is what "shorter Wandering intervals" means) | zombie damage ×1.25 |
| Hunted | Warned over-tier threats appear more often | ×2 |
| Hunted | Scouting a grid cell finds less | fades −20% / −10% / −5% over the 3 real days; floor 80% of normal (starting values) |
| Hollow | Nutrition drains faster (walking drain and healing cost) | +50% |
| Curse end | **"Endured" reward:** about one day's Endurance XP (about 3,600) when the curse runs its **full course**. Not listed on the curse card. Not granted if the curse is lifted early | `[DECIDED Oct 21]`; the −25% Endurance XP offset is removed (superseded Oct 21) |
| Both | Duration | **3 real days**, each resetting at the player's local midnight `[DECIDED Oct 21]`, or lifted early (see below) |

**Rules**
- **Shown before choosing:** the curse is printed on the item's card in the djinn's offer.
- **It ends:** after its duration, or lifted at the Church (ties into the parked blessing mechanics). `[OPEN]` whether the Church is the only early cure.
- **Endured reward only for the full course:** lifting the curse early (for example at the Church) forfeits it. That gives the player a choice: safety now, or ride it out for the reward.
- **Never sold:** no RMAT or real-money cure (business-model rule 5.1).
- **Bounded:** it never stacks with another djinn curse; a second cursed pick refreshes the timer instead.
- **Symbol:** an original icon, distinct from Injured and Broken by **shape**, not only color (for example a stoppered bottle with a curl of smoke). The tooltip shows the curse name, each effect, time left and how to lift it.

**Simulation, Oct 21** (`curse_sim.py`, 1,000 runs per row, 40 s pacing, decided regen and 5% heal cost; scouting not modelled):

| Set | Run length | Runs ending Downed | HP lost / field h | Nutrition / field h | Rations / field h |
|---|---|---|---|---|---|
| No curse | 39 min | 38% | 1,054 | 50 | 2.0 |
| Hollow only | 39 min | 38% | 1,054 | 75 | 3.0 |
| Hunted only, ×1.25 | 12 min | 46% | 1,614 | 62 | 2.5 |
| Hunted only, ×1.5 | 9 min | 55% | 1,875 | 68 | 2.7 |
| **Both, ×1.25** | **12 min** | **46%** | **1,614** | **93** | **3.7** |
| Both, ×1.5 | 9 min | 55% | 1,875 | 102 | 4.1 |

Rations per field hour = nutrition ÷ 25 (the model refills the meter at each run start, so its own ration count undercounts).

1. **Hunted ×1.25 does what Sam asked:** runs drop from 39 to 12 minutes and more end Downed. ×1.5 adds little extra shortening but pushes Downings to 55%, so ×1.25 is the recommended start.
2. **The two parts compound.** Hollow alone is +50% food; with Hunted, the extra damage needs extra healing, which Hollow makes more expensive: +86% food per field hour.
3. **Unplanned side effect:** Hunted raises damage taken per hour by 53%, which speeds Endurance XP. ~~First resolved with a printed −25% Endurance XP offset.~~ **Superseded Oct 21 (Sam):** the −25% is removed; an unlisted "Endured" reward is granted instead (see the Curse end row).
4. **At 6 s pacing** every set's runs last 1–3.5 minutes; the curse can't be judged there. Same dependency as FOOD-01 O3.

**Rerun at the recommended pacing (BALANCE-03 round 8, Oct 21, 90 s):** the curse cuts field time from 30% to 11% for its 3 days, raises Downings 1.9 → 2.7 a day, and *lowers* daily food use and Endurance XP (−44% without the offset) because the survivor rests far more. A per-hour offset would have deepened a day-level loss. **Resolved Oct 21 (Sam):** the unlisted "Endured" reward (about 3,600 Endurance XP) when the curse runs its full course. Without the offset the curse costs about 4,700 Endurance XP over 3 days; with the reward the net is about −1,100. The curse stays a net cost, softened by the reward.

**Scouting penalty guards `[DECIDED Oct 21]` (rules); numbers are starting values in the data table:**
- **Floor:** scouting never drops below 80% of its normal chance, whatever the curse is tuned to.
- **Fading:** the penalty shrinks as the curse wears off (−20%, −10%, −5% by day).
- **Exemptions:** story, quest and Fort discoveries are never affected, so a curse can't block the main storyline.

**Scouting test, Oct 21** (`scout_sim.py`, 20,000 players per row). No scouting numbers exist in the records, so the base discovery chance was tested at 30%, 50% and 70%, with an assumed 10% of finds exempt; **Code's real base chance replaces these test values** in the round 8 rerun.

| Setup | Finds lost over the 3 cursed days |
|---|---|
| Flat −20%, no guards | about 20% |
| Flat −20% + floor | about 20% (floor never triggers at −20%) |
| **Fade 20 / 10 / 5 + all guards (decided)** | **about 10–13%** |
| Flat −40%, no guards | about 40% |
| Flat −40% + floor | about 20% |
| Fade 40 / 20 / 10 + all guards | about 15–17% |

- The result is the same at every base chance and scouting rate: the share lost depends on the penalty, not on how much a player scouts.
- In finds: at a 50% base chance, a casual scout (1 a day) loses about 0.2 finds over the whole curse; an active scout (5 a day) about 0.8.
- **Fading does the real work.** The floor is idle at today's values; it is a **safety rail** against harsher tuning later (it halves a −40% curse to −20%).

**Why Discovery:** the reward may come from Discovery (D10), and the curse costs discovery while scouting. The price matches the prize.

## 3. ~~Wish prompt security~~ — superseded Oct 21 (free text removed; kept as the record of why)

The prompt is a text box, so it is treated as untrusted input from the first draft.

| # | Protection | Why |
|---|---|---|
| S1 | **Never execute or evaluate the input.** It is only compared against item names | Free text that reaches code paths is how injection happens |
| S2 | **Display as plain text only**, never as HTML or markup, in the log, the return report or anywhere else | Stops script or markup injection in the log screen |
| S3 | **Length cap** (starting value 40 characters) and an **allowed character set** (letters, numbers, spaces, hyphen, apostrophe) | Blocks oversized or malformed input that could crash the UI or bloat the save |
| S4 | **Normalize before matching** (case, extra spaces, look-alike Unicode characters) | Stops tricks that make two strings look the same |
| S5 | **Store the matched item ID, never the raw text**, in the save | Save transfer between Steam and mobile carries only clean data |
| S6 | **Raw text is never sent anywhere** (no telemetry, no cloud) and is discarded once matched | Nothing the player types leaves their device |
| S7 | Code adds tests for oversized input, markup characters, Unicode look-alikes and empty input | Security rules need observable checks like any other rule |

**Pattern:** this is an **allowlist** (only known-good values pass) rather than a **blocklist** (try to catch every bad value). Allowlists are the safer default because you can't predict every bad input.

## 4. Previous offer ideas (superseded by D5)

1. **Wish.** A short list of wishes, each strong but bounded: for example, restore one rusted skill to its floor, fully clear stress, or name one item to find on the next run. No wish skips a level or a floor.
2. **Trade.** The djinn asks for something the player values (a legendary fish, a trinket, a crafted item) and gives a rare reward in return. The player sees both sides before agreeing.
3. **Story or quest.** A short quest line, its own lore, with a unique reward at the end. Could lead to a faction or the Lodge.

## 5. Open

- `[OPEN]` **Oct 27 conflict (Sam's fishing decisions, `fish-01-fishing-concept.md`):** the legendary chance is now 0.1% per tick roll (was 3% of fish), and five legendary fish are gifted to the Lady of the Lake. The gate value (5) and the "about 100 / 26 visits" estimate need a rerun. Recommended: the gate counts legendaries **caught**, so gifting them never closes it.
- `[OPEN]` **Once per save, or repeatable?** Recommendation: the first meeting is unique; later meetings are possible but rarer, so the gate stays meaningful.
- `[CONCEPT Oct 21]` **Danger** as a visible metric (Sam). Recommended: build it on the existing square `threatLevel` plus modifiers such as the curse, rather than a new number.
- `[OPEN]` Does "never trading" also mean items the djinn grants **can't be traded or sold** afterward?
- `[OPEN]` Confirm P10–P16 (roll once, three kinds, tier window, full stack from item data).
- `[OPEN]` **Name and look.** The djinn as a figure is shared folklore; this djinn's name, art, dialogue and rewards must be original.
- `[OPEN]` `[CODE]` Whether the haul or the Food slot holds the bottle (depends on FOOD-01 O7, fish stored as items).

## 6. Watch for

- **Odds too low to be seen.** The first idea (0.00001%) worked out to about 3,000 years for one player. Rare content still has to be reachable, or the work is never seen.
- **A wish that breaks the economy.** Test every wish against the business-model rule and the rust and floor systems before it ships.
