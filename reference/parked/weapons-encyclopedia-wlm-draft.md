**Status:** [PARKED] until H2 closes and Sam schedules weapons work. Filed Oct 12 by Claude Design from Sam's team draft (IWC-WLM-ENG-01, Draft 0.1); Content unchanged except the lines marked **[Oct 12]** (Sam's decisions W1, W2, W5). Not a build input. Governed by `reference/weapons-development-directive.md`. Design review: `DESIGN_HANDOFF.md` (Oct 12).

---

# Zombie Idler — International Weapons Encyclopedia & Weapon Legacy System

**Document ID:** IWC-WLM-ENG-01  
**Version:** Draft 0.1 — 12 October 2026  
**Status:** **PROPOSAL / NOT LOCKED / NO CODE CHANGES AUTHORIZED**  
**Audience:** Game designer, engineering lead, data engineer, balancing engineer, QA  
**Source of truth:** ~~`Zed Idler — Weapon Files Inventory.md` (12 Oct 2026)~~ **[Oct 12, W5]** replaced by `reference/weapon-files-inventory.md` (the original was not found; recreated from the code). Its CB1 table and file map apply.  
**Secondary basis:** The owner's expressed direction and the WLM-01 through WLM-04 design discussion.  
**Important:** Every numeric value outside the locked CB1 table below is a **provisional starting hypothesis for simulation**, *not* an approved balance value. Do not implement it without a signed-off batch.

## 0. Decision register: distinguish what is settled from what is proposed

| ID | Requirement / choice | Status |
|---|---|---|
| S-01 | Fictional international world; equipment from many real-world design traditions | Owner-selected direction; not an implementation contract |
| S-02 | ~~Display actual manufacturers and model names where appropriate~~ | **Superseded [DECIDED Oct 12, W1]:** invented brand and model names; real traditions and countries may inspire them |
| S-03 | Encyclopedia aims at **hundreds** of weapons, not a tiny curated roster | Owner-selected direction |
| S-04 | Survival RPG with meaningful equipment decisions, realistic inspiration, manageable upkeep | Owner-selected direction |
| S-05 | **Hybrid progression:** unique individual weapon XP and transferable survivor weapon-family mastery | Owner-selected direction; implementation not locked. **[DECIDED Oct 12, W2]:** family mastery is a sub-track that feeds the Combat skill, not a second currency |
| S-06 | Weapon XP awarded **at completed encounters** where weapon meaningfully participated | Owner-selected direction |
| S-07 | Successful escape can grant **reduced** XP when a weapon was meaningfully used | Owner-selected direction |
| S-08 | All meaningful contributions during an encounter remain eligible toward final victory, including those preceding failed escape | Owner-selected direction |
| S-09 | Existing CB1 starter values must not be silently modified | Existing closed batch; authoritative |
| P-01 | Escape award multiplier = **0.25** of victory award | Provisional numeric candidate |
| P-02 | At most one encounter settlement; split single item-XP budget among eligible weapons | Proposed architecture |
| P-03 | Downed/forced retreat receives no ordinary encounter-completion weapon XP | Proposed design rule |
| P-04 | First implementation permits weapon switching **between** encounters only | Recommendation, **NOT decided** |
| P-05 | Growth curves, family-mastery conversions, caps and item-instance schema below | Provisional; engineering feasibility review required |

**Stop/go rule:** This document is a *design input*, not `CURRENT_BATCH.md`. No developer should modify `game/`, `tests/`, save migration, loot tables or economy because this draft exists. A separate authorized and locked batch must precede implementation.

## 1. Existing baseline: do not regress

The uploaded inventory establishes that only **CB1's three starter weapons** are fully designed, and CB1 closed 10 Oct 2026. Its exact values are:

| Item | Damage | Mass | Existing unique behavior |
|---|---:|---:|---|
| Nail Bat | **28** | **3.0 kg** | **30% chance to lose its next attack** (heavy swing) |
| Iron Knuckles | **16** | **1.0 kg** | **25% stagger on hit** |
| Pocket Knife | **16** | **0.5 kg** | **+30 escape chance; +5 loot** |

