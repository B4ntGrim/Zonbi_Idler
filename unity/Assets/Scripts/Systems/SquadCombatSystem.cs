// Assets/Scripts/Systems/SquadCombatSystem.cs
using System;
using System.Collections.Generic;
using UnityEngine;
using ZedIdler.Data;
using ZedIdler.Entities;

namespace ZedIdler.Systems
{
    /// <summary>
    /// Multi-survivor turn-based combat orchestrator. Built alongside the
    /// existing single-survivor <see cref="CombatSystem"/> so legacy flows
    /// keep working unchanged. <see cref="WanderingSceneController.StartRun(Survivor)"/>
    /// degenerates to a 1-member squad.
    /// </summary>
    /// <remarks>
    /// Combat model (spec):
    /// • Each encounter is 1 zombie vs N survivors (N = 1..4).
    /// • Initiative is rolled once per encounter for every actor (squad + zombie)
    ///   and the resulting order drives every turn round-robin.
    /// • Zombie targets the survivor with the lowest current HP (leftmost on tie).
    /// • Survivors auto-attack the active zombie (only one zombie per encounter).
    /// • A downed survivor stays down for the rest of the run — they're skipped
    ///   on every subsequent turn order.
    /// • Run ends when every squad member is at 0 HP.
    ///
    /// Loot routes to <see cref="IBackpackService"/> exactly as in single-survivor
    /// mode (controller handles routing). Per-survivor HP is exposed via
    /// <see cref="GetSurvivorHp"/> so the HUD strip can render N bars.
    /// </remarks>
    public sealed class SquadCombatSystem : ICombatCommandHandler
    {
        private const float CritMultiplier = 1.75f; // legacy fallback; runtime uses BalanceRuntime.CritMultiplier

        private readonly List<Survivor> _squad;
        private readonly Dictionary<string, SurvivorCombatState> _stateById = new Dictionary<string, SurvivorCombatState>();
        private readonly CombatLog _log;
        private readonly System.Random _rng;
        private readonly PerkEffectResolver[] _perksPerSurvivor;
        private ZedIdler.Services.IEquipmentService _equip;
        private ZedIdler.Services.IFactionReputationProvider _factionRep;
        private readonly ZedIdler.Systems.Combat.ZombieAbilityResolver _abilityResolver;
        private readonly ZedIdler.Systems.Combat.WeaponTraitResolver _traitResolver;
        private int _zombieArmorStacks;

        private CombatEncounter _current;
        private List<TurnSlot> _turnOrder = new List<TurnSlot>();
        private int _turnPointer;
        private float _turnAccumulator;
        private int _turnCount;

        public IReadOnlyList<Survivor> Squad => _squad;
        public CombatEncounter Current => _current;
        public CombatLog Log => _log;
        public bool IsInEncounter => _current != null && !_current.isOver;
        public bool IsSquadWiped
        {
            get
            {
                foreach (var s in _squad)
                    if (s != null && _stateById.TryGetValue(s.Id, out var st) && st.hp > 0) return false;
                return true;
            }
        }

        public event Action<CombatEncounter, TurnSlot> OnEncounterStarted;
        public event Action<CombatEncounter> OnEncounterEnded;
        public event Action<int, TurnAction> OnTurnResolved;
        public event Action<ZombieDefinition, LootDrop[]> OnZombieDefeated;
        public event Action<Survivor> OnSurvivorDowned;
        public event Action OnSquadWiped;
        public event Action<LogEntry> OnCombatLogEntry;
        public event Action<string, int> OnSurvivorHpChanged; // (survivorId, newHp)

