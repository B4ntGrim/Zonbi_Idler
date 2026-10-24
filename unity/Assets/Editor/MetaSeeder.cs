// Assets/Editor/MetaSeeder.cs
#if UNITY_EDITOR
using UnityEditor;
using UnityEngine;
using ZedIdler.Data;

namespace ZedIdler.Editor
{
    /// <summary>
    /// Seeds prestige upgrades (20), the prestige tier ladder, and the daily
    /// reward ladder. Run via ZedIdler → Seed Meta Systems. Idempotent.
    /// </summary>
    public static class MetaSeeder
    {
        private const string PRESTIGE_FOLDER = "Assets/Data/Prestige";
        private const string DAILY_FOLDER    = "Assets/Data/Daily";

        private struct USeed
        {
            public string id, name, desc, effectKey;
            public float perLevel; public int maxLevel, baseCost; public float growth;
            public USeed(string id, string name, string desc, string key, float perLevel, int maxLevel, int baseCost, float growth)
            { this.id=id; this.name=name; this.desc=desc; effectKey=key; this.perLevel=perLevel; this.maxLevel=maxLevel; this.baseCost=baseCost; this.growth=growth; }
        }

        private static readonly USeed[] Upgrades =
        {
            new USeed("pu_xp_boost",        "Hardened Veterans",   "+10% survivor XP gain per level.",        "xp_mult",          0.10f, 10, 10,  1.4f),
            new USeed("pu_loot_boost",      "Keen Eyes",           "+8% loot quantity per level.",            "loot_mult",        0.08f, 10, 12,  1.4f),
            new USeed("pu_rmat_boost",      "Anomaly Affinity",    "+10% RMAT drop rate per level.",          "rmat_mult",        0.10f, 8,  20,  1.5f),
            new USeed("pu_craft_speed",     "Master Artisans",     "-6% craft time per level.",               "craft_speed",      0.06f, 8,  15,  1.45f),
            new USeed("pu_recycle_yield",   "Efficient Recycling", "+8% recycler yield per level.",           "recycle_mult",     0.08f, 8,  15,  1.45f),
            new USeed("pu_squad_slot",      "Larger Convoys",      "+1 squad slot per level (max +2).",       "squad_slots",      1.00f, 2,  150, 3f),
            new USeed("pu_carry_weight",    "Reinforced Packs",    "+12% backpack capacity per level.",       "carry_mult",       0.12f, 6,  18,  1.5f),
            new USeed("pu_combat_dmg",      "Battle Hardened",     "+5% combat damage per level.",            "damage_mult",      0.05f, 12, 14,  1.42f),
            new USeed("pu_crit_chance",     "Precision Training",  "+1% crit chance per level.",              "crit_add",         0.01f, 10, 16,  1.45f),
            new USeed("pu_damage_resist",   "Iron Discipline",     "-4% damage taken per level.",             "resist_mult",      0.04f, 8,  18,  1.5f),
            new USeed("pu_market_discount", "Trade Networks",      "-3% marketplace buy prices per level.",   "buy_discount",     0.03f, 8,  16,  1.45f),
            new USeed("pu_faction_rep",     "Diplomatic Corps",    "+10% faction rep gains per level.",       "rep_mult",         0.10f, 6,  20,  1.5f),
            new USeed("pu_offline_cap",     "Deep Logistics",      "+1h offline cap per level (max +6h).",    "offline_cap_hours",1.00f, 6,  25,  1.6f),
            new USeed("pu_start_credits",   "Seed Capital",        "+250 starting credits per level.",        "start_credits",    250f,  5,  22,  1.5f),
            new USeed("pu_heal_speed",      "Field Medicine",      "+10% survivor heal speed per level.",     "heal_mult",        0.10f, 6,  15,  1.45f),
            new USeed("pu_stamina",         "Conditioning",        "+8% stamina pool per level.",             "stamina_mult",     0.08f, 8,  14,  1.42f),
            new USeed("pu_weapon_dur",      "Gunsmith Guild",      "-8% weapon durability loss per level.",   "dur_loss_mult",    0.08f, 6,  16,  1.45f),
            new USeed("pu_contract_reward", "Hard Bargains",       "+10% contract credit rewards per level.", "contract_mult",    0.10f, 8,  18,  1.5f),
            new USeed("pu_zombie_xp",       "Trophy Hunters",      "+12% combat XP per level.",               "combat_xp_mult",   0.12f, 8,  16,  1.45f),
            new USeed("pu_legacy_gain",     "Echoes of Legacy",    "+5% Legacy Point gain on prestige per level.", "legacy_mult",  0.05f, 10, 25,  1.4f),
        };

