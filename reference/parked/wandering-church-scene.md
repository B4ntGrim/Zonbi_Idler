# Zed Idler — The Church Scene (Design Brief)

**Companion to:** `wandering-tab-spec.md` (v2.1), `wandering-fort-scene.md`. Read those first; this document adds the Church.
**Status:** `[PARKED]` until POI Framework v1 is complete **and** the comfort-items system exists. Do not implement Church gameplay yet.
**History:** brainstorm Oct 3 · Oct 3 design-review disposition (recovered Oct 9 from `uploads/church-scene-brief.md`) · Oct 9 repeatable-POI decision. Earlier wording that was replaced is kept in Section 10 as history.
**Tags:** `[DECIDED]` confirmed by Sam · `[PROPOSED]` draft, tunable · `[PARKED]` deliberately deferred · `[OPEN]` needs a decision · `[SUPERSEDED]` historical, not in force

---

## 0. Disposition `[DECIDED Oct 3; confirmed Oct 9]`

- **Basic and core comfort items are available independently of the Church.** They come from the normal game systems (crafting and loot). `[DECIDED]`
- **The Church is an optional, repeatable POI** that may provide **advanced, specialized or distinctive** comfort options. This is not tied to a numeric "top tier". `[DECIDED]`
- **Church discovery never gates core progression.** `[DECIDED]`

