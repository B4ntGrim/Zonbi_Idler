# ART-02 — The width clamp: diagnosis and batch contract (Oct 30)

Follows ART-01 §3A. `[PROPOSED]` — Sam to `[DECIDE]` §4 before Code starts.

## 1. What the clamp actually does

`screens-v3.jsx:2163`:

```js
const maxW = sceneWidth * 0.5, w = sprite ? sprite.w * 2 * targetHeight / sourceHeight : 0;
if (w > maxW) targetHeight = Math.round(targetHeight * maxW / w);
```

A sprite too wide for half the scene has its **height** cut until it fits. The cut is **per sprite**,
so each sprite is shrunk by a different amount.

## 2. The real finding: this is a phone-only bug, and it inverts the ladder

Measured across viewport sizes (ranged loadout; melee is within 2 px):

| Scene | Widest drawn sprite | Share of scene | Sprites clamped |
|---|---|---|---|
| 1000x340 (desktop) | 277 px | 28% | **none** |
| 760x300 | 277 px | 36% | **none** |
| 600x280 | 277 px | 46% | 1 (BOSS 101, -3%) |
| 520x280 | 277 px | 53% | 1 |
| **420x260 (phone)** | 277 px | **66%** | **17** |

So the clamp never fires on desktop. On a phone it fires on 17 sprites — and because the cut is
per sprite, tiers stop being ordered. At 420x260 the ladder comes out as:

| Tier | F/E/D | C | B | A | S | BOSS |
|---|---|---|---|---|---|---|
| Height range | 94-103 | 112 | 120 | **109-133** | **141-151** | **137-161** |

Two inversions: an A-tier zombie (109) is drawn **shorter than a B** (120), and a BOSS (137) is
drawn **shorter than an S** (151). On phones the top of the roster is the part that breaks, which
is exactly where `[DECIDED Oct 30]` C2 — higher tier reads as physically bigger — matters most.

`056` muck-lurker, flagged in ART-01, turns out to be the least of it: it loses 9% and it is the
lowest tier anyway. **The BOSS and S entries are the casualties** (-18% to -25%).

## 3. Why a per-sprite clamp is the wrong shape

The file already has the right idiom one line up. `tierFit` (line 2107) handles the same class of
problem for height:

> *"If the boss would not fit under the HP bar, every tier shrinks together."*

That is a **global** fit: one factor, applied to every tier, so the ladder is preserved whatever
the viewport. The width clamp does the opposite — it shrinks sprites individually, which is what
lets the order break. Making width behave like height makes inversion structurally impossible
rather than something to be tuned around.

## 4. Options `[DECIDE]`

| # | Option | At 420x260 | Verdict |
|---|---|---|---|
| **A** | Leave it | A and BOSS inverted | Fails C2 on phones |
| **B** | Keep per-sprite clamp, raise share to 0.70 | Nothing clamps; ladder clean | Fixes today's roster, but the next wide sprite re-breaks it silently |
| **C** | **Global width fit + raise share to 0.65** | globalfit 0.98; F 102, BOSS 178; ladder clean | **Recommended** |
| **D** | Re-render the wide sprites narrower | — | Costs art Sam does not want to spend |

### Why C

- Inversion becomes impossible by construction, not by luck of the current roster.
- Share becomes a taste knob, not a correctness risk. Any residual shrink hits every tier equally,
  so the ladder just gets smaller, never scrambled.
- It matches `tierFit`, so there is one shrink concept in the file rather than two.
- At 0.65 the widest sprite needs 66% of a 420 px scene, so the fit factor is 0.98 — a 2% shrink
  nobody will see. Below 0.60 the whole cast starts shrinking with the survivor (at 0.50 the
  survivor body drops to 78 px), which is why 0.50 is too tight rather than merely unlucky.

### Changes C requires

1. `screens-v3.jsx` ~2157: compute `widthFit` once per render — the worst `spr.w * tierHeight / spr.h`
   across the sprite table, against `sceneWidth * ZI.SCENE_WIDTH_SHARE`.
2. `screens-v3.jsx:2163`: delete the per-sprite clamp; multiply `targetHeight` by `widthFit`.
3. `game/core.js`: add `ZI.SCENE_WIDTH_SHARE = 0.65` so it is tunable in one place.
4. The retinue (SS-BG-01) inherits this automatically — `minionMetricsFor` already derives from
   `zombieHeightForTier`.

## 5. Out of scope

ART-01 §3B — that silhouette **mass** rather than height is what the eye reads, so a wide A-tier
can out-read a tall S-tier even with the ladder numerically intact. That is an art-direction
question (should width be constrained per tier?), not a render bug, and it wants its own decision.
This batch only guarantees the height ladder is never scrambled by the viewport.
