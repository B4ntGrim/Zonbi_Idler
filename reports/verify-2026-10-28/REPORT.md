# Verification — CLOCK-01 offline cap, save/resume, hosted static build

**Date:** Oct 28, 2026 · **Scope:** read-only checks. No game code was changed.
**Method:** `node tools/run-tests.cjs` on the Windows machine, plus real-browser runs (headless Chromium 1.63 via Playwright) against a copy of the runtime files. That copy was served from a case-sensitive Linux static server under a sub-path (`/Zed_Idler/`), the same way GitHub Pages serves a project site. The browser clock was faked so "close the browser, come back N hours later" could be tested exactly. React and Babel came from byte-identical npm copies, and the page's SRI hashes matched.

## Summary

| Area | Verdict |
|---|---|
| 1. Offline progression + 24 h cap | **Cap holds for normal close/reopen.** Two leaks: slot switching bypasses the cap, and a backward clock produces invalid calendar values. |
| 2. Save / resume / damaged saves | **Not safe yet.** *Continue* rolls back unsaved progress. One damaged key causes a permanent blank screen. Damaged slot files fail silently. |
| 3. Static hosting | **Runs correctly** on a production-like host. It is not ready to deploy as-is: no `index.html`, about 9 s in-browser compile on every load, and development builds of React. A real deploy has not been done yet (needs a host and an account). |

## 1. Offline progression (CLOCK-01)

The real browser was closed and then reopened later. The test measured the shared window, a 30-hour probe timer job, the calendar and the STAT-02 status. Every case was also reloaded immediately after reopening to check for double credit.

| Away | Window credited | 30 h job credited | Reload double-credits? |
|---|---|---|---|
| 1 h | 1.00 h | 1.00 h | No |
| 23 h 59 m | 23.98 h | 23.99 h | No |
| exactly 24 h | 24 h | 24.00 h | No |
| 24 h + 1 min | 24 h (0.017 h discarded) | 24.00 h | No |
| 30 h | 24 h (6 h discarded) | 24.00 h | No |
| 7 days | 24 h (144 h discarded) | 24.00 h | No |
| clock set back 2 h | 0 | −2 h (job pushed later) | No |

- PASS: the calendar advances for the full absence (1 h → +60 game h; 7 days → Year 2). This matches CLOCK-01.
- PASS: the STAT-02 offline floor holds. With no food, Nutrition stops at about 25 (Hungry), never Starving.
- PASS: the CLOCK-01 suites pass (58/58).

**F1 — Slot switching bypasses the 24 h cap (High).** A 100-hour job was started in Solo slot 1. The player then played slot 2 for 48 hours and loaded slot 1 again. The job had received **48.0 h of credit**. A 30-hour job in the same situation finished outright. The cause is that `zi_offline_last_seen` is global and is excluded from slot snapshots (`game/save.js` `_gameKeys`). A restored slot is therefore measured against the other slot's heartbeat, which gives a window of about 0, so `discardedMs` is 0. Jobs (`_settleJobs`) and routes (`settleRouteRuns`) then run on absolute timestamps with no cap. The camp schedule uses `window.from` instead, so it gets about 0 and freezes. The two systems disagree with each other. Fix: store a per-slot last-seen time in the snapshot and build the window from it when a slot is restored.

**F2 — A backward clock produces invalid calendar values (Medium).** If the PC clock moves back by 2 h on a new save, the calendar reads **Year 0 · Day −4 · −10:−43** and `zi_status_v1.lastGameSec` goes negative. Because 1 real minute = 1 game hour, even a 15-minute correction does this on a save in its first game day. On older saves the calendar simply runs backwards. This conflicts with CLOCK-01 check 11 ("no invalid clock values"). Fix: clamp `now − c.at` to ≥ 0 in `ZI._clock`/`gameTotalSeconds` (keep the game clock monotonic) and treat a negative gap as zero absence.

**F3 — The STAT-02 offline status ignores the 24 h cap (Low).** After 7 days away, `lastAway.gameHours` = **10,080** (the full absence) instead of 1,440. The mild-tier floor hides most of the effect, but the STAT-02 contract says to respect the CLOCK-01 cap. Fix: use `ZI.offlineWindow().creditedMs` in the status catch-up.

## 2. Save and resume

| Check | Result |
|---|---|
| Refresh within 20 s of New Game/Continue keeps progress and returns to the game | PASS |
| Refresh **after** 20 s | Lands on the mode picker (by design: `RESUME_WINDOW_MS`) |
| Live progress survives close/reopen in storage | PASS |
| **Continue** on the slot you were playing keeps unsaved progress | **FAIL**: 1,500 XP → 1,000 XP |
| Two tabs on one save both keep their XP grants | PASS |
| Storage size | about 7 KB per save; no quota risk |

**F4 — Continue silently rolls back progress (Critical).** `ZI.loadSlot` always restores the last 💾 snapshot, even for the active slot whose live keys are newer. Combined with the 20-second resume window, the normal routine of refreshing or reopening the browser and clicking Continue throws away everything since the last manual save. There is no autosave and no unsaved-changes warning. Fix (smallest): if `mode/slot` equals `getActiveSlot()`, call `ZI._boot` without `_restore`. Also add an autosave, for example on `visibilitychange`/`pagehide` and every N minutes, and write the snapshot to the active slot.

