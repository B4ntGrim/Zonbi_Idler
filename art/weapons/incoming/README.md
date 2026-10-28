# Incoming open-licence weapon art

Put each downloaded pack in its own folder here, with a `source.json`. The Weapon Forge refuses a folder without one,
and refuses any licence other than CC0, CC-BY 3.0/4.0 or OGA-BY 3.0. Most game art online is copyrighted: only use
packs whose page clearly states one of those licences.

```
art/weapons/incoming/oga-weapontool-16/
  source.json
  sword.png
  pickaxe.png
```

`source.json`:
```json
{
  "title": "16x16 weapon/tool spritesheet",
  "url": "https://opengameart.org/content/16x16-weapontool-spritesheet",
  "author": "Chris_M_The_Game_Dude",
  "license": "CC0",
  "items": {
    "pickaxe.png": { "id": "miners-pick", "name": "Miner's Pick", "slot": "melee", "cm": 70, "biome": "Mountain Country", "role": "Armour-piercing", "description": "..." },
    "sword.png": { "skip": true }
  }
}
```

One weapon per PNG (slice spritesheets first). Then run `python3 tools/weapon-forge/forge.py all` from the Zed_Idler folder.
Every import is listed in `art/weapons/CREDITS.md`; CC-BY and OGA-BY art must stay credited there.

Starting points with stated CC0 licences: https://opengameart.org/content/16x16-weapontool-spritesheet ·
https://opengameart.org/content/free-cc0-melee-weapon-vector-sprites
