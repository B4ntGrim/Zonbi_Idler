// Assets/Scripts/Core/GameManager.cs
using System;
using System.Collections;
using System.IO;
using UnityEngine;
using UnityEngine.SceneManagement;
using ZedIdler.Data;
using ZedIdler.Services;
using ZedIdler.Systems;

namespace ZedIdler.Core
{
    /// <summary>
    /// Top-level game state controller for Zed Idler.
    /// Owns the canonical <see cref="GameState"/>, drives scene transitions per tab,
    /// orchestrates JSON persistence, and adapts to mobile suspend/resume.
    /// </summary>
    /// <remarks>
    /// Pattern: Service Locator (not Singleton). On Awake, registers itself under
    /// <see cref="IGameManager"/> via <see cref="ServiceLocator"/>. Other systems
    /// resolve it without taking a hard reference, which keeps the class fully testable.
    ///
    /// Lifetime: Place on a "Bootstrap" GameObject in a persistent scene with
    /// <c>DontDestroyOnLoad</c>. Initialize once at app start.
    ///
    /// Save policy: Manual via <see cref="RequestSave"/> (call from a UI button).
    /// Mobile lifecycle also triggers saves per <see cref="GameConfig"/> flags so
    /// suspended apps don't lose state.
    /// </remarks>
    [DisallowMultipleComponent]
    public sealed class GameManager : MonoBehaviour, IGameManager
    {
        // ─── Inspector ────────────────────────────────────────────────────────
        [Header("Configuration")]
        [SerializeField] private GameConfig config;

        [Header("Boot")]
        [SerializeField] private GameState initialState = GameState.MainMenu;

        // ─── Public state ─────────────────────────────────────────────────────
        /// <inheritdoc/>
        public GameState CurrentState { get; private set; } = GameState.Boot;

        /// <inheritdoc/>
        public GameState PreviousState { get; private set; } = GameState.Boot;

        /// <inheritdoc/>
        public bool IsSaving { get; private set; }

        /// <inheritdoc/>
        public DateTime LastSaveUtc { get; private set; } = DateTime.MinValue;

        /// <inheritdoc/>
        public TimeSpan OfflineDelta { get; private set; } = TimeSpan.Zero;

        // ─── Events ───────────────────────────────────────────────────────────
        /// <inheritdoc/>
        public event Action<GameState, GameState> OnGameStateChanged;
        /// <inheritdoc/>
        public event Action<string> OnSaveStarted;
        /// <inheritdoc/>
        public event Action<bool, string> OnSaveCompleted;
        /// <inheritdoc/>
        public event Action<bool, SaveData> OnLoadCompleted;
        /// <inheritdoc/>
        public event Action<TimeSpan> OnOfflineProgressApplied;
        /// <inheritdoc/>
        public event Action<bool> OnApplicationSuspended;

        // ─── Private ──────────────────────────────────────────────────────────
        private float _lastSaveRequestTime = -999f;
        private string SavePath => Path.Combine(Application.persistentDataPath,
            $"{(config != null ? config.SaveFileName : "zedidler_save")}.json");

        // ─── Lifecycle ────────────────────────────────────────────────────────
        private void Awake()
        {
            // Persist across scene loads.
            DontDestroyOnLoad(gameObject);

            // Validate config.
            if (config == null)
            {
                Debug.LogError("[GameManager] GameConfig is not assigned. Aborting init.", this);
                enabled = false;
                return;
            }

            // Register with service locator so other systems can resolve us.
            ServiceLocator.Register<IGameManager>(this);
        }

        private void OnEnable()
        {
            SceneManager.sceneLoaded += HandleSceneLoaded;
        }

        private void OnDisable()
        {
            SceneManager.sceneLoaded -= HandleSceneLoaded;
        }

        private void OnDestroy()
        {
            ServiceLocator.Unregister<IGameManager>();
        }

        private IEnumerator Start()
        {
            // Yield one frame so other Awake-time registrations complete.
            yield return null;

            // Attempt to load existing save and apply offline progress.
            TryLoadAndApplyOfflineProgress();

            // Transition into the initial state (MainMenu by default).
            TransitionTo(initialState);
        }

