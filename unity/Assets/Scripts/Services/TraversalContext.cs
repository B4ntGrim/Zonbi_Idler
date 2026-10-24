// Assets/Scripts/Services/TraversalContext.cs
using System;
using System.Collections.Generic;
using UnityEngine;
using ZedIdler.Data;

namespace ZedIdler.Services
{
    /// <summary>
    /// Holds the player's currently-selected zone on the satellite grid. Every
    /// system that needs to know "where the survivor is operating" reads this:
    /// • <see cref="ZedIdler.Systems.WanderingSceneController"/> for biome filters.
    /// • <see cref="ZedIdler.Systems.RuntimeZombieSpawner"/> for spawn-pool selection.
    /// • Future: traversal travel timers, faction control, contract destinations.
    /// </summary>
    /// <remarks>
    /// The satellite grid is a top-down 2D matrix of <see cref="ZoneCell"/>s. Each
    /// cell has biome, threat, and a discovered/cleared/contested flag. This service
    /// owns the cells, exposes lookup/iteration, and broadcasts changes when the
    /// player drills in or completes a clear.
    ///
    /// The cells are procedurally generated at first launch (seeded by save) and
    /// persisted via <see cref="Snapshot"/> so the player's map stays consistent
    /// across sessions.
    /// </remarks>
    [DisallowMultipleComponent]
    public sealed class TraversalContext : MonoBehaviour, ITraversalContext
    {
        [Header("Grid")]
        [SerializeField, Range(4, 32)] private int gridWidth  = 8;
        [SerializeField, Range(4, 32)] private int gridHeight = 8;
        [Tooltip("Deterministic seed. 0 = random. Use a fixed value to share maps across players.")]
        [SerializeField] private int worldSeed = 0;

        [Header("Biome Distribution (sum should equal 1.0)")]
        [SerializeField, Range(0f, 1f)] private float pctMountain  = 0.20f;
        [SerializeField, Range(0f, 1f)] private float pctSuburbia  = 0.40f;
        [SerializeField, Range(0f, 1f)] private float pctMetro     = 0.30f;
        [SerializeField, Range(0f, 1f)] private float pctPerimeter = 0.10f;

        [Header("Defaults")]
        [SerializeField] private BiomeTag defaultBiome = BiomeTag.Suburbia;

        // ─── Runtime state ────────────────────────────────────────────────────
        private ZoneCell[,] _cells;
        private string _currentZoneId;
        private BiomeTag _currentBiome;

        public BiomeTag CurrentBiome => _currentBiome;
        public string   CurrentZoneId => _currentZoneId;
        public int GridWidth  => gridWidth;
        public int GridHeight => gridHeight;

        public event Action<BiomeTag> OnBiomeChanged;
        public event Action<ZoneCell> OnZoneSelected;
        public event Action<ZoneCell> OnZoneCleared;

        // ─── Lifecycle ────────────────────────────────────────────────────────
        private void Awake()
        {
            DontDestroyOnLoad(gameObject);
            _currentBiome = defaultBiome;
            GenerateGrid();
            ServiceLocator.Register<ITraversalContext>(this);
        }

        private void OnDestroy() => ServiceLocator.Unregister<ITraversalContext>();

        // ─── Public API ───────────────────────────────────────────────────────
        public ZoneCell GetCell(int x, int y)
        {
            if (x < 0 || y < 0 || x >= gridWidth || y >= gridHeight) return default;
            return _cells[x, y];
        }

        public IEnumerable<ZoneCell> AllCells()
        {
            for (int y = 0; y < gridHeight; y++)
                for (int x = 0; x < gridWidth; x++)
                    yield return _cells[x, y];
        }

        /// <summary>Player tapped a square on the satellite grid.</summary>
        public bool SelectZone(int x, int y)
        {
            if (x < 0 || y < 0 || x >= gridWidth || y >= gridHeight) return false;
            var cell = _cells[x, y];
            if (cell.state == ZoneState.Locked) return false;

            _currentZoneId = cell.zoneId;
            if (cell.biome != _currentBiome)
            {
                _currentBiome = cell.biome;
                OnBiomeChanged?.Invoke(_currentBiome);
            }
            OnZoneSelected?.Invoke(cell);
            return true;
        }

        public bool SelectZoneById(string zoneId)
        {
            for (int y = 0; y < gridHeight; y++)
                for (int x = 0; x < gridWidth; x++)
                    if (_cells[x, y].zoneId == zoneId) return SelectZone(x, y);
            return false;
        }

