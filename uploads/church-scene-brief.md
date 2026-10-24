# Zed Idler — The Church Scene (Design Brief)

**Status: `[PARKED — revisit after the comfort-items system exists]`**
The Church is not part of the current build sequence and must not expand the scope of the carrying, charges, stress or comfort batches. Its open questions are deliberately left unresolved.

**Companion to:** `wandering-tab-spec.md` (v2.0), `wandering-fort-scene.md`.
**Captured:** Oct 3 (brainstorm). **Disposition recorded:** Oct 3, after design review.
**Tags:** `[DECIDED]` confirmed by Sam · `[PROPOSED]` draft · `[PARKED]` deliberately deferred · `[OPEN]` needs a decision

---

## 0. Disposition (Oct 3) `[DECIDED]`

**The Church is not required for the core comfort/stress progression.** Basic and core comfort items must be obtainable through the normal game systems without finding a Church. The Church, if retained, provides **advanced, distinctive or specialized** comfort options. This is not tied to a numeric "top tier".

*Why:* comfort gear is part of the stress system, which decides forced retreat and Gauntlet preparation. Core progression must not depend on a random world discovery (spec 2.5, the same rule that fixed the first Fort's placement).

---

## 1. Purpose

The Church is a rare, repeatable Traversal site that can give looted-out cells a lasting reason to exist and offer specialized comfort options.

*Why it may earn its place:*
- **It redeems rot into calm.** The comfort line's theme is making peace in a cruel world; the Church can turn tainted inputs into calming materials for specialized comfort gear.
- **It keeps cleared cells alive.** A Church makes a looted-out cell a destination. Cleared cells are already calm ground in the stress system (spec 13.8).
- **Economy role `[PARKED]`:** to be described later using the terms in section 7.

It must not become a second Lodge, a free stress reset, or a mandatory chore between Wandering runs.

---

## 2. Placement and availability

- **A rare, persistent Traversal site once discovered; repeatable once found.** `[DECIDED concept]`
- Like the Fort, it is a site with its own interaction screen in the terminal style, not an auto-resolved event. `[DECIDED]`
- Exact placement and discovery rules: `[PARKED]`. Because the Church no longer gates core comfort progression, it does not need guaranteed near-start placement. When revisited, prefer **world-seeded persistent placement** unless the later Traversal/discovery design gives a compelling reason otherwise.

---

## 3. The interaction screen

Candidate options (the set is not final; see sections 4–6):
1. **Bless an item** `[PROPOSED concept]`
2. **Remove stress** `[PROPOSED]`
3. **Trade** `[PARKED]` — the Church may not need a shop at all.

---

## 4. Blessing (specialized comfort supply)

- The player gives a **tainted input** plus an **offering** and receives a **calming material**. `[PROPOSED concept]`
- **Normal comfort crafting exists independently of the Church. Church-derived materials may later be required for Church-specific/advanced comfort recipes.** `[DECIDED]`
- **Blessing output: `[PARKED]`.** The earlier "one grade up" and "Tier-N plus" statements contradicted each other and are withdrawn. When the comfort-item system is designed, revisit whether blessing produces:
  - a single sanctified/comfort material whose yield depends on input quality; or
  - another model shown to fit the actual comfort recipes.

  Do **not** create six parallel blessed-RMAT tiers or ordinary RMAT tier upgrading unless that is explicitly chosen later.
- Two blessing speeds (instant basic versus a longer timed blessing for a better result) remain `[PROPOSED]`. Any timer should reuse the game's existing timed-job system rather than a new one.
- Exact recipes, inputs and costs: `[PARKED]`.

---

## 5. Remove stress `[PROPOSED]`

Intended principle:
- situational field relief;
- limited by cost and availability;
- never an unlimited stress reset;
- never better than the primary rest/recovery system.

Exact amount, charges, cooldown and refresh rules: `[PARKED]` until stress and recovery are implemented and measurable.

---

## 6. Trade `[PARKED]`

Buy/Sell is moved from decided to parked. Do not assume the Church needs a shop. Its trade function, if any, is reconsidered after the game's normal trade/currency model and the Lodge's final role are established. The Church must not become a second general-purpose Lodge.

---

## 7. Economy terminology (for when the brief is revisited)

Distinguish:
- **item/material sinks** (items or materials leave the game);
- **item/material sources** (items or materials enter the game);
- **currency sinks** (currency leaves);
- **currency sources** (currency enters).

Selling to a vendor is an item/material sink **and** a currency source; do not describe it simply as a "sink".

---

## 8. Behavioral constraints (no implementation names until implementation)

- Whether a Church has been found persists per world.
- Any timed work settles on read and respects the 24 h offline cap, like crafting.
- Stress changes go through the stress system's single change path, so caps and multipliers apply.
- XP from Church actions goes through the single XP path.
- Data (inputs, recipes, numbers, stock) lives in tables, not code.

---

## 9. Open questions `[PARKED]`

1. Placement and discovery; whether a found Church is marked on the map.
2. Blessing output model (section 4).
3. Stress-removal numbers (section 5).
4. Blessing costs, inputs and any timer lengths.
5. Whether the Church trades at all, and its relationship to the Lodge (section 6).
6. Church-specific comfort recipes.
7. Camp Leader version (parked, like the Fort).
