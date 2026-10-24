// Assets/Editor/ArtPaletteSeeder.cs
#if UNITY_EDITOR
using UnityEditor;
using UnityEngine;
using ZedIdler.Data;

namespace ZedIdler.Editor
{
    /// <summary>
    /// Seeds per-category ArtPalette assets covering every <c>ArtCategory</c>
    /// plus per-faction icon variants. Idempotent.
    /// </summary>
    public static class ArtPaletteSeeder
    {
        private const string FOLDER = "Assets/Data/Art/Palettes";

        // (paletteId, silhouette, accent, background, grunge alpha)
        private static readonly Seed[] Seeds =
        {
            // Default category palettes
            new Seed("zombie_default",       new Color(0.05f, 0.05f, 0.05f),  new Color(0.85f, 0.20f, 0.15f), new Color(0.42f, 0.36f, 0.30f), 0.45f),
            new Seed("zombie_radiation",     new Color(0.07f, 0.18f, 0.05f),  new Color(0.85f, 1.00f, 0.20f), new Color(0.30f, 0.40f, 0.20f), 0.50f),
            new Seed("building_default",     new Color(0.10f, 0.08f, 0.07f),  new Color(0.95f, 0.78f, 0.40f), new Color(0.55f, 0.45f, 0.35f), 0.40f),
            new Seed("contract_default",     new Color(0.08f, 0.06f, 0.05f),  new Color(0.75f, 0.65f, 0.30f), new Color(0.50f, 0.42f, 0.35f), 0.40f),
            new Seed("task_default",         new Color(0.06f, 0.06f, 0.08f),  new Color(0.60f, 0.85f, 0.95f), new Color(0.32f, 0.36f, 0.42f), 0.35f),
            new Seed("blueprint_default",    new Color(0.05f, 0.10f, 0.18f),  new Color(0.60f, 0.85f, 1.00f), new Color(0.10f, 0.18f, 0.32f), 0.30f),
            new Seed("environment_default",  new Color(0.10f, 0.08f, 0.06f),  new Color(0.55f, 0.40f, 0.20f), new Color(0.38f, 0.32f, 0.25f), 0.50f),

            // Per-faction icon palettes (Concordance / IronMarch / Dustwalkers / Hearthguard / BlackHaven / Lodge)
            new Seed("faction_concordance",  new Color(0.05f, 0.05f, 0.05f),  new Color(0.66f, 0.33f, 0.97f), new Color(0.18f, 0.12f, 0.28f), 0.35f),
            new Seed("faction_iron_march",   new Color(0.10f, 0.08f, 0.06f),  new Color(0.55f, 0.23f, 0.16f), new Color(0.28f, 0.18f, 0.14f), 0.40f),
            new Seed("faction_dustwalkers",  new Color(0.10f, 0.08f, 0.05f),  new Color(0.79f, 0.66f, 0.43f), new Color(0.40f, 0.32f, 0.22f), 0.45f),
            new Seed("faction_hearthguard",  new Color(0.06f, 0.10f, 0.06f),  new Color(0.49f, 0.69f, 0.51f), new Color(0.22f, 0.32f, 0.22f), 0.35f),
            new Seed("faction_black_haven",  new Color(0.04f, 0.04f, 0.06f),  new Color(0.30f, 0.18f, 0.30f), new Color(0.12f, 0.10f, 0.16f), 0.45f),
            new Seed("faction_lodge",        new Color(0.08f, 0.06f, 0.04f),  new Color(0.86f, 0.71f, 0.34f), new Color(0.36f, 0.28f, 0.18f), 0.40f),
        };

        [MenuItem("ZedIdler/Seed Art Palettes")]
        public static void SeedAll()
        {
            EnsureFolder(FOLDER);
            int created = 0;
            foreach (var s in Seeds)
            {
                string path = $"{FOLDER}/Palette_{s.id}.asset";
                if (AssetDatabase.LoadAssetAtPath<ArtPalette>(path) != null) continue;
                var asset = ScriptableObject.CreateInstance<ArtPalette>();
                var so = new SerializedObject(asset);
                so.FindProperty("paletteId").stringValue = s.id;
                so.FindProperty("silhouette").colorValue = s.silhouette;
                so.FindProperty("accent").colorValue     = s.accent;
                so.FindProperty("background").colorValue = s.background;
                so.FindProperty("grunge").colorValue     = new Color(0f, 0f, 0f, s.grungeAlpha);
                so.FindProperty("grungeIntensity").floatValue = s.grungeAlpha + 0.10f;
                so.FindProperty("overrideTint").colorValue = Color.white;
                so.FindProperty("useOverrideTint").boolValue = false;
                so.ApplyModifiedPropertiesWithoutUndo();
                AssetDatabase.CreateAsset(asset, path);
                created++;
            }
            AssetDatabase.SaveAssets(); AssetDatabase.Refresh();
            Debug.Log($"[ArtPaletteSeeder] Created {created} new palettes ({Seeds.Length} total).");
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
            public string id;
            public Color silhouette, accent, background;
            public float grungeAlpha;
            public Seed(string id, Color silhouette, Color accent, Color background, float grungeAlpha)
            { this.id = id; this.silhouette = silhouette; this.accent = accent; this.background = background; this.grungeAlpha = grungeAlpha; }
        }
    }
}
#endif
