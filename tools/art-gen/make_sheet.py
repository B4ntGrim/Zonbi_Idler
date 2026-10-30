#!/usr/bin/env python3
"""ART-04 — trim generated frames and build a sprite sheet.

Same convention proven on creation-male-walk-v2.png (Oct 30): every figure is
cropped to its own alpha bounds, then placed bottom-centred on uniform cells, so
feet land on a common baseline and no art touches a cell edge. That is what stops
the jitter and the neighbour-bleed the concept sheets had.

  # inspect what it found, write nothing
  python3 tools/art-gen/make_sheet.py --in art/generated-originals/art-04 --probe

  # build a 4x4 sheet from 16 frames, in filename order
  python3 tools/art-gen/make_sheet.py --in <dir> --out assets/.../foo-v1.png --cols 4 --rows 4

  # single item icon: just trim and pad
  python3 tools/art-gen/make_sheet.py --in <dir> --out <file>.png --cols 1 --rows 1

Writes nothing into the game's own folders unless --out says so, and never
overwrites an existing file without --force.
"""
from __future__ import annotations
import argparse, sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit('Pillow is required:  pip install --break-system-packages Pillow')

ALPHA_FLOOR = 16


def bounds(im: Image.Image):
    a = im.convert('RGBA').split()[3].point(lambda v: 255 if v > ALPHA_FLOOR else 0)
    return a.getbbox()


def load(paths):
    out = []
    for p in paths:
        im = Image.open(p).convert('RGBA')
        bb = bounds(im)
        if bb is None:
            print(f'  skip (fully transparent): {p.name}', file=sys.stderr)
            continue
        out.append((p, im, bb))
    return out


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('--in', dest='src', required=True, help='folder of generated PNGs')
    ap.add_argument('--out', help='sheet to write')
    ap.add_argument('--cols', type=int, default=4)
    ap.add_argument('--rows', type=int, default=4)
    ap.add_argument('--pad-x', type=float, default=0.10, help='side padding as a fraction of the widest figure')
    ap.add_argument('--pad-y', type=float, default=0.06, help='top padding as a fraction of the tallest figure')
    ap.add_argument('--height', type=int, help='scale every figure so the tallest is this many px (tier ladder: F/E/D 50, C 54, B 58, A 64, S 68, SS 76, BOSS 86)')
    ap.add_argument('--probe', action='store_true', help='report what was found and exit')
    ap.add_argument('--force', action='store_true')
    a = ap.parse_args()

    src = Path(a.src)
    paths = sorted(p for p in src.glob('*.png'))
    if not paths:
        sys.exit(f'No PNGs in {src}')
    figs = load(paths)
    if not figs:
        sys.exit('Nothing usable found.')

    print(f'{len(figs)} frame(s) in {src}')
    for p, im, bb in figs:
        print(f'  {p.name:<44} canvas {im.width}x{im.height}  figure {bb[2]-bb[0]}x{bb[3]-bb[1]}')

    need = a.cols * a.rows
    if a.probe:
        print(f'\nA {a.cols}x{a.rows} sheet needs {need}; you have {len(figs)}.')
        return
    if not a.out:
        sys.exit('--out is required unless --probe')
    if len(figs) < need:
        sys.exit(f'Need {need} frames for {a.cols}x{a.rows}, found {len(figs)}.')
    if len(figs) > need:
        print(f'  using the first {need} in filename order')
        figs = figs[:need]

    crops = [im.crop(bb) for _, im, bb in figs]

    if a.height:
        tallest = max(c.height for c in crops)
        s = a.height / tallest
        crops = [c.resize((max(1, round(c.width * s)), max(1, round(c.height * s))), Image.LANCZOS) for c in crops]
        print(f'  scaled so the tallest figure is {a.height}px')

    mw = max(c.width for c in crops); mh = max(c.height for c in crops)
    px, py = int(mw * a.pad_x), int(mh * a.pad_y)
    cw, ch = mw + 2 * px, mh + 2 * py

    sheet = Image.new('RGBA', (cw * a.cols, ch * a.rows), (0, 0, 0, 0))
    for i, fig in enumerate(crops):
        col, row = i % a.cols, i // a.cols
        x = col * cw + (cw - fig.width) // 2          # centred horizontally
        y = row * ch + ch - py - fig.height           # feet on a common baseline
        sheet.paste(fig, (x, y), fig)

    out = Path(a.out)
    if not out.is_absolute():
        out = Path(__file__).resolve().parents[2] / out
    if out.exists() and not a.force:
        sys.exit(f'{out} exists. Pass --force to overwrite.')
    out.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out, optimize=True)

    # the checks that caught the Oct 30 defects
    import numpy as np
    arr = np.array(sheet)[:, :, 3] > ALPHA_FLOOR
    touching = [(r, c) for r in range(a.rows) for c in range(a.cols)
                if (lambda cell: cell[0, :].any() or cell[-1, :].any() or cell[:, 0].any() or cell[:, -1].any())
                (arr[r*ch:(r+1)*ch, c*cw:(c+1)*cw])]
    print(f'\nwrote {out}  {sheet.width}x{sheet.height}  cell {cw}x{ch}  aspect {ch/cw:.4f}')
    print(f'  divisible by grid: {sheet.width % a.cols == 0 and sheet.height % a.rows == 0}')
    print(f'  cells whose art touches an edge: {touching if touching else "none (clean)"}')
    print(f'\nRegister it with walkCols:{a.cols}, walkRows:{a.rows}, walkAspect:{ch/cw:.4f}')
    print('Do not wire it in until Sam has approved the art (ART-04 C4).')


if __name__ == '__main__':
    main()
