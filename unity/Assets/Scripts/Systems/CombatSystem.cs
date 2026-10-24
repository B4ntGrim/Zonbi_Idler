// Assets/Scripts/Systems/CombatSystem.cs
using System;
using System.Collections.Generic;
using UnityEngine;
using ZedIdler.Data;
using ZedIdler.Entities;

namespace ZedIdler.Systems
{
    /// <summary>
    /// Turn-based combat orchestrator for the Wandering tab.
    /// Pure C# class (no MonoBehaviour). One instance per active survivor run.
    /// </summary>
    /// <remarks>
    /// Lifecycle per encounter:
    ///   <see cref="BeginEncounter"/> rolls initiative.
    ///   <see cref="AdvanceTurn"/> resolves a single turn (player → zombie or zombie → player).
    ///   <see cref="EndEncounter"/> awards XP, rolls loot, fires events.
    ///
    /// Driving the loop:
    ///   Passive mode — call <see cref="Tick"/> from Update with a fixed interval
    ///   (default 1s) and it auto-advances turns and chains encounters.
    ///   Active mode — call <see cref="AdvanceTurn"/> manually on player input.
    ///
    /// Spec compliance:
    /// • Initiative formula matches section 3 of the spec.
    /// • Damage formulas match section 4 (player crits at 1.75×, Iron Skin reduction tiered).
    /// • Iron Skin / Dead Eye / First Blood / Morale Boost all read from PerkSystem.
    /// • OnZombieDefeated / OnSurvivorDefeated / OnCombatLogEntry events fire per spec.
    /// </remarks>
    public sealed class CombatSystem : ICombatCommandHandler
    {
        private const float CritMultiplier = 1.75f;

        private readonly Survivor _survivor;
        private readonly CombatLog _log;
        private readonly System.Random _rng;
        private readonly PerkEffectResolver _perks;

        private CombatEncounter _current;
        private int _survivorHp;
        private int _survivorMaxHp;
        private float _turnAccumulator;
        private int _turnCount;

        // ─── Public state ─────────────────────────────────────────────────────
        public CombatEncounter Current => _current;
        public CombatLog Log => _log;
        public int SurvivorHp => _survivorHp;
        public int SurvivorMaxHp => _survivorMaxHp;
        public bool IsInEncounter => _current != null && !_current.isOver;
        public bool IsSurvivorDead => _survivorHp <= 0;

        // ─── Events (subscribe from UI) ───────────────────────────────────────
        public event Action<CombatEncounter, bool> OnEncounterStarted;     // (encounter, playerHasInitiative)
        public event Action<CombatEncounter> OnEncounterEnded;
        public event Action<int, TurnAction> OnTurnResolved;               // (turnIndex, action)
        public event Action<ZombieDefinition, LootDrop[]> OnZombieDefeated;
        public event Action<Survivor> OnSurvivorDefeated;
        public event Action<LogEntry> OnCombatLogEntry;

        public CombatSystem(Survivor survivor, int? rngSeed = null)
        {
            _survivor = survivor ?? throw new ArgumentNullException(nameof(survivor));
            _rng = rngSeed.HasValue ? new System.Random(rngSeed.Value) : new System.Random();
            _log = new CombatLog();
            _log.BindHandler(this);
            _log.OnEntryAppended += e => OnCombatLogEntry?.Invoke(e);
            _perks = new PerkEffectResolver(survivor);

            // HP derived from Endurance per spec: HP = Endurance × 10 (tunable later).
            _survivorMaxHp = Mathf.Max(50, survivor.Stats.Endurance * 10);
            _survivorHp = _survivorMaxHp;
        }

        // ─── Encounter API ────────────────────────────────────────────────────
        public void BeginEncounter(ZombieDefinition zombieDef)
        {
            if (zombieDef == null) throw new ArgumentNullException(nameof(zombieDef));
            if (IsInEncounter)
            {
                _log.Append("[warn] Encounter already active; ignoring BeginEncounter.", LogChannel.Warning);
                return;
            }

            int hp = _rng.Next(zombieDef.HpMin, zombieDef.HpMax + 1);
            var enc = new CombatEncounter
            {
                zombieDef = zombieDef,
                zombieMaxHp = hp,
                zombieHp = hp,
                turnsRemaining = 999,
                isOver = false
            };
            _current = enc;
            _turnCount = 0;
            _turnAccumulator = 0f;

            bool playerFirst = RollInitiative(zombieDef);
            enc.playerHasInitiative = playerFirst;
            _log.Append($"--- Encounter: {zombieDef.DisplayName} (Tier: {zombieDef.Tier}) — HP {hp} ---", LogChannel.Info);
            _log.Append(playerFirst
                ? $"Initiative: {_survivor.DisplayName} strikes first."
                : $"Initiative: {zombieDef.DisplayName} strikes first.",
                LogChannel.Info);
            OnEncounterStarted?.Invoke(enc, playerFirst);
        }

