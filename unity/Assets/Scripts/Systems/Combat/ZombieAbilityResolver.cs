// Assets/Scripts/Systems/Combat/ZombieAbilityResolver.cs
using System;
using UnityEngine;
using ZedIdler.Data;

namespace ZedIdler.Systems.Combat
{
    /// <summary>
    /// Applies <see cref="ZombieAbility"/> effects during combat. The combat
    /// system calls the relevant hook at each phase; the resolver mutates the
    /// encounter / survivor state and returns side-effect descriptors the
    /// combat log + UI can react to.
    /// </summary>
    /// <remarks>
    /// Stateless aside from per-encounter accumulators passed by ref. Designed
    /// so SquadCombatSystem can call it without owning ability logic itself.
    /// </remarks>
    public sealed class ZombieAbilityResolver
    {
        private readonly System.Random _rng;
        public ZombieAbilityResolver(System.Random rng = null) { _rng = rng ?? new System.Random(); }

        /// <summary>Called at the start of the zombie's turn (before it attacks).</summary>
        public AbilityTick OnZombieTurnStart(ZombieDefinition def, ref int zombieHp, int zombieMaxHp, ref int armorStacks)
        {
            var tick = new AbilityTick();
            if (def.HasAbility(ZombieAbility.SelfHeal) && zombieHp < zombieMaxHp)
            {
                int heal = Mathf.Min(def.SelfHealPerTurn, zombieMaxHp - zombieHp);
                zombieHp += heal;
                tick.healed = heal;
            }
            if (def.HasAbility(ZombieAbility.ArmorOnHit))
            {
                armorStacks += 1;
                tick.armorGained = 1;
            }
            return tick;
        }

        /// <summary>Modifies zombie outgoing damage (e.g. enrage).</summary>
        public int ModifyZombieDamage(ZombieDefinition def, int baseDamage, int zombieHp, int zombieMaxHp)
        {
            float mult = 1f;
            if (def.HasAbility(ZombieAbility.EnrageBelow50Hp) && zombieHp <= zombieMaxHp / 2)
                mult += 0.5f;
            return Mathf.RoundToInt(baseDamage * mult);
        }

        /// <summary>
        /// Called when a survivor strikes the zombie. Returns reflected damage,
        /// whether the hit was dodged, summon flag, and weapon-durability drain.
        /// </summary>
        public AbilityOnHit OnZombieStruck(ZombieDefinition def, int incomingDamage)
        {
            var r = new AbilityOnHit();
            if (def.HasAbility(ZombieAbility.TeleportEvasion) && _rng.NextDouble() < 0.20)
            {
                r.dodged = true;
                return r; // no other effects if dodged
            }
            if (def.HasAbility(ZombieAbility.ReflectDamage))
                r.reflectedDamage = Mathf.RoundToInt(incomingDamage * def.ReflectPct);
            if (def.HasAbility(ZombieAbility.SummonOnHit) && _rng.NextDouble() < 0.25)
                r.summonStandard = true;
            if (def.HasAbility(ZombieAbility.DrainWeaponDur))
                r.extraWeaponDurabilityCost = 2;
            return r;
        }

        /// <summary>Called when the zombie attacks a survivor.</summary>
        public AbilityOnAttack OnZombieAttacks(ZombieDefinition def)
        {
            var r = new AbilityOnAttack();
            if (def.HasAbility(ZombieAbility.InfectsOnHit)) r.appliesDot = true;
            if (def.HasAbility(ZombieAbility.EMPPulse) && _rng.NextDouble() < 0.30) r.disablesFirearms = true;
            return r;
        }

        /// <summary>Called when the zombie dies. Returns AOE + bonus loot effects.</summary>
        public AbilityOnDeath OnZombieDeath(ZombieDefinition def)
        {
            var r = new AbilityOnDeath();
            if (def.HasAbility(ZombieAbility.AoEOnDeath)) r.aoeDamageToSquad = def.DeathAoeDamage;
            if (def.HasAbility(ZombieAbility.RMatCorrupted)) r.bonusRmatShards = 1 + _rng.Next(3);
            return r;
        }

        /// <summary>Encounter-frequency multiplier contributed by SwarmCall.</summary>
        public float EncounterFrequencyMultiplier(ZombieDefinition def) =>
            def.HasAbility(ZombieAbility.SwarmCall) ? 1.5f : 1f;
    }

    public struct AbilityTick { public int healed; public int armorGained; }
    public struct AbilityOnHit { public bool dodged; public int reflectedDamage; public bool summonStandard; public int extraWeaponDurabilityCost; }
    public struct AbilityOnAttack { public bool appliesDot; public bool disablesFirearms; }
    public struct AbilityOnDeath { public int aoeDamageToSquad; public int bonusRmatShards; }
}
