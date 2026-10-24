// Assets/Scripts/Services/EquipmentService.cs
using System;
using System.Collections.Generic;
using UnityEngine;
using ZedIdler.Data;

namespace ZedIdler.Services
{
    /// <summary>
    /// Per-survivor weapon loadout tracker. Stores three slots
    /// (Primary / Secondary / Melee) plus runtime weapon instance state:
    /// magazine, durability, cleanliness, installed mods, broken flag.
    /// </summary>
    /// <remarks>
    /// Equipped weapon id pattern: survivor entity carries the slot ids;
    /// this service owns the full runtime instance (so HP-style "state on
    /// the gun, not the survivor" persistence works after deaths/rescues).
    ///
    /// Combat reads via <see cref="GetEquippedInstance"/> and routes
    /// <see cref="OnWeaponFired"/> / <see cref="OnMelee"/> after every action.
    /// </remarks>
    [DisallowMultipleComponent]
    public sealed class EquipmentService : MonoBehaviour, IEquipmentService
    {
        private readonly Dictionary<string, SurvivorLoadout> _loadouts = new Dictionary<string, SurvivorLoadout>();
        private readonly Dictionary<string, WeaponInstance> _instances = new Dictionary<string, WeaponInstance>();
        private ICatalogService _catalog;
        private IInventoryService _inventory;
        private System.Random _rng = new System.Random();

        public event Action<string, WeaponSlot, string> OnEquipped;   // (survivorId, slot, weaponInstanceId)
        public event Action<string, WeaponSlot>          OnUnequipped;
        public event Action<string, int>                 OnAmmoChanged;   // (instanceId, newAmmo)
        public event Action<string, int>                 OnDurabilityChanged;
        public event Action<string, int>                 OnCleanlinessChanged;
        public event Action<string>                      OnMisfire;
        public event Action<string>                      OnBroken;
        public event Action<string>                      OnRepaired;
        public event Action<string, string>              OnModInstalled;

        private void Awake()
        {
            DontDestroyOnLoad(gameObject);
            ServiceLocator.Register<IEquipmentService>(this);
        }

        private void OnDestroy() => ServiceLocator.Unregister<IEquipmentService>();

        private void Start()
        {
            ServiceLocator.TryGet(out _catalog);
            ServiceLocator.TryGet(out _inventory);
        }

        // ─── Loadout API ──────────────────────────────────────────────────────
        public SurvivorLoadout GetLoadout(string survivorId) =>
            _loadouts.TryGetValue(survivorId, out var l) ? l : default;

        public WeaponInstance GetEquippedInstance(string survivorId, WeaponSlot slot)
        {
            if (!_loadouts.TryGetValue(survivorId, out var l)) return default;
            string id = SlotInstanceId(l, slot);
            return string.IsNullOrEmpty(id) ? default : _instances.TryGetValue(id, out var inst) ? inst : default;
        }

        /// <summary>
        /// Equip a weapon for a survivor in the appropriate slot. Creates a fresh
        /// <see cref="WeaponInstance"/> with full durability, full magazine, and
        /// the weapon's starting cleanliness.
        /// </summary>
        public string EquipNew(string survivorId, WeaponDefinition def)
        {
            if (string.IsNullOrEmpty(survivorId) || def == null) return null;
            string instanceId = Guid.NewGuid().ToString("N");
            var inst = new WeaponInstance
            {
                instanceId      = instanceId,
                weaponId        = def.WeaponId,
                currentAmmo     = def.MagazineSize,
                durability      = def.MaxDurability,
                cleanliness     = def.StartingCleanliness,
                installedModIds = Array.Empty<string>(),
                isBroken        = false
            };
            _instances[instanceId] = inst;

            var loadout = _loadouts.TryGetValue(survivorId, out var existing) ? existing : new SurvivorLoadout { survivorId = survivorId };
            SetSlot(ref loadout, def.Slot, instanceId);
            _loadouts[survivorId] = loadout;

            OnEquipped?.Invoke(survivorId, def.Slot, instanceId);
            return instanceId;
        }

