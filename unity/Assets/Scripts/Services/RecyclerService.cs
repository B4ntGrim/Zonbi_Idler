// Assets/Scripts/Services/RecyclerService.cs
using System;
using System.Collections.Generic;
using UnityEngine;
using ZedIdler.Data;
using ZedIdler.Entities;

namespace ZedIdler.Services
{
    /// <summary>
    /// Persistent backend that runs the camp's recycler. Owns the job queue,
    /// active processing slots, operator assignment, and offline progression.
    /// </summary>
    /// <remarks>
    /// Architecture:
    /// • One persistent <see cref="MonoBehaviour"/> registered as <see cref="IRecyclerService"/>.
    /// • Background-ticks via Update; pauses gracefully when paused or unlocked=false.
    /// • Offline catch-up: <see cref="ApplyOfflineProgress"/> consumes a TimeSpan and
    ///   resolves as many queued recipes as fit (real wall-clock).
    /// • Gated by <see cref="IUnlockService.IsUnlocked"/>("recycler") — early-game
    ///   players can queue but processing won't start until camp level ≥ 15.
    ///
    /// Bonuses:
    /// • Operator class adds speed + yield multipliers (Engineer / Mechanic / Scholar / Chemist).
    /// • Recycler Pro perk stacks (additive across ALL camp survivors with the perk) add yield.
    ///
    /// Slot growth: <see cref="slotsByLevel"/> is a designer-tunable ladder. Default —
    /// 1 slot at L15, 2 at L25, 3 at L40, 4 at L60.
    /// </remarks>
    [DisallowMultipleComponent]
    public sealed class RecyclerService : MonoBehaviour, IRecyclerService
    {
        [Header("Slot Growth (campLevel → concurrent slots)")]
        [SerializeField] private List<SlotRule> slotsByLevel = new List<SlotRule>
        {
            new SlotRule { minCampLevel = 15, slots = 1 },
            new SlotRule { minCampLevel = 25, slots = 2 },
            new SlotRule { minCampLevel = 40, slots = 3 },
            new SlotRule { minCampLevel = 60, slots = 4 },
        };

        [Header("Class Bonuses (additive to base 1.0)")]
        [SerializeField] private List<ClassBonus> classBonuses = new List<ClassBonus>
        {
            new ClassBonus { type = CharacterType.Engineer, speedBonus = 0.20f, yieldBonus = 0.00f },
            new ClassBonus { type = CharacterType.Mechanic, speedBonus = 0.15f, yieldBonus = 0.10f },
            new ClassBonus { type = CharacterType.Scholar,  speedBonus = 0.00f, yieldBonus = 0.25f },
            new ClassBonus { type = CharacterType.Chemist,  speedBonus = 0.10f, yieldBonus = 0.15f },
        };

        [Header("Behavior")]
        [SerializeField] private bool tickInBackground = true;

        // ─── Services ─────────────────────────────────────────────────────────
        private IInventoryService _inventory;
        private IUnlockService _unlocks;
        private IPlayerProfile _profile;

        // ─── State ────────────────────────────────────────────────────────────
        private readonly List<RecyclerJob> _queue = new List<RecyclerJob>(); // unbounded
        private string _operatorSurvivorId;
        private CharacterType _operatorClass = CharacterType.Scavenger; // placeholder
        private float _campRecyclerProYieldBonus; // recomputed when survivor pool changes
        private List<Survivor> _camp = new List<Survivor>(); // bound externally
        private readonly PerformanceUtils.FixedIntervalTicker _tickGate = new PerformanceUtils.FixedIntervalTicker(0.25f);

        public IReadOnlyList<RecyclerJob> Queue => _queue;
        public int ConcurrentSlots => ComputeSlotsForLevel(_profile?.CampLevel ?? 0);
        public bool IsUnlocked => _unlocks?.IsUnlocked("recycler") ?? false;
        public string OperatorSurvivorId => _operatorSurvivorId;
        public CharacterType OperatorClass => _operatorClass;

