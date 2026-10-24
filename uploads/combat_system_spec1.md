# Combat System — Design Specification
## File: CombatSystem.cs | Phase 1, File #4

---

## 1. Overview

The Combat System governs all turn-based encounter logic within the **Wandering tab**.
Encounters are automated and side-scrolling. The player observes passively unless the
optional active minigame is engaged.

**Reference:** The Last Stand: Dead Zone (2012) — automated turn resolution with stat-driven outcomes.

---

## 2. Combat Flow

```
Encounter Start
      │
      ▼
 Roll Initiative
      │
      ├──[Player wins]──> Player Attack Phase
      │
      └──[Zombie wins]──> Zombie Attack Phase
            │
            ▼
      Resolve Damage
            │
            ▼
      Check HP (target)
            │
            ├──[HP > 0]──> Next Turn
            │
            └──[HP ≤ 0]──> Entity Defeated
                  │
                  ├──[Zombie defeated]──> Drop Loot → Spawn Next Zombie
                  │
                  └──[Survivor defeated]──> Combat Over → Apply Consequences
```

---

## 3. Initiative System

### Rules
- **Player attacks first by default** in every encounter.
- Zombie wins initiative only if it has an **initiative perk or elite status**.
- Initiative is rolled once per encounter at start — not per turn.

### Initiative Roll Formula

```
Player Initiative Score  = Agility + (Combat Perk Bonus) + Random(1, 10)
Zombie Initiative Score  = ZombieSpeed + (ZombieInitiativeBonus) + Random(1, 10)

Winner = higher score
Tie    = Player wins (player-favored tiebreaker)
```

### Initiative Modifiers

| Source | Modifier | Condition |
|---|---|---|
| Player Agility stat | +1 per 10 points | Always active |
| First Blood perk (stack 1) | Initiative guaranteed | No elite zombies |
| First Blood perk (stack 3) | Initiative + bonus turn | Always |
| Zombie: Standard | 0 bonus | Default |
| Zombie: Fast | +5 initiative | Speed-type zombie |
| Zombie: Elite | +10 initiative | Elite tier |
| Zombie: Horde Leader | +15 initiative | Boss tier |

---

## 4. Attack Resolution

### Player Attack Formula

```
Base Damage     = Strength + (Combat × 0.5)
Critical Chance = (Combat × 0.1) + Dead Eye perk bonus
Critical Mult   = 1.75×

Final Damage    = Base Damage × (1 + IsCritical ? CritMult : 0)
                - ZombieArmor
```

### Zombie Attack Formula

```
Base Damage     = ZombieStrength + ZombieTier bonus
Damage Taken    = Base Damage × (1 - PlayerDamageReduction)
                  (Iron Skin perk applies here)
```

### Damage Reduction Table

| Iron Skin Stack | Damage Reduction |
|---|---|
| None | 0% |
| Stack 1 | 8% |
| Stack 2 | 15% |
| Stack 3 | 25% |

---

## 5. Zombie Definitions

### Zombie Tiers

| Tier | HP Range | Damage Range | Initiative Bonus | Loot Quality |
|---|---|---|---|---|
| Standard | 20–40 | 5–10 | 0 | Common |
| Fast | 15–30 | 8–14 | +5 | Common / Uncommon |
| Heavy | 60–100 | 15–25 | -5 | Uncommon |
| Infected | 25–45 | 10–18 | 0 | Common |
| Elite | 80–150 | 20–35 | +10 | Uncommon / Rare |
| Horde Leader | 200–350 | 30–50 | +15 | Rare / Elite |

### Zombie Spawn Rules

| Condition | Effect |
|---|---|
| Time: Day | Standard, Infected spawn |
| Time: Night | Fast, Elite spawn rate increases |
| Weather: Fog | Heavy, Horde Leader chance increases |
| Weather: Storm | All spawn rates increase by 25% |
| Player Level > 50 | Elite and Horde Leader begin appearing |
| Noise mechanic triggered | Spawn rate increases by 40% for 3 turns |

### Zombie Loot Tables

