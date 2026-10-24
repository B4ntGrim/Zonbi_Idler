// H2 acceptance checks (CURRENT_BATCH.md): reproducibility, starts, T1–T3, D6 classification, isolation.
// Run: node tools/sim-harness/h2-tests.js <project root>
'use strict';
const fs = require('fs'), path = require('path');
const h = require('./h2.js');
const root = process.argv[2] || path.join(__dirname, '..', '..'); const src = h.loadSrc(root);
const results = []; const check = (n, ok, x) => results.push([ok ? 'PASS' : 'FAIL', n, x == null ? '' : String(x)]);
const H = h.H, strip = (r) => { const o = Object.assign({}, r); ['lastTickAt', '_simNow', 'awaySummary', '_carryMs'].forEach(k => delete o[k]); return o; };
const agg = (Z) => { const r = Z.getWanderRun(); return { hp: +r.hp.toFixed(3), stress: +Z.getStress().toFixed(3), scroll: +(r.scroll || 0).toFixed(3), carried: (r.carried || []).length, loot: (Z._rj('zi_wander_loot', []) || []).length, resting: !!r.resting, kills: r.kills || 0 }; };
const T = Date.now();

// 1 Reproducible: same seed and configuration twice → identical records and storage (one run per start, 2 days)
for (const start of h.CFG.starts) { const a = h.runOne(src, { start, policy: 'ethical', seed: 101, days: 2 }), b = h.runOne(src, { start, policy: 'ethical', seed: 101, days: 2 });
  check('1: reproducible — ' + start + ' (record ' + a.recordHash + ', storage ' + a.storeHash + ')', a.recordHash === b.recordHash && a.storeHash === b.storeHash); }

// 3/4 Starts are what they claim; no silent grants (3 days, every start)
const d3 = {}; for (const start of h.CFG.starts) d3[start] = h.runOne(src, { start, policy: 'ethical', seed: 101, days: 3, keepStore: true });
{ const a = d3.A; check('3: A starts and stays without the kit and off the Jester path', a.checks.startOk === true && a.checks.startsClaim === true && !a.jester, JSON.stringify(a.end.kit)); }
for (const w of ['bat', 'iron_knuckles', 'pocket_knife']) { const b = d3['B-' + w];
  check('3: B-' + w + ' — eligible, no kit at start; first Downing → camp, wait, one meeting, chosen weapon equipped, kit once', b.checks.startOk === true && b.checks.startsClaim === true && b.events.jesterDisplacement === 1 && b.jester.weaponEquipped === w && b.jester.result.ok,
    'meet day ' + (b.jester && b.jester.meetDay) + ', wait ' + (b.jester && (b.jester.waitMs / H).toFixed(2)) + ' h'); }
{ const a = d3.A.startState.kit, b = d3['B-bat'].startState.kit; check('4: no silent grants — A and B start with identical (empty) kits; B differs only by the JD1a rewards after the meeting', JSON.stringify(a) === JSON.stringify(b) && Object.values(a).every(n => n === 0)
  && JSON.stringify(d3['B-bat'].jester.kitAfter) === JSON.stringify({ handmade_pouch: 1, scout_kit: 1, medkit: 0, fort_medkit: 1, old_padded_jacket: 1 }), JSON.stringify(d3['B-bat'].jester.kitAfter)); }

// From a day-1 state (A, ethical, seed 101)
const base = h.runOne(src, { start: 'A', policy: 'ethical', seed: 101, days: 1, keepStore: true });
const envFrom = (rec, key) => { const store = JSON.parse(JSON.stringify(rec._store)), clk = { t: rec._t }; const Z = h.pageLoad(src, store, clk, 101, key); Z.WANDER_SIM_TABLE.maxStepsPerCall = 1e9; return { Z, store, clk }; };

// 5 T1 chunk equivalence at advance(): one call vs 1 h chunks vs 1 s chunks over 3 h, unwatched
{ const runs = [[10800], [3600, 3600, 3600], Array(10800).fill(1)].map((chunks, i) => { const { Z, store, clk } = envFrom(base, 't1');
    const s = Z.getWanderRun(); s._simNow = clk.t; const rng = Z.seededRng(77), away = Z.WanderSim.emptySummary(), ev = [];
    for (const c of chunks) Z.WanderSim.advance(s, c, away, rng, ev, { watching: false });
    const st = Object.assign({}, store); delete st.zisim_lock; delete st.zi_wander_run; return { run: h.fp(strip(s)), store: h.fp(st), a: agg(Z), s }; });
  check('5: T1 (A) — one call, 1 h chunks and 1 s chunks give identical state and storage', runs.every(r => r.run === runs[0].run && r.store === runs[0].store), runs.map(r => r.run).join(' / ')); }

