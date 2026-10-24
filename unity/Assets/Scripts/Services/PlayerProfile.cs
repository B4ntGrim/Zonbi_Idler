// Assets/Scripts/Services/PlayerProfile.cs
using System;
using System.Collections.Generic;
using UnityEngine;
using ZedIdler.Entities;

namespace ZedIdler.Services
{
    /// <summary>
    /// Camp-wide progression aggregator. Sums all survivor XP into a single
    /// <see cref="CampLevel"/> that gates building unlocks and squad size growth.
    /// Also owns the rescue-mission ledger when survivors fall mid-run.
    /// </summary>
    /// <remarks>
    /// Camp Level formula (spec section 5):
    /// <c>CampLevel = Floor(TotalSurvivorXP / CampXPDivisor)</c>
    /// Default divisor: 500. Tunable in inspector.
    ///
    /// Squad slots scale with camp level milestones — default 1, +1 at levels 5, 10, 20.
    /// </remarks>
    [DisallowMultipleComponent]
    public sealed class PlayerProfile : MonoBehaviour, IPlayerProfile
    {
        [Header("Camp Level")]
        [Tooltip("Total survivor XP divided by this value yields the camp level.")]
        [SerializeField, Range(50, 5000)] private int campXpDivisor = 500;

        [Header("Currency")]
        [SerializeField, Range(0, 1000000)] private int startingCredits = 100;

        [Header("Squad Growth Thresholds (camp levels)")]
        [SerializeField] private int squadSlot2AtLevel = 5;
        [SerializeField] private int squadSlot3AtLevel = 10;
        [SerializeField] private int squadSlot4AtLevel = 20;
        [SerializeField, Range(1, 4)] private int initialSquadSlots = 1;

        [Header("Rescue Missions")]
        [Tooltip("In-game hours before a rescue mission expires.")]
        [SerializeField, Range(1, 48)] private int rescueExpiryHours = 4;

        // ─── Runtime state ────────────────────────────────────────────────────
        private long _totalSurvivorXp;
        private int  _campLevel;
        private int  _credits;
        private readonly List<RescueMission> _activeRescues = new List<RescueMission>();

        public long TotalSurvivorXp => _totalSurvivorXp;
        public int  CampLevel       => _campLevel;
        public int  Credits         => _credits;
        public int  SquadSlots      => CalcSquadSlots(_campLevel);
        public IReadOnlyList<RescueMission> ActiveRescues => _activeRescues;
        public int  CampXpToNext    => Mathf.Max(0, (_campLevel + 1) * ZedIdler.Services.BalanceRuntime.CampXpDivisor - (int)Mathf.Min(_totalSurvivorXp, int.MaxValue));

        // ─── Events ───────────────────────────────────────────────────────────
        public event Action<int, int> OnCampLevelChanged; // (oldLevel, newLevel)
        public event Action<int>      OnSquadSlotsChanged;
        public event Action<int, int> OnCreditsChanged; // (oldAmount, newAmount)
        public event Action<RescueMission> OnRescueMissionStarted;
        public event Action<RescueMission, bool> OnRescueMissionResolved; // (mission, succeeded)

        // ─── Lifecycle ────────────────────────────────────────────────────────
        private void Awake()
        {
            DontDestroyOnLoad(gameObject);
            _credits = startingCredits;
            ServiceLocator.Register<IPlayerProfile>(this);
        }

        private void OnDestroy() => ServiceLocator.Unregister<IPlayerProfile>();

        // ─── Currency ─────────────────────────────────────────────────────────
        public int GetCredits() => _credits;

        public bool AddCredits(int amount)
        {
            if (amount <= 0) return false;
            int old = _credits;
            _credits += amount;
            OnCreditsChanged?.Invoke(old, _credits);
            return true;
        }

        public bool SpendCredits(int amount)
        {
            if (amount <= 0 || _credits < amount) return false;
            int old = _credits;
            _credits -= amount;
            OnCreditsChanged?.Invoke(old, _credits);
            return true;
        }

        // ─── XP aggregation ───────────────────────────────────────────────────
        /// <summary>
        /// Wipe camp-level soft progression on prestige. Keeps credits (handled
        /// by coordinator) and fires the level-change event so UI updates.
        /// </summary>
        public void ResetForPrestige()
        {
            int oldLevel = _campLevel;
            int oldSlots = SquadSlots;
            _totalSurvivorXp = 0;
            _campLevel = 0;
            _activeRescues.Clear();
            if (oldLevel != 0) OnCampLevelChanged?.Invoke(oldLevel, 0);
            if (SquadSlots != oldSlots) OnSquadSlotsChanged?.Invoke(SquadSlots);
        }

        /// <summary>
        /// Call once per survivor when they gain XP. Internal aggregation maintains
        /// the camp-level threshold cross detection and event broadcast.
        /// </summary>
        public void RegisterSurvivorXpGain(long xp)
        {
            if (xp <= 0) return;
            _totalSurvivorXp += xp;
            int newLevel = (int)(_totalSurvivorXp / ZedIdler.Services.BalanceRuntime.CampXpDivisor);
            if (newLevel != _campLevel)
            {
                int oldLevel = _campLevel;
                int oldSlots = SquadSlots;
                _campLevel = newLevel;
                OnCampLevelChanged?.Invoke(oldLevel, _campLevel);
                if (SquadSlots != oldSlots) OnSquadSlotsChanged?.Invoke(SquadSlots);
            }
        }