The legacy roster also contains **Crowbar, Steel Baton, Spike Board, Combat Knife**. Their higher-tier balance is **not final**. The source inventory states that general **accuracy, evasion and speed currently change no outcome** and armor disproportionately reduces the usefulness of low-damage weapons. Do not give catalog items or mastery perks bonuses to these ineffective stats as if they already work.

**Local code map given by the source:** `game/items.js` (`ZI.GEAR_ITEMS`), `game/stats.js`, `game/combat.js`, `tests/cb1-starter-weapons.test.js`; consult `reference/starter-weapons-cb1-slice.md`, `reference/wandering-tab-spec.md` §12.7, and `reference/scenario-b-and-first-downed-oct10.md` before altering any behavior. Older Unity and uploaded catalog material is nonauthoritative.

## 2. Player-facing pillars and measurable success hypotheses

1. **Identity:** An owned Pocket Knife and another Pocket Knife of the same model may have different level, condition, name and history. **Acceptance:** both remain distinct through save/load, inventory transfers, and repair.
2. **Experimentation:** Family mastery is survivor-owned and transfers to new weapons in the same family. **Acceptance:** equipping a new family member applies transferable mastery without copying any prior item's XP.
3. **Fairness:** Neither attack speed nor pure raw damage alone dictates XP. **Acceptance:** a weapon with verified stagger or escape contribution can qualify even without dealing the killing blow.
4. **Continuity:** Offline and watched resolution have one award function. **Acceptance:** identical deterministic encounter records produce byte-equivalent XP settlements, regardless of UI presence.
5. **Longevity:** Hundreds of models can be listed without hundreds of bespoke combat code branches. **Acceptance:** adding a *data-only* model with existing traits requires no change to the encounter solver.
6. **Meaningful choices:** A high-level common weapon remains useful, but it does not automatically replicate the capabilities of a rifle or negate ammo scarcity. **Acceptance:** prototype simulations reveal multiple viable equipment choices across defined encounter conditions (thresholds to be approved during balancing).

## 3. Encyclopedia taxonomy and content policy

Catalog hierarchy: **category → family → manufacturer → model → variant**. A specific *owned item instance* points to one immutable catalog `modelId` (and optional `variantId`). Country indicates **design provenance**, not guaranteed place of manufacture, quality or nationality of the owner.

**Proposed primary families:** improvised blunt, compact blunt, utility folding knives, fixed knives, agricultural blades, axes/choppers, pole/long melee, historical blades, handguns, revolvers, submachine guns, shotguns, intermediate rifles, full-power rifles, precision rifles. These are catalog grouping proposals, *not* combat ability definitions.

**Provisional scale plan (300 entries):**

| Catalog pool | Target entries | Notes |
|---|---:|---|
| Improvised and general-purpose tools | 35 | Fictional generic items and recognizable tools |
| Folding and fixed utility knives | 55 | Makers, models, blade families |
| Machetes, agricultural and chopping tools | 35 | Varied regional traditions; avoid flattening distinct cultures |
| Axes, pole tools and historical melee | 35 | Modern tools distinguished from museum/antique finds |
| Pistols and revolvers | 50 | Authentic model descriptions; no unsupported performance claims |
| Shotguns and compact firearms | 35 | Distinguish action categories only after ranged rules defined |
| Rifles and specialist firearms | 55 | Ammunition, noise and upkeep systems must be designed first |
| **Total target** | **300** | Target size, not 300 pre-approved items |

**Catalog admission:** each entry needs a source-checkable manufacturer/model identity, plausible category, accurate geographic provenance label, name collision review, fiction-world acquisition rationale, and at least one distinct *candidate* gameplay identity. Do not invent actual product specifications or infer measurable superiority from country of origin. Item images must be original production art; references do not license reproduction. Real-world brand/model use must pass counsel/platform checks.

### 3.1 Initial candidate seed examples (not a final roster)

