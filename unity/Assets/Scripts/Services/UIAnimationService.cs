// Assets/Scripts/Services/UIAnimationService.cs
using System;
using System.Collections;
using System.Collections.Generic;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace ZedIdler.Services
{
    /// <summary>
    /// Persistent UI tween service. Coroutine-driven; can be replaced with
    /// LeanTween calls in any method without changing the public interface.
    /// Pools <see cref="TweenHandle"/> instances to keep allocation pressure
    /// low during heavy combat scenes.
    /// </summary>
    /// <remarks>
    /// Honors a global "reduced motion" PlayerPref. When enabled, animations
    /// snap to their end state instead of tweening.
    /// </remarks>
    [DisallowMultipleComponent]
    public sealed class UIAnimationService : MonoBehaviour, IUIAnimationService
    {
        public const string ReducedMotionPrefKey = "ui_reduced_motion";

        [SerializeField, Range(8, 256)] private int initialPooledHandleCount = 32;
        [SerializeField, Range(0, 1024)] private int maxPooledHandleCount = 256;

        private readonly Queue<TweenHandle> _pool = new Queue<TweenHandle>();
        private readonly Dictionary<int, TweenHandle> _active = new Dictionary<int, TweenHandle>();
        private bool _reducedMotion;

        public bool ReducedMotion
        {
            get => _reducedMotion;
            set { _reducedMotion = value; PlayerPrefs.SetInt(ReducedMotionPrefKey, value ? 1 : 0); }
        }

        private void Awake()
        {
            DontDestroyOnLoad(gameObject);
            for (int i = 0; i < initialPooledHandleCount; i++) _pool.Enqueue(new TweenHandle());
            _reducedMotion = PlayerPrefs.GetInt(ReducedMotionPrefKey, 0) == 1;
            ServiceLocator.Register<IUIAnimationService>(this);
        }

        private void OnDestroy() => ServiceLocator.Unregister<IUIAnimationService>();

        // ─── Preset effects ───────────────────────────────────────────────────
        public TweenHandle Pop(Transform t, float scaleUp = 1.15f, float seconds = 0.25f)
        {
            if (t == null) return null;
            if (_reducedMotion) { t.localScale = Vector3.one; return null; }
            return RunTween(t, h => ScaleSequence(t, scaleUp, seconds, h));
        }

        public TweenHandle Pulse(Transform t, float amount = 0.05f, float cycleSeconds = 0.8f)
        {
            if (t == null) return null;
            if (_reducedMotion) return null;
            return RunTween(t, h => PulseLoop(t, amount, cycleSeconds, h));
        }

        public TweenHandle Shake(Transform t, float magnitude = 8f, float seconds = 0.3f)
        {
            if (t == null) return null;
            if (_reducedMotion) return null;
            return RunTween(t, h => ShakeRoutine(t, magnitude, seconds, h));
        }

        public TweenHandle SlideIn(RectTransform rt, Vector2 fromOffset, float seconds = 0.35f)
        {
            if (rt == null) return null;
            if (_reducedMotion) { rt.anchoredPosition -= Vector2.zero; return null; }
            return RunTween(rt, h => SlideRoutine(rt, fromOffset, seconds, h));
        }

        public TweenHandle Fade(CanvasGroup cg, float from, float to, float seconds = 0.25f)
        {
            if (cg == null) return null;
            if (_reducedMotion) { cg.alpha = to; return null; }
            return RunTween(cg, h => FadeRoutine(cg, from, to, seconds, h));
        }

        public TweenHandle NumberTick(TMP_Text label, int fromValue, int toValue, float seconds = 0.5f, string prefix = "", string suffix = "")
        {
            if (label == null) return null;
            if (_reducedMotion) { label.text = $"{prefix}{toValue}{suffix}"; return null; }
            return RunTween(label, h => NumberTickRoutine(label, fromValue, toValue, seconds, prefix, suffix, h));
        }

        public TweenHandle OutlinePulse(Image img, Color from, Color to, float cycleSeconds = 1.2f)
        {
            if (img == null) return null;
            if (_reducedMotion) return null;
            return RunTween(img, h => OutlinePulseRoutine(img, from, to, cycleSeconds, h));
        }

        public TweenHandle Toast(RectTransform rt, Vector2 enterFromOffset, float holdSeconds = 1.5f, float fadeSeconds = 0.3f)
        {
            if (rt == null) return null;
            if (_reducedMotion) return null;
            return RunTween(rt, h => ToastRoutine(rt, enterFromOffset, holdSeconds, fadeSeconds, h));
        }

        public void Cancel(TweenHandle handle)
        {
            if (handle == null || !_active.ContainsKey(handle.id)) return;
            handle.cancelled = true;
            if (handle.routine != null) StopCoroutine(handle.routine);
            ReleaseHandle(handle);
        }

        // ─── Routines ─────────────────────────────────────────────────────────
        private static float EaseInQuad(float t) => t * t;
        private static float EaseOutQuad(float t) => 1f - (1f - t) * (1f - t);
        private static float EaseOutBack(float t) { const float c1 = 1.70158f, c3 = c1 + 1f; return 1f + c3 * Mathf.Pow(t - 1f, 3f) + c1 * Mathf.Pow(t - 1f, 2f); }
        private static float EaseInOutSine(float t) => -(Mathf.Cos(Mathf.PI * t) - 1f) / 2f;

        private IEnumerator ScaleSequence(Transform t, float peak, float duration, TweenHandle h)
        {
            float half = duration * 0.5f;
            float elapsed = 0f;
            Vector3 start = Vector3.one, mid = Vector3.one * peak;
            while (elapsed < half && !h.cancelled)
            {
                t.localScale = Vector3.LerpUnclamped(start, mid, EaseOutBack(elapsed / half));
                elapsed += Time.unscaledDeltaTime; yield return null;
            }
            elapsed = 0f;
            while (elapsed < half && !h.cancelled)
            {
                t.localScale = Vector3.LerpUnclamped(mid, start, EaseOutQuad(elapsed / half));
                elapsed += Time.unscaledDeltaTime; yield return null;
            }
            t.localScale = Vector3.one;
            ReleaseHandle(h);
        }

        private IEnumerator PulseLoop(Transform t, float amount, float cycle, TweenHandle h)
        {
            float elapsed = 0f;
            while (!h.cancelled)
            {
                float phase = (Mathf.Sin(elapsed / cycle * Mathf.PI * 2f) + 1f) * 0.5f;
                t.localScale = Vector3.one * (1f + phase * amount);
                elapsed += Time.unscaledDeltaTime;
                yield return null;
            }
            t.localScale = Vector3.one;
            ReleaseHandle(h);
        }

        private IEnumerator ShakeRoutine(Transform t, float mag, float duration, TweenHandle h)
        {
            Vector3 origin = t.localPosition;
            float elapsed = 0f;
            while (elapsed < duration && !h.cancelled)
            {
                float falloff = 1f - (elapsed / duration);
                Vector3 off = new Vector3(UnityEngine.Random.Range(-mag, mag), UnityEngine.Random.Range(-mag, mag), 0f) * falloff;
                t.localPosition = origin + off;
                elapsed += Time.unscaledDeltaTime;
                yield return null;
            }
            t.localPosition = origin;
            ReleaseHandle(h);
        }

        private IEnumerator SlideRoutine(RectTransform rt, Vector2 fromOffset, float duration, TweenHandle h)
        {
            Vector2 target = rt.anchoredPosition;
            Vector2 start = target + fromOffset;
            rt.anchoredPosition = start;
            float elapsed = 0f;
            while (elapsed < duration && !h.cancelled)
            {
                rt.anchoredPosition = Vector2.LerpUnclamped(start, target, EaseOutQuad(elapsed / duration));
                elapsed += Time.unscaledDeltaTime; yield return null;
            }
            rt.anchoredPosition = target;
            ReleaseHandle(h);
        }

        private IEnumerator FadeRoutine(CanvasGroup cg, float from, float to, float duration, TweenHandle h)
        {
            float elapsed = 0f;
            cg.alpha = from;
            while (elapsed < duration && !h.cancelled)
            {
                cg.alpha = Mathf.Lerp(from, to, EaseInOutSine(elapsed / duration));
                elapsed += Time.unscaledDeltaTime; yield return null;
            }
            cg.alpha = to;
            ReleaseHandle(h);
        }

        private IEnumerator NumberTickRoutine(TMP_Text label, int from, int to, float duration, string prefix, string suffix, TweenHandle h)
        {
            float elapsed = 0f;
            while (elapsed < duration && !h.cancelled)
            {
                int v = Mathf.RoundToInt(Mathf.Lerp(from, to, EaseOutQuad(elapsed / duration)));
                label.text = $"{prefix}{v}{suffix}";
                elapsed += Time.unscaledDeltaTime; yield return null;
            }
            label.text = $"{prefix}{to}{suffix}";
            ReleaseHandle(h);
        }

        private IEnumerator OutlinePulseRoutine(Image img, Color a, Color b, float cycle, TweenHandle h)
        {
            float elapsed = 0f;
            while (!h.cancelled)
            {
                float phase = (Mathf.Sin(elapsed / cycle * Mathf.PI * 2f) + 1f) * 0.5f;
                img.color = Color.Lerp(a, b, phase);
                elapsed += Time.unscaledDeltaTime; yield return null;
            }
            img.color = a;
            ReleaseHandle(h);
        }

        private IEnumerator ToastRoutine(RectTransform rt, Vector2 fromOff, float hold, float fade, TweenHandle h)
        {
            Vector2 home = rt.anchoredPosition;
            rt.anchoredPosition = home + fromOff;
            // Slide in
            float t1 = 0f;
            while (t1 < fade && !h.cancelled) { rt.anchoredPosition = Vector2.LerpUnclamped(home + fromOff, home, EaseOutQuad(t1 / fade)); t1 += Time.unscaledDeltaTime; yield return null; }
            rt.anchoredPosition = home;
            // Hold
            float t2 = 0f;
            while (t2 < hold && !h.cancelled) { t2 += Time.unscaledDeltaTime; yield return null; }
            // Slide out
            float t3 = 0f;
            while (t3 < fade && !h.cancelled) { rt.anchoredPosition = Vector2.LerpUnclamped(home, home + fromOff, EaseInQuad(t3 / fade)); t3 += Time.unscaledDeltaTime; yield return null; }
            rt.anchoredPosition = home + fromOff;
            ReleaseHandle(h);
        }

        // ─── Handle pool ──────────────────────────────────────────────────────
        private TweenHandle RunTween(UnityEngine.Object target, Func<TweenHandle, IEnumerator> factory)
        {
            var h = _pool.Count > 0 ? _pool.Dequeue() : new TweenHandle();
            h.id = ++_handleCounter;
            h.cancelled = false;
            h.target = target;
            _active[h.id] = h;
            h.routine = StartCoroutine(factory(h));
            return h;
        }

        private void ReleaseHandle(TweenHandle h)
        {
            if (h == null) return;
            _active.Remove(h.id);
            h.routine = null;
            h.target = null;
            // Dynamic cap — drop excess handles instead of growing indefinitely.
            if (_pool.Count < maxPooledHandleCount) _pool.Enqueue(h);
        }

        private int _handleCounter;
    }

    public interface IUIAnimationService
    {
        bool ReducedMotion { get; set; }

        TweenHandle Pop(Transform t, float scaleUp = 1.15f, float seconds = 0.25f);
        TweenHandle Pulse(Transform t, float amount = 0.05f, float cycleSeconds = 0.8f);
        TweenHandle Shake(Transform t, float magnitude = 8f, float seconds = 0.3f);
        TweenHandle SlideIn(RectTransform rt, Vector2 fromOffset, float seconds = 0.35f);
        TweenHandle Fade(CanvasGroup cg, float from, float to, float seconds = 0.25f);
        TweenHandle NumberTick(TMP_Text label, int fromValue, int toValue, float seconds = 0.5f, string prefix = "", string suffix = "");
        TweenHandle OutlinePulse(Image img, Color from, Color to, float cycleSeconds = 1.2f);
        TweenHandle Toast(RectTransform rt, Vector2 enterFromOffset, float holdSeconds = 1.5f, float fadeSeconds = 0.3f);
        void Cancel(TweenHandle handle);
    }

    public sealed class TweenHandle
    {
        public int id;
        public bool cancelled;
        public UnityEngine.Object target;
        public Coroutine routine;
    }
}
