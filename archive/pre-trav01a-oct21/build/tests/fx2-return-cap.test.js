// Batch FX2: per-return offline cap — the 8 acceptance checks (reference/fx2-per-return-cap-slice.md §7; CURRENT_BATCH.md).
// Q2: one return processes at most 24 h, carried time included · U2: time beyond the cap is discarded · P1: no new saved field.
// Processed time is measured independently: advance() is wrapped and moves _simNow only by consumed time (H1 A1a).
return (async () => {
const ORDER = ['core','world','save','stats','items','crafting','combat','factions','camp','jobs','economy','wandering','fort','active','routes','survival-data','bootstrap'];
const src = (await readFile('bestiary-data.js')) + '\n' + (await Promise.all(ORDER.map(m => readFile('game/' + m + '.js')))).join('\n');
const results = []; const check = (n, c, x) => results.push([c ? 'PASS' : 'FAIL', n, x === undefined ? '' : String(x)]);
const H = 3600000, CAP = 24 * H, T0 = 1790500000000;
const mkEnv = (store0) => {
  const store = Object.assign({ zi_world_seed:'12345', zi_trav_start: JSON.stringify({ gx:0, gy:0 }), zi_trav_pos: JSON.stringify({ gx:0, gy:0, name:'Home', biome:'suburbia', difficulty:1 }) }, store0 || {});
  const ls = { getItem:k => (k in store ? store[k] : null), setItem:(k,v)=>{store[k]=String(v);}, removeItem:k=>{delete store[k];}, key:i=>Object.keys(store)[i], get length(){return Object.keys(store).length;} };
  const fw = { localStorage: ls, sessionStorage: ls, console:{ log(){}, warn(){}, error(){} }, Date, Math, JSON, setInterval:()=>0, clearInterval:()=>{}, setTimeout:()=>0, clearTimeout:()=>{},
    document:{ hidden:false, visibilityState:'visible', addEventListener(){}, querySelectorAll:()=>[] }, addEventListener(){}, location:{ reload(){} } }; fw.window = fw;
  new Function('fw', 'with(fw){' + src + '}')(fw); const ZI = fw.ZI; ZI.wanderMounted = false; ZI._wj('zi_charges', { heal: 999, scout: 0 });
  return { ZI, store };
};
const run0 = (ZI, o) => Object.assign(ZI.defaultWanderRun(), { active:true, hp:100, moveSpeed:3, scroll:400, scrollUm:400e6, lastCheckpoint:250, checkpoints:[250] }, o || {});
// A harness: clock, seeded engine, and a meter of consumed simulated time.
const rig = (opt) => { opt = opt || {}; const E = opt.env || mkEnv(opt.store), Z = E.ZI; const c = { t: opt.t0 || T0 }; Z.installClock(() => c.t);
  Z.WanderEngine.rng = opt.rng || Z.seededRng(opt.seed || 7); Z.WanderEngine._lead = () => true; if (opt.maxSteps) Z.WANDER_SIM_TABLE.maxStepsPerCall = opt.maxSteps;
  const m = { consumed: 0 }; const orig = Z.WanderSim.advance.bind(Z.WanderSim);
  Z.WanderSim.advance = function (state, dt, away, rng, events, o) { const b = state._simNow; const r = orig(state, dt, away, rng, events, o); if (typeof b === 'number') m.consumed += state._simNow - b; return r; };
  if (!opt.env) Z.saveWanderRun(run0(Z, Object.assign({ lastTickAt: c.t }, opt.run || {})));
  const tick = (t) => { c.t = t; return Z.WanderEngine.tick(t); };
  return { Z, E, c, m, tick, run: () => Z.getWanderRun() }; };
const drain = (r, maxTicks) => { let n = 0; while ((r.run()._carryMs || 0) > 0 && n < (maxTicks || 50000)) { r.tick(r.c.t + 1000); n++; } return n; };
const strip = (s) => { const o = Object.assign({}, s); delete o.awaySummary; return JSON.stringify(o, Object.keys(o).sort()); };

// 1 — ordinary 24 h return: exactly 24 h processed, nothing carried
{ const r = rig(); r.tick(T0 + 24 * H); const D = drain(r); const s = r.run();
  check('1: an ordinary 24 h return processes exactly 24 h (plus only the drain ticks\' own seconds), with no carry left', r.m.consumed === CAP + D * 1000 && (s._carryMs || 0) === 0, 'consumed ' + (r.m.consumed / H).toFixed(4) + ' h over ' + D + ' drain ticks'); }
// 2 — 72 h away: exactly 24 h processed; the other 48 h are never processed later
{ const r = rig(); r.tick(T0 + 72 * H); const D = drain(r); const atEnd = r.m.consumed; for (let i = 1; i <= 120; i++) r.tick(r.c.t + 1000);
  check('2: 72 h away → exactly 24 h processed; the other 48 h are discarded (later 1-s ticks add only their own 120 s)', atEnd === CAP + D * 1000 && r.m.consumed === atEnd + 120000 && (r.run()._carryMs || 0) === 0, (atEnd / H).toFixed(4) + ' h over ' + D + ' drain ticks; then +' + (r.m.consumed - atEnd) / 1000 + ' s'); }
// 3 — consecutive absences with a small step cap: the second return processes at most 24 h
{ const r = rig({ maxSteps: 40 }); r.tick(T0 + 24 * H); const carry1 = r.run()._carryMs || 0, c1 = r.m.consumed;
  const T2 = T0 + 34 * H; r.tick(T2); const D = drain(r); const second = r.m.consumed - c1;
  check('3: away 24 h → partly processed → leave → away 10 h: the second return processes ≤ 24 h + its own drain time', carry1 > 0 && second <= CAP + D * 1000 && second > 0, 'first left ' + (carry1 / H).toFixed(2) + ' h; second processed ' + (second / H).toFixed(3) + ' h over ' + D + ' drain ticks'); }
// 4 — interrupted processing: plain drain vs drain with a save → load round-trip mid-way give an identical end state (P2)
{ const play = (roundTrip) => { const r = rig({ maxSteps: 40 }); r.tick(T0 + 72 * H); let n = 0, cur = r;
    while ((cur.run()._carryMs || 0) > 0 && n < 50000) { n++; cur.tick(cur.c.t + 1000);
      if (roundTrip && n === 3) { const snap = cur.Z._snapshot(); const E2 = mkEnv(); E2.ZI._restore(snap); const r2 = rig({ env: E2, t0: cur.c.t, rng: cur.Z.WanderEngine.rng, maxSteps: 40 }); r2.m.consumed = cur.m.consumed; cur = r2; } }
    return { s: strip(cur.run()), n, consumed: cur.m.consumed }; };
  const a = play(false), b = play(true);
  check('4: the same 72 h return drained in 40-step calls ends identically with or without a save → load round-trip mid-catch-up', a.s === b.s && a.n === b.n && a.consumed === b.consumed && a.n > 3, [a.n, b.n, a.s === b.s].join('/')); }
// 5 — a saved run carrying 30 h processes at most 24 h on its next return
{ const r = rig({ run: { _carryMs: 30 * H } }); r.tick(T0 + 1 * H); const s = r.run();
  check('5: a save loaded with _carryMs = 30 h processes at most 24 h on its next return (processed + backlog ≤ 24 h)', r.m.consumed + (s._carryMs || 0) <= CAP && r.m.consumed > 0, 'processed ' + (r.m.consumed / H).toFixed(2) + ' h, backlog ' + ((s._carryMs || 0) / H).toFixed(2) + ' h'); }
// 6 — invariant over 30 days: returns every 8 h, random interruptions; backlog never above 24 h; processed ≤ real elapsed
{ const bad = []; let returns = 0, maxBacklog = 0;
  for (const seed of [61, 62]) { const r = rig({ maxSteps: 40, seed }); const rnd = r.Z.seededRng(seed * 13); let t = T0;
    for (let d = 0; d < 30 * 3; d++) { t += 8 * H; r.tick(t); returns++; const k = Math.floor(rnd() * 6); for (let i = 0; i < k; i++) { t += 1000; r.tick(t); }
      const b = r.run()._carryMs || 0; maxBacklog = Math.max(maxBacklog, b); if (b > CAP) bad.push('backlog ' + b); if (r.m.consumed > t - T0) bad.push('processed > elapsed at return ' + returns); } }
  check('6: 30 days of 8-hourly returns with random interruptions — backlog never above 24 h, processed time never above real elapsed time', bad.length === 0 && returns === 180, bad.slice(0, 3).join('; ') || 'max backlog ' + (maxBacklog / H).toFixed(2) + ' h over ' + returns + ' returns'); }
// 7 — watched play unchanged: 1 h of 1-second beats processes exactly 1 h, no carry, nothing discarded
{ const r = rig(); let ev = 0; for (let i = 1; i <= 3600; i++) ev += r.Z.WanderEngine.liveStep(r.c.t = T0 + i * 1000).length;
  check('7: 1 h of watched 1-second beats processes exactly 3,600 s with no carry', r.m.consumed === H && (r.run()._carryMs || 0) === 0 && ev > 0, 'consumed ' + r.m.consumed / 1000 + ' s, events ' + ev); }
// 8 — old saves: any _carryMs value loads and ticks; FX2 adds no saved field (P1)
{ const outs = [0, 5 * H, 30 * H, null].map(cm => { const run = cm == null ? {} : { _carryMs: cm }; const r = rig({ run }); const before = Object.keys(r.run()); r.tick(T0 + 2 * H); const after = Object.keys(r.run());
    return { ok: isFinite(r.run().hp) && (r.run()._carryMs || 0) <= CAP, added: after.filter(k => !before.includes(k) && /discard/i.test(k)) }; });
  check('8: old saves with _carryMs 0 / 5 h / 30 h / missing load and tick normally; no new saved field (no _discardedMs)', outs.every(o => o.ok && o.added.length === 0), JSON.stringify(outs.map(o => o.added))); }

results.forEach(r => log(r.join('  ')));
return results;
})();
