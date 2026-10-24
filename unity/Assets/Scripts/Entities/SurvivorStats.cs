// Assets/Scripts/Entities/SurvivorStats.cs
using System;
using UnityEngine;

namespace ZedIdler.Entities
{
    /// <summary>
    /// The seven core survivor stats, each clamped to the 1–100 range.
    /// Pure C# class — serialized as part of a survivor's <c>SaveData</c> blob.
    /// </summary>
    /// <remarks>
    /// All mutations go through <see cref="ModifyStat"/> / <see cref="SetStat"/>
    /// which enforce the [1, 100] clamp and fire <see cref="OnStatChanged"/>.
    /// Direct field writes are not allowed.
    /// </remarks>
    [Serializable]
    public sealed class SurvivorStats
    {
        public const int MinStat = 1;
        public const int MaxStat = 100;

        [SerializeField, Range(MinStat, MaxStat)] private int strength   = 1;
        [SerializeField, Range(MinStat, MaxStat)] private int agility    = 1;
        [SerializeField, Range(MinStat, MaxStat)] private int endurance  = 1;
        [SerializeField, Range(MinStat, MaxStat)] private int intellect  = 1;
        [SerializeField, Range(MinStat, MaxStat)] private int scavenging = 1;
        [SerializeField, Range(MinStat, MaxStat)] private int combat     = 1;
        [SerializeField, Range(MinStat, MaxStat)] private int survival   = 1;

        // ─── Read-only accessors ─────────────────────────────────────────────
        public int Strength   => strength;
        public int Agility    => agility;
        public int Endurance  => endurance;
        public int Intellect  => intellect;
        public int Scavenging => scavenging;
        public int Combat     => combat;
        public int Survival   => survival;

        /// <summary>Fired whenever a stat is changed. (stat key, oldValue, newValue)</summary>
        public event Action<StatKey, int, int> OnStatChanged;

        /// <summary>Set all seven stats at once, e.g. from a CharacterTypeDefinition.</summary>
        public void SetAll(int str, int agi, int end, int intl, int scv, int cmb, int sur)
        {
            SetStat(StatKey.Strength,   str);
            SetStat(StatKey.Agility,    agi);
            SetStat(StatKey.Endurance,  end);
            SetStat(StatKey.Intellect,  intl);
            SetStat(StatKey.Scavenging, scv);
            SetStat(StatKey.Combat,     cmb);
            SetStat(StatKey.Survival,   sur);
        }

        /// <summary>Absolute set — replaces current value, clamped to [1, 100].</summary>
        public void SetStat(StatKey key, int value)
        {
            int clamped = Mathf.Clamp(value, MinStat, MaxStat);
            int old = Get(key);
            Apply(key, clamped);
            if (clamped != old) OnStatChanged?.Invoke(key, old, clamped);
        }

        /// <summary>Relative change — adds delta to current value, clamped to [1, 100].</summary>
        public void ModifyStat(StatKey key, int delta)
        {
            if (delta == 0) return;
            int old = Get(key);
            int target = Mathf.Clamp(old + delta, MinStat, MaxStat);
            if (target == old) return;
            Apply(key, target);
            OnStatChanged?.Invoke(key, old, target);
        }

        /// <summary>Lookup a stat by key.</summary>
        public int Get(StatKey key)
        {
            switch (key)
            {
                case StatKey.Strength:   return strength;
                case StatKey.Agility:    return agility;
                case StatKey.Endurance:  return endurance;
                case StatKey.Intellect:  return intellect;
                case StatKey.Scavenging: return scavenging;
                case StatKey.Combat:     return combat;
                case StatKey.Survival:   return survival;
                default: return MinStat;
            }
        }

        private void Apply(StatKey key, int value)
        {
            switch (key)
            {
                case StatKey.Strength:   strength = value;   break;
                case StatKey.Agility:    agility = value;    break;
                case StatKey.Endurance:  endurance = value;  break;
                case StatKey.Intellect:  intellect = value;  break;
                case StatKey.Scavenging: scavenging = value; break;
                case StatKey.Combat:     combat = value;     break;
                case StatKey.Survival:   survival = value;   break;
            }
        }
    }

    /// <summary>Stable key for each stat — used in events, mods, and lookups.</summary>
    public enum StatKey
    {
        Strength   = 0,
        Agility    = 1,
        Endurance  = 2,
        Intellect  = 3,
        Scavenging = 4,
        Combat     = 5,
        Survival   = 6
    }
}
