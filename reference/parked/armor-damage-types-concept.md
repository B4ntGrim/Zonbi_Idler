# Armor types and damage types — concept

Status: [CONCEPT] (Sam, Oct 16). [PARKED] for the weapons work. Not in any current batch. Do not implement.

## The idea
[CONCEPT] The game will add different armor types and different damage types. Damage types come both from weapons (the survivor's) and from opponents (zombies and other enemies). Armor types apply to the survivor's gear and to enemies.

## Connection to headshots
- [CONCEPT] Armor against damage type is how armored or helmeted zombies resist headshots, instead of a special rule per zombie type. See `headshots-concept.md` (headshot = instant kill, decided Oct 16).
- Existing data already points this way: the Chrome Dome Bruiser in `bestiary-data.js` is headshot-immune, and bestiary entries list weaknesses such as "Blunt" and "Torso attacks".

## Open
- [OPEN] The list of armor types and damage types.
- [OPEN] How each damage type interacts with each armor type (resist, ignore, bonus).
- [OPEN] Whether the zombie-type headshot modifier in `headshots-concept.md` becomes an armor-type modifier.

## Parked until
The weapons work (gear/weapon metrics; `weapons-encyclopedia-wlm-draft.md` and `weapons-development-directive.md`).
