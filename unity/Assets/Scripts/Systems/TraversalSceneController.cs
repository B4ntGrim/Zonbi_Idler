// Assets/Scripts/Systems/TraversalSceneController.cs
using System;
using System.Collections.Generic;
using UnityEngine;
using ZedIdler.Data;
using ZedIdler.Entities;
using ZedIdler.Services;

namespace ZedIdler.Systems
{
    /// <summary>
    /// Scene-bound controller for the Traversal (satellite grid) tab. Owns the
    /// player's current zone + mission-type + squad selection state, validates
    /// dispatch eligibility, and commits choices to <see cref="ITraversalContext"/>.
    /// </summary>
    /// <remarks>
    /// Scoped to the Traversal scene — destroyed when the scene unloads. The
    /// underlying grid data lives in the persistent <see cref="TraversalContext"/>
    /// service so selections survive scene transitions if the player navigates
    /// away mid-flow.
    ///
    /// Dispatch behavior (per design answers): committing a dispatch only marks
    /// the selection on <see cref="ITraversalContext"/>. The player navigates
    /// manually to the Wandering tab to actually start the run.
    /// </remarks>
    [DisallowMultipleComponent]
    public sealed class TraversalSceneController : MonoBehaviour
    {
        [Header("Stage Sizing (designer-tunable)")]
        [Tooltip("Override grid size at scene-load time based on camp level. " +
                 "Entries are evaluated top-down; first match wins. " +
                 "Leave empty to use TraversalContext's serialized defaults.")]
        [SerializeField] private List<StageSizeRule> stageSizeRules = new List<StageSizeRule>
        {
            new StageSizeRule { minCampLevel = 0,  width = 6,  height = 6  },
            new StageSizeRule { minCampLevel = 10, width = 8,  height = 8  },
            new StageSizeRule { minCampLevel = 20, width = 12, height = 10 },
            new StageSizeRule { minCampLevel = 40, width = 16, height = 12 },
        };

        [Header("Roster Source")]
        [Tooltip("If true, the controller resolves an available-survivors source via ServiceLocator. " +
                 "Otherwise designer can drop survivor refs in the editor for testing.")]
        [SerializeField] private bool resolveRosterFromService = true;
        [SerializeField] private List<SurvivorRef> testRoster = new List<SurvivorRef>();

        // ─── Services ─────────────────────────────────────────────────────────
        private ITraversalContext _traversal;
        private IPlayerProfile _profile;
        private IUnlockService _unlocks;

        // ─── Selection state ──────────────────────────────────────────────────
        public ZoneCell? SelectedZone { get; private set; }
        public MissionType SelectedMissionType { get; private set; } = MissionType.Scavenge;
        public IReadOnlyList<string> SelectedSurvivorIds => _selectedIds;
        public int SquadCap => _profile?.SquadSlots ?? 1;

        private readonly List<string> _selectedIds = new List<string>();

        // ─── Events ───────────────────────────────────────────────────────────
        public event Action<ZoneCell?> OnZoneSelectionChanged;
        public event Action<MissionType> OnMissionTypeChanged;
        public event Action<string, bool> OnSurvivorToggled; // (survivorId, isSelected)
        public event Action<ZoneCell, MissionType, IReadOnlyList<string>> OnDispatched;
        public event Action<string> OnDispatchRejected; // reason

        // ─── Lifecycle ────────────────────────────────────────────────────────
        private void Start()
        {
            ServiceLocator.TryGet(out _traversal);
            ServiceLocator.TryGet(out _profile);
            ServiceLocator.TryGet(out _unlocks);

            ApplyStageSizing();
        }

        private void ApplyStageSizing()
        {
            if (stageSizeRules == null || stageSizeRules.Count == 0) return;
            if (_traversal is not TraversalContext concrete) return;
            int camp = _profile?.CampLevel ?? 0;

            StageSizeRule? best = null;
            for (int i = 0; i < stageSizeRules.Count; i++)
            {
                if (camp >= stageSizeRules[i].minCampLevel)
                {
                    if (!best.HasValue || stageSizeRules[i].minCampLevel > best.Value.minCampLevel)
                        best = stageSizeRules[i];
                }
            }
            if (best.HasValue && (best.Value.width != concrete.GridWidth || best.Value.height != concrete.GridHeight))
            {
                concrete.RegenerateAtSize(best.Value.width, best.Value.height);
            }
        }

