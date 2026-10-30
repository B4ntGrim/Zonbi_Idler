# BESTIARY-02 — Categorical tier definitions from the sprite art (Oct 30)

**Status:** `[PROPOSED]`. Built from `art/zombies/` (60 game sprites, IDs 49–108), the tier folders
in `art/zombies/generated-originals/bestiary-49-108/`, and the catalog at
`art/reference/generated-sprite-sources/Bestiary 49-108/` (`index.csv`, `prompts.md`, `README.md`).

> Derived from the art **catalog and measured sprite geometry**, not from viewing the pixels — this
> session has no way to open the images. Every rule below is checkable against a file, so Sam or Code
> can confirm by eye.

## 0. Resolved Oct 30

`[DECIDED Oct 30]` **Art IDs 49-108 are canon** (§1 is settled). `[DECIDED Oct 30]` The growing
sprite size is intentional - the zombies mutated and grew. `[DECIDED Oct 30]` S = 68 px, SS = 76 px.
See `reference/bestiary-03-ss-tier-roster-oct30.md`.

## 1. The art is a second roster

`bestiary-data.js` holds **45** zombies, IDs 1–45. The art holds **60**, IDs **49–108**. The ID
ranges do not overlap and **no sprite in `art/zombies/` maps to a live bestiary entry.** The two were
built separately. One link exists: art ID 100 "The Iron Titan" is described as a *heavy chained
behemoth*, which is live bestiary ID 45 "Chained Behemoth" under another name.

`[OPEN]` Which roster is canon — do the 60 art entries replace the 45, extend them to 105, or does
the art get re-pointed at existing IDs? **Nothing else in this document can be built until that is
decided.**

## 2. Rule 1 — sprite height is the tier (measurable, already true)

Every sprite in a tier shares an exact pixel height. This is the hardest tier definition in the
project and it is already in the files:

| Tier | Height | Width range | Avg bytes | Entries |
|---|---|---|---|---|
| F | **50 px** | 35–45 | 2.5 KB | 5 |
| E | **50 px** | 37–112 | 3.6 KB | 7 |
| D | **50 px** | 40–66 | 3.4 KB | 7 |
| C | **54 px** | 42–84 | 4.0 KB | 8 |
| B | **58 px** | 55–94 | 5.0 KB | 8 |
| A | **64 px** | 71–123 | 7.9 KB | 8 |
| S | **72 px** | 76–107 | 8.6 KB | 8 |
| BOSS | **86 px** | 112–132 | 13.8 KB | 9 |

**Why it matters:** F, E and D share 50 px — the early game reads as *one* silhouette band, and the
player's first sense of escalation comes from detail, not size. Size only starts climbing at C, then
accelerates (+4, +4, +6, +8, +14). The jump to BOSS is the largest in the set.

`[PROPOSED]` Make this a rule, not an accident: **tier height is fixed per tier and new art must
match it.** Width stays free so silhouettes differ.

## 3. Rule 2 — archetype ladders run *through* the tiers

The art's real structure. Each archetype family reappears at several tiers, escalating. A tier is
therefore **a rung, not a category**:

| Family | F–E | D–C | B–A | S | BOSS |
|---|---|---|---|---|---|
| Conductive | Static Shuffler (E) | Volt Surger (C) | Bio-Electric Monstrosity (A) | Storm Caller | The Storm Sovereign |
| Immolation | Cinder Runner (E) | Thermite Walker (C) | Napalm Stalker (B) | Inferno Engine | The Ash Emperor |
| Frostbite | — | Frost Smite (D) | Cryo Executioner (B) | Glacial Leviathan | The Sub-Zero Colossus |
| Toxic gas / wretched | Spore Carrier (E) | Plague Matron (C) | Toxic Behemoth (A) | Toxin Sovereign | The Plague Archon |
| Acid vomit | — | Goo Vomiter (D), Corrosive Bloat (C) | Caustic Mortar (B) | — | — |
| Creeper / stealth | Muck Lurker (E) | Phantasm Walker (C) | Gloom Assassin (B) | Void Phantom | The Void Harbinger |
| Runner | Cinder Runner (E), Hollow Leaper (E) | Leaping Strangle-Imp (C) | Apex Hunter (A) | — | The Apex Prime |
| Heavy / armored | Rusted Guard (E) | Shatter-Bone Bruiser (D), Riot Pacifier (C), Slag Enforcer (C) | Exoskeleton Remnant (B), Dread Dreadnought (A), Slag Titan (A) | Epitaph Warden | The Iron Titan, The Undying Goliath |
| Signal imp | Siren Stumper (E) | — | Blight Screamer (B) | — | — |
| Burrower | — | Grave Digger (D) | Subterranean Stalker (A) | — | — |
| Grayscales | — | Phantasm Walker (C) | Surgical Abomination (A) | — | — |
| Stun-locker | — | Wire-Bound Crawler (D) | Chain-Whip Warden (B) | Epitaph Warden | — |

