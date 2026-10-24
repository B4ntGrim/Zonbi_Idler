# Zed Idler — The Church Scene (Design Brief)

**Companion to:** `wandering-tab-spec.md` (v2.1), `wandering-fort-scene.md`. Read those first; this document adds the Church.
**Status:** `[PARKED]` until POI Framework v1 is complete. Brainstorm captured Oct 3; updated Oct 9 (Church is a repeatable POI). Everything is `[PROPOSED]` unless tagged otherwise.
**Tags:** `[DECIDED]` confirmed by Sam · `[PROPOSED]` draft · `[OPEN]` needs a decision

---

## 1. Purpose

The Church is a repeatable Traversal site that gives the comfort and stress system its own supply chain and gives looted-out cells a lasting reason to exist. Where the Fort gates factions, the Church gates **comfort**.

*Why it matters for design:*
- **It redeems rot into calm.** The comfort line's theme is making peace in a cruel world. The Church turns tainted inputs (rotten flesh, rotten clothing) into calming materials, so comfort gear is *redeemed*, not merely crafted.
- **It keeps cleared cells alive.** Once a cell is looted dry of RMAT it normally goes dead. A Church makes that cell a permanent destination. Cleared cells are already calm ground in the stress system (spec 13.8), so a Church in a cleared cell is somewhere the player *chooses* to return to.
- **It feeds the economy.** The Church is both a sink (sell back surplus, consume RMAT in blessings) and a source (buy basic materials when the map runs thin).

---

## 2. Placement and availability `[DECIDED concept, PROPOSED specifics]`

- **A repeatable POI type** `[DECIDED Oct 9]`: a world can hold more than one Church, each with its own `poiId` (POI Framework v1, Section 3). Churches stay rare.
- **Reusable once found.** A Church that exists can be used again and again. `[DECIDED]`
- *Why:* rarity makes finding one feel like something; repeatability makes it a destination rather than a one-time blessing the player can miss forever.
- Like the Fort, a Church is a **site with its own interaction screen** in the terminal style, not an auto-resolved event. `[DECIDED]`
- Placement, discovery and map marking follow the POI framework (Sections 2, 6 and 8 there).
- `[OPEN]` How many Churches per world, and their placement constraints.

---

## 3. The interaction screen: four options `[DECIDED]`

1. **Bless an item** — chosen from a dropdown filtered to blessable items.
2. **Remove stress** — for a material cost, with a set number of charges and then a cooldown.
3. **Buy** — trinkets and basic materials.
4. **Sell** — items and materials back to the Church.

*Why four:* rich without overwhelming, and each option touches a different system: crafting, stress, trade and the economy.

Sample screen (terminal style) `[PROPOSED]`:
```
[TRAVERSAL D5] > Structure: CHURCH
  The pews are gone. The altar is not.
  Stress: 52/100   Blessings ready: 1   Calm charges: 2
  > BLESS     > REMOVE STRESS     > BUY     > SELL     > LEAVE
```

---

## 4. Option 1 — Bless an item (comfort supply chain) `[DECIDED concept]`

- The player gives a **tainted input** (for example rotten flesh or rotten clothing) plus an **offering**, and receives a **calming material** used to craft comfort gear.
- **Blessing = RMAT plus.** The blessed material is not a new material line. It is RMAT run through the altar and bumped **one grade up** on the existing six-tier RMAT spine (T0 Trace to T5 Exotic Echo). Tier-2 RMAT in, "Tier-2 plus" out. `[DECIDED]`
- RMAT-plus is the **only** ingredient for comfort gear, and the Church is the **only** source of it. This is the in-world reason a flower hat can hold its own against a helmet.
- **Scope `[PROPOSED]`:** RMAT-plus is **comfort-only** at first, not usable in regular crafting, to protect the theme and contain balance. Revisit later if a general upgrade station is wanted.
- **Two blessing tiers `[DECIDED concept]`:**
  - **Basic blessing:** material offering only. Instant. Lower-grade output.
  - **Greater blessing:** material offering **and a timer**. The altar works while the player leaves, does a run and returns. Higher-grade output. This is idle work, like a craft or a wander.