| Catalog candidate | Origin / tradition | Category | Potential identity (not a final bonus) |
|---|---|---|---|
| Nail Bat (existing) | Fictional/improvised | Heavy blunt | High impact, heavy-swing drawback; **locked CB1** |
| Iron Knuckles (existing) | Generic | Compact blunt | Stagger; **locked CB1** |
| Pocket Knife (existing) | Generic | Folding knife | Escape and loot; **locked CB1** |
| Crowbar (existing) | Generic | Utility blunt | Heavy salvage utility; unbalanced |
| Steel Baton (existing) | Generic | Compact blunt | Control; unbalanced |
| Spike Board (existing) | Fictional/improvised | Heavy blunt | Crude impact; unbalanced |
| Combat Knife (existing) | Generic | Fixed knife | Dedicated close combat; unbalanced |
| Morakniv Companion | Sweden | Fixed utility knife | Serviceable camp tool |
| Opinel No. 8 | France | Folding knife | Compact utility |
| Victorinox Swiss Army Knife family | Switzerland | Multitool | Survival utility; needs model selection |
| Hultafors Axe family | Sweden | Axe | Field tools; needs model selection |
| Fiskars X-series axe | Finland | Axe | Modern field tool; needs model selection |
| Kukri (generic) | Nepal | Chopping blade | Heavy slash utility |
| Bolo (generic) | Philippines | Agricultural blade | Versatile field blade |
| Golok (generic) | Indonesia | Agricultural blade | Brush clearing |
| Facão (generic) | Brazil | Agricultural blade | Machete utility |
| Billhook (generic) | European traditions | Hooked agricultural blade | Distinct reach/tool utility |
| Machete (generic) | International | Agricultural blade | Tool/weapon tradeoff |
| Glock 17 | Austria (design origin) | Service pistol | Common platform identity |
| Beretta 92FS | Italy | Service pistol | Conventional full-size handgun |
| CZ 75 | Czech Republic | Service pistol | Metal-frame handgun |
| SIG Sauer P226 | Swiss/German design heritage | Service pistol | Premium service-class identity |
| FN Five-seveN | Belgium | Pistol | Unusual ammunition ecosystem |
| Colt M1911 family | United States | Pistol | Historical service design |
| Taurus Model 85 family | Brazil | Revolver | Compact revolver identity |
| Heckler & Koch MP5 | Germany | Submachine gun | Compact long-arm category |
| B&T APC9 | Switzerland | Compact firearm | Modern compact platform |
| Benelli M4 | Italy | Shotgun | Premium shotgun category |
| Beretta 1301 | Italy | Shotgun | Fast-handling shotgun identity |
| Mossberg 500 | United States | Shotgun | Common sporting/service shotgun family |
| FN FAL | Belgium | Full-power rifle | Heavy-rifle class |
| Steyr AUG | Austria | Intermediate rifle | Bullpup packaging |
| CZ BREN 2 | Czech Republic | Intermediate rifle | Modern modular family |
| HK G36 | Germany | Intermediate rifle | Modern service rifle |
| Galil family | Israel | Rifle | Rifle family; choose exact variant later |
| Sako TRG family | Finland | Precision rifle | Specialist role |
| Accuracy International AW family | United Kingdom | Precision rifle | Specialist role |
| Howa 1500 | Japan | Sporting rifle | Bolt-action rifle family |

**Do not equate “candidate included” with authentic local prevalence or suitability to the fictional world's loot table.** The exact models, trademarks, ammunition and balance remain subject to review.

## 4. Proposed data contracts (schematic, not current code)

Three ownership layers:

1. **Model definition** is versioned static content, loaded once from a catalog and indexed by `modelId`.
2. **Owned weapon instance** is persistent, identified by an immutable unique `instanceId` and pointing at one model. This layer stores item XP, level, condition, nickname and summarized history.
3. **Survivor family mastery** is survivor save data keyed by canonical `familyId`; it persists across weapon changes and weapon loss.

Example *illustrative* data; no values beyond CB1 are canon:

```json
{
  "modelId": "generic.pocket_knife.cb1",
  "displayName": "Pocket Knife",
  "manufacturer": null,
  "designOrigin": "generic",
  "familyId": "knife.folding",
  "catalogVersion": 1,
  "base": {"damage": 16, "weightKg": 0.5},
  "traits": {"escapeBonus": 30, "lootBonus": 5},
  "authority": "CB1_LOCKED"
}
```

```json
{
  "instanceId": "illustrative-uuid",
  "modelId": "generic.pocket_knife.cb1",
  "xp": 0,
  "level": 1,
  "durabilityCurrent": null,
  "customName": null,
  "legacy": {"victories": 0, "escapes": 0, "encountersParticipated": 0, "repairs": 0},
  "specializations": []
}
```

