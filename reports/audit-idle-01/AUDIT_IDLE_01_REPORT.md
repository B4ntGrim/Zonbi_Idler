# AUDIT-IDLE-01 — Idle Run, automatic uses and consumables (read-only)

Requested by Sam, Oct 22. Direction `[CONCEPT Oct 22, Sam]`: healing is automatic (no Use button); Idle Run auto-renews stackable buff items when their timer ends.
Code read on Oct 22. No code, tests or saves changed. Only this report was written. Line numbers are for the files as they are today (screens-v3.jsx includes TRAV-01a fix 1).

**"Runs in all three modes"** below means: the rule lives inside `WanderSim.advance()` (wandering.js:391), or inside `WanderEngine._run()` (wandering.js:277), which calls it. That one path is used when the player is **watching** (`liveStep`, wandering.js:262), in a **background tab** (`tick` every 1 s while the Wandering screen is not mounted, wandering.js:255–260; browsers slow this timer in hidden tabs, and the next tick catches up), and **offline** (the first tick after the game opens processes the whole gap, capped at 24 h, wandering.js:284–287).

---

## Q1. The Idle Run toggle (`idleMode`)

| Where | File:line | What it does |
|---|---|---|
| Created | screens-v3.jsx:1765 | `useState(route && route.idle === true)`. No route has an `idle` field (game/routes.js has none; `WanderingScreen` gets `activeRoute \|\| ZI.ROUTES[1]`, v2.html:4076), so it always starts **off** |
| Header label | screens-v3.jsx:2136 | Text only: `'IDLE · auto-heal at 30% HP'` or `'AUTO-COMBAT · initiative turns'` |
| Toggle button | screens-v3.jsx:2250 | `onClick={() => setIdleMode(m => !m)}` |
| Button look | screens-v3.jsx:2254–2258 | Colour and text (`◉ IDLE RUN` / `○ Idle Run`) |

| Question | Answer |
|---|---|
| Saved? | **No.** React state only; reset each time the Wandering screen opens. No `zi_*` key |
| Passed to WanderSim / WanderEngine? | **No.** `liveStep()` takes no options from the screen (screens-v3.jsx:1952); `advance()` gets only `{ watching }` (wandering.js:295) |
| Read by any rule? | **No.** The only matches for `idleMode` are the five screen lines above. (game/routes.js:222 "Idle mode … ×0.7 loot" is the old Routes run mode, unrelated) |

## Q2. Every automatic use in Wandering

| Automatic use | Trigger | What it spends | Watched / background / offline | Evidence |
|---|---|---|---|---|
| **Heal top-up after a won fight** | HP < 30 after a win, and `chargeTotals().heal > 0` | 1 Heal charge: base first, then the carried med kit with the fewest charges. Heals the First Aid % of max HP. A stress fumble wastes the charge | All three | wandering.js:353; `WANDER_SIM_TABLE.topUpBelowHp: 30` (wandering.js:309); `simHeal` active.js:444–450; `spendCharge` active.js:116–131 |
| **Emergency heal when Downed** | A lost fight, or any hit leaving HP at 1 (fights, policy hits, failed ventures, ambush, walk-home groups) | Same as above. HP goes from 1 + the heal amount | All three | `_downed` wandering.js:359–361; callers wandering.js:341, active.js:231, 1153 |
| **Revive item** | Downed and no Heal charge worked | The **first equipped** consumable with `effect.revive` (Revenant Infusion). It is removed from its slot; HP is set to `effect.revive` (50) | All three | `simRevive` active.js:452–459; called at wandering.js:362 |
| **Field Bandage** | Injured. Checked after every engine run, and at once when an injury is applied | 1 `field_bandage` from a pocket (qty −1), else from a consumable slot (slot set to null). Cures the injury and adds its `effect.heal` (30) | All three | `tryBandageCure` active.js:1206–1217; engine call wandering.js:296; on injury active.js:1182 |
| **Base charges refill** | A timed rest at base finishes | Nothing; base Heal/Scout charges go back to max | All three | wandering.js:419–421; `refillBaseCharges` active.js:99 |
| **Rest recovery** (not an item) | Out of heals → Forced Retreat → rest on a timer | Time. HP rises to the target | All three | wandering.js:407–419 |
| **Timed buffs** | — | **None.** No buff item is ever used automatically. Buffs start only from the HUD "Use" button (Q4) | — | `addBuff` is called only from screens-v3.jsx:2057–2065 |
| **Other consumables** (heal items other than the bandage, grenade, flashbang) | — | **None automatic** | — | No sim code reads `effect.heal` except `tryBandageCure` (field_bandage only) |

