// Assets/Scripts/Services/ArtGenerationService.cs
using System;
using System.Collections.Generic;
using UnityEngine;
using ZedIdler.Data;

namespace ZedIdler.Services
{
    /// <summary>
    /// Distressed-silhouette art generator. Draws bold solid silhouettes on
    /// a textured background field, then overlays procedural grunge / noise
    /// for a Darkest-Dungeon-adjacent feel.
    /// </summary>
    /// <remarks>
    /// Two modes per spec answer 2 ("both"):
    /// • Runtime: <see cref="GenerateTexture"/> returns a fresh Texture2D for
    ///   any (category, seed) combination. Fully random per spawn (answer 8).
    /// • Asset pipeline: editor scripts call the same generators to bake .png
    ///   files into the project.
    ///
    /// Cache: per-(category, seed) Texture2D references kept in a dictionary
    /// so repeated calls reuse the same memory (answer 9). Cleared via
    /// <see cref="ClearCache"/> if memory pressure becomes a concern.
    /// </remarks>
    [DisallowMultipleComponent]
    public sealed class ArtGenerationService : MonoBehaviour, IArtGenerationService
    {
        [SerializeField] private ArtPalette[] palettes;
        [SerializeField] private string resourcesRoot = "Art/Palettes";

        private readonly Dictionary<string, ArtPalette> _paletteById = new Dictionary<string, ArtPalette>();
        private readonly LruTextureCache _cache = new LruTextureCache(128);

        private void Awake()
        {
            DontDestroyOnLoad(gameObject);
            if (palettes == null || palettes.Length == 0) palettes = Resources.LoadAll<ArtPalette>(resourcesRoot);
            foreach (var p in palettes ?? Array.Empty<ArtPalette>())
                if (p != null && !string.IsNullOrEmpty(p.PaletteId)) _paletteById[p.PaletteId] = p;
            ServiceLocator.Register<IArtGenerationService>(this);
        }

        private void OnDestroy() => ServiceLocator.Unregister<IArtGenerationService>();

        public ArtPalette GetPalette(string id) =>
            !string.IsNullOrEmpty(id) && _paletteById.TryGetValue(id, out var p) ? p : null;

        public Texture2D GenerateTexture(ArtCategory category, int width, int height, int seed, string paletteId = null)
        {
            string cacheKey = $"{category}_{width}x{height}_{seed}_{paletteId}";
            if (_cache.TryGet(cacheKey, out var cached)) return cached;

            var palette = GetPalette(paletteId) ?? GetPalette(category.ToString().ToLowerInvariant() + "_default");
            if (palette == null)
            {
                Debug.LogWarning($"[ArtGen] No palette for {category} / {paletteId}.");
                return null;
            }

            var rng = new System.Random(seed);
            var tex = new Texture2D(width, height, TextureFormat.RGBA32, false) { filterMode = FilterMode.Bilinear, wrapMode = TextureWrapMode.Clamp };
            var pixels = new Color[width * height];

            // 1. Background field
            for (int i = 0; i < pixels.Length; i++) pixels[i] = palette.Background;

            // 2. Silhouette per category
            DrawSilhouette(pixels, width, height, palette, category, rng);

            // 3. Distressed grunge overlay
            ApplyGrungeOverlay(pixels, width, height, palette, rng);

            tex.SetPixels(pixels);
            tex.Apply(false);
            _cache.Add(cacheKey, tex);
            return tex;
        }

        public void ClearCache()
        {
            _cache.Clear();
        }

        // ─── Silhouette renderers ─────────────────────────────────────────────
        private static void DrawSilhouette(Color[] px, int w, int h, ArtPalette pal, ArtCategory cat, System.Random rng)
        {
            switch (cat)
            {
                case ArtCategory.Zombie:       ZombieSilhouette(px, w, h, pal, rng); break;
                case ArtCategory.Building:     BuildingSilhouette(px, w, h, pal, rng); break;
                case ArtCategory.FactionIcon:  FactionIconSilhouette(px, w, h, pal, rng); break;
                case ArtCategory.ContractIcon: ContractIconSilhouette(px, w, h, pal, rng); break;
                case ArtCategory.TaskIcon:     TaskIconSilhouette(px, w, h, pal, rng); break;
                case ArtCategory.Blueprint:    BlueprintSilhouette(px, w, h, pal, rng); break;
                case ArtCategory.Environment:  EnvironmentSilhouette(px, w, h, pal, rng); break;
            }
        }