        public SquadCombatSystem(IList<Survivor> squad, int? rngSeed = null)
        {
            if (squad == null || squad.Count == 0)
                throw new ArgumentException("Squad must contain at least one survivor.", nameof(squad));
            _squad = new List<Survivor>(squad);
            _rng = rngSeed.HasValue ? new System.Random(rngSeed.Value) : new System.Random();
            _log = new CombatLog();
            _log.BindHandler(this);
            _log.OnEntryAppended += e => OnCombatLogEntry?.Invoke(e);

            ZedIdler.Services.ServiceLocator.TryGet(out _equip);
            ZedIdler.Services.ServiceLocator.TryGet(out _factionRep);

            _abilityResolver = new ZedIdler.Systems.Combat.ZombieAbilityResolver(_rng);
            _traitResolver = new ZedIdler.Systems.Combat.WeaponTraitResolver(_rng);

            _perksPerSurvivor = new PerkEffectResolver[_squad.Count];
            for (int i = 0; i < _squad.Count; i++)
            {
                var s = _squad[i];
                int maxHp = Mathf.Max(50, s.Stats.Endurance * ZedIdler.Services.BalanceRuntime.HpPerEndurance);
                _stateById[s.Id] = new SurvivorCombatState { hp = maxHp, maxHp = maxHp, slotIndex = i };
                _perksPerSurvivor[i] = new PerkEffectResolver(s);
            }
        }

        // ─── Encounter API ────────────────────────────────────────────────────
        public void BeginEncounter(ZombieDefinition zombieDef)
        {
            if (zombieDef == null) throw new ArgumentNullException(nameof(zombieDef));
            if (IsInEncounter) { _log.Append("[warn] Encounter already active.", LogChannel.Warning); return; }
            if (IsSquadWiped)  { _log.Append("[warn] Squad is wiped, cannot start encounter.", LogChannel.Warning); return; }

            int hp = _rng.Next(zombieDef.HpMin, zombieDef.HpMax + 1);
            _current = new CombatEncounter
            {
                zombieDef = zombieDef,
                zombieMaxHp = hp,
                zombieHp = hp,
                turnsRemaining = 999,
                isOver = false
            };

            _turnOrder.Clear();
            BuildTurnOrder(zombieDef);
            _turnPointer = 0;
            _turnAccumulator = 0f;
            _turnCount = 0;

            _log.Append($"--- Squad Encounter: {zombieDef.DisplayName} (T{zombieDef.Tier}) HP {hp} ---", LogChannel.Info);
            _log.Append($"Turn order: {DescribeTurnOrder()}", LogChannel.Info);
            OnEncounterStarted?.Invoke(_current, _turnOrder.Count > 0 ? _turnOrder[0] : default);
        }

        private void BuildTurnOrder(ZombieDefinition z)
        {
            var entries = new List<(float score, TurnSlot slot)>();
            // Survivors
            for (int i = 0; i < _squad.Count; i++)
            {
                var s = _squad[i];
                if (s == null) continue;
                var st = _stateById[s.Id];
                if (st.hp <= 0) continue; // Downed survivors skip turn order entirely.
                int fbStacks = _perksPerSurvivor[i].Stacks("first_blood");
                int agilityBonus = s.Stats.Agility / 10;
                int roll = s.Stats.Agility + agilityBonus + _rng.Next(1, 11);
                if (fbStacks >= 1 && !z.IsElite) roll += 100; // First Blood priority spike.
                entries.Add((roll, new TurnSlot { actor = TurnActor.Player, survivorId = s.Id, slotIndex = i }));
            }
            // Zombie
            int zRoll = z.Speed + z.TierInitiativeBonus + z.InitiativeBonus + _rng.Next(1, 11);
            entries.Add((zRoll, new TurnSlot { actor = TurnActor.Zombie, survivorId = null, slotIndex = -1 }));

            entries.Sort((a, b) => b.score.CompareTo(a.score));
            _turnOrder.Clear();
            for (int i = 0; i < entries.Count; i++) _turnOrder.Add(entries[i].slot);
        }

        public void Tick(float deltaSeconds, float turnIntervalSeconds = 1f)
        {
            if (!IsInEncounter) return;
            _turnAccumulator += deltaSeconds;
            while (_turnAccumulator >= turnIntervalSeconds && IsInEncounter)
            {
                _turnAccumulator -= turnIntervalSeconds;
                AdvanceTurn();
            }
        }