## Q3. Consumables with an `effect` (game/items.js GEAR_ITEMS)

Stack rule: `ZI.itemStackLimit` (items.js:561–565). A consumable stacks **5 per pocket** (`DEFAULT_STACK_LIMIT`, items.js:534), except `medkit` and `scout_kit`, which are **1** (items.js:559, active.js:136; kits keep charges per kit). Stacks exist only in **pockets** (`zi_carried`, entries `{ id, qty }`). The stash is a list of single ids (items.js:222–228), and a loadout slot holds one id (Q5).

| id (items.js line) | Slot | Effect keys | Stack per pocket | Kind |
|---|---|---|---|---|
| medkit (58) | consumable1 | heal 60 | 1 (kit, 2 charges) | Healing (as a kit it feeds Heal charges; `effect.heal` is used only by the HUD Use button) |
| bandage (60) | consumable1 | heal 25 | 5 | Healing |
| ration (62) | consumable3 | heal 12 | 5 | Healing |
| rag_wrap (123) | consumable1 | heal 15 | 5 | Healing |
| field_bandage (124) | consumable1 | heal 30 | 5 | Healing (+ injury cure, automatic) |
| trauma_dressing (125) | consumable1 | heal 55 | 5 | Healing |
| nanite_serum (127) | consumable1 | heal 100 | 5 | Healing |
| combat_stim_iv (126) | consumable1 | heal 80, dmgPct 15, durSec 8 | 5 | Healing + timed buff |
| thermal_gel (149) | throwable | heal 10, armorAdd 12, durSec 90 | 5 | Healing + timed buff |
| revenant_infusion (128) | consumable1 | revive 50 | 5 | Revive (automatic when equipped) |
| stimpack (61) | consumable2 | speedPct 30, durSec 45 | 5 | Timed buff |
| scrap_adrenaline (130) | consumable2 | speedPct 20, durSec 30 | 5 | Timed buff |
| focus_tabs (131) | consumable2 | dmgPct 25, durSec 45 | 5 | Timed buff |
| overclock_patch (132) | consumable2 | speedPct 35, durSec 50 | 5 | Timed buff |
| apex_combat (133) | consumable2 | dmgPct 20, speedPct 20, armorAdd 20, durSec 75 | 5 | Timed buff |
| crystalline_surge (134) | consumable2 | dmgPct 50, speedPct 50, armorAdd 50, lootPct 50, durSec 45 | 5 | Timed buff |
| echo_state (135) | consumable2 | dmgPct 100, speedPct 100, lootPct 100, durSec 30 | 5 | Timed buff |
| adrenaline_shot (137) | consumable2 | evade 20, durSec 30 | 5 | Timed buff |
| smoke_vial (138) | consumable2 | evade 35, durSec 45 | 5 | Timed buff |
| combat_focus_draught (139) | consumable2 | xpBonus combat +8, durSec 120 | 5 | Timed buff |
| scholars_tonic (140) | consumable2 | xpBonus discovery +10, durSec 120 | 5 | Timed buff |
| lucky_charm (142) | consumable3 | lootPct 5, durSec 60 | 5 | Timed buff (loot: no effect, Q4) |
| salvagers_oil (143) | consumable3 | lootPct 20, durSec 90 | 5 | Timed buff (loot: no effect) |
| rmat_attractor (144) | consumable3 | lootPct 35, durSec 120 | 5 | Timed buff (loot: no effect) |
| echo_siphon (145) | consumable3 | lootPct 60, durSec 180 | 5 | Timed buff (loot: no effect) |
| crystalline_resonator (146) | consumable3 | lootPct 100, durSec 240 | 5 | Timed buff (loot: no effect) |
| coal_paste (148) | throwable | armorAdd 8, durSec 60 | 5 | Timed buff |
| grenade (63) | throwable | killEnemy | 5 | Instant, screen-only (Q4) |
| flashbang (64) | throwable | stun | 5 | Instant, screen-only (Q4) |
| singularity_seed (150) | throwable | killEnemy, lootPct 200, durSec 60 | 5 | Instant + loot, screen-only |

