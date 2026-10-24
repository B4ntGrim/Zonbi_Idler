// Assets/Scripts/Data/PrestigeUpgrade.cs
using UnityEngine;

namespace ZedIdler.Data
{
    /// <summary>
    /// Permanent account-wide upgrade bought with Legacy Points. Persists across
    /// every prestige reset. Authored as a ScriptableObject.
    /// </summary>
    [CreateAssetMenu(menuName = "ZedIdler/Prestige Upgrade", fileName = "Prestige_New", order = 140)]
    public sealed class PrestigeUpgrade : ScriptableObject
    {
        [Header("Identity")]
        [SerializeField] private string upgradeId;
        [SerializeField] private string displayName;
        [SerializeField, TextArea(2, 4)] private string description;
        [SerializeField] private Sprite icon;

        [Header("Effect")]
        [Tooltip("Opaque effect key read by gameplay systems, e.g. 'xp_mult', 'loot_mult'.")]
        [SerializeField] private string effectKey;
        [Tooltip("Bonus per level (additive). 0.10 = +10% per level.")]
        [SerializeField] private float effectPerLevel = 0.10f;

        [Header("Cost & Cap")]
        [SerializeField, Range(1, 100)] private int maxLevel = 5;
        [Tooltip("Base Legacy Point cost for level 1.")]
        [SerializeField, Range(1, 10000)] private int baseCost = 10;
        [Tooltip("Cost multiplier per level. 1.5 = each level 50% pricier.")]
        [SerializeField, Range(1f, 3f)] private float costGrowth = 1.5f;

        public string UpgradeId      => upgradeId;
        public string DisplayName    => displayName;
        public string Description    => description;
        public Sprite Icon           => icon;
        public string EffectKey      => effectKey;
        public float  EffectPerLevel => effectPerLevel;
        public int    MaxLevel       => maxLevel;
        public int    BaseCost       => baseCost;
        public float  CostGrowth     => costGrowth;

        /// <summary>Legacy Point cost to purchase the next level from currentLevel.</summary>
        public int CostForLevel(int currentLevel)
            => Mathf.RoundToInt(baseCost * Mathf.Pow(costGrowth, currentLevel));

        public float TotalEffectAt(int level) => effectPerLevel * level;
    }
}