        public TurnAction AdvanceTurn()
        {
            if (!IsInEncounter || _turnOrder.Count == 0) return default;

            // Find next live actor.
            int safety = _turnOrder.Count + 1;
            TurnSlot slot;
            while (true)
            {
                slot = _turnOrder[_turnPointer];
                _turnPointer = (_turnPointer + 1) % _turnOrder.Count;
                if (slot.actor == TurnActor.Zombie) break;
                if (_stateById.TryGetValue(slot.survivorId, out var st) && st.hp > 0) break;
                if (--safety <= 0) return default; // No live actors left.
            }

            _turnCount++;
            TurnAction action = slot.actor == TurnActor.Player
                ? ResolveSurvivorAttack(slot)
                : ResolveZombieAttack();
            OnTurnResolved?.Invoke(_turnCount, action);

            if (_current.zombieHp <= 0) HandleZombieDefeated();
            else if (IsSquadWiped) HandleSquadWiped();
            return action;
        }

        public void EndEncounter()
        {
            if (_current == null) return;
            _current.isOver = true;
            OnEncounterEnded?.Invoke(_current);
            _current = null;
        }

        // ─── Combat math ──────────────────────────────────────────────────────
        private TurnAction ResolveSurvivorAttack(TurnSlot slot)
        {
            var s = _squad[slot.slotIndex];
            var perks = _perksPerSurvivor[slot.slotIndex];
            var z = _current.zombieDef;

            ZedIdler.Services.WeaponDamageProfile profile = default;
            string firedInstanceId = null;
            bool isMelee = true;
            if (_equip != null)
            {
                int rank = _factionRep?.GetAlignedFactionRank() ?? 0;
                var primary = _equip.GetEquippedInstance(s.Id, ZedIdler.Data.WeaponSlot.Primary);
                if (!string.IsNullOrEmpty(primary.instanceId) && primary.currentAmmo > 0 && !primary.isBroken)
                {
                    profile = _equip.GetDamageProfile(primary.instanceId, rank);
                    firedInstanceId = primary.instanceId;
                    isMelee = profile.kind == ZedIdler.Data.WeaponKind.Melee;
                }
                else
                {
                    var melee = _equip.GetEquippedInstance(s.Id, ZedIdler.Data.WeaponSlot.Melee);
                    if (!string.IsNullOrEmpty(melee.instanceId))
                    {
                        profile = _equip.GetDamageProfile(melee.instanceId, rank);
                        firedInstanceId = melee.instanceId;
                        isMelee = true;
                    }
                }
            }

            float baseDmg = s.Stats.Strength + s.Stats.Combat * 0.5f;
            float weaponDmgRoll = 0f;
            float weaponMult = 1f;
            float critBonus = 0f;
            bool fired = true;
            if (firedInstanceId != null && profile.maxDamage > 0)
            {
                weaponDmgRoll = _rng.Next(profile.minDamage, profile.maxDamage + 1);
                weaponMult = profile.damageMult;
                critBonus = profile.critChanceBonus;
                if (!isMelee) fired = _equip.OnRangedShot(firedInstanceId);
                else _equip.OnMelee(firedInstanceId);
            }

            if (!fired)
            {
                _log.Append($"[T{_turnCount}] {s.DisplayName} MISFIRED.", LogChannel.Warning);
                return new TurnAction { actor = TurnActor.Player, damage = 0, wasCrit = false, targetHpAfter = _current.zombieHp };
            }

            float critChance = (s.Stats.Combat * ZedIdler.Services.BalanceRuntime.CritChancePerCombat) + perks.SumEffect("crit_chance_add") + critBonus;
            bool isCrit = _rng.NextDouble() < critChance;
            float meleeMult = 1f + perks.SumEffect("melee_damage_mult");
            float dmg = (baseDmg + weaponDmgRoll) * meleeMult * weaponMult;
            if (isCrit) dmg *= ZedIdler.Services.BalanceRuntime.CritMultiplier;
            int rawDamage = Mathf.RoundToInt(dmg);

            // Weapon unique trait pass (ignore_armor / execute_low_hp / aoe / bleed).
            string traitId = profile.instanceId != null ? GetEquippedTraitId(s.Id) : null;
            float hpFrac = _current.zombieMaxHp > 0 ? (float)_current.zombieHp / _current.zombieMaxHp : 1f;
            var trait = _traitResolver.ApplyOutgoing(traitId, rawDamage, hpFrac);
            rawDamage = trait.finalDamage;

            // Zombie defensive abilities (reflect / dodge / summon / drain) on being struck.
            var onHit = _abilityResolver.OnZombieStruck(z, rawDamage);
            if (onHit.dodged)
            {
                _log.Append($"[T{_turnCount}] {z.DisplayName} EVADES {s.DisplayName}'s strike.", LogChannel.Info);
                return new TurnAction { actor = TurnActor.Player, damage = 0, wasCrit = false, targetHpAfter = _current.zombieHp };
            }

            int armorApplied = trait.ignoreArmor ? 0 : (z.Armor + _zombieArmorStacks);
            int final = Mathf.Max(1, rawDamage - armorApplied);
            _current.zombieHp = Mathf.Max(0, _current.zombieHp - final);

            // Reflected damage back to the attacker.
            if (onHit.reflectedDamage > 0)
            {
                var rst = _stateById[s.Id];
                rst.hp = Mathf.Max(0, rst.hp - onHit.reflectedDamage);
                _stateById[s.Id] = rst;
                OnSurvivorHpChanged?.Invoke(s.Id, rst.hp);
                _log.Append($"[T{_turnCount}] {z.DisplayName} REFLECTS {onHit.reflectedDamage} to {s.DisplayName}.", LogChannel.Damage);
            }
            // Extra weapon durability drain.
            if (onHit.extraWeaponDurabilityCost > 0 && firedInstanceId != null)
                _equip?.OnMelee(firedInstanceId); // applies another durability tick

            string suffix = trait.executed ? " EXECUTE!" : "";
            _log.Append(isCrit
                ? $"[T{_turnCount}] CRIT!{suffix} {s.DisplayName} → {z.DisplayName} for {final} (HP {_current.zombieHp}/{_current.zombieMaxHp})"
                : $"[T{_turnCount}] {s.DisplayName} → {z.DisplayName} for {final}{suffix} (HP {_current.zombieHp}/{_current.zombieMaxHp})",
                isCrit ? LogChannel.Crit : LogChannel.Hit);
            return new TurnAction { actor = TurnActor.Player, damage = final, wasCrit = isCrit, targetHpAfter = _current.zombieHp };
        }

