// Assets/Scripts/Data/MarketEvent.cs
using UnityEngine;

namespace ZedIdler.Data
{
    /// <summary>
    /// Designer-authored market event (RMAT Storm, Food Shortage, etc.) that
    /// multiplies prices for items matching a tag. Applied to active listings
    /// by <see cref="ZedIdler.Services.MarketplaceService"/>.
    /// </summary>
    /// <remarks>
    /// Create via: Right-click in Project → Create → ZedIdler → Market Event.
    /// Asset name convention: <c>ME_RmatStorm</c>, <c>ME_FoodShortage</c>.
    ///
    /// Event lifecycle is owned by the service: an event is triggered (manually
    /// or by spawner), runs for <see cref="durationHours"/>, then auto-clears.
    /// Multiple events can be active simultaneously; multipliers stack
    /// multiplicatively.
    /// </remarks>
    [CreateAssetMenu(menuName = "ZedIdler/Market Event", fileName = "ME_New", order = 80)]
    public sealed class MarketEvent : ScriptableObject
    {
        [Header("Identity")]
        [SerializeField] private string eventId;
        [SerializeField] private string displayName;
        [SerializeField, TextArea(1, 3)] private string description;

        [Header("Trigger Conditions")]
        [Tooltip("Items with at least one of these tags are affected.")]
        [SerializeField] private string[] affectedTags;

        [Header("Effects")]
        [Tooltip("Multiplier applied to price for affected items (1.4 = +40%).")]
        [SerializeField, Range(0.1f, 10f)] private float priceMultiplier = 1.0f;

        [Tooltip("Multiplier applied to spawn weight for affected items (1.5 = +50% more listings).")]
        [SerializeField, Range(0.1f, 10f)] private float supplyMultiplier = 1.0f;

        [Header("Lifecycle")]
        [Tooltip("Real-world hours the event remains active once triggered.")]
        [SerializeField, Range(0.5f, 72f)] private float durationHours = 6f;

        [Tooltip("Approximate hours between auto-triggers in production (0 = manual only).")]
        [SerializeField, Range(0f, 720f)] private float autoTriggerIntervalHours = 0f;

        public string   EventId          => eventId;
        public string   DisplayName      => displayName;
        public string   Description      => description;
        public string[] AffectedTags     => affectedTags ?? System.Array.Empty<string>();
        public float    PriceMultiplier  => priceMultiplier;
        public float    SupplyMultiplier => supplyMultiplier;
        public float    DurationHours    => durationHours;
        public float    AutoTriggerIntervalHours => autoTriggerIntervalHours;

        public bool MatchesItem(ItemDefinition item)
        {
            if (item == null || affectedTags == null) return false;
            for (int i = 0; i < affectedTags.Length; i++)
                if (item.HasTag(affectedTags[i])) return true;
            return false;
        }
    }
}
