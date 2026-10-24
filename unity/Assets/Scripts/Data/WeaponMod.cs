// Assets/Scripts/Data/WeaponMod.cs
using System;
using UnityEngine;

namespace ZedIdler.Data
{
    /// <summary>
    /// Designer-authored weapon mod. Installs into a weapon socket and applies
    /// additive bonuses to the host weapon's stats.
    /// </summary>
    [CreateAssetMenu(menuName = "ZedIdler/Weapon Mod", fileName = "WeaponMod_New", order = 111)]
    public sealed class WeaponMod : ScriptableObject
    {
        [Header("Identity")]
        [SerializeField] private string modId;
        [SerializeField] private string displayName;
        [SerializeField, TextArea(1, 4)] private string description;
        [SerializeField] private WeaponModCategory category;

        [Header("Effect (additive unless noted)")]
        [SerializeField] private float damageBonus;          // flat add to damage roll
        [SerializeField] private float damageMultBonus;      // adds to weapon.damageMultiplier
        [SerializeField] private int   magazineBonus;        // +mag size
        [SerializeField] private int   durabilityMaxBonus;   // +max durability
        [SerializeField] private float critChanceBonus;      // additive crit
        [SerializeField] private float accuracyBonus;        // additive accuracy
        [SerializeField] private float cleanlinessLossReduction; // -% cleanliness loss per use

        [Header("Compatibility")]
        [Tooltip("If true, this mod can only install on weapons that allow this exact category in their socket list.")]
        [SerializeField] private bool requiresCategoryMatch = true;

        public string  ModId              => modId;
        public string  DisplayName        => displayName;
        public string  Description        => description;
        public WeaponModCategory Category => category;
        public float   DamageBonus        => damageBonus;
        public float   DamageMultBonus    => damageMultBonus;
        public int     MagazineBonus      => magazineBonus;
        public int     DurabilityMaxBonus => durabilityMaxBonus;
        public float   CritChanceBonus    => critChanceBonus;
        public float   AccuracyBonus      => accuracyBonus;
        public float   CleanlinessLossReduction => cleanlinessLossReduction;
        public bool    RequiresCategoryMatch    => requiresCategoryMatch;
    }
}