// 5 T2 cap: away 72 h vs 24 h through WanderEngine.tick
{ const one = (hours) => { const { Z, clk } = envFrom(base, 't2'); const s0 = (Z.getWanderRun().awaySummary || {}).secs || 0; clk.t += hours * H; Z.WanderEngine.tick(clk.t); const r = Z.getWanderRun(); return { Z, r, secs: ((r.awaySummary || {}).secs || 0) - s0, carry: r._carryMs || 0, a: agg(Z) }; };
  const a = one(72), b = one(24);
  check('5: T2 (A) — 72 h away processes ≤ 24 h, the same as 24 h away', a.secs <= 86400 + 1e-6 && a.carry === 0 && h.fp(strip(a.r)) === h.fp(strip(b.r)), 'processed ' + (a.secs / 3600).toFixed(2) + ' h vs ' + (b.secs / 3600).toFixed(2) + ' h'); }

// 5 T3 watched vs offline (H2-c: A and B-bat, 1 seed; 1 h and 24 h). Exact where equivalent, otherwise aggregates.
const t3 = [];
for (const [label, rec] of [['A', base], ['B-bat', h.runOne(src, { start: 'B-bat', policy: 'ethical', seed: 101, days: 1, keepStore: true })]]) for (const hours of [1, 24]) {
  const off = envFrom(rec, 't3'); off.clk.t += hours * H; off.Z.WanderEngine.tick(off.clk.t);
  const on = envFrom(rec, 't3'); on.Z.retreatWatching = () => true; on.Z.wanderMounted = true; for (let i = 0; i < hours * 3600; i++) { on.clk.t += 1000; on.Z.WanderEngine.liveStep(on.clk.t); }
  const exact = h.fp(strip(off.Z.getWanderRun())) === h.fp(strip(on.Z.getWanderRun()));
  t3.push({ start: label, hours, exact, offline: agg(off.Z), watched: agg(on.Z) }); }
check('5: T3 (A, B-bat; 1 h and 24 h) — reported (exact where equivalent, otherwise aggregates)', t3.length === 4, t3.map(x => `${x.start} ${x.hours}h ${x.exact ? 'EXACT' : 'differs'}`).join('; '));

// 6 Classification: planted states
{ const r = (o) => Object.assign({ hp: 50 }, o);
  check('6: planted run with no timer (paused) → S3 FAIL', h.classifyState(r({ paused: true }), null, 'A').some(c => c.cls === 'FAIL' && c.code === 'S3'));
  check('6: planted prompt with no timer → S3 FAIL', h.classifyState(r({ prompt: { expiresInMs: Infinity } }), null, 'A').some(c => c.code === 'S3' && c.cls === 'FAIL'));
  check('6: planted rest beyond its worst case → S5 FAIL; a worst-case rest is not', (h.classifyRest(h.RESTWORST_MS + 1) || {}).code === 'S5' && h.classifyRest(h.RESTWORST_MS) === null);
  check('6: the Jester wait in B is INFO; in A it is S3 FAIL', h.classifyState(r({ jesterWait: true }), { phase: 'waiting' }, 'B-bat').every(c => c.cls === 'INFO') && h.classifyState(r({ jesterWait: true }), { phase: 'waiting' }, 'A').some(c => c.cls === 'FAIL')); }

// 7 Isolation: the switch stays off in the game files; no save key carries it
{ const active = fs.readFileSync(path.join(root, 'game/active.js'), 'utf8'); const keys = Object.entries(d3['B-bat']._store).filter(([k, v]) => /firstMeetingOn/.test(v)).map(([k]) => k);
  check('7: game/active.js still ships firstMeetingOn: false; no saved key mentions the switch', /firstMeetingOn: false,/.test(active) && !/H2 harness/.test(active) && keys.length === 0, keys.join(',')); }

let pass = 0; results.forEach(([r, n, x]) => { if (r === 'PASS') pass++; console.log(r + '  ' + n + (x ? '  ' + x : '')); });
console.log(pass + '/' + results.length + ' H2 checks passed (' + ((Date.now() - T) / 1000).toFixed(1) + ' s)');
fs.mkdirSync(path.join(root, 'reports', 'sim-harness-v1'), { recursive: true });
fs.writeFileSync(path.join(root, 'reports', 'sim-harness-v1', 't3.json'), JSON.stringify(t3, null, 1));
