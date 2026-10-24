// Assets/Scripts/Services/UnlockService.cs
using System;
using System.Collections.Generic;
using UnityEngine;

namespace ZedIdler.Services
{
    /// <summary>
    /// Gates building/feature unlocks behind <see cref="IPlayerProfile.CampLevel"/>.
    /// Listens for camp-level-up events and fires
    /// <see cref="OnBuildingUnlocked"/> whenever a new threshold is crossed.
    /// </summary>
    /// <remarks>
    /// Unlock entries are inspector-authored so designers can add/remove buildings
    /// without code changes. The default seed matches spec section 5:
    /// Marketplace=1, MedBay=3, Workshop=5, Watchtower=8, Recycler=15, Armory=20.
    /// </remarks>
    [DisallowMultipleComponent]
    public sealed class UnlockService : MonoBehaviour, IUnlockService
    {
        [SerializeField] private List<UnlockEntry> entries = new List<UnlockEntry>
        {
            new UnlockEntry { buildingId = "marketplace", requiredCampLevel = 1 },
            new UnlockEntry { buildingId = "med_bay",     requiredCampLevel = 3 },
            new UnlockEntry { buildingId = "workshop",    requiredCampLevel = 5 },
            new UnlockEntry { buildingId = "watchtower",  requiredCampLevel = 8 },
            new UnlockEntry { buildingId = "recycler",    requiredCampLevel = 15 },
            new UnlockEntry { buildingId = "armory",      requiredCampLevel = 20 },
        };

        private IPlayerProfile _profile;
        private readonly HashSet<string> _unlocked = new HashSet<string>();

        public IReadOnlyList<UnlockEntry> Entries => entries;
        public IReadOnlyCollection<string> Unlocked => _unlocked;

        public event Action<string> OnBuildingUnlocked;
        public event Action<string> OnBuildingRelocked; // for debug/admin only

        // ─── Lifecycle ────────────────────────────────────────────────────────
        private void Awake()
        {
            DontDestroyOnLoad(gameObject);
            ServiceLocator.Register<IUnlockService>(this);
        }

        private void OnDestroy()
        {
            if (_profile != null) _profile.OnCampLevelChanged -= HandleCampLevelChanged;
            ServiceLocator.Unregister<IUnlockService>();
        }

        private void Start()
        {
            ServiceLocator.TryGet(out _profile);
            if (_profile != null)
            {
                _profile.OnCampLevelChanged += HandleCampLevelChanged;
                RebuildFromCampLevel(_profile.CampLevel, fireEvents: false);
            }
        }

        // ─── Queries ──────────────────────────────────────────────────────────
        public bool IsUnlocked(string buildingId) => _unlocked.Contains(buildingId);

        public int GetRequiredLevel(string buildingId)
        {
            for (int i = 0; i < entries.Count; i++)
                if (entries[i].buildingId == buildingId) return entries[i].requiredCampLevel;
            return -1;
        }

        /// <summary>Returns the entry list ordered by required level (UI-friendly).</summary>
        public List<UnlockEntry> GetSortedEntries()
        {
            var list = new List<UnlockEntry>(entries);
            list.Sort((a, b) => a.requiredCampLevel.CompareTo(b.requiredCampLevel));
            return list;
        }

        // ─── State maintenance ────────────────────────────────────────────────
        private void HandleCampLevelChanged(int oldLevel, int newLevel)
        {
            RebuildFromCampLevel(newLevel, fireEvents: true);
        }

        private void RebuildFromCampLevel(int campLevel, bool fireEvents)
        {
            for (int i = 0; i < entries.Count; i++)
            {
                var e = entries[i];
                bool shouldBeUnlocked = campLevel >= e.requiredCampLevel;
                bool wasUnlocked = _unlocked.Contains(e.buildingId);
                if (shouldBeUnlocked && !wasUnlocked)
                {
                    _unlocked.Add(e.buildingId);
                    if (fireEvents) OnBuildingUnlocked?.Invoke(e.buildingId);
                }
                else if (!shouldBeUnlocked && wasUnlocked)
                {
                    _unlocked.Remove(e.buildingId);
                    if (fireEvents) OnBuildingRelocked?.Invoke(e.buildingId);
                }
            }
        }
    }

    public interface IUnlockService
    {
        IReadOnlyList<UnlockEntry> Entries { get; }
        IReadOnlyCollection<string> Unlocked { get; }
        event Action<string> OnBuildingUnlocked;
        event Action<string> OnBuildingRelocked;
        bool IsUnlocked(string buildingId);
        int  GetRequiredLevel(string buildingId);
        List<UnlockEntry> GetSortedEntries();
    }

    [Serializable]
    public struct UnlockEntry
    {
        public string buildingId;
        public int    requiredCampLevel;
    }
}
