# Save Export/Import + precompiled web build — Oct 28, 2026

Pre-change copies: `pre-change/`.

## 1. Export / Import a save file
Moves one save file between browsers or sites (e.g. `127.0.0.1:8080` ↔ https://b4ntgrim.github.io/Zonbi_Idler/).

- **Save Files screen** (both pages): filled slots get **Export** and **Import**, empty slots get **Import**. Export downloads `zed-idler-<mode>-file<N>-<YYYYMMDD>-<HHMM>.json`. Import opens a file picker; over a filled file it asks "Replace this file with an imported save?" first. A notice line shows the result or the reason for a refusal.
- **`game/save.js`**: `ZI.exportSlot(mode, slot)`, `ZI.parseSaveExport(text)`, `ZI.importSlot(text, mode, slot)`, `ZI.SAVE_EXPORT`, `ZI._saveChecksum` (FNV-1a).
  - Export of the live file writes live progress first, so unsaved progress is included.
  - File format: `{ format:'zed-idler-save', version:1, mode, slot, exportedAt, saveVersion, meta:{label,savedAt,summary}, snapshot, check }`.
  - Refused with a reason, nothing written: empty/truncated/not-JSON, not a Zed Idler save, newer file format, newer save version (`zi_save_version` > current), checksum mismatch (damaged or edited), wrong mode (Solo file on Camp Leader screen), bad slot number, storage full. Only `zi_*` string entries are imported.
  - Importing never touches another slot; the live file is autosaved first. Importing over the live file replaces live storage and reloads into it (otherwise autosave would write the old progress back). A default label "… — File N" is renamed to the new file number.
  - The snapshot keeps its last-seen time, so the first load after an import credits at most 24 h of offline progress (CLOCK-01).
- Tests: `tests/export-import.test.js` (24). Browser (two separate browsers, two origins, real buttons, real download and upload): 11/11 — see `results/`.

## 2. Precompiled web build (`tools/build-web.cjs`)
`node tools/build-web.cjs [outDir]` (default `dist/`, git-ignored). Needs only Node: Babel is vendored at `tools/vendor/babel-standalone-7.29.0.min.js` (same version the pages load).
- Compiles the six `.jsx` files and the page's inline `<script type="text/babel">` once, with exactly the options @babel/standalone uses for those tags (presets `react` + `env`, the same three plugins). Output in `dist/compiled/`, loaded with `defer` in the original order after the plain game scripts.
- Drops the 3.1 MB Babel download; React 18.3.1 production builds (SRI) replace the development builds.
- Copies runtime files (root `.js/.css`, `game/`, `assets/`, `art/`; no `.md`, `.jsx`, TEST SAVE page), writes `index.html` + `Zombie Idler v2.html` + `.nojekyll`, skips unchanged files, removes files whose source is gone.
- **Development is unchanged**: keep editing `.jsx` and opening the pages locally; the build is only for the hosted copy.

**A/B check** (same source, fixed seed, every top-bar screen in both modes: menu, Solo × 11, Camp × 10): identical screen text in all Solo screens and the menu; Camp screens differ only in how many top-bar chips fit before "▾ +N", which also varies between loads in the original pages (a resize gives the same result in both). No console errors, no failed requests in either.
**Load time to the menu**: ~6 s with in-browser Babel → **~0.5 s** compiled (local server). Save tests (Continue, slot switch 24 h cap, damaged `zi_prog_v1`) re-run on the compiled build: all pass.

## Deploy
`gh-pages` on `B4ntGrim/Zonbi_Idler` updated from `dist/` (commit "Deploy: precompiled JSX …"). To redeploy: run the build, then copy `dist/` to the `gh-pages` branch.

## Tests
Full suite: 890 passed / 18 failed — the same 18 pre-existing failures (wander-pace, r1, bal-a, sim-clock-rng 8, split-equivalence describeGearItem/itemStatLines).
