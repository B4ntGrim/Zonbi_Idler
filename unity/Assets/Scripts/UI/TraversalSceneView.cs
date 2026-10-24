// Assets/Scripts/UI/TraversalSceneView.cs
using System.Collections.Generic;
using TMPro;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.UI;
using ZedIdler.Data;
using ZedIdler.Services;
using ZedIdler.Systems;

namespace ZedIdler.UI
{
    /// <summary>
    /// Designer-wired Canvas binder for the Traversal scene. Builds the satellite
    /// grid from <see cref="ITraversalContext"/>, renders a detail panel for the
    /// selected zone, and a survivor checkbox list capped by
    /// <see cref="IPlayerProfile.SquadSlots"/>.
    /// </summary>
    /// <remarks>
    /// Layout (designer):
    /// - Left panel: zone detail (name, biome, threat, RMAT tier, duration, rewards, state)
    /// - Center: GridLayoutGroup container that hosts ZoneCellView prefab instances
    /// - Right panel: mission-type tabs + squad checkboxes + Dispatch button
    /// </remarks>
    [DisallowMultipleComponent]
    public sealed class TraversalSceneView : MonoBehaviour
    {
        [Header("Controller")]
        [SerializeField] private TraversalSceneController controller;

        [Header("Grid")]
        [SerializeField] private RectTransform gridContainer;
        [SerializeField] private ZoneCellView cellPrefab;
        [SerializeField] private GridLayoutGroup gridLayout;
        [Tooltip("Fixed pixel size for each grid cell. Computed to fit the container if FitToContainer is on.")]
        [SerializeField] private Vector2 fixedCellSize = new Vector2(72, 72);
        [SerializeField] private bool fitToContainer = true;

        [Header("Zone Detail Panel")]
        [SerializeField] private GameObject detailPanel;
        [SerializeField] private TMP_Text detailZoneName;
        [SerializeField] private TMP_Text detailBiome;
        [SerializeField] private TMP_Text detailThreatStars;
        [SerializeField] private TMP_Text detailRmatTier;
        [SerializeField] private TMP_Text detailDuration;
        [SerializeField] private TMP_Text detailRewards;
        [SerializeField] private TMP_Text detailState;
        [SerializeField] private TMP_Text lockTooltip;

        [Header("Mission Type Tabs")]
        [SerializeField] private Toggle[] missionTypeToggles; // 5 toggles for Scavenge/Contract/Training/Patrol/Raid
        [SerializeField] private TMP_Text missionTypeDescription;

        [Header("Squad")]
        [SerializeField] private RectTransform squadListContainer;
        [SerializeField] private Toggle squadEntryPrefab;
        [SerializeField] private TMP_Text squadCapText;

        [Header("Dispatch")]
        [SerializeField] private Button dispatchButton;
        [SerializeField] private TMP_Text dispatchStatusText;

        [Header("Input")]
        [SerializeField] private InputActionReference cancelAction;

        // ─── State ───────────────────────────────────────────────────────────
        private readonly List<ZoneCellView> _cellViews = new List<ZoneCellView>();
        private readonly Dictionary<string, Toggle> _squadToggles = new Dictionary<string, Toggle>();
        private ITraversalContext _traversal;
        private IPlayerProfile _profile;
        private ZoneCellView _selectedCellView;

        // ─── Lifecycle ────────────────────────────────────────────────────────
        private void OnEnable()
        {
            ServiceLocator.TryGet(out _traversal);
            ServiceLocator.TryGet(out _profile);

            if (controller == null)
            {
                Debug.LogError("[TraversalSceneView] No TraversalSceneController assigned.");
                enabled = false; return;
            }
            controller.OnZoneSelectionChanged += HandleZoneSelectionChanged;
            controller.OnMissionTypeChanged   += HandleMissionTypeChanged;
            controller.OnSurvivorToggled      += HandleSurvivorToggled;
            controller.OnDispatchRejected     += msg => SetStatus(msg, isError: true);
            controller.OnDispatched           += (z, m, ids) => SetStatus($"Dispatched to {z.zoneId} ({m}) with {ids.Count} survivor(s)", isError: false);

            if (dispatchButton != null) dispatchButton.onClick.AddListener(OnDispatchClicked);
            for (int i = 0; i < missionTypeToggles.Length && i < 5; i++)
            {
                int idx = i;
                if (missionTypeToggles[i] != null)
                    missionTypeToggles[i].onValueChanged.AddListener(v => { if (v) controller.SetMissionType((MissionType)idx); });
            }
            if (cancelAction != null)
            {
                cancelAction.action.performed += OnCancel;
                cancelAction.action.Enable();
            }

            BuildGrid();
            BuildSquadList();
            RefreshDetailPanel(null);
            SetStatus("", false);
        }

