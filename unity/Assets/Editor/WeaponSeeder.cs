// Assets/Editor/WeaponSeeder.cs
#if UNITY_EDITOR
using UnityEditor;
using UnityEngine;
using ZedIdler.Data;

namespace ZedIdler.Editor
{
    /// <summary>
    /// Seeds 10 starter weapons + 8 weapon mods. Idempotent.
    /// </summary>
    public static class WeaponSeeder
    {
        private const string WEAPON_FOLDER = "Assets/Data/Weapons";
        private const string MOD_FOLDER    = "Assets/Data/WeaponMods";

        private static readonly WeaponSeed[] WeaponSeeds =
        {
            // (id, name, slot, kind, minDmg, maxDmg, dmgMult, magSize, ammoId, durability, sockets, scaling)
            new WeaponSeed("w_pipe_rifle",   "Pipe Rifle",       WeaponSlot.Primary,   WeaponKind.Ranged, 8, 15, 1.12f, 6,  "ammo_rifle",  60, 1, WeaponStatScaling.AgilityCombat),
            new WeaponSeed("w_hunting_rifle","Hunting Rifle",    WeaponSlot.Primary,   WeaponKind.Ranged, 18, 32, 1.45f, 8, "ammo_rifle",  120,2, WeaponStatScaling.AgilityCombat),
            new WeaponSeed("w_shotgun",      "Sawed-off Shotgun",WeaponSlot.Primary,   WeaponKind.Ranged, 20, 40, 1.50f, 2, "ammo_shell",  80, 1, WeaponStatScaling.StrengthCombat),
            new WeaponSeed("w_smg",          "SMG",              WeaponSlot.Primary,   WeaponKind.Ranged, 8,  14, 1.20f, 30,"ammo_pistol", 100,3, WeaponStatScaling.AgilityCombat),
            new WeaponSeed("w_pistol",       "9mm Pistol",       WeaponSlot.Secondary, WeaponKind.Ranged, 6,  12, 1.00f, 12,"ammo_pistol", 80, 2, WeaponStatScaling.AgilityCombat),
            new WeaponSeed("w_revolver",     ".357 Revolver",    WeaponSlot.Secondary, WeaponKind.Ranged, 14, 26, 1.30f, 6, "ammo_revolver",70, 1, WeaponStatScaling.AgilityCombat),
            new WeaponSeed("w_hatchet",      "Hatchet",          WeaponSlot.Melee,     WeaponKind.Melee,  10, 18, 1.20f, 0, null,          120,1, WeaponStatScaling.StrengthCombat),
            new WeaponSeed("w_machete",      "Machete",          WeaponSlot.Melee,     WeaponKind.Melee,  14, 22, 1.28f, 0, null,          150,2, WeaponStatScaling.StrengthCombat),
            new WeaponSeed("w_sledgehammer", "Sledgehammer",     WeaponSlot.Melee,     WeaponKind.Melee,  20, 34, 1.45f, 0, null,          180,1, WeaponStatScaling.StrengthCombat),
            new WeaponSeed("w_combat_knife", "Combat Knife",     WeaponSlot.Melee,     WeaponKind.Melee,  8,  13, 1.08f, 0, null,          100,2, WeaponStatScaling.AgilityCombat),
        };

        private static readonly ModSeed[] ModSeeds =
        {
            new ModSeed("mod_extended_mag", "Extended Magazine", WeaponModCategory.Magazine,  0,  0f, 8,  0,  0f, 0f, 0f),
            new ModSeed("mod_scope",        "Hunting Scope",     WeaponModCategory.Accuracy,  0,  0f, 0,  0,  0.04f, 0.10f, 0f),
            new ModSeed("mod_reinforced",   "Reinforced Frame",  WeaponModCategory.Durability,0,  0f, 0,  40, 0f, 0f, 0f),
            new ModSeed("mod_match_grip",   "Match Grip",        WeaponModCategory.Recoil,    0,  0f, 0,  0,  0f, 0.06f, 0f),
            new ModSeed("mod_heavy_barrel", "Heavy Barrel",      WeaponModCategory.Damage,    3,  0.15f, 0, 0, 0f, 0f, 0f),
            new ModSeed("mod_oil_lined",    "Oil-lined Action",  WeaponModCategory.Cleanliness,0, 0f, 0,  0,  0f, 0f, 0.50f),
            new ModSeed("mod_polished",     "Polished Trigger",  WeaponModCategory.Crit,      0,  0f, 0,  0,  0.05f, 0f, 0f),
            new ModSeed("mod_balanced",     "Balanced Weights",  WeaponModCategory.Recoil,    1,  0.05f, 0, 0, 0f, 0.04f, 0f),
        };

