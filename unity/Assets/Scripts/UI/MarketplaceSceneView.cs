// Assets/Scripts/UI/MarketplaceSceneView.cs
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
    /// Designer-wired Canvas binder for the Marketplace tab. Three-column layout:
    /// left = browse/auction/sell tabs + listing list, middle = item detail panel
    /// (inline) + art, right = enhanced bidding panel + seller info.
    /// </summary>
    /// <remarks>
    /// Subscribes to <see cref="IMarketplaceService"/> and <see cref="IPlayerProfile"/>
    /// events. Rebuilds the listing list on every change; bidding panel updates
    /// when the player selects a listing.
    /// </remarks>
    [DisallowMultipleComponent]
    public sealed class MarketplaceSceneView : MonoBehaviour
    {
        public enum Tab { Browse = 0, Auction = 1, Sell = 2, History = 3 }

        [Header("Locked Overlay (camp level gate)")]
        [SerializeField] private GameObject lockedOverlay;
        [SerializeField] private TMP_Text   lockedMessage;

        [Header("Header / Credits HUD")]
        [SerializeField] private TMP_Text creditsText;
        [SerializeField] private MarketEventBannerView eventBanner;

        [Header("Tabs")]
        [SerializeField] private Toggle browseTab;
        [SerializeField] private Toggle auctionTab;
        [SerializeField] private Toggle sellTab;
        [SerializeField] private Toggle historyTab;

        [Header("Browse / Auction List")]
        [SerializeField] private RectTransform listContainer;
        [SerializeField] private MarketListingCellView cellPrefab;
        [SerializeField] private TMP_InputField searchInput;
        [SerializeField] private TMP_Dropdown sortDropdown;     // 0 Price asc, 1 Price desc, 2 Tier, 3 Name
        [SerializeField] private TMP_Dropdown categoryFilter;   // 0 All + ItemCategory enums
        [SerializeField] private TMP_Text emptyListText;

        [Header("Detail Panel (middle column, inline)")]
        [SerializeField] private GameObject detailPanel;
        [SerializeField] private Image    detailIcon;
        [SerializeField] private TMP_Text detailName;
        [SerializeField] private TMP_Text detailCategory;
        [SerializeField] private TMP_Text detailRarity;
        [SerializeField] private TMP_Text detailDescription;
        [SerializeField] private TMP_Text detailBasePrice;
        [SerializeField] private TMP_Text detailWeight;

        [Header("Bidding Panel (right column)")]
        [SerializeField] private GameObject biddingPanel;
        [SerializeField] private TMP_Text   currentBidText;
        [SerializeField] private TMP_InputField bidAmountInput;
        [SerializeField] private Slider     quantitySlider;       // Buy partial qty (for browse)
        [SerializeField] private TMP_Text   quantityText;
        [SerializeField] private TMP_Dropdown boostItemDropdown;  // Player-owned rare items
        [SerializeField] private Button     placeBidButton;
        [SerializeField] private Button     buyNowButton;

        [Header("Sell Form")]
        [SerializeField] private GameObject sellPanel;
        [SerializeField] private TMP_Dropdown sellItemDropdown;
        [SerializeField] private Slider     sellQuantitySlider;
        [SerializeField] private TMP_Text   sellQuantityText;
        [SerializeField] private TMP_InputField sellPriceInput;
        [SerializeField] private TMP_Text   sellPricePreview;     // GetEffectivePrice hint
        [SerializeField] private Button     listItemButton;

        [Header("Toasts")]
        [SerializeField] private TMP_Text   statusToast;
        [SerializeField] private float      toastDurationSec = 3f;

        // ─── Runtime state ────────────────────────────────────────────────────
        private IMarketplaceService _market;
        private IInventoryService   _inventory;
        private IPlayerProfile      _profile;
        private ICatalogService     _catalog;
        private IUnlockService      _unlocks;

        private readonly List<MarketListingCellView> _cells = new List<MarketListingCellView>();
        private MarketListingCellView _selected;
        private Tab _activeTab = Tab.Browse;
        private float _toastUntil;

        // ─── Lifecycle ────────────────────────────────────────────────────────
        private void OnEnable()
        {
            ServiceLocator.TryGet(out _market);
            ServiceLocator.TryGet(out _inventory);
            ServiceLocator.TryGet(out _profile);
            ServiceLocator.TryGet(out _catalog);
            ServiceLocator.TryGet(out _unlocks);
            if (_market == null || _catalog == null) { enabled = false; return; }

            _market.OnListingAdded        += HandleListingChanged;
            _market.OnListingRemoved      += HandleListingChanged;
            _market.OnListingExpired      += HandleListingChanged;
            _market.OnBidAccepted         += HandleBidAccepted;
            _market.OnBidPlaced           += HandleBidPlaced;
            _market.OnBidRejected         += HandleBidRejected;
            _market.OnPlayerListingSold   += HandlePlayerListingSold;
            if (_profile != null) _profile.OnCreditsChanged += HandleCreditsChanged;

            HookUI();
            RefreshLockState();
            RefreshCredits();
            BuildSortAndFilterDropdowns();
            BuildSellDropdown();
            BuildBoostDropdown();
            SwitchTab(Tab.Browse);
        }

        private void OnDisable()
        {
            if (_market != null)
            {
                _market.OnListingAdded      -= HandleListingChanged;
                _market.OnListingRemoved    -= HandleListingChanged;
                _market.OnListingExpired    -= HandleListingChanged;
                _market.OnBidAccepted       -= HandleBidAccepted;
                _market.OnBidPlaced         -= HandleBidPlaced;
                _market.OnBidRejected       -= HandleBidRejected;
                _market.OnPlayerListingSold -= HandlePlayerListingSold;
            }
            if (_profile != null) _profile.OnCreditsChanged -= HandleCreditsChanged;
        }

        private void Update()
        {
            // Tick cell timers + hide toast.
            for (int i = 0; i < _cells.Count; i++)
                if (_cells[i] != null) _cells[i].RefreshTimer();
            if (_toastUntil > 0 && Time.realtimeSinceStartup >= _toastUntil)
            {
                if (statusToast != null) statusToast.gameObject.SetActive(false);
                _toastUntil = 0;
            }
        }

        private void HookUI()
        {
            if (browseTab != null)   browseTab.onValueChanged.AddListener(v => { if (v) SwitchTab(Tab.Browse); });
            if (auctionTab != null)  auctionTab.onValueChanged.AddListener(v => { if (v) SwitchTab(Tab.Auction); });
            if (sellTab != null)     sellTab.onValueChanged.AddListener(v => { if (v) SwitchTab(Tab.Sell); });
            if (historyTab != null)  historyTab.onValueChanged.AddListener(v => { if (v) SwitchTab(Tab.History); });
            if (placeBidButton != null) placeBidButton.onClick.AddListener(OnPlaceBidClicked);
            if (buyNowButton != null)   buyNowButton.onClick.AddListener(OnBuyNowClicked);
            if (listItemButton != null) listItemButton.onClick.AddListener(OnListItemClicked);
            if (sortDropdown != null)     sortDropdown.onValueChanged.AddListener(_ => RebuildList());
            if (categoryFilter != null)   categoryFilter.onValueChanged.AddListener(_ => RebuildList());
            if (searchInput != null)      searchInput.onValueChanged.AddListener(_ => RebuildList());
            if (quantitySlider != null)   quantitySlider.onValueChanged.AddListener(v => { if (quantityText != null) quantityText.text = $"×{(int)v}"; });
            if (sellQuantitySlider != null) sellQuantitySlider.onValueChanged.AddListener(v => {
                if (sellQuantityText != null) sellQuantityText.text = $"×{(int)v}";
                RefreshSellPricePreview();
            });
            if (sellItemDropdown != null) sellItemDropdown.onValueChanged.AddListener(_ => RefreshSellPricePreview());
        }

        private void RefreshLockState()
        {
            bool unlocked = _unlocks?.IsUnlocked("marketplace") ?? true;
            if (lockedOverlay != null) lockedOverlay.SetActive(!unlocked);
            if (!unlocked && lockedMessage != null)
            {
                int needed = _unlocks?.GetRequiredLevel("marketplace") ?? 1;
                lockedMessage.text = $"Requires Camp Level {needed}";
            }
        }

        private void RefreshCredits()
        {
            if (creditsText != null) creditsText.text = $"{_profile?.GetCredits() ?? 0} cr";
        }

        // ─── Tabs ─────────────────────────────────────────────────────────────
        private void SwitchTab(Tab tab)
        {
            _activeTab = tab;
            if (listContainer != null) listContainer.gameObject.SetActive(tab == Tab.Browse || tab == Tab.Auction || tab == Tab.History);
            if (sellPanel    != null) sellPanel.SetActive(tab == Tab.Sell);
            if (detailPanel  != null) detailPanel.SetActive(tab != Tab.Sell && _selected != null);
            if (biddingPanel != null) biddingPanel.SetActive((tab == Tab.Browse || tab == Tab.Auction) && _selected != null);
            RebuildList();
        }

        // ─── List building ────────────────────────────────────────────────────
        private void RebuildList()
        {
            if (listContainer == null || cellPrefab == null || _market == null) return;
            foreach (Transform t in listContainer) Destroy(t.gameObject);
            _cells.Clear();
            _selected = null;

            var listings = _market.Listings;
            var filtered = new List<MarketListing>();
            string search = searchInput != null ? searchInput.text.ToLowerInvariant() : "";
            int catFilter = categoryFilter != null ? categoryFilter.value : 0;

            for (int i = 0; i < listings.Count; i++)
            {
                var l = listings[i];
                // Tab filter
                if (_activeTab == Tab.Auction && l.currentBid <= 0) continue;
                if (_activeTab == Tab.Browse && l.sellerIsPlayer) continue;
                if (_activeTab == Tab.History && l.expiresUtcTicks > DateTime.UtcNow.Ticks) continue;

                var item = _catalog.GetItem(l.itemId);
                // Category filter (0 = All)
                if (catFilter > 0 && item != null && (int)item.Category != catFilter - 1) continue;
                // Search
                if (!string.IsNullOrEmpty(search))
                {
                    string nameLc = (item?.DisplayName ?? l.itemId).ToLowerInvariant();
                    if (!nameLc.Contains(search)) continue;
                }
                filtered.Add(l);
            }

            // Sort
            int sort = sortDropdown != null ? sortDropdown.value : 0;
            switch (sort)
            {
                case 0: filtered.Sort((a, b) => a.askingPrice.CompareTo(b.askingPrice)); break;
                case 1: filtered.Sort((a, b) => b.askingPrice.CompareTo(a.askingPrice)); break;
                case 2: filtered.Sort((a, b) => (_catalog.GetItem(b.itemId)?.Tier ?? 0).CompareTo(_catalog.GetItem(a.itemId)?.Tier ?? 0)); break;
                case 3: filtered.Sort((a, b) => string.Compare(_catalog.GetItem(a.itemId)?.DisplayName ?? a.itemId,
                                                               _catalog.GetItem(b.itemId)?.DisplayName ?? b.itemId, StringComparison.OrdinalIgnoreCase)); break;
            }

            for (int i = 0; i < filtered.Count; i++)
            {
                var view = Instantiate(cellPrefab, listContainer);
                view.Bind(filtered[i], _catalog.GetItem(filtered[i].itemId), _activeTab == Tab.Auction);
                view.OnClicked += HandleCellClicked;
                _cells.Add(view);
            }
            if (emptyListText != null) emptyListText.gameObject.SetActive(filtered.Count == 0);
        }

        // ─── Detail + bid panel ───────────────────────────────────────────────
        private void HandleCellClicked(MarketListingCellView cell)
        {
            if (_selected != null) _selected.SetSelected(false);
            _selected = cell;
            cell.SetSelected(true);
            RefreshDetail(cell);
            RefreshBidPanel(cell);
        }

        private void RefreshDetail(MarketListingCellView cell)
        {
            if (detailPanel == null) return;
            var item = cell?.Item;
            detailPanel.SetActive(true);
            if (item != null)
            {
                if (detailIcon != null)        { detailIcon.sprite = item.Icon; detailIcon.enabled = item.Icon != null; }
                if (detailName != null)        detailName.text = item.DisplayName;
                if (detailCategory != null)    detailCategory.text = item.Category.ToString();
                if (detailRarity != null)      detailRarity.text = item.BaseRarity.ToString();
                if (detailDescription != null) detailDescription.text = item.Description;
                if (detailBasePrice != null)   detailBasePrice.text = $"Base: {item.BasePrice} cr";
                if (detailWeight != null)      detailWeight.text = $"Weight: {item.WeightKg:F1} kg";
            }
        }

        private void RefreshBidPanel(MarketListingCellView cell)
        {
            if (biddingPanel == null) return;
            biddingPanel.SetActive(true);
            if (currentBidText != null)
            {
                int current = cell.Listing.currentBid > 0 ? cell.Listing.currentBid : cell.Listing.askingPrice;
                currentBidText.text = $"Current: {current} cr";
            }
            if (quantitySlider != null)
            {
                quantitySlider.maxValue = cell.Listing.quantity;
                quantitySlider.minValue = 1;
                quantitySlider.value    = cell.Listing.quantity;
                if (quantityText != null) quantityText.text = $"×{cell.Listing.quantity}";
            }
        }

        // ─── Buttons ──────────────────────────────────────────────────────────
        private void OnPlaceBidClicked()
        {
            if (_selected == null) return;
            if (!int.TryParse(bidAmountInput?.text, out var amt) || amt <= 0) { Toast("Enter a valid bid", true); return; }
            string boostId = SelectedBoostItemId();
            int boostQty = string.IsNullOrEmpty(boostId) ? 0 : 1;
            bool ok = _market.PlaceBid(_selected.Listing.listingId, amt, boostId, boostQty);
            if (ok) Toast($"Bid placed: {amt} cr", false);
        }

        private void OnBuyNowClicked()
        {
            if (_selected == null) return;
            bool ok = _market.BuyNow(_selected.Listing.listingId);
            if (ok) Toast("Purchase initiated. Awaiting seller…", false);
        }

        private void OnListItemClicked()
        {
            string itemId = SelectedSellItemId();
            if (string.IsNullOrEmpty(itemId)) { Toast("Pick an item to list", true); return; }
            int qty = sellQuantitySlider != null ? (int)sellQuantitySlider.value : 1;
            if (!int.TryParse(sellPriceInput?.text, out var price) || price <= 0) { Toast("Enter a valid price", true); return; }
            string id = _market.ListItem(itemId, qty, price);
            if (!string.IsNullOrEmpty(id)) Toast($"Listed {qty}× {itemId} for {price} cr", false);
            else Toast("Listing rejected (no inventory?)", true);
        }

        // ─── Dropdown construction ────────────────────────────────────────────
        private void BuildSortAndFilterDropdowns()
        {
            if (sortDropdown != null)
            {
                sortDropdown.ClearOptions();
                sortDropdown.AddOptions(new List<string> { "Price ↑", "Price ↓", "Tier", "Name" });
            }
            if (categoryFilter != null)
            {
                var opts = new List<string> { "All" };
                foreach (var c in Enum.GetNames(typeof(ItemCategory))) opts.Add(c);
                categoryFilter.ClearOptions();
                categoryFilter.AddOptions(opts);
            }
        }

        private void BuildSellDropdown()
        {
            if (sellItemDropdown == null || _inventory == null) return;
            sellItemDropdown.ClearOptions();
            var opts = new List<TMP_Dropdown.OptionData>();
            foreach (var kv in _inventory.Stacks)
            {
                var item = _catalog.GetItem(kv.Key);
                if (item == null || !item.Tradable) continue;
                opts.Add(new TMP_Dropdown.OptionData($"{item.DisplayName} (×{kv.Value.quantity})"));
            }
            sellItemDropdown.AddOptions(opts);
            if (sellQuantitySlider != null) { sellQuantitySlider.minValue = 1; sellQuantitySlider.value = 1; }
            RefreshSellPricePreview();
        }

        private void BuildBoostDropdown()
        {
            if (boostItemDropdown == null || _inventory == null) return;
            boostItemDropdown.ClearOptions();
            var opts = new List<TMP_Dropdown.OptionData> { new TMP_Dropdown.OptionData("None") };
            foreach (var kv in _inventory.Stacks)
            {
                var item = _catalog.GetItem(kv.Key);
                if (item == null) continue;
                if ((int)item.BaseRarity < (int)LootRarity.Rare) continue;
                opts.Add(new TMP_Dropdown.OptionData($"{item.DisplayName} (×{kv.Value.quantity})"));
            }
            boostItemDropdown.AddOptions(opts);
        }

        private void RefreshSellPricePreview()
        {
            if (sellPricePreview == null) return;
            string id = SelectedSellItemId();
            if (string.IsNullOrEmpty(id)) { sellPricePreview.text = "—"; return; }
            int eff = _market.GetEffectivePrice(id, isPlayerBuying: false);
            int qty = sellQuantitySlider != null ? (int)sellQuantitySlider.value : 1;
            sellPricePreview.text = $"Est. market: {eff * qty} cr ({eff} ea.)";
        }

        private string SelectedSellItemId()
        {
            if (sellItemDropdown == null || _inventory == null) return null;
            int idx = sellItemDropdown.value;
            int i = 0;
            foreach (var kv in _inventory.Stacks)
            {
                var item = _catalog.GetItem(kv.Key);
                if (item == null || !item.Tradable) continue;
                if (i == idx) return item.ItemId;
                i++;
            }
            return null;
        }

        private string SelectedBoostItemId()
        {
            if (boostItemDropdown == null || boostItemDropdown.value == 0) return null;
            int idx = boostItemDropdown.value - 1; // -1 because option 0 is "None"
            int i = 0;
            foreach (var kv in _inventory.Stacks)
            {
                var item = _catalog.GetItem(kv.Key);
                if (item == null || (int)item.BaseRarity < (int)LootRarity.Rare) continue;
                if (i == idx) return item.ItemId;
                i++;
            }
            return null;
        }

        // ─── Event handlers ───────────────────────────────────────────────────
        private void HandleListingChanged(MarketListing _) => RebuildList();

        private void HandleBidPlaced(MarketListing l, int amt)
        {
            if (!l.highestBidderIsPlayer) Toast($"You were outbid on {l.itemId} — {amt} cr", true);
        }

        private void HandleBidAccepted(MarketListing l, int amt)
        {
            Toast($"✓ Transaction complete: {l.itemId} ({amt} cr)", false);
            BuildBoostDropdown(); BuildSellDropdown();
        }

        private void HandleBidRejected(MarketListing _, string reason) => Toast($"Bid rejected: {reason}", true);
        private void HandlePlayerListingSold(MarketListing l, int amt) => Toast($"✓ Sold: {l.itemId} for {amt} cr", false);
        private void HandleCreditsChanged(int _, int newAmt) => RefreshCredits();

        private void Toast(string message, bool isError)
        {
            if (statusToast == null) return;
            statusToast.gameObject.SetActive(true);
            statusToast.text = message;
            statusToast.color = isError ? new Color(0.9f, 0.45f, 0.3f) : new Color(0.6f, 0.85f, 0.6f);
            _toastUntil = Time.realtimeSinceStartup + toastDurationSec;
        }
    }
}
