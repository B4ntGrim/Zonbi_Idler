// Assets/Scripts/UI/PrestigeSceneView.cs
using System.Collections.Generic;
using TMPro;
using UnityEngine;
using UnityEngine.UI;
using ZedIdler.Data;
using ZedIdler.Services;

namespace ZedIdler.UI
{
    /// <summary>
    /// Prestige screen: shows current Legacy Points, tier rank, the prestige
    /// payout preview + reset button, and a scrollable grid of buyable
    /// permanent upgrades.
    /// </summary>
    [DisallowMultipleComponent]
    public sealed class PrestigeSceneView : MonoBehaviour
    {
        [Header("Header")]
        [SerializeField] private TMP_Text legacyPointsText;
        [SerializeField] private TMP_Text tierNameText;
        [SerializeField] private TMP_Text prestigeCountText;

        [Header("Prestige Action")]
        [SerializeField] private TMP_Text payoutPreviewText;
        [SerializeField] private Button prestigeButton;
        [SerializeField] private TMP_Text gateText;
        [SerializeField] private GameObject confirmPanel;
        [SerializeField] private Button confirmYesButton;
        [SerializeField] private Button confirmNoButton;

        [Header("Upgrades Grid")]
        [SerializeField] private RectTransform upgradeContainer;
        [SerializeField] private Button upgradeCardPrefab; // children: Name, Desc, Level, Cost (TMP)

        [Header("Toast")]
        [SerializeField] private TMP_Text toastText;

        private IPrestigeService _prestige;
        private IPlayerProfile _profile;
        private readonly List<Button> _cards = new();

        private void OnEnable()
        {
            ServiceLocator.TryGet(out _prestige);
            ServiceLocator.TryGet(out _profile);
            if (_prestige == null) { enabled = false; return; }

            _prestige.OnLegacyPointsChanged += _ => Refresh();
            _prestige.OnUpgradePurchased += (_, __) => Refresh();
            _prestige.OnPrestiged += OnPrestiged;
            _prestige.OnTierChanged += _ => Refresh();

            if (prestigeButton != null) prestigeButton.onClick.AddListener(() => { if (confirmPanel != null) confirmPanel.SetActive(true); });
            if (confirmYesButton != null) confirmYesButton.onClick.AddListener(DoPrestige);
            if (confirmNoButton != null) confirmNoButton.onClick.AddListener(() => { if (confirmPanel != null) confirmPanel.SetActive(false); });

            BuildUpgrades();
            Refresh();
        }

        private void OnDisable()
        {
            if (_prestige == null) return;
            _prestige.OnLegacyPointsChanged -= _ => Refresh();
            _prestige.OnPrestiged -= OnPrestiged;
        }

        private void Refresh()
        {
            if (legacyPointsText != null) legacyPointsText.text = $"{_prestige.LegacyPoints} LP";
            if (tierNameText != null) tierNameText.text = _prestige.CurrentTierName;
            if (prestigeCountText != null) prestigeCountText.text = $"Prestiges: {_prestige.PrestigeCount}";

            long totalXp = _profile != null ? _profile.TotalSurvivorXp : 0;
            long preview = _prestige.PreviewLegacyPoints(totalXp);
            bool can = _prestige.CanPrestige();

            if (payoutPreviewText != null) payoutPreviewText.text = $"Reset reward: +{preview} LP";
            if (prestigeButton != null) prestigeButton.interactable = can;
            if (gateText != null)
                gateText.text = can ? "" : $"Requires Camp Level {_prestige.GateCampLevel}";

            for (int i = 0; i < _cards.Count; i++) RefreshCard(_cards[i], _prestige.Upgrades[i]);
        }

        private void BuildUpgrades()
        {
            if (upgradeContainer == null || upgradeCardPrefab == null) return;
            foreach (Transform t in upgradeContainer) Destroy(t.gameObject);
            _cards.Clear();
            for (int i = 0; i < _prestige.Upgrades.Count; i++)
            {
                var upg = _prestige.Upgrades[i];
                var card = Instantiate(upgradeCardPrefab, upgradeContainer);
                string id = upg.UpgradeId;
                card.onClick.AddListener(() =>
                {
                    bool ok = _prestige.PurchaseUpgrade(id);
                    Toast(ok ? $"Purchased {upg.DisplayName}" : "Not enough Legacy Points", !ok);
                });
                _cards.Add(card);
            }
        }

        private void RefreshCard(Button card, PrestigeUpgrade upg)
        {
            var labels = card.GetComponentsInChildren<TMP_Text>();
            int lvl = _prestige.GetUpgradeLevel(upg.UpgradeId);
            bool maxed = lvl >= upg.MaxLevel;
            int cost = maxed ? 0 : upg.CostForLevel(lvl);
            if (labels.Length > 0) labels[0].text = upg.DisplayName;
            if (labels.Length > 1) labels[1].text = upg.Description;
            if (labels.Length > 2) labels[2].text = $"Lv {lvl}/{upg.MaxLevel}";
            if (labels.Length > 3) labels[3].text = maxed ? "MAX" : $"{cost} LP";
            card.interactable = !maxed && _prestige.LegacyPoints >= cost;
        }

        private void DoPrestige()
        {
            if (confirmPanel != null) confirmPanel.SetActive(false);
            long totalXp = _profile != null ? _profile.TotalSurvivorXp : 0;
            _prestige.Prestige(totalXp);
            // NOTE: a PrestigeCoordinator listening to OnPrestiged wipes camp/survivors/inventory.
        }

        private void OnPrestiged(long awarded) { Toast($"Prestiged! +{awarded} Legacy Points", false); Refresh(); }

        private void Toast(string msg, bool err)
        {
            if (toastText == null) return;
            toastText.text = msg;
            toastText.color = err ? new Color(0.9f, 0.45f, 0.3f) : new Color(0.6f, 0.85f, 0.6f);
        }
    }
}