        private static readonly PrestigeTier[] Tiers =
        {
            new PrestigeTier { tierName = "Survivor",  requiredTotalLegacyPoints = 0,    milestoneRewardKey = "none",          milestoneRewardAmount = 0 },
            new PrestigeTier { tierName = "Veteran",   requiredTotalLegacyPoints = 100,  milestoneRewardKey = "squad_slot",    milestoneRewardAmount = 1 },
            new PrestigeTier { tierName = "Legend",    requiredTotalLegacyPoints = 500,  milestoneRewardKey = "exotic_weapon", milestoneRewardAmount = 1 },
            new PrestigeTier { tierName = "Mythic",    requiredTotalLegacyPoints = 2000, milestoneRewardKey = "legacy_bonus",  milestoneRewardAmount = 250 },
            new PrestigeTier { tierName = "Eternal",   requiredTotalLegacyPoints = 8000, milestoneRewardKey = "title_eternal", milestoneRewardAmount = 1 },
        };

        private static readonly DailyRewardEntry[] DailyEntries =
        {
            new DailyRewardEntry { streakDay = 1, kind = DailyRewardKind.Credits,      amount = 200,  isMilestone = false },
            new DailyRewardEntry { streakDay = 2, kind = DailyRewardKind.Materials,    itemId = "metal_scraps", amount = 15, isMilestone = false },
            new DailyRewardEntry { streakDay = 3, kind = DailyRewardKind.Credits,      amount = 400,  isMilestone = false },
            new DailyRewardEntry { streakDay = 4, kind = DailyRewardKind.RmatShards,   amount = 2,    isMilestone = false },
            new DailyRewardEntry { streakDay = 5, kind = DailyRewardKind.Materials,    itemId = "electronic_waste", amount = 12, isMilestone = false },
            new DailyRewardEntry { streakDay = 6, kind = DailyRewardKind.Credits,      amount = 800,  isMilestone = false },
            new DailyRewardEntry { streakDay = 7, kind = DailyRewardKind.WeaponCrate,  amount = 1,    isMilestone = true  },
            new DailyRewardEntry { streakDay = 8, kind = DailyRewardKind.RmatShards,   amount = 4,    isMilestone = false },
            new DailyRewardEntry { streakDay = 9, kind = DailyRewardKind.Credits,      amount = 1200, isMilestone = false },
            new DailyRewardEntry { streakDay = 10,kind = DailyRewardKind.Materials,    itemId = "spare_part", amount = 8, isMilestone = false },
            new DailyRewardEntry { streakDay = 11,kind = DailyRewardKind.RmatShards,   amount = 5,    isMilestone = false },
            new DailyRewardEntry { streakDay = 12,kind = DailyRewardKind.Credits,      amount = 1800, isMilestone = false },
            new DailyRewardEntry { streakDay = 13,kind = DailyRewardKind.WeaponCrate,  amount = 1,    isMilestone = false },
            new DailyRewardEntry { streakDay = 14,kind = DailyRewardKind.LegacyPoints, amount = 50,   isMilestone = true  },
        };

