// Assets/Editor/CatalogSeeder.cs
#if UNITY_EDITOR
using System.Collections.Generic;
using System.IO;
using UnityEditor;
using UnityEngine;
using ZedIdler.Data;

namespace ZedIdler.Editor
{
    /// <summary>
    /// One-shot editor utility that seeds the ScriptableObject catalogs:
    /// • 30 <see cref="CharacterTypeDefinition"/> assets (from CSV)
    /// • 15 starter <see cref="Perk"/> assets (hardcoded data)
    ///
    /// Run via menu: <c>ZedIdler → Seed Catalogs</c>.
    /// Skips assets that already exist so you can re-run safely.
    /// </summary>
    /// <remarks>
    /// The CSV file must live at <c>Assets/Data/survivor_starting_stats.csv</c>.
    /// Generated assets land in <c>Assets/Data/CharacterTypes/</c> and
    /// <c>Assets/Data/Perks/</c>. Both folders are auto-created.
    /// </remarks>
    public static class CatalogSeeder
    {
        private const string CSV_PATH         = "Assets/Data/survivor_starting_stats.csv";
        private const string CHAR_TYPE_FOLDER = "Assets/Data/CharacterTypes";
        private const string PERK_FOLDER      = "Assets/Data/Perks";

        [MenuItem("ZedIdler/Seed Catalogs")]
        public static void SeedAll()
        {
            EnsureFolder(CHAR_TYPE_FOLDER);
            EnsureFolder(PERK_FOLDER);

            int chars = SeedCharacterTypes();
            int perks = SeedPerks();

            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();

            Debug.Log($"[CatalogSeeder] Done. Created {chars} character types and {perks} perks.");
        }

        [MenuItem("ZedIdler/Seed Catalogs (Character Types Only)")]
        public static void SeedCharsOnly()
        {
            EnsureFolder(CHAR_TYPE_FOLDER);
            int n = SeedCharacterTypes();
            AssetDatabase.SaveAssets(); AssetDatabase.Refresh();
            Debug.Log($"[CatalogSeeder] Created {n} character types.");
        }

        [MenuItem("ZedIdler/Seed Catalogs (Perks Only)")]
        public static void SeedPerksOnly()
        {
            EnsureFolder(PERK_FOLDER);
            int n = SeedPerks();
            AssetDatabase.SaveAssets(); AssetDatabase.Refresh();
            Debug.Log($"[CatalogSeeder] Created {n} perks.");
        }