```json
{
  "masteryByFamily": {
    "knife.folding": {"xp": 0, "level": 1}
  }
}
```

`durabilityCurrent: null` in example deliberately means **unknown pending existing save audit**, not an instruction to use null in production. The item schema is illustrative until Code verifies the present gear/save representation. Implementing unique IDs may require migration and compatibility logic; do not insert those fields directly into existing saves without a migration plan.

**Catalog data quality validation:** unique model IDs; unique variant IDs within model; canonical family IDs; manufacturer/origin fields verified; no negative mass; required current CB1 traits preserved; model references valid; stable catalog IDs across revisions; duplicate display names allowed only when variant disambiguates.

## 5. XP settlement rules — formal proposed behavior

### 5.1 Completion semantics

An **encounter** is one authoritative logical combat/escape resolution sequence. It may include attacks, stagger, failed escape attempts and weapon changes if later supported. XP is *not* awarded on every action. It is allocated exactly **once**, after an eligible terminal outcome.

| Terminal outcome | Item XP | Family XP | Status |
|---|---|---|---|
| Victory | Full encounter budget split across eligible instances | Derived from eligible item allocation | Direction chosen; formula provisional |
| Successful voluntary/policy escape | Reduced budget split across eligible instances | Derived from eligible item allocation | Direction chosen; numeric multiplier provisional |
| Failed escape, then victory | Final victory award includes meaningful contributions from before failure | Same | Owner-selected direction |
| Downed / involuntary forced retreat | 0 ordinary completion XP | 0 | Proposed, not locked |
| Mere equip, movement, item repair, idle possession | 0 | 0 | Proposed anti-farm rule |
| Failed escape, then unresolved encounter | No award until final eligible resolution | No award | Proposed |

**Contribution evidence (eligible):** at least one successful damaging hit; at least one *actually applied* stagger/control effect; or an escape modifier actually used during an eligible escape attempt (including a failed attempt followed by eventual victory). Repeated failed attempts with the same weapon grant no additional contribution credit merely by being repeated. A missed swing or Nail Bat's lost next attack does not qualify on its own. Pocket Knife's loot modifier alone does not qualify for combat XP.

**Critical semantic nuance:** “escape bonus used” means the authoritative escape evaluation actually incorporated it. We do not require counterfactual proof that the attempt would have failed without the bonus. Merely equipping a knife with no escape evaluation does not qualify.

### 5.2 Candidate numeric prototype (all **UNLOCKED**)

These are deliberately concrete *experiment inputs* for Code/QA, not a request to balance or implement:

- Base win award `B`: **100 abstract XP units per standard-relevance encounter**.
- Successful escape outcome multiplier `m_escape`: **0.25** (25 XP at standard relevance).
- Downed multiplier `m_downed`: **0**.
- Encounter relevance multiplier `R`: **clamped to [0.10, 1.50]**; the actual mapping from threat to `R` is **TBD** because threat/armor normalization is unfinished.
- Item XP total budget per completed encounter: `floor(B × R × outcomeMultiplier)`; **never exceeds** this total across all weapon instances.
- Family XP prototype: `floor(itemXpAwarded × 0.50)` for each eligible family, summed within a family. ~~Treat as **separate mastery currency**~~ **[Oct 12, W2]:** a sub-track that feeds the Combat skill; the feed rule is designed in Phase 4.
- For a one-weapon encounter, that one qualified instance receives **100%** of item budget.
- For multi-weapon encounters, contribution weights are not decided. **Test candidate:** one qualifying flag per category (damage/control/escape) per item; normalized weights; total conserved. Do **not** ship this method without reviewing free-switch gaming, impact and skill traits.
- XP award may be **0 after flooring** for low-relevance outcomes; a positive eligibility flag does not promise a positive quantity in every case. Review whether a minimum of 1 should apply to valid encounters.
- Award must not depend directly on number of attack attempts, attack frequency or repair actions.

**Illustrative examples with R = 1:**

| Example | Eligible weapons | Total item XP | Family XP example |
|---|---|---:|---:|
| Victory, one qualified weapon | 1 | 100 | 50 |
| Successful escape, qualified Pocket Knife escape bonus | 1 | 25 | 12 |
| Downed and forced retreat | Any | 0 | 0 |
| Five failed knife escape attempts then victory | 1 | 100, **not 500** | 50 |
| Victory, two qualifying weapons | 2 | **100 total**, split TBD | At most 50 total under prototype conversion (rounding permitting) |

