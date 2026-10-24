// Assets/Scripts/Services/CatalogService.Faction.cs
// Partial extension adding Faction lookup to CatalogService.
using System.Collections.Generic;
using UnityEngine;
using ZedIdler.Data;

namespace ZedIdler.Services
{
    /// <summary>
    /// Faction catalog extension wired into the main <see cref="CatalogService"/>.
    /// Loads <see cref="Faction"/> assets via inspector slots or Resources fallback
    /// and exposes them through <see cref="IFactionCatalogProvider"/>.
    /// </summary>
    /// <remarks>
    /// This is a SEPARATE component that lives on the same GameObject as
    /// <see cref="CatalogService"/>. We use composition instead of a partial
    /// class to keep the original file untouched. Resolves at Awake order
    /// after the main catalog so it can fall through to Resources on its own.
    /// </remarks>
    [DisallowMultipleComponent]
    public sealed class FactionCatalogExtension : MonoBehaviour, IFactionCatalogProvider
    {
        [SerializeField] private Faction[] factions;
        [SerializeField] private string resourcesRoot = "Catalogs";

        private readonly Dictionary<string, Faction> _byId = new Dictionary<string, Faction>();

        private void Awake()
        {
            DontDestroyOnLoad(gameObject);
            if (factions == null || factions.Length == 0)
                factions = Resources.LoadAll<Faction>(resourcesRoot);
            _byId.Clear();
            foreach (var f in factions ?? System.Array.Empty<Faction>())
                if (f != null && !string.IsNullOrEmpty(f.FactionId)) _byId[f.FactionId] = f;
            ServiceLocator.Register<IFactionCatalogProvider>(this);
            if (_byId.Count == 0)
                Debug.LogWarning("[FactionCatalogExtension] No Faction assets. Run ZedIdler → Seed Factions.");
        }

        private void OnDestroy() => ServiceLocator.Unregister<IFactionCatalogProvider>();

        public Faction GetFaction(string factionId) =>
            !string.IsNullOrEmpty(factionId) && _byId.TryGetValue(factionId, out var f) ? f : null;

        public IReadOnlyList<Faction> GetAllFactions() => factions ?? System.Array.Empty<Faction>();
    }
}
