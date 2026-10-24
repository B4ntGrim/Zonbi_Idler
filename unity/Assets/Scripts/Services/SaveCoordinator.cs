// Assets/Scripts/Services/SaveCoordinator.cs
using UnityEngine;
using ZedIdler.Core;

namespace ZedIdler.Services
{
    /// <summary>
    /// Centralized restore-on-load dispatcher. Subscribes to
    /// <see cref="IGameManager.OnLoadCompleted"/> and routes each snapshot in
    /// the loaded <see cref="SaveData"/> to its owning service, then applies
    /// the offline-progress delta to systems that need to fast-forward.
    /// </summary>
    /// <remarks>
    /// Placement: persistent on the Bootstrap GameObject (DontDestroyOnLoad),
    /// alongside <see cref="GameManager"/>. Order of operations:
    ///   1. Schedule.Restore → run state reattaches.
    ///   2. TimeService.Restore → in-game clock resumes at saved hour.
    ///   3. TraversalContext.Restore → grid + selected zone.
    ///   4. PlayerProfile.Restore → credits + camp level + rescue ledger.
    ///   5. BackpackService.Restore → only meaningful if a run was in progress.
    ///   6. RecyclerService.Restore → queue rebuilt.
    ///   7. MarketplaceService.Restore → listings rebuilt; events re-bound
    ///      lazily by host (catalog lookup needed).
    ///   8. ApplyOfflineProgress on every system that supports it, using the
    ///      delta computed by GameManager.
    ///
    /// Each step resolves its service via <see cref="ServiceLocator.TryGet"/>;
    /// missing services are silently skipped so partial setups work fine for
    /// unit tests / scene-by-scene development.
    /// </remarks>
    [DisallowMultipleComponent]
    public sealed class SaveCoordinator : MonoBehaviour
    {
        [Header("Behavior")]
        [Tooltip("If true, the coordinator subscribes on Awake and routes restores automatically. " +
                 "If false, the host must call RestoreAll() manually.")]
        [SerializeField] private bool autoRestoreOnLoad = true;

        [Tooltip("Log restore + offline-progress activity to the console.")]
        [SerializeField] private bool verbose = true;

        private IGameManager _gm;
        private SaveData _lastLoaded;
        private bool _hasLoaded;

        private void Awake() => DontDestroyOnLoad(gameObject);

        private void OnEnable()
        {
            if (ServiceLocator.TryGet<IGameManager>(out _gm))
            {
                _gm.OnLoadCompleted += HandleLoadCompleted;
                _gm.OnOfflineProgressApplied += HandleOfflineProgress;
            }
            else
            {
                ServiceLocator.OnServiceRegistered += LazyHookGameManager;
            }
        }

        private void OnDisable()
        {
            ServiceLocator.OnServiceRegistered -= LazyHookGameManager;
            if (_gm != null)
            {
                _gm.OnLoadCompleted -= HandleLoadCompleted;
                _gm.OnOfflineProgressApplied -= HandleOfflineProgress;
            }
        }

        private void LazyHookGameManager(System.Type t, object svc)
        {
            if (t != typeof(IGameManager)) return;
            _gm = svc as IGameManager;
            if (_gm == null) return;
            _gm.OnLoadCompleted += HandleLoadCompleted;
            _gm.OnOfflineProgressApplied += HandleOfflineProgress;
            ServiceLocator.OnServiceRegistered -= LazyHookGameManager;
        }

        private void HandleLoadCompleted(bool success, SaveData data)
        {
            if (!success) return;
            _lastLoaded = data;
            _hasLoaded  = true;
            if (autoRestoreOnLoad) RestoreAll(data);
        }

        private void HandleOfflineProgress(System.TimeSpan delta)
        {
            if (delta <= System.TimeSpan.Zero) return;
            ApplyOfflineProgressToAll(delta);
        }

