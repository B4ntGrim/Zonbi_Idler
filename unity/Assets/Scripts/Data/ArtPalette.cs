// Assets/Scripts/Data/ArtPalette.cs
using System;
using UnityEngine;

namespace ZedIdler.Data
{
    /// <summary>
    /// Per-category palette for the distressed-silhouette art system.
    /// Each palette declares a foreground silhouette color, a tint range
    /// (used for runtime recoloring on events like radiation), a grunge
    /// overlay color, and an accent.
    /// </summary>
    [CreateAssetMenu(menuName = "ZedIdler/Art Palette", fileName = "Palette_New", order = 130)]
    public sealed class ArtPalette : ScriptableObject
    {
        [Header("Identity")]
        [SerializeField] private string paletteId; // e.g. "zombie_default", "building_default", "faction_concordance"

        [Header("Silhouette")]
        [SerializeField] private Color silhouette = new Color(0.08f, 0.06f, 0.05f, 1f);

        [Header("Accent (small bright detail like eyes / windows)")]
        [SerializeField] private Color accent = new Color(0.85f, 0.25f, 0.15f, 1f);

        [Header("Background Field")]
        [SerializeField] private Color background = new Color(0.42f, 0.36f, 0.30f, 1f);

        [Header("Grunge Overlay")]
        [SerializeField] private Color grunge = new Color(0.0f, 0.0f, 0.0f, 0.35f);
        [SerializeField, Range(0f, 1f)] private float grungeIntensity = 0.45f;

        [Header("Runtime Tint (recolor)")]
        [SerializeField] private Color overrideTint = Color.white;
        [SerializeField] private bool useOverrideTint = false;

        public string PaletteId      => paletteId;
        public Color  Silhouette     => useOverrideTint ? overrideTint : silhouette;
        public Color  Accent         => accent;
        public Color  Background     => background;
        public Color  Grunge         => grunge;
        public float  GrungeIntensity => grungeIntensity;

        public void SetRuntimeTint(Color tint) { overrideTint = tint; useOverrideTint = true; }
        public void ClearRuntimeTint()         { useOverrideTint = false; }
    }
}
