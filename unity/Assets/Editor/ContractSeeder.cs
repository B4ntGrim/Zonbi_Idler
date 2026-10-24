// Assets/Editor/ContractSeeder.cs
#if UNITY_EDITOR
using UnityEditor;
using UnityEngine;
using ZedIdler.Data;

namespace ZedIdler.Editor
{
    /// <summary>
    /// Seeds 14 starter contract templates spanning every type and faction.
    /// Idempotent.
    /// </summary>
    public static class ContractSeeder
    {
        private const string FOLDER = "Assets/Data/Contracts";

        private static readonly Seed[] Seeds =
        {
            // Concordance — research & RMAT
            new Seed("contract_courier_rmat",   "Deliver RMAT Sample",          ContractType.Courier,
                "concordance", 2, 0, "rmat_shard", 1, BiomeTag.Any, ZombieTier.Standard, 1, 6, 200, 60),
            new Seed("contract_survey_metro",   "Hazardous Survey: Metro",      ContractType.HazardSurvey,
                "concordance", 4, 5, null, 0, BiomeTag.Metro, ZombieTier.Standard, 3, 12, 450, 120),

            // Iron March — combat & defense
            new Seed("contract_defense_check",  "Hold Checkpoint Bravo",        ContractType.Defense,
                "iron_march", 3, 3, null, 0, BiomeTag.Suburbia, ZombieTier.Standard, 10, 4, 280, 80),
            new Seed("contract_elim_brute",     "Eliminate Heavy Brutes",       ContractType.EliteElimination,
                "iron_march", 5, 8, null, 0, BiomeTag.Metro, ZombieTier.Heavy, 4, 8, 580, 160),
            new Seed("contract_elim_horde",     "Cull Horde Leader",            ContractType.EliteElimination,
                "iron_march", 8, 30, null, 0, BiomeTag.Perimeter, ZombieTier.HordeLeader, 1, 12, 1200, 300),

            // Dustwalkers — salvage & courier
            new Seed("contract_salvage_metal",  "Salvage Run: Metal",           ContractType.Salvage,
                "dustwalkers", 2, 0, "metal_scraps", 30, BiomeTag.Suburbia, ZombieTier.Standard, 30, 8, 180, 50),
            new Seed("contract_courier_supply", "Smuggle Supplies",             ContractType.Courier,
                "dustwalkers", 3, 2, "ration", 5, BiomeTag.Mountain, ZombieTier.Standard, 5, 6, 260, 80),

            // Hearthguard — medical & rescue
            new Seed("contract_supply_medical", "Medical Supply Drop",          ContractType.ResourceDelivery,
                "hearthguard", 2, 1, "bandage", 10, BiomeTag.Any, ZombieTier.Standard, 10, 8, 250, 70),
            new Seed("contract_survey_safe",    "Reconnoiter Safe Routes",      ContractType.Reconnaissance,
                "hearthguard", 1, 0, null, 0, BiomeTag.Suburbia, ZombieTier.Standard, 2, 6, 110, 35),

            // Black Haven — rivalry & high-roller
            new Seed("contract_rivalry_iron",   "Disrupt Iron March Patrol",    ContractType.Rivalry,
                "black_haven", 4, 5, null, 0, BiomeTag.Metro, ZombieTier.Standard, 5, 6, 440, 120),
            new Seed("contract_highroller",     "High-Roller Caravan Hit",      ContractType.HighRoller,
                "black_haven", 6, 10, null, 0, BiomeTag.Mountain, ZombieTier.Standard, 1, 4, 800, 150),

            // Lodge — hunting & survival
            new Seed("contract_elim_runner",    "Track Runner Pack",            ContractType.EliteElimination,
                "lodge", 3, 2, null, 0, BiomeTag.Mountain, ZombieTier.Fast, 6, 6, 280, 90),
            new Seed("contract_survey_wild",    "Map the Wilderness",           ContractType.Reconnaissance,
                "lodge", 2, 0, null, 0, BiomeTag.Mountain, ZombieTier.Standard, 3, 8, 200, 50),
            new Seed("contract_salvage_wood",   "Lumber Run",                   ContractType.Salvage,
                "lodge", 1, 0, "wood_planks", 20, BiomeTag.Mountain, ZombieTier.Standard, 20, 6, 110, 35),
        };

        [MenuItem("ZedIdler/Seed Contracts")]
        public static void SeedAll()
        {
            EnsureFolder(FOLDER);
            int created = 0;
            foreach (var s in Seeds)
            {
                string path = $"{FOLDER}/{s.id}.asset";
                if (AssetDatabase.LoadAssetAtPath<Contract>(path) != null) continue;
                var asset = ScriptableObject.CreateInstance<Contract>();
                var so = new SerializedObject(asset);
                so.FindProperty("contractId").stringValue       = s.id;
                so.FindProperty("displayName").stringValue      = s.name;
                so.FindProperty("description").stringValue      = $"{s.name} — issued by {s.factionId}.";
                so.FindProperty("type").enumValueIndex          = (int)s.type;
                so.FindProperty("factionId").stringValue        = s.factionId ?? "";
                so.FindProperty("difficulty").intValue          = s.difficulty;
                so.FindProperty("requiredCampLevel").intValue   = s.requiredCampLevel;
                so.FindProperty("minSquadSize").intValue        = 1;
                so.FindProperty("objectiveItemId").stringValue  = s.itemId ?? "";
                so.FindProperty("objectiveQuantity").intValue   = s.itemQty;
                so.FindProperty("objectiveBiome").intValue      = (int)s.biome;
                so.FindProperty("objectiveZombieTier").enumValueIndex = (int)s.zTier;
                so.FindProperty("objectiveCount").intValue      = s.objCount;
                so.FindProperty("timeLimitHours").floatValue    = s.hours;
                so.FindProperty("baseCreditReward").intValue    = s.credits;
                so.FindProperty("baseFactionRep").intValue      = s.rep;
                so.FindProperty("difficultyRewardMultiplier").floatValue = 0.25f;
                so.FindProperty("survivorLossPermChance").floatValue        = 0.05f;
                so.FindProperty("survivorLossRecoverableChance").floatValue = 0.20f;
                so.ApplyModifiedPropertiesWithoutUndo();
                AssetDatabase.CreateAsset(asset, path);
                created++;
            }
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log($"[ContractSeeder] Created {created} new contracts ({Seeds.Length} total).");
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
            public string id, name, factionId, itemId;
            public ContractType type;
            public int difficulty, requiredCampLevel, itemQty, objCount, credits, rep;
            public BiomeTag biome;
            public ZombieTier zTier;
            public float hours;
            public Seed(string id, string name, ContractType type, string factionId, int diff, int campLvl,
                string itemId, int itemQty, BiomeTag biome, ZombieTier zTier, int objCount, float hours, int credits, int rep)
            { this.id=id; this.name=name; this.type=type; this.factionId=factionId;
              this.difficulty=diff; this.requiredCampLevel=campLvl;
              this.itemId=itemId; this.itemQty=itemQty;
              this.biome=biome; this.zTier=zTier; this.objCount=objCount; this.hours=hours;
              this.credits=credits; this.rep=rep; }
        }
    }
}
#endif