        /// <summary>Mark current zone as cleared (called by combat or contract resolution).</summary>
        public bool MarkCleared(string zoneId)
        {
            for (int y = 0; y < gridHeight; y++)
                for (int x = 0; x < gridWidth; x++)
                {
                    if (_cells[x, y].zoneId == zoneId)
                    {
                        var c = _cells[x, y];
                        c.state = ZoneState.Cleared;
                        _cells[x, y] = c;
                        OnZoneCleared?.Invoke(c);
                        return true;
                    }
                }
            return false;
        }

        // ─── Procedural generation ────────────────────────────────────────────
        private void GenerateGrid()
        {
            int seed = worldSeed != 0 ? worldSeed : Environment.TickCount;
            var rng = new System.Random(seed);
            _cells = new ZoneCell[gridWidth, gridHeight];

            // Normalize biome weights.
            float total = pctMountain + pctSuburbia + pctMetro + pctPerimeter;
            if (total <= 0f) total = 1f;
            float wM = pctMountain / total, wS = pctSuburbia / total,
                  wC = pctMetro / total,    wP = pctPerimeter / total;

            for (int y = 0; y < gridHeight; y++)
            for (int x = 0; x < gridWidth; x++)
            {
                float roll = (float)rng.NextDouble();
                BiomeTag b;
                if (roll < wM) b = BiomeTag.Mountain;
                else if (roll < wM + wS) b = BiomeTag.Suburbia;
                else if (roll < wM + wS + wC) b = BiomeTag.Metro;
                else b = BiomeTag.Perimeter;

                int threat = ThreatForBiome(b, rng);
                bool locked = (b == BiomeTag.Perimeter) && rng.NextDouble() < 0.4;

                _cells[x, y] = new ZoneCell
                {
                    zoneId = $"Z_{x}_{y}",
                    gridX = x, gridY = y,
                    biome = b,
                    threatLevel = threat,
                    state = locked ? ZoneState.Locked : ZoneState.Undiscovered
                };
            }
        }

        private static int ThreatForBiome(BiomeTag b, System.Random rng)
        {
            switch (b)
            {
                case BiomeTag.Mountain:  return 1 + rng.Next(0, 2);
                case BiomeTag.Suburbia:  return 2 + rng.Next(0, 2);
                case BiomeTag.Metro:     return 3 + rng.Next(0, 2);
                case BiomeTag.Perimeter: return 4 + rng.Next(0, 2);
                default: return 1;
            }
        }

        // ─── Snapshot ─────────────────────────────────────────────────────────
        [Serializable]
        public struct Snapshot
        {
            public int width;
            public int height;
            public string currentZoneId;
            public BiomeTag currentBiome;
            public ZoneCell[] cells; // row-major
        }

        public Snapshot CreateSnapshot()
        {
            var arr = new ZoneCell[gridWidth * gridHeight];
            for (int y = 0; y < gridHeight; y++)
                for (int x = 0; x < gridWidth; x++)
                    arr[y * gridWidth + x] = _cells[x, y];
            return new Snapshot
            {
                width = gridWidth, height = gridHeight,
                currentZoneId = _currentZoneId,
                currentBiome  = _currentBiome,
                cells = arr
            };
        }

        public void Restore(Snapshot s)
        {
            if (s.cells == null || s.width <= 0 || s.height <= 0) return;
            gridWidth = s.width; gridHeight = s.height;
            _cells = new ZoneCell[gridWidth, gridHeight];
            for (int y = 0; y < gridHeight; y++)
                for (int x = 0; x < gridWidth; x++)
                    _cells[x, y] = s.cells[y * gridWidth + x];
            _currentZoneId = s.currentZoneId;
            _currentBiome  = s.currentBiome;
        }

        /// <summary>Regenerate the grid at a new size (e.g. mid-game expansion).</summary>
        public void RegenerateAtSize(int newWidth, int newHeight, int? seed = null)
        {
            gridWidth  = Mathf.Clamp(newWidth, 4, 32);
            gridHeight = Mathf.Clamp(newHeight, 4, 32);
            if (seed.HasValue) worldSeed = seed.Value;
            _currentZoneId = null;
            GenerateGrid();
            OnBiomeChanged?.Invoke(_currentBiome);
        }
    }

    /// <summary>One square on the satellite grid.</summary>
    [Serializable]
    public struct ZoneCell
    {
        public string zoneId;
        public int gridX, gridY;
        public BiomeTag biome;
        public int threatLevel;
        public ZoneState state;
    }

    public enum ZoneState
    {
        Undiscovered = 0,
        Available    = 1,
        Cleared      = 2,
        Contested    = 3,
        Locked       = 4
    }
}
