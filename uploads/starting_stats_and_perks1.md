# Survivor Starting Stats & Perk Catalog — Design Data

---

## 1. Starting Stats by Character Type

> All stats on a 1–100 scale. Starting values reflect role identity without making other types obsolete.
> Stats not listed default to **10** (baseline untrained).

### CSV Data — Starting Stats

```csv
#,Type,Strength,Agility,Endurance,Intellect,Scavenging,Combat,Survival
1,Scavenger,12,18,14,12,30,10,20
2,Fighter,25,15,20,8,8,28,14
3,Medic,10,14,22,25,15,8,28
4,Scholar,8,12,12,35,18,8,22
5,Engineer,18,12,20,28,20,10,16
6,Sniper,14,20,14,18,12,30,15
7,Scout,12,30,16,15,20,14,18
8,Chemist,10,12,14,30,18,10,20
9,Mechanic,20,14,18,25,22,10,14
10,Tactician,12,16,16,30,12,16,18
11,Hunter,18,22,20,12,22,18,25
12,Smuggler,12,25,14,18,25,14,16
13,Soldier,22,16,22,12,12,25,20
14,Hacker,8,14,12,32,20,8,16
15,Cook,12,12,20,22,20,8,28
16,Preacher,10,14,18,28,12,10,22
17,Brawler,30,14,22,8,8,25,16
18,Trapper,16,18,18,20,22,14,22
19,Drifter,14,28,16,14,20,16,20
20,Farmer,16,12,22,18,28,8,28
21,Arsonist,18,16,16,20,14,22,14
22,Medic Veteran,12,14,25,28,16,10,32
23,Demolitionist,22,14,18,22,14,25,14
24,Guard,25,12,28,12,10,22,20
25,Trader,10,16,14,22,25,10,16
26,Athlete,18,28,28,12,12,16,22
27,Survivalist,16,18,22,16,22,16,28
28,Sharpshooter,14,22,14,16,14,32,16
29,Quartermaster,14,14,18,22,28,12,18
30,Shadow,14,28,14,16,18,22,14
```

---

### Stat Priority Key

| Character Type | Highest Stats | Lowest Stats |
|---|---|---|
| Scavenger | Scavenging, Agility | Combat, Strength |
| Fighter | Strength, Combat | Intellect, Scavenging |
| Medic | Survival, Intellect | Strength, Combat |
| Scholar | Intellect, Survival | Strength, Combat |
| Engineer | Intellect, Scavenging | Agility, Combat |
| Sniper | Combat, Agility | Strength, Survival |
| Scout | Agility, Scavenging | Strength, Combat |
| Chemist | Intellect, Survival | Strength, Combat |
| Mechanic | Strength, Intellect | Agility, Survival |
| Tactician | Intellect, Agility | Strength, Scavenging |
| Hunter | Survival, Agility | Intellect, Combat |
| Smuggler | Agility, Scavenging | Strength, Endurance |
| Soldier | Strength, Combat | Intellect, Scavenging |
| Hacker | Intellect, Scavenging | Strength, Combat |
| Cook | Intellect, Survival | Agility, Combat |
| Preacher | Intellect, Survival | Strength, Combat |
| Brawler | Strength, Combat | Intellect, Scavenging |
| Trapper | Survival, Scavenging | Strength, Combat |
| Drifter | Agility, Survival | Strength, Intellect |
| Farmer | Scavenging, Survival | Combat, Agility |
| Arsonist | Combat, Strength | Survival, Scavenging |
| Medic Veteran | Survival, Endurance | Agility, Combat |
| Demolitionist | Strength, Combat | Agility, Survival |
| Guard | Strength, Endurance | Intellect, Agility |
| Trader | Scavenging, Intellect | Strength, Combat |
| Athlete | Agility, Endurance | Intellect, Combat |
| Survivalist | Survival, Scavenging | Combat, Intellect |
| Sharpshooter | Combat, Agility | Strength, Survival |
| Quartermaster | Scavenging, Intellect | Strength, Combat |
| Shadow | Agility, Combat | Endurance, Intellect |

---