        private static void ZombieSilhouette(Color[] px, int w, int h, ArtPalette pal, System.Random rng)
        {
            // Hunched humanoid: rounded head, asymmetric shoulders, tilted stance.
            int cx = w / 2, ground = (int)(h * 0.92f);
            int headR = h / 8;
            int headY = ground - (int)(h * 0.78f);
            FillCircle(px, w, h, cx + rng.Next(-2, 3), headY, headR, pal.Silhouette);
            // Body
            int bodyW = (int)(w * 0.45f), bodyH = (int)(h * 0.45f);
            FillRoundedRect(px, w, h, cx - bodyW / 2, headY + headR, bodyW, bodyH, 4, pal.Silhouette);
            // Arms — droopy, asymmetric
            int armLen = (int)(h * 0.4f);
            FillRoundedRect(px, w, h, cx - bodyW / 2 - 6, headY + headR + 4, 8, armLen + rng.Next(-3, 5), 3, pal.Silhouette);
            FillRoundedRect(px, w, h, cx + bodyW / 2 - 2, headY + headR + 6, 8, armLen + rng.Next(-3, 5), 3, pal.Silhouette);
            // Legs
            int legW = (int)(w * 0.14f), legH = (int)(h * 0.30f);
            FillRoundedRect(px, w, h, cx - legW - 1, headY + headR + bodyH, legW, legH, 3, pal.Silhouette);
            FillRoundedRect(px, w, h, cx + 1,        headY + headR + bodyH, legW, legH, 3, pal.Silhouette);
            // Eye accents
            FillCircle(px, w, h, cx - headR / 3, headY - 1, 2, pal.Accent);
            FillCircle(px, w, h, cx + headR / 3, headY - 1, 2, pal.Accent);
        }

        private static void BuildingSilhouette(Color[] px, int w, int h, ArtPalette pal, System.Random rng)
        {
            // Rectangular base + asymmetric roof, scattered window accents.
            int baseY = (int)(h * 0.85f);
            int baseH = (int)(h * 0.65f);
            int baseW = (int)(w * 0.78f);
            int baseX = (w - baseW) / 2;
            FillRect(px, w, h, baseX, baseY - baseH, baseW, baseH, pal.Silhouette);

            // Pitched roof
            int roofH = (int)(h * 0.20f);
            int roofY = baseY - baseH;
            int rOff  = rng.Next(-w / 8, w / 8);
            FillTriangle(px, w, h, baseX, roofY, baseX + baseW, roofY, w / 2 + rOff, roofY - roofH, pal.Silhouette);

            // Windows
            int wCount = 2 + rng.Next(0, 3);
            int wSize = Mathf.Max(3, w / 14);
            for (int i = 0; i < wCount; i++)
            {
                int wx = baseX + 4 + rng.Next(0, baseW - wSize - 8);
                int wy = baseY - baseH + 6 + rng.Next(0, baseH - wSize - 12);
                FillRect(px, w, h, wx, wy, wSize, wSize, pal.Accent);
            }
        }

        private static void FactionIconSilhouette(Color[] px, int w, int h, ArtPalette pal, System.Random rng)
        {
            int cx = w / 2, cy = h / 2;
            int r = Mathf.Min(w, h) / 3;
            // Outer hex / shield
            FillCircle(px, w, h, cx, cy, r, pal.Silhouette);
            // Inner accent mark — pick one of: cross, slash, dot
            int kind = rng.Next(3);
            int armW = Mathf.Max(3, r / 5);
            switch (kind)
            {
                case 0: // cross
                    FillRect(px, w, h, cx - armW / 2, cy - r * 2 / 3, armW, r * 4 / 3, pal.Accent);
                    FillRect(px, w, h, cx - r * 2 / 3, cy - armW / 2, r * 4 / 3, armW, pal.Accent);
                    break;
                case 1: // slash
                    DrawLine(px, w, h, cx - r / 2, cy - r / 2, cx + r / 2, cy + r / 2, armW, pal.Accent);
                    break;
                case 2: // dot
                    FillCircle(px, w, h, cx, cy, r / 3, pal.Accent);
                    break;
            }
        }

