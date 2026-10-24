# Survivor sprites and Grayscales visual cue animations

This set contains ten individual human sprite illustrations and two looping zombie cue animations, created with the built-in image generation/editing tool.

## Human sprites

- **Scavenger Survivor** — `humans/01-scavenger-survivor.png`
- **Tactical Operator** — `humans/02-tactical-operator.png`
- **Endgame Veteran** — `humans/03-endgame-veteran.png`
- **Militia Guard / Sentry** — `humans/04-militia-guard.png`
- **Scout / Outrider** — `humans/05-scout-outrider.png`
- **Faction Enforcer / Heavy** — `humans/06-faction-enforcer.png`
- **Drifter / Trader NPC** — `humans/07-drifter-trader.png`
- **Ranged Aiming / Firing Stance** — `humans/08-ranged-aiming.png`
- **Melee Swing Frame** — `humans/09-melee-swing.png`
- **Wounded / Crawling State** — `humans/10-wounded-crawling.png`

The aiming, melee-swing and wounded poses use Tactical Operator as their character reference. These three human action images are single key poses.

## Zombie cue animations

- **Phantasm Walker:** visible stone-grey Grayscales plaques, slowly brightening plaque edges, a restrained cyan shimmer and subtle idle movement.
- **Surgical Abomination:** visible stone-grey plaques distinct from its steel tools, with a slow pale crack-edge pulse and subtle idle movement.

Each animation includes:
- An opaque dark-background looping GIF preview.
- A source PNG sheet containing four keyframes in a 2 by 2 grid.
- Four individually aligned, lossless PNG frames.
- A frame index containing source rectangles, alignment offsets and playback timing.

Both loops use four distinct generated keyframes, played in the order 0, 1, 2, 3, 2, 1. Each playback frame lasts 300 milliseconds, making a 1.8-second loop. The GIF repeats indefinitely. The aligned frame canvas is 627 by 627 pixels.

These are idle affliction-cue loops. Use the lossless PNG frames for game animation and the GIFs for convenient preview. Preserve pixel edges when scaling. Existing bestiary images are preserved.

The full prompt set and asset index accompany this set. The frames were mechanically extracted and aligned without repainting the generated character art.

