# Zed Idler — Faction Quests, Travel and POI Density (Design Brief)

**Status:** `[PARKED]` until POI Framework v1 is complete and the faction quest system is scheduled. Concept captured Oct 9; updated Oct 9 (the world expands).
**Companion to:** `wandering-tab-spec.md` (v2.1), `poi-framework-v1-brief.md`, `wandering-fort-scene.md`, and the parked site briefs (`wandering-church-scene.md`, `wandering-workshop-scene.md`, `wandering-horde-ground-scene.md`).
**Tags:** `[DECIDED]` confirmed by Sam · `[CONCEPT]` Sam's direction, details not settled · `[PROPOSED]` draft · `[OPEN]` needs a decision

**Origin:** a design idea raised while deciding Church and Workshop placement (Oct 9). This brief develops it so it is ready to discuss when it comes off the shelf. Nothing here is approved for implementation.

---

## 1. Purpose

Three systems exist without a shared story purpose: the map (where things are), factions (who the player answers to), and POIs (what the player can do at a site). This brief connects them.

- **The map decides where opportunities are.** Sites are placed by density, so the farther a player travels, the more they find.
- **Reputation decides who offers work.** Factions offer quests that match how much they trust the survivor.
- **Travel decides what happens along the way.** A route between cells can run into another faction, and that meeting can grow into story.

*Why it matters for design:* without this link, exploration has no direction beyond loot, reputation has no use beyond trade, and POIs are destinations nobody sends you to. With it, one quest can touch all three systems at once, which fits working agreement 8 ("systems should touch each other").

---

## 2. What Sam described (Oct 9) `[CONCEPT]`

- The world is randomly generated, so **distance traveled determines how many Churches and Workshops a player sees.** Site count is not fixed per world.
- **The world is not a fixed size** `[DECIDED Oct 9]`. It keeps expanding as the player travels, **at the player's own risk**.
- Factions offer **quests per opportunity**, and **reputation decides which quests appear.**
- **Some quests relate to Churches and Workshops; some do not.** For example, the Hearthguard might ask the survivor to reach a Church.
- **Travel can bring an altercation with another faction** along the way, which develops more story.
- The details are not settled. This is a parked concept to be worked out.

---

## 3. Density-based placement `[PROPOSED]`

### 3.1 How it works

