// Assets/Scripts/Services/WeaponCatalogExtension.cs
using System.Collections.Generic;
using UnityEngine;
using ZedIdler.Data;

namespace ZedIdler.Services
{
    /// <summary>Catalog adapter for WeaponDefinition + WeaponMod assets.</summary>
    [DisallowMultipleComponent]
    public sealed class WeaponCatalogExtension : MonoBehaviour, IWeaponCatalogProvider
    {
        [SerializeField] private WeaponDefinition[] weapons;
        [SerializeField] private WeaponMod[] mods;
        [SerializeField] private string resourcesRoot = "Catalogs";

        private readonly Dictionary<string, WeaponDefinition> _weaponsById = new Dictionary<string, WeaponDefinition>();
        private readonly Dictionary<string, WeaponMod>        _modsById    = new Dictionary<string, WeaponMod>();

        private void Awake()
        {
            DontDestroyOnLoad(gameObject);
            if (weapons == null || weapons.Length == 0) weapons = Resources.LoadAll<WeaponDefinition>(resourcesRoot);
            if (mods    == null || mods.Length    == 0) mods    = Resources.LoadAll<WeaponMod>(resourcesRoot);
            _weaponsById.Clear(); _modsById.Clear();
            foreach (var w in weapons ?? System.Array.Empty<WeaponDefinition>())
                if (w != null && !string.IsNullOrEmpty(w.WeaponId)) _weaponsById[w.WeaponId] = w;
            foreach (var m in mods ?? System.Array.Empty<WeaponMod>())
                if (m != null && !string.IsNullOrEmpty(m.ModId)) _modsById[m.ModId] = m;
            ServiceLocator.Register<IWeaponCatalogProvider>(this);
            if (_weaponsById.Count == 0) Debug.LogWarning("[WeaponCatalogExtension] No Weapon assets. Run ZedIdler → Seed Weapons.");
        }

        private void OnDestroy() => ServiceLocator.Unregister<IWeaponCatalogProvider>();

        public WeaponDefinition GetWeapon(string id) => !string.IsNullOrEmpty(id) && _weaponsById.TryGetValue(id, out var w) ? w : null;
        public WeaponMod GetMod(string id)           => !string.IsNullOrEmpty(id) && _modsById.TryGetValue(id, out var m) ? m : null;
        public IReadOnlyList<WeaponDefinition> GetAllWeapons() => weapons ?? System.Array.Empty<WeaponDefinition>();
        public IReadOnlyList<WeaponMod> GetAllMods()           => mods ?? System.Array.Empty<WeaponMod>();
    }
}
