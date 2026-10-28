#!/usr/bin/env python3
"""Turn the team's weapon art (art/weapons) into game-sized sprites with a transparent background.

Run from the Zed_Idler folder:  python3 tools/weapon-sprites/build_weapon_sprites.py
Needs Pillow, numpy and opencv-python. Safe to re-run: it rebuilds every sprite and the index.

Input
  art/weapons/<name>.png         one weapon per image, dark plain background
  art/weapons/axes/<id>.png      axe art; the file name is the proposed-card record id (AXE-###, unique-danielle, ...)
  art/weapons/items/<id>.png     equipment art; the file name is the game item id (equipment-manifest.json)
  art/weapons/sprite-map.json    top-level images -> card record(s) and real length; real lengths for items
  If two images claim the same id, a top-level image named in sprite-map.json wins over items/.
Output
  art/weapons/sprites/<name>.png   transparent, cropped, 320 px on the long side
  art/weapons/sprites/weapon-art.js     window.ZI_WEAPON_ART = { recordId: { src, w, h, cm } }
"""
import json, os, re, sys
import numpy as np, cv2
from PIL import Image

ROOT = os.getcwd()
ART = os.path.join(ROOT, 'art', 'weapons')
OUT = os.path.join(ART, 'sprites')
SPRITE_LONG_SIDE = 320   # Oct 27 (Sam: pictures too small): every sprite is saved with a 320 px long side so it stays sharp
                         # when shown large; real size (cm) goes in the index and the cards use it for relative sizing
AXE_CM = {'1H': 50, '2H': 85, 'throw': 38}   # proposed real lengths for the axe roster

def axe_lengths():
    """Hands per axe id, read from weapon-design-data.js (the proposed-card source)."""
    p = os.path.join(ROOT, 'weapon-design-data.js')
    if not os.path.exists(p): return {}
    txt = open(p, encoding='utf-8').read()
    data = json.loads(txt[txt.index('{'):txt.rindex('}') + 1])
    out = {}
    for m in data.get('models', []):
        h = m.get('hands') or ''
        out[m['draft_id']] = AXE_CM['throw'] if 'throw' in h.lower() else AXE_CM['2H'] if h.startswith('2H') else AXE_CM['1H']
    return out

