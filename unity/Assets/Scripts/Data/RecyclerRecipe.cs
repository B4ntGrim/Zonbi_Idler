// Assets/Scripts/Data/RecyclerRecipe.cs
using System;
using UnityEngine;

namespace ZedIdler.Data
{
    /// <summary>
    /// Static data describing one recycler conversion. Authored as a
    /// <see cref="ScriptableObject"/> asset — designers add new recipes by
    /// dropping new assets into <c>Assets/Data/RecyclerRecipes/</c> without
    /// touching code.
    /// </summary>
    /// <remarks>
    /// Create via: Right-click in Project → Create → ZedIdler → Recycler Recipe.
    /// Asset name convention: <c>RR_MetalScraps_To_SteelIngot</c>.
    ///
    /// Conversion model: <see cref="inputs"/> is a small ordered list of
    /// ingredient stacks; on craft start the recycler consumes those quantities
    /// from <c>IInventoryService</c>. After <see cref="processSeconds"/> elapse,
    /// it emits <see cref="outputs"/> back to the inventory.
    /// </remarks>
    [CreateAssetMenu(menuName = "ZedIdler/Recycler Recipe", fileName = "RR_New", order = 60)]
    public sealed class RecyclerRecipe : ScriptableObject
    {
        [Header("Identity")]
        [SerializeField] private string recipeId;
        [SerializeField] private string displayName;
        [SerializeField, TextArea(1, 3)] private string description;
        [SerializeField] private Sprite icon;

        [Header("Inputs / Outputs")]
        [SerializeField] private RecipeStack[] inputs;
        [SerializeField] private RecipeStack[] outputs;

        [Header("Processing")]
        [Tooltip("Real-world seconds to process one craft.")]
        [SerializeField, Range(1f, 600f)] private float processSeconds = 10f;

        [Tooltip("Camp level required to see/queue this recipe.")]
        [SerializeField, Range(0, 100)] private int requiredCampLevel = 0;

        [Tooltip("Tier rank for UI grouping (0=basic, 5=apex).")]
        [SerializeField, Range(0, 5)] private int tier = 0;

        // ─── Accessors ────────────────────────────────────────────────────────
        public string         RecipeId         => recipeId;
        public string         DisplayName      => displayName;
        public string         Description      => description;
        public Sprite         Icon             => icon;
        public RecipeStack[]  Inputs           => inputs;
        public RecipeStack[]  Outputs          => outputs;
        public float          ProcessSeconds   => processSeconds;
        public int            RequiredCampLevel=> requiredCampLevel;
        public int            Tier             => tier;
    }

    /// <summary>One ingredient or product stack.</summary>
    [Serializable]
    public struct RecipeStack
    {
        public string itemId;
        public int quantity;
        public LootRarity outputRarity; // Used only for output stacks; inputs ignore.
    }
}
