# Wandering animation fix — Oct 27 (evening)

**Asked by Sam:** fix the visual bugs in the main character and enemy animations, resize enemies by tier, and make the walk look like a real human walk.
**Scope:** display only. No game rule, save key or simulation value changed. Wandering screen only.

## What was wrong

1. **The survivor sheets (v3) were not on a clean grid.** Each frame spilled across the grid lines: up to 28 px (unarmed) and 60 px (melee) below its cell. So in game, the feet were cut off and a slice of the next frame's head showed above him. Fists and bat tips also crossed into the next column.
2. **The "walk" frames were all the same pose.** All 8 walk frames had the same wide stride. The legs never passed each other and the arms never moved, so he looked like he was gliding, with a wobble added by CSS on top.
3. **Strike frames changed size.** The melee swing frames (row 4) were drawn about 12% smaller than the rest, so he shrank during a swing.
4. **The tier scaling never ran.** The zombie `scale` was passed to React as a bare number, so React made it `1.6px`, which browsers ignore. Zombies always showed at their raw sprite size, so an F-tier Shambler was about half the survivor's height.
5. **Survivor and zombies stood on different ground lines** (survivor at 22% from the bottom, zombies at 12%).
6. **The zombie bob skipped poses.** The 4-pose bob read a 6-step counter, so poses 3 and 4 were skipped every other loop and the zombie stuttered.
7. **Rotation on pixel art.** The zombie bob rotated the sprites ±2°, which makes pixel outlines shimmer. The survivor's CSS sway also rotated the painted sprite every frame.
8. **The scenery barely moved.** The background took 54 s per loop (about 19 px/s), much slower than his feet. So he looked like he was walking in place. It also kept scrolling during fights.

## What changed

| File | Change |
|---|---|
| `assets/wandering-characters/survivor-walk-punch-v4.png`, `survivor-melee-swing-v4.png` (new) | Clean 4x4 sheets with every frame inside its cell and all feet on one baseline. Rows 1–2 are a **new 8-frame walk cycle**: the legs swing from the hip and pass each other, the swinging foot lifts, and the body rises at the passing pose. Rows 3–4 are the team's strike frames, re-registered (melee row 4 scaled to match). The v1–v3 sheets are untouched. |
| `screens-v3.jsx` | Uses the v4 sheets (`SURVIVOR_SHEETS`). Smooth scaling for the painted art (it is high-res, not pixel art). Survivor on the same ground line as the zombies. Fight stance frame between strikes. Strike keyframes without rotation. Pace is a steady lean (jog −1.5°, run −3°) instead of a wobble. **Walk timing and scenery speed share one stride value**, so the planted foot stays still on the ground (walk 0.7 s per step, jog 0.48, run 0.36). Scenery and the walk cycle pause while fighting, resting, pinned or down. **Zombie height by tier, relative to the survivor:** F–D = his height, C ×1.08, B ×1.17, A ×1.29, S ×1.46, BOSS ×1.75 (the 48/52/56/62/70/84 tier scale already in `zombie-sprites.js`). All tiers shrink together if the boss would not fit, and very wide sprites are capped at half the scene width. The scale fix (`String(zombieScale)`). Zombie pose counter fixed (12-step tick). |
| `zombie-sprites.js` | `ZOMBIE_WALK_POSES` translate only (no rotation). |
| Both HTML pages | Cache-busters: `screens-v3.jsx?v=20261027-weapons1-animfix`, `zombie-sprites.js?v=20261027-animfix`. |
| `tools/sprite-rig/` (new) | The scripts that built the v4 sheets, with a README, so the team can rebuild or tune the stride. |

## Checks

- Headless browser, TEST SAVE: the v4 sheet loads, the walk cycle advances only while walking, the scenery runs at the matching speed and pauses in fights. Zombie heights at a 176 px survivor box: F 162, C 176, A 210, S 237, BOSS 284 px, all on the survivor's ground line. No new page errors. The only errors are `weapon-catalog.jsx` 404s from the other editor's in-progress weapons list, which isn't in the test copy.
- `tools/run-tests.cjs` on E:: 773 passed, 2 failed. These are the same two split-equivalence failures as before, from the uncommitted `game/items.js` work, and are unrelated.
- JSX compile check OK.
- Pre-change copies: `reports/anim-fix-2026-10-27/pre-change/`.
- Previews: `wandering-walk-preview.gif`, `before-tiers.png`, `after-tiers.png`, `*-v4-grid.png`.

## Not done / next

- **Ranged weapons** still use the old SVG survivor. They need their own sheets (aim / fire) to match the painted art.
- **Arms** don't swing in the walk (he walks with his guard up). If the team draws one walking-arms frame pair, the rig can add it.
- **Per-weapon frames** (Sam's idea of linking generated frames to the weapons list) are not started. The sheet format and `tools/sprite-rig` are ready to take more sheets.
- Pickup animation (ANIM-01 concept) not started.
