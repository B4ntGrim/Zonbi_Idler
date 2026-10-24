// Assets/Editor/ZombieSeeder.cs
#if UNITY_EDITOR
using System.Collections.Generic;
using UnityEditor;
using UnityEngine;
using ZedIdler.Data;

namespace ZedIdler.Editor
{
    /// <summary>
    /// One-shot editor utility that seeds the combat catalog:
    /// • 6 <see cref="ZombieDefinition"/> assets (one per tier, spec section 5).
    /// • 6 <see cref="LootTable"/> assets (one per zombie tier, spec drops).
    /// • 1 <see cref="ZombieCatalog"/> asset wiring all six entries with biome flags.
    ///
    /// Run via menu: <c>ZedIdler → Seed Zombies & Catalog</c>.
    /// Idempotent — skips assets that already exist.
    /// </summary>
    public static class ZombieSeeder
    {
        private const string ZOMBIE_FOLDER  = "Assets/Data/Zombies";
        private const string LOOT_FOLDER    = "Assets/Data/LootTables";
        private const string CATALOG_FOLDER = "Assets/Data";

        // (zombieId, displayName, tier, hpMin, hpMax, dmgMin, dmgMax, speed, armor, baseXp, biomes, weight)
        private static readonly TierSeed[] Seeds =
        {
            new TierSeed("z_standard",     "Standard Walker", ZombieTier.Standard,    20,  40,  5,  10,  4,  0,  22,
                         BiomeTag.Mountain | BiomeTag.Suburbia | BiomeTag.Metro, 50f),

            new TierSeed("z_fast",         "Sprinter",         ZombieTier.Fast,        15,  30,  8,  14, 10,  0,  28,
                         BiomeTag.Suburbia | BiomeTag.Metro,                      35f),

            new TierSeed("z_heavy",        "Heavy Brute",      ZombieTier.Heavy,       60, 100, 15,  25,  3,  4,  30,
                         BiomeTag.Suburbia | BiomeTag.Metro | BiomeTag.Perimeter, 20f),

            new TierSeed("z_infected",     "Infected Shambler",ZombieTier.Infected,    25,  45, 10,  18,  4,  0,  26,
                         BiomeTag.Suburbia | BiomeTag.Metro,                      30f),

            new TierSeed("z_elite",        "Elite Mutant",     ZombieTier.Elite,       80, 150, 20,  35,  6,  6,  60,
                         BiomeTag.Metro | BiomeTag.Perimeter,                     10f),

            new TierSeed("z_horde_leader", "Horde Leader",     ZombieTier.HordeLeader,200, 350, 30,  50,  5,  10, 150,
                         BiomeTag.Perimeter,                                       3f),
        };

        // Per-tier loot composition (from spec section 5 — Common / Uncommon / Rare buckets).
        private static readonly LootSeed[] LootSeeds =
        {
            new LootSeed("loot_standard", 1, new[] {
                ("cloth",         LootRarity.Common,   60f, 1, 2),
                ("wood",          LootRarity.Common,   50f, 1, 2),
                ("metal_scraps",  LootRarity.Uncommon, 18f, 1, 1),
            }),
            new LootSeed("loot_fast", 1, new[] {
                ("cloth",         LootRarity.Common,   55f, 1, 2),
                ("metal_scraps",  LootRarity.Uncommon, 22f, 1, 1),
                ("electronics",   LootRarity.Uncommon, 14f, 1, 1),
            }),
            new LootSeed("loot_heavy", 2, new[] {
                ("metal_scraps",  LootRarity.Common,   55f, 1, 3),
                ("wood",          LootRarity.Common,   35f, 1, 2),
                ("armor_piece",   LootRarity.Uncommon, 20f, 1, 1),
                ("weapon_part",   LootRarity.Rare,      5f, 1, 1),
            }),
            new LootSeed("loot_infected", 1, new[] {
                ("cloth",         LootRarity.Common,   50f, 1, 2),
                ("medical",       LootRarity.Common,   40f, 1, 2),
                ("consumable",    LootRarity.Uncommon, 18f, 1, 1),
            }),
            new LootSeed("loot_elite", 2, new[] {
                ("metal_scraps",  LootRarity.Common,   40f, 1, 3),
                ("electronics",   LootRarity.Common,   35f, 1, 2),
                ("weapon",        LootRarity.Uncommon, 20f, 1, 1),
                ("rare_gear",     LootRarity.Rare,      8f, 1, 1),
            }),
            new LootSeed("loot_horde_leader", 3, new[] {
                ("metal_scraps",      LootRarity.Common,   35f, 2, 4),
                ("electronics",       LootRarity.Common,   30f, 2, 4),
                ("medical",           LootRarity.Common,   25f, 1, 3),
                ("rare_gear",         LootRarity.Rare,     14f, 1, 1),
                ("blueprint_fragment",LootRarity.Rare,     12f, 1, 1),
            }),
        };

