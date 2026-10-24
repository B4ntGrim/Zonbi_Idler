// Assets/Scripts/Data/SoundBank.cs
using System;
using UnityEngine;

namespace ZedIdler.Data
{
    /// <summary>
    /// A named pool of <see cref="SoundDefinition"/> variations that share an
    /// event id. Each play picks one entry randomly (weighted) so events like
    /// "zombie death" sound fresh across many encounters.
    /// </summary>
    [CreateAssetMenu(menuName = "ZedIdler/Sound Bank", fileName = "SoundBank_New", order = 121)]
    public sealed class SoundBank : ScriptableObject
    {
        [Header("Identity")]
        [SerializeField] private string bankId; // event key, e.g. "zombie_death", "ui_click"
        [SerializeField] private string displayName;

        [Header("Variants")]
        [SerializeField] private VariantEntry[] variants;

        public string BankId      => bankId;
        public string DisplayName => displayName;
        public VariantEntry[] Variants => variants ?? Array.Empty<VariantEntry>();

        public SoundDefinition PickRandom(System.Random rng)
        {
            if (variants == null || variants.Length == 0) return null;
            float total = 0f;
            for (int i = 0; i < variants.Length; i++) total += Mathf.Max(0.01f, variants[i].weight);
            float pick = (float)(rng.NextDouble() * total);
            float acc = 0f;
            for (int i = 0; i < variants.Length; i++)
            {
                acc += Mathf.Max(0.01f, variants[i].weight);
                if (pick <= acc) return variants[i].sound;
            }
            return variants[variants.Length - 1].sound;
        }
    }

    [Serializable]
    public struct VariantEntry
    {
        public SoundDefinition sound;
        [Range(0.01f, 100f)] public float weight;
    }
}
