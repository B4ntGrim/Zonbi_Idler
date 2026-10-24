// Assets/Scripts/Services/TimeService.cs
using System;
using UnityEngine;
using ZedIdler.Data;

namespace ZedIdler.Services
{
    /// <summary>
    /// In-game clock. Tracks 24-hour day cycle, fires <see cref="OnHourChanged"/>
    /// at every wrap, and exposes a coarse Day/Night bucket used by the combat
    /// spec's time-of-day spawn filters (section 5).
    /// </summary>
    /// <remarks>
    /// Placement: persistent on the Bootstrap GameObject (DontDestroyOnLoad).
    /// Registers with the <see cref="ServiceLocator"/> on Awake under
    /// <see cref="ITimeService"/>.
    ///
    /// Tuning: <see cref="realSecondsPerInGameHour"/> controls pacing. Default 60s →
    /// one real-time minute = one in-game hour → 24 minutes per in-game day.
    ///
    /// Persistence: <see cref="Snapshot"/> + <see cref="Restore"/> are designed for
    /// save/load round-trip. The current hour and the wall-clock anchor are both
    /// preserved so re-opening the app weeks later resumes at the correct in-game
    /// time, modulated by the offline progression cap in <c>GameConfig</c>.
    /// </remarks>
    [DisallowMultipleComponent]
    public sealed class TimeService : MonoBehaviour, ITimeService
    {
        [Header("Day Cycle")]
        [Tooltip("Real-world seconds per in-game hour. Default 60s = 24-minute in-game day.")]
        [SerializeField, Range(1f, 600f)] private float realSecondsPerInGameHour = 60f;

        [Tooltip("Inclusive start hour for the Day bucket (e.g. 6 = 6:00 AM).")]
        [SerializeField, Range(0, 23)] private int dayStartHour = 6;
        [Tooltip("Exclusive end hour for the Day bucket (e.g. 20 = 8:00 PM).")]
        [SerializeField, Range(1, 24)] private int dayEndHour = 20;

        [Header("Initial State")]
        [SerializeField, Range(0, 23)] private int startingHour = 8;

        [Header("Pause")]
        [Tooltip("If true, the clock advances during Update. Disable for cinematics or menus.")]
        [SerializeField] private bool isRunning = true;

        // ─── Runtime state ────────────────────────────────────────────────────
        private float _accumulator;
        private int _currentHour;
        private long _currentDay;

        public int  CurrentHour    => _currentHour;
        public long CurrentDay     => _currentDay;
        public bool IsRunning      => isRunning;

        public TimeOfDay TimeOfDay =>
            _currentHour >= dayStartHour && _currentHour < dayEndHour ? TimeOfDay.Day : TimeOfDay.Night;

        public event Action<int> OnHourChanged;
        public event Action<long> OnDayChanged;

        // ─── Lifecycle ────────────────────────────────────────────────────────
        private void Awake()
        {
            DontDestroyOnLoad(gameObject);
            _currentHour = Mathf.Clamp(startingHour, 0, 23);
            _currentDay = 1;
            ServiceLocator.Register<ITimeService>(this);
        }

        private void OnDestroy() => ServiceLocator.Unregister<ITimeService>();

        private void Update()
        {
            if (!isRunning) return;
            Advance(Time.deltaTime);
        }

        // ─── Public API ───────────────────────────────────────────────────────
        public void Pause()  => isRunning = false;
        public void Resume() => isRunning = true;

        /// <summary>Advance the clock by <paramref name="realSeconds"/>. Public for offline catch-up.</summary>
        public void Advance(float realSeconds)
        {
            if (realSeconds <= 0f) return;
            _accumulator += realSeconds;
            while (_accumulator >= realSecondsPerInGameHour)
            {
                _accumulator -= realSecondsPerInGameHour;
                AdvanceOneHour();
            }
        }

        /// <summary>Advance N in-game hours instantly. Useful for offline progression.</summary>
        public void AdvanceHours(int hours)
        {
            for (int i = 0; i < hours; i++) AdvanceOneHour();
        }

        private void AdvanceOneHour()
        {
            _currentHour++;
            if (_currentHour >= 24)
            {
                _currentHour = 0;
                _currentDay++;
                OnDayChanged?.Invoke(_currentDay);
            }
            OnHourChanged?.Invoke(_currentHour);
        }

        // ─── Snapshot ─────────────────────────────────────────────────────────
        [Serializable]
        public struct Snapshot
        {
            public int currentHour;
            public long currentDay;
            public float accumulator;
        }

        public Snapshot CreateSnapshot() => new Snapshot
        {
            currentHour = _currentHour,
            currentDay = _currentDay,
            accumulator = _accumulator
        };

        public void Restore(Snapshot s)
        {
            _currentHour = Mathf.Clamp(s.currentHour, 0, 23);
            _currentDay = Math.Max(1, s.currentDay);
            _accumulator = Mathf.Max(0f, s.accumulator);
        }
    }
}
