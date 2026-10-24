// Assets/Scripts/Services/BackpackService.cs
using System;
using System.Collections.Generic;
using UnityEngine;
using ZedIdler.Data;
using ZedIdler.Entities;

namespace ZedIdler.Services
{
    /// <summary>
    /// Run-scoped weight-gated wrapper that captures loot during a Wandering run
    /// before merging into the base <see cref="IInventoryService"/> on return.
    /// </summary>
    /// <remarks>
    /// Architecturally a "derived view" of inventory: items use the same shape
    /// (<see cref="LootDrop"/>) so transfer is a simple iteration. Capacity is
    /// computed per-run from the active survivor's Strength stat and Pack Mule
    /// perk stacks; resets every time <see cref="StartRun"/> is called.
    ///
    /// Overflow policy: silent skip with <see cref="OnLootSkipped"/> event and
    /// a combat-log line. Auto-loot continues until the cap is reached.
    /// </remarks>
    [DisallowMultipleComponent]
    public sealed class BackpackService : MonoBehaviour, IBackpackService
    {
        public const float DefaultBaseCap = 40f;     // kg
        public const float DefaultItemWeight = 0.5f; // kg per unit if no override

        [Header("Capacity")]
        [SerializeField, Range(10f, 200f)] private float baseWeightCap = DefaultBaseCap;

        [Header("Per-Item Weights (designer-authored overrides)")]
        [SerializeField] private List<ItemWeightEntry> itemWeights = new List<ItemWeightEntry>();

        // ─── Runtime state ────────────────────────────────────────────────────
        private readonly Dictionary<string, int> _contents = new Dictionary<string, int>();
        private readonly Dictionary<string, LootRarity> _highestRarity = new Dictionary<string, LootRarity>();
        private readonly Dictionary<string, float> _weightLookup = new Dictionary<string, float>();

        private Survivor _survivor;
        private float _weightCap;
        private float _currentWeight;
        private IInventoryService _inventory;

        public float WeightCap     => _weightCap;
        public float CurrentWeight => _currentWeight;
        public float Headroom      => Mathf.Max(0f, _weightCap - _currentWeight);
        public bool  IsActive      => _survivor != null;
        public IReadOnlyDictionary<string, int> Contents => _contents;

        public event Action<LootDrop> OnItemLooted;
        public event Action<LootDrop, SkipReason> OnLootSkipped;
        public event Action OnBackpackCleared;
        public event Action OnRunStarted;
        public event Action OnRunEnded;

        // ─── Lifecycle ────────────────────────────────────────────────────────
        private void Awake()
        {
            DontDestroyOnLoad(gameObject);
            for (int i = 0; i < itemWeights.Count; i++)
            {
                var e = itemWeights[i];
                if (!string.IsNullOrEmpty(e.itemId))
                    _weightLookup[e.itemId] = Mathf.Max(0.01f, e.kgPerUnit);
            }
            ServiceLocator.Register<IBackpackService>(this);
        }

        private void OnDestroy() => ServiceLocator.Unregister<IBackpackService>();

        // ─── Run management ───────────────────────────────────────────────────
        public void StartRun(Survivor survivor)
        {
            if (survivor == null) throw new ArgumentNullException(nameof(survivor));
            StartRunWithSquad(new[] { survivor });
        }

        /// <summary>
        /// Multi-survivor variant. Carry-weight cap is the SUM of each squad
        /// member's individual cap (Strength + Pack Mule + base) per spec.
        /// </summary>
        public void StartRunWithSquad(IList<Survivor> squad)
        {
            if (squad == null || squad.Count == 0) throw new ArgumentException("Empty squad.", nameof(squad));
            _survivor = squad[0];
            ServiceLocator.TryGet(out _inventory);
            _contents.Clear();
            _highestRarity.Clear();
            _currentWeight = 0f;

            float total = 0f;
            for (int i = 0; i < squad.Count; i++)
            {
                if (squad[i] == null) continue;
                total += ComputeWeightCap(squad[i]);
            }
            _weightCap = total;
            OnRunStarted?.Invoke();
            OnBackpackCleared?.Invoke();
        }

        public void EndRun(bool transferToInventory)
        {
            if (transferToInventory) TransferToInventory();
            else Clear();
            _survivor = null;
            OnRunEnded?.Invoke();
        }

        // ─── Loot pipeline ────────────────────────────────────────────────────
        public bool TryAddDrop(LootDrop drop)
        {
            if (!IsActive)         { OnLootSkipped?.Invoke(drop, SkipReason.NoActiveRun); return false; }
            if (!drop.IsValid)     return false;

            float unitWeight = GetUnitWeight(drop.itemId);
            float dropWeight = unitWeight * drop.quantity;

            if (_currentWeight + dropWeight > _weightCap)
            {
                // Try partial — accept as many units as fit; honest to spec since the
                // intent is "fill the bag, leave the rest".
                int fits = Mathf.FloorToInt((_weightCap - _currentWeight) / unitWeight);
                if (fits <= 0)
                {
                    OnLootSkipped?.Invoke(drop, SkipReason.WeightExceeded);
                    return false;
                }
                var partial = new LootDrop { itemId = drop.itemId, quantity = fits, rarity = drop.rarity };
                AddInternal(partial, unitWeight * fits);
                var leftover = new LootDrop { itemId = drop.itemId, quantity = drop.quantity - fits, rarity = drop.rarity };
                OnLootSkipped?.Invoke(leftover, SkipReason.WeightExceeded);
                return true;
            }

            AddInternal(drop, dropWeight);
            return true;
        }