        /// <summary>Resolve the equipped weapon's unique trait id for a survivor (primary, else melee).</summary>
        private string GetEquippedTraitId(string survivorId)
        {
            if (_equip == null) return null;
            var primary = _equip.GetEquippedInstance(survivorId, ZedIdler.Data.WeaponSlot.Primary);
            string id = !string.IsNullOrEmpty(primary.instanceId) ? primary.weaponId : null;
            if (string.IsNullOrEmpty(id))
            {
                var melee = _equip.GetEquippedInstance(survivorId, ZedIdler.Data.WeaponSlot.Melee);
                id = melee.weaponId;
            }
            if (string.IsNullOrEmpty(id)) return null;
            var cat = ZedIdler.Services.ServiceLocator.Get<ZedIdler.Services.IWeaponCatalogProvider>();
            var def = cat?.GetWeapon(id);
            return def?.UniqueTraitId;
        }

        private TurnAction ResolveZombieAttack()
        {
            var z = _current.zombieDef;

            // Turn-start abilities: self-heal + armor stacking.
            _abilityResolver.OnZombieTurnStart(z, ref _current.zombieHp, _current.zombieMaxHp, ref _zombieArmorStacks);

            int baseDmg = _rng.Next(z.DamageMin, z.DamageMax + 1);
            // Enrage modifier.
            baseDmg = _abilityResolver.ModifyZombieDamage(z, baseDmg, _current.zombieHp, _current.zombieMaxHp);

            // Pick target: lowest current HP, leftmost on tie.
            int targetSlot = -1;
            int lowestHp = int.MaxValue;
            for (int i = 0; i < _squad.Count; i++)
            {
                var s = _squad[i];
                if (s == null) continue;
                var st = _stateById[s.Id];
                if (st.hp <= 0) continue;
                if (st.hp < lowestHp) { lowestHp = st.hp; targetSlot = i; }
            }
            if (targetSlot < 0) return default;

            var target = _squad[targetSlot];
            var perks = _perksPerSurvivor[targetSlot];
            float damageMult = Mathf.Clamp(1f + perks.SumEffect("damage_taken_mult"), 0.1f, 1f);
            int final = Mathf.Max(1, Mathf.RoundToInt(baseDmg * damageMult));

            var st2 = _stateById[target.Id];
            st2.hp = Mathf.Max(0, st2.hp - final);
            _stateById[target.Id] = st2;
            OnSurvivorHpChanged?.Invoke(target.Id, st2.hp);

            _log.Append($"[T{_turnCount}] {z.DisplayName} → {target.DisplayName} for {final} (HP {st2.hp}/{st2.maxHp})", LogChannel.Damage);

            if (st2.hp <= 0)
            {
                _log.Append($"{target.DisplayName} is DOWN.", LogChannel.Defeat);
                OnSurvivorDowned?.Invoke(target);
            }
            return new TurnAction { actor = TurnActor.Zombie, damage = final, wasCrit = false, targetHpAfter = st2.hp };
        }