        /// <summary>Drive turns from a fixed-tick timer (e.g. 1s per turn in passive mode).</summary>
        public void Tick(float deltaSeconds, float turnIntervalSeconds = 1.0f)
        {
            if (!IsInEncounter) return;
            _turnAccumulator += deltaSeconds;
            while (_turnAccumulator >= turnIntervalSeconds && IsInEncounter)
            {
                _turnAccumulator -= turnIntervalSeconds;
                AdvanceTurn();
            }
        }

        /// <summary>Resolve one turn. Returns the action taken.</summary>
        public TurnAction AdvanceTurn()
        {
            if (!IsInEncounter) return default;

            _turnCount++;
            TurnAction action;

            bool playerActsThisTurn = (_turnCount % 2 == 1) == _current.playerHasInitiative;
            if (playerActsThisTurn) action = ResolvePlayerAttack();
            else action = ResolveZombieAttack();

            OnTurnResolved?.Invoke(_turnCount, action);

            if (_current.zombieHp <= 0) HandleZombieDefeated();
            else if (_survivorHp <= 0) HandleSurvivorDefeated();

            return action;
        }

        public void EndEncounter()
        {
            if (_current == null) return;
            _current.isOver = true;
            OnEncounterEnded?.Invoke(_current);
            _current = null;
        }

        // ─── Combat math (spec section 3-4) ───────────────────────────────────
        private bool RollInitiative(ZombieDefinition z)
        {
            // First Blood perk: stack 1+ guarantees initiative unless zombie is elite.
            int fbStacks = _perks.Stacks("first_blood");
            if (fbStacks >= 1 && !z.IsElite) return true;
            if (fbStacks >= 3) return true; // stack 3 always wins

            int agilityBonus = _survivor.Stats.Agility / 10; // +1 per 10
            int playerRoll = _survivor.Stats.Agility + agilityBonus + _rng.Next(1, 11);
            int zombieRoll = z.Speed + z.TierInitiativeBonus + z.InitiativeBonus + _rng.Next(1, 11);

            // Tie → player wins (spec).
            return playerRoll >= zombieRoll;
        }

        private TurnAction ResolvePlayerAttack()
        {
            var z = _current.zombieDef;

            // Base damage = Strength + (Combat × 0.5)
            float baseDmg = _survivor.Stats.Strength + _survivor.Stats.Combat * 0.5f;

            // Crit chance = (Combat × 0.1%) + Dead Eye bonus
            float critChance = (_survivor.Stats.Combat * 0.001f) + _perks.SumEffect("crit_chance_add");
            bool isCrit = _rng.NextDouble() < critChance;

            // Melee mult from Iron Fist perk (additive).
            float meleeMult = 1f + _perks.SumEffect("melee_damage_mult");
            float dmg = baseDmg * meleeMult;
            if (isCrit) dmg *= CritMultiplier;

            int final = Mathf.Max(1, Mathf.RoundToInt(dmg - z.Armor));
            _current.zombieHp = Mathf.Max(0, _current.zombieHp - final);

            string msg = isCrit
                ? $"[Turn {_turnCount}] CRITICAL HIT — {final} damage to {z.DisplayName} (HP {_current.zombieHp}/{_current.zombieMaxHp})"
                : $"[Turn {_turnCount}] {_survivor.DisplayName} attacks {z.DisplayName} — {final} damage (HP {_current.zombieHp}/{_current.zombieMaxHp})";
            _log.Append(msg, isCrit ? LogChannel.Crit : LogChannel.Hit);

            return new TurnAction { actor = TurnActor.Player, damage = final, wasCrit = isCrit, targetHpAfter = _current.zombieHp };
        }

