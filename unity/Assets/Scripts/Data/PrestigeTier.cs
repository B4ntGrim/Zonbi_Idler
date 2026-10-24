// Assets/Scripts/Data/PrestigeTier.cs
using System;
using UnityEngine;

namespace ZedIdler.Data
{
    /// <summary>
    /// Escalating prestige tier (Survivor → Veteran → Legend → …). Each tier
    /// has a Legacy-Point threshold and a one-time milestone reward.
    /// </summary>
    [Serializable]
    public struct PrestigeTier
    {
        public string tierName;
        public int requiredTotalLegacyPoints;
        public string milestoneRewardKey; // e.g. "squad_slot", "exotic_weapon"
        public int milestoneRewardAmount;
    }

    /// <summary>Container SO holding the ordered tier ladder.</summary>
    [CreateAssetMenu(menuName = "ZedIdler/Prestige Tier Ladder", fileName = "PrestigeTiers", order = 141)]
    public sealed class PrestigeTierLadder : ScriptableObject
    {
        [SerializeField] private PrestigeTier[] tiers;
        public PrestigeTier[] Tiers => tiers ?? Array.Empty<PrestigeTier>();

        /// <summary>Highest tier index whose threshold is met by lifetimeLegacyPoints.</summary>
        public int CurrentTierIndex(long lifetimeLegacyPoints)
        {
            int idx = 0;
            for (int i = 0; i < Tiers.Length; i++)
                if (lifetimeLegacyPoints >= Tiers[i].requiredTotalLegacyPoints) idx = i;
            return idx;
        }
    }
}