        private static void ContractIconSilhouette(Color[] px, int w, int h, ArtPalette pal, System.Random rng) =>
            FactionIconSilhouette(px, w, h, pal, rng); // reuse — caller picks palette per category

        private static void TaskIconSilhouette(Color[] px, int w, int h, ArtPalette pal, System.Random rng) =>
            FactionIconSilhouette(px, w, h, pal, rng);

        private static void BlueprintSilhouette(Color[] px, int w, int h, ArtPalette pal, System.Random rng)
        {
            // Blueprint = thin outlined rectangle with internal hatching.
            int margin = w / 10;
            DrawHollowRect(px, w, h, margin, margin, w - margin * 2, h - margin * 2, 2, pal.Silhouette);
            int hatchCount = 3 + rng.Next(3);
            for (int i = 0; i < hatchCount; i++)
            {
                int yy = margin + 4 + rng.Next(h - margin * 2 - 8);
                DrawLine(px, w, h, margin + 2, yy, w - margin - 2, yy, 1, pal.Accent);
            }
        }

        private static void EnvironmentSilhouette(Color[] px, int w, int h, ArtPalette pal, System.Random rng)
        {
            // Random scattered small shapes (debris, grass tufts, rocks).
            int count = 6 + rng.Next(8);
            for (int i = 0; i < count; i++)
            {
                int x = rng.Next(w);
                int y = rng.Next(h);
                int s = 2 + rng.Next(4);
                FillCircle(px, w, h, x, y, s, pal.Silhouette);
            }
        }

        // ─── Grunge overlay ───────────────────────────────────────────────────
        private static void ApplyGrungeOverlay(Color[] px, int w, int h, ArtPalette pal, System.Random rng)
        {
            // Sprinkle noise: random pixel-level darkening with falloff at edges.
            int speckles = (int)(w * h * pal.GrungeIntensity * 0.06f);
            for (int i = 0; i < speckles; i++)
            {
                int x = rng.Next(w);
                int y = rng.Next(h);
                int idx = y * w + x;
                if (idx < 0 || idx >= px.Length) continue;
                px[idx] = Color.Lerp(px[idx], pal.Grunge, (float)rng.NextDouble() * pal.Grunge.a);
            }
            // Edge vignette
            int vw = w / 8;
            for (int y = 0; y < h; y++)
                for (int x = 0; x < w; x++)
                {
                    int dist = Mathf.Min(Mathf.Min(x, w - 1 - x), Mathf.Min(y, h - 1 - y));
                    if (dist >= vw) continue;
                    float t = 1f - (float)dist / vw;
                    int idx = y * w + x;
                    px[idx] = Color.Lerp(px[idx], pal.Grunge, t * 0.55f);
                }
        }

        // ─── Drawing primitives ───────────────────────────────────────────────
        private static void FillRect(Color[] px, int w, int h, int x, int y, int rw, int rh, Color c)
        {
            for (int yy = y; yy < y + rh; yy++)
                for (int xx = x; xx < x + rw; xx++)
                    if (xx >= 0 && yy >= 0 && xx < w && yy < h) px[yy * w + xx] = c;
        }

