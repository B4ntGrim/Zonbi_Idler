// Assets/Scripts/Services/Cloud/CloudCoordinator.cs
using System;
using System.Collections;
using UnityEngine;
using ZedIdler.Core;

namespace ZedIdler.Services.Cloud
{
    /// <summary>
    /// Orchestrates the cloud boot + sync lifecycle on top of the local
    /// <see cref="GameManager"/> + <see cref="SaveCoordinator"/>. Sequence:
    ///   1. Sign in (anonymous device-id).
    ///   2. Acquire single-session lock.
    ///   3. Pull server offline-progress report (24h-capped) + reconciled save.
    ///   4. Apply to local systems via SaveCoordinator.
    ///   5. Start a heartbeat loop to keep the lease alive.
    ///   6. On every local save, upload the gzip snapshot (version-checked).
    /// </summary>
    /// <remarks>
    /// All five cloud services are resolved from the ServiceLocator, so the
    /// Mock implementations and the future HTTP implementations are
    /// interchangeable. This coordinator is the ONLY place that sequences them.
    /// </remarks>
    [DisallowMultipleComponent]
    public sealed class CloudCoordinator : MonoBehaviour
    {
        [Header("Lifecycle")]
        [SerializeField] private bool autoBootOnStart = true;
        [SerializeField, Range(5f, 60f)] private float heartbeatSeconds = 15f;
        [SerializeField] private bool verbose = true;

        private IAuthService _auth;
        private ISessionLockService _lock;
        private ICloudSyncService _sync;
        private IServerTickService _tick;
        private IQuotaService _quota;
        private IGameManager _gm;

        public bool IsBooted { get; private set; }
        public bool QuotaCappedThisSession { get; private set; }

        public event Action OnCloudReady;
        public event Action<string> OnCloudError;
        public event Action OnQuotaCapReached;

        private void Awake() => DontDestroyOnLoad(gameObject);

        private void Start()
        {
            ResolveServices();
            if (autoBootOnStart) StartCoroutine(BootSequence());
        }

        private void ResolveServices()
        {
            ServiceLocator.TryGet(out _auth);
            ServiceLocator.TryGet(out _lock);
            ServiceLocator.TryGet(out _sync);
            ServiceLocator.TryGet(out _tick);
            ServiceLocator.TryGet(out _quota);
            ServiceLocator.TryGet(out _gm);
        }

        // ─── Boot ─────────────────────────────────────────────────────────────
        public IEnumerator BootSequence()
        {
            ResolveServices();
            if (_auth == null) { Fail("Cloud services not registered."); yield break; }

            // 1. Auth
            var signIn = _auth.SignInAnonymousAsync();
            yield return Await(signIn);
            if (!signIn.Result.Success) { Fail($"Auth failed: {signIn.Result.Error}"); yield break; }
            Log($"Signed in as {signIn.Result.Value}");

            // 2. Session lock
            var acquire = _lock.AcquireAsync();
            yield return Await(acquire);
            if (!acquire.Result.Success)
            {
                if (acquire.Result.Code == CloudErrorCode.SessionLocked)
                    Fail("Session is open on another device. Close it and retry.");
                else
                    Fail($"Lock failed: {acquire.Result.Error}");
                yield break;
            }
            Log("Session lock acquired.");

            // 3. Pull server offline progress + reconciled snapshot
            DateTime lastSeen = LoadLastSeenUtc();
            var pull = _tick.PullOfflineProgressAsync(lastSeen);
            yield return Await(pull);
            if (pull.Result.Success)
            {
                var report = pull.Result.Value;
                QuotaCappedThisSession = report.quotaCapped;
                if (report.quotaCapped) OnQuotaCapReached?.Invoke();
                Log($"Offline credit: {report.offlineSecondsCredited:F0}s (capped: {report.quotaCapped})");

                // 4. Apply reconciled snapshot to local systems.
                if (report.reconciledSnapshot != null && report.reconciledSnapshot.Length > 0)
                {
                    ApplyReconciledSnapshot(report.reconciledSnapshot);
                }
            }
            else
            {
                Log($"Offline pull skipped: {pull.Result.Error}");
            }

            SaveLastSeenUtc(DateTime.UtcNow);
            IsBooted = true;
            OnCloudReady?.Invoke();
            StartCoroutine(HeartbeatLoop());

            // Hook local saves → cloud upload.
            if (_gm != null) _gm.OnSaveCompleted += HandleLocalSaveCompleted;
        }

