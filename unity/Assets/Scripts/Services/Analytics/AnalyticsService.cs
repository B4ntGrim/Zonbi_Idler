// Assets/Scripts/Services/Analytics/AnalyticsService.cs
using System;
using System.Collections.Generic;
using UnityEngine;

namespace ZedIdler.Services.Analytics
{
    /// <summary>
    /// Event-driven telemetry. Captures every event individually and fans them
    /// out to all registered <see cref="IAnalyticsSink"/>s (console in dev, HTTP
    /// in prod). Anonymous device-id only; honors an opt-out toggle persisted in
    /// PlayerPrefs (GDPR-friendly).
    /// </summary>
    [DisallowMultipleComponent]
    public sealed class AnalyticsService : MonoBehaviour, IAnalyticsService
    {
        public const string OptOutPrefKey = "analytics_opt_out";

        private readonly List<IAnalyticsSink> _sinks = new List<IAnalyticsSink>();
        private string _deviceId;
        private string _sessionId;
        private bool _optedOut;
        private float _sessionStart;

        public bool OptedOut
        {
            get => _optedOut;
            set { _optedOut = value; PlayerPrefs.SetInt(OptOutPrefKey, value ? 1 : 0); }
        }
        public string SessionId => _sessionId;

        private void Awake()
        {
            DontDestroyOnLoad(gameObject);
            _deviceId = SystemInfo.deviceUniqueIdentifier;
            _optedOut = PlayerPrefs.GetInt(OptOutPrefKey, 0) == 1;
            ServiceLocator.Register<IAnalyticsService>(this);
        }

        private void OnDestroy() => ServiceLocator.Unregister<IAnalyticsService>();

        private void Start()
        {
            _sessionId = Guid.NewGuid().ToString("N");
            _sessionStart = Time.realtimeSinceStartup;
            Track(AnalyticsCategory.Session, "session_start");
        }

        private void OnApplicationQuit()
        {
            Track(AnalyticsCategory.Session, "session_end", new Dictionary<string, object>
            {
                { "length_sec", Time.realtimeSinceStartup - _sessionStart }
            });
        }

        // ─── Sink registration ────────────────────────────────────────────────
        public void AddSink(IAnalyticsSink sink) { if (sink != null && !_sinks.Contains(sink)) _sinks.Add(sink); }
        public void RemoveSink(IAnalyticsSink sink) => _sinks.Remove(sink);

        // ─── Tracking ───────────────────────────────────────────────────────────
        public void Track(AnalyticsCategory category, string name, Dictionary<string, object> props = null)
        {
            if (_optedOut) return;
            var evt = new AnalyticsEvent
            {
                category = category,
                name = name,
                deviceId = _deviceId,
                sessionId = _sessionId,
                utcTicks = DateTime.UtcNow.Ticks,
                props = props ?? EmptyProps
            };
            for (int i = 0; i < _sinks.Count; i++)
            {
                try { _sinks[i].Record(evt); }
                catch (Exception e) { Debug.LogWarning($"[Analytics] Sink error: {e.Message}"); }
            }
        }

        // Convenience overloads for the confirmed categories.
        public void Progression(string name, Dictionary<string, object> p = null) => Track(AnalyticsCategory.Progression, name, p);
        public void Economy(string name, Dictionary<string, object> p = null)     => Track(AnalyticsCategory.Economy, name, p);
        public void Combat(string name, Dictionary<string, object> p = null)      => Track(AnalyticsCategory.Combat, name, p);
        public void Funnel(string name, Dictionary<string, object> p = null)      => Track(AnalyticsCategory.Funnel, name, p);
        public void Monetization(string name, Dictionary<string, object> p = null)=> Track(AnalyticsCategory.Monetization, name, p);

        private static readonly Dictionary<string, object> EmptyProps = new Dictionary<string, object>();
    }

    public interface IAnalyticsService
    {
        bool OptedOut { get; set; }
        string SessionId { get; }
        void AddSink(IAnalyticsSink sink);
        void RemoveSink(IAnalyticsSink sink);
        void Track(AnalyticsCategory category, string name, Dictionary<string, object> props = null);
        void Progression(string name, Dictionary<string, object> p = null);
        void Economy(string name, Dictionary<string, object> p = null);
        void Combat(string name, Dictionary<string, object> p = null);
        void Funnel(string name, Dictionary<string, object> p = null);
        void Monetization(string name, Dictionary<string, object> p = null);
    }

    /// <summary>Pluggable output target. Implementations: console (dev), HTTP (prod).</summary>
    public interface IAnalyticsSink { void Record(AnalyticsEvent evt); }

    public enum AnalyticsCategory
    {
        Progression = 0,
        Economy     = 1,
        Combat      = 2,
        Session     = 3,
        Monetization= 4,
        Funnel      = 5
    }

    public struct AnalyticsEvent
    {
        public AnalyticsCategory category;
        public string name;
        public string deviceId;
        public string sessionId;
        public long utcTicks;
        public Dictionary<string, object> props;
    }
}
