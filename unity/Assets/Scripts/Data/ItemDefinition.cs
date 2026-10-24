// Assets/Scripts/Data/ItemDefinition.cs
using UnityEngine;

namespace ZedIdler.Data
{
    /// <summary>
    /// Static data for every tradable / craftable / lootable item in the game.
    /// Authored as a <see cref="ScriptableObject"/> so designers can add items
    /// without code changes.
    /// </summary>
    /// <remarks>
    /// Create via: Right-click in Project → Create → ZedIdler → Item Definition.
    /// Asset name convention: <c>Item_SteelIngot</c>, <c>Item_Bandage</c>, etc.
    ///
    /// One item = one stable <see cref="itemId"/> string. Inventory, recycler,
    /// marketplace, and loot tables all reference items by this id.
    /// </remarks>
    [CreateAssetMenu(menuName = "ZedIdler/Item Definition", fileName = "Item_New", order = 70)]
    public sealed class ItemDefinition : ScriptableObject
    {
        [Header("Identity")]
        [SerializeField] private string itemId;
        [SerializeField] private string displayName;
        [SerializeField, TextArea(1, 4)] private string description;
        [SerializeField] private Sprite icon;

        [Header("Classification")]
        [SerializeField] private ItemCategory category = ItemCategory.Material;
        [SerializeField] private LootRarity baseRarity = LootRarity.Common;
        [SerializeField, Range(0, 5)] private int tier = 0;

        [Header("Economy")]
        [SerializeField, Range(0, 100000)] private int basePrice = 10;
        [SerializeField, Range(0.01f, 100f)] private float weightKg = 0.5f;
        [SerializeField] private bool tradable = true;
        [SerializeField] private bool recyclable = false;

        [Header("Tags (drive market events & faction filters)")]
        [Tooltip("E.g. 'rmat', 'food', 'medical', 'fuel', 'weapon'. Used by MarketEvent matching.")]
        [SerializeField] private string[] tags;

        // ─── Accessors ────────────────────────────────────────────────────────
        public string       ItemId      => itemId;
        public string       DisplayName => displayName;
        public string       Description => description;
        public Sprite       Icon        => icon;
        public ItemCategory Category    => category;
        public LootRarity   BaseRarity  => baseRarity;
        public int          Tier        => tier;
        public int          BasePrice   => basePrice;
        public float        WeightKg    => weightKg;
        public bool         Tradable    => tradable;
        public bool         Recyclable  => recyclable;
        public string[]     Tags        => tags ?? System.Array.Empty<string>();

        public bool HasTag(string tag)
        {
            if (tags == null || string.IsNullOrEmpty(tag)) return false;
            for (int i = 0; i < tags.Length; i++)
                if (string.Equals(tags[i], tag, System.StringComparison.OrdinalIgnoreCase)) return true;
            return false;
        }
    }

    public enum ItemCategory
    {
        Material   = 0,
        Component  = 1,
        Consumable = 2,
        Medical    = 3,
        Food       = 4,
        Fuel       = 5,
        Weapon     = 6,
        Armor      = 7,
        Tool       = 8,
        Blueprint  = 9,
        Special    = 10
    }
}
