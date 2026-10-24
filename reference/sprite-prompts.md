# Zed Idler — Sprite Prompt Kit (v2)

## 1. Style Block (paste at the start of every prompt)

2D pixel art game sprite, 16-bit SNES-era style, strict limited palette (16 colors max), crisp 1px near-black outline, hard pixel edges, no anti-aliasing, no blur, no gradients. One full-body zombie in right-facing side profile, idle standing pose, whole body visible, feet touching the bottom of the frame, centered. Grim post-apocalyptic horror tone: desaturated muted earth tones (greys, browns, sickly olive skin) with a single bright glowing accent color used only for hazards. Flat solid magenta (#FF00FF) background, no ground shadow, no scenery, no text, no border.

## 2. Negative Prompt (if your tool supports one)

3D render, realistic, painterly, smooth shading, anti-aliasing, soft edges, gradient background, multiple characters, cropped feet, front-facing, three-quarter view, text, watermark, logo, fantasy armor, horns, robes, pink or magenta on the character

## 3. Template

[STYLE BLOCK]
Subject: [NAME], a [BASE] zombie.
Silhouette: [SILHOUETTE].
Details: [VISUAL TRAITS].
Wearing: [CLOTHING].
Glowing accent: [ACCENT], only on [ACCENT_ON].
Scale: [SIZE] sprite, simple readable shapes.

## 4. Rules

- Size by tier: F–B = 64x64, S and BOSS = 128x128. B-tier heavies should fill the frame edge to edge.
- Magenta is the mask key, so never use pink, magenta or violet on a sprite.
- Each base type gets its own silhouette. It has to read at thumbnail size.
- F-tier gets no glowing accent. Glow means "hazard" to the player.
- Pipeline: generate 4+ variations, pick the best, downscale nearest-neighbor to target size, snap to the shared palette, then hand-clean the outline.
- Once one sprite looks right, feed it back in as an image reference for every sprite after it.

## 5. Schema Addition (bestiary-data.js)

"sprite": { "silhouette": "", "clothing": "", "accent": "", "accentOn": "", "size": 64 }

Trait-to-visual mapping (traits must be drawable):
- Clothed -> torn everyday clothes
- Soiled / Dirty -> mud and grime splotches
- T0 Stinky -> faint wavy stink lines rising
- Fungi-laden -> shelf mushrooms and mold clumps growing from body
- Oozing / Hazardous -> dripping glowing liquid, burn marks
- Thicker Armor / Heavy -> layered plates, wide stance, bulk
- Fire + Blunt combo -> one charred, ember-cracked half; one bone-plated, swollen half

## 6. Ready-to-Use Prompts

### #1 Simple Shambler (F, 64x64)
[STYLE BLOCK]
Subject: Simple Shambler, a basic shambler zombie.
Silhouette: slumped hunch, arms hanging limply forward, head tilted, dragging one foot.
Details: grey-olive rotting skin, mud and grime splotches, faint dull wavy stink lines rising from the shoulders.
Wearing: torn faded flannel shirt, stained jeans, one shoe missing.
Glowing accent: none.
Scale: 64x64 sprite, simple readable shapes.

### #10 Moldy Hermit (D, 64x64)
[STYLE BLOCK]
Subject: Moldy Hermit, a hermit zombie.
Silhouette: deeply stooped, long ragged beard, clutching a gnarled branch as a walking stick.
Details: clumps of shelf mushrooms and moss growing from the back and shoulders, patchy mold on the face, filthy skin.
Wearing: layered tattered rags and a ripped hooded coat.
Glowing accent: pale teal glow, only on floating spores drifting off the mushrooms.
Scale: 64x64 sprite, simple readable shapes.

### #16 Acid Spitter (C, 64x64)
[STYLE BLOCK]
Subject: Acid Spitter, an acid-vomiting zombie.
Silhouette: head thrust forward, swollen bloated throat, unhinged distended jaw, hunched shoulders.
Details: chemical burn holes on chest and arms, corroded skin.
Wearing: torn stained industrial work coveralls, cracked rubber boots.
Glowing accent: toxic yellow-green, only on acid dripping from the mouth and leaking from the chest burns.
Scale: 64x64 sprite, simple readable shapes.

### #26 Armored Juggernaut (B, 64x64, fills frame)
[STYLE BLOCK]
Subject: Armored Juggernaut, a heavily armored zombie.
Silhouette: massive and wide, huge shoulders, small head, thick legs in a planted stance, fills the whole frame.
Details: dents, scratches and embedded bullets in the armor plates, grey skin visible at the joints.
Wearing: black riot helmet with cracked visor, layered tactical vest plates, riot shoulder pads, battered riot shield strapped to one forearm.
Glowing accent: dull red, only on the eyes behind the visor.
Scale: 64x64 sprite, simple readable shapes.

### #44 Rebis Specimen (S, 128x128)
[STYLE BLOCK]
Subject: Rebis Specimen, a mutated two-headed lab zombie.
Silhouette: lopsided fused body with two heads on one torso; the left half lean and charred, the right half bloated and swollen with heavy bone plates; one oversized club-like arm.
Details: left half covered in blackened cracked skin; right half with thick calloused bone growths; surgical stitches running down the seam between the halves.
Wearing: shredded hospital gown, broken restraint straps, dangling IV tubing, a specimen tag on one toe.
Glowing accent: ember orange in the cracks of the charred half, electric cyan in the veins of the swollen half.
Scale: 128x128 sprite, more detail allowed but keep a clean silhouette.
