// Assets/Scripts/Services/SystemContracts.cs
using System;
using ZedIdler.Data;

namespace ZedIdler.Services
{
    /// <summary>
    /// Shared game clock contract. Single source of truth for in-game time, used
    /// by combat (time-of-day spawn filters), schedule UI (forecasts), and any
    /// system that needs deterministic time queries.
    /// </summary>
    /// <remarks>
    /// Implementation lives in <c>TimeService.cs</c> (Phase 2). For now this
    /// interface lets <see cref="ZedIdler.Systems.WanderingSceneController"/>
    /// compile and run with a stub or mock.
    /// </remarks>
    public interface ITimeService
    {
        /// <summary>0–23 hour of the in-game day.</summary>
        int CurrentHour { get; }
        /// <summary>Coarse Day/Night bucket used by spawn filters.</summary>
        TimeOfDay TimeOfDay { get; }
        /// <summary>Fires whenever the in-game hour advances.</summary>
        event Action<int> OnHourChanged;
    }

    /// <summary>
    /// Exposes the player's currently-selected zone (chosen from the Traversal
    /// satellite grid). Wandering combat reads <see cref="CurrentBiome"/> to
    /// pick the spawn pool from <see cref="ZombieCatalog"/>.
    /// </summary>
    /// <remarks>
    /// Implementation lives in <c>TraversalContext.cs</c> (Phase 2 file #3).
    /// </remarks>
    public interface ITraversalContext
    {
        BiomeTag CurrentBiome { get; }
        string CurrentZoneId { get; }
        event Action<BiomeTag> OnBiomeChanged;
    }

    /// <summary>
    /// Survivor inventory contract. Combat fires loot drops; the inventory
    /// service decides what to do with them (auto-stash, queue for review, etc.).
    /// Bandages and consumables are also queried here for the executable
    /// <c>eat</c>, <c>drink</c>, and loot-bandage commands.
    /// </summary>
    /// <remarks>
    /// Implementation lives in <c>InventoryService.cs</c> (Phase 2 file #4).
    /// </remarks>
    public interface IInventoryService
    {
        int GetQuantity(string itemId);
        void AddDrop(LootDrop drop);
        bool Consume(string itemId, int quantity = 1);
        bool HasItem(string itemId);
        event Action<LootDrop> OnLootAdded;
    }
}