        // ─── State machine ────────────────────────────────────────────────────
        /// <inheritdoc/>
        public void TransitionTo(GameState next)
        {
            if (next == CurrentState) return;

            PreviousState = CurrentState;
            CurrentState = next;
            OnGameStateChanged?.Invoke(PreviousState, CurrentState);

            // Resolve scene for this state and load it additively-or-single per design.
            string sceneName = GetSceneNameForState(next);
            if (!string.IsNullOrEmpty(sceneName)
                && SceneManager.GetActiveScene().name != sceneName)
            {
                SceneManager.LoadScene(sceneName, LoadSceneMode.Single);
            }
        }

        private string GetSceneNameForState(GameState state)
        {
            if (config == null || config.SceneMap == null) return null;
            foreach (var m in config.SceneMap)
            {
                if (m.state == state) return m.sceneName;
            }
            return null;
        }

        private void HandleSceneLoaded(Scene scene, LoadSceneMode mode)
        {
            // Hook point for per-scene setup. Other systems can subscribe to
            // OnGameStateChanged to refresh themselves after a scene swap.
        }

        // ─── Save / Load ──────────────────────────────────────────────────────
        /// <inheritdoc/>
        public void RequestSave()
        {
            if (IsSaving)
            {
                Debug.LogWarning("[GameManager] Save already in progress; ignoring request.");
                return;
            }

            float now = Time.realtimeSinceStartup;
            if (now - _lastSaveRequestTime < config.MinSaveIntervalSeconds)
            {
                Debug.Log("[GameManager] Save rate-limited.");
                return;
            }
            _lastSaveRequestTime = now;

            StartCoroutine(SaveRoutine());
        }

        private IEnumerator SaveRoutine()
        {
            IsSaving = true;
            OnSaveStarted?.Invoke(SavePath);

            // Collect data from all registered systems implementing ISaveable.
            // For Phase 1 we serialize only GameManager state; other systems plug in later.
            var data = new SaveData
            {
                schemaVersion = config.SaveSchemaVersion,
                lastSaveUtcTicks = DateTime.UtcNow.Ticks,
                currentState = CurrentState,
                playtimeSeconds = (long)Time.realtimeSinceStartup,
                scheduleSnapshot = TryCaptureScheduleSnapshot(),
                timeSnapshot = TryCaptureTimeSnapshot(),
                traversalSnapshot = TryCaptureTraversalSnapshot(),
                recyclerSnapshot = TryCaptureRecyclerSnapshot(),
                marketplaceSnapshot = TryCaptureMarketplaceSnapshot(),
                factionSnapshot = TryCaptureFactionSnapshot(),
                contractsSnapshot = TryCaptureContractsSnapshot(),
                equipmentSnapshot = TryCaptureEquipmentSnapshot(),
                prestigeSnapshot = TryCapturePrestigeSnapshot(),
                dailySnapshot = TryCaptureDailySnapshot()
            };

            // Yield once so the UI can show a saving indicator.
            yield return null;

            bool success = false;
            string error = null;
            try
            {
                string json = JsonUtility.ToJson(data, prettyPrint: true);
                SaveCompression.WriteCompressed(SavePath, json);
                LastSaveUtc = new DateTime(data.lastSaveUtcTicks, DateTimeKind.Utc);
                success = true;
            }
            catch (Exception ex)
            {
                error = ex.Message;
                Debug.LogError($"[GameManager] Save failed: {ex}");
            }

            IsSaving = false;
            OnSaveCompleted?.Invoke(success, error);
        }

        /// <inheritdoc/>
        public bool TryLoad(out SaveData data)
        {
            data = default;
            if (!File.Exists(SavePath))
            {
                return false;
            }
            try
            {
                string json = SaveCompression.LoadAuto(SavePath);
                if (json == null) return false;
                data = JsonUtility.FromJson<SaveData>(json);

                // Migration hook for future schema bumps.
                if (data.schemaVersion < config.SaveSchemaVersion)
                {
                    data = MigrateSaveData(data);
                }
                return true;
            }
            catch (Exception ex)
            {
                Debug.LogError($"[GameManager] Load failed: {ex}");
                return false;
            }
        }

        private SaveData MigrateSaveData(SaveData old)
        {
            // Stub: bump schemaVersion and apply transforms here when format changes.
            old.schemaVersion = config.SaveSchemaVersion;
            return old;
        }

