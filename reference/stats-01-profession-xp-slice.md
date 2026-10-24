# STATS-01 — Stats page: Profession XP reorder and type scale (slice brief)

**Status:** decisions locked; one Code fact open.
**Date:** Oct 21

## 1. Next slice
Make the Stats page readable and let the player arrange Profession XP in the order they think about their survivor.

## 2. Decided constraints

| Rule | Tag |
|---|---|
| No sort drop-down (replaces the Oct 20 sort-control decision) | `[DECIDED Oct 20]` |
| Drag-to-reorder with a grip handle (☰) on each row | `[DECIDED Oct 20]` |
| The order is saved between visits | `[DECIDED Oct 20]` |
| A "Reset order" link restores the starting order | `[DECIDED Oct 20]` |
| Backup up/down arrows on each row, in this slice | `[DECIDED Oct 20]` |
| Starting order = the spec's existing skill order | `[DECIDED Oct 21]` |
| Touch: touching outside the handle scrolls; moving before the hold completes scrolls; a completed hold picks the row up; auto-scroll near the list edges | `[DECIDED Oct 21]` |
| Mouse: drag starts after the cursor moves with the button held; a plain click does nothing | `[DECIDED Oct 21]` |
| Controller pick-up mode: D-pad highlights, confirm picks up, D-pad moves, confirm drops, back cancels | `[DECIDED Oct 21]` |
| Up arrow greyed on the top row; down arrow greyed on the bottom row | `[DECIDED Oct 21]` |
| Fonts: Caladea (headers), Carlito (names, numbers, labels) | `[DECIDED Oct 20–21]` |

### Data table (starting values accepted Oct 21)

| Value | Start |
|---|---|
| Mouse drag threshold | 5 px |
| Touch hold to pick up | 0.25 s |
| Pickup vibration | Light |
| Section headers | Caladea bold 28 |
| Skill names | Carlito 20 |
| Levels and XP numbers | Carlito bold 20 |
| Small labels | Carlito 16 (floor for the page) |

## 3. Open
- `[OPEN]` `[CODE]` Where the saved order lives (save key).
- `[OPEN]` `[CODE]` The UI reference size the font sizes are measured against.

## 4. Parked
- Player text-size setting in Options.
- What a skill level gives (drip plus milestone perks).

## 5. Watch for
- Larger text makes rows taller; shorten labels before shrinking text.
- The 0.25 s hold is the value most likely to change in playtesting.
