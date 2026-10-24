// Assets/Scripts/Systems/LevelSystem.cs
using System;
using UnityEngine;

namespace ZedIdler.Systems
{
    /// <summary>
    /// Per-survivor leveling system. Tracks XP, computes the next-level threshold
    /// using the canonical formula, and fires events on every level-up.
    /// </summary>
    /// <remarks>
    /// Formula: <c>XP Required = (level * 100) + (level² * 10)</c>
    /// Level 1 → 110 XP, Level 10 → 2000 XP, Level 100 → 110,000 XP.
    ///
    /// One <see cref="LevelSystem"/> instance per survivor; do not share. The level
    /// system intentionally does not know about <see cref="PerkSystem"/> — connect
    /// them via the <see cref="OnLevelUp"/> event in the owning Survivor entity.
    /// </remarks>
    [Serializable]
    public sealed class LevelSystem
    {
        public const int MinLevel = 1;
        public const int MaxLevel = 100;

        [SerializeField, Range(MinLevel, MaxLevel)] private int level = MinLevel;
        [SerializeField] private long totalXp = 0;
        [SerializeField] private long currentLevelXp = 0;

        // ─── Public accessors ─────────────────────────────────────────────────
        public int  Level          => level;
        public long TotalXp        => totalXp;
        public long CurrentLevelXp => currentLevelXp;
        public long XpForNextLevel => GetXpRequiredForLevel(level);
        public bool IsMaxLevel     => level >= MaxLevel;
        public float NormalizedProgress => IsMaxLevel ? 1f
            : Mathf.Clamp01((float)currentLevelXp / XpForNextLevel);

        /// <summary>Fired each time the survivor levels up. (oldLevel, newLevel)</summary>
        public event Action<int, int> OnLevelUp;

        /// <summary>Fired whenever XP is gained (even without a level-up). (xpGained, totalXp)</summary>
        public event Action<long, long> OnXpGained;

        /// <summary>
        /// Canonical XP formula. Returns the XP required to advance from
        /// <paramref name="fromLevel"/> to <paramref name="fromLevel"/>+1.
        /// Reads coefficients from BalanceRuntime (tunable via BalanceConfig).
        /// </summary>
        public static long GetXpRequiredForLevel(int fromLevel)
        {
            if (fromLevel < MinLevel) fromLevel = MinLevel;
            return ZedIdler.Services.BalanceRuntime.XpRequiredForLevel(fromLevel);
        }

        /// <summary>Cumulative XP needed to reach <paramref name="targetLevel"/> from level 1.</summary>
        public static long GetCumulativeXpToReach(int targetLevel)
        {
            if (targetLevel <= MinLevel) return 0L;
            long sum = 0L;
            for (int i = MinLevel; i < targetLevel; i++)
            {
                sum += GetXpRequiredForLevel(i);
            }
            return sum;
        }

        /// <summary>
        /// Award XP. Triggers <see cref="OnXpGained"/> and zero or more <see cref="OnLevelUp"/>
        /// events depending on overflow.
        /// </summary>
        public void AwardXp(long xp)
        {
            if (xp <= 0 || IsMaxLevel) return;

            totalXp        += xp;
            currentLevelXp += xp;
            OnXpGained?.Invoke(xp, totalXp);

            // Cascade level-ups (handles huge XP grants spanning multiple levels).
            while (!IsMaxLevel && currentLevelXp >= XpForNextLevel)
            {
                currentLevelXp -= XpForNextLevel;
                int oldLevel = level;
                level++;
                OnLevelUp?.Invoke(oldLevel, level);
            }

            // Hard-cap any leftover XP at max level.
            if (IsMaxLevel) currentLevelXp = 0;
        }

        /// <summary>
        /// Directly set level + XP (e.g. after loading a save). Skips OnLevelUp events.
        /// </summary>
        public void Hydrate(int newLevel, long newTotalXp, long newCurrentLevelXp)
        {
            level          = Mathf.Clamp(newLevel, MinLevel, MaxLevel);
            totalXp        = Math.Max(0, newTotalXp);
            currentLevelXp = Math.Max(0, newCurrentLevelXp);
        }
    }
}
