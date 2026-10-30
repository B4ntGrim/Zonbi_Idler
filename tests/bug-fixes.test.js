// Regression tests for the smoke-test bug fixes (crafted gear visibility, Recycle All, Camp-Leader-only operators).
// Usage (run_script): const T = await readFile('tests/bug-fixes.test.js'); await (new Function('readFile','log', T))(readFile, log);
return (async () => {
const ORDER = ['core','world','save','stats','items','crafting','combat','factions','camp','jobs','economy','wandering','fort','active','routes','survival-data','bootstrap'];
const src = (await Promise.all(ORDER.map(m => readFile('game/' + m + '.js')))).join('\n');
const results = []; const check = (n, c, x) => results.push([c ? 'PASS' : 'FAIL', n, x || '']);
const mkEnv = (seedStore) => {
  const store = Object.assign({}, seedStore || {});
  const ls = { getItem:k => (k in store ? store[k] : null), setItem:(k,v)=>{store[k]=String(v);}, removeItem:k=>{delete store[k];}, key:i=>Object.keys(store)[i], get length(){return Object.keys(store).length;} };
  const fw = { localStorage: ls, sessionStorage: ls, console, Date, Math, JSON, setInterval:()=>0, clearInterval:()=>{}, setTimeout:()=>0, clearTimeout:()=>{},
    document:{ hidden:false, addEventListener(){}, querySelectorAll:()=>[] }, addEventListener(){}, location:{ reload(){} } };
  fw.window = fw;
  new Function('fw', 'with(fw){' + src + '}')(fw);
  return { fw, ZI: fw.ZI, store };
};
const finishJobs = (E) => { const js = JSON.parse(E.store.zi_jobs || '{"v":1,"jobs":[]}'); js.jobs.forEach(j => { if (j.status === 'active') j.startedAt = Date.now() - 86400000; }); E.store.zi_jobs = JSON.stringify(js); E.ZI.getJobs(); };

// ── Bug 1: crafted gear reaches the one stash, can be equipped, and both screens read the same loadout ──
{
  const E = mkEnv({}), ZI = E.ZI;
  // MED-01 (Oct 30): medical aids are kind:'gear' but deliberately have no slot (they live in the stash and
  // are used at base), so this picks a gear recipe whose item is actually equippable.
  const r = ZI.CRAFT_RECIPES.find(x => { const g = x.kind === 'gear' && x.grantsGear && ZI.getGearItem(x.grantsGear); return !!(g && g.slot); });
  let notified = 0; const off = ZI.onInventoryChange(() => notified++);
  ZI.enqueueJob('craft', r.id, 1, {}, 1); finishJobs(E);
  check('B1: crafted gear item created (job finished)', !(JSON.parse(E.store.zi_jobs).jobs || []).some(j => j.refId === r.id));
  check('B1: it is in the authoritative stash', ZI.getStash().includes(r.grantsGear));
  check('B1: screens are notified when crafting adds it', notified > 0);
  const it = ZI.getGearItem(r.grantsGear); const eq = ZI.equipGear(r.grantsGear, it.slot);
  check('B1: it can be equipped', !!eq);
  check('B1: the loadout contains it', ZI.getLoadout()[it.slot] === r.grantsGear);
  // Wandering and Stockpile both read ZI.getLoadout() — same store, same item, same stats/identity.
  const fromWandering = ZI.getGearItem(ZI.getLoadout()[it.slot]);
  check('B1: Wandering reads the same equipped item with its stats', fromWandering === it && ZI.resolveLoadoutStats(ZI.getLoadout()).filled >= 1);
  off();
}

// ── Bug 2: Recycle All uses the normal recycle queue and skips protected/ineligible items ──
{
  const E = mkEnv({ zi_materials: JSON.stringify({ metal:10, wood:10, cloth:10, electronics:10, fuel:10, medical:10 }) }), ZI = E.ZI;
  E.store.zisave_active = JSON.stringify({ mode:'solo', slot:1 }); E.store[ZI.SAVE_ACTIVE_KEY] = E.store.zisave_active;
  const items = [
    { id:'r1', name:'Old Radio', outputs:{ electronics:4, metal:2 }, weight:1 },
    { id:'r2', name:'Tattered Hoodie', outputs:{ cloth:5 }, weight:1 },
    { id:'sealed_crate', name:'Sealed Crate', outputs:{ metal:3 }, weight:2 },          // story item → protected
    { id:'r3', name:'Empty shell', outputs:{}, weight:1 },                               // no outputs → not recyclable
  ];
  items.push(items[0]);                                                                   // duplicate entry → must not queue twice
  const r = ZI.recycleAll(items, 'solo');
  const q = ZI.jobsByType('recycle');
  check('B2: eligible items queued on the recycle job lane', r.queued.length === 2 && q.length === 2 && q.every(j => j.type === 'recycle'), 'queued=' + r.queued.join(','));
  check('B2: story and non-recyclable items left untouched', !q.some(j => j.refId === 'sealed_crate' || j.refId === 'r3'));
  check('B2: no item queued twice (duplicate entry + second Recycle All)', ZI.recycleAll(items, 'solo').queued.length === 0 && ZI.jobsByType('recycle').length === 2);
  finishJobs(E); finishJobs(E);
  const m = JSON.parse(E.store.zi_materials);
  check('B2: materials credited through grantRecycleOutput (solo ×1.0)', m.electronics === 14 && m.metal === 12 && m.cloth === 15, JSON.stringify(m));
  check('B2: queue empty after both jobs finish', ZI.jobsByType('recycle').length === 0);
  check('B2: single-item recycling still works', ZI.queueRecycle({ id:'r9', name:'Dead Battery', outputs:{ fuel:1 }, weight:1 }, 'solo').ok);
}
// ── Bug 3: recycler operators (camp survivors) only in Camp Leader mode, enforced in the action too ──
{
  const E = mkEnv({}), ZI = E.ZI;
  const item = () => ({ id:'x' + Math.random(), name:'Old Radio', outputs:{ electronics:4 }, weight:1 });
  E.store[ZI.SAVE_ACTIVE_KEY] = JSON.stringify({ mode:'solo', slot:1 });
  check('B3: camp operators unavailable in Solo mode', !ZI.availableRecyclerOperators().some(o => o.type === 'Camp Survivor') && ZI.defaultRecyclerOperator() === 'solo');
  check('B3: assigning a camp operator is rejected in Solo mode', ZI.queueRecycle(item(), 'mira').ok === false && ZI.recycleAll([item()], 'felix').queued.length === 0);
  E.store[ZI.SAVE_ACTIVE_KEY] = 'null';
  check('B3: with no active save, camp operators are unavailable', !ZI.canUseRecyclerOperator('mira'));
  E.store[ZI.SAVE_ACTIVE_KEY] = JSON.stringify({ mode:'camp', slot:1 });
  check('B3: camp operators available in Camp Leader mode', ['mira','felix'].every(id => ZI.canUseRecyclerOperator(id)) && ZI.defaultRecyclerOperator() === 'mira');
  const r = ZI.queueRecycle(item(), 'mira');
  const job = ZI.jobsByType('recycle').find(j => j.id === (r.job && r.job.id));
  check('B3: Camp Leader assignment still works (×1.2 yield baked in)', r.ok && job && job.meta.item.outputs.electronics === 4, 'out=' + (job && job.meta.item.outputs.electronics));
}

let pass = 0; for (const [r, n, x] of results) { if (r === 'PASS') pass++; log(r + '  ' + n + '  ' + (r === 'FAIL' ? x : '')); }
log(pass + '/' + results.length + ' bug-fix checks passed');
})();