## 2. Perk Catalog — 15 Starter Perks (3 Per Category)

> Each perk can stack up to 3 times. Values shown are per stack level.
> Perks are unlocked at prime number levels and selected from a randomized pool of 3.

---

### Category 1 — Combat

| Perk Name | Description | Stack 1 | Stack 2 | Stack 3 |
|---|---|---|---|---|
| **Iron Fist** | Increases melee damage output | +10% melee dmg | +20% melee dmg | +35% melee dmg |
| **Dead Eye** | Increases critical hit chance | +5% crit chance | +10% crit chance | +18% crit chance |
| **First Blood** | Player always wins initiative unless enemy has elite status | Initiative guaranteed | Initiative guaranteed | Initiative + bonus turn |

---

### Category 2 — Survival

| Perk Name | Description | Stack 1 | Stack 2 | Stack 3 |
|---|---|---|---|---|
| **Iron Skin** | Reduces incoming damage | -8% damage taken | -15% damage taken | -25% damage taken |
| **Second Wind** | Recover stamina faster after combat | +15% stamina regen | +25% stamina regen | +40% stamina regen |
| **Scavenger's Luck** | Chance to find bonus loot in any zone | +10% loot chance | +20% loot chance | +35% loot chance |

---

### Category 3 — Crafting

| Perk Name | Description | Stack 1 | Stack 2 | Stack 3 |
|---|---|---|---|---|
| **Efficient Hands** | Reduces material cost of crafting recipes | -10% mat cost | -18% mat cost | -28% mat cost |
| **Quick Build** | Reduces time required to craft items | -15% craft time | -25% craft time | -40% craft time |
| **Recycler Pro** | Increases material yield from recycling | +10% yield | +20% yield | +35% yield |

---

### Category 4 — Traversal

| Perk Name | Description | Stack 1 | Stack 2 | Stack 3 |
|---|---|---|---|---|
| **Light Foot** | Increases traversal speed between zones | +10% move speed | +20% move speed | +35% move speed |
| **Ghost Step** | Reduces chance of zombie encounter during traversal | -10% encounter rate | -20% encounter rate | -35% encounter rate |
| **Pack Mule** | Increases carry capacity during traversal | +15% carry weight | +28% carry weight | +45% carry weight |

---

### Category 5 — Social

| Perk Name | Description | Stack 1 | Stack 2 | Stack 3 |
|---|---|---|---|---|
| **Silver Tongue** | Reduces marketplace buy prices | -8% buy price | -15% buy price | -25% buy price |
| **Morale Boost** | Increases XP gain for all assigned survivors | +10% XP gain | +18% XP gain | +30% XP gain |
| **Networked** | Unlocks rare items in marketplace more frequently | +10% rare item rate | +20% rare item rate | +35% rare item rate |

---

## 3. Integration Notes

### For Claude Code

**Starting Stats:**
- Generate 30 `CharacterType_[Name].asset` ScriptableObjects
- Populate each with the CSV values above
- Default any unlisted stat to `10`
- Clamp all values to `[1, 100]` on load

**Perk Catalog:**
- Generate 15 `Perk_[Name].asset` ScriptableObjects
- Each asset contains: `PerkName`, `Category`, `Description`, `StackValues[3]`
- `PerkSystem.BindCatalog()` loads all 15 at startup
- Filter pool to non-maxed perks before presenting 3 choices at prime level unlocks
- Fire `OnPerkUnlocked(Perk perk, int stackLevel)` event on selection

### For Claude Design

**Character Creation Screen:**
- Display all 30 character types as selectable cards
- Each card shows: Type name, primary role, top 2 stats highlighted
- Selecting a card previews starting stat bars (1–100 scale)

**Perk Selection Screen:**
- Appears automatically at prime number levels
- Shows 3 randomly drawn perk cards from eligible (non-maxed) pool
- Each card shows: Perk name, category icon, current stack level, next stack bonus
- Confirm selection locks the perk and fires event

**Perk HUD:**
- Display active perks as small category-color-coded icons on survivor profile
- Tooltip on hover shows stack level and current bonus values
