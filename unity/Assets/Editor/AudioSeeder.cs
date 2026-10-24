// Assets/Editor/AudioSeeder.cs
#if UNITY_EDITOR
using UnityEditor;
using UnityEngine;
using ZedIdler.Data;

namespace ZedIdler.Editor
{
    /// <summary>
    /// Seeds 20 starter SoundDefinition placeholders (silent — clip slot left empty)
    /// + 8 SoundBank groupings. Designers drop real AudioClips into the slots later.
    /// Idempotent.
    /// </summary>
    public static class AudioSeeder
    {
        private const string SOUND_FOLDER = "Assets/Data/Audio/Sounds";
        private const string BANK_FOLDER  = "Assets/Data/Audio/Banks";

        private static readonly Seed[] Sounds =
        {
            // Combat
            new Seed("sfx_melee_hit_1",  "Melee Hit 1",  AudioBus.SfxCombat),
            new Seed("sfx_melee_hit_2",  "Melee Hit 2",  AudioBus.SfxCombat),
            new Seed("sfx_gunshot_1",    "Gunshot 1",    AudioBus.SfxCombat),
            new Seed("sfx_gunshot_2",    "Gunshot 2",    AudioBus.SfxCombat),
            new Seed("sfx_crit",         "Critical Hit", AudioBus.SfxCombat, duckMusic: true),
            new Seed("sfx_misfire",      "Misfire",      AudioBus.SfxCombat),
            new Seed("sfx_zombie_die_1", "Zombie Die 1", AudioBus.SfxCombat),
            new Seed("sfx_zombie_die_2", "Zombie Die 2", AudioBus.SfxCombat),
            new Seed("sfx_survivor_down","Survivor Down",AudioBus.SfxCombat, duckMusic: true),
            new Seed("sfx_reload",       "Reload",       AudioBus.SfxCombat),
            // Loot / inventory
            new Seed("sfx_loot_pickup",  "Loot Pickup",  AudioBus.SfxLoot),
            new Seed("sfx_loot_rare",    "Rare Drop",    AudioBus.SfxLoot, duckMusic: true),
            new Seed("sfx_recycler_done","Recycler Done",AudioBus.SfxLoot),
            // UI
            new Seed("ui_click",         "UI Click",     AudioBus.UiClick),
            new Seed("ui_tab",           "UI Tab Switch",AudioBus.UiClick),
            new Seed("ui_toast",         "UI Toast",     AudioBus.UiClick),
            // Notifications
            new Seed("notif_contract_complete", "Contract Complete", AudioBus.Notification),
            new Seed("notif_contract_fail",     "Contract Fail",     AudioBus.Notification),
            new Seed("notif_rank_up",           "Faction Rank Up",   AudioBus.Notification),
            new Seed("notif_market_event",      "Market Event",      AudioBus.Notification),
        };

        private static readonly BankSeed[] Banks =
        {
            new BankSeed("bank_melee_hit", "Melee Hit",     new[] { "sfx_melee_hit_1", "sfx_melee_hit_2" }),
            new BankSeed("bank_gunshot",   "Gunshot",       new[] { "sfx_gunshot_1", "sfx_gunshot_2" }),
            new BankSeed("bank_zombie_die","Zombie Die",    new[] { "sfx_zombie_die_1", "sfx_zombie_die_2" }),
            new BankSeed("bank_ui_click",  "UI Click",      new[] { "ui_click" }),
            new BankSeed("bank_loot",      "Loot Pickup",   new[] { "sfx_loot_pickup" }),
            new BankSeed("bank_rare_drop", "Rare Drop",     new[] { "sfx_loot_rare" }),
            new BankSeed("bank_misfire",   "Misfire",       new[] { "sfx_misfire" }),
            new BankSeed("bank_contract",  "Contract Done", new[] { "notif_contract_complete" }),
        };

        [MenuItem("ZedIdler/Seed Audio")]
        public static void SeedAll()
        {
            EnsureFolder(SOUND_FOLDER); EnsureFolder(BANK_FOLDER);
            int sCreated = 0, bCreated = 0;
            foreach (var s in Sounds)
            {
                string path = $"{SOUND_FOLDER}/{s.id}.asset";
                if (AssetDatabase.LoadAssetAtPath<SoundDefinition>(path) != null) continue;
                var asset = ScriptableObject.CreateInstance<SoundDefinition>();
                var so = new SerializedObject(asset);
                so.FindProperty("soundId").stringValue = s.id;
                so.FindProperty("displayName").stringValue = s.name;
                so.FindProperty("bus").enumValueIndex = (int)s.bus;
                so.FindProperty("baseVolume").floatValue = 0.9f;
                so.FindProperty("pitchMin").floatValue = 0.95f;
                so.FindProperty("pitchMax").floatValue = 1.05f;
                so.FindProperty("maxSimultaneous").intValue = 4;
                so.FindProperty("duckMusic").boolValue = s.duckMusic;
                so.FindProperty("duckAmount").floatValue = 0.4f;
                so.FindProperty("duckHoldSeconds").floatValue = 0.4f;
                so.ApplyModifiedPropertiesWithoutUndo();
                AssetDatabase.CreateAsset(asset, path);
                sCreated++;
            }
            AssetDatabase.SaveAssets();

            foreach (var b in Banks)
            {
                string path = $"{BANK_FOLDER}/{b.id}.asset";
                if (AssetDatabase.LoadAssetAtPath<SoundBank>(path) != null) continue;
                var asset = ScriptableObject.CreateInstance<SoundBank>();
                var so = new SerializedObject(asset);
                so.FindProperty("bankId").stringValue = b.id;
                so.FindProperty("displayName").stringValue = b.name;
                var variants = so.FindProperty("variants");
                variants.arraySize = b.soundIds.Length;
                for (int i = 0; i < b.soundIds.Length; i++)
                {
                    var v = variants.GetArrayElementAtIndex(i);
                    var soundAsset = AssetDatabase.LoadAssetAtPath<SoundDefinition>($"{SOUND_FOLDER}/{b.soundIds[i]}.asset");
                    v.FindPropertyRelative("sound").objectReferenceValue = soundAsset;
                    v.FindPropertyRelative("weight").floatValue = 1f;
                }
                so.ApplyModifiedPropertiesWithoutUndo();
                AssetDatabase.CreateAsset(asset, path);
                bCreated++;
            }
            AssetDatabase.SaveAssets(); AssetDatabase.Refresh();
            Debug.Log($"[AudioSeeder] {sCreated} sounds + {bCreated} banks created.");
        }

        private static void EnsureFolder(string path)
        {
            if (AssetDatabase.IsValidFolder(path)) return;
            string parent = System.IO.Path.GetDirectoryName(path).Replace('\\','/');
            string leaf   = System.IO.Path.GetFileName(path);
            if (!AssetDatabase.IsValidFolder(parent)) EnsureFolder(parent);
            AssetDatabase.CreateFolder(parent, leaf);
        }

        private struct Seed
        {
            public string id, name; public AudioBus bus; public bool duckMusic;
            public Seed(string id, string name, AudioBus bus, bool duckMusic = false)
            { this.id=id; this.name=name; this.bus=bus; this.duckMusic=duckMusic; }
        }
        private struct BankSeed
        {
            public string id, name; public string[] soundIds;
            public BankSeed(string id, string name, string[] soundIds)
            { this.id=id; this.name=name; this.soundIds=soundIds; }
        }
    }
}
#endif