        public bool Unequip(string survivorId, WeaponSlot slot)
        {
            if (!_loadouts.TryGetValue(survivorId, out var l)) return false;
            string id = SlotInstanceId(l, slot);
            if (string.IsNullOrEmpty(id)) return false;
            SetSlot(ref l, slot, null);
            _loadouts[survivorId] = l;
            OnUnequipped?.Invoke(survivorId, slot);
            return true;
        }

        // ─── Combat hooks ─────────────────────────────────────────────────────
        /// <summary>Called by combat after a ranged shot — returns true if shot fired, false on misfire.</summary>
        public bool OnRangedShot(string instanceId)
        {
            if (!TryGetInstanceAndDef(instanceId, out var inst, out var def)) return false;
            if (inst.isBroken) return false;
            if (inst.currentAmmo <= 0) return false;

            // Misfire roll based on cleanliness.
            float misfireChance = Mathf.Lerp(0f, def.MaxMisfireChance, 1f - (inst.cleanliness / 100f));
            bool isMisfire = _rng.NextDouble() < misfireChance;

            // Spend a shot.
            inst.currentAmmo = Mathf.Max(0, inst.currentAmmo - 1);
            inst.durability  = Mathf.Max(0, inst.durability - def.DurabilityCostPerShot);
            inst.cleanliness = Mathf.Max(0, inst.cleanliness - def.CleanlinessLossPerUse);
            OnAmmoChanged?.Invoke(instanceId, inst.currentAmmo);
            OnDurabilityChanged?.Invoke(instanceId, inst.durability);
            OnCleanlinessChanged?.Invoke(instanceId, inst.cleanliness);

            if (isMisfire)
            {
                OnMisfire?.Invoke(instanceId);
                // Proc-roll break.
                if (_rng.NextDouble() < def.MisfireBreakRollChance)
                {
                    inst.isBroken = true;
                    OnBroken?.Invoke(instanceId);
                }
            }
            _instances[instanceId] = inst;
            return !isMisfire;
        }

        public void OnMelee(string instanceId)
        {
            if (!TryGetInstanceAndDef(instanceId, out var inst, out var def)) return;
            if (inst.isBroken) return;
            inst.durability  = Mathf.Max(0, inst.durability - def.DurabilityCostPerShot);
            inst.cleanliness = Mathf.Max(0, inst.cleanliness - def.CleanlinessLossPerUse);
            _instances[instanceId] = inst;
            OnDurabilityChanged?.Invoke(instanceId, inst.durability);
            OnCleanlinessChanged?.Invoke(instanceId, inst.cleanliness);
        }

        public bool Reload(string instanceId)
        {
            if (!TryGetInstanceAndDef(instanceId, out var inst, out var def)) return false;
            if (inst.isBroken) return false;
            if (_inventory == null || string.IsNullOrEmpty(def.AmmoItemId)) return false;
            int needed = def.MagazineSize - inst.currentAmmo;
            if (needed <= 0) return true;
            int available = _inventory.GetQuantity(def.AmmoItemId);
            int take = Mathf.Min(needed, available);
            if (take <= 0) return false;
            _inventory.Consume(def.AmmoItemId, take);
            inst.currentAmmo += take;
            _instances[instanceId] = inst;
            OnAmmoChanged?.Invoke(instanceId, inst.currentAmmo);
            return true;
        }

        public bool Clean(string instanceId)
        {
            if (!TryGetInstanceAndDef(instanceId, out var inst, out var def)) return false;
            if (_inventory == null) return false;
            if (!_inventory.Consume("cleaning_kit", 1)) return false;
            inst.cleanliness = 100;
            _instances[instanceId] = inst;
            OnCleanlinessChanged?.Invoke(instanceId, 100);
            return true;
        }