        [MenuItem("ZedIdler/Seed Zombies & Catalog")]
        public static void SeedAll()
        {
            EnsureFolder(ZOMBIE_FOLDER);
            EnsureFolder(LOOT_FOLDER);
            EnsureFolder(CATALOG_FOLDER);

            // 1. Loot tables first — zombies will reference them.
            var lootByKey = new Dictionary<string, LootTable>();
            int lootCreated = 0;
            for (int i = 0; i < LootSeeds.Length; i++)
            {
                var ls = LootSeeds[i];
                string path = $"{LOOT_FOLDER}/{ls.assetName}.asset";
                var existing = AssetDatabase.LoadAssetAtPath<LootTable>(path);
                if (existing != null) { lootByKey[ls.assetName] = existing; continue; }

                var lt = ScriptableObject.CreateInstance<LootTable>();
                var so = new SerializedObject(lt);
                so.FindProperty("dropsPerRoll").intValue = ls.dropsPerRoll;

                var arr = so.FindProperty("entries");
                arr.arraySize = ls.entries.Length;
                for (int j = 0; j < ls.entries.Length; j++)
                {
                    var e = arr.GetArrayElementAtIndex(j);
                    e.FindPropertyRelative("itemId").stringValue       = ls.entries[j].itemId;
                    e.FindPropertyRelative("rarity").enumValueIndex    = (int)ls.entries[j].rarity;
                    e.FindPropertyRelative("weight").floatValue        = ls.entries[j].weight;
                    e.FindPropertyRelative("minQuantity").intValue     = ls.entries[j].minQty;
                    e.FindPropertyRelative("maxQuantity").intValue     = ls.entries[j].maxQty;
                }
                so.ApplyModifiedPropertiesWithoutUndo();
                AssetDatabase.CreateAsset(lt, path);
                lootByKey[ls.assetName] = lt;
                lootCreated++;
            }

            // 2. Zombies — each references its matching loot table.
            var zombiesByTier = new Dictionary<ZombieTier, ZombieDefinition>();
            int zombiesCreated = 0;
            for (int i = 0; i < Seeds.Length; i++)
            {
                var s = Seeds[i];
                string path = $"{ZOMBIE_FOLDER}/Z_{s.tier}.asset";
                var existing = AssetDatabase.LoadAssetAtPath<ZombieDefinition>(path);
                if (existing != null) { zombiesByTier[s.tier] = existing; continue; }

                var z = ScriptableObject.CreateInstance<ZombieDefinition>();
                var so = new SerializedObject(z);
                so.FindProperty("zombieId").stringValue        = s.zombieId;
                so.FindProperty("displayName").stringValue     = s.displayName;
                so.FindProperty("tier").enumValueIndex         = (int)s.tier;
                so.FindProperty("hpMin").intValue              = s.hpMin;
                so.FindProperty("hpMax").intValue              = s.hpMax;
                so.FindProperty("damageMin").intValue          = s.dmgMin;
                so.FindProperty("damageMax").intValue          = s.dmgMax;
                so.FindProperty("speed").intValue              = s.speed;
                so.FindProperty("armor").intValue              = s.armor;
                so.FindProperty("initiativeBonus").intValue    = 0;
                so.FindProperty("baseXp").intValue             = s.baseXp;
                so.FindProperty("timeOfDayPreference").intValue= (int)TimeOfDay.Any;
                so.FindProperty("minPlayerLevel").intValue     = s.tier == ZombieTier.Elite ? 25
                                                                : s.tier == ZombieTier.HordeLeader ? 50 : 1;

                string lootKey = "loot_" + s.tier.ToString().ToLowerInvariant().Replace("hordeleader", "horde_leader");
                if (lootByKey.TryGetValue(lootKey, out var lt))
                {
                    so.FindProperty("lootTable").objectReferenceValue = lt;
                }
                so.ApplyModifiedPropertiesWithoutUndo();
                AssetDatabase.CreateAsset(z, path);
                zombiesByTier[s.tier] = z;
                zombiesCreated++;
            }

            // 3. Catalog asset — bind all six zombies with biome/weight from Seeds.
            string catalogPath = $"{CATALOG_FOLDER}/ZombieCatalog.asset";
            var catalog = AssetDatabase.LoadAssetAtPath<ZombieCatalog>(catalogPath);
            bool catalogCreated = false;
            if (catalog == null)
            {
                catalog = ScriptableObject.CreateInstance<ZombieCatalog>();
                AssetDatabase.CreateAsset(catalog, catalogPath);
                catalogCreated = true;
            }
            var cso = new SerializedObject(catalog);
            var entriesProp = cso.FindProperty("entries");
            entriesProp.arraySize = Seeds.Length;
            for (int i = 0; i < Seeds.Length; i++)
            {
                var e = entriesProp.GetArrayElementAtIndex(i);
                e.FindPropertyRelative("zombie").objectReferenceValue = zombiesByTier[Seeds[i].tier];
                e.FindPropertyRelative("biomes").intValue             = (int)Seeds[i].biomes;
                e.FindPropertyRelative("weight").floatValue           = Seeds[i].weight;
            }
            cso.FindProperty("globalSpawnMultiplier").floatValue = 1f;
            cso.ApplyModifiedPropertiesWithoutUndo();

            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();

            Debug.Log($"[ZombieSeeder] Done. Loot {lootCreated} new / {LootSeeds.Length} total · " +
                      $"Zombies {zombiesCreated} new / {Seeds.Length} total · " +
                      $"Catalog {(catalogCreated ? "created" : "updated")} ({Seeds.Length} entries).");
        }

