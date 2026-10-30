# BESTIARY-03 — SS tier: height ladder and the three SS zombies (Oct 30)

**Status:** decisions in §1 are `[DECIDED Oct 30]` by Sam. The three designs in §3 are `[PROPOSED]`
— names especially. Sam is providing the sprite art.

## 1. Locked decisions (Sam, Oct 30)

| # | Decision | Tag |
|---|---|---|
| C1 | **Art IDs 49–108 are the canon roster** (60 entries). The old 45-entry `bestiary-data.js` roster is superseded | `[DECIDED Oct 30]` |
| C2 | Growing sprite size across tiers is **intentional design**: the zombies have mutated and grown, so a higher tier reads as a physically bigger, scarier target | `[DECIDED Oct 30]` |
| C3 | Tier **S = 68 px** | `[DECIDED Oct 30]` |
| C4 | Tier **SS = 76 px** | `[DECIDED Oct 30]` |
| C5 | SS is a real tier, separate from BOSS, with **3 new zombies** | `[DECIDED Oct 30]` |

### The height ladder

| Tier | F | E | D | C | B | A | S | SS | BOSS |
|---|---|---|---|---|---|---|---|---|---|
| Height | 50 | 50 | 50 | 54 | 58 | 64 | **68** | **76** | 86 |
| Step | — | 0 | 0 | +4 | +4 | +6 | +4 | **+8** | **+10** |

**Why 76 and not 72:** the steps have to keep *growing* for C2 to land. 72 would give +4 then a +14
jump to BOSS — the mutation appears to stall exactly where the player should feel it worst. 76 gives
+4 / +8 / +10, so every top-tier encounter is visibly larger than the last.

**Consequence:** art IDs **92–99 are currently 72 px and become S at 68 px**. Eight sprites need
re-rendering, not rescaling — a non-integer downscale of pixel art destroys the pixel grid.

## 2. What SS *is*

S and BOSS already have identities in the art. SS needs its own or it is just a stat band.

| Tier | Identity | Naming |
|---|---|---|
| S (92–99) | Solitary elites. A single powerful thing, titled by rank | Rank nouns: Sovereign, Overlord, Warden, Collector, Leviathan |
| **SS (new)** | **Commanders.** They do not merely fight the survivor, they *direct other zombies* | Substance + an office of command |
| BOSS (100–108) | Singular scripted entities, placed not roamed | All begin with **"The"** |

**Why commanders:** it gives SS a mechanical reason to exist rather than "S but bigger", and it is the
one role the roster is missing. Grave Overlord (S) summons minions as a flourish; for SS it should be
the whole point. It also makes SS the right final rung for families whose lower tiers are about
*affecting the battlefield* rather than hitting hard.

## 3. The three SS zombies `[PROPOSED]`

Each one completes an archetype ladder that currently dies out before the top (BESTIARY-02 §3).
Picked so the three cover three different threats: area denial, horde control, and ambush.

### SS-1 · Vitriol Warlord — acid vomit family
Completes **Goo Vomiter (D) → Corrosive Bloat (C) → Caustic Mortar (B) → _Vitriol Warlord_**.
A bloated commander plated in its own hardened secretions, directing lesser acid types to spit in
volleys. Where the Caustic Mortar lobs one arc, this one calls a barrage.
**Art brief (76 px):** heavy low-slung torso, dorsal pouch grown into a cluster of vent-stacks,
bright yellow-green fluid under visible pressure, hardened crust armour over a soft glowing core.
**Effect band (SS):** the effect has a source organ — venting under pressure from a visible gland.

### SS-2 · Carillon Tyrant — signal imp family
Completes **Siren Stumper (E) → Blight Screamer (B) → _Carillon Tyrant_**.
A bell-tower of a creature hung with scavenged alarm horns and church bells fused into its ribs. It
does not attack much; it *calls*, and the surrounding squares answer. The direct counter to a player
who fights everything instead of hiding.
**Art brief (76 px):** tall narrow silhouette against the squat Warlord, ribcage opened into a bell
housing, brass and rust against grey flesh, visible sound rings rather than a particle cloud.
**Effect band (SS):** concentric sound as a *structure*, emanating from the chest cavity.