        public bool Repair(string instanceId)
        {
            if (!TryGetInstanceAndDef(instanceId, out var inst, out var def)) return false;
            if (_inventory == null) return false;
            // Repair cost: 2 spare parts + 1 hardened steel (designer-tunable later).
            if (_inventory.GetQuantity("spare_part") < 2 || _inventory.GetQuantity("hardened_steel") < 1) return false;
            _inventory.Consume("spare_part", 2);
            _inventory.Consume("hardened_steel", 1);
            inst.durability = def.MaxDurability;
            inst.isBroken = false;
            _instances[instanceId] = inst;
            OnDurabilityChanged?.Invoke(instanceId, inst.durability);
            OnRepaired?.Invoke(instanceId);
            return true;
        }

        public bool InstallMod(string instanceId, string modId)
        {
            if (!TryGetInstanceAndDef(instanceId, out var inst, out var def)) return false;
            var mod = ResolveMod(modId);
            if (mod == null) return false;
            if (inst.installedModIds != null && inst.installedModIds.Length >= def.SocketCount) return false;
            // Category-match check.
            if (mod.RequiresCategoryMatch)
            {
                bool ok = false;
                foreach (var cat in def.AllowedSocketCategories)
                    if (cat == mod.Category) { ok = true; break; }
                if (!ok) return false;
            }
            var arr = inst.installedModIds ?? Array.Empty<string>();
            var newArr = new string[arr.Length + 1];
            Array.Copy(arr, newArr, arr.Length);
            newArr[arr.Length] = modId;
            inst.installedModIds = newArr;
            _instances[instanceId] = inst;
            OnModInstalled?.Invoke(instanceId, modId);
            return true;
        }

        /// <summary>Damage modifier for combat — folds in mods, broken state, and Diplomat bonus.</summary>
        public WeaponDamageProfile GetDamageProfile(string instanceId, int factionRankBonus)
        {
            if (!TryGetInstanceAndDef(instanceId, out var inst, out var def)) return default;
            float baseMult = def.DamageMultiplier;
            int dmgBonus = 0;
            float crit = def.CritChanceBonus;
            float accuracy = def.Accuracy;
            int magBonus = 0, durBonus = 0;
            float cleanlinessSave = 0f;

            foreach (var modId in inst.installedModIds ?? Array.Empty<string>())
            {
                var mod = ResolveMod(modId);
                if (mod == null) continue;
                dmgBonus       += Mathf.RoundToInt(mod.DamageBonus);
                baseMult       += mod.DamageMultBonus;
                crit           += mod.CritChanceBonus;
                accuracy       += mod.AccuracyBonus;
                magBonus       += mod.MagazineBonus;
                durBonus       += mod.DurabilityMaxBonus;
                cleanlinessSave += mod.CleanlinessLossReduction;
            }
            // Diplomat bonus from faction rep.
            float diplomatMult = 1f + (factionRankBonus * def.DiplomatRankBonusPerRank);

            // Broken weapons deal 50% damage.
            float brokenMult = inst.isBroken ? 0.5f : 1f;

            return new WeaponDamageProfile
            {
                instanceId = instanceId,
                minDamage = def.MinDamage + dmgBonus,
                maxDamage = def.MaxDamage + dmgBonus,
                damageMult = baseMult * diplomatMult * brokenMult,
                critChanceBonus = crit,
                accuracy = Mathf.Clamp01(accuracy),
                magazineSize = def.MagazineSize + magBonus,
                maxDurability = def.MaxDurability + durBonus,
                primaryScaling = def.PrimaryScaling,
                isBroken = inst.isBroken,
                kind = def.Kind
            };
        }

        // ─── Helpers ──────────────────────────────────────────────────────────
        private WeaponDefinition ResolveDef(string weaponId)
        {
            if (_catalog is IWeaponCatalogProvider wcp) return wcp.GetWeapon(weaponId);
            return null;
        }

        private WeaponMod ResolveMod(string modId)
        {
            if (_catalog is IWeaponCatalogProvider wcp) return wcp.GetMod(modId);
            return null;
        }

        private bool TryGetInstanceAndDef(string instanceId, out WeaponInstance inst, out WeaponDefinition def)
        {
            def = null;
            if (!_instances.TryGetValue(instanceId, out inst)) return false;
            def = ResolveDef(inst.weaponId);
            return def != null;
        }

