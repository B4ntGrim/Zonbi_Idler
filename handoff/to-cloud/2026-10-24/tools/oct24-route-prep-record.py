# Oct 24 — Add the retroactive decision record (§0) to the route-preparation doc and a Stockpile line to CODE_STATE.md.
# Run from E:\Zed_Idler. Pre-change copies: reports/docs-oct24/pre-change/.
# The §0 block inserted is exactly the "## 0. Decision record (added Oct 24, retroactive)" section now in
# reference/routes-preparation-implementation.md; it is read from REC_FILE here so this script stays short.
import sys
REC_FILE = sys.argv[1] if len(sys.argv) > 1 else 'section0.md'   # the §0 text

p = 'reference/routes-preparation-implementation.md'
s = open(p, encoding='utf-8').read()
s = s.replace("**Status:** implemented from Sam's explicit authorization; initial numeric tuning remains subject to later balance review.",
  "**Status:** implemented from Sam's explicit authorization (Oct 23). **Decision record added Oct 24** (§0): this slice went straight to code without a slice brief or `CURRENT_BATCH.md`; §0 records retroactively what Sam decided, what stays proposed, and what is out. Starting values accepted by Sam Oct 24.", 1)
rec = open(REC_FILE, encoding='utf-8').read()
s = s.replace("\n## Authorized scope and reason", "\n" + rec + "\n## Authorized scope and reason", 1)
open(p, 'w', encoding='utf-8').write(s)

p = 'CODE_STATE.md'
s = open(p, encoding='utf-8').read()
a = "- Both HTML pages use live preparation, link to Stockpile, explain outcomes, and defer/coalesce refresh callbacks."
assert s.count(a) == 1
line = [l for l in s.split('\n') if l.startswith(a)][0]
s = s.replace(line, line + "\n- Stockpile (Oct 23, stockpile-loadout): tabs Recycler · Storage · **Gear & Loadout** (`screens-v3.jsx` StockpileScreen `initialTab`, `preparationPanel`, `onNavigate`). Routes' \"Manage gear\" opens Gear & Loadout with a compact preparation panel and a Return to selected route button; the route plan (biome, route, mode, auto-repeat) is temporary App state (`routePlan`, `preparingRoute`), cleared on any navigation. Stockpile also polls inventory once a second. Report: `reports/stockpile-loadout-2026-10-23/STOCKPILE_LINK_REPORT.md`.", 1)
open(p, 'w', encoding='utf-8').write(s)
