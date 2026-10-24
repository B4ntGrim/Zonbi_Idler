// Assets/Scripts/Data/Perk.cs
using UnityEngine;

namespace ZedIdler.Data
{
    /// <summary>
    /// Categories a perk can belong to. Used for filtering and pool building.
    /// </summary>
    public enum PerkCategory
    {
        Combat    = 0,
        Survival  = 1,
        Crafting  = 2,
        Traversal = 3,
        Social    = 4
    }

    /// <summary>
    /// Static data describing a single perk. Authored as a <see cref="ScriptableObject"/>
    /// asset so designers can tune values and add new perks without code changes.
    /// </summary>
    /// <remarks>
    /// Create via: Right-click in Project → Create → ZedIdler → Perk.
    /// Asset name convention: <c>Perk_QuickHands</c>, <c>Perk_SteelGrip</c>, etc.
    ///
    /// Each perk can be stacked up to 3 times per survivor (per spec). The effect
    /// values are interpreted by individual game systems (Combat, Crafting, etc.) —
    /// this class only holds the data contract.
    /// </remarks>
    [CreateAssetMenu(menuName = "ZedIdler/Perk", fileName = "Perk_New", order = 20)]
    public sealed class Perk : ScriptableObject
    {
        [Header("Identity")]
        [SerializeField] private string perkId;
        [SerializeField] private string displayName;
        [SerializeField, TextArea(2, 4)] private string description;
        [SerializeField] private PerkCategory category;
        [SerializeField] private Sprite icon;

        [Header("Stacking")]
        [SerializeField, Range(1, 3)] private int maxStacks = 3;

        [Header("Effects (interpreted by gameplay systems)")]
        [Tooltip("Per-stack additive bonus. Combat/Crafting/etc. read this value.")]
        [SerializeField] private float effectPerStack = 0.05f;

        [Tooltip("Optional opaque effect identifier, e.g. 'crit_chance' or 'craft_speed'.")]
        [SerializeField] private string effectKey;

        // ─── Read-only accessors ─────────────────────────────────────────────
        public string       PerkId         => perkId;
        public string       DisplayName    => displayName;
        public string       Description    => description;
        public PerkCategory Category       => category;
        public Sprite       Icon           => icon;
        public int          MaxStacks      => maxStacks;
        public float        EffectPerStack => effectPerStack;
        public string       EffectKey      => effectKey;
    }
}
