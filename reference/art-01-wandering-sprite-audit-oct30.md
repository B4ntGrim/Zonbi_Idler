# ART-01 — Wandering sprite audit (Oct 30)

Audit of all 60 sprites in `art/zombies/` (IDs 049–108) against `zombie-sprites.js` and the
`screens-v3.jsx` render path, plus a visual pass on the tier ladder and the new SS-BG-01 retinue.

## 1. Clean

- **Geometry.** All 60 declared `w`/`h` values match the actual PNG dimensions exactly. No missing files.
- **Outline.** 100% of silhouette-edge pixels are the `#120d0a` outline colour on every sprite. No gaps.
- **Baseline.** 59 of 60 sprites are flush to the bottom of their canvas.

## 2. Fixed this pass (SS-BG-01)

| # | Problem | Fix |
|---|---|---|
| F1 | **Minions were mirrored.** `flip: rnd() < 0.35` turned roughly a third of them to face *right* — away from the survivor. The whole roster is processed flipped-to-face-left by convention; this broke it | Mirroring removed entirely |
| F2 | **Slots sat inside the commander's silhouette.** At ±0.6 of commander width the retinue overlapped the sprite, and the third slot at -0.10 was completely hidden behind it | Slots widened to -0.95 / +0.92 / -1.45 |
| F3 | **65% brightness did not separate them.** The S/SS commander art is already dark and desaturated, so dimming to 65% left the retinue reading at nearly the commander's value | Now `brightness(.48) saturate(.7)` |

Both files recompile clean.

## 3. Open findings `[OPEN]`

### A. The width clamp breaks the tier-height ladder

> **Resolved into a batch Oct 30:** measured across viewports, this is a **phone-only** fault and it
> *inverts* the ladder (an A drawn shorter than a B, a BOSS shorter than an S). Full diagnosis and
> the proposed fix are in `reference/art-02-width-clamp-batch-oct30.md`.
`zombieMetricsFor` clamps drawn width to `sceneWidth * 0.5` and, when a sprite exceeds it,
**reduces `targetHeight`**. Wide sprites are therefore drawn *shorter* than their tier.
Worst offenders by width-to-height ratio (roster median is 1.30):

| w:h | ID | Sprite | Tier |
|---|---|---|---|
| 2.24 | 056 | muck-lurker | F/E/D |
| 1.92 | 085 | apex-hunter | A |
| 1.86 | 089 | subterranean-stalker | A |

`056` is the widest sprite in the entire roster and it sits in the **lowest** tier band — wider than
every BOSS. It will be clamped hardest and will read as the shortest F/E/D zombie on screen.

### B. Mass, not height, is what the eye reads — and it contradicts C2
`[DECIDED Oct 30]` C2 says higher tiers should read as physically bigger. Height alone does not
deliver that. In the ladder pass, A-tier `089` (119×64, a low sprawling mass) reads as *more*
imposing than S-tier `095` (83×72), and B-tier `081` reads as taller than `089`. The ladder is
enforced on height while the silhouettes vary far more in width. Worth a decision on whether to
also constrain width per tier, or to accept that some archetypes are wide rather than tall.

### C. Facing is not uniform
The processing note claims every sprite is flipped to face left. Several read as **frontal**
rather than left-facing (`070` plague-matron and `095` grave-overlord among them). Frontal may be
deliberate for large static entries, but it is not what the file says, and F1 above shows the
convention is being relied on in code.

### D. `108` the-apex-prime floats
It is the only sprite with transparent padding at the **bottom** (1 px). Every other sprite is
flush. At 2× it will sit 2 px above the ground line while everything else is planted.

### E. Palette spread
Unique colours per sprite range from 11 (`094` void-phantom) to 119 (`088` bio-electric-
monstrosity), median 57. Not wrong, but the high end is drifting from the pixel-art palette the
processing pass was meant to snap to.

## 4. Not checked

The game was not run end-to-end. The browser pane runs on the user's computer while the shell runs
elsewhere, so a locally served copy is not reachable from here. To audit live, Sam runs
`server/serve-local.ps1` on his own machine and the pane can then open it.
