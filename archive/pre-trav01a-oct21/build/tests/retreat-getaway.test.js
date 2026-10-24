// Getaway: Retreat always pressable in the field; Stealth/Athletics roll → +30 evasion until the checkpoint; Runners/watchers counter.
return (async () => {
const ORDER = ['core','world','save','stats','items','crafting','combat','factions','camp','jobs','economy','wandering','fort','active','routes','survival-data','bootstrap'];
const src = (await Promise.all(ORDER.map(m => readFile('game/' + m + '.js')))).join('\n');
const results = []; const check = (n, c, x) => results.push([c ? 'PASS' : 'FAIL', n, x === undefined ? '' : String(x)]);
const HOME = { gx:0, gy:0, name:'Home', biome:'suburbia', difficulty:1 }, FARPOS = { gx:6, gy:5, name:'Far', biome:'suburbia', difficulty:1 };
const mkEnv = (seed, opt) => {
  opt = opt || {};
  const store = opt.store || Object.assign({ zi_materials: JSON.stringify({ metal:200 }), zi_world_seed:'12345', zi_trav_start: JSON.stringify({ gx:0, gy:0 }), zi_trav_pos: JSON.stringify(opt.far ? FARPOS : HOME) }, seed || {});
  const ls = { getItem:k => (k in store ? store[k] : null), setItem:(k,v)=>{store[k]=String(v);}, removeItem:k=>{delete store[k];}, key:i=>Object.keys(store)[i], get length(){return Object.keys(store).length;} };
  const doc = { hidden:false, visibilityState:'visible', addEventListener(){}, querySelectorAll:()=>[] };
  const fw = { localStorage: ls, sessionStorage: ls, console, Date, Math, JSON, setInterval:()=>0, clearInterval:()=>{}, setTimeout:()=>0, clearTimeout:()=>{}, document: doc, addEventListener(){}, location:{ reload(){} } }; fw.window = fw;
  new Function('fw', 'with(fw){' + src + '}')(fw); fw.ZI.wanderMounted = false;
  if (opt.heals != null) fw.ZI._wj('zi_charges', { heal: opt.heals, scout: 0 });
  return { ZI: fw.ZI, store, doc };
};
const run0 = (ZI, o) => Object.assign(ZI.defaultWanderRun(), { active:true, hp:100, moveSpeed:3, scroll:400, scrollUm:400e6, lastCheckpoint:250, checkpoints:[250] }, o || {});
const W = { watching:true };
// Advance sec seconds in steps (number or cycled array); flush any step-capped remainder.
const adv = (ZI, st, sec, rng, away, step, opts) => { const ev = []; let t = 0, k = 0; while (t < sec - 1e-9) { const sz = Array.isArray(step) ? step[k++ % step.length] : (step || sec); const d = Math.min(sz, sec - t); ZI.WanderSim.advance(st, d, away, rng, ev, opts); t += d; } let g = 0; while (st._carryMs > 0 && g++ < 5000) ZI.WanderSim.advance(st, 0, away, rng, ev, opts); return ev; };
const tick = (ZI, st, opts, ev) => { ev = ev || []; ZI.WanderSim.advance(st, 0.001, ZI.WanderSim.emptySummary(), ZI.seededRng(1), ev, opts); return ev; };
const capG = (ZI, st) => { const c = st.carried; st.carried = []; const L = ZI.loadFor(st); st.carried = c; return { base: Math.round(L.kg * 1000), cap: Math.round(L.cap * 1000) }; };
const setLoad = (ZI, st, pct, delta) => { const g = capG(ZI, st), tgt = Math.ceil(g.cap * pct / 100) + (delta || 0); st.carried = [{ name:'ballast', value:1, weight:(tgt - g.base) / 1000, seq:0 }]; st.pickupSeq = 1; };
const loadPct = (ZI, st) => { const L = ZI.loadFor(st); return Math.round(L.kg * 1000) * 100 / Math.round(L.cap * 1000); };
const rulesNow = (ZI, st) => ZI.retreatRulesTrue(st).map(c => c.rule).join(',');
const kinds = (ev, k) => ev.filter(e => e.kind === k);
const U = (ZI) => ZI.STRESS_UNITS;


const always = (n) => () => n;
// 1 — Retreat available while withdrawing; one roll per withdrawal; blocked only while resting
{ const { ZI } = mkEnv(null, { far:true, heals:5 }); const st = run0(ZI);
  const a = ZI.wanderRetreatPress(st, always(0)); const b = ZI.wanderRetreatPress(st, always(0));
  const st2 = run0(ZI); ZI.wanderWithdraw(st2); const c = ZI.wanderRetreatPress(st2, always(0.99)); const d = ZI.wanderRetreatPress(st2, always(0));
  const st3 = Object.assign(run0(ZI), { resting:true }); const e = ZI.wanderRetreatPress(st3, always(0));
  check('G1: Retreat starts a withdrawal with a getaway roll; pressing while withdrawing rolls once if not yet rolled; resting blocks', a.ok && st.withdrawing && a.evade && a.evade.ok && st.retreatEvade === 30 && !b.ok && c.ok && c.evade.ok === false && st2.retreatEvade === 0 && !d.ok && !e.ok, JSON.stringify([a.text, b.reason, c.text, d.reason, e.reason])); }
// 2 — chance from Stealth/Athletics, clamped
{ const { ZI } = mkEnv(); const E = ZI.RETREAT_EVADE; const ch = ZI.retreatEvadeChance(run0(ZI));
  check('G2: getaway chance = 25 + Stealth×1.4 + Athletics×0.8, clamped 10–90', ch >= E.min && ch <= E.max && ch === Math.max(10, Math.min(90, 25 + Math.round((ZI.effectiveLevel('stealth') || 0) * 1.4) + Math.round((ZI.effectiveLevel('athletics') || 0) * 0.8))), ch); }
// 3 — buff raises evasion except against Runner base and Awareness/Stealth-reveal zombies
{ const { ZI } = mkEnv(); const bsrc = await readFile('bestiary-data.js'); const B = new Function('ZI', 'window', bsrc + '; return ZI.BESTIARY;')({}, {}); const counters = B.filter(z => ZI.retreatEvadeCounters(z)).map(z => z.name).sort().join(',');
  check('G3: counters are exactly the four Runner-base zombies plus Sneak Assassin and Path-Laden Watcher', counters === ['Sidestepper','Blood Frenzy Berserker','Accelerated Dasher','Signal Imp Alpha','Sneak Assassin','Path-Laden Watcher'].sort().join(','), counters);
  const st = Object.assign(run0(ZI), { withdrawing:true, retreatEvade:30 });
  const shamb = ZI.WanderSim.resolveEncounter(st, { z: { name:'Test', hp:25, atk:8, xp:10, seesThrough:false } }, ZI.seededRng(1));
  const st2 = Object.assign(run0(ZI), { withdrawing:true, retreatEvade:30 });
  const run = ZI.WanderSim.resolveEncounter(st2, { z: { name:'Runner', hp:25, atk:8, xp:10, seesThrough:true } }, ZI.seededRng(1));
  check('G3: buff applies +30 evasion in fights; counter zombies ignore it and say so', shamb.evadeBuff === 30 && !shamb.evadeCountered && run.evadeCountered && !run.evadeBuff); }
// 4 — buff improves outcomes: fewer enemy hits land over many fights
{ const landed = (buff) => { const { ZI } = mkEnv(null, { heals:999 }); let hits = 0, tries = 0; for (let i = 0; i < 300; i++) { const st = Object.assign(run0(ZI), { retreatEvade: buff }); const r = ZI.WanderSim.resolveEncounter(st, { z: { name:'Dummy', hp:60, atk:8, xp:10 } }, ZI.seededRng(100 + i)); (r.hits || []).filter(h => h.by === 'e').forEach(h => { tries++; if (h.r !== 'miss') hits++; }); } return hits / tries; };
  const a = landed(0), b = landed(30);
  check('G4: +30 evasion lowers the enemy hit rate', b < a, a.toFixed(2) + ' → ' + b.toFixed(2)); }
// 5 — lasts until the checkpoint: cleared on arrival, forced retreat and Return to Base; rule withdrawals also roll
{ const { ZI } = mkEnv(null, { far:true, heals:5 }); const st = run0(ZI); ZI.wanderRetreatPress(st, always(0)); const had = st.retreatEvade === 30;
  const rg = ZI.seededRng(5), ev = []; for (let i = 0; i < 120 && !kinds(ev, 'withdrawn').length; i++) ev.push(...adv(ZI, st, 1, rg, null, 1)); const cleared = kinds(ev, 'withdrawn').length === 1 && st.retreatEvade === 0 && !st.retreatEvadeRolled; /* BAL-A (authorized, Oct 19): checked at arrival: the HP-only gate (A5) can resume the patrol within the same window */
  const E2 = mkEnv(null, { far:true, heals:5 }), Z2 = E2.ZI, s2 = run0(Z2); Z2.wanderRetreatPress(s2, always(0)); Z2.forcedRetreat(s2, 'downed', Z2.seededRng(1));
  const E3 = mkEnv(null, { far:true, heals:0 }), Z3 = E3.ZI, s3 = run0(Z3); s3.hp = 20; const ev3 = adv(Z3, s3, 0.001, Z3.seededRng(2), null); /* BAL-A (authorized, Oct 19): the stress rule is off (A5); the HP rule triggers the automatic withdrawal */
  const iw = ev3.findIndex(e => e.kind === 'ruleWithdraw'), ig = ev3.findIndex(e => e.kind === 'retreatEvade');
  check('G5: buff ends at the checkpoint (and on Forced Retreat); automatic rule withdrawals also roll, logged after the withdrawal', had && cleared && s2.retreatEvade === 0 && iw >= 0 && ig > iw && s3.retreatEvadeRolled, JSON.stringify({ had, cleared, fr: s2.retreatEvade, iw, ig })); }
// 6 — single runner: two open copies of one save never both advance it; the watching tab takes over
{ const A = mkEnv(null, { far:true, heals:5 }), B = mkEnv(null, { store: A.store }), now = Date.now();
  A.ZI._session = 'tabA'; B.ZI._session = 'tabB';
  const st = run0(A.ZI, { lastTickAt: now - 1000 }); A.ZI.saveWanderRun(st);
  A.ZI.wanderMounted = false; B.ZI.wanderMounted = false;
  A.ZI.WanderEngine.tick(now); const t1 = A.ZI.getWanderRun().lastTickAt;
  B.ZI.WanderEngine.tick(now + 1000); const t2 = B.ZI.getWanderRun().lastTickAt;
  B.ZI.wanderMounted = true; B.ZI._wanderWatchEl = { isConnected:true, closest:() => null, getClientRects:() => [1] };
  B.ZI.WanderEngine.liveStep(now + 2000); const t3 = B.ZI.getWanderRun().lastTickAt;
  A.ZI.WanderEngine.tick(now + 2500); const t4 = A.ZI.getWanderRun().lastTickAt;
  check('G6: a background copy cannot advance a save another tab is running; the watching tab takes over', t1 === now && t2 === now && t3 === now + 2000 && t4 === now + 2000 && A.ZI.WanderEngine.follower, JSON.stringify([t1 - now, t2 - now, t3 - now, t4 - now])); }
results.forEach(r => log(r[0] + '  ' + r[1] + (r[0] === 'FAIL' ? '  ' + r[2] : '')));
log(results.filter(r => r[0] === 'PASS').length + '/' + results.length + ' getaway checks passed');
return results;
})();
