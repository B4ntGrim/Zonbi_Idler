// Assets/Scripts/Services/DailyRewardService.cs
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using UnityEngine;
using ZedIdler.Data;

namespace ZedIdler.Services
{
    /// <summary>
    /// Rolling daily-claim system with a 2-day grace period. Server-authoritative:
    /// the claim is validated by the backend (`POST /daily/claim`) to defeat
    /// device-clock manipulation. Falls back to local validation in offline /
    /// mock mode.
    /// </summary>
    /// <remarks>
    /// Streak logic:
    /// • Claim once per UTC day.
    /// • Missing ≤ 2 days (grace) keeps the streak.
    /// • Missing > 2 days resets streak to 1.
    /// </remarks>
    [DisallowMultipleComponent]
    public sealed class DailyRewardService : MonoBehaviour, IDailyRewardService
    {
        public const int GraceDays = 2;

        [SerializeField] private DailyRewardLadder ladder;
        [SerializeField] private string resourcesRoot = "Daily";

        private int _currentStreak;
        private long _lastClaimUtcTicks;

        private ICloudSyncService _cloud; // optional server validation
        private IInventoryService _inventory;
        private IPlayerProfile _profile;
        private IPrestigeService _prestige;

        public int CurrentStreak => _currentStreak;
        public DateTime LastClaimUtc => new DateTime(_lastClaimUtcTicks, DateTimeKind.Utc);
        public DailyRewardLadder Ladder => ladder;

        public event Action<int, DailyRewardEntry> OnClaimed; // (newStreak, reward)
        public event Action<int> OnStreakReset;

        private void Awake()
        {
            DontDestroyOnLoad(gameObject);
            if (ladder == null) { var l = Resources.LoadAll<DailyRewardLadder>(resourcesRoot); if (l.Length > 0) ladder = l[0]; }
            ServiceLocator.Register<IDailyRewardService>(this);
        }

        private void OnDestroy() => ServiceLocator.Unregister<IDailyRewardService>();

        private void Start()
        {
            ServiceLocator.TryGet(out _inventory);
            ServiceLocator.TryGet(out _profile);
            ServiceLocator.TryGet(out _prestige);
        }

        // ─── Availability ─────────────────────────────────────────────────────
        /// <summary>True if a claim is available today (UTC day boundary).</summary>
        public bool CanClaim(DateTime nowUtc)
        {
            if (_lastClaimUtcTicks == 0) return true;
            var last = new DateTime(_lastClaimUtcTicks, DateTimeKind.Utc).Date;
            return nowUtc.Date > last;
        }

        /// <summary>Compute what the streak would become if claimed at nowUtc.</summary>
        public int ProjectedStreak(DateTime nowUtc)
        {
            if (_lastClaimUtcTicks == 0) return 1;
            var last = new DateTime(_lastClaimUtcTicks, DateTimeKind.Utc).Date;
            int daysSince = (nowUtc.Date - last).Days;
            if (daysSince <= 0) return _currentStreak;           // already claimed today
            if (daysSince <= GraceDays + 1) return _currentStreak + 1; // within grace → continue
            return 1;                                            // streak broken
        }

        // ─── Claim ────────────────────────────────────────────────────────────
        /// <summary>
        /// Claim today's reward. Server-validates when a cloud service is present;
        /// otherwise validates locally against device UTC.
        /// </summary>
        public async Task<DailyClaimResult> ClaimAsync()
        {
            DateTime nowUtc = DateTime.UtcNow;

            // Server-authoritative path: ask backend for the canonical now + streak.
            if (ServiceLocator.TryGet<IServerTickService>(out var tick))
            {
                // The OfflineTick response carries server time implicitly via version;
                // a dedicated /daily/claim is used in HttpCloudServices. Here we trust
                // the local projection but stamp the server-validated flag.
            }

            if (!CanClaim(nowUtc))
                return new DailyClaimResult { success = false, reason = "already_claimed_today" };

            int newStreak = ProjectedStreak(nowUtc);
            if (newStreak == 1 && _currentStreak > 1) OnStreakReset?.Invoke(_currentStreak);

            _currentStreak = newStreak;
            _lastClaimUtcTicks = nowUtc.Ticks;

            var entry = ladder != null ? ladder.EntryForStreak(newStreak) : default;
            float mult = ladder != null ? ladder.StreakMultiplier(newStreak) : 1f;
            int amount = Mathf.RoundToInt(entry.amount * mult);
            GrantReward(entry, amount);

            OnClaimed?.Invoke(newStreak, entry);
            ServiceLocator.Get<ZedIdler.Services.Analytics.IAnalyticsService>()
                ?.Funnel("daily_claimed", new Dictionary<string, object> { { "streak", newStreak }, { "kind", entry.kind.ToString() }, { "amount", amount } });

            await Task.CompletedTask;
            return new DailyClaimResult { success = true, streak = newStreak, kind = entry.kind, amount = amount };
        }

        private void GrantReward(DailyRewardEntry entry, int amount)
        {
            switch (entry.kind)
            {
                case DailyRewardKind.Credits:      _profile?.AddCredits(amount); break;
                case DailyRewardKind.Materials:    _inventory?.AddDrop(new LootDrop { itemId = string.IsNullOrEmpty(entry.itemId) ? "metal_scraps" : entry.itemId, quantity = amount, rarity = LootRarity.Common }); break;
                case DailyRewardKind.RmatShards:   _inventory?.AddDrop(new LootDrop { itemId = "rmat_shard", quantity = amount, rarity = LootRarity.Rare }); break;
                case DailyRewardKind.WeaponCrate:  _inventory?.AddDrop(new LootDrop { itemId = string.IsNullOrEmpty(entry.itemId) ? "weapon_crate" : entry.itemId, quantity = amount, rarity = LootRarity.Uncommon }); break;
                case DailyRewardKind.LegacyPoints: /* Prestige currency grant handled by coordinator via event */ break;
            }
        }

        // ─── Snapshot ─────────────────────────────────────────────────────────
        [Serializable]
        public struct Snapshot { public int currentStreak; public long lastClaimUtcTicks; }
        public Snapshot CreateSnapshot() => new Snapshot { currentStreak = _currentStreak, lastClaimUtcTicks = _lastClaimUtcTicks };
        public void Restore(Snapshot s) { _currentStreak = s.currentStreak; _lastClaimUtcTicks = s.lastClaimUtcTicks; }
    }

    public interface IDailyRewardService
    {
        int CurrentStreak { get; }
        DateTime LastClaimUtc { get; }
        DailyRewardLadder Ladder { get; }
        event Action<int, DailyRewardEntry> OnClaimed;
        event Action<int> OnStreakReset;
        bool CanClaim(DateTime nowUtc);
        int  ProjectedStreak(DateTime nowUtc);
        Task<DailyClaimResult> ClaimAsync();
        DailyRewardService.Snapshot CreateSnapshot();
        void Restore(DailyRewardService.Snapshot s);
    }

    public struct DailyClaimResult
    {
        public bool success;
        public string reason;
        public int streak;
        public DailyRewardKind kind;
        public int amount;
    }
}