        private static void SetSlot(ref SurvivorLoadout l, WeaponSlot slot, string instanceId)
        {
            switch (slot)
            {
                case WeaponSlot.Primary:   l.primaryInstanceId   = instanceId; break;
                case WeaponSlot.Secondary: l.secondaryInstanceId = instanceId; break;
                case WeaponSlot.Melee:     l.meleeInstanceId     = instanceId; break;
            }
        }

        private static string SlotInstanceId(SurvivorLoadout l, WeaponSlot slot) => slot switch
        {
            WeaponSlot.Primary   => l.primaryInstanceId,
            WeaponSlot.Secondary => l.secondaryInstanceId,
            WeaponSlot.Melee     => l.meleeInstanceId,
            _ => null
        };

        // ─── Snapshot ─────────────────────────────────────────────────────────
        [Serializable]
        public struct Snapshot
        {
            public SurvivorLoadout[] loadouts;
            public WeaponInstance[]  instances;
        }

        public Snapshot CreateSnapshot()
        {
            var arr1 = new SurvivorLoadout[_loadouts.Count];
            int i = 0; foreach (var kv in _loadouts) arr1[i++] = kv.Value;
            var arr2 = new WeaponInstance[_instances.Count];
            i = 0; foreach (var kv in _instances) arr2[i++] = kv.Value;
            return new Snapshot { loadouts = arr1, instances = arr2 };
        }

        public void Restore(Snapshot s)
        {
            _loadouts.Clear(); _instances.Clear();
            if (s.loadouts  != null) foreach (var l in s.loadouts)  if (!string.IsNullOrEmpty(l.survivorId)) _loadouts[l.survivorId] = l;
            if (s.instances != null) foreach (var i in s.instances) if (!string.IsNullOrEmpty(i.instanceId)) _instances[i.instanceId] = i;
        }
    }

    public interface IEquipmentService
    {
        event Action<string, WeaponSlot, string> OnEquipped;
        event Action<string, WeaponSlot>          OnUnequipped;
        event Action<string, int>                 OnAmmoChanged;
        event Action<string, int>                 OnDurabilityChanged;
        event Action<string, int>                 OnCleanlinessChanged;
        event Action<string>                      OnMisfire;
        event Action<string>                      OnBroken;
        event Action<string>                      OnRepaired;
        event Action<string, string>              OnModInstalled;

        SurvivorLoadout GetLoadout(string survivorId);
        WeaponInstance  GetEquippedInstance(string survivorId, WeaponSlot slot);
        string EquipNew(string survivorId, WeaponDefinition def);
        bool   Unequip(string survivorId, WeaponSlot slot);
        bool   OnRangedShot(string instanceId);
        void   OnMelee(string instanceId);
        bool   Reload(string instanceId);
        bool   Clean(string instanceId);
        bool   Repair(string instanceId);
        bool   InstallMod(string instanceId, string modId);
        WeaponDamageProfile GetDamageProfile(string instanceId, int factionRankBonus);
        EquipmentService.Snapshot CreateSnapshot();
        void Restore(EquipmentService.Snapshot s);
    }

    public interface IWeaponCatalogProvider
    {
        WeaponDefinition GetWeapon(string id);
        WeaponMod GetMod(string id);
        IReadOnlyList<WeaponDefinition> GetAllWeapons();
        IReadOnlyList<WeaponMod> GetAllMods();
    }

    [Serializable]
    public struct SurvivorLoadout
    {
        public string survivorId;
        public string primaryInstanceId;
        public string secondaryInstanceId;
        public string meleeInstanceId;
    }

    [Serializable]
    public struct WeaponInstance
    {
        public string instanceId;
        public string weaponId;
        public int    currentAmmo;
        public int    durability;
        public int    cleanliness;
        public bool   isBroken;
        public string[] installedModIds;
    }

    public struct WeaponDamageProfile
    {
        public string instanceId;
        public int minDamage;
        public int maxDamage;
        public float damageMult;
        public float critChanceBonus;
        public float accuracy;
        public int magazineSize;
        public int maxDurability;
        public WeaponStatScaling primaryScaling;
        public bool isBroken;
        public WeaponKind kind;
    }
}
