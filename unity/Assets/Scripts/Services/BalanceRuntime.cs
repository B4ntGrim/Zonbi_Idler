// Assets/Scripts/Services/BalanceRuntime.cs
using UnityEngine;
using ZedIdler.Data;

namespace ZedIdler.Services
{
    /// <summary>
    /// Static access point for <see cref="BalanceConfig"/> so pure-C# classes
    /// (LevelSystem, PerkSystem, combat math) can read tuning values without
    /// threading the config through every constructor.
    /// </summary>
    /// <remarks>
    /// Populated once at boot by <see cref="BalanceConfigRegistrar"/>. Every
    /// accessor falls back to a sane default when no config is assigned, so the
    /// game never hard-depends on the asset existing (unit tests, early boot).
    /// </remarks>
    public static class BalanceRuntime
    {
        private static BalanceConfig _config;
        public static void Set(BalanceConfig config) => _config = config;
        public static bool HasConfig => _config != null;

        public static long XpRequiredForLevel(int level)
        {
            if (_config != null) return _config.XpRequiredForLevel(level);
            if (level < 1) level = 1;
            long n = level;
            return (n * 100L) + (n * n * 10L);
        }

        public static int   MaxLevel              => _config != null ? _config.MaxLevel : 100;
        public static int   CampXpDivisor         => _config != null ? _config.CampXpDivisor : 500;
        public static float CritMultiplier        => _config != null ? _config.CritMultiplier : 1.75f;
        public static float CritChancePerCombat   => _config != null ? _config.CritChancePerCombat : 0.001f;
        public static int   HpPerEndurance        => _config != null ? _config.HpPerEndurance : 10;
        public static float BaseTurnSeconds       => _config != null ? _config.BaseTurnSeconds : 1f;
        public static float BaseCarryKg           => _config != null ? _config.BaseCarryKg : 40f;
        public static float StrengthCapDivisor    => _config != null ? _config.StrengthCapDivisor : 200f;
        public static float DemandBaseline        => _config != null ? _config.DemandBaseline : 50f;
        public static float DemandGainPerBuy      => _config != null ? _config.DemandGainPerBuy : 5f;
        public static float DemandDecayPerHour    => _config != null ? _config.DemandDecayPerHour : 4f;
        public static float FactionDiscountPerRank=> _config != null ? _config.FactionDiscountPerRank : 0.02f;
        public static float DailyOfflineCapHours  => _config != null ? _config.DailyOfflineCapHours : 24f;
        public static float SurvivorPermLossChance      => _config != null ? _config.SurvivorPermLossChance : 0.05f;
        public static float SurvivorRecoverableChance   => _config != null ? _config.SurvivorRecoverableChance : 0.20f;

        // Prestige tuning
        public static float PrestigeK            => _config != null ? _config.PrestigeK : 5f;
        public static float PrestigeD            => _config != null ? _config.PrestigeD : 850f;
        public static int   PrestigeGateCampLevel=> _config != null ? _config.PrestigeGateCampLevel : 25;

        public static float RecyclerProBonus(int stacks)
        {
            if (_config == null) return stacks switch { 0 => 0f, 1 => 0.10f, 2 => 0.20f, 3 => 0.35f, _ => 0.35f + (stacks - 3) * 0.05f };
            return stacks switch { 0 => 0f, 1 => _config.RecyclerProStack1, 2 => _config.RecyclerProStack2, 3 => _config.RecyclerProStack3, _ => _config.RecyclerProStack3 + (stacks - 3) * 0.05f };
        }
    }

    /// <summary>Bootstrap component that loads the BalanceConfig and registers it.</summary>
    [DisallowMultipleComponent]
    public sealed class BalanceConfigRegistrar : MonoBehaviour
    {
        [SerializeField] private BalanceConfig config;
        [SerializeField] private string resourcesPath = "Balance/BalanceConfig";

        private void Awake()
        {
            DontDestroyOnLoad(gameObject);
            if (config == null) config = Resources.Load<BalanceConfig>(resourcesPath);
            if (config == null) { Debug.LogWarning("[Balance] No BalanceConfig found; using defaults."); return; }
            BalanceRuntime.Set(config);
            ServiceLocator.Register<BalanceConfig>(config);
        }

        private void OnDestroy() => ServiceLocator.Unregister<BalanceConfig>();
    }
}
