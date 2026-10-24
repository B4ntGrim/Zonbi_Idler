// Assets/Scripts/Data/LootTable.cs
using System;
using System.Collections.Generic;
using UnityEngine;

namespace ZedIdler.Data
{
    /// <summary>
    /// Rarity buckets used by all loot rolls in the game.
    /// </summary>
    public enum LootRarity
    {
        Common   = 0,
        Uncommon = 1,
        Rare     = 2,
        Elite    = 3
    }

    /// <summary>
    /// A weighted drop table used by <see cref="ZombieDefinition"/> and other
    /// loot-emitting systems (containers, contracts, chests).
    /// </summary>
    /// <remarks>
    /// Create via: Right-click in Project → Create → ZedIdler → Loot Table.
    ///
    /// Each entry has a weight (relative probability) and a min/max stack size.
    /// <see cref="Roll"/> performs a single weighted pick and returns a
    /// <see cref="LootDrop"/>. <see cref="RollMultiple"/> can return several
    /// independent drops (for tiers where multiple items drop per kill).
    /// </remarks>
    [CreateAssetMenu(menuName = "ZedIdler/Loot Table", fileName = "Loot_New", order = 40)]
    public sealed class LootTable : ScriptableObject
    {
        [SerializeField] private List<LootEntry> entries = new List<LootEntry>();

        [Tooltip("Average number of drops per roll for this table (1 = single drop).")]
        [SerializeField, Range(1, 5)] private int dropsPerRoll = 1;

        public IReadOnlyList<LootEntry> Entries => entries;
        public int DropsPerRoll => dropsPerRoll;

        /// <summary>Single weighted roll. Returns default(LootDrop) if table is empty.</summary>
        public LootDrop Roll(System.Random rng = null)
        {
            if (entries == null || entries.Count == 0) return default;
            rng ??= s_defaultRng;

            float totalWeight = 0f;
            for (int i = 0; i < entries.Count; i++) totalWeight += entries[i].weight;
            if (totalWeight <= 0f) return default;

            float pick = (float)(rng.NextDouble() * totalWeight);
            float acc = 0f;
            for (int i = 0; i < entries.Count; i++)
            {
                acc += entries[i].weight;
                if (pick <= acc)
                {
                    var e = entries[i];
                    int qty = rng.Next(e.minQuantity, e.maxQuantity + 1);
                    return new LootDrop { itemId = e.itemId, quantity = qty, rarity = e.rarity };
                }
            }
            return default;
        }

        /// <summary>Roll multiple independent drops, defaulting to <see cref="DropsPerRoll"/>.</summary>
        public LootDrop[] RollMultiple(int count = -1, System.Random rng = null)
        {
            if (count < 0) count = dropsPerRoll;
            var arr = new LootDrop[count];
            for (int i = 0; i < count; i++) arr[i] = Roll(rng);
            return arr;
        }

        private static readonly System.Random s_defaultRng = new System.Random();
    }

    [Serializable]
    public struct LootEntry
    {
        public string itemId;
        public LootRarity rarity;
        [Range(0.01f, 100f)] public float weight;
        public int minQuantity;
        public int maxQuantity;
    }

    /// <summary>A single resolved loot drop returned by <see cref="LootTable.Roll"/>.</summary>
    [Serializable]
    public struct LootDrop
    {
        public string itemId;
        public int quantity;
        public LootRarity rarity;
        public bool IsValid => !string.IsNullOrEmpty(itemId) && quantity > 0;
    }
}