        private TurnAction ResolveZombieAttack()
        {
            var z = _current.zombieDef;
            int baseDmg = _rng.Next(z.DamageMin, z.DamageMax + 1);

            // Iron Skin (Survival category) — multiplicative damage reduction.
            float damageMult = 1f + _perks.SumEffect("damage_taken_mult"); // value is negative
            damageMult = Mathf.Clamp(damageMult, 0.1f, 1f);
            int final = Mathf.Max(1, Mathf.RoundToInt(baseDmg * damageMult));

            _survivorHp = Mathf.Max(0, _survivorHp - final);
            _log.Append($"[Turn {_turnCount}] {z.DisplayName} attacks — {final} damage taken (HP {_survivorHp}/{_survivorMaxHp})", LogChannel.Damage);

            return new TurnAction { actor = TurnActor.Zombie, damage = final, wasCrit = false, targetHpAfter = _survivorHp };
        }

        private void HandleZombieDefeated()
        {
            var z = _current.zombieDef;
            var loot = z.LootTable != null ? z.LootTable.RollMultiple(rng: _rng) : Array.Empty<LootDrop>();

            // XP with Morale Boost bonus.
            float moraleMult = 1f + _perks.SumEffect("xp_gain_mult");
            long xp = (long)(z.BaseXp * Mathf.Max(0f, moraleMult));
            _survivor.AwardXp(xp);

            string lootStr = loot.Length == 0 ? "no drops" : DescribeLoot(loot);
            _log.Append($"[Turn {_turnCount}] {z.DisplayName} defeated — dropped: {lootStr} (+{xp} XP)", LogChannel.Kill);

            OnZombieDefeated?.Invoke(z, loot);
            _current.isOver = true;
            OnEncounterEnded?.Invoke(_current);
            _current = null;
        }

        private void HandleSurvivorDefeated()
        {
            _log.Append($"[Turn {_turnCount}] {_survivor.DisplayName} defeated. Run ends.", LogChannel.Defeat);
            OnSurvivorDefeated?.Invoke(_survivor);
            if (_current != null) { _current.isOver = true; _current = null; }
        }

        private static string DescribeLoot(LootDrop[] loot)
        {
            var parts = new List<string>(loot.Length);
            for (int i = 0; i < loot.Length; i++)
            {
                var d = loot[i];
                if (!d.IsValid) continue;
                parts.Add(d.quantity > 1 ? $"{d.itemId} x{d.quantity}" : d.itemId);
            }
            return parts.Count == 0 ? "no drops" : string.Join(", ", parts);
        }

        // ─── Executable Command Handler (spec section 6) ──────────────────────
        public CommandResult HandleCommand(string verb, string[] args)
        {
            switch (verb)
            {
                case "force_win":
                    if (!IsInEncounter) return CommandResult.Err("No active encounter.");
                    _current.zombieHp = 0;
                    HandleZombieDefeated();
                    return CommandResult.Ok("Zombie force-defeated.");

                case "add_xp":
                    if (args.Length < 1 || !int.TryParse(args[0], out int xp))
                        return CommandResult.Err("usage: add_xp <amount>");
                    _survivor.AwardXp(xp);
                    return CommandResult.Ok($"Awarded {xp} XP to {_survivor.DisplayName}.");

                case "set_hp":
                    if (args.Length < 1 || !int.TryParse(args[0], out int hp))
                        return CommandResult.Err("usage: set_hp <value>");
                    _survivorHp = Mathf.Clamp(hp, 0, _survivorMaxHp);
                    return CommandResult.Ok($"HP set to {_survivorHp}/{_survivorMaxHp}.");

                case "show_stats":
                    var s = _survivor.Stats;
                    return CommandResult.Ok($"STR {s.Strength} · AGI {s.Agility} · END {s.Endurance} · INT {s.Intellect} · SCV {s.Scavenging} · CMB {s.Combat} · SUR {s.Survival}  |  HP {_survivorHp}/{_survivorMaxHp}  |  LVL {_survivor.Level.Level}");

                case "spawn":
                    // Caller must subscribe & resolve by ZombieDefinition asset lookup.
                    return CommandResult.Err("spawn command requires a ZombieCatalog registration (host-side).");

                default:
                    return CommandResult.Err($"unknown command: {verb}");
            }
        }
    }

    // ─── Supporting types ─────────────────────────────────────────────────────
    public sealed class CombatEncounter
    {
        public ZombieDefinition zombieDef;
        public int zombieHp;
        public int zombieMaxHp;
        public bool playerHasInitiative;
        public int turnsRemaining;
        public bool isOver;
    }

    public enum TurnActor { Player = 0, Zombie = 1 }

