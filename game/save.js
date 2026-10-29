// game/save.js — Save files (3 slots per mode), snapshot/restore, boot and resume.
// Split from game-data.js (archived at archive/legacy/game-data.js). Load order: see Zombie Idler v2.html.
// Everything attaches to the shared global ZI object; load-time calls live in game/bootstrap.js.

ZI.SAVE_SLOT_COUNT = 3;
ZI.SAVE_INDEX_KEY = 'zisave_index';   // { camp:{1:meta,…}, solo:{…} }
ZI.SAVE_ACTIVE_KEY = 'zisave_active'; // { mode, slot }
ZI._readJSON = function(k, d) { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } };
ZI._gameKeys = function() {
  const out = [];
  for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf('zi_') === 0 && k !== ZI.OFFLINE_LAST_SEEN_KEY) out.push(k); }
  return out;
};
ZI._snapshot = function() {
  const snap = {}; ZI._gameKeys().forEach(k => { snap[k] = localStorage.getItem(k); });
  // Per-slot last-seen (Oct 28): the moment this file stopped being live, so a slot restored later measures its
  // CLOCK-01 offline window (and 24-hour cap) from its own time instead of the shared heartbeat of another slot.
  try { snap[ZI.OFFLINE_LAST_SEEN_KEY] = String(ZI.clockNow ? ZI.clockNow() : Date.now()); } catch (e) {}
  return snap;
};
ZI._restore = function(snap) {
  ZI._gameKeys().forEach(k => localStorage.removeItem(k));
  Object.entries(snap || {}).forEach(([k, v]) => { if (k.indexOf('zi_') === 0 && v != null) localStorage.setItem(k, v); });
};
// Tutorial-done flags are per save (tutorial spec 9.1/9.2): zi_* keys, so they live in each slot snapshot and a new save
// starts with none. One written value ('1'); older saves stored JSON true ('true') — both read as finished.
ZI.TUTORIAL_DONE_KEYS = ['zi_trav_tutorial_done', 'zi_wander_tut_done', 'zi_craft_tut_done'];
ZI.TUT_DONE_VALUE = '1';
ZI.tutDone = function(key) {
  const v = localStorage.getItem(key); if (v === '1' || v === 'true') return true;
  const scr = ZI.tutScreenForKey ? ZI.tutScreenForKey(key) : null; return !!scr && ZI.tutStepsDone(ZI.TUT_STEP_IDS[scr]);
};
ZI.setTutDone = function(key) {
  try { localStorage.setItem(key, ZI.TUT_DONE_VALUE); } catch (e) {}
  const scr = ZI.tutScreenForKey(key); if (scr) ZI.markTutSteps(ZI.TUT_STEP_IDS[scr]); // keep zi_tut_progress in step
};
// ─── TUTORIAL STEP PROGRESS (tutorial spec 9.2) ──────────────────────────────
// zi_tut_progress: a per-save JSON list of completed tutorial step ids (a zi_* key, so it lives in each slot snapshot).
// Step ids are permanent save keys: never rename one; change the displayed title instead. Order matches each screen's
// step list. The old per-screen done flags stay readable; finishing a screen writes both.
ZI.TUT_PROGRESS_KEY = 'zi_tut_progress';
ZI.TUT_STEP_IDS = {
  traversal: ['traversal.day_one', 'traversal.you_are_here', 'traversal.move', 'traversal.choose'],
  wandering: ['wandering.scene', 'wandering.hp', 'wandering.haul', 'wandering.distance', 'wandering.actions', 'wandering.log', 'wandering.cmds'],
  crafting:  ['crafting.nothing_yet', 'crafting.materials', 'crafting.first_craft'],
};
ZI.TUT_SCREEN_DONE_KEY = { traversal: 'zi_trav_tutorial_done', wandering: 'zi_wander_tut_done', crafting: 'zi_craft_tut_done' };
ZI.tutScreenForKey = function(key) { return Object.keys(ZI.TUT_SCREEN_DONE_KEY).find(s => ZI.TUT_SCREEN_DONE_KEY[s] === key) || null; };
ZI.getTutProgress = function() {
  try { const v = JSON.parse(localStorage.getItem(ZI.TUT_PROGRESS_KEY) || 'null'); return Array.isArray(v) ? v.filter(x => typeof x === 'string') : []; } catch (e) { return []; }
};
ZI.markTutSteps = function(ids) {
  const cur = ZI.getTutProgress(), add = (ids || []).filter(id => typeof id === 'string' && cur.indexOf(id) < 0);
  if (add.length || localStorage.getItem(ZI.TUT_PROGRESS_KEY) == null) try { localStorage.setItem(ZI.TUT_PROGRESS_KEY, JSON.stringify(cur.concat(add))); } catch (e) {}
};
ZI.tutStepsDone = function(ids) { const cur = ZI.getTutProgress(); return (ids || []).every(id => cur.indexOf(id) >= 0); };
// Migration (registered in game/active.js after the last version): data only. Each screen whose old done flag is set
// gets all of its step ids; a save with no flags gets an empty list. Flags and any ids already present are kept.
ZI._migrateTutProgress = function() {
  const ids = [];
  Object.keys(ZI.TUT_SCREEN_DONE_KEY).forEach(s => { if (ZI.tutDone(ZI.TUT_SCREEN_DONE_KEY[s])) ids.push.apply(ids, ZI.TUT_STEP_IDS[s]); });
  ZI.markTutSteps(ids);
};
ZI._summary = function() {
  let distance = 0; try { distance = parseInt(localStorage.getItem('zi_wander_total')) || 0; } catch (e) {}
  const run = ZI._readJSON('zi_wander_run', {});
  distance = Math.max(distance, Math.round(run.scroll || 0));
  // Use the game's real Camp Leader level (defined later in this file; _summary only runs at runtime).
  const level = ZI.leaderLevel ? ZI.leaderLevel() : 1;
  return { level, distance };
};
ZI.getActiveSlot = function() { return ZI._readJSON(ZI.SAVE_ACTIVE_KEY, null); };
ZI.listSlots = function(mode) {
  const idx = ZI._readJSON(ZI.SAVE_INDEX_KEY, {});
  // One-time safety: if progress exists but no file has ever been saved, keep it
  // as Slot 1 of the first mode opened so nothing already played is lost.
  if (!idx.camp && !idx.solo && ZI._gameKeys().length) {
    idx[mode] = { 1: { savedAt: Date.now(), label: 'Imported progress', summary: ZI._summary() } };
    localStorage.setItem('zisave_data_' + mode + '_1', JSON.stringify(ZI._snapshot()));
    localStorage.setItem(ZI.SAVE_INDEX_KEY, JSON.stringify(idx));
    localStorage.setItem(ZI.SAVE_ACTIVE_KEY, JSON.stringify({ mode, slot: 1 })); // current progress IS this file
  }
  // Repair: an imported file with no active file is the live progress — adopt it.
  if (!ZI.getActiveSlot() && idx[mode] && idx[mode][1] && idx[mode][1].label === 'Imported progress') {
    localStorage.setItem(ZI.SAVE_ACTIVE_KEY, JSON.stringify({ mode, slot: 1 }));
  }
  const m = idx[mode] || {};
  // The active file mirrors live progress — refresh its card so it never shows stale numbers.
  const act = ZI.getActiveSlot();
  if (act && act.mode === mode && m[act.slot]) m[act.slot] = Object.assign({}, m[act.slot], { summary: ZI._summary() });
  const out = [];
  for (let n = 1; n <= ZI.SAVE_SLOT_COUNT; n++) out.push(m[n] ? Object.assign({ slot: n, empty: false }, m[n]) : { slot: n, empty: true });
  return out;
};
ZI._writeSlot = function(mode, slot, label) {
  const idx = ZI._readJSON(ZI.SAVE_INDEX_KEY, {});
  idx[mode] = idx[mode] || {};
  localStorage.setItem('zisave_data_' + mode + '_' + slot, JSON.stringify(ZI._snapshot()));
  idx[mode][slot] = { savedAt: Date.now(), label: label || (idx[mode][slot] && idx[mode][slot].label) || ((mode === 'camp' ? 'Camp Leader' : 'Solo Survivor') + ' — File ' + slot), summary: ZI._summary() };
  localStorage.setItem(ZI.SAVE_INDEX_KEY, JSON.stringify(idx));
};
ZI._boot = function(mode, slot) {
  localStorage.setItem(ZI.SAVE_ACTIVE_KEY, JSON.stringify({ mode, slot }));
  // Timestamped, read-without-delete: the host may load the page more than once after reload.
  try { localStorage.setItem('zisave_resume', JSON.stringify({ mode, at: Date.now() })); } catch (e) {}
  location.reload();
};
ZI.startNewInSlot = function(mode, slot) {
  ZI._autosaveBeforeSwitch(mode, slot);  // keep the file being left
  ZI._restore({});                       // clean progress
  // Brand-new file: empty stockpile, and the Crafting tutorial runs on first visit.
  localStorage.setItem('zi_materials', JSON.stringify({ metal:0, wood:0, cloth:0, electronics:0, fuel:0, medical:0 }));
  localStorage.setItem('zi_fresh_start', '1'); // first boot of this file opens on Traversal
  localStorage.setItem('zi_tut_progress', '[]'); // tutorial spec 9.2: a new save has completed no steps
  if (ZI.Jester) ZI.Jester.onNewSave(); else ZI.ensureStarterKit && ZI.ensureStarterKit(); // JD1a (B4): records eligibility; the kit comes with the save only while the switch is off
  ZI._writeSlot(mode, slot, null);       // create the file immediately
  ZI._boot(mode, slot);
};
ZI.loadSlot = function(mode, slot) {
  // Continue on the file that is already live (Oct 28): live storage is newer than its last snapshot, so keep it.
  const a = ZI.getActiveSlot();
  if (a && a.mode === mode && a.slot === slot && ZI._gameKeys().length) { ZI._writeSlot(mode, slot, null); ZI._boot(mode, slot); return true; }
  const snap = ZI._readJSON('zisave_data_' + mode + '_' + slot, null);
  if (!snap || typeof snap !== 'object' || Array.isArray(snap)) return false;
  ZI._autosaveBeforeSwitch(mode, slot);  // keep the file being left
  // Older snapshots have no per-slot last-seen: use the file's save time so its absence is still capped at 24 h.
  if (snap[ZI.OFFLINE_LAST_SEEN_KEY] == null) {
    const meta = (ZI._readJSON(ZI.SAVE_INDEX_KEY, {})[mode] || {})[slot];
    if (meta && Number.isFinite(meta.savedAt)) snap[ZI.OFFLINE_LAST_SEEN_KEY] = String(meta.savedAt);
  }
  ZI._restore(snap);
  ZI._boot(mode, slot);
  return true;
};
// Before another file replaces live storage, write the live progress back into the file it belongs to.
ZI._autosaveBeforeSwitch = function(mode, slot) {
  const a = ZI.getActiveSlot();
  if (!a || (a.mode === mode && a.slot === slot)) return;
  const idx = ZI._readJSON(ZI.SAVE_INDEX_KEY, {});
  if (idx[a.mode] && idx[a.mode][a.slot]) try { ZI._writeSlot(a.mode, a.slot, null); } catch (e) {}
};
// ─── AUTOSAVE (Oct 28) ───────────────────────────────────────────────────────
// The active file is written every minute while the page is open and whenever the page is hidden or closed, so a
// refresh, a closed tab or Continue never loses more than the last minute. The 💾 Save button still works as before.
ZI.AUTOSAVE_MS = 60000;
ZI.autosave = function() {
  const a = ZI.getActiveSlot(); if (!a) return false;
  const idx = ZI._readJSON(ZI.SAVE_INDEX_KEY, {});
  if (!idx[a.mode] || !idx[a.mode][a.slot]) return false; // the file was deleted: never recreate it
  try { ZI._writeSlot(a.mode, a.slot, null); return true; } catch (e) { return false; }
};
ZI._startAutosave = function() {
  if (ZI._autosaveTimer || typeof window === 'undefined') return;
  ZI._autosaveTimer = setInterval(ZI.autosave, ZI.AUTOSAVE_MS);
  try { window.addEventListener('pagehide', ZI.autosave); } catch (e) {}
  try { if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') ZI.autosave(); }); } catch (e) {}
};
ZI._startAutosave();
ZI.saveToActiveSlot = function() {
  const a = ZI.getActiveSlot();
  if (!a) return { ok: false, reason: 'No save file selected — choose one from the main menu' };
  ZI._writeSlot(a.mode, a.slot, null);
  return { ok: true, slot: a.slot };
};
ZI.deleteSlot = function(mode, slot) {
  const idx = ZI._readJSON(ZI.SAVE_INDEX_KEY, {});
  if (idx[mode]) delete idx[mode][slot];
  localStorage.setItem(ZI.SAVE_INDEX_KEY, JSON.stringify(idx));
  localStorage.removeItem('zisave_data_' + mode + '_' + slot);
  const a = ZI.getActiveSlot();
  if (a && a.mode === mode && a.slot === slot) localStorage.removeItem(ZI.SAVE_ACTIVE_KEY);
};
// Honour a resume request for ~20s after Continue/New Game; never deleted on read.
ZI.RESUME_WINDOW_MS = 20000;
ZI._bootMode = (function() {
  try {
    const r = JSON.parse(localStorage.getItem('zisave_resume') || 'null');
    if (r && r.mode && Date.now() - (r.at || 0) < ZI.RESUME_WINDOW_MS) return r.mode;
  } catch (e) {}
  return null;
})();
ZI.consumeBootMode = function() { return ZI._bootMode; };
// Called when the player deliberately goes back to the mode picker.
ZI.clearResume = function() { ZI._bootMode = null; try { localStorage.removeItem('zisave_resume'); } catch (e) {} };

// ─── SAVE FORMAT VERSION (spec 9; Batch 1) ───────────────────────────────────
// The version lives in a zi_* key, so it is part of every slot snapshot. Saves without it are version 0 and are
// upgraded on load. Each migration only adds data; nothing is deleted or reinterpreted.
ZI.SAVE_FORMAT = { key: 'zi_save_version', current: 2 };
ZI.SAVE_MIGRATIONS = {
  1: function() { /* v0 → v1: stamp the version; carried store and other stores self-initialise */ },
  // v1 → v2 (Batch 2A): add the decay clock and the timed-rest fields. Adds data only.
  2: function() {
    if (ZI.getDecayClock) ZI.getDecayClock(ZI.clockNow()); // creates zi_decay_clock from the per-skill stamps if missing
    const run = ZI._rj('zi_wander_run', null);
    if (run && run.resting === undefined) { run.resting = false; run.restStartHp = 0; run.restElapsedMs = 0; ZI._wj('zi_wander_run', run); }
  },
};
ZI.getSaveVersion = function() { const v = parseInt(localStorage.getItem(ZI.SAVE_FORMAT.key), 10); return isNaN(v) ? 0 : v; };
ZI.migrateSave = function() {
  let v = ZI.getSaveVersion(); const done = [];
  while (v < ZI.SAVE_FORMAT.current) { v++; if (ZI.SAVE_MIGRATIONS[v]) ZI.SAVE_MIGRATIONS[v](); done.push(v); }
  if (done.length) try { localStorage.setItem(ZI.SAVE_FORMAT.key, String(v)); } catch (e) {}
  return done;
};

// ─── EXPORT / IMPORT A SAVE FILE (Oct 28) ────────────────────────────────────
// Moves one save file between browsers or sites (for example from 127.0.0.1:8080 to the GitHub Pages copy). The file
// is plain JSON: the slot's snapshot plus its card details and a checksum, so a damaged or edited file is refused
// before anything is written. Importing never touches another slot. The snapshot keeps its own last-seen time, so the
// first load after an import credits at most 24 hours of offline progress (CLOCK-01).
ZI.SAVE_EXPORT = { format: 'zed-idler-save', version: 1, maxBytes: 5 * 1024 * 1024 };
ZI._saveChecksum = function(str) {
  let h = 0x811c9dc5; // FNV-1a, 32-bit
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return ('0000000' + h.toString(16)).slice(-8);
};
ZI.exportSlot = function(mode, slot) {
  const a = ZI.getActiveSlot();
  if (a && a.mode === mode && a.slot === slot && ZI._gameKeys().length) ZI._writeSlot(mode, slot, null); // include live progress
  const snap = ZI._readJSON('zisave_data_' + mode + '_' + slot, null);
  const meta = (ZI._readJSON(ZI.SAVE_INDEX_KEY, {})[mode] || {})[slot];
  if (!snap || typeof snap !== 'object' || Array.isArray(snap) || !meta) return { ok: false, reason: 'This file is empty or damaged, so it cannot be exported.' };
  const data = { format: ZI.SAVE_EXPORT.format, version: ZI.SAVE_EXPORT.version, mode, slot, exportedAt: Date.now(),
    saveVersion: parseInt(snap[ZI.SAVE_FORMAT.key], 10) || 0,
    meta: { label: meta.label, savedAt: meta.savedAt, summary: meta.summary || null },
    snapshot: snap, check: ZI._saveChecksum(JSON.stringify(snap)) };
  const d = new Date(data.exportedAt), pad = n => String(n).padStart(2, '0');
  const fileName = 'zed-idler-' + mode + '-file' + slot + '-' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '-' + pad(d.getHours()) + pad(d.getMinutes()) + '.json';
  return { ok: true, text: JSON.stringify(data), fileName };
};
ZI.parseSaveExport = function(text) {
  const bad = reason => ({ ok: false, reason });
  if (typeof text !== 'string' || !text.trim()) return bad('The file is empty.');
  if (text.length > ZI.SAVE_EXPORT.maxBytes) return bad('The file is too large to be a Zed Idler save.');
  let data; try { data = JSON.parse(text); } catch (e) { return bad('The file is damaged (it is not valid save data).'); }
  if (!data || typeof data !== 'object' || data.format !== ZI.SAVE_EXPORT.format) return bad('This is not a Zed Idler save file.');
  if (!(data.version >= 1) || data.version > ZI.SAVE_EXPORT.version) return bad('This save file was made by a newer version of the game.');
  if (data.mode !== 'camp' && data.mode !== 'solo') return bad('The file does not say which game mode it belongs to.');
  const snap = data.snapshot;
  if (!snap || typeof snap !== 'object' || Array.isArray(snap)) return bad('The file is damaged (no saved progress inside).');
  if (data.check !== ZI._saveChecksum(JSON.stringify(snap))) return bad('The file is damaged or was edited (checksum does not match).');
  const clean = {};
  for (const [k, v] of Object.entries(snap)) { if (k.indexOf('zi_') === 0 && typeof v === 'string') clean[k] = v; }
  if (!Object.keys(clean).length) return bad('The file is damaged (no saved progress inside).');
  if ((parseInt(clean[ZI.SAVE_FORMAT.key], 10) || 0) > ZI.SAVE_FORMAT.current) return bad('This save file was made by a newer version of the game.');
  const meta = data.meta && typeof data.meta === 'object' ? data.meta : {};
  return { ok: true, mode: data.mode, snapshot: clean, exportedAt: Number(data.exportedAt) || null,
    meta: { label: typeof meta.label === 'string' ? meta.label.slice(0, 80) : null, savedAt: Number(meta.savedAt) || Date.now(), summary: meta.summary && typeof meta.summary === 'object' ? meta.summary : null } };
};
ZI.importSlot = function(text, mode, slot) {
  const p = ZI.parseSaveExport(text);
  if (!p.ok) return p;
  if (p.mode !== mode) return { ok: false, reason: 'This is a ' + (p.mode === 'camp' ? 'Camp Leader' : 'Solo Survivor') + ' save. Import it from the ' + (p.mode === 'camp' ? 'Camp Leader' : 'Solo Survivor') + ' save files.' };
  const n = Number(slot);
  if (!(n >= 1 && n <= ZI.SAVE_SLOT_COUNT)) return { ok: false, reason: 'There is no file ' + slot + '.' };
  const a = ZI.getActiveSlot(), intoActive = !!a && a.mode === mode && a.slot === n;
  if (!intoActive) ZI._autosaveBeforeSwitch(mode, n); // nothing live is lost, even though live storage is not replaced
  if (p.snapshot[ZI.OFFLINE_LAST_SEEN_KEY] == null) p.snapshot[ZI.OFFLINE_LAST_SEEN_KEY] = String(p.exportedAt || p.meta.savedAt);
  try {
    localStorage.setItem('zisave_data_' + mode + '_' + n, JSON.stringify(p.snapshot));
    const idx = ZI._readJSON(ZI.SAVE_INDEX_KEY, {}); idx[mode] = idx[mode] || {};
    idx[mode][n] = { savedAt: p.meta.savedAt, label: (p.meta.label || ((mode === 'camp' ? 'Camp Leader' : 'Solo Survivor') + ' — File ' + n)).replace(/— File \d+$/, '— File ' + n), summary: p.meta.summary, importedAt: Date.now() };
    localStorage.setItem(ZI.SAVE_INDEX_KEY, JSON.stringify(idx));
  } catch (e) { return { ok: false, reason: 'The browser could not store the file (storage full or blocked).' }; }
  // Importing over the file that is live replaces live progress too; otherwise autosave would write the old progress back.
  if (intoActive) ZI._restore(p.snapshot);
  return { ok: true, slot: n, intoActive };
};