        // ─── Heartbeat ────────────────────────────────────────────────────────
        private IEnumerator HeartbeatLoop()
        {
            var wait = PerformanceUtils.Wait(heartbeatSeconds);
            while (IsBooted && _lock != null)
            {
                yield return wait;
                var hb = _lock.HeartbeatAsync();
                yield return Await(hb);
                if (!hb.Result.Success)
                {
                    Log("Lost session lock; attempting re-acquire...");
                    var re = _lock.AcquireAsync();
                    yield return Await(re);
                    if (!re.Result.Success)
                    {
                        Fail("Session lock lost — another device took over.");
                        IsBooted = false;
                        yield break;
                    }
                }
            }
        }

        // ─── Save → upload ────────────────────────────────────────────────────
        private void HandleLocalSaveCompleted(bool success, string error)
        {
            if (!success || _sync == null) return;
            // GameManager wrote a gzip file locally; mirror it to the cloud.
            StartCoroutine(UploadCurrentSave());
        }

        private IEnumerator UploadCurrentSave()
        {
            byte[] payload = ReadLocalCompressedSave();
            if (payload == null) yield break;
            long ver = _sync.LocalVersion;
            var up = _sync.UploadAsync(payload, ver);
            yield return Await(up);
            if (!up.Result.Success)
            {
                if (up.Result.Code == CloudErrorCode.Conflict)
                {
                    Log("Save conflict — keeping remote (server authoritative).");
                    var resolve = _sync.ResolveConflictAsync(ConflictResolution.KeepRemote);
                    yield return Await(resolve);
                }
                else OnCloudError?.Invoke(up.Result.Error);
            }
            else Log($"Uploaded save v{up.Result.Value}");
        }

        // ─── Hooks the local save layer will fill in ──────────────────────────
        // These intentionally delegate to whatever GameManager exposes. Kept
        // narrow so the cloud layer never reaches into local save internals.
        private byte[] ReadLocalCompressedSave()
        {
            try
            {
                string fileName = "zedidler_save";
                var cfg = ServiceLocator.Get<ZedIdler.Data.GameConfig>();
                if (cfg != null && !string.IsNullOrEmpty(cfg.SaveFileName)) fileName = cfg.SaveFileName;
                string path = System.IO.Path.Combine(Application.persistentDataPath, fileName + ".json");
                return System.IO.File.Exists(path) ? System.IO.File.ReadAllBytes(path) : null;
            }
            catch (Exception e) { Log($"ReadLocalSave error: {e.Message}"); return null; }
        }

        private void ApplyReconciledSnapshot(byte[] compressed)
        {
            // Decompress + hand to SaveCoordinator's restore path.
            try
            {
                string json = SaveCompression.Decompress(compressed);
                var data = JsonUtility.FromJson<SaveData>(json);
                var coord = ServiceLocator.Get<SaveCoordinator>();
                coord?.RestoreAll(data);
                Log("Applied server-reconciled snapshot.");
            }
            catch (Exception e) { Log($"ApplyReconciled error: {e.Message}"); }
        }

        private DateTime LoadLastSeenUtc()
        {
            long ticks = long.Parse(PlayerPrefs.GetString("cloud_last_seen_ticks", "0"));
            return ticks > 0 ? new DateTime(ticks, DateTimeKind.Utc) : DateTime.UtcNow;
        }

        private void SaveLastSeenUtc(DateTime utc) =>
            PlayerPrefs.SetString("cloud_last_seen_ticks", utc.Ticks.ToString());

        // ─── Lifecycle save-on-suspend ────────────────────────────────────────
        private void OnApplicationPause(bool paused)
        {
            if (paused && IsBooted)
            {
                SaveLastSeenUtc(DateTime.UtcNow);
                if (_lock != null) _ = _lock.ReleaseAsync(); // release lease so other devices can play
            }
        }

        private void OnApplicationQuit()
        {
            SaveLastSeenUtc(DateTime.UtcNow);
            if (_lock != null) _ = _lock.ReleaseAsync();
        }

        // ─── Await helper for Task in coroutine ───────────────────────────────
        private static IEnumerator Await(System.Threading.Tasks.Task task)
        {
            while (!task.IsCompleted) yield return null;
            if (task.IsFaulted) Debug.LogError($"[Cloud] Task faulted: {task.Exception?.GetBaseException().Message}");
        }
        private static IEnumerator Await<T>(System.Threading.Tasks.Task<T> task)
        {
            while (!task.IsCompleted) yield return null;
            if (task.IsFaulted) Debug.LogError($"[Cloud] Task faulted: {task.Exception?.GetBaseException().Message}");
        }

        private void Log(string msg) { if (verbose) Debug.Log($"[CloudCoordinator] {msg}"); }
        private void Fail(string msg) { Debug.LogError($"[CloudCoordinator] {msg}"); OnCloudError?.Invoke(msg); }
    }
}