        // ─── Public selection API ─────────────────────────────────────────────
        /// <summary>Select a zone by grid coords. Locked zones are rejected silently.</summary>
        public bool SelectZone(int x, int y)
        {
            if (_traversal == null) return false;
            var cell = (_traversal as TraversalContext)?.GetCell(x, y) ?? default;
            if (cell.state == ZoneState.Locked) return false;
            if (string.IsNullOrEmpty(cell.zoneId)) return false;

            SelectedZone = cell;
            OnZoneSelectionChanged?.Invoke(SelectedZone);
            return true;
        }

        public void ClearZoneSelection()
        {
            if (!SelectedZone.HasValue) return;
            SelectedZone = null;
            OnZoneSelectionChanged?.Invoke(null);
        }

        public void SetMissionType(MissionType t)
        {
            if (SelectedMissionType == t) return;
            SelectedMissionType = t;
            OnMissionTypeChanged?.Invoke(t);
        }

        /// <summary>Toggle a survivor in/out of the squad selection.</summary>
        public bool ToggleSurvivor(string survivorId)
        {
            if (string.IsNullOrEmpty(survivorId)) return false;
            if (_selectedIds.Contains(survivorId))
            {
                _selectedIds.Remove(survivorId);
                OnSurvivorToggled?.Invoke(survivorId, false);
                return true;
            }
            if (_selectedIds.Count >= SquadCap) return false;
            _selectedIds.Add(survivorId);
            OnSurvivorToggled?.Invoke(survivorId, true);
            return true;
        }

        public bool IsSurvivorSelected(string survivorId) => _selectedIds.Contains(survivorId);

        public void ClearSquad()
        {
            for (int i = _selectedIds.Count - 1; i >= 0; i--)
            {
                var id = _selectedIds[i];
                _selectedIds.RemoveAt(i);
                OnSurvivorToggled?.Invoke(id, false);
            }
        }

        // ─── Dispatch ─────────────────────────────────────────────────────────
        public bool CanDispatch(out string reason)
        {
            if (!SelectedZone.HasValue)      { reason = "No zone selected.";   return false; }
            if (SelectedZone.Value.state == ZoneState.Locked) { reason = "Zone is locked."; return false; }
            if (_selectedIds.Count == 0)     { reason = "Select at least one survivor."; return false; }
            if (_selectedIds.Count > SquadCap){ reason = $"Squad over cap ({SquadCap}).";  return false; }
            reason = null;
            return true;
        }

        /// <summary>
        /// Commit the zone selection to <see cref="ITraversalContext"/>. Does NOT
        /// auto-start the Wandering run — the player navigates manually.
        /// </summary>
        public bool Dispatch()
        {
            if (!CanDispatch(out var reason))
            {
                OnDispatchRejected?.Invoke(reason);
                return false;
            }
            var zone = SelectedZone.Value;
            _traversal.SelectZoneById(zone.zoneId);
            OnDispatched?.Invoke(zone, SelectedMissionType, _selectedIds);
            return true;
        }

        // ─── Roster source ────────────────────────────────────────────────────
        public IEnumerable<SurvivorRef> AvailableRoster()
        {
            if (!resolveRosterFromService) return testRoster;
            if (ServiceLocator.TryGet<IRosterService>(out var svc)) return svc.GetAvailableSurvivors();
            return testRoster;
        }

        [Serializable]
        public struct StageSizeRule
        {
            public int minCampLevel;
            public int width;
            public int height;
        }

        /// <summary>Lightweight survivor reference for UI binding (avoid pulling whole entity).</summary>
        [Serializable]
        public struct SurvivorRef
        {
            public string id;
            public string displayName;
            public int level;
            public CharacterType characterType;
        }
    }

    /// <summary>
    /// Roster source contract — Phase 3 will implement this against the Camp's
    /// active-survivor list. Stubbed here so the Traversal scene compiles solo.
    /// </summary>
    public interface IRosterService
    {
        IEnumerable<TraversalSceneController.SurvivorRef> GetAvailableSurvivors();
    }
}
