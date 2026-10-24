// Assets/Scripts/Services/InventoryService.cs
using System;
using System.Collections.Generic;
using UnityEngine;
using ZedIdler.Data;

namespace ZedIdler.Services
{
    /// <summary>
    /// Concrete inventory implementation. Closes the loot loop between Wandering,
    /// Recycler, Marketplace, and the executable consume commands (eat / drink /
    /// use_bandage). Persistent MonoBehaviour — lives on the Bootstrap GameObject.
    /// </summary>
    /// <remarks>
    /// Storage model: a flat dictionary of <c>itemId → ItemStack</c>. Stacks track
    /// quantity plus the highest rarity ever seen for that itemId (useful for the
    /// Marketplace's rarity-based listings). All mutations clamp to <see cref="MaxStack"/>
    /// and fire change events so UI/services react automatically.
    ///
    /// Future hooks:
    /// • <see cref="weightCap"/> + per-item weight (when ItemDefinition ScriptableObjects land).
    /// • Recycler will subscribe to <see cref="OnLootAdded"/> for auto-recycle rules.
    /// • Marketplace will read stack quantities for listing eligibility.
    /// </remarks>
    [DisallowMultipleComponent]
    public sealed class InventoryService : MonoBehaviour, IInventoryService
    {
        public const int MaxStack = 9999;

        [Header("Capacity")]
        [Tooltip("Max total weight (placeholder until per-item weights land).")]
        [SerializeField, Range(50f, 10000f)] private float weightCap = 500f;

        [Header("Starting Items (designer-authored test seed)")]
        [SerializeField] private List<StartingEntry> startingItems = new List<StartingEntry>();

        private readonly Dictionary<string, ItemStack> _stacks = new Dictionary<string, ItemStack>();

        public float WeightCap => weightCap;
        public IReadOnlyDictionary<string, ItemStack> Stacks => _stacks;

        // ─── Events ───────────────────────────────────────────────────────────
        public event Action<LootDrop> OnLootAdded;
        public event Action<string, int> OnItemConsumed;          // (itemId, quantityConsumed)
        public event Action<string, int> OnQuantityChanged;       // (itemId, newQuantity)
        public event Action OnInventoryCleared;

        // ─── Lifecycle ────────────────────────────────────────────────────────
        private void Awake()
        {
            DontDestroyOnLoad(gameObject);
            for (int i = 0; i < startingItems.Count; i++)
            {
                var s = startingItems[i];
                if (!string.IsNullOrEmpty(s.itemId) && s.quantity > 0)
                {
                    AddInternal(s.itemId, s.quantity, s.rarity);
                }
            }
            ServiceLocator.Register<IInventoryService>(this);
        }

        private void OnDestroy() => ServiceLocator.Unregister<IInventoryService>();

        // ─── IInventoryService ────────────────────────────────────────────────
        public int GetQuantity(string itemId)
        {
            if (string.IsNullOrEmpty(itemId)) return 0;
            return _stacks.TryGetValue(itemId, out var s) ? s.quantity : 0;
        }

        public bool HasItem(string itemId) => GetQuantity(itemId) > 0;

        public void AddDrop(LootDrop drop)
        {
            if (!drop.IsValid) return;
            AddInternal(drop.itemId, drop.quantity, drop.rarity);
            OnLootAdded?.Invoke(drop);
        }

        /// <summary>Direct add (non-loot path, e.g. trade/quest reward).</summary>
        public void Add(string itemId, int quantity, LootRarity rarity = LootRarity.Common)
        {
            if (string.IsNullOrEmpty(itemId) || quantity <= 0) return;
            AddInternal(itemId, quantity, rarity);
            // Synthesize a LootDrop for OnLootAdded subscribers (recycler, etc.).
            OnLootAdded?.Invoke(new LootDrop { itemId = itemId, quantity = quantity, rarity = rarity });
        }

        public bool Consume(string itemId, int quantity = 1)
        {
            if (string.IsNullOrEmpty(itemId) || quantity <= 0) return false;
            if (!_stacks.TryGetValue(itemId, out var s) || s.quantity < quantity) return false;
            s.quantity -= quantity;
            if (s.quantity <= 0)
            {
                _stacks.Remove(itemId);
            }
            else
            {
                _stacks[itemId] = s;
            }
            OnItemConsumed?.Invoke(itemId, quantity);
            OnQuantityChanged?.Invoke(itemId, s.quantity);
            return true;
        }

        /// <summary>Wipe inventory. Use for new-game and unit tests.</summary>
        public void Clear()
        {
            _stacks.Clear();
            OnInventoryCleared?.Invoke();
        }

        /// <summary>Snapshot every stack for save/load.</summary>
        public Snapshot CreateSnapshot()
        {
            var arr = new ItemStack[_stacks.Count];
            int i = 0;
            foreach (var kv in _stacks) arr[i++] = kv.Value;
            return new Snapshot { stacks = arr };
        }

        public void Restore(Snapshot snap)
        {
            _stacks.Clear();
            if (snap.stacks == null) return;
            for (int i = 0; i < snap.stacks.Length; i++)
            {
                var s = snap.stacks[i];
                if (string.IsNullOrEmpty(s.itemId) || s.quantity <= 0) continue;
                _stacks[s.itemId] = s;
            }
        }

        // ─── Internals ────────────────────────────────────────────────────────
        private void AddInternal(string itemId, int quantity, LootRarity rarity)
        {
            if (_stacks.TryGetValue(itemId, out var s))
            {
                s.quantity = Mathf.Min(MaxStack, s.quantity + quantity);
                if ((int)rarity > (int)s.highestRarity) s.highestRarity = rarity;
            }
            else
            {
                s = new ItemStack { itemId = itemId, quantity = Mathf.Min(MaxStack, quantity), highestRarity = rarity };
            }
            _stacks[itemId] = s;
            OnQuantityChanged?.Invoke(itemId, s.quantity);
        }

        // ─── Nested types ─────────────────────────────────────────────────────
        [Serializable]
        public struct ItemStack
        {
            public string itemId;
            public int quantity;
            public LootRarity highestRarity;
        }

        [Serializable]
        public struct StartingEntry
        {
            public string itemId;
            public int quantity;
            public LootRarity rarity;
        }

        [Serializable]
        public struct Snapshot
        {
            public ItemStack[] stacks;
        }
    }
}