### SS-3 · Bedrock Marshal — burrower family
Completes **Grave Digger (D) → Subterranean Stalker (A) → _Bedrock Marshal_**.
Surfaces only to mark a target, then goes under and sends others up. The ambush commander: the threat
is never where it is standing.
**Art brief (76 px):** half-emerged from fractured ground, broad shovel-plated forelimbs, stone and
root fused into its back, dust sheeting off it. Its 76 px must be measured on the *visible* body so it
still reads as the tallest thing on screen when fully surfaced.
**Effect band (SS):** ground fracture radiating from a point it controls.

## 4. Why these three and not others

The unfinished ladders were acid vomit, signal imp, burrower and **grayscales** (Phantasm Walker C →
Surgical Abomination A → ?). Grayscales is deliberately left out: it is the only family with
animation work already done (`art/zombies/animations/grayscales/`, 4-frame sheets for 075 and 090),
so its capstone should be designed alongside that animation pass rather than ahead of it.

`[OPEN]` Does grayscales get a fourth SS entry later, making SS a 4-slot tier?

## 5. Naming note

Names are `[PROPOSED]` and the weakest part of this document — Sam should overrule freely. The rule
that matters is §2: **SS names take an office of command** (Warlord, Tyrant, Marshal), S takes a rank
of status, and only BOSS takes "The". If the names change, keep that distinction.

## 6. Follow-on work

1. `bestiary-data.js` rebuilt on IDs 49–108 (C1) — a batch of its own, and it touches saves, the
   Codex, loot tables and `zombie-sprites.js`.
2. Re-render 92–99 at 68 px (§1).
3. TIER-02 updated: ranks become 0–8 with SS at 7, and its T7 ("3 invented SS zombies") is now this
   document.
4. Sam provides SS sprite art at 76 px.

## 7. Update Oct 30 (later) — SS is four, Grave Overlord promoted

`[DECIDED Oct 30]` Sam's team is drawing SS sprites for **Grave Overlord, Vitriol Warlord, Carillon
Tyrant and Bedrock Marshal**. Grave Overlord (art ID 95) was an S entry; it moves up to SS at 76 px.
Sam notes this was not the original intent but is going ahead with it.

**Consequences:**

| Item | Before | After |
|---|---|---|
| SS roster | 3 invented | **4** — 3 invented + Grave Overlord |
| S roster | 8 (IDs 92-99) | **7** (92-94, 96-99) |
| Re-renders | 92-99 all to 68 px | 92-94 and 96-99 to 68 px; **95 to 76 px** |
| Grayscales `[OPEN]` | might make SS a 4th slot | moot - SS is already 4. A grayscales capstone would make it 5 |

**Naming holds.** "Overlord" is an office of command, so §2's rule survives the promotion: S takes a
rank of status, SS takes an office of command, BOSS takes "The". Grave Overlord already summons
minions, which is the SS identity, so it is arguably a better SS than an S.

### `[OPEN]` Grave Overlord vs Bedrock Marshal — family collision

Two of the four SS entries now sit in the same thematic space. The burrower ladder is **Grave Digger
(D) -> Subterranean Stalker (A) -> ?**, and "Grave Overlord" reads as that ladder's capstone by name
alone. Bedrock Marshal was designed to fill exactly that slot. Options:

1. **Grave Overlord takes the burrower ladder; Bedrock Marshal is cut or re-themed.** Cheapest, but
   the team is already drawing Bedrock Marshal.
2. **Split the two: Grave Overlord commands the *risen* (summons from corpses), Bedrock Marshal
   commands the *buried* (sends ambushers up from below).** Distinct mechanics - one creates new
   zombies, the other repositions existing ones. Recommended, and it needs no art change.
3. Rename Grave Overlord to break the "Grave" echo with Grave Digger.

Option 2 is preferred: it keeps both sprites and gives each a mechanic the other does not have.

## 8. SS mechanics without extra animation `[DECIDED Oct 30]`

**The rule.** Each SS commander gets **one static sprite plus the standard base frames**. Its mechanic
shows up only through combat rules, a status icon and a line of combat text. No summon, burrow or
special-effect animations. The commander identity from §2 is carried by what the fight *does*, not by
what the sprite does.