**Why it matters:** this is exactly the "thematic identity" pillar — the player learns a *counter*
(insulation for conductive, fire resistance for immolation) at a low tier and reuses it for twenty
levels. It also tells the loot tables what to do: a family's drops should be consistent up its
ladder, with tier setting quantity and rarity rather than kind.

`[PROPOSED]` **Every new enemy joins an existing family or starts one that is planned to climb.**
A one-off at a single tier teaches the player nothing.

**Gaps the table exposes:** acid vomit, signal imp, burrower and grayscales all stop before S. Either
they finish their ladders or they are deliberately early-game families — a decision, not an oversight.

## 4. Rule 3 — effect magnitude, not just effect presence

The same family's VFX scale by tier, and the prompts are consistent about it:

| Tier | Effect language |
|---|---|
| F | "minor puddles", "faint smoke wisps" — barely any |
| E | "miniature sparks", "dripping slime" — one small localized effect |
| D | "cold vapor", "glowing stomach" — one effect, clearly visible |
| C | "a ring of crackling current", "controlled white-hot streams" — effect surrounds the body |
| B | "blazing fire trail", "high-arc fluid" — effect leaves the body and moves |
| A | "arcs splitting across tissue", "dense billowing cloud" — effect engulfs the body |
| S | "a raging vortex of plasma", "venting from a reactor core" — effect has a source organ |
| BOSS | "a massive sphere", "a freezing aura that crystallizes the air" — effect reshapes the scene |

`[PROPOSED]` Use this as the art brief for every new sprite and for **animation**: the frame count and
motion budget should follow the same ladder (see §6).

## 5. Rule 4 — naming convention encodes tier

- **F:** mundane, pitiable — Soggy Slump, Frail Husk, Tangled Drifter
- **E–D:** function + flaw — Rusted Guard, Flash-Blind Stalker, Decay Launcher
- **C–B:** role + weapon — Riot Pacifier, Chain-Whip Warden, Cryo Executioner
- **A:** creature nouns and body plans — Centipede Host, Dread Dreadnought, Apex Hunter
- **S:** titles of rank — Sovereign, Overlord, Warden, Collector, Leviathan
- **BOSS:** **all nine begin with "The"** — The Iron Titan, The Apex Prime

`[PROPOSED]` Reserve the definite article for BOSS. It costs nothing and it means the player can
read the threat from the name alone, before the sprite loads.

## 6. What this means for animation `[CONCEPT Oct 30 — Sam will do these later]`

Precedent in `art/zombies/animations/grayscales/`: 4-frame sheets plus a GIF for 075 (Phantasm) and
090 (Surgical), both built from the originals, not the game sprites.

`[PROPOSED]` Tie the frame budget to the tier ladder above, so animation effort tracks threat:

| Tier | Frames | Covers |
|---|---|---|
| F–D | 4 | idle, walk, attack, death |
| C–B | 6 | + hit reaction, special |
| A | 8 | + the family effect as its own loop |
| S | 10 | + a telegraph before the special |
| BOSS | 12+ | + phase shift (the prompts already describe multi-phase forms) |

Sprite height is fixed per tier (§2), so a sheet is `frames × width` at the tier's height — the
geometry is already decided.

## 7. This supersedes part of TIER-02

`reference/tier-02-ss-boss-split-oct30.md` proposed inventing **3 new SS zombies**. The art makes
that unnecessary and gives a better answer.

The prompts already split the top of the ladder in two. IDs 92–99 are written as **"elite boss"** and
titled by rank; IDs 100–108 are written as **"overlord / titan / master / ultimate endgame"** and all
start with "The". They are two different things wearing one tier letter.

`[PROPOSED]` **SS = art IDs 92–99** (8 entries, 72 px, elite bosses the player meets in the field).
**BOSS = art IDs 100–108** (9 entries, 86 px, placed and scripted). The live roster's own S entries
stay S and need art at **72 px**… which collides with SS's height.

`[OPEN]` If SS takes 92–99, S needs its own height. Suggest **S = 68 px**, SS = 72, BOSS = 86, so the
ladder stays strictly increasing. This changes §2's table and must be settled before any new art.

This also resolves TIER-02 T7: no invented placeholders, and TIER-02's harness check still holds —
8 SS entries sit in the same draw-weight range the 3-entry placeholder was testing.

## 8. Open

- `[OPEN]` §1 roster canon — blocks everything else.
- `[OPEN]` §7 S vs SS heights.
- `[OPEN]` Do the unfinished family ladders in §3 get completed?
- `[OPEN]` The live bestiary's 45 entries have no sprites in `art/zombies/`. Where is their art, and
  does `zombie-sprites.js` point at these files or at something else?