**Do not extrapolate expected levels/hour from these examples.** Encounter rates, armor and threat scaling are not specified by the uploaded inventory.

### 5.3 Candidate level curves (all **UNLOCKED**)

- Individual item level starts at `1`, item XP starts at `0`.
- Proposed **XP required to advance from level L to L+1**: `ceil(100 × L^1.35)` XP; re-evaluate after 1h/24h/30d simulations.
- Family mastery level starts at `1`; proposed advancement threshold: `ceil(180 × L^1.4)` mastery XP.
- Level counter may grow indefinitely as storage permits, **but mechanical gains must have bounded or diminishing returns**. No damage, accuracy, evasion, stagger, escape, speed or loot per-level bonus is approved.
- Candidate presentation milestones: level **10**, **25**, **50**, **100**, **250**, **500** unlock *cosmetic or recordkeeping only* until perks are designed.
- Avoid writing mastery XP for model families that have not been assigned a canonical family ID.

**Design principle:** high levels should show commitment without letting a level-500 Pocket Knife act as every weapon class at once.

## 6. Durability, repair, replacement and item identity

**Proposed invariant:** If an item remains in inventory as an instance, condition changes must not reset its XP, level, nickname, earned history or item ID.

- **Normal wear:** use existing wear/repair rules. No new durability values or wear multipliers are specified here.
- **Zero durability:** Code must first report actual existing behavior (retained broken item vs deleted/despawned item). Do **not** promise preservation of an item that the current game destroys without explicitly revising destruction semantics.
- **Repair:** restores durability under existing mechanics and does not grant weapon or mastery XP. History may increment `repairs` if a successful repair is durably recorded.
- **Upgrade/modification:** retains instance identity and progression unless a later approved transformation rule explicitly creates a new item. Never silently duplicate instance IDs.
- **New item of same model:** starts fresh item XP and level, inherits only *survivor-owned family mastery* effects.
- **New model in same family:** also benefits from family mastery; item XP does not transfer.
- **Sale, discard, transfer, salvage:** family mastery stays with survivor. A physical item's history travels with that exact item only if inventory transfer/trading is supported. Treat irreversible destruction separately.
- **Naming and nostalgia:** renaming does not affect model identity or stats. No free XP for name changes or moving items to stash.

## 7. Anti-exploit and concurrent-state controls

**Non-negotiable correctness invariants:**

1. **One authoritative encounter → at most one progression settlement.** A failed escape attempt is a contribution, not an XP settlement.
2. **Atomic or idempotent settlement:** the outcome and settlement indicator must be committed together, or repeated application must be safely rejected. Exact approach depends on present save architecture.
3. **Stable item identity:** weapon `instanceId` cannot be silently reused by multiple copies; awards must target the participated instance, not just catalog model.
4. **Conserved encounter budget:** sum item XP allocations <= encounter item-XP budget. Family XP generated by a separately defined conversion, no duplicated family pools.
5. **No possession/repair/swap farming:** idle equipment time, out-of-combat swaps, repair loops and multiple failed escapes alone create no XP.
6. **Two-tab hazard:** encounter ID alone **does not guarantee** protection if separate tabs simulate copies of a save and both write outcomes. Code must audit ownership/locking, stale-write detection and cross-tab synchronization before declaring duplicate-award prevention complete.
7. **Save/reload:** no reroll of earned outcome, replay of settlement, or reset of item XP; legacy saves without new fields must migrate explicitly.
8. **Overflow and performance:** level/XP stored within supported numeric precision and bounded save footprint; aggregate history counters rather than persisting unlimited attack logs.

Suggested conceptual settlement record:

```json
{
  "encounterId": "seeded-session:encounter-42",
  "outcome": "victory",
  "eligibleContributors": [
    {"instanceId": "knife-A", "damage": false, "control": false, "escapeModifierApplied": true},
    {"instanceId": "bat-B", "damage": true, "control": false, "escapeModifierApplied": false}
  ],
  "itemXpBudget": 100,
  "allocation": [{"instanceId": "knife-A", "xp": 30}, {"instanceId": "bat-B", "xp": 70}],
  "settlementId": "seeded-session:encounter-42:weapon-xp",
  "status": "applied"
}
```

