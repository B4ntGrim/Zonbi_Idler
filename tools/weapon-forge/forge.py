#!/usr/bin/env python3
"""Weapon Forge: new weapon concepts in, game-ready art and card data out. Display/reference only.

Run from the Zed_Idler folder. Needs Pillow, numpy, opencv-python.

  python3 tools/weapon-forge/forge.py prompts   # art prompts in the house style for every concept without art
  python3 tools/weapon-forge/forge.py import    # openly licensed art from art/weapons/incoming/ -> retro style -> concepts
  python3 tools/weapon-forge/forge.py data      # rebuild art/weapons/concepts/concepts-data.js for the cards
  python3 tools/weapon-forge/forge.py all       # import + data, then the sprite builder

Where things live
  art/weapons/concepts/batch-*.json    concept batches (id, name, slot, family, biome, materials, role, description, prompt)
  art/weapons/concepts/<id>.png        the concept's art (team-drawn from the prompt, or an import)
  art/weapons/incoming/<pack>/         downloaded open-licence art + source.json (see incoming/README.md)
  art/weapons/CREDITS.md               every imported picture with its source, author and licence
Rules
  - Only CC0, CC-BY 3.0/4.0 and OGA-BY art is imported. Anything else (or no source.json) is refused.
    Most game art online is copyrighted; never drop it in here.
  - Imports are converted to the game's look: shrunk to a pixel grid, colours snapped to the game palette
    (zombie art + team weapon art), 1 px dark outline, then enlarged with hard pixel edges.
"""
import glob, json, os, re, sys
import numpy as np, cv2
from PIL import Image

ROOT = os.getcwd()
ART = os.path.join(ROOT, 'art', 'weapons')
CONCEPTS = os.path.join(ART, 'concepts')
INCOMING = os.path.join(ART, 'incoming')
OPEN_LICENCES = {'CC0': 'CC0 1.0', 'CC0-1.0': 'CC0 1.0', 'CC-BY-4.0': 'CC BY 4.0', 'CC-BY-3.0': 'CC BY 3.0', 'OGA-BY-3.0': 'OGA-BY 3.0'}
NEEDS_CREDIT = {'CC-BY-4.0', 'CC-BY-3.0', 'OGA-BY-3.0'}
PIXEL_GRID = 48          # long side of the pixel-art version (the zombie sprites are 48-84 px tall)
OUTLINE = (18, 13, 10)   # the 1 px outline colour used on the zombie art (#120d0a)
STYLE = ('Retro 16-bit dark survival pixel art, desaturated earth and steel palette, crisp pixel grid, dark outlines, '
         'one weapon only, side view, whole weapon visible, centred, plain dark charcoal background, no text, no hands, no scenery.')
SLOTS = {'primary', 'secondary', 'melee', 'throwable', 'offhand'}

def load_concepts():
    out = []
    for p in sorted(glob.glob(os.path.join(CONCEPTS, 'batch-*.json'))):
        for c in json.load(open(p, encoding='utf-8')):
            c['_batch'] = os.path.basename(p); out.append(c)
    ids = [c['id'] for c in out]
    dup = {i for i in ids if ids.count(i) > 1}
    if dup: sys.exit('Duplicate concept ids: ' + ', '.join(sorted(dup)))
    for c in out:
        if c.get('slot') not in SLOTS: sys.exit(f"{c['id']}: slot must be one of {sorted(SLOTS)}")
    return out

def cmd_prompts():
    concepts = load_concepts()
    lines = ['# Weapon Forge — art prompts', '', 'Paste one prompt per image into the team\'s image tool. Save the result as',
             '`art/weapons/concepts/<id>.png` (exact id), then run `python3 tools/weapon-forge/forge.py all`.', '',
             f'**House style (every prompt):** {STYLE}', '']
    todo = [c for c in concepts if not os.path.exists(os.path.join(CONCEPTS, c['id'] + '.png'))]
    for c in todo:
        lines += [f"## {c['id']} — {c['name']}", '', f"{c['prompt']} {STYLE}", '']
    open(os.path.join(CONCEPTS, 'PROMPTS.md'), 'w', encoding='utf-8').write('\n'.join(lines))
    print(f'{len(todo)} prompts written to art/weapons/concepts/PROMPTS.md ({len(concepts) - len(todo)} concepts already have art)')

