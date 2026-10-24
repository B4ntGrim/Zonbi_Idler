// Assets/Scripts/Services/MarketplaceService.cs
using System;
using System.Collections.Generic;
using UnityEngine;
using ZedIdler.Data;

namespace ZedIdler.Services
{
    /// <summary>
    /// Persistent backend for the camp Marketplace. Stubbed P2P — every listing
    /// is an NPC seller that accepts the player's bid after a delay. Models:
    /// • Sliding-window auctions (late bids extend the timer).
    /// • Dynamic supply/demand keyed by item id.
    /// • <see cref="MarketEvent"/> price multipliers (RMAT Storm, Shortage, etc).
    /// • Faction reputation discounts via <see cref="IFactionReputationProvider"/>.
    /// • Background ticking with offline catch-up.
    /// </summary>
    /// <remarks>
    /// Sell flow (option B): item stays in inventory but is RESERVED on listing.
    /// When a buyer's bid is accepted, the reservation is consumed via
    /// <see cref="IInventoryService.Consume"/> and the player is credited.
    ///
    /// Boost items: consumed on every bid ATTEMPT (whether accepted or not).
    /// </remarks>
    [DisallowMultipleComponent]
    public sealed class MarketplaceService : MonoBehaviour, IMarketplaceService
    {
        [Header("Spawning")]
        [SerializeField, Range(1, 200)] private int initialListingCount = 20;
        [SerializeField, Range(0, 100)]  private int maxNpcListings = 60;
        [SerializeField, Range(30f, 3600f)] private float npcListingSpawnIntervalSec = 300f; // 5 real-min

        [Header("Auction")]
        [SerializeField, Range(0.5f, 48f)] private float baseListingDurationHours = 4f;
        [SerializeField, Range(0f, 120f)]  private float slidingWindowExtensionMinutes = 30f;
        [SerializeField, Range(1f, 300f)]  private float npcBidAcceptDelaySeconds = 10f;

        [Header("Demand")]
        [SerializeField, Range(0f, 50f)]   private float demandGainPerBuy = 5f;
        [SerializeField, Range(0f, 50f)]   private float demandDecayPerHour = 1f;
        [SerializeField, Range(0f, 100f)]  private float demandBaseline = 50f;

        [Header("Faction")]
        [Tooltip("Discount per reputation rank. 0.02 = -2% per rank.")]
        [SerializeField, Range(0f, 0.1f)] private float perRepRankDiscount = 0.02f;

        // ─── Services ─────────────────────────────────────────────────────────
        private IInventoryService _inventory;
        private IPlayerProfile _profile;
        private ICatalogService _catalog;
        private IFactionReputationProvider _factionRep;

        // ─── State ────────────────────────────────────────────────────────────
        private readonly List<MarketListing> _listings = new List<MarketListing>();
        private readonly Dictionary<string, float> _demandByItem = new Dictionary<string, float>();
        private readonly Dictionary<string, ActiveMarketEvent> _activeEvents = new Dictionary<string, ActiveMarketEvent>();
        private readonly List<PendingBid> _pendingBids = new List<PendingBid>();
        private float _spawnTimer;
        private System.Random _rng = new System.Random();
        private readonly PerformanceUtils.FixedIntervalTicker _tickGate = new PerformanceUtils.FixedIntervalTicker(0.25f);

        // ─── Public state ─────────────────────────────────────────────────────
        public IReadOnlyList<MarketListing> Listings => _listings;
        public IReadOnlyDictionary<string, ActiveMarketEvent> ActiveEvents => _activeEvents;

        // ─── Events ───────────────────────────────────────────────────────────
        public event Action<MarketListing> OnListingAdded;
        public event Action<MarketListing> OnListingExpired;
        public event Action<MarketListing> OnListingRemoved;
        public event Action<MarketListing, int> OnBidPlaced;       // (listing, bidAmount)
        public event Action<MarketListing, int> OnBidAccepted;     // → player credits received
        public event Action<MarketListing, string> OnBidRejected;
        public event Action<MarketListing, int> OnPlayerListingSold;
        public event Action<MarketEvent> OnMarketEventActivated;
        public event Action<string> OnMarketEventEnded;

        // ─── Lifecycle ────────────────────────────────────────────────────────
        private void Awake()
        {
            DontDestroyOnLoad(gameObject);
            ServiceLocator.Register<IMarketplaceService>(this);
        }

