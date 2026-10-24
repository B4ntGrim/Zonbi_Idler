// Assets/Scripts/Data/TutorialStep.cs
using UnityEngine;

namespace ZedIdler.Data
{
    /// <summary>
    /// One read-and-dismiss tutorial card. Authored as a ScriptableObject so
    /// designers can edit copy, reorder, and localize without code.
    /// </summary>
    [CreateAssetMenu(menuName = "ZedIdler/Tutorial Step", fileName = "Tutorial_New", order = 140)]
    public sealed class TutorialStep : ScriptableObject
    {
        [Header("Identity")]
        [SerializeField] private string stepId;
        [SerializeField, Range(0, 100)] private int order;

        [Header("Content")]
        [Tooltip("Localization key for the title. Falls back to titleFallback if not found.")]
        [SerializeField] private string titleKey;
        [SerializeField] private string titleFallback;
        [Tooltip("Localization key for the body. Falls back to bodyFallback.")]
        [SerializeField] private string bodyKey;
        [SerializeField, TextArea(3, 8)] private string bodyFallback;
        [SerializeField] private Sprite illustration;

        [Header("Targeting (optional)")]
        [Tooltip("System this card introduces — used for the About-page grouping.")]
        [SerializeField] private TutorialTopic topic = TutorialTopic.General;

        public string        StepId        => stepId;
        public int           Order         => order;
        public string        TitleKey      => titleKey;
        public string        TitleFallback => titleFallback;
        public string        BodyKey       => bodyKey;
        public string        BodyFallback  => bodyFallback;
        public Sprite        Illustration  => illustration;
        public TutorialTopic Topic         => topic;
    }

    public enum TutorialTopic
    {
        General      = 0,
        ModeSelect   = 1,
        SurvivorStats= 2,
        Schedule     = 3,
        Wandering    = 4,
        LootBackpack = 5,
        Recycler     = 6,
        Marketplace  = 7,
        Factions     = 8,
        Contracts    = 9
    }
}
