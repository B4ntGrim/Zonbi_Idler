// Assets/Scripts/Data/ZombieAbility.cs
using UnityEngine;

namespace ZedIdler.Data
{
    /// <summary>
    /// Special ability flags a zombie can carry, beyond the base
    /// HP/damage/initiative model. Combat systems opt-in to each.
    /// </summary>
    /// <remarks>
    /// Designed as a [Flags] enum so a single zombie can carry multiple
    /// abilities (e.g. SelfHeal + SummonOnHit). Order is locked for save
    /// compatibility.
    /// </remarks>
    [System.Flags]
    public enum ZombieAbility
    {
        None              = 0,
        SelfHeal          = 1 << 0,  // Regenerates HP each turn while alive
        AoEOnDeath        = 1 << 1,  // Explodes for AOE damage to whole squad
        SummonOnHit       = 1 << 2,  // Spawns a Standard zombie when struck
        DrainWeaponDur    = 1 << 3,  // Each hit costs +N durability on attacker's weapon
        EnrageBelow50Hp   = 1 << 4,  // +50% damage when below 50% HP
        ReflectDamage     = 1 << 5,  // Returns % of incoming damage to attacker
        ArmorOnHit        = 1 << 6,  // Gains stacking armor each turn it survives
        InfectsOnHit      = 1 << 7,  // Hit survivor takes lingering DoT
        TeleportEvasion   = 1 << 8,  // Chance to dodge a hit entirely
        EMPPulse          = 1 << 9,  // Disables ranged firearms for N turns
        SwarmCall         = 1 << 10, // Increases encounter frequency by 50%
        RMatCorrupted     = 1 << 11  // Drops bonus RMAT shards
    }

    public enum ZombieVariantTheme
    {
        Default     = 0,
        Frozen      = 1,
        Burning     = 2,
        Acidic      = 3,
        Irradiated  = 4,
        Anomalous   = 5,
        Plagued     = 6,
        Shadow      = 7
    }
}
