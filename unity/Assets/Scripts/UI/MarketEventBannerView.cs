// Assets/Scripts/UI/MarketEventBannerView.cs
using System;
using System.Collections.Generic;
using TMPro;
using UnityEngine;
using UnityEngine.UI;
using ZedIdler.Data;
using ZedIdler.Services;

namespace ZedIdler.UI
{
    /// <summary>
    /// Top-of-screen strip listing every active <see cref="MarketEvent"/> with
    /// a live countdown to expiry. Subscribes to
    /// <see cref="IMarketplaceService.OnMarketEventActivated"/> /
    /// <see cref="IMarketplaceService.OnMarketEventEnded"/> so the strip
    /// rebuilds whenever the active set changes.
    /// </summary>
    [DisallowMultipleComponent]
    public sealed class MarketEventBannerView : MonoBehaviour
    {
        [SerializeField] private RectTransform entryContainer;
        [SerializeField] private RectTransform entryPrefab;
        [SerializeField] private GameObject emptyState;

        private IMarketplaceService _market;
        private readonly Dictionary<string, RectTransform> _entries = new Dictionary<string, RectTransform>();

        private void OnEnable()
        {
            ServiceLocator.TryGet(out _market);
            if (_market == null) { enabled = false; return; }
            _market.OnMarketEventActivated += HandleActivated;
            _market.OnMarketEventEnded     += HandleEnded;
            Rebuild();
        }

        private void OnDisable()
        {
            if (_market != null)
            {
                _market.OnMarketEventActivated -= HandleActivated;
                _market.OnMarketEventEnded     -= HandleEnded;
            }
        }

        private void Update()
        {
            if (_market == null) return;
            foreach (var kv in _market.ActiveEvents)
            {
                if (_entries.TryGetValue(kv.Key, out var rt))
                {
                    var label = rt.GetComponentInChildren<TMP_Text>();
                    if (label == null) continue;
                    long delta = kv.Value.expiresUtcTicks - DateTime.UtcNow.Ticks;
                    var span = TimeSpan.FromTicks(Math.Max(0, delta));
                    label.text = $"⚠ {kv.Value.evt.DisplayName} — {(int)span.TotalHours}h {span.Minutes}m";
                }
            }
        }

        private void Rebuild()
        {
            if (entryContainer == null || entryPrefab == null) return;
            foreach (Transform t in entryContainer) Destroy(t.gameObject);
            _entries.Clear();
            foreach (var kv in _market.ActiveEvents) AddEntry(kv.Value.evt);
            if (emptyState != null) emptyState.SetActive(_entries.Count == 0);
        }

        private void HandleActivated(MarketEvent e) { AddEntry(e); if (emptyState != null) emptyState.SetActive(false); }

        private void HandleEnded(string id)
        {
            if (_entries.TryGetValue(id, out var rt))
            {
                Destroy(rt.gameObject);
                _entries.Remove(id);
            }
            if (emptyState != null) emptyState.SetActive(_entries.Count == 0);
        }

        private void AddEntry(MarketEvent e)
        {
            if (_entries.ContainsKey(e.EventId)) return;
            var rt = Instantiate(entryPrefab, entryContainer);
            _entries[e.EventId] = rt;
            var label = rt.GetComponentInChildren<TMP_Text>();
            if (label != null) label.text = $"⚠ {e.DisplayName}";
        }
    }
}