- The map is divided into **grids**, the same unit the POI framework already uses for Water (each grid's seed places its own POIs). This brief calls them regions only where the word reads better; they are the same thing. `[PROPOSED]`
- Each region rolls its POIs from a value computed from **the world seed, the region's coordinates and the POI type**. The same world always produces the same sites in the same cells.
- A region is generated when it first matters (when the player can see or travel into it), not all at once. Nothing is saved until a site is discovered; before that, the seed can always regenerate it.
- Each POI type declares its own **chance per region** and its own **placement constraints**, using the POI framework's per-type exclusions (framework Section 5).

*Why:* a fixed count per world has to be rebalanced whenever the map size changes. A density works for any map size, and it ties the number of sites a player meets to how far they explore.

### 3.2 Starting values `[PROPOSED, tune by playtesting]`

| POI type | Chance per region | Min. distance between two of this type | Soft guarantee |
|---|---|---|---|
| Workshop | 40% | 4 cells | At least one within 6 cells of the start |
| Church | 12% | 8 cells | None (rarity is the point) |
| Horde Ground | Per its brief (1–2 per region group) | Per its brief | None |
| Water | Existing rule (0–3 per grid) | — | — |

### 3.3 Avoiding droughts and clusters

Pure chance can put three Churches side by side, or none across a huge stretch. Two tools prevent that:

1. **Minimum spacing.** A site cannot be placed within its type's minimum distance of another of the same type. If the roll would break the rule, the site moves to the nearest valid cell in its region, or is skipped.
2. **Soft guarantees.** For sites that keep play healthy (Workshops keep long runs alive), the first region that would break the guarantee is forced to place one.

*Why soft guarantees only for Workshops:* Churches and Workshops do not gate core progression, so randomness is allowed (working agreement 6). A Workshop drought, though, makes stress and wear feel unfair early in a save. A Church drought only makes Churches feel rarer, which is intended.

### 3.4 Distance scaling `[OPEN]`

Sam's direction that expansion is **at the player's own risk** `[CONCEPT]` means danger should rise with distance from the start. The open question is what happens to *sites* as danger rises.

Should sites change with distance from the start? Options:

- **A. Flat.** Same odds everywhere. Simplest.
- **B. Richer farther out.** Higher tiers at the same sites (a far Workshop offers better bench work). Rewards exploration without flooding the map.
- **C. Rarer farther out.** Fewer sites in dangerous land. Raises the stakes of long trips.

Recommended starting point: **B**, because it makes distance a reward without making the far map empty. Risk rising with distance and reward rising with it is the same push-or-bank ladder the Horde Ground uses, applied to the whole map.

### 3.5 Questions this raises for the POI framework `[OPEN]`

- **The world expands** `[DECIDED Oct 9]`, so every POI type needs a per-grid rule, never a per-world count. The framework already places Water per grid, so this fits; the framework's placement section now states it as a rule for every POI type.
- The framework's "one major POI per cell" rule still applies. When two types roll the same cell, a fixed priority order decides (proposed: Fort > Horde Ground > Church > Workshop > Water).
- The updated Workshop brief says Workshops are "placed at world generation." If this approach is adopted, that becomes "placed by seeded generation of each region."

---

## 4. Faction quests `[PROPOSED]`

### 4.1 Two kinds of quests

| Kind | What it is | Example | Who writes it |
|---|---|---|---|
| **Story quest** | A hand-written beat in a faction's storyline | Fallow Ground; the Sealed Crate | Written content |
| **Opportunity quest** | A short job built from a template and filled in from the world | "Reach the Church at D5 and bring back a blessing" | Templates plus world data |

*Why both:* story quests carry the plot but are expensive to write. Opportunity quests fill the space between them with variety at low cost. Content volume is already the largest risk to the first release (lead brief 7.1, item 9), so most repeat play should come from templates.

### 4.2 Reputation decides what is offered

| Standing with the faction | What they offer |
|---|---|
| Hostile or Hunted | Nothing |
| Wary | Rare low-trust errands, often on harder terms (as at the Fort gate) |
| Stranger | Simple errands near their territory |
| Neutral, Known | Destination quests (reach a site, deliver, escort) |
| Allied and above | Story quest chains and quests that involve other factions |

- Under **Heinous** policy, every faction is hostile, so no faction offers quests. The **Lodge** still offers paid jobs at Wary, matching its role as the neutral broker (spec 4.5). `[PROPOSED]`
- Policy shapes the **flavor**, not the availability: a Criminal survivor might be offered a smuggling version of the same delivery quest.

### 4.3 Opportunity quest templates `[PROPOSED]`

| Template | Goal | Typical POI link |
|---|---|---|
| Reach | Travel to a site and report back | Church, Workshop, or any known site |
| Deliver | Carry an item to a site or settlement | Often a story item (weight only, no pocket; Fort brief 12.6) |
| Escort | Bring an NPC safely to a destination | The Lodge, a Church |
| Clear | Clear a cell (uses the cell clear target) | Any cell; same rule as Fallow Ground |
| Recover | Bring back an item from a site | Workshop (a part), Church (a blessed material) |
| Investigate | Find out who or what is behind something | Leads to a story quest |

Not every template uses a POI. A Clear or Escort quest can happen anywhere, which matches Sam's "sometimes related to Churches and Workshops, sometimes not."

### 4.4 Choosing the target

- A quest that needs a site picks one from the world. It prefers a site the player has already **discovered**, then one that is **suspected**, and only then generates a new lead.
- If the quest needs a site the player has never seen, the quest **reveals it as Suspected** on the map (POI framework Section 6). The quest becomes the reason the player learns a site exists.
- Higher standing reaches farther: Stranger quests stay within a short distance of the faction; Allied quests can send the player across regions. `[PROPOSED]` distance bands set in data.

*Why:* this is how density placement and quests connect. The seed decides where Churches are; a faction quest is often how the player finds one.

### 4.5 Limits

- Up to **3 active opportunity quests** at a time, plus any story quests `[PROPOSED]`. This keeps the quest log readable.
- Opportunity quests expire after a set time (starting 3 in-game days) if not accepted. Accepted quests do not expire.
- No quest can be required for core progression. Story quests that gate progression are hand-placed, never generated (the same rule that fixed the first Fort).

---

## 5. Travel events: altercations along the way `[PROPOSED]`

### 5.1 How an altercation happens

- While a survivor is travelling on a quest route, the run can roll a **route event** involving a second faction.
- The second faction is drawn from factions **present in that region** `[OPEN: regions would need faction presence, a new concept]`. Faction presence could also come from density placement: each region rolls which factions are active there.
- The event follows the existing **event-driven rivalry** rule (spec 4.3): helping one faction costs standing with the other. No fixed rival table is added.
- The **hexagon** applies if it turns physical (spec 5): the survivor's aligned faction changes the fight or evade odds.

### 5.2 Player attention

Faction NPC encounters are automatic today (spec 13.1). A quest altercation is a story moment, so it should be attended, like a Fort. Proposed rule:

- A route altercation shows a **prompt with a timer**, like a discovery prompt (spec 13.2): side with the quest giver, side with the second faction, or avoid it.
- If unanswered, the **policy default** decides. Ethical avoids; Immoral and Criminal side with whoever pays more; Heinous attacks. `[PROPOSED]`
- Altercations roll **only while the player is present**, never offline, so the background engine cannot make a story choice for the player.

`[OPEN]` This makes altercations a second exception to "faction encounters are automatic." Decide whether that is acceptable, or whether altercations should resolve automatically and appear in the return report.

### 5.3 How altercations become story

- An altercation can leave a **follow-up**: the second faction remembers, and its next quest offer refers to it.
- A chain of altercations with the same faction can unlock a **story quest**. This is how procedural play feeds authored story.
- Altercations can involve only **introduced** factions. Factions not yet introduced appear as **unnamed groups** (Fort brief 11.4), so a random event cannot spoil a story introduction (the same rule that protects later Forts, spec 2.5).

---

## 6. Idle fit

- Quests set a **destination**; the survivor's policy still runs the trip. The player chooses the route (change route costs stress, spec 13.4); the policy handles the encounters.
- Quest steps that need a choice wait for the player, but the run never stalls: the survivor keeps patrolling, and the quest stays pending. This keeps "nothing waits on the player" (spec 13.2) true for the run, if not for the quest.
- The **return report** lists quest progress made while away (cells cleared, distance travelled toward a target).

---

## 7. Economy notes

- Quest rewards are a new **source** (standing, materials, sometimes items). Add them to the source/sink audit (lead brief 7.1, item 4) next to the Horde Ground, Church and Workshop.
- Reputation gains from opportunity quests follow the existing ±50 cap per event (spec 4.2).
- Rewards should favor **standing and access** over raw materials, so quests deepen the faction system instead of flooding the economy.

---

## 8. Risks

| Risk | Why it matters | Mitigation |
|---|---|---|
| Procedural quests feel generic | Templates repeat quickly | Keep templates few and clear; use them as filler between written story beats, not as the story |
| Content volume | Every faction needs flavor text per template | Write per-faction text for the most common templates only; share the rest |
| Quest log clutter | Too many offers overwhelm an idle player | The 3-quest limit and expiry (4.5) |
| Spoiling story introductions | A random quest names a faction too early | Only introduced factions in quests and altercations (5.3) |
| Two exceptions to automatic encounters | Too many prompts make players ignore them | Decide 5.2 deliberately; keep altercations rare |

---

## 9. Integration notes (for the developer, later) `[PROPOSED]`

- **Placement:** `RegionGen.Generate(seed, regionX, regionY)` returns the POIs for a region; deterministic, no save needed until discovery. Each POI definition carries `densityChance`, `minSpacing` and `softGuarantee` in the POI data table.
- **Quests:** a `QuestTemplate` data table (goal type, giver faction, minimum standing, target rule, reward, expiry). Opportunity quests are built from templates and world data, never hard-coded.
- **Route events:** use the shared `RollEncounter` and `ResolveEncounter` functions (spec 10), with `playerPresent` required for altercations.
- **State:** active quests saved under a `zi_quests` key; altercation memory as a small per-faction record.
- All XP through `ZI.emitAction`; all standing changes through `ReputationService.Apply` (±50 cap, Lodge clamp).

---

## 10. Open questions

1. ~~Is the world bounded or expanding?~~ **Resolved Oct 9: it expands, at the player's own risk.**
2. Distance scaling: flat, richer farther out (recommended), or rarer farther out? How fast does danger rise with distance?
3. Starting densities per grid (3.2).
4. Do regions have faction presence? If so, is it seeded per region?
5. Are quest altercations prompted (proposed) or automatic with a report line?
6. Active quest limit and expiry time.
7. Which templates ship first, and which factions get custom text?
8. Does the Lodge offer jobs to a Heinous survivor (proposed: yes, paid)?
9. Camp Leader version: can squads take quests? (Park for later.)
