// Assets/Scripts/UI/ContractsSceneView.cs
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
    /// Designer-wired UI for the Contracts tab. Three sections: filter tabs
    /// (All / Available / Active / Rescue) → contract list → detail+accept
    /// panel with squad picker.
    /// </summary>
    [DisallowMultipleComponent]
    public sealed class ContractsSceneView : MonoBehaviour
    {
        public enum Filter { All = 0, Available = 1, Active = 2, Rescue = 3 }

        [Header("Filter Tabs")]
        [SerializeField] private Toggle filterAll;
        [SerializeField] private Toggle filterAvailable;
        [SerializeField] private Toggle filterActive;
        [SerializeField] private Toggle filterRescue;

        [Header("Contract List")]
        [SerializeField] private RectTransform listContainer;
        [SerializeField] private Button listEntryPrefab; // button with TMP_Text children
        [SerializeField] private TMP_Text emptyState;

        [Header("Detail Panel")]
        [SerializeField] private GameObject detailPanel;
        [SerializeField] private TMP_Text detailName;
        [SerializeField] private TMP_Text detailFaction;
        [SerializeField] private TMP_Text detailType;
        [SerializeField] private TMP_Text detailDescription;
        [SerializeField] private TMP_Text detailReward;
        [SerializeField] private TMP_Text detailTimer;
        [SerializeField] private TMP_Text detailProgress;
        [SerializeField] private TMP_Text detailObjective;

        [Header("Survivor Squad Picker (for accept)")]
        [SerializeField] private RectTransform squadContainer;
        [SerializeField] private Toggle survivorTogglePrefab;
        [SerializeField] private Button acceptButton;
        [SerializeField] private Button abandonButton;
        [SerializeField] private TMP_Text statusText;

        // ─── Runtime ─────────────────────────────────────────────────────────
        private IContractsService _contracts;
        private IFactionService _factions;
        private IPlayerProfile _profile;
        private ICatalogService _catalog;
        private Filter _filter = Filter.All;
        private ContractInstance? _selected;
        private readonly Dictionary<string, Toggle> _squadToggles = new Dictionary<string, Toggle>();

        // ─── Lifecycle ────────────────────────────────────────────────────────
        private void OnEnable()
        {
            ServiceLocator.TryGet(out _contracts);
            ServiceLocator.TryGet(out _factions);
            ServiceLocator.TryGet(out _profile);
            ServiceLocator.TryGet(out _catalog);
            if (_contracts == null) { enabled = false; return; }

            _contracts.OnContractOffered  += _ => Rebuild();
            _contracts.OnContractAccepted += _ => Rebuild();
            _contracts.OnContractCompleted+= _ => { Rebuild(); SetStatus("✓ Contract complete", false); };
            _contracts.OnContractFailed   += _ => { Rebuild(); SetStatus("✗ Contract failed", true); };
            _contracts.OnContractExpired  += _ => Rebuild();

            HookTabs();
            if (acceptButton != null) acceptButton.onClick.AddListener(OnAccept);
            if (abandonButton != null) abandonButton.onClick.AddListener(OnAbandon);
            Rebuild();
        }

        private void OnDisable()
        {
            if (_contracts == null) return;
            // Unsubscribe omitted for brevity — event refs are local lambdas; OnDisable is rare during play.
        }

        private void Update()
        {
            if (_selected.HasValue) RefreshDetailTimers();
        }

        private void HookTabs()
        {
            if (filterAll != null)       filterAll.onValueChanged.AddListener(v => { if (v) { _filter = Filter.All; Rebuild(); } });
            if (filterAvailable != null) filterAvailable.onValueChanged.AddListener(v => { if (v) { _filter = Filter.Available; Rebuild(); } });
            if (filterActive != null)    filterActive.onValueChanged.AddListener(v => { if (v) { _filter = Filter.Active; Rebuild(); } });
            if (filterRescue != null)    filterRescue.onValueChanged.AddListener(v => { if (v) { _filter = Filter.Rescue; Rebuild(); } });
        }

        // ─── Build ────────────────────────────────────────────────────────────
        private void Rebuild()
        {
            if (listContainer == null || listEntryPrefab == null) return;
            foreach (Transform t in listContainer) Destroy(t.gameObject);

            // Contracts
            int count = 0;
            foreach (var c in _contracts.All)
            {
                if (!MatchesFilter(c)) continue;
                AddListEntry(c, isRescue: false);
                count++;
            }
            // Rescue missions (unified per spec)
            if (_filter == Filter.All || _filter == Filter.Rescue)
            {
                if (_profile != null)
                {
                    foreach (var rescue in _profile.ActiveRescues)
                    {
                        AddRescueEntry(rescue);
                        count++;
                    }
                }
            }
            if (emptyState != null) emptyState.gameObject.SetActive(count == 0);
            if (detailPanel != null) detailPanel.SetActive(_selected.HasValue);
        }

        private bool MatchesFilter(ContractInstance c)
        {
            switch (_filter)
            {
                case Filter.Available: return c.state == ContractState.Available;
                case Filter.Active:    return c.state == ContractState.Accepted || c.state == ContractState.InProgress;
                case Filter.Rescue:    return false; // shown separately
                default:               return c.state != ContractState.Completed && c.state != ContractState.Failed && c.state != ContractState.Expired;
            }
        }

        private void AddListEntry(ContractInstance c, bool isRescue)
        {
            var btn = Instantiate(listEntryPrefab, listContainer);
            var labels = btn.GetComponentsInChildren<TMP_Text>();
            if (labels.Length > 0) labels[0].text = $"{c.type} • diff {c.difficulty} • {c.factionId}";
            if (labels.Length > 1) labels[1].text = c.state.ToString();
            btn.onClick.AddListener(() => { _selected = c; RefreshDetail(); });
        }

        private void AddRescueEntry(RescueMission r)
        {
            var btn = Instantiate(listEntryPrefab, listContainer);
            var labels = btn.GetComponentsInChildren<TMP_Text>();
            if (labels.Length > 0) labels[0].text = $"RESCUE • {r.fallenSurvivorId.Substring(0, Mathf.Min(8, r.fallenSurvivorId.Length))} • tier {r.zoneTier}";
            if (labels.Length > 1) labels[1].text = r.state.ToString();
            btn.onClick.AddListener(() =>
            {
                // Surface as a synthetic ContractInstance for display.
                _selected = new ContractInstance
                {
                    instanceId = r.missionId,
                    contractId = "rescue",
                    type = ContractType.Rescue,
                    factionId = "rescue",
                    difficulty = r.zoneTier,
                    state = ContractState.Accepted,
                    expiresUtcTicks = r.expiresUtcTicks,
                    progressGoal = 1,
                    creditReward = 0,
                    factionRepReward = 0,
                    reservedSurvivorIds = new[] { r.fallenSurvivorId }
                };
                RefreshDetail();
            });
        }

        // ─── Detail ───────────────────────────────────────────────────────────
        private void RefreshDetail()
        {
            if (!_selected.HasValue || detailPanel == null) return;
            detailPanel.SetActive(true);
            var c = _selected.Value;
            var template = (_catalog is IContractCatalogProvider ccp) ? ccp.GetContract(c.contractId) : null;

            if (detailName != null)        detailName.text       = template?.DisplayName ?? c.type.ToString();
            if (detailFaction != null)     detailFaction.text    = c.factionId;
            if (detailType != null)        detailType.text       = c.type.ToString();
            if (detailDescription != null) detailDescription.text = template?.Description ?? "—";
            if (detailReward != null)      detailReward.text     = $"{c.creditReward} cr + {c.factionRepReward} rep";
            if (detailProgress != null)    detailProgress.text   = $"Progress: {c.progressCurrent}/{c.progressGoal}";
            if (detailObjective != null && template != null)
            {
                detailObjective.text = BuildObjectiveText(template);
            }
            RefreshDetailTimers();
            BuildSquadPicker(c.state == ContractState.Available);
            if (acceptButton != null) acceptButton.gameObject.SetActive(c.state == ContractState.Available);
            if (abandonButton != null) abandonButton.gameObject.SetActive(c.state == ContractState.Accepted || c.state == ContractState.InProgress);
        }

        private void RefreshDetailTimers()
        {
            if (detailTimer == null || !_selected.HasValue) return;
            long delta = _selected.Value.expiresUtcTicks - DateTime.UtcNow.Ticks;
            if (delta <= 0) { detailTimer.text = "EXPIRED"; return; }
            var ts = TimeSpan.FromTicks(delta);
            detailTimer.text = ts.TotalHours >= 1 ? $"{(int)ts.TotalHours}h {ts.Minutes}m" : $"{ts.Minutes}m {ts.Seconds}s";
        }

        private string BuildObjectiveText(Contract t)
        {
            switch (t.Type)
            {
                case ContractType.Courier:
                case ContractType.ResourceDelivery:
                    return $"Deliver {t.ObjectiveQuantity}× {t.ObjectiveItemId}";
                case ContractType.Salvage:
                    return $"Gather {t.ObjectiveQuantity}× {t.ObjectiveItemId} from {t.ObjectiveBiome}";
                case ContractType.Defense:
                    return $"Hold {t.ObjectiveBiome} for {t.ObjectiveCount} turns";
                case ContractType.HazardSurvey:
                    return $"Survey {t.ObjectiveCount} encounters in {t.ObjectiveBiome}";
                case ContractType.EliteElimination:
                    return $"Kill {t.ObjectiveCount}× {t.ObjectiveZombieTier}";
                case ContractType.Rivalry:
                    return $"Eliminate {t.ObjectiveCount} rival operatives";
                case ContractType.HighRoller:
                    return "Single high-stakes objective";
                case ContractType.Reconnaissance:
                    return $"Scout {t.ObjectiveCount} zones in {t.ObjectiveBiome}";
                default: return "—";
            }
        }

        // ─── Squad picker ─────────────────────────────────────────────────────
        private void BuildSquadPicker(bool enabled)
        {
            if (squadContainer == null) return;
            foreach (Transform t in squadContainer) Destroy(t.gameObject);
            _squadToggles.Clear();
            if (!enabled || survivorTogglePrefab == null) { squadContainer.gameObject.SetActive(false); return; }
            squadContainer.gameObject.SetActive(true);

            // Source roster from the traversal scene's interface if present; otherwise show placeholders.
            if (ServiceLocator.TryGet<ZedIdler.Systems.IRosterService>(out var roster))
            {
                foreach (var s in roster.GetAvailableSurvivors())
                {
                    var t = Instantiate(survivorTogglePrefab, squadContainer);
                    var label = t.GetComponentInChildren<TMP_Text>();
                    if (label != null) label.text = $"{s.displayName} (Lv{s.level})";
                    _squadToggles[s.id] = t;
                }
            }
        }

        // ─── Buttons ──────────────────────────────────────────────────────────
        private void OnAccept()
        {
            if (!_selected.HasValue) return;
            var ids = new List<string>();
            foreach (var kv in _squadToggles)
                if (kv.Value.isOn) ids.Add(kv.Key);
            bool ok = _contracts.AcceptContract(_selected.Value.instanceId, ids);
            SetStatus(ok ? "Contract accepted." : "Cannot accept (check squad).", !ok);
            if (ok) Rebuild();
        }

        private void OnAbandon()
        {
            if (!_selected.HasValue) return;
            _contracts.FailContract(_selected.Value.instanceId);
            SetStatus("Contract abandoned.", true);
            _selected = null;
            Rebuild();
        }

        private void SetStatus(string msg, bool isError)
        {
            if (statusText == null) return;
            statusText.text = msg;
            statusText.color = isError ? new Color(0.9f, 0.4f, 0.3f) : new Color(0.5f, 0.85f, 0.5f);
            // Toast slide on every status change.
            var rt = statusText.rectTransform;
            if (ZedIdler.Services.ServiceLocator.TryGet<ZedIdler.Services.IUIAnimationService>(out var anim))
                anim.Toast(rt, new Vector2(0f, -40f), 1.6f, 0.3f);
        }
    }
}
