// Assets/Scripts/Systems/PerkSystem.cs
using System;
using System.Collections.Generic;
using UnityEngine;
using ZedIdler.Data;

namespace ZedIdler.Systems
{
    /// <summary>
    /// Per-survivor perk system. Detects prime-level unlocks, rolls three random
    /// choices for the player, applies stacking rules, and exposes a one-time reset.
    /// </summary>
    /// <remarks>
    /// Spec compliance:
    /// • Perks unlock at every prime level (2, 3, 5, 7, 11 … 97) — 25 total.
    /// • Player chooses 1 of 3 randomly-rolled options per unlock.
    /// • Each perk can be stacked up to <c>perk.MaxStacks</c> (default 3) times.
    /// • One perk reset is allowed per character lifetime.
    /// </remarks>
    [Serializable]
    public sealed class PerkSystem
    {
        /// <summary>All 25 prime-number unlock levels from 1 to 100.</summary>
        public static readonly int[] PrimeUnlockLevels =
        {
            2, 3, 5, 7, 11, 13, 17, 19, 23, 29,
            31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
            73, 79, 83, 89, 97
        };

        public const int ChoicesPerUnlock = 3;

        // Serialized state ───────────────────────────────────────────────────
        [SerializeField] private int pendingUnlocks = 0;
        [SerializeField] private bool resetUsed = false;

        // perkId → stack count
        [SerializeField] private List<PerkStackEntry> stacks = new List<PerkStackEntry>();

        // Static catalog reference — populated externally (e.g. by a CatalogService).
        private List<Perk> _catalog;

        // ─── Public state ─────────────────────────────────────────────────────
        public int  PendingUnlocks => pendingUnlocks;
        public bool ResetUsed      => resetUsed;
        public IReadOnlyList<PerkStackEntry> Stacks => stacks;

        /// <summary>Fired when a level-up triggers a perk unlock. (level, choices)</summary>
        public event Action<int, IReadOnlyList<Perk>> OnPerkUnlocked;

        /// <summary>Fired after the player picks a perk. (perk, newStackCount)</summary>
        public event Action<Perk, int> OnPerkSelected;

        /// <summary>Fired when the player invokes the one-time reset.</summary>
        public event Action OnPerksReset;

        /// <summary>
        /// Bind the perk catalog the system rolls from. Typically called once
        /// from a CatalogService that loaded all <see cref="Perk"/> assets.
        /// </summary>
        public void BindCatalog(IEnumerable<Perk> catalog)
        {
            _catalog = new List<Perk>(catalog);
        }

        /// <summary>
        /// Returns true if <paramref name="level"/> is a perk-unlock level (prime ≤ 97).
        /// </summary>
        public static bool IsPerkUnlockLevel(int level)
        {
            if (level < 2 || level > 97) return false;
            for (int i = 0; i < PrimeUnlockLevels.Length; i++)
            {
                if (PrimeUnlockLevels[i] == level) return true;
                if (PrimeUnlockLevels[i] > level) return false;
            }
            return false;
        }

        /// <summary>
        /// Hook this into <see cref="LevelSystem.OnLevelUp"/>. Adds a pending
        /// unlock and rolls three choices when the new level is prime.
        /// </summary>
        public void HandleLevelUp(int oldLevel, int newLevel)
        {
            // Award an unlock for every prime level crossed (handles XP overflow).
            for (int lvl = oldLevel + 1; lvl <= newLevel; lvl++)
            {
                if (IsPerkUnlockLevel(lvl))
                {
                    pendingUnlocks++;
                    var choices = RollChoices();
                    OnPerkUnlocked?.Invoke(lvl, choices);
                }
            }
        }

        /// <summary>
        /// Roll <see cref="ChoicesPerUnlock"/> distinct perks from the catalog,
        /// filtered to those that aren't already at max stacks.
        /// </summary>
        public IReadOnlyList<Perk> RollChoices()
        {
            if (_catalog == null || _catalog.Count == 0)
            {
                Debug.LogWarning("[PerkSystem] Catalog not bound; cannot roll choices.");
                return Array.Empty<Perk>();
            }

            // Filter out maxed-out perks.
            var pool = new List<Perk>();
            foreach (var p in _catalog)
            {
                if (GetStackCount(p) < p.MaxStacks) pool.Add(p);
            }

            // Fisher-Yates partial shuffle for up to ChoicesPerUnlock picks.
            int take = Mathf.Min(ChoicesPerUnlock, pool.Count);
            var result = new List<Perk>(take);
            for (int i = 0; i < take; i++)
            {
                int j = UnityEngine.Random.Range(i, pool.Count);
                (pool[i], pool[j]) = (pool[j], pool[i]);
                result.Add(pool[i]);
            }
            return result;
        }

        /// <summary>
        /// Player commits a perk choice. Consumes one pending unlock.
        /// Returns true if the selection was valid and applied.
        /// </summary>
        public bool SelectPerk(Perk perk)
        {
            if (perk == null) return false;
            if (pendingUnlocks <= 0)
            {
                Debug.LogWarning("[PerkSystem] No pending unlocks to spend.");
                return false;
            }

            int current = GetStackCount(perk);
            if (current >= perk.MaxStacks)
            {
                Debug.LogWarning($"[PerkSystem] Perk '{perk.DisplayName}' is already maxed.");
                return false;
            }

            int newCount = current + 1;
            SetStackCount(perk, newCount);
            pendingUnlocks--;
            OnPerkSelected?.Invoke(perk, newCount);
            return true;
        }

        /// <summary>One-time perk reset. Clears all stacks and consumes the lifetime use.</summary>
        public bool ResetPerks()
        {
            if (resetUsed) return false;
            int refunded = 0;
            foreach (var s in stacks) refunded += s.count;
            stacks.Clear();
            pendingUnlocks += refunded;
            resetUsed = true;
            OnPerksReset?.Invoke();
            return true;
        }

        /// <summary>How many stacks of the given perk this survivor has.</summary>
        public int GetStackCount(Perk perk)
        {
            if (perk == null) return 0;
            for (int i = 0; i < stacks.Count; i++)
            {
                if (stacks[i].perkId == perk.PerkId) return stacks[i].count;
            }
            return 0;
        }

        private void SetStackCount(Perk perk, int count)
        {
            for (int i = 0; i < stacks.Count; i++)
            {
                if (stacks[i].perkId == perk.PerkId)
                {
                    var e = stacks[i]; e.count = count; stacks[i] = e;
                    return;
                }
            }
            stacks.Add(new PerkStackEntry { perkId = perk.PerkId, count = count });
        }

        [Serializable]
        public struct PerkStackEntry
        {
            public string perkId;
            public int count;
        }
    }
}
