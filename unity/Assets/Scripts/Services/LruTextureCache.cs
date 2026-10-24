// Assets/Scripts/Services/LruTextureCache.cs
using System.Collections.Generic;
using UnityEngine;

namespace ZedIdler.Services
{
    /// <summary>
    /// LRU-bounded Texture2D cache for <see cref="ArtGenerationService"/>.
    /// Evicts least-recently-used textures when capacity is exceeded,
    /// destroying the underlying Unity asset to release native memory.
    /// </summary>
    public sealed class LruTextureCache
    {
        private readonly int _capacity;
        private readonly LinkedList<string> _order = new LinkedList<string>();
        private readonly Dictionary<string, (Texture2D tex, LinkedListNode<string> node)> _entries
            = new Dictionary<string, (Texture2D, LinkedListNode<string>)>();

        public int Count => _entries.Count;
        public int Capacity => _capacity;

        public LruTextureCache(int capacity = 128) { _capacity = Mathf.Max(8, capacity); }

        public bool TryGet(string key, out Texture2D tex)
        {
            if (_entries.TryGetValue(key, out var entry))
            {
                _order.Remove(entry.node);
                _order.AddFirst(entry.node);
                tex = entry.tex;
                return tex != null;
            }
            tex = null;
            return false;
        }

        public void Add(string key, Texture2D tex)
        {
            if (tex == null) return;
            if (_entries.TryGetValue(key, out var existing))
            {
                _order.Remove(existing.node);
                _order.AddFirst(existing.node);
                if (existing.tex != tex && existing.tex != null) Object.Destroy(existing.tex);
                _entries[key] = (tex, existing.node);
                return;
            }
            while (_entries.Count >= _capacity && _order.Last != null)
            {
                var lastKey = _order.Last.Value;
                _order.RemoveLast();
                if (_entries.TryGetValue(lastKey, out var evicted))
                {
                    if (evicted.tex != null) Object.Destroy(evicted.tex);
                    _entries.Remove(lastKey);
                }
            }
            var node = _order.AddFirst(key);
            _entries[key] = (tex, node);
        }

        public void Clear()
        {
            foreach (var entry in _entries.Values)
                if (entry.tex != null) Object.Destroy(entry.tex);
            _entries.Clear();
            _order.Clear();
        }
    }
}
