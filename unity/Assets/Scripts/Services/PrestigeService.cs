// Assets/Scripts/Services/PrestigeService.cs
using System;
using System.Collections.Generic;
using UnityEngine;
using ZedIdler.Data;

namespace ZedIdler.Services
{
    /// <summary>
    /// Prestige meta-progression. On reset: wipes camp level + survivors +
    /// inventory (soft progression), awards Legacy Points by a sqrt curve, and
    /// keeps prestige currency + purchased permanent upgrades + tier rank.
    /// </summary>
    /// <remarks>
    /// Earn formula (sqrt — diminishing but always positive):
    ///   LegacyPoints = floor( K × sqrt(totalCampXp / D) )
    /// K and D are tunable via BalanceRuntime (PrestigeK / PrestigeD).
    ///
    /// Effect multipliers from purchased upgrades are queried by gameplay
    /// systems through <see cref="GetEffectMultiplier"/> (1.0 + sum of levels).
    /// </remarks>
    [DisallowMultipleComponent]
    public sealed class PrestigeService : MonoBehaviour, IPrestigeService
    {
        [SerializeField] private PrestigeUpgrade[] upgrades;
        [SerializeField] private PrestigeTierLadder tierLadder;
        [SerializeField] private string resourcesRoot = "Prestige";

        private readonly Dictionary<string, PrestigeUpgrade> _upgradeById = new();
        private readonly Dictionary<string, int> _purchasedLevels = new();

        private long _legacyPoints;        // spendable
        private long _lifetimeLegacyPoints;// for tier rank
        private int _prestigeCount;

        private IPlayerProfile _profile;
        private IAnalyticsServiceRef _analytics; // lightweight indirection

        public long LegacyPoints        => _legacyPoints;
        public long LifetimeLegacyPoints=> _lifetimeLegacyPoints;
        public int  PrestigeCount       => _prestigeCount;
        public IReadOnlyList<PrestigeUpgrade> Upgrades => upgrades;
        public PrestigeTierLadder TierLadder => tierLadder;

        public event Action<long> OnLegacyPointsChanged;
        public event Action<long> OnPrestiged;            // points awarded
        public event Action<string, int> OnUpgradePurchased; // (id, newLevel)
        public event Action<int> OnTierChanged;

        private void Awake()
        {
            DontDestroyOnLoad(gameObject);
            if (upgrades == null || upgrades.Length == 0) upgrades = Resources.LoadAll<PrestigeUpgrade>(resourcesRoot);
            if (tierLadder == null) { var l = Resources.LoadAll<PrestigeTierLadder>(resourcesRoot); if (l.Length > 0) tierLadder = l[0]; }
            foreach (var u in upgrades ?? Array.Empty<PrestigeUpgrade>())
                if (u != null && !string.IsNullOrEmpty(u.UpgradeId)) _upgradeById[u.UpgradeId] = u;
            ServiceLocator.Register<IPrestigeService>(this);
        }

        private void OnDestroy() => ServiceLocator.Unregister<IPrestigeService>();

        private void Start()
        {
            ServiceLocator.TryGet(out _profile);
        }

        // ─── Prestige availability + reset ────────────────────────────────────
        public int GateCampLevel => BalanceRuntime.PrestigeGateCampLevel;

        public bool CanPrestige()
        {
            if (_profile == null) ServiceLocator.TryGet(out _profile);
            return _profile != null && _profile.CampLevel >= GateCampLevel;
        }

        /// <summary>Preview Legacy Points for a given total camp XP without resetting.</summary>
        public long PreviewLegacyPoints(long totalCampXp)
        {
            float k = BalanceRuntime.PrestigeK;
            float d = Mathf.Max(1f, BalanceRuntime.PrestigeD);
            return (long)Mathf.Floor(k * Mathf.Sqrt(totalCampXp / d));
        }

        /// <summary>
        /// Execute prestige. Caller is responsible for actually wiping camp /
        /// survivors / inventory via their respective services after this returns
        /// the awarded points (we fire OnPrestiged so a coordinator can do it).
        /// </summary>
        public long Prestige(long totalCampXp)
        {
            if (!CanPrestige()) return 0;
            long awarded = PreviewLegacyPoints(totalCampXp);
            _legacyPoints += awarded;
            _lifetimeLegacyPoints += awarded;
            _prestigeCount++;

            OnLegacyPointsChanged?.Invoke(_legacyPoints);
            OnPrestiged?.Invoke(awarded);
            CheckTier();

            ServiceLocator.Get<ZedIdler.Services.Analytics.IAnalyticsService>()
                ?.Progression("prestige_reset", new Dictionary<string, object>
                {
                    { "awarded", awarded }, { "count", _prestigeCount }, { "lifetime", _lifetimeLegacyPoints }
                });
            return awarded;
        }