        [MenuItem("ZedIdler/Seed Weapons")]
        public static void SeedAll()
        {
            EnsureFolder(WEAPON_FOLDER); EnsureFolder(MOD_FOLDER);
            int wCreated = 0, mCreated = 0;
            foreach (var s in WeaponSeeds)
            {
                string path = $"{WEAPON_FOLDER}/{s.id}.asset";
                if (AssetDatabase.LoadAssetAtPath<WeaponDefinition>(path) != null) continue;
                var w = ScriptableObject.CreateInstance<WeaponDefinition>();
                var so = new SerializedObject(w);
                so.FindProperty("weaponId").stringValue       = s.id;
                so.FindProperty("displayName").stringValue    = s.name;
                so.FindProperty("slot").enumValueIndex        = (int)s.slot;
                so.FindProperty("kind").enumValueIndex        = (int)s.kind;
                so.FindProperty("minDamage").intValue         = s.minDmg;
                so.FindProperty("maxDamage").intValue         = s.maxDmg;
                so.FindProperty("damageMultiplier").floatValue= s.dmgMult;
                so.FindProperty("magazineSize").intValue      = s.magSize;
                so.FindProperty("ammoItemId").stringValue     = s.ammoId ?? "";
                so.FindProperty("durabilityCostPerShot").intValue = 1;
                so.FindProperty("maxDurability").intValue     = s.durability;
                so.FindProperty("startingCleanliness").intValue = 100;
                so.FindProperty("cleanlinessLossPerUse").intValue = 1;
                so.FindProperty("maxMisfireChance").floatValue = 0.30f;
                so.FindProperty("misfireBreakRollChance").floatValue = 0.05f;
                so.FindProperty("socketCount").intValue       = s.sockets;
                so.FindProperty("primaryScaling").enumValueIndex = (int)s.scaling;
                so.FindProperty("diplomatRankBonusPerRank").floatValue = 0.03f;
                so.FindProperty("accuracy").floatValue        = 0.85f;
                so.FindProperty("critChanceBonus").floatValue = 0f;
                so.ApplyModifiedPropertiesWithoutUndo();
                AssetDatabase.CreateAsset(w, path);
                wCreated++;
            }
            foreach (var s in ModSeeds)
            {
                string path = $"{MOD_FOLDER}/{s.id}.asset";
                if (AssetDatabase.LoadAssetAtPath<WeaponMod>(path) != null) continue;
                var m = ScriptableObject.CreateInstance<WeaponMod>();
                var so = new SerializedObject(m);
                so.FindProperty("modId").stringValue          = s.id;
                so.FindProperty("displayName").stringValue    = s.name;
                so.FindProperty("description").stringValue    = $"{s.name} ({s.category}).";
                so.FindProperty("category").enumValueIndex    = (int)s.category;
                so.FindProperty("damageBonus").floatValue     = s.dmgBonus;
                so.FindProperty("damageMultBonus").floatValue = s.dmgMultBonus;
                so.FindProperty("magazineBonus").intValue     = s.magBonus;
                so.FindProperty("durabilityMaxBonus").intValue = s.durMaxBonus;
                so.FindProperty("critChanceBonus").floatValue = s.critBonus;
                so.FindProperty("accuracyBonus").floatValue   = s.accBonus;
                so.FindProperty("cleanlinessLossReduction").floatValue = s.cleanLossRed;
                so.FindProperty("requiresCategoryMatch").boolValue = false;
                so.ApplyModifiedPropertiesWithoutUndo();
                AssetDatabase.CreateAsset(m, path);
                mCreated++;
            }
            AssetDatabase.SaveAssets(); AssetDatabase.Refresh();
            Debug.Log($"[WeaponSeeder] Created {wCreated} weapons + {mCreated} mods.");
        }

        private static void EnsureFolder(string path)
        {
            if (AssetDatabase.IsValidFolder(path)) return;
            string parent = System.IO.Path.GetDirectoryName(path).Replace('\\', '/');
            string leaf   = System.IO.Path.GetFileName(path);
            if (!AssetDatabase.IsValidFolder(parent)) EnsureFolder(parent);
            AssetDatabase.CreateFolder(parent, leaf);
        }

        private struct WeaponSeed
        {
            public string id, name, ammoId;
            public WeaponSlot slot; public WeaponKind kind;
            public int minDmg, maxDmg, magSize, durability, sockets;
            public float dmgMult;
            public WeaponStatScaling scaling;
            public WeaponSeed(string id, string name, WeaponSlot slot, WeaponKind kind,
                int minDmg, int maxDmg, float dmgMult, int magSize, string ammoId,
                int durability, int sockets, WeaponStatScaling scaling)
            { this.id=id; this.name=name; this.slot=slot; this.kind=kind;
              this.minDmg=minDmg; this.maxDmg=maxDmg; this.dmgMult=dmgMult;
              this.magSize=magSize; this.ammoId=ammoId; this.durability=durability;
              this.sockets=sockets; this.scaling=scaling; }
        }

        private struct ModSeed
        {
            public string id, name;
            public WeaponModCategory category;
            public float dmgBonus, dmgMultBonus, critBonus, accBonus, cleanLossRed;
            public int magBonus, durMaxBonus;
            public ModSeed(string id, string name, WeaponModCategory cat,
                float dmgBonus, float dmgMultBonus, int magBonus, int durMaxBonus,
                float critBonus, float accBonus, float cleanLossRed)
            { this.id=id; this.name=name; category=cat;
              this.dmgBonus=dmgBonus; this.dmgMultBonus=dmgMultBonus;
              this.magBonus=magBonus; this.durMaxBonus=durMaxBonus;
              this.critBonus=critBonus; this.accBonus=accBonus;
              this.cleanLossRed=cleanLossRed; }
        }
    }
}
#endif
