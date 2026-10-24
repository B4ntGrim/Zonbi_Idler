// Assets/Scripts/Services/Cloud/HttpCloudServices.cs
using System;
using System.Text;
using System.Threading.Tasks;
using UnityEngine;
using UnityEngine.Networking;

namespace ZedIdler.Services.Cloud
{
    /// <summary>
    /// Production cloud client. Implements the same five interfaces as
    /// <see cref="MockCloudServices"/> against the C# serverless backend via
    /// UnityWebRequest (works on PC, iOS, Android). Swap this component in for
    /// MockCloudServices on the Bootstrap GameObject — no other code changes.
    /// </summary>
    /// <remarks>
    /// Wire format mirrors server/ZedIdler.Server/Contracts/ApiContracts.cs.
    /// JSON via UnityEngine.JsonUtility for value DTOs; byte[] save payloads are
    /// base64-wrapped in the JSON envelope to stay transport-agnostic.
    /// </remarks>
    [DisallowMultipleComponent]
    public sealed class HttpCloudServices : MonoBehaviour,
        IAuthService, ISessionLockService, ICloudSyncService, IServerTickService, IQuotaService
    {
        [SerializeField] private string baseUrl = "https://api.zedidler.example/v1";
        [SerializeField, Range(2f, 30f)] private float timeoutSeconds = 12f;

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
        public long RemoteVersion { get; private set; }
        public DateTime LastSyncUtc { get; private set; }
        public event Action<long> OnUploaded;
        public event Action<long, byte[]> OnDownloaded;
        public event Action<CloudErrorCode, string> OnSyncFailed;

        public TimeSpan OfflineProgressCreditedToday { get; private set; }
        public TimeSpan DailyOfflineCap { get; private set; } = TimeSpan.FromHours(24);
        public TimeSpan RemainingCredit => DailyOfflineCap - OfflineProgressCreditedToday;
        public bool IsExhausted => RemainingCredit <= TimeSpan.Zero;
        public DateTime RollingWindowResetUtc { get; private set; }
        public event Action<TimeSpan> OnCreditConsumed;
        public event Action OnQuotaExhausted;

        private string _sessionToken;

        private void Awake()
        {
            DontDestroyOnLoad(gameObject);
            DeviceId = SystemInfo.deviceUniqueIdentifier;
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

        // ─── IAuthService ─────────────────────────────────────────────────────
        public async Task<CloudResult<string>> SignInAnonymousAsync()
        {
            var resp = await PostAsync<AnonSignInResp>("auth/anon", JsonUtility.ToJson(new AnonSignInReq { deviceId = DeviceId }));
            if (!resp.Success) return CloudResult<string>.Fail(resp.Code, resp.Error);
            PlayerId = resp.Value.playerId;
            _sessionToken = resp.Value.sessionToken;
            IsAuthenticated = true;
            OnAuthenticated?.Invoke(PlayerId);
            return CloudResult<string>.Ok(PlayerId);
        }

        public async Task<CloudResult<bool>> LinkAccountAsync(string email, string token)
        {
            var resp = await PostAsync<LinkResp>("auth/link", JsonUtility.ToJson(new LinkReq { playerId = PlayerId, email = email, token = token }));
            return resp.Success ? CloudResult<bool>.Ok(resp.Value.linked) : CloudResult<bool>.Fail(resp.Code, resp.Error);
        }

        public async Task SignOutAsync()
        {
            IsAuthenticated = false; HoldsLock = false;
            await ReleaseAsync();
            OnSignedOut?.Invoke();
        }

        // ─── ISessionLockService ──────────────────────────────────────────────
        public async Task<CloudResult<bool>> AcquireAsync()
        {
            var resp = await PostAsync<SessionResp>("session/acquire", JsonUtility.ToJson(new SessionReq { playerId = PlayerId, deviceId = DeviceId }));
            if (!resp.Success) return CloudResult<bool>.Fail(resp.Code, resp.Error);
            HoldsLock = resp.Value.granted;
            LeaseExpiresUtc = new DateTime(resp.Value.leaseExpiresUtcTicks, DateTimeKind.Utc);
            if (HoldsLock) OnLockAcquired?.Invoke();
            return HoldsLock ? CloudResult<bool>.Ok(true) : CloudResult<bool>.Fail(CloudErrorCode.SessionLocked, "Held by " + resp.Value.holderDeviceId);
        }

        public async Task<CloudResult<bool>> HeartbeatAsync()
        {
            var resp = await PostAsync<SessionResp>("session/heartbeat", JsonUtility.ToJson(new SessionReq { playerId = PlayerId, deviceId = DeviceId }));
            if (!resp.Success || !resp.Value.granted) { HoldsLock = false; OnLockLost?.Invoke("heartbeat rejected"); return CloudResult<bool>.Fail(CloudErrorCode.SessionLocked, "lost"); }
            LeaseExpiresUtc = new DateTime(resp.Value.leaseExpiresUtcTicks, DateTimeKind.Utc);
            return CloudResult<bool>.Ok(true);
        }

        public async Task ReleaseAsync()
        {
            await PostAsync<OkResp>("session/release", JsonUtility.ToJson(new SessionReq { playerId = PlayerId, deviceId = DeviceId }));
            HoldsLock = false;
        }

        // ─── ICloudSyncService ────────────────────────────────────────────────
        public async Task<CloudResult<long>> UploadAsync(byte[] compressedJson, long localVersion)
        {
            var body = JsonUtility.ToJson(new SaveUploadReq { playerId = PlayerId, localVersion = localVersion, dataB64 = Convert.ToBase64String(compressedJson) });
            var resp = await PostAsync<SaveUploadResp>("save/upload", body);
            if (!resp.Success) { OnSyncFailed?.Invoke(resp.Code, resp.Error); return CloudResult<long>.Fail(resp.Code, resp.Error); }
            if (resp.Value.conflict) return CloudResult<long>.Fail(CloudErrorCode.Conflict, $"remote v{resp.Value.remoteVersion}");
            RemoteVersion = resp.Value.newVersion; LocalVersion = resp.Value.newVersion; LastSyncUtc = DateTime.UtcNow;
            OnUploaded?.Invoke(RemoteVersion);
            return CloudResult<long>.Ok(RemoteVersion);
        }

        public async Task<CloudResult<(long, byte[])>> DownloadAsync()
        {
            var resp = await GetAsync<SaveDownloadResp>($"save/download/{PlayerId}");
            if (!resp.Success) return CloudResult<(long, byte[])>.Fail(resp.Code, resp.Error);
            byte[] data = string.IsNullOrEmpty(resp.Value.dataB64) ? null : Convert.FromBase64String(resp.Value.dataB64);
            RemoteVersion = resp.Value.version; LastSyncUtc = DateTime.UtcNow;
            if (data != null) OnDownloaded?.Invoke(RemoteVersion, data);
            return CloudResult<(long, byte[])>.Ok((resp.Value.version, data));
        }

        public Task<CloudResult<long>> ResolveConflictAsync(ConflictResolution choice)
        {
            // Server is authoritative; conflict resolution = re-download remote.
            if (choice == ConflictResolution.KeepRemote) LocalVersion = RemoteVersion;
            return Task.FromResult(CloudResult<long>.Ok(RemoteVersion));
        }

        // ─── IServerTickService ───────────────────────────────────────────────
        public async Task<CloudResult<ServerTickReport>> PullOfflineProgressAsync(DateTime lastSeenUtc)
        {
            var body = JsonUtility.ToJson(new OfflineTickReq { playerId = PlayerId, lastSeenUtcTicks = lastSeenUtc.Ticks });
            var resp = await PostAsync<OfflineTickResp>("tick/offline", body);
            if (!resp.Success) return CloudResult<ServerTickReport>.Fail(resp.Code, resp.Error);
            var v = resp.Value;
            if (v.quotaCapped) OnQuotaExhausted?.Invoke();
            if (v.offlineSecondsCredited > 0) OnCreditConsumed?.Invoke(TimeSpan.FromSeconds(v.offlineSecondsCredited));
            return CloudResult<ServerTickReport>.Ok(new ServerTickReport
            {
                serverVersion = v.serverVersion,
                reconciledSnapshot = string.IsNullOrEmpty(v.snapshotB64) ? null : Convert.FromBase64String(v.snapshotB64),
                offlineSecondsCredited = v.offlineSecondsCredited,
                quotaCapped = v.quotaCapped
            });
        }

        public async Task<CloudResult<CombatResolution>> SubmitCombatRunAsync(CombatRunRequest request)
        {
            var body = JsonUtility.ToJson(new CombatReq
            {
                playerId = PlayerId, squadSurvivorIds = request.squadSurvivorIds,
                zoneId = request.zoneId, encounterLimit = request.encounterLimit,
                autoLoot = request.autoLoot, clientNonce = request.clientNonce
            });
            var resp = await PostAsync<CombatResp>("combat/run", body);
            if (!resp.Success) return CloudResult<CombatResolution>.Fail(resp.Code, resp.Error);
            var v = resp.Value;
            if (!v.success) return CloudResult<CombatResolution>.Fail(CloudErrorCode.Validation, v.rejectReason);
            return CloudResult<CombatResolution>.Ok(new CombatResolution
            {
                success = v.success, encountersResolved = v.encountersResolved, kills = v.kills,
                lootItemIds = v.lootItemIds, lootQuantities = v.lootQuantities,
                survivorsLostIds = v.survivorsLostIds, serverVersion = v.serverVersion
            });
        }

        // ─── IQuotaService ────────────────────────────────────────────────────
        public async Task<CloudResult<QuotaStatus>> RefreshAsync()
        {
            var resp = await GetAsync<QuotaResp>($"quota/{PlayerId}");
            if (!resp.Success) return CloudResult<QuotaStatus>.Fail(resp.Code, resp.Error);
            var v = resp.Value;
            OfflineProgressCreditedToday = TimeSpan.FromSeconds(v.offlineSecondsCreditedToday);
            DailyOfflineCap = TimeSpan.FromSeconds(v.dailyCapSeconds);
            RollingWindowResetUtc = new DateTime(v.rollingWindowResetUtcTicks, DateTimeKind.Utc);
            return CloudResult<QuotaStatus>.Ok(new QuotaStatus
            {
                offlineSecondsCreditedToday = v.offlineSecondsCreditedToday,
                dailyCapSeconds = v.dailyCapSeconds,
                rollingWindowResetUtcTicks = v.rollingWindowResetUtcTicks
            });
        }

        public bool TryConsume(TimeSpan amount)
        {
            if (IsExhausted) { OnQuotaExhausted?.Invoke(); return false; }
            OfflineProgressCreditedToday += amount;
            OnCreditConsumed?.Invoke(amount);
            return true; // server reconciles authoritatively on next RefreshAsync
        }

        // ─── Daily reward (server-authoritative) ─────────────────────────────
        /// <summary>
        /// Claim today's daily reward via the server. The backend computes the
        /// streak from its own clock, defeating device-clock manipulation.
        /// </summary>
        public async Task<CloudResult<DailyClaimReport>> ClaimDailyAsync()
        {
            var body = JsonUtility.ToJson(new DailyClaimReq { playerId = PlayerId });
            var resp = await PostAsync<DailyClaimResp>("daily/claim", body);
            if (!resp.Success) return CloudResult<DailyClaimReport>.Fail(resp.Code, resp.Error);
            var v = resp.Value;
            if (!v.success) return CloudResult<DailyClaimReport>.Fail(CloudErrorCode.Validation, v.reason);
            return CloudResult<DailyClaimReport>.Ok(new DailyClaimReport
            {
                streak = v.streak, streakReset = v.streakReset,
                nextClaimUtcTicks = v.nextClaimUtcTicks, serverUtcTicks = v.serverUtcTicks
            });
        }

        // ─── HTTP plumbing ────────────────────────────────────────────────────
        private async Task<CloudResult<T>> PostAsync<T>(string route, string json)
        {
            using var req = new UnityWebRequest($"{baseUrl}/{route}", "POST");
            req.uploadHandler = new UploadHandlerRaw(Encoding.UTF8.GetBytes(json));
            req.downloadHandler = new DownloadHandlerBuffer();
            req.SetRequestHeader("Content-Type", "application/json");
            if (!string.IsNullOrEmpty(_sessionToken)) req.SetRequestHeader("Authorization", "Bearer " + _sessionToken);
            req.timeout = (int)timeoutSeconds;
            return await SendAsync<T>(req);
        }

        private async Task<CloudResult<T>> GetAsync<T>(string route)
        {
            using var req = UnityWebRequest.Get($"{baseUrl}/{route}");
            if (!string.IsNullOrEmpty(_sessionToken)) req.SetRequestHeader("Authorization", "Bearer " + _sessionToken);
            req.timeout = (int)timeoutSeconds;
            return await SendAsync<T>(req);
        }

        private async Task<CloudResult<T>> SendAsync<T>(UnityWebRequest req)
        {
            var op = req.SendWebRequest();
            while (!op.isDone) await Task.Yield();
            if (req.result != UnityWebRequest.Result.Success)
            {
                var code = req.responseCode == 0 ? CloudErrorCode.Network : CloudErrorCode.ServerError;
                return CloudResult<T>.Fail(code, req.error);
            }
            try { return CloudResult<T>.Ok(JsonUtility.FromJson<T>(req.downloadHandler.text)); }
            catch (Exception e) { return CloudResult<T>.Fail(CloudErrorCode.Validation, e.Message); }
        }

        // ─── Wire DTOs (JsonUtility-friendly: flat, public fields) ────────────
        [Serializable] private struct AnonSignInReq { public string deviceId; }
        [Serializable] private struct AnonSignInResp { public string playerId; public string sessionToken; }
        [Serializable] private struct LinkReq { public string playerId; public string email; public string token; }
        [Serializable] private struct LinkResp { public bool linked; }
        [Serializable] private struct SessionReq { public string playerId; public string deviceId; }
        [Serializable] private struct SessionResp { public bool granted; public long leaseExpiresUtcTicks; public string holderDeviceId; }
        [Serializable] private struct SaveUploadReq { public string playerId; public long localVersion; public string dataB64; }
        [Serializable] private struct SaveUploadResp { public bool accepted; public long newVersion; public bool conflict; public long remoteVersion; }
        [Serializable] private struct SaveDownloadResp { public long version; public string dataB64; }
        [Serializable] private struct OfflineTickReq { public string playerId; public long lastSeenUtcTicks; }
        [Serializable] private struct OfflineTickResp { public long serverVersion; public string snapshotB64; public double offlineSecondsCredited; public bool quotaCapped; }
        [Serializable] private struct CombatReq { public string playerId; public string[] squadSurvivorIds; public string zoneId; public int encounterLimit; public bool autoLoot; public long clientNonce; }
        [Serializable] private struct CombatResp { public bool success; public int encountersResolved; public int kills; public string[] lootItemIds; public int[] lootQuantities; public string[] survivorsLostIds; public long serverVersion; public string rejectReason; }
        [Serializable] private struct QuotaResp { public double offlineSecondsCreditedToday; public double dailyCapSeconds; public long rollingWindowResetUtcTicks; }
        [Serializable] private struct DailyClaimReq { public string playerId; }
        [Serializable] private struct DailyClaimResp { public bool success; public string reason; public int streak; public bool streakReset; public long nextClaimUtcTicks; public long serverUtcTicks; }
        [Serializable] private struct OkResp { public bool ok; }
    }
}