Totals: 30 consumables with an effect. **9 heal** (`effect.heal`), **20 have `durSec`** (timed), 1 revive, 3 instant throwables (singularity_seed is counted in both the instant and the timed groups).

## Q4. `useConsumable` (screens-v3.jsx:2050–2077) versus the simulation

| Effect key | What Use does | Reaches the simulation? | Works offline? | Evidence |
|---|---|---|---|---|
| heal | `wanderAct(s => s.hp += heal)`: writes the run's HP once, at click time | Yes, as a one-time HP change | **No.** It only happens on a click; no rule uses `effect.heal` automatically (except the bandage) | screens-v3.jsx:2055; `wanderAct` active.js:440 |
| speedPct | `addBuff` → buff store | Yes: `SurvivorRules.moveSpeed` reads it at sim time | The buff keeps working offline once started | screens-v3.jsx:2057; items.js:376–383 |
| dmgPct, armorAdd | `addBuff` → buff store | Yes: `combatBuffsAt(state._simNow)` in every fight | Yes, once started | screens-v3.jsx:2059–2060; wandering.js:327; active.js:462–467 |
| evade | `addBuff` | Yes: `activeEvadeBonus` → survivor evasion | Yes, once started | screens-v3.jsx:2064; items.js:396–404; stats.js:206, 254 |
| xpBonus | `addBuff` | Yes: the XP bonus sum reads the buff store | Yes, once started | screens-v3.jsx:2065; items.js:415 |
| lootPct | `setBuffs({ loot })`: screen state only | **No.** `buffLootPct` is computed (screens-v3.jsx:1756) and never read. No game rule reads `lootPct` (only the item-value helper items.js:88 and a comment, items.js:119) | No | grep `lootPct` |
| revive | `setReviveCharge(n)`: screen state, never read after (screens-v3.jsx:1751); the item is **kept** in its slot | Yes, but not through Use: `simRevive` reads the equipped slot directly | Yes, as long as it is equipped. Use has no effect | screens-v3.jsx:2066, 2076; active.js:452 |
| killEnemy | +1 kill, +XP, +3 mats and a salvage item in **screen** state; clears the shown enemy | **No.** The screen re-reads score and carried from the run every beat (screens-v3.jsx:1956–1957), so the change is overwritten. The fight was already resolved by the sim | No | screens-v3.jsx:2067–2071 |
| stun | Clears the shown enemy | **No** (display only) | No | screens-v3.jsx:2072 |

Also: the screen copies of buffs (`setBuffs` speed/dmg/armor/loot, screens-v3.jsx:1750, 2057–2061) and `buffDmgPct` / `buffArmorAdd` / `buffLootPct` (1754–1756) are never read. Display state only.

Edge case: a medkit equipped in a consumable slot is not counted as Heal charges (`chargeTotals` reads pockets only, active.js:105–112). Its Use button gives a flat +60 HP and removes it, while a medkit in a pocket gives 2 charges of the First Aid % heal.

## Q5. Loadout consumable slots

| Question | Answer | Evidence |
|---|---|---|
| Slots | consumable1 (Med), consumable2 (Stim), consumable3 (Food), throwable (Throw) | items.js:21–24 |
| Can a slot hold a stack (qty > 1)? | **No.** The loadout maps each slot to one item id or null (`{ consumable1: 'bandage' }`). There is no qty field | `emptyLoadout`/`getLoadout`/`saveLoadout` items.js:194–201; `equipGear` items.js:230 |
| What happens when one is used? | Use sets the slot to **null** (all items except revive). There is no refill from pockets or the stash | screens-v3.jsx:2076 |
| Automatic uses | `simRevive` and `tryBandageCure` also set the slot to null after use | active.js:455; active.js:1211 |
| Where stacks live | Pockets only (`zi_carried`, `{ id, qty }`, up to 5) | items.js:534, 561–565 |

## Q6. Buff store: can the simulation add a buff at a simulated time inside `advance()`?

