# tools/art-gen — ART-04 image pipeline

Sam's sprites were made with ChatGPT's image model. This calls the same family through the OpenAI
API so prompts, style reference and output size are repeatable, then trims the results into sheets
that match the game's conventions.

**Nothing here wires art into the game.** Output lands in `art/generated-originals/art-04/` and
waits for Sam's approval (ART-04 C4).

## The key

Environment variable only. Never in a file, never committed.

```powershell
$env:OPENAI_API_KEY = "sk-..."      # PowerShell, this session only
```
```bash
export OPENAI_API_KEY="sk-..."      # bash
```

`tools/art-gen/.env`, `*.key` and `*.secret` are gitignored as a backstop. If a key is ever pasted
into a file by mistake, treat it as leaked and rotate it.

## Use

```bash
python3 tools/art-gen/generate.py --list
python3 tools/art-gen/generate.py --prompt campfire-dry-off --dry-run     # costs nothing
python3 tools/art-gen/generate.py --prompt campfire-dry-off --n 4 \
        --reference assets/wandering-characters/survivor-walk-v5.png

python3 tools/art-gen/make_sheet.py --in art/generated-originals/art-04 --probe
python3 tools/art-gen/make_sheet.py --in art/generated-originals/art-04 \
        --out assets/wandering-characters/survivor-campfire-dry-v1.png --cols 4 --rows 4
```

`--dry-run` prints exactly what would be sent and calls nothing. Use it first every time.

## What make_sheet.py guarantees

The convention proven on `creation-*-walk-v2.png`: each figure cropped to its own alpha bounds, then
bottom-centred on uniform cells. Feet land on a common baseline, so no jitter, and no art touches a
cell edge, so no bleed from the neighbouring frame. It reports both checks after writing, plus the
`walkCols` / `walkRows` / `walkAspect` values to register the sheet with.

`--height` scales to the zombie tier ladder: F/E/D 50, C 54, B 58, A 64, S 68, SS 76, BOSS 86.

## Prompts

`prompts/_STYLE.md` holds the house style; paste it into anything new. The queue is
`campfire-dry-off`, `improvised-splint-icon`, `weather-icons`, `affliction-icons`. Each file's
`## Prompt` section is what gets sent — everything else is notes.

## Caveats

- `DEFAULT_MODEL` is `gpt-image-1`. Check it against current OpenAI docs before a real run; model
  names change and this was written Oct 30 2026.
- Image generation costs money per call. `--n 4` is four images.
- Generated art is a starting point. Expect to regenerate, and expect hand-fixing before it matches
  the existing roster.