| Zombie Tier | Common Drop | Uncommon Drop | Rare Drop |
|---|---|---|---|
| Standard | Cloth, Wood | Metal Scraps | — |
| Fast | Cloth | Metal, Electronics | — |
| Heavy | Metal, Wood | Armor pieces | Weapon parts |
| Infected | Cloth, Medical | Consumables | — |
| Elite | Metal, Electronics | Weapons | Rare gear |
| Horde Leader | All material types | Rare gear | Blueprint fragments |

---

## 6. Combat Log

### Executable Text Box
- Lives in the **Combat Log sub-menu** within the Wandering tab
- Accepts real-time text input
- Processed commands interact with the live combat state
- Output is appended to the scrollable combat log feed

### Log Entry Format

```
[Turn 1] Player attacks Zombie (Standard) — 18 damage
[Turn 1] CRITICAL HIT — 31 damage dealt
[Turn 2] Zombie (Standard) attacks — 7 damage taken
[Turn 3] Zombie defeated — dropped: Cloth x2, Metal Scraps x1
[Turn 3] Next encounter: Zombie (Fast) approaches...
```

### Executable Commands (Starter Set)

| Command | Effect |
|---|---|
| `force_win` | Instantly defeats current zombie |
| `add_xp [amount]` | Awards XP to active survivor |
| `spawn [type]` | Forces a specific zombie type to spawn |
| `set_hp [value]` | Sets player HP to specified value |
| `show_stats` | Prints current survivor combat stats to log |
| `clear` | Clears combat log display |

---

## 7. Loot & XP Rewards

### XP Gain Per Kill

```
XP Gained = ZombieTierBaseXP × (1 + MoraleBoostPerkBonus)
```

| Zombie Tier | Base XP |
|---|---|
| Standard | 15 |
| Fast | 20 |
| Heavy | 30 |
| Infected | 18 |
| Elite | 60 |
| Horde Leader | 150 |

### Loot Collection
- Loot drops automatically after zombie defeat in passive mode
- In active minigame mode, player must click loot to collect
- Uncollected loot disappears after 3 turns

---

## 8. Consequences of Defeat

If the survivor's HP reaches 0:

| Consequence | Description |
|---|---|
| Injury applied | Survivor is injured; reduced stats until healed |
| Task cancelled | Active Wandering task is cancelled |
| Loot lost | Any uncollected loot from the run is forfeited |
| Recovery required | Survivor must Rest & Recover before next deployment |
| XP retained | XP earned during the run is kept |

---

## 9. Side-Scroller Visual Behavior

- Zombies auto-scroll in from the right side of the screen
- Each zombie has a generated **8-bit or 16-bit sprite** per tier/type
- Death animation plays on defeat before next zombie scrolls in
- Player survivor sprite is fixed on the left side
- Combat log scrolls below the encounter view
- Active minigame overlays on top when engaged

---

## 10. Integration Notes

### For Claude Code

- Implement `CombatSystem.cs` as a pure C# class (not MonoBehaviour)
- Implement `ZombieDefinition.cs` as a ScriptableObject per zombie type
- Implement `LootTable.cs` as a ScriptableObject with weighted drop entries
- Implement `CombatLog.cs` with executable text input parser
- Wire `IScheduleService` — combat only runs when Wandering task is active
- Wire `SurvivorStats` — pull Strength, Agility, Combat, Endurance for formulas
- Wire `PerkSystem` — apply Iron Skin, Dead Eye, First Blood, Morale Boost during resolution
- Fire `OnZombieDefeated(ZombieDefinition, LootDrop[])` event per kill
- Fire `OnSurvivorDefeated(Survivor)` event on player HP reaching 0
- Fire `OnCombatLogEntry(string)` for every turn action

### For Claude Design

- Side-scroller view: zombie sprites scroll in from right, player fixed left
- Combat log panel: scrollable feed below encounter view with text input box at bottom
- Loot pop: small item icons appear above defeated zombie before disappearing
- HP bars: displayed above both player and active zombie sprite
- Initiative indicator: brief flash showing who goes first at encounter start
- Zombie tier badge: small colored icon on zombie sprite (Standard=grey, Fast=green, Heavy=brown, Elite=gold, Horde Leader=red)
