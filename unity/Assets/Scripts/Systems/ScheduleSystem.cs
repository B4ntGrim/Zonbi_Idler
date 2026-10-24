// Assets/Scripts/Systems/ScheduleSystem.cs
using System;
using System.Collections.Generic;
using UnityEngine;

namespace ZedIdler.Systems
{
    /// <summary>
    /// 24-hour offline task scheduler. Implements the Draft → Save → Confirm → Run
    /// flow established by the HTML prototype.
    /// </summary>
    /// <remarks>
    /// State machine:
    ///   Draft     — editable; player can add, remove, reorder tasks.
    ///   Locked    — Save Draft pressed; hours are committed but not yet running.
    ///   Confirmed — Confirm pressed; the queue is now executing in wall-clock time.
    ///   Completed — all tasks finished; player can collect rewards and start a new draft.
    ///
    /// Hard rules:
    /// • Total scheduled hours must be ≤ 24 (<see cref="MaxScheduleHours"/>).
    /// • Only the six allowed task types are accepted: Craft, Train, Repair,
    ///   Trade, Rest, PreppingForHorde.
    /// • Tasks execute strictly in priority order while the player is offline.
    /// • Real-world wall-clock progression — when the player reopens the app,
    ///   <see cref="ApplyOfflineProgress"/> advances completion using DateTime.UtcNow
    ///   minus <c>confirmedAtUtcTicks</c>.
    ///
    /// Persistence:
    /// The full schedule is serialized via <see cref="ScheduleSnapshot"/>. The
    /// owning save system writes/reads this snapshot. Re-bind events on load via
    /// <see cref="Initialize"/>.
    /// </remarks>
    [Serializable]
    public sealed class ScheduleSystem : IScheduleService
    {
        public const int MaxScheduleHours = 24;
        public const int MaxTasks = 12;

        // ─── Serialized state ─────────────────────────────────────────────────
        [SerializeField] private List<ScheduleTask> queue = new List<ScheduleTask>();
        [SerializeField] private ScheduleState state = ScheduleState.Draft;
        [SerializeField] private long confirmedAtUtcTicks;
        [SerializeField] private float currentTaskElapsedSeconds;

        // ─── Public state ─────────────────────────────────────────────────────
        public ScheduleState State => state;
        public IReadOnlyList<ScheduleTask> Queue => queue;
        public int TotalHours
        {
            get
            {
                int total = 0;
                for (int i = 0; i < queue.Count; i++) total += queue[i].durationHours;
                return total;
            }
        }
        public int RemainingHours => Mathf.Max(0, MaxScheduleHours - TotalHours);
        public bool IsOverBudget => TotalHours > MaxScheduleHours;
        public bool CanAddTask(int durationHours) =>
            state == ScheduleState.Draft && (TotalHours + durationHours) <= MaxScheduleHours
            && queue.Count < MaxTasks;

        // ─── Events ───────────────────────────────────────────────────────────
        public event Action<ScheduleTask> OnTaskAdded;
        public event Action<ScheduleTask> OnTaskRemoved;
        public event Action OnTasksReordered;
        public event Action OnDraftSaved;
        public event Action OnDraftReverted;
        public event Action OnScheduleConfirmed;
        public event Action<ScheduleTask> OnTaskStarted;
        public event Action<ScheduleTask> OnTaskCompleted;
        public event Action OnScheduleCompleted;

        // ─── Mutations (Draft state only) ─────────────────────────────────────
        public bool AddTask(ScheduleTaskType type, int durationHours)
        {
            if (state != ScheduleState.Draft)
            {
                Debug.LogWarning("[ScheduleSystem] Cannot add task while schedule is locked.");
                return false;
            }
            if (!IsAllowedType(type))
            {
                Debug.LogWarning($"[ScheduleSystem] Task type '{type}' is not in the allowed set.");
                return false;
            }
            if (durationHours <= 0 || durationHours > MaxScheduleHours)
            {
                Debug.LogWarning($"[ScheduleSystem] Invalid duration {durationHours}.");
                return false;
            }
            if (!CanAddTask(durationHours))
            {
                Debug.LogWarning($"[ScheduleSystem] Adding task would exceed {MaxScheduleHours}h cap.");
                return false;
            }

            var task = new ScheduleTask
            {
                id = Guid.NewGuid().ToString("N"),
                type = type,
                durationHours = durationHours,
                priority = queue.Count + 1,
                status = TaskStatus.Pending
            };
            queue.Add(task);
            OnTaskAdded?.Invoke(task);
            return true;
        }

