# MED-01 — Crude Crutch and Improvised Splint (Oct 30)

**Status:** `[DECIDED Oct 30, Sam]` and **BUILT** (batch A, Oct 30). The three items left open in
§4 were answered by Sam on Oct 30 and are recorded in §5.

## 1. What is already there

`game/crafting.js:13` already holds the recipe:

```js
{ id:'crude_splint', name:'Crude Splint', icon:'🩼', tier:0,
  out:[{n:'Trace RMAT',q:2}], cost:{wood:10,cloth:8}, time:240,
  unlock:'Scavenge Camp (Rank 1)', enemy:'Crawler' }
```

It is a **material converter**: wood and cloth in, 2 Trace RMAT out. Nothing medical. Its art is
also already wired — both HTML files map `crude_splint` to `crude-splint-v3.png`, and all 89
recipe-art mappings resolve to real files.

The wound track is `status.wounds`, an index 0–3 (Healthy, Scratched, Wounded, Badly Hurt) defined
at `game/progression.js:175`. `progression.js:223` already performs the exact step-down the splint
needs, when resting:

```js
if (s.wounds > 0) { s.wounds = Math.max(0, s.wounds - 1); }
```

## 2. Decisions (Sam, Oct 30, voice)

| # | Decision | Tag |
|---|---|---|
| M1 | Rename the item **Crude Crutch**. Keep the id `crude_splint` so existing saves survive | `[DECIDED]` |
| M2 | Art switches to **`crude-splint-v2.png`** (the forked branch, which Sam reads as a crutch) | `[DECIDED]` |
| M3 | `crude-splint-v1.png` (slats and binding) is **reserved by Sam** for something else, and is *not* the splint upgrade | `[DECIDED]` |
| M4 | The recipe **stops outputting Trace RMAT**. It produces the crutch itself, qty 1. Cost unchanged: wood 10, cloth 8 | `[DECIDED]` |
| M5 | The crutch is **reusable with durability**, not consumed on use | `[DECIDED]` |
| M6 | Use steps the wound down one tier (Badly Hurt → Wounded → Scratched) | `[DECIDED]` |
| M7 | **Break chance rises 8% per use**, cumulative: 8%, 16%, 24% … guaranteed by the 13th | `[DECIDED]` |
| M8 | Trace RMAT's job is to **unlock the next medical tier**, not to be an output | `[DECIDED]` |
| M9 | The upgrade is the **Improvised Splint**: heals more, gives HP regen, lasts a little longer | `[DECIDED]` |
| M10 | Its regen is a **short burst after each use**, lasting **2 in-game hours** (~2 real minutes) | `[DECIDED]` |

### Durability maths behind M7
A cumulative 8% per use gives a mean life of about **4 uses**, with a hard ceiling of 13. Sam
confirmed ~4 feels right. The Improvised Splint at 6% per use averages about **5**.

## 3. `[PROPOSED]` values for the audit
Every number here is Claude's placeholder and belongs in a named constant, never inline.

- Improvised Splint unlock: **Trace RMAT 10**
- Improvised Splint craft cost: **wood 15, cloth 12**
- Regen burst size: **+50% hpRegen** for 2 in-game hours; re-use refreshes, never stacks
- Break chance per use: **8%** crutch, **6%** splint

## 4. Open (as written Oct 30, before the build)
- `[OPEN]` The Improvised Splint has **no art**. M3 rules out v1, so it needs its own —
  queued as `tools/art-gen/prompts/improvised-splint-icon.md`.
- `[OPEN]` Does the crutch occupy a gear slot while carried, or sit in the stash until used?
- `[OPEN]` M4 removes a Trace RMAT source. Check nothing else depended on `crude_splint` as an
  RMAT route before shipping.

## 5. Answers to the open items (Sam, Oct 30)

| Was open | Answer | Tag |
|---|---|---|
| Does the crutch occupy a gear slot, or sit in the stash? | **Stash.** Medical aids carry no slot and are used at base from the Stats page | `[DECIDED Oct 30, Sam]` |
| M9 "heals more" — how much more? | **The same one tier as the crutch.** The regen burst and the longer life are what make the splint the upgrade | `[DECIDED Oct 30, Sam]` |
| Does the Trace RMAT unlock consume the 10? | **Yes, spent.** A one-time purchase, so Trace RMAT gains a real sink | `[DECIDED Oct 30, Sam]` |
| M4 removes a Trace RMAT source — did anything depend on it? | **No.** `crude_splint` appeared only in its own recipe and the two art maps, and four other recipes still produce Trace RMAT (Scrap Pouch 3, Nail Board 2, Scrap Wire 4, Tinder Bundle 2) | Verified in code |

Still open: `[OPEN]` the **Improvised Splint has no art**. It ships on its emoji (🪢); the recipe art
map has no entry for it. Queued as `tools/art-gen/prompts/improvised-splint-icon.md`.

## 6. Build record — batch A (Oct 30)

| File | Change |
|---|---|
| `game/items.js` | `ZI.MED_AIDS` config; the two gear items (`cat:'medical'`, no slot); use-count store; `medAidBreakChance`; `medAidBlocker`; `useMedAid`; the Trace RMAT unlock; the regen-burst store |
| `game/crafting.js` | `crude_splint` renamed Crude Crutch, `kind:'gear'`, grants the item instead of Trace RMAT; new `improvised_splint` recipe; `ZI.recipeGate` / `ZI.medRecipeGate` |
| `game/progression-live.js` | the regen burst multiplies the rest-regen rate |
| `progression-ui.jsx` | Use buttons and the unlock button, beside Eat and Nap |
| both HTML entry points | art → `crude-splint-v2.png`; the crafting browser gates through `ZI.recipeGate`; cache-bust → `20261030-med01` |
| `tests/med-01-crutch-splint.test.js` | new, 40 checks |

### Two existing tests needed a change
- `tests/bug-fixes.test.js` B1 selected "the first `kind:'gear'` recipe", which the crutch now shadows.
  Since medical aids are deliberately not equippable, B1 now selects a gear recipe whose item has a
  slot. The invariant it tests is unchanged.
- `tests/split-equivalence.test.js` compares the legacy monolith against the split modules. The new
  MED-01 symbols were registered in its documented `ADDED` allowlist, as earlier features did.

### `[PROPOSED]` values still unconfirmed
Splint craft time **600 s**, craft cost **wood 15 / cloth 12**, and its icon **🪢**. Every number
lives in a named constant (`ZI.MED_AIDS`, `ZI.MED_SPLINT_UNLOCK`) rather than inline.

### Not committed with this batch
Another session is writing hand-tool code into `game/items.js` at the same time. Only the MED-01
block was staged from that file; their work stays uncommitted in the working tree.
