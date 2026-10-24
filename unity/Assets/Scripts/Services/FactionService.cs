// Assets/Scripts/Services/FactionService.cs
using System;
using System.Collections.Generic;
using UnityEngine;
using ZedIdler.Data;

namespace ZedIdler.Services
{
    /// <summary>
    /// Runtime reputation tracker. The player has an INDEPENDENT reputation
    /// score with every faction. Completing contracts for a faction adjusts
    /// its rep up AND reduces rep with each of its static rivals.
    /// </summary>
    /// <remarks>
    /// • Reputation range: any int (can go negative). Ranks are computed by
    ///   <see cref="GetRankIndex"/> using the global thresholds below.
    /// • Implements <see cref="IFactionReputationProvider"/> for the Marketplace
    ///   discount: returns the HIGHEST current rank across all factions.
    /// </remarks>
    [DisallowMultipleComponent]
    public sealed class FactionService : MonoBehaviour, IFactionService, IFactionReputationProvider
    {
        public static readonly string[] Ranks =
            { "Stranger", "Neutral", "Known", "Allied", "Trusted", "Honored", "Venerated" };
        public static readonly int[] Thresholds =
            { 0, 100, 250, 500, 900, 1500, 2500 };

        [Header("Rival Reputation Penalty")]
        [Tooltip("When the player gains +X rep with a faction, each rival loses (X × penaltyRatio).")]
        [SerializeField, Range(0f, 1f)] private float rivalPenaltyRatio = 0.5f;

        [Header("Contract Reputation Awards (designer-tunable)")]
        [SerializeField, Range(1, 1000)] private int contractCompletionReward = 50;
        [SerializeField, Range(1, 1000)] private int contractFailurePenalty   = 30;
        [SerializeField, Range(1, 1000)] private int rescueInTerritoryReward  = 75;
        [SerializeField, Range(1, 1000)] private int factionEnemyKillReward   = 5;

        private ICatalogService _catalog;
        private readonly Dictionary<string, int> _reputation = new Dictionary<string, int>();

        public IReadOnlyDictionary<string, int> Reputation => _reputation;
        public IReadOnlyList<Faction> Factions
        {
            get
            {
                if (_catalog == null) ServiceLocator.TryGet(out _catalog);
                return _catalog is IFactionCatalogProvider fcp ? fcp.GetAllFactions() : Array.Empty<Faction>();
            }
        }

        // ─── Events ───────────────────────────────────────────────────────────
        public event Action<string, int, int> OnReputationChanged; // (factionId, oldRep, newRep)
        public event Action<string, int>      OnRankChanged;        // (factionId, newRankIndex)

        // ─── Lifecycle ────────────────────────────────────────────────────────
        private void Awake()
        {
            DontDestroyOnLoad(gameObject);
            ServiceLocator.Register<IFactionService>(this);
            ServiceLocator.Register<IFactionReputationProvider>(this);
        }

        private void OnDestroy()
        {
            ServiceLocator.Unregister<IFactionService>();
            ServiceLocator.Unregister<IFactionReputationProvider>();
        }

        private void Start()
        {
            ServiceLocator.TryGet(out _catalog);
            SeedBaseReputation();
        }

        private void SeedBaseReputation()
        {
            var factions = Factions;
            if (factions == null) return;
            for (int i = 0; i < factions.Count; i++)
            {
                var f = factions[i];
                if (f == null || string.IsNullOrEmpty(f.FactionId)) continue;
                if (!_reputation.ContainsKey(f.FactionId))
                    _reputation[f.FactionId] = f.BaseReputation;
            }
        }

        // ─── Public API ───────────────────────────────────────────────────────
        public int GetReputation(string factionId)
        {
            if (string.IsNullOrEmpty(factionId)) return 0;
            return _reputation.TryGetValue(factionId, out var r) ? r : 0;
        }

        public int GetRankIndex(string factionId)
        {
            int rep = GetReputation(factionId);
            int rank = 0;
            for (int i = Thresholds.Length - 1; i >= 0; i--)
            {
                if (rep >= Thresholds[i]) { rank = i; break; }
            }
            return rank;
        }

        public string GetRankName(string factionId) => Ranks[GetRankIndex(factionId)];

        public int GetReputationToNextRank(string factionId)
        {
            int rank = GetRankIndex(factionId);
            if (rank >= Thresholds.Length - 1) return 0;
            return Thresholds[rank + 1] - GetReputation(factionId);
        }

