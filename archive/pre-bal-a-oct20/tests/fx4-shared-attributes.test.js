// Batch FX4: shared survivor attributes — the 10 acceptance checks (reference/fx4-shared-survivor-attributes-slice.md §7; CURRENT_BATCH.md).
// Q5: moveSpeed and healPct come from shared rules (ZI.SurvivorRules); the screen reads them and never writes them.
// D-FX4a: pace is a saved player setting. D-FX4b: speed buffs live in the shared buff store and follow FX3's timing.
// Probe: every Wandering encounter step records the simulated time and the speed the simulation used at that step.
return (async () => {
const ORDER = ['core','world','save','stats','items','crafting','combat','factions','camp','jobs','economy','wandering','fort','active','routes','survival-data','bootstrap'];
const src = (await readFile('bestiary-data.js')) + '\n' + (await Promise.all(ORDER.map(m => readFile('game/' + m + '.js')))).join('\n');
const screen = await readFile('screens-v3.jsx');
const results = []; const check = (n, c, x) => results.push([c ? 'PASS' : 'FAIL', n, x === undefined ? '' : String(x)]);
const S = 1000, M = 60000, H = 3600000, T0 = 1790500000000;
const close = (a, b) => Math.abs(a - b) < 1e-9;
const mkEnv = (store0) => {
  const store = Object.assign({ zi_world_seed:'12345', zi_trav_start: JSON.stringify({ gx:0, gy:0 }), zi_trav_pos: JSON.stringify({ gx:0, gy:0, name:'Home', biome:'suburbia', difficulty:1 }) }, store0 || {});
  const ls = { getItem:k => (k in store ? store[k] : null), setItem:(k,v)=>{store[k]=String(v);}, removeItem:k=>{delete store[k];}, key:i=>Object.keys(store)[i], get length(){return Object.keys(store).length;} };
  const fw = { localStorage: ls, sessionStorage: ls, console:{ log(){}, warn(){}, error(){} }, Date, Math, JSON, setInterval:()=>0, clearInterval:()=>{}, setTimeout:()=>0, clearTimeout:()=>{},
    document:{ hidden:false, visibilityState:'visible', addEventListener(){}, querySelectorAll:()=>[] }, addEventListener(){}, location:{ reload(){} } }; fw.window = fw;
  new Function('fw', 'with(fw){' + src + '}')(fw); const ZI = fw.ZI; ZI.wanderMounted = false; ZI._wj('zi_charges', { heal: 999, scout: 0 });
  return { ZI, store };
};
const run0 = (ZI, o) => Object.assign(ZI.defaultWanderRun(), { active:true, hp:100, moveSpeed:3, scroll:400, scrollUm:400e6, lastCheckpoint:250, checkpoints:[250] }, o || {});
const rig = (opt) => { opt = opt || {}; const E = mkEnv(opt.store), Z = E.ZI; const c = { t: opt.t0 || T0 }; Z.installClock(() => c.t);
  Z.WanderEngine.rng = Z.seededRng(opt.seed || 7); Z.WanderEngine._lead = () => true; if (opt.maxSteps) Z.WANDER_SIM_TABLE.maxStepsPerCall = opt.maxSteps;
  if (opt.gear) { const lo = Z.getLoadout(); Object.assign(lo, opt.gear); Z.saveLoadout(lo); }
  const probes = []; const step = Z.WanderSim.step.bind(Z.WanderSim);
  Z.WanderSim.step = function (state, rng) { probes.push({ t: state._simNow, sp: state.moveSpeed }); return step(state, rng); };
  Z.saveWanderRun(run0(Z, Object.assign({ lastTickAt: c.t }, opt.run || {})));
  const tick = (t, live) => { c.t = t; return live ? Z.WanderEngine.liveStep(t) : Z.WanderEngine.tick(t); };
  const at = (t, fn) => { const k = c.t; c.t = t; fn(); c.t = k; };
  return { Z, E, c, probes, tick, at, run: () => Z.getWanderRun() }; };
const drain = (r) => { let n = 0; while ((r.run()._carryMs || 0) > 0 && n < 50000) { r.tick(r.c.t + S); n++; } return n; };
const core = (s) => JSON.stringify({ scrollUm: s.scrollUm, hp: s.hp, kills: s.kills, simNow: s._simNow, sp: s.moveSpeed, carried: (s.carried || []).length });

// 1 — G2 criterion: the same save, never watched (bulk and 1-s offline ticks) and watched (1-s live beats), gives the same speed at every step and the same run
{ const setup = { run: { moveMode: 'run' }, gear: { primary: 'rifle' } };
  const play = (mode) => { const r = rig(setup); r.at(T0 + 2 * M, () => r.Z.addBuff({ speedPct: 30, durationSec: 45 }));
    if (mode === 'bulk') { r.tick(T0 + 10 * M); drain(r); } else for (let t = T0 + S; t <= T0 + 10 * M; t += S) r.tick(t, mode === 'watched');
    return { core: core(r.run()), sig: r.probes.map(p => (p.t - T0) + ':' + p.sp.toFixed(6)).join(','), n: r.probes.length }; };
  const a = play('bulk'), b = play('sec'), w = play('watched');
  check('1: never watched (bulk, 1-s ticks) and watched (1-s live beats) give the same speed at every step and the same end state (Run pace, slowing gear, a speed buff)',
    a.n > 0 && a.sig === b.sig && a.sig === w.sig && a.core === b.core && a.core === w.core, a.n + ' steps; ' + [a.core === b.core, a.core === w.core].join('/')); }

// 2 — new save, no gear, Walk: speed 3
{ const r = rig({ run: { moveSpeed: undefined } }); const fresh = r.Z.defaultWanderRun(); r.tick(T0 + 20 * M); drain(r);
  check('2: a new save with no gear on Walk moves at 3 m/s (rule and every simulated step)',
    !fresh.moveMode && r.Z.SurvivorRules.moveSpeed(fresh) === 3 && r.probes.length > 0 && r.probes.every(p => p.sp === 3), r.probes.length + ' steps'); }

// 3 — equipment change while unwatched: the next step follows
{ const r = rig(); r.tick(T0 + M); const n0 = r.probes.length; // short phases: a fresh run fights in its first minutes
  const lo = r.Z.getLoadout(); lo.melee = 'combat_axe'; r.Z.saveLoadout(lo); r.tick(T0 + 2 * M); const n1 = r.probes.length, mid = r.run().moveSpeed;
  lo.melee = null; r.Z.saveLoadout(lo); r.tick(T0 + 3 * M); const end = r.run().moveSpeed; // the step copy, refreshed every step even when no fight happens
  const axe = 3 * (100 + r.Z.getGearItem('combat_axe').speedDelta) / 100;
  check('3: slowing gear put on while unwatched applies from the next step (3 → ' + axe + ' m/s), and taking it off restores 3',
    r.probes.slice(0, n0).every(p => p.sp === 3) && r.probes.slice(n0, n1).every(p => close(p.sp, axe)) && r.probes.slice(n1).every(p => p.sp === 3) && n1 > n0 && close(mid, axe) && end === 3, [n0, n1, r.probes.length, mid, end].join('/')); }

// 4 — Athletics level change: Jog and Run follow; Walk stays 3 × gear
{ const r = rig({ run: { moveMode: 'jog' } }); const R = r.Z.SurvivorRules; const c0 = R.conditioning();
  const jog0 = R.moveSpeed({ moveMode: 'jog' }); r.tick(T0 + 5 * M); const n0 = r.probes.length;
  r.Z.awardXp('athletics', 2e6); const c1 = R.conditioning(); r.tick(T0 + 10 * M);
  const jog1 = R.moveSpeed({ moveMode: 'jog' }), run1 = R.moveSpeed({ moveMode: 'run' }), walk1 = R.moveSpeed({ moveMode: 'walk' });
  check('4: raising Athletics while unwatched speeds up Jog (and Run) from the next step; Walk stays 3',
    c1 > c0 && close(jog0, 3 + 0.6 * c0) && close(jog1, 3 + 0.6 * c1) && close(run1, 3 + 1.3 * c1) && walk1 === 3 && r.probes.slice(0, n0).every(p => close(p.sp, jog0)) && r.probes.slice(n0).every(p => close(p.sp, jog1)) && r.probes.length > n0,
    'conditioning ' + c0 + ' → ' + c1 + '; jog ' + jog0.toFixed(2) + ' → ' + jog1.toFixed(2)); }

// 5 — speed buff used, then the player leaves: raised for exactly its duration, then drops; distance matches exactly
{ const r = rig(); r.Z.addBuff({ speedPct: 30, durationSec: 45 }); const s0 = r.run().scrollUm; r.tick(T0 + 2 * H); drain(r);
  const inWin = r.probes.filter(p => p.t >= T0 && p.t < T0 + 45 * S), after = r.probes.filter(p => p.t >= T0 + 45 * S);
  // distance over the first 60 simulated seconds, measured in a twin run stopped at 60 s
  const q = rig(); q.Z.addBuff({ speedPct: 30, durationSec: 45 }); q.tick(T0 + 60 * S); drain(q); const d = (q.run().scrollUm - s0) / 1e6;
  check('5: a 45-s +30% speed buff used before leaving raises speed for exactly 45 simulated seconds, then drops (distance in the first minute: 45 s × 3.9 + 15 s × 3 = 220.5 m)',
    inWin.length > 0 && inWin.every(p => close(p.sp, 3.9)) && after.length > 0 && after.every(p => p.sp === 3) && close(d, 220.5), 'first minute ' + d + ' m'); }

// 6 — pace saved: set Run, save → reload; offline uses Run; the screen opens on the saved pace
{ const r = rig(); r.Z.syncWanderState({ moveMode: 'run' }); const snap = r.Z._snapshot();
  const r2 = rig(); r2.Z._restore(snap); r2.Z.installClock(() => r2.c.t); const runSp = r2.Z.SurvivorRules.moveSpeed({ moveMode: 'run' });
  r2.tick(T0 + 10 * M); drain(r2);
  const opensOnSaved = screen.includes("const [moveMode, setMoveMode] = React.useState(() => (window.ZI.getWanderRun && window.ZI.getWanderRun().moveMode) || 'walk');");
  const savesChoice = /syncWanderState\(\{\s*moveMode\s*\}\)/.test(screen);
  check('6: the chosen pace survives a save → reload; offline runs at Run speed; the screen opens on the saved pace and saves each change',
    r2.run().moveMode === 'run' && r2.probes.length > 0 && r2.probes.every(p => close(p.sp, runSp)) && opensOnSaved && savesChoice, [r2.run().moveMode, runSp.toFixed(2), opensOnSaved, savesChoice].join('/')); }

// 7 — the overload slowdown still applies on top
{ const dist = (mult) => { const r = rig(); r.Z.overloadSpeedMult = () => mult; const s0 = r.run().scrollUm; r.tick(T0 + 5 * S); return (r.run().scrollUm - s0) / 1e6; };
  const full = dist(1), half = dist(0.5);
  check('7: the overload slowdown multiplies the rule\'s speed as before (5 s at ×1 vs ×0.5)', close(full, 15) && close(half, 7.5), full + ' m / ' + half + ' m'); }

// 8 — heals unchanged; the rule equals what heals use
{ const { ZI: Z } = mkEnv(); const pct = Z.SurvivorRules.healPct(); const expect = Math.round(Z.WANDER_REST_TABLE.maxHp * Z.STAT_FORMULAS.firstAidHealPercent(Z.effectiveLevel('firstAid')) / 100);
  const st = { hp: 40 }; Z.wanderHeal(st, Z.seededRng(1));
  check('8: heal strength rule = First Aid rule with rust; a heal restores exactly that much (unchanged)', pct === Z.STAT_FORMULAS.firstAidHealPercent(Z.effectiveLevel('firstAid')) && st.hp === 40 + expect, pct + '% → +' + (st.hp - 40)); }

// 9 — old saves: stored moveSpeed/healPct, no moveMode → load with no migration; pace reads as Walk
{ const old = run0(mkEnv().ZI, { moveSpeed: 10.8, healPct: 30, lastTickAt: T0 }); delete old.moveMode;
  const r = rig(); r.Z.saveWanderRun(old); const v0 = r.Z.getSaveVersion ? r.Z.getSaveVersion() : null;
  r.tick(T0 + 10 * M); drain(r); const s = r.run();
  check('9: an old save with a stored speed of 10.8 and no saved pace loads unchanged and walks at the rule\'s 3 m/s; save version unchanged',
    !s.moveMode && r.probes.length > 0 && r.probes.every(p => p.sp === 3) && (r.Z.getSaveVersion ? r.Z.getSaveVersion() === v0 : true), r.probes.length + ' steps'); }

// 10 — static: the screen never writes moveSpeed or healPct into the run
{ const calls = []; const re = /syncWanderState\s*\(\s*\{([\s\S]*?)\}\s*\)/g; let m; while ((m = re.exec(screen))) calls.push(m[1]);
  const bad = calls.filter(c => /\bmoveSpeed\b|\bhealPct\b/.test(c));
  const otherWrites = /\.moveSpeed\s*=(?!=)|\.healPct\s*=(?!=)|wanderAct\([^)]*moveSpeed/.test(screen);
  check('10: no screen code writes moveSpeed or healPct into the run (' + calls.length + ' syncWanderState calls checked)', calls.length > 0 && bad.length === 0 && !otherWrites, bad.join(' | ')); }

return results;
})();