        private void HandleZombieDefeated()
        {
            var z = _current.zombieDef;
            var loot = z.LootTable != null ? z.LootTable.RollMultiple(rng: _rng) : Array.Empty<LootDrop>();
            // XP split evenly across living squad members.
            int aliveCount = 0;
            for (int i = 0; i < _squad.Count; i++)
                if (_squad[i] != null && _stateById[_squad[i].Id].hp > 0) aliveCount++;
            if (aliveCount > 0)
            {
                long xpEach = Math.Max(1, z.BaseXp / aliveCount);
                for (int i = 0; i < _squad.Count; i++)
                {
                    var s = _squad[i];
                    if (s == null || _stateById[s.Id].hp <= 0) continue;
                    s.AwardXp(xpEach);
                }
            }
            _log.Append($"[T{_turnCount}] {z.DisplayName} defeated. XP shared.", LogChannel.Kill);

            // Death abilities: AOE to squad + bonus RMAT.
            var onDeath = _abilityResolver.OnZombieDeath(z);
            if (onDeath.aoeDamageToSquad > 0)
            {
                _log.Append($"[T{_turnCount}] {z.DisplayName} ERUPTS for {onDeath.aoeDamageToSquad} to the squad!", LogChannel.Damage);
                for (int i = 0; i < _squad.Count; i++)
                {
                    var sv = _squad[i];
                    if (sv == null) continue;
                    var st = _stateById[sv.Id];
                    if (st.hp <= 0) continue;
                    st.hp = Mathf.Max(0, st.hp - onDeath.aoeDamageToSquad);
                    _stateById[sv.Id] = st;
                    OnSurvivorHpChanged?.Invoke(sv.Id, st.hp);
                    if (st.hp <= 0) { _log.Append($"{sv.DisplayName} is DOWN.", LogChannel.Defeat); OnSurvivorDowned?.Invoke(sv); }
                }
            }
            if (onDeath.bonusRmatShards > 0)
            {
                var arr = new List<LootDrop>(loot);
                arr.Add(new LootDrop { itemId = "rmat_shard", quantity = onDeath.bonusRmatShards, rarity = LootRarity.Rare });
                loot = arr.ToArray();
                _log.Append($"[T{_turnCount}] Recovered {onDeath.bonusRmatShards}× RMAT shard.", LogChannel.Loot);
            }

            _zombieArmorStacks = 0; // reset for next encounter
            ZedIdler.Services.ServiceLocator.Get<ZedIdler.Services.Analytics.IAnalyticsService>()
                ?.Combat("zombie_killed", new System.Collections.Generic.Dictionary<string, object>
                {
                    { "tier", z.Tier.ToString() }, { "zombie", z.ZombieId }
                });
            OnZombieDefeated?.Invoke(z, loot);
            _current.isOver = true;
            OnEncounterEnded?.Invoke(_current);
            _current = null;
        }

