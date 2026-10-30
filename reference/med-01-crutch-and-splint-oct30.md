# MED-01 — Crude Crutch and Improvised Splint (Oct 30)

**Status:** `[PROPOSED — pending systems audit]`. Design decided by Sam in the Oct 30 voice
session. **Not built** — Batch A is blocked on another session's uncommitted edits to
`game/crafting.js` and `game/items.js`.

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

## 4. Open
- `[OPEN]` The Improvised Splint has **no art**. M3 rules out v1, so it needs its own —
  queued as `tools/art-gen/prompts/improvised-splint-icon.md`.
- `[OPEN]` Does the crutch occupy a gear slot while carried, or sit in the stash until used?
- `[OPEN]` M4 removes a Trace RMAT source. Check nothing else depended on `crude_splint` as an
  RMAT route before shipping.