*Why:* comfort gear is part of the stress system, which decides forced retreat and Gauntlet preparation. Core progression must not depend on a random world discovery (spec 2.5, the same rule that fixed the first Fort's placement).

---

## 1. Purpose

The Church is an optional, repeatable Traversal site that offers specialized comfort options and gives looted-out cells a lasting reason to exist.

*Why it may earn its place:*
- **It redeems rot into calm.** The comfort line's theme is making peace in a cruel world. The Church can turn tainted inputs (rotten flesh, rotten clothing) into calming materials for specialized comfort gear.
- **It keeps cleared cells alive.** Once a cell is looted dry it normally goes dead. A Church makes that cell a destination. Cleared cells are already calm ground in the stress system (spec 13.8).
- **Economy role `[PARKED]`:** to be described when blessing and trade are revisited (Sections 4 and 6).

It must not become a second Lodge, a free stress reset, or a mandatory chore between Wandering runs.

---

## 2. Placement and availability

- **A repeatable POI type** `[DECIDED Oct 9]`: a world can hold more than one Church, each with its own `poiId` (POI Framework v1, Section 3). Churches stay rare.
- **Reusable once found.** A Church that exists can be used again and again. `[DECIDED]`
- *Why:* rarity makes finding one feel like something; repeatability makes it a destination rather than a one-time blessing the player can miss forever.
- Like the Fort, a Church is a **site with its own interaction screen** in the terminal style, not an auto-resolved event. `[DECIDED]`
- Placement, discovery and map marking follow the POI framework (Sections 2, 6 and 8 there). Because the Church does not gate core progression, it needs no guaranteed near-start placement.
- `[OPEN]` How many Churches per grid, and their placement constraints.

---

## 3. The interaction screen

Candidate options; the set is not final:

| Option | Status |
|---|---|
| Bless an item | `[PROPOSED concept]` — see Section 4 |
| Remove stress | `[PROPOSED]` — see Section 5 |
| Trade (buy and sell) | `[PARKED]` — the Church may not need a shop at all (Section 6) |

The earlier four-option screen (Bless, Remove stress, Buy, Sell) is `[SUPERSEDED]`; see Section 10.

---

## 4. Blessing (specialized comfort supply)

- The player gives a **tainted input** plus an **offering** and receives a **calming material** for Church-specific comfort recipes. `[PROPOSED concept]`
- **Normal comfort crafting exists independently of the Church. Church-derived materials may later be required for Church-specific or advanced comfort recipes.** `[DECIDED]`
- **Blessing output: `[PARKED]`.** When the comfort-item system is designed, decide whether blessing produces:
  - a single sanctified/comfort material whose yield depends on input quality; or
  - another model shown to fit the actual comfort recipes.

  Do **not** create six parallel blessed-RMAT tiers or ordinary RMAT tier upgrading unless that is explicitly chosen later.
- **Two blessing speeds** `[PROPOSED]`: an instant basic blessing (material offering only) and a longer timed blessing for a better result, where the altar works while the player is away. Any timer reuses the game's existing timed-job system, not a new one.
- The bless list shows blessable items only. `[PROPOSED]`
- Exact recipes, inputs and costs: `[PARKED]`.

---

## 5. Remove stress `[PROPOSED]`

Principles:
- situational field relief;
- limited by cost and availability: a **material cost**, a **set number of charges**, then a **cooldown**;
- **never an unlimited stress reset**;
- never better than the primary rest and recovery system.

*Why:* without these limits the Church becomes a free reset button the player taps whenever stress nears 100, which would undercut the stress system (spec 13.8). The cost is material, charges and time, never real money.

Exact amount, charges, cooldown and refresh rules: `[PARKED]` until stress and recovery are implemented and measurable.

---

## 6. Trade `[PARKED]`

The Church may not need a shop at all. If trade is revisited, these constraints from the earlier draft apply:
- **Buy/sell spread:** buy price must sit far enough above sell price that the player cannot cycle materials for profit.
- **Don't displace the Lodge.** The Lodge is the neutral broker and safety net (spec 4.5). A Church outlet would be a narrow local convenience, not a replacement broker.

The earlier shop design is kept in Section 10.

---

## 7. System touchpoints

| System | What the Church does |
|---|---|
| Traversal | An optional, rare, repeatable site; gives looted-out cells a lasting purpose |
| Stress (13.8) | Limited, charge-gated field relief `[PROPOSED]`; never a free reset |
| Comfort gear | Specialized or advanced comfort options only; core comfort comes from normal systems `[DECIDED]` |
| Crafting | Church-derived materials may later feed Church-specific recipes; output model `[PARKED]` |
| Economy | Role `[PARKED]` until blessing and trade are revisited |
| Trade / factions | `[PARKED]`; must not displace the Lodge |

---

## 8. Integration notes (for the developer, later) `[PROPOSED]`

- Data: a Church POI definition in the POI framework's data table (repeatable type, its own placement constraints). Per-instance state is saved through the framework, keyed by `poiId`.
- Blessable inputs, recipes, timers and stress-relief numbers live in data tables, not code.
- Timed blessings reuse the existing timed-job system and settle on read, so they work offline under the 24 h cap.
- Stress removal goes through the stress system's single change function, so caps and multipliers apply.
- Any XP goes through `ZI.emitAction` (spec 7, fix #4).

---

## 9. Open questions

1. How many Churches per grid, and their placement constraints? `[OPEN]`
2. Blessing output model and the Church-specific comfort recipes. `[PARKED]` until the comfort-item system is designed
3. Stress-relief numbers: amount per use, charges, cooldown, refresh rule. `[PARKED]` until stress and recovery are measurable
4. Whether the Church has trade at all. `[PARKED]`
5. The Church's relationship to the Lodge, if trade returns. `[PARKED]`
6. Camp Leader version of the Church. `[PARKED]`

---

## 10. History `[SUPERSEDED]` — not in force

Kept so the reasoning is not lost. None of these rules apply.

- **Four-option screen `[DECIDED]` → superseded by the Oct 3 disposition.** Bless, Remove stress, Buy, Sell. *Why four:* each option touched a different system (crafting, stress, trade, economy).
- **"Where the Fort gates factions, the Church gates comfort" → superseded.** Contradicts the disposition: the Church never gates core comfort.
- **"Blessing = RMAT plus", one grade up on the six-tier RMAT spine (Tier-2 in, "Tier-2 plus" out) `[DECIDED]` → withdrawn.** It contradicted the "Tier-N plus" wording elsewhere; blessing output is now `[PARKED]` (Section 4).
- **"RMAT-plus is the only ingredient for comfort gear, and the Church is the only source of it" → superseded.** Directly contradicted the disposition (Section 0).
- **RMAT-plus comfort-only at first `[PROPOSED]` → moot** while the output model is parked.
- **Two blessing tiers `[DECIDED concept]` → kept as two blessing speeds `[PROPOSED]`** (Section 4).
- **Remove stress `[DECIDED concept, PROPOSED numbers]` → now `[PROPOSED]`**, with the limits in Section 5.
- **Shop `[DECIDED]` → `[PARKED]`.** Buy: a curated, possibly rotating stock of trinkets the crafting tree does not produce, plus basic materials as a supply line when a cell is looted dry. Sell: items and materials, including surplus low-tier RMAT, as a sink.
- **Economy note:** the Church as an RMAT sink (blessings) and source (basic materials) → role `[PARKED]` (Section 1).
- **Sample screen** (historical):
```
[TRAVERSAL D5] > Structure: CHURCH
  The pews are gone. The altar is not.
  Stress: 52/100   Blessings ready: 1   Calm charges: 2
  > BLESS     > REMOVE STRESS     > BUY     > SELL     > LEAVE
```