        private static void FillRoundedRect(Color[] px, int w, int h, int x, int y, int rw, int rh, int radius, Color c)
        {
            for (int yy = y; yy < y + rh; yy++)
                for (int xx = x; xx < x + rw; xx++)
                {
                    int dxL = xx - (x + radius), dxR = (x + rw - radius - 1) - xx;
                    int dyT = yy - (y + radius), dyB = (y + rh - radius - 1) - yy;
                    if (dxL < 0 && dyT < 0 && dxL * dxL + dyT * dyT > radius * radius) continue;
                    if (dxR < 0 && dyT < 0 && dxR * dxR + dyT * dyT > radius * radius) continue;
                    if (dxL < 0 && dyB < 0 && dxL * dxL + dyB * dyB > radius * radius) continue;
                    if (dxR < 0 && dyB < 0 && dxR * dxR + dyB * dyB > radius * radius) continue;
                    if (xx >= 0 && yy >= 0 && xx < w && yy < h) px[yy * w + xx] = c;
                }
        }

        private static void FillCircle(Color[] px, int w, int h, int cx, int cy, int r, Color c)
        {
            for (int dy = -r; dy <= r; dy++)
                for (int dx = -r; dx <= r; dx++)
                {
                    if (dx * dx + dy * dy > r * r) continue;
                    int x = cx + dx, y = cy + dy;
                    if (x >= 0 && y >= 0 && x < w && y < h) px[y * w + x] = c;
                }
        }

        private static void FillTriangle(Color[] px, int w, int h, int x1, int y1, int x2, int y2, int x3, int y3, Color c)
        {
            int minX = Mathf.Max(0, Mathf.Min(x1, Mathf.Min(x2, x3)));
            int maxX = Mathf.Min(w - 1, Mathf.Max(x1, Mathf.Max(x2, x3)));
            int minY = Mathf.Max(0, Mathf.Min(y1, Mathf.Min(y2, y3)));
            int maxY = Mathf.Min(h - 1, Mathf.Max(y1, Mathf.Max(y2, y3)));
            for (int yy = minY; yy <= maxY; yy++)
                for (int xx = minX; xx <= maxX; xx++)
                    if (PointInTriangle(xx, yy, x1, y1, x2, y2, x3, y3))
                        px[yy * w + xx] = c;
        }

        private static bool PointInTriangle(int px_, int py_, int x1, int y1, int x2, int y2, int x3, int y3)
        {
            int d1 = (px_ - x2) * (y1 - y2) - (x1 - x2) * (py_ - y2);
            int d2 = (px_ - x3) * (y2 - y3) - (x2 - x3) * (py_ - y3);
            int d3 = (px_ - x1) * (y3 - y1) - (x3 - x1) * (py_ - y1);
            bool hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
            bool hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);
            return !(hasNeg && hasPos);
        }

        private static void DrawLine(Color[] px, int w, int h, int x1, int y1, int x2, int y2, int thickness, Color c)
        {
            int dx = Mathf.Abs(x2 - x1), dy = Mathf.Abs(y2 - y1);
            int sx = x1 < x2 ? 1 : -1, sy = y1 < y2 ? 1 : -1;
            int err = dx - dy;
            int x = x1, y = y1;
            while (true)
            {
                FillCircle(px, w, h, x, y, thickness / 2, c);
                if (x == x2 && y == y2) break;
                int e2 = err * 2;
                if (e2 > -dy) { err -= dy; x += sx; }
                if (e2 < dx)  { err += dx; y += sy; }
            }
        }

        private static void DrawHollowRect(Color[] px, int w, int h, int x, int y, int rw, int rh, int thickness, Color c)
        {
            FillRect(px, w, h, x, y, rw, thickness, c);
            FillRect(px, w, h, x, y + rh - thickness, rw, thickness, c);
            FillRect(px, w, h, x, y, thickness, rh, c);
            FillRect(px, w, h, x + rw - thickness, y, thickness, rh, c);
        }
    }

    public interface IArtGenerationService
    {
        ArtPalette GetPalette(string id);
        Texture2D GenerateTexture(ArtCategory category, int width, int height, int seed, string paletteId = null);
        void ClearCache();
    }

    public enum ArtCategory
    {
        Zombie       = 0,
        Building     = 1,
        FactionIcon  = 2,
        ContractIcon = 3,
        TaskIcon     = 4,
        Blueprint    = 5,
        Environment  = 6
    }
}