        private void OnDestroy() => ServiceLocator.Unregister<IMarketplaceService>();

        private void Start()
        {
            ServiceLocator.TryGet(out _inventory);
            ServiceLocator.TryGet(out _profile);
            ServiceLocator.TryGet(out _catalog);
            ServiceLocator.TryGet(out _factionRep);

            if (_listings.Count == 0) SpawnInitialListings();
        }

        private void Update()
        {
            // Fixed 0.25s tick gate — avoids per-frame work in Marketplace.
            if (_tickGate.Tick(Time.deltaTime)) Tick(_tickGate.Interval);
        }

        // ─── Public API ───────────────────────────────────────────────────────
        public bool PlaceBid(string listingId, int bidAmount, string boostItemId = null, int boostQuantity = 0)
        {
            var listing = FindListing(listingId);
            if (listing == null) { LogReject(null, "listing not found"); return false; }

            // Consume boost item on attempt (per spec).
            if (!string.IsNullOrEmpty(boostItemId) && boostQuantity > 0)
            {
                if (_inventory != null && !_inventory.Consume(boostItemId, boostQuantity))
                {
                    LogReject(listing, "boost item missing");
                    return false;
                }
            }

            int playerCredits = _profile?.GetCredits() ?? 0;
            if (bidAmount > playerCredits) { LogReject(listing, "insufficient credits"); return false; }
            if (bidAmount <= listing.currentBid) { LogReject(listing, "bid below current"); return false; }

            // Reserve credits by transferring to escrow (deduct now; refund on rejection).
            _profile?.SpendCredits(bidAmount);
            listing.currentBid = bidAmount;
            listing.highestBidderIsPlayer = true;

            // Sliding-window extension if bid placed in last 5 min of the auction.
            long now = DateTime.UtcNow.Ticks;
            if (listing.expiresUtcTicks - now < TimeSpan.FromMinutes(5).Ticks)
            {
                listing.expiresUtcTicks += TimeSpan.FromMinutes(slidingWindowExtensionMinutes).Ticks;
            }
            ReplaceListing(listing);
            OnBidPlaced?.Invoke(listing, bidAmount);

            // NPC seller accepts after delay.
            _pendingBids.Add(new PendingBid
            {
                listingId = listingId,
                bidAmount = bidAmount,
                acceptAtRealTime = Time.realtimeSinceStartup + npcBidAcceptDelaySeconds
            });
            return true;
        }

        public bool BuyNow(string listingId)
        {
            var listing = FindListing(listingId);
            if (listing == null) return false;
            return PlaceBid(listingId, Mathf.Max(listing.askingPrice, listing.currentBid + 1));
        }

        /// <summary>List a player-owned item. Item stays in inventory but is reserved.</summary>
        public string ListItem(string itemId, int quantity, int askingPrice)
        {
            if (string.IsNullOrEmpty(itemId) || quantity <= 0 || askingPrice <= 0) return null;
            if (_inventory == null || _inventory.GetQuantity(itemId) < quantity) return null;

            var listing = new MarketListing
            {
                listingId = Guid.NewGuid().ToString("N"),
                itemId = itemId,
                quantity = quantity,
                askingPrice = askingPrice,
                currentBid = 0,
                sellerIsPlayer = true,
                highestBidderIsPlayer = false,
                createdUtcTicks = DateTime.UtcNow.Ticks,
                expiresUtcTicks = DateTime.UtcNow.Add(TimeSpan.FromHours(baseListingDurationHours)).Ticks
            };
            _listings.Add(listing);
            OnListingAdded?.Invoke(listing);
            return listing.listingId;
        }

        public bool CancelListing(string listingId)
        {
            int idx = _listings.FindIndex(l => l.listingId == listingId);
            if (idx < 0) return false;
            var l = _listings[idx];
            // Refund any in-flight bid (player or NPC bidder side).
            if (l.currentBid > 0 && l.highestBidderIsPlayer) _profile?.AddCredits(l.currentBid);
            _listings.RemoveAt(idx);
            OnListingRemoved?.Invoke(l);
            return true;
        }