**F5 — Phantom "Imported progress, Leader Lv 12" on a first visit (Low).** A brand-new browser shows slot 1 already filled. Boot writes about 15 `zi_*` keys before any save exists, and `listSlots` treats them as progress to import. The fix is to import only when meaningful keys exist, for example XP > 0 or a non-empty stash.

### Damaged saves

Each of the 30 live keys was corrupted in turn in three ways: truncated JSON, garbage text, and the wrong JSON type. That gives 90 cases. After each one the page was reloaded and every main tab was opened.

- **87/90 recover cleanly.** The game starts, no console errors appear, and no NaN shows on screen. The `_readJSON`/`rj` try/catch fallbacks do their job.
- **F6 — Permanent blank screen (Critical).** If `zi_prog_v1` holds valid JSON without `ranks` (for example `[1,2]`, or a partial object), `ZI.PROG.LIVE.getState` throws `Cannot read properties of undefined (reading 'maxHp')` (`game/progression-live.js:38`). The bad key stays in storage, so **every** reload is blank, including the main menu. The player cannot even reach another slot. Fix: in `getState`, fall back to `P.newState()` unless `s.ranks` and `s.misses` are plain objects.
- **F7 — NaN on screen (Low).** A wrong-type `zi_trav_pos` shows "YOU ARE HERE · NaN". A wrong-type `zisave_active` shows "💾 Save · Slot undefined".

Damaged **slot files**, tested through the Save Files screen:

| Damage | What the player sees |
|---|---|
| `zisave_index` truncated | Slot 1 becomes "Imported progress" with live progress kept; the other slots' entries are lost (their data is orphaned) |
| `zisave_index` slot entry null | **All slots show Empty**; New Game would overwrite live progress |
| `zisave_active` garbage | Recovers |
| Slot snapshot truncated or garbage | **Continue does nothing**: no message, back on the menu |
| One key inside the snapshot truncated | Loads, and **XP silently resets to 0** |
| Snapshot is `{}` | Silently loads an empty new game |

**F8 — Damaged slot files fail silently, with no backup (High).** Fixes: validate a snapshot before `_restore` and show "This file is damaged" instead of doing nothing; keep the previous snapshot (`…_prev`) when writing a slot so one bad write is recoverable; add Export/Import of a slot as a text file. That last one also matters for hosting, because saves are tied to the site's address (see below).

## 3. Static web build on a production-like host

- PASS: all 233 static asset references resolve with **exact case** on a case-sensitive file system. Windows hides case mistakes, and Linux hosts do not; none were found.
- PASS: the build works under a sub-path (`/Zed_Idler/…`). All paths are relative.
- PASS: there are no 404s apart from `.image-slots.state.json` (`image-slot.js` sidecar), which costs one console error per load and does nothing else.
- PASS: MIME types are fine. `.jsx` is fetched by Babel through XHR, so `octet-stream` works.
- First load transfers 6.1 MB in 87 requests: Babel 3.1 MB, React DOM development build 1.1 MB, `screens-v3.jsx` 0.3 MB. The whole runtime folder is 213 MB / 393 files (`art/weapons/items` 114 MB); it fits GitHub Pages, Netlify and Cloudflare limits.

**F9 — There is no `index.html` (High for deploy).** The entry file is `Zombie Idler v2.html`, with spaces in the name. A host serves the site root as a 404 or a directory listing. Fix: add an `index.html` (a copy or redirect), and do not deploy `Zombie Idler v2 - TEST SAVE.html`.

**F10 — About 9 s to interactive on every load (High for players).** Measured on loopback with zero network delay, so the time is all in-browser JSX compilation by `@babel/standalone`. A real host adds the download time. Continue and New Game both reload, so the player waits through it again. Fix: precompile the `.jsx` files once (`npx babel` or `esbuild`) and switch to `react.production.min.js` / `react-dom.production.min.js`.

**F11 — Saves are tied to the site's address.** Progress made on `127.0.0.1:8080` will not appear on the hosted copy. On GitHub Pages, every project under `username.github.io` shares one localStorage. That is harmless here because of the `zi_` prefixes, but it argues for Export/Import (F8).

**Real hosting run: not done yet.** This workspace cannot push to GitHub, and the Windows machine has no network from the shell. The checks above reproduce what a real host does (Linux paths, sub-path, HTTP server, CDN with SRI). One true end-to-end run still needs a chosen host and Sam's account.

## Other observations

- Full suite: **847 passed / 18 failed**. CODE_STATE records 2 failed. The 16 new failures are in `fx4-shared-attributes` (walk speed 3 m/s), `r1` (retreat rules) and `sim-clock-rng` check 8, all of which touch Wandering pace. They are probably from the Oct 28 `wander-pace` change. They fall outside this check's scope but should be looked at.

## Priority order

1. F6 blank screen · 2. F4 Continue rollback (+ autosave) · 3. F1 slot-switch cap bypass · 4. F8 damaged-file handling + backup/export · 5. F9/F10 deploy readiness · 6. F2, F3, F5, F7.

Scripts and raw results: `reports/verify-2026-10-28/scripts/` and `results/`. `reports/hosting-check-2026-10-28/runtime-snapshot.tar` (223 MB) was only used to move files to the test server and can be deleted.