        // ─── Character Types ──────────────────────────────────────────────────
        private static int SeedCharacterTypes()
        {
            if (!File.Exists(CSV_PATH))
            {
                Debug.LogError($"[CatalogSeeder] CSV not found at {CSV_PATH}");
                return 0;
            }

            // Map of type → primary-role description (seeded from design spec).
            var roleMap = new Dictionary<CharacterType, string>
            {
                [CharacterType.Scavenger]    = "Material gathering. Bonus to loot quality and find rate.",
                [CharacterType.Fighter]      = "Melee combat. Bonus to damage and stagger.",
                [CharacterType.Medic]        = "Healing & recovery. Speeds up post-combat regen.",
                [CharacterType.Scholar]      = "XP gain & research. Faster skill progression.",
                [CharacterType.Engineer]     = "Building & repair. Reduced infrastructure costs.",
                [CharacterType.Sniper]       = "Ranged combat. Bonus to long-range accuracy & crit.",
                [CharacterType.Scout]        = "Reconnaissance & speed. Reveals zone details early.",
                [CharacterType.Chemist]      = "Crafting consumables. Bonus medicine & bombs yield.",
                [CharacterType.Mechanic]     = "Vehicle & gear repair. Halves component degradation.",
                [CharacterType.Tactician]    = "Team coordination. Aura buffs for assigned survivors.",
                [CharacterType.Hunter]       = "Tracking & food. Bonus to wildlife yield & traps.",
                [CharacterType.Smuggler]    = "Marketplace & black market. Discount on illegal goods.",
                [CharacterType.Soldier]      = "Balanced combat & defense. Versatile front-line role.",
                [CharacterType.Hacker]       = "Electronics & security bypass. Unlocks locked loot.",
                [CharacterType.Cook]         = "Food crafting & stamina buffs. Boosts meal quality.",
                [CharacterType.Preacher]     = "Morale & motivation. Camp-wide morale aura.",
                [CharacterType.Brawler]      = "Close-quarters raw damage. High strength scaling.",
                [CharacterType.Trapper]      = "Zone control & zombie slowing. Pre-fight setup.",
                [CharacterType.Drifter]      = "Traversal speed & stealth. Fast scout runs.",
                [CharacterType.Farmer]       = "Resource regeneration. Sustainable food/wood yield.",
                [CharacterType.Arsonist]     = "Fire-based area damage. Crowd control specialist.",
                [CharacterType.MedicVeteran] = "Advanced surgery & revival. Restores fallen allies.",
                [CharacterType.Demolitionist]= "Explosives & breach combat. Wall/gate destruction.",
                [CharacterType.Guard]        = "Camp defense & perimeter. Bonus to wall HP & turrets.",
                [CharacterType.Trader]       = "Marketplace negotiation. Better sell prices.",
                [CharacterType.Athlete]      = "Endurance & stamina recovery. Longer run windows.",
                [CharacterType.Survivalist]  = "All-rounder wilderness skills. Hazard immunity.",
                [CharacterType.Sharpshooter] = "Critical hit & precision ranged. High burst damage.",
                [CharacterType.Quartermaster]= "Inventory & supply management. Bonus carry weight.",
                [CharacterType.Shadow]       = "Stealth, ambush & critical initiative. Always strikes first.",
            };

            int created = 0;
            var lines = File.ReadAllLines(CSV_PATH);
            for (int i = 1; i < lines.Length; i++) // skip header
            {
                var cols = lines[i].Split(',');
                if (cols.Length < 9) continue;

                string typeName = cols[1].Trim();
                if (!System.Enum.TryParse(typeName, out CharacterType type))
                {
                    Debug.LogWarning($"[CatalogSeeder] Unknown type: {typeName}");
                    continue;
                }

                string path = $"{CHAR_TYPE_FOLDER}/CT_{type}.asset";
                if (AssetDatabase.LoadAssetAtPath<CharacterTypeDefinition>(path) != null)
                {
                    continue; // already exists — skip
                }

                var def = ScriptableObject.CreateInstance<CharacterTypeDefinition>();
                var so  = new SerializedObject(def);
                so.FindProperty("type").enumValueIndex = (int)type;
                so.FindProperty("displayName").stringValue = type.ToString();
                so.FindProperty("primaryRole").stringValue = roleMap.TryGetValue(type, out var r) ? r : "—";
                so.FindProperty("description").stringValue = roleMap.TryGetValue(type, out var rr) ? rr : "—";
                so.FindProperty("startingStrength").intValue   = int.Parse(cols[2]);
                so.FindProperty("startingAgility").intValue    = int.Parse(cols[3]);
                so.FindProperty("startingEndurance").intValue  = int.Parse(cols[4]);
                so.FindProperty("startingIntellect").intValue  = int.Parse(cols[5]);
                so.FindProperty("startingScavenging").intValue = int.Parse(cols[6]);
                so.FindProperty("startingCombat").intValue     = int.Parse(cols[7]);
                so.FindProperty("startingSurvival").intValue   = int.Parse(cols[8]);
                so.FindProperty("roleBonusMultiplier").floatValue = 0.25f;
                so.FindProperty("roleBonusDescription").stringValue = "Role bonus tunable per type.";
                so.ApplyModifiedPropertiesWithoutUndo();

                AssetDatabase.CreateAsset(def, path);
                created++;
            }
            return created;
        }