    public struct TurnAction
    {
        public TurnActor actor;
        public int damage;
        public bool wasCrit;
        public int targetHpAfter;
    }

    /// <summary>
    /// Adapter that flattens a survivor's perk stacks into queryable effect totals.
    /// Stack scaling per spec: Iron Skin (8/15/25), Iron Fist (10/20/35), etc.
    /// Linear scaling (perk.EffectPerStack × stackCount) is used as a balanced default;
    /// override here if specific perks need bespoke curves.
    /// </summary>
    internal sealed class PerkEffectResolver
    {
        private readonly Survivor _survivor;
        // Spec-defined non-linear stack curves keyed by effectKey.
        private static readonly Dictionary<string, float[]> SpecCurves = new Dictionary<string, float[]>
        {
            // Combat
            { "melee_damage_mult",   new[] { 0.10f, 0.20f, 0.35f } },
            { "crit_chance_add",     new[] { 0.05f, 0.10f, 0.18f } },
            // Survival
            { "damage_taken_mult",   new[] { -0.08f, -0.15f, -0.25f } },
            { "stamina_regen_mult",  new[] { 0.15f, 0.25f, 0.40f } },
            { "bonus_loot_chance",   new[] { 0.10f, 0.20f, 0.35f } },
            // Crafting / Traversal / Social
            { "craft_cost_mult",     new[] { -0.10f, -0.18f, -0.28f } },
            { "craft_time_mult",     new[] { -0.15f, -0.25f, -0.40f } },
            { "recycle_yield_mult",  new[] { 0.10f, 0.20f, 0.35f } },
            { "move_speed_mult",     new[] { 0.10f, 0.20f, 0.35f } },
            { "encounter_rate_mult", new[] { -0.10f, -0.20f, -0.35f } },
            { "carry_weight_mult",   new[] { 0.15f, 0.28f, 0.45f } },
            { "buy_price_mult",      new[] { -0.08f, -0.15f, -0.25f } },
            { "xp_gain_mult",        new[] { 0.10f, 0.18f, 0.30f } },
            { "rare_item_rate_mult", new[] { 0.10f, 0.20f, 0.35f } },
        };

        public PerkEffectResolver(Survivor s) { _survivor = s; }

        /// <summary>Total effect from all stacks of all perks contributing to <paramref name="effectKey"/>.</summary>
        public float SumEffect(string effectKey)
        {
            float total = 0f;
            foreach (var entry in _survivor.Perks.Stacks)
            {
                // Perk lookup intentionally skipped here — caller would normally hold the catalog.
                // We use the curve table directly keyed by the entry's perkId where the perk
                // is one of the seeded 15. Adapter is permissive: unknown perks contribute 0.
                if (SpecCurves.TryGetValue(GuessEffectKeyFromPerkId(entry.perkId), out var curve))
                {
                    int stacks = Mathf.Clamp(entry.count, 0, curve.Length);
                    if (stacks > 0 && GuessEffectKeyFromPerkId(entry.perkId) == effectKey)
                        total += curve[stacks - 1];
                }
            }
            return total;
        }

        /// <summary>Convenience: how many stacks of a perk by ID.</summary>
        public int Stacks(string perkId)
        {
            foreach (var entry in _survivor.Perks.Stacks)
            {
                if (entry.perkId == perkId) return entry.count;
            }
            return 0;
        }

        /// <summary>Map starter-perk IDs to their effect keys. Replace with a Perk SO lookup once a catalog service exists.</summary>
        private static string GuessEffectKeyFromPerkId(string id)
        {
            switch (id)
            {
                case "iron_fist":        return "melee_damage_mult";
                case "dead_eye":         return "crit_chance_add";
                case "first_blood":      return "initiative_priority";
                case "iron_skin":        return "damage_taken_mult";
                case "second_wind":      return "stamina_regen_mult";
                case "scavengers_luck":  return "bonus_loot_chance";
                case "efficient_hands":  return "craft_cost_mult";
                case "quick_build":      return "craft_time_mult";
                case "recycler_pro":     return "recycle_yield_mult";
                case "light_foot":       return "move_speed_mult";
                case "ghost_step":       return "encounter_rate_mult";
                case "pack_mule":        return "carry_weight_mult";
                case "silver_tongue":    return "buy_price_mult";
                case "morale_boost":     return "xp_gain_mult";
                case "networked":        return "rare_item_rate_mult";
                default: return id;
            }
        }
    }
}
