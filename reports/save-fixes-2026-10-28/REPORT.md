# Save fixes + GitHub Pages deploy — Oct 28, 2026

Follows `reports/verify-2026-10-28/REPORT.md` (findings F6, F4, F1). Pre-change copies: `pre-change/`.

## Changes
1. **Blank-screen guard (F6)** — `game/progression-live.js` `L.getState`: a stored `zi_prog_v1` that is not a state object (array, text, number, missing/invalid `ranks`/`misses`, bad `offer`/`pending`/`lastLevel`) is repaired or replaced with a fresh state instead of throwing. Ranks are clamped to 0–24.
2. **Continue keeps live progress + autosave (F4)** — `game/save.js`:
   - `loadSlot` on the file that is already live does not restore its older snapshot; it refreshes the snapshot from live storage and boots.
   - Before New Game or Continue replaces live storage with another file, the file being left is written back (`_autosaveBeforeSwitch`).
   - `ZI.autosave` writes the active file every 60 s (`ZI.AUTOSAVE_MS`) and on `pagehide` / tab hidden. It never recreates a deleted file. 💾 Save works as before.
   - A damaged snapshot (wrong type) is refused without touching live storage.
3. **Per-slot last-seen (F1)** — `ZI._snapshot` stores `zi_offline_last_seen` = the moment the file stopped being live; restoring a file restores it, so its CLOCK-01 window and 24-hour cap are measured from its own time. Older snapshots without it fall back to the file's `savedAt`.
- Cache-busting: both HTML pages load `save.js` / `progression-live.js` with `?v=20261028-savefix1`.
- `tests/split-equivalence.test.js`: new symbols and changed functions registered as authorized.

## Verification
- New `tests/save-fixes.test.js`: 19/19 pass.
- Full suite: 866 passed / 18 failed. The 18 are the same pre-existing failures (wander-pace, r1, bal-a, sim-clock-rng 8, split-equivalence describeGearItem/itemStatLines); no new failures.
- Real browser (Chromium, Linux host, sub-path): Continue keeps 1,500 XP (was 1,000); a slot left 48 h while another was played gets 24.0 h of job credit (was 48.0 h); `zi_prog_v1` set to `[1,2]`, `{"v":1}`, `"x"`, `7` → game loads, no errors (was a permanent blank screen).

## Not changed (still open from the verify report)
Refresh more than 20 s after New Game/Continue still lands on the mode picker (by design); F2 backward clock, F3 status cap, F5 phantom import, F7, F8 damaged-file messages/backup, F10 in-browser Babel.

## GitHub Pages
- Branch `gh-pages` on `B4ntGrim/Zed_Idler` (3 commits: code, assets, art; 441 files, 256 MB). Contains the runtime files only, plus `index.html` (copy of `Zombie Idler v2.html`) and `.nojekyll`. The TEST SAVE page is not deployed. `main` is untouched.
- **Live** (Oct 28, 23:00): repository renamed `B4ntGrim/Zonbi_Idler` and made public; Pages deploys from `gh-pages` / root. URL: https://b4ntgrim.github.io/Zonbi_Idler/
- Hosted check (built-in browser on Sam's PC): every game file 200 (only `.image-slots.state.json` 404, harmless); about 11 s to the menu; `save.js` / `progression-live.js` served with `?v=20261028-savefix1`. New game → 1,000 XP saved + 500 unsaved → reload to the menu → Solo Survivor → ▶ Continue → **1,500 XP kept**, and the snapshot holds 1,500 plus its own last-seen. Test save removed from that browser afterwards.
- A browser that opened the address while it still showed the README may keep that copy for up to 10 minutes (GitHub Pages cache); a hard refresh fixes it.
- To redeploy later: rebuild the branch from the runtime files (`*.html *.js *.jsx *.css game assets art`, no `*.md`, no TEST SAVE) with `index.html` + `.nojekyll`.
