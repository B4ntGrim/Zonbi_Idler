# Zed Idler — CB1 Starter Weapons (Slice Brief)

**Status:** **LOCKED Oct 10 (Sam: "CB1 is fine").** Identities `[DECIDED Oct 10, U17/U20]`. Numbers `[DECIDED Oct 10]` as in §3. The §7 batch is now `CURRENT_BATCH.md`.
**Inputs:** `elder-jester-concept.md` U17 and §4 · the combat code read on Oct 10 (`game/stats.js`, `game/combat.js`, `game/wandering.js`, `game/items.js`).
**Tags:** `[DECIDED]` Sam · `[PROPOSED]` draft · `[OPEN]` needs a decision or fact · `[CODE]` current build

---

## 1. Next slice

Give the three starter weapons from the Elder Jester distinct, balanced identities, so no starter is a trap:

| Weapon | Identity `[DECIDED Oct 10]` |
|---|---|
| **Nail Bat** | Heavy, slow hits |
| **Iron Knuckles** | Fast hits that stagger |
| **Pocket Knife** (new item) | Quiet: better at getting away, small scavenging bonus |

*Why now:* H2 runs Scenario B once per starter weapon (U19). Until the three weapons differ in ways the simulation can see, those runs measure nothing.

---

## 2. What the code does today `[CODE]`

1. **A weapon contributes only its damage** to Wandering fights (`resolveLoadoutStats` → `survivorStatBlock`). Damage per hit rolls between 0.6× and 1.1× the weapon value.
2. **The stagger, stun and armor-pierce effects in item descriptions do nothing.** "15% stagger chance on hit" (Iron Knuckles) is text only.
3. **Hit chance is capped early.** Base 65 + survivor accuracy 55+ against zombie evasion of about 8 gives 95% (the cap). Zombies hit the survivor 95% of the time too. **Accuracy and evasion modifiers on gear do nothing in the early game.**
4. **Weapon speed does nothing in Wandering fights.** Loadout speed is clamped at 100, and the fight reads the survivor's movement speed instead. The survivor always strikes first against early zombies.
5. **Fight length doesn't cost time** in the idle run. An encounter resolves at once, so only **HP lost per fight**, **escape chance**, **loot** and **weight** matter.
6. **The survivor wins every fight against early zombies** (tiers F and E: hp 40–60, damage 4–7). Downed comes from wear across many fights without heals, not from losing a single fight.
7. **Current numbers:** Nail Bat 18 damage, 2 kg; Iron Knuckles 20 damage, 1 kg. **The Bat is strictly worse.**

*Lesson for Sam, "dead stats":* points 2–4 are stats that exist but cannot change an outcome. Players notice dead stats fast ("speed does nothing"). Every stat on an item must move a number the game actually uses.

---

## 3. The proposal

Three new weapon fields, all data-driven, each read by the shared fight function so watched, offline and headless fights match:

| Field | Meaning | Used by |
|---|---|---|
| `heavySwingPct` | After the survivor attacks, chance to lose the next attack (the swing recovers slowly) | Nail Bat |
| `staggerPct` | When the survivor hits, chance the enemy loses its next attack | Iron Knuckles |
| `escapeBonus` | Added to the escape chance when the policy evades | Pocket Knife |

`lootBonus` and `carryW` already exist and are used as-is.

### Starting values `[PROPOSED]`

| Weapon | Damage | Special | Loot | Weight | Rarity |
|---|---|---|---|---|---|
| **Nail Bat** | **28** (was 18) | `heavySwingPct` 30 | 0 | **3 kg** (was 2) | Common |
| **Iron Knuckles** | **16** (was 20) | `staggerPct` 25 | 0 | 1 kg | Common |
| **Pocket Knife** (new) | 16 | `escapeBonus` +30 | **+5** | **0.5 kg** | Common |

**Existing item descriptions** become true: the Knuckles' stagger text changes from "15%" to "25%", and the Bat gets "Heavy swing: 30% chance to lose your next attack."

### Simulated result (20,000 fights each, real combat formulas, padded jacket worn, new-save skill levels, tiers F–E)

| | Nail Bat | Iron Knuckles | Pocket Knife |
|---|---|---|---|
| HP lost per fight | **2.55** (best) | 2.82 | 3.71 |
| Escape chance (level 1) | 9% | 9% | **39%** |
| **HP lost per encounter, always fights** (Heinous, Criminal) | **2.55** | 2.82 | 3.71 |
| **HP lost per encounter, always evades** (Ethical; Immoral early) | 2.32 | 2.57 | **2.26** |
| Weight | 3 kg | 1 kg | **0.5 kg** |
| Loot bonus | — | — | **+5** |

For reference: unarmed loses 7.7 HP per fight; today's Bat 3.3; today's Knuckles 3.0.