        public bool RemoveTask(string taskId)
        {
            if (state != ScheduleState.Draft) return false;
            for (int i = 0; i < queue.Count; i++)
            {
                if (queue[i].id == taskId)
                {
                    var t = queue[i];
                    queue.RemoveAt(i);
                    RenumberPriorities();
                    OnTaskRemoved?.Invoke(t);
                    return true;
                }
            }
            return false;
        }

        public bool MoveTask(string taskId, int newIndex)
        {
            if (state != ScheduleState.Draft) return false;
            int from = queue.FindIndex(t => t.id == taskId);
            if (from < 0) return false;
            newIndex = Mathf.Clamp(newIndex, 0, queue.Count - 1);
            if (from == newIndex) return false;
            var t = queue[from];
            queue.RemoveAt(from);
            queue.Insert(newIndex, t);
            RenumberPriorities();
            OnTasksReordered?.Invoke();
            return true;
        }

        public bool MoveUp(string taskId)   => MoveByDelta(taskId, -1);
        public bool MoveDown(string taskId) => MoveByDelta(taskId, +1);

        private bool MoveByDelta(string taskId, int delta)
        {
            int idx = queue.FindIndex(t => t.id == taskId);
            if (idx < 0) return false;
            return MoveTask(taskId, idx + delta);
        }

        private void RenumberPriorities()
        {
            for (int i = 0; i < queue.Count; i++)
            {
                var t = queue[i]; t.priority = i + 1; queue[i] = t;
            }
        }

        // ─── State transitions ────────────────────────────────────────────────
        public bool SaveDraft()
        {
            if (state != ScheduleState.Draft) return false;
            if (queue.Count == 0)
            {
                Debug.LogWarning("[ScheduleSystem] Cannot save empty draft.");
                return false;
            }
            if (IsOverBudget)
            {
                Debug.LogWarning("[ScheduleSystem] Cannot save over-budget draft.");
                return false;
            }
            state = ScheduleState.Locked;
            OnDraftSaved?.Invoke();
            return true;
        }

        public bool RevertDraft()
        {
            if (state != ScheduleState.Locked) return false;
            state = ScheduleState.Draft;
            OnDraftReverted?.Invoke();
            return true;
        }

        public bool ConfirmSchedule()
        {
            if (state != ScheduleState.Locked) return false;
            state = ScheduleState.Confirmed;
            confirmedAtUtcTicks = DateTime.UtcNow.Ticks;
            currentTaskElapsedSeconds = 0f;
            OnScheduleConfirmed?.Invoke();
            if (queue.Count > 0) OnTaskStarted?.Invoke(queue[0]);
            return true;
        }

        public bool StartNewDraft()
        {
            if (state != ScheduleState.Completed) return false;
            queue.Clear();
            state = ScheduleState.Draft;
            confirmedAtUtcTicks = 0;
            currentTaskElapsedSeconds = 0f;
            return true;
        }

        // ─── Progression ──────────────────────────────────────────────────────
        /// <summary>
        /// Apply offline wall-clock progression. Call once after loading a save,
        /// passing the elapsed real-world time. Cascades through tasks in priority
        /// order, firing started/completed events for each.
        /// </summary>
        /// <param name="elapsed">Real-world time elapsed since last update.</param>
        public void ApplyOfflineProgress(TimeSpan elapsed)
        {
            if (state != ScheduleState.Confirmed) return;

            float secondsToBurn = Mathf.Max(0f, (float)elapsed.TotalSeconds);
            while (secondsToBurn > 0f && state == ScheduleState.Confirmed)
            {
                int activeIdx = queue.FindIndex(t => t.status != TaskStatus.Completed);
                if (activeIdx < 0)
                {
                    state = ScheduleState.Completed;
                    OnScheduleCompleted?.Invoke();
                    return;
                }

                var task = queue[activeIdx];
                float taskTotalSeconds = task.durationHours * 3600f;
                float remaining = taskTotalSeconds - currentTaskElapsedSeconds;

                if (secondsToBurn >= remaining)
                {
                    // Complete this task.
                    secondsToBurn -= remaining;
                    currentTaskElapsedSeconds = 0f;
                    task.status = TaskStatus.Completed;
                    queue[activeIdx] = task;
                    OnTaskCompleted?.Invoke(task);

                    // Start next or mark done.
                    int nextIdx = activeIdx + 1;
                    if (nextIdx < queue.Count) OnTaskStarted?.Invoke(queue[nextIdx]);
                    else
                    {
                        state = ScheduleState.Completed;
                        OnScheduleCompleted?.Invoke();
                        return;
                    }
                }
                else
                {
                    // Partial progress on current task.
                    currentTaskElapsedSeconds += secondsToBurn;
                    secondsToBurn = 0f;
                    task.status = TaskStatus.Running;
                    queue[activeIdx] = task;
                }
            }
        }