        /// <summary>Get current effective price for an item id (base × demand × events × rep discount).</summary>
        public int GetEffectivePrice(string itemId, bool isPlayerBuying = true)
        {
            var item = _catalog?.GetItem(itemId);
            if (item == null) return 0;
            float demandMult = GetDemandMultiplier(itemId);
            float eventMult = GetEventMultiplier(item);
            float repMult = isPlayerBuying ? (1f - GetFactionDiscount()) : 1f;
            return Mathf.Max(1, Mathf.RoundToInt(item.BasePrice * demandMult * eventMult * repMult));
        }

        // ─── Market events ────────────────────────────────────────────────────
        public void ActivateMarketEvent(MarketEvent evt)
        {
            if (evt == null) return;
            _activeEvents[evt.EventId] = new ActiveMarketEvent
            {
                evt = evt,
                expiresUtcTicks = DateTime.UtcNow.Add(TimeSpan.FromHours(evt.DurationHours)).Ticks
            };
            OnMarketEventActivated?.Invoke(evt);
        }

        public bool ClearMarketEvent(string eventId)
        {
            if (!_activeEvents.Remove(eventId)) return false;
            OnMarketEventEnded?.Invoke(eventId);
            return true;
        }

        // ─── Ticking & offline ────────────────────────────────────────────────
        public void Tick(float deltaSeconds)
        {
            if (deltaSeconds <= 0) return;

            // Spawn timer.
            _spawnTimer += deltaSeconds;
            if (_spawnTimer >= npcListingSpawnIntervalSec)
            {
                _spawnTimer = 0f;
                TrySpawnNpcListing();
            }

            // Resolve pending NPC accepts.
            for (int i = _pendingBids.Count - 1; i >= 0; i--)
            {
                if (Time.realtimeSinceStartup >= _pendingBids[i].acceptAtRealTime)
                {
                    ResolvePendingBid(_pendingBids[i]);
                    _pendingBids.RemoveAt(i);
                }
            }

            // Expire listings + events.
            long nowTicks = DateTime.UtcNow.Ticks;
            for (int i = _listings.Count - 1; i >= 0; i--)
            {
                if (_listings[i].expiresUtcTicks <= nowTicks) ExpireListing(i);
            }
            var toClear = new List<string>();
            foreach (var kv in _activeEvents)
                if (kv.Value.expiresUtcTicks <= nowTicks) toClear.Add(kv.Key);
            for (int i = 0; i < toClear.Count; i++) ClearMarketEvent(toClear[i]);

            // Demand decay (per real second).
            DecayDemand(deltaSeconds);
        }

        public void ApplyOfflineProgress(TimeSpan elapsed)
        {
            float s = Mathf.Max(0f, (float)elapsed.TotalSeconds);
            int spawns = Mathf.FloorToInt(s / npcListingSpawnIntervalSec);
            for (int i = 0; i < spawns; i++) TrySpawnNpcListing();

            long nowTicks = DateTime.UtcNow.Ticks;
            for (int i = _listings.Count - 1; i >= 0; i--)
                if (_listings[i].expiresUtcTicks <= nowTicks) ExpireListing(i);

            // Demand decays.
            DecayDemand(s);
        }

        // ─── Internals ────────────────────────────────────────────────────────
        private MarketListing FindListing(string id) =>
            _listings.Find(l => l.listingId == id);

        private void ReplaceListing(MarketListing updated)
        {
            int idx = _listings.FindIndex(l => l.listingId == updated.listingId);
            if (idx >= 0) _listings[idx] = updated;
        }

        private void ResolvePendingBid(PendingBid pb)
        {
            var listing = FindListing(pb.listingId);
            if (listing == null) { _profile?.AddCredits(pb.bidAmount); return; } // listing gone — refund

            // NPC always accepts (player bid > 0 means escrowed credits exist).
            if (listing.sellerIsPlayer)
            {
                // Another NPC bought from the player — credit player + consume the reserved item.
                _inventory?.Consume(listing.itemId, listing.quantity);
                _profile?.AddCredits(pb.bidAmount);
                OnPlayerListingSold?.Invoke(listing, pb.bidAmount);
            }
            else
            {
                // Player bought from NPC — give the item to player. Credits already escrowed.
                _inventory?.AddDrop(new LootDrop
                {
                    itemId = listing.itemId, quantity = listing.quantity, rarity = LootRarity.Common
                });
                // Bump demand for this item — player just expressed interest.
                BumpDemand(listing.itemId, ZedIdler.Services.BalanceRuntime.DemandGainPerBuy);
            }
            OnBidAccepted?.Invoke(listing, pb.bidAmount);
            ZedIdler.Services.ServiceLocator.Get<ZedIdler.Services.Analytics.IAnalyticsService>()
                ?.Economy(listing.sellerIsPlayer ? "item_sold" : "item_bought",
                    new System.Collections.Generic.Dictionary<string, object>
                    {
                        { "item", listing.itemId }, { "qty", listing.quantity }, { "price", pb.bidAmount }
                    });
            int idx = _listings.FindIndex(l => l.listingId == listing.listingId);
            if (idx >= 0) _listings.RemoveAt(idx);
        }

