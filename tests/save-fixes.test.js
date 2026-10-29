// Save fixes (Oct 28): damaged zi_prog_v1 guard, Continue keeps live progress, autosave, per-slot last-seen + 24 h cap.
return (async () => {
const ORDER = ['core','world','save','stats','items','crafting','combat','factions','camp','jobs','economy','wandering','fort','active','routes','survival-data','bootstrap'];
const base = (await readFile('bestiary-data.js')) + '\n' + (await Promise.all(ORDER.map(m => readFile('game/' + m + '.js')))).join('\n');
const prog = await readFile('game/progression.js'), live = await readFile('game/progression-live.js');
const results = [], check = (n, ok, d) => results.push([ok ? 'PASS' : 'FAIL', n, d === undefined ? '' : String(d)]);
const H = 3600000, T0 = 1793200000000;
// One browser profile: the store survives "reloads" (a fresh module load over the same store).
const mkEnv = (store, now) => {
  const ls = { getItem:k => (k in store ? store[k] : null), setItem:(k,v)=>{store[k]=String(v);}, removeItem:k=>{delete store[k];}, key:i=>Object.keys(store)[i], get length(){return Object.keys(store).length;} };
  const clock = { now };
  class D extends Date { constructor(...a) { if (a.length) super(...a); else super(clock.now); } static now() { return clock.now; } }
  const timers = [], listeners = {};
  const fw = { localStorage: ls, sessionStorage: ls, console:{ log(){}, warn(){}, error(){} }, Date: D, Math, JSON, Proxy, Object, Array,
    setInterval:(f, ms)=>{ timers.push([f, ms]); return timers.length; }, clearInterval:()=>{}, setTimeout:()=>0, clearTimeout:()=>{},
    document:{ hidden:false, visibilityState:'visible', addEventListener(t, f){ (listeners['doc:' + t] = listeners['doc:' + t] || []).push(f); }, querySelectorAll:()=>[] },
    addEventListener(t, f){ (listeners[t] = listeners[t] || []).push(f); }, location:{ reload(){} } };
  fw.window = fw;
  new Function('fw', 'with(fw){' + base + '\n' + prog + '\n' + live + '}')(fw);
  fw.ZI._installedClock = () => clock.now;
  return { ZI: fw.ZI, clock, timers, listeners, fw };
};
const xp = Z => Z.getStatXp().scavenging;

// 1. Damaged zi_prog_v1 never throws.
for (const [name, v] of [['array', '[1,2]'], ['object without ranks', '{"v":1}'], ['text', '"x"'], ['number', '7'], ['bad ranks', '{"v":1,"ranks":{"maxHp":"a","damage":99},"misses":[]}'], ['bad offer', '{"v":1,"ranks":{},"misses":{},"offer":"x","pending":-3}']]) {
  const store = { zi_world_seed:'1', zi_offline_last_seen:String(T0), zi_prog_v1: v, zi_prog_curve_ver:'2' };
  let ok = true, detail = '';
  try { const { ZI } = mkEnv(store, T0); const s = ZI.PROG.LIVE.getState(); ok = s.ranks.maxHp === 0 && s.ranks.damage <= ZI.PROG.CONFIG.ranksToCap && s.pending >= 0 && (s.offer === null || Array.isArray(s.offer)); ZI.maxHp && ZI.maxHp(); detail = JSON.stringify(s.ranks).slice(0, 80); }
  catch (e) { ok = false; detail = e.message; }
  check('damaged zi_prog_v1 (' + name + ') loads with a safe state instead of throwing', ok, detail);
}

// 2. Continue on the live file keeps unsaved progress.
let store = { zi_world_seed:'1' };
let E = mkEnv(store, T0);
E.ZI.startNewInSlot('solo', 1);
E = mkEnv(store, T0 + 1000);
E.ZI.awardXp('scavenging', 1000); E.ZI.saveToActiveSlot(); E.ZI.awardXp('scavenging', 500);
const live1 = xp(E.ZI);
E = mkEnv(store, T0 + 10 * 60000); // browser closed and reopened
E.ZI.loadSlot('solo', 1);
E = mkEnv(store, T0 + 10 * 60000 + 500);
check('Continue on the file you were playing keeps progress made since the last 💾 Save', xp(E.ZI) === live1, live1 + ' → ' + xp(E.ZI));
const snap1 = JSON.parse(store.zisave_data_solo_1 || '{}');
check('Continue also refreshes that file\'s snapshot', JSON.parse(snap1.zi_stat_xp).scavenging === live1, JSON.parse(snap1.zi_stat_xp).scavenging);

// 3. Autosave: timer and page-hide write the active file; never recreates a deleted file.
E.ZI.awardXp('scavenging', 250);
const timer = E.timers.find(t => t[1] === E.ZI.AUTOSAVE_MS);
check('an autosave timer runs every minute', !!timer, E.timers.map(t => t[1]).join(','));
timer && timer[0]();
check('the autosave timer writes live progress into the active file', JSON.parse(JSON.parse(store.zisave_data_solo_1).zi_stat_xp).scavenging === xp(E.ZI));
E.ZI.awardXp('scavenging', 10);
(E.listeners.pagehide || []).forEach(f => f());
check('closing or leaving the page (pagehide) autosaves', JSON.parse(JSON.parse(store.zisave_data_solo_1).zi_stat_xp).scavenging === xp(E.ZI));
const keep = Object.assign({}, store);
E.ZI.deleteSlot('solo', 1); E.ZI.autosave();
check('autosave never recreates a deleted file', store.zisave_data_solo_1 === undefined);
Object.keys(store).forEach(k => delete store[k]); Object.assign(store, keep);

// 4. Switching files keeps the file being left, and the restored file gets at most 24 h of credit from its own time.
E = mkEnv(store, T0 + H);
E.ZI.enqueueJob('probe', 'probe', 100 * 3600, {});
const xpA = xp(E.ZI);
E.ZI.startNewInSlot('solo', 2);                 // leave slot 1 without pressing 💾 Save
const snapA = JSON.parse(store.zisave_data_solo_1);
check('starting another file first autosaves the file being left (job + XP kept)', JSON.parse(snapA.zi_jobs).jobs.some(j => j.type === 'probe') && JSON.parse(snapA.zi_stat_xp).scavenging === xpA);
check('the snapshot carries its own last-seen time', Number(snapA.zi_offline_last_seen) === T0 + H, snapA.zi_offline_last_seen);
E = mkEnv(store, T0 + H + 1000);
for (let t = 1; t <= 48; t++) { E.clock.now = T0 + H + t * H; E.ZI.heartbeatOfflineWindow(); } // play slot 2 for 48 h
E.ZI.loadSlot('solo', 1);
E = mkEnv(store, T0 + 49 * H + 2000);
const w = E.ZI.offlineWindow(), job = E.ZI._readJobsRaw().jobs.find(j => j.type === 'probe');
const credited = job ? (E.clock.now - job.startedAt) / H : null;
check('slot 1 left for 48 h: offline window measured from its own last-seen (48 h elapsed, 24 h credited)', Math.abs(w.elapsedMs / H - 48) < 0.01 && w.creditedMs === 24 * H, (w.elapsedMs / H).toFixed(3) + ' / ' + w.creditedMs / H);
check('slot 1 left for 48 h: its 100-h job gets 24 h of credit, not 48', job && Math.abs(credited - 24) < 0.01, credited);
const snapB = JSON.parse(store.zisave_data_solo_2);
check('switching back autosaved slot 2 as well', Number(snapB.zi_offline_last_seen) >= T0 + 49 * H);

// 5. Older snapshots without last-seen fall back to the file's save time.
const old = JSON.parse(store.zisave_data_solo_2); delete old.zi_offline_last_seen; store.zisave_data_solo_2 = JSON.stringify(old);
const idx = JSON.parse(store.zisave_index); idx.solo[2].savedAt = T0 + 10 * H; store.zisave_index = JSON.stringify(idx);
E.ZI.loadSlot('solo', 2);
check('an older snapshot with no last-seen uses its save time', Number(store.zi_offline_last_seen) === T0 + 10 * H, store.zi_offline_last_seen);

// 6. A damaged snapshot is refused without touching live storage.
const before = JSON.stringify(store); store.zisave_data_solo_1 = '[1,2]'; delete store.zisave_prev_solo_1; /* Oct 29: no good backup copy */
const r = E.ZI.loadSlot('solo', 1);
check('a damaged snapshot (wrong type) is refused and live progress is untouched', r === false && JSON.parse(store.zi_stat_xp).scavenging === JSON.parse(JSON.parse(before).zi_stat_xp).scavenging);
return results;
})();