        /// <summary>
        /// Adjust reputation directly. Applies rival penalties automatically when
        /// <paramref name="propagateToRivals"/> is true (default for contracts).
        /// </summary>
        public void AdjustReputation(string factionId, int delta, bool propagateToRivals = true)
        {
            if (string.IsNullOrEmpty(factionId) || delta == 0) return;
            ApplyDelta(factionId, delta);

            if (!propagateToRivals || delta <= 0) return;
            var faction = ResolveFaction(factionId);
            if (faction == null) return;
            int penalty = -Mathf.RoundToInt(delta * rivalPenaltyRatio);
            if (penalty == 0) return;
            foreach (var rivalId in faction.RivalFactionIds)
            {
                if (!string.IsNullOrEmpty(rivalId)) ApplyDelta(rivalId, penalty);
            }
        }

        private void ApplyDelta(string factionId, int delta)
        {
            int old = GetReputation(factionId);
            int next = old + delta;
            _reputation[factionId] = next;
            OnReputationChanged?.Invoke(factionId, old, next);
            int oldRank = ComputeRank(old), newRank = ComputeRank(next);
            if (oldRank != newRank) OnRankChanged?.Invoke(factionId, newRank);
        }

        private static int ComputeRank(int rep)
        {
            for (int i = Thresholds.Length - 1; i >= 0; i--)
                if (rep >= Thresholds[i]) return i;
            return 0;
        }

        // ─── Hooks for other systems ──────────────────────────────────────────
        public void OnContractCompleted(string factionId) =>
            AdjustReputation(factionId, contractCompletionReward, propagateToRivals: true);

        public void OnContractFailed(string factionId) =>
            AdjustReputation(factionId, -contractFailurePenalty, propagateToRivals: false);

        public void OnRescueCompletedInTerritory(string factionId) =>
            AdjustReputation(factionId, rescueInTerritoryReward, propagateToRivals: true);

        public void OnFactionEnemyKilled(string factionId) =>
            AdjustReputation(factionId, factionEnemyKillReward, propagateToRivals: false);

        /// <summary>Wipe all faction reputation (optional prestige reset path).</summary>
        public void ResetAllReputation()
        {
            var keys = new System.Collections.Generic.List<string>(_reputation.Keys);
            foreach (var id in keys)
            {
                int old = _reputation[id];
                _reputation[id] = 0;
                if (old != 0) OnReputationChanged?.Invoke(id, old, 0);
            }
        }

        // ─── IFactionReputationProvider ───────────────────────────────────────
        /// <summary>
        /// Highest current rank across all factions — used by the marketplace
        /// to compute the player's best available faction discount.
        /// </summary>
        public int GetAlignedFactionRank()
        {
            int best = 0;
            foreach (var kv in _reputation)
            {
                int rank = ComputeRank(kv.Value);
                if (rank > best) best = rank;
            }
            return best;
        }

        // ─── Snapshot ─────────────────────────────────────────────────────────
        [Serializable]
        public struct Snapshot
        {
            public FactionRepEntry[] reputation;
        }

        [Serializable]
        public struct FactionRepEntry
        {
            public string factionId;
            public int reputation;
        }

        public Snapshot CreateSnapshot()
        {
            var entries = new FactionRepEntry[_reputation.Count];
            int i = 0;
            foreach (var kv in _reputation)
                entries[i++] = new FactionRepEntry { factionId = kv.Key, reputation = kv.Value };
            return new Snapshot { reputation = entries };
        }

        public void Restore(Snapshot snap)
        {
            _reputation.Clear();
            if (snap.reputation == null) return;
            for (int i = 0; i < snap.reputation.Length; i++)
            {
                var e = snap.reputation[i];
                if (!string.IsNullOrEmpty(e.factionId)) _reputation[e.factionId] = e.reputation;
            }
        }

        private Faction ResolveFaction(string factionId)
        {
            if (_catalog is IFactionCatalogProvider fcp) return fcp.GetFaction(factionId);
            var all = Factions;
            for (int i = 0; i < all.Count; i++)
                if (all[i] != null && all[i].FactionId == factionId) return all[i];
            return null;
        }
    }

    public interface IFactionService
    {
        IReadOnlyDictionary<string, int> Reputation { get; }
        IReadOnlyList<Faction> Factions { get; }

        event Action<string, int, int> OnReputationChanged;
        event Action<string, int>      OnRankChanged;

        int GetReputation(string factionId);
        int GetRankIndex(string factionId);
        string GetRankName(string factionId);
        int GetReputationToNextRank(string factionId);

        void AdjustReputation(string factionId, int delta, bool propagateToRivals = true);
        void OnContractCompleted(string factionId);
        void OnContractFailed(string factionId);
        void OnRescueCompletedInTerritory(string factionId);
        void OnFactionEnemyKilled(string factionId);
        void ResetAllReputation();

        FactionService.Snapshot CreateSnapshot();
        void Restore(FactionService.Snapshot snap);
    }

    /// <summary>Catalog extension contract for resolving Faction assets by id.</summary>
    public interface IFactionCatalogProvider
    {
        Faction GetFaction(string factionId);
        IReadOnlyList<Faction> GetAllFactions();
    }
}
