// Assets/Scripts/Services/PerformanceUtils.cs
using System.Collections;
using System.Collections.Generic;
using System.Text;
using UnityEngine;

namespace ZedIdler.Services
{
    /// <summary>
    /// Static performance helpers: cached <see cref="WaitForSeconds"/>,
    /// shared <see cref="StringBuilder"/>, ticker accumulators, and GameObject
    /// pool primitives. Use these on hot paths in Update / coroutines /
    /// log assembly to keep GC pressure flat.
    /// </summary>
    public static class PerformanceUtils
    {
        // ─── Cached WaitForSeconds ───────────────────────────────────────────
        private static readonly Dictionary<int, WaitForSeconds> _waitCache = new Dictionary<int, WaitForSeconds>();
        private static readonly WaitForEndOfFrame _waitEndOfFrame = new WaitForEndOfFrame();
        private static readonly WaitForFixedUpdate _waitFixed = new WaitForFixedUpdate();

        public static WaitForSeconds Wait(float seconds)
        {
            int key = Mathf.RoundToInt(seconds * 1000f);
            if (!_waitCache.TryGetValue(key, out var w))
            {
                w = new WaitForSeconds(seconds);
                _waitCache[key] = w;
            }
            return w;
        }

        public static WaitForEndOfFrame WaitForEndOfFrame() => _waitEndOfFrame;
        public static WaitForFixedUpdate WaitForFixedUpdate() => _waitFixed;

        // ─── Shared StringBuilder (single-thread Unity main) ──────────────────
        private static readonly StringBuilder _sb = new StringBuilder(256);

        public static StringBuilder GetSharedSb()
        {
            _sb.Clear();
            return _sb;
        }

        /// <summary>Format `{a}/{b}` without alloc-heavy interpolation.</summary>
        public static string SlashFormat(int a, int b)
        {
            var sb = GetSharedSb();
            sb.Append(a); sb.Append('/'); sb.Append(b);
            return sb.ToString();
        }

        /// <summary>Format `{n} cr` without interpolation.</summary>
        public static string CreditsFormat(int credits)
        {
            var sb = GetSharedSb();
            sb.Append(credits); sb.Append(" cr");
            return sb.ToString();
        }

        // ─── Fixed-interval ticker ────────────────────────────────────────────
        /// <summary>
        /// Frame-rate-independent fixed-interval accumulator. Call <see cref="Tick"/>
        /// each Update with the delta; it returns true once per <see cref="Interval"/>
        /// seconds. Use to gate Marketplace / Recycler / Combat ticks without
        /// running them every frame.
        /// </summary>
        public sealed class FixedIntervalTicker
        {
            public float Interval;
            private float _accumulator;
            public FixedIntervalTicker(float interval) { Interval = Mathf.Max(0.05f, interval); }
            public bool Tick(float deltaSeconds)
            {
                _accumulator += deltaSeconds;
                if (_accumulator >= Interval)
                {
                    _accumulator -= Interval;
                    return true;
                }
                return false;
            }
            public void Reset() => _accumulator = 0f;
        }

        // ─── GameObject pool ──────────────────────────────────────────────────
        public sealed class GameObjectPool
        {
            private readonly GameObject _prefab;
            private readonly Transform _parent;
            private readonly Stack<GameObject> _stack = new Stack<GameObject>();
            public int Allocated { get; private set; }

            public GameObjectPool(GameObject prefab, Transform parent, int prewarm = 0)
            {
                _prefab = prefab;
                _parent = parent;
                for (int i = 0; i < prewarm; i++)
                {
                    var go = Object.Instantiate(_prefab, _parent);
                    go.SetActive(false);
                    _stack.Push(go);
                    Allocated++;
                }
            }

            public GameObject Rent()
            {
                GameObject go;
                if (_stack.Count > 0) go = _stack.Pop();
                else { go = Object.Instantiate(_prefab, _parent); Allocated++; }
                go.SetActive(true);
                return go;
            }

            public void Return(GameObject go)
            {
                if (go == null) return;
                go.SetActive(false);
                go.transform.SetParent(_parent, false);
                _stack.Push(go);
            }

            public void Clear()
            {
                while (_stack.Count > 0)
                {
                    var go = _stack.Pop();
                    if (go != null) Object.Destroy(go);
                }
                Allocated = 0;
            }
        }
    }
}
