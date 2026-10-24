// Assets/Scripts/Systems/Combat/WeaponTraitResolver.cs
using UnityEngine;

namespace ZedIdler.Systems.Combat
{
    /// <summary>
    /// Resolves unique weapon trait ids (authored on WeaponDefinition.uniqueTraitId)
    /// into combat effects. Keep trait ids as strings so designers can author
    /// new uniques without code; this resolver maps the known set to behavior.
    /// </summary>
    public sealed class WeaponTraitResolver
    {
        private readonly System.Random _rng;
        public WeaponTraitResolver(System.Random rng = null) { _rng = rng ?? new System.Random(); }

        /// <summary>
        /// Modify outgoing player damage based on the weapon's trait and the
        /// target's current HP fraction. Returns final damage + flags.
        /// </summary>
        public TraitDamageResult ApplyOutgoing(string traitId, int baseDamage, float targetHpFraction)
        {
            var r = new TraitDamageResult { finalDamage = baseDamage };
            if (string.IsNullOrEmpty(traitId)) return r;

            switch (traitId)
            {
                case "ignore_armor":
                    r.ignoreArmor = true;
                    break;
                case "execute_low_hp":
                    // Massive bonus when target is under 25% HP.
                    if (targetHpFraction < 0.25f) { r.finalDamage = Mathf.RoundToInt(baseDamage * 2.5f); r.executed = true; }
                    break;
                case "aoe_pulse":
                    r.aoeFraction = 0.5f; // 50% splash to other zombies if multi-zombie encounter
                    break;
                case "bleed_stack":
                    r.appliesBleed = true;
                    r.bleedPerTurn = Mathf.Max(1, baseDamage / 8);
                    break;
                case "aoe_burn":
                    r.aoeFraction = 0.35f;
                    r.appliesBurn = true;
                    break;
            }
            return r;
        }

        /// <summary>Per-turn damage-over-time tick from bleed/burn stacks.</summary>
        public int ResolveDotTick(int bleedStacks, int bleedPerTurn) => bleedStacks * bleedPerTurn;
    }

    public struct TraitDamageResult
    {
        public int finalDamage;
        public bool ignoreArmor;
        public bool executed;
        public float aoeFraction;   // 0 = single-target
        public bool appliesBleed;
        public int bleedPerTurn;
        public bool appliesBurn;
    }
}
