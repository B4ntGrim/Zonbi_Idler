// Assets/Scripts/Data/CharacterType.cs
using UnityEngine;

namespace ZedIdler.Data
{
    /// <summary>
    /// All 30 canonical character types. Order is locked for save compatibility —
    /// append new types at the end, never reorder or remove.
    /// </summary>
    public enum CharacterType
    {
        Scavenger        = 0,
        Fighter          = 1,
        Medic            = 2,
        Scholar          = 3,
        Engineer         = 4,
        Sniper           = 5,
        Scout            = 6,
        Chemist          = 7,
        Mechanic         = 8,
        Tactician        = 9,
        Hunter           = 10,
        Smuggler         = 11,
        Soldier          = 12,
        Hacker           = 13,
        Cook             = 14,
        Preacher         = 15,
        Brawler          = 16,
        Trapper          = 17,
        Drifter          = 18,
        Farmer           = 19,
        Arsonist         = 20,
        MedicVeteran     = 21,
        Demolitionist    = 22,
        Guard            = 23,
        Trader           = 24,
        Athlete          = 25,
        Survivalist      = 26,
        Sharpshooter     = 27,
        Quartermaster    = 28,
        Shadow           = 29
    }

    /// <summary>
    /// Data contract for a character type: starting stats, role description, and
    /// flavor metadata. One <see cref="ScriptableObject"/> asset per type, authored
    /// by designers in the inspector — no hardcoded balance values in code.
    /// </summary>
    /// <remarks>
    /// Create via: Right-click in Project → Create → ZedIdler → Character Type.
    /// Asset name convention: <c>CT_Scavenger</c>, <c>CT_Fighter</c>, etc.
    /// </remarks>
    [CreateAssetMenu(menuName = "ZedIdler/Character Type", fileName = "CT_NewType", order = 10)]
    public sealed class CharacterTypeDefinition : ScriptableObject
    {
        [Header("Identity")]
        [SerializeField] private CharacterType type;
        [SerializeField] private string displayName;
        [SerializeField, TextArea(2, 4)] private string primaryRole;
        [SerializeField, TextArea(3, 6)] private string description;
        [SerializeField] private Sprite portrait;

        [Header("Starting Stats (1–100)")]
        [SerializeField, Range(1, 100)] private int startingStrength   = 10;
        [SerializeField, Range(1, 100)] private int startingAgility    = 10;
        [SerializeField, Range(1, 100)] private int startingEndurance  = 10;
        [SerializeField, Range(1, 100)] private int startingIntellect  = 10;
        [SerializeField, Range(1, 100)] private int startingScavenging = 10;
        [SerializeField, Range(1, 100)] private int startingCombat     = 10;
        [SerializeField, Range(1, 100)] private int startingSurvival   = 10;

        [Header("Role Bonus (additive multiplier, e.g. 0.25 = +25%)")]
        [SerializeField, Range(0f, 1f)] private float roleBonusMultiplier = 0.25f;
        [SerializeField, TextArea(1, 3)] private string roleBonusDescription;

        // ─── Read-only accessors ─────────────────────────────────────────────
        public CharacterType Type             => type;
        public string        DisplayName      => displayName;
        public string        PrimaryRole      => primaryRole;
        public string        Description      => description;
        public Sprite        Portrait         => portrait;
        public int           StartingStrength   => startingStrength;
        public int           StartingAgility    => startingAgility;
        public int           StartingEndurance  => startingEndurance;
        public int           StartingIntellect  => startingIntellect;
        public int           StartingScavenging => startingScavenging;
        public int           StartingCombat     => startingCombat;
        public int           StartingSurvival   => startingSurvival;
        public float         RoleBonusMultiplier   => roleBonusMultiplier;
        public string        RoleBonusDescription  => roleBonusDescription;
    }
}
