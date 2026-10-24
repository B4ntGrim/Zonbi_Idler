// Assets/Scripts/Services/TutorialService.cs
using System;
using System.Collections.Generic;
using UnityEngine;
using ZedIdler.Data;

namespace ZedIdler.Services
{
    /// <summary>
    /// Step state machine for the read-and-dismiss tutorial. Plays once on first
    /// launch (persisted via PlayerPrefs); replayable from the Settings → About
    /// page. Steps are ScriptableObjects sorted by order.
    /// </summary>
    [DisallowMultipleComponent]
    public sealed class TutorialService : MonoBehaviour, ITutorialService
    {
        public const string CompletedPrefKey = "tutorial_completed";

        [SerializeField] private TutorialStep[] steps;
        [SerializeField] private string resourcesRoot = "Tutorial";

        private List<TutorialStep> _ordered = new List<TutorialStep>();
        private int _index = -1;
        private bool _active;
        private bool _isReplay;

        public bool IsActive => _active;
        public bool HasCompletedOnce => PlayerPrefs.GetInt(CompletedPrefKey, 0) == 1;
        public int CurrentIndex => _index;
        public int TotalSteps => _ordered.Count;
        public TutorialStep Current => (_index >= 0 && _index < _ordered.Count) ? _ordered[_index] : null;
        public IReadOnlyList<TutorialStep> AllSteps => _ordered;

        public event Action<TutorialStep, int, int> OnStepShown; // (step, index, total)
        public event Action OnTutorialStarted;
        public event Action<bool> OnTutorialEnded; // (completed vs skipped)

        private void Awake()
        {
            DontDestroyOnLoad(gameObject);
            if (steps == null || steps.Length == 0) steps = Resources.LoadAll<TutorialStep>(resourcesRoot);
            _ordered = new List<TutorialStep>(steps ?? Array.Empty<TutorialStep>());
            _ordered.RemoveAll(s => s == null);
            _ordered.Sort((a, b) => a.Order.CompareTo(b.Order));
            ServiceLocator.Register<ITutorialService>(this);
        }

        private void OnDestroy() => ServiceLocator.Unregister<ITutorialService>();

        /// <summary>Auto-start on first launch. Call from the boot flow.</summary>
        public void MaybeAutoStart()
        {
            if (!HasCompletedOnce) StartTutorial(isReplay: false);
        }

        public void StartTutorial(bool isReplay)
        {
            if (_ordered.Count == 0) return;
            _isReplay = isReplay;
            _active = true;
            _index = 0;
            OnTutorialStarted?.Invoke();
            OnStepShown?.Invoke(Current, _index, _ordered.Count);
        }

        public void Next()
        {
            if (!_active) return;
            if (_index < _ordered.Count - 1)
            {
                _index++;
                OnStepShown?.Invoke(Current, _index, _ordered.Count);
            }
            else
            {
                Complete();
            }
        }

        public void Previous()
        {
            if (!_active || _index <= 0) return;
            _index--;
            OnStepShown?.Invoke(Current, _index, _ordered.Count);
        }

        public void Skip()
        {
            if (!_active) return;
            EndInternal(completed: false);
        }

        private void Complete() => EndInternal(completed: true);

        private void EndInternal(bool completed)
        {
            _active = false;
            _index = -1;
            if (!_isReplay) PlayerPrefs.SetInt(CompletedPrefKey, 1); // first-run only persists
            ServiceLocator.Get<ZedIdler.Services.Analytics.IAnalyticsService>()
                ?.Funnel(completed ? "tutorial_completed" : "tutorial_skipped");
            OnTutorialEnded?.Invoke(completed);
        }

        /// <summary>Steps for a given topic — used by the About page grouping.</summary>
        public List<TutorialStep> StepsForTopic(TutorialTopic topic)
        {
            var list = new List<TutorialStep>();
            foreach (var s in _ordered) if (s.Topic == topic) list.Add(s);
            return list;
        }
    }

    public interface ITutorialService
    {
        bool IsActive { get; }
        bool HasCompletedOnce { get; }
        int CurrentIndex { get; }
        int TotalSteps { get; }
        TutorialStep Current { get; }
        IReadOnlyList<TutorialStep> AllSteps { get; }

        event Action<TutorialStep, int, int> OnStepShown;
        event Action OnTutorialStarted;
        event Action<bool> OnTutorialEnded;

        void MaybeAutoStart();
        void StartTutorial(bool isReplay);
        void Next();
        void Previous();
        void Skip();
        List<TutorialStep> StepsForTopic(TutorialTopic topic);
    }
}
