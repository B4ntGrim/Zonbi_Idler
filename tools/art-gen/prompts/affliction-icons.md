# Affliction icons — the Wet ladder, Chilled, Overheated (WX-01 B3)

Status icons for the stats panel and the Wandering HUD.

**Settled (WX-01 §3.2, Sam, Oct 30):** afflictions build on the existing `ZI.MOODLES.Wet` ladder
rather than a new status. So this is **four Wet stages**, not one Drenched icon — Damp, Wet, Soaked,
Drenched — plus Chilled and Overheated. Six icons in all.

The four Wet stages share one silhouette and differ only by **drip count and colour depth**, so the
player reads severity at a glance instead of re-reading a new shape each rung.

## Prompt
Retro pixel art status-effect icon in a matched set, chunky readable pixels, flat even lighting,
1px dark outline (#120d0a) around the silhouette, transparent background, single symbol, centred,
nothing cropped. Every icon uses the SAME simple hunched human silhouette so only colour and
particles change. Render ONE of the following, specified per run:

DAMP — the silhouette in faint grey-blue, hair slightly flattened, ONE small water droplet falling
from the hem.
WET — the same silhouette in deeper blue-grey, hair flattened, TWO droplets falling, a thin sheen
on the shoulders.
SOAKED — the same silhouette in saturated cold blue, hair plastered flat, THREE droplets falling,
the hem visibly heavy and clinging.
DRENCHED — the same silhouette in dark cold blue, shoulders hunched hard, FOUR droplets falling
plus a small pool forming at the feet.
CHILLED — the same silhouette, paler and tinged blue-white rather than wet, with angular frost
crystals forming at the shoulders and a visible shiver blur at the edges. No droplets.
OVERHEATED — the same silhouette in flushed orange-red, head tipped back, with three wavering
heat-shimmer lines rising from the shoulders and a single sweat droplet at the temple.

no text, no watermark, no border, no frame, no drop shadow, no gradient background, no
photo-realism, no facial detail, no multiple symbols, no cropping

## Notes for Sam
Run this six times, swapping in one line each time and keeping the shared paragraph identical —
that is what makes them a set rather than six separate drawings.

Chilled deliberately drops the droplets and switches to frost, so the ladder reads as *getting
wetter* and then *turning cold*, which matches the Wet moodle's own `coldBuildupRate`.

`[OPEN]` Which Wet rung triggers Chilled is still unset — audit pass 1 proposes it. If Chilled only
fires from Soaked or Drenched, the Damp and Wet icons may not need a cure hint beside them.
