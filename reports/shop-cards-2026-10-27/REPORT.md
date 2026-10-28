# Shop purchases and frame-card fixes — Oct 27 (evening)

**Asked by Sam (16:20):** fix the proposed frame cards (no gun stats on axes, no repeated names), use the new sprite art in `art/weapons` scaled to proper size, rename Market to Shop, implement Shop purchases.

## Frame cards (Crafting → Proposed frame cards; display only)
- **Stats follow the slot.** Melee: DPS, attacks/second. Guns: DPS, fire mode, magazine, reload. Throwables: recovery chance. Axes no longer show fire mode, magazine or reload.
- **Empty rows fold.** Every undefined row in a block becomes one line: "Not defined · DPS · Attacks / second". The 28-row "Full stat record" of empty values is gone. Bonus themes show as chips; S.U.R.V.I.V.A.L. shows "Not assigned yet" until a value exists.
- **No repeated titles.** The 106 axes shared 10 titles (Matilda, a Unique, was "The Last Word" like 10 regular axes). The six named Uniques keep their titles; the 100 regular axes each get a new title that fits their role (`EPITHETS` in `crafting-frame-proposals.js`, display layer; the 300-axe source file is unchanged).
- **Header count** now lists every roster (30 in game · 100 regular axes · 12 Uniques · 3 sets · 7 ranged · 2 Relics · 10 legacy).
- **Team sprite art** replaces the code-drawn icons where art exists (70 records so far). One shared real-world scale (2 px per cm): on a card the picture box stands for 120 cm, so a 50 cm axe fills about 40% of it and a flamethrower rig fills it. List thumbnails fit the box.

## Weapon sprites
- New tool `tools/weapon-sprites/build_weapon_sprites.py` (Pillow, numpy, opencv): removes the dark background, crops, scales to the shared size, writes `art/weapons/sprites/<name>.png` and `art/weapons/sprites/weapon-art.js`. Originals untouched.
- Sources: top-level images via `art/weapons/sprite-map.json`; `art/weapons/axes/<record-id>.png`; `art/weapons/items/<item-id>.png` (with `equipment-manifest.json`). Real sizes per item in `sprite-map.json` (`_items_cm`, `_slot_cm`).
- Mapping choices to confirm: **battery-machete → Night Current** (the Unique is written as a katana with an e-bike battery; this art is a battery machete); **chemical-sprayer-rig-prop → Flamethrower** (and its Relic); **improvised-tactical-crossbow → Crossbow** (wins over a later items/crossbow.png).
- **The team was still uploading.** Re-run the tool after the upload finishes: `python3 tools/weapon-sprites/build_weapon_sprites.py` from the Zed_Idler folder. Armor, helmet and pack sprites are built too, but nothing displays them yet (cards cover weapons and throwables only).

## Shop
- Top menu: **Market → Shop** (screen id `marketplace` kept). The Auction view is gone (decided Oct 27); the old auction code stays unused.
- **Purchases work:** `ZI.shopPurchase` checks the unlock gate and the RMAT wallet, takes the RMAT, then applies the grant (gear to stash, recipe unlock, capacity level, or a saved flag). Saved in `zi_shop`; survives reload. Wallet shown in the Shop header; prices shown on every card (red when you can't afford it); Buy is disabled until you can.
- Repeatable consumables (medkits, stims) can be bought again; levelled capacity items cost price × next level.
- **New stock:** Circuit: One Loop Only (10 T2, decided Oct 25); Kettle Pot / Cook Basin / Smoker station unlocks (FOOD-02 ladder, decided Oct 27 PM); Cook Greatest to Least (FOOD-02 C3). These save an unlock flag; circuits and cooking stations aren't built yet, so they take effect when those batches land (the card text says so).
- **Prices [PROPOSED] — starting values for the economy check:** Forged Plate BP 6 T3 · Arc Carbine BP 12 T2 · Void Rifle BP 4 T5 · Backpack 5 T1/level · Stash 4 T2/level · Squad 3 T3/level · Recycler 6 T1/level · SAPI vest 5 T4 · Medkit ×3 4 T1 · Adrenaline ×2 3 T2 · Amber skin 4 T3 · Auto-Recycle 8 T2 · Echo palette 3 T5 · Kettle Pot 4 T1 · Cook Basin 8 T1 · Smoker 6 T2 · Cook order 8 T2 · Circuit loop 10 T2 (decided).
- Design flag (rule 5.1): the older catalog sells medkits and stims for RMAT, which is close to selling relief. Worth a look in the economy pass.

## Checks
- Headless browser (TEST SAVE): nav shows SHOP; buying the circuit toggle and Kettle Pot took 10 T2 and 4 T1, set both flags, showed the confirmation, refused a second buy ("Already owned"), and kept everything after reload. Cards show the new art and folded rows; no duplicate titles; no page errors.
- `tools/run-tests.cjs`: 773 passed, 2 failed (the same split-equivalence pair from the `game/items.js` work). `tests/split-equivalence.test.js` registers the new shop functions and the changed `shopState` / `SHOP_ITEMS`.
- Pre-change copies: `reports/shop-cards-2026-10-27/pre-change/`.
