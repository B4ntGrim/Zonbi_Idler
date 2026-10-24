// Assets/Scripts/UI/MarketListingCellView.cs
using System;
using TMPro;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;
using ZedIdler.Data;
using ZedIdler.Services;

namespace ZedIdler.UI
{
    /// <summary>
    /// One row prefab in the marketplace browse / auction list.
    /// </summary>
    /// <remarks>
    /// Designer-wired slots. The view layer binds a <see cref="MarketListing"/>
    /// snapshot at construction time and refreshes on tick.
    /// </remarks>
    [DisallowMultipleComponent]
    public sealed class MarketListingCellView : MonoBehaviour, IPointerClickHandler, IPointerEnterHandler, IPointerExitHandler
    {
        [Header("Slots")]
        [SerializeField] private Image iconImage;
        [SerializeField] private TMP_Text nameText;
        [SerializeField] private TMP_Text quantityText;
        [SerializeField] private TMP_Text tierText;
        [SerializeField] private TMP_Text priceText;
        [SerializeField] private TMP_Text timerText;
        [SerializeField] private Image    selectionOutline;
        [SerializeField] private Image    expiringWarning; // red border in last 5 min

        public MarketListing Listing { get; private set; }
        public ItemDefinition Item { get; private set; }
        public bool IsAuctionView { get; private set; }

        public event Action<MarketListingCellView> OnClicked;
        public event Action<MarketListingCellView> OnHovered;
        public event Action<MarketListingCellView> OnUnhovered;

        public void Bind(MarketListing listing, ItemDefinition item, bool isAuctionView)
        {
            Listing = listing;
            Item = item;
            IsAuctionView = isAuctionView;

            if (item != null)
            {
                if (iconImage  != null) { iconImage.sprite = item.Icon; iconImage.enabled = item.Icon != null; }
                if (nameText   != null) nameText.text = item.DisplayName;
                if (tierText   != null) tierText.text = $"T{item.Tier}";
            }
            else
            {
                if (nameText != null) nameText.text = listing.itemId;
            }
            if (quantityText != null) quantityText.text = $"×{listing.quantity}";
            if (priceText    != null)
            {
                int displayPrice = listing.currentBid > 0 ? listing.currentBid : listing.askingPrice;
                priceText.text = $"{displayPrice} cr";
            }
            SetSelected(false);
            RefreshTimer();

            if (ZedIdler.Services.ServiceLocator.TryGet<ZedIdler.Services.IUIAnimationService>(out var anim))
                anim.Pop(transform);
        }

        public void SetSelected(bool selected)
        {
            if (selectionOutline != null) selectionOutline.gameObject.SetActive(selected);
        }

        public void RefreshTimer()
        {
            if (timerText == null) return;
            long now = DateTime.UtcNow.Ticks;
            long delta = Listing.expiresUtcTicks - now;
            if (delta <= 0) { timerText.text = "EXPIRED"; return; }
            var span = TimeSpan.FromTicks(delta);
            timerText.text = span.TotalHours >= 1
                ? $"{(int)span.TotalHours}h {span.Minutes}m"
                : $"{span.Minutes}m {span.Seconds}s";

            // Sliding-window warning when < 5 minutes remain.
            bool isExpiring = span.TotalMinutes < 5;
            if (expiringWarning != null)
            {
                bool wasActive = expiringWarning.gameObject.activeSelf;
                expiringWarning.gameObject.SetActive(isExpiring);
                if (isExpiring && !wasActive
                    && ZedIdler.Services.ServiceLocator.TryGet<ZedIdler.Services.IUIAnimationService>(out var anim))
                {
                    anim.OutlinePulse(expiringWarning, new Color(0.9f, 0.3f, 0.2f, 1f), new Color(1f, 0.55f, 0.4f, 1f), 0.9f);
                }
            }
        }

        public void OnPointerClick(PointerEventData _) => OnClicked?.Invoke(this);
        public void OnPointerEnter(PointerEventData _) => OnHovered?.Invoke(this);
        public void OnPointerExit(PointerEventData _)  => OnUnhovered?.Invoke(this);
    }
}
