// Regression tests for load-time initialization (runs the game/ modules in a browser-like sandbox:
// frozen time, seeded Math.random, no ZI_MATERIALS until game/economy.js creates it).
// Usage (run_script): const T = await readFile('tests/load-regressions.test.js'); await (new Function('readFile','log', T))(readFile, log);
return (async () => {
const ORDER = ['core','world','save','stats','items','crafting','combat','factions','camp','jobs','economy','wandering','fort','active','routes','survival-data','bootstrap'];
const split = (await Promise.all(ORDER.map(m => readFile('game/' + m + '.js')))).join('\n');
const T0 = 1790000000000;
const results = []; const check = (n, c, x) => results.push([c ? 'PASS' : 'FAIL', n, x || '']);
const mkEnv = (seedStore) => {
  const store = Object.assign({}, seedStore || {});
  const ls = { getItem:k => (k in store ? store[k] : null), setItem:(k,v)=>{store[k]=String(v);}, removeItem:k=>{delete store[k];}, key:i=>Object.keys(store)[i], get length(){return Object.keys(store).length;} };
  let seed = 12345; const M = Object.create(Math); M.random = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  class D extends Date { constructor(...a) { if (a.length) super(...a); else super(T0); } static now() { return T0; } }
  const fw = { localStorage: ls, sessionStorage: ls, console, Date: D, Math: M, JSON, setInterval:()=>0, clearInterval:()=>{}, setTimeout:()=>0, clearTimeout:()=>{},
    document:{ hidden:false, addEventListener(){}, querySelectorAll:()=>[] }, addEventListener(){}, location:{ reload(){} } };
  fw.window = fw;
  new Function('fw', 'with(fw){' + split + '}')(fw);
  return { fw, ZI: fw.ZI, store };
};
// Build a returning-player save whose queued jobs all finished an hour ago.
const savedWithDueJobs = (jobsFn) => {
  const E = mkEnv({ zi_world_seed:'777', zi_materials: JSON.stringify({ metal:120, wood:90, cloth:40, electronics:30, fuel:20, medical:15 }) });
  jobsFn(E.ZI);
  const js = JSON.parse(E.store.zi_jobs); js.jobs.forEach(j => { j.status = 'active'; j.startedAt = T0 - 3600000; }); E.store.zi_jobs = JSON.stringify(js);
  return Object.assign({}, E.store);
};

// ── Change 2: a craft job that finished while away credits its RMAT during the load-time catch-up ──
{
  let rec = null;
  const saved = savedWithDueJobs(ZI => {
    rec = ZI.CRAFT_RECIPES.find(r => (r.kind || 'rmat') === 'rmat' && r.out.some(o => /rmat/i.test(o.n)));
    ZI.enqueueJob('craft', rec.id, 30, {}, 1);
  });
  const before = JSON.parse(saved.zi_rmat || '{}');
  const E = mkEnv(saved);
  const key = 'T' + Math.max(0, Math.min(5, rec.tier));
  const want = rec.out.filter(o => /rmat/i.test(o.n)).reduce((a, o) => a + (o.q || 1), 0);
  const after = E.ZI.getRmatHoldings();
  check('A: due craft job removed from the queue at load', !(JSON.parse(E.store.zi_jobs).jobs || []).some(j => j.refId === rec.id));
  check('A: its RMAT is credited at load (' + key + ' +' + want + ')', (after[key] || 0) - (before[key] || 0) === want, 'before=' + (before[key] || 0) + ' after=' + (after[key] || 0));
  const E2 = mkEnv(Object.assign({}, E.store)); // reload: no second credit
  check('A: no double credit on the next reload', (E2.ZI.getRmatHoldings()[key] || 0) === (after[key] || 0));
}

// ── Change 3: a recycle job that finished while away is granted at load, and does not hold up jobs behind it ──
{
  let gear = null;
  const item = { id:'w_reg', name:'Old Radio', outputs:{ electronics:3, metal:2 }, weight:1 };
  const saved = savedWithDueJobs(ZI => {
    gear = ZI.CRAFT_RECIPES.find(r => r.kind === 'gear');
    ZI.enqueueJob('recycle', 'rec_reg', 30, { item }, 1);
    ZI.enqueueJob('craft', gear.id, 30, {}, 1);
  });
  // Make the craft finish AFTER the recycle, so the old "wait for next tick" would also have held it.
  const js = JSON.parse(saved.zi_jobs); js.jobs.forEach(j => { if (j.type === 'craft') j.startedAt = T0 - 1800000; }); saved.zi_jobs = JSON.stringify(js);
  const mat0 = JSON.parse(saved.zi_materials);
  const E = mkEnv(saved);
  const left = JSON.parse(E.store.zi_jobs).jobs || [];
  const mat1 = JSON.parse(E.store.zi_materials);
  check('B: due recycle job removed from the queue at load', !left.some(j => j.type === 'recycle'), 'left=' + left.map(j => j.type).join(','));
  check('B: recycle output credited at load (electronics +3, metal +2)', mat1.electronics - mat0.electronics === 3 && mat1.metal - mat0.metal === 2, JSON.stringify(mat0) + ' → ' + JSON.stringify(mat1));
  check('B: the craft job behind it also completed at load', !left.some(j => j.type === 'craft') && E.ZI.getStash().includes(gear.grantsGear));
  check('B: live ZI_MATERIALS matches what was saved', E.fw.ZI_MATERIALS.electronics.current === mat1.electronics && E.fw.ZI_MATERIALS.metal.current === mat1.metal);
  const E2 = mkEnv(Object.assign({}, E.store));
  const mat2 = JSON.parse(E2.store.zi_materials);
  check('B: no double credit on the next reload', mat2.electronics === mat1.electronics && mat2.metal === mat1.metal);
}

// ── Decision (Oct 2): recycling completed while away is treated like crafting completed while away ──
// Materials granted, normal Mechanical XP awarded, job removed — but the offline XP is NOT active skill use,
// so it must not reset Mechanical's decay/rust clock during the same catch-up.
{
  const OLD = T0 - 2 * 86400000;                       // last real Mechanical use: 2 days ago (inside grace, so no decay loss)
  const item = { id:'w_off', name:'Dead Battery', outputs:{ electronics:2, fuel:1 }, weight:1 };
  const saved = savedWithDueJobs(ZI => { ZI.enqueueJob('recycle', 'rec_off', 30, { item }, 1); });
  saved.zi_skill_decay = JSON.stringify({ mechanical: { lastActiveUtc: OLD, floorXp: 0, floorProgress: {}, lastSettle: T0 } });
  saved.zi_stat_xp = JSON.stringify({ mechanical: 100 });
  const E = mkEnv(saved);
  const xp = JSON.parse(E.store.zi_stat_xp || '{}').mechanical || 0;
  const want = Math.round(E.ZI.ACTION_XP.recycle.base * E.ZI.ACTION_XP.recycle.split.mechanical);
  const mats = JSON.parse(E.store.zi_materials);
  const dec = (JSON.parse(E.store.zi_skill_decay || '{}').mechanical || {});
  check('Away-recycle: materials granted at load', mats.electronics === 32 && mats.fuel === 21, JSON.stringify(mats));
  check('Away-recycle: job removed from the queue', !(JSON.parse(E.store.zi_jobs).jobs || []).some(j => j.type === 'recycle'));
  check('Away-recycle: normal Mechanical XP awarded (+' + want + ')', xp - 100 === want, 'xp=' + xp);
  check('Away-recycle: Mechanical rust clock NOT reset by the offline XP', dec.lastActiveUtc === OLD, 'lastActiveUtc=' + dec.lastActiveUtc + ' expected ' + OLD);
  // Same rule as crafting: a craft finished while away also leaves the clock alone.
  let craft = null;
  const saved2 = savedWithDueJobs(ZI => { craft = ZI.CRAFT_RECIPES.find(r => r.kind === 'gear' && ZI.ACTION_XP['craft.smith'].split.mechanical); ZI.enqueueJob('craft', craft.id, 30, {}, 1); });
  saved2.zi_skill_decay = saved.zi_skill_decay;
  const E2 = mkEnv(saved2);
  check('Parity: a craft finished while away also leaves the Mechanical clock alone', ((JSON.parse(E2.store.zi_skill_decay || '{}').mechanical || {}).lastActiveUtc) === OLD);
  // Control: the same grant made live (after load) DOES count as active use, so the check above is not vacuous.
  E.ZI.grantRecycleOutput(Object.assign({}, item, { id:'w_live' }));
  check('Control: a live recycle grant does reset the Mechanical clock', E.ZI.skillDecayState('mechanical').lastActiveUtc === T0);
}

let pass = 0; for (const [r, n, x] of results) { if (r === 'PASS') pass++; log(r + '  ' + n + '  ' + (r === 'FAIL' ? x : '')); }
log(pass + '/' + results.length + ' load-regression checks passed');
})();