        private void OnDisable()
        {
            if (controller != null)
            {
                controller.OnZoneSelectionChanged -= HandleZoneSelectionChanged;
                controller.OnMissionTypeChanged   -= HandleMissionTypeChanged;
                controller.OnSurvivorToggled      -= HandleSurvivorToggled;
            }
            if (dispatchButton != null) dispatchButton.onClick.RemoveListener(OnDispatchClicked);
            if (cancelAction != null)
            {
                cancelAction.action.performed -= OnCancel;
                cancelAction.action.Disable();
            }
        }

        // ─── Grid construction ────────────────────────────────────────────────
        private void BuildGrid()
        {
            if (_traversal == null || cellPrefab == null || gridContainer == null) return;

            // Clear existing cells.
            for (int i = 0; i < _cellViews.Count; i++)
                if (_cellViews[i] != null) Destroy(_cellViews[i].gameObject);
            _cellViews.Clear();

            int w = (_traversal as TraversalContext)?.GridWidth  ?? 8;
            int h = (_traversal as TraversalContext)?.GridHeight ?? 8;

            if (gridLayout != null)
            {
                gridLayout.constraint = GridLayoutGroup.Constraint.FixedColumnCount;
                gridLayout.constraintCount = w;
                if (fitToContainer)
                {
                    float cw = (gridContainer.rect.width  - gridLayout.padding.horizontal - (w - 1) * gridLayout.spacing.x) / Mathf.Max(1, w);
                    float ch = (gridContainer.rect.height - gridLayout.padding.vertical   - (h - 1) * gridLayout.spacing.y) / Mathf.Max(1, h);
                    gridLayout.cellSize = new Vector2(Mathf.Floor(Mathf.Min(cw, ch)), Mathf.Floor(Mathf.Min(cw, ch)));
                }
                else gridLayout.cellSize = fixedCellSize;
            }

            foreach (var cell in _traversal.AllCells())
            {
                var view = Instantiate(cellPrefab, gridContainer);
                view.Bind(cell);
                view.OnClicked   += HandleCellClicked;
                view.OnHovered   += HandleCellHovered;
                view.OnUnhovered += HandleCellUnhovered;
                _cellViews.Add(view);
            }
        }

        private void BuildSquadList()
        {
            if (squadListContainer == null || squadEntryPrefab == null) return;

            foreach (Transform child in squadListContainer) Destroy(child.gameObject);
            _squadToggles.Clear();

            int cap = controller.SquadCap;
            if (squadCapText != null) squadCapText.text = $"Squad: 0 / {cap}";

            foreach (var s in controller.AvailableRoster())
            {
                var t = Instantiate(squadEntryPrefab, squadListContainer);
                var label = t.GetComponentInChildren<TMP_Text>();
                if (label != null) label.text = $"{s.displayName}  Lv{s.level}  ({s.characterType})";

                string id = s.id;
                t.onValueChanged.AddListener(v =>
                {
                    if (v && controller.SelectedSurvivorIds.Count >= controller.SquadCap)
                    {
                        t.SetIsOnWithoutNotify(false);
                        SetStatus($"Squad full ({controller.SquadCap}).", true);
                        return;
                    }
                    controller.ToggleSurvivor(id);
                });
                _squadToggles[id] = t;
            }
        }

        // ─── Event handlers ───────────────────────────────────────────────────
        private void HandleCellClicked(ZoneCellView view)
        {
            if (view.Cell.state == ZoneState.Locked)
            {
                if (lockTooltip != null)
                {
                    lockTooltip.gameObject.SetActive(true);
                    lockTooltip.text = $"Locked — clear nearby zones to unlock";
                    CancelInvoke(nameof(HideLockTooltip));
                    Invoke(nameof(HideLockTooltip), 1.5f);
                }
                return;
            }
            controller.SelectZone(view.Cell.gridX, view.Cell.gridY);
        }