### What each starter is best at

| Weapon | Best when | Trade-off |
|---|---|---|
| Nail Bat | You fight everything: the least HP lost per fight | Heaviest: 2.5 kg of haul capacity gone (about 15% of a 15–23 kg early load) |
| Iron Knuckles | You want a safe middle: decent in fights, light on the load | Best at nothing, worst at nothing |
| Pocket Knife | You avoid fights: the best HP per encounter for evading policies, extra loot, lightest | Weakest when a fight does happen |

**The policy leanings changed from the earlier guess.** The simulation shows Immoral evades almost every early zombie (it evades anything with 30+ HP), so it behaves like Ethical early. The Knife suits Ethical and Immoral; the Bat suits Heinous and Criminal; the Knuckles suit anyone near their carry limit. *Lesson:* let the simulation set the leanings, not intuition.

*Watch for:* these numbers are tuned against early zombies only. Higher tiers have armor (damage reduction), which hurts low-damage weapons more: the Knife and Knuckles will fall behind later. That's acceptable for starters, which should be replaced by crafted weapons, but H2 (30 days) will show how long each starter stays viable.

---

## 4. Open facts for Code (batch step 1)

- **TQ-CB1a** Confirm the fight function can read the three new fields in one shared place (`STAT_FORMULAS.resolveAttack` / `simulateCombat`) for watched, offline and headless fights, with no screen-side copy.
- **TQ-CB1b** Confirm `escapeBonus` can feed `escapeChance` the same way `activeEvadeBonus` does today.
- **TQ-CB1c** List any test or seeded sequence that depends on the Nail Bat's or Iron Knuckles' current damage. A changed sequence is a stop condition unless listed here first.

---

## 5. Parked and out

The Elder Jester encounter and the starter-pick screen (tutorial batch) · the quest med kit (U21) · higher-tier weapon balance · fixing the dead accuracy, evasion and speed stats for all gear (a later combat-balance slice) · the "silent kill" and "cleave" effects on other weapons.

---

## 6. Spec impact

New data-table section **12.7 Starter weapons** in `wandering-tab-spec.md` with the table in §3 and the three fields. The tutorial spec's starting loadout points to it.

---

## 7. Proposed batch — draft `CURRENT_BATCH.md`

### BATCH CB1 — Starter weapons

**Goal.** The Nail Bat, Iron Knuckles and a new Pocket Knife have the identities and starting values in §3. No other balance change.

**Decided behavior**
1. Three new item fields: `heavySwingPct`, `staggerPct`, `escapeBonus`, read by the shared fight and escape code only.
2. Item values exactly as in the §3 table. The Pocket Knife is a new Melee item (id `pocket_knife`), common, no recipe in this batch.
3. Item descriptions match their mechanics.
4. Items without the new fields behave exactly as today.

**Likely files.** `game/items.js` · `game/stats.js` · `game/wandering.js` (only if escape needs the field passed) · new `tests/cb1-starter-weapons.test.js` · `CODE_STATE.md`.

**Steps.** 0 baseline · 1 answer TQ-CB1a–c (stop if the answer moves the change outside the likely files) · 2 implement · 3 tests and full regression.

**Acceptance checks**
1. With `staggerPct` 100, the enemy never attacks after a survivor hit; with 0, fights match today's results for the same seed.
2. With `heavySwingPct` 100, the survivor attacks at most every other turn; with 0, results match today's.
3. `escapeBonus` +30 raises escape chance by exactly 30 points, within the existing 5–90 clamp.
4. Over 20,000 seeded fights against tiers F–E (padded jacket, new-save levels), HP lost per fight is within ±0.15 of §3: Bat 2.55, Knuckles 2.82, Knife 3.71.
5. Watched, offline and headless fights give identical results for the same seed and loadout.
6. All other weapons give identical results to the baseline (differential).
7. Old saves holding a Nail Bat or Iron Knuckles load, and the items use the new values.

**Declared differences:** fights with the Nail Bat or Iron Knuckles equipped change. Nothing else may change.

**Explicitly out.** The Jester, the starter pick UI, recipes, the quest med kit, other weapons, accuracy/evasion/speed rework, save version.

**Required verification.** All suites; the new suite; `sim-clock-rng` ×5 identical. **Closing line:** `CB1 STARTER WEAPONS: CLOSED` / `NOT CLOSED`.

---

## 8. Patterns used (for Sam)

- **Sidegrades on different axes.** Each starter wins on a different measure (HP per fight, escape, weight). If all three competed on damage alone, one would always be best.
- **Simulate before you ship numbers.** The first guesses (accuracy and initiative penalties for a "slow" bat) turned out to change nothing, because hit chance was already capped. A cheap simulation caught that before Code spent a batch on it.