        private void AddInternal(LootDrop drop, float weight)
        {
            int prev = _contents.TryGetValue(drop.itemId, out var q) ? q : 0;
            _contents[drop.itemId] = prev + drop.quantity;
            _currentWeight += weight;

            if (!_highestRarity.TryGetValue(drop.itemId, out var r) || (int)drop.rarity > (int)r)
                _highestRarity[drop.itemId] = drop.rarity;

            OnItemLooted?.Invoke(drop);
        }

        /// <summary>Merge backpack contents into base inventory and clear.</summary>
        public void TransferToInventory()
        {
            if (_inventory == null) ServiceLocator.TryGet(out _inventory);
            if (_inventory != null)
            {
                foreach (var kv in _contents)
                {
                    var rarity = _highestRarity.TryGetValue(kv.Key, out var r) ? r : LootRarity.Common;
                    _inventory.AddDrop(new LootDrop { itemId = kv.Key, quantity = kv.Value, rarity = rarity });
                }
            }
            Clear();
        }

        public void Clear()
        {
            _contents.Clear();
            _highestRarity.Clear();
            _currentWeight = 0f;
            OnBackpackCleared?.Invoke();
        }

        // ─── Weight math ──────────────────────────────────────────────────────
        private float ComputeWeightCap(Survivor s)
        {
            // Pack Mule perk stack curve from the seeded perk catalog.
            float packMuleBonus = 0f;
            for (int i = 0; i < s.Perks.Stacks.Count; i++)
            {
                var entry = s.Perks.Stacks[i];
                if (entry.perkId == "pack_mule")
                {
                    packMuleBonus = entry.count switch { 1 => 0.15f, 2 => 0.28f, 3 => 0.45f, _ => 0f };
                    break;
                }
            }
            float strengthMod = 1f + (s.Stats.Strength / ZedIdler.Services.BalanceRuntime.StrengthCapDivisor);
            return baseWeightCap * (1f + packMuleBonus) * strengthMod;
        }

        private float GetUnitWeight(string itemId)
        {
            return _weightLookup.TryGetValue(itemId, out var w) ? w : DefaultItemWeight;
        }

        // ─── Snapshot (for rescue missions and save/load) ─────────────────────
        public BackpackSnapshot CreateSnapshot()
        {
            var stacks = new List<BackpackStack>(_contents.Count);
            foreach (var kv in _contents)
            {
                stacks.Add(new BackpackStack
                {
                    itemId = kv.Key,
                    quantity = kv.Value,
                    rarity = _highestRarity.TryGetValue(kv.Key, out var r) ? r : LootRarity.Common
                });
            }
            return new BackpackSnapshot
            {
                weightCap = _weightCap,
                currentWeight = _currentWeight,
                stacks = stacks.ToArray()
            };
        }

        public void Restore(BackpackSnapshot snap)
        {
            _contents.Clear();
            _highestRarity.Clear();
            _currentWeight = snap.currentWeight;
            _weightCap = snap.weightCap > 0 ? snap.weightCap : baseWeightCap;
            if (snap.stacks != null)
            {
                for (int i = 0; i < snap.stacks.Length; i++)
                {
                    var s = snap.stacks[i];
                    _contents[s.itemId] = s.quantity;
                    _highestRarity[s.itemId] = s.rarity;
                }
            }
        }

        [Serializable]
        public struct ItemWeightEntry { public string itemId; public float kgPerUnit; }
    }

    public interface IBackpackService
    {
        float WeightCap { get; }
        float CurrentWeight { get; }
        float Headroom { get; }
        bool IsActive { get; }
        IReadOnlyDictionary<string, int> Contents { get; }

        event Action<LootDrop> OnItemLooted;
        event Action<LootDrop, SkipReason> OnLootSkipped;
        event Action OnBackpackCleared;
        event Action OnRunStarted;
        event Action OnRunEnded;

        void StartRun(Survivor survivor);
        void StartRunWithSquad(IList<Survivor> squad);
        void EndRun(bool transferToInventory);
        bool TryAddDrop(LootDrop drop);
        void TransferToInventory();
        void Clear();
        BackpackSnapshot CreateSnapshot();
        void Restore(BackpackSnapshot snap);
    }

    public enum SkipReason
    {
        WeightExceeded   = 0,
        AutoLootDisabled = 1,
        NoActiveRun      = 2
    }

    [Serializable]
    public struct BackpackStack
    {
        public string itemId;
        public int quantity;
        public LootRarity rarity;
    }

    [Serializable]
    public struct BackpackSnapshot
    {
        public float weightCap;
        public float currentWeight;
        public BackpackStack[] stacks;
    }
}
