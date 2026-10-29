# Wandering Movement Pace and Traversal Scale

**Status:** Walk speed is the selected design baseline and is implemented in the shared movement rule. Traversal square size remains undecided.
**Updated:** October 28, 2026

## Walking pace

Use **1.4 meters per second** as the survivor's baseline walking speed. This is about **5.04 kilometers per hour** or **3.13 miles per hour**, a reasonable real-world average walking pace.

The pace is a real movement rate used by the simulation, not a label-only display value. Wandering shows the calculated speed, including applicable gear and temporary speed effects.

## Other movement paces

Jog and Run remain Athletics-based. Their physical speeds are scaled by the same factor as Walk so the relative pace ratios from the previous model remain stable while Walk is recalibrated to 1.4 m/s.

| Pace | Rule |
|---|---|
| Walk | 1.4 m/s |
| Jog | 1.4 + (0.28 × conditioning) m/s |
| Run | 1.4 + (0.6067 × conditioning) m/s |

Conditioning remains clamped to levels 3–10. Combat speed ratings are normalized to the walking baseline so changing the physical unit scale does not by itself weaken the survivor's movement-based combat ratings. Gear, overload, and speed buffs continue to affect calculated movement as before.

## Traversal square scale

The design discussion describes on-foot travel as limited to two Traversal squares per in-game day. A distance of about 1,600 meters for those two squares would imply about 800 meters per square, but that distance was an estimate. A previous 250-meter suggestion was also only an estimate.

**Do not treat either square size as settled.** The side length of a Traversal square, how distance is measured between adjacent square centers, and how travel time relates to game time still need a decision.

## Retreat and checkpoint visuals

- The live Retreat policy uses a configurable HP floor from **10% to 60%**, default **30%**. HP withdrawal starts strictly below that floor and only after healing charges are exhausted. A Downed state at **1 HP** is a separate forced-retreat path.
- Rest resumes at **80% HP and stress below 70**.
- Show the limping sprite throughout any return walk, including a manual Run Back, and during an HP-triggered retreat hold. Show the seated campfire animation only while resting at a checkpoint; Base rest remains a separate state.
- During close-combat punch frames, scale zombie bodies to the shorter crouched survivor frame. Ordinary walking-frame scale remains unchanged; larger enemy tiers retain their tier proportions.

## Implementation references

- game/items.js — shared Walk, Jog, and Run pace values and speed rating normalization.
- game/wandering.js and game/active.js — movement-distance calculations and defaults.
- screens-v3.jsx — Wandering pace control displays the calculated speed.
- wandering-tab-spec.md — pace decision summary.

## Follow-up

Before connecting route duration to real-world distance, settle the Traversal square dimensions and confirm whether the two-square daily on-foot limit is implemented or remains a design rule.
