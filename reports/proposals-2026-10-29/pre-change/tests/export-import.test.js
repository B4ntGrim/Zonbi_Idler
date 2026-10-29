// Export / import of one save file (Oct 28): round trip between two separate browsers (two stores), validation of
// damaged, edited, foreign and newer files, mode guard, import over the live file, and the 24-hour cap after import.
return (async () => {
const ORDER = ['core','world','save','stats','items','crafting','combat','factions','camp','jobs','economy','wandering','fort','active','routes','survival-data','bootstrap'];
const base = (await readFile('bestiary-data.js')) + '\n' + (await Promise.all(ORDER.map(m => readFile('game/' + m + '.js')))).join('\n');
const prog = await readFile('game/progression.js'), live = await readFile('game/progression-live.js');
const html = await readFile('Zombie Idler v2.html'), htmlT = await readFile('Zombie Idler v2 - TEST SAVE.html');
const results = [], check = (n, ok, d) => results.push([ok ? 'PASS' : 'FAIL', n, d === undefined ? '' : String(d)]);
const H = 3600000, T0 = 1793200000000;
const mkEnv = (store, now) => {
  const ls = { getItem:k => (k in store ? store[k] : null), setItem:(k,v)=>{store[k]=String(v);}, removeItem:k=>{delete store[k];}, key:i=>Object.keys(store)[i], get length(){return Object.keys(store).length;} };
  const clock = { now };
  class D extends Date { constructor(...a) { if (a.length) super(...a); else super(clock.now); } static now() { return clock.now; } }
  const fw = { localStorage: ls, sessionStorage: ls, console:{ log(){}, warn(){}, error(){} }, Date: D, Math, JSON, Proxy, Object, Array,
    setInterval:()=>0, clearInterval:()=>{}, setTimeout:()=>0, clearTimeout:()=>{}, document:{ hidden:false, visibilityState:'visible', addEventListener(){}, querySelectorAll:()=>[] }, addEventListener(){}, location:{ reload(){} } };
  fw.window = fw;
  new Function('fw', 'with(fw){' + base + '\n' + prog + '\n' + live + '}')(fw);
  fw.ZI._installedClock = () => clock.now;
  return { ZI: fw.ZI, clock };
};
const xp = Z => Z.getStatXp().scavenging;

// Site A (e.g. 127.0.0.1:8080): play, leave some progress unsaved, export.
const A = {}; let E = mkEnv(A, T0); E.ZI.startNewInSlot('solo', 1);
E = mkEnv(A, T0 + 1000); E.ZI.awardXp('scavenging', 1200); E.ZI.saveToActiveSlot(); E.ZI.awardXp('scavenging', 300);
E.ZI.enqueueJob('probe', 'probe', 100 * 3600, {});
const ex = E.ZI.exportSlot('solo', 1);
check('export of the live file succeeds and names a .json file', ex.ok && /^zed-idler-solo-file1-\d{8}-\d{4}\.json$/.test(ex.fileName), ex.fileName);
const data = JSON.parse(ex.text);
check('export includes progress made since the last 💾 Save', JSON.parse(data.snapshot.zi_stat_xp).scavenging === 1500, JSON.parse(data.snapshot.zi_stat_xp).scavenging);
check('export carries format, version, checksum and the file card', data.format === 'zed-idler-save' && data.version === 1 && /^[0-9a-f]{8}$/.test(data.check) && !!data.meta.label);
check('export of an empty slot is refused with a reason', !E.ZI.exportSlot('solo', 2).ok && !!E.ZI.exportSlot('solo', 2).reason);

// Site B (e.g. GitHub Pages) opened 30 hours later: an unrelated save already in File 1, import into File 2.
const B = {}; let F = mkEnv(B, T0 + 30 * H); F.ZI.startNewInSlot('solo', 1);
F = mkEnv(B, T0 + 30 * H + 1000); F.ZI.awardXp('scavenging', 77); F.ZI.saveToActiveSlot();
const r = F.ZI.importSlot(ex.text, 'solo', 2);
check('import into another slot succeeds', r.ok && r.slot === 2 && !r.intoActive, JSON.stringify(r));
check('import does not touch the file being played', xp(F.ZI) === 77 && JSON.parse(JSON.parse(B.zisave_data_solo_1).zi_stat_xp).scavenging === 77);
check('the imported card is listed, its default label renamed to the new file number', F.ZI.listSlots('solo')[1].empty === false && F.ZI.listSlots('solo')[1].label === data.meta.label.replace(/File 1$/, 'File 2'), F.ZI.listSlots('solo')[1].label);
F.ZI.loadSlot('solo', 2);
F = mkEnv(B, T0 + 30 * H + 2000);
check('Continue on the imported file plays it with all 1,500 XP', xp(F.ZI) === 1500 && F.ZI.getActiveSlot().slot === 2, xp(F.ZI));
const job = F.ZI._readJobsRaw().jobs.find(j => j.type === 'probe'), w = F.ZI.offlineWindow();
check('the first load after import credits at most 24 h (30 h since export)', w.creditedMs === 24 * H && job && Math.abs((F.clock.now - job.startedAt) / H - 24) < 0.05, (w.elapsedMs / H).toFixed(2) + ' h elapsed, job ' + (job && ((F.clock.now - job.startedAt) / H).toFixed(2)));
check('the previously live File 1 was kept when switching', JSON.parse(JSON.parse(B.zisave_data_solo_1).zi_stat_xp).scavenging === 77);

// Import over the live file replaces live progress too (so autosave cannot write the old progress back).
const r2 = F.ZI.importSlot(ex.text, 'solo', 2);
check('import over the live file reports intoActive and replaces live storage', r2.ok && r2.intoActive && xp(F.ZI) === 1500);

// Refusals: nothing is written.
const before = JSON.stringify(B);
const tamper = JSON.parse(ex.text); tamper.snapshot.zi_stat_xp = tamper.snapshot.zi_stat_xp.replace('1500', '999999');
const newer = JSON.parse(ex.text); newer.version = 2;
const newerSave = JSON.parse(ex.text); newerSave.snapshot.zi_save_version = '999'; newerSave.check = F.ZI._saveChecksum(JSON.stringify(newerSave.snapshot));
const bads = [['truncated file', ex.text.slice(0, ex.text.length / 2 | 0)], ['empty file', ''], ['not a save', '{"hello":1}'], ['edited progress', JSON.stringify(tamper)],
  ['newer file format', JSON.stringify(newer)], ['newer save version', JSON.stringify(newerSave)], ['array', '[1,2]']];
for (const [n, t] of bads) { const x = F.ZI.importSlot(t, 'solo', 3); check('refused: ' + n + ' (with a reason, nothing written)', !x.ok && typeof x.reason === 'string' && x.reason.length > 5 && JSON.stringify(B) === before, x.reason); }
const cm = F.ZI.importSlot(ex.text, 'camp', 1);
check('a Solo save cannot be imported into Camp Leader files', !cm.ok && /Solo Survivor/.test(cm.reason) && JSON.stringify(B) === before, cm.reason);
check('slot number is checked', !F.ZI.importSlot(ex.text, 'solo', 9).ok);

// UI wiring in both pages.
for (const [n, h] of [['main page', html], ['TEST SAVE page', htmlT]]) {
  check(n + ': Save Files screen has Export and Import buttons, a hidden file input and a result notice',
    /act\(sl\.slot, 'export'\)/.test(h) && /action:'import'/.test(h) && /type="file" accept="\.json,application\/json"/.test(h) && /ZI\.importSlot\(/.test(h) && /role="status"/.test(h));
  check(n + ': loads the updated save.js', /game\/save\.js\?v=20261028-export2/.test(h));
}
return results;
})();
