#!/usr/bin/env python3
"""ART-04 — generate sprite art through the OpenAI Images API.

Sam's existing sprites were made with ChatGPT's image model; this calls the same
family through the API so prompts, style reference and output size are repeatable.

  python3 tools/art-gen/generate.py --prompt prompts/campfire-dry-off.md --n 4
  python3 tools/art-gen/generate.py --list

The API key is read from the environment ONLY:

    PowerShell :  $env:OPENAI_API_KEY = "sk-..."
    bash       :  export OPENAI_API_KEY="sk-..."

It is never written to disk and never committed. tools/art-gen/.env and
tools/art-gen/*.key are gitignored as a backstop.

Nothing here touches the game. Output lands in art/generated-originals/art-04/
for Sam to approve before anything is wired in (ART-04 C4).
"""
from __future__ import annotations
import argparse, base64, json, os, sys, time, urllib.request, urllib.error
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PROMPT_DIR = Path(__file__).resolve().parent / 'prompts'
OUT_DIR = ROOT / 'art' / 'generated-originals' / 'art-04'
API_URL = 'https://api.openai.com/v1/images/generations'
EDIT_URL = 'https://api.openai.com/v1/images/edits'

# Verify against current OpenAI docs before a real run; model names move.
DEFAULT_MODEL = 'gpt-image-1'
DEFAULT_SIZE = '1024x1024'


def api_key() -> str:
    k = os.environ.get('OPENAI_API_KEY', '').strip()
    if not k:
        sys.exit('OPENAI_API_KEY is not set. Set it in your shell; do not put it in a file.')
    return k


def read_prompt(path: Path) -> str:
    """Prompt files are markdown. Everything under a '## Prompt' heading is sent;
    the rest is notes for Sam and is ignored."""
    text = path.read_text(encoding='utf-8')
    if '## Prompt' in text:
        body = text.split('## Prompt', 1)[1]
        body = body.split('\n##', 1)[0]
        return body.strip()
    return text.strip()


def post_json(url: str, payload: dict, key: str) -> dict:
    req = urllib.request.Request(
        url, data=json.dumps(payload).encode('utf-8'),
        headers={'Authorization': f'Bearer {key}', 'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            return json.loads(r.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        detail = e.read().decode('utf-8', 'replace')[:800]
        sys.exit(f'OpenAI API returned {e.code}.\n{detail}')
    except urllib.error.URLError as e:
        sys.exit(f'Could not reach the OpenAI API: {e.reason}')


def save_images(data: list, stem: str) -> list[Path]:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    stamp = time.strftime('%Y%m%d-%H%M%S')
    written = []
    for i, item in enumerate(data, 1):
        b64 = item.get('b64_json')
        if not b64:
            print(f'  [{i}] no image payload; skipped', file=sys.stderr)
            continue
        p = OUT_DIR / f'{stem}-{stamp}-{i:02d}.png'
        p.write_bytes(base64.b64decode(b64))
        written.append(p)
        print(f'  wrote {p.relative_to(ROOT)}')
    return written


def main() -> None:
    ap = argparse.ArgumentParser(description='Generate sprite art via the OpenAI Images API.')
    ap.add_argument('--prompt', help='prompt file under tools/art-gen/prompts/ (name or path)')
    ap.add_argument('--reference', help='existing sprite to steer the style, e.g. art/zombies/049-soggy-slump.png')
    ap.add_argument('--n', type=int, default=4, help='how many variations (default 4)')
    ap.add_argument('--size', default=DEFAULT_SIZE)
    ap.add_argument('--model', default=DEFAULT_MODEL)
    ap.add_argument('--list', action='store_true', help='list available prompts and exit')
    ap.add_argument('--dry-run', action='store_true', help='print what would be sent, call nothing')
    a = ap.parse_args()

    if a.list or not a.prompt:
        print('Prompts in tools/art-gen/prompts/:')
        for p in sorted(PROMPT_DIR.glob('*.md')):
            first = next((l for l in p.read_text(encoding='utf-8').splitlines() if l.startswith('# ')), '')
            print(f'  {p.stem:<28} {first.lstrip("# ")}')
        return

    ppath = Path(a.prompt)
    if not ppath.exists():
        ppath = PROMPT_DIR / (a.prompt if a.prompt.endswith('.md') else a.prompt + '.md')
    if not ppath.exists():
        sys.exit(f'No prompt file at {ppath}. Run --list to see what exists.')

    prompt = read_prompt(ppath)
    if a.dry_run:
        print(f'model {a.model}  size {a.size}  n {a.n}')
        print(f'reference: {a.reference or "(none)"}')
        print('--- prompt ---')
        print(prompt)
        return

    key = api_key()
    print(f'{ppath.stem}: requesting {a.n} at {a.size} from {a.model}')

    if a.reference:
        ref = ROOT / a.reference if not Path(a.reference).is_absolute() else Path(a.reference)
        if not ref.exists():
            sys.exit(f'Reference sprite not found: {ref}')
        # multipart, because the edits endpoint takes a real file
        boundary = '----artgen' + str(int(time.time()))
        parts = []

        def field(name, value):
            parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"\r\n\r\n{value}\r\n'.encode())

        field('model', a.model); field('prompt', prompt); field('n', str(a.n)); field('size', a.size)
        parts.append(
            f'--{boundary}\r\nContent-Disposition: form-data; name="image"; filename="{ref.name}"\r\n'
            f'Content-Type: image/png\r\n\r\n'.encode() + ref.read_bytes() + b'\r\n')
        parts.append(f'--{boundary}--\r\n'.encode())
        body = b''.join(parts)
        req = urllib.request.Request(EDIT_URL, data=body, headers={
            'Authorization': f'Bearer {key}',
            'Content-Type': f'multipart/form-data; boundary={boundary}'})
        try:
            with urllib.request.urlopen(req, timeout=300) as r:
                res = json.loads(r.read().decode('utf-8'))
        except urllib.error.HTTPError as e:
            sys.exit(f'OpenAI API returned {e.code}.\n{e.read().decode("utf-8","replace")[:800]}')
    else:
        res = post_json(API_URL, {'model': a.model, 'prompt': prompt,
                                  'n': a.n, 'size': a.size}, key)

    written = save_images(res.get('data', []), ppath.stem)
    if written:
        print(f'\n{len(written)} image(s) in {OUT_DIR.relative_to(ROOT)}')
        print('Next: python3 tools/art-gen/make_sheet.py --help  (trim and build a sprite sheet)')
        print('Nothing is wired into the game. Sam approves art first (ART-04 C4).')


if __name__ == '__main__':
    main()
