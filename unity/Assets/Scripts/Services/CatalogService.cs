// Assets/Scripts/Services/CatalogService.cs
using System.Collections.Generic;
using UnityEngine;
using ZedIdler.Data;
using ZedIdler.UI;

namespace ZedIdler.Services
{
    /// <summary>
    /// Phase 1 File #5 — runtime registry for every authored ScriptableObject
    /// catalog. Loads on Awake, registers itself with <see cref="ServiceLocator"/>
    /// under <see cref="ICatalogService"/>, and exposes typed lookups for the
    /// rest of the game (zombies, character types, perks, recycler recipes,
    /// items, market events).
    /// </summary>
    /// <remarks>
    /// Loading strategy:
    /// • Inspector slots take precedence (drag the catalog assets into the slots).
    /// • If slots are empty, the service falls back to <c>Resources.LoadAll</c>
    ///   so designers can drop new assets into <c>Assets/Resources/Catalogs</c>
    ///   without re-wiring scenes.
    ///
    /// Lifecycle: place on a "Bootstrap" GameObject alongside <c>GameManager</c>
    /// with <c>DontDestroyOnLoad</c>. Awake order matters — make sure this runs
    /// before any system that does <c>ServiceLocator.Get&lt;ICatalogService&gt;()</c>.
    /// </remarks>
    [DisallowMultipleComponent]
    public sealed class CatalogService : MonoBehaviour,
        ICatalogService,
        IRecyclerCatalogProvider,
        IRecyclerCatalogListProvider,
        IItemCatalogProvider
    {
        [Header("Direct References (preferred — leave empty to use Resources.LoadAll)")]
        [SerializeField] private ZombieCatalog zombieCatalog;
        [SerializeField] private CharacterTypeDefinition[] characterTypes;
        [SerializeField] private Perk[] perks;
        [SerializeField] private RecyclerRecipe[] recyclerRecipes;
        [SerializeField] private ItemDefinition[] items;
        [SerializeField] private MarketEvent[] marketEvents;

        [Header("Resources fallback")]
        [SerializeField] private string resourcesRoot = "Catalogs";

        // ─── Indexed lookups ─────────────────────────────────────────────────
        private readonly Dictionary<CharacterType, CharacterTypeDefinition> _typesByEnum
            = new Dictionary<CharacterType, CharacterTypeDefinition>();
        private readonly Dictionary<string, Perk> _perksById = new Dictionary<string, Perk>();
        private readonly Dictionary<string, RecyclerRecipe> _recipesById = new Dictionary<string, RecyclerRecipe>();
        private readonly Dictionary<string, ItemDefinition> _itemsById = new Dictionary<string, ItemDefinition>();
        private readonly Dictionary<string, MarketEvent> _eventsById = new Dictionary<string, MarketEvent>();

        public ZombieCatalog ZombieCatalog => zombieCatalog;
        public IReadOnlyList<CharacterTypeDefinition> CharacterTypes => characterTypes;
        public IReadOnlyList<Perk> Perks => perks;
        public IReadOnlyList<RecyclerRecipe> RecyclerRecipes => recyclerRecipes;
        public IReadOnlyList<ItemDefinition> Items => items;
        public IReadOnlyList<MarketEvent> MarketEvents => marketEvents;

        // ─── Lifecycle ────────────────────────────────────────────────────────
        private void Awake()
        {
            DontDestroyOnLoad(gameObject);
            LoadAndIndex();
            ServiceLocator.Register<ICatalogService>(this);
        }

        private void OnDestroy() => ServiceLocator.Unregister<ICatalogService>();

        private void LoadAndIndex()
        {
            // Resources fallback for any null slots.
            if (zombieCatalog == null)
            {
                var found = Resources.LoadAll<ZombieCatalog>(resourcesRoot);
                if (found != null && found.Length > 0) zombieCatalog = found[0];
            }
            if (characterTypes == null || characterTypes.Length == 0)
                characterTypes = Resources.LoadAll<CharacterTypeDefinition>(resourcesRoot);
            if (perks == null || perks.Length == 0)
                perks = Resources.LoadAll<Perk>(resourcesRoot);
            if (recyclerRecipes == null || recyclerRecipes.Length == 0)
                recyclerRecipes = Resources.LoadAll<RecyclerRecipe>(resourcesRoot);
            if (items == null || items.Length == 0)
                items = Resources.LoadAll<ItemDefinition>(resourcesRoot);
            if (marketEvents == null || marketEvents.Length == 0)
                marketEvents = Resources.LoadAll<MarketEvent>(resourcesRoot);

            // Build indices.
            _typesByEnum.Clear();
            foreach (var t in characterTypes ?? System.Array.Empty<CharacterTypeDefinition>())
                if (t != null) _typesByEnum[t.Type] = t;

            _perksById.Clear();
            foreach (var p in perks ?? System.Array.Empty<Perk>())
                if (p != null && !string.IsNullOrEmpty(p.PerkId)) _perksById[p.PerkId] = p;

            _recipesById.Clear();
            foreach (var r in recyclerRecipes ?? System.Array.Empty<RecyclerRecipe>())
                if (r != null && !string.IsNullOrEmpty(r.RecipeId)) _recipesById[r.RecipeId] = r;

            _itemsById.Clear();
            foreach (var i in items ?? System.Array.Empty<ItemDefinition>())
                if (i != null && !string.IsNullOrEmpty(i.ItemId)) _itemsById[i.ItemId] = i;

            _eventsById.Clear();
            foreach (var e in marketEvents ?? System.Array.Empty<MarketEvent>())
                if (e != null && !string.IsNullOrEmpty(e.EventId)) _eventsById[e.EventId] = e;

            // Diagnostic warnings.
            if (zombieCatalog == null) Debug.LogWarning("[CatalogService] No ZombieCatalog. Run ZedIdler → Seed Zombies & Catalog.");
            if (_typesByEnum.Count == 0) Debug.LogWarning("[CatalogService] No CharacterTypeDefinitions. Run ZedIdler → Seed Catalogs.");
            if (_perksById.Count == 0)   Debug.LogWarning("[CatalogService] No Perks. Run ZedIdler → Seed Catalogs.");
            if (_recipesById.Count == 0) Debug.LogWarning("[CatalogService] No RecyclerRecipes. Run ZedIdler → Seed Recycler Recipes.");
            if (_itemsById.Count == 0)   Debug.LogWarning("[CatalogService] No ItemDefinitions. Run ZedIdler → Seed Items.");
        }

        // ─── ICatalogService ──────────────────────────────────────────────────
        public CharacterTypeDefinition GetCharacterType(CharacterType t) =>
            _typesByEnum.TryGetValue(t, out var def) ? def : null;

        public Perk GetPerk(string perkId) =>
            !string.IsNullOrEmpty(perkId) && _perksById.TryGetValue(perkId, out var p) ? p : null;

        public ZombieDefinition GetZombie(string zombieId) =>
            zombieCatalog != null ? zombieCatalog.GetById(zombieId) : null;

        public ZombieDefinition RollZombie(BiomeTag biome, TimeOfDay time, int playerLevel) =>
            zombieCatalog != null ? zombieCatalog.RollZombie(biome, time, playerLevel) : null;

        public List<Perk> AllPerksInCategory(PerkCategory cat)
        {
            var list = new List<Perk>();
            if (perks == null) return list;
            for (int i = 0; i < perks.Length; i++)
                if (perks[i] != null && perks[i].Category == cat) list.Add(perks[i]);
            return list;
        }

        // ─── IRecyclerCatalogProvider / IRecyclerCatalogListProvider ──────────
        public RecyclerRecipe GetRecyclerRecipe(string recipeId) =>
            !string.IsNullOrEmpty(recipeId) && _recipesById.TryGetValue(recipeId, out var r) ? r : null;

        public IEnumerable<RecyclerRecipe> GetAllRecipes() => recyclerRecipes ?? System.Array.Empty<RecyclerRecipe>();

        // ─── IItemCatalogProvider ─────────────────────────────────────────────
        public ItemDefinition GetItem(string itemId) =>
            !string.IsNullOrEmpty(itemId) && _itemsById.TryGetValue(itemId, out var i) ? i : null;

        public IReadOnlyList<ItemDefinition> GetAllItems() => items;

        // ─── Market events ────────────────────────────────────────────────────
        public MarketEvent GetMarketEvent(string eventId) =>
            !string.IsNullOrEmpty(eventId) && _eventsById.TryGetValue(eventId, out var e) ? e : null;
    }

    /// <summary>
    /// Public contract for <see cref="CatalogService"/>. Resolve via
    /// <see cref="ServiceLocator"/> — never hold a direct reference.
    /// </summary>
    public interface ICatalogService
    {
        ZombieCatalog ZombieCatalog { get; }
        IReadOnlyList<CharacterTypeDefinition> CharacterTypes { get; }
        IReadOnlyList<Perk> Perks { get; }
        IReadOnlyList<RecyclerRecipe> RecyclerRecipes { get; }
        IReadOnlyList<ItemDefinition> Items { get; }
        IReadOnlyList<MarketEvent> MarketEvents { get; }

        CharacterTypeDefinition GetCharacterType(CharacterType t);
        Perk GetPerk(string perkId);
        ZombieDefinition GetZombie(string zombieId);
        ZombieDefinition RollZombie(BiomeTag biome, TimeOfDay time, int playerLevel);
        List<Perk> AllPerksInCategory(PerkCategory cat);
        MarketEvent GetMarketEvent(string eventId);
    }
}
