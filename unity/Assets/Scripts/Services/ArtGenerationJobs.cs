// Assets/Scripts/Services/ArtGenerationJobs.cs
// Burst-compatible job versions of the silhouette and grunge passes used by
// ArtGenerationService. Activated only when the com.unity.burst package is
// installed (see #if UNITY_BURST guard).
//
// Build & enable:
//   Window → Package Manager → "+" → Add package by name → com.unity.burst
//   then add UNITY_BURST to Player Settings → Scripting Define Symbols.
//
// Without the package, this file compiles to no-ops and ArtGenerationService
// continues to use its main-thread path.
#if UNITY_BURST
using Unity.Burst;
using Unity.Collections;
using Unity.Jobs;
using Unity.Mathematics;
using UnityEngine;

namespace ZedIdler.Services
{
    /// <summary>
    /// Parallel grunge speckle pass. Each thread darkens one pixel with a
    /// per-pixel seeded random falloff.
    /// </summary>
    [BurstCompile]
    public struct GrungeSpeckleJob : IJobParallelFor
    {
        public NativeArray<Color> Pixels;
        public int Width;
        public int Height;
        public Color GrungeColor;
        public float GrungeAlpha;
        public uint Seed;

        public void Execute(int idx)
        {
            // Deterministic hash per pixel.
            uint h = (uint)(idx + 0x9E3779B9) ^ Seed;
            h ^= h << 13; h ^= h >> 17; h ^= h << 5;
            float roll = (h & 0xFFFF) / (float)0xFFFF;
            if (roll > 0.06f) return; // ~6% pixels get a speckle

            Color c = Pixels[idx];
            float strength = roll * GrungeAlpha * 16f; // scale 0..GrungeAlpha
            Pixels[idx] = Color.Lerp(c, GrungeColor, strength);
        }
    }

    /// <summary>
    /// Parallel edge-vignette pass. Darkens pixels near the frame border.
    /// </summary>
    [BurstCompile]
    public struct EdgeVignetteJob : IJobParallelFor
    {
        public NativeArray<Color> Pixels;
        public int Width;
        public int Height;
        public Color GrungeColor;
        public int VignetteWidth;

        public void Execute(int idx)
        {
            int x = idx % Width;
            int y = idx / Width;
            int dist = math.min(math.min(x, Width - 1 - x), math.min(y, Height - 1 - y));
            if (dist >= VignetteWidth) return;
            float t = 1f - dist / (float)VignetteWidth;
            Pixels[idx] = Color.Lerp(Pixels[idx], GrungeColor, t * 0.55f);
        }
    }
}
#else
namespace ZedIdler.Services
{
    /// <summary>
    /// Placeholder when Unity Burst package is not installed. The
    /// <see cref="ArtGenerationService"/> falls back to its main-thread
    /// pixel loops when this file compiles to no-ops.
    /// </summary>
    internal static class ArtGenerationJobsPlaceholder { }
}
#endif