        // ─── Events ───────────────────────────────────────────────────────────
        public event Action<RecyclerJob> OnJobQueued;
        public event Action<RecyclerJob> OnJobStarted;
        public event Action<RecyclerJob> OnJobCompleted;
        public event Action<RecyclerJob, string> OnJobCancelled;
        public event Action<string> OnOperatorChanged;

        // ─── Lifecycle ────────────────────────────────────────────────────────
        private void Awake()
        {
            DontDestroyOnLoad(gameObject);
            ServiceLocator.Register<IRecyclerService>(this);
        }

        private void OnDestroy() => ServiceLocator.Unregister<IRecyclerService>();

        private void Start()
        {
            ServiceLocator.TryGet(out _inventory);
            ServiceLocator.TryGet(out _unlocks);
            ServiceLocator.TryGet(out _profile);
        }

        private void Update()
        {
            if (!tickInBackground) return;
            if (!IsUnlocked) return;
            // Fixed 0.25s tick gate — drops Recycler off the per-frame path.
            if (_tickGate.Tick(Time.deltaTime)) Tick(_tickGate.Interval);
        }

        // ─── Public API ───────────────────────────────────────────────────────
        public void BindCamp(IEnumerable<Survivor> camp)
        {
            _camp = new List<Survivor>(camp ?? Array.Empty<Survivor>());
            RecomputeRecyclerProBonus();
        }

        public bool AssignOperator(Survivor survivor)
        {
            if (survivor == null) return false;
            _operatorSurvivorId = survivor.Id;
            _operatorClass = survivor.CharacterType;
            OnOperatorChanged?.Invoke(_operatorSurvivorId);
            return true;
        }

        public void ClearOperator()
        {
            _operatorSurvivorId = null;
            _operatorClass = CharacterType.Scavenger;
            OnOperatorChanged?.Invoke(null);
        }

        /// <summary>
        /// Queue a recipe. Pulls materials from inventory IMMEDIATELY (safer per spec)
        /// and reserves them on the job. Returns the queued job, or default if rejected.
        /// </summary>
        public RecyclerJob QueueRecipe(RecyclerRecipe recipe)
        {
            if (recipe == null) return default;
            if (_inventory == null)
            {
                Debug.LogWarning("[Recycler] No inventory bound — cannot queue.");
                return default;
            }

            // Check + reserve materials.
            for (int i = 0; i < recipe.Inputs.Length; i++)
            {
                var input = recipe.Inputs[i];
                if (_inventory.GetQuantity(input.itemId) < input.quantity)
                {
                    Debug.LogWarning($"[Recycler] Missing {input.quantity}× {input.itemId} for {recipe.RecipeId}.");
                    return default;
                }
            }
            for (int i = 0; i < recipe.Inputs.Length; i++)
            {
                var input = recipe.Inputs[i];
                _inventory.Consume(input.itemId, input.quantity);
            }

            var job = new RecyclerJob
            {
                jobId = Guid.NewGuid().ToString("N"),
                recipeId = recipe.RecipeId,
                queuedUtcTicks = DateTime.UtcNow.Ticks,
                progressSeconds = 0f,
                state = RecyclerJobState.Queued,
                processSeconds = recipe.ProcessSeconds
            };
            _queue.Add(job);
            OnJobQueued?.Invoke(job);
            return job;
        }

        /// <summary>Cancel a job. Inputs are NOT refunded (sunk cost; can revisit).</summary>
        public bool CancelJob(string jobId)
        {
            for (int i = 0; i < _queue.Count; i++)
            {
                if (_queue[i].jobId == jobId)
                {
                    var j = _queue[i];
                    j.state = RecyclerJobState.Cancelled;
                    _queue.RemoveAt(i);
                    OnJobCancelled?.Invoke(j, "user");
                    return true;
                }
            }
            return false;
        }

