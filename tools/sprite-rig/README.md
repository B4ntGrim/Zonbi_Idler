# Survivor sprite rig (Oct 27 animation fix)

Builds `assets/wandering-characters/survivor-walk-punch-v4.png` and `survivor-melee-swing-v4.png` from the team's v3 sheets.

- `frames.py`: finds each drawn frame in a v3 sheet by its outline (the v3 frames cross the grid lines, so slicing by grid does not work).
- `rig.py`: cuts the legs off one standing frame at the hip and swings them to make an 8-frame walk cycle (legs pass each other, the swinging foot lifts, the body rises at the passing pose). The melee walk reuses the unarmed legs under the melee upper body so the bat stays whole.
- `batmask.py`: marks the bat in the melee frame so it is never cut with the legs.
- `assemble.py`: packs 16 frames per sheet into an even 4x4 grid, all feet on one baseline. Rows 1-2 = walk, rows 3-4 = the team's strike frames (melee row 4 scaled up 8% to match the rest). Prints the cell aspect and body fraction that `screens-v3.jsx` uses (`SURVIVOR_SHEETS`).

Run: set `SRC` in `assemble.py` to the folder with the v3 sheets, then `python3 assemble.py` (needs Pillow, numpy, scipy, opencv). Change `amp` in `rig.py` (default 22 degrees) for a longer or shorter stride; if you do, update the `0.316` step factor in `screens-v3.jsx`.