        // ─── Upgrades ─────────────────────────────────────────────────────────
        public int GetUpgradeLevel(string upgradeId)
            => _purchasedLevels.TryGetValue(upgradeId, out var lvl) ? lvl : 0;

        public bool PurchaseUpgrade(string upgradeId)
        {
            if (!_upgradeById.TryGetValue(upgradeId, out var u)) return false;
            int current = GetUpgradeLevel(upgradeId);
            if (current >= u.MaxLevel) return false;
            int cost = u.CostForLevel(current);
            if (_legacyPoints < cost) return false;
            _legacyPoints -= cost;
            _purchasedLevels[upgradeId] = current + 1;
            OnLegacyPointsChanged?.Invoke(_legacyPoints);
            OnUpgradePurchased?.Invoke(upgradeId, current + 1);
            return true;
        }

        /// <summary>Aggregate multiplier for an effect key across all purchased upgrades. Returns 1.0 + sum.</summary>
        public float GetEffectMultiplier(string effectKey)
        {
            float total = 1f;
            foreach (var kv in _purchasedLevels)
            {
                if (!_upgradeById.TryGetValue(kv.Key, out var u)) continue;
                if (u.EffectKey == effectKey) total += u.TotalEffectAt(kv.Value);
            }
            return total;
        }

        /// <summary>
        /// Flat additive total for a key (NOT folded as a multiplier). Use for
        /// upgrades whose EffectPerLevel is an absolute amount, e.g. start_credits
        /// granting +250 per level. Returns the raw sum of (perLevel × level).
        /// </summary>
        public float GetEffectFlatTotal(string effectKey)
        {
            float total = 0f;
            foreach (var kv in _purchasedLevels)
            {
                if (!_upgradeById.TryGetValue(kv.Key, out var u)) continue;
                if (u.EffectKey == effectKey) total += u.TotalEffectAt(kv.Value);
            }
            return total;
        }

        public int CurrentTierIndex => tierLadder != null ? tierLadder.CurrentTierIndex(_lifetimeLegacyPoints) : 0;
        public string CurrentTierName => tierLadder != null && tierLadder.Tiers.Length > 0
            ? tierLadder.Tiers[Mathf.Clamp(CurrentTierIndex, 0, tierLadder.Tiers.Length - 1)].tierName : "Survivor";

        private int _lastTierIndex = -1;
        private void CheckTier()
        {
            int idx = CurrentTierIndex;
            if (idx != _lastTierIndex) { _lastTierIndex = idx; OnTierChanged?.Invoke(idx); }
        }

        // ─── Snapshot ─────────────────────────────────────────────────────────
        [Serializable]
        public struct Snapshot
        {
            public long legacyPoints;
            public long lifetimeLegacyPoints;
            public int prestigeCount;
            public UpgradeEntry[] upgrades;
        }
        [Serializable] public struct UpgradeEntry { public string id; public int level; }

        public Snapshot CreateSnapshot()
        {
            var arr = new UpgradeEntry[_purchasedLevels.Count];
            int i = 0; foreach (var kv in _purchasedLevels) arr[i++] = new UpgradeEntry { id = kv.Key, level = kv.Value };
            return new Snapshot { legacyPoints = _legacyPoints, lifetimeLegacyPoints = _lifetimeLegacyPoints, prestigeCount = _prestigeCount, upgrades = arr };
        }

        public void Restore(Snapshot s)
        {
            _legacyPoints = s.legacyPoints;
            _lifetimeLegacyPoints = s.lifetimeLegacyPoints;
            _prestigeCount = s.prestigeCount;
            _purchasedLevels.Clear();
            if (s.upgrades != null) foreach (var e in s.upgrades) if (!string.IsNullOrEmpty(e.id)) _purchasedLevels[e.id] = e.level;
            _lastTierIndex = CurrentTierIndex;
        }

        // marker interface to avoid hard analytics dependency at compile time
        private interface IAnalyticsServiceRef { }
    }

    public interface IPrestigeService
    {
        long LegacyPoints { get; }
        long LifetimeLegacyPoints { get; }
        int  PrestigeCount { get; }
        int  GateCampLevel { get; }
        IReadOnlyList<PrestigeUpgrade> Upgrades { get; }
        PrestigeTierLadder TierLadder { get; }
        int CurrentTierIndex { get; }
        string CurrentTierName { get; }

        event Action<long> OnLegacyPointsChanged;
        event Action<long> OnPrestiged;
        event Action<string, int> OnUpgradePurchased;
        event Action<int> OnTierChanged;

        bool CanPrestige();
        long PreviewLegacyPoints(long totalCampXp);
        long Prestige(long totalCampXp);
        int  GetUpgradeLevel(string upgradeId);
        bool PurchaseUpgrade(string upgradeId);
        float GetEffectMultiplier(string effectKey);
        float GetEffectFlatTotal(string effectKey);
        PrestigeService.Snapshot CreateSnapshot();
        void Restore(PrestigeService.Snapshot s);
    }
}
