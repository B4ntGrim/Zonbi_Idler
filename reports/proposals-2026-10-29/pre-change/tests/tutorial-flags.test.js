// Tutorial flags per save (tutorial spec 9.1/9.2) and the "?" step list.
return (async () => {
const ORDER = ['core','world','save','stats','items','crafting','combat','factions','camp','jobs','economy','wandering','fort','active','routes','survival-data','bootstrap'];
const src = (await Promise.all(ORDER.map(m => readFile('game/' + m + '.js')))).join('\n');
const results = []; const check = (n, c, x) => results.push([c ? 'PASS' : 'FAIL', n, x === undefined ? '' : String(x)]);
const HOME = { gx:0, gy:0, name:'Home', biome:'suburbia', difficulty:1 }, FARPOS = { gx:6, gy:5, name:'Far', biome:'suburbia', difficulty:1 };
const mkEnv = (seed, opt) => {
  opt = opt || {};
  const store = Object.assign({ zi_materials: JSON.stringify({ metal:200 }), zi_world_seed:'12345', zi_trav_start: JSON.stringify({ gx:0, gy:0 }), zi_trav_pos: JSON.stringify(opt.far ? FARPOS : HOME) }, seed || {});
  const ls = { getItem:k => (k in store ? store[k] : null), setItem:(k,v)=>{store[k]=String(v);}, removeItem:k=>{delete store[k];}, key:i=>Object.keys(store)[i], get length(){return Object.keys(store).length;} };
  const doc = { hidden:false, visibilityState:'visible', addEventListener(){}, querySelectorAll:()=>[] };
  const fw = { localStorage: ls, sessionStorage: ls, console, Date, Math, JSON, setInterval:()=>0, clearInterval:()=>{}, setTimeout:()=>0, clearTimeout:()=>{}, document: doc, addEventListener(){}, location:{ reload(){} } }; fw.window = fw;
  new Function('fw', 'with(fw){' + src + '}')(fw); fw.ZI.wanderMounted = false;
  if (opt.heals != null) fw.ZI._wj('zi_charges', { heal: opt.heals, scout: 0 });
  return { ZI: fw.ZI, store, doc };
};

const KEYS = ['zi_trav_tutorial_done', 'zi_wander_tut_done', 'zi_craft_tut_done'];
// 1 — a new save starts every tutorial, even when the previous file had finished them
{ const { ZI, store } = mkEnv({ zi_trav_tutorial_done:'1', zi_wander_tut_done:'1', zi_craft_tut_done:'true' });
  const before = KEYS.map(k => ZI.tutDone(k));
  ZI.startNewInSlot('solo', 2);
  const after = KEYS.map(k => ZI.tutDone(k)), slot = JSON.parse(store.zisave_data_solo_2 || '{}');
  check('T1: a new save has no tutorial-done flags (all three tutorials show), also inside its slot file', before.every(Boolean) && after.every(x => !x) && KEYS.every(k => !(k in slot)), JSON.stringify({ before, after })); }
// 2 — loading a save keeps that save's own flags, in either stored format
{ const old = { zi_trav_tutorial_done:'true', zi_wander_tut_done:'1', zi_materials:'{}' };
  const { ZI, store } = mkEnv({ zisave_data_solo_1: JSON.stringify(old) });
  ZI.loadSlot('solo', 1); const a = KEYS.map(k => ZI.tutDone(k));
  const fresh = { zi_materials:'{}' }; store.zisave_data_solo_3 = JSON.stringify(fresh); ZI.loadSlot('solo', 3); const b = KEYS.map(k => ZI.tutDone(k));
  check('T2: old save loads with its own flags (true and "1" both finished; crafting not finished); a save without flags shows tutorials', JSON.stringify(a) === '[true,true,false]' && JSON.stringify(b) === '[false,false,false]', JSON.stringify({ a, b })); }
// 3 — one written value; no migration touches the flags
{ const { ZI, store } = mkEnv({ zi_trav_tutorial_done:'true', zi_save_version:'5' }); ZI.setTutDone('zi_wander_tut_done');
  check('T3: flags are written as "1"; migrations leave existing flag values untouched (only the tutorial-progress migration reads them)', store.zi_wander_tut_done === '1' && store.zi_trav_tutorial_done === 'true' && ZI.getSaveVersion() === ZI.SAVE_FORMAT.current && !/tut/.test(Object.keys(ZI.SAVE_MIGRATIONS).filter(v => +v !== ZI.SAVE_FORMAT.current).map(v => ZI.SAVE_MIGRATIONS[v].toString()).join('\n')), JSON.stringify([store.zi_wander_tut_done, store.zi_trav_tutorial_done])); }
// 4 — QA helper fresh() writes the value the game reads as finished
{ const qa = await readFile('tests/qa-helper.js'); const m = qa.match(/\['zi_trav_tutorial_done', 'zi_wander_tut_done', 'zi_craft_tut_done'\]\.forEach\(k => ls\.setItem\(k, '([^']*)'\)\)/);
  const { ZI, store } = mkEnv(); if (m) KEYS.forEach(k => { store[k] = m[1]; });
  check('T4: QA helper fresh() marks all three tutorials finished', !!m && KEYS.every(k => ZI.tutDone(k)), m && m[1]); }
// 5 — every "?" opens the shared step list (code wiring)
{ const scr = await readFile('screens-v3.jsx'), html = await readFile('Zombie Idler v2 - TEST SAVE.html'), real = await readFile('Zombie Idler v2.html');
  const n = (t, re) => (t.match(re) || []).length;
  check('T5: Traversal, Wandering and Crafting "?" all use TutStepMenu; old whole-tutorial replay buttons are gone', n(scr, /<window\.TutStepMenu label="Traversal"/g) === 1 && n(scr, /<window\.TutStepMenu label="Wandering"/g) === 1 && n(html, /<window\.TutStepMenu label="Crafting"/g) === 1 && n(real, /<window\.TutStepMenu label="Crafting"/g) === 1 && !/title="Replay the (Wandering |crafting )?tutorial"/.test(scr + html + real)); }
// ─── Tutorial follow-up: zi_tut_progress (spec 9.2), opening screen, "?" placement, Stats "Preview" ───
const IDS = (ZI0 => ZI0.TUT_STEP_IDS)(mkEnv().ZI);
const allIds = s => IDS[s].slice();
// 6 — a new save has an empty zi_tut_progress, in the live store and in its slot file, and every tutorial shows
{ const { ZI, store } = mkEnv({ zi_trav_tutorial_done:'1', zi_tut_progress: JSON.stringify(allIds('traversal')) });
  ZI.startNewInSlot('solo', 2); const slot = JSON.parse(store.zisave_data_solo_2 || '{}');
  const reboot = mkEnv(Object.assign({}, slot)); // the page reloads into the new file; migrations run from v0
  check('T6: new save starts with an empty zi_tut_progress (live, slot file, after reboot) and shows every tutorial',
    store.zi_tut_progress === '[]' && slot.zi_tut_progress === '[]' && JSON.stringify(reboot.ZI.getTutProgress()) === '[]' && KEYS.every(k => !reboot.ZI.tutDone(k)) && reboot.ZI.getSaveVersion() === reboot.ZI.SAVE_FORMAT.current,
    JSON.stringify({ live: store.zi_tut_progress, slot: slot.zi_tut_progress, reboot: reboot.store.zi_tut_progress })); }
// 7 — an old save with done flags loads with those screens' steps complete; nothing else changes
const TUT_V = (Z) => Number(Object.keys(Z.SAVE_MIGRATIONS).find(v => /_migrateTutProgress/.test(String(Z.SAVE_MIGRATIONS[v])))); /* BAL-A (authorized, Oct 19): a later migration (BAL-A injury, D7b) now follows the tutorial one */
{ const prev = String(TUT_V(mkEnv().ZI) - 1);
  const old = { zi_save_version: prev, zi_trav_tutorial_done:'true', zi_wander_tut_done:'1', zi_materials: JSON.stringify({ metal:7 }), zi_world_seed:'999' };
  const { ZI, store } = mkEnv(old); const prog = ZI.getTutProgress();
  const want = allIds('traversal').concat(allIds('wandering'));
  check('T7: old save → traversal + wandering steps complete, crafting not; flags, materials and seed unchanged; no finished tutorial shows',
    JSON.stringify(prog) === JSON.stringify(want) && !IDS.crafting.some(id => prog.includes(id)) && store.zi_trav_tutorial_done === 'true' && store.zi_wander_tut_done === '1' && !('zi_craft_tut_done' in store)
    && store.zi_materials === old.zi_materials && store.zi_world_seed === '999' && ZI.tutDone('zi_trav_tutorial_done') && ZI.tutDone('zi_wander_tut_done') && !ZI.tutDone('zi_craft_tut_done'),
    JSON.stringify(prog)); }
// 8 — version is the previous version + 1 (registered last, not hard-coded); an up-to-date save is not migrated again
{ const { ZI } = mkEnv(); const vs = Object.keys(ZI.SAVE_MIGRATIONS).map(Number), act = await readFile('game/active.js');
  check('T8: tutorial migration is the newest version (previous + 1, no hard-coded number); current save is left alone',
    ZI.SAVE_FORMAT.current === Math.max.apply(null, vs) && vs.includes(TUT_V(ZI) - 1) && /ZI\.SAVE_FORMAT\.current = ZI\.SAVE_FORMAT\.current \+ 1;\s*\nZI\.SAVE_MIGRATIONS\[ZI\.SAVE_FORMAT\.current\] = function\(\) \{ ZI\._migrateTutProgress\(\); \};/.test(act) && /ZI\.SAVE_FORMAT\.current = ZI\.SAVE_FORMAT\.current \+ 1;\s*\nZI\.SAVE_MIGRATIONS\[ZI\.SAVE_FORMAT\.current\] = function\(\) \{ ZI\._migrateInjuryV2\(\); \};/.test(act) && ZI.migrateSave().length === 0,
    'current=' + ZI.SAVE_FORMAT.current); }
// 9 — migration is data-only and keeps ids already present; an old save with no flags gets an empty list
{ const prev = String(TUT_V(mkEnv().ZI) - 1);
  const a = mkEnv({ zi_save_version: prev, zi_craft_tut_done:'1', zi_tut_progress: JSON.stringify(['stockpile.purpose']) });
  const b = mkEnv({ zi_save_version: prev });
  check('T9: existing ids kept and crafting added; a flag-less old save gets []',
    JSON.stringify(a.ZI.getTutProgress()) === JSON.stringify(['stockpile.purpose'].concat(allIds('crafting'))) && b.store.zi_tut_progress === '[]', JSON.stringify([a.store.zi_tut_progress, b.store.zi_tut_progress])); }
// 10 — finishing a screen writes both the flag and its step ids; progress alone also counts as finished
{ const { ZI, store } = mkEnv(); ZI.setTutDone('zi_craft_tut_done');
  const c = mkEnv({ zi_tut_progress: JSON.stringify(allIds('wandering')) });
  check('T10: setTutDone adds that screen\'s ids (no duplicates); a save whose progress holds every Wandering id reads Wandering as finished',
    store.zi_craft_tut_done === '1' && JSON.stringify(ZI.getTutProgress()) === JSON.stringify(allIds('crafting')) && (ZI.setTutDone('zi_craft_tut_done'), ZI.getTutProgress().length === 3) && c.ZI.tutDone('zi_wander_tut_done') && !c.ZI.tutDone('zi_trav_tutorial_done')); }
// 11 — step ids line up with each screen's step list
{ const scr = await readFile('screens-v3.jsx'), real = await readFile('Zombie Idler v2.html');
  const block = (t, start) => { const i = t.indexOf(start); return t.slice(i, t.indexOf('];', i)); };
  const count = b => (b.match(/\btitle:'/g) || []).length;
  const wTuts = (block(scr, 'window.WANDER_TUT_STEPS = [').match(/tut:'([a-z]+)'/g) || []).map(x => 'wandering.' + x.slice(5, -1));
  check('T11: 4 Traversal, 7 Wandering (matching each step\'s tut key) and 3 Crafting ids',
    IDS.traversal.length === count(block(scr, 'const TUTORIAL = [')) && JSON.stringify(wTuts) === JSON.stringify(IDS.wandering) && IDS.crafting.length === count(block(real, 'const CRAFT_TUT = [')),
    JSON.stringify([count(block(scr, 'const TUTORIAL = [')), wTuts.length, count(block(real, 'const CRAFT_TUT = ['))])); }
// 12 — a brand-new file opens on Traversal (the fresh-start flag is written with the file and read by the app)
{ const { ZI, store } = mkEnv(); ZI.startNewInSlot('solo', 1); const real = await readFile('Zombie Idler v2.html');
  check('T12: new file carries zi_fresh_start and the app opens it on Traversal, not Routes (solo-main)',
    store.zi_fresh_start === '1' && /useState\(bootMode \? \(freshStart \? 'traversal' :/.test(real)); }
// 13 — every "?" is bottom-right and opens the step list
{ const scr = await readFile('screens-v3.jsx'), html = await readFile('Zombie Idler v2 - TEST SAVE.html'), real = await readFile('Zombie Idler v2.html');
  const menus = (scr + real).match(/<window\.TutStepMenu [^>]*>/g) || [], tmenus = (html.match(/<window\.TutStepMenu [^>]*>/g) || []);
  check('T13: every TutStepMenu is side="right" (Traversal, Wandering, Crafting; also in the TEST SAVE page)',
    menus.length === 3 && tmenus.length === 1 && menus.concat(tmenus).every(m => /side="right"/.test(m)), menus.map(m => (m.match(/label="(\w+)"/) || [])[1] + ':' + (m.match(/side="(\w+)"/) || [])[1]).join(',')); }
// 14 — the Stats sample panels carry a visible "Preview" label
{ const v2 = await readFile('screens-v2.jsx');
  check('T14: SURVIVAL Attributes, time-of-day / weather and Zombie Index panels each show <PreviewTag/>', (v2.match(/<PreviewTag\/>/g) || []).length === 3 && /function PreviewTag\(\) \{\s*return <span[^\n]*>Preview<\/span>;/.test(v2)); }
results.forEach(r => log(r[0] + '  ' + r[1] + (r[0] === 'FAIL' ? '  ' + r[2] : '')));
log(results.filter(r => r[0] === 'PASS').length + '/' + results.length + ' tutorial checks passed');
return results;
})();
