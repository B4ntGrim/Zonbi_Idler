// Assets/Editor/PerformanceHarness.cs
#if UNITY_EDITOR
using System.Diagnostics;
using UnityEditor;
using UnityEngine;
using ZedIdler.Data;
using ZedIdler.Services;

namespace ZedIdler.Editor
{
    /// <summary>
    /// Editor-only synthetic load harness. Generates large batches of zombies,
    /// listings, contracts, and art textures to surface allocations / hitches
    /// under the profiler. Run via <c>ZedIdler → Performance Harness</c>.
    /// </summary>
    public static class PerformanceHarness
    {
        [MenuItem("ZedIdler/Performance Harness/Generate 1000 Art Textures")]
        public static void GenerateTextures()
        {
            var svc = ServiceLocator.Get<IArtGenerationService>();
            if (svc == null) { UnityEngine.Debug.LogWarning("ArtGenerationService not registered (enter Play mode)."); return; }
            var sw = Stopwatch.StartNew();
            int count = 1000;
            for (int i = 0; i < count; i++)
            {
                var cat = (ArtCategory)(i % 7);
                svc.GenerateTexture(cat, 64, 64, i, null);
            }
            sw.Stop();
            UnityEngine.Debug.Log($"[Harness] Generated {count} textures in {sw.ElapsedMilliseconds}ms ({sw.ElapsedMilliseconds / (float)count:F2}ms each)");
        }

        [MenuItem("ZedIdler/Performance Harness/Spawn 500 Market Listings")]
        public static void SpawnListings()
        {
            var svc = ServiceLocator.Get<IMarketplaceService>();
            if (svc == null) { UnityEngine.Debug.LogWarning("MarketplaceService not registered (enter Play mode)."); return; }
            var sw = Stopwatch.StartNew();
            for (int i = 0; i < 500; i++)
            {
                svc.ListItem("metal_scraps", 1, 10 + i);
            }
            sw.Stop();
            UnityEngine.Debug.Log($"[Harness] Spawned 500 listings in {sw.ElapsedMilliseconds}ms");
        }

        [MenuItem("ZedIdler/Performance Harness/Clear All Caches")]
        public static void ClearAll()
        {
            var art = ServiceLocator.Get<IArtGenerationService>();
            art?.ClearCache();
            UnityEngine.Debug.Log("[Harness] Caches cleared.");
        }

        [MenuItem("ZedIdler/Performance Harness/Profile Combat Tick (10s)")]
        public static void ProfileCombatTick()
        {
            UnityEngine.Debug.Log("[Harness] Open the Profiler window, then trigger a Wandering run. Tick interval should fire 1× per second, not per frame.");
        }
    }
}
#endif