        public void Tick(float deltaSeconds)
        {
            if (deltaSeconds <= 0 || _queue.Count == 0) return;
            ProcessForSeconds(deltaSeconds);
        }

        /// <summary>Resolve queued jobs against a wall-clock window. Returns # completed.</summary>
        public int ApplyOfflineProgress(TimeSpan elapsed)
        {
            float seconds = Mathf.Max(0f, (float)elapsed.TotalSeconds);
            return ProcessForSeconds(seconds);
        }

        // ─── Processing core ──────────────────────────────────────────────────
        private int ProcessForSeconds(float seconds)
        {
            int completedCount = 0;
            int slots = ConcurrentSlots;
            if (slots <= 0) return 0;

            // The first 'slots' queued jobs are the "active" ones.
            float speedMult = 1f + GetOperatorSpeedBonus();

            // We process active jobs in lockstep — each tick advances every active slot by
            // (seconds × speed). When a slot finishes, the next queued job takes its place.
            while (seconds > 0f && _queue.Count > 0)
            {
                int active = Mathf.Min(slots, _queue.Count);
                float minRemainingScaled = float.MaxValue;

                for (int i = 0; i < active; i++)
                {
                    var j = _queue[i];
                    if (j.state == RecyclerJobState.Queued)
                    {
                        j.state = RecyclerJobState.Processing;
                        _queue[i] = j;
                        OnJobStarted?.Invoke(j);
                    }
                    float remaining = (j.processSeconds - j.progressSeconds) / Mathf.Max(0.01f, speedMult);
                    if (remaining < minRemainingScaled) minRemainingScaled = remaining;
                }

                float burn = Mathf.Min(seconds, minRemainingScaled);
                seconds -= burn;

                // Advance every active job by `burn * speedMult` real-process-seconds.
                float advance = burn * speedMult;
                for (int i = active - 1; i >= 0; i--)
                {
                    var j = _queue[i];
                    j.progressSeconds += advance;
                    if (j.progressSeconds >= j.processSeconds - 0.0001f)
                    {
                        j.state = RecyclerJobState.Completed;
                        CompleteJob(j);
                        _queue.RemoveAt(i);
                        completedCount++;
                    }
                    else
                    {
                        _queue[i] = j;
                    }
                }
            }
            return completedCount;
        }

        private void CompleteJob(RecyclerJob job)
        {
            // Look up recipe by id via catalog service.
            var catalog = ServiceLocator.Get<ICatalogService>();
            RecyclerRecipe recipe = catalog is IRecyclerCatalogProvider rcp ? rcp.GetRecyclerRecipe(job.recipeId) : null;
            if (recipe == null || _inventory == null)
            {
                Debug.LogWarning($"[Recycler] Cannot resolve recipe '{job.recipeId}' on completion.");
                OnJobCompleted?.Invoke(job);
                return;
            }
            float yieldMult = 1f + GetOperatorYieldBonus() + _campRecyclerProYieldBonus;
            for (int i = 0; i < recipe.Outputs.Length; i++)
            {
                var o = recipe.Outputs[i];
                int qty = Mathf.Max(1, Mathf.RoundToInt(o.quantity * yieldMult));
                _inventory.AddDrop(new LootDrop { itemId = o.itemId, quantity = qty, rarity = o.outputRarity });
            }
            OnJobCompleted?.Invoke(job);
        }

        // ─── Bonus math ───────────────────────────────────────────────────────
        private float GetOperatorSpeedBonus()
        {
            for (int i = 0; i < classBonuses.Count; i++)
                if (classBonuses[i].type == _operatorClass) return classBonuses[i].speedBonus;
            return 0f;
        }
        private float GetOperatorYieldBonus()
        {
            for (int i = 0; i < classBonuses.Count; i++)
                if (classBonuses[i].type == _operatorClass) return classBonuses[i].yieldBonus;
            return 0f;
        }

