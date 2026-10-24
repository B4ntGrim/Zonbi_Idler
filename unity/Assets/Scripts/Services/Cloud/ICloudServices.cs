// Assets/Scripts/Services/Cloud/ICloudServices.cs
using System;
using System.Threading.Tasks;

namespace ZedIdler.Services.Cloud
{
    /// <summary>
    /// Result wrapper for all cloud calls. Avoids throwing across the
    /// network boundary; callers branch on <see cref="Success"/>.
    /// </summary>
    public struct CloudResult<T>
    {
        public bool Success;
        public T Value;
        public string Error;
        public CloudErrorCode Code;

        public static CloudResult<T> Ok(T v) => new CloudResult<T> { Success = true, Value = v };
        public static CloudResult<T> Fail(CloudErrorCode code, string err) =>
            new CloudResult<T> { Success = false, Code = code, Error = err };
    }

    public enum CloudErrorCode
    {
        None            = 0,
        Network         = 1,
        AuthRequired    = 2,
        SessionLocked   = 3,  // another device holds the session lock
        QuotaExceeded   = 4,  // 24h limit hit
        Validation      = 5,  // server rejected payload (anti-cheat)
        Conflict        = 6,  // save version conflict
        ServerError     = 7,
        NotFound        = 8
    }

    /// <summary>
    /// Authentication. Device-id anonymous by default (answer 5a); supports
    /// linking to a durable account later.
    /// </summary>
    public interface IAuthService
    {
        bool IsAuthenticated { get; }
        string PlayerId { get; }
        string DeviceId { get; }
        event Action<string> OnAuthenticated;
        event Action OnSignedOut;

        Task<CloudResult<string>> SignInAnonymousAsync();
        Task<CloudResult<bool>> LinkAccountAsync(string email, string token);
        Task SignOutAsync();
    }

    /// <summary>
    /// Single-session lock (answer 6). Acquires an exclusive lease on the
    /// player's save so only one device mutates at a time. Heartbeats keep
    /// the lease alive; losing the heartbeat releases it server-side.
    /// </summary>
    public interface ISessionLockService
    {
        bool HoldsLock { get; }
        DateTime LeaseExpiresUtc { get; }
        event Action OnLockAcquired;
        event Action<string> OnLockLost; // reason

        Task<CloudResult<bool>> AcquireAsync();
        Task<CloudResult<bool>> HeartbeatAsync();
        Task ReleaseAsync();
    }

    /// <summary>
    /// Full-snapshot cloud save (answer 4) — gzip-compressed payload upload,
    /// version-checked to detect conflicts. Mirrors the local GameManager save.
    /// </summary>
    public interface ICloudSyncService
    {
        long LocalVersion { get; }
        long RemoteVersion { get; }
        DateTime LastSyncUtc { get; }
        event Action<long> OnUploaded;
        event Action<long, byte[]> OnDownloaded; // (version, compressedJson)
        event Action<CloudErrorCode, string> OnSyncFailed;

        Task<CloudResult<long>> UploadAsync(byte[] compressedJson, long localVersion);
        Task<CloudResult<(long version, byte[] data)>> DownloadAsync();
        Task<CloudResult<long>> ResolveConflictAsync(ConflictResolution choice);
    }

    public enum ConflictResolution { KeepLocal = 0, KeepRemote = 1, Merge = 2 }

    /// <summary>
    /// Server-authoritative tick reconciliation. Server advances offline
    /// systems (marketplace, recycler, schedule, contracts, combat) while the
    /// client is away. On reconnect, the client pulls the authoritative delta.
    /// Combat is server-authoritative (answer 10); time is client-driven.
    /// </summary>
    public interface IServerTickService
    {
        Task<CloudResult<ServerTickReport>> PullOfflineProgressAsync(DateTime lastSeenUtc);
        Task<CloudResult<CombatResolution>> SubmitCombatRunAsync(CombatRunRequest request);
        Task<CloudResult<DailyClaimReport>> ClaimDailyAsync();
    }

    /// <summary>Result of a server-authoritative daily reward claim.</summary>
    [Serializable]
    public struct DailyClaimReport
    {
        public int streak;
        public bool streakReset;
        public long nextClaimUtcTicks;
        public long serverUtcTicks;
    }

    /// <summary>
    /// 24h rolling quota enforcement (answer 7b: offline progression credited
    /// per day; answer 8a: hard stop on limit). The server is the source of
    /// truth; this client mirror lets the UI warn before the hard stop.
    /// </summary>
    public interface IQuotaService
    {
        TimeSpan OfflineProgressCreditedToday { get; }
        TimeSpan DailyOfflineCap { get; }
        TimeSpan RemainingCredit { get; }
        bool IsExhausted { get; }
        DateTime RollingWindowResetUtc { get; }
        event Action<TimeSpan> OnCreditConsumed;
        event Action OnQuotaExhausted;

        Task<CloudResult<QuotaStatus>> RefreshAsync();
        bool TryConsume(TimeSpan amount); // local optimistic; server reconciles
    }

    // ─── DTOs ─────────────────────────────────────────────────────────────────
    [Serializable]
    public struct ServerTickReport
    {
        public long serverVersion;
        public byte[] reconciledSnapshot; // gzip JSON of authoritative state
        public double offlineSecondsCredited;
        public bool quotaCapped;
    }

    [Serializable]
    public struct CombatRunRequest
    {
        public string[] squadSurvivorIds;
        public string zoneId;
        public int encounterLimit;
        public bool autoLoot;
        public long clientNonce; // anti-replay
    }

    [Serializable]
    public struct CombatResolution
    {
        public bool success;
        public int encountersResolved;
        public int kills;
        public string[] lootItemIds;
        public int[] lootQuantities;
        public string[] survivorsLostIds;
        public long serverVersion;
    }

    [Serializable]
    public struct QuotaStatus
    {
        public double offlineSecondsCreditedToday;
        public double dailyCapSeconds;
        public long rollingWindowResetUtcTicks;
    }
}