        // ─── Helpers ──────────────────────────────────────────────────────────
        private static void EnsureFolder(string path)
        {
            if (AssetDatabase.IsValidFolder(path)) return;
            string parent = System.IO.Path.GetDirectoryName(path).Replace('\\', '/');
            string leaf   = System.IO.Path.GetFileName(path);
            if (!AssetDatabase.IsValidFolder(parent)) EnsureFolder(parent);
            AssetDatabase.CreateFolder(parent, leaf);
        }

        private struct TierSeed
        {
            public string zombieId, displayName;
            public ZombieTier tier;
            public int hpMin, hpMax, dmgMin, dmgMax, speed, armor, baseXp;
            public BiomeTag biomes;
            public float weight;
            public TierSeed(string id, string name, ZombieTier tier,
                int hpMin, int hpMax, int dmgMin, int dmgMax, int speed, int armor, int baseXp,
                BiomeTag biomes, float weight)
            {
                zombieId=id; displayName=name; this.tier=tier;
                this.hpMin=hpMin; this.hpMax=hpMax; this.dmgMin=dmgMin; this.dmgMax=dmgMax;
                this.speed=speed; this.armor=armor; this.baseXp=baseXp;
                this.biomes=biomes; this.weight=weight;
            }
        }

        private struct LootSeed
        {
            public string assetName;
            public int dropsPerRoll;
            public (string itemId, LootRarity rarity, float weight, int minQty, int maxQty)[] entries;
            public LootSeed(string name, int drops, (string,LootRarity,float,int,int)[] e)
            { assetName=name; dropsPerRoll=drops; entries=e; }
        }
    }
}
#endif
