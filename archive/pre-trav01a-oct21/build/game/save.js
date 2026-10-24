// game/save.js — Save files (3 slots per mode), snapshot/restore, boot and resume.
// Split from game-data.js (archived at archive/legacy/game-data.js). Load order: see Zombie Idler v2.html.
// Everything attaches to the shared global ZI object; load-time calls live in game/bootstrap.js.

ZI.SAVE_SLOT_COUNT = 3;
ZI.SAVE_INDEX_KEY = 'zisave_index';   // { camp:{1:meta,…}, solo:{…} }
ZI.SAVE_ACTIVE_KEY = 'zisave_active'; // { mode, slot }
ZI._readJSON = function(k, d) { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } };
ZI._gameKeys = function() {
  const out = [];
  for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf('zi_') === 0) out.push(k); }
  return out;
};
ZI._snapshot = function() { const snap = {}; ZI._gameKeys().forEach(k => { snap[k] = localStorage.getItem(k); }); return snap; };
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
  const snap = ZI._readJSON('zisave_data_' + mode + '_' + slot, null);
  if (!snap) return false;
  ZI._restore(snap);
  ZI._boot(mode, slot);
  return true;
};
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