        private void ExpireListing(int index)
        {
            var l = _listings[index];
            // Refund player escrow if they were highest bidder.
            if (l.currentBid > 0 && l.highestBidderIsPlayer) _profile?.AddCredits(l.currentBid);
            _listings.RemoveAt(index);
            OnListingExpired?.Invoke(l);
        }

        private void SpawnInitialListings()
        {
            for (int i = 0; i < initialListingCount; i++) TrySpawnNpcListing();
        }

        private void TrySpawnNpcListing()
        {
            if (_listings.Count >= maxNpcListings) return;
            if (_catalog == null) return;
            var allItems = _catalog.GetAllItems();
            if (allItems == null) return;

            // Pick a random tradable item.
            ItemDefinition pick = null;
            int attempts = 0;
            while (pick == null && attempts < 8)
            {
                var idx = _rng.Next(0, allItems.Count);
                if (allItems[idx].Tradable) pick = allItems[idx];
                attempts++;
            }
            if (pick == null) return;

            int qty = Mathf.Max(1, _rng.Next(1, 4 + pick.Tier));
            int price = GetEffectivePrice(pick.ItemId, isPlayerBuying: true) * qty;

            var listing = new MarketListing
            {
                listingId = Guid.NewGuid().ToString("N"),
                itemId = pick.ItemId,
                quantity = qty,
                askingPrice = Mathf.Max(1, price),
                currentBid = 0,
                sellerIsPlayer = false,
                highestBidderIsPlayer = false,
                createdUtcTicks = DateTime.UtcNow.Ticks,
                expiresUtcTicks = DateTime.UtcNow.Add(TimeSpan.FromHours(baseListingDurationHours)).Ticks
            };
            _listings.Add(listing);
            OnListingAdded?.Invoke(listing);
        }

        private void BumpDemand(string itemId, float amount)
        {
            if (!_demandByItem.TryGetValue(itemId, out var d)) d = ZedIdler.Services.BalanceRuntime.DemandBaseline;
            _demandByItem[itemId] = Mathf.Clamp(d + amount, 0f, 100f);
        }

        private void DecayDemand(float seconds)
        {
            float decay = demandDecayPerHour * (seconds / 3600f);
            if (decay <= 0) return;
            var keys = new List<string>(_demandByItem.Keys);
            for (int i = 0; i < keys.Count; i++)
            {
                var k = keys[i];
                float d = _demandByItem[k];
                d = Mathf.MoveTowards(d, ZedIdler.Services.BalanceRuntime.DemandBaseline, decay);
                if (Mathf.Approximately(d, ZedIdler.Services.BalanceRuntime.DemandBaseline)) _demandByItem.Remove(k);
                else _demandByItem[k] = d;
            }
        }

        private float GetDemandMultiplier(string itemId)
        {
            if (!_demandByItem.TryGetValue(itemId, out var d)) d = ZedIdler.Services.BalanceRuntime.DemandBaseline;
            // Map demand 0..100 to price multiplier 0.5..1.5
            return 0.5f + (d / 100f);
        }

        private float GetEventMultiplier(ItemDefinition item)
        {
            float mult = 1f;
            foreach (var kv in _activeEvents)
            {
                if (kv.Value.evt.MatchesItem(item)) mult *= kv.Value.evt.PriceMultiplier;
            }
            return mult;
        }

        private float GetFactionDiscount()
        {
            if (_factionRep == null) return 0f;
            int rank = _factionRep.GetAlignedFactionRank();
            return Mathf.Clamp(rank * ZedIdler.Services.BalanceRuntime.FactionDiscountPerRank, 0f, 0.5f);
        }

        private void LogReject(MarketListing l, string reason)
        {
            OnBidRejected?.Invoke(l ?? default, reason);
        }

