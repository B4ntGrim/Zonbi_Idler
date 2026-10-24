// Assets/Scripts/Services/UIObjectPoolService.cs
using System.Collections.Generic;
using UnityEngine;

namespace ZedIdler.Services
{
    /// <summary>
    /// Global UI prefab pool registry. Systems register named pools at startup
    /// (list rows, toast popups, log lines, particle effects), then rent/return
    /// instead of Instantiate/Destroy in hot paths.
    /// </summary>
    [DisallowMultipleComponent]
    public sealed class UIObjectPoolService : MonoBehaviour, IUIObjectPoolService
    {
        private readonly Dictionary<string, PerformanceUtils.GameObjectPool> _pools
            = new Dictionary<string, PerformanceUtils.GameObjectPool>();
        private Transform _root;

        private void Awake()
        {
            DontDestroyOnLoad(gameObject);
            _root = new GameObject("[Pooled]").transform;
            _root.SetParent(transform, false);
            _root.gameObject.SetActive(false);
            ServiceLocator.Register<IUIObjectPoolService>(this);
        }

        private void OnDestroy() => ServiceLocator.Unregister<IUIObjectPoolService>();

        public void RegisterPool(string poolId, GameObject prefab, int prewarm = 0)
        {
            if (string.IsNullOrEmpty(poolId) || prefab == null) return;
            if (_pools.ContainsKey(poolId)) return;
            _pools[poolId] = new PerformanceUtils.GameObjectPool(prefab, _root, prewarm);
        }

        public GameObject Rent(string poolId, Transform parent = null)
        {
            if (!_pools.TryGetValue(poolId, out var pool)) return null;
            var go = pool.Rent();
            if (parent != null) go.transform.SetParent(parent, false);
            return go;
        }

        public void Return(string poolId, GameObject instance)
        {
            if (!_pools.TryGetValue(poolId, out var pool)) return;
            pool.Return(instance);
        }

        public int CountAllocated(string poolId) =>
            _pools.TryGetValue(poolId, out var pool) ? pool.Allocated : 0;
    }

    public interface IUIObjectPoolService
    {
        void RegisterPool(string poolId, GameObject prefab, int prewarm = 0);
        GameObject Rent(string poolId, Transform parent = null);
        void Return(string poolId, GameObject instance);
        int CountAllocated(string poolId);
    }
}
