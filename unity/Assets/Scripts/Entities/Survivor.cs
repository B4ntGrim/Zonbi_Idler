// Assets/Scripts/Entities/Survivor.cs
using System;
using UnityEngine;
using ZedIdler.Data;
using ZedIdler.Systems;

namespace ZedIdler.Entities
{
    /// <summary>
    /// A single survivor: identity + stats + level + perks + character type.
    /// Pure C# class (no MonoBehaviour) so survivors can live in lists, be serialized
    /// to JSON, and persist independently of any scene.
    /// </summary>
    /// <remarks>
    /// Composition:
    /// • <see cref="SurvivorStats"/> — the 7 stats (1–100 each).
    /// • <see cref="LevelSystem"/>   — XP, level, formula-based thresholds.
    /// • <see cref="PerkSystem"/>    — prime-level unlocks, stacking, reset.
    ///
    /// Wiring: in <c>Initialize()</c>, the survivor connects its LevelSystem's
    /// OnLevelUp event to its PerkSystem's HandleLevelUp method, so perks unlock
    /// automatically whenever XP crosses a prime threshold.
    /// </remarks>
    [Serializable]
    public sealed class Survivor
    {
        [SerializeField] private string id;
        [SerializeField] private string displayName;
        [SerializeField] private CharacterType characterType;
        [SerializeField] private SurvivorStats stats = new SurvivorStats();
        [SerializeField] private LevelSystem level = new LevelSystem();
        [SerializeField] private PerkSystem perks = new PerkSystem();

        // ─── Public accessors ─────────────────────────────────────────────────
        public string        Id            => id;
        public string        DisplayName   => displayName;
        public CharacterType CharacterType => characterType;
        public SurvivorStats Stats         => stats;
        public LevelSystem   Level         => level;
        public PerkSystem    Perks         => perks;

        /// <summary>Fired when the character type is applied (creation or migration).</summary>
        public event Action<CharacterType> OnCharacterTypeAssigned;

        /// <summary>
        /// Construct a new survivor from a <see cref="CharacterTypeDefinition"/> asset.
        /// Wires internal event subscriptions and applies starting stats.
        /// </summary>
        public static Survivor Create(string id, string displayName, CharacterTypeDefinition def)
        {
            if (def == null) throw new ArgumentNullException(nameof(def));

            var s = new Survivor
            {
                id = id ?? Guid.NewGuid().ToString("N"),
                displayName = displayName ?? "Survivor",
                characterType = def.Type,
            };
            s.stats.SetAll(
                def.StartingStrength, def.StartingAgility,   def.StartingEndurance,
                def.StartingIntellect, def.StartingScavenging, def.StartingCombat,
                def.StartingSurvival
            );
            s.Initialize();
            s.OnCharacterTypeAssigned?.Invoke(def.Type);
            return s;
        }

        /// <summary>
        /// Call after deserialization (or on construction) to re-bind event wires
        /// between subsystems. JsonUtility loses event handlers when loading a save.
        /// </summary>
        public void Initialize()
        {
            // Disconnect first to prevent duplicate handlers if called twice.
            level.OnLevelUp -= perks.HandleLevelUp;
            level.OnLevelUp += perks.HandleLevelUp;
        }

        /// <summary>
        /// Convenience method to award XP. Funnels through <see cref="LevelSystem"/>,
        /// which will cascade level-ups and trigger perk unlocks via the event chain.
        /// </summary>
        public void AwardXp(long xp) => level.AwardXp(xp);
    }
}