- *Why two tiers:* players in a hurry take the cheap instant result; patient players invest materials and time for a better one. It mirrors the Fort's two ways through the gate.
- The bless dropdown shows **blessable items only**, so the player is not scrolling the whole inventory. `[PROPOSED]`

**Economy note:** blessings consume RMAT, so the Church is an RMAT **sink**. Idle economies break without sinks. Add RMAT-plus sources and sinks to the economy audit.

---

## 5. Option 2 — Remove stress `[DECIDED concept, PROPOSED numbers]`

- Spending a **material cost** lowers stress.
- **Charge-gated:** a set number of uses, then a **cooldown timer** before the Church will do it again.
- *Why the gate:* without it, the Church becomes a free reset button the player taps whenever stress nears 100, which would undercut the stress system (spec 13.8). The cost is material, charges and time, never real money, which keeps it consistent with the core rule: *never sell relief from a pain the design created*.
- `[OPEN]` Stress removed per use, number of charges, cooldown length, and whether charges refresh on a timer or per in-game day.

---

## 6. Options 3 and 4 — The shop `[DECIDED]`

- **Buy:** trinkets and basic materials.
  - *Trinkets* are a curated, possibly rotating stock of things the crafting tree does not produce (a found charm, a keepsake, a comfort piece with a quirk), so each visit is a small discovery. The Trinket slot is the natural home for pure stress items now that kits no longer use it (spec 13.8).
  - *Basic materials* make the Church a supply line when a cell is looted dry: a **source** to balance the sinks.
- **Sell:** items and materials, including surplus low-tier RMAT the player will never use: another **sink**.

**Watch-outs:**
- **Buy/sell spread.** Buy price must sit far enough above sell price that the player cannot cycle basic materials for profit. `[PROPOSED]`
- **Don't displace the Lodge.** The Lodge is the neutral broker and safety net (spec 4.5). The Church is a local convenience outlet, not a replacement broker; keep its stock and rates narrow. `[OPEN]` confirm the relationship.

---

## 7. System touchpoints

| System | What the Church does |
|---|---|
| Traversal | A rare discoverable site; gives looted-out cells a permanent purpose |
| Stress (13.8) | Charge-gated stress relief; sits naturally in calm, cleared cells |
| Crafting / RMAT | Produces RMAT-plus, the sole comfort-gear ingredient; consumes RMAT as a sink |
| Comfort gear | Supply chain behind the flower hat and other comfort items (paperdoll slots, 13.8) |
| Economy | Sink (blessing cost, sell-back) and source (basic materials) |
| Trade / factions | Local trade outlet; must not displace the Lodge |

---

## 8. Integration notes (for the developer) `[PROPOSED]`

- Data: a Church POI definition in the POI framework's data table (repeatable type, its own placement constraints). Per-instance state is saved through the framework, keyed by `poiId`.
- Blessable inputs, blessing recipes, timers, stress-removal numbers and shop stock live in data tables, not code.
- Greater blessing timers settle on read, like crafting, so they work offline under the 24 h cap.
- Stress removal goes through the stress system's single change function, so caps and multipliers apply.
- Blessing and stress removal award XP through `ZI.emitAction` (spec 7, fix #4).

---

## 9. Open questions

1. How many Churches per world, and their placement constraints?
2. RMAT-plus: comfort-only (proposed) or usable in general crafting later?
3. Stress-removal numbers: amount per use, charges, cooldown, refresh rule.
4. Blessing costs and timer lengths for basic and greater blessings; which grade each produces.
5. Shop buy/sell spread, trinket stock, and whether it rotates.
6. The Church's relationship to the Lodge.
7. Which tainted inputs are blessable, and the comfort-gear recipes built on RMAT-plus.
8. Camp Leader version of the Church (park for later, like the Fort).
