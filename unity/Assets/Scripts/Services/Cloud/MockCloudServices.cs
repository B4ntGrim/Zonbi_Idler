// Assets/Scripts/Services/Cloud/MockCloudServices.cs
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using UnityEngine;

namespace ZedIdler.Services.Cloud
{
    /// <summary>
    /// In-memory / PlayerPrefs-backed mock implementations of every cloud
    /// service. Lets the game run end-to-end with the cloud architecture in
    /// place before the real serverless backend (C# Lambda/Functions) is built.
    /// Swap these out for HTTP-backed implementations without touching callers.
    /// </summary>
    [DisallowMultipleComponent]
    public sealed class MockCloudServices : MonoBehaviour,
        IAuthService, ISessionLockService, ICloudSyncService, IServerTickService, IQuotaService
    {
        [Header("Mock Tuning")]
        [SerializeField] private float simulatedLatencyMs = 120f;
        [SerializeField] private bool simulateSessionContention = false;
        [SerializeField, Range(1f, 168f)] private float dailyOfflineCapHours = 24f;
        [SerializeField, Range(1f, 60f)] private float leaseSeconds = 30f;

        // ─── Mock persistence (PlayerPrefs keys) ──────────────────────────────
        private const string K_DEVICE = "cloud_device_id";
        private const string K_PLAYER = "cloud_player_id";
        private const string K_SNAPSHOT = "cloud_snapshot_b64";
        private const string K_VERSION  = "cloud_version";
        private const string K_QUOTA_SEC = "cloud_quota_seconds";
        private const string K_QUOTA_RESET = "cloud_quota_reset_ticks";

        private byte[] _remoteData;
        private long _remoteVersion;
        private double _quotaSecondsToday;
        private DateTime _quotaResetUtc;

        // ─── IAuthService ─────────────────────────────────────────────────────
        public bool IsAuthenticated { get; private set; }
        public string PlayerId { get; private set; }
        public string DeviceId { get; private set; }
        public event Action<string> OnAuthenticated;
        public event Action OnSignedOut;

        public bool HoldsLock { get; private set; }
        public DateTime LeaseExpiresUtc { get; private set; }
        public event Action OnLockAcquired;
        public event Action<string> OnLockLost;

        public long LocalVersion { get; private set; }
        public long RemoteVersion => _remoteVersion;
        public DateTime LastSyncUtc { get; private set; }
        public event Action<long> OnUploaded;
        public event Action<long, byte[]> OnDownloaded;
        public event Action<CloudErrorCode, string> OnSyncFailed;

        public TimeSpan OfflineProgressCreditedToday => TimeSpan.FromSeconds(_quotaSecondsToday);
        public TimeSpan DailyOfflineCap => TimeSpan.FromHours(dailyOfflineCapHours);
        public TimeSpan RemainingCredit => DailyOfflineCap - OfflineProgressCreditedToday;
        public bool IsExhausted => RemainingCredit <= TimeSpan.Zero;
        public DateTime RollingWindowResetUtc => _quotaResetUtc;
        public event Action<TimeSpan> OnCreditConsumed;
        public event Action OnQuotaExhausted;

        private void Awake()
        {
            DontDestroyOnLoad(gameObject);
            DeviceId = PlayerPrefs.GetString(K_DEVICE, null);
            if (string.IsNullOrEmpty(DeviceId))
            {
                DeviceId = SystemInfo.deviceUniqueIdentifier + "_" + Guid.NewGuid().ToString("N").Substring(0, 6);
                PlayerPrefs.SetString(K_DEVICE, DeviceId);
            }
            _remoteVersion = (long)PlayerPrefs.GetInt(K_VERSION, 0);
            var b64 = PlayerPrefs.GetString(K_SNAPSHOT, null);
            if (!string.IsNullOrEmpty(b64)) _remoteData = Convert.FromBase64String(b64);
            _quotaSecondsToday = double.Parse(PlayerPrefs.GetString(K_QUOTA_SEC, "0"));
            long resetTicks = long.Parse(PlayerPrefs.GetString(K_QUOTA_RESET, "0"));
            _quotaResetUtc = resetTicks > 0 ? new DateTime(resetTicks, DateTimeKind.Utc) : DateTime.UtcNow.AddHours(dailyOfflineCapHours);

            ServiceLocator.Register<IAuthService>(this);
            ServiceLocator.Register<ISessionLockService>(this);
            ServiceLocator.Register<ICloudSyncService>(this);
            ServiceLocator.Register<IServerTickService>(this);
            ServiceLocator.Register<IQuotaService>(this);
        }

        private void OnDestroy()
        {
            ServiceLocator.Unregister<IAuthService>();
            ServiceLocator.Unregister<ISessionLockService>();
            ServiceLocator.Unregister<ICloudSyncService>();
            ServiceLocator.Unregister<IServerTickService>();
            ServiceLocator.Unregister<IQuotaService>();
        }

        private async Task Latency() => await Task.Delay((int)simulatedLatencyMs);

        // ─── IAuthService ─────────────────────────────────────────────────────
        public async Task<CloudResult<string>> SignInAnonymousAsync()
        {
            await Latency();
            PlayerId = PlayerPrefs.GetString(K_PLAYER, null);
            if (string.IsNullOrEmpty(PlayerId))
            {
                PlayerId = "player_" + Guid.NewGuid().ToString("N").Substring(0, 12);
                PlayerPrefs.SetString(K_PLAYER, PlayerId);
            }
            IsAuthenticated = true;
            OnAuthenticated?.Invoke(PlayerId);
            return CloudResult<string>.Ok(PlayerId);
        }

        public async Task<CloudResult<bool>> LinkAccountAsync(string email, string token)
        {
            await Latency();
            // Mock: pretend success and persist the email as a tag.
            PlayerPrefs.SetString("cloud_linked_email", email ?? "");
            return CloudResult<bool>.Ok(true);
        }

        public async Task SignOutAsync()
        {
            await Latency();
            IsAuthenticated = false;
            HoldsLock = false;
            OnSignedOut?.Invoke();
        }

        // ─── ISessionLockService ──────────────────────────────────────────────
        public async Task<CloudResult<bool>> AcquireAsync()
        {
            await Latency();
            if (simulateSessionContention)
                return CloudResult<bool>.Fail(CloudErrorCode.SessionLocked, "Another device holds the session.");
            HoldsLock = true;
            LeaseExpiresUtc = DateTime.UtcNow.AddSeconds(leaseSeconds);
            OnLockAcquired?.Invoke();
            return CloudResult<bool>.Ok(true);
        }

        public async Task<CloudResult<bool>> HeartbeatAsync()
        {
            await Latency();
            if (!HoldsLock) return CloudResult<bool>.Fail(CloudErrorCode.SessionLocked, "Lock not held.");
            LeaseExpiresUtc = DateTime.UtcNow.AddSeconds(leaseSeconds);
            return CloudResult<bool>.Ok(true);
        }

        public async Task ReleaseAsync()
        {
            await Latency();
            HoldsLock = false;
        }

        // ─── ICloudSyncService ────────────────────────────────────────────────
        public async Task<CloudResult<long>> UploadAsync(byte[] compressedJson, long localVersion)
        {
            await Latency();
            if (!HoldsLock) return CloudResult<long>.Fail(CloudErrorCode.SessionLocked, "No session lock.");
            if (localVersion < _remoteVersion)
                return CloudResult<long>.Fail(CloudErrorCode.Conflict, $"Remote v{_remoteVersion} > local v{localVersion}.");
            _remoteData = compressedJson;
            _remoteVersion = localVersion + 1;
            LocalVersion = _remoteVersion;
            LastSyncUtc = DateTime.UtcNow;
            PersistRemote();
            OnUploaded?.Invoke(_remoteVersion);
            return CloudResult<long>.Ok(_remoteVersion);
        }

        public async Task<CloudResult<(long, byte[])>> DownloadAsync()
        {
            await Latency();
            if (_remoteData == null)
                return CloudResult<(long, byte[])>.Fail(CloudErrorCode.NotFound, "No remote save.");
            LastSyncUtc = DateTime.UtcNow;
            OnDownloaded?.Invoke(_remoteVersion, _remoteData);
            return CloudResult<(long, byte[])>.Ok((_remoteVersion, _remoteData));
        }

        public async Task<CloudResult<long>> ResolveConflictAsync(ConflictResolution choice)
        {
            await Latency();
            // Mock: KeepRemote just bumps local to remote; KeepLocal force-overwrites.
            switch (choice)
            {
                case ConflictResolution.KeepRemote: LocalVersion = _remoteVersion; break;
                case ConflictResolution.KeepLocal:  _remoteVersion = LocalVersion; break;
                case ConflictResolution.Merge:      _remoteVersion = Math.Max(_remoteVersion, LocalVersion) + 1; break;
            }
            return CloudResult<long>.Ok(_remoteVersion);
        }

        // ─── IServerTickService ───────────────────────────────────────────────
        public async Task<CloudResult<ServerTickReport>> PullOfflineProgressAsync(DateTime lastSeenUtc)
        {
            await Latency();
            double elapsed = (DateTime.UtcNow - lastSeenUtc).TotalSeconds;
            if (elapsed < 0) elapsed = 0;

            // Apply 24h rolling cap (answer 7b/8a).
            RollWindowIfNeeded();
            double remaining = DailyOfflineCap.TotalSeconds - _quotaSecondsToday;
            bool capped = elapsed > remaining;
            double credited = Math.Max(0, Math.Min(elapsed, remaining));
            _quotaSecondsToday += credited;
            PersistQuota();
            if (credited > 0) OnCreditConsumed?.Invoke(TimeSpan.FromSeconds(credited));
            if (IsExhausted) OnQuotaExhausted?.Invoke();

            return CloudResult<ServerTickReport>.Ok(new ServerTickReport
            {
                serverVersion = _remoteVersion,
                reconciledSnapshot = _remoteData,
                offlineSecondsCredited = credited,
                quotaCapped = capped
            });
        }

        public async Task<CloudResult<CombatResolution>> SubmitCombatRunAsync(CombatRunRequest request)
        {
            await Latency();
            if (!HoldsLock) return CloudResult<CombatResolution>.Fail(CloudErrorCode.SessionLocked, "No session lock.");
            // Mock server-authoritative combat: deterministic-ish synthetic result.
            var rng = new System.Random((int)(request.clientNonce ^ (request.zoneId?.GetHashCode() ?? 0)));
            int kills = rng.Next(3, request.encounterLimit + 1);
            var lootIds = new List<string>();
            var lootQty = new List<int>();
            for (int i = 0; i < kills; i++)
            {
                lootIds.Add(i % 2 == 0 ? "metal_scraps" : "cloth_scraps");
                lootQty.Add(rng.Next(1, 4));
            }
            var lost = new List<string>();
            if (rng.NextDouble() < 0.08 && request.squadSurvivorIds.Length > 0)
                lost.Add(request.squadSurvivorIds[rng.Next(request.squadSurvivorIds.Length)]);

            return CloudResult<CombatResolution>.Ok(new CombatResolution
            {
                success = true,
                encountersResolved = kills,
                kills = kills,
                lootItemIds = lootIds.ToArray(),
                lootQuantities = lootQty.ToArray(),
                survivorsLostIds = lost.ToArray(),
                serverVersion = _remoteVersion
            });
        }

        // ─── Daily reward (mock, local-clock streak) ──────────────────────────
        private int _mockDailyStreak;
        private long _mockDailyLastClaimTicks;
        public async Task<CloudResult<DailyClaimReport>> ClaimDailyAsync()
        {
            await Latency();
            var nowUtc = DateTime.UtcNow;
            if (_mockDailyLastClaimTicks != 0)
            {
                var last = new DateTime(_mockDailyLastClaimTicks, DateTimeKind.Utc).Date;
                if (nowUtc.Date <= last)
                    return CloudResult<DailyClaimReport>.Fail(CloudErrorCode.Validation, "already_claimed_today");
                int daysSince = (nowUtc.Date - last).Days;
                bool reset = daysSince > 3; // 2-day grace + 1
                _mockDailyStreak = reset ? 1 : _mockDailyStreak + 1;
                _mockDailyLastClaimTicks = nowUtc.Ticks;
                return CloudResult<DailyClaimReport>.Ok(new DailyClaimReport { streak = _mockDailyStreak, streakReset = reset, nextClaimUtcTicks = nowUtc.Date.AddDays(1).Ticks, serverUtcTicks = nowUtc.Ticks });
            }
            _mockDailyStreak = 1;
            _mockDailyLastClaimTicks = nowUtc.Ticks;
            return CloudResult<DailyClaimReport>.Ok(new DailyClaimReport { streak = 1, streakReset = false, nextClaimUtcTicks = nowUtc.Date.AddDays(1).Ticks, serverUtcTicks = nowUtc.Ticks });
        }

        // ─── IQuotaService ────────────────────────────────────────────────────
        public async Task<CloudResult<QuotaStatus>> RefreshAsync()
        {
            await Latency();
            RollWindowIfNeeded();
            return CloudResult<QuotaStatus>.Ok(new QuotaStatus
            {
                offlineSecondsCreditedToday = _quotaSecondsToday,
                dailyCapSeconds = DailyOfflineCap.TotalSeconds,
                rollingWindowResetUtcTicks = _quotaResetUtc.Ticks
            });
        }

        public bool TryConsume(TimeSpan amount)
        {
            RollWindowIfNeeded();
            if (IsExhausted) { OnQuotaExhausted?.Invoke(); return false; }
            _quotaSecondsToday += amount.TotalSeconds;
            PersistQuota();
            OnCreditConsumed?.Invoke(amount);
            if (IsExhausted) OnQuotaExhausted?.Invoke();
            return true;
        }

        private void RollWindowIfNeeded()
        {
            if (DateTime.UtcNow >= _quotaResetUtc)
            {
                _quotaSecondsToday = 0;
                _quotaResetUtc = DateTime.UtcNow.AddHours(dailyOfflineCapHours);
                PersistQuota();
            }
        }

        private void PersistRemote()
        {
            PlayerPrefs.SetInt(K_VERSION, (int)_remoteVersion);
            if (_remoteData != null) PlayerPrefs.SetString(K_SNAPSHOT, Convert.ToBase64String(_remoteData));
        }

        private void PersistQuota()
        {
            PlayerPrefs.SetString(K_QUOTA_SEC, _quotaSecondsToday.ToString());
            PlayerPrefs.SetString(K_QUOTA_RESET, _quotaResetUtc.Ticks.ToString());
        }
    }
}