        [MenuItem("ZedIdler/Seed Meta Systems")]
        public static void SeedAll()
        {
            EnsureFolder(PRESTIGE_FOLDER);
            EnsureFolder(DAILY_FOLDER);
            int u = 0;

            foreach (var s in Upgrades)
            {
                string path = $"{PRESTIGE_FOLDER}/Prestige_{s.id}.asset";
                if (AssetDatabase.LoadAssetAtPath<PrestigeUpgrade>(path) != null) continue;
                var a = ScriptableObject.CreateInstance<PrestigeUpgrade>();
                var so = new SerializedObject(a);
                so.FindProperty("upgradeId").stringValue    = s.id;
                so.FindProperty("displayName").stringValue  = s.name;
                so.FindProperty("description").stringValue  = s.desc;
                so.FindProperty("effectKey").stringValue    = s.effectKey;
                so.FindProperty("effectPerLevel").floatValue= s.perLevel;
                so.FindProperty("maxLevel").intValue        = s.maxLevel;
                so.FindProperty("baseCost").intValue        = s.baseCost;
                so.FindProperty("costGrowth").floatValue    = s.growth;
                so.ApplyModifiedPropertiesWithoutUndo();
                AssetDatabase.CreateAsset(a, path);
                u++;
            }

            // Tier ladder
            string ladderPath = $"{PRESTIGE_FOLDER}/PrestigeTiers.asset";
            if (AssetDatabase.LoadAssetAtPath<PrestigeTierLadder>(ladderPath) == null)
            {
                var ladder = ScriptableObject.CreateInstance<PrestigeTierLadder>();
                var so = new SerializedObject(ladder);
                var arr = so.FindProperty("tiers");
                arr.arraySize = Tiers.Length;
                for (int i = 0; i < Tiers.Length; i++)
                {
                    var e = arr.GetArrayElementAtIndex(i);
                    e.FindPropertyRelative("tierName").stringValue = Tiers[i].tierName;
                    e.FindPropertyRelative("requiredTotalLegacyPoints").intValue = Tiers[i].requiredTotalLegacyPoints;
                    e.FindPropertyRelative("milestoneRewardKey").stringValue = Tiers[i].milestoneRewardKey;
                    e.FindPropertyRelative("milestoneRewardAmount").intValue = Tiers[i].milestoneRewardAmount;
                }
                so.ApplyModifiedPropertiesWithoutUndo();
                AssetDatabase.CreateAsset(ladder, ladderPath);
            }

            // Daily ladder
            string dailyPath = $"{DAILY_FOLDER}/DailyRewards.asset";
            if (AssetDatabase.LoadAssetAtPath<DailyRewardLadder>(dailyPath) == null)
            {
                var daily = ScriptableObject.CreateInstance<DailyRewardLadder>();
                var so = new SerializedObject(daily);
                var arr = so.FindProperty("entries");
                arr.arraySize = DailyEntries.Length;
                for (int i = 0; i < DailyEntries.Length; i++)
                {
                    var e = arr.GetArrayElementAtIndex(i);
                    e.FindPropertyRelative("streakDay").intValue = DailyEntries[i].streakDay;
                    e.FindPropertyRelative("kind").enumValueIndex = (int)DailyEntries[i].kind;
                    e.FindPropertyRelative("itemId").stringValue = DailyEntries[i].itemId ?? "";
                    e.FindPropertyRelative("amount").intValue = DailyEntries[i].amount;
                    e.FindPropertyRelative("isMilestone").boolValue = DailyEntries[i].isMilestone;
                }
                so.FindProperty("streakBonusPerDay").floatValue = 0.05f;
                so.FindProperty("streakBonusCap").floatValue = 3f;
                so.ApplyModifiedPropertiesWithoutUndo();
                AssetDatabase.CreateAsset(daily, dailyPath);
            }

            AssetDatabase.SaveAssets(); AssetDatabase.Refresh();
            Debug.Log($"[MetaSeeder] +{u} prestige upgrades, tier ladder, daily ladder seeded.");
        }

        private static void EnsureFolder(string path)
        {
            if (AssetDatabase.IsValidFolder(path)) return;
            string parent = System.IO.Path.GetDirectoryName(path).Replace('\\', '/');
            string leaf   = System.IO.Path.GetFileName(path);
            if (!AssetDatabase.IsValidFolder(parent)) EnsureFolder(parent);
            AssetDatabase.CreateFolder(parent, leaf);
        }
    }
}
#endif