        /// <summary>
        /// Bulk-recompute camp level from a snapshot of all known survivors.
        /// Useful after loading a save or when a new survivor joins.
        /// </summary>
        public void RecomputeFromSurvivors(IEnumerable<Survivor> all)
        {
            long sum = 0;
            foreach (var s in all)
            {
                if (s != null) sum += s.Level.TotalXp;
            }
            _totalSurvivorXp = sum;
            int newLevel = (int)(_totalSurvivorXp / ZedIdler.Services.BalanceRuntime.CampXpDivisor);
            if (newLevel != _campLevel)
            {
                int oldLevel = _campLevel;
                int oldSlots = SquadSlots;
                _campLevel = newLevel;
                OnCampLevelChanged?.Invoke(oldLevel, _campLevel);
                if (SquadSlots != oldSlots) OnSquadSlotsChanged?.Invoke(SquadSlots);
            }
        }

        private int CalcSquadSlots(int level)
        {
            int slots = initialSquadSlots;
            if (level >= squadSlot2AtLevel) slots = Mathf.Max(slots, 2);
            if (level >= squadSlot3AtLevel) slots = Mathf.Max(slots, 3);
            if (level >= squadSlot4AtLevel) slots = Mathf.Max(slots, 4);
            return slots;
        }

        // ─── Rescue Missions ──────────────────────────────────────────────────
        /// <summary>
        /// Generate a rescue mission for a fallen survivor. Preserves the backpack
        /// snapshot so loot can be recovered if the mission succeeds.
        /// </summary>
        public RescueMission StartRescueMission(string fallenSurvivorId, int zoneTier,
                                                BackpackSnapshot bag, long startTimeUtcTicks)
        {
            var mission = new RescueMission
            {
                missionId = Guid.NewGuid().ToString("N"),
                fallenSurvivorId = fallenSurvivorId,
                zoneTier = zoneTier,
                bag = bag,
                startedUtcTicks = startTimeUtcTicks,
                expiresUtcTicks = startTimeUtcTicks + TimeSpan.FromHours(rescueExpiryHours).Ticks,
                state = RescueState.Active
            };
            _activeRescues.Add(mission);
            OnRescueMissionStarted?.Invoke(mission);
            return mission;
        }

        public bool ResolveRescueMission(string missionId, bool succeeded)
        {
            for (int i = 0; i < _activeRescues.Count; i++)
            {
                var m = _activeRescues[i];
                if (m.missionId != missionId) continue;
                m.state = succeeded ? RescueState.Succeeded : RescueState.Failed;
                _activeRescues[i] = m;
                OnRescueMissionResolved?.Invoke(m, succeeded);
                _activeRescues.RemoveAt(i);
                return true;
            }
            return false;
        }

        /// <summary>Call periodically (e.g. on hour-change) to expire stale rescues.</summary>
        public void TickExpiry(long nowUtcTicks)
        {
            for (int i = _activeRescues.Count - 1; i >= 0; i--)
            {
                if (_activeRescues[i].expiresUtcTicks <= nowUtcTicks)
                {
                    var m = _activeRescues[i];
                    m.state = RescueState.Expired;
                    OnRescueMissionResolved?.Invoke(m, false);
                    _activeRescues.RemoveAt(i);
                }
            }
        }

        // ─── Snapshot ─────────────────────────────────────────────────────────
        [Serializable]
        public struct Snapshot
        {
            public long totalSurvivorXp;
            public int campLevel;
            public int credits;
            public RescueMission[] activeRescues;
        }

        public Snapshot CreateSnapshot() => new Snapshot
        {
            totalSurvivorXp = _totalSurvivorXp,
            campLevel = _campLevel,
            credits = _credits,
            activeRescues = _activeRescues.ToArray()
        };

        public void Restore(Snapshot s)
        {
            _totalSurvivorXp = Math.Max(0, s.totalSurvivorXp);
            _campLevel = Math.Max(0, s.campLevel);
            _credits = Math.Max(0, s.credits);
            _activeRescues.Clear();
            if (s.activeRescues != null) _activeRescues.AddRange(s.activeRescues);
        }
    }

    public interface IPlayerProfile
    {
        long TotalSurvivorXp { get; }
        int  CampLevel       { get; }
        int  Credits         { get; }
        int  SquadSlots      { get; }
        IReadOnlyList<RescueMission> ActiveRescues { get; }

        event Action<int, int> OnCampLevelChanged;
        event Action<int>      OnSquadSlotsChanged;
        event Action<int, int> OnCreditsChanged;
        event Action<RescueMission> OnRescueMissionStarted;
        event Action<RescueMission, bool> OnRescueMissionResolved;

        int  GetCredits();
        bool AddCredits(int amount);
        bool SpendCredits(int amount);

        void RegisterSurvivorXpGain(long xp);
        void ResetForPrestige();
        void RecomputeFromSurvivors(IEnumerable<Survivor> all);
        RescueMission StartRescueMission(string fallenSurvivorId, int zoneTier, BackpackSnapshot bag, long startTimeUtcTicks);
        bool ResolveRescueMission(string missionId, bool succeeded);
        void TickExpiry(long nowUtcTicks);
        PlayerProfile.Snapshot CreateSnapshot();
        void Restore(PlayerProfile.Snapshot s);
    }

    [Serializable]
    public struct RescueMission
    {
        public string missionId;
        public string fallenSurvivorId;
        public int zoneTier;
        public BackpackSnapshot bag;
        public long startedUtcTicks;
        public long expiresUtcTicks;
        public RescueState state;
    }

    public enum RescueState
    {
        Active    = 0,
        Succeeded = 1,
        Failed    = 2,
        Expired   = 3
    }
}
