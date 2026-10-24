// Assets/Scripts/Data/DailyReward.cs
using System;
using UnityEngine;

namespace ZedIdler.Data
{
    /// <summary>
    /// One day's reward in the rolling daily-claim ladder. The streak index
    /// (1-based) maps to an entry; the ladder loops after its last entry, with
    /// milestone days (7, 14, 30) carrying bigger payouts.
    /// </summary>
    [Serializable]
    public struct DailyRewardEntry
    {
        public int streakDay;            // 1-based position in the ladder
        public DailyRewardKind kind;
        public string itemId;            // for Item / WeaponCrate kinds
        public int amount;
        public bool isMilestone;         // bigger visual treatment
    }

    public enum DailyRewardKind
    {
        Credits      = 0,
        Materials    = 1,
        RmatShards   = 2,
        WeaponCrate  = 3,
        LegacyPoints = 4
    }

    [CreateAssetMenu(menuName = "ZedIdler/Daily Reward Ladder", fileName = "DailyRewards", order = 142)]
    public sealed class DailyRewardLadder : ScriptableObject
    {
        [SerializeField] private DailyRewardEntry[] entries;
        [Tooltip("Streak multiplier applied to amount: 1 + (streak-1) × this, capped.")]
        [SerializeField, Range(0f, 0.5f)] private float streakBonusPerDay = 0.05f;
        [SerializeField, Range(1f, 5f)] private float streakBonusCap = 3f;

        public DailyRewardEntry[] Entries => entries ?? Array.Empty<DailyRewardEntry>();
        public float StreakBonusPerDay => streakBonusPerDay;
        public float StreakBonusCap => streakBonusCap;

        /// <summary>Entry for a given streak day (loops over the ladder).</summary>
        public DailyRewardEntry EntryForStreak(int streakDay)
        {
            if (Entries.Length == 0) return default;
            int idx = (Mathf.Max(1, streakDay) - 1) % Entries.Length;
            return Entries[idx];
        }

        public float StreakMultiplier(int streakDay)
            => Mathf.Min(streakBonusCap, 1f + (Mathf.Max(1, streakDay) - 1) * streakBonusPerDay);
    }
}