        /// <summary>
        /// Recompute Recycler Pro perk bonus from every camp survivor. Per spec,
        /// the perk works "from any survivor with it unlocked", so we sum stacks
        /// across the camp.
        /// </summary>
        private void RecomputeRecyclerProBonus()
        {
            int totalStacks = 0;
            for (int i = 0; i < _camp.Count; i++)
            {
                var s = _camp[i];
                if (s == null) continue;
                foreach (var entry in s.Perks.Stacks)
                {
                    if (entry.perkId == "recycler_pro") totalStacks += entry.count;
                }
            }
            // Spec curve: stack 1=+10%, 2=+20%, 3=+35%. We linearly interpolate beyond 3.
            _campRecyclerProYieldBonus = ZedIdler.Services.BalanceRuntime.RecyclerProBonus(totalStacks);
        }

        private int ComputeSlotsForLevel(int level)
        {
            int best = 0;
            for (int i = 0; i < slotsByLevel.Count; i++)
            {
                if (level >= slotsByLevel[i].minCampLevel && slotsByLevel[i].slots > best)
                    best = slotsByLevel[i].slots;
            }
            return best;
        }

        // ─── Snapshot ─────────────────────────────────────────────────────────
        [Serializable]
        public struct Snapshot
        {
            public RecyclerJob[] queue;
            public string operatorSurvivorId;
            public CharacterType operatorClass;
        }

        public Snapshot CreateSnapshot() => new Snapshot
        {
            queue = _queue.ToArray(),
            operatorSurvivorId = _operatorSurvivorId,
            operatorClass = _operatorClass
        };

        public void Restore(Snapshot s)
        {
            _queue.Clear();
            if (s.queue != null) _queue.AddRange(s.queue);
            _operatorSurvivorId = s.operatorSurvivorId;
            _operatorClass = s.operatorClass;
        }

        [Serializable]
        public struct SlotRule
        {
            public int minCampLevel;
            public int slots;
        }

        [Serializable]
        public struct ClassBonus
        {
            public CharacterType type;
            [Range(0f, 1f)] public float speedBonus;
            [Range(0f, 1f)] public float yieldBonus;
        }
    }

    public interface IRecyclerService
    {
        IReadOnlyList<RecyclerJob> Queue { get; }
        int ConcurrentSlots { get; }
        bool IsUnlocked { get; }
        string OperatorSurvivorId { get; }
        CharacterType OperatorClass { get; }

        event Action<RecyclerJob> OnJobQueued;
        event Action<RecyclerJob> OnJobStarted;
        event Action<RecyclerJob> OnJobCompleted;
        event Action<RecyclerJob, string> OnJobCancelled;
        event Action<string> OnOperatorChanged;

        void BindCamp(IEnumerable<Survivor> camp);
        bool AssignOperator(Survivor survivor);
        void ClearOperator();
        RecyclerJob QueueRecipe(RecyclerRecipe recipe);
        bool CancelJob(string jobId);
        void Tick(float deltaSeconds);
        int  ApplyOfflineProgress(TimeSpan elapsed);
        RecyclerService.Snapshot CreateSnapshot();
        void Restore(RecyclerService.Snapshot s);
    }

    /// <summary>
    /// Optional extension on CatalogService to resolve RecyclerRecipe assets by id.
    /// Phase 2 implementation lives in CatalogService.cs as a partial.
    /// </summary>
    public interface IRecyclerCatalogProvider
    {
        RecyclerRecipe GetRecyclerRecipe(string recipeId);
    }

    [Serializable]
    public struct RecyclerJob
    {
        public string jobId;
        public string recipeId;
        public long queuedUtcTicks;
        public float progressSeconds;
        public float processSeconds;
        public RecyclerJobState state;
        public float ProgressNormalized => processSeconds <= 0 ? 0 : Mathf.Clamp01(progressSeconds / processSeconds);
    }

    public enum RecyclerJobState
    {
        Queued     = 0,
        Processing = 1,
        Completed  = 2,
        Cancelled  = 3
    }
}