This structure is explanatory; neither the example split nor field names are locked.

## 8. Watched/offline equivalence and FX2 cap

- The **shared simulation** should be the sole producer of encounter resolution and XP settlement. The UI only presents the resulting game state; it must never independently award weapon XP.
- **Same initial state + same seed/RNG streams + same ordered logical encounter history → exactly the same instance XP, family XP, levels and settlement markers**, irrespective of display mode.
- **Time equivalence:** test single-chunk vs segmented simulation over equivalent logical time. Differences in RNG consumption or encounter timing must be reported explicitly, not concealed by post-hoc XP normalization.
- **FX2:** no combat or XP for elapsed time discarded by the strict **24-hour per-return catch-up cap**. Do not grant XP using wall-clock time alone.
- **FX3:** buff expiry still needs consistent simulated-game-time ownership; test paths involving buffs should be qualified until that work is complete.
- **FX4:** shared survivor-stat dependencies require review; do not grant XP from UI-only values or unimplemented speed/accuracy/evasion behaviors.
- **First Downed/Jester:** story relocation, if ever approved, must not convert a Downed forced retreat into an ordinary XP-eligible escape.

## 9. QA acceptance matrix for a future authorized batch

| Test ID | Scenario | Expected invariant |
|---|---|---|
| WLM-T01 | CB1 regression | 28/3/30%, 16/1/25%, 16/0.5/+30/+5 unchanged |
| WLM-T02 | Victory with one successful hit | Exactly one item settlement; one family allocation |
| WLM-T03 | Stagger only, eventual victory | Iron Knuckles qualifies regardless of low damage |
| WLM-T04 | Pocket Knife bonus used, successful escape | Reduced eligible award |
| WLM-T05 | Pocket Knife bonus used, failed escape, later victory | Full *victory* settlement recognizes prior meaningful contribution |
| WLM-T06 | Five failed escape attempts before victory | No repeated escape-based award multiplier |
| WLM-T07 | Equipped weapon never used | No XP |
| WLM-T08 | Nail Bat missed/skipped swing alone | No qualification solely from skip |
| WLM-T09 | Two eligible weapons, one victory | Sum of item allocations <= single shared budget |
| WLM-T10 | Downed / involuntary forced retreat | Zero ordinary completion XP |
| WLM-T11 | Same model, two distinct owned copies | Only participating instance receives item XP |
| WLM-T12 | Replace item with same family | New item XP begins independently; survivor family mastery retained |
| WLM-T13 | Repair and storage transfer | Item instance XP/level/history unchanged |
| WLM-T14 | Save and reload before settlement | At most one settlement after continuation |
| WLM-T15 | Save and reload after settlement | No XP duplication |
| WLM-T16 | Watched vs offline replay of identical event trace | Identical XP, levels, ledger |
| WLM-T17 | Chunked vs unchunked deterministic run | Identical awarded encounter histories and XP if simulation histories match |
| WLM-T18 | >24h away | No XP from FX2-discarded time |
| WLM-T19 | Concurrent tabs with stale save snapshots | No double application or silent overwrite; otherwise release blocker |
| WLM-T20 | Legacy pre-WLM save migration | Existing gear remains valid, no duplicated item identity, no lost player data |
| WLM-T21 | Hundreds of catalog entries | Schema validation, rendering, search, save memory and load-time budgets satisfied |
| WLM-T22 | Buff-expiry and UI-stat edge cases | No unintended double-award; known FX3/FX4 constraints documented |

**Prototype run matrix (proposed):** 4 behavior policies × 5 deterministic seeds × 3 starting equipment profiles × watched/offline = **120 runs per time horizon**. Horizons: **1 hour, 24 hours, 30 days** → **360 runs**, measured separately for XP/hour, escape-vs-win XP, weapon-level distribution, mastery share and armor sensitivity. This is a *future weapons progression test plan*, not a change to the existing H2 contract.

**Provisional balance targets to investigate, not pass/fail gates:** average escape-focused XP/hour **40–90%** of comparable risk-adjusted combat-focused XP/hour; no stable low-threat escape loop exceeds comparable encounter victory XP/hour; catalog UI works with **300** entries. Real thresholds require design approval and profiling.

