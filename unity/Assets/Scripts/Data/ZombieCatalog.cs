// Assets/Scripts/Data/ZombieCatalog.cs
using System;
using System.Collections.Generic;
using UnityEngine;

namespace ZedIdler.Data
{
    /// <summary>
    /// Coarse biome tags used to gate zombie spawns. Designed to be additive —
    /// new biomes append at the end so save data and serialized assets stay valid.
    /// </summary>
    [Flags]
    public enum BiomeTag
    {
        None      = 0,
        Mountain  = 1 << 0,
        Suburbia  = 1 << 1,
        Metro     = 1 << 2,
        Perimeter = 1 << 3,
        Any       = Mountain | Suburbia | Metro | Perimeter
    }

    /// <summary>
    /// Time-of-day bucket used to gate spawns (per spec section 5).
    /// 0=Any covers all hours; 1=Day; 2=Night. Matches <see cref="ZombieDefinition.TimeOfDayPreference"/>.
    /// </summary>
    public enum TimeOfDay
    {
        Any   = 0,
        Day   = 1,
        Night = 2
    }

    /// <summary>
    /// Master spawn table — references every <see cref="ZombieDefinition"/>
    /// available in the game plus per-entry biome/weight filters.
    /// </summary>
    /// <remarks>
    /// One asset per save universe. Create via:
    /// Right-click in Project → Create → ZedIdler → Zombie Catalog.
    ///
    /// Use <see cref="RollZombie"/> to get a weighted random definition for a
    /// given (biome, time-of-day, player level) tuple. <see cref="GetById"/>
    /// resolves stable IDs for the executable <c>spawn</c> combat command.
    /// </remarks>
    [CreateAssetMenu(menuName = "ZedIdler/Zombie Catalog", fileName = "ZombieCatalog", order = 50)]
    public sealed class ZombieCatalog : ScriptableObject
    {
        [SerializeField] private List<CatalogEntry> entries = new List<CatalogEntry>();

        [Tooltip("Global spawn-rate multiplier applied to all rolls (e.g. 1.25 during storms).")]
        [SerializeField, Range(0.1f, 5f)] private float globalSpawnMultiplier = 1f;

        public IReadOnlyList<CatalogEntry> Entries => entries;
        public float GlobalSpawnMultiplier
        {
            get => globalSpawnMultiplier;
            set => globalSpawnMultiplier = Mathf.Clamp(value, 0.1f, 5f);
        }

        // ─── Lookups ──────────────────────────────────────────────────────────
        public ZombieDefinition GetById(string zombieId)
        {
            if (string.IsNullOrEmpty(zombieId)) return null;
            for (int i = 0; i < entries.Count; i++)
            {
                if (entries[i].zombie != null && entries[i].zombie.ZombieId == zombieId)
                    return entries[i].zombie;
            }
            return null;
        }

        public List<ZombieDefinition> FilterByBiome(BiomeTag biome)
        {
            var result = new List<ZombieDefinition>();
            for (int i = 0; i < entries.Count; i++)
            {
                var e = entries[i];
                if (e.zombie == null) continue;
                if ((e.biomes & biome) != 0) result.Add(e.zombie);
            }
            return result;
        }

        public List<ZombieDefinition> FilterByTier(ZombieTier tier)
        {
            var result = new List<ZombieDefinition>();
            for (int i = 0; i < entries.Count; i++)
            {
                if (entries[i].zombie != null && entries[i].zombie.Tier == tier)
                    result.Add(entries[i].zombie);
            }
            return result;
        }

        /// <summary>
        /// Roll a weighted random zombie for the given context. Returns null if
        /// no entry matches all filters.
        /// </summary>
        public ZombieDefinition RollZombie(BiomeTag biome, TimeOfDay time, int playerLevel, System.Random rng = null)
        {
            rng ??= s_defaultRng;
            var pool = new List<(CatalogEntry e, float w)>();
            float total = 0f;

            for (int i = 0; i < entries.Count; i++)
            {
                var e = entries[i];
                if (e.zombie == null) continue;
                if ((e.biomes & biome) == 0) continue;
                if (e.zombie.MinPlayerLevel > playerLevel) continue;
                if (e.zombie.TimeOfDayPreference != 0
                    && time != TimeOfDay.Any
                    && (int)time != e.zombie.TimeOfDayPreference) continue;

                float weight = e.weight * globalSpawnMultiplier;
                if (weight <= 0f) continue;
                pool.Add((e, weight));
                total += weight;
            }

            if (pool.Count == 0 || total <= 0f) return null;

            float pick = (float)(rng.NextDouble() * total);
            float acc = 0f;
            for (int i = 0; i < pool.Count; i++)
            {
                acc += pool[i].w;
                if (pick <= acc) return pool[i].e.zombie;
            }
            return pool[pool.Count - 1].e.zombie;
        }

        private static readonly System.Random s_defaultRng = new System.Random();
    }

    /// <summary>One row in the catalog — a zombie + its biome flags + spawn weight.</summary>
    [Serializable]
    public struct CatalogEntry
    {
        public ZombieDefinition zombie;
        public BiomeTag biomes;
        [Range(0f, 100f)] public float weight;
    }
}