def cut_out(path):
    src = Image.open(path)
    if src.mode == 'RGBA' and src.getchannel('A').getextrema()[0] < 255:   # already transparent (Weapon Forge imports)
        return src.crop(src.getbbox())
    rgb = np.array(src.convert('RGB'))
    a = rgb.astype(np.int16)
    h, w = a.shape[:2]
    border = np.concatenate([a[:8].reshape(-1, 3), a[-8:].reshape(-1, 3), a[:, :8].reshape(-1, 3), a[:, -8:].reshape(-1, 3)])
    bgc = np.median(border, 0)
    # 1) background = flood fill from the edges that follows the background's soft gradient but stops at
    #    any real edge (neighbour-to-neighbour difference of 3 or less per channel)
    mask = np.zeros((h + 2, w + 2), np.uint8)
    img = np.ascontiguousarray(rgb)
    flags = 4 | cv2.FLOODFILL_MASK_ONLY | (255 << 8)
    step = 16
    seeds = [(x, 0) for x in range(0, w, step)] + [(x, h - 1) for x in range(0, w, step)] + \
            [(0, y) for y in range(0, h, step)] + [(w - 1, y) for y in range(0, h, step)]
    for (x, y) in seeds:
        if mask[y + 1, x + 1]: continue
        if np.abs(a[y, x] - bgc).max() > 12: continue
        cv2.floodFill(img, mask, (x, y), 0, (3, 3, 3), (3, 3, 3), flags)
    bg = mask[1:-1, 1:-1] > 0
    # 2) enclosed gaps (between bow limbs, behind straps): flat, background-coloured and not tiny
    dist = np.abs(a - bgc).max(2)
    tight = ((dist < 9) & ~bg).astype(np.uint8)
    n3, lab3, st3, _ = cv2.connectedComponentsWithStats(tight, connectivity=4)
    lum = a.mean(2)
    for i in range(1, n3):
        if st3[i, cv2.CC_STAT_AREA] > 1500:
            reg = lab3 == i
            if lum[reg].std() < 2.5: bg |= reg
    fg = (~bg).astype(np.uint8)
    fg = cv2.morphologyEx(fg, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    n2, lab2, st2, _ = cv2.connectedComponentsWithStats(fg, connectivity=8)
    keep = [i for i in range(1, n2) if st2[i, cv2.CC_STAT_AREA] > 150]
    fg = np.isin(lab2, keep).astype(np.uint8) * 255
    alpha = cv2.GaussianBlur(fg, (3, 3), 0)
    im = Image.fromarray(np.dstack([rgb, alpha]))
    return im.crop(im.getbbox())

def build():
    os.makedirs(OUT, exist_ok=True)
    smap = json.load(open(os.path.join(ART, 'sprite-map.json'), encoding='utf-8'))
    lengths = axe_lengths()
    jobs = []   # (source path, [record ids], cm)
    for f in sorted(os.listdir(ART)):
        if not f.lower().endswith('.png'): continue
        stem = f[:-4]; entry = smap.get(stem)
        if not entry or not isinstance(entry, dict) or 'records' not in entry: print('skip (not in sprite-map.json):', f); continue
        jobs.append((os.path.join(ART, f), entry['records'], entry['cm'], stem))
    claimed = {rid for _, recs, _, _ in jobs for rid in recs}
    axdir = os.path.join(ART, 'axes')
    if os.path.isdir(axdir):
        for f in sorted(os.listdir(axdir)):
            if not f.lower().endswith('.png'): continue
            stem = f[:-4]; rid = stem.upper() if re.match(r'^axe-\d{3}$', stem, re.I) else stem
            if rid in claimed: continue
            jobs.append((os.path.join(axdir, f), [rid], lengths.get(rid, AXE_CM['1H']), 'axe-' + rid if not rid.startswith('AXE') else rid))
    itdir = os.path.join(ART, 'items')
    if os.path.isdir(itdir):
        slots = {}
        mp = os.path.join(ART, 'equipment-manifest.json')
        if os.path.exists(mp):
            for it in json.load(open(mp, encoding='utf-8')): slots[it['id']] = it.get('slot')
        item_cm = smap.get('_items_cm', {}); slot_cm = smap.get('_slot_cm', {})
        for f in sorted(os.listdir(itdir)):
            if not f.lower().endswith('.png'): continue
            rid = f[:-4]
            if rid in claimed: continue
            cm = item_cm.get(rid) or slot_cm.get(slots.get(rid) or '', 40)
            jobs.append((os.path.join(itdir, f), [rid], cm, 'item-' + rid))
    # Weapon Forge concepts: art/weapons/concepts/<id>.png, real size from the batch files (cm) or the slot
    cdir = os.path.join(ART, 'concepts')
    if os.path.isdir(cdir):
        cm_of = {}
        for bp in sorted(os.listdir(cdir)):
            if bp.startswith('batch-') and bp.endswith('.json'):
                for c in json.load(open(os.path.join(cdir, bp), encoding='utf-8')):
                    cm_of[c['id']] = c.get('cm') or smap.get('_slot_cm', {}).get(c.get('slot'), 60)
        for f in sorted(os.listdir(cdir)):
            if f.lower().endswith('.png') and f[:-4] in cm_of and f[:-4] not in claimed:
                jobs.append((os.path.join(cdir, f), [f[:-4]], cm_of[f[:-4]], 'concept-' + f[:-4]))
    index = {}
    for src, records, cm, stem in jobs:
        try: im = cut_out(src)
        except Exception as e: print('FAILED', src, e); continue
        s = SPRITE_LONG_SIDE / max(im.size)   # same pixel quality for every sprite; cm (real size) is kept in the index for layout
        pixel_art = stem.startswith('concept-') and Image.open(src).mode == 'RGBA'   # forge imports keep hard pixel edges
        out = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.NEAREST if pixel_art else Image.LANCZOS)
        name = stem + '.png'
        out.save(os.path.join(OUT, name), optimize=True)
        for rid in records:
            index[rid] = {'src': 'art/weapons/sprites/' + name, 'w': out.width, 'h': out.height, 'cm': cm}
        print('ok', stem, out.size, '->', ', '.join(records))
    with open(os.path.join(OUT, 'weapon-art.js'), 'w', encoding='utf-8') as fh:
        fh.write('// Generated by tools/weapon-sprites/build_weapon_sprites.py. Display only.\n')
        fh.write('window.ZI_WEAPON_ART = ' + json.dumps(index, indent=1, sort_keys=True) + ';\n')
    print(len(index), 'records have art')

if __name__ == '__main__':
    build()