        /// <summary>
        /// Tick from real-time foreground (Update loop). Same logic as offline progress
        /// but driven by deltaTime instead of a one-shot TimeSpan.
        /// </summary>
        public void Tick(float deltaSeconds) =>
            ApplyOfflineProgress(TimeSpan.FromSeconds(deltaSeconds));

        /// <summary>Snapshot for save/load.</summary>
        public ScheduleSnapshot CreateSnapshot() => new ScheduleSnapshot
        {
            state = state,
            confirmedAtUtcTicks = confirmedAtUtcTicks,
            currentTaskElapsedSeconds = currentTaskElapsedSeconds,
            tasks = queue.ToArray()
        };

        /// <summary>Restore from a save snapshot. Skips events.</summary>
        public void Restore(ScheduleSnapshot snap)
        {
            state = snap.state;
            confirmedAtUtcTicks = snap.confirmedAtUtcTicks;
            currentTaskElapsedSeconds = snap.currentTaskElapsedSeconds;
            queue.Clear();
            if (snap.tasks != null) queue.AddRange(snap.tasks);
        }

        public void Initialize()
        {
            // Hook for re-binding cross-system events after load. Empty for now.
        }

        // ─── Helpers ──────────────────────────────────────────────────────────
        private static bool IsAllowedType(ScheduleTaskType t) =>
            t == ScheduleTaskType.Craft
         || t == ScheduleTaskType.Train
         || t == ScheduleTaskType.Repair
         || t == ScheduleTaskType.MarketplaceTrade
         || t == ScheduleTaskType.Rest
         || t == ScheduleTaskType.PreppingForHorde;
    }

    /// <summary>
    /// The schedule's lifecycle state. Drives UI button visibility:
    ///   Draft     → "Save Draft" button visible.
    ///   Locked    → "Revert" + "Confirm Schedule" visible.
    ///   Confirmed → read-only status panel; "Cancel" optional.
    ///   Completed → "Collect Rewards" + "New Draft" visible.
    /// </summary>
    public enum ScheduleState
    {
        Draft     = 0,
        Locked    = 1,
        Confirmed = 2,
        Completed = 3
    }

    /// <summary>
    /// The 6 allowed scheduled task types. Authoritative — UI dropdown must read this.
    /// </summary>
    public enum ScheduleTaskType
    {
        Craft             = 0,
        Train             = 1,
        Repair            = 2,
        MarketplaceTrade  = 3,
        Rest              = 4,
        PreppingForHorde  = 5
    }

    public enum TaskStatus
    {
        Pending   = 0,
        Running   = 1,
        Completed = 2
    }

    [Serializable]
    public struct ScheduleTask
    {
        public string id;
        public ScheduleTaskType type;
        public int durationHours;
        public int priority;
        public TaskStatus status;
    }

    [Serializable]
    public struct ScheduleSnapshot
    {
        public ScheduleState state;
        public long confirmedAtUtcTicks;
        public float currentTaskElapsedSeconds;
        public ScheduleTask[] tasks;
    }

    /// <summary>
    /// Public contract registered with <see cref="ZedIdler.Services.ServiceLocator"/>.
    /// UI and other systems should resolve this rather than holding the concrete class.
    /// </summary>
    public interface IScheduleService
    {
        ScheduleState State { get; }
        IReadOnlyList<ScheduleTask> Queue { get; }
        int TotalHours { get; }
        int RemainingHours { get; }
        bool IsOverBudget { get; }
        bool CanAddTask(int durationHours);

        event Action<ScheduleTask> OnTaskAdded;
        event Action<ScheduleTask> OnTaskRemoved;
        event Action OnTasksReordered;
        event Action OnDraftSaved;
        event Action OnDraftReverted;
        event Action OnScheduleConfirmed;
        event Action<ScheduleTask> OnTaskStarted;
        event Action<ScheduleTask> OnTaskCompleted;
        event Action OnScheduleCompleted;

        bool AddTask(ScheduleTaskType type, int durationHours);
        bool RemoveTask(string taskId);
        bool MoveTask(string taskId, int newIndex);
        bool MoveUp(string taskId);
        bool MoveDown(string taskId);

        bool SaveDraft();
        bool RevertDraft();
        bool ConfirmSchedule();
        bool StartNewDraft();

        void ApplyOfflineProgress(TimeSpan elapsed);
        void Tick(float deltaSeconds);

        ScheduleSnapshot CreateSnapshot();
        void Restore(ScheduleSnapshot snap);
    }
}
