// Assets/Editor/MarketplaceSeeder.cs
#if UNITY_EDITOR
using UnityEditor;
using UnityEngine;
using ZedIdler.Data;

namespace ZedIdler.Editor
{
    /// <summary>
    /// Seeds 6 starter <see cref="MarketEvent"/> assets covering the major
    /// market dynamics (RMAT Storm, Food Shortage, Fuel Crisis, Medical Boom,
    /// Weapon Surge, Material Glut). Idempotent.
    /// </summary>
    /// <remarks>
    /// Initial listings are NOT seeded here — <see cref="ZedIdler.Services.MarketplaceService"/>
    /// auto-spawns NPC listings against the live ItemDefinition catalog on Awake.
    /// </remarks>
    public static class MarketplaceSeeder
    {
        private const string FOLDER = "Assets/Data/MarketEvents";

        private static readonly EventSeed[] Seeds =
        {
            new EventSeed("rmat_storm",     "RMAT Storm",
                "Anomalous flux spikes RMAT demand across all factions.",
                new[] {"rmat", "special"}, 1.40f, 1.50f, 6f),

            new EventSeed("food_shortage",  "Food Shortage",
                "Crops failed in three sectors. Food doubles in price.",
                new[] {"food"}, 1.60f, 0.60f, 8f),

            new EventSeed("fuel_crisis",    "Fuel Crisis",
                "Refineries offline. Fuel reserves dwindle.",
                new[] {"fuel"}, 1.50f, 0.70f, 12f),

            new EventSeed("medical_boom",   "Medical Boom",
                "Outbreak nearby. Bandages, antibiotics, painkillers premium.",
                new[] {"medical"}, 1.30f, 1.20f, 5f),

            new EventSeed("weapon_surge",   "Weapon Surge",
                "Gang pressure raises demand for firearms and melee gear.",
                new[] {"weapon"}, 1.25f, 1.30f, 4f),

            new EventSeed("material_glut",  "Material Glut",
                "Scrappers flood the market. Raw materials trade cheap.",
                new[] {"material"}, 0.70f, 1.50f, 3f),
        };

        [MenuItem("ZedIdler/Seed Market Events")]
        public static void SeedAll()
        {
            EnsureFolder(FOLDER);
            int created = 0;
            foreach (var s in Seeds)
            {
                string path = $"{FOLDER}/ME_{s.id}.asset";
                if (AssetDatabase.LoadAssetAtPath<MarketEvent>(path) != null) continue;
                var asset = ScriptableObject.CreateInstance<MarketEvent>();
                var so = new SerializedObject(asset);
                so.FindProperty("eventId").stringValue          = s.id;
                so.FindProperty("displayName").stringValue      = s.name;
                so.FindProperty("description").stringValue      = s.desc;
                so.FindProperty("priceMultiplier").floatValue   = s.priceMult;
                so.FindProperty("supplyMultiplier").floatValue  = s.supplyMult;
                so.FindProperty("durationHours").floatValue     = s.durationHours;
                so.FindProperty("autoTriggerIntervalHours").floatValue = 24f;
                var tags = so.FindProperty("affectedTags");
                tags.arraySize = s.tags.Length;
                for (int i = 0; i < s.tags.Length; i++) tags.GetArrayElementAtIndex(i).stringValue = s.tags[i];
                so.ApplyModifiedPropertiesWithoutUndo();
                AssetDatabase.CreateAsset(asset, path);
                created++;
            }
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log($"[MarketplaceSeeder] Created {created} new market events ({Seeds.Length} total).");
        }

        [MenuItem("ZedIdler/Seed All Catalogs")]
        public static void SeedEverything()
        {
            CatalogSeeder.SeedAll();
            ZombieSeeder.SeedAll();
            RecyclerSeeder.SeedAll();
            ItemSeeder.SeedAll();
            SeedAll();
            Debug.Log("[ZedIdler] Full catalog seed complete.");
        }

        private static void EnsureFolder(string path)
        {
            if (AssetDatabase.IsValidFolder(path)) return;
            string parent = System.IO.Path.GetDirectoryName(path).Replace('\\', '/');
            string leaf   = System.IO.Path.GetFileName(path);
            if (!AssetDatabase.IsValidFolder(parent)) EnsureFolder(parent);
            AssetDatabase.CreateFolder(parent, leaf);
        }

        private struct EventSeed
        {
            public string id, name, desc;
            public string[] tags;
            public float priceMult, supplyMult, durationHours;
            public EventSeed(string id, string name, string desc, string[] tags,
                float price, float supply, float hours)
            { this.id=id; this.name=name; this.desc=desc; this.tags=tags;
              priceMult=price; supplyMult=supply; durationHours=hours; }
        }
    }
}
#endif