        // ─── Public API ───────────────────────────────────────────────────────
        /// <summary>
        /// Restore every system from the provided save payload. Safe to call
        /// before all services have registered; missing ones are skipped.
        /// </summary>
        public void RestoreAll(SaveData data)
        {
            Log("RestoreAll: dispatching snapshots…");

            // 1. Schedule
            if (ServiceLocator.TryGet<ZedIdler.Systems.IScheduleService>(out var sched))
            {
                sched.Restore(data.scheduleSnapshot);
                Log($"  schedule restored — {sched.Queue.Count} task(s), state {sched.State}");
            }

            // 2. Time
            if (ServiceLocator.TryGet<ITimeService>(out var ts) && ts is TimeService timeImpl)
            {
                timeImpl.Restore(data.timeSnapshot);
                Log($"  time restored — hour {ts.CurrentHour}");
            }

            // 3. Traversal
            if (ServiceLocator.TryGet<ITraversalContext>(out var tc) && tc is TraversalContext travImpl)
            {
                travImpl.Restore(data.traversalSnapshot);
                Log($"  traversal restored — biome {tc.CurrentBiome}, zone {tc.CurrentZoneId ?? "none"}");
            }

            // 4. PlayerProfile
            if (ServiceLocator.TryGet<IPlayerProfile>(out var profile))
            {
                profile.Restore(data.profileSnapshot);
                Log($"  profile restored — campLevel {profile.CampLevel}, credits {profile.Credits}");
            }

            // 5. Backpack
            if (ServiceLocator.TryGet<IBackpackService>(out var bag))
            {
                bag.Restore(data.backpackSnapshot);
                Log($"  backpack restored — {bag.CurrentWeight:F1}/{bag.WeightCap:F1}kg");
            }

            // 6. Recycler
            if (ServiceLocator.TryGet<IRecyclerService>(out var rec))
            {
                rec.Restore(data.recyclerSnapshot);
                Log($"  recycler restored — {rec.Queue.Count} job(s) queued");
            }

            // 7. Marketplace
            if (ServiceLocator.TryGet<IMarketplaceService>(out var market))
            {
                market.Restore(data.marketplaceSnapshot);
                Log($"  marketplace restored — {market.Listings.Count} listing(s)");
            }

            // 8. Factions
            if (ServiceLocator.TryGet<IFactionService>(out var factions))
            {
                factions.Restore(data.factionSnapshot);
                Log($"  factions restored — {factions.Reputation.Count} faction(s)");
            }

            // 9. Contracts
            if (ServiceLocator.TryGet<IContractsService>(out var contracts))
            {
                contracts.Restore(data.contractsSnapshot);
                Log($"  contracts restored — {contracts.All.Count} contract(s)");
            }

            // 10. Equipment
            if (ServiceLocator.TryGet<IEquipmentService>(out var equip))
            {
                equip.Restore(data.equipmentSnapshot);
                Log($"  equipment restored");
            }

            // 11. Prestige
            if (ServiceLocator.TryGet<IPrestigeService>(out var prestige))
            {
                prestige.Restore(data.prestigeSnapshot);
                Log($"  prestige restored — {prestige.LegacyPoints} LP, count {prestige.PrestigeCount}");
            }

            // 12. Daily rewards
            if (ServiceLocator.TryGet<IDailyRewardService>(out var daily))
            {
                daily.Restore(data.dailySnapshot);
                Log($"  daily restored — streak {daily.CurrentStreak}");
            }

            Log("RestoreAll complete.");
        }

        /// <summary>
        /// Fast-forward every offline-aware system by the given elapsed delta.
        /// Called automatically when GameManager fires OnOfflineProgressApplied.
        /// </summary>
        public void ApplyOfflineProgressToAll(System.TimeSpan delta)
        {
            Log($"ApplyOfflineProgress: {delta.TotalMinutes:F1} min");

            if (ServiceLocator.TryGet<ITimeService>(out var ts) && ts is TimeService timeImpl)
            {
                timeImpl.Advance((float)delta.TotalSeconds);
            }
            if (ServiceLocator.TryGet<ZedIdler.Systems.IScheduleService>(out var sched))
            {
                sched.ApplyOfflineProgress(delta);
            }
            if (ServiceLocator.TryGet<IRecyclerService>(out var rec))
            {
                int done = rec.ApplyOfflineProgress(delta);
                Log($"  recycler completed {done} job(s) offline");
            }
            if (ServiceLocator.TryGet<IMarketplaceService>(out var market))
            {
                market.ApplyOfflineProgress(delta);
            }
            if (ServiceLocator.TryGet<IPlayerProfile>(out var profile))
            {
                profile.TickExpiry(System.DateTime.UtcNow.Ticks);
            }
        }

        /// <summary>
        /// Re-apply the last loaded snapshot (e.g. after a system registered late).
        /// </summary>
        public bool ReplayLastLoad()
        {
            if (!_hasLoaded) return false;
            RestoreAll(_lastLoaded);
            return true;
        }

        private void Log(string msg)
        {
            if (verbose) Debug.Log($"[SaveCoordinator] {msg}");
        }
    }
}
