// Assets/Scripts/Data/Faction.cs
using System;
using UnityEngine;

namespace ZedIdler.Data
{
    /// <summary>
    /// Static data describing one faction. Authored as a ScriptableObject so
    /// designers can tune identity, rivalries, and service ladders without code.
    /// </summary>
    /// <remarks>
    /// Create via: Right-click → Create → ZedIdler → Faction.
    /// Asset name convention: <c>Faction_Concordance</c>, <c>Faction_IronMarch</c>, etc.
    ///
    /// Reputation thresholds use the global ranks defined on
    /// <see cref="ZedIdler.Services.FactionService"/> (Stranger → Veneerated).
    /// Each rank unlocks one entry from <see cref="servicesPerRank"/>.
    /// </remarks>
    [CreateAssetMenu(menuName = "ZedIdler/Faction", fileName = "Faction_New", order = 90)]
    public sealed class Faction : ScriptableObject
    {
        [Header("Identity")]
        [SerializeField] private string factionId;
        [SerializeField] private string displayName;
        [SerializeField, TextArea(2, 5)] private string description;
        [SerializeField] private Color color = Color.gray;
        [SerializeField] private Sprite icon;

        [Header("Stat Synergy (used by UI hints / role bonuses)")]
        [SerializeField] private CharacterType[] synergyTypes;

        [Header("Starting Reputation")]
        [SerializeField] private int baseReputation = 0;

        [Header("Rivalries (static)")]
        [Tooltip("Completing a contract for THIS faction reduces rep with these.")]
        [SerializeField] private string[] rivalFactionIds;

        [Header("Services Per Rank")]
        [Tooltip("Index 0 = Stranger, 1 = Neutral, 2 = Known, 3 = Allied, 4 = Trusted, 5 = Honored, 6 = Venerated. " +
                 "One service label per rank.")]
        [SerializeField] private string[] servicesPerRank = new string[7];

        // ─── Accessors ────────────────────────────────────────────────────────
        public string         FactionId        => factionId;
        public string         DisplayName      => displayName;
        public string         Description      => description;
        public Color          Color            => color;
        public Sprite         Icon             => icon;
        public CharacterType[] SynergyTypes    => synergyTypes ?? Array.Empty<CharacterType>();
        public int            BaseReputation   => baseReputation;
        public string[]       RivalFactionIds  => rivalFactionIds ?? Array.Empty<string>();
        public string[]       ServicesPerRank  => servicesPerRank ?? Array.Empty<string>();

        public string GetServiceAtRank(int rankIndex)
        {
            if (servicesPerRank == null) return null;
            if (rankIndex < 0 || rankIndex >= servicesPerRank.Length) return null;
            return servicesPerRank[rankIndex];
        }
    }
}
