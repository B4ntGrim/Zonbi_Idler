# Headshots — concept

Status: [DECIDED concept, PARKED numbers]. Not in any current batch. Do not implement.

[DECIDED Oct 16, Sam] A headshot is an instant kill. When a strike lands as a headshot, the enemy dies on that strike whatever HP it has left, so headshots make fights shorter. This replaces the earlier rule (headshot = a crit on the killing blow, which did not shorten the fight).

[DECIDED] A headshot resolves automatically inside normal combat, using the canonical seeded RNG, so live and offline results match.

[DECIDED Oct 16, Sam] The headshot check is its own roll on each strike, separate from the critical-hit roll. Crits keep their existing role; a headshot is decided only by the headshot roll.

## Effect of a headshot
- The enemy is killed outright on that strike (instant kill).
- Gear takes less wear for that fight.
- [DECIDED] The kill is quieter: a headshot reduces the stress gained from that encounter. It does not change follow-up encounter rates. The size of the reduction is [PARKED] with the gear/weapon metrics.

## What sets the chance
The headshot chance per strike is modified by:
- Skill: the chance grows with the relevant combat skill.
- Weapon: aimed weapons (blades, firearms) raise it; blunt weapons raise it less.
- Zombie type: armored or helmeted types lower it; some types (e.g. crawlers) raise it. Each type's modifier lives in the canonical enemy data table. Some types are immune (the Chrome Dome Bruiser in bestiary-data.js: "Headshot immunity").
- [CONCEPT] Armor types against damage types (`armor-damage-types-concept.md`, Sam, Oct 16) are the intended way armored or helmeted types resist headshots.
- [PROPOSED] Because a headshot is an instant kill, high-tier, armored and boss types need a low (or zero) headshot chance so their fights do not become trivial.

## Codex
- Each entry shows the player's headshot kills for that zombie type, alongside encounters and kills.
- This needs a per-type headshot counter, which does not exist yet.
- The headshot figure appears only once that counter is implemented. Until then the Codex shows encounters and kills only.

## Sunken Blade
[DECIDED Oct 16, Sam] The Blade has two independent bonuses:

1. **Unique passive ability: Godly Strike.** A chance to instantly kill a target. It is the Blade's own ability, always active when the Blade is equipped, and separate from headshots. On its own it does not work on bosses.
2. **Set bonus (Blade + gauntlets): Godly Strike also works on bosses.** The gauntlets are the Blade's set piece; they go in the existing Gloves slot. The set bonus applies only while both are equipped.

- [OPEN] The gauntlets' name, how the player gets them, and whether Godly Strike also ignores headshot immunity.

## Parked
- [PARKED] All numbers (headshot chance per strike, skill scaling, weapon and zombie modifiers, wear/stress reductions, Godly Strike chance) wait for the gear/weapon metrics.
