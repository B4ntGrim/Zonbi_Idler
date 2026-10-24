// Assets/Scripts/Data/WeaponDefinition.cs
using System;
using UnityEngine;

namespace ZedIdler.Data
{
    /// <summary>
    /// Static data for a single weapon archetype. Authored as a ScriptableObject
    /// — references its <see cref="ItemDefinition"/> for marketplace, recycler,
    /// and inventory queries (same item id-space).
    /// </summary>
    [CreateAssetMenu(menuName = "ZedIdler/Weapon", fileName = "Weapon_New", order = 110)]
    public sealed class WeaponDefinition : ScriptableObject
    {
        [Header("Identity")]
        [SerializeField] private string weaponId;
        [SerializeField] private string displayName;
        [SerializeField] private WeaponSlot slot = WeaponSlot.Primary;
        [SerializeField] private WeaponKind kind = WeaponKind.Ranged;
        [SerializeField] private ItemDefinition backingItem;

        [Header("Damage")]
        [SerializeField, Range(1, 500)] private int minDamage = 8;
        [SerializeField, Range(1, 500)] private int maxDamage = 18;
        [Tooltip("Multiplier applied to base survivor damage. 1.0 = no change.")]
        [SerializeField, Range(0.5f, 5f)] private float damageMultiplier = 1.25f;

        [Header("Crit")]
        [Tooltip("Additive bonus on top of survivor's base crit chance (Combat × 0.001).")]
        [SerializeField, Range(0f, 0.5f)] private float critChanceBonus = 0f;

        [Header("Ranged Properties")]
        [SerializeField, Range(0, 200)] private int magazineSize = 12;
        [SerializeField] private string ammoItemId; // e.g. "ammo_rifle"
        [SerializeField, Range(0, 10)]  private int durabilityCostPerShot = 1;
        [Tooltip("Base accuracy 0..1. Modified by survivor Agility.")]
        [SerializeField, Range(0f, 1f)] private float accuracy = 0.85f;

        [Header("Durability & Cleanliness")]
        [SerializeField, Range(10, 1000)] private int maxDurability = 100;
        [Tooltip("Starting cleanliness 0..100. Decays with use.")]
        [SerializeField, Range(0, 100)]   private int startingCleanliness = 100;
        [Tooltip("Cleanliness lost per use (per shot for ranged, per swing for melee).")]
        [SerializeField, Range(0, 20)]    private int cleanlinessLossPerUse = 1;

        [Header("Misfire & Break Rolls")]
        [Tooltip("Misfire chance scales linearly from 0 at cleanliness 100 to this value at cleanliness 0.")]
        [SerializeField, Range(0f, 1f)] private float maxMisfireChance = 0.35f;
        [Tooltip("Per-misfire chance the weapon takes a permanent break-roll hit.")]
        [SerializeField, Range(0f, 1f)] private float misfireBreakRollChance = 0.05f;

        [Header("Sockets / Mods")]
        [SerializeField, Range(0, 6)] private int socketCount = 2;
        [SerializeField] private WeaponModCategory[] allowedSocketCategories;

        [Header("Faction Diplomat")]
        [Tooltip("How strongly the player's best faction rank affects damage. 0 = ignored.")]
        [SerializeField, Range(0f, 0.5f)] private float diplomatRankBonusPerRank = 0.03f;

        [Header("Stat Scaling")]
        [Tooltip("Primary stat that scales this weapon's damage.")]
        [SerializeField] private WeaponStatScaling primaryScaling = WeaponStatScaling.AgilityCombat;

        [Header("Tiering & Family")]
        [SerializeField] private WeaponTier tier = WeaponTier.Common;
        [SerializeField] private WeaponFamily family = WeaponFamily.Standard;
        [Tooltip("Faction id if FamilyExclusive; empty otherwise.")]
        [SerializeField] private string exclusiveFactionId;
        [Tooltip("Unique trait id (e.g. 'ignore_armor', 'aoe_burn'). Combat systems opt-in.")]
        [SerializeField] private string uniqueTraitId;

        // ─── Accessors ────────────────────────────────────────────────────────
        public string WeaponId          => weaponId;
        public string DisplayName       => displayName;
        public WeaponSlot Slot          => slot;
        public WeaponKind Kind          => kind;
        public ItemDefinition BackingItem => backingItem;
        public int    MinDamage         => minDamage;
        public int    MaxDamage         => maxDamage;
        public float  DamageMultiplier  => damageMultiplier;
        public float  CritChanceBonus   => critChanceBonus;
        public int    MagazineSize      => magazineSize;
        public string AmmoItemId        => ammoItemId;
        public int    DurabilityCostPerShot => durabilityCostPerShot;
        public float  Accuracy          => accuracy;
        public int    MaxDurability     => maxDurability;
        public int    StartingCleanliness => startingCleanliness;
        public int    CleanlinessLossPerUse => cleanlinessLossPerUse;
        public float  MaxMisfireChance  => maxMisfireChance;
        public float  MisfireBreakRollChance => misfireBreakRollChance;
        public int    SocketCount       => socketCount;
        public WeaponModCategory[] AllowedSocketCategories => allowedSocketCategories ?? Array.Empty<WeaponModCategory>();
        public float  DiplomatRankBonusPerRank => diplomatRankBonusPerRank;
        public WeaponStatScaling PrimaryScaling => primaryScaling;
        public WeaponTier Tier                  => tier;
        public WeaponFamily Family              => family;
        public string ExclusiveFactionId        => exclusiveFactionId;
        public string UniqueTraitId             => uniqueTraitId;

        public bool IsRanged => kind == WeaponKind.Ranged;
        public bool IsMelee  => kind == WeaponKind.Melee;
    }

    public enum WeaponSlot   { Primary = 0, Secondary = 1, Melee = 2, Throwable = 3, Sidearm = 4 }
    public enum WeaponKind   { Melee = 0, Ranged = 1, Throwable = 2 }
    public enum WeaponStatScaling { StrengthCombat = 0, AgilityCombat = 1, IntellectCombat = 2 }
    public enum WeaponModCategory { Damage = 0, Accuracy = 1, Magazine = 2, Durability = 3, Crit = 4, Cleanliness = 5, Recoil = 6 }
    public enum WeaponTier   { Common = 0, Uncommon = 1, Rare = 2, Epic = 3, Legendary = 4 }
    public enum WeaponFamily { Standard = 0, FactionExclusive = 1, Salvaged = 2, RMatInfused = 3, Unique = 4 }
}