| Part | Sim-time aware? | Evidence |
|---|---|---|
| Reading: `getActiveBuffs()` (speed, evade, XP) | **Yes.** Judged at `buffMoment()`, which `advance()` sets to `state._simNow` for every step | items.js:328–337; wandering.js:398, 477 |
| Reading: `combatBuffsAt(t)` (damage, armor) | **Yes.** Called with `state._simNow` | active.js:462–467; wandering.js:327 |
| Reading: buffs with a start in the future | **Yes.** Each buff has `from` and `until`, and both readers check `from <= t < until` | items.js:336; active.js:465 |
| Cleanup: `_pruneBuffs` | **Yes.** It never removes a buff the Wandering catch-up hasn't passed (horizon = the run's `_simNow`) | items.js:340–355 |
| Writing: `addBuff(buff)` | **No.** It takes no time argument and stamps `from = ZI.clockNow()` (wall clock or installed clock), not `_simNow`. Inside an offline catch-up that is the *end* of the window, so a renewal would start at "now", not when the old buff ended, and the gap in between would be unbuffed. Its replace rules (speed, same-track XP) also end the running buff at `now` | items.js:357–368 |
| Splitting steps at buff boundaries | **Speed buffs only.** The walk loop stops exactly at a speed buff's start or end. Damage, armor, evade and XP buffs are only checked at each step or fight (6 s encounter grid); no step ends at their `until` | `msToSpeedChange` items.js:388–393; wandering.js:435 |

**Answer:** the readers already work on simulated time, so a buff written with `from`/`until` on the simulated clock would apply the same offline as watched. But **no writer does that today**. `addBuff` always uses the real clock, and `advance()` has no point where it notices a non-speed buff ending. Renewal at expiry needs both, plus a source of the stacked items (pockets, since slots hold one).

## Q7. The manual Heal button and the "IDLE · auto-heal at 30% HP" label

| Control | What it does today | Evidence |
|---|---|---|
| **⛑ Heal N** (ActiveControls, on the Wandering HUD) | Spends 1 Heal charge (base, then a carried med kit; stress can fumble it) and heals the First Aid % of max HP, through `wanderAct` (writes the run at once). Disabled at 0 charges. N = base + kit charges | screens-v3.jsx:648 (rendered at 2229); `wanderHeal` active.js:367–373 |
| **"IDLE · auto-heal at 30% HP"** | **Label only.** It shows when the Idle Run toggle is on. Nothing reads the toggle (Q1). The 30% top-up it describes **always** runs, Idle Run on or off, watched or not (wandering.js:353, `topUpBelowHp: 30`). With the toggle off, the label reads "AUTO-COMBAT · initiative turns" while the same top-up still happens | screens-v3.jsx:2136 |
| Note on the number | The top-up fires below **30 HP** (an absolute number, `state.hp < 30`), not 30% of max HP. They match only while max HP is 100 | wandering.js:353 |

---

## Automatic today
- Heal top-up after a won fight below 30 HP (Heal charges: base, then carried med kits)
- Emergency heal when Downed (same charges)
- Revive when Downed and no heal worked (first equipped `effect.revive` item, slot cleared)
- Field Bandage when injured (pocket first, then slot; cures the injury and heals 30)
- Base charges refill after a completed base rest
- Rest recovery after a Forced Retreat

All of these run watched, in a background tab and offline (one `advance()` path, 24 h cap).

## Manual only
- ⛑ Heal button (Heal charges, First Aid %)
- HUD **Use** on any equipped consumable: every `effect.heal` item (bandage, ration, rag wrap, trauma dressing, nanite serum, combat stim IV, thermal gel, an equipped medkit), every timed buff (speed, damage, armor, evade, XP), and the throwables
- Starting any timed buff. Once started, speed/damage/armor/evade/XP buffs **do** keep working offline until their timer ends; nothing renews them
- Idle Run toggle (no effect on play)

## Screen-only (does nothing offline)
- Idle Run toggle and its "IDLE · auto-heal at 30% HP" label
- `lootPct` from any item (lucky charm, salvager's oil, RMAT attractor, echo siphon, crystalline resonator, crystalline surge, echo state, singularity seed): no rule reads it, watched or offline
- `killEnemy` (grenade, singularity seed) and `stun` (flashbang): change only the shown enemy and score; overwritten from the run on the next beat
- Use on a revive item (Revenant Infusion): sets an unused screen value and keeps the item. The real revive is automatic from the slot
- The screen's buff copies (`buffs`, `buffDmgPct`, `buffArmorAdd`, `buffLootPct`)