        private void HandleSquadWiped()
        {
            _log.Append("[!] Squad wiped. Run ends.", LogChannel.Defeat);
            ZedIdler.Services.ServiceLocator.Get<ZedIdler.Services.Analytics.IAnalyticsService>()
                ?.Combat("squad_wiped", new System.Collections.Generic.Dictionary<string, object>
                {
                    { "squad_size", _squad.Count }
                });
            OnSquadWiped?.Invoke();
            if (_current != null) { _current.isOver = true; _current = null; }
        }

        // ─── Queries ──────────────────────────────────────────────────────────
        public int GetSurvivorHp(string survivorId) =>
            _stateById.TryGetValue(survivorId, out var st) ? st.hp : 0;

        public int GetSurvivorMaxHp(string survivorId) =>
            _stateById.TryGetValue(survivorId, out var st) ? st.maxHp : 0;

        public bool IsSurvivorDown(string survivorId) =>
            _stateById.TryGetValue(survivorId, out var st) && st.hp <= 0;

        public IEnumerable<string> SurvivorIds()
        {
            foreach (var s in _squad) if (s != null) yield return s.Id;
        }

        private string DescribeTurnOrder()
        {
            var parts = new List<string>();
            for (int i = 0; i < _turnOrder.Count; i++)
            {
                var t = _turnOrder[i];
                parts.Add(t.actor == TurnActor.Zombie ? _current.zombieDef.DisplayName : _squad[t.slotIndex]?.DisplayName ?? "?");
            }
            return string.Join(" → ", parts);
        }

        // ─── Snapshot ─────────────────────────────────────────────────────────
        [Serializable]
        public struct Snapshot
        {
            public SurvivorHpEntry[] survivorHp;
        }

        [Serializable]
        public struct SurvivorHpEntry
        {
            public string survivorId;
            public int hp;
            public int maxHp;
        }

        public Snapshot CreateSnapshot()
        {
            var arr = new SurvivorHpEntry[_squad.Count];
            for (int i = 0; i < _squad.Count; i++)
            {
                var s = _squad[i];
                var st = _stateById[s.Id];
                arr[i] = new SurvivorHpEntry { survivorId = s.Id, hp = st.hp, maxHp = st.maxHp };
            }
            return new Snapshot { survivorHp = arr };
        }

        public void Restore(Snapshot snap)
        {
            if (snap.survivorHp == null) return;
            for (int i = 0; i < snap.survivorHp.Length; i++)
            {
                var e = snap.survivorHp[i];
                if (string.IsNullOrEmpty(e.survivorId)) continue;
                _stateById[e.survivorId] = new SurvivorCombatState
                {
                    hp = e.hp, maxHp = e.maxHp,
                    slotIndex = _squad.FindIndex(s => s != null && s.Id == e.survivorId)
                };
            }
        }

        // ─── Command handler ──────────────────────────────────────────────────
        public CommandResult HandleCommand(string verb, string[] args)
        {
            switch (verb)
            {
                case "force_win":
                    if (!IsInEncounter) return CommandResult.Err("No active encounter.");
                    _current.zombieHp = 0;
                    HandleZombieDefeated();
                    return CommandResult.Ok("Zombie force-defeated.");
                case "show_squad":
                    var lines = new List<string>();
                    foreach (var s in _squad)
                    {
                        if (s == null) continue;
                        var st = _stateById[s.Id];
                        lines.Add($"{s.DisplayName}: {st.hp}/{st.maxHp}{(st.hp <= 0 ? " [DOWN]" : "")}");
                    }
                    return CommandResult.Ok(string.Join(" | ", lines));
                default:
                    return CommandResult.Err($"unknown command: {verb}");
            }
        }

        private struct SurvivorCombatState
        {
            public int hp;
            public int maxHp;
            public int slotIndex;
        }
    }

    [Serializable]
    public struct TurnSlot
    {
        public TurnActor actor;
        public string survivorId; // null when actor == Zombie
        public int slotIndex;
    }
}