        // ─── Perks ────────────────────────────────────────────────────────────
        private static int SeedPerks()
        {
            // (perkId, displayName, category, description, effectKey, effectPerStack)
            // effectPerStack uses the stack-1 value; gameplay systems may scale non-linearly.
            var perkSeeds = new (string id, string name, PerkCategory cat, string desc, string key, float val)[]
            {
                // Combat
                ("iron_fist",       "Iron Fist",       PerkCategory.Combat,    "Increases melee damage output.",                  "melee_damage_mult",   0.10f),
                ("dead_eye",        "Dead Eye",        PerkCategory.Combat,    "Increases critical hit chance.",                  "crit_chance_add",     0.05f),
                ("first_blood",     "First Blood",     PerkCategory.Combat,    "Player always wins initiative unless enemy is elite.", "initiative_priority", 1.0f),

                // Survival
                ("iron_skin",       "Iron Skin",       PerkCategory.Survival,  "Reduces incoming damage.",                        "damage_taken_mult",  -0.08f),
                ("second_wind",     "Second Wind",     PerkCategory.Survival,  "Recover stamina faster after combat.",            "stamina_regen_mult",  0.15f),
                ("scavengers_luck", "Scavenger's Luck",PerkCategory.Survival,  "Chance to find bonus loot in any zone.",          "bonus_loot_chance",   0.10f),

                // Crafting
                ("efficient_hands", "Efficient Hands", PerkCategory.Crafting,  "Reduces material cost of crafting recipes.",      "craft_cost_mult",    -0.10f),
                ("quick_build",     "Quick Build",     PerkCategory.Crafting,  "Reduces time required to craft items.",           "craft_time_mult",    -0.15f),
                ("recycler_pro",    "Recycler Pro",    PerkCategory.Crafting,  "Increases material yield from recycling.",        "recycle_yield_mult",  0.10f),

                // Traversal
                ("light_foot",      "Light Foot",      PerkCategory.Traversal, "Increases traversal speed between zones.",        "move_speed_mult",     0.10f),
                ("ghost_step",      "Ghost Step",      PerkCategory.Traversal, "Reduces chance of zombie encounter during traversal.", "encounter_rate_mult", -0.10f),
                ("pack_mule",       "Pack Mule",       PerkCategory.Traversal, "Increases carry capacity during traversal.",      "carry_weight_mult",   0.15f),

                // Social
                ("silver_tongue",   "Silver Tongue",   PerkCategory.Social,    "Reduces marketplace buy prices.",                 "buy_price_mult",     -0.08f),
                ("morale_boost",    "Morale Boost",    PerkCategory.Social,    "Increases XP gain for all assigned survivors.",   "xp_gain_mult",        0.10f),
                ("networked",       "Networked",       PerkCategory.Social,    "Unlocks rare items in marketplace more frequently.", "rare_item_rate_mult", 0.10f),
            };

            int created = 0;
            foreach (var seed in perkSeeds)
            {
                string path = $"{PERK_FOLDER}/Perk_{seed.id}.asset";
                if (AssetDatabase.LoadAssetAtPath<Perk>(path) != null) continue;

                var p  = ScriptableObject.CreateInstance<Perk>();
                var so = new SerializedObject(p);
                so.FindProperty("perkId").stringValue       = seed.id;
                so.FindProperty("displayName").stringValue  = seed.name;
                so.FindProperty("description").stringValue  = seed.desc;
                so.FindProperty("category").enumValueIndex  = (int)seed.cat;
                so.FindProperty("maxStacks").intValue       = 3;
                so.FindProperty("effectPerStack").floatValue= seed.val;
                so.FindProperty("effectKey").stringValue    = seed.key;
                so.ApplyModifiedPropertiesWithoutUndo();

                AssetDatabase.CreateAsset(p, path);
                created++;
            }
            return created;
        }

        // ─── Helpers ──────────────────────────────────────────────────────────
        private static void EnsureFolder(string path)
        {
            if (AssetDatabase.IsValidFolder(path)) return;
            string parent = Path.GetDirectoryName(path).Replace('\\', '/');
            string leaf   = Path.GetFileName(path);
            if (!AssetDatabase.IsValidFolder(parent)) EnsureFolder(parent);
            AssetDatabase.CreateFolder(parent, leaf);
        }
    }
}
#endif