        private void TryLoadAndApplyOfflineProgress()
        {
            if (!TryLoad(out var data))
            {
                OnLoadCompleted?.Invoke(false, default);
                return;
            }

            // Compute real-world offline delta. Clamp to MaxOfflineHours to prevent abuse.
            var savedUtc = new DateTime(data.lastSaveUtcTicks, DateTimeKind.Utc);
            var raw = DateTime.UtcNow - savedUtc;
            var maxSpan = TimeSpan.FromHours(config.MaxOfflineHours);
            OfflineDelta = raw > maxSpan ? maxSpan : (raw < TimeSpan.Zero ? TimeSpan.Zero : raw);
            LastSaveUtc = savedUtc;

            OnLoadCompleted?.Invoke(true, data);
            OnOfflineProgressApplied?.Invoke(OfflineDelta);
        }

        // ─── Mobile lifecycle ─────────────────────────────────────────────────
        private void OnApplicationPause(bool paused)
        {
            OnApplicationSuspended?.Invoke(paused);
            if (paused && config != null && config.SaveOnApplicationPause)
            {
                // Synchronous save — coroutines won't run while paused.
                SaveSynchronous("pause");
            }
        }

        private void OnApplicationFocus(bool hasFocus)
        {
            if (!hasFocus && config != null && config.SaveOnFocusLoss)
            {
                SaveSynchronous("focus-loss");
            }
        }

        private void OnApplicationQuit()
        {
            // Always save on quit (user expects no data loss on intentional close).
            SaveSynchronous("quit");
        }

        private void SaveSynchronous(string reason)
        {
            try
            {
                var data = new SaveData
                {
                    schemaVersion = config.SaveSchemaVersion,
                    lastSaveUtcTicks = DateTime.UtcNow.Ticks,
                    currentState = CurrentState,
                    playtimeSeconds = (long)Time.realtimeSinceStartup,
                    scheduleSnapshot = TryCaptureScheduleSnapshot(),
                    timeSnapshot = TryCaptureTimeSnapshot(),
                    traversalSnapshot = TryCaptureTraversalSnapshot(),
                    recyclerSnapshot = TryCaptureRecyclerSnapshot(),
                    marketplaceSnapshot = TryCaptureMarketplaceSnapshot(),
                    factionSnapshot = TryCaptureFactionSnapshot(),
                    contractsSnapshot = TryCaptureContractsSnapshot(),
                    equipmentSnapshot = TryCaptureEquipmentSnapshot(),
                    prestigeSnapshot = TryCapturePrestigeSnapshot(),
                    dailySnapshot = TryCaptureDailySnapshot()
                };
                string json = JsonUtility.ToJson(data, prettyPrint: false);
                SaveCompression.WriteCompressed(SavePath, json);
                LastSaveUtc = DateTime.UtcNow;
                Debug.Log($"[GameManager] Synchronous save complete ({reason}).");
            }
            catch (Exception ex)
            {
                Debug.LogError($"[GameManager] Synchronous save failed ({reason}): {ex}");
            }
        }

        /// <summary>
        /// Capture the current ScheduleService snapshot if one is registered.
        /// Returns an empty snapshot if the schedule isn't available yet.
        /// </summary>
        private ScheduleSnapshot TryCaptureScheduleSnapshot()
        {
            if (ServiceLocator.TryGet<IScheduleService>(out var schedule))
            {
                return schedule.CreateSnapshot();
            }
            return default;
        }

        private ZedIdler.Services.TimeService.Snapshot TryCaptureTimeSnapshot()
        {
            if (ServiceLocator.TryGet<ZedIdler.Services.ITimeService>(out var t)
                && t is ZedIdler.Services.TimeService concrete)
            {
                return concrete.CreateSnapshot();
            }
            return default;
        }

        private ZedIdler.Services.TraversalContext.Snapshot TryCaptureTraversalSnapshot()
        {
            if (ServiceLocator.TryGet<ZedIdler.Services.ITraversalContext>(out var t)
                && t is ZedIdler.Services.TraversalContext concrete)
            {
                return concrete.CreateSnapshot();
            }
            return default;
        }

        private ZedIdler.Services.RecyclerService.Snapshot TryCaptureRecyclerSnapshot()
        {
            if (ServiceLocator.TryGet<ZedIdler.Services.IRecyclerService>(out var r))
            {
                return r.CreateSnapshot();
            }
            return default;
        }

