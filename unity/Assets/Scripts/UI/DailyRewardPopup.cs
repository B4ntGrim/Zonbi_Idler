// Assets/Scripts/UI/DailyRewardPopup.cs
using System.Collections.Generic;
using TMPro;
using UnityEngine;
using UnityEngine.UI;
using ZedIdler.Data;
using ZedIdler.Services;

namespace ZedIdler.UI
{
    /// <summary>
    /// Daily-reward popup: shows a horizontal ladder of upcoming days with the
    /// current streak highlighted, a Claim button (enabled only when a claim is
    /// available), and a reward burst on claim.
    /// </summary>
    [DisallowMultipleComponent]
    public sealed class DailyRewardPopup : MonoBehaviour
    {
        [Header("Root")]
        [SerializeField] private GameObject root;

        [Header("Ladder")]
        [SerializeField] private RectTransform ladderContainer;
        [SerializeField] private RectTransform dayCellPrefab; // children: Day(TMP), Reward(TMP), Highlight(GO), Milestone(GO)
        [SerializeField, Range(5, 14)] private int visibleDays = 7;

        [Header("Claim")]
        [SerializeField] private Button claimButton;
        [SerializeField] private TMP_Text streakText;
        [SerializeField] private TMP_Text statusText;

        private IDailyRewardService _daily;

        private void OnEnable()
        {
            ServiceLocator.TryGet(out _daily);
            if (_daily == null) { enabled = false; return; }
            _daily.OnClaimed += OnClaimed;
            if (claimButton != null) claimButton.onClick.AddListener(OnClaimClicked);
            Refresh();
        }

        private void OnDisable()
        {
            if (_daily != null) _daily.OnClaimed -= OnClaimed;
            if (claimButton != null) claimButton.onClick.RemoveListener(OnClaimClicked);
        }

        public void Show() { if (root != null) root.SetActive(true); Refresh(); }
        public void Hide() { if (root != null) root.SetActive(false); }

        private void Refresh()
        {
            var now = System.DateTime.UtcNow;
            bool canClaim = _daily.CanClaim(now);
            int projected = _daily.ProjectedStreak(now);

            if (streakText != null) streakText.text = $"Streak: {_daily.CurrentStreak} days";
            if (claimButton != null) claimButton.interactable = canClaim;
            if (statusText != null)
                statusText.text = canClaim ? $"Claim day {projected}!" : "Come back tomorrow";

            BuildLadder(projected);
        }

        private void BuildLadder(int projectedStreak)
        {
            if (ladderContainer == null || dayCellPrefab == null || _daily.Ladder == null) return;
            foreach (Transform t in ladderContainer) Destroy(t.gameObject);

            int startDay = Mathf.Max(1, projectedStreak - visibleDays / 2);
            for (int i = 0; i < visibleDays; i++)
            {
                int day = startDay + i;
                var entry = _daily.Ladder.EntryForStreak(day);
                float mult = _daily.Ladder.StreakMultiplier(day);
                int amount = Mathf.RoundToInt(entry.amount * mult);

                var cell = Instantiate(dayCellPrefab, ladderContainer);
                var labels = cell.GetComponentsInChildren<TMP_Text>();
                if (labels.Length > 0) labels[0].text = $"Day {day}";
                if (labels.Length > 1) labels[1].text = $"{RewardLabel(entry.kind)} ×{amount}";

                // Highlight current claimable day.
                var highlight = cell.Find("Highlight");
                if (highlight != null) highlight.gameObject.SetActive(day == projectedStreak);
                var milestone = cell.Find("Milestone");
                if (milestone != null) milestone.gameObject.SetActive(entry.isMilestone);
            }
        }

        private static string RewardLabel(DailyRewardKind k) => k switch
        {
            DailyRewardKind.Credits => "Credits",
            DailyRewardKind.Materials => "Materials",
            DailyRewardKind.RmatShards => "RMAT",
            DailyRewardKind.WeaponCrate => "Crate",
            DailyRewardKind.LegacyPoints => "Legacy",
            _ => "?"
        };

        private async void OnClaimClicked()
        {
            var result = await _daily.ClaimAsync();
            if (!result.success) { if (statusText != null) statusText.text = result.reason; return; }
            // OnClaimed fires Refresh + burst.
        }

        private void OnClaimed(int streak, DailyRewardEntry entry)
        {
            if (statusText != null) statusText.text = $"Claimed! +{entry.amount} {RewardLabel(entry.kind)}";
            // Pop the claim button for feedback.
            if (ServiceLocator.TryGet<IUIAnimationService>(out var anim) && claimButton != null)
                anim.Pop(claimButton.transform, 1.2f, 0.25f);
            Refresh();
        }
    }
}

// Convenience: RectTransform.Find returns Transform; helper to keep view code terse.
namespace ZedIdler.UI
{
    internal static class RectTransformExt
    {
        public static Transform Find(this RectTransform rt, string childName) => rt.transform.Find(childName);
    }
}