def game_palette(n=48):
    px = []
    for p in glob.glob(os.path.join(ROOT, 'art', 'zombies', '*.png')) + glob.glob(os.path.join(ART, 'sprites', '*.png'))[:60]:
        a = np.array(Image.open(p).convert('RGBA').resize((64, 64), Image.NEAREST)).reshape(-1, 4)
        px.append(a[a[:, 3] > 200][:, :3])
    if not px: sys.exit('No palette sources (art/zombies, art/weapons/sprites) found.')
    strip = Image.fromarray(np.concatenate(px)[None, :, :].astype(np.uint8))
    q = strip.quantize(colors=n, method=Image.Quantize.MEDIANCUT)
    cols = q.getpalette()[:n * 3]
    # metal greys and a rust/brass pair so steel stays steel (the zombie art is mostly flesh and earth tones)
    for c in [(52, 54, 56), (84, 88, 92), (118, 122, 126), (152, 156, 160), (186, 190, 192), (218, 220, 220), (140, 92, 52), (176, 140, 72)]:
        cols += list(c)
    pal = Image.new('P', (1, 1)); pal.putpalette(cols + [0, 0, 0] * (256 - len(cols) // 3))
    return pal

def to_retro(im, pal):
    im = im.convert('RGBA'); im = im.crop(im.getbbox())
    s = PIXEL_GRID / max(im.size)
    small = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.BOX)
    a = np.array(small); alpha = a[:, :, 3] > 110
    rgb = Image.fromarray(a[:, :, :3]).quantize(palette=pal, dither=Image.Dither.NONE).convert('RGB')
    rgb = np.array(rgb)
    out = np.zeros((small.height + 2, small.width + 2, 4), np.uint8)
    out[1:-1, 1:-1, :3] = rgb; out[1:-1, 1:-1, 3] = alpha * 255
    ring = cv2.dilate(out[:, :, 3], np.ones((3, 3), np.uint8)) > 0
    edge = ring & (out[:, :, 3] == 0)
    out[edge, :3] = OUTLINE; out[edge, 3] = 255
    k = max(1, 320 // max(out.shape[:2]))
    return Image.fromarray(out).resize((out.shape[1] * k, out.shape[0] * k), Image.NEAREST)

def cmd_import():
    if not os.path.isdir(INCOMING): print('No art/weapons/incoming folder.'); return
    pal = None
    os.makedirs(CONCEPTS, exist_ok=True)
    imported_path = os.path.join(CONCEPTS, 'batch-imported.json')
    imported = json.load(open(imported_path, encoding='utf-8')) if os.path.exists(imported_path) else []
    known = {c['id'] for c in imported}
    credits = []
    for pack in sorted(os.listdir(INCOMING)):
        d = os.path.join(INCOMING, pack)
        if not os.path.isdir(d): continue
        sp = os.path.join(d, 'source.json')
        if not os.path.exists(sp): print(f'REFUSED {pack}: no source.json (source, author, licence required)'); continue
        src = json.load(open(sp, encoding='utf-8'))
        lic = (src.get('license') or '').upper().replace(' ', '-')
        if lic not in OPEN_LICENCES: print(f"REFUSED {pack}: licence '{src.get('license')}' is not CC0 / CC-BY / OGA-BY"); continue
        if not src.get('url') or not src.get('author'): print(f'REFUSED {pack}: source.json needs url and author'); continue
        items = src.get('items', {})
        for f in sorted(os.listdir(d)):
            if not f.lower().endswith('.png'): continue
            meta = items.get(f, {})
            if meta.get('skip'): continue
            cid = 'wf-' + re.sub(r'[^a-z0-9]+', '-', (meta.get('id') or pack + '-' + f[:-4]).lower()).strip('-')
            if pal is None: pal = game_palette()
            im = Image.open(os.path.join(d, f))
            if im.mode != 'RGBA' or im.getchannel('A').getextrema()[0] == 255:
                sys.path.insert(0, os.path.join(ROOT, 'tools', 'weapon-sprites'))
                from build_weapon_sprites import cut_out
                im = cut_out(os.path.join(d, f))
            to_retro(im, pal).save(os.path.join(CONCEPTS, cid + '.png'))
            entry = {'id': cid, 'name': meta.get('name') or f[:-4].replace('_', ' ').replace('-', ' ').title(),
                     'slot': meta.get('slot', 'melee'), 'family': meta.get('family', 'Imported weapons'),
                     'cm': meta.get('cm', 60), 'role': meta.get('role', ''), 'description': meta.get('description', ''),
                     'biome': meta.get('biome', ''), 'materials': meta.get('materials', []),
                     'origin': {'kind': 'import', 'pack': src.get('title', pack), 'url': src['url'], 'author': src['author'], 'license': OPEN_LICENCES[lic], 'file': f},
                     'prompt': ''}
            if cid in known: imported = [x for x in imported if x['id'] != cid]
            imported.append(entry); known.add(cid)
            credits.append(entry)
            print('imported', cid, 'from', pack)
    json.dump(imported, open(imported_path, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    # CREDITS.md lists every import (CC-BY / OGA-BY require it; CC0 listed as a courtesy)
    rows = ['# Imported weapon art — sources and licences', '', '| Concept | File | Pack | Author | Licence | Source |', '|---|---|---|---|---|---|']
    for c in imported:
        o = c['origin']; rows.append(f"| {c['id']} | {o['file']} | {o['pack']} | {o['author']} | {o['license']} | {o['url']} |")
    open(os.path.join(ART, 'CREDITS.md'), 'w', encoding='utf-8').write('\n'.join(rows) + '\n')

def cmd_data():
    concepts = load_concepts()
    out = []
    for c in concepts:
        c = {k: v for k, v in c.items() if not k.startswith('_')}
        c['hasArt'] = os.path.exists(os.path.join(CONCEPTS, c['id'] + '.png'))
        out.append(c)
    with open(os.path.join(CONCEPTS, 'concepts-data.js'), 'w', encoding='utf-8') as fh:
        fh.write('// Generated by tools/weapon-forge/forge.py data. Proposed concepts only: never loot, saves or combat.\n')
        fh.write('window.ZI_WEAPON_CONCEPTS = ' + json.dumps(out, indent=1, ensure_ascii=False) + ';\n')
    print(f"{len(out)} concepts in concepts-data.js ({sum(c['hasArt'] for c in out)} with art)")

if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'all'
    if cmd == 'prompts': cmd_prompts()
    elif cmd == 'import': cmd_import()
    elif cmd == 'data': cmd_data()
    elif cmd == 'all':
        cmd_import(); cmd_data(); cmd_prompts()
        os.system(f'"{sys.executable}" "{os.path.join(ROOT, "tools", "weapon-sprites", "build_weapon_sprites.py")}"')
    else: sys.exit(__doc__)
