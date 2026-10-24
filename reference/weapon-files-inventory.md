# Zed Idler — Weapon Files Inventory

**Status:** `[CODE]` fact record, Oct 12. Created by Claude Design to replace the missing source the weapons draft names (`Zed Idler — Weapon Files Inventory.md`, not found in the folder or the Project). Read from the game code; no code changed. **This is not the Phase 1 audit** (that comes after H2, per `weapons-development-directive.md`). It is the baseline the draft should cite.

---

## 1. Where weapon data and rules live

| File | What it holds |
|---|---|
| `game/items.js` | `ZI.GEAR_ITEMS` (every weapon's numbers), `ZI.GEAR_SLOTS`, `resolveLoadoutStats()` (adds up equipped gear), durability and repair |
| `game/stats.js` | `STAT_FORMULAS.resolveAttack` (hit, damage, heavy swing, stagger), `survivorStatBlock`, `escapeChance`, the skill list (`PROFESSIONS`, including **Combat**) and action XP (`ACTION_XP`) |
| `game/combat.js` | `ZI.simulateCombat`, the one fight loop for watched, offline and headless play |
| `game/crafting.js` | `CRAFT_RECIPES` (which weapons can be crafted) |
| `game/wandering.js` | Builds the Wandering fight's stat block; awards encounter XP |
| `tests/cb1-starter-weapons.test.js` | The locked CB1 checks |
| `reference/starter-weapons-cb1-slice.md`, `reference/wandering-tab-spec.md` §12.7 | The CB1 design and the starter weapons table |
| `unity/Assets/Scripts/...` (`WeaponDefinition.cs`, `WeaponMod.cs`, `WeaponCatalogExtension.cs`, `WeaponTraitResolver.cs`, `Editor/WeaponSeeder.cs`) | Older Unity prototype. **Not authoritative** for the JS game |

## 2. How weapons work today

- **Slots:** `primary` and `secondary` (firearms, bows) and `melee`. A survivor can equip one weapon in each.
- **Damage adds up:** `resolveLoadoutStats` sums the damage of **every** equipped weapon (primary + secondary + melee) into one `weaponDamage`. There is no separate ranged attack.
- **Firearms have no ammunition, noise or reload.** They are plain damage items.
- **Weapon specials (CB1):** `heavySwingPct`, `staggerPct`, `escapeBonus`. Only the three starter weapons use them.
- **XP today:** fights award skill XP through the action bus (`emitAction`) to skills such as **Combat**, Athletics and Endurance. No per-weapon XP exists.
- **Dead stats in fights:** accuracy and fight evasion (hit chance is capped at 95% early). Speed is **not** dead: it changes escape chance and initiative (FX4 brief §3.1). Evasion buffs feed escape chance.

## 3. Every weapon in the game (25)

`R` = has a crafting recipe. Damage, weight (kg), speed change, loot bonus as in `ZI.GEAR_ITEMS`.

### Melee (12)
| id | Name | Rarity | Dmg | Wt | Speed | Loot | Special | R |
|---|---|---|---:|---:|---:|---:|---|---|
| `bat` | Nail Bat | common | 28 | 3 | 0 | 0 | heavy swing 30% (**CB1, locked**) | |
| `pocket_knife` | Pocket Knife | common | 16 | 0.5 | 0 | 5 | escape +30 (**CB1, locked**) | |
| `iron_knuckles` | Iron Knuckles | common | 16 | 1 | +3 | 0 | stagger 25% (**CB1, locked**) | R |
| `crowbar` | Crowbar | common | 22 | 3 | −2 | 5 | | |
| `spike_board` | Spike Board | uncommon | 28 | 3 | −2 | 0 | | R |
| `combat_knife` | Combat Knife | uncommon | 30 | 1 | +6 | 0 | | R |
| `steel_baton` | Steel Baton | uncommon | 26 | 2 | +4 | 0 | | R |
| `machete` | Military Machete | uncommon | 30 | 2 | +5 | 0 | | |
| `machete_blade` | Machete Blade | rare | 36 | 2 | +8 | 0 | | R |
| `combat_axe` | Combat Axe | epic | 52 | 4 | −4 | 0 | | R |
| `shock_baton` | Shock Baton | epic | 30 | 2 | +2 | 0 | | R |
| `jet_sledge` | Jet-Assisted Sledge | legendary | 88 | 6 | −10 | 0 | | R |

### Primary (9)
| id | Name | Rarity | Dmg | Wt | Speed | Loot | R |
|---|---|---|---:|---:|---:|---:|---|
| `rifle` | **AK-74 Carbine** | rare | 42 | 4 | −5 | 0 | |
| `shotgun` | Sawn-Off Shotgun | uncommon | 65 | 3 | −3 | 0 | |
| `suppressed` | Suppressed SMG | epic | 28 | 3 | −2 | 0 | |
| `pipe_shotgun` | Improvised Pipe Shotgun | common | 55 | 3 | −3 | 0 | R |
| `compound_bow` | Compound Bow | uncommon | 40 | 3 | −2 | 0 | R |
| `crossbow` | Crossbow | rare | 58 | 4 | −4 | 0 | R |
| `arc_carbine` | Arc Carbine | epic | 60 | 4 | −3 | 0 | R |
| `flamethrower` | Flamethrower | legendary | 50 | 8 | −12 | 0 | R |
| `void_pulse_rifle` | Void Pulse Rifle | exotic | 120 | 5 | −6 | 8 | R |

### Secondary (4)
| id | Name | Rarity | Dmg | Wt | Speed | Loot | R |
|---|---|---|---:|---:|---:|---:|---|
| `pistol` | 9mm Pistol | common | 22 | 1 | 0 | 0 | |
| `revolver` | .357 Revolver | uncommon | 38 | 2 | 0 | 0 | |
| `pipe_pistol` | Pipe Pistol | common | 20 | 1 | 0 | 0 | R |
| `shock_pistol` | Shock Pistol | rare | 18 | 1 | 0 | 0 | R |

## 4. Facts the weapons draft should know

1. **The roster is 25 weapons, not 7.** The draft's baseline (§1) lists only the CB1 three plus Crowbar, Steel Baton, Spike Board and Combat Knife.
2. **Firearms already exist** as plain damage items in the primary and secondary slots, with no ammo or noise. Phase 6 (ranged combat) must decide what happens to them.
3. **One existing name uses a real model designation: "AK-74 Carbine"** (`rifle`). Under W1 (`[DECIDED Oct 12]`: invented brand names) it needs an invented name. Generic names (9mm Pistol, .357 Revolver, Crossbow) are fine.
4. **Equipping a rifle, a pistol and a knife adds all three damages together.** That interacts with any per-weapon XP design: today every equipped weapon "fights" in every fight.
5. Counts verified by script Oct 12: 12 melee + 9 primary + 4 secondary = 25.
