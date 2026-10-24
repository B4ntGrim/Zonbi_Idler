// Assets/Scripts/Data/ZombieDefinition.cs
using UnityEngine;

namespace ZedIdler.Data
{
    /// <summary>Tier classification per the combat spec. Order is locked for save compatibility.</summary>
    public enum ZombieTier
    {
        Standard    = 0,
        Fast        = 1,
        Heavy       = 2,
        Infected    = 3,
        Elite       = 4,
        HordeLeader = 5,
        Apex        = 6,
        WorldBoss   = 7
    }

    /// <summary>Static data describing one zombie archetype. ScriptableObject.</summary>
    [CreateAssetMenu(menuName = "ZedIdler/Zombie Definition", fileName = "Z_New", order = 30)]
    public sealed class ZombieDefinition : ScriptableObject
    {
        [Header("Identity")]
        [SerializeField] private string zombieId;
        [SerializeField] private string displayName;
        [SerializeField] private ZombieTier tier = ZombieTier.Standard;
        [SerializeField] private Sprite sprite;

        [Header("Stats (range — rolled at encounter)")]
        [SerializeField] private int hpMin = 20;
        [SerializeField] private int hpMax = 40;
        [SerializeField] private int damageMin = 5;
        [SerializeField] private int damageMax = 10;
        [SerializeField] private int speed = 5;
        [SerializeField] private int armor = 0;
        [SerializeField] private int initiativeBonus = 0;

        [Header("Rewards")]
        [SerializeField] private int baseXp = 15;
        [SerializeField] private LootTable lootTable;

        [Header("Spawn Rules")]
        [SerializeField, Range(0, 2)] private int timeOfDayPreference = 0;
        [SerializeField, Range(0, 100)] private int minPlayerLevel = 0;

        [Header("Special Abilities")]
        [SerializeField] private ZombieAbility abilities = ZombieAbility.None;
        [SerializeField] private ZombieVariantTheme variantTheme = ZombieVariantTheme.Default;
        [SerializeField, Range(0, 50)] private int selfHealPerTurn = 0;
        [SerializeField, Range(0, 100)] private int deathAoeDamage = 0;
        [SerializeField, Range(0f, 1f)] private float reflectPct = 0f;
        [SerializeField, Range(0, 100)] private int variantDifficulty = 0;

        public string     ZombieId            => zombieId;
        public string     DisplayName         => displayName;
        public ZombieTier Tier                => tier;
        public Sprite     Sprite              => sprite;
        public int        HpMin               => hpMin;
        public int        HpMax               => hpMax;
        public int        DamageMin           => damageMin;
        public int        DamageMax           => damageMax;
        public int        Speed               => speed;
        public int        Armor               => armor;
        public int        InitiativeBonus     => initiativeBonus;
        public int        BaseXp              => baseXp;
        public LootTable  LootTable           => lootTable;
        public int        TimeOfDayPreference => timeOfDayPreference;
        public int        MinPlayerLevel      => minPlayerLevel;
        public ZombieAbility       Abilities         => abilities;
        public ZombieVariantTheme  VariantTheme      => variantTheme;
        public int                 SelfHealPerTurn   => selfHealPerTurn;
        public int                 DeathAoeDamage    => deathAoeDamage;
        public float               ReflectPct        => reflectPct;
        public int                 VariantDifficulty => variantDifficulty;
        public bool HasAbility(ZombieAbility a) => (abilities & a) == a;

        public int TierInitiativeBonus
        {
            get
            {
                switch (tier)
                {
                    case ZombieTier.Fast:        return  5;
                    case ZombieTier.Heavy:       return -5;
                    case ZombieTier.Elite:       return 10;
                    case ZombieTier.HordeLeader: return 15;
                    case ZombieTier.Apex:        return 18;
                    case ZombieTier.WorldBoss:   return 25;
                    default: return 0;
                }
            }
        }

        public bool IsElite => tier == ZombieTier.Elite || tier == ZombieTier.HordeLeader
                            || tier == ZombieTier.Apex || tier == ZombieTier.WorldBoss;
    }
}