        private ZedIdler.Services.MarketplaceService.Snapshot TryCaptureMarketplaceSnapshot()
        {
            if (ServiceLocator.TryGet<ZedIdler.Services.IMarketplaceService>(out var m))
            {
                return m.CreateSnapshot();
            }
            return default;
        }

        private ZedIdler.Services.FactionService.Snapshot TryCaptureFactionSnapshot()
        {
            if (ServiceLocator.TryGet<ZedIdler.Services.IFactionService>(out var f))
            {
                return f.CreateSnapshot();
            }
            return default;
        }

        private ZedIdler.Services.ContractsService.Snapshot TryCaptureContractsSnapshot()
        {
            if (ServiceLocator.TryGet<ZedIdler.Services.IContractsService>(out var c))
            {
                return c.CreateSnapshot();
            }
            return default;
        }

        private ZedIdler.Services.EquipmentService.Snapshot TryCaptureEquipmentSnapshot()
        {
            if (ServiceLocator.TryGet<ZedIdler.Services.IEquipmentService>(out var e))
            {
                return e.CreateSnapshot();
            }
            return default;
        }

        private ZedIdler.Services.PrestigeService.Snapshot TryCapturePrestigeSnapshot()
        {
            if (ServiceLocator.TryGet<ZedIdler.Services.IPrestigeService>(out var p))
            {
                return p.CreateSnapshot();
            }
            return default;
        }

        private ZedIdler.Services.DailyRewardService.Snapshot TryCaptureDailySnapshot()
        {
            if (ServiceLocator.TryGet<ZedIdler.Services.IDailyRewardService>(out var d))
            {
                return d.CreateSnapshot();
            }
            return default;
        }
    }

    /// <summary>
    /// Top-level game-state enum. ORDER MATTERS — preserve for save compatibility.
    /// </summary>
    public enum GameState
    {
        Boot = 0,
        MainMenu = 1,
        Overview = 2,
        Schedule = 3,
        Wandering = 4,
        Traversal = 5,
        Marketplace = 6,
        Crafting = 7,
        Recycler = 8,
        Survival = 9,
        Combat = 10,
        Paused = 11
    }

    /// <summary>
    /// Serializable root save payload. Each system contributes its own snapshot
    /// type so save/load remains type-safe end-to-end.
    /// </summary>
    [Serializable]
    public struct SaveData
    {
        public int schemaVersion;
        public long lastSaveUtcTicks;
        public GameState currentState;
        public long playtimeSeconds;
        public ScheduleSnapshot scheduleSnapshot;
        public ZedIdler.Services.TimeService.Snapshot timeSnapshot;
        public ZedIdler.Services.TraversalContext.Snapshot traversalSnapshot;
        public ZedIdler.Services.PlayerProfile.Snapshot profileSnapshot;
        public ZedIdler.Services.BackpackSnapshot backpackSnapshot;
        public ZedIdler.Services.RecyclerService.Snapshot recyclerSnapshot;
        public ZedIdler.Services.MarketplaceService.Snapshot marketplaceSnapshot;
        public ZedIdler.Services.FactionService.Snapshot factionSnapshot;
        public ZedIdler.Services.ContractsService.Snapshot contractsSnapshot;
        public ZedIdler.Services.EquipmentService.Snapshot equipmentSnapshot;
        public ZedIdler.Services.PrestigeService.Snapshot prestigeSnapshot;
        public ZedIdler.Services.DailyRewardService.Snapshot dailySnapshot;
    }

    /// <summary>
    /// Public surface for <see cref="GameManager"/>. Systems should resolve this
    /// via <see cref="ZedIdler.Services.ServiceLocator"/> rather than holding a
    /// direct reference to the concrete class — keeps the codebase testable.
    /// </summary>
    public interface IGameManager
    {
        GameState CurrentState { get; }
        GameState PreviousState { get; }
        bool IsSaving { get; }
        DateTime LastSaveUtc { get; }
        TimeSpan OfflineDelta { get; }

        event Action<GameState, GameState> OnGameStateChanged;
        event Action<string> OnSaveStarted;
        event Action<bool, string> OnSaveCompleted;
        event Action<bool, SaveData> OnLoadCompleted;
        event Action<TimeSpan> OnOfflineProgressApplied;
        event Action<bool> OnApplicationSuspended;

        void TransitionTo(GameState next);
        void RequestSave();
        bool TryLoad(out SaveData data);
    }
}
