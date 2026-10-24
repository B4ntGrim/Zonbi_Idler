// Assets/Editor/FactionSeeder.cs
#if UNITY_EDITOR
using UnityEditor;
using UnityEngine;
using ZedIdler.Data;

namespace ZedIdler.Editor
{
    /// <summary>
    /// Seeds the 6 canonical factions from the HTML prototype with full
    /// rank-by-rank service ladders and static rivalry web. Idempotent.
    /// </summary>
    public static class FactionSeeder
    {
        private const string FOLDER = "Assets/Data/Factions";

        private static readonly FactionSeed[] Seeds =
        {
            new FactionSeed(
                id: "concordance", name: "The Concordance",
                color: new Color(0.66f, 0.33f, 0.97f),
                desc: "RMAT researchers chasing the science behind the outbreak. They pay well for anomalies.",
                synergies: new[] { CharacterType.Scholar, CharacterType.Chemist },
                rivals: new[] { "iron_march", "black_haven" },
                services: new[] {
                    "Free water at outposts",            // Stranger
                    "Lab access (basic scans)",          // Neutral
                    "RMAT trade rates +5%",              // Known
                    "Anomaly contracts unlocked",        // Allied
                    "Exclusive recipe: Anomaly Catalyst",// Trusted
                    "Hazmat suit -25% market price",     // Honored
                    "Concordance escort to apex zones"   // Venerated
                }),

            new FactionSeed(
                id: "iron_march", name: "The Iron March",
                color: new Color(0.55f, 0.23f, 0.16f),
                desc: "Militaristic order maintaining checkpoints. They reward loyal soldiers.",
                synergies: new[] { CharacterType.Soldier, CharacterType.Guard, CharacterType.Sharpshooter },
                rivals: new[] { "dustwalkers", "black_haven" },
                services: new[] {
                    "Safe passage past checkpoints",
                    "Ammo trade unlocked",
                    "Weapons -5% market price",
                    "Squad escort contracts",
                    "Exclusive recipe: Reinforced Plate",
                    "Heavy weapon access",
                    "Iron March armored support"
                }),

            new FactionSeed(
                id: "dustwalkers", name: "The Dustwalkers",
                color: new Color(0.79f, 0.66f, 0.43f),
                desc: "Wandering scavengers who know every backroad. They share scrap routes with friends.",
                synergies: new[] { CharacterType.Scavenger, CharacterType.Drifter, CharacterType.Trapper },
                rivals: new[] { "iron_march" },
                services: new[] {
                    "Free overnight shelter",
                    "Map fragments unlocked",
                    "Material trade +10% yield",
                    "Hidden cache contracts",
                    "Exclusive recipe: Compact Backpack",
                    "Scavenger's Luck +5%",
                    "Caravan resupply on demand"
                }),

            new FactionSeed(
                id: "hearthguard", name: "The Hearthguard",
                color: new Color(0.49f, 0.69f, 0.51f),
                desc: "Defenders of refugee camps and survivor families. They value humanity above all.",
                synergies: new[] { CharacterType.Medic, CharacterType.MedicVeteran, CharacterType.Preacher },
                rivals: new System.String[0], // Hearthguard alone has no rivals
                services: new[] {
                    "Free medical aid",
                    "Healing supplies trade",
                    "Camp defense contracts",
                    "Survivor recruitment unlocked",
                    "Exclusive recipe: Field Surgery Kit",
                    "Rescue mission +50% time window",
                    "Hearthguard medical evac available"
                }),

            new FactionSeed(
                id: "black_haven", name: "Black Haven Collective",
                color: new Color(0.30f, 0.18f, 0.30f),
                desc: "Underground brokers running the black market. Their goods are good. Their methods aren't.",
                synergies: new[] { CharacterType.Smuggler, CharacterType.Shadow, CharacterType.Hacker },
                rivals: new[] { "concordance", "iron_march" },
                services: new[] {
                    "Black market browse access",
                    "Stolen goods cheap rates",
                    "Smuggler contracts unlocked",
                    "Rare item access (T2+)",
                    "Exclusive recipe: Phantom Cloak",
                    "Counter-surveillance services",
                    "Black Haven private auction house"
                }),

            new FactionSeed(
                id: "lodge", name: "The Lodge",
                color: new Color(0.86f, 0.71f, 0.34f),
                desc: "Neutral wilderness lodge. Hunters and trappers. Trades skills, not sides.",
                synergies: new[] { CharacterType.Hunter, CharacterType.Survivalist, CharacterType.Trapper },
                rivals: new System.String[0], // Lodge stays neutral
                services: new[] {
                    "Free firepit rest",
                    "Tracking lessons (+Survival XP)",
                    "Hunting trap blueprints",
                    "Wild game trade",
                    "Exclusive recipe: Master Bow",
                    "Hunter's Path mission line",
                    "Lodge sanctuary access (always safe)"
                }),
        };

        [MenuItem("ZedIdler/Seed Factions")]
        public static void SeedAll()
        {
            EnsureFolder(FOLDER);
            int created = 0;
            foreach (var s in Seeds)
            {
                string path = $"{FOLDER}/Faction_{s.id}.asset";
                if (AssetDatabase.LoadAssetAtPath<Faction>(path) != null) continue;
                var asset = ScriptableObject.CreateInstance<Faction>();
                var so = new SerializedObject(asset);
                so.FindProperty("factionId").stringValue       = s.id;
                so.FindProperty("displayName").stringValue     = s.name;
                so.FindProperty("description").stringValue     = s.desc;
                so.FindProperty("color").colorValue            = s.color;
                so.FindProperty("baseReputation").intValue     = 0;

                var syn = so.FindProperty("synergyTypes");
                syn.arraySize = s.synergies.Length;
                for (int i = 0; i < s.synergies.Length; i++)
                    syn.GetArrayElementAtIndex(i).enumValueIndex = (int)s.synergies[i];

                var riv = so.FindProperty("rivalFactionIds");
                riv.arraySize = s.rivals.Length;
                for (int i = 0; i < s.rivals.Length; i++)
                    riv.GetArrayElementAtIndex(i).stringValue = s.rivals[i];

                var svc = so.FindProperty("servicesPerRank");
                svc.arraySize = s.services.Length;
                for (int i = 0; i < s.services.Length; i++)
                    svc.GetArrayElementAtIndex(i).stringValue = s.services[i];

                so.ApplyModifiedPropertiesWithoutUndo();
                AssetDatabase.CreateAsset(asset, path);
                created++;
            }
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log($"[FactionSeeder] Created {created} new factions ({Seeds.Length} total).");
        }

        private static void EnsureFolder(string path)
        {
            if (AssetDatabase.IsValidFolder(path)) return;
            string parent = System.IO.Path.GetDirectoryName(path).Replace('\\', '/');
            string leaf   = System.IO.Path.GetFileName(path);
            if (!AssetDatabase.IsValidFolder(parent)) EnsureFolder(parent);
            AssetDatabase.CreateFolder(parent, leaf);
        }

        private struct FactionSeed
        {
            public string id, name, desc;
            public Color color;
            public CharacterType[] synergies;
            public string[] rivals;
            public string[] services;

            public FactionSeed(string id, string name, Color color, string desc,
                CharacterType[] synergies, string[] rivals, string[] services)
            { this.id=id; this.name=name; this.color=color; this.desc=desc;
              this.synergies=synergies; this.rivals=rivals; this.services=services; }
        }
    }
}
#endif