        // ─── Snapshot ─────────────────────────────────────────────────────────
        [Serializable]
        public struct Snapshot
        {
            public MarketListing[] listings;
            public DemandEntry[] demand;
            public ActiveEventEntry[] events;
        }

        [Serializable] public struct DemandEntry { public string itemId; public float demand; }
        [Serializable] public struct ActiveEventEntry { public string eventId; public long expiresUtcTicks; }

        public Snapshot CreateSnapshot()
        {
            var dem = new DemandEntry[_demandByItem.Count];
            int i = 0; foreach (var kv in _demandByItem) dem[i++] = new DemandEntry { itemId = kv.Key, demand = kv.Value };

            var evs = new ActiveEventEntry[_activeEvents.Count];
            i = 0; foreach (var kv in _activeEvents) evs[i++] = new ActiveEventEntry { eventId = kv.Key, expiresUtcTicks = kv.Value.expiresUtcTicks };

            return new Snapshot { listings = _listings.ToArray(), demand = dem, events = evs };
        }

        public void Restore(Snapshot s)
        {
            _listings.Clear();
            _demandByItem.Clear();
            _activeEvents.Clear();
            if (s.listings != null) _listings.AddRange(s.listings);
            if (s.demand != null)   foreach (var d in s.demand) _demandByItem[d.itemId] = d.demand;
            // Events need re-binding to the SO catalog on load — handled by host.
        }
    }

    public interface IMarketplaceService
    {
        IReadOnlyList<MarketListing> Listings { get; }
        IReadOnlyDictionary<string, ActiveMarketEvent> ActiveEvents { get; }

        event Action<MarketListing> OnListingAdded;
        event Action<MarketListing> OnListingExpired;
        event Action<MarketListing> OnListingRemoved;
        event Action<MarketListing, int> OnBidPlaced;
        event Action<MarketListing, int> OnBidAccepted;
        event Action<MarketListing, string> OnBidRejected;
        event Action<MarketListing, int> OnPlayerListingSold;
        event Action<MarketEvent> OnMarketEventActivated;
        event Action<string> OnMarketEventEnded;

        bool PlaceBid(string listingId, int bidAmount, string boostItemId = null, int boostQuantity = 0);
        bool BuyNow(string listingId);
        string ListItem(string itemId, int quantity, int askingPrice);
        bool CancelListing(string listingId);
        int  GetEffectivePrice(string itemId, bool isPlayerBuying = true);

        void ActivateMarketEvent(MarketEvent evt);
        bool ClearMarketEvent(string eventId);

        void Tick(float deltaSeconds);
        void ApplyOfflineProgress(TimeSpan elapsed);
        MarketplaceService.Snapshot CreateSnapshot();
        void Restore(MarketplaceService.Snapshot s);
    }

    /// <summary>Faction rep adapter — stubbed contract; Phase 3 faction system implements it.</summary>
    public interface IFactionReputationProvider
    {
        /// <summary>0–N rank with the player's aligned faction; higher = better discount.</summary>
        int GetAlignedFactionRank();
    }

    /// <summary>Catalog extension — ICatalogService implements GetItem / GetAllItems.</summary>
    public static class CatalogItemExtensions
    {
        public static ItemDefinition GetItem(this ICatalogService _, string itemId)
        {
            if (_ is IItemCatalogProvider p) return p.GetItem(itemId);
            return null;
        }
        public static IReadOnlyList<ItemDefinition> GetAllItems(this ICatalogService _)
        {
            if (_ is IItemCatalogProvider p) return p.GetAllItems();
            return null;
        }
    }

    public interface IItemCatalogProvider
    {
        ItemDefinition GetItem(string itemId);
        IReadOnlyList<ItemDefinition> GetAllItems();
    }

    // ─── Data shapes ─────────────────────────────────────────────────────────
    [Serializable]
    public struct MarketListing
    {
        public string listingId;
        public string itemId;
        public int quantity;
        public int askingPrice;
        public int currentBid;
        public bool sellerIsPlayer;
        public bool highestBidderIsPlayer;
        public long createdUtcTicks;
        public long expiresUtcTicks;
    }

    [Serializable]
    public struct ActiveMarketEvent
    {
        public MarketEvent evt;
        public long expiresUtcTicks;
    }

    internal struct PendingBid
    {
        public string listingId;
        public int bidAmount;
        public float acceptAtRealTime;
    }
}
