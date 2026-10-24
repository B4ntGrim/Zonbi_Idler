// Assets/Editor/RecyclerSeeder.cs
#if UNITY_EDITOR
using System.Collections.Generic;
using UnityEditor;
using UnityEngine;
using ZedIdler.Data;

namespace ZedIdler.Editor
{
    /// <summary>
    /// One-shot editor utility that seeds the recycler recipe catalog.
    /// Run via menu: <c>ZedIdler → Seed Recycler Recipes</c>.
    /// Creates 12 starter recipes spanning all 5 material families plus a few
    /// higher-tier conversions. Idempotent.
    /// </summary>
    public static class RecyclerSeeder
    {
        private const string RECIPE_FOLDER = "Assets/Data/RecyclerRecipes";

        // (id, name, tier, requiredCampLevel, processSeconds, inputs, outputs)
        private static readonly RecipeSeed[] Seeds =
        {
            // Tier 0 — basic conversions
            new RecipeSeed("rr_metal_to_ingot",   "Steel Ingot",         0, 15, 10f,
                new[] { ("metal_scraps", 3) }, new[] { ("steel_ingot", 1, LootRarity.Common) }),
            new RecipeSeed("rr_copper_to_wire",   "Copper Wire",         0, 15,  8f,
                new[] { ("copper_wiring", 2) }, new[] { ("copper_wire", 1, LootRarity.Common) }),
            new RecipeSeed("rr_wood_to_block",    "Wood Block",          0, 15,  5f,
                new[] { ("wood_planks", 2) }, new[] { ("wood_block", 1, LootRarity.Common) }),
            new RecipeSeed("rr_cloth_to_thread",  "Thread Bundle",       0, 15,  6f,
                new[] { ("cloth_scraps", 4) }, new[] { ("thread_bundle", 1, LootRarity.Common) }),
            new RecipeSeed("rr_ewaste_to_part",   "Spare Part",          0, 15, 15f,
                new[] { ("electronic_waste", 2) }, new[] { ("spare_part", 1, LootRarity.Uncommon) }),

            // Tier 1 — refined products
            new RecipeSeed("rr_ingot_to_steel",   "Hardened Steel",      1, 20, 20f,
                new[] { ("steel_ingot", 2) }, new[] { ("hardened_steel", 1, LootRarity.Uncommon) }),
            new RecipeSeed("rr_wire_to_circuit",  "Circuit Board",       1, 22, 18f,
                new[] { ("copper_wire", 2), ("spare_part", 1) },
                new[] { ("circuit_board", 1, LootRarity.Uncommon) }),
            new RecipeSeed("rr_block_to_plank",   "Plank",               1, 18,  8f,
                new[] { ("wood_block", 2) }, new[] { ("plank", 1, LootRarity.Common) }),
            new RecipeSeed("rr_thread_to_fabric", "Fabric Roll",         1, 20, 10f,
                new[] { ("thread_bundle", 2) }, new[] { ("fabric_roll", 1, LootRarity.Common) }),

            // Tier 2 — mechanisms & combo recipes
            new RecipeSeed("rr_part_to_mech",     "Mechanism",           2, 28, 25f,
                new[] { ("spare_part", 3), ("copper_wire", 1) },
                new[] { ("mechanism", 1, LootRarity.Uncommon) }),
            new RecipeSeed("rr_bandage_advanced", "Advanced Bandage",    2, 25, 12f,
                new[] { ("bandage", 3), ("cloth_scraps", 1) },
                new[] { ("advanced_bandage", 1, LootRarity.Uncommon) }),
            new RecipeSeed("rr_fuel_refined",     "Refined Fuel",        2, 30, 15f,
                new[] { ("fuel_sludge", 8) }, new[] { ("refined_fuel", 1, LootRarity.Uncommon) }),
        };

        [MenuItem("ZedIdler/Seed Recycler Recipes")]
        public static void SeedAll()
        {
            EnsureFolder(RECIPE_FOLDER);
            int created = 0;

            foreach (var s in Seeds)
            {
                string path = $"{RECIPE_FOLDER}/{s.id}.asset";
                if (AssetDatabase.LoadAssetAtPath<RecyclerRecipe>(path) != null) continue;

                var r = ScriptableObject.CreateInstance<RecyclerRecipe>();
                var so = new SerializedObject(r);
                so.FindProperty("recipeId").stringValue          = s.id;
                so.FindProperty("displayName").stringValue       = s.displayName;
                so.FindProperty("description").stringValue       = $"Recycle into {s.displayName.ToLowerInvariant()}.";
                so.FindProperty("processSeconds").floatValue     = s.processSeconds;
                so.FindProperty("requiredCampLevel").intValue    = s.requiredCampLevel;
                so.FindProperty("tier").intValue                 = s.tier;

                var inputs = so.FindProperty("inputs");
                inputs.arraySize = s.inputs.Length;
                for (int i = 0; i < s.inputs.Length; i++)
                {
                    var e = inputs.GetArrayElementAtIndex(i);
                    e.FindPropertyRelative("itemId").stringValue = s.inputs[i].id;
                    e.FindPropertyRelative("quantity").intValue  = s.inputs[i].qty;
                    e.FindPropertyRelative("outputRarity").enumValueIndex = (int)LootRarity.Common;
                }

                var outputs = so.FindProperty("outputs");
                outputs.arraySize = s.outputs.Length;
                for (int i = 0; i < s.outputs.Length; i++)
                {
                    var e = outputs.GetArrayElementAtIndex(i);
                    e.FindPropertyRelative("itemId").stringValue = s.outputs[i].id;
                    e.FindPropertyRelative("quantity").intValue  = s.outputs[i].qty;
                    e.FindPropertyRelative("outputRarity").enumValueIndex = (int)s.outputs[i].rarity;
                }

                so.ApplyModifiedPropertiesWithoutUndo();
                AssetDatabase.CreateAsset(r, path);
                created++;
            }

            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log($"[RecyclerSeeder] Created {created} new recipes ({Seeds.Length} total in catalog).");
        }

        private static void EnsureFolder(string path)
        {
            if (AssetDatabase.IsValidFolder(path)) return;
            string parent = System.IO.Path.GetDirectoryName(path).Replace('\\', '/');
            string leaf   = System.IO.Path.GetFileName(path);
            if (!AssetDatabase.IsValidFolder(parent)) EnsureFolder(parent);
            AssetDatabase.CreateFolder(parent, leaf);
        }

        private struct RecipeSeed
        {
            public string id, displayName;
            public int tier, requiredCampLevel;
            public float processSeconds;
            public (string id, int qty)[] inputs;
            public (string id, int qty, LootRarity rarity)[] outputs;

            public RecipeSeed(string id, string name, int tier, int campLvl, float secs,
                (string, int)[] inputs, (string, int, LootRarity)[] outputs)
            {
                this.id = id; this.displayName = name;
                this.tier = tier; this.requiredCampLevel = campLvl;
                this.processSeconds = secs;
                this.inputs = inputs; this.outputs = outputs;
            }
        }
    }
}
#endif
