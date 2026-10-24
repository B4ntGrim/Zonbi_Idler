// Assets/Editor/ItemSeeder.cs
#if UNITY_EDITOR
using UnityEditor;
using UnityEngine;
using ZedIdler.Data;

namespace ZedIdler.Editor
{
    /// <summary>
    /// One-shot editor utility that seeds 32 starter item definitions covering
    /// all the categories the marketplace, recycler, inventory, and loot tables
    /// reference by id. Idempotent.
    /// </summary>
    public static class ItemSeeder
    {
        private const string FOLDER = "Assets/Data/Items";

        // (id, name, category, rarity, tier, basePrice, weight, tradable, recyclable, tags)
        private static readonly Seed[] Seeds =
        {
            // Raw materials
            new Seed("metal_scraps",      "Metal Scraps",      ItemCategory.Material, LootRarity.Common,   0,   8,  1.0f, true,  true,  new[] {"material", "metal"}),
            new Seed("copper_wiring",     "Copper Wiring",     ItemCategory.Material, LootRarity.Common,   0,  10,  0.4f, true,  true,  new[] {"material", "metal"}),
            new Seed("wood_planks",       "Wood Planks",       ItemCategory.Material, LootRarity.Common,   0,   5,  1.5f, true,  true,  new[] {"material", "wood"}),
            new Seed("cloth_scraps",      "Cloth Scraps",      ItemCategory.Material, LootRarity.Common,   0,   4,  0.3f, true,  true,  new[] {"material", "cloth"}),
            new Seed("electronic_waste",  "Electronic Waste",  ItemCategory.Material, LootRarity.Uncommon, 0,  18,  0.7f, true,  true,  new[] {"material", "electronics"}),
            new Seed("fuel_sludge",       "Fuel Sludge",       ItemCategory.Material, LootRarity.Common,   0,  12,  0.9f, true,  true,  new[] {"material", "fuel"}),
            new Seed("bandage",           "Bandage",           ItemCategory.Medical,  LootRarity.Common,   0,  20,  0.1f, true,  false, new[] {"medical"}),

            // Components (recycled)
            new Seed("steel_ingot",       "Steel Ingot",       ItemCategory.Component, LootRarity.Common,   1,  35,  2.0f, true, true,  new[] {"component", "metal"}),
            new Seed("copper_wire",       "Copper Wire",       ItemCategory.Component, LootRarity.Common,   1,  28,  0.5f, true, true,  new[] {"component", "electronics"}),
            new Seed("wood_block",        "Wood Block",        ItemCategory.Component, LootRarity.Common,   1,  18,  2.5f, true, true,  new[] {"component", "wood"}),
            new Seed("thread_bundle",     "Thread Bundle",     ItemCategory.Component, LootRarity.Common,   1,  22,  0.6f, true, true,  new[] {"component", "cloth"}),
            new Seed("spare_part",        "Spare Part",        ItemCategory.Component, LootRarity.Uncommon, 1,  55,  1.0f, true, true,  new[] {"component", "electronics"}),
            new Seed("hardened_steel",    "Hardened Steel",    ItemCategory.Component, LootRarity.Uncommon, 2,  85,  2.5f, true, true,  new[] {"component", "metal"}),
            new Seed("circuit_board",     "Circuit Board",     ItemCategory.Component, LootRarity.Uncommon, 2,  120, 0.4f, true, true,  new[] {"component", "electronics"}),
            new Seed("plank",             "Plank",             ItemCategory.Component, LootRarity.Common,   1,  40,  3.0f, true, true,  new[] {"component", "wood"}),
            new Seed("fabric_roll",       "Fabric Roll",       ItemCategory.Component, LootRarity.Common,   1,  45,  1.5f, true, true,  new[] {"component", "cloth"}),
            new Seed("mechanism",         "Mechanism",         ItemCategory.Component, LootRarity.Rare,     2,  220, 1.2f, true, true,  new[] {"component"}),

            // Medical
            new Seed("advanced_bandage",  "Advanced Bandage",  ItemCategory.Medical, LootRarity.Uncommon, 2,  80,  0.2f, true, false, new[] {"medical"}),
            new Seed("painkillers",       "Painkillers",       ItemCategory.Medical, LootRarity.Common,   1,  35,  0.1f, true, false, new[] {"medical"}),
            new Seed("antibiotics",       "Antibiotics",       ItemCategory.Medical, LootRarity.Uncommon, 2,  150, 0.1f, true, false, new[] {"medical"}),

            // Food & water
            new Seed("ration",            "Ration Pack",       ItemCategory.Food,    LootRarity.Common,   1,  25,  0.4f, true, false, new[] {"food"}),
            new Seed("canned_food",       "Canned Food",       ItemCategory.Food,    LootRarity.Common,   0,  15,  0.5f, true, false, new[] {"food"}),
            new Seed("energy_bar",        "Energy Bar",        ItemCategory.Food,    LootRarity.Common,   1,  30,  0.1f, true, false, new[] {"food"}),
            new Seed("water",             "Water Bottle",      ItemCategory.Consumable, LootRarity.Common, 0, 10,  0.5f, true, false, new[] {"food", "drink"}),

            // Fuel
            new Seed("refined_fuel",      "Refined Fuel",      ItemCategory.Fuel,    LootRarity.Uncommon, 2,  140, 1.0f, true, false, new[] {"fuel"}),

            // Weapons
            new Seed("pipe_rifle",        "Pipe Rifle",        ItemCategory.Weapon,  LootRarity.Common,   1,  240, 3.5f, true, false, new[] {"weapon", "firearm"}),
            new Seed("hatchet",           "Hatchet",           ItemCategory.Weapon,  LootRarity.Common,   1,  120, 1.5f, true, false, new[] {"weapon", "melee"}),
            new Seed("hunting_rifle",     "Hunting Rifle",     ItemCategory.Weapon,  LootRarity.Uncommon, 2,  680, 4.0f, true, false, new[] {"weapon", "firearm"}),

            // Armor
            new Seed("hazmat_suit",       "Hazmat Suit",       ItemCategory.Armor,   LootRarity.Uncommon, 2,  450, 4.5f, true, false, new[] {"armor"}),
            new Seed("kevlar_vest",       "Kevlar Vest",       ItemCategory.Armor,   LootRarity.Uncommon, 2,  620, 5.0f, true, false, new[] {"armor"}),

            // Tools
            new Seed("wrench_kit",        "Wrench Kit",        ItemCategory.Tool,    LootRarity.Common,   1,  80,  2.0f, true, false, new[] {"tool"}),
            new Seed("scrap_hammer",      "Scrap Hammer",      ItemCategory.Tool,    LootRarity.Common,   0,  35,  1.5f, true, false, new[] {"tool"}),
            new Seed("cleaning_kit",      "Weapon Cleaning Kit",ItemCategory.Tool,    LootRarity.Common,   1,  55,  0.4f, true, false, new[] {"tool", "weapon_maintenance"}),

            // Blueprint / special
            new Seed("blueprint_fragment","Blueprint Fragment",ItemCategory.Blueprint, LootRarity.Rare,   3,  500, 0.1f, true, false, new[] {"blueprint"}),
            new Seed("rmat_shard",        "RMAT Shard",        ItemCategory.Special,   LootRarity.Rare,   3, 1200, 0.5f, true, false, new[] {"rmat", "special"}),

            // Tier-4/5 RMAT economy (expansion — referenced by Apex/WorldBoss loot tables)
            new Seed("rmat_core",         "RMAT Core",         ItemCategory.Special,   LootRarity.Rare,     4, 2800, 0.8f, true, false, new[] {"rmat", "special"}),
            new Seed("exotic_component",  "Exotic Component",  ItemCategory.Component, LootRarity.Epic,     4, 4500, 0.6f, true, false, new[] {"rmat", "component", "exotic"}),
            new Seed("rmat_echo",         "RMAT Echo",         ItemCategory.Special,   LootRarity.Epic,     5, 7200, 0.3f, true, false, new[] {"rmat", "special", "exotic"}),
            new Seed("exotic_blueprint",  "Exotic Blueprint",  ItemCategory.Blueprint, LootRarity.Legendary,5, 12000,0.1f, true, false, new[] {"blueprint", "exotic"}),
        };

