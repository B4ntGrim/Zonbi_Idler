// Assets/Scripts/UI/FactionsSceneView.cs
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
    /// Designer-wired Canvas binder for the Factions tab.
    /// </summary>
    /// <remarks>
    /// Two-column layout: left = faction list (one row per faction), right =
    /// detail panel for the selected faction (description, rank progress,
    /// service ladder, rival summary).
    /// </remarks>
    [DisallowMultipleComponent]
    public sealed class FactionsSceneView : MonoBehaviour
    {
        [Header("Faction List")]
        [SerializeField] private RectTransform listContainer;
        [SerializeField] private FactionRowView rowPrefab;

        [Header("Detail Panel")]
        [SerializeField] private GameObject detailPanel;
        [SerializeField] private Image    detailIcon;
        [SerializeField] private TMP_Text detailName;
        [SerializeField] private TMP_Text detailDescription;
        [SerializeField] private TMP_Text detailRankName;
        [SerializeField] private Slider   detailRankProgress;
        [SerializeField] private TMP_Text detailReputationText;
        [SerializeField] private RectTransform serviceLadderContainer;
        [SerializeField] private TMP_Text serviceEntryPrefab;
        [SerializeField] private TMP_Text rivalsText;

        private IFactionService _factions;
        private readonly List<FactionRowView> _rows = new List<FactionRowView>();
        private Faction _selected;

        private void OnEnable()
        {
            ServiceLocator.TryGet(out _factions);
            if (_factions == null) { enabled = false; return; }
            _factions.OnReputationChanged += HandleRepChanged;
            _factions.OnRankChanged       += HandleRankChanged;
            BuildList();
        }

        private void OnDisable()
        {
            if (_factions != null)
            {
                _factions.OnReputationChanged -= HandleRepChanged;
                _factions.OnRankChanged       -= HandleRankChanged;
            }
        }

        private void BuildList()
        {
            if (listContainer == null || rowPrefab == null) return;
            foreach (Transform t in listContainer) Destroy(t.gameObject);
            _rows.Clear();
            foreach (var faction in _factions.Factions)
            {
                if (faction == null) continue;
                var row = Instantiate(rowPrefab, listContainer);
                int rank = _factions.GetRankIndex(faction.FactionId);
                int rep  = _factions.GetReputation(faction.FactionId);
                row.Bind(faction, rep, rank, FactionService.Ranks[rank]);
                row.OnClicked += HandleRowClicked;
                _rows.Add(row);
            }
            if (detailPanel != null) detailPanel.SetActive(false);
        }

        private void HandleRowClicked(FactionRowView row)
        {
            _selected = row.Faction;
            RefreshDetail();
        }

        private void RefreshDetail()
        {
            if (_selected == null || detailPanel == null) return;
            detailPanel.SetActive(true);

            int rep  = _factions.GetReputation(_selected.FactionId);
            int rank = _factions.GetRankIndex(_selected.FactionId);
            int toNext = _factions.GetReputationToNextRank(_selected.FactionId);

            if (detailIcon != null)        { detailIcon.sprite = _selected.Icon; detailIcon.color = _selected.Color; }
            if (detailName != null)        { detailName.text = _selected.DisplayName; detailName.color = _selected.Color; }
            if (detailDescription != null) detailDescription.text = _selected.Description;
            if (detailRankName != null)    detailRankName.text = FactionService.Ranks[rank];
            if (detailReputationText != null)
            {
                detailReputationText.text = rank >= FactionService.Ranks.Length - 1
                    ? $"{rep} (MAX)"
                    : $"{rep} / {FactionService.Thresholds[rank + 1]} ({toNext} to next)";
            }
            if (detailRankProgress != null)
            {
                if (rank >= FactionService.Ranks.Length - 1)
                {
                    detailRankProgress.value = 1f;
                }
                else
                {
                    int floor = FactionService.Thresholds[rank];
                    int ceil  = FactionService.Thresholds[rank + 1];
                    detailRankProgress.value = Mathf.InverseLerp(floor, ceil, rep);
                }
            }

            // Service ladder.
            if (serviceLadderContainer != null && serviceEntryPrefab != null)
            {
                foreach (Transform t in serviceLadderContainer) Destroy(t.gameObject);
                for (int i = 0; i < _selected.ServicesPerRank.Length; i++)
                {
                    var entry = Instantiate(serviceEntryPrefab, serviceLadderContainer);
                    string svc = _selected.ServicesPerRank[i] ?? "—";
                    bool unlocked = i <= rank;
                    entry.text = $"{(unlocked ? "✓" : "🔒")} {FactionService.Ranks[i]}: {svc}";
                    entry.color = unlocked ? Color.white : new Color(0.5f, 0.5f, 0.5f);
                }
            }

            // Rivals summary.
            if (rivalsText != null)
            {
                if (_selected.RivalFactionIds.Length == 0)
                    rivalsText.text = "Neutral to all factions.";
                else
                    rivalsText.text = "Rivals: " + string.Join(", ", _selected.RivalFactionIds);
            }
        }

        private void HandleRepChanged(string factionId, int oldRep, int newRep)
        {
            for (int i = 0; i < _rows.Count; i++)
            {
                if (_rows[i].Faction != null && _rows[i].Faction.FactionId == factionId)
                {
                    int rank = _factions.GetRankIndex(factionId);
                    _rows[i].UpdateRep(newRep, rank, FactionService.Ranks[rank]);
                }
            }
            if (_selected != null && _selected.FactionId == factionId) RefreshDetail();
        }

        private void HandleRankChanged(string factionId, int newRank)
        {
            if (_selected != null && _selected.FactionId == factionId) RefreshDetail();
        }
    }

    /// <summary>One faction row in the list. Drop in inspector slots.</summary>
    public sealed class FactionRowView : MonoBehaviour, UnityEngine.EventSystems.IPointerClickHandler
    {
        [SerializeField] private Image    background;
        [SerializeField] private Image    icon;
        [SerializeField] private TMP_Text nameText;
        [SerializeField] private TMP_Text rankText;
        [SerializeField] private TMP_Text repText;
        [SerializeField] private Slider   rankProgress;

        public Faction Faction { get; private set; }
        public event Action<FactionRowView> OnClicked;

        public void Bind(Faction faction, int rep, int rankIndex, string rankName)
        {
            Faction = faction;
            if (icon != null)       { icon.sprite = faction.Icon; icon.color = faction.Color; }
            if (background != null) background.color = new Color(faction.Color.r, faction.Color.g, faction.Color.b, 0.2f);
            if (nameText != null)   { nameText.text = faction.DisplayName; nameText.color = faction.Color; }
            UpdateRep(rep, rankIndex, rankName);
        }

        public void UpdateRep(int rep, int rankIndex, string rankName)
        {
            if (rankText != null) rankText.text = rankName;
            if (repText != null)
            {
                // Animate the rep counter for satisfying feedback.
                int currentDisplayed = 0;
                int.TryParse(repText.text, out currentDisplayed);
                if (ZedIdler.Services.ServiceLocator.TryGet<ZedIdler.Services.IUIAnimationService>(out var anim))
                    anim.NumberTick(repText, currentDisplayed, rep, 0.6f);
                else
                    repText.text = rep.ToString();
            }
            if (rankProgress != null)
            {
                if (rankIndex >= FactionService.Ranks.Length - 1) rankProgress.value = 1f;
                else
                {
                    int floor = FactionService.Thresholds[rankIndex];
                    int ceil  = FactionService.Thresholds[rankIndex + 1];
                    rankProgress.value = Mathf.InverseLerp(floor, ceil, rep);
                }
            }
        }

        public void OnPointerClick(UnityEngine.EventSystems.PointerEventData _) => OnClicked?.Invoke(this);
    }
}