| Commander | Mechanic |
|---|---|
| **Grave Overlord** | One extra zombie is added to that encounter |
| **Bedrock Marshal** | Ambush - the other zombies in the encounter strike first |
| **Vitriol Warlord** | Acid ground - the survivor takes a small amount of damage each round the fight goes on |
| **Carillon Tyrant** | The call - after it is beaten, a higher chance of another encounter straight away. Hiding counters it |

This settles the §7 overlap: **the Overlord adds bodies, the Marshal controls who strikes first.**

`[OPEN]` All exact numbers - extra-zombie tier, chip damage per round, the Tyrant's encounter-chance
bump - go to a balance pass in `tools/balance-sim/`.

### 8a. Implementation note - encounters are currently 1v1 `[FLAG]`

Checked against live source before writing this section. `game/wandering.js:334 resolveEncounter`
takes a **single** zombie (`enc.z`) and calls `ZI.simulateCombat(sb, eb, ...)` with **one** enemy stat
block. There is no multi-enemy encounter in the game today.

So two of the four land differently than the wording suggests:

| Commander | Fits today? | Why |
|---|---|---|
| Vitriol Warlord | **Yes** | Combat is round-based, so per-round chip damage is a direct addition |
| Carillon Tyrant | **Yes** | `rollEncounter` already decides the next encounter; this is a weight bump |
| Bedrock Marshal | **Needs restating** | "The other zombies" implies a group. There is only one enemy |
| Grave Overlord | **Needs restating** | "An extra zombie added" implies a second combatant |

**`[PROPOSED]` 1v1-compatible restatements** - same player-facing feel, no new combat model and still
no animation:

- **Bedrock Marshal:** *the Marshal takes the opening strike.* The survivor loses the first round's
  attack. Ambush is preserved, and it is a single flag on the round order in `simulateCombat`.
- **Grave Overlord:** *on defeating it, the fight chains immediately into a second encounter* against
  a lesser zombie it raised, with no chance to retreat between them. Reuses the existing encounter
  flow rather than building group combat, and "it adds bodies" still reads true.

Building real multi-enemy combat is the alternative, but that is a large slice and would pull in
animation work for simultaneous enemies - the thing this section exists to avoid. Sam to `[DECIDE]`
between the restatements and the group-combat build before Code starts.

### 8b. SS-BG-01 — background minions `[IMPLEMENTED Oct 30]`

Commanders now show 2-3 lesser zombies standing behind them. **Visual only.** They are not
combatants, take no turns, deal and take no damage, and change no XP, loot or encounter odds.
`resolveEncounter` and `simulateCombat` are untouched - combat is still strictly 1v1.

- `zombie-sprites.js`: `MINION_POOL` (11 F/E sprites), `COMMANDER_IDS` / `COMMANDER_TIERS`,
  `isCommander()`, `commanderMinions()`. Seeded off the encounter id, so a fight shows the same
  retinue live and on replay. BOSS is wired but switched **off** (`COMMANDER_TIERS.BOSS = false`).
- `screens-v3.jsx`: `minionMetricsFor()` and a retinue layer at `zIndex 9`, behind the commander's
  10. Darkened to 65% brightness, offset left/right/centre, some mirrored, each on a different walk
  phase so they do not step in unison. Hidden on the commander's death frame.
- Reduced motion: `.zi-threat-minion` added to the existing `prefers-reduced-motion` rule.

**Correction to the batch brief.** It asked for minions at native size with no scaling. The renderer
does not work that way: `zombieMetricsFor` already scales *every* sprite to its tier height via CSS
`scale`, so nothing is drawn at native size today. Minions therefore run through the same path at
F-tier height - visibly smaller than the commander, and consistent with the rest of the renderer
rather than a second sizing rule. `imageRendering: pixelated` is kept throughout.

`[OPEN]` Only one commander is live: bestiary id 22, which wears the Grave Overlord sprite (095).
The other three have no bestiary entries - `bestiary-data.js` is still ids 1-45 while the art is
49-108. They turn on for free once that roster is rebuilt. Also `screens-v3.jsx:2138 TIER_RANK` has
no `SS` and caps at 7; that is TIER-02's job, not this batch.
