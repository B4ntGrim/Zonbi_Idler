// Assets/Scripts/Data/BalanceConfig.cs
using UnityEngine;

namespace ZedIdler.Data
{
    /// <summary>
    /// Central tuning surface. Every balance-relevant number lives here so
    /// designers tune without recompiling. Local-only ScriptableObject for now;
    /// the field layout is JSON-friendly for a future remote-config swap.
    /// </summary>
    /// <remarks>
    /// Create via: Right-click → Create → ZedIdler → Balance Config.
    /// Systems resolve it via ServiceLocator (registered by a small loader) and
    /// fall back to these defaults when absent, so the game never hard-depends
    /// on the asset existing.
    /// </remarks>
    [CreateAssetMenu(menuName = "ZedIdler/Balance Config", fileName = "BalanceConfig", order = 1)]
    public sealed class BalanceConfig : ScriptableObject
    {
        [Header("XP / Leveling — XP = (lvl × linear) + (lvl² × quad)")]
        [SerializeField] private int xpLinearCoeff = 100;
        [SerializeField] private int xpQuadCoeff = 10;
        [SerializeField, Range(1, 100)] private int maxLevel = 100;

        [Header("Camp Level")]
        [SerializeField, Range(50, 5000)] private int campXpDivisor = 500;

        [Header("Combat")]
        [SerializeField, Range(1f, 3f)] private float critMultiplier = 1.75f;
        [SerializeField, Range(0f, 0.01f)] private float critChancePerCombat = 0.001f;
        [SerializeField, Range(1f, 30f)] private int hpPerEndurance = 10;
        [SerializeField, Range(0.1f, 5f)] private float baseTurnSeconds = 1f;

        [Header("Backpack")]
        [SerializeField, Range(10f, 200f)] private float baseCarryKg = 40f;
        [SerializeField, Range(50f, 500f)] private float strengthCapDivisor = 200f;

        [Header("Recycler")]
        [SerializeField, Range(0f, 1f)] private float recyclerProStack1 = 0.10f;
        [SerializeField, Range(0f, 1f)] private float recyclerProStack2 = 0.20f;
        [SerializeField, Range(0f, 1f)] private float recyclerProStack3 = 0.35f;

        [Header("Marketplace")]
        [SerializeField, Range(0f, 100f)] private float demandBaseline = 50f;
        [SerializeField, Range(0f, 50f)] private float demandGainPerBuy = 5f;
        [SerializeField, Range(0f, 50f)] private float demandDecayPerHour = 4f; // balance pass #1: 1→4 (§5)
        [SerializeField, Range(0f, 0.1f)] private float factionDiscountPerRank = 0.02f;

        [Header("Quota (24h ethical limit)")]
        [SerializeField, Range(1f, 168f)] private float dailyOfflineCapHours = 24f;

        [Header("Contract Failure")]
        [SerializeField, Range(0f, 1f)] private float survivorPermLossChance = 0.05f;
        [SerializeField, Range(0f, 1f)] private float survivorRecoverableChance = 0.20f;

        [Header("Prestige")]
        [Tooltip("Legacy = floor(K × sqrt(totalCampXp / D)).")]
        [SerializeField, Range(1f, 50f)] private float prestigeK = 5f;
        [SerializeField, Range(1f, 100000f)] private float prestigeD = 850f; // balance pass #1: 1000→850 (§6)
        [SerializeField, Range(1, 100)] private int prestigeGateCampLevel = 25;

        // ─── Accessors ────────────────────────────────────────────────────────
        public int   XpLinearCoeff => xpLinearCoeff;
        public int   XpQuadCoeff => xpQuadCoeff;
        public int   MaxLevel => maxLevel;
        public int   CampXpDivisor => campXpDivisor;
        public float CritMultiplier => critMultiplier;
        public float CritChancePerCombat => critChancePerCombat;
        public int   HpPerEndurance => hpPerEndurance;
        public float BaseTurnSeconds => baseTurnSeconds;
        public float BaseCarryKg => baseCarryKg;
        public float StrengthCapDivisor => strengthCapDivisor;
        public float RecyclerProStack1 => recyclerProStack1;
        public float RecyclerProStack2 => recyclerProStack2;
        public float RecyclerProStack3 => recyclerProStack3;
        public float DemandBaseline => demandBaseline;
        public float DemandGainPerBuy => demandGainPerBuy;
        public float DemandDecayPerHour => demandDecayPerHour;
        public float FactionDiscountPerRank => factionDiscountPerRank;
        public float DailyOfflineCapHours => dailyOfflineCapHours;
        public float SurvivorPermLossChance => survivorPermLossChance;
        public float SurvivorRecoverableChance => survivorRecoverableChance;
        public float PrestigeK => prestigeK;
        public float PrestigeD => prestigeD;
        public int   PrestigeGateCampLevel => prestigeGateCampLevel;

        // ─── Derived helpers (single source of truth for formulas) ────────────
        public long XpRequiredForLevel(int level)
        {
            if (level < 1) level = 1;
            long n = level;
            return (n * xpLinearCoeff) + (n * n * xpQuadCoeff);
        }

        public long CumulativeXpToReach(int targetLevel)
        {
            long sum = 0;
            for (int i = 1; i < targetLevel; i++) sum += XpRequiredForLevel(i);
            return sum;
        }
    }
}
