# Weapon Forge

Turns new weapon ideas into game-ready art and proposed frame cards (Crafting → Proposed frame cards → **Workshop**).
Display and reference only: nothing here touches loot, saves or combat.

## Two ways in
1. **Original concepts (main path).** Concepts live in `art/weapons/concepts/batch-*.json`. Run
   `python3 tools/weapon-forge/forge.py prompts` to get `art/weapons/concepts/PROMPTS.md`: one prompt per concept in the
   house style (same style line as the team's axe and item art). The team generates the picture, saves it as
   `art/weapons/concepts/<id>.png`, then runs `forge.py all`.
2. **Openly licensed art from online sources.** Download a CC0 / CC-BY / OGA-BY pack, put it in
   `art/weapons/incoming/<pack>/` with a `source.json` (see `art/weapons/incoming/README.md`), run `forge.py all`.
   The forge refuses anything without a stated open licence, converts the art to the game's look (48 px pixel grid,
   game palette, 1 px dark outline) and lists it in `art/weapons/CREDITS.md`.

## Commands (run from the Zed_Idler folder; needs Pillow, numpy, opencv-python)
- `forge.py prompts` — prompts for concepts that have no art yet
- `forge.py import` — process `art/weapons/incoming/`
- `forge.py data` — rebuild `art/weapons/concepts/concepts-data.js` (what the cards read)
- `forge.py all` — import, data, prompts, then `tools/weapon-sprites/build_weapon_sprites.py`

## Adding a concept
Copy an entry in `batch-01.json` (or start `batch-02.json`): `id` (start with `wf-`), `name`, `epithet`, `slot`
(primary, secondary, melee, throwable, offhand), `family`, `cm` (real length), `biome`, `materials`, `role`,
`description`, `prompt` (what the picture shows, no style words; the forge adds those).
Concepts are proposals: stats stay "Not defined" until a design pass gives them values.