## 10. Engineering work packages and gates (NOT authorized for execution)

**Phase A — Read-only feasibility audit:** document existing item representation, stacked copies, wear/destruction, inventory/stash/equip, save migration/versioning, encounter lifecycle, escape classification, sim RNG streams, two-tab ownership, CB1 tests. Deliver a risk report; no code edits.

**Phase B — Encyclopedia data and reference UI:** schema validator, category/family taxonomy, localized display naming, real-model metadata, provenance and source log, filters/search, original 2D art placeholder policy. No XP feature dependency. Requires separately approved scope.

**Phase C — Weapon instances and persistence:** migrate owned gear to durable item identity (if needed), preserve legacy saves, support named/history-bearing items. Cannot begin before acceptance of save-safety plan.

**Phase D — XP settlement core:** authoritative outcome classification, evidence capture, one-time settlement, item XP and family mastery with initially **non-power** progression. Require tests T01–T20 before enabling stats growth.

**Phase E — Balance and earned perks:** once armor, accuracy/evasion/speed and ranged combat are specified, simulate thresholds and propose capped/diminishing mechanical growth. Nothing here pre-approves a stat bonus.

**Phase F — Ranged, ammunition and acoustic mechanics:** independent specification required. Do not treat real-world make/model metadata as permission to add firearms to live loot pools.

**Compatibility gate:** each phase must preserve closed CB1 behavior and existing H1/FX1/FX2 rules. Use isolated TEST SAVE browser checks; preserve real-save fingerprints and old-save migration tests where appropriate. Never edit the authoritative Design specs silently.

## 11. Open decisions for owner and Design

| ID | Question | Provisional recommendation |
|---|---|---|
| O-01 | Can the player swap weapons *during* an encounter? | **Between encounters only** in first version; *not selected by owner* |
| O-02 | Does low-durability gear survive at zero in today's code? | Audit current behavior before deciding legacy preservation |
| O-03 | How exactly is multi-weapon XP split if switching is later supported? | One conserved budget; contribution-weight formula TBD |
| O-04 | Is escape bonus use during a failed escape *by itself* sufficient for eligibility after later victory? | Yes, once per encounter, per owner direction; validate anti-farm |
| O-05 | What are the actual XP numbers, curve and family conversion? | Experiment with §5.2–5.3 prototype, do not lock |
| O-06 | How do threat relevance and zombie armor map to XP? | Delay pending higher-tier combat/armor design |
| O-07 | What happens on broken-item deletion/salvage? | Do not assume retention across destruction |
| O-08 | Should family mastery confer stats, perks, unlocks, or solely cosmetic progression initially? | First ship bookkeeping/cosmetics, balance later |
| O-09 | Which brands/models make the first release, and what rights review is required? | Research-backed phased catalog admission |
| O-10 | How is cross-tab save ownership enforced? | Code feasibility audit; blocker to shipping XP |
| O-11 | Are valid escapes in current R1 represented distinctly from Downed retreat? | Audit actual outcome flags and policy paths |
| O-12 | Are items transferable/tradable between characters or saves? | Hold trading semantics until feature exists |

## 12. Employee handoff / required output

For anyone reviewing this document, deliver **one review memo** with:

1. Any conflict with `starter-weapons-cb1-slice.md`, `wandering-tab-spec.md` §12.7, closed CB1 tests or actual `ZI.GEAR_ITEMS` behavior.
2. Which proposed fields can be derived from current data and which require migration.
3. A diagram of the *real* combat→escape→retreat outcome paths and where a once-only settlement belongs.
4. Assessment of two-tab save synchronization and deterministic watched/offline replay.
5. Estimates of catalog search/filter, save-size and validation costs for 300 entries.
6. Explicit answers to O-01 through O-12 where Code has evidence; otherwise mark **NEEDS DESIGN DECISION**.
7. A suggested implementation-batch sequence with acceptance tests and stop conditions. **No game changes.**

### Final scope boundary

**This is a quantified proposal for review—not a command to implement.** Owner-selected direction is recorded; CB1 is preserved; all new XP multipliers, progression curves, schema fields, weapon-family lists, catalog expansion targets and example combat scenarios are provisional until the owner and Claude Design explicitly approve a locked batch. Existing engineering priorities and other development batches remain unaffected.