        private void HideLockTooltip()
        {
            if (lockTooltip != null) lockTooltip.gameObject.SetActive(false);
        }

        private void HandleCellHovered(ZoneCellView view)
        {
            if (!controller.SelectedZone.HasValue) RefreshDetailPanel(view.Cell);
        }

        private void HandleCellUnhovered(ZoneCellView view)
        {
            if (!controller.SelectedZone.HasValue) RefreshDetailPanel(null);
        }

        private void HandleZoneSelectionChanged(ZoneCell? zone)
        {
            // Update visual selection on cells.
            for (int i = 0; i < _cellViews.Count; i++)
            {
                var v = _cellViews[i];
                v.SetSelected(zone.HasValue && v.Cell.zoneId == zone.Value.zoneId);
            }
            _selectedCellView = null;
            RefreshDetailPanel(zone);
        }

        private void HandleMissionTypeChanged(MissionType m)
        {
            if (missionTypeDescription != null) missionTypeDescription.text = DescribeMissionType(m);
        }

        private void HandleSurvivorToggled(string id, bool isSelected)
        {
            if (_squadToggles.TryGetValue(id, out var t)) t.SetIsOnWithoutNotify(isSelected);
            if (squadCapText != null)
                squadCapText.text = $"Squad: {controller.SelectedSurvivorIds.Count} / {controller.SquadCap}";
        }

        // ─── Detail panel ─────────────────────────────────────────────────────
        private void RefreshDetailPanel(ZoneCell? zone)
        {
            bool show = zone.HasValue;
            if (detailPanel != null) detailPanel.SetActive(show);
            if (!show) return;

            var c = zone.Value;
            if (detailZoneName    != null) detailZoneName.text  = c.zoneId;
            if (detailBiome       != null) detailBiome.text     = c.biome.ToString();
            if (detailThreatStars != null) detailThreatStars.text = new string('★', c.threatLevel) + new string('☆', Mathf.Max(0, 5 - c.threatLevel));
            if (detailState       != null) detailState.text     = c.state.ToString();
            if (detailRmatTier    != null) detailRmatTier.text  = $"RMAT Tier ~{Mathf.Clamp(c.threatLevel - 1, 0, 5)}";
            if (detailDuration    != null) detailDuration.text  = $"Est. {EstimateDurationMinutes(c)} min";
            if (detailRewards     != null) detailRewards.text   = DescribeRewards(c.biome, controller.SelectedMissionType);
        }

        private static int EstimateDurationMinutes(ZoneCell c) => 3 + c.threatLevel * 2;

        private static string DescribeRewards(BiomeTag b, MissionType m)
        {
            switch (m)
            {
                case MissionType.Scavenge: return $"Materials, RMAT scraps from {b}";
                case MissionType.Contract: return "Faction rep + cash payout";
                case MissionType.Training: return "+SURVIVAL XP, lower zombie tier";
                case MissionType.Patrol:   return "Threat clock reduction, minor loot";
                case MissionType.Raid:     return $"High-tier loot from {b}, elite zombies";
                default: return "—";
            }
        }

        private static string DescribeMissionType(MissionType m)
        {
            switch (m)
            {
                case MissionType.Scavenge: return "Scavenge — material focus, average threat.";
                case MissionType.Contract: return "Contract — faction-issued, reputation reward.";
                case MissionType.Training: return "Training — reduced threat, SURVIVAL XP focus.";
                case MissionType.Patrol:   return "Patrol — clear & lock-down, threat reduction.";
                case MissionType.Raid:     return "Raid — high-tier loot, recommended squad 3+.";
                default: return "—";
            }
        }

        // ─── Buttons ──────────────────────────────────────────────────────────
        private void OnDispatchClicked() => controller.Dispatch();

        private void OnCancel(InputAction.CallbackContext _)
        {
            controller.ClearZoneSelection();
            controller.ClearSquad();
            SetStatus("Selection cleared.", false);
        }

        private void SetStatus(string msg, bool isError)
        {
            if (dispatchStatusText == null) return;
            dispatchStatusText.text = msg;
            dispatchStatusText.color = isError ? new Color(0.9f, 0.45f, 0.3f) : new Color(0.6f, 0.85f, 0.6f);
        }
    }
}