        [MenuItem("ZedIdler/Seed Items")]
        public static void SeedAll()
        {
            EnsureFolder(FOLDER);
            int created = 0;
            foreach (var s in Seeds)
            {
                string path = $"{FOLDER}/Item_{s.id}.asset";
                if (AssetDatabase.LoadAssetAtPath<ItemDefinition>(path) != null) continue;
                var item = ScriptableObject.CreateInstance<ItemDefinition>();
                var so = new SerializedObject(item);
                so.FindProperty("itemId").stringValue        = s.id;
                so.FindProperty("displayName").stringValue   = s.name;
                so.FindProperty("description").stringValue   = $"{s.name} ({s.category}).";
                so.FindProperty("category").enumValueIndex   = (int)s.category;
                so.FindProperty("baseRarity").enumValueIndex = (int)s.rarity;
                so.FindProperty("tier").intValue             = s.tier;
                so.FindProperty("basePrice").intValue        = s.basePrice;
                so.FindProperty("weightKg").floatValue       = s.weight;
                so.FindProperty("tradable").boolValue        = s.tradable;
                so.FindProperty("recyclable").boolValue      = s.recyclable;
                var tags = so.FindProperty("tags");
                tags.arraySize = s.tags.Length;
                for (int i = 0; i < s.tags.Length; i++) tags.GetArrayElementAtIndex(i).stringValue = s.tags[i];
                so.ApplyModifiedPropertiesWithoutUndo();
                AssetDatabase.CreateAsset(item, path);
                created++;
            }
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log($"[ItemSeeder] Created {created} new items ({Seeds.Length} total in catalog).");
        }

        private static void EnsureFolder(string path)
        {
            if (AssetDatabase.IsValidFolder(path)) return;
            string parent = System.IO.Path.GetDirectoryName(path).Replace('\\', '/');
            string leaf   = System.IO.Path.GetFileName(path);
            if (!AssetDatabase.IsValidFolder(parent)) EnsureFolder(parent);
            AssetDatabase.CreateFolder(parent, leaf);
        }

        private struct Seed
        {
            public string id, name;
            public ItemCategory category;
            public LootRarity rarity;
            public int tier, basePrice;
            public float weight;
            public bool tradable, recyclable;
            public string[] tags;
            public Seed(string id, string name, ItemCategory cat, LootRarity r, int tier, int price, float weight,
                bool tradable, bool recyclable, string[] tags)
            { this.id=id; this.name=name; category=cat; rarity=r; this.tier=tier; basePrice=price; this.weight=weight;
              this.tradable=tradable; this.recyclable=recyclable; this.tags=tags; }
        }
    }
}
#endif
